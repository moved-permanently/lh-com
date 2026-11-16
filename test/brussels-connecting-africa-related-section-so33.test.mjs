/* eslint-disable max-len, import/extensions -- dev tooling */
/* Brussels (ema-lufthansa, standing order 33 of 2026-11-16, item 3): connecting-africa's "Related topics" in a section of
   its own, as www's (delta-so33-brussels-connecting-africa-related-section.txt). 1440 3879 -> 3948 (www 3980), 390 7507 ->
   7539 (www 7454, 0.43 points further: within the band-end gate). Run: node --test test/brussels-connecting-africa-related-section-so33.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';
import { applyReplacements, revertReplacements } from '../tools/importer/ita-fragment-replace-apply.mjs';

const R = '../tools/reports/parity-2026-11-09/';
const data = JSON.parse(fs.readFileSync(new URL(`${R}delta-so33-brussels-connecting-africa-related-section.json`, import.meta.url), 'utf8'));
const list = fs.readFileSync(new URL(`${R}delta-so33-brussels-connecting-africa-related-section.txt`, import.meta.url), 'utf8');
const PATH = '/be/en/book-a-flight/connecting-africa';

test('one row: only a section break before "Related topics"', () => {
  const [r] = data[PATH];
  assert.equal(data[PATH].length, 1);
  assert.equal(r.to, r.from.replace('<h2 id="related-topics">', '</div><div><h2 id="related-topics">'));
});

test('applied once, the revert gives the document back, a second run is refused', () => {
  const doc = `<main><div><h1>x</h1><div class="columns"><div><div><p>a${data[PATH][0].from}<div class="carousel-cards"></div></div></main>`;
  const done = applyReplacements(doc, data[PATH]);
  assert.deepEqual(done.problems, []);
  assert.equal(revertReplacements(done.html, data[PATH]).html, doc);
  assert.ok(applyReplacements(done.html, data[PATH]).problems.length);
});

test('the list: DONE since standing order 34 (live; corrected by delta-so34), naming the tool and the backup', () => {
  assert.deepEqual(readyPaths(list), []);
  assert.ok(list.split('\n').some((l) => l.startsWith(`DONE\t${PATH}\t`)));
  assert.match(list.split('\n')[0], /\.token-free-backup\/2026-11-brussels-so33-connecting-africa-related-section\//);
});
