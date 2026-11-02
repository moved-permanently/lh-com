/* eslint-disable max-len */
/* tools/importer/swiss-*.mjs (lh-swiss's import tooling): the menu's urldefense.com link unwrapped
   to its target, the footer document in www's order (columns, social row, logos, legal links;
   "Change Privacy Settings" the consent dialog), the cockpit deep link left on www, the document
   names of paths Edge Delivery refuses, the placeholders left out, the class C widgets as links to
   the page on www, the DAM download's block detection, the scope's left-out paths.
   Run: node --max-old-space-size=512 --test test/swiss-tools.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

/* eslint-disable import/extensions */
const {
  unwrapUrldefense, navDocument, footerDocument, linkFor,
} = await import('../tools/importer/swiss-nav.mjs');
const {
  docName, withoutPlaceholders, withLinkOuts, LINK_OUT, formIdOf, templateOf,
} = await import('../tools/importer/swiss-import.mjs');
const { isBlock, damFiles } = await import('../tools/importer/swiss-dam.mjs');
const { leftOut } = await import('../tools/importer/swiss-scope.mjs');
/* eslint-enable import/extensions */

const dcepAttr = (j) => JSON.stringify(j).replace(/&/g, '&amp;').replace(/"/g, '&quot;');

test('the menu\'s "Flight vouchers" through urldefense.com is its target; other links as they are', () => {
  const wrapped = 'https://urldefense.com/v3/__https:/www.swiss.com/ch/en/book-and-manage/offers/vouchers__;!!AaIhyw!tnTo6NHJ$';
  assert.equal(unwrapUrldefense(wrapped), 'https://www.swiss.com/ch/en/book-and-manage/offers/vouchers');
  assert.equal(unwrapUrldefense('/ch/en/fly'), '/ch/en/fly');
  const menu = {
    id: 'common-header-nav-horizontal',
    menuItems: [{ label: 'My booking', menuItems: [{ label: 'Extra services', href: '/ch/en/book-and-manage/overview-extra-services', menuItems: [{ label: 'Flight vouchers', href: wrapped }, { label: 'My flights', href: '/deeplink/cockpit?country=CH&language=EN' }] }] }, { label: 'Discover SWISS', menuItems: [{ label: 'SWISS Magazine', href: 'https://swiss.com/magazine/en', menuItems: [{ label: 'Travel', href: '/magazine/en/travel' }] }] }],
  };
  const { document } = parseHTML(`<html><body><header><div data-dcep="${dcepAttr(menu)}"></div></header></body></html>`);
  const doc = navDocument(document, 'ch/en', new Set(['/ch/en/book-and-manage/offers/vouchers']));
  assert.match(doc, /<a href="\/ch\/en\/book-and-manage\/offers\/vouchers">Flight vouchers<\/a>/);
  assert.ok(!doc.includes('urldefense'));
  assert.match(doc, /<a href="https:\/\/www\.swiss\.com\/deeplink\/cockpit\?country=CH&amp;language=EN">My flights<\/a>/, 'the cockpit stays on www (no host serves the login yet)');
  assert.match(doc, /<a href="https:\/\/swiss\.com\/magazine\/en">SWISS Magazine<\/a>/, 'an absolute link as www has it');
  assert.match(doc, /<a href="https:\/\/www\.swiss\.com\/magazine\/en\/travel">Travel<\/a>/, 'the magazine sub-site on www');
  assert.equal(linkFor('/corporate/en/careers', new Set()), 'https://www.swiss.com/corporate/en/careers');
});

test('the footer document in www\'s order: columns, social row, logos, then the legal links', () => {
  const { document } = parseHTML(`<html><body><footer><div class="swiss-footer"><div class="swiss-link-content"><div class="link-list nav-link-list"><span class="hidden-sm-down"><h3>About us</h3></span><ul class="vertical"><li><a href="/corporate/en/careers">Careers</a></li><li><maui-tooltip><a href="https://business.lufthansagroup.com/">Lufthansa Group for Business<span class="sr-only"> new tab</span></a><div slot="box">note</div></maui-tooltip></li></ul></div></div>
    <div class="swiss-social-links"><div class="link-list"><ul class="horizontal"><li><a href="https://x.com/FlySWISS"><img src="/content/dam/lx/icons/footer-x.svg" alt="X"></a></li></ul></div></div></div>
    <div class="subfooter"><maui-navigation-link class="logo" href="https://www.swiss.com"><img src="/etc/designs/lx/clientlib-all/vite/img/swiss-logo.svg" alt="Swiss logo, back to homepage"></maui-navigation-link><maui-navigation-link class="lhg-logo" href="https://www.lufthansagroup.com"><img src="/etc/designs/dcep/clientlib-all/vite/img/member-of-lhg.svg" alt="Member of Lufthansa Group"></maui-navigation-link>
    <div class="swiss-site-navigation"><div class="link-list"><ul class="horizontal"><li><a href="/ch/en/terms-conditions/imprint">Imprint</a></li><li></li><li><a href="#" onclick="OneTrust.ToggleInfoDisplay()">Change Privacy Settings</a></li></ul></div></div>
    <maui-navigation-link class="star-alliance-logo-wrapper" href="https://www.staralliance.com/"><maui-graphic class="star-alliance-logo"></maui-graphic></maui-navigation-link></div></footer></body></html>`);
  const doc = footerDocument(document, new Set(['/ch/en/terms-conditions/imprint']));
  const sections = doc.trim().split('\n<div>').length;
  assert.equal(sections, 4);
  const at = (s) => doc.indexOf(s);
  assert.ok(at('Careers') < at('footer-x.svg') && at('footer-x.svg') < at('swiss-logo.svg') && at('swiss-logo.svg') < at('member-of-lhg.svg') && at('member-of-lhg.svg') < at(':star-alliance:') && at(':star-alliance:') < at('Imprint'), 'columns, social, logos, legal');
  assert.match(doc, /<a href="https:\/\/business\.lufthansagroup\.com\/">Lufthansa Group for Business<\/a>/, 'the tooltip link without its screen-reader note');
  assert.match(doc, /<div class="section-metadata"><div><div>Style<\/div><div>badges<\/div><\/div><\/div>/);
  assert.match(doc, /<a href="#privacy-settings">Change Privacy Settings<\/a>/);
  assert.match(doc, /<a href="\/ch\/en\/terms-conditions\/imprint">Imprint<\/a>/);
  assert.match(doc, /<img src="https:\/\/www\.swiss\.com\/content\/dam\/lx\/icons\/footer-x\.svg" alt="X">/);
});

test('document names of paths Edge Delivery refuses: lower case, single hyphens, & as and', () => {
  assert.equal(docName('/ch/en/various/GVA-2022-Inspiration'), '/ch/en/various/gva-2022-inspiration');
  assert.equal(docName('/us/en/local-pages/baggage-&-other-fees'), '/us/en/local-pages/baggage-and-other-fees');
  assert.equal(docName('/ch/en/local-page/thank-you-for-your-subscription-'), '/ch/en/local-page/thank-you-for-your-subscription');
  assert.equal(docName('/ch/fr/local-page/conditions---concours'), '/ch/fr/local-page/conditions-concours');
  assert.equal(docName('/ch/en/fly/check-in'), '/ch/en/fly/check-in', 'a valid path as it is');
  assert.equal(formIdOf('/ch/de/customer-support/contact-us/general-request'), 'swiss-general-request');
});

test('placeholders left out; the class C widgets a link to the page on www with their intro', () => {
  const html = '<div class="section"><div class="inpagewidget event section">  </div><div class="ghost">  </div><div class="wrapper section"> <div class="dcep-react-wrapper" data-dcep="{ &quot;wcTag&quot;: &quot;ppfi-web-component&quot; }"><ppfi-web-component></ppfi-web-component></div></div><div class="text section"><p>kept</p></div></div>';
  const out = withoutPlaceholders(html);
  assert.ok(!/inpagewidget|ghost|ppfi/.test(out), out);
  assert.match(out, /<p>kept<\/p>/);
  const login = '<h1>Voluntary rebooking</h1><div class="loginform section"><div class="dcep-login-form" data-dcep="{}"><div><div class="container-gray"><div class="richtext"><p>You can log in with your Travel ID or your booking code.</p></div><div class="row"><form></form></div></div></div></div></div>';
  const lo = withLinkOuts(login, '/ch/en/book-and-manage/rebook/voluntary-rebooking');
  assert.ok(!lo.includes('dcep-login-form'));
  assert.match(lo, new RegExp(`<p>You can log in with your Travel ID or your booking code\\.</p><p><a href="https://${LINK_OUT}/ch/en/book-and-manage/rebook/voluntary-rebooking">Voluntary rebooking</a></p>`));
  const pax = withLinkOuts('<h1>Passenger receipt</h1><div class="wrapper section">  <passenger-receipt-portal><div id="root"></div></passenger-receipt-portal></div>', '/ch/en/book-and-manage/pax-receipt');
  assert.ok(!pax.includes('passenger-receipt-portal'));
  assert.match(pax, /Passenger receipt<\/a>/);
  // the iframes the embed block plays stay; www's AR viewer is a link
  const frames = withLinkOuts('<h1>Premium</h1><div class="iframe commonevent section"><div class="iframe-wrapper"><iframe src="https://www.google.com/maps/embed?pb=!1m18"></iframe></div></div><div class="iframe commonevent section"><div class="iframe-wrapper"><iframe src="https://www.swiss.com/sitemap/lx/arlink/v3/index_en.html"></iframe></div></div>', '/ch/en/p');
  assert.match(frames, /maps\/embed/);
  assert.match(frames, /iframe-link-out/);
  assert.equal(templateOf('/ch/en/culinaryjourney', '<div class="wrapper section"><culinary-hub></culinary-hub></div>'), 'mfe');
  assert.equal(withLinkOuts('<div class="checkindeadlinesearch section"><div class="dcep-checkin-deadline-search"></div></div>', '/ch/en/x').includes('checkindeadlinesearch'), true, 'the deadline search is lh-com\'s block');
});

test('the DAM download stops at a block: 403, 429, 503, Cloudflare\'s challenge, an HTML page for a file', () => {
  const h = (o) => new Headers(o);
  assert.ok(isBlock(403, h({}), '/content/dam/lx/x.jpg'));
  assert.ok(isBlock(429, h({}), '/content/dam/lx/x.jpg'));
  assert.ok(isBlock(503, h({}), '/content/dam/lx/x.jpg'));
  assert.ok(isBlock(200, h({ 'cf-mitigated': 'challenge' }), '/content/dam/lx/x.jpg'));
  assert.ok(isBlock(200, h({ 'content-type': 'text/html; charset=utf-8' }), '/content/dam/lx/x.pdf'));
  assert.ok(!isBlock(200, h({ 'content-type': 'image/jpeg' }), '/content/dam/lx/x.jpg'));
  assert.ok(!isBlock(404, h({ 'content-type': 'text/html' }), '/content/dam/lx/x.jpg'), 'a 404 is www\'s answer, no block');
  const files = damFiles('<p><picture><img src="https://www.swiss.com/content/dam/lx/images/a.jpg.transform/lh-dcep-transform-width-2560/img.jpg" alt=""></picture></p><p><img src="https://www.swiss.com/etc/designs/dcep/logo-lx-og.jpg"></p><p><img src="https://www.swiss.com/undefined.transform/lh-dcep-transform-width-180/img.jpg"></p><a href="/content/dam/lx/pdfs/a%20b.pdf">PDF</a>');
  assert.deepEqual(files, [['/content/dam/lx/pdfs/a b.pdf', 'link'], ['/content/dam/lx/images/a.jpg.transform/lh-dcep-transform-width-2560/img.jpg', 'image'], ['/etc/designs/dcep/logo-lx-og.jpg', 'image']]);
});

test('an image switched to its place in DA is still one of the document\'s files', () => {
  assert.deepEqual(damFiles('<p><img src="https://content.da.live/moved-permanently/lh-swiss/content/dam/lx/images/a-b.jpg" alt=""></p>'), [['/content/dam/lx/images/a-b.jpg', 'image']]);
  assert.deepEqual(damFiles('<p><img src="https://content.da.live/moved-permanently/lh-other/content/dam/x.jpg"></p>'), []);
});

test('the hero\'s video: www\'s moving image of the hero picture linked in the hero, its /content/dam path', async () => {
  // eslint-disable-next-line import/extensions
  const { withHeroVideo } = await import('../tools/importer/swiss-import.mjs');
  const snap = '<div class="mainstageteaser" data-dcep="{&quot;movingImage&quot;:{&quot;imageUrl&quot;:&quot;/content/dam/lx/images/frontify_variations/6/c-1455672767-478966716.jpg&quot;,&quot;videoUrl&quot;:&quot;/content/dam/lx/video/Bengaluru Header Video_8017471.mp4&quot;}}"></div>';
  const doc = '<div><div class="hero-card-overlay light"><div><div><picture><img src="https://content.da.live/moved-permanently/lh-swiss/content/dam/lx/images/frontify_variations/6/c-1455672767-478966716.jpg" alt=""></picture></div></div><div><div><h2>Bengaluru</h2></div></div></div></div>';
  const out = withHeroVideo(doc, snap);
  assert.match(out, /<\/picture><p><a href="\/content\/dam\/lx\/video\/bengaluru-header-video-8017471\.mp4">\/content\/dam\/lx\/video\/bengaluru-header-video-8017471\.mp4<\/a><\/p><\/div>/);
  assert.equal(withHeroVideo(out, snap), out, 'once');
  assert.equal(withHeroVideo(doc, snap.replace('Bengaluru Header Video_8017471.mp4', '')), doc, 'no video: as it is');
  const other = doc.replace('c-1455672767-478966716', 'c-1');
  assert.equal(withHeroVideo(other, snap), other, 'another picture: as it is');
});

test('the scope leaves out AirCore, /lhg/, the shells, placeholders and www\'s redirects', () => {
  ['/lhg/ch/en', '/aircore/sitemaps/x', '/ch/en/null/x', '/ch/ko/homepage', '/xx/de/homepage', '/ch/en/profile/login', '/ch/en/enrollment', '/ch/en/homepage/teasers/x', '/ch/en/customer-support/chatbot', '/ch/en/book-and-manage/passenger-receipt', '/ch/en/customer-support/refund']
    .forEach((p) => assert.ok(leftOut(p), p));
  assert.equal(leftOut('/ch/de/customer-support/refund'), '', 'ch/de\'s refund is a page (the voucher exchange login)');
  assert.equal(leftOut('/ch/en/fly/check-in'), '');
});
