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
export function groupTravelPath(url, root = '') {
  let p = String(url || '').trim();
  if (!p) return '';
  try { p = new URL(p, 'https://www.lufthansa.com').pathname; } catch (e) { return ''; }
  // www's global content (/content/lh/gc/<ll>/…: the xx roots' flight search pages): the page's own
  // root, when known (else no link: www's internal address is no page of the site)
  const gc = p.match(/^\/content\/[a-z0-9-]+\/gc\/[a-z]{2}(\/.*)?$/);
  if (gc) {
    if (!/^\/[a-z]{2}\/[a-z]{2}$/.test(root)) return '';
    p = `${root}${gc[1] || ''}`;
  }
  // any brand's internal address (/content/lh/markets/, Brussels' /content/bel/markets/, brief 448)
  p = p.replace(/^\/content\/[a-z0-9-]+\/markets(?=\/)/, '').replace(/\.html$/, '').replace(/(.)\/$/, '$1');
  // a bare root (the xx cash-and-miles pages' /content/lh/markets/xx/hk, brief 455): no group
  // page, so the root's group travel page
  if (/^\/[a-z]{2}\/[a-z]{2}$/.test(p)) return `${p}/group-travel`;
  return p.replace(/^(\/[a-z]{2}\/[a-z]{2})\/book-and-manage\/group-travel$/, '$1/group-travel');
}

/**
 * The roots whose documents show www's Young Adults (12-15 years), by the countries the row names:
 * www shows them on gb/en and gb/de (checked 2026-11-01; not on de/en, de/de, at/de, at/en, ie/en,
 * ie/de, nl/en), and gb/de is served from the de/de documents.
 */
const YOUNG_ADULTS = { 'gb/en': 'GB', 'gb/de': 'GB', 'de/de': 'GB' };

/**
 * The picker's rows: [key, value]; the group booking value is { href, text }. Brief 239: no
 * adults hint (an empty Adults hint row: www shows none), Young adults where www shows them,
 * www's Alternative fare selection (Fare preference) on every root; the block's texts for them
 * are www's (blocks/flight-search/picker-options.js).
 * @param {{lang: string, groupBookingsUrl?: string, labels?: Object, groupText?: string}} o lang
 *   the page's language (en and de have recorded texts; without a language: English); the root
 *   is groupBookingsUrl's market (/content/<brand>/markets/<cc>/<ll>/); labels the page's own
 *   texts (pageBookingLabels), groupText the page's group link text, root the page's
 *   /<cc>/<ll> (for www's global-content links)
 */
export function pickerRows({
  lang, groupBookingsUrl, labels = null, groupText = '', root = '',
} = {}) {
  // the page's own texts first (its label state, brief 448), else the recorded en / de texts,
  // else none: the block's texts in the page's language
  const recorded = TEXTS[lang] || (lang ? {} : TEXTS.en);
  const t = labels ? { ...(TEXTS[lang] || {}), ...labels } : recorded;
  const market = String(groupBookingsUrl || '').match(/\/markets\/([a-z]{2})\/([a-z]{2})\//);
  const young = market && YOUNG_ADULTS[`${market[1]}/${market[2]}`];
  const rows = [['Passenger picker', 'yes'], ['Adults hint', '']];
  if (young) rows.push(['Young adults', young]);
  Object.entries(t).forEach(([k, v]) => { if (k !== 'group') rows.push([k, v]); });
  const href = groupTravelPath(groupBookingsUrl, root);
  const text = groupText || recorded.group;
  if (href && text) rows.push(['Group booking', { href, text }]);
  rows.push(['Fare preference', 'yes']);
  return rows;
}

const LABEL_KEYS = {
  'Children label': 'common.booking.children.label',
  'Children hint': 'common.booking.children.hint',
  'Infants label': 'common.booking.infants.label',
  'Infants hint': 'common.booking.infants.hint',
};

/**
 * The picker's texts from a page's label state (www's window.__PRELOADED_STATE__ holds the label
 * bundles: "common.booking.children.label":"Enfants", …), non-breaking spaces as spaces; null when
 * the page does not have all four.
 * @param {string} html the page's HTML (or a script's text)
 */
export function pageBookingLabels(html) {
  const out = {};
  Object.entries(LABEL_KEYS).forEach(([row, key]) => {
    const m = String(html || '').match(new RegExp(`"${key.replace(/\./g, '\\.')}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
    if (!m) return;
    try { out[row] = JSON.parse(`"${m[1]}"`).replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim(); } catch (e) { /* not a JSON string */ }
  });
  return Object.keys(out).length === 4 ? out : null;
}
