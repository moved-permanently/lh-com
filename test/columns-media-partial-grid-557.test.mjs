/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The brief after 551c item 2 (the ranking): Austrian /at/en/book-and-manage/flights/wetlease-hub, +13.6 % at 1440 on our host
   against austrian-parity-003 since its job 539 re-import. www's "Our wet lease partners" is the same three-column view
   as lufthansa.com's (one card, the airBaltic logo, its text and link, and two empty items: the card a third of the row),
   but the parser kept a three- or four-column view's empty items on lufthansa.com pages only (the brief after 476), so
   the logo filled the row on Austrian's page. The rule now holds on Austrian's and Brussels' pages too (the same AEM column
   views; Brussels /be/en/our-company/organisation: an empty first item, then three people, each a quarter as on www).
   SWISS's and the other brands' pages as before. A copy of the published document with the two empty cells: 1440 -493 px
   (+13.6 -> about -2.5 %), 390 +36 px (-4.0 -> about -3.0 %).
   Run: node --max-old-space-size=256 --test test/columns-media-partial-grid-557.test.mjs */
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


const card = (n) => `<div class="col-md-6 col-lg column-view-item"><div class="image parbase section"><div class="image-wrapper"><img src="/content/dam/os/images/logo-${n}.jpg" alt="Logo ${n}"></div></div><div class="text section"><div class="richtext"><p>Partner ${n} text.</p></div></div><div class="link event section"><div class="maui-link"><maui-navigation-link href="/at/en/partner-${n}">More about partner ${n}</maui-navigation-link></div></div></div>`;
const empty = '<div class="col-md-6 col-lg column-view-item"></div>';
const view = (cls, items) => `<div class="${cls} column event section"><div class="column-view flex-column"><div class="row">${items.join('')}</div></div></div>`;

const run = (html, url) => {
  const { document } = parseHTML(`<html><head><title>T</title></head><body><main><div class="container-content"><div class="section"><div class="section-regular container-gray mb-default"><div class="section-content container-fluid section-regular section-padding-y-regular"><div class="headline section"><h2>Our wet lease partners</h2></div>${html}</div></div></div></div></main></body></html>`);
  standIns(document);
  transform('beforeTransform', document.body, { document, url, params: { originalURL: url }, template: { name: 'info' } });
  const el = document.querySelector('.twocolumn, .threecolumn, .fourcolumn');
  parse(el, { document, url, params: { originalURL: url } });
  const table = document.querySelector('table');
  return [...table.querySelectorAll('tr')].slice(1).map((tr) => [...tr.children].map((td) => (td.textContent.trim() ? 'card' : 'empty')).join(' '));
};

const AT = 'https://www.austrian.com/at/en/book-and-manage/flights/wetlease-hub';
const SN = 'https://www.brusselsairlines.com/be/en/our-company/organisation';

test('Austrian wetlease-hub: one card and two empty items, one row of three cells, the card first', () => {
  assert.deepEqual(run(view('threecolumn', [card(1), empty, empty]), AT), ['card empty empty']);
});

test('Brussels organisation: an empty first item, then three people, four cells', () => {
  assert.deepEqual(run(view('fourcolumn', [empty, card(1), card(2), card(3)]), SN), ['empty card card card']);
});

test('every item filled, and a two-column view with one card, as before; another brand\'s page as before', () => {
  assert.deepEqual(run(view('threecolumn', [card(1), card(2), card(3)]), AT), ['card card card']);
  assert.deepEqual(run(view('twocolumn', [card(1), empty]), AT), ['card empty']);
  assert.deepEqual(run(view('threecolumn', [card(1), empty, empty]), 'https://www.swiss.com/ch/en/partners'), ['card']);
});
