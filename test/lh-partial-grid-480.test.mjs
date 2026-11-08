/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* lufthansa.com's three- and four-column views with empty columns (the brief after 476, item 2:
   /de/en/book-and-manage/flights/wetlease-hub, 451 px taller than www's at 1440). www's "Our wet lease
   partners" is a three-column view with one card (the airBaltic logo, its text and link) and two
   empty items: the card takes a third of the row (col-lg). The columns-media parser kept only the
   filled cell, so the logo filled the row. A three- or four-column view now keeps its empty items as
   empty cells when one of them is filled; a view whose items are all filled, and two-column views,
   as before.
   Run: node --max-old-space-size=256 --test test/lh-partial-grid-480.test.mjs */
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


const LH = 'https://www.lufthansa.com/de/en/book-and-manage/flights/wetlease-hub';
const card = (n) => `<div class="col-md-6 col-lg column-view-item"><div class="image parbase section"><div class="image-wrapper"><img src="https://www.lufthansa.com/content/dam/lh/images/logo-${n}.jpg" alt="Logo ${n}"></div></div><div class="text section"><div class="richtext"><p>Partner ${n} text.</p></div></div><div class="link event section"><div class="maui-link"><maui-navigation-link href="/de/en/partner-${n}">More about partner ${n}</maui-navigation-link></div></div></div>`;
const empty = '<div class="col-md-6 col-lg column-view-item"></div>';
const view = (cls, items) => `<div class="${cls} column event section"><div class="column-view flex-column"><div class="row">${items.join('')}</div></div></div>`;

const run = (html) => {
  const { document } = parseHTML(`<html><head><title>T</title></head><body><main><div class="container-content"><div class="section"><div class="section-regular container-gray mb-default"><div class="section-content container-fluid section-regular section-padding-y-regular"><div class="headline section"><h2 class="headline heading-medium">Our wet lease partners</h2></div>${html}</div></div></div></div></main></body></html>`);
  standIns(document);
  transform('beforeTransform', document.body, { document, url: LH, params: { originalURL: LH }, template: { name: 'info' } });
  const el = document.querySelector('.twocolumn, .threecolumn, .fourcolumn');
  parse(el, { document, url: LH, params: { originalURL: LH } });
  const table = document.querySelector('table');
  const rows = [...table.querySelectorAll('tr')].slice(1);
  return rows.map((tr) => [...tr.children].map((td) => (td.textContent.trim() ? 'card' : 'empty')).join(' '));
};

test('a three-column view with one card and two empty items: one row of three cells, the card first', () => {
  const rows = run(view('threecolumn', [card(1), empty, empty]));
  assert.ok(JSON.stringify(rows) === JSON.stringify(['card empty empty']), JSON.stringify(rows));
});

test('a four-column view with two cards and two empty items keeps its four columns', () => {
  const rows = run(view('fourcolumn', [card(1), card(2), empty, empty]));
  assert.ok(JSON.stringify(rows) === JSON.stringify(['card card empty empty']), JSON.stringify(rows));
});

test('a three-column view with every item filled, and a two-column view with one card, as before', () => {
  const full = run(view('threecolumn', [card(1), card(2), card(3)]));
  assert.ok(JSON.stringify(full) === JSON.stringify(['card card card']), JSON.stringify(full));
  const two = run(view('twocolumn', [card(1), empty]));
  assert.ok(JSON.stringify(two) === JSON.stringify(['card empty']), JSON.stringify(two));
});
