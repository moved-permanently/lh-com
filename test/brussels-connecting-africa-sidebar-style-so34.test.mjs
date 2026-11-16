/* eslint-disable max-len, import/extensions -- dev tooling */
/* Brussels (ema-lufthansa, standing order 34 of 2026-11-16, item 1): connecting-africa's sidebar style back on its first
   section after order 33's break moved it to "Related topics", and {spacer-31 from-768} above that heading
   (delta-so34-brussels-connecting-africa-sidebar-style.txt). 1440 4040 -> 3980 (www 3980), 390 unchanged 7539.
   Run: node --test test/brussels-connecting-africa-sidebar-style-so34.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';
import { applyReplacements, revertReplacements } from '../tools/importer/ita-fragment-replace-apply.mjs';

const R = '../tools/reports/parity-2026-11-09/';
const data = JSON.parse(fs.readFileSync(new URL(`${R}delta-so34-brussels-connecting-africa-sidebar-style.json`, import.meta.url), 'utf8'));
const list = fs.readFileSync(new URL(`${R}delta-so34-brussels-connecting-africa-sidebar-style.txt`, import.meta.url), 'utf8');
const PATH = '/be/en/book-a-flight/connecting-africa';
const SM = '<div class="section-metadata"><div><div>style</div><div>sidebar</div></div></div>';

test('two rows: the style block moves from the Related section to the first one, and the spacer opens the Related section', () => {
  const [a, b] = data[PATH];
  assert.ok(!a.from.includes(SM) && a.to.includes(SM) && a.to.includes('<p>{spacer-31 from-768}</p><h2 id="related-topics">'));
  assert.ok(b.from.includes(SM) && !b.to.includes(SM));
});

test('on a document shaped as DA\'s: one style block before and after, on the first section after', () => {
  const [a, b] = data[PATH];
  const doc = `<main><div><h1>t</h1><p>${a.from}<div class="carousel-cards"><div><div><h4>${b.from}</main>`;
  const done = applyReplacements(doc, data[PATH]);
  assert.deepEqual(done.problems, []);
  assert.equal(done.html.split(SM).length, 2);
  assert.ok(done.html.indexOf(SM) < done.html.indexOf('related-topics'));
  assert.equal(revertReplacements(done.html, data[PATH]).html, doc);
});

test('the list: READY, naming the tool and the backup', () => {
  assert.deepEqual(readyPaths(list), [PATH]);
  assert.match(list.split('\n')[0], /\.token-free-backup\/2026-11-brussels-so34-connecting-africa-sidebar-style\//);
});
