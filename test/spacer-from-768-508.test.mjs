/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* The brief after 512, item 1 (decision 3 revised): a separator shown from 768px only ("{spacer-60 from-768}") keeps that
   on its carrier, the Spacer (or Divider) purpose block's option from-768, drawn as the marker's paragraph (styles.css
   hides p.spacer.from-768 below 768px). The collapse writes it where a run of separators is all from-768; mixed with
   others the qualifier goes, as before.
   Run: node --max-old-space-size=512 --test test/spacer-from-768-508.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { readPurposeBlock } from '../scripts/style-markers.js';
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

test('the reader: Spacer and Divider take the option from-768', () => {
  assert.deepEqual(readPurposeBlock('spacer', ['from-768']), { kind: 'spacer', px: 60, fromTablet: true });
  assert.deepEqual(readPurposeBlock('spacer', ['l', 'from-768']), { kind: 'spacer', px: 120, fromTablet: true });
  assert.deepEqual(readPurposeBlock('divider', ['from-768']), { kind: 'divider', px: 25, fromTablet: true });
  assert.equal(readPurposeBlock('spacer', []).fromTablet, false);
});

test('the site: the block draws the marker\'s paragraph, hidden below 768px', () => {
  const main = page('<div><p>A</p><div class="spacer from-768"><div><div></div></div></div><p>B</p><div class="spacer l"><div><div></div></div></div><p>C</p></div>');
  decorateTokenFree(main, { brand: 'ita', path: '/it/en/x' });
  const [tablet, always] = main.querySelectorAll('p.spacer');
  assert.equal(tablet.className, 'spacer from-768');
  assert.equal(tablet.style.getPropertyValue('--spacer-size'), '60px');
  assert.equal(always.className, 'spacer');
  assert.match(read('../styles/styles.css').replace(/\s+/g, ' '), /@media \(width < 768px\) \{ main \.default-content-wrapper > p\.spacer\.from-768 \{ display: none; \}/);
});

test('the collapse: a run of from-768 separators becomes the block with the option, wherever it stands', () => {
  const cases = [
    ['<div><p>{spacer-60 from-768}</p><h2>A</h2><p>a</p></div>', '<div class="spacer from-768">', 'at a section\'s start'],
    ['<div><p>a</p><p>{spacer-100 from-768}</p></div>', '<div class="spacer l from-768">', 'at its end, L'],
    ['<div><p>a</p><p>{spacer-40 from-768}</p><div class="cards"><div><div>x</div></div></div></div>', '<div class="spacer from-768">', 'before a block'],
    ['<div><p>a</p><p>{divider-25 from-768}</p><p>b</p></div>', '<div class="divider from-768">', 'a divider'],
    ['<div><p>a</p><p>{spacer-30 from-768}</p><p>{spacer-30 from-768}</p><p>b</p></div>', '<div class="spacer from-768">', 'a run of two, 60px'],
  ];
  cases.forEach(([doc, want, what]) => {
    const r = run(doc);
    assert.ok(r.html.includes(want), `${what}: ${r.html}`);
    assert.ok(!/space-m|space-below|divider-above|space-l/.test(r.html), `${what}: no section style or block option`);
    assert.equal(r.stats.carrier['separator-from-768'], doc.match(/from-768/g).length, what);
    assert.deepEqual(lossProblems(doc, r.html), [], what);
    assert.equal(run(r.html).html, r.html, `${what}: idempotent`);
  });
  // 31px and less: none (the collapse table), from 768px or not
  assert.equal(run('<div><p>a</p><p>{spacer-30 from-768}</p><p>b</p></div>').html, '<div><p>a</p><p>b</p></div>');
  // with an ordinary separator in the run the qualifier goes (counted)
  const mixed = run('<div><p>a</p><p>{spacer-30 from-768}</p><p>{spacer-30}</p><p>b</p></div>');
  assert.ok(mixed.html.includes('<div class="spacer">'), mixed.html);
  assert.equal(mixed.stats.theme['separator-from-768'], 1);
});

test('the DA library offers the option', () => {
  assert.ok(EXTRA_ENTRIES.some((e) => e.block === 'spacer' && e.opts.includes('from-768')));
  assert.match(OPTION_NOTES['from-768'], /768/);
});
