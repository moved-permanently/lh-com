/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The brief after 474, item 1 (the sweep's row 9: /be/fr/travel-classes/business at 390, 482 px short above the gallery).
   www.brusselsairlines.com puts a separator (.hr, 2.5rem + 1px) between the two-column views that
   the columns-media parser merges into one block (business: the seven "Intercontinental" rows;
   premium-economy: three rows). The cleanup drops it (lufthansa.com's 66 px row gap holds the
   component spacing), so every row was 24 px short at 1440 and 34 px at 390. On Brussels pages
   the cleanup now marks the column view after such a separator (data-lh-separated) and the parser
   gives the merged block option separated (columns-media.css: 90 px between rows, 100 px below
   768 px). A separator that ends a text item (business: after each row's text) keeps the last
   paragraph's margin on www: a "{spacer-0}" paragraph in the cell (1 px). lufthansa.com as before.
   At 390 www's tab set is an accordion whose open panel holds its content 20 px further in, 47 px
   below the header and 94 px above the next one, and its lists have 10 px between items (ours 16:
   li > p): the Brussels theme.
   Run: node --max-old-space-size=256 --test test/brussels-separated-rows.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import transform from '../tools/importer/transformers/lufthansa-cleanup.js';

globalThis.WebImporter = {
  Blocks: {
    getMetadata: () => ({}),
    getMetadataBlock: (document) => document.createElement('table'),
    createBlock: (document, { name, variants = [], cells }) => {
      const table = document.createElement('table');
      const head = document.createElement('tr');
      const th = document.createElement('th');
      const title = name.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
      th.textContent = variants.length ? `${title} (${variants.join(', ')})` : title;
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

// linkedom's Range and compareDocumentPosition lack what the parser's merge uses (as
// test/importer-tab-sections.test.mjs): stand-ins by document order
function order(document) {
  const pre = new Map();
  const post = new Map();
  let c = 0;
  const walk = (n) => {
    pre.set(n, c += 1);
    [...n.childNodes].forEach(walk);
    post.set(n, c += 1);
  };
  walk(document.documentElement);
  return { pre, post };
}
function standIns(document) {
  document.createRange = () => {
    const { pre, post } = order(document);
    let start = 0;
    let end = Infinity;
    const inside = (n) => pre.has(n) && pre.get(n) > start && post.get(n) < end;
    return {
      setStartAfter(node) { start = post.get(node); },
      setEndBefore(node) { end = pre.get(node); },
      cloneContents() {
        const frag = document.createElement('div');
        const add = (n) => {
          if (inside(n) && !inside(n.parentNode)) frag.append(n.cloneNode(true));
          else [...n.childNodes].forEach(add);
        };
        add(document.documentElement);
        return frag;
      },
    };
  };
  Object.getPrototypeOf(Object.getPrototypeOf(document.body)).compareDocumentPosition = function position(other) {
    const { pre } = order(document);
    return pre.get(other) > pre.get(this) ? 4 : 2;
  };
}

const BRU = 'https://www.brusselsairlines.com/be/fr/travel-classes/business';
const LH = 'https://www.lufthansa.com/de/en/business-class';
const sep = (style) => `<div class="separator section"><div aria-hidden="true" ${style ? `style="${style}" ` : ''}class="hr hr-no-layout "><maui-divider></maui-divider></div></div>`;
const image = (n) => `<div class="image parbase section"><div class="image-wrapper"><img src="https://www.brusselsairlines.com/content/dam/bel/images/p${n}.jpg" alt="Picture ${n}"></div></div>`;
const text = (t, trailing) => `<div class="headline section"><h3 class="headline heading-small">${t}</h3></div><div class="text section"><div class="richtext"><p>${t} text</p></div></div>${trailing ? sep() : ''}`;
const row = (n, trailing) => `<div class="twocolumn column event"><div class="column-view flex-column"><div class="row"><div class="col-md-6 col-lg column-view-item">${image(n)}</div><div class="col-md-6 col-lg column-view-item">${text(`Row ${n}`, trailing)}</div></div></div></div>`;

const run = (url, between, trailing) => {
  const rows = [1, 2, 3].map((n) => row(n, trailing)).join(between);
  const { document } = parseHTML(`<html><head><title>T</title></head><body><main><div class="container-content"><div class="section"><div class=" mb-default "><div class="section-content container-fluid section-regular "><div class="onecolumn column event"><div class="column-view flex-column"><div class="row"><div class="col-lg column-view-item"><div class="headline section"><h2 class="headline heading-medium">Une expérience</h2></div>${rows}</div></div></div></div></div></div></div></div></main></body></html>`);
  const payload = {
    document, url, params: { originalURL: url }, template: { name: 'info' },
  };
  standIns(document);
  transform('beforeTransform', document.body, payload);
  const separated = [...document.querySelectorAll('.twocolumn')].map((t) => t.getAttribute('data-lh-separated'));
  [...document.querySelectorAll('.twocolumn')].forEach((el) => parse(el, { document, url, params: { originalURL: url } }));
  const tables = [...document.querySelectorAll('table')];
  return {
    separated, tables, header: tables.length ? tables[0].querySelector('tr').textContent : '', html: document.body.innerHTML,
  };
};

test('Brussels: a separator between two merged column views marks the next one; the block gets option separated', () => {
  const r = run(BRU, sep(), false);
  assert.deepEqual(r.separated, [null, 'true', 'true']);
  assert.equal(r.tables.length, 1, 'the three rows stay one block');
  assert.equal(r.tables[0].querySelectorAll('tr').length, 4);
  assert.equal(r.header, 'Columns Media (separated)');
});

test('Brussels: column views without a separator between them, or with a bigger one, as before', () => {
  const r = run(BRU, '', false);
  assert.deepEqual(r.separated, [null, null, null]);
  assert.ok(!/separated/.test(r.header), r.header);
  const big = run(BRU, sep('margin-bottom: 80px;'), false);
  assert.ok(!big.separated.includes('true'), '80 px: not the default separator');
});

test('lufthansa.com: no mark, no option', () => {
  const r = run(LH, sep(), false);
  assert.deepEqual(r.separated, [null, null, null]);
  assert.ok(!/separated/.test(r.header), r.header);
});

test('Brussels: a separator ending a text item keeps the paragraph\'s margin: {spacer-0} at the end of the cell', () => {
  const r = run(BRU, sep(), true);
  const cells = [...r.tables[0].querySelectorAll('tr')].slice(1).map((tr) => tr.lastElementChild.innerHTML);
  assert.equal(cells.length, 3);
  cells.forEach((c) => assert.match(c, /Row \d text<\/p><p>\{spacer-0\}<\/p>$/, c));
  const lh = run(LH, sep(), true);
  assert.ok(!/spacer/.test(lh.html), 'lufthansa.com: none at the end of the item');
});

test('columns-media.css: option separated 90 px between rows, 100 px below 768 px; Brussels cell spacers sized', () => {
  const css = fs.readFileSync(new URL('../blocks/columns-media/columns-media.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
  assert.match(css, /\.columns-media\.separated \{ gap: 100px; \}/);
  assert.match(css, /@media \(width >= 768px\) \{ \.columns-media\.separated \{ gap: 90px; \} \}/);
  assert.match(css, /body\.brand-brussels \.columns-media \.columns-media-text > p\.spacer \{ box-sizing: content-box; height: calc\(var\(--spacer-size, 25px\) \+ 1px\); margin: 0; \}/);
});

test('the Brussels theme: the open accordion panel below 768 px and list items', () => {
  const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
  assert.match(css, /body\.brand-brussels main \.section\.section-tab-panel > div:not\(\.section-tab-toggle\) \{ padding-right: calc\(var\(--layout-margin, 22px\) \+ 20px\); padding-left: calc\(var\(--layout-margin, 22px\) \+ 20px\); \}/);
  assert.match(css, /body\.brand-brussels main \.section\.section-tab-panel > \.section-tab-toggle \+ div \{ margin-top: 47px; \}/);
  assert.match(css, /body\.brand-brussels main \.section\.section-tab-panel:has\(> \.section-tab-toggle\[aria-expanded="true"\]\) \{ padding-bottom: 94px; \}/);
  assert.match(css, /body\.brand-brussels main \.section\.section-tab-panel > \.default-content-wrapper \+ \.columns-media-wrapper \{ margin-top: 64px; \}/);
  assert.match(css, /@media \(width >= 768px\) \{ body\.brand-brussels main \.section\.section-tab-panel > \.default-content-wrapper \+ \.columns-media-wrapper \{ margin-top: 57px; \} \}/);
  assert.match(css, /body\.brand-brussels main :is\(\.default-content-wrapper, \.columns-media-text\) li > p \{ margin-bottom: 0; \}/);
});
