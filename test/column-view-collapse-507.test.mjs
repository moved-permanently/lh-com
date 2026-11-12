/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* The brief after 506, item 1: lufthansa.com's column view carrier in the collapse (ema-adobe's handover,
   tools/reports/parity-2026-11-08/column-view-handover.md). For brand lufthansa every column group of a section's own
   content becomes a section of its own with the section style column-view (outside a section also padded; flush where
   its section goes on; the separators before it open it), as ema-adobe's hub transformer writes on import; the brand
   sites keep decision 1 (tools/reports/token-free/decisions.md). The DA library offers the style as "Column view".
   Run: node --max-old-space-size=512 --test test/column-view-collapse-507.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';
import { lossProblems } from '../tools/importer/collapse-loss-check.mjs';
import {
  SECTION_STYLES, SECTION_STYLE_LABELS, readSectionStyle, themeFor,
} from '../scripts/style-markers.js';
import { EXTRA_OPTIONS } from '../tools/library/spec.mjs';

const run = (html, brand = 'lufthansa') => collapseHtml(html, {
  path: '/de/en/miles-and-more', brand, parse: parseHTML, force: true,
});
// each section: its text (no whitespace) and its Style value
const sections = (html) => {
  const { document } = parseHTML(`<main>${html}</main>`);
  return [...document.querySelectorAll('main > div')].map((d) => {
    const meta = d.querySelector(':scope > div.section-metadata');
    const style = meta ? [...meta.children].find((r) => /^style$/i.test(r.firstElementChild?.textContent.trim()))?.lastElementChild.textContent.trim() || '' : '';
    if (meta) meta.remove();
    return `${d.textContent.replace(/\s+/g, '')}${style ? ` [${style}]` : ''}`;
  });
};
const checked = (html, brand) => {
  const r = run(html, brand);
  assert.deepEqual(lossProblems(html, r.html), [], 'nothing lost, nothing moved');
  return r;
};

test('a column group inside a section: a section of its own (column-view, flush), the rest before and after as they were', () => {
  const r = checked('<div><p>Intro</p><h2>A {column-start}</h2><p>Text {column-end}</p><p>Outro</p></div>');
  assert.deepEqual(sections(r.html), ['Intro', 'AText [column-view, flush]', 'Outro']);
  assert.equal(r.stats.carrier.column, 2);
});

test('a group outside a section ("-outer"): also padded; over its whole section: no split', () => {
  assert.deepEqual(sections(checked('<div><h2>A {column-start-outer}</h2><p>T {column-end-outer}</p></div>').html), ['AT [column-view, padded]']);
  assert.deepEqual(sections(checked('<div><p>Intro</p><h2>A {column-start-outer}</h2><p>T {column-end-outer}</p></div>').html), ['Intro', 'AT [column-view, padded]']);
});

test('the separators right before a group open its section; two groups and a nested one; the section\'s styles go with each piece', () => {
  const sep = checked('<div><p>Intro</p><p>{divider-25}</p><h2>A {column-start}</h2><p>T {column-end}</p></div>');
  assert.deepEqual(sections(sep.html), ['Intro', 'AT [column-view, divider]']);
  const two = checked('<div><h2>A {column-start}</h2><p>x {column-start}</p><p>y {column-end}</p><p>a {column-end}</p><h2>B {column-start}</h2><p>b {column-end}</p><div class="section-metadata"><div><div>Style</div><div>grey</div></div></div></div>');
  // since standing order 5 (2026-11-12): the nested view and the outer view's parts around it are views of their own
  // (test/nested-column-views-so5.test.mjs)
  assert.deepEqual(sections(two.html), ['A [grey, column-view, flush]', 'xy [grey, column-view, flush]', 'a [grey, column-view, flush]', 'Bb [grey, column-view]']);
  assert.equal(two.stats.carrier.column, 6, 'every mark a view\'s edge');
  assert.equal(two.stats.theme.column || 0, 0);
});

test('a re-imported hub section (column-view already) is left as it is; a group across a section break or in a block keeps no carrier', () => {
  const hub = '<div><h2>A {column-start}</h2><p>T {column-end}</p><div class="section-metadata"><div><div>Style</div><div>campaign-section, column-view</div></div></div></div>';
  assert.deepEqual(sections(checked(hub).html), ['AT [campaign-section, column-view]']);
  assert.deepEqual(sections(checked('<div><p>Intro</p><h2>A {column-start}</h2></div><div><p>T {column-end}</p></div>').html), ['IntroA', 'T']);
  assert.deepEqual(sections(checked('<div><p>Intro</p><div class="columns-media"><div><div><p>a {column-start}</p><p>b {column-end}</p></div></div></div></div>').html), ['Introab']);
});

test('the brand sites keep decision 1: marks go, no section per group', () => {
  const doc = '<div><p>Intro</p><h2>A {column-start}</h2><p>Text {column-end}</p><p>Outro</p></div>';
  ['austrian', 'brussels', 'ita', 'swiss', 'discover', 'b2b', 'tap', 'cargo'].forEach((b) => {
    assert.deepEqual(sections(run(doc, b).html), ['IntroATextOutro'], b);
    assert.equal(themeFor(b).columnViews.carrier, undefined, b);
  });
  assert.equal(themeFor('lufthansa').columnViews.carrier, 'column-view');
});

test('the DA library offers the style as "Column view"; it asks for nothing but its class', () => {
  assert.ok('column-view' in SECTION_STYLES);
  assert.equal(SECTION_STYLE_LABELS['column-view'], 'Column view');
  assert.deepEqual(readSectionStyle('Column view'), readSectionStyle(''));
  assert.match(EXTRA_OPTIONS.find((o) => o.blocks === 'section-metadata').values, /\|Padded=padded\|Column view=column-view$/);
});
