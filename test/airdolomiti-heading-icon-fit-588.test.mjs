/* eslint-disable max-len */
/* Air Dolomiti's carousel titles with their icon on phones (standing order 5 of 2026-11-12, item 3; AD row 115;
   /de/reiseziele/london at 390: the page 401 px wide in a 390 px screen): the title "Sehenswürdigekeiten" (www's spelling)
   is one word filling the column (339 px at 34 px), and the icon goes 10 px after it (row 84), past the screen. www's own
   flex row does the same with that word (its page 399 px wide, measured on the Bari recording with London's word), but a
   page wider than the phone scrolls sideways (WCAG 1.4.10). The title now leaves the icon 45 px within the screen (its 10 px and an icon up to 35 px wide) (the
   column and the page margin, as www's Bari "Sehenswürdigkeiten" with its icon at 349-379); an over-long word then
   hyphenates by styles.css's heading rule (phones, the page's language); a title that fits, as before.
   Run: node --test test/airdolomiti-heading-icon-fit-588.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const H2 = 'body.brand-airdolomiti main > .section.heading-icon:has(> .carousel-cards-wrapper > .carousel-cards:not(.promo, .destinations)) > .default-content-wrapper:first-child > h2 {';

test('the carousel title leaves the icon its 45 px (10 and the icon up to 35) and hyphenates a word too long for the rest', () => {
  const i = css.indexOf(H2);
  assert.ok(i > 0, 'the title rule');
  const rule = css.slice(i, css.indexOf('}', i));
  assert.match(rule, /width: fit-content;/, 'a title that fits as before');
  assert.match(rule, /max-width: calc\(100% \+ var\(--layout-margin\) - 45px\);/, 'the icon may use the page margin, not more (www\'s Bari title keeps its line)');
  assert.doesNotMatch(rule, /hyphens/, 'styles.css\'s heading rule hyphenates (test/heading-wrap.test.mjs: no theme sets it)');
});

test('the icon 10 px after the title, 30 px high (row 84)', () => {
  const i = css.indexOf(H2.replace(' {', ' .heading-icon-image {'));
  assert.match(css.slice(i, css.indexOf('}', i)), /margin: 0 0 0 10px;/);
});
