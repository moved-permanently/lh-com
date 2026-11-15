/* eslint-disable max-len */
/* Standing order 27 of 2026-11-15, item 3 (finish-discover.txt, santorini's "small steps"): on phones www's Discover
   pages put a grey band 36 px under the section before it and the next section 32 px under the band (santorini at
   390, discover-parity-001: the text 48 px over the band, the next title 44 px under it; ours 68 and 69 with the
   sections' 56 px). Below 768 px: a section right before a grey band 36 px over it, a grey band 32 px over the next
   section; the eyebrow gap over the H1 stays an owner decision. The recorded pages with grey bands: santorini and
   punta-cana, de/de and de/en.
   Run: node --test test/discover-grey-band-spacing-so27.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/discover.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('Discover phones: 36 px over a grey band, 32 px under it', () => {
  assert.ok(css.includes('@media (width < 768px) { body.brand-discover main > .section:not(.grey):has(+ .section.grey) { margin-bottom: 36px; } body.brand-discover main > .section.grey:has(+ .section) { margin-bottom: 32px; } }'));
});
