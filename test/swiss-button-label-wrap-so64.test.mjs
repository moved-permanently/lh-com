/* eslint-disable max-len */
/* SWISS button labels wrap (standing order 62, item 5; shipped in standing order 64): lh-com's buttons keep one line and
   cut a longer label with an ellipsis ("Gutschein-Bestellung widerrufen" on ch/de's vouchers page at 390); www's SWISS
   buttons wrap (swiss-parity-002b: ch/de baggage-irregularities at 390 draws "Weitere häufig gestellte Fragen zu
   verspätetem Gepäck" on two lines, 63 to 64 px high). With 6 px padding above and below a two-line button is 64 px; a
   label that fits stays one line, 50 px (the theme's min-height).
   Run: node --max-old-space-size=256 --test test/swiss-button-label-wrap-so64.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const css = read('styles/themes/swiss.css');

test('SWISS link buttons wrap their label instead of cutting it, 6 px padding above and below', () => {
  const m = css.match(/(?:^|\})\s*body\.brand-swiss a\.button:any-link \{([^}]*white-space[^}]*)\}/);
  assert.ok(m, 'rule found');
  assert.match(m[1], /white-space: normal;/);
  assert.match(m[1], /text-overflow: clip;/);
  assert.match(m[1], /padding-top: 6px;/);
  assert.match(m[1], /padding-bottom: 6px;/);
});

test('one-line buttons keep the theme\'s 50 px', () => {
  assert.match(css, /--button-min-height: 50px;/);
});

test('the rule is SWISS\'s only: no other brand gets it from this file', () => {
  assert.ok(!/body\.brand-(?!swiss)[a-z-]+ a\.button:any-link \{[^}]*white-space: normal/.test(css));
});
