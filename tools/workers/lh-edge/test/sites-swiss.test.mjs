/* eslint-disable max-len */
// SWISS (lh-swiss) on its host swiss.turnsthe.page: the site entry (src/sites.js SITES.swiss from
// BRAND_SITES.swiss: ch's four roots with own documents, the market roots answered from them), its entry
// paths as www.swiss.com sends them (/ and /ch/en to ch/en's homepage, /ch to ch/de's, /xx/<ll>[/homepage]
// and /<ll>/homepage to /ch/<ll>/homepage), its pages from lh-swiss's origin only, a DAM file from
// its copies, the CH Sans fonts and the culinary hub from www.lufthansa.com (the same mausy
// release has fonts/swiss/), the brand's favicon and manifest; the other sites' entries unchanged
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { resetMarketCache } from '../src/markets.js';
import { siteOf, SITES, SITE_ENTRIES } from '../src/sites.js';
/* eslint-disable-next-line import/no-relative-packages */
import { edsDamPath } from '../../../../scripts/dam-path.js';

globalThis.HTMLRewriter = HTMLRewriter;

const SWISS = 'main--lh-swiss--moved-permanently.aem.live';
const BRUSSELS = 'main--lh-brussels--moved-permanently.aem.live';
const VARS = {
  SITE_HOSTS: 'brussels.example=brussels; swiss.example=swiss',
  SITE_ORIGINS: `brussels=${BRUSSELS}; swiss=${SWISS}`,
  SITE_WWW_HOSTS: 'brussels=www.brusselsairlines.com; swiss=www.swiss.com',
  SITE_DESIGN_HOSTS: 'brussels=www.lufthansa.com; swiss=www.lufthansa.com',
};
const env = () => ({
  ORIGIN: 'main--lh-com--moved-permanently.aem.live', WWW_HOST: 'www.lufthansa.com', PILOT_HOSTS: '', EDGE_TTL: '60', AEM_PUBLISH: 'https://publish-p1-e2.adobeaemcloud.com', ...VARS,
});
const page = (path, body) => `<!DOCTYPE html><html><head><title>${path}</title><link rel="manifest" href="/etc/designs/dcep/manifest.json"><link rel="shortcut icon" href="/etc/designs/dcep/favicon.ico" type="image/ico"></head><body><main>${body}</main></body></html>`;
const FILES = {
  '/ch/en/homepage': page('/ch/en/homepage', '<h1>ch/en homepage</h1>'),
  '/ch/de/homepage': page('/ch/de/homepage', '<h1>ch/de Startseite</h1>'),
  '/ch/en/fly/check-in': page('/ch/en/fly/check-in', '<h1>Check-in</h1>'),
};
const PDF = '/content/dam/lx/pdfs/dangerous-goods.pdf';
const FONT = '/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/fonts/swiss/chsans-regular-webfont.woff';
const HUB = '/digitalhangar/onecatering/culinary-hub/culinary-hub-latest.js';
let calls;
beforeEach(() => {
  resetMarketCache();
  calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input, init);
    const u = new URL(req.url);
    calls.push(`${u.hostname}${u.pathname}`);
    if (u.hostname === 'www.lufthansa.com' && u.pathname === FONT) return new Response(new Uint8Array([119, 79, 70, 70]), { headers: { 'content-type': 'font/woff' } });
    if (u.hostname === 'www.lufthansa.com' && u.pathname === HUB) return new Response('/* hub */', { headers: { 'content-type': 'text/javascript' } });
    if (u.hostname === SWISS) {
      if (u.pathname === edsDamPath(PDF)) return new Response('%PDF-1.7', { headers: { 'content-type': 'application/pdf' } });
      const f = FILES[u.pathname];
      if (f) return new Response(f, { headers: { 'content-type': 'text/html; charset=utf-8' } });
    }
    return new Response('<html>404</html>', { status: 404, headers: { 'content-type': 'text/html' } });
  };
});
const get = (url, init) => worker.fetch(new Request(url, init), env(), { waitUntil() {} });

test('swiss: the site on its host: ch\'s four roots with their own documents, the 204 market roots (SWISS_MARKETS_LIVE) from them', () => {
  const site = siteOf(new Request('https://swiss.example/ch/en/homepage'), env());
  assert.equal(site.name, 'swiss');
  assert.equal(site.origin, SWISS);
  assert.equal(site.www, 'www.swiss.com');
  assert.equal(site.design, 'www.lufthansa.com');
  assert.deepEqual(site.tables.versions, {
    en: 'ch/en', de: 'ch/de', fr: 'ch/fr', it: 'ch/it',
  });
  assert.deepEqual(Object.keys(site.tables.table).slice(0, 4), ['ch/en', 'ch/de', 'ch/fr', 'ch/it']);
  assert.deepEqual(Object.keys(site.tables.table).filter((r) => site.tables.table[r].documents === 'own'), ['ch/en', 'ch/de', 'ch/fr', 'ch/it']);
  assert.equal(SITES.swiss.marketRoots.length, 204);
  assert.ok(SITES.swiss.marketRoots.every((r) => site.tables.versions[r.split('/')[1]]), 'only languages lh-swiss has');
  assert.equal(siteOf(new Request('https://brussels.example/be/en/homepage'), env()).name, 'brussels');
});

test('swiss: its pages from lh-swiss\'s origin only, with SWISS\'s favicon and manifest', async () => {
  const en = await get('https://swiss.example/ch/en/homepage');
  assert.equal(en.status, 200);
  const html = await en.text();
  assert.match(html, /ch\/en homepage/);
  assert.match(html, /<link rel="manifest" href="\/etc\/designs\/lx\/manifest\.json">/);
  assert.match(html, /<link rel="shortcut icon" href="\/etc\/designs\/lx\/favicon\.ico" type="image\/ico">/);
  assert.match(await (await get('https://swiss.example/ch/de/homepage')).text(), /ch\/de Startseite/);
  assert.match(await (await get('https://swiss.example/ch/en/fly/check-in')).text(), /<h1>Check-in<\/h1>/);
  assert.ok(calls.every((c) => c.startsWith(SWISS)), calls.join(' '));
});

test('swiss: entry paths as www.swiss.com sends them (302); a homepage path stays', async () => {
  const expect = {
    '/': '/ch/en/homepage',
    '/ch': '/ch/de/homepage',
    '/ch/': '/ch/de/homepage',
    '/ch/en': '/ch/en/homepage',
    '/ch/en/': '/ch/en/homepage',
    '/ch/de': '/ch/de/homepage',
    '/ch/de/': '/ch/de/homepage',
    '/xx/en': '/ch/en/homepage',
    '/xx/de': '/ch/de/homepage',
    '/xx/de/': '/ch/de/homepage',
    '/xx/de/homepage': '/ch/de/homepage',
    '/en/homepage': '/ch/en/homepage',
    '/de/homepage': '/ch/de/homepage',
    // brief 272: ch/fr and ch/it as the pilot's roots
    '/ch/fr': '/ch/fr/homepage',
    '/ch/it/': '/ch/it/homepage',
    '/xx/fr': '/ch/fr/homepage',
    '/xx/it/homepage': '/ch/it/homepage',
    '/fr/homepage': '/ch/fr/homepage',
    '/it/homepage': '/ch/it/homepage',
  };
  const answers = await Promise.all(Object.keys(expect).map((p) => get(`https://swiss.example${p}`)));
  answers.forEach((resp, i) => {
    const p = Object.keys(expect)[i];
    assert.equal(resp.status, 302, p);
    assert.equal(resp.headers.get('location'), expect[p], p);
    assert.equal(resp.headers.get('x-lh-edge-route'), 'site-entry', p);
  });
  assert.equal((await get('https://swiss.example/ch/de?x=1')).headers.get('location'), '/ch/de/homepage?x=1');
  assert.equal((await get('https://swiss.example/ch/en/homepage')).status, 200);
  assert.notEqual((await get('https://swiss.example/ch/es')).status, 302, 'ch/es is no root of the site yet');
  // ch/es and ch/pt as pilots (scripts/brands.js SWISS_LANGUAGES_LIVE off): no entry of theirs
  ['/ch/es', '/ch/pt/', '/xx/es', '/xx/pt/homepage', '/es/homepage', '/pt/homepage'].forEach((p) => assert.equal(SITE_ENTRIES.swiss[p], undefined, p));
  assert.equal(SITES.swiss.table['ch/pt'], undefined);
  // the other sites' entries as before, none of SWISS's
  assert.equal((await get('https://brussels.example/ch')).headers.get('location'), '/ch/en/homepage');
  assert.equal((await get('https://brussels.example/xx/en')).headers.get('location'), '/be/en/homepage');
  Object.entries(SITE_ENTRIES).filter(([name]) => name !== 'swiss').forEach(([name, entries]) => {
    assert.ok(!Object.keys(entries).some((p) => /^\/(en|de|fr|it)\/homepage$/.test(p)), name);
  });
});

test('swiss: a PDF from lh-swiss\'s copies; the CH Sans fonts and the culinary hub from www.lufthansa.com', async () => {
  const pdf = await get(`https://swiss.example${PDF}`);
  assert.equal(pdf.status, 200);
  assert.equal(await pdf.text(), '%PDF-1.7');
  assert.deepEqual(calls, [`${SWISS}${edsDamPath(PDF)}`]);
  for (const p of [FONT, HUB]) { // eslint-disable-line no-restricted-syntax
    calls = [];
    // eslint-disable-next-line no-await-in-loop
    const resp = await get(`https://swiss.example${p}`);
    assert.equal(resp.status, 200, p);
    assert.ok(calls.length && calls.every((c) => c.startsWith('www.lufthansa.com')), calls.join(' '));
  }
});
