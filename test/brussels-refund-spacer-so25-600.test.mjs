/* eslint-disable max-len, import/extensions -- dev tooling */
/* Brussels (ema-lufthansa, standing order 25 of 2026-11-15, item 3): /be/en/legal-notices/refund-for-cancelled-flights at
   1440, www's space before the footer (delta-so25-brussels-refund-spacer.txt): {spacer-30 from-768} before the closing
   link line, so the line still ends the page (P56's phone space reads it): 1546 -> 1577 (www 1579), phones unchanged.
   Run: node --test test/brussels-refund-spacer-so25-600.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyFragments, readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';
import { SEPARATOR } from '../scripts/style-markers.js';

const PATH = '/be/en/legal-notices/refund-for-cancelled-flights';
const data = JSON.parse(fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so25-brussels-refund-spacer.json', import.meta.url), 'utf8'));
const list = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so25-brussels-refund-spacer.txt', import.meta.url), 'utf8');

test('one from-768 spacer before the closing link line, placed once; the link still ends the section', () => {
  const rows = data[PATH];
  assert.equal(rows.length, 1);
  assert.equal(rows[0].html, '<p>{spacer-30 from-768}</p>');
  assert.ok(SEPARATOR.test('{spacer-30 from-768}'));
  const doc = `<main><div><p>Please be advised.</p>${rows[0].before}Cancellation rights</a></p><div class="metadata"></div></div></main>`;
  const r = applyFragments(doc, rows);
  assert.deepEqual(r.problems, []);
  assert.match(r.html, /<p>\{spacer-30 from-768\}<\/p><p><a href="\/be\/en\/legal-notices\/israel-cancellation-rights">Cancellation rights<\/a><\/p><div class="metadata">/);
  assert.ok(applyFragments(r.html, rows).problems.length);
});

test('the list: READY, the header naming the tool and its data', () => {
  assert.deepEqual(readyPaths(list), [PATH]);
  assert.match(list.split('\n')[0], /node tools\/importer\/ita-fragment-insert-apply\.mjs --data tools\/reports\/parity-2026-11-09\/delta-so25-brussels-refund-spacer\.json/);
  assert.match(list.split('\n')[0], /Expected change only/);
});
