/* eslint-disable max-len, import/extensions */
/* TAP, brief 368 (tools/reports/tap/parity.md rows 42, 63 to 68, 79):
   - row 64, Miles&Go's picture and accordion: the section clears the floated picture with a
     selector the browser keeps (no :has() inside :has());
   - row 79, the airport list: www's matcher (the booking widget's, _app chunk: the rules and weights
     in its order, ties by "city, city" as plain strings, the term not trimmed) and, on focus with
     an airport chosen, its list for the airport's code (www: Lisboa, Portugal lists LIS, FLN, IND);
     the list as wide as its field at 1440;
   Run: node --max-old-space-size=512 --test test/tap-368.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/tap.css', import.meta.url), 'utf8');

test('no selector of the theme nests :has() inside :has() (the browser drops the whole rule)', () => {
  const nested = css.split('\n').filter((l) => /:has\([^)]*:has\(/.test(l));
  assert.deepEqual(nested, []);
});

test('row 64: the section clears the floated picture', () => {
  assert.match(css, /body\.brand-tap main > \.section:has\(> \.default-content-wrapper > p:last-child > picture\):has\(> \.accordion-columns-wrapper > \.accordion-columns\.faq\)::after \{\s*content: "";\s*display: block;\s*clear: both;/);
});

const match = await import('../blocks/booking-box/airport-match.js');
const A = (code, cityName, airportName, country, countryName) => ({
  code, city: code, cityName, airportName, country, countryName, tapRoute: false, railway: false,
});
const LIST = [
  A('FNC', 'Funchal', 'Madeira', 'PT', 'Portugal'), A('FLN', 'Florianópolis', 'Hercílio Luz International Airport', 'BR', 'Brasil'),
  A('IND', 'Indianápolis', 'Indianapolis Intl', 'US', 'Estados Unidos'), A('IXM', 'Madurai', 'Madurai Airport', 'IN', 'Índia'),
  A('LIS', 'Lisboa', 'Lisboa', 'PT', 'Portugal'), A('MAA', 'Chennai', 'Madras', 'IN', 'Índia'),
  A('MAD', 'Madrid', 'Adolfo Suarez-Barajas', 'ES', 'Espanha'), A('MSN', 'Madison', 'Dane County Regional Airport', 'US', 'Estados Unidos'),
  A('OPO', 'Porto', 'Francisco Sá Carneiro', 'PT', 'Portugal'), A('TNR', 'Antananarivo', 'Ivato International Airport', 'MG', 'Madagáscar'),
];

test('row 79: www\'s matcher, as its origin list answers (www.flytap.com/pt-pt, 2026-11-05)', () => {
  assert.deepEqual(match.matchAirports(LIST, 'Mad').map((a) => a.code), ['MAD', 'MSN', 'IXM', 'MAA', 'FNC', 'TNR']);
  assert.deepEqual(match.matchAirports(LIST, 'lis').map((a) => a.code), ['LIS', 'FLN', 'IND']);
  assert.deepEqual(match.matchAirports(LIST, 'Lisboa, Portugal').map((a) => a.code), ['LIS']);
  assert.equal(match.scoreAirport(LIST[4], 'lis'), 0.79, 'the code before the airport\'s name');
  assert.equal(match.scoreAirport(LIST[8], 'sa carneiro'), 0.75, 'a phrase at the end of the airport\'s name');
  assert.equal(match.scoreAirport(LIST[1], 'florianópolis, brasil'), 0, 'www folds the term, not "city, country": a typed accent there finds nothing, as on www');
  assert.equal(match.scoreAirport(LIST[1], 'florianópolis'), 0.8);
});

test('row 79: on focus with an airport chosen, the list for its code', () => {
  const lis = LIST[4];
  assert.equal(match.searchTerm('Lisboa, Portugal', lis), 'LIS');
  assert.equal(match.searchTerm('Lisb', lis), 'Lisb');
  assert.equal(match.searchTerm('Lisboa, Portugal', null), 'Lisboa, Portugal');
});

test('row 79: the airport list as wide as its field at 1440', () => {
  const box = fs.readFileSync(new URL('../blocks/booking-box/booking-box.css', import.meta.url), 'utf8');
  assert.equal(/max\(100%, 380px\)/.test(box), false);
  assert.match(box, /@media \(width >= 1024px\) \{[^@]*\.booking-box \.airport-combobox \[role='listbox'\] \{\s*width: 100%;/);
});
