/* eslint-disable max-len */
/* Cargo's transport stories' chevrons (standing order 5 of 2026-11-12, item 2; Cargo row 52; cargo-parity-001's 142 story
   at 1440): www's story-scrollLink at the foot of every story module is a link (focusable) that scrolls to the next
   module, the last one (up) back to the first. Ours were drawn (cargo.css ::after, row 47): seen, but nothing to press.
   The page's first picture module adds a button to each module (the picture modules, the text modules, the closing
   text): named (www's are not), scrolling to the next module, the last one to the first; cargo.css draws them as row 47
   from 1025 px, hidden on phones as www's.
   Run: node --max-old-space-size=512 --test test/cargo-story-chevrons-588.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body class="brand-cargo"><main></main></body></html>');
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'cargo.turnsthe.page', pathname: '/de/news/142-arktische-temperaturen-an-bord', search: '', replace: () => {}, href: 'https://cargo.turnsthe.page/de/news/142-arktische-temperaturen-an-bord', origin: 'https://cargo.turnsthe.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: true, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
const { storyChevrons } = await import('../blocks/hero-card-overlay/hero-card-overlay.js');

const page = () => {
  document.querySelector('main').innerHTML = '<div class="section"><div class="breadcrumb-wrapper"></div>'
    + '<div class="hero-card-overlay-wrapper"><div class="hero-card-overlay light"></div></div>'
    + '<div class="columns-media-wrapper"><div class="columns-media"></div></div>'
    + '<div class="hero-card-overlay-wrapper"><div class="hero-card-overlay light"></div></div>'
    + '<div class="default-content-wrapper"><p>Partner links, photos</p></div></div>';
  return [...document.querySelectorAll('.hero-card-overlay')];
};

test('a button at every module\'s foot, named, the last one back to the start, once', () => {
  const [first, second] = page();
  storyChevrons(second, 'de');
  assert.equal(document.querySelectorAll('.story-chevron').length, 0, 'only the first picture module adds them');
  storyChevrons(first, 'de');
  const buttons = [...document.querySelectorAll('.story-chevron')];
  assert.equal(buttons.length, 4);
  assert.deepEqual(buttons.map((b) => b.parentElement.className), ['hero-card-overlay-wrapper', 'columns-media-wrapper', 'hero-card-overlay-wrapper', 'default-content-wrapper']);
  assert.ok(buttons.every((b) => b.tagName === 'BUTTON' && b.type === 'button'));
  assert.deepEqual(buttons.map((b) => b.getAttribute('aria-label')), ['Nächster Teil der Geschichte', 'Nächster Teil der Geschichte', 'Nächster Teil der Geschichte', 'Zurück zum Anfang der Geschichte']);
  assert.ok(buttons[3].classList.contains('story-chevron-first') && !buttons[0].classList.contains('story-chevron-first'));
  storyChevrons(first, 'de');
  assert.equal(document.querySelectorAll('.story-chevron').length, 4, 'once');
});

test('a press scrolls to the next module, the last one to the first', () => {
  const [first] = page();
  const went = [];
  [...document.querySelectorAll('main .section > div')].forEach((m) => { m.scrollIntoView = () => went.push(m.className); });
  storyChevrons(first, 'fr');
  const buttons = [...document.querySelectorAll('.story-chevron')];
  assert.equal(buttons[0].getAttribute('aria-label'), 'Next part of the story', 'English for other languages');
  buttons[0].dispatchEvent(new window.Event('click'));
  buttons[3].dispatchEvent(new window.Event('click'));
  assert.deepEqual(went, ['columns-media-wrapper', 'hero-card-overlay-wrapper']);
});

test('not on other brands', () => {
  const [first] = page();
  document.body.classList.remove('brand-cargo');
  storyChevrons(first, 'en');
  assert.equal(document.querySelectorAll('.story-chevron').length, 0);
  document.body.classList.add('brand-cargo');
});

test('cargo.css: the buttons from 1025 px as row 47\'s chevrons, hidden on phones, a focus ring', () => {
  const css = fs.readFileSync(new URL('../styles/themes/cargo.css', import.meta.url), 'utf8');
  assert.match(css, /body\.brand-cargo \.story-chevron \{\s*display: none;/);
  assert.match(css, /@media \(width >= 1025px\) \{[^@]*> \.story-chevron \{\s*display: block;[^}]*width: 38px;[^}]*height: 38px;[^}]*cursor: pointer;/);
  assert.match(css, /> \.story-chevron:focus-visible \{[^}]*outline: 2px solid #006;/);
  assert.match(css, /> \.story-chevron-first \{\s*rotate: 180deg;/);
  assert.doesNotMatch(css, /\.default-content-wrapper:last-child\)::after/, 'no drawn chevrons left');
  assert.match(css, /:is\(\.hero-card-overlay-wrapper, \.columns-media-wrapper, \.default-content-wrapper:last-child\) \{\s*position: relative;\s*scroll-margin-top: var\(--nav-height\);/, 'a module scrolled to stops under the fixed bar');
});
