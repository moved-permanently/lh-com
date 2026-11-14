/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Standing order 21 (2026-11-14), item 3: /de/en/prepare-for-your-trip/baggage/baggage-irregularities/delayed-baggage-lhg.
   www puts a 100 px separator (.hr-no-layout, inline margin-bottom) between its three-column views of airline cards. The
   cleanup keeps it (50 px and more) as a placeholder, but the columns-media parser merged the untitled view after it into
   the block before, so the placeholder ended up after the merged block: two {spacer-100} at the page end, and the rows
   only 66 px apart. On lufthansa.com the parser no longer merges across a kept spacer: each view is a block of its own
   with the spacer between them. A hand-split draft measured 9.1 / 4.0 -> 8.0 / 2.9 % at 390 / 1440. Census of the
   3,397 www snapshots: kept spacers between two such views only on this page (7 documents). Kept lines (a visible
   divider) between views (airport-information, air-baltic, flight-disruptions) and the smaller separators (option
   separated) are as before, and so are the other brands.
   Run: node --max-old-space-size=256 --test test/columns-media-kept-spacer-so21.test.mjs */
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


const LH = 'https://www.lufthansa.com/de/en/prepare-for-your-trip/baggage/baggage-irregularities/delayed-baggage-lhg';
const BRU = 'https://www.brusselsairlines.com/be/fr/travel-classes/business';
const sep = (style, line) => `<div class="separator section"><div aria-hidden="true" ${style ? `style="${style}" ` : ''}class="hr${line ? '' : ' hr-no-layout'} "><maui-divider></maui-divider></div></div>`;
const card = (name) => `<div class="col-md-6 col-lg column-view-item"><div class="headline section"><h3 class="headline heading-medium">${name}</h3></div><div class="image parbase section"><div class="image-wrapper"><img src="https://www.lufthansa.com/content/dam/lh/${name}.jpg" alt=""></div></div><div class="link section"><a href="https://mybag.aero/${name}">Report delayed baggage</a></div></div>`;
const view = (names) => `<div class="threecolumn column event section"><div class="column-view flex-column"><div class="row">${names.map(card).join('')}</div></div></div>`;
const VIEWS = [['Austrian', 'Brussels', 'Lufthansa'], ['SWISS', 'Dolomiti', 'Edelweiss'], ['City']];

const run = (url, between) => {
  const views = VIEWS.map(view).join(between);
  const { document } = parseHTML(`<html><head><title>T</title></head><body><main><div class="container-content"><div class="section"><div class=" mb-default "><div class="section-content container-fluid section-regular "><div class="text section"><div class="richtext"><p>Please report delayed baggage.</p></div></div>${views}</div></div></div></div></main></body></html>`);
  const payload = {
    document, url, params: { originalURL: url }, template: { name: 'info' },
  };
  standIns(document);
  transform('beforeTransform', document.body, payload);
  [...document.querySelectorAll('.threecolumn')].forEach((el) => parse(el, { document, url, params: { originalURL: url } }));
  const tables = [...document.querySelectorAll('table')];
  // what lies between the blocks: the separator placeholders (comments) in document order
  const marks = [];
  const walker = document.createTreeWalker(document.body, 128);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (n.nodeValue.startsWith('lh-separator ')) {
      const before = tables.filter((t) => t.compareDocumentPosition(n) & 4).length;
      marks.push(`${n.nodeValue.slice(13).trim()} after block ${before}`);
    }
  }
  return { tables, marks };
};

test('lufthansa.com: a kept spacer between two column views: no merge, the spacer between the blocks', () => {
  const r = run(LH, sep('margin-bottom: 100px;'));
  assert.equal(r.tables.length, 3, 'each view its own block');
  assert.deepEqual(r.tables.map((t) => t.querySelectorAll('tr').length - 1), [1, 1, 1]);
  assert.deepEqual(r.marks, ['spacer-100 after block 1', 'spacer-100 after block 2']);
});

test('lufthansa.com: no separator, or a visible line, as before: one merged block', () => {
  assert.equal(run(LH, '').tables.length, 1);
  const line = run(LH, sep('margin-bottom: 25px;', true));
  assert.equal(line.tables.length, 1, 'a divider between the views: merged as before');
});

test('lufthansa.com: a smaller separator (30 px) as before: merged, option separated', () => {
  const r = run(LH, sep('margin-bottom: 30px;'));
  assert.equal(r.tables.length, 1);
  assert.match(r.tables[0].querySelector('tr').textContent, /separated/);
});

test('other brands as before: merged across a kept spacer', () => {
  assert.equal(run(BRU, sep('margin-bottom: 100px;')).tables.length, 1);
});
