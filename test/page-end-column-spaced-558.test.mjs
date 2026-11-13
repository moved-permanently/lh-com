/* eslint-disable max-len */
/* lufthansa.com: a page whose content ends with a column view marked column-spaced ({column-end column-spaced}), when
   only empty sections follow (DA's trailing <div></div>; brief 558 item 4, /<root>/lounges on de/en, de/de, at/de,
   gb/en, the only recorded pages so): the page-end rules looked for the last section and so missed it; the section
   kept its 48 px gap and the empty one its own: www's footer 64 px of ink under the last link at 390 and 1440, ours
   87 / 88. Such a section takes the column-spaced 24 px, the empty sections after it no margin. Plain column ends
   before empty sections (most-significant-route: 6.0 -> 9.0 % with the page-end 0 px) as before.
   Run: node --max-old-space-size=256 --test test/page-end-column-spaced-558.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('the column-spaced end before empty sections only: 24 px; the empty sections: no margin', () => {
  assert.ok(css.includes('body.brand-lufthansa main > .section:not(.grey, :empty, :last-child, :has(~ .section:not(:empty))):has(> .default-content-wrapper:last-child > .column-spaced:last-child) { margin-bottom: var(--spacing-default); }'));
  assert.ok(css.includes('body.brand-lufthansa main > .section:has(> .default-content-wrapper:last-child > .column-spaced:last-child) ~ .section:empty { margin: 0; }'));
});
