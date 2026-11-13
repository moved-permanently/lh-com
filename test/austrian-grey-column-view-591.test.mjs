/* eslint-disable max-len */
/* The brief after 591, item 3: a columns-media block in an Austrian grey section keeps www's column view space (32 px
   above and below); the white under a grey band that ends the page is not a rule (bearbeitungsgebuehren worse).
   Run: node --max-old-space-size=256 --test test/austrian-grey-column-view-591.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('a columns-media block in a grey section: 32 px above and below (not padded, not a sidebar)', () => {
  assert.ok(css.includes('body.brand-austrian main > .section.grey:not(.flush) > .columns-media-wrapper > .columns-media:not(.padded, .sidebar) { margin-top: 32px; margin-bottom: 32px; }'));
});

test('no rule for the white under a grey band that ends the page', () => {
  assert.ok(!css.includes('.section.grey:has(+ .section:last-child:empty)'));
});
