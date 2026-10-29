/* eslint-disable max-len */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { resetMarketCache } from '../src/markets.js';
import { siteOf, SITES } from '../src/sites.js';

globalThis.HTMLRewriter = HTMLRewriter;

const LH = 'main--lh-com--moved-permanently.aem.live';
const DISCOVER = 'main--lh-discover--moved-permanently.aem.live';
const SITE_VARS = { SITE_HOSTS: 'discover.example=discover', SITE_ORIGINS: `discover=${DISCOVER}`, SITE_WWW_HOSTS: 'discover=www.discover-airlines.com' };
const env = (extra = {}) => ({
  ORIGIN: LH, WWW_HOST: 'www.lufthansa.com', PILOT_HOSTS: 'lhedge.example', EDGE_TTL: '60', ...extra,
});
const sheet = (data) => ({
  total: data.length, offset: 0, limit: 1000, data, ':type': 'sheet',
});
const row = (path, extra = {}) => ({
  path, title: path, markets: '', robots: '', 'primary-language-url': '', lastModified: '1793045388', ...extra,
});
const page = (path, body) => `<!DOCTYPE html><html><head><title>${path}</title><link rel="canonical" href="https://${DISCOVER}${path}"><meta property="og:url" content="https://${DISCOVER}${path}"></head><body><main>${body}</main></body></html>`;
// the Discover origin: de/en and de/de language documents, us/en's own homepage
const DISCOVER_FILES = {
  '/de/en/search-index.json': sheet([row('/de/en/homepage'), row('/de/en/book/baggage'), row('/de/en/book/north-america-promotion', { markets: 'de' }), row('/de/en/legal/imprint')]),
  '/de/de/search-index.json': sheet([row('/de/de/homepage'), row('/de/de/book/baggage')]),
  '/xx/fr/search-index.json': sheet([row('/xx/fr/homepage'), row('/xx/fr/book/baggage')]),
  '/market-pages.json': sheet([row('/us/en/homepage'), row('/us/en/cancun-premium-promotion')]),
  '/de/en/book/baggage': page('/de/en/book/baggage', '<h1>Baggage</h1><a href="/de/en/legal/imprint">Imprint</a> <a href="/de/en/book/north-america-promotion">promo</a> <a href="https://www.discover-airlines.com/de/en/unmigrated">www</a>'),
  '/de/en/book/north-america-promotion': page('/de/en/book/north-america-promotion', '<h1>Promo</h1>'),
  '/us/en/homepage': page('/us/en/homepage', '<h1>us/en own homepage</h1>'),
  '/de/en/homepage': page('/de/en/homepage', '<h1>de/en homepage</h1>'),
};
let calls;
beforeEach(() => {
  resetMarketCache();
  calls = [];
  globalThis.fetch = async (input) => {
    const req = input instanceof Request ? input : new Request(input);
    const u = new URL(req.url);
    calls.push(`${u.hostname}${u.pathname}`);
    if (u.hostname === DISCOVER) {
      const f = DISCOVER_FILES[u.pathname];
      if (f && typeof f === 'object') return Response.json(f);
      if (f) return new Response(f, { headers: { 'content-type': 'text/html; charset=utf-8' } });
      return new Response('<html>404</html>', { status: 404, headers: { 'content-type': 'text/html' } });
    }
    return new Response(`lh-com ${u.pathname}`, { headers: { 'content-type': 'text/html' } });
  };
});
const get = (url, e = env(SITE_VARS)) => worker.fetch(new Request(url), e, { waitUntil() {} });

test('sites: a host is a site only with SITE_HOSTS and a valid origin in SITE_ORIGINS', () => {
  const req = new Request('https://discover.example/us/en/homepage');
  assert.equal(siteOf(req, env()), null);
  assert.equal(siteOf(req, env({ SITE_HOSTS: 'discover.example=discover' })), null, 'no origin');
  assert.equal(siteOf(req, env({ ...SITE_VARS, SITE_ORIGINS: 'discover=evil.example.com' })), null, 'not an aem.live origin');
  assert.equal(siteOf(req, env({ ...SITE_VARS, SITE_HOSTS: 'discover.example=nosuchsite' })), null);
  // the preview origin, as ORIGIN's check allows it (wrangler dev against documents on preview)
  assert.equal(siteOf(req, env({ ...SITE_VARS, SITE_ORIGINS: 'discover=main--lh-discover--moved-permanently.aem.page' })).origin, 'main--lh-discover--moved-permanently.aem.page');
  const site = siteOf(req, env(SITE_VARS));
  assert.equal(site.name, 'discover');
  assert.equal(site.origin, DISCOVER);
  assert.deepEqual(site.tables.marketRoots, ['us/en', 'ca/en', 'xx/en', 'us/de', 'xx/de', 'ca/fr']);
  assert.deepEqual(SITES.discover.ownRoots, []);
});

test('sites: without the vars a Discover host is answered as before (lh-com\'s origin)', async () => {
  const resp = await get('https://discover.example/us/en/book/baggage', env());
  assert.equal(await resp.text(), 'lh-com /us/en/book/baggage');
  assert.ok(calls.every((c) => !c.startsWith(DISCOVER)));
});

test('sites: a market root on the site\'s host from the language document, links and alternates of the site\'s table', async () => {
  const resp = await get('https://discover.example/us/en/book/baggage');
  assert.equal(resp.status, 200);
  assert.equal(resp.headers.get('x-lh-edge-route'), 'market');
  const html = await resp.text();
  assert.match(html, /<h1>Baggage<\/h1>/);
  assert.match(html, /href="\/us\/en\/legal\/imprint"/, 'a link into the language version the root serves: the root\'s');
  assert.match(html, /href="\/de\/en\/book\/north-america-promotion"/, 'a page the root does not get (markets de): left in the language version');
  assert.match(html, /href="https:\/\/www\.discover-airlines\.com\/us\/en\/unmigrated"/, 'www links go to www\'s market root (the site\'s www host)');
  assert.match(html, /rel="canonical" href="https:\/\/main--lh-discover--moved-permanently\.aem\.live\/us\/en\/book\/baggage"/);
  const langs = [...html.matchAll(/hreflang="([^"]+)"/g)].map((m) => m[1]);
  // every root of the site's table that has the page, both languages (as www's sitemaps)
  assert.deepEqual(langs.sort(), ['de', 'de-DE', 'de-US', 'en', 'en-CA', 'en-DE', 'en-US', 'fr', 'fr-CA']);
  assert.ok(calls.every((c) => !c.startsWith(LH)), 'nothing from lh-com\'s origin');
  // the root's own document first; a page its markets value excludes: the root's 404
  assert.match(await (await get('https://discover.example/us/en/homepage')).text(), /us\/en own homepage/);
  assert.equal((await get('https://discover.example/us/en/book/north-america-promotion')).status, 404);
  // the language root itself: its own document; / to the first language version's homepage
  assert.match(await (await get('https://discover.example/de/en/homepage')).text(), /de\/en homepage/);
  const entry = await get('https://discover.example/');
  assert.equal(entry.status, 302);
  assert.equal(entry.headers.get('location'), '/de/en/homepage');
});

test('sites: with the vars set lh-com\'s hosts answer as before (tables and origin of lh-com)', async () => {
  const resp = await get('https://lhedge.example/us/en/book/baggage');
  assert.equal(await resp.text(), 'lh-com /us/en/book/baggage');
  assert.ok(calls.every((c) => !c.startsWith(DISCOVER)));
});

test('sites: a DAM path on the site\'s host is passed to the site\'s origin as it is (no DAM route: no lh-com copy, AEM or R2)', async () => {
  const e = env({ ...SITE_VARS, AEM_PUBLISH: 'https://publish-p1-e2.adobeaemcloud.com' });
  const resp = await get('https://discover.example/content/dam/four_y/pdfs/large-brochure.pdf', e);
  assert.equal(resp.status, 404);
  assert.deepEqual(calls, [`${DISCOVER}/content/dam/four_y/pdfs/large-brochure.pdf`]);
});
