/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Brief 582, rule 6: on lufthansa.com's stages a short paragraph after the title followed by nothing but the call to
   action is www's information text (.information .richtext, LufthansaText light 18 px: economy-class, internet-overview,
   32n, boeing787), not a subheadline (LufthansaHead light 22 to 28 px); the subheadlines stand alone or before more
   text (100-years, best-price-alert). Other brands as before.
   Run: node --max-old-space-size=256 --test test/hero-subtitle-cta-582.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head><meta name="language" content="en"></head><body class="brand-lufthansa"><main></main></body></html>');
window.location = {
  hostname: 'lufthansa.turnsthe.page', pathname: '/de/en/economy-class', search: '', href: 'https://lufthansa.turnsthe.page/de/en/economy-class', origin: 'https://lufthansa.turnsthe.page',
};
Object.defineProperty(window, 'origin', { value: 'https://lufthansa.turnsthe.page', configurable: true });
window.matchMedia = () => ({ matches: false, addEventListener() {} });
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;
globalThis.ResizeObserver = class { observe() {} };
globalThis.requestAnimationFrame = (fn) => fn();
globalThis.cancelAnimationFrame = () => {};
const { default: decorate } = await import('../blocks/hero-campaign/hero-campaign.js');

const pic = '<picture><img src="https://lufthansa.turnsthe.page/de/en/media_1.jpg?width=750" alt="" width="2560" height="1098"></picture>';
const stage = (text) => {
  const main = document.querySelector('main');
  main.replaceChildren();
  const s = document.createElement('div');
  s.className = 'section';
  main.append(s);
  const block = document.createElement('div');
  block.className = 'hero-campaign block';
  block.innerHTML = `<div><div>${pic}</div></div><div><div>${text}</div></div>`;
  s.append(block);
  decorate(block);
  return block;
};
const subtitle = (block) => block.querySelector('.hero-campaign-subtitle');

test('a short paragraph followed only by the call to action: information text, not the subtitle', () => {
  const b = stage('<h1>Lufthansa Economy Class: comfort on every route</h1><p>Welcome to Economy Class. Take a seat. Sit back and enjoy your flight.</p><p><strong><a href="/de/en/flight-search">Book Economy Class</a></strong></p>');
  assert.equal(subtitle(b), null);
});

test('a short paragraph alone, or before more text: the subtitle as before', () => {
  assert.ok(subtitle(stage('<h1>100 years of Lufthansa</h1><p>From aviation pioneer to daily travel companion</p>')));
  assert.ok(subtitle(stage('<h2>Never miss a price drop with Best price alert</h2><p>Get instant alerts when prices drop for your dream destinations</p><p>Weekly price overview for the upcoming 12 months</p><p><a href="/de/en/x">Sign up</a></p>')));
});

test('another brand: the short paragraph before a call to action stays the subtitle', () => {
  document.body.classList.remove('brand-lufthansa');
  const b = stage('<h1>Title</h1><p>A short line.</p><p><strong><a href="/x">Go</a></strong></p>');
  document.body.classList.add('brand-lufthansa');
  assert.ok(subtitle(b));
});
