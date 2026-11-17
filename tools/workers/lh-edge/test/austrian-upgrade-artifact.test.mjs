/* eslint-disable max-len */
// Austrian (standing order 62): as Brussels' and SWISS's, www's upgrades page on a market root links
// the root's own fix-price-upgrade artifact (https://www.austrian.com/artifacts/flight-upgrades/
// fix-price-upgrade/<cc>-<ll>); the market route served the English roots at/en's at-en and ch/de,
// de/de at/de's at-de. With austrian in UPGRADE_ARTIFACT_SITES the link becomes the serving root's.
// Standing order 63: the four roots served from fr/fr, it/it and ru/ru, whose documents link
// <ll>-en, link their own too (ca-fr, ch-fr, ch-it, by-ru: www's, each answering 200); the
// versions themselves keep theirs, and a root's own document as before.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { resetMarketCache, UPGRADE_ARTIFACT_SITES } from '../src/markets.js';

globalThis.HTMLRewriter = HTMLRewriter;

const AUSTRIAN = 'main--lh-austrian--moved-permanently.aem.live';
const VARS = {
  SITE_HOSTS: 'austrian.example=austrian',
  SITE_ORIGINS: `austrian=${AUSTRIAN}`,
  SITE_WWW_HOSTS: 'austrian=www.austrian.com',
  SITE_DESIGN_HOSTS: 'austrian=www.lufthansa.com',
};
const env = () => ({
  ORIGIN: 'main--lh-com--moved-permanently.aem.live', WWW_HOST: 'www.lufthansa.com', PILOT_HOSTS: '', EDGE_TTL: '60', AEM_PUBLISH: 'https://publish-p1-e2.adobeaemcloud.com', ...VARS,
});
const sheet = (data) => ({
  total: data.length, offset: 0, limit: 1000, data, ':type': 'sheet',
});
const row = (path, extra = {}) => ({
  path, title: path, markets: '', robots: '', 'primary-language-url': '', lastModified: '1793045388', ...extra,
});
const UP = 'upgrades';
const page = (path, body) => `<!DOCTYPE html><html><head><title>${path}</title><link rel="canonical" href="https://${AUSTRIAN}${path}"></head><body><main>${body}</main></body></html>`;
const A = '/artifacts/flight-upgrades/fix-price-upgrade';
const WWW = 'https://www.austrian.com';
const upgrade = (version, code) => page(`/${version}/${UP}`, `<a href="${WWW}${A}/${code}">Upgrade</a><a href="/${version}/info/upgrade-conditions">conditions</a>`);
const FILES = {
  '/at/en/search-index.json': sheet([row('/at/en/homepage'), row(`/at/en/${UP}`), row('/at/en/info/upgrade-conditions')]),
  '/at/de/search-index.json': sheet([row(`/at/de/${UP}`)]),
  '/fr/fr/search-index.json': sheet([row(`/fr/fr/${UP}`)]),
  '/it/it/search-index.json': sheet([row(`/it/it/${UP}`)]),
  '/ru/ru/search-index.json': sheet([row(`/ru/ru/${UP}`)]),
  '/market-pages.json': sheet([row(`/us/en/${UP}`)]),
  [`/at/en/${UP}`]: upgrade('at/en', 'at-en'),
  [`/at/de/${UP}`]: upgrade('at/de', 'at-de'),
  [`/fr/fr/${UP}`]: upgrade('fr/fr', 'fr-en'),
  [`/it/it/${UP}`]: upgrade('it/it', 'it-en'),
  [`/ru/ru/${UP}`]: upgrade('ru/ru', 'ru-en'),
  [`/us/en/${UP}`]: page(`/us/en/${UP}`, `<a href="${WWW}${A}/us-en">own</a>`),
};
beforeEach(() => {
  resetMarketCache();
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input, init);
    const u = new URL(req.url);
    if (u.hostname === AUSTRIAN) {
      const f = FILES[u.pathname];
      if (f && typeof f === 'object') return Response.json(f);
      if (f) return new Response(f, { headers: { 'content-type': 'text/html; charset=utf-8' } });
    }
    return new Response('<html>404</html>', { status: 404, headers: { 'content-type': 'text/html' } });
  };
});
const get = (url) => worker.fetch(new Request(url), env(), { waitUntil() {} });
const hrefs = (html) => [...html.matchAll(/<a href="([^"]*)"/g)].map((m) => m[1].replace(/&amp;/g, '&'));
const first = async (root) => hrefs(await (await get(`https://austrian.example/${root}/${UP}`)).text())[0];

test('austrian is a site with per-root artifacts', () => {
  assert.ok(UPGRADE_ARTIFACT_SITES.has('austrian'));
});

test('gb/en from at/en\'s document links gb-en; its other links as before', async () => {
  const res = await get(`https://austrian.example/gb/en/${UP}`);
  assert.equal(res.status, 200);
  const links = hrefs(await res.text());
  assert.equal(links[0], `${WWW}${A}/gb-en`);
  assert.ok(!links[1].includes(A), 'the conditions link is no artifact');
});

test('xx/en, ch/de and de/de link their own', async () => {
  const got = await Promise.all(['xx/en', 'ch/de', 'de/de'].map(first));
  assert.deepEqual(got, [`${WWW}${A}/xx-en`, `${WWW}${A}/ch-de`, `${WWW}${A}/de-de`]);
});

test('the versions themselves keep their links (at/en, at/de)', async () => {
  const got = await Promise.all(['at/en', 'at/de'].map(first));
  assert.deepEqual(got, [`${WWW}${A}/at-en`, `${WWW}${A}/at-de`]);
});

test('ca/fr, ch/fr, ch/it and by/ru link their own, not the version\'s <ll>-en', async () => {
  const got = await Promise.all(['ca/fr', 'ch/fr', 'ch/it', 'by/ru'].map(first));
  assert.deepEqual(got, ['ca-fr', 'ch-fr', 'ch-it', 'by-ru'].map((c) => `${WWW}${A}/${c}`));
});

test('the versions fr/fr, it/it and ru/ru keep their links', async () => {
  const got = await Promise.all(['fr/fr', 'it/it', 'ru/ru'].map(first));
  assert.deepEqual(got, ['fr-en', 'it-en', 'ru-en'].map((c) => `${WWW}${A}/${c}`));
});

test('ch/it\'s other links as before', async () => {
  const links = hrefs(await (await get(`https://austrian.example/ch/it/${UP}`)).text());
  assert.ok(!links[1].includes(A), 'the conditions link is no artifact');
  assert.ok(!links[1].includes('ch-it'));
});

test('a root\'s own document is served as it is (us/en)', async () => {
  const html = await (await get(`https://austrian.example/us/en/${UP}`)).text();
  assert.deepEqual(hrefs(html), [`${WWW}${A}/us-en`]);
});
