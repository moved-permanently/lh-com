/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Austrian /at/en/plan/special-requirements/entry-regulations/immigration-regulations-schengen (standing order 17, item 1;
   +20.96 % at 1440 against austrian-parity-015): www's member states are four lists side by side in a four-column view
   inside a sidebar (.sidebar-content > .fourcolumn, col-md-6 col-lg: two a row from 768 px, four from 1025 px); our
   document has the four lists one under the other. The document predates 30119591 (brief 558, 2026-11-10): lufthansa.com's
   info template, which the Austrian importer uses for this page, takes such a view as Columns Media since. This pins the
   Austrian path: templateOf, mappedOf (the Austrian pre-passes leave the view in the sidebar), the info selector, the
   parser's one row of four list cells. The block's grid already follows www (two a row from 768 to 1024 px, four from
   1025 px). No code change: the document is in reimport-so17-austrian-schengen.txt.
   Run: node --max-old-space-size=256 --test test/austrian-sidebar-columns-so17.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const P = '/at/en/plan/special-requirements/entry-regulations/immigration-regulations-schengen';
const list = (items) => `<div class="col-md-6 col-lg column-view-item"><div class="text section"><div class="richtext "><ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul></div></div></div>`;
const LISTS = [['Austria', 'Belgium'], ['Finland', 'France'], ['Latvia', 'Malta'], ['Poland', 'Spain', 'Switzerland']];
const PAGE = '<html><body><div class="contentpage"><div class="container-content"><div class="section"><div><div class="section-content container-fluid section-regular">'
  + '<div class="sidebar event section"><div class="airem-sidebar d-md-flex" data-identifier="sidebar"><div class="sidebar-content">'
  + '<div class="text section"><div class="richtext limited-width"><p>List of current Schengen member states:</p></div></div>'
  + `<div class="fourcolumn column event section"><div class="column-view flex-column " data-identifier="fourcolumn"><div class="row">${LISTS.map(list).join('')}</div></div></div>`
  + '</div></div></div>'
  + '<div class="headline section"><h3 class="headline heading-copytext-large "><strong>Important note</strong></h3></div>'
  + '</div></div></div></div></div></body></html>';

const { templates } = JSON.parse(fs.readFileSync(new URL('../tools/importer/page-templates.json', import.meta.url), 'utf8'));
const { instances } = templates.find((t) => t.name === 'info').blocks.find((b) => b.name === 'columns-media');

globalThis.WebImporter = {
  Blocks: {
    getMetadata: () => ({}),
    getMetadataBlock: (document) => document.createElement('table'),
    createBlock: (document, { name, variants = [], cells }) => {
      const table = document.createElement('table');
      const head = document.createElement('tr');
      const th = document.createElement('th');
      th.textContent = variants.length ? `${name} (${variants.join(', ')})` : name;
      head.append(th);
      table.append(head);
      cells.forEach((row) => {
        const tr = document.createElement('tr');
        row.forEach((c) => {
          const td = document.createElement('td');
          (Array.isArray(c) ? c : [c]).forEach((n) => { if (n) td.append(typeof n === 'string' ? document.createTextNode(n) : n); });
          tr.append(td);
        });
        table.append(tr);
      });
      return table;
    },
  },
};

test('the page imports with the info template, and the Austrian pre-passes leave the view in the sidebar', async () => {
  const { templateOf, mappedOf } = await import('../tools/importer/austrian-import.mjs');
  assert.equal(templateOf(P, PAGE), 'info');
  const { document } = parseHTML(mappedOf(PAGE, P));
  const view = document.querySelector('.fourcolumn');
  assert.equal(view.parentElement.className, 'sidebar-content');
  const taking = instances.filter((s) => [...document.querySelectorAll(s)].includes(view));
  assert.equal(taking.length, 1);
  assert.ok(taking[0].startsWith('.sidebar-content > :is(.threecolumn, .fourcolumn)'));
});

test('the view is one Columns Media row of four list cells, in www\'s order', async () => {
  const { mappedOf } = await import('../tools/importer/austrian-import.mjs');
  const { default: parse } = await import('../tools/importer/parsers/columns-media.js');
  const { document } = parseHTML(mappedOf(PAGE, P));
  parse(document.querySelector('.fourcolumn'), { document, url: `https://www.austrian.com${P}`, params: { originalURL: `https://www.austrian.com${P}` } });
  const rows = [...document.querySelectorAll('.sidebar-content table tr')].slice(1);
  assert.equal(rows.length, 1);
  assert.deepEqual([...rows[0].children].map((td) => [...td.querySelectorAll(':scope > ul > li')].map((li) => li.textContent)), LISTS);
});

test('the block\'s grid as www\'s col-md-6 col-lg: two a row from 768 to 1024 px', () => {
  const css = fs.readFileSync(new URL('../blocks/columns-media/columns-media.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
  assert.match(css, /@media \(width >= 768px\) and \(width < 1025px\) \{ \.columns-media:not\(\.sidebar, \.media-first, \.gallery\) \.columns-media-row:has\(> :nth-child\(3\)\) \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
});
