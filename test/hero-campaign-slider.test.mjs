/* eslint-disable max-len, class-methods-use-this */
/* hero-campaign option slider (blocks/hero-campaign/hero-campaign.js): several stages, one at a
   time; each row with a picture starts a slide; carousel semantics as carousel-images (region,
   slides as labelled groups, previous/next, dots with aria-current, arrow keys); only the first
   slide's image eager; one slide: the block as without the option. Run: node --test test/*.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head><meta name="brand" content="cargo"><meta name="language" content="en"></head><body><main></main></body></html>');
window.location = {
  hostname: 'cargo.turnsthe.page', pathname: '/en/home', search: '', href: 'https://cargo.turnsthe.page/en/home', origin: 'https://cargo.turnsthe.page',
};
Object.defineProperty(window, 'origin', { value: 'https://cargo.turnsthe.page', configurable: true });
window.matchMedia = () => ({ matches: false, addEventListener() {} });
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;
globalThis.ResizeObserver = class { observe() {} };
globalThis.requestAnimationFrame = (fn) => fn();
globalThis.cancelAnimationFrame = () => {};
const { default: decorate } = await import('../blocks/hero-campaign/hero-campaign.js');

const pic = (n) => `<picture><img src="https://cargo.turnsthe.page/en/media_${n}.webp?width=750&format=webp" alt="" width="2880" height="1234"></picture>`;
const stageBlock = (cls, rows, sectionIndex = 0) => {
  const main = document.querySelector('main');
  main.replaceChildren();
  for (let i = 0; i <= sectionIndex; i += 1) {
    const s = document.createElement('div');
    s.className = 'section';
    main.append(s);
  }
  const block = document.createElement('div');
  block.className = `hero-campaign block ${cls}`;
  block.innerHTML = rows;
  main.lastElementChild.append(block);
  return block;
};
const CARGO = `<div><div>${pic(1)}</div></div><div><div><h1>Boost your booking</h1><p>Your absolute priority.</p><p><strong><a href="/en/emergency">Explore more</a></strong></p></div></div>`
  + `<div><div>${pic(2)}</div></div><div><div><h2>eAWB Data Capture</h2><p><a href="https://www.lufthansa-cargo.com/en/eservices/awb-capture">Try it</a></p></div></div>`
  + `<div><div>${pic(3)}</div></div><div><div><h2>Pharma map</h2><p><a href="/en/active-temp-control">Discover</a></p></div></div>`;

test('three slides: a carousel region, slides as labelled groups each a stage of its own, the options on every slide', () => {
  const block = stageBlock('slider right', CARGO);
  decorate(block);
  assert.equal(block.getAttribute('role'), 'region');
  assert.equal(block.getAttribute('aria-roledescription'), 'carousel');
  assert.equal(block.getAttribute('aria-label'), 'Stage');
  const track = block.querySelector(':scope > .hero-campaign-track');
  const slides = [...track.children];
  assert.equal(slides.length, 3);
  slides.forEach((s, i) => {
    assert.equal(s.className, `hero-campaign hero-campaign-slide right${i === 0 ? ' hero-campaign-current' : ''}`);
    assert.equal(s.getAttribute('role'), 'group');
    assert.equal(s.getAttribute('aria-roledescription'), 'slide');
    assert.equal(s.getAttribute('aria-label'), `${i + 1} of 3`);
    assert.ok(s.querySelector(':scope > .hero-campaign-media picture'), `slide ${i + 1}: its image`);
    assert.ok(s.querySelector(':scope > .hero-campaign-inner .hero-campaign-content :is(h1, h2)'));
    assert.equal(s.getAttribute('aria-labelledby'), null, 'the slide is a group, not a region');
  });
  assert.equal(slides[0].querySelector('h1').textContent, 'Boost your booking');
  assert.ok(slides[0].querySelector('.hero-campaign-cta a.button'));
  // ids stay unique per slide
  const ids = [...block.querySelectorAll('[id]')].map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length);
  // only the first slide's image is eager (the block is in the first section)
  assert.deepEqual(slides.map((s) => s.querySelector('img').getAttribute('loading')), ['eager', 'lazy', 'lazy']);
});

test('controls: previous and next with labels, a dot per slide (aria-current), arrow keys on the focusable track', () => {
  const block = stageBlock('slider', CARGO);
  decorate(block);
  const track = block.querySelector('.hero-campaign-track');
  const prev = block.querySelector(':scope > .hero-campaign-prev');
  const next = block.querySelector(':scope > .hero-campaign-next');
  assert.equal(prev.getAttribute('aria-label'), 'Previous slide');
  assert.equal(next.getAttribute('aria-label'), 'Next slide');
  assert.equal(prev.getAttribute('aria-controls'), track.id);
  assert.equal(track.getAttribute('tabindex'), '0');
  const dots = [...block.querySelectorAll('.hero-campaign-dot')];
  assert.deepEqual(dots.map((d) => [d.getAttribute('aria-label'), d.getAttribute('aria-current')]), [['1 of 3', 'true'], ['2 of 3', null], ['3 of 3', null]]);
  const scrolls = [];
  track.scrollTo = (o) => scrolls.push(o.left);
  Object.defineProperty(track, 'clientWidth', { value: 1000, configurable: true });
  next.dispatchEvent(new window.Event('click'));
  dots[2].dispatchEvent(new window.Event('click'));
  prev.dispatchEvent(new window.Event('click'));
  const key = new window.Event('keydown');
  key.key = 'ArrowRight';
  track.dispatchEvent(key);
  assert.deepEqual(scrolls, [1000, 2000, 2000, 1000], 'next, dot 3, previous from the first wraps to the last, right arrow');
  // the current slide follows the scroll position
  Object.defineProperty(track, 'scrollLeft', { value: 2000, configurable: true });
  track.dispatchEvent(new window.Event('scroll'));
  assert.deepEqual(dots.map((d) => d.getAttribute('aria-current')), [null, null, 'true']);
});

test('German labels from the page\'s locale (Cargo\'s language metadata), author rows override them', () => {
  const lang = document.querySelector('meta[name="language"]');
  lang.setAttribute('content', 'de');
  const block = stageBlock('slider', `${CARGO}<div><div>Slider label</div><div>Highlights</div></div>`);
  decorate(block);
  lang.setAttribute('content', 'en');
  assert.equal(block.getAttribute('aria-label'), 'Highlights');
  assert.equal(block.querySelector('.hero-campaign-next').getAttribute('aria-label'), 'Nächste Folie');
  assert.equal(block.querySelector('.hero-campaign-slide').getAttribute('aria-label'), '1 von 3');
});

test('a slider further down: no eager image; one slide: the block as without the option', () => {
  const lower = stageBlock('slider', CARGO, 3);
  decorate(lower);
  assert.deepEqual([...lower.querySelectorAll('img')].map((i) => i.getAttribute('loading')), ['lazy', 'lazy', 'lazy']);
  const one = stageBlock('slider', `<div><div>${pic(1)}</div></div><div><div><h1>One</h1></div></div>`);
  decorate(one);
  assert.ok(one.querySelector('.hero-campaign-track') === null, 'no .hero-campaign-track');
  assert.equal(one.getAttribute('role'), 'region');
  assert.ok(one.getAttribute('aria-labelledby'));
  assert.ok(one.querySelector(':scope > .hero-campaign-media') && one.querySelector(':scope > .hero-campaign-inner'));
});

test('without the option two pictures are still one stage (the first picture the background)', () => {
  const block = stageBlock('', CARGO);
  decorate(block);
  assert.ok(block.querySelector('.hero-campaign-track') === null, 'no .hero-campaign-track');
  assert.equal(block.querySelectorAll(':scope > .hero-campaign-media').length, 1);
});
