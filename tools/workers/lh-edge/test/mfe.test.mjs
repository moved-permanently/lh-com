/* eslint-disable max-len */
/* AMS rest A4 part 2: POST <page>.mfe.html (micro-frontend hand-off) */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import worker, { routeOf } from '../src/index.js';
import {
  filterFields, allowedName, mfePage, acceptsPost, withConfig, escapeHtml,
} from '../src/mfe.js';

const HOST = 'https://lh-edge.example';
const ORIGIN = 'main--lh-com--moved-permanently.aem.live';
const env = { ORIGIN, PUBLIC_HOST: '', EDGE_TTL: '60' };
const TRIP = '/de/en/book-and-manage/trip-management';
const page = (meta) => `<!DOCTYPE html><html><head><title>Trip</title>${meta}<meta name="description" content="post-handler true"></head><body><main><div><div class="micro-frontend"><div><div>trip-management</div></div></div></div></main></body></html>`;
const PAGES = {
  [TRIP]: page('<meta name="post-handler" content="true">'),
  '/de/en/baggage': page(''),
};

let originCalls;
beforeEach(() => {
  originCalls = [];
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input);
    const u = new URL(req.url);
    originCalls.push({ path: u.pathname, method: init.method || req.method, body: req.body });
    const html = PAGES[u.pathname];
    if (!html) return new Response('<html>404</html>', { status: 404, headers: { 'content-type': 'text/html' } });
    return new Response(html, {
      headers: {
        'content-type': 'text/html; charset=utf-8', 'cache-control': 'max-age=7200', etag: '"e1"', 'content-security-policy': "script-src 'nonce-aem'",
      },
    });
  };
});

const post = (path, body, headers = {}) => worker.fetch(new Request(`${HOST}${path}`, { method: 'POST', body, headers }), env);
const configOf = (html) => {
  const m = html.match(/<div class="micro-frontend" data-config="([^"]*)"/);
  return m ? JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')) : null;
};

test('mfe: the route and the page path', () => {
  assert.equal(routeOf(new Request(`${HOST}${TRIP}.mfe.html`, { method: 'POST' })).name, 'mfe');
  assert.equal(routeOf(new Request(`${HOST}${TRIP}.mfe.html`)).name, 'mfe');
  assert.equal(mfePage(`${TRIP}.mfe.html`), TRIP);
  assert.equal(mfePage(`/content/lh/markets${TRIP}.mfe.html`), TRIP);
});

test('mfe: a POST to the trip management page renders the block with the filtered fields', async () => {
  const body = new URLSearchParams([
    ['orderId', 'ABC123'], ['firstName', 'Erika'], ['lastName', 'Mustermann'], ['segment', 'FRA'], ['segment', 'JFK'],
    ['password', 'x'], ['accessToken', 'x'], ['client_secret', 'x'], ['Cookie', 'x'], ['Authorization', 'x'], [':redirect', '/x'],
    ['redirectUrl', 'x'], ['host', 'x'], ['script', 'x'], ['_charset_', 'utf-8'], ['a:b', 'x'], ['note', '"<b>&\''], ['long', 'x'.repeat(257)], ['quotes', '"'.repeat(50)],
  ]);
  const res = await post(`${TRIP}.mfe.html`, body);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('cache-control'), 'private, no-store');
  assert.equal(res.headers.get('etag'), null);
  assert.equal(res.headers.get('content-security-policy'), "script-src 'nonce-aem'", 'the page keeps its CSP');
  const html = await res.text();
  assert.deepEqual(configOf(html), {
    orderId: 'ABC123', firstName: 'Erika', lastName: 'Mustermann', segment: 'FRA,JFK', note: '"<b>&\'',
  });
  assert.ok(!/<b>/.test(html.split('data-config="')[1].split('"')[0]), 'escaped in the attribute');
  assert.deepEqual(originCalls.map((c) => [c.path, c.method, c.body]), [[TRIP, 'GET', null]], 'the page is read with GET, without the body');
});

test('mfe: multipart works too; files are dropped; a page without post-handler and a missing page answer 403', async () => {
  const fd = new FormData();
  fd.append('orderId', 'XYZ789');
  fd.append('upload', new File(['x'], 'x.txt'));
  const res = await post(`/content/lh/markets${TRIP}.mfe.html`, fd);
  assert.equal(res.status, 200);
  assert.deepEqual(configOf(await res.text()), { orderId: 'XYZ789' });
  const other = await post('/de/en/baggage.mfe.html', new URLSearchParams({ orderId: 'A' }));
  assert.equal(other.status, 403);
  assert.match(await other.text(), /does not accept posted data/);
  assert.equal(other.headers.get('content-type'), 'text/plain; charset=utf-8');
  assert.equal((await post('/de/en/nothing-here.mfe.html', 'a=1', { 'content-type': 'application/x-www-form-urlencoded' })).status, 403);
});

test('mfe: GET answers like the page; other methods 405; bodies over 64 KB 413', async () => {
  const get = await worker.fetch(new Request(`${HOST}${TRIP}.mfe.html`), env);
  assert.equal(get.status, 200);
  assert.equal(await get.text(), PAGES[TRIP]);
  assert.equal((await worker.fetch(new Request(`${HOST}/de/en/nothing.mfe.html`), env)).status, 404);
  assert.equal((await worker.fetch(new Request(`${HOST}${TRIP}.mfe.html`, { method: 'PUT', body: 'a=1' }), env)).status, 405);
  assert.equal((await post(`${TRIP}.mfe.html`, `a=${'x'.repeat(70000)}`, { 'content-type': 'application/x-www-form-urlencoded' })).status, 413);
});

test('mfe helpers: names, the 256-character limit after escaping, the meta tag, the attribute', () => {
  ['orderId', 'firstName', 'pnr', 'segment.1', 'origin'].forEach((n) => assert.ok(allowedName(n), n));
  ['passwd', 'PIN_password', 'id_token', 'secretKey', 'sessionId', 'x-auth', 'apiKey', 'returnUrl', 'callback', 'csrf', 'scriptSrc', 'a:b', '_x', 'a b', ''].forEach((n) => assert.ok(!allowedName(n), n));
  assert.deepEqual(filterFields([['a', ['x'.repeat(256)]], ['b', ['&'.repeat(52)]], ['c', ['&'.repeat(51)]]]), { a: 'x'.repeat(256), c: '&'.repeat(51) });
  assert.equal(escapeHtml('&'.repeat(51)).length, 255);
  assert.equal(Object.keys(filterFields(Array.from({ length: 60 }, (_, i) => [`f${i}`, ['v']]))).length, 50);
  assert.ok(acceptsPost('<head><meta name="post-handler" content="true"></head>'));
  assert.ok(acceptsPost('<head><meta content="True" name="post-handler"/></head>'));
  assert.ok(!acceptsPost('<head><meta name="post-handler" content="false"></head>'));
  assert.ok(!acceptsPost('<head></head><body><meta name="post-handler" content="true"></body>'));
  assert.equal(withConfig('<div class="other"></div>', { a: 1 }), '<div class="other"></div>');
  assert.equal(withConfig('<div class="micro-frontend block"></div>', { a: '"' }), '<div class="micro-frontend block" data-config="{&quot;a&quot;:&quot;\\&quot;&quot;}"></div>');
});
