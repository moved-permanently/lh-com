/* eslint-disable max-len */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';
import { parseRange } from '../src/dam-media.js';

const ORIGIN = 'main--lh-com--moved-permanently.aem.live';
const HOST = 'https://lh-edge.example';
const VIDEO = new Uint8Array(Array.from({ length: 1000 }, (_, i) => i % 256));
const VTT = 'WEBVTT\n\n00:00.000 --> 00:02.000\nHallo';

/** A fake R2 bucket: head/get with range, as the Workers runtime. */
function bucket(objects) {
  return {
    async head(key) {
      const o = objects[key];
      return o ? { size: o.length, httpEtag: `"${key.length}"`, uploaded: new Date('2026-10-26T12:00:00Z') } : null;
    },
    async get(key, { range } = {}) {
      const o = objects[key];
      if (!o) return null;
      const bytes = typeof o === 'string' ? new TextEncoder().encode(o) : o;
      const part = range ? bytes.slice(range.offset, range.offset + range.length) : bytes;
      return { body: new Blob([part]).stream(), size: bytes.length };
    },
  };
}

let originCalls;
beforeEach(() => {
  originCalls = [];
  globalThis.fetch = async (input) => {
    originCalls.push(new URL((input instanceof Request ? input : new Request(input)).url).pathname);
    return new Response('Not found', { status: 404 });
  };
});

const PDF = new Uint8Array(Array.from({ length: 600 }, (_, i) => (i * 7) % 256));
const DAM_MEDIA = bucket({
  'content/dam/video/c3/in-my-hood-porto/inmyhood-porto-lh.mp4': VIDEO,
  'content/dam/video/c3/in-my-hood-porto/porto-cc-de.vtt': VTT,
  // www's PDF over Edge Delivery's 20 MB limit (tools/reports/dam/dam-copy.json), under its usual key
  'content/dam/lufthansa-group/pdfs/lh-poster-antonio-colomboni-48x73cm.pdf': PDF,
});
const env = {
  ORIGIN, PUBLIC_HOST: '', EDGE_TTL: '60', DAM_MEDIA,
};
const get = (p, init) => worker.fetch(new Request(`${HOST}${p}`, init), env, {});

test('dam media: subtitles from R2 as text/vtt, under the Edge Delivery name of the www path', async () => {
  const resp = await get('/content/dam/video/c3/in-my-hood-porto/Porto_CC_DE.vtt');
  assert.equal(resp.status, 200);
  assert.equal(resp.headers.get('content-type'), 'text/vtt; charset=utf-8');
  assert.equal(resp.headers.get('cache-control'), 'public, max-age=2592000');
  assert.equal(await resp.text(), VTT);
  assert.equal(originCalls.length, 0);
});

test('dam media: videos as video/mp4, whole and in ranges (206), HEAD; a missing object goes on to the copies', async () => {
  const whole = await get('/content/dam/video/c3/in-my-hood-porto/InMyHood_Porto_LH.mp4');
  assert.equal(whole.status, 200);
  assert.equal(whole.headers.get('content-type'), 'video/mp4');
  assert.equal(whole.headers.get('accept-ranges'), 'bytes');
  assert.equal(whole.headers.get('content-length'), '1000');
  assert.equal((await whole.arrayBuffer()).byteLength, 1000);

  const part = await get('/content/dam/video/c3/in-my-hood-porto/InMyHood_Porto_LH.mp4', { headers: { range: 'bytes=100-199' } });
  assert.equal(part.status, 206);
  assert.equal(part.headers.get('content-range'), 'bytes 100-199/1000');
  assert.equal(part.headers.get('content-length'), '100');
  assert.deepEqual([...new Uint8Array(await part.arrayBuffer())].slice(0, 3), [100, 101, 102]);

  const open = await get('/content/dam/video/c3/in-my-hood-porto/InMyHood_Porto_LH.mp4', { headers: { range: 'bytes=900-' } });
  assert.equal(open.headers.get('content-range'), 'bytes 900-999/1000');
  const suffix = await get('/content/dam/video/c3/in-my-hood-porto/InMyHood_Porto_LH.mp4', { headers: { range: 'bytes=-10' } });
  assert.equal(suffix.headers.get('content-range'), 'bytes 990-999/1000');
  const outside = await get('/content/dam/video/c3/in-my-hood-porto/InMyHood_Porto_LH.mp4', { headers: { range: 'bytes=5000-' } });
  assert.equal(outside.status, 416);
  assert.equal(outside.headers.get('content-range'), 'bytes */1000');

  const head = await get('/content/dam/video/c3/in-my-hood-porto/InMyHood_Porto_LH.mp4', { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(head.headers.get('content-length'), '1000');
  assert.equal(originCalls.length, 0);

  const missing = await get('/content/dam/video/c3/other/small.mp4');
  assert.equal(missing.status, 404);
  assert.ok(originCalls.includes('/content/dam/video/c3/other/small.mp4'), 'the DA copy is asked');
});

test('dam media: a PDF over 20 MB from R2 as application/pdf, whole, in ranges and HEAD', async () => {
  const path = '/content/dam/lufthansa-group/pdfs/LH_Poster_Antonio_Colomboni_48x73cm.pdf';
  const whole = await get(path);
  assert.equal(whole.status, 200);
  assert.equal(whole.headers.get('content-type'), 'application/pdf');
  assert.equal(whole.headers.get('accept-ranges'), 'bytes');
  assert.equal(whole.headers.get('cache-control'), 'public, max-age=2592000');
  assert.equal(whole.headers.get('content-length'), '600');
  assert.deepEqual(new Uint8Array(await whole.arrayBuffer()), PDF);
  const part = await get(path, { headers: { range: 'bytes=0-99' } });
  assert.equal(part.status, 206);
  assert.equal(part.headers.get('content-range'), 'bytes 0-99/600');
  const head = await get(path, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(head.headers.get('content-length'), '600');
  // the DA copy is asked first (404: not in DA), once per request, then R2
  assert.equal(originCalls.length, 3, 'one DA request each, then R2');
});

test('dam media: a PDF that is not in R2 goes on to the DA copies, as before', async () => {
  const resp = await get('/content/dam/lh/pdfs/small-brochure.pdf');
  assert.notEqual(resp.headers.get('x-lh-edge-route'), 'dam-media');
  assert.ok(originCalls.some((p) => p.includes('small-brochure.pdf')), 'the DA copy is asked');
});

test('dam media: images never go to R2', async () => {
  const lookups = [];
  const spy = { head: async (k) => { lookups.push(k); return null; }, get: async () => null };
  await worker.fetch(new Request(`${HOST}/content/dam/lh/images/x.jpg`), { ...env, DAM_MEDIA: spy }, {});
  assert.deepEqual(lookups, []);
});

test('dam media: Range header parsing', () => {
  assert.deepEqual(parseRange('bytes=0-0', 10), { offset: 0, length: 1 });
  assert.deepEqual(parseRange('bytes=5-100', 10), { offset: 5, length: 5 });
  assert.equal(parseRange('items=0-1', 10), null);
  assert.equal(parseRange('', 10), null);
  assert.deepEqual(parseRange('bytes=10-', 10), { invalid: true });
});
