/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* rows-for-ema-test.md row 1 (ema-lufthansa, 2026-11-10; the standing order of 2026-11-10 evening): ITA's section H2
   right before a teaser grid ("Related", "Latest news and updates") is www's heading-small (28 px) in its column
   view; ours drew the H2 default, heading-medium (36 px): the collapse drops a size one step from the level's default.
   ITA's DA (the census, before the collapse): an H2 right before a Carousel Cards grid 923 times {heading-small}, 96
   unmarked, 10 {heading-copytext-large}; before Cards Icon 67 times {heading-small}, none otherwise. THEMES.ita
   headingsBefore: such an H2 without a size of its own is heading-small; a marked one keeps its size.
   Run: node --max-old-space-size=512 --test test/ita-heading-before-cards.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { themeFor } from '../scripts/style-markers.js';

const page = (mainHtml) => {
  const { document } = parseHTML(`<html><head></head><body><main>${mainHtml}</main></body></html>`);
  globalThis.document = document;
  return document.querySelector('main');
};
const { default: decorateTokenFree } = await import('../scripts/token-free.js');
const CARDS = '<div class="carousel-cards grid"><div><div>x</div></div></div>';

test('ITA: an H2 right before a teaser grid is heading-small; elsewhere the H2 default', () => {
  assert.deepEqual(themeFor('ita').headingsBefore, { 'carousel-cards': { h2: 'heading-small' }, 'cards-icon': { h2: 'heading-small' } });
  const main = page(`<div><h2>Related</h2>${CARDS}</div><div><h2>Flight Certification</h2><p>Text</p></div><div><h2>Looking for more</h2><div class="cards-icon"><div><div>i</div></div></div></div>`);
  decorateTokenFree(main, { brand: 'ita', path: '/it/en/support/utilities/invoicing', read: () => '' });
  const h2 = [...main.querySelectorAll('h2')];
  assert.ok(h2[0].classList.contains('heading-small'), h2[0].className);
  assert.ok(!h2[1].classList.contains('heading-small'), 'before text: the default');
  assert.ok(h2[2].classList.contains('heading-small'), 'before Cards Icon');
});

test('a marked H2 keeps its size; another brand as before', () => {
  const main = page(`<div><h2 class="heading-copytext-large">What are you waiting for?</h2>${CARDS}</div>`);
  decorateTokenFree(main, { brand: 'ita', path: '/br/pt/x', read: () => '' });
  assert.ok(main.querySelector('h2').classList.contains('heading-copytext-large'));
  assert.ok(!main.querySelector('h2').classList.contains('heading-small'));
  assert.equal(themeFor('lufthansa').headingsBefore, undefined);
});
