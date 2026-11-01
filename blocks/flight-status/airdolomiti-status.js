import { resolveLabels } from '../../scripts/block-config.js';
import { submitShopHandoff } from '../../scripts/shop-handoff.js';
import {
  adLang, fetchAirports, fetchFlightsByRoute, fetchFlightsByAirport, requestFlightStatus,
} from '../../scripts/airdolomiti-api.js';

/*
 * Air Dolomiti's flight status by route and airport (flight-status in the format airdolomiti: rows
 * Submit method post and Format airdolomiti, brand airdolomiti), as www.airdolomiti.it/stato-volo
 * (recorded 2026-11-01): the airports from api.airdolomiti.it/v1/airports, the search lists the
 * flights (GET /v1/flights/by-route/<ORIG>-<DEST> or /v1/flights/by-airport/<CODE>, type
 * departure|destination), shown as www's result cards below the form; a card asks POST
 * /v1/bookings/flight-status {flight_date, flight_number} and posts the answer's payload to its url
 * (digital.airdolomiti.it only), as www's card does.
 */

/** www's texts (its flight status component, 2026-11-01); a block row with the key wins. */
const LABELS = {
  it: {
    'origin label': 'Origine',
    'destination label': 'Destinazione',
    'swap label': 'Scambia origine e destinazione',
    'airport label': 'Aeroporto',
    'departure label': 'Partenza',
    'arrival label': 'Arrivo',
    'results heading': 'Risultati per {date}',
    'result card label': 'Dettagli del volo {flight} da {origin} a {destination}',
    'result flight number': 'Numero di volo',
    'no results': 'Nessun risultato trovato',
    'search error': 'Al momento non è possibile completare la ricerca. Riprova più tardi.',
  },
  en: {
    'origin label': 'From',
    'destination label': 'To',
    'swap label': 'Swap origin and destination',
    'airport label': 'Airport',
    'departure label': 'Departure',
    'arrival label': 'Arrival',
    'results heading': 'Search results for {date}',
    'result card label': 'Flight details for {flight} from {origin} to {destination}',
    'result flight number': 'Flight number',
    'no results': 'No results found',
    'search error': 'Your search could not be completed right now. Please try again later.',
  },
  de: {
    'origin label': 'Von',
    'destination label': 'Nach',
    'swap label': 'Herkunft und Ziel tauschen',
    'airport label': 'Flughafen',
    'departure label': 'Abflug',
    'arrival label': 'Ankunft',
    'results heading': 'Suchergebnisse für {date}',
    'result card label': 'Flugdetails für {flight} von {origin} nach {destination}',
    'result flight number': 'Flugnummer',
    'no results': 'keine Ergebnisse gefunden',
    'search error': 'Die Suche ist gerade nicht möglich. Bitte versuchen Sie es später noch einmal.',
  },
};

/** www's weekday abbreviations in the results heading, Monday first ("dom", "Sun", "So."). */
const WEEKDAYS = {
  it: ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'],
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  de: ['Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.', 'So.'],
};

/** A day (yyyy-mm-dd) as www's results heading writes it: "dom 01/11/2026". */
export function resultDate(iso, lang) {
  const [y, m, d] = iso.split('-').map(Number);
  const day = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
  return `${(WEEKDAYS[lang] || WEEKDAYS.it)[day]} ${iso.split('-').reverse().join('/')}`;
}

/** Whether a block's rows and the page's brand ask for Air Dolomiti's format. */
export function isAirdolomitiFormat(text, brand) {
  return /^post$/i.test(text('submit-method', 'method'))
    && /^airdolomiti$/i.test(text('format'))
    && Boolean(brand && brand.booking && brand.booking.format === 'airdolomiti');
}

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
const selectedValue = (select) => ([...select.options].find((o) => o.selected) || { value: '' }).value;
const fill = (template, values) => template.replace(/\{(\w+)\}/g, (m, k) => (k in values ? values[k] : m));

function setOptions(select, placeholder, options) {
  const empty = el('option', '', placeholder);
  empty.value = '';
  empty.hidden = true;
  empty.selected = true;
  select.replaceChildren(empty, ...options.map(([value, label]) => {
    const o = el('option', '', label);
    o.value = value;
    return o;
  }));
}

/**
 * The route and airport forms in Air Dolomiti's format.
 * @param {Object} o id, config (readConfigRows), dateField(key) -> {wrap, select},
 *   makeSubmit() -> actions element
 * @returns {{route: function(): Element, airport: function(): Element}}
 */
export function airdolomitiBuilders({
  id, config, dateField, makeSubmit,
}) {
  const lang = adLang();
  const labels = resolveLabels(LABELS, config, lang);
  const name = (a) => a[`name_${lang}`] || a.name_en || a.iata_code;
  const byName = (a, b) => a[1].localeCompare(b[1], lang);
  const airports = fetchAirports().catch(() => []);
  const dateText = (iso) => resultDate(iso, lang);

  const selectField = (key, labelText) => {
    const wrap = el('div', 'flight-status-field flight-status-ad-airport');
    const label = el('label', '', labelText);
    const select = el('select', 'flight-status-select');
    select.id = `${id}-${key}`;
    select.name = key;
    label.htmlFor = select.id;
    wrap.append(label, select);
    return { wrap, select };
  };

  /** The results below a form: www's heading and cards; a card hands its flight off. */
  const results = () => {
    const box = el('div', 'flight-status-results');
    box.setAttribute('aria-live', 'polite');
    const error = (text) => {
      const p = el('p', 'flight-status-error', text);
      p.setAttribute('role', 'alert');
      return p;
    };
    const show = (flights, date) => {
      if (!flights.length) {
        box.replaceChildren(el('p', 'flight-status-no-results', labels['no results']));
        return;
      }
      const list = el('div', 'flight-status-result-list');
      flights.forEach((f) => {
        const flight = `${f.airline_code || ''}${f.flight_number || ''}`;
        const card = el('button', 'flight-status-result');
        card.type = 'button';
        card.setAttribute('aria-label', fill(labels['result card label'], { flight, origin: f.airport_from, destination: f.airport_to }));
        const route = el('span', 'flight-status-result-route');
        const end = (city, code) => {
          const e = el('span', 'flight-status-result-end');
          e.append(el('span', 'flight-status-result-city', city || ''), el('span', 'flight-status-result-code', code || ''));
          return e;
        };
        route.append(end(f.airport_from, f.airport_from_iata_code), el('span', 'flight-status-result-plane'), end(f.airport_to, f.airport_to_iata_code));
        const number = el('span', 'flight-status-result-number');
        number.append(el('span', 'flight-status-result-label', labels['result flight number']), el('span', 'flight-status-result-flight', flight));
        card.append(route, number);
        card.addEventListener('click', async () => {
          if (card.getAttribute('aria-busy') === 'true') return;
          card.setAttribute('aria-busy', 'true');
          box.querySelectorAll('.flight-status-error').forEach((n) => n.remove());
          try {
            submitShopHandoff(await requestFlightStatus({ flightNumber: flight, date }, lang));
          } catch (e) {
            box.append(error(labels['search error']));
          } finally {
            card.removeAttribute('aria-busy');
          }
        });
        list.append(card);
      });
      box.replaceChildren(el('h2', 'flight-status-results-heading', fill(labels['results heading'], { date: dateText(date) })), list);
    };
    return {
      box,
      show,
      fail: () => box.replaceChildren(error(labels['search error'])),
    };
  };

  const search = async (form, out, list, date) => {
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      out.show(await list(), date);
    } catch (e) {
      out.fail();
    } finally {
      button.disabled = false;
    }
  };

  return {
    route() {
      const form = el('form', 'flight-status-form flight-status-form-route');
      form.noValidate = true;
      const from = selectField('origin', labels['origin label']);
      const to = selectField('destination', labels['destination label']);
      to.select.disabled = true;
      const swap = el('button', 'flight-status-swap');
      swap.type = 'button';
      swap.setAttribute('aria-label', labels['swap label']);
      const date = dateField('route');
      const out = results();
      let list = [];
      const destinations = (code, keep = '') => {
        const own = list.find((a) => a.iata_code === code);
        setOptions(to.select, labels['destination label'], own ? own.connections.map((c) => [c.iata_code, name(c)]).sort(byName) : []);
        to.select.disabled = !own;
        if (keep) {
          const o = [...to.select.options].find((x) => x.value === keep);
          if (o) o.selected = true;
        }
      };
      from.select.addEventListener('change', () => { from.wrap.classList.remove('is-invalid'); destinations(selectedValue(from.select)); });
      to.select.addEventListener('change', () => to.wrap.classList.remove('is-invalid'));
      swap.addEventListener('click', () => {
        const a = selectedValue(from.select);
        const b = selectedValue(to.select);
        if (!a || !b) return;
        const o = [...from.select.options].find((x) => x.value === b);
        if (!o) return;
        [...from.select.options].forEach((x) => { x.selected = false; });
        o.selected = true;
        destinations(b, a);
      });
      form.append(from.wrap, swap, to.wrap, date.wrap, makeSubmit());
      airports.then((all) => {
        list = all;
        setOptions(from.select, labels['origin label'], all.map((a) => [a.iata_code, name(a)]).sort(byName));
      });
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const origin = selectedValue(from.select);
        const destination = selectedValue(to.select);
        from.wrap.classList.toggle('is-invalid', !origin);
        to.wrap.classList.toggle('is-invalid', !destination);
        if (!origin) { from.select.focus(); return; }
        if (!destination) { to.select.focus(); return; }
        const day = selectedValue(date.select);
        search(form, out, () => fetchFlightsByRoute(origin, destination, day, lang), day);
      });
      const wrap = el('div', 'flight-status-ad');
      wrap.append(form, out.box);
      return wrap;
    },
    airport() {
      const form = el('form', 'flight-status-form flight-status-form-airport');
      form.noValidate = true;
      const direction = el('fieldset', 'flight-status-direction');
      let chosen = 'departure';
      ['departure', 'arrival'].forEach((value, i) => {
        const label = el('label', 'flight-status-radio');
        const radio = el('input');
        radio.type = 'radio';
        radio.name = `${id}-ad-direction`;
        radio.value = value;
        radio.checked = i === 0;
        radio.addEventListener('change', () => { if (radio.checked) chosen = value; });
        label.append(radio, document.createTextNode(` ${labels[`${value} label`]}`));
        direction.append(label);
      });
      const airport = selectField('airport', labels['airport label']);
      airport.select.addEventListener('change', () => airport.wrap.classList.remove('is-invalid'));
      const date = dateField('airport');
      const out = results();
      form.append(direction, airport.wrap, date.wrap, makeSubmit());
      airports.then((all) => setOptions(airport.select, labels['airport label'], all.map((a) => [a.iata_code, name(a)]).sort(byName)));
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = selectedValue(airport.select);
        airport.wrap.classList.toggle('is-invalid', !code);
        if (!code) { airport.select.focus(); return; }
        const day = selectedValue(date.select);
        search(form, out, () => fetchFlightsByAirport(code, day, chosen, lang), day);
      });
      const wrap = el('div', 'flight-status-ad');
      wrap.append(form, out.box);
      return wrap;
    },
  };
}
