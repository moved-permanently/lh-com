/* eslint-disable max-len, class-methods-use-this */
/* TAP's remaining differences (brief 336: www.flytap.com and tap.turnsthe.page at 390 and 1440
   px; tools/reports/tap/parity.md rows 25 on):
   - the stage's and the inner banners' step: www's 1.2 s slide with ease (hero-campaign-tap.js
     createSlide), the track's snapping off while it moves, at once under reduced motion; the
     previous / next / dots / rotation go through it; another brand's slider keeps the browser's
     smooth scroll;
   - the footer's social icons: www's outline glyphs (icons/tap-*.svg) on brand tap only;
   - the TAP-scoped rules in styles/themes/tap.css (breadcrumb, headings, cards, FAQ, tiles,
     the picture above the title, the tier cards, running-text links, the footer's gap).
   Boolean asserts only around linkedom nodes (a failing assert that prints a node can run out
   of memory). Run: node --max-old-space-size=512 --test test/tap-parity-336.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
const part = css.slice(css.indexOf("TAP's remaining differences (brief 336)"));

const { window, document } = parseHTML('<!DOCTYPE html><html><head><meta name="brand" content="tap"></head><body><main></main></body></html>');
window.location = {
  hostname: 'tap.turnsthe.page', pathname: '/en-pt', search: '', hash: '', href: 'https://tap.turnsthe.page/en-pt', origin: 'https://tap.turnsthe.page',
};
Object.defineProperty(window, 'origin', { value: 'https://tap.turnsthe.page', configurable: true });
window.matchMedia = () => ({ matches: false, addEventListener() {} });
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;
globalThis.ResizeObserver = class { observe() {} };
// frames queued, run by hand (the slide asks for one per step)
const frames = [];
globalThis.requestAnimationFrame = (fn) => { frames.push(fn); return frames.length; };
globalThis.cancelAnimationFrame = () => {};

const {
  createSlide, cubicBezier, EASE, SLIDE_MS,
} = await import('../blocks/hero-campaign/hero-campaign-tap.js');
const { default: decorate } = await import('../blocks/hero-campaign/hero-campaign.js');

/** a track without layout: scrollLeft and an inline style */
const fakeTrack = () => {
  const props = {};
  const listeners = {};
  return {
    scrollLeft: 0,
    style: {
      setProperty: (k, v) => { props[k] = v; },
      removeProperty: (k) => { delete props[k]; },
    },
    props,
    addEventListener: (type, fn) => { listeners[type] = fn; },
    fire: (type) => listeners[type] && listeners[type](),
  };
};

/** a clock moved by hand */
const fakeClock = () => {
  let t = 0;
  let queued = null;
  return {
    now: () => t,
    frame: (fn) => { queued = fn; return 1; },
    cancel: () => { queued = null; },
    tick(ms) {
      t += ms;
      const fn = queued;
      queued = null;
      if (fn) fn();
    },
    pending: () => queued !== null,
  };
};

test('row 25 (stage and banners): www\'s ease, 0 to 1 over the time', () => {
  assert.equal(SLIDE_MS, 1200);
  assert.equal(EASE(0), 0);
  assert.equal(EASE(1), 1);
  // CSS ease at half time: about 0.802
  assert.equal(Math.abs(EASE(0.5) - 0.8024) < 0.002, true);
  const linear = cubicBezier(0, 0, 1, 1);
  assert.equal(Math.abs(linear(0.3) - 0.3) < 0.002, true);
});

test('row 25: a step slides over 1.2 s, snapping off while it moves, back on at the end', () => {
  const track = fakeTrack();
  const clock = fakeClock();
  const slide = createSlide({ track, clock });
  slide.scroll(358);
  assert.equal(track.props['scroll-snap-type'], 'none');
  assert.equal(track.props['scroll-behavior'], 'auto');
  clock.tick(600);
  const half = track.scrollLeft;
  assert.equal(half > 250 && half < 358, true, 'past half the way at half time (ease)');
  assert.equal(slide.moving(), true);
  clock.tick(600);
  assert.equal(track.scrollLeft, 358);
  assert.equal(slide.moving(), false);
  assert.equal('scroll-snap-type' in track.props, false);
  assert.equal('scroll-behavior' in track.props, false);
});

test('row 25: reduced motion steps at once; a swipe stops a slide where it is', () => {
  const still = fakeTrack();
  createSlide({ track: still, clock: fakeClock(), reduced: true }).scroll(716);
  assert.equal(still.scrollLeft, 716);
  assert.equal('scroll-snap-type' in still.props, false);

  const track = fakeTrack();
  const clock = fakeClock();
  const slide = createSlide({ track, clock });
  slide.scroll(358);
  clock.tick(300);
  const at = track.scrollLeft;
  track.fire('touchstart');
  assert.equal(slide.moving(), false);
  assert.equal('scroll-snap-type' in track.props, false);
  clock.tick(300);
  assert.equal(track.scrollLeft, at);
});

const pic = (n) => `<picture><img src="https://tap.turnsthe.page/en-pt/media_${n}.jpg?width=750&format=jpg" alt="" width="1484" height="989"></picture>`;
const slideRows = (n) => `<div><div>${pic(n)}</div></div><div><div><h2>Slide ${n}</h2><p><a href="https://www.flytap.com/en-pt/x${n}">Book now</a></p></div></div>`;
const stage = (brand) => {
  document.querySelector('meta[name="brand"]').setAttribute('content', brand);
  const main = document.querySelector('main');
  main.replaceChildren();
  const s = document.createElement('div');
  s.className = 'section';
  main.append(s);
  const block = document.createElement('div');
  block.className = 'hero-campaign block slider narrow';
  block.innerHTML = [1, 2, 3].map(slideRows).join('');
  s.append(block);
  return block;
};

test('row 25: TAP\'s next button slides the track itself; another brand\'s asks for the browser\'s smooth scroll', async () => {
  const tap = stage('tap');
  await decorate(tap);
  const track = tap.querySelector('.hero-campaign-track');
  const asked = [];
  track.scrollTo = (o) => asked.push(o);
  frames.length = 0;
  tap.querySelector('.hero-campaign-next').dispatchEvent(new window.Event('click'));
  assert.equal(asked.length, 0, 'no smooth scrollTo on brand tap');
  assert.equal(frames.length > 0, true, 'a frame asked for: the slide is under way');
  assert.equal(track.style.getPropertyValue('scroll-snap-type'), 'none');

  const cargo = stage('cargo');
  await decorate(cargo);
  const ctrack = cargo.querySelector('.hero-campaign-track');
  const casked = [];
  ctrack.scrollTo = (o) => casked.push(o.behavior);
  cargo.querySelector('.hero-campaign-next').dispatchEvent(new window.Event('click'));
  assert.deepEqual(casked, ['smooth']);
});

test('row 34 (footer): www\'s five outline glyphs as TAP icons, #424045', async () => {
  const { TAP_SOCIAL_ICONS } = await import('../blocks/footer/footer-tap.js');
  assert.deepEqual(TAP_SOCIAL_ICONS, ['facebook', 'instagram', 'linkedin', 'youtube', 'tiktok']);
  TAP_SOCIAL_ICONS.forEach((name) => {
    const svg = fs.readFileSync(new URL(`../icons/tap-${name}.svg`, import.meta.url), 'utf8');
    assert.equal(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'), true, name);
    assert.equal(svg.includes('fill="#424045"'), true, name);
    assert.equal(svg.includes('currentColor'), false, name);
  });
  assert.match(part, /body\.brand-tap \.footer \.footer-tap-side \.footer-badges img\.footer-tap-icon \{\s*filter: none;/);
});

test('row 34: the TAP footer takes the outline icons for the social links, the store badges stay', async () => {
  const { default: layoutTapFooter } = await import('../blocks/footer/footer-tap.js');
  // the site's code at the host's root (aem.js set the module's folder under Node)
  window.hlx.codeBasePath = '';
  const block = document.createElement('div');
  block.innerHTML = '<div class="footer-inner"><div class="footer-columns"></div><div class="footer-badges">'
    + '<a href="https://www.facebook.com/TAPAirPortugal"><img data-icon-name="facebook" src="/icons/facebook.svg" alt="Facebook"></a>'
    + '<a href="https://www.tiktok.com/@tapairportugal"><img data-icon-name="tiktok" src="/icons/tiktok.svg" alt="TikTok"></a>'
    + '<a href="https://apps.apple.com/x"><img src="/content/app-store.png" alt="App Store"></a></div>'
    + '<div class="footer-note">© 2026, TAP.</div></div>';
  layoutTapFooter(block);
  const srcs = [...block.querySelectorAll('.footer-badges img')].map((i) => i.getAttribute('src'));
  assert.deepEqual(srcs, ['/icons/tap-facebook.svg', '/icons/tap-tiktok.svg', '/content/app-store.png']);
  assert.equal(block.querySelectorAll('img.footer-tap-icon').length, 2);
});

test('row 25: the banner\'s slides square inside the rounded frame (a straight seam while one slides in)', () => {
  assert.match(css, /body\.brand-tap \.hero-campaign-tap \.hero-campaign-slide\.narrow \{\s*border-radius: 0;/);
});

test('rows 26, 27 and 35: headings; text-card titles; the breadcrumb trail on phones too, the house, the page semibold', () => {
  assert.match(part, /body\.brand-tap main :is\(h1, h2, h3, h4, h5, h6\) \{\s*letter-spacing: -0\.02em;/);
  assert.match(part, /body\.brand-tap main:has\(> \.breadcrumb-container\) \.default-content-wrapper > h2 \{\s*font-size: 32px;/);
  assert.match(css, /\.default-content-wrapper > h1 \{\s*max-width: 726px;\s*margin: 48px auto 16px;\s*font-size: 40px;\s*line-height: 48px;/);
  assert.match(part, /body\.brand-tap \.breadcrumb li,\s*body\.brand-tap \.breadcrumb li:not\(\.breadcrumb-parent\) \{\s*display: flex;/);
  assert.match(part, /body\.brand-tap \.breadcrumb li:not\(:last-child\)::after \{/);
  assert.match(part, /body\.brand-tap \.breadcrumb li:first-child:not\(:only-child\) > a:any-link \{[^}]*text-indent: 100%;/);
  assert.match(part, /\.breadcrumb \.breadcrumb-current \{\s*color: #424045;\s*font-weight: 600;/);
  assert.match(part, /body\.brand-tap \.cards:is\(\.three-up, \.two-up\) \.cards-card-body > :is\(h2, h3, h4\):first-child \{\s*margin-bottom: 8px;\s*font-size: 24px;\s*font-weight: 500;/);
});

test('rows 28 to 33: FAQ questions, link tiles, the picture above the title, text cards, tier cards, text links', () => {
  assert.match(css, /body\.brand-tap \.accordion-columns\.faq \{\s*padding: 16px;\s*border-radius: 16px;\s*background-color: #fcfcfc;/);
  assert.match(part, /\.accordion-columns\.faq \.accordion-columns-title \{\s*padding: 12px 40px 12px 0;[^}]*font-family: var\(--body-font-family\);[^}]*font-weight: 600;/);
  assert.match(part, /body\.brand-tap \.cards-icon:not\(\.cards-icon-tap\) \.cards-icon-tile \{[^}]*min-height: 72px;[^}]*background-color: #f7f7f8;/);
  assert.match(part, /\.default-content-wrapper > p:has\(\+ h1\) > picture img \{\s*width: 100%;\s*height: 380px;\s*object-fit: cover;/);
  assert.match(part, /\.cards-teaser > ul > li:has\(> \.cards-teaser-body > p:not\(\.cards-teaser-cta\)\) \{\s*margin: 16px;[^}]*box-shadow: 0 8px 16px rgb\(0 0 0 \/ 10%\);/);
  assert.match(part, /\.cards-teaser-cta-link:any-link \{[^}]*border: 1px solid #65c922;[^}]*border-radius: 999px;/);
  assert.match(part, /li:has\(> \.cards-card-image\) \{\s*--tap-tier: #55aa1c;[^}]*border-top: 8px solid var\(--tap-tier\);/);
  ['#a4a6a8', '#ae975d', '#47454a'].forEach((c) => assert.equal(part.includes(`--tap-tier: ${c};`), true, c));
  assert.match(part, /flex: 0 0 247px;/);
  assert.match(part, /a:any-link:not\(\.button, :has\(img, picture\)\)::before \{\s*content: none;/);
});

test('every rule of the part under body.brand-tap (another brand\'s pages as before)', () => {
  const body = part.slice(part.indexOf('*/') + 2).replace(/\/\*[\s\S]*?\*\//g, '');
  const selectors = [...body.matchAll(/(^|[{}])\s*([^{}@]+)\{/g)].map((m) => m[2].trim()).filter((s) => !/^(from|to|\d+%)$/.test(s));
  assert.equal(selectors.length > 40, true);
  // a selector list split at its top-level commas (not those inside :is(), :has(), :not())
  const split = (list) => {
    const out = [''];
    let depth = 0;
    [...list].forEach((ch) => {
      if (ch === '(') depth += 1;
      if (ch === ')') depth -= 1;
      if (ch === ',' && depth === 0) out.push('');
      else out[out.length - 1] += ch;
    });
    return out.map((x) => x.trim()).filter(Boolean);
  };
  const outside = selectors.flatMap(split).filter((x) => !x.startsWith('body.brand-tap '));
  assert.deepEqual(outside, []);
});
