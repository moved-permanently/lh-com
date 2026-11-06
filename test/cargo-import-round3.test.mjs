/* eslint-disable max-len, import/extensions */
/* Lufthansa Cargo's importer (tools/importer/cargo-import.mjs), parity round 3 (Facts & Figures,
   row 18; www's capture cargo-parity-001):
   - www's image lists (LCAGCP-lcagImageList: Meet the Executive Board, Compliance at Lufthansa
     Cargo) as a section of style image-list: the band's picture, the heading and an
     accordion-columns (faq, exclusive) with each item's title and its text. www keeps the text
     only in the phone copies (collapse d-md-none; on desktop its script copies it into the
     overlay, whose placeholder reads "lorem"), so those copies are read here, and the "lorem"
     placeholder is left out;
   - the history timeline (LCAGCP-lcagEventSlider) as carousel-cards (timeline).
   Run: node --max-old-space-size=512 --test test/cargo-import-round3.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';

const item = (n, title, body) => `<div class="LCAGCP-imageListItemHeadline LCAGCP-lcagFontHeadBold" data-toggle="collapse" data-target="#LCAGCP-cid_${n}_x"><span class="LCAGCP-imageListIcon lcag-icon-lh-icon-plus"></span><span class="LCAGCP-imageListHeadlineIcon"> </span><span class="LCAGCP-imageListToggle"> ${title} </span></div><div class="collapse d-md-none LCAGCP-imageListMobileContent" id="LCAGCP-cid_${n}_x">${body}</div>`;
const imageList = (heading, items) => `<div class="journal-content-article"><div class="container-fluid"><div class="row"><div class="col-sm-12 LCAGCP-lcagImageList LCAGCP-lcagDefaultList"><picture><img class="d-none d-md-block" alt="" src="https://www.lufthansa-cargo.com/documents/20184/35950980/Vorstand_864px.jpg/845156a5"></picture><div class="LCAGCP-imageListMobile d-sm-block d-md-none"><picture><img alt="" src="https://www.lufthansa-cargo.com/documents/20184/35950980/Vorstand_864px.jpg/845156a5"></picture><h2 class="LCAGCP-imageListHeadline">${heading}</h2></div><div class="container innerContainerRow posAb"><div class="row"><div class="col-md-6 displayFlex alignMiddle"><div class="LCAGCP-lcagImageListTextContainer LCAGCP-lcagColor-2"><h2 class="LCAGCP-imageListHeadline LCAGCP-lcagFontHeadBold d-none d-md-block">${heading}</h2>${items}</div></div><div class="col-md-6 d-none d-md-block"><div class="LCAGCP-lcagImageListContentOverlay"><span class="LCAGCP-imageListCloseButton"></span><div class="LCAGCP-lcagImageListContent"><div class="LCAGCP-dynamicContent">lorem</div></div></div></div></div></div></div></div></div></div>`;
const wrap = (body) => `<!DOCTYPE html><html><head><title>Facts &amp; Figures - Lufthansa Cargo</title></head><body><div id="main-content"><div class="journal-content-article"><h1>Facts &amp; Figures</h1></div>${body}</div></body></html>`;

test('www\'s image list (Meet the Executive Board): a section of style image-list with its picture, heading and an exclusive faq accordion of the items with their text; no "lorem", the heading once', async () => {
  const { convert } = await import('../tools/importer/cargo-import.mjs');
  const items = item(0, 'Board Members', '<h2>Executive Board members</h2><p>Lufthansa Cargo is managed by an Executive Board team.</p><ul><li>Dr Michael Niggemann (Chairperson)</li></ul>')
    + item(1, 'Chief Operating Officer', '<h2>Chief Operating Officer</h2><p>Frank Bauer studied engineering.</p>');
  const { html } = convert(wrap(imageList('Meet the Executive Board', items)), '/en/ci/facts-figures', 'en');
  assert.doesNotMatch(html, /lorem/, html);
  assert.equal((html.match(/Meet the Executive Board/g) || []).length, 1, 'the heading once');
  assert.match(html, /<div class="accordion-columns faq exclusive">/, html);
  assert.match(html, /<div><div>Board Members<\/div><div>(<h[2-4]>Executive Board members<\/h[2-4]>)?<p>Lufthansa Cargo is managed by an Executive Board team\.<\/p><ul><li>Dr Michael Niggemann \(Chairperson\)<\/li><\/ul><\/div><\/div>/, html);
  assert.match(html, /<div><div>Chief Operating Officer<\/div><div>(<h[2-4]>Chief Operating Officer<\/h[2-4]>)?<p>Frank Bauer studied engineering\.<\/p><\/div><\/div>/, html);
  assert.match(html, /<p><picture><img src="[^"]*vorstand[^"]*" alt=""><\/picture><\/p><h2>Meet the Executive Board<\/h2><div class="accordion-columns faq exclusive">/i, html);
  assert.match(html, /faq exclusive">(?:(?!<div class="section-metadata">)[\s\S])*<div class="section-metadata"><div><div>Style<\/div><div>image-list<\/div><\/div><\/div>/, 'the list\'s own section, style image-list');
});

test('www\'s history timeline (LCAGCP-lcagEventSlider) as carousel-cards (timeline): the year, the title and the text per event', async () => {
  const { convert } = await import('../tools/importer/cargo-import.mjs');
  const ev = (y, h, p) => `<div class="timeline__item"><div class="timeline__item__inner"><div class="timeline__content__wrap"><div class="timeline__content"><div class="LCAGCP-lcagEventText"><h1>${y}</h1><h3>${h}</h3><p>${p}</p></div></div></div></div></div>`;
  const body = `<div class="container-fluid LCAGCP-lcagEventSlider" data-backgroundimage="/documents/20184/30686690/History_Slider_BG.jpg/59a3"><div class="timeline"><div class="timeline__wrap"><div class="timeline__items">${ev('1926', 'Founding of Deutsche Lufthansa AG', 'In the first year.')}${ev('1928', 'Opening of first cargo routes', 'The first routes.')}</div></div></div></div>`;
  const { html } = convert(wrap(body), '/en/ci/facts-figures', 'en');
  assert.match(html, /<div class="carousel-cards timeline">/, html);
  assert.match(html, /<div><div><\/div><div><p>1926<\/p><h3>Founding of Deutsche Lufthansa AG<\/h3><p>In the first year\.<\/p><\/div><\/div>/, html);
});

// Support & Contact (row 21): www's "Contact us" card in a section of its own (style contact: the
// navy band); the station search portlet's technical support (text, the phone as a tel: link,
// the opening hours) beside "Find your local sales contact" (the station search a link to www's
// station finder, decided), as columns; no form fields, no "Station search" title
test('Support & Contact: the contact card in a section of style contact; technical support and the local sales contact as columns', async () => {
  const { convert } = await import('../tools/importer/cargo-import.mjs');
  const card = '<div id="portlet_com_lhcargo_eportal_contact_support_web"><div class="contactSupportWrapper"><div class="contactBox d-flex align-items-center blueBg"><div><h3>Contact us</h3><p>Do you have a question? Fill out the form and we\'ll get back to you shortly.</p><button class="btn contactBtn" type="button"><span class="lfr-btn-label">Open contact form</span></button></div></div></div></div>';
  const station = '<div id="portlet_com_lhcargo_eportal_contact_support_station_search"><h2 class="portlet-title-text">Station search</h2><div class="newGrid"><div class="row"><div class="techSupport col-12 col-md-6"><h3 class="subHeadingCS">Need technical support?</h3><p>In case of any technical questions, please call our support team.</p><p class="loggedInSection d-flex"><a class="lcagLink phoneIcon service" href="callto:+49 (0) 1802 737 737">+49 (0) 1802 737 737</a></p><small class="extraSmall">Opening hours: Monday - Friday: 08:00 - 20:00 CET.<br>€0.06/call from the German landline.</small></div><form class="form stationSearch col-12 col-md-6"><h3 class="subHeadingCS">Find your local sales contact</h3><label class="control-label">IATA-Code, City</label><input name="station"></form></div></div></div>';
  const page = `<!DOCTYPE html><html><head><title>Support &amp; Contact - Lufthansa Cargo</title></head><body><div id="main-content"><div class="rHeaderBlock"><h1>Support &amp; Contact</h1></div>${card}${station}</div></body></html>`;
  const { html } = convert(page, '/en/support-and-contact', 'en');
  assert.match(html, /<h2>Contact us<\/h2><p>Do you have a question\? Fill out the form and we'll get back to you shortly\.<\/p><p><strong><a href="\/modals\/contact-us">Open contact form<\/a><\/strong><\/p><div class="section-metadata"><div><div>Style<\/div><div>contact<\/div><\/div><\/div>/, html);
  assert.match(html, /<div class="columns support"><div><div><h3>Need technical support\?<\/h3><p>In case of any technical questions, please call our support team\.<\/p><p><a href="tel:\+491802737737">\+49 \(0\) 1802 737 737<\/a><\/p><p><small>Opening hours: Monday - Friday: 08:00 - 20:00 CET\.<br>€0\.06\/call from the German landline\.<\/small><\/p><\/div><div><h3>Find your local sales contact<\/h3><p><a href="https:\/\/www\.lufthansa-cargo\.com\/en\/network\/maps\/stations">IATA-Code, City<\/a><\/p><\/div><\/div><\/div>/, html);
  assert.doesNotMatch(html, /Station search/);
});
