/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* TAP's theme switch (THEMES.tap.live), on its own branch token-free-tap-live (the brief after 506, item 2): merged
   after the harness has collapsed TAP's documents in DA (collapse pass, switch merged, publish). With it TAP's theme
   rules apply on the site and TAP's imports collapse; no other brand's do (test/live-brands.mjs: a brand is live where
   its own test is).
   Run: node --max-old-space-size=512 --test test/token-free-tap-live.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { isThemeLive } from '../scripts/style-markers.js';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';
import { BRANDS, LIVE } from './live-brands.mjs';

const OTHERS = BRANDS.filter((b) => !LIVE.has(b));

test('TAP is live, the brands without a switch are not', () => {
  assert.equal(isThemeLive('tap'), true);
  assert.ok(LIVE.has('tap'));
  OTHERS.forEach((b) => assert.equal(isThemeLive(b), false, b));
});

test('TAP\'s imports collapse (no force); another brand\'s keep their markers', () => {
  const doc = '<div><h2 id="a-heading-small">A {heading-small}</h2><p>Text {full-width}</p></div>';
  const own = collapseHtml(doc, { path: '/pt/en/x', brand: 'tap', parse: parseHTML });
  assert.ok(own.changed && !/\{/.test(own.html), own.html);
  OTHERS.forEach((b) => assert.equal(collapseHtml(doc, { path: '/x/y/z', brand: b, parse: parseHTML }).html, doc, b));
});

test('the site: a TAP page gets the theme\'s rules and body.theme-live; another brand\'s page doesn\'t', async () => {
  const page = (html) => {
    const { document } = parseHTML(`<html><head></head><body><main>${html}</main></body></html>`);
    globalThis.document = document;
    return document.querySelector('main');
  };
  const { default: decorateTokenFree } = await import('../scripts/token-free.js');
  const html = '<div><h1>T</h1><p>Text</p><h2>H</h2><p>More</p></div>';
  const main = page(html);
  decorateTokenFree(main, { brand: 'tap', path: '/pt/en/x', read: () => '' });
  assert.equal(main.querySelector('h2').className, 'heading-medium', 'the base theme');
  assert.ok(main.ownerDocument.body.classList.contains('theme-live'));
  if (!LIVE.has('austrian')) {
    const other = page(html);
    decorateTokenFree(other, { brand: 'austrian', path: '/x/en/y', read: () => '' });
    assert.ok(!other.ownerDocument.body.classList.contains('theme-live'), 'austrian');
  }
});
