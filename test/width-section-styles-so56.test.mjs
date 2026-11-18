/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 56 of 2026-11-18, item 2f (ema-tests's order 57 rows wait for them): width-scoped section styles as
   theme classes, token-free carriers for www's breakpoint spacing: space-below-l-768, space-below-m-below-768,
   space-below-m-768, space-m-below-768 (and space-m-768, space-l-768), divider-l-768 with divider-m-below-768 (and
   divider-m-768). Each draws a separator paragraph shown from 768 px (from-768) or on phones only (below-768), the sizes
   the theme's M / L; nothing in a document but the section style.
   Run: node --max-old-space-size=256 --test test/width-section-styles-so56.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import {
  readSectionStyle, SECTION_STYLES, SECTION_STYLE_LABELS, SPACE as BASE, themeFor,
} from '../scripts/style-markers.js';

// the theme's M / L (the switch branch: lufthansa.com's M at 40 px)
const SPACE = { ...BASE, ...(themeFor('lufthansa').space || {}) };

const NAMES = ['space-below-l-768', 'space-below-m-below-768', 'space-below-m-768', 'space-m-below-768', 'space-m-768', 'space-l-768', 'divider-l-768', 'divider-m-below-768', 'divider-m-768'];

test('the styles are section styles with labels the library shows', () => {
  NAMES.forEach((n) => {
    assert.ok(SECTION_STYLES[n], n);
    assert.ok(SECTION_STYLE_LABELS[n], `${n} label`);
  });
  const s = readSectionStyle(['space-below-l-768', 'space-below-m-below-768', 'divider-l-768', 'divider-m-below-768']);
  assert.equal(s.spaceBelowTablet, 'l');
  assert.equal(s.spaceBelowPhone, 'm');
  assert.equal(s.dividerTablet, 'l');
  assert.equal(s.dividerPhone, 'm');
  assert.equal(readSectionStyle('Space above: M on phones'.replace('Space above: M on phones', 'space-m-below-768')).spacePhone, 'm');
});

const page = async (cls) => {
  const { document } = parseHTML(`<html><body><main><div class="${cls}"><h2>Title</h2><p>Text.</p></div><div><p>Next.</p></div></main></body></html>`);
  globalThis.document = document;
  const { default: decorateTokenFree } = await import('../scripts/token-free.js');
  const main = document.querySelector('main');
  decorateTokenFree(main, { brand: 'lufthansa', path: '/de/en/shopping', read: () => '' });
  return main.querySelector(':scope > div');
};

test('below the section: L from 768 px and M on phones, two separators shown by width', async () => {
  const sec = await page('space-below-l-768 space-below-m-below-768');
  const seps = [...sec.querySelectorAll(':scope > p.spacer')];
  assert.equal(seps.length, 2, sec.innerHTML);
  assert.ok(seps[0].classList.contains('from-768') && seps[0].style.getPropertyValue('--spacer-size') === `${SPACE.l}px`);
  assert.ok(seps[1].classList.contains('below-768') && seps[1].style.getPropertyValue('--spacer-size') === `${SPACE.m}px`);
  assert.equal(sec.lastElementChild, seps[1], 'after the section\'s content');
});

test('above the section: a divider with L space from 768 px and M on phones; space M on phones only', async () => {
  const sec = await page('divider-l-768 divider-m-below-768');
  const [a, b] = sec.querySelectorAll(':scope > p.spacer.divider');
  assert.ok(a && a.classList.contains('from-768') && a.style.getPropertyValue('--spacer-size') === `${SPACE.l}px`, sec.innerHTML);
  assert.ok(b && b.classList.contains('below-768') && b.style.getPropertyValue('--spacer-size') === `${SPACE.m}px`);
  assert.equal(sec.firstElementChild, a);
  const phone = await page('space-m-below-768');
  assert.ok(phone.firstElementChild.matches('p.spacer.below-768:not(.divider)'), phone.innerHTML);
});

test('no style, no separator (the other section untouched)', async () => {
  const sec = await page('space-m-768');
  assert.equal(sec.nextElementSibling.querySelectorAll('p.spacer').length, 0);
});
