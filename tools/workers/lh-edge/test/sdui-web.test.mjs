/* eslint-disable max-len, import/extensions, no-restricted-syntax */
/* Web pages as SDUI (brief 78 part 2): the article against www's four recordings, a content page
   with what www's FAQ answer holds, the page types and spellings. */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import worker, { routeOf } from '../src/index.js';
import { resetWebCache, webModel, renderWeb } from '../src/sdui-web.js';
import { compareAnswer, normalize } from '../sdui-web-diff.mjs';

const FIX = new URL('./fixtures/sdui-web/', import.meta.url);
const WWW = new URL('../../../source-export/feeds/ams-rest/sdui-web/', import.meta.url);
const read = (u) => fs.readFileSync(u, 'utf8');
const www = (name) => JSON.parse(read(new URL(`sdui-web-${name}.json`, WWW)));
const PLAIN = read(new URL('7people.plain.html', FIX));
const { articles, search } = JSON.parse(read(new URL('indexes.json', FIX)));
const ARTICLE = '/de/en/articles/explore-flying/7-people-who-shaped-lufthansa-history';
const FULL = `/content/lh/markets${ARTICLE}`;
const env = { ORIGIN: 'main--lh-com--moved-permanently.aem.live', PUBLIC_HOST: 'lh-edge.example', EDGE_TTL: '60' };

let calls;
beforeEach(() => {
  resetWebCache();
  calls = [];
  globalThis.fetch = async (input) => {
    const req = input instanceof Request ? input : new Request(input);
    const u = new URL(req.url);
    calls.push(u.pathname);
    const sheet = (data) => Response.json({
      total: data.length, offset: 0, limit: 1000, data,
    });
    if (u.pathname === '/de/en/articles/query-index.json') return sheet(articles);
    if (u.pathname === '/de/en/search-index.json') return sheet(search);
    if (u.pathname === '/articles/config/tag-priority.json') return sheet([]);
    if (u.pathname === `${ARTICLE}.plain.html`) return new Response(PLAIN, { headers: { 'content-type': 'text/html' } });
    if (u.pathname === ARTICLE) return new Response('<html><body>the page</body></html>', { headers: { 'content-type': 'text/html; charset=utf-8' } });
    return new Response('not found', { status: 404 });
  };
});
const get = (p) => worker.fetch(new Request(`https://lh-edge.example${p}`), env, {});

test('sdui-web: the article in all four spellings as www, deliberate differences aside', async () => {
  for (const [sp, cc] of [['.sdui', null], ['.ios.sdui', null], ['.v2.sdui', null], ['.nocache.v2.sdui', 'max-age=600']]) {
    // eslint-disable-next-line no-await-in-loop
    const resp = await get(`${FULL}${sp}`);
    assert.equal(resp.status, 200, sp);
    assert.equal(resp.headers.get('cache-control'), cc, sp);
    assert.equal(resp.headers.get('content-type'), 'application/json');
    // eslint-disable-next-line no-await-in-loop
    const { differences, counts } = compareAnswer(www(`7people${sp}`), await resp.json());
    assert.deepEqual(differences, [], `${sp}: ${JSON.stringify(differences.slice(0, 2))}`);
    assert.ok(counts.images > 0 && counts.host > 0, sp);
  }
});

test('sdui-web: date line, headline, links in text as www writes them, related boxes from the index', async () => {
  const v1 = await (await get(`${FULL}.sdui`)).json();
  assert.equal(v1.title, '100 Years of Lufthansa: Seven People Who Shaped Our History');
  assert.deepEqual(v1.items.slice(2, 4).map((i) => i.text), ['100 Years of Lufthansa: Seven People Who Shaped Our History', '<b>7. September 2026 | 8 min read | Lufthansa Editorial Team</b>']);
  const tokyo = v1.items.find((i) => (i.text || '').includes('Tokyo</a>'));
  assert.match(tokyo.text, /<a hreftemp="\/content\/lh\/markets\/de\/en\/articles\/tags\/tokyo" href="\/de\/en\/articles\/tags\/tokyo" linkscheme="Hyperlink"><em class="lh lh-arrow-right">\u200b<\/em>Tokyo<\/a>/);
  assert.ok(!v1.items.some((i) => /\{caption\}|Back to overview|Ready for a journey/.test(i.text || '')), 'captions, button links and the columns-media teaser are not parts');
  const boxes = v1.items.filter((i) => i.type === 'offerBox_v2');
  assert.equal(boxes.length, 3);
  assert.equal(boxes[0].action_v2.request.url, `https://lh-edge.example${boxes[0].action_v2.initialTitle ? articles.find((a) => a.title === boxes[0].title).path : ''}.sdui`);
  assert.match(boxes[0].imageURL, /media_[0-9a-f]+/);
  const ios = await (await get(`${FULL}.ios.sdui`)).json();
  assert.ok(ios.items.filter((i) => i.type === 'offerBox_v2').every((b) => b.action_v2.request.url.endsWith('.ios.sdui')));
  const v2 = await (await get(`${FULL}.v2.sdui`)).json();
  assert.equal(v2.body.items[1].id, '/lh/en/explore-flying/7-people-who-shaped-lufthansa-history');
  assert.ok(v2.body.items.filter((i) => i.type === 'offerBox').every((b) => b.action.request.url.endsWith('.v2.sdui') && b.id.startsWith('/lh/en/')));
});

test('sdui-web: a content page with what www\'s FAQ answer holds (a divider, two spacers) answers exactly as www', () => {
  const html = '<div><p>{divider-25}</p><p>{spacer-25}</p><p>{spacer-40 from-768}</p></div>';
  const page = '/de/en/support/faq/faq-refund';
  const model = webModel(html, page);
  const opts = {
    fullPath: `/content/lh/markets${page}`, page, host: 'www.lufthansa.com', title: 'Get a ticket refunded for a canceled or postponed flight', lang: 'en',
  };
  const counts = {};
  assert.deepEqual(renderWeb(model, { ...opts, version: 'v1' }), www('faq-refund.sdui'));
  assert.deepEqual(renderWeb(model, { ...opts, version: 'v1', ios: true }), www('faq-refund.ios.sdui'));
  assert.deepEqual(normalize(renderWeb(model, { ...opts, version: 'v2' }), counts), normalize(www('faq-refund.v2.sdui'), counts));
});

test('sdui-web: page types and spellings', async () => {
  // a page that is no article and not in the content list (multiwidth, homepage): 404
  assert.equal((await get('/content/lh/markets/de/en/baggage.v2.sdui')).status, 404);
  assert.equal((await get('/content/lh/markets/de/en/homepage.sdui')).status, 404);
  assert.equal((await get('/content/lh/markets/fr/fr/x.sdui')).status, 404);
  assert.equal((await get(`${FULL}.v2.v2.sdui`)).status, 404, 'a marker twice');
  // the short spelling answers the page's HTML, as www
  const short = await get(`${ARTICLE}.v2.sdui`);
  assert.equal(short.status, 200);
  assert.match(short.headers.get('content-type'), /text\/html/);
  assert.equal(await short.text(), '<html><body>the page</body></html>');
  assert.equal(routeOf(new Request(`https://lh-edge.example${FULL}.sdui`)).name, 'sdui-web');
  assert.equal(routeOf(new Request(`https://lh-edge.example${ARTICLE}.ios.sdui`)).name, 'sdui-web-short');
  assert.equal(routeOf(new Request('https://lh-edge.example/content/mobile/lh/en/homepage.v2.sdui')).name, 'sdui', 'app screens unchanged');
});
