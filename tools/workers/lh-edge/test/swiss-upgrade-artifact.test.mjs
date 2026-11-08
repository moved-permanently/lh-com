/* eslint-disable max-len */
// SWISS (brief 493): as Brussels' (brief 461), www's upgrade-in-to-business-class page on a market
// root links the root's own fix-price-upgrade artifact (https://www.swiss.com/artifacts/
// flight-upgrades/fix-price-upgrade/<cc>-<ll>: cz-it, de-de); the market route served every root
// ch's language version, so all of them linked ch-it, ch-de, ch-en. With swiss in
// UPGRADE_ARTIFACT_SITES the link becomes the serving root's; other sites, other links and a root's
// own document as before.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { resetMarketCache, UPGRADE_ARTIFACT_SITES } from '../src/markets.js';

globalThis.HTMLRewriter = HTMLRewriter;

const SWISS = 'main--lh-swiss--moved-permanently.aem.live';
const AUSTRIAN = 'main--lh-austrian--moved-permanently.aem.live';
const VARS = {
  SITE_HOSTS: 'austrian.example=austrian; swiss.example=swiss',
  SITE_ORIGINS: `austrian=${AUSTRIAN}; swiss=${SWISS}`,
  SITE_WWW_HOSTS: 'austrian=www.austrian.com; swiss=www.swiss.com',
  SITE_DESIGN_HOSTS: 'austrian=www.lufthansa.com; swiss=www.swiss.com',
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
const UP = 'book-and-manage/swiss-choice/upgrade-options/upgrade-in-to-business-class';
const page = (path, body) => `<!DOCTYPE html><html><head><title>${path}</title><link rel="canonical" href="https://${SWISS}${path}"></head><body><main>${body}</main></body></html>`;
const A = '/artifacts/flight-upgrades/fix-price-upgrade';
const WWW = 'https://www.swiss.com';
const upgrade = (ll) => page(`/ch/${ll}/${UP}`, `<a href="${WWW}${A}/ch-${ll}">Upgrade now</a><a href="/ch/${ll}/book-and-manage/conditions/upgrade-conditions">conditions</a>`);
const FILES = {
  '/ch/it/search-index.json': sheet([row('/ch/it/homepage'), row(`/ch/it/${UP}`), row('/ch/it/book-and-manage/conditions/upgrade-conditions')]),
  '/ch/de/search-index.json': sheet([row(`/ch/de/${UP}`)]),
  '/ch/en/search-index.json': sheet([row(`/ch/en/${UP}`)]),
  '/market-pages.json': sheet([row(`/br/pt/${UP}`)]),
  [`/ch/it/${UP}`]: upgrade('it'),
  [`/ch/de/${UP}`]: upgrade('de'),
  [`/ch/en/${UP}`]: upgrade('en'),
  [`/br/pt/${UP}`]: page(`/br/pt/${UP}`, `<a href="${WWW}${A}/br-pt">own</a>`),
};
beforeEach(() => {
  resetMarketCache();
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input, init);
    const u = new URL(req.url);
    if (u.hostname === SWISS) {
      const f = FILES[u.pathname];
      if (f && typeof f === 'object') return Response.json(f);
      if (f) return new Response(f, { headers: { 'content-type': 'text/html; charset=utf-8' } });
    }
    return new Response('<html>404</html>', { status: 404, headers: { 'content-type': 'text/html' } });
  };
});
const get = (url) => worker.fetch(new Request(url), env(), { waitUntil() {} });
const hrefs = (html) => [...html.matchAll(/<a href="([^"]*)"/g)].map((m) => m[1].replace(/&amp;/g, '&'));

test('swiss is a site with per-root artifacts', () => {
  assert.ok(UPGRADE_ARTIFACT_SITES.has('swiss'));
  assert.ok(UPGRADE_ARTIFACT_SITES.has('brussels'));
});

test('cz/it from ch/it\'s document links cz-it; its other links as before', async () => {
  const res = await get(`https://swiss.example/cz/it/${UP}`);
  assert.equal(res.status, 200);
  const links = hrefs(await res.text());
  assert.equal(links[0], `${WWW}${A}/cz-it`);
  assert.ok(!links[1].includes(A), 'the conditions link is no artifact');
});

test('de/de and gb/en from ch/de and ch/en', async () => {
  const pages = await Promise.all(['de/de', 'gb/en'].map(async (root) => (await get(`https://swiss.example/${root}/${UP}`)).text()));
  assert.deepEqual(pages.map((html) => hrefs(html)[0]), [`${WWW}${A}/de-de`, `${WWW}${A}/gb-en`]);
});

test('a root\'s own document is served as it is (br/pt)', async () => {
  const html = await (await get(`https://swiss.example/br/pt/${UP}`)).text();
  assert.deepEqual(hrefs(html), [`${WWW}${A}/br-pt`]);
});
