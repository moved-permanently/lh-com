/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 35 (2026-11-15), item 2: the mirror of "from-768" (test/spacer-from-768-508), a separator shown on phones
   only ("{spacer-28 below-768}"): the paragraph gets p.spacer.below-768, which styles.css hides from 768px; the Spacer /
   Divider purpose block takes the option below-768, and the collapse writes it where a run of separators is all
   below-768 (mixed with others the qualifier goes, counted). Written for /at/en/travel-id at 390, where www has 28 px more
   above and below its closed tab list than ours and none of it at 1440.
   Run: node --max-old-space-size=512 --test test/spacer-below-768-so35.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { readPurposeBlock, SEPARATOR, stripStyleMarkers } from '../scripts/style-markers.js';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';
import { lossProblems } from '../tools/importer/collapse-loss-check.mjs';
import { EXTRA_ENTRIES, OPTION_NOTES } from '../tools/library/spec.mjs';

const read = (f) => fs.readFileSync(new URL(f, import.meta.url), 'utf8');
const run = (html, brand = 'ita') => collapseHtml(html, {
  path: '/it/en/x', brand, parse: parseHTML, force: true,
});
const { default: decorateTokenFree } = await import('../scripts/token-free.js');
const page = (html) => {
  const { document } = parseHTML(`<html><head></head><body><main>${html}</main></body></html>`);
  globalThis.document = document;
  return document.querySelector('main');
};
const css = (f) => read(f).replace(/\s+/g, ' ');

test('the marker: below-768 is a separator option, as from-768; nothing else is', () => {
  assert.deepEqual([...'{spacer-28 below-768}'.match(SEPARATOR)].slice(1), ['spacer', '28', ' below-768']);
  assert.deepEqual([...'{divider-25 below-768}'.match(SEPARATOR)].slice(1), ['divider', '25', ' below-768']);
  assert.equal(SEPARATOR.test('{spacer-28 from-768}'), true);
  assert.equal(SEPARATOR.test('{spacer-28}'), true);
  ['{spacer-28 below-1024}', '{spacer-28 below-768 from-768}', '{spacer-28 below768}', '{below-768}'].forEach((t) => assert.equal(SEPARATOR.test(t), false, t));
  assert.equal(stripStyleMarkers('{spacer-28 below-768}'), '');
});

test('the reader: Spacer and Divider take the option below-768', () => {
  assert.deepEqual(readPurposeBlock('spacer', ['below-768']), { kind: 'spacer', px: 60, fromTablet: false, belowTablet: true });
  assert.deepEqual(readPurposeBlock('spacer', ['l', 'below-768']), { kind: 'spacer', px: 120, fromTablet: false, belowTablet: true });
  assert.deepEqual(readPurposeBlock('divider', ['below-768']), { kind: 'divider', px: 25, fromTablet: false, belowTablet: true });
  assert.equal(readPurposeBlock('spacer', ['from-768']).belowTablet, false);
});

test('the site: the marker paragraph and the block draw p.spacer.below-768, hidden from 768px', () => {
  const main = page('<div><p>A</p><div class="spacer below-768"><div><div></div></div></div><p>B</p><div class="divider below-768"><div><div></div></div></div><p>C</p></div>');
  decorateTokenFree(main, { brand: 'austrian', path: '/at/en/x' });
  const [phone, rule] = main.querySelectorAll('p.spacer');
  assert.equal(phone.className, 'spacer below-768');
  assert.equal(phone.style.getPropertyValue('--spacer-size'), '60px');
  assert.equal(rule.className, 'spacer divider below-768');
  // scripts.js decorateTextStyles: the class is the marker's own option
  assert.match(read('../scripts/scripts.js'), /\$\{sep\[3\] \? ` \$\{sep\[3\]\.trim\(\)\}` : ''\}/);
  assert.match(css('../styles/styles.css'), /@media \(width >= 768px\) \{ main \.default-content-wrapper > p\.spacer\.below-768 \{ display: none; \}/);
  assert.match(css('../styles/styles.css'), /@media \(width < 768px\) \{ main \.default-content-wrapper > p\.spacer\.from-768 \{ display: none; \}/);
  assert.match(css('../blocks/profile-tabs/profile-tabs.css'), /@media \(width >= 768px\) \{ \.profile-tabs \.profile-tabs-panel > p\.spacer\.below-768 \{ display: none; \}/);
});

test('the collapse: a run of below-768 separators becomes the block with the option, as from-768', () => {
  const cases = [
    ['<div><p>{spacer-60 below-768}</p><h2>A</h2><p>a</p></div>', '<div class="spacer below-768">', 'at a section\'s start'],
    ['<div><p>a</p><p>{spacer-100 below-768}</p></div>', '<div class="spacer l below-768">', 'at its end, L'],
    ['<div><p>a</p><p>{spacer-40 below-768}</p><div class="cards"><div><div>x</div></div></div></div>', '<div class="spacer below-768">', 'before a block'],
    ['<div><p>a</p><p>{divider-25 below-768}</p><p>b</p></div>', '<div class="divider below-768">', 'a divider'],
    ['<div><p>a</p><p>{spacer-30 below-768}</p><p>{spacer-30 below-768}</p><p>b</p></div>', '<div class="spacer below-768">', 'a run of two, 60px'],
  ];
  cases.forEach(([doc, want, what]) => {
    const r = run(doc);
    assert.ok(r.html.includes(want), `${what}: ${r.html}`);
    assert.ok(!/from-768|space-m|space-below|divider-above|space-l/.test(r.html), `${what}: no section style, block option or from-768`);
    assert.equal(r.stats.carrier['separator-below-768'], doc.match(/below-768/g).length, what);
    assert.equal(r.stats.carrier['separator-from-768'], undefined, what);
    assert.deepEqual(lossProblems(doc, r.html), [], what);
    assert.equal(run(r.html).html, r.html, `${what}: idempotent`);
  });
  // 31px and less: none (the collapse table), as for from-768
  assert.equal(run('<div><p>a</p><p>{spacer-28 below-768}</p><p>b</p></div>').html, '<div><p>a</p><p>b</p></div>');
  // mixed with an ordinary separator the qualifier goes (counted); mixed with from-768 both go
  const mixed = run('<div><p>a</p><p>{spacer-30 below-768}</p><p>{spacer-30}</p><p>b</p></div>');
  assert.ok(mixed.html.includes('<div class="spacer">'), mixed.html);
  assert.equal(mixed.stats.theme['separator-below-768'], 1);
  const both = run('<div><p>a</p><p>{spacer-30 below-768}</p><p>{spacer-30 from-768}</p><p>b</p></div>');
  assert.ok(both.html.includes('<div class="spacer">'), both.html);
  assert.equal(both.stats.theme['separator-below-768'], 1);
  assert.equal(both.stats.theme['separator-from-768'], 1);
  // on a theme that keeps small text spacers (Brussels) a phone-only one is not kept as an all-widths {spacer-N}
  const small = run('<div><p>a</p><p>{spacer-28 below-768}</p><p>b</p></div>', 'brussels');
  assert.ok(!small.html.includes('{spacer-28}'), small.html);
});

test('the from-768 runs are unchanged', () => {
  const r = run('<div><p>a</p><p>{spacer-40 from-768}</p><div class="cards"><div><div>x</div></div></div></div>');
  assert.ok(r.html.includes('<div class="spacer from-768">'), r.html);
  assert.equal(r.stats.carrier['separator-from-768'], 1);
  assert.equal(r.stats.carrier['separator-below-768'], undefined);
});

test('the DA library offers the option', () => {
  assert.ok(EXTRA_ENTRIES.some((e) => e.block === 'spacer' && e.opts.includes('below-768')));
  assert.match(OPTION_NOTES['below-768'], /768/);
});
