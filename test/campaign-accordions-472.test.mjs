/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The campaign template's accordions (brief 472 sweep): www's /de/en/most-significant-route keeps
   "How do I determine the most significant route?" collapsed, and the stopover pages hold their
   FAQ as accordions; the campaign template had no accordion-columns mapping, so the import
   dropped each title and flattened the panels into the page (most-significant-route 1,420 px
   taller at 390, stopover 2,652 px at 1440). It now maps ".accordion" to accordion-columns as the
   other templates do, ahead of columns-media and cards-teaser. 14 documents (the two pages'
   language versions) re-import with it.
   Run: node --max-old-space-size=256 --test test/campaign-accordions-472.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

let created = [];
globalThis.WebImporter = {
  Blocks: {
    createBlock: (document, { name, cells }) => {
      created.push({ name, cells });
      const t = document.createElement('table');
      t.dataset.name = name;
      return t;
    },
  },
};
const { default: parse } = await import('../tools/importer/parsers/accordion-columns.js');
const html = fs.readFileSync(new URL('./fixtures/campaign-accordions/de-en-accordions.html', import.meta.url), 'utf8');
const templates = JSON.parse(fs.readFileSync(new URL('../tools/importer/page-templates.json', import.meta.url), 'utf8'));
const campaign = (templates.templates || templates).find((t) => t.name === 'campaign');
const text = (n) => (n && n.textContent ? n.textContent : String(n || '')).replace(/\s+/g, ' ').trim();

test('the campaign template maps www\'s accordions to accordion-columns, before columns-media and cards-teaser', () => {
  const names = campaign.blocks.map((b) => b.name);
  const acc = campaign.blocks.find((b) => b.name === 'accordion-columns');
  assert.ok(acc, 'accordion-columns is mapped');
  assert.deepEqual(acc.instances, ['.accordion']);
  assert.ok(names.indexOf('accordion-columns') < names.indexOf('columns-media'));
  assert.ok(names.indexOf('accordion-columns') < names.indexOf('cards-teaser'));
});

test('the generated campaign import script uses the accordion parser', () => {
  const js = fs.readFileSync(new URL('../tools/importer/import-campaign.js', import.meta.url), 'utf8');
  assert.ok(js.includes("from './parsers/accordion-columns.js'"));
  assert.ok(js.includes("'accordion-columns': "));
});

test('most-significant-route: its accordion keeps the title and the panel\'s list', () => {
  const { document } = parseHTML(`<html><body>${html}</body></html>`);
  const [first] = document.querySelectorAll('.accordion');
  created = [];
  parse(first, { document });
  assert.equal(created.length, 1);
  assert.match(created[0].name, /^accordion-columns\b/);
  const [title, panel] = created[0].cells[0];
  assert.equal(text(title), 'How do I determine the most significant route?');
  assert.match(text(panel), /crosses a Tariff Conference area first/);
});

test('stopover: the FAQ accordion, one row per question', () => {
  const { document } = parseHTML(`<html><body>${html}</body></html>`);
  const stop = document.querySelectorAll('.accordion')[1];
  const items = stop.querySelectorAll('maui-collapsible-item').length;
  created = [];
  parse(stop, { document });
  assert.equal(created[0].cells.length, items);
  assert.equal(text(created[0].cells[0][0]), 'What is the Lufthansa Stopover Program?');
});
