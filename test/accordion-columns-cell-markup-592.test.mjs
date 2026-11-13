/* eslint-disable max-len */
/* A table cell's bold label and line breaks through the accordion-columns parser (standing order 9 of 2026-11-13, item
   2; ita-parity-005 /it/en/book-and-prepare/other-requests/families-and-children/baggage-and-strollers): www writes the
   fare tables' cells as "<b>Baggage</b><br>No baggage<br><br><br>" and the headers as "Light fare and lap seat<br>&nbsp;";
   the parser took a cell without paragraphs as its flat text ("BaggageNo baggage"). A cell of inline content keeps its
   bold (as <strong>), its line breaks and its links; a cell of paragraphs as before.
   Run: node --test test/accordion-columns-cell-markup-592.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import parse from '../tools/importer/parsers/accordion-columns.js';

globalThis.WebImporter = {
  Blocks: {
    createBlock(doc, { name, cells }) {
      const t = doc.createElement('table');
      t.setAttribute('data-name', name);
      cells.forEach((row) => {
        const tr = doc.createElement('tr');
        row.forEach((c) => {
          const td = doc.createElement('td');
          if (Array.isArray(c)) c.forEach((n) => td.append(n)); else if (c) td.append(c);
          tr.append(td);
        });
        t.append(tr);
      });
      return t;
    },
  },
};

const PAGE = `<div class="accordion"><maui-collapsible>
<maui-collapsible-item headline="Newborn (0-23 months)" expanded=""><div>
  <div class="table event"><div class="cms-table-maui-wrapper"><maui-table><maui-table-caption></maui-table-caption>
    <maui-table-head><maui-table-row><maui-table-cell type="columnheader">Light fare and lap seat<br>&nbsp;</maui-table-cell></maui-table-row></maui-table-head>
    <maui-table-body>
      <maui-table-row><maui-table-cell><b>Baggage</b><br>No baggage<br><br><br></maui-table-cell></maui-table-row>
      <maui-table-row><maui-table-cell><b>Folding stroller<br></b>Yes, in the <a href="/it/en/hold">hold</a>&nbsp;</maui-table-cell></maui-table-row>
      <maui-table-row><maui-table-cell><p>EUR 85</p></maui-table-cell></maui-table-row>
    </maui-table-body>
  </maui-table></div></div>
</div></maui-collapsible-item>
</maui-collapsible></div>`;

const cells = () => {
  const { document } = parseHTML(`<!DOCTYPE html><html><body><main>${PAGE}</main></body></html>`);
  parse(document.querySelector('.accordion'), { document });
  const table = document.querySelector('table[data-name] table');
  return [...table.querySelectorAll('th, td')].map((c) => c.innerHTML.replace(/\u00a0/g, '&nbsp;'));
};

test('a cell of inline content keeps its bold label and its line breaks', () => {
  const [, baggage, stroller] = cells();
  assert.equal(baggage, '<strong>Baggage</strong><br>No baggage<br><br><br>');
  assert.match(stroller, /^<strong>Folding stroller<br><\/strong>Yes, in the <a href="\/it\/en\/hold">hold<\/a>/);
});

test('a header cell keeps its line break', () => {
  assert.match(cells()[0], /^Light fare and lap seat<br>/);
});

test('a cell of paragraphs as before: its text', () => {
  assert.equal(cells()[3], 'EUR 85');
});
