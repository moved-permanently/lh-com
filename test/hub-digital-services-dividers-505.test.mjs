/* eslint-disable max-len */
/* Brief 505 item 1, /de/en/digital-self-services: the dividers between the partner groups are www's .hr.limited-width
   (two thirds of the content from 1025 px, like the running text); ours ran over the whole width. A divider right after
   a group of partner rows (its column end) gets the running text's 66 % from 1025 px.
   Run: node --test test/hub-digital-services-dividers-505.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('styles/styles.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('from 1025 px: a divider after a group of partner rows, 66 % wide', () => {
  assert.ok(css.includes('@media (width >= 1025px) { body.brand-lufthansa main .cards-icon-text-wrapper:has(> .cards-icon-text.partner) + .default-content-wrapper > p.spacer.divider:is(:first-child, .column-mark + *) { max-width: 66%; } }'));
});
