/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The campaign template's tables (brief 472 sweep): www's /de/en/100-years/fleet shows a spec table
   (Engine, Speed, Take-off weight, Range, Seats) beside each aircraft's picture, 15 in all; the
   campaign template had no table mapping and its columns-media selector took the whole two-column
   view, so none of the tables reached the documents (the page 9,685 px shorter than www's at 1440).
   It now maps them to table-striped as info and legal do, and leaves a two-column view with a
   table out of columns-media, as fleet does. 7 documents (100-years/fleet's language versions).
   Run: node --max-old-space-size=256 --test test/campaign-tables-472.test.mjs */
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
const { default: parse } = await import('../tools/importer/parsers/table-striped.js');
const html = fs.readFileSync(new URL('./fixtures/campaign-tables/de-en-100-years-fleet.html', import.meta.url), 'utf8');
const templates = JSON.parse(fs.readFileSync(new URL('../tools/importer/page-templates.json', import.meta.url), 'utf8'));
const campaign = (templates.templates || templates).find((t) => t.name === 'campaign');
const info = (templates.templates || templates).find((t) => t.name === 'info');
// cells come as elements or as HTML strings
const text = (n) => (n && n.textContent ? n.textContent : String(n || '').replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();

test('the campaign template maps www\'s tables as info does, before columns-media', () => {
  const names = campaign.blocks.map((b) => b.name);
  const table = campaign.blocks.find((b) => b.name === 'table-striped');
  assert.ok(table, 'table-striped is mapped');
  assert.deepEqual(table.instances, info.blocks.find((b) => b.name === 'table-striped').instances);
  assert.ok(names.indexOf('table-striped') < names.indexOf('columns-media'));
});

test('a two-column view with a table is not a columns-media block (its table would be lost)', () => {
  const { document } = parseHTML(`<html><body>${html}</body></html>`);
  const view = document.querySelector('.twocolumn');
  const cm = campaign.blocks.find((b) => b.name === 'columns-media');
  cm.instances.forEach((sel) => {
    assert.ok(![...document.querySelectorAll(sel)].includes(view), sel);
  });
});

test('the table: one row per spec, label and value', () => {
  const { document } = parseHTML(`<html><body>${html}</body></html>`);
  const [sel] = campaign.blocks.find((b) => b.name === 'table-striped').instances;
  const el = document.querySelector(sel);
  assert.ok(el, 'the selector matches');
  created = [];
  parse(el, { document });
  assert.match(created[0].name, /^table-striped\b/);
  const rows = created[0].cells.map((r) => r.map(text));
  assert.deepEqual(rows.map((r) => r[0]), ['Engine', 'Speed', 'Take-off weight', 'Range', 'Seats']);
  assert.match(rows[2][1], /1,800.2,000 kg/);
});

test('the generated campaign import script uses the table parser', () => {
  const js = fs.readFileSync(new URL('../tools/importer/import-campaign.js', import.meta.url), 'utf8');
  assert.ok(js.includes("from './parsers/table-striped.js'"));
  assert.ok(js.includes("'table-striped': "));
});
