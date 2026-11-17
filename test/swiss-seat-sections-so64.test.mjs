/* eslint-disable max-len */
/* Standing order 64, item 1 (SWISS, advance-seat-reservation's seat sections against swiss-parity-002b): a spaced Features
   accordion between two picture-and-text rows keeps www's space, 72 px above and below from 768 px, on phones 28 px more
   above it and 32 px below it (www: the rows' 32 px column views, the maui accordion's 20 px / 0 on phones, 40 / 40 from
   768 px); the disclaimers in www's small print are a delta list (14 READY inserts on ch/en). lh-com's own spaced rule stays.
   Run: node --max-old-space-size=256 --test test/swiss-seat-sections-so64.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { listPaths } from '../tools/importer/text-inserts-apply.mjs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const css = read('styles/themes/swiss.css').replace(/\s+/g, ' ');
const block = read('blocks/accordion-columns/accordion-columns.css').replace(/\s+/g, ' ');
const after = 'body\\.brand-swiss main \\.columns-media-wrapper \\+ \\.accordion-columns-wrapper > \\.accordion-columns\\.spaced';
const before = 'body\\.brand-swiss main \\.accordion-columns-wrapper:has\\(\\+ \\.columns-media-wrapper\\) > \\.accordion-columns\\.spaced';

test('SWISS: on phones 28 px above a spaced accordion right after a picture row, 8 px below one right before a row', () => {
  assert.match(css, new RegExp(`(\\*/|\\}) ${after} \\{ padding-top: 28px; \\}`));
  assert.match(css, new RegExp(`\\} ${before} \\{ padding-bottom: 8px; \\}`));
});

test('SWISS: from 768 px 48 px above and below (www 72 px with the 24 px block gap)', () => {
  assert.match(css, new RegExp(`@media \\(width >= 768px\\) \\{ ${after} \\{ padding-top: 48px; \\} ${before} \\{ padding-bottom: 48px; \\} \\}`));
});

test('lh-com\'s spaced accordion as it was (lufthansa.com keeps its 40 px)', () => {
  assert.match(block, /\.accordion-columns\.spaced \{ padding-bottom: 40px; \}/);
  assert.match(block, /@media \(width >= 768px\) \{ \.accordion-columns\.spaced \{ padding-top: 40px; \} \}/);
});

test('the small-print list: one READY path, 14 inserts of " {copytext-small}", each anchored at the end of a disclaimer paragraph', () => {
  const list = read('tools/reports/parity-2026-11-09/delta-so64-swiss-advance-seat-small-print.txt');
  assert.deepEqual([...new Set(listPaths(list))], ['/ch/en/book-and-manage/swiss-choice/advance-seat-reservation']);
  const [row, ...rest] = JSON.parse(read('tools/reports/parity-2026-11-09/delta-so64-swiss-advance-seat-small-print.json'));
  assert.equal(rest.length, 0);
  assert.equal(row.inserts.length, 14);
  row.inserts.forEach((i) => {
    assert.equal(i.text, ' {copytext-small}');
    assert.ok(i.before.startsWith('</p></div></div></div>'));
  });
});

test('the Group for Business member endings: ten READY paths, experts-members held', () => {
  const list = read('tools/reports/parity-2026-11-09/delta-so64-b2b-member-empty-ending.txt');
  const ready = [...new Set(listPaths(list))].sort();
  const want = ['fund', 'history', 'home', 'lhghome', 'reports'].flatMap((p) => [`/de/de/${p}`, `/de/en/${p}`]).sort();
  assert.deepEqual(ready, want);
  const data = JSON.parse(read('tools/reports/parity-2026-11-09/delta-so64-b2b-member-empty-ending.json'));
  assert.deepEqual(data.map((d) => d.path).sort(), want);
  data.forEach((d) => assert.deepEqual(d.inserts, [{ replace: '</div><div><div class="metadata">', text: '<div class="metadata">' }]));
});
