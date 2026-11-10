/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The standing order after 570 item 2: Brussels /be/fr/special-care/families-and-children, -9.1 % at 1440. On www its
   intro (h1 and text) is a sidebar (.sidebar > .airem-sidebar > .sidebar-content | .sidebar-aside) that is the only item
   of a one-column view straight in the page container (.container-content > .onecolumn, outside any AEM section): the
   h1 44 px lower than ours at 1440 (20 at 390) and the text 72 px under the h1 (66 at 390; ours 28 / 26). 110 pages of
   the R2 drop have that layout (the overview hubs: baggage, travel-classes, families-and-children, pets, lounges, meals ...
   in every language). The columns-media parser marks such a sidebar on Brussels pages with option in-column (the Brussels
   theme spaces it as www's); a sidebar in an AEM section (padded, as before) or on another brand's page as before.
   Backwards compatible: no live document has the option until the re-import (reimport-570-brussels-in-column-sidebars.txt).
   Run: node --max-old-space-size=256 --test test/columns-media-in-column-sidebar-570.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
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

const SIDEBAR = '<div class="sidebar event"><div class="airem-sidebar d-md-flex"><div class="sidebar-content"><div class="headline section"><h1 class="headline heading-large">Familles et enfants</h1></div><div class="text section"><div class="richtext"><p>Prendre l’avion avec des enfants.</p></div></div></div><div class="sidebar-aside"></div></div></div>';
const oneColumn = (inner) => `<div class="onecolumn column event"><div data-identifier="onecolumn" class="column-view flex-column"><div class="row"><div class="col-lg column-view-item">${inner}</div></div></div></div>`;
const variantsOf = (body, url) => {
  const { document } = parseHTML(`<html><head><title>T</title></head><body><main><div class="contentpage"><div class="content-wrapper">${body}</div></div></main></body></html>`);
  standIns(document);
  transform('beforeTransform', document.body, {
    document, url, params: { originalURL: url }, template: { name: 'info' },
  });
  const el = document.querySelector('.sidebar');
  parse(el, { document, url, params: { originalURL: url } });
  return (document.querySelector('table th') || {}).textContent || '';
};
const SN = 'https://www.brusselsairlines.com/be/fr/special-care/families-and-children';

test('a Brussels sidebar alone in a one-column view straight in the page container: option in-column', () => {
  assert.equal(variantsOf(`<div class="container-content">${oneColumn(SIDEBAR)}</div>`, SN), 'Columns Media (sidebar, in-column)');
});

test('in an AEM section (padded, as before), on another brand\'s page, or not alone: no in-column', () => {
  assert.ok(!variantsOf(`<div class="container-content"><div class="section"><div class="section-content container-fluid">${oneColumn(SIDEBAR)}</div></div></div>`, SN).includes('in-column'));
  assert.ok(!variantsOf(`<div class="container-content">${oneColumn(SIDEBAR)}</div>`, 'https://www.lufthansa.com/de/de/x').includes('in-column'));
  assert.ok(!variantsOf(`<div class="container-content"><div class="section"><div class="section-content container-fluid">${SIDEBAR}</div></div></div>`, SN).includes('in-column'));
});
