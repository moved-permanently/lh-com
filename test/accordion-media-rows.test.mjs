/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling */
/* Accordion panels with picture | text rows (brief 445 item 4, Austrian's /book/flights/new-destinations: each
   destination a two-column view, its title above, the picture and its button left, the text and the facts right;
   www shows them side by side from 768 px). The accordion-columns parser read them as running text, so the
   pictures stacked over the text. Now:
   - the parser writes such a view (two items, a picture in one of them only: www alternates, Bilbao's picture is
     on the right) as its title and a one-row table of two cells (the items' content, in www's order); the facts
     inside (a three-column view of a heading and a short text each: travel period, flights, flight time) as a
     one-row table of one cell per fact;
   - the block makes such a row (two cells, a picture in one only) div.accordion-columns-media-row with the two
     cells side by side from 768 px, and a one-row table whose cells each open with a heading and hold no
     picture div.accordion-columns-facts (three a row from 768 px); image grids and data tables as before.
   Run: node --max-old-space-size=256 --test test/accordion-media-rows.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
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

const pictureItem = (city) => `<div class="col-md-6 col-lg column-view-item"><div class="image parbase section"><div class="image-wrapper"><a href="/at/en/book/destination?d=${city}"><figure><img src="/content/dam/aua/${city}.jpg" alt="${city}"></figure></a></div></div><div class="link event section"><div class="maui-link"><maui-button-link href="/at/en/book/destination?d=${city}" type="secondary">Book ${city} now</maui-button-link></div></div></div>`;
const fact = (h, t) => `<div class="col-md-6 col-lg column-view-item"><div class="headline section"><h4 class="headline heading-copytext-large">${h}</h4></div><div class="text section"><div class="richtext"><p>${t}</p></div></div></div>`;
const textItem = (city) => `<div class="col-md-6 col-lg column-view-item"><div class="text section"><div class="richtext"><p>From summer 2026 to <strong>${city}</strong>.</p></div></div><div class="threecolumn column event section"><div class="column-view flex-column"><div class="row">${fact('Travel period', 'March - Oct. 2026')}${fact('Flights', '2 flights/week')}${fact('Flight time', '2 hrs 50 min')}</div></div></div></div>`;
const destination = (city, right) => `<div class="twocolumn column event"><div class="column-view flex-column"><div><h3 class="heading-small">${city} – by the sea</h3></div><div class="row">${right ? textItem(city) + pictureItem(city) : pictureItem(city) + textItem(city)}</div></div></div>`;
const page = `<div class="accordion"><maui-collapsible><div class="accordionitem"><maui-collapsible-item headline="New in Summer 2026" expanded=""><div>${destination('Alicante')}${destination('Bilbao', true)}</div></maui-collapsible-item></div></maui-collapsible></div>`;

test('the parser: a picture | text view in a panel as its title and a one-row table of two cells in www\'s order; the facts a one-row table', () => {
  const { document } = parseHTML(`<!DOCTYPE html><html><body><main>${page}</main></body></html>`);
  parse(document.querySelector('.accordion'), { document });
  const panel = document.querySelector('table[data-name] > tr > td:last-child');
  assert.deepEqual([...panel.children].map((n) => n.tagName), ['H3', 'TABLE', 'H3', 'TABLE']);
  assert.match(panel.children[0].textContent, /Alicante – by the sea/);
  const cellsOf = (t) => [...t.querySelector(':scope > tr, :scope > tbody > tr').children];
  const [alicante, bilbao] = [panel.children[1], panel.children[3]].map(cellsOf);
  assert.ok(alicante[0].querySelector('img[alt="Alicante"]') && !alicante[1].querySelector('img'), 'Alicante: the picture left');
  assert.equal(alicante[0].querySelector('p > em > a')?.textContent, 'Book Alicante now', 'the secondary maui-button-link an italic link (an outlined button)');
  assert.ok(!bilbao[0].querySelector('img') && bilbao[1].querySelector('img[alt="Bilbao"]'), 'Bilbao: the picture right, as www');
  assert.match(alicante[1].textContent, /From summer 2026 to Alicante/);
  const facts = alicante[1].querySelector('table');
  assert.ok(facts, 'the facts a table');
  assert.deepEqual(cellsOf(facts).map((c) => [...c.children].map((n) => `${n.tagName}:${n.textContent.trim()}`).join(' | ')), ['H4:Travel period | P:March - Oct. 2026', 'H4:Flights | P:2 flights/week', 'H4:Flight time | P:2 hrs 50 min']);
});

test('the parser: a text and a picture without facts stay running text (the other 39 pages with such views)', () => {
  const plain = `<div class="twocolumn column event"><div class="column-view flex-column"><div class="row"><div class="col-md-6 col-lg column-view-item"><div class="text section"><div class="richtext"><p>Light helps.</p></div></div></div>${pictureItem('Sun')}</div></div></div>`;
  const { document } = parseHTML(`<!DOCTYPE html><html><body><main><div class="accordion"><maui-collapsible><div class="accordionitem"><maui-collapsible-item headline="Jetlag" expanded=""><div>${plain}</div></maui-collapsible-item></div></maui-collapsible></div></main></body></html>`);
  parse(document.querySelector('.accordion'), { document });
  const panel = document.querySelector('table[data-name] > tr > td:last-child');
  assert.equal(panel.querySelectorAll('table').length, 0);
  assert.match(panel.textContent, /Light helps\./);
});

test('the block: a two-cell row with a picture in one cell is a media row (in its order); a row of headed text cells a facts grid; image grids and data tables as before', async () => {
  const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
  window.location = {
    hostname: 'austrian.turnsthe.page', pathname: '/at/en/x', search: '', href: 'https://austrian.turnsthe.page/at/en/x', origin: 'https://austrian.turnsthe.page',
  };
  Object.defineProperty(window, 'origin', { value: 'https://austrian.turnsthe.page', configurable: true });
  globalThis.window = window;
  globalThis.document = document;
  const { buildGrids } = await import('../blocks/accordion-columns/accordion-columns.js');
  const facts = '<table><tbody><tr><td><h4>Flights</h4><p>2</p></td><td><h4>Flight time</h4><p>2 h</p></td><td><h4>Distance</h4><p>1,780 km</p></td></tr></tbody></table>';
  const panel = document.createElement('div');
  panel.innerHTML = `<h3>Alicante</h3><table><tbody><tr><td><p><picture><img src="/a.jpg" alt="a"></picture></p><p><a href="/b">Book</a></p></td><td><p>Text</p>${facts}</td></tr></tbody></table><h3>Bilbao</h3><table><tbody><tr><td><p>Text</p></td><td><p><picture><img src="/b.jpg" alt="b"></picture></p></td></tr></tbody></table>`;
  buildGrids(panel);
  assert.ok(!panel.querySelector('table'), 'no table left');
  const rows = [...panel.querySelectorAll('.accordion-columns-media-row')];
  assert.deepEqual(rows.map((r) => [...r.children].map((c) => c.className)), [['accordion-columns-media-row-media', 'accordion-columns-media-row-text'], ['accordion-columns-media-row-text', 'accordion-columns-media-row-media']]);
  const grid = rows[0].querySelector('.accordion-columns-facts');
  assert.ok(grid, 'the facts a grid');
  assert.equal(grid.querySelectorAll(':scope > .accordion-columns-facts-item').length, 3);
  const data = document.createElement('div');
  data.innerHTML = '<table><tbody><tr><td><p>Fee</p></td><td><p>20 EUR</p></td></tr></tbody></table>';
  buildGrids(data);
  assert.ok(data.querySelector('table'), 'a row without a picture or headings stays a table');
  const css = fs.readFileSync(new URL('../blocks/accordion-columns/accordion-columns.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
  assert.match(css, /@media \(width >= 768px\) \{ \.accordion-columns \.accordion-columns-media-row \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\); \}/);
  // www's col-md-6 col-lg: one a row on phones, two from 768 px, all from 992 px
  assert.match(css, /\.accordion-columns \.accordion-columns-facts \{ display: grid; grid-template-columns: minmax\(0, 1fr\);/);
  assert.match(css, /@media \(width >= 992px\) \{[^@]*\.accordion-columns \.accordion-columns-facts \{ grid-template-columns: repeat\(var\(--accordion-columns-facts-count, 3\), minmax\(0, 1fr\)\);/);
  // the facts in the body face over the panel's heading rule; the row's text and picture not capped at 66%
  assert.match(css, /\.accordion-columns \.accordion-columns-facts-item > \* \{ margin: 0; color: inherit; font-family: var\(--body-font-family\); font-size: 16px; line-height: 24px; \}/);
  assert.match(css, /\.accordion-columns\.faq \.accordion-columns-panel \.accordion-columns-media-row :is\(p, ul, ol, h2, h3, h4, h5, h6\) \{ max-width: none; \}/);
});
