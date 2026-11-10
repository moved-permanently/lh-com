/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* The standing order of 2026-11-10 evening, decision 3 (the B2B ranking worst-first): route-network's sidebar (text beside its
   links, right after the H1) is www's sidebar component, no column view: none of the census' 15 sidebar Columns Media has a
   column mark. The theme drew column edges around it (20 / 40 px above and below), and the column view after it started 24 px
   lower. THEMES.b2b flow columnViews.sidebarNoView: no edges for a sidebar; styles/themes/b2b.css: the view after it starts at
   its foot. Measured on our host's code locally against b2b-parity-001: route-network de/de 1440 15.2 -> 9.8 %, 390 32.4 ->
   30.2; de/en 19.8 -> 15.2, 29.3 -> 27.0.
   Run: node --max-old-space-size=256 --test test/b2b-sidebar-no-view-583.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { themeFor } from '../scripts/style-markers.js';

const page = (mainHtml) => {
  const { document } = parseHTML(`<html><head></head><body><main>${mainHtml}</main></body></html>`);
  globalThis.document = document;
  return document.querySelector('main');
};
const { default: decorateTokenFree } = await import('../scripts/token-free.js');
const flowRead = (k) => (k === 'theme' ? 'flow-spacing' : '');
const SIDEBAR = '<div class="columns-media sidebar"><div><div><p>Text</p></div><div><p>Links</p></div></div></div>';
const CM = '<div class="columns-media"><div><div><h3>One</h3></div><div><h3>Two</h3></div></div></div>';
const seq = (main) => [...main.querySelector(':scope > div').children].map((el) => {
  if (el.classList.contains('column-mark')) return el.classList.contains('column-start-outer') ? 'start' : 'end';
  return el.tagName === 'DIV' ? el.className : el.tagName.toLowerCase();
}).join(' ');

test('B2B: a sidebar has no column edges; the view after it starts at its heading as before', () => {
  assert.equal(themeFor('b2b', 'flow').columnViews.sidebarNoView, true);
  const main = page(`<div><h1>Der ganzen Welt begegnen</h1>${SIDEBAR}<h2>Profitieren Sie</h2>${CM}<p>More</p></div>`);
  decorateTokenFree(main, { brand: 'b2b', path: '/de/de/travel-management/route-network', read: flowRead });
  assert.equal(seq(main), 'h1 columns-media sidebar start h2 columns-media end p');
});

test('Discover keeps its sidebars\' edges; B2B\'s other Columns Media as before', () => {
  assert.ok(!themeFor('discover', 'flow').columnViews.sidebarNoView);
  const main = page(`<div><p>Text</p>${CM}<p>More</p></div>`);
  decorateTokenFree(main, { brand: 'b2b', path: '/de/en/x', read: flowRead });
  assert.equal(seq(main), 'p start columns-media end p');
});

test('the theme CSS: no wrapper gap between a sidebar and the column view after it', () => {
  const css = fs.readFileSync('styles/themes/b2b.css', 'utf8');
  assert.match(css, /body\.brand-b2b main > \.section > div:has\(> \.columns-media\.sidebar\) \+ \.default-content-wrapper:has\(> p\.column-mark\.column-start-outer:first-child\) \{\s*margin-top: 0;/);
});
