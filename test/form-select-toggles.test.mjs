/* eslint-disable max-len */
/* The form block's select toggles and prefill (blocks/form/form.js; Lufthansa Cargo's contact
   form): a select whose Rules name sections (toggles=a, b, c) shows the section named as its
   value and hides (and clears) the others; a field with prefill=<param> takes its value from the
   page address's query (www's /support-and-contact?reason=...&subreason=...): a select the option
   whose value or text it is, a text field the text; fields in hidden sections only once their
   section shows at load. DOM nodes are compared with assert.ok(a === b) only.
   Run: node --max-old-space-size=512 --test test/form-select-toggles.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
globalThis.window = window;
const setPage = (p, search = '') => {
  const host = 'cargo.turnsthe.page';
  window.location = {
    hostname: host, pathname: p, search, hash: '', origin: `https://${host}`, href: `https://${host}${p}${search}`,
  };
};
setPage('/en/contact-us');
// scripts/aem.js (the block's loadScript) reads window.origin when it is imported
window.origin = 'https://cargo.turnsthe.page';
globalThis.Event = window.Event;
// (section names here are plain words: no escaping needed)
globalThis.CSS = { escape: (v) => String(v) };
const F = await import('../blocks/form/form.js');

const row = (cells) => `<div>${cells.map((c) => `<div>${c}</div>`).join('')}</div>`;
const lines = (...l) => l.map((x) => `<p>${x}</p>`).join('');
const TABLE = [
  ['Label', 'Type', 'Name', 'Required', 'Options', 'Help text', 'Placeholder', 'Validation message', 'Constraint message', 'Rules'],
  ['Company name', 'text', 'companyName', 'yes', '', '', '', 'Please enter company name', '', 'prefill=company'],
  ['Reason for contact', 'select', 'reason', 'yes', lines('bookings=Bookings &amp; Shipments', 'general=General request', 'technical=Technical support'), '', '', 'Please select a reason for contact', '', lines('toggles=bookings, general, technical', 'prefill=reason')],
  ['', 'fieldset', 'bookings', '', '', '', '', '', '', 'hidden'],
  ['Subreason', 'select', 'subreasonBookings', 'yes', lines('Booking', 'Other'), '', '', 'Please select a subreason', '', 'prefill=subreason'],
  ['', 'fieldset', 'general', '', '', '', '', '', '', 'hidden'],
  ['Subreason', 'select', 'subreasonGeneral', 'yes', lines('Schedule / Capacity', 'Feedback / Complaints', 'Other'), '', '', 'Please select a subreason', '', 'prefill=subreason'],
  ['', 'fieldset', 'technical', '', '', '', '', '', '', 'hidden'],
  ['Subreason', 'select', 'subreasonTechnical', 'yes', lines('Login / Password', 'Other'), '', '', 'Please select a subreason', '', 'prefill=subreason'],
  ['', 'end', '', '', '', '', '', '', '', ''],
  ['Submit', 'submit', '', '', '', '', '', '', '', ''],
  ['cargo-contact-us', 'config', 'form', '', '', '', '', '', '', ''],
].map(row).join('');

/** The block decorated on /en/contact-us with a query. */
function contactForm(search = '') {
  setPage('/en/contact-us', search);
  globalThis.fetch = async () => new Response('{}', { status: 404 });
  const { document } = parseHTML(`<!DOCTYPE html><html><head><meta name="brand" content="cargo"></head><body><div class="form core">${TABLE}</div></body></html>`);
  globalThis.document = document;
  const block = document.querySelector('.form');
  F.default(block);
  return block;
}
const shown = (b) => [...b.querySelectorAll('fieldset.form-subsection')].filter((f) => !f.hidden).map((f) => f.dataset.section);
const control = (b, name) => b.querySelector(`[name="${name}"]`);
// (linkedom's select has no selectedIndex and no value setter: the options' selected state)
const selected = (b, name) => [...control(b, name).options].find((o) => o.selected);
const value = (b, name) => {
  const c = control(b, name);
  if (c.tagName !== 'SELECT') return c.value;
  return (selected(b, name) || { value: '' }).value;
};
const chosen = (b, name) => (value(b, name) ? selected(b, name).textContent : '');
const pick = (b, name, v) => {
  const c = control(b, name);
  // (linkedom: unselecting an option can unselect another one: all off first, then the one)
  [...c.options].forEach((o) => { o.selected = false; });
  const o = [...c.options].find((x) => x.value === v);
  if (o) o.selected = true;
  c.dispatchEvent(new window.Event('change', { bubbles: true }));
};

test('select toggles: no reason, no subreason; a reason shows its own subreasons, hides and clears the others', () => {
  const b = contactForm();
  assert.deepEqual(shown(b), []);
  pick(b, 'reason', 'general');
  assert.deepEqual(shown(b), ['general']);
  pick(b, 'subreasonGeneral', control(b, 'subreasonGeneral').options[2].value);
  assert.equal(chosen(b, 'subreasonGeneral'), 'Feedback / Complaints');
  pick(b, 'reason', 'technical');
  assert.deepEqual(shown(b), ['technical']);
  assert.equal(value(b, 'subreasonGeneral'), '', 'the hidden section is cleared');
  pick(b, 'reason', '');
  assert.deepEqual(shown(b), []);
  assert.deepEqual([value(b, 'companyName'), value(b, 'reason')], ['', ''], 'no query: nothing prefilled');
});

test('prefill: www\'s ?reason=&subreason= choose the reason (by option text or value) and the subreason in its section', () => {
  const b = contactForm('?reason=General%20request&subreason=Feedback%20%2F%20Complaints&company=ACME%20Freight');
  assert.equal(value(b, 'reason'), 'general');
  assert.deepEqual(shown(b), ['general']);
  assert.equal(chosen(b, 'subreasonGeneral'), 'Feedback / Complaints');
  assert.deepEqual([value(b, 'subreasonBookings'), value(b, 'subreasonTechnical')], ['', ''], 'hidden sections untouched');
  assert.equal(value(b, 'companyName'), 'ACME Freight');
  const byValue = contactForm('?reason=bookings&subreason=Other');
  assert.deepEqual(shown(byValue), ['bookings']);
  assert.equal(chosen(byValue, 'subreasonBookings'), 'Other');
  assert.equal(value(byValue, 'subreasonGeneral'), '', '"Other" of another reason stays empty');
  const unknown = contactForm('?reason=Claims&subreason=Other');
  assert.deepEqual([value(unknown, 'reason'), shown(unknown)], ['', []]);
});

test('fields without prefill ignore the query; a field with prefill leaves an absent parameter alone', () => {
  const b = contactForm('?companyName=X&reason=');
  assert.equal(value(b, 'companyName'), '');
  assert.equal(value(b, 'reason'), '');
});

test('prefill in a dialog (round 3, Cargo\'s form over Support & Contact): the query of the link that opened it (data-search on the fragment\'s main), not the page\'s', () => {
  setPage('/en/support-and-contact', '?reason=Technical%20support');
  globalThis.fetch = async () => new Response('{}', { status: 404 });
  const { document } = parseHTML(`<!DOCTYPE html><html><head><meta name="brand" content="cargo"></head><body><main data-search="?reason=General%20request&amp;subreason=Feedback%20%2F%20Complaints"><div class="form core">${TABLE}</div></main></body></html>`);
  globalThis.document = document;
  const b = document.querySelector('.form');
  F.default(b);
  assert.equal(value(b, 'reason'), 'general');
  assert.equal(chosen(b, 'subreasonGeneral'), 'Feedback / Complaints');
});
