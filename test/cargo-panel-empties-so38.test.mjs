/* eslint-disable max-len, import/extensions -- dev tooling */
/* Standing order 38 of 2026-11-15, item 4: Cargo's emergency and smartULD pages, www's empty elements in the first panel
   as {spacer-N} paragraphs (delta-so38-cargo-panel-empties.txt), drawn in a panel by Cargo's theme as in running text
   (styles.css draws separators only in default content). paragraph-spacer-apply.mjs learns tag ul and place after.
   Run: node --max-old-space-size=256 --test test/cargo-panel-empties-so38.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyParagraphSpacer } from '../tools/importer/paragraph-spacer-apply.mjs';
import { readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';

const dir = new URL('../tools/reports/parity-2026-11-09/', import.meta.url);
const read = (f) => fs.readFileSync(new URL(f, dir), 'utf8');

test('the rule: a spacer paragraph in an accordion\'s panel has its height, Cargo only, at every width', () => {
  const css = fs.readFileSync(new URL('../styles/themes/cargo.css', import.meta.url), 'utf8');
  const sel = 'body.brand-cargo .accordion-columns-panel p.spacer {';
  const i = css.indexOf(sel);
  assert.ok(i > 0);
  assert.equal(css.slice(css.lastIndexOf('}', i), i).includes('@media'), false, 'not in a media query');
  const body = css.slice(i, css.indexOf('}', i));
  assert.match(body, /box-sizing: content-box;/);
  assert.match(body, /height: calc\(var\(--spacer-size, 25px\) \+ 1px\);/);
  assert.match(body, /margin: 0;/);
});

test('after a list or a paragraph; there already, a nested list or a bad place: no change', () => {
  const cell = '<td><h3>Exclusive Customer Service</h3><ul><li>Exclusive access to our Pharma Control Tower for inquiries</li><li>24/7 monitoring</li></ul></td><td><p><picture><img src="a.jpg"></picture></p></td>';
  const rows = JSON.parse(read('delta-so38-cargo-smartuld-spacer.json'));
  const r = applyParagraphSpacer(cell, rows);
  assert.deepEqual(r.results.map((x) => x.result), ['placed']);
  assert.equal(r.html, cell.replace('</ul></td>', '</ul><p>{spacer-163}</p></td>'));
  assert.equal(applyParagraphSpacer(r.html, rows).results[0].result, 'there already');
  const nested = '<ul><li>Exclusive access to our Pharma Control Tower<ul><li>x</li></ul></li></ul>';
  assert.equal(applyParagraphSpacer(nested, rows).html, nested);
  assert.equal(applyParagraphSpacer(cell, [{ ...rows[0], place: 'inside' }]).results[0].result, 'bad row');
  const em = '<h3>Money-back Guarantee</h3><p>Reimbursement of the Add-on Service Emergency freight costs in the event of delays</p><p>* €0.20 per connection</p>';
  const e = applyParagraphSpacer(em, JSON.parse(read('delta-so38-cargo-emergency-spacer.json')));
  assert.equal(e.html, em.replace('delays</p>', 'delays</p><p>{spacer-43}</p>'));
});

test('the list: both pages READY at 1440, their tools and data named in the header, the so37 rows pointing here', () => {
  const list = read('delta-so38-cargo-panel-empties.txt');
  assert.deepEqual(readyPaths(list).sort(), ['/en/add-on-services/smartuld', '/en/emergency']);
  const head = list.split('\n').filter((l) => l.startsWith('#')).slice(0, 4).join('\n');
  ['delta-so38-cargo-panel-empties-tabs.json', 'delta-so38-cargo-emergency-spacer.json', 'delta-so38-cargo-smartuld-spacer.json', 'cargo-tabs-apply.mjs', 'paragraph-spacer-apply.mjs'].forEach((f) => assert.ok(head.includes(f), f));
  assert.deepEqual(Object.keys(JSON.parse(read('delta-so38-cargo-panel-empties-tabs.json'))).sort(), ['/en/add-on-services/smartuld', '/en/emergency']);
  const so37 = read('delta-so37-cargo-product-tabs.txt');
  ['/en/emergency', '/en/add-on-services/smartuld'].forEach((p) => assert.ok(!readyPaths(so37).includes(p), p));
  assert.equal((so37.match(/READY together with the panel's spacer in delta-so38-cargo-panel-empties\.txt/g) || []).length, 2);
});
