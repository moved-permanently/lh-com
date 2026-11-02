/* eslint-disable max-len */
// Lufthansa Group for Business (lh-b2b) on its host: a market root's search index
// (/<cc>/<ll>/search-index.json, the search-results block's) has the language version's rows its
// markets allow, the rest-of-world documents (xx/<ll>, market-pages.json rows) of the paths the
// language version serves to de only, and the root's own documents: the market index's rows and,
// where the root has its own search index (at/de's four documents), that index's rows; not only
// those. Other sites: as before (markets.test.mjs, markets-routes.test.mjs).
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { resetMarketCache } from '../src/markets.js';

globalThis.HTMLRewriter = HTMLRewriter;

const B2B = 'main--lh-b2b--moved-permanently.aem.live';
const env = () => ({
  ORIGIN: 'main--lh-com--moved-permanently.aem.live',
  WWW_HOST: 'www.lufthansa.com',
  PILOT_HOSTS: '',
  EDGE_TTL: '60',
  AEM_PUBLISH: 'https://publish-p1-e2.adobeaemcloud.com',
  SITE_HOSTS: 'b2b.example=b2b',
  SITE_ORIGINS: `b2b=${B2B}`,
  SITE_WWW_HOSTS: 'b2b=business.lufthansagroup.com',
  SITE_DESIGN_HOSTS: 'b2b=www.lufthansa.com',
});
const sheet = (data) => ({
  total: data.length, offset: 0, limit: 1000, data, ':type': 'sheet',
});
const row = (path, extra = {}) => ({
  path, title: path, description: '', image: '', headings: '', content: '', parent: '', 'hide-in-search': '', 'primary-language-url': '', robots: '', markets: '', lastModified: '1793045388', ...extra,
});
const FILES = {
  '/de/en/search-index.json': sheet([
    row('/de/en/homepage', { markets: 'ae/en, at/en, gb/en, xx/en', image: '/de/en/media_1.jpg' }),
    row('/de/en/news', { markets: 'ae/en, at/en, ch/en, gb/en, xx/en', parent: '/de/en/homepage' }),
    // de only: the rest-of-world document of the path serves the other roots
    row('/de/en/about-us/contact', { markets: 'de/en', title: 'Germany contact' }),
    // ch/en has its own document of this path
    row('/de/en/program/experts', { markets: 'ae/en, at/en, gb/en, xx/en' }),
  ]),
  '/de/de/search-index.json': sheet([
    row('/de/de/homepage'),
    row('/de/de/news', { markets: 'at/de, ch/de, xx/de' }),
    row('/de/de/about-us/contact', { markets: 'de/de', title: 'Kontakt Deutschland' }),
  ]),
  // the market index: the rest-of-world and the own documents (no markets column)
  '/market-pages.json': sheet([
    row('/xx/en/about-us/contact', { title: 'Contact (rest of world)', parent: '/xx/en/homepage', markets: undefined }),
    row('/xx/en/only-xx', { title: 'Not a page of de/en', markets: undefined }),
    row('/xx/de/about-us/contact', { title: 'Kontakt (übrige Welt)', markets: undefined }),
    row('/xx/de/nav', { markets: undefined }),
    row('/ch/en/program/experts', { title: 'eXperts (ch/en own)', markets: undefined }),
  ]),
  // at/de's own documents have their own index (helix-query search-at-de serves every site)
  '/at/de/search-index.json': sheet([row('/at/de/own-offer', { title: 'at/de own offer' })]),
};
let calls;
beforeEach(() => {
  resetMarketCache();
  calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input, init);
    const u = new URL(req.url);
    calls.push(`${u.hostname}${u.pathname}`);
    const f = u.hostname === B2B && FILES[u.pathname];
    if (f) return Response.json(f);
    return new Response('<html>404</html>', { status: 404, headers: { 'content-type': 'text/html' } });
  };
});
const get = (path, init) => worker.fetch(new Request(`https://b2b.example${path}`, init), env(), { waitUntil() {} });
const index = async (path) => {
  const res = await get(path);
  assert.equal(res.status, 200, path);
  assert.equal(res.headers.get('x-lh-edge-route'), 'market', path);
  return res.json();
};
const byPath = (d) => Object.fromEntries(d.data.map((r) => [r.path, r]));

test('a market root: the language rows its markets allow and the rest-of-world documents of the de-only paths', async () => {
  const at = await index('/at/en/search-index.json');
  assert.deepEqual(at.data.map((r) => r.path), ['/at/en/about-us/contact', '/at/en/homepage', '/at/en/news', '/at/en/program/experts']);
  assert.equal(at.total, 4);
  const rows = byPath(at);
  assert.equal(rows['/at/en/about-us/contact'].title, 'Contact (rest of world)', 'xx/en\'s document, not de\'s');
  assert.equal(rows['/at/en/about-us/contact'].parent, '/at/en/homepage', 'its values into xx/en are the root\'s');
  assert.equal(rows['/at/en/news'].parent, '/at/en/homepage');
  assert.ok(!at.data.some((r) => r.title === 'Germany contact' || r.path.includes('only-xx')), 'no de-only row, no xx page de/en does not have');
});

test('a market root with own documents in the market index (ch/en): those rows, the language rows it may have, the rest of the world', async () => {
  const ch = await index('/ch/en/search-index.json');
  assert.deepEqual(ch.data.map((r) => r.path), ['/ch/en/about-us/contact', '/ch/en/news', '/ch/en/program/experts']);
  assert.equal(byPath(ch)['/ch/en/program/experts'].title, 'eXperts (ch/en own)');
});

test('at/de: the de/de documents it is served, the rest of the world, and its own index\'s documents, not only those', async () => {
  const at = await index('/at/de/search-index.json');
  assert.deepEqual(at.data.map((r) => r.path), ['/at/de/about-us/contact', '/at/de/homepage', '/at/de/news', '/at/de/own-offer']);
  const rows = byPath(at);
  assert.equal(rows['/at/de/about-us/contact'].title, 'Kontakt (übrige Welt)');
  assert.equal(rows['/at/de/own-offer'].title, 'at/de own offer');
  assert.ok(calls.includes(`${B2B}/at/de/search-index.json`));
});

test('the rest-of-world root itself (xx/en): its own documents once, the language rows; paging and HEAD as before', async () => {
  const xx = await index('/xx/en/search-index.json');
  assert.deepEqual(xx.data.map((r) => r.path), ['/xx/en/about-us/contact', '/xx/en/homepage', '/xx/en/news', '/xx/en/only-xx', '/xx/en/program/experts']);
  const page = await index('/at/en/search-index.json?limit=2&offset=1');
  assert.deepEqual(page.data.map((r) => r.path), ['/at/en/homepage', '/at/en/news']);
  assert.equal(page.total, 4);
  assert.equal(page.limit, 2);
  assert.equal(page.offset, 1);
  const head = await get('/at/de/search-index.json', { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
});

test('the language versions\' own indexes on the host: passed through as before', async () => {
  const de = await get('/de/en/search-index.json');
  assert.equal(de.status, 200);
  assert.notEqual(de.headers.get('x-lh-edge-route'), 'market');
  assert.equal((await de.json()).data.length, 4);
});
