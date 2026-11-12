/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 5 of 2026-11-11, item 2: the small spacers DA held before a column view's start (dropped by the
   collapse), back into DA's copies (tools/importer/b2b-view-spacers-apply.mjs, data from the census). */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyViewSpacers, listPaths } from '../tools/importer/b2b-view-spacers-apply.mjs';

const doc = '<div><h1>Welcome</h1><p>Are you ready? Explore our offerings.</p><div class="columns-media"><div><div><h2>For companies</h2><p>PartnerPlusBenefit</p></div></div></div></div>';
const row = (o) => ({
  path: '/de/en/homepage', px: 25, next: { tag: 'DIV', cls: 'columns-media', start: 'For companiesPartnerPlusBenefit' }, prev: { tag: 'P', cls: '', end: 'Explore our offerings. {full-width}' }, ...o,
});

test('a spacer right before the element the view begins with, matched without spaces and marks; idempotent', () => {
  const { html, results } = applyViewSpacers(doc, [row()]);
  assert.equal(results[0].result, '{spacer-25}');
  assert.equal(html.includes('<p>Are you ready? Explore our offerings.</p><p>{spacer-25}</p><div class="columns-media">'), true);
  const again = applyViewSpacers(html, [row()]);
  assert.equal(again.results[0].result, 'not found', 'the text before it is the marker now');
  assert.equal(again.html, html);
});

test('from768: the space from 768 px only; a place not found changes nothing', () => {
  assert.equal(applyViewSpacers(doc, [row({ from768: true })]).html.includes('<p>{spacer-25 from-768}</p><div class="columns-media">'), true);
  const miss = applyViewSpacers(doc, [row({ next: { start: 'For agents' } })]);
  assert.equal(miss.results[0].result, 'not found');
  assert.equal(miss.html, doc);
});

test('the list and its data: 5 READY rows, each with census data; the homepages from 768 px', () => {
  const list = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/reimport-so5-b2b-view-spacers.txt', import.meta.url), 'utf8');
  const data = JSON.parse(fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/b2b-view-spacers-so5.json', import.meta.url), 'utf8'));
  const ready = listPaths(list);
  assert.deepEqual(ready, ['/de/en/homepage', '/de/de/homepage', '/de/en/travel-solutions/lufthansa-group-airlines', '/de/de/travel-solutions/lufthansa-group-airlines', '/de/en/about-us/help-alliance']);
  assert.equal(ready.every((p) => data.some((r) => r.path === p && r.px <= 31)), true);
  assert.deepEqual(data.filter((r) => r.from768).map((r) => r.path).sort(), ['/de/de/homepage', '/de/en/homepage']);
});
