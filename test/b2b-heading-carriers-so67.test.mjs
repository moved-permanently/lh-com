/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 67 (2026-11-17), item 2: Group for Business keeps no {heading-copytext-large} marker. THEMES.b2b had
   keepSizes ['heading-copytext-large'] (order 9); now an H3 in that size is the choice compact (headingChoices.h3.compact,
   nearChoices: one step under the flow pages' heading-small), which the collapse writes as a carrier: in a block the
   option title-compact, in a section the style H3 compact (new in SECTION_STYLES; a brand without the choice draws
   nothing from it). The page reads both as the class heading-copytext-large, the markup the marker gave. The seven
   documents that carried the marker get the carriers by rows (delta-so67-b2b-heading-carriers: text-inserts-apply).
   Run: node --max-old-space-size=256 --test test/b2b-heading-carriers-so67.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';
import {
  themeFor, headingChoice, readSectionStyle, SECTION_STYLES, SECTION_STYLE_LABELS,
} from '../scripts/style-markers.js';
import { applyTextInserts, removeTextInserts, listPaths } from '../tools/importer/text-inserts-apply.mjs';

const read = (f) => fs.readFileSync(new URL(f, import.meta.url), 'utf8');
const FLOW = '/de/en/travel-solutions/lufthansa-group-wifi';
const collapse = (html, brand = 'b2b') => collapseHtml(html, {
  path: FLOW, brand, parse: parseHTML, force: true,
}).html;

const { default: decorateTokenFree } = await import('../scripts/token-free.js');
const decorate = (mainHtml, opts) => {
  const { document } = parseHTML(`<html><head></head><body><main>${mainHtml}</main></body></html>`);
  globalThis.document = document;
  const main = document.querySelector('main');
  decorateTokenFree(main, opts);
  return main;
};

test('the B2B theme: H3 compact is heading-copytext-large, no kept sizes; other brands have no H3 compact', () => {
  const flow = themeFor('b2b', 'flow');
  assert.equal(themeFor('b2b').keepSizes, undefined);
  assert.equal(headingChoice(flow, 3, 'compact'), 'heading-copytext-large');
  assert.equal(headingChoice(flow, 3, 'large'), 'heading-medium');
  assert.equal(headingChoice(themeFor('b2b'), 1, 'compact'), 'heading-small');
  ['lufthansa', 'swiss', 'austrian', 'discover'].forEach((b) => assert.equal(headingChoice(themeFor(b, 'flow'), 3, 'compact'), null, b));
  assert.deepEqual(readSectionStyle(['h3-compact']).headings, { h3: 'compact' });
  assert.ok(SECTION_STYLES['h3-compact'] && SECTION_STYLE_LABELS['h3-compact'] === 'H3 compact');
});

test('the collapse: H3s in a block give it title-compact; a section\'s own H3s H3 compact; no marker left; idempotent', () => {
  const block = collapse('<div><h1>Wi-Fi</h1><div class="columns-media"><div><div><h3>Headphones {heading-copytext-large}</h3><p>x</p></div><div><h3>No calls {heading-copytext-large}</h3><p>y</p></div></div></div></div>');
  assert.ok(/<div class="columns-media[^"]* title-compact">/.test(block), block);
  assert.ok(block.includes('<h3>Headphones</h3>') && block.includes('<h3>No calls</h3>'), block);
  assert.equal(collapse(block), block, 'second run');
  const own = collapse('<div><h1>T</h1><p>x</p></div><div><h3>One {heading-copytext-large}</h3><p>a</p><h3>Two {heading-copytext-large}</h3><p>b</p></div>');
  assert.ok(own.includes('<h3>One</h3>') && !/\{heading-/.test(own), own);
  assert.ok(/<div>Style<\/div><div>h3-compact<\/div>/.test(own), own);
});

test('the page: title-compact and H3 compact draw the class the marker gave; on Lufthansa nothing', () => {
  const opts = { brand: 'b2b', path: FLOW, read: (k) => (k === 'theme' ? 'flow-spacing' : '') };
  const main = decorate('<div><div class="columns-media title-compact"><div><div><h2 class="heading-medium">Unlock</h2><h3>Headphones</h3></div></div></div></div><div class="h3-compact"><h3>One</h3><p>a</p></div>', opts);
  const [h2, h3] = main.querySelectorAll('.columns-media h2, .columns-media h3');
  assert.equal(h3.className, 'heading-copytext-large');
  assert.equal(h2.className, 'heading-medium', 'a heading with a size keeps it');
  assert.equal(main.querySelector('.h3-compact h3').className, 'heading-copytext-large');
  const lh = decorate('<div class="h3-compact"><h3>One</h3><p>a</p></div>', { brand: 'lufthansa', path: '/de/en/x' });
  assert.equal(/heading-copytext-large/.test(lh.querySelector('h3').className), false);
});

test('the delta list: READY rows only where gated, token-free, byte for byte back on a document of their shape', () => {
  const list = read('../tools/reports/parity-2026-11-09/delta-so67-b2b-heading-carriers.txt');
  const data = JSON.parse(read('../tools/reports/parity-2026-11-09/delta-so67-b2b-heading-carriers.json'));
  const ready = listPaths(list);
  assert.deepEqual([...new Set(ready)].sort(), ['/de/de/travel-management/route-network', '/de/en/program/businesstogo', '/de/en/travel-management/route-network', '/de/en/travel-solutions/lufthansa-group-wifi', '/xx/en/program/businesstogo']);
  data.forEach(({ path, inserts }) => {
    inserts.forEach((ins) => {
      const from = ins.replace !== undefined ? ins.replace : '';
      // no row puts a style marker in: every {...} in its text is in what it replaces
      const added = (ins.text.match(/\{[a-z0-9 -]+\}/g) || []).filter((t) => !from.includes(t));
      assert.deepEqual(added, [], path);
      assert.ok(!/\{heading-copytext-large\}/.test(ins.text), `${path}: the marker goes`);
    });
  });
  // a document shaped as route-network's section (DA's format)
  const doc = '<body><header></header><main><div><h1>Meet</h1><h2 id="enjoy">Enjoy {heading-copytext-large}</h2><div class="columns-media"><div><div>x</div></div></div><div class="spacer"><div><div></div></div></div><h2 id="all">All destinations</h2><p>Text</p><div class="section-metadata"><div><div>Style</div><div>wide-text</div></div></div></div></main><footer></footer></body>';
  const rows = [
    { replace: '<h2 id="enjoy">Enjoy {heading-copytext-large}</h2>', text: '<h2 id="enjoy">Enjoy</h2>' },
    { replace: '<div class="spacer"><div><div></div></div></div><h2 id="all">All destinations</h2>', text: '<div class="section-metadata"><div><div>Style</div><div>wide-text, h2-compact</div></div></div></div><div><h2 id="all">All destinations</h2>' },
  ];
  const { html, results, inserts } = applyTextInserts(doc, rows);
  assert.deepEqual(results, ['inserted', 'inserted']);
  assert.equal(removeTextInserts(html, inserts), doc);
  assert.ok(html.includes('<div>wide-text, h2-compact</div></div></div></div><div><h2 id="all">'), html);
  assert.deepEqual(applyTextInserts(html, rows).results, ['present', 'present']);
});
