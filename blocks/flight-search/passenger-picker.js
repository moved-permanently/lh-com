/**
 * The flight search's passenger and cabin picker (the block's `Passenger picker` row): the
 * "Economy, 1 Traveller" line opens adults, children (2 to 11), infants (under 2) and the cabin,
 * as www.airdolomiti.it's and the live flight manager's travel details. Rules: 1 to 9 adults, at
 * most 9 adults and children together, at most one infant per adult. lufthansa.com's options
 * (young adults, the fare preference, hints left out) come from picker-options.js.
 */

import { FARE_PREFERENCES } from './picker-options.js';

/**
 * Built-in texts, per language ({CABIN}, {COUNT}, {TYPE} are filled). No adults hint: www shows
 * none on lufthansa.com, ITA, Austrian, Brussels, Discover and Air Dolomiti (an Adults hint row
 * adds one).
 */
export const PASSENGER_LABELS = {
  en: {
    'passengers label': 'Passengers and travel class',
    'adults label': 'Adults',
    'adults hint': '',
    'children label': 'Children',
    'children hint': '2 to 11 years',
    'infants label': 'Infants',
    'infants hint': 'Under 2 years',
    'cabin label': 'Travel class',
    'economy label': 'Economy',
    'premium economy label': 'Premium Economy',
    'business label': 'Business',
    'first label': 'First',
    'traveller summary': '{CABIN}, {COUNT} Traveller',
    'travellers summary': '{CABIN}, {COUNT} Travellers',
    'more label': 'Add one: {TYPE}',
    'fewer label': 'Remove one: {TYPE}',
    'done label': 'Done',
  },
  de: {
    'passengers label': 'Reisende und Reiseklasse',
    'adults label': 'Erwachsene',
    'adults hint': '',
    'children label': 'Kinder',
    'children hint': '2 bis 11 Jahre',
    'infants label': 'Kleinkinder',
    'infants hint': 'Unter 2 Jahren',
    'cabin label': 'Reiseklasse',
    'economy label': 'Economy',
    'premium economy label': 'Premium Economy',
    'business label': 'Business',
    'first label': 'First',
    'traveller summary': '{CABIN}, {COUNT} Reisender',
    'travellers summary': '{CABIN}, {COUNT} Reisende',
    'more label': 'Eine Person mehr: {TYPE}',
    'fewer label': 'Eine Person weniger: {TYPE}',
    'done label': 'Fertig',
  },
  it: {
    'passengers label': 'Passeggeri e classe di viaggio',
    'adults label': 'Adulti',
    'adults hint': '',
    'children label': 'Bambini',
    'children hint': 'Da 2 a 11 anni',
    'infants label': 'Neonati',
    'infants hint': 'Sotto i 2 anni',
    'cabin label': 'Classe di viaggio',
    'economy label': 'Economy',
    'premium economy label': 'Premium Economy',
    'business label': 'Business',
    'first label': 'First',
    'traveller summary': '{CABIN}, {COUNT} passeggero',
    'travellers summary': '{CABIN}, {COUNT} passeggeri',
    'more label': 'Aggiungi uno: {TYPE}',
    'fewer label': 'Togli uno: {TYPE}',
    'done label': 'Fatto',
  },
  fr: {
    'passengers label': 'Passagers et classe de voyage',
    'adults label': 'Adultes',
    'adults hint': '',
    'children label': 'Enfants',
    'children hint': 'De 2 à 11 ans',
    'infants label': 'Bébés',
    'infants hint': 'Moins de 2 ans',
    'cabin label': 'Classe de voyage',
    'economy label': 'Economy',
    'premium economy label': 'Premium Economy',
    'business label': 'Business',
    'first label': 'First',
    'traveller summary': '{CABIN}, {COUNT} passager',
    'travellers summary': '{CABIN}, {COUNT} passagers',
    'more label': 'Ajouter un : {TYPE}',
    'fewer label': 'Retirer un : {TYPE}',
    'done label': 'Terminé',
  },
  es: {
    'passengers label': 'Pasajeros y clase de viaje',
    'adults label': 'Adultos',
    'adults hint': '',
    'children label': 'Niños',
    'children hint': 'De 2 a 11 años',
    'infants label': 'Bebés',
    'infants hint': 'Menores de 2 años',
    'cabin label': 'Clase de viaje',
    'economy label': 'Economy',
    'premium economy label': 'Premium Economy',
    'business label': 'Business',
    'first label': 'First',
    'traveller summary': '{CABIN}, {COUNT} pasajero',
    'travellers summary': '{CABIN}, {COUNT} pasajeros',
    'more label': 'Añadir uno: {TYPE}',
    'fewer label': 'Quitar uno: {TYPE}',
    'done label': 'Listo',
  },
  nl: {
    'passengers label': 'Reizigers en reisklasse',
    'adults label': 'Volwassenen',
    'adults hint': '',
    'children label': 'Kinderen',
    'children hint': '2 tot en met 11 jaar',
    'infants label': 'Baby’s',
    'infants hint': 'Jonger dan 2 jaar',
    'cabin label': 'Reisklasse',
    'economy label': 'Economy',
    'premium economy label': 'Premium Economy',
    'business label': 'Business',
    'first label': 'First',
    'traveller summary': '{CABIN}, {COUNT} reiziger',
    'travellers summary': '{CABIN}, {COUNT} reizigers',
    'more label': 'Een toevoegen: {TYPE}',
    'fewer label': 'Een verwijderen: {TYPE}',
    'done label': 'Klaar',
  },
  pt: {
    'passengers label': 'Passageiros e classe de viagem',
    'adults label': 'Adultos',
    'adults hint': '',
    'children label': 'Crianças',
    'children hint': 'De 2 a 11 anos',
    'infants label': 'Bebés',
    'infants hint': 'Menos de 2 anos',
    'cabin label': 'Classe de viagem',
    'economy label': 'Economy',
    'premium economy label': 'Premium Economy',
    'business label': 'Business',
    'first label': 'First',
    'traveller summary': '{CABIN}, {COUNT} passageiro',
    'travellers summary': '{CABIN}, {COUNT} passageiros',
    'more label': 'Adicionar um: {TYPE}',
    'fewer label': 'Remover um: {TYPE}',
    'done label': 'Concluído',
  },
  el: {
    'passengers label': 'Επιβάτες και θέση ταξιδιού',
    'adults label': 'Ενήλικες',
    'adults hint': '',
    'children label': 'Παιδιά',
    'children hint': '2 έως 11 ετών',
    'infants label': 'Βρέφη',
    'infants hint': 'Κάτω των 2 ετών',
    'cabin label': 'Θέση ταξιδιού',
    'economy label': 'Economy',
    'premium economy label': 'Premium Economy',
    'business label': 'Business',
    'first label': 'First',
    'traveller summary': '{CABIN}, {COUNT} επιβάτης',
    'travellers summary': '{CABIN}, {COUNT} επιβάτες',
    'more label': 'Προσθήκη ενός: {TYPE}',
    'fewer label': 'Αφαίρεση ενός: {TYPE}',
    'done label': 'Τέλος',
  },
  ja: {
    'passengers label': '搭乗者と搭乗クラス',
    'adults label': '大人',
    'adults hint': '',
    'children label': '小児',
    'children hint': '2歳～11歳',
    'infants label': '幼児',
    'infants hint': '2歳未満',
    'cabin label': '搭乗クラス',
    'economy label': 'エコノミー',
    'premium economy label': 'プレミアムエコノミー',
    'business label': 'ビジネス',
    'first label': 'ファースト',
    'traveller summary': '{CABIN}、{COUNT}名',
    'travellers summary': '{CABIN}、{COUNT}名',
    'more label': '1名追加：{TYPE}',
    'fewer label': '1名削除：{TYPE}',
    'done label': '完了',
  },
  ru: {
    'passengers label': 'Пассажиры и класс обслуживания',
    'adults label': 'Взрослые',
    'adults hint': '',
    'children label': 'Дети',
    'children hint': 'От 2 до 11 лет',
    'infants label': 'Младенцы',
    'infants hint': 'До 2 лет',
    'cabin label': 'Класс обслуживания',
    'economy label': 'Economy',
    'premium economy label': 'Premium Economy',
    'business label': 'Business',
    'first label': 'First',
    'traveller summary': '{CABIN}, пассажиров: {COUNT}',
    'travellers summary': '{CABIN}, пассажиров: {COUNT}',
    'more label': 'Добавить: {TYPE}',
    'fewer label': 'Убрать: {TYPE}',
    'done label': 'Готово',
  },
  zh: {
    'passengers label': '乘客和舱位',
    'adults label': '成人',
    'adults hint': '',
    'children label': '儿童',
    'children hint': '2至11岁',
    'infants label': '婴儿',
    'infants hint': '2岁以下',
    'cabin label': '舱位',
    'economy label': '经济舱',
    'premium economy label': '超级经济舱',
    'business label': '商务舱',
    'first label': '头等舱',
    'traveller summary': '{CABIN}，{COUNT}位乘客',
    'travellers summary': '{CABIN}，{COUNT}位乘客',
    'more label': '增加一位：{TYPE}',
    'fewer label': '减少一位：{TYPE}',
    'done label': '完成',
  },
  pl: {
    'passengers label': 'Pasażerowie i klasa podróży',
    'adults label': 'Dorośli',
    'adults hint': '',
    'children label': 'Dzieci',
    'children hint': 'Od 2 do 11 lat',
    'infants label': 'Niemowlęta',
    'infants hint': 'Poniżej 2 lat',
    'cabin label': 'Klasa podróży',
    'economy label': 'Economy',
    'premium economy label': 'Premium Economy',
    'business label': 'Business',
    'first label': 'First',
    'traveller summary': '{CABIN}, pasażerowie: {COUNT}',
    'travellers summary': '{CABIN}, pasażerowie: {COUNT}',
    'more label': 'Dodaj: {TYPE}',
    'fewer label': 'Usuń: {TYPE}',
    'done label': 'Gotowe',
  },
};

/** The cabins the picker can offer, by the block's cabin codes (scripts/shop-handoff.js). */
export const PICKER_CABINS = [['E', 'economy label'], ['P', 'premium economy label'], ['B', 'business label'], ['F', 'first label']];

export const MAX_TRAVELLERS = 9;

/**
 * The counts kept within the rules: 1-9 adults, adults + children <= 9, infants <= adults. Young
 * adults (when given) take seats too: adults + young adults + children <= 9.
 */
export function clampPassengers({
  adults = 1, youngAdults, children = 0, infants = 0,
} = {}) {
  const n = (v, min, max) => {
    const x = Number.isFinite(Number(v)) ? Math.floor(Number(v)) : min;
    return Math.min(max, Math.max(min, x));
  };
  const a = n(adults, 1, MAX_TRAVELLERS);
  if (youngAdults === undefined) {
    const c = n(children, 0, MAX_TRAVELLERS - a);
    return { adults: a, children: c, infants: n(infants, 0, a) };
  }
  const y = n(youngAdults, 0, MAX_TRAVELLERS - a);
  const c = n(children, 0, MAX_TRAVELLERS - a - y);
  return {
    adults: a, youngAdults: y, children: c, infants: n(infants, 0, a),
  };
}

const fill = (template, values) => Object.entries(values)
  .reduce((s, [k, v]) => s.replaceAll(`{${k}}`, v), template);

/** The line's text: "Economy, 2 Travellers". */
export function passengerSummary(labels, cabin, counts) {
  const count = counts.adults + (counts.youngAdults || 0) + counts.children + counts.infants;
  const name = labels[(PICKER_CABINS.find(([code]) => code === cabin) || PICKER_CABINS[0])[1]];
  return fill(labels[count === 1 ? 'traveller summary' : 'travellers summary'], { CABIN: name, COUNT: count });
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/**
 * The picker: a button with the summary (the traveller line) and the panel it opens.
 * @param {Object} options
 * @param {Object} options.labels PASSENGER_LABELS of the language (authored rows applied)
 * @param {string[]} options.cabins the cabin codes to offer (E, P, B, F)
 * @param {{adults: number, cabin: string}} options.value the block's starting values
 * @param {Object} [options.groupBooking] the Group booking row's link ({href, text})
 * @param {boolean} [options.youngAdults] the young adults' stepper (picker-options.js)
 * @param {boolean} [options.farePreference] the fare preference choices (picker-options.js)
 * @returns {{element: Element, getValue: () => Object}}
 */
export function createPassengerPicker({
  labels, cabins, value, groupBooking = null, youngAdults = false, farePreference = false,
}) {
  const offered = PICKER_CABINS.filter(([code]) => cabins.includes(code));
  const list = offered.length ? offered : PICKER_CABINS.slice(0, 1);
  const start = youngAdults ? { adults: value.adults, youngAdults: 0 } : { adults: value.adults };
  let counts = clampPassengers(start);
  let fare = 'DEFAULT';
  let cabin = list.some(([code]) => code === value.cabin) ? value.cabin : list[0][0];
  const uid = Math.random().toString(36).slice(2, 8);
  const wrap = el('div', 'flight-search-passengers');
  const opener = el('button', 'flight-search-travellers');
  opener.type = 'button';
  opener.setAttribute('aria-expanded', 'false');
  opener.setAttribute('aria-controls', `flight-search-passengers-${uid}`);
  const panel = el('div', 'flight-search-passengers-panel');
  panel.id = `flight-search-passengers-${uid}`;
  panel.setAttribute('role', 'group');
  panel.setAttribute('aria-label', labels['passengers label']);
  panel.hidden = true;

  const rows = {};
  // young adults take a seat the children keep (adults, as before, take the children's)
  const seatsFull = () => counts.adults + counts.youngAdults + counts.children >= MAX_TRAVELLERS;
  const update = () => {
    const summary = passengerSummary(labels, cabin, counts);
    opener.textContent = fare === 'DEFAULT' ? summary : `${summary}, ${labels['fare applied']}`;
    Object.entries(rows).forEach(([type, row]) => {
      row.output.textContent = String(counts[type]);
      const more = clampPassengers({ ...counts, [type]: counts[type] + 1 });
      const fewer = clampPassengers({ ...counts, [type]: counts[type] - 1 });
      row.more.disabled = more[type] === counts[type] || (type === 'youngAdults' && seatsFull());
      row.fewer.disabled = fewer[type] === counts[type];
    });
  };
  ['adults', ...(youngAdults ? ['youngAdults'] : []), 'children', 'infants'].forEach((type) => {
    // youngAdults: class young-adults, labels 'young adults label' and 'young adults hint'
    const name = type.replace(/[A-Z]/g, (c) => ` ${c.toLowerCase()}`);
    const row = el('div', `flight-search-passenger flight-search-passenger-${name.replace(' ', '-')}`);
    const text = el('div', 'flight-search-passenger-text');
    text.append(el('span', 'flight-search-passenger-label', labels[`${name} label`]));
    // a hint left out (''): none
    if (labels[`${name} hint`] !== '') text.append(el('span', 'flight-search-passenger-hint', labels[`${name} hint`]));
    const fewer = el('button', 'flight-search-passenger-fewer', '−');
    fewer.type = 'button';
    fewer.setAttribute('aria-label', fill(labels['fewer label'], { TYPE: labels[`${name} label`] }));
    const output = el('output', 'flight-search-passenger-count');
    output.setAttribute('aria-live', 'polite');
    const more = el('button', 'flight-search-passenger-more', '+');
    more.type = 'button';
    more.setAttribute('aria-label', fill(labels['more label'], { TYPE: labels[`${name} label`] }));
    fewer.addEventListener('click', () => { counts = clampPassengers({ ...counts, [type]: counts[type] - 1 }); update(); });
    more.addEventListener('click', () => {
      if (more.disabled) return;
      counts = clampPassengers({ ...counts, [type]: counts[type] + 1 });
      update();
    });
    row.append(text, fewer, output, more);
    rows[type] = { output, more, fewer };
    panel.append(row);
  });
  if (list.length > 1) {
    const cabinWrap = el('label', 'flight-search-passenger-cabin');
    cabinWrap.append(el('span', 'flight-search-passenger-label', labels['cabin label']));
    const select = el('select', 'flight-search-passenger-cabin-select');
    select.name = 'cabin';
    list.forEach(([code, key]) => {
      const option = el('option', '', labels[key]);
      option.value = code;
      option.selected = code === cabin;
      select.append(option);
    });
    select.addEventListener('change', () => { cabin = select.value; update(); });
    cabinWrap.append(select);
    panel.append(cabinWrap);
  }
  // the Group booking row: www's .group-booking-link under the passengers
  if (groupBooking) {
    const group = el('a', 'flight-search-passengers-group', groupBooking.text);
    group.href = groupBooking.href;
    panel.append(group);
  }
  // the Fare preference row: www's "Alternative fare selection", best price chosen
  if (farePreference) {
    const details = el('details', 'flight-search-fare');
    details.append(el('summary', 'flight-search-fare-label', labels['fare label']));
    const fieldset = el('fieldset', 'flight-search-fare-choices');
    fieldset.append(el('legend', 'flight-search-fare-question', labels['fare question']));
    FARE_PREFERENCES.forEach(([code, key]) => {
      const choice = el('label', 'flight-search-fare-choice');
      const radio = el('input', 'flight-search-fare-radio');
      radio.type = 'radio';
      radio.name = `flight-search-fare-${uid}`;
      radio.value = code;
      radio.checked = code === fare;
      radio.addEventListener('change', () => { if (radio.checked) { fare = code; update(); } });
      choice.append(radio, labels[key]);
      fieldset.append(choice);
    });
    details.append(fieldset);
    panel.append(details);
  }
  const done = el('button', 'flight-search-passengers-done button secondary', labels['done label']);
  done.type = 'button';
  panel.append(done);

  const close = (focus) => {
    if (panel.hidden) return;
    panel.hidden = true;
    opener.setAttribute('aria-expanded', 'false');
    if (focus) opener.focus();
  };
  opener.addEventListener('click', () => {
    panel.hidden = !panel.hidden;
    opener.setAttribute('aria-expanded', String(!panel.hidden));
  });
  done.addEventListener('click', () => close(true));
  wrap.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(true); });
  document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) close(false); });
  wrap.append(opener, panel);
  update();
  return {
    element: wrap,
    getValue: () => ({ ...counts, cabin, ...(farePreference ? { farePreference: fare } : {}) }),
  };
}
