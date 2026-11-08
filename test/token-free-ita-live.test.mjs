/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* ITA's theme switch (THEMES.ita.live), on its own branch token-free-ita-live (the brief after 506, item 2): merged
   after the harness has collapsed ITA's documents in DA (collapse pass, switch merged, publish). With it ITA's theme
   rules apply on the site and ITA's imports collapse; no other brand's do (test/live-brands.mjs: a brand is live where
   its own test is).
   Run: node --max-old-space-size=512 --test test/token-free-ita-live.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { isThemeLive } from '../scripts/style-markers.js';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';
import { BRANDS, LIVE } from './live-brands.mjs';

const OTHERS = BRANDS.filter((b) => !LIVE.has(b));

test('ITA is live, the brands without a switch are not', () => {
  assert.equal(isThemeLive('ita'), true);
  assert.ok(LIVE.has('ita'));
  OTHERS.forEach((b) => assert.equal(isThemeLive(b), false, b));
});

test('ITA\'s imports collapse (no force); another brand\'s keep their markers', () => {
  const doc = '<div><h2 id="a-heading-small">A {heading-small}</h2><p>Text {full-width}</p></div>';
  const own = collapseHtml(doc, { path: '/it/en/x', brand: 'ita', parse: parseHTML });
  assert.ok(own.changed && !/\{/.test(own.html), own.html);
  OTHERS.forEach((b) => assert.equal(collapseHtml(doc, { path: '/x/y/z', brand: b, parse: parseHTML }).html, doc, b));
});

test('the site: an ITA page gets the theme\'s rules and body.theme-live; another brand\'s page doesn\'t', async () => {
  const page = (html) => {
    const { document } = parseHTML(`<html><head></head><body><main>${html}</main></body></html>`);
    globalThis.document = document;
    return document.querySelector('main');
  };
  const { default: decorateTokenFree } = await import('../scripts/token-free.js');
  const html = '<div><h2>T</h2><p>Text</p><ul><li>One</li></ul></div>';
  const main = page(html);
  decorateTokenFree(main, { brand: 'ita', path: '/it/en/x', read: () => '' });
  assert.equal(main.querySelector('p').className, 'full-width');
  assert.equal(main.querySelector('ul').className, 'full-width');
  assert.ok(main.ownerDocument.body.classList.contains('theme-live'));
  if (!LIVE.has('austrian')) {
    const other = page(html);
    decorateTokenFree(other, { brand: 'austrian', path: '/x/en/y', read: () => '' });
    assert.ok(!other.ownerDocument.body.classList.contains('theme-live'), 'austrian');
  }
});
