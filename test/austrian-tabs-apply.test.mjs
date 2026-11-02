/* eslint-disable max-len */
/* tools/importer/austrian-tabs-apply.mjs: Austrian's tab sets into the documents as they are: the
   markers where a marked copy has them, a section per panel and per later section of a panel (its
   image section, a grey box: a part, with its own style; scripts/section-tabs.js), the content
   before and after the set in its sections.
   Run: node --max-old-space-size=512 --test test/austrian-tabs-apply.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';

const {
  markersOf, withMarkers, splitWithParts, contentOf,
} = await import('../tools/importer/austrian-tabs-apply.mjs');

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

test('a set over several sections: a section per panel and per part; a section\'s own style with its parts outside the set, else with its panel parts', () => {
  const doc = `<div><p>Intro</p><p>@@tab@@1@@A@@</p><h3>A</h3>${meta('style', 'grey')}</div>\n<div><p><picture><img src="/a.png" alt=""></picture></p>${meta('style', 'full-bleed')}</div>\n<div><p>@@tab@@1@@B@@</p><h3>B</h3>${meta('style', 'grey')}</div>\n<div><p>@@tab@@1@@C@@</p><h3>C</h3><p>@@tabs-end@@</p><h2>After</h2>${meta('style', 'light')}</div>`;
  const rows = (...r) => `<div class="section-metadata">${r.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('')}</div>`;
  const { doc: out, parts } = splitWithParts(doc);
  assert.equal(out, [
    `<div><p>Intro</p>${rows(['style', 'grey'])}</div>`,
    `<div><h3>A</h3>${rows(['Tab', 'A'], ['Tabs', '1'])}</div>`,
    `<div><p><picture><img src="/a.png" alt=""></picture></p>${rows(['style', 'full-bleed'], ['Tab', 'A'], ['Tabs', '1'])}</div>`,
    `<div><h3>B</h3>${rows(['style', 'grey'], ['Tab', 'B'], ['Tabs', '1'])}</div>`,
    `<div><h3>C</h3>${rows(['Tab', 'C'], ['Tabs', '1'])}</div>`,
    `<div><h2>After</h2>${rows(['style', 'light'])}</div>`,
  ].join('\n'));
  assert.equal(parts, 1, 'one part (A\'s image)');
  assert.equal(contentOf(out), contentOf(doc.replace(/<p>@@[^<]*<\/p>/g, '')), 'the content as it was');
  assert.deepEqual(splitWithParts('<div><p>x</p></div>'), { doc: '<div><p>x</p></div>', parts: 0 }, 'a document without markers as it was');
});
