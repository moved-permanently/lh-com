/* eslint-disable max-len */
/* Standing order 32, item 2: a section that ends with a link alone in its paragraph before a padded section (the fleet
   pages' "PDF download seat map ..." before "Technical data"): www has the padded section's padding only, ours 45px more
   at 1440. From 768px no section gap there (75 published documents; not before a padded campaign section). Gate
   (injected, recordings): /de/en/320 5.4 -> 4.4 % at 1440, passengers-with-sensory-impairment 3.4 -> 3.3, travelling-
   healthy the same. On phones held: 320 is short above it (the seat-map slideshow, two picture blocks).
   Run: node --test test/fleet-link-padded-so32.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('from 768px: no section gap between a link-ended section and a padded one', () => {
  assert.ok(css.includes('@media (width >= 768px) { body.brand-lufthansa main > .section:not(.grey):has(> .default-content-wrapper:last-child > p.link-wrapper:last-child):has(+ .section.padded:not(.grey, .campaign-section)) { margin-bottom: 0; } }'));
});
