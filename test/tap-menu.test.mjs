/* eslint-disable max-len */
/* TAP's main menu (brief 331: www.flytap.com/en-pt's menu at 1440 and 390 px), blocks/header/
   header-tap.js buildTapMenu from the nav document tools/importer/tap-nav.mjs writes: www's top
   level, each panel with its columns (a heading linking the column's page, its links, "See all"
   where www shows it) and its banner card (picture, title, line, link); on phones the same menu
   as www's accordion in a card, opened by the menu button. The look: blocks/header/header-tap.css,
   loaded for TAP only. Run: node --test test/tap-menu.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body><header></header></body></html>');
window.hlx = { codeBasePath: '' };
globalThis.window = window;
globalThis.document = document;

const { readTapMenu, buildTapMenu } = await import('../blocks/header/header-tap.js');

// a TAP nav document's menu section, as tools/importer/tap-nav.mjs writes it (en-pt, trimmed)
const SECTION = `<div><ul>
<li><p>Plan a trip</p><ul>
  <li><p><a href="/en-pt/bookings">Book</a></p><ul><li><a href="https://www.flytap.com/en_pt/">Flights and Destinations</a></li><li><a href="/en-pt/bookings/tap-fares">Fares</a></li></ul><p><a href="/en-pt/bookings">See all</a></p></li>
  <li><p><a href="/en-pt/information">Trip information</a></p><ul><li><a href="/en-pt/information/baggage">Baggage</a></li></ul><p><a href="/en-pt/information">See all</a></p></li>
  <li><p><a href="/en-pt/on-board">On board</a></p><ul><li><a href="/en-pt/on-board/wi-fi">Wi-Fi</a></li></ul></li>
  <li><p><img src="/media-da/tap/ees-1.jpg" alt="An airport"></p><p><strong>New EES system</strong></p><p>Delays at passport control in Lisbon.</p><p><a href="/en-pt/information/documentation/schengen-visas">Find out more</a></p></li>
</ul></li>
<li><p>My flights</p><ul>
  <li><p><a href="/en-pt/manage-booking">Manage booking</a></p><ul><li><a href="/en-pt#my-travels">Manage your Booking</a></li><li><a href="/en-pt/vouchers">TAP Vouchers</a></li></ul></li>
  <li><p><a href="/en-pt/manage-booking/extras">Extras</a></p><ul><li><a href="https://cars.flytap.com/en/">Rent a car</a></li></ul></li>
</ul></li>
<li><p><a href="/en-pt#check-in">Check-in</a></p><ul>
  <li><p><a href="/en-pt#check-in">Check-in</a></p></li>
  <li><p><a href="/en-pt/check-in-information">Check-in Information</a></p></li>
</ul></li>
<li><p>Help</p><ul><li><p><a href="/en-pt/help">Help center</a></p><ul><li><a href="/en-pt/help/tap-refunds">Refunds</a></li></ul></li></ul></li>
</ul></div>`;
const section = (html = SECTION) => {
  const d = document.createElement('div');
  d.innerHTML = html;
  return d.firstElementChild;
};
const link = (href, label, className) => {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = label;
  if (className) a.className = className;
  return a;
};
const build = (opts = {}) => {
  const menuButton = document.createElement('button');
  menuButton.setAttribute('aria-expanded', 'false');
  const m = buildTapMenu(section(opts.html), { link, menuButton, ...opts });
  document.querySelector('header').replaceChildren(menuButton, m.root);
  return { ...m, menuButton };
};
const click = (el) => el.dispatchEvent(new window.Event('click', { bubbles: true }));

test('readTapMenu: www\'s top level, the columns with their heading link, links and "See all", the banner', () => {
  const items = readTapMenu(section());
  assert.deepEqual(items.map((i) => i.label), ['Plan a trip', 'My flights', 'Check-in', 'Help']);
  const [plan, flights, checkIn] = items;
  assert.equal(plan.link, null);
  assert.deepEqual(plan.cols.map((c) => [c.label, c.href, c.links.length, c.seeAll && c.seeAll.label]), [
    ['Book', '/en-pt/bookings', 2, 'See all'],
    ['Trip information', '/en-pt/information', 1, 'See all'],
    ['On board', '/en-pt/on-board', 1, null],
  ]);
  assert.deepEqual(plan.banner, {
    img: { src: '/media-da/tap/ees-1.jpg', alt: 'An airport' }, title: 'New EES system', line: 'Delays at passport control in Lisbon.', cta: { label: 'Find out more', href: '/en-pt/information/documentation/schengen-visas' },
  });
  assert.deepEqual(flights.cols.map((c) => c.label), ['Manage booking', 'Extras']);
  assert.equal(flights.banner, null);
  assert.equal(checkIn.link, '/en-pt#check-in');
  assert.deepEqual(checkIn.cols.map((c) => [c.label, c.href, c.links.length]), [['Check-in', '/en-pt#check-in', 0], ['Check-in Information', '/en-pt/check-in-information', 0]]);
});

test('the bar: a button per item, a panel each; one open at a time; Escape and a click outside close it', () => {
  const { root } = build();
  const buttons = [...root.querySelectorAll(':scope > li > .nav-bar-menu-button')];
  assert.deepEqual(buttons.map((b) => b.textContent), ['Plan a trip', 'My flights', 'Check-in', 'Help']);
  assert.ok(root.classList.contains('nav-bar-menu') && root.classList.contains('tap-menu'));
  const panels = buttons.map((b) => document.getElementById(b.getAttribute('aria-controls')));
  assert.ok(panels.every((p) => p && p.classList.contains('tap-menu-panel') && p.hidden));
  click(buttons[0]);
  assert.equal(buttons[0].getAttribute('aria-expanded'), 'true');
  assert.equal(panels[0].hidden, false);
  click(buttons[1]);
  assert.equal(panels[0].hidden, true);
  assert.equal(panels[1].hidden, false);
  const esc = new window.Event('keydown', { bubbles: true });
  esc.key = 'Escape';
  panels[1].dispatchEvent(esc);
  assert.equal(panels[1].hidden, true);
  click(buttons[0]);
  click(document.body);
  assert.equal(panels[0].hidden, true);
});

test('a panel: the columns (TAP\'s chevron, the heading link, the links, "See all"), the banner card', () => {
  const { root } = build();
  const plan = root.querySelector('.tap-menu-panel');
  const cols = [...plan.querySelectorAll('.tap-menu-col')];
  assert.equal(cols.length, 3);
  const book = cols[0];
  const heading = book.querySelector('a.tap-menu-heading');
  assert.equal(heading.getAttribute('href'), '/en-pt/bookings');
  assert.equal(heading.textContent.trim(), 'Book');
  assert.ok(book.querySelector('.tap-menu-chevron svg'), 'www\'s green chevron');
  assert.deepEqual([...book.querySelectorAll('.tap-menu-links a')].map((a) => a.textContent), ['Flights and Destinations', 'Fares']);
  assert.equal(book.querySelector('a.tap-menu-see-all').getAttribute('href'), '/en-pt/bookings');
  assert.equal(cols[2].querySelector('.tap-menu-see-all'), null, 'none where www shows none');
  const banner = plan.querySelector('.tap-menu-banner');
  assert.equal(banner.querySelector('img').getAttribute('src'), '/media-da/tap/ees-1.jpg');
  assert.equal(banner.querySelector('.tap-menu-banner-title').textContent, 'New EES system');
  assert.equal(banner.querySelector('.tap-menu-banner-line').textContent, 'Delays at passport control in Lisbon.');
  const cta = banner.querySelector('a.tap-menu-banner-cta');
  assert.equal(cta.getAttribute('href'), '/en-pt/information/documentation/schengen-visas');
  assert.equal(cta.textContent, 'Find out more');
  // My flights: both columns, no banner
  const flights = root.querySelectorAll('.tap-menu-panel')[1];
  assert.deepEqual([...flights.querySelectorAll('.tap-menu-heading')].map((h) => h.textContent.trim()), ['Manage booking', 'Extras']);
  assert.equal(flights.querySelector('.tap-menu-banner'), null);
});

test('phones: the menu button opens the menu as a card; an item and a column open as www\'s accordion', () => {
  const { root, menuButton } = build();
  assert.equal(root.classList.contains('is-open'), false);
  click(menuButton);
  assert.equal(root.classList.contains('is-open'), true);
  assert.equal(menuButton.getAttribute('aria-expanded'), 'true');
  const col = root.querySelector('.tap-menu-col');
  const toggle = col.querySelector('button.tap-menu-col-toggle');
  assert.equal(toggle.textContent.trim(), 'Book');
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  click(toggle);
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  assert.ok(col.classList.contains('is-open'));
  click(menuButton);
  assert.equal(root.classList.contains('is-open'), false);
  assert.equal(menuButton.getAttribute('aria-expanded'), 'false');
});

test('an older nav document without Check-in: the quick action third, a plain link', () => {
  const html = SECTION.replace(/<li><p><a href="\/en-pt#check-in">Check-in<\/a><\/p><ul>[\s\S]*?<\/ul><\/li>\n/, '');
  const { root } = build({ html, quickLinks: [link('/en-pt#my-travels', 'Manage booking'), link('/en-pt#check-in', 'Check-in')] });
  const items = [...root.querySelectorAll(':scope > li')];
  assert.deepEqual(items.map((li) => li.firstElementChild.textContent), ['Plan a trip', 'My flights', 'Check-in', 'Help']);
  assert.equal(items[2].querySelector('a').getAttribute('href'), '/en-pt#check-in');
});

test('header-tap.css: loaded once for TAP, every rule scoped to brand tap', () => {
  build();
  build();
  assert.equal(document.querySelectorAll('link[href$="/blocks/header/header-tap.css"]').length, 1);
  const css = fs.readFileSync(path.join(repo, 'blocks/header/header-tap.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const selectors = [...css.matchAll(/(^|})\s*([^{}@]+)\{/g)].map((m) => m[2].trim()).filter((s) => s && !/^(from|to|\d+%)$/.test(s));
  assert.ok(selectors.length > 10);
  // a selector list's members (commas inside :is() belong to one member)
  const members = (sel) => sel.split(/,(?![^(]*\))/).map((x) => x.trim());
  selectors.forEach((s) => members(s).forEach((one) => assert.match(one, /^body\.brand-tap /, one)));
});

test('header.js: TAP builds its own menu (header-tap.js) and keeps the menu button for it; other brands as before', () => {
  const src = fs.readFileSync(path.join(repo, 'blocks/header/header.js'), 'utf8');
  assert.ok(src.includes('tap.buildTapMenu('), 'TAP builds its own menu');
  assert.ok(src.includes('if (!tap) flyout.bind(menuButton)'), 'the menu button opens TAP\'s menu, not the flyout');
  assert.ok(src.includes("import('./header-bar-menu.js')"), 'the bar menu of the other brands (b2b) as it was');
});
