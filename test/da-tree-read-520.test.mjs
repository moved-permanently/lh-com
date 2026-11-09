/* eslint-disable max-len -- dev tooling */
/* The brief after 520, item 2: the harness pages' census reads DA's tree with tools/importer/da-tree-read.mjs. It must
   stay read only (GET, no preview, no upload helper) and is never run from a test: these checks read its source and
   the census lists only. Each harness page's list and its count agree.
   Run: node --test test/da-tree-read-520.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (f) => fs.readFileSync(new URL(f, import.meta.url), 'utf8');

test('da-tree-read only reads', () => {
  const src = read('../tools/importer/da-tree-read.mjs');
  assert.ok(!/method:\s*'(POST|PUT|DELETE|PATCH)'/i.test(src));
  assert.ok(!/admin\.hlx\.page|admin\.aem\.page|\/preview\/|\/live\//.test(src));
  assert.ok(!/da-upload/.test(src.replace(/^\/\*[\s\S]*?\*\//, '')));
  assert.equal((src.match(/fetch\(/g) || []).length, 1, 'one fetch, in get()');
  assert.match(src, /fetch\(url, \{ method: 'GET'/);
});

test('ITA: the guide\'s list is DA\'s census', () => {
  const list = read('../tools/reports/token-free/census-lh-ita-paths.txt').split('\n').filter((l) => l.startsWith('/'));
  assert.equal(list.length, 2195);
  assert.equal(new Set(list).size, list.length);
  assert.deepEqual(list.slice(0, 1), ['/de/en/homepage']);
  const guide = read('../tools/reports/token-free/harness-pass-ita.md');
  assert.match(guide, /census-lh-ita-paths\.txt`, \*\*2,195 paths\*\*/);
  assert.ok(!/--list tools\/reports\/token-free\/collapse-lh-ita-paths\.txt/.test(guide));
});

test('the brands\' pages: each list is its DA census, the page says so and names its branch', () => {
  [['tap', 156], ['brussels', 1252], ['austrian', 2036], ['swiss', 2647]].forEach(([brand, count]) => {
    const list = read(`../tools/reports/token-free/census-lh-${brand}-paths.txt`).split('\n').filter((l) => l.startsWith('/'));
    assert.equal(list.length, count, brand);
    assert.equal(new Set(list).size, count, `${brand}: no path twice`);
    const page = read(`../tools/reports/token-free/harness-pass-${brand}.md`);
    assert.ok(page.includes(`census-lh-${brand}-paths.txt\`, **${count.toLocaleString('en-US')} paths**`), brand);
    assert.match(page, new RegExp(`token-free-${brand}-live\` \\(head [0-9a-f]{8}`), brand);
    assert.match(page, /\*\*Ready to start\*\*/, brand);
    assert.match(page, /\/\.token-free-backup\/2026-11-/, brand);
  });
});
