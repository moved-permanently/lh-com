/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* The brief after 493, item 2 (token-free styling, step 2): tools/importer/marker-collapse.mjs, the collapse of the "{…}"
   markers into the theme's defaults and step 1's carriers. One test per family, the table form of the importers, the
   heading ids, idempotence and the placeholders that stay.
   Run: node --max-old-space-size=512 --test test/marker-collapse.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import {
  collapseHtml, collapseMain, totals, brandOfHost,
} from '../tools/importer/marker-collapse.mjs';

const PIC = '<picture><img src="./media_1.jpg" alt="Lisbon at dusk"></picture>';
const run = (html, opts = {}) => collapseHtml(html, { path: '/de/en/x', parse: parseHTML, ...opts });
const out = (html, opts) => run(html, opts).html;
const meta = (style) => `<div class="section-metadata"><div><div>Style</div><div>${style}</div></div></div>`;
const MARKER = /\{(?:heading-|copytext-|full-width|limited-width|column-|caption|parallax|narrow|indent-|spacer|divider|autoplay|muted|loop|controls|round-play-button|size-|mobile|selected|cart|small|blank)[^}]*\}/;

test('separators: section start and end as section styles, before a block its option, else a purpose block', () => {
  assert.equal(out('<div><p>{spacer-60}</p><p>Text</p></div>'), `<div><p>Text</p>${meta('space-m')}</div>`);
  assert.equal(out('<div><p>Text</p><p>{spacer-120}</p></div>'), `<div><p>Text</p>${meta('space-below-l')}</div>`);
  assert.equal(out('<div><p>Text</p><p>{divider-25}</p><div class="columns-media"><div><div>x</div></div></div></div>'), '<div><p>Text</p><div class="columns-media divider-above"><div><div>x</div></div></div></div>');
  assert.equal(out('<div><p>A</p><p>{spacer-40}</p><p>B</p></div>'), '<div><p>A</p><div class="spacer"><div><div></div></div></div><p>B</p></div>');
  assert.equal(out('<div><p>A</p><p>{spacer-100}</p><p>B</p></div>'), '<div><p>A</p><div class="spacer l"><div><div></div></div></div><p>B</p></div>');
  assert.equal(out('<div><p>A</p><p>{spacer-40}</p><p>{divider-25}</p><p>B</p></div>'), '<div><p>A</p><div class="divider"><div><div></div></div></div><p>B</p></div>', 'a stacked spacer and divider: one Divider');
  assert.equal(out('<div><p>A</p><p>{spacer-25}</p><p>B</p></div>'), '<div><p>A</p><p>B</p></div>', '0-30 px: none');
  assert.equal(out('<div><p>A</p><p>{spacer-85 from-768}</p><p>B</p></div>'), '<div><p>A</p><div class="spacer"><div><div></div></div></div><p>B</p></div>', 'near values: M; from-768 goes');
  assert.equal(out('<div><div class="columns-media"><div><div><p>a</p><p>{spacer-40}</p><p>b</p></div></div></div></div>'), '<div><div class="columns-media"><div><div><p>a</p><p>b</p></div></div></div></div>', 'no carrier in a cell');
});

test('separators: page-type gaps are the theme\'s (/100-years sections, articles\' info box and chapters)', () => {
  assert.equal(out('<div><p>A</p><p>{spacer-60}</p></div><div><p>B</p></div>', { path: '/de/en/100-years/x' }), '<div><p>A</p></div><div><p>B</p></div>');
  const article = out('<div><div class="article-header"><div><div>h</div></div></div><p>Text</p><p>{divider-25}</p><div class="columns-media"><div><div>i</div></div></div><p>More</p><p>{divider-25}</p><h3>Chapter</h3><p>C</p></div>');
  assert.equal(article, '<div><div class="article-header"><div><div>h</div></div></div><p>Text</p><div class="columns-media"><div><div>i</div></div></div><p>More</p></div><div><h3>Chapter</h3><p>C</p></div>');
});

test('column views: the marks go; an outside group over its whole section: padded', () => {
  assert.equal(out('<div><h2>T {heading-medium column-start}</h2><p>Text {column-end}</p><p>After</p></div>'), '<div><h2>T</h2><p>Text</p><p>After</p></div>');
  assert.equal(out('<div><p>Text</p><p>{column-end}</p><div class="cards"><div><div>x</div></div></div></div>'), '<div><p>Text</p><div class="cards"><div><div>x</div></div></div></div>');
  assert.equal(out('<div><h2>T {column-start-outer}</h2><p>Text {column-end-outer}</p></div>'), `<div><h2>T</h2><p>Text</p>${meta('padded')}</div>`);
});

test('heading sizes: a step from the default goes; two steps a level-scoped style, a page row or a block option', () => {
  assert.equal(out('<div><h2 id="t-heading-small">T {heading-small}</h2></div>'), '<div><h2 id="t">T</h2></div>');
  assert.equal(out('<div><h2>A {heading-copytext-large}</h2><h2>B {heading-copytext-large}</h2><h2>C</h2></div><div><h2>D</h2></div>'), `<div><h2>A</h2><h2>B</h2><h2>C</h2>${meta('h2-compact')}</div><div><h2>D</h2></div>`);
  assert.equal(out('<div><h2>A {heading-copytext-large}</h2><h2>B</h2><h2>C</h2></div>'), '<div><h2>A</h2><h2>B</h2><h2>C</h2></div>', 'a minority goes to the default');
  const row = out('<div><h3>A {heading-large}</h3></div><div><h3>B {heading-medium}</h3></div><div><div class="metadata"><div><div>Title</div><div>t</div></div></div></div>');
  assert.match(row, /<div><h3>A<\/h3><\/div><div><h3>B<\/h3><\/div>.*<div><div>Headings<\/div><div>H3 large<\/div><\/div>/);
  assert.equal(out('<div><div class="columns-media"><div><div><h3>A {heading-medium}</h3><p>x</p></div></div></div></div>'), '<div><div class="columns-media title-large"><div><div><h3>A</h3><p>x</p></div></div></div></div>');
  const r = run('<div><h1>T {heading-small}</h1></div>');
  assert.equal(r.html, '<div><h1>T</h1></div>');
  assert.equal(totals(r.stats).theme, 1, 'H1 has no choice: the default');
});

test('heading ids lose the marker\'s part (a twin: -1); links to the old ids in the page are rewritten, the map returned', () => {
  const r = run('<div><p><a href="#free-baggage-heading-small">Free</a> <a href="/de/en/x#free-baggage-heading-small">here</a> <a href="/de/en/y#z-heading-small">other</a></p><h2 id="free-baggage-heading-small">Free baggage {heading-small}</h2><h2 id="free-baggage">Free baggage</h2></div>');
  assert.match(r.html, /<a href="#free-baggage">Free<\/a> <a href="\/de\/en\/x#free-baggage">here<\/a> <a href="\/de\/en\/y#z-heading-small">other<\/a>/);
  assert.match(r.html, /<h2 id="free-baggage">Free baggage<\/h2><h2 id="free-baggage-1">Free baggage<\/h2>/);
  assert.equal(r.ids['free-baggage-heading-small'], 'free-baggage');
});

test('text size: within 2 px of body the body; small print at a section end its style; in a block an option', () => {
  assert.equal(out('<div><p>Text {copytext-medium}</p></div>'), '<div><p>Text</p></div>');
  assert.equal(out('<div><p>Fine {copytext-small}</p><p>Print {copytext-small}</p></div>'), `<div><p>Fine</p><p>Print</p>${meta('small-print')}</div>`);
  assert.equal(out('<div><h2>T</h2><p>Text</p><p>Fine {copytext-small}</p></div>'), `<div><h2>T</h2><p>Text</p></div><div><p>Fine</p>${meta('small-print')}</div>`);
  assert.equal(out('<div><p>Text</p><p>Small {copytext-small}</p><p>More text</p></div>'), '<div><p>Text</p><p>Small</p><p>More text</p></div>', 'single small paragraphs: body');
  assert.equal(out('<div><div class="cards"><div><div><p>A {copytext-small}</p><p>B {copytext-small}</p><p>C</p></div></div></div></div>'), '<div><div class="cards small-print"><div><div><p>A</p><p>B</p><p>C</p></div></div></div></div>');
  assert.equal(out('<div><p>Fine {copytext-small}</p></div>', { brand: 'austrian' }), '<div><p>Fine</p></div>', 'Austrian body 16 px: 14 px is body');
  assert.equal(out('<div><h1>T</h1><p>Intro {copytext-large}</p></div>', { brand: 'austrian' }), '<div><h1>T</h1><p>Intro</p></div>', 'the intro: the theme\'s rule');
});

test('text width: a mostly wide section gets Wide text; ITA\'s default is wide; indent: a list, a quote or gone', () => {
  assert.equal(out('<div><p>A {full-width}</p><ul><li>B {full-width}</li></ul><p>C</p></div>'), `<div><p>A</p><ul><li>B</li></ul><p>C</p>${meta('wide-text')}</div>`);
  assert.equal(out('<div><p>A {full-width}</p><p>B</p><p>C</p></div>'), '<div><p>A</p><p>B</p><p>C</p></div>');
  assert.equal(out('<div><p>A {full-width}</p></div>', { brand: 'ita' }), '<div><p>A</p></div>');
  assert.equal(out('<div><p>• One {indent-40}</p><p>• Two {indent-40}</p><p>Text</p></div>'), '<div><ul><li>One</li><li>Two</li></ul><p>Text</p></div>');
  assert.equal(out('<div><p>“A quote.” {indent-80}</p></div>'), '<div><blockquote><p>“A quote.”</p></blockquote></div>');
  assert.equal(out('<div><p>Indented {indent-80}</p></div>'), '<div><p>Indented</p></div>');
});

test('video: the default player goes, the size and a background video as the link\'s fragment or the block\'s option', () => {
  assert.equal(out(`<div><p>${PIC}</p><p><a href="/media/v.mp4">Watch</a> {controls round-play-button size-1920x1080}</p></div>`), `<div><p>${PIC}</p><p><a href="/media/v.mp4#size=1920x1080">Watch</a></p></div>`);
  assert.equal(out(`<div><p>${PIC}</p><p><a href="/media/v.mp4#t=10">/media/v.mp4</a> {autoplay muted loop}</p></div>`), `<div><p>${PIC}</p><p><a href="/media/v.mp4#t=10&amp;background">Lisbon at dusk</a></p></div>`);
  assert.equal(out('<div><div class="columns-media"><div><div><p><a href="/media/v.mp4">Film</a> {autoplay muted loop}</p></div></div></div></div>'), '<div><div class="columns-media background-video"><div><div><p><a href="/media/v.mp4">Film</a></p></div></div></div></div>');
  assert.equal(out('<div><div class="article-header"><div><div><p><a href="/media/en_header.mp4">/media/en_header.mp4</a> {mobile}</p></div></div></div></div>'), '<div><div class="article-header mobile-video"><div><div><p><a href="/media/en_header.mp4">En header</a></p></div></div></div></div>');
});

test('captions: the italic paragraph after the image; one after no image is listed for a person', () => {
  assert.equal(out(`<div><p>${PIC}</p><p>Lisbon at dusk {caption}</p></div>`), `<div><p>${PIC}</p><p><em>Lisbon at dusk</em></p></div>`);
  const r = run('<div><p>Text</p><p>Floating {caption}</p></div>');
  assert.equal(r.html, '<div><p>Text</p><p><em>Floating</em></p></div>');
  assert.equal(r.hand.length, 1);
});

test('parallax: the section\'s image style (an image of its own section among others); narrow quotes: the section style', () => {
  assert.equal(out(`<div><p>${PIC} {parallax}</p></div>`), `<div><p>${PIC}</p>${meta('parallax')}</div>`);
  assert.equal(out(`<div><p>A</p><p>${PIC} {parallax}</p><p>${PIC}</p></div>`), `<div><p>A</p></div><div><p>${PIC}</p>${meta('parallax')}</div><div><p>${PIC}</p></div>`);
  assert.equal(out('<div><blockquote><p>Quote {narrow}</p><p>Source</p></blockquote></div>'), `<div><blockquote><p>Quote</p><p>Source</p></blockquote>${meta('narrow')}</div>`);
});

test('TAP\'s blank line, the form\'s {selected}, the nav\'s role markers', () => {
  assert.equal(out('<div><p>A</p><p><sub>{blank}</sub></p><p>B</p></div>'), '<div><p>A</p><p>B</p></div>');
  const form = out('<div><div class="form"><div><div>Label</div><div>Type</div><div>Options</div></div><div><div>Salutation</div><div>select</div><div><p>mr=Mr</p><p>ms=Ms {selected}</p></div></div></div></div>');
  assert.equal(form, '<div><div class="form"><div><div>Label</div><div>Type</div><div>Options</div><div>Default</div></div><div><div>Salutation</div><div>select</div><div><p>mr=Mr</p><p>ms=Ms</p></div><div><p>Ms</p></div></div></div></div>');
  const nav = out('<div><ul><li>:cart: <a href="/cart">Your Cart</a> {cart}<ul><li>Sub</li></ul></li><li>:help: <a href="/help">Help</a></li></ul></div>', { path: '/at/en/nav' });
  assert.equal(nav, '<div><div class="nav-tools"><div><div><p>:cart: <a href="/cart">Your Cart</a></p></div><div>cart</div><div><ul><li>Sub</li></ul></div></div><div><div><p>:help: <a href="/help">Help</a></p></div><div></div><div></div></div></div></div>');
});

test('app screens: their own blocks in the existing sections, nothing else', () => {
  const html = '<div><p>{spacer: medium, v2}</p><h2>Title {heading-small}</h2><p>{divider}</p><p>Fine {small}</p><p>Print {small}</p><p>Text</p></div>';
  assert.equal(out(html, { path: '/content/mobile/lh/de/x' }), '<div><div class="app-spacer medium v2"><div><div></div></div></div><h2>Title {heading-small}</h2><div class="app-divider"><div><div></div></div></div><div class="app-text small"><div><div><p>Fine</p><p>Print</p></div></div></div><p>Text</p></div>');
});

test('the import scripts\' brand by the source host', () => {
  assert.deepEqual(
    ['www.austrian.com', 'www.brusselsairlines.com', 'www.ita-airways.com', 'www.swiss.com', 'www.flytap.com', 'www.discover.com', 'www.lufthansa-cargo.com', 'www.airdolomiti.it', 'business.lufthansagroup.com', 'www.lufthansa.com'].map(brandOfHost),
    ['austrian', 'brussels', 'ita', 'swiss', 'tap', 'discover', 'cargo', 'airdolomiti', 'b2b', 'lufthansa'],
  );
});

test('placeholders and other braces stay; cell marks stay for a person', () => {
  const html = '<div><p>From {origin} to {destination}</p><p>Pattern [0-9]{1,3}</p><p>Count {COUNT}</p></div>';
  assert.equal(out(html), html);
});

test('idempotent, and no marker left', () => {
  const html = `<div><p>{spacer-60}</p><h2 id="a-heading-small">A {heading-small column-start}</h2><p>Text {full-width}</p><p>More {full-width column-end}</p><p>${PIC}</p><p>Caption {caption}</p><p>{divider-25}</p><div class="columns-media"><div><div><h3>T {heading-medium}</h3><p>Small {copytext-small}</p></div></div></div><p>Fine {copytext-small}</p></div><div><p><a href="/v.mp4">/v.mp4</a> {controls round-play-button size-640x360}</p></div>`;
  const once = out(html);
  assert.equal(out(once), once);
  const { document } = parseHTML(`<main>${once}</main>`);
  [...document.querySelectorAll('h1, h2, h3, p, li')].forEach((el) => assert.ok(!MARKER.test(el.textContent), el.outerHTML));
});

test('the importers\' table form: blocks as tables, sections between <hr>, new options in the table\'s name', () => {
  const { document } = parseHTML('<html><body><main><div class="contentpage-wrapper"><div><p>{spacer-60}</p><h2>A {heading-small}</h2><p>Text</p><p>{divider-25}</p><table><tr><th colspan="2">Columns Media (padded)</th></tr><tr><td><p>x</p></td><td><p>y</p></td></tr></table><hr><p>B</p><p>{spacer-120}</p><p>C</p></div></div><hr><table><tr><th colspan="2">Metadata</th></tr><tr><td>Title</td><td>t</td></tr></table></main></body></html>');
  const main = document.querySelector('main');
  collapseMain(main, { path: '/de/en/x', document });
  // the page's wrappers read through (Markdown does), new and changed blocks as WebImporter writes them, the rest as it was
  assert.equal(main.innerHTML, '<h2>A</h2><p>Text</p><table><thead><tr><th colspan="2">Columns Media (padded, divider-above)</th></tr></thead><tbody><tr><td><p>x</p></td><td><p>y</p></td></tr></tbody></table><table><thead><tr><th colspan="2">Section Metadata</th></tr></thead><tbody><tr><td>Style</td><td>space-m</td></tr></tbody></table><hr><p>B</p><table><thead><tr><th>Spacer (l)</th></tr></thead><tbody><tr><td></td></tr></tbody></table><p>C</p><hr><table><tr><th colspan="2">Metadata</th></tr><tr><td>Title</td><td>t</td></tr></table>');
  const plain = parseHTML('<html><body><main><div class="w"><p>No markers</p><table><tr><th>Cards</th></tr></table></div></main></body></html>').document;
  const before = plain.querySelector('main').innerHTML;
  collapseMain(plain.querySelector('main'), { path: '/de/en/y', document: plain });
  assert.equal(plain.querySelector('main').innerHTML, before, 'a page without markers as it came');
});
