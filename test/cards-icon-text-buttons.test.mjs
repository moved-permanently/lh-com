/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* cards-icon-text and an authored button (brief 441, item 3: Brussels' gift card page
   /be/en/book-a-flight/flightvoucher, "Your Gift Card": each card's "Continue", "Redeem now", "To our
   FAQs" are www's outlined secondary buttons, the tile itself is no link). The block made the whole
   card its last link and the button plain text ("small bold text"). A card whose link is an
   authored button (bold or italic, alone in its paragraph) keeps it as a button; the card is no
   link. A card with a plain link (lufthansa.com's partner tiles, B2B's icon modules) as before.
   Brand-neutral. Run: node --max-old-space-size=256 --test test/cards-icon-text-buttons.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.location = {
  hostname: 'brussels.turnsthe.page', pathname: '/be/en/book-a-flight/flightvoucher', search: '', href: 'https://brussels.turnsthe.page/be/en/book-a-flight/flightvoucher', origin: 'https://brussels.turnsthe.page',
};
Object.defineProperty(window, 'origin', { value: 'https://brussels.turnsthe.page', configurable: true });
globalThis.window = window;
globalThis.document = document;
const { default: decorate } = await import('../blocks/cards-icon-text/cards-icon-text.js');

const block = (rows) => {
  const b = document.createElement('div');
  b.className = 'cards-icon-text partner';
  b.innerHTML = rows;
  decorate(b);
  return b;
};
const row = (body) => `<div><div><picture><img src="/icons/browser_black.svg" alt=""></picture></div><div>${body}</div></div>`;

test('a secondary button: the card is no link, the button stays', () => {
  const b = block(row('<h3>Digital card</h3><p>You’ll receive the Gift Card by e-mail.</p><p class="button-wrapper"><em><a href="https://voucher.brusselsairlines.com/sn/sales/new?locale=en" class="button secondary">Continue</a></em></p>'));
  const card = b.querySelector('.cards-icon-text-card');
  assert.equal(card.tagName, 'DIV');
  const a = card.querySelector('a');
  assert.equal(a.textContent, 'Continue');
  assert.equal(a.getAttribute('href'), 'https://voucher.brusselsairlines.com/sn/sales/new?locale=en');
  assert.ok(a.classList.contains('button') && a.classList.contains('secondary'));
  assert.equal(card.querySelectorAll('.cards-icon-text-link').length, 0);
});

test('an undecorated button (em or strong around the link) counts too', () => {
  const b = block(row('<h3>Do you already have a Gift Card?</h3><p><strong><a href="/be/en/book-a-flight/flight-search">Redeem now</a></strong></p>'));
  const card = b.querySelector('.cards-icon-text-card');
  assert.equal(card.tagName, 'DIV');
  assert.equal(card.querySelector('strong > a').textContent, 'Redeem now');
});

test('a plain link: the whole card is the link, as before', () => {
  const b = block(row('<h3><a href="/de/en/app">Lufthansa app</a></h3><p>All in one app</p>'));
  const card = b.querySelector('.cards-icon-text-card');
  assert.equal(card.tagName, 'A');
  assert.equal(card.getAttribute('href'), '/de/en/app');
  assert.equal(card.querySelectorAll('a').length, 0);
  const cta = block(row('<h3>Business travel</h3><p>Our programmes</p><p><a href="/b2b/programmes">Learn more</a></p>')).querySelector('.cards-icon-text-card');
  assert.equal(cta.tagName, 'A');
  assert.equal(cta.querySelector('.cards-icon-text-link').textContent, 'Learn more');
});
