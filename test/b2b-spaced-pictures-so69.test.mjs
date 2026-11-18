/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 69 (2026-11-18), items 1 and 2 (token-free).
   - Item 2: the block option spaced-pictures (Group for Business: a Columns Media cell's picture 80 px above the heading
     after it, www's column-view picture to headline) in place of businesstogo's {spacer-39} paragraphs; the rows
     (delta-so69-b2b-businesstogo-token-free) take every style marker out of the four businesstogo documents.
   - Item 1: SWISS gives an aside that starts with a Spacer block 20 px above it (20 + M = www's 80 px on phones).
   Strings only in assertions (no DOM node goes into one).
   Run: node --max-old-space-size=256 --test test/b2b-spaced-pictures-so69.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BLOCK_OPTIONS, BLOCK_OPTION_LABELS, readBlockOptions } from '../scripts/style-markers.js';
import { applyTextInserts, removeTextInserts, listPaths } from '../tools/importer/text-inserts-apply.mjs';

const read = (f) => fs.readFileSync(new URL(f, import.meta.url), 'utf8');
const TOKEN = /\{(spacer|heading|copytext|column|cell)[^}]*\}/g;

test('spaced-pictures: a block option with a label, a B2B rule only (80 px under a picture before a heading)', () => {
  assert.ok(BLOCK_OPTIONS['spaced-pictures'] && BLOCK_OPTION_LABELS['spaced-pictures']);
  assert.equal(readBlockOptions(['columns-media', 'spaced-pictures']).pictures, 'spaced');
  const b2b = read('../styles/themes/b2b.css');
  const rule = b2b.match(/body\.brand-b2b main \.columns-media\.spaced-pictures [^{]*\{[^}]*\}/);
  assert.ok(rule, 'the B2B rule');
  assert.match(rule[0], /:has\(\+ :is\(h2, h3, h4, h5, h6\)\)/);
  assert.match(rule[0], /margin-bottom: 80px/);
  const others = fs.readdirSync(new URL('../styles/themes/', import.meta.url)).filter((f) => f !== 'b2b.css' && f.endsWith('.css'));
  others.forEach((f) => assert.doesNotMatch(read(`../styles/themes/${f}`), /spaced-pictures/, f));
  assert.match(read('../tools/importer/marker-collapse-cli.mjs'), /'spaced-pictures'/);
});

test('the delta list: the four businesstogo documents READY, every insert takes a token out and puts none in', () => {
  const list = read('../tools/reports/parity-2026-11-09/delta-so69-b2b-businesstogo-token-free.txt');
  const data = JSON.parse(read('../tools/reports/parity-2026-11-09/delta-so69-b2b-businesstogo-token-free.json'));
  const paths = ['/de/de/program/businesstogo', '/de/en/program/businesstogo', '/xx/de/program/businesstogo', '/xx/en/program/businesstogo'];
  assert.deepEqual([...new Set(listPaths(list))].sort(), paths);
  assert.deepEqual(data.map((d) => d.path).sort(), paths);
  assert.doesNotMatch(list, /overview-manage/);
  data.forEach(({ path, inserts }) => {
    inserts.forEach(({ replace, text }) => {
      assert.equal(typeof replace, 'string', path);
      // no insert adds a {…} its anchor lacks, and the replaced text loses at least one token or gains an option
      const had = (replace.match(TOKEN) || []).length;
      const has = (text.match(TOKEN) || []).length;
      assert.equal(has, 0, `${path}: ${text.slice(0, 60)}`);
      assert.ok(had > 0 || /spaced-pictures/.test(text), `${path}: ${replace.slice(0, 60)}`);
    });
    const de = path.endsWith('/de/program/businesstogo');
    assert.equal(inserts.length, de ? 8 : 7, path);
    assert.equal(inserts.filter((x) => /\{spacer-39\}/.test(x.replace)).length, 4, path);
    assert.equal(inserts.filter((x) => /spaced-pictures/.test(x.text)).length, 1, path);
    if (de) {
      assert.ok(inserts.some((x) => /\{column-start-outer\}/.test(x.replace) && x.text.startsWith('<div class="spacer from-768">')), path);
      assert.ok(inserts.some((x) => /\{spacer-140\}/.test(x.replace) && (x.text.match(/<div class="spacer l">/g) || []).length === 2), path);
    } else {
      assert.ok(inserts.some((x) => /title-compact/.test(x.replace) && /h3-compact spaced-pictures/.test(x.text)), path);
    }
  });
});

test('applied to a copy shaped as DA\'s: no token left, byte for byte back, a second run present', () => {
  const data = JSON.parse(read('../tools/reports/parity-2026-11-09/delta-so69-b2b-businesstogo-token-free.json'));
  data.forEach(({ path, inserts }) => {
    // the anchors in document order, joined by a neutral paragraph: DA's copy reduced to what the rows touch
    const doc = `<body><header></header><main><div>${inserts.map((x) => x.replace).join('<p>x</p>')}</div></main><footer></footer></body>`;
    const r = applyTextInserts(doc, inserts);
    assert.ok(r.results.every((x) => x === 'inserted'), `${path}: ${r.results.join(',')}`);
    assert.equal((r.html.match(TOKEN) || []).length, 0, path);
    assert.equal(removeTextInserts(r.html, r.inserts) === doc, true, path);
    assert.equal(applyTextInserts(r.html, inserts).results.every((x) => x === 'present'), true, path);
  });
});

test('SWISS: an aside that starts with a spacer 20 px under the content on phones, after order 67\'s 60 px rule', () => {
  const css = read('../styles/themes/swiss.css');
  const i67 = css.indexOf('.section-aside:not(:empty, :has(> .default-content-wrapper:first-child > p.spacer:first-child))');
  const i69 = css.indexOf('.section-aside:has(> .default-content-wrapper:first-child > p.spacer:first-child) {');
  assert.ok(i67 > 0 && i69 > i67);
  const block = css.slice(css.lastIndexOf('@media', i69), css.indexOf('}', i69) + 1);
  assert.match(block, /@media \(width < 768px\)/);
  assert.match(block, /margin-top: 20px/);
});
