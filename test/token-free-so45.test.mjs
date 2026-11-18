/* eslint-disable max-len, import/extensions -- dev tooling */
/* Standing order 45 of 2026-11-18, items 2 and 3 (token-free content, Discover and ITA): the markers order 44 held get a
   carrier the theme or the document's structure gives, never a token:
   - Discover's held H2s (" {heading-copytext-large}", santorini and check-in): the block option title-compact or the
     section style h2-compact; the additional-services intro's one-paragraph view (" {column-start-outer
     column-end-outer}"): discover.css's intro rule;
   - ITA's ita-airways-app H3s (" {heading-small}"): ita.css's column-view H3 rule (ITA's bold heading weight; the size
     is already Columns Media's for an unmarked H3).
   The rows (delta-so45-*-token-free.json) remove markers and add at most a block option or a section style.
   Run: node --test test/token-free-so45.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const R = '../tools/reports/parity-2026-11-09/';
const TOKEN = /\{(spacer|divider|heading|copytext|column-start|column-end)[^}]*\}|(below|from)-768/;
const css = (f) => fs.readFileSync(new URL(`../styles/themes/${f}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const rows = (b) => JSON.parse(fs.readFileSync(new URL(`${R}delta-so45-${b}-token-free.json`, import.meta.url), 'utf8'));

test('the rows remove markers only; what they add is a block option or a section style', () => {
  ['discover', 'ita'].forEach((b) => {
    const data = rows(b);
    assert.ok(Object.keys(data).length > 0, b);
    Object.values(data).flat().forEach((r) => {
      assert.doesNotMatch(r.to, TOKEN, `${b}: a row writes no token`);
      assert.equal(r.count, 1);
      assert.notEqual(r.from, r.to);
      // the row's whole change: the markers out of from, the carriers out of to, and nothing else differs
      const unmarked = r.from.replace(/ \{(heading|column-start|column-end)[^}]*\}/g, '');
      const uncarried = r.to.replace(' title-compact', '').replace(', h2-compact', '').replace('<div class="section-metadata"><div><div>Style</div><div>h2-compact</div></div></div>', '');
      assert.equal(uncarried, unmarked, `${b}: only markers go and only a carrier comes`);
    });
  });
  assert.deepEqual(Object.keys(rows('discover')).sort(), [
    '/de/de/my-bookings/check-in', '/de/de/my-bookings/services/additional-services', '/de/de/travel-inspiration/inspiration/destinations/santorini',
    '/de/en/my-bookings/check-in', '/de/en/my-bookings/services/additional-services', '/de/en/travel-inspiration/inspiration/destinations/santorini',
  ]);
  assert.deepEqual(Object.keys(rows('ita')), ['/it/en/world-of-ita-airways/discover-ita-airways/ita-airways-app']);
});

test('Discover: the intro view without its marks is the theme\'s (padding, 0 px to the cards on phones, 40 px from 768)', () => {
  const d = css('discover.css');
  assert.ok(d.includes('body.brand-discover main .default-content-wrapper:has(+ .carousel-cards-wrapper) > h1 + p:last-child:not([class]), body.brand-discover main > .section:has(+ .section > .carousel-cards-wrapper:first-child) > .default-content-wrapper:last-child > h1 + p:last-child:not([class]) { margin-bottom: 0; padding-top: var(--section-padding); padding-bottom: var(--section-padding); }'));
  assert.ok(d.includes('body.brand-discover main .default-content-wrapper:has(> h1 + p:last-child:not([class])) + .carousel-cards-wrapper { margin-top: 0; }'));
  assert.ok(d.includes('@media (width >= 768px) { body.brand-discover main .default-content-wrapper:has(> h1 + p:last-child:not([class])) + .carousel-cards-wrapper, body.brand-discover main > .section:has(> .default-content-wrapper:last-child > h1 + p:last-child:not([class])) + .section:has(> .carousel-cards-wrapper:first-child) { margin-top: 40px; } }'));
});

test('ITA: an unmarked H3 opening a column view\'s text in the bold heading weight', () => {
  assert.ok(css('ita.css').includes('body.brand-ita main .columns-media:not(.title-large, .title-compact, .sidebar) .columns-media-text > h3:first-child:not([class*="heading-"]) { font-weight: var(--heading-light-weight, 300); }'));
});
