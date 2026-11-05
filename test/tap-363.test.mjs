/* eslint-disable max-len, import/extensions */
/* TAP, brief 363 (tools/reports/tap/parity.md rows 80, 81 and the accessibility rows):
   - row 80, the stage's previous and next as www's: Material's thin chevron (weight 300) in TAP's
     dark green, on a white disc from 1025 px; at the first slide previous, at the last next shown
     unavailable (www: a grey disc at 20 %), aria-disabled and inert while it stays focusable
     (blocks/hero-campaign/hero-campaign-tap.js, styles/themes/tap.css);
   - row 81, the single inner banner's picture as www's: a flat 20 % veil, no gradient.
   Boolean asserts around linkedom nodes. Run: node --max-old-space-size=512 --test test/tap-363.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html lang="en"><head></head><body><main></main></body></html>');
window.matchMedia = () => ({ matches: true });
globalThis.window = window;
globalThis.document = document;

const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');
const { default: decorateTapSlider } = await import('../blocks/hero-campaign/hero-campaign-tap.js');

test('row 80: previous unavailable at the first slide, next at the last; a click on it does nothing', () => {
  const block = document.createElement('div');
  const track = document.createElement('div');
  track.id = 'track-1';
  const slides = [0, 1, 2].map(() => { const s = document.createElement('div'); track.append(s); return s; });
  block.append(track);
  document.querySelector('main').append(block);
  let index = 0;
  const moves = [];
  const goTo = (i) => { moves.push(i); };
  const button = (dir) => {
    const b = document.createElement('button');
    b.className = `hero-campaign-${dir}`;
    b.setAttribute('aria-label', dir);
    // hero-campaign.js's step wraps around
    b.addEventListener('click', () => goTo((index + (dir === 'next' ? 1 : -1) + 3) % 3));
    return b;
  };
  const dots = document.createElement('ol');
  decorateTapSlider(block, {
    slides, track, prev: button('prev'), next: button('next'), dots, goTo, current: () => index, motion: null, lang: 'en',
  });
  const prev = block.querySelector('.hero-campaign-controls .hero-campaign-prev');
  const next = block.querySelector('.hero-campaign-controls .hero-campaign-next');
  assert.equal(prev.getAttribute('aria-label'), 'prev', 'the same button, its name kept');
  assert.equal(prev.getAttribute('aria-disabled'), 'true');
  assert.equal(next.getAttribute('aria-disabled'), 'false');
  prev.dispatchEvent(new window.Event('click', { bubbles: true }));
  assert.deepEqual(moves, [], 'previous at the first slide: no step back to the last');
  next.dispatchEvent(new window.Event('click', { bubbles: true }));
  assert.deepEqual(moves, [1]);
  index = 2;
  track.dispatchEvent(new window.Event('scroll'));
  assert.equal(prev.getAttribute('aria-disabled'), 'false');
  assert.equal(next.getAttribute('aria-disabled'), 'true');
  assert.equal(next.hasAttribute('disabled'), false, 'still focusable');
  next.dispatchEvent(new window.Event('click', { bubbles: true }));
  assert.deepEqual(moves, [1]);
  block.remove();
});

test('row 80: the arrows\' look', () => {
  assert.match(css, /body\.brand-tap \.hero-campaign-tap :is\(\.hero-campaign-prev, \.hero-campaign-next\)::before \{\s*mask-image: url\("data:image\/svg\+xml,[^"]*M9\.7 18 8\.65 16\.95 13\.6 12 8\.65 7\.05 9\.7 6l6 6z[^"]*"\);/);
  assert.match(css, /body\.brand-tap \.hero-campaign-tap :is\(\.hero-campaign-prev, \.hero-campaign-next\)\[aria-disabled="true"\] \{\s*background-color: #c6c5c9;\s*opacity: 0\.2;\s*cursor: default;/);
  assert.match(css, /@media \(width >= 1024px\) \{[^@]*body\.brand-tap \.hero-campaign-tap \.hero-campaign-prev,\s*body\.brand-tap \.hero-campaign-tap \.hero-campaign-next \{\s*background: #fff;\s*color: var\(--lh-green\);/);
});

test('row 81: the single banner\'s picture under www\'s flat 20 % veil', () => {
  assert.match(css, /body\.brand-tap \.hero-campaign\.narrow:not\(\.slider, \.hero-campaign-slide\) \.hero-campaign-media::after \{\s*background: rgb\(0 0 0 \/ 20%\);\s*mix-blend-mode: normal;/);
});

/* ------------------------------------------------------------------ accessibility (brief 363) -- */

test('a11y: the stage\'s and the card carousel\'s dots 24 px targets, the dot drawn inside (WCAG 2.5.8)', () => {
  assert.match(css, /body\.brand-tap \.hero-campaign-tap \.hero-campaign-dot \{\s*display: flex;\s*align-items: center;\s*justify-content: center;\s*width: 24px;\s*height: 24px;\s*border: 0;\s*background: none;/);
  assert.match(css, /body\.brand-tap \.hero-campaign-tap \.hero-campaign-dot::before \{\s*content: "";\s*box-sizing: border-box;\s*width: 8px;\s*height: 8px;/);
  assert.match(css, /body\.brand-tap \.hero-campaign-tap \.hero-campaign-dot\[aria-current="true"\]::before \{\s*width: 24px;/);
  assert.match(css, /body\.brand-tap \.hero-campaign-tap \.hero-campaign-dot\[aria-current="true"\] \{\s*background: none;/);
  assert.match(css, /body\.brand-tap \.carousel-cards-tap \.carousel-cards-dot \{\s*display: flex;\s*align-items: center;\s*justify-content: center;\s*width: 24px;\s*height: 24px;\s*border: 0;\s*background: none;/);
  assert.match(css, /body\.brand-tap \.carousel-cards-tap \.carousel-cards-dot::before \{\s*content: "";/);
});

test('a11y: the booking box\'s fields show their focus in TAP\'s dark green, 2 px', () => {
  const box = fs.readFileSync(new URL('../blocks/booking-box/booking-box.css', import.meta.url), 'utf8');
  assert.match(box, /body\.brand-tap \.booking-box :is\(\.airport-combobox input, \.booking-box-field-button\):focus,\s*body\.brand-tap \.booking-box \.booking-box-field-button\[aria-expanded='true'\] \{\s*border-bottom-color: #397213;\s*box-shadow: inset 0 -1px 0 #397213;/);
});

test('a11y: the TAP header\'s skip link, the phone menu by keyboard (into it, Escape out), the tab inert under it', async () => {
  const { window: w, document: d } = parseHTML('<!DOCTYPE html><html lang="pt"><head></head><body><div class="alerts-bar"></div><header><div class="nav-wrapper"><nav><div class="nav-bar"></div></nav></div></header><main></main></body></html>');
  w.hlx = { codeBasePath: '' };
  w.location = { pathname: '/pt-pt/ajuda' };
  globalThis.window = w;
  globalThis.document = d;
  const tap = await import('../blocks/header/header-tap.js');
  const section = d.createElement('div');
  section.innerHTML = '<ul><li><p>Ajuda</p><ul><li><p><a href="/pt-pt/ajuda">Central de ajuda</a></p><ul><li><a href="/pt-pt/ajuda/reembolsos">Reembolsos</a></li></ul></li></ul></li></ul>';
  const menuButton = d.createElement('button');
  menuButton.className = 'nav-menu-button';
  const bar = d.querySelector('.nav-bar');
  const link = (href, label, className) => { const a = d.createElement('a'); a.href = href; a.className = className; a.textContent = label; return a; };
  const { root } = tap.buildTapMenu(section, { link, menuButton });
  bar.append(root, menuButton);
  await new Promise((r) => { setTimeout(r, 0); });
  const skip = d.body.firstElementChild;
  assert.equal(skip.tagName, 'A');
  assert.equal(skip.classList.contains('tap-skip'), true);
  assert.equal(skip.getAttribute('href'), `#${d.querySelector('main').id}`);
  assert.equal(skip.textContent, tap.TAP_HEADER_TEXTS.pt.skip);
  assert.equal(d.querySelector('main').getAttribute('tabindex'), '-1');
  let focused = null;
  w.HTMLElement.prototype.focus = function focus() { focused = this; };
  menuButton.dispatchEvent(new w.Event('click'));
  assert.equal(root.classList.contains('is-open'), true);
  assert.equal(focused === root.querySelector('.nav-bar-menu-button'), true, 'focus into the card');
  const quick = d.querySelector('.tap-quick');
  assert.equal(Boolean(quick) && quick.hasAttribute('inert'), true, 'the tab under the card out of reach');
  const esc = new w.Event('keydown', { bubbles: true, cancelable: true });
  esc.key = 'Escape';
  root.querySelector('.nav-bar-menu-button').dispatchEvent(esc);
  assert.equal(root.classList.contains('is-open'), false, 'Escape closes the card');
  assert.equal(focused === menuButton, true, 'and gives the focus back to the menu button');
  assert.equal(quick.hasAttribute('inert'), false);
});

test('a11y: the skip link hidden until it has the focus; main without a ring when it takes it', () => {
  assert.match(css, /body\.brand-tap main\[tabindex="-1"\]:focus \{\s*outline: none;/);
  const headerCss = fs.readFileSync(new URL('../blocks/header/header-tap.css', import.meta.url), 'utf8');
  assert.match(headerCss, /body\.brand-tap \.tap-skip \{[^}]*position: fixed;[^}]*transform: translateY\(-200%\);/);
  assert.match(headerCss, /body\.brand-tap \.tap-skip:focus \{\s*transform: none;/);
});

test('a11y: the calendar closes when the focus leaves it, and leaves the focus where it went', async () => {
  const rows = [['Format', 'tap'], ['Default origin', 'LIS'], ['Airports', '/pt-pt/booking/airports.json'], ['Tabs', 'Reservar voo, Fazer Check-in, Gerir reserva, Estado do voo']];
  const table = rows.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('');
  const { window: w, document: d } = parseHTML(`<!DOCTYPE html><html lang="pt"><head><meta name="brand" content="tap"></head><body><main><div class="section"><div class="booking-box">${table}</div></div></main></body></html>`);
  const origin = 'https://tap.turnsthe.page';
  w.location = {
    hostname: 'tap.turnsthe.page', pathname: '/pt-pt', search: '', hash: '', href: `${origin}/pt-pt`, origin,
  };
  Object.defineProperty(w, 'origin', { value: origin, configurable: true });
  w.hlx = { codeBasePath: '' };
  w.fetch = async () => ({ ok: true, json: async () => ({ data: [] }) });
  w.matchMedia = () => ({ matches: true, addEventListener() {} });
  w.scrollTo = () => {};
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.HTMLInputElement.prototype.select = () => {};
  globalThis.window = w;
  globalThis.document = d;
  globalThis.fetch = w.fetch;
  globalThis.CustomEvent = w.CustomEvent;
  let focused = null;
  w.HTMLElement.prototype.focus = function focus() { focused = this; };
  const run = 363;
  const mod = await import(`../blocks/booking-box/booking-box.js?case=${run}`);
  const block = d.querySelector('.booking-box');
  await mod.default(block, { today: '2026-11-05' });
  block.querySelector('.booking-box-dates button').dispatchEvent(new w.Event('click', { bubbles: true }));
  const cal = block.querySelector('.booking-box-calendar');
  assert.equal(cal.hidden, false);
  const search = block.querySelector('.booking-box-search');
  const out = new w.Event('focusout', { bubbles: true });
  Object.defineProperty(out, 'relatedTarget', { value: search });
  cal.querySelector('.booking-box-clear').dispatchEvent(out);
  assert.equal(cal.hidden, true, 'closed');
  assert.equal(focused === block.querySelector('.booking-box-dates button'), false, 'the focus not pulled back to the dates');
  // a move inside the calendar keeps it open
  block.querySelector('.booking-box-dates button').dispatchEvent(new w.Event('click', { bubbles: true }));
  const inside = new w.Event('focusout', { bubbles: true });
  Object.defineProperty(inside, 'relatedTarget', { value: cal.querySelector('.booking-box-continue') });
  cal.querySelector('.booking-box-clear').dispatchEvent(inside);
  assert.equal(cal.hidden, false);
});
