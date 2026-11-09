/* eslint-disable max-len */
/* Lufthansa Cargo, a gallery's dots on phones (the brief after 509, item 2; Cargo row 42): the
   industry pages' galleries (carousel-images: oil & gas, fine arts, en and de) have a dot per picture
   in one row that does not wrap, so at 390 the page was 141 and 21 px wider than the screen. www's
   slider dots (.owl-dots .owl-dot: inline-blocks) wrap onto the next line. Cargo's gallery dots wrap,
   centred. Cargo's theme only. Run: node --max-old-space-size=512 --test test/cargo-carousel-dots-510.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/cargo.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('row 42: a gallery\'s dots wrap onto the next line instead of widening the page', () => {
  assert.match(css, /body\.brand-cargo \.carousel-images \.carousel-images-dots \{[^}]*flex-wrap: wrap;[^}]*justify-content: center;/);
});
