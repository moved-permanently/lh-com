/**
 * The passenger picker's lufthansa.com options, each by its own row (none without it):
 * - `Young adults`: www's "Young Adults (12-15 years)" stepper, on the roots its row names
 *   (`GB`, a list of countries) or everywhere (`yes`); handed off as B15 after the adults.
 * - `Fare preference`: www's "Alternative fare selection" (best price, coupon, high); handed off
 *   as farePreference after the cabin, none for best price (www sends none either).
 * - a hint row left empty, or without its value cell (`Adults hint`): no hint (www shows none
 *   under the adults).
 * The handoff's additions live here, not in scripts/shop-handoff.js: a visitor with that script
 * cached from before still hands off what the picker shows.
 */

import { cleanText, resolveLabels, toConfigKey } from '../../scripts/block-config.js';

/** www's texts (labels of its flightmanager and common bundles), per language. */
export const PICKER_OPTION_LABELS = {
  en: {
    'young adults label': 'Young Adults',
    'young adults hint': '(12-15 years)',
    'fare label': 'Alternative fare selection',
    'fare question': 'Which fare benefits do you prefer?',
    'fare default label': 'Best price offers',
    'fare coupon label': 'Change the sequence of my flights',
    'fare high label': 'Flexibility/highest booking class to collect more miles',
    'fare applied': 'Your fare selection is active.',
  },
  de: {
    'young adults label': 'Junge Erwachsene',
    'young adults hint': '(12-15 Jahre)',
    'fare label': 'Alternative Tarifoptionen',
    'fare question': 'Welche Tarifvorteile sind Ihnen wichtiger?',
    'fare default label': 'Bestpreisangebote',
    'fare coupon label': 'Reihenfolge meiner Flüge ändern',
    'fare high label': 'Flexibilität bzw. höchste Buchungsklasse, um mehr Meilen zu sammeln',
    'fare applied': 'Der ausgewählte Tarif wurde übernommen.',
  },
};

/** The picker's hints a document can leave out. */
const HINTS = ['adults hint', 'young adults hint', 'children hint', 'infants hint'];

const YES = /^(y|yes|true|ja|si|sì|oui|1)$/i;

/** Whether a row's value turns its option on for the locale: yes, or a list with its country. */
function shows(entry, locale) {
  if (!entry || !entry.text) return false;
  if (YES.test(entry.text)) return true;
  const country = String(locale.country || '').toUpperCase();
  return Boolean(country) && entry.list.some((c) => c.toUpperCase() === country);
}

/**
 * The block's picker options.
 * @param {Element} block the authored block (its rows, read before decoration)
 * @param {Object} config result of readConfigRows
 * @param {Object} locale result of getLocale()
 * @returns {{youngAdults: boolean, farePreference: boolean, labels: Object<string, string>}}
 *   labels: the options' texts (only when an option is on) and the hints left out ('')
 */
export function readPickerOptions(block, config, locale) {
  const youngAdults = shows(config['young-adults'], locale);
  const farePreference = shows(config['fare-preference'], locale);
  const labels = youngAdults || farePreference
    ? resolveLabels(PICKER_OPTION_LABELS, config, locale.lang) : {};
  // a row without its value cell is not in config (readConfigRows skips it)
  const keyOnly = [...block.children]
    .filter((row) => row.children.length === 1)
    .map((row) => toConfigKey(cleanText(row.children[0])));
  HINTS.forEach((hint) => {
    const key = toConfigKey(hint);
    // an empty value cell: in config with no text
    if (config[key] ? !config[key].text : keyOnly.includes(key)) labels[hint] = '';
  });
  return { youngAdults, farePreference, labels };
}

/** The shop's fare preferences: best price (sent as none), coupon, high. */
export const FARE_PREFERENCES = [['DEFAULT', 'fare default label'], ['COUPON', 'fare coupon label'], ['HIGH', 'fare high label']];

/**
 * The handoff with the picker's young adults and fare preference, as www sends them: B15 after
 * the adults (before the children and infants), farePreference right after the cabin. Nothing to
 * add, or not the shop's search (Air Dolomiti's): the same handoff.
 * @param {{action: string, fields: Object<string, string>}} handoff result of buildShopHandoff
 * @param {Object} [value] the picker's value
 */
export function applyPickerChoices(handoff, value) {
  const young = Math.max(0, parseInt((value || {}).youngAdults, 10) || 0);
  const fare = (value || {}).farePreference;
  const preference = FARE_PREFERENCES.some(([code]) => code === fare) && fare !== 'DEFAULT' ? fare : '';
  if (!young && !preference) return handoff;
  let search;
  try {
    search = JSON.parse(handoff.fields.search);
  } catch (e) {
    return handoff;
  }
  if (!search || !Array.isArray(search.travelers) || !search.cabin) return handoff;
  const adults = search.travelers.filter((t) => t.passengerTypeCode === 'ADT');
  const others = search.travelers.filter((t) => t.passengerTypeCode !== 'ADT');
  const travelers = [
    ...adults,
    ...Array.from({ length: young }, () => ({ discounts: [], passengerTypeCode: 'B15' })),
    ...others,
  ];
  const next = Object.fromEntries(Object.entries(search).flatMap(([key, v]) => {
    if (key === 'travelers') return [[key, travelers]];
    if (key === 'cabin' && preference) return [[key, v], ['farePreference', preference]];
    return [[key, v]];
  }));
  return { ...handoff, fields: { ...handoff.fields, search: JSON.stringify(next) } };
}
