/* eslint-disable max-len, import/extensions */
/* Standing order 28 (2026-11-15), item 2: section-split-apply's title row ({title: true, style, before}): every section
   whose h1 is followed by a picture-only paragraph (or, in DA's copy, a bare picture) is split right before the picture,
   the part from the picture on with `style`; both parts keep the section's other metadata (free2move's market sections:
   the "markets" row in DA's format, data-markets in a published .plain.html).
   Run: node --max-old-space-size=256 --test test/section-split-title-so28.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { applySectionSplit } from '../tools/importer/section-split-apply.mjs';

const ROW = { title: true, style: 'padded', before: '' };
const pic = '<picture><img src="./car.jpg" alt=""></picture>';
const meta = (rows) => `<div class="section-metadata">${rows.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('')}</div>`;

test('DA\'s format: the market sections split before the picture, the markets row on both parts', () => {
  const sec = (m) => `<div><h1>Free2move car sharing</h1><p>${pic}</p><p>Text</p>${meta([['markets', m]])}</div>`;
  const doc = `<body><header></header><main>${sec('de')}${sec('-de')}</main><footer></footer></body>`;
  const r = applySectionSplit(doc, [ROW]);
  assert.deepEqual(r.results.map((x) => x.result), ['placed 2']);
  const part = (m) => `<div><h1>Free2move car sharing</h1>${meta([['markets', m]])}</div>\n<div><p>${pic}</p><p>Text</p>${meta([['markets', m], ['style', 'padded']])}</div>`;
  assert.equal(r.html, `<body><header></header><main>${part('de')}${part('-de')}</main><footer></footer></body>`);
});

test('DA\'s format, a bare picture after the title; a section with styles keeps them on the title part', () => {
  const doc = `<body><main><div><h1>Free2move Carsharing</h1>${pic}<p>Text</p>${meta([['style', 'spaced']])}</div></main></body>`;
  const r = applySectionSplit(doc, [ROW]);
  assert.equal(r.results[0].result, 'placed 1');
  assert.equal(r.html, `<body><main><div><h1>Free2move Carsharing</h1>${meta([['style', 'spaced']])}</div>\n<div>${pic}<p>Text</p>${meta([['style', 'padded']])}</div></main></body>`);
});

test('a published .plain.html: data-markets on both parts', () => {
  const doc = `<div data-markets="de">\n  <h1>Free2move car sharing</h1>\n  <p>${pic}</p>\n  <p>Text</p>\n</div>\n`;
  const r = applySectionSplit(doc, [ROW]);
  assert.equal(r.html, `<div data-markets="de">\n  <h1>Free2move car sharing</h1>\n</div>\n<div class="padded" data-markets="de">\n  <p>${pic}</p>\n  <p>Text</p>\n</div>\n`);
});

test('nothing else: text after the title, no title, a bad style', () => {
  assert.equal(applySectionSplit(`<div><h1>T</h1><p>Text</p><p>${pic}</p></div>`, [ROW]).results[0].result, 'not found');
  assert.equal(applySectionSplit(`<div><h2>T</h2><p>${pic}</p></div>`, [ROW]).results[0].result, 'not found');
  assert.equal(applySectionSplit(`<div><h1>T</h1><p>${pic}</p></div>`, [{ title: true, style: 'pad ded' }]).results[0].result, 'bad row');
});
