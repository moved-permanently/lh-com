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

test('the phone box: a marker with its heading, then the hotline-finder block with the labels of the page\'s language', async () => {
  const html = '<div class="hotlinenumberdisplay"><div class="dcep-ppb-hotlinebox"><maui-headline type="h3">Contacts for PartnerPlusBenefit</maui-headline><form><maui-select><maui-option>Albania</maui-option></maui-select></form><section><div class="support-contact"><a class="phone-number" href="tel:+49 69 86 799 500"><span class="sr-only">Contact Details</span>+49 69 86 799 500</a></div></section></div></div>';
  assert.equal(withHotlines(html), '<div class="text section"><div class="richtext"><p>[hotline-finder] Contacts for PartnerPlusBenefit</p></div></div>');
  const { withHotlineFinder } = await import('../tools/importer/b2b-import.mjs');
  const labels = {
    select: 'Please choose your country or region', contact: 'Contact Details', hours: 'Opening hours', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  };
  const doc = '<div><h2>Contact</h2><p>[hotline-finder] Contacts for PartnerPlusBenefit</p><p>After</p><div class="section-metadata"><div><div>style</div><div>light</div></div></div></div>';
  assert.equal(withHotlineFinder(doc, labels), '<div><h2>Contact</h2><div class="hotline-finder"><div><div>Sheet</div><div><a href="/data/hotlines.json">/data/hotlines.json</a></div></div><div><div>Headline</div><div>Contacts for PartnerPlusBenefit</div></div><div><div>Select</div><div>Please choose your country or region</div></div><div><div>Contact</div><div>Contact Details</div></div><div><div>Hours</div><div>Opening hours</div></div><div><div>Days</div><div>Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday</div></div></div><p>After</p><div class="section-metadata"><div><div>style</div><div>light</div></div></div></div>', 'a section with its own metadata keeps it');
  assert.equal(withHotlineFinder('<div><p>x</p></div>', labels), '<div><p>x</p></div>', 'a page without the box as it was');
  // its section grey (www's full-width grey band) unless it has section metadata; the box's image
  const sections = '<div><h2>Before</h2></div>\n<div><p>[hotline-finder] Contacts</p></div>\n<div><h2>After</h2><div class="section-metadata"><div><div>style</div><div>grey</div></div></div></div>';
  const out = withHotlineFinder(sections, { select: 'Pick' }, 'https://content.da.live/moved-permanently/lh-b2b/content/dam/b2bneo/images/customerservicekam.png');
  assert.equal(out, '<div><h2>Before</h2></div>\n<div><div class="hotline-finder"><div><div>Sheet</div><div><a href="/data/hotlines.json">/data/hotlines.json</a></div></div><div><div>Headline</div><div>Contacts</div></div><div><div>Select</div><div>Pick</div></div><div><div>Image</div><div><picture><img src="https://content.da.live/moved-permanently/lh-b2b/content/dam/b2bneo/images/customerservicekam.png" alt=""></picture></div></div></div><div class="section-metadata"><div><div>style</div><div>grey</div></div></div></div>\n<div><h2>After</h2><div class="section-metadata"><div><div>style</div><div>grey</div></div></div></div>');
  // the box's heading kept with entities; no labels: the rows that have a text
  const amp = withHotlineFinder('<div><p>[hotline-finder] A &amp; B</p></div>', {});
  assert.equal(amp, '<div><div class="hotline-finder"><div><div>Sheet</div><div><a href="/data/hotlines.json">/data/hotlines.json</a></div></div><div><div>Headline</div><div>A &amp; B</div></div></div><div class="section-metadata"><div><div>style</div><div>grey</div></div></div></div>');
});

test('the hotline labels of a language from the record (www\'s label services)', async () => {
  const { labelsOf } = await import('../tools/importer/b2b-hotlines.mjs');
  const rec = {
    'labels-de': {
      'hotlineNumberDisplay.fullApp.days.MO': 'Montag', 'hotlineNumberDisplay.fullApp.days.TU': 'Dienstag', 'hotlineNumberDisplay.fullApp.days.WE': 'Mittwoch', 'hotlineNumberDisplay.fullApp.days.TH': 'Donnerstag', 'hotlineNumberDisplay.fullApp.days.FR': 'Freitag', 'hotlineNumberDisplay.fullApp.days.SA': 'Samstag', 'hotlineNumberDisplay.fullApp.days.SU': 'Sonntag', 'hotlineNumberDisplay.fullApp.default.serviceHours': 'Öffnungszeiten', 'hotlineNumberDisplay.fullApp.default.phoneNumberLabel': 'Kontaktdaten',
    },
    'ppb-labels-de': { 'b2bHotlineNumberDisplay.fullApp.default.selectCountryLabel': 'Bitte wählen Sie Ihr Land' },
  };
  assert.deepEqual(labelsOf(rec, 'de'), {
    select: 'Bitte wählen Sie Ihr Land', contact: 'Kontaktdaten', hours: 'Öffnungszeiten', days: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'],
  });
  assert.deepEqual(labelsOf({}, 'en'), {});
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

test('www\'s hidden helper links (a link holding only its screen-reader note, an empty link) are dropped; real links keep their note out', async () => {
  const { withoutHelperLinks } = await import('../tools/importer/b2b-import.mjs');
  const raffle = '<p>Bitte lesen Sie die <a hreftemp="/content/B2Bneo/gc/en/x" href="/gc/en/partner-plus-benefit-raffle-terms-and-conditions" target="_blank" rel="noopener noreferrer"><span class="sr-only">The link will be opened in a new browser tab</span></a><a></a><a href="/de/de/partner-plus-benefit-raffle-terms-and-conditions" target="_blank">Teilnahmebedingungen<span class="sr-only">The link will be opened in a new browser tab</span></a>&nbsp;bevor Sie teilnehmen.</p>';
  assert.equal(withoutHelperLinks(raffle), '<p>Bitte lesen Sie die <a href="/de/de/partner-plus-benefit-raffle-terms-and-conditions" target="_blank">Teilnahmebedingungen<span class="sr-only">The link will be opened in a new browser tab</span></a>&nbsp;bevor Sie teilnehmen.</p>');
  // an icon link (its icon and its name for screen readers) and an image link stay
  const icon = '<a href="https://www.linkedin.com/x"><i class="lh lh-linkedin"></i><span class="sr-only">LinkedIn</span></a><a href="/x"><img src="/a.png" alt="A"></a>';
  assert.equal(withoutHelperLinks(icon), icon);
  assert.equal(withoutHelperLinks('<a href="/x"> <span class="sr-only"> note </span> </a>'), '');
  // terms-and-conditions-traveller: the helper with www's "opens in a new tab" icon before the real link
  const terms = 'E-Mail: <a linkmode="mailto:" href="mailto:support.business@lufthansa-group.com" target="_blank"><em class="lh lh-link-popup"></em><span class="sr-only">The link will be opened in a new browser tab</span></a><em class="lh lh-link-popup"><a href="mailto:support.business@lufthansa-group.com">support.business.vie@lufthansa-group.com</a></em>';
  assert.equal(withoutHelperLinks(terms), 'E-Mail: <em class="lh lh-link-popup"><a href="mailto:support.business@lufthansa-group.com">support.business.vie@lufthansa-group.com</a></em>');
  // another icon (a content icon) keeps its link
  const social = '<a href="https://x.example"><em class="lh lh-linkedin"></em><span class="sr-only">LinkedIn</span></a>';
  assert.equal(withoutHelperLinks(social), social);
});

test('the hotline sheet from the record: one row per country with a contact, www\'s order, German names and notes', async () => {
  const { sheetRows } = await import('../tools/importer/b2b-hotlines.mjs');
  const office = (extra) => ({
    phone1: '', phone2: '', email: '', link: '', openingComments: '', comments: '', serviceHours: [], ...extra,
  });
  const rec = {
    'countries-en': { countries: [{ code: 'AT', name: 'Austria' }, { code: 'XK', name: 'Kosovo' }, { code: 'DE', name: 'Germany' }] },
    'countries-de': { countries: [{ code: 'AT', name: 'Österreich' }, { code: 'DE', name: 'Deutschland' }] },
    contacts: {
      AT: { reservationOffices: [office({ phone1: '+43 0720 380 065', email: 'dach.ppb@dlh.de', serviceHours: [{ weekdayId: 'FR', from: '08:00', to: '16:00' }, { weekdayId: 'MO', from: '08:00', to: '18:00' }] })] },
      XK: { reservationOffices: [] },
      DE: { reservationOffices: [office({ phone1: '+49 69 86 799 500', comments: 'Free of charge' })], de: { reservationOffices: [office({ comments: 'Kostenfrei' })] } },
    },
  };
  assert.deepEqual(sheetRows(rec), [
    {
      country: 'AT', 'name-en': 'Austria', 'name-de': 'Österreich', phone: '+43 0720 380 065', phone2: '', email: 'dach.ppb@dlh.de', link: '', hours: 'MO 08:00-18:00; FR 08:00-16:00', 'note-en': '', 'note-de': '',
    },
    {
      country: 'DE', 'name-en': 'Germany', 'name-de': 'Deutschland', phone: '+49 69 86 799 500', phone2: '', email: '', link: '', hours: '', 'note-en': 'Free of charge', 'note-de': 'Kostenfrei',
    },
  ]);
});
