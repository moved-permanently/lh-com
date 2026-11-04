/* eslint-disable max-len, class-methods-use-this */
/* TAP's homepage under the stage (brief 330: www.flytap.com/en-pt at 1440 and 390 px):
   - the booking box pulled over the stage's foot as www (the card 18 px above the stage's bottom),
     short only of what sits in the tab bar's own width (blocks/booking-box/over-hero.js);
   - the extras' tiles (cards-icon with an icon on every tile) as www's pill carousel on brand tap:
     previous, the scrolling row, next (blocks/cards-icon/cards-icon-tap.js); the link-list tiles
     and every other brand as before;
   - "Plan your trip in detail" (carousel-cards whose cards are a picture and a linked title) as
     www's card carousel on brand tap: previous, dots and next in one group under the row; other
     cards and other brands as before.
   Run: node --max-old-space-size=512 --test test/tap-under-stage.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html lang="en"><head><meta name="brand" content="tap"></head><body><main></main></body></html>');
window.location = {
  hostname: 'tap.turnsthe.page', pathname: '/en-pt', search: '', hash: '', href: 'https://tap.turnsthe.page/en-pt', origin: 'https://tap.turnsthe.page',
};
Object.defineProperty(window, 'origin', { value: 'https://tap.turnsthe.page', configurable: true });
window.matchMedia = () => ({ matches: false, addEventListener() {} });
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;
globalThis.ResizeObserver = class { observe() {} };
globalThis.requestAnimationFrame = (fn) => fn();
globalThis.cancelAnimationFrame = () => {};
globalThis.getComputedStyle = () => ({ columnGap: '12px' });
window.getComputedStyle = globalThis.getComputedStyle;

const { overHeroPull } = await import('../blocks/booking-box/over-hero.js');
const { default: decorateIcons } = await import('../blocks/cards-icon/cards-icon.js');
const { TAP_PILL_LABELS } = await import('../blocks/cards-icon/cards-icon-tap.js');
const { default: decorateCarousel } = await import('../blocks/carousel-cards/carousel-cards.js');

const rect = (left, top, width, height) => ({
  left, top, width, height, right: left + width, bottom: top + height,
});
const brand = (b) => document.querySelector('meta[name="brand"]').setAttribute('content', b);

// www at 1440 (en-pt): the stage 104 to 844; before the pull the box's section sits below it, the
// tab bar (438 to 1002) 64 px above the 204 px card; the stage's previous / dots / next at 146 to
// 290, level with the tab bar once the box is up
const hero = rect(32, 104, 1376, 740);
const tabsAt = (top) => rect(438, top, 564, 48);
const cardAt = (top) => rect(160, top, 1120, 204);
const controls = rect(146, 568, 144, 40);

test('booking box: pulled up until the card is 18 px above the stage\'s bottom (www: 222 px of overlap), the stage\'s controls beside the tab bar not in the way', () => {
  const top = 868;
  const pull = overHeroPull({
    hero, tabs: tabsAt(top), card: cardAt(top + 64), top, blockers: [controls],
  });
  assert.equal(pull, (top + 64) - (844 - 222));
  // the card's bottom then: 844 - 18
  assert.equal(top + 64 - pull + 204, 826);
});

test('booking box: something within the tab bar\'s width stays clear of it (16 px above the tab bar)', () => {
  const top = 868;
  const inTheWay = rect(600, 640, 100, 60);
  const pull = overHeroPull({
    hero, tabs: tabsAt(top), card: cardAt(top + 64), top, blockers: [controls, inTheWay],
  });
  // free: 844 - 700 - 16 - 64 = 64 px of the card over the stage
  assert.equal(pull, (top + 64) - (844 - 64));
});

test('booking box: without a tab bar the card\'s width counts; nothing to pull when there is no room', () => {
  const top = 868;
  const card = cardAt(top);
  assert.equal(overHeroPull({
    hero, tabs: null, card, top, blockers: [controls],
  }), top - (844 - Math.min(222, 844 - 608 - 16)));
  assert.equal(overHeroPull({
    hero, tabs: null, card, top, blockers: [rect(160, 830, 200, 14)],
  }), 0);
  assert.equal(overHeroPull({
    hero: rect(0, 0, 0, 0), tabs: null, card, top, blockers: [],
  }), 0, 'no stage height');
});

const icon = (n) => `<picture><img src="./media_${n}.svg" alt="" width="20" height="20"></picture>`;
const iconRows = () => ['Add insurance', 'Rent a car', 'Book accommodation', 'Bag pick-up & delivery', 'Buy eSIM'].map((l, i) => `<div><div>${icon(i)}</div><div><a href="https://example.org/${i}">${l}</a></div></div>`).join('');
const iconBlock = (rows) => {
  const main = document.querySelector('main');
  main.replaceChildren();
  const block = document.createElement('div');
  block.className = 'cards-icon block';
  block.innerHTML = rows;
  main.append(block);
  return block;
};

test('tiles on brand tap: www\'s pill carousel, previous, the row, next, labelled in the page\'s language', async () => {
  brand('tap');
  const block = iconBlock(iconRows());
  await decorateIcons(block);
  assert.equal(block.classList.contains('cards-icon-tap'), true);
  assert.deepEqual([...block.children].map((c) => c.className), ['cards-icon-prev', 'cards-icon-viewport', 'cards-icon-next']);
  const track = block.querySelector('.cards-icon-viewport > ul');
  assert.ok(track && track.id, 'the row has an id');
  assert.equal(track.children.length, 5);
  const [prev, next] = [block.querySelector('.cards-icon-prev'), block.querySelector('.cards-icon-next')];
  assert.equal(prev.getAttribute('aria-controls'), track.id);
  assert.equal(next.getAttribute('aria-controls'), track.id);
  assert.equal(prev.getAttribute('aria-label'), TAP_PILL_LABELS.en.previous);
  assert.equal(next.getAttribute('aria-label'), TAP_PILL_LABELS.en.next);
  assert.equal(prev.disabled, true, 'at the start');
  // the pill: the icon in its circle, the label beside it, the whole pill the link
  const tile = track.querySelector('a.cards-icon-tile');
  assert.deepEqual([...tile.children].map((c) => c.className), ['cards-icon-icon', 'cards-icon-label']);
});

test('tiles: the link-list tiles (no icons) on brand tap and every other brand\'s tiles as before', async () => {
  brand('tap');
  const links = iconBlock(['Bagagem de mão', 'Bagagem de porão'].map((l, i) => `<div><div><p><a href="/pt-pt/${i}">${l}</a></p></div></div>`).join(''));
  await decorateIcons(links);
  assert.equal(links.classList.contains('cards-icon-tap'), false);
  assert.deepEqual([...links.children].map((c) => c.tagName), ['UL']);
  brand('cargo');
  const cargo = iconBlock(iconRows());
  await decorateIcons(cargo);
  assert.equal(cargo.classList.contains('cards-icon-tap'), false);
  assert.deepEqual([...cargo.children].map((c) => c.tagName), ['UL']);
  brand('tap');
});

test('the pill labels in TAP\'s languages', () => {
  ['pt', 'en', 'es', 'fr', 'de', 'it', 'pl'].forEach((l) => {
    assert.ok(TAP_PILL_LABELS[l].previous && TAP_PILL_LABELS[l].next, l);
    assert.notEqual(TAP_PILL_LABELS[l].previous, TAP_PILL_LABELS[l].next, l);
  });
});

const pic = (n) => `<picture><img src="./media_${n}.jpg?width=750&format=jpg" alt="" width="1280" height="720"></picture>`;
const planRows = () => ['Baggage rules and restrictions', 'Special needs and wheelchairs', 'Traveling with animals', 'Traveling with sports equipment'].map((t, i) => `<div><div>${pic(i)}</div><div><h3><a href="/en-pt/x${i}">${t}</a></h3></div></div>`).join('');
const carouselBlock = (rows) => {
  const main = document.querySelector('main');
  main.replaceChildren();
  const block = document.createElement('div');
  block.className = 'carousel-cards block';
  block.innerHTML = rows;
  main.append(block);
  return block;
};

test('"Plan your trip" on brand tap: TAP\'s card carousel, the row, then previous, dots and next in one group', async () => {
  brand('tap');
  const block = carouselBlock(planRows());
  await decorateCarousel(block);
  assert.equal(block.classList.contains('carousel-cards-tap'), true);
  assert.deepEqual([...block.children].map((c) => c.className), ['carousel-cards-viewport', 'carousel-cards-nav']);
  const nav = block.querySelector('.carousel-cards-nav');
  assert.deepEqual([...nav.children].map((c) => c.className), ['carousel-cards-prev', 'carousel-cards-dots', 'carousel-cards-next']);
  assert.equal(block.querySelectorAll('.carousel-cards-track > li').length, 4);
  assert.ok(block.querySelector('.carousel-cards-slide .carousel-cards-image img'), 'the pictures stay');
});

test('carousel cards: richer cards on brand tap and every other brand\'s carousel as before', async () => {
  brand('tap');
  const rich = carouselBlock([1, 2, 3].map((i) => `<div><div>${pic(i)}</div><div><p>Category</p><h3>Title ${i}</h3><p>Text</p><p><a href="/en-pt/y${i}">More</a></p></div></div>`).join(''));
  await decorateCarousel(rich);
  assert.equal(rich.classList.contains('carousel-cards-tap'), false);
  assert.deepEqual([...rich.children].map((c) => c.className), ['carousel-cards-viewport', 'carousel-cards-dots']);
  brand('cargo');
  const cargo = carouselBlock(planRows());
  await decorateCarousel(cargo);
  assert.equal(cargo.classList.contains('carousel-cards-tap'), false);
  assert.deepEqual([...cargo.children].map((c) => c.className), ['carousel-cards-viewport', 'carousel-cards-dots']);
  brand('tap');
});
