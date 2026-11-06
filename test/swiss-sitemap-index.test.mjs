/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; js-yaml is a dev dependency */
/* SWISS's sitemap indexes (brief 349, helix-query.yaml sitemap-ch-<ll>): per language version the
   few columns a sitemap needs (robots: the page's own page-robots, as language-ch-<ll>; the last
   modification), the same pages as language-ch-<ll> (its include and exclude), target
   /ch/<ll>/sitemap-index.json; lh-edge's ch/<ll> sitemaps read it once it is filled
   (src/site-sitemaps.js). The existing indexes stay as they are.
   Run: node --max-old-space-size=512 --test test/swiss-sitemap-index.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import yaml from 'js-yaml';

const { indices } = yaml.load(fs.readFileSync('helix-query.yaml', 'utf8'));
const LANGS = ['en', 'de', 'fr', 'it', 'es', 'zh', 'pt', 'el', 'ja', 'ru'];

test('sitemap-ch-<ll>: the language index\'s pages, robots and lastModified only, target sitemap-index.json', () => {
  LANGS.forEach((ll) => {
    const index = indices[`sitemap-ch-${ll}`];
    const language = indices[`language-ch-${ll}`];
    assert.ok(index, ll);
    assert.deepEqual(index.include, language.include, ll);
    assert.deepEqual(index.exclude, language.exclude, ll);
    assert.equal(index.target, `/ch/${ll}/sitemap-index.json`);
    assert.deepEqual(Object.keys(index.properties), ['robots', 'lastModified'], ll);
    assert.deepEqual(index.properties.robots, language.properties.robots, `${ll}: the page's own robots`);
    assert.deepEqual(index.properties.lastModified, language.properties.lastModified, ll);
  });
});

test('the existing indexes as they were (only sitemap-ch-<ll> added)', () => {
  const before = yaml.load(execFileSync('git', ['show', '29b2db6:helix-query.yaml'], { encoding: 'utf8' })).indices;
  // since then: market-pages' markets column (brief 411, lh-edge's donor documents) and the query
  // indexes of lh-com's language versions xx/it, xx/el, xx/ja, xx/ko, xx/pl (batches 17-21), nothing else
  const { markets, ...pagesBefore } = indices['market-pages'].properties;
  assert.deepEqual(markets, indices['market-model-own'].properties.markets);
  const now = { ...indices, 'market-pages': { ...indices['market-pages'], properties: pagesBefore } };
  Object.entries(before).forEach(([name, index]) => assert.deepEqual(now[name], index, name));
  // and Cargo's es, fr, it, pt indexes (brief 414, test/cargo-languages.test.mjs)
  const cargo = ['es', 'fr', 'it', 'pt'].map((ll) => `search-brand-${ll}`);
  const versions = ['it', 'el', 'ja', 'ko', 'pl'].flatMap((ll) => [`search-xx-${ll}`, `market-model-xx-${ll}`, `market-llms-xx-${ll}`]);
  assert.deepEqual(Object.keys(indices).filter((n) => !(n in before)).sort(), [...cargo, ...LANGS.map((ll) => `sitemap-ch-${ll}`), ...versions].sort());
});
