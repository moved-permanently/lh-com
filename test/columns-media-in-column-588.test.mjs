/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The brief after 588, item 1: commit 2595ae36's option in-column (a Brussels sidebar that www places in a one-column
   view straight in the page container: the overview hubs' intro) never fired in the offline import of its 104
   documents. Its test (columns-media-in-column-sidebar-570) used a hand-written sidebar alone in its column item; on
   www and in every snapshot the hub's card grids follow the sidebar in the same item (.sidebar + .separator +
   .fourcolumn ...), so the parser's "only child" test failed. This test runs the cleanup and the parser on the
   snapshot's own markup: the .container-content of /be/fr/special-care/families-and-children from the R2 drop's
   brussels-snapshots-002 (test/fixtures/brussels-in-column-588). Fails on 2595ae36's parser, passes after.
   Run: node --max-old-space-size=256 --test test/columns-media-in-column-588.test.mjs */
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

const fixture = fs.readFileSync(new URL('./fixtures/brussels-in-column-588/be-fr-families-and-children.html', import.meta.url), 'utf8');
const SN = 'https://www.brusselsairlines.com/be/fr/special-care/families-and-children';
const headerOf = (content, url) => {
  const { document } = parseHTML(`<html><head><title>T</title></head><body><main><div class="contentpage"><div class="content-wrapper">${content}</div></div></main></body></html>`);
  standIns(document);
  transform('beforeTransform', document.body, {
    document, url, params: { originalURL: url }, template: { name: 'info' },
  });
  const el = document.querySelector('.sidebar');
  const kids = el.parentElement.children.length;
  parse(el, { document, url, params: { originalURL: url } });
  return { header: (document.querySelector('table th') || {}).textContent || '', kids };
};

test('the snapshot: the sidebar opens a column item it shares with the card grids, option in-column', () => {
  const { header, kids } = headerOf(fixture, SN);
  assert.ok(kids > 1, 'the sidebar is not alone in its item');
  assert.equal(header, 'Columns Media (sidebar, in-column)');
});

test('the same markup in an AEM section (it/it/extra-services/meals), or on another brand: no in-column', () => {
  const inSection = fixture.replace('<div class="container-content">', '<div class="container-content"><div class="section"><div class="section-content container-fluid section-regular">') .replace(/<\/div>\s*$/, '</div></div></div>');
  assert.ok(!headerOf(inSection, SN).header.includes('in-column'));
  assert.ok(!headerOf(fixture, 'https://www.lufthansa.com/de/de/x').header.includes('in-column'));
});
