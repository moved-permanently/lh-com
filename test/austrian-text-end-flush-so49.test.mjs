/* eslint-disable max-len */
/* Standing order 49, item 3: a page whose last AEM section ends with text. www keeps its last paragraph's 24 px to the
   footer (cn/en tarmac-delay-contingency-plan, austrian-parity-003 at 390 and 1440); ours kept the 48 px section gap.
   Opt-in by the section's style "flush", as the padded columns-media end of order 26: of the 2,459 served Austrian
   documents none had a flush last section ending with default content, and 707 end with default content without it
   (their 48 px stay).
   Run: node --max-old-space-size=256 --test test/austrian-text-end-flush-so49.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('a flush last section that ends with default content: 24 px below it (Austrian)', () => {
  assert.ok(css.includes('body.brand-austrian main > .section.flush:last-child:not(.grey):has(> .default-content-wrapper:last-child) { margin-bottom: 24px; }'));
});

test('no shorter end without flush (the 707 documents that end with text keep the section gap)', () => {
  assert.ok(!css.includes('body.brand-austrian main > .section:last-child:has(> .default-content-wrapper:last-child) {'));
  assert.ok(!css.includes('body.brand-austrian main > .section:last-child:not(.grey):has(> .default-content-wrapper:last-child) {'));
});
