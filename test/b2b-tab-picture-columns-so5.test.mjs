/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 5 of 2026-11-11, item 2: businesstogo's tab panels (text over a full-width picture in DA) as www's
   two-up column view, DA's copy plus the delta (tools/importer/b2b-tab-picture-columns-apply.mjs). */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyTabPictureColumns, listPaths } from '../tools/importer/b2b-tab-picture-columns-apply.mjs';

const pic = '<p><picture><img src="./media_1.jpg" alt=""></picture></p>';
const meta = (tab) => `<div class="section-metadata"><div><div>Tab</div><div>${tab}</div></div><div><div>Tabs</div><div>1</div></div></div>`;

test('a tab panel of text and one picture at its end becomes one Columns Media row; the metadata stays', () => {
  const doc = `<div><h2>Solutions</h2></div><div><p>One.</p><ul><li>Two</li></ul>${pic}${meta('CEO')}</div><div><p>After.</p></div>`;
  const { html, panels } = applyTabPictureColumns(doc);
  assert.equal(panels, 1);
  assert.equal(html, `<div><h2>Solutions</h2></div><div><div class="columns-media"><div><div><p>One.</p><ul><li>Two</li></ul></div><div>${pic}</div></div></div>${meta('CEO')}</div><div><p>After.</p></div>`);
  assert.equal(applyTabPictureColumns(html).panels, 0, 'idempotent');
});

test('the served copy\'s data-tab sections too; other panels and sections stay as they are', () => {
  const served = `<div data-tab="CEO" data-tabs="1"><p>One.</p>${pic}</div>`;
  assert.equal(applyTabPictureColumns(served).panels, 1);
  [
    `<div><p>One.</p>${pic}</div>`, // no tab section
    `<div><p>One.</p>${pic}${pic}${meta('CEO')}</div>`, // two pictures
    `<div><div class="columns-media"><div><div>x</div></div></div>${pic}${meta('CEO')}</div>`, // a block
    `<div>${pic}${meta('CEO')}</div>`, // a picture alone
  ].forEach((doc) => {
    const r = applyTabPictureColumns(doc);
    assert.equal(r.panels, 0);
    assert.equal(r.html, doc);
  });
});

test('a picture first (the Allegris HON Circle / Senators panels, www: the picture left): the picture cell first', () => {
  const doc = `<div>${pic}<p>One.</p><p>Two.</p>${meta('Senators')}</div>`;
  const { html, panels } = applyTabPictureColumns(doc);
  assert.equal(panels, 1);
  assert.equal(html, `<div><div class="columns-media"><div><div>${pic}</div><div><p>One.</p><p>Two.</p></div></div></div>${meta('Senators')}</div>`);
  assert.equal(applyTabPictureColumns(html).panels, 0, 'idempotent');
});

test('the list: 16 READY rows (businesstogo and the start-of-booking pages), the on-board pages held', () => {
  const list = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/reimport-so5-b2b-tab-picture-columns.txt', import.meta.url), 'utf8');
  const ready = listPaths(list);
  assert.equal(ready.length, 16);
  assert.equal(ready.filter((p) => p.endsWith('/program/businesstogo')).length, 4);
  assert.equal(ready.filter((p) => p.endsWith('-start-of-booking')).length, 12);
  assert.equal(ready.some((p) => p.includes('/on-board/')), false);
});
