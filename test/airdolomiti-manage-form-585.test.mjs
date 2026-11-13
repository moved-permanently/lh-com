/* eslint-disable max-len */
/* Air Dolomiti's manage-booking form (the standing order of the night of 2026-11-10, item e; AD row 104;
   airdolomiti-parity-001 /gestione-prenotazione-volo at 1440 and 390): www's FormPnr box is 396 px high, padded 50 px over
   and under; its labels 17.28 / 24 px, 8 px over their fields, the fields 20 px apart, the button 4 px further in. Ours
   was 414 px (54 px padding, 16 / 27.2 labels 10 px over the fields, 24 px apart). The Air Dolomiti theme sets www's
   rhythm; the block's own rules (and other brands) unchanged.
   Run: node --test test/airdolomiti-manage-form-585.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const rule = (sel) => {
  const i = css.indexOf(`${sel} {`);
  assert.ok(i >= 0, `the rule ${sel}`);
  return css.slice(i, css.indexOf('}', i));
};
const P = 'body.brand-airdolomiti .manage-booking';

test('the box padded 50 px over and under, its rows 20 px apart', () => {
  const r = rule(`${P} .manage-booking-form`);
  assert.match(r, /gap: 20px;/);
  assert.match(r, /padding-block: 50px;/);
});

test('a label 17.28 / 24 px, 8 px over its field', () => {
  assert.match(rule(`${P} .manage-booking-field`), /gap: 8px;/);
  const r = rule(`${P} .manage-booking-field label`);
  assert.match(r, /font-size: 17\.28px;/);
  assert.match(r, /line-height: 24px;/);
});

test('the button 4 px in over and under', () => {
  assert.match(rule(`${P} .manage-booking-submit`), /margin-block: 4px;/);
});
