/* eslint-disable max-len */
/* Standing order 19, item 3 (TAP row 158): a section title with its description (www's title component: the heading, its
   description div.mt-4, the component md:-mb-8) at the end of a text section. www's description 16 px under the heading and
   the next section's content 32 px nearer from 768 px (/pt-br/miles-and-go/ganhe-milhas/cartoes-de-credito at 1440,
   tap-parity-007: the card row 48 px lower in ours, +2.96 %). Ours: lufthansa.com's heading margin and the 64 px section gap.
   From 768 px a text section whose content ends in an h2 and one paragraph: the h2 16 px over the paragraph, the section
   36 px over the next. Measured on the 25 recorded TAP pages at 1440: cartoes-de-credito +2.96 -> +0.19 %, schengen-visas
   +0.51 -> +0.23, hold-baggage -0.49 -> -0.41; lounges, leiloes and doacao-milhas 0.15 points further each; the others
   unchanged. Reads tap.css as written.
   Run: node --max-old-space-size=256 --test test/tap-title-component-so19.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('from 768 px a text section ending in a heading and its description: 16 px between them, 36 px to the next section', () => {
  assert.ok(css.includes('@media (width >= 768px) { body.brand-tap main > .section:has(> .default-content-wrapper:last-child > h2:nth-last-child(2) + p:last-child) { margin-bottom: 36px; } body.brand-tap main > .section > .default-content-wrapper:last-child > h2:nth-last-child(2):has(+ p:last-child) { margin-bottom: 16px; } }'));
});
