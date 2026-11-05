/* eslint-disable max-len */
/* Brief 386, TAP (tools/reports/tap/parity.md):
   - row 66: the call-back card's title on phones as www's BySide window (up to 600 px its line
     break hidden: "Embrace the benefits of / the Club");
   - round 3, the inner pages' slider (Miles&Go partners, www.flytap.com/pt-pt/miles-and-go and
     /parceiros at 1440 and 390): the title never clamped (www's three-line titles whole), 32 / 32
     on phones 56 px from the slide's top, 48 / 48 in 512 px from 1024 px at 64 x 60; 24 px to the
     lead and to the button;
   - round 3, the info card (www's CardInfoBlock: "Milhas necessárias por zona" on the buy-ticket
     pages, the stopover's FAQ card): as wide as its content up to 790 px (www's max-w-[790px]:
     790 there, 570 on the stopover), its texts after the first without a gap, its two links side by
     side from 768 px (16 px apart; stacked the whole width on phones), the second a 32 px pill in
     TAP's dark green on the card's grey, its hover www's 8 % green;
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

test('round 3: the info card as wide as its content up to 790 px, its two links side by side', () => {
  assert.match(css, /body\.brand-tap main > \.section\.info-card > \.default-content-wrapper \{[^}]*width: fit-content;[^}]*max-width: min\(790px, calc\(100% - 2 \* var\(--layout-margin\)\)\);/);
  assert.match(css, /body\.brand-tap main > \.section\.info-card > \.default-content-wrapper > p:not\(:first-child, \.button-wrapper, \.link-wrapper\) \+ p:not\(\.button-wrapper, \.link-wrapper\) \{\s*margin-top: 0;\s*\}/);
  assert.match(css, /body\.brand-tap main > \.section\.info-card > \.default-content-wrapper > \.link-wrapper \{\s*margin-top: 16px;\s*\}/);
  assert.match(css, /body\.brand-tap main > \.section\.info-card \.link-wrapper > a:any-link \{[^}]*display: flex;[^}]*min-height: 32px;[^}]*padding: 0 16px;[^}]*border-radius: 999px;[^}]*background-color: #fcfcfc;[^}]*color: #397213;[^}]*font-size: 16px;[^}]*line-height: 24px;[^}]*font-weight: 500;[^}]*text-decoration: none;/);
  assert.match(css, /body\.brand-tap main > \.section\.info-card \.link-wrapper > a:hover \{\s*background-color: rgb\(101 201 34 \/ 8%\);\s*\}/);
  assert.match(css, /body\.brand-tap main > \.section\.info-card \.link-wrapper > a:any-link::before \{\s*content: none;\s*\}/);
  // the grey text rule (8 px above each) leaves the second link to its own 16 px
  assert.match(css, /body\.brand-tap main > \.section\.info-card > \.default-content-wrapper > p:not\(:first-child, \.button-wrapper, \.link-wrapper\) \{\s*margin-top: 8px;/);
  const wide = css.slice(css.indexOf('@media (width >= 768px) {\n  body.brand-tap main > .section.info-card a.button:any-link'));
  assert.match(wide, /body\.brand-tap main > \.section\.info-card > \.default-content-wrapper > :is\(\.button-wrapper, \.link-wrapper\) \{\s*display: inline-block;\s*vertical-align: top;\s*\}/);
  assert.match(wide, /body\.brand-tap main > \.section\.info-card > \.default-content-wrapper > \.button-wrapper \+ \.link-wrapper \{\s*margin-left: 16px;\s*\}/);
});
