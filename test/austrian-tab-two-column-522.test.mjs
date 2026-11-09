/* eslint-disable max-len, import/extensions -- dev tooling */
/* The brief after 521, item 2 (travelling-with-animals, Austrian's ranking row 7: +621 px at 1440): www's cabin-pets tab holds
   a two-column view (the text left, the carrier picture and its caption right) inside the tab panel's own one-column view
   (its heading "Small pets in the cabin" above the row), and the tab control sits in a one-column view's item. Once the
   tab markers replace the tab control the panel's bare wrapper (<div>) is left in that item, and the panel's view has a
   heading wrapper before its row: withPanelWrappersUnwrapped looked only under .section-content, withNestedOnecolumnUnwrapped
   only at a view holding one row, so the two-column view stayed two levels deep, where lh-com's info importer leaves it to
   the text flow (":is(.section-content, .container-content) > .onecolumn > … > .column-view-item > .twocolumn" is
   one level). Now a bare wrapper holding a column view goes in a column-view item too, and a nested one-column view
   whose view is a heading wrapper and one row gives both to the outer item (the heading wrapper kept).
   Run: node --max-old-space-size=256 --test test/austrian-tab-two-column-522.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';

const item = (inner) => `<div class="row"><div class="col-lg column-view-item">${inner}</div></div>`;
const one = (inner, head = '') => `<div class="onecolumn column event"><div data-identifier="onecolumn" class="column-view flex-column ">${head}${item(inner)}</div></div>`;
const pair = '<div class="twocolumn column event"><div class="column-view  flex-column "><div class="row"><div class="col-md-6 col-lg column-view-item"><div class="text section">T</div></div><div class="col-md-6 col-lg column-view-item"><div class="image parbase section">P</div></div></div></div></div>';
const head = '<div>\n<h2 class="heading-medium  " id="petc">Small pets in the cabin</h2>\n</div>';
const marker = '<div class="text section"><div class="richtext"><p>@@tab@@1@@Pets in the cabin@@</p></div></div>';

test('a tab panel\'s bare wrapper in a column-view item, holding a column view, is unwrapped', async () => {
  const { withPanelWrappersUnwrapped } = await import('../tools/importer/austrian-import.mjs');
  const html = `<div class="section-content">${one(`${marker}<div>${one(pair)}</div>`)}</div>`;
  assert.equal(withPanelWrappersUnwrapped(html), `<div class="section-content">${one(`${marker}${one(pair)}`)}</div>`);
  const plain = `<div class="section-content">${one(`${marker}<div><p>no view</p></div>`)}</div>`;
  assert.equal(withPanelWrappersUnwrapped(plain), plain, 'a bare div without a column view stays');
});

test('a nested one-column view with a heading wrapper before its one row gives both to the outer item', async () => {
  const { withNestedOnecolumnUnwrapped } = await import('../tools/importer/austrian-import.mjs');
  const html = `<div class="section-content">${one(`${marker}${one(pair, head)}`)}</div>`;
  assert.equal(withNestedOnecolumnUnwrapped(html), `<div class="section-content">${one(`${marker}${head}${pair}`)}</div>`);
  const twoRows = `<div class="section-content">${one(`<div class="onecolumn column event"><div data-identifier="onecolumn" class="column-view flex-column ">${head}${item(pair)}${item('<p>x</p>')}</div></div>`)}</div>`;
  assert.equal(withNestedOnecolumnUnwrapped(twoRows), twoRows, 'a view of two rows stays');
  const notHeading = `<div class="section-content">${one(one(pair, '<div><div class="text">x</div></div>'))}</div>`;
  assert.equal(withNestedOnecolumnUnwrapped(notHeading), notHeading, 'a wrapper that is not a heading stays');
  const noView = `<div class="section-content">${one(one('<div class="accordion">Q</div>', head))}</div>`;
  assert.equal(withNestedOnecolumnUnwrapped(noView), noView, 'a heading over an item without a column view stays (missing-baggage\'s questions)');
});

test('both steps: the tab\'s two-column view one level into the section\'s one-column view', async () => {
  const { withPanelWrappersUnwrapped, withNestedOnecolumnUnwrapped } = await import('../tools/importer/austrian-import.mjs');
  const html = `<div class="section-content">${one(`${marker}<div>${one(one(pair, head))}</div>`)}</div>`;
  const out = withNestedOnecolumnUnwrapped(withPanelWrappersUnwrapped(html));
  assert.equal(out, `<div class="section-content">${one(`${marker}${head}${pair}`)}</div>`);
});
