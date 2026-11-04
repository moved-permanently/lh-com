/* eslint-disable max-len, no-restricted-syntax, no-await-in-loop */
/* AEM's media in Cloudflare's cache (brief 355, src/dam-aem.js): the publish tier's real file
   answers (200 with the file's media type and a length, up to 512 MB) are kept in this zone's
   cache (the Cache API) under one key per file for all hosts, versioned by EDGE_CACHE_VERSION, 30
   days (the visitors' max-age=2592000). A hit answers without AEM, a Range against the stored file
   as 206; a miss answers as before and stores the file on the way (no Range) or fills it in the
   background with one whole-file request (a Range); AEM's hibernation page (200 text/html),
   304, 5xx, a timeout and a file over 512 MB are never stored. DAM_AEM_CACHE=off: as before.
   Run: node --import ./test/cloudflare-workers-shim.mjs --test test/dam-aem-cache.test.mjs */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';
import { damCacheKey, DAM_CACHE_MAX_BYTES } from '../src/dam-aem.js';

const ORIGIN = 'main--lh-com--moved-permanently.aem.live';
const AEM = 'https://publish-p1-e2.adobeaemcloud.com';
const MP4 = '/content/dam/video/c3/202405-em/austragungsorte/lh-em-en-uts-lh-com.mp4';
const PNG = '/content/dam/lh/images/keepalive.png';
const BYTES = new Uint8Array(Array.from({ length: 1000 }, (_, i) => i % 256));

/** A stand-in for caches.default: stores 200s, answers a Range as 206 and If-None-Match as 304. */
class FakeCache {
  constructor() { this.store = new Map(); this.puts = []; }

  async put(key, resp) {
    const url = typeof key === 'string' ? key : key.url;
    assert.equal(resp.status, 200, 'only a 200 is stored');
    const body = new Uint8Array(await resp.arrayBuffer());
    this.puts.push(url);
    this.store.set(url, { headers: new Headers(resp.headers), body });
  }

  async match(key) {
    const req = typeof key === 'string' ? new Request(key) : key;
    const hit = this.store.get(req.url);
    if (!hit) return undefined;
    const headers = new Headers(hit.headers);
    if (req.headers.get('if-none-match') && req.headers.get('if-none-match') === headers.get('etag')) {
      return new Response(null, { status: 304, headers });
    }
    const range = (req.headers.get('range') || '').match(/^bytes=(\d+)-(\d*)$/);
    if (range) {
      const start = Number(range[1]);
      const end = range[2] ? Number(range[2]) : hit.body.length - 1;
      headers.set('content-range', `bytes ${start}-${end}/${hit.body.length}`);
      headers.set('content-length', String(end - start + 1));
      return new Response(hit.body.slice(start, end + 1), { status: 206, headers });
    }
    return new Response(hit.body, { status: 200, headers });
  }
}

let calls;
let aem;
let cache;
let pending;
beforeEach(() => {
  calls = [];
  pending = [];
  cache = new FakeCache();
  globalThis.caches = { default: cache };
  aem = (req) => {
    const range = req.headers.get('range');
    const type = req.url.endsWith('.png') ? 'image/png' : 'video/mp4';
    const headers = {
      'content-type': type, 'accept-ranges': 'bytes', etag: '"aem"', 'last-modified': 'Tue, 27 Oct 2026 10:00:00 GMT', 'set-cookie': 'a=b',
    };
    if (range) return new Response(BYTES.slice(0, 100), { status: 206, headers: { ...headers, 'content-range': `bytes 0-99/${BYTES.length}`, 'content-length': '100' } });
    return new Response(req.method === 'HEAD' ? null : BYTES, { headers: { ...headers, 'content-length': String(BYTES.length) } });
  };
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input, init);
    calls.push({ url: req.url, method: req.method, headers: Object.fromEntries(req.headers) });
    if (req.url.startsWith(AEM)) return aem(req, init);
    if (new URL(req.url).hostname === ORIGIN) return new Response('Not found', { status: 404 });
    return new Response('Not found', { status: 404 });
  };
});

const env = (extra = {}) => ({
  ORIGIN, PUBLIC_HOST: '', EDGE_TTL: '60', AEM_PUBLISH: AEM, EDGE_CACHE_VERSION: '2026-11-05a', ...extra,
});
const ctx = { waitUntil: (p) => { pending.push(p); } };
const settle = async () => { while (pending.length) await pending.shift(); };
const get = (host, p, init, e = env()) => worker.fetch(new Request(`https://${host}${p}`, init), e, ctx);
const aemCalls = () => calls.filter((c) => c.url.startsWith(AEM));

test('a miss answers as before and stores the file on the way; the next request (another host) is a hit without AEM', async () => {
  const first = await get('lufthansa.turnsthe.page', MP4);
  assert.equal(first.status, 200);
  assert.equal(first.headers.get('x-lh-edge-cache'), 'miss');
  assert.equal(first.headers.get('cache-control'), 'public, max-age=2592000');
  assert.deepEqual(new Uint8Array(await first.arrayBuffer()), BYTES);
  await settle();
  assert.deepEqual(cache.puts, [damCacheKey(MP4, env())]);
  assert.equal(aemCalls().length, 1);
  const again = await get('lufthansa-edge.turnsthe.page', MP4);
  assert.equal(again.status, 200);
  assert.equal(again.headers.get('x-lh-edge-cache'), 'hit');
  assert.equal(again.headers.get('x-lh-edge-route'), 'dam-aem');
  assert.equal(again.headers.get('content-type'), 'video/mp4');
  assert.equal(again.headers.get('cache-control'), 'public, max-age=2592000');
  assert.equal(again.headers.get('etag'), '"aem"');
  assert.equal(again.headers.get('set-cookie'), null);
  assert.deepEqual(new Uint8Array(await again.arrayBuffer()), BYTES);
  assert.equal(aemCalls().length, 1, 'no AEM request on a hit');
  const head = await get('tap.turnsthe.page', MP4, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(head.headers.get('content-length'), '1000');
  assert.equal(await head.text(), '');
  assert.equal(aemCalls().length, 1);
});

test('a Range against the cached file: 206 from the cache; If-None-Match: 304', async () => {
  await (await get('lufthansa.turnsthe.page', MP4)).arrayBuffer();
  await settle();
  const part = await get('lufthansa.turnsthe.page', MP4, { headers: { range: 'bytes=10-19' } });
  assert.equal(part.status, 206);
  assert.equal(part.headers.get('content-range'), 'bytes 10-19/1000');
  assert.equal(part.headers.get('content-length'), '10');
  assert.equal(part.headers.get('accept-ranges'), 'bytes');
  assert.deepEqual(new Uint8Array(await part.arrayBuffer()), BYTES.slice(10, 20));
  const same = await get('lufthansa.turnsthe.page', MP4, { headers: { 'if-none-match': '"aem"' } });
  assert.equal(same.status, 304);
  assert.equal(aemCalls().length, 1);
});

test('a Range on a miss: the range as before, the whole file filled in the background (one request), then hits', async () => {
  const part = await get('lufthansa.turnsthe.page', MP4, { headers: { range: 'bytes=0-99' } });
  assert.equal(part.status, 206);
  assert.equal(part.headers.get('x-lh-edge-cache'), 'miss');
  assert.equal(part.headers.get('content-range'), 'bytes 0-99/1000');
  assert.equal((await part.arrayBuffer()).byteLength, 100);
  // a second range of the same file while the fill runs: no second fill
  await (await get('lufthansa.turnsthe.page', MP4, { headers: { range: 'bytes=100-199' } })).arrayBuffer();
  await settle();
  const fills = aemCalls().filter((c) => !c.headers.range);
  assert.equal(fills.length, 1, 'one whole-file request');
  assert.equal(fills[0].method, 'GET');
  assert.deepEqual(cache.puts, [damCacheKey(MP4, env())]);
  const next = await get('lufthansa.turnsthe.page', MP4, { headers: { range: 'bytes=500-599' } });
  assert.equal(next.headers.get('x-lh-edge-cache'), 'hit');
  assert.deepEqual(new Uint8Array(await next.arrayBuffer()), BYTES.slice(500, 600));
});

test('never stored: the hibernation page (200 text/html), 304, 5xx, a file over 512 MB', async () => {
  aem = () => new Response('<html>hibernated</html>', { headers: { 'content-type': 'text/html' } });
  const hib = await get('lufthansa.turnsthe.page', MP4);
  assert.equal(hib.status, 503);
  aem = () => new Response(null, { status: 304, headers: { etag: '"aem"' } });
  assert.equal((await get('lufthansa.turnsthe.page', MP4, { headers: { 'if-none-match': '"aem"' } })).status, 304);
  aem = () => new Response('busy', { status: 502 });
  assert.equal((await get('lufthansa.turnsthe.page', MP4)).status, 503);
  const big = String(DAM_CACHE_MAX_BYTES + 1);
  aem = (req) => (req.headers.get('range')
    ? new Response(BYTES.slice(0, 100), { status: 206, headers: { 'content-type': 'video/mp4', 'content-range': `bytes 0-99/${big}`, 'content-length': '100' } })
    : new Response(BYTES, { headers: { 'content-type': 'video/mp4', 'content-length': big } }));
  await (await get('lufthansa.turnsthe.page', MP4)).arrayBuffer();
  await (await get('lufthansa.turnsthe.page', MP4, { headers: { range: 'bytes=0-99' } })).arrayBuffer();
  await settle();
  assert.deepEqual(cache.puts, []);
  assert.equal(aemCalls().filter((c) => !c.headers.range && c.method === 'GET').length, 1, 'no background fill for a file over the limit');
  aem = () => new Response(BYTES, { headers: { 'content-type': 'video/mp4' } });
  await (await get('lufthansa.turnsthe.page', MP4)).arrayBuffer();
  await settle();
  assert.deepEqual(cache.puts, [], 'no length: not stored');
});

test('the key: one per file and EDGE_CACHE_VERSION (a new value: a miss); DAM_AEM_CACHE=off and the DA-first types as before', async () => {
  assert.equal(damCacheKey(MP4, env()), damCacheKey(MP4, env()));
  assert.notEqual(damCacheKey(MP4, env()), damCacheKey(MP4, env({ EDGE_CACHE_VERSION: '2026-11-05b' })));
  assert.match(damCacheKey(MP4, env()), /^https:\/\/lufthansa\.turnsthe\.page\/\.lh-edge-cache\/dam-aem\/2026-11-05a\/content\/dam\//);
  await (await get('lufthansa.turnsthe.page', MP4, undefined, env({ DAM_AEM_CACHE: 'off' }))).arrayBuffer();
  await settle();
  assert.deepEqual(cache.puts, [], 'off: nothing stored');
  // an image (after DA's 404) is stored the same way
  await (await get('lufthansa.turnsthe.page', PNG)).arrayBuffer();
  await settle();
  assert.deepEqual(cache.puts, [damCacheKey(PNG, env())]);
  const hit = await get('cargo.turnsthe.page', PNG);
  assert.equal(hit.headers.get('x-lh-edge-cache'), 'hit');
  assert.equal(hit.headers.get('content-type'), 'image/png');
});
