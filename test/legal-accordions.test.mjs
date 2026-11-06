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
