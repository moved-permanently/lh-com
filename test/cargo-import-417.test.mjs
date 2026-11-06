/* eslint-disable max-len, import/extensions */
/* Lufthansa Cargo's importer (tools/importer/cargo-import.mjs), brief 417 (parity pass 1):
   - www's phone-only copies (d-block d-sm-none: the transport stories' text without its picture)
     are left out, as the d-md-none ones: the story's text comes once (row 12);
   - without the asset map (content-sites/lh-cargo/assets/files.json, on the machine that ran
     cargo-assets.mjs), a file is the copy lh-cargo's DA already has under cargo-assets.mjs's name
     (the upload state's media, the --known-from documents' links), so a re-import keeps the
     pictures and documents instead of linking www.
   Run: node --max-old-space-size=512 --test test/cargo-import-417.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { parseHTML } from 'linkedom';
import { isSkipped, knownCopy, knownPaths } from '../tools/importer/cargo-import.mjs';
import { baseName } from '../tools/importer/cargo-assets.mjs';

const sha1 = (s) => crypto.createHash('sha1').update(s).digest('hex');
const node = (html) => parseHTML(`<html><body>${html}</body></html>`).document.body.firstElementChild;

test('isSkipped: www\'s phone-only copies (d-sm-none), as d-md-none and d-lg-none; their desktop counterparts kept', () => {
  assert.equal(isSkipped(node('<div class="d-block d-sm-none"><p>text</p></div>')), true);
  assert.equal(isSkipped(node('<div class="d-sm-none"><p>text</p></div>')), true);
  assert.equal(isSkipped(node('<div class="d-md-none"><p>text</p></div>')), true);
  assert.equal(isSkipped(node('<div class="d-none d-sm-block"><p>text</p></div>')), false, 'hidden on phones only: the desktop copy');
  assert.equal(isSkipped(node('<div class="story-textWrap"><p>text</p></div>')), false);
});

test('knownCopy: a picture or document lh-cargo\'s DA has under cargo-assets.mjs\'s name; none: null', () => {
  const img = 'https://www.lufthansa-cargo.com/documents/20184/1234/bi-produktion.jpg/abc';
  const pdf = 'https://www.lufthansa-cargo.com/documents/20184/99/info-sheet.pdf/def';
  const imgPath = `/media-da/cargo/${baseName(img)}-${sha1(img).slice(0, 8)}.jpg`;
  const pdfPath = `/documents/${baseName(pdf)}-${sha1(pdf).slice(0, 6)}.pdf`;
  const known = new Set([imgPath, pdfPath, '/media-da/cargo/other-12345678.png']);
  assert.equal(knownCopy(img, known), imgPath);
  assert.equal(knownCopy(pdf, known), pdfPath);
  assert.equal(knownCopy('https://www.lufthansa-cargo.com/documents/20184/1/missing.jpg/x', known), null);
});

test('knownPaths: the upload state\'s media and the links and pictures of DA documents (content.da.live URLs as paths)', () => {
  const state = { media: { '/media-da/cargo/a-11111111.jpg': {} }, docs: {} };
  const doc = '<body><main><img src="https://content.da.live/moved-permanently/lh-cargo/media-da/cargo/b-22222222.png"><a href="/documents/c-333333.pdf">c</a><a href="https://www.lufthansa-cargo.com/en/x">x</a></main></body>';
  assert.deepEqual([...knownPaths(state, [doc])].sort(), ['/documents/c-333333.pdf', '/media-da/cargo/a-11111111.jpg', '/media-da/cargo/b-22222222.png']);
});

test('a transport story module with a phone copy and a desktop copy: its headline and text once (the desktop copy\'s)', async () => {
  const { convert } = await import('../tools/importer/cargo-import.mjs');
  const copy = (cls, body) => `<div class="${cls}"><div class="story-textWrap-noimage"><div class="row"><div class="col-md-12"><div class="story-text-background"><h2 class="story-headline">Experts for temperature sensitive transports.</h2><div class="row"><div class="col-md-12">${body}</div></div></div></div></div></div></div>`;
  const page = `<!DOCTYPE html><html><head><title>142.- Arctic temperatures on board - Lufthansa Cargo</title></head><body><div id="main-content"><div class="row-fluid module--story">${copy('d-block d-sm-none', '<p>Boehringer Ingelheim relies on DSV.</p><p>The second paragraph.</p>')}${copy('d-none d-sm-block', '<table class="rmsDiariesTable"><tbody><tr><td>Boehringer Ingelheim relies on DSV.</td><td>The second paragraph.</td></tr></tbody></table>')}</div></div></body></html>`;
  const { html } = convert(page, '/en/-/142.-arctic-temperatures-on-board', 'en');
  assert.equal((html.match(/Experts for temperature sensitive transports\./g) || []).length, 1, html);
  assert.equal((html.match(/Boehringer Ingelheim relies on DSV\./g) || []).length, 1, html);
  // the story's layout table (rmsDiariesTable, one row): its two cells as www's two text columns
  assert.match(html, /<div class="columns-media"><div><div><p>Boehringer Ingelheim relies on DSV\.<\/p><\/div><div><p>The second paragraph\.<\/p><\/div><\/div><\/div>/, html);
  assert.ok(!/table-striped/.test(html));
});

test('a heading before a component in the same container stays before its block (www\'s "Our fleet in detail" above the fleet cards)', async () => {
  const { convert } = await import('../tools/importer/cargo-import.mjs');
  const card = (t) => `<div class="col-12 col-xs-6 col-lg-6 col-md-6"><h3>${t}</h3><div class="paragraph-div"><p>${t} text</p></div></div>`;
  const page = `<!DOCTYPE html><html><head><title>Our fleet - Lufthansa Cargo</title></head><body><div id="main-content"><div class="lfr-layout-structure-item-structure-type-1-fragment"><div class="Structure_type_1_fragment"><div class="fullWidthFragmentContainer white-background even"><div class="fullWidthFragmentInnerContainer"><div class="fragmentWrapper"><div class="row"><div class="col col-lg-12">
<div class="lfr-layout-structure-item-basic-component-heading"><h2>Our fleet in detail</h2></div>
<div class="lfr-layout-structure-item-image-text--two-columns----cf9"><div class="marginTopMobile two-columns mobile-mt-20"><div class="row">${card('Boeing 777F')}${card('Airbus A321F')}</div></div></div>
</div></div></div></div></div></div></div></div></body></html>`;
  const { html } = convert(page, '/en/fleet-ulds/fleet', 'en');
  const heading = html.indexOf('Our fleet in detail');
  const cards = html.indexOf('class="cards-teaser');
  assert.ok(heading > -1 && cards > -1, html);
  assert.ok(heading < cards, html);
});

test('www\'s breadcrumb (Liferay\'s desktopBreadcrumb) as the breadcrumb block where it stands: Home linked, the menu\'s section labels as text, the page last (brief 422)', async () => {
  const { convert } = await import('../tools/importer/cargo-import.mjs');
  const crumbs = '<li><a href="/home">Home </a></li><li class=""><span class="breadcrumb-text-truncate">Info-Hub</span></li><li><span>Fleet &amp; ULD</span></li><li class="active"><span>Our fleet</span></li>';
  const page = `<!DOCTYPE html><html><head><title>Our fleet - Lufthansa Cargo</title></head><body><div id="main-content"><p>Hero</p><div class="portlet-boundary portlet-breadcrumb"><section class="portlet"><div class="portlet-content"><div class="autofit-float autofit-row portlet-header"><h2 class="portlet-title-text">Breadcrumb</h2></div><div class="portlet-body"><nav aria-label="Breadcrumb"><div class="eportalBreadcrumb"><ul class="breadcrumb breadcrumb-horizontal d-none d-md-flex desktopBreadcrumb">${crumbs}</ul><div class="d-md-none mobileBreadcrumb"><a href="javascript:history.back()">Back</a></div></div></nav></div></div></section></div><h1>Our fleet</h1></div></body></html>`;
  const { html } = convert(page, '/en/fleet-ulds/fleet', 'en');
  assert.match(html, /<div class="breadcrumb"><div><div><ul><li><a href="\/en\/home">Home<\/a><\/li><li>Info-Hub<\/li><li>Fleet &amp; ULD<\/li><li>Our fleet<\/li><\/ul><\/div><\/div><\/div>/, html);
  assert.ok(html.indexOf('Hero') < html.indexOf('class="breadcrumb"') && html.indexOf('class="breadcrumb"') < html.indexOf('<h1>'), 'where www has it');
  assert.ok(!/>Breadcrumb</.test(html) && !/Back/.test(html), 'no portlet title, no phone back link');
});

test('www\'s text one third, picture right (Text-Image-horizontal-CF7, eBooking\'s features): columns-media (wide-media), the text first (brief 422)', async () => {
  const { convert } = await import('../tools/importer/cargo-import.mjs');
  const page = '<!DOCTYPE html><html><head><title>eBooking - Lufthansa Cargo</title></head><body><div id="main-content"><div class="lfr-layout-structure-item-text--one-third--left-image-right--horizontal----cf7"><div class="Text-Image-horizontal-CF7 mobile-mt-20 marginTopMobile text-one-third"><div class="row"><div class="col-md-4 content-section"><h3>eBooking features and functions</h3><ul><li>Get real-time offers</li></ul></div><div class="col-md-8 image-section"><div class="component-image"><img src="https://www.lufthansa-cargo.com/documents/20184/1/built.png/x" alt=""></div></div></div></div></div></div></body></html>';
  const { html } = convert(page, '/en/ebooking-info', 'en');
  assert.match(html, /<div class="columns-media wide-media"><div><div><h3>eBooking features and functions<\/h3><ul><li>Get real-time offers<\/li><\/ul><\/div><div>(<p>)?<picture>/, html);
});

test('a story module with its picture: the text box over it as www\'s (hero-card-overlay (light), at the right where www\'s box is: offset-md-8), its headline the page\'s H1 first (brief 422)', async () => {
  const { convert } = await import('../tools/importer/cargo-import.mjs');
  const module = (offset, title, body) => `<div class="row-fluid module--story"><div class="story-imageWrap"><img src="https://www.lufthansa-cargo.com/documents/20184/1/${title.length}.jpg/x" alt="Story Image"></div><div class="story-textWrap "><div class="col-md-4 ${offset}"><div class="story-text-background"><h2 class="story-headline">${title}</h2><div class="row"><div class="col-md-12"><p>${body}</p></div></div></div></div></div></div>`;
  const page = `<!DOCTYPE html><html><head><title>142.- Arctic temperatures on board - Lufthansa Cargo</title></head><body><div id="main-content">${module('', 'Arctic temperatures on board.', 'On Greenland\'s ice cap.')}${module('offset-md-8', 'Where is the airport of Biberach?', 'The distance from North America.')}</div></body></html>`;
  const { html } = convert(page, '/en/-/142.-arctic-temperatures-on-board', 'en');
  assert.match(html, /<div class="hero-card-overlay light"><div><div><picture><img[^>]*><\/picture><\/div><\/div><div><div><h1>Arctic temperatures on board\.<\/h1><p>On Greenland's ice cap\.<\/p><\/div><\/div><\/div>/, html);
  assert.match(html, /<div class="hero-card-overlay light right"><div><div><picture><img[^>]*><\/picture><\/div><\/div><div><div><h2>Where is the airport of Biberach\?<\/h2><p>The distance from North America\.<\/p><\/div><\/div><\/div>/, html);
});

test('www\'s image tiles (LCAGCP-lcagTile, What\'s up now?) as cards-teaser (overlay, mosaic): the text over the picture, edge to edge (brief 422)', async () => {
  const { convert } = await import('../tools/importer/cargo-import.mjs');
  const tile = (t, w) => `<div class="col-md-${w} lcagTileSmallOverlay LCAGCP-lcagTile LCAGCP-custom-x"><div class="LCAGCP-lcagTileImage" style="background-image:url('https://www.lufthansa-cargo.com/documents/20184/1/${t}.jpg/x')"></div><div class="LCAGCP-lcagTileTextContainer"><div class="LCAGCP-headerImageHeadline LCAGCP-lcagFontHeadBold">${t}</div><a class="primaryButton" href="/en/ci/${t}">Details</a></div></div>`;
  const page = `<!DOCTYPE html><html><head><title>What's up now? - Lufthansa Cargo</title></head><body><div id="main-content"><div class="journal-content-article"><div class="container-fluid"><div class="row">${tile('berggruen', 6)}${tile('desert', 6)}</div></div></div></div></body></html>`;
  const { html } = convert(page, '/en/ci/whats-up-now', 'en');
  assert.match(html, /<div class="cards-teaser overlay mosaic">/, html);
});

test('www\'s boxed cards (lcagCard: the industries) as cards-teaser (four-up, boxed); plain card rows as before (brief 422)', async () => {
  const { convert } = await import('../tools/importer/cargo-import.mjs');
  const card = (t, boxed) => `<div class="col-12 col-xs-3 col-lg-3 col-md-6">${boxed ? '<div class="lcagCard">' : '<div>'}<div class="content"><h4 class="cardHeadline">${t}</h4><p>${t} text</p></div></div></div>`;
  const row = (boxed) => `<!DOCTYPE html><html><head><title>Industries - Lufthansa Cargo</title></head><body><div id="main-content"><div class="cf-12 four-columns"><div class="row">${['Pharma', 'Aviation', 'Automotive', 'Agriculture'].map((t) => card(t, boxed)).join('')}</div></div></div></body></html>`;
  assert.match(convert(row(true), '/en/industries-in-focus', 'en').html, /<div class="cards-teaser four-up boxed">/);
  assert.match(convert(row(false), '/en/industries-in-focus', 'en').html, /<div class="cards-teaser four-up">/);
});

test('www\'s Mynewsdesk newsroom (brief 422): the newsroom block with the page\'s own newsroom (the German page: the German newsroom) and its link as the fallback', async () => {
  const { convert } = await import('../tools/importer/cargo-import.mjs');
  const page = (host) => `<!DOCTYPE html><html><head><title>Newsroom - Lufthansa Cargo</title></head><body><div id="main-content"><div class="journal-content-article"><div id="mnd-script"><script>(function(){var s=document.createElement("script");s.src="//${host}/hosted_newsroom.js";})();</script></div><iframe id="mnd-iframe" src="//${host}" height="3840"></iframe></div></div></body></html>`;
  const de = convert(page('lufthansa-cargo-ag.mynewsdesk.com'), '/de/ci/newsroom', 'de').html;
  assert.match(de, /<div class="newsroom"><div><div>Newsroom<\/div><div><a href="https:\/\/lufthansa-cargo-ag\.mynewsdesk\.com">https:\/\/lufthansa-cargo-ag\.mynewsdesk\.com<\/a><\/div><\/div><div><div><p><a href="https:\/\/lufthansa-cargo-ag\.mynewsdesk\.com">Newsroom von Lufthansa Cargo auf Mynewsdesk<\/a><\/p><\/div><\/div><\/div>/, de);
  const en = convert(page('lufthansa-cargo-ag-com.mynewsdesk.com'), '/en/ci/newsroom', 'en').html;
  assert.match(en, /<div class="newsroom"><div><div>Newsroom<\/div><div><a href="https:\/\/lufthansa-cargo-ag-com\.mynewsdesk\.com">/);
  assert.ok(!/hosted_newsroom/.test(en), 'no script in the document');
});

test('www\'s icon collapsibles (LhcIconCollapsible: the SDG goals) as accordion-columns (faq): the icon and the bold title as the item\'s title, the text as its panel', async () => {
  const { convert } = await import('../tools/importer/cargo-import.mjs');
  const item = (n, title, text) => `<div class="LhcIconCollapsibleItem"><div class="LhcIconCollapsibleHeadContainer LhcICTrigger"><img class="LhcIconCollapsibleIcon" src="https://www.lufthansa-cargo.com/documents/20184/1/0${n}.jpg/x" alt=""><div class="LhcIconCollapsibleHeadText"><p><strong>${title}: </strong>${text}</p></div></div><div class="LhcIconCollapsibleText"><div class="row iconCollapsibleRow"><div class="columns col-md-5"><ul><li>${title} detail</li></ul></div></div></div></div>`;
  const page = `<!DOCTYPE html><html><head><title>Sustainable development goals - Lufthansa Cargo</title></head><body><div id="main-content"><div class="journal-content-article"><div class="container innerRowContainer"><h2>The 2030 Agenda</h2><div class="row LhcIconCollapsible">${item(1, 'Climate action', 'We are taking action.')}${item(2, 'Good health and wellbeing', 'We deliver medical products.')}</div></div></div></div></body></html>`;
  const { html } = convert(page, '/en/ci/sustainable-development-goals', 'en');
  assert.match(html, /<div class="accordion-columns faq">/, html);
  assert.match(html, /<div><div><picture><img src="[^"]*01[^"]*" alt=""><\/picture> ?<strong>Climate action: ?<\/strong> ?We are taking action\.<\/div><div>(<p>)?<ul><li>Climate action detail<\/li><\/ul>/, html);
  assert.equal((html.match(/<div><div><picture>/g) || []).length, 2, 'one item per goal');
  assert.ok(html.indexOf('The 2030 Agenda') < html.indexOf('accordion-columns'), 'the heading above the goals');
});
