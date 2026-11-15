/* eslint-disable max-len, import/extensions -- dev tooling */
/* Brussels (ema-lufthansa, standing order 23 of 2026-11-15, item 2): the six checked-baggage pages' phone tab set closed, as
   www's phone first loads (brussels-parity-011): the metadata row "Tabs open | none" (scripts/section-tabs.js), with
   tools/importer/ita-fragment-insert-apply.mjs and delta-so23-brussels-checked-baggage-tabs-closed.json. 390 closer on all
   six (e.g. be/en +13.64 -> -1.23 %), 1440 unchanged. Run: node --test test/brussels-checked-baggage-tabs-closed-600.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyFragments, readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';

const LANGS = ['be/en', 'be/fr', 'be/nl', 'de/de', 'es/es', 'it/it'];
const PATHS = LANGS.map((l) => `/${l}/extra-services/baggage/checked-baggage`);
const data = JSON.parse(fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so23-brussels-checked-baggage-tabs-closed.json', import.meta.url), 'utf8'));
const list = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so23-brussels-checked-baggage-tabs-closed.txt', import.meta.url), 'utf8');
const tabs = fs.readFileSync(new URL('../scripts/section-tabs.js', import.meta.url), 'utf8');

test('the six pages, one row each: "Tabs open | none" as the metadata block\'s first row; a second run changes nothing', () => {
  assert.deepEqual(Object.keys(data).sort(), [...PATHS].sort());
  PATHS.forEach((p) => {
    const rows = data[p];
    assert.equal(rows.length, 1);
    assert.equal(rows[0].html, '<div><div>Tabs open</div><div>none</div></div>');
    const doc = `<main><div><p>x</p></div><div><div class="metadata">${rows[0].before}<div><div>nav</div><div>n</div></div></div></div></main>`;
    const r = applyFragments(doc, rows);
    assert.deepEqual(r.problems, []);
    assert.ok(r.html.includes(`<div class="metadata">${rows[0].html}${rows[0].before}`));
    assert.ok(applyFragments(r.html, rows).problems.length);
  });
});

test('section-tabs reads the page\'s "Tabs open" metadata, none closing every item', () => {
  assert.match(tabs, /getMetadata\('tabs-open'\)/);
  assert.match(tabs, /pageOpen === 'none'\) open = -1/);
});

test('the list: six READY rows, the header naming the tool and its data', () => {
  assert.deepEqual(readyPaths(list).sort(), [...PATHS].sort());
  assert.match(list.split('\n')[0], /node tools\/importer\/ita-fragment-insert-apply\.mjs --data tools\/reports\/parity-2026-11-09\/delta-so23-brussels-checked-baggage-tabs-closed\.json/);
  assert.match(list.split('\n')[0], /Expected change only/);
});
