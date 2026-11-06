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
