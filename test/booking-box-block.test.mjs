/* booking-box, the block (brief 324; tools/reports/tap/booking-spec.md 5.1, 5.4): the block table
   (key | value rows: Format, Market, Language, Default origin, Airports, Tabs, the pages, the 35
   labels by TAP's key or its English text), the four tabs as an ARIA tablist (arrow keys; the
   #book-flight .. #flight-status and #special-anchor-* hashes), the trip types, the airport fields
   (the sheet only on the first focus, TAP's matching, a code chip), the range calendar (Monday
   first, no past days, typed DD/MM/YYYY), the passengers (TAP's rules), the validation
   (aria-describedby), the hand-off in a new tab, check-in and manage booking in a new tab.
   Run: node --max-old-space-size=512 --test test/booking-box-block.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { buildTapDeeplink, tapCheckinUrl, tapManageUrl } from '../blocks/booking-box/tap-format.js';

const U = '00000000-0000-4000-8000-000000000000';
const SHEET = {
  ':type': 'sheet',
  data: [
    {
      code: 'LIS', city: 'LIS', cityName: 'Lisboa', airportName: 'Humberto Delgado', country: 'PT', countryName: 'Portugal', tapRoute: 'true',
    },
    {
      code: 'OPO', city: 'OPO', cityName: 'Porto', airportName: 'Porto', country: 'PT', countryName: 'Portugal', tapRoute: 'true',
    },
    {
      code: 'LHR', city: 'LON', cityName: 'Londres', airportName: 'Heathrow', country: 'GB', countryName: 'Reino Unido', tapRoute: 'true',
    },
    {
      code: 'PAR', city: 'PAR', cityName: 'Paris', airportName: 'todos os aeroportos', country: 'FR', countryName: 'França', tapRoute: 'true',
    },
  ],
};
const ROWS = [
  ['Format', 'tap'], ['Default origin', 'LIS'], ['Default origin name', 'Lisboa, Portugal'],
  ['Airports', '<a href="/pt-pt/booking/airports.json">/pt-pt/booking/airports.json</a>'],
  ['Tabs', 'Reservar voo, Fazer Check-in, Gerir reserva, Estado do voo'],
  ['Flight status page', '<a href="https://www.flytap.com/pt-pt/estado-voo">Estado do voo</a>'],
  ['Login page', '<a href="https://www.flytap.com/pt-pt/login">Login</a>'],
  ['Corporate link', '<a href="https://tapforbiz.com/">Reservas para empresas</a>'],
  ['round-trip', 'Ida e volta'], ['One way', 'Só ida'], ['multi-city', 'Multi-city'], ['search', 'Pesquisar'],
  ['origin-label', 'Origem'], ['destination-label', 'Destino'], ['destination-placeholder', 'Escolher Destino'],
  ['validation-required', 'Campo obrigatório'], ['passengers', 'Passageiro(s)'], ['continue', 'Continuar'],
];

let page = 0;
/** A page on tap.turnsthe.page/pt-pt with the block, decorated with a fixed today. */
async function boxPage({ rows = ROWS, hash = '', today = '2026-11-04' } = {}) {
  const table = rows.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('');
  const { window, document } = parseHTML(`<!DOCTYPE html><html lang="pt"><head><meta name="brand" content="tap"></head><body><main><div class="section"><div class="booking-box">${table}</div></div></main></body></html>`);
  const origin = 'https://tap.turnsthe.page';
  window.location = {
    hostname: 'tap.turnsthe.page', pathname: '/pt-pt', search: '', hash, href: `${origin}/pt-pt${hash}`, origin,
  };
  Object.defineProperty(window, 'origin', { value: origin, configurable: true });
  window.hlx = { codeBasePath: '' };
  const calls = { fetch: [], open: [] };
  window.fetch = async (url) => {
    calls.fetch.push(String(url));
    return { ok: true, json: async () => SHEET };
  };
  window.open = (...args) => { calls.open.push(args); return null; };
  window.matchMedia = () => ({ matches: true, addEventListener() {} });
  Object.defineProperty(window, 'crypto', { value: { randomUUID: () => U }, configurable: true });
  window.scrollTo = () => {};
  window.HTMLElement.prototype.scrollIntoView = () => {};
  // linkedom's focus() fires focus (the combobox selects its text): no select() in linkedom
  window.HTMLInputElement.prototype.select = () => {};
  globalThis.window = window;
  globalThis.document = document;
  globalThis.fetch = window.fetch;
  globalThis.CustomEvent = window.CustomEvent;
  let active = null;
  Object.defineProperty(document, 'activeElement', { get: () => active, configurable: true });
  const focus = (el) => { active = el; el.dispatchEvent(new window.Event('focus')); el.dispatchEvent(new window.Event('focusin', { bubbles: true })); };
  page += 1;
  const mod = await import(`../blocks/booking-box/booking-box.js?case=${page}`);
  const block = document.querySelector('.booking-box');
  await mod.default(block, { today });
  return {
    window, document, block, calls, focus,
  };
}
const wait = (ms) => new Promise((r) => { setTimeout(r, ms); });
const click = (w, el) => el.dispatchEvent(new w.Event('click', { bubbles: true }));
// linkedom has no KeyboardEvent: an Event with the key
const key = (w, el, k) => {
  const e = new w.Event('keydown', { bubbles: true, cancelable: true });
  e.key = k;
  el.dispatchEvent(e);
};
// linkedom's tabIndex property reads -1: the attribute
const tab = (el) => el.getAttribute('tabindex');

test('tabs: an ARIA tablist of the four tabs (the Tabs row), the first selected, arrow keys move', async () => {
  const { window, block } = await boxPage();
  const tabs = [...block.querySelectorAll('[role="tab"]')];
  assert.equal(block.querySelector('[role="tablist"]').children.length, 4);
  assert.deepEqual(tabs.map((t) => t.textContent.trim()), ['Reservar voo', 'Fazer Check-in', 'Gerir reserva', 'Estado do voo']);
  assert.deepEqual(tabs.map((t) => t.getAttribute('aria-selected')), ['true', 'false', 'false', 'false']);
  const panels = [...block.querySelectorAll('[role="tabpanel"]')];
  assert.equal(panels.length, 4);
  assert.deepEqual(panels.map((p) => p.hidden), [false, true, true, true]);
  assert.equal(tabs[0].getAttribute('aria-controls'), panels[0].id);
  key(window, tabs[0], 'ArrowRight');
  assert.equal(tabs[1].getAttribute('aria-selected'), 'true');
  assert.equal(panels[1].hidden, false);
  key(window, tabs[1], 'End');
  assert.equal(tabs[3].getAttribute('aria-selected'), 'true');
  key(window, tabs[3], 'ArrowRight');
  assert.equal(tabs[0].getAttribute('aria-selected'), 'true', 'wraps');
});

test('anchors: #special-anchor-check-in on load, #flight-status and #special-anchor-my-travels on hashchange', async () => {
  const { window, block } = await boxPage({ hash: '#special-anchor-check-in' });
  const selected = () => block.querySelector('[role="tab"][aria-selected="true"]').dataset.tab;
  assert.equal(selected(), 'check-in');
  window.location.hash = '#flight-status';
  window.dispatchEvent(new window.Event('hashchange'));
  assert.equal(selected(), 'flight-status');
  window.location.hash = '#special-anchor-my-travels';
  window.dispatchEvent(new window.Event('hashchange'));
  assert.equal(selected(), 'my-travels');
  window.location.hash = '#book-flight';
  window.dispatchEvent(new window.Event('hashchange'));
  assert.equal(selected(), 'book-flight');
});

test('book: the trip types (native radios), the default origin with its chip, nothing fetched before an airport field gets focus', async () => {
  const { block, calls } = await boxPage();
  const radios = [...block.querySelectorAll('input[type="radio"][name$="trip"]')];
  assert.deepEqual(radios.map((r) => r.value), ['return', 'one-way', 'multi-city']);
  assert.deepEqual(radios.map((r) => r.closest('label').textContent.trim()), ['Ida e volta', 'Só ida', 'Multi-city']);
  assert.equal(radios[0].checked, true);
  const origin = block.querySelector('.booking-box-origin input');
  assert.equal(origin.value, 'Lisboa, Portugal');
  assert.equal(block.querySelector('.booking-box-origin .booking-box-chip').textContent, 'LIS');
  assert.equal(block.querySelector('.booking-box-destination input').placeholder, 'Escolher Destino');
  const corporate = block.querySelector('a.booking-box-corporate');
  assert.equal(corporate.href, 'https://tapforbiz.com/');
  assert.equal(corporate.target, '_blank');
  assert.deepEqual(calls.fetch, [], 'no request before the first interaction');
});

test('a search: the sheet on first focus, TAP\'s matching, a pick opens the calendar, two days, the hand-off in a new tab', async () => {
  const {
    window, block, calls, focus,
  } = await boxPage();
  const dest = block.querySelector('.booking-box-destination input');
  focus(dest);
  await wait(30);
  assert.deepEqual(calls.fetch, ['/pt-pt/booking/airports.json?limit=5000']);
  dest.value = 'porto';
  dest.dispatchEvent(new window.Event('input'));
  await wait(300);
  const options = [...block.querySelectorAll('.booking-box-destination [role="option"]')];
  assert.equal(options.length, 1);
  assert.equal(options[0].querySelector('.booking-box-chip').textContent, 'OPO');
  assert.match(options[0].textContent, /Porto, Porto.*Portugal/);
  options[0].dispatchEvent(new window.Event('mousedown'));
  assert.equal(dest.value, 'Porto, Portugal');
  const cal = block.querySelector('.booking-box-calendar');
  assert.equal(cal.hidden, false, 'the calendar opens after the destination');
  // Monday first; days before today disabled
  assert.equal(cal.querySelectorAll('[role="grid"]').length, 2, 'two months');
  const past = cal.querySelector('button[data-date="2026-11-03"]');
  assert.equal(past.disabled, true);
  const cont = cal.querySelector('.booking-box-continue');
  assert.equal(cont.disabled, true);
  click(window, cal.querySelector('button[data-date="2026-11-28"]'));
  assert.equal(cont.disabled, true, 'a return needs both dates');
  click(window, cal.querySelector('button[data-date="2026-12-02"]'));
  assert.equal(cont.disabled, false);
  assert.ok(cal.querySelector('button[data-date="2026-11-30"]').classList.contains('in-range'));
  click(window, cont);
  assert.equal(cal.hidden, true);
  assert.match(block.querySelector('.booking-box-dates-value').textContent, /28\/11\/2026.*02\/12\/2026/);
  click(window, block.querySelector('.booking-box-search'));
  assert.equal(calls.open.length, 1);
  assert.deepEqual(calls.open[0], [buildTapDeeplink({
    market: 'PT', language: 'pt', tripType: 'return', flights: [{ origin: 'LIS', destination: 'OPO', date: '2026-11-28' }], returnDate: '2026-12-02', adults: 1,
  }, U), '_blank', 'noopener']);
  assert.equal(calls.fetch.length, 1, 'the sheet once');
});

test('the calendar: typed DD/MM/YYYY dates, clear, a return before the departure refused, one way one date', async () => {
  const { window, block } = await boxPage();
  click(window, block.querySelector('.booking-box-dates button'));
  const cal = block.querySelector('.booking-box-calendar');
  const [from, to] = [...cal.querySelectorAll('input.booking-box-typed')];
  from.value = '05/12/2026';
  from.dispatchEvent(new window.Event('change'));
  to.value = '01/12/2026';
  to.dispatchEvent(new window.Event('change'));
  assert.equal(cal.querySelector('.booking-box-continue').disabled, true, 'a return before the departure');
  to.value = '09/12/2026';
  to.dispatchEvent(new window.Event('change'));
  assert.equal(cal.querySelector('.booking-box-continue').disabled, false);
  click(window, cal.querySelector('.booking-box-clear'));
  assert.equal(from.value, '');
  assert.equal(cal.querySelector('.booking-box-continue').disabled, true);
  // one way: one date is enough, no return field
  click(window, cal.querySelector('.booking-box-close') || cal.querySelector('.booking-box-continue'));
  const oneWay = block.querySelector('input[type="radio"][value="one-way"]');
  oneWay.checked = true;
  oneWay.dispatchEvent(new window.Event('change', { bubbles: true }));
  click(window, block.querySelector('.booking-box-dates button'));
  assert.equal(to.closest('.booking-box-typed-field').hidden, true);
  click(window, cal.querySelector('button[data-date="2026-12-05"]'));
  assert.equal(cal.querySelector('.booking-box-continue').disabled, false);
});

test('the calendar\'s grid by keyboard: arrows move a day or a week, Enter picks', async () => {
  const { window, block } = await boxPage();
  click(window, block.querySelector('.booking-box-dates button'));
  const cal = block.querySelector('.booking-box-calendar');
  const today = cal.querySelector('button[data-date="2026-11-04"]');
  assert.equal(tab(today), '0', 'the roving focus on today');
  key(window, today, 'ArrowRight');
  assert.equal(tab(cal.querySelector('button[data-date="2026-11-05"]')), '0');
  assert.equal(tab(cal.querySelector('button[data-date="2026-11-04"]')), '-1');
  key(window, cal.querySelector('button[data-date="2026-11-05"]'), 'ArrowDown');
  const next = cal.querySelector('button[data-date="2026-11-12"]');
  assert.equal(tab(next), '0');
  key(window, next, 'Enter');
  assert.equal(cal.querySelector('input.booking-box-typed').value, '12/11/2026');
});

test('validation: no destination and no dates are refused, the messages tied to their fields; nothing opens', async () => {
  const { window, block, calls } = await boxPage();
  click(window, block.querySelector('.booking-box-search'));
  assert.deepEqual(calls.open, []);
  const dest = block.querySelector('.booking-box-destination input');
  assert.equal(dest.getAttribute('aria-invalid'), 'true');
  const msg = block.querySelector(`#${dest.getAttribute('aria-describedby').split(' ')[0]}`);
  assert.equal(msg.textContent, 'Campo obrigatório');
  const dates = block.querySelector('.booking-box-dates button');
  assert.equal(dates.getAttribute('aria-invalid'), 'true');
});

test('passengers: 1 adult by default, TAP\'s rules on the steppers, young adults only on a UK route', async () => {
  const { window, block, focus } = await boxPage();
  click(window, block.querySelector('.booking-box-passengers button'));
  const panel = block.querySelector('.booking-box-passenger-panel');
  assert.equal(panel.hidden, false);
  const step = (type, dir) => panel.querySelector(`[data-type="${type}"] button[data-step="${dir}"]`);
  const value = (type) => panel.querySelector(`[data-type="${type}"] output`).textContent;
  assert.equal(value('adults'), '1');
  assert.equal(step('adults', '-1').disabled, true);
  click(window, step('infants', '1'));
  assert.equal(value('infants'), '1');
  assert.equal(step('infants', '1').disabled, true, 'one infant per adult');
  [1, 2, 3].forEach(() => click(window, step('children', '1')));
  assert.equal(value('children'), '3');
  assert.equal(step('children', '1').disabled, true, '1 adult with 1 infant: 3 children');
  assert.equal(panel.querySelector('[data-type="youngAdults"]').hidden, true);
  assert.match(block.querySelector('.booking-box-passengers-value').textContent, /^5 Passageiro\(s\)$/);
  // a UK destination: young adults offered
  const dest = block.querySelector('.booking-box-destination input');
  focus(dest);
  await wait(30);
  dest.value = 'heathrow';
  dest.dispatchEvent(new window.Event('input'));
  await wait(300);
  block.querySelector('.booking-box-destination [role="option"]').dispatchEvent(new window.Event('mousedown'));
  assert.equal(panel.querySelector('[data-type="youngAdults"]').hidden, false);
});

test('multi-city: two flights to start, the next starts at the last destination, at most 6', async () => {
  const { window, block } = await boxPage();
  const multi = block.querySelector('input[type="radio"][value="multi-city"]');
  multi.checked = true;
  multi.dispatchEvent(new window.Event('change', { bubbles: true }));
  const rows = () => [...block.querySelectorAll('.booking-box-leg')];
  assert.equal(rows().length, 2);
  const add = block.querySelector('.booking-box-add-flight');
  [1, 2, 3, 4].forEach(() => click(window, add));
  assert.equal(rows().length, 6);
  assert.equal(add.disabled, true);
});

test('check-in and manage booking: the code and last name checked, TAP\'s links in a new tab; flight status: its page', async () => {
  const { window, block, calls } = await boxPage({ hash: '#check-in' });
  const panel = block.querySelector('[role="tabpanel"][data-tab="check-in"]');
  const [code, name] = panel.querySelectorAll('input');
  code.value = 'AB12';
  name.value = 'Silva';
  click(window, panel.querySelector('button[type="submit"], .booking-box-find'));
  assert.deepEqual(calls.open, [], 'a short code');
  assert.equal(code.getAttribute('aria-invalid'), 'true');
  code.value = 'ab12cd';
  click(window, panel.querySelector('button[type="submit"], .booking-box-find'));
  assert.deepEqual(calls.open[0], [tapCheckinUrl({ code: 'ab12cd', lastName: 'Silva', language: 'pt' }), '_blank', 'noopener']);
  const manage = block.querySelector('[role="tabpanel"][data-tab="my-travels"]');
  const [mc, mn] = manage.querySelectorAll('input');
  mc.value = 'AB12CD';
  mn.value = 'da Silva';
  click(window, manage.querySelector('button[type="submit"], .booking-box-find'));
  assert.deepEqual(calls.open[1], [tapManageUrl({
    code: 'AB12CD', lastName: 'da Silva', market: 'PT', language: 'pt',
  }), '_blank', 'noopener']);
  assert.equal(manage.querySelector('a.booking-box-login').href, 'https://www.flytap.com/pt-pt/login');
  const status = block.querySelector('[role="tabpanel"][data-tab="flight-status"] a');
  assert.equal(status.href, 'https://www.flytap.com/pt-pt/estado-voo');
  assert.equal(status.target, '_blank');
});

test('defaults: English labels without rows, the market and language from the root, the sheet at <root>/booking/airports.json', async () => {
  const { block, calls, focus } = await boxPage({ rows: [['Format', 'tap']] });
  const tabs = [...block.querySelectorAll('[role="tab"]')].map((t) => t.textContent.trim());
  assert.deepEqual(tabs, ['Book flight', 'Check-in', 'Manage booking', 'Flight status']);
  assert.equal(block.querySelector('input[type="radio"][value="return"]').closest('label').textContent.trim(), 'Round trip');
  focus(block.querySelector('.booking-box-origin input'));
  await wait(30);
  assert.deepEqual(calls.fetch, ['/pt-pt/booking/airports.json?limit=5000']);
});

test('another format: the block shows nothing and fetches nothing', async () => {
  const { block, calls } = await boxPage({ rows: [['Format', 'other']] });
  assert.equal(block.children.length, 0);
  assert.deepEqual(calls.fetch, []);
});
