/* eslint-disable max-len */
/* TAP's inner pages (brief 331, part 4; tools/reports/tap/parity.md rows 14, 18, 21, 15), CSS only
   in styles/themes/tap.css, all under body.brand-tap: the page title and its lead centred (not the
   homepage's hidden heading), the inner-page banners (hero-campaign narrow) inset in the column with
   32 px corners and their controls inside, the category cards' white tab label and card list of
   sub-links, the help cards' buttons at the card's foot with a chevron.
   Run: node --max-old-space-size=512 --test test/tap-inner-pages.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
const part = css.slice(css.indexOf("TAP's inner pages (brief 331, part 4)"));

test('row 14: the title and its lead centred, the hidden heading of a homepage left alone', () => {
  assert.match(part, /body\.brand-tap main > \.section:not\(\.hidden-heading\) \.default-content-wrapper > h1 \{[^}]*text-align: center;/);
  assert.match(part, /> h1 \+ p \{[^}]*max-width: 726px;[^}]*text-align: center;/);
});

test('row 18: the inner banners inset (at most 1176 px), 32 px corners, 404 px from 1024 px, controls inside', () => {
  assert.match(part, /body\.brand-tap \.hero-campaign\.narrow \{[^}]*min\(1176px,[^}]*border-radius: 32px;/);
  assert.match(part, /min-height: 404px;/);
  assert.match(part, /\.hero-campaign-tap\.narrow \.hero-campaign-controls \{[^}]*bottom: 20px;[^}]*left: 60px;/);
});

test('row 21: the category cards (a picture, a linked title, maybe links): the tab label, the list with chevrons', () => {
  assert.match(part, /\.cards-teaser > ul > li:has\(> \.cards-teaser-body > \.cards-teaser-title:first-child > a:only-child\):not\(:has\(\.cards-teaser-body > p\)\)/);
  assert.match(part, /border-radius: 0 0 16px 16px;/);
  assert.match(part, /\.cards-teaser-body > ul a:any-link::after \{/);
});

test('row 15: the help cards\' buttons at the foot, with a chevron', () => {
  assert.match(part, /body\.brand-tap \.cards:is\(\.three-up, \.two-up\) \.cards-card-body > \.button-wrapper:last-child \{\s*margin-top: auto;/);
  assert.match(part, /body\.brand-tap \.cards:is\(\.three-up, \.two-up\) a\.button:any-link::after \{/);
});
