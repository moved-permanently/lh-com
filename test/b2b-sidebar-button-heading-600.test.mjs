/* eslint-disable max-len */
/* Group for Business (ema-lufthansa, standing order 23 of 2026-11-15, item 1): a sidebar Columns Media whose text ends with
   a button, then a heading that opens a column view (token-free's column-start-outer mark): www keeps about 43 px from the
   button to the heading (/de/en/travel-solutions/lufthansa-group-wifi, b2b-parity-007's screenshot), ours 118 (the mark's
   40 px and the heading's 32). After text (route-network, both languages) www keeps about 90, so only the button shape:
   no mark padding, no heading margin. Census: of the 102 recorded B2B pages three have a sidebar before a marked heading,
   only wifi's ends with a button. 1440 4629 -> 4557 (www 4476, +3.42 -> +1.81 %), 390 6615 -> 6563 (www 6532, +1.27 ->
   +0.47 %); route-network de/de and de/en unchanged. Run: node --test test/b2b-sidebar-button-heading-600.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/b2b.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const AFTER = 'body.brand-b2b main .columns-media-wrapper:has(> .columns-media.sidebar > div > div:first-child > p.button-wrapper:last-child) + .default-content-wrapper > p.column-mark.column-start-outer:first-child';

const body = (sel) => {
  const i = css.indexOf(`${sel} {`);
  assert.ok(i >= 0, sel);
  assert.equal(css.split(`${sel} {`).length - 1, 1, `${sel}: once`);
  return css.slice(i, css.indexOf('}', i));
};

test('after a sidebar that ends with a button: the mark without padding, the heading without margin', () => {
  assert.match(body(`${AFTER}:has(+ :is(h2, h3, h4))`), /padding-top: 0;/);
  assert.match(body(`${AFTER} + :is(h2, h3, h4)`), /margin-top: 0;/);
});

test('only the button shape: no rule for a sidebar ending with text', () => {
  assert.equal(css.split('.columns-media-wrapper:has(> .columns-media.sidebar)').length - 1, 0);
});
