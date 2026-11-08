/* eslint-disable max-len */
/* The fare teaser's authored routes without a fare (brief 474; ema-test's sweep of Brussels, rows 16, 19,
   34, 42): www's /ke/en/homepage shows six "Winter deals", the routes its fare service priced
   (Brussels, Amsterdam, Zurich, Munich, Frankfurt, Vienna); ours kept the authored routes the service
   had no fare for (New York, Los Angeles, Chicago, Washington, Boston) as rows without a price or
   picture: 11 rows, 239 px more before "Current topics and news". Once the service has answered
   live, a route it gave no fare drops out (dropUnpriced); with no live answer every route stays, as
   before (names, no prices). Brussels' cards as www's boxes (brussels-parity-003, www's CSS rendered
   from the capture): a 1 px #c5c5c5 frame, the 125 px square picture, the origin 14/21 bold, the city
   24/26.4 bold (20/22 below 1025 px), "Round trip from" 16/24 over the price 20/22 bold, right, dark.
   Run: node --max-old-space-size=512 --test test/fare-teaser-unpriced-474.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const store = () => {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), clear: () => m.clear(),
  };
};
const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
// the block's imports load scripts.js: on a demo host's / it only redirects (stubbed), it decorates nothing
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'brussels.turnsthe.page', pathname: '/', search: '', replace: () => {}, href: 'https://brussels.turnsthe.page/', origin: 'https://brussels.turnsthe.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
window.sessionStorage = store();
window.localStorage = store();
globalThis.window = window;
globalThis.document = document;

const { dropUnpriced } = await import('../blocks/fare-teaser/fare-teaser.js');
window.hlx.codeBasePath = '';

const item = (city, priced) => `<li class="fare-teaser-item"><a class="fare-teaser-route"><span class="fare-teaser-destination">${city}</span></a><p class="fare-teaser-offer"${priced ? '' : ' hidden'}><span class="fare-teaser-price">${priced ? '$ 996' : ''}</span></p></li>`;

test('after a live answer: the routes without a fare drop out, the priced ones keep their order', () => {
  const list = document.createElement('ul');
  list.innerHTML = ['Brussels', 'NYC', 'LAX', 'Amsterdam', 'CHI', 'Zurich'].map((c) => item(c, !/^[A-Z]{3}$/.test(c))).join('');
  assert.equal(dropUnpriced(list), 3);
  assert.deepEqual([...list.querySelectorAll('.fare-teaser-destination')].map((s) => s.textContent), ['Brussels', 'Amsterdam', 'Zurich']);
});

test('nothing priced (an answer without fares for these routes): every route stays', () => {
  const list = document.createElement('ul');
  list.innerHTML = ['NYC', 'LAX'].map((c) => item(c, false)).join('');
  assert.equal(dropUnpriced(list), 0);
  assert.equal(list.children.length, 2);
});

test('decorate drops them only after a live answer, also after the late retry', () => {
  const js = fs.readFileSync(new URL('../blocks/fare-teaser/fare-teaser.js', import.meta.url), 'utf8');
  assert.match(js, /if \(data\.sources\.fares === 'live'\) dropUnpriced\(list\);/);
  assert.match(js, /fill\(fares\.offers\);\s*dropUnpriced\(list\);/);
});

test('Brussels: the deals as www\'s boxed cards', () => {
  const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  assert.ok(css.includes('body.brand-brussels .fare-teaser .fare-teaser-item { grid-template: "image route" auto "image offer" 1fr / 125px minmax(0, 1fr); column-gap: 20px; min-height: 125px; padding: 0 20px 0 0; border: 1px solid #c5c5c5; }'));
  assert.ok(css.includes('body.brand-brussels .fare-teaser .fare-teaser-image { width: 125px; height: 125px; margin: 0; }'));
  assert.ok(css.includes('body.brand-brussels .fare-teaser .fare-teaser-origin { font-size: 14px; font-weight: 700; line-height: 21px; }'));
  assert.ok(css.includes('body.brand-brussels .fare-teaser .fare-teaser-destination { font-size: 20px; font-weight: 700; line-height: 22px; }'));
  assert.match(css, /@media \(width >= 1025px\) \{ body\.brand-brussels \.fare-teaser \.fare-teaser-destination \{ font-size: 24px; line-height: 26\.4px; \} \}/);
  assert.ok(css.includes('body.brand-brussels .fare-teaser .fare-teaser-offer { flex-direction: column; align-items: flex-end; justify-content: flex-end; row-gap: 0; padding: 0 0 10px; color: #1a1a1a; }'));
  assert.ok(css.includes('body.brand-brussels .fare-teaser .fare-teaser-price-label { font-size: 16px; font-weight: 400; line-height: 24px; }'));
  assert.ok(css.includes('body.brand-brussels .fare-teaser .fare-teaser-price { font-size: 20px; font-weight: 700; line-height: 22px; }'));
});
