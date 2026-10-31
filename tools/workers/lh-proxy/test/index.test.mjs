import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';

const ORIGIN = 'https://main--lh-com--moved-permanently.aem.page';
const BASE = 'https://lh-proxy.example.com';
const ENV = { UPSTREAM_ORIGIN: 'https://upstream.test' };

const realFetch = globalThis.fetch;
let calls;

function stubFetch(handler) {
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    return handler(url, init);
  };
}

function jsonResponse(data, init = {}) {
  return new Response(JSON.stringify(data), {
    status: 200,
    ...init,
    headers: { 'content-type': 'application/json', ...(init.headers || {}) },
  });
}

function req(path, init = {}) {
  return new Request(`${BASE}${path}`, init);
}

beforeEach(() => {
  calls = [];
  stubFetch(() => jsonResponse({ ok: 1 }));
});

afterEach(() => {
  globalThis.fetch = realFetch;
  delete globalThis.caches;
});

test('health returns upstream', async () => {
  const res = await worker.fetch(req('/health'), ENV);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true, upstream: 'https://upstream.test' });
  assert.equal(calls.length, 0);
});

test('allowlisted GET is forwarded with query and sanitized headers', async () => {
  const res = await worker.fetch(req('/service/api/suggestions/airports?searchTerm=fra&limit=10', {
    headers: {
      Origin: ORIGIN,
      Accept: 'application/json',
      Cookie: 'session=secret',
      Authorization: 'Bearer x',
      'X-Forwarded-For': '1.2.3.4',
      'User-Agent': 'test',
    },
  }), ENV);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: 1 });
  assert.equal(calls.length, 1);
  const { url, init } = calls[0];
  assert.equal(url, 'https://upstream.test/service/api/suggestions/airports?searchTerm=fra&limit=10');
  assert.equal(init.method, 'GET');
  const h = init.headers;
  assert.equal(h.get('accept'), 'application/json');
  assert.equal(h.get('accept-language'), 'en-US,en;q=0.9');
  assert.equal(h.get('origin'), 'https://upstream.test');
  assert.equal(h.get('referer'), 'https://upstream.test/');
  assert.equal(h.get('cookie'), null);
  assert.equal(h.get('authorization'), null);
  assert.equal(h.get('x-forwarded-for'), null);
  assert.equal(h.get('user-agent'), null);
  assert.equal(res.headers.get('access-control-allow-origin'), ORIGIN);
  assert.equal(res.headers.get('vary'), 'Origin');
  assert.equal(res.headers.get('x-lh-proxy'), '1');
  assert.equal(res.headers.get('x-lh-proxy-upstream-status'), '200');
});

test('labels route derives Accept-Language from path lang', async () => {
  const res = await worker.fetch(req('/service/api/labels/flight-search/lh/de'), ENV);
  assert.equal(res.status, 200);
  assert.equal(calls[0].init.headers.get('accept-language'), 'de-DE,de;q=0.9,en;q=0.8');
});

test('other allowlisted routes match', async () => {
  const paths = [
    '/service/api/catalogs/airlines',
    '/service/api/catalogs/localeData/de_DE',
    '/service/api/defaultAirport',
    '/service/api/lhg-fare-teaser/fareteaser/recommend?x=1',
    '/service/api/destinationfinder/campaign/FRA',
    '/service/api/destinationfinder/destination/finder/FRA/europe',
    '/aircore/weather/FRA',
    '/aircore/geolocation/v1/lookup',
  ];
  const results = await Promise.all(paths.map((p) => worker.fetch(req(p), ENV)));
  assert.deepEqual(results.map((r) => r.status), paths.map(() => 200));
});

test('disallowed paths and methods return 404 not-allowed', async () => {
  const cases = [
    req('/service/api/secret'),
    req('/de/de/homepage'),
    req('/service/api/catalogs/unknown'),
    req('/service/api/labels/x/lh/DE'),
    req('/service/api/catalogs/airlines/..%2F..%2Fadmin'),
    req('/service/api/lhg-fare-teaser/fareteaser/offers/FRA'), // GET, route is POST-only
    req('/service/api/suggestions/airports', { method: 'POST', body: '{}' }),
    req('/service/api/lhg-fare-teaser/fareteaser/offers/fra', { method: 'POST', body: '{}' }),
  ];
  const results = await Promise.all(cases.map((r) => worker.fetch(r, ENV)));
  await Promise.all(results.map(async (res) => {
    assert.equal(res.status, 404);
    assert.deepEqual(await res.json(), { error: 'not-allowed' });
  }));
  assert.equal(calls.length, 0);
});

test('disallowed origin returns 403', async () => {
  const res = await worker.fetch(req('/service/api/defaultAirport', {
    headers: { Origin: 'https://evil.example.com' },
  }), ENV);
  assert.equal(res.status, 403);
  assert.deepEqual(await res.json(), { error: 'origin-not-allowed' });
  assert.equal(res.headers.get('access-control-allow-origin'), null);
  assert.equal(calls.length, 0);
});

test('extra allowed origins and .aem.live are accepted', async () => {
  const a = await worker.fetch(req('/health', { headers: { Origin: 'http://localhost:3000' } }), ENV);
  assert.equal(a.status, 200);
  assert.equal(a.headers.get('access-control-allow-origin'), 'http://localhost:3000');
  const b = await worker.fetch(req('/health', {
    headers: { Origin: 'https://feat-x--lh-com--moved-permanently.aem.live' },
  }), ENV);
  assert.equal(b.status, 200);
  const c = await worker.fetch(req('/health', {
    headers: { Origin: 'https://main--other--moved-permanently.aem.live' },
  }), ENV);
  assert.equal(c.status, 403);
});

test('linked lh-flynet site hosts are accepted', async () => {
  const origins = [
    'https://main--lh-flynet--moved-permanently.aem.page',
    'https://main--lh-flynet--moved-permanently.aem.live',
  ];
  const responses = await Promise.all(origins.map(
    (origin) => worker.fetch(req('/health', { headers: { Origin: origin } }), ENV),
  ));
  responses.forEach((res, i) => {
    assert.equal(res.status, 200, origins[i]);
    assert.equal(res.headers.get('access-control-allow-origin'), origins[i]);
  });
  const other = await worker.fetch(req('/health', {
    headers: { Origin: 'https://main--lh-flynetx--moved-permanently.aem.page' },
  }), ENV);
  assert.equal(other.status, 403);
});

test('preflight returns 204 with CORS headers', async () => {
  const res = await worker.fetch(req('/service/api/lhg-fare-teaser/fareteaser/offers/FRA', {
    method: 'OPTIONS',
    headers: {
      Origin: ORIGIN,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type',
    },
  }), ENV);
  assert.equal(res.status, 204);
  assert.equal(res.headers.get('access-control-allow-origin'), ORIGIN);
  assert.equal(res.headers.get('access-control-allow-methods'), 'GET,POST,OPTIONS');
  assert.equal(res.headers.get('access-control-allow-headers'), 'Content-Type, Accept, Accept-Language, X-LH-Market');
  assert.equal(res.headers.get('access-control-max-age'), '86400');
  assert.equal(res.headers.get('vary'), 'Origin');
  assert.equal(calls.length, 0);

  const bad = await worker.fetch(req('/nope', {
    method: 'OPTIONS',
    headers: { Origin: ORIGIN, 'Access-Control-Request-Method': 'GET' },
  }), ENV);
  assert.equal(bad.status, 404);
});

test('POST is forwarded with body', async () => {
  const payload = JSON.stringify({ origin: 'FRA', destinations: ['JFK'] });
  const res = await worker.fetch(req('/service/api/lhg-fare-teaser/fareteaser/offers/FRA?market=DE', {
    method: 'POST',
    headers: { Origin: ORIGIN, 'Content-Type': 'application/json', Cookie: 'a=b' },
    body: payload,
  }), ENV);
  assert.equal(res.status, 200);
  const { url, init } = calls[0];
  assert.equal(url, 'https://upstream.test/service/api/lhg-fare-teaser/fareteaser/offers/FRA?market=DE');
  assert.equal(init.method, 'POST');
  assert.equal(init.headers.get('content-type'), 'application/json');
  assert.equal(init.headers.get('cookie'), null);
  assert.equal(new TextDecoder().decode(init.body), payload);
});

test('oversize POST body returns 413', async () => {
  const res = await worker.fetch(req('/service/api/lhg-fare-teaser/fareteaser/manual', {
    method: 'POST',
    headers: { Origin: ORIGIN, 'Content-Type': 'application/json' },
    body: 'x'.repeat(64 * 1024 + 1),
  }), ENV);
  assert.equal(res.status, 413);
  assert.equal(res.headers.get('access-control-allow-origin'), ORIGIN);
  assert.equal(calls.length, 0);
});

test('body of exactly 64 KB is accepted', async () => {
  const res = await worker.fetch(req('/service/api/lhg-fare-teaser/fareteaser/manual', {
    method: 'POST',
    body: 'x'.repeat(64 * 1024),
  }), ENV);
  assert.equal(res.status, 200);
  assert.equal(calls[0].init.body.byteLength, 64 * 1024);
});

test('Cloudflare challenge responses become 502 upstream-blocked', async () => {
  const variants = [
    () => new Response('<html>Just a moment...</html>', { status: 403, headers: { 'content-type': 'text/html; charset=UTF-8' } }),
    () => new Response('<html>blocked</html>', { status: 503, headers: { 'content-type': 'text/html' } }),
    () => new Response('{}', { status: 200, headers: { 'content-type': 'application/json', 'cf-mitigated': 'challenge' } }),
  ];
  const expected = [403, 503, 200];
  await variants.reduce(async (prev, make, i) => {
    await prev;
    stubFetch(make);
    const res = await worker.fetch(req('/service/api/defaultAirport', { headers: { Origin: ORIGIN } }), ENV);
    assert.equal(res.status, 502);
    assert.deepEqual(await res.json(), { error: 'upstream-blocked', status: expected[i] });
    assert.equal(res.headers.get('access-control-allow-origin'), ORIGIN);
    assert.equal(res.headers.get('x-lh-proxy-upstream-status'), String(expected[i]));
  }, Promise.resolve());
});

test('non-challenge upstream errors pass through with body', async () => {
  stubFetch(() => jsonResponse({ error: 'nope' }, { status: 404 }));
  const res = await worker.fetch(req('/service/api/defaultAirport'), ENV);
  assert.equal(res.status, 404);
  assert.deepEqual(await res.json(), { error: 'nope' });
  assert.equal(res.headers.get('x-lh-proxy-upstream-status'), '404');
});

test('Set-Cookie and upstream CORS headers are stripped', async () => {
  stubFetch(() => jsonResponse({ ok: 1 }, {
    headers: {
      'set-cookie': 'track=1; Path=/',
      'access-control-allow-origin': '*',
    },
  }));
  const res = await worker.fetch(req('/service/api/defaultAirport', { headers: { Origin: ORIGIN } }), ENV);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('set-cookie'), null);
  assert.equal(res.headers.get('access-control-allow-origin'), ORIGIN);
});

test('upstream timeout returns 504', async () => {
  stubFetch((url, init) => new Promise((resolve, reject) => {
    init.signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
  }));
  const res = await worker.fetch(req('/service/api/defaultAirport'), { ...ENV, UPSTREAM_TIMEOUT_MS: '20' });
  assert.equal(res.status, 504);
  assert.deepEqual(await res.json(), { error: 'upstream-timeout' });
});

test('upstream network error returns 502 upstream-error', async () => {
  stubFetch(() => Promise.reject(new TypeError('fetch failed')));
  const res = await worker.fetch(req('/service/api/defaultAirport'), ENV);
  assert.equal(res.status, 502);
  assert.deepEqual(await res.json(), { error: 'upstream-error' });
});

test('successful GETs are cached and CORS is applied per request', async () => {
  const store = new Map();
  globalThis.caches = {
    default: {
      match: async (key) => {
        const hit = store.get(key.url);
        return hit ? hit.clone() : undefined;
      },
      put: async (key, res) => { store.set(key.url, res); },
    },
  };
  const pending = [];
  const ctx = { waitUntil: (p) => pending.push(p) };
  const path = '/service/api/catalogs/airlines?lang=de';

  const first = await worker.fetch(req(path, { headers: { Origin: ORIGIN } }), ENV, ctx);
  assert.equal(first.headers.get('x-lh-proxy-cache'), 'MISS');
  assert.deepEqual(await first.json(), { ok: 1 });
  await Promise.all(pending);
  assert.ok(store.has(`https://upstream.test${path}`));
  assert.equal(store.get(`https://upstream.test${path}`).headers.get('cache-control'), 'public, max-age=300');

  const second = await worker.fetch(req(path, { headers: { Origin: 'http://localhost:3000' } }), ENV, ctx);
  assert.equal(second.status, 200);
  assert.equal(second.headers.get('x-lh-proxy-cache'), 'HIT');
  assert.equal(second.headers.get('access-control-allow-origin'), 'http://localhost:3000');
  assert.deepEqual(await second.json(), { ok: 1 });
  assert.equal(calls.length, 1);
});

test('works without caches global', async () => {
  delete globalThis.caches;
  const res = await worker.fetch(req('/service/api/catalogs/regions'), ENV, {});
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('x-lh-proxy-cache'), null);
});

test('X-LH-Market sets the market homepage as Referer and keys the cache per market', async () => {
  const store = new Map();
  globalThis.caches = {
    default: {
      match: async (key) => store.get(key.url)?.clone(),
      put: async (key, res) => { store.set(key.url, res); },
    },
  };
  const pending = [];
  const ctx = { waitUntil: (p) => pending.push(p) };
  const path = '/service/api/defaultAirport';

  const at = await worker.fetch(req(path, { headers: { Origin: ORIGIN, 'X-LH-Market': 'at/de' } }), ENV, ctx);
  assert.equal(at.status, 200);
  assert.equal(calls[0].url, `https://upstream.test${path}`);
  assert.equal(calls[0].init.headers.get('referer'), 'https://upstream.test/at/de/homepage');
  await Promise.all(pending);
  assert.ok(store.has(`https://upstream.test${path}?__lh_market=at/de`));

  // another market is not served from the at/de cache entry
  await worker.fetch(req(path, { headers: { Origin: ORIGIN, 'X-LH-Market': 'gb/en' } }), ENV, ctx);
  assert.equal(calls.length, 2);
  assert.equal(calls[1].init.headers.get('referer'), 'https://upstream.test/gb/en/homepage');

  // an invalid market is ignored
  await worker.fetch(req(`${path}?x=1`, { headers: { Origin: ORIGIN, 'X-LH-Market': '../evil' } }), ENV, ctx);
  assert.equal(calls[2].init.headers.get('referer'), 'https://upstream.test/');
});

test('DA preview and Universal Editor hosts are accepted', async () => {
  // eslint-disable-next-line no-restricted-syntax
  for (const origin of [
    'https://main--lh-com--moved-permanently.preview.da.live',
    'https://main--lh-com--moved-permanently.stage-preview.da.live',
    'https://main--lh-com--moved-permanently.ue.da.live',
  ]) {
    // eslint-disable-next-line no-await-in-loop
    const res = await worker.fetch(req('/health', { headers: { Origin: origin } }), ENV);
    assert.equal(res.status, 200, origin);
    assert.equal(res.headers.get('access-control-allow-origin'), origin);
  }
  const bad = await worker.fetch(req('/health', { headers: { Origin: 'https://main--other--org.preview.da.live' } }), ENV);
  assert.equal(bad.status, 403);
});

// eslint-disable-next-line max-len
test('preflight from each turnsthe.page host that loads the site: 204 with its origin (wrangler.toml and the defaults)', async () => {
  const toml = (await import('node:fs')).readFileSync(new URL('../wrangler.toml', import.meta.url), 'utf8');
  const extra = toml.match(/^EXTRA_ALLOWED_ORIGINS = "([^"]*)"/m)[1];
  const hosts = ['lufthansa', 'lufthansa-edge', 'lufthansa-cn', 'discover', 'ita', 'cargo', 'airdolomiti', 'austrian'].map((h) => `https://${h}.turnsthe.page`);
  const envs = [{ ...ENV, EXTRA_ALLOWED_ORIGINS: extra }, ENV];
  for (const env of envs) { // eslint-disable-line no-restricted-syntax
    for (const origin of hosts) { // eslint-disable-line no-restricted-syntax
      const res = await worker.fetch(req('/service/api/lhg-fare-teaser/fareteaser/recommend', { // eslint-disable-line no-await-in-loop
        method: 'OPTIONS',
        headers: { Origin: origin, 'Access-Control-Request-Method': 'GET', 'Access-Control-Request-Headers': 'accept' },
      }), env);
      assert.equal(res.status, 204, origin);
      assert.equal(res.headers.get('access-control-allow-origin'), origin);
    }
    // the retired first hosts and other turnsthe.page names are refused
    const refused = ['https://lhcom.bbird.live', 'https://lufthansa-x.turnsthe.page', 'https://evil.turnsthe.page'];
    for (const origin of refused) { // eslint-disable-line no-restricted-syntax
      const res = await worker.fetch(req('/service/api/lhg-fare-teaser/fareteaser/recommend', { // eslint-disable-line no-await-in-loop
        method: 'OPTIONS', headers: { Origin: origin, 'Access-Control-Request-Method': 'GET' },
      }), env);
      assert.equal(res.status, 403, origin);
    }
  }
});
