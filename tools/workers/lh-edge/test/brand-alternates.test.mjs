/* eslint-disable max-len, no-restricted-syntax, no-await-in-loop */
/* hreflang on a brand's reference roots (src/sites.js ALTERNATES_SITES, src/live-alternates.js as
   lh-com's live roots): www's sitemaps carry alternates for Austrian, Brussels and ITA (none of
   their 6,000 page snapshots has one in the head: the sitemaps only, as www.lufthansa.com); the
   market copies already list their language versions and market roots, the reference root's page
   itself listed none. Now it lists the same set (the one the market route makes, from the brand's
   roots and its language indexes): the two answer each other. B2B (www: no sitemap, no hreflang)
   and Discover (no snapshot of www's) as before; a market root's own pages, nav, 404s as before.
   Run: node --import ./test/cloudflare-workers-shim.mjs --test test/brand-alternates.test.mjs */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { resetMarketCache } from '../src/markets.js';
import { ALTERNATES_SITES } from '../src/sites.js';

globalThis.HTMLRewriter = HTMLRewriter;

const ORIGINS = {
  austrian: 'main--lh-austrian--moved-permanently.aem.live',
  ita: 'main--lh-ita--moved-permanently.aem.live',
  brussels: 'main--lh-brussels--moved-permanently.aem.live',
  b2b: 'main--lh-b2b--moved-permanently.aem.live',
  discover: 'main--lh-discover--moved-permanently.aem.live',
};
const HOSTS = {
  austrian: 'austrian.turnsthe.page', ita: 'ita.turnsthe.page', brussels: 'brussels.turnsthe.page', b2b: 'b2b.turnsthe.page', discover: 'discover.turnsthe.page',
};
const env = {
  ORIGIN: 'main--lh-com--moved-permanently.aem.live',
  WWW_HOST: 'www.lufthansa.com',
  PILOT_HOSTS: '',
  EDGE_TTL: '60',
  ALIAS_HOSTS: 'austrian-cn.turnsthe.page',
  ALIAS_HOME_ROOT: 'cn/en',
  SITE_HOSTS: `${Object.entries(HOSTS).map(([s, h]) => `${h}=${s}`).join('; ')}; austrian-cn.turnsthe.page=austrian`,
  SITE_ORIGINS: Object.entries(ORIGINS).map(([s, o]) => `${s}=${o}`).join('; '),
  SITE_WWW_HOSTS: 'austrian=www.austrian.com; ita=www.ita-airways.com; brussels=www.brusselsairlines.com; b2b=business.lufthansagroup.com; discover=www.discover-airlines.com',
};
const sheet = (data) => ({
  total: data.length, offset: 0, limit: 1000, data, ':type': 'sheet',
});
const row = (path, extra = {}) => ({
  path, title: path, markets: '', robots: '', 'primary-language-url': '', lastModified: '1793045388', ...extra,
});
// the language indexes as the brands write their markets rows (roots; empty: every market root of
// the language)
const FILES = {
  austrian: {
    '/at/en/search-index.json': sheet([row('/at/en/homepage', { markets: 'ch/en, xx/en' }), row('/at/en/baggage', { markets: 'ch/en, gb/en' })]),
    '/at/de/search-index.json': sheet([row('/at/de/baggage', { markets: 'de/de' })]),
    '/fr/fr/search-index.json': sheet([row('/fr/fr/baggage', { markets: 'ch/fr' })]),
    // the market roots' own documents: xx/en's homepage, ca/en's own page (no other root has it)
    '/market-pages.json': sheet([row('/xx/en/homepage'), row('/ca/en/local-page/austrian-in-canada')]),
  },
  brussels: {
    '/be/en/search-index.json': sheet([row('/be/en/homepage', { markets: 'ae/en' }), row('/be/en/book-a-flight', { markets: 'cm/en, gb/en' })]),
    '/market-pages.json': sheet([row('/ae/en/homepage')]),
  },
  ita: { '/it/en/search-index.json': sheet([row('/it/en/corporate-b2b', { markets: 'be/en, gb/en' })]) },
  b2b: { '/de/en/search-index.json': sheet([row('/de/en/travel-management', { markets: 'fr/en' })]) },
  discover: { '/de/en/search-index.json': sheet([row('/de/en/book/baggage', { markets: 'us/en' })]) },
};
// aem.live without a production host in the site's config: canonical, og:url and its hreflang name
// the X-Forwarded-Host (alias-site.test.mjs)
const page = (host, path) => `<!DOCTYPE html><html><head><title>${path}</title><link rel="canonical" href="https://${host}${path}"><meta property="og:url" content="https://${host}${path}"><link rel="alternate" hreflang="en" href="https://${host}/old"></head><body><main><h1>${path}</h1></main></body></html>`;
const PAGES = new Set(['/at/en/homepage', '/at/en/baggage', '/at/de/baggage', '/xx/en/homepage', '/ca/en/local-page/austrian-in-canada', '/be/en/homepage', '/ae/en/homepage', '/at/en/nav', '/at/en/not-indexed', '/it/en/corporate-b2b', '/be/en/book-a-flight', '/de/en/travel-management', '/de/en/book/baggage']);
let calls;
// ms an index answer waits (path -> ms; the order the indexes arrive in)
let delays;
beforeEach(() => {
  resetMarketCache();
  calls = [];
  delays = {};
  globalThis.fetch = async (input) => {
    const req = input instanceof Request ? input : new Request(input);
    const u = new URL(req.url);
    calls.push(`${u.hostname}${u.pathname}`);
    const site = Object.keys(ORIGINS).find((s) => ORIGINS[s] === u.hostname);
    if (!site) return new Response('nf', { status: 404 });
    if (delays[u.pathname]) await new Promise((r) => { setTimeout(r, delays[u.pathname]); });
    const f = FILES[site][u.pathname];
    if (f) return Response.json(f);
    if (u.pathname.endsWith('.json')) return Response.json(sheet([]));
    const path = u.pathname.replace(/\.plain\.html$/, '');
    if (PAGES.has(path)) {
      const html = u.pathname.endsWith('.plain.html') ? `<div><h1>${path}</h1></div>` : page(req.headers.get('x-forwarded-host') || u.hostname, path);
      return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
    }
    return new Response('<html>404</html>', { status: 404, headers: { 'content-type': 'text/html' } });
  };
});
const get = (host, path) => worker.fetch(new Request(`https://${host}${path}`), env, { waitUntil() {} });
// the alternates lh-edge writes (the origin's /old link is checked on its own)
const tags = (html) => [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)].map((m) => `${m[1]} ${m[2]}`).filter((t) => !t.endsWith('/old')).sort();

test('the sites whose www carries hreflang alternates (its sitemaps): Austrian, Brussels, ITA', () => {
  assert.deepEqual([...ALTERNATES_SITES].sort(), ['austrian', 'brussels', 'ita']);
});

test('austrian: a reference root\'s page lists its language versions and market roots, the set its market copies list', async () => {
  const H = HOSTS.austrian;
  const resp = await get(H, '/at/en/baggage');
  assert.equal(resp.status, 200);
  const html = await resp.text();
  // the same path in at/de pairs the two language versions (as lh-com's), each with its market roots
  const SET = [`de-AT https://${H}/at/de/baggage`, `de-DE https://${H}/de/de/baggage`, `en-AT https://${H}/at/en/baggage`, `en-CH https://${H}/ch/en/baggage`, `en-GB https://${H}/gb/en/baggage`, `fr-CH https://${H}/ch/fr/baggage`, `fr-FR https://${H}/fr/fr/baggage`];
  assert.deepEqual(tags(html), SET);
  assert.ok(!html.includes(`https://${H}/old`), 'the origin\'s own hreflang link replaced');
  assert.ok(html.includes(`<link rel="canonical" href="https://${H}/at/en/baggage">`), 'canonical kept');
  for (const other of ['/ch/en/baggage', '/de/de/baggage', '/at/de/baggage']) {
    assert.deepEqual(tags(await (await get(H, other)).text()), SET, `${other} lists the same set: they answer each other`);
  }
});

test('ita and brussels: a reference root\'s page lists the set its market copy lists', async () => {
  for (const [site, ref, copy, expected] of [
    ['ita', '/it/en/corporate-b2b', '/be/en/corporate-b2b', ['en-BE /be/en/corporate-b2b', 'en-GB /gb/en/corporate-b2b', 'en-IT /it/en/corporate-b2b']],
    ['brussels', '/be/en/book-a-flight', '/cm/en/book-a-flight', ['en-BE /be/en/book-a-flight', 'en-CM /cm/en/book-a-flight', 'en-GB /gb/en/book-a-flight']],
  ]) {
    const H = HOSTS[site];
    const own = tags(await (await get(H, ref)).text());
    assert.deepEqual(own, expected.map((e) => e.replace(' /', ` https://${H}/`)), site);
    assert.deepEqual(tags(await (await get(H, copy)).text()), own, `${site}: the market copy's`);
  }
});

test('b2b and discover: a reference root\'s page as before (b2b\'s www has no hreflang; no snapshot of Discover\'s www)', async () => {
  for (const [site, ref] of [['b2b', '/de/en/travel-management'], ['discover', '/de/en/book/baggage']]) {
    const html = await (await get(HOSTS[site], ref)).text();
    assert.deepEqual(tags(html), [], site);
    assert.ok(html.includes(`hreflang="en" href="https://${HOSTS[site]}/old"`), `${site}: the origin's answer as it is`);
  }
});

test('homepages: a market root\'s own homepage lists the set the reference homepage and the market copies list', async () => {
  for (const [site, ref, own, copy, expected] of [
    ['austrian', '/at/en/homepage', '/xx/en/homepage', '/ch/en/homepage', ['en-AT /at/en', 'en-CH /ch/en', 'en /xx/en']],
    ['brussels', '/be/en/homepage', '/ae/en/homepage', null, ['en-AE /ae/en', 'en-BE /be/en']],
  ]) {
    const H = HOSTS[site];
    const set = expected.map((t) => `${t.replace(' /', ` https://${H}/`)}/homepage`).sort();
    const ownHtml = await (await get(H, own)).text();
    assert.deepEqual(tags(ownHtml), set, `${site} ${own}`);
    assert.ok(ownHtml.includes(`<h1>${own}</h1>`), `${own}: its own document`);
    assert.ok(!ownHtml.includes(`https://${H}/old`), `${own}: the origin's hreflang replaced`);
    assert.deepEqual(tags(await (await get(H, ref)).text()), set, `${site} ${ref}`);
    if (copy) assert.deepEqual(tags(await (await get(H, copy)).text()), set, `${site} ${copy}`);
  }
});

test('austrian: other answers as they are (an own page no other root has, nav, a page the index lacks, a 404, a POST)', async () => {
  const H = HOSTS.austrian;
  for (const path of ['/ca/en/local-page/austrian-in-canada', '/at/en/nav', '/at/en/not-indexed', '/at/en/missing']) {
    const html = await (await get(H, path)).text();
    assert.equal(tags(html).length, 0, path);
  }
  const post = await worker.fetch(new Request(`https://${H}/at/en/baggage`, { method: 'POST', body: 'x' }), env, { waitUntil() {} });
  assert.equal(tags(await post.text()).length, 0, 'POST');
});

test('the alternates\' order is the table\'s, whichever language index arrives first (one answer per page, a stable smoke hash)', async () => {
  const order = async (first, last) => {
    resetMarketCache();
    delays = { [first]: 1, [last]: 40 };
    const html = await (await get(HOSTS.austrian, '/at/en/baggage')).text();
    return [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)"/g)].map((m) => m[1]).filter((h) => h !== 'en').join(' ');
  };
  // three languages: the page's (en) first, then de and fr in the table's order (de/de and fr/fr
  // the same path)
  const a = await order('/at/de/search-index.json', '/fr/fr/search-index.json');
  const b = await order('/fr/fr/search-index.json', '/at/de/search-index.json');
  assert.ok(a.split(' ').length === 7, a);
  assert.equal(b, a);
  assert.equal(a, 'en-AT en-CH en-GB de-AT de-DE fr-FR fr-CH');
});

test('austrian-cn (the alias): the reference page\'s alternates name austrian.turnsthe.page, as its canonical', async () => {
  const html = await (await get('austrian-cn.turnsthe.page', '/at/en/baggage')).text();
  assert.deepEqual(tags(html), ['de-AT /at/de', 'de-DE /de/de', 'en-AT /at/en', 'en-CH /ch/en', 'en-GB /gb/en', 'fr-CH /ch/fr', 'fr-FR /fr/fr'].map((t) => `${t.replace(' /', ` https://${HOSTS.austrian}/`)}/baggage`));
  assert.ok(html.includes(`<link rel="canonical" href="https://${HOSTS.austrian}/at/en/baggage">`));
});
