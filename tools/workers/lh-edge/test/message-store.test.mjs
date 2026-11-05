/* eslint-disable max-len */
/* One Message Center store for the group's airlines (src/message-store.js): on the hosts of the
   sites that show Message Center tenants (SWISS, Austrian and its China alias, Brussels, ITA,
   Discover, B2B), the Message Center read paths (the index, the CTI sheet, the message documents
   and their details pages) come from the store's origin (var MESSAGE_STORE_ORIGIN), fetched past
   the edge cache, the visitor's revalidation kept; every other path, and every path of the sites
   with a source of their own (TAP, Air Dolomiti, Cargo), as before. Without the var (or with a
   value that isn't an Edge Delivery origin) each site reads its own, as before. */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { isStorePath, storeOrigin } from '../src/message-store.js';

globalThis.HTMLRewriter = HTMLRewriter;

const STORE = 'main--lh-com--moved-permanently.aem.live';
const origin = (site) => `main--lh-${site}--moved-permanently.aem.live`;
const SITES = ['swiss', 'austrian', 'brussels', 'ita', 'discover', 'b2b', 'tap', 'airdolomiti', 'cargo'];
// the vars as wrangler.toml has them
const env = (extra = {}) => ({
  ORIGIN: STORE,
  WWW_HOST: 'www.lufthansa.com',
  EDGE_TTL: '60',
  EDGE_CACHE_VERSION: '2026-11-05a',
  FRONT_DOOR_HOSTS: 'lufthansa.turnsthe.page',
  ALIAS_HOSTS: 'austrian-cn.turnsthe.page',
  SITE_HOSTS: `${SITES.map((s) => `${s}.turnsthe.page=${s}`).join('; ')}; austrian-cn.turnsthe.page=austrian`,
  SITE_ORIGINS: SITES.map((s) => `${s}=${origin(s)}`).join('; '),
  SITE_WWW_HOSTS: 'swiss=www.swiss.com; austrian=www.austrian.com',
  MESSAGE_STORE_ORIGIN: STORE,
  ...extra,
});
let calls;
beforeEach(() => {
  calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input, init);
    const u = new URL(req.url);
    calls.push({
      host: u.hostname, path: u.pathname, search: u.search, cache: init.cache, cf: init.cf, headers: Object.fromEntries(req.headers),
    });
    if (req.headers.get('if-none-match') === '"same"') return new Response(null, { status: 304, headers: { etag: '"same"' } });
    if (u.pathname.endsWith('.json')) {
      return Response.json({ ':type': 'sheet', total: 1, data: [{ path: `${u.hostname}${u.pathname}` }] }, { headers: { 'cache-control': 'max-age=7200' } });
    }
    return new Response(`<main>${u.hostname}${u.pathname}</main>`, { headers: { 'content-type': 'text/html', 'cache-control': 'max-age=7200' } });
  };
});
const get = (url, e = env(), init = {}) => worker.fetch(new Request(url, { redirect: 'manual', ...init }), e, { waitUntil() {} });

const READ_PATHS = [
  '/message-center/index.json',
  '/message-center/config/cti-pages.json',
  '/message-center/details/information-on-flights-to-dubai/en.plain.html',
  '/message-center/details/information-on-flights-to-dubai/de',
  '/message-center/irreg/information-on-flights-to-dubai/en',
  '/message-center/tech-outage/some-outage/de',
  '/message-center/promo/kr-flash-teaser/ko',
];

test('isStorePath: the index, the CTI sheet, the three message types and the details pages; nothing else', () => {
  READ_PATHS.forEach((p) => assert.equal(isStorePath(p), true, p));
  [
    '/message-center/notifications.json', '/message-center/notification/x/en', '/message-center/config/other.json',
    '/message-center/', '/message-center/irreg', '/message-center/index.html', '/de/en/message-center/index.json',
    '/message-center/details/', '/graphql/execute.json/Message-Center/lhgMessageListWithCalendar',
  ].forEach((p) => assert.equal(isStorePath(p), false, p));
});

test('storeOrigin: an Edge Delivery origin host, else off', () => {
  assert.equal(storeOrigin(env()), STORE);
  assert.equal(storeOrigin(env({ MESSAGE_STORE_ORIGIN: ' main--lh-messages--moved-permanently.aem.live ' })), 'main--lh-messages--moved-permanently.aem.live');
  ['', '   ', 'https://main--lh-com--moved-permanently.aem.live', 'lufthansa.turnsthe.page', 'evil.example.com', 'main--lh-com--moved-permanently.aem.live/x'].forEach((v) => {
    assert.equal(storeOrigin(env({ MESSAGE_STORE_ORIGIN: v })), '', JSON.stringify(v));
  });
  assert.equal(storeOrigin({}), '');
});

test('the Message Center sites read every Message Center path from the store, past the edge cache', async () => {
  const hosts = ['swiss', 'austrian', 'austrian-cn', 'brussels', 'ita', 'discover', 'b2b'];
  for (const h of hosts) { // eslint-disable-line no-restricted-syntax
    for (const p of READ_PATHS) { // eslint-disable-line no-restricted-syntax
      calls = [];
      const resp = await get(`https://${h}.turnsthe.page${p}`); // eslint-disable-line no-await-in-loop
      assert.equal(resp.status, 200, `${h} ${p}`);
      assert.equal(resp.headers.get('x-lh-edge-route'), 'message-store', `${h} ${p}`);
      assert.equal(calls.length, 1, `${h} ${p}`);
      assert.equal(calls[0].host, STORE, `${h} ${p}`);
      assert.equal(calls[0].path, p, `${h} ${p}`);
      assert.equal(calls[0].cache, 'no-store', `${h} ${p}: a publish or a withdrawal shows at once`);
      assert.equal(calls[0].cf, undefined, `${h} ${p}`);
      assert.equal(calls[0].search, '', `${h} ${p}: no cache version on an uncached read`);
      // the site's public host (its alias asks for the site's own host, as for its pages)
      assert.equal(calls[0].headers['x-forwarded-host'], h === 'austrian-cn' ? 'austrian.turnsthe.page' : `${h}.turnsthe.page`, `${h} ${p}`);
      // the body is the store's, the browser told what the edge tells it (EDGE_TTL)
      const body = await resp.text(); // eslint-disable-line no-await-in-loop
      assert.match(body, new RegExp(STORE.replace(/\./g, '\\.')), `${h} ${p}`);
      // (an alias host's HTML gets its own Cache-Control, src/alias.js; the blocks revalidate)
      if (h !== 'austrian-cn') assert.match(resp.headers.get('cache-control') || '', /max-age=60/, `${h} ${p}`);
    }
  }
});

test('the store keeps the sheet parameters and drops the rest; HEAD reads the store too', async () => {
  await get('https://swiss.turnsthe.page/message-center/index.json?limit=500&offset=0&cb=123');
  assert.equal(calls[0].host, STORE);
  assert.equal(calls[0].search, '?limit=500&offset=0');
  calls = [];
  const head = await get('https://ita.turnsthe.page/message-center/config/cti-pages.json', env(), { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(calls[0].host, STORE);
});

test('a revalidation reaches the store as it is: its 304 comes back', async () => {
  const resp = await get('https://austrian.turnsthe.page/message-center/index.json', env(), { headers: { 'if-none-match': '"same"' } });
  assert.equal(resp.status, 304);
  assert.equal(calls[0].host, STORE);
  assert.equal(calls[0].headers['if-none-match'], '"same"');
});

test('other paths of a Message Center site, and other methods, as before (the site\'s origin)', async () => {
  for (const p of ['/message-center/notifications.json', '/message-center/config/flags.json', '/ch/en/homepage']) { // eslint-disable-line no-restricted-syntax
    calls = [];
    await get(`https://swiss.turnsthe.page${p}`); // eslint-disable-line no-await-in-loop
    assert.ok(calls.length >= 1, p);
    assert.ok(calls.every((c) => c.host !== STORE), `${p}: ${calls.map((c) => c.host)}`);
  }
  calls = [];
  const post = await get('https://swiss.turnsthe.page/message-center/index.json', env(), { method: 'POST', body: '{}' });
  assert.notEqual(post.headers.get('x-lh-edge-route'), 'message-store');
  assert.ok(calls.every((c) => c.host !== STORE));
});

test('the sites with a source of their own (TAP, Air Dolomiti, Cargo) keep their own Message Center', async () => {
  for (const s of ['tap', 'airdolomiti', 'cargo']) { // eslint-disable-line no-restricted-syntax
    for (const p of READ_PATHS) { // eslint-disable-line no-restricted-syntax
      calls = [];
      const resp = await get(`https://${s}.turnsthe.page${p}`); // eslint-disable-line no-await-in-loop
      assert.notEqual(resp.headers.get('x-lh-edge-route'), 'message-store', `${s} ${p}`);
      assert.deepEqual(calls.map((c) => c.host), [origin(s)], `${s} ${p}`);
    }
  }
});

test('without the var (or with a value that is not an Edge Delivery origin) each site reads its own, as before', async () => {
  for (const v of ['', 'lufthansa.turnsthe.page']) { // eslint-disable-line no-restricted-syntax
    for (const s of ['swiss', 'ita']) { // eslint-disable-line no-restricted-syntax
      calls = [];
      const resp = await get(`https://${s}.turnsthe.page/message-center/index.json`, env({ MESSAGE_STORE_ORIGIN: v })); // eslint-disable-line no-await-in-loop
      assert.notEqual(resp.headers.get('x-lh-edge-route'), 'message-store');
      assert.deepEqual(calls.map((c) => c.host), [origin(s)], `${s} ${JSON.stringify(v)}`);
    }
  }
});

test('lh-com\'s own hosts are the store already: unchanged (the origin, as before)', async () => {
  await get('https://lufthansa.turnsthe.page/message-center/index.json');
  assert.deepEqual(calls.map((c) => c.host), [STORE]);
  assert.ok(calls[0].cf, 'the edge cache as before');
});
