/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 68 (2026-11-18), items 2 and 4 (token-free).
   - Item 4: the block option h3-compact (one heading level's choice in a block, as the section style of that name): its
     H3s take the theme's compact choice, its other headings stay as the theme draws them. Group for Business's
     businesstogo de/de and xx/de: their Columns Media H2 has no size in the document (www: heading-medium, the H2
     default), so title-compact made it heading-copytext-large too (order 67's HOLD, -70 px at 390). With h3-compact the
     H2 keeps the default; the rows (delta-so68-b2b-businesstogo-h3-compact) are READY.
   - Item 2: SWISS draws text after a picture-and-text row's button, at the end of its text, as small print (www's
     richtext after a maui-link button: copytext-small), in place of the markers the cleanup took out.
   Run: node --max-old-space-size=256 --test test/b2b-h3-compact-so68.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import {
  readBlockOptions, BLOCK_OPTIONS, BLOCK_OPTION_LABELS,
} from '../scripts/style-markers.js';
import { applyTextInserts, removeTextInserts, listPaths } from '../tools/importer/text-inserts-apply.mjs';

const read = (f) => fs.readFileSync(new URL(f, import.meta.url), 'utf8');
const { default: decorateTokenFree } = await import('../scripts/token-free.js');
const classesOf = (mainHtml, opts) => {
  const { document } = parseHTML(`<html><head></head><body><main>${mainHtml}</main></body></html>`);
  globalThis.document = document;
  const main = document.querySelector('main');
  decorateTokenFree(main, opts);
  // strings only (no DOM node goes into an assertion)
  return [...main.querySelectorAll('h2, h3')].map((h) => `${h.tagName} ${h.className}`.trim());
};
const B2B = { brand: 'b2b', path: '/de/de/program/businesstogo', read: (k) => (k === 'theme' ? 'flow-spacing' : '') };
const BLOCK = (opt) => `<div><div class="columns-media divider-above nested equal-cells ${opt}"><div><div><h2>Optimieren Sie Ihre Geschäftsreisen</h2><h3>Mehr Effizienz:</h3><p>x</p></div><div><h3>Maximale Kostenersparnis:</h3><p>y</p></div></div></div></div>`;

test('the block option h3-compact: its H3s only; no headings entry without it', () => {
  assert.deepEqual(readBlockOptions(['columns-media', 'h3-compact']).headings, { h3: 'compact' });
  assert.equal(readBlockOptions(['columns-media', 'h3-compact']).title, null);
  assert.equal('headings' in readBlockOptions(['columns-media', 'title-compact']), false);
  assert.ok(BLOCK_OPTIONS['h3-compact'] && BLOCK_OPTION_LABELS['h3-compact']);
});

test('on the page: h3-compact leaves the block H2 to the theme, title-compact shrinks it too; other brands draw nothing', () => {
  assert.deepEqual(classesOf(BLOCK('h3-compact'), B2B), ['H2', 'H3 heading-copytext-large', 'H3 heading-copytext-large']);
  assert.deepEqual(classesOf(BLOCK('title-compact'), B2B), ['H2 heading-copytext-large', 'H3 heading-copytext-large', 'H3 heading-copytext-large']);
  assert.deepEqual(classesOf(BLOCK('h3-compact'), { brand: 'swiss', path: '/ch/en/x' }), ['H2', 'H3', 'H3']);
});

test('the delta list: businesstogo de/de and xx/de READY with h3-compact, token-free, byte for byte back', () => {
  const list = read('../tools/reports/parity-2026-11-09/delta-so68-b2b-businesstogo-h3-compact.txt');
  const data = JSON.parse(read('../tools/reports/parity-2026-11-09/delta-so68-b2b-businesstogo-h3-compact.json'));
  assert.deepEqual([...new Set(listPaths(list))].sort(), ['/de/de/program/businesstogo', '/xx/de/program/businesstogo']);
  assert.deepEqual(data.map((d) => d.path).sort(), ['/de/de/program/businesstogo', '/xx/de/program/businesstogo']);
  data.forEach(({ path, inserts }) => {
    assert.ok(inserts[0].text.includes('nested equal-cells h3-compact"') && !inserts.some((i) => /title-compact/.test(i.text.replace(i.replace || '', ''))), path);
    inserts.forEach((ins) => {
      const from = ins.replace !== undefined ? ins.replace : '';
      assert.deepEqual((ins.text.match(/\{[a-z0-9 -]+\}/g) || []).filter((t) => !from.includes(t)), [], `${path}: no marker put in`);
      assert.ok(!/\{heading-copytext-large\}/.test(ins.text), `${path}: the marker goes`);
    });
  });
  // the block row on a document of its shape (DA's format)
  const doc = '<body><header></header><main><div><div class="columns-media divider-above nested equal-cells"><div><div><h2 id="o">Optimieren</h2><h3 id="m">Mehr: {heading-copytext-large}</h3></div></div></div></div></main><footer></footer></body>';
  const rows = [{ replace: '<div class="columns-media divider-above nested equal-cells"><div><div><h2 id="o">Optimieren</h2><h3 id="m">Mehr: {heading-copytext-large}', text: '<div class="columns-media divider-above nested equal-cells h3-compact"><div><div><h2 id="o">Optimieren</h2><h3 id="m">Mehr:' }];
  const { html, results, inserts } = applyTextInserts(doc, rows);
  assert.deepEqual(results, ['inserted']);
  assert.equal(removeTextInserts(html, inserts), doc);
  assert.deepEqual(applyTextInserts(html, rows).results, ['present']);
});

test('SWISS: text after a picture-and-text row\'s button at the end of its text is small print, at every width', () => {
  const css = read('../styles/themes/swiss.css');
  const sel = 'body.brand-swiss main .columns-media:not(.sidebar) .columns-media-text > p.button-wrapper ~ p:not(.button-wrapper, .link-wrapper, :has(a, picture, img), :has(~ :not(p)), :has(~ p.button-wrapper))';
  const at = css.indexOf(`${sel} {`);
  assert.ok(at >= 0, 'the rule');
  assert.match(css.slice(at, css.indexOf('}', at)), /font-size: var\(--body-font-size-xs\);/);
  const before = css.slice(0, at);
  assert.ok(before.lastIndexOf('@media') < before.lastIndexOf('}\n}\n'), 'not inside a media block');
});
