/* eslint-disable max-len, import/extensions */
/* Standing order 18 (2026-11-13), item 1: tools/importer/section-end-spacer-apply.mjs, www's separator before the grey
   band for the documents imported without it (the importer keeps it since test/band-separator-so18): the section
   before the band's ends with <p>{spacer-40}</p>, before its section-metadata block in DA's format; everything else
   byte for byte; a heading not found, found twice, opening the first section, or a separator there already: no change.
   Run: node --max-old-space-size=256 --test test/section-end-spacer-so18.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { applySectionEndSpacer } from '../tools/importer/section-end-spacer-apply.mjs';

const ROW = [{ heading: 'Catering on board', n: 40 }];
const kids = '<div><div class="columns-media"><div><div><h2>Kids Box on European flights</h2></div></div></div>';
const band = '<div><div class="columns-media"><div><div><h2>Catering on board: tailored completely to your wishes</h2></div></div></div><div class="section-metadata"><div><div>style</div><div>flush, column-band, grey</div></div></div></div>';

test('DA\'s format: the spacer ends the Kids Box section; the rest byte for byte', () => {
  const doc = `<body><header></header><main>${kids}</div>${band}</main><footer></footer></body>`;
  const r = applySectionEndSpacer(doc, ROW);
  assert.equal(r.results[0].result, 'placed');
  assert.equal(r.html, `<body><header></header><main>${kids}<p>{spacer-40}</p></div>${band}</main><footer></footer></body>`);
});

test('before the section\'s own section-metadata; a pretty-printed .plain.html keeps its indentation', () => {
  const styled = `${kids}<div class="section-metadata"><div><div>style</div><div>padded</div></div></div></div>`;
  const r = applySectionEndSpacer(`<main>${styled}${band}</main>`, ROW);
  assert.equal(r.html, `<main>${kids}<p>{spacer-40}</p><div class="section-metadata"><div><div>style</div><div>padded</div></div></div></div>${band}</main>`);
  const pretty = '<div>\n  <div class="columns-media">\n    <h2>Kids Box</h2>\n  </div>\n</div>\n<div class="flush column-band grey">\n  <h2>Catering on board: x</h2>\n</div>\n';
  assert.equal(applySectionEndSpacer(pretty, ROW).html, '<div>\n  <div class="columns-media">\n    <h2>Kids Box</h2>\n  </div><p>{spacer-40}</p>\n</div>\n<div class="flush column-band grey">\n  <h2>Catering on board: x</h2>\n</div>\n');
});

test('not found, found twice, the first section or there already: nothing changes', () => {
  const doc = `<main>${kids}</div>${band}</main>`;
  assert.equal(applySectionEndSpacer(doc, [{ heading: 'Nothing', n: 40 }]).results[0].result, 'not found');
  const twice = `<main>${kids}</div>${band}${band}</main>`;
  assert.equal(applySectionEndSpacer(twice, ROW).html, twice);
  assert.equal(applySectionEndSpacer(`<main>${band}</main>`, ROW).results[0].result, 'first section');
  const once = applySectionEndSpacer(doc, ROW).html;
  const again = applySectionEndSpacer(once, ROW);
  assert.equal(again.results[0].result, 'there already');
  assert.equal(again.html, once);
});
