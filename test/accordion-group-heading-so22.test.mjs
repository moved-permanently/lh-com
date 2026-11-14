/* eslint-disable max-len */
/* Standing order 22 (2026-11-14), item 1: /de/en/prepare-for-your-trip/baggage/baggage-irregularities/faq-damaged-baggage.
   A spaced accordion (www's maui-collapsible.accordion, margin 4rem 0 from 768px, 2rem below on phones) followed in the
   same section by a {heading-small} group heading (h2): www has only the accordion's margin there. Ours drew the spaced
   option's 40px and the block gap (24px) too: the group headings 24px (1440) and 44px (390) low. Census of the 9,912
   published copies: this shape (an h2 heading-small right after a spaced accordion) only on faq-damaged-baggage, 15
   documents, 30 places; the h3 heading-small titles of accordion lists (security-fast-lanes, climate-protection-projects)
   and other headings (faq-baggage-delay: scoped out, the order-21 trial made it worse) as before. tools/parity/gate.mjs:
   faq-damaged-baggage 7.41 / 12.31 -> 1.15 / 3.02 at 1440 / 390, the 8 other recorded page-widths of the shape's
   neighbours the same.
   Run: node --test test/accordion-group-heading-so22.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/accordion-columns/accordion-columns.css', import.meta.url), 'utf8');

test('no block gap between a spaced accordion and a heading-small group heading after it', () => {
  const at = css.indexOf('body.brand-lufthansa main > .section > .accordion-columns-wrapper:has(> .accordion-columns.spaced) + .default-content-wrapper:has(> h2.heading-small:first-child) {');
  assert.ok(at > 0, 'the rule');
  assert.match(css.slice(at, css.indexOf('}', at)), /margin-top: 0;/);
});

test('below 768px the accordion keeps 20px under it there (www: 2rem)', () => {
  const at = css.indexOf('body.brand-lufthansa main > .section > .accordion-columns-wrapper:has(+ .default-content-wrapper > h2.heading-small:first-child) > .accordion-columns.spaced {');
  assert.ok(at > 0, 'the rule');
  assert.equal(css.slice(css.lastIndexOf('@media', at), css.indexOf('{', css.lastIndexOf('@media', at))).trim(), '@media (width < 768px)');
  assert.match(css.slice(at, css.indexOf('}', at)), /padding-bottom: 20px;/);
  assert.ok(!/h3\.heading-small|:is\(h2, h3/.test(css.slice(at - 400, at + 400)), 'only the h2 group heading');
});
