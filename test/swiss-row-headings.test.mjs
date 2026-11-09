/* eslint-disable max-len -- dev tooling */
/* The brief after 510, item 3 (SWISS' ranking: the pages of picture-and-text rows, /ch/en/book-and-manage/swiss-choice/
   upgrade-options -6.4 / -6.5 %, swiss-premium-economy -7.6 / -5.8 %, swiss-business, swiss-economy, online-check-in):
   www.swiss.com's rows are column views of their own, the next row's heading about 65 px under a row at 1440 and 48 px
   at 390 (brief 497's recordings); ours had the default 24 px, so every row after the first came 25 to 40 px short.
   A heading that opens the default content after a columns-media row keeps www's space: 48 px, 64 px from 1025 px.
   Default content after a row that does not start with a heading keeps its 24 px.
   Run: node --test test/swiss-row-headings.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const file = process.env.SWISS_CSS || new URL('../styles/themes/swiss.css', import.meta.url);
const css = fs.readFileSync(file, 'utf8').replace(/\s+/g, ' ');
const sel = 'body.brand-swiss main .columns-media-wrapper + .default-content-wrapper:has(> :is(h2, h3):first-child)';

test('a row\'s heading after the row before it: 48 px', () => {
  assert.ok(css.includes(`*/ ${sel} { margin-top: 48px; }`));
});

test('from 1025 px: 64 px', () => {
  assert.ok(css.includes(`@media (width >= 1025px) { ${sel} { margin-top: 64px; } }`));
});
