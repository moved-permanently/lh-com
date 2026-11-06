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
  assert.deepEqual(BRANDS.b2b.header, {
    menu: 'bar', logoLink: false, search: 'button', locale: false,
  });
  // TAP: the bar menu with the language list and its layout (test/tap-first-screen.test.mjs)
  assert.deepEqual(BRANDS.tap.header, { menu: 'bar', languages: 'bar', layout: 'tap' });
  // Lufthansa Cargo: www's Book & Track, Info-Hub, Cargo inside and "EN" in the bar (test/cargo-parity-417.test.mjs)
  assert.deepEqual(BRANDS.cargo.header, { menu: 'bar', languages: 'bar' });
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
