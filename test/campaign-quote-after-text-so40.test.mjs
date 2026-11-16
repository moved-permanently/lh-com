/* eslint-disable max-len */
/* Standing order 40, item 1: on lufthansa.com campaign pages at phone widths, an author quote alone in its section
   after a section that ends with text keeps the quote's own 60px (www 90px from the last line to the quote on
   /de/en/100-years/campaigns). After a picture it keeps 93px, as before. Two :has() side by side, not nested (a nested
   one is dropped by the browser). Gate: campaigns 390 9.9 -> 9.5 %; the 5 other versions with the pattern rendered
   with and without, no breakage. Run: node --test test/campaign-quote-after-text-so40.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('a lone campaign quote after text: 60px on phones, 93px after a picture', () => {
  assert.ok(css.includes('body.brand-lufthansa main > .section.campaign-section:has(> .default-content-wrapper:last-child > p:last-child):not(:has(> .default-content-wrapper:last-child > p:last-child > picture)) + .section.campaign-section > .default-content-wrapper:only-child > blockquote:only-child { margin-top: 60px; }'));
  assert.ok(css.includes('body.brand-lufthansa main > .section.campaign-section > .default-content-wrapper:only-child > blockquote:only-child { margin-top: 93px; }'));
});
