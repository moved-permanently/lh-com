/* eslint-disable max-len */
/* The flight search's travellers window (blocks/flight-search/travellers-dialog.js; brief 388
   item 1, Brussels parity P24, SWISS row 6): on the group brands whose www shows it
   (scripts/brands.js travellersDialog: Brussels, SWISS, Austrian; the captures
   brussels-parity-001, swiss-parity-001, austrian-parity-001, the homepages' travellers states)
   the traveller line opens a modal dialog as www's: the "Travel details" tab, the travel class,
   adults, children and infants, the group booking link, "Alternative fare selection" (three
   choices) and the access code with its hint, and Continue (Austrian's Save). The changes count
   on Continue; the close button or Escape leave the search as it was. The hand-off as today, plus
   www's universalCode only when the access code is filled. A language without the window's texts
   (Brussels' nl) and every other brand keep the dropdown.
   Run: node --max-old-space-size=512 --test test/flight-search-travellers-dialog.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
const at = (host, pathname, brand) => {
  window.location = {
    hostname: host, pathname, search: '', hash: '', href: `https://${host}${pathname}`, origin: `https://${host}`,
  };
  document.head.innerHTML = brand ? `<meta name="brand" content="${brand}">` : '';
  document.documentElement.lang = pathname.split('/')[2] || 'en';
};
at('brussels.turnsthe.page', '/be/en/homepage', 'brussels');
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
// linkedom's select has no value setter
Object.defineProperty(window.HTMLSelectElement.prototype, 'value', {
  configurable: true,
  get() { return (this.querySelector('option[selected]') || this.querySelector('option') || {}).value || ''; },
  set(v) { [...this.querySelectorAll('option')].forEach((o) => o.toggleAttribute('selected', o.value === v)); },
});
globalThis.window = window;
globalThis.document = document;
globalThis.Event = window.Event;
let submitted;
window.HTMLElement.prototype.submit = function submit() {
  submitted.push({
    action: this.getAttribute('action') || this.action,
    fields: Object.fromEntries([...this.querySelectorAll('input')].map((i) => [i.name, i.value])),
  });
};
beforeEach(() => {
  submitted = [];
  globalThis.fetch = async () => new Response('{}', { status: 404, headers: { 'content-type': 'application/json' } });
});

const { default: decorate } = await import('../blocks/flight-search/flight-search.js');
const { BRANDS } = await import('../scripts/brands.js');
const { applyPickerChoices } = await import('../blocks/flight-search/picker-options.js');

const tick = () => new Promise((r) => { setImmediate(r); });
const flush = () => Array.from({ length: 20 }).reduce((p) => p.then(tick), Promise.resolve());

const blockOf = (rows = []) => {
  const block = document.createElement('div');
  block.className = 'flight-search';
  [['Default origin', 'Brussels (BRU)'], ['Default destination', 'Rome (FCO)'], ['Passenger picker', 'yes'], ...rows].forEach(([k, v]) => {
    const row = document.createElement('div');
    row.innerHTML = `<div>${k}</div><div>${v}</div>`;
    block.append(row);
  });
  document.body.replaceChildren(block);
  return block;
};
const built = async (rows) => {
  const block = blockOf(rows);
  decorate(block);
  await flush();
  return block;
};
const submit = async (block) => {
  const form = block.querySelector('form');
  form.querySelector('.flight-search-date input').value = '2026-11-21';
  form.dataset.tripType = 'ONE_WAY';
  form.dispatchEvent(new window.Event('submit', { cancelable: true }));
  await flush();
  return submitted.at(-1);
};
const dialogOf = (block) => block.querySelector('dialog.flight-search-travellers-dialog');
const text = (node) => (node ? node.textContent.replace(/\s+/g, ' ').trim() : null);
const more = (dialog, type) => dialog.querySelector(`.flight-search-passenger-${type} .flight-search-passenger-more`);
const choose = (dialog, code) => {
  const radio = dialog.querySelector(`.flight-search-fare-radio[value="${code}"]`);
  radio.checked = true;
  radio.dispatchEvent(new window.Event('change', { bubbles: true }));
};

test('the switch: Brussels, SWISS and Austrian; no other brand', () => {
  ['brussels', 'swiss', 'austrian'].forEach((k) => assert.ok(BRANDS[k].travellersDialog, k));
  Object.keys(BRANDS).filter((k) => !['brussels', 'swiss', 'austrian'].includes(k))
    .forEach((k) => assert.ok(!BRANDS[k].travellersDialog, k));
});

test('Brussels be/en: the line opens a modal dialog with www\'s parts and names', async () => {
  at('brussels.turnsthe.page', '/be/en/homepage', 'brussels');
  const block = await built([['Group booking', '<a href="/be/en/book-a-flight/groups-and-charter/groups">Group bookings for 10 or more passengers.</a>']]);
  const opener = block.querySelector('.flight-search-travellers');
  const dialog = dialogOf(block);
  assert.ok(dialog, 'a dialog');
  assert.equal(opener.getAttribute('aria-haspopup'), 'dialog');
  assert.equal(opener.getAttribute('aria-controls'), dialog.id);
  assert.equal(block.querySelector('.flight-search-passengers-panel'), null, 'no dropdown');
  assert.equal(text(document.getElementById(dialog.getAttribute('aria-labelledby'))), 'Travel details');
  const tabs = dialog.querySelector('[role="tablist"]');
  assert.deepEqual([...tabs.querySelectorAll('[role="tab"]')].map(text), ['Travel details'], 'Redeem miles waits for its capture');
  const tab = tabs.querySelector('[role="tab"]');
  assert.equal(tab.getAttribute('aria-selected'), 'true');
  const panel = document.getElementById(tab.getAttribute('aria-controls'));
  assert.equal(panel.getAttribute('role'), 'tabpanel');
  assert.equal(panel.getAttribute('aria-labelledby'), tab.id);
  assert.equal(text(dialog.querySelector('.flight-search-passenger-cabin .flight-search-passenger-label')), 'Travel class');
  assert.deepEqual(
    [...dialog.querySelectorAll('.flight-search-passenger')].map((r) => text(r.querySelector('.flight-search-passenger-text'))),
    ['Adults', 'Children (2 - 11 years)', 'Infants (Under 2 years, No seat)'],
  );
  assert.equal(text(dialog.querySelector('.flight-search-passengers-group')), 'Group bookings for 10 or more passengers.');
  assert.equal(text(dialog.querySelector('.flight-search-fare-label')), 'Alternative fare selection');
  assert.equal(text(dialog.querySelector('.flight-search-fare-question')), 'Which fare benefits do you prefer?');
  assert.deepEqual(
    [...dialog.querySelectorAll('.flight-search-fare-choice')].map(text),
    ['Best price offers', 'Change the sequence of my flights', 'Flexibility/highest booking class to collect more miles'],
  );
  assert.ok(dialog.querySelector('.flight-search-fare-radio[value="DEFAULT"]').checked);
  const code = dialog.querySelector('input.flight-search-access-code');
  assert.equal(text(dialog.querySelector(`label[for="${code.id}"]`)), 'Access code (optional)');
  assert.match(text(document.getElementById(code.getAttribute('aria-describedby'))), /^This field is for access codes only\./);
  assert.equal(text(dialog.querySelector('.flight-search-travellers-close')), '');
  assert.equal(dialog.querySelector('.flight-search-travellers-close').getAttribute('aria-label'), 'Close');
  assert.equal(text(dialog.querySelector('.flight-search-travellers-done')), 'Continue');
});

test('Continue keeps the changes; the close button and Escape leave the search as it was', async () => {
  at('brussels.turnsthe.page', '/be/en/homepage', 'brussels');
  const block = await built();
  const opener = block.querySelector('.flight-search-travellers');
  const dialog = dialogOf(block);
  // linkedom keeps no focus: the calls are counted (assert.equal on two nodes would print the DOM)
  let focused = 0;
  opener.focus = () => { focused += 1; };
  assert.equal(text(opener), 'Economy, 1 Traveller');
  opener.click();
  assert.ok(dialog.open || dialog.hasAttribute('open'), 'open');
  assert.equal(opener.getAttribute('aria-expanded'), 'true');
  more(dialog, 'adults').click();
  more(dialog, 'children').click();
  dialog.querySelector('.flight-search-travellers-done').click();
  assert.ok(!dialog.hasAttribute('open'), 'closed');
  assert.equal(opener.getAttribute('aria-expanded'), 'false');
  assert.equal(focused, 1, 'the focus back on the line');
  assert.equal(text(opener), 'Economy, 3 Travellers');
  opener.click();
  more(dialog, 'infants').click();
  dialog.querySelector('.flight-search-travellers-close').click();
  assert.equal(text(opener), 'Economy, 3 Travellers', 'the close button: no change');
  opener.click();
  assert.equal(text(dialog.querySelector('.flight-search-passenger-infants .flight-search-passenger-count')), '0', 'the window shows the kept values again');
  more(dialog, 'adults').click();
  dialog.dispatchEvent(new window.Event('cancel', { cancelable: true }));
  assert.ok(!dialog.hasAttribute('open'));
  assert.equal(text(opener), 'Economy, 3 Travellers', 'Escape: no change');
});

test('the hand-off: as today without an access code; universalCode after the fare preference when filled', async () => {
  at('brussels.turnsthe.page', '/be/en/homepage', 'brussels');
  const steps = (dialog) => {
    more(dialog, 'children').click();
    choose(dialog, 'COUPON');
  };
  let block = await built();
  let dialog = dialogOf(block);
  block.querySelector('.flight-search-travellers').click();
  steps(dialog);
  dialog.querySelector('.flight-search-travellers-done').click();
  const withDialog = await submit(block);
  // the same choices in today's dropdown (the switch off for the run)
  const saved = BRANDS.brussels.travellersDialog;
  BRANDS.brussels.travellersDialog = undefined;
  try {
    block = await built();
    block.querySelector('.flight-search-travellers').click();
    more(block, 'children').click();
    const radio = block.querySelector('.flight-search-fare-radio[value="COUPON"]');
    if (radio) choose(block, 'COUPON');
    const today = await submit(block);
    const search = JSON.parse(withDialog.fields.search);
    assert.equal(search.farePreference, 'COUPON');
    assert.equal('universalCode' in search, false);
    if (radio) assert.equal(withDialog.fields.search, today.fields.search);
    assert.equal(withDialog.action, today.action);
  } finally {
    BRANDS.brussels.travellersDialog = saved;
  }
  block = await built();
  dialog = dialogOf(block);
  block.querySelector('.flight-search-travellers').click();
  choose(dialog, 'HIGH');
  const code = dialog.querySelector('input.flight-search-access-code');
  code.value = '  SN2026 ';
  code.dispatchEvent(new window.Event('input', { bubbles: true }));
  dialog.querySelector('.flight-search-travellers-done').click();
  const keys = Object.keys(JSON.parse((await submit(block)).fields.search));
  assert.deepEqual(keys.slice(keys.indexOf('cabin'), keys.indexOf('cabin') + 3), ['cabin', 'farePreference', 'universalCode']);
  assert.equal(JSON.parse(submitted.at(-1).fields.search).universalCode, 'SN2026');
});

test('applyPickerChoices: universalCode only when filled, after the cabin without a fare preference', () => {
  const handoff = { action: 'x', fields: { search: JSON.stringify({ travelers: [{ passengerTypeCode: 'ADT' }], cabin: 'ECONOMY', nonStop: false }) } };
  assert.equal(applyPickerChoices(handoff, { universalCode: '   ' }), handoff);
  const out = JSON.parse(applyPickerChoices(handoff, { universalCode: 'ABC' }).fields.search);
  assert.deepEqual(Object.keys(out), ['travelers', 'cabin', 'universalCode', 'nonStop']);
});

test('www\'s texts: be/fr, SWISS ch/de, Austrian at/en and at/de', async () => {
  const cases = [
    ['brussels.turnsthe.page', '/be/fr/homepage', 'brussels', {
      tab: 'Informations sur le voyage', done: 'Enregistrer', cabin: 'Classe de voyage', infants: 'Bébés sans siège (0 à 23 mois)', close: 'Fermer', code: 'Code d’accès (Facultatif)',
    }],
    ['swiss.turnsthe.page', '/ch/de/homepage', 'swiss', {
      tab: 'Reisedetails', done: 'Speichern', cabin: 'Reiseklasse', infants: 'Kleinkinder ohne Sitzplatz (0-23 Monate)', close: 'Schliessen', code: 'Zugangscode (Optional)',
    }],
    ['austrian.turnsthe.page', '/at/en/homepage', 'austrian', {
      tab: 'Travel details', done: 'Save', cabin: 'Travel class', children: 'Children (2 to 11 years)', close: 'Close',
    }],
    ['austrian.turnsthe.page', '/at/de/homepage', 'austrian', {
      tab: 'Reisedetails', done: 'Weiter', cabin: 'Reiseklassen', close: 'Schließen',
    }],
  ];
  await cases.reduce((chain, [host, path, brand, want]) => chain.then(async () => {
    at(host, path, brand);
    const dialog = dialogOf(await built());
    assert.ok(dialog, path);
    assert.equal(text(dialog.querySelector('[role="tab"]')), want.tab, path);
    assert.equal(text(dialog.querySelector('.flight-search-travellers-done')), want.done, path);
    assert.equal(text(dialog.querySelector('.flight-search-passenger-cabin .flight-search-passenger-label')), want.cabin, path);
    assert.equal(dialog.querySelector('.flight-search-travellers-close').getAttribute('aria-label'), want.close, path);
    if (want.infants) assert.equal(text(dialog.querySelector('.flight-search-passenger-infants .flight-search-passenger-text')), want.infants, path);
    if (want.children) assert.equal(text(dialog.querySelector('.flight-search-passenger-children .flight-search-passenger-text')), want.children, path);
    if (want.code) {
      const code = dialog.querySelector('input.flight-search-access-code');
      assert.equal(text(dialog.querySelector(`label[for="${code.id}"]`)), want.code, path);
    }
  }), Promise.resolve());
});

test('an authored row still wins (SWISS\'s Infants label)', async () => {
  at('swiss.turnsthe.page', '/ch/en/homepage', 'swiss');
  const dialog = dialogOf(await built([['Infants label', 'Infants without seat']]));
  assert.equal(text(dialog.querySelector('.flight-search-passenger-infants .flight-search-passenger-label')), 'Infants without seat');
});

test('the dropdown stays: Brussels be/nl (no texts of the window), Lufthansa, ITA, Air Dolomiti', async () => {
  const cases = [
    ['brussels.turnsthe.page', '/be/nl/homepage', 'brussels'],
    ['main--lh-com--moved-permanently.aem.page', '/de/en/homepage', null],
    ['ita.turnsthe.page', '/it/en/homepage', 'ita'],
    ['airdolomiti.turnsthe.page', '/en/homepage', 'airdolomiti'],
  ];
  await cases.reduce((chain, [host, path, brand]) => chain.then(async () => {
    at(host, path, brand);
    const block = await built();
    assert.equal(dialogOf(block), null, path);
    assert.ok(block.querySelector('.flight-search-passengers-panel'), path);
  }), Promise.resolve());
});
