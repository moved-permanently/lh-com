/* eslint-disable max-len, import/extensions */
/* Lufthansa Cargo's links to www's contact form (tools/importer/cargo-import.mjs): Support &
   Contact's entries that open www's form (no link, a reason and subreason beside them) link to our
   form page with both; www's contact card's button links to it; /support-and-contact?reason=
   &subreason= (the menus' Feedback/Complaints) goes there too; entries that need Cargo's login
   (/en/contact-cst) stay links to www; www's German Support & Contact is our English page.
   Run: node --max-old-space-size=512 --test test/cargo-support-links.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { convert, Page } from '../tools/importer/cargo-import.mjs';

const entry = (title, reason = '', subreason = '') => `<div class="lfr-layout-structure-item"><div class="faqEntryTitle"><h4 class="component-heading">${title}</h4></div><div class="faqReason">${reason}</div><div class="faqSubreason">${subreason}</div></div>`;
const PAGE = `<!DOCTYPE html><html><head><title>Support &amp; Contact - Lufthansa Cargo</title></head><body><div id="main-content">
<div id="portlet_com_lhcargo_eportal_contact_support_topic_search"><div class="rHeaderBlock"><h1>Support &amp; Contact</h1></div><form><div class="topicSearchWrapper"><label class="control-label" for="_com_lhcargo_eportal_contact_support_topic_search_topicSearch">
  Find topic by typing
</label><input id="_com_lhcargo_eportal_contact_support_topic_search_topicSearch" name="_com_lhcargo_eportal_contact_support_topic_search_topicSearch"></div></form>
<a href="javascript:void(0)" class="lcagChip contactLink" onclick="openContactUsDialog('General request', 'Feedback / Complaints');">Feedback/Complaints</a></div>
<div class="component-tabs"><ul class="nav nav-tabs"><li><a href="#tab-1">Bookings &amp; Shipments</a></li></ul>
<div class="tab-content"><div class="card tab-pane fade active show" id="tab-1"><div class="card-body"><div class="topicSection"><h4>Booking</h4><h5>Get assistance in booking or updating your shipment information.</h5></div></div></div></div></div>
<div class="topicSection"><div class="topicSearchTriggerContainer"><h4>Booking</h4></div>
${entry('Get technical support from our service team with eBooking.', 'Technical support', 'Technical support / Issue with a particular service')}
${entry('<a href="https://www.lufthansa-cargo.com/en/contact-cst?reason=Damaged cargo">Get support with damaged cargo.</a>', 'reason=Damaged cargo')}
${entry('<a href="javascript:void(0)">Have feedback or a complaint? Let us know here.</a>', 'General request', 'Feedback / Complaints')}
</div>
<div id="portlet_com_lhcargo_eportal_contact_support_web"><form id="_com_lhcargo_eportal_contact_support_web_contactSupportForm"><input name="x"></form>
<div class="contactSupportWrapper"><div class="contactBox"><div><h3>Contact us</h3><p>Do you have a question? Fill out the form and we'll get back to you shortly.</p>
<button class="btn contactBtn" onclick="openContactUsDialog();" type="button"><i class="email"></i><span class="lfr-btn-label">Open contact form</span></button></div></div></div></div>
<div id="portlet_com_lhcargo_eportal_contact_support_station_search"><h2>Station search</h2><form><input name="s"></form></div>
</div></body></html>`;

test('Support & Contact: entries that open www\'s form link to /en/contact-us with their reason and subreason; login entries stay www\'s', () => {
  const { html, report } = convert(PAGE, '/en/support-and-contact', 'en');
  assert.match(html, /<a href="\/en\/contact-us\?reason=Technical%20support&amp;subreason=Technical%20support%20%2F%20Issue%20with%20a%20particular%20service">Get technical support from our service team with eBooking\.<\/a>/);
  assert.match(html, /<a href="\/en\/contact-us\?reason=General%20request&amp;subreason=Feedback%20%2F%20Complaints">Have feedback or a complaint\? Let us know here\.<\/a>/);
  assert.match(html, /<a href="https:\/\/www\.lufthansa-cargo\.com\/en\/contact-cst\?reason=Damaged(%20| )cargo">Get support with damaged cargo\.<\/a>/);
  assert.ok(!/faqReason|Technical support \/ Issue with a particular service<\/div>/.test(html), 'the reason fields themselves are not content');
  assert.ok(report.notes.some((n) => /2 entries opening www's contact form linked to \/en\/contact-us/.test(n)), report.notes.join(' | '));
});

test('Support & Contact: the H1, www\'s contact card with its button linking to the form page; no link to www\'s form, no station search', () => {
  const { html } = convert(PAGE, '/en/support-and-contact', 'en');
  assert.equal((html.match(/<h1>/g) || []).length, 1);
  assert.match(html, /<h1>Support &amp; Contact<\/h1>/);
  assert.match(html, /<h2>Contact us<\/h2><p>Do you have a question\? Fill out the form and we'll get back to you shortly\.<\/p><p><strong><a href="\/en\/contact-us">Open contact form<\/a><\/strong><\/p>/);
  assert.ok(!/Go to the form on www/.test(html));
  assert.ok(!/Station search/.test(html));
});

test('Support & Contact: the topics as accordion-columns (faq, filter) with www\'s field label and www\'s no-results text', () => {
  const { html } = convert(PAGE, '/en/support-and-contact', 'en');
  assert.match(html, /<div class="accordion-columns faq filter">/);
  assert.match(html, /<div><div>Filter label<\/div><div>Find topic by typing<\/div><\/div>/);
  // www's topic search shows no line for no match; its screen readers hear jQuery UI's "No search results."
  assert.match(html, /<div><div>No results<\/div><div>No search results\.<\/div><\/div>/);
  assert.equal((html.match(/Filter label/g) || []).length, 1);
  // a page without www's topic search field: the plain faq accordion
  const other = convert(PAGE.replace(/<div class="topicSearchWrapper">[\s\S]*?<\/div><\/form>/, '</form>'), '/en/support-and-contact', 'en');
  assert.match(other.html, /<div class="accordion-columns faq">/);
  assert.ok(!/Filter label/.test(other.html));
});

test('links: /support-and-contact?reason=&subreason= to the form page of the link\'s language (a language-less one: the page\'s); Support & Contact to our page of that language; the form pages themselves', () => {
  // www's German Support & Contact is a page of its own (the English body and form with the German
  // header and footer, cargo-parity-001, brief 417): /de/support-and-contact and /de/contact-us
  const page = new Page('/de/home', 'de', '<html></html>');
  assert.equal(page.href('/support-and-contact?reason=General request&subreason=Feedback / Complaints'), '/de/contact-us?reason=General%20request&subreason=Feedback%20%2F%20Complaints');
  assert.equal(page.href('https://www.lufthansa-cargo.com/de/support-and-contact?reason=General%20request&amp;subreason=Other'), '/de/contact-us?reason=General%20request&subreason=Other');
  assert.equal(page.href('https://www.lufthansa-cargo.com/en/support-and-contact?reason=General%20request&amp;subreason=Other'), '/en/contact-us?reason=General%20request&subreason=Other');
  assert.equal(page.href('https://www.lufthansa-cargo.com/de/support-and-contact'), '/de/support-and-contact');
  assert.equal(page.href('/support-and-contact?reason=General request'), '/de/support-and-contact', 'a reason only: the page, as www opens no form');
  assert.equal(page.href('/en/contact-us?reason=a&subreason=b'), '/en/contact-us?reason=a&subreason=b');
  assert.equal(page.href('/de/contact-us?reason=a&subreason=b'), '/de/contact-us?reason=a&subreason=b');
  assert.equal(page.href('https://www.lufthansa-cargo.com/en/contact-cst'), 'https://www.lufthansa-cargo.com/en/contact-cst', 'behind the login: www');
  const en = new Page('/en/home', 'en', '<html></html>');
  assert.equal(en.href('/support-and-contact?reason=General request&subreason=Feedback / Complaints'), '/en/contact-us?reason=General%20request&subreason=Feedback%20%2F%20Complaints');
  assert.equal(en.href('/support-and-contact'), '/en/support-and-contact');
});

test('the German Support & Contact is no redirect to the English page any more; its own page in scope', async () => {
  const { REDIRECT_ONLY, ADDED_PAGES } = await import('../tools/importer/cargo-paths.mjs');
  assert.equal(REDIRECT_ONLY['/de/support-and-contact'], undefined);
  assert.deepEqual(ADDED_PAGES['/de/support-and-contact'], { alternate: '/en/support-and-contact' });
});
