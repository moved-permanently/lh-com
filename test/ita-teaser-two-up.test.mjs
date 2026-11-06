/* eslint-disable max-len, import/extensions -- dev tooling */
/* ITA's two-column teaser rows (brief 432, ita-parity-001: world-of-ita-airways/travel-classes, two
   cards side by side at 1440, each 622 px). tools/importer/ita-import.mjs withTeaserColumns makes
   such a view a three-column one, so lh-com's info importer makes it a carousel-cards block; the
   view is marked data-import-two-up, which the parser makes the option two-up (two per row, as
   Austrian's converted views): without it the block was a three-column grid of two 408 px cards.
   Run: node --max-old-space-size=512 --test test/ita-teaser-two-up.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';

const { withTeaserColumns } = await import('../tools/importer/ita-import.mjs');

const card = (n) => `<div class="column-view-item"><div class="teaser"><a class="teaser card" href="/x${n}"><h3>Card ${n}</h3></a></div></div>`;
const view = (kind, inner) => `<div class="${kind} column event section" data-identifier="${kind}"><div class="column-view"><div class="row">${inner}</div></div></div>`;

test('a two-column teaser view: a three-column one marked data-import-two-up', () => {
  const out = withTeaserColumns(view('twocolumn', card(1) + card(2)));
  assert.match(out, /^<div class="threecolumn column event section" data-import-two-up="" data-identifier="threecolumn">/);
});

test('a two-column view without teasers, or with column views inside, stays as it is', () => {
  const text = view('twocolumn', '<div class="column-view-item"><p>Text</p></div>');
  assert.equal(withTeaserColumns(text), text);
  const nested = view('twocolumn', `<div class="column-view-item">${view('twocolumn', card(1))}</div>`);
  assert.ok(!withTeaserColumns(nested).startsWith('<div class="threecolumn'), 'the outer view keeps its kind');
});
