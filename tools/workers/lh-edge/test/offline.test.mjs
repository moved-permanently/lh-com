/* eslint-disable max-len */
/* www's offline page list (brief 80 part 4): /content/lh/markets/<cc>/<ll>/<page>.csi-offline.json */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import worker, { routeOf } from '../src/index.js';
import { offlineResources } from '../src/offline.js';

const WWW = JSON.parse(fs.readFileSync(new URL('../../../source-export/feeds/ams-rest/selectors/csi-offline-full.json', import.meta.url), 'utf8'));
const env = { ORIGIN: 'main--lh-com--moved-permanently.aem.live', PUBLIC_HOST: 'lh-edge.example', EDGE_TTL: '60' };
const PAGE = `<!DOCTYPE html><html><head><title>Home</title>
<script nonce="aem" src="/scripts/aem.js" type="module"></script><script nonce="aem" src="/scripts/scripts.js" type="module"></script>
<link rel="stylesheet" href="/styles/styles.css"/><link rel="manifest" href="/etc/designs/dcep/manifest.json"><link rel="shortcut icon" href="/etc/designs/dcep/favicon.ico" type="image/ico">
<meta property="og:image" content="https://lh-edge.example/x.jpg"></head><body><header></header><main>
<div><div class="flight-search"><div><div>Tabs</div><div>Flights</div></div></div><p><picture><source type="image/webp" srcset="./media_aa.jpg?width=2000&#x26;format=webply 2000w, ./media_aa.jpg?width=750 750w"><img src="./media_aa.jpg?width=750&#x26;format=jpg" alt=""></picture></p></div>
<div><div class="cards-icon dark"><div><div><img src="https://main--lh-com--moved-permanently.aem.live/icons/hotel.svg" alt=""></div></div></div><div class="flight-search"></div><p><img src="https://www.lufthansa.com/etc/designs/dcep/lh-logo-crane.svg" alt=""></p></div>
</main><footer></footer></body></html>`;

beforeEach(() => {
  globalThis.fetch = async (input) => {
    const req = input instanceof Request ? input : new Request(input);
    const u = new URL(req.url);
    if (u.pathname === '/de/en/homepage') return new Response(PAGE, { headers: { 'content-type': 'text/html; charset=utf-8' } });
    return new Response('<html>404</html>', { status: 404, headers: { 'content-type': 'text/html' } });
  };
});
const get = (p) => worker.fetch(new Request(`https://lh-edge.example${p}`), env, {});

test('csi-offline: the fixture page answers with www\'s shape and headers', async () => {
  const resp = await get('/content/lh/markets/de/en/homepage.csi-offline.json');
  assert.equal(resp.status, 200);
  assert.equal(resp.headers.get('cache-control'), 'no-cache, no-store, must-revalidate');
  assert.equal(resp.headers.get('content-type'), 'application/json');
  const body = await resp.json();
  assert.deepEqual(Object.keys(body), Object.keys(WWW), 'targetPage, resources');
  assert.equal(typeof body.targetPage, 'string');
  assert.ok(Array.isArray(body.resources) && body.resources.every((r) => typeof r === 'string'));
  assert.equal(body.targetPage, 'https://lh-edge.example/de/en/homepage');
  assert.deepEqual(body.resources, [
    '/scripts/aem.js', '/scripts/scripts.js', '/styles/styles.css', '/etc/designs/dcep/manifest.json', '/etc/designs/dcep/favicon.ico',
    '/styles/fonts.css', '/styles/lazy-styles.css', '/blocks/header/header.js', '/blocks/header/header.css', '/blocks/footer/footer.js', '/blocks/footer/footer.css',
    '/blocks/flight-search/flight-search.js', '/blocks/flight-search/flight-search.css', '/blocks/cards-icon/cards-icon.js', '/blocks/cards-icon/cards-icon.css',
    '/de/en/media_aa.jpg?width=750&format=jpg', '/icons/hotel.svg', 'https://www.lufthansa.com/etc/designs/dcep/lh-logo-crane.svg', '/de/en/media_aa.jpg?width=2000&format=webply',
  ]);
  // www's own list is root-relative paths too (its first entry is an empty string)
  assert.ok(WWW.resources.filter(Boolean).every((r) => r.startsWith('/')));
});

test('csi-offline: the short form, unknown pages and other methods answer 404', async () => {
  const short = await get('/de/en/homepage.csi-offline.json');
  assert.equal(short.status, 404);
  assert.equal(short.headers.get('cache-control'), 'no-cache, no-store, must-revalidate');
  assert.equal((await get('/content/lh/markets/de/en/nothing.csi-offline.json')).status, 404);
  assert.equal(routeOf(new Request('https://lh-edge.example/content/lh/markets/de/en/homepage.csi-offline.json')).name, 'csi-offline');
  assert.equal(routeOf(new Request('https://lh-edge.example/de/en/homepage.csi-offline.json')).name, 'csi-offline');
  assert.notEqual(routeOf(new Request('https://lh-edge.example/content/lh/markets/de/en/homepage.csi-offline.json', { method: 'POST' })).name, 'csi-offline');
});

test('csi-offline: resources are deduplicated; data URLs and anchors left out', () => {
  const html = '<html><head><link rel="stylesheet" href="/styles/styles.css"><link rel="stylesheet" href="/styles/styles.css"></head><body><main><div><p><img src="data:image/png;base64,AAA"><img src="./media_b.png?width=750"></p></div></main></body></html>';
  const r = offlineResources(html, '/gb/en/x', 'lhcom.bbird.live');
  assert.equal(r.filter((x) => x === '/styles/styles.css').length, 1);
  assert.ok(r.includes('/gb/en/media_b.png?width=750'));
  assert.ok(!r.some((x) => x.startsWith('data:')));
});
