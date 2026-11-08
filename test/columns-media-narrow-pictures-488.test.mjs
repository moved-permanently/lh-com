/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Brief 488 item 2: pictures www draws narrower than their column (100-years/campaigns at 1440):
   a two-column view inside a column with one empty item and one picture item ("We'll fly you":
   the picture 301 px wide at x 1051 in a 622 px column, the right half), and a sidebar inside a
   column whose content is a picture and whose aside is empty ("While communication content":
   457 px, three quarters less the gutter). The parser flattened both into the column (622 px wide:
   +184 and +128 px at 1440). It marks those pictures " {cell-half-start}" / " {cell-half-end}" /
   " {cell-three-quarters}"; blocks/columns-media takes the marker off as a class and sizes them
   from 768 px (below that www stacks them at the full width).
   Run: node --max-old-space-size=256 --test test/columns-media-narrow-pictures-488.test.mjs */
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

const PAGE_URL = 'https://www.lufthansa.com/de/en/100-years/campaigns';
const image = (n) => `<div class="image parbase section"><div class="image-wrapper"><img src="https://www.lufthansa.com/content/dam/lh/images/p${n}.jpg" alt=""></div></div>`;
const item = (inner) => `<div class="col-md-6 col-lg column-view-item">${inner}</div>`;
const view = (items) => `<div class="twocolumn column event section"><div class="column-view flex-column"><div class="row">${items.join('')}</div></div></div>`;
const text = (t) => `<div class="text section"><div class="richtext"><p>${t}</p></div></div>`;
const sidebar = (content, aside) => `<div class="sidebar event section"><div class="airem-sidebar d-md-flex"><div class="sidebar-content">${content}</div><div class="sidebar-aside">${aside}</div></div></div>`;

const run = (html) => {
  const { document } = parseHTML(`<html><head><title>T</title></head><body><main><div class="container-content"><div class="section"><div class=" "><div class="section-content container-fluid section-regular section-padding-y-regular">${html}</div></div></div></div></main></body></html>`);
  const payload = {
    document, url: PAGE_URL, params: { originalURL: PAGE_URL }, template: { name: 'campaign' },
  };
  standIns(document);
  transform('beforeTransform', document.body, payload);
  const outer = document.querySelector('.section-content > .twocolumn');
  parse(outer, { document, url: PAGE_URL, params: { originalURL: PAGE_URL } });
  return document.querySelector('table');
};
const cells = (table) => [...table.querySelectorAll('tr')[1].children];

test('a [empty | picture] view in a column: the picture marked cell-half-end, after the text', () => {
  const t = run(view([item(image(1)), item(`${text('As early as the 1920s')}${view([item(''), item(image(2))])}`)]));
  const c = cells(t)[1];
  const p = [...c.querySelectorAll('p')].find((x) => x.querySelector('img'));
  assert.ok(p, c.innerHTML);
  assert.match(p.textContent, /^ \{cell-half-end\}$/);
  assert.match(p.previousElementSibling.textContent, /As early as the 1920s/);
  const start = run(view([item(image(1)), item(`${text('Text')}${view([item(image(2)), item('')])}`)]));
  assert.ok([...cells(start)[1].querySelectorAll('p')].some((x) => x.textContent.trim() === '{cell-half-start}'));
});

test('a sidebar in a column, a picture and nothing aside: cell-three-quarters; with text aside: unchanged', () => {
  const t = run(view([item(`${text('While communication content')}${sidebar(image(3), '')}`), item(image(4))]));
  assert.ok([...cells(t)[0].querySelectorAll('p')].some((x) => x.querySelector('img') && x.textContent.trim() === '{cell-three-quarters}'), cells(t)[0].innerHTML);
  const withText = run(view([item(sidebar(image(3), text('Under the symbol of the crane'))), item(image(4))]));
  assert.ok(!/cell-/.test(withText.innerHTML), 'the 100-years crane teaser keeps its layout');
  const plain = run(view([item(image(1)), item(text('No nested view'))]));
  assert.ok(!/cell-/.test(plain.innerHTML));
});

test('the block takes the marker off as a class and sizes the pictures from 768 px', () => {
  const js = fs.readFileSync('blocks/columns-media/columns-media.js', 'utf8');
  assert.match(js, /cell-\(half-start\|half-end\|three-quarters\)/);
  const css = fs.readFileSync('blocks/columns-media/columns-media.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  assert.match(css, /@media \(width >= 768px\) \{ \.columns-media \.columns-media-row > div > p:is\(\.cell-half-start, \.cell-half-end\) \{ width: calc\(50% - 10px\); \}/);
  assert.ok(css.includes('.columns-media .columns-media-row > div > p.cell-half-end { margin-left: auto; }'));
  assert.ok(css.includes('.columns-media .columns-media-row > div > p.cell-three-quarters { width: calc(75% - 10px); }'));
});
