/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 77 (2026-11-19), item 2: SWISS miles-and-more's "Travel with privileges" (11 languages) drew
   heading-medium through order 71's accordion-headings rule, where www has its small headline; no page structure
   tells it apart from online-check-in's, so the accordion's option small-headline (a block option, the author's
   choice) keeps the H2 right before it at the page's heading-small, and the SWISS theme gives the accordion www's
   space under that headline from 768 px. Strings only in assertions (no DOM node goes into one).
   Run: node --max-old-space-size=256 --test test/swiss-small-headline-so77.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { default: decorateTokenFree } = await import('../scripts/token-free.js');
const { THEMES } = await import('../scripts/style-markers.js');

const h2s = (mainHtml, brand = 'swiss') => {
  const { document } = parseHTML(`<html><head></head><body><main>${mainHtml}</main></body></html>`);
  globalThis.document = document;
  const main = document.querySelector('main');
  decorateTokenFree(main, { brand, path: '/ch/en/x', read: (k) => (k === 'theme' ? 'flow-spacing' : '') });
  return [...main.querySelectorAll('h2')].map((h) => `${h.textContent}:${h.className}`).join(' ');
};
const acc = (cls) => `<div class="${cls}"><div><div>Q</div><div>A</div></div></div>`;

test('small-headline: the H2 over the accordion keeps the page\'s heading-small', () => {
  if (!THEMES.swiss.live) return;
  assert.equal(h2s(`<div><h2>Move up</h2><h2>Travel with privileges</h2>${acc('accordion-columns faq open-first small-headline')}</div>`), 'Move up:heading-small Travel with privileges:heading-small');
  // the section's metadata between them does not count
  assert.equal(h2s(`<div><h2>Travel</h2><div class="section-metadata"><div><div>Style</div><div>padded</div></div></div>${acc('accordion-columns small-headline')}</div>`), 'Travel:heading-small');
});

test('without the option the accordion-headings rule stands', () => {
  if (!THEMES.swiss.live) return;
  assert.equal(h2s(`<div><h2>Travel with privileges</h2>${acc('accordion-columns faq open-first')}</div>`), 'Travel with privileges:heading-medium');
  // the option is about the headline over the accordion: an H2 right after it keeps the rule
  assert.equal(h2s(`<div>${acc('accordion-columns small-headline')}<h2>After</h2><p>Text</p></div>`), 'After:heading-medium');
});

test('the SWISS theme: the option\'s space under the headline from 768 px', () => {
  const css = fs.readFileSync(new URL('../styles/themes/swiss.css', import.meta.url), 'utf8');
  assert.match(css, /@media \(width >= 768px\) \{\s*body\.brand-swiss main \.accordion-columns\.small-headline \{\s*padding-top: 20px;\s*\}/);
});
