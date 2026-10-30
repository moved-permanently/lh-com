/* The core form import parser (tools/importer/parsers/form-core.js): a link of its own between
   the fields (Discover's contact forms: "Vollmacht herunterladen (PDF)" in an external-link
   tooltip) becomes a note row with the link; the tooltip's box text is no row. A linkedom page
   and a createBlock stand-in, no network. Run: node --test test/*.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import parse from '../tools/importer/parsers/form-core.js';

globalThis.WebImporter = {
  Blocks: {
    createBlock(doc, { cells }) {
      const t = doc.createElement('table');
      t.setAttribute('data-name', 'form');
      cells.forEach((row) => {
        const tr = doc.createElement('tr');
        row.forEach((c) => {
          const td = doc.createElement('td');
          if (Array.isArray(c)) c.forEach((n) => td.append(n)); else if (c) td.append(typeof c === 'string' ? doc.createTextNode(c) : c);
          tr.append(td);
        });
        t.append(tr);
      });
      return t;
    },
  },
};

test('a stand-alone maui link between the fields becomes a note row with the link', () => {
  const { document } = parseHTML(`<!DOCTYPE html><html><body><main><div class="form-wrapper"><form class="cmp-form" action="/x">
    <div class="richtext"><p>Für einen Antrag im Namen einer anderen Person benötigen wir eine Vollmacht.</p></div>
    <div class="maui-link"><maui-tooltip><maui-navigation-link href="/content/dam/four_y/pdfs/legal/4y_power-of-attorney_de.pdf" slot="trigger">Vollmacht herunterladen (PDF)<span class="sr-only">Neuer Tab</span><maui-screen-reader-label>, externe Website</maui-screen-reader-label></maui-navigation-link><div slot="box" class="popover-box-tooltip">Sie verlassen diese Website</div></maui-tooltip></div>
  </form></div></main></body></html>`);
  parse(document.querySelector('.form-wrapper'), { document, url: 'https://www.discover-airlines.com/de/de/x' });
  const rows = [...document.querySelectorAll('table[data-name] tr')];
  const notes = rows.filter((tr) => tr.children[1] && tr.children[1].textContent.trim() === 'note');
  assert.equal(notes.length, 2);
  assert.match(notes[0].children[0].textContent, /Vollmacht\./);
  const link = notes[1].children[0].querySelector('a');
  assert.equal(link.getAttribute('href'), '/content/dam/four_y/pdfs/legal/4y_power-of-attorney_de.pdf');
  assert.equal(link.textContent, 'Vollmacht herunterladen (PDF)');
  assert.ok(!document.querySelector('table[data-name]').textContent.includes('Sie verlassen diese Website'));
});
