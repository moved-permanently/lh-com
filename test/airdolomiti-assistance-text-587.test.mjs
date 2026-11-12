/* eslint-disable max-len */
/* Air Dolomiti's assistance text (standing order 4 of 2026-11-11, item 4, the ranking; AD row 112; airdolomiti-parity-001
   /assistenza, /en/assistance, /de/betreuung -2.4 to -5.1 %): www's two TitleDescriptionTextCta blocks (the title, its
   text and "Request assistance"; then the contacts) have row 88's foot: the button 79 px under the text from 930 px (45
   at 390), the next text 100 px under the button (the box's 90 px margin), the accordion 90 px under the contacts. Ours
   holds both in one text: 38, 24 and 37 px. The theme sets www's spaces in a text that starts with an H1 (the hubs'
   rule set): the button over and under it, the space before an accordion.
   Run: node --test test/airdolomiti-assistance-text-587.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const T = 'body.brand-airdolomiti main .default-content-wrapper:has(> h1 ~ p ~ p)';
const all = (sel) => {
  const out = [];
  let i = css.indexOf(`${sel} {`);
  while (i >= 0) {
    out.push(css.slice(i, css.indexOf('}', i)));
    i = css.indexOf(`${sel} {`, i + 1);
  }
  return out;
};

test('the button 43 px under the text, 79 from 930 px', () => {
  const [base, wide] = all(`${T} > p.button-wrapper`);
  assert.match(base, /margin-top: 43px;/);
  assert.match(wide, /margin-top: 79px;/);
  assert.ok(css.lastIndexOf('@media (width >= 930px)', css.indexOf(wide)) > css.indexOf(base), 'the 79 px from 930 px');
});

test('the text going on 100 px under the button', () => {
  assert.match(all(`${T} > p.button-wrapper:not(:last-child)`)[0], /margin-bottom: 100px;/);
});

test('an accordion 90 px under the text', () => {
  assert.match(all(`${T}:has(+ .accordion-columns-wrapper)`)[0], /margin-bottom: 90px;/);
});
