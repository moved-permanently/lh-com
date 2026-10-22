import { getLocale, LIVE_ORIGIN } from '../../scripts/locale.js';
import {
  readConfigRows, pick, resolveLabels, parseAirportCode, parseAirportName,
} from '../../scripts/block-config.js';
import { createAirportCombobox } from '../../scripts/airport-combobox.js';
import { searchAirportsWithSource } from '../../scripts/lh-api.js';
import { markSource } from '../../scripts/lh-data.js';

/* ---------------------------------------------------------------------------------------------
 * Data contract. Request building, response mapping and the hand-off URL live here so a
 * captured live request only requires changes in this section.
 * ------------------------------------------------------------------------------------------- */

/*
 * Airport autocomplete: searchAirportsWithSource (scripts/lh-api.js), shared with flight-search;
 * the block's only live data. data-lh-source tells where the last suggestions came from.
 */

/** Tab keys by authored position; "number" is the source's activeTab value. */
const TAB_KEYS = ['number', 'route', 'airport'];

/**
 * Builds the live flight status URL the search hands off to. This function is the single
 * place where form values are mapped to query parameters. The parameter names are an
 * assumption (the live widget's bundle was not captured); the live page opens on its own form
 * if it ignores them.
 * @param {Object} query { type: 'number'|'route'|'airport', airline, flightNumber, origin,
 *   destination, airport, direction: 'departure'|'arrival', date: 'YYYY-MM-DD' }
 * @param {Object} locale result of getLocale()
 * @param {string} [submitUrl] authored live page URL
 * @returns {string}
 */
function buildFlightStatusUrl(query, locale, submitUrl) {
  let url;
  try {
    url = new URL(submitUrl || `${locale.base}/timetable-and-flight-status`, LIVE_ORIGIN);
    // a relative or local link means the live page: this page is its migrated copy
    if (url.origin === window.location.origin) url = new URL(`${url.pathname}${url.search}`, LIVE_ORIGIN);
  } catch (e) {
    url = new URL(`${locale.base}/timetable-and-flight-status`, LIVE_ORIGIN);
  }
  const params = { tab: query.type, date: query.date };
  if (query.type === 'number') params.flightNumber = `${query.airline}${query.flightNumber}`;
  if (query.type === 'route') {
    params.origin = query.origin;
    params.destination = query.destination;
  }
  if (query.type === 'airport') {
    params.airport = query.airport;
    params.direction = query.direction;
  }
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });
  return url.toString();
}

/* ------------------------------------------------------------------------------------------- */

const DEFAULT_AIRLINES = ['OS', '4Y', 'EN', 'LX', 'EW', 'WK', 'VL', 'AZ', 'SN', 'LH'];
const DEFAULT_AIRLINE = 'LH';

/** UI strings that are not visible authored content; any can be overridden by a block row. */
const DEFAULT_LABELS = {
  en: {
    'number tab label': 'Flight number',
    'route tab label': 'Flight route',
    'airport tab label': 'Airport',
    'tabs label': 'Search flight status',
    'airline label': 'Airline',
    'flight number label': 'Flight number',
    'flight number error': 'Flight number is required',
    'flight number invalid error': 'Please enter a valid flight number (1 to 4 digits)',
    'date label': 'Date',
    'date hint': 'The flight status is available starting {days} days in advance.',
    'from label': 'From',
    'to label': 'To',
    'airport label': 'Airport',
    'direction label': 'Departures or arrivals',
    'departure label': 'Departure',
    'arrival label': 'Arrival',
    'submit label': 'Search',
    'origin error': 'Please select an origin',
    'destination error': 'Please select a destination',
    'airport error': 'Please select an airport',
    'no results label': 'No matching airports',
  },
  de: {
    'number tab label': 'Flugnummer',
    'route tab label': 'Flugstrecke',
    'airport tab label': 'Flughafen',
    'tabs label': 'Flugstatus suchen',
    'airline label': 'Airline',
    'flight number label': 'Flugnummer',
    'flight number error': 'Flugnummer ist erforderlich',
    'flight number invalid error': 'Bitte geben Sie eine gültige Flugnummer ein (1 bis 4 Ziffern)',
    'date label': 'Datum',
    'date hint': 'Der Flugstatus ist ab {days} Tage im Voraus verfügbar.',
    'from label': 'Von',
    'to label': 'Nach',
    'airport label': 'Flughafen',
    'direction label': 'Abflüge oder Ankünfte',
    'departure label': 'Abflug',
    'arrival label': 'Ankunft',
    'submit label': 'Suchen',
    'origin error': 'Bitte wählen Sie einen Abflugort',
    'destination error': 'Bitte wählen Sie ein Ziel',
    'airport error': 'Bitte wählen Sie einen Flughafen',
    'no results label': 'Keine passenden Flughäfen',
  },
};

let instance = 0;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function isoDate(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function clampInt(value, fallback, max) {
  const n = parseInt(value, 10);
  if (Number.isNaN(n) || n < 0) return fallback;
  return Math.min(n, max);
}

/** Selectable dates from today - before to today + after, formatted for the locale. */
function dateOptions(before, after, locale) {
  const format = new Intl.DateTimeFormat(`${locale.lang}-${locale.country.toUpperCase()}`, {
    weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric',
  });
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const options = [];
  for (let offset = -before; offset <= after; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    options.push({ value: isoDate(date), label: format.format(date), today: offset === 0 });
  }
  return options;
}

/** Wraps a control with an error message wired up through aria-invalid/aria-describedby. */
function withError(id, control, wrap) {
  const message = el('p', 'flight-status-error');
  message.id = `${id}-error`;
  message.hidden = true;
  wrap.append(message);
  const hintId = control.getAttribute('aria-describedby') || '';
  return (text) => {
    message.textContent = text || '';
    message.hidden = !text;
    if (text) {
      message.setAttribute('role', 'alert');
      control.setAttribute('aria-invalid', 'true');
      control.setAttribute('aria-describedby', [message.id, hintId].filter(Boolean).join(' '));
    } else {
      message.removeAttribute('role');
      control.removeAttribute('aria-invalid');
      if (hintId) control.setAttribute('aria-describedby', hintId);
      else control.removeAttribute('aria-describedby');
    }
  };
}

function selectField(id, label, options, selected, hint) {
  const wrap = el('div', 'flight-status-field');
  const labelEl = el('label', '', label);
  const select = el('select');
  select.id = id;
  labelEl.htmlFor = id;
  options.forEach((o) => {
    const option = el('option', '', o.label);
    option.value = o.value;
    option.selected = o.value === selected;
    select.append(option);
  });
  wrap.append(labelEl, select);
  if (hint) {
    const hintEl = el('p', 'flight-status-hint', hint);
    hintEl.id = `${id}-hint`;
    select.setAttribute('aria-describedby', hintEl.id);
    wrap.append(hintEl);
  }
  return { wrap, select };
}

function airportField(id, label, value, locale, labels, block) {
  const wrap = el('div', 'flight-status-field');
  const combobox = createAirportCombobox({
    label,
    name: id,
    value,
    fetchSuggestions: async (term) => {
      const { list, source } = await searchAirportsWithSource(term, locale);
      markSource(block, { suggestions: source }, ['suggestions']);
      return list;
    },
    noResultsLabel: labels['no results label'],
  });
  wrap.append(combobox.element);
  const setError = withError(id, combobox.input, wrap);
  combobox.input.addEventListener('blur', () => {
    if (combobox.getValue()) setError('');
  });
  return { wrap, combobox, setError };
}

/** WAI-ARIA tabs with automatic activation and arrow/Home/End keys. */
function buildTabs(id, tabs, panels, active, label) {
  const tablist = el('div', 'flight-status-tabs');
  tablist.setAttribute('role', 'tablist');
  tablist.setAttribute('aria-label', label);
  const buttons = tabs.map((tab, i) => {
    const button = el('button', 'flight-status-tab', tab.label);
    button.type = 'button';
    button.id = `${id}-tab-${tab.key}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', panels[i].id);
    panels[i].setAttribute('role', 'tabpanel');
    panels[i].setAttribute('aria-labelledby', button.id);
    panels[i].tabIndex = 0;
    return button;
  });
  const select = (index, focus) => {
    buttons.forEach((button, i) => {
      const on = i === index;
      button.setAttribute('aria-selected', on ? 'true' : 'false');
      button.tabIndex = on ? 0 : -1;
      panels[i].hidden = !on;
    });
    if (focus) buttons[index].focus();
  };
  buttons.forEach((button, i) => {
    button.addEventListener('click', () => select(i, false));
    button.addEventListener('keydown', (e) => {
      const last = buttons.length - 1;
      const next = {
        ArrowRight: i === last ? 0 : i + 1,
        ArrowLeft: i === 0 ? last : i - 1,
        Home: 0,
        End: last,
      }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      select(next, true);
    });
  });
  tablist.append(...buttons);
  select(active, false);
  return tablist;
}

export default function decorate(block) {
  instance += 1;
  const id = `flight-status-${instance}`;
  const locale = getLocale();
  const config = readConfigRows(block);
  const labels = resolveLabels(DEFAULT_LABELS, config, locale.lang);
  const text = (...keys) => (pick(config, ...keys) || {}).text || '';

  const authoredTabs = (pick(config, 'tabs') || { list: [] }).list.slice(0, TAB_KEYS.length);
  const tabs = (authoredTabs.length ? authoredTabs : TAB_KEYS.map((k) => labels[`${k} tab label`]))
    .map((label, i) => ({ key: TAB_KEYS[i], label }));
  const activeText = text('active-tab').toLowerCase();
  const activeIndex = Math.max(0, tabs.findIndex((t) => activeText
    && (t.label.toLowerCase() === activeText || t.key === activeText)));

  const airlines = (pick(config, 'airlines') || { list: [] }).list
    .map((a) => a.toUpperCase()).filter((a) => /^[A-Z0-9]{2}$/.test(a));
  const airlineList = airlines.length ? airlines : DEFAULT_AIRLINES;
  const defaultAirline = text('default-airline').toUpperCase();
  let selectedAirline = DEFAULT_AIRLINE;
  if (airlineList.includes(defaultAirline)) selectedAirline = defaultAirline;
  else if (!airlineList.includes(DEFAULT_AIRLINE)) [selectedAirline] = airlineList;

  const daysBefore = clampInt(text('days-before'), 1, 7);
  const daysAfter = clampInt(text('days-after'), 5, 14);
  const dates = dateOptions(daysBefore, daysAfter, locale);
  const todayValue = (dates.find((d) => d.today) || dates[0]).value;
  const hint = labels['date hint'].replace(/\{days\}/g, daysAfter);

  const liveRow = pick(config, 'live-page', 'submit-url');
  let submitUrl = '';
  if (liveRow) submitUrl = liveRow.link ? liveRow.link.getAttribute('href') : liveRow.text;
  const airportValue = text('default-airport');
  const home = parseAirportCode(airportValue)
    ? { code: parseAirportCode(airportValue), name: parseAirportName(airportValue) }
    : { code: locale.homeAirport, name: '' };

  const go = (query) => window.location.assign(buildFlightStatusUrl(query, locale, submitUrl));
  const makeForm = (key) => {
    const form = el('form', `flight-status-form flight-status-form-${key}`);
    form.noValidate = true;
    return form;
  };
  const makeSubmit = () => {
    const actions = el('div', 'flight-status-actions');
    const button = el('button', 'flight-status-submit button', labels['submit label']);
    button.type = 'submit';
    actions.append(button);
    return actions;
  };
  const dateField = (key) => selectField(`${id}-${key}-date`, labels['date label'], dates, todayValue, hint);

  const builders = {
    number() {
      const form = makeForm('number');
      const airline = selectField(
        `${id}-airline`,
        labels['airline label'],
        airlineList.map((a) => ({ value: a, label: a })),
        selectedAirline,
      );
      const numberWrap = el('div', 'flight-status-field flight-status-number');
      const numberLabel = el('label', '', labels['flight number label']);
      const number = el('input');
      number.type = 'text';
      number.id = `${id}-flight-number`;
      number.name = 'flightNumber';
      number.inputMode = 'numeric';
      number.autocomplete = 'off';
      number.maxLength = 6;
      number.required = true;
      number.placeholder = labels['flight number label'];
      numberLabel.htmlFor = number.id;
      numberWrap.append(numberLabel, number);
      const setError = withError(number.id, number, numberWrap);
      const date = dateField('number');
      form.append(airline.wrap, numberWrap, date.wrap, makeSubmit());
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const value = number.value.replace(/\s+/g, '').toUpperCase();
        // a typed airline prefix (LH400) wins over the select
        const match = value.match(/^([A-Z][A-Z0-9]|\d[A-Z])?(\d{1,4})$/);
        if (!value || !match) {
          setError(value ? labels['flight number invalid error'] : labels['flight number error']);
          number.focus();
          return;
        }
        setError('');
        go({
          type: 'number', airline: match[1] || airline.select.value, flightNumber: match[2], date: date.select.value,
        });
      });
      return form;
    },
    route() {
      const form = makeForm('route');
      const from = airportField(`${id}-origin`, labels['from label'], home, locale, labels, block);
      const to = airportField(`${id}-destination`, labels['to label'], null, locale, labels, block);
      const date = dateField('route');
      form.append(from.wrap, to.wrap, date.wrap, makeSubmit());
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const origin = (from.combobox.getValue() || {}).code;
        const destination = (to.combobox.getValue() || {}).code;
        from.setError(origin ? '' : labels['origin error']);
        to.setError(destination ? '' : labels['destination error']);
        if (!origin) from.combobox.focus();
        else if (!destination) to.combobox.focus();
        else {
          go({
            type: 'route', origin, destination, date: date.select.value,
          });
        }
      });
      return form;
    },
    airport() {
      const form = makeForm('airport');
      const airport = airportField(`${id}-airport`, labels['airport label'], home, locale, labels, block);
      const direction = el('fieldset', 'flight-status-direction');
      direction.append(el('legend', 'flight-status-sr-only', labels['direction label']));
      ['departure', 'arrival'].forEach((value, i) => {
        const label = el('label', 'flight-status-radio');
        const radio = el('input');
        radio.type = 'radio';
        radio.name = `${id}-direction`;
        radio.value = value;
        radio.checked = i === 0;
        label.append(radio, document.createTextNode(` ${labels[`${value} label`]}`));
        direction.append(label);
      });
      const date = dateField('airport');
      form.append(airport.wrap, direction, date.wrap, makeSubmit());
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const { code } = airport.combobox.getValue() || {};
        airport.setError(code ? '' : labels['airport error']);
        if (!code) {
          airport.combobox.focus();
          return;
        }
        const checked = direction.querySelector('input:checked');
        go({
          type: 'airport', airport: code, direction: checked ? checked.value : 'departure', date: date.select.value,
        });
      });
      return form;
    },
  };

  const panels = tabs.map((tab) => {
    const panel = el('div', `flight-status-panel flight-status-panel-${tab.key}`);
    panel.id = `${id}-panel-${tab.key}`;
    panel.append(builders[tab.key]());
    return panel;
  });

  if (tabs.length > 1) {
    block.replaceChildren(buildTabs(id, tabs, panels, activeIndex, labels['tabs label']), ...panels);
  } else {
    block.replaceChildren(...panels);
  }
}
