/* eslint-disable max-len, import/extensions */
/* SWISS's online check-in (brief 445, item 2), as www has it (swiss-parity-002 ch/de, all 11
   languages alike):
   - the form: booking code / ticket no. (13 characters), first name and last name with www's hints
     under them (maui-input hint), no tour operator checkbox: blocks/booking-lookup my-bookings with
     the option checkin, its rows First name label, First name hint, First name error, Last name
     hint; swiss-import.mjs withCheckinFields writes them from the snapshot's check-in form;
   - "So funktioniert es" (an accordion in the sidebar's content, its item authored expanded): an
     accordion-columns block with the option open-first, where lh-com's import wrote its texts
     (swiss-sidebar.mjs withSwissAccordions).
   Run: node --max-old-space-size=512 --test test/swiss-checkin-445.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.location = {
  hostname: 'example.turnsthe.page', pathname: '/ch/de/fly/check-in/online-check-in', search: '', href: 'https://example.turnsthe.page/ch/de/fly/check-in/online-check-in', origin: 'https://example.turnsthe.page', assign: (u) => { window.location.assigned = u; },
};
globalThis.window = window;
globalThis.document = document;
const { default: decorate } = await import('../blocks/booking-lookup/booking-lookup.js');
const { withCheckinFields } = await import('../tools/importer/swiss-import.mjs');
const { withSwissAccordions } = await import('../tools/importer/swiss-sidebar.mjs');

const row = (k, v) => `<div><div>${k}</div><div>${v}</div></div>`;
const block = (cls, rows) => {
  document.head.innerHTML = '<meta name="brand" content="swiss">';
  const b = document.createElement('div');
  b.className = cls;
  b.innerHTML = rows;
  document.body.replaceChildren(b);
  decorate(b);
  return b;
};
const CHECKIN_ROWS = row('Tab', 'Check-in') + row('Reference label', 'Buchungscode / Ticketnr.') + row('Reference pattern', '^([A-Z0-9]{6}|\\d{13})$')
  + row('First name label', 'Vorname (wie in Buchung)') + row('First name hint', 'Bitte geben Sie Ihren Vornamen so ein, wie er in Ihrer Buchungsbestätigung angezeigt wird.') + row('First name error', 'Bitte geben Sie Ihren Vornamen ein')
  + row('Last name label', 'Nachname (wie in Buchung)') + row('Last name hint', 'Bitte geben Sie Ihren Nachnamen so ein, wie er in Ihrer Buchungsbestätigung angezeigt wird.') + row('Last name error', 'Bitte geben Sie Ihren Nachnamen ein')
  + row('Submit label', 'Check-in');

test('my-bookings checkin: booking code (13), first name, last name with their hints; no tour operator checkbox', () => {
  const b = block('booking-lookup my-bookings checkin', CHECKIN_ROWS);
  const inputs = [...b.querySelectorAll('.booking-lookup-fields:not([hidden]) input')];
  assert.deepEqual(inputs.map((i) => i.name), ['reference', 'firstName', 'lastName']);
  assert.equal(inputs[0].maxLength, 13);
  assert.deepEqual(inputs.map((i) => i.placeholder), ['Buchungscode / Ticketnr.', 'Vorname (wie in Buchung)', 'Nachname (wie in Buchung)']);
  const hints = inputs.map((i) => i.closest('.booking-lookup-field').querySelector('.booking-lookup-hint'));
  assert.equal(hints[0], null, 'www\'s booking code field has no hint');
  assert.match(hints[1].textContent, /^Bitte geben Sie Ihren Vornamen so ein/);
  assert.match(hints[2].textContent, /^Bitte geben Sie Ihren Nachnamen so ein/);
  assert.equal(inputs[1].getAttribute('aria-describedby'), hints[1].id, 'the hint describes its field');
  assert.equal(b.querySelector('input[type="checkbox"]'), null);
  assert.equal(b.querySelector('.booking-lookup-checkbox'), null);
});

test('my-bookings checkin: the first name is checked; an error keeps the hint in the field\'s description; a valid search opens the page on www', () => {
  const b = block('booking-lookup my-bookings checkin', CHECKIN_ROWS);
  const form = b.querySelector('form');
  b.querySelector('input[name="reference"]').value = '1234567890123';
  b.querySelector('input[name="lastName"]').value = 'Muster';
  form.dispatchEvent(new window.Event('submit', { cancelable: true }));
  const first = b.querySelector('input[name="firstName"]');
  assert.equal(first.getAttribute('aria-invalid'), 'true');
  const err = first.closest('.booking-lookup-field').querySelector('.booking-lookup-error');
  assert.equal(err.textContent, 'Bitte geben Sie Ihren Vornamen ein');
  assert.deepEqual(first.getAttribute('aria-describedby').split(' ').sort(), [err.id, `${first.id}-hint`].sort());
  assert.equal(b.querySelector('input[name="reference"]').getAttribute('aria-invalid'), null, 'a 13-digit ticket number is valid');
  first.value = 'Anna';
  first.dispatchEvent(new window.Event('input'));
  assert.equal(first.getAttribute('aria-describedby'), `${first.id}-hint`, 'valid again: the hint alone');
  form.dispatchEvent(new window.Event('submit', { cancelable: true }));
  assert.equal(window.location.assigned, 'https://www.swiss.com/ch/de/fly/check-in/online-check-in');
});

test('my-bookings without checkin: as before (booking code of 6, last name, the tour operator checkbox)', () => {
  const b = block('booking-lookup my-bookings', row('Tab', 'My bookings'));
  const inputs = [...b.querySelectorAll('.booking-lookup-fields:not([hidden]) input')];
  assert.deepEqual(inputs.map((i) => i.name), ['reference', 'lastName']);
  assert.equal(inputs[0].maxLength, 6);
  assert.ok(b.querySelector('.booking-lookup-checkbox input[type="checkbox"]'));
  assert.equal(b.querySelector('.booking-lookup-fields:not([hidden]) .booking-lookup-hint'), null);
  assert.equal(inputs[1].getAttribute('aria-describedby'), null);
});

// www's check-in form (swiss-parity-002 ch/de, trimmed)
const input = (label, extra) => `<div class="input-maui input"><maui-input label="${label}" placeholder="${label}" required="" ${extra} theme="lx"></maui-input></div>`;
const SNAP = '<html><body><div class="checkinpassengerreceiptentry"><form novalidate="">'
  + input('Buchungscode / Ticketnr.', 'maxlength="13" id="x-flm-checkin-fktnCheckinRequest-fileKey" errormessage="Bitte geben Sie Ihren Buchungscode ein"')
  + input('Vorname (wie in Buchung)', 'maxlength="26" id="x-flm-checkin-fktnCheckinRequest-firstName" hint="Bitte geben Sie Ihren Vornamen so ein, wie er in Ihrer Buchungsbestätigung angezeigt wird." errormessage="Bitte geben Sie Ihren Vornamen ein"')
  + input('Nachname (wie in Buchung)', 'maxlength="31" id="x-flm-checkin-fktnCheckinRequest-lastName" hint="Bitte geben Sie Ihren Nachnamen so ein, wie er in Ihrer Buchungsbestätigung angezeigt wird. Bei Umlauten wie Ä, Ö, Ü bitte ae, oe, ue schreiben. " errormessage="Bitte geben Sie Ihren Nachnamen ein"')
  + '</form></div>'
  + '<div class="airem-sidebar"><div class="sidebar-content"><h2>Automatisches Check-in</h2><maui-collapsible><div class="accordionitem"><maui-collapsible-item headline="So funktioniert es" expanded=""><div><div class="richtext"><p>Beim automatischen Check-in erhalten Sie Ihre Bordkarte automatisch per E-Mail.</p></div><h3>Zusätzliche Fluggastdaten</h3><div class="richtext"><p>Einige Länder verlangen zusätzliche Daten.</p></div></div></maui-collapsible-item></div></maui-collapsible></div><div class="sidebar-aside"></div></div>'
  + '</body></html>';
const DOC = '<div><p>Das Online-Check-in öffnet 24 Stunden vor Abflug.</p><div class="booking-lookup my-bookings">'
  + row('Submit URL', 'https://www.swiss.com/ch/de/fly/check-in/online-check-in') + row('Tab', 'Check-in') + row('Reference label', 'Buchungscode / Ticketnr.') + row('Reference pattern', '^([A-Z0-9]{6}|\\d{13})$')
  + row('Reference error', 'Bitte geben Sie Ihren Buchungscode ein') + row('Last name label', 'Nachname (wie in Buchung)') + row('Last name error', 'Bitte geben Sie Ihren Nachnamen ein') + row('Submit label', 'Check-in')
  + '</div></div>'
  + '<div><h2>Automatisches Check-in</h2><p>Beim automatischen Check-in erhalten Sie Ihre Bordkarte automatisch per E-Mail.</p><h3 id="zusatzliche-fluggastdaten">Zusätzliche Fluggastdaten</h3><p>Einige Länder verlangen zusätzliche Daten.</p><div class="section-metadata"><div><div>Style</div><div>with-aside</div></div></div></div>'
  + '<div><div class="section-metadata"><div><div>Style</div><div>sidebar-aside</div></div></div></div>';

test('withCheckinFields: www\'s first name and the hints as rows, the option checkin; the other rows kept; once', () => {
  const out = withCheckinFields(DOC, SNAP);
  assert.match(out, /<div class="booking-lookup my-bookings checkin">/);
  const rows = [...out.matchAll(/<div><div>([^<]*)<\/div><div>([^<]*)<\/div><\/div>/g)].map((m) => [m[1], m[2]]);
  const keys = rows.map(([k]) => k);
  assert.deepEqual(keys, ['Submit URL', 'Tab', 'Reference label', 'Reference pattern', 'Reference error', 'First name label', 'First name hint', 'First name error', 'Last name label', 'Last name hint', 'Last name error', 'Submit label', 'Style', 'Style']);
  const val = (k) => rows.find(([x]) => x === k)[1];
  assert.equal(val('First name label'), 'Vorname (wie in Buchung)');
  assert.equal(val('First name hint'), 'Bitte geben Sie Ihren Vornamen so ein, wie er in Ihrer Buchungsbestätigung angezeigt wird.');
  assert.equal(val('Last name hint'), 'Bitte geben Sie Ihren Nachnamen so ein, wie er in Ihrer Buchungsbestätigung angezeigt wird. Bei Umlauten wie Ä, Ö, Ü bitte ae, oe, ue schreiben.');
  assert.equal(withCheckinFields(out, SNAP), out, 'a document with them stays');
  assert.equal(withCheckinFields(DOC, '<html><body></body></html>'), DOC, 'no check-in form in the snapshot: as it is');
});

test('withSwissAccordions: the item\'s texts the import wrote flat become an accordion-columns block (open-first: authored expanded) in their place', () => {
  const r = withSwissAccordions(DOC, SNAP);
  assert.equal(r.made, 1);
  assert.match(r.doc, /<div><h2>Automatisches Check-in<\/h2><div class="accordion-columns open-first"><div><div>So funktioniert es<\/div><div><p>Beim automatischen Check-in erhalten Sie Ihre Bordkarte automatisch per E-Mail\.<\/p><h3 id="zusatzliche-fluggastdaten">Zusätzliche Fluggastdaten<\/h3><p>Einige Länder verlangen zusätzliche Daten\.<\/p><\/div><\/div><\/div><div class="section-metadata">/);
  assert.equal(withSwissAccordions(r.doc, SNAP).made, 0, 'a document with the block stays');
  assert.equal(withSwissAccordions(r.doc, SNAP).doc, r.doc);
});

test('withSwissAccordions: an item whose texts the document lacks: the accordion left as it is (listed)', () => {
  const doc = DOC.replace('<p>Einige Länder verlangen zusätzliche Daten.</p>', '');
  const r = withSwissAccordions(doc, SNAP);
  assert.equal(r.made, 0);
  assert.equal(r.doc, doc);
  assert.match(r.skipped.join(' '), /So funktioniert es/);
});

test('SWISS\'s theme: the hints as www\'s maui-hint (12/17 px dark grey, 6 px under the field, 24 px before the next), scoped to SWISS\'s checkin form', async () => {
  const fs = await import('node:fs');
  const css = fs.readFileSync(new URL('../styles/themes/swiss.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  assert.match(css, /body\.brand-swiss \.booking-lookup\.checkin \.booking-lookup-hint \{ margin: 6px 0 24px; color: #333; line-height: 17px; \}/);
});
