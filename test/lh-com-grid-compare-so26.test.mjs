/* eslint-disable max-len */
/* Standing order 26 of 2026-11-14, item 1: lufthansa.com's offers grid has www's "Compare cities"
   since this order (blocks/destination-finder gridCompare, test/finder-grid-badges.test.mjs). On
   www's /gb/en/flights (lh-parity-004a, against our page with lufthansa-api-001's answer) the
   control's middle stands 21 px over the card's bottom edge (ours 32: bottom 20 px) and the card
   ends about 50 px under its price (ours 78): rows 395 px apart at 1440 (ours 427), 334 on phones
   (ours 367). lufthansa.com: the control 10 px over the edge, 46 px under the price at every width
   (www 44 at 1440, 47 at 390). Discover and SWISS as before. www's checkbox is 24 px (ours 20),
   and its card text sits tighter: the city 13 px under the picture (ours 15-16), "Round trip from"
   31-32 px under the country (ours 36-37), on phones the country 24 px under the city (ours 26):
   rows 401 -> 395 px apart at 1440 (www 395), 342 -> 334 on phones (www 334). The phone toolbar
   (www's order) is destination-finder.css's (test/finder-grid-badges.test.mjs for the order).
   Run: node --test test/lh-com-grid-compare-so26.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/destination-finder/finder-compare.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('lufthansa.com: the compare control 10 px over the card\'s bottom, the card 46 px under its price', () => {
  assert.ok(css.includes('body.brand-lufthansa .destination-finder .destination-finder-compare { bottom: 10px; }'));
  assert.ok(css.includes('body.brand-lufthansa .destination-finder.grid .destination-finder-tile-compare .destination-finder-tile-body { padding-bottom: calc(10px + 24px + 12px); }'));
});

test('lufthansa.com\'s rules at every width (no media block of their own)', () => {
  const media = css.match(/@media[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g) || [];
  assert.ok(!media.some((m) => m.includes('brand-lufthansa')));
});

test('Discover and the other grids with the control (SWISS) as before', () => {
  assert.ok(css.includes('body.brand-discover .destination-finder .destination-finder-compare { bottom: 10px; }'));
  assert.ok(css.includes('.destination-finder.grid .destination-finder-tile-compare .destination-finder-tile-body { padding-bottom: calc(20px + 24px + 28px); }'));
  assert.ok(css.includes('.destination-finder .destination-finder-compare { position: absolute; bottom: 20px;'));
});

const dfCss = fs.readFileSync(new URL('../blocks/destination-finder/destination-finder.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('lufthansa.com: www\'s 24 px checkbox', () => {
  assert.ok(css.includes('body.brand-lufthansa .destination-finder .destination-finder-compare-checkbox { width: 24px; height: 24px; margin: 0; }'));
});

test('lufthansa.com\'s card text as www\'s: 8 px over the city, 12 px over the price, on phones 2 px over the country', () => {
  assert.ok(dfCss.includes('body.brand-lufthansa .destination-finder.grid .destination-finder-tile-body { padding-top: 8px; }'));
  assert.ok(dfCss.includes('body.brand-lufthansa .destination-finder.grid .destination-finder-tile-offer { padding-top: 12px; }'));
  assert.ok(dfCss.includes('@media (width < 768px) { body.brand-lufthansa .destination-finder.grid .destination-finder-tile-country { margin-top: 2px; } }'));
});

test('lufthansa.com\'s phone toolbar: the smart search over the origin, Filters and the sort in one row, no gap under the empty toolbar', () => {
  const media = dfCss.slice(dfCss.lastIndexOf('@media (width < 768px) { .destination-finder.grid.destination-finder-phone-bar'));
  assert.ok(media.includes('.destination-finder.grid.destination-finder-phone-bar .destination-finder-filters > .destination-finder-smart-search { display: flex; width: 100%; margin-bottom: 40px; }'));
  assert.ok(media.includes('.destination-finder.grid.destination-finder-phone-bar .destination-finder-filters-bar { display: flex; align-items: center; justify-content: space-between; gap: 16px; }'));
  assert.ok(media.includes('.destination-finder.grid.destination-finder-phone-bar .destination-finder-toolbar { margin-bottom: 0; }'));
  // the headings stay for screen readers
  assert.ok(media.includes('section:first-of-type > .destination-finder-filter-heading { position: absolute; width: 1px; height: 1px; margin: 0; overflow: hidden; clip-path: inset(50%);'));
});
