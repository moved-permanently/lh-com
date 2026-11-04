/* eslint-disable max-len */
/* TAP's market roots on tap.turnsthe.page (brief 328; src/tap-markets.js, scripts/tap-markets.js),
   as lufthansa.com's ch pilot (option B): /<ll>-<cc>/<path> of a root that is on is the root's own
   document when the origin has one (its homepage /<root>/, Canada's legal pages, a nav), else the
   language version's (/<version>/<path>) when the page's `markets` allow the country, its sections
   by `markets`, links into the language version the root's (where its index lets the root have the
   page), www's links www's root, canonical and og:url the root's, hreflang per root (the language
   version, the roots that are on, the other languages' counterparts from alternate-<ll>;
   none on a homepage, as www), the alternate-<ll> rows the same market's root in that language
   where it is on, www's links (en-pt and en_pt) www's root; a language version's redirect into the
   root; media and files as they are; a page www doesn't have on the root (markets.json lacks,
   noDocument; markets): 404. /<root>/sitemap.xml from its language version's index
   (helix-query.yaml tap-pages-<version>) without those, with its own pages. A root that is off, a language root and every other
   path: as before (the origin's answer, as it is). The switch is TAP_LIVE_MARKETS (pt-br and all
   137 roots on since brief 340; pt-br is a language version, answered as before).
   Run: node --import ./test/cloudflare-workers-shim.mjs --test test/tap-markets.test.mjs */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import {
  tapMarket, tapMarketPath, tapSitemapXml, TAP_INDEX,
} from '../src/tap-markets.js';
// eslint-disable-next-line import/no-relative-packages
import { TAP_LIVE_MARKETS, TAP_MARKETS } from '../../../../scripts/tap-markets.js';

globalThis.HTMLRewriter = HTMLRewriter;

const TAP = 'main--lh-tap--moved-permanently.aem.live';
const toml = fs.readFileSync(new URL('../wrangler.toml', import.meta.url), 'utf8');
const tomlVar = (name) => (toml.match(new RegExp(`^${name} = "([^"]*)"`, 'm')) || [])[1] || '';
const env = () => ({
  ORIGIN: TAP,
  WWW_HOST: 'www.flytap.com',
  SITE: 'tap',
  SITE_HOSTS: tomlVar('SITE_HOSTS'),
  SITE_ORIGINS: tomlVar('SITE_ORIGINS'),
  SITE_WWW_HOSTS: tomlVar('SITE_WWW_HOSTS'),
});
const html = (head, main) => `<!DOCTYPE html><html><head>${head}</head><body><header></header><main>${main}</main><footer></footer></body></html>`;
const PAGE = html(
  '<link rel="canonical" href="https://tap.turnsthe.page/de-de/an-bord"><meta property="og:url" content="https://tap.turnsthe.page/de-de/an-bord"><meta name="alternate-en" content="/en-pt/on-board"><meta name="alternate-fr" content="/fr-fr/a-bord"><meta name="alternate-pt" content="/pt-pt/a-bordo"><meta name="nav" content="/de-de/nav"><meta name="footer" content="/de-de/footer"><meta name="language" content="de">',
  '<div><p><a href="/de-de/buchungen">Buchungen</a> <a href="/de-de/nur-deutschland">Nur DE</a> <a href="https://www.flytap.com/de-de/check-in">www</a> <a href="https://www.flytap.com/de_de/gepaeck">www_</a> <a href="/de-de#check-in">Check-in</a> <a href="https://main--lh-tap--moved-permanently.aem.live/de-de/hilfe">Hilfe</a></p><img src="https://main--lh-tap--moved-permanently.aem.live/de-de/media_1111111111111111111111111111111111111111.jpg"></div>'
  + '<div data-markets="-ch"><p>Nicht in der Schweiz</p></div><div data-markets="ch, at"><p>Schweiz und Österreich</p></div>',
);
const OWN_HOME = html('<link rel="canonical" href="https://tap.turnsthe.page/de-ch/"><meta property="og:url" content="https://tap.turnsthe.page/de-ch/"><meta name="nav" content="/de-ch/nav"><meta name="footer" content="/de-de/footer"><meta name="alternate-fr" content="/fr-fr">', '<div><h1>TAP Schweiz</h1><a href="/de-de/an-bord">An Bord</a></div>');
const index = (rows) => Response.json({
  total: rows.length, offset: 0, limit: rows.length, data: rows, ':type': 'sheet',
});
const DOCS = {
  '/de-ch/': OWN_HOME,
  '/de-ch/nav': html('', '<div><a href="/de-ch">TAP</a></div>'),
  '/de-ch/nav.plain.html': '<div><a href="/de-ch">TAP</a></div>',
  '/de-de/an-bord': PAGE,
  '/de-de/an-bord.plain.html': '<div><a href="/de-de/buchungen">Buchungen</a></div><div data-markets="-ch"><p>Nicht CH</p></div>',
  '/de-de/buchungen/gift-card': html('<link rel="canonical" href="https://tap.turnsthe.page/de-de/buchungen/gift-card">', '<div>Gift</div>'),
  '/fr-fr/mentions-legales/droits-des-passagers-france': html('', '<div>France</div>'),
  '/de-de/buchungen': html('<link rel="canonical" href="https://tap.turnsthe.page/de-de/buchungen">', '<div>Buchungen</div>'),
  '/de-de/nur-deutschland': html('<link rel="canonical" href="https://tap.turnsthe.page/de-de/nur-deutschland"><meta name="markets" content="de">', '<div>Nur DE</div>'),
  '/de-de/footer.plain.html': '<div><a href="/de-de/hilfe">Hilfe</a></div>',
  '/de-de': html('<link rel="canonical" href="https://tap.turnsthe.page/de-de">', '<div>DE home</div>'),
  '/fr-fr/mentions-legales': html('<link rel="canonical" href="https://tap.turnsthe.page/fr-fr/mentions-legales">', '<div>ML</div>'),
  '/fr-ca/mentions-legales/droits-passagers-canada': html('<link rel="canonical" href="https://tap.turnsthe.page/fr-ca/mentions-legales/droits-passagers-canada">', '<div>Canada</div>'),
};
const INDEXES = {
  '/de-de/pages-index.json': [
    { path: '/de-de', markets: '', lastModified: '1793700000' },
    { path: '/de-de/an-bord', markets: '', lastModified: '1793700000' },
    { path: '/de-de/buchungen', markets: '', lastModified: '1793600000' },
    { path: '/de-de/nur-deutschland', markets: 'de', lastModified: '1793600000' },
    { path: '/de-de/buchungen/gift-card', markets: '', lastModified: '1793600000' },
  ],
  '/en-pt/pages-index.json': [{ path: '/en-pt/on-board', markets: '', lastModified: '1793700000' }],
  '/fr-fr/pages-index.json': [{ path: '/fr-fr/a-bord', markets: '-ch', lastModified: '1793700000' }, { path: '/fr-fr/mentions-legales', markets: '', lastModified: '1793700000' }, { path: '/fr-fr/mentions-legales/droits-des-passagers-france', markets: '', lastModified: '1793700000' }],
};
let calls;
beforeEach(() => {
  calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input, init);
    const u = new URL(req.url);
    calls.push(u.pathname);
    if (u.hostname !== TAP) return new Response('other', { status: 500 });
    if (INDEXES[u.pathname]) return index(INDEXES[u.pathname]);
    if (u.pathname === '/de-de/alt') return new Response(null, { status: 301, headers: { location: '/de-de/an-bord' } });
    if (/\/media_/.test(u.pathname)) return new Response('img', { headers: { 'content-type': 'image/jpeg' } });
    const doc = DOCS[u.pathname];
    if (doc) return new Response(doc, { headers: { 'content-type': 'text/html; charset=utf-8', 'last-modified': 'Tue, 03 Nov 2026 10:00:00 GMT' } });
    return new Response('<html>404</html>', { status: 404, headers: { 'content-type': 'text/html' } });
  };
});
const LIVE = ['de-ch', 'de-at', 'en-ch', 'fr-ca'];
const ask = (path, method = 'GET', live = LIVE) => tapMarket(new Request(`https://tap.turnsthe.page${path}`, { method, redirect: 'manual' }), env(), { live });
const links = (text) => [...text.matchAll(/<a href="([^"]*)"/g)].map((m) => m[1]);
const alts = (text) => [...text.matchAll(/<link rel="alternate" hreflang="([^"]*)" href="([^"]*)">/g)].map((m) => `${m[1]} ${new URL(m[2]).pathname}`);

test('the switch: pt-br and every root on; a root that is off, a language root and other paths not taken (null: the route as before)', async () => {
  // pt-br and all 137 roots on since brief 340 (the pilots de-ch, en-us, fr-ca since brief 330)
  assert.deepEqual(TAP_LIVE_MARKETS, ['pt-br', ...Object.keys(TAP_MARKETS)]);
  assert.equal(await tapMarket(new Request('https://tap.turnsthe.page/de-at/an-bord'), env(), { live: ['de-ch'] }), null, 'a root that is off');
  assert.equal(await tapMarket(new Request('https://tap.turnsthe.page/pt-br/ajuda'), env()), null, 'pt-br: its own version, as before');
  assert.equal(await ask('/pt-ao/a-bordo'), null, 'not on');
  assert.equal(await ask('/de-de/an-bord'), null, 'a language root');
  assert.equal(await ask('/xx-yy/x'), null);
  assert.equal(await ask('/fragments/x'), null);
  assert.deepEqual(tapMarketPath('/de-ch/an-bord'), { root: 'de-ch', rest: '/an-bord' });
  assert.deepEqual(tapMarketPath('/de-ch'), { root: 'de-ch', rest: '' });
  assert.deepEqual(tapMarketPath('/de-ch/'), { root: 'de-ch', rest: '/' });
  assert.equal(tapMarketPath('/de-de/x'), null);
  assert.equal(calls.length, 0);
});

test('the worker: a root that is on (de-ch) by the route, one that is off (de-at) from the origin as it is', async () => {
  const on = await worker.fetch(new Request('https://tap.turnsthe.page/de-ch/an-bord', { redirect: 'manual' }), env(), { waitUntil() {} });
  assert.equal(on.status, 200);
  assert.equal(on.headers.get('x-lh-edge-route'), 'tap-market');
  assert.match(await on.text(), /<link rel="canonical" href="https:\/\/tap\.turnsthe\.page\/de-ch\/an-bord">/);
  calls = [];
  const resp = await worker.fetch(new Request('https://tap.turnsthe.page/de-at/an-bord', { redirect: 'manual' }), env(), { waitUntil() {} });
  assert.equal(resp.status, 404);
  assert.deepEqual(calls, ['/de-at/an-bord']);
});

test('the homepage: the root\'s own document (/de-ch/), canonical /de-ch, its links into the language version the root\'s', async () => {
  for (const p of ['/de-ch', '/de-ch/']) { // eslint-disable-line no-restricted-syntax
    const resp = await ask(p); // eslint-disable-line no-await-in-loop
    assert.equal(resp.status, 200, p);
    const text = await resp.text(); // eslint-disable-line no-await-in-loop
    assert.match(text, /TAP Schweiz/);
    assert.match(text, /<link rel="canonical" href="https:\/\/tap\.turnsthe\.page\/de-ch">/);
    assert.match(text, /<meta property="og:url" content="https:\/\/tap\.turnsthe\.page\/de-ch">/);
    assert.deepEqual(links(text), ['/de-ch/an-bord']);
    assert.deepEqual(alts(text), [], 'no hreflang on a homepage (www lists none there)');
    assert.equal(resp.headers.get('x-lh-edge-route'), 'tap-market');
  }
});

test('a page from the language version: sections by markets, links the root\'s where it has the page, www\'s www\'s root, hosts stripped, canonical, hreflang per root', async () => {
  const resp = await ask('/de-ch/an-bord');
  assert.equal(resp.status, 200);
  const text = await resp.text();
  assert.doesNotMatch(text, /Nicht in der Schweiz/);
  assert.match(text, /Schweiz und Österreich/);
  assert.deepEqual(links(text), ['/de-ch/buchungen', '/de-de/nur-deutschland', 'https://www.flytap.com/de-ch/check-in', 'https://www.flytap.com/de_ch/gepaeck', '/de-ch#check-in', '/de-ch/hilfe']);
  // the Alternate rows: the same market's root in that language where it is on (en-ch), else as they are
  assert.match(text, /<meta name="alternate-en" content="\/en-ch\/on-board">/);
  assert.match(text, /<meta name="alternate-fr" content="\/fr-fr\/a-bord">/);
  assert.match(text, /<meta name="alternate-pt" content="\/pt-pt\/a-bordo">/);
  assert.match(text, /<img src="\/de-de\/media_1{40}\.jpg">/);
  assert.match(text, /<link rel="canonical" href="https:\/\/tap\.turnsthe\.page\/de-ch\/an-bord">/);
  assert.match(text, /<meta property="og:url" content="https:\/\/tap\.turnsthe\.page\/de-ch\/an-bord">/);
  assert.match(text, /<meta name="nav" content="\/de-ch\/nav">/);
  assert.match(text, /<meta name="footer" content="\/de-ch\/footer">/);
  // the language version and its roots that are on (de-at, de-ch); en-pt's counterpart and en-ch;
  // fr-fr's and fr-ca (its markets -ch leave Canada in)
  assert.deepEqual(alts(text), [
    'de-DE /de-de/an-bord', 'de-AT /de-at/an-bord', 'de-CH /de-ch/an-bord',
    'en-PT /en-pt/on-board', 'en-CH /en-ch/on-board',
    'fr-FR /fr-fr/a-bord', 'fr-CA /fr-ca/a-bord',
    'pt-PT /pt-pt/a-bordo',
  ]);
  assert.deepEqual(calls.filter((c) => !c.endsWith('pages-index.json')), ['/de-ch/an-bord', '/de-de/an-bord']);
});

test('a page the language version leaves the country out of (page markets): 404; nav from the root, footer from the language version (.plain.html)', async () => {
  assert.equal((await ask('/de-ch/nur-deutschland')).status, 404);
  // a page www doesn't have on the root (markets.json lacks): 404 though the language version has it
  assert.equal((await ask('/de-ch/buchungen/gift-card')).status, 404);
  assert.equal((await ask('/fr-ca/mentions-legales/droits-des-passagers-france')).status, 404);
  assert.equal((await ask('/de-ch/gibt-es-nicht')).status, 404);
  const nav = await ask('/de-ch/nav.plain.html');
  assert.equal(await nav.text(), '<div><a href="/de-ch">TAP</a></div>');
  const footer = await ask('/de-ch/footer.plain.html');
  assert.equal(footer.status, 200);
  assert.equal(await footer.text(), '<div><a href="/de-ch/hilfe">Hilfe</a></div>');
  const plain = await (await ask('/de-ch/an-bord.plain.html')).text();
  assert.equal(plain, '<div><a href="/de-ch/buchungen">Buchungen</a></div>');
});

test('a redirect of the language version into the root; media and files as they are; HEAD', async () => {
  const moved = await ask('/de-ch/alt');
  assert.equal(moved.status, 301);
  assert.equal(moved.headers.get('location'), '/de-ch/an-bord');
  const media = await ask('/de-ch/media_2222222222222222222222222222222222222222.png');
  assert.equal(media.status, 200);
  assert.equal(calls.at(-1), '/de-ch/media_2222222222222222222222222222222222222222.png');
  const head = await ask('/de-ch/an-bord', 'HEAD');
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
});

test('a root\'s own page besides the homepage (Canada\'s legal pages): as the origin has it, canonical the root\'s', async () => {
  const resp = await ask('/fr-ca/mentions-legales/droits-passagers-canada');
  assert.equal(resp.status, 200);
  const text = await resp.text();
  assert.match(text, /Canada/);
  assert.match(text, /<link rel="canonical" href="https:\/\/tap\.turnsthe\.page\/fr-ca\/mentions-legales\/droits-passagers-canada">/);
});

test('/<root>/sitemap.xml: the language version\'s pages the country has, the root\'s own pages; 404 for a root that is off', async () => {
  const resp = await ask('/de-ch/sitemap.xml');
  assert.equal(resp.status, 200);
  assert.match(resp.headers.get('content-type'), /xml/);
  const xml = await resp.text();
  const locs = [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
  assert.deepEqual(locs, ['https://tap.turnsthe.page/de-ch', 'https://tap.turnsthe.page/de-ch/an-bord', 'https://tap.turnsthe.page/de-ch/buchungen']);
  assert.match(xml, /<lastmod>2026-11-03<\/lastmod>/);
  const ca = await (await ask('/fr-ca/sitemap.xml')).text();
  assert.deepEqual([...ca.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]), [
    'https://tap.turnsthe.page/fr-ca', 'https://tap.turnsthe.page/fr-ca/a-bord', 'https://tap.turnsthe.page/fr-ca/mentions-legales',
    'https://tap.turnsthe.page/fr-ca/mentions-legales/droits-passagers-canada', 'https://tap.turnsthe.page/fr-ca/mentions-legales/plan-accessibilite-canada',
    'https://tap.turnsthe.page/fr-ca/miles-and-go/gagnez-miles/cartes-de-credit',
  ], 'its lacks left out, its own pages in');
  assert.equal(await ask('/pt-ao/sitemap.xml'), null);
  assert.equal(typeof tapSitemapXml, 'function');
});

test('every root on (the switch as it is): /<root>/sitemap.xml answers on the market route for all 137', async () => {
  const roots = Object.keys(TAP_MARKETS);
  assert.equal(roots.length, 137);
  const answers = await Promise.all(roots.map((root) => tapMarket(new Request(`https://tap.turnsthe.page/${root}/sitemap.xml`), env())));
  answers.forEach((resp, i) => {
    assert.ok(resp, roots[i]);
    assert.equal(resp.status, 200, roots[i]);
    assert.equal(resp.headers.get('x-lh-edge-route'), 'tap-market', roots[i]);
  });
  const xml = await answers[roots.indexOf('pt-ao')].text();
  assert.match(xml, /<loc>https:\/\/tap\.turnsthe\.page\/pt-ao<\/loc>/);
});

test('the index of a language version: /<version>/pages-index.json (helix-query.yaml tap-pages-<version>, checked in the site\'s test/tap-market-roots.test.mjs)', () => {
  assert.equal(TAP_INDEX('de-de'), '/de-de/pages-index.json');
  assert.equal(Object.keys(TAP_MARKETS).length, 137);
});
