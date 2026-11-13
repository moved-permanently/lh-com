/* eslint-disable max-len, class-methods-use-this */
/* TAP R4-10 (ema-lufthansa's round 4, brief 407): the entertainment pages' news (cards-teaser
   option slider, the importer's desktopType slider) as www.flytap.com/pt-pt/a-bordo/entretenimento's
   swiper (2026-11-05, 1440 / 1280 / 1024 / 768 / 390 px): from 728 px a round previous and next
   button (40 px, #f7f7f8, Material's chevron at weight 300, the unavailable one #eaeaeb at 30 %)
   16 px either side of the row, two cards in view below 1024 px and three from 1024 px, one card
   a step, bullets under the row (the current one a 20 px green pill); a grid on phones as before.
   blocks/cards-teaser/cards-teaser-tap.js, the look in styles/themes/tap.css; other brands and
   TAP's other card lists as before.
   Run: node --max-old-space-size=512 --test test/tap-news-slider.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html lang="en"><head><meta name="brand" content="tap"></head><body><main></main></body></html>');
window.location = {
  hostname: 'tap.turnsthe.page', pathname: '/en-pt/on-board/entertainment', search: '', hash: '', href: 'https://tap.turnsthe.page/en-pt/on-board/entertainment', origin: 'https://tap.turnsthe.page',
};
Object.defineProperty(window, 'origin', { value: 'https://tap.turnsthe.page', configurable: true });
window.matchMedia = () => ({ matches: false, addEventListener() {} });
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;
globalThis.ResizeObserver = class { observe() {} };
globalThis.requestAnimationFrame = (fn) => fn();
globalThis.cancelAnimationFrame = () => {};
globalThis.getComputedStyle = () => ({ columnGap: '24px' });
window.getComputedStyle = globalThis.getComputedStyle;

const { default: decorate } = await import('../blocks/cards-teaser/cards-teaser.js');
const { sliderState, TAP_NEWS_LABELS } = await import('../blocks/cards-teaser/cards-teaser-tap.js');

const brand = (b) => document.querySelector('meta[name="brand"]').setAttribute('content', b);
const news = (cls = 'cards-teaser three-up slider', n = 4) => {
  const block = document.createElement('div');
  block.className = cls;
  block.innerHTML = Array.from({ length: n }, (_, i) => `<div><div><picture><img src="/media/n${i}.jpg" alt=""></picture></div><div><h3>News ${i + 1}</h3><p>Text ${i + 1}</p></div></div>`).join('');
  document.querySelector('main').append(block);
  return block;
};
// www at 1440: the row 888 px, columns 277 px 24 apart (a step 301 px); TAP's text card 16 px
// inside its column (245 px drawn), so a step is the distance between two cards, not card + gap
const lay = (ul, { clientWidth = 888, scrollWidth = 1189, scrollLeft = 0 } = {}) => {
  Object.defineProperty(ul, 'clientWidth', { value: clientWidth, configurable: true });
  Object.defineProperty(ul, 'scrollWidth', { value: scrollWidth, configurable: true });
  Object.defineProperty(ul, 'scrollLeft', { value: scrollLeft, configurable: true, writable: true });
  [...ul.children].forEach((li, i) => { li.getBoundingClientRect = () => ({ left: 16 + i * 301, width: 245 }); });
};

test('sliderState: three of four in view (1440: two positions), the ends and the current position', () => {
  const base = {
    count: 4, clientWidth: 888, scrollWidth: 1189, pitch: 301,
  };
  assert.deepEqual(sliderState({ ...base, scrollLeft: 0 }), {
    perView: 3, positions: 2, at: 0, atStart: true, atEnd: false, scrollable: true,
  });
  assert.deepEqual(sliderState({ ...base, scrollLeft: 301 }), {
    perView: 3, positions: 2, at: 1, atStart: false, atEnd: true, scrollable: true,
  });
  // two in view (768 to 1023 px): three positions
  assert.equal(sliderState({
    count: 4, clientWidth: 560, scrollWidth: 1144, pitch: 292, scrollLeft: 0,
  }).positions, 3);
  // the phones' grid: nothing to scroll, one position
  assert.deepEqual(sliderState({
    count: 4, clientWidth: 358, scrollWidth: 358, pitch: 382, scrollLeft: 0,
  }), {
    perView: 4, positions: 1, at: 0, atStart: true, atEnd: true, scrollable: false,
  });
});

test('TAP news slider: previous, the list, next and the bullets; the list keeps its place (the theme\'s > ul rules)', async () => {
  brand('tap');
  const block = news();
  await decorate(block);
  assert.equal(block.classList.contains('cards-teaser-tap-slider'), true);
  assert.deepEqual([...block.children].map((c) => c.className || c.tagName), ['cards-teaser-prev', 'UL', 'cards-teaser-next', 'cards-teaser-dots']);
  const ul = block.querySelector(':scope > ul');
  assert.ok(ul.id, 'the list has an id');
  assert.equal(ul.children.length, 4);
  const prev = block.querySelector('.cards-teaser-prev');
  const next = block.querySelector('.cards-teaser-next');
  [prev, next].forEach((b) => {
    assert.equal(b.tagName, 'BUTTON');
    assert.equal(b.getAttribute('type'), 'button');
    assert.equal(b.getAttribute('aria-controls'), ul.id);
  });
  assert.equal(prev.getAttribute('aria-label'), TAP_NEWS_LABELS.en.previous);
  assert.equal(next.getAttribute('aria-label'), TAP_NEWS_LABELS.en.next);
});

test('TAP news slider: at the start previous is unavailable (aria-disabled, keeps the focus), next steps one card, the bullets follow', async () => {
  brand('tap');
  const block = news();
  await decorate(block);
  const ul = block.querySelector(':scope > ul');
  lay(ul);
  const steps = [];
  ul.scrollBy = ({ left }) => { steps.push(left); ul.scrollLeft += left; ul.dispatchEvent(new window.Event('scroll')); };
  ul.dispatchEvent(new window.Event('scroll'));
  const prev = block.querySelector('.cards-teaser-prev');
  const next = block.querySelector('.cards-teaser-next');
  assert.equal(prev.getAttribute('aria-disabled'), 'true');
  assert.equal(next.getAttribute('aria-disabled'), 'false');
  assert.equal(prev.disabled, false, 'not disabled: a keyboard visitor keeps the focus');
  const dots = [...block.querySelectorAll('.cards-teaser-dots > button')];
  assert.equal(dots.length, 2, 'one bullet per position');
  assert.equal(dots[0].getAttribute('aria-current'), 'true');
  assert.equal(dots[0].getAttribute('aria-label'), '1 of 2');
  next.click();
  assert.deepEqual(steps, [301], 'one card and the gap');
  assert.equal(prev.getAttribute('aria-disabled'), 'false');
  assert.equal(next.getAttribute('aria-disabled'), 'true');
  assert.equal(dots[1].getAttribute('aria-current'), 'true');
  assert.equal(dots[0].hasAttribute('aria-current'), false);
  next.click();
  assert.deepEqual(steps, [301], 'next at the end does nothing');
  dots[0].click();
  assert.deepEqual(steps, [301, -301], 'a bullet goes to its position');
});

test('TAP news slider: nothing to scroll (the phones\' grid) marks the block static, no bullets', async () => {
  brand('tap');
  const block = news();
  await decorate(block);
  const ul = block.querySelector(':scope > ul');
  lay(ul, { clientWidth: 358, scrollWidth: 358 });
  ul.dispatchEvent(new window.Event('scroll'));
  assert.equal(block.classList.contains('cards-teaser-static'), true);
  assert.equal(block.querySelectorAll('.cards-teaser-dots > button').length, 0);
});

test('other card lists and other brands as before: the list alone', async () => {
  brand('tap');
  const grid = news('cards-teaser three-up');
  await decorate(grid);
  assert.deepEqual([...grid.children].map((c) => c.tagName), ['UL']);
  brand('swiss');
  const swiss = news();
  await decorate(swiss);
  assert.deepEqual([...swiss.children].map((c) => c.tagName), ['UL']);
  assert.equal(swiss.classList.contains('cards-teaser-tap-slider'), false);
});

const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
const part = css.slice(css.indexOf('/* the entertainment\'s news as www\'s swiper'));

test('tap.css: www\'s buttons and bullets, two cards in view from 728 px and three from 1024 px, the controls hidden on phones', () => {
  assert.ok(part.length < css.length, 'the news slider part');
  // the controls only from 728 px and only when the row scrolls
  assert.match(part, /body\.brand-tap \.cards-teaser-tap-slider :is\(\.cards-teaser-prev, \.cards-teaser-next, \.cards-teaser-dots\) \{\s*display: none;\s*\}/);
  assert.match(part, /@media \(width >= 728px\) \{[^@]*body\.brand-tap \.cards-teaser-tap-slider \{\s*display: grid;\s*grid-template-columns: 40px minmax\(0, 1fr\) 40px;\s*gap: 0 16px;\s*align-items: center;\s*margin-top: -48px;\s*\}/);
  assert.match(part, /body\.brand-tap \.cards-teaser-tap-slider > ul \{[^}]*grid-auto-columns: calc\(\(100% - 24px\) \/ 2\);[^}]*grid-auto-flow: column;[^}]*overflow-x: auto;[^}]*scroll-snap-type: x mandatory;[^}]*\}/);
  assert.match(part, /body\.brand-tap \.cards-teaser-tap-slider:not\(\.cards-teaser-static\) :is\(\.cards-teaser-prev, \.cards-teaser-next\) \{\s*display: flex;\s*\}/);
  assert.match(part, /@media \(width >= 1024px\) \{\s*body\.brand-tap \.cards-teaser-tap-slider \{\s*padding-inline: 32px;\s*\}\s*body\.brand-tap \.cards-teaser-tap-slider > ul \{\s*grid-auto-columns: calc\(\(100% - 2 \* 24px\) \/ 3\);\s*\}\s*\}/);
  assert.match(part, /@media \(width >= 1280px\) \{\s*body\.brand-tap \.cards-teaser-tap-slider \{\s*padding-inline: 60px;\s*\}\s*\}/);
  // a text card inside its column snaps with the column (the first at 0: previous unavailable)
  // the card rules' condition since TAP row 156 (standing order 14): any paragraph, a CTA alone too, at the old weight
  assert.match(part, /> ul > li:has\(> \.cards-teaser-body > p:not\(\.cards-teaser-title\)\) \{\s*scroll-margin-inline: 16px;\s*\}/);
  // the button: 40 px, #f7f7f8, the unavailable one #eaeaeb at 30 %, Material's chevron at weight 300
  assert.match(part, /:is\(\.cards-teaser-prev, \.cards-teaser-next\) \{[^}]*width: 40px;[^}]*height: 40px;[^}]*border-radius: 9999px;[^}]*background-color: #f7f7f8;[^}]*color: #424045;/);
  assert.match(part, /:is\(\.cards-teaser-prev, \.cards-teaser-next\)\[aria-disabled="true"\] \{\s*background-color: #eaeaeb;\s*cursor: default;\s*opacity: 0\.3;\s*\}/);
  assert.match(part, /M9\.7 18 8\.65 16\.95 13\.6 12 8\.65 7\.05 9\.7 6l6 6z/);
  // the bullets: 24 px targets, 8 px drawn, the current a 20 px green pill
  assert.match(part, /\.cards-teaser-dots > button \{[^}]*width: 24px;[^}]*height: 24px;/);
  assert.match(part, /\.cards-teaser-dots > button\[aria-current="true"\]::before \{\s*width: 20px;\s*background-color: #65c922;\s*opacity: 1;\s*\}/);
  // the old one-row-of-four rule is gone
  assert.doesNotMatch(css, /\.cards-teaser\.slider > ul \{\s*grid-auto-columns: calc\(\(100% - 3 \* 24px\) \/ 4\)/);
});
