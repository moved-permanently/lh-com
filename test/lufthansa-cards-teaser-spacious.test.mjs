/* eslint-disable max-len */
/* lufthansa.com's teaser rows straight in www's page column (parity pass 2, brief 424): www's
   .column-view has 2rem / 1rem of padding (4rem / 2rem from 768px, www's rem 10px) and the items
   1rem / 2rem of margin, unless the row sits in a section (.section-content: services-on-board's
   only row 3.2rem, baggage's section-regular rows 3.2rem). Measured on www's /de/en/overview-
   travel-information (lh-parity-003 html/, 1440 and 390): the first image 40 px (20 px) under the
   row's top, 80 px (40 px) from a row's last link to the next row's image, 40 px (20 px) from the
   last link to the footer; ours had 32, 66 and 48 everywhere. Our link line is 2 px shorter
   (24 vs 26), so ours are 42 / 82 and 22 / 42.
   The importer marks such rows (".container-content > .twocolumn" and its kin) with the option
   "spacious"; the block's rule is scoped to body.brand-lufthansa. WebImporter's createBlock is a
   stand-in here.
   Run: node --max-old-space-size=256 --test test/lufthansa-cards-teaser-spacious.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const css = fs.readFileSync(new URL('../blocks/cards-teaser/cards-teaser.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const has = (re, msg) => assert.ok(re.test(css), msg ? `${msg}: ${re}` : String(re));

globalThis.WebImporter = {
  Blocks: {
    createBlock: (document, { name, variants = [] }) => {
      const table = document.createElement('table');
      table.innerHTML = `<tr><th>${name}${variants.length ? ` (${variants.join(', ')})` : ''}</th></tr>`;
      return table;
    },
  },
};
const { default: parse } = await import('../tools/importer/parsers/cards-teaser.js');

const CARD = '<div class="column-view-item"><div class="image"><img src="/a.jpg" alt=""></div><div class="headline"><h2>Title</h2></div><div class="link"><a href="/x">More</a></div></div>';
const header = (html, sel) => {
  const { document } = parseHTML(`<html><body>${html}</body></html>`);
  parse(document.querySelector(sel), { document });
  return document.querySelector('th').textContent;
};

test('a row straight in the page column gets the option spacious', () => {
  assert.equal(header(`<div class="container-content"><div class="twocolumn"><div class="column-view"><div class="row">${CARD}${CARD}</div></div></div></div>`, '.twocolumn'), 'cards-teaser (spacious)');
  assert.equal(header(`<div class="container-content"><div class="threecolumn"><div class="column-view"><div class="row">${CARD}${CARD}${CARD}</div></div></div></div>`, '.threecolumn'), 'cards-teaser (three-up, spacious)');
});

test('a row in a section keeps the plain block', () => {
  assert.equal(header(`<div class="container-content"><div class="section"><div class="section-content"><div class="twocolumn"><div class="column-view"><div class="row">${CARD}${CARD}</div></div></div></div></div></div>`, '.twocolumn'), 'cards-teaser');
});

test('spacious: www\'s page-column padding and row gaps (lh-com only)', () => {
  has(/body\.brand-lufthansa \.cards-teaser\.spacious:not\(\.overlay\) > ul \{ padding-top: 20px; \}/);
  has(/@media \(width < 768px\) \{ body\.brand-lufthansa \.cards-teaser\.spacious:not\(\.overlay, \.three-up, \.four-up\) > ul > li:nth-child\(2n \+ 3\) \{ margin-top: 42px; \} \}/, 'phones only: the grid resets the stacked margins from 768px');
  has(/body\.brand-lufthansa \.cards-teaser-wrapper \+ \.cards-teaser-wrapper > \.cards-teaser\.spacious \{ margin-top: 42px; \}/, 'a grid after a grid: www\'s 40 px, not the sections\' 91');
  has(/@media \(width >= 768px\) \{[^@]*body\.brand-lufthansa \.cards-teaser-wrapper \+ \.cards-teaser-wrapper > \.cards-teaser\.spacious \{ margin-top: 82px; \}/);
  // the grid's section when nothing but empty sections follow (DA's trailing <div></div>), whose
  // margins collapse with it otherwise
  has(/body\.brand-lufthansa main > \.section:has\(> \.cards-teaser-wrapper:last-child > \.cards-teaser\.spacious\):not\(:has\(~ \.section:not\(:empty\)\)\) \{ margin-bottom: 22px; \}/);
  has(/body\.brand-lufthansa main > \.section:has\(> \.cards-teaser-wrapper:last-child > \.cards-teaser\.spacious\) ~ \.section:empty \{ margin: 0; \}/);
  has(/@media \(width >= 768px\) \{[^@]*body\.brand-lufthansa \.cards-teaser\.spacious:not\(\.overlay\) > ul \{ padding-top: 40px; \}/);
  has(/@media \(width >= 768px\) \{[^@]*body\.brand-lufthansa \.cards-teaser\.spacious:not\(\.overlay, \.three-up, \.four-up\) > ul \{ row-gap: 82px; \}/);
  has(/@media \(width >= 768px\) \{[^@]*body\.brand-lufthansa main > \.section:has\(> \.cards-teaser-wrapper:last-child > \.cards-teaser\.spacious\):not\(:has\(~ \.section:not\(:empty\)\)\) \{ margin-bottom: 42px; \}/);
  assert.ok(!/(^|\})\s*\.cards-teaser\.spacious/.test(css), 'no unscoped spacious rule');
});
