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
  assert.match(doc, /<a href="\/ch\/en\/login">My flights<\/a>/, 'www\'s cockpit deep link: the root\'s own login page (swiss.turnsthe.page serves it since 2026-11-02)');
  assert.ok(!doc.includes('/deeplink/cockpit'));
  // a root whose login page the site does not serve (ch/fr, ch/it): www's cockpit deep link stays
  // (the served /deeplink/cockpit makes it relative)
  const frMenu = { id: 'common-header-nav-horizontal', menuItems: [{ label: 'Mon voyage', menuItems: [{ label: 'Extra', href: '/ch/fr/x', menuItems: [{ label: 'Mes vols', href: '/deeplink/cockpit?country=CH&language=FR' }] }] }] };
  const { document: fr } = parseHTML(`<html><body><header><div data-dcep="${dcepAttr(frMenu)}"></div></header></body></html>`);
  assert.match(navDocument(fr, 'ch/fr', new Set()), /<a href="https:\/\/www\.swiss\.com\/deeplink\/cockpit\?country=CH&amp;language=FR">Mes vols<\/a>/);
  assert.match(doc, /<a href="https:\/\/swiss\.com\/magazine\/en">SWISS Magazine<\/a>/, 'an absolute link as www has it');
  assert.match(doc, /<a href="https:\/\/www\.swiss\.com\/magazine\/en\/travel">Travel<\/a>/, 'the magazine sub-site on www');
  assert.equal(linkFor('/corporate/en/careers', new Set()), 'https://www.swiss.com/corporate/en/careers');
});

test('the nav\'s cart: www\'s empty-cart dialog (title, text, link) as the cart item\'s sub-list, its link the offers', () => {
  // (www's modal at the end of the body, outside the header, as maui-modal portals it)
  const cart = '<div class="dcep-shopping-cart" role="presentation"><div class="shopping-cart-button"><maui-icon-button icon="shopping-cart" name="Shopping cart preview " behavior="button"></maui-icon-button></div></div>';
  const modal = '<maui-modal class="modal-size-l" title="Your cart is empty" label="Your cart is empty"><maui-copy size="m">Explore our offers and destinations to discover the incredible places we can take you.</maui-copy><maui-button-link type="secondary" href="/ch/en/offers">Explore all offers</maui-button-link></maui-modal>';
  const other = '<maui-modal class="modal-size-l" title="Country and language"><maui-button-link href="/ch/de/homepage">x</maui-button-link></maui-modal>';
  const { document } = parseHTML(`<html><body><header><div data-dcep="${dcepAttr({ menuItems: [] })}"></div>${cart}</header><main></main>${other}${modal}</body></html>`);
  const doc = navDocument(document, 'ch/en', new Set(['/ch/en/offers']));
  assert.match(doc, /<li>:cart: <a href="\/ch\/en\/offers">Shopping cart preview<\/a>\n<ul>\n<li>Your cart is empty<\/li>\n<li>Explore our offers and destinations to discover the incredible places we can take you\.<\/li>\n<li><a href="\/ch\/en\/offers">Explore all offers<\/a><\/li>\n<\/ul><\/li>/);
  const { document: bare } = parseHTML(`<html><body><header><div data-dcep="${dcepAttr({ menuItems: [] })}"></div><div class="dcep-shopping-cart"><maui-icon-button name="Shopping cart preview"></maui-icon-button></div></header></body></html>`);
  assert.match(navDocument(bare, 'ch/en', new Set()), /<li>:cart: <a href="https:\/\/www\.swiss\.com\/ch\/en\/homepage">Shopping cart preview<\/a><\/li>/, 'no dialog in the snapshot: as before');
});

test('lh-swiss.json served: the cockpit deep link, the login and profile pages of both roots (as Brussels\'), nothing else', async () => {
  // eslint-disable-next-line import/extensions
  const { ownServed } = await import('../tools/importer/own-links.mjs');
  const served = ownServed('lh-swiss');
  const ok = (x) => served.some((re) => re.test(x));
  ['/deeplink/cockpit', '/ch/en/login', '/ch/de/login', '/ch/en/profile/travel-cockpit', '/ch/de/profile/bookinglist', '/ch/en/profile/account-statement', '/ch/en/profile/my-account', '/ch/de/profile/my-account/personal-data', '/ch/en/profile/travel-id/change-password']
    .forEach((x) => assert.ok(ok(x), x));
  ['/ch/fr/login', '/ch/en/profile', '/ch/en/profile/other', '/ch/en/homepage', '/deeplink/booking'].forEach((x) => assert.ok(!ok(x), `not ${x}`));
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
  // ch/zh's social icon has an empty alt and www's title "Twitter": the title names the link
  const zh = parseHTML('<html><body><footer><div class="swiss-social-links"><ul class="horizontal"><li><a href="https://x.com/FlySWISS"><img class="icon icon-svg" src="/content/dam/lx/icons/footer-x.svg" alt="" title="Twitter"></a></li></ul></div></footer></body></html>').document;
  assert.match(footerDocument(zh, new Set()), /<img src="https:\/\/www\.swiss\.com\/content\/dam\/lx\/icons\/footer-x\.svg" alt="Twitter">/);
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

test('tab sets that hold blocks: a marker before each panel and after the set; text-only sets as before', async () => {
  // eslint-disable-next-line import/extensions
  const { withTabMarkers } = await import('../tools/importer/swiss-import.mjs');
  const panel = (name, body) => `<maui-tab-control-panel-responsive name="${name}" data-identifier="1"><div>${body}</div></maui-tab-control-panel-responsive>`;
  const set = (panels) => `<div class="tabs panelcontainer section"><div class="maui-tab-control-jquery" id="tabs"><maui-tab-control-responsive>${panels}</maui-tab-control-responsive></div></div>`;
  const html = `<div class="text section"><p>before</p></div>${set(panel('Europe', '<div class="twocolumn column section">A</div>') + panel('Intercontinental', '<div class="table section">B</div>'))}<p>after</p>${set(panel('Work space', '<div class="text section">t</div>') + panel('Rest area', '<div class="text section">u</div>'))}`;
  const out = withTabMarkers(html);
  assert.ok(!out.includes('maui-tab-control-panel-responsive name="Europe"'), 'the block set is unwrapped');
  const marks = [...out.matchAll(/<p>(@@tab[^<]*)<\/p>/g)].map((m) => m[1]);
  assert.deepEqual(marks, ['@@tab@@1@@Europe@@', '@@tab@@1@@Intercontinental@@', '@@tabs-end@@']);
  assert.ok(out.indexOf('Europe@@') < out.indexOf('twocolumn') && out.indexOf('twocolumn') < out.indexOf('Intercontinental@@') && out.indexOf('table section') < out.indexOf('@@tabs-end@@'));
  assert.match(out, /maui-tab-control-panel-responsive name="Work space"/, 'a text-only set stays (profile-tabs)');
});

test('the markers become Tab sections: the content before, a section per panel with its label, the rest after', async () => {
  // eslint-disable-next-line import/extensions
  const { splitTabSections } = await import('../tools/importer/swiss-import.mjs');
  const doc = '<div><h1>Economy</h1><p>@@tab@@1@@Europe@@</p><h2>Europe</h2><div class="columns-media"><div><div>a</div></div></div><p>@@tab@@1@@Intercontinental@@</p><div class="table-striped"><div><div>b</div></div></div><p>@@tabs-end@@</p><p>after</p></div>\n<div><p>next</p><div class="metadata"><div><div>nav</div><div>/ch/en/nav</div></div></div></div>';
  const out = splitTabSections(doc);
  const sections = out.split('\n');
  assert.equal(sections.length, 5);
  assert.equal(sections[0], '<div><h1>Economy</h1></div>');
  assert.equal(sections[1], '<div><h2>Europe</h2><div class="columns-media"><div><div>a</div></div></div><div class="section-metadata"><div><div>Tab</div><div>Europe</div></div><div><div>Tabs</div><div>1</div></div></div></div>');
  assert.equal(sections[2], '<div><div class="table-striped"><div><div>b</div></div></div><div class="section-metadata"><div><div>Tab</div><div>Intercontinental</div></div><div><div>Tabs</div><div>1</div></div></div></div>');
  assert.equal(sections[3], '<div><p>after</p></div>');
  assert.match(sections[4], /<p>next<\/p>/);
  assert.ok(!out.includes('@@'), 'no marker left');
  // a section's own metadata (Style) stays with its parts outside the set
  const styled = splitTabSections('<div><p>x</p><p>@@tab@@1@@A@@</p><p>a</p><p>@@tabs-end@@</p><p>y</p><div class="section-metadata"><div><div>Style</div><div>grey</div></div></div></div>');
  assert.equal(styled.split('\n').filter((s) => s.includes('<div>Style</div><div>grey</div>')).length, 2);
  assert.equal(splitTabSections('<div><p>plain</p></div>'), '<div><p>plain</p></div>', 'no markers: as it is');
  // the import's cleanup writes the text style after the marker ("{full-width}")
  const styledMarks = splitTabSections('<div><p>@@tab@@2@@A@@ {full-width}</p><p>a</p><p>@@tab@@2@@B@@ {full-width}</p><p>b</p><p>@@tabs-end@@ {full-width}</p></div>');
  assert.equal(styledMarks, '<div><p>a</p><div class="section-metadata"><div><div>Tab</div><div>A</div></div><div><div>Tabs</div><div>2</div></div></div></div>\n<div><p>b</p><div class="section-metadata"><div><div>Tab</div><div>B</div></div><div><div>Tabs</div><div>2</div></div></div></div>');
  assert.ok(!splitTabSections('<div><div class="columns-media"><div><div><p>@@tab@@1@@A@@ {full-width}</p></div></div></div></div>').includes('@@'), 'a marker inside a block goes');
});

test('the flight search\'s moving image: Background image and Background video rows, the video\'s /content/dam path', async () => {
  // eslint-disable-next-line import/extensions
  const { withFlightSearchVideo } = await import('../tools/importer/swiss-import.mjs');
  const snap = '<div class="redesignedflightmanager" data-dcep="{&quot;promotionTeaser&quot;:{&quot;linkModeConfig&quot;:{&quot;movingImage&quot;:{&quot;imageUrl&quot;:&quot;/content/dam/lx/images/frontify_variations/6/c-1455672767-478966716.jpg&quot;,&quot;videoUrl&quot;:&quot;/content/dam/lx/video/Bengaluru Header Video_8017471.mp4&quot;}}}}"></div>';
  const doc = '<div><div class="flight-search standalone"><div><div>Shop</div><div>x</div></div></div></div>';
  const out = withFlightSearchVideo(doc, snap);
  assert.equal(out, '<div><div class="flight-search standalone"><div><div>Background image</div><div><picture><img src="https://www.swiss.com/content/dam/lx/images/frontify_variations/6/c-1455672767-478966716.jpg" alt=""></picture></div></div><div><div>Background video</div><div><a href="/content/dam/lx/video/bengaluru-header-video-8017471.mp4">/content/dam/lx/video/bengaluru-header-video-8017471.mp4</a></div></div><div><div>Shop</div><div>x</div></div></div></div>');
  assert.equal(withFlightSearchVideo(out, snap), out, 'once');
  assert.equal(withFlightSearchVideo(doc, '<div></div>'), doc, 'no moving image: as it is');
  const hero = '<div><div class="hero-card-overlay"><div><div>x</div></div></div></div>';
  assert.equal(withFlightSearchVideo(hero, snap), hero, 'no flight search: as it is');
  const homepage = `${doc}<div><div class="hero-card-overlay"><div><div>x</div></div></div></div>`;
  assert.equal(withFlightSearchVideo(homepage, snap), homepage, 'a page with a hero (the homepages): the hero plays it');
});

test('the flight search\'s teaser text: a Background teaser row from www\'s promotion teaser (title, text, link), once', async () => {
  // eslint-disable-next-line import/extensions
  const { withFlightSearchTeaser } = await import('../tools/importer/swiss-import.mjs');
  const snap = '<div class="redesignedflightmanager" data-dcep="{&quot;promotionTeaser&quot;:{&quot;mode&quot;:&quot;link&quot;,&quot;alignment&quot;:&quot;left&quot;,&quot;displayText&quot;:&quot;From 27 October, fly from Zurich to vibrant Bengaluru&quot;,&quot;title&quot;:&quot;Discover India&quot;,&quot;linkModeConfig&quot;:{&quot;url&quot;:&quot;https://www.swiss.com/lhg/ch/en/dest/cy/bengaluru&quot;,&quot;label&quot;:&quot;Book your flight&quot;,&quot;movingImage&quot;:{&quot;imageUrl&quot;:&quot;/x.jpg&quot;,&quot;videoUrl&quot;:&quot;/x.mp4&quot;}},&quot;isInverted&quot;:false}}"></div>';
  const doc = '<div><div class="flight-search standalone"><div><div>Background image</div><div>i</div></div><div><div>Background video</div><div>v</div></div><div><div>Shop</div><div>x</div></div></div></div>';
  const out = withFlightSearchTeaser(doc, snap);
  assert.equal(out, '<div><div class="flight-search standalone"><div><div>Background image</div><div>i</div></div><div><div>Background video</div><div>v</div></div><div><div>Background teaser</div><div><p>Discover India</p><h2>From 27 October, fly from Zurich to vibrant Bengaluru</h2><p><a href="https://www.swiss.com/lhg/ch/en/dest/cy/bengaluru">Book your flight</a></p></div></div><div><div>Shop</div><div>x</div></div></div></div>');
  assert.equal(withFlightSearchTeaser(out, snap), out, 'once');
  const noVideo = '<div><div class="flight-search standalone"><div><div>Shop</div><div>x</div></div></div></div>';
  assert.equal(withFlightSearchTeaser(noVideo, snap), noVideo, 'no Background video row (a hero plays it, or none): as it is');
  assert.equal(withFlightSearchTeaser(doc, '<div></div>'), doc, 'no teaser: as it is');
  const amp = snap.replace('Discover India', 'Fly &amp; save');
  assert.match(withFlightSearchTeaser(doc, amp), /<p>Fly &amp; save<\/p>/, 'the text escaped once');
});

test('the offers grid unrendered in the snapshot kept for its parser (data-import-keep), once; others as they are', async () => {
  // eslint-disable-next-line import/extensions
  const { withOffersGridConfig } = await import('../tools/importer/swiss-import.mjs');
  const html = '<div class="topoffersdestinationfinder"><div class="dcep-destination-finder" data-dcep="{}" role="presentation"></div></div>';
  const out = withOffersGridConfig(html);
  assert.equal(out, '<div class="topoffersdestinationfinder"><div class="dcep-destination-finder" data-import-keep data-dcep="{}" role="presentation"></div></div>');
  assert.equal(withOffersGridConfig(out), out, 'once');
  assert.equal(withOffersGridConfig('<div class="dcep-fare-teaser"></div>'), '<div class="dcep-fare-teaser"></div>');
});

test('the flight search\'s group booking and destinations links: our pages in the document\'s root, not www', async () => {
  // eslint-disable-next-line import/extensions
  const { withOwnFlightSearchLinks } = await import('../tools/importer/swiss-import.mjs');
  const row = (k, href, label) => `<div><div>${k}</div><div><a href="${href}">${label}</a></div></div>`;
  const doc = (g, w) => `<div class="flight-search standalone">${row('Shop', 'https://shop.swiss.com/booking/availability', 'x')}${row('Group booking', g, 'Gruppenbuchungen für zehn oder mehr Passagiere.')}${row('Where we fly', w, 'Entdecken Sie unsere Reiseziele.')}</div>`;
  const GROUP = '/ch/de/book-and-manage/corporate-customers/group-travel-and-charter/group-travel';
  assert.equal(withOwnFlightSearchLinks(doc('https://www.swiss.com/content/lx/gc/en/book-and-manage/corporate-customers/group-travel-and-charter/group-travel', 'https://www.swiss.com/xx/de/offers'), '/ch/de/book-and-manage/flights'), doc(GROUP, '/ch/de/offers'));
  assert.equal(withOwnFlightSearchLinks(doc('https://www.swiss.com/content/lx/markets/xx/en', 'https://www.swiss.com/xx/de/offers'), '/ch/de/local-page/black-friday'), doc(GROUP, '/ch/de/offers'), 'www\'s market root only: the group travel page');
  const done = doc(GROUP, '/ch/de/offers');
  assert.equal(withOwnFlightSearchLinks(done, '/ch/de/homepage'), done, 'once');
  const outside = `<p><a href="https://www.swiss.com/xx/de/offers">x</a></p>${row('Where we fly', 'https://www.swiss.com/xx/de/offers', 'x')}`;
  assert.equal(withOwnFlightSearchLinks(outside, '/ch/de/homepage'), outside, 'outside a flight search: as it is');
});

test('the plan\'s extra lists: every list of the capture that is no Studio batch (c1, x01, p11, x11 ...), on the roots imported so far', async () => {
  // eslint-disable-next-line import/extensions
  const { extraBatches, IMPORTED_ROOTS } = await import('../tools/importer/swiss-plan.mjs');
  assert.deepEqual(IMPORTED_ROOTS, ['ch/en', 'ch/de', 'ch/fr', 'ch/it', 'ch/es', 'ch/pt', 'ch/zh', 'ch/ja']);
  const page = (list, status = 'ok') => ({ status, list });
  const pages = {
    'https://www.swiss.com/ch/en/a/confirmation': page('c1'),
    'https://www.swiss.com/ch/fr/b': page('p11'),
    'https://www.swiss.com/ch/fr/c.html': page('x11'),
    'https://www.swiss.com/ch/it/d/': page('p15'),
    'https://www.swiss.com/ch/it/e': page('15'),
    'https://www.swiss.com/ch/es/f': page('p19'),
    'https://www.swiss.com/ch/ru/h': page('p31'),
    'https://www.swiss.com/ch/fr/g': page('p11', 'failed'),
  };
  assert.deepEqual(extraBatches(pages), {
    c1: ['/ch/en/a/confirmation'], p11: ['/ch/fr/b'], x11: ['/ch/fr/c'], p15: ['/ch/it/d'], p19: ['/ch/es/f'],
  }, 'no Studio batch (15), no other root (ch/ru), only pages captured ok');
  assert.deepEqual(extraBatches(pages, ['ch/en']), { c1: ['/ch/en/a/confirmation'] });
});

test('the flight search\'s Shop row and the root\'s default origin: Zurich on ch/en, ch/de, ch/it, ch/es, ch/pt, ch/zh and ch/ja, Geneva on ch/fr; none on other roots', async () => {
  // eslint-disable-next-line import/extensions
  const { withFlightSearch } = await import('../tools/importer/swiss-import.mjs');
  const doc = '<div class="flight-search standalone"><div><div>Tabs</div><div>Flights</div></div></div>';
  const origin = (p) => (withFlightSearch(doc, p).match(/<div>Default origin<\/div><div>([^<]*)<\/div>/) || [])[1] || '';
  assert.equal(origin('/ch/en/homepage'), 'Zurich (ZRH)');
  assert.equal(origin('/ch/de/homepage'), 'Zürich (ZRH)');
  assert.equal(origin('/ch/fr/homepage'), 'Genève (GVA)', 'www\'s ch/fr homepage searches from Geneva');
  assert.equal(origin('/ch/it/homepage'), 'Zurigo (ZRH)');
  // brief 279: the Spanish and Portuguese homepages' field (www writes Zurich on ch/es)
  assert.equal(origin('/ch/es/homepage'), 'Zurich (ZRH)');
  assert.equal(origin('/ch/pt/homepage'), 'Zurique (ZRH)');
  // the Chinese and Japanese homepages' field (brief 28x)
  assert.equal(origin('/ch/zh/homepage'), '苏黎世 (ZRH)');
  assert.equal(origin('/ch/ja/homepage'), 'チューリッヒ (ZRH)');
  assert.equal(origin('/ch/ru/homepage'), '');
  assert.match(withFlightSearch(doc, '/ch/fr/homepage'), /<div>Shop<\/div><div><a href="https:\/\/shop\.swiss\.com\/booking\/availability">/);
});

test('a rendition of an asset without a file extension: its copy named with the rendition\'s', async () => {
  // eslint-disable-next-line import/extensions
  const { assetOf } = await import('../tools/importer/swiss-dam.mjs');
  assert.equal(assetOf('/content/dam/lh/images/illustrations/LH-PETC-bag-illustration.transform/lh-dcep-transform-width-2560/img.jpg'), '/content/dam/lh/images/illustrations/LH-PETC-bag-illustration.jpg');
  assert.equal(assetOf('/content/dam/lx/images/a.jpg.transform/lh-dcep-transform-width-2560/img.jpg'), '/content/dam/lx/images/a.jpg', 'as before');
  assert.equal(assetOf('/content/dam/lx/icons/a.svg'), '/content/dam/lx/icons/a.svg', 'an original as it is');
});

test('images www no longer has: dropped (their paragraph when it holds only the picture), others as they are', async () => {
  // eslint-disable-next-line import/extensions
  const { withoutGoneImages } = await import('../tools/importer/swiss-dam.mjs');
  const DA = 'https://content.da.live/moved-permanently/lh-swiss';
  const gone = new Set(['/content/dam/lx/images/app/01-check-in-en-1440x720.png']);
  const doc = `<div><p><picture><img src="${DA}/content/dam/lx/images/app/01-check-in-en-1440x720.png" alt=""></picture></p><p>Text <img src="https://www.swiss.com/content/dam/lx/images/app/01-check-in-en-1440x720.png" alt=""> after</p><div class="cards"><div><div><picture><img src="${DA}/content/dam/lx/images/app/01-check-in-en-1440x720.png" alt=""></picture></div><div>card</div></div></div><p><picture><img src="${DA}/content/dam/lx/images/kept.jpg" alt=""></picture></p></div>`;
  const out = withoutGoneImages(doc, gone);
  assert.equal(out, `<div><p>Text  after</p><div class="cards"><div><div></div><div>card</div></div></div><p><picture><img src="${DA}/content/dam/lx/images/kept.jpg" alt=""></picture></p></div>`);
  assert.equal(withoutGoneImages(doc, new Set()), doc);
});

test('a form\'s confirmation page in its own root: www\'s :redirect at the form\'s root, also from ch/fr or gc', async () => {
  // eslint-disable-next-line import/extensions
  const { successOf } = await import('../tools/importer/swiss-import.mjs');
  const form = (to) => `<form><input type="hidden" name=":redirect" value="${to}"></form>`;
  assert.equal(successOf(form('/content/lx/markets/ch/de/customer-support/refunds/confirmation.html'), '/ch/de/customer-support/refunds/refund-form'), '/ch/de/customer-support/refunds/confirmation');
  assert.equal(successOf(form('/content/lx/markets/ch/fr/local-page/swiss-nati-women/confirmation.html'), '/ch/en/local-page/swiss-nati-women'), '/ch/en/local-page/swiss-nati-women/confirmation', 'www\'s ch/fr page: the form\'s own root');
  assert.equal(successOf(form('/content/lx/gc/de/book-and-manage/x/group-travel-request-success.html'), '/ch/de/local-page/group-travel/group-travel-request'), '/ch/de/book-and-manage/x/group-travel-request-success', 'the global content tree: the form\'s root');
  assert.equal(successOf(form('/content/lx/markets/ch/en/a/confirmation.html')), '/ch/en/a/confirmation', 'no form path: www\'s root as before');
  assert.equal(successOf('<form></form>', '/ch/en/a'), '');
});

test('a success row to a page the site does not have: dropped (the form shows its message), our pages kept', async () => {
  // eslint-disable-next-line import/extensions
  const { withOwnSuccess } = await import('../tools/importer/swiss-import.mjs');
  const row = (href) => `<div><div><a href="${href}">${href.replace('https://www.swiss.com', '')}</a></div><div>config</div><div>success</div>${'<div></div>'.repeat(7)}</div>`;
  const formRow = `<div><div>swiss-x</div><div>config</div><div>form</div>${'<div></div>'.repeat(7)}</div>`;
  const doc = (href) => `<div class="form">${formRow}${row(href)}</div>`;
  const own = (p) => p === '/ch/en/customer-support/refunds/confirmation';
  assert.equal(withOwnSuccess(doc('/ch/en/customer-support/refunds/confirmation'), own), doc('/ch/en/customer-support/refunds/confirmation'), 'our page: kept');
  assert.equal(withOwnSuccess(doc('https://www.swiss.com/ch/de/customer-support/refunds/confirmation'), own), `<div class="form">${formRow}</div>`, 'www: dropped');
  assert.equal(withOwnSuccess(doc('/ch/de/customer-support/refunds/confirmation'), own), `<div class="form">${formRow}</div>`, 'a page not imported: dropped');
  assert.equal(withOwnSuccess(doc('https://www.swiss.com/ch/en/customer-support/refunds/confirmation'), own), doc('/ch/en/customer-support/refunds/confirmation'), 'www\'s link to our page: made ours');
  assert.equal(withOwnSuccess('<p>no form</p>', own), '<p>no form</p>');
});

test('form messages in the page\'s language: www\'s French or German ones on English pages (and others on German) by field, others as they are', async () => {
  // eslint-disable-next-line import/extensions
  const { withPageLanguageMessages } = await import('../tools/importer/swiss-import.mjs');
  const row = (cells) => `<div>${cells.map((c) => `<div>${c}</div>`).join('')}</div>`;
  const head = row(['Label', 'Type', 'Name', 'Required', 'Options', 'Help text', 'Placeholder', 'Validation message', 'Constraint message', 'Rules']);
  const field = (label, type, name, msg, constraint = '') => row([label, type, name, 'yes', '', '', '', msg, constraint, '']);
  const form = (...rows) => `<div class="form">${head}${rows.join('')}</div>`;
  const doc = form(
    field('First name', 'text', 'FirstName', 'Veuillez indiquer votre prénom'),
    field('Last name', 'text', 'LastName', 'Veuillez indiquer votre adresse électronique'),
    field('E-mail', 'email', 'Email', 'Please enter your e-mail address.', 'Please enter a valid e-mail address.'),
    field('Date', 'date', 'IncidentDate', 'Geben Sie das Datum des Vorfalls an'),
    field('', 'checkbox', 'termsconditions', 'Veuillez accepter les conditions de participation'),
    field('Name*', 'text', 'Nachname', 'Veuillez indiquer votre nom'),
  );
  assert.equal(withPageLanguageMessages(doc, '/ch/en/local-page/x'), form(
    field('First name', 'text', 'FirstName', 'Please enter your first name.'),
    field('Last name', 'text', 'LastName', 'Please enter your surname.'),
    field('E-mail', 'email', 'Email', 'Please enter your e-mail address.', 'Please enter a valid e-mail address.'),
    field('Date', 'date', 'IncidentDate', 'Please fill in this field.'),
    field('', 'checkbox', 'termsconditions', 'Please accept the terms and conditions.'),
    field('Name*', 'text', 'Nachname', 'Please enter your surname.'),
  ), 'by field name; a field without its wording: the form\'s own message');
  const de = form(field('Vorname', 'text', 'FirstName', 'Geben Sie Ihren Vornamen an'), field('PartnerPlus', 'text', 'PartnerPlus', 'Please enter a phone number'));
  assert.equal(withPageLanguageMessages(de, '/ch/de/x'), form(field('Vorname', 'text', 'FirstName', 'Geben Sie Ihren Vornamen an'), field('PartnerPlus', 'text', 'PartnerPlus', 'Bitte füllen Sie dieses Feld aus.')), 'German pages: German kept, English replaced');
  // brief 276: ch/fr and ch/it (www's technical support form has German messages on every language)
  const tech = form(field('Prénom', 'text', 'firstName', 'Geben Sie Ihren Vornamen an'), field('Date', 'date', 'date', 'Geben Sie das Datum des Vorfalls an'), field('E-mail', 'email', 'Email', 'Veuillez indiquer votre adresse électronique'));
  assert.equal(withPageLanguageMessages(tech, '/ch/fr/customer-support/contact-us/technical-support'), form(field('Prénom', 'text', 'firstName', 'Veuillez indiquer votre prénom.'), field('Date', 'date', 'date', 'Veuillez remplir ce champ.'), field('E-mail', 'email', 'Email', 'Veuillez indiquer votre adresse électronique')), 'French kept, German as SWISS\'s French');
  assert.equal(withPageLanguageMessages(tech, '/ch/it/customer-support/contact-us/technical-support'), form(field('Prénom', 'text', 'firstName', 'Inserisca il suo nome.'), field('Date', 'date', 'date', 'Compili questo campo.'), field('E-mail', 'email', 'Email', 'Inserisca il suo indirizzo e-mail.')), 'German and French as SWISS\'s Italian');
  const it = form(field('Nome', 'text', 'firstName', 'Inserisca il suo nome.'));
  assert.equal(withPageLanguageMessages(it, '/ch/it/x'), it, 'Italian on ch/it: as it is');
  assert.equal(withPageLanguageMessages(it, '/ch/en/x'), form(field('Nome', 'text', 'firstName', 'Please enter your first name.')), 'Italian on ch/en: English');
  // brief 279: ch/es and ch/pt (the same forms' German messages; an English one on ch/pt)
  const es = form(field('Nombre', 'text', 'firstName', 'Geben Sie Ihren Vornamen an'), field('Fecha', 'date', 'date', 'Geben Sie das Datum des Vorfalls an'), field('Apellidos', 'text', 'lastName', 'Introduzca sus apellidos'));
  assert.equal(withPageLanguageMessages(es, '/ch/es/customer-support/contact-us/technical-support'), form(field('Nombre', 'text', 'firstName', 'Introduzca su nombre.'), field('Fecha', 'date', 'date', 'Rellene este campo.'), field('Apellidos', 'text', 'lastName', 'Introduzca sus apellidos')), 'Spanish kept, German as SWISS\'s Spanish');
  const pt = form(field('Tratamento', 'text', 'gender', 'Choose a form of address'), field('Data', 'date', 'outboundDate', 'Geben Sie ein Abflugdatum an'), field('Nome', 'text', 'firstName', 'Digite seu nome'));
  assert.equal(withPageLanguageMessages(pt, '/ch/pt/x'), form(field('Tratamento', 'text', 'gender', 'Escolha uma forma de tratamento'), field('Data', 'date', 'outboundDate', 'Selecione a data de partida'), field('Nome', 'text', 'firstName', 'Digite seu nome')), 'Portuguese kept, German and English as SWISS\'s Portuguese');
  assert.equal(withPageLanguageMessages(es, '/ch/en/x').includes('Please enter your surname.'), true, 'Spanish on ch/en: English');
  // brief 28x: ch/zh and ch/ja (the same forms' German and English messages)
  const zh = form(field('称谓', 'text', 'gender', 'Choose a form of address'), field('日期', 'date', 'date', 'Geben Sie das Datum des Vorfalls an'), field('名字', 'text', 'firstName', '请输入您的名字'));
  assert.equal(withPageLanguageMessages(zh, '/ch/zh/x'), form(field('称谓', 'text', 'gender', '请选择称谓'), field('日期', 'date', 'date', '请填写此字段。'), field('名字', 'text', 'firstName', '请输入您的名字')), 'Chinese kept, German and English as SWISS\'s Chinese');
  const ja = form(field('姓', 'text', 'lastName', 'Geben Sie Ihren Nachnamen an'), field('日付', 'date', 'outboundDate', 'Geben Sie ein Abflugdatum an'), field('名', 'text', 'firstName', '名を入力してください'));
  assert.equal(withPageLanguageMessages(ja, '/ch/ja/x'), form(field('姓', 'text', 'lastName', '姓を入力してください。'), field('日付', 'date', 'outboundDate', '出発日を選択してください。'), field('名', 'text', 'firstName', '名を入力してください')), 'Japanese kept, German as SWISS\'s Japanese');
  assert.ok(withPageLanguageMessages(ja, '/ch/en/x').includes('Please enter your first name.'), 'Japanese on ch/en: English');
  assert.ok(withPageLanguageMessages(zh, '/ch/ja/x').includes('名を入力してください。'), 'Chinese on ch/ja: Japanese');
  assert.equal(withPageLanguageMessages(doc, '/ch/ru/x'), doc, 'a root without wording: as it is');
  assert.equal(withPageLanguageMessages('<p>Veuillez</p>', '/ch/en/x'), '<p>Veuillez</p>');
});

test('the scope leaves out AirCore, /lhg/, the shells, placeholders and www\'s redirects', () => {
  ['/lhg/ch/en', '/aircore/sitemaps/x', '/ch/en/null/x', '/ch/ko/homepage', '/xx/de/homepage', '/ch/en/profile/login', '/ch/en/enrollment', '/ch/en/homepage/teasers/x', '/ch/en/customer-support/chatbot', '/ch/en/book-and-manage/passenger-receipt', '/ch/en/customer-support/refund']
    .forEach((p) => assert.ok(leftOut(p), p));
  assert.equal(leftOut('/ch/de/customer-support/refund'), '', 'ch/de\'s refund is a page (the voucher exchange login)');
  assert.equal(leftOut('/ch/en/fly/check-in'), '');
});

test('a cockpit link without a query: the root\'s country and language as the other cockpit links (www\'s bare one is a 404 on our host)', async () => {
  // eslint-disable-next-line import/extensions
  const { withCockpitQuery } = await import('../tools/importer/swiss-import.mjs');
  const doc = '<p><a href="/deeplink/cockpit">Mes vols</a> <a href="https://www.swiss.com/deeplink/cockpit/">Réservations</a> <a href="/deeplink/cockpit?country=CH&amp;language=EN">kept</a> <a href="/deeplink/cockpitx">other</a></p>';
  assert.equal(withCockpitQuery(doc, '/ch/fr/book-and-manage/overview-manage'), '<p><a href="/deeplink/cockpit?country=CH&amp;language=FR">Mes vols</a> <a href="/deeplink/cockpit?country=CH&amp;language=FR">Réservations</a> <a href="/deeplink/cockpit?country=CH&amp;language=EN">kept</a> <a href="/deeplink/cockpitx">other</a></p>');
  assert.match(withCockpitQuery(doc, '/ch/de/x'), /href="\/deeplink\/cockpit\?country=CH&amp;language=DE">Mes vols/);
  assert.match(withCockpitQuery(doc, '/at/en/x'), /href="\/deeplink\/cockpit\?country=AT&amp;language=EN">Mes vols/, 'a market root: its country');
  assert.equal(withCockpitQuery(doc, '/corporate/en/x'), doc, 'no <cc>/<ll> root: as it is');
});
