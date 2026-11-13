/* eslint-disable max-len */
/* Cargo's transport stories (picture modules, hero-card-overlay (light), between text columns) as www's at 1440 (the
   brief after 531, item 2; the Cargo ranking's rows 7 and 10, cargo-parity-001's en-article-142-arctic-temperatures-on-board):
   www's story text blocks stand 50 px under a picture module's border and 50 px over the next one; ours 20 px (the
   section's wrapper gap). From 1025 px, where the text box sits over the picture as on www (phones as before: there
   ours is already taller than www's).
   Run: node --max-old-space-size=512 --test test/cargo-story-gaps-535.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/cargo.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const STAGE = 'body.brand-cargo main > .section > .hero-card-overlay-wrapper:has(> .hero-card-overlay.light)';

test('from 1025 px: 50 px after a picture module and before one', () => {
  const rule = `@media (width >= 1025px) {\n  ${STAGE} + div,\n  body.brand-cargo main > .section > div:not(.hero-card-overlay-wrapper) + .hero-card-overlay-wrapper:has(> .hero-card-overlay.light) {\n    margin-top: 50px;\n  }\n}`;
  assert.ok(css.includes(rule), rule);
});
