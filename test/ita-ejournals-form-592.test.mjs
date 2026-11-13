/* eslint-disable max-len */
/* ITA row 42 (standing order 9 of 2026-11-13, item 2: /it/en/book-and-prepare/travel-information/at-the-airport/
   digital-newsstand +2.9 % at both widths, ita-parity-005): www's eJournals download form has outlined fields 48 px
   high, the hint 12 px under the booking code field and none under the last name, and a login notice of 112 px with its
   link 19 px under the copy; ours, lufthansa.com's form, 58 px fields, a hint under each, a 94 px notice. The ITA theme
   sets the form as www's.
   Run: node --test test/ita-ejournals-form-592.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/ita.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const rule = (sel) => {
  const i = css.indexOf(`${sel} {`);
  assert.ok(i >= 0, `the rule ${sel}`);
  return css.slice(i, css.indexOf('}', i));
};

test('the fields 48 px high, the hint 12 px under its field', () => {
  assert.match(rule('body.brand-ita .ejournals'), /--ejournals-field-height: 48px;/);
  assert.match(rule('body.brand-ita .ejournals .ejournals-hint'), /margin-top: 12px;/);
});

test('no hint under the last name', () => {
  assert.match(rule('body.brand-ita .ejournals .ejournals-hint[id^="ejournals-lastName"]'), /display: none;/);
});

test('the login notice as www\'s: 28 px under the link, the link 19 px under the copy', () => {
  assert.match(rule('body.brand-ita .ejournals .ejournals-notice'), /padding-bottom: 28px;/);
  assert.match(rule('body.brand-ita .ejournals .ejournals-login'), /margin-top: 19px;/);
});
