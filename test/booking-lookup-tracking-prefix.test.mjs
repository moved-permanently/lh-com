/* Lufthansa Cargo's tracking form (blocks/booking-lookup, variant "tracking"), as
   www.lufthansa-cargo.com's homepage: the air waybill prefix prefilled with the block's
   Default prefix row ("020", Lufthansa Cargo's code; www's etrk_awbp value="020"), prefix and
   number side by side from 768px (stacked on phones). Without the row the prefix is empty, as
   before; a row that isn't 3 digits is ignored. The other booking-lookup forms as they are.
   Run: node --max-old-space-size=512 --test test/booking-lookup-tracking-prefix.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.location = {
  hostname: 'cargo.turnsthe.page', pathname: '/en/home', search: '', href: 'https://cargo.turnsthe.page/en/home', origin: 'https://cargo.turnsthe.page', assign: (u) => { window.location.assigned = u; },
};
globalThis.window = window;
globalThis.document = document;
const { default: decorate } = await import('../blocks/booking-lookup/booking-lookup.js');

const blockOf = (rows, cls) => {
  const block = document.createElement('div');
  block.className = `booking-lookup${cls ? ` ${cls}` : ''}`;
  block.innerHTML = rows.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('');
  document.body.replaceChildren(block);
  document.head.innerHTML = '<meta name="brand" content="cargo"><meta name="language" content="en">';
  return block;
};

test('Default prefix: the prefix field prefilled; the number alone hands off with it', () => {
  const block = blockOf([['Tab', 'Track your shipment'], ['Default prefix', '020']], 'tracking');
  decorate(block);
  const [prefix, serial] = block.querySelectorAll('input');
  assert.equal(prefix.value, '020');
  serial.value = '12345678';
  window.location.assigned = undefined;
  block.querySelector('form').dispatchEvent(new window.Event('submit', { cancelable: true }));
  assert.match(window.location.assigned, /etrk_awbp=020&etrk_awbs=12345678$/);
});

test('without the row an empty prefix, as before; a row that isn\'t 3 digits is ignored', () => {
  const plain = blockOf([['Tab', 'Track your shipment']], 'tracking');
  decorate(plain);
  assert.equal(plain.querySelector('input').value, '');
  const wrong = blockOf([['Tab', 'Track your shipment'], ['Default prefix', 'LH']], 'tracking');
  decorate(wrong);
  assert.equal(wrong.querySelector('input').value, '');
});

test('the other booking-lookup forms: no prefix row read, fields as before', () => {
  const block = blockOf([['Tab', 'Check-in'], ['Default prefix', '020']]);
  decorate(block);
  assert.deepEqual([...block.querySelectorAll('input')].map((i) => [i.name, i.value]), [['reference', ''], ['firstName', ''], ['lastName', '']]);
});

test('booking-lookup.css: prefix and number side by side from 768px, for the tracking variant only', () => {
  const css = fs.readFileSync('blocks/booking-lookup/booking-lookup.css', 'utf8');
  const wide = css.match(/@media \(width >= 768px\) \{\s*\.booking-lookup\.tracking \.booking-lookup-tracking-form \{([^}]*)\}/);
  assert.ok(wide, 'a rule for the tracking form from 768px');
  assert.match(wide[1], /flex-flow: row wrap;/);
  assert.match(css, /\.booking-lookup\.tracking \.booking-lookup-tracking-form \.booking-lookup-field:first-child \{[^}]*max-width: 120px;/);
  // the default form rule as before
  assert.match(css, /\.booking-lookup \.booking-lookup-form \{\n {2}display: flex;\n {2}flex-direction: column;\n {2}align-items: flex-start;\n\}/);
});
