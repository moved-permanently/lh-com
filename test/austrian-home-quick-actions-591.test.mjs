/* eslint-disable max-len */
/* The brief after 591, item 1: the Austrian homepage's quick-actions space. www puts an (empty for a visitor)
   quick-actions section between the stage and the fare teaser on all 64 roots: 43 px more under the stage at 1440.
   The theme gives the stage section of a page that opens with the flight search that space from 1025 px.
   Run: node --max-old-space-size=256 --test test/austrian-home-quick-actions-591.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('from 1025 px the stage section after the flight search keeps 43 px more under it', () => {
  assert.ok(css.includes('@media (width >= 1025px) { body.brand-austrian main:has(> .section.flight-search-container:first-child) > .section.hero-card-overlay-container { margin-bottom: calc(var(--section-gap) + 43px); } }'));
});

test('not below 1025 px (our stage card takes that space already)', () => {
  const rules = css.split('body.brand-austrian main:has(> .section.flight-search-container:first-child) > .section.hero-card-overlay-container').length - 1;
  assert.equal(rules, 1);
});
