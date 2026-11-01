/* eslint-disable max-len */
/* The flight search picker's lufthansa.com options (blocks/flight-search/picker-options.js,
   passenger-picker.js): a `Young adults` row (yes, or the countries where it shows: GB) adds
   www's "Young Adults (12-15 years)" stepper, handed off as B15 after the adults; a hint row left
   empty (or without its value cell) shows no hint; a `Fare preference` row adds www's
   "Alternative fare selection" (best price, coupon, high), handed off as farePreference after the
   cabin (none for best price), the traveller line saying the selection is active. Without the
   rows the picker, its value and the handoff are as before. The handoffs are compared with www's
   own (test/fixtures/lh-shop-handoff/www-searches.json, caught in the page on 2026-11-01).
   Run: node --max-old-space-size=512 --test test/flight-search-picker-options.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.location = {
  hostname: 'lufthansa.turnsthe.page', pathname: '/gb/en/homepage', search: '', href: 'https://lufthansa.turnsthe.page/gb/en/homepage', origin: 'https://lufthansa.turnsthe.page',
};
globalThis.window = window;
globalThis.document = document;
const { readConfigRows } = await import('../scripts/block-config.js');
const { createPassengerPicker, clampPassengers, PASSENGER_LABELS } = await import('../blocks/flight-search/passenger-picker.js');
const { readPickerOptions, applyPickerChoices, PICKER_OPTION_LABELS } = await import('../blocks/flight-search/picker-options.js');
const { buildShopHandoff } = await import('../scripts/shop-handoff.js');

const WWW = JSON.parse(fs.readFileSync(new URL('./fixtures/lh-shop-handoff/www-searches.json', import.meta.url)));
const GB_EN = { key: 'gb/en', country: 'gb', lang: 'en' };
const GB_DE = { key: 'gb/de', country: 'gb', lang: 'de' };
const DE_DE = { key: 'de/de', country: 'de', lang: 'de' };

/** A block of rows: [key, value] (a value of undefined: a row with the key cell only). */
const blockOf = (rows) => {
  const block = document.createElement('div');
  block.className = 'flight-search';
  rows.forEach(([key, value]) => {
    const row = document.createElement('div');
    const k = document.createElement('div');
    k.textContent = key;
    row.append(k);
    if (value !== undefined) {
      const v = document.createElement('div');
      v.innerHTML = value;
      row.append(v);
    }
    block.append(row);
  });
  return block;
};
const optionsOf = (rows, locale) => {
  const block = blockOf(rows);
  return readPickerOptions(block, readConfigRows(block), locale);
};
const strip = (html) => html.replace(/flight-search-(passengers|fare)-[a-z0-9]{6}/g, 'ID');
const BASE = { cabins: ['E', 'P', 'B', 'F'], value: { adults: 1, cabin: 'E' } };
const pickerOf = (labels, extra = {}) => createPassengerPicker({ labels, ...BASE, ...extra });
const more = (picker, type) => picker.element.querySelector(`.flight-search-passenger-${type} .flight-search-passenger-more`);
const QUERY = {
  tripType: 'ONE_WAY', origin: 'LHR', destination: 'NYC', departureDate: '2026-11-21', consentGroups: [],
};

test('options: none without the rows', () => {
  const o = optionsOf([['Passenger picker', 'yes'], ['Traveller label', 'Economy, 1 Traveller']], GB_EN);
  assert.equal(o.youngAdults, false);
  assert.equal(o.farePreference, false);
  assert.deepEqual(o.labels, {});
});

test('options: Young adults shows where its row says (yes, or the country list)', () => {
  assert.equal(optionsOf([['Young adults', 'GB']], GB_EN).youngAdults, true);
  assert.equal(optionsOf([['Young adults', 'GB']], GB_DE).youngAdults, true, 'gb/de, served from the de/de documents');
  assert.equal(optionsOf([['Young adults', 'GB']], DE_DE).youngAdults, false);
  assert.equal(optionsOf([['Young adults', 'gb, ie']], { ...GB_EN, country: 'ie' }).youngAdults, true);
  assert.equal(optionsOf([['Young adults', 'yes']], DE_DE).youngAdults, true);
  assert.equal(optionsOf([['Young adults', 'no']], GB_EN).youngAdults, false);
  assert.equal(optionsOf([['Young adults', '']], GB_EN).youngAdults, false);
});

test('options: the texts per language (www\'s), authored rows win', () => {
  const en = optionsOf([['Young adults', 'GB'], ['Fare preference', 'yes']], GB_EN).labels;
  assert.equal(en['young adults label'], 'Young Adults');
  assert.equal(en['young adults hint'], '(12-15 years)');
  assert.equal(en['fare label'], 'Alternative fare selection');
  assert.equal(en['fare question'], 'Which fare benefits do you prefer?');
  assert.equal(en['fare default label'], 'Best price offers');
  assert.equal(en['fare coupon label'], 'Change the sequence of my flights');
  assert.equal(en['fare high label'], 'Flexibility/highest booking class to collect more miles');
  assert.equal(en['fare applied'], 'Your fare selection is active.');
  const de = optionsOf([['Young adults', 'GB'], ['Fare preference', 'yes'], ['Fare high label', 'Mehr Meilen']], GB_DE).labels;
  assert.equal(de['young adults label'], 'Junge Erwachsene');
  assert.equal(de['young adults hint'], '(12-15 Jahre)');
  assert.equal(de['fare label'], 'Alternative Tarifoptionen');
  assert.equal(de['fare default label'], 'Bestpreisangebote');
  assert.equal(de['fare applied'], 'Der ausgewählte Tarif wurde übernommen.');
  assert.equal(de['fare high label'], 'Mehr Meilen');
  assert.deepEqual(Object.keys(PICKER_OPTION_LABELS.de).sort(), Object.keys(PICKER_OPTION_LABELS.en).sort());
});

test('options: a hint row left empty or without its value cell means no hint', () => {
  assert.deepEqual(optionsOf([['Adults hint', '']], GB_EN).labels, { 'adults hint': '' });
  assert.deepEqual(optionsOf([['Adults hint', undefined]], GB_EN).labels, { 'adults hint': '' });
  assert.deepEqual(optionsOf([['Adults hint', '<p></p>']], GB_EN).labels, { 'adults hint': '' });
  assert.deepEqual(optionsOf([['Adults hint', '12+'], ['Children hint', '(2-11 years)']], GB_EN).labels, {}, 'authored hints: resolveLabels as before');
  assert.deepEqual(optionsOf([['Children hint', ''], ['Infants hint', undefined]], GB_EN).labels, { 'children hint': '', 'infants hint': '' });
});

test('the rules with young adults: they count to the nine seats, infants stay one per adult', () => {
  assert.deepEqual(clampPassengers({ adults: 1 }), { adults: 1, children: 0, infants: 0 }, 'without them: as before');
  assert.deepEqual(clampPassengers({ adults: 1, youngAdults: 9 }), {
    adults: 1, youngAdults: 8, children: 0, infants: 0,
  });
  assert.deepEqual(clampPassengers({
    adults: 2, youngAdults: 3, children: 9, infants: 4,
  }), {
    adults: 2, youngAdults: 3, children: 4, infants: 2,
  });
});

test('the picker with young adults: the stepper after the adults, counted in the line and the value', () => {
  const labels = { ...PASSENGER_LABELS.en, ...optionsOf([['Young adults', 'GB']], GB_EN).labels };
  const picker = pickerOf(labels, { youngAdults: true });
  const rows = [...picker.element.querySelectorAll('.flight-search-passenger')].map((r) => r.className.replace('flight-search-passenger flight-search-passenger-', ''));
  assert.deepEqual(rows, ['adults', 'young-adults', 'children', 'infants']);
  const row = picker.element.querySelector('.flight-search-passenger-young-adults');
  assert.equal(row.querySelector('.flight-search-passenger-label').textContent, 'Young Adults');
  assert.equal(row.querySelector('.flight-search-passenger-hint').textContent, '(12-15 years)');
  assert.equal(row.querySelector('.flight-search-passenger-more').getAttribute('aria-label'), 'Add one: Young Adults');
  more(picker, 'young-adults').click();
  more(picker, 'children').click();
  assert.equal(picker.element.querySelector('.flight-search-travellers').textContent, 'Economy, 3 Travellers');
  assert.deepEqual(picker.getValue(), {
    adults: 1, youngAdults: 1, children: 1, infants: 0, cabin: 'E',
  });
  for (let i = 0; i < 9; i += 1) more(picker, 'young-adults').click();
  assert.equal(picker.getValue().youngAdults, 7, 'nine seats: 1 adult, 1 child, 7 young adults');
  assert.equal(more(picker, 'young-adults').disabled, true);
  assert.equal(more(picker, 'children').disabled, true);
});

test('the picker with an empty adults hint: no hint under the adults, the others keep theirs', () => {
  const labels = { ...PASSENGER_LABELS.en, ...optionsOf([['Adults hint', '']], GB_EN).labels };
  const picker = pickerOf(labels);
  assert.equal(picker.element.querySelector('.flight-search-passenger-adults .flight-search-passenger-hint'), null);
  assert.equal(picker.element.querySelector('.flight-search-passenger-children .flight-search-passenger-hint').textContent, '2 to 11 years');
});

test('the picker with the fare preference: www\'s three choices, best price first and chosen', () => {
  const labels = { ...PASSENGER_LABELS.en, ...optionsOf([['Fare preference', 'yes']], GB_EN).labels };
  const picker = pickerOf(labels, { farePreference: true });
  const fare = picker.element.querySelector('.flight-search-fare');
  assert.ok(fare);
  assert.ok(fare.nextElementSibling === picker.element.querySelector('.flight-search-passengers-done'), 'before Done');
  assert.equal(fare.querySelector('summary').textContent, 'Alternative fare selection');
  const fieldset = fare.querySelector('fieldset');
  assert.equal(fieldset.querySelector('legend').textContent, 'Which fare benefits do you prefer?');
  const radios = [...fieldset.querySelectorAll('input[type="radio"]')];
  assert.deepEqual(radios.map((r) => r.value), ['DEFAULT', 'COUPON', 'HIGH']);
  assert.deepEqual(radios.map((r) => r.closest('label').textContent), ['Best price offers', 'Change the sequence of my flights', 'Flexibility/highest booking class to collect more miles']);
  assert.equal(new Set(radios.map((r) => r.name)).size, 1);
  assert.ok(radios[0].checked);
  assert.equal(picker.getValue().farePreference, 'DEFAULT');
  const opener = picker.element.querySelector('.flight-search-travellers');
  assert.equal(opener.textContent, 'Economy, 1 Traveller');
  radios[1].checked = true;
  radios[1].dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(picker.getValue().farePreference, 'COUPON');
  assert.equal(opener.textContent, 'Economy, 1 Traveller, Your fare selection is active.');
  radios[0].checked = true;
  radios[0].dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(opener.textContent, 'Economy, 1 Traveller');
});

test('without the options: the picker\'s markup and value as before', () => {
  const labels = PASSENGER_LABELS.en;
  const plain = pickerOf(labels);
  const off = pickerOf(labels, { youngAdults: false, farePreference: false });
  assert.equal(strip(off.element.outerHTML), strip(plain.element.outerHTML));
  assert.equal(plain.element.querySelector('.flight-search-passenger-young-adults'), null);
  assert.equal(plain.element.querySelector('.flight-search-fare'), null);
  assert.deepEqual(plain.getValue(), {
    adults: 1, children: 0, infants: 0, cabin: 'E',
  });
  assert.equal(plain.element.querySelectorAll('.flight-search-passenger-hint').length, 3);
});

test('the handoff: one young adult on gb/en as www sends it (B15 after the adult)', () => {
  const www = WWW['gb-en-young-adult'];
  const handoff = applyPickerChoices(buildShopHandoff({
    ...QUERY, adults: 1, children: 0, infants: 0, cabin: 'E',
  }, GB_EN), { youngAdults: 1 });
  assert.equal(handoff.action, www.action);
  assert.deepEqual(handoff.fields, www.fields);
});

test('the handoff: young adult, child and coupon on gb/en as www sends them', () => {
  const www = WWW['gb-en-young-adult-child-coupon'];
  const handoff = applyPickerChoices(buildShopHandoff({
    ...QUERY, adults: 1, children: 1, infants: 0, cabin: 'E',
  }, GB_EN), { youngAdults: 1, farePreference: 'COUPON' });
  assert.equal(handoff.action, www.action);
  assert.equal(handoff.fields.search, www.fields.search, 'the same JSON, key order included');
});

test('the handoff: high on de/de as www sends it', () => {
  const www = WWW['de-de-high'];
  const handoff = applyPickerChoices(buildShopHandoff({
    ...QUERY, origin: 'FRA', adults: 1, cabin: 'E',
  }, DE_DE), { farePreference: 'HIGH' });
  assert.equal(handoff.action, www.action);
  assert.deepEqual(handoff.fields, www.fields);
});

test('the handoff: infants after the young adults and children; best price sends no preference', () => {
  const handoff = applyPickerChoices(buildShopHandoff({
    ...QUERY, adults: 2, children: 1, infants: 1, cabin: 'B',
  }, GB_EN), { youngAdults: 2, farePreference: 'DEFAULT' });
  const search = JSON.parse(handoff.fields.search);
  assert.deepEqual(search.travelers.map((t) => t.passengerTypeCode), ['ADT', 'ADT', 'B15', 'B15', 'CHD', 'INF']);
  assert.deepEqual(Object.keys(search), ['itineraries', 'travelers', 'cabin', 'portalFacts']);
});

test('the handoff without the choices: the very same object (other brands as before)', () => {
  const ita = buildShopHandoff({ ...QUERY, adults: 1, cabin: 'E' }, { key: 'it/en', country: 'it', lang: 'en' }, 'https://shop.ita-airways.com/booking/availability');
  assert.ok(applyPickerChoices(ita, {
    adults: 1, children: 0, infants: 0, cabin: 'E',
  }) === ita);
  assert.ok(applyPickerChoices(ita, { youngAdults: 0, farePreference: 'DEFAULT' }) === ita);
  assert.ok(applyPickerChoices(ita, undefined) === ita);
  const ad = buildShopHandoff({ ...QUERY, adults: 1 }, { key: 'it', country: 'it', lang: 'it' }, '', { booking: { format: 'airdolomiti', officeId: 'X' } });
  assert.ok(applyPickerChoices(ad, { youngAdults: 1, farePreference: 'HIGH' }) === ad, 'not the shop\'s format: untouched');
});
