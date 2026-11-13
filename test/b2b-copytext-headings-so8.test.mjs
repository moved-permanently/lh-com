/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 8 of 2026-11-12, item 3: www's B2B headline headings in heading-copytext-large (businesstogo,
   route-network) as their marker in DA's copies (reimport-so8-b2b-copytext-headings.txt, heading-size-marks-apply.mjs).
   The list gives its READY rows only (4 of 6); the delta marks an H3 the flow theme would draw in heading-small and
   leaves a heading marked already.
   Run: node --test test/b2b-copytext-headings-so8.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyHeadingSizeMarks, listPaths } from '../tools/importer/heading-size-marks-apply.mjs';

const read = (f) => fs.readFileSync(new URL(`../tools/reports/parity-2026-11-09/${f}`, import.meta.url), 'utf8');

test('the list: 4 READY of 6, every data row heading-copytext-large on a listed page', () => {
  const list = read('reimport-so8-b2b-copytext-headings.txt');
  const data = JSON.parse(read('b2b-copytext-headings-so8.json'));
  assert.ok(listPaths(list).length === 4);
  const all = list.split('\n').filter((l) => l.startsWith('/')).map((l) => l.split('\t')[0]);
  assert.ok(data.every((r) => r.size === 'heading-copytext-large' && all.includes(r.path)));
});

test('the delta: an H3 marked, a marked one left', () => {
  const html = '<div><h3>Maximize Savings &amp; Rewards:</h3><p>x</p><h3>Gain Control &amp; Flexibility: {heading-copytext-large}</h3></div>';
  const rows = [
    {
      path: '/de/en/program/businesstogo', level: 3, text: 'Maximize Savings & Rewards:', size: 'heading-copytext-large',
    },
    {
      path: '/de/en/program/businesstogo', level: 3, text: 'Gain Control & Flexibility:', size: 'heading-copytext-large',
    },
  ];
  const { html: out, results } = applyHeadingSizeMarks(html, rows);
  assert.ok(results[0].result === '{heading-copytext-large}' && results[1].result === 'present', JSON.stringify(results.map((r) => r.result)));
  assert.ok(out.includes('Maximize Savings &amp; Rewards: {heading-copytext-large}</h3>'));
});
