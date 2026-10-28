/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; js-yaml is a dev dependency */
/* The lean indexes of lh-edge's market model (helix-query.yaml market-model-*, market-llms-*):
   the same pages and property definitions as the full indexes they mirror, so their totals and
   values match (lh-edge uses a lean index only while its total equals the full one's).
   Run: node --test test/*.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { leanDefinitions, ROOTS } from '../tools/markets/lean-indexes.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { indices } = yaml.load(fs.readFileSync(path.join(root, 'helix-query.yaml'), 'utf8'));

test('helix-query.yaml has every lean index, defined as the full index it mirrors', () => {
  const defs = leanDefinitions(indices);
  assert.equal(Object.keys(defs).length, (ROOTS.length + 1) * 2);
  Object.entries(defs).forEach(([name, def]) => assert.deepEqual(indices[name], def, name));
});

test('a lean index covers the pages of its full index (same include and exclude) and only lh-edge\'s columns', () => {
  ROOTS.forEach((r) => {
    const full = indices[`search-${r.replace('/', '-')}`];
    const model = indices[`market-model-${r.replace('/', '-')}`];
    assert.deepEqual([model.include, model.exclude], [full.include, full.exclude], r);
    assert.equal(model.target, `/market-model/${r.replace('/', '-')}.json`);
    assert.ok(!('content' in model.properties) && !('headings' in model.properties), `${r}: no search columns`);
  });
  assert.deepEqual(indices['market-llms-own'].include, indices['market-pages'].include);
  assert.deepEqual(indices['market-llms-own'].exclude, indices['market-pages'].exclude);
});
