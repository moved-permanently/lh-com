/* eslint-disable max-len, import/extensions -- dev tooling */
/* Austrian's icon steps (/at/en/book/flights/giftvoucher "How does it work?", parity row 40, brief 438): www's
   three-column view of a.teaser.partner (a 32 px icon in the title, no card) sits in a .carousel (a desktop row
   .hidden-md-down and a .hidden-lg-up swiper copy), so lh-com's info importer took it for teaser cards
   (carousel-cards: the icons full width in cards, +1,779 px at 390); its cards-icon-text partner rows want
   ".threecolumn > .column-view > .row > .column-view-item > .teaser > a.teaser.partner".
   withPartnerCarousels: a column view of partner teasers only (no a.teaser.card) gets its desktop row out of the
   carousel, the swiper copy dropped. String-based, the rest of the snapshot as it was.
   Run: node --max-old-space-size=512 --test test/austrian-partner-steps.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const partner = (t) => `<div class="teaser event section"><a class="teaser partner "><h4 class="heading-copytext-large teaser-heading"><img class="icon icon-svg" src="/content/dam/aua/icons/x_32px.svg" alt="x"><div class="teaser-heading-text">${t}</div></h4></a></div>`;
const card = '<div class="teaser event section"><a href="/x" class="teaser card "><h4 class="teaser-heading">C</h4></a></div>';
const row = (items) => `<div class="row">${items.map((i) => `<div class="col-md-6 col-lg column-view-item">${i}</div>`).join('')}</div>`;
const carousel = (items) => `<div class="carousel"><div class="hidden-md-down">${row(items)}</div><div class="hidden-lg-up"><div><div class="swiper"><div class="swiper-wrapper">${items.map((i) => `<div class="swiper-slide">${i}</div>`).join('')}</div></div></div></div></div>`;
const view = (inner) => `<div class="threecolumn column event section"><div class="column-view flex-column container-gray full-width-bg">${inner}</div></div>`;

test('partner teasers in a carousel: the desktop row in the column view, the swiper copy gone', async () => {
  const { withPartnerCarousels } = await import('../tools/importer/austrian-import.mjs');
  const items = [partner('1. Select amount'), partner('2. Get Gift Card code'), partner('3. Redeem Gift Card')];
  assert.equal(withPartnerCarousels(`<p>a</p>${view(carousel(items))}<p>b</p>`), `<p>a</p>${view(row(items))}<p>b</p>`);
  // the column view's title (cards-icon-text keeps none) before the view, in a one-column view of its own
  // (the band's section keeps its column-view style: every part a column view)
  const title = '<div>\n<h2 class="heading-medium  ">How does it work?</h2>\n</div>';
  assert.equal(withPartnerCarousels(view(`${title}\n${carousel(items)}`)), `<div class="onecolumn column event"><div class="column-view flex-column">${title}</div></div>${view(row(items))}`);
});

test('the theme: the steps\' copy Portada 18 / 27 as www\'s .teaser.partner .desc-inline', () => {
  const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
  assert.match(css, /body\.brand-austrian \.cards-icon-text\.partner \.cards-icon-text-body > p \{ font-family: var\(--heading-font-family\); font-size: 18px; line-height: 27px; \}/);
});

test('teaser cards, a mix, or partners without a carousel as they were', async () => {
  const { withPartnerCarousels } = await import('../tools/importer/austrian-import.mjs');
  const cards = view(carousel([card, card]));
  assert.equal(withPartnerCarousels(cards), cards);
  const mixed = view(carousel([partner('a'), card]));
  assert.equal(withPartnerCarousels(mixed), mixed);
  const plain = view(row([partner('a'), partner('b')]));
  assert.equal(withPartnerCarousels(plain), plain);
});

test('the snapshot of /at/en/book/flights/giftvoucher: its steps as lh-com\'s partner rows find them', async (t) => {
  const f = new URL('../tools/importer/bd-snapshots/www.austrian.com/at/en/book/flights/giftvoucher.html', import.meta.url);
  if (!fs.existsSync(f)) { t.skip('no snapshot'); return; }
  const { withPartnerCarousels } = await import('../tools/importer/austrian-import.mjs');
  const out = withPartnerCarousels(fs.readFileSync(f, 'utf8'));
  assert.equal((out.match(/service-mail_32px/g) || []).length, 1, 'the swiper copy gone');
  // the first step's open ancestors' classes, nearest last
  const i = out.indexOf('service-offline-payment_32px');
  const stack = [];
  [...out.slice(0, i).matchAll(/<(\/?)div\b([^>]*)>/g)].forEach((m) => {
    if (m[1]) stack.pop(); else stack.push(((m[2].match(/class="([^"]*)"/) || [])[1] || '-').split(/\s+/)[0] || '-');
  });
  assert.deepEqual(stack.slice(-5), ['threecolumn', 'column-view', 'row', 'col-md-6', 'teaser']);
});

test('the import reads the snapshot with it, before the teaser columns', () => {
  const src = fs.readFileSync(new URL('../tools/importer/austrian-import.mjs', import.meta.url), 'utf8');
  assert.match(src, /withTeaserColumns\(withPartnerCarousels\(withCheckinTabs\(/);
});
