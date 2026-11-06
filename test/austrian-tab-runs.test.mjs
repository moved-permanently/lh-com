/* eslint-disable max-len, import/extensions -- dev tooling */
/* Austrian's tab sets whose panels hold a grey band (/at/de/missing-baggage, travelling-with-animals,
   unterhaltung-an-bord, austrian-app; parity row 43, brief 438): since lh-com's sections transformer makes Tab
   sections itself (515475be) besides Austrian's tab markers, the band's section (and the separator's after it)
   came out without the panel's Tab and Tabs rows, so they showed under every tab. withTabRuns (after
   withAustrianTabs): a section without Tab rows between two sections of the same tab set takes the rows of the
   panel before it (into its own section metadata, after its style row); sections before the first tab and after
   the last stay as they are. The transformers' interplay itself is ema-cashub's (row 43).
   Run: node --max-old-space-size=512 --test test/austrian-tab-runs.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const meta = (rows) => `<div class="section-metadata">${rows.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('')}</div>`;
const sec = (body, rows) => `<div>${body}${rows ? meta(rows) : ''}</div>`;

test('the band and the separator inside a panel take its Tab rows; before and after the set as they were', async () => {
  const { withTabRuns } = await import('../tools/importer/austrian-import.mjs');
  const doc = [
    sec('<h1>Gepäckprobleme</h1>'),
    sec('<p>A</p>', [['Tab', 'Verspätet'], ['Tabs', '1']]),
    sec('<p>band</p>', [['style', 'flush, grey']]),
    sec('<p>{spacer-100}</p>'),
    sec('<p>B</p>', [['Tab', 'Beschädigt'], ['Tabs', '1']]),
    sec('<p>C</p>', [['Tab', 'Verlust'], ['Tabs', '1']]),
    sec('<p>{divider-25}</p>'),
  ].join('\n');
  const out = withTabRuns(doc).split('\n');
  assert.equal(out[0], sec('<h1>Gepäckprobleme</h1>'));
  assert.equal(out[2], sec('<p>band</p>', [['style', 'flush, grey'], ['Tab', 'Verspätet'], ['Tabs', '1']]));
  assert.equal(out[3], sec('<p>{spacer-100}</p>', [['Tab', 'Verspätet'], ['Tabs', '1']]));
  assert.equal(out[6], sec('<p>{divider-25}</p>'), 'after the last tab as it was');
  assert.equal(withTabRuns(out.join('\n')), out.join('\n'), 'once');
});

test('the last panel\'s band (full-bleed or flush, right after the last tab) is in it; the section after it is not', async () => {
  const { withTabRuns } = await import('../tools/importer/austrian-import.mjs');
  const doc = [
    sec('<p>{spacer-25}</p>', [['Tab', 'Airport guide'], ['Tabs', '1']]),
    sec('<p>band</p>', [['style', 'full-bleed']]),
    sec('<div class="columns-media"></div>', [['style', 'column-band, grey']]),
  ].join('\n');
  const out = withTabRuns(doc).split('\n');
  assert.equal(out[1], sec('<p>band</p>', [['style', 'full-bleed'], ['Tab', 'Airport guide'], ['Tabs', '1']]));
  assert.equal(out[2], sec('<div class="columns-media"></div>', [['style', 'column-band, grey']]));
});

test('two tab sets: a section between them stays outside', async () => {
  const { withTabRuns } = await import('../tools/importer/austrian-import.mjs');
  const doc = [sec('<p>A</p>', [['Tab', 'x'], ['Tabs', '1']]), sec('<p>between</p>'), sec('<p>B</p>', [['Tab', 'y'], ['Tabs', '2']])].join('\n');
  assert.equal(withTabRuns(doc), doc);
});

test('the import applies it after the tab sections', () => {
  const src = fs.readFileSync(new URL('../tools/importer/austrian-import.mjs', import.meta.url), 'utf8');
  assert.match(src, /withPartnerLogoAlts\(withTabRuns\(withAustrianTabs\(/);
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
  assert.match(src, /withoutLoads\(withNestedOnecolumnUnwrapped\(withPanelWrappersUnwrapped\(withTabMarkers\(/);
});
