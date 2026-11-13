/* eslint-disable max-len */
/* ITA row 48 (standing order 11 of 2026-11-13, item 4: a code rule that brings a recorded page within the gate).
   /it/en/book-and-prepare/other-requests/families-and-children/flying-with-a-baby (ita-parity-005, -3.51 % at 1440):
   its "Related" heading follows the page's accordion, and on www it is a section of its own (a headline in an
   .mb-default wrapper) with 64 px down to the cards at 1440 (56 on phones). On the other recorded pages it sits in the
   cards' column view, 32 px (24 on phones), and so does ours on all of them. Ours keeps the heading in the section
   with the accordion (accordion-columns-container), so from 768 px the heading alone in default content right before
   the cards there keeps 64 px: 1440 3190 -> 3222 (www 3306), the 38 other recorded ITA pages unchanged at 1440.
   On phones as before: www's 56 there would take the page from -0.16 to +0.46 %, further.
   One :has() level (a :has() nested in another drops the rule). Run: node --test test/ita-related-after-accordion-595.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/ita.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body.brand-ita main > .section.accordion-columns-container > .default-content-wrapper:has(+ .carousel-cards-wrapper) > h2:only-child';

test('from 768 px the heading alone right before the cards in an accordion section: 64 px to them', () => {
  const q = css.indexOf(`@media (width >= 768px) { ${SEL} {`);
  assert.ok(q >= 0, 'the rule, from 768 px');
  const i = css.indexOf(`${SEL} {`, q);
  assert.match(css.slice(i, css.indexOf('}', i)), /margin-bottom: 64px;/);
});

test('not below 768 px, and no :has() inside another', () => {
  const esc = SEL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const outside = css.replace(new RegExp(`@media \\(width >= 768px\\) \\{ ${esc} \\{[^}]*\\} \\}`), '');
  assert.ok(!outside.includes(`${SEL} {`), 'only inside the media query');
  assert.doesNotMatch(SEL, /:has\([^)]*:has\(/);
});
