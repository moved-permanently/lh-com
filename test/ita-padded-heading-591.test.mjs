/* eslint-disable max-len */
/* ITA row 41 (standing order 8 of 2026-11-12, item 2: /it/en/book-and-prepare/offers/territorial-continuity/residents-in-
   sicily +3.1 % at 1440, +4.1 % at 390, ita-parity-005): www's padded AEM section holds "Additional Information" and the
   Offer Conditions accordion (29 px under the heading, the section's padding under it); DA keeps the accordion in a
   section of its own (its market variants), so ours drew the padded section's bottom padding and the section gap
   between the heading and the accordion. A padded section of only a heading loses its bottom padding and gap; the next
   section draws that padding.
   Run: node --test test/ita-padded-heading-591.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/ita.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const S = 'body.brand-ita main > .section.padded:has(> .default-content-wrapper:only-child > :is(h2, h3):only-child)';
const rule = (sel) => {
  const i = css.indexOf(`${sel} {`);
  assert.ok(i >= 0, `the rule ${sel}`);
  return css.slice(i, css.indexOf('}', i));
};

test('a padded section of only a heading: no bottom padding, no gap', () => {
  const r = rule(S);
  assert.match(r, /padding-bottom: 0;/);
  assert.match(r, /margin-bottom: 0;/);
});

test('the next section draws the padding', () => {
  assert.match(rule(`${S} + .section`), /padding-bottom: var\(--section-padding\);/);
});
