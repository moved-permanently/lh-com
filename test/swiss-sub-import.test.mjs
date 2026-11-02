/* eslint-disable max-len, import/extensions -- the importer modules are .mjs */
/* SWISS's sub-sites' import steps (tools/importer/swiss-sub-import.mjs, next to swiss-import.mjs):
   the sub-site's chrome out of the snapshot (header, breadcrumb, footer, dialogs; the nav and
   footer documents carry them), www's on-site search as the search-results block on the sub-site
   language's index, the links (sub-site pages relative, the main site's where lh-swiss has them,
   the rest on www; links the import wrote on www.lufthansa.com first mapped to www.swiss.com).
   Run: node --max-old-space-size=512 --test test/swiss-sub-import.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  withoutSubSiteChrome, withSearchResults, searchResultsBlock, SEARCH_MARK, subSiteLinks, SUB_SITE_NAMES,
} from '../tools/importer/swiss-sub-import.mjs';

test('the sub-sites: corporate and medicalservices (scripts/site-languages.js SUB_SITES)', () => {
  assert.deepEqual(SUB_SITE_NAMES, ['corporate', 'medicalservices']);
});

test('withoutSubSiteChrome: header, breadcrumb, footer, skip links, language dialogs and the empty message box go; the h1 and the content stay', () => {
  const html = `<body><div class="contentpage-wrapper"><div class="skiplinks container-fluid"><ul><li><a href="#nav">Go to navigation</a></li></ul></div>
<header id="header" class="swiss-header-on-top"><a href="/en/homepage"><img src="/etc/designs/lx/clientlib-all/vite/img/swiss-logo.svg"></a></header>
<div class="container-fluid container"><div class="maui-breadcrumb"><maui-breadcrumb-item>SWISS Corporate</maui-breadcrumb-item></div></div>
<h2 id="main" class="sr-only">Main content</h2>
<div class="contentpage container container-fluid"><div class="dcep-general-message-box"></div><h1 class="heading-large">SWISS Corporate</h1>
<div class="content-wrapper"><div class="container-content"><div class="text section"><p>Body</p></div></div></div></div>
<footer><div class="swiss-footer">Footer</div></footer></div>
<maui-modal class="modal-size-m country-language-selector-modal"><form>Continue</form></maui-modal></body>`;
  const out = withoutSubSiteChrome(html);
  ['swiss-header-on-top', 'maui-breadcrumb', 'swiss-footer', 'skiplinks', 'country-language-selector-modal', 'dcep-general-message-box'].forEach((x) => assert.ok(!out.includes(x), x));
  assert.ok(out.includes('<h1 class="heading-large">SWISS Corporate</h1>'));
  assert.ok(out.includes('<p>Body</p>'));
});

test('withSearchResults + searchResultsBlock: www\'s on-site search as the search-results block on /<sub-site>/<ll>/search-index.json', () => {
  const html = '<div class="container-content"><div class="onsitesearchresult section"><div class="dcep-search-result" data-dcep="{}"><input></div></div></div></div></div>';
  const mapped = withSearchResults(html);
  assert.ok(!mapped.includes('onsitesearchresult'));
  assert.ok(mapped.includes(SEARCH_MARK));
  const doc = `<div><h1>Search results</h1><p>${SEARCH_MARK}</p></div>`;
  assert.equal(searchResultsBlock(doc, '/corporate/de/search-results'), '<div><h1>Search results</h1><div class="search-results"><div><div>/corporate/de/search-index.json</div></div></div></div>');
  assert.equal(searchResultsBlock('<div><p>x</p></div>', '/corporate/de/x'), '<div><p>x</p></div>', 'no marker: as it is');
  assert.equal(withSearchResults('<div class="container-content"><p>x</p></div>'), '<div class="container-content"><p>x</p></div>');
});

test('subSiteLinks: captured sub-site pages relative (www.swiss.com, relative or as the import wrote them on www.lufthansa.com), others on www; the main site\'s pages relative where lh-swiss has them', () => {
  const subPages = new Set(['/corporate/en/company', '/corporate/en/homepage', '/medicalservices/de/contact']);
  const sitePaths = new Set(['/ch/en/book-and-manage/flights']);
  const doc = [
    '<a href="https://www.swiss.com/corporate/en/company">a</a>',
    '<a href="https://www.lufthansa.com/corporate/en/company.html">b</a>',
    '<a href="/medicalservices/de/contact#map">c</a>',
    '<a href="https://www.swiss.com/corporate/en">d</a>',
    '<a href="https://www.swiss.com/corporate/en/not-captured">e</a>',
    '<a href="https://www.lufthansa.com/ch/en/book-and-manage/flights">f</a>',
    '<a href="https://www.lufthansa.com/ch/en/fly/check-in">g</a>',
    '<a href="https://www.youtube.com/watch?v=1">h</a>',
  ].join('');
  const out = subSiteLinks(doc, { subPages, sitePaths });
  const hrefs = [...out.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(hrefs, [
    '/corporate/en/company',
    '/corporate/en/company',
    '/medicalservices/de/contact#map',
    '/corporate/en/homepage',
    'https://www.swiss.com/corporate/en/not-captured',
    '/ch/en/book-and-manage/flights',
    'https://www.swiss.com/ch/en/fly/check-in',
    'https://www.youtube.com/watch?v=1',
  ]);
  // a document read from www's markup (the nav and footer): its www.lufthansa.com links are
  // Lufthansa's
  const footer = subSiteLinks('<a href="https://www.lufthansa.com/de/de/homepage">Lufthansa</a><a href="https://www.swiss.com/corporate/en/company">x</a>', { subPages, sitePaths, mapHosts: false });
  assert.equal(footer, '<a href="https://www.lufthansa.com/de/de/homepage">Lufthansa</a><a href="/corporate/en/company">x</a>');
});

test('swiss-sub-nav.mjs: the nav of a sub-site\'s language: logo to the main site\'s homepage, "Book flight", the menu from lx-header-nav-horizontal, the search, the menu label', async () => {
  const { parseHTML } = await import('linkedom');
  const { subNavDocument, subMenuOf } = await import('../tools/importer/swiss-sub-nav.mjs');
  const json = (o) => JSON.stringify(o).replace(/"/g, '&quot;');
  const menu = { id: 'lx-header-nav-horizontal', menuItems: [{ label: 'Unternehmen', menuItems: [{ label: 'Über uns', href: '/corporate/de/company/about-us', menuItems: [{ label: 'Verwaltungsrat', href: '/corporate/de/company/about-us/board-of-directors' }] }] }] };
  const burger = { id: 'lx-header-nav-burgermenu', burgerMenuTopLinkLabel: 'Flug buchen', burgerMenuTopLinkUrl: '/ch/de/book-and-manage/flights' };
  const { document } = parseHTML(`<html><body><header><div class="swiss-logo"><a href="/de/homepage"><img src="/etc/designs/lx/clientlib-all/vite/img/swiss-logo.svg"></a></div>
<div data-dcep="${json(burger)}"></div><nav><div data-dcep="${json(menu)}"></div></nav><button class="btn-link" aria-label="Menü"></button></header></body></html>`);
  assert.deepEqual(subMenuOf(document), [{ label: 'Unternehmen', columns: [{ label: 'Über uns', href: '/corporate/de/company/about-us', links: [{ label: 'Verwaltungsrat', href: '/corporate/de/company/about-us/board-of-directors' }] }] }]);
  const sitePaths = new Set(['/ch/de/homepage', '/ch/de/book-and-manage/flights']);
  const doc = subNavDocument(document, 'corporate/de', sitePaths, { search: { href: '/corporate/de/search-results', label: 'Suchergebnisse' } });
  const sections = doc.trim().split('\n<div>').length;
  assert.equal(sections, 4, 'brand, quick actions, menu, tools');
  assert.ok(doc.startsWith('<div><p><a href="/ch/de/homepage"><img src="https://www.swiss.com/etc/designs/lx/clientlib-all/vite/img/swiss-logo.svg" alt="SWISS"></a></p></div>'));
  assert.ok(doc.includes('<li><a href="/ch/de/book-and-manage/flights">Flug buchen</a></li>'));
  assert.ok(doc.includes('<p>Unternehmen</p>'));
  assert.ok(doc.includes('<a href="https://www.swiss.com/corporate/de/company/about-us">Über uns</a>'), 'sub-site links on www until subSiteLinks');
  assert.ok(doc.includes('<li>:search: <a href="/corporate/de/search-results">Suchergebnisse</a></li>'));
  assert.ok(doc.includes('<p>Menü</p>'));
  // no main site homepage of the language on lh-swiss (fr): www's
  const fr = subNavDocument(document, 'corporate/fr', sitePaths);
  assert.ok(fr.startsWith('<div><p><a href="https://www.swiss.com/de/homepage">'));
  assert.ok(!fr.includes(':search:'), 'no search without one');
});

test('withoutSubSiteChrome: the form\'s jQuery UI date picker (appended to the body, hidden on www) is no content', () => {
  const html = '<body><div class="contentpage"><p>Form</p></div><div id="ui-datepicker-div" class="ui-datepicker"><div><a>Prev</a><a>Next</a></div><table><tr><td><a href="#">1</a></td></tr></table></div></body>';
  const out = withoutSubSiteChrome(html);
  assert.ok(!out.includes('ui-datepicker'));
  assert.ok(out.includes('<p>Form</p>'));
});

test('withOneH1: the page\'s first h1 stays; www\'s teaser headings written as h1 (heading-copytext-large) become h3 with their ids and style markers', async () => {
  const { withOneH1 } = await import('../tools/importer/swiss-sub-import.mjs');
  const doc = '<div><h1 id="lehrstellen">Lehrstellen</h1><p>x</p><h1 id="neues-triebwerk">Neues Triebwerk einbauen {heading-copytext-large}</h1><h1 id="magazine"><a href="/x">Unser SWISS Magazine</a></h1></div>';
  assert.equal(withOneH1(doc), '<div><h1 id="lehrstellen">Lehrstellen</h1><p>x</p><h3 id="neues-triebwerk">Neues Triebwerk einbauen {heading-copytext-large}</h3><h3 id="magazine"><a href="/x">Unser SWISS Magazine</a></h3></div>');
  assert.equal(withOneH1('<div><h1>One</h1></div>'), '<div><h1>One</h1></div>');
});

test('swiss-sub-dam.mjs: images from their place in lh-swiss\'s DA (the asset\'s Edge Delivery name); a file\'s widest rendition and www\'s own spelling from the snapshot', async () => {
  const { withDaImages, filesOf, DA_CONTENT } = await import('../tools/importer/swiss-sub-dam.mjs');
  const doc = '<img src="https://www.swiss.com/content/dam/lx/images/pixels_variations/c-782958244-2281090.jpg.transform/lh-dcep-transform-width-2560/img.jpg" alt=""><a href="/content/dam/lx/documents/sustainability-report-2024.pdf">PDF</a><img src="/etc/designs/lx/clientlib-all/vite/img/swiss-logo.svg">';
  const out = withDaImages(doc);
  const { edsDamPath } = await import('../scripts/dam-path.js');
  assert.ok(out.includes(`<img src="${DA_CONTENT}${edsDamPath('/content/dam/lx/images/pixels_variations/c-782958244-2281090.jpg')}" alt="">`), out);
  assert.ok(out.includes(`<img src="${DA_CONTENT}/etc/designs/lx/clientlib-all/vite/img/swiss-logo.svg">`));
  assert.ok(out.includes('href="/content/dam/lx/documents/sustainability-report-2024.pdf"'), 'links as they are');
  assert.equal(withDaImages(out), out, 'idempotent');
  const files = filesOf([
    { p: '/corporate/en/a', doc: '<img src="https://www.swiss.com/content/dam/lx/images/x/Pic_1.jpg.transform/lh-dcep-transform-width-1440/img.jpg">', snap: '' },
    { p: '/corporate/en/b', doc: '<img src="https://www.swiss.com/content/dam/lx/images/x/Pic_1.jpg.transform/lh-dcep-transform-width-2560/img.jpg"><a href="/content/dam/lx/documents/my-file.pdf">x</a>', snap: '<a href="/content/dam/lx/documents/My File.pdf">' },
  ]);
  const image = [...files.values()].find((x) => x.kind === 'image');
  assert.ok(image.www.includes('width-2560') && image.pages.size === 2, 'the widest rendition, both pages');
  const pdf = [...files.values()].find((x) => x.kind === 'link');
  assert.equal(pdf.www, '/content/dam/lx/documents/My File.pdf', 'www\'s own spelling');
});
