/* eslint-disable max-len */
/* Brief 497 item 1: theme defaults over markers where step 1 of the token-free plan carries them
   (scripts/style-markers.js SPACE, DIVIDER_SPACE; scripts/token-free.js decoratePurposeBlocks draws the
   purpose blocks as the separator paragraphs the markers make). A template that opts in
   (page-templates.json "transformers": theme-separators; hub) writes the theme's separators as purpose
   blocks: "{spacer-60}" Spacer, "{spacer-120}" Spacer (l), "{divider-25}" Divider (miles-and-more's rule
   above "This might also interest you"). Every other size, and "from-768", keeps its marker (no
   carrier); a separator inside a block's cell stays as it is.
   Run: node --max-old-space-size=256 --test test/theme-separators-497.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { SPACE, DIVIDER_SPACE } from '../scripts/style-markers.js';

const { default: themeSeparators } = await import('../tools/importer/transformers/theme-separators.js');

globalThis.WebImporter = {
  Blocks: {
    createBlock: (document, { name, cells }) => {
      const table = document.createElement('table');
      table.innerHTML = `<tr><th>${name}</th></tr>${cells.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}`;
      return table;
    },
  },
};

const run = (body) => {
  const { document } = parseHTML(`<html><body><main>${body}</main></body></html>`);
  const main = document.querySelector('main');
  themeSeparators('afterTransform', main, { document });
  return main;
};
const names = (main) => [...main.querySelectorAll('table')].map((t) => t.querySelector('th').textContent);

test('the theme\'s separators become purpose blocks in place', () => {
  const main = run('<p>Text</p><p>{divider-25}</p><h3>Next</h3><p>{spacer-60}</p><p>More</p><p>{spacer-120}</p><hr>');
  assert.deepEqual(names(main), ['Divider', 'Spacer', 'Spacer (l)']);
  assert.equal(main.textContent.includes('{'), false, main.innerHTML);
  assert.deepEqual([...main.children].map((c) => c.tagName), ['P', 'TABLE', 'H3', 'TABLE', 'P', 'TABLE', 'HR']);
});

test('the sizes are the module\'s (M, L, Divider)', () => {
  assert.deepEqual([SPACE.m, SPACE.l, DIVIDER_SPACE], [60, 120, 25]);
});

test('other sizes, from-768, and separators inside a block keep their markers', () => {
  const main = run('<p>{spacer-40}</p><p>{spacer-60 from-768}</p><p>{divider-40}</p><p>{spacer-25}</p><table><tr><th>Columns Media</th></tr><tr><td><p>{divider-25}</p></td></tr></table><p>Ticket {spacer-60}</p>');
  assert.deepEqual(names(main), ['Columns Media']);
  assert.equal(main.querySelectorAll('p').length, 6);
});

test('only in afterTransform', () => {
  const { document } = parseHTML('<html><body><main><p>{divider-25}</p></main></body></html>');
  const main = document.querySelector('main');
  themeSeparators('beforeTransform', main, { document });
  assert.equal(main.querySelector('table'), null);
});
