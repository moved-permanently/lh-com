/* eslint-disable max-len */
/* Standing order 37, item 3: lufthansa.com's core form sections spaced as www's (register-ammunition's recordings at
   390 and 1440). A section starts 9px nearer the one before (padding-top 21px, was 30). A card's first sub-section
   title moves 12px up (11 below 768px). On phones the section title is 26px above its description (was 32). Fields
   keep their spacing: closing the 3px measured worse. Gate: 9 recorded form pages, 9 page-widths better
   (register-ammunition 10.8 -> 9.5 % at 390), 9 unchanged. The 164 unrecorded core-form documents were rendered with
   and without: no breakage. Run: node --test test/form-core-spacing-so37.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/form/form.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('lufthansa.com core form sections: www\'s section, card-title and phone title spacing', () => {
  assert.ok(css.includes('body.brand-lufthansa .form.core .form-step { padding-top: 21px; }'));
  assert.ok(css.includes('body.brand-lufthansa .form.core .form-step-card > .form-subsection:first-child > .form-subsection-title { margin-top: -12px; }'));
  assert.ok(css.includes('@media (width < 768px) { body.brand-lufthansa .form.core .form-step-card > .form-subsection:first-child > .form-subsection-title { margin-top: -11px; } }'));
  assert.ok(css.includes('@media (width < 768px) { body.brand-lufthansa .form.core .form-step-title { margin-bottom: 26px; } }'));
  // a section without a title keeps brief 557's start
  assert.ok(css.includes('body.brand-lufthansa .form.core .form-step:not(:has(> .form-step-intro)) { padding-top: 69px; }'));
});

test('the fields inside a card keep their spacing', () => {
  assert.ok(css.includes('--form-field-reserve: 24px;'));
});
