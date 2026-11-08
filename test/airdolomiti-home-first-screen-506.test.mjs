/* eslint-disable max-len */
/* Air Dolomiti's homepage, the first screen (the brief after 505, item 1; Air Dolomiti row 70): www's
   hero is the window's height with the alert bar and the header over its top, "Discover our
   promotions" 64 px under it at 1440 (964 at 1440 x 900) and 60 px at 390 (904 at 390 x 844). Ours
   stacked the alert pill (flash-teaser, 127 px with its spacing at 1440) above a 780 px stage (560 on
   phones) and put the promotions 93 px (48 on phones) under the band: 156 px low at 1440, 47 px high
   at 390. On the homepage (the services stage) only: the pill's section over the stage's top (out of
   the flow, where it was), the stage the window's height under the header, the promotions 64 / 60 px
   under the band. Air Dolomiti's theme only.
   Run: node --max-old-space-size=512 --test test/airdolomiti-home-first-screen-506.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const H = 'body.brand-airdolomiti main > .section:has(.hero-campaign-services)';

test('row 70: the alert pill over the stage on the homepage only (out of the flow, in its place)', () => {
  assert.ok(css.includes('body.brand-airdolomiti main:has(.hero-campaign-services) > .section.flash-teaser-container:first-child { position: absolute; right: 0; left: 0; z-index: 3; }'));
});

test('row 70: the stage the window\'s height under the header, at every width', () => {
  assert.ok(css.includes(`${H} .hero-campaign.hero-campaign-services { min-height: calc(100svh - var(--nav-height)); }`));
  assert.ok(!css.includes(`${H} .hero-campaign.hero-campaign-services { min-height: 780px; }`), 'not a fixed 780 px');
});

test('row 70: the promotions 64 px under the band from 1025 px, 60 px below', () => {
  const desktop = css.split('@media (width >= 1025px)').slice(1).join(' ');
  const phone = css.split('@media (width < 1025px)').slice(1).join(' ');
  assert.ok(/body\.brand-airdolomiti main > \.section:has\(\.hero-campaign-services\) \+ \.section\.flight-search-container \{ position: relative; z-index: 2; margin-top: -343px; margin-bottom: 201px; \}/.test(desktop), 'from 1025 px: 230 - 29');
  assert.ok(/body\.brand-airdolomiti main > \.section:has\(\.hero-campaign-services\) \+ \.section\.flight-search-container:has\(\.flight-search-overlay\) \{ position: relative; z-index: 2; margin-top: -271px; margin-bottom: 231px; \}/.test(phone), 'below 1025 px: 171 + 48 + 12');
});
