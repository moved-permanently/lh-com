/* eslint-disable max-len */
/* SWISS magazine articles' galleries as www's (brief 455, item 3; swiss-parity-002 jungfrau region
   at 1440: slides 766 px, the copy column's width, from its left edge, square pictures, the next
   slide peeking in up to the window's edge; ours were lh-com's centred 1.2 slides in five sixths of
   the column, 529 px 3:2 pictures). styles/themes/swiss-magazine.css, articles only.
   Run: node --max-old-space-size=512 --test test/swiss-magazine-gallery-455.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/swiss-magazine.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const G = 'body.brand-swiss.sub-site-magazine main:has(.article-header) .carousel-images';

test('the gallery the column\'s width, one slide the column, square pictures, the track to the window\'s edge', () => {
  assert.ok(css.includes(`${G} { max-width: none; margin-inline: 0; }`));
  assert.ok(css.includes(`${G} .carousel-images-viewport { --carousel-images-slide: 100cqw; }`));
  assert.ok(css.includes(`${G} .carousel-images-track { gap: 24px; margin-inline-end: calc((100cqw - 100vw) / 2); scroll-padding-inline-start: var(--layout-margin); }`));
  assert.ok(css.includes(`${G} .carousel-images-slide { scroll-snap-align: start; }`));
  assert.ok(css.includes(`${G} .carousel-images-image { aspect-ratio: 1; }`));
  assert.ok(css.includes(`${G} .carousel-images-image img { object-fit: cover; }`));
});

// brief 453: on phones the lists' and More Stories' cards 56 px apart (www at 390); 47 px from 768 px as before
test('phones: the magazine lists\' cards 56 px apart', () => {
  assert.ok(css.includes('@media (width < 768px) { body.brand-swiss.sub-site-magazine { --magazine-edge: 16px; } body.brand-swiss.sub-site-magazine :is(.blog-overview.grid .blog-overview-list, .related-articles .related-articles-list) { row-gap: 56px; }'));
  assert.ok(css.includes('body.brand-swiss.sub-site-magazine .blog-overview.grid .blog-overview-list { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 47px 24px; }'));
});
