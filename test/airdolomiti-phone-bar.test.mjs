/* eslint-disable max-len */
/* Air Dolomiti's phone bar and menu (parity rows 28 and 29), as www's (airdolomiti-parity-001,
   *-390: Navbar_navbar_flex, NavBurger_*), below 1025px (our phone header's range):
   - row 28: the bar's plane button ("Cerca un volo", "Search a flight", "Suche einen Flug", www's
     alt) between the logo and the menu: it opens the page's booking panel (the flight search's
     Open label card, row 13) with the focus back on it when the panel closes; a page with the
     search in it (the booking pages) gets the focus on its first field; a page without one goes
     to the booking page (/prenotazioni, /en/booking, /de/buchung). The accessibility settings
     leave the bar (from 1025px they stay, as www's desktop bar), and the phone menu has www's
     "Dimensione / Dimensions / Dimension" row under the language: it opens the three text sizes
     (scripts/accessibility.js: the same choice, kept and applied as the bar's).
   - row 29: the menu button's icon www's three lines (31px), on Air Dolomiti only (header.js's
     shared burger unchanged).
   Run: node --max-old-space-size=512 --test test/airdolomiti-phone-bar.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html lang="it"><head></head><body></body></html>');
globalThis.window = window;
globalThis.document = document;
globalThis.Event = window.Event;
globalThis.CustomEvent = window.CustomEvent;
let focused = null;
window.HTMLElement.prototype.focus = function focus() { focused = this; };
window.HTMLElement.prototype.scrollIntoView = function scrollIntoView() {};
let assigned = null;
window.location = { href: 'https://main--lh-airdolomiti--moved-permanently.aem.page/', pathname: '/', assign: (u) => { assigned = u; } };
const store = new Map();
const storage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)) };
Object.defineProperty(window, 'localStorage', { value: storage, configurable: true });
Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true });
window.hlx = { codeBasePath: '' };
const click = (target) => target.dispatchEvent(new window.Event('click', { bubbles: true }));
const key = (target, k) => {
  const e = new window.Event('keydown', { bubbles: true, cancelable: true });
  e.key = k;
  target.dispatchEvent(e);
};

const { arrangeTools, buildAirDolomitiPhoneMenu } = await import('../blocks/header/header-airdolomiti.js');
const { default: decorateAirDolomiti } = await import('../blocks/flight-search/flight-search-airdolomiti.js');

const bar = (lang = 'it') => {
  document.documentElement.lang = lang;
  const tools = document.createElement('div');
  tools.className = 'nav-tools';
  tools.innerHTML = '<div class="nav-accessibility-wrapper"><button class="nav-tool nav-tool-a11y-settings"></button></div><button class="nav-menu-button" type="button" aria-label="Menu"><svg class="lh-icon shared-burger"></svg><span class="nav-tool-label" aria-hidden="true">Menu</span></button>';
  document.body.replaceChildren(tools);
  arrangeTools(tools);
  return tools;
};

beforeEach(() => {
  assigned = null;
  focused = null;
  store.clear();
  document.documentElement.removeAttribute('data-a11y-size');
});

test('row 28: the plane button between the tools and the menu button, www\'s label per language', () => {
  [['it', 'Cerca un volo'], ['en', 'Search a flight'], ['de', 'Suche einen Flug']].forEach(([lang, label]) => {
    const tools = bar(lang);
    const plane = tools.querySelector('button.nav-ad-book');
    assert.ok(plane, lang);
    assert.equal(plane.type, 'button');
    assert.equal(plane.getAttribute('aria-label'), label);
    assert.ok(plane.nextElementSibling === tools.querySelector('.nav-menu-button'), "plane.nextElementSibling === tools.querySelector('.nav-menu-button')");
    assert.ok(plane.querySelector('svg[aria-hidden="true"]'), 'its icon hidden from screen readers');
  });
});

test('row 28: the plane opens the booking panel (row 13) and the focus comes back to it', () => {
  const tools = bar('it');
  const block = document.createElement('div');
  block.className = 'flight-search airdolomiti block';
  block.innerHTML = '<form class="flight-search-form"><div class="flight-search-fields"><div class="airport-combobox"><input name="origin"></div><button type="submit" class="flight-search-submit">Cerca</button></div></form>';
  document.body.append(block);
  decorateAirDolomiti(block, { form: block.querySelector('form'), openLabel: 'Prenota il tuo volo', lang: 'it' });
  const plane = tools.querySelector('.nav-ad-book');
  click(plane);
  assert.ok(block.classList.contains('flight-search-overlay-open'), 'the panel open');
  assert.ok(focused === block.querySelector('.flight-search-close-panel'), "focused === block.querySelector('.flight-search-close-panel')");
  key(block.querySelector('form'), 'Escape');
  assert.ok(!block.classList.contains('flight-search-overlay-open'));
  assert.ok(focused === plane, 'the focus back on the plane');
  assert.equal(assigned, null);
  // the card itself still opens it with the focus back on the card
  click(block.querySelector('.flight-search-open'));
  key(block.querySelector('form'), 'Escape');
  assert.ok(focused === block.querySelector('.flight-search-open'), "focused === block.querySelector('.flight-search-open')");
});

test('row 28: the search in the page (no panel): its first field; no search: the booking page', () => {
  const tools = bar('en');
  const block = document.createElement('div');
  block.className = 'flight-search airdolomiti block';
  block.innerHTML = '<form class="flight-search-form"><div class="flight-search-options"><input type="radio" name="trip"></div><div class="flight-search-fields"><div class="airport-combobox"><input name="origin"></div><button type="submit" class="flight-search-submit">Search</button></div></form>';
  // (in the page's main, where the plane looks for a search)
  const main = document.createElement('main');
  main.append(block);
  document.body.append(main);
  decorateAirDolomiti(block, { form: block.querySelector('form'), lang: 'en' });
  click(tools.querySelector('.nav-ad-book'));
  assert.ok(focused === block.querySelector('input[name="origin"]'), 'focused === block.querySelector(\'input[name="origin"]\')');
  block.remove();
  [['it', '/prenotazioni'], ['en', '/en/booking'], ['de', '/de/buchung']].forEach(([lang, path]) => {
    const t = bar(lang);
    click(t.querySelector('.nav-ad-book'));
    assert.equal(assigned, path, lang);
  });
});

test('row 29: the menu button\'s icon is www\'s three lines (31px); its name and label as before', () => {
  const tools = bar('it');
  const menu = tools.querySelector('.nav-menu-button');
  assert.ok(!menu.querySelector('.shared-burger'), 'the shared burger replaced');
  const svg = menu.querySelector('svg.nav-ad-icon-menu');
  assert.ok(svg);
  assert.equal(svg.getAttribute('aria-hidden'), 'true');
  assert.equal(svg.querySelectorAll('path, line').length, 3);
  assert.equal(svg.getAttribute('width'), '31');
  assert.equal(menu.getAttribute('aria-label'), 'Menu');
});

const section = () => {
  const s = document.createElement('div');
  s.innerHTML = '<div class="default-content-wrapper"><ul><li><p>Esplora</p><ul><li><p>Destinazioni</p><ul><li><a href="/destinazioni">Destinazioni</a></li></ul></li></ul></li></ul></div>';
  return s;
};

test('row 28: the phone menu\'s Dimensione row under the language opens the three sizes; a size applies and is kept as the bar\'s', () => {
  const menuButton = document.createElement('button');
  const { root } = buildAirDolomitiPhoneMenu(section(), {
    link: (href, label) => { const a = document.createElement('a'); a.href = href; a.textContent = label; return a; },
    menuButton,
    lang: 'it',
    labels: { close: 'Chiudi', menu: 'Menu' },
    languages: { current: 'it', links: [{ label: 'English', lang: 'en', home: '/en/' }] },
  });
  document.body.replaceChildren(menuButton, root);
  const size = root.querySelector('button.nav-ad-phone-size');
  assert.ok(size);
  assert.equal(size.textContent.trim(), 'Dimensione');
  assert.ok(size.closest('.nav-ad-phone-sizes-row').previousElementSibling === root.querySelector('.nav-ad-phone-language'), 'under the language');
  const group = root.querySelector(`#${size.getAttribute('aria-controls')}`);
  assert.equal(group.hidden, true);
  assert.equal(size.getAttribute('aria-expanded'), 'false');
  click(size);
  assert.equal(group.hidden, false);
  assert.equal(size.getAttribute('aria-expanded'), 'true');
  assert.equal(group.getAttribute('role'), 'radiogroup');
  const radios = [...group.querySelectorAll('input[type="radio"]')];
  assert.deepEqual(radios.map((r) => group.querySelector(`label[for="${r.id}"]`).textContent), ['Normale', 'Grande', 'Molto Grande']);
  assert.ok(radios[0].checked, 'the current size');
  radios[2].checked = true;
  radios[2].dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(document.documentElement.getAttribute('data-a11y-size'), 'large');
  assert.equal(JSON.parse(store.get('lh-accessibility')).size, 'large');
});

test('the theme and the header CSS: below 1025px no accessibility button in the bar, the plane and the lines 30px wide 15px apart; from 1025px no plane', () => {
  const css = fs.readFileSync('blocks/header/header-airdolomiti.css', 'utf8');
  assert.ok(/@media \(width < 1025px\) \{[^@]*\.header \.nav-airdolomiti \.nav-tools > \.nav-accessibility-wrapper \{\s*display: none;/.test(css), 'no accessibility button in the bar below 1025px');
  assert.ok(/\.header \.nav-airdolomiti \.nav-ad-book \{[^}]*width: 30px;[^}]*margin-right: 15px;/.test(css), 'the plane 30px wide, 15px before the menu');
  assert.ok(/\.header \.nav-airdolomiti \.nav-menu-button:has\(\.nav-ad-icon-menu\) \{[^}]*width: 31px;/.test(css), 'the lines 31px wide');
  assert.ok(/@media \(width >= 1025px\) \{[^@]*\.header \.nav-airdolomiti \.nav-ad-book \{\s*display: none;/.test(css), 'no plane from 1025px');
});
