/* eslint-disable max-len, import/extensions -- dev tooling */
/* Brussels (ema-lufthansa, standing order 33 of 2026-11-16, item 3): bike-the-city's six bold city headings on a line of
   their own, as www's ("<b>Munich: ...<br></b>Munich is just ..."), DA's copy running them into the text
   (delta-so33-brussels-bike-the-city-heading-breaks.txt). 1440 3989 -> 4109 (www 4082), 390 5995 -> 6043 against a resize
   (www 5981): HOLD until the phone first load. Run: node --test test/brussels-bike-the-city-heading-breaks-so33.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';
import { applyReplacements, revertReplacements } from '../tools/importer/ita-fragment-replace-apply.mjs';

const R = '../tools/reports/parity-2026-11-09/';
const data = JSON.parse(fs.readFileSync(new URL(`${R}delta-so33-brussels-bike-the-city-heading-breaks.json`, import.meta.url), 'utf8'));
const list = fs.readFileSync(new URL(`${R}delta-so33-brussels-bike-the-city-heading-breaks.txt`, import.meta.url), 'utf8');
const PATH = '/be/en/articles/bike-the-city';

test('six rows: only a <br> after each bold city heading', () => {
  assert.equal(data[PATH].length, 6);
  data[PATH].forEach((r) => {
    assert.ok(r.from.startsWith('</strong>'));
    assert.equal(r.to, r.from.replace('</strong>', '</strong><br>'));
  });
});

test('applied once, the revert gives the document back, a second run is refused', () => {
  const doc = `<main><div>${data[PATH].map((r, i) => `<p><strong>City ${i}${r.from} more text.</p>`).join('')}</div></main>`;
  const done = applyReplacements(doc, data[PATH]);
  assert.deepEqual(done.problems, []);
  assert.equal(revertReplacements(done.html, data[PATH]).html, doc);
  assert.ok(applyReplacements(done.html, data[PATH]).problems.length);
});

test('the list: HOLD (390 fails against the resize), naming the tool and the backup', () => {
  assert.deepEqual(readyPaths(list), []);
  assert.ok(list.split('\n').some((l) => l.startsWith(`HOLD\t${PATH}\t`)));
  assert.match(list.split('\n')[0], /\.token-free-backup\/2026-11-brussels-so33-bike-the-city-heading-breaks\//);
});
