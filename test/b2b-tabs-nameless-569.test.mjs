/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* The brief after d9cf2340, item 3 (lh-b2b, functional first): meals-on-board's tab control. www's has ten panels; the
   eighth has no name ("Lufthansa Business Class: New catering concept…", www draws an empty tab before "Lufthansa").
   The importer's tab sections (withTabMarkers, splitTabSections: Tab and Tabs section metadata, scripts/section-tabs.js)
   wrote that panel without a Tab label, so the set broke in two there (seven tabs, then Lufthansa and SWISS) and its
   content stood between them. A panel without a name is now part of the panel after it (its content is that airline's):
   one set of nine labelled tabs, nothing hidden, no tab without a name (WCAG 4.1.2). A last panel without a name joins
   the one before it.
   Input: the tab control as b2b-snapshots-011 and b2b-parity-003 hold it (its panels' names and first h2s).
   Run: node --max-old-space-size=256 --test test/b2b-tabs-nameless-569.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { mappedOf, withNamedTabPanels } from '../tools/importer/b2b-import.mjs';
import { splitTabSections } from '../tools/importer/swiss-import.mjs';

const tabs = fs.readFileSync(new URL('./fixtures/b2b-tabs/meals-on-board-tabs.html', import.meta.url), 'utf8').replace(/^<!--.*-->\n/, '');
const page = (body) => `<html><head><title>T</title></head><body><main><div class="container-content">${body}</div></main></body></html>`;
const marks = (html) => [...html.matchAll(/@@tab@@(\d+)@@(.*?)@@/g)].map((m) => `${m[1]} ${m[2]}`);

test('meals-on-board: the nameless panel is part of the Lufthansa panel, one set of nine labelled tabs', () => {
  const got = marks(mappedOf(page(tabs)));
  assert.deepEqual(got, ['1 Special meals &amp; catering', '1 Air Dolomiti', '1 Austrian Airlines', '1 Brussels Airlines', '1 Discover Airlines', '1 Edelweiss', '1 Eurowings', '1 Lufthansa', '1 Lufthansa', '1 SWISS']);
  // the sections splitTabSections makes of it: the two Lufthansa sections one panel (scripts/section-tabs.js: a section
  // with the label of the one before it is a part of that panel)
  const doc = `<div>${got.map((m) => `<p>@@tab@@${m.replace(' ', '@@')}@@</p><h2>${m}</h2>`).join('')}<p>@@tabs-end@@</p></div>`;
  const labels = [...splitTabSections(doc).matchAll(/<div><div>Tab<\/div><div>([^<]*)<\/div><\/div>/g)].map((m) => m[1]);
  assert.equal(labels.filter((l) => !l.trim()).length, 0, 'no section without its label');
  assert.deepEqual([...new Set(labels)], ['Special meals & catering', 'Air Dolomiti', 'Austrian Airlines', 'Brussels Airlines', 'Discover Airlines', 'Edelweiss', 'Eurowings', 'Lufthansa', 'SWISS'], 'the labels (entities decoded)');
});

test('a last panel without a name joins the one before it; named panels as they were', () => {
  const p = (name) => `<maui-tab-control-panel-responsive name="${name}"><p>${name || 'x'}</p></maui-tab-control-panel-responsive>`;
  assert.equal(withNamedTabPanels(`<div class="tabs panelcontainer">${p('A')}${p('')}</div>`), `<div class="tabs panelcontainer">${p('A')}${p('A').replace('<p>A</p>', '<p>x</p>')}</div>`);
  assert.equal(withNamedTabPanels(`<div class="tabs panelcontainer">${p('A')}${p('B')}</div>`), `<div class="tabs panelcontainer">${p('A')}${p('B')}</div>`);
});
