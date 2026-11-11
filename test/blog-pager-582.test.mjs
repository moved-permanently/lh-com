/* eslint-disable max-len */
/* Brief 582, rule 6 (the Insights tag pages: /de/en/articles/tags/allegris 22.8 % at 1440): www's maui-pagination draws
   50 x 50 px page buttons 10 px apart, the others on grey 245, the arrows without a box; ours had 40 px buttons 4 px
   apart without a background. For pagers of at most five items (three pages and the arrows); longer ones as before
   (www shortens them with an ellipsis, ours lists every page).
   Run: node --max-old-space-size=256 --test test/blog-pager-582.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/blog-overview/blog-overview.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const UL = 'body.brand-lufthansa .blog-overview .blog-overview-pagination ul:not(:has(> li:nth-child(6)))';

test('short pagers: www\'s 50 px buttons, 10 px apart, grey, the current one deep blue, the arrows without a box', () => {
  assert.ok(css.includes(`${UL} { gap: 10px; }`));
  assert.ok(css.includes(`${UL} button { min-width: 50px; height: 50px; background-color: var(--lh-grey-1); }`));
  assert.ok(css.includes(`${UL} button[aria-current="page"] { background-color: var(--lh-deepblue); }`));
  assert.ok(css.includes(`${UL} :is(.blog-overview-prev, .blog-overview-next) { min-width: 20px; background: none; }`));
});
