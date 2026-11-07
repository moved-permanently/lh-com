/* eslint-disable max-len */
/* The header's menu in the bar (blocks/header/header-bar-menu.js), as business.lufthansagroup.com's
   header (2026-11-02): the nav document's top items as buttons in the bar, each opening a drop-down
   panel with its sections (a title and its links); one open at a time, Escape and a click outside
   close it, the item's button gets its focus back. A brand turns it on in scripts/brands.js
   (header: { menu: 'bar', logoLink: false, search: 'button' }: Lufthansa Group for Business only);
   every other brand keeps the Menu button and its flyout as before.
   Run: node --max-old-space-size=512 --test test/header-bar-menu.test.mjs */
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
const key = (target, k) => {
  const e = new window.Event('keydown', { bubbles: true });
  e.key = k;
  target.dispatchEvent(e);
};
const click = (target) => target.dispatchEvent(new window.Event('click', { bubbles: true }));

const { default: buildBarMenu } = await import('../blocks/header/header-bar-menu.js');
const { BRANDS } = await import('../scripts/brands.js');

const a = (href, label) => {
  const x = document.createElement('a');
  x.setAttribute('href', href);
  x.textContent = label;
  return x;
};
const items = () => [
  { label: 'Login', link: null, groups: [{ label: 'For Companies', links: [a('https://www.partnerplusbenefit.com/x', 'PartnerPlusBenefit ↗'), a('/de/en/login', 'Lufthansa Group for Business Programm')] }, { label: 'For Travel Agencies', links: [a('/service/secured/api/experts/login?country=de&language=en', 'eXperts')] }] },
  { label: 'Programs', link: null, groups: [{ label: 'For Companies', links: [a('/de/en/program/partner-plus-benefit', 'PartnerPlusBenefit'), a('/de/en/program/businesstogo', 'BusinessToGo')] }, { label: 'NDC', links: [a('/de/en/program/ndc', 'NDC Partner Program ↗')] }] },
  { label: 'Direct', link: a('/de/en/news', 'Direct'), groups: [] },
];
const link = (href, label, className) => {
  const x = document.createElement('a');
  x.href = href;
  x.className = className;
  x.textContent = label;
  return x;
};

test('the top items as buttons in the bar, each with its drop-down of sections (title and links)', () => {
  const menu = buildBarMenu(items(), { link });
  document.body.replaceChildren(menu.root);
  assert.equal(menu.root.tagName, 'UL');
  assert.equal(menu.root.className, 'nav-bar-menu');
  const buttons = [...menu.root.querySelectorAll('button.nav-bar-menu-button')];
  assert.deepEqual(buttons.map((b) => b.textContent.trim()), ['Login', 'Programs']);
  buttons.forEach((b) => {
    assert.equal(b.getAttribute('aria-expanded'), 'false');
    const panel = document.getElementById(b.getAttribute('aria-controls'));
    assert.ok(panel && panel.classList.contains('nav-dropdown') && panel.hidden, 'its panel, hidden');
  });
  const programs = document.getElementById(buttons[1].getAttribute('aria-controls'));
  assert.deepEqual([...programs.querySelectorAll('.nav-dropdown-title')].map((h) => h.textContent), ['For Companies', 'NDC']);
  assert.deepEqual([...programs.querySelectorAll('a.nav-dropdown-link')].map((x) => [x.getAttribute('href'), x.textContent]), [['/de/en/program/partner-plus-benefit', 'PartnerPlusBenefit'], ['/de/en/program/businesstogo', 'BusinessToGo'], ['/de/en/program/ndc', 'NDC Partner Program ↗']]);
  const direct = menu.root.querySelector('a.nav-bar-menu-link');
  assert.deepEqual([direct.getAttribute('href'), direct.textContent], ['/de/en/news', 'Direct'], 'an item without sections: a link');
});

test('a click opens one drop-down at a time; again, Escape or a click outside closes it', () => {
  const menu = buildBarMenu(items(), { link });
  document.body.replaceChildren(menu.root, document.createElement('main'));
  const [login, programs] = [...menu.root.querySelectorAll('button.nav-bar-menu-button')];
  const panel = (b) => document.getElementById(b.getAttribute('aria-controls'));
  click(login);
  assert.equal(login.getAttribute('aria-expanded'), 'true');
  assert.equal(panel(login).hidden, false);
  click(programs);
  assert.equal(login.getAttribute('aria-expanded'), 'false', 'the other one closes');
  assert.equal(panel(login).hidden, true);
  assert.equal(programs.getAttribute('aria-expanded'), 'true');
  click(programs);
  assert.equal(programs.getAttribute('aria-expanded'), 'false', 'a second click closes it');
  click(programs);
  key(panel(programs).querySelector('a'), 'Escape');
  assert.equal(panel(programs).hidden, true);
  assert.ok(focused === programs, 'the focus back on its button');
  click(programs);
  click(document.querySelector('main'));
  assert.equal(panel(programs).hidden, true, 'a click outside closes');
  click(programs);
  menu.close();
  assert.equal(programs.getAttribute('aria-expanded'), 'false');
});

test('brands.js: the bar menu, the unlinked logo and the search button on Lufthansa Group for Business; TAP\'s own layout (brief 311); Cargo\'s menu and language in the bar (brief 417); no other brand', () => {
  // (the logo in the phone menu's head: brief 421, test/b2b-parity-421.test.mjs; the signed-in
  // Login menu: test/header-b2b-session.test.mjs)
  assert.deepEqual(BRANDS.b2b.header, {
    menu: 'bar', logoLink: false, search: 'button', locale: false, flyoutLogo: true, session: 'b2b',
  });
  // TAP: the bar menu with the language list and its layout (test/tap-first-screen.test.mjs)
  assert.deepEqual(BRANDS.tap.header, { menu: 'bar', languages: 'bar', layout: 'tap' });
  // Lufthansa Cargo: www's Book & Track, Info-Hub, Cargo inside and "EN" in the bar (test/cargo-parity-417.test.mjs)
  assert.deepEqual(BRANDS.cargo.header, { menu: 'bar', languages: 'bar', menuClose: true });
  assert.deepEqual(Object.keys(BRANDS).filter((k) => BRANDS[k].header).sort(), ['b2b', 'cargo', 'tap']);
});

test('header.js: the options read from the brand entry; without them as before', () => {
  const js = fs.readFileSync('blocks/header/header.js', 'utf8');
  // (a sub-site's style first: test/swiss-sub-sites.test.mjs)
  assert.match(js, /const subSiteHeader = locale\.subSite && locale\.subSite\.header;\n {2}const headerStyle = subSiteHeader \|\| \(pageBrand && pageBrand\.header\) \|\| \{\};/);
  assert.match(js, /if \(headerStyle\.menu === 'bar'\)/);
  assert.match(js, /headerStyle\.logoLink === false/);
  assert.match(js, /headerStyle\.search === 'button'/);
  assert.match(js, /headerStyle\.locale !== false/);
  const css = fs.readFileSync('blocks/header/header.css', 'utf8');
  assert.match(css, /\.header \.nav-bar-menu \{/);
  assert.match(css, /\.header \.nav-dropdown \{/);
});

// Lufthansa Cargo (brief 422): www's panels carry a "Close" link and the access note (the nav
// document's menu section paragraph: "Some services may be limited…"); its portal links a lock
test('options: a Close button in each panel (closes, the focus back), the note under each panel\'s sections; without them as before', () => {
  const note = document.createElement('p');
  note.innerHTML = '<span class="icon icon-lock"></span>Some services may be limited based on your access. For assistance, see <a href="/en/support-and-contact">Support &amp; Contact</a>';
  const menu = buildBarMenu(items(), { link, note, closeLabel: 'Close' });
  document.body.replaceChildren(menu.root);
  const [login, programs] = [...menu.root.querySelectorAll('button.nav-bar-menu-button')];
  const panel = (b) => document.getElementById(b.getAttribute('aria-controls'));
  [login, programs].forEach((b) => {
    const close = panel(b).querySelector('button.nav-dropdown-close');
    assert.ok(close, 'a Close button');
    assert.equal(close.textContent.trim(), 'Close');
    const n = panel(b).querySelector('.nav-dropdown-note');
    assert.ok(n && /Some services may be limited/.test(n.textContent), 'the note');
    assert.equal(n.querySelector('a').getAttribute('href'), '/en/support-and-contact');
  });
  assert.notEqual(panel(login).querySelector('.nav-dropdown-note'), panel(programs).querySelector('.nav-dropdown-note'), 'a copy per panel');
  click(programs);
  click(panel(programs).querySelector('button.nav-dropdown-close'));
  assert.equal(panel(programs).hidden, true);
  assert.ok(focused === programs, 'the focus back on its button');
  const plain = buildBarMenu(items(), { link });
  assert.equal(plain.root.querySelector('.nav-dropdown-close, .nav-dropdown-note'), null, 'B2B: as before');
});

test('a link with a lock icon in the nav document (:lock:, www\'s portal links) gets nav-link-locked', () => {
  const locked = a('https://www.lufthansa-cargo.com/en/dgr-booking', 'DGR request');
  locked.insertAdjacentHTML('beforeend', ' <span class="icon icon-lock"></span>');
  const menu = buildBarMenu([{ label: 'Book & Track', link: null, groups: [{ label: 'Book', links: [locked, a('/en/x', 'Rates')] }] }], { link });
  const links = [...menu.root.querySelectorAll('a.nav-dropdown-link')];
  assert.deepEqual(links.map((x) => [x.textContent, x.classList.contains('nav-link-locked')]), [['DGR request', true], ['Rates', false]]);
});

test('header.js: the note and Close for a brand with header.menuClose (Cargo); the shared CSS draws the lock', () => {
  const js = fs.readFileSync('blocks/header/header.js', 'utf8');
  assert.match(js, /const menuNote = headerStyle\.menuClose && menu \? menu\.querySelector\(':scope \.default-content-wrapper > p'\) : null;/);
  assert.match(js, /buildBarMenu\(menuItems, \{[^}]*note: menuNote,/);
  assert.match(js, /closeLabel: headerStyle\.menuClose \? labels\.close : '',/);
  assert.match(fs.readFileSync('blocks/header/header.css', 'utf8'), /\.header \.nav-link-locked::after \{[^}]*mask: url\('\/icons\/lock\.svg'\)/);
  assert.ok(fs.existsSync('icons/lock.svg'));
});

test('header.js: the phone menu (flyout) shows the same note once below its menu, as www\'s phone menu (Cargo, brief 422)', () => {
  const js = fs.readFileSync('blocks/header/header.js', 'utf8');
  assert.match(js, /const flyout = buildFlyout\(\{[^}]*note: menuNote,/);
  assert.match(js, /function buildFlyout\(\{\n\s+items, image, extras, login, labels, menuLabel, logo, note = null,\n\}\)/);
  assert.match(js, /note \? el\('p', \{ className: 'nav-flyout-note' \}, \.\.\.\[\.\.\.note\.cloneNode\(true\)\.childNodes\]\) : null,\n\s+\);\n\s+const columns/);
  assert.match(fs.readFileSync('blocks/header/header.css', 'utf8'), /\.header \.nav-flyout-note \{[^}]*border-top: 1px solid/);
  const theme = fs.readFileSync('styles/themes/cargo.css', 'utf8');
  assert.match(theme, /body\.brand-cargo \.header \.nav-flyout-note \{[^}]*padding-left: 26px;[^}]*font-size: 14px;/, 'the text and its link one paragraph beside the lock');
  assert.match(theme, /body\.brand-cargo \.header \.nav-flyout-note \.icon-lock \{[^}]*position: absolute;/);
  assert.match(theme, /body\.brand-cargo \.header :is\(\.nav-dropdown-note, \.nav-flyout-note\) \.icon-lock \{[^}]*mask: url\('\/icons\/lock\.svg'\)/);
});

test('classifySections: the tools are the section whose own items carry icons, not a mega menu whose links and note carry locks (Cargo, brief 422)', async () => {
  const { default: classifySections } = await import('../blocks/header/header-sections.js');
  const frag = document.createElement('div');
  frag.innerHTML = `<div class="section"><p><a href="/en/home"><picture><img src="/logo.png" alt=""></picture></a></p></div>
<div class="section"><ul><li><a href="/book">Book</a></li></ul></div>
<div class="section"><div class="default-content-wrapper"><ul><li><p>Book &amp; Track</p><ul><li><p>Book</p><ul><li><a href="/dgr">DGR request <span class="icon icon-lock"></span></a></li></ul></li></ul></li></ul><p><span class="icon icon-lock"></span>Some services may be limited</p></div></div>
<div class="section"><div class="default-content-wrapper"><ul><li><span class="icon icon-help"></span><a href="/en/support-and-contact">Support &amp; Contact</a></li></ul><p>Menu</p></div></div>`;
  const sections = [...frag.querySelectorAll(':scope > .section')];
  const found = classifySections(frag);
  assert.equal(found.tools, sections[3]);
  assert.equal(found.menu, sections[2]);
  assert.equal(found.brand, sections[0]);
  assert.equal(found.quick, sections[1]);
});

test('Cargo\'s phone menu: navy text and grey lines on its white flyout, its navy bar keeps the light text (brief 422)', () => {
  // the bar menu's flyout is white with the bar's text colour (B2B's deep blue); Cargo's bar text
  // is light (#ebebeb on navy), so its flyout re-sets the colour inside the flyout only
  const theme = fs.readFileSync('styles/themes/cargo.css', 'utf8');
  assert.match(theme, /body\.brand-cargo \.header \.nav-wrapper\.nav-has-bar-menu \.nav-flyout \{[^}]*--nav-bar-text: #05164d;[^}]*--nav-line: #ccc;/);
  assert.doesNotMatch(theme, /body\.brand-cargo \.header \.nav-wrapper[^{]*\.nav-bar \{[^}]*--nav-bar-text/, 'the bar as before');
});
