/* eslint-disable max-len */
/* The brief after 593, item 4: Brussels' accordion panel text as www's plain paragraphs (18 / 24 px) and the panel 20 px
   in on phones. Run: node --max-old-space-size=256 --test test/brussels-accordion-panel-text-593.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('panel paragraphs and list items 18 / 24 px', () => {
  assert.ok(css.includes('body.brand-brussels main .accordion-columns.faq .accordion-columns-panel :is(p, li) { font-size: 18px; line-height: 24px; }'));
});

test('below 768 px the panel 20 px in from each side; no wider text at 1440', () => {
  assert.ok(css.includes('@media (width < 768px) { body.brand-brussels main .accordion-columns.faq .accordion-columns-panel { padding-left: 20px; padding-right: 20px; } }'));
  assert.ok(!css.includes('.accordion-columns-panel :is(p, ul, ol) { max-width: 923px'));
});
