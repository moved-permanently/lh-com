/* eslint-disable max-len */
/* Air Dolomiti's phone menu (blocks/header/header-airdolomiti.js, below 1025 px), brief 447: as
   www's (airdolomiti-parity-001, states/*-home-phonemenu*-390, its NavBurger_* rules): the Menu
   button opens a white page over the screen with, in order, "Close" and its circled cross; the
   search field (to the bar's search page, the term in its query parameter); the quick actions on
   teal; the menu's three items as buttons (bold 23.76 px, an arrow after them), each opening its
   columns under it (grey titles in capitals, the links, the bold links; no card, www shows none
   on phones), one at a time; under a line, the languages behind the current one ("EN", a globe).
   Escape or Close closes it, the focus back on the Menu button; Tab stays inside while it is open.
   The destinations' "View all" (the column's last link, to its title's page) underlined, also in
   the desktop panel, as www's.
   Run: node --max-old-space-size=512 --test test/header-airdolomiti-phone-447.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
globalThis.window = window;
globalThis.document = document;
let focused = null;
window.HTMLElement.prototype.focus = function focus() { focused = this; };
const key = (target, k, shiftKey = false) => {
  const e = new window.Event('keydown', { bubbles: true, cancelable: true });
  e.key = k;
  e.shiftKey = shiftKey;
  target.dispatchEvent(e);
  return e;
};
const click = (target) => target.dispatchEvent(new window.Event('click', { bubbles: true }));

const { buildAirDolomitiMenu, buildAirDolomitiPhoneMenu, readAirDolomitiMenu } = await import('../blocks/header/header-airdolomiti.js');

const section = () => {
  const s = document.createElement('div');
  s.className = 'section';
  s.innerHTML = `<div class="default-content-wrapper"><ul>
    <li><p>Explore</p><ul>
      <li><p><a href="/en/destinations">Destinations</a></p><ul><li><a href="/en/destinations/bari">Bari</a></li><li><a href="/en/destinations">View all</a></li></ul></li>
      <li><p>Services</p><ul><li><a href="/en/services/lounges">Lounges</a></li></ul></li>
      <li><p></p><ul><li><a href="/en/fleet">Fleet</a></li><li><a href="/en/articles">Blog</a></li></ul></li>
      <li><p>Quick Actions</p><ul><li><a href="/en/booking"><picture><img src="/media_1.png" alt=""></picture> Book</a></li></ul></li>
      <li><p>Air Dolomiti Blog</p><p><picture><img src="/media_3.jpg" alt=""></picture></p><ul><li><a href="/en/articles">Read more</a></li></ul></li>
    </ul></li>
    <li><p>Book and manage</p><ul>
      <li><p>Flights</p><ul><li><a href="/en/booking">Book a flight</a></li></ul></li>
    </ul></li>
  </ul></div>`;
  return s;
};
const link = (href, label, className) => {
  const x = document.createElement('a');
  x.href = href;
  x.className = className;
  x.textContent = label;
  return x;
};
const build = () => {
  const menuButton = document.createElement('button');
  menuButton.setAttribute('aria-expanded', 'false');
  const menu = buildAirDolomitiPhoneMenu(section(), {
    link,
    menuButton,
    lang: 'en',
    labels: { close: 'Close', menu: 'Menu', search: 'Search' },
    search: 'https://www.airdolomiti.eu/en/search',
    languages: { current: 'en', links: [{ label: 'Italiano', lang: 'it', home: '/' }, { label: 'Deutsch', lang: 'de', home: '/de/' }] },
  });
  document.body.replaceChildren(menuButton, menu.root);
  return { menu, menuButton };
};

test('"View all" (the column\'s last link, to its title\'s page) is the column\'s more link, underlined in the desktop panel', () => {
  const { tabs } = readAirDolomitiMenu(section());
  assert.deepEqual(tabs[0].columns[0][0].links.map((l) => l.more), [false, true]);
  const bar = buildAirDolomitiMenu(section(), { link });
  assert.deepEqual([...bar.root.querySelectorAll('a.nav-ad-link-more')].map((a) => a.textContent), ['View all']);
  const css = fs.readFileSync('blocks/header/header-airdolomiti.css', 'utf8');
  assert.match(css, /\.header \.nav-airdolomiti \.nav-ad-link-more:any-link \{[^}]*text-decoration: underline;/);
});

test('the phone menu: Close, the search field, the quick actions, the items with their columns (no card), the languages', () => {
  const { menu, menuButton } = build();
  const { root } = menu;
  assert.ok(root.classList.contains('nav-ad-phone'));
  assert.equal(root.hidden, true);
  assert.equal(root.getAttribute('role'), 'dialog');
  assert.equal(root.getAttribute('aria-modal'), 'true');
  assert.equal(root.getAttribute('aria-label'), 'Menu');
  assert.equal(menuButton.getAttribute('aria-controls'), root.id);
  const close = root.querySelector('button.nav-ad-phone-close');
  assert.equal(close.textContent.trim(), 'Close');
  const form = root.querySelector('form.nav-ad-phone-search');
  assert.equal(form.getAttribute('role'), 'search');
  assert.equal(form.getAttribute('action'), 'https://www.airdolomiti.eu/en/search');
  const input = form.querySelector('input[type="search"]');
  assert.equal(input.getAttribute('name'), 'query');
  assert.equal(input.getAttribute('placeholder'), 'Enter search term...');
  assert.equal(form.querySelector(`label[for="${input.id}"]`).textContent, 'Enter search term...');
  assert.equal(form.querySelector('button[type="submit"]').getAttribute('aria-label'), 'Search');
  assert.deepEqual([...root.querySelectorAll('.nav-ad-quick a.nav-ad-quick-link')].map((a) => a.textContent.trim()), ['Book']);
  const items = [...root.querySelectorAll('button.nav-ad-phone-item')];
  assert.deepEqual(items.map((b) => b.textContent.trim()), ['Explore', 'Book and manage']);
  const sub = (b) => root.querySelector(`#${b.getAttribute('aria-controls')}`);
  items.forEach((b) => {
    assert.equal(b.getAttribute('aria-expanded'), 'false');
    assert.equal(sub(b).hidden, true);
  });
  const explore = sub(items[0]);
  assert.deepEqual([...explore.querySelectorAll('.nav-ad-group-title')].map((p) => p.textContent), ['Destinations', 'Services']);
  assert.deepEqual([...explore.querySelectorAll('a.nav-ad-link-bold')].map((a) => a.textContent), ['Fleet', 'Blog']);
  assert.deepEqual([...explore.querySelectorAll('a.nav-ad-link-more')].map((a) => a.textContent), ['View all']);
  assert.equal(explore.querySelector('.nav-ad-card, .nav-ad-quick'), null, 'no card and no second quick actions');
  const lang = root.querySelector('button.nav-ad-phone-lang');
  assert.equal(lang.textContent.trim(), 'EN');
  assert.equal(lang.getAttribute('aria-expanded'), 'false');
  const langs = root.querySelector(`#${lang.getAttribute('aria-controls')}`);
  assert.equal(langs.hidden, true);
  assert.deepEqual([...langs.querySelectorAll('a')].map((a) => [a.textContent, a.getAttribute('href'), a.getAttribute('lang')]), [['Italiano', '/', 'it'], ['Deutsch', '/de/', 'de']]);
  click(lang);
  assert.equal(langs.hidden, false);
  assert.equal(lang.getAttribute('aria-expanded'), 'true');
});

test('the Menu button opens it, an item opens its columns (one at a time), Escape or Close closes it with the focus back', () => {
  const { menu, menuButton } = build();
  const { root } = menu;
  click(menuButton);
  assert.equal(root.hidden, false);
  assert.equal(menuButton.getAttribute('aria-expanded'), 'true');
  assert.equal(document.body.style.overflow, 'hidden');
  assert.ok(focused === root.querySelector('.nav-ad-phone-close'), 'the focus on Close');
  const [explore, book] = [...root.querySelectorAll('button.nav-ad-phone-item')];
  const sub = (b) => root.querySelector(`#${b.getAttribute('aria-controls')}`);
  click(explore);
  assert.equal(sub(explore).hidden, false);
  assert.equal(explore.getAttribute('aria-expanded'), 'true');
  click(book);
  assert.equal(sub(explore).hidden, true, 'the other one closes');
  assert.equal(sub(book).hidden, false);
  click(book);
  assert.equal(sub(book).hidden, true, 'a second click closes it');
  key(root.querySelector('input'), 'Escape');
  assert.equal(root.hidden, true);
  assert.equal(menuButton.getAttribute('aria-expanded'), 'false');
  assert.equal(document.body.style.overflow, '');
  assert.ok(focused === menuButton, 'the focus back on the Menu button');
  click(menuButton);
  click(root.querySelector('.nav-ad-phone-close'));
  assert.equal(root.hidden, true);
  click(menuButton);
  menu.close();
  assert.equal(root.hidden, true);
});

test('header.js: on Air Dolomiti the Menu button opens this menu instead of the flyout; other brands as before', () => {
  const js = fs.readFileSync('blocks/header/header.js', 'utf8');
  assert.match(js, /airdolomiti\.buildAirDolomitiPhoneMenu\(menu, \{/);
  assert.match(js, /if \(!tap && !airdolomiti\) flyout\.bind\(menuButton\);/);
  const css = fs.readFileSync('blocks/header/header-airdolomiti.css', 'utf8');
  assert.match(css, /@media \(width >= 1025px\) \{\s*\.header \.nav-airdolomiti \.nav-ad-phone \{\s*display: none;/);
});

test('the phone menu\'s look as www\'s (NavBurger_*)', () => {
  const css = fs.readFileSync('blocks/header/header-airdolomiti.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  const has = (re) => assert.match(css, re);
  const P = '\\.header \\.nav-airdolomiti \\.nav-ad-phone';
  has(new RegExp(`${P} \\{[^}]*position: fixed;[^}]*inset: 0;[^}]*overflow-y: auto;[^}]*padding-bottom: 50px;[^}]*background-color: #fff;`));
  has(new RegExp(`${P}-top \\{[^}]*justify-content: flex-end;[^}]*padding: 20px 15px;`));
  has(new RegExp(`${P}-search \\{[^}]*height: 50px;[^}]*margin: 30px 20px 20px;`));
  has(new RegExp(`${P} \\.nav-ad-quick \\{[^}]*min-height: 50vh;[^}]*margin-bottom: 30px;[^}]*padding: 20px;[^}]*background-color: #008293;`));
  has(new RegExp(`${P} \\.nav-ad-quick-link \\{[^}]*font-size: 19\\.44px;[^}]*font-weight: 600;[^}]*line-height: 30px;[^}]*text-transform: none;`));
  has(new RegExp(`${P}-items \\{[^}]*margin: 0 20px 35px;[^}]*border-bottom: 1px solid #757575;`));
  has(new RegExp(`${P}-item \\{[^}]*color: #040f32;[^}]*font-size: 23\\.76px;[^}]*font-weight: 600;[^}]*line-height: 30px;`));
  has(new RegExp(`${P}-item\\[aria-expanded="true"\\] \\{[^}]*color: #008293;`));
  has(new RegExp(`${P}-sub \\.nav-ad-group \\+ \\.nav-ad-group-bold \\{[^}]*margin-top: 40px;`));
  has(new RegExp(`${P}-sub \\.nav-ad-list li:has\\(> \\.nav-ad-link-more\\) \\{[^}]*margin-bottom: 40px;`));
  has(new RegExp(`${P}-sub \\.nav-ad-link:any-link \\{[^}]*font-size: 17\\.28px;[^}]*line-height: 24px;`));
  has(new RegExp(`${P}-sub \\.nav-ad-link-bold:any-link \\{[^}]*font-size: 19\\.44px;[^}]*font-weight: 700;[^}]*line-height: 28px;`));
});

test('the desktop bar and panel as www\'s at 1440 (states/*-menu*-1440): the logo 8 px higher, the bold links 36 px under the column, the card 350 px high with www\'s button', () => {
  const css = fs.readFileSync('blocks/header/header-airdolomiti.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  const has = (re) => assert.match(css, re);
  const D = '\\.header \\.nav-airdolomiti';
  has(new RegExp(`${D} \\.nav-brand img \\{[^}]*height: 50px;[^}]*translate: 0 -8px;`));
  has(new RegExp(`${D} \\.nav-ad-group \\+ \\.nav-ad-group \\{[^}]*margin-top: 36px;`));
  has(new RegExp(`${D} \\.nav-ad-card \\{[^}]*min-height: 350px;`));
  has(new RegExp(`${D} \\.nav-ad-card-title \\{[^}]*display: block;[^}]*margin: 16px 12px;`));
  has(new RegExp(`${D} \\.nav-ad-card-cta \\{[^}]*right: 16px;[^}]*bottom: 20px;[^}]*left: 16px;[^}]*justify-content: center;[^}]*gap: 16px;[^}]*padding: 18px 40px;[^}]*border-radius: 10px;[^}]*color: #00798a;[^}]*font-size: 16px;[^}]*font-weight: 500;[^}]*line-height: 22px;[^}]*white-space: nowrap;`));
  has(new RegExp(`${D} \\.nav-ad-card-cta::after \\{[^}]*width: 28px;[^}]*height: 28px;[^}]*background-color: currentcolor;`));
  has(new RegExp(`${D} \\.nav-ad-card-cta:hover \\{[^}]*color: #0093a8;`));
});
