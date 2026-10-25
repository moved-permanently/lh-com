/* eslint-disable max-len */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker, { routeOf } from '../src/index.js';
import { originUrl } from '../src/edge.js';
import {
  soloPath, soloHref, resetAliasCache, absolutize,
} from '../src/solo.js';

globalThis.HTMLRewriter = HTMLRewriter;

const ORIGIN = 'main--lh-com--moved-permanently.aem.live';
const HOST = 'https://lh-edge.example';
const env = (extra = {}) => ({
  ORIGIN, PUBLIC_HOST: 'lhcom.example', WWW_HOST: 'www.lufthansa.com', ALIAS_SHEET: '/app/config/webview-aliases.json', ...extra,
});
const ALIASES = {
  data: [
    {
      locale: 'de/de', 'app-path': '/de/de/book-and-manage/timetable-and-flight-status/flight-disruptions', page: '/de/de/flugunregelmaessigkeiten', note: 'www canonical',
    },
    {
      locale: 'us/en', 'app-path': '/us/en/local-page/dnsmpi', page: '/us/en/dnsmpi', note: 'market-only page',
    },
  ],
};
const PAGE = `<!DOCTYPE html><html><head><title>Flugunregelmäßigkeiten</title><meta name="description" content="x"></head>
<body><header></header><main><div><h1>Flugunregelmäßigkeiten</h1>
<p><a href="/de/de/fluege">Flüge</a> <a href="https://www.lufthansa.com/de/de/kontakt">Kontakt</a> <a href="/de/de/homepage">Home</a>
<a href="/de/de/logout">Abmelden</a> <a href="/content/dam/x.pdf">PDF</a> <a href="https://example.com/x">extern</a> <a href="#top">top</a>
<a href="./verspaetung?x=1#a">relativ</a></p>
<picture><source type="image/webp" srcset="./media_1234.jpg?width=2000&amp;format=webply 2000w"><img src="./media_1234.jpg?width=750" alt=""></picture>
</div></main><footer></footer></body></html>`;

let calls;
beforeEach(() => {
  resetAliasCache();
  calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input);
    calls.push({ url: req.url, headers: Object.fromEntries(req.headers), init });
    const u = new URL(req.url);
    if (u.pathname === '/app/config/webview-aliases.json') return Response.json(ALIASES);
    if (u.pathname === '/de/de/flugunregelmaessigkeiten' || u.pathname === '/us/en/dnsmpi') {
      return new Response(PAGE, {
        headers: {
          'content-type': 'text/html; charset=utf-8', 'cache-control': 'max-age=7200', age: '12', 'x-robots-tag': 'noindex',
        },
      });
    }
    if (u.pathname === '/de/de/alt') return new Response(null, { status: 301, headers: { location: '/de/de/neu' } });
    if (u.pathname === '/de/en/index.json') return Response.json({ data: [] });
    return new Response('<html><body>Not found</body></html>', { status: 404, headers: { 'content-type': 'text/html' } });
  };
});

const get = (path, init) => worker.fetch(new Request(`${HOST}${path}`, init), env(), {});

/* ---------------------------------------------------------------------------- pass-through */

test('pass-through: origin host, reference headers, query parameters, header cleanup', async () => {
  const resp = await get('/de/de/flugunregelmaessigkeiten?utm_source=x&channel=app', { headers: { host: 'lh-edge.example' } });
  assert.equal(resp.status, 200);
  const call = calls.at(-1);
  assert.equal(call.url, `https://${ORIGIN}/de/de/flugunregelmaessigkeiten`);
  assert.equal(call.headers['x-forwarded-host'], 'lhcom.example');
  assert.equal(call.headers['x-byo-cdn-type'], 'cloudflare');
  assert.equal(call.headers['x-push-invalidation'], 'enabled');
  assert.deepEqual(call.init.cf, { cacheEverything: true });
  // EDGE_TTL caps the edge cache (2xx: EDGE_TTL, 404: 60 s), for pages and solo pages
  await worker.fetch(new Request(`${HOST}/de/de/flugunregelmaessigkeiten`), env({ EDGE_TTL: '60' }), {});
  assert.deepEqual(calls.at(-1).init.cf, { cacheEverything: true, cacheTtlByStatus: { '200-299': 60, 404: 60 } });
  await worker.fetch(new Request(`${HOST}/de/de/flugunregelmaessigkeiten.solo_continue`), env({ EDGE_TTL: '30' }), {});
  assert.deepEqual(calls.find((c) => c.url.endsWith('/de/de/flugunregelmaessigkeiten') && c.init.cf?.cacheTtlByStatus?.['200-299'] === 30).init.cf, { cacheEverything: true, cacheTtlByStatus: { '200-299': 30, 404: 60 } });
  // ... and browsers get the same limit instead of the origin's max-age=7200
  const capped = await worker.fetch(new Request(`${HOST}/de/de/flugunregelmaessigkeiten`), env({ EDGE_TTL: '60' }), {});
  assert.equal(capped.headers.get('cache-control'), 'max-age=60');
  await worker.fetch(new Request(`${HOST}/de/de/flugunregelmaessigkeiten`), env({ EDGE_TTL: '' }), {});
  assert.equal(resp.headers.get('cache-control'), 'max-age=7200');
  assert.deepEqual(calls.at(-1).init.cf, { cacheEverything: true });
  assert.equal(resp.headers.get('age'), null);
  assert.equal(resp.headers.get('x-robots-tag'), null);
  // json keeps limit/offset/sheet, media keeps format/height/optimize/width (sorted)
  assert.equal(originUrl(`${HOST}/de/en/index.json?x=1&offset=2&limit=5`, env()).search, '?limit=5&offset=2');
  assert.equal(originUrl(`${HOST}/de/media_${'a'.repeat(40)}.jpg?width=750&foo=1&format=webply`, env()).search, '?format=webply&width=750');
  // a 301 keeps the query string
  const moved = await get('/de/de/alt?x=1');
  assert.equal(moved.status, 301);
  assert.equal(moved.headers.get('location'), '/de/de/neu?x=1');
  // the reference's prelude: drafts, other ports, RUM methods
  assert.equal((await get('/drafts/x')).status, 404);
  assert.equal((await worker.fetch(new Request('https://lh-edge.example:8443/x'), env(), {})).status, 301);
  assert.equal((await get('/.rum/1', { method: 'DELETE' })).status, 405);
  // PUBLIC_HOST empty: the request's host
  await worker.fetch(new Request(`${HOST}/de/de/flugunregelmaessigkeiten`), env({ PUBLIC_HOST: '' }), {});
  assert.equal(calls.at(-1).headers['x-forwarded-host'], 'lh-edge.example');
  assert.equal(routeOf(new Request(`${HOST}/de/en/flights`)).name, 'pass-through');
});

/* --------------------------------------------------------------------------- message center */

test('message-center: to the messages Worker (service binding), not copied', async () => {
  const seen = [];
  const e = env({ MESSAGES: { fetch: async (req) => { seen.push(req.url); return Response.json({ data: { lhgMessageList: { items: [] } } }); } } });
  const resp = await worker.fetch(new Request(`${HOST}/graphql/execute.json/Message-Center/lhgIrregMessageList`), e, {});
  assert.equal(resp.status, 200);
  assert.deepEqual(seen, [`${HOST}/graphql/execute.json/Message-Center/lhgIrregMessageList`]);
  assert.equal(calls.length, 0);
  assert.equal((await worker.fetch(new Request(`${HOST}/graphql/execute.json/Message-Center/x`), env(), {})).status, 503);
});

/* ------------------------------------------------------------------------------- well-known */

test('well-known: www\'s files byte for byte, application/json', async () => {
  const dir = new URL('../../../source-export/feeds/well-known/', import.meta.url);
  for (const name of ['assetlinks.json', 'apple-app-site-association']) { // eslint-disable-line no-restricted-syntax
    const resp = await get(`/.well-known/${name}`); // eslint-disable-line no-await-in-loop
    assert.equal(resp.status, 200);
    assert.equal(resp.headers.get('content-type'), 'application/json');
    assert.deepEqual(Buffer.from(await resp.arrayBuffer()), fs.readFileSync(new URL(name, dir))); // eslint-disable-line no-await-in-loop
  }
  assert.equal(calls.length, 0);
});

/* ------------------------------------------------------------------------------------- solo */

test('solo: the five URL forms and the double suffix', () => {
  const p = '/de/en/common/terms-and-conditions';
  ['.solo_continue', '.solo.continue', '.solo.continue.solo_continue', '.solo_continue.html', '.solo_continue.genapp.html']
    .forEach((s) => assert.equal(soloPath(`${p}${s}`), p));
  assert.equal(soloPath('/de/en/flights'), null);
  assert.equal(soloPath('/de/en/x.solo_continue.html.foo'), null);
  assert.equal(soloPath('/.solo_continue'), null);
});

test('solo: alias, app view, solo links, homepage closes the web view, no redirect', async () => {
  const resp = await get('/de/de/book-and-manage/timetable-and-flight-status/flight-disruptions.solo_continue?foo=bar');
  assert.equal(resp.status, 200);
  assert.equal(resp.headers.get('x-lh-edge-page'), '/de/de/flugunregelmaessigkeiten');
  assert.ok(calls.some((c) => c.url === `https://${ORIGIN}/de/de/flugunregelmaessigkeiten`));
  // the sheet is read past the edge cache
  assert.equal(calls.find((c) => c.url.endsWith('/app/config/webview-aliases.json')).init.cache, 'no-store');
  const html = await resp.text();
  assert.match(html, /<head><meta name="channel" content="app"><meta name="app-close-url" content="https:\/\/www\.lufthansa\.com\.solo_continue\/">/);
  assert.match(html, /href="\/de\/de\/fluege\.solo_continue"/);
  assert.match(html, /href="https:\/\/www\.lufthansa\.com\/de\/de\/kontakt\.solo_continue"/);
  assert.match(html, /href="https:\/\/www\.lufthansa\.com\.solo_continue\/"/);
  assert.match(html, /href="\/de\/de\/logout"/);
  assert.match(html, /href="\/content\/dam\/x\.pdf"/);
  assert.match(html, /href="https:\/\/example\.com\/x"/);
  assert.match(html, /href="#top"/);
  // relative links and media resolve against the page, not the alias path
  assert.match(html, /href="\/de\/de\/verspaetung\.solo_continue\?x=1#a"/);
  assert.match(html, /src="\/de\/de\/media_1234\.jpg\?width=750"/);
  // attribute values stay as written (entities included)
  assert.match(html, /srcset="\/de\/de\/media_1234\.jpg\?width=2000&amp;format=webply 2000w"/);
  // all forms answer the same page; without an alias row the path is looked up as it is
  for (const s of ['.solo.continue', '.solo.continue.solo_continue', '.solo_continue.html', '.solo_continue.genapp.html']) { // eslint-disable-line no-restricted-syntax
    const r = await get(`/de/de/book-and-manage/timetable-and-flight-status/flight-disruptions${s}`); // eslint-disable-line no-await-in-loop
    assert.equal(r.headers.get('x-lh-edge-page'), '/de/de/flugunregelmaessigkeiten');
  }
  assert.equal((await get('/de/de/flugunregelmaessigkeiten.solo_continue')).status, 200);
  assert.equal((await get('/us/en/local-page/dnsmpi.solo_continue')).headers.get('x-lh-edge-page'), '/us/en/dnsmpi');
});

test('solo: no page answers 404 (as www), a site redirect goes to the solo form', async () => {
  const r = await get('/de/en/on-board-overview.solo_continue');
  assert.equal(r.status, 404);
  const moved = await get('/de/de/alt.solo_continue?x=1');
  assert.equal(moved.status, 301);
  assert.equal(moved.headers.get('location'), '/de/de/neu.solo_continue?x=1');
});

test('solo links: rules', () => {
  const page = new URL('https://lh-edge.example/de/en/flights');
  const w = 'www.lufthansa.com';
  assert.equal(soloHref('/de/en/baggage', page, w), '/de/en/baggage.solo_continue');
  assert.equal(soloHref('/de/en/baggage.solo_continue', page, w), null);
  assert.equal(soloHref('/de/en', page, w), 'https://www.lufthansa.com.solo_continue/');
  assert.equal(soloHref('/', page, w), 'https://www.lufthansa.com.solo_continue/');
  assert.equal(soloHref('https://www.lufthansa.com/gb/en/homepage', page, w), 'https://www.lufthansa.com.solo_continue/');
  assert.equal(soloHref('/de/en/profile/logout?x', page, w), null);
  assert.equal(soloHref('mailto:a@b.c', page, w), null);
  assert.equal(soloHref('/de/en/x.html', page, w), '/de/en/x.solo_continue');
  assert.equal(absolutize('./media_1.png', page), '/de/en/media_1.png');
  assert.equal(absolutize('/x', page), null);
});
