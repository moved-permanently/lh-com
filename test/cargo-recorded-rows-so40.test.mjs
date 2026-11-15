/* eslint-disable max-len, import/extensions -- dev tooling */
/* Standing order 40 (2026-11-15), items 3 and 4, on tonight's recordings (cargo-parity-004: the twelve tab pages at 1440;
   cargo-parity-005: the German eservices-app at 1440 and 390):
   item 4, delta-so37-cargo-product-tabs-unrecorded.txt gated: its READY rows are the .json's (cargo-tabs-apply.mjs), the
   HOLD rows are not in it; www's figures less the 80 px service notice;
   item 3, the German eservices-app's app section as the English row (text-inserts-apply.mjs): the badges' links as the
   English row's, the German words, the H2 FAQ before the German FAQ block.
   Run: node --max-old-space-size=256 --test test/cargo-recorded-rows-so40.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { listPaths } from '../tools/importer/text-inserts-apply.mjs';

const dir = new URL('../tools/reports/parity-2026-11-09/', import.meta.url);
const read = (f) => fs.readFileSync(new URL(f, dir), 'utf8');

test('item 4: the tab list\'s READY paths are the .json\'s, the HOLD ones are not in it', () => {
  const list = read('delta-so37-cargo-product-tabs-unrecorded.txt');
  const rows = list.split('\n').filter((l) => /^(READY|HOLD)\t/.test(l)).map((l) => l.split('\t'));
  const ready = [...new Set(rows.filter((r) => r[0] === 'READY').map((r) => r[1]))].sort();
  const hold = [...new Set(rows.filter((r) => r[0] === 'HOLD').map((r) => r[1]))].sort();
  assert.equal(ready.length + hold.length, 12);
  assert.deepEqual(ready, ['/en/add-on-services/insurance', '/en/add-on-services/personal-supervision', '/en/perishables', '/en/products/customer-owned-tracker', '/en/speed-pro', '/en/valuables', '/en/vulnerables']);
  const spec = JSON.parse(read('delta-so40-cargo-product-tabs-recorded.json'));
  assert.deepEqual(Object.keys(spec).sort(), ready);
  Object.values(spec).forEach((s) => { assert.equal(s.block, 'accordion-columns'); assert.equal(s.add, 'tabs'); });
  // every READY 1440 row: the page and the band end within 2 % of www's
  rows.filter((r) => r[0] === 'READY' && r[2] === '1440').forEach((r) => {
    const pct = (c) => Math.abs(parseFloat(c.match(/\(([-+][0-9.]+) %\)/)[1]));
    assert.ok(pct(r[6]) <= 2 && pct(r[9]) <= 2, r[1]);
  });
  const head = list.split('\n').filter((l) => l.startsWith('#')).join('\n');
  ['cargo-parity-004', 'tools/importer/cargo-tabs-apply.mjs', 'delta-so40-cargo-product-tabs-recorded.json', 'less 80 px', '/.token-free-backup/2026-11-cargo-so37-product-tabs-unrecorded/'].forEach((f) => assert.ok(head.includes(f), f));
});

test('item 4 carried further: todoor and sustainable-choice, the tab row and www\'s empty elements as a spacer', () => {
  const list = read('delta-so40-cargo-tab-panel-empties.txt');
  const ready = [...new Set(list.split('\n').filter((l) => l.startsWith('READY\t')).map((l) => l.split('\t')[1]))].sort();
  assert.deepEqual(ready, ['/en/add-on-services/sustainable-choice', '/en/add-on-services/todoor']);
  assert.deepEqual(Object.keys(JSON.parse(read('delta-so40-cargo-tab-panel-empties-tabs.json'))).sort(), ready);
  assert.deepEqual(JSON.parse(read('delta-so40-cargo-todoor-spacer.json')), [{
    text: 'Save time and effort with direct delivery', n: 140, tag: 'ul', place: 'after',
  }]);
  assert.deepEqual(JSON.parse(read('delta-so40-cargo-sustainable-choice-spacer.json')), [{
    text: 'Small: 10% SAF', n: 43, tag: 'ol', place: 'after',
  }]);
  const head = list.split('\n').filter((l) => l.startsWith('#')).join('\n');
  ['tools/importer/cargo-tabs-apply.mjs', 'tools/importer/paragraph-spacer-apply.mjs', '/.token-free-backup/2026-11-cargo-so40-tab-panel-empties/', 'without the marker collapse'].forEach((f) => assert.ok(head.includes(f), f));
  // in the tab list they stay HOLD, pointing here, and are not in its .json
  const tabs = read('delta-so37-cargo-product-tabs-unrecorded.txt');
  ready.forEach((p) => assert.match(tabs, new RegExp(`^HOLD\\t${p}\\t1440\\t.*delta-so40-cargo-tab-panel-empties\\.txt`, 'm')));
  ready.forEach((p) => assert.ok(!(p in JSON.parse(read('delta-so40-cargo-product-tabs-recorded.json'))), p));
});

test('item 3: the German eservices-app row, as the English one', () => {
  const de = JSON.parse(read('delta-so40-cargo-de-eservices-app.json'));
  const en = JSON.parse(read('delta-so39-cargo-lost-content.json')).find((r) => r.path === '/en/eservices-app');
  assert.deepEqual(de.map((r) => r.path), ['/de/eservices-app']);
  const [d, e] = [de[0].inserts, en.inserts];
  assert.equal(d.length, 6);
  assert.deepEqual(d.slice(1, 5), e.slice(1, 5), 'the badges inside the same two store links');
  assert.equal(d[0].after, e[0].after);
  assert.match(d[0].text, /^<h3>App-solutely mobile<\/h3><h4>Lufthansa Cargo eServices<\/h4><p>Sie möchten jederzeit wissen, .*?Smartphone aus\?<br><br>Holen Sie sich jetzt .*? zu jeder Zeit\.<\/p>$/);
  assert.deepEqual(d[5], { before: '<div class="accordion-columns faq"><div><div>Wo kann man die Lufthansa Cargo App herunterladen?', text: '<h2>FAQ</h2>' });
  const list = read('delta-so40-cargo-de-eservices-app.txt');
  assert.deepEqual([...new Set(listPaths(list))], ['/de/eservices-app']);
  const head = list.split('\n').filter((l) => l.startsWith('#')).join('\n');
  ['tools/importer/text-inserts-apply.mjs', 'delta-so40-cargo-de-eservices-app.json', '/.token-free-backup/2026-11-cargo-so40-de-eservices-app/', 'cargo-parity-005'].forEach((f) => assert.ok(head.includes(f), f));
});
