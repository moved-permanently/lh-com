/* eslint-disable max-len, import/extensions -- dev tooling */
/* Brussels (ema-lufthansa, standing order 38 of 2026-11-16): checked-baggage's first two headings {limited-width}, as www's
   834 px at 1440 (delta-so38-brussels-checked-baggage-limited-headings.txt: four READY, es/es HOLD).
   Run: node --test test/brussels-checked-baggage-limited-headings-so38.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';

const R = '../tools/reports/parity-2026-11-09/';
const data = JSON.parse(fs.readFileSync(new URL(`${R}delta-so38-brussels-checked-baggage-limited-headings.json`, import.meta.url), 'utf8'));
const list = fs.readFileSync(new URL(`${R}delta-so38-brussels-checked-baggage-limited-headings.txt`, import.meta.url), 'utf8');
const page = (l) => `/${l}/extra-services/baggage/checked-baggage`;

test('two rows per document, each the marker after an h2 text, nothing else', () => {
  assert.deepEqual(Object.keys(data).sort(), ['be/fr', 'be/nl', 'de/de', 'es/es', 'it/it'].map(page).sort());
  Object.values(data).forEach((rows) => {
    assert.equal(rows.length, 2);
    rows.forEach((r) => {
      assert.equal(r.count, 1);
      assert.match(r.from, /^<h2 id="[^"]+">[^<]+<\/h2>$/);
      assert.equal(r.to, r.from.replace('</h2>', ' {limited-width}</h2>'));
    });
  });
});

test('the list: four READY, es/es HOLD', () => {
  assert.deepEqual(readyPaths(list).sort(), ['be/fr', 'be/nl', 'de/de', 'it/it'].map(page).sort());
  assert.ok(list.split('\n').some((l) => l.startsWith(`HOLD\t${page('es/es')}\t`)));
  assert.match(list.split('\n')[0], /\.token-free-backup\/2026-11-brussels-so38-checked-baggage-limited-headings\//);
});
