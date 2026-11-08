/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* 100 Years fleet's spec tables beside their partner (brief 478): www's /de/en/100-years/fleet (lh-snapshots-062,
   lh-parity-002) holds each of its 15 tables in a two-column view: picture | table (9), table | picture
   (Focke-Wulf A 17a, "Big birds across the Atlantic", the three-engine globetrotter), text | picture +
   table and the like. From 768 px the two columns sit side by side (622 px each with 20 px between at
   1440, the table 39 px under the column's top); below they stack, the picture 90 px over the table.
   Since 240924c the campaign template imported the table as table-striped and the rest as default
   content: the tables under their pictures, or before them. Now the view is one table-striped block
   with the option beside (the partner column on the left) or beside-end (on the right): its first row
   the partner column's content and what the table's own column has above the table, then the table's
   rows (parser table-beside, columns-media's and table-striped's parsers inside).
   Run: node --max-old-space-size=512 --test test/fleet-tables-beside-478.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

let created = [];
globalThis.WebImporter = {
  Blocks: {
    createBlock: (document, opts) => {
      created.push(opts);
      const t = document.createElement('table');
      t.dataset.name = opts.name;
      return t;
    },
  },
};
const { default: parse } = await import('../tools/importer/parsers/table-beside.js');
const { default: parseTable } = await import('../tools/importer/parsers/table-striped.js');
const html = fs.readFileSync(new URL('./fixtures/campaign-tables/de-en-100-years-fleet-062.html', import.meta.url), 'utf8');
const templates = JSON.parse(fs.readFileSync(new URL('../tools/importer/page-templates.json', import.meta.url), 'utf8'));
const campaign = (templates.templates || templates).find((t) => t.name === 'campaign');
const text = (n) => (typeof n === 'string' ? n.replace(/<[^>]*>/g, ' ') : (n && n.textContent) || '').replace(/\s+/g, ' ').trim();
const cellText = (c) => (Array.isArray(c) ? c.map(text).join(' ') : text(c));
const hasImg = (c) => (Array.isArray(c) ? c : [c]).some((n) => n && typeof n !== 'string' && (n.tagName === 'IMG' || (n.querySelector && n.querySelector('img'))));

test('the campaign template maps a two-column view with a table to table-beside, before table-striped', () => {
  const names = campaign.blocks.map((b) => b.name);
  const b = campaign.blocks.find((x) => x.name === 'table-beside');
  assert.ok(b, 'table-beside is mapped');
  assert.ok(names.indexOf('table-beside') < names.indexOf('table-striped'));
  // a :has() inside a :has() makes Chrome reject the selector (the import stops)
  b.instances.forEach((sel) => assert.ok(!/:has\([^)]*:has\(/.test(sel), sel));
});

test('as the import runs it (all matches first, then in order): one table-striped block a view, partner and table', () => {
  const { document } = parseHTML(`<html><body>${html}</body></html>`);
  const found = [];
  ['table-beside', 'table-striped'].forEach((n) => campaign.blocks.find((x) => x.name === n).instances
    .forEach((sel) => document.querySelectorAll(sel).forEach((el) => found.push([n, el]))));
  created = [];
  found.forEach(([n, el]) => { if (document.body.contains(el)) (n === 'table-beside' ? parse : parseTable)(el, { document }); });
  assert.deepEqual(created.map((c) => c.name), ['Table Striped (beside)', 'Table Striped (beside-end)', 'Table Striped (beside)']);
  // 1: picture | table
  assert.equal(created[0].cells[0].length, 1);
  assert.ok(hasImg(created[0].cells[0][0]));
  assert.deepEqual(created[0].cells.slice(1).map((r) => cellText(r[0])), ['Engine', 'Speed', 'Take-off weight', 'Range', 'Seats']);
  // 2: table | picture: the picture on the right
  assert.ok(hasImg(created[1].cells[0][0]));
  // 3: text | picture + table: the text beside, the picture above the table
  assert.equal(created[2].cells[0].length, 2);
  assert.match(cellText(created[2].cells[0][0]), /Junkers Ju 52\/3m/);
  assert.ok(hasImg(created[2].cells[0][1]));
  assert.equal(document.querySelectorAll('div.table').length, 0, 'no table left as default content');
});

test('the generated campaign import script uses the parser', () => {
  const js = fs.readFileSync(new URL('../tools/importer/import-campaign.js', import.meta.url), 'utf8');
  assert.ok(js.includes("from './parsers/table-beside.js'"));
});

// the block
const { window, document: doc } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.location = {
  hostname: 'lufthansa.turnsthe.page', pathname: '/', search: '', hash: '', href: 'https://lufthansa.turnsthe.page/', origin: 'https://lufthansa.turnsthe.page', replace: () => {},
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = doc;
globalThis.NodeFilter = { SHOW_TEXT: 4 };
const { default: decorate } = await import('../blocks/table-striped/table-striped.js');
window.hlx = { ...(window.hlx || {}), codeBasePath: '' };

const block = (cls, firstRow) => {
  const b = doc.createElement('div');
  b.className = `table-striped ${cls}`.trim();
  b.innerHTML = `${firstRow}<div><div>Engine</div><div>Junkers L 5</div></div><div><div>Speed</div><div>170 km/h</div></div>`;
  doc.body.append(b);
  return b;
};

test('the block: option beside, the partner beside the table, the table in its own scroll box', async () => {
  const b = block('beside', '<div><div><p><img src="/a.jpg" alt=""></p></div></div>');
  await decorate(b);
  assert.deepEqual([...b.children].map((c) => c.className), ['table-striped-aside', 'table-striped-main']);
  assert.ok(b.querySelector('.table-striped-aside img'));
  assert.ok(b.querySelector('.table-striped-main > .table-striped-table > table'));
  assert.equal(b.querySelectorAll('tbody tr').length, 2, 'the partner row is no table row');
});

test('the block: what the table\'s column has above the table stays above it', async () => {
  const b = block('beside', '<div><div><p>The Junkers Ju 52/3m</p></div><div><p><img src="/b.jpg" alt=""></p></div></div>');
  await decorate(b);
  assert.ok(b.querySelector('.table-striped-main > .table-striped-above img'));
  assert.equal(b.querySelector('.table-striped-main').lastElementChild.className, 'table-striped-table');
});

test('the block without the option as before: the table its only child', async () => {
  const b = block('', '');
  await decorate(b);
  assert.equal(b.children.length, 1);
  assert.equal(b.firstElementChild.tagName, 'TABLE');
});

test('the block CSS: stacked below 768 px (90 px to the table), two columns from 768 px, beside-end on the right', () => {
  const css = fs.readFileSync(new URL('../blocks/table-striped/table-striped.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  assert.ok(css.includes('.table-striped:is(.beside, .beside-end) { max-height: none; overflow: visible; }'));
  assert.ok(css.includes('.table-striped:is(.beside, .beside-end) .table-striped-table { max-height: 840px; margin-top: 90px; overflow: auto; }'));
  assert.match(css, /@media \(width >= 768px\) \{[^@]*\.table-striped:is\(\.beside, \.beside-end\) \{ display: grid; grid-template-columns: repeat\(2, minmax\(0, 1fr\)\); column-gap: 20px; align-items: start; \}/);
  assert.match(css, /@media \(width >= 768px\) \{[^@]*\.table-striped\.beside-end > \.table-striped-aside \{ order: 1; \}/);
  assert.match(css, /@media \(width >= 768px\) \{[^@]*\.table-striped:is\(\.beside, \.beside-end\) \.table-striped-table \{ margin-top: 39px; \}/);
  // www crops the pictures 16:9 (622 x 350 at 1440, 346 x 193 at 390)
  assert.ok(css.includes('.table-striped:is(.beside, .beside-end) :is(.table-striped-aside, .table-striped-above) img { display: block; width: 100%; height: auto; aspect-ratio: 16 / 9; object-fit: cover; }'));
});
