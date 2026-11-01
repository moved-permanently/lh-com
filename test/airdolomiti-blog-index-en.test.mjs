/* eslint-disable import/no-extraneous-dependencies -- js-yaml is a dev dependency */
/* Air Dolomiti's English posts list (/en/articles on lh-airdolomiti): helix-query.yaml
   articles-airdolomiti-en (/en/articles/<category>/<post> -> /en/articles/query-index.json,
   appended after articles-airdolomiti-it, the same properties: every other index as before),
   scripts/brands.js articleIndex en, blog-overview on an English Air Dolomiti page: the English
   posts, their category names, English dates. The Italian list as before.
   Run: node --max-old-space-size=512 --test test/airdolomiti-blog-index-en.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import yaml from 'js-yaml';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
// the block's imports load scripts.js: on a demo host's / it only redirects (stubbed), it
// decorates nothing
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'main--lh-airdolomiti--moved-permanently.aem.page', pathname: '/', search: '', replace: () => {}, href: 'https://main--lh-airdolomiti--moved-permanently.aem.page/', origin: 'https://main--lh-airdolomiti--moved-permanently.aem.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
window.history = { state: null, replaceState: () => {} };
// linkedom's select has no value setter (the block sets the category filter's value)
Object.defineProperty(window.HTMLSelectElement.prototype, 'value', {
  configurable: true,
  get() { return (this.querySelector('option[selected]') || this.querySelector('option') || {}).value || ''; },
  set(v) { [...this.querySelectorAll('option')].forEach((o) => o.toggleAttribute('selected', o.value === v)); },
});
globalThis.window = window;
globalThis.document = document;

// rows as the English posts' metadata gives them (en/articles/dyk/5-apps-for-travellers)
const POSTS = [
  {
    path: '/en/articles/dyk/5-apps-for-travellers', title: '5 apps for travellers', description: 'People born before the 80s', image: '/default-meta-image.png', 'image-alt': '', category: '#DidYouKnow', 'publication-date': '2021-10-06', 'reading-time': 'Reading time: 3 minutes',
  },
  {
    path: '/en/articles/avgeek-en/aeroplane-tails', title: 'Aeroplane tails', description: '', image: '/en/articles/avgeek-en/media_1.png', 'image-alt': '', category: 'AvGeek', 'publication-date': '2023-07-19', 'reading-time': 'Reading time: 2 minutes',
  },
];
let calls;
beforeEach(() => {
  calls = [];
  globalThis.fetch = async (url) => {
    const href = String(url);
    calls.push(href);
    const sheet = (data) => new Response(JSON.stringify({
      total: data.length, offset: 0, limit: 500, data,
    }), { headers: { 'content-type': 'application/json' } });
    if (href.startsWith('/en/articles/query-index.json')) return sheet(POSTS);
    if (href.includes('/data/recorded/')) return new Response(JSON.stringify({ entries: {} }));
    return new Response('{}', { status: 404, headers: { 'content-type': 'application/json' } });
  };
});

const { loadArticles } = await import('../scripts/articles.js');
const { BRANDS } = await import('../scripts/brands.js');
const { default: decorate } = await import('../blocks/blog-overview/blog-overview.js');

test('helix-query.yaml: the English posts index after the Italian one, the same properties', () => {
  const { indices } = yaml.load(fs.readFileSync('helix-query.yaml', 'utf8'));
  const it = indices['articles-airdolomiti-it'];
  const en = indices['articles-airdolomiti-en'];
  assert.ok(en, 'articles-airdolomiti-en');
  assert.deepEqual(en.include, ['/en/articles/*/*']);
  assert.equal(en.target, '/en/articles/query-index.json');
  assert.equal(JSON.stringify(en.properties), JSON.stringify(it.properties));
  // appended: the English index right after the Italian one, both after the indexes before them
  // (indexes appended later follow: message-center-notifications)
  const keys = Object.keys(indices);
  assert.equal(keys.indexOf('articles-airdolomiti-en'), keys.indexOf('articles-airdolomiti-it') + 1);
  assert.ok(keys.indexOf('articles-airdolomiti-en') < keys.indexOf('message-center-notifications'));
});

test('brands.js: Air Dolomiti\'s English posts index; loadArticles reads it for English', async () => {
  // (German: test/airdolomiti-blog-index-de)
  assert.equal(BRANDS.airdolomiti.articleIndex.en, '/en/articles/query-index.json');
  const posts = await loadArticles({ key: 'en', lang: 'en' }, BRANDS.airdolomiti);
  assert.deepEqual(posts.map((p) => p.path), ['/en/articles/avgeek-en/aeroplane-tails', '/en/articles/dyk/5-apps-for-travellers'], 'newest first');
  assert.ok(calls.some((c) => c.startsWith('/en/articles/query-index.json')));
  assert.ok(calls.every((c) => !c.startsWith('/en/articles/articles/')));
});

test('blog-overview on Air Dolomiti\'s /en/articles: the English posts, English dates', async () => {
  const block = document.createElement('div');
  block.className = 'blog-overview';
  document.body.replaceChildren(block);
  document.head.innerHTML = '<meta name="brand" content="airdolomiti"><meta name="language" content="en">';
  try {
    await decorate(block);
  } finally {
    document.head.innerHTML = '';
  }
  const cards = [...block.querySelectorAll('.blog-overview-card')];
  assert.deepEqual(cards.map((c) => c.querySelector('.blog-overview-title a').getAttribute('href')), ['/en/articles/avgeek-en/aeroplane-tails', '/en/articles/dyk/5-apps-for-travellers']);
  assert.equal(cards[0].querySelector('.blog-overview-info span').textContent, 'July 19, 2023');
  assert.deepEqual([...block.querySelectorAll('option')].map((o) => [o.value, o.textContent]).slice(1), [
    ['#didyouknow', '#DidYouKnow'], ['avgeek', 'AvGeek']]);
});
