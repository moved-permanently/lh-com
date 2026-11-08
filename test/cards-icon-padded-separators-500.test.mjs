/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Brief 500 item 1, /de/en/additional-services (hub since 2416546): campaign-sections, which hub runs now, keeps
   www's separators as separator components in their AEM section (a text component "{spacer-60 from-768}"). The
   cards-icon parser's "a column view of its own" (ema-test, 35e34400) wanted every sibling empty, so the five
   service-tile views lost option padded again (32 px above and below on www): the page 30 px short per band, five
   times (-160 px at 1440). A sibling that is only a separator marker counts as empty; a sibling with text as before.
   Run: node --max-old-space-size=256 --test test/cards-icon-padded-separators-500.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

let variants;
globalThis.WebImporter = { Blocks: { createBlock: (document, opts) => { variants = opts.variants; return document.createElement('table'); } } };
const { default: parse } = await import('../tools/importer/parsers/cards-icon.js');

const tile = (n) => `<div class="col-md-6 col-lg column-view-item"><div class="teaser event section"><a href="/de/en/x${n}" class="teaser usp"><h3 class="heading-copytext-large teaser-heading"><div class="image-wrapper"><img src="/content/dam/lh/icons/i${n}.jpg" alt=""></div>Extra ${n}</h3></a></div></div>`;
const view = `<div class="threecolumn column event section"><div class="column-view flex-column"><div class="row">${tile(1)}${tile(2)}${tile(3)}</div></div></div>`;
const sep = (m) => `<div class="text section"><div class="richtext limited-width"><p>{${m}}</p></div></div>`;
const run = (inner) => {
  const { document } = parseHTML(`<html><body><div class="container-content"><div class="section"><div><div class="section-content">${inner}</div></div></div></div></body></html>`);
  variants = null;
  parse(document.querySelector('.threecolumn'), { document });
  return variants;
};

test('separator components around the view (campaign-sections): still a column view of its own, option padded', () => {
  assert.deepEqual(run(`${view}${sep('spacer-60 from-768')}`), ['usp', 'padded']);
  assert.deepEqual(run(`${sep('spacer-25')}${view}${sep('divider-25')}`), ['usp', 'padded']);
});

test('a sibling with text: as before, no option', () => {
  assert.deepEqual(run(`${sep('spacer-60')}<div class="text section"><div class="richtext"><p>More extras</p></div></div>${view}`), ['usp']);
});
