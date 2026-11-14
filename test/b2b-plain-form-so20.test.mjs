/* eslint-disable max-len */
/* Standing order 20 of 2026-11-14, item 1: Group for Business's contact form (businesstogo, "Any questions? Contact
   us!") is plain on www: the fields in the content column (335 px, from its left edge), no grey band, no white card,
   the textarea 112 px high 42 px under the email field, the button under the fields 54 px below the textarea, 96 px
   (390) / 116 px (1440) under the button to the next heading. Ours drew lufthansa.com's grey band and card (form core).
   Shipped with delta-so20-b2b-businesstogo-form.txt: the German businesstogo pages run about 140 px short of www's
   above the form (many small steps), which the grey band had cancelled; a {spacer-140} before their form heading keeps
   the form and what follows at www's place. Gate on the 8 recorded businesstogo page-widths, rendered from one local
   folder: 6 better, 2 within, none worse.
   Run: node --test test/b2b-plain-form-so20.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/b2b.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('B2B: the core form without band and card, the fields and button in the content column', () => {
  assert.ok(css.includes('body.brand-b2b .form.core .form-form { padding-bottom: 0; background-color: transparent; box-shadow: none; clip-path: none; }'));
  assert.ok(css.includes('body.brand-b2b .form.core .form-step { padding: 0; }'));
  assert.ok(css.includes('body.brand-b2b .form.core .form-step-card { grid-column: 1 / -1; margin: 0; padding: 0; background-color: transparent; }'));
  assert.ok(css.includes('body.brand-b2b .form.core .form-form > .form-actions { justify-content: flex-start; margin: 30px 0 68px; }'));
});

test('B2B: the textarea 112 px high 42 px under the field above; from 768 px 88 px under the button', () => {
  assert.ok(css.includes('body.brand-b2b .form.core .form-field-textarea { margin-top: 42px; }'));
  assert.ok(css.includes('body.brand-b2b .form.core .form-field-textarea > textarea.form-control { height: 112px; }'));
  assert.ok(css.includes('@media (width >= 768px) { body.brand-b2b .form.core .form-form > .form-actions { margin-bottom: 88px; } }'));
});
