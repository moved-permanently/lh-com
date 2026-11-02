/* eslint-disable max-len */
/* The header's shopping cart (blocks/header/header-cart.js, brief 264), as www.swiss.com's: the
   cart icon is a button that opens a dialog; the empty cart (all a visitor without a shop session
   sees) shows www's title, text and its link to the offers. The nav document's cart item carries
   them in a sub-list (title, text, link); a cart item without one (lufthansa.com and the other
   brands) stays the link it was.
   Run: node --max-old-space-size=512 --test test/header-cart.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
globalThis.window = window;
globalThis.document = document;
let opened = null;
window.HTMLElement.prototype.showModal = function showModal() { this.open = true; opened = this; };
window.HTMLElement.prototype.close = function close() { this.open = false; };
const click = (target) => target.dispatchEvent(new window.Event('click', { bubbles: true }));

const { default: buildCart, cartItems } = await import('../blocks/header/header-cart.js');

const ITEMS = [
  { text: 'Your cart is empty', href: null },
  { text: 'Explore our offers and destinations to discover the incredible places we can take you.', href: null },
  { text: 'Explore all offers', href: '/ch/en/offers' },
];

test('the cart button opens its dialog: www\'s title, text and link; Close closes it', () => {
  const cart = buildCart({ label: 'Shopping cart preview', items: ITEMS, close: 'Close' });
  document.body.replaceChildren(cart.button, cart.dialog);
  assert.equal(cart.button.tagName, 'BUTTON');
  assert.equal(cart.button.className, 'nav-tool nav-tool-cart');
  assert.equal(cart.button.getAttribute('aria-label'), 'Shopping cart preview');
  assert.equal(cart.button.getAttribute('aria-haspopup'), 'dialog');
  assert.equal(cart.dialog.tagName, 'DIALOG');
  const title = cart.dialog.querySelector('h2');
  assert.equal(title.textContent, 'Your cart is empty');
  assert.equal(cart.dialog.getAttribute('aria-labelledby'), title.id);
  assert.equal(cart.dialog.querySelector('.nav-cart-text').textContent, ITEMS[1].text);
  const link = cart.dialog.querySelector('a.nav-cart-link');
  assert.deepEqual([link.getAttribute('href'), link.textContent], ['/ch/en/offers', 'Explore all offers']);
  click(cart.button);
  assert.ok(opened === cart.dialog, 'opens');
  click(cart.dialog.querySelector('.nav-cart-close'));
  assert.equal(cart.dialog.open, false, 'closes');
  assert.equal(cart.dialog.querySelector('.nav-cart-close').getAttribute('aria-label'), 'Close');
});

test('a second button (the menu\'s) opens the same dialog', () => {
  const cart = buildCart({ label: 'Shopping cart preview', items: ITEMS, close: 'Close' });
  const other = document.createElement('button');
  cart.bind(other);
  opened = null;
  click(other);
  assert.ok(opened === cart.dialog);
});

test('cartItems: a nav sub-list\'s items as texts and links; none without one', () => {
  const { document: d } = parseHTML('<ul><li>Your cart is empty</li><li>Explore our offers.</li><li><a href="/ch/en/offers">Explore all offers</a></li></ul>');
  assert.deepEqual(cartItems(d.querySelector('ul')), [{ text: 'Your cart is empty', href: null }, { text: 'Explore our offers.', href: null }, { text: 'Explore all offers', href: '/ch/en/offers' }]);
  assert.deepEqual(cartItems(null), []);
});

test('header.js: a cart tool with a sub-list is the cart button and dialog, in the bar and the menu (header-cart.js loaded then only); without one the link as before', () => {
  const js = fs.readFileSync('blocks/header/header.js', 'utf8');
  assert.match(js, /list: sub,/);
  assert.match(js, /import\('\.\/header-cart\.js'\)/);
  assert.match(js, /cartTool && cartTool\.list/);
  assert.doesNotMatch(js, /^import[^;]*header-cart/m, 'not loaded by the other brands\' pages');
  assert.match(js, /return tool && tool\.href \? toolLink\(tool, className, false\) : null;/, 'the bar\'s links as before');
});
