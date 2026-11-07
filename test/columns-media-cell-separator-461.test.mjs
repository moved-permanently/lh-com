/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Brief 461, item 2: a separator between two text components inside a multi-column view's item
   (www's legal two-column text rows: terms-of-service-group's airlines, headline + text + link,
   then a .separator, then the next airline's headline). www keeps the separator's space there
   (.hr margin-bottom 2.5rem + 1px): link -> next heading 81 px at 1440, ours 49. The cleanup now
   writes such a separator as a "{spacer-N}" paragraph inside the item, the columns-media parser
   keeps it in the cell, columns-media.css sizes it as default content's spacers (N + 1 px).
   Text components only (text, link, headline: teaser rows are the card blocks'); separators at the
   start or end of an item as before (www: no margin there). lufthansa.com's cleanup only.
   Run: node --max-old-space-size=256 --test test/columns-media-cell-separator-461.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import transform from '../tools/importer/transformers/lufthansa-cleanup.js';

let out;
globalThis.WebImporter = {
  Blocks: {
    getMetadata: () => ({}),
    getMetadataBlock: (document) => document.createElement('table'),
    createBlock: (document, { cells }) => {
      out = cells.map((row) => row.map((c) => (Array.isArray(c) ? c.map((n) => n.outerHTML || n.textContent).join('') : (c && c.outerHTML) || String(c))));
      return document.createElement('table');
    },
  },
};
const { default: parse } = await import('../tools/importer/parsers/columns-media.js');

const URL_TOS = 'https://www.lufthansa.com/de/en/terms-of-service-group';
const headline = (t) => `<div class="headline section"><h2 class="headline heading-copytext-large">${t}</h2></div>`;
const text = (t) => `<div class="text section"><div class="richtext"><p>${t}</p></div></div>`;
const link = (t) => `<div class="link event section"><a href="/x">${t}</a></div>`;
const sep = (style) => `<div class="separator section"><div aria-hidden="true" ${style ? `style="${style}" ` : ''}class="hr hr-no-layout "><maui-divider></maui-divider></div></div>`;
const teaser = '<div class="teaser section"><a class="teaser card" href="/t"><h3>Card</h3></a></div>';
const item = (inner) => `<div class="col-md-6 col-lg column-view-item">${inner}</div>`;

const cells = (items, template = 'legal') => {
  const { document } = parseHTML(`<html><head><title>T | Lufthansa</title></head><body><main><div class="container-content"><div class="section"><div class=" mb-default "><div class="section-content container-fluid section-regular "><div class="twocolumn column event"><div class="column-view flex-column"><div class="row">${items.map(item).join('')}</div></div></div></div></div></div></div></main></body></html>`);
  const payload = {
    document, url: URL_TOS, params: { originalURL: URL_TOS }, template: { name: template },
  };
  transform('beforeTransform', document.body, payload);
  out = null;
  parse(document.querySelector('.twocolumn'), { document });
  return out ? out.flat() : [];
};

test('legal: link, separator, next airline: a spacer paragraph between them in the cell', () => {
  const c = cells([
    `${headline('Lufthansa')}${text('For flights operated by Lufthansa')}${link('Lufthansa GCC')}${sep()}${headline('Austrian')}${text('For flights by Austrian')}${link('Austrian GCC')}${sep()}`,
    `${headline('SWISS')}${text('For SWISS')}${link('SWISS GCC')}${sep('margin-bottom: 40px;')}${headline('Brussels')}${text('For Brussels')}${link('Brussels GCC')}`,
  ]);
  assert.equal(c.length, 2, JSON.stringify(c));
  assert.match(c[0], /Lufthansa GCC<\/a><\/p><p>\{spacer-25\}<\/p><h2[^>]*>Austrian/);
  assert.match(c[1], /SWISS GCC<\/a><\/p><p>\{spacer-40\}<\/p><h2[^>]*>Brussels/);
  assert.ok(!/\{spacer-\d+\}<\/p>$/.test(c[0]), 'none at the end of the item');
});

test('text -> link and text -> heading too; teaser rows and separators at an item\'s start as before', () => {
  const c = cells([`${text('Intro')}${sep('margin-bottom: 10px;')}${link('More')}`, `${sep()}${headline('Top')}${text('Body')}`]);
  assert.match(c[0], /Intro<\/p><p>\{spacer-10\}<\/p>/);
  assert.ok(!/spacer/.test(c[1]), 'the item starts with it: none');
  const { document } = parseHTML(`<html><body><div class="section-content"><div class="twocolumn"><div class="column-view"><div class="row">${item(`${teaser}${sep()}${link('All cards')}`)}${item(teaser)}</div></div></div></div></body></html>`);
  transform('beforeTransform', document.body, {
    document, url: URL_TOS, params: { originalURL: URL_TOS }, template: { name: 'legal' },
  });
  assert.equal(document.querySelectorAll('p').length === 0 || ![...document.querySelectorAll('p')].some((p) => /spacer/.test(p.textContent)), true, 'teaser row: no spacer');
});

test('columns-media.css sizes a cell spacer as default content\'s (N + 1 px, no margin), lufthansa.com', () => {
  const css = fs.readFileSync(new URL('../blocks/columns-media/columns-media.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
  assert.match(css, /body\.brand-lufthansa \.columns-media \.columns-media-text > p\.spacer \{ box-sizing: content-box; height: calc\(var\(--spacer-size, 25px\) \+ 1px\); margin: 0; \}/);
});

test('the block keeps a cell spacer (removeEmpty drops empty paragraphs, not p.spacer)', () => {
  const js = fs.readFileSync(new URL('../blocks/columns-media/columns-media.js', import.meta.url), 'utf8');
  assert.match(js, /root\.querySelectorAll\('p:not\(\.spacer\), div'\)/);
});
