/* eslint-disable max-len, import/extensions */
/* Standing order 12 of 2026-11-13, item 1: the import helper applied reimport-so11-ita-column-view-headings.txt with
   tools/importer/heading-size-marks-apply.mjs, and on /it/it/.../online-check-in the tool wrote an href's `&amp;` as a
   bare `&` (it serialised the whole document again through linkedom). The tool now inserts the marker into the
   document's own text: everything else stays byte for byte (attributes' `&amp;` and `&quot;`, `&nbsp;`, `&gt;`, the
   whitespace), with or without the page frame DA's copies have (<body><header><main>).
   Run: node --test test/heading-size-marks-bytes-so12.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyHeadingSizeMarks } from '../tools/importer/heading-size-marks-apply.mjs';

const da = fs.readFileSync(new URL('./fixtures/heading-size-marks-so12/online-check-in.da.html', import.meta.url), 'utf8');

test('the marker goes in, everything else stays byte for byte (an href with &amp; among it)', () => {
  const { html, results } = applyHeadingSizeMarks(da, [{ level: 2, text: 'Carta d’imbarco digitale', size: 'heading-small' }]);
  assert.ok(results[0].result === '{heading-small}', results[0].result);
  const want = da.replace('Carta d’imbarco <strong>digitale</strong></h2>', 'Carta d’imbarco <strong>digitale</strong> {heading-small}</h2>');
  assert.ok(want !== da && html === want, 'only the marker added');
  assert.ok(html.includes('check-in?lang=it&amp;market=it') && html.includes('manage?pnr=1&amp;step=2') && html.includes('&nbsp;') && html.includes('&quot;online&quot;'));
});

test('a second run and an unfound heading leave the document as it is', () => {
  const once = applyHeadingSizeMarks(da, [{ level: 2, text: 'Carta d’imbarco digitale', size: 'heading-small' }]).html;
  const again = applyHeadingSizeMarks(once, [{ level: 2, text: 'Carta d’imbarco digitale', size: 'heading-small' }]);
  assert.ok(again.results[0].result === 'present' && again.html === once);
  const none = applyHeadingSizeMarks(da, [{ level: 3, text: 'Nope', size: 'heading-small' }]);
  assert.ok(none.results[0].result === 'not found' && none.html === da);
});

test('two rows on one document: both markers, nothing else changed', () => {
  const { html } = applyHeadingSizeMarks(da, [
    { level: 1, text: 'Check-in online', size: 'heading-medium' },
    { level: 2, text: 'Carta d’imbarco digitale', size: 'heading-small' },
  ]);
  const want = da.replace('<h1>Check-in online</h1>', '<h1>Check-in online {heading-medium}</h1>').replace('<strong>digitale</strong></h2>', '<strong>digitale</strong> {heading-small}</h2>');
  assert.ok(html === want);
});
