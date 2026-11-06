/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The importer's related-articles parser (tools/importer/parsers/related-articles.js): www's
   heading over the related articles is a maui-headline h3 at the h2 size (type="h3" format="h2",
   "Related Articles"); the parser wrote an h2, where DA's articles have www's h3 with the
   heading-medium size (brief 407, related-articles-heading.mjs; the brief 435 re-import of
   /de/en/articles/explore-the-world/experience-nature would have turned it back into an h2).
   Now the level comes from type, the size from format (the class the cleanup turns into the
   "{heading-medium}" marker). A headline without type stays an h2.
   Run: node --max-old-space-size=256 --test test/related-articles-parser.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

globalThis.WebImporter = {
  Blocks: {
    createBlock: (document, { name }) => {
      const t = document.createElement('table');
      t.innerHTML = `<tr><th>${name}</th></tr>`;
      return t;
    },
  },
};
const { default: parse } = await import('../tools/importer/parsers/related-articles.js');

const heading = (headline) => {
  const { document } = parseHTML(`<html><body><div class="relatedarticles">${headline}<a class="articles-card" href="/de/en/articles/x">x</a></div></body></html>`);
  parse(document.querySelector('.relatedarticles'), { document });
  const h = document.querySelector('h1, h2, h3, h4, h5, h6');
  return h && [h.tagName, h.className, h.textContent];
};

test('www\'s h3 at the h2 size: an h3 with the heading-medium size', () => {
  assert.deepEqual(heading('<maui-headline class="related-articles-headline" type="h3" format="h2" margin="margin" theme="lh">Related Articles</maui-headline>'), ['H3', 'heading-medium', 'Related Articles']);
});

test('the same level and size: no size class', () => {
  assert.deepEqual(heading('<maui-headline class="related-articles-headline" type="h2" format="h2">Ähnliche Artikel</maui-headline>'), ['H2', '', 'Ähnliche Artikel']);
});

test('no type: an h2 as before', () => {
  assert.deepEqual(heading('<maui-headline class="related-articles-headline">Related Articles</maui-headline>'), ['H2', '', 'Related Articles']);
});
