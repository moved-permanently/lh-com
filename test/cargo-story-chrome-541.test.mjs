/* eslint-disable max-len */
/* Cargo's transport stories' own chrome as www's (the brief after 540, item 2; cargo-parity-001's
   en-article-142-arctic-temperatures-on-board at 1440 and 390): www's story template puts a grey "Transport Stories
   Home" label with its icon under the breadcrumb (diariesBackLinkContainer, a link to the stories' overview, the same
   English text on every language's story) and, from 1025 px, a 38 px navy chevron at the foot of every story module
   (story-scrollLink: down, the last one up). The importer drops both as template parts (cargo-import.mjs); on our
   pages neither showed. The first picture module (hero-card-overlay (light), Cargo's stories only) adds the link to
   its language's /<lang>/ci/transport-stories before itself; cargo.css draws the chevrons.
   Run: node --max-old-space-size=512 --test test/cargo-story-chrome-541.test.mjs */
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
const { storyHomeLink } = await import('../blocks/hero-card-overlay/hero-card-overlay.js');

const page = () => {
  document.querySelector('main').innerHTML = '<div class="section"><div class="breadcrumb-wrapper"></div><div class="hero-card-overlay-wrapper"><div class="hero-card-overlay light"></div></div><div class="columns-media-wrapper"></div><div class="hero-card-overlay-wrapper"><div class="hero-card-overlay light"></div></div></div>';
  return [...document.querySelectorAll('.hero-card-overlay')];
};

test('the first picture module adds "Transport Stories Home" to its language\'s overview before itself, once', () => {
  const [first, second] = page();
  storyHomeLink(first, 'de');
  storyHomeLink(second, 'de');
  storyHomeLink(first, 'de');
  const rows = document.querySelectorAll('.hero-card-overlay-stories-wrapper');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].nextElementSibling, first.parentElement, 'right before the first module');
  const a = rows[0].querySelector('p.hero-card-overlay-stories > a');
  assert.equal(a.getAttribute('href'), '/de/ci/transport-stories');
  assert.equal(a.textContent, 'Transport Stories Home');
});

test('a language without its own overview links the English one; other brands and other variants add nothing', () => {
  let [first] = page();
  storyHomeLink(first, 'ja');
  assert.equal(document.querySelector('.hero-card-overlay-stories a').getAttribute('href'), '/en/ci/transport-stories');
  [first] = page();
  first.classList.remove('light');
  storyHomeLink(first, 'en');
  assert.equal(document.querySelector('.hero-card-overlay-stories'), null);
  [first] = page();
  document.body.classList.remove('brand-cargo');
  storyHomeLink(first, 'en');
  assert.equal(document.querySelector('.hero-card-overlay-stories'), null);
  document.body.classList.add('brand-cargo');
});

test('cargo.css: the label grey as www\'s, the chevrons from 1025 px at every module\'s foot, the last one up', () => {
  const css = fs.readFileSync(new URL('../styles/themes/cargo.css', import.meta.url), 'utf8');
  assert.match(css, /body\.brand-cargo \.hero-card-overlay-stories a \{[^}]*height: 25px;[^}]*background-color: #d3d3d3;/);
  assert.match(css, /@media \(width >= 1025px\) \{[^@]*body\.brand-cargo main > \.section:has\(> \.hero-card-overlay-wrapper > \.hero-card-overlay\.light\) > :is\(\.hero-card-overlay-wrapper, \.columns-media-wrapper\)::after \{[^}]*width: 38px;[^}]*height: 38px;/);
  assert.match(css, /:is\(\.hero-card-overlay-wrapper, \.columns-media-wrapper\):not\(:has\(~ :is\(\.hero-card-overlay-wrapper, \.columns-media-wrapper\)\)\)::after \{[^}]*rotate: 180deg;/);
  assert.match(css, /> \.columns-media-wrapper:has\(\+ \.hero-card-overlay-wrapper\)::after \{[^}]*bottom: -51px;/, 'a text module\'s chevron on the next picture\'s edge');
});
