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
  assert.equal(v2.headers.get('cache-control'), null, 'no Cache-Control without nocache, as www');
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

test('sdui spellings: v2, ios and nocache in any order; v2 wins over ios; nocache sets max-age=600', async () => {
  const get = async (suffix) => worker.fetch(new Request(`https://lh-edge.example/content/mobile/lh/en/articles/europe${suffix}`), env, {});
  const v2 = withoutIds(await (await get('.v2.sdui')).json());
  const spellings = ['.ios.v2.sdui', '.v2.ios.sdui', '.nocache.v2.sdui', '.v2.nocache.sdui', '.ios.nocache.v2.sdui'];
  const bodies = await Promise.all(spellings.map(async (s) => withoutIds(await (await get(s)).json())));
  bodies.forEach((b, i) => assert.deepEqual(b, v2, spellings[i]));
  const plain = await (await get('.sdui')).json();
  const nocache = await get('.nocache.sdui');
  assert.equal(nocache.headers.get('cache-control'), 'max-age=600');
  assert.deepEqual(await nocache.json(), plain);
  assert.equal((await get('.v2.nocache.sdui')).headers.get('cache-control'), 'max-age=600');
  assert.equal((await get('.ios.sdui')).headers.get('cache-control'), null);
  const ios = await (await get('.ios.sdui')).json();
  assert.deepEqual(await (await get('.nocache.ios.sdui')).json(), ios);
  assert.notDeepEqual(ios, plain);
  // the iOS layout: no LARGE spacers at the ends of a page, text runs in padded columns, screen links .ios.sdui
  assert.notEqual(ios.items[0].type === 'spacer' && ios.items[0].size, 'LARGE');
  assert.ok(ios.items.some((i) => i.type === 'paddedColumn'));
  const text = JSON.stringify(ios);
  assert.ok(!/\/content\/mobile\/[^"]+(?<!\.ios)\.sdui"/.test(text), 'every screen link ends in .ios.sdui');
  assert.equal((await get('.v2.v2.sdui')).status, 404, 'a marker twice is not a spelling');
  assert.equal((await get('.android.sdui')).status, 404);
});

test('iosLayout: runs of text, links, spacers and dividers in one padded column with SMALL spacers; images apart', async () => {
  const { iosLayout } = await import('../src/sdui.js');
  const t = (type, extra = {}) => ({ type, ...extra });
  const out = iosLayout([t('image'), t('image'), t('copyText'), t('spacer', { size: 'X_SMALL' }), t('textLink_v2'), t('offerBox_v2'), t('divider'), t('copyText')]);
  assert.deepEqual(out.map((i) => i.type), ['image', 'spacer', 'image', 'paddedColumn', 'offerBox_v2', 'paddedColumn']);
  assert.equal(out[1].size, 'SMALL');
  assert.deepEqual(out[3].padding, {
    left: 'LARGE', right: 'LARGE', top: 'MEDIUM', bottom: 'MEDIUM',
  });
  assert.deepEqual(out[3].items.map((i) => `${i.type}${i.size ? `:${i.size}` : ''}`), ['copyText', 'spacer:SMALL', 'spacer:X_SMALL', 'spacer:SMALL', 'textLink_v2']);
  assert.deepEqual(out[5].items.map((i) => i.type), ['divider', 'spacer', 'copyText']);
});
