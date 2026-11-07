/* eslint-disable max-len */
// Lufthansa Group for Business (lh-b2b) on its host: the replica's sign-in and member pages in front
// of lh-backends (binding BACKENDS; the b2b sign-in round of 2026-11-07):
// - scripts/brands.js b2b `backends`: /service/secured/api/*, /sso/*, /_lh-backends/* to BACKENDS as
//   on the other brands; POST /j_security_check and /<cc>/<ll>/j_security_check too;
// - the member pages (GET/HEAD /<cc>/<ll>/{home,profile,reports,fund,history,usermanagement,lhghome}[/…],
//   /<cc>/<ll>/common/{support,terms-and-conditions}, /<cc>/<ll>/experts-members[/…]): BACKENDS'
//   gate (GET https://<host>/_lh-backends/b2b/gate?path=<path and query>, the request's cookie header)
//   first; 204: the page as usual, cache-control private, no-store, the gate's Set-Cookie passed on;
//   any other answer: the gate's, as it is;
// - every other path, and every other brand's host: as before.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { resetMarketCache } from '../src/markets.js';
import { isMemberPath } from '../src/b2b-gate.js';

globalThis.HTMLRewriter = HTMLRewriter;

const B2B = 'main--lh-b2b--moved-permanently.aem.live';
const BRUSSELS = 'main--lh-brussels--moved-permanently.aem.live';
let gateAnswer;
let backendCalls;
const BACKENDS = {
  fetch: async (request) => {
    const u = new URL(request.url);
    backendCalls.push({
      url: request.url, path: u.pathname, method: request.method, cookie: request.headers.get('cookie'), redirect: request.redirect, body: ['GET', 'HEAD'].includes(request.method) ? '' : await request.text(),
    });
    if (u.pathname === '/_lh-backends/b2b/gate') return gateAnswer();
    return new Response('{"worker":"lh-backends"}', { headers: { 'content-type': 'application/json', 'set-cookie': 'b2bsession=abc; Path=/; HttpOnly' } });
  },
};
const env = () => ({
  ORIGIN: 'main--lh-com--moved-permanently.aem.live',
  WWW_HOST: 'www.lufthansa.com',
  PILOT_HOSTS: '',
  EDGE_TTL: '60',
  ROUTER_HEADER: 'x-lh-edge-route',
  BACKENDS,
  SITE_HOSTS: 'brussels.example=brussels; b2b.example=b2b',
  SITE_ORIGINS: `brussels=${BRUSSELS}; b2b=${B2B}`,
  SITE_WWW_HOSTS: 'brussels=www.brusselsairlines.com; b2b=business.lufthansagroup.com',
});
const page = (path, body) => `<!DOCTYPE html><html><head><title>${path}</title><link rel="canonical" href="https://${B2B}${path}"></head><body><main>${body}</main></body></html>`;
const FILES = {
  '/de/en/home': page('/de/en/home', '<h1>Home</h1>'),
  '/de/en/fund': page('/de/en/fund', '<h1>Fund</h1>'),
  '/de/en/experts-members': page('/de/en/experts-members', '<h1>eXperts members</h1>'),
  '/de/en/common/support': page('/de/en/common/support', '<h1>Support</h1>'),
  '/de/en/login': page('/de/en/login', '<h1>Login</h1>'),
  '/de/en/homepage': page('/de/en/homepage', '<h1>Homepage</h1>'),
};
let originCalls;
beforeEach(() => {
  resetMarketCache();
  backendCalls = [];
  originCalls = [];
  gateAnswer = () => new Response(null, { status: 204 });
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input, init);
    const u = new URL(req.url);
    originCalls.push(`${u.hostname}${u.pathname}`);
    const f = (u.hostname === B2B || u.hostname === BRUSSELS) && (FILES[u.pathname.replace(/\.plain\.html$/, '')] || FILES[u.pathname]);
    if (f) return new Response(f, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'max-age=7200' } });
    return new Response('<html>404</html>', { status: 404, headers: { 'content-type': 'text/html' } });
  };
});
const get = (url, init) => worker.fetch(new Request(url, init), env(), { waitUntil() {} });

test('the member paths', () => {
  ['/de/en/home', '/de/en/home/', '/de/de/profile', '/at/en/reports', '/de/en/fund', '/de/en/history', '/de/en/usermanagement', '/de/en/lhghome', '/de/en/lhghome/x',
    '/de/en/common/support', '/de/de/common/terms-and-conditions', '/de/en/experts-members', '/ch/de/experts-members/news'].forEach((p) => assert.ok(isMemberPath(p), p));
  ['/de/en/homepage', '/de/en/login', '/de/en/login_internal', '/de/en/common/privacy', '/de/en/program/experts', '/de/en/home-office', '/home', '/de/home'].forEach((p) => assert.ok(!isMemberPath(p), p));
});

test('b2b: lh-backends\' paths to BACKENDS as on the other brands, the host as it is', async () => {
  const paths = ['/service/secured/api/b2bneo/session', '/service/secured/api/b2bneo/user/roles', '/sso/b2bneo/logout?redirect=https://b2b.example/de/en/login', '/_lh-backends/b2b/gate?path=/de/en/home', '/service/secured/api/experts/login?country=de&language=en'];
  const answers = await Promise.all(paths.map((p) => get(`https://b2b.example${p}`, { headers: { cookie: 'b2bsession=abc' } })));
  answers.forEach((resp, i) => assert.equal(resp.headers.get('x-lh-edge-route'), 'backends', paths[i]));
  assert.deepEqual(backendCalls.map((c) => new URL(c.url).host), Array(5).fill('b2b.example'));
  assert.ok(backendCalls.every((c) => c.cookie === 'b2bsession=abc'));
});

test('b2b: POST /j_security_check and /<cc>/<ll>/j_security_check to BACKENDS, the form and the answer as they are', async () => {
  const form = 'j_username=u&j_password=p&loginType=EXT&j_validate=true&resource=%2Fde%2Fen%2Fhome';
  const paths = ['/j_security_check', '/de/en/j_security_check'];
  const answers = await Promise.all(paths.map((p) => get(`https://b2b.example${p}`, { method: 'POST', body: form, headers: { 'content-type': 'application/x-www-form-urlencoded' } })));
  answers.forEach((resp, i) => {
    assert.equal(resp.headers.get('x-lh-edge-route'), 'b2b-login', paths[i]);
    assert.match(resp.headers.get('set-cookie'), /b2bsession=abc/);
  });
  assert.deepEqual(backendCalls.map((c) => [c.path, c.method, c.body]).sort(), [['/de/en/j_security_check', 'POST', form], ['/j_security_check', 'POST', form]]);
  // a GET of the path is no sign-in (the site's page or its 404)
  const g = await get('https://b2b.example/de/en/j_security_check');
  assert.notEqual(g.headers.get('x-lh-edge-route'), 'b2b-login');
});

test('b2b: a member page: the gate first (path and query, the visitor\'s cookie); 204: the page, private, no-store, the gate\'s cookie', async () => {
  gateAnswer = () => new Response(null, { status: 204, headers: { 'set-cookie': 'b2bsession=renewed; Path=/; HttpOnly; Secure' } });
  const resp = await get('https://b2b.example/de/en/home?tab=1', { headers: { cookie: 'b2bsession=abc; other=1' } });
  assert.equal(resp.status, 200);
  assert.match(await resp.text(), /<h1>Home<\/h1>/);
  assert.equal(resp.headers.get('cache-control'), 'private, no-store');
  assert.match(resp.headers.get('set-cookie'), /b2bsession=renewed/);
  assert.equal(resp.headers.get('x-lh-edge-route'), 'b2b-member');
  assert.equal(backendCalls.length, 1);
  assert.equal(backendCalls[0].method, 'GET');
  assert.equal(backendCalls[0].url, 'https://b2b.example/_lh-backends/b2b/gate?path=%2Fde%2Fen%2Fhome%3Ftab%3D1');
  assert.equal(backendCalls[0].cookie, 'b2bsession=abc; other=1');
  // the gate before the origin: its question is the first call
  const head = await get('https://b2b.example/de/en/experts-members', { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(head.headers.get('cache-control'), 'private, no-store');
});

test('b2b: the gate\'s other answers as they are (302 to the sign-in), the page not asked for', async () => {
  gateAnswer = () => new Response(null, { status: 302, headers: { location: '/de/en/login?redirect=%2Fde%2Fen%2Ffund', 'cache-control': 'no-store' } });
  const resp = await get('https://b2b.example/de/en/fund');
  assert.equal(resp.status, 302);
  assert.equal(resp.headers.get('location'), '/de/en/login?redirect=%2Fde%2Fen%2Ffund');
  assert.ok(!originCalls.some((c) => c.endsWith('/de/en/fund')), 'no page fetched');
  gateAnswer = () => new Response(null, { status: 302, headers: { location: '/service/secured/api/experts/login?country=de&language=en' } });
  const ex = await get('https://b2b.example/de/en/experts-members');
  assert.equal(ex.headers.get('location'), '/service/secured/api/experts/login?country=de&language=en');
  gateAnswer = () => new Response('{"error":"gate-down"}', { status: 503, headers: { 'content-type': 'application/json' } });
  assert.equal((await get('https://b2b.example/de/en/common/support')).status, 503);
  // the gate's redirect is the visitor's to follow, never lh-edge's (a followed 302 asked
  // lh-backends for /de/en/login: its 404 on b2b.turnsthe.page, 2026-11-07)
  assert.ok(backendCalls.length === 3 && backendCalls.every((c) => c.redirect === 'manual'), JSON.stringify(backendCalls.map((c) => c.redirect)));
});

test('b2b: other paths as before (no gate), public pages keep their caching', async () => {
  const login = await get('https://b2b.example/de/en/login');
  assert.equal(login.status, 200);
  const home = await get('https://b2b.example/de/en/homepage');
  assert.equal(home.status, 200);
  assert.notEqual(home.headers.get('cache-control'), 'private, no-store');
  assert.equal(backendCalls.length, 0);
});

test('another brand\'s host: no gate, no j_security_check route', async () => {
  const resp = await get('https://brussels.example/be/en/home');
  assert.notEqual(resp.headers.get('x-lh-edge-route'), 'b2b-member');
  const post = await get('https://brussels.example/j_security_check', { method: 'POST', body: 'x=1' });
  assert.notEqual(post.headers.get('x-lh-edge-route'), 'b2b-login');
  assert.ok(!backendCalls.some((c) => c.path === '/_lh-backends/b2b/gate' || c.path === '/j_security_check'));
});
