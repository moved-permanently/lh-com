/* eslint-disable max-len */
/* tools/importer/own-links.mjs: links to the brand site's own pages become relative (href and the
   Parent row's link text), links to pages it lacks stay on www (counted by reason), relative links
   to pages it lacks go back to www.
   Run: node --max-old-space-size=512 --test test/own-links.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';

// eslint-disable-next-line import/extensions
const { withOwnLinks, keptReason, sitePath } = await import('../tools/importer/own-links.mjs');

const HOST = 'www.ita-airways.com';
const pages = new Set(['/it/en/homepage', '/al/en/homepage', '/it/en/book-and-prepare/offers', '/it/en/book-and-prepare/travel-information/at-the-airport/lounges/piazza-spagna', '/xx/en/book-and-prepare/offers-and-destinations', '/ch/fr/book-and-prepare/baggage']);

test('sitePath: .html, a trailing slash and %-escapes as our paths have them', () => {
  assert.equal(sitePath('/it/en/homepage.html'), '/it/en/homepage');
  assert.equal(sitePath('/it/en/book-and-prepare/offers/'), '/it/en/book-and-prepare/offers');
  assert.equal(sitePath('/it/en/a%20b'), '/it/en/a b');
});

test('www links to the site\'s pages become relative; query, fragment and other attributes stay', () => {
  const doc = '<p><a href="https://www.ita-airways.com/it/en/homepage.html"><img src="logo.svg" alt="ITA"></a> <a href="https://www.ita-airways.com/al/en/homepage">Albania</a> <a href="https://www.ita-airways.com/it/en/book-and-prepare/travel-information/at-the-airport/lounges/piazza-spagna/?x=1&amp;y=2#hours" title="t">Lounge</a> <a href="https://www.ita-airways.com/ch/fr/book-and-prepare/baggage">Bagages</a></p>';
  const r = withOwnLinks(doc, HOST, pages);
  assert.equal(r.made.href, 4);
  assert.match(r.doc, /href="\/it\/en\/homepage"/);
  assert.match(r.doc, /href="\/al\/en\/homepage">Albania/);
  assert.match(r.doc, /href="\/it\/en\/book-and-prepare\/travel-information\/at-the-airport\/lounges\/piazza-spagna\?x=1&amp;y=2#hours" title="t"/);
  assert.match(r.doc, /href="\/ch\/fr\/book-and-prepare\/baggage"/, 'a market root\'s page lh-edge answers from its language document');
  assert.ok(!r.doc.includes('www.ita-airways.com'));
});

test('the Parent row: link text that is the www URL of a site page becomes the path (the breadcrumb\'s meta)', () => {
  const doc = '<div><div>Parent</div><div><p><a href="/it/en/homepage">https://www.ita-airways.com/it/en/homepage</a></p><p><a href="/it/en/book-and-prepare/offers">https://www.ita-airways.com/it/en/book-and-prepare/offers</a></p></div></div>';
  const r = withOwnLinks(doc, HOST, pages);
  assert.equal(r.made.text, 2);
  assert.equal(r.doc, '<div><div>Parent</div><div><p><a href="/it/en/homepage">/it/en/homepage</a></p><p><a href="/it/en/book-and-prepare/offers">/it/en/book-and-prepare/offers</a></p></div></div>');
});

test('links to pages the site lacks stay on www, by reason; other hosts are not touched', () => {
  const links = ['/deeplink/cockpit/', '/lhg/it/it/dest/c/italia', '/it/en/login', '/xx/de/homepage', '/it/en/support/utilities/cash-and-miles', '/content/dam/ita/x.pdf', '/', '/it/en'];
  const doc = `${links.map((p) => `<a href="https://www.ita-airways.com${p}">x</a>`).join('')}<a href="https://shop.ita-airways.com/booking">b</a>`;
  const r = withOwnLinks(doc, HOST, pages);
  assert.equal(r.made.href, 0);
  assert.equal(r.doc, doc);
  assert.deepEqual(r.kept, {
    'deeplinks and services (booking, my bookings, app hand-offs)': 1,
    '/lhg/ (not migrated)': 1,
    'login and profile (app shells, left out)': 1,
    'root the site lacks': 1,
    'pages not in the site (left out or not on www)': 1,
    'files on www (the DAM step: 404 there or on AEM)': 1,
    'www root': 1,
    'root without page (www redirects it)': 1,
  });
  assert.equal(keptReason('/xx/de/homepage', pages), 'root the site lacks');
});

test('a relative link to a page the site lacks goes back to www; the site\'s own relative links stay', () => {
  const doc = '<a href="/xx/de/book-and-prepare/baggage?a=1">de</a><a href="/it/en/homepage">home</a><a href="/content/dam/ita/x.pdf">pdf</a>';
  const r = withOwnLinks(doc, HOST, pages);
  assert.equal(r.made.back, 1);
  assert.equal(r.doc, '<a href="https://www.ita-airways.com/xx/de/book-and-prepare/baggage?a=1">de</a><a href="/it/en/homepage">home</a><a href="/content/dam/ita/x.pdf">pdf</a>');
});

test('aliases: a www path that stands for a site page (www\'s redirect or canonical) links that page; one whose page the site lacks stays', () => {
  const aliases = new Map([['/it/en/plan/accessible-travel', '/it/en/book-and-prepare/offers'], ['/it/en/old', '/it/en/missing']]);
  const doc = '<a href="https://www.ita-airways.com/it/en/plan/accessible-travel?x=1#a">a</a><a href="https://www.ita-airways.com/it/en/old">b</a>';
  const r = withOwnLinks(doc, HOST, pages, aliases);
  assert.equal(r.made.href, 1);
  assert.equal(r.made.alias, 1);
  assert.equal(r.doc, '<a href="/it/en/book-and-prepare/offers?x=1#a">a</a><a href="https://www.ita-airways.com/it/en/old">b</a>');
});
