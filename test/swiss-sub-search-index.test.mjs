/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; js-yaml is a dev dependency */
/* SWISS's corporate site search (lh-swiss /corporate/<ll>/search-results: the search-results block
   on /corporate/<ll>/search-index.json, tools/importer/swiss-sub-import.mjs): one index per
   language (en, de, fr) with the columns the block scores; nav, footer, the search page and the
   success pages out; medical services has no search page (www's has no results page) and no index.
   Run: node --max-old-space-size=512 --test test/swiss-sub-search-index.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { indices } = yaml.load(fs.readFileSync(path.join(root, 'helix-query.yaml'), 'utf8'));
const globRe = (g) => new RegExp(`^${g.split('/').map((s) => (s === '**' ? '.*' : s.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*'))).join('/').replace(/\/\.\*$/, '(/.*)?')}$`);
const covers = (index, p) => index.include.some((g) => globRe(g).test(p)) && !(index.exclude || []).some((g) => globRe(g).test(p));
const COLUMNS = ['title', 'description', 'image', 'headings', 'content', 'hide-in-search', 'lastModified'];

test('search-corporate-en, -de, -fr: the corporate pages of the language, with the search columns', () => {
  ['en', 'de', 'fr'].forEach((ll) => {
    const index = indices[`search-corporate-${ll}`];
    assert.equal(index.target, `/corporate/${ll}/search-index.json`);
    COLUMNS.forEach((c) => assert.ok(c in index.properties, `${ll}: ${c}`));
    assert.ok(covers(index, `/corporate/${ll}/homepage`));
    assert.ok(covers(index, `/corporate/${ll}/careers/professional-fields/pilots`));
    ['nav', 'footer', 'search-results', 'media/media-request-form/media-request-form-success'].forEach((p) => assert.ok(!covers(index, `/corporate/${ll}/${p}`), `${ll}: ${p} out`));
    assert.ok(!covers(index, `/corporate/${ll === 'en' ? 'de' : 'en'}/homepage`), 'the other languages out');
    assert.equal(Object.values(indices).filter((i) => i.target === index.target).length, 1, 'one index per target');
  });
  assert.ok(!Object.values(indices).some((i) => (i.include || []).some((g) => g.startsWith('/medicalservices'))), 'no medical services index');
});
