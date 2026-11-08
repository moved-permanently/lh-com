/* eslint-disable max-len */
/* Discover, the paragraphs that carry only a style marker on phones (the brief after 505, item 5;
   Discover row 38): row 36's 36 px between text paragraphs also falls on the empty marker
   paragraphs scripts.js leaves in place (p.column-mark: a column view's start or end; p.spacer: a
   {spacer-N}), so each adds 36 px. Measured by the footer's top (the content above it) against
   discover-parity-001, all 26 pages: below 768 px leaving them out brings 10 of 14 changed views
   closer to www (check-in +6.3 -> +2.4 %, Santorini +6.2 -> +3.5 %), from 768 px it takes 10 of 14
   further away (check-in +1.9 -> -2.5 %), so below 768 px only. Discover's theme only.
   Run: node --max-old-space-size=512 --test test/discover-marker-paragraphs-506.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/discover.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const RULE = 'body.brand-discover main :is(.default-content-wrapper, .columns-media-text, .accordion-columns-panel) > :is(p.column-mark, p.spacer):not(:last-child) { margin-bottom: 0; }';

test('row 38: below 768 px the marker paragraphs without row 36\'s 36 px', () => {
  const phone = css.split('@media (width < 768px)').slice(1).map((part) => part.slice(0, part.indexOf('} }') + 3)).join(' ');
  assert.ok(phone.includes(RULE), 'in a block below 768 px');
});

test('row 38: from 768 px row 36\'s rule as it is (the marker paragraphs keep their 36 px there)', () => {
  assert.ok(css.includes('body.brand-discover main :is(.default-content-wrapper, .columns-media-text, .accordion-columns-panel) > :is(p, ul, ol):not(:last-child) { margin-bottom: 36px; }'));
  assert.equal(css.split(RULE).length, 2, 'the rule once');
});
