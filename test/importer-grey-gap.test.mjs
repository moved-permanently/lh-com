/* eslint-disable max-len */
/* lufthansa-sections.js (brief 454 item 4, Austrian's doctor-on-board-news at 390): two grey column views in one
   column item with a separator between them (www: the contact box, 70 px of white, the card band). Both get a grey
   section; the separator's {spacer-70} lay between them alone, so dropEmptyBreaks merged it into the second band
   and the two greys touched, the 70 px grey. Now only spacers between two grey sections make a section of their own,
   style gap (styles.css: no padding, no section gap, the grey before it without its margin): the white space as
   www's. A spacer between a grey and a white section, or no spacer between two greys, as before.
   Run: node --max-old-space-size=256 --test test/importer-grey-gap.test.mjs */
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

const grey = (text) => `<div class="onecolumn column"><div class="column-view container-gray full-width-bg"><div class="row"><div class="col-lg column-view-item"><div class="text"><p>${text}</p></div></div></div></div></div>`;
const page = (inner) => parseHTML(`<html><body><main><div class="container-content"><div class="section"><div class="mb-default"><div class="section-content"><div class="onecolumn column"><div class="column-view"><div class="row"><div class="col-lg column-view-item"><div class="text"><p>Intro</p></div>${inner}</div></div></div></div></div></div></div></div></main></body></html>`).document;
const styles = (s) => s.map((x) => `${x.text.replace(/ ?Section Metadata.*$/, '').trim()} [${(x.meta.find((m) => m.startsWith('style: ')) || '').replace('style: ', '')}]`);

test('only a separator between two grey bands: a section of its own, style gap', () => {
  const s = styles(sections(run(page(`${grey('Contact box')}<p>{spacer-70}</p>${grey('Cards')}`))));
  const at = (re) => s.findIndex((x) => re.test(x));
  assert.ok(at(/^Contact box \[grey/) >= 0 && at(/^\{spacer-70\} \[gap\]$/) === at(/^Contact box/) + 1 && at(/^Cards \[grey/) === at(/^Contact box/) + 2, s.join(' | '));
});

test('a separator between a grey band and white content, or two greys without one: as before', () => {
  const white = styles(sections(run(page(`${grey('Contact box')}<p>{spacer-70}</p><div class="text"><p>After</p></div>`))));
  assert.ok(!white.some((x) => x.endsWith('[gap]')), white.join(' | '));
  const touching = styles(sections(run(page(`${grey('Contact box')}${grey('Cards')}`))));
  assert.ok(!touching.some((x) => x.endsWith('[gap]')), touching.join(' | '));
});

test('the theme: a gap section is only its spacers\' height, the grey before it without its section gap', () => {
  const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
  assert.match(css, /main > \.section\.gap \{ margin: 0; padding: 0; \}/);
  assert.match(css, /main > \.section\.grey:has\(\+ \.section\.gap\) \{ margin-bottom: 0; \}/);
});
