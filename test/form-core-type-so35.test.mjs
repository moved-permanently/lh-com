/* eslint-disable max-len */
/* Standing order 35, item 3: lufthansa.com's core forms take two type sizes from www. A sub-section title
   (h3.heading-copytext-large) is fluid, 2.0rem on phones (was a fixed 24px), and a radio group's question
   (maui-radio-group's label) is bold. Gate (injected, recordings): the 9 recorded form pages, register-animal-cabin 390
   10.1 -> 8.9 %, the other 17 page-widths closer or within 0.1. The unrecorded form documents were rendered with and
   without the rules: no sideways scroll, failed picture, overlap or clipped text, and the H1 still there.
   Run: node --test test/form-core-type-so35.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/form/form.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('lufthansa.com core forms: the sub-section title fluid as heading-copytext-large', () => {
  assert.ok(css.includes('body.brand-lufthansa .form.core .form-subsection-title { font-size: var(--heading-font-size-m); }'));
  // the base rule keeps 24px for the other brands
  assert.ok(css.includes('.form.core .form-subsection-title { float: left;'));
  assert.ok(/\.form\.core \.form-subsection-title \{ float: left;[^}]*font-size: 24px;/.test(css));
});

test('lufthansa.com core forms: a radio group question bold', () => {
  assert.ok(css.includes('body.brand-lufthansa .form.core .form-group-radio > legend.form-label { font-weight: 700; }'));
});
