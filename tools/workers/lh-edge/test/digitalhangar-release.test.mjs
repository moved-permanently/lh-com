/* eslint-disable max-len, max-classes-per-file */
/* /digitalhangar/ release files (src/digitalhangar.js): www publishes each design-system release in
   its own folder (/digitalhangar/design-system/releases/mausy-v1.40.1/...), so a file there never
   changes. They are kept in this zone's cache (Cache API) for a year: a miss fetches the whole file
   from www and stores only a 200; 200, 206 and 304 go to the browser with a year (immutable). Any
   other answer keeps www's headers and is never stored. Paths without a release version: as before.
   The cache below behaves as Cloudflare's: match answers If-None-Match with 304, Range with 206,
   put refuses a 206. */
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { isReleasePath, YEAR } from '../src/digitalhangar.js';

globalThis.HTMLRewriter = HTMLRewriter;

const REL = '/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/fonts';
const FONT = `${REL}/lufthansa/LufthansaTextWeb-Regular.woff2`;
const env = () => ({
  ORIGIN: 'main--lh-com--moved-permanently.aem.live',
  WWW_HOST: 'www.lufthansa.com',
  FRONT_DOOR_HOSTS: 'front.example',
  SITE_HOSTS: 'discover.example=discover; cargo.example=cargo',
  SITE_ORIGINS: 'discover=main--lh-discover--moved-permanently.aem.live; cargo=main--lh-cargo--moved-permanently.aem.live',
  SITE_WWW_HOSTS: 'discover=www.discover-airlines.com; cargo=www.lufthansa-cargo.com',
  SITE_DESIGN_HOSTS: 'discover=www.discover-airlines.com; cargo=www.lufthansa.com',
});
const BODY = 'wOF2 font file';
const WWW = {
  'content-type': 'font/woff2', 'cache-control': 'public, max-age=300', expires: 'Fri, 30 Oct 2026 13:07:39 GMT', 'access-control-allow-origin': '*', etag: '"892667"', 'set-cookie': '__cf_bm=1; domain=.lufthansa.com', 'cf-cache-status': 'HIT', age: '42',
};

/** Cloudflare's Cache API as documented: conditional and Range matches, no 206 put, no Set-Cookie. */
class FakeCache {
  constructor() { this.store = new Map(); this.puts = []; }

  async put(key, resp) {
    const k = typeof key === 'string' ? key : key.url;
    if (resp.status === 206) throw new TypeError('Cannot cache response to a range request (206 Partial Content).');
    if (resp.headers.has('set-cookie')) throw new TypeError('Set-Cookie');
    this.puts.push({ key: k, status: resp.status, headers: Object.fromEntries(resp.headers) });
    this.store.set(k, { status: resp.status, headers: new Headers(resp.headers), body: await resp.text() });
  }

  async match(req) {
    const r = typeof req === 'string' ? new Request(req) : req;
    const e = this.store.get(r.url);
    if (!e) return undefined;
    if (r.headers.get('if-none-match') && r.headers.get('if-none-match') === e.headers.get('etag')) {
      return new Response(null, { status: 304, headers: { etag: e.headers.get('etag'), 'cache-control': e.headers.get('cache-control') } });
    }
    const range = (r.headers.get('range') || '').match(/^bytes=(\d+)-(\d+)$/);
    if (range) {
      const [a, b] = [Number(range[1]), Number(range[2])];
      const h = new Headers(e.headers);
      h.set('content-range', `bytes ${a}-${b}/${e.body.length}`);
      return new Response(e.body.slice(a, b + 1), { status: 206, headers: h });
    }
    return new Response(e.body, { status: e.status, headers: e.headers });
  }
}

let calls;
let cache;
beforeEach(() => {
  calls = [];
  cache = new FakeCache();
  globalThis.caches = { default: cache };
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input, init);
    const u = new URL(req.url);
    calls.push({ url: req.url, headers: Object.fromEntries(req.headers), init });
    if (u.pathname.includes('/missing')) return new Response('<html>404</html>', { status: 404, headers: { 'content-type': 'text/html', 'cache-control': 'max-age=60' } });
    if (u.pathname.includes('/challenged')) return new Response('<html>Just a moment...</html>', { status: 403, headers: { 'content-type': 'text/html', 'cache-control': 'private, max-age=0, no-store' } });
    if (u.pathname.includes('/broken')) return new Response('oops', { status: 503, headers: { 'content-type': 'text/plain' } });
    if (u.pathname.includes('/moved')) return new Response(null, { status: 302, headers: { location: 'https://www.lufthansa.com/x', 'cache-control': 'max-age=60' } });
    if (req.headers.get('if-none-match') === '"892667"') return new Response(null, { status: 304, headers: { etag: '"892667"', 'cache-control': 'public, max-age=300' } });
    if (req.headers.get('range')) return new Response('wO', { status: 206, headers: { ...WWW, 'content-range': 'bytes 0-1/14' } });
    return new Response(req.method === 'HEAD' ? null : BODY, { headers: WWW });
  };
});
afterEach(() => { delete globalThis.caches; });
const get = (host, path, headers = {}, method = 'GET') => worker.fetch(new Request(`https://${host}${path}`, { method, headers }), env(), { waitUntil() {} });

test('isReleasePath: a folder under releases/ with a version v<n>.<n>.<n>', () => {
  assert.ok(isReleasePath(FONT));
  assert.ok(isReleasePath('/digitalhangar/design-system/releases/v1.38.0/standalone/css/discover.css'));
  ['/digitalhangar/design-system/releases/latest/standalone/fonts/x.woff2', '/digitalhangar/design-system/releases/mausy-v1.40/x.css',
    '/digitalhangar/design-system/releases/mausy-v1.40.1', '/digitalhangar/design-system/releases/mausy-v1.40.1/', '/digitalhangar/design-system/standalone/v1.40.1/x.css',
    '/digitalhangar/design-system/releases/mausy-v1.40.1-rc1/x.css', '/digitalhangar/other/releases/mausy-v1.40.1/x.css']
    .forEach((p) => assert.ok(!isReleasePath(p), p));
});

test('a release file\'s 200: stored for a year in this zone\'s cache, then answered from it; ETag, type and CORS as www sends them, no cookies', async () => {
  for (const host of ['lh-edge.example', 'front.example', 'discover.example', 'cargo.example']) { // eslint-disable-line no-restricted-syntax
    calls = [];
    const first = await get(host, FONT, { cookie: 'lh-geo=DE-HH' }); // eslint-disable-line no-await-in-loop
    assert.equal(first.status, 200, host);
    assert.equal(await first.text(), BODY); // eslint-disable-line no-await-in-loop
    assert.equal(first.headers.get('x-lh-edge-cache'), 'miss');
    assert.equal(first.headers.get('cache-control'), YEAR, host);
    assert.equal(YEAR, 'public, max-age=31536000, immutable');
    assert.equal(first.headers.get('expires'), null, 'www\'s 5-minute Expires would contradict the year');
    assert.equal(first.headers.get('etag'), '"892667"');
    assert.equal(first.headers.get('content-type'), 'font/woff2');
    assert.equal(first.headers.get('access-control-allow-origin'), '*');
    assert.equal(first.headers.get('set-cookie'), null);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].headers.cookie, undefined);
    const second = await get(host, FONT); // eslint-disable-line no-await-in-loop
    assert.equal(second.headers.get('x-lh-edge-cache'), 'hit', `${host}: from this zone's cache`);
    assert.equal(await second.text(), BODY); // eslint-disable-line no-await-in-loop
    assert.equal(second.headers.get('cache-control'), YEAR);
    assert.equal(second.headers.get('etag'), '"892667"');
    assert.equal(calls.length, 1, `${host}: no second request to www`);
  }
  // one stored copy per host, the year as its TTL, www's cache state and cookies left out
  assert.equal(cache.puts.length, 4);
  cache.puts.forEach((p) => {
    assert.equal(p.status, 200);
    assert.equal(p.headers['cache-control'], YEAR);
    ['set-cookie', 'expires', 'age', 'cf-cache-status'].forEach((h) => assert.equal(p.headers[h], undefined, h));
    assert.match(p.key, /\?digitalhangar-release=1&from=www\./);
  });
  assert.ok(cache.puts.some((p) => p.key.startsWith('https://discover.example/') && p.key.endsWith('from=www.discover-airlines.com')));
  assert.ok(cache.puts.some((p) => p.key.startsWith('https://cargo.example/') && p.key.endsWith('from=www.lufthansa.com')));
});

test('a release file\'s 206 and 304 come from the stored copy with the year; www gets the whole file once', async () => {
  const part = await get('front.example', FONT, { range: 'bytes=0-3' });
  assert.equal(part.status, 206);
  assert.equal(await part.text(), 'wOF2');
  assert.equal(part.headers.get('cache-control'), YEAR);
  assert.equal(part.headers.get('content-range'), 'bytes 0-3/14');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].headers.range, undefined, 'the whole file from www, so a 200 can be stored');
  assert.equal(cache.puts[0].status, 200);
  const same = await get('front.example', FONT, { 'if-none-match': '"892667"' });
  assert.equal(same.status, 304);
  assert.equal(same.headers.get('cache-control'), YEAR, 'the browser\'s copy gets the year too');
  assert.equal(same.headers.get('etag'), '"892667"');
  assert.equal(same.headers.get('x-lh-edge-cache'), 'hit');
  assert.equal(calls.length, 1);
  // a revalidation on a cold cache: the whole file from www, stored, then the 304
  const cold = await get('discover.example', FONT, { 'if-none-match': '"892667"' });
  assert.equal(cold.status, 304);
  assert.equal(cold.headers.get('cache-control'), YEAR);
  assert.equal(calls.at(-1).headers['if-none-match'], undefined);
});

test('a release path\'s failed answers (404, 403 challenge, 503, a redirect): www\'s headers, never stored', async () => {
  const cases = [['missing', 404, 'max-age=60'], ['challenged', 403, 'private, max-age=0, no-store'], ['broken', 503, null], ['moved', 302, 'max-age=60']];
  for (const [name, status, cc] of cases) { // eslint-disable-line no-restricted-syntax
    for (let i = 0; i < 2; i += 1) {
      const resp = await get('lh-edge.example', `${REL}/lufthansa/${name}.woff2`); // eslint-disable-line no-await-in-loop
      assert.equal(resp.status, status, name);
      assert.equal(resp.headers.get('cache-control'), cc, name);
      assert.equal(resp.headers.get('x-lh-edge-cache'), 'pass');
    }
  }
  assert.equal(cache.puts.length, 0, 'nothing stored');
  assert.equal(calls.length, 8, 'every request to www');
  assert.equal((await get('lh-edge.example', `${REL}/lufthansa/moved.woff2`)).headers.get('location'), 'https://www.lufthansa.com/x');
});

test('a path without a release version: www\'s headers and conditions as before, nothing stored', async () => {
  for (const p of ['/digitalhangar/design-system/releases/latest/standalone/fonts/x.woff2', '/digitalhangar/info.json']) { // eslint-disable-line no-restricted-syntax
    const resp = await get('lh-edge.example', p); // eslint-disable-line no-await-in-loop
    assert.equal(resp.status, 200, p);
    assert.equal(resp.headers.get('cache-control'), 'public, max-age=300', p);
    assert.equal(resp.headers.get('expires'), WWW.expires);
    assert.equal(resp.headers.get('x-lh-edge-cache'), null);
    assert.deepEqual(calls.at(-1).init.cf, { cacheEverything: true }, p);
  }
  const reval = await get('lh-edge.example', '/digitalhangar/info.json', { 'if-none-match': '"892667"' });
  assert.equal(reval.status, 304);
  assert.equal(reval.headers.get('cache-control'), 'public, max-age=300');
  assert.equal(cache.puts.length, 0);
});

test('HEAD: as GET without a body, the release year included', async () => {
  const head = await get('cargo.example', FONT, {}, 'HEAD');
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  assert.equal(head.headers.get('cache-control'), YEAR);
  assert.equal(head.headers.get('etag'), '"892667"');
  assert.equal(calls.at(-1).init.method, 'GET', 'the whole file from www, so it can be stored');
  const again = await get('cargo.example', FONT, {}, 'HEAD');
  assert.equal(again.headers.get('x-lh-edge-cache'), 'hit');
  assert.equal(await again.text(), '');
  const plain = await get('cargo.example', '/digitalhangar/info.json', {}, 'HEAD');
  assert.equal(plain.headers.get('cache-control'), 'public, max-age=300');
  assert.equal(calls.at(-1).init.method, 'HEAD');
});

test('without a Cache API (local runs): the request as before, the year on a release file\'s 200 and 304', async () => {
  delete globalThis.caches;
  const resp = await get('lh-edge.example', FONT);
  assert.equal(resp.headers.get('cache-control'), YEAR);
  const same = await get('lh-edge.example', FONT, { 'if-none-match': '"892667"' });
  assert.equal(same.status, 304);
  assert.equal(same.headers.get('cache-control'), YEAR);
  assert.equal(calls.at(-1).headers['if-none-match'], '"892667"');
});
