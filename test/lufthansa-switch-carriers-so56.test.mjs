/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 56 of 2026-11-18 (the switch branch, Ben: carriers first, then the switch): the carriers the collapse
   writes for lufthansa.com instead of markers it used to drop:
   (a) {limited-width} headings: a section whose own H2-H6 are mostly marked takes the section style limited-headings,
       its headings (not the H1) two thirds wide (.limited-width) on the page;
   (b) H2s marked heading-small: the choice "small" (block option title-small, section style h2-small), heading-small;
   (e) a from-768 / below-768 separator pair: two Spacer blocks, one per width, each its own size;
   M at 40 px (THEMES.lufthansa.space; decision 3 lifted).
   Run: node --max-old-space-size=256 --test test/lufthansa-switch-carriers-so56.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';
import { themeFor, headingChoice } from '../scripts/style-markers.js';

const run = (html, brand = 'lufthansa') => collapseHtml(html, {
  path: '/gb/en/miles-and-more', brand, parse: parseHTML, force: true,
}).html;
const MARKER = /\{[a-z][^}]*\}/;

test('(a) limited-width headings: the section style limited-headings, no marker; a minority goes; other brands as before', () => {
  const out = run('<div><h1>T</h1><h2>Programme {limited-width}</h2><p>x</p><h2>Points {limited-width}</h2><p>y</p></div><div><h2>Other</h2><p>z</p></div>');
  assert.ok(!MARKER.test(out), out);
  assert.ok(/<div><div>Style<\/div><div>limited-headings<\/div><\/div>/.test(out), out);
  assert.equal((out.match(/limited-headings/g) || []).length, 1, 'only the marked section');
  assert.ok(!/limited-headings/.test(run('<div><h2>A {limited-width}</h2><h2>B</h2><h2>C</h2></div>')), 'a minority goes');
  assert.ok(!/limited-headings/.test(run('<div><h2>A {limited-width}</h2><p>x</p></div>', 'austrian')), 'austrian as before');
});

test('(b) H2 heading-small: title-small in a block, h2-small in a section; heading-small on the page; H2 compact unchanged', () => {
  const cards = run('<div><h1>T</h1><div class="cards-teaser"><div><div>p</div><div><h2>Berlin Airport {heading-small}</h2></div></div><div><div>p</div><div><h2>Vienna Airport {heading-small}</h2></div></div></div></div>');
  assert.ok(/class="cards-teaser title-small"/.test(cards), cards);
  const sec = run('<div><h2>This might also be of interest to you {heading-small}</h2><p>x</p></div>');
  assert.ok(/h2-small/.test(sec), sec);
  const t = themeFor('lufthansa');
  assert.equal(headingChoice(t, 2, 'small'), 'heading-small');
  assert.equal(headingChoice(t, 2, 'compact'), 'heading-copytext-large');
  assert.equal(headingChoice(t, 2, 'large'), 'heading-large');
});

test('the page: limited-headings and title-small draw their classes; M is 40 px', async () => {
  const { document } = parseHTML('<html><body><main><div class="limited-headings"><h1>T</h1><h2>Programme</h2><p>x</p></div><div class="space-m"><div class="cards-teaser title-small"><div><div>p</div><div><h2>Berlin</h2></div></div></div></div></main></body></html>');
  globalThis.document = document;
  const { default: decorateTokenFree } = await import('../scripts/token-free.js');
  const main = document.querySelector('main');
  decorateTokenFree(main, { brand: 'lufthansa', path: '/gb/en/miles-and-more', read: () => '' });
  assert.ok(main.querySelector('h2').classList.contains('limited-width'), main.innerHTML);
  assert.ok(!main.querySelector('h1').classList.contains('limited-width'));
  assert.ok(main.querySelector('.cards-teaser h2').classList.contains('heading-small'), main.innerHTML);
  const sep = main.querySelector(':scope > div.space-m > p.spacer');
  assert.ok(sep, main.innerHTML);
  assert.equal(sep.style.getPropertyValue('--spacer-size'), '40px');
  assert.equal(themeFor('lufthansa').space.m, 40);
  const { document: d2 } = parseHTML('<html><body><main><div><p>a</p><div class="spacer"><div><div></div></div></div><div class="spacer l"><div><div></div></div></div><p>b</p></div></main></body></html>');
  globalThis.document = d2;
  const m2 = d2.querySelector('main');
  decorateTokenFree(m2, { brand: 'lufthansa', path: '/gb/en/baggage', read: () => '' });
  const sizes = [...m2.querySelectorAll('p.spacer')].map((x) => x.style.getPropertyValue('--spacer-size'));
  assert.deepEqual(sizes, ['40px', '120px'], m2.innerHTML);
  assert.equal(Boolean(themeFor('swiss').space), false, 'other brands keep 60');
});

test('(e) a width pair: one Spacer block per width', () => {
  const out = run('<div><p>a</p><p>{spacer-80 from-768}</p><p>{spacer-57 below-768}</p><p>b</p></div>');
  assert.ok(out.includes('<div class="spacer from-768"><div><div></div></div></div><div class="spacer below-768"><div><div></div></div></div>'), out);
  assert.ok(!MARKER.test(out));
});

test('(B, S) M at 60 from 768 px; a 21-31 px separator is the Spacer block s (25 px); other brands as before', async () => {
  const small = run('<div><h2>A</h2><p>a</p><p>{spacer-25}</p><p>b</p></div>');
  assert.ok(small.includes('<div class="spacer s"><div><div></div></div></div>'), small);
  assert.ok(!MARKER.test(small));
  assert.ok(!/spacer s/.test(run('<div><h2>A</h2><p>a</p><p>{spacer-25}</p><p>b</p></div>', 'austrian')), 'austrian: none, as before');
  assert.ok(!/spacer s/.test(run('<div><p>a</p><p>{spacer-20}</p><p>b</p></div>')), '20 px or less: none');
  const { document: d3 } = parseHTML('<html><body><main><div><p>a</p><div class="spacer s"><div><div></div></div></div><div class="spacer from-768"><div><div></div></div></div><div class="spacer"><div><div></div></div></div><p>b</p></div></main></body></html>');
  globalThis.document = d3;
  const { default: decorateTokenFree } = await import('../scripts/token-free.js');
  const m3 = d3.querySelector('main');
  decorateTokenFree(m3, { brand: 'lufthansa', path: '/gb/en/baggage', read: () => '' });
  assert.deepEqual([...m3.querySelectorAll('p.spacer')].map((x) => x.style.getPropertyValue('--spacer-size')), ['25px', '60px', '40px'], m3.innerHTML);
  assert.equal(themeFor('lufthansa', '100-years').space.m, 60, '100-years: www\'s 60');
});
