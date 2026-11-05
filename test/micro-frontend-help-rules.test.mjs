/* The help app's topic rules within the page (blocks/micro-frontend, every brand with
   help-center-web; SWISS ch/de and ch/en contact at 390 were 13 px wider than the screen). The app
   draws each topic's top and bottom rule --full-width-horizontal-offset beyond its column on both
   sides, to reach the screen's edges: the design system sets that offset to www's page margin on
   the body's maui-theme-* (1rem, 2.2rem from 376 px, 2.4rem from 768 px, 0 from 1024 px). Our
   column's margin is --layout-margin (22 px at 390, not 35.2), so the rules ran 13 px past the
   screen. Below 1024 px the block gives the app our margin as the offset; from 1024 px www's 0
   stays.
   Run: node --max-old-space-size=512 --test test/micro-frontend-help-rules.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('blocks/micro-frontend/micro-frontend.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('below 1024 px the app\'s full-width offset is the column\'s margin', () => {
  assert.ok(css.includes('@media (width < 1024px) { .micro-frontend help-center-web { --full-width-horizontal-offset: var(--layout-margin); } }'));
});

test('from 1024 px not overridden (www\'s 0)', () => {
  const outside = css.replace(/@media \(width < 1024px\) \{[^@]*?\} \}/g, '');
  assert.ok(!outside.includes('--full-width-horizontal-offset'));
});
