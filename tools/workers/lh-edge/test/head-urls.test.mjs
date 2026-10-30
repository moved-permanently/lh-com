/* eslint-disable max-len */
/* Head URLs on the turnsthe.page brand hosts (src/head-urls.js): canonical, alternates, og:url,
   og:image(:*) and twitter:* naming another production host (HEAD_URLS_FROM, here prod.example;
   "" in wrangler.toml since the production host is lufthansa.turnsthe.page) point at the host (an alias host: its
   brand's main host); body links, .plain.html, non-HTML answers and every other host untouched. */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { headUrlHost, moved } from '../src/head-urls.js';
import { resetRouterCache } from '../src/router.js';

globalThis.HTMLRewriter = HTMLRewriter;
const ORIGIN = 'main--lh-com--moved-permanently.aem.live';
const PAGE = `<!DOCTYPE html><html><head><title>Baggage | Lufthansa</title>
<link rel="canonical" href="https://prod.example/de/en/baggage">
<link rel="alternate" hreflang="de-DE" href="https://prod.example/de/de/gepaeck">
<link rel="alternate" hreflang="x-default" href="https://www.lufthansa.com/xx/en/baggage">
<meta property="og:url" content="https://prod.example/de/en/baggage">
<meta property="og:image" content="https://prod.example/de/en/media_1.jpg?width=1200">
<meta property="og:image:secure_url" content="https://prod.example/de/en/media_1.jpg?width=1200">
<meta name="twitter:image" content="https://prod.example/de/en/media_1.jpg?width=1200">
<meta property="og:title" content="https://prod.example/not-a-url-field">
<link rel="stylesheet" href="https://prod.example/styles/styles.css">
</head><body><a href="https://prod.example/de/en/homepage">home</a></body></html>`;
const env = (extra = {}) => ({
  ORIGIN,
  WWW_HOST: 'www.lufthansa.com',
  EDGE_TTL: '60',
  HEAD_URLS_FROM: 'prod.example',
  FRONT_DOOR_HOSTS: 'lufthansa.turnsthe.page',
  ALIAS_HOSTS: 'lufthansa-cn.turnsthe.page',
  ALIAS_REWRITE_HOSTS: 'prod.example,lufthansa.turnsthe.page,lufthansa-edge.turnsthe.page',
  ...extra,
});
beforeEach(() => {
  resetRouterCache();
  globalThis.fetch = async (input) => {
    const u = new URL((input instanceof Request ? input : new Request(input)).url);
    if (u.pathname.endsWith('.json')) return Response.json({ data: [] });
    if (u.pathname.endsWith('.plain.html')) return new Response('<div><link rel="canonical" href="https://prod.example/x"></div>', { headers: { 'content-type': 'text/html' } });
    return new Response(PAGE, { headers: { 'content-type': 'text/html; charset=utf-8' } });
  };
});
const get = async (host, path = '/de/en/baggage', extra = {}) => (await worker.fetch(new Request(`https://${host}${path}`), env(extra), { waitUntil: () => {} })).text();
// the hosts of the elements the rewrite covers (canonical, alternate, og:url, og:image*, twitter:*)
const heads = (html) => [...html.split('</head>')[0].matchAll(/<(?:link rel="(?:canonical|alternate)"[^>]*href|meta (?:property|name)="(?:og:url|og:image[^"]*|twitter:[^"]*)" content)="(https:\/\/[^/"]+)/g)].map((m) => m[1]);

test('a turnsthe.page host: the head URLs of HEAD_URLS_FROM (prod.example) point at the host; nothing else changes', async () => {
  for (const host of ['lufthansa.turnsthe.page', 'lufthansa-edge.turnsthe.page']) { // eslint-disable-line no-restricted-syntax
    const html = await get(host); // eslint-disable-line no-await-in-loop
    const out = `https://${host}`;
    assert.match(html, new RegExp(`<link rel="canonical" href="${out}/de/en/baggage">`), host);
    assert.match(html, new RegExp(`hreflang="de-DE" href="${out}/de/de/gepaeck"`));
    assert.match(html, /hreflang="x-default" href="https:\/\/www\.lufthansa\.com\/xx\/en\/baggage"/, 'other hosts stay');
    ['og:url" content="', 'og:image" content="', 'og:image:secure_url" content="', 'twitter:image" content="'].forEach((k) => assert.ok(html.includes(`${k}${out}/`), `${host} ${k}`));
    assert.ok(html.includes('og:title" content="https://prod.example/not-a-url-field"'), 'other meta untouched');
    assert.ok(html.includes('rel="stylesheet" href="https://prod.example/styles/styles.css"'), 'other links untouched');
    assert.ok(html.includes('<a href="https://prod.example/de/en/homepage">'), 'body untouched');
  }
});

test('other hosts, .plain.html, non-HTML and HEAD_URLS_FROM empty: byte for byte the origin\'s', async () => {
  for (const host of ['main--lh-com--moved-permanently.aem.live', 'prod.example', 'demo2.turnsthe.page']) { // eslint-disable-line no-restricted-syntax
    assert.equal(await get(host), PAGE, host); // eslint-disable-line no-await-in-loop
  }
  assert.equal(await get('lufthansa-edge.turnsthe.page', '/de/en/baggage.plain.html'), '<div><link rel="canonical" href="https://prod.example/x"></div>');
  assert.equal(await get('lufthansa-edge.turnsthe.page', '/de/en/baggage', { HEAD_URLS_FROM: '' }), PAGE);
  // a request to another host that names a turnsthe.page host as public host: still no rewriter
  const forged = await worker.fetch(new Request('https://main--lh-com--moved-permanently.aem.live/de/en/baggage', { headers: { 'x-lh-public-host': 'lufthansa.turnsthe.page' } }), env(), {});
  assert.equal(await forged.text(), PAGE);
  assert.equal(headUrlHost(new Request('https://prod.example/x'), env(), null), null);
});

test('alias hosts: lufthansa-cn points its head URLs at lufthansa.turnsthe.page', async () => {
  const cn = await get('lufthansa-cn.turnsthe.page');
  assert.deepEqual([...new Set(heads(cn))].sort(), ['https://lufthansa.turnsthe.page', 'https://www.lufthansa.com'].sort());
  assert.ok(cn.includes('<a href="https://lufthansa-cn.turnsthe.page/de/en/homepage">'), 'the alias still moves body links to itself');
});

test('URL forms: the host itself, a path, a query or fragment; not another host that starts the same', () => {
  const to = 'lufthansa.turnsthe.page';
  assert.equal(moved('https://prod.example', 'prod.example', to), 'https://lufthansa.turnsthe.page');
  assert.equal(moved('https://prod.example/de/en/x?a=1#b', 'prod.example', to), 'https://lufthansa.turnsthe.page/de/en/x?a=1#b');
  assert.equal(moved('https://prod.example.example/x', 'prod.example', to), null);
  assert.equal(moved('http://prod.example/x', 'prod.example', to), null);
  assert.equal(moved('/de/en/x', 'prod.example', to), null);
});
