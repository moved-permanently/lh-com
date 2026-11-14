/* Standing order 22 of 2026-11-14, item 2a: Discover's offers grid when the price call fails
   (blocks/destination-finder grid). The grid reads www.lufthansa.com's destinationfinder from the
   visitor's browser (X-Portal FOUR_Y) and shows the 591 offers there; when that call fails (no
   answer, an error, a blocked host) it said "For this selected origin we do not offer any
   destinations", which is wrong. On Discover it now says that the offers cannot be shown and links
   to Discover's own offers page on www.discover-airlines.com (the page's language root, its query
   kept). An answer that is there but empty still says "no results for origin", and lufthansa.com's
   grid is as before. Reading the public prices is unchanged (no flag).
   Run: node --max-old-space-size=512 --test test/finder-grid-offers-unavailable-so22.test.mjs */
/* global globalThis */
import test, { beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const store = () => {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    clear: () => m.clear(),
  };
};
const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
// the block's imports load scripts.js: on a demo host's / it only redirects (stubbed)
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'discover.turnsthe.page', pathname: '/', search: '', hash: '', replace: () => {}, href: 'https://discover.turnsthe.page/', origin: 'https://discover.turnsthe.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
window.sessionStorage = store();
window.localStorage = store();
// linkedom's select has no value setter (the grid sets its pickers)
Object.defineProperty(window.HTMLSelectElement.prototype, 'value', {
  configurable: true,
  get() { return (this.querySelector('option[selected]') || this.querySelector('option') || {}).value || ''; },
  set(v) { [...this.querySelectorAll('option')].forEach((o) => o.toggleAttribute('selected', o.value === v)); },
});
globalThis.window = window;
globalThis.document = document;
globalThis.NodeFilter = { SHOW_ELEMENT: 1, SHOW_TEXT: 4 };

const FINDER = '/service/api/destinationfinder/destination/finder/FRA/E';
// how the price call ends: 'fail' (500), 'throw' (a refused host), 'empty' (no offers)
let finder;
beforeEach(() => {
  window.sessionStorage.clear();
  mock.timers.enable({ apis: ['setTimeout', 'Date'], now: Date.parse('2026-11-14T12:00:00Z') });
  globalThis.fetch = async (url) => {
    const href = String(url);
    if (href.includes('/data/recorded/')) return new Response(JSON.stringify({ entries: {} }));
    const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
    if (href.includes(FINDER)) {
      if (finder === 'throw') throw new TypeError('Failed to fetch');
      if (finder === 'empty') {
        return json({ destinationFinderOffers: [], currencyInfo: { currency: 'EUR', currencySymbol: '€' }, originCityName: 'Frankfurt' });
      }
      return json({}, 500);
    }
    return json({}, 404);
  };
});
afterEach(() => mock.timers.reset());

const { default: decorateFinder } = await import('../blocks/destination-finder/destination-finder.js');

const flush = () => new Promise((resolve) => { setImmediate(resolve); });
const settle = async (promise) => {
  let done = false;
  promise.then(() => { done = true; }, () => { done = true; });
  for (let i = 0; i < 400 && !done; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await flush();
    mock.timers.tick(100);
  }
  await flush();
  return promise;
};
const ROWS = [['Origin', 'Frankfurt (FRA)'], ['Trip duration', '14']];
const grid = async (brand, path, search = '') => {
  window.location.pathname = path;
  window.location.search = search;
  document.head.innerHTML = brand ? `<meta name="brand" content="${brand}">` : '';
  const el = document.createElement('div');
  el.className = 'destination-finder grid';
  el.innerHTML = ROWS.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('');
  document.body.replaceChildren(el);
  await settle(decorateFinder(el));
  // the first answer (and a refused host's retries) after the block is built
  for (let i = 0; i < 200; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await flush();
    mock.timers.tick(100);
  }
  const message = el.querySelector('.destination-finder-message');
  return {
    hidden: message.hidden,
    text: message.textContent.replace(/\s+/g, ' ').trim(),
    link: message.querySelector('a') ? message.querySelector('a').getAttribute('href') : null,
    tiles: el.querySelectorAll('.destination-finder-tile').length,
  };
};

['fail', 'throw'].forEach((how) => {
  test(`Discover, the price call ${how === 'fail' ? 'answers 500' : 'refused'}: a link to Discover's own offers page, not "no destinations"`, async () => {
    finder = how;
    const en = await grid('discover', '/de/en/book/flights/offers');
    assert.equal(en.hidden, false);
    assert.equal(en.tiles, 0);
    assert.ok(!/do not offer any destinations/.test(en.text), en.text);
    assert.equal(en.link, 'https://www.discover-airlines.com/de/en/book/flights/offers');
    assert.match(en.text, /Discover Airlines/);
    const de = await grid('discover', '/de/de/book/flights/offers', '?PartnerFlights=one&OriginCode=FRA');
    assert.ok(!/bieten wir keine Ziele an/.test(de.text), de.text);
    assert.equal(de.link, 'https://www.discover-airlines.com/de/de/book/flights/offers?PartnerFlights=one&OriginCode=FRA');
  });
});

test('Discover, an answer without offers: still "no results for origin"', async () => {
  finder = 'empty';
  const en = await grid('discover', '/de/en/book/flights/offers');
  assert.match(en.text, /do not offer any destinations/);
  assert.equal(en.link, null);
});

test('lufthansa.com, the price call failing: as before (no link to another site)', async () => {
  finder = 'fail';
  const lh = await grid('', '/de/en/offers');
  assert.equal(lh.link, null);
  assert.match(lh.text, /do not offer any destinations/);
});
