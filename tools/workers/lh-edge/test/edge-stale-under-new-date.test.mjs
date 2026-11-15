/* eslint-disable max-len, no-restricted-syntax, no-await-in-loop */
/* Standing order 31, item 1 (2026-11-15): austrian.turnsthe.page served the pre-publish /at/en/healthy-travel for about
   4 h after its publish. aem.live's Last-Modified is the DA edit time (before the publish) and it answers 304 to an
   If-Modified-Since equal to it; once Cloudflare's fetch cache held the old body under the new date, every EDGE_TTL
   revalidation got a 304 and kept the old body (cf-cache-status REVALIDATED). On hosts without push invalidation
   (EDGE_TTL set) lh-edge now keeps pages and JSON in the Cache API instead (src/edge.js storedFetch): a copy expires
   after EDGE_TTL (404: 60 s) and is never revalidated; a miss fetches the whole answer without conditions; visitors
   and the CDN in front get the whole answer too (aem.live sends no ETag, its Last-Modified can't tell a publish).
   The fake fetch below models Cloudflare's revalidating fetch cache, so the stale case reproduces on the old code.
   Run: node --import ./test/cloudflare-workers-shim.mjs --test test/edge-stale-under-new-date.test.mjs */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { passThrough, originFetch, edgeStoreKey } from '../src/edge.js';

const ORIGIN = 'main--lh-austrian--moved-permanently.aem.live';
const DA_EDIT = 'Sun, 15 Nov 2026 05:19:39 GMT';
const CODE_PUSH = 'Sun, 15 Nov 2026 08:58:07 GMT';
const OLD = '<html><body>before the publish</body></html>';
const NEW = '<html><body>after the publish</body></html>';
let now;
let origin;
let calls;
let cache;

/** caches.default: keeps a 200 or 404 for its max-age, never asks the origin. */
class FakeCache {
  constructor() { this.store = new Map(); this.puts = []; }

  async put(key, resp) {
    const url = typeof key === 'string' ? key : key.url;
    assert.ok([200, 404].includes(resp.status), `stored ${resp.status}`);
    const maxAge = Number(((resp.headers.get('cache-control') || '').match(/max-age=(\d+)/) || [])[1]);
    assert.ok(Number.isFinite(maxAge), 'a stored copy says how long');
    assert.ok(!/max-age=(?!60\b)\d+/.test(resp.headers.get('cdn-cache-control') || ''), 'cdn-cache-control capped too');
    this.puts.push(url);
    this.store.set(url, {
      status: resp.status, headers: new Headers(resp.headers), body: await resp.text(), until: now + maxAge * 1000,
    });
  }

  async match(key) {
    const req = typeof key === 'string' ? new Request(key) : key;
    const hit = this.store.get(req.url);
    if (!hit || now >= hit.until) return undefined;
    return new Response(hit.body, { status: hit.status, headers: hit.headers });
  }
}

/** Cloudflare's fetch cache (cf.cacheEverything + cacheTtlByStatus): revalidates an expired copy with If-Modified-Since. */
const cfCache = new Map();
async function cfFetch(req, cf) {
  const ttl = cf.cacheTtlByStatus ? cf.cacheTtlByStatus['200-299'] : 7200;
  const held = cfCache.get(req.url);
  if (held && now < held.until) return new Response(held.body, { headers: held.headers });
  if (held) {
    const conditional = new Request(req, { headers: { ...Object.fromEntries(req.headers), 'if-modified-since': held.headers.get('last-modified') } });
    const resp = await origin(conditional);
    if (resp.status === 304) {
      held.until = now + ttl * 1000;
      return new Response(held.body, { headers: held.headers });
    }
    cfCache.delete(req.url);
  }
  const resp = await origin(req);
  if (resp.status === 200) cfCache.set(req.url, { body: await resp.clone().text(), headers: new Headers(resp.headers), until: now + ttl * 1000 });
  return resp;
}

let body;
beforeEach(() => {
  now = Date.parse('2026-11-15T06:00:00Z');
  calls = [];
  cfCache.clear();
  cache = new FakeCache();
  globalThis.caches = { default: cache };
  body = OLD;
  // aem.live: the DA edit time as Last-Modified, 304 to an If-Modified-Since at or after it, no ETag
  origin = async (req) => {
    calls.push({
      url: req.url, method: req.method, ims: req.headers.get('if-modified-since'), inm: req.headers.get('if-none-match'),
    });
    const u = new URL(req.url);
    if (u.pathname.startsWith('/gone')) return new Response('Not found', { status: 404, headers: { 'content-type': 'text/html', 'cache-control': 'max-age=3600' } });
    if (u.pathname.startsWith('/broken')) return new Response('oops', { status: 503, headers: { 'content-type': 'text/html' } });
    const ims = req.headers.get('if-modified-since');
    // code (standing order 32): a content ETag, but 304 on the If-Modified-Since alone, If-None-Match ignored
    if (/^\/(scripts|styles|icons)\//.test(u.pathname)) {
      if (ims && Date.parse(ims) >= Date.parse(CODE_PUSH)) return new Response(null, { status: 304, headers: { 'last-modified': CODE_PUSH } });
      const css = u.pathname.endsWith('.css') ? `/* ${body} */` : `// ${body}`;
      const big = u.pathname.includes('big');
      return new Response(req.method === 'HEAD' ? null : css, {
        headers: {
          'content-type': u.pathname.endsWith('.css') ? 'text/css; charset=utf-8' : 'text/javascript; charset=utf-8', etag: `"${body === OLD ? 'aaa' : 'bbb'}"`, 'last-modified': CODE_PUSH, 'cache-control': 'max-age=7200, must-revalidate', ...(big ? { 'content-length': String(9 * 1024 * 1024) } : {}),
        },
      });
    }
    if (ims && Date.parse(ims) >= Date.parse(DA_EDIT)) return new Response(null, { status: 304, headers: { 'last-modified': DA_EDIT } });
    const json = u.pathname.endsWith('.json');
    const text = json ? JSON.stringify({ data: [body] }) : body;
    return new Response(req.method === 'HEAD' ? null : text, {
      headers: {
        'content-type': json ? 'application/json' : 'text/html; charset=utf-8', 'last-modified': DA_EDIT, 'cache-control': 'max-age=7200, must-revalidate', 'cdn-cache-control': 'max-age=172800', vary: 'Accept-Encoding,X-Forwarded-Host',
      },
    });
  };
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input, init);
    if (init.cf && init.cf.cacheEverything) return cfFetch(req, init.cf);
    return origin(req);
  };
});

const env = (extra = {}) => ({
  ORIGIN, PUBLIC_HOST: 'austrian.turnsthe.page', EDGE_TTL: '60', EDGE_CACHE_VERSION: '2026-11-15b', ...extra,
});
const get = (p, init = {}, e = env()) => passThrough(new Request(`https://austrian.turnsthe.page${p}`, init), e);
const later = (s) => { now += s * 1000; };

test('the stale-under-new-date case: the old body under the DA edit date is gone after EDGE_TTL', async () => {
  // the race at the publish: the first fill gets the old body with the new date
  assert.equal(await (await get('/at/en/healthy-travel')).text(), OLD);
  body = NEW;
  later(30);
  assert.equal(await (await get('/at/en/healthy-travel')).text(), OLD, 'within EDGE_TTL: the stored copy');
  later(31);
  assert.equal(await (await get('/at/en/healthy-travel')).text(), NEW, 'after EDGE_TTL: the published page, not a revalidated old copy');
  later(4 * 3600);
  assert.equal(await (await get('/at/en/healthy-travel')).text(), NEW);
  assert.ok(calls.every((c) => !c.ims && !c.inm), 'no origin request carries a condition');
  assert.equal(cfCache.size, 0, 'pages never go through the revalidating fetch cache');
});

test('a hit answers without the origin; the copy is keyed by the versioned origin URL and the public host', async () => {
  const first = await get('/at/en/healthy-travel?utm_source=x');
  assert.equal(first.headers.get('x-lh-edge-cache'), 'miss');
  await first.text();
  const second = await get('/at/en/healthy-travel');
  assert.equal(second.status, 200);
  assert.equal(second.headers.get('x-lh-edge-cache'), 'hit');
  assert.equal(second.headers.get('content-type'), 'text/html; charset=utf-8');
  assert.equal(second.headers.get('cache-control'), 'max-age=60, must-revalidate');
  assert.equal(second.headers.get('last-modified'), DA_EDIT);
  assert.equal(await second.text(), OLD);
  assert.equal(calls.length, 1);
  assert.deepEqual(cache.puts, [edgeStoreKey(new URL(`https://${ORIGIN}/at/en/healthy-travel`), env(), 'austrian.turnsthe.page')]);
  assert.match(cache.puts[0], /\/\.lh-edge-cache\/edge\/2026-11-15b\/austrian\.turnsthe\.page\/main--lh-austrian--moved-permanently\.aem\.live\/at\/en\/healthy-travel$/);
  // another public host (aem.live varies on X-Forwarded-Host), another version: their own copies
  await (await passThrough(new Request('https://austrian.turnsthe.page/at/en/healthy-travel'), env({ PUBLIC_HOST: 'lhedge.example' }))).text();
  await (await get('/at/en/healthy-travel', {}, env({ EDGE_CACHE_VERSION: '2026-11-15c' }))).text();
  assert.equal(calls.length, 3);
});

test('a visitor\'s or the CDN\'s If-Modified-Since gets the whole page, from the copy and on a miss', async () => {
  const miss = await get('/at/en/healthy-travel', { headers: { 'if-modified-since': DA_EDIT } });
  assert.equal(miss.status, 200);
  assert.equal(await miss.text(), OLD);
  body = NEW;
  later(61);
  const fresh = await get('/at/en/healthy-travel', { headers: { 'if-modified-since': DA_EDIT } });
  assert.equal(fresh.status, 200, 'not a 304 against the DA edit date');
  assert.equal(await fresh.text(), NEW);
  const hit = await get('/at/en/healthy-travel', { headers: { 'if-modified-since': DA_EDIT, 'if-none-match': '"x"' } });
  assert.equal(hit.status, 200);
  assert.equal(await hit.text(), NEW);
  assert.ok(calls.every((c) => !c.ims && !c.inm));
});

test('JSON and .plain.html alike; HEAD from the copy; 404 for 60 s; a 5xx not stored', async () => {
  assert.deepEqual(await (await get('/query-index.json?limit=10&x=1')).json(), { data: [OLD] });
  body = NEW;
  later(61);
  assert.deepEqual(await (await get('/query-index.json?limit=10')).json(), { data: [NEW] });
  await (await get('/at/en/healthy-travel.plain.html')).text();
  const head = await get('/at/en/healthy-travel.plain.html', { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(head.headers.get('x-lh-edge-cache'), 'hit');
  assert.equal(await head.text(), '');
  const n = calls.length;
  assert.equal((await get('/gone')).status, 404);
  later(30);
  assert.equal((await get('/gone')).status, 404);
  assert.equal(calls.length, n + 1, 'a 404 is kept');
  later(31);
  await get('/gone');
  assert.equal(calls.length, n + 2, 'for 60 s');
  assert.equal((await get('/broken')).status, 503);
  assert.equal((await get('/broken')).status, 503);
  assert.equal(calls.length, n + 4, 'a 5xx is not kept');
});

test('code (standing order 32): the same race - an ETag aem.live ignores, a 304 on the date - gone after EDGE_TTL', async () => {
  for (const p of ['/styles/styles.css', '/scripts/scripts.js', '/icons/search.svg']) {
    body = OLD;
    const first = await get(p);
    assert.match(await first.text(), /before the publish/, p);
    body = NEW;
    later(30);
    const hit = await get(p);
    assert.equal(hit.headers.get('x-lh-edge-cache'), 'hit');
    assert.equal(hit.headers.get('cache-control'), 'max-age=7200, must-revalidate', 'a hit: the origin\'s own cache-control');
    assert.equal(hit.headers.get('x-lh-edge-origin-cache-control'), null);
    assert.match(await hit.text(), /before the publish/, `${p} within EDGE_TTL`);
    later(31);
    assert.match(await (await get(p)).text(), /after the publish/, `${p} after EDGE_TTL: the pushed file, not a revalidated old copy`);
  }
  // a visitor's revalidation gets the whole file
  const cond = await get('/styles/styles.css', { headers: { 'if-modified-since': CODE_PUSH, 'if-none-match': '"aaa"' } });
  assert.equal(cond.status, 200);
  assert.ok(calls.every((c) => !c.ims && !c.inm), 'no origin request carries a condition');
  assert.equal(cfCache.size, 0, 'code never goes through the revalidating fetch cache');
});

test('code: the old copy under the push date reproduces in the fetch cache (the model), not in the copies', async () => {
  // the model: Cloudflare's fetch cache keeps the old file through every revalidation
  body = OLD;
  const url = `https://${ORIGIN}/styles/styles.css`;
  await (await cfFetch(new Request(url), { cacheEverything: true, cacheTtlByStatus: { '200-299': 60 } })).text();
  body = NEW;
  later(4 * 3600);
  assert.match(await (await cfFetch(new Request(url), { cacheEverything: true, cacheTtlByStatus: { '200-299': 60 } })).text(), /before the publish/, 'the fetch cache: 4 h later still the old file');
  // lh-edge now: the pushed file
  assert.match(await (await get('/styles/styles.css')).text(), /after the publish/);
});

test('a Range request and a file over 8 MB: no copy (the fetch cache, a pass-through)', async () => {
  await (await get('/scripts/x.js', { headers: { range: 'bytes=0-9' } })).text();
  assert.equal(cfCache.size, 1, 'a Range: the fetch cache');
  const big = await get('/scripts/big.js');
  await big.text();
  assert.equal(cache.puts.length, 0, 'over 8 MB: not stored');
  assert.equal(big.headers.get('x-lh-edge-cache'), null);
});

test('as before: media through the fetch cache, hosts with push invalidation, sheets read past the cache', async () => {
  const media = `/at/media_${'a'.repeat(40)}.jpg?width=750`;
  await get(media);
  assert.equal(cfCache.size, 1, 'media: the fetch cache (content-addressed, a new file is a new URL)');
  await (await get('/at/en/healthy-travel', {}, env({ EDGE_TTL: '' }))).text();
  await (await get('/scripts/aem.js', {}, env({ EDGE_TTL: '' }))).text();
  assert.equal(cfCache.size, 3, 'push invalidation (no EDGE_TTL): the fetch cache, purged on publish');
  assert.equal(cache.puts.length, 0);
  await (await originFetch(new Request('https://austrian.turnsthe.page/app/config/webview-aliases.json'), env(), undefined, { edgeCache: false })).text();
  assert.equal(cache.puts.length, 0, 'edgeCache false: no copy');
  assert.equal(cfCache.size, 3);
});

test('no Cache API (tests, a local dev server): the fetch cache as before', async () => {
  delete globalThis.caches;
  await (await get('/at/en/healthy-travel')).text();
  assert.equal(cfCache.size, 1);
});
