/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 18, item 1 (Brussels P50): the separators www shows on Brussels pages. In the sidebar's running text
   the cleanup keeps them already (aviation-services-law: three "{spacer-28}" before its h2s, from the recording); in an
   accordion panel it keeps them too (the conditions of carriage: 57 .separator .hr-no-layout of 11 px between a text
   and the next h3.heading-small), but the accordion parser dropped the cleanup's placeholder and the collapse removes
   any separator in a block cell. On Brussels pages now:
   - the parser writes a placeholder before a panel heading as "<p>{spacer-N}</p>" before that heading;
   - the collapse keeps such a spacer in a block cell between running text and a heading (Brussels' textSpacers, as in
     default content since standing order 8); elsewhere in blocks and on other brands it goes as before;
   - the theme draws a spacer paragraph in a panel as in default content (N px + 1).
   Run: node --max-old-space-size=256 --test test/brussels-panel-separators-so18.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import parse from '../tools/importer/parsers/accordion-columns.js';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';

globalThis.WebImporter = {
  Blocks: {
    createBlock(doc, { name, cells }) {
      const t = doc.createElement('table');
      t.setAttribute('data-name', name);
      cells.forEach((row) => {
        const tr = doc.createElement('tr');
        row.forEach((c) => {
          const td = doc.createElement('td');
          if (Array.isArray(c)) c.forEach((n) => td.append(n)); else if (c) td.append(c);
          tr.append(td);
        });
        t.append(tr);
      });
      return t;
    },
  },
};

// a panel as the cleanup leaves it: the separator a comment placeholder between the text and the headline
const PANEL = '<div class="text"><div class="richtext "><p>2.1. These Conditions apply.</p></div></div><!--lh-separator spacer-11--><div class="headline"><h3 class="headline heading-small "> Charters</h3></div><div class="text"><div class="richtext "><p>2.2. A charter agreement.</p></div></div>';
const PAGE = `<!DOCTYPE html><html><body><main><div class="section-content"><div class="accordion commonevent section"><maui-collapsible theme="sn"><div class="accordionitem commonevent"><maui-collapsible-item headline="Article 2" expanded="" theme="sn"><div>${PANEL}</div></maui-collapsible-item></div></maui-collapsible></div></div></main></body></html>`;
const panelOf = (origin) => {
  const { document } = parseHTML(PAGE);
  const url = `${origin}/be/en/legal-notices/terms-and-conditions-conditions-of-carriage`;
  parse(document.querySelector('.accordion'), { document, url, params: { originalURL: url } });
  const td = document.querySelectorAll('table[data-name] tr')[0].children[1];
  return [...td.children].map((e) => `${e.tagName.toLowerCase()}:${e.textContent.trim().slice(0, 14)}`);
};

test('the parser: on Brussels pages the placeholder before a panel heading is a spacer paragraph before it', () => {
  assert.deepEqual(panelOf('https://www.brusselsairlines.com'), ['p:2.1. These Con', 'p:{spacer-11}', 'h3:Charters', 'p:2.2. A charter']);
});

test('the parser: other brands as before (no spacer)', () => {
  assert.deepEqual(panelOf('https://www.lufthansa.com'), ['p:2.1. These Con', 'h3:Charters', 'p:2.2. A charter']);
});

const BLOCK = (cell) => `<div><div class="accordion-columns faq"><div><div>Article 2</div><div>${cell}</div></div></div></div>`;
const collapse = (html, brand) => collapseHtml(html, {
  path: '/be/en/legal-notices/terms-and-conditions-conditions-of-carriage', brand, parse: parseHTML, force: true,
}).html;

test('the collapse: in a block cell, a spacer between running text and a heading stays on Brussels', () => {
  const cell = '<p>2.1. These Conditions apply.</p><p>{spacer-11}</p><h3>Charters {heading-small}</h3><p>2.2. A charter.</p>';
  const out = collapse(BLOCK(cell), 'brussels');
  assert.ok(out.includes('<p>2.1. These Conditions apply.</p><p>{spacer-11}</p><h3>'), out.slice(0, 300));
  assert.ok(collapse(out, 'brussels').includes('<p>{spacer-11}</p><h3>'), 'a second run keeps it');
});

test('the collapse: elsewhere in a block cell, and on other brands, the spacer goes as before', () => {
  const twoTexts = '<p>One.</p><p>{spacer-11}</p><p>Two.</p>';
  assert.ok(!collapse(BLOCK(twoTexts), 'brussels').includes('{spacer-'), 'between two paragraphs');
  const cell = '<p>2.1. These Conditions apply.</p><p>{spacer-11}</p><h3>Charters</h3><p>x</p>';
  ['lufthansa', 'austrian'].forEach((brand) => assert.ok(!collapse(BLOCK(cell), brand).includes('{spacer-'), brand));
});

test('the Brussels theme: a spacer paragraph in a panel N px + 1 high, as in default content', () => {
  const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
  assert.ok(css.includes('body.brand-brussels main .accordion-columns-panel p.spacer { box-sizing: content-box; height: calc(var(--spacer-size, 25px) + 1px); margin: 0; }'));
});
