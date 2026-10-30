/* eslint-disable max-len, no-restricted-syntax, no-await-in-loop */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import worker, { EventsRelay } from '../src/index.js';
import { aemKeepAlive, KEEPALIVE_MINUTE } from '../src/aem-keepalive.js';

const ORIGIN = 'main--lh-com--moved-permanently.aem.live';
const AEM = 'https://publish-p1-e2.adobeaemcloud.com';
const HOST = 'https://lh-edge.example';
const MP4 = '/content/dam/video/c3/202405-em/austragungsorte/lh-em-en-uts-lh-com.mp4';
const VTT = '/content/dam/video/dbb/meet_the_makers-2024/caynova/240725-mtm-caynova-en-ad.vtt';
const POSTER = '/content/dam/lufthansa-group/pdfs/lh-poster-antonio-colomboni-48x73cm.pdf';
// a PDF DA holds (under 20 MB), an mp4 DA holds (up to 36 MB)
const SMALL = '/content/dam/lh/pdfs/conditions.pdf';
const SMALL_MP4 = '/content/dam/video/c3/small.mp4';
const BYTES = new Uint8Array(Array.from({ length: 1000 }, (_, i) => i % 256));

let calls;
let aem;
let da;
beforeEach(() => {
  calls = [];
  // the DA copies' answer per test (default: none)
  da = () => new Response('Not found', { status: 404 });
  // AEM's answer per test (default: the file, ranges as the publish tier answers them)
  aem = (req) => {
    const range = req.headers.get('range');
    const type = (req.url.endsWith('.vtt') && 'text/vtt') || (req.url.endsWith('.pdf') && 'application/pdf') || 'video/mp4';
    const headers = {
      'content-type': type, 'accept-ranges': 'bytes', etag: '"aem"', 'last-modified': 'Tue, 27 Oct 2026 10:00:00 GMT', 'cache-control': 'public, max-age=600, immutable', 'x-dispatcher': 'publish', 'set-cookie': 'a=b',
    };
    if (range) return new Response(BYTES.slice(0, 100), { status: 206, headers: { ...headers, 'content-range': `bytes 0-99/${BYTES.length}`, 'content-length': '100' } });
    return new Response(req.method === 'HEAD' ? null : BYTES, { headers: { ...headers, 'content-length': String(BYTES.length) } });
  };
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input, init);
    calls.push({
      url: req.url, method: req.method, headers: Object.fromEntries(req.headers), signal: init.signal, cache: init.cache,
    });
    if (req.url.startsWith(AEM)) return aem(req, init);
    if (new URL(req.url).hostname === ORIGIN) return da(req, init);
    return new Response('Not found', { status: 404 });
  };
});

const env = (extra = {}) => ({
  ORIGIN, PUBLIC_HOST: '', EDGE_TTL: '60', AEM_PUBLISH: AEM, ...extra,
});
const get = (p, init, e = env()) => worker.fetch(new Request(`${HOST}${p}`, init), e, {});
const aemCalls = () => calls.filter((c) => c.url.startsWith(AEM));
const daCalls = () => calls.filter((c) => new URL(c.url).hostname === ORIGIN);
const hang = (req, init) => new Promise((resolve, reject) => { init.signal.addEventListener('abort', () => reject(new Error('aborted'))); });

test('dam aem: mp4 200 from the publish tier, streamed, its media type and cache, only content-length, etag, last-modified from AEM', async () => {
  const resp = await get(MP4);
  assert.equal(resp.status, 200);
  assert.equal(resp.headers.get('x-lh-edge-route'), 'dam-aem');
  assert.equal(resp.headers.get('content-type'), 'video/mp4');
  assert.equal(resp.headers.get('cache-control'), 'public, max-age=2592000');
  assert.equal(resp.headers.get('accept-ranges'), 'bytes');
  assert.equal(resp.headers.get('etag'), '"aem"');
  assert.equal(resp.headers.get('content-length'), '1000');
  assert.equal(resp.headers.get('set-cookie'), null);
  assert.equal(resp.headers.get('x-dispatcher'), null);
  assert.deepEqual(new Uint8Array(await resp.arrayBuffer()), BYTES);
  assert.equal(aemCalls()[0].url, `${AEM}${MP4}`);
  assert.equal(aemCalls()[0].cache, 'no-store');
  assert.equal(daCalls().length, 0, 'AEM answered: no DA request');
});

test('dam aem: 206 with content-range, HEAD, 304 and 416 as AEM answers them; vtt as text/vtt; charset=utf-8', async () => {
  const part = await get(MP4, { headers: { range: 'bytes=0-99' } });
  assert.equal(part.status, 206);
  assert.equal(part.headers.get('content-range'), 'bytes 0-99/1000');
  assert.equal(aemCalls().at(-1).headers.range, 'bytes=0-99');
  const head = await get(MP4, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(head.headers.get('content-length'), '1000');
  assert.equal(aemCalls().at(-1).method, 'HEAD');
  aem = () => new Response(null, { status: 304, headers: { etag: '"aem"' } });
  const cached = await get(MP4, { headers: { 'if-none-match': '"aem"' } });
  assert.equal(cached.status, 304);
  assert.equal(aemCalls().at(-1).headers['if-none-match'], '"aem"');
  aem = () => new Response(null, { status: 416, headers: { 'content-range': 'bytes */1000' } });
  const outside = await get(MP4, { headers: { range: 'bytes=5000-' } });
  assert.equal(outside.status, 416);
  assert.equal(outside.headers.get('content-range'), 'bytes */1000');
  aem = () => new Response('WEBVTT\n', { headers: { 'content-type': 'text/vtt' } });
  const vtt = await get(VTT);
  assert.equal(vtt.status, 200);
  assert.equal(vtt.headers.get('content-type'), 'text/vtt; charset=utf-8');
  assert.equal(vtt.headers.get('x-lh-edge-route'), 'dam-aem');
});

test('dam aem: a 200 to a request with a Range header is passed through as 200 with the whole file', async () => {
  // what a cold cache in front of the publish tier answers: the whole file
  aem = () => new Response(BYTES, { headers: { 'content-type': 'video/mp4', 'content-length': '1000' } });
  const resp = await get(MP4, { headers: { range: 'bytes=900-999' } });
  assert.equal(resp.status, 200);
  assert.equal(resp.headers.get('x-lh-edge-route'), 'dam-aem');
  assert.equal(resp.headers.get('content-range'), null);
  assert.equal((await resp.arrayBuffer()).byteLength, 1000);
});

test('dam aem: hibernated (200 text/html), 5xx, a timeout and a network error: 503 Retry-After 120, no-store, never AEM\'s page', async () => {
  const answers = [
    () => new Response('<html>This environment is hibernated</html>', { headers: { 'content-type': 'text/html;charset=utf-8' } }),
    () => new Response('error', { status: 503, headers: { 'content-type': 'text/html' } }),
    () => new Response('error', { status: 502 }),
    () => { throw new TypeError('network'); },
    hang,
  ];
  for (const a of answers) {
    aem = a;
    const t0 = Date.now();
    const resp = await get(MP4, {}, env({ AEM_HEADER_TIMEOUT_MS: '50' }));
    assert.equal(resp.status, 503);
    assert.equal(resp.headers.get('retry-after'), '120');
    assert.equal(resp.headers.get('cache-control'), 'no-store');
    assert.equal(resp.headers.get('x-lh-edge-route'), 'dam-aem-unavailable');
    const text = await resp.text();
    assert.ok(!/hibernated|<html/i.test(text), 'not AEM\'s page');
    assert.ok(Date.now() - t0 < 2000);
  }
  // the same for a vtt and for the PDF only on AEM
  aem = () => new Response('<html>hibernated</html>', { headers: { 'content-type': 'text/html' } });
  assert.equal((await get(VTT)).status, 503);
  assert.equal((await get(POSTER)).status, 503);
  assert.equal((await get(POSTER, { method: 'HEAD' })).status, 503);
});

test('dam aem: the default header limit is 30 s (a cold publish tier answers after 10-20 s)', async () => {
  // the limit itself: an answer after 8 s is used (no override)
  aem = (req, init) => new Promise((resolve, reject) => {
    const t = setTimeout(() => resolve(new Response(BYTES, { headers: { 'content-type': 'video/mp4' } })), 8000);
    init.signal.addEventListener('abort', () => { clearTimeout(t); reject(new Error('aborted')); });
  });
  const t0 = Date.now();
  const slow = await get(MP4);
  assert.equal(slow.status, 200);
  assert.equal(slow.headers.get('x-lh-edge-route'), 'dam-aem');
  assert.ok(Date.now() - t0 >= 7900);
  const { AEM_HEADER_TIMEOUT_MS } = await import('../src/dam-aem.js');
  assert.equal(AEM_HEADER_TIMEOUT_MS, 30000);
});

test('dam aem: AEM 404 stays 404; an mp4 DA holds answers from DA, also while AEM is unavailable', async () => {
  aem = () => new Response('Not found', { status: 404 });
  const missing = await get(MP4);
  assert.equal(missing.status, 404);
  assert.equal(missing.headers.get('x-lh-edge-route'), 'dam');
  da = (req) => (new URL(req.url).pathname === SMALL_MP4 ? new Response(BYTES, { headers: { 'content-type': 'video/mp4' } }) : new Response('Not found', { status: 404 }));
  const small = await get(SMALL_MP4);
  assert.equal(small.status, 200);
  assert.equal(small.headers.get('x-lh-edge-route'), 'dam');
  aem = () => new Response('<html>hibernated</html>', { headers: { 'content-type': 'text/html' } });
  const whileDown = await get(SMALL_MP4);
  assert.equal(whileDown.status, 200, 'the DA copy, not the 503');
  assert.equal(whileDown.headers.get('x-lh-edge-route'), 'dam');
});

test('dam aem: a PDF DA serves (200, a range 206) is answered from DA, no AEM call', async () => {
  da = (req) => (req.headers.get('range')
    ? new Response(BYTES.slice(0, 100), { status: 206, headers: { 'content-type': 'application/pdf', 'content-range': 'bytes 0-99/1000' } })
    : new Response(BYTES, { headers: { 'content-type': 'application/pdf' } }));
  const whole = await get(SMALL);
  assert.equal(whole.status, 200);
  assert.equal(whole.headers.get('x-lh-edge-route'), 'dam');
  const part = await get(SMALL, { headers: { range: 'bytes=0-99' } });
  assert.equal(part.status, 206);
  assert.equal(aemCalls().length, 0);
  assert.equal(daCalls().length, 2, 'one DA request each');
});

test('dam aem: lh-com\'s poster PDF (only on AEM) answers dam-aem after one DA request, HEAD too; no AEM_PUBLISH: the 404', async () => {
  const poster = await get(POSTER);
  assert.equal(poster.status, 200);
  assert.equal(poster.headers.get('x-lh-edge-route'), 'dam-aem');
  assert.equal(poster.headers.get('content-type'), 'application/pdf');
  assert.deepEqual(calls.map((c) => (c.url.startsWith(AEM) ? 'aem' : 'da')), ['da', 'aem']);
  const head = await get(POSTER, { method: 'HEAD' });
  assert.equal(head.headers.get('x-lh-edge-route'), 'dam-aem');
  assert.equal(head.headers.get('content-length'), '1000');
  calls.length = 0;
  const off = await get(POSTER, {}, env({ AEM_PUBLISH: '' }));
  assert.equal(off.status, 404);
  assert.equal(aemCalls().length, 0);
  // a DA 5xx for a PDF is passed on, no AEM call
  da = () => new Response('upstream error', { status: 503 });
  const err = await get(POSTER);
  assert.equal(err.status, 503);
  assert.equal(err.headers.get('x-lh-edge-route'), null);
  assert.equal(aemCalls().length, 0);
  // renditions and other methods: no AEM call
  await get(MP4, { method: 'POST' });
  await get('/content/dam/lh/images/x.jpg.transform/lh-dcep-transform-width-720/img.jpg');
  assert.equal(aemCalls().length, 0);
});

test('aem keep-alive: one GET per URL in minute KEEPALIVE_MINUTE with ?keepalive=<epoch s>, no-store, logged; else and without URLs none', async () => {
  const at = (minute) => Date.UTC(2026, 9, 29, 10, minute, 5);
  const urls = 'https://author-p1-e2.adobeaemcloud.com/libs/granite/core/content/login.html, https://publish-p1-e2.adobeaemcloud.com/content/dam/lh-com-poc/keepalive.png';
  const seen = [];
  globalThis.fetch = async (input, init = {}) => {
    seen.push({ url: String(input), init });
    return new Response('ok', { headers: { 'content-type': 'text/html' } });
  };
  const waited = [];
  assert.equal(aemKeepAlive({ AEM_KEEPALIVE_URLS: urls }, { waitUntil: (p) => waited.push(p) }, at(KEEPALIVE_MINUTE + 1)), null);
  assert.equal(aemKeepAlive({ AEM_KEEPALIVE_URLS: '' }, {}, at(KEEPALIVE_MINUTE)), null);
  assert.equal(seen.length, 0);
  const statuses = await aemKeepAlive({ AEM_KEEPALIVE_URLS: urls }, { waitUntil: (p) => waited.push(p) }, at(KEEPALIVE_MINUTE));
  assert.deepEqual(statuses, [200, 200]);
  assert.equal(waited.length, 1);
  const epoch = String(Math.floor(at(KEEPALIVE_MINUTE) / 1000));
  assert.deepEqual(seen.map((s) => s.url), [
    `https://author-p1-e2.adobeaemcloud.com/libs/granite/core/content/login.html?keepalive=${epoch}`,
    `https://publish-p1-e2.adobeaemcloud.com/content/dam/lh-com-poc/keepalive.png?keepalive=${epoch}`,
  ]);
  assert.ok(seen.every((s) => s.init.cache === 'no-store'));
});

test('aem keep-alive: a failing ping doesn\'t break EventsRelay.poll', async () => {
  globalThis.fetch = async () => { throw new TypeError('connect failed'); };
  const realNow = Date.now;
  Date.now = () => Date.UTC(2026, 9, 29, 10, KEEPALIVE_MINUTE, 0);
  try {
    const waited = [];
    const r = await new EventsRelay({ waitUntil: (p) => waited.push(p) }, { AEM_KEEPALIVE_URLS: 'https://publish-p1-e2.adobeaemcloud.com/k.png', AUDIT_LOG_KEY: '' }).poll();
    assert.deepEqual(r, { ok: false, error: 'not configured' }, 'the relay answers as without the keep-alive');
    assert.deepEqual(await Promise.all(waited), [[null]]);
  } finally {
    Date.now = realNow;
  }
});
