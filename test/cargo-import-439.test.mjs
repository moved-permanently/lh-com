/* eslint-disable max-len, import/extensions */
/* Lufthansa Cargo's importer (tools/importer/cargo-import.mjs), brief 439 (cargo-media-002: the
   pictures www's components draw as backgrounds, now in lh-cargo's DA):
   - Facts & Figures' key facts slider (LCAGCP-lcagFactsSlider) in a section of its own, style
     key-facts: the slider's photo (.parallax-bg) and the phone slider's (its sibling
     LCAGCP-lcagMobileFactsSlider, www's phone copy) first, then the heading and the slides;
   - the history timeline (LCAGCP-lcagEventSlider) in a section of style timeline, its photo
     (data-backgroundimage) before the cards;
   - Support & Contact's "Contact us" card with its photo (.imageBox) after the button.
   Cargo's theme draws the photos (styles/themes/cargo.css). A file lh-cargo's DA has is written as
   its DA copy (/media-da/cargo/...), else as www's URL: both are accepted. Run: node --test test/cargo-import-439.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';

const wrap = (body, h1 = 'Facts &amp; Figures') => `<!DOCTYPE html><html><head><title>${h1} - Lufthansa Cargo</title></head><body><div id="main-content"><div class="journal-content-article"><h1>${h1}</h1></div>${body}</div></body></html>`;
const meta = (style) => `<div class="section-metadata"><div><div>Style</div><div>${style}</div></div></div>`;

test('the key facts slider: a section of style key-facts with the photo, the phone photo, the heading and the slides', async () => {
  const { convert } = await import('../tools/importer/cargo-import.mjs');
  const slide = (n) => `<div class="swiper-slide"><img src="/documents/20184/30686690/2025_Facts_EN_${n}.png/a${n}"></div>`;
  const body = '<div class="journal-content-article">'
    + `<div class="container-fluid LCAGCP-lcagFactsSlider swiper d-none d-md-block"><div class="container innerContainerRow"><div class="LCAGCP-lcagFactsHeadline LCAGCP-lcagHeadlineColor-blue"> Key Facts </div></div><div class="parallax-bg" style="background-image: url(&quot;/documents/20184/30686690/Facts_BG_Paralaxe_01_864px.jpg/6ebb4286-d4b9-a83e-d579-a6788d3ec6f0?t=1665396386000&quot;);"></div><div class="swiper-wrapper">${slide(1)}${slide(2)}</div></div>`
    + '<div class="container-fluid LCAGCP-lcagMobileFactsSlider d-md-none" style="background:url(/documents/20184/30686690/Mobile_facts_BG_01.jpg/e7fa7316-6022-5de0-7cb5-8f6d0b209039?t=1665396386000) no-repeat;"><div class="LCAGCP-lcagFactsHeadline">Key Facts</div></div>'
    + '</div>';
  const { html } = convert(wrap(body), '/en/ci/facts-figures', 'en');
  assert.match(html, /<div><p><picture><img src="[^"]*(?:Facts_BG_Paralaxe_01_864px|facts-bg-paralaxe-01-864px)[^"]*" alt=""><\/picture><\/p><p><picture><img src="[^"]*(?:Mobile_facts_BG_01|mobile-facts-bg-01)[^"]*" alt=""><\/picture><\/p><h2>Key Facts<\/h2><div class="carousel-images">/, html);
  assert.match(html, new RegExp(`Key Facts</h2><div class="carousel-images">[\\s\\S]*?${meta('key-facts')}`), html);
  assert.equal((html.match(/Key Facts/g) || []).length, 1, 'the heading once (the phone slider is www\'s phone copy)');
});

test('the history timeline: a section of style timeline with its photo before the cards', async () => {
  const { convert } = await import('../tools/importer/cargo-import.mjs');
  const ev = (y) => `<div class="timeline__item"><div class="LCAGCP-lcagEventText"><h1>${y}</h1><h3>Event ${y}</h3><p>Text ${y}.</p></div></div>`;
  const body = `<div class="container-fluid LCAGCP-lcagEventSlider" data-backgroundimage="/documents/20184/30686690/History_Slider_BG.jpg/59a3f6ac-9bfb-1869-ef04-7ee1c5a9c5e6?t=1665396386000" style="background-image: url(&quot;/documents/20184/30686690/History_Slider_BG.jpg/59a3f6ac-9bfb-1869-ef04-7ee1c5a9c5e6?t=1665396386000&quot;);"><div class="timeline">${ev('1926')}${ev('1928')}</div></div>`;
  const { html } = convert(wrap(body), '/en/ci/facts-figures', 'en');
  assert.match(html, new RegExp(`<div><p><picture><img src="[^"]*(?:History_Slider_BG|history-slider-bg)[^"]*" alt=""></picture></p><div class="carousel-cards timeline">[\\s\\S]*?</div>${meta('timeline')}`), html);
});

test('Support & Contact: the "Contact us" card with its photo after the button, in the contact section', async () => {
  const { convert } = await import('../tools/importer/cargo-import.mjs');
  const card = '<div id="portlet_com_lhcargo_eportal_contact_support_web"><div class="contactSupportWrapper"><div class="contactBox d-flex align-items-center blueBg"><div><h3>Contact us</h3><p>Do you have a question?</p><button class="btn contactBtn" type="button"><span class="lfr-btn-label">Open contact form</span></button></div></div><div class="imageBox"><img src="https://www.lufthansa-cargo.com/documents/20184/042b0cfe-5e6c-74b0-8652-a93835861949"></div></div></div>';
  const { html } = convert(wrap(card, 'Support &amp; Contact'), '/en/support-and-contact', 'en');
  assert.match(html, new RegExp(`<h2>Contact us</h2><p>Do you have a question\\?</p><p><strong><a href="/modals/contact-us">Open contact form</a></strong></p><p><picture><img src="[^"]*042b0cfe-5e6c-74b0-8652-a93835861949[^"]*" alt=""></picture></p>${meta('contact')}`), html);
});
