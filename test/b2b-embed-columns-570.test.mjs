/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* The brief after 4c9cd359, item 5b (lh-b2b): help-alliance's last view is a two-column view, the text and "Learn more"
   beside a YouTube iframe (560 x 315; b2b-snapshots-002/-003 hold it, b2b-parity-003's screenshot shows the cell blank).
   The info template keeps a two-column view with an iframe out of Columns Media (lufthansa.com's form and map iframes),
   so the import wrote the iframe as a plain link under the text and the view was gone. B2B's importer now gives such a
   view (two items, one an .iframe component, no nested views) the class b2b-embed-columns, which the template's B2B
   selector takes: a Columns Media block, the text cell and the embed cell (the block draws the YouTube player).
   Input: the view as the snapshot holds it (test/fixtures/b2b-embed-columns).
   Run: node --max-old-space-size=256 --test test/b2b-embed-columns-570.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import transform from '../tools/importer/transformers/lufthansa-cleanup.js';
import { mappedOf } from '../tools/importer/b2b-import.mjs';

globalThis.WebImporter = {
  Blocks: {
    getMetadata: () => ({}),
    getMetadataBlock: (document) => document.createElement('table'),
    createBlock: (document, { name, variants = [], cells }) => {
      const table = document.createElement('table');
      const head = document.createElement('tr');
      const th = document.createElement('th');
      th.textContent = `${name}${variants.length ? ` (${variants.join(', ')})` : ''}`;
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
const { default: parse } = await import('../tools/importer/parsers/columns-media.js');

const view = fs.readFileSync(new URL('./fixtures/b2b-embed-columns/help-alliance-video-view.html', import.meta.url), 'utf8').replace(/^<!--.*-->\n/, '');
const PAGE_URL = 'https://business.lufthansagroup.com/de/en/about-us/help-alliance';
const page = (body) => `<html><head><title>T</title></head><body><main><div class="container-content">${body}</div></main></body></html>`;

test('help-alliance: the view with the YouTube iframe gets the B2B class the template takes', () => {
  const { document } = parseHTML(mappedOf(page(view)));
  const el = document.querySelector('.container-content > .twocolumn');
  assert.ok(el.classList.contains('b2b-embed-columns'), el.className);
  // the info template's selector (tools/importer/page-templates.json, which build-bundles.mjs writes import-info.js from)
  const { templates } = JSON.parse(fs.readFileSync(new URL('../tools/importer/page-templates.json', import.meta.url), 'utf8'));
  const cm = templates.find((t) => t.name === 'info').blocks.find((b) => b.name === 'columns-media');
  assert.ok(cm.instances.includes(':is(.section-content, .container-content) > .twocolumn.b2b-embed-columns'), 'the template\'s selector');
  // a view without an iframe as before
  const plain = parseHTML(mappedOf(page(view.replace(/<div class="iframe[\s\S]*?<\/iframe>\s*<\/div>\s*<\/div>/, '<div class="text section"><div class="richtext"><p>x</p></div></div>')))).document;
  assert.ok(!plain.querySelector('.b2b-embed-columns'), 'no iframe: no class');
});

test('the columns-media parser makes it the text cell and the embed cell', () => {
  const { document } = parseHTML(mappedOf(page(view)));
  transform('beforeTransform', document.body, {
    document, url: PAGE_URL, params: { originalURL: PAGE_URL }, template: { name: 'info' },
  });
  parse(document.querySelector('.twocolumn'), { document, url: PAGE_URL, params: { originalURL: PAGE_URL } });
  const cells = [...document.querySelectorAll('table tr')].slice(1).map((tr) => [...tr.children]);
  assert.equal(cells.length, 1);
  assert.equal(cells[0].length, 2);
  assert.match(cells[0][0].textContent, /Together, we make help count/);
  const a = cells[0][1].querySelector('a');
  assert.ok(a && /youtube(-nocookie)?\.com\/embed\/51hTCJhsJa8/.test(a.getAttribute('href')), cells[0][1].innerHTML.slice(0, 200));
});
