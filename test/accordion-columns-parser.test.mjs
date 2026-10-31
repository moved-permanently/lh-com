/* The accordion-columns import parser (tools/importer/parsers/accordion-columns.js): a panel
   whose text sits outside a nested column view keeps its text, images, tables and button links
   (Discover's /book/special-requests/families lost them); a link-column panel stays as before.
   A linkedom page and a createBlock stand-in, no network. Run: node --test test/*.test.mjs */
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

const run = (body) => {
  const { document } = parseHTML(`<!DOCTYPE html><html><body><main>${body}</main></body></html>`);
  const el = document.querySelector('.accordion');
  parse(el, { document });
  const block = document.querySelector('table[data-name]');
  return { name: block.getAttribute('data-name'), rows: [...block.querySelectorAll(':scope > tr')].map((tr) => [...tr.children]) };
};

const FAMILIES = `<div class="accordion"><maui-collapsible>
<maui-collapsible-item headline="Gepäckbestimmungen für Kinder"><div>
  <div class="text"><div class="richtext limited-width"><p>Für Babys gilt ein Freigepäckstück von 23 kg.</p><ul><li>Einen Kindersitz</li></ul></div></div>
  <div class="twocolumn column event"><div class="column-view flex-column"><div class="row">
    <div class="col-md-6 col-lg column-view-item"><div class="image parbase section"><figure><img src="/content/dam/a.jpg" alt="Kinderwagen"></figure></div></div>
    <div class="col-md-6 col-lg column-view-item"><div class="image parbase section"><figure><img src="/content/dam/b.jpg" alt="Babybett"></figure></div></div>
  </div></div></div>
</div></maui-collapsible-item>
<maui-collapsible-item headline="Alleinreisende Kinder"><div>
  <div class="text"><div class="richtext"><p>Die Gebühr wird pro Strecke erhoben.</p></div></div>
  <div class="table event"><div class="cms-table-maui-wrapper"><maui-table><maui-table-caption></maui-table-caption>
    <maui-table-head><maui-table-row><maui-table-cell>Zone</maui-table-cell><maui-table-cell>Gebühr</maui-table-cell></maui-table-row></maui-table-head>
    <maui-table-body><maui-table-row><maui-table-cell>Europa</maui-table-cell><maui-table-cell><p>EUR 85</p></maui-table-cell></maui-table-row></maui-table-body>
  </maui-table></div></div>
  <div class="link event"><div class="maui-link"><maui-button-link href="/content/dam/four_y/pdfs/children/4y_unaccompanied-minor-form.pdf" type="primary">Betreuungsformular herunterladen (PDF)<span class="sr-only">Neuer Tab</span></maui-button-link></div></div>
</div></maui-collapsible-item>
</maui-collapsible></div>`;

test('a panel with a nested column view is read as a whole: text, images, table, button link', () => {
  const { name, rows } = run(FAMILIES);
  assert.equal(name, 'accordion-columns (faq)');
  const [first, second] = rows.map((r) => r[1]);
  assert.match(first.innerHTML, /Für Babys gilt ein Freigepäckstück von 23 kg\./);
  assert.match(first.innerHTML, /<li>Einen Kindersitz<\/li>/);
  assert.deepEqual([...first.querySelectorAll('img')].map((i) => [i.getAttribute('src'), i.getAttribute('alt')]), [['/content/dam/a.jpg', 'Kinderwagen'], ['/content/dam/b.jpg', 'Babybett']]);
  const table = second.querySelector('table');
  assert.ok(table, 'the maui-table becomes a table');
  assert.deepEqual([...table.querySelectorAll('tr')].map((tr) => [...tr.children].map((c) => `${c.tagName}:${c.textContent}`)), [['TH:Zone', 'TH:Gebühr'], ['TD:Europa', 'TD:EUR 85']]);
  const link = second.querySelector('a[href$="4y_unaccompanied-minor-form.pdf"]');
  assert.ok(link, 'the button link is kept');
  assert.equal(link.textContent, 'Betreuungsformular herunterladen (PDF)');
});

test('a link-column panel stays in column mode (headings and links per column)', () => {
  const { name, rows } = run(`<div class="accordion"><maui-collapsible><maui-collapsible-item headline="Europa"><div>
    <div class="twocolumn"><div class="column-view"><div class="row">
      <div class="column-view-item"><div class="headline"><h3>Deutschland</h3></div><div class="text"><div class="richtext"><ul><li><a href="/de/de/fra">Frankfurt</a></li></ul></div></div></div>
      <div class="column-view-item"><div class="headline"><h3>Italien</h3></div><div class="text"><div class="richtext"><ul><li><a href="/de/de/rom">Rom</a></li></ul></div></div></div>
    </div></div></div></div></maui-collapsible-item></maui-collapsible></div>`);
  assert.equal(name, 'accordion-columns');
  const panel = rows[0][1];
  assert.deepEqual([...panel.querySelectorAll('h3')].map((h) => h.textContent), ['Deutschland', 'Italien']);
  assert.deepEqual([...panel.querySelectorAll('a')].map((a) => a.getAttribute('href')), ['/de/de/fra', '/de/de/rom']);
  assert.ok(panel.querySelector('table') === null, 'no table');
});

const GRID = `<div class="accordion"><maui-collapsible><maui-collapsible-item headline="Im Rahmen Ihrer Handgepäcksmenge"><div>
  <div class="text"><div class="richtext limited-width"><p>Folgende Gegenstände dürfen Sie mitnehmen:</p></div></div>
  <div class="fourcolumn column event"><div class="column-view flex-column"><div class="row">
    <div class="col-md-6 col-lg column-view-item"><div class="image parbase section"><figure><img src="/content/dam/a.png.transform/w/img.png" alt="Kleidersack"></figure></div><div class="richtext"><p><b>Kleidersack</b></p><p>(max. 57 x 54 x 15 cm)</p></div></div>
    <div class="col-md-6 col-lg column-view-item"><div class="image parbase section"><figure><img src="/content/dam/b.png.transform/w/img.png" alt="Buggy"></figure></div><div class="richtext"><p><b>Buggy</b></p></div></div>
    <div class="col-md-6 col-lg column-view-item"><div class="image parbase section"><figure><img src="/content/dam/c.png.transform/w/img.png" alt="Einkauf"></figure></div><div class="richtext"><p><b>Duty Free</b></p></div></div>
  </div></div></div>
  <div class="text"><div class="richtext"><p>Bitte beachten Sie die Regeln.</p></div></div>
</div></maui-collapsible-item>
<maui-collapsible-item headline="Jetlag"><div>
  <div class="text"><div class="richtext"><p>Was ist Jetlag?</p></div></div>
  <div class="twocolumn column event"><div class="column-view"><div class="row">
    <div class="col-md-6 col-lg column-view-item"><div class="text"><div class="richtext"><p>Gegen Jetlag hilft viel Licht.</p></div></div></div>
    <div class="col-md-6 col-lg column-view-item"><div class="image parbase section"><figure><img src="/content/dam/j.jpg.transform/w/img.jpg" alt="Sonne"></figure></div></div>
  </div></div></div>
</div></maui-collapsible-item></maui-collapsible></div>`;

test('a nested column view of image items is a one-row table, one item per cell, between the texts', () => {
  const { rows } = run(GRID);
  const panel = rows[0][1];
  const table = panel.querySelector('table');
  assert.ok(table, 'the item grid becomes a table');
  const trs = [...table.querySelectorAll('tr')];
  assert.equal(trs.length, 1);
  const cells = [...trs[0].children];
  assert.deepEqual(cells.map((c) => c.querySelector('img').getAttribute('alt')), ['Kleidersack', 'Buggy', 'Einkauf']);
  assert.match(cells[0].textContent, /Kleidersack.*57 x 54 x 15 cm/s);
  // the intro before the grid and the note after it stay outside the table, in order
  const order = [...panel.children].map((n) => (n.tagName === 'TABLE' ? 'TABLE' : n.textContent.trim().slice(0, 12)));
  assert.deepEqual(order, ['Folgende Geg', 'TABLE', 'Bitte beacht']);
  assert.equal(panel.querySelectorAll('img').length, 3, 'no image outside the grid');
});

test('a text-and-image two-column view (not all items images) stays flat text then image', () => {
  const { rows } = run(GRID);
  const panel = rows[1][1];
  assert.ok(panel.querySelector('table') === null, 'no table');
  assert.match(panel.textContent, /Gegen Jetlag hilft viel Licht\./);
  assert.equal(panel.querySelectorAll('img').length, 1);
});
