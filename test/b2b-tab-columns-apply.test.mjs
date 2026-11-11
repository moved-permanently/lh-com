/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* The standing order of 2026-11-10 evening, decision 3: the Allegris start-of-booking pages' tab panels hold www's two text
   columns (FRA beside MUC) one under the other in DA; tools/importer/b2b-tab-columns-apply.mjs (DA's copy plus the delta)
   makes each such panel's items one Columns Media, a cell per item, from www's snapshot.
   Run: node --max-old-space-size=256 --test test/b2b-tab-columns-apply.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { applyTabColumns, tabViews } from '../tools/importer/b2b-tab-columns-apply.mjs';

const item = (h, body) => `<div class="col-md-6 column-view-item"><div class="headline"><h3>${h}</h3></div><div class="text"><p>${body}</p></div></div>`;
const SNAP = `<html><body><maui-tab-control-panel-responsive><div><div class="twocolumn column"><div class="column-view"><div class="row">${item('From Frankfurt (FRA)', 'Austin')}${item('From Munich (MUC)', 'Chicago')}</div></div></div></div></maui-tab-control-panel-responsive>
  <maui-tab-control-panel-responsive><div><div class="twocolumn column"><div class="column-view"><div class="row">${item('With picture', '<img src="x.jpg">')}${item('Other', 'y')}</div></div></div></div></maui-tab-control-panel-responsive></body></html>`;
const DA = `<div><h3>Where does Lufthansa Allegris fly to?</h3></div>
<div><h3 id="fra">From Frankfurt (FRA)</h3><p><strong>North America:</strong></p><ul><li>Austin</li></ul><h3 id="muc">From Munich (MUC)</h3><p>Chicago</p><div class="section-metadata"><div><div>Tab</div><div>2026 summer schedule</div></div></div></div>
<div><p>After</p></div>`;

test('www\'s text-only views that end their panel, by their items\' headings; one with a picture is not one', () => {
  assert.deepEqual(tabViews(SNAP), [['From Frankfurt (FRA)', 'From Munich (MUC)']]);
});

test('the Tab section\'s items as one Columns Media, a cell per item, its section metadata after it; the rest as it was', () => {
  const r = applyTabColumns(DA, SNAP);
  assert.deepEqual(r.views, ['From Frankfurt (FRA) | From Munich (MUC)']);
  assert.ok(r.html.includes('<div><h3 id="fra">'), 'nothing before the first heading of the section moved');
  assert.match(r.html, /<div class="columns-media"><div><div><h3 id="fra">From Frankfurt \(FRA\)<\/h3><p><strong>North America:<\/strong><\/p><ul><li>Austin<\/li><\/ul><\/div><div><h3 id="muc">From Munich \(MUC\)<\/h3><p>Chicago<\/p><\/div><\/div><\/div><div class="section-metadata">/);
  assert.ok(r.html.includes('<div><h3>Where does Lufthansa Allegris fly to?</h3></div>'));
  assert.ok(r.html.includes('<div><p>After</p></div>'));
  assert.equal(applyTabColumns(r.html, SNAP).html, r.html, 'applied once only');
});

test('headings not in one section: as it is', () => {
  const split = '<div><h3>From Frankfurt (FRA)</h3><p>a</p></div><div><h3>From Munich (MUC)</h3><p>b</p></div>';
  const r = applyTabColumns(split, SNAP);
  assert.deepEqual(r.views, []);
  assert.ok(!r.html.includes('columns-media'));
});
