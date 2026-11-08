/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* lufthansa.com's info template (tools/importer/page-templates.json), the brief after 473, item 4:
   /de/en/lufthansa-group-star-alliance-and-partner-airlines' 26 partner logos sit in a four-column view
   nested in two one-column views (a text view, then the grid). No info selector took it, so the
   logos came in as 26 full-width pictures (the page 8,116 px taller than www's at 1440). info's
   columns-media now takes a picture-only three- or four-column view nested so: one row per source
   row, a linked logo per cell (as www's four per row; stacked on phones). A grid with headings,
   text or teasers stays as before. The fixture is the snapshot's structure (xx/it, two logos).
   Run: node --test test/info-template-474.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { templates } = JSON.parse(fs.readFileSync(new URL('../tools/importer/page-templates.json', import.meta.url), 'utf8'));
const instances = (template, name) => templates.find((t) => t.name === template).blocks.filter((b) => b.name === name).flatMap((b) => b.instances || []);

const logo = (href, src) => `<div class="col-md-6 col-lg column-view-item"><div class="image parbase section"><div class="image-wrapper"><a href="${href}" target="_blank"><figure><img src="${src}" alt=""></figure></a></div></div></div>`;
const nested = (inner) => `<div class="section-content container-fluid"><div class="onecolumn column event section"><div class="column-view flex-column"><div class="row"><div class="col-lg column-view-item">
  <div class="text"><div class="richtext"><p>Le linee aeree partner sono:</p></div></div>
  <div class="onecolumn column event"><div class="column-view flex-column"><div class="row"><div class="col-lg column-view-item">${inner}</div></div></div></div>
</div></div></div></div></div>`;
const GRID = nested(`<div class="fourcolumn column event"><div class="column-view flex-column"><div class="row">${logo('https://www.aegeanair.com', '/content/dam/lh/aegean.jpg')}${logo('https://www.aircanada.com', '/content/dam/lh/air-canada.jpg')}</div></div></div>`);
const CARDS = nested('<div class="fourcolumn column event"><div class="column-view flex-column"><div class="row"><div class="column-view-item"><div class="image"><img src="/a.jpg" alt=""></div><div class="headline"><h3>Title</h3></div><div class="text"><p>Text</p></div></div></div></div></div>');
const taken = (html, sels) => {
  const { document } = parseHTML(`<html><body>${html}</body></html>`);
  const grid = document.querySelector('.fourcolumn');
  return sels.some((s) => { try { return !!grid.closest(s); } catch (e) { return false; } });
};

test('info\'s columns-media takes the partner logo grid nested in two one-column views', () => {
  assert.ok(taken(GRID, instances('info', 'columns-media')), 'a columns-media selector takes it');
});

test('a nested grid with headings and text is not taken by the new selector', () => {
  const sel = instances('info', 'columns-media').filter((s) => s.includes('> .onecolumn > .column-view > .row > .column-view-item > .onecolumn'));
  assert.ok(sel.length === 1, 'one nested-grid selector');
  assert.ok(!taken(CARDS, sel), 'cards stay as before');
});

/* /de/en/baggage-irregularities: each tab's "Procedure" is a four-column view (a numbered picture, the
   step's heading, its text and links per column) in the tab panel; info's tab-panel column views with
   pictures took two and three columns only, so the four steps came in one under the other (the page
   1,740 px taller at 1440). Four columns now too. */
const step = (n) => `<div class="col-md-6 col-lg column-view-item"><div class="image parbase section"><figure><img src="/content/dam/lh/lh_number_0${n}.png" alt=""></figure></div><div class="headline section"><h3>Step ${n}</h3></div><div class="text section"><div class="richtext"><p>Text ${n}.</p></div></div></div>`;
const STEPS = `<maui-tab-control-responsive><maui-tab-control-panel-responsive name="Delayed baggage"><div><div class="fourcolumn column event"><div class="column-view flex-column"><div><h2>Procedure for delayed baggage</h2></div><div class="row">${[1, 2, 3, 4].map(step).join('')}</div></div></div></div></maui-tab-control-panel-responsive></maui-tab-control-responsive>`;

test('info\'s columns-media takes a four-column view with pictures in a tab panel, as two and three', () => {
  assert.ok(taken(STEPS, instances('info', 'columns-media')), 'a columns-media selector takes it');
  const sel = instances('info', 'columns-media').filter((s) => s.startsWith('maui-tab-control-panel-responsive '));
  assert.ok(sel.length === 1 && sel[0].includes(':is(.twocolumn, .threecolumn, .fourcolumn)'), sel.join(' | '));
});

/* /de/en/lufthansa-express-bus: the three route maps (a map, the route, a jump link "Details on arrival
   and departure times" down to its accordion) are a three-column view in a one-column view; info's
   nested-view selector leaves views with such jump links alone (they are jump-link lists), so the maps
   came in full width one under the other (the page 1,821 px taller at 1440). A view whose columns hold
   pictures is columns-media even with a jump link; a view of jump links alone stays as before. */
const route = (n) => `<div class="col-md-6 col-lg column-view-item"><div class="image parbase section"><figure><img src="/content/dam/lh/route-${n}.png" alt=""></figure></div><div class="text section"><div class="richtext"><p><b>Route ${n}</b></p></div></div><div class="link"><maui-navigation-link href="#acc${n}" variant="anchor-down">Details</maui-navigation-link></div></div>`;
const inOne = (inner) => `<div class="section-content container-fluid"><div class="onecolumn column event section"><div class="column-view flex-column"><div class="row"><div class="col-lg column-view-item">${inner}</div></div></div></div></div>`;
const ROUTES = inOne(`<div class="threecolumn column event"><div class="column-view flex-column"><div class="row">${[1, 2, 3].map(route).join('')}</div></div></div>`);
const JUMPS = inOne('<div class="threecolumn column event"><div class="column-view flex-column"><div class="row"><div class="column-view-item"><div class="link"><maui-navigation-link href="#a" variant="anchor-down">A</maui-navigation-link></div></div><div class="column-view-item"><div class="link"><maui-navigation-link href="#b" variant="anchor-down">B</maui-navigation-link></div></div></div></div></div>');
const takenThree = (html, sels) => {
  const { document } = parseHTML(`<html><body>${html}</body></html>`);
  const grid = document.querySelector('.threecolumn');
  return sels.some((s) => { try { return !!grid.closest(s); } catch (e) { return false; } });
};

test('info\'s columns-media takes nested route maps with jump links; a view of jump links alone stays as before', () => {
  assert.ok(takenThree(ROUTES, instances('info', 'columns-media')), 'the route maps');
  assert.ok(!takenThree(JUMPS, instances('info', 'columns-media')), 'jump links alone');
});

/* The legal template (/de/en/data-collection-usa, -canada: 2,282 and 1,466 px taller than www's at 1440)
   had no mapping for two components info maps: the lone partner teaser ("Important: Mandatory
   attestation…", an icon, a heading link) came in as a full-width icon picture over a heading, and
   the three-column "This might also interest you" view one card under the other. legal now uses
   info's selectors for both. */
test('legal maps the lone partner teaser to cards-icon-text and three- and four-column views to columns-media, with info\'s selectors', () => {
  const partner = '.section-content > .teaser:has(> a.teaser.partner)';
  assert.ok(instances('info', 'cards-icon-text').includes(partner) && instances('legal', 'cards-icon-text').includes(partner), 'the partner teaser');
  const grid = instances('info', 'columns-media').find((s) => s.startsWith(':is(.section-content, .container-content) > :is(.threecolumn, .fourcolumn):not('));
  assert.ok(grid && instances('legal', 'columns-media').includes(grid), 'the three/four-column views');
  assert.ok(instances('legal', 'columns-media').includes('.section-content > .twocolumn'), 'its two-column views as before');
});

/* /de/en/advice-for-travellers-with-special-needs-to-and-from-the-usa (complaint officer) and
   …/cognitive-impairment (cabinblu): a sidebar whose aside is a pictogram and whose content holds a
   two-column view (By post | Online). info's sidebar selector leaves out sidebars with a column view
   inside, so the text came flat and the pictogram as a full-width picture after it (the pages 670 to
   810 px taller at 1440). Such a sidebar is columns-media (sidebar) now; one with an accordion, a
   table, teasers or a column view in its aside stays as before. */
const sidebar = (content, aside) => `<div class="section-content container-fluid"><div class="sidebar event section"><div class="airem-sidebar d-md-flex"><div class="sidebar-content">${content}</div><div class="sidebar-aside">${aside}</div></div></div></div>`;
const TWO = '<div class="twocolumn column event"><div class="column-view flex-column"><div class="row"><div class="column-view-item"><div class="text"><p>By post</p></div></div><div class="column-view-item"><div class="text"><p>Online</p></div></div></div></div></div>';
const PICTO = '<div class="image parbase section"><figure><img src="/content/dam/lh/icons/lh_accessibility_usa_icons04.svg" alt=""></figure></div>';
const takenSidebar = (html) => {
  const { document } = parseHTML(`<html><body>${html}</body></html>`);
  const el = document.querySelector('.sidebar');
  return instances('info', 'columns-media').some((s) => { try { return !!el.closest(s); } catch (e) { return false; } });
};

test('info\'s columns-media takes a sidebar with a pictogram aside and a two-column view in its content', () => {
  assert.ok(takenSidebar(sidebar(`<div class="text"><p>If a problem arises…</p></div>${TWO}`, PICTO)), 'the complaint officer');
  assert.ok(!takenSidebar(sidebar(`${TWO}<div class="accordion"><maui-collapsible></maui-collapsible></div>`, PICTO)), 'with an accordion: as before');
  assert.ok(!takenSidebar(sidebar(TWO, '<div class="text"><p>No picture</p></div>')), 'an aside without a picture: as before');
});
