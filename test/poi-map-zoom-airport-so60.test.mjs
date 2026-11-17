/* eslint-disable max-len */
/* Standing order 60 of 2026-11-17, item 2: Air Dolomiti's airport pages (121: /aeroporti/*, /en/airports/*,
   /de/flughaefen/*) draw www's EmbedUrl, a Google map of the airport, under the route cards; our documents had a
   "Google Maps" link there. The rows (delta-so60-airdolomiti-airport-maps) put our poi-map in its place with one authored
   point (the airport's name and www's view centre) and a Zoom row (www's view: its span over 768 px as Web Mercator
   zoom). Zoom is the first view's highest zoom (a single point: that zoom, not the tiles' 19); none or out of range:
   as before. The theme sizes the map as www's frame: the window wide below 930px, 95 % of it from 930, 56.25 % of
   the window high, 30px above and below (219px at 390, 810 at 1440); maps with an aside (lufthansa.com) keep theirs.
   Run: node --max-old-space-size=256 --test test/poi-map-zoom-airport-so60.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.location = {
  hostname: 'airdolomiti.turnsthe.page', pathname: '/de/flughaefen/frankfurt-de', search: '', href: 'https://airdolomiti.turnsthe.page/de/flughaefen/frankfurt-de', origin: 'https://airdolomiti.turnsthe.page',
};
Object.defineProperty(window, 'origin', { value: 'https://airdolomiti.turnsthe.page', configurable: true });
globalThis.window = window;
globalThis.document = document;
const { readPoiMapRows, readPoiMapSettings, fitBounds } = await import('../blocks/poi-map/poi-map.js');

const block = (rows) => {
  const b = document.createElement('div');
  b.className = 'poi-map block';
  b.innerHTML = rows.map(([a, c]) => `<div><div>${a}</div><div>${c}</div></div>`).join('');
  return b;
};

test('a Zoom row: the first view zoom, the point stays a point', () => {
  const { config, points } = readPoiMapRows(block([['Frankfurt Airport', '50.092344, 8.599771'], ['Zoom', '8']]));
  assert.equal(points.length, 1);
  assert.equal(points[0].title, 'Frankfurt Airport');
  const s = readPoiMapSettings(config);
  assert.equal(s.zoom, 8);
  assert.equal(s.tiles, 'osm');
  // a single point gets the highest zoom allowed: the row's, not the tiles' 19
  assert.equal(fitBounds(points, 1368, 810, Math.min(19, s.zoom)).zoom, 8);
  assert.equal(fitBounds(points, 1368, 810, 19).zoom, 19);
});

test('no Zoom row, an out-of-range or non-number one, a Zoom in label row: no zoom (as before)', () => {
  const zoomOf = (rows) => readPoiMapSettings(readPoiMapRows(block(rows)).config).zoom;
  assert.equal(zoomOf([['Frankfurt Airport', '50.09, 8.60']]), null);
  assert.equal(zoomOf([['Zoom', '1']]), null);
  assert.equal(zoomOf([['Zoom', '20']]), null);
  assert.equal(zoomOf([['Zoom', '20'], ['Tiles', 'carto']]), 20);
  assert.equal(zoomOf([['Zoom', 'near']]), null);
  assert.equal(zoomOf([['Zoom in label', 'Vergrößern']]), null);
});

test('drawMap passes the Zoom on (the block code)', () => {
  const js = fs.readFileSync(new URL('../blocks/poi-map/poi-map.js', import.meta.url), 'utf8');
  assert.ok(js.includes('drawMap(view, result.points, labels, settings.tiles, { zoom: settings.zoom })'));
  assert.ok(js.includes('const highest = Math.min(source.maxZoom, options.zoom || source.maxZoom);'));
  assert.ok(js.includes('fitBounds(points, first.w, first.h, highest)'));
});

test('Air Dolomiti theme: the map as www\'s frame, maps with an aside untouched', () => {
  const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  const V = 'body.brand-airdolomiti main .poi-map:not(.poi-map-with-aside) .poi-map-view';
  assert.ok(css.includes(`${V} { width: 100vw; height: 56.25vw; margin: 30px calc(50% - 50vw); }`));
  assert.ok(css.includes(`@media (width >= 930px) { ${V} { width: 95vw; margin: 30px calc(50% - 47.5vw); } }`));
  assert.ok(css.includes('body.brand-airdolomiti main .poi-map-wrapper:has(> .poi-map:not(.poi-map-with-aside)) { max-width: none; padding: 0; }'));
  // brand-scoped: no other theme or the block's own CSS sizes the airport map
  assert.ok(!fs.readFileSync(new URL('../blocks/poi-map/poi-map.css', import.meta.url), 'utf8').includes('56.25vw'));
});
