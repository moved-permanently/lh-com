/* SWISS's search pages (tools/importer/swiss-search-pages.mjs): one per ch language and own root,
   the root's own index, labels for the languages the search-results block has no texts for. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  ROOTS, CH_LANGUAGES, HEADINGS, LABELS, searchPage, contentDirOf,
} from '../tools/importer/swiss-search-pages.mjs';
import { SWISS_OWN_ROOTS } from '../scripts/brands.js';

const block = fs.readFileSync('blocks/search-results/search-results.js', 'utf8');
const defaultsOf = (lang) => (block.match(new RegExp(`\\n  ${lang}: \\{([\\s\\S]*?)\\n  \\},`)) || [])[1];
const keysOf = (src) => [...src.matchAll(/'([a-z ]+ label)':/g)].map((m) => m[1]);

test('a page for the ten ch languages and every own root (kr/ko)', () => {
  assert.deepEqual(CH_LANGUAGES, ['en', 'de', 'fr', 'it', 'es', 'pt', 'zh', 'ja', 'el', 'ru']);
  assert.deepEqual(ROOTS, [...CH_LANGUAGES.map((l) => `ch/${l}`), ...Object.keys(SWISS_OWN_ROOTS)]);
  assert.ok(ROOTS.includes('kr/ko'));
  ROOTS.forEach((r) => assert.ok(HEADINGS[r.split('/')[1]], r));
  assert.match(contentDirOf('ch/zh'), /content-sites\/lh-swiss\/content$/);
  assert.match(contentDirOf('kr/ko'), /content-sites\/lh-swiss-mk\/content$/);
});

test('lh-swiss.json paths: every search page (the importers link them relative, as the site\'s pages)', () => {
  const { paths } = JSON.parse(fs.readFileSync('tools/importer/sites/lh-swiss.json', 'utf8'));
  ROOTS.forEach((r) => assert.ok(paths.includes(`/${r}/search-results`), r));
});

test('the block reads the page root\'s index (no index row): the market roots search their own', () => {
  ROOTS.forEach((r) => {
    const doc = searchPage(r);
    const cells = doc.match(/<div class="search-results">(.*?)<\/div><div class="metadata">/)[1];
    assert.ok(!/search-index\.json/.test(doc), r);
    assert.ok(!/<div><div>[^<]*<\/div><\/div>(?!<div>)/.test(cells.replace(/<div><div>[^<]*<\/div><div>[^<]*<\/div><\/div>/g, '')), `${r}: only two-cell rows`);
  });
});

test('labels: every text of the block for the languages it has none for, none for en, de, fr, es', () => {
  const keys = keysOf(defaultsOf('en'));
  assert.equal(keys.length, 12);
  ['en', 'de', 'fr', 'es'].forEach((l) => {
    assert.ok(defaultsOf(l), `the block has ${l}`);
    assert.ok(!LABELS[l], l);
    assert.ok(!/label<\/div>/.test(searchPage(`ch/${l}`)), l);
  });
  ['it', 'pt', 'zh', 'ja', 'el', 'ru', 'ko'].forEach((l) => {
    assert.ok(!defaultsOf(l), `the block has no ${l}`);
    assert.deepEqual(Object.keys(LABELS[l]).map((k) => k.toLowerCase()), keys, l);
    assert.match(LABELS[l]['Search for label'], /\{QUERY\}/, l);
    assert.match(LABELS[l]['Results label'], /\{NUMBER\}/, l);
    assert.match(LABELS[l]['Page label'], /\{PAGE\}/, l);
  });
  // the input label: www's FAQ search bar placeholder
  assert.equal(LABELS.ko['Input label'], '주제 검색');
  assert.equal(LABELS.zh['Input label'], '搜索主题');
});

test('metadata: the root\'s nav and footer, noindex, hidden from the search, no markets row, the homepage as parent', () => {
  const doc = searchPage('ch/zh');
  assert.match(doc, /^<div><h1>搜索结果<\/h1><div class="search-results">/);
  assert.match(doc, /<div><div>nav<\/div><div>\/ch\/zh\/nav<\/div><\/div><div><div>footer<\/div><div>\/ch\/zh\/footer<\/div><\/div>/);
  assert.match(doc, /<div><div>Robots<\/div><div>noindex, nofollow<\/div><\/div>/);
  assert.match(doc, /<div><div>Title<\/div><div>搜索结果 \| SWISS<\/div><\/div>/);
  assert.match(doc, /<div><div>hide-in-search<\/div><div>true<\/div><\/div>/);
  assert.match(doc, /<div><div>Parent<\/div><div><a href="\/ch\/zh\/homepage">\/ch\/zh\/homepage<\/a><\/div><\/div>/);
  assert.ok(!/markets/i.test(doc));
  assert.match(searchPage('kr/ko'), /<div><div>nav<\/div><div>\/kr\/ko\/nav<\/div>/);
});
