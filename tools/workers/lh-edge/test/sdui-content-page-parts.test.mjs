/* eslint-disable max-len */
/* The content page 100-years-of-lufthansa's three parts (brief 310): www refused them to batch 7,
   Ben recorded them on 2026-11-03 (tools/source-export/feeds/sdui/<lang>/content-pages/100-years-of-lufthansa/).
   lh-edge renders them from one document each (the imported documents are the fixtures), as www
   in v1 and v2: the four headline sizes of a content page (h1-h4), the divider, the web link, and
   <strong> where www writes it (metadata Bold tag). */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import worker from '../src/index.js';
import { resetIndexCache } from '../src/sdui-route.js';
import { renderScreen } from '../src/sdui.js';

const FIX = new URL('./fixtures/sdui/', import.meta.url);
const FEED = new URL('../../../source-export/feeds/sdui/', import.meta.url);
const env = { ORIGIN: 'main--lh-com--moved-permanently.aem.live', PUBLIC_HOST: '', EDGE_TTL: '60' };
const PARTS = ['en', 'de'].flatMap((lang) => [1, 2, 3].map((n) => ({ lang, n, path: `/content/mobile/lh/${lang}/content-pages/100-years-of-lufthansa/100-years-of-lufthansa-part-${n}` })));
const docs = Object.fromEntries(PARTS.map((p) => [p.path, fs.readFileSync(new URL(`content-page-100-years-part-${p.n}-${p.lang}.plain.html`, FIX), 'utf8')]));

beforeEach(() => {
  resetIndexCache();
  globalThis.fetch = async (input) => {
    const u = new URL((input instanceof Request ? input : new Request(input)).url);
    if (u.pathname === '/content/mobile/lh/query-index.json') return new Response('{"data":[]}', { headers: { 'content-type': 'application/json' } });
    if (docs[u.pathname]) return new Response(docs[u.pathname], { headers: { 'content-type': 'text/html; charset=utf-8' } });
    return new Response('not found', { status: 404, headers: { 'content-type': 'text/html' } });
  };
});

// as compare-sdui.mjs: ids are ours, the host is the public one, and the whitespace Document
// Authoring does not keep (at the end of a text or a bold run, &nbsp; there, leading spaces)
const norm = (o, host) => JSON.parse(JSON.stringify(o), (k, v) => {
  if (k === 'id') return undefined;
  if (typeof v !== 'string') return v;
  return v.replace(/https:\/\/(www\.lufthansa\.com|[a-z0-9.-]+\.example)(?=\/content\/)/g, `https://${host}`)
    .replace(/(?:\s|&nbsp;|<br>)+(<\/b>|<\/strong>|<\/li>)/g, '$1').replace(/(?:\s|&nbsp;|<br>)+$/, '').replace(/^\s+/, '');
});
const recorded = (p, v2) => JSON.parse(fs.readFileSync(new URL(`${p.path.slice('/content/mobile/lh/'.length)}${v2 ? '.v2' : ''}.sdui.json`, FEED), 'utf8'));

test('the six part screens as www, v1 and v2 (12 answers, ids and DA whitespace aside)', async () => {
  const answers = PARTS.flatMap((p) => [false, true].map((v2) => ({ p, v2 })));
  const got = await Promise.all(answers.map(async ({ p, v2 }) => {
    const r = await worker.fetch(new Request(`https://lh-edge.example${p.path}${v2 ? '.v2' : ''}.sdui`), env, {});
    return { status: r.status, cacheControl: r.headers.get('cache-control'), body: await r.json() };
  }));
  answers.forEach(({ p, v2 }, i) => {
    assert.equal(got[i].status, 200, p.path);
    assert.equal(got[i].cacheControl, null);
    assert.deepEqual(norm(got[i].body, 'h'), norm(recorded(p, v2), 'h'), `${p.path} ${v2 ? 'v2' : 'v1'}`);
  });
});

test('the recorded answers are in the feed index (status 200, JSON, recorded 2026-11-03)', () => {
  const { urls } = JSON.parse(fs.readFileSync(new URL('index.json', FEED), 'utf8'));
  PARTS.forEach((p) => ['.sdui', '.v2.sdui'].forEach((s) => {
    const e = urls[`${p.path}${s}`];
    assert.ok(e, `${p.path}${s}`);
    assert.deepEqual([e.status, e['content-type'], e.recorded.slice(0, 10)], [200, 'application/json', '2026-11-03']);
    assert.ok(fs.existsSync(new URL(e.file.replace(/^sdui\//, ''), FEED)), e.file);
  }));
});

const page = (body, meta = '') => `<div>${body}</div><div><div class="metadata"><div><div>Title</div><div>T</div></div>${meta}</div></div>`;
const render = (html, version) => renderScreen(html, { path: '/content/mobile/lh/en/x', version, host: 'h.example' });

test('a {divider} paragraph: a divider in v1 and v2', () => {
  const html = page('<p>a</p><p>{divider}</p><p>b</p>');
  assert.deepEqual(render(html, 'v1').items.map((i) => i.type), ['spacer', 'copyText', 'divider', 'copyText', 'spacer']);
  const v2 = render(html, 'v2').body.items[0].items;
  assert.deepEqual(v2.map((i) => i.type), ['copyText', 'divider', 'copyText']);
  assert.ok(v2[1].id);
});

test('a content page\'s four headline sizes: h1-h4 = v2 HEADING_XXL, XL, L, M; v1 HEADLINE, HEADLINE, EXTRA_LARGE, LARGE', () => {
  const html = page('<h1>a</h1><h2>b</h2><h3>c</h3><h4>d</h4>', '<div><div>SDUI type</div><div>content-page</div></div>');
  assert.deepEqual(render(html, 'v2').body.items[0].items.map((i) => [i.type, i.variant, i.isBold]), [
    ['mainHeadline', 'HEADING_XXL', true], ['mainHeadline', 'HEADING_XL', true], ['mainHeadline', 'HEADING_L', true], ['mainHeadline', 'HEADING_M', true]]);
  assert.deepEqual(render(html, 'v1').items.slice(1, -1), [
    { type: 'copyText', text: 'a', variant: 'HEADLINE' }, { type: 'copyText', text: 'b', variant: 'HEADLINE' },
    {
      type: 'copyText', text: 'c', size: 'EXTRA_LARGE', variant: 'HEADLINE',
    }, {
      type: 'copyText', text: 'd', size: 'LARGE', variant: 'HEADLINE',
    }]);
  // other screens as before: h2 HEADING_L, h3 a MEDIUM headline
  const article = page('<h1>a</h1><h2>b</h2><h3>c</h3>');
  assert.deepEqual(render(article, 'v2').body.items[0].items.map((i) => [i.type, i.variant, i.size]), [
    ['mainHeadline', 'HEADING_XL', undefined], ['mainHeadline', 'HEADING_L', undefined], ['copyText', 'HEADLINE', 'MEDIUM']]);
});

test('Bold tag strong: bold as <strong> (www\'s content pages); without it <b>, as before', () => {
  const body = '<p><strong>x</strong> y</p><ul><li><strong>z</strong></li></ul>';
  const strong = render(page(body, '<div><div>Bold tag</div><div>strong</div></div>'), 'v1').items;
  assert.deepEqual(strong.slice(1, -1).map((i) => i.text), ['<strong>x</strong> y', '<ul><li><strong>z</strong></li></ul>']);
  assert.deepEqual(render(page(body), 'v1').items.slice(1, -1).map((i) => i.text), ['<b>x</b> y', '<ul><li><b>z</b></li></ul>']);
});
