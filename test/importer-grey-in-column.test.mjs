/* eslint-disable max-len */
/* lufthansa-sections.js and the Austrian theme (item 3 of the brief after 462, Austrian's doctor-on-board-news at 390):
   www.austrian.com pads every grey column view 4.8rem above and below (.column-view.container-gray, its index
   stylesheet), the items adding their 1.2rem (2.4rem from 768px) below: the contact box's text 60 / 47 px under the
   band's top, the card band's heading 49 / 47 px, at 390 / 1440. A grey column view nested in a column item got only
   the plain grey section padding (20 / 40 px), one of its own column-band's 32 px. Now the nested one has style
   in-column, and the Austrian theme gives it 48 px above, 60 px below (72 from 768px); column-band keeps 32 px
   (www's .section-content .column > .column-view:only-child 3.2rem outranks the grey view's 4.8rem there).
   Other brands: the token only (no rule), their look as before.
   Run: node --max-old-space-size=256 --test test/importer-grey-in-column.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
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

const run = (document, template = { name: 'info', blocks: [], sections: [] }) => {
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
  transform('beforeTransform', main, { document, template });
  transform('afterTransform', main, { document, template });
  return main;
};
// the sections of the result: the content between breaks, each with its metadata rows
const sections = (main) => main.innerHTML.split('<hr>').map((html) => {
  const doc = parseHTML(`<html><body>${html}</body></html>`).document;
  const meta = [...doc.querySelectorAll('table tr')].slice(1).map((tr) => [...tr.children].map((c) => c.textContent).join(': '));
  return { text: doc.body.textContent.replace(/\s+/g, ' ').trim(), meta };
});

const greyView = (text) => `<div class="onecolumn column"><div class="column-view container-gray full-width-bg"><div class="row"><div class="col-lg column-view-item"><div class="text"><p>${text}</p></div></div></div></div></div>`;
const nested = (inner) => parseHTML(`<html><body><main><div class="container-content"><div class="section"><div class="mb-default"><div class="section-content"><div class="onecolumn column"><div class="column-view"><div class="row"><div class="col-lg column-view-item"><div class="text"><p>Intro</p></div>${inner}</div></div></div></div></div></div></div></div></main></body></html>`).document;
const own = (inner) => parseHTML(`<html><body><main><div class="container-content"><div class="section"><div class="mb-default"><div class="section-content">${inner}</div></div></div></div></main></body></html>`).document;
const styleList = (s, re) => ((s.find((x) => re.test(x.text)) || { meta: [] }).meta.find((m) => m.startsWith('style: ')) || '').replace('style: ', '').split(', ').filter(Boolean).sort();

test('a grey column view nested in a column item: style in-column (www pads it 4.8rem as any grey column view)', () => {
  const s = sections(run(nested(`${greyView('Contact box')}<p>{spacer-70}</p>${greyView('Cards')}`)));
  assert.deepEqual(styleList(s, /^Contact box/), ['grey', 'in-column']);
  assert.deepEqual(styleList(s, /^Cards/), ['grey', 'in-column']);
});

test('a grey column view of its own in a section: column-band as before, not in-column', () => {
  const s = sections(run(own(greyView('Band'))));
  const st = styleList(s, /^Band/);
  assert.ok(st.includes('column-band') && !st.includes('in-column'), st.join(', '));
});

test('the Austrian theme: in-column bands with www\'s 4.8rem, the items\' margin below; column-band as before', () => {
  const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
  assert.match(css, /body\.brand-austrian main > \.section\.grey\.in-column \{ padding: 48px 0 60px; \}/);
  assert.match(css, /@media \(width >= 768px\) \{ body\.brand-austrian main > \.section\.grey\.in-column \{ padding-bottom: 72px; \} \}/);
});
