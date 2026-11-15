/* eslint-disable max-len */
/* The parity capture's window (ema-lufthansa, standing order 28 of 2026-11-15, item 2): www's recordings set the viewport
   before each load, 1440 x 900 and 390 x 844 (the drops' manifests); capture.js drew every width in a 900 px tall window,
   so a phone page shorter than that measured 900 against www's 844 (Group for Business's lhg4b-search-prelogin, +6.64 %).
   Now a phone width (below 768 px) gets 844, a wider one 900, and --viewport-height sets it outright.
   Run: node --test test/parity-viewport-height.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { viewportHeight } = require('../tools/parity/lib.js');

const capture = fs.readFileSync(new URL('../tools/parity/capture.js', import.meta.url), 'utf8');

test('the recordings\' windows: 390 x 844, 1440 x 900; below 768 px a phone\'s', () => {
  assert.equal(viewportHeight(390), 844);
  assert.equal(viewportHeight('390'), 844);
  assert.equal(viewportHeight(767), 844);
  assert.equal(viewportHeight(768), 900);
  assert.equal(viewportHeight(1440), 900);
});

test('an explicit height wins', () => {
  assert.equal(viewportHeight(390, '900'), 900);
  assert.equal(viewportHeight(1440, 1000), 1000);
});

test('capture.js takes its window from it, with --viewport-height', () => {
  assert.match(capture, /const VIEWPORT_HEIGHT = viewportHeight\(width, args\['viewport-height'\]\);/);
  assert.match(capture, /'viewport-height': \{ type: 'string' \}/);
  assert.doesNotMatch(capture, /const VIEWPORT_HEIGHT = 900;/);
});
