/* eslint-disable max-len */
/* Air Dolomiti's link tile pages (support, baggage: www's TitleMargin, TextSubtitleHeadline and GridThreeScroll of
   CardIllustrationsSmall) as www's (the standing order of 2026-11-10, item 6; airdolomiti-parity-001
   /en/support-and-contacts at 390: ours 1,758 px against www's 1,874, -6.2 %; the baggage and support pages in de, en, it
   -5 to -7 %). The destination article lists' rule (a title and one line over three-up cards: the title centred, the
   line 65vw justified, 179 px over the cards, from 930 px) took these pages too, their shape being the same; and www's
   tile grid keeps 150 px under it (margin 20px auto 150px), ours the section's 48. The article lists' rule leaves out
   the tile cards (a picture, a title and its link only); the tiles' section keeps 150 px under it.
   Run: node --test test/airdolomiti-link-tiles-567.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const TILE = '.cards-teaser.three-up > ul > li > .cards-teaser-image + .cards-teaser-body > .cards-teaser-title:first-child + .cards-teaser-cta:last-child';

test('the destination article lists\' rule leaves out the link tiles', () => {
  const lists = '.default-content-wrapper:has(> h1:first-child + p:last-child):has(+ .cards-teaser-wrapper > .cards-teaser.three-up)';
  const n = css.split(lists).length - 1;
  assert.equal(n, 3);
  assert.equal(css.split(`${lists}:not(:has(+ .cards-teaser-wrapper > ${TILE}))`).length - 1, 3);
});

test('the tiles\' section 150 px over what follows, at every width', () => {
  const sel = `body.brand-airdolomiti main > .section:has(> .cards-teaser-wrapper > ${TILE})`;
  const i = css.indexOf(`${sel} {`);
  assert.ok(i >= 0);
  assert.match(css.slice(i, css.indexOf('}', i)), /margin-bottom: 150px;/);
  const before = css.slice(0, i);
  assert.ok(before.lastIndexOf('@media') < before.lastIndexOf('\n}\n'), 'not inside a media query');
});
