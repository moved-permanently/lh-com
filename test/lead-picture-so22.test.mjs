/* eslint-disable max-len */
/* Standing order 22 (2026-11-14), item 2: the lead picture after the page title and its intro paragraph is www's image
   component (img.w-100): the full content width, also when the stored file is smaller. Ours drew it at its stored size
   (climate-protection-projects 960 px of 1264: the page 113 px short at 1440). Census of the 9,912 published copies:
   55 pictures narrower than the column right after h1 + p or h1 + h2/h3 + p, all stored 900 px and wider
   (climate-protection-projects, most-significant-route and its versions, travel-expense-management); none of the narrow pictures (svg icons, fare-teaser tiles, which www does
   not stretch) sits there. tools/parity/gate.mjs (injected trial): climate-protection-projects 12.22 -> 4.01,
   travel-expense-management 10.62 -> 2.12, most-significant-route / bedeutsamste-strecken 10.3 / 10.7 -> 2.6 / 2.7 at
   1440, 390 and three article pages the same.
   Run: node --test test/lead-picture-so22.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8');

test('a lead picture after the title and its intro paragraph fills the content width (lufthansa.com)', () => {
  const at = css.indexOf('body.brand-lufthansa main .default-content-wrapper > h1 + p:not(:has(> picture)) + p:has(> picture:only-child) img,');
  assert.ok(at > 0, 'the rule');
  assert.match(css.slice(at, css.indexOf('}', at)), /width: 100%;/);
  assert.ok(css.indexOf('main .default-content-wrapper > h1 + p:has(> picture) img {') > 0, 'the picture right under the title as before');
  assert.ok(css.includes('body.brand-lufthansa main .default-content-wrapper > h1 + :is(h2, h3) + p:not(:has(> picture)) + p:has(> picture:only-child) img {'), 'after a subheading and a paragraph too');
});
