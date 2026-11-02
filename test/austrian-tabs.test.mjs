/* eslint-disable max-len */
/* Austrian's tab sets that hold blocks (www.austrian.com's maui-tab-control-responsive with column
   views, accordions, tables): tools/importer/austrian-import.mjs marks them (mappedOf, SWISS's
   withTabMarkers) and makes Tab sections of them after the import (withAustrianTabs, SWISS's
   splitTabSections), as ema-cashub did for SWISS (2b35553d); scripts/section-tabs.js shows them.
   Run: node --max-old-space-size=512 --test test/austrian-tabs.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';

const { mappedOf, withAustrianTabs } = await import('../tools/importer/austrian-import.mjs');

const snapshot = '<main><div class="text section"><div class="richtext"><p>Before</p></div></div>'
  + '<div class="tabs panelcontainer"><maui-tab-control-responsive>'
  + '<maui-tab-control-panel-responsive name="Handgepäcksregeln"><div class="twocolumn column"><div class="column-view"><p>Rules</p></div></div></maui-tab-control-panel-responsive>'
  + '<maui-tab-control-panel-responsive name="Flüssigkeiten im&nbsp;Handgepäck"><div class="accordion section"><p>Liquids</p></div></maui-tab-control-panel-responsive>'
  + '</maui-tab-control-responsive></div><div class="text section"><div class="richtext"><p>After</p></div></div></main>';

test('the snapshot: a tab set that holds blocks as its panels, a marker before each and after the set', () => {
  const out = mappedOf(`<html><body>${snapshot}</body></html>`, '/at/de/handgepaeck');
  assert.match(out, /<p>@@tab@@1@@Handgepäcksregeln@@<\/p><\/div><\/div><div class="twocolumn column">/);
  assert.match(out, /<p>@@tab@@1@@Flüssigkeiten im&nbsp;Handgepäck@@<\/p><\/div><\/div><div class="accordion section">/);
  assert.match(out, /<p>@@tabs-end@@<\/p><\/div><\/div><div class="text section"><div class="richtext"><p>After/);
  assert.ok(!out.includes('maui-tab-control'), 'no tab control left');
  // a set of text only stays as it is
  const text = '<div class="tabs panelcontainer"><maui-tab-control-panel-responsive name="A"><div class="text"><p>a</p></div></maui-tab-control-panel-responsive></div>';
  assert.ok(mappedOf(text, '/at/de/x').includes('maui-tab-control-panel-responsive'));
});

test('the document: a section per panel with Tab and Tabs, the content before and after in their own sections', () => {
  const doc = '<div><p>Before</p><p>@@tab@@1@@Handgepäcksregeln@@</p><div class="columns-media"><div><div>Rules</div></div></div><p>@@tab@@1@@Flüssigkeiten@@</p><div class="accordion-columns"><div><div>Liquids</div></div></div><p>@@tabs-end@@</p><p>After</p><div class="section-metadata"><div><div>style</div><div>grey</div></div></div></div>';
  const out = withAustrianTabs(doc);
  assert.equal(out, [
    '<div><p>Before</p><div class="section-metadata"><div><div>style</div><div>grey</div></div></div></div>',
    '<div><div class="columns-media"><div><div>Rules</div></div></div><div class="section-metadata"><div><div>Tab</div><div>Handgepäcksregeln</div></div><div><div>Tabs</div><div>1</div></div></div></div>',
    '<div><div class="accordion-columns"><div><div>Liquids</div></div></div><div class="section-metadata"><div><div>Tab</div><div>Flüssigkeiten</div></div><div><div>Tabs</div><div>1</div></div></div></div>',
    '<div><p>After</p><div class="section-metadata"><div><div>style</div><div>grey</div></div></div></div>',
  ].join('\n'));
  assert.equal(withAustrianTabs('<div><p>x</p></div>'), '<div><p>x</p></div>', 'a document without tab markers as it was');
});

test('a marker the import gave paragraph tokens: full-width goes, the others stay after the marker (in the panel)', () => {
  const doc = '<div><p>Intro</p><p>@@tab@@1@@Check-in@@ {full-width column-start}</p><h3>Online</h3><p>@@tab@@1@@Ihr Gepäck@@ {full-width}</p><p>Bags</p><p>@@tabs-end@@ {full-width}</p><p>After</p></div>';
  assert.equal(withAustrianTabs(doc), [
    '<div><p>Intro</p></div>',
    '<div><p>{column-start}</p><h3>Online</h3><div class="section-metadata"><div><div>Tab</div><div>Check-in</div></div><div><div>Tabs</div><div>1</div></div></div></div>',
    '<div><p>Bags</p><div class="section-metadata"><div><div>Tab</div><div>Ihr Gepäck</div></div><div><div>Tabs</div><div>1</div></div></div></div>',
    '<div><p>After</p></div>',
  ].join('\n'));
});
