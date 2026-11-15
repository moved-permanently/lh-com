/* eslint-disable max-len, import/extensions -- dev tooling */
/* Standing order 38 of 2026-11-15, item 2: the apply tool and the rows of delta-so37-cargo-product-tabs.txt (Cargo's
   product tab sets). tools/importer/cargo-tabs-apply.mjs gives the block the option tabs and makes each row's run of a
   panel's elements a one-row table; every element's bytes are DA's. Not found, found twice or there already: no change.
   Run: node --max-old-space-size=256 --test test/cargo-tabs-apply-so38.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyCargoTabs, unwrap } from '../tools/importer/cargo-tabs-apply.mjs';
import { readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';

const pic = '<p><picture><img src="https://content.da.live/o/r/media-da/cargo/a.jpg" alt=""></picture></p>';
const block = (cls = 'accordion-columns faq') => `<div class="${cls}"><div><div>Features</div><div><h3>Speed and reliability</h3><p>Have mail &amp; parcels reach their destinations.</p>${pic}<h3>Global network</h3></div></div><div><div>Booking &amp; Tracking</div><div><p>Book online</p></div></div></div>`;
const doc = (b = block()) => `<body><header></header><main><div><h1>Airmail</h1></div>\n<div>${b}</div></main><footer></footer></body>`;
const spec = {
  block: 'accordion-columns',
  add: 'tabs',
  titles: ['Features', 'Booking & Tracking'],
  rows: [{ panel: 'Features', cells: [['h3|speed and reliability', 'p|have mail & parcels'], ['img']] }],
};

test('the option and the table, every other byte as DA\'s', () => {
  const r = applyCargoTabs(doc(), spec);
  assert.deepEqual(r.problems, []);
  assert.equal(r.tables, 1);
  const want = doc(block().replace('accordion-columns faq"', 'accordion-columns faq tabs"')
    .replace('<h3>Speed', '<table><tbody><tr><td><h3>Speed').replace(`destinations.</p>${pic}`, `destinations.</p></td><td>${pic}</td></tr></tbody></table>`));
  assert.equal(r.html, want);
  assert.equal(unwrap(r.html, spec), doc());
});

test('refused: there already, the run or the block not found, found twice', () => {
  const r = applyCargoTabs(doc(), spec);
  assert.match(applyCargoTabs(r.html, spec).problems[0], /there already/);
  const none = { ...spec, rows: [{ panel: 'Features', cells: [['h3|nothing like it'], ['img']] }] };
  assert.equal(applyCargoTabs(doc(), none).html, doc());
  assert.equal(applyCargoTabs(doc(), { ...spec, titles: ['Features'] }).html, doc());
  const twice = doc(`${block()}${block()}`);
  assert.match(applyCargoTabs(twice, spec).problems[0], /2 accordion-columns blocks/);
  const run2 = { ...spec, rows: [{ panel: 'Features', cells: [['img']] }] };
  const twoPics = doc(block().replace('<h3>Global', `${pic}<h3>Global`));
  assert.match(applyCargoTabs(twoPics, run2).problems[0], /found 2 times/);
});

test('the committed rows: the list\'s READY paths, each named in its header', () => {
  const dir = new URL('../tools/reports/parity-2026-11-09/', import.meta.url);
  const list = fs.readFileSync(new URL('delta-so37-cargo-product-tabs.txt', dir), 'utf8');
  const rows = JSON.parse(fs.readFileSync(new URL('delta-so37-cargo-product-tabs.json', dir), 'utf8'));
  assert.deepEqual(Object.keys(rows).sort(), readyPaths(list).sort());
  assert.deepEqual(readyPaths(list).sort(), ['/en/active-temp-control', '/en/airmail', '/en/dangerous-goods', '/en/eservices/efreight', '/en/general-cargo']);
  Object.values(rows).forEach((s) => {
    assert.equal(s.block, 'accordion-columns');
    assert.equal(s.add, 'tabs');
    assert.ok(s.rows.length > 0 && s.rows.every((r) => r.cells.length >= 2 && s.titles.includes(r.panel)));
  });
  const head = list.split('\n').filter((l) => l.startsWith('#')).slice(0, 4).join('\n');
  assert.match(head, /tools\/importer\/cargo-tabs-apply\.mjs/);
  assert.match(head, /delta-so37-cargo-product-tabs\.json/);
});
