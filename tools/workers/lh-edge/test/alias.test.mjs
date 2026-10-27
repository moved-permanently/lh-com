/* eslint-disable max-len */
/* Alias hosts (brief 94, the China host): routing, link rewrite, cache header, redirects. */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import worker, { routeOf } from '../src/index.js';
import { toAlias, aliasHostOf } from '../src/alias.js';
import HTMLRewriter from './htmlrewriter-shim.mjs';

globalThis.HTMLRewriter = HTMLRewriter;
const env = {
  ORIGIN: 'main--lh-com--moved-permanently.aem.live',
  PUBLIC_HOST: '',
  EDGE_TTL: '60',
  ALIAS_HOSTS: 'lhcn.bbird.live',
  ALIAS_REWRITE_HOSTS: 'lhcom.bbird.live,lhedge.bbird.live',
  ALIAS_HTML_CACHE_CONTROL: 'public, max-age=28800',
};
const PAGE = `<!DOCTYPE html><html><head><title>Home</title>
<link rel="canonical" href="https://lhcom.bbird.live/de/en/homepage">
<link rel="alternate" hreflang="de-DE" href="https://lhcom.bbird.live/de/de/homepage">
<link rel="stylesheet" href="https://lhedge.bbird.live/styles/x.css">
<meta property="og:url" content="https://lhcom.bbird.live/de/en/homepage"></head><body><main>
<a href="https://lhcom.bbird.live/de/en/baggage">baggage</a>
<a href="https://lhedge.bbird.live/de/en/flights?x=1#top">flights</a>
<a href="https://www.lufthansa.com/de/en/travel-briefing">www</a>
<a href="/de/en/relative">relative</a>
<a href="https://partner.example.com/x">partner</a>
<img src="https://lhcom.bbird.live/de/en/media_1.jpg" srcset="https://lhcom.bbird.live/a.jpg 1x, /b.jpg 2x">
<form action="https://lhcom.bbird.live/de/en/search"></form>
</main></body></html>`;

let originCalls;
beforeEach(() => {
  originCalls = [];
  globalThis.fetch = async (input) => {
    const req = input instanceof Request ? input : new Request(input);
    const u = new URL(req.url);
    originCalls.push({ path: u.pathname, forwardedHost: req.headers.get('x-forwarded-host') });
    if (u.pathname === '/de/en/homepage') return new Response(PAGE, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'max-age=300' } });
    if (u.pathname === '/de/en/moved') return new Response(null, { status: 301, headers: { location: 'https://lhcom.bbird.live/de/en/baggage' } });
    if (u.pathname === '/de/en/away') return new Response(null, { status: 301, headers: { location: 'https://www.lufthansa.com/de/en/x' } });
    if (u.pathname === '/data.json') return Response.json({ link: 'https://lhcom.bbird.live/de/en/baggage' }, { headers: { 'cache-control': 'max-age=60' } });
    return new Response('nf', { status: 404, headers: { 'content-type': 'text/html' } });
  };
});
const get = (host, p) => worker.fetch(new Request(`https://${host}${p}`, { redirect: 'manual' }), env, {});

test('alias: routed like the main host (same routes, same origin)', async () => {
  assert.equal(aliasHostOf(new Request('https://LHCN.bbird.live/x'), env), 'lhcn.bbird.live');
  assert.equal(aliasHostOf(new Request('https://lhedge.bbird.live/x'), env), null);
  ['/de/en/homepage', '/content/lh/markets/de/en/homepage.csi-offline.json', '/graphql/execute.json/x/y', '/'].forEach((p) => {
    assert.equal(routeOf(new Request(`https://lhcn.bbird.live${p}`)).name, routeOf(new Request(`https://lhedge.bbird.live${p}`)).name, p);
  });
  const resp = await get('lhcn.bbird.live', '/de/en/homepage');
  assert.equal(resp.status, 200);
  assert.equal(originCalls[0].path, '/de/en/homepage');
});

test('alias: links to the replica\'s own hosts point at the alias host; canonical, hreflang and other hosts stay; HTML cached 8 hours', async () => {
  const resp = await get('lhcn.bbird.live', '/de/en/homepage');
  assert.equal(resp.headers.get('cache-control'), 'public, max-age=28800');
  const html = await resp.text();
  assert.match(html, /<link rel="canonical" href="https:\/\/lhcom\.bbird\.live\/de\/en\/homepage">/);
  assert.match(html, /<link rel="alternate" hreflang="de-DE" href="https:\/\/lhcom\.bbird\.live\/de\/de\/homepage">/);
  assert.match(html, /href="https:\/\/lhcn\.bbird\.live\/styles\/x\.css"/);
  assert.match(html, /href="https:\/\/lhcn\.bbird\.live\/de\/en\/baggage"/);
  assert.match(html, /href="https:\/\/lhcn\.bbird\.live\/de\/en\/flights\?x=1#top"/);
  assert.match(html, /href="https:\/\/www\.lufthansa\.com\/de\/en\/travel-briefing"/, 'www links stay');
  assert.match(html, /href="https:\/\/partner\.example\.com\/x"/);
  assert.match(html, /href="\/de\/en\/relative"/);
  assert.match(html, /src="https:\/\/lhcn\.bbird\.live\/de\/en\/media_1\.jpg"/);
  assert.match(html, /srcset="https:\/\/lhcn\.bbird\.live\/a\.jpg 1x, \/b\.jpg 2x"/);
  assert.match(html, /action="https:\/\/lhcn\.bbird\.live\/de\/en\/search"/);
  assert.match(html, /<meta property="og:url" content="https:\/\/lhcom\.bbird\.live\/de\/en\/homepage">/, 'meta tags are not links');
  assert.ok(!html.includes('lhedge.bbird.live'));
});

test('alias: redirects to the replica\'s hosts stay on the alias host; other answers keep their headers', async () => {
  const moved = await get('lhcn.bbird.live', '/de/en/moved');
  assert.equal(moved.status, 301);
  assert.equal(moved.headers.get('location'), 'https://lhcn.bbird.live/de/en/baggage');
  assert.equal((await get('lhcn.bbird.live', '/de/en/away')).headers.get('location'), 'https://www.lufthansa.com/de/en/x');
  const root = await get('lhcn.bbird.live', '/');
  const rootMain = await get('lhedge.bbird.live', '/');
  assert.equal(root.status, rootMain.status);
  assert.equal(root.headers.get('location'), rootMain.headers.get('location'), '/ redirects like / on the main host');
  const data = await get('lhcn.bbird.live', '/data.json');
  assert.equal(data.headers.get('cache-control'), 'max-age=60', 'JSON keeps its own cache header');
  assert.deepEqual(await data.json(), { link: 'https://lhcom.bbird.live/de/en/baggage' }, 'only HTML is rewritten');
});

test('alias: non-alias hosts are unchanged', async () => {
  const resp = await get('lhedge.bbird.live', '/de/en/homepage');
  assert.equal(resp.headers.get('cache-control'), 'max-age=60', 'the main host keeps the EDGE_TTL cap');
  const html = await resp.text();
  assert.match(html, /href="https:\/\/lhcom\.bbird\.live\/de\/en\/baggage"/);
  assert.ok(!html.includes('lhcn'));
  const off = await worker.fetch(new Request('https://lhcn.bbird.live/de/en/homepage'), { ...env, ALIAS_HOSTS: '' }, {});
  assert.ok(!(await off.text()).includes('lhcn'), 'without ALIAS_HOSTS nothing is an alias');
  assert.equal(toAlias('//lhcom.bbird.live/x', ['lhcom.bbird.live'], 'lhcn.bbird.live'), '//lhcn.bbird.live/x');
  assert.equal(toAlias('mailto:x@lhcom.bbird.live', ['lhcom.bbird.live'], 'lhcn.bbird.live'), null);
});
