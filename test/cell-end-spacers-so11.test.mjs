/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 11 (2026-11-12), item 3: /de/en/common/imprint/lufthansa-insights-imprint. www ends two column-view cells
   with an empty paragraph (after "Cindy Richter" in the second view's left cell, <p><br></p>; after "Patrick Amor (CD)" in
   the third view's right cell, <p>&nbsp;</p>), and the import dropped both: the next view starts 51px higher than www's
   (measured before standing order 10's held view rule: 27px short with our 88px between views against www's 64 + the
   empty line). tools/importer/cell-end-spacers-apply.mjs puts a {spacer-N} at the end of such a cell in DA's copy: the
   paragraph above keeps its 24px, the spacer draws N + 1px, so N = 26 for www's 51px. Everything else stays byte for byte.
   Input: DA's current copy (GET 2026-11-12, test/fixtures/cell-end-spacers-so11).
   Run: node --max-old-space-size=256 --test test/cell-end-spacers-so11.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { applyCellEndSpacers } from '../tools/importer/cell-end-spacers-apply.mjs';

const da = fs.readFileSync(new URL('./fixtures/cell-end-spacers-so11/insights-imprint.da.html', import.meta.url), 'utf8');
const ROWS = [{ end: 'Cindy Richter', n: 26 }, { end: 'Patrick Amor (CD)', n: 26 }];
const r = applyCellEndSpacers(da, ROWS);
const { document } = parseHTML(`<html>${r.html}</html>`);
const norm = (s) => s.replace(/\s+/g, ' ').trim();

test('a {spacer-26} closes each of the two cells, after their last paragraph', () => {
  assert.deepEqual(r.results.map((x) => x.result), ['placed', 'placed']);
  ['Cindy Richter', 'Patrick Amor (CD)'].forEach((end) => {
    const p = [...document.querySelectorAll('p')].find((x) => norm(x.textContent).endsWith(end));
    const next = p.nextElementSibling;
    assert.ok(next && norm(next.textContent) === '{spacer-26}', end);
    assert.ok(next.nextElementSibling === null, `${end}: the spacer ends its cell`);
    assert.ok(p.parentElement.parentElement.parentElement.classList.contains('columns-media'), `${end}: in a Columns Media cell`);
  });
});

test('nothing else changes; a text not found or not ending a cell changes nothing', () => {
  const stripped = r.html.split('<p>{spacer-26}</p>').join('');
  assert.equal(stripped, da);
  const none = applyCellEndSpacers(da, [{ end: 'Dr. Johannes Teyssen', n: 26 }, { end: 'no such text', n: 26 }]);
  assert.equal(none.html, da);
  assert.deepEqual(none.results.map((x) => x.result), ['not the end of a cell', 'not found']);
});

test('a second run adds nothing (the spacer is there already)', () => {
  const again = applyCellEndSpacers(r.html, ROWS);
  assert.equal(again.html, r.html);
  assert.deepEqual(again.results.map((x) => x.result), ['there already', 'there already']);
});
