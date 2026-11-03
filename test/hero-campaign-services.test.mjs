/* eslint-disable max-len, class-methods-use-this */
/* hero-campaign option services (blocks/hero-campaign/hero-campaign.js): a stage without a heading
   whose text is an optional label paragraph and link-only paragraphs (Air Dolomiti's homepages)
   gets one of three looks, band, dock or tiles: the URL parameter hero-services, else the variant
   word on the block, else the page metadata hero-services, else band (unknown values skipped).
   The block carries the look as data-services and the class hero-campaign-services; the label is
   named (class, id) and labels the text as a group; icons by position. Any other shape, or the
   options slider, card, right, narrow, regular: the block as without the option.
   Run: node --max-old-space-size=512 --test test/hero-campaign-services.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head><meta name="brand" content="airdolomiti"><meta name="language" content="en"></head><body><main></main></body></html>');
window.location = {
  hostname: 'main--lh-airdolomiti--moved-permanently.aem.page', pathname: '/en/', search: '', href: 'https://main--lh-airdolomiti--moved-permanently.aem.page/en/', origin: 'https://main--lh-airdolomiti--moved-permanently.aem.page',
};
Object.defineProperty(window, 'origin', { value: window.location.origin, configurable: true });
window.matchMedia = () => ({ matches: false, addEventListener() {} });
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;
globalThis.ResizeObserver = class { observe() {} };
globalThis.requestAnimationFrame = (fn) => fn();
globalThis.cancelAnimationFrame = () => {};
const { default: decorate } = await import('../blocks/hero-campaign/hero-campaign.js');

const PIC = '<picture><img src="https://main--lh-airdolomiti--moved-permanently.aem.page/en/media_1.jpg?width=750&format=jpg" alt="" width="1915" height="850"></picture>';
const LINKS = '<p><a href="https://www.lufthansa.com/de/en/online-check-in">Check-In</a></p><p><a href="/en/manage-flight-booking">Manage My Booking</a></p><p><a href="/en/miles-and-more">Miles &amp; More</a></p><p><a href="https://airdolomiti.carsbookingengine.com/en_GB/search/">Car rental</a></p>';
const SERVICES = `<div><div>${PIC}</div></div><div><div><p>Manage your trip better</p>${LINKS}</div></div>`;

/** The block in the first section, after the homepage's visually hidden H1 (as on Air Dolomiti). */
const stage = (cls, rows, { hiddenH1 = true } = {}) => {
  const main = document.querySelector('main');
  main.replaceChildren();
  const section = document.createElement('div');
  section.className = 'section hidden-heading';
  if (hiddenH1) section.innerHTML = '<h1 id="air-dolomiti">Air Dolomiti</h1>';
  const wrapper = document.createElement('div');
  wrapper.className = 'hero-campaign-wrapper';
  const block = document.createElement('div');
  block.className = `hero-campaign block${cls ? ` ${cls}` : ''}`;
  block.innerHTML = rows;
  wrapper.append(block);
  section.append(wrapper);
  main.append(section);
  return block;
};
const setSearch = (search) => { window.location.search = search; };
const setMeta = (value) => {
  document.head.querySelector('meta[name="hero-services"]')?.remove();
  if (value === null) return;
  const meta = document.createElement('meta');
  meta.setAttribute('name', 'hero-services');
  meta.setAttribute('content', value);
  document.head.append(meta);
};
const look = (cls, { search = '', meta = null } = {}) => {
  setSearch(search);
  setMeta(meta);
  const block = stage(cls, SERVICES);
  decorate(block);
  setSearch('');
  setMeta(null);
  return block;
};
/** The decorated block's markup with the per-instance ids and the option word taken out. */
const normalized = (block) => block.outerHTML
  .replace(/hero-campaign-(heading|video|services-label)-[\d-]+/g, 'hero-campaign-$1-N')
  .replace(/ services(?=[ "])/, '');

test('the look: URL parameter, then the variant word, then the page metadata, then band', () => {
  assert.equal(look('services').dataset.services, 'band', 'nothing set: band');
  assert.equal(look('services', { meta: 'tiles' }).dataset.services, 'tiles', 'page or site metadata');
  assert.equal(look('services dock', { meta: 'tiles' }).dataset.services, 'dock', 'the variant word before the metadata');
  assert.equal(look('services dock', { search: '?hero-services=tiles', meta: 'band' }).dataset.services, 'tiles', 'the URL parameter first');
  assert.equal(look('services', { search: '?x=1&hero-services=DOCK' }).dataset.services, 'dock', 'case does not matter');
  const block = look('services band');
  assert.ok(block.classList.contains('hero-campaign-services'));
  assert.equal(block.dataset.services, 'band');
});

test('unknown values are skipped: the next source decides', () => {
  assert.equal(look('services dock', { search: '?hero-services=carousel' }).dataset.services, 'dock');
  assert.equal(look('services', { search: '?hero-services=', meta: 'tiles' }).dataset.services, 'tiles');
  assert.equal(look('services', { search: '?hero-services=big', meta: 'zebra' }).dataset.services, 'band');
});

test('the shape: label and link-only paragraphs, a group labelled by the label; the hidden H1 before the block does not count', () => {
  const block = look('services');
  const content = block.querySelector('.hero-campaign-content');
  const label = content.querySelector(':scope > .hero-campaign-services-label');
  assert.equal(label.textContent, 'Manage your trip better');
  assert.ok(label.id);
  assert.ok(label === content.firstElementChild, 'the label is the first paragraph');
  assert.equal(content.getAttribute('role'), 'group');
  assert.equal(content.getAttribute('aria-labelledby'), label.id);
  const items = [...content.querySelectorAll(':scope > .hero-campaign-cta')];
  assert.equal(items.length, 4);
  items.forEach((p) => assert.ok(p.querySelector('a.button.secondary'), 'the links stay buttons (secondary)'));
  assert.deepEqual([...content.querySelectorAll('a')].map((a) => a.textContent), ['Check-In', 'Manage My Booking', 'Miles & More', 'Car rental'], 'links stay links in their order');
  assert.equal(block.querySelector('img').getAttribute('loading'), 'eager', 'the first image stays eager');
  assert.equal(block.getAttribute('role'), null, 'no heading: no region (as without the option)');
});

test('without a label: the look applies, no group role', () => {
  setSearch('');
  const block = stage('services tiles', `<div><div>${PIC}</div></div><div><div>${LINKS}</div></div>`);
  decorate(block);
  assert.equal(block.dataset.services, 'tiles');
  const content = block.querySelector('.hero-campaign-content');
  assert.equal(content.getAttribute('role'), null);
  assert.equal(content.getAttribute('aria-labelledby'), null);
  assert.ok(content.querySelector('.hero-campaign-services-label') === null, 'no label class');
  assert.deepEqual([...content.children].map((p) => p.dataset.icon), ['plane', 'suitcase', 'star', 'car']);
});

test('icons by position: gear for the label, plane, suitcase, star, car for the items, none for a fifth', () => {
  setSearch('');
  const block = stage('services', `<div><div>${PIC}</div></div><div><div><p>Manage your trip better</p>${LINKS}<p><a href="/en/offers">Offers</a></p></div></div>`);
  decorate(block);
  const children = [...block.querySelector('.hero-campaign-content').children];
  assert.deepEqual(children.map((p) => p.dataset.icon ?? null), ['gear', 'plane', 'suitcase', 'star', 'car', null]);
});

test('ignored: a heading in the block, the options slider, card, right, narrow, regular, or another shape: the block as without the option', () => {
  const cases = [
    ['', `<div><div>${PIC}</div></div><div><div><h2>Manage your trip</h2><p>Manage your trip better</p>${LINKS}</div></div>`, 'a heading in the block'],
    ['slider', SERVICES, 'slider (one slide)'],
    ['card', SERVICES, 'card'],
    ['right', SERVICES, 'right'],
    ['narrow', SERVICES, 'narrow'],
    ['regular', SERVICES, 'regular'],
    ['', `<div><div>${PIC}</div></div><div><div><p>Manage your trip better</p><p>Two labels</p>${LINKS}</div></div>`, 'two text paragraphs'],
    ['', `<div><div>${PIC}</div></div><div><div><p>Manage your trip better</p>${LINKS}<p>A closing text</p></div></div>`, 'text after the links'],
    ['', `<div><div>${PIC}</div></div><div><div><p>Manage your trip better</p></div></div>`, 'no link at all'],
    ['', `<div><div>${PIC}</div></div><div><div><p>Read <a href="/en/x">this</a> first</p>${LINKS}</div></div>`, 'a link inside text'],
  ];
  cases.forEach(([cls, rows, why]) => {
    setSearch('?hero-services=dock');
    const withOption = stage(`services${cls ? ` ${cls}` : ''}`, rows);
    decorate(withOption);
    const without = stage(cls, rows);
    decorate(without);
    setSearch('');
    assert.ok(!withOption.classList.contains('hero-campaign-services'), `${why}: no class`);
    assert.equal(withOption.dataset.services, undefined, `${why}: no data-services`);
    assert.equal(normalized(withOption), normalized(without), `${why}: the same DOM`);
  });
});

test('output unchanged without the option, even with the URL parameter or the metadata set', () => {
  setSearch('?hero-services=tiles');
  setMeta('dock');
  const block = stage('', SERVICES);
  decorate(block);
  setSearch('');
  setMeta(null);
  const plain = stage('', SERVICES);
  decorate(plain);
  assert.ok(!block.classList.contains('hero-campaign-services'));
  assert.equal(block.dataset.services, undefined);
  assert.ok(block.querySelector('[data-icon], .hero-campaign-services-label, [role="group"]') === null);
  assert.equal(normalized(block), normalized(plain));
});

test('without the hidden H1 in the section the option applies the same way', () => {
  setSearch('');
  const block = stage('services dock', SERVICES, { hiddenH1: false });
  decorate(block);
  assert.equal(block.dataset.services, 'dock');
});
