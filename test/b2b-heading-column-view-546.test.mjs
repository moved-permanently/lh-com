/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* The brief after 546, item 2 (Group for Business against b2b-parity-001): route-network's "Enjoy the benefits of our
   global route network" heading stands right before its Columns Media. www's column view starts at the heading: the
   text sits 92 px above it and the cards 27 px under it. Ours had the theme's column view start between heading and
   block: 129 and 75 px. In B2B's documents 81 of the 105 headings right before a Columns Media / Carousel Images / Quote
   (grey bands aside) carried www's column-start mark. So on B2B the block's column view starts above such a heading
   (THEMES.b2b columnViews.startAtHeading); not in grey bands, where www has no column marks at all.
   Measured on b2b.turnsthe.page against b2b-parity-001/-002 (the 26 recorded pages, 52 page-widths): mean 19.3 -> 18.7 %;
   route-network 1440 25.4 -> 21.5 % and 20.5 -> 16.1 %, lufthansa-group-airlines 32.0 -> 27.9 % and 31.0 -> 26.1 %,
   travel-id-now-required 14.9 -> 12.0 %; contact 1440 14.9 -> 16.3 % and 13.6 -> 17.0 % (its unmarked heading after a
   divider, one of the 24).
   The brief after 550: contact's 1440 figures were captures without the hotline finder's photo (same layout, same
   height). Narrower: the 105 headings were only those standing right before the block; 41 more stood before a
   {column-start-outer} paragraph of their own, www's view starting below them, and the collapse drops that
   paragraph. What still shows in the published page: the heading stays outside the view before a one-cell, stage
   or sidebar Columns Media (19 + 4 headings), after a divider (8) and before H4 card headings (10); none of these
   stands with the 81.
   Run: node --max-old-space-size=512 --test test/b2b-heading-column-view-546.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { themeFor } from '../scripts/style-markers.js';

const page = (mainHtml) => {
  const { document } = parseHTML(`<html><head></head><body><main>${mainHtml}</main></body></html>`);
  globalThis.document = document;
  return document.querySelector('main');
};
const { default: decorateTokenFree } = await import('../scripts/token-free.js');
const flowRead = (k) => (k === 'theme' ? 'flow-spacing' : '');
const CM = '<div class="columns-media"><div><div>x</div><div>y</div></div></div>';
const seq = (main) => [...main.querySelector(':scope > div').children].map((el) => {
  if (el.classList.contains('column-mark')) return el.classList.contains('column-start-outer') ? 'start' : 'end';
  if (el.classList.contains('divider')) return 'divider';
  return el.tagName === 'DIV' ? el.className.split(' ')[0] : el.tagName.toLowerCase();
}).join(' ');

test('B2B: the block\'s column view starts above the heading right before it', () => {
  assert.equal(themeFor('b2b', 'flow').columnViews.startAtHeading, true);
  const main = page(`<div><p>Text</p><h2>Enjoy the benefits</h2>${CM}<p>More</p></div>`);
  decorateTokenFree(main, { brand: 'b2b', path: '/de/en/travel-management/route-network', read: flowRead });
  assert.equal(seq(main), 'p start h2 columns-media end p');
});

test('a block after text keeps its own start; a heading that opens the section gets none above it', () => {
  const after = page(`<div><p>Text</p>${CM}</div>`);
  decorateTokenFree(after, { brand: 'b2b', path: '/de/en/x', read: flowRead });
  assert.equal(seq(after), 'p start columns-media end');
  const first = page(`<div><h2>Title</h2>${CM}</div>`);
  decorateTokenFree(first, { brand: 'b2b', path: '/de/en/x', read: flowRead });
  assert.equal(seq(first), 'h2 columns-media end', 'the section\'s own padding above, as a block at a section\'s start');
});

test('the brief after 550: only a Columns Media of two or more cells side by side, not a one-cell, stage or sidebar one', () => {
  // www: one-cell Columns Media 0 of 19 headings marked, stage and sidebar ones 0 of 4; two to four cells 81 of 82
  const one = page('<div><p>Text</p><h3>Transfer via Frankfurt Airport</h3><div class="columns-media"><div><div>x</div></div></div><p>More</p></div>');
  decorateTokenFree(one, { brand: 'b2b', path: '/de/en/x', read: flowRead });
  assert.equal(seq(one), 'p h3 start columns-media end p', 'one cell: as before');
  const sidebar = page('<div><p>Text</p><h2>More choice</h2><div class="columns-media sidebar"><div><div>x</div><div>y</div></div></div><p>More</p></div>');
  decorateTokenFree(sidebar, { brand: 'b2b', path: '/de/en/x', read: flowRead });
  assert.equal(seq(sidebar), 'p h2 start columns-media end p', 'sidebar: as before');
});

test('the brief after 550: not after a divider, not when the cells have H4 headings (www\'s view starts below the heading)', () => {
  // the documents' {column-start-outer} paragraph between heading and block, which the collapse drops: www's view
  // starts below the heading for 41 headings; a divider before it (8) or H4 card headings (10) never stand with the
  // 81 headings whose view starts at them
  const divider = page(`<div><p>Text</p><div class="divider"><div><div></div></div></div><h2>Lost baggage</h2>${CM}<p>More</p></div>`);
  decorateTokenFree(divider, { brand: 'b2b', path: '/de/en/x', read: flowRead });
  assert.equal(seq(divider), 'p divider h2 start columns-media end p', 'after a divider');
  const h4 = page('<div><p>Text</p><h3>The benefits</h3><div class="columns-media"><div><div><h4>One</h4></div><div><h4>Two</h4></div></div></div><p>More</p></div>');
  decorateTokenFree(h4, { brand: 'b2b', path: '/de/en/x', read: flowRead });
  assert.equal(seq(h4), 'p h3 start columns-media end p', 'H4 card headings');
  const h3 = page('<div><p>Text</p><h2>The airlines</h2><div class="columns-media"><div><div><h3>One</h3></div><div><h3>Two</h3></div></div></div><p>More</p></div>');
  decorateTokenFree(h3, { brand: 'b2b', path: '/de/en/x', read: flowRead });
  assert.equal(seq(h3), 'p start h2 columns-media end p', 'H3 card headings: at the heading');
});

test('a grey band keeps the start between heading and block', () => {
  const band = page(`<div><p>Text</p><h2>Contact</h2>${CM}<p>More</p><div class="section-metadata"><div><div>style</div><div>grey</div></div></div></div>`);
  decorateTokenFree(band, { brand: 'b2b', path: '/de/en/about-us/contact', read: flowRead });
  assert.equal(seq(band), 'p h2 start columns-media end p section-metadata');
});

test('Discover keeps its column views as they were', () => {
  assert.ok(!themeFor('discover', 'flow').columnViews.startAtHeading);
});
