/* eslint-disable max-len, import/extensions */
/* tools/importer/add-market-roots.mjs (brief 413): market roots added to language documents'
   markets row, the DA document otherwise byte for byte; rows that serve the root already, or
   exclude it, kept; the list's form; the CLI on DA copies (--from), nothing written for a document
   it leaves as it is. Run: node --test test/add-market-roots.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import {
  addRoots, servesRoot, excludesRoot, readList,
} from '../tools/importer/add-market-roots.mjs';

const doc = (row) => `<body><header></header><main><div><h1>Reservar vuelos</h1></div><div><div class="metadata"><div><div>nav</div><div>/es/es/nav</div></div>${row}<div><div>Title</div><div>Reservar vuelos | ITA Airways</div></div></div></div></main><footer></footer></body>`;
const row = (v) => `<div><div>markets</div><div>${v}</div></div>`;

test('servesRoot and excludesRoot: the root, its country, an empty value; -cc', () => {
  assert.equal(servesRoot('ar/es, do/es, xx/es', 'us/es'), false);
  assert.equal(servesRoot('ar/es, us/es', 'us/es'), true);
  assert.equal(servesRoot('ar, us', 'us/es'), true);
  assert.equal(servesRoot('', 'us/es'), true, 'empty: every root of the language');
  assert.equal(servesRoot('us/en', 'us/es'), false, 'another language\'s root of the country');
  assert.equal(excludesRoot('-us', 'us/es'), true);
  assert.equal(excludesRoot('ar/es', 'us/es'), false);
});

test('addRoots: appended to the row, nothing else of the document changed', () => {
  const html = doc(row('ar/es, do/es, xx/es'));
  const r = addRoots(html, ['us/es', 've/es']);
  assert.equal(r.status, 'added');
  assert.equal(r.after, 'ar/es, do/es, xx/es, us/es, ve/es');
  assert.deepEqual(r.added, ['us/es', 've/es']);
  assert.equal(r.html, doc(row('ar/es, do/es, xx/es, us/es, ve/es')));
  // only the roots it lacks; a cell in a paragraph (as DA writes an edited cell)
  assert.equal(addRoots(doc(row('ar/es, us/es')), ['us/es', 've/es']).after, 'ar/es, us/es, ve/es');
  const p = addRoots(doc('<div><div><p>markets</p></div><div><p>ar/es, do/es</p></div></div>'), ['us/es']);
  assert.match(p.html, /<div><div><p>markets<\/p><\/div><div><p>ar\/es, do\/es, us\/es<\/p><\/div><\/div>/);
});

test('addRoots: a row that serves the roots already, no row, or an exclusion: the document as it is', () => {
  ['', ' '].forEach((v) => {
    const html = doc(row(v));
    assert.deepEqual([addRoots(html, ['us/es']).status, addRoots(html, ['us/es']).html], ['serves', html], 'empty: every root');
  });
  const none = doc('');
  assert.equal(addRoots(none, ['us/es']).status, 'serves');
  assert.equal(addRoots(none, ['us/es']).html, none);
  const both = doc(row('ar/es, us/es, ve/es'));
  assert.equal(addRoots(both, ['us/es', 've/es']).html, both);
  const ex = doc(row('-us'));
  assert.equal(addRoots(ex, ['us/es', 've/es']).status, 'excluded');
  assert.equal(addRoots(ex, ['us/es', 've/es']).html, ex);
});

test('readList: "<path> <roots>", comments and blank lines; a wrong line is an error', () => {
  assert.deepEqual(readList('# es/es\n/es/es/legal us/es,ve/es\n\n/es/es/book-and-prepare/destination us/es  # us only\n'), [
    { path: '/es/es/legal', roots: ['us/es', 've/es'] },
    { path: '/es/es/book-and-prepare/destination', roots: ['us/es'] },
  ]);
  assert.throws(() => readList('/es/es/legal'), /is not/);
  assert.throws(() => readList('/es/es/legal us'), /is not/);
});

test('the CLI on DA copies: the changed documents written, changes.tsv and changed.txt', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'add-roots-'));
  const from = path.join(dir, 'from');
  const out = path.join(dir, 'out');
  fs.mkdirSync(path.join(from, 'es/es/legal'), { recursive: true });
  fs.writeFileSync(path.join(from, 'es/es/legal.html'), doc(row('ar/es, do/es, xx/es')));
  fs.writeFileSync(path.join(from, 'es/es/legal/imprint.html'), doc(row('')));
  fs.writeFileSync(path.join(dir, 'list.txt'), '/es/es/legal us/es,ve/es\n/es/es/legal/imprint us/es,ve/es\n/es/es/missing us/es\n');
  const tool = new URL('../tools/importer/add-market-roots.mjs', import.meta.url).pathname;
  let code = 0;
  try {
    execFileSync('node', [tool, '--site', 'lh-ita', '--list', path.join(dir, 'list.txt'), '--out', out, '--from', from], { encoding: 'utf8' });
  } catch (e) { code = e.status; }
  assert.equal(code, 1, 'a document not read: exit 1');
  assert.equal(fs.readFileSync(path.join(out, 'es/es/legal.html'), 'utf8'), doc(row('ar/es, do/es, xx/es, us/es, ve/es')));
  assert.equal(fs.existsSync(path.join(out, 'es/es/legal/imprint.html')), false, 'unchanged: not written');
  assert.equal(fs.readFileSync(path.join(out, 'changed.txt'), 'utf8'), '/es/es/legal\n');
  const tsv = fs.readFileSync(path.join(out, 'changes.tsv'), 'utf8').replace(/\n$/, '').split('\n').map((l) => l.split('\t'));
  assert.deepEqual(tsv.slice(1), [
    ['/es/es/legal', 'added', 'ar/es, do/es, xx/es', 'ar/es, do/es, xx/es, us/es, ve/es'],
    ['/es/es/legal/imprint', 'serves', '', ''],
    ['/es/es/missing', 'not read (404)', '', ''],
  ]);
  fs.rmSync(dir, { recursive: true, force: true });
});
