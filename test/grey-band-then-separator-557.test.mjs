/* eslint-disable max-len */
/* lufthansa.com: a grey band whose next section opens with a separator and then content (brief 557): www's component
   spacing (32 px) under the band, then the separator: 78-80 px of ink from the band's end to the next heading at
   390 and 1440 (/gb/en/baggage, /gb/en/food-and-beverages, /de/de/speisen-und-getraenke, lh-parity-004a). Ours had
   the band's own margin there: 48 px on a plain band (93-96 px), none on a campaign-section band (45-48 px). Such a
   band is 32 px above the next campaign section now, whatever its own margin. Not before a column view
   (/de/de/lounges: its {spacer-25} and column title already 63-64 px under the band as www's; 96 with the 32 px).
   Run: node --max-old-space-size=256 --test test/grey-band-then-separator-557.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('a grey band before a campaign section that opens with a separator and content: 32 px under it', () => {
  const sel = 'body.brand-lufthansa main > .section.grey:has(+ .section.campaign-section > .default-content-wrapper:first-child > p.spacer:first-child + :not(p.spacer))';
  const i = css.indexOf(`${sel} {`);
  assert.ok(i >= 0, 'rule');
  assert.match(css.slice(i, css.indexOf('}', i)), /margin-bottom: 32px;/);
});

test('separators only after a band keep their rule (component spacing plus the separator)', () => {
  assert.ok(css.includes('main > .section.grey + .section > .default-content-wrapper:first-child:not(:has(> :not(p.spacer))) { margin-top: -16px; }'));
});
