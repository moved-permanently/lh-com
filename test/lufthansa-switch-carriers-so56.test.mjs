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
  // each width its nearest step (standing order 59): 80 L-, 57 M+
  assert.ok(out.includes('<div class="spacer l-minus from-768"><div><div></div></div></div><div class="spacer m-plus below-768"><div><div></div></div></div>'), out);
  assert.ok(!MARKER.test(out));
});

test('(S) a 21-31 px separator is the Spacer block s (25 px); M from 768 px is M again (the steps replace order 56\'s 60); other brands as before', async () => {
  const small = run('<div><h2>A</h2><p>a</p><p>{spacer-25}</p><p>b</p></div>');
  assert.ok(small.includes('<div class="spacer s"><div><div></div></div></div>'), small);
  assert.ok(!MARKER.test(small));
  assert.ok(!/spacer s/.test(run('<div><h2>A</h2><p>a</p><p>{spacer-25}</p><p>b</p></div>', 'austrian')), 'austrian: none, as before');
  assert.ok(/spacer xs/.test(run('<div><p>a</p><p>{spacer-20}</p><p>b</p></div>')), '9-20 px: XS (standing order 59)');
  assert.ok(!/spacer/.test(run('<div><p>a</p><p>{spacer-6}</p><p>b</p></div>')), '8 px or less: none');
  const { document: d3 } = parseHTML('<html><body><main><div><p>a</p><div class="spacer s"><div><div></div></div></div><div class="spacer from-768"><div><div></div></div></div><div class="spacer"><div><div></div></div></div><p>b</p></div></main></body></html>');
  globalThis.document = d3;
  const { default: decorateTokenFree } = await import('../scripts/token-free.js');
  const m3 = d3.querySelector('main');
  decorateTokenFree(m3, { brand: 'lufthansa', path: '/gb/en/baggage', read: () => '' });
  assert.deepEqual([...m3.querySelectorAll('p.spacer')].map((x) => x.style.getPropertyValue('--spacer-size')), ['25px', '40px', '40px'], m3.innerHTML);
  assert.equal(themeFor('lufthansa', '100-years').space.m, 60, '100-years: www\'s 60');
});

test('(L) an H2 marked heading-large (one step from the default) is the choice H2 large; other brands as before', () => {
  const sec = run('<div><h2>Writing stories {heading-large}</h2><p>x</p></div><div><h2>Plain</h2><p>y</p></div>');
  assert.ok(/h2-large/.test(sec), sec);
  assert.ok(!MARKER.test(sec));
  const block = run('<div><h1>T</h1><div class="columns-media"><div><div>p</div><div><h2>Berlin {heading-large}</h2></div></div></div></div>');
  assert.ok(/class="columns-media title-large"/.test(block), block);
  assert.ok(!/h2-large/.test(run('<div><h2>A {heading-large}</h2><p>x</p></div><div><h2>B</h2></div>', 'austrian')), 'austrian: the default, as before');
});

test('near-value steps (standing orders 59 and 61): each separator the nearest of XS 16, S 25, M 40, M+ 60, M++ 70, L- 80, L 120 (a tie to the larger); drawn at its size', async () => {
  // a tie to the larger step: 50 M+, 65 M++, 75 L-, 100 L
  const cases = [[5, null], [12, 'xs'], [25, 's'], [36, 'm'], [50, 'm-plus'], [55, 'm-plus'], [65, 'm-plus-plus'], [70, 'm-plus-plus'], [75, 'l-minus'], [100, 'l'], [110, 'l']];
  cases.forEach(([n, step]) => {
    const html = run(`<div><p>a</p><p>{spacer-${n}}</p><p>b</p></div>`);
    assert.ok(!MARKER.test(html), html);
    const cls = (html.match(/class="spacer( [a-z-]+)?"/) || [])[1];
    if (step === null) assert.ok(!/spacer/.test(html), `${n}: ${html}`);
    else assert.equal((cls || ' m').trim(), step, `${n}: ${html}`);
  });
  const { document: d4 } = parseHTML('<html><body><main><div><p>a</p><div class="spacer xs"><div><div></div></div></div><div class="spacer m-plus"><div><div></div></div></div><div class="spacer m-plus-plus"><div><div></div></div></div><div class="spacer l-minus from-768"><div><div></div></div></div><p>b</p></div></main></body></html>');
  globalThis.document = d4;
  const { default: decorateTokenFree } = await import('../scripts/token-free.js');
  const m4 = d4.querySelector('main');
  decorateTokenFree(m4, { brand: 'lufthansa', path: '/gb/en/baggage', read: () => '' });
  assert.deepEqual([...m4.querySelectorAll('p.spacer')].map((x) => x.style.getPropertyValue('--spacer-size')), ['16px', '60px', '70px', '80px'], m4.innerHTML);
});
