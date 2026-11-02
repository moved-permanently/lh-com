/* eslint-disable max-len */
// Lufthansa Group for Business (lh-b2b) on its host: the site entry (src/sites.js SITES.b2b), its
// entry paths (/, /<cc>, /<cc>/<ll>), the market route over the documents' markets lists: de/en's
// and de/de's documents, the rest-of-world documents on xx/<ll> for the roots de's row leaves out
// (BRAND_SITES.b2b restOfWorld), the own documents of ch/en and at/de first; us/de, ca/de and
// mx/de are no roots (www answers its not-found page with a 500 there: here the site's 404)
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { resetMarketCache } from '../src/markets.js';
import { siteOf, SITES, SITE_ENTRIES } from '../src/sites.js';

globalThis.HTMLRewriter = HTMLRewriter;

const B2B = 'main--lh-b2b--moved-permanently.aem.live';
const BRUSSELS = 'main--lh-brussels--moved-permanently.aem.live';
const VARS = {
  SITE_HOSTS: 'brussels.example=brussels; b2b.example=b2b',
  SITE_ORIGINS: `brussels=${BRUSSELS}; b2b=${B2B}`,
  SITE_WWW_HOSTS: 'brussels=www.brusselsairlines.com; b2b=business.lufthansagroup.com',
  SITE_DESIGN_HOSTS: 'brussels=www.lufthansa.com; b2b=www.lufthansa.com',
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
const page = (path, body, markets = '') => `<!DOCTYPE html><html><head><title>${path}</title>${markets ? `<meta name="markets" content="${markets}">` : ''}<link rel="canonical" href="https://${B2B}${path}"></head><body><main>${body}</main></body></html>`;
const FILES = {
  '/de/en/search-index.json': sheet([
    row('/de/en/homepage', { markets: 'ae/en, at/en, gb/en, xx/en' }),
    // a path where xx differs: de's document serves de only
    row('/de/en/about-us/contact', { markets: 'de/en' }),
    row('/de/en/news', { markets: 'ae/en, at/en, gb/en, xx/en' }),
    // ch/en has its own document of this path
    row('/de/en/program/experts', { markets: 'ae/en, at/en, gb/en, xx/en' }),
  ]),
  '/de/de/search-index.json': sheet([row('/de/de/homepage'), row('/de/de/about-us/contact', { markets: 'de/de' })]),
  '/de/en/homepage': page('/de/en/homepage', '<h1>de/en homepage</h1>', 'ae/en, at/en, gb/en, xx/en'),
  '/de/en/about-us/contact': page('/de/en/about-us/contact', '<h1>Germany contact</h1>', 'de/en'),
  '/de/en/news': page('/de/en/news', '<h1>News</h1><a href="/de/en/about-us/contact">Contact</a>', 'ae/en, at/en, gb/en, xx/en'),
  '/de/en/program/experts': page('/de/en/program/experts', '<h1>eXperts (de/en)</h1>', 'ae/en, at/en, gb/en, xx/en'),
  '/de/de/about-us/contact': page('/de/de/about-us/contact', '<h1>Kontakt Deutschland</h1>', 'de/de'),
  // the rest-of-world documents: every root of the language but de (here ae/en, at/en; not gb/en)
  '/xx/en/about-us/contact': page('/xx/en/about-us/contact', '<h1>Contact (rest of world)</h1><a href="/xx/en/news">News</a>', 'ae/en, at/en'),
  '/xx/de/about-us/contact': page('/xx/de/about-us/contact', '<h1>Kontakt (übrige Welt)</h1>', 'at/de, ch/de'),
  '/ch/en/program/experts': page('/ch/en/program/experts', '<h1>eXperts (ch/en own)</h1>'),
  '/us/en/homepage': page('/us/en/homepage', '<h1>us/en own homepage</h1>'),
};
let calls;
beforeEach(() => {
  resetMarketCache();
  calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input, init);
    const u = new URL(req.url);
    calls.push(`${u.hostname}${u.pathname}`);
    if (u.hostname === B2B) {
      const f = FILES[u.pathname.replace(/\.plain\.html$/, '')] || FILES[u.pathname];
      if (f && typeof f === 'object') return Response.json(f);
      if (f) return new Response(f, { headers: { 'content-type': 'text/html; charset=utf-8' } });
    }
    return new Response('<html>404</html>', { status: 404, headers: { 'content-type': 'text/html' } });
  };
});
const get = (url, init) => worker.fetch(new Request(url, init), env(), { waitUntil() {} });

test('b2b: the site on its host: de/en and de/de, 185 market roots, xx/<ll> the rest of the world', () => {
  const site = siteOf(new Request('https://b2b.example/de/en/homepage'), env());
  assert.equal(site.name, 'b2b');
  assert.equal(site.origin, B2B);
  assert.equal(site.www, 'business.lufthansagroup.com');
  assert.equal(site.design, 'www.lufthansa.com');
  assert.deepEqual(site.tables.versions, { en: 'de/en', de: 'de/de' });
  assert.equal(site.tables.marketRoots.length, 185);
  assert.deepEqual(site.tables.restOfWorld, { en: 'xx/en', de: 'xx/de' });
  ['us/de', 'ca/de', 'mx/de'].forEach((r) => assert.ok(!site.tables.table[r], `${r}: no root (500 on www)`));
  assert.deepEqual(SITES.brussels.restOfWorld, {}, 'other sites: none');
});

test('b2b: the entry paths: / to de/en, /<cc> to the country\'s first root, /<cc>/<ll> to its homepage', async () => {
  const e = SITE_ENTRIES.b2b;
  assert.equal(e['/de'], '/de/en/homepage');
  assert.equal(e['/us'], '/us/en/homepage');
  assert.equal(e['/at/de'], '/at/de/homepage');
  assert.equal(e['/xx/en/'], '/xx/en/homepage');
  assert.equal(e['/us/de'], undefined, 'us/de: no entry');
  const root = await get('https://b2b.example/');
  assert.equal(root.status, 302);
  assert.equal(root.headers.get('location'), '/de/en/homepage');
  const ch = await get('https://b2b.example/ch/de');
  assert.equal(ch.status, 302);
  assert.equal(ch.headers.get('location'), '/ch/de/homepage');
});

test('b2b: de\'s documents on de; a market root from de/en where its markets list the root', async () => {
  const de = await get('https://b2b.example/de/en/about-us/contact');
  assert.equal(de.status, 200);
  assert.match(await de.text(), /Germany contact/);
  const at = await get('https://b2b.example/at/en/news');
  assert.equal(at.status, 200);
  const html = await at.text();
  assert.match(html, /<h1>News<\/h1>/);
  assert.match(html, /href="\/at\/en\/about-us\/contact"/, 'the link into de/en is the market root\'s (the rest-of-world document serves it)');
});

test('b2b: a path de serves only for de: the rest-of-world document for the roots its markets list', async () => {
  const at = await get('https://b2b.example/at/en/about-us/contact');
  assert.equal(at.status, 200);
  const html = await at.text();
  assert.match(html, /Contact \(rest of world\)/);
  assert.match(html, /href="\/at\/en\/news"/, 'xx\'s links are the market root\'s');
  assert.ok(calls.includes(`${B2B}/xx/en/about-us/contact`));
  const atde = await get('https://b2b.example/at/de/about-us/contact');
  assert.equal(atde.status, 200);
  assert.match(await atde.text(), /Kontakt \(übrige Welt\)/);
  const gb = await get('https://b2b.example/gb/en/about-us/contact');
  assert.equal(gb.status, 404, 'a root the rest-of-world document does not list: 404');
  const plain = await get('https://b2b.example/ae/en/about-us/contact.plain.html');
  assert.equal(plain.status, 200);
  assert.match(await plain.text(), /Contact \(rest of world\)/);
});

test('b2b: own documents first (ch/en, the us/en homepage); us/de as www\'s not-found page (here a 404)', async () => {
  const ch = await get('https://b2b.example/ch/en/program/experts');
  assert.equal(ch.status, 200);
  assert.match(await ch.text(), /eXperts \(ch\/en own\)/);
  const at = await get('https://b2b.example/at/en/program/experts');
  assert.equal(at.status, 200);
  assert.match(await at.text(), /eXperts \(de\/en\)/);
  const us = await get('https://b2b.example/us/en/homepage');
  assert.match(await us.text(), /us\/en own homepage/);
  const usde = await get('https://b2b.example/us/de/homepage');
  assert.equal(usde.status, 404);
});
