/* eslint-disable max-len, import/extensions -- dev tooling */
/* Standing order 60 item 1c: lufthansa.com's switch census (tools/importer/switch-census.mjs) counts markers as the site will
   (scripts/style-markers.js hasStyleMarkers on the switch branch: any "{a…}" in the text but the data placeholders) and reads
   a batch file's READY rows or its .json rows.
   Run: node --test test/switch-census-so60.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { switchMarkers, batchPaths, plainText } from '../tools/importer/switch-census.mjs';

test('every marker spelling counts, the data placeholders and markup do not', () => {
  assert.deepEqual(switchMarkers('<div><h2 id="a-heading-small">A {heading-small}</h2><p>{spacer-40 from-768}</p></div>'), ['{heading-small}', '{spacer-40 from-768}']);
  assert.deepEqual(switchMarkers('<p>Link list {links-vertical}</p><p>{column-start}</p>'), ['{links-vertical}', '{column-start}']);
  assert.deepEqual(switchMarkers('<p>From {origin} to {destination} in {n} hours ({locale})</p>'), []);
  assert.deepEqual(switchMarkers('<div class="spacer m-plus"><div><div></div></div></div><p>{"a": 1}</p>'), []);
  assert.equal(plainText('<p>A &amp; B&nbsp;{caption}</p>').trim(), 'A & B {caption}');
});

test('a batch file\'s paths: the .txt READY rows, the .json rows', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'switch-census-'));
  const txt = path.join(dir, 'delta-so60-switch-01.txt');
  fs.writeFileSync(txt, '# header\n# path\tmarkers\nREADY\t/de/en/baggage\t12 -> 0\tsection style divider 1\nREADY\t/de/en/x\t1 -> 0\ttheme defaults only\n');
  assert.deepEqual(batchPaths(txt), ['/de/en/baggage', '/de/en/x']);
  const json = path.join(dir, 'delta-so60-switch-01.json');
  fs.writeFileSync(json, JSON.stringify([{ path: '/de/en/baggage', expectMarkers: 0 }]));
  assert.deepEqual(batchPaths(json), ['/de/en/baggage']);
  fs.rmSync(dir, { recursive: true });
});
