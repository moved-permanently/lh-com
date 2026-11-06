/* eslint-disable max-len */
/* The form block's required choice groups (blocks/form/form.js renderChoiceGroup), the 2026-11-06
   accessibility pass (axe aria-allowed-attr, critical, on /de/en/special-needs, feedback-past-flight,
   refund-form, anmeldung-tiere-frachtraum): a required checkbox group is a fieldset (role group),
   where aria-required is not allowed; it had aria-required="true". Now only the radio group
   (role radiogroup, where it is allowed) carries it; the checkbox group keeps data-required (the
   block's own check) and its legend's required marker.
   Run: node --max-old-space-size=512 --test test/form-required-groups.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
globalThis.window = window;
window.location = {
  hostname: 'lufthansa.turnsthe.page', pathname: '/de/en/feedback-past-flight', search: '', hash: '', origin: 'https://lufthansa.turnsthe.page', href: 'https://lufthansa.turnsthe.page/de/en/feedback-past-flight',
};
window.origin = 'https://lufthansa.turnsthe.page';
globalThis.Event = window.Event;
globalThis.CSS = { escape: (v) => String(v) };
const F = await import('../blocks/form/form.js');

const row = (cells) => `<div>${cells.map((c) => `<div>${c}</div>`).join('')}</div>`;
const lines = (...l) => l.map((x) => `<p>${x}</p>`).join('');
const TABLE = [
  ['Label', 'Type', 'Name', 'Required', 'Options', 'Help text', 'Placeholder', 'Validation message', 'Constraint message', 'Rules'],
  ['I agree to the processing of my data', 'checkbox', 'consent', 'yes', lines('yes=I agree'), '', '', 'Please agree', '', ''],
  ['Salutation', 'radio', 'salutation', 'yes', lines('mr=Mr', 'ms=Ms'), '', '', 'Please choose', '', ''],
  ['Newsletter', 'checkbox', 'newsletter', '', lines('yes=Send me news'), '', '', '', '', ''],
  ['Submit', 'submit', '', '', '', '', '', '', '', ''],
].map(row).join('');

function form() {
  globalThis.fetch = async () => new Response('{}', { status: 404 });
  const { document } = parseHTML(`<!DOCTYPE html><html><head></head><body><div class="form core">${TABLE}</div></body></html>`);
  globalThis.document = document;
  const block = document.querySelector('.form');
  F.default(block);
  return block;
}

test('a required checkbox group: no aria-required on its fieldset, data-required kept', () => {
  const b = form();
  const consent = b.querySelector('fieldset.form-group-checkbox:has([name="consent"])') || b.querySelector('[name="consent"]').closest('fieldset');
  assert.equal(consent.getAttribute('aria-required'), null);
  assert.equal(consent.dataset.required, 'true');
});

test('a required radio group keeps aria-required on its radiogroup; an optional group has none', () => {
  const b = form();
  const salutation = b.querySelector('[name="salutation"]').closest('fieldset');
  assert.equal(salutation.getAttribute('role'), 'radiogroup');
  assert.equal(salutation.getAttribute('aria-required'), 'true');
  assert.equal(b.querySelector('[name="newsletter"]').closest('fieldset').getAttribute('aria-required'), null);
});
