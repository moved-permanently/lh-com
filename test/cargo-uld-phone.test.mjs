/* eslint-disable max-len, class-methods-use-this */
/* Brief 437, item 1: Cargo's homepage ULD teaser (hero-card-overlay (plain)) with www's phone
   picture. www.lufthansa-cargo.com's .teaserULD is one <picture>: Teaser-ULD-Mobile@2x.jpg for
   (max-width: 767px), Teaser-ULD-Desktop@2x.jpg from 768 px. The document's picture cell holds the
   desktop picture, then the phone one; on Cargo the block makes them one picture, the first one's
   sources from 768 px, the phone one's below (as TAP's banners from 728 px, tap-phone-picture).
   Other brands as before. Run: node --max-old-space-size=512 --test test/cargo-uld-phone.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html lang="en"><head><meta name="brand" content="cargo"><meta name="language" content="en"></head><body><main></main></body></html>');
window.location = {
  hostname: 'cargo.turnsthe.page', pathname: '/en/home', search: '', hash: '', href: 'https://cargo.turnsthe.page/en/home', origin: 'https://cargo.turnsthe.page', replace() {},
};
Object.defineProperty(window, 'origin', { value: 'https://cargo.turnsthe.page', configurable: true });
window.matchMedia = () => ({ matches: false, addEventListener() {}, addListener() {} });
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;
globalThis.matchMedia = window.matchMedia;
globalThis.ResizeObserver = class { observe() {} };
globalThis.requestAnimationFrame = (fn) => fn();
globalThis.cancelAnimationFrame = () => {};
globalThis.fetch = async () => new Response('{}', { status: 404 });
const { default: overlay } = await import('../blocks/hero-card-overlay/hero-card-overlay.js');

const DESK = 'https://cargo.turnsthe.page/en/media_desk.jpg';
const PHONE = 'https://cargo.turnsthe.page/en/media_phone.jpg';
const pics = `<p><picture><img src="${DESK}?width=750&format=jpg" alt="Teaser ULD" width="2880" height="1280"></picture><picture><img src="${PHONE}?width=750&format=jpg" alt="" width="750" height="1280"></picture></p>`;
const card = '<p>The right ULDs for every cargo</p><h2>We carry more than 30 different types of ULDs</h2><p><a href="/en/fleet-ulds/ulds">Find your perfect ULD</a></p>';
const brand = (b) => document.querySelector('meta[name="brand"]').setAttribute('content', b);
const place = (rows) => {
  const main = document.querySelector('main');
  main.innerHTML = `<div class="section"><div class="hero-card-overlay-wrapper"><div class="hero-card-overlay plain block">${rows}</div></div></div>`;
  return main.querySelector('.block');
};

test('Cargo: the second picture is the phone one below 768 px, one picture', () => {
  brand('cargo');
  const block = place(`<div><div>${pics}</div></div><div><div>${card}</div></div>`);
  overlay(block);
  const media = block.querySelector('.hero-card-overlay-media');
  const pictures = media.querySelectorAll('picture');
  assert.equal(pictures.length, 1);
  const sources = [...pictures[0].querySelectorAll('source')];
  const wide = sources.filter((s) => s.getAttribute('media') === '(min-width: 768px)');
  assert.ok(wide.length >= 1 && wide.every((s) => s.getAttribute('srcset').startsWith(`${DESK}?`)), 'the desktop picture from 768 px');
  assert.deepEqual(sources.slice(0, wide.length), wide, 'its sources first');
  sources.slice(wide.length).forEach((s) => {
    assert.equal(s.hasAttribute('media'), false);
    assert.ok(s.getAttribute('srcset').startsWith(`${PHONE}?`));
  });
  const img = pictures[0].querySelector('img');
  assert.ok(img.getAttribute('src').startsWith(`${PHONE}?`), 'the phone picture below 768 px');
  assert.equal(img.getAttribute('alt'), 'Teaser ULD');
  assert.equal(block.querySelector('.hero-card-overlay-card picture, .hero-card-overlay-card img'), null, 'not in the card');
  assert.equal(block.querySelector('source[media="(min-width: 728px)"]'), null, 'not TAP\'s breakpoint');
});

test('Cargo with one picture, and another brand with two: as before', () => {
  brand('cargo');
  const one = place(`<div><div><p><picture><img src="${DESK}?width=750" alt="Teaser ULD"></picture></p></div></div><div><div>${card}</div></div>`);
  overlay(one);
  assert.ok(one.querySelector('.hero-card-overlay-media img').getAttribute('src').startsWith(`${DESK}?`));
  assert.equal(one.querySelector('source[media="(min-width: 768px)"]'), null);
  brand('swiss');
  const other = place(`<div><div>${pics}</div></div><div><div>${card}</div></div>`);
  overlay(other);
  assert.ok(other.querySelector('.hero-card-overlay-media img').getAttribute('src').startsWith(`${DESK}?`));
  assert.equal(other.querySelector('source[media="(min-width: 768px)"]'), null);
});
