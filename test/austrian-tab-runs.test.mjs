/* eslint-disable max-len, import/extensions -- dev tooling */
/* Austrian's tab sets whose panels hold a grey band (/at/de/missing-baggage, travelling-with-animals,
   unterhaltung-an-bord, austrian-app; parity row 43): a band inside a marked panel (SWISS's withTabMarkers)
   opened a section of its own in lh-com's sections transformer, without the panel's Tab and Tabs rows, so it
   showed under every tab. Brief 438 patched the document after the import (withTabRuns: a section without Tab
   rows between two of the same set takes the rows before it; the band right after the last tab too). Brief 444
   moved it into lufthansa-sections.js (test/importer-tab-sections.test.mjs): a break inside a marked panel
   carries the panel's Tab and Tabs, and the panel ends at the next marker. withTabRuns is gone: on
   /at/de/austrian-app and the ten advertise-with-austrian pages its "band right after the last tab" guess gave
   the band after the set (on www outside the tabs) the last panel's rows.
   Run: node --max-old-space-size=512 --test test/austrian-tab-runs.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('the import splits the tab sets with the transformer\'s Tab rows only (no withTabRuns)', () => {
  const src = fs.readFileSync(new URL('../tools/importer/austrian-import.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(src, /withTabRuns/);
  assert.match(src, /withPartnerLogoAlts\(withAustrianTabs\(/);
  const sections = fs.readFileSync(new URL('../tools/importer/transformers/lufthansa-sections.js', import.meta.url), 'utf8');
  assert.match(sections, /function markPanelBreaks\(document\)/);
});

test('row 36: a tab panel\'s bare wrapper around column views unwrapped after the tab markers, so lh-com\'s info importer maps its one-column view\'s steps', async () => {
  const { withPanelWrappersUnwrapped } = await import('../tools/importer/austrian-import.mjs');
  const view = '<div class="onecolumn column"><div class="column-view flex-column"><div class="row"><div class="col-lg column-view-item"><div class="fourcolumn column"><p>1</p></div></div></div></div></div>';
  const html = `<html><body><div class="section"><div class="section-content container-fluid"><div class="text section"><p>@@tab@@1@@A@@</p></div><div>${view}</div></div></div></body></html>`;
  const out = withPanelWrappersUnwrapped(html);
  assert.ok(out.includes(`<div class="section-content container-fluid"><div class="text section"><p>@@tab@@1@@A@@</p></div>${view}</div>`), 'the view a child of the section content');
  const plain = '<html><body><div class="section-content"><div><p>text only</p></div></div></body></html>';
  assert.ok(withPanelWrappersUnwrapped(plain).includes('<div><p>text only</p></div>'), 'a wrapper without column views stays');
  const src = fs.readFileSync(new URL('../tools/importer/austrian-import.mjs', import.meta.url), 'utf8');
  assert.match(src, /withoutLoads\(withNestedOnecolumnUnwrapped\(withPanelWrappersUnwrapped\(withAccordionMapsHoisted\(withTabMarkers\(/);
});
