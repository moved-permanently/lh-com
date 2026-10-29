/* eslint-disable max-len, no-restricted-syntax */
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
// a PDF DA holds (under 20 MB) and a brand's large PDF R2 doesn't hold
const SMALL = '/content/dam/lh/pdfs/conditions.pdf';
const LARGE = '/content/dam/four_y/pdfs/large-brochure.pdf';
const BYTES = new Uint8Array(Array.from({ length: 1000 }, (_, i) => i % 256));

/** A fake R2 bucket with the given keys (head and get, as src/dam-media.js reads them). */
const bucket = (keys) => ({
  heads: 0,
  async head(key) { this.heads += 1; return keys.includes(key) ? { size: BYTES.length, httpEtag: '"r2"', uploaded: new Date('2026-10-26T12:00:00Z') } : null; },
  async get(key, { range } = {}) {
    const part = range ? BYTES.slice(range.offset, range.offset + range.length) : BYTES;
    return keys.includes(key) ? { body: new Blob([part]).stream(), size: BYTES.length } : null;
  },
});

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
    const headers = {
      'content-type': req.url.endsWith('.vtt') ? 'text/vtt' : 'video/mp4', 'accept-ranges': 'bytes', etag: '"aem"', 'last-modified': 'Tue, 27 Oct 2026 10:00:00 GMT', 'cache-control': 'public, max-age=600, immutable', 'x-dispatcher': 'publish', 'set-cookie': 'a=b',
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
  ORIGIN, PUBLIC_HOST: '', EDGE_TTL: '60', AEM_PUBLISH: AEM, DAM_MEDIA: bucket(['content/dam/video/c3/202405-em/austragungsorte/lh-em-en-uts-lh-com.mp4', POSTER.slice(1)]), ...extra,
});
const get = (p, init, e = env()) => worker.fetch(new Request(`${HOST}${p}`, init), e, {});
const aemCalls = () => calls.filter((c) => c.url.startsWith(AEM));
const daCalls = () => calls.filter((c) => new URL(c.url).hostname === ORIGIN);

test('dam aem: 200 mp4 from the publish tier, streamed, with R2\'s header set and only content-length, etag, last-modified from AEM', async () => {
  const resp = await get(MP4, { headers: { cookie: 'x=y', 'accept-language': 'de', 'if-none-match': '"old"' } });
  assert.equal(resp.status, 200);
  assert.equal(resp.headers.get('x-lh-edge-route'), 'dam-aem');
  assert.equal(resp.headers.get('content-type'), 'video/mp4');
  assert.equal(resp.headers.get('cache-control'), 'public, max-age=2592000');
  assert.equal(resp.headers.get('accept-ranges'), 'bytes');
  assert.equal(resp.headers.get('content-length'), '1000');
  assert.equal(resp.headers.get('etag'), '"aem"');
  assert.equal(resp.headers.get('last-modified'), 'Tue, 27 Oct 2026 10:00:00 GMT');
  assert.equal(resp.headers.get('set-cookie'), null);
  assert.equal(resp.headers.get('x-dispatcher'), null);
  assert.deepEqual(new Uint8Array(await resp.arrayBuffer()), BYTES);
  assert.deepEqual(aemCalls().map((c) => [c.url, c.method]), [[`${AEM}${MP4}`, 'GET']]);
  // only range, if-none-match and if-modified-since go to AEM
  assert.deepEqual(aemCalls()[0].headers, { 'if-none-match': '"old"' });
  assert.ok(aemCalls()[0].signal, 'a time limit on the headers');
});

test('dam aem: 206 with content-range, HEAD, 304 and 416 as AEM answers them; vtt as text/vtt; charset=utf-8', async () => {
  const part = await get(MP4, { headers: { range: 'bytes=0-99' } });
  assert.equal(part.status, 206);
  assert.equal(part.headers.get('content-range'), 'bytes 0-99/1000');
  assert.equal(part.headers.get('content-length'), '100');
  assert.equal((await part.arrayBuffer()).byteLength, 100);
  assert.equal(aemCalls().at(-1).headers.range, 'bytes=0-99');
  const head = await get(MP4, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(head.headers.get('content-length'), '1000');
  assert.equal(aemCalls().at(-1).method, 'HEAD');
  aem = () => new Response(null, { status: 304, headers: { etag: '"aem"', 'last-modified': 'Tue, 27 Oct 2026 10:00:00 GMT' } });
  const not = await get(MP4, { headers: { 'if-none-match': '"aem"' } });
  assert.equal(not.status, 304);
  assert.equal(not.headers.get('x-lh-edge-route'), 'dam-aem');
  assert.equal(not.headers.get('etag'), '"aem"');
  aem = () => new Response('', { status: 416, headers: { 'content-range': 'bytes */1000', 'content-type': 'text/html' } });
  const bad = await get(MP4, { headers: { range: 'bytes=5000-' } });
  assert.equal(bad.status, 416);
  assert.equal(bad.headers.get('content-range'), 'bytes */1000');
  assert.equal(bad.headers.get('content-type'), 'video/mp4');
  aem = () => new Response('WEBVTT\n', { headers: { 'content-type': 'text/vtt', 'content-length': '7' } });
  const vtt = await get(VTT);
  assert.equal(vtt.status, 200);
  assert.equal(vtt.headers.get('content-type'), 'text/vtt; charset=utf-8');
  assert.equal(vtt.headers.get('x-lh-edge-route'), 'dam-aem');
  assert.equal(await vtt.text(), 'WEBVTT\n');
});

test('dam aem: 404, 5xx, a hibernated sandbox\'s 200 text/html, a timeout and a network error go to R2 as before', async () => {
  const answers = [
    () => new Response('Not found', { status: 404 }),
    () => new Response('error', { status: 503, headers: { 'content-type': 'video/mp4' } }),
    () => new Response('<html>This environment is hibernated</html>', { headers: { 'content-type': 'text/html;charset=utf-8' } }),
    () => { throw new TypeError('network'); },
  ];
  for (const a of answers) {
    aem = a;
    // eslint-disable-next-line no-await-in-loop
    const resp = await get(MP4);
    assert.equal(resp.status, 200);
    assert.equal(resp.headers.get('x-lh-edge-route'), 'dam-media');
    // eslint-disable-next-line no-await-in-loop
    assert.deepEqual(new Uint8Array(await resp.arrayBuffer()), BYTES);
  }
  // AEM's headers too late: aborted, R2 answers
  aem = (req, init) => new Promise((resolve, reject) => { init.signal.addEventListener('abort', () => reject(new Error('aborted'))); });
  const t0 = Date.now();
  const late = await get(MP4, {}, env({ AEM_HEADER_TIMEOUT_MS: '50' }));
  assert.equal(late.headers.get('x-lh-edge-route'), 'dam-media');
  assert.ok(Date.now() - t0 < 2000);
  // a vtt R2 doesn't have either: on to the copies (404)
  aem = () => new Response('<html>hibernated</html>', { headers: { 'content-type': 'text/html' } });
  assert.equal((await get(VTT)).status, 404);
});

test('dam aem: a PDF DA serves (200, a range 206) is answered from DA: no AEM call, no R2 call, one DA request', async () => {
  aem = () => new Response(BYTES, { headers: { 'content-type': 'application/pdf' } });
  da = (req) => (req.headers.get('range')
    ? new Response(BYTES.slice(0, 100), { status: 206, headers: { 'content-type': 'application/pdf', 'content-range': 'bytes 0-99/1000' } })
    : new Response(BYTES, { headers: { 'content-type': 'application/pdf' } }));
  const e = env();
  const whole = await get(SMALL, {}, e);
  assert.equal(whole.status, 200);
  assert.equal(whole.headers.get('x-lh-edge-route'), 'dam');
  const part = await get(SMALL, { headers: { range: 'bytes=0-99' } }, e);
  assert.equal(part.status, 206);
  assert.equal(part.headers.get('content-range'), 'bytes 0-99/1000');
  assert.equal(aemCalls().length, 0);
  assert.equal(e.DAM_MEDIA.heads, 0);
  assert.equal(daCalls().length, 2, 'one DA request each');
});

test('dam aem: a PDF DA answers 404: AEM\'s application/pdf; AEM 404, 200 text/html and a timeout go to R2, then the 404', async () => {
  // AEM has it (a brand's large PDF R2 doesn't hold)
  aem = (req) => new Response(req.method === 'HEAD' ? null : BYTES, { headers: { 'content-type': 'application/pdf', 'content-length': '1000' } });
  const e = env();
  const big = await get(LARGE, {}, e);
  assert.equal(big.status, 200);
  assert.equal(big.headers.get('x-lh-edge-route'), 'dam-aem');
  assert.equal(big.headers.get('content-type'), 'application/pdf');
  assert.deepEqual(new Uint8Array(await big.arrayBuffer()), BYTES);
  assert.equal(daCalls().length, 1);
  assert.equal(aemCalls().length, 1);
  assert.equal(aemCalls()[0].url, `${AEM}${LARGE}`);
  assert.equal(e.DAM_MEDIA.heads, 0, 'AEM answered: no R2 call');
  // a 200 to a range request is no answer (R2 answers the range for the poster)
  const range = await get(POSTER, { headers: { range: 'bytes=0-99' } }, e);
  assert.equal(range.status, 206);
  assert.equal(range.headers.get('x-lh-edge-route'), 'dam-media');
  // no usable AEM answer: the poster from R2, a PDF R2 doesn't hold the 404
  const none = [
    () => new Response('Not found', { status: 404 }),
    () => new Response('<html>This environment is hibernated</html>', { headers: { 'content-type': 'text/html;charset=utf-8' } }),
    (req, init) => new Promise((resolve, reject) => { init.signal.addEventListener('abort', () => reject(new Error('aborted'))); }),
  ];
  for (const a of none) {
    aem = a;
    const t = env({ AEM_HEADER_TIMEOUT_MS: '50' });
    const poster = await get(POSTER, {}, t); // eslint-disable-line no-await-in-loop
    assert.equal(poster.status, 200);
    assert.equal(poster.headers.get('x-lh-edge-route'), 'dam-media');
    assert.deepEqual(new Uint8Array(await poster.arrayBuffer()), BYTES); // eslint-disable-line no-await-in-loop
    const missing = await get(LARGE, {}, t); // eslint-disable-line no-await-in-loop
    assert.equal(missing.status, 404);
    assert.equal(missing.headers.get('x-lh-edge-route'), 'dam');
  }
});

test('dam aem: lh-com\'s poster PDF (not in DA) still answers dam-aem, after one DA request; HEAD too', async () => {
  aem = (req) => new Response(req.method === 'HEAD' ? null : BYTES, { headers: { 'content-type': 'application/pdf', 'content-length': '1000' } });
  const e = env();
  const poster = await get(POSTER, {}, e);
  assert.equal(poster.status, 200);
  assert.equal(poster.headers.get('x-lh-edge-route'), 'dam-aem');
  assert.deepEqual(calls.map((c) => (c.url.startsWith(AEM) ? 'aem' : 'da')), ['da', 'aem']);
  const head = await get(POSTER, { method: 'HEAD' }, e);
  assert.equal(head.headers.get('x-lh-edge-route'), 'dam-aem');
  assert.equal(head.headers.get('content-length'), '1000');
  assert.equal(calls.at(-2).method, 'HEAD');
  assert.equal(calls.at(-1).method, 'HEAD');
});

test('dam aem: no AEM_PUBLISH: no AEM call (the poster from R2); a DA 5xx for a PDF is passed on, no AEM or R2 call', async () => {
  const off = env({ AEM_PUBLISH: '' });
  const poster = await get(POSTER, {}, off);
  assert.equal(poster.headers.get('x-lh-edge-route'), 'dam-media');
  assert.equal((await get(LARGE, {}, off)).status, 404);
  assert.equal(aemCalls().length, 0);
  da = () => new Response('upstream error', { status: 503 });
  const e = env();
  const err = await get(POSTER, {}, e);
  assert.equal(err.status, 503);
  assert.equal(aemCalls().length, 0);
  assert.equal(e.DAM_MEDIA.heads, 0);
  // mp4 and vtt: AEM before DA, as before; renditions and other methods: no AEM call
  calls.length = 0;
  da = () => new Response('Not found', { status: 404 });
  aem = () => new Response(BYTES, { headers: { 'content-type': 'video/mp4' } });
  assert.equal((await get(MP4)).headers.get('x-lh-edge-route'), 'dam-aem');
  assert.equal(daCalls().length, 0);
  await get(MP4, { method: 'POST' });
  await get('/content/dam/lh/images/x.jpg.transform/lh-dcep-transform-width-720/img.jpg');
  assert.equal(aemCalls().length, 1);
});

test('dam aem: a 200 to a range request (Cloudflare\'s cache fetching the whole file) goes to R2, which answers the range; the subrequest goes past Cloudflare\'s cache', async () => {
  // what the first range request on the 869 MB file got: the whole file
  aem = () => new Response(BYTES, { headers: { 'content-type': 'video/mp4', 'content-length': String(BYTES.length) } });
  const part = await get(MP4, { headers: { range: 'bytes=900-999' } });
  assert.equal(part.status, 206);
  assert.equal(part.headers.get('x-lh-edge-route'), 'dam-media');
  assert.equal(part.headers.get('content-range'), 'bytes 900-999/1000');
  assert.equal((await part.arrayBuffer()).byteLength, 100);
  assert.equal(aemCalls().at(-1).headers.range, 'bytes=900-999');
  assert.equal(aemCalls().at(-1).cache, 'no-store');
  // without a range the same 200 is the answer
  const whole = await get(MP4);
  assert.equal(whole.status, 200);
  assert.equal(whole.headers.get('x-lh-edge-route'), 'dam-aem');
  assert.equal(aemCalls().at(-1).cache, 'no-store');
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
