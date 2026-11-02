/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; js-yaml is a dev dependency */
/* SWISS magazine's articles' index (helix-query.yaml magazine-de, magazine-en: scripts/site-languages.js
   SUB_SITES magazine articleIndex): the magazine's pages of the language without nav and footer, with
   articles-be-en's columns (the ones scripts/articles.js reads: title, description, card image,
   page-type, category, tags, author, publication date ...); appended, every other index as before.
   Run: node --max-old-space-size=512 --test test/swiss-magazine-index.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import yaml from 'js-yaml';
import { SUB_SITES } from '../scripts/site-languages.js';

const { indices } = yaml.load(fs.readFileSync('helix-query.yaml', 'utf8'));

test('magazine-de and magazine-en: the magazine\'s pages of the language, articles-be-en\'s columns, the targets SUB_SITES names', () => {
  const mag = SUB_SITES.swiss.find((s) => s.name === 'magazine');
  ['de', 'en'].forEach((ll) => {
    const index = indices[`magazine-${ll}`];
    assert.deepEqual(index.include, [`/magazine/${ll}/**`]);
    assert.ok(index.exclude.includes(`/magazine/${ll}/nav`) && index.exclude.includes(`/magazine/${ll}/footer`));
    assert.equal(index.target, mag.articleIndex[ll]);
    assert.equal(JSON.stringify(index.properties), JSON.stringify(indices['articles-be-en'].properties), ll);
  });
});
