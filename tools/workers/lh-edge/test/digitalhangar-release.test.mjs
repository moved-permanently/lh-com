/* eslint-disable max-len */
/* /digitalhangar/ release files (src/digitalhangar.js): www publishes each design-system release in
   its own folder (/digitalhangar/design-system/releases/mausy-v1.40.1/...), so a file there never
   changes. Its 200, 206 and 304 answers get a year (immutable) in the browser, 2xx a year at the
   edge (cf.cacheTtlByStatus); any other answer keeps www's headers and is never kept at the edge.
   Paths without a release version: www's headers and the edge as before. */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { isReleasePath, YEAR } from '../src/digitalhangar.js';

globalThis.HTMLRewriter = HTMLRewriter;

const REL = '/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/fonts';
const env = () => ({
  ORIGIN: 'main--lh-com--moved-permanently.aem.live',
  WWW_HOST: 'www.lufthansa.com',
  FRONT_DOOR_HOSTS: 'front.example',
  SITE_HOSTS: 'discover.example=discover; cargo.example=cargo',
  SITE_ORIGINS: 'discover=main--lh-discover--moved-permanently.aem.live; cargo=main--lh-cargo--moved-permanently.aem.live',
  SITE_WWW_HOSTS: 'discover=www.discover-airlines.com; cargo=www.lufthansa-cargo.com',
  SITE_DESIGN_HOSTS: 'discover=www.discover-airlines.com; cargo=www.lufthansa.com',
});
const WWW = {
  'content-type': 'font/woff2', 'cache-control': 'public, max-age=300', expires: 'Fri, 30 Oct 2026 13:07:39 GMT', 'access-control-allow-origin': '*', etag: '"892667"', 'set-cookie': '__cf_bm=1; domain=.lufthansa.com',
};
let calls;
beforeEach(() => {
  calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input, init);
    const u = new URL(req.url);
    calls.push({ url: req.url, headers: Object.fromEntries(req.headers), init });
    if (u.pathname.includes('/missing')) return new Response('<html>404</html>', { status: 404, headers: { 'content-type': 'text/html', 'cache-control': 'max-age=60' } });
    if (u.pathname.includes('/challenged')) return new Response('<html>Just a moment...</html>', { status: 403, headers: { 'content-type': 'text/html', 'cache-control': 'private, max-age=0, no-store' } });
    if (u.pathname.includes('/broken')) return new Response('oops', { status: 503, headers: { 'content-type': 'text/plain' } });
    if (u.pathname.includes('/moved')) return new Response(null, { status: 302, headers: { location: 'https://www.lufthansa.com/x', 'cache-control': 'max-age=60' } });
    if (req.headers.get('if-none-match') === '"892667"') return new Response(null, { status: 304, headers: { etag: '"892667"', 'cache-control': 'public, max-age=300' } });
    if (req.headers.get('range')) return new Response('wO', { status: 206, headers: { ...WWW, 'content-range': 'bytes 0-1/51648' } });
    return new Response('wOF2 font', { headers: WWW });
  };
});
const get = (host, path, headers = {}, method = 'GET') => worker.fetch(new Request(`https://${host}${path}`, { method, headers }), env(), { waitUntil() {} });
const EDGE_YEAR = { cacheEverything: true, cacheTtlByStatus: { '200-299': 31536000, '300-599': -1 } };

test('isReleasePath: a folder under releases/ with a version v<n>.<n>.<n>', () => {
  assert.ok(isReleasePath(`${REL}/lufthansa/LufthansaTextWeb-Regular.woff2`));
  assert.ok(isReleasePath('/digitalhangar/design-system/releases/v1.38.0/standalone/css/discover.css'));
  ['/digitalhangar/design-system/releases/latest/standalone/fonts/x.woff2', '/digitalhangar/design-system/releases/mausy-v1.40/x.css',
    '/digitalhangar/design-system/releases/mausy-v1.40.1', '/digitalhangar/design-system/releases/mausy-v1.40.1/', '/digitalhangar/design-system/standalone/v1.40.1/x.css',
    '/digitalhangar/design-system/releases/mausy-v1.40.1-rc1/x.css', '/digitalhangar/other/releases/mausy-v1.40.1/x.css']
    .forEach((p) => assert.ok(!isReleasePath(p), p));
});

test('a release file\'s 200: a year in the browser and at the edge; ETag, type and CORS as www sends them, no cookies', async () => {
  for (const host of ['lh-edge.example', 'front.example', 'discover.example', 'cargo.example']) { // eslint-disable-line no-restricted-syntax
    calls = [];
    const resp = await get(host, `${REL}/lufthansa/LufthansaTextWeb-Regular.woff2`, { cookie: 'lh-geo=DE-HH' }); // eslint-disable-line no-await-in-loop
    assert.equal(resp.status, 200, host);
    assert.equal(await resp.text(), 'wOF2 font'); // eslint-disable-line no-await-in-loop
    assert.equal(resp.headers.get('cache-control'), YEAR, host);
    assert.equal(YEAR, 'public, max-age=31536000, immutable');
    assert.equal(resp.headers.get('expires'), null, 'www\'s 5-minute Expires would contradict the year');
    assert.equal(resp.headers.get('etag'), '"892667"');
    assert.equal(resp.headers.get('content-type'), 'font/woff2');
    assert.equal(resp.headers.get('access-control-allow-origin'), '*');
    assert.equal(resp.headers.get('set-cookie'), null);
    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0].init.cf, EDGE_YEAR, host);
    assert.equal(calls[0].headers.cookie, undefined);
  }
});

test('a release file\'s 206 and 304 get the year too (the browser\'s copy after a revalidation)', async () => {
  const part = await get('front.example', `${REL}/lufthansa/LufthansaTextWeb-Regular.woff2`, { range: 'bytes=0-1' });
  assert.equal(part.status, 206);
  assert.equal(part.headers.get('cache-control'), YEAR);
  assert.equal(part.headers.get('content-range'), 'bytes 0-1/51648');
  assert.equal(calls.at(-1).headers.range, 'bytes=0-1');
  const same = await get('discover.example', `${REL}/lufthansa/LufthansaTextWeb-Regular.woff2`, { 'if-none-match': '"892667"' });
  assert.equal(same.status, 304);
  assert.equal(same.headers.get('cache-control'), YEAR);
  assert.equal(same.headers.get('etag'), '"892667"');
  assert.equal(calls.at(-1).headers['if-none-match'], '"892667"');
});

test('a release path\'s failed answers (404, 403 challenge, 503, a redirect): www\'s headers, never kept at the edge', async () => {
  const cases = [['missing', 404, 'max-age=60'], ['challenged', 403, 'private, max-age=0, no-store'], ['broken', 503, null], ['moved', 302, 'max-age=60']];
  for (const [name, status, cc] of cases) { // eslint-disable-line no-restricted-syntax
    const resp = await get('lh-edge.example', `${REL}/lufthansa/${name}.woff2`); // eslint-disable-line no-await-in-loop
    assert.equal(resp.status, status, name);
    assert.equal(resp.headers.get('cache-control'), cc, name);
    // the edge's rule: 2xx a year, everything from 300 to 599 not cached at all (negative TTL)
    assert.equal(calls.at(-1).init.cf.cacheTtlByStatus['300-599'], -1);
  }
  assert.equal((await get('lh-edge.example', `${REL}/lufthansa/moved.woff2`)).headers.get('location'), 'https://www.lufthansa.com/x');
});

test('a path without a release version: www\'s headers and the edge as before', async () => {
  for (const p of ['/digitalhangar/design-system/releases/latest/standalone/fonts/x.woff2', '/digitalhangar/info.json']) { // eslint-disable-line no-restricted-syntax
    const resp = await get('lh-edge.example', p); // eslint-disable-line no-await-in-loop
    assert.equal(resp.status, 200, p);
    assert.equal(resp.headers.get('cache-control'), 'public, max-age=300', p);
    assert.equal(resp.headers.get('expires'), WWW.expires);
    assert.deepEqual(calls.at(-1).init.cf, { cacheEverything: true }, p);
  }
});

test('HEAD: as GET without a body, the release year included', async () => {
  const head = await get('cargo.example', `${REL}/lufthansa/LufthansaTextWeb-Regular.woff2`, {}, 'HEAD');
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  assert.equal(head.headers.get('cache-control'), YEAR);
  assert.equal(head.headers.get('etag'), '"892667"');
  assert.equal(calls.at(-1).init.method, 'HEAD');
  assert.deepEqual(calls.at(-1).init.cf, EDGE_YEAR);
  const plain = await get('cargo.example', '/digitalhangar/info.json', {}, 'HEAD');
  assert.equal(plain.headers.get('cache-control'), 'public, max-age=300');
});
