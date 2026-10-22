/**
 * Helpers for key/value configuration blocks (flight-search, fare-teaser, destination-finder)
 * and for UI strings that authors can override per page and locale.
 */

/**
 * Removes zero-width characters (the source site wraps link texts in them).
 * @param {string} text
 * @returns {string}
 */
export function stripZeroWidth(text) {
  return (text || '').replace(/[\u200B-\u200D\uFEFF]/g, '');
}

/**
 * Normalizes an authored key cell ("Default origin", "From label") to a config key
 * ("default-origin", "from-label").
 * @param {string} text
 * @returns {string}
 */
export function toConfigKey(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Text of an element without zero-width characters and collapsed whitespace.
 * @param {Element|null} el
 * @returns {string}
 */
export function cleanText(el) {
  return (el ? el.textContent : '').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Reads the two-column rows of a block. Rows with a single cell or an empty key are ignored,
 * extra cells are ignored, and a key authored twice keeps its first value.
 * @param {Element} block
 * @returns {Object<string, {cell: Element, text: string, list: string[],
 *   link: HTMLAnchorElement|null, row: Element}>}
 */
export function readConfigRows(block) {
  const config = {};
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;
    const key = toConfigKey(cleanText(cells[0]));
    if (!key || config[key]) return;
    const cell = cells[1];
    const text = cleanText(cell);
    config[key] = {
      cell,
      row,
      text,
      list: text.split(/\s*[,;\n]\s*/).map((v) => v.trim()).filter(Boolean),
      link: cell.querySelector('a[href]'),
    };
  });
  return config;
}

/**
 * First authored value among several accepted keys.
 * @param {Object} config result of readConfigRows
 * @param {...string} keys accepted keys, in order of preference
 * @returns {Object|undefined}
 */
export function pick(config, ...keys) {
  return keys.map((k) => config[k]).find((v) => v && (v.text || v.cell.querySelector('img, a')));
}

/**
 * UI strings for the page language: built-in defaults for the language, overridden by any
 * authored row whose key matches a label key (e.g. "Swap label | Abflug und Ziel tauschen").
 * @param {Object<string, Object<string, string>>} defaultsByLang e.g. { en: {...}, de: {...} }
 * @param {Object} config result of readConfigRows
 * @param {string} lang page language
 * @returns {Object<string, string>}
 */
export function resolveLabels(defaultsByLang, config, lang) {
  const defaults = defaultsByLang[lang] || defaultsByLang.en || {};
  return Object.fromEntries(Object.entries(defaults).map(([key, value]) => {
    const authored = config[toConfigKey(key)];
    return [key, authored && authored.text ? authored.text : value];
  }));
}

/**
 * Three-letter airport/city code from an authored value: "FRA" or "Frankfurt (FRA)".
 * @param {string} text
 * @returns {string} upper-case code or ''
 */
export function parseAirportCode(text) {
  const value = (text || '').trim();
  const inParens = value.match(/\(([A-Za-z]{3})\)/);
  if (inParens) return inParens[1].toUpperCase();
  return /^[A-Za-z]{3}$/.test(value) ? value.toUpperCase() : '';
}

/**
 * Display name from an authored value: "Frankfurt (FRA)" gives "Frankfurt".
 * @param {string} text
 * @returns {string}
 */
export function parseAirportName(text) {
  const value = (text || '').replace(/\(([A-Za-z]{3})\)/, '').trim();
  return /^[A-Za-z]{3}$/.test(value) ? '' : value;
}

/**
 * Formats a price for the page locale. Returns '' for missing or invalid amounts.
 * @param {number|string} amount
 * @param {string} currency ISO currency code
 * @param {{lang: string, country: string}} locale
 * @returns {string}
 */
export function formatPrice(amount, currency, locale) {
  const value = Number(amount);
  if (amount === null || amount === undefined || amount === '' || Number.isNaN(value)) return '';
  try {
    return new Intl.NumberFormat(`${locale.lang}-${locale.country.toUpperCase()}`, {
      style: 'currency',
      currency: currency || locale.currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch (e) {
    return `${Math.round(value)} ${currency || locale.currency || ''}`.trim();
  }
}

/**
 * Whether a link leaves this site (opened in a new tab like on the live site).
 * @param {string} href
 * @returns {boolean}
 */
export function isExternalLink(href) {
  try {
    return new URL(href, window.location.href).origin !== window.location.origin;
  } catch (e) {
    return false;
  }
}

/**
 * Opens external links in a new tab.
 * @param {Element} root
 */
export function decorateExternalLinks(root) {
  root.querySelectorAll('a[href]').forEach((a) => {
    if (isExternalLink(a.href)) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
  });
}

/**
 * Copies the intrinsic size (width / height attributes the pipeline puts on authored images)
 * from the source image to the image of a picture built by createOptimizedPicture, so a lazy
 * image reserves its space before it loads (no layout shift).
 * @param {HTMLImageElement} from
 * @param {Element} picture
 * @returns {Element} the picture
 */
export function keepImageSize(from, picture) {
  const img = picture && (picture.tagName === 'IMG' ? picture : picture.querySelector('img'));
  if (!from || !img) return picture;
  ['width', 'height'].forEach((a) => {
    const v = from.getAttribute(a);
    if (v && !img.hasAttribute(a)) img.setAttribute(a, v);
  });
  return picture;
}
