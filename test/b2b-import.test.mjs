/* eslint-disable max-len */
/* Lufthansa Group for Business' importer (tools/importer/b2b-import.mjs, b2b-scope.mjs): the B2B
   components marked for the templates' B2B selectors, the author quote as its text, the phone list
   and Cloudflare's obfuscated e-mail addresses as plain content, the search bar as the results
   widget, the forms' lh-forms id and success page, the metadata (the language version's nav and
   footer, markets, noindex), the document names without "--".
   Run: node --max-old-space-size=512 --test test/b2b-import.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';

const {
  decodeCfEmail, withEmails, withB2bComponents, withHotlines, withSearch, successOf, formIdOf, withB2bMetadata,
} = await import('../tools/importer/b2b-import.mjs');
const { docName } = await import('../tools/importer/b2b-scope.mjs');

// "info@example.com" XOR 0x42, as Cloudflare writes it
const encode = (s, key = 0x42) => key.toString(16).padStart(2, '0') + [...s].map((c) => (c.charCodeAt(0) ^ key).toString(16).padStart(2, '0')).join(''); // eslint-disable-line no-bitwise

test('Cloudflare\'s e-mail obfuscation: mailto: links and plain text', () => {
  const hex = encode('info@example.com');
  assert.equal(decodeCfEmail(hex), 'info@example.com');
  const html = `<a href="/cdn-cgi/l/email-protection#${hex}">x</a> <span class="__cf_email__" data-cfemail="${hex}">[email&#160;protected]</span>`;
  assert.equal(withEmails(html), '<a href="mailto:info@example.com">x</a> info@example.com');
});

test('the B2B components get the classes the templates take; the author quote is its text and name', () => {
  const html = '<div class="fourcolumn column event"><div class="column-view"><div class="iconmodule section"><div class="icon-module"></div></div></div></div>'
    + '<div class="stage event section"><div class="stage-teaser"><a class="stage-teaser-link" href="/x"></a></div></div>'
    + '<div class="inspirationalstage"><div class="promo-hero"></div></div>'
    + '<div class="authorquote event"><div class="dcep-author-quote"><div class="author-quote"><div class="quote-text">“By staying aligned.”</div><div class="subline-text">Stephan Baars</div></div></div></div>'
    + '<div class="stage section"><div class="other"></div></div>';
  const out = withB2bComponents(html);
  assert.match(out, /<div class="b2b-iconmodules fourcolumn column event">/);
  assert.match(out, /<div class="b2b-stage stage event section"><div class="stage-teaser">/);
  assert.match(out, /<div class="b2b-inspirationalstage inspirationalstage">/);
  assert.match(out, /<p>“By staying aligned\.”<\/p><p>Stephan Baars<\/p>/);
  assert.ok(!out.includes('authorquote'));
  assert.match(out, /<div class="stage section"><div class="other">/, 'a stage without a stage teaser as it was');
});

test('the phone list: the box\'s heading, the contact\'s phone and e-mail, the opening hours', () => {
  const html = '<div class="hotlinenumberdisplay"><div class="dcep-ppb-hotlinebox"><maui-headline type="h3">Contacts for PartnerPlusBenefit</maui-headline><form><maui-select><maui-option>Albania</maui-option></maui-select></form><section><div class="support-contact"><a class="phone-number" href="tel:+49 69 86 799 500"><span class="sr-only">Contact Details</span>+49 69 86 799 500</a><a href="mailto:dach.ppb@dlh.de" class="contact-link">dach.ppb@dlh.de</a><div class="mb-9"><maui-headline class="service-hours-headline">Opening hours</maui-headline><table class="service-hours"><tr><th>Monday</th><td>08:00 - 18:00</td></tr><tr><th>Friday</th><td>08:00 - 18:00</td></tr></table></div></div></section></div></div>';
  assert.equal(withHotlines(html), '<div class="text section"><div class="richtext"><h3>Contacts for PartnerPlusBenefit</h3><p><a href="tel:+49 69 86 799 500">+49 69 86 799 500</a></p><p><a href="mailto:dach.ppb@dlh.de">dach.ppb@dlh.de</a></p><h4>Opening hours</h4><p>Monday: 08:00 - 18:00<br>Friday: 08:00 - 18:00</p></div></div>');
});

test('the search: the results widget once (the bar goes where the widget is, becomes it where it is not)', () => {
  const bar = '<div class="searchbar"><div class="dcep-b2b-neo-search-bar"></div></div>';
  const results = '<div class="onsitesearchresult"><div class="dcep-b2b-neo-search-results-aem"></div></div>';
  assert.equal(withSearch(`${bar}${results}`), results);
  assert.equal(withSearch(bar), results);
});

test('forms: the lh-forms id b2b-<page>, the success page from www\'s :redirect', () => {
  assert.equal(formIdOf('/de/en/program/businesstogo'), 'b2b-businesstogo');
  assert.equal(formIdOf('/de/de/partner-plus-benefit-raffle'), 'b2b-partner-plus-benefit-raffle');
  assert.equal(successOf('<input type="hidden" name=":redirect" value="/content/B2Bneo/markets/de/en/program/businesstogo/contact-form-confirmation.html">'), '/de/en/program/businesstogo/contact-form-confirmation');
  assert.equal(successOf('<input name=":redirect" value="/content/other/x.html">'), '');
});

test('metadata: the language version\'s nav and footer on every root, markets, www\'s noindex', () => {
  const doc = '<div><p>x</p></div>';
  const de = withB2bMetadata(doc, '/de/en/news', '<meta name="robots" content="noindex,nofollow">', []);
  assert.match(de, /<div><div>nav<\/div><div>\/de\/en\/nav<\/div><\/div><div><div>footer<\/div><div>\/de\/en\/footer<\/div><\/div><div><div>Robots<\/div><div>noindex, nofollow<\/div><\/div>/);
  const xx = withB2bMetadata(doc, '/xx/de/about-us/contact', '', ['ae/de', 'at/de']);
  assert.match(xx, /<div>nav<\/div><div>\/de\/de\/nav<\/div>/);
  assert.match(xx, /<div>markets<\/div><div>ae\/de, at\/de<\/div>/);
  assert.match(withB2bMetadata(doc, '/ch/en/program/experts', '', []), /<div>footer<\/div><div>\/de\/en\/footer<\/div>/);
});

test('document names: no "--" (Edge Delivery refuses it in a segment), none at a segment\'s end, lower case, "_" as "-"', () => {
  assert.equal(docName('/at/de/program/experts/news/swiss-senses---new-highlights-in-swiss-business'), '/at/de/program/experts/news/swiss-senses-new-highlights-in-swiss-business');
  assert.equal(docName('/de/en/news/business_flex_green_fare'), '/de/en/news/business-flex-green-fare');
  assert.equal(docName('/de/en/program/Book-A-Group'), '/de/en/program/book-a-group');
  assert.equal(docName('/de/en/program/experts/news/munich-airport-named--airport-of-the-year-'), '/de/en/program/experts/news/munich-airport-named-airport-of-the-year', 'no "-" at a segment\'s end');
});
