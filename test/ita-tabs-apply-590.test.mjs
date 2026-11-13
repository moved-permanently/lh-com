/* eslint-disable max-len, import/extensions -- dev tooling */
/* ITA's tab sets into DA's copies as they are (standing order 7 of 2026-11-12, item 1: reimport-589-ita-fleet-tabs.txt;
   a fresh import of fleet/short-haul and long-haul gives the Tab sections but drops DA's market sections, the A330-900neo
   table of au/en, be/en, ... and more). tools/importer/ita-tabs-apply.mjs cuts DA's copy into Tab sections where each
   panel starts (data from the recording: the panel's label and the start of its first element's text, or its picture's
   file), up to the element that ends the set. Every element keeps its section's metadata (markets, style); a section cut
   in two gives both pieces the same rows; a panel's pieces get "Tab"; nothing else changes.
   Run: node --test test/ita-tabs-apply-590.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { applyTabs, checkTabs } from '../tools/importer/ita-tabs-apply.mjs';

const meta = (rows) => `<div class="section-metadata">${rows.map(([k, v]) => `<div><div><p>${k}</p></div><div><p>${v}</p></div></div>`).join('')}</div>`;
const doc = (main) => `<body><header></header><main>${main}</main><footer></footer></body>`;
const DA = doc([
  '<div><h1>Long-Haul Fleet</h1><p>For intercontinental routes we fly.</p><p>Our Airbus A350-900 is designed for you.</p><h2>Specifications</h2></div>',
  `<div><div class="table-striped"><div><div>Seats</div><div>319</div></div></div>${meta([['markets', '-au/en, -be/en']])}</div>`,
  `<div><div class="table-striped"><div><div>Seats</div><div>334</div></div></div>${meta([['markets', 'au/en, be/en']])}</div>`,
  '<div><p><picture><img src="https://www.ita-airways.com/x/a350-900/A350_1200X200.jpg" alt="Seat map"></picture></p></div>',
  `<div><p>The A330-900neo is versatile.</p>${meta([['markets', '-au/en, -be/en']])}</div>`,
  `<div>${meta([['markets', 'au/en, be/en']])}</div>`,
  `<div><p>The A330-200neo is a wide-body airliner.</p><h2>Specifications</h2>${meta([['Style', 'divider-below']])}</div>`,
  `<div><div class="columns-media"><div><div>Choose your favorite seat</div></div></div>${meta([['style', 'column-band, grey']])}</div>`,
  '<div><div class="metadata"><div><div>nav</div><div>/it/en/nav</div></div></div></div>',
].join(''));
const SPEC = {
  panels: [
    { label: 'Airbus A350-900', first: 'Our Airbus A350-900 is designed' },
    { label: 'Airbus A330 Neo', first: 'The A330-900neo is versatile' },
    { label: 'Airbus A330-200', first: 'The A330-200neo is a wide-body' },
  ],
  end: 'Choose your favorite seat',
};

const tabsOf = (html) => [...html.matchAll(/<div><div>Tab<\/div><div>([^<]*)<\/div><\/div>/g)].map((m) => m[1]);

test('the set: each panel from its first element to the next, Tab on every piece, in order', () => {
  const { html, problems } = applyTabs(DA, SPEC);
  assert.deepEqual(problems, []);
  assert.deepEqual(tabsOf(html), ['Airbus A350-900', 'Airbus A350-900', 'Airbus A350-900', 'Airbus A350-900', 'Airbus A330 Neo', 'Airbus A330 Neo', 'Airbus A330-200']);
});

test('a section cut where a panel starts: both pieces keep its rows, the first without Tab', () => {
  const { html } = applyTabs(DA, SPEC);
  assert.match(html, /<main><div><h1>Long-Haul Fleet<\/h1><p>For intercontinental routes we fly\.<\/p><\/div><div><p>Our Airbus A350-900 is designed for you\.<\/p><h2>Specifications<\/h2><div class="section-metadata"><div><div>Tab<\/div><div>Airbus A350-900<\/div><\/div><\/div><\/div>/);
  assert.match(html, /<p>The A330-200neo is a wide-body airliner\.<\/p><h2>Specifications<\/h2><div class="section-metadata"><div><div><p>Style<\/p><\/div><div><p>divider-below<\/p><\/div><\/div><div><div>Tab<\/div><div>Airbus A330-200<\/div><\/div><\/div>/);
});

test('the market sections: their rows kept, an empty one inside a panel gets the panel\'s Tab', () => {
  const { html } = applyTabs(DA, SPEC);
  assert.match(html, /<div>319<\/div><\/div><\/div><div class="section-metadata"><div><div><p>markets<\/p><\/div><div><p>-au\/en, -be\/en<\/p><\/div><\/div><div><div>Tab<\/div><div>Airbus A350-900<\/div><\/div><\/div>/);
  assert.match(html, /<div><div class="section-metadata"><div><div><p>markets<\/p><\/div><div><p>au\/en, be\/en<\/p><\/div><\/div><div><div>Tab<\/div><div>Airbus A330 Neo<\/div><\/div><\/div><\/div>/);
});

test('after the set as before: the band and the page metadata untouched', () => {
  const { html } = applyTabs(DA, SPEC);
  const tail = DA.slice(DA.indexOf('<div><div class="columns-media">'));
  assert.ok(html.endsWith(tail));
});

test('the check: the same elements in the same order, each with its section\'s rows (Tab aside)', () => {
  const { html } = applyTabs(DA, SPEC);
  assert.deepEqual(checkTabs(DA, html), []);
  const lost = html.replace('<p>The A330-900neo is versatile.</p>', '');
  assert.ok(checkTabs(DA, lost).length > 0, 'an element lost');
  const moved = html.replace('<div><div><p>markets</p></div><div><p>au/en, be/en</p></div></div><div><div>Tab</div><div>Airbus A350-900</div></div>', '<div><div>Tab</div><div>Airbus A350-900</div></div>');
  assert.ok(checkTabs(DA, moved).length > 0, 'a market row lost');
});

test('a panel start not found, or out of order: problems and no change', () => {
  const bad = { ...SPEC, panels: [...SPEC.panels, { label: 'Airbus A319', first: 'The Airbus A319 is' }] };
  const r = applyTabs(DA, bad);
  assert.ok(r.problems.length > 0);
  assert.equal(r.html, DA);
  const swapped = { ...SPEC, panels: [SPEC.panels[1], SPEC.panels[0], SPEC.panels[2]] };
  assert.ok(applyTabs(DA, swapped).problems.length > 0);
});

test('a document with Tab sections already: left as it is', () => {
  const tabbed = DA.replace('<div><p>The A330-900neo', '<div><p>x</p><div class="section-metadata"><div><div>Tab</div><div>X</div></div></div></div><div><p>The A330-900neo');
  const r = applyTabs(tabbed, SPEC);
  assert.equal(r.html, tabbed);
  assert.match(r.problems.join(' '), /Tab sections already/);
});

test('a picture as a panel start: its file name', () => {
  const spec = { panels: [{ label: 'Map', first: 'img:A350_1200X200.jpg' }], end: 'The A330-900neo is versatile' };
  const { html, problems } = applyTabs(DA, spec);
  assert.deepEqual(problems, []);
  assert.deepEqual(tabsOf(html), ['Map']);
});

test('the data and the list agree: every path a READY row, its panels the row\'s tabs in order', async () => {
  const fs = await import('node:fs');
  const data = JSON.parse(fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/ita-fleet-tabs-590.json', import.meta.url), 'utf8'));
  const rows = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/reimport-589-ita-fleet-tabs.txt', import.meta.url), 'utf8').split('\n').filter((l) => l && !l.startsWith('#')).map((l) => l.split('\t'));
  Object.entries(data).forEach(([p, spec]) => {
    const row = rows.find((r) => r[0] === p);
    assert.ok(row, p);
    assert.match(row[6], /^READY\b/);
    assert.deepEqual(spec.panels.map((x) => x.label), row[2].split(' | '));
    assert.ok(spec.end && spec.panels.every((x) => x.first.length >= 20));
  });
});
