/* eslint-disable max-len */
/* TAP's FAQ pages: the categories 32 px under the title from 768 px (the standing order of 2026-11-10, item 6; TAP row
   130, tap-parity-002 /en-pt/help/frequently-asked-questions at 1440: ours 2,079 px against www's 2,009). www's title
   (h1 pb-8) has its category chips 32 px under it; the title's section kept the sections' 64 px. Phones as before
   (already www's: "Before the flight" at 698 on both at 390).
   Run: node --test test/tap-faq-gap-567.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

test('from 768 px the section before the FAQ picker 32 px over it', () => {
  const sel = 'body.brand-tap main > .section:has(+ .section.faq-picker-section)';
  const at = css.indexOf(`@media (width >= 768px) {\n  ${sel} {`);
  assert.ok(at >= 0);
  assert.match(css.slice(at, css.indexOf('}', at + 40)), /margin-bottom: 32px;/);
});
