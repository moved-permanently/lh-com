/* eslint-disable max-len */
/* The brief after 474, item 2 (the sweep's Austrian rows below the top 10, austrian-parity-001): www.austrian.com's page title
   (.contentpage h1.heading-large) has 36 px below it, 60 px from 1281 px (ours lh-com's 32 to 40 px): special-requirements,
   the book overviews, fly/travel-classes 20 px short at 1440. A card grid from www's column views (threecolumn teasers:
   fly-with-austrian's nine reasons) keeps the column view's 3.2rem padding above the first row after text and below the
   last row before more content (ours 24 px from the text: 32 px short each side).
   Run: node --max-old-space-size=256 --test test/austrian-title-cards-spacing.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('the page title: 36 px below, 60 px from 1281 px', () => {
  assert.match(css, /body\.brand-austrian main \.default-content-wrapper > h1 \{ margin-bottom: 36px; \}/);
  assert.match(css, /@media \(width >= 1281px\) \{ body\.brand-austrian main \.default-content-wrapper > h1 \{ margin-bottom: 60px; \} \}/);
});

test('a card grid after text and before more content: the column view\'s 32 px', () => {
  assert.match(css, /body\.brand-austrian main > \.section:not\(\.grey\) > \.default-content-wrapper:not\(:has\(> :is\(h1, h2, h3, h4, h5, h6\):last-child\)\) \+ \.carousel-cards-wrapper:has\(> \.carousel-cards\.grid\) \{ padding-top: 32px; \}/);
  assert.match(css, /body\.brand-austrian main > \.section:not\(\.grey\) > \.carousel-cards-wrapper:has\(> \.carousel-cards\.grid\):has\(\+ \.default-content-wrapper, \+ \.flight-search-wrapper\) \{ padding-bottom: 32px; \}/);
});
