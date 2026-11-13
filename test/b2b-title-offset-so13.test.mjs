/* eslint-disable max-len */
/* Standing order 13 of 2026-11-13, item 3 (Group for Business): a page title right under the breadcrumb sits 2 px higher
   than www's on nearly every recorded page (49 of 59 page-widths at 390, 31 of 40 at 1440; its margins are www's), so
   every line under it is 2 px off. From 768 px the title's wrapper 26 px under the breadcrumb (styles.css's
   --spacing-default 24 + 2): 1440 23 better, none worse. On phones 29 better and one worse by 0.76 (SWISS Senses
   intermediaries xx/de, its title a line longer than www's), so not there.
   Run: node --test test/b2b-title-offset-so13.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/b2b.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('B2B from 768 px: a title under the breadcrumb 26 px under it', () => {
  assert.ok(css.includes('@media (width >= 768px) { body.brand-b2b main > .section.breadcrumb-container > .breadcrumb-wrapper + .default-content-wrapper:has(> h1:first-child) { margin-top: 26px; } }'));
});
