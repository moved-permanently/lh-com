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

const { readTapMenu, buildTapMenu, readTapFlag } = await import('../blocks/header/header-tap.js');

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
  const items = [...root.querySelectorAll(':scope > li:not(.tap-menu-market)')];
  assert.deepEqual(items.map((li) => li.firstElementChild.textContent), ['Plan a trip', 'My flights', 'Check-in', 'Help']);
  assert.equal(items[2].querySelector('a').getAttribute('href'), '/en-pt#check-in');
});

test('a Check-in item in another language (fr-fr Enregistrement, pl-pl Odprawa) is the Check-in: no second one from the quick action', () => {
  const html = SECTION.replace('<li><p><a href="/en-pt#check-in">Check-in</a></p><ul>', '<li><p><a href="/fr-fr#check-in">Enregistrement</a></p><ul>');
  const { root } = build({ html, quickLinks: [link('/fr-fr#check-in', 'Enregistrement')] });
  const labels = [...root.querySelectorAll(':scope > li:not(.tap-menu-market)')].map((li) => li.firstElementChild.textContent);
  assert.deepEqual(labels, ['Plan a trip', 'My flights', 'Enregistrement', 'Help']);
});

test('phones: the menu button shows the close icon and says Close while the menu is open (www at 390)', () => {
  document.documentElement.lang = 'pt';
  const { menuButton } = build();
  menuButton.setAttribute('aria-label', 'Menu');
  click(menuButton);
  assert.ok(menuButton.classList.contains('tap-menu-open'));
  assert.equal(menuButton.getAttribute('aria-label'), 'Fechar');
  click(menuButton);
  assert.ok(!menuButton.classList.contains('tap-menu-open'));
  assert.equal(menuButton.getAttribute('aria-label'), 'Menu');
  document.documentElement.lang = 'en';
});

test('phones: the card ends with the market row ("PT, English"), opening the bar\'s language links as they are then', () => {
  window.location = { pathname: '/en-pt/information/baggage' };
  document.documentElement.lang = 'en';
  const header = document.querySelector('header');
  const { root, menuButton } = build();
  // the bar's market button and its list (header-languages.js), its links set by the header
  const langs = document.createElement('div');
  langs.className = 'nav-languages';
  langs.innerHTML = '<button class="nav-tool nav-languages-button"><svg class="lh-icon"></svg><span class="nav-languages-current">PT</span></button><ul class="nav-languages-list" hidden><li><a class="nav-languages-link" lang="pt" href="/pt-pt">Português</a></li></ul>';
  header.prepend(langs);
  const row = root.querySelector(':scope > li.tap-menu-market');
  assert.ok(row, 'the market row, last');
  assert.equal(root.lastElementChild, row);
  click(menuButton);
  const button = row.querySelector('button.tap-menu-market-button');
  assert.equal(button.textContent.trim(), 'PT, English');
  assert.ok(button.querySelector('svg'), 'the bar\'s globe');
  // the header points the bar's links at the page's counterpart: the row takes them at opening
  langs.querySelector('a').setAttribute('href', '/pt-pt/informacoes/bagagem');
  click(button);
  assert.equal(button.getAttribute('aria-expanded'), 'true');
  assert.deepEqual([...row.querySelectorAll('.tap-menu-market-list a')].map((a) => [a.textContent, a.getAttribute('href')]), [['Português', '/pt-pt/informacoes/bagagem']]);
  langs.remove();
});

test('the market button as www\'s: the nav\'s flag and the root\'s language ("DE" on de-ch), not the globe and "CH"', async () => {
  window.location = { pathname: '/de-ch/informationen' };
  document.documentElement.lang = 'de';
  const html = SECTION.replace('</ul></div>', '<li><p><img src="/media-da/tap/flag-ch-1a2b3c4d.svg" alt="Schweiz"></p></li>\n</ul></div>');
  assert.deepEqual(readTapMenu(section(html)).map((i) => i.label), ['Plan a trip', 'My flights', 'Check-in', 'Help'], 'the flag row is no menu item');
  assert.deepEqual(readTapFlag(section(html)), { src: '/media-da/tap/flag-ch-1a2b3c4d.svg', alt: 'Schweiz' });
  // the bar as header.js builds it: the menu, then the tools with the market button
  const bar = document.createElement('div');
  bar.className = 'nav-bar';
  const menuButton = document.createElement('button');
  const { root } = buildTapMenu(section(html), { link, menuButton });
  const tools = document.createElement('div');
  tools.innerHTML = '<div class="nav-languages"><button class="nav-tool nav-languages-button"><svg class="lh-icon"></svg><span class="nav-languages-label">Land und Sprache; aktuell:</span><span class="nav-languages-current">CH</span></button><ul class="nav-languages-list" hidden><li><a class="nav-languages-link" href="/en-ch">English</a></li></ul></div>';
  bar.append(root, tools);
  document.querySelector('header').replaceChildren(menuButton, bar);
  await new Promise((r) => { setTimeout(r, 0); });
  const button = tools.querySelector('.nav-languages-button');
  assert.ok(button.classList.contains('tap-market'));
  assert.equal(button.querySelector('.tap-flag img').getAttribute('src'), '/media-da/tap/flag-ch-1a2b3c4d.svg');
  assert.equal(button.querySelector('svg.lh-icon'), null, 'no globe');
  assert.equal(button.querySelector('.nav-languages-current').textContent, 'DE');
  // the phone card's market row: the flag too
  click(menuButton);
  const row = root.querySelector('.tap-menu-market-button');
  assert.equal(row.querySelector('.tap-flag img').getAttribute('src'), '/media-da/tap/flag-ch-1a2b3c4d.svg');
  assert.equal(row.textContent.trim(), 'CH, Deutsch');
  document.documentElement.lang = 'en';
});

test('inner pages: www\'s quick-action tab under the bar (parity 39), the homepage box\'s four tabs in the page\'s language; none on a homepage', async () => {
  const wrap = (pathname, lang) => {
    window.location = { pathname };
    document.documentElement.lang = lang;
    const wrapper = document.createElement('div');
    wrapper.className = 'nav-wrapper nav-tap';
    const nav = document.createElement('nav');
    const bar = document.createElement('div');
    bar.className = 'nav-bar';
    const menuButton = document.createElement('button');
    const { root } = buildTapMenu(section(), { link, menuButton });
    bar.append(root);
    nav.append(bar);
    wrapper.append(nav);
    const header = document.createElement('header');
    header.append(wrapper);
    document.body.replaceChildren(header);
    return { wrapper, header };
  };
  let { wrapper, header } = wrap('/pt-pt/informacoes/bagagem', 'pt');
  await new Promise((r) => { setTimeout(r, 0); });
  const tab = wrapper.querySelector('.tap-quick');
  assert.ok(tab, 'the tab');
  assert.ok(header.classList.contains('tap-has-quick'), 'the header keeps room for it');
  assert.deepEqual([...tab.querySelectorAll('a')].map((a) => [a.textContent.trim(), a.getAttribute('href')]), [
    ['Reservar voo', '/pt-pt#book-flight'], ['Fazer Check-in', '/pt-pt#check-in'], ['Gerir reserva', '/pt-pt#my-travels'], ['Estado do voo', '/pt-pt#flight-status'],
  ]);
  assert.ok([...tab.querySelectorAll('a')].every((a) => a.querySelector('svg')), 'each with its icon');
  // a market root's inner page: its own root and language
  ({ wrapper } = wrap('/en-us/information/baggage', 'en'));
  await new Promise((r) => { setTimeout(r, 0); });
  assert.deepEqual([...wrapper.querySelectorAll('.tap-quick a')].map((a) => a.getAttribute('href'))[0], '/en-us#book-flight');
  assert.equal(wrapper.querySelector('.tap-quick a').textContent.trim(), 'Book flight');
  // pt-br's own words
  ({ wrapper } = wrap('/pt-br/informacoes/bagagem', 'pt'));
  await new Promise((r) => { setTimeout(r, 0); });
  assert.equal([...wrapper.querySelectorAll('.tap-quick a')][2].textContent.trim(), 'Gerenciar reserva');
  // a homepage: none (the stage holds the booking box)
  ({ wrapper, header } = wrap('/pt-pt', 'pt'));
  await new Promise((r) => { setTimeout(r, 0); });
  assert.equal(wrapper.querySelector('.tap-quick'), null);
  assert.ok(!header.classList.contains('tap-has-quick'));
  document.body.replaceChildren(document.createElement('header'));
  document.documentElement.lang = 'en';
});

test('the market row stays hidden where the bar has no language list', () => {
  const { root, menuButton } = build();
  click(menuButton);
  assert.equal(root.querySelector('.tap-menu-market').hidden, true);
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
