/* eslint-disable max-len */
/* Brief 378, TAP (tools/reports/tap/parity.md):
   - row 98: the importer's option one-up (Wi-Fi's data packages; cards-teaser and cards) one card
     a row at every width, as www.flytap.com/pt-pt/a-bordo/wi-fi (24 px between the cards' cells);
   - the phone picture below 728 px, www's breakpoint (hero-campaign and hero-card-overlay, TAP);
   - rows 43 and 44: two TAP section styles (see their test).
   Run: node --max-old-space-size=512 --test test/tap-378.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');

test('row 98: one-up one card a row at every width (cards-teaser and cards), 24 px apart', () => {
  assert.match(css, /body\.brand-tap :is\(\.cards, \.cards-teaser\)\.one-up > ul \{\s*grid-template-columns: minmax\(0, 1fr\);\s*gap: 24px;/);
  // after the base grids: no media query of the theme gives one-up more columns
  const at = css.indexOf('body.brand-tap :is(.cards, .cards-teaser).one-up > ul {');
  assert.equal(at > css.indexOf('body.brand-tap .cards.four-up > ul {'), true);
  assert.equal(/\.one-up > ul \{\s*grid-template-columns: repeat/.test(css), false);
  // www's 133 px package at 1440: the text 40 px above the card's foot
  // the card rules' condition since TAP row 156 (standing order 14): any paragraph, a CTA alone too, at the old weight
  assert.match(css, /body\.brand-tap \.cards-teaser\.one-up li:has\(> \.cards-teaser-body > p:not\(\.cards-teaser-title\)\) \.cards-teaser-body \{\s*padding-bottom: 40px;/);
});

test('row 23: the bar stays on screen as www\'s (never hidden on scroll; the homepage\'s rises with the page to 16 px from the top, from 1025 px)', () => {
  assert.match(css, /body\.brand-tap \.header \.nav-wrapper\.nav-tap\.is-hidden \{\s*transform: none;/);
  assert.match(css, /@supports \(animation-timeline: scroll\(\)\) \{\s*body\.brand-tap header\.tap-home \.nav-wrapper\.nav-tap \{\s*position: fixed;\s*top: 16px;\s*animation: tap-bar-rise linear both;\s*animation-timeline: scroll\(root block\);\s*animation-range: 0 var\(--tap-stage-top, 0\);/);
  assert.match(css, /@keyframes tap-bar-rise \{\s*from \{\s*transform: translateY\(var\(--tap-stage-top, 0\)\);\s*\}\s*to \{\s*transform: none;\s*\}\s*\}/);
});

test('the phone picture below 728 px, as www (hero-campaign and hero-card-overlay on TAP)', () => {
  ['../blocks/hero-campaign/hero-campaign.js'].forEach((f) => {
    const src = fs.readFileSync(new URL(f, import.meta.url), 'utf8');
    assert.match(src, /media: '\(min-width: 728px\)'/, f);
    assert.equal(src.includes("media: '(min-width: 768px)'"), false, f);
  });
  // hero-card-overlay: the width per brand since brief 437 (Cargo's ULD teaser from 768 px): TAP's
  // 728 (the behaviour in test/tap-phone-picture.test.mjs)
  const overlay = fs.readFileSync(new URL('../blocks/hero-card-overlay/hero-card-overlay.js', import.meta.url), 'utf8');
  assert.match(overlay, /const PHONE_PICTURE_FROM = \{ tap: 728, cargo: 768 \};/);
  assert.match(overlay, /media: `\(min-width: \$\{from\}px\)`/);
});
