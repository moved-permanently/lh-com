/* eslint-disable max-len */
/* Standing order 26 (2026-11-15), item 4: /de/en/tips-senior-travellers at 1440. www has one sidebar component per row
   ("Personal contacts", "Seat selection", "Check-in and baggage"...), each with its own bottom spacing: 114px from a
   row's link to the next row's heading, ours 92 (one sidebar block, the block's 66px row gap). From 768px a lufthansa.com
   sidebar block outside campaign sections has 88px between its rows. Census (published copies): the 52 documents with
   such a block of several rows outside the 100-years pages. Gate (working-copy code, 1440): tips-senior-travellers
   21.9 -> 14.5, miles-and-more-credit-card 14.6 -> 12.9, visual-impairment de/en 6.5 -> 5.0, gb/en 6.2 -> 4.7, de/de and
   at/de 6.6 -> 5.9 (lh-snapshots-116), cognitive-impairment and 100-years/global-network the same (all sidebars, campaign
   sections included: global-network 13.6 -> 14.7).
   Run: node --test test/columns-media-sidebar-gap-so26.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/columns-media/columns-media.css', import.meta.url), 'utf8');

test('from 768px: 88px between the rows of a lufthansa.com sidebar block outside campaign sections', () => {
  const sel = 'body.brand-lufthansa main > .section:not(.campaign-section) > .columns-media-wrapper > .columns-media.sidebar';
  const at = css.indexOf(`${sel} {`);
  assert.ok(at > 0, 'the rule');
  const media = css.slice(css.lastIndexOf('@media', at), css.indexOf('{', css.lastIndexOf('@media', at))).trim();
  assert.equal(media, '@media (width >= 768px)');
  assert.match(css.slice(at, css.indexOf('}', at)), /gap: 88px;/);
});

test('as before: the block\'s 66px row gap', () => {
  assert.match(css, /^\.columns-media \{\n {2}display: flex;\n {2}flex-direction: column;\n {2}gap: 66px;\n\}/m);
});
