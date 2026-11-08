/* eslint-disable max-len -- dev tooling */
/* Brief 510 item 3 (the Brussels h1 on phones): on www.brusselsairlines.com at 390 the breadcrumb's text starts 17 px under
   the 149 px header (166), ours right under our 140 px header with 16 px of the block's own space (156): every page's
   content 10 px higher (the recordings, 74 pages). An h1 that opens a sidebar intro (columns-media sidebar) has 76 px from
   the breadcrumb on www (88 with a two-line h1), ours 56 / 68: 20 more. Together the 30 px of the 21 pages "-30" (17 of
   the 30 sidebar pages). Phones only (at 1440 the h1 is within 4 px on 29 pages). The header stays (not this row).
   Run: node --test test/brussels-phone-h1-510.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('phones: the breadcrumb 10 px lower (its wrapper\'s padding), a sidebar intro with the h1 20 px more above it', () => {
  const phone = css.match(/@media \(width < 768px\) \{ body\.brand-brussels main \.breadcrumb-wrapper \{ padding-top: 10px; \}[^@]*\}/);
  assert.ok(phone, 'the phone rule');
  assert.match(phone[0], /body\.brand-brussels main \.columns-media\.sidebar:has\(h1\) \{ padding-top: 40px; \}/);
});
