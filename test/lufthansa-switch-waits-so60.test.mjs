/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 60 item 1: lufthansa.com's switch ships its code before its documents. THEMES.lufthansa is main's theme with the
   switch's additions in THEMES.lufthansa.switched; themeFor applies them only to a document without style markers (the collapse's
   output, the importers'). A document that still has markers (hasStyleMarkers, read in decorateMain before decorateTextStyles takes
   them) draws with main's theme and the theme off, as before the switch, until its batch collapses it.
   Run: node --max-old-space-size=512 --test test/lufthansa-switch-waits-so60.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { themeFor, hasStyleMarkers, THEMES } from '../scripts/style-markers.js';
import { offThemes } from './live-brands.mjs';

const TYPES = ['', 'service', 'flow', 'article', '100-years', 'insights-tag', 'home'];

test('a marked lufthansa.com document gets main\'s theme, off: none of the switch\'s additions', () => {
  TYPES.forEach((t) => {
    const theme = themeFor('lufthansa', t, { marked: true });
    assert.equal(theme.live, false, t);
    assert.equal(theme.space, undefined, t);
    assert.equal(theme.columnViews.opening, undefined, t);
    assert.equal(theme.columnViews.carrier, 'column-view', t);
    assert.equal(theme.headingChoices.h2.small, undefined, t);
    assert.equal(theme.limitedHeadings, undefined, t);
  });
});

test('a lufthansa.com document without markers gets the switched theme (live, M at 40, the steps; 100-years M at 60)', () => {
  const theme = themeFor('lufthansa', 'service');
  assert.equal(theme.live, true);
  assert.equal(theme.space.m, 40);
  assert.equal(theme.space.steps['l-minus'], 80);
  assert.equal(theme.columnViews.opening, 60);
  assert.equal(theme.headingChoices.h2.small, 'heading-small');
  assert.equal(themeFor('lufthansa', '100-years').space.m, 60);
  assert.deepEqual(themeFor('lufthansa', 'flow').nearChoices.h2, { 'heading-small': 'small', 'heading-large': 'large' });
  assert.equal(themeFor('lufthansa', 'flow').headingChoices.h3.large, 'heading-small');
  // the other brands have no switched part: marked or not, the same theme
  Object.keys(THEMES).filter((b) => b !== 'lufthansa').forEach((b) => TYPES.forEach((t) => {
    assert.deepEqual(themeFor(b, t, { marked: true }), themeFor(b, t), `${b} ${t}`);
  }));
});

test('hasStyleMarkers: any marker spelling counts; data placeholders and plain braces do not', () => {
  const main = (html) => parseHTML(`<html><body><main>${html}</main></body></html>`).document.querySelector('main');
  assert.equal(hasStyleMarkers(main('<div><h2>A {heading-small}</h2></div>')), true);
  assert.equal(hasStyleMarkers(main('<div><p>{spacer-40 from-768}</p></div>')), true);
  assert.equal(hasStyleMarkers(main('<div><p>{column-start}</p><p>B</p></div>')), true);
  assert.equal(hasStyleMarkers(main('<div><p>Flights from {origin} to {destination} in {n} hours</p></div>')), false);
  assert.equal(hasStyleMarkers(main('<div><p>{"a": 1}</p><p>Text</p></div>')), false);
  assert.equal(hasStyleMarkers(main('<div><div class="spacer m-plus"><div><div></div></div></div><h2>A</h2></div>')), false);
});

test('the site: a marked lufthansa.com document draws as with every theme off; an unmarked one gets body.theme-live', async () => {
  const page = (html) => {
    const { document } = parseHTML(`<html><head></head><body><main>${html}</main></body></html>`);
    globalThis.document = document;
    return document.querySelector('main');
  };
  const { default: decorateTokenFree } = await import('../scripts/token-free.js');
  // what decorateTextStyles leaves of a marked document (the markers taken), with carriers main already has
  const html = '<div><h2 class="heading-small">T</h2><p>Text</p><div class="spacer"><div><div></div></div></div><ul><li>One</li></ul></div>'
    + '<div class="column-view"><div class="spacer"><div><div></div></div></div></div><div class="h2-large"><h2>U</h2><p>V</p></div>';
  const marked = page(html);
  decorateTokenFree(marked, {
    brand: 'lufthansa', path: '/de/en/x', read: () => '', marked: true,
  });
  assert.ok(!marked.ownerDocument.body.classList.contains('theme-live'));
  const off = offThemes(() => {
    const m = page(html);
    decorateTokenFree(m, { brand: 'lufthansa', path: '/de/en/x', read: () => '' });
    return m;
  });
  // with the theme off the switched part does not apply either: main's drawing
  assert.equal(marked.innerHTML, off.innerHTML);
  // main's M: 60 px (the switched theme's is 40)
  assert.equal(marked.querySelectorAll('p.spacer').length, 2);
  marked.querySelectorAll('p.spacer').forEach((p) => assert.equal(p.style.getPropertyValue('--spacer-size'), '60px'));
  const free = page(html);
  decorateTokenFree(free, { brand: 'lufthansa', path: '/de/en/x', read: () => '' });
  assert.ok(free.ownerDocument.body.classList.contains('theme-live'));
  assert.equal(free.querySelector(':scope > div > p.spacer').style.getPropertyValue('--spacer-size'), '40px');
});
