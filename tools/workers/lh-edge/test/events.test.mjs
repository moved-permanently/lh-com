/* eslint-disable max-len */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import worker, { EventsRelay } from '../src/index.js';
import {
  mapPath, mapEntry, isPublishEntry, mergeEvents, safeEqual, relay, deliver, DEDUPE_MS, MAX_EVENTS, OVERLAP_MS,
} from '../src/events.js';

// lh-com's own audit log entries (tools/source-export/feeds/events, recorded 2026-10-26)
const SAMPLE = JSON.parse(fs.readFileSync(new URL('../../../source-export/feeds/events/log-sample.json', import.meta.url), 'utf8'));
const LOG = 'https://admin.hlx.page/log/moved-permanently/lh-com/main';
const live = (path, method = 'POST', timestamp = 1793015594254) => ({
  timestamp, route: 'live', method, status: method === 'DELETE' ? 204 : 200, path,
});

/** A fake KV namespace that counts writes. */
function kv(initial) {
  const store = new Map(initial ? [['state', JSON.stringify(initial)]] : []);
  return {
    writes: 0,
    async get(key, type) { const v = store.get(key); return v && type === 'json' ? JSON.parse(v) : v || null; },
    async put(key, value) { this.writes += 1; store.set(key, value); },
    state() { return JSON.parse(store.get('state') || 'null'); },
  };
}

let calls;
let logPages;
let sink;
beforeEach(() => {
  calls = [];
  logPages = [];
  sink = [];
  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url);
    calls.push({ url, headers: init.headers || {} });
    if (url.href.startsWith(LOG)) {
      const page = logPages.shift() || { entries: [] };
      return new Response(JSON.stringify({ from: url.searchParams.get('from'), to: url.searchParams.get('to') || new Date().toISOString(), ...page }));
    }
    if (url.href.startsWith('https://sink.example')) {
      sink.push(JSON.parse(init.body));
      const status = sink.length <= (globalThis.sinkFailures || 0) ? 503 : 200;
      return new Response('', { status });
    }
    return new Response('not found', { status: 404 });
  };
  globalThis.sinkFailures = 0;
});
const env = (state, extra = {}) => ({
  EVENTS_LOG: LOG, EVENTS_SITE: 'moved-permanently/lh-com', AUDIT_LOG_KEY: 'audit-key', WEBHOOK_TOKEN: 'hook-secret', EVENTS: kv(state), ...extra,
});

test('mapping v1: pages, fragments, structured documents, message center; the rest is not mapped', () => {
  const table = [
    ['/de/en/articles/highlights/soccer-event-in-north-america', 'PAGE', '/content/lh/markets/de/en/articles/highlights/soccer-event-in-north-america'],
    ['/de/en', 'PAGE', '/content/lh/markets/de/en'],
    ['/gb/en/homepage', 'PAGE', '/content/lh/markets/gb/en/homepage'],
    ['/content/lh/markets/de/en/during-your-trip/lounges/loungenet/muc-first-class-lounge', 'PAGE', '/content/lh/markets/de/en/during-your-trip/lounges/loungenet/muc-first-class-lounge'],
    ['/content/mobile/lh/de/homepage', 'PAGE', '/content/mobile/lh/de/homepage'],
    ['/de/en/nav', 'EXP_FRAGMENT', '/content/experience-fragments/lh/markets/de/en/nav'],
    ['/at/de/footer', 'EXP_FRAGMENT', '/content/experience-fragments/lh/markets/at/de/footer'],
    ['/de/de/fragments/stage-promotions', 'EXP_FRAGMENT', '/content/experience-fragments/lh/markets/de/de/stage-promotions'],
    ['/data/lufthansa-group/mobileapp/whats-new/de/airporter', 'CONTENT_FRAGMENT', '/content/dam/lufthansa-group/mobileapp/whats-new/de/airporter'],
    ['/data/details/lufthansa-group/ancillary/tmc/catalog/bidupgrade', 'CONTENT_FRAGMENT', '/content/dam/lufthansa-group/ancillary/tmc/catalog/bidupgrade'],
    ['/message-center/irreg/strike-fra/de', 'CONTENT_FRAGMENT', '/content/dam/lufthansa-group/message-center/irreg/strike-fra'],
    ['/message-center/config/cti-pages.json', 'CONTENT_FRAGMENT', '/content/dam/lufthansa-group/message-center/config/cti-pages-for-all-tenants'],
  ];
  table.forEach(([path, contentType, contentPath]) => assert.deepEqual(mapPath(path), { contentType, contentPath }, path));
  ['/metadata.json', '/redirects.json', '/de/en/query-index.json', '/message-center/index.json', '/.helix/config.json',
    '/content/dam/lh/images/offers/destination/abj-panorama.jpg', '/lhg/de/en/homepage', '/drafts/x', '/library/blocks/cards', '/index', '/nav', '', null]
    .forEach((p) => assert.equal(mapPath(p), null, String(p)));
});

test('filter: only per-resource live publishes (POST 200) and unpublishes (DELETE 204) of the sample', () => {
  const kept = SAMPLE.entries.filter(isPublishEntry).map((e) => `${e.method} ${e.path}`);
  assert.deepEqual(kept, [
    'DELETE /content/dam/lh/images/offers/destination/alf-square.jpg',
    'DELETE /content/dam/lh/images/offers/destination/aju-square.jpg',
    'POST /content/dam/lh/images/offers/destination/abj-panorama.jpg',
    'POST /de/en/articles/highlights/soccer-event-in-north-america',
  ]);
  // bulk requests (202 with paths), job summaries, preview, index, indexer and code entries are not events
  const events = SAMPLE.entries.map(mapEntry).filter(Boolean);
  assert.equal(events.length, 1);
  assert.deepEqual({ ...events[0], key: undefined }, {
    contentType: 'PAGE',
    contentPath: '/content/lh/markets/de/en/articles/highlights/soccer-event-in-north-america',
    contentChangeType: 'CREATE_MODIFY',
    env: 'prod',
    timestamp: 1793015594254,
    path: '/de/en/articles/highlights/soccer-event-in-north-america',
    key: undefined,
    mappingVersion: 1,
  });
  assert.equal(mapEntry(live('/de/en/x', 'DELETE')).contentChangeType, 'DELETE');
  assert.equal(isPublishEntry({ ...live('/de/en/x'), status: 202 }), false);
  assert.equal(isPublishEntry({ ...live('/de/en/x'), route: 'preview' }), false);
  assert.equal(isPublishEntry({ ...live('/*'), job: 'publish/job-1' }), false);
});

test('deduplication: per path and change within 120 s, entries read twice, newest first, at most 500', () => {
  const t = 1793015594254;
  const first = mergeEvents([], [live('/de/en/a', 'POST', t), live('/de/en/a', 'POST', t + DEDUPE_MS - 1), live('/de/en/a', 'DELETE', t + 1000), live('/de/en/b', 'POST', t + 5)]);
  assert.deepEqual(first.added.map((e) => `${e.contentChangeType} ${e.path}`), ['CREATE_MODIFY /de/en/a', 'CREATE_MODIFY /de/en/b', 'DELETE /de/en/a']);
  assert.deepEqual(first.events.map((e) => e.timestamp), [t + 1000, t + 5, t]);
  // the overlap reads the same entries again: nothing new; 120 s later the same path is a new event
  assert.equal(mergeEvents(first.events, [live('/de/en/b', 'POST', t + 5)]).added.length, 0);
  assert.equal(mergeEvents(first.events, [live('/de/en/a', 'POST', t + DEDUPE_MS + 1)]).added.length, 1);
  const many = mergeEvents([], Array.from({ length: 600 }, (_, i) => live(`/de/en/p${i}`, 'POST', t + i)));
  assert.equal(many.events.length, MAX_EVENTS);
  assert.equal(many.events[0].path, '/de/en/p599');
});

test('webhook: token compared in constant time; wrong or missing token 401, wrong site 400, no secret 503', async () => {
  assert.equal(safeEqual('hook-secret', 'hook-secret'), true);
  assert.equal(safeEqual('hook-secret', 'hook-secreT'), false);
  assert.equal(safeEqual('hook-secret', 'hook'), false);
  const post = (headers, body, e = env()) => worker.fetch(new Request('https://lhedge.example/_lh/events/webhook', {
    method: 'POST', headers, body: JSON.stringify(body),
  }), e, { waitUntil: () => {} });
  const body = { org: 'moved-permanently', site: 'lh-com', nextToken: 'tok-1' };
  assert.equal((await post({}, body)).status, 401);
  assert.equal((await post({ authorization: 'token wrong' }, body)).status, 401);
  assert.equal((await post({ authorization: 'Bearer hook-secret' }, body)).status, 401);
  assert.equal((await post({ authorization: 'token hook-secret' }, { ...body, site: 'other' })).status, 400);
  assert.equal((await post({ authorization: 'token hook-secret' }, body, env(null, { WEBHOOK_TOKEN: '' }))).status, 503);
  assert.equal(calls.length, 0, 'nothing read before the token is checked');

  logPages.push({ entries: [live('/de/de/homepage'), live('/data/lufthansa-group/mobileapp/whats-new/de/airporter', 'DELETE')] });
  const e = env();
  const resp = await post({ authorization: 'token hook-secret' }, body, e);
  assert.equal(resp.status, 200);
  assert.equal(resp.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await resp.json(), {
    ok: true, source: 'webhook', entries: 2, added: 2, more: false, wrote: true,
  });
  assert.equal(calls[0].url.searchParams.get('nextToken'), 'tok-1');
  assert.equal(calls[0].headers.authorization, 'token audit-key');
  assert.equal(e.EVENTS.state().events.length, 2);
  assert.equal(e.EVENTS.state().position.next, undefined, 'the webhook does not move the poller');
});

test('poller: the first run reads the last 60 s and stores its position; runs without news write nothing', async () => {
  const e = env();
  const now = Date.parse('2026-10-26T20:00:00Z');
  let r = await relay(e, null, { now });
  assert.equal(r.wrote, true);
  assert.equal(calls[0].url.searchParams.get('from'), new Date(now - OVERLAP_MS).toISOString());
  assert.equal(calls[0].url.searchParams.get('limit'), '200');
  assert.equal(e.EVENTS.writes, 1);
  const { to } = e.EVENTS.state().position;

  r = await relay(e, null, { now: now + 60000 });
  assert.equal(r.wrote, false);
  assert.equal(e.EVENTS.writes, 1);
  assert.equal(calls[1].url.searchParams.get('from'), new Date(Date.parse(to) - OVERLAP_MS).toISOString(), 'from the stored position with 60 s overlap');

  // a full page: the next page's window and token are stored and read on the next run
  logPages.push({ entries: [live('/de/en/x')], nextToken: 'next-1' });
  r = await relay(e, null, { now: now + 120000 });
  assert.equal(r.more, true);
  assert.equal(e.EVENTS.writes, 2);
  await relay(e, null, { now: now + 180000 });
  assert.equal(calls[3].url.searchParams.get('nextToken'), 'next-1');
  assert.equal(e.EVENTS.writes, 3, 'back to the live end: the position is written once');
  await relay(e, null, { now: now + 240000 });
  assert.equal(e.EVENTS.writes, 3);
});

test('events.json: newest first, AEM fields, no-store', async () => {
  const t = Date.parse('2026-10-26T20:00:00Z');
  const { events } = mergeEvents([], [live('/de/en/a', 'POST', t), live('/de/en/nav', 'POST', t + 1000)]);
  const resp = await worker.fetch(new Request('https://lhedge.example/_lh/events.json'), env({ position: { to: '2026-10-26T20:01:00.000Z' }, events }), {});
  assert.equal(resp.headers.get('cache-control'), 'no-store');
  const body = await resp.json();
  assert.equal(body.total, 2);
  assert.deepEqual(body.events[0], {
    contentType: 'EXP_FRAGMENT', contentPath: '/content/experience-fragments/lh/markets/de/en/nav', contentChangeType: 'CREATE_MODIFY', env: 'prod', timestamp: '2026-10-26T20:00:01.000Z', path: '/de/en/nav',
  });
});

test('sink: the four AEM fields, retried with back-off up to 5 tries; without a sink the event is logged', async () => {
  const event = mapEntry(live('/de/en/a'));
  const waits = [];
  globalThis.sinkFailures = 2;
  assert.equal(await deliver({ EVENTS_SINK_URL: 'https://sink.example/in' }, event, async (ms) => { waits.push(ms); }), 'sent');
  assert.deepEqual(sink[0], {
    contentType: 'PAGE', contentPath: '/content/lh/markets/de/en/a', contentChangeType: 'CREATE_MODIFY', env: 'prod',
  });
  assert.deepEqual(waits, [1000, 2000]);
  globalThis.sinkFailures = 10;
  sink.length = 0;
  waits.length = 0;
  assert.equal(await deliver({ EVENTS_SINK_URL: 'https://sink.example/in' }, event, async (ms) => { waits.push(ms); }), 'failed');
  assert.equal(sink.length, 5);
  assert.deepEqual(waits, [1000, 2000, 4000, 8000]);
  assert.equal(await deliver({}, event), 'logged');
});

test('RPC entrypoint: EventsRelay.poll() runs the poller (lh-messages\' cron binding)', async () => {
  const e = env();
  const waited = [];
  const relayEntry = new EventsRelay({ waitUntil: (p) => waited.push(p) }, e);
  logPages.push({ entries: [live('/de/en/homepage')] });
  const r = await relayEntry.poll();
  assert.equal(r.ok, true);
  assert.equal(r.added, 1);
  assert.equal(waited.length, 1, 'the sink runs in waitUntil');
  assert.deepEqual(await new EventsRelay({}, env(null, { AUDIT_LOG_KEY: '' })).poll(), { ok: false, error: 'not configured' });
});
