/* eslint-disable max-len, import/extensions */
/* Lufthansa Cargo's homepage fleet tiles, eServices slider and ULD teaser as www's (brief 430;
   cargo-parity-001's screenshots and its own stylesheets, 1440 and 390). Cargo only, in the blocks'
   CSS; the options written by tools/importer/cargo-import.mjs (these components are the homepages'
   only):
   - cards-teaser (overlay, fleet), www's .ourFleet: from 768 px a mosaic in three equal columns
     24 px apart (416 px at 1440): the first card both rows high (547 px), the second the top row's
     other two columns (265 px), the last two under it 20 px lower (263 px); below 768 px the four
     212 px high, 10 px apart; each card a 1 px #dcdcdc line, 4 px corners, www's shadow, the photo
     untinted, the figure LufthansaHead Bold 32/36 (28/32 on phones) and the label 18/24 white 20 px
     in from the top left;
   - carousel-cards (slides), www's .eservicesSlider: two 636 px slides to the 1296 px row (24 px
     apart, the third peeking into the margin), no card box, the 16:9 photo with 5 px corners, the
     text 20 px under it (the title LufthansaHead Light 28/32, 24/28 on phones; the text 18/24; the
     link bold 18/24 #52627c); www's 50 px #ebebeb arrows 8 px from the screen's edges from 1025 px
     (#dcdcdc at an end), 32 px at the top right below (the slider 42 px lower); 8 px dots 20 px
     under the slides (10 px on phones);
   - hero-card-overlay (plain), www's .teaserULD: the photo 640 px high across the screen, no card:
     the text on the photo in the column, centred top to bottom, #05164d: the line above the heading
     LufthansaHead Light 32/36, the heading bold 32/36 (28/32 on phones), 20 px apart, the link
     bold 18/24 #52627c.
   Run: node --max-old-space-size=512 --test test/cargo-home-tiles.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8').replace(/\s+/g, ' ');
const rules = (src, sel) => {
  const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [...src.matchAll(new RegExp(`(?:^|[}\\s,])${esc} \\{([^}]*)\\}`, 'g'))].map((m) => m[1]).join(' ');
};
const after = (src, marker) => src.slice(src.indexOf(marker));

test('fleet: www\'s mosaic from 768 px, the cards stacked below', () => {
  const css = read('blocks/cards-teaser/cards-teaser.css');
  const F = 'body.brand-cargo .cards-teaser.overlay.fleet';
  assert.match(rules(css, `${F} > ul`), /display: grid; grid-template-columns: minmax\(0, 1fr\); grid-auto-rows: 212px; gap: 10px;/);
  assert.match(rules(css, `${F} > ul > li:nth-child(n)`), /margin: 0; border: 1px solid #dcdcdc; border-radius: 4px; box-shadow: 0 1px 4px 0 rgb\(0 0 0 \/ 20%\);/);
  assert.match(rules(css, `${F} .cards-teaser-image::after`), /content: none;/, 'the photo untinted');
  assert.match(rules(css, `${F} .cards-teaser-image + .cards-teaser-body`), /top: 20px; right: 20px; left: 20px;/);
  assert.match(rules(css, `${F} .cards-teaser-body > .cards-teaser-title`), /font-size: 28px; line-height: 32px; font-weight: 700;/);
  assert.match(rules(css, `${F} .cards-teaser-cta`), /margin: 0; font-family: var\(--body-font-family\); font-size: 18px; line-height: 24px;/);
  const wide = after(css, `@media (width >= 768px) { ${F} > ul`);
  assert.match(rules(wide, `${F} > ul`), /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\); grid-template-rows: 265px 263px; gap: 20px 24px;/);
  assert.match(rules(wide, `${F} > ul > li:nth-child(1)`), /grid-row: 1 \/ 3;/);
  assert.match(rules(wide, `${F} > ul > li:nth-child(2)`), /grid-column: 2 \/ 4;/);
  assert.match(rules(wide, `${F} .cards-teaser-body > .cards-teaser-title`), /font-size: 32px; line-height: 36px;/);
});

test('eServices: www\'s slides, arrows and dots', () => {
  const css = read('blocks/carousel-cards/carousel-cards.css');
  const S = 'body.brand-cargo .carousel-cards.slides';
  assert.match(rules(css, `${S} .carousel-cards-slide`), /flex-basis: 100%; overflow: visible; border: 0; border-radius: 0; background: none; box-shadow: none;/);
  assert.match(rules(css, `${S} .carousel-cards-image`), /aspect-ratio: 16 \/ 9; border-radius: 5px;/);
  assert.match(rules(css, `${S} .carousel-cards-body`), /padding: 20px 0 0;/);
  assert.match(rules(css, `${S} .carousel-cards-body > h3`), /margin: 0 0 20px; font-size: 24px; font-weight: 300; line-height: 28px;/);
  assert.match(rules(css, `${S} .carousel-cards-cta a:any-link`), /color: #52627c; font-size: 18px; font-weight: 700; line-height: 24px;/);
  assert.match(rules(css, S), /padding-top: 42px;/, 'phones: the arrows above the slides');
  assert.match(rules(css, `${S} :is(.carousel-cards-prev, .carousel-cards-next)`), /top: 0; display: flex; width: 32px; height: 32px; border-radius: 4px; background-color: #ebebeb; color: #05164d;/);
  assert.match(rules(css, `${S} :is(.carousel-cards-prev, .carousel-cards-next):disabled`), /visibility: visible; background-color: #dcdcdc; color: #b4b4b4;/);
  assert.match(rules(css, `${S} .carousel-cards-dots`), /margin-top: 10px;/);
  const wide = after(css, `@media (width >= 1025px) { ${S} {`);
  assert.match(rules(wide, `${S} .carousel-cards-slide.carousel-cards-wide`), /flex-basis: calc\(\(100% - 24px\) \/ 2\);/, 'two to the row, wide or not');
  assert.match(rules(wide, `${S} .carousel-cards-track`), /gap: 24px;/);
  assert.match(rules(wide, `${S} :is(.carousel-cards-prev, .carousel-cards-next)`), /top: calc\(50% - 25px\); width: 50px; height: 50px;/);
  assert.match(rules(wide, `${S} .carousel-cards-prev`), /left: 8px;/);
  assert.match(rules(wide, `${S} .carousel-cards-body > h3`), /font-size: 28px; line-height: 32px;/);
  assert.match(rules(wide, `${S} .carousel-cards-dots`), /margin-top: 20px;/);
});

test('ULD: the photo 640 px high, the text on it as www\'s', () => {
  const css = read('blocks/hero-card-overlay/hero-card-overlay.css');
  const U = 'body.brand-cargo .hero-card-overlay.plain';
  assert.match(rules(css, U), /justify-content: center; min-height: 640px; aspect-ratio: auto;/);
  assert.match(rules(css, `${U} .hero-card-overlay-media`), /position: absolute; inset: 0; aspect-ratio: auto;/);
  assert.match(rules(css, `${U} .hero-card-overlay-card`), /width: 100%; max-width: var\(--content-max-width\); margin: 0 auto; padding: 20px var\(--layout-margin\); border-radius: 0; background: none; color: #05164d;/);
  assert.match(rules(css, `${U} .hero-card-overlay-card .hero-card-overlay-eyebrow`), /margin-bottom: 20px; font-size: 32px; font-weight: 300; line-height: 36px;/);
  assert.match(rules(css, `${U} .hero-card-overlay-card :is(h1, h2, h3, h4, h5, h6)`), /margin-bottom: 20px; color: #05164d; font-size: 28px; line-height: 32px;/);
  assert.match(rules(css, `${U} .hero-card-overlay-cta a:any-link:not(.button)`), /color: #52627c; font-family: var\(--body-font-family\); font-size: 18px; font-weight: 700; line-height: 24px;/);
  const wide = after(css, `@media (width >= 768px) { ${U} .hero-card-overlay-card {`);
  assert.match(rules(wide, `${U} .hero-card-overlay-card`), /padding: 40px var\(--layout-margin\);/);
  assert.match(rules(wide, `${U} .hero-card-overlay-card :is(h1, h2, h3, h4, h5, h6)`), /font-size: 32px; line-height: 36px;/);
});

test('the importer: the homepage\'s fleet, eServices and ULD with their options', async () => {
  const { convert } = await import('../tools/importer/cargo-import.mjs');
  const card = (n, label, href) => `<div class="lcagCard"><a href="${href}"><img src="/documents/20184/0/${n}.jpg/x" alt=""><div class="overlay"><h2>${n}</h2><p>${label}</p></div></a></div>`;
  const page = `<!DOCTYPE html><html lang="en-US"><head><title>Home - Lufthansa Cargo</title></head><body><div id="content" class="container pagebody">
<div class="journal-content-article"><div class="ourFleet"><div class="content"><h2>Our fleet</h2></div><div class="layout">${card('18', 'Boeing 777F', '/en/fleet-ulds/fleet')}${card('PAX', 'Aircraft bellies', '/en/fleet-ulds/fleet')}</div></div></div>
<div class="journal-content-article"><div class="eservicesWrapper whiteBgBox"><h2 class="slideTitle">Our eServices</h2><div class="owl-carousel"><div class="owl-item"><div class="item"><img src="/documents/20184/0/eb.jpg/x" alt=""><div class="slide-content"><h3 class="slide-headline">New eBooking</h3><p class="slide-text">Smart offers.</p><a href="/en/basic-information">Find out more</a></div></div></div></div></div></div>
<div class="journal-content-article"><div class="teaserULD"><picture><img src="/documents/20184/0/Teaser-ULD-Desktop%402x.jpg/x" alt="Teaser ULD"></picture><div class="overlay whiteBgBox"><h3 class="subtitle">The right ULDs for every cargo</h3><h2>We carry more than 30 different types of ULDs on your behalf</h2><a href="/en/fleet-ulds/ulds">Find your perfect ULD</a></div></div></div>
</div></body></html>`;
  const { html } = convert(page, '/en/home', 'en');
  assert.match(html, /<div class="cards-teaser overlay fleet">/);
  assert.match(html, /<div class="carousel-cards slides">/);
  assert.match(html, /<div class="hero-card-overlay plain">/);
});
