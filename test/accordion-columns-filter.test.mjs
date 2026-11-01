/* accordion-columns option `filter`: a text field over the topics that narrows them as you type,
   as www.lufthansa-cargo.com/en/support-and-contact's "Find topic by typing" (2026-11-01; www lists
   the matching topics under the field, here the accordion itself narrows). Case-insensitive (and
   accent-insensitive), every typed word in the topic's title or its text; no topic left: the
   no-results line. Optional rows `Filter label` and `No results` (only with the option; without
   them the built-in English, German or Italian texts). Without the option the block as before.
   Run: node --max-old-space-size=512 --test test/accordion-columns-filter.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html lang="en"><head></head><body></body></html>');
window.location = {
  hostname: 'main--lh-cargo--moved-permanently.aem.page', pathname: '/en/support-and-contact', search: '', hash: '', href: 'https://main--lh-cargo--moved-permanently.aem.page/en/support-and-contact', origin: 'https://main--lh-cargo--moved-permanently.aem.page',
};
Object.defineProperty(window, 'origin', { value: 'https://main--lh-cargo--moved-permanently.aem.page', configurable: true });
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
globalThis.NodeFilter = { SHOW_ELEMENT: 1, SHOW_TEXT: 4 };
globalThis.Node = window.Node;

const { default: decorate } = await import('../blocks/accordion-columns/accordion-columns.js');

// Cargo's support page rows (main--lh-cargo /en/support-and-contact), shortened
const ROWS = [
  ['Bookings &amp; Shipments', '<h3>Booking</h3><p>Get assistance in booking or updating your shipment information.</p><ul><li><a href="/en/contact-us">Request a DGR booking</a></li></ul>'],
  ['General request', '<h3>Schedule / Capacity</h3><p>Get details on our schedule, routings and available capacity.</p>'],
  ['Technical support', '<h3>Technical support</h3><ul><li><a href="/en/contact-us">Issue with eBooking</a></li></ul>'],
  ['Réclamations', '<p>Submit a claim for a damaged shipment.</p>'],
];
const block = (classes, extra = []) => {
  const el = document.createElement('div');
  el.className = `accordion-columns ${classes}`;
  el.innerHTML = [...extra, ...ROWS].map(([a, b]) => `<div><div>${a}</div><div>${b}</div></div>`).join('');
  document.body.replaceChildren(el);
  return el;
};
const type = (input, value) => {
  input.value = value;
  input.dispatchEvent(new window.Event('input', { bubbles: true }));
};
const shown = (el) => [...el.querySelectorAll('details.accordion-columns-item')].filter((d) => !d.hidden)
  .map((d) => d.querySelector('summary').textContent.trim());

test('without the option: no field, every row an item, as before', async () => {
  const el = block('faq', [['Filter label', 'Find topic by typing']]);
  await decorate(el);
  assert.equal(el.querySelector('input'), null);
  assert.equal(el.querySelector('.accordion-columns-filter'), null);
  // the row is an ordinary item without the option
  assert.equal(el.querySelectorAll('details.accordion-columns-item').length, 5);
});

test('filter: a labelled field over the topics; typing narrows them (title or text, any case, every word)', async () => {
  const el = block('faq filter');
  await decorate(el);
  const filter = el.firstElementChild;
  assert.ok(filter.classList.contains('accordion-columns-filter'));
  const input = filter.querySelector('input');
  assert.equal(input.type, 'search');
  assert.equal(filter.querySelector(`label[for="${input.id}"]`).textContent, 'Find topic by typing');
  // the field controls the block (the topics)
  assert.ok(el.id);
  assert.equal(input.getAttribute('aria-controls'), el.id);
  assert.equal(shown(el).length, 4);

  type(input, 'TECHNICAL');
  assert.deepEqual(shown(el), ['Technical support']);
  type(input, 'capacity'); // panel text only
  assert.deepEqual(shown(el), ['General request']);
  type(input, 'booking'); // title of one, link text of another
  assert.deepEqual(shown(el), ['Bookings & Shipments', 'Technical support']);
  type(input, 'booking dgr'); // every word
  assert.deepEqual(shown(el), ['Bookings & Shipments']);
  type(input, 'reclamations'); // accents ignored
  assert.deepEqual(shown(el), ['Réclamations']);
  const status = filter.parentElement.querySelector('.accordion-columns-filter-status');
  assert.equal(status.getAttribute('aria-live'), 'polite');
  assert.equal(status.textContent, '');

  type(input, 'xyzzy');
  assert.deepEqual(shown(el), []);
  assert.equal(status.textContent, 'No topics found.');

  type(input, '  ');
  assert.equal(shown(el).length, 4);
  assert.equal(status.textContent, '');
});

test('filter: the clear button empties the field, shows every topic and returns focus', async () => {
  const el = block('faq filter');
  await decorate(el);
  const input = el.querySelector('.accordion-columns-filter input');
  const clear = el.querySelector('.accordion-columns-filter-clear');
  assert.equal(clear.type, 'button');
  assert.equal(clear.textContent, 'Remove');
  assert.ok(clear.hidden);
  let focused = null;
  input.focus = () => { focused = input; };
  type(input, 'technical');
  assert.equal(clear.hidden, false);
  clear.click();
  assert.equal(input.value, '');
  assert.equal(shown(el).length, 4);
  assert.ok(clear.hidden);
  assert.ok(focused === input);
});

test('filter rows: Filter label and No results set the texts and are no topics; German and Italian built in', async () => {
  const el = block('faq filter', [['Filter label', 'Search our topics'], ['No results', 'Nothing matches.']]);
  await decorate(el);
  assert.equal(el.querySelectorAll('details.accordion-columns-item').length, 4);
  assert.equal(el.querySelector('.accordion-columns-filter label').textContent, 'Search our topics');
  type(el.querySelector('.accordion-columns-filter input'), 'xyzzy');
  assert.equal(el.querySelector('.accordion-columns-filter-status').textContent, 'Nothing matches.');

  document.documentElement.lang = 'de';
  const de = block('faq filter');
  await decorate(de);
  assert.equal(de.querySelector('.accordion-columns-filter label').textContent, 'Thema durch Eingabe finden');
  type(de.querySelector('.accordion-columns-filter input'), 'xyzzy');
  assert.equal(de.querySelector('.accordion-columns-filter-status').textContent, 'Keine Themen gefunden.');
  assert.equal(de.querySelector('.accordion-columns-filter-clear').textContent, 'Entfernen');
  document.documentElement.lang = 'it';
  const it = block('faq filter');
  await decorate(it);
  assert.equal(it.querySelector('.accordion-columns-filter label').textContent, 'Trova un argomento digitando');
  document.documentElement.lang = 'en';
});

test('two filtered accordions on a page keep their ids apart', async () => {
  const a = block('faq filter');
  await decorate(a);
  const idA = a.querySelector('.accordion-columns-filter input').id;
  const b = block('faq filter');
  await decorate(b);
  assert.notEqual(b.querySelector('.accordion-columns-filter input').id, idA);
});
