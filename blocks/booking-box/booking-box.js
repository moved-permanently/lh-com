/**
 * booking-box: an airline's booking box with its own engine's hand-off (tools/reports/tap/
 * booking-spec.md 4, 5). Only `Format | tap` for now: TAP's tabs (book, check-in, manage booking,
 * flight status), its trip types, airport fields from the root's airport sheet with TAP's
 * matching, a range calendar without prices, TAP's passenger rules and the hand-off to
 * booking.flytap.com in a new tab (tap-format.js, airport-match.js).
 *
 * Content (key | value rows, all optional but Format): Format, Market, Language, Default origin
 * (a code), Default origin name (its "City, Country" before the sheet is loaded), Airports (a
 * link to the sheet; default <root>/booking/airports.json), Tabs (four labels), Flight status
 * page, Login page, Corporate link (links) and the labels: a row per key of
 * tools/reports/tap/booking-labels.json, by TAP's key (`round-trip`, `ibe.book-flight`) or its
 * English text (`Round trip`); English without one.
 *
 * Nothing is requested before the first interaction: the sheet loads when an airport field gets
 * the focus. `#book-flight`, `#check-in`, `#my-travels`, `#flight-status` and TAP's
 * `#special-anchor-<tab>` select a tab (on load and on hashchange). Right after a hero section
 * and at 1024 px and wider the box pulls up over the hero's bottom, short of its dots and CTA.
 */
import { readConfigRows, toConfigKey } from '../../scripts/block-config.js';
import { createAirportCombobox } from '../../scripts/airport-combobox.js';
import { getLocale, siteOrigin } from '../../scripts/locale.js';
import { overHeroPull } from './over-hero.js';
import {
  MAX_FLIGHTS, buildTapDeeplink, marketOrigin, canChange, isBookingCode, isUkRoute, tapCheckinUrl,
  tapManageUrl,
} from './tap-format.js';
import {
  airportsFromSheet, fieldText, matchAirports, optionText,
} from './airport-match.js';

/** English texts: TAP's en-pt (booking-labels.json), then the other tabs' texts. */
const LABELS = {
  'ibe.book-flight': 'Book flight',
  'ibe.to-check-in': 'Check-in',
  'ibe.my-travels': 'Manage booking',
  'ibe.flight-status': 'Flight status',
  'round-trip': 'Round trip',
  'one-way': 'One way',
  'multi-city': 'Multi-city',
  'pay-with-miles': 'Pay with miles',
  'enterprise-reservation': 'Corporate bookings',
  'origin-label': 'Origin',
  'origin-placeholder': 'Choose Origin',
  'destination-label': 'Destination',
  'destination-placeholder': 'Choose Destination',
  'aria-label-swap': 'Swap Origin and Destination',
  dates: 'Dates',
  'select-date': 'Select Dates',
  'departure-date': 'Departure date',
  'arrival-date': 'Return date',
  'clean-dates': 'Clear dates',
  continue: 'Continue',
  'passengers-label': 'Passengers',
  passengers: 'Passenger(s)',
  adult: 'Adult(s)',
  'adult-range': 'Over 12 years',
  youngAdult: 'Young Adult(s)',
  'youngAdult-range': '12 to 15 years',
  childrens: 'Children',
  'childrens-range': '2 to 11 years',
  babys: 'Baby(ies)',
  'babys-range': 'Under 2 years',
  search: 'Search',
  'add-more-flights': 'Add another flight',
  'no-results-search': 'No results for your search',
  'recent-searches': 'Recent searches',
  'validation-required': 'Required field',
  // the check-in and manage tabs (TAP's ibe.* keys of the same i18n store)
  'ibe.login': 'Login',
  'login-and-make-easier': 'Log in and make the process easier.',
  'ibe.reservation-details': 'Or enter your booking details',
  'ibe.reservation-number': 'Booking code',
  'ibe.passenger-lastname': 'Passenger\'s last name',
  'ibe.find-reservation': 'Find booking',
  'validation-invalid': 'Invalid field',
  // ours: no TAP text found for these
  'same-airports': 'Choose a destination other than the origin',
  'flight-status-text': 'Departures and arrivals of TAP flights, on flytap.com.',
  'remove-flight': 'Remove flight',
  'previous-month': 'Previous month',
  'next-month': 'Next month',
  close: 'Close',
  fewer: 'Fewer',
  more: 'More',
  'new-tab': 'opens in a new tab',
};

const TABS = [
  ['book-flight', 'ibe.book-flight'],
  ['check-in', 'ibe.to-check-in'],
  ['my-travels', 'ibe.my-travels'],
  ['flight-status', 'ibe.flight-status'],
];
const TRIPS = [['return', 'round-trip'], ['one-way', 'one-way'], ['multi-city', 'multi-city']];
const PASSENGERS = [
  ['adults', 'adult'], ['youngAdults', 'youngAdult'], ['children', 'childrens'], ['infants', 'babys'],
];
const CORPORATE_LINK = 'https://tapforbiz.com/';

const ICONS = {
  'book-flight': '<path d="M2 11.5 14 6a1.3 1.3 0 0 0-1.2-2.2L9.5 5.3 4.5 3 3.3 3.6l3.5 3L4 8 2.4 7.3 1.5 7.8z"/><path d="M2 14h12"/>',
  'check-in': '<rect x="3" y="2" width="10" height="12" rx="1.5"/><path d="M6 6h4M6 9h4M6 12h2"/>',
  'my-travels': '<rect x="2" y="5" width="12" height="9" rx="1.5"/><path d="M6 5V3h4v2M2 9h12"/>',
  'flight-status': '<circle cx="8" cy="8" r="6"/><path d="M8 4.5V8l2.5 1.5"/>',
  swap: '<path d="M4 6h8l-2.5-2.5M12 10H4l2.5 2.5"/>',
  external: '<path d="M9 3h4v4M13 3 7 9M11 9.5V13H3V5h3.5"/>',
  caret: '<path d="m4 6 4 4 4-4"/>',
  close: '<path d="m4 4 8 8M12 4l-8 8"/>',
  plus: '<path d="M8 3v10M3 8h10"/>',
  minus: '<path d="M3 8h10"/>',
  prev: '<path d="m10 3-5 5 5 5"/>',
  next: '<path d="m6 3 5 5-5 5"/>',
};

let boxCount = 0;

function el(tag, attrs = {}, ...children) {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (v === undefined || v === null || v === false) return;
    if (k === 'className') e.className = v;
    else if (k === 'text') e.textContent = v;
    else e.setAttribute(k, v === true ? '' : v);
  });
  e.append(...children.filter((c) => c !== null && c !== undefined));
  return e;
}

function icon(name) {
  const span = el('span', { className: `booking-box-icon booking-box-icon-${name}`, 'aria-hidden': 'true' });
  span.innerHTML = `<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
  return span;
}

/** A link to another site: a new tab, said to screen readers. */
function newTabLink(href, text, labels, className) {
  const a = el('a', {
    href, className, target: '_blank', rel: 'noopener noreferrer',
  }, text);
  a.append(el('span', { className: 'sr-only', text: ` (${labels['new-tab']})` }));
  return a;
}

/** The labels: a row by TAP's key or by its English text, else English. */
function readLabels(config) {
  return Object.fromEntries(Object.entries(LABELS).map(([key, en]) => {
    const row = config[toConfigKey(key)] || config[toConfigKey(en)];
    return [key, row && row.text ? row.text : en];
  }));
}

/* ---------- dates: ISO strings, no time zone ---------- */

const pad = (n) => String(n).padStart(2, '0');
const isoOf = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const dateOf = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};
const addDays = (iso, n) => {
  const d = dateOf(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return isoOf(d);
};
const addMonths = (iso, n) => {
  const d = dateOf(iso);
  return isoOf(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1)));
};
const monthStart = (iso) => `${iso.slice(0, 8)}01`;
const shown = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : '');
function localToday() {
  const n = new Date();
  return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`;
}
/** DD/MM/YYYY (also D/M/YYYY, dots or dashes) to ISO; '' when no real date. */
function parseTyped(text) {
  const m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(String(text || '').trim());
  if (!m) return '';
  const iso = `${m[3]}-${pad(m[2])}-${pad(m[1])}`;
  return isoOf(dateOf(iso)) === iso ? iso : '';
}

/**
 * The calendar popover: two months (one below 768 px), Monday first, days before `min` disabled,
 * typed DD/MM/YYYY fields, Clear and Continue; range (return) or a single date.
 */
function createCalendar(labels, lang, today) {
  const weekdays = Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(lang, { weekday: 'short', timeZone: 'UTC' })
    .format(new Date(Date.UTC(2024, 0, 1 + i))).replace(/\.$/, ''));
  const monthName = new Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const dayName = new Intl.DateTimeFormat(lang, { dateStyle: 'full', timeZone: 'UTC' });
  boxCount += 1;
  const id = `booking-box-calendar-${boxCount}`;
  let state = null;

  const root = el('div', {
    className: 'booking-box-calendar', role: 'dialog', 'aria-modal': 'false', 'aria-label': labels.dates,
  });
  root.hidden = true;
  const typed = [['departure-date', 'from'], ['arrival-date', 'to']].map(([key, which]) => {
    const input = el('input', {
      type: 'text', className: 'booking-box-typed', id: `${id}-${which}`, placeholder: 'DD/MM/YYYY', inputmode: 'numeric', autocomplete: 'off',
    });
    const field = el('div', { className: 'booking-box-typed-field' }, el('label', { for: input.id, text: labels[key] }), input);
    return { input, field, which };
  });
  const close = el('button', { type: 'button', className: 'booking-box-close', 'aria-label': labels.close }, icon('close'));
  const prev = el('button', { type: 'button', className: 'booking-box-prev', 'aria-label': labels['previous-month'] }, icon('prev'));
  const next = el('button', { type: 'button', className: 'booking-box-next', 'aria-label': labels['next-month'] }, icon('next'));
  const months = el('div', { className: 'booking-box-months' });
  const clear = el('button', { type: 'button', className: 'booking-box-clear' }, labels['clean-dates']);
  const cont = el('button', { type: 'button', className: 'booking-box-continue' }, labels.continue);
  root.append(
    el('div', { className: 'booking-box-calendar-head' }, ...typed.map((t) => t.field), close),
    el('div', { className: 'booking-box-calendar-body' }, prev, months, next),
    el('div', { className: 'booking-box-calendar-foot' }, clear, cont),
  );

  const twoMonths = () => !window.matchMedia || window.matchMedia('(min-width: 768px)').matches;
  const complete = () => state && state.from && (state.mode === 'single' || (state.to && state.to >= state.from));

  function grid(start) {
    const table = el('table', { role: 'grid', 'aria-labelledby': `${id}-m-${start}` });
    table.append(el('thead', {}, el('tr', {}, ...weekdays.map((w) => el('th', { scope: 'col', abbr: w, text: w })))));
    const body = el('tbody');
    const first = dateOf(start);
    const lead = (first.getUTCDay() + 6) % 7;
    const days = dateOf(addMonths(start, 1));
    days.setUTCDate(0);
    const count = days.getUTCDate();
    let row = el('tr');
    for (let i = 0; i < lead; i += 1) row.append(el('td', { role: 'presentation' }));
    for (let d = 1; d <= count; d += 1) {
      const iso = `${start.slice(0, 8)}${pad(d)}`;
      const b = el('button', {
        type: 'button',
        'data-date': iso,
        tabindex: iso === state.focus ? '0' : '-1',
        'aria-label': dayName.format(dateOf(iso)),
      }, String(d));
      b.disabled = iso < state.min;
      const selected = iso === state.from || iso === state.to;
      if (selected) b.classList.add('selected');
      if (iso === state.from) b.classList.add('range-start');
      if (iso === state.to) b.classList.add('range-end');
      if (state.from && state.to && iso > state.from && iso < state.to) b.classList.add('in-range');
      if (iso === today) b.classList.add('today');
      b.setAttribute('aria-pressed', selected ? 'true' : 'false');
      row.append(el('td', { role: 'gridcell' }, b));
      if ((lead + d) % 7 === 0) {
        body.append(row);
        row = el('tr');
      }
    }
    if (row.children.length) body.append(row);
    table.append(body);
    return el('div', { className: 'booking-box-month' }, el('h3', { id: `${id}-m-${start}`, text: monthName.format(first) }), table);
  }

  function render(focusDay) {
    const count = twoMonths() ? 2 : 1;
    const last = addMonths(state.view, count - 1);
    if (state.focus < state.view) state.view = monthStart(state.focus);
    else if (monthStart(state.focus) > last) {
      state.view = addMonths(monthStart(state.focus), 1 - count);
    }
    const starts = Array.from({ length: count }, (_, i) => addMonths(state.view, i));
    months.replaceChildren(...starts.map(grid));
    prev.disabled = state.view <= monthStart(state.min);
    typed[0].input.value = shown(state.from);
    typed[1].input.value = shown(state.to);
    typed[1].field.hidden = state.mode === 'single';
    cont.disabled = !complete();
    if (focusDay) {
      const b = months.querySelector(`button[data-date="${state.focus}"]`);
      if (b && b.focus) b.focus();
    }
  }

  function pick(iso, focusDay) {
    if (iso < state.min) return;
    if (state.mode === 'single' || !state.from || state.to || iso < state.from) {
      state.from = iso;
      state.to = '';
    } else {
      state.to = iso;
    }
    state.focus = iso;
    render(focusDay);
  }

  function hide(commit) {
    if (!state) return;
    const {
      onDone, trigger, from, to,
    } = state;
    root.hidden = true;
    state = null;
    if (commit) onDone(from, to);
    if (trigger && trigger.focus) trigger.focus();
  }

  months.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-date]');
    if (b && !b.disabled) pick(b.dataset.date, true);
  });
  months.addEventListener('keydown', (e) => {
    const b = e.target.closest('button[data-date]');
    if (!b) return;
    const iso = b.dataset.date;
    const day = (dateOf(iso).getUTCDay() + 6) % 7;
    const moves = {
      ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, Home: -day, End: 6 - day,
    };
    let to = '';
    if (e.key in moves) to = addDays(iso, moves[e.key]);
    else if (e.key === 'PageUp' || e.key === 'PageDown') {
      const d = dateOf(iso);
      const m = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + (e.key === 'PageUp' ? -1 : 1), 1));
      const end = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 0)).getUTCDate();
      m.setUTCDate(Math.min(d.getUTCDate(), end));
      to = isoOf(m);
    } else if (e.key === 'Enter') {
      // the button's own click would follow: pick once
      e.preventDefault();
      if (!b.disabled) pick(iso, true);
      return;
    } else return;
    e.preventDefault();
    state.focus = to < state.min ? state.min : to;
    render(true);
  });
  prev.addEventListener('click', () => {
    if (prev.disabled) return;
    state.view = addMonths(state.view, -1);
    state.focus = state.view < monthStart(state.min) ? state.min : state.view;
    if (state.focus < state.min) state.focus = state.min;
    render();
  });
  next.addEventListener('click', () => {
    state.view = addMonths(state.view, 1);
    state.focus = state.view;
    render();
  });
  typed.forEach(({ input, which }) => input.addEventListener('change', () => {
    const iso = parseTyped(input.value);
    const ok = iso && iso >= state.min && (which === 'from' || !state.from || iso >= state.from);
    input.setAttribute('aria-invalid', input.value && !ok ? 'true' : 'false');
    state[which] = ok ? iso : '';
    if (which === 'from' && state.to && state.to < state.from) state.to = '';
    if (ok) state.focus = iso;
    render();
    input.value = ok || !input.value ? shown(state[which]) : input.value;
  }));
  clear.addEventListener('click', () => {
    state.from = '';
    state.to = '';
    typed.forEach((t) => t.input.setAttribute('aria-invalid', 'false'));
    render();
  });
  cont.addEventListener('click', () => {
    if (!cont.disabled && complete()) hide(true);
  });
  close.addEventListener('click', () => hide(false));
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      hide(false);
    }
  });

  return {
    element: root,
    get open() { return Boolean(state); },
    contains: (node) => root.contains(node)
      || Boolean(state && state.trigger && state.trigger.contains(node)),
    /** Opens for a date or a range; onDone(from, to) on Continue. */
    show({
      mode, from = '', to = '', min = today, trigger, onDone,
    }) {
      const start = from && from >= min ? from : min;
      state = {
        mode, from: from >= min ? from : '', to: mode === 'range' && to >= min ? to : '', min, trigger, onDone, focus: start, view: monthStart(start),
      };
      root.hidden = false;
      render(true);
    },
    hide,
  };
}

/** The passengers' popover: TAP's rules on the steppers (tap-format.js canChange). */
function createPassengers(labels, onChange) {
  const p = {
    adults: 1, youngAdults: 0, children: 0, infants: 0,
  };
  let uk = false;
  boxCount += 1;
  const id = `booking-box-passengers-${boxCount}`;
  const value = el('span', { className: 'booking-box-passengers-value' });
  const button = el('button', {
    type: 'button', className: 'booking-box-field-button', 'aria-expanded': 'false', 'aria-controls': id,
  }, value, icon('caret'));
  const panel = el('div', { className: 'booking-box-passenger-panel', id });
  panel.hidden = true;
  const rows = PASSENGERS.map(([type, key]) => {
    const minus = el('button', {
      type: 'button', 'data-step': '-1', 'aria-label': `${labels.fewer}: ${labels[key]}`,
    }, icon('minus'));
    const plus = el('button', {
      type: 'button', 'data-step': '1', 'aria-label': `${labels.more}: ${labels[key]}`,
    }, icon('plus'));
    const out = el('output', { 'aria-live': 'polite', 'aria-label': labels[key] });
    const row = el(
      'div',
      { className: 'booking-box-passenger', 'data-type': type },
      el('div', { className: 'booking-box-passenger-name' }, el('strong', { text: labels[key] }), el('span', { text: labels[`${key}-range`] })),
      el('div', { className: 'booking-box-stepper' }, minus, out, plus),
    );
    return {
      type, row, minus, plus, out,
    };
  });
  panel.append(...rows.map((r) => r.row));

  function render() {
    rows.forEach((r) => {
      r.out.textContent = String(p[r.type]);
      r.minus.disabled = !canChange(p, r.type, -1, uk);
      r.plus.disabled = !canChange(p, r.type, 1, uk);
      if (r.type === 'youngAdults') r.row.hidden = !uk;
    });
    const total = p.adults + p.youngAdults + p.children + p.infants;
    value.textContent = `${total} ${labels.passengers}`;
  }
  panel.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-step]');
    if (!b || b.disabled) return;
    const { type } = b.closest('[data-type]').dataset;
    const delta = Number(b.dataset.step);
    if (!canChange(p, type, delta, uk)) return;
    p[type] += delta;
    render();
    onChange();
  });
  const toggle = (open) => {
    panel.hidden = !open;
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  button.addEventListener('click', () => toggle(panel.hidden));
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      toggle(false);
      if (button.focus) button.focus();
    }
  });
  render();
  return {
    button,
    panel,
    toggle,
    get value() { return { ...p }; },
    /** A route change: young adults only on a UK route (back to 0 off it, an adult kept). */
    setUk(next) {
      uk = next;
      if (!uk && p.youngAdults) {
        p.youngAdults = 0;
        if (!p.adults) p.adults = 1;
      }
      render();
    },
  };
}

/** A validation message tied to its field (aria-describedby). */
function setError(control, holder, text) {
  let msg = holder.querySelector(':scope > .booking-box-error');
  if (!text) {
    if (msg) msg.remove();
    control.removeAttribute('aria-invalid');
    control.removeAttribute('aria-describedby');
    holder.classList.remove('invalid');
    return false;
  }
  if (!msg) {
    boxCount += 1;
    msg = el('span', { className: 'booking-box-error', id: `booking-box-error-${boxCount}` });
    holder.append(msg);
  }
  msg.textContent = text;
  control.setAttribute('aria-invalid', 'true');
  control.setAttribute('aria-describedby', msg.id);
  holder.classList.add('invalid');
  return true;
}

/** Pulls the box over the hero's bottom (TAP: the card 18 px above it), short of what is in the
    tab bar's way (over-hero.js). */
function placeOverHero(block) {
  const section = block.closest('.section');
  const prev = section && section.previousElementSibling;
  const hero = prev && prev.querySelector('.hero-campaign, .hero, .hero-banner, .hero-card-overlay, .carousel-images');
  if (!hero || typeof hero.getBoundingClientRect !== 'function') return;
  const wide = window.matchMedia && window.matchMedia('(min-width: 1024px)');
  const place = () => {
    section.style.removeProperty('margin-top');
    section.classList.remove('booking-box-over-hero');
    if (!wide || !wide.matches) return;
    const card = block.querySelector('.booking-box-card');
    const tabs = block.querySelector('[role="tablist"]');
    const blockers = [...hero.querySelectorAll('.hero-campaign-dots, .hero-campaign-pause, .hero-campaign-cta, .button-container')]
      .map((x) => x.getBoundingClientRect());
    // (over-hero.js: the card 18 px above the hero's bottom, short of what is in the tab bar's way)
    const pull = overHeroPull({
      hero: hero.getBoundingClientRect(),
      card: card.getBoundingClientRect(),
      tabs: tabs && tabs.offsetWidth ? tabs.getBoundingClientRect() : null,
      top: block.getBoundingClientRect().top,
      blockers,
    });
    if (!pull) return;
    section.style.marginTop = `${-pull}px`;
    section.classList.add('booking-box-over-hero');
  };
  let frame = 0;
  const later = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(place);
  };
  if (typeof requestAnimationFrame !== 'function') return;
  later();
  if (wide && wide.addEventListener) wide.addEventListener('change', later);
  if (typeof ResizeObserver === 'function') new ResizeObserver(later).observe(hero);
}

/** TAP's book tab: trip types, the route (or up to 6 flights), dates, passengers, search. */
function bookPanel({
  labels, today, market, language, origin, airports, corporate, calendar,
}) {
  boxCount += 1;
  const n = boxCount;
  let trip = 'return';
  let dates = { from: '', to: '' };
  const legs = [];

  const comboOpts = (key, value, onChange) => createAirportCombobox({
    label: labels[`${key}-label`],
    placeholder: labels[`${key}-placeholder`],
    value,
    minChars: 0,
    noResultsLabel: labels['no-results-search'],
    fetchSuggestions: (term) => airports().then((list) => matchAirports(list, term)),
    renderOption: (a, li) => {
      const t = optionText(a);
      li.append(
        el('span', { className: 'booking-box-chip', text: a.code }),
        el('span', { className: 'booking-box-option-text' }, el('span', { className: 'booking-box-option-name', text: t.name }), el('span', { className: 'booking-box-option-country', text: t.country })),
      );
    },
    display: fieldText,
    onChange,
  });
  /** An airport field: the combobox with its code chip. */
  const airportField = (key, value, onPicked) => {
    let box;
    const chip = el('span', { className: 'booking-box-chip' });
    const holder = el('div', { className: `booking-box-field booking-box-${key}` });
    const sync = () => {
      const v = box.getValue();
      chip.textContent = v ? v.code : '';
      chip.hidden = !v;
    };
    box = comboOpts(key, value, (v) => {
      sync();
      setError(box.input, holder, '');
      onPicked(v);
    });
    box.input.parentNode.insertBefore(chip, box.input);
    box.input.after(icon('caret'));
    holder.append(box.element);
    sync();
    // the sheet's names for a code-only value once it is loaded
    box.input.addEventListener('focus', () => airports().then((list) => {
      const v = box.getValue();
      if (!v || v.cityName) return;
      const named = list.find((a) => a.code === v.code);
      if (named) box.setValue(named, { silent: true });
      sync();
    }));
    return {
      box, holder, sync, chip,
    };
  };

  const radios = el('div', { className: 'booking-box-trips', role: 'radiogroup' });
  TRIPS.forEach(([value, key]) => {
    const input = el('input', { type: 'radio', name: `booking-box-${n}-trip`, value });
    input.checked = value === trip;
    radios.append(el('label', { className: 'booking-box-radio' }, input, el('span', { text: labels[key] })));
  });
  const miles = el('input', { type: 'checkbox', name: `booking-box-${n}-miles` });
  const options = el(
    'div',
    { className: 'booking-box-options' },
    radios,
    el('label', { className: 'booking-box-check' }, miles, el('span', { text: labels['pay-with-miles'] })),
  );
  if (corporate) {
    const link = newTabLink(corporate.href, corporate.text || labels['enterprise-reservation'], labels, 'booking-box-corporate');
    link.append(icon('external'));
    options.append(link);
  }

  const passengers = createPassengers(labels, () => {});
  const route = {};
  const codeOf = (field) => (field.box.getValue() || {}).code;
  const flightsNow = () => (trip === 'multi-city'
    ? legs : [route]).map((l) => ({ origin: codeOf(l.from), destination: codeOf(l.to) }));
  const updateUk = () => passengers.setUk(isUkRoute(flightsNow()));

  const datesValue = el('span', { className: 'booking-box-dates-value' });
  const datesButton = el('button', {
    type: 'button', className: 'booking-box-field-button', 'aria-haspopup': 'dialog',
  }, datesValue);
  boxCount += 1;
  const datesLabelId = `booking-box-dates-${boxCount}`;
  datesButton.setAttribute('aria-labelledby', `${datesLabelId} ${datesLabelId}-v`);
  datesValue.id = `${datesLabelId}-v`;
  const datesField = el('div', { className: 'booking-box-field booking-box-dates' }, el('span', { className: 'booking-box-label', id: datesLabelId, text: labels.dates }), datesButton);
  const showDates = () => {
    const text = dates.from && trip === 'return' && dates.to ? `${shown(dates.from)} – ${shown(dates.to)}` : shown(dates.from);
    datesValue.textContent = text || labels['select-date'];
    datesButton.classList.toggle('empty', !text);
  };
  const openDates = () => calendar.show({
    mode: trip === 'return' ? 'range' : 'single',
    from: dates.from,
    to: dates.to,
    trigger: datesButton,
    onDone: (from, to) => {
      dates = { from, to: trip === 'return' ? to : '' };
      setError(datesButton, datesField, '');
      showDates();
    },
  });
  datesButton.addEventListener('click', openDates);

  route.from = airportField('origin', origin, (v) => {
    updateUk();
    if (v && route.to.box.input.focus) route.to.box.input.focus();
  });
  route.to = airportField('destination', null, (v) => {
    updateUk();
    if (v) openDates();
  });
  const swap = el('button', { type: 'button', className: 'booking-box-swap', 'aria-label': labels['aria-label-swap'] }, icon('swap'));
  swap.addEventListener('click', () => {
    const a = route.from.box.getValue();
    const b = route.to.box.getValue();
    route.from.box.setValue(b, { silent: true });
    route.to.box.setValue(a, { silent: true });
    route.from.sync();
    route.to.sync();
    updateUk();
  });
  const routeRow = el('div', { className: 'booking-box-route' }, route.from.holder, swap, route.to.holder, datesField);

  // multi-city: one row per flight
  const legList = el('div', { className: 'booking-box-legs' });
  legList.hidden = true;
  const addFlight = el('button', { type: 'button', className: 'booking-box-add-flight' }, icon('plus'), labels['add-more-flights']);
  const legsBox = el('div', { className: 'booking-box-multi' }, legList, addFlight);
  legsBox.hidden = true;
  const renumber = () => {
    legs.forEach((l, i) => {
      l.row.querySelector('.booking-box-leg-number').textContent = String(i + 1);
      l.remove.hidden = legs.length <= 2;
    });
    addFlight.disabled = legs.length >= MAX_FLIGHTS;
  };
  const legDates = (leg) => {
    leg.value.textContent = leg.date ? shown(leg.date) : labels['select-date'];
    leg.dateButton.classList.toggle('empty', !leg.date);
  };
  function addLeg(from, to, date) {
    if (legs.length >= MAX_FLIGHTS) return;
    const leg = { date: date || '' };
    leg.from = airportField('origin', from, updateUk);
    leg.to = airportField('destination', to, updateUk);
    leg.value = el('span', { className: 'booking-box-dates-value' });
    leg.dateButton = el('button', { type: 'button', className: 'booking-box-field-button', 'aria-haspopup': 'dialog' }, leg.value);
    leg.dateField = el('div', { className: 'booking-box-field booking-box-dates' }, el('span', { className: 'booking-box-label', text: labels['departure-date'] }), leg.dateButton);
    leg.dateButton.setAttribute('aria-label', labels['departure-date']);
    leg.dateButton.addEventListener('click', () => {
      const i = legs.indexOf(leg);
      const before = legs.slice(0, i).map((l) => l.date).filter(Boolean).pop();
      calendar.show({
        mode: 'single',
        from: leg.date,
        min: before && before > today ? before : today,
        trigger: leg.dateButton,
        onDone: (d) => {
          leg.date = d;
          // a later flight before this one: picked again
          legs.slice(i + 1).forEach((l) => {
            if (l.date && l.date < d) {
              l.date = '';
              legDates(l);
            }
          });
          setError(leg.dateButton, leg.dateField, '');
          legDates(leg);
        },
      });
    });
    leg.remove = el('button', { type: 'button', className: 'booking-box-remove-flight', 'aria-label': labels['remove-flight'] }, icon('close'));
    leg.remove.addEventListener('click', () => {
      legs.splice(legs.indexOf(leg), 1);
      leg.row.remove();
      renumber();
      updateUk();
    });
    leg.row = el(
      'div',
      { className: 'booking-box-leg' },
      el('span', { className: 'booking-box-leg-number', 'aria-hidden': 'true' }),
      leg.from.holder,
      leg.to.holder,
      leg.dateField,
      leg.remove,
    );
    legs.push(leg);
    legList.append(leg.row);
    legDates(leg);
    renumber();
  }
  addFlight.addEventListener('click', () => {
    if (addFlight.disabled) return;
    const last = legs[legs.length - 1];
    addLeg(last && last.to.box.getValue(), null, '');
    updateUk();
  });

  const passengersField = el(
    'div',
    { className: 'booking-box-field booking-box-passengers' },
    el('span', { className: 'booking-box-label', text: labels['passengers-label'] }),
    passengers.button,
    passengers.panel,
  );
  passengers.button.setAttribute('aria-label', labels['passengers-label']);
  const search = el('button', { type: 'button', className: 'booking-box-search' }, labels.search);
  const fields = el('div', { className: 'booking-box-fields' }, routeRow, legsBox, passengersField, search);

  radios.addEventListener('change', (e) => {
    const input = e.target.closest('input[type="radio"]');
    if (!input || !input.checked) return;
    trip = input.value;
    const multi = trip === 'multi-city';
    if (multi && !legs.length) {
      addLeg(route.from.box.getValue(), route.to.box.getValue(), dates.from);
      addLeg(route.to.box.getValue(), null, '');
    }
    routeRow.classList.toggle('booking-box-multi-on', multi);
    route.from.holder.hidden = multi;
    route.to.holder.hidden = multi;
    swap.hidden = multi;
    datesField.hidden = multi;
    legsBox.hidden = !multi;
    legList.hidden = !multi;
    if (trip !== 'return') dates.to = '';
    setError(datesButton, datesField, '');
    showDates();
    updateUk();
  });

  /** The visitor's search, or null with the fields' messages. */
  function read() {
    const req = labels['validation-required'];
    let bad = null;
    const need = (cond, control, holder, text) => {
      const failed = setError(control, holder, cond ? '' : text);
      if (failed && !bad) bad = control;
    };
    let flights;
    if (trip === 'multi-city') {
      flights = legs.map((l) => {
        const o = (l.from.box.getValue() || {}).code;
        const d = (l.to.box.getValue() || {}).code;
        need(o, l.from.box.input, l.from.holder, req);
        need(d && d !== o, l.to.box.input, l.to.holder, d ? labels['same-airports'] : req);
        need(l.date, l.dateButton, l.dateField, req);
        return { origin: o, destination: d, date: l.date };
      });
    } else {
      const o = (route.from.box.getValue() || {}).code;
      const d = (route.to.box.getValue() || {}).code;
      need(o, route.from.box.input, route.from.holder, req);
      need(d && d !== o, route.to.box.input, route.to.holder, d ? labels['same-airports'] : req);
      need(dates.from && (trip !== 'return' || dates.to), datesButton, datesField, req);
      flights = [{ origin: o, destination: d, date: dates.from }];
    }
    if (bad) {
      if (bad.focus) bad.focus();
      return null;
    }
    const p = passengers.value;
    return {
      market,
      language,
      tripType: trip,
      flights,
      ...(trip === 'return' ? { returnDate: dates.to } : {}),
      adults: p.adults,
      youngAdults: p.youngAdults,
      children: p.children,
      infants: p.infants,
      payWithMiles: miles.checked,
    };
  }
  search.addEventListener('click', () => {
    const s = read();
    if (!s) return;
    let url;
    try {
      url = buildTapDeeplink(s, window.crypto.randomUUID());
    } catch (e) {
      return;
    }
    window.open(url, '_blank', 'noopener');
  });

  showDates();
  updateUk();
  const panel = el('div', { className: 'booking-box-book' }, options, fields, calendar.element);
  return {
    panel,
    passengers,
  };
}

/** The check-in and manage tabs: Login (TAP's account, on www) and the booking's code and name. */
function findPanel({
  labels, login, onFind,
}) {
  boxCount += 1;
  const n = boxCount;
  const left = el(
    'div',
    { className: 'booking-box-login-column' },
    el('h3', { text: labels['ibe.login'] }),
    el('p', { text: labels['login-and-make-easier'] }),
  );
  if (login) left.append(newTabLink(login.href, login.text || labels['ibe.login'], labels, 'booking-box-login'));
  const field = (key, name) => {
    const input = el('input', {
      type: 'text', id: `booking-box-${n}-${name}`, name, autocomplete: name === 'last-name' ? 'family-name' : 'off',
    });
    const holder = el('div', { className: 'booking-box-boxed' }, el('label', { for: input.id, text: labels[key] }), input);
    return { input, holder };
  };
  const code = field('ibe.reservation-number', 'code');
  const name = field('ibe.passenger-lastname', 'last-name');
  const find = el('button', { type: 'submit', className: 'booking-box-find' }, labels['ibe.find-reservation']);
  const form = el('form', { className: 'booking-box-find-form', novalidate: true }, el('h3', { text: labels['ibe.reservation-details'] }), code.holder, name.holder, find);
  const submit = (e) => {
    e.preventDefault();
    const c = code.input.value.trim();
    const l = name.input.value.trim();
    const badCode = setError(code.input, code.holder, isBookingCode(c) ? '' : labels[c ? 'validation-invalid' : 'validation-required']);
    const badName = setError(name.input, name.holder, l.length >= 2 ? '' : labels[l ? 'validation-invalid' : 'validation-required']);
    if (badCode || badName) {
      const first = badCode ? code.input : name.input;
      if (first.focus) first.focus();
      return;
    }
    window.open(onFind(c, l), '_blank', 'noopener');
  };
  find.addEventListener('click', submit);
  form.addEventListener('submit', submit);
  return el('div', { className: 'booking-box-find-panel' }, left, form);
}

export default async function decorate(block, { today: fixedToday } = {}) {
  const config = readConfigRows(block);
  const format = config.format ? config.format.text.toLowerCase() : '';
  block.replaceChildren();
  if (format !== 'tap') return;

  const labels = readLabels(config);
  const locale = getLocale();
  const lang = (locale.lang || 'en').slice(0, 2);
  const market = ((config.market && config.market.text) || locale.country || '').toUpperCase();
  const language = ((config.language && config.language.text) || lang).toLowerCase();
  const today = fixedToday || localToday();
  // a link's text, unless it is its URL (then the label's)
  const linkOf = (row) => {
    if (!row || !row.link) return null;
    const text = row.link.textContent.trim();
    return { href: row.link.getAttribute('href'), text: /^https?:\/\//.test(text) ? '' : text };
  };
  const sheetHref = (config.airports && config.airports.link && config.airports.link.getAttribute('href'))
    || (config.airports && config.airports.text) || `${locale.base}/booking/airports.json`;
  const sheetUrl = `${sheetHref}${sheetHref.includes('?') ? '&' : '?'}limit=5000`;
  let sheet;
  const airports = () => {
    if (!sheet) {
      sheet = fetch(sheetUrl)
        .then((r) => (r.ok ? r.json() : null))
        .then(airportsFromSheet)
        .catch(() => {
          sheet = null;
          return [];
        });
    }
    return sheet;
  };
  // no Default origin row: the root's home airport (www's market settings), else the market's
  const originCode = ((config['default-origin'] && config['default-origin'].text)
    || marketOrigin(market, locale.homeAirport)).toUpperCase();
  const originName = config['default-origin-name'] && config['default-origin-name'].text;
  const origin = originCode ? { code: originCode } : null;
  if (origin && originName) {
    const [city, country] = originName.split(/\s*,\s*/);
    Object.assign(origin, { cityName: city, countryName: country || '' });
  }
  const corporate = linkOf(config['corporate-link']) || { href: CORPORATE_LINK, text: '' };
  // without the rows: www's own box on the root's homepage (its login, its flight status tab)
  const wwwRoot = `${siteOrigin()}/${language}-${market.toLowerCase()}`;
  const login = linkOf(config['login-page']) || { href: `${wwwRoot}#special-anchor-login`, text: '' };
  const status = linkOf(config['flight-status-page'])
    || { href: `${wwwRoot}#special-anchor-flight-status`, text: '' };
  const tabTexts = config.tabs ? config.tabs.list : [];

  boxCount += 1;
  const id = `booking-box-${boxCount}`;
  const calendar = createCalendar(labels, language, today);
  const book = bookPanel({
    labels, today, market, language, origin, airports, corporate, calendar,
  });
  const panels = {
    'book-flight': book.panel,
    'check-in': findPanel({
      labels, login, onFind: (code, lastName) => tapCheckinUrl({ code, lastName, language }),
    }),
    'my-travels': findPanel({
      labels,
      login,
      onFind: (code, lastName) => tapManageUrl({
        code, lastName, market, language,
      }),
    }),
    'flight-status': el(
      'div',
      { className: 'booking-box-status' },
      el('p', { text: labels['flight-status-text'] }),
      newTabLink(status.href, status.text || labels['ibe.flight-status'], labels, 'booking-box-status-link'),
    ),
  };

  const tablist = el('div', { className: 'booking-box-tabs', role: 'tablist' });
  const card = el('div', { className: 'booking-box-card' });
  const tabs = TABS.map(([tab, key], i) => {
    const button = el('button', {
      type: 'button', role: 'tab', id: `${id}-tab-${tab}`, 'aria-controls': `${id}-${tab}`, 'data-tab': tab, 'aria-selected': 'false', tabindex: '-1',
    }, icon(tab), el('span', { text: tabTexts[i] || labels[key] }));
    const panel = el('div', {
      role: 'tabpanel', id: `${id}-${tab}`, 'aria-labelledby': button.id, 'data-tab': tab, className: `booking-box-panel booking-box-panel-${tab}`,
    }, panels[tab]);
    panel.hidden = true;
    tablist.append(button);
    card.append(panel);
    return { tab, button, panel };
  });
  const select = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t.tab === tab;
      t.button.setAttribute('aria-selected', on ? 'true' : 'false');
      t.button.setAttribute('tabindex', on ? '0' : '-1');
      t.panel.hidden = !on;
      if (on && focus && t.button.focus) t.button.focus();
    });
    block.dataset.tab = tab;
    if (calendar.open) calendar.hide(false);
  };
  tablist.addEventListener('click', (e) => {
    const b = e.target.closest('[role="tab"]');
    if (b) select(b.dataset.tab);
  });
  tablist.addEventListener('keydown', (e) => {
    const b = e.target.closest('[role="tab"]');
    if (!b) return;
    const i = tabs.findIndex((t) => t.button === b);
    const to = {
      ArrowRight: (i + 1) % tabs.length,
      ArrowLeft: (i + tabs.length - 1) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    select(tabs[to].tab, true);
  });

  const fromHash = (scroll) => {
    const tab = String(window.location.hash || '').replace(/^#/, '').replace(/^special-anchor-/, '');
    if (!tabs.some((t) => t.tab === tab)) return false;
    select(tab);
    if (scroll && block.scrollIntoView) block.scrollIntoView({ block: 'start' });
    return true;
  };
  if (!fromHash(true)) select('book-flight');
  window.addEventListener('hashchange', () => fromHash(true));

  // the popovers close on a press or the focus outside them (a press, not a click: a picked day
  // is re-rendered before its click reaches the document)
  const outside = (e) => {
    if (calendar.open && !calendar.contains(e.target)) calendar.hide(false);
    const p = book.passengers;
    const inPassengers = p.panel.contains(e.target) || p.button.contains(e.target);
    if (!p.panel.hidden && !inPassengers) p.toggle(false);
  };
  document.addEventListener('pointerdown', outside);
  document.addEventListener('focusin', outside);

  block.append(tablist, card);
  placeOverHero(block);
}
