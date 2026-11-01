/* eslint-disable max-len, no-await-in-loop, no-restricted-syntax -- sequential requests per case */
/* OF1's generative search API on the main host (src/of1.js): exactly POST (and OPTIONS)
   /api/generate, /api/suggest, /api/personalize on lufthansa.turnsthe.page go to OF1's edge proxy
   with the same path and no query, only Content-Type, the body and the of1_* cookies (not
   of1_model_overrides); the answer's status and body pass through as a stream, content-type kept,
   cache-control no-store, no access-control-* and no set-cookie. Other methods 405; other hosts
   (lufthansa-edge, the China host, the brand hosts, aem.page) and other /api/ paths as before.
   The shapes are OF1's public client's and tracker's. */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import { frontDoorTarget } from '../src/front-door.js';
import { of1Cookies } from '../src/of1.js';
import { resetRouterCache } from '../src/router.js';
import { resetMarketCache } from '../src/markets.js';

// the brand host's pages go through the runtime's HTMLRewriter (src/brand-icons.js)
globalThis.HTMLRewriter = HTMLRewriter;
const ORIGIN = 'main--lh-com--moved-permanently.aem.live';
const OF1 = 'https://main--lh-com--moved-permanently.of1.live';
const DOOR = 'lufthansa.turnsthe.page';
const env = () => ({
  ORIGIN,
  WWW_HOST: 'www.lufthansa.com',
  EDGE_TTL: '60',
  PILOT_HOSTS: 'lufthansa-edge.turnsthe.page',
  PILOT_COUNTRIES_BY_HOST: `${DOOR}=ch`,
  FRONT_DOOR_HOSTS: DOOR,
  ALIAS_HOSTS: 'lufthansa-cn.turnsthe.page',
  ALIAS_HOME_ROOT: 'cn/en',
  SITE_HOSTS: 'ita.turnsthe.page=ita',
  SITE_ORIGINS: 'ita=main--lh-ita--moved-permanently.aem.live',
  SITE_WWW_HOSTS: 'ita=www.ita-airways.com',
  OF1_ORIGIN: OF1,
  BACKENDS: { fetch: async () => new Response('backends', { status: 404 }) },
  MESSAGES: { fetch: async () => Response.json({ data: {} }) },
});

const SUGGEST = {
  id: 'moved-permanently/lh-com', index: 'publish', query: '', context: {},
};
const SUGGESTIONS = { suggestions: [{ type: 'explore', label: 'Show me popular options', query: 'What are the most popular products?' }] };
const PERSONALIZE = {
  id: 'moved-permanently/lh-com',
  index: 'publish',
  elements: { T0: { tag: 'h1', text: 'Find your winter adventure' }, T1: { tag: 'p', text: 'Ski flights to the Alps' } },
  behaviorProfile: { interests: [{ topic: 'ski', score: 0.8 }], intent: 'exploring', intentScores: [{ category: 'leisure', score: 0.7 }] },
};
const LINES = [
  {
    type: 'mutation', id: 'T0', new: 'Your ski winter starts here', reason: 'interest ski',
  },
  { type: 'inject_cta', html: '<a href="/de/en/flights">Find ski flights</a>' },
  { type: 'done', stats: { mutationCount: 1, hasCta: true } },
];

let calls;
let upstream;
beforeEach(() => {
  resetRouterCache();
  resetMarketCache();
  calls = [];
  upstream = () => Response.json(SUGGESTIONS, {
    headers: {
      'access-control-allow-origin': 'https://main--lh-com--moved-permanently.of1.live', 'access-control-allow-credentials': 'true', 'set-cookie': 'of1_session=abc; Path=/', 'cache-control': 'public, max-age=600', vary: 'Origin', nel: '{}', 'retry-after': '7',
    },
  });
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? new Request(input, init) : new Request(input, init);
    const body = ['GET', 'HEAD'].includes(req.method) ? null : await req.text();
    calls.push({
      url: req.url, method: req.method, headers: Object.fromEntries(req.headers), body,
    });
    if (req.url.startsWith(OF1)) return upstream(req);
    return new Response(`<html>eds ${new URL(req.url).pathname}</html>`, { status: 404, headers: { 'content-type': 'text/html; charset=utf-8' } });
  };
});
const ask = (path, {
  host = DOOR, method = 'POST', headers = {}, body,
} = {}) => worker.fetch(new Request(`https://${host}${path}`, {
  method, headers, body: body === undefined ? undefined : JSON.stringify(body),
}), env(), { waitUntil: () => {} });
const of1Calls = () => calls.filter((c) => c.url.startsWith(OF1));

test('the front door: the three paths are lh-edge\'s; nothing else under /api/ changes', () => {
  ['/api/generate', '/api/suggest', '/api/personalize', '/api/content/graphql/execute.json/a/b'].forEach((p) => assert.equal(frontDoorTarget(p), 'edge', p));
  ['/api/generate/', '/api/generates', '/api/suggest/x', '/api/personalize.json', '/api/other', '/api', '/api/', '/de/en/api/suggest'].forEach((p) => assert.equal(frontDoorTarget(p), 'origin', p));
});

test('suggest on the main host: OF1\'s answer, the same path without the query', async () => {
  const resp = await ask('/api/suggest?model=gpt-x&debug=1', { headers: { 'content-type': 'application/json' }, body: SUGGEST });
  assert.equal(resp.status, 200);
  assert.deepEqual(await resp.json(), SUGGESTIONS);
  const [call] = of1Calls();
  assert.equal(call.url, `${OF1}/api/suggest`);
  assert.equal(call.method, 'POST');
  assert.deepEqual(JSON.parse(call.body), SUGGEST);
});

test('the request: only Content-Type, the body and the of1_* cookies (not of1_model_overrides)', async () => {
  await ask('/api/generate', {
    headers: {
      'content-type': 'application/json',
      origin: `https://${DOOR}`,
      referer: `https://${DOOR}/of1`,
      authorization: 'Bearer visitor',
      'user-agent': 'Mozilla/5.0',
      'x-lh-public-host': 'evil.example',
      cookie: 'AMCV_ABC%40AdobeOrg=1; kndctr_ABC_AdobeOrg_identity=2; OptanonConsent=groups; OptanonAlertBoxClosed=2026; lh-geo=DE; lh_session=x; of1_visitor=v1; of1_model_overrides=gpt-x; of1_session=s1; xof1_x=1',
    },
    body: { id: 'moved-permanently/lh-com', index: 'publish', query: 'ski flights' },
  });
  const [call] = of1Calls();
  assert.deepEqual(call.headers, { 'content-type': 'application/json', cookie: 'of1_visitor=v1; of1_session=s1' });
  assert.deepEqual(JSON.parse(call.body), { id: 'moved-permanently/lh-com', index: 'publish', query: 'ski flights' });
});

test('no OF1 cookie: no Cookie header', async () => {
  await ask('/api/suggest', { headers: { 'content-type': 'application/json', cookie: 'OptanonConsent=x; lh-geo=DE' }, body: SUGGEST });
  assert.deepEqual(of1Calls()[0].headers, { 'content-type': 'application/json' });
  assert.equal(of1Cookies('of1_a=1;of1_model_overrides=2; b=3;  of1_c=4'), 'of1_a=1; of1_c=4');
  assert.equal(of1Cookies(''), '');
});

test('the response: content-type and the rate limit kept, no-store, no access-control-*, no set-cookie', async () => {
  const resp = await ask('/api/suggest', { headers: { 'content-type': 'application/json' }, body: SUGGEST });
  assert.equal(resp.headers.get('content-type'), 'application/json');
  assert.equal(resp.headers.get('cache-control'), 'no-store');
  assert.equal(resp.headers.get('retry-after'), '7');
  assert.equal(resp.headers.get('set-cookie'), null);
  assert.deepEqual([...resp.headers.keys()].filter((k) => k.startsWith('access-control-')), []);
  assert.equal(resp.headers.get('vary'), null);
  assert.equal(resp.headers.get('nel'), null);
  assert.equal(resp.headers.get('x-lh-edge-route'), 'of1');
});

test('statuses pass through: 429 and 500 with their bodies', async () => {
  upstream = () => new Response('{"error":"rate limited"}', { status: 429, headers: { 'content-type': 'application/json', 'retry-after': '30' } });
  const r429 = await ask('/api/generate', { headers: { 'content-type': 'application/json' }, body: { query: 'x' } });
  assert.equal(r429.status, 429);
  assert.equal(r429.headers.get('retry-after'), '30');
  assert.equal(await r429.text(), '{"error":"rate limited"}');
  upstream = () => new Response('boom', { status: 500, headers: { 'content-type': 'text/plain' } });
  const r500 = await ask('/api/suggest', { headers: { 'content-type': 'application/json' }, body: SUGGEST });
  assert.equal(r500.status, 500);
  assert.equal(await r500.text(), 'boom');
});

test('personalize streams: each NDJSON line reaches the browser as it comes, not at the end', async () => {
  const encoder = new TextEncoder();
  let release;
  const gate = new Promise((r) => { release = r; });
  upstream = () => new Response(new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(`${JSON.stringify(LINES[0])}\n`));
      await gate;
      controller.enqueue(encoder.encode(`${JSON.stringify(LINES[1])}\n${JSON.stringify(LINES[2])}\n`));
      controller.close();
    },
  }), { headers: { 'content-type': 'application/x-ndjson' } });
  const resp = await ask('/api/personalize', { headers: { 'content-type': 'application/json' }, body: PERSONALIZE });
  assert.equal(resp.headers.get('content-type'), 'application/x-ndjson');
  assert.equal(resp.headers.get('cache-control'), 'no-store');
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  // the first line, while the upstream still holds the rest
  const first = await Promise.race([reader.read(), new Promise((r) => { setTimeout(() => r('timeout'), 1000); })]);
  assert.notEqual(first, 'timeout', 'the first line arrived before the stream ended');
  assert.deepEqual(JSON.parse(decoder.decode(first.value).trim()), LINES[0]);
  release();
  let rest = '';
  for (let r = await reader.read(); !r.done; r = await reader.read()) rest += decoder.decode(r.value);
  assert.deepEqual(rest.trim().split('\n').map((l) => JSON.parse(l)), LINES.slice(1));
  assert.deepEqual(JSON.parse(of1Calls()[0].body), PERSONALIZE);
});

test('OPTIONS goes to OF1 too; GET, HEAD, PUT, DELETE are 405 and reach nobody', async () => {
  upstream = () => new Response(null, { status: 204, headers: { 'access-control-allow-methods': 'POST' } });
  const opt = await ask('/api/suggest', { method: 'OPTIONS', headers: { origin: `https://${DOOR}`, 'access-control-request-method': 'POST' } });
  assert.equal(opt.status, 204);
  assert.equal(opt.headers.get('access-control-allow-methods'), null);
  assert.deepEqual(of1Calls().map((c) => [c.method, c.url, c.headers]), [['OPTIONS', `${OF1}/api/suggest`, {}]]);
  for (const method of ['GET', 'HEAD', 'PUT', 'DELETE']) {
    calls = [];

    const resp = await ask('/api/suggest', { method, body: method === 'PUT' ? SUGGEST : undefined });
    assert.equal(resp.status, 405, method);
    assert.equal(resp.headers.get('allow'), 'POST, OPTIONS');
    assert.equal(resp.headers.get('cache-control'), 'no-store');
    assert.deepEqual(calls, [], method);
  }
});

test('other hosts: no route (the origin\'s 404, OF1 never asked)', async () => {
  for (const host of ['lufthansa-edge.turnsthe.page', 'lufthansa-cn.turnsthe.page', 'ita.turnsthe.page', 'main--lh-com--moved-permanently.aem.page', 'main--lh-com--moved-permanently.aem.live']) {
    calls = [];

    const resp = await ask('/api/suggest', { host, headers: { 'content-type': 'application/json', 'x-lh-public-host': DOOR }, body: SUGGEST });
    assert.equal(resp.status, 404, host);
    assert.deepEqual(of1Calls(), [], host);
  }
});

test('other /api/ paths on the main host: as before (not OF1)', async () => {
  for (const p of ['/api/suggest/x', '/api/generates', '/api/other']) {
    calls = [];

    const resp = await ask(p, { headers: { 'content-type': 'application/json' }, body: SUGGEST });
    assert.equal(resp.status, 404, p);
    assert.deepEqual(of1Calls(), [], p);
  }
});

test('without OF1_ORIGIN: the three paths as before (the origin)', async () => {
  const resp = await worker.fetch(new Request(`https://${DOOR}/api/suggest`, { method: 'POST', body: '{}' }), { ...env(), OF1_ORIGIN: '' }, { waitUntil: () => {} });
  assert.equal(resp.status, 404);
  assert.deepEqual(of1Calls(), []);
});
