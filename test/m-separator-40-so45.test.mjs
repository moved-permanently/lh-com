/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling */
/* Standing order 45 of 2026-11-18 item 1 (M at 40): decision 3 (an M separator 60 px) lifted per brand. Measured on every
   recorded page-width with M at 60 and at 40 on the same load, adopted where the sum of % off www goes down and the
   median does not go up: Brussels (393.96 -> 383.60, median 1.180 -> 0.990) and Discover (358.64 -> 358.04, median
   0.813 -> 0.813); ITA held (95.02 -> 96.62, median 0.958 -> 0.980). The documents keep space-m at 60 (token-free:
   the size is the theme's, nothing is written into a document), so:
   - brussels.css and discover.css draw a 60 px separator 40 px high (its 1 px included, as styles.css does);
   - ita.css and the shared stylesheet do not; the separator writer still writes 60.
   Run: node --test test/m-separator-40-so45.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { SPACE } from '../scripts/style-markers.js';

const css = (f) => fs.readFileSync(new URL(`../styles/${f}`, import.meta.url), 'utf8');
const rule = (brand) => new RegExp(`body\\.brand-${brand} main \\.default-content-wrapper > p\\.spacer\\[style\\*="--spacer-size: 60px"\\]:not\\(\\.divider\\) \\{\\s*height: 41px;\\s*\\}`);

test('Brussels and Discover draw M at 40', () => {
  assert.match(css('themes/brussels.css'), rule('brussels'));
  assert.match(css('themes/discover.css'), rule('discover'));
});

test('ITA and the shared stylesheet keep M at 60', () => {
  assert.doesNotMatch(css('themes/ita.css'), /--spacer-size: 60px"\]/);
  assert.doesNotMatch(css('styles.css'), /--spacer-size: 60px"\]/);
  assert.equal(SPACE.m, 60);
});
