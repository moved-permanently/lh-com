/* eslint-disable max-len */
// Brussels Airlines (brief 461): www's /extra-services/upgrades on each market root links the root's
// own fix-price-upgrade artifact (https://www.brusselsairlines.com/artifacts/flight-upgrades/
// fix-price-upgrade/<cc>-<ll>; lv-en, ao-fr). The market route serves a root the language version's
// document, which names the version's artifact (be-en, be-fr): for the brussels site only, a link
// with that path prefix and the source's <cc>-<ll> becomes the serving root's, on www or relative;
// nothing else changes. A root without an artifact on www keeps the version's link (www's 92 roots
// read on 2026-11-07: 90 link their own, bf/en and bf/fr none); a root's own document is served
// as it is.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import {
  resetMarketCache, upgradeArtifactHref, UPGRADE_ARTIFACT_SITES, UPGRADE_ARTIFACT_MISSING,
} from '../src/markets.js';

globalThis.HTMLRewriter = HTMLRewriter;

const BRUSSELS = 'main--lh-brussels--moved-permanently.aem.live';
const AUSTRIAN = 'main--lh-austrian--moved-permanently.aem.live';
const VARS = {
  SITE_HOSTS: 'austrian.example=austrian; brussels.example=brussels',
  SITE_ORIGINS: `austrian=${AUSTRIAN}; brussels=${BRUSSELS}`,
  SITE_WWW_HOSTS: 'austrian=www.austrian.com; brussels=www.brusselsairlines.com',
  SITE_DESIGN_HOSTS: 'austrian=www.lufthansa.com; brussels=www.lufthansa.com',
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
const page = (path, body) => `<!DOCTYPE html><html><head><title>${path}</title><link rel="canonical" href="https://${BRUSSELS}${path}"></head><body><main>${body}</main></body></html>`;
const A = '/artifacts/flight-upgrades/fix-price-upgrade';
const WWW = 'https://www.brusselsairlines.com';
const upgrades = (cc, ll) => page(`/${cc}/${ll}/extra-services/upgrades`, [
  `<a href="${WWW}${A}/${cc}-${ll}">Book your upgrade now!</a>`,
  `<a href="${A}/${cc}-${ll}?src=page">relative</a>`,
  `<a href="${WWW}/artifacts/flight-upgrades/other/${cc}-${ll}">another artifact</a>`,
  `<a href="${WWW}${A}/${cc}-${ll}x">not the root's code</a>`,
  `<a href="/${cc}/${ll}/extra-services/upgrades/terms-and-conditions-upgrade">terms</a>`,
].join(''));
const FILES = {
  '/be/en/search-index.json': sheet([row('/be/en/homepage'), row('/be/en/extra-services/upgrades'), row('/be/en/extra-services/upgrades/terms-and-conditions-upgrade')]),
  '/be/fr/search-index.json': sheet([row('/be/fr/extra-services/upgrades')]),
  '/de/de/search-index.json': sheet([]),
  '/market-pages.json': sheet([row('/bf/en/extra-services/upgrades')]),
  '/be/en/extra-services/upgrades': upgrades('be', 'en'),
  '/be/fr/extra-services/upgrades': upgrades('be', 'fr'),
  '/bf/en/extra-services/upgrades': page('/bf/en/extra-services/upgrades', `<a href="${WWW}${A}/bf-en">own</a>`),
};
beforeEach(() => {
  resetMarketCache();
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input, init);
    const u = new URL(req.url);
    if (u.hostname === BRUSSELS) {
      const f = FILES[u.pathname];
      if (f && typeof f === 'object') return Response.json(f);
      if (f) return new Response(f, { headers: { 'content-type': 'text/html; charset=utf-8' } });
    }
    return new Response('<html>404</html>', { status: 404, headers: { 'content-type': 'text/html' } });
  };
});
const get = (url) => worker.fetch(new Request(url), env(), { waitUntil() {} });
const hrefs = (html) => [...html.matchAll(/<a href="([^"]*)"/g)].map((m) => m[1].replace(/&amp;/g, '&'));

test('lv/en: the version\'s artifact link becomes the root\'s, on www and relative; other links as before', async () => {
  const res = await get('https://brussels.example/lv/en/extra-services/upgrades');
  assert.equal(res.status, 200);
  assert.deepEqual(hrefs(await res.text()), [
    `${WWW}${A}/lv-en`,
    `${A}/lv-en?src=page`,
    `${WWW}/artifacts/flight-upgrades/other/be-en`,
    `${WWW}${A}/be-enx`,
    '/lv/en/extra-services/upgrades/terms-and-conditions-upgrade',
  ]);
});

test('cd/fr and ao/fr from be/fr\'s document', async () => {
  const pages = await Promise.all(['cd/fr', 'ao/fr'].map(async (root) => (await get(`https://brussels.example/${root}/extra-services/upgrades`)).text()));
  assert.deepEqual(pages.map((html) => hrefs(html)[0]), [`${WWW}${A}/cd-fr`, `${WWW}${A}/ao-fr`]);
});

test('a root\'s own document is served as it is (bf/en)', async () => {
  const html = await (await get('https://brussels.example/bf/en/extra-services/upgrades')).text();
  assert.deepEqual(hrefs(html), [`${WWW}${A}/bf-en`]);
});

test('the helper: only the prefix with the source\'s code, on www or relative; brussels only; missing roots listed', () => {
  assert.equal(upgradeArtifactHref(`${WWW}${A}/be-en`, 'be/en', 'lv/en', 'www.brusselsairlines.com'), `${WWW}${A}/lv-en`);
  assert.equal(upgradeArtifactHref(`${A}/be-fr#x`, 'be/fr', 'cd/fr', 'www.brusselsairlines.com'), `${A}/cd-fr#x`);
  assert.equal(upgradeArtifactHref(`${A}/be-fr/`, 'be/fr', 'cd/fr', 'www.brusselsairlines.com'), `${A}/cd-fr/`);
  assert.equal(upgradeArtifactHref(`${WWW}${A}/de-de`, 'be/en', 'lv/en', 'www.brusselsairlines.com'), null);
  assert.equal(upgradeArtifactHref(`https://www.example.com${A}/be-en`, 'be/en', 'lv/en', 'www.brusselsairlines.com'), null);
  assert.equal(upgradeArtifactHref('/be/en/extra-services/upgrades', 'be/en', 'lv/en', 'www.brusselsairlines.com'), null);
  assert.deepEqual([...UPGRADE_ARTIFACT_SITES], ['brussels']);
  assert.ok(UPGRADE_ARTIFACT_MISSING instanceof Set);
});

test('a root without an artifact on www keeps the version\'s link', async () => {
  assert.deepEqual([...UPGRADE_ARTIFACT_MISSING], ['bf/en', 'bf/fr']);
  // bf/fr without a document of its own here: be/fr's, its link as be/fr's
  const html = await (await get('https://brussels.example/bf/fr/extra-services/upgrades')).text();
  assert.equal(hrefs(html)[0], `${WWW}${A}/be-fr`);
});
