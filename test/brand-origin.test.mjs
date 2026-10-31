/* eslint-disable max-len */
/* The origin of the fare widgets on a brand page (scripts/lh-api.js resolveOrigin): www's
   defaultAirport live, else the root's home airport (ITA it/it ROM, Discover xx/fr FRA): a
   recorded defaultAirport is another market's (the recordings are lh-com's: at/de's Vienna for
   every brand root), never the brand's. lh-com as before: its market's recording.
   Run: node --max-old-space-size=512 --test test/brand-origin.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
const setHost = (host, p) => {
  window.location = {
    hostname: host, pathname: p, search: '', href: `https://${host}${p}`, origin: `https://${host}`,
  };
};
setHost('ita.turnsthe.page', '/it/it/homepage');
globalThis.window = window;
window.sessionStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
window.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const { resolveOrigin } = await import('../scripts/lh-api.js');
const { getLocale } = await import('../scripts/locale.js');

const INDEX = { entries: { 'at/de|GET /service/api/defaultAirport': { file: 'at.json', recordedAt: '2026-10-21' }, 'de/en|GET /service/api/defaultAirport': { file: 'de.json', recordedAt: '2026-10-21' } } };
const answer = (code, name) => ({ globalDefaultAirport: { iataCode: code, name }, marketDefaultAirport: { iataCode: code, name } });
const answers = { 'at.json': answer('VIE', 'Wien'), 'de.json': answer('FRA', 'Frankfurt') };
let live = null;
globalThis.fetch = async (input) => {
  const u = new URL(typeof input === 'string' ? input : input.url, 'https://ita.turnsthe.page');
  if (u.pathname === '/data/recorded/index.json') return Response.json(INDEX);
  if (u.pathname.startsWith('/data/recorded/')) return Response.json(answers[u.pathname.split('/').pop()]);
  if (u.pathname === '/service/api/defaultAirport' && live) return Response.json(live);
  return new Response('blocked', { status: 403 });
};

function onPage(meta, fn) {
  const rows = Object.entries(meta).map(([k, v]) => `<meta name="${k}" content="${v}">`).join('');
  const { document } = parseHTML(`<!DOCTYPE html><html><head>${rows}</head><body></body></html>`);
  globalThis.document = document;
  return Promise.resolve(fn()).finally(() => { delete globalThis.document; });
}

test('a brand root: its home airport, not another market\'s recording', async () => {
  live = null;
  setHost('ita.turnsthe.page', '/it/it/homepage');
  const ita = await onPage({ brand: 'ita' }, async () => resolveOrigin(null, getLocale('/it/it/homepage')));
  assert.deepEqual([ita.code, ita.from], ['ROM', 'home']);
  setHost('discover.turnsthe.page', '/xx/fr/homepage');
  const discover = await onPage({ brand: 'discover' }, async () => resolveOrigin(null, getLocale('/xx/fr/homepage')));
  assert.deepEqual([discover.code, discover.from], ['FRA', 'home']);
});

test('lh-com: its market\'s recorded default airport, as before', async () => {
  live = null;
  setHost('lufthansa.turnsthe.page', '/de/en/homepage');
  const lh = await onPage({}, async () => resolveOrigin(null, getLocale('/de/en/homepage')));
  assert.equal(lh.code, 'FRA');
  assert.equal(lh.from, 'defaultAirport');
});

test('an authored origin wins everywhere', async () => {
  const o = await onPage({ brand: 'ita' }, async () => resolveOrigin({ code: 'MIL', name: 'Milano' }, getLocale('/it/it/homepage')));
  assert.equal(o.code, 'MIL');
});

test('the flight search: a brand root without an authored origin prefills its home airport', async () => {
  live = null;
  setHost('discover.turnsthe.page', '/xx/fr/homepage');
  const { loadFlightSearchData } = await import('../blocks/flight-search/flight-search.js');
  const fs = await onPage({ brand: 'discover' }, async () => {
    const locale = getLocale('/xx/fr/homepage');
    return loadFlightSearchData({ fallbackOrigin: locale.homeAirport }, locale);
  });
  assert.equal(fs.origin.code, 'FRA');
  assert.equal(fs.sources.defaultAirport, 'none');
  setHost('lufthansa.turnsthe.page', '/de/en/homepage');
  const lh = await onPage({}, async () => loadFlightSearchData({ fallbackOrigin: 'FRA' }, getLocale('/de/en/homepage')));
  assert.equal(lh.origin.code, 'FRA');
  assert.equal(lh.sources.defaultAirport, 'recorded', 'lh-com: its recording, as before');
});
