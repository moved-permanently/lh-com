/* eslint-disable max-len, import/extensions */
/* lh-discover's footers (www's snapshots, 2026-10-30): the nav importer's footer
   (tools/importer/import-nav.js): the brand sites' "Follow us" row (a heading over linked images)
   is a badges section, the legal row is the row of text links (it took the first horizontal list,
   the social icons, and came out empty); lufthansa.com's footer as before; a root's label from the
   importer's table before the page header's; tools/importer/discover-footer.mjs footerPlain: the
   importer's element as a document. A linkedom page, no network. Run: node --test test/*.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

globalThis.WebImporter = { DOMUtils: { remove: () => {} }, Blocks: {} };
const { default: nav } = await import('../tools/importer/import-nav.js');
const { footerPlain } = await import('../tools/importer/discover-footer.mjs');

const SOCIAL = `<div class="link-list"><h3 class="heading-default">Follow us</h3><ul class="horizontal show mb-7">
  <li><a href="https://www.facebook.com/discoverairlinesofficial/"><img src="/content/dam/four_y/images/local_images/icons/Facebook-16px.svg" alt="Facebook" title="Facebook"></a></li>
  <li><a href="https://www.instagram.com/discover.airlines/"><img src="/content/dam/four_y/images/local_images/icons/Instagram-16px.svg" alt="Instagram"></a></li></ul></div>`;
const LEGAL = `<div class="link-list"><ul class="horizontal">
  <li><a href="/de/en/legal/imprint"><i class="lh lh-arrow-right icon-left"></i> Imprint </a></li>
  <li><a href="/content/dam/four_y/pdfs/legal/4y_terms-of-use_en.pdf" target="_blank"> Terms and conditions of use (pdf) <span class="sr-only"> The link will be opened in a new browser tab </span></a></li>
  <li id="privacymanager"><a href="#" onclick="OneTrust.ToggleInfoDisplay()">Change Privacy settings</a></li></ul></div>`;
const COLUMN = '<div class="link-list"><span class="hidden-sm-down"><h3>About us</h3></span><ul class="vertical"><li><a href="/de/en/about-us/company">Our company</a></li></ul></div>';
const page = (area, header = '') => parseHTML(`<!DOCTYPE html><html><body><header>${header}</header>
  <footer>${area}<div class="footer-logos"><a href="https://www.lufthansagroup.com"><img src="/etc/designs/x/member-of-lhg-white.svg" alt="Member of Lufthansa Group"></a></div></footer></body></html>`).document;
const footer = (url, document) => {
  const [out] = nav.transform({ document, url: `${url}#footer`, params: { originalURL: `${url}#footer` } });
  return out.element;
};
const sections = (element) => element.innerHTML.split('<hr>');

test('a Discover footer: "Follow us" as a badges section, the legal row its text links', () => {
  const el = footer('https://www.discover-airlines.com/de/en/homepage', page(`<div class="footer-container">${COLUMN}${SOCIAL}${LEGAL}</div>`));
  const s = sections(el);
  assert.equal(s.length, 5, 'top, columns, badges, legal, logos');
  assert.match(s[2], /^<h3>Follow us<\/h3><ul><li><a href="https:\/\/www\.facebook\.com\/discoverairlinesofficial\/"><img alt="Facebook" src="https:\/\/www\.lufthansa\.com\/content\/dam\/four_y\/images\/local_images\/icons\/Facebook-16px\.svg">/);
  assert.match(s[2], /<table><tr><th colspan="2">Section Metadata<\/th><\/tr><tr><td>Style<\/td><td>badges<\/td><\/tr><\/table>$/);
  assert.equal((s[2].match(/<li>/g) || []).length, 2);
  assert.match(s[3], /^<ul><li><a href="[^"]*\/de\/en\/legal\/imprint">Imprint<\/a><\/li>/);
  assert.match(s[3], />Terms and conditions of use \(pdf\)<\/a>/, 'the screen reader note left out');
  assert.match(s[3], /<a href="#privacy-settings">Change Privacy settings<\/a>/);
  assert.doesNotMatch(s[3], /img/);
});

test('a lufthansa.com footer (one horizontal list, no social row) as before: no badges section', () => {
  const el = footer('https://www.lufthansa.com/de/en/homepage', page(`<div class="footer-area">${COLUMN}${LEGAL}</div>`));
  const s = sections(el);
  assert.equal(s.length, 4, 'top, columns, legal, logos');
  assert.doesNotMatch(el.innerHTML, /Section Metadata|badges/);
  assert.match(s[2], /Imprint/);
});

test('the footer label: the importer\'s table before the page header\'s, the header\'s for other roots', () => {
  const header = (label) => `<div class="dcep-country-and-language-selection"><span class="country-language-text">${label}</span></div>`;
  const xxfr = footer('https://www.discover-airlines.com/xx/fr/homepage', page(`<div class="footer-container">${COLUMN}</div>`, header('Etats-Unis d\'Amérique | Français')));
  assert.match(xxfr.textContent, /:globe: Autre pays \| Français/);
  const usen = footer('https://www.discover-airlines.com/us/en/homepage', page(`<div class="footer-container">${COLUMN}</div>`, header('USA | English')));
  assert.match(usen.textContent, /:globe: USA \| English/);
  const none = footer('https://www.discover-airlines.com/us/de/homepage', page(`<div class="footer-container">${COLUMN}</div>`));
  assert.match(none.textContent, /:globe: US\/DE/);
});

test('footerPlain: one <div> per section, the section metadata table as its block', () => {
  const el = footer('https://www.discover-airlines.com/de/en/homepage', page(`<div class="footer-container">${COLUMN}${SOCIAL}${LEGAL}</div>`));
  const doc = footerPlain(el);
  const { document } = parseHTML(`<!DOCTYPE html><html><body>${doc}</body></html>`);
  const divs = [...document.body.children];
  assert.equal(divs.length, 5);
  assert.ok(divs.every((d) => d.tagName === 'DIV'));
  assert.equal(divs[2].querySelector('.section-metadata').outerHTML, '<div class="section-metadata"><div><div>Style</div><div>badges</div></div></div>');
  assert.equal(document.querySelector('table'), null);
});
