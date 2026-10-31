/* eslint-disable max-len */
/* Lufthansa Cargo's shipment tracking (blocks/booking-lookup, variant "tracking"): no name fields,
   the air waybill in two parts, {PREFIX} (3 digits) and {SERIAL} (8 digits), the target
   https://www.lufthansa-cargo.com/{lang}/eservices/etracking/tracking/-/awb?etrk_awbp={PREFIX}&etrk_awbs={SERIAL}
   (opens without login); a full number pasted into the prefix field fills both. The booking
   lookup without the class as before.
   Run: node --max-old-space-size=512 --test test/booking-lookup-tracking.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.location = {
  hostname: 'cargo.turnsthe.page', pathname: '/en/home', search: '', href: 'https://cargo.turnsthe.page/en/home', origin: 'https://cargo.turnsthe.page', assign: (u) => { window.location.assigned = u; },
};
globalThis.window = window;
globalThis.document = document;
const { buildTrackingUrl, splitAwb, default: decorate } = await import('../blocks/booking-lookup/booking-lookup.js');

test('buildTrackingUrl: the Cargo default, {lang} lower case; an authored pattern', () => {
  assert.equal(
    buildTrackingUrl({ prefix: '020', serial: '12345678' }, { lang: 'de', country: 'de' }),
    'https://www.lufthansa-cargo.com/de/eservices/etracking/tracking/-/awb?etrk_awbp=020&etrk_awbs=12345678',
  );
  assert.equal(
    buildTrackingUrl({ prefix: '020', serial: '12345678' }, { lang: 'en', country: 'de' }, 'https://example.com/{LANG}/t?p={PREFIX}&s={SERIAL}&c={COUNTRY}'),
    'https://example.com/EN/t?p=020&s=12345678&c=DE',
  );
});

test('splitAwb: "020-12345678", "020 1234 5678", "02012345678"; anything else not', () => {
  assert.deepEqual(splitAwb('020-12345678'), { prefix: '020', serial: '12345678' });
  assert.deepEqual(splitAwb(' 020 1234 5678 '), { prefix: '020', serial: '12345678' });
  assert.deepEqual(splitAwb('02012345678'), { prefix: '020', serial: '12345678' });
  assert.equal(splitAwb('020'), null);
  assert.equal(splitAwb('ABC-12345678'), null);
});

const blockOf = (rows, cls) => {
  const block = document.createElement('div');
  block.className = `booking-lookup${cls ? ` ${cls}` : ''}`;
  block.innerHTML = rows.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('');
  document.body.replaceChildren(block);
  return block;
};

test('the tracking variant: two fields, no names; validation; the handoff', () => {
  // a Cargo page: its brand and language metadata
  document.head.innerHTML = '<meta name="brand" content="cargo"><meta name="language" content="en">';
  const block = blockOf([['Tab', 'Track your shipment']], 'tracking');
  decorate(block);
  const inputs = [...block.querySelectorAll('input')];
  assert.deepEqual(inputs.map((i) => i.name), ['prefix', 'serial']);
  assert.deepEqual(inputs.map((i) => i.maxLength), [3, 8]);
  assert.equal(inputs[0].getAttribute('inputmode'), 'numeric');
  const form = block.querySelector('form');
  inputs[0].value = '02';
  inputs[1].value = '1234567';
  form.dispatchEvent(new window.Event('submit', { cancelable: true }));
  assert.equal(window.location.assigned, undefined, 'invalid: no handoff');
  assert.equal(block.querySelectorAll('[aria-invalid="true"]').length, 2);
  inputs[0].value = '020';
  inputs[1].value = '12345678';
  form.dispatchEvent(new window.Event('submit', { cancelable: true }));
  assert.match(window.location.assigned, /^https:\/\/www\.lufthansa-cargo\.com\/en\/eservices\/etracking\/tracking\/-\/awb\?etrk_awbp=020&etrk_awbs=12345678$/);
});

test('the booking lookup without the class: reference and both names, as before', () => {
  const block = blockOf([['Tab', 'Check-in']]);
  decorate(block);
  assert.deepEqual([...block.querySelectorAll('input')].map((i) => i.name), ['reference', 'firstName', 'lastName']);
});
