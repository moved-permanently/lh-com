/* eslint-disable max-len, class-methods-use-this */
/* Brief 372, row 94 (tools/reports/tap/parity.md): a TAP banner's phone picture. With
   site.phonePictures, tap-import.mjs writes www's phone rendition (imageMobile) as the picture
   cell's second picture; hero-campaign (a single banner and the slider's slides) and
   hero-card-overlay show it below 768 px: one <picture>, the first picture's sources from 768 px,
   then the phone picture's. TAP only; elsewhere a second picture stays as it is today.
   Run: node --max-old-space-size=512 --test test/tap-phone-picture.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html lang="pt"><head><meta name="brand" content="tap"><meta name="language" content="pt"></head><body><main></main></body></html>');
window.location = {
  hostname: 'tap.turnsthe.page', pathname: '/pt-pt/a-bordo/altitude-film-festival', search: '', hash: '', href: 'https://tap.turnsthe.page/pt-pt/a-bordo/altitude-film-festival', origin: 'https://tap.turnsthe.page', replace() {},
};
Object.defineProperty(window, 'origin', { value: 'https://tap.turnsthe.page', configurable: true });
window.matchMedia = () => ({ matches: false, addEventListener() {}, addListener() {} });
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;
globalThis.matchMedia = window.matchMedia;
globalThis.ResizeObserver = class { observe() {} };
globalThis.requestAnimationFrame = (fn) => fn();
globalThis.cancelAnimationFrame = () => {};
globalThis.fetch = async () => new Response('{}', { status: 404 });
const { default: campaign } = await import('../blocks/hero-campaign/hero-campaign.js');
const { default: overlay } = await import('../blocks/hero-card-overlay/hero-card-overlay.js');

const DESK = 'https://tap.turnsthe.page/pt-pt/media_desk.jpg';
const PHONE = 'https://tap.turnsthe.page/pt-pt/media_phone.jpg';
const pics = `<p><picture><img src="${DESK}?width=750&format=jpg" alt="Festival" width="1920" height="450"></picture><picture><img src="${PHONE}?width=750&format=jpg" alt="" width="1280" height="630"></picture></p>`;
const text = (n) => `<h2>Altitude ${n}</h2><p>Filmes a bordo.</p>`;
const brand = (b) => document.querySelector('meta[name="brand"]').setAttribute('content', b);
const place = (cls, rows) => {
  const main = document.querySelector('main');
  main.innerHTML = `<div class="section"><div class="${cls.split(' ')[0]}-wrapper"><div class="${cls} block">${rows}</div></div></div>`;
  return main.querySelector('.block');
};

// the one picture of a stage: the first picture from 768 px, the phone one below
const phoneMedia = (media) => {
  const pictures = media.querySelectorAll('picture');
  assert.equal(pictures.length, 1);
  const sources = [...pictures[0].querySelectorAll('source')];
  const wide = sources.filter((s) => s.getAttribute('media') === '(min-width: 768px)');
  assert.equal(wide.length >= 1 && wide.every((s) => s.getAttribute('srcset').startsWith(`${DESK}?`)), true, 'the first picture from 768 px');
  assert.deepEqual(sources.slice(0, wide.length), wide, 'its sources first');
  sources.slice(wide.length).forEach((s) => {
    assert.equal(s.hasAttribute('media'), false);
    assert.equal(s.getAttribute('srcset').startsWith(`${PHONE}?`), true);
  });
  const img = pictures[0].querySelector('img');
  assert.equal(img.getAttribute('src').startsWith(`${PHONE}?`), true, 'the phone picture below 768 px');
  assert.equal(img.getAttribute('alt'), 'Festival', 'the first picture\'s text');
  assert.deepEqual([img.getAttribute('width'), img.getAttribute('height')], ['1280', '630']);
};

test('hero-campaign (narrow) on TAP: the second picture is the phone one, not content', async () => {
  brand('tap');
  const block = place('hero-campaign narrow', `<div><div>${pics}</div></div><div><div>${text(1)}</div></div>`);
  await campaign(block);
  phoneMedia(block.querySelector('.hero-campaign-media'));
  assert.equal(block.querySelector('.hero-campaign-content picture, .hero-campaign-content img'), null);
});

test('hero-campaign (slider) on TAP: each slide its phone picture', async () => {
  brand('tap');
  const block = place('hero-campaign slider narrow', `<div><div>${pics}</div></div><div><div>${text(1)}</div></div><div><div>${pics}</div></div><div><div>${text(2)}</div></div>`);
  await campaign(block);
  const slides = [...block.querySelectorAll('.hero-campaign-slide')];
  assert.equal(slides.length, 2);
  slides.forEach((s) => {
    phoneMedia(s.querySelector('.hero-campaign-media'));
    assert.equal(s.querySelector('.hero-campaign-content picture'), null);
  });
});

test('hero-card-overlay on TAP: the phone picture below 768 px', () => {
  brand('tap');
  const block = place('hero-card-overlay', `<div><div>${pics}</div></div><div><div>${text(3)}</div></div>`);
  overlay(block);
  phoneMedia(block.querySelector('.hero-card-overlay-media'));
  assert.equal(block.querySelector('.hero-card-overlay-card picture, .hero-card-overlay-card img'), null);
});

test('one picture on TAP, and every other brand: as today', async () => {
  brand('tap');
  const one = place('hero-card-overlay', `<div><div><p><picture><img src="${DESK}?width=750" alt="Festival"></picture></p></div></div><div><div>${text(4)}</div></div>`);
  overlay(one);
  assert.equal(one.querySelector('.hero-card-overlay-media img').getAttribute('src').startsWith(`${DESK}?`), true);
  assert.equal(one.querySelector('source[media="(min-width: 768px)"]'), null);
  brand('swiss');
  const other = place('hero-campaign narrow', `<div><div>${pics}</div></div><div><div>${text(5)}</div></div>`);
  await campaign(other);
  assert.equal(other.querySelector('.hero-campaign-media img').getAttribute('src').startsWith(`${DESK}?`), true);
  assert.equal(other.querySelector('source[media="(min-width: 768px)"]'), null);
  const card = place('hero-card-overlay', `<div><div>${pics}</div></div><div><div>${text(6)}</div></div>`);
  overlay(card);
  assert.equal(card.querySelector('.hero-card-overlay-media img').getAttribute('src').startsWith(`${DESK}?`), true);
  assert.equal(card.querySelector('source[media="(min-width: 768px)"]'), null);
});
