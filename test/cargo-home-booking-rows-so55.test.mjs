/* eslint-disable max-len */
/* Standing order 55, item 2 (places 195 / 198): Lufthansa Cargo's homepage widget from 1025px in www's two rows
   (cargo-parity-001, en-home-1440.png: the rule at 705, the air waybill's underline at 775, the box's end at 808):
   "Create booking" alone over a 1px #ccc rule the box's width, the air waybill form 12px under it with the dashboard
   link after its button, the box 9px under the fields. Cargo's homepage widget only; phones and tablets as before.
   Run: node --test test/cargo-home-booking-rows-so55.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/booking-lookup/booking-lookup.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const B = 'body.brand-cargo main .cards-icon-wrapper:has(> .cards-icon.widget) + .booking-lookup-wrapper > .booking-lookup.tracking';
const wide = css.indexOf(`@media (width >= 1025px) { ${B} {`);
const body = (sel) => {
  const i = css.indexOf(`${sel} {`, wide);
  return i < 0 ? null : css.slice(i + sel.length + 2, css.indexOf('}', i)).trim();
};

test('from 1025px only', () => {
  assert.ok(wide > 0);
  assert.equal(css.split('.booking-lookup.tracking .booking-lookup-intro').length - 1, 3);
});

test('the panel in rows: Create booking over the rule, the form and the dashboard link after it', () => {
  assert.equal(body(B), 'padding-bottom: 9px;');
  assert.equal(body(`${B} > .booking-lookup-panel:not([hidden])`), 'display: flex; flex-wrap: wrap; align-items: flex-start; gap: 0 20px;');
  assert.equal(body(`${B} .booking-lookup-intro`), 'display: contents;');
  assert.equal(body(`${B} .booking-lookup-intro > p.button-wrapper`), 'box-sizing: border-box; flex: 0 0 calc(100% + 48px); margin: 0 -24px 12px; padding: 0 24px 31px; border-bottom: 1px solid #ccc;');
  assert.equal(body(`${B} .booking-lookup-intro > p.link-wrapper`), 'order: 1; margin: 17px 0 0;');
  assert.equal(body(`${B} .booking-lookup-tracking-form`), 'flex: 0 0 640px;');
});
