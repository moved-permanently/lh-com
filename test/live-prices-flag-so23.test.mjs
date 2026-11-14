/* eslint-disable max-len */
/* Standing order 23 of 2026-11-14, item 1: the browser's live price calls behind the site flag
   live-prices (scripts/flags.js, the site's /config/flags sheet). Every call of PRICE_ROUTES
   (scripts/lh-data.js: the fare teaser's offers and manual fares, the destination finder's offers,
   flight-prices, teaser/price, security-waiting-time) is sent only when the flag is on; off (a
   missing sheet, no row, another value), lhFetch sends nothing and fails, and the widget shows one
   line and a link to the airline's own page for that function (scripts/live-prices.js).
   A slow sheet on a working site does not take the prices away: a price widget reads the flag
   patiently (isFlagOn(..., { patient: true })): when the first read times out or fails on the
   network, it waits for a second read of up to 15 s and goes by that; a sheet that answers (404, no
   row, "off") is final. Every other flag reader keeps the 3 s rule.
   Run: node --max-old-space-size=512 --test test/live-prices-flag-so23.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
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
const at = (host, pathname) => {
  window.location = {
    hostname: host, pathname, search: '', hash: '', replace: () => {}, href: `https://${host}${pathname}`, origin: `https://${host}`,
  };
  window.origin = window.location.origin;
};
at('lufthansa.turnsthe.page', '/');
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
window.sessionStorage = store();
window.localStorage = store();
globalThis.window = window;
globalThis.document = document;

const sheet = (rows) => new Response(JSON.stringify({ data: rows, ':type': 'sheet' }), { status: 200, headers: { 'content-type': 'application/json' } });
let calls;
let flagsAnswer;
beforeEach(async () => {
  calls = [];
  window.sessionStorage.clear();
  globalThis.fetch = async (url, init) => {
    const href = String(url);
    calls.push(href);
    if (href === '/config/flags.json') return flagsAnswer(init);
    if (href.includes('/data/recorded/')) return new Response(JSON.stringify({ entries: {} }), { status: 200 });
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  const { resetFlags } = await import('../scripts/flags.js');
  resetFlags();
});

const { isFlagOn, loadFlags } = await import('../scripts/flags.js');
const { lhFetch } = await import('../scripts/lh-data.js');
const { livePricesOn, livePricesOffNotice, ownFunctionPage } = await import('../scripts/live-prices.js');
const { getLocale } = await import('../scripts/locale.js');

const PRICE = '/service/api/destinationfinder/destination/finder/FRA/E?months=0_11&tripType=RETURN';
const priceCalls = () => calls.filter((c) => c.includes('/service/api/destinationfinder/destination/finder/'));

test('live-prices on: the price call is sent; off, no row or no sheet: nothing is sent and the call fails', async () => {
  flagsAnswer = () => sheet([{ flag: 'live-prices', value: 'on' }]);
  const { source } = await lhFetch(PRICE, { market: 'de/en' });
  assert.equal(source, 'live');
  assert.equal(priceCalls().length, 1);
  const { resetFlags } = await import('../scripts/flags.js');
  const offWith = async (answer) => {
    resetFlags();
    calls = [];
    flagsAnswer = answer;
    await assert.rejects(lhFetch(PRICE, { market: 'de/en' }), /live-prices/);
    assert.equal(priceCalls().length, 0, 'no call to www');
  };
  await offWith(() => sheet([{ flag: 'live-prices', value: 'off' }]));
  await offWith(() => sheet([{ flag: 'live-chat', value: 'on' }]));
  await offWith(() => new Response('', { status: 404 }));
});

test('the other routes do not wait for the flag and are sent with it off', async () => {
  flagsAnswer = () => sheet([{ flag: 'live-prices', value: 'off' }]);
  const { source } = await lhFetch('/service/api/suggestions/airports?query=Wien', { market: 'de/en' });
  assert.equal(source, 'live');
  assert.ok(calls.some((c) => c.includes('/suggestions/airports')));
});

test('a slow or failing sheet on a working site: the price widget waits for a second read and keeps its prices', async () => {
  // the first read never answers within 3 s (aborted), the second answers "on"
  let reads = 0;
  flagsAnswer = (init) => {
    reads += 1;
    if (reads === 1) {
      return new Promise((resolve, reject) => {
        init.signal.addEventListener('abort', () => reject(new Error('aborted')));
      });
    }
    return sheet([{ flag: 'live-prices', value: 'on' }]);
  };
  await loadFlags({ timeout: 30 });
  assert.equal(await isFlagOn('live-prices'), false, 'the 3 s rule for every other reader');
  assert.equal(await livePricesOn(), true, 'prices read the flag again and stay on');
  assert.equal(reads, 2);
  // a network error first, then the sheet
  const { resetFlags } = await import('../scripts/flags.js');
  resetFlags();
  reads = 0;
  flagsAnswer = () => {
    reads += 1;
    return reads === 1 ? Promise.reject(new TypeError('Failed to fetch')) : sheet([{ flag: 'live-prices', value: 'on' }]);
  };
  assert.equal(await livePricesOn(), true);
});

test('a sheet that answers is final: 404 or "off" are not read again', async () => {
  let reads = 0;
  flagsAnswer = () => { reads += 1; return new Response('', { status: 404 }); };
  assert.equal(await livePricesOn(), false);
  assert.equal(reads, 1);
});

test('off: one line and a link to the airline\'s own page for that function', () => {
  document.head.innerHTML = '<meta name="brand" content="discover">';
  at('discover.turnsthe.page', '/de/en/homepage');
  assert.equal(ownFunctionPage(getLocale()), 'https://www.discover-airlines.com/de/en/book/flights/offers');
  let p = livePricesOffNotice(getLocale());
  assert.equal(p.tagName, 'P');
  assert.equal(p.className, 'live-prices-off');
  assert.equal(p.querySelector('a').getAttribute('href'), 'https://www.discover-airlines.com/de/en/book/flights/offers');
  assert.match(p.textContent, /discover-airlines\.com/);
  document.head.innerHTML = '';
  at('lufthansa.turnsthe.page', '/de/en/flights-to-berlin');
  p = livePricesOffNotice(getLocale());
  assert.equal(p.querySelector('a').getAttribute('href'), 'https://www.lufthansa.com/de/en/flights-to-berlin');
  at('lufthansa.turnsthe.page', '/de/de/flughafen-frankfurt');
  p = livePricesOffNotice(getLocale(), 'waiting-times');
  assert.match(p.textContent, /Wartezeiten/);
  document.head.innerHTML = '<meta name="brand" content="tap">';
  at('tap.turnsthe.page', '/pt/en/flights');
  p = livePricesOffNotice(getLocale());
  assert.equal(p.querySelector('a').getAttribute('href'), 'https://www.flytap.com/pt/en/flights');
  document.head.innerHTML = '';
});
