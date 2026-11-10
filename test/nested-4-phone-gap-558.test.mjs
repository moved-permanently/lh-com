/* eslint-disable max-len */
/* lufthansa.com's columns-media option nested-4 on phones (brief 558, rule 6, /<root>/shopping's "Your benefits at a
   glance", the only nested-4 documents): www's four-column item holds a nested four-column view whose first item is
   the icon and the other three are empty; below 768 px they stack, and their margins stay: the text 202 px of ink
   under the icon at 390 (lh-parity-002a), ours 159 with 62 px. Below 768 px 105 px under such an icon; nested-2
   (passengers-with-sensory-impairment, digital-travel-companion: one empty item) and 768 px up as before.
   Run: node --max-old-space-size=256 --test test/nested-4-phone-gap-558.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/columns-media/columns-media.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('below 768 px, nested-4: 105 px under the icon', () => {
  assert.ok(css.includes('@media (width < 768px) { body.brand-lufthansa .columns-media.nested-4 .columns-media-text > p:has(> picture, > a > picture):first-child { margin-bottom: 105px; } }'));
});
