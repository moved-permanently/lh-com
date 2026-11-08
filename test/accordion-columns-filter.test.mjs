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

// with tabs (Cargo parity round 3, www's Support & Contact: the topic finder over the tabs): the
// field is a finder above the tab bar; typing lists the matching topics of every tab (a panel's
// heading and what follows it; a panel without headings: the item) under the field, with their
// links; the tabs and their items stay as they are; empty field: no list
test('filter with tabs: a finder over the tabs, the matching topics of every tab listed under it with their links, the items untouched', async () => {
  const el = block('faq tabs filter');
  await decorate(el);
  const filter = el.firstElementChild;
  assert.ok(filter.classList.contains('accordion-columns-filter'), 'the finder first');
  assert.ok(filter.nextElementSibling.classList.contains('accordion-columns-tablist'), 'then the tab bar');
  const input = filter.querySelector('input');
  const results = filter.querySelector('.accordion-columns-filter-results');
  assert.ok(results && results.hidden, 'no list while empty');
  type(input, 'ebooking');
  assert.equal(results.hidden, false);
  const titles = [...results.querySelectorAll('.accordion-columns-filter-result-title')].map((t) => t.textContent.trim());
  assert.deepEqual(titles, ['Technical support']);
  assert.equal(results.querySelector('a').getAttribute('href'), '/en/contact-us');
  assert.equal(results.querySelector('h3'), null, 'no headings copied into the page outline');
  assert.deepEqual(shown(el), ['Bookings & Shipments', 'General request', 'Technical support', 'Réclamations'], 'every tab stays');
  type(input, 'claim');
  assert.deepEqual([...results.querySelectorAll('.accordion-columns-filter-result-title')].map((t) => t.textContent.trim()), ['Réclamations'], 'a panel without headings: its item');
  type(input, 'nothing like this');
  assert.equal(results.children.length, 0);
  assert.equal(filter.querySelector('.accordion-columns-filter-status').textContent, 'No topics found.');
  type(input, '');
  assert.equal(results.hidden, true);
  assert.equal(filter.querySelector('.accordion-columns-filter-status').textContent, '');
});

// brief 482 (Cargo's Support & Contact, as www's at 1440 and 390): the finder headed (row Filter
// heading) with its topic chips under the field (row Filter chips, a list of links); the line
// right before the block (its section's last heading) under the finder, above the tab bar; each
// panel's topics (a heading, its line, its links) a list of buttons and the chosen topic's links
// beside them from 1025 px (one shown, the first chosen), on phones an accordion (the first open,
// a second click closes it)
const finder = async (wide) => {
  window.matchMedia = () => ({ matches: wide, addEventListener: () => {}, addListener: () => {} });
  const section = document.createElement('div');
  section.className = 'section';
  section.innerHTML = '<div class="default-content-wrapper"><h4>Select a topic from our list to get support with the most common requests.</h4></div><div class="accordion-columns-wrapper"></div>';
  const el = document.createElement('div');
  el.className = 'accordion-columns faq tabs filter';
  const rows = [
    ['Filter heading', 'Need support on your topic?'],
    ['Filter chips', '<ul><li><a href="https://www.lufthansa-cargo.com/eservices/written-statement">Written statement</a></li><li><a href="/modals/contact-us?reason=General%20request">Feedback/Complaints</a></li></ul>'],
    ['Bookings &amp; Shipments', '<h3>Booking</h3><p>Get assistance in booking.</p><ul><li><a href="/a">Book a quotation.</a></li></ul><h3>Status information</h3><p>Get a status.</p><ul><li><a href="/b">Get a flight status.</a></li></ul>'],
    ['General request', '<h3>My account</h3><p>Manage your account.</p><ul><li><a href="/c">Change profile.</a></li></ul>'],
  ];
  el.innerHTML = rows.map(([a, b]) => `<div><div>${a}</div><div>${b}</div></div>`).join('');
  section.querySelector('.accordion-columns-wrapper').append(el);
  document.body.replaceChildren(section);
  await decorate(el);
  window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
  return { el, section };
};

test('finder: www\'s heading over the field, its chips under it, the line before the block under the finder', async () => {
  const { el, section } = await finder(true);
  const filter = el.firstElementChild;
  assert.equal(filter.querySelector('.accordion-columns-filter-heading').textContent, 'Need support on your topic?');
  assert.equal(filter.firstElementChild.className, 'accordion-columns-filter-heading');
  const chips = [...filter.querySelectorAll('.accordion-columns-filter-chips > li > a')].map((a) => [a.textContent, a.getAttribute('href')]);
  assert.deepEqual(chips, [['Written statement', 'https://www.lufthansa-cargo.com/eservices/written-statement'], ['Feedback/Complaints', '/modals/contact-us?reason=General%20request']]);
  const kids = [...filter.children];
  assert.ok(kids.indexOf(filter.querySelector('.accordion-columns-filter-chips')) > kids.indexOf(filter.querySelector('.accordion-columns-filter-field')), 'the chips after the field');
  const intro = filter.nextElementSibling;
  assert.equal(intro.className, 'accordion-columns-filter-intro');
  assert.match(intro.textContent, /^Select a topic from our list/);
  assert.equal(intro.tagName, 'H4');
  assert.ok(intro.nextElementSibling.classList.contains('accordion-columns-tablist'));
  assert.equal(section.querySelector('.default-content-wrapper'), null, 'the emptied wrapper goes');
  assert.equal([...el.querySelectorAll('summary')].map((s) => s.textContent.trim()).join('|'), 'Bookings & Shipments|General request', 'the rows are no items');
});

test('finder, from 1025 px: the topics a list of buttons (title and line) and the chosen topic\'s links beside them, the first chosen; a click chooses another', async () => {
  const { el } = await finder(true);
  const panel = el.querySelector('.accordion-columns-item .accordion-columns-panel');
  const topics = panel.querySelector('.accordion-columns-topics');
  assert.ok(topics, 'the topics');
  const buttons = [...topics.querySelectorAll(':scope > h3 > button.accordion-columns-topic')];
  assert.deepEqual(buttons.map((b) => [b.querySelector('.accordion-columns-topic-title').textContent, b.querySelector('.accordion-columns-topic-text').textContent]), [['Booking', 'Get assistance in booking.'], ['Status information', 'Get a status.']]);
  const regions = buttons.map((b) => el.querySelector(`#${b.getAttribute('aria-controls')}`));
  assert.ok(regions.every((r) => r && r.classList.contains('accordion-columns-topic-panel')));
  assert.deepEqual(buttons.map((b) => b.getAttribute('aria-expanded')), ['true', 'false']);
  assert.deepEqual(regions.map((r) => r.hidden), [false, true]);
  assert.equal(regions[0].querySelector('.accordion-columns-topic-panel-title').textContent, 'Booking');
  assert.equal(regions[0].querySelector('.accordion-columns-topic-panel-title').getAttribute('aria-hidden'), 'true');
  assert.equal(regions[0].querySelector('a').getAttribute('href'), '/a');
  assert.equal(topics.style.getPropertyValue('--topics'), '2');
  buttons[1].click();
  assert.deepEqual(regions.map((r) => r.hidden), [true, false]);
  buttons[1].click();
  assert.deepEqual(regions.map((r) => r.hidden), [true, false], 'from 1025 px one topic stays chosen');
});

test('finder, on phones: the topics an accordion, the first open; a second click closes it', async () => {
  const { el } = await finder(false);
  assert.deepEqual([...el.querySelectorAll('.accordion-columns-item')].map((d) => d.hasAttribute('open')), [true, false], 'the first tab open, as www\'s');
  const buttons = [...el.querySelectorAll('.accordion-columns-item')[0].querySelectorAll('button.accordion-columns-topic')];
  const regions = buttons.map((b) => el.querySelector(`#${b.getAttribute('aria-controls')}`));
  assert.deepEqual(regions.map((r) => r.hidden), [false, true]);
  buttons[0].click();
  assert.deepEqual(buttons.map((b) => b.getAttribute('aria-expanded')), ['false', 'false']);
  assert.deepEqual(regions.map((r) => r.hidden), [true, true]);
  buttons[1].click();
  assert.deepEqual(regions.map((r) => r.hidden), [true, false]);
});

test('finder: typing still lists the matching topics with their line and links (the topics read from the list)', async () => {
  const { el } = await finder(true);
  const input = el.querySelector('.accordion-columns-filter input');
  type(input, 'flight status');
  const results = el.querySelector('.accordion-columns-filter-results');
  assert.deepEqual([...results.querySelectorAll('.accordion-columns-filter-result-title')].map((t) => t.textContent.trim()), ['Status information']);
  assert.match(results.textContent, /Get a status\./);
  assert.equal(results.querySelector('a').getAttribute('href'), '/b');
  assert.equal(results.querySelector('button, [aria-hidden]'), null, 'no buttons or hidden copies in the results');
});
