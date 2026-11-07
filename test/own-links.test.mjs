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

test('a link-out document (the allowlist\'s linkOuts: www runs an app there) keeps its link to its own www page; one made relative goes back', () => {
  const own = '/it/en/book-and-prepare/offers';
  const doc = '<p><a href="https://www.ita-airways.com/it/en/book-and-prepare/offers">Offers</a> {full-width}</p><p><a href="/it/en/book-and-prepare/offers">again</a> <a href="/it/en/book-and-prepare/offers#terms">terms</a> <a href="https://www.ita-airways.com/it/en/homepage">home</a></p>';
  const r = withOwnLinks(doc, HOST, pages, new Map(), { linkOut: own });
  assert.equal(r.doc, '<p><a href="https://www.ita-airways.com/it/en/book-and-prepare/offers">Offers</a> {full-width}</p><p><a href="https://www.ita-airways.com/it/en/book-and-prepare/offers">again</a> <a href="/it/en/book-and-prepare/offers#terms">terms</a> <a href="/it/en/homepage">home</a></p>');
  assert.equal(r.made.href, 1, 'only the homepage link');
  assert.equal(r.made.back, 1, 'the self link made relative before');
  assert.equal(r.kept['the page\'s own link out to www (its app or widget)'], 1);
  // without linkOut the same document links to itself
  assert.ok(withOwnLinks(doc, HOST, pages).doc.startsWith('<p><a href="/it/en/book-and-prepare/offers">Offers</a>'));
});

// Brussels Airlines (2026-11-01): its login and profile pages are lh-app's on the replica (lh-com
// b8253346, 19a5cd63) for every root, and brussels.turnsthe.page answers /deeplink/cockpit
// (lh-backends 594d7fd): links to them go to our own pages, the same path, query and fragment
// eslint-disable-next-line import/extensions
const { ownServed } = await import('../tools/importer/own-links.mjs');
const BRU = 'www.brusselsairlines.com';
const bruPages = new Set(['/be/en/homepage', '/be/en/my-bookings', '/sn/fr/homepage']);

test('served paths (app pages, deep links): relative with their query and fragment, only on the site\'s roots', () => {
  const served = ownServed('lh-brussels');
  assert.ok(served.length, 'lh-brussels.json lists what the replica serves without a document');
  const doc = [
    '<a href="https://www.brusselsairlines.com/deeplink/cockpit?country=BE&amp;language=EN">My flights</a>',
    '<a href="https://www.brusselsairlines.com/be/en/profile/login">Log in</a>',
    '<a href="https://www.brusselsairlines.com/sn/fr/profile/travel-id">Travel ID</a>',
    '<a href="https://www.brusselsairlines.com/be/nl/profile/travel-id/travel-id-data-protection">Privacy</a>',
    '<a href="https://www.brusselsairlines.com/be/en/profile/my-account/cug-verification#cug-student">Students</a>',
    '<a href="https://www.brusselsairlines.com/be/en/profile/travel-cockpit">Cockpit</a>',
    '<a href="https://www.brusselsairlines.com/qq/en/profile/login">no such root</a>',
    '<a href="https://www.brusselsairlines.com/deeplink/booking?x=1">another deep link</a>',
  ].join(' ');
  const r = withOwnLinks(doc, BRU, bruPages, new Map(), { served });
  assert.match(r.doc, /href="\/deeplink\/cockpit\?country=BE&amp;language=EN">My flights/);
  assert.match(r.doc, /href="\/be\/en\/profile\/login">Log in/);
  assert.match(r.doc, /href="\/sn\/fr\/profile\/travel-id">Travel ID/);
  assert.match(r.doc, /href="\/be\/nl\/profile\/travel-id\/travel-id-data-protection">Privacy/);
  assert.match(r.doc, /href="\/be\/en\/profile\/my-account\/cug-verification#cug-student">Students/);
  assert.match(r.doc, /href="\/be\/en\/profile\/travel-cockpit">Cockpit/);
  assert.match(r.doc, /href="https:\/\/www\.brusselsairlines\.com\/qq\/en\/profile\/login">no such root/, 'a root the site lacks stays on www');
  assert.match(r.doc, /href="https:\/\/www\.brusselsairlines\.com\/deeplink\/booking\?x=1">another deep link/, 'only the served deep links');
  assert.equal(r.made.href, 6);
});

test('served paths: the back-to-www step leaves them relative; without the option as before', () => {
  const served = ownServed('lh-brussels');
  const doc = '<a href="/be/en/profile/login">Log in</a> <a href="/be/en/no-such-page">x</a>';
  const r = withOwnLinks(doc, BRU, bruPages, new Map(), { served });
  assert.match(r.doc, /href="\/be\/en\/profile\/login"/);
  assert.match(r.doc, /href="https:\/\/www\.brusselsairlines\.com\/be\/en\/no-such-page"/);
  const before = withOwnLinks('<a href="https://www.brusselsairlines.com/be/en/profile/login">Log in</a>', BRU, bruPages);
  assert.match(before.doc, /href="https:\/\/www\.brusselsairlines\.com\/be\/en\/profile\/login"/, 'no served list: www, as before');
  assert.deepEqual(ownServed('lh-no-such-site'), []);
});

// Lufthansa Group for Business (2026-11-02): its rest-of-world documents live on xx/<ll> with a
// `markets` row of the roots they serve (every root of the language but de), its own documents on
// market roots: the pages of those roots are the site's pages too (lh-edge answers them from the
// document), as a language version's are
test('ownPages: a document outside the language versions with a markets row of roots: those roots\' pages too', async () => {
  const { ownPages } = await import('../tools/importer/own-links.mjs');
  // the documents: test/fixtures/own-links/content (brief 445: no tree under the current directory)
  const dir = new URL('./fixtures/own-links/content', import.meta.url).pathname;
  const pages = ownPages('lh-test-ownpages', { dir });
  ['/xx/en/about-us/contact', '/ae/en/about-us/contact', '/at/en/about-us/contact', '/ch/en/about-us/contact', '/ch/en/program/experts'].forEach((p) => assert.ok(pages.has(p), p));
  assert.ok(!pages.has('/de/en/about-us/contact'), 'only the listed roots');
  assert.ok(!pages.has('/ae/en/nav'), 'nav and footer stay their root\'s');
});

// brief 413: ITA's es/es rows get us/es and ve/es (tools/importer/add-market-roots.mjs); before the
// harness's local documents have the new rows, --with-markets counts the pages as they will be,
// --only writes the listed documents alone; --content-dir another tree (its runs/ beside it)
test('ownPages withMarkets and the CLI\'s --with-markets, --only and --content-dir: the rows as the list makes them, only the listed documents written', async () => {
  const fs = await import('node:fs');
  const os = await import('node:os');
  const path = await import('node:path');
  const { execFileSync } = await import('node:child_process');
  const { ownPages } = await import('../tools/importer/own-links.mjs');
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'own-links-413-'));
  const dir = path.join(base, 'content');
  const write = (p, html) => {
    fs.mkdirSync(path.dirname(path.join(dir, `${p}.plain.html`)), { recursive: true });
    fs.writeFileSync(path.join(dir, `${p}.plain.html`), html);
  };
  const row = (v) => `<div class="metadata"><div><div>markets</div><div>${v}</div></div></div>`;
  try {
    write('/es/es/book', `<div><p>book</p>${row('ar/es, do/es')}</div>`);
    write('/es/es/legal', `<div><p>legal</p>${row('')}</div>`);
    write('/us/es/doc', '<div><a href="https://www.ita-airways.com/us/es/book">B</a> <a href="https://www.ita-airways.com/us/es/legal">L</a></div>');
    write('/ve/es/doc', '<div><a href="https://www.ita-airways.com/ve/es/book">B</a> <a href="https://www.ita-airways.com/ve/es/legal">L</a></div>');
    const before = ownPages('lh-ita', { dir });
    assert.ok(!before.has('/us/es/book'), 'the row as it is: ar/es, do/es only');
    assert.ok(before.has('/us/es/legal'), 'an empty row: every Spanish root');
    const after = ownPages('lh-ita', { dir, withMarkets: new Map([['/es/es/book', ['us/es']]]) });
    assert.ok(after.has('/us/es/book'));
    assert.ok(!after.has('/ve/es/book'), 'only the list\'s roots');
    fs.writeFileSync(path.join(base, 'markets.txt'), '# the list\n/es/es/book us/es\n');
    fs.writeFileSync(path.join(base, 'only.txt'), '/us/es/doc\n');
    const cli = new URL('../tools/importer/own-links.mjs', import.meta.url).pathname;
    const out = execFileSync('node', [cli, '--site', 'lh-ita', '--host', 'www.ita-airways.com', '--content-dir', dir, '--with-markets', path.join(base, 'markets.txt'), '--only', path.join(base, 'only.txt'), '--write'], { encoding: 'utf8' });
    assert.match(out, /lh-ita: \d+ pages; 1 documents changed/);
    const us = fs.readFileSync(path.join(dir, 'us/es/doc.plain.html'), 'utf8');
    assert.match(us, /href="\/us\/es\/book"/);
    assert.match(us, /href="\/us\/es\/legal"/);
    assert.doesNotMatch(fs.readFileSync(path.join(dir, 've/es/doc.plain.html'), 'utf8'), /href="\/ve/, 'not in --only: as it was');
    assert.equal(fs.readFileSync(path.join(base, 'runs/own-links-upload.txt'), 'utf8'), '/us/es/doc\n', 'runs/ beside the tree');
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
});
