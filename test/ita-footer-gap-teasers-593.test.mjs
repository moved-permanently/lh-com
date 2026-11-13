/* eslint-disable max-len */
/* ITA row 44 (standing order 10 of 2026-11-13, item 2: the footer gap by cause). Under a row of teaser cards (the
   "Related" carousel-cards that end 27 of the 39 recorded ITA pages) www's footer starts 32 px under the cards on 19
   of them (56 on 6, 52 / 72 on 2; the recordings' own markup at 1440 and 390), ours 48 (the section gap). On phones
   the last section that ends with such a row keeps 32 px; from 768 px as before: there the same 32 px failed the
   0.5-point gate on 5 pages that are short for other causes (corporate-b2b, flight-search, fco-lin,
   first-time-flyers, travel-insurance).
   Run: node --test test/ita-footer-gap-teasers-593.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/ita.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('below 768 px a last section that ends with teaser cards: 32 px to the footer', () => {
  const sel = 'body.brand-ita main > .section:last-child:has(> .carousel-cards-wrapper:last-child)';
  const q = css.indexOf(`@media (width < 768px) { ${sel} {`);
  assert.ok(q >= 0, 'the rule, below 768 px');
  const i = css.indexOf(`${sel} {`, q);
  assert.match(css.slice(i, css.indexOf('}', i)), /margin-bottom: 32px;/);
});

test('not from 768 px', () => {
  const outside = css.replace(/@media \(width < 768px\) \{ body\.brand-ita main > \.section:last-child:has\(> \.carousel-cards-wrapper:last-child\) \{[^}]*\} \}/, '');
  assert.doesNotMatch(outside, /body\.brand-ita main > \.section:last-child:has\(> \.carousel-cards-wrapper:last-child\) \{/);
});
