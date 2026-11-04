/* eslint-disable max-len, no-restricted-syntax, no-await-in-loop */
/* Files authors pick from the AEM Assets sandbox in DA's "AEM Assets" panel (brief 334): the
   links name https://<brand>.turnsthe.page/content/dam/<path>, the asset's own AEM path.
   1. Every type the sandbox's dispatcher serves under /content (css, eot, gif, ico, jpeg, jpg, js,
      pdf, png, svg, swf, ttf, woff, woff2, mp4, mov, m4v, vtt; html stays out): DA first, AEM only
      after DA's 404 (a file DA serves costs no AEM call); mp4 and vtt still AEM first. The checks
      as before: text/html (a hibernated tier) or another type = unavailable (503 Retry-After 120
      when DA has none), AEM's 404 stays the route's 404. Renditions and the site's own media
      parameters (?width=) stay DA's; the offers images keep www's fallback and make no AEM call.
      An SVG from AEM can't run scripts (CSP script-src 'none').
   2. The plain sites (cargo, airdolomiti, tap): /content/dam as on the other site hosts; their
      other paths (Cargo's /documents/, the pages) as before.
   Run: node --import ./test/cloudflare-workers-shim.mjs --test test/dam-aem-files.test.mjs */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { MEDIA_TYPES, AFTER_DA } from '../src/dam-aem.js';

// the site hosts' pages pass the brand-icon rewrite
globalThis.HTMLRewriter = HTMLRewriter;

const ORIGIN = 'main--lh-com--moved-permanently.aem.live';
const AEM = 'https://publish-p1-e2.adobeaemcloud.com';
const HOST = 'https://lh-edge.example';
const PNG = '/content/dam/lh-com-poc/keepalive.png';
const SERVED = '/content/dam/lh/images/served-by-da.png';
const MP4 = '/content/dam/video/c3/202405-em/quiz/lh-em-quiz-01-en.mp4';
const toml = fs.readFileSync(new URL('../wrangler.toml', import.meta.url), 'utf8');
const tomlVar = (name) => (toml.match(new RegExp(`^${name} = "([^"]*)"`, 'm')) || [])[1] || '';

let calls;
let aem;
let da;
const TYPE_OF = {
  png: 'image/png', svg: 'image/svg+xml', js: 'text/javascript', mp4: 'video/mp4', woff2: 'font/woff2', ico: 'image/vnd.microsoft.icon', jpg: 'image/jpeg', css: 'text/css',
};
beforeEach(() => {
  calls = [];
  // DA: only SERVED and the plain sites' pages (default)
  da = (req) => {
    const { pathname } = new URL(req.url);
    if (pathname.includes('served-by-da')) return new Response('png-da', { headers: { 'content-type': 'image/png' } });
    if (pathname === '/pt-pt' || pathname === '/documents/x.pdf') return new Response(`page ${pathname}`, { headers: { 'content-type': 'text/html' } });
    return new Response('Not found', { status: 404, headers: { 'content-type': 'text/html' } });
  };
  aem = (req) => {
    const ext = req.url.split('.').pop();
    return new Response(req.method === 'HEAD' ? null : `aem ${ext}`, { headers: { 'content-type': TYPE_OF[ext] || 'application/octet-stream', 'content-length': '7', etag: '"a"' } });
  };
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input, init);
    calls.push({ url: req.url, method: req.method });
    if (req.url.startsWith(AEM)) return aem(req, init);
    if (/^main--lh-[a-z0-9-]+--moved-permanently\.aem\.(live|page)$/.test(new URL(req.url).hostname)) return da(req, init);
    return new Response('Not found', { status: 404 });
  };
});
const env = (extra = {}) => ({
  ORIGIN, PUBLIC_HOST: '', EDGE_TTL: '60', AEM_PUBLISH: AEM, ...extra,
});
const get = (p, init, e = env(), host = HOST) => worker.fetch(new Request(`${host}${p}`, init), e, {});
const aemCalls = () => calls.filter((c) => c.url.startsWith(AEM));
const daCalls = () => calls.filter((c) => !c.url.startsWith(AEM));

test('the types: the dispatcher\'s under /content, html out; mp4 and vtt before DA, the others after', () => {
  assert.deepEqual(Object.keys(MEDIA_TYPES).sort(), ['css', 'eot', 'gif', 'ico', 'jpeg', 'jpg', 'js', 'm4v', 'mov', 'mp4', 'pdf', 'png', 'svg', 'swf', 'ttf', 'vtt', 'woff', 'woff2']);
  assert.equal(MEDIA_TYPES.html, undefined);
  assert.equal(AFTER_DA.has('mp4'), false);
  assert.equal(AFTER_DA.has('vtt'), false);
  ['png', 'jpg', 'svg', 'pdf', 'js', 'css', 'woff2', 'mov'].forEach((x) => assert.ok(AFTER_DA.has(x), x));
});

test('an image only on AEM: DA first (404), then AEM: 200 dam-aem image/png, the publish tier\'s path', async () => {
  const resp = await get(PNG);
  assert.equal(resp.status, 200);
  assert.equal(resp.headers.get('x-lh-edge-route'), 'dam-aem');
  assert.equal(resp.headers.get('content-type'), 'image/png');
  assert.equal(resp.headers.get('cache-control'), 'public, max-age=2592000');
  assert.equal(await resp.text(), 'aem png');
  assert.equal(daCalls().length, 1, 'one DA request first');
  assert.equal(aemCalls().length, 1);
  assert.equal(aemCalls()[0].url, `${AEM}${PNG}`);
  assert.ok(calls.indexOf(daCalls()[0]) < calls.indexOf(aemCalls()[0]), 'DA before AEM');
  const head = await get(PNG, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(aemCalls().at(-1).method, 'HEAD');
});

test('an image DA serves: from DA, no AEM call', async () => {
  const resp = await get(SERVED);
  assert.equal(resp.status, 200);
  assert.equal(resp.headers.get('x-lh-edge-route'), 'dam');
  assert.equal(await resp.text(), 'png-da');
  assert.equal(aemCalls().length, 0);
});

test('the other types after DA: svg (scripts off), js and ico by their aliases, woff2, css', async () => {
  const svg = await get('/content/dam/lh-com-poc/logo.svg');
  assert.equal(svg.headers.get('x-lh-edge-route'), 'dam-aem');
  assert.equal(svg.headers.get('content-type'), 'image/svg+xml');
  assert.equal(svg.headers.get('content-security-policy'), "script-src 'none'");
  const js = await get('/content/dam/lh-com-poc/app.js');
  assert.equal(js.status, 200);
  assert.equal(js.headers.get('content-type'), 'application/javascript');
  const ico = await get('/content/dam/lh-com-poc/favicon.ico');
  assert.equal(ico.status, 200);
  assert.equal(ico.headers.get('content-type'), 'image/x-icon');
  assert.equal((await get('/content/dam/lh-com-poc/font.woff2')).status, 200);
  assert.equal((await get('/content/dam/lh-com-poc/site.css')).headers.get('content-type'), 'text/css; charset=utf-8');
});

test('the checks as before: AEM 404 stays the route\'s 404; text/html (hibernated), another type or 5xx: 503 Retry-After 120', async () => {
  aem = () => new Response('Not found', { status: 404 });
  const missing = await get(PNG);
  assert.equal(missing.status, 404);
  assert.equal(missing.headers.get('x-lh-edge-route'), 'dam');
  for (const answer of [
    () => new Response('<html>hibernated</html>', { headers: { 'content-type': 'text/html' } }),
    () => new Response('x', { headers: { 'content-type': 'application/json' } }),
    () => new Response('down', { status: 503 }),
  ]) {
    aem = answer;
    const resp = await get(PNG);
    assert.equal(resp.status, 503);
    assert.equal(resp.headers.get('retry-after'), '120');
    assert.equal(resp.headers.get('x-lh-edge-route'), 'dam-aem-unavailable');
  }
});

test('renditions, the site\'s own media parameters, html and the offers images: DA only, as before', async () => {
  assert.equal((await get(`${PNG}.transform/lh-dcep-transform-width-1440/img.png`)).status, 404);
  assert.equal((await get(`${PNG}?width=750&format=webply`)).status, 404);
  assert.equal((await get('/content/dam/lh-com-poc/page.html')).status, 404);
  const offer = await get('/content/dam/lh/images/offers/nowhere-zzq-square.jpg');
  assert.equal(offer.status, 302, 'www\'s fallback');
  assert.equal(aemCalls().length, 0);
});

test('mp4 and vtt still ask AEM first (no DA request when AEM has the file)', async () => {
  const resp = await get(MP4);
  assert.equal(resp.headers.get('x-lh-edge-route'), 'dam-aem');
  assert.equal(daCalls().length, 0);
});

// the plain sites, their hosts and origins as wrangler.toml has them
const siteEnv = () => env({
  SITE_HOSTS: tomlVar('SITE_HOSTS'), SITE_ORIGINS: tomlVar('SITE_ORIGINS'), SITE_WWW_HOSTS: tomlVar('SITE_WWW_HOSTS'),
});

test('the plain sites: /content/dam as the other site hosts (an mp4 from AEM, an image after DA); their other paths as before', async () => {
  for (const host of ['https://cargo.turnsthe.page', 'https://airdolomiti.turnsthe.page', 'https://tap.turnsthe.page']) {
    calls = [];
    const mp4 = await get(MP4, { headers: { range: 'bytes=0-99' } }, siteEnv(), host);
    assert.equal(mp4.headers.get('x-lh-edge-route'), 'dam-aem', host);
    assert.equal(aemCalls()[0].url, `${AEM}${MP4}`, host);
    calls = [];
    const png = await get(PNG, {}, siteEnv(), host);
    assert.equal(png.headers.get('x-lh-edge-route'), 'dam-aem', host);
    assert.ok(new URL(daCalls()[0].url).hostname.startsWith(`main--lh-${host.split('//')[1].split('.')[0]}--`), `${host}: its own origin's DA copies first`);
  }
  calls = [];
  const page = await get('/pt-pt', {}, siteEnv(), 'https://tap.turnsthe.page');
  assert.equal(page.status, 200);
  assert.equal(await page.text(), 'page /pt-pt');
  const doc = await get('/documents/x.pdf', {}, siteEnv(), 'https://cargo.turnsthe.page');
  assert.equal(doc.status, 200);
  assert.equal(await doc.text(), 'page /documents/x.pdf');
  assert.equal(aemCalls().length, 0, 'no AEM call for their other paths');
});
