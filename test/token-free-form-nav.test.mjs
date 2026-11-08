/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The brief after 488, item 4 (token-free styling, step 1): the form table's Default column instead of "{selected}" and
   the nav tools' role column instead of "{cart}" (scripts/style-markers.js isDefaultChoice, readNavRole; blocks/form,
   blocks/header). A marker still wins.
   Run: node --max-old-space-size=256 --test test/token-free-form-nav.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import { parseOptionLines, readHeaderTexts, COLUMNS } from '../blocks/form/form-rules.js';

const read = (f) => fs.readFileSync(new URL(f, import.meta.url), 'utf8');

test('the form table: a Default column (any order), after the ten columns when there is no header row', () => {
  const map = readHeaderTexts(['Label', 'Type', 'Options', 'Default']);
  assert.equal(map.default, 3);
  assert.equal(readHeaderTexts(['Bezeichnung', 'Typ', 'Vorauswahl']).default, 2);
  assert.equal(COLUMNS.indexOf('default'), 10);
});

test('Default picks options by value or label; one for a select or radio group, each for a checkbox group', () => {
  const opts = ['mr=Mr', 'ms=Ms', 'Diverse'];
  assert.deepEqual(parseOptionLines(opts, ['Ms']).map((o) => o.selected), [false, true, false]);
  assert.deepEqual(parseOptionLines(opts, ['mr']).map((o) => o.selected), [true, false, false]);
  assert.deepEqual(parseOptionLines(opts, ['Mr', 'Diverse']).map((o) => o.selected), [true, false, false], 'one choice');
  assert.deepEqual(parseOptionLines(opts, ['Mr', 'Diverse'], true).map((o) => o.selected), [true, false, true], 'a checkbox group');
  assert.deepEqual(parseOptionLines(['mr=Mr', 'ms=Ms {selected}'], ['Mr']).map((o) => o.selected), [false, true], 'the marker wins');
  assert.deepEqual(parseOptionLines(opts).map((o) => o.selected), [false, false, false], 'as before without one');
});

test('form.js reads the column and checks a single checkbox by it', () => {
  const js = read('../blocks/form/form.js').replace(/\s+/g, ' ');
  assert.match(js, /defaults: cellLines\(cell\('default'\)\),/);
  assert.match(js, /return parseOptionLines\(row\.optionLines \|\| \[\], row\.defaults \|\| \[\], row\.type === 'checkbox'\);/);
  assert.match(js, /if \(isCheckedDefault\(row\.defaults \|\| \[\]\)\) \{ control\.checked = true; control\.defaultChecked = true; \}/);
});

test('the nav tools: a role column (data-role from scripts/token-free.js), the marker first', async () => {
  const { document } = parseHTML('<ul><li data-role="cart"><a href="/cart">Your Cart</a></li><li data-role="cart"><a href="/x">Login {login}</a></li><li><a href="/help">Help</a></li></ul>');
  globalThis.document = document;
  const { takeRole, tableRole, ROLE_MARKERS } = await import('../blocks/header/header-tools.js');
  const [a, b, c] = document.querySelectorAll('li');
  assert.equal(takeRole(a) || tableRole(a), 'cart');
  assert.equal(takeRole(b) || tableRole(b), 'login', 'the marker wins');
  assert.equal(takeRole(c) || tableRole(c), null);
  assert.ok(ROLE_MARKERS.includes('notifications'));
  const header = read('../blocks/header/header.js').replace(/\s+/g, ' ');
  assert.match(header, /const marker = takeRole\(li\) \|\| tableRole\(li\);/);
});
