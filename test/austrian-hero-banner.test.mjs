/* eslint-disable max-len -- dev tooling */
/* Austrian's expanding panels (/at/en/fly/on-board/culinary-services "Little treats. Great delight.", parity row
   37, brief 444): www's .herobanner is the component lh-com's hero-banner block is built for (Lufthansa's
   /de/de/speisen-und-getraenke); the import maps it (austrian-hero-banner template). Its geometry is www's as it
   is (720 px at 1440, panes 1028 / 206 / 206; 760 px at 390x844, 542 / 108 / 108). Austrian's type against
   austrian-parity-002a: the headline 48 / 50 below 1025 px (100 / 100 from there, as lh-com's), the button 10 px
   under it (20 from 1025 px), the tab labels a plain sans 16 / 17.6 (18 / 19.8 from 1025 px) regular, as wide as the
   pane less its 50 px inset (one line in a 206 px pane at 1440; lh-com's: the heading face light 20 to 24 px at
   most 140 to 180 px wide, two lines).
   Run: node --max-old-space-size=512 --test test/austrian-hero-banner.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = () => fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('the theme: www\'s headline, button gap and tab labels on Austrian\'s hero-banner', () => {
  const s = css();
  assert.match(s, /body\.brand-austrian \.hero-banner \.hero-banner-content > \.hero-banner-headline \{ font-size: 48px; \}/);
  assert.match(s, /body\.brand-austrian \.hero-banner \.hero-banner-cta \{ margin-top: 10px; \}/);
  assert.match(s, /body\.brand-austrian \.hero-banner \.hero-banner-tab \{ max-width: calc\(100% - 50px\); font-family: var\(--body-font-family\); font-size: 16px; font-weight: 400; line-height: 1\.1; \}/);
  assert.match(s, /@media \(width >= 1025px\) \{ body\.brand-austrian \.hero-banner \.hero-banner-content > \.hero-banner-headline \{ font-size: 100px; \} body\.brand-austrian \.hero-banner \.hero-banner-cta \{ margin-top: 20px; \} body\.brand-austrian \.hero-banner \.hero-banner-tab \{ font-size: 18px; \} \}/);
});
