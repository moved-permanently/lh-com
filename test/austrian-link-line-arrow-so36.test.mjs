/* eslint-disable max-len -- rule notes */
/* Standing order 36 (2026-11-15), item 2: Austrian's link lines (a link alone in its paragraph) draw www's
   maui-navigation-link arrow: a 16 px icon and 7 px to the text (www's .standalone column-gap), so the text starts
   21 px after the arrow's ink on www and ours, at 1440 and at 390 (healthy-travel, austrian-parity-015); lh-com's
   19 px arrow and 10 px gap stay for every other brand. Census: every recorded Austrian page-width toggled in the page.
   Run: node --test test/austrian-link-line-arrow-so36.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const theme = strip(fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8'));
const base = strip(fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8'));
const SEL = 'body\\.brand-austrian main \\.default-content-wrapper p\\.link-wrapper a:any-link';

test('Austrian: the link line\'s arrow 7 px from its text', () => {
  assert.match(theme, new RegExp(`${SEL} \\{ gap: 7px; \\}`));
});

test('Austrian: the arrow a 16 px icon', () => {
  assert.match(theme, new RegExp(`${SEL}::before \\{ width: 16px; height: 16px; \\}`));
});

test('the shared link line keeps lh-com\'s 19 px arrow and 10 px gap', () => {
  assert.match(base, /\.default-content-wrapper p\.link-wrapper a:any-link \{ display: inline-flex; align-items: baseline; gap: 10px; \}/);
  assert.match(base, /\.default-content-wrapper p\.link-wrapper a:any-link::before \{ content: ""; flex: 0 0 auto; align-self: center; width: 19px; height: 19px;/);
});
