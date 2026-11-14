/* eslint-disable max-len */
/* Standing order 23 of 2026-11-14, item 1: every price widget with the site's flag live-prices off
   (no row, as on lh-b2b, lh-cargo, lh-airdolomiti; off, as on lh-tap and lh-flynet): no price call
   leaves the browser, and the widget shows one line and a link to the airline's own page for that
   function: the fare teaser, the destination finder's slider and grid, the price bar, the security
   waiting times (its authored Live page row, else the page on the airline's www) and the
   destination page's price calendar (the rest of that page stays). Discover's grid keeps its own
   message of order 22 (the link to its offers page). With the flag on the widgets call as before
   (their own tests answer the flag on).
   Run: node --max-old-space-size=512 --test test/live-prices-blocks-so23.test.mjs */
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
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'lufthansa.turnsthe.page', pathname: '/', search: '', hash: '', replace: () => {}, href: 'https://lufthansa.turnsthe.page/', origin: 'https://lufthansa.turnsthe.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
window.sessionStorage = store();
window.localStorage = store();
window.IntersectionObserver = function IntersectionObserver() {
  return { observe: () => {}, unobserve: () => {}, disconnect: () => {} };
};
Object.defineProperty(window.HTMLSelectElement.prototype, 'value', {
  configurable: true,
  get() { return (this.querySelector('option[selected]') || this.querySelector('option') || {}).value || ''; },
  set(v) { [...this.querySelectorAll('option')].forEach((o) => o.toggleAttribute('selected', o.value === v)); },
});
globalThis.window = window;
globalThis.document = document;
globalThis.NodeFilter = { SHOW_ELEMENT: 1, SHOW_TEXT: 4 };
globalThis.IntersectionObserver = window.IntersectionObserver;

const PRICE = /\/service\/api\/(lhg-fare-teaser\/fareteaser\/(?!recommend)|destinationfinder\/destination\/finder\/|flight-prices\/|teaser\/price\/|security-waiting-time\/)/;
let calls;
let flagRows;
beforeEach(async () => {
  calls = [];
  window.sessionStorage.clear();
  const { resetFlags } = await import('../scripts/flags.js');
  resetFlags();
  mock.timers.enable({ apis: ['setTimeout', 'Date'], now: Date.parse('2026-11-14T12:00:00Z') });
  globalThis.fetch = async (url) => {
    const href = String(url);
    calls.push(href);
    const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
    if (href === '/config/flags.json') return flagRows ? json({ data: flagRows }) : new Response('', { status: 404 });
    if (href.includes('/data/recorded/')) return json({ entries: {} });
    // the destination page's content (not a price route): it answers with the flag off too
    if (href.includes('/destinationfinder/destination/content/')) return json({ overview: { cityHighlights: 'Berlin is ...' } });
    return json({}, 404);
  };
});
afterEach(() => mock.timers.reset());

const flush = () => new Promise((resolve) => { setImmediate(resolve); });
const settle = async (promise) => {
  let done = false;
  promise.then(() => { done = true; }, () => { done = true; });
  for (let i = 0; i < 600 && !done; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await flush();
    mock.timers.tick(100);
  }
  for (let i = 0; i < 100; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await flush();
    mock.timers.tick(100);
  }
  return promise;
};
const block = (name, rows, path, brand = '') => {
  window.location.pathname = path;
  document.head.innerHTML = brand ? `<meta name="brand" content="${brand}">` : '';
  const el = document.createElement('div');
  el.className = name;
  el.innerHTML = rows.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('');
  document.body.replaceChildren(el);
  return el;
};
const notice = (el) => {
  const p = el.querySelector('p.live-prices-off');
  return p ? { text: p.textContent, href: p.querySelector('a').getAttribute('href') } : null;
};
const priceCalls = () => calls.filter((c) => PRICE.test(c));

const blocks = {
  fareTeaser: (await import('../blocks/fare-teaser/fare-teaser.js')).default,
  finder: (await import('../blocks/destination-finder/destination-finder.js')).default,
  priceBar: (await import('../blocks/price-bar/price-bar.js')).default,
  waiting: (await import('../blocks/security-waiting-time/security-waiting-time.js')).default,
  offer: (await import('../blocks/destination-offer/destination-offer.js')).default,
};

[['no row (lh-b2b, lh-cargo, lh-airdolomiti)', [{ flag: 'live-chat', value: 'on' }]], ['off (lh-tap, lh-flynet)', [{ flag: 'live-prices', value: 'off' }]], ['no sheet', null]].forEach(([name, rows]) => {
  test(`live-prices ${name}: the fare teaser, the slider and the price bar show one line and the airline's page, no price call`, async () => {
    flagRows = rows;
    let el = block('fare-teaser', [['Origin', 'FRA'], ['Destinations', 'BER']], '/de/en/homepage');
    await settle(blocks.fareTeaser(el));
    assert.deepEqual(notice(el), { text: 'Current prices are shown on lufthansa.com: Go to lufthansa.com', href: 'https://www.lufthansa.com/de/en/homepage' });
    el = block('destination-finder', [['Origin', 'Frankfurt (FRA)']], '/de/de/homepage');
    await settle(blocks.finder(el));
    assert.equal(notice(el).href, 'https://www.lufthansa.com/de/de/homepage');
    assert.match(notice(el).text, /Aktuelle Preise finden Sie auf lufthansa\.com/);
    el = block('price-bar', [['Destination', 'BER'], ['Title', 'Berlin']], '/de/en/flights-to-berlin');
    await settle(blocks.priceBar(el));
    assert.equal(notice(el).href, 'https://www.lufthansa.com/de/en/flights-to-berlin');
    assert.deepEqual(priceCalls(), []);
  });
});

test('live-prices off: the security waiting times (their Live page row, else the page on www), no call', async () => {
  flagRows = [{ flag: 'live-prices', value: 'off' }];
  let el = block('security-waiting-time', [], '/de/en/frankfurt-airport-waiting-times');
  await settle(blocks.waiting(el));
  assert.deepEqual(notice(el), { text: 'Current waiting times are shown on lufthansa.com: Go to lufthansa.com', href: 'https://www.lufthansa.com/de/en/frankfurt-airport-waiting-times' });
  el = block('security-waiting-time', [['Live page', '<a href="https://www.lufthansa.com/de/en/security-checks">x</a>']], '/de/en/x');
  await settle(blocks.waiting(el));
  assert.equal(notice(el).href, 'https://www.lufthansa.com/de/en/security-checks');
  assert.deepEqual(priceCalls(), []);
});

test('live-prices off: the grid shows the line on lufthansa.com, Discover\'s own message (its offers page) on Discover', async () => {
  flagRows = [{ flag: 'live-prices', value: 'off' }];
  let el = block('destination-finder grid', [['Origin', 'Frankfurt (FRA)']], '/de/en/offers');
  await settle(blocks.finder(el));
  assert.equal(notice(el).href, 'https://www.lufthansa.com/de/en/offers');
  assert.ok(!/do not offer any destinations/.test(el.textContent));
  el = block('destination-finder grid', [['Origin', 'Frankfurt (FRA)']], '/de/en/book/flights/offers', 'discover');
  await settle(blocks.finder(el));
  const link = el.querySelector('.destination-finder-message a');
  assert.equal(link.getAttribute('href'), 'https://www.discover-airlines.com/de/en/book/flights/offers');
  assert.deepEqual(priceCalls(), []);
});

test('live-prices off: the destination page without its price calendar, which shows the line', async () => {
  flagRows = [{ flag: 'live-prices', value: 'off' }];
  window.location.search = '?origin=FRA&destination=BER';
  const el = block('destination-offer', [], '/de/en/book-a-flight/destination');
  await settle(blocks.offer(el));
  window.location.search = '';
  const calendar = el.querySelector('.destination-offer-calendar');
  assert.ok(calendar && calendar.querySelector('p.live-prices-off'), 'the calendar shows the line');
  assert.equal(calendar.querySelector('.destination-offer-months'), null);
  assert.match(el.textContent, /Berlin is/, 'the rest of the page stays');
  assert.deepEqual(priceCalls(), []);
});
