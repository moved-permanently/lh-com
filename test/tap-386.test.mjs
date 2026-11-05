/* eslint-disable max-len */
/* Brief 386, TAP (tools/reports/tap/parity.md):
   - row 66: the call-back card's title on phones as www's BySide window (up to 600 px its line
     break hidden: "Embrace the benefits of / the Club");
   - round 3, the inner pages' slider (Miles&Go partners, www.flytap.com/pt-pt/miles-and-go and
     /parceiros at 1440 and 390): the title never clamped (www's three-line titles whole), 32 / 32
     on phones 56 px from the slide's top, 48 / 48 in 512 px from 1024 px at 64 x 60; 24 px to the
     lead and to the button;
   Run: node --max-old-space-size=512 --test test/tap-386.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');

test('row 66: the call-back card\'s title without its line break up to 600 px, as BySide\'s window', () => {
  assert.match(css, /@media \(width <= 600px\) \{\s*body\.brand-tap \.click-to-call \.click-to-call-title br \{\s*display: none;\s*\}\s*\}/);
});

test('round 3: the inner slider\'s text as www\'s swiper (titles whole, 48 / 48 in 512 px from 1024 px, 24 px apart)', () => {
  // the homepage stage keeps its two-line clamp; the inner slider shows the whole title
  assert.match(css, /body\.brand-tap \.hero-campaign-tap\.narrow \.hero-campaign-content :is\(h1, h2, h3, h4, h5, h6\) \{\s*display: block;\s*margin-bottom: 24px;\s*overflow: visible;\s*-webkit-line-clamp: none;\s*\}/);
  assert.match(css, /body\.brand-tap \.hero-campaign-tap\.narrow \.hero-campaign-content > \.hero-campaign-subtitle \{\s*margin-bottom: 24px;\s*\}/);
  assert.match(css, /body\.brand-tap \.hero-campaign-tap\.narrow \.hero-campaign-inner \{\s*padding-top: 56px;\s*\}/);
  // a slide without a lead: www keeps the lead's empty line's 24 px (the button 48 px under the title)
  assert.match(css, /body\.brand-tap \.hero-campaign-tap\.narrow \.hero-campaign-content > :is\(h1, h2, h3, h4, h5, h6\) \+ \.hero-campaign-cta \{\s*padding-top: 24px;\s*\}/);
  const wide = css.slice(css.indexOf('@media (width >= 1024px) {\n  body.brand-tap .hero-campaign.narrow:not(.slider),'));
  assert.match(wide, /body\.brand-tap \.hero-campaign-tap\.narrow \.hero-campaign-inner \{\s*padding: 64px 60px 0;\s*\}/);
  assert.match(wide, /body\.brand-tap \.hero-campaign-tap\.narrow \.hero-campaign-content :is\(h1, h2, h3, h4, h5, h6\) \{\s*max-width: 512px;\s*margin-bottom: 24px;\s*font-size: calc\(48px \* var\(--a11y-scale, 1\)\);\s*line-height: 1;\s*\}/);
});
