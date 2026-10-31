/**
 * Message Center (current travel information, alerts and promotions), shared by the blocks
 * flash-teaser (homepage strip) and message-center (current travel information page).
 *
 * Messages are authored in Document Authoring, one document per message and language at
 * /message-center/<type>/<id>/<lang> (type irreg, tech-outage or promo), and listed in the query
 * index /message-center/index.json (helix-query.yaml, index message-center): path, headline,
 * criticality (high/low), tenants, markets, touchpoints (lists; markets [] = all), link, details,
 * from, to (ISO UTC or ""), push, internal-title, lastModified (seconds).
 * The current travel information page per tenant: /message-center/config/cti-pages.json (tenant,
 * webPath with {cc}/{ll}, contentPath).
 * Each site reads its own index and sheet (same origin) and shows its own tenant's messages: the
 * tenant of its brand (scripts/brand.js BRANDS messageCenter), lh-com's 'lh' without a brand.
 */

import { now as clockNow } from './clock.js';
import { BRANDS, brandOf } from './brand.js';

/** lh-com's tenant (a site without a brand key, and no page at all). */
export const TENANT = 'lh';
export const TOUCHPOINT = 'web';
export const TYPES = ['irreg', 'tech-outage', 'promo'];
export const INDEX_PATH = '/message-center/index.json';
export const CTI_PAGES_PATH = '/message-center/config/cti-pages.json';

/**
 * The site's Message Center tenant: its brand's, '' for a brand without one (no messages), TENANT
 * for lh-com (no brand key) and outside a page.
 * @param {Function} [read] metadata reader (default: the page's, as scripts/brand.js)
 * @returns {string}
 */
export function siteTenant(read) {
  if (!read && typeof document === 'undefined') return TENANT;
  const key = brandOf(read);
  return key ? BRANDS[key].messageCenter || '' : TENANT;
}

/** Display order: irreg high, tech-outage high, irreg low, tech-outage low, promo high, low. */
const RANK = {
  'irreg/high': 0,
  'tech-outage/high': 1,
  'irreg/low': 2,
  'tech-outage/low': 3,
  'promo/high': 4,
  'promo/low': 5,
};

/** A list field of the index: a JSON array, a JSON array as string, or a comma list. */
export function listField(value) {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim().toLowerCase()).filter(Boolean);
  }
  const text = String(value ?? '').trim();
  if (!text) return [];
  if (text.startsWith('[')) {
    try {
      return listField(JSON.parse(text));
    } catch (e) {
      // fall through to the comma list
    }
  }
  return text.split(',').map((v) => v.trim().toLowerCase()).filter(Boolean);
}

/** ISO time of the index as ms, or null when empty or unreadable. */
function time(value) {
  const ms = Date.parse(String(value || '').trim());
  return Number.isFinite(ms) ? ms : null;
}

/**
 * One index row as a message: type, id and language come from its path
 * (/message-center/<type>/<id>/<lang>). Rows with another path shape are dropped (null).
 */
export function parseRow(row) {
  const m = String(row.path || '').match(/^\/message-center\/([a-z-]+)\/([^/]+)\/([a-z]{2})$/);
  if (!m || !TYPES.includes(m[1])) return null;
  const criticality = String(row.criticality || '').trim().toLowerCase() === 'high' ? 'high' : 'low';
  return {
    path: row.path,
    type: m[1],
    id: m[2],
    lang: m[3],
    headline: String(row.headline || '').trim(),
    criticality,
    tenants: listField(row.tenants),
    markets: listField(row.markets),
    touchpoints: listField(row.touchpoints),
    link: String(row.link || '').trim(),
    details: String(row.details || '').trim(),
    from: time(row.from),
    to: time(row.to),
    push: String(row.push).trim() === 'true',
    lastModified: Number(row.lastModified) || 0,
  };
}

/** Newest first within a rank: the start of its window, else its last modification. */
const recency = (msg) => msg.from ?? msg.lastModified * 1000;

/**
 * The messages a page shows, in display order.
 * @param {Object[]} rows rows of /message-center/index.json
 * @param {Object} options
 * @param {string} options.market the page's market (country code, e.g. 'de')
 * @param {string} options.lang the page's language (e.g. 'en')
 * @param {number} [options.now] ms since the epoch (default: the page's clock, scripts/clock.js:
 *   the real time, or the time travelled to on a preview host)
 * @param {string[]} [options.types] the types the block shows (default: all three)
 * @param {string} [options.tenant] default: the site's (siteTenant)
 * @param {string} [options.touchpoint] default 'web'
 * @returns {Object[]} messages (parseRow shape)
 */
export function selectMessages(rows, {
  market, lang, now = clockNow(), types = TYPES, tenant = siteTenant(), touchpoint = TOUCHPOINT,
} = {}) {
  const parsed = (rows || []).map(parseRow).filter(Boolean);
  // one row per message: the page's language, else English
  const byMessage = new Map();
  parsed.forEach((msg) => {
    const key = `${msg.type}/${msg.id}`;
    const current = byMessage.get(key);
    if (msg.lang === lang) byMessage.set(key, msg);
    else if (msg.lang === 'en' && (!current || current.lang !== lang)) byMessage.set(key, msg);
  });
  const cc = String(market || '').toLowerCase();
  const visible = [...byMessage.values()].filter((msg) => types.includes(msg.type)
    && msg.headline
    && msg.tenants.includes(tenant)
    && (!msg.markets.length || msg.markets.includes(cc))
    && msg.touchpoints.includes(touchpoint)
    && (msg.from === null || msg.from <= now)
    && (msg.to === null || now < msg.to));
  // promotions only while there is no irregularity or outage to show
  const alerts = visible.some((msg) => msg.type !== 'promo');
  return visible
    .filter((msg) => !alerts || msg.type !== 'promo')
    .sort((a, b) => RANK[`${a.type}/${a.criticality}`] - RANK[`${b.type}/${b.criticality}`]
      || recency(b) - recency(a));
}

/**
 * The link of a message: its own link, else the tenant's current travel information page for
 * the page's locale; with #<id> (the message center item of that id opens).
 * @param {Object} msg parseRow shape
 * @param {Object[]} ctiRows rows of /message-center/config/cti-pages.json
 * @param {Object} locale getLocale() result (country, lang)
 * @param {string} [tenant] default: the site's (siteTenant)
 * @returns {string} the href, or '' when there is none
 */
export function messageHref(msg, ctiRows, locale, tenant = siteTenant()) {
  let href = msg.link;
  if (!href && tenant) {
    const row = (ctiRows || [])
      .find((r) => String(r.tenant || '').trim().toLowerCase() === tenant && r.webPath);
    if (row) {
      href = String(row.webPath).trim()
        .replace(/\{cc\}/g, locale.country)
        .replace(/\{ll\}/g, locale.lang);
    }
  }
  if (!href) return '';
  return `${href.replace(/#.*$/, '')}#${encodeURIComponent(msg.id)}`;
}

const sheetRows = (json) => (json && Array.isArray(json.data) ? json.data : []);

/**
 * Fetches a sheet without the browser's cached copy (pages and JSON are served with
 * max-age=7200: a withdrawn message would otherwise show for up to 2 hours).
 */
async function fetchSheet(path) {
  try {
    const resp = await fetch(path, { cache: 'no-cache' });
    if (!resp.ok) return [];
    return sheetRows(await resp.json());
  } catch (e) {
    return [];
  }
}

let indexRequest;
let ctiRequest;

/** Starts loading the index (once per page); both blocks share the request. */
export function loadIndex() {
  if (!indexRequest) indexRequest = fetchSheet(INDEX_PATH);
  return indexRequest;
}

/** Starts loading the current travel information pages sheet (once per page). */
export function loadCtiPages() {
  if (!ctiRequest) ctiRequest = fetchSheet(CTI_PAGES_PATH);
  return ctiRequest;
}

/** The types an authored block shows: a "Types" row (comma list), default all three. */
export function readTypes(block, fallback = TYPES) {
  const row = [...block.children].find((r) => /^types?$/i.test((r.children[0]?.textContent || '').trim()));
  if (!row || !row.children[1]) return fallback;
  const types = listField(row.children[1].textContent).map((t) => t.replace(/\s+/g, '-'))
    .map((t) => (t === 'outage' || t === 'techoutage' ? 'tech-outage' : t))
    .filter((t) => TYPES.includes(t));
  return types.length ? types : fallback;
}

/** 16px / 24px icons of the messages (maui warning, info, sale). */
export const ICONS = {
  warning: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2.5 1 21.5h22L12 2.5Zm1 16h-2v-2h2v2Zm0-4h-2V9h2v5.5Z"/></svg>',
  info: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-6h2v6Zm0-8h-2V7h2v2Z"/></svg>',
  sale: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M21.4 11.6 12.4 2.6A2 2 0 0 0 11 2H4a2 2 0 0 0-2 2v7c0 .55.22 1.05.59 1.42l9 9a2 2 0 0 0 2.82 0l7-7a2 2 0 0 0 0-2.82ZM6.5 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm4.15 8.6-1.4-1.4 6.1-6.1 1.4 1.4-6.1 6.1Zm.6-4.35a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm4.5 4.5a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Z"/></svg>',
};

/** The icon of a message: warning for high, sale for promotions, info otherwise. */
export function iconOf(msg) {
  if (msg.type === 'promo') return 'sale';
  return msg.criticality === 'high' ? 'warning' : 'info';
}
