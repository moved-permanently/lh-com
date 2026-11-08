/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The brief after 488, item 1: /de/en/additional-services' service tiles are a column view of their own in an AEM section
   (.section-content > .threecolumn > .column-view:only-child); www pads it 3.2rem above and below (the tiles' block 184 px
   at 1440 in www's own CSS, lh-parity-003: 32 + 120 + 32), ours 120. The cards-icon parser gives such a column view option
   padded (as columns-media: not with a column title, not in a grey band or an article); cards-icon.css 32 px above and below.
   Run: node --max-old-space-size=256 --test test/cards-icon-padded.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

let variants;
globalThis.WebImporter = { Blocks: { createBlock: (document, opts) => { variants = opts.variants; return document.createElement('table'); } } };
const { default: parse } = await import('../tools/importer/parsers/cards-icon.js');

const tile = (n) => `<div class="col-md-6 col-lg column-view-item"><div class="teaser event section"><a href="/de/en/x${n}" class="teaser usp"><h3 class="heading-copytext-large teaser-heading"><div class="image-wrapper"><img src="/content/dam/lh/icons/i${n}.jpg" alt=""></div>Extra ${n}</h3></a></div></div>`;
const view = (title = '') => `<div class="threecolumn column event section"><div class="column-view flex-column">${title}<div class="row">${tile(1)}${tile(2)}${tile(3)}</div></div></div>`;
const run = (inner) => {
  const { document } = parseHTML(`<html><body><div class="container-content">${inner}</div></body></html>`);
  variants = null;
  parse(document.querySelector('.threecolumn'), { document });
  return variants;
};

test('a column view of its own in an AEM section: option padded', () => {
  assert.deepEqual(run(`<div class="section"><div><div class="section-content container-fluid section-regular">${view()}</div></div></div>`), ['usp', 'padded']);
});

test('with other components in the AEM section, a column title, in a grey band: as before', () => {
  assert.deepEqual(run(`<div class="section"><div><div class="section-content"><div class="headline section"><h2>Extras</h2></div>${view()}</div></div></div>`), ['usp'], 'a heading before it in the section');
  assert.deepEqual(run(`<div class="section"><div><div class="section-content">${view('<div class="headline"><h2>Title</h2></div>')}</div></div></div>`), ['usp'], 'its own title');
  assert.deepEqual(run(`<div class="section"><div class="container-gray"><div class="section-content">${view()}</div></div></div>`), ['usp'], 'grey');
});

test('cards-icon.css: option padded 32 px above and below', () => {
  const css = fs.readFileSync(new URL('../blocks/cards-icon/cards-icon.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
  assert.match(css, /\.cards-icon\.padded \{ padding: 32px 0; \}/);
});
