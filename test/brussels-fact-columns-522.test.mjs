/* eslint-disable max-len, import/extensions -- dev tooling */
/* The brief after 521, item 2 (Brussels' ranking row 8, /be/fr/flying-with-us/new-destinations +8.8 % at 1440): each destination's
   facts (Vols par semaine / 2, Distance / 6 773 km, Durée du vol, Code de l'aéroport, Appareil) are a three-column view of
   headline pairs on www, in the page's sidebar content (.sidebar-content); lh-com's info importer maps a three-column view
   into columns-media only under .section-content or .container-content, so in the sidebar the ten headlines came in
   stacked (+162 / +192 px a destination). withFactColumns: a three- or four-column view in a sidebar's content whose
   items hold headlines only gets a container-content wrapper of its own, so the importer finds it; the sidebar's other
   column views (pictures, text, links: travel-regulations, connecting-africa) stay as they are.
   Markup: the recording of www.brusselsairlines.com/be/fr/flying-with-us/new-destinations (brief 497), trimmed.
   Run: node --max-old-space-size=256 --test test/brussels-fact-columns-522.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const item = (label, value) => `<div class="col-md-6 col-lg column-view-item"><div class="headline section"><h4 class="headline heading-copytext-large   " tabindex="0">${label}</h4></div><div class="headline section"><h4 class="headline heading-small   " tabindex="0">${value}</h4></div></div>`;
const facts = `<div class="threecolumn column event section"><div class="column-view flex-column "><div class="row">${item('Vols par semaine', '2')}${item('Distance', '6&nbsp;773&nbsp;km')}${item('Durée du vol', '9 h 15 min')}</div></div></div>`;
const pictures = '<div class="threecolumn column event section"><div class="column-view flex-column "><div class="row"><div class="col-lg column-view-item"><div class="image parbase section"><img src="/a.jpg"></div><div class="headline section"><h3>A</h3></div></div></div></div></div>';
const sidebar = (inner) => `<div class="sidebar event"><div class="airem-sidebar d-md-flex"><div class="sidebar-content col-sidebar-content"><div class="headline section"><h2>Kilimandjaro, Tanzanie</h2></div>${inner}</div><div class="sidebar-aside"></div></div></div>`;

test('a headline-only three-column view in a sidebar\'s content gets a container-content wrapper', async () => {
  const { withFactColumns } = await import('../tools/importer/brussels-import.mjs');
  assert.equal(withFactColumns(sidebar(facts)), sidebar(`<div class="container-content">${facts}</div>`));
  assert.equal(withFactColumns(withFactColumns(sidebar(facts))), sidebar(`<div class="container-content">${facts}</div>`), 'once');
});

test('a column view with pictures or text, or one outside a sidebar, stays', async () => {
  const { withFactColumns } = await import('../tools/importer/brussels-import.mjs');
  assert.equal(withFactColumns(sidebar(pictures)), sidebar(pictures));
  const top = `<div class="section-content">${facts}</div>`;
  assert.equal(withFactColumns(top), top);
});

test('the import runs it after withSidebarContent (the mapped copy\'s chain)', () => {
  const src = fs.readFileSync(new URL('../tools/importer/brussels-import.mjs', import.meta.url), 'utf8');
  assert.match(src.match(/const mapped = (.*)/)[1], /withFactColumns\(withSidebarContent\(/);
});
