/* eslint-disable max-len */
/* Brussels's article lists without a search field and category filter, as www's (standing order 6 of 2026-11-12, item 2, the
   shared causes; brussels-parity-003 /be/en/articles +2.8 % and /be/fr/articles +3.4 % at 390). www's blog overview on
   brusselsairlines.com renders the count ("16 Blog entries") and an empty filter column (hideFilter false in its data-dcep,
   but no field; the first card's picture 66 px under the count at 390); ours, lufthansa.com's Insights filter, the search
   field and the category select (116 px at 390, the list 164 px lower). The Brussels theme hides the filter form.
   Run: node --test test/brussels-blog-filter-589.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('the Brussels blog overview shows no filter form', () => {
  assert.match(css, /body\.brand-brussels \.blog-overview \.blog-overview-filter \{ display: none; \}/);
});

test('only on Brussels: the block keeps its filter elsewhere', () => {
  const block = fs.readFileSync(new URL('../blocks/blog-overview/blog-overview.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
  assert.match(block, /\.blog-overview \.blog-overview-filter \{ display: flex;/);
});
