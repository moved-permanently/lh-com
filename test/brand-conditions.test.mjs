/* eslint-disable max-len */
/* The conditions of the fare widgets on a brand page (blocks/fare-teaser loadFareTeaserData,
   blocks/destination-finder loadFinderContext): catalogs/conditions live, else none; a recorded
   answer is another market's (the recordings are lh-com's: at/de's German conditions for every
   brand root, as ITA's it/en, it/it and nl/nl pages showed them), never the brand's. lh-com as
   before: the recording.
   Run: node --max-old-space-size=512 --test test/brand-conditions.test.mjs */
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
const { getLocale } = await import('../scripts/locale.js');
const { loadFareTeaserData } = await import('../blocks/fare-teaser/fare-teaser.js');
const { loadFinderContext } = await import('../blocks/destination-finder/destination-finder.js');

const INDEX = { entries: { 'at/de|GET /service/api/catalogs/conditions': { file: 'cond.json', recordedAt: '2026-10-21' } } };
const RECORDED = { conditionsHeadline: 'Allgemeine Bedingungen', conditions: '<p>Die angezeigten Preise können abweichen.</p>', footerText: '*Die Preise, einschließlich aller Steuern' };
globalThis.fetch = async (input) => {
  const u = new URL(typeof input === 'string' ? input : input.url, 'https://ita.turnsthe.page');
  if (u.pathname === '/data/recorded/index.json') return Response.json(INDEX);
  if (u.pathname === '/data/recorded/cond.json') return Response.json(RECORDED);
  return new Response('blocked', { status: 403 });
};

function onPage(meta, fn) {
  const rows = Object.entries(meta).map(([k, v]) => `<meta name="${k}" content="${v}">`).join('');
  const { document } = parseHTML(`<!DOCTYPE html><html><head>${rows}</head><body></body></html>`);
  globalThis.document = document;
  return Promise.resolve(fn()).finally(() => { delete globalThis.document; });
}

const SETTINGS = {
  origin: 'ROM', destinations: [{ destination: 'DXB' }], tripDuration: 7, cabin: 'E', tripType: 'RETURN', travelMonths: '1,2,3',
};

test('fare teaser on a brand root: no conditions from another market\'s recording', async () => {
  setHost('ita.turnsthe.page', '/be/it/homepage-new');
  const data = await onPage({ brand: 'ita' }, async () => loadFareTeaserData(SETTINGS, getLocale('/be/it/homepage-new')));
  assert.deepEqual(data.conditions, { headline: '', html: '', footerText: '' });
  assert.equal(data.sources.conditions, 'none');
});

test('destination finder on a brand root: no conditions from another market\'s recording', async () => {
  setHost('ita.turnsthe.page', '/it/en/homepage');
  const ctx = await onPage({ brand: 'ita' }, async () => loadFinderContext(getLocale('/it/en/homepage')));
  assert.equal(ctx.conditions.html, '');
  assert.equal(ctx.conditions.footerText, '');
  assert.equal(ctx.sources.conditions, 'none');
});

test('lh-com: the recorded conditions, as before', async () => {
  setHost('lufthansa.turnsthe.page', '/de/de/homepage');
  const data = await onPage({}, async () => loadFareTeaserData({ ...SETTINGS, origin: 'FRA' }, getLocale('/de/de/homepage')));
  assert.equal(data.conditions.headline, 'Allgemeine Bedingungen');
  assert.equal(data.sources.conditions, 'recorded');
  const ctx = await onPage({}, async () => loadFinderContext(getLocale('/de/de/homepage')));
  assert.equal(ctx.conditions.footerText, '*Die Preise, einschließlich aller Steuern');
  assert.equal(ctx.sources.conditions, 'recorded');
});
