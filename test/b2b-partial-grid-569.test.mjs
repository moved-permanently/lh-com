/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* The brief after d9cf2340, item 1 (Group for Business, functional first): lhg-history-alliances-and-joint-ventures'
   grey band "Deepening ties" holds a three-column view of the four Joint Ventures in two rows, [2010, 2012, empty] and
   [empty, 2017 China, 2017 Singapore] (b2b-parity-003's recording, b2b-snapshots-001/-002: the same DOM). The parser
   kept a three- or four-column view's empty items on lufthansa.com, Austrian and Brussels pages (c26893cb), not on
   business.lufthansagroup.com's: DA has two cells a row, each card half the width (www: a third).
   Input: the band as the snapshot holds it (test/fixtures/b2b-partial-grid), through B2B's mapping (mappedOf) and the
   info template's cleanup, as the import reads it.
   Run: node --max-old-space-size=256 --test test/b2b-partial-grid-569.test.mjs */
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

// linkedom's Range and compareDocumentPosition stand-ins by document order (as test/columns-media-partial-grid-557.test.mjs)
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

const band = fs.readFileSync(new URL('./fixtures/b2b-partial-grid/lhg-history-alliances-band.html', import.meta.url), 'utf8');
const B2B = 'https://business.lufthansagroup.com/de/en/about-us/lhg-history/lhg-history-alliances-and-joint-ventures';

const run = (url) => {
  const html = mappedOf(`<html><head><title>T</title></head><body><main><div class="container-content">${band}</div></main></body></html>`);
  const { document } = parseHTML(html);
  standIns(document);
  transform('beforeTransform', document.body, {
    document, url, params: { originalURL: url }, template: { name: 'info' },
  });
  // the two three-column views (one a row), parsed in turn as the import does: the second joins the first's block
  const views = [...document.querySelectorAll('.threecolumn')];
  assert.equal(views.length, 2, 'the two three-column views');
  views.forEach((el) => { if (el.isConnected) parse(el, { document, url, params: { originalURL: url } }); });
  return [...document.querySelectorAll('table')].flatMap((table) => [...table.querySelectorAll('tr')].slice(1).map((tr) => [...tr.children].map((td) => (td.textContent.trim() ? 'card' : 'empty')).join(' ')));
};

test('B2B lhg-history-alliances: the Joint Ventures as www\'s rows of three, the empty items kept', () => {
  assert.deepEqual(run(B2B), ['card card empty', 'empty card card']);
});

test('another brand\'s page with the same view keeps dropping them, as before', () => {
  assert.deepEqual(run('https://www.swiss.com/ch/en/about-us/alliances'), ['card card', 'card card']);
});
