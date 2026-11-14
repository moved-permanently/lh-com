/* eslint-disable max-len */
/* Standing order 26 of 2026-11-14 (gating lufthansa.com's offers grid): a section for some markets
   only (section metadata `markets`) sits flush with its neighbours, 24 px from the one above it
   (styles/styles.css, bb6c9560); as the page's first section there is none above it, and the 24 px
   pushed the page down: /de/de/fluege (its first section `markets: de`) had its breadcrumb 24 px
   lower than /gb/en/flights' (168 against 144 at 390 and 1440; www's at the same place on both).
   The first section opens as any first section does (0; body.appear's 25 px for a section without
   a breadcrumb stays, as its rule is more specific). lufthansa.com only (body.brand-lufthansa), where
   it was gated: on the other brands it reached 160 served documents ungated (ema-cashub's standing
   order 33 sweep: Austrian's /at/en/sustainable-flying 24 px further from www at 1440).
   Run: node --test test/market-section-first-so26.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('a market section as the first section: no 24 px over it', () => {
  const rule = 'body.brand-lufthansa main > .section[data-markets]:first-of-type { margin-top: 0; }';
  const flush = 'main > .section[data-markets], main > .section[data-markets] + .section { margin-top: var(--spacing-default); }';
  assert.ok(css.includes(flush), 'the flush rule as before');
  assert.ok(css.includes(rule));
  assert.ok(css.indexOf(rule) > css.indexOf(flush), 'after the flush rule');
  assert.ok(css.indexOf(rule) < css.indexOf('body.appear main > .section:first-of-type:not(.breadcrumb-container) { margin-top: 25px; }'));
});

test('the other brands: their market sections as before order 26 (no first-section rule)', () => {
  assert.ok(!/(^|\} )main > \.section\[data-markets\]:first-of-type/.test(css));
});
