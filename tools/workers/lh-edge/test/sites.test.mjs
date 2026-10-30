/* eslint-disable max-len */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { resetMarketCache, withRootLabel, MARKET_ROOTS } from '../src/markets.js';
import { siteOf, SITES, LH_TABLES } from '../src/sites.js';
/* eslint-disable-next-line import/no-relative-packages */
import { edsDamPath } from '../../../../scripts/dam-path.js';

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
  // the language versions' nav and footer (the market roots have none of their own)
  '/de/en/footer.plain.html': '<div><p><span class="icon icon-search"></span><a href="https://www.discover-airlines.com/de/en/support/search/search-result?query=">Enter search term</a></p><p><span class="icon icon-globe"></span>Germany | English</p></div><div><ul><li><a href="/de/en/legal/imprint">Imprint</a></li></ul></div>',
  '/de/en/nav.plain.html': '<div><ul><li><p><span class="icon icon-globe"></span>Germany | English</p><ul><li><a href="/de/en/homepage">Germany</a></li></ul></li></ul></div>',
  '/de/de/footer.plain.html': '<div><p><span class="icon icon-globe"></span>Deutschland | Deutsch</p></div>',
  '/xx/fr/footer.plain.html': '<div><p><span class="icon icon-globe"></span>Autre pays | Français</p></div>',
};
// the ITA origin (lh-ita): it/en and fr/fr language documents with their markets rows as lh-ita
// writes them (market roots, cc/ll), ch/fr's own page; the other languages' indexes are missing
// (no documents yet), as on lh-ita today
const ITA = 'main--lh-ita--moved-permanently.aem.live';
// pages of lh-ita's origin
const itaPage = (path, body) => page(path, body).split(DISCOVER).join(ITA);
const ITA_FILES = {
  '/it/en/search-index.json': sheet([row('/it/en/homepage', { markets: 'ae/en, ch/en, us/en, xx/en' })]),
  '/fr/fr/search-index.json': sheet([
    row('/fr/fr/book-and-prepare/baggage', { markets: 'be/fr, ca/fr, ch/fr, tn/fr, xx/fr' }),
    row('/fr/fr/legal/imprint', { markets: 'be/fr, ca/fr, ch/fr, tn/fr, xx/fr' }),
    row('/fr/fr/book-and-prepare/offers/paris', { markets: 'be/fr' }),
  ]),
  '/market-pages.json': sheet([row('/ch/fr/swiss-offers')]),
  '/it/en/homepage': itaPage('/it/en/homepage', '<h1>it/en homepage</h1>'),
  '/fr/fr/book-and-prepare/baggage': itaPage('/fr/fr/book-and-prepare/baggage', '<h1>Bagages</h1><a href="/fr/fr/legal/imprint">Mentions légales</a> <a href="/fr/fr/book-and-prepare/offers/paris">Paris</a>'),
  '/fr/fr/book-and-prepare/offers/paris': itaPage('/fr/fr/book-and-prepare/offers/paris', '<h1>Paris</h1>'),
  '/ch/fr/swiss-offers': itaPage('/ch/fr/swiss-offers', '<h1>ch/fr own page</h1>'),
};
const BOTH = { SITE_HOSTS: 'discover.example=discover; ita.example=ita', SITE_ORIGINS: `discover=${DISCOVER}; ita=${ITA}`, SITE_WWW_HOSTS: 'discover=www.discover-airlines.com; ita=www.ita-airways.com' };
let calls;
beforeEach(() => {
  resetMarketCache();
  calls = [];
  globalThis.fetch = async (input) => {
    const req = input instanceof Request ? input : new Request(input);
    const u = new URL(req.url);
    calls.push(`${u.hostname}${u.pathname}`);
    if (u.hostname === DISCOVER || u.hostname === ITA) {
      const f = (u.hostname === ITA ? ITA_FILES : DISCOVER_FILES)[u.pathname];
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

// the DAM route on a site's host: the site's own copies (its origin), then AEM
const AEM = 'https://publish-p1-e2.adobeaemcloud.com';
const BIG = '/content/dam/four_y/videos/250120_FM_Discover_Retrofit_HeroBanner_Uebersicht_v01.mp4';
const damEnv = (extra = {}) => env({ ...SITE_VARS, AEM_PUBLISH: AEM, ...extra });
const damFetch = ({ aemDelay = 0 } = {}) => async (input, init = {}) => {
  const req = input instanceof Request ? input : new Request(input, init);
  const u = new URL(req.url);
  calls.push(`${u.hostname}${u.pathname}`);
  if (req.url.startsWith(AEM)) {
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => resolve(new Response(new Uint8Array([9, 9]), { headers: { 'content-type': 'video/mp4', 'content-length': '2' } })), aemDelay);
      init.signal?.addEventListener('abort', () => { clearTimeout(t); reject(new Error('aborted')); });
    });
  }
  if (u.hostname === DISCOVER && u.pathname === edsDamPath('/content/dam/four_y/pdfs/legal/4y_terms-of-use_de.pdf')) {
    return new Response('%PDF-1.7', { headers: { 'content-type': 'application/pdf' } });
  }
  return new Response('Not found', { status: 404 });
};

test('sites: a DAM path on the site\'s host is answered by the DAM route from the site\'s own copies (its origin)', async () => {
  globalThis.fetch = damFetch();
  const resp = await get('https://discover.example/content/dam/four_y/pdfs/legal/4y_terms-of-use_de.pdf', damEnv());
  assert.equal(resp.status, 200);
  assert.equal(resp.headers.get('x-lh-edge-route'), 'dam');
  assert.equal(await resp.text(), '%PDF-1.7');
  assert.deepEqual(calls, [`${DISCOVER}${edsDamPath('/content/dam/four_y/pdfs/legal/4y_terms-of-use_de.pdf')}`], 'one DA request, on the site\'s origin, no AEM call');
  // a file the site doesn't have: the DAM route's 404, never lh-com's copies
  calls = [];
  const missing = await get('https://discover.example/content/dam/four_y/pdfs/none.pdf', damEnv({ AEM_PUBLISH: '' }));
  assert.equal(missing.status, 404);
  assert.ok(calls.every((c) => c.startsWith(DISCOVER)));
  // lh-com's hosts read lh-com's copies, as before
  calls = [];
  await get('https://lhedge.example/content/dam/four_y/pdfs/legal/4y_terms-of-use_de.pdf', damEnv());
  assert.ok(calls.length && calls.every((c) => !c.startsWith(DISCOVER)));
});

test('sites: a large mp4 answers from AEM after 8 s on the site\'s host (the 30 s limit: a cold publish tier)', async () => {
  globalThis.fetch = damFetch({ aemDelay: 8000 });
  const t0 = Date.now();
  const slow = await get(`https://discover.example${BIG}`, damEnv());
  assert.equal(slow.status, 200);
  assert.equal(slow.headers.get('x-lh-edge-route'), 'dam-aem');
  assert.ok(Date.now() - t0 >= 7900);
});

// ITA Airways (lh-ita): the same site mechanism on its own host and origin
test('sites: ITA on its host: nine language roots, the market roots, its origin', () => {
  const site = siteOf(new Request('https://ita.example/it/en/homepage'), env(BOTH));
  assert.equal(site.name, 'ita');
  assert.equal(site.origin, ITA);
  assert.equal(site.www, 'www.ita-airways.com');
  assert.deepEqual(site.tables.versions, {
    en: 'it/en', it: 'it/it', fr: 'fr/fr', es: 'es/es', de: 'de/de', nl: 'nl/nl', pt: 'br/pt', el: 'gr/el', ja: 'jp/ja',
  });
  assert.equal(site.tables.marketRoots.length, 50);
  assert.equal(Object.keys(site.tables.table).length, 59);
  assert.deepEqual(SITES.ita.ownRoots, []);
  assert.equal(site.tables.table['xx/fr'].hreflang, 'fr');
  assert.equal(site.tables.table['ch/fr'].hreflang, 'fr-CH');
  assert.equal(site.tables.table['br/pt'].documents, 'own');
  // Discover's host keeps Discover with both sites in the vars
  assert.equal(siteOf(new Request('https://discover.example/de/en/homepage'), env(BOTH)).name, 'discover');
});

test('sites: an ITA reference root\'s page and / from lh-ita\'s origin, nothing from the others', async () => {
  const resp = await get('https://ita.example/it/en/homepage', env(BOTH));
  assert.equal(resp.status, 200);
  assert.match(await resp.text(), /it\/en homepage/);
  assert.ok(calls.every((c) => c.startsWith(ITA)), calls.join(' '));
  const entry = await get('https://ita.example/', env(BOTH));
  assert.equal(entry.status, 302);
  assert.equal(entry.headers.get('location'), '/it/en/homepage');
});

test('sites: an ITA market root from its language document where its markets row lists the root', async () => {
  const resp = await get('https://ita.example/ch/fr/book-and-prepare/baggage', env(BOTH));
  assert.equal(resp.status, 200);
  assert.equal(resp.headers.get('x-lh-edge-route'), 'market');
  const html = await resp.text();
  assert.match(html, /<h1>Bagages<\/h1>/);
  assert.match(html, /href="\/ch\/fr\/legal\/imprint"/, 'a link into the language version ch/fr serves: ch/fr\'s');
  assert.match(html, /href="\/fr\/fr\/book-and-prepare\/offers\/paris"/, 'a page ch/fr does not get (markets be/fr): left in fr/fr');
  assert.match(html, /rel="canonical" href="https:\/\/main--lh-ita--moved-permanently\.aem\.live\/ch\/fr\/book-and-prepare\/baggage"/);
  assert.ok(calls.every((c) => c.startsWith(ITA)), 'nothing from lh-com\'s or Discover\'s origin');
  // the page its markets row doesn't list for ch/fr: ch/fr's 404; be/fr gets it
  assert.equal((await get('https://ita.example/ch/fr/book-and-prepare/offers/paris', env(BOTH))).status, 404);
  assert.equal((await get('https://ita.example/be/fr/book-and-prepare/offers/paris', env(BOTH))).status, 200);
});

test('sites: an ITA market root\'s own page from its own document', async () => {
  const resp = await get('https://ita.example/ch/fr/swiss-offers', env(BOTH));
  assert.equal(resp.status, 200);
  assert.match(await resp.text(), /ch\/fr own page/);
});

test('sites: ITA\'s DAM paths: the video with its Range from AEM (dam-aem), a PDF from lh-ita\'s copies', async () => {
  const VIDEO = '/content/dam/ita/videos/world-of-ita-airways/discover-ita-airways/sustainability/female-talent/ita-allebambinechevolano-def-16x19-vers-1.mp4';
  const PDF = '/content/dam/ita/pdfs/legal/ita-conditions.pdf';
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input, init);
    const u = new URL(req.url);
    calls.push(`${u.hostname}${u.pathname}`);
    if (req.url.startsWith(AEM) && u.pathname === edsDamPath(VIDEO)) {
      return req.headers.get('range') === 'bytes=0-1'
        ? new Response(new Uint8Array([9, 9]), { status: 206, headers: { 'content-type': 'video/mp4', 'content-range': 'bytes 0-1/146728263', 'content-length': '2' } })
        : new Response('wrong range', { status: 400 });
    }
    if (u.hostname === ITA && u.pathname === edsDamPath(PDF)) return new Response('%PDF-1.7', { headers: { 'content-type': 'application/pdf' } });
    return new Response('Not found', { status: 404 });
  };
  const itaDam = env({ ...BOTH, AEM_PUBLISH: AEM });
  const video = await worker.fetch(new Request(`https://ita.example${VIDEO}`, { headers: { range: 'bytes=0-1' } }), itaDam, { waitUntil() {} });
  assert.equal(video.status, 206);
  assert.equal(video.headers.get('x-lh-edge-route'), 'dam-aem');
  assert.equal(video.headers.get('content-range'), 'bytes 0-1/146728263');
  calls = [];
  const pdf = await get(`https://ita.example${PDF}`, itaDam);
  assert.equal(pdf.status, 200);
  assert.equal(await pdf.text(), '%PDF-1.7');
  assert.deepEqual(calls, [`${ITA}${edsDamPath(PDF)}`], 'lh-ita\'s copy, no other origin');
});

test('sites: a market root\'s nav and footer name the root (www\'s label, the site\'s table), the language version\'s keep theirs', async () => {
  const label = async (url) => ((await (await get(url)).text()).match(/icon-globe"><\/span>([^<]*)/) || [])[1];
  assert.equal(await label('https://discover.example/us/en/footer.plain.html'), 'USA | English');
  assert.equal(await label('https://discover.example/ca/en/footer.plain.html'), 'Canada | English');
  assert.equal(await label('https://discover.example/xx/en/footer.plain.html'), 'Other countries | English');
  assert.equal(await label('https://discover.example/us/de/footer.plain.html'), 'USA | Deutsch');
  assert.equal(await label('https://discover.example/xx/de/footer.plain.html'), 'Andere Länder | Deutsch');
  assert.equal(await label('https://discover.example/ca/fr/footer.plain.html'), 'Canada | Français');
  assert.equal(await label('https://discover.example/us/en/nav.plain.html'), 'USA | English', 'the header\'s selector too');
  const footer = await (await get('https://discover.example/us/en/footer.plain.html')).text();
  assert.match(footer, /href="\/us\/en\/legal\/imprint"/, 'links as before');
  assert.match(footer, /icon-search"><\/span><a href="https:\/\/www\.discover-airlines\.com\/us\/en\/support/, 'the search link as before (www\'s market root)');
  assert.equal(await label('https://discover.example/de/en/footer.plain.html'), 'Germany | English', 'the language version: its own document');
  assert.equal(await label('https://discover.example/xx/fr/footer.plain.html'), 'Autre pays | Français');
  // lh-com's rows carry no label: its market roots' footers as before
  assert.ok(MARKET_ROOTS.every((r) => !LH_TABLES.table[r].label));
  assert.ok(Object.values(SITES.ita.table).every((r) => !r.label), 'ITA\'s rows: no label');
});

test('withRootLabel: the text after every globe icon, escaped; documents without one unchanged', () => {
  assert.equal(withRootLabel('<p><span class="icon icon-globe"></span>Germany | English</p><p>x</p>', 'A & B <c>'), '<p><span class="icon icon-globe"></span>A &amp; B &lt;c></p><p>x</p>');
  assert.equal(withRootLabel('<p>Germany | English</p>', 'USA | English'), '<p>Germany | English</p>');
});
