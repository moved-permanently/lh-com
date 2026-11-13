/* eslint-disable max-len, import/extensions -- dev tooling */
/* A whole section into DA's copy (standing order 10 of 2026-11-13, item 3: /it/en/book-and-prepare/other-requests/
   travelling-with-pets/pets-in-cabin -3.0 % at 1440, ita-parity-005): www draws "Refunds" and "Traveling with guide dogs
   and service dogs" as two grey bands, 40 px of white between them (20 on phones); DA's copy has them as consecutive
   grey sections, which our styles join into one band (the guide dogs' heading 16 px under the refunds text, www 104).
   tools/importer/ita-insert-apply.mjs's row option `section` puts the HTML (here a section of style gap with two
   spacers, as lufthansa-sections writes between two grey bands) right before the section whose first element's text
   starts with `before`; refused when that element is not a section's first, is not found once, or the inserted text
   is there already.
   Run: node --test test/ita-insert-section-594.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyInserts } from '../tools/importer/ita-insert-apply.mjs';

const meta = (rows) => `<div class="section-metadata">${rows.map(([k, v]) => `<div><div><p>${k}</p></div><div><p>${v}</p></div></div>`).join('')}</div>`;
const GAP = `<div><p>{spacer-20}</p><p>{spacer-20 from-768}</p>${meta([['style', 'gap'], ['markets', '-au/en']])}</div>`;
const DA = `<body><header></header><main><div><h2>Refunds</h2>${meta([['style', 'flush, column-band, grey']])}</div><div><div class="columns-media"><div><div><h2>Traveling with guide dogs and service dogs</h2></div></div></div>${meta([['style', 'flush, column-band, grey'], ['markets', '-au/en']])}</div><div><h2>Related Topics</h2></div></main><footer></footer></body>`;
const ROW = {
  before: 'Traveling with guide dogs and service dogs', html: GAP, text: '{spacer-20 from-768}', section: true,
};

test('the section goes right before the section that starts with the element', () => {
  const r = applyInserts(DA, [ROW]);
  assert.deepEqual(r.problems, []);
  assert.equal(r.html, DA.replace('<div><div class="columns-media">', `${GAP}<div><div class="columns-media">`));
});

test('refused: the element not a section\'s first, or the text there already', () => {
  assert.ok(applyInserts(DA, [{
    ...ROW, before: 'Related Topics', html: GAP, text: 'x-not-there',
  }]).problems.length === 0, 'a first element: placed');
  const notFirst = DA.replace('<div><h2>Refunds</h2>', '<div><p>Intro</p><h2>Refunds</h2>');
  assert.ok(applyInserts(notFirst, [{ ...ROW, before: 'Refunds' }]).problems.length, 'not a section\'s first element');
  const once = applyInserts(DA, [ROW]).html;
  assert.ok(applyInserts(once, [ROW]).problems.length, 'there already');
});

test('the data and the list agree: each path a READY row', () => {
  const data = JSON.parse(fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/ita-inserts-594.json', import.meta.url), 'utf8'));
  const rows = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/reimport-594-ita-pets-band-gap.txt', import.meta.url), 'utf8').split('\n').filter((l) => l && !l.startsWith('#')).map((l) => l.split('\t'));
  Object.keys(data).forEach((p) => {
    const row = rows.find((r) => r[0] === p);
    assert.ok(row, p);
    assert.match(row[row.length - 1], /^READY\b/);
  });
});
