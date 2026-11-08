/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Austrian's theme switch (THEMES.austrian.live), on its own branch token-free-austrian-live (the brief after 506, item 2): merged
   after the harness has collapsed Austrian's documents in DA (collapse pass, switch merged, publish). With it Austrian's theme
   rules apply on the site and Austrian's imports collapse; no other brand's do (test/live-brands.mjs: a brand is live where
   its own test is).
   Run: node --max-old-space-size=512 --test test/token-free-austrian-live.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { isThemeLive } from '../scripts/style-markers.js';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';
import { BRANDS, LIVE } from './live-brands.mjs';

const OTHERS = BRANDS.filter((b) => !LIVE.has(b));

test('Austrian is live, the brands without a switch are not', () => {
  assert.equal(isThemeLive('austrian'), true);
  assert.ok(LIVE.has('austrian'));
  OTHERS.forEach((b) => assert.equal(isThemeLive(b), false, b));
});

test('Austrian\'s imports collapse (no force); another brand\'s keep their markers', () => {
  const doc = '<div><h2 id="a-heading-small">A {heading-small}</h2><p>Text {full-width}</p></div>';
  const own = collapseHtml(doc, { path: '/at/en/x', brand: 'austrian', parse: parseHTML });
  assert.ok(own.changed && !/\{/.test(own.html), own.html);
  OTHERS.forEach((b) => assert.equal(collapseHtml(doc, { path: '/x/y/z', brand: b, parse: parseHTML }).html, doc, b));
});

test('the site: an Austrian page gets the theme\'s rules and body.theme-live; another brand\'s page doesn\'t', async () => {
  const page = (html) => {
    const { document } = parseHTML(`<html><head></head><body><main>${html}</main></body></html>`);
    globalThis.document = document;
    return document.querySelector('main');
  };
  const { default: decorateTokenFree } = await import('../scripts/token-free.js');
  const html = '<div><h1>T</h1><p>Intro</p><h3>H</h3><p>More</p></div>';
  const main = page(html);
  decorateTokenFree(main, { brand: 'austrian', path: '/at/en/x', read: (k) => (k === 'theme' ? 'flow-spacing' : '') });
  assert.equal(main.querySelector('p').className, 'copytext-large', 'the intro after the title');
  assert.equal(main.querySelector('h3').className, 'heading-small');
  assert.ok(main.ownerDocument.body.classList.contains('theme-live'));
  if (!LIVE.has('brussels')) {
    const other = page(html);
    decorateTokenFree(other, { brand: 'brussels', path: '/x/en/y', read: (k) => (k === 'theme' ? 'flow-spacing' : '') });
    assert.ok(!other.ownerDocument.body.classList.contains('theme-live'), 'brussels');
  }
});
