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
   - round 3, the feature card (www's FeatureCard: the Star Alliance partners card, economy-prime's
     cards; the columns-media with an H3 title): its picture in www's frame, 16 px corners, filled,
     358 x 220 first on phones 24 px above the title, 536 x 275 from 728 px (a 556 + 540 grid, 24 px
     apart, the picture on either side), www's green chevron line (its 98 x 274 SVG, #9EFD38 6 px)
     over the picture's right edge 28 px outside, as row 55's;
   - round 3 with row 67, the inner pages' spacing (buy ticket 280 px and hand baggage 500 px
     shorter than www at 1440): www's components 64 px apart from 728 px and 32 px on phones
     (space-y-components-xs md:space-y-components-2xl), between sections, between a section's
     blocks and around a market's sections (flush elsewhere); not the homepage (header.tap-home), not
     after the breadcrumb (its own spacing), the theme's specific spacings kept; a three-up card
     without a button 48 px under its text as www's (229 px for the buy-ticket steps at 1440 and 390);
     a rich text's H3 as www's (font-tap bold 28 / 33.6, -2 %, every width: buy-ticket's "Como
     reservar uma viagem com milhas em Companhias da rede Star Alliance?"); a heading on its own
     (www's 6 px heading component, its H2 over it) 32 px above the next component from 728 px;
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

test('round 3: the feature card\'s picture in www\'s green chevron frame (row 55\'s line), 358 x 220 on phones, 536 x 275 from 728 px', () => {
  const fc = 'body\\.brand-tap \\.columns-media:not\\(\\.stack\\):has\\(\\.columns-media-text > h3:first-child\\)';
  const rule = (sel, body) => assert.match(css, new RegExp(`${fc} ${sel} \\{${body}`), sel);
  rule('\\.columns-media-media', '\\s*position: relative;\\s*order: -1;\\s*height: 220px;\\s*margin: 0 0 24px;');
  rule(':is\\(\\.columns-media-media picture, \\.columns-media-media img\\)', '\\s*display: block;\\s*width: 100%;\\s*height: 100%;');
  rule('\\.columns-media-media img', '\\s*border-radius: 16px;\\s*object-fit: cover;');
  rule('\\.columns-media-media::after', '[^}]*position: absolute;[^}]*top: 0;[^}]*right: -28px;[^}]*width: 98px;[^}]*height: 100%;[^}]*M3\\.05469 -18\\.0791L93\\.3581 125\\.628C95\\.1228 128\\.436 95\\.1228 131\\.688 93\\.3581 134\\.496L3\\.05469 278\\.203[^}]*stroke=\'%239EFD38\' stroke-width=\'6\'[^}]*center \\/ contain no-repeat;[^}]*pointer-events: none;');
  rule('\\.columns-media-text', '\\s*margin-bottom: 0;');
  const md = css.slice(css.indexOf('@media (width >= 728px) {\n  /* the feature card'));
  assert.ok(md.length < css.length, 'the 728 px block');
  assert.match(md, new RegExp(`${fc} \\.columns-media-row \\{\\s*grid-template-columns: minmax\\(0, 556fr\\) minmax\\(0, 540fr\\);\\s*gap: 0 24px;`));
  assert.match(md, new RegExp(`${fc} \\.columns-media-media-last \\{\\s*grid-template-columns: minmax\\(0, 540fr\\) minmax\\(0, 556fr\\);`));
  assert.match(md, new RegExp(`${fc} \\.columns-media-media \\{\\s*order: 0;\\s*height: 275px;\\s*margin: 0 20px 0 0;`));
});

test('round 3 with row 67: the inner pages\' components 64 px apart from 728 px, 32 px on phones, as www', () => {
  // (:where: no weight of its own, so the theme's specific spacings stay: the centred button, the stage)
  const inner = 'body\\.brand-tap :where\\(header:not\\(\\.tap-home\\)\\) ~ main';
  const block = css.slice(css.indexOf('/* the inner pages\' spacing as www\'s components'));
  assert.ok(block.length < css.length, 'the spacing rules');
  [['32px', 0], ['64px', block.indexOf('@media (width >= 728px)')]].forEach(([gap, from]) => {
    const part = block.slice(from);
    assert.match(part, new RegExp(`${inner} > \\.section,\\s*${inner} > \\.section:has\\(\\+ \\.section\\[data-markets\\]\\),\\s*${inner} > \\.section\\[data-markets\\] \\{\\s*margin-bottom: ${gap};`), `sections ${gap}`);
    assert.match(part, new RegExp(`${inner} > \\.section\\[data-markets\\],\\s*${inner} > \\.section\\[data-markets\\] \\+ \\.section \\{\\s*margin-top: 0;`), 'no extra top margin on market sections');
    assert.match(part, new RegExp(`${inner} > \\.section > div:not\\(\\.breadcrumb-wrapper\\) \\+ div \\{\\s*margin-top: ${gap};`), `blocks ${gap}`);
  });
});

test('round 3 with row 67: a three-up card without a button keeps www\'s 48 px under its text', () => {
  assert.match(css, /body\.brand-tap \.cards\.three-up \.cards-card-body:not\(:has\(> \.button-wrapper\)\) \{\s*padding-bottom: 24px;\s*\}/);
});

test('round 3 with row 67: a rich text\'s H3 as www\'s, 28 / 33.6 bold at every width', () => {
  assert.match(css, /body\.brand-tap main \.default-content-wrapper > h3:not\(\.faq-picker-sub-heading\) \{\s*font-size: calc\(28px \* var\(--a11y-scale, 1\)\);\s*line-height: 1\.2;\s*font-weight: 700;\s*letter-spacing: -0\.02em;\s*\}/);
});

test('round 3 with row 67: a heading on its own 32 px above the next component from 728 px, as www\'s 6 px heading component', () => {
  const md = css.slice(css.indexOf('/* a heading on its own (www\'s heading component'));
  assert.match(md, /body\.brand-tap :where\(header:not\(\.tap-home\)\) ~ main > \.section > \.default-content-wrapper:has\(> :is\(h2, h3\):only-child\) \+ div \{\s*margin-top: 32px;\s*\}/);
});
