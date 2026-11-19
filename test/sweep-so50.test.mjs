/* eslint-disable max-len, import/extensions -- dev tooling */
/* Standing order 50 of 2026-11-19 (full-site no-breakage sweep of Brussels, ITA and Discover): the fault kinds found on
   three or more documents get a theme rule scoped by structure.
   - Brussels: a link-list column view's first H4 (the fare name, no icon) keeps its icon item headings' 18 px on phones
     (carry-on baggage in six languages).
   Run: node --test test/sweep-so50.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = (f) => fs.readFileSync(new URL(`../styles/themes/${f}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('Brussels: the link-list fare name keeps 18 px on phones, only where icon headings follow', () => {
  assert.ok(css('brussels.css').includes('@media (width < 768px) { body.brand-brussels .columns-media.link-list.link-list .columns-media-row > .columns-media-text > h4:first-child:not(:has(> picture)):has(~ h4 > picture) { font-size: 18px; line-height: 110%; } }'));
});
