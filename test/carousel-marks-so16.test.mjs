/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Standing order 16 (2026-11-13), item 3: the grey band's next step, column marks for the views that become other blocks.
   On /de/en/special-meals the view after the grey band is a titled two-column view in a new AEM section ("More information
   about our in-flight menus", two teasers): www pads it 3.2rem above and below like every column view of an AEM section,
   but it becomes a Carousel Cards block, and the cleanup marked only views that stay default content or become Columns
   Media; its title had no "{column-start}" and the block no "{column-end}". A titled view of an AEM section that becomes
   Carousel Cards is marked now (info, as columns-media's: the parser keeps the mark around the title and the block, the
   cleanup writes the markers; "column-spaced" when it ends the page in a section with .mb-default). Untitled views and
   other templates stay as they were.
   Input: the AEM section of the special-meals snapshot (test/fixtures/carousel-marks-so16).
   Run: node --max-old-space-size=256 --test test/carousel-marks-so16.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

globalThis.WebImporter = {
  Blocks: {
    createBlock: (document, { name, variants = [] }) => {
      const t = document.createElement('table');
      t.setAttribute('data-block', [name, ...variants].join(' '));
      return t;
    },
    getMetadata: () => ({}),
    getMetadataBlock: (document) => document.createElement('table'),
  },
};
const { default: cleanup } = await import('../tools/importer/transformers/lufthansa-cleanup.js');
const { default: carouselCards } = await import('../tools/importer/parsers/carousel-cards.js');

const URL_SM = 'https://www.lufthansa.com/de/en/special-meals';
const fixture = fs.readFileSync(new URL('./fixtures/carousel-marks-so16/special-meals-card-view.html', import.meta.url), 'utf8').replace(/^<!--.*-->\n/, '');
const run = (html, template = 'info') => {
  const { document } = parseHTML(`<html><head><title>Special meals | Lufthansa</title></head><body><main><div class="container-content">${html}</div></main></body></html>`);
  const payload = {
    document, url: URL_SM, params: { originalURL: URL_SM }, template: { ...(typeof template === 'string' ? { name: template } : template), blocks: [{ name: 'carousel-cards', instances: ['.section-content > .twocolumn'] }] },
  };
  cleanup('beforeTransform', document.body, payload);
  const view = document.querySelector('.section-content > .twocolumn');
  const marked = view ? view.getAttribute('data-lh-column') : null;
  if (view) carouselCards(view, { document });
  cleanup('afterTransform', document.body, payload);
  return { document, marked };
};
const text = (el) => el.textContent.replace(/\s+/g, ' ').trim();

test('the titled card view gets its column marks: the title opens it, a marker paragraph after the block ends it', () => {
  const { document, marked } = run(fixture);
  assert.equal(marked, 'sc-spaced', 'it ends the page in a section with .mb-default');
  const table = document.querySelector('table[data-block^="carousel-cards"]');
  assert.ok(table, 'the block');
  // (the fixture has no page title, so the cleanup makes the view's h2 the page's h1)
  const h = document.querySelector('h1, h2');
  assert.equal(text(h), 'More information about our in-flight menus {heading-small column-start}');
  let next = table.nextElementSibling;
  while (next && !text(next)) next = next.nextElementSibling;
  assert.equal(text(next), '{column-end column-spaced}');
  assert.ok(!document.querySelector('[data-lh-column]'), 'the attribute is gone');
});

test('not on templates without column marks or a brand\'s info-based one, and not for an untitled card view', () => {
  // (a brand's template built on info, Austrian's: unmeasured, unmarked)
  const brand = run(fixture, { name: 'austrian-checkin', base: 'info' });
  assert.equal(brand.marked, null);
  const hub = run(fixture, 'hub');
  assert.equal(hub.marked, null);
  assert.ok(!/column-(start|end)/.test(hub.document.body.innerHTML));
  const untitled = fixture.replace(/<div><h2 class="heading-small {2}">More information about our in-flight menus<\/h2><\/div>/, '');
  assert.notEqual(untitled, fixture, 'the fixture changed');
  const u = run(untitled);
  assert.equal(u.marked, null);
  assert.ok(!/column-(start|end)/.test(u.document.body.innerHTML));
});
