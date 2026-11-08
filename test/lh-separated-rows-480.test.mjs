/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* lufthansa.com's rows that www separates (the brief after 476, item 1: /de/en/advance-seat-reservation,
   604 px shorter than www's at 1440, about 72 px a row). www puts a 30 px separator (.hr
   margin-bottom: 30px) between the two-column views that the columns-media parser merges into one
   block, and each row's note (.text: an empty paragraph, the copytext-small note, an empty paragraph)
   keeps its empty paragraphs' margins: 56 px from the button to the note (ours 26), 112 px from the
   note to the next row (ours 66). The cleanup (lufthansa.com) marks the column view after such a
   separator (data-lh-separated: option separated, as Brussels') and writes the empty paragraph that
   opens a text component after another one in a column item as a "{spacer-24}" cell spacer;
   columns-media.css gives option separated lufthansa.com's row gap. Brussels as before; a
   lufthansa.com separator without a space of its own (the default 2.5rem) or of 50 px and more as
   before.
   Run: node --max-old-space-size=256 --test test/lh-separated-rows-480.test.mjs */
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


const LH = 'https://www.lufthansa.com/de/en/advance-seat-reservation';
const sep = (style) => `<div class="separator section"><div aria-hidden="true" ${style ? `style="${style}" ` : ''}class="hr hr-no-layout "><maui-divider></maui-divider></div></div>`;
const image = (n) => `<div class="image parbase section"><div class="image-wrapper"><img src="https://www.lufthansa.com/content/dam/lh/images/p${n}.jpg" alt="Picture ${n}"></div></div>`;
const text = (n) => `<div class="headline section"><h2 class="headline heading-medium">Seat ${n}</h2></div><div class="text section"><div class="richtext"><p>Seat ${n} text.</p></div></div><div class="link event section"><div class="maui-link"><maui-button-link href="/de/en/login" type="secondary">Book Seat ${n} now</maui-button-link></div></div><div class="text section"><div class="richtext "> <p></p> <p class="copytext-small">The reservation is free of charge for HON Circle Members.</p> <p></p> </div></div>`;
const row = (n) => `<div class="twocolumn column event"><div class="column-view flex-column"><div class="row"><div class="col-md-6 col-lg column-view-item">${image(n)}</div><div class="col-md-6 col-lg column-view-item">${text(n)}</div></div></div></div>`;

const run = (between) => {
  const rows = [1, 2, 3].map(row).join(between);
  const { document } = parseHTML(`<html><head><title>T</title></head><body><main><div class="container-content"><div class="section"><div class=" mb-default "><div class="section-content container-fluid section-regular "><div class="onecolumn column event"><div class="column-view flex-column"><div class="row"><div class="col-lg column-view-item"><div class="headline section"><h2 class="headline heading-medium">European flights</h2></div>${rows}</div></div></div></div></div></div></div></div></main></body></html>`);
  const payload = {
    document, url: LH, params: { originalURL: LH }, template: { name: 'info' },
  };
  standIns(document);
  transform('beforeTransform', document.body, payload);
  const separated = [...document.querySelectorAll('.twocolumn')].map((t) => t.getAttribute('data-lh-separated'));
  [...document.querySelectorAll('.twocolumn')].forEach((el) => parse(el, { document, url: LH, params: { originalURL: LH } }));
  const tables = [...document.querySelectorAll('table')];
  return {
    separated, tables, header: tables.length ? tables[0].querySelector('tr').textContent : '', html: document.body.innerHTML,
  };
};

test('lufthansa.com: a 30 px separator between merged column views marks the next one; the block gets option separated', () => {
  const r = run(sep('margin-bottom: 30px;'));
  assert.ok(JSON.stringify(r.separated) === JSON.stringify([null, 'true', 'true']), JSON.stringify(r.separated));
  assert.ok(r.tables.length === 1, 'the three rows stay one block');
  assert.ok(r.tables[0].querySelectorAll('tr').length === 4, 'three rows');
  assert.ok(r.header === 'Columns Media (separated)', r.header);
});

test('lufthansa.com: the empty paragraph opening the note after the button becomes a {spacer-24} cell paragraph before it', () => {
  const r = run(sep('margin-bottom: 30px;'));
  const cell = r.tables[0].querySelectorAll('tr')[1].querySelectorAll('td')[1];
  const ps = [...cell.querySelectorAll('p')].map((p) => p.textContent.trim());
  const i = ps.findIndex((t) => t.startsWith('The reservation is free'));
  assert.ok(i > 0 && ps[i - 1] === '{spacer-24}', JSON.stringify(ps));
  assert.ok(ps.filter((t) => t === '{spacer-24}').length === 1, 'one spacer, none for the trailing empty paragraph');
});

test('lufthansa.com: no separator, the default one or one of 50 px and more: no mark, as before', () => {
  ['', sep(), sep('margin-bottom: 80px;')].forEach((between) => {
    const r = run(between);
    assert.ok(!r.separated.includes('true'), between);
  });
});

test('columns-media.css: option separated on lufthansa.com 113 px between rows (66 + the separator and the note\'s trailing paragraph)', () => {
  const css = fs.readFileSync(new URL('../blocks/columns-media/columns-media.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  assert.ok(/body\.brand-lufthansa \.columns-media\.separated \{ gap: 113px; \}/.test(css), 'the lufthansa.com gap');
  assert.ok(/\.columns-media\.separated \{ gap: 100px; \}/.test(css), 'Brussels\' as before');
});

// helix-importer drops empty paragraphs (reviewParagraphs) before the import script's transform, so the
// note's opening <p></p> is gone by beforeTransform: the import script's onLoad (run before html2md)
// lets the cleanup mark such a text component first (data-lh-empty-first), and beforeTransform reads
// the mark
test('lufthansa.com: the empty paragraph is marked on load, so the spacer comes even after the importer dropped it', () => {
  const rows = [1, 2].map(row).join(sep('margin-bottom: 30px;'));
  const { document } = parseHTML(`<html><head><title>T</title></head><body><main><div class="container-content"><div class="section"><div class=" mb-default "><div class="section-content container-fluid section-regular "><div class="onecolumn column event"><div class="column-view flex-column"><div class="row"><div class="col-lg column-view-item">${rows}</div></div></div></div></div></div></div></div></main></body></html>`);
  standIns(document);
  transform('onLoad', document.body, { document });
  document.querySelectorAll('p').forEach((p) => { if (!p.textContent.trim()) p.remove(); });
  transform('beforeTransform', document.body, { document, url: LH, params: { originalURL: LH }, template: { name: 'info' } });
  assert.ok(document.querySelectorAll('.lh-cell-spacer').length === 2, String(document.querySelectorAll('.lh-cell-spacer').length));
});

test('the info and legal import scripts run the transformers\' onLoad', () => {
  ['info', 'legal'].forEach((t) => {
    const src = fs.readFileSync(new URL(`../tools/importer/import-${t}.js`, import.meta.url), 'utf8');
    assert.ok(/onLoad: \(\{ document \}\) => \{\s*executeTransformers\('onLoad', document\.body, \{ document \}\);/.test(src), t);
  });
});
