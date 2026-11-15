/* eslint-disable max-len */
/* Standing order 29 of 2026-11-15: /ru/en/flights as www's (lh-parity-006 at 1440 and 390; Moscow's
   destinationfinder answer HTTP 500, lufthansa-api-004). Three parts, gated together (each alone made one
   width worse: the tail alone 390 18.62 -> 20.21, the empty state on top uncovered the Hertz section's drift):
   1. below the offers grid (destination-finder.css): the feedback 36 px from the grid on phones, 96 from 768 px;
      the cards 107 px from the feedback; the text 66 px from the cards (ours were 90 / 68 / 23 px at 1440,
      www's 162 / 151 / 65);
   2. www's empty state when the origin has no offers (destination-finder.js destination-finder-no-offers): a
      yellow warning box (#fffedc, a warning triangle, 16 px text on 24 px lines), no month filter, no price
      disclaimer, from 768 px no sort and the box half the cards' column wide;
   3. the last section after the grey band (styles.css): separators then a Columns Media (the Hertz section)
      no longer take the band's gap back (they stood 16 px over the band); www's line 44 / 64 px under the band,
      the picture 45 / 65 px under the line. Census of the published lufthansa.com documents: /ru/en/flights only.
   lufthansa.com only (body.brand-lufthansa).
   Run: node --max-old-space-size=256 --test test/lh-com-flights-tail-so29.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(p, import.meta.url), 'utf8');
const flat = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const df = flat(read('../blocks/destination-finder/destination-finder.css'));
const styles = flat(read('../styles/styles.css'));
const js = read('../blocks/destination-finder/destination-finder.js').replace(/\s+/g, ' ');

const N = 'body.brand-lufthansa .destination-finder.grid.destination-finder-no-offers';
const W = 'body.brand-lufthansa main > .section > .destination-finder-wrapper:has(> .destination-finder.grid)';

test('below the grid: feedback, cards and text as far apart as www\'s', () => {
  assert.ok(df.includes(`${W} + .feedback-wrapper { margin-top: 36px; }`));
  assert.ok(df.includes(`${W} ~ .carousel-cards-wrapper { margin-top: 107px; }`));
  assert.ok(df.includes(`${W} ~ .carousel-cards-wrapper + .default-content-wrapper { margin-top: 66px; }`));
  assert.ok(df.includes(`@media (width >= 768px) { ${W} + .feedback-wrapper { margin-top: 96px; } }`));
});

test('the empty state: the block marked only for lufthansa.com with prices on, the answer in and no offers', () => {
  assert.ok(js.includes("block.classList.toggle('destination-finder-no-offers', !brand && pricesOn && !unavailable && !loaded.offers.length);"));
});

test('the empty state: the warning box as www\'s', () => {
  assert.ok(df.includes(`${N} .destination-finder-message { position: relative; box-sizing: border-box; margin-bottom: 15px; padding: 20px 24px 22px 48px; border-radius: 0; background-color: #fffedc; }`));
  assert.ok(df.includes(`${N} .destination-finder-message::before {`));
  assert.ok(df.includes(`${N} .destination-finder-message-heading { margin: 0 0 12px; font-family: var(--body-font-family); font-size: 16px; line-height: 24px; }`));
  assert.ok(df.includes(`${N} .destination-finder-message p { font-size: 16px; line-height: 24px; }`));
});

test('the empty state: the month filter and the disclaimer hidden; from 768 px the sort, the box half the column wide', () => {
  assert.ok(df.includes(`${N} .destination-finder-filter:has(> .destination-finder-months), ${N} .destination-finder-disclaimer { display: none; }`));
  assert.ok(df.includes(`@media (width >= 768px) { ${N} .destination-finder-toolbar .destination-finder-sort { display: none; } ${N} .destination-finder-message { max-width: 50%; } }`));
});

const LAST = 'body.brand-lufthansa main > .section.grey + .section:last-child';
const ONLY_SEP = ':not(:has(> .default-content-wrapper > :not(p.spacer)))';
const SEC = `${LAST}:has(> .default-content-wrapper + .columns-media-wrapper)${ONLY_SEP}`;
const COL = `${LAST}${ONLY_SEP} > .default-content-wrapper + .columns-media-wrapper`;

test('separators then a Columns Media after the grey band: out of the separators-only rule', () => {
  assert.ok(styles.includes(`${LAST}:not(:has(> .carousel-cards-wrapper), :has(> .default-content-wrapper + .columns-media-wrapper), :has(> .default-content-wrapper > :not(p.spacer))) { margin-top: -48px; margin-bottom: 0; }`));
});

test('separators then a Columns Media after the grey band: www\'s line and picture distances', () => {
  assert.ok(styles.includes(`${SEC} { margin-top: 60px; }`));
  assert.ok(styles.includes(`${COL} { margin-top: 20px; }`));
  assert.ok(styles.includes(`@media (width >= 768px) { ${SEC} { margin-top: 80px; } ${COL} { margin-top: 40px; } }`));
});

test('no :has() nested in another (a browser drops such a rule)', () => {
  assert.ok([SEC, COL, W].every((s) => !/:has\([^()]*:has\(/.test(s)));
});
