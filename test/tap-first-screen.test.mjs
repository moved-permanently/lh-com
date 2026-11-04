/* eslint-disable max-len, class-methods-use-this */
/* TAP's first screen (brief 311: www.flytap.com/pt-pt at 1440 and 390 px):
   - the homepage stage (hero-campaign slider) on brand tap: www's green wedge and line on every
     slide, previous / dots / next in one group, a pause button that stops and restarts the
     rotation (www's swiper autoplay; none under prefers-reduced-motion), labels in the page's
     language; every other brand's slider as before;
   - the header (blocks/header/header-tap.js): www's top-level menu (Check-in third, from the
     quick action, until the nav document has it), search and account as links to www, the
     homepage test for the bar floating inside the stage; TAP's header settings in brands.js.
   Run: node --max-old-space-size=512 --test test/tap-first-screen.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head><meta name="brand" content="tap"></head><body><main></main></body></html>');
window.location = {
  hostname: 'tap.turnsthe.page', pathname: '/pt-pt', search: '', hash: '', href: 'https://tap.turnsthe.page/pt-pt', origin: 'https://tap.turnsthe.page',
};
Object.defineProperty(window, 'origin', { value: 'https://tap.turnsthe.page', configurable: true });
let reduced = false;
window.matchMedia = (q) => ({ matches: /reduce/.test(q) ? reduced : false, addEventListener() {} });
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;
globalThis.ResizeObserver = class { observe() {} };
globalThis.requestAnimationFrame = (fn) => fn();
globalThis.cancelAnimationFrame = () => {};

const { default: decorate } = await import('../blocks/hero-campaign/hero-campaign.js');
const { createRotation, ROTATION_MS, TAP_STAGE_LABELS } = await import('../blocks/hero-campaign/hero-campaign-tap.js');
const {
  tapMenuItems, tapBarTools, isTapHome, tapRoot, TAP_HEADER_TEXTS,
} = await import('../blocks/header/header-tap.js');
const { BRANDS } = await import('../scripts/brands.js');

const pic = (n) => `<picture><img src="https://tap.turnsthe.page/pt-pt/media_${n}.jpg?width=750&format=jpg" alt="" width="1484" height="989"></picture>`;
const slide = (n, h) => `<div><div>${pic(n)}</div></div><div><div><h2>${h}</h2><p>3 voos diretos por semana.</p><p><a href="https://www.flytap.com/pt_pt/x${n}">Reserve já</a></p></div></div>`;
const stage = (brand = 'tap', count = 3) => {
  document.querySelector('meta[name="brand"]').setAttribute('content', brand);
  const main = document.querySelector('main');
  main.replaceChildren();
  const s = document.createElement('div');
  s.className = 'section';
  main.append(s);
  const block = document.createElement('div');
  block.className = 'hero-campaign block slider';
  block.innerHTML = [slide(1, 'Islândia'), slide(2, 'Chocolate quente'), slide(3, 'Ano Novo')].slice(0, count).join('');
  s.append(block);
  return block;
};

test('TAP stage: www\'s wedge and line on every slide, hidden from assistive tech', async () => {
  const block = stage();
  await decorate(block);
  assert.equal(block.classList.contains('hero-campaign-tap'), true);
  const slides = [...block.querySelectorAll('.hero-campaign-slide')];
  assert.equal(slides.length, 3);
  slides.forEach((s) => {
    const wedge = s.querySelector('.hero-campaign-stripe-wedge');
    const line = s.querySelector('.hero-campaign-stripe-line');
    assert.equal(Boolean(wedge && line), true);
    assert.equal(wedge.getAttribute('aria-hidden'), 'true');
    assert.equal(line.getAttribute('aria-hidden'), 'true');
    // a desktop and a phone shape each, as www draws them
    assert.equal(wedge.querySelectorAll('svg').length, 2);
    assert.equal(line.querySelectorAll('svg').length, 2);
    assert.equal(wedge.innerHTML.includes('#65C922'), true);
    assert.equal(line.innerHTML.includes('#9EFD38'), true);
  });
});

test('TAP stage: previous, dots and next in one group, then the pause button', async () => {
  const block = stage();
  await decorate(block);
  const group = block.querySelector('.hero-campaign-controls');
  assert.equal(Boolean(group), true);
  const parts = [...group.children].map((c) => c.className);
  assert.deepEqual(parts, ['hero-campaign-prev', 'hero-campaign-dots', 'hero-campaign-next']);
  const pause = block.querySelector('.hero-campaign-pause');
  assert.equal(Boolean(pause), true);
  assert.equal(pause.getAttribute('aria-pressed'), 'false');
  assert.equal(pause.getAttribute('aria-label'), TAP_STAGE_LABELS.pt.pause);
  assert.equal(pause.getAttribute('aria-controls'), block.querySelector('.hero-campaign-track').id);
});

test('the rotation: one step per interval; paused, nothing; restarted, it goes on', () => {
  const steps = [];
  const timers = [];
  const fake = {
    setInterval: (fn, ms) => { timers.push({ fn, ms }); return timers.length; },
    clearInterval: (id) => { timers[id - 1] = null; },
  };
  const r = createRotation({ advance: () => steps.push(1), delay: ROTATION_MS, timers: fake });
  r.start();
  assert.equal(timers.length, 1);
  assert.equal(timers[0].ms, ROTATION_MS);
  timers[0].fn();
  timers[0].fn();
  assert.equal(steps.length, 2);
  r.stop();
  assert.equal(timers[0], null);
  assert.equal(r.running(), false);
  r.start();
  assert.equal(r.running(), true);
  timers[1].fn();
  assert.equal(steps.length, 3);
  assert.equal(ROTATION_MS >= 4000, true);
});

test('the pause button stops and restarts, its label and state follow', async () => {
  const block = stage();
  await decorate(block);
  const pause = block.querySelector('.hero-campaign-pause');
  pause.dispatchEvent(new window.Event('click'));
  assert.equal(pause.getAttribute('aria-pressed'), 'true');
  assert.equal(pause.getAttribute('aria-label'), TAP_STAGE_LABELS.pt.play);
  assert.equal(block.classList.contains('hero-campaign-paused'), true);
  pause.dispatchEvent(new window.Event('click'));
  assert.equal(pause.getAttribute('aria-pressed'), 'false');
  assert.equal(block.classList.contains('hero-campaign-paused'), false);
});

test('reduced motion: no rotation, the button shows the stage as paused', async () => {
  reduced = true;
  const block = stage();
  await decorate(block);
  const pause = block.querySelector('.hero-campaign-pause');
  assert.equal(pause.getAttribute('aria-pressed'), 'true');
  assert.equal(block.classList.contains('hero-campaign-paused'), true);
  reduced = false;
});

test('the pause labels in TAP\'s languages', () => {
  ['pt', 'en', 'es', 'fr', 'de', 'it', 'pl'].forEach((l) => {
    assert.equal(typeof TAP_STAGE_LABELS[l].pause, 'string');
    assert.equal(typeof TAP_STAGE_LABELS[l].play, 'string');
  });
});

test('another brand\'s slider as before: no group, no pause, no stripes', async () => {
  const block = stage('cargo');
  await decorate(block);
  assert.equal(block.classList.contains('hero-campaign-tap'), false);
  assert.equal(block.querySelector('.hero-campaign-controls'), null);
  assert.equal(block.querySelector('.hero-campaign-pause'), null);
  assert.equal(block.querySelector('.hero-campaign-stripe-wedge'), null);
  assert.equal([...block.children].map((c) => c.className).join(' '), 'hero-campaign-track hero-campaign-prev hero-campaign-next hero-campaign-dots');
});

test('TAP stage with one slide (pl-pl): TAP\'s stage, its stripes, no controls and no rotation; another brand\'s as before', async () => {
  const block = stage('tap', 1);
  await decorate(block);
  assert.equal(block.classList.contains('hero-campaign-tap'), true);
  assert.equal(block.querySelectorAll('.hero-campaign-track > .hero-campaign-slide').length, 1);
  assert.equal(Boolean(block.querySelector('.hero-campaign-slide .hero-campaign-stripe-wedge')), true);
  assert.equal(block.querySelector('.hero-campaign-controls'), null);
  assert.equal(block.querySelector('.hero-campaign-pause'), null);
  assert.equal(block.querySelector('.hero-campaign-prev'), null);
  assert.equal([...block.children].map((c) => c.className).join(' '), 'hero-campaign-track');
  const cargo = stage('cargo', 1);
  await decorate(cargo);
  assert.equal(cargo.querySelector('.hero-campaign-track'), null, 'a one-slide stage of another brand: the plain stage');
  assert.equal(cargo.classList.contains('hero-campaign-tap'), false);
});

const link = (href, label) => {
  const a = document.createElement('a');
  a.setAttribute('href', href);
  a.textContent = label;
  return a;
};
const menu = () => ['Planear viagem', 'Os meus voos', 'TAP Miles&Go', 'Ajuda'].map((label) => ({ label, link: null, groups: [{ label: 'x', links: [link('/pt-pt/x', 'x')] }] }));
const quick = () => [link('https://www.flytap.com/pt-pt#special-anchor-my-travels', 'Gerir reserva'), link('https://www.flytap.com/pt-pt#special-anchor-check-in', 'Check-in')];

test('header: www\'s top-level menu, Check-in third (the quick action) while the nav document lacks it', () => {
  const items = tapMenuItems(menu(), quick());
  assert.deepEqual(items.map((i) => i.label), ['Planear viagem', 'Os meus voos', 'Check-in', 'TAP Miles&Go', 'Ajuda']);
  const checkin = items[2];
  assert.equal(checkin.groups.length, 0);
  assert.equal(checkin.link.getAttribute('href'), 'https://www.flytap.com/pt-pt#special-anchor-check-in');
});

test('header: a nav document with Check-in in its menu stays as it is', () => {
  const m = menu();
  m.splice(2, 0, { label: 'Check-in', link: null, groups: [{ label: '', links: [link('/pt-pt/informacoes-check-in', 'Informações de Check-in')] }] });
  const items = tapMenuItems(m, quick());
  assert.deepEqual(items.map((i) => i.label), ['Planear viagem', 'Os meus voos', 'Check-in', 'TAP Miles&Go', 'Ajuda']);
  assert.equal(items[2].groups.length, 1);
  assert.equal(tapMenuItems(menu(), []).length, 4);
});

test('header: search and account as links to www\'s same root, labelled in its language', () => {
  const tools = tapBarTools({ base: '/fr-fr', lang: 'fr' });
  assert.deepEqual(tools.map((t) => t.role), ['search', 'account']);
  assert.equal(tools[0].href, 'https://www.flytap.com/fr-fr');
  assert.equal(tools[1].href, 'https://www.flytap.com/fr-fr');
  assert.equal(tools[0].label, 'Rechercher');
  assert.equal(tools[1].label, 'Se connecter');
  assert.equal(tools[0].icon, 'search');
  assert.equal(tools[1].icon, 'login');
  assert.equal(tapBarTools({ base: '/pt-pt', lang: 'pt' })[0].label, 'Pesquisar');
  // a language without its own texts: English
  assert.equal(tapBarTools({ base: '/xx-yy', lang: 'xx' })[0].label, TAP_HEADER_TEXTS.en.search);
});

test('header: the homepage is the root itself', () => {
  assert.equal(isTapHome('/pt-pt', '/pt-pt'), true);
  assert.equal(isTapHome('/pt-pt/', '/pt-pt'), true);
  assert.equal(isTapHome('/pt-pt/ajuda', '/pt-pt'), false);
  assert.equal(isTapHome('/', ''), false);
  // a root the locale table doesn't know yet (pt-br reads as pt-pt): its own first segment
  assert.equal(isTapHome('/pt-br', '/pt-pt'), true);
  assert.equal(isTapHome('/pt-br/ajuda', '/pt-pt'), false);
  assert.equal(isTapHome('/drafts/home', '/pt-pt'), false);
});

test('header: the page\'s root, its first segment when it is a root (xx-yy), else the locale\'s', () => {
  assert.equal(tapRoot('/pt-br/reservas/tarifas-tap', '/pt-pt'), '/pt-br');
  assert.equal(tapRoot('/fr-fr', '/fr-fr'), '/fr-fr');
  assert.equal(tapRoot('/drafts/home', '/pt-pt'), '/pt-pt');
  assert.equal(tapRoot('/', '/pt-pt'), '/pt-pt');
});

test('brands.js: TAP\'s header is the bar menu with the language list, TAP\'s layout', () => {
  const h = BRANDS.tap.header;
  assert.equal(h.menu, 'bar');
  assert.equal(h.languages, 'bar');
  assert.equal(h.layout, 'tap');
  assert.equal(h.search === undefined, true, 'search and account come from header-tap.js, not the login tool');
});
