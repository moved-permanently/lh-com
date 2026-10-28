/* eslint-disable max-len */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import worker, { routeOf } from '../src/index.js';
import { resetSheetCache } from '../src/sheet.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../../..');
const FEEDS = path.join(root, 'tools/source-export/feeds');
const ORIGIN = 'main--lh-com--moved-permanently.aem.live';
const HOST = 'https://lh-edge.example';
const read = (p) => fs.readFileSync(p, 'utf8');
const OWA_SHEET = read(path.join(root, 'tools/importer/owa-tracking-sheet.json'));

let backendCalls;
let originCalls;
const BACKENDS = {
  fetch: async (request) => {
    const body = ['GET', 'HEAD'].includes(request.method) ? '' : await request.text();
    backendCalls.push({ url: request.url, method: request.method, body });
    const u = new URL(request.url);
    if (u.pathname.startsWith('/content/dam/lh/images/frontify/2025/')) {
      return new Response('synced bytes', { headers: { 'content-type': 'image/jpeg', 'cache-control': 'public, max-age=300', etag: '"f1"' } });
    }
    if (u.pathname.startsWith('/content/dam/')) return new Response('{"error":"not-found"}', { status: 404, headers: { 'cache-control': 'max-age=60' } });
    return new Response('{"ok":true,"worker":"lh-backends"}', { headers: { 'content-type': 'application/json', 'set-cookie': 'lhb=1; Path=/; HttpOnly' } });
  },
};
const env = (extra = {}) => ({
  ORIGIN, PUBLIC_HOST: '', EDGE_TTL: '60', BACKENDS, ...extra,
});

beforeEach(() => {
  resetSheetCache();
  backendCalls = [];
  originCalls = [];
  globalThis.fetch = async (input) => {
    const req = input instanceof Request ? input : new Request(input);
    const u = new URL(req.url);
    originCalls.push(u.pathname);
    const local = u.pathname.match(/^\/([a-z]{2}\/[a-z]{2})\/(nav|footer)\.plain\.html$/);
    // the nav and footer documents as uploaded (copies: content/ is not in the repository)
    if (local) return new Response(read(path.join(here, 'fixtures/owa', `${local[1].replace('/', '-')}-${local[2]}.plain.html`)), { headers: { 'content-type': 'text/html' } });
    if (u.pathname === '/app/config/owa-tracking.json') return new Response(OWA_SHEET, { headers: { 'content-type': 'application/json' } });
    if (u.pathname === '/de/en/homepage') return new Response('<html><body>page</body></html>', { headers: { 'content-type': 'text/html' } });
    if (u.pathname === '/content/dam/lh/images/frontify_variations/1/crop.jpg') return new Response(null, { status: 301, headers: { location: '/content/dam/lh/images/frontify_variations/1/media_1abc.jpg' } });
    if (/media_1abc/.test(u.pathname)) return new Response('da copy', { headers: { 'content-type': 'image/jpeg' } });
    return new Response('Not found', { status: 404 });
  };
});

const get = (p, init = {}, e = env()) => worker.fetch(new Request(`${HOST}${p}`, init), e, {});

/* ------------------------------------------------------------------ 6. lh-backends ---------- */

test('backends: every family reaches the binding, unchanged, with Set-Cookie passed through', async () => {
  const paths = ['/service/secured/api/x', '/service/secured/api/core/authenticate/logout', '/apps/dcep/deeplink/cockpit', '/deeplink/cockpit?country=DE&language=EN', '/sso/oauth/login?state=/de/en/homepage', '/loginservice', '/seatmap/LH400', '/_lh-backends/health'];
  const answers = await Promise.all(paths.map((p) => get(p)));
  assert.deepEqual(backendCalls.map((c) => new URL(c.url).pathname + new URL(c.url).search), paths);
  assert.equal(answers[0].headers.get('set-cookie'), 'lhb=1; Path=/; HttpOnly');
  assert.equal(routeOf(new Request(`${HOST}/service/secured/api/x`)).name, 'backends');
});

test('backends: a POST passes with its body; the login return /?code&state goes there before the entry redirect', async () => {
  await get('/service/secured/api/core/profile', { method: 'POST', body: '{"a":1}', headers: { 'content-type': 'application/json' } });
  assert.deepEqual(backendCalls[0], { url: `${HOST}/service/secured/api/core/profile`, method: 'POST', body: '{"a":1}' });
  await get('/?code=abc&state=/de/en/homepage');
  await get('/de/en/homepage?code=abc&state=%2Fde%2Fen%2Fhomepage');
  assert.equal(backendCalls.length, 3);
  // without state the page stays a page
  const page = await get('/de/en/homepage?code=x');
  assert.equal(await page.text(), '<html><body>page</body></html>');
  assert.equal(backendCalls.length, 3);
});

test('backends: lh-edge\'s own endpoints and pages never reach the binding; without it 503', async () => {
  await get('/service/secured/api/core/booking/bookinglist', { headers: { 'X-Portal': 'LH' } });
  await get('/service/secured/api/core/booking/defaultairport');
  await get('/service/secured/api/core/authenticate/loginPageUrl');
  await get('/service/secured/api/search', { method: 'POST', body: '{}' });
  await get('/apps/dcep/deeplink/goodfortrain/stele', { method: 'POST', body: new URLSearchParams({ Country: 'de' }) });
  await get('/de/en/homepage');
  assert.equal(backendCalls.length, 0);
  assert.ok(originCalls.includes('/de/en/homepage'));
  const unbound = await get('/sso/x', {}, env({ BACKENDS: undefined }));
  assert.equal(unbound.status, 503);
  assert.deepEqual(await unbound.json(), { error: 'backends-not-bound' });
});

/* ---------------------------------------------------------- 8. synced brand assets ---------- */

test('dam: synced Frontify assets from lh-backends first, 404 falls back to the copies, crops stay on DA', async () => {
  const synced = await get('/content/dam/lh/images/frontify/2025/q1/9001_Mock_Seat_Classic.jpg');
  assert.equal(synced.status, 200);
  assert.equal(await synced.text(), 'synced bytes');
  assert.equal(synced.headers.get('cache-control'), 'public, max-age=300');
  assert.equal(synced.headers.get('etag'), '"f1"');
  const rendition = await get('/content/dam/lh/images/frontify/2025/q1/9001_Mock_Seat_Classic.jpg.transform/lh-dcep-transform-width-720/img.jpg');
  assert.equal(await rendition.text(), 'synced bytes');
  const missing = await get('/content/dam/lx/videos/frontify/x.mp4');
  assert.equal(missing.status, 404);
  assert.equal(backendCalls.length, 3);
  const crop = await get('/content/dam/lh/images/frontify_variations/1/crop.jpg');
  assert.equal(await crop.text(), 'da copy');
  assert.equal(backendCalls.length, 3, 'frontify_variations never goes to lh-backends');
});

/* ------------------------------------------------------------------- 5. entry -------------- */

const loc = async (p, headers = {}) => {
  const resp = await get(p, { headers });
  return {
    status: resp.status, location: resp.headers.get('location'), vary: resp.headers.get('vary'), cc: resp.headers.get('cache-control'),
  };
};

test('entry: /<cc>/<ll> to the homepage, query kept; not cached; www for locales the replica lacks', async () => {
  assert.deepEqual(await loc('/de/en'), {
    status: 302, location: '/de/en/homepage', vary: 'Cookie, Accept-Language', cc: 'private, no-store',
  });
  assert.equal((await loc('/de/en/?x=1')).location, '/de/en/homepage?x=1');
  assert.equal((await loc('/at/de')).location, '/at/de/homepage');
  assert.equal((await loc('/gb/en/')).location, '/gb/en/homepage');
  assert.equal((await loc('/at/en')).location, 'https://www.lufthansa.com/at/en/homepage');
  assert.equal((await loc('/fr/fr')).location, 'https://www.lufthansa.com/fr/fr/homepage');
  // /en is no market: a page path, 404 from the origin (www: 404)
  assert.equal((await get('/en')).status, 404);
  assert.equal(routeOf(new Request(`${HOST}/en`)).name, 'pass-through');
});

test('entry: /<cc> by cookie, Accept-Language, then the market default (not www\'s /de/de/en bug)', async () => {
  assert.equal((await loc('/de')).location, '/de/de/homepage');
  assert.equal((await loc('/de/')).location, '/de/de/homepage');
  assert.equal((await loc('/de', { 'accept-language': 'en-GB,en;q=0.9,de;q=0.8' })).location, '/de/en/homepage');
  assert.equal((await loc('/de', { 'accept-language': 'fr-FR,de;q=0.5,en;q=0.7' })).location, '/de/en/homepage');
  assert.equal((await loc('/de', { cookie: 'a=b; dcep.prehpsettings=de%2Fen', 'accept-language': 'de' })).location, '/de/en/homepage');
  assert.equal((await loc('/de', { cookie: 'dcep.prehpsettings=gb/en', 'accept-language': 'de' })).location, '/de/de/homepage', 'a choice for another country is not used');
  assert.equal((await loc('/gb')).location, '/gb/en/homepage');
});

test('entry: / by cookie, CF-IPCountry, else xx/en with the language selection', async () => {
  assert.equal((await loc('/', { cookie: 'dcep.prehpsettings=at/de' })).location, '/at/de/homepage');
  assert.equal((await loc('/', { 'cf-ipcountry': 'DE', 'accept-language': 'en-US' })).location, '/de/en/homepage');
  // www's recorded answers (feeds/ams-rest A9): / from Germany in English, /de/en, /de/de, /at/de, /gb/en
  const ams = JSON.parse(read(path.join(FEEDS, 'ams-rest/index.json')));
  const a9 = ams.filter((r) => ['/', '/de/en', '/de/en/', '/de/de', '/at/de', '/gb/en'].includes(r.url));
  assert.equal(a9.length, 6);
  await Promise.all(a9.map(async (r) => {
    const { location } = await loc(r.url, { 'cf-ipcountry': 'DE', 'accept-language': 'en' });
    assert.equal(location, new URL(r.final).pathname, r.url);
  }));
  assert.equal((await loc('/', { 'cf-ipcountry': 'GB' })).location, '/gb/en/homepage');
  assert.equal((await loc('/?a=1')).location, 'https://www.lufthansa.com/xx/en/homepage?a=1&showLanguageSelection=true');
  assert.equal((await loc('/', { 'cf-ipcountry': 'XX' })).location, 'https://www.lufthansa.com/xx/en/homepage?showLanguageSelection=true');
});

/* ------------------------------------------------------- 2. login link, header/footer ---- */

test('login URL: www\'s answers for the four locales; without the headers www\'s 500 page', async () => {
  const fixture = JSON.parse(read(path.join(FEEDS, 'login/loginpageurl.json')));
  const answers = fixture.answers.filter((a) => a.status === 200);
  assert.equal(answers.length, 4);
  await Promise.all(answers.map(async (a) => {
    const resp = await get(a.url, { headers: a.headers });
    assert.equal(resp.status, 200);
    assert.equal(resp.headers.get('content-type'), a.ct);
    assert.equal(resp.headers.get('cache-control'), a.cc);
    assert.equal(resp.headers.get('access-control-allow-origin'), a.acao);
    assert.equal(await resp.text(), a.body);
  }));
  // www's 500 answers: status, type, cache and CORS headers; the body of the complete recording
  // without the script www's CDN adds (the other recording also has a cut-off stack trace)
  const errors = fixture.answers.filter((a) => a.status === 500);
  assert.equal(errors.length, 2);
  const page = errors[0].body.replace(/<script>[\s\S]*?<\/script>/, '');
  await Promise.all(errors.map(async (a) => {
    const resp = await get(a.url, { headers: a.headers });
    assert.equal(resp.status, 500);
    assert.equal(resp.headers.get('content-type'), a.ct);
    assert.equal(resp.headers.get('cache-control'), a.cc);
    assert.equal(resp.headers.get('access-control-allow-origin'), a.acao);
    assert.equal(await resp.text(), page);
  }));
  const partial = await get('/service/secured/api/core/authenticate/loginPageUrl', { headers: { 'X-Portal': 'LH', 'X-Portal-Site': 'DE' } });
  assert.equal(partial.status, 500, 'a missing X-Portal-Language too');
});

test('header and footer JSON: equal to www\'s for the four locales; portal config; vanity form not answered', async () => {
  const index = JSON.parse(read(path.join(FEEDS, 'owa/index.json'))).urls;
  await Promise.all(Object.entries(index).map(async ([url, rec]) => {
    const resp = await get(url);
    assert.equal(resp.status, 200, url);
    assert.equal(resp.headers.get('content-type'), rec.headers['content-type']);
    assert.equal(resp.headers.get('cache-control'), rec.headers['cache-control']);
    assert.deepEqual(await resp.json(), JSON.parse(read(path.join(FEEDS, rec.file))), url);
  }));
  assert.notEqual(routeOf(new Request(`${HOST}/de/en/homepage.csi-owa-header.json`)).name, 'owa');
});

/* ------------------------------------------------------------- 3. small endpoints ---------- */

test('default airport: www\'s answers with and without the headers', async () => {
  const index = JSON.parse(read(path.join(FEEDS, 'booking/index.json'))).answers.filter((a) => /defaultairport/.test(a.url));
  await Promise.all(index.map(async (a) => {
    const resp = await get(a.url, { headers: a.requestHeaders });
    assert.equal(resp.status, a.status);
    assert.equal(resp.headers.get('cache-control'), a['cache-control']);
    assert.equal(resp.headers.get('content-type'), a['content-type']);
    assert.equal(await resp.text(), read(path.join(FEEDS, a.file)).trim());
  }));
  const other = await get('/service/secured/api/core/booking/defaultairport', { headers: { 'X-Portal': 'LH', 'X-Portal-Site': 'FR', 'X-Portal-Language': 'fr' } });
  assert.deepEqual(await other.json(), { globalDefaultAirport: { iataCode: 'FRA', name: 'Frankfurt' }, marketDefaultAirport: { iataCode: 'FRA', name: 'Frankfurt' } });
});

test('booking list: 204, no body, no-store', async () => {
  const resp = await get('/service/secured/api/core/booking/bookinglist', {
    headers: {
      'X-Portal': 'LH', 'X-Portal-Site': 'DE', 'X-Portal-Language': 'en', 'user-agent': 'Test/1',
    },
  });
  assert.equal(resp.status, 204);
  assert.equal(await resp.text(), '');
  assert.equal(resp.headers.get('cache-control'), 'private, no-cache, no-store, must-revalidate');
});

test('Good for Train kiosk: www\'s page that stores the pair in sessionStorage and goes on to the kiosk page (made-up values)', async () => {
  const post = (fields) => get('/apps/dcep/deeplink/goodfortrain/stele', { method: 'POST', body: new URLSearchParams(fields) });
  /** Runs the answer's script with a fake sessionStorage and window. */
  const run = async (fields) => {
    const html = await (await post(fields)).text();
    const script = html.match(/<script>([\s\S]*)<\/script>/)[1];
    const stored = {};
    const window = {};
    // eslint-disable-next-line no-new-func
    new Function('sessionStorage', 'window', script)({ setItem: (k, v) => { stored[k] = v; } }, window);
    return { html, stored, location: window.location };
  };
  const a = await run({
    Country: 'AT', Language: 'de', Filekey: 'ABC123', Ticketnumber: '2201234567890', Lastname: 'Muster</script>',
  });
  assert.deepEqual(a.stored, { 'dcep-session-storage/pnrfilekey': '"ABC123"', 'dcep-session-storage/lastname': '"Muster</script>"' });
  assert.equal(a.location, '/at/de/common/g4t-kiosk.solo_continue');
  assert.doesNotMatch(a.html, /<form|Muster<\/script>/);
  const b = await run({
    Country: 'gb', Language: 'en', Ticketnumber: '2201234567890', Lastname: 'Doe',
  });
  assert.deepEqual(b.stored, { 'dcep-session-storage/ticketnumber': '"2201234567890"', 'dcep-session-storage/lastname': '"Doe"' });
  assert.equal(b.location, '/gb/en/common/g4t-kiosk.solo_continue');
  const c = await run({ Country: 'de', Language: 'en', Filekey: 'X' });
  assert.deepEqual(c.stored, {}, 'nothing without a last name');
  assert.equal(c.location, '/de/en/common/g4t-kiosk.solo_continue');
  assert.equal((await run({
    Country: 'fr', Language: 'fr', Filekey: 'X', Lastname: 'Y',
  })).location, '/de/de/common/g4t-kiosk.solo_continue');
  assert.equal((await run({
    Country: 'at', Language: 'en', Filekey: 'X', Lastname: 'Y',
  })).location, '/at/de/common/g4t-kiosk.solo_continue');
  const resp = await post({
    Country: 'de', Language: 'de', Filekey: 'X', Lastname: 'Y',
  });
  assert.equal(resp.headers.get('cache-control'), 'private, no-cache, no-store, must-revalidate');
});

/* ------------------------------------------------------------- 4. selectlanguage ---------- */

test('selectlanguage: www\'s two recorded answers; unknown market or tenant: none', async () => {
  const de = await get('/apps/selectlanguage?tenant=lh&country=de');
  assert.equal(de.headers.get('content-type'), 'application/json');
  assert.equal(de.headers.get('cache-control'), 'max-age=604800');
  assert.equal(await de.text(), '{"languages":[{"code":"de","name":"German","isDefault":false},{"code":"en","name":"English","isDefault":false}]}');
  assert.equal(await (await get('/apps/selectlanguage')).text(), '{"languages":[]}');
  assert.equal(await (await get('/apps/selectlanguage?tenant=lx&country=de')).text(), '{"languages":[]}');
  assert.equal(await (await get('/apps/selectlanguage?tenant=lh&country=fr')).text(), '{"languages":[]}');
  assert.equal(await (await get('/apps/selectlanguage?tenant=lh&country=AT')).text(), '{"languages":[{"code":"de","name":"German","isDefault":false}]}');
});

test('header JSON: the same from the nav as Edge Delivery renders it (icon spans instead of :icon: tokens)', async () => {
  const { buildHeader } = await import('../src/owa.js');
  const doc = read(path.join(here, 'fixtures/owa/de-en-nav.plain.html'));
  const rendered = doc.replace(/:([a-z0-9-]+):\s*/g, '<span class="icon icon-$1"></span>');
  const rows = JSON.parse(OWA_SHEET).data;
  assert.deepEqual(buildHeader(rendered, 'de/en', rows), buildHeader(doc, 'de/en', rows));
  assert.deepEqual(buildHeader(rendered, 'de/en', rows), JSON.parse(read(path.join(FEEDS, 'owa/de-en-homepage.header.json'))));
});
