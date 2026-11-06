/* The legal template's accordions (tools/importer/page-templates.json): www's FAQ and conditions
   pages (/de/en/faq-data-security, faq-password-security, common/accessibility-statement,
   common/seatreservation-condtions/seat-reservations) hold .accordion components (maui-collapsible
   items, the question in the item's header). The legal template had no block for them, so the
   import kept the answers as plain paragraphs and lost every question (worst page-widths of the
   2026-11-06 parity summary, faq-data-security at 390). Now .accordion is accordion-columns, as on
   the info and hub templates; the striped tables inside an accordion stay the accordion's.
   Run: node --test test/legal-accordions.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const { templates } = JSON.parse(fs.readFileSync(new URL('../tools/importer/page-templates.json', import.meta.url), 'utf8'));
const block = (template, name) => templates.find((t) => t.name === template).blocks.find((b) => b.name === name);

test('legal: .accordion is accordion-columns, as on info and hub', () => {
  assert.deepEqual(block('legal', 'accordion-columns')?.instances, ['.accordion']);
  assert.deepEqual(block('info', 'accordion-columns').instances, ['.accordion']);
});

test('legal: a striped table inside an accordion is still the accordion\'s', () => {
  assert.match(block('legal', 'table-striped').instances[0], /:not\(\.accordion div\.table\)/);
});

// campaign: teaser rows straight in the page column (/de/en/discover-lufthansa/take-off: five
// .container-content > .twocolumn rows of image + headline + text + link) came in as plain content
test('campaign: teaser rows in the page column are cards-teaser too, as on hub', () => {
  assert.deepEqual(block('campaign', 'cards-teaser').instances, [':is(.section-content, .container-content) > .twocolumn:has(.column-view-item > .image + .headline)']);
});

// info: picture and text rows inside a sidebar's content (Brussels /be/en/plan-your-trip/
// travel-regulations: .sidebar > .airem-sidebar > .sidebar-content > .twocolumn, six rows) came in
// as plain content (tools/reports/brussels/parity.md P37)
test('info: rows in a sidebar\'s content are columns-media, as rows in a section', () => {
  assert.ok(block('info', 'columns-media').instances.some((s) => s.startsWith(':is(.section-content, .container-content, .sidebar-content) > .twocolumn:not(')));
});

// campaign: a sidebar after another component in its column item (/de/en/100-years/campaigns: the
// "Made in Germany" text, then a sidebar with its picture) was a block of its own inside the row,
// and the row's parser dropped it with the picture; the row (columns-media) takes it now. A sidebar
// alone in its column item (100-years' "Under the symbol of the crane") stays a block.
test('campaign: a sidebar after another component in its column item is part of the row', () => {
  assert.ok(block('campaign', 'columns-media').instances.includes('.sidebar:not(.column-view-item > * ~ .sidebar)'));
  assert.ok(!block('campaign', 'columns-media').instances.includes('.sidebar'));
});
