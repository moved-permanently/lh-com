/* eslint-disable max-len */
/* Air Dolomiti's posts: the text 1200 px from the left as www's BlogLayout (the standing order of 2026-11-10, item 6; the
   Adriatic article in de, en and it +3.7 to +5.5 % at 1440, airdolomiti-parity-001). The theme's rule (1200 px, no side
   margins) lost to lh-com's styles.css rule for article pages since c20b77ea (two thirds, centred), whose :not() holds a
   :has() and so counts more: the text was a centred 912 px column. The theme's :not() takes the same :has(), so it wins
   again (and leaves out the same sections).
   Run: node --test test/airdolomiti-article-column-567.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8');
const lhcom = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8');
const MINE = 'body.brand-airdolomiti main:has(.article-header) > .section:not(.carousel-cards-container, .related-articles-container, :has(> .carousel-cards-wrapper > .carousel-cards:not(.article))) > .default-content-wrapper';

test('the posts\' text rules as specific as lh-com\'s article rule and more (its :has() in their :not())', () => {
  assert.ok(lhcom.includes('main:has(.article-header) > .section:not(.related-articles-container, :has(> .carousel-cards-wrapper > .carousel-cards:not(.article))) > .default-content-wrapper > :is(p, ul, ol, h2, h3, h4, h5, h6)'), 'lh-com\'s rule as it stands');
  assert.equal(css.split(MINE).length - 1, 4);
  assert.ok(!css.includes('main:has(.article-header) > .section:not(.carousel-cards-container, .related-articles-container) >'), 'no weaker copy left');
});

test('1200 px from the left', () => {
  const i = css.indexOf(`${MINE} > :is(p, ul, ol, h2, h3, h4, h5, h6),`);
  assert.ok(i >= 0);
  assert.match(css.slice(i, css.indexOf('}', i)), /max-width: 1200px;[^}]*margin-inline: 0;/);
});
