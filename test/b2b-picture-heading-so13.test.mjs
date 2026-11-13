/* eslint-disable max-len */
/* Standing order 13 of 2026-11-13, item 3 (Group for Business): on the news hubs (de/de, de/en, xx/de, xx/en) www's
   H2 under the intro picture starts 61 px under it (de/en 1440: the picture's end 780, the H2 841), ours 40 (the
   picture paragraph's margin; the H2's 32 collapses into it), so everything under it sat 20 to 23 px high at 1440 and
   390. On phones, in a section's own content an H2 right after a picture paragraph keeps 61 px above it (above
   styles.css's live-theme heading gap, body.theme-live.flow-spacing ... :not(...) + :is(h2, h3), which wins at less):
   the four hubs at 390 -4.3 to -4.8, none worse. Not from 768 px: there the hubs' tab set and cards below are 21 px
   taller than www's and make up for it (with the rule de/de, de/en 1440 +10).
   Run: node --test test/b2b-picture-heading-so13.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/b2b.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('B2B on phones: an H2 right after a picture paragraph in default content 61 px under it', () => {
  assert.ok(css.includes('@media (width < 768px) { body.brand-b2b.theme-live.flow-spacing main .default-content-wrapper > p:has(> picture):not(.spacer, .divider) + h2 { margin-top: 61px; } }'));
});
