/* eslint-disable max-len */
/* Standing order 41, item 2: lufthansa.com core forms - an untitled sub-section holding one checkbox group keeps www's
   empty title slot (29px above it). On www each such group is its own .subsection with an empty
   h3.heading-copytext-large legend (add-sports-baggage's sports-baggage list). Sub-sections with a title or with more
   fields are as before. Gate: add-sports-baggage 1440 / 390 8.9 / 10.9 -> 6.6 / 9.9 %, passenger-receipt-90 1440
   6.0 -> 2.3, feedback-past-flight 1440 5.4 -> 4.3, the other 19 recorded form page-widths unchanged; the unrecorded
   core-form documents rendered with and without, no breakage. Run: node --test test/form-untitled-checkbox-subsection-so41.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/form/form.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('an untitled sub-section with one checkbox group: 29px above it', () => {
  assert.ok(css.includes('body.brand-lufthansa .form.core .form-subsection:not(:has(> legend)):has(> .form-subsection-fields > .form-field-checkbox:only-child) { margin-top: 29px; }'));
});
