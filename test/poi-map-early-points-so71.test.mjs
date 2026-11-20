/* eslint-disable max-len, class-methods-use-this, no-await-in-loop -- a stand-in IntersectionObserver; polling for the map's lookup */
/* Standing order 71 item 3: the POI map's empty 500 px box. On lufthansa.com a map looks up its points at once and only the
   drawing waits for the viewport. Before, the lookup waited too, so a map without recorded points kept its empty 500 px box
   until it came near and only then went: a page measured before the visitor scrolled there drew it, one measured after did
   not (/xx/es/first-class: two maps, +-1,000 px between loads, on live and on marked copies alike), and a visitor saw the page
   jump by 500 px per map. A map with points draws as before, once near; other brands wait for the viewport as before.
   Run: node --max-old-space-size=256 --test test/poi-map-early-points-so71.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
const href = 'https://lufthansa.turnsthe.page/xx/es/first-class';
window.location = {
  hostname: 'lufthansa.turnsthe.page', pathname: '/xx/es/first-class', search: '', href, origin: 'https://lufthansa.turnsthe.page',
};
Object.defineProperty(window, 'origin', { value: 'https://lufthansa.turnsthe.page', configurable: true });
globalThis.window = window;
globalThis.document = document;
// a viewport the map never comes near (the measured page scrolled back to the top before its section showed)
let observers = 0;
window.IntersectionObserver = class {
  constructor() { observers += 1; }

  observe() {}

  disconnect() {}
};
// our host: the recordings index (read once per page, so one object the tests fill) and a recorded answer with two points;
// every request off the host fails
const recorded = {};
globalThis.fetch = async (url) => {
  const u = String(url);
  if (u.endsWith('/data/recorded/index.json')) return { ok: true, status: 200, json: async () => ({ entries: recorded }) };
  if (u.endsWith('/data/recorded/poi.json')) return { ok: true, status: 200, json: async () => ({ pointsOfInterest: [{ lat: 42.36, lng: -71.06, title: 'Boston' }, { lat: 40.64, lng: -73.78, title: 'New York (JFK)' }] }) };
  throw new TypeError('blocked');
};
const { default: decorate } = await import('../blocks/poi-map/poi-map.js');

const SOURCE = '/content/lh/markets/xx/es/prepare-for-your-trip/travel-classes/first-class/jcr:content/par/x/poimapping';
// a second map whose answer is recorded
const OTHER = `${SOURCE}_copy`;
recorded[`xx/es|GET /service/secured/api/pointsOfInterest/${btoa(OTHER)}`] = { file: 'poi.json' };
const mapBlock = (source = SOURCE) => {
  const section = document.createElement('div');
  section.className = 'section';
  section.innerHTML = `<div class="poi-map-wrapper"><div class="poi-map block"><div><div>Source</div><div>${source}</div></div></div></div>`;
  document.body.append(section);
  return section.querySelector('.poi-map');
};
// the labels' call fails and is tried once more after a pause, then the recordings: up to 3 s here
const until = async (fn, ms = 3000) => {
  const end = Date.now() + ms;
  while (!fn() && Date.now() < end) await new Promise((r) => { setTimeout(r, 25); });
  return fn();
};

test('lufthansa.com, no recorded points: the map goes at once, without coming near', async () => {
  document.body.className = 'brand-lufthansa';
  const block = mapBlock();
  await decorate(block);
  assert.ok(await until(() => block.hidden === true), 'hidden');
  assert.ok(block.dataset.lhSource === 'none', String(block.dataset.lhSource));
  assert.ok(!block.hasAttribute('aria-busy'), 'not busy');
});

test('lufthansa.com, recorded points: the map stays and waits for the viewport to draw', async () => {
  document.body.className = 'brand-lufthansa';
  const before = observers;
  const block = mapBlock(OTHER);
  await decorate(block);
  await until(() => block.hidden === true, 1500);
  assert.ok(block.hidden === false, 'shown');
  assert.ok(observers > before, 'waits for the viewport');
  assert.ok(!block.querySelector('.poi-map-tiles'), 'not drawn yet');
});

test('another brand: the lookup waits for the viewport, as before', async () => {
  document.body.className = 'brand-austrian';
  const block = mapBlock();
  await decorate(block);
  await until(() => block.hidden === true, 1500);
  assert.ok(block.hidden === false, 'not hidden before it comes near');
  assert.ok(block.getAttribute('aria-busy') === 'true', 'busy');
});
