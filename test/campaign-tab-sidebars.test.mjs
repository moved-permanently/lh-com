/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The campaign template's sidebars (tools/importer/page-templates.json, import-campaign.js): brief
   441 kept a sidebar that follows a text in a multi-column row's column (/de/en/100-years/campaigns'
   "Made in Germany" picture) inside that row, with `.sidebar:not(.column-view-item > * ~ .sidebar)`.
   That also dropped the four sidebars of xx/{hk,pt,ru}/book-and-manage/stopover's Munich tab
   panels (maui-tab-control-panel-responsive > div > .onecolumn > … > .column-view-item > .text +
   .sidebar + .twocolumn + .sidebar): imported as loose headings and paragraphs, not as
   columns-media sidebar blocks (brief 455). Only a sidebar inside a multi-column row's column is
   the row's; one in a one-column view's item is a block of its own, as de/en's document has them.
   Fixtures shaped like the two snapshots. Run: node --test test/campaign-tab-sidebars.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { templates } = JSON.parse(fs.readFileSync(new URL('../tools/importer/page-templates.json', import.meta.url), 'utf8'));
const campaign = templates.find((t) => t.name === 'campaign');
const sidebarSelector = campaign.blocks.find((b) => b.name === 'columns-media').instances.find((s) => s.startsWith('.sidebar'));

const sidebar = (title) => `<div class="sidebar event"><div class="airem-sidebar"><div class="sidebar-content"><div class="image"><img src="x.jpg" alt=""></div></div><div class="sidebar-aside"><div class="headline"><h2>${title}</h2></div><div class="text"><p>Text</p></div></div></div></div>`;
const STOPOVER = `<div class="section"><div><div class="section-content"><div class="tabs"><maui-tab-control-responsive>
  <maui-tab-control-panel-responsive name="History and Culture in Munich"><div><div class="onecolumn column event"><div class="column-view"><div><h2>Take off into the past</h2></div><div class="row"><div class="col-lg column-view-item">
    <div class="text"><p>Munich, the cultural capital</p></div>${sidebar('Once upon a time')}
    <div class="twocolumn column"><div class="column-view"><div class="row"><div class="column-view-item"><div class="headline"><h2>Take a creative break</h2></div></div><div class="column-view-item"><div class="image"><img src="y.jpg" alt=""></div></div></div></div></div>
    ${sidebar('Melodious nights')}
  </div></div></div></div></div></maui-tab-control-panel-responsive>
</maui-tab-control-responsive></div></div></div></div>`;
const CAMPAIGNS = `<div class="section"><div><div class="section-content"><div class="twocolumn column"><div class="column-view"><div class="row">
  <div class="column-view-item"><div class="text"><p>Made in Germany</p></div>${sidebar('Made in Germany')}</div>
  <div class="column-view-item"><div class="image"><img src="z.jpg" alt=""></div></div>
</div></div></div></div></div></div>`;
const ALONE = `<div class="section"><div><div class="section-content"><div class="onecolumn"><div class="column-view"><div class="row"><div class="column-view-item">${sidebar('Under the symbol of the crane')}</div></div></div></div></div></div></div>`;

const matched = (html) => {
  const { document } = parseHTML(`<html><body>${html}</body></html>`);
  return [...document.querySelectorAll(sidebarSelector)].map((s) => s.querySelector('h2').textContent);
};

test('stopover\'s tab panels: both sidebars of a one-column item are columns-media blocks', () => {
  assert.deepEqual(matched(STOPOVER), ['Once upon a time', 'Melodious nights']);
});

test('100-years/campaigns: a sidebar after a text in a two-column row\'s column stays the row\'s', () => {
  assert.deepEqual(matched(CAMPAIGNS), []);
});

test('a sidebar alone in its column item stays a block', () => {
  assert.deepEqual(matched(ALONE), ['Under the symbol of the crane']);
});

test('import-campaign.js and its bundle carry the template\'s selector', () => {
  const script = fs.readFileSync(new URL('../tools/importer/import-campaign.js', import.meta.url), 'utf8');
  const bundle = fs.readFileSync(new URL('../tools/importer/import-campaign.bundle.js', import.meta.url), 'utf8');
  const quoted = JSON.stringify(sidebarSelector);
  assert.ok(script.includes(quoted), 'import-campaign.js');
  assert.ok(bundle.includes(quoted), 'the bundle');
});
