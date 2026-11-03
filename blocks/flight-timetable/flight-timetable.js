import { brandEntry } from '../../scripts/locale.js';
import { readConfigRows, resolveLabels } from '../../scripts/block-config.js';
import { submitShopHandoff } from '../../scripts/shop-handoff.js';
import {
  adLang, fetchAirports, fetchFlightDates, isoDate, requestTimetable,
} from '../../scripts/airdolomiti-api.js';

/*
 * Air Dolomiti's timetable search (www.airdolomiti.it/orario-voli, .eu/flight-timetables,
 * .de/flugplan): trip type, origin and destination (Air Dolomiti's airports and their
 * connections, GET api.airdolomiti.it/v1/airports), the departure and return dates in calendars
 * showing the route's flight dates (GET /v1/flights/dates/<ORIG>-<DEST>), Search. The search is
 * POSTed to /v1/bookings/timetable; its answer names the engine's page (digital.airdolomiti.it)
 * and the search to post there, as www's widget does. Brand airdolomiti only (its booking entry's
 * format); elsewhere the block shows its Live page link and calls nothing.
 */

/** www's texts per language (2026-11-01); a block row with the same key wins. */
const LABELS = {
  it: {
    'trip types': 'Andata / Ritorno, Solo andata',
    'trip type label': 'Tipo di viaggio',
    'from label': 'Partenza',
    'from placeholder': 'Partenza da',
    'to label': 'Arrivo',
    'to placeholder': 'Arrivo a',
    'departure label': 'Data partenza',
    'return label': 'Data ritorno',
    'submit label': 'Cerca',
    'submit aria label': 'Cerca volo',
    'open calendar': 'apri calendario',
    'previous month': 'Mese precedente',
    'next month': 'Mese successivo',
    error: 'Al momento non è possibile completare la ricerca. Riprova più tardi.',
  },
  en: {
    'trip types': 'Round trip, One way',
    'trip type label': 'Trip type',
    'from label': 'Departure',
    'from placeholder': 'Departure from',
    'to label': 'Destination',
    'to placeholder': 'Destination',
    'departure label': 'Departure date',
    'return label': 'Return date',
    'submit label': 'Search',
    'submit aria label': 'Search flight',
    'open calendar': 'open calendar',
    'previous month': 'Previous Month',
    'next month': 'Next Month',
    error: 'Your search could not be completed right now. Please try again later.',
  },
  de: {
    'trip types': 'Hin- und Rückflug, Nur Hinflug',
    'trip type label': 'Reiseart',
    'from label': 'Abflughafen',
    'from placeholder': 'Abflughafen',
    'to label': 'Zielflughafen',
    'to placeholder': 'Zielflughafen',
    'departure label': 'Abflug',
    'return label': 'Rückflug',
    'submit label': 'Suchen',
    'submit aria label': 'Flug suchen',
    'open calendar': 'Kalender öffnen',
    'previous month': 'Vorheriger Monat',
    'next month': 'Nächster Monat',
    error: 'Die Suche ist gerade nicht möglich. Bitte versuchen Sie es später noch einmal.',
  },
  fr: {
    'trip types': 'Aller-retour, Aller simple',
    'trip type label': 'Type de voyage',
    'from label': 'Départ',
    'from placeholder': 'Départ de',
    'to label': 'Lieu d’arrivée',
    'to placeholder': 'Lieu d’arrivée',
    'departure label': 'Date de départ',
    'return label': 'Date de retour',
    'submit label': 'Rechercher',
    'submit aria label': 'Rechercher un vol',
    'open calendar': 'ouvrir le calendrier',
    'previous month': 'Mois précédent',
    'next month': 'Mois suivant',
    error: 'Votre recherche n’a pas pu aboutir pour le moment. Veuillez réessayer ultérieurement.',
  },
  es: {
    'trip types': 'Vuelo de ida y vuelta, Vuelo solo de ida',
    'trip type label': 'Tipo de viaje',
    'from label': 'Salida',
    'from placeholder': 'Salida desde',
    'to label': 'Destino',
    'to placeholder': 'Destino',
    'departure label': 'Fecha de salida',
    'return label': 'Fecha de vuelta',
    'submit label': 'Buscar',
    'submit aria label': 'Buscar vuelo',
    'open calendar': 'abrir calendario',
    'previous month': 'Mes anterior',
    'next month': 'Mes siguiente',
    error: 'No ha sido posible completar su búsqueda en este momento. Vuelva a intentarlo más tarde.',
  },
  el: {
    'trip types': 'Με επιστροφή, Μόνο μετάβαση',
    'trip type label': 'Τύπος ταξιδιού',
    'from label': 'Αναχώρηση',
    'from placeholder': 'Αναχώρηση από',
    'to label': 'Προορισμός',
    'to placeholder': 'Προορισμός',
    'departure label': 'Ημερομηνία αναχώρησης',
    'return label': 'Ημερομηνία επιστροφής',
    'submit label': 'Αναζήτηση',
    'submit aria label': 'Αναζήτηση πτήσης',
    'open calendar': 'άνοιγμα ημερολογίου',
    'previous month': 'Προηγούμενος μήνας',
    'next month': 'Επόμενος μήνας',
    error: 'Η αναζήτησή σας δεν ήταν δυνατό να ολοκληρωθεί αυτή τη στιγμή. Δοκιμάστε ξανά αργότερα.',
  },
  ja: {
    'trip types': '往復, 片道',
    'trip type label': '旅程タイプ',
    'from label': '出発地',
    'from placeholder': '出発地',
    'to label': '目的地',
    'to placeholder': '目的地',
    'departure label': '出発日',
    'return label': '復路の日付',
    'submit label': '検索',
    'submit aria label': 'フライトを検索',
    'open calendar': 'カレンダーを開く',
    'previous month': '前月',
    'next month': '翌月',
    error: '現在検索を完了できません。後ほどもう一度お試しください。',
  },
  ko: {
    'trip types': '왕복, 편도',
    'trip type label': '여정 유형',
    'from label': '출발',
    'from placeholder': '출발지',
    'to label': '목적지',
    'to placeholder': '목적지',
    'departure label': '출발일',
    'return label': '귀국일',
    'submit label': '검색',
    'submit aria label': '항공편 검색',
    'open calendar': '달력 열기',
    'previous month': '이전 달',
    'next month': '다음 달',
    error: '지금은 검색을 완료할 수 없습니다. 나중에 다시 시도해 주세요.',
  },
  nl: {
    'trip types': 'Retour, Enkele reis',
    'trip type label': 'Soort reis',
    'from label': 'Vertrek',
    'from placeholder': 'Vertrek vanaf',
    'to label': 'Bestemming',
    'to placeholder': 'Bestemming',
    'departure label': 'Vertrekdatum',
    'return label': 'Terugreisdatum',
    'submit label': 'Zoeken',
    'submit aria label': 'Vlucht zoeken',
    'open calendar': 'kalender openen',
    'previous month': 'Vorige maand',
    'next month': 'Volgende maand',
    error: 'Uw zoekopdracht kan nu niet worden voltooid. Probeer het later opnieuw.',
  },
  pl: {
    'trip types': 'W obie strony, W jedną stronę',
    'trip type label': 'Rodzaj podróży',
    'from label': 'Wylot',
    'from placeholder': 'Wylot z',
    'to label': 'Cel podróży',
    'to placeholder': 'Cel podróży',
    'departure label': 'Data wylotu',
    'return label': 'Data powrotu',
    'submit label': 'Szukaj',
    'submit aria label': 'Szukaj lotu',
    'open calendar': 'otwórz kalendarz',
    'previous month': 'Poprzedni miesiąc',
    'next month': 'Następny miesiąc',
    error: 'Nie można teraz ukończyć wyszukiwania. Spróbuj ponownie później.',
  },
  pt: {
    'trip types': 'Ida e volta, Só ida',
    'trip type label': 'Tipo de viagem',
    'from label': 'Partida',
    'from placeholder': 'Partida de',
    'to label': 'Destino',
    'to placeholder': 'Destino',
    'departure label': 'Data de partida',
    'return label': 'Data de regresso',
    'submit label': 'Pesquisar',
    'submit aria label': 'Pesquisar voo',
    'open calendar': 'abrir calendário',
    'previous month': 'Mês anterior',
    'next month': 'Mês seguinte',
    error: 'Não foi possível concluir a sua pesquisa neste momento. Tente novamente mais tarde.',
  },
  ru: {
    'trip types': 'Туда и обратно, В одну сторону',
    'trip type label': 'Тип поездки',
    'from label': 'Откуда',
    'from placeholder': 'Откуда',
    'to label': 'Пункт назначения',
    'to placeholder': 'Пункт назначения',
    'departure label': 'Дата вылета',
    'return label': 'Дата возвращения',
    'submit label': 'Найти',
    'submit aria label': 'Найти рейс',
    'open calendar': 'открыть календарь',
    'previous month': 'Предыдущий месяц',
    'next month': 'Следующий месяц',
    error: 'Сейчас не удается выполнить поиск. Повторите попытку позже.',
  },
  zh: {
    'trip types': '往返, 单程',
    'trip type label': '行程类型',
    'from label': '出发地',
    'from placeholder': '出发地',
    'to label': '目的地',
    'to placeholder': '目的地',
    'departure label': '出发日期',
    'return label': '返程日期',
    'submit label': '搜索',
    'submit aria label': '搜索航班',
    'open calendar': '打开日历',
    'previous month': '上个月',
    'next month': '下个月',
    error: '目前无法完成您的搜索。请稍后重试。',
  },
};

/** The calendar's weekday row, Monday first, as www's. */
const WEEKDAYS = {
  it: ['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'],
  en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  de: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
  pt: ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'],
  ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
};

const EMPTY_DATE = '--/--/--';
let instances = 0;

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

/** The chosen option's value ('' for none; read from the options: a select's value may lag). */
const selectedValue = (select) => ([...select.options].find((o) => o.selected) || { value: '' }).value;

function resetSelect(select, placeholder, options) {
  const empty = el('option', '', placeholder);
  empty.value = '';
  empty.hidden = true;
  empty.selected = true;
  select.replaceChildren(empty, ...options.map(([value, label]) => {
    const option = el('option', '', label);
    option.value = value;
    return option;
  }));
}

const monthKey = (iso) => iso.slice(0, 7);
const ddmmyyyy = (iso) => iso.split('-').reverse().join('/');

/** The block's link only (another brand, or nothing authored). */
function linkOnly(block, config) {
  const link = config['live-page'] && config['live-page'].link;
  block.replaceChildren();
  if (link) {
    const p = el('p');
    p.append(link);
    block.append(p);
  }
}

/**
 * One calendar for a date field: a month of the route's dates (Monday first), previous and next
 * month buttons within the dates' months; days before `from` are disabled.
 */
function calendar(labels, lang, onPick) {
  const box = el('div', 'flight-timetable-calendar');
  box.setAttribute('role', 'dialog');
  box.hidden = true;
  const head = el('div', 'flight-timetable-calendar-head');
  const prev = el('button', 'flight-timetable-prev');
  prev.type = 'button';
  prev.setAttribute('aria-label', labels['previous month']);
  const month = el('p', 'flight-timetable-month');
  month.setAttribute('aria-live', 'polite');
  const next = el('button', 'flight-timetable-next');
  next.type = 'button';
  next.setAttribute('aria-label', labels['next month']);
  head.append(prev, month, next);
  const grid = el('div', 'flight-timetable-grid');
  box.append(head, grid);
  const state = {
    dates: [], from: '', selected: '', view: '',
  };
  const monthName = new Intl.DateTimeFormat(lang, { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const dayName = new Intl.DateTimeFormat(lang, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });
  const months = () => [...new Set(state.dates.filter((d) => d >= state.from).map(monthKey))];
  const render = () => {
    const [y, m] = state.view.split('-').map(Number);
    month.textContent = monthName.format(new Date(Date.UTC(y, m - 1, 1)));
    const list = months();
    prev.disabled = !list.length || state.view <= list[0];
    next.disabled = !list.length || state.view >= list[list.length - 1];
    const available = new Set(state.dates);
    grid.replaceChildren(...(WEEKDAYS[lang] || WEEKDAYS.en).map((d) => el('span', 'flight-timetable-weekday', d)));
    const first = new Date(Date.UTC(y, m - 1, 1));
    const lead = (first.getUTCDay() + 6) % 7;
    for (let i = 0; i < lead; i += 1) grid.append(el('span', 'flight-timetable-blank'));
    const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
    for (let d = 1; d <= days; d += 1) {
      const iso = `${state.view}-${String(d).padStart(2, '0')}`;
      const button = el('button', 'flight-timetable-day', String(d));
      button.type = 'button';
      button.dataset.date = iso;
      button.setAttribute('aria-label', dayName.format(new Date(Date.UTC(y, m - 1, d))));
      button.disabled = !available.has(iso) || iso < state.from;
      if (iso === state.selected) {
        button.classList.add('is-selected');
        button.setAttribute('aria-pressed', 'true');
      }
      button.addEventListener('click', () => { if (!button.disabled) onPick(iso); });
      grid.append(button);
    }
  };
  const shift = (step) => {
    const list = months();
    const i = list.indexOf(state.view) + step;
    if (i >= 0 && i < list.length) {
      state.view = list[i];
      render();
    }
  };
  prev.addEventListener('click', () => shift(-1));
  next.addEventListener('click', () => shift(1));
  return {
    box,
    open({ dates, from = '', selected = '' }) {
      Object.assign(state, { dates, from, selected });
      const list = months();
      state.view = selected ? monthKey(selected) : (list[0] || monthKey(new Date().toISOString()));
      render();
      box.hidden = false;
    },
    close() { box.hidden = true; },
    isOpen: () => !box.hidden,
  };
}

export default async function decorate(block) {
  const config = readConfigRows(block);
  const brand = brandEntry();
  if (!brand || !brand.booking || brand.booking.format !== 'airdolomiti') {
    linkOnly(block, config);
    return;
  }
  instances += 1;
  const id = `flight-timetable-${instances}`;
  const lang = adLang();
  const labels = resolveLabels(LABELS, config, lang);
  const [roundLabel, oneLabel] = labels['trip types'].split(/\s*,\s*/);

  const form = el('form', 'flight-timetable-form');
  form.noValidate = true;
  const trip = el('fieldset', 'flight-timetable-trip');
  const legend = el('legend', 'flight-timetable-sr', labels['trip type label']);
  trip.append(legend);
  [['R', roundLabel || LABELS[lang]['trip types'].split(', ')[0]], ['O', oneLabel || LABELS[lang]['trip types'].split(', ')[1]]].forEach(([value, text], i) => {
    const label = el('label', 'flight-timetable-radio');
    const input = el('input');
    input.type = 'radio';
    input.name = `${id}-trip`;
    input.value = value;
    if (!i) input.checked = true;
    label.append(input, el('span', '', text));
    trip.append(label);
  });

  const fields = el('div', 'flight-timetable-fields');
  const field = (name, labelText) => {
    const wrap = el('div', 'flight-timetable-field');
    wrap.dataset.field = name;
    const label = el('label', '', labelText);
    label.id = `${id}-${name}-label`;
    label.htmlFor = `${id}-${name}`;
    wrap.append(label);
    fields.append(wrap);
    return wrap;
  };
  const selectField = (name, labelText, placeholder) => {
    const wrap = field(name, labelText);
    const select = el('select', 'flight-timetable-select');
    select.id = `${id}-${name}`;
    select.name = name;
    select.required = true;
    resetSelect(select, placeholder, []);
    wrap.append(select);
    return { wrap, select };
  };
  const origin = selectField('origin', labels['from label'], labels['from placeholder']);
  const destination = selectField('destination', labels['to label'], labels['to placeholder']);
  destination.select.disabled = true;

  const dates = { departure: '', return: '' };
  let routeDates = [];
  let openField = null;
  const dateFields = {};
  const close = () => {
    if (!openField) return;
    dateFields[openField].cal.close();
    dateFields[openField].button.setAttribute('aria-expanded', 'false');
    openField = null;
  };
  const show = (name) => {
    const f = dateFields[name];
    f.button.textContent = dates[name] ? ddmmyyyy(dates[name]) : EMPTY_DATE;
    f.wrap.classList.toggle('has-value', Boolean(dates[name]));
  };
  const dateField = (name, labelText) => {
    const wrap = field(name, labelText);
    const button = el('button', 'flight-timetable-date', EMPTY_DATE);
    button.type = 'button';
    button.id = `${id}-${name}`;
    button.disabled = true;
    button.setAttribute('aria-label', `${labelText}: ${labels['open calendar']}`);
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-expanded', 'false');
    const cal = calendar(labels, lang, (iso) => {
      dates[name] = iso;
      if (name === 'departure' && dates.return && dates.return < iso) dates.return = '';
      show('departure');
      show('return');
      wrap.classList.remove('is-invalid');
      close();
      button.focus();
    });
    cal.box.setAttribute('aria-label', labelText);
    cal.box.id = `${id}-${name}-dialog`;
    button.setAttribute('aria-controls', cal.box.id);
    button.addEventListener('click', () => {
      const wasOpen = openField === name;
      close();
      if (wasOpen) return;
      cal.open({ dates: routeDates, from: name === 'return' ? dates.departure : '', selected: dates[name] });
      openField = name;
      button.setAttribute('aria-expanded', 'true');
    });
    wrap.append(button, cal.box);
    dateFields[name] = { wrap, button, cal };
  };
  dateField('departure', labels['departure label']);
  dateField('return', labels['return label']);

  const actions = el('div', 'flight-timetable-actions');
  const submit = el('button', 'button flight-timetable-submit', labels['submit label']);
  submit.type = 'submit';
  submit.setAttribute('aria-label', labels['submit aria label']);
  actions.append(submit);
  fields.append(actions);
  const error = el('p', 'flight-timetable-error');
  error.setAttribute('role', 'alert');
  error.hidden = true;
  form.append(trip, fields, error);
  block.replaceChildren(form);

  let chosenTrip = 'R';
  const tripType = () => chosenTrip;
  const applyTrip = (e) => {
    if (e && e.target && e.target.checked) chosenTrip = e.target.value;
    dateFields.return.wrap.hidden = tripType() === 'O';
    if (tripType() === 'O' && openField === 'return') close();
  };
  trip.addEventListener('change', applyTrip);
  applyTrip();

  let airports = [];
  const name = (a) => a[`name_${lang}`] || a.name_en || a.iata_code;
  const byName = (a, b) => a[1].localeCompare(b[1], lang);
  const clearDates = () => {
    close();
    routeDates = [];
    dates.departure = '';
    dates.return = '';
    show('departure');
    show('return');
    dateFields.departure.button.disabled = true;
    dateFields.return.button.disabled = true;
  };
  origin.select.addEventListener('change', () => {
    const code = selectedValue(origin.select);
    const own = airports.find((a) => a.iata_code === code);
    resetSelect(destination.select, labels['to placeholder'], own ? own.connections.map((c) => [c.iata_code, name(c)]).sort(byName) : []);
    destination.select.disabled = !own;
    origin.wrap.classList.remove('is-invalid');
    clearDates();
  });
  destination.select.addEventListener('change', async () => {
    const from = selectedValue(origin.select);
    const to = selectedValue(destination.select);
    destination.wrap.classList.remove('is-invalid');
    clearDates();
    if (!from || !to) return;
    try {
      const list = await fetchFlightDates(from, to);
      // the answer of the route still chosen only
      if (selectedValue(origin.select) !== from || selectedValue(destination.select) !== to) return;
      routeDates = list.map(isoDate).filter(Boolean).sort();
    } catch (e) {
      routeDates = [];
    }
    dateFields.departure.button.disabled = !routeDates.length;
    dateFields.return.button.disabled = !routeDates.length;
  });

  document.addEventListener('click', (e) => {
    if (openField && !dateFields[openField].wrap.contains(e.target)) close();
  });
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && openField) {
      const { button } = dateFields[openField];
      close();
      button.focus();
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submit.disabled) return;
    error.hidden = true;
    const round = tripType() === 'R';
    const missing = [
      [origin.wrap, origin.select, !selectedValue(origin.select)],
      [destination.wrap, destination.select, !selectedValue(destination.select)],
      [dateFields.departure.wrap, dateFields.departure.button, !dates.departure],
      [dateFields.return.wrap, dateFields.return.button, round && !dates.return],
    ].filter(([, , empty]) => empty);
    [origin.wrap, destination.wrap, dateFields.departure.wrap, dateFields.return.wrap]
      .forEach((w) => w.classList.toggle('is-invalid', missing.some(([m]) => m === w)));
    if (missing.length) {
      if (!missing[0][1].disabled) missing[0][1].focus();
      return;
    }
    submit.disabled = true;
    submit.setAttribute('aria-busy', 'true');
    try {
      const handoff = await requestTimetable({
        origin: selectedValue(origin.select),
        destination: selectedValue(destination.select),
        departureDate: dates.departure,
        returnDate: round ? dates.return : '',
        tripType: round ? 'R' : 'O',
      }, lang);
      submitShopHandoff(handoff);
    } catch (err) {
      error.textContent = labels.error;
      error.hidden = false;
    } finally {
      submit.disabled = false;
      submit.removeAttribute('aria-busy');
    }
  });

  try {
    airports = await fetchAirports();
  } catch (e) {
    airports = [];
  }
  resetSelect(origin.select, labels['from placeholder'], airports.map((a) => [a.iata_code, name(a)]).sort(byName));
  if (!airports.length) {
    error.textContent = labels.error;
    error.hidden = false;
  }
}
