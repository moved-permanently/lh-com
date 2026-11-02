/* eslint-disable max-len, import/no-extraneous-dependencies -- js-yaml is a dev dependency */
/* lh-brussels' indexes (helix-query.yaml, appended at the end): search-be-en, -fr, -nl (copies of
   search-at-en's definition: lh-edge's market route answers Brussels' market roots from them) with
   their lean market-model and market-llms indexes, and articles-be-en, -fr, -nl (the posts one
   level under /be/<ll>/articles/, articles-de-en's properties); every other index as before.
   scripts/brands.js articleIndex: the posts list (blog-overview) of a Brussels page reads its
   language version's index, on a market root too (/be/en/articles listed 0 posts).
   Run: node --max-old-space-size=512 --test test/brussels-indexes.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import yaml from 'js-yaml';

const { indices } = yaml.load(fs.readFileSync('helix-query.yaml', 'utf8'));
const NEW = ['search-be-en', 'search-be-fr', 'search-be-nl', 'articles-be-en', 'articles-be-fr', 'articles-be-nl',
  'market-model-be-en', 'market-llms-be-en', 'market-model-be-fr', 'market-llms-be-fr', 'market-model-be-nl', 'market-llms-be-nl'];

test('helix-query.yaml: Brussels\' indexes appended together (later sites\' after them); every other index as before', () => {
  const keys = Object.keys(indices);
  const at = keys.indexOf(NEW[0]);
  assert.deepEqual(keys.slice(at, at + NEW.length), NEW);
  const before = yaml.load(execFileSync('git', ['show', 'HEAD:helix-query.yaml'], { encoding: 'utf8' })).indices;
  Object.keys(before).filter((k) => !NEW.includes(k)).forEach((k) => {
    assert.equal(JSON.stringify(indices[k]), JSON.stringify(before[k]), k);
  });
});

test('helix-query.yaml: the search indexes as search-at-en\'s for be/en, be/fr, be/nl; the posts one level under articles/', () => {
  ['en', 'fr', 'nl'].forEach((ll) => {
    const search = indices[`search-be-${ll}`];
    assert.deepEqual(search.include, [`/be/${ll}/**`]);
    assert.ok(search.exclude.includes(`/be/${ll}/nav`) && search.exclude.includes(`/be/${ll}/footer`));
    assert.equal(search.target, `/be/${ll}/search-index.json`);
    assert.equal(JSON.stringify(search.properties), JSON.stringify(indices['search-at-en'].properties));
    const posts = indices[`articles-be-${ll}`];
    assert.deepEqual(posts.include, [`/be/${ll}/articles/*`]);
    assert.equal(posts.target, `/be/${ll}/articles/query-index.json`);
    assert.equal(JSON.stringify(posts.properties), JSON.stringify(indices['articles-de-en'].properties));
    assert.equal(indices[`market-model-be-${ll}`].target, `/market-model/be-${ll}.json`);
  });
  // be/en stays in market-pages (lh-com's pilot market root, whose own pages belong there)
  assert.ok(!indices['market-pages'].exclude.includes('/be/en/**'));
});

test('brands.js: Brussels\' posts list reads its language version\'s index, on a market root too', async () => {
  const { window } = (await import('linkedom')).parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
  window.location = {
    hostname: 'main--lh-brussels--moved-permanently.aem.page', pathname: '/gb/en/articles', search: '', href: 'https://main--lh-brussels--moved-permanently.aem.page/gb/en/articles', origin: 'https://main--lh-brussels--moved-permanently.aem.page',
  };
  globalThis.window = window;
  globalThis.document = window.document;
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    if (String(url).startsWith('/be/en/articles/query-index.json')) {
      return Response.json({
        total: 2,
        offset: 0,
        limit: 2,
        data: [{
          path: '/be/en/articles/lyon', title: 'Lyon', 'publication-date': '2026-05-11', 'page-type': 'article',
        }, {
          path: '/be/en/articles/tenerife', title: 'Tenerife', 'publication-date': '2026-06-01', 'page-type': 'article',
        }],
      });
    }
    return new Response('', { status: 404 });
  };
  const { BRANDS } = await import('../scripts/brands.js');
  const { loadArticles } = await import('../scripts/articles.js');
  assert.deepEqual(BRANDS.brussels.articleIndex, {
    en: '/be/en/articles/query-index.json', fr: '/be/fr/articles/query-index.json', nl: '/be/nl/articles/query-index.json',
  });
  const posts = await loadArticles({ key: 'gb/en', lang: 'en' }, BRANDS.brussels);
  assert.deepEqual(posts.map((p) => p.path), ['/be/en/articles/tenerife', '/be/en/articles/lyon'], 'newest first');
  assert.ok(calls.every((c) => c.startsWith('/be/en/articles/query-index.json')), calls.join(' '));
});
