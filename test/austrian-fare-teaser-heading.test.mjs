/* eslint-disable max-len */
/* Austrian's homepages (the parity sweep of the brief after 471, austrian-parity-001): the fare teaser's title ("Winter deals")
   is www's maui-headline type h3 format heading-xl, Portada 500 36 / 39.6 px at 1440 (28 / 30.8 at 390) with 20 px below
   (maui-mb-5); ours took the theme's default h3 (CoreSans 500 18 px, 30 px below). The theme sets the heading right above
   the fare teaser (the fare-teaser section's default content) as www's.
   Run: node --max-old-space-size=256 --test test/austrian-fare-teaser-heading.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('the theme: the fare teaser\'s heading Portada 500 28 / 30.8, 36 / 39.6 from 1025 px, 20 px below', () => {
  const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
  assert.match(css, /body\.brand-austrian main \.section\.fare-teaser-container > \.default-content-wrapper > :is\(h2, h3\):last-child \{ margin-bottom: 20px; font-family: var\(--heading-font-family\); font-size: 28px; font-weight: 500; line-height: 30\.8px; \}/);
  assert.match(css, /@media \(width >= 1025px\) \{ body\.brand-austrian main \.section\.fare-teaser-container > \.default-content-wrapper > :is\(h2, h3\):last-child \{ font-size: 36px; line-height: 39\.6px; \} \}/);
});
