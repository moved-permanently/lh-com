/* eslint-disable max-len */
/* Brussels (ema-lufthansa, standing order 23 of 2026-11-15, item 2): below 768 px a striped table in a tab panel as www's
   phone table: its cells 200 px wide (the table scrolls sideways), the header type 20 px. Gated on brussels-parity-011
   (phone first loads, loadedSeparately) of the six checked-baggage languages: be/en 5643 -> 5364 (www 4720), be/fr 5919
   -> 5616 (5131), be/nl 5801 -> 5544 (4902), de/de 5849 -> 5524 (4969), es/es 5818 -> 5515 (4919), it/it 5746 -> 5467
   (4914): closer on all six; student-fares (its table in a tab panel too) 7736 unchanged (www 7722); star-alliance's table
   is not in a tab panel, untouched; 1440 unchanged. Run: node --test test/brussels-phone-tables-600.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const T = 'body.brand-brussels main > .section.section-tab-panel .table-striped';

const inPhone = (sel) => {
  const q = css.indexOf(`@media (width < 768px) { ${T} table {`);
  assert.ok(q >= 0, 'below 768 px');
  const i = css.indexOf(`${sel} {`, q);
  assert.ok(i >= 0, sel);
  assert.equal(css.split(`${sel} {`).length - 1, 1, `${sel}: once`);
  return css.slice(i, css.indexOf('}', i));
};

test('below 768 px a tab panel\'s striped table as wide as its 200 px cells, at least the panel', () => {
  const t = inPhone(`${T} table`);
  assert.match(t, /table-layout: auto;/);
  assert.match(t, /width: max-content;/);
  assert.match(t, /min-width: 100%;/);
  const c = inPhone(`${T} :is(th, td)`);
  ['width', 'min-width', 'max-width'].forEach((p) => assert.match(c, new RegExp(`(^|[ {;])${p}: 200px;`)));
});

test('its header cells in www\'s 20 px type', () => {
  const h = inPhone(`${T} th`);
  assert.match(h, /font-size: 20px;/);
  assert.match(h, /line-height: 1\.1;/);
});
