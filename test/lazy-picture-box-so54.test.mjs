/* eslint-disable max-len */
/* Standing order 54 of 2026-11-17 (ema-adobe, item 1; ema-test's note-so53-ita-app-height.txt): `main img { width: auto;
   height: auto }` left an unloaded lazy picture in default content 0 x 0 although its width and height attributes give its
   shape, so pages read thousands of px shorter or longer by load timing (ITA ita-airways-app 1440: 4,390 or 8,472). A
   default-content picture now keeps at least its width attribute's width (typed attr(), capped by its container), its
   height from the attributes' ratio; a minimum, so a loaded file larger than its attributes keeps its size; at main img's specificity, so blocks and other rules still win.
   Run: node --max-old-space-size=256 --test test/lazy-picture-box-so54.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('a default-content picture with width and height attributes keeps its box before it loads', () => {
  assert.ok(css.includes('main :where(.default-content-wrapper) img:where([width][height]) { min-width: min(100%, attr(width px, 0px)); }'));
});

test('no width from the attribute (it shrank SWISS pictures whose files are larger than their attributes)', () => {
  assert.ok(!css.includes('img:where([width][height]) { width: attr('));
});

test('the rule comes after main img and keeps its specificity (no class or attribute outside :where)', () => {
  const at = css.indexOf('main img { max-width: 100%; width: auto; height: auto; }');
  const rule = css.indexOf('main :where(.default-content-wrapper) img:where([width][height])');
  assert.ok(at >= 0 && rule > at);
});
