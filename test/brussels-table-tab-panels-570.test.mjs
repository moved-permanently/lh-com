/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The standing order after 570 item 4 (the tab-control audit): Brussels /extra-services/baggage/checked-baggage (be/en,
   be/fr, be/nl, de/de, it/it, es/es) has a tab control "Europe / Intercontinental" whose panels hold a one-column view with
   a table. The sections transformer makes a panel a section of its own (Tab) when it holds column views, accordions, a
   sidebar or a video, and leaves text-only panels to profile-tabs, which does not take tables: the two tables came in one
   under the other, without tabs (all six published documents). On Brussels pages a panel with a table is a Tab section
   too; other brands as before (lufthansa.com's flynet pages and SWISS's swiss-connect have such panels: not this audit's).
   Backwards compatible: the documents change at their re-import (reimport-570-brussels-tab-tables.txt).
   Run: node --max-old-space-size=256 --test test/brussels-table-tab-panels-570.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { default: transform } = await import('../tools/importer/transformers/lufthansa-sections.js');

globalThis.WebImporter = {
  Blocks: {
    createBlock: (document, { name, cells }) => {
      const table = document.createElement('table');
      const head = document.createElement('tr');
      head.innerHTML = `<th>${name}</th>`;
      table.append(head);
      Object.entries(cells).forEach(([k, v]) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${k}</td><td>${v}</td>`;
        table.append(tr);
      });
      return table;
    },
  },
};

// linkedom's Range lacks what the transformer uses (setStart, a setEndBefore that works on any
// node): a stand-in by document order, cloneContents the nodes wholly between the boundaries
function rangeFor(document) {
  const pre = new Map();
  const post = new Map();
  let c = 0;
  const walk = (n) => {
    pre.set(n, c += 1);
    [...n.childNodes].forEach(walk);
    post.set(n, c += 1);
  };
  walk(document.documentElement);
  let start = 0;
  let end = Infinity;
  const inside = (n) => pre.has(n) && pre.get(n) > start && post.get(n) < end;
  return {
    setStart(node) { start = pre.get(node); },
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
}

const run = (document, url, template = { name: 'info', blocks: [], sections: [] }) => {
  const main = document.querySelector('main');
  document.createRange = () => rangeFor(document);
  // linkedom's compareDocumentPosition misses a node after an ancestor's sibling: by document order
  const order = () => {
    const at = new Map();
    let c = 0;
    const walk = (n) => { at.set(n, c += 1); [...n.childNodes].forEach(walk); };
    walk(document.documentElement);
    return at;
  };
  Object.getPrototypeOf(Object.getPrototypeOf(main)).compareDocumentPosition = function position(other) {
    const at = order();
    return at.get(other) > at.get(this) ? 4 : 2;
  };
  transform('beforeTransform', main, {
    document, template, url, params: { originalURL: url },
  });
  transform('afterTransform', main, {
    document, template, url, params: { originalURL: url },
  });
  return main;
};
// the sections of the result: the content between breaks, each with its metadata rows
const sections = (main) => main.innerHTML.split('<hr>').map((html) => {
  const doc = parseHTML(`<html><body>${html}</body></html>`).document;
  const meta = [...doc.querySelectorAll('table tr')].slice(1).map((tr) => [...tr.children].map((c) => c.textContent).join(': '));
  return { text: doc.body.textContent.replace(/\s+/g, ' ').trim(), meta };
});

const table = (cap) => `<div class="onecolumn column event"><div class="column-view flex-column"><div class="row"><div class="col-lg column-view-item"><div class="table event"><div class="cms-table-maui-wrapper"><table><tr><td>${cap}</td><td>23 kg</td></tr></table></div></div></div></div></div></div>`;
const page = () => parseHTML(`<html><body><main><div class="container-content"><div class="section"><div><div class="section-content"><h1>Checked baggage</h1><p>Intro</p><div class="tabs panelcontainer"><maui-tab-control-responsive><maui-tab-control-panel-responsive name="Europe">${table('Economy Europe')}</maui-tab-control-panel-responsive><maui-tab-control-panel-responsive name="Intercontinental">${table('Economy Intercontinental')}</maui-tab-control-panel-responsive></maui-tab-control-responsive></div><p>After the tabs</p></div></div></div></div></main></body></html>`).document;

test('Brussels: a tab control whose panels hold tables, a Tab section per panel', () => {
  const s = sections(run(page(), 'https://www.brusselsairlines.com/be/en/extra-services/baggage/checked-baggage'));
  assert.equal(s.length, 4);
  assert.deepEqual(s[1].meta.filter((m) => m.startsWith('Tab')), ['Tab: Europe']);
  assert.match(s[1].text, /Economy Europe/);
  assert.deepEqual(s[2].meta.filter((m) => m.startsWith('Tab')), ['Tab: Intercontinental']);
  assert.match(s[3].text, /^After the tabs$/);
});

test('another brand\'s page: as before (no tab sections for table panels)', () => {
  assert.equal(sections(run(page(), 'https://www.lufthansa.com/de/en/flynet')).length, 1);
  assert.equal(sections(run(page(), 'https://www.swiss.com/ch/en/fly/on-board/swiss-connect')).length, 1);
});
