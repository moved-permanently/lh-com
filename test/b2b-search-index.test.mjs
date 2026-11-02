/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; js-yaml is a dev dependency */
/* Site search on lh-b2b (Lufthansa Group for Business): its de/en and de/de documents are in
   lh-com's search-de-en and search-de-de (helix-query.yaml serves every site of the repo; no
   index of its own: a second index of the same target would compete), with the columns the
   search-results block scores and lh-edge's market route reads (markets), and the lean
   market-model indexes of both; nav, footer and the confirmation pages out. helix-query.yaml unchanged by B2B.
   Run: node --max-old-space-size=512 --test test/b2b-search-index.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { indices } = yaml.load(fs.readFileSync(path.join(root, 'helix-query.yaml'), 'utf8'));
const { paths } = JSON.parse(fs.readFileSync(path.join(root, 'tools/importer/sites/lh-b2b.json'), 'utf8'));

// an index glob: ** any path, * one segment
const globRe = (g) => new RegExp(`^${g.split('/').map((s) => (s === '**' ? '.*' : s.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*'))).join('/').replace(/\/\.\*$/, '(/.*)?')}$`);
const covers = (index, p) => index.include.some((g) => globRe(g).test(p)) && !(index.exclude || []).some((g) => globRe(g).test(p));
const COLUMNS = ['title', 'description', 'headings', 'content', 'hide-in-search', 'markets', 'primary-language-url', 'lastModified'];

test('lh-b2b: search-de-en and search-de-de exist with the search and market columns, and their lean market models', () => {
  [['search-de-en', '/de/en/search-index.json', 'market-model-de-en'], ['search-de-de', '/de/de/search-index.json', 'market-model-de-de']].forEach(([name, target, model]) => {
    assert.equal(indices[name].target, target, name);
    COLUMNS.forEach((c) => assert.ok(c in indices[name].properties, `${name}: ${c}`));
    assert.ok(indices[model], model);
  });
  assert.equal(Object.values(indices).filter((i) => ['/de/en/search-index.json', '/de/de/search-index.json'].includes(i.target)).length, 2, 'one index per target');
});

test('lh-b2b: every de/en and de/de document is in its language version\'s index; nav, footer and the confirmation pages are not', () => {
  const de = paths.filter((p) => /^\/de\/(en|de)\//.test(p));
  assert.ok(de.length > 500, `${de.length} documents`);
  de.forEach((p) => {
    const name = `search-de-${p.split('/')[2]}`;
    assert.equal(covers(indices[name], p), !/\/(nav|footer|[^/]*confirmation)$/.test(p), `${p} in ${name}`);
  });
});
