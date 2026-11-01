/* eslint-disable */
/**
 * lufthansa.com's passengers and cabin picker rows for the flight-search block (blocks/flight-search
 * Passenger picker, passenger-picker.js), as www.lufthansa.com's flight manager shows its travel
 * details panel (checked 2026-11-01 on de/en, de/de, at/de, gb/en homepages and de/en/flight-search):
 * the four cabins, adults 1-9, children 0-8, infants without seat, and the group booking link to the
 * root's group travel page (the flight manager's groupBookingsUrl). Its texts are www's label
 * bundles' (labels/common booking.*, labels/flightmanager travelDetails.groupBookingLinkText,
 * recorded in data/recorded); the panel is closed when a page is imported, so they are not in its
 * DOM. Used by the flight-search parser (later imports) and by tools/importer/lh-picker-apply.mjs
 * (the documents imported before).
 */

/** www's panel texts per language (the block's own defaults where they are www's: Adults). */
const TEXTS = {
  en: {
    'Children label': 'Children',
    'Children hint': '(2-11 years)',
    'Infants label': 'Infants without seat',
    'Infants hint': '(0-23 months)',
    group: 'Group bookings for 10 or more passengers.',
  },
  de: {
    'Children label': 'Kinder',
    'Children hint': '(2-11 Jahre)',
    'Infants label': 'Kleinkinder ohne Sitzplatz',
    'Infants hint': '(0-23 Monate)',
    // www's traveller line: "Economy, 1 Reisende(r)" (the block's default: "1 Reisender")
    'Traveller summary': '{CABIN}, {COUNT} Reisende(r)',
    group: 'Gruppenbuchungen für zehn oder mehr Passagiere.',
  },
};

/**
 * Our group travel page for www's groupBookingsUrl: /content/lh/markets/<cc>/<ll>/... is
 * /<cc>/<ll>/...; www's book-and-manage/group-travel is our /<cc>/<ll>/group-travel (the
 * site's redirect target).
 */
export function groupTravelPath(url) {
  let p = String(url || '').trim();
  if (!p) return '';
  try { p = new URL(p, 'https://www.lufthansa.com').pathname; } catch (e) { return ''; }
  p = p.replace(/^\/content\/lh\/markets(?=\/)/, '').replace(/\.html$/, '');
  return p.replace(/^(\/[a-z]{2}\/[a-z]{2})\/book-and-manage\/group-travel$/, '$1/group-travel');
}

/**
 * The picker's rows: [key, value]; the group booking value is { href, text }.
 * @param {{lang: string, groupBookingsUrl?: string}} o lang en or de (others: English)
 */
export function pickerRows({ lang, groupBookingsUrl } = {}) {
  const t = TEXTS[lang] || TEXTS.en;
  const rows = [['Passenger picker', 'yes']];
  Object.entries(t).forEach(([k, v]) => { if (k !== 'group') rows.push([k, v]); });
  const href = groupTravelPath(groupBookingsUrl);
  if (href) rows.push(['Group booking', { href, text: t.group }]);
  return rows;
}
