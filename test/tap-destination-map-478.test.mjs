/* eslint-disable max-len, import/extensions */
/* destination-grid with the page's map (brief 478, tools/reports/tap/parity.md row 112): www's destinations widget
   (Smartvel's Explore&Go) is one piece, the bar over the list and the map; on phones the map between the bar and the
   list, from 1024 px the list a scrolling column of 365 px at the left of the 790 px map. Here the page's poi-map block
   (its own section, next to the grid's) moves into the grid between the bar and the list, is loaded there and its old
   section goes; the layout is destination-grid.css's (.destination-grid-with-map). Without a poi-map next to it the
   grid is as before. Boolean asserts around linkedom nodes.
   Run: node --max-old-space-size=512 --test test/tap-destination-map-478.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const sheet = {
  data: [
    {
      type: 'destination', id: '1', name: 'Viena', country: 'Áustria', text: 'Graciosa.',
    },
    {
      type: 'destination', id: '2', name: 'Faro', country: 'Portugal', text: 'Sol.',
    },
    { type: 'chip', id: '10', name: 'Cultura' },
  ],
};

function page({ map = true, mapFirst = false } = {}) {
  const grid = '<div class="section destination-grid-container"><div class="destination-grid-wrapper"><div class="destination-grid block" data-block-name="destination-grid" data-block-status="loading"><div><div><a href="/pt-pt/destinations/destination-grid.json">/pt-pt/destinations/destination-grid.json</a></div></div></div></div></div>';
  const poi = '<div class="section poi-map-container" data-section-status="initialized"><div class="poi-map-wrapper"><div class="poi-map block" data-block-name="poi-map" data-block-status="initialized"><div><div>Source</div><div>/pt-pt/destinations/destinations-map.json</div></div></div></div></div>';
  const sections = [grid, ...(map ? [poi] : [])];
  if (mapFirst) sections.reverse();
  const { window, document } = parseHTML(`<!DOCTYPE html><html><body class="brand-tap"><main>${sections.join('')}<div class="section"><p>after</p></div></main></body></html>`);
  globalThis.window = window;
  globalThis.document = document;
  globalThis.fetch = async () => ({ ok: true, json: async () => sheet });
  return document;
}

const { default: decorate } = await import('../blocks/destination-grid/destination-grid.js');

test('the page\'s poi-map moves into the grid between the bar and the list, is loaded there, its section goes', async () => {
  const document = page();
  const block = document.querySelector('.destination-grid');
  const loaded = [];
  await decorate(block, { load: async (b) => { loaded.push(b.dataset.blockName); } });
  assert.ok(block.classList.contains('destination-grid-with-map'));
  const explore = block.querySelector(':scope > .destination-grid-explore');
  assert.ok(explore, 'the explore part');
  assert.ok(explore.firstElementChild.classList.contains('poi-map-wrapper'), 'the map first in it');
  assert.ok(explore.querySelector(':scope > .destination-grid-results > .destination-grid-list'), 'the list after the map');
  assert.equal(block.lastElementChild === explore, true, 'the explore part last in the block');
  assert.deepEqual(loaded, ['poi-map']);
  assert.equal(document.querySelectorAll('.poi-map-container').length, 0, 'the map\'s old section is gone');
  assert.equal(document.querySelectorAll('.poi-map').length, 1);
  assert.equal(block.querySelectorAll('.destination-grid-card').length, 2);
});

test('a map before the grid (an earlier section) moves too; one already loaded is not loaded again', async () => {
  const document = page({ mapFirst: true });
  document.querySelector('.poi-map').dataset.blockStatus = 'loaded';
  const block = document.querySelector('.destination-grid');
  const loaded = [];
  await decorate(block, { load: async (b) => { loaded.push(b); } });
  assert.ok(block.querySelector('.destination-grid-explore > .poi-map-wrapper'));
  assert.equal(loaded.length, 0);
});

test('no poi-map next to the grid: the grid as before', async () => {
  const document = page({ map: false });
  const block = document.querySelector('.destination-grid');
  await decorate(block, { load: async () => { throw new Error('not called'); } });
  assert.ok(!block.classList.contains('destination-grid-with-map'));
  assert.ok(!block.querySelector('.destination-grid-explore'));
  assert.ok(block.querySelector(':scope > .destination-grid-list'));
});

test('the layout: map above the list on phones; from 1024 px the 365 px list column scrolling beside the 790 px map; the map\'s regions hidden', () => {
  const css = fs.readFileSync(new URL('../blocks/destination-grid/destination-grid.css', import.meta.url), 'utf8');
  const part = css.slice(css.indexOf('with the page\'s map (brief 478'));
  assert.ok(part.length > 100, 'the section of the rules');
  assert.match(part, /\.destination-grid-with-map \.poi-map-tap \.poi-map-regions \{\s+display: none;/);
  assert.match(part, /\.destination-grid-with-map \.destination-grid-explore \{\s+display: grid;\s+grid-template-columns: 365px minmax\(0, 1fr\);\s+gap: 16px;/);
  assert.match(part, /\.destination-grid-with-map \.destination-grid-results \{\s+grid-column: 1;\s+grid-row: 1;\s+height: 790px;\s+overflow-y: auto;/);
  assert.match(part, /\.destination-grid-with-map \.poi-map-tap \.poi-map-view \{\s+height: 790px;/);
  assert.match(part, /\.destination-grid-with-map \.destination-grid-list \{\s+grid-template-columns: minmax\(0, 1fr\);/);
});
