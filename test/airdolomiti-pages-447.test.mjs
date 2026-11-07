/* eslint-disable max-len */
/* Air Dolomiti's page types (styles/themes/airdolomiti.css), brief 447, as www's in
   airdolomiti-parity-001 (its stylesheets at 1440 and 390):
   - links in running text underlined, without lh-com's arrows (www's RichText a);
   - the page title 25 px above what follows, 20 px from 930 px (TitleMargin_title);
   - a title followed by more than one paragraph (www's TitleDescriptionTextCta: the destinations,
     flights and assistance hubs): the text 22 / 37.4 px, a blank line (37.4 px) between the
     paragraphs and under the title, from 930 px in a centred column of 70vw;
   - the manage-booking page (www's TitleDescriptionPnr): the title and the line under it centred
     in 50vw from 930 px, the line 16 / 22 px, 40 px above the form;
   - the pages with the FAQ accordions and the help card (www's HalfPage: lounges, seat
     reservation, parking): the title 34 / 42 px (38 / 46 from 930 px), 2 px apart from 530 px,
     the line 16 / 22 px; the accordions' titles light 34 / 57.8 px (38 / 64.6, www's measured), 20 px above and below,
     grey lines, www's teal arrow after them; from 930 px the card (410 px, grey, its title bold
     37.8 / 40 px, its text 19.44 / 30 px, the button across it, the picture under it) beside them.
   Run: node --test test/airdolomiti-pages-447.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const has = (re, msg) => assert.ok(re.test(css), msg ? `${msg}: ${re}` : String(re));
const B = 'body\\.brand-airdolomiti';

test('links in running text underlined, without the arrows', () => {
  has(new RegExp(`${B} main :is\\(\\.default-content-wrapper, \\.columns-media-text\\) :is\\(p:not\\(\\.link-wrapper, \\.button-wrapper\\), li\\) a:any-link:not\\(\\.button, :has\\(img, picture\\)\\) \\{[^}]*text-decoration: underline;`));
  has(new RegExp(`${B} main :is\\(\\.default-content-wrapper, \\.columns-media-text\\) :is\\(p:not\\(\\.link-wrapper, \\.button-wrapper\\), li\\) a:any-link:not\\(\\.button, :has\\(img, picture\\)\\)::before \\{[^}]*content: none;`));
});

test('the title 25 px above what follows, 20 px from 930 px', () => {
  has(new RegExp(`${B} main \\.default-content-wrapper h1 \\{[^}]*margin-bottom: 25px;`));
  has(new RegExp(`@media \\(width >= 930px\\) \\{[^@]*${B} main \\.default-content-wrapper h1 \\{[^}]*margin-bottom: 20px;`));
});

test('the cards 40 px under a title and its line', () => {
  has(new RegExp(`${B} main \\.default-content-wrapper:has\\(> h1 \\+ p:last-child\\) \\+ \\.cards-teaser-wrapper \\{[^}]*margin-top: 40px;`));
});

test('a title with more than one paragraph: www\'s text block', () => {
  const T = `${B} main \\.default-content-wrapper:has\\(> h1 ~ p ~ p\\)`;
  has(new RegExp(`${T} > h1,[^}]*margin-bottom: 37\\.4px;`));
  has(new RegExp(`${T} > p:not\\(\\.button-wrapper\\),[^}]*max-width: none;[^}]*margin: 0 0 37\\.4px;[^}]*font-size: 22px;[^}]*line-height: 37\\.4px;`));
  has(new RegExp(`@media \\(width >= 930px\\) \\{[^@]*${T} > :is\\(h1, p:not\\(\\.button-wrapper\\), p\\.button-wrapper\\),[^}]*margin-inline: calc\\(\\(100% - 70vw\\) / 2\\);`));
});

test('the text block\'s lists as its text (brief 452: the assistance page\'s contacts), in its column', () => {
  const T = `${B} main \\.default-content-wrapper:has\\(> h1 ~ p ~ p\\)`;
  has(new RegExp(`${T} > :is\\(ul, ol\\) \\{[^}]*max-width: none;[^}]*margin: 0 0 37\\.4px;[^}]*padding-left: 1\\.625em;[^}]*font-size: 22px;[^}]*line-height: 37\\.4px;`));
  has(new RegExp(`@media \\(width >= 930px\\) \\{[^@]*${T} > :is\\(ul, ol\\) \\{[^}]*margin-inline: calc\\(\\(100% - 70vw\\) / 2\\);`));
});

test('a section heading in the text block ends it (brief 452: flights to Europe\'s "Flights from Frankfurt", www\'s styles_title and its 16 / 22 px line, across the page)', () => {
  const T = `${B} main \\.default-content-wrapper:has\\(> h1 ~ p ~ p\\)`;
  has(new RegExp(`${T} > h2 ~ :is\\(p:not\\(\\.button-wrapper\\), ul, ol\\) \\{[^}]*margin: 0 0 20px;[^}]*font-size: 16px;[^}]*line-height: 22px;`));
  has(new RegExp(`@media \\(width >= 930px\\) \\{[^@]*${T} > h2 ~ :is\\(p:not\\(\\.button-wrapper\\), ul, ol\\) \\{[^}]*margin-inline: 0;`));
});

test('the fleet\'s text under its stage as the same text block', () => {
  has(/body\.brand-airdolomiti main > \.section\.hero-campaign-container \+ \.section > \.default-content-wrapper:has\(> h2:first-child ~ p ~ p\) > p:not\(\.button-wrapper\) \{[^}]*font-size: 22px;/);
});

test('the manage-booking page: title and line centred, the line 16 / 22 px', () => {
  const P = `${B} main:has\\(\\.manage-booking\\) \\.default-content-wrapper`;
  has(new RegExp(`${P} > :is\\(h1, h1 \\+ p\\) \\{[^}]*text-align: center;`));
  has(new RegExp(`${P} > h1 \\+ p \\{[^}]*max-width: none;[^}]*margin-bottom: 40px;[^}]*font-size: 16px;[^}]*line-height: 22px;`));
  has(new RegExp(`@media \\(width >= 930px\\) \\{[^@]*${P} > :is\\(h1, h1 \\+ p\\) \\{[^}]*margin-inline: calc\\(\\(100% - 50vw\\) / 2\\);`));
});

test('the FAQ pages: title, line and accordions as www\'s; the card beside them from 930 px', () => {
  const S = `${B} main > \\.section\\.accordion-columns-container\\.columns-media-container`;
  has(new RegExp(`${S} \\.default-content-wrapper h1 \\{[^}]*font-size: 34px;[^}]*line-height: 42px;`));
  has(new RegExp(`@media \\(width >= 530px\\) \\{[^@]*${S} \\.default-content-wrapper h1 \\{[^}]*letter-spacing: 2px;`));
  has(new RegExp(`@media \\(width >= 930px\\) \\{[^@]*${S} \\.default-content-wrapper h1 \\{[^}]*font-size: 38px;[^}]*line-height: 46px;`));
  has(new RegExp(`${S} \\.default-content-wrapper h1 \\+ p \\{[^}]*font-size: 16px;[^}]*line-height: 22px;`));
  // (brief 452: every FAQ accordion, www's TogleTariffe on the assistance page too, not only beside the help card)
  const A = `${B} main \\.accordion-columns\\.faq`;
  has(new RegExp(`${A} \\.accordion-columns-title \\{[^}]*padding: 20px 0;[^}]*font-size: 34px;[^}]*font-weight: 300;[^}]*line-height: 57\\.8px;`));
  has(new RegExp(`@media \\(width >= 930px\\) \\{[^@]*${A} \\.accordion-columns-title \\{[^}]*font-size: 38px;[^}]*line-height: 64\\.6px;`));
  has(new RegExp(`${A} \\.accordion-columns-title::after \\{[^}]*background-color: #00798a;`));
  has(new RegExp(`@media \\(width >= 930px\\) \\{[^@]*${S} \\{[^}]*display: grid;[^}]*grid-template-columns: minmax\\(0, 50%\\) minmax\\(0, 1fr\\);`));
  has(new RegExp(`@media \\(width < 930px\\) \\{[^@]*${S} > \\.columns-media-wrapper \\{[^}]*margin-top: 110px;`));
  has(new RegExp(`${S} > \\.columns-media-wrapper \\{[^}]*grid-column: 2;[^}]*grid-row: 2 / span 2;[^}]*justify-self: end;[^}]*width: 410px;`));
  has(new RegExp(`@media \\(width >= 1330px\\) \\{[^@]*${S} \\{[^}]*grid-template-columns: minmax\\(0, 55%\\) minmax\\(0, 1fr\\);`));
  has(new RegExp(`${S} \\.columns-media-row \\{[^}]*flex-direction: column-reverse;[^}]*border-radius: 10px;[^}]*background-color: #f4f4f4;`));
  has(new RegExp(`${S} \\.columns-media-text h3 \\{[^}]*font-size: 37\\.8px;[^}]*font-weight: 600;[^}]*line-height: 40px;`));
});

test('the destination pages\' stage as www\'s HeroSecond: the picture darkened across the screen, the lines centred in a light box, the price and the button on a white bar under them', () => {
  const D = `${B} main > \\.section\\.hero-card-overlay-container\\.cards-icon-container \\.hero-card-overlay`;
  has(new RegExp(`${D} \\{[^}]*justify-content: center;[^}]*align-items: center;[^}]*min-height: 100vh;`));
  has(new RegExp(`${D} \\.hero-card-overlay-media::after \\{[^}]*background-color: rgb\\(0 0 0 / 50%\\);`));
  has(new RegExp(`${D} \\.hero-card-overlay-card \\{[^}]*padding: 10px;[^}]*background-color: hsl\\(26deg 26% 95% / 60%\\);[^}]*color: #002e54;[^}]*text-align: center;`));
  has(new RegExp(`${D} \\.hero-card-overlay-card h1 \\{[^}]*color: #002e54;[^}]*font-size: 37\\.8px;[^}]*font-weight: 300;[^}]*line-height: 40px;`));
  has(new RegExp(`@media \\(width >= 930px\\) \\{[^@]*${D} \\{[^}]*min-height: 90vh;`));
  has(new RegExp(`@media \\(width >= 930px\\) \\{[^@]*${D} \\.hero-card-overlay-card h1 \\{[^}]*font-size: 64\\.8px;[^}]*line-height: 72px;`));
  has(new RegExp(`@media \\(width >= 530px\\) \\{[^@]*${D}::after \\{[^}]*height: 135px;[^}]*background-color: #fff;`));
});

test('section headings as most of www\'s (MiniCardSlider, Title, CosaFareCarroussel, CenteredBlock): 34 / 42 px, 38 / 46 px from 930 px; the text blocks\' and the destination grid\'s 38 / 46, 42 / 50 from 930 px', () => {
  has(new RegExp(`${B} main \\.default-content-wrapper h2 \\{[^}]*font-size: 34px;[^}]*font-weight: 300;[^}]*line-height: 42px;`));
  has(new RegExp(`@media \\(width >= 930px\\) \\{[^@]*${B} main \\.default-content-wrapper h2 \\{[^}]*font-size: 38px;[^}]*line-height: 46px;`));
  assert.equal(/@media \(width >= 1025px\) \{[^@]*body\.brand-airdolomiti main \.default-content-wrapper h2 \{[^}]*font-size: 42px;/.test(css), false, 'no 42 px from 1025 px for every heading');
  // the 930 px rule after the default one in the file, or the default wins (same selector; brief 452)
  const wide = css.search(/@media \(width >= 930px\) \{[^@]*body\.brand-airdolomiti main \.default-content-wrapper h2 \{[^}]*font-size: 38px;/);
  const narrow = css.search(/body\.brand-airdolomiti main \.default-content-wrapper h2 \{[^}]*font-size: 34px;/);
  assert.ok(wide > narrow, '38 px from 930 px after the 34 px default');
  has(/body\.brand-airdolomiti main \.default-content-wrapper:has\(> h1 ~ p ~ p\):has\(\+ \.cards-teaser-wrapper\) > h2:last-child, body\.brand-airdolomiti main > \.section\.hero-campaign-container \+ \.section > \.default-content-wrapper:has\(> h2:first-child ~ p ~ p\) > h2:first-child \{[^}]*font-size: 38px;[^}]*line-height: 46px;/);
});

test('the destination hub\'s cards as www\'s CardNews: white, shadowed, 470 px high, the picture 60 %, the title regular 20 / 26 px, the line grey and underlined, the card one link', () => {
  const C = `${B} \\.cards-teaser\\.three-up > ul > li:has\\(> \\.cards-teaser-image \\+ \\.cards-teaser-body > \\.cards-teaser-title:first-child \\+ p:not\\(\\.cards-teaser-cta\\) \\+ \\.cards-teaser-cta:last-child\\)`;
  has(new RegExp(`${C} \\{[^}]*position: relative;[^}]*height: 470px;[^}]*border-radius: 10px;[^}]*background-color: #fff;[^}]*box-shadow: 0 12px 25px rgb\\(0 0 0 / 5%\\);`));
  has(new RegExp(`${C} \\.cards-teaser-image \\{[^}]*flex: 0 0 60%;`));
  has(new RegExp(`${C} \\.cards-teaser-title \\{[^}]*font-size: 20px;[^}]*font-weight: 400;[^}]*line-height: 26px;`));
  has(new RegExp(`${C} \\.cards-teaser-body > p:not\\(\\.cards-teaser-cta\\) \\{[^}]*color: #757575;[^}]*font-size: 14px;[^}]*line-height: 18px;[^}]*text-decoration: underline;`));
  has(new RegExp(`${C} \\.cards-teaser-cta-link \\{[^}]*position: absolute;[^}]*inset: 0;`));
  has(new RegExp(`${C} \\.cards-teaser-cta \\{[^}]*display: contents;`), 'the link out of the column, over the card');
});
