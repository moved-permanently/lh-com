/* eslint-disable max-len */
// Austrian Airlines (lh-austrian) on its host: the site entry (src/sites.js SITES.austrian), its
// entry paths (SITE_ENTRIES), market roots from the language documents, its DAM paths and fonts
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { resetMarketCache } from '../src/markets.js';
import { siteOf, SITES } from '../src/sites.js';
/* eslint-disable-next-line import/no-relative-packages */
import { edsDamPath } from '../../../../scripts/dam-path.js';

globalThis.HTMLRewriter = HTMLRewriter;

const LH = 'main--lh-com--moved-permanently.aem.live';
const AUSTRIAN = 'main--lh-austrian--moved-permanently.aem.live';
const ITA = 'main--lh-ita--moved-permanently.aem.live';
const AEM = 'https://publish-p1-e2.adobeaemcloud.com';
const VARS = {
  SITE_HOSTS: 'ita.example=ita; austrian.example=austrian',
  SITE_ORIGINS: `ita=${ITA}; austrian=${AUSTRIAN}`,
  SITE_WWW_HOSTS: 'ita=www.ita-airways.com; austrian=www.austrian.com',
  SITE_DESIGN_HOSTS: 'ita=www.ita-airways.com; austrian=www.lufthansa.com',
};
const env = (extra = {}) => ({
  ORIGIN: LH, WWW_HOST: 'www.lufthansa.com', PILOT_HOSTS: '', EDGE_TTL: '60', AEM_PUBLISH: AEM, ...VARS, ...extra,
});
const sheet = (data) => ({
  total: data.length, offset: 0, limit: 1000, data, ':type': 'sheet',
});
const row = (path, extra = {}) => ({
  path, title: path, markets: '', robots: '', 'primary-language-url': '', lastModified: '1793045388', ...extra,
});
const page = (path, body) => `<!DOCTYPE html><html><head><title>${path}</title><link rel="canonical" href="https://${AUSTRIAN}${path}"><meta property="og:url" content="https://${AUSTRIAN}${path}"></head><body><main>${body}</main></body></html>`;
// lh-austrian's origin: at/en and at/de documents with their markets rows as lh-austrian writes
// them (market roots), ca/en's own page, the market roots' own homepages
const FILES = {
  '/at/en/search-index.json': sheet([
    row('/at/en/homepage'),
    row('/at/en/baggage', { markets: 'ch/en, gb/en, us/en, xx/en' }),
    row('/at/en/legal/imprint', { markets: 'ch/en, gb/en, us/en, xx/en' }),
    row('/at/en/fly/vienna-transfer', { markets: 'gb/en' }),
  ]),
  '/at/de/search-index.json': sheet([row('/at/de/gepaeck', { markets: 'ch/de, de/de, xx/de' })]),
  '/market-pages.json': sheet([row('/ca/en/local-page/austrian-in-canada'), row('/xx/en/homepage')]),
  '/at/en/homepage': page('/at/en/homepage', '<h1>at/en homepage</h1>'),
  '/at/de/homepage': page('/at/de/homepage', '<h1>at/de Startseite</h1>'),
  '/at/en/baggage': page('/at/en/baggage', '<h1>Baggage</h1><a href="/at/en/legal/imprint">Imprint</a> <a href="/at/en/fly/vienna-transfer">Transfer</a>'),
  '/at/en/fly/vienna-transfer': page('/at/en/fly/vienna-transfer', '<h1>Transfer</h1>'),
  '/at/de/gepaeck': page('/at/de/gepaeck', '<h1>Gepäck</h1>'),
  '/ca/en/local-page/austrian-in-canada': page('/ca/en/local-page/austrian-in-canada', '<h1>ca/en own page</h1>'),
  '/xx/en/homepage': page('/xx/en/homepage', '<h1>xx/en own homepage</h1>'),
};
const SHARK = '/content/dam/aua/videos/AUAShark_Doku_clean_klein.mp4';
const PDF = '/content/dam/austrian/global/documents/fly/airbus-320/202209_Sitzplan_Seatmap_A320neo.pdf';
const IMAGE = '/content/dam/aua/images/local_variations/videoframe_68866.jpg';
const FONT = '/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/fonts/austrian/CoreSansRegular.woff2';
let calls;
beforeEach(() => {
  resetMarketCache();
  calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input, init);
    const u = new URL(req.url);
    calls.push(`${u.hostname}${u.pathname}`);
    if (req.url.startsWith(AEM)) {
      if (u.pathname !== edsDamPath(SHARK)) return new Response('Not found', { status: 404 });
      return req.headers.get('range') === 'bytes=0-99'
        ? new Response(new Uint8Array(100), { status: 206, headers: { 'content-type': 'video/mp4', 'content-range': 'bytes 0-99/353930000', 'content-length': '100' } })
        : new Response('wrong range', { status: 400 });
    }
    if (u.hostname === 'www.lufthansa.com' && u.pathname === FONT) {
      return new Response(new Uint8Array([119, 79, 70, 50]), { headers: { 'content-type': 'font/woff2', 'cache-control': 'public, max-age=300' } });
    }
    if (u.hostname === AUSTRIAN) {
      if (u.pathname === edsDamPath(PDF)) return new Response('%PDF-1.7', { headers: { 'content-type': 'application/pdf' } });
      if (u.pathname === edsDamPath(IMAGE)) return new Response(new Uint8Array([255, 216]), { headers: { 'content-type': 'image/jpeg' } });
      const f = FILES[u.pathname];
      if (f && typeof f === 'object') return Response.json(f);
      if (f) return new Response(f, { headers: { 'content-type': 'text/html; charset=utf-8' } });
    }
    return new Response('<html>404</html>', { status: 404, headers: { 'content-type': 'text/html' } });
  };
});
const get = (url, init) => worker.fetch(new Request(url, init), env(), { waitUntil() {} });

test('austrian: the site on its host: ten language roots, 54 market roots, no root for the 404 xx homepages or the hreflang-only roots', () => {
  const site = siteOf(new Request('https://austrian.example/at/en/homepage'), env());
  assert.equal(site.name, 'austrian');
  assert.equal(site.origin, AUSTRIAN);
  assert.equal(site.www, 'www.austrian.com');
  assert.equal(site.design, 'www.lufthansa.com');
  assert.deepEqual(site.tables.versions, {
    en: 'at/en', de: 'at/de', fr: 'fr/fr', it: 'it/it', ru: 'ru/ru', zh: 'cn/zh', es: 'es/es', el: 'gr/el', ja: 'jp/ja', pl: 'pl/pl',
  });
  assert.equal(site.tables.marketRoots.length, 54);
  assert.equal(Object.keys(site.tables.table).length, 64);
  assert.deepEqual(SITES.austrian.ownRoots, []);
  ['xx/de', 'xx/el', 'xx/es', 'xx/fr', 'xx/it', 'xx/ja', 'xx/pl', 'xx/ru', 'xx/zh', 'ae/ae', 'be/fr', 'kr/en']
    .forEach((r) => assert.equal(site.tables.table[r], undefined, r));
  assert.equal(site.tables.table['xx/en'].hreflang, 'en');
  assert.equal(site.tables.table['by/ru'].hreflang, 'ru-BY');
  assert.equal(site.tables.table['cn/zh'].hreflang, 'zh-CN');
  assert.equal(site.tables.table['de/de'].documents, 'language');
  // the other sites' hosts keep theirs
  assert.equal(siteOf(new Request('https://ita.example/it/en/homepage'), env()).name, 'ita');
});

test('austrian: a reference root\'s pages from lh-austrian\'s origin, nothing from the others', async () => {
  const en = await get('https://austrian.example/at/en/homepage');
  assert.equal(en.status, 200);
  assert.match(await en.text(), /at\/en homepage/);
  const de = await get('https://austrian.example/at/de/homepage');
  assert.match(await de.text(), /at\/de Startseite/);
  assert.ok(calls.every((c) => c.startsWith(AUSTRIAN)), calls.join(' '));
});

test('austrian: entry paths: /, /xx/en and /at to /at/en/homepage (302); xx/en\'s own homepage stays', async () => {
  const paths = ['/', '/xx/en', '/xx/en/', '/at', '/at/'];
  const answers = await Promise.all(paths.map((p) => get(`https://austrian.example${p}`)));
  answers.forEach((resp, i) => {
    assert.equal(resp.status, 302, paths[i]);
    assert.equal(resp.headers.get('location'), '/at/en/homepage', paths[i]);
    assert.equal(resp.headers.get('x-lh-edge-route'), 'site-entry', paths[i]);
  });
  assert.equal((await get('https://austrian.example/xx/en?x=1')).headers.get('location'), '/at/en/homepage?x=1');
  assert.match(await (await get('https://austrian.example/xx/en/homepage')).text(), /xx\/en own homepage/);
  // ITA's host: its / as before, no Austrian entry path
  assert.equal((await worker.fetch(new Request('https://ita.example/'), env(), { waitUntil() {} })).headers.get('location'), '/it/en/homepage');
  assert.notEqual((await worker.fetch(new Request('https://ita.example/xx/en'), env(), { waitUntil() {} })).status, 302);
});

test('austrian: a market root from its language document where the markets row lists the root', async () => {
  const resp = await get('https://austrian.example/ch/en/baggage');
  assert.equal(resp.status, 200);
  assert.equal(resp.headers.get('x-lh-edge-route'), 'market');
  const html = await resp.text();
  assert.match(html, /<h1>Baggage<\/h1>/);
  assert.match(html, /href="\/ch\/en\/legal\/imprint"/, 'a link into at/en that ch/en serves: ch/en\'s');
  assert.match(html, /href="\/at\/en\/fly\/vienna-transfer"/, 'a page ch/en does not get (markets gb/en): left in at/en');
  assert.match(html, /rel="canonical" href="https:\/\/main--lh-austrian--moved-permanently\.aem\.live\/ch\/en\/baggage"/);
  assert.ok(calls.every((c) => c.startsWith(AUSTRIAN)), 'nothing from lh-com\'s or ITA\'s origin');
  assert.equal((await get('https://austrian.example/ch/en/fly/vienna-transfer')).status, 404);
  assert.equal((await get('https://austrian.example/gb/en/fly/vienna-transfer')).status, 200);
  // German: de/de from at/de
  assert.match(await (await get('https://austrian.example/de/de/gepaeck')).text(), /<h1>Gepäck<\/h1>/);
});

test('austrian: a market root\'s own page from its own document', async () => {
  const resp = await get('https://austrian.example/ca/en/local-page/austrian-in-canada');
  assert.equal(resp.status, 200);
  assert.match(await resp.text(), /ca\/en own page/);
});

test('austrian: DAM paths: the shark video with its Range from AEM (206), a PDF and an image from lh-austrian\'s copies', async () => {
  const video = await get(`https://austrian.example${SHARK}`, { headers: { range: 'bytes=0-99' } });
  assert.equal(video.status, 206);
  assert.equal(video.headers.get('x-lh-edge-route'), 'dam-aem');
  assert.equal(video.headers.get('content-range'), 'bytes 0-99/353930000');
  calls = [];
  const pdf = await get(`https://austrian.example${PDF}`);
  assert.equal(pdf.status, 200);
  assert.equal(await pdf.text(), '%PDF-1.7');
  assert.deepEqual(calls, [`${AUSTRIAN}${edsDamPath(PDF)}`], 'lh-austrian\'s copy, no other origin');
  calls = [];
  const image = await get(`https://austrian.example${IMAGE}`);
  assert.equal(image.status, 200);
  assert.equal(image.headers.get('content-type'), 'image/jpeg');
  assert.ok(calls.every((c) => c.startsWith(AUSTRIAN)), calls.join(' '));
});

test('austrian: the theme\'s fonts from www.lufthansa.com (the same release), never www.austrian.com', async () => {
  const resp = await get(`https://austrian.example${FONT}`);
  assert.equal(resp.status, 200);
  assert.equal(resp.headers.get('content-type'), 'font/woff2');
  assert.ok(calls.length && calls.every((c) => c.startsWith('www.lufthansa.com')), calls.join(' '));
});
