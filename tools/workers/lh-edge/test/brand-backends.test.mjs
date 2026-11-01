/* eslint-disable max-len */
// The brand hosts' backend routes, sign-in return, long AEM paths and entry redirects (brief 212):
// - austrian, discover, ita and brussels (scripts/brands.js `backends`: lh-backends has their tenant) send the
//   paths lufthansa.turnsthe.page sends to lh-backends (isBackendsPath) there too, the host as it is
//   (lh-backends picks the brand from it or from X-Portal); lh-edge's own four API answers
//   (search, defaultairport, bookinglist, loginPageUrl: Lufthansa's) are left out, as is every plain
//   site;
// - a GET of / or /<cc>/<ll>/… with code and state is the sign-in return (lh-backends);
// - /content/<aemContent>/markets/<cc>/<ll>/<page>[.html] (www's AEM paths: aua, four_y, ita, bel):
//   301 to /<cc>/<ll>/<page>;
// - /<cc>/<ll>[/] and /<cc>[/] of every root in BRAND_SITES: 302 to the root's homepage;
// - Air Dolomiti's /en and /de (www answers them as /en/ and /de/): 302 to /en/ and /de/.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { resetMarketCache } from '../src/markets.js';
/* eslint-disable import/no-relative-packages */
import { BRANDS, BRAND_SITES } from '../../../../scripts/brands.js';
/* eslint-enable import/no-relative-packages */

globalThis.HTMLRewriter = HTMLRewriter;

const ORIGINS = {
  discover: 'main--lh-discover--moved-permanently.aem.live',
  ita: 'main--lh-ita--moved-permanently.aem.live',
  austrian: 'main--lh-austrian--moved-permanently.aem.live',
  brussels: 'main--lh-brussels--moved-permanently.aem.live',
  cargo: 'main--lh-cargo--moved-permanently.aem.live',
  airdolomiti: 'main--lh-airdolomiti--moved-permanently.aem.live',
};
const SITES = Object.keys(ORIGINS);
let backendCalls;
const BACKENDS = {
  fetch: async (request) => {
    const body = ['GET', 'HEAD'].includes(request.method) ? '' : await request.text();
    backendCalls.push({
      url: request.url, method: request.method, body, portal: request.headers.get('x-portal'),
    });
    return new Response('{"ok":true,"worker":"lh-backends"}', { headers: { 'content-type': 'application/json' } });
  },
};
const env = () => ({
  ORIGIN: 'main--lh-com--moved-permanently.aem.live',
  WWW_HOST: 'www.lufthansa.com',
  PILOT_HOSTS: '',
  EDGE_TTL: '60',
  // the route name as a header (wrangler.toml ROUTER_HEADER)
  ROUTER_HEADER: 'x-lh-edge-route',
  BACKENDS,
  SITE_HOSTS: SITES.map((s) => `${s}.example=${s}`).join('; '),
  SITE_ORIGINS: SITES.map((s) => `${s}=${ORIGINS[s]}`).join('; '),
});
beforeEach(() => {
  resetMarketCache();
  backendCalls = [];
  // the origins: nothing (Edge Delivery's 404)
  globalThis.fetch = async () => new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain' } });
});
const get = (site, p, init = {}) => worker.fetch(new Request(`https://${site}.example${p}`, init), env(), { waitUntil: () => {} });

const BACKEND_PATHS = [
  '/deeplink/cockpit?country=AT&language=EN',
  '/apps/dcep/deeplink/cockpit',
  '/sso/oauth',
  '/sso/oauth/login?state=/at/en/homepage',
  '/loginservice',
  '/service/secured/api/core/booking/bookingdetailslink',
  '/service/secured/api/core/booking/hotel',
  '/service/secured/api/core/checkin/boardingpass',
  '/service/secured/api/core/filekeylogin',
  '/_lh-backends/mock-travelid/authorize',
];
const OWN_API = [
  '/service/secured/api/search',
  '/service/secured/api/core/booking/defaultairport',
  '/service/secured/api/core/booking/bookinglist',
  '/service/secured/api/core/authenticate/loginPageUrl',
];

test('brands.js: lh-backends\' tenants (Austrian, Discover, ITA, Brussels) and their AEM content roots', () => {
  assert.deepEqual(Object.keys(BRANDS).filter((k) => BRANDS[k].backends).sort(), ['austrian', 'brussels', 'discover', 'ita']);
  assert.equal(BRANDS.austrian.aemContent, 'aua');
  assert.equal(BRANDS.discover.aemContent, 'four_y');
  assert.equal(BRANDS.ita.aemContent, 'ita');
  // www.brusselsairlines.com's links: /content/bel/markets/<cc>/<ll>/... (lh-backends' cockpit login page too)
  assert.equal(BRANDS.brussels.aemContent, 'bel');
});

test('austrian, discover, ita, brussels: the backend paths reach lh-backends, the host and request as they are', async () => {
  await ['austrian', 'discover', 'ita', 'brussels'].reduce(async (prev, site) => {
    await prev;
    backendCalls = [];
    const answers = await Promise.all(BACKEND_PATHS.map((p) => get(site, p)));
    answers.forEach((resp, i) => {
      assert.equal(resp.headers.get('x-lh-edge-route'), 'backends', `${site} ${BACKEND_PATHS[i]}`);
      assert.equal(resp.status, 200);
    });
    assert.deepEqual(backendCalls.map((c) => c.url).sort(), BACKEND_PATHS.map((p) => `https://${site}.example${p}`).sort(), 'the brand host, unchanged');
  }, Promise.resolve());
  // a POST with its body and headers (the check-in API: the brand's X-Portal)
  backendCalls = [];
  await get('ita', '/service/secured/api/core/checkin/passengers', { method: 'POST', body: '{"pnr":"ABC123"}', headers: { 'x-portal': 'ITA', 'content-type': 'application/json' } });
  assert.deepEqual(backendCalls, [{
    url: 'https://ita.example/service/secured/api/core/checkin/passengers', method: 'POST', body: '{"pnr":"ABC123"}', portal: 'ITA',
  }]);
});

test('lh-edge\'s own four API answers (Lufthansa\'s) stay off the brand hosts; the plain sites get no backend routes', async () => {
  const own = ['austrian', 'discover', 'ita', 'brussels'].flatMap((site) => OWN_API.map((p) => [site, p]));
  (await Promise.all(own.map(([site, p]) => get(site, p)))).forEach((resp, i) => {
    assert.notEqual(resp.headers.get('x-lh-edge-route'), 'backends', own[i].join(' '));
    assert.notEqual(resp.headers.get('x-lh-edge-route'), 'login-url', own[i].join(' '));
  });
  const none = ['cargo', 'airdolomiti'].flatMap((site) => BACKEND_PATHS.map((p) => [site, p]));
  (await Promise.all(none.map(([site, p]) => get(site, p)))).forEach((resp, i) => {
    assert.notEqual(resp.headers.get('x-lh-edge-route'), 'backends', none[i].join(' '));
  });
  assert.deepEqual(backendCalls, []);
});

test('the sign-in return: / or /<cc>/<ll>/… with code and state goes to lh-backends (not the entry redirect)', async () => {
  const home = await get('austrian', '/?code=abc&state=/at/en/homepage');
  assert.equal(home.headers.get('x-lh-edge-route'), 'login-return');
  const page = await get('ita', '/it/en/homepage?code=abc&state=/it/en/homepage');
  assert.equal(page.headers.get('x-lh-edge-route'), 'login-return');
  const sn = await get('brussels', '/be/en/homepage?code=abc&state=/be/en/homepage');
  assert.equal(sn.headers.get('x-lh-edge-route'), 'login-return');
  assert.deepEqual(backendCalls.map((c) => c.url), ['https://austrian.example/?code=abc&state=/at/en/homepage', 'https://ita.example/it/en/homepage?code=abc&state=/it/en/homepage', 'https://brussels.example/be/en/homepage?code=abc&state=/be/en/homepage']);
  // without code and state, or a state that is no page path: as before
  assert.notEqual((await get('austrian', '/?state=/at/en/homepage')).headers.get('x-lh-edge-route'), 'login-return');
  assert.notEqual((await get('brussels', '/be/en/homepage?code=x&state=y')).headers.get('x-lh-edge-route'), 'login-return');
  // the plain sites: no sign-in return
  assert.notEqual((await get('cargo', '/?code=abc&state=/en/home')).headers.get('x-lh-edge-route'), 'login-return');
});

test('long AEM paths of the brand: 301 to the short path (as /content/lh/markets/… on lh-com)', async () => {
  const cases = [
    ['austrian', '/content/aua/markets/at/en/login.html', '/at/en/login'],
    ['austrian', '/content/aua/markets/at/de/anmeldung.html?x=1', '/at/de/anmeldung?x=1'],
    ['discover', '/content/four_y/markets/de/en/login.html', '/de/en/login'],
    ['discover', '/content/four_y/markets/de/de/Profile/Login', '/de/de/profile/login'],
    ['ita', '/content/ita/markets/it/en/login.html', '/it/en/login'],
    ['ita', '/content/ita/markets/it/it/area-personale/', '/it/it/area-personale'],
    ['brussels', '/content/bel/markets/be/en/profile/login.html?deeplinkRedirect=true', '/be/en/profile/login?deeplinkRedirect=true'],
    ['brussels', '/content/bel/markets/be/fr/contact', '/be/fr/contact'],
  ];
  (await Promise.all(cases.map(([site, from]) => get(site, from)))).forEach((resp, i) => {
    const [site, from, to] = cases[i];
    assert.equal(resp.status, 301, `${site} ${from}`);
    assert.equal(resp.headers.get('location'), to, `${site} ${from}`);
  });
  // another brand's root, Lufthansa's, or a DAM path: no redirect
  assert.notEqual((await get('austrian', '/content/ita/markets/it/en/login.html')).status, 301);
  assert.notEqual((await get('ita', '/content/lh/markets/de/en/login.html')).status, 301);
  assert.notEqual((await get('discover', '/content/four_y/markets/de/en/image.jpg')).status, 301);
  assert.notEqual((await get('brussels', '/content/aua/markets/at/en/login.html')).status, 301);
});

test('entry redirects from every root of BRAND_SITES: /<cc>/<ll>[/] and /<cc>[/] to the root\'s homepage', async () => {
  const cases = [
    ['ita', '/it/en', '/it/en/homepage'],
    ['ita', '/it/it/', '/it/it/homepage'],
    ['austrian', '/at/en', '/at/en/homepage'],
    ['austrian', '/at/en/', '/at/en/homepage'],
    ['austrian', '/at/de', '/at/de/homepage'],
    ['discover', '/de/en', '/de/en/homepage'],
    ['discover', '/de/de/', '/de/de/homepage'],
    // as before
    ['austrian', '/xx/en', '/at/en/homepage'],
    ['austrian', '/at', '/at/en/homepage'],
    ['brussels', '/be/fr', '/be/fr/homepage'],
  ];
  (await Promise.all(cases.map(([site, from]) => get(site, `${from}?utm=1`)))).forEach((resp, i) => {
    const [site, from, to] = cases[i];
    assert.equal(resp.status, 302, `${site} ${from}`);
    assert.equal(resp.headers.get('location'), `${to}?utm=1`, `${site} ${from}`);
  });
  // every root of every brand site, from BRAND_SITES (no list in the code)
  const roots = Object.entries(BRAND_SITES).flatMap(([site, { rows }]) => Object.keys(rows).map((key) => [site, key]));
  (await Promise.all(roots.map(([site, key]) => get(site, `/${key}`)))).forEach((resp, i) => {
    assert.equal(resp.status, 302, roots[i].join(' /'));
    assert.match(resp.headers.get('location'), /\/homepage$/, roots[i].join(' /'));
  });
});

test('Air Dolomiti: /en and /de as /en/ and /de/ (www answers them as its English and German homepages); Cargo as before', async () => {
  const en = await get('airdolomiti', '/en');
  assert.equal(en.status, 302);
  assert.equal(en.headers.get('location'), '/en/');
  assert.equal((await get('airdolomiti', '/de?x=1')).headers.get('location'), '/de/?x=1');
  assert.notEqual((await get('airdolomiti', '/en/')).status, 302, '/en/ is the page');
  assert.equal((await get('cargo', '/en')).headers.get('location'), '/en/home');
});
