/* eslint-disable max-len, import/extensions */
/* Standing order 15 of 2026-11-13, item 2: xx/en entertainment-on-board's tab set as a delta on DA's copy, not a
   re-import (which loses DA's 14 per-market section rows, two Edelweiss links and an Austrian picture). Per tab the
   heading it starts at (www's panels); every section in a tab gets DA's tab rows (Tab: <name>, Tabs: 1, as de/en's
   copy writes them); where a tab starts inside a section the section is split there, the new part carrying a verbatim
   copy of the section's own metadata rows. Nothing else changes; the inserts are listed, and removing them gives
   back DA's copy byte for byte (the gate).
   Run: node --test test/tab-sections-apply-so15.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { applyTabSections, removeInserts } from '../tools/importer/tab-sections-apply.mjs';

const META = (rows) => `<div class="section-metadata">${rows.map(([k, v]) => `<div><div><p>${k}</p></div><div><p>${v}</p></div></div>`).join('')}</div>`;
const DA = '<body><header></header><main>'
  + `<div><h1 id="t">Entertainment</h1><p>Intro &amp; more</p><h2 id="a">Air One</h2><p>A text</p><h2 id="b">Bee Air</h2><p><a href="/x?a=1&amp;b=2">B link</a></p>${META([['Style', 'wide-text']])}</div>`
  + `<div><h3>Bee tariffs</h3>${META([['style', 'grey']])}</div>`
  + `<div><h4>Messaging</h4>${META([['style', 'grey'], ['markets', '-bg/en, -kw/en']])}</div>`
  + '<div><p>Bee more</p><h2 id="c">Sea Air</h2><p><picture><img src="./media_1.jpg" alt="Sea"></picture></p></div>'
  + '<div></div></main><footer></footer></body>';
const TABS = [{ name: 'Air One', start: 'Air One' }, { name: 'Bee Air', start: 'Bee Air' }, { name: 'Sea Air', start: 'Sea Air' }];
const TAB = (name) => `<div><div>Tab</div><div>${name}</div></div><div><div>Tabs</div><div>1</div></div>`;

test('sections split where a tab starts, every tab section with its tab rows, the rest byte for byte', () => {
  const { html, inserts, results } = applyTabSections(DA, TABS);
  assert.deepEqual(results.map((r) => r.result), ['found', 'found', 'found']);
  const expected = '<body><header></header><main>'
    + `<div><h1 id="t">Entertainment</h1><p>Intro &amp; more</p>${META([['Style', 'wide-text']])}</div><div>`
    + `<h2 id="a">Air One</h2><p>A text</p><div class="section-metadata"><div><div><p>Style</p></div><div><p>wide-text</p></div></div>${TAB('Air One')}</div></div><div>`
    + `<h2 id="b">Bee Air</h2><p><a href="/x?a=1&amp;b=2">B link</a></p><div class="section-metadata"><div><div><p>Style</p></div><div><p>wide-text</p></div></div>${TAB('Bee Air')}</div></div>`
    + `<div><h3>Bee tariffs</h3><div class="section-metadata"><div><div><p>style</p></div><div><p>grey</p></div></div>${TAB('Bee Air')}</div></div>`
    + `<div><h4>Messaging</h4><div class="section-metadata"><div><div><p>style</p></div><div><p>grey</p></div></div><div><div><p>markets</p></div><div><p>-bg/en, -kw/en</p></div></div>${TAB('Bee Air')}</div></div>`
    + `<div><p>Bee more</p><div class="section-metadata">${TAB('Bee Air')}</div></div><div><h2 id="c">Sea Air</h2><p><picture><img src="./media_1.jpg" alt="Sea"></picture></p><div class="section-metadata">${TAB('Sea Air')}</div></div>`
    + '<div></div></main><footer></footer></body>';
  assert.equal(html, expected);
  assert.equal(removeInserts(html, inserts), DA, 'the gate: without the inserts, DA\'s copy byte for byte');
});

test('a tab start not found, or found twice, changes nothing', () => {
  const missing = applyTabSections(DA, [...TABS, { name: 'Dee', start: 'Dee Air' }]);
  assert.equal(missing.html, DA);
  assert.equal(missing.results[3].result, 'not found');
  const twice = DA.replace('<p>A text</p>', '<p>A text</p><h2>Bee Air</h2>');
  assert.equal(applyTabSections(twice, TABS).html, twice);
});

test('a second run changes nothing (the tab rows are there)', () => {
  const { html } = applyTabSections(DA, TABS);
  const again = applyTabSections(html, TABS);
  assert.equal(again.html, html);
  assert.ok(again.results.every((r) => r.result === 'present'));
});
