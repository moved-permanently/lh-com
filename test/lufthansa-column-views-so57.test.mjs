/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 57 of 2026-11-18/19 (the switch branch): lufthansa.com's column views as www draws them with the theme on.
   T1: on legal pages (template legal) a chapter heading after a divider or text keeps no heading gap (www's .separator between
       chapters; the live theme's heading gap gave terms-of-use's chapters 32 px each: 12.09 -> 4.83 %).
   T1b: a related-teasers section's heading (section style H2 small) right after its Divider: no gap either
       (digital-self-services' "This might also be of interest to you", +32 px without it).
   Not on other pages: www keeps the gap after a divider there (miles-and-more, europa-tarife-economy-class, flight-
   disruptions: a chapter 32 px short without it).
   R1: a view's opening Spacer (a column view section that holds only it) draws THEMES.lufthansa.columnViews.opening, 60 px
       (www's hub views open 60 below what comes before). With T1b: digital-self-services 1440 4.70 -> 2.74 %, 390 7.07 ->
       6.66 %; either alone moves the page further.
   Run: node --max-old-space-size=256 --test test/lufthansa-column-views-so57.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { themeFor } from '../scripts/style-markers.js';

test('T1: the legal pages\' heading after a divider rule is in styles.css, scoped to the live theme on lufthansa.com legal pages', () => {
  const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8');
  assert.ok(css.includes('body.theme-live.brand-lufthansa.legal.flow-spacing main .default-content-wrapper > :not(h1, h2, h3, h4, h5, h6, p.spacer:not(.divider)) + :is(h2, h3) {\n  margin-top: 0;'));
});

test('T1b: the related-teasers heading after a Divider rule (section style h2-small)', () => {
  const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8');
  assert.ok(css.includes('body.theme-live.brand-lufthansa main > .section.h2-small > .default-content-wrapper > p.spacer.divider + h2 {\n  margin-top: 0;'));
});

test('R1: the view opening Spacer draws 60 px; a Spacer among other content the page M (40)', async () => {
  assert.equal(themeFor('lufthansa').columnViews.opening, 60);
  const { document } = parseHTML('<html><body><main><div><h1>T</h1><p>x</p></div><div class="column-view flush padded"><div class="spacer"><div><div></div></div></div></div><div class="column-view padded"><h2>A</h2><p>a</p><div class="spacer"><div><div></div></div></div><p>b</p></div></main></body></html>');
  globalThis.document = document;
  const { default: decorateTokenFree } = await import('../scripts/token-free.js');
  const main = document.querySelector('main');
  decorateTokenFree(main, { brand: 'lufthansa', path: '/gb/en/digital-self-services', read: () => '' });
  const [opening, inner] = main.querySelectorAll('p.spacer');
  assert.equal(opening.style.getPropertyValue('--spacer-size'), '60px', main.innerHTML);
  assert.equal(inner.style.getPropertyValue('--spacer-size'), '40px');
});

test('R16b (standing order 58): a picture ending the section before a view that opens with its heading keeps 40 px below', () => {
  const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8');
  assert.ok(css.includes('body.theme-live.brand-lufthansa main > .section:not(.grey, .column-view):has(+ .section.column-view:not(.grey) > .default-content-wrapper:first-child > :is(h2, h3):first-child):has(> .default-content-wrapper:last-child > p:last-child > picture, > .default-content-wrapper:last-child > p:last-child > a > picture) {\n  margin-bottom: 40px;'));
});

test('R4 (standing order 58): a view right after a view that is not flush takes the section gap back', () => {
  const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8');
  assert.ok(css.includes('body.theme-live.brand-lufthansa main > .section.column-view:not(.grey, .flush) + .section.column-view:not(.grey) {\n  margin-top: -48px;'));
});
