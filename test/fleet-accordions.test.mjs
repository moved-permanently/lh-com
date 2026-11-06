/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The fleet template and www's accordions (brief 441, item 5: /de/en/lufthansa-first-class-fleet):
   under each aircraft's picture www has a collapsed accordion ("Allegris First Class on the A350 in
   detail": .accordion > maui-collapsible > maui-collapsible-item with the bullet list). The fleet
   template had no accordion mapping, so the lists came in open (4741 px at 1440, www 4157; 6456 at
   390, www 4241). fleet now maps .accordion to accordion-columns, as info does; the parser makes
   the item's headline the question and the list its answer.
   Run: node --max-old-space-size=256 --test test/fleet-accordions.test.mjs */
/* global globalThis */
import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { templates } = JSON.parse(fs.readFileSync(new URL('../tools/importer/page-templates.json', import.meta.url), 'utf8'));

test('fleet maps .accordion to accordion-columns, as info', () => {
  const fleet = templates.find((t) => t.name === 'fleet');
  const block = fleet.blocks.find((b) => b.name === 'accordion-columns');
  assert.ok(block, 'no accordion-columns in fleet');
  assert.deepEqual(block.instances, ['.accordion']);
});

let out;
globalThis.WebImporter = {
  Blocks: {
    createBlock: (document, { name, variants = [], cells }) => {
      out = { name, variants, cells: cells.map((row) => row.map((c) => (Array.isArray(c) ? c.map((n) => n.textContent || '').join('|') : (c && c.textContent) || String(c)))) };
      return document.createElement('table');
    },
  },
};
const { default: parse } = await import('../tools/importer/parsers/accordion-columns.js');

test('the fleet page\'s accordion: its headline and its list', () => {
  const { document } = parseHTML('<html><body><div class="column-view-item"><div class="accordion commonevent"><maui-collapsible class="accordion-maui" theme="lh"><div class="accordionitem commonevent"><maui-collapsible-item headline="Allegris First Class on the A350 in detail" theme="lh"><div><div class="text"><div class="richtext"><ul><li>New cabin interior</li><li>Floor-to-ceiling partitions</li></ul></div></div></div></maui-collapsible-item></div></maui-collapsible></div></div></body></html>');
  parse(document.querySelector('.accordion'), { document });
  assert.match(out.name, /^accordion-columns\b/);
  assert.equal(out.cells.length, 1);
  assert.match(out.cells[0][0], /Allegris First Class on the A350 in detail/);
  assert.match(out.cells[0].join(' '), /New cabin interior/);
});
