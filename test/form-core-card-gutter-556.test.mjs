/* eslint-disable max-len */
/* lufthansa.com's core form cards on phones (brief 556, /de/de/betreuungsbedarf and /gb/en/special-needs at 390,
   lh-parity-004b): www's .container-white.p-7 sits in a .col-12, 22 px from both edges (346 px wide); ours bled
   the 10 px column padding of the other form looks (.container-white.row.px-4) and drew 366 px, so the labels and
   the consent text wrapped into fewer lines (the consent card four lines, 108 px, shorter). Below 768 px a core
   form's card keeps to the column; other brands, the other form looks and 768 px up as before.
   Run: node --max-old-space-size=256 --test test/form-core-card-gutter-556.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/form/form.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('below 768 px a lufthansa.com core form card keeps to the column', () => {
  assert.ok(css.includes('@media (width < 768px) { body.brand-lufthansa .form.core .form-step-card { margin-inline: 0; } }'));
});

test('the other form looks still bleed the column padding', () => {
  assert.ok(css.includes('.form .form-step-card { margin: 0 calc(var(--grid-gutter) / -2);'));
});
