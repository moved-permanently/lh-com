/* eslint-disable max-len */
/* lufthansa.com's core form sections (brief 557): www's form-section always renders its headline (h2) and its
   description (p), empty when the section has none. Recordings (lh-parity-004b /de/de/betreuungsbedarf,
   /gb/en/special-needs): a section without a title starts its card 39 px lower at 390 and 33 px lower from 768 px
   than ours (109 / 103 px of grey between the cards, ours 70); below 768 px a title without a description has its
   card 5 px further down (52 px of grey, ours 47). Our steps without an intro start 69 / 63 px down; a title without a
   description keeps 37 px under it below 768 px. Other brands and the other form looks as before.
   Run: node --max-old-space-size=256 --test test/form-core-empty-slots-557.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/form/form.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('a core form section without a title: 69 px above its card, 63 px from 768 px', () => {
  assert.ok(css.includes('body.brand-lufthansa .form.core .form-step:not(:has(> .form-step-intro)) { padding-top: 69px; }'));
  assert.ok(css.includes('@media (width >= 768px) { body.brand-lufthansa .form.core .form-step:not(:has(> .form-step-intro)) { padding-top: 63px; } }'));
});

test('below 768 px a title without a description: 37 px under it', () => {
  assert.ok(css.includes('@media (width < 768px) { body.brand-lufthansa .form.core .form-step-intro:not(:has(> .form-step-description)) > .form-step-title { margin-bottom: 37px; } }'));
});
