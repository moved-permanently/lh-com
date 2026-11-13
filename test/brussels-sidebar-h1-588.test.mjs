/* eslint-disable max-len */
/* The brief after 588, item 2: a Brussels sidebar whose content opens with the page's h1 and holds what keeps it from
   lh-com's columns-media sidebar (accordions, a table, a link list) imports as default content, the h1 44 px higher
   than www's at 1440 (30 at 390): cancel-and-refund-requests en / fr and service-charges en / nl (brussels-parity-004,
   -006), every recorded page of the kind. The Brussels import marks it (withSidebarH1, on the snapshot), the section
   gets the style sidebar-h1 (withSidebarH1Style) and the theme moves the h1 down 44 / 30 px. Measured with the style
   added on the live pages: the h1 at www's y at both widths. A page whose www h1 is not in a sidebar (checked-baggage,
   our-payment-methods ...: ours within 6 px of www's) gets no style. Fixture: the sidebar of the R2 drop's
   /be/en/my-bookings/cancel-and-refund-requests snapshot, verbatim.
   Run: node --max-old-space-size=256 --test test/brussels-sidebar-h1-588.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  withSidebarH1, withSidebarH1Style, SIDEBAR_H1,
} from '../tools/importer/brussels-import.mjs';

const read = (f) => fs.readFileSync(new URL(f, import.meta.url), 'utf8');
const sidebar = read('./fixtures/brussels-sidebar-h1-588/be-en-cancel-and-refund-requests.html').replace(/^<!--[^\n]*\n/, '').trim();
const page = (inner) => `<html><body><div class="container-content"><div class="section"><div class="section-content">${inner}</div></div></div></body></html>`;
const marked = (html) => html.includes(`<p>${SIDEBAR_H1}</p>`);

test('the snapshot\'s sidebar (h1 first, accordions): a marker right before its h1', () => {
  const out = withSidebarH1(page(sidebar));
  assert.ok(marked(out));
  assert.ok(out.indexOf(SIDEBAR_H1) < out.indexOf('<h1'));
  assert.equal(out.replace(/<div class="text section"><div class="richtext"><p>brussels-sidebar-h1<\/p><\/div><\/div>/, ''), page(sidebar));
});

test('no marker: column views in it (withSidebarContent\'s), in a column view\'s item, no h1 first, nothing left to default content', () => {
  const withView = sidebar.replace('<div class="accordion ', '<div class="threecolumn column"><div class="column-view"></div></div><div class="accordion ');
  assert.ok(withView !== sidebar);
  assert.ok(!marked(withSidebarH1(page(withView))));
  assert.ok(!marked(withSidebarH1(page(`<div class="col-lg column-view-item">${sidebar}</div>`))));
  assert.ok(!marked(withSidebarH1(page(sidebar.replace(/<h1\b/, '<h2').replace(/<\/h1>/, '</h2>')))));
  const plain = '<div class="sidebar event"><div class="airem-sidebar d-md-flex"><div class="sidebar-content"><div class="headline section"><h1 class="headline">T</h1></div><div class="text section"><div class="richtext"><p>x</p></div></div></div><div class="sidebar-aside"></div></div></div>';
  assert.ok(!marked(withSidebarH1(page(plain))));
});

test('the document: its section gets the style sidebar-h1, the marker goes; another style stays', () => {
  const doc = `<div><p>${SIDEBAR_H1}</p><h1 id="t">T</h1><p>x</p></div>\n<div><h2>B</h2></div>`;
  assert.equal(withSidebarH1Style(doc), '<div><h1 id="t">T</h1><p>x</p><div class="section-metadata"><div><div>style</div><div>sidebar-h1</div></div></div></div>\n<div><h2>B</h2></div>');
  const styled = `<div><p>${SIDEBAR_H1}</p><h1 id="t">T</h1><div class="section-metadata"><div><div>style</div><div>padded</div></div></div></div>`;
  assert.equal(withSidebarH1Style(styled), '<div><h1 id="t">T</h1><div class="section-metadata"><div><div>style</div><div>padded, sidebar-h1</div></div></div></div>');
  assert.equal(withSidebarH1Style('<div><h1>T</h1></div>'), '<div><h1>T</h1></div>');
});

test('the import runs both: the marker on the mapped snapshot, the style after withSidebarSections', () => {
  const src = read('../tools/importer/brussels-import.mjs');
  assert.match(src.match(/const mapped = (.*)/)[1], /withSidebarContent\(withSidebarH1\(withoutTestForms\(/);
  assert.match(src, /const next = withPageH1\(withSidebarH1Style\(withSidebarSections\(/);
});

test('the theme: the h1 that opens the section\'s first text 30 px lower, 44 from 1025 px', () => {
  const css = read('../styles/themes/brussels.css').replace(/\s+/g, ' ');
  const sel = 'body\\.brand-brussels main > \\.section\\.sidebar-h1 > \\.default-content-wrapper:not\\(\\.default-content-wrapper ~ \\.default-content-wrapper\\):has\\(> h1:first-child\\)';
  assert.match(css, new RegExp(`${sel} \\{ padding-top: 30px; \\}`));
  assert.match(css, new RegExp(`@media \\(width >= 1025px\\) \\{ ${sel} \\{ padding-top: 44px; \\}`));
});
