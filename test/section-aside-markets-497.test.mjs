/* eslint-disable max-len, import/extensions -- dev tooling */
/* Brief 497 (the parity re-check after today's publishing): a sidebar's content split by market sections. The market
   roots' documents carry a part of a page for some markets only (section metadata markets: data-markets="ch/en" and
   "-ch/en", scripts/scripts.js drops the other market's before decorating), so www.swiss.com's sidebar content
   (/ch/en/book-and-manage/offers/miles-and-more: "Take off to the world of miles and Points" to the status accordion)
   is three sections, and the aside (section style sidebar-aside) joined only the last: on www it stands beside all of
   it from the first section under the h1 (1440: ours 3,940 px against www's 3,427). A run of sections linked through
   market sections is one content: its sections join as div.section-part (as sidebar-part sections), the aside beside
   all of them; a section with the h1 stays out; without market sections nothing changes.
   Run: node --test test/section-aside-markets-497.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { default: joinAsideSections } = await import('../scripts/section-aside.js');

const page = (html) => {
  const { document } = parseHTML(`<!DOCTYPE html><html><body><main>${html}</main></body></html>`);
  globalThis.document = document;
  return document.querySelector('main');
};
const sec = (inner, attrs = '', cls = '') => `<div class="section${cls ? ` ${cls}` : ''}"${attrs}>${inner}</div>`;
const H1 = sec('<div class="default-content-wrapper"><h1>Miles &amp; More</h1></div>');
const TAKE_OFF = sec('<div class="default-content-wrapper"><h2>Take off to the world of miles and Points</h2></div><div class="columns-media-wrapper"><div class="columns-media block"></div></div>', '', 'columns-media-container');
const MARKET = sec('<div class="default-content-wrapper"><p><a href="https://example.com">Secure up to 20,000 miles as a starting bonus</a></p></div>', ' data-markets="ch/en"');
const STATUS = sec('<div class="default-content-wrapper"><h2>Move up to a frequent flyer with status</h2></div><div class="accordion-columns-wrapper"><div class="accordion-columns block"></div></div>', '', 'accordion-columns-container');
const ASIDE = sec('<div class="cards-teaser-wrapper"><div class="cards-teaser block"></div></div>', '', 'sidebar-aside cards-teaser-container');

test('a run of sections linked through a market section joins as parts; the aside beside all of them', () => {
  const main = page(H1 + TAKE_OFF + MARKET + STATUS + ASIDE);
  joinAsideSections(main);
  const sections = [...main.children];
  assert.equal(sections.length, 2, 'the h1 section and the content with its aside');
  assert.ok(sections[0].querySelector('h1'));
  const host = sections[1];
  assert.ok(host.classList.contains('with-aside'));
  const parts = [...host.children].filter((c) => c.classList.contains('section-part'));
  assert.equal(parts.length, 3, 'take off, the market part, the status part');
  assert.ok(parts[0].querySelector('h2').textContent.startsWith('Take off'));
  assert.ok(parts[2].querySelector('.accordion-columns.block'));
  assert.ok(host.lastElementChild.classList.contains('section-aside'));
  assert.ok(host.lastElementChild.querySelector('.cards-teaser.block'));
  assert.equal(host.style.getPropertyValue('--section-aside-rows'), '3');
  ['columns-media-container', 'accordion-columns-container', 'cards-teaser-container'].forEach((c) => assert.ok(host.classList.contains(c), c));
});

test('the market section right before the aside, or the run starting with one, joins too; a section with the h1 stays out', () => {
  const main = page(H1 + TAKE_OFF + MARKET + ASIDE);
  joinAsideSections(main);
  assert.equal(main.children.length, 2);
  assert.equal(main.children[1].querySelectorAll(':scope > .section-part').length, 2);
  const h1Market = page(sec('<div class="default-content-wrapper"><h1>Offers</h1></div>', ' data-markets="ch/en"') + STATUS + ASIDE);
  joinAsideSections(h1Market);
  assert.equal(h1Market.children.length, 2, 'the h1 section stays a section of its own');
  assert.ok(h1Market.children[0].querySelector('h1'));
  assert.equal(h1Market.children[1].querySelectorAll(':scope > .section-part').length, 0, 'one section: no parts');
});

test('a market section further up the sidebar content (ITA carry-on baggage: heading, market accordions, heading, accordion): the whole run joins, from under the h1', () => {
  const head = (t) => sec(`<div class="default-content-wrapper"><h2>${t}</h2></div>`);
  const acc = (attrs = '') => sec('<div class="accordion-columns-wrapper"><div class="accordion-columns block"></div></div>', attrs, 'accordion-columns-container');
  const main = page(sec('<div class="default-content-wrapper"><h1>Hand Luggage</h1></div>') + head('Additional Information') + acc(' data-markets="-au/en,-be/en"') + head('Restrictions and Prohibited Items in the Cabin') + acc() + ASIDE);
  joinAsideSections(main);
  assert.equal(main.children.length, 2);
  const host = main.children[1];
  assert.ok(host.classList.contains('with-aside'));
  assert.equal(host.querySelectorAll(':scope > .section-part').length, 4, 'both headings and both accordions');
  assert.ok(host.querySelector(':scope > .section-part h2').textContent.startsWith('Additional'));
  // an earlier aside's section ends the run
  const two = page(sec('<div class="default-content-wrapper"><h1>Page</h1></div>') + head('First') + ASIDE + head('Second') + acc(' data-markets="ch/en"') + head('Third') + ASIDE);
  joinAsideSections(two);
  assert.equal(two.querySelectorAll(':scope > .with-aside').length, 2);
  assert.equal(two.children[2].querySelectorAll(':scope > .section-part').length, 3, 'second, its market accordion, third');
});

test('without market sections: the aside joins only the section before it, as before', () => {
  const main = page(H1 + TAKE_OFF + STATUS + ASIDE);
  joinAsideSections(main);
  assert.equal(main.children.length, 3);
  assert.ok(main.children[2].classList.contains('with-aside'));
  assert.equal(main.children[2].querySelectorAll(':scope > .section-part').length, 0);
});
