/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; js-yaml is a dev dependency */
/* Standing order 37, item 2: the article indexes of lufthansa.com's xx language versions (xx/it, xx/fr, xx/es), as
   proposed in tools/reports/parity-2026-11-09/proposal-so36-xx-article-index.md: each is articles-de-en with the paths
   changed, so related-articles and blog-overview read them as every other language's index
   (scripts/articles.js loadArticles: /<market>/<lang>/articles/query-index.json). They stand before SWISS's pair,
   which stays last. Run: node --test test/xx-article-indexes-so37.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import yaml from 'js-yaml';

const { indices } = yaml.load(fs.readFileSync(new URL('../helix-query.yaml', import.meta.url), 'utf8'));
const swap = (v, ll) => JSON.parse(JSON.stringify(v).replaceAll('/de/en/', `/xx/${ll}/`));

test('articles-xx-it, -fr, -es: articles-de-en with the paths changed', () => {
  ['it', 'fr', 'es'].forEach((ll) => {
    const def = indices[`articles-xx-${ll}`];
    assert.ok(def, ll);
    assert.deepEqual(def, swap(indices['articles-de-en'], ll), ll);
    assert.equal(def.target, `/xx/${ll}/articles/query-index.json`);
    assert.deepEqual(def.include, [`/xx/${ll}/articles/*/*`]);
  });
});

test('their place: after the other lufthansa.com indexes, before SWISS\'s pair', () => {
  const keys = Object.keys(indices);
  assert.deepEqual(keys.slice(-5), ['articles-xx-it', 'articles-xx-fr', 'articles-xx-es', 'search-medicalservices-en', 'search-medicalservices-de']);
});
