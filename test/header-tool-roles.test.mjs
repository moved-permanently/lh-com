/* The header's bar items by role, not by icon name (blocks/header/header-tools.js, every brand;
   Austrian parity row 3, ITA row 3): a nav tool item can name its role with a marker,
   ":austrian-cart: Your Cart {cart}", so a brand's own icon keeps the cart, help, login and locale
   behaviour; without a marker the icon's name decides as before (":cart:", ":globe:" …) and a
   travelid/login link is the login. The marker is not part of the label.
   The cart's two texts as www's (captures swiss-parity-001 ch/en + ch/de and ita-parity-001 it/en,
   Brussels' be/fr in its parity P18): the bar's icon button is named "Shopping cart preview"
   (Warenkorb-Vorschau, Aperçu du panier), the menu's item reads "Your Cart" (Ihr Warenkorb, Votre
   panier). A nav that says either gets both, on the brands whose www menus were captured (SWISS,
   ITA, Austrian, Brussels); other wording, the other languages and the other brands (lh-com:
   no capture of lufthansa.com's menu) stay as authored, both places.
   Run: node --max-old-space-size=512 --test test/header-tool-roles.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
globalThis.window = window;
globalThis.document = document;
globalThis.NodeFilter = window.NodeFilter || { SHOW_TEXT: 4 };

const {
  takeRole, toolRole, cartLabels, ROLE_MARKERS, CART_TEXT_BRANDS,
} = await import('../blocks/header/header-tools.js');

const li = (html) => {
  const ul = document.createElement('ul');
  ul.innerHTML = `<li>${html}</li>`;
  return ul.firstElementChild;
};
const label = (node) => node.textContent.replace(/\s+/g, ' ').trim();

test('takeRole: the marker anywhere in the item, removed from its text', () => {
  let item = li(':austrian-cart: <a href="/at/en/homepage">Your Cart</a> {cart}');
  assert.equal(takeRole(item), 'cart');
  assert.equal(label(item), ':austrian-cart: Your Cart');
  item = li(':austrian-help: <a href="/at/en/help">{help} Help &amp; Contact</a>');
  assert.equal(takeRole(item), 'help');
  assert.equal(label(item), ':austrian-help: Help & Contact');
  item = li('<span class="icon icon-austrian-globe"></span> Austria | English {locale}');
  assert.equal(takeRole(item), 'locale');
  assert.equal(label(item), 'Austria | English');
});

test('takeRole: no marker or another one (a style marker): null, the text as it was', () => {
  let item = li(':cart: <a href="/x">Shopping cart preview</a>');
  assert.equal(takeRole(item), null);
  assert.equal(label(item), ':cart: Shopping cart preview');
  item = li('<a href="/x">Help</a> {heading-small}');
  assert.equal(takeRole(item), null);
  assert.equal(label(item), 'Help {heading-small}');
  assert.deepEqual(ROLE_MARKERS, ['accessibility', 'help', 'search', 'cart', 'login', 'locale', 'notifications']);
});

test('toolRole: the marker first, then the icon name as before, then a login link', () => {
  assert.equal(toolRole({ marker: 'help', icon: 'globe', href: '/x' }), 'help');
  assert.equal(toolRole({ marker: null, icon: 'austrian-cart', href: '/x' }), null);
  assert.equal(toolRole({ marker: 'cart', icon: 'austrian-cart', href: '/x' }), 'cart');
  [['wheelchair', 'accessibility'], ['question', 'help'], ['shopping-cart', 'cart'], ['cart', 'cart'], ['profile', 'login'], ['globe', 'locale'], ['earth', 'locale'], ['bell', 'notifications'], ['search', 'search']]
    .forEach(([icon, role]) => assert.equal(toolRole({ marker: null, icon, href: '/x' }), role, icon));
  assert.equal(toolRole({ marker: null, icon: 'austrian-login', href: 'https://www.austrian.com/travelid/login' }), 'login');
  assert.equal(toolRole({ marker: null, icon: null, href: null }), null);
});

test('cartLabels: www\'s bar name and menu label from either text; other wording as authored', () => {
  const both = (bar, menu) => ({ bar, menu });
  assert.deepEqual(cartLabels('Shopping cart preview', 'en', 'swiss'), both('Shopping cart preview', 'Your Cart'));
  assert.deepEqual(cartLabels('Your cart', 'en', 'swiss'), both('Shopping cart preview', 'Your Cart'));
  assert.deepEqual(cartLabels('Warenkorb-Vorschau', 'de', 'swiss'), both('Warenkorb-Vorschau', 'Ihr Warenkorb'));
  assert.deepEqual(cartLabels('Ihr Warenkorb', 'de', 'swiss'), both('Warenkorb-Vorschau', 'Ihr Warenkorb'));
  assert.deepEqual(cartLabels('Aperçu du panier', 'fr', 'swiss'), both('Aperçu du panier', 'Votre panier'));
  assert.deepEqual(cartLabels('Anteprima del carrello', 'it', 'swiss'), both('Anteprima del carrello', 'Anteprima del carrello'), 'no capture of www\'s it menu');
  assert.deepEqual(cartLabels('Basket', 'en', 'swiss'), both('Basket', 'Basket'));
  assert.deepEqual(cartLabels('Shopping cart preview', 'xx', 'swiss'), both('Shopping cart preview', 'Shopping cart preview'));
  assert.deepEqual(cartLabels('Shopping cart preview', 'en', ''), both('Shopping cart preview', 'Shopping cart preview'), 'lh-com as authored');
  assert.deepEqual(cartLabels('Shopping cart preview', 'en', 'discover'), both('Shopping cart preview', 'Shopping cart preview'), 'no capture');
  CART_TEXT_BRANDS.forEach((brand) => assert.deepEqual(cartLabels('Shopping cart preview', 'en', brand), both('Shopping cart preview', 'Your Cart'), brand));
  assert.deepEqual(CART_TEXT_BRANDS, ['swiss', 'ita', 'austrian', 'brussels']);
});

test('header.js: roles by takeRole/toolRole, the cart\'s bar name and menu label by cartLabels', () => {
  const js = fs.readFileSync('blocks/header/header.js', 'utf8');
  assert.ok(js.includes("from './header-tools.js';"), 'imports header-tools.js');
  assert.ok(!js.includes('const TOOL_ROLES = {'), 'the table lives in header-tools.js');
  const read = js.slice(js.indexOf('function readTools('), js.indexOf('\n}\n', js.indexOf('function readTools(')));
  assert.ok(read.indexOf('takeRole(li)') >= 0 && read.indexOf('takeRole(li)') < read.indexOf('const label = text(li)'), 'the marker out before the label');
  assert.ok(read.includes('toolRole({ marker, icon, href: a ? a.href : null })'), 'toolRole call');
  ['cartLabels(label, lang, brand)', 'label: cartTexts ? cartTexts.menu : label', 'barLabel: cartTexts ? cartTexts.bar : label', 'a.setAttribute(\'aria-label\', tool.barLabel || tool.label)', 'label: cartTool.barLabel || cartTool.label', 'readTools(tools, locale.lang, brandOf())'].forEach((s) => assert.ok(js.includes(s), s));
});
