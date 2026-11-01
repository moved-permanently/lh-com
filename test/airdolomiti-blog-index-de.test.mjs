/* eslint-disable import/no-extraneous-dependencies -- js-yaml is a dev dependency */
/* Air Dolomiti's German posts list (/de/artikel on lh-airdolomiti): helix-query.yaml
   articles-airdolomiti-de (/de/artikel/<category>/<post> -> /de/artikel/query-index.json, appended
   at the end with the properties of articles-airdolomiti-en: every other index as before),
   scripts/brands.js articleIndex de, blog-overview on a German Air Dolomiti page (/de/, metadata
   language de): the German posts, www's German category names (#DidYouKnow, AvGeek, Throwback,
   Traumziele, Travellers: the posts' category metadata), German dates; a German post with www's
   English description keeps it. The Italian and English lists as before.
   Run: node --max-old-space-size=512 --test test/airdolomiti-blog-index-de.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import yaml from 'js-yaml';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
// the block's imports load scripts.js: on a demo host's / it only redirects (stubbed), it
// decorates nothing; the German page's path is set before the block runs
window.hlx = { codeBasePath: '' };
const at = (pathname) => {
  window.location = {
    hostname: 'main--lh-airdolomiti--moved-permanently.aem.page', pathname, search: '', hash: '', replace: () => {}, href: `https://main--lh-airdolomiti--moved-permanently.aem.page${pathname}`, origin: 'https://main--lh-airdolomiti--moved-permanently.aem.page',
  };
};
at('/');
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

// rows as the German posts' metadata gives them (one per category; flugsimulatoren carries www's
// English description, kept as it is)
const POSTS = [
  {
    path: '/de/artikel/did-you-know/flugsimulatoren', title: 'Flugsimulatoren', description: 'Flight simulators: how pilots train for every situation', image: '/de/artikel/did-you-know/media_1.png', 'image-alt': '', category: '#DidYouKnow', 'publication-date': '2022-03-09', 'reading-time': 'Lesezeit: 2 Minuten',
  },
  {
    path: '/de/artikel/avgeek-de/air-dolomiti-hangars-moderne-flugzeugwartung', title: 'In den Hangars', description: 'In den Hangars in Florenz und Verona', image: '/de/artikel/avgeek-de/media_2.png', 'image-alt': '', category: 'AvGeek', 'publication-date': '2026-03-31', 'reading-time': 'Lesezeit: 3 Minuten',
  },
  {
    path: '/de/artikel/throwback-de/50-jahre-embraer', title: '50 Jahre Embraer', description: '2009 wurde Air Dolomiti Geschäftspartner', image: '', 'image-alt': '', category: 'Throwback', 'publication-date': '2019-12-05', 'reading-time': 'Lesezeit: 2 Minuten',
  },
  {
    path: '/de/artikel/reiseziele/aarhus-das-umland', title: 'Aarhus: das Umland', description: 'Wir haben euch schon mehrere gute Gründe', image: '', 'image-alt': '', category: 'Traumziele', 'publication-date': '2021-09-15', 'reading-time': 'Lesezeit: 2 Minuten',
  },
  {
    path: '/de/artikel/travellers-de/5-moeglichkeiten-beim-fliegen-eure-fertigkeiten-zu-verbessern', title: '5 Möglichkeiten', description: 'Hier findet ihr fünf Möglichkeiten', image: '', 'image-alt': '', category: 'Travellers', 'publication-date': '2024-01-10', 'reading-time': 'Lesezeit: 4 Minuten',
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
    if (href.startsWith('/de/artikel/query-index.json')) return sheet(POSTS);
    if (href.startsWith('/en/articles/query-index.json')) return sheet([]);
    if (href.startsWith('/articoli/query-index.json')) return sheet([]);
    if (href.includes('/data/recorded/')) return new Response(JSON.stringify({ entries: {} }));
    return new Response('{}', { status: 404, headers: { 'content-type': 'application/json' } });
  };
});

const { loadArticles } = await import('../scripts/articles.js');
const { BRANDS } = await import('../scripts/brands.js');
const { getLocale } = await import('../scripts/locale.js');
const { default: decorate } = await import('../blocks/blog-overview/blog-overview.js');

test('helix-query.yaml: the German posts index appended, the English one\'s properties, every other index as before', () => {
  const { indices } = yaml.load(fs.readFileSync('helix-query.yaml', 'utf8'));
  const de = indices['articles-airdolomiti-de'];
  assert.ok(de, 'articles-airdolomiti-de');
  assert.deepEqual(de.include, ['/de/artikel/*/*']);
  assert.equal(de.target, '/de/artikel/query-index.json');
  assert.equal(JSON.stringify(de.properties), JSON.stringify(indices['articles-airdolomiti-en'].properties));
  const keys = Object.keys(indices);
  assert.equal(keys.indexOf('articles-airdolomiti-de'), keys.indexOf('message-center-notifications') + 1, 'appended after the indexes before it (later ones follow)');
  const before = yaml.load(execFileSync('git', ['show', 'HEAD:helix-query.yaml'], { encoding: 'utf8' })).indices;
  Object.keys(before).filter((k) => k !== 'articles-airdolomiti-de').forEach((k) => {
    assert.equal(JSON.stringify(indices[k]), JSON.stringify(before[k]), k);
  });
});

test('brands.js: Air Dolomiti\'s German posts index; each language reads its own', async () => {
  assert.deepEqual(BRANDS.airdolomiti.articleIndex, {
    it: '/articoli/query-index.json', en: '/en/articles/query-index.json', de: '/de/artikel/query-index.json',
  });
  Object.entries(BRANDS).filter(([k]) => !['airdolomiti', 'brussels'].includes(k)).forEach(([k, b]) => assert.equal(b.articleIndex, undefined, k));
  const posts = await loadArticles({ key: 'de', lang: 'de' }, BRANDS.airdolomiti);
  assert.deepEqual(posts.map((p) => p.path.split('/')[3]), ['avgeek-de', 'travellers-de', 'did-you-know', 'reiseziele', 'throwback-de'], 'newest first');
  assert.ok(calls.some((c) => c.startsWith('/de/artikel/query-index.json')));
  // www's English description of a German post: as it is (the index takes the meta description)
  assert.equal(posts.find((p) => p.path.endsWith('/flugsimulatoren')).description, 'Flight simulators: how pilots train for every situation');
  calls = [];
  await loadArticles({ key: 'en', lang: 'en' }, BRANDS.airdolomiti);
  await loadArticles({ key: 'it', lang: 'it' }, BRANDS.airdolomiti);
  assert.ok(calls.some((c) => c.startsWith('/en/articles/query-index.json')));
  assert.ok(calls.some((c) => c.startsWith('/articoli/query-index.json')));
  assert.ok(calls.every((c) => !c.startsWith('/de/artikel/')), 'English and Italian as before');
});

test('blog-overview on Air Dolomiti\'s /de/artikel: the German posts, www\'s German category names, German dates', async () => {
  at('/de/artikel');
  document.head.innerHTML = '<meta name="brand" content="airdolomiti"><meta name="language" content="de">';
  assert.equal(getLocale().lang, 'de', 'a German page under /de/');
  const block = document.createElement('div');
  block.className = 'blog-overview';
  document.body.replaceChildren(block);
  try {
    await decorate(block);
  } finally {
    document.head.innerHTML = '';
    at('/');
  }
  const cards = [...block.querySelectorAll('.blog-overview-card')];
  assert.equal(cards.length, 5);
  assert.equal(cards[0].querySelector('.blog-overview-title a').getAttribute('href'), '/de/artikel/avgeek-de/air-dolomiti-hangars-moderne-flugzeugwartung');
  const german = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date('2026-03-31T12:00:00Z'));
  assert.equal(cards[0].querySelector('.blog-overview-info span').textContent, german);
  assert.deepEqual([...block.querySelectorAll('option')].map((o) => o.textContent).slice(1).sort(), ['#DidYouKnow', 'AvGeek', 'Throwback', 'Traumziele', 'Travellers']);
});
