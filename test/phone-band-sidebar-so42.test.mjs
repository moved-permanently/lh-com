/* eslint-disable max-len */
/* Standing order 42 of 2026-11-16 (delta-so42-rows.txt):
   - brusselsairlines.com on phones: a page ending with a sidebar Columns Media keeps 42px above the footer
     (contact-form-error 390 11.39 -> 5.19 %);
   - lufthansa.com on phones: a view's closing mark before a grey column band keeps 16px of its 32px
     (passenger-rights 390 7.69 -> 6.22 %, special-meals 11.51 -> 9.53 %).
   Run: node --max-old-space-size=256 --test test/phone-band-sidebar-so42.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (f) => fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('Brussels: the closing sidebar 42px above the footer on phones', () => {
  const css = read('styles/themes/brussels.css');
  assert.ok(css.includes('@media (width < 768px) { body.brand-brussels main > .section:last-child > .columns-media-wrapper:last-child > .columns-media.sidebar { padding-bottom: 0; } body.brand-brussels main > .section:last-child:has(> .columns-media-wrapper:last-child > .columns-media.sidebar) { margin-bottom: 42px; } }'));
});

test('lufthansa.com: a closing mark before a grey band keeps 16px on phones', () => {
  assert.ok(read('styles/styles.css').includes('@media (width < 768px) { body.brand-lufthansa main > .section:has(+ .section.grey.column-band) > .default-content-wrapper:last-child > :is(p.column-end, p.column-end-outer):last-child { padding-bottom: 16px; } }'));
});
