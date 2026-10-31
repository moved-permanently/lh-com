/* eslint-disable max-len */
// ITA's five market roots of the de, el and nl documents (xx/de, at/de, ch/de, xx/el, be/nl): rows
// of ITA's table (scripts/brands.js BRAND_SITES.ita, language documents, www's selector labels);
// on ITA's host a page under them comes from its language document where its markets row lists
// the root, their own homepage stays their own; ITA's other roots as before
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { resetMarketCache } from '../src/markets.js';
import { siteOf } from '../src/sites.js';

globalThis.HTMLRewriter = HTMLRewriter;

const LH = 'main--lh-com--moved-permanently.aem.live';
const ITA = 'main--lh-ita--moved-permanently.aem.live';
const VARS = { SITE_HOSTS: 'ita.example=ita', SITE_ORIGINS: `ita=${ITA}`, SITE_WWW_HOSTS: 'ita=www.ita-airways.com' };
const env = () => ({
  ORIGIN: LH, WWW_HOST: 'www.lufthansa.com', PILOT_HOSTS: '', EDGE_TTL: '60', ...VARS,
});
const sheet = (data) => ({
  total: data.length, offset: 0, limit: 1000, data, ':type': 'sheet',
});
const row = (path, extra = {}) => ({
  path, title: path, markets: '', robots: '', 'primary-language-url': '', lastModified: '1793045388', ...extra,
});
const page = (path, body) => `<!DOCTYPE html><html><head><title>${path}</title><link rel="canonical" href="https://${ITA}${path}"></head><body><main>${body}</main></body></html>`;
const FILES = {
  '/de/de/search-index.json': sheet([
    row('/de/de/book-and-prepare/offers-and-destinations', { markets: 'at/de, ch/de, xx/de' }),
    row('/de/de/book-and-prepare/offers/mice', { markets: 'xx/de' }),
  ]),
  '/gr/el/search-index.json': sheet([row('/gr/el/support/utilities/payment-methods', { markets: 'xx/el' })]),
  '/nl/nl/search-index.json': sheet([row('/nl/nl/support/utilities/payment-methods', { markets: 'be/nl' })]),
  '/market-pages.json': sheet([row('/xx/de/homepage')]),
  '/de/de/book-and-prepare/offers-and-destinations': page('/de/de/book-and-prepare/offers-and-destinations', '<h1>Angebote und Reiseziele</h1>'),
  '/de/de/book-and-prepare/offers/mice': page('/de/de/book-and-prepare/offers/mice', '<h1>MICE</h1>'),
  '/gr/el/support/utilities/payment-methods': page('/gr/el/support/utilities/payment-methods', '<h1>Τρόποι πληρωμής</h1>'),
  '/nl/nl/support/utilities/payment-methods': page('/nl/nl/support/utilities/payment-methods', '<h1>Betaalmethoden</h1>'),
  '/xx/de/homepage': page('/xx/de/homepage', '<h1>xx/de own homepage</h1>'),
};
let calls;
beforeEach(() => {
  resetMarketCache();
  calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input, init);
    const u = new URL(req.url);
    calls.push(`${u.hostname}${u.pathname}`);
    const f = u.hostname === ITA ? FILES[u.pathname] : null;
    if (f && typeof f === 'object') return Response.json(f);
    if (f) return new Response(f, { headers: { 'content-type': 'text/html; charset=utf-8' } });
    return new Response('<html>404</html>', { status: 404, headers: { 'content-type': 'text/html' } });
  };
});
const get = (url) => worker.fetch(new Request(url), env(), { waitUntil() {} });

test('ITA\'s table: the five roots are market roots of de/de, gr/el and nl/nl with www\'s selector labels', () => {
  const site = siteOf(new Request('https://ita.example/xx/de/homepage'), env());
  const { table, marketRoots } = site.tables;
  const want = {
    'xx/de': ['de', 'de', 'Andere Länder | Deutsch'],
    'at/de': ['de', 'de-AT', 'Österreich | Deutsch'],
    'ch/de': ['de', 'de-CH', 'Schweiz | Deutsch'],
    'xx/el': ['el', 'el', 'Παγκόσμιος ιστότοπος | Ελληνικά'],
    'be/nl': ['nl', 'nl-BE', 'België | Nederlands'],
  };
  Object.entries(want).forEach(([r, [lang, hreflang, label]]) => {
    assert.ok(table[r], r);
    assert.equal(table[r].documents, 'language', r);
    assert.equal(table[r].lang, lang, r);
    assert.equal(table[r].hreflang, hreflang, r);
    assert.equal(table[r].label, label, r);
    assert.ok(marketRoots.includes(r), r);
  });
  assert.equal(marketRoots.length, 55);
  assert.equal(Object.keys(table).length, 64);
});

test('a page under the five roots from its language document where the markets row lists the root; else 404', async () => {
  const cases = [
    ['/xx/de/book-and-prepare/offers-and-destinations', 200, /Angebote und Reiseziele/],
    ['/at/de/book-and-prepare/offers-and-destinations', 200, /Angebote und Reiseziele/],
    ['/ch/de/book-and-prepare/offers-and-destinations', 200, /Angebote und Reiseziele/],
    ['/xx/el/support/utilities/payment-methods', 200, /Τρόποι πληρωμής/],
    ['/be/nl/support/utilities/payment-methods', 200, /Betaalmethoden/],
    // the markets row lists xx/de only
    ['/at/de/book-and-prepare/offers/mice', 404, null],
    ['/xx/de/book-and-prepare/offers/mice', 200, /MICE/],
  ];
  const answers = await Promise.all(cases.map(([p]) => get(`https://ita.example${p}`)));
  const texts = await Promise.all(answers.map((r) => r.text()));
  answers.forEach((resp, i) => {
    const [p, status, body] = cases[i];
    assert.equal(resp.status, status, p);
    if (body) {
      assert.equal(resp.headers.get('x-lh-edge-route'), 'market', p);
      assert.match(texts[i], body, p);
      assert.match(texts[i], new RegExp(`rel="canonical" href="https://${ITA.replace(/\./g, '\\.')}${p}"`), p);
    }
  });
  assert.ok(calls.every((c) => c.startsWith(ITA)), 'nothing from lh-com\'s origin');
  // the root's own homepage stays its own document
  assert.match(await (await get('https://ita.example/xx/de/homepage')).text(), /xx\/de own homepage/);
});
