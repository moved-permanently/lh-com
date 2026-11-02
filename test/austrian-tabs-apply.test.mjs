/* eslint-disable max-len */
/* tools/importer/austrian-tabs-apply.mjs: Austrian's tab sets into the documents as they are: the
   markers where a marked copy has them, a panel's later sections (its image section with its own
   style) joined into the panel, the content before and after the set in its sections.
   Run: node --max-old-space-size=512 --test test/austrian-tabs-apply.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';

const {
  markersOf, withMarkers, joinSets, contentOf,
} = await import('../tools/importer/austrian-tabs-apply.mjs');
const { withAustrianTabs } = await import('../tools/importer/austrian-import.mjs');

const meta = (k, v) => `<div class="section-metadata"><div><div>${k}</div><div>${v}</div></div></div>`;

test('markers from the marked copy, placed in the document before each panel\'s first element; tokens opening a panel go with it', () => {
  const marked = '<div><p>Intro</p><p>@@tab@@1@@Check-in@@ {full-width}</p><h3>Mobile check-in</h3><p>Text</p></div>\n<div><p>@@tab@@1@@Baggage@@ {full-width}</p><h3>Baggage</h3><p>@@tabs-end@@ {full-width}</p><h2>After</h2></div>';
  const markers = markersOf(marked);
  assert.deepEqual(markers.map((m) => m.mark), ['@@tab@@1@@Check-in@@', '@@tab@@1@@Baggage@@', '@@tabs-end@@']);
  const doc = `<div><p>Intro</p><p>{column-end}</p><p>{spacer-25}</p><h3 id="x">Mobile check-in {heading-small}</h3><p>Text</p></div>\n<div><p><picture><img src="/a.png" alt=""></picture></p>${meta('style', 'full-bleed')}</div>\n<div><h3>Baggage</h3><h2>After</h2></div>`;
  const { doc: out, missing } = withMarkers(doc, markers);
  assert.equal(missing.length, 0);
  assert.equal(out, `<div><p>Intro</p><p>{column-end}</p><p>@@tab@@1@@Check-in@@</p><p>{spacer-25}</p><h3 id="x">Mobile check-in {heading-small}</h3><p>Text</p></div>\n<div><p><picture><img src="/a.png" alt=""></picture></p>${meta('style', 'full-bleed')}</div>\n<div><p>@@tab@@1@@Baggage@@</p><h3>Baggage</h3><p>@@tabs-end@@</p><h2>After</h2></div>`);
});

test('a set over several sections: one section from its first marker to its end, the panels\' own metadata gone, before and after keep theirs', () => {
  const doc = `<div><p>Intro</p><p>@@tab@@1@@A@@</p><h3>A</h3>${meta('style', 'grey')}</div>\n<div><p><picture><img src="/a.png" alt=""></picture></p>${meta('style', 'full-bleed')}</div>\n<div><p>@@tab@@1@@B@@</p><h3>B</h3><p>@@tabs-end@@</p><h2>After</h2>${meta('style', 'light')}</div>`;
  const { doc: joined, dropped } = joinSets(doc);
  assert.deepEqual(dropped, ['style: full-bleed']);
  const out = withAustrianTabs(joined);
  assert.equal(out, [
    `<div><p>Intro</p>${meta('style', 'grey')}</div>`,
    '<div><h3>A</h3><p><picture><img src="/a.png" alt=""></picture></p><div class="section-metadata"><div><div>Tab</div><div>A</div></div><div><div>Tabs</div><div>1</div></div></div></div>',
    '<div><h3>B</h3><div class="section-metadata"><div><div>Tab</div><div>B</div></div><div><div>Tabs</div><div>1</div></div></div></div>',
    `<div><h2>After</h2>${meta('style', 'light')}</div>`,
  ].join('\n'));
  assert.equal(contentOf(out), contentOf(doc.replace(/<p>@@[^<]*<\/p>/g, '')), 'the content as it was');
  assert.deepEqual(joinSets('<div><p>@@tab@@1@@A@@</p><p>a</p><p>@@tabs-end@@</p></div>'), { doc: '<div><p>@@tab@@1@@A@@</p><p>a</p><p>@@tabs-end@@</p></div>', dropped: [] }, 'a set in one section as it was');
});
