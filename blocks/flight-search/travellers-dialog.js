/**
 * The travellers window of the Lufthansa Group platform's flight manager (www.brusselsairlines.com,
 * www.swiss.com, www.austrian.com; the captures brussels-parity-001, swiss-parity-001 and
 * austrian-parity-001, their homepages' travellers states at 390 and 1440 px, 2026-11-05): the
 * traveller line opens a modal dialog instead of lh-com's dropdown (passenger-picker.js), on the
 * brands whose config sets travellersDialog (scripts/brands.js) and in the languages whose texts
 * are here (en, fr, de; the others keep the dropdown). As www's:
 * - a tab bar with "Travel details" (www's "Redeem miles" tab follows once captured opened);
 * - the travel class, the adults, children and infants steppers (the same rules as the dropdown:
 *   clampPassengers), the Group booking row's link;
 * - "Alternative fare selection": best price (chosen), coupon, high;
 * - the access code (optional) with www's hint;
 * - Continue (Austrian's Save): the window's values become the search's; the close button,
 *   Escape or a click beside the window leave the search as it was.
 * A native <dialog> shown modal: the page behind is inert, the focus starts in the window and goes
 * back to the line on closing. The hand-off: the picker's (counts, cabin, fare preference) and
 * www's universalCode (its form's flightQuery.universalCode) only when the code is filled
 * (picker-options.js applyPickerChoices). Styles: travellers-dialog.css, loaded with the window.
 */

import {
  clampPassengers, passengerSummary, PASSENGER_LABELS, PICKER_CABINS, MAX_TRAVELLERS,
} from './passenger-picker.js';
import { FARE_PREFERENCES } from './picker-options.js';
import { buildMilesPanel } from './travellers-miles.js';

/** www's texts of the window per language (be/en, be/fr, ch/de; the group's shared wording). */
export const DIALOG_LABELS = {
  en: {
    'travel details label': 'Travel details',
    'close label': 'Close',
    'cabin label': 'Travel class',
    'adults hint': '',
    'children hint': '(2 - 11 years)',
    'infants label': 'Infants',
    'infants hint': '(Under 2 years, No seat)',
    'group note': 'For group bookings of ten or more passengers, please proceed via the link below.',
    'fare label': 'Alternative fare selection',
    'fare question': 'Which fare benefits do you prefer?',
    'fare default label': 'Best price offers',
    'fare coupon label': 'Change the sequence of my flights',
    'fare high label': 'Flexibility/highest booking class to collect more miles',
    'fare applied': 'Your fare selection is active.',
    'access code label': 'Access code',
    'access code optional': 'optional',
    'access code hint': 'This field is for access codes only. If you have a promotional code, you can enter it later in the booking process before proceeding to payment.',
    'continue label': 'Continue',
  },
  fr: {
    'travel details label': 'Informations sur le voyage',
    'close label': 'Fermer',
    'cabin label': 'Classe de voyage',
    'adults hint': '',
    'children hint': '(2 à 11 ans)',
    'infants label': 'Bébés sans siège',
    'infants hint': '(0 à 23 mois)',
    'group note': 'Pour les réservations de groupe de dix passagers ou plus, veuillez cliquer sur le lien ci-dessous.',
    'fare label': 'Choix d’un autre tarif',
    'fare question': 'Quels avantages tarifaires préférez-vous ?',
    'fare default label': 'Offres au meilleur prix',
    'fare coupon label': 'Modifier la séquence de mes vols',
    'fare high label': 'Flexibilité/Classe de réservation la plus élevée pour cumuler davantage de Miles',
    'fare applied': 'Votre choix de tarif est actif.',
    'access code label': 'Code d’accès',
    'access code optional': 'Facultatif',
    'access code hint': 'Ce champ est réservé aux codes d’accès. Si vous disposez d’un code promotionnel, veuillez le saisir sur la page de paiement.',
    'continue label': 'Enregistrer',
  },
  de: {
    'travel details label': 'Reisedetails',
    'close label': 'Schließen',
    'cabin label': 'Reiseklasse',
    'adults hint': '',
    'children hint': '(2-11 Jahre)',
    'infants label': 'Kleinkinder ohne Sitzplatz',
    'infants hint': '(0-23 Monate)',
    'group note': 'Für Gruppenbuchungen ab zehn Personen nutzen Sie bitte den untenstehenden Link.',
    'fare label': 'Alternative Tarifoptionen',
    'fare question': 'Welche Tarifvorteile sind Ihnen wichtiger?',
    'fare default label': 'Bestpreisangebote',
    'fare coupon label': 'Reihenfolge meiner Flüge ändern',
    'fare high label': 'Flexibilität bzw. höchste Buchungsklasse, um mehr Meilen zu sammeln',
    'fare applied': 'Der ausgewählte Tarif wurde übernommen.',
    'access code label': 'Zugangscode',
    'access code optional': 'Optional',
    'access code hint': 'Dieses Feld ist nur für Zugangscodes. Falls Sie einen Aktionscode haben, können Sie diesen später im Buchungsprozess eingeben, bevor Sie zur Zahlung übergehen.',
    'continue label': 'Speichern',
  },
};

/**
 * The window's default texts for a language and brand: the dropdown's (passenger-picker.js), this
 * file's, the brand's own wording (its config's travellersDialog.labels). Null: no window in that
 * language (the dropdown stays).
 * @param {string} lang
 * @param {Object} [brand] the brand's scripts/brands.js entry
 */
export function dialogDefaults(lang, brand) {
  const setting = brand && brand.travellersDialog;
  if (!setting || !DIALOG_LABELS[lang]) return null;
  return {
    ...(PASSENGER_LABELS[lang] || PASSENGER_LABELS.en),
    ...DIALOG_LABELS[lang],
    ...((setting.labels || {})[lang] || {}),
  };
}

const fill = (template, values) => Object.entries(values)
  .reduce((s, [k, v]) => s.replaceAll(`{${k}}`, v), template);

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

let stylesLoaded = false;
function loadStyles() {
  if (stylesLoaded || !document.head) return;
  stylesLoaded = true;
  const base = (window.hlx && window.hlx.codeBasePath) || '';
  const link = el('link');
  link.rel = 'stylesheet';
  link.href = `${base}/blocks/flight-search/travellers-dialog.css`;
  document.head.append(link);
}

const CLOSE_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="2.4" fill="none"/></svg>';

/**
 * The line and its window.
 * @param {Object} options
 * @param {Object} options.labels the window's texts (dialogDefaults, authored rows applied)
 * @param {string[]} options.cabins the cabin codes to offer (E, P, B, F)
 * @param {{adults: number, cabin: string, youngAdults?: number, children?: number,
 *   infants?: number}} options.value the starting values
 * @param {Object} [options.groupBooking] the Group booking row's link ({href, text})
 * @param {boolean} [options.youngAdults] the young adults' stepper (picker-options.js)
 * @param {Object} [options.miles] the Redeem miles tab (travellers-miles.js milesOptions)
 * @returns {{element: Element, getValue: () => Object}}
 */
export function createTravellersDialog({
  labels, cabins, value, groupBooking = null, youngAdults = false, miles = null,
}) {
  loadStyles();
  const offered = PICKER_CABINS.filter(([code]) => cabins.includes(code));
  const list = offered.length ? offered : PICKER_CABINS.slice(0, 1);
  const counted = { adults: value.adults, children: value.children, infants: value.infants };
  const start = youngAdults ? { ...counted, youngAdults: value.youngAdults || 0 } : counted;
  // kept: the search's values; draft: the window's while it is open
  const kept = {
    counts: clampPassengers(start),
    cabin: list.some(([code]) => code === value.cabin) ? value.cabin : list[0][0],
    fare: 'DEFAULT',
    code: '',
  };
  let draft = { ...kept };
  const uid = Math.random().toString(36).slice(2, 8);
  const id = (part) => `flight-search-travellers-${part}-${uid}`;

  const wrap = el('div', 'flight-search-passengers flight-search-passengers-dialog');
  const opener = el('button', 'flight-search-travellers');
  opener.type = 'button';
  opener.setAttribute('aria-haspopup', 'dialog');
  opener.setAttribute('aria-expanded', 'false');
  const dialog = el('dialog', 'flight-search-travellers-dialog');
  dialog.id = id('dialog');
  opener.setAttribute('aria-controls', dialog.id);

  const close = el('button', 'flight-search-travellers-close');
  close.type = 'button';
  close.setAttribute('aria-label', labels['close label']);
  close.innerHTML = CLOSE_ICON;

  // the tab bar (www's .tab-links): Travel details, and Redeem miles where the brand has it
  const tabs = el('div', 'flight-search-travellers-tabs');
  tabs.setAttribute('role', 'tablist');
  const makeTab = (name, text) => {
    const button = el('button', 'flight-search-travellers-tab');
    button.type = 'button';
    button.id = id(`${name}-tab`);
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', id(`${name}-panel`));
    button.append(el('span', '', text));
    tabs.append(button);
    return button;
  };
  const tab = makeTab('details', labels['travel details label']);
  const milesTab = miles ? makeTab('miles', miles.labels['miles tab label']) : null;

  const panel = el('div', 'flight-search-travellers-panel');
  panel.id = id('details-panel');
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', tab.id);
  const left = el('div', 'flight-search-travellers-column');
  const right = el('div', 'flight-search-travellers-column');

  // the travel class (www's maui-select with its label in the box)
  let select = null;
  if (list.length > 1) {
    const cabinWrap = el('label', 'flight-search-passenger-cabin');
    cabinWrap.append(el('span', 'flight-search-passenger-label', labels['cabin label']));
    select = el('select', 'flight-search-passenger-cabin-select');
    select.name = 'cabin';
    list.forEach(([code, key]) => {
      const option = el('option', '', labels[key]);
      option.value = code;
      select.append(option);
    });
    select.addEventListener('change', () => { draft.cabin = select.value; });
    cabinWrap.append(select);
    left.append(cabinWrap);
  }

  // the steppers, one group described by www's group booking note
  const steppers = el('div', 'flight-search-travellers-steppers');
  steppers.setAttribute('role', 'group');
  steppers.setAttribute('aria-label', labels['passengers label']);
  const note = el('span', 'flight-search-travellers-sr-only', labels['group note']);
  note.id = id('group-note');
  if (groupBooking && labels['group note']) {
    steppers.setAttribute('aria-describedby', note.id);
    steppers.append(note);
  }
  const rows = {};
  const seatsFull = (c) => c.adults + (c.youngAdults || 0) + c.children >= MAX_TRAVELLERS;
  const render = () => {
    Object.entries(rows).forEach(([type, row]) => {
      const c = draft.counts;
      row.output.textContent = String(c[type]);
      const up = clampPassengers({ ...c, [type]: c[type] + 1 });
      const down = clampPassengers({ ...c, [type]: c[type] - 1 });
      row.more.disabled = up[type] === c[type] || (type === 'youngAdults' && seatsFull(c));
      row.fewer.disabled = down[type] === c[type];
    });
  };
  ['adults', ...(youngAdults ? ['youngAdults'] : []), 'children', 'infants'].forEach((type) => {
    const name = type.replace(/[A-Z]/g, (ch) => ` ${ch.toLowerCase()}`);
    const row = el('div', `flight-search-passenger flight-search-passenger-${name.replace(' ', '-')}`);
    const text = el('div', 'flight-search-passenger-text');
    text.append(el('span', 'flight-search-passenger-label', labels[`${name} label`]));
    if (labels[`${name} hint`]) text.append(' ', el('span', 'flight-search-passenger-hint', labels[`${name} hint`]));
    const stepper = el('div', 'flight-search-passenger-stepper');
    const fewer = el('button', 'flight-search-passenger-fewer');
    fewer.type = 'button';
    fewer.setAttribute('aria-label', fill(labels['fewer label'], { TYPE: labels[`${name} label`] }));
    const output = el('output', 'flight-search-passenger-count');
    output.setAttribute('aria-live', 'polite');
    const more = el('button', 'flight-search-passenger-more');
    more.type = 'button';
    more.setAttribute('aria-label', fill(labels['more label'], { TYPE: labels[`${name} label`] }));
    const step = (by) => {
      draft.counts = clampPassengers({ ...draft.counts, [type]: draft.counts[type] + by });
      render();
    };
    fewer.addEventListener('click', () => { if (!fewer.disabled) step(-1); });
    more.addEventListener('click', () => { if (!more.disabled) step(1); });
    stepper.append(fewer, output, more);
    row.append(text, stepper);
    rows[type] = { output, more, fewer };
    steppers.append(row);
  });
  left.append(steppers);
  if (groupBooking) {
    const group = el('a', 'flight-search-passengers-group', groupBooking.text);
    group.href = groupBooking.href;
    left.append(group);
  }

  // Alternative fare selection (www's maui-radio-group, best price chosen)
  const fareTitle = el('h3', 'flight-search-fare-label', labels['fare label']);
  fareTitle.id = id('fare');
  const fieldset = el('fieldset', 'flight-search-fare-choices');
  fieldset.append(el('legend', 'flight-search-fare-question', labels['fare question']));
  const radios = FARE_PREFERENCES.map(([code, key]) => {
    const choice = el('label', 'flight-search-fare-choice');
    const radio = el('input', 'flight-search-fare-radio');
    radio.type = 'radio';
    radio.name = id('fare');
    radio.value = code;
    radio.addEventListener('change', () => { if (radio.checked) draft.fare = code; });
    choice.append(radio, el('span', '', labels[key]));
    fieldset.append(choice);
    return radio;
  });

  // the access code (www's maui-input universalCode, optional, with its hint)
  const codeWrap = el('div', 'flight-search-access');
  const codeInput = el('input', 'flight-search-access-code');
  codeInput.type = 'text';
  codeInput.id = id('code');
  codeInput.autocomplete = 'off';
  codeInput.placeholder = labels['access code label'];
  const codeLabel = el('label', 'flight-search-travellers-sr-only', `${labels['access code label']} (${labels['access code optional']})`);
  codeLabel.setAttribute('for', codeInput.id);
  const optional = el('span', 'flight-search-access-optional', labels['access code optional']);
  optional.setAttribute('aria-hidden', 'true');
  const hint = el('p', 'flight-search-access-hint', labels['access code hint']);
  hint.id = id('code-hint');
  codeInput.setAttribute('aria-describedby', hint.id);
  codeInput.addEventListener('input', () => { draft.code = codeInput.value; });
  const box = el('div', 'flight-search-access-box');
  box.append(codeInput, optional);
  codeWrap.append(codeLabel, box, hint);
  right.append(fareTitle, fieldset, codeWrap);

  panel.append(left, right);
  const done = el('button', 'flight-search-travellers-done button primary', labels['continue label']);
  done.type = 'button';
  const footer = el('div', 'flight-search-travellers-footer');
  footer.append(done);
  dialog.append(close, tabs, panel);
  let milesPanel = null;
  if (milesTab) {
    milesPanel = el('div', 'flight-search-travellers-panel flight-search-travellers-miles-panel');
    milesPanel.id = id('miles-panel');
    milesPanel.setAttribute('role', 'tabpanel');
    milesPanel.setAttribute('aria-labelledby', milesTab.id);
    milesPanel.append(buildMilesPanel(miles, id));
    dialog.append(milesPanel);
  }
  dialog.append(footer);

  // tabs as tabs: the open one in the Tab order, arrows (Home, End) move between them and open
  // them; Continue belongs to Travel details only, as on www
  const allTabs = [tab, milesTab].filter(Boolean);
  const panels = [panel, milesPanel].filter(Boolean);
  const openTab = (index, focus) => {
    allTabs.forEach((t, i) => {
      t.setAttribute('aria-selected', String(i === index));
      t.setAttribute('tabindex', i === index ? '0' : '-1');
      panels[i].hidden = i !== index;
    });
    footer.hidden = index !== 0;
    dialog.setAttribute('aria-labelledby', allTabs[index].id);
    if (focus) allTabs[index].focus();
  };
  allTabs.forEach((t, i) => t.addEventListener('click', () => openTab(i, false)));
  tabs.addEventListener('keydown', (e) => {
    const at = allTabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
    const n = allTabs.length;
    const next = {
      ArrowRight: (at + 1) % n, ArrowLeft: (at - 1 + n) % n, Home: 0, End: n - 1,
    }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    openTab(next, true);
  });
  openTab(0, false);

  // the window shows the draft: a copy of the kept values when it opens
  const show = () => {
    openTab(0, false);
    draft = { ...kept, counts: { ...kept.counts } };
    if (select) {
      select.querySelectorAll('option').forEach((o) => {
        o.selected = o.value === draft.cabin;
        o.toggleAttribute('selected', o.selected);
      });
    }
    radios.forEach((r) => { r.checked = r.value === draft.fare; });
    codeInput.value = draft.code;
    render();
  };
  const summary = () => {
    const line = passengerSummary(labels, kept.cabin, kept.counts);
    opener.textContent = kept.fare === 'DEFAULT' ? line : `${line}, ${labels['fare applied']}`;
  };
  const isOpen = () => dialog.open || dialog.hasAttribute('open');
  const open = () => {
    if (isOpen()) return;
    show();
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    opener.setAttribute('aria-expanded', 'true');
    (select || tab).focus();
  };
  const shut = (keep) => {
    if (!isOpen()) return;
    if (keep) {
      Object.assign(kept, draft, { counts: { ...draft.counts }, code: draft.code.trim() });
      summary();
    }
    if (typeof dialog.close === 'function') dialog.close();
    dialog.removeAttribute('open');
    opener.setAttribute('aria-expanded', 'false');
    opener.focus();
  };
  opener.addEventListener('click', open);
  close.addEventListener('click', () => shut(false));
  done.addEventListener('click', () => shut(true));
  // Escape (the dialog's cancel): closed without the changes
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    shut(false);
  });
  // a click on the backdrop (the dialog element itself, outside its box)
  dialog.addEventListener('click', (e) => {
    if (e.target !== dialog || typeof dialog.getBoundingClientRect !== 'function') return;
    const r = dialog.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right
      && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) shut(false);
  });

  wrap.append(opener, dialog);
  show();
  summary();
  return {
    element: wrap,
    getValue: () => ({
      ...kept.counts,
      cabin: kept.cabin,
      farePreference: kept.fare,
      ...(kept.code ? { universalCode: kept.code } : {}),
    }),
  };
}
