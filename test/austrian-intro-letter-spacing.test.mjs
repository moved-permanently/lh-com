/* eslint-disable max-len */
/* The brief after 479, item 1: Austrian's intro paragraph (p.copytext-large, "{copytext-large}" in the documents) already renders
   as www's size (Portada 400 18 / 27 px at 1440 and 390: austrian-parity-001's measurements, and ours on 9 live pages since
   663b69a0's theme rule). What was left: www's letter spacing 0.19 px (ours the body's 0.05 px).
   Run: node --max-old-space-size=256 --test test/austrian-intro-letter-spacing.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('the intro: Portada 400 18 / 27 px with www\'s 0.19 px letter spacing', () => {
  assert.match(css, /body\.brand-austrian main p\.copytext-large \{ font-family: var\(--heading-font-family\); font-size: 18px; font-weight: 400; line-height: 27px; letter-spacing: 0\.19px; \}/);
});
