/* eslint-disable max-len, import/extensions */
/* Facts & Figures' key facts on phones, brief 442, item 2 (www's LCAGCP-lcagMobileFactsSlider, its
   phone copy, measured on cargo-parity-001 rendered with its own stylesheets at 390):
   - the importer writes www's phone slides after the desktop slides, in the key-facts section:
     carousel-cards (facts), one row per slide (the clones left out): its icon when lh-cargo's DA has
     it, its lines (www's h2: strong; the footnote as it is); then the slider's "Facts & Figures" link;
   - Cargo's theme below 768 px (www's md breakpoint): the band as tall as the phone photo
     (556 x 864), "Key Facts" at its top, the slides' lines 24/28.8 bold navy, centred, 10 px apart,
     one slide at a time; the arrows (48 px) either side of the dots (20 px rings, navy, the current
     one filled) in one row 100 px above the band's foot; the link 16 px navy, 16 px in, 30 px above
     the foot; the desktop slides hidden. From 768 px the desktop slider as before (the phone slides
     and the link hidden).
   Run: node --max-old-space-size=512 --test test/cargo-kf-phone-442.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const mobileSlide = (icon, lines, cloned = false) => `<div class="LCAGCP-mobileSlide slick-slide${cloned ? ' slick-cloned' : ''}"> <img class="LCAGCP-factIcon" src="${icon}"> <div class="LCAGCP-mobileFactsText"> ${lines} </div> </div>`;
const link = '<div class="container innerContainerRow LCAGCP-lcagFactsFooterContainer"><div class="row"><div class="LCAGCP-lcagFactsLink LCAGCP-lcagHeadlineColor-blue"><a href="/documents/20184/30686690/2025-Facts-Figures_EN.pdf/70559675-9dcc-839c-fc7f-88637459f111?t=1772777953975"> Facts &amp; Figures <span class="lcag-icon-lh-icon-arrow"></span> </a></div></div></div>';
const body = '<div class="journal-content-article">'
  + `<div class="container-fluid LCAGCP-lcagFactsSlider swiper d-none d-md-block"><div class="container innerContainerRow"><div class="LCAGCP-lcagFactsHeadline"> Key Facts </div></div><div class="parallax-bg" style="background-image: url(&quot;/documents/20184/30686690/Facts_BG_Paralaxe_01_864px.jpg/6ebb4286-d4b9-a83e-d579-a6788d3ec6f0&quot;);"></div><div class="swiper-wrapper"><div class="swiper-slide"><img src="/documents/20184/30686690/2025-Facts-EN-1.png/e40d0b6c"></div><div class="swiper-slide"><img src="/documents/20184/30686690/2025-Facts-EN-2.png/e40d0b6d"></div></div>${link}</div>`
  + '<div class="container-fluid LCAGCP-lcagMobileFactsSlider d-md-none" style="background:url(/documents/20184/30686690/Mobile_facts_BG_01.jpg/e7fa7316-6022-5de0-7cb5-8f6d0b209039) no-repeat;"><div class="container innerContainerRow LCAGCP-lcagFactsHeadContainer"><div class="row"><div class="LCAGCP-lcagFactsHeadline LCAGCP-lcagHeadlineColor-blue"> Key Facts </div><div class="LCAGCP-mobileFactsContainer"><div class="LCAGCP-mobileFactsSlides"><div class="slick-list"><div class="slick-track">'
  + mobileSlide('/documents/20184/30701803/lh-icon-earth-pin.svg/a1e06631', '<h2>More than</h2> <h2>350 destinations</h2>', true)
  + mobileSlide('', '<h2>14,450 m. freight tonne-kilometres offered</h2> <h2>&amp;</h2> <h2>9,103 m. freight tonne-kilometres sold</h2>')
  + mobileSlide('/documents/20184/30701803/lh-icon-airplane-booking.svg/47f7e603', '<h2>18*</h2> <h2>Boeing 777F</h2> <p>(*6 Boeing 777F are operated by the joint venture AeroLogic)</p>')
  + `</div></div></div></div></div></div>${link}</div>`
  + '</div>';
const page = `<!DOCTYPE html><html><head><title>Facts &amp; Figures - Lufthansa Cargo</title></head><body><div id="main-content"><div class="journal-content-article"><h1>Facts &amp; Figures</h1></div>${body}</div></body></html>`;

test('the importer: www\'s phone slides (no clones) as carousel-cards (facts) after the desktop slides, then the link, all in the key-facts section', async () => {
  const { convert } = await import('../tools/importer/cargo-import.mjs');
  const { html } = convert(page, '/en/ci/facts-figures', 'en');
  const section = html.match(/<div>(?:(?!<div><p><picture>)[\s\S])*?<h2>Key Facts<\/h2>[\s\S]*?<div class="section-metadata"><div><div>Style<\/div><div>key-facts<\/div><\/div><\/div>/);
  assert.ok(section, html);
  const s = section[0];
  assert.ok(s.indexOf('<div class="carousel-images">') < s.indexOf('<div class="carousel-cards facts">'), 'the desktop slides, then the phone slides');
  assert.match(s, /<div class="carousel-cards facts"><div><div><\/div><div><p><strong>14,450 m\. freight tonne-kilometres offered<\/strong><\/p><p><strong>&amp;<\/strong><\/p><p><strong>9,103 m\. freight tonne-kilometres sold<\/strong><\/p><\/div><\/div><div><div>(?:<picture>[\s\S]*?<\/picture>)?<\/div><div><p><strong>18\*<\/strong><\/p><p><strong>Boeing 777F<\/strong><\/p><p>\(\*6 Boeing 777F are operated by the joint venture AeroLogic\)<\/p><\/div><\/div><\/div>/);
  assert.doesNotMatch(s, /350 destinations/, 'www\'s slick clones left out');
  assert.match(s, /<\/div><p><a href="[^"]*2025-Facts-Figures_EN\.pdf[^"]*">Facts &amp; Figures<\/a><\/p><div class="section-metadata">/, 'the link once, last in the section');
  assert.equal((html.match(/2025-Facts-Figures_EN/g) || []).length, 1);
});

test('the theme below 768 px: www\'s phone slider; from 768 px the desktop slider as before', () => {
  const css = fs.readFileSync(new URL('../styles/themes/cargo.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  const has = (re, msg) => assert.ok(re.test(css), msg ? `${msg}: ${re}` : String(re));
  const K = 'body\\.brand-cargo main > \\.section\\.key-facts';
  has(new RegExp(`${K}:has\\(\\.carousel-cards\\.facts\\) \\{[^}]*display: flex;[^}]*flex-direction: column;[^}]*aspect-ratio: 556 / 864;`), 'the band as tall as the phone photo');
  has(new RegExp(`${K}:has\\(\\.carousel-cards\\.facts\\) > div \\{[^}]*width: 100%;[^}]*margin-inline: 0;`), 'each wrapper the band\'s width');
  has(new RegExp(`${K} \\.carousel-images-wrapper:has\\(~ \\.carousel-cards-wrapper \\.carousel-cards\\.facts\\) \\{[^}]*display: none;`), 'phones: no desktop slides when there are phone ones');
  has(new RegExp(`${K} \\.carousel-cards-wrapper:has\\(> \\.carousel-cards\\.facts\\) \\{[^}]*margin-top: auto;`), 'the slides and their row low in the band');
  has(new RegExp(`${K} \\.carousel-cards\\.facts \\{[^}]*display: flex;[^}]*flex-wrap: wrap;[^}]*align-items: center;[^}]*justify-content: center;`));
  has(new RegExp(`${K} \\.carousel-cards\\.facts :is\\(\\.carousel-cards-viewport, \\.carousel-cards-nav:not\\(\\[hidden\\]\\)\\) \\{[^}]*display: contents;`), 'the arrows and the dots in one row');
  has(new RegExp(`${K} \\.carousel-cards\\.facts \\.carousel-cards-slide \\{[^}]*flex: 0 0 100%;`), 'one slide at a time');
  has(new RegExp(`${K} \\.carousel-cards\\.facts \\.carousel-cards-body p \\{[^}]*margin: 10px 0;[^}]*color: #05164d;[^}]*text-align: center;`));
  has(new RegExp(`${K} \\.carousel-cards\\.facts \\.carousel-cards-body p:has\\(> strong\\) \\{[^}]*font-family: var\\(--heading-font-family\\);[^}]*font-size: 24px;[^}]*line-height: 28\\.8px;`));
  has(new RegExp(`${K} \\.carousel-cards\\.facts :is\\(\\.carousel-cards-prev, \\.carousel-cards-next\\) \\{[^}]*width: 48px;[^}]*height: 48px;`));
  has(new RegExp(`${K} \\.carousel-cards\\.facts \\.carousel-cards-prev \\{[^}]*order: 1;`));
  has(new RegExp(`${K} \\.carousel-cards\\.facts \\.carousel-cards-dots \\{[^}]*order: 2;`));
  has(new RegExp(`${K} \\.carousel-cards\\.facts \\.carousel-cards-next \\{[^}]*order: 3;`));
  has(new RegExp(`${K} \\.carousel-cards\\.facts \\.carousel-cards-dot \\{[^}]*width: 20px;[^}]*height: 20px;[^}]*border: 2px solid #05164d;`));
  has(new RegExp(`${K} \\.carousel-cards\\.facts \\.carousel-cards-dot::before \\{[^}]*content: none;`), 'the ring alone (no inner dot of the brands\' dots)');
  has(new RegExp(`${K} \\.carousel-cards-wrapper ~ \\.default-content-wrapper \\{[^}]*position: relative;[^}]*z-index: 2;[^}]*padding: 51px 16px 30px;`), 'the link 30 px above the foot');
  has(new RegExp(`@media \\(width >= 768px\\) \\{[^@]*${K}:has\\(\\.carousel-cards\\.facts\\) \\{[^}]*display: block;[^}]*aspect-ratio: auto;[^}]*\\}[^@]*${K} :is\\(\\.carousel-cards-wrapper:has\\(> \\.carousel-cards\\.facts\\), \\.carousel-cards-wrapper ~ \\.default-content-wrapper\\) \\{[^}]*display: none;[^}]*\\}[^@]*${K} \\.carousel-images-wrapper:has\\(~ \\.carousel-cards-wrapper \\.carousel-cards\\.facts\\) \\{[^}]*display: block;`), 'from 768 px the desktop slider, no phone slides, no link');
});
