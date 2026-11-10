/* eslint-disable max-len */
/* Brief 506 item 1: the section style column-view (Section Metadata Style "Column view"; hub-column-views writes it
   for each column view, test/hub-column-view-sections-506.test.mjs) carries what the marks did once the collapse has
   removed them. www: .section-content .column > .column-view:only-child { padding: 3.2rem 0 }, its last component
   without margin: 32 px above and below, 64 px between two views, 32 px under the last one; the views' headline
   components .limited-width (66 % from 1025 px). A view directly in the container (the collapse adds padded to it):
   .column-view { padding: 2rem 0 1rem } (4rem 0 2rem from 768 px) plus its items' margin, the section padding. No
   section gap under a view, marks or not (the split pieces of one AEM section had none); the section before a view
   keeps its text's 24 px (www's .mb-default; the split took it). lufthansa.com only; not on grey bands (their own
   column-view rule: the band's padding plus 32 px); the paddings not while a mark is still in the section (a marker
   on an element wins until the collapse has run).
   Run: node --test test/column-view-section-506.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('styles/styles.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const MARKS = ':has(.column-start, .column-end, .column-start-outer, .column-end-outer)';
const CV = `body.brand-lufthansa main > .section.column-view:not(.grey, ${MARKS})`;

// flush: hub-column-views' view that more of its AEM section follows; the last one keeps its section's own edge (the AEM
// section gap, campaign-section's none or 24 px)
test('no section gap under a flush column view, marks or not', () => {
  assert.ok(css.includes('body.brand-lufthansa main > .section.column-view.flush:not(.grey) { margin-bottom: 0; }'));
});

test('a column-view section without marks: 32 px above and below (the section padding when padded), its last element without margin', () => {
  assert.ok(css.includes(`${CV} { padding: 32px 0; }`));
  assert.ok(css.includes(`body.brand-lufthansa main > .section.column-view.padded:not(.grey, ${MARKS}) { padding: var(--section-padding) 0; }`));
  // brief 582: the sliders keep their own bottom margins (test/column-view-slider-margin-582.test.mjs)
  assert.ok(css.includes(`${CV} > div:last-child > :last-child:not(.cards-teaser.phone-slider, .columns-media.cell-slider) { margin-bottom: 0; }`));
});

// not a view before a view: 32 + 32 px between two. With or without marks in the view (a :has() in this :has() would
// drop the rule): the split took the text's own 24 px either way (separators between views open the next view's
// section: no section of separators before a view)
test('the section before a column view: www\'s .mb-default 24 px (text -> view 24 + 32 px as the marks gave it)', () => {
  assert.ok(css.includes('body.brand-lufthansa main > .section:not(.grey, .column-view):has(+ .section.column-view:not(.grey)) { margin-bottom: var(--spacing-default); }'));
});

test('the views\' headings two thirds wide from 1025 px (www\'s limited-width headline components), not an outer view\'s', () => {
  assert.ok(css.includes(`@media (width >= 1025px) { body.brand-lufthansa main > .section.column-view:not(.grey, .padded, ${MARKS}) > .default-content-wrapper > :is(h2, h3, h4) { max-width: 66%; } }`));
});

test('an outer view (column-view, padded) with its marks still in it: the marks\' padding, not the section\'s', () => {
  assert.ok(css.includes(`body.brand-lufthansa main > .section.column-view.padded:not(.grey)${MARKS} { padding-top: 0; padding-bottom: 0; }`));
});

test('grey bands keep their own column-view rule', () => {
  assert.ok(css.includes('main > .section.grey.column-view { padding: calc(var(--section-padding) + 32px) 0; }'));
});
