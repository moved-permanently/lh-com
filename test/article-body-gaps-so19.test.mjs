/* eslint-disable max-len */
/* Standing order 19 of 2026-11-14, item 2: the article body gaps, with the drifts they had uncovered (gate.mjs).
   Order 18 held "body sections 24 px apart below 768 px" (8 of 41 worse, mostly "fix wrong"). The drift steps per
   kind of section boundary (logs/p4/so19/bounds.py, the recorded insights page-widths) show www's article body as
   one column whose gaps depend on what meets: below 768 px a section opening with a divider after text is 28 px
   closer (+27 / +28 on 10 boundaries), and the section after an article card slider 28 px closer (+28 / +29 on 5);
   from 768 px a text section before one opening with text 24 px closer (+23 / +24 on 4), before one opening with an
   H2 16 px further (-16 / -17 on 5; after a list too), after an article card slider 9 px closer (+9 / +11 on 4). The
   rounds then fixed what the gate named "compensation removed": the price bar's section when it holds a spacer
   (+20 / +17 on 2 pages: 20 px / 23 px below it instead of 40) and an article's map with its list beside it (www
   41 / 75 px more below it). Gate on the 82 recorded insights page-widths, local render before / after: 32 better
   by more than 0.5, 49 within, 1 worse (stop-over-tokyo 390 +0.54: the divider after its photo credits sits 28 px
   lower on www, the drift above that cancelled the section divider's step; delta-so19-lh-com-tokyo-divider.txt
   READY, the pair rendered locally: 390 23.19 -> 23.19, 1440 19.26 -> 18.37).
   Run: node --test test/article-body-gaps-so19.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const A = 'body.brand-lufthansa main:has(.article-header)';

test('every width: the price bar\'s section with a spacer 20 px above the body, a map with its list 41 px below', () => {
  assert.ok(css.includes(`${A} > .section.full-bleed + .section.price-bar-container:has(> .default-content-wrapper > p.spacer) { margin-bottom: 20px; }`));
  assert.ok(css.includes(`${A} .poi-map.poi-map-with-aside { margin-bottom: 41px; }`));
});

test('below 768 px: a section opening with a divider after text, and the section after an article slider, 28 px closer', () => {
  assert.ok(css.includes(`@media (width < 768px) { ${A} > .section:has(> .default-content-wrapper:last-child > :is(p, ul):last-child) + .section:has(> .default-content-wrapper:first-child > p.spacer.divider:first-child) { margin-top: -28px; } ${A} > .section:has(> .carousel-cards-wrapper:last-child > .carousel-cards.article) + .section { margin-top: -28px; } }`));
});

test('from 768 px: text to text 24 px closer, text or list to an H2 16 px further, after a slider 9 px closer; the price bar 23 px, the map 75 px', () => {
  assert.ok(css.includes(`@media (width >= 768px) { ${A} > .section:not(.price-bar-container):has(> .default-content-wrapper:last-child > p:last-child) + .section:has(> .default-content-wrapper:first-child > p:first-child:not(.spacer)) { margin-top: -24px; } ${A} > .section.full-bleed + .section.price-bar-container:has(> .default-content-wrapper > p.spacer) { margin-bottom: 23px; } ${A} .poi-map.poi-map-with-aside { margin-bottom: 75px; } ${A} > .section:has(> .default-content-wrapper:last-child > :is(p, ul):last-child) + .section:has(> .default-content-wrapper:first-child > h2:first-child) { margin-top: calc(var(--section-gap) + 16px); } ${A} > .section:has(> .carousel-cards-wrapper:last-child > .carousel-cards.article) + .section { margin-top: -9px; } }`));
});
