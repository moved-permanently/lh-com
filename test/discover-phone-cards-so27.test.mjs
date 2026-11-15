/* eslint-disable max-len */
/* Standing order 27 of 2026-11-15, item 2: Discover's offers grid on phones (390). Measured from the picture's
   bottom on www's settled recording (discover-snapshots-004, the second card row), both languages alike: the city
   14 px, the country 38, "Round trip from" / "Hin- und Rückflug ab" 72 (its second line 96, 24 px under the first),
   the price 20 px under the label's last line, the 24 px checkbox ending 8 px over the card's edge. Ours: 15, 40-41,
   77, the label's lines 22.4 px apart (so a German card, whose label wraps, ran 1.5 px short a row: 380.5 against
   382), the price 20 under, a 20 px checkbox. Below 768 px Discover's card: 9 px over the city, the country 2 px
   under it, 14 px over the label, the label's lines 24 px, the price's 16 (17.6 before), the compare control 8 px over the edge
   with www's 24 px box, 5 px more under the price (cards 358 / 382 px apart, as www's). 768 px and up as before.
   Run: node --test test/discover-phone-cards-so27.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/destination-finder/finder-compare.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const media = (css.match(/@media \(width < 768px\) \{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g) || []).find((m) => m.includes('body.brand-discover')) || '';
const D = 'body.brand-discover .destination-finder.grid';

test('Discover phones: the card text as www\'s', () => {
  assert.ok(media.includes(`${D} .destination-finder-tile-country { margin-top: 2px; }`));
  assert.ok(media.includes(`${D} .destination-finder-tile-offer { padding-top: 14px; }`));
  assert.ok(media.includes(`${D} .destination-finder-tile-price-label { line-height: 24px; }`));
  assert.ok(media.includes(`${D} .destination-finder-tile-price { line-height: 16px; }`));
});

test('Discover phones: www\'s 24 px checkbox 8 px over the card\'s edge, 5 px more under the price', () => {
  // www's control runs to 6 px from the card's right edge ("Compare cities" on one line beside the 24 px box: x 32-182 in a 22-188 card)
  assert.ok(media.includes('body.brand-discover .destination-finder .destination-finder-compare { bottom: 8px; max-width: calc(100% - 12px); }'));
  assert.ok(media.includes('body.brand-discover .destination-finder .destination-finder-compare-checkbox { width: 24px; height: 24px; margin: 0; }'));
  assert.ok(media.includes(`${D} .destination-finder-tile-compare .destination-finder-tile-body { padding-top: 9px; padding-bottom: calc(8px + 24px + 40px); }`), '9 px over the city, 5 px more under the price');
});

test('Discover from 768 px as before', () => {
  assert.ok(css.includes('@media (width >= 768px) { body.brand-discover .destination-finder.grid .destination-finder-tile-compare .destination-finder-tile-body { padding-bottom: calc(10px + 24px + 18px); } }'));
  assert.ok(css.includes('body.brand-discover .destination-finder .destination-finder-compare { bottom: 10px; }'));
});
