/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; js-yaml is a dev dependency */
/* Site search on lh-cargo and lh-airdolomiti (helix-query.yaml search-brand-en, search-brand-de,
   search-airdolomiti-it): the pages of the two sites in their language's index, the search
   pages, nav and footer out, and no other site's pages in them (helix-query.yaml serves every
   site of the repo: lh-com, ITA, Austrian and Discover have /de/de and /de/en, none has /en or
   Air Dolomiti's Italian folders).
   Run: node --max-old-space-size=512 --test test/brand-search-index.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { indices } = yaml.load(fs.readFileSync(path.join(root, 'helix-query.yaml'), 'utf8'));
const pathsOf = (site) => JSON.parse(fs.readFileSync(path.join(root, `tools/importer/sites/${site}.json`), 'utf8')).paths;

// an index glob: ** any path, * one segment
const globRe = (g) => new RegExp(`^${g.split('/').map((s) => (s === '**' ? '.*' : s.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*'))).join('/').replace(/\/\.\*$/, '(/.*)?')}$`);
const covers = (index, p) => index.include.some((g) => globRe(g).test(p)) && !(index.exclude || []).some((g) => globRe(g).test(p));
const SEARCH_COLUMNS = ['title', 'description', 'headings', 'content', 'hide-in-search', 'lastModified'];

test('the three brand search indexes exist, with the columns the search-results block scores', () => {
  [['search-brand-en', '/en/search-index.json'], ['search-brand-de', '/de/search-index.json'], ['search-airdolomiti-it', '/search-index.json']].forEach(([name, target]) => {
    assert.ok(indices[name], name);
    assert.equal(indices[name].target, target, name);
    SEARCH_COLUMNS.forEach((c) => assert.ok(c in indices[name].properties, `${name}: ${c}`));
  });
});

test('every page of lh-cargo and lh-airdolomiti is in its language\'s index, nav, footer and the search pages are not', () => {
  const byLang = (p) => (p.startsWith('/en/') ? 'search-brand-en' : (p.startsWith('/de/') ? 'search-brand-de' : 'search-airdolomiti-it'));
  [...pathsOf('lh-cargo'), ...pathsOf('lh-airdolomiti')].forEach((p) => {
    const index = indices[byLang(p)];
    const own = /\/(nav|footer|search)$/.test(p) || p === '/index';
    assert.equal(covers(index, p), !own, `${p} in ${byLang(p)}`);
  });
  ['/en/nav', '/en/footer', '/de/nav', '/de/footer', '/en/search', '/de/search'].forEach((p) => assert.ok(!covers(indices[byLang(p)], p), p));
  ['/nav', '/footer', '/search'].forEach((p) => assert.ok(!covers(indices['search-airdolomiti-it'], p), p));
});

test('no other site\'s pages: lh-com\'s, ITA\'s, Austrian\'s and Discover\'s roots stay out', () => {
  const others = [...pathsOf('lh-com'), ...pathsOf('lh-ita'), ...pathsOf('lh-austrian'), ...pathsOf('lh-discover')];
  ['search-brand-en', 'search-brand-de', 'search-airdolomiti-it'].forEach((name) => {
    others.forEach((p) => assert.ok(!covers(indices[name], p), `${p} in ${name}`));
    // and no country root (two letters) among the Italian index's folders
    if (name === 'search-airdolomiti-it') indices[name].include.forEach((g) => assert.ok(!/^\/[a-z]{2}(\/|$)/.test(g), g));
  });
  ['/de/de/home', '/de/en/offers', '/de/de/fluege/x', '/de/en/support/search/search-result'].forEach((p) => assert.ok(!covers(indices['search-brand-de'], p), p));
});
