/* eslint-disable max-len */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import worker from '../src/index.js';
import { resetIndexCache } from '../src/sdui-route.js';
import { parseHtml, textOf } from '../src/html.js';

const FIX = new URL('./fixtures/sdui/', import.meta.url);
const FEED = new URL('../../../source-export/feeds/sdui/en/', import.meta.url);
const ORIGIN = 'main--lh-com--moved-permanently.aem.live';
const env = { ORIGIN, PUBLIC_HOST: '', EDGE_TTL: '60' };
const docs = {
  '/content/mobile/lh/en/articles/europe': fs.readFileSync(new URL('europe.plain.html', FIX), 'utf8'),
  '/content/mobile/lh/en/articles/a-perfect-day-in-frankfurt': fs.readFileSync(new URL('a-perfect-day-in-frankfurt.plain.html', FIX), 'utf8'),
};
const INDEX = fs.readFileSync(new URL('query-index-en.json', FIX), 'utf8');

let calls;
beforeEach(() => {
  resetIndexCache();
  calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input);
    calls.push({ url: req.url, init });
    const u = new URL(req.url);
    if (u.pathname === '/content/mobile/lh/query-index.json') return new Response(INDEX, { headers: { 'content-type': 'application/json' } });
    if (docs[u.pathname]) return new Response(docs[u.pathname], { headers: { 'content-type': 'text/html; charset=utf-8' } });
    return new Response('not found', { status: 404, headers: { 'content-type': 'text/html' } });
  };
});

/** www's answer with ids removed and its host replaced (ids are ours; the host is the public one). */
const expected = (file, host) => JSON.parse(fs.readFileSync(new URL(file, FEED), 'utf8'), (k, v) => (k === 'id' ? undefined : v)
  && (typeof v === 'string' ? v.replace(/https:\/\/www\.lufthansa\.com(?=\/content\/)/g, `https://${host}`) : v));
const withoutIds = (o) => JSON.parse(JSON.stringify(o), (k, v) => (k === 'id' ? undefined : v));

test('sdui: v2 and v1 screens as www (ids aside), list from the index, public host from X-LH-Public-Host', async () => {
  const headers = { 'x-lh-public-host': 'lh.example', 'x-forwarded-host': 'ignored.example' };
  const v2 = await worker.fetch(new Request('https://lh-edge.example/content/mobile/lh/en/articles/europe.v2.sdui', { headers }), env, {});
  assert.equal(v2.status, 200);
  assert.equal(v2.headers.get('content-type'), 'application/json');
  assert.equal(v2.headers.get('cache-control'), 'public, max-age=60');
  assert.deepEqual(withoutIds(await v2.json()), expected('articles/europe.v2.sdui.json', 'lh.example'));
  const v1 = await worker.fetch(new Request('https://lh-edge.example/content/mobile/lh/en/articles/europe.sdui', { headers: { 'x-forwarded-host': 'fwd.example' } }), env, {});
  assert.deepEqual(await v1.json(), expected('articles/europe.sdui.json', 'fwd.example'));
  // an article: hero image outside the columns, the v2-only spacer, web links as www
  const a2 = await worker.fetch(new Request('https://lh-edge.example/content/mobile/lh/en/articles/a-perfect-day-in-frankfurt.v2.sdui'), env, {});
  assert.deepEqual(withoutIds(await a2.json()), expected('articles/a-perfect-day-in-frankfurt.v2.sdui.json', 'lh-edge.example'));
  const a1 = await worker.fetch(new Request('https://lh-edge.example/content/mobile/lh/en/articles/a-perfect-day-in-frankfurt.sdui'), env, {});
  assert.deepEqual(await a1.json(), expected('articles/a-perfect-day-in-frankfurt.sdui.json', 'lh-edge.example'));
  // the index is read past the edge cache, once per isolate
  assert.equal(calls.filter((c) => c.url.endsWith('/content/mobile/lh/query-index.json')).length, 1);
  assert.equal(calls.find((c) => c.url.endsWith('/query-index.json')).init.cache, 'no-store');
  // stable ids of our own
  const again = await (await worker.fetch(new Request('https://lh-edge.example/content/mobile/lh/en/articles/europe.v2.sdui'), env, {})).json();
  const first = await (await worker.fetch(new Request('https://lh-edge.example/content/mobile/lh/en/articles/europe.v2.sdui'), env, {})).json();
  assert.equal(JSON.stringify(again), JSON.stringify(first));
  assert.equal(first.id, '/content/mobile/lh/en/articles/europe');
});

test('sdui: no document answers 404 (JSON); web pages have no .sdui', async () => {
  const r = await worker.fetch(new Request('https://lh-edge.example/content/mobile/lh/fr/articles.sdui'), env, {});
  assert.equal(r.status, 404);
  assert.equal(r.headers.get('content-type'), 'application/json');
});

test('html parser: entities, void elements, nesting', () => {
  const t = parseHtml('<p>A&nbsp;&amp;<br>B<img src="x?a=1&#x26;b=2"><strong>C</strong></p>');
  const p = t.children[0];
  assert.equal(textOf(p), 'A\u00a0&BC');
  assert.equal(p.children.find((c) => c.tag === 'img').attrs.src, 'x?a=1&b=2');
});
