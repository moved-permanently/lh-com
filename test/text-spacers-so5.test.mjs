/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 5 of 2026-11-11, item 1 (ema-cashub's row 2): www's empty paragraphs in running text.
   - the delta for DA's copies (tools/importer/text-spacers-apply.mjs): a {spacer-N} between the two texts www's empty
     paragraphs stand between, N from www's gap at 1440 / 390 less our paragraph margin and the marker's 1 px; only in a
     section's own content, between running text and running text or an H2; idempotent;
   - the import (nbsp-guard.mjs emptyParagraphSpacers, Brussels): <p></p> and <p><br></p> between two text paragraphs;
   - the collapse keeps a spacer of 31 px or less between running text on a theme with textSpacers (Brussels only). */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { applyTextSpacers, spacerSize, listPaths } from '../tools/importer/text-spacers-apply.mjs';
import { emptyParagraphSpacers } from '../tools/importer/nbsp-guard.mjs';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';
import { themeFor } from '../scripts/style-markers.js';

const row = (o) => ({
  site: 'brussels', path: '/x', kind: 'nbsp', after: '', before: '', ...o,
});
const doc = '<div><h1>Title</h1><p>Last updated on 19.08.2025</p><h2>INTRODUCTION</h2><p>We, Brussels Airlines, inform you.</p><p>Second paragraph.</p><ul><li>One</li></ul><div class="columns-media"><div><div><p>In a cell.</p><p>Also in a cell.</p></div></div></div></div>';

test('the size: www\'s gap less our paragraph margin at each width, the mean, less the marker\'s 1 px', () => {
  assert.deepEqual(spacerSize(row({ gap1440: 64, gap390: 56 })), { n: 41 });
  assert.deepEqual(spacerSize(row({ gap1440: 52, gap390: 42 })), { n: 28 });
  assert.deepEqual(spacerSize(row({ gap1440: 64 })), { n: 43 }, 'one width only');
  assert.equal(Boolean(spacerSize(row({ gap1440: 26, gap390: 22 })).skip), true, 'under 8 px: nothing');
  assert.equal(Boolean(spacerSize(row({})).skip), true, 'no gap: nothing');
});

test('the delta: a marker between a paragraph and an H2, and between two paragraphs', () => {
  const { html, results } = applyTextSpacers(doc, [
    row({
      after: 'Last updated on 19.08.2025', before: 'INTRODUCTION', gap1440: 64, gap390: 56,
    }),
    row({
      after: 'inform you.', before: 'Second paragraph.', gap1440: 64, gap390: 56,
    }),
  ]);
  assert.deepEqual(results.map((r) => r.result), ['{spacer-41}', '{spacer-41}']);
  assert.equal(html.includes('<p>Last updated on 19.08.2025</p><p>{spacer-41}</p><h2>INTRODUCTION</h2>'), true);
  assert.equal(html.includes('<p>We, Brussels Airlines, inform you.</p><p>{spacer-41}</p><p>Second paragraph.</p>'), true);
  // a second run leaves it (idempotent)
  const again = applyTextSpacers(html, [row({
    after: 'Last updated on 19.08.2025', before: 'INTRODUCTION', gap1440: 64, gap390: 56,
  })]);
  assert.equal(again.results[0].result, 'not found', 'the text after it is the marker now');
  const twice = applyTextSpacers(html, [row({ after: 'inform you.', gap1440: 64, gap390: 56 })]);
  assert.equal(twice.results[0].result, 'present');
  assert.equal(twice.html.split('{spacer-41}').length, 3, 'no second marker');
});

test('the delta leaves block cells, a block after the text, a heading before it, missing places', () => {
  const rows = [
    row({
      after: 'In a cell.', before: 'Also in a cell.', gap1440: 64, gap390: 56,
    }),
    row({
      after: 'One', before: 'In a cell.', gap1440: 64, gap390: 56,
    }),
    row({
      after: '', before: 'We, Brussels Airlines', gap1440: 64, gap390: 56,
    }),
    row({
      after: 'not on the page', before: '', gap1440: 64, gap390: 56,
    }),
    row({
      after: '', before: '', gap1440: 64, gap390: 56,
    }),
  ];
  const { html, results } = applyTextSpacers(doc, rows);
  assert.equal(html.includes('{spacer-'), false, 'nothing written');
  assert.deepEqual(results.map((r) => r.result.replace(/ \(.*/, '')), ['not found', 'not between running text', 'not between running text', 'not found', 'no text around']);
});

test('the import: an empty paragraph between two text paragraphs as {spacer-17}, an empty line as {spacer-40}', () => {
  const opts = { parse: parseHTML, emptySize: 17, brSize: 40 };
  const page = (inner) => `<html><body><div class="richtext">${inner}</div></body></html>`;
  assert.equal(emptyParagraphSpacers(page('<p>a</p><p></p><p>b</p>'), opts), page('<p>a</p><p>{spacer-17}</p><p>b</p>'));
  assert.equal(emptyParagraphSpacers(page('<p>a</p><p><br></p><ul><li>b</li></ul>'), opts), page('<p>a</p><p>{spacer-40}</p><ul><li>b</li></ul>'));
  // at a container's start or end, before a heading, in a panel, or without sizes: the snapshot as it is
  [page('<p></p><p>b</p>'), page('<p>a</p><p></p>'), page('<p>a</p><p></p><h2>b</h2>'),
    '<html><body><div class="accordion"><p>a</p><p></p><p>b</p></div></body></html>'].forEach((html) => {
    assert.equal(emptyParagraphSpacers(html, opts), html);
  });
  assert.equal(emptyParagraphSpacers(page('<p>a</p><p></p><p>b</p>'), { parse: parseHTML }), page('<p>a</p><p></p><p>b</p>'));
  const src = fs.readFileSync(new URL('../tools/importer/brussels-import.mjs', import.meta.url), 'utf8');
  assert.equal(src.includes('const withEmptyParagraphSpacers = (html) => emptyParagraphSpacers(html, { parse: parseHTML, emptySize: 17, brSize: 40 });'), true);
  assert.equal(/const mapped = withEmptyParagraphSpacers\(withEmptyLineSpacers\(/.test(src), true, 'after the empty lines');
});

test('the collapse keeps a small spacer between running text on Brussels only, the same on a second run', () => {
  assert.equal(themeFor('brussels').textSpacers, true);
  assert.equal(Boolean(themeFor('b2b').textSpacers), false);
  assert.equal(Boolean(themeFor('lufthansa').textSpacers), false);
  const html = '<div><h1>T</h1><p>a</p><p>{spacer-17}</p><p>b</p><p>{spacer-17}</p><div class="cards"><div><div>c</div></div></div></div>';
  const once = collapseHtml(html, {
    path: '/be/en/x', brand: 'brussels', parse: parseHTML, force: true,
  }).html;
  assert.equal(once.includes('<p>a</p><p>{spacer-17}</p><p>b</p>'), true, 'between two paragraphs: kept');
  assert.equal(once.split('{spacer-17}').length, 2, 'before a block: dropped as before');
  assert.equal(collapseHtml(once, {
    path: '/be/en/x', brand: 'brussels', parse: parseHTML, force: true,
  }).html.split('{spacer-17}').length, 2, 'second run');
  const lh = collapseHtml(html, {
    path: '/de/en/x', brand: 'lufthansa', parse: parseHTML, force: true,
  }).html;
  assert.equal(lh.includes('{spacer-17}'), false, 'other brands: dropped as before');
});

test('the list: a reimport list gives its READY rows only; the Brussels list as released', () => {
  assert.deepEqual(listPaths('# head\n/a\tdelta\tres\tREADY\n/b\tdelta\tres\tHOLD (worse)\n/c\n'), ['/a', '/c']);
  const list = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/reimport-so5-brussels-text-spacers.txt', import.meta.url), 'utf8');
  assert.deepEqual(listPaths(list), ['/ao/fr/legal-notices/aviation-services-law', '/be/en/legal-notices/privacy-notice-applicants', '/be/en/legal-notices/short-notice-eu-us']);
  const data = JSON.parse(fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/text-spacers-so5.json', import.meta.url), 'utf8'));
  assert.equal(listPaths(list).every((p) => data.some((r) => r.site === 'brussels' && r.path === p)), true, 'every READY row has data');
});
