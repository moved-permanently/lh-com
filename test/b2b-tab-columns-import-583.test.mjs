/* eslint-disable max-len, import/extensions -- dev tooling */
/* The standing order of 2026-11-10 evening, decision 3: a tab panel's text-only two- or three-column view whose items open
   with a heading (the Allegris start-of-booking pages' FRA / MUC lists) gets the class b2b-tab-columns from the B2B
   importer (withB2bComponents), which the info template's B2B selector makes a Columns Media (side by side, as www's).
   A scratch import of the six Allegris documents writes both panels' views as Columns Media. Of the B2B snapshots, also the
   entertainment-on-board pages (de/en, ch/en, xx/en) get it.
   Run: node --max-old-space-size=384 --test test/b2b-tab-columns-import-583.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { withB2bComponents, isTabTextColumns } from '../tools/importer/b2b-import.mjs';

const item = (inner) => `<div class="col-md-6 column-view-item">${inner}</div>`;
const view = (items) => `<div class="twocolumn column event"><div class="column-view"><div class="row">${items}</div></div></div>`;
const TEXT = view(`${item('<div class="headline"><h3>From Frankfurt (FRA)</h3></div><div class="text"><ul><li>Austin</li></ul></div>')}${item('<div class="headline"><h3>From Munich (MUC)</h3></div><div class="text"><p>Chicago</p></div>')}`);

test('a tab panel\'s text-only view with headed items gets the class; outside a tab panel it does not', () => {
  const inPanel = withB2bComponents(`<maui-tab-control-panel-responsive>${TEXT}</maui-tab-control-panel-responsive>`);
  assert.ok(inPanel.includes('<div class="b2b-tab-columns twocolumn column event">'), inPanel.slice(0, 200));
  assert.ok(!withB2bComponents(`<div class="container-content">${TEXT}</div>`).includes('b2b-tab-columns'));
});

test('not with a picture, or an item that opens with text', () => {
  assert.equal(isTabTextColumns(view(`${item('<h3>A</h3><img src="x.jpg">')}${item('<h3>B</h3>')}`)), false);
  assert.equal(isTabTextColumns(view(`${item('<p>Text first</p><h3>A</h3>')}${item('<h3>B</h3>')}`)), false);
  assert.equal(isTabTextColumns(TEXT), true);
});

test('the info template and the Austrian ones take the class as a Columns Media', () => {
  const sel = 'maui-tab-control-panel-responsive :is(.twocolumn, .threecolumn).b2b-tab-columns';
  const { templates } = JSON.parse(fs.readFileSync('tools/importer/page-templates.json', 'utf8'));
  ['info', 'austrian-checkin', 'austrian-flight-status', 'austrian-hero-banner'].forEach((name) => {
    const cm = templates.find((t) => t.name === name).blocks.find((b) => b.name === 'columns-media');
    assert.ok(cm.instances.includes(sel), name);
  });
  assert.ok(fs.readFileSync('tools/importer/import-info.bundle.js', 'utf8').includes(sel), 'the info bundle rebuilt');
});
