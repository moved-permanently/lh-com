/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Standing order 24 (2026-11-14), item 1: lufthansa.com headings on phones keep their words whole, as www's (no automatic
   hyphenation, styles.css). A word a little wider than its line runs into the page margin as on www
   (/de/de/entryprocesses "Reisebestimmungen", 350 px on a 346 px line); only a heading whose text would reach past the
   viewport (the page would scroll sideways) gets class heading-break-words, which breaks inside the overlong word.
   scripts/heading-words.js measures after the fonts are ready and on resize; linkedom has no layout, so the boxes are
   stubbed here.
   Run: node --test test/heading-words-so24.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body class="brand-lufthansa"><main><div><h1>Internationale Reisebestimmungen</h1><h2>Beförderungsbedingungen</h2><h2>Short</h2></div></main></body></html>');
globalThis.window = window;
globalThis.document = document;
Object.defineProperty(document.documentElement, 'clientWidth', { value: 390, configurable: true });
const { checkHeadings, BREAK_CLASS } = await import('../scripts/heading-words.js');

// a heading's box (22 px page margin, a 346 px line) and the width its text needs
const stub = (el, need) => {
  el.getBoundingClientRect = () => ({ left: 22, width: 346, right: 368 });
  Object.defineProperty(el, 'scrollWidth', { value: el.classList.contains(BREAK_CLASS) ? 346 : need, configurable: true });
};

test('a word into the page margin stays whole; one past the viewport breaks; the rest is left alone', () => {
  const [h1, long, short] = document.querySelectorAll('main h1, main h2');
  stub(h1, 350); // Reisebestimmungen: 4 px into the margin, as on www
  stub(long, 470); // Beförderungsbedingungen at 28 px: past the 390 px viewport
  stub(short, 120);
  checkHeadings(document);
  assert.equal(h1.classList.contains(BREAK_CLASS), false);
  assert.equal(long.classList.contains(BREAK_CLASS), true);
  assert.equal(short.classList.contains(BREAK_CLASS), false);
});

test('measured again without the class (a wider screen, the fonts changed): a heading that fits loses it', () => {
  const long = document.querySelectorAll('main h2')[0];
  long.classList.add(BREAK_CLASS);
  long.getBoundingClientRect = () => ({ left: 22, width: 346, right: 368 });
  Object.defineProperty(long, 'scrollWidth', { value: 300, configurable: true });
  checkHeadings(document);
  assert.equal(long.classList.contains(BREAK_CLASS), false);
});

test('styles.css: below 768px lufthansa.com headings keep words whole, the class breaks an overlong word', () => {
  const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  assert.ok(css.includes('@media (width < 768px) { body.brand-lufthansa main :is(h1, h2, h3, h4, h5, h6) { hyphens: manual; overflow-wrap: normal; } body.brand-lufthansa main :is(h1, h2, h3, h4, h5, h6).heading-break-words { overflow-wrap: break-word; } }'));
  const js = fs.readFileSync(new URL('../scripts/scripts.js', import.meta.url), 'utf8');
  assert.match(js, /import\('\.\/heading-words\.js'\)/);
});
