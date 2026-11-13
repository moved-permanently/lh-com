/*
 * The header's tool items (the nav document's tools section) by role: accessibility, help, search,
 * cart, login, locale, notifications. An item names its role with a marker anywhere in its text,
 * as the documents' style markers ("Baggage {heading-small}"): ":austrian-cart: Your Cart {cart}",
 * so a brand's own icon keeps the role's behaviour (the cart dialog, the locale dialog, the login
 * link). Without a marker the icon's name decides, as before (":cart:", ":globe:" …), and a
 * travelid/login link is the login. Without markers: a Nav Tools table in the tools section, one
 * row per item (the item | its role), scripts/token-free.js makes it the list (data-role).
 */

import { NAV_ROLES, readNavRole } from '../../scripts/style-markers.js';

// the roles (scripts/style-markers.js NAV_ROLES, shared with the nav document's Nav Tools table)
export const ROLE_MARKERS = NAV_ROLES;

const MARKER = new RegExp(`\\s*\\{(${ROLE_MARKERS.join('|')})\\}\\s*`);

/** The roles of lh-com's icon names (the items without a marker). */
export const TOOL_ROLES = {
  wheelchair: 'accessibility',
  accessibility: 'accessibility',
  help: 'help',
  question: 'help',
  search: 'search',
  cart: 'cart',
  'shopping-cart': 'cart',
  login: 'login',
  profile: 'login',
  user: 'login',
  globe: 'locale',
  earth: 'locale',
  // the notifications bell (a brand with notifications: the panel, ./header-notifications.js)
  bell: 'notifications',
  notification: 'notifications',
  notifications: 'notifications',
};

/**
 * Takes an item's role marker out of its text.
 * @param {Element} li the tool item
 * @returns {string|null} the role, null without a marker
 */
export function takeRole(li) {
  const nodes = [];
  const walk = (node) => node.childNodes.forEach((c) => {
    if (c.nodeType === 3) nodes.push(c);
    else walk(c);
  });
  walk(li);
  const node = nodes.find((n) => MARKER.test(n.nodeValue));
  if (!node) return null;
  const [found, role] = node.nodeValue.match(MARKER);
  const at = node.nodeValue.indexOf(found);
  const before = node.nodeValue.slice(0, at);
  const after = node.nodeValue.slice(at + found.length);
  node.nodeValue = before && after ? `${before} ${after}` : before + after;
  return role;
}

/**
 * The role a Nav Tools table gave an item (its role column, scripts/token-free.js: the li's
 * data-role), else null.
 * @param {Element} li
 * @returns {string|null}
 */
export const tableRole = (li) => readNavRole(li.dataset ? li.dataset.role : '');

/**
 * An item's role: its marker, else its icon's name, else a login link's.
 * @param {{marker: string|null, icon: string|null, href: string|null}} item
 * @returns {string|null}
 */
export function toolRole({ marker, icon, href }) {
  if (marker) return marker;
  if (icon && TOOL_ROLES[icon]) return TOOL_ROLES[icon];
  if (href && /travelid|login/i.test(href)) return 'login';
  return null;
}

/*
 * The cart's texts on www (swiss-parity-001 ch/en and ch/de, ita-parity-001 it/en, Brussels'
 * be/fr, Austrian's at/en and at/de): the bar's icon button is named with the first, the menu's
 * item reads the second. The nav documents carry one of them. Only the brands whose www menus
 * were captured ('' is lh-com: lufthansa-parity-001 de/en + de/de, brief 401), and the
 * languages captured.
 */
export const CART_TEXT_BRANDS = ['swiss', 'ita', 'austrian', 'brussels', ''];

const CART_TEXTS = {
  en: ['Shopping cart preview', 'Your Cart'],
  de: ['Warenkorb-Vorschau', 'Ihr Warenkorb'],
  fr: ['Aperçu du panier', 'Votre panier'],
};

/**
 * The cart's bar name and menu label for its nav label.
 * @param {string} label the nav item's text
 * @param {string} lang the page's language
 * @param {string} brand the page's brand key ('' for lh-com)
 * @returns {{bar: string, menu: string}} www's two texts when the label is one of them, else the
 *   label in both places
 */
export function cartLabels(label, lang, brand) {
  const texts = CART_TEXT_BRANDS.includes(brand) ? CART_TEXTS[lang] : null;
  const same = (a, b) => a.trim().toLowerCase() === b.toLowerCase();
  if (texts && texts.some((t) => same(label, t))) return { bar: texts[0], menu: texts[1] };
  return { bar: label, menu: label };
}

/**
 * The option of a country list ({name, href}, the nav's ":globe:" sub-list) the locale dialog
 * preselects: www's selector shows the page's own country (selected="DE" on de/en), on a language
 * version its "Other countries" entry (XX; our nav's own-root link, /xx/pl/homepage). The same
 * country and language first, then the country in another language.
 * @param {Array<{href: string}>} countries the list in its order
 * @param {{country: string, lang: string}} locale the page's locale
 * @returns {number} the option's index, -1 for none (the list's first stays)
 */
export function currentCountry(countries, locale) {
  const roots = countries.map((c) => {
    const m = String(c.href || '').match(/^(?:https?:\/\/[^/]+)?\/([a-z]{2})\/([a-z]{2})(?:\/|$)/);
    return m ? { country: m[1], lang: m[2] } : null;
  });
  const same = roots.findIndex((r) => r && r.country === locale.country && r.lang === locale.lang);
  return same >= 0 ? same : roots.findIndex((r) => r && r.country === locale.country);
}
