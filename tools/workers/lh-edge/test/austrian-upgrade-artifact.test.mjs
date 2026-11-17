/* eslint-disable max-len */
// Austrian (standing order 62): as Brussels' and SWISS's, www's upgrades page on a market root links
// the root's own fix-price-upgrade artifact (https://www.austrian.com/artifacts/flight-upgrades/
// fix-price-upgrade/<cc>-<ll>); the market route served the English roots at/en's at-en and ch/de,
// de/de at/de's at-de. With austrian in UPGRADE_ARTIFACT_SITES the link becomes the serving root's.
// A version whose document links <cc>-en (fr/fr: fr-en) keeps it on its roots (ca/fr), as the link
// doesn't name the version; the versions themselves and a root's own document as before.
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
  '/market-pages.json': sheet([row(`/us/en/${UP}`)]),
  [`/at/en/${UP}`]: upgrade('at/en', 'at-en'),
  [`/at/de/${UP}`]: upgrade('at/de', 'at-de'),
  [`/fr/fr/${UP}`]: upgrade('fr/fr', 'fr-en'),
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

test('ca/fr keeps fr/fr\'s fr-en: the link does not name fr-fr', async () => {
  assert.equal(await first('ca/fr'), `${WWW}${A}/fr-en`);
});

test('a root\'s own document is served as it is (us/en)', async () => {
  const html = await (await get(`https://austrian.example/us/en/${UP}`)).text();
  assert.deepEqual(hrefs(html), [`${WWW}${A}/us-en`]);
});
