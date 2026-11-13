/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; js-yaml is a dev dependency */
/* SWISS's language versions' indexes (helix-query.yaml language-ch-<ll>, lh-edge src/sites.js
   SITE_INDEX_PATHS): the market roots answer from them (their markets column), so each has
   search-be-en's columns; their target is /ch/<ll>/language-index.json, never a
   /ch/<ll>/search-index.json (helix-query.yaml serves every site: lh-com's ch/en and ch/de are
   market roots whose search index lh-edge builds; a file of that path would be answered instead).
   Run: node --max-old-space-size=512 --test test/swiss-language-index.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import yaml from 'js-yaml';
import { withoutSwissContentCap } from './query-later.mjs';

// SWISS's ch/el and ch/ru content cap (standing order 11) read as before (test/query-later.mjs)
const indices = withoutSwissContentCap(yaml.load(fs.readFileSync('helix-query.yaml', 'utf8')).indices);
const LANGS = ['en', 'de', 'fr', 'it', 'es', 'zh', 'pt', 'el', 'ja', 'ru'];

test('language-ch-<ll>: SWISS\'s ten ch roots, nav, footer, fragments and confirmations out, search-be-en\'s columns, target language-index.json', () => {
  LANGS.forEach((ll) => {
    const index = indices[`language-ch-${ll}`];
    assert.deepEqual(index.include, [`/ch/${ll}/**`]);
    assert.ok(index.exclude.includes(`/ch/${ll}/nav`) && index.exclude.includes(`/ch/${ll}/footer`), ll);
    assert.equal(index.target, `/ch/${ll}/language-index.json`);
    assert.equal(JSON.stringify(index.properties), JSON.stringify(indices['search-be-en'].properties), ll);
    assert.ok('markets' in index.properties);
  });
});

test('no index writes a /ch/<ll>/search-index.json (lh-com\'s ch market roots)', () => {
  assert.equal(Object.values(indices).filter((i) => /^\/ch\/[a-z]{2}\/search-index\.json$/.test(i.target || '')).length, 0);
});

test('language-kr-ko: SWISS\'s own root kr/ko (its search page\'s index) as the ch roots\', target language-index.json, no /kr/ko/search-index.json', () => {
  const index = indices['language-kr-ko'];
  assert.deepEqual(index.include, ['/kr/ko/**']);
  assert.deepEqual(index.exclude, indices['language-ch-en'].exclude.map((x) => x.replace('/ch/en/', '/kr/ko/')));
  assert.equal(index.target, '/kr/ko/language-index.json');
  assert.equal(JSON.stringify(index.properties), JSON.stringify(indices['language-ch-en'].properties));
  assert.ok('hide-in-search' in index.properties);
  assert.equal(Object.values(indices).filter((i) => i.target === '/kr/ko/search-index.json').length, 0);
});
