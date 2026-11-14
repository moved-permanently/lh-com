/* eslint-disable max-len, import/extensions -- dev tooling */
/* A section's text and its closing picture as one Columns Media row, in DA's copy (standing order 16 of 2026-11-14, item 1;
   Group for Business /de/en/travel-solutions/our-european-fares: the "Exclusive benefits for status customers" section is
   an H3, paragraphs and a picture paragraph one under the other in DA's copy, where www sets text and picture side by side).
   tools/importer/columns-wrap-apply.mjs: in the section whose first element is the heading (its text starts with
   `heading`), the elements from the heading to the picture paragraph become the first cell and the picture paragraph the
   second cell of `<div class="columns-media"><div><div>...</div><div>...</div></div></div>`; the section metadata and every
   other byte as DA's. Refused, the document as it was: the heading not found once or not its section's first element, the
   section not ending with one picture paragraph (before its metadata), or a Columns Media block in the section already.
   Reversible byte for byte: revert() takes the wrapped copy back to DA's bytes.
   Run: node --test test/columns-wrap-apply-600.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyColumnsWrap, revertColumnsWrap } from '../tools/importer/columns-wrap-apply.mjs';

const TEXT = '<h3 id="exclusive-benefits-for-status-customers">Exclusive benefits for status customers</h3><p>In the <strong>Economy Basic</strong> fare, members may take one more bag.</p><p><sup>* Discover Airlines: Gold members only</sup></p>';
const PIC = '<p><picture><img src="https://business.lufthansagroup.com/content/dam/b2b/x/Intermediaries_HON_1244x800.jpg" alt=""></picture></p>';
const META = '<div class="section-metadata"><div><div>style</div><div>grey</div></div></div>';
const DA = `<body><header></header><main><div><h2>More choice</h2><p>Intro.</p></div><div>${TEXT}${PIC}${META}</div><div><h3 id="at-a-glance">At-a-glance</h3></div></main><footer></footer></body>`;
const ROW = { heading: 'Exclusive benefits for status customers' };

test('the text and the picture as one Columns Media row; every other byte as DA\'s', () => {
  const r = applyColumnsWrap(DA, ROW);
  assert.deepEqual(r.problems, []);
  assert.equal(r.html, DA.replace(`${TEXT}${PIC}`, `<div class="columns-media"><div><div>${TEXT}</div><div>${PIC}</div></div></div>`));
});

test('reversible byte for byte', () => {
  const once = applyColumnsWrap(DA, ROW).html;
  const back = revertColumnsWrap(once, ROW);
  assert.deepEqual(back.problems, []);
  assert.equal(back.html, DA);
  assert.ok(revertColumnsWrap(DA, ROW).problems.length, 'nothing to revert in DA\'s copy');
});

test('refused, the document as it was', () => {
  const once = applyColumnsWrap(DA, ROW).html;
  assert.ok(applyColumnsWrap(once, ROW).problems.length, 'a second run: a Columns Media block there already');
  assert.ok(applyColumnsWrap(DA, { heading: 'Nowhere' }).problems.length, 'the heading not found');
  const notFirst = DA.replace(`<div>${TEXT}`, `<div><p>Before.</p>${TEXT}`);
  assert.ok(applyColumnsWrap(notFirst, ROW).problems.length, 'not the section\'s first element');
  const noPic = DA.replace(PIC, '<p>No picture.</p>');
  assert.ok(applyColumnsWrap(noPic, ROW).problems.length, 'the section not ending with a picture paragraph');
  const r = applyColumnsWrap(noPic, ROW);
  assert.equal(r.html, noPic);
});

test('the list: READY first, the header naming the tool, its data and the owner\'s decision', () => {
  const lines = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so15-b2b-european-fares-status-columns.txt', import.meta.url), 'utf8').split('\n');
  assert.match(lines[0], /node tools\/importer\/columns-wrap-apply\.mjs --data tools\/reports\/parity-2026-11-09\/delta-so15-b2b-european-fares-status-columns\.json/);
  assert.match(lines[0], /owner's decision/i);
  const rows = lines.filter((l) => l && !l.startsWith('#')).map((l) => l.split('\t'));
  assert.equal(rows.length, 1);
  assert.equal(rows[0][0], 'READY');
  const data = JSON.parse(fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so15-b2b-european-fares-status-columns.json', import.meta.url), 'utf8'));
  assert.deepEqual(data, { '/de/en/travel-solutions/our-european-fares': ROW });
});
