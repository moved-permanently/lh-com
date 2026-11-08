/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Brief 484: www's 100-years/campaigns has an author quote under the text of a sidebar
   ("The latter is deeply rooted ..." then "There's no better way to fly.", the picture beside);
   the cleanup makes the quote a blockquote, and the columns-media parser had no branch for it,
   so the quote was lost in every market's campaigns page and in the carbon-offsetting saf pages
   (17 snapshots with a quote in a column view or sidebar). The parser keeps it in the cell;
   columns-media.css sets it as the quotes outside blocks (styles.css: 60px around, 80 from
   768px, the subline's 1rem under it).
   Run: node --max-old-space-size=256 --test test/columns-media-quote-484.test.mjs */
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

const URL_ = 'https://www.lufthansa.com/de/en/100-years/campaigns';
const SIDEBAR = '<div class="sidebar event section"><div class="airem-sidebar d-md-flex"><div class="sidebar-content"><div class="text section"><div class="richtext"><p>The latter is deeply rooted in the brand.</p></div></div><div class="authorquote event section"><div class="dcep-author-quote"><div class="author-quote d-flex flex-column"><div class="quote-text text-left mb-0">"There\u2019s no better way to fly."</div><div class="subline-text"></div></div></div></div></div><div class="sidebar-aside"><div class="image parbase section"><div class="image-wrapper"><img src="https://www.lufthansa.com/content/dam/lh/images/a.jpg" alt=""></div></div></div></div></div>';

const run = () => {
  const { document } = parseHTML(`<html><head><title>T</title></head><body><main><div class="container-content"><div class="section"><div class=" "><div class="section-content container-fluid section-regular section-padding-y-regular">${SIDEBAR}</div></div></div></div></main></body></html>`);
  const payload = {
    document, url: URL_, params: { originalURL: URL_ }, template: { name: 'campaign' },
  };
  standIns(document);
  transform('beforeTransform', document.body, payload);
  document.querySelectorAll('.sidebar').forEach((el) => parse(el, { document, url: URL_, params: { originalURL: URL_ } }));
  return document.querySelector('table');
};

test('a quote under the text of a sidebar stays in its cell, after the text', () => {
  const table = run();
  assert.ok(table, 'a block');
  const cells = [...table.querySelectorAll('tr')[1].children];
  assert.equal(cells.length, 2);
  const quote = cells[0].querySelector('blockquote');
  assert.ok(quote, cells[0].innerHTML);
  assert.match(quote.textContent, /no better way to fly/);
  assert.ok(quote.previousElementSibling && /deeply rooted/.test(quote.previousElementSibling.textContent), 'after the text');
  assert.ok(cells[1].querySelector('img'), 'the picture beside');
});

test('columns-media.css sets a quote in a cell as the quotes outside blocks', () => {
  const css = fs.readFileSync('blocks/columns-media/columns-media.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const at = css.indexOf('body.brand-lufthansa .columns-media .columns-media-row > div > blockquote {');
  assert.ok(at >= 0);
  const rule = css.slice(at, css.indexOf('}', at));
  assert.match(rule, /margin: 60px 15px;/);
  assert.match(rule, /max-width: 622px;/);
  assert.match(css, /@media \(width >= 768px\) \{[^@]*body\.brand-lufthansa \.columns-media \.columns-media-row > div > blockquote \{\s*margin: 80px 20px;/);
  assert.match(css, /@media \(width >= 1024px\) \{[^@]*body\.brand-lufthansa \.columns-media \.columns-media-row > div > blockquote \{\s*margin-inline: 40px;/);
});
