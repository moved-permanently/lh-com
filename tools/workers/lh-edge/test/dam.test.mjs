/* eslint-disable max-len, import/no-relative-packages */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';
import { DAM_STEPS } from '../src/dam.js';
import {
  edsDamPath, parseDamPath, localDamUrl, sanitizeName,
} from '../../../../scripts/dam-path.js';

const ORIGIN = 'main--lh-com--moved-permanently.aem.live';
const HOST = 'https://lh-edge.example';
const env = { ORIGIN, PUBLIC_HOST: 'lhcom.example', EDGE_TTL: '60' };
const MEDIA = '/content/dam/lh/images/offers/destination/media_1de886c3c40638890e0843c0d0b3ea369bafe97ac.jpg';
// the copies on the origin: Edge Delivery path -> its media
const ON_ORIGIN = {
  '/content/dam/lh/images/offers/destination/fra-square.jpg': MEDIA,
  '/content/dam/lh/images/mobileapp/lufthansa-insights-v2.png': '/content/dam/lh/images/mobileapp/media_1aaa4c3c40638890e0843c0d0b3ea369bafe97ac.png',
  '/content/dam/lufthansa-group/images/destination/adl-square.jpg': '/content/dam/lufthansa-group/images/destination/media_1bbb4c3c40638890e0843c0d0b3ea369bafe97ac.jpg',
  '/content/dam/lh/images/offers/fallback/generic-square.jpg': '/content/dam/lh/images/offers/fallback/media_1ccc4c3c40638890e0843c0d0b3ea369bafe97ac.jpg',
};

let calls;
beforeEach(() => {
  calls = [];
  DAM_STEPS.length = 0;
  globalThis.fetch = async (input) => {
    const req = input instanceof Request ? input : new Request(input);
    const u = new URL(req.url);
    calls.push({ url: req.url, method: req.method });
    if (ON_ORIGIN[u.pathname]) {
      return new Response('<html>moved</html>', { status: 301, headers: { location: `${ON_ORIGIN[u.pathname]}${u.search}`, 'content-type': 'text/html' } });
    }
    if (/\/media_[0-9a-f]+\.(jpg|png)$/.test(u.pathname)) {
      const type = u.searchParams.get('format') === 'webply' ? 'image/webp' : `image/${u.pathname.endsWith('.png') ? 'png' : 'jpeg'}`;
      return new Response(`bytes ${u.pathname}${u.search}`, { headers: { 'content-type': type, 'cache-control': 'max-age=2592000', 'set-cookie': 'x=1' } });
    }
    return new Response('<html>404</html>', { status: 404, headers: { 'content-type': 'text/html' } });
  };
});

const get = (path, init) => worker.fetch(new Request(`${HOST}${path}`, init), env, {});
const query = (url) => Object.fromEntries(new URL(url).searchParams);

test('names: www paths as Edge Delivery names them', () => {
  assert.equal(sanitizeName('Lufthansa Insights V2'), 'lufthansa-insights-v2');
  assert.equal(edsDamPath('/content/dam/lh/images/mobileapp/Lufthansa%20Insights%20V2.png'), '/content/dam/lh/images/mobileapp/lufthansa-insights-v2.png');
  assert.equal(edsDamPath("/content/dam/lh/images/mobileapp/What's_New_Ü.JPG"), '/content/dam/lh/images/mobileapp/what-s-new-u.jpg');
  // folders: lower case, kept when admin accepts them (local_images), else named like a file
  assert.equal(edsDamPath('/content/dam/lufthansa-group/images/local_images/blog_article_img/Eat-See-Do-Minneapolis–St-Paul/x_1.jpg'), '/content/dam/lufthansa-group/images/local_images/blog_article_img/eat-see-do-minneapolis-st-paul/x-1.jpg');
  assert.equal(edsDamPath('/content/dam/x/know before you go-dubai/a.jpg'), '/content/dam/x/know-before-you-go-dubai/a.jpg');
  assert.deepEqual(parseDamPath('/content/dam/a/b.jpg.transform/lh-dcep-transform-width-1440/img.webp'), { asset: '/content/dam/a/b.jpg', rendition: { width: 1440, ext: 'webp' }, valid: true });
  assert.equal(parseDamPath('/content/dam/a/b.jpg.transform/lh-dcep-transform-width-999/img.jpg').valid, false);
  assert.equal(parseDamPath('/content/dam/a/b.jpg.transform/other/img.jpg').valid, false);
});

test('localDamUrl: the site loads its own copies', () => {
  assert.equal(localDamUrl('https://www.lufthansa.com/content/dam/lh/images/offers/destination/fra-square.jpg.transform/lh-dcep-transform-width-720/img.jpg'), '/content/dam/lh/images/offers/destination/fra-square.jpg?width=720&format=jpeg&optimize=medium');
  assert.equal(localDamUrl('/content/dam/lh/images/lounges/14072-square.jpg', { width: 360 }), '/content/dam/lh/images/lounges/14072-square.jpg?width=360&format=webply&optimize=medium');
  assert.equal(localDamUrl('https://www.lufthansa.com/content/dam/lh/a/B_c.png'), '/content/dam/lh/a/b-c.png');
  assert.equal(localDamUrl('https://example.com/content/dam/x.jpg'), 'https://example.com/content/dam/x.jpg');
});

test('dam: renditions are the media with width, format and optimize, 30 days', async () => {
  const resp = await get('/content/dam/lh/images/offers/destination/fra-square.jpg.transform/lh-dcep-transform-width-1440/img.webp');
  assert.equal(resp.status, 200);
  assert.equal(resp.headers.get('content-type'), 'image/webp');
  assert.equal(resp.headers.get('cache-control'), 'public, max-age=2592000');
  assert.equal(resp.headers.get('set-cookie'), null);
  assert.equal(resp.headers.get('x-lh-edge-route'), 'dam');
  const first = calls[0].url;
  assert.equal(new URL(first).pathname, '/content/dam/lh/images/offers/destination/fra-square.jpg');
  assert.deepEqual({ ...query(first), 'lh-edge-cache': undefined }, {
    width: '1440', format: 'webply', optimize: 'medium', 'lh-edge-cache': undefined,
  });
  assert.match(await resp.text(), /media_1de886.*width=1440/);
  const jpg = await get('/content/dam/lh/images/offers/destination/fra-square.jpg.transform/lh-dcep-transform-width-360/img.jpg');
  assert.equal(jpg.headers.get('content-type'), 'image/jpeg');
  assert.deepEqual(query(calls.at(-1).url), { width: '360', format: 'jpeg', optimize: 'medium' });
  await get('/content/dam/lh/images/offers/destination/fra-square.jpg.transform/lh-dcep-transform-width-2880/img.png');
  assert.deepEqual(query(calls.at(-1).url), { width: '2880', height: '2880', optimize: 'medium' });
});

test('dam: decoded and named; originals as the original file; unknown renditions 404', async () => {
  const png = await get('/content/dam/lh/images/mobileapp/Lufthansa%20Insights%20V2.png');
  assert.equal(png.status, 200);
  assert.equal(new URL(calls[0].url).pathname, '/content/dam/lh/images/mobileapp/lufthansa-insights-v2.png');
  assert.equal(new URL(calls.at(-1).url).search, '');
  const bad = await get('/content/dam/lh/images/offers/destination/fra-square.jpg.transform/lh-dcep-transform-width-999/img.jpg');
  assert.equal(bad.status, 404);
  assert.equal(bad.headers.get('cache-control'), 'public, max-age=60');
  const missing = await get('/content/dam/lh/images/other/zzq.jpg');
  assert.equal(missing.status, 404);
  assert.equal(missing.headers.get('cache-control'), 'public, max-age=60');
});

test('dam: missing offers images answer 302 as www', async () => {
  const dest = await get('/content/dam/lh/images/offers/destination/adl-square.jpg.transform/lh-dcep-transform-width-360/img.jpg');
  assert.equal(dest.status, 302);
  assert.equal(dest.headers.get('location'), `${HOST}/content/dam/lufthansa-group/images/destination/adl-square.jpg.transform/lh-dcep-transform-width-360/img.jpg`);
  const generic = await get('/content/dam/lh/images/offers/destination/zzq-square.jpg.transform/lh-dcep-transform-width-360/img.jpg');
  assert.equal(generic.headers.get('location'), `${HOST}/content/dam/lh/images/offers/fallback/generic-square.jpg.transform/lh-dcep-transform-width-360/img.jpg`);
  assert.equal(generic.headers.get('cache-control'), 'public, max-age=2592000');
  const original = await get('/content/dam/lh/images/offers/zzq.jpg');
  assert.equal(original.headers.get('location'), `${HOST}/content/dam/lh/images/offers/fallback/generic.jpg`);
  const swiss = await get('/content/dam/lx/images/offers/destination/zzq-square.jpg');
  assert.equal(swiss.headers.get('location'), 'https://www.swiss.com/content/dam/lx/images/offers/fallback/generic-square.jpg');
  // ita and four_y: no destination fallback
  const ita = await get('/content/dam/ita/images/offers/destination/adl-square.jpg');
  assert.equal(ita.headers.get('location'), 'https://www.ita-airways.com/content/dam/ita/images/offers/fallback/generic-square.jpg');
  // the fallback itself missing: 404, no loop
  const loop = await get('/content/dam/bel/images/offers/fallback/generic-square.jpg');
  assert.equal(loop.status, 404);
});

test('dam: a step before the copies (later: synced brand assets)', async () => {
  DAM_STEPS.push(async (request, e, ctx, info) => (info.asset.includes('/frontify/') ? new Response('synced') : null));
  assert.equal(await (await get('/content/dam/lh/images/frontify/a.jpg')).text(), 'synced');
  assert.equal((await get('/content/dam/lh/images/offers/destination/fra-square.jpg')).status, 200);
});
