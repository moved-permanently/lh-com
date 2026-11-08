/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* The brief after 503, item 1: ITA's theme switch (THEMES.ita.live), on its own branch, merged in the same release as the
   harness's ITA collapse pass. With it: ITA's theme rules apply on the site (running text over the whole width, body.theme-live,
   the heading gap) and ITA's imports collapse; no other brand's do.
   Run: node --max-old-space-size=512 --test test/token-free-ita-live.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { isThemeLive, themeFor } from '../scripts/style-markers.js';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';

const OTHERS = ['lufthansa', 'austrian', 'brussels', 'swiss', 'tap', 'discover', 'b2b', 'cargo', 'airdolomiti'];

test('ITA is live, no other brand is', () => {
  assert.equal(isThemeLive('ita'), true);
  ['service', 'flow', 'home', 'article'].forEach((t) => assert.equal(themeFor('ita', t).live, true, t));
  OTHERS.forEach((b) => assert.equal(isThemeLive(b), false, b));
});

test('ITA\'s imports collapse (no force); another brand\'s keep their markers', () => {
  const doc = '<div><h2 id="a-heading-small">A {heading-small}</h2><p>Text {full-width}</p></div>';
  const ita = collapseHtml(doc, { path: '/it/en/x', brand: 'ita', parse: parseHTML });
  assert.equal(ita.html, '<div><h2 id="a">A</h2><p>Text</p></div>');
  OTHERS.forEach((b) => assert.equal(collapseHtml(doc, { path: '/x/y/z', brand: b, parse: parseHTML }).html, doc, b));
});

test('the site: an ITA page gets the theme\'s rules (wide running text, body.theme-live, the heading gap); an Austrian page doesn\'t', async () => {
  const page = () => {
    const { document } = parseHTML('<html><head></head><body><main><div><h2>T</h2><p>Text</p><ul><li>One</li></ul></div></main></body></html>');
    globalThis.document = document;
    return document;
  };
  const { default: decorateTokenFree } = await import('../scripts/token-free.js');
  const ita = page();
  decorateTokenFree(ita.querySelector('main'), { brand: 'ita', path: '/it/en/x' });
  assert.equal(ita.querySelector('p').className, 'full-width');
  assert.equal(ita.querySelector('ul').className, 'full-width');
  assert.ok(ita.body.classList.contains('theme-live'));
  assert.equal(ita.body.style.getPropertyValue('--theme-heading-gap'), '32px');
  const austrian = page();
  decorateTokenFree(austrian.querySelector('main'), { brand: 'austrian', path: '/at/en/x' });
  assert.equal(austrian.querySelector('p').className, '');
  assert.ok(!austrian.body.classList.contains('theme-live'));
});
