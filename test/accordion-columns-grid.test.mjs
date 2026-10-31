/* The accordion-columns block's image grid (blocks/accordion-columns/accordion-columns.js
   buildGrids): a one-row table whose cells all hold a picture (the import's item grid,
   /handgepaeck, /carry-on-baggage, Discover's families) becomes a grid of items; a data table
   (several rows, or cells without pictures) stays a table. Run: node --test test/*.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.location = {
  hostname: 'lufthansa.turnsthe.page', pathname: '/de/de/handgepaeck', search: '', href: 'https://lufthansa.turnsthe.page/de/de/handgepaeck', origin: 'https://lufthansa.turnsthe.page',
};
Object.defineProperty(window, 'origin', { value: 'https://lufthansa.turnsthe.page', configurable: true });
globalThis.window = window;
globalThis.document = document;
const { buildGrids } = await import('../blocks/accordion-columns/accordion-columns.js');

const panelOf = (html) => {
  const div = document.createElement('div');
  div.className = 'accordion-columns-panel';
  div.innerHTML = html;
  return div;
};
const cell = (alt, text) => `<td><p><picture><img src="/media_${alt}.png" alt="${alt}"></picture></p><p><strong>${text}</strong></p></td>`;

test('a one-row table of picture cells becomes a grid of items, in order, the count as a property', () => {
  const panel = panelOf(`<p>Intro</p><table><tbody><tr>${cell('a', 'Kleidersack')}${cell('b', 'Buggy')}${cell('c', 'Einkauf')}${cell('d', 'Musik')}</tr></tbody></table><p>Bitte beachten</p>`);
  buildGrids(panel);
  assert.ok(panel.querySelector('table') === null, 'no table');
  const grid = panel.querySelector('.accordion-columns-grid');
  assert.ok(grid);
  assert.equal(grid.style.getPropertyValue('--accordion-columns-grid-count'), '4');
  const items = [...grid.querySelectorAll(':scope > .accordion-columns-grid-item')];
  assert.deepEqual(items.map((i) => i.querySelector('img').getAttribute('alt')), ['a', 'b', 'c', 'd']);
  assert.equal(items[0].querySelector('strong').textContent, 'Kleidersack');
  assert.deepEqual([...panel.children].map((n) => n.className || n.textContent), ['Intro', 'accordion-columns-grid', 'Bitte beachten']);
});

test('data tables stay tables: several rows, or a row without pictures', () => {
  const fees = panelOf('<table><tbody><tr><td>Zone</td><td>Gebühr</td></tr><tr><td>Europa</td><td>EUR 85</td></tr></tbody></table>');
  buildGrids(fees);
  assert.ok(fees.querySelector('table'));
  assert.ok(fees.querySelector('.accordion-columns-grid') === null, 'no .accordion-columns-grid');
  const oneRow = panelOf(`<table><tbody><tr>${cell('a', 'A')}<td>Text only</td></tr></tbody></table>`);
  buildGrids(oneRow);
  assert.ok(oneRow.querySelector('table'), 'a cell without a picture: not an item grid');
});
