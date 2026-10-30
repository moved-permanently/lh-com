/* eslint-disable no-underscore-dangle, max-len, no-console -- www field names; fixture rows */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import worker, {
  messageList, ctiPages, toItem, tagsOf, parseRow, diffState, pushPayload, runCron, queryName,
  activeMessages, plainText, resetSourceCache, outageB2b,
} from '../src/index.js';

const WWW = JSON.parse(fs.readFileSync(new URL('./fixtures/www-message-center-2026-10-25.json', import.meta.url), 'utf8'));
const wwwItems = (q) => WWW.queries[q].body.data.lhgMessageList.items;
const NOW = Date.parse('2026-10-25T09:00:00.000Z');
const ORIGIN = 'https://main--lh-com--moved-permanently.aem.page';
const SOURCE = 'https://main--lh-com--moved-permanently.aem.live';

/** Index rows that recreate a www item (as authors will recreate today's www messages in DA). */
function rowFromWww(item) {
  const [type, id] = item._path.split('/').slice(-2);
  const tags = (prefix) => item._tags.filter((t) => t.startsWith(`lufthansa-group:${prefix}/`)).map((t) => t.split('/')[1]);
  return {
    path: `/message-center/${type}/${id}/${item.language}`,
    headline: item.headline,
    criticality: item.criticality,
    tenants: tags('tenant'),
    markets: tags('markets'),
    touchpoints: tags('touchpoint'),
    link: item.link || '',
    details: '',
    from: '',
    to: '',
    push: 'false',
    'internal-title': item._metadata.stringMetadata.find((m) => m.name === 'title').value,
    lastModified: Date.parse(item._metadata.calendarMetadata.find((m) => m.name === 'cq:lastModified').value) / 1000,
  };
}

// the lh Dubai message of www (en + de) and a low irreg of another tenant
const DUBAI = wwwItems('lhgIrregMessageList').filter((i) => i._path.endsWith('/lh--information-on-flights-to-dubai'));
const OS = wwwItems('lhgIrregMessageList').filter((i) => i._path.endsWith('/os-getting-to-the-airport-aug2026'));
const PROMO = wwwItems('lhgMessageListWithCalendar').filter((i) => i._path.endsWith('/kr-flash-teaser'));

const TEST_ROWS = [
  {
    path: '/message-center/promo/test-3/de', headline: 'Test 3', criticality: 'low', tenants: ['lh'], markets: ['gb'], touchpoints: ['web'], link: '/gb/en/local-page/ski-campaign-2026', details: '', from: '', to: '', push: 'true', 'internal-title': 'Phase 0 test 3', lastModified: 1792913743,
  },
  {
    path: '/message-center/irreg/test-1/en', headline: 'Test 1', criticality: 'high', tenants: ['lh', 'lx'], markets: ['de', 'at'], touchpoints: ['web', 'android-app'], link: '', details: '/message-center/details/test-1/en', from: '', to: '2026-12-31T22:00:00.000Z', push: 'false', 'internal-title': 'Phase 0 test 1', lastModified: 1792913739,
  },
  {
    path: '/message-center/tech-outage/test-2/en', headline: 'Test 2', criticality: 'low', tenants: ['lh', 'b2b'], markets: [], touchpoints: ['web'], link: '', details: '/message-center/details/test-2/en', from: '2026-10-25T07:00:00.000Z', to: '', push: 'false', 'internal-title': 'Phase 0 test 2', lastModified: 1792913741,
  },
];

function memoryKv() {
  const map = new Map();
  const kv = {
    puts: 0,
    get: async (k, type) => {
      const v = map.get(k);
      if (v === undefined) return null;
      return type === 'json' ? JSON.parse(v) : v;
    },
    put: async (k, v) => { kv.puts += 1; map.set(k, v); },
    map,
  };
  return kv;
}

let sourceRows;
let detailsHtml;
let fetches;
let logs;

beforeEach(() => {
  resetSourceCache();
  sourceRows = TEST_ROWS;
  detailsHtml = { '/message-center/details/test-2/en.plain.html': '<div><p>Check-in is only possible in the app.</p><ul><li>Point &amp; one</li></ul></div>' };
  fetches = [];
  logs = [];
  globalThis.fetch = async (url, init = {}) => {
    fetches.push({ url: String(url), init });
    const u = new URL(String(url));
    if (u.origin !== SOURCE) return new Response('push ok', { status: 200 });
    if (u.pathname === '/message-center/index.json') return Response.json({ data: sourceRows, ':type': 'sheet' });
    if (u.pathname === '/message-center/config/cti-pages.json') {
      return Response.json({
        data: [
          { tenant: 'lh', webPath: '/{cc}/{ll}/prepare-for-your-trip/current-travel-information', contentPath: '/content/lh/gc/en/prepare-for-your-trip/current-travel-information' },
          { tenant: 'lx', webPath: '', contentPath: '/content/lx/gc/en/fly/flight-information/current-information' },
          { tenant: 'os', webPath: '', contentPath: '/content/aua/gc/en/fly/flight-information/flight-irregularities' },
          { tenant: 'sn', webPath: '', contentPath: '/content/bel/gc/en/plan-your-trip/flight-information' },
          { tenant: 'four_y', webPath: '', contentPath: '/content/four_y/gc/en/homepage/current-flight-information' },
          { tenant: 'ita', webPath: '', contentPath: '/content/ita/gc/en/book-and-prepare/current-information' },
        ],
      });
    }
    if (detailsHtml[u.pathname]) return new Response(detailsHtml[u.pathname], { status: 200 });
    return new Response('not found', { status: 404 });
  };
  console.log = (...a) => { logs.push(a.join(' ')); };
});

const env = (extra = {}) => ({
  SOURCE_ORIGIN: SOURCE,
  ALLOWED_ORIGIN_PATTERN: '^https://[a-z0-9-]+--lh-com--moved-permanently\\.aem\\.(page|live)$',
  EXTRA_ALLOWED_ORIGINS: 'https://lufthansa.turnsthe.page,http://localhost:3000',
  STATE: memoryKv(),
  ...extra,
});

/* ---------------------------------------------------------------------------------------------- */

test('items have www\'s keys in www\'s order, field by field', () => {
  const rows = [...DUBAI, ...OS].map(rowFromWww);
  const state = { activatedAt: Object.fromEntries([...DUBAI, ...OS].map((i) => [rowFromWww(i).path, i.activatedAt])) };
  const ours = messageList(rows, ['irreg'], NOW, state).data.lhgMessageList.items;
  const www = [...DUBAI, ...OS];
  assert.equal(ours.length, www.length);
  ours.forEach((item, i) => {
    const ref = www[i];
    assert.deepEqual(Object.keys(item), Object.keys(ref));
    assert.deepEqual(Object.keys(item._metadata), Object.keys(ref._metadata));
    assert.deepEqual(item._metadata.stringMetadata.map((m) => m.name), ref._metadata.stringMetadata.map((m) => m.name));
    assert.deepEqual(item._metadata.calendarMetadata.map((m) => m.name), ref._metadata.calendarMetadata.map((m) => m.name));
    assert.equal(item._path, ref._path);
    assert.equal(item.language, ref.language);
    // www keeps an authoring space (' Information on flights to Dubai'); the index trims
    assert.equal(item.headline, ref.headline.trim());
    assert.equal(item.criticality, ref.criticality);
    assert.equal(item.link, ref.link);
    assert.equal(item.activatedAt, ref.activatedAt);
    assert.deepEqual(item._metadata.stringMetadata, ref._metadata.stringMetadata);
    // the same tags (www's order of the tags is not stable from message to message)
    assert.deepEqual([...item._tags].sort(), [...ref._tags].sort());
    assert.equal(item._metadata.calendarMetadata[1].value, ref._metadata.calendarMetadata[1].value);
  });
});

test('_path and _tags', () => {
  const msg = parseRow(TEST_ROWS[1]);
  const item = toItem(msg, {});
  assert.equal(item._path, '/content/dam/lufthansa-group/message-center/irreg/test-1');
  assert.deepEqual(tagsOf(msg), [
    'lufthansa-group:tenant/lh', 'lufthansa-group:tenant/lx',
    'lufthansa-group:markets/de', 'lufthansa-group:markets/at',
    'lufthansa-group:touchpoint/web', 'lufthansa-group:touchpoint/android-app',
  ]);
  // markets [] = all markets: no markets tag, as on www
  assert.deepEqual(tagsOf(parseRow(TEST_ROWS[2])).filter((t) => t.includes('markets')), []);
  // empty link -> null; activatedAt from the state, else lastModified
  assert.equal(item.link, null);
  assert.equal(item.activatedAt, new Date(1792913739000).toISOString());
  assert.equal(toItem(msg, { activatedAt: { [msg.key]: '2026-10-25T08:00:00.000Z' } }).activatedAt, '2026-10-25T08:00:00.000Z');
});

test('www order: by path, the English variation first', () => {
  const rows = [...PROMO, ...DUBAI].map(rowFromWww).reverse();
  const { items } = messageList(rows, ['irreg', 'promo'], NOW, {}).data.lhgMessageList;
  assert.deepEqual(items.map((i) => `${i._path.split('/').slice(-2).join('/')}:${i.language}`), [
    'irreg/lh--information-on-flights-to-dubai:en',
    'irreg/lh--information-on-flights-to-dubai:de',
    'promo/kr-flash-teaser:ko',
  ]);
});

test('lists by type and only inside the from/to window', () => {
  const ids = (types, now = NOW) => messageList(TEST_ROWS, types, now, {}).data.lhgMessageList.items.map((i) => i._path.split('/').pop());
  assert.deepEqual(ids(['irreg']), ['test-1']);
  assert.deepEqual(ids(['tech-outage']), ['test-2']);
  assert.deepEqual(ids(['irreg', 'tech-outage', 'promo']), ['test-1', 'test-3', 'test-2']);
  // before test-2's from, after test-1's to
  assert.deepEqual(ids(['tech-outage'], Date.parse('2026-10-25T06:59:59.999Z')), []);
  assert.deepEqual(ids(['irreg'], Date.parse('2026-12-31T22:00:00.000Z')), []);
  assert.deepEqual(ids(['irreg'], Date.parse('2026-12-31T21:59:59.999Z')), ['test-1']);
  assert.deepEqual(messageList([], ['irreg'], NOW, {}), WWW.queries.lhgTechOutageMessageList.body);
});

test('CTI pages: www\'s shape and key order from the sheet', async () => {
  const resp = await worker.fetch(new Request('https://w.example/graphql/execute.json/Message-Center/CTI_Pages_for_APP'), env());
  const body = await resp.json();
  assert.deepEqual(body, WWW.queries.CTI_Pages_for_APP.body);
  assert.deepEqual(
    Object.keys(body.data.linkConfigForMessageCenterList.items[0]),
    Object.keys(WWW.queries.CTI_Pages_for_APP.body.data.linkConfigForMessageCenterList.items[0]),
  );
  const resp2 = await worker.fetch(new Request('https://w.example/graphql/execute.json/Message-Center/CTI%20Pages%20for%20tenants'), env());
  assert.deepEqual(await resp2.json(), WWW.queries['CTI%20Pages%20for%20tenants'].body);
  assert.deepEqual(ctiPages([]), { data: { linkConfigForMessageCenterList: { items: [] } } });
});

test('outage-b2b: tech-outage messages tagged tenant/b2b, with the details as plain text', async () => {
  const body = await outageB2b(env(), TEST_ROWS, NOW);
  assert.deepEqual(body, {
    data: {
      lhgMessageList: {
        items: [{ language: 'en', title: 'Test 2', description: { plaintext: 'Check-in is only possible in the app.\nPoint & one' } }],
      },
    },
  });
  assert.equal(plainText('<p>a&nbsp;b</p><p>c<br>d</p>'), 'a b\nc\nd');
});

test('routes, headers and CORS', async () => {
  const get = (path, origin) => worker.fetch(new Request(`https://w.example${path}`, { headers: origin ? { Origin: origin } : {} }), env());
  const r1 = await get('/graphql/execute.json/Message-Center/lhgIrregMessageList', ORIGIN);
  assert.equal(r1.status, 200);
  assert.equal(r1.headers.get('cache-control'), 'public, max-age=120');
  assert.equal(r1.headers.get('content-type'), 'application/json');
  assert.equal(r1.headers.get('access-control-allow-origin'), ORIGIN);
  assert.equal((await r1.json()).data.lhgMessageList.items[0].headline, 'Test 1');
  for (const o of ['https://lufthansa.turnsthe.page', 'http://localhost:3000', 'https://main--lh-com--moved-permanently.aem.live']) { // eslint-disable-line no-restricted-syntax
    assert.equal((await get('/graphql/execute.json/Message-Center/lhgMessageListWithCalendar', o)).headers.get('access-control-allow-origin'), o); // eslint-disable-line no-await-in-loop
  }
  const foreign = await get('/graphql/execute.json/Message-Center/lhgMessageListWithCalendar', 'https://evil.example');
  assert.equal(foreign.status, 200);
  assert.equal(foreign.headers.get('access-control-allow-origin'), null);
  const unknown = await get('/graphql/execute.json/Message-Center/noSuchQuery');
  assert.equal(unknown.status, 404);
  assert.equal(unknown.headers.get('cache-control'), 'public, max-age=120');
  // AEM's answer, as recorded on www (tools/source-export/feeds/graphql/Message-Center-noSuchQuery.json)
  assert.equal(await unknown.text(), fs.readFileSync(new URL('../../../source-export/feeds/graphql/Message-Center-noSuchQuery.json', import.meta.url), 'utf8'));
  assert.equal((await get('/other')).status, 404);
  assert.equal(queryName('/graphql/execute.json/Message-Center/lhgIrregMessageList;locale=en'), 'lhgIrregMessageList');
  const pre = await worker.fetch(new Request('https://w.example/graphql/execute.json/Message-Center/lhgIrregMessageList', { method: 'OPTIONS', headers: { Origin: ORIGIN } }), env());
  assert.equal(pre.status, 204);
  const preBad = await worker.fetch(new Request('https://w.example/graphql/execute.json/Message-Center/lhgIrregMessageList', { method: 'OPTIONS', headers: { Origin: 'https://evil.example' } }), env());
  assert.equal(preBad.status, 403);
});

test('the source is fetched past Cloudflare\'s cache, at most every 30 s per isolate', async () => {
  const e = env();
  const realNow = Date.now;
  let clock = realNow();
  Date.now = () => clock;
  try {
    await worker.fetch(new Request('https://w.example/graphql/execute.json/Message-Center/lhgIrregMessageList'), e);
    await worker.fetch(new Request('https://w.example/graphql/execute.json/Message-Center/lhgTechOutageMessageList'), e);
    await worker.fetch(new Request('https://w.example/graphql/execute.json/Message-Center/outage-b2b'), e);
    await worker.fetch(new Request('https://w.example/graphql/execute.json/Message-Center/CTI_Pages_for_APP'), e);
    const sourceCalls = () => fetches.filter((f) => f.url.startsWith(SOURCE));
    const indexCalls = () => fetches.filter((f) => f.url === `${SOURCE}/message-center/index.json`);
    assert.equal(indexCalls().length, 1);
    // index, details page and CTI sheet: no edge cache (cache: no-store, no cf cacheTtl / cacheEverything)
    assert.deepEqual([...new Set(sourceCalls().map((f) => new URL(f.url).pathname))].sort(), [
      '/message-center/config/cti-pages.json', '/message-center/details/test-2/en.plain.html', '/message-center/index.json',
    ]);
    sourceCalls().forEach((f) => {
      assert.equal(f.init.cache, 'no-store');
      assert.equal(f.init.cf, undefined);
    });
    // a withdrawal shows once the isolate copy is 30 s old
    sourceRows = TEST_ROWS.filter((r) => !r.path.includes('test-1'));
    clock += 29999;
    const before = await (await worker.fetch(new Request('https://w.example/graphql/execute.json/Message-Center/lhgIrregMessageList'), e, NOW)).json();
    assert.equal(before.data.lhgMessageList.items.length, 1);
    clock += 1;
    const after = await (await worker.fetch(new Request('https://w.example/graphql/execute.json/Message-Center/lhgIrregMessageList'), e, NOW)).json();
    assert.equal(after.data.lhgMessageList.items.length, 0);
    assert.equal(indexCalls().length, 2);
  } finally {
    Date.now = realNow;
  }
});

test('cron: activatedAt kept, KV written only on change, push on appear and disappear', async () => {
  const e = env();
  const t0 = NOW;
  const r1 = await runCron(e, t0);
  assert.equal(r1.changed, true);
  assert.equal(e.STATE.puts, 1);
  const s1 = JSON.parse(e.STATE.map.get('state'));
  assert.equal(s1.activatedAt['/message-center/irreg/test-1/en'], new Date(t0).toISOString());
  // test-3 has push set: it would be published (no PUSH_TARGET: logged only)
  assert.equal(r1.pushes, 1);
  assert.equal(r1.logged, 1);
  assert.match(logs.find((l) => l.startsWith('push')), /"action":"PUBLISH".*"id":"test-3"/);

  // nothing changed a minute later: no KV write, no push, activatedAt stays
  const r2 = await runCron(e, t0 + 60000);
  assert.equal(r2.changed, false);
  assert.equal(e.STATE.puts, 1);
  assert.equal(r2.pushes, 0);

  // test-3 withdrawn: UNPUBLISH from the stored fields; test-1 keeps its activatedAt
  resetSourceCache();
  sourceRows = TEST_ROWS.filter((r) => !r.path.includes('test-3'));
  logs.length = 0;
  const r3 = await runCron(e, t0 + 120000);
  assert.equal(r3.changed, true);
  assert.equal(e.STATE.puts, 2);
  assert.match(logs.find((l) => l.startsWith('push')), /"action":"UNPUBLISH".*"id":"test-3"/);
  const s3 = JSON.parse(e.STATE.map.get('state'));
  assert.equal(s3.activatedAt['/message-center/irreg/test-1/en'], new Date(t0).toISOString());

  // the served list carries the cron's activatedAt
  const resp = await worker.fetch(new Request('https://w.example/graphql/execute.json/Message-Center/lhgIrregMessageList'), e, NOW);
  assert.equal((await resp.json()).data.lhgMessageList.items[0].activatedAt, new Date(t0).toISOString());
});

test('cron: a message entering its window later is published then', () => {
  const rows = [{ ...TEST_ROWS[0], from: '2026-10-25T10:00:00.000Z' }];
  const before = diffState(null, rows, NOW);
  assert.deepEqual(before.published, []);
  const after = diffState(before.state, rows, Date.parse('2026-10-25T10:00:00.000Z'));
  assert.equal(after.published.length, 1);
  assert.equal(after.changed, true);
});

test('push: payload mapping and sending to PUSH_TARGET', async () => {
  const msg = parseRow(TEST_ROWS[0]);
  assert.deepEqual(pushPayload(msg, 'PUBLISH'), {
    action: 'PUBLISH',
    id: 'test-3',
    type: 'promo',
    language: 'de',
    headline: 'Test 3',
    criticality: 'low',
    tenants: ['lh'],
    markets: ['gb'],
    touchpoints: ['web'],
    link: '/gb/en/local-page/ski-campaign-2026',
    details: null,
    _path: '/content/dam/lufthansa-group/message-center/promo/test-3',
  });
  const e = env({ PUSH_TARGET: 'https://push.example/notify' });
  const r = await runCron(e, NOW);
  assert.equal(r.sent, 1);
  const call = fetches.find((f) => f.url === 'https://push.example/notify');
  assert.equal(call.init.method, 'POST');
  assert.equal(JSON.parse(call.init.body).action, 'PUBLISH');
});

test('rows that are no messages are ignored', () => {
  assert.deepEqual(activeMessages([{ path: '/message-center/details/test-1/en' }, { path: '/x' }], NOW), []);
  assert.equal(parseRow({ path: '/message-center/irreg/a/en', tenants: '["lh","lx"]' }).tenants.length, 2);
});
