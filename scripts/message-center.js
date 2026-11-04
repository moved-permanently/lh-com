/**
 * Message Center (current travel information, alerts and promotions), shared by the blocks
 * flash-teaser (homepage strip) and message-center (current travel information page).
 *
 * Messages are authored in Document Authoring, one document per message and language at
 * /message-center/<type>/<id>/<lang> (type irreg, tech-outage or promo), and listed in the query
 * index /message-center/index.json (helix-query.yaml, index message-center): path, headline,
 * criticality (high/low), tenants, markets, touchpoints (lists; markets [] = all), link, details,
 * from, to (ISO UTC or ""), push, internal-title, weight (a tenant's own order, 1 first: TAP's;
 * WEIGHT_TENANTS), lastModified (seconds).
 * The current travel information page per tenant: /message-center/config/cti-pages.json (tenant,
 * webPath with {cc}/{ll}, contentPath; optionally language: a row for one language, before the
 * tenant's row without one).
 * Each site reads its own index and sheet (same origin) and shows its own tenant's messages: the
 * tenant of its brand (scripts/brand.js BRANDS messageCenter), lh-com's 'lh' without a brand.
 * The sites without <cc>/<ll> roots (Cargo, Air Dolomiti; TAP's <ll>-<cc> roots): messageLocale.
 */

import { now as clockNow } from './clock.js';
import { BRANDS, brandOf } from './brand.js';
import { getLocale } from './locale.js';
import { languageOfPath } from './site-languages.js';

/** lh-com's tenant (a site without a brand key, and no page at all). */
export const TENANT = 'lh';
export const TOUCHPOINT = 'web';
export const TYPES = ['irreg', 'tech-outage', 'promo'];
export const INDEX_PATH = '/message-center/index.json';
export const CTI_PAGES_PATH = '/message-center/config/cti-pages.json';
/** The tenants whose messages show in their weight order (1 first), not by rank: TAP's (www's). */
export const WEIGHT_TENANTS = ['tap'];

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

/** A page metadata value (as scripts/brand.js reads it). */
const metadata = (name) => {
  if (typeof document === 'undefined' || !document.head) return '';
  const meta = document.head.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  return meta ? meta.content : '';
};

/**
 * The locale the Message Center reads a page with: getLocale() as it is for lh-com and the sites
 * with <cc>/<ll> roots; on a site without roots (Cargo /en/, /de/; Air Dolomiti / Italian, /en/,
 * /de/) the page's language from its `language` metadata, else its first path segment (the
 * site's languages, scripts/site-languages.js), and no country: such a site has no markets, so it
 * shows the messages for all markets. A site whose languages name a country (TAP's <ll>-<cc>
 * roots: pt-pt, en-pt) keeps the root's country: its market-only messages (the Portuguese ID card
 * on pt-pt and en-pt).
 * @param {Object} [options]
 * @param {Object} [options.locale] getLocale() result
 * @param {Function} [options.read] metadata reader
 * @param {string} [options.pathname]
 * @returns {Object} the locale (country, lang, ...)
 */
export function messageLocale({
  locale = getLocale(), read = metadata, pathname = window.location.pathname,
} = {}) {
  if (!locale.siteLanguages) return locale;
  const authored = String(read('language') || '').trim().toLowerCase();
  // a site whose languages name a country (TAP): the path's root first (en-us, not the first
  // English root en-pt); the others: the language metadata first, as before
  const rooted = locale.siteLanguages.some((l) => l.country)
    && languageOfPath(pathname, locale.siteLanguages);
  const own = rooted || locale.siteLanguages.find((l) => l.lang === authored)
    || languageOfPath(pathname, locale.siteLanguages);
  return { ...locale, lang: own ? own.lang : locale.lang, country: (own && own.country) || '' };
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

/** A weight of the index (1, 2 …), or null when empty or no number. */
function weightOf(value) {
  const text = String(value ?? '').trim();
  const n = text ? Number(text) : NaN;
  return Number.isFinite(n) ? n : null;
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
  // the language: two letters, with a region where a market has its own wording (TAP's pt-br)
  const m = String(row.path || '').match(/^\/message-center\/([a-z-]+)\/([^/]+)\/([a-z]{2}(?:-[a-z]{2})?)$/);
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
    weight: weightOf(row.weight),
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
  const cc = String(market || '').toLowerCase();
  // one row per message: the page's language and market (pt-br on /pt-br), else its language,
  // else English; another market's or language's document none
  const own = cc ? `${lang}-${cc}` : '';
  const score = (msg) => {
    if (own && msg.lang === own) return 3;
    if (msg.lang === lang) return 2;
    return msg.lang === 'en' ? 1 : 0;
  };
  const byMessage = new Map();
  parsed.forEach((msg) => {
    const key = `${msg.type}/${msg.id}`;
    const current = byMessage.get(key);
    if (score(msg) && (!current || score(msg) > score(current))) byMessage.set(key, msg);
  });
  const visible = [...byMessage.values()].filter((msg) => types.includes(msg.type)
    && msg.headline
    && msg.tenants.includes(tenant)
    && (!msg.markets.length || msg.markets.includes(cc))
    && msg.touchpoints.includes(touchpoint)
    && (msg.from === null || msg.from <= now)
    && (msg.to === null || now < msg.to));
  // promotions only while there is no irregularity or outage to show
  const alerts = visible.some((msg) => msg.type !== 'promo');
  const byRank = (a, b) => RANK[`${a.type}/${a.criticality}`] - RANK[`${b.type}/${b.criticality}`]
    || recency(b) - recency(a);
  // a tenant with its own order (TAP): by weight, the rows without one after them by rank
  const byWeight = (a, b) => {
    if (a.weight !== null && b.weight !== null) return a.weight - b.weight || byRank(a, b);
    if (a.weight !== null || b.weight !== null) return a.weight !== null ? -1 : 1;
    return byRank(a, b);
  };
  return visible
    .filter((msg) => !alerts || msg.type !== 'promo')
    .sort(WEIGHT_TENANTS.includes(tenant) ? byWeight : byRank);
}

/**
 * A TAP market root's own copy of a language version's page (brief 358: www links pt-il's alerts
 * strip to /pt-il/alertas-e-informacoes): the path with the root in place of its version
 * (scripts/site-languages.js tapLanguages: version, lacks), unless the root lacks the page; any
 * other locale and path as it is.
 */
function rootPath(path, locale) {
  const root = String(locale.base || '').replace(/^\/content(?=\/)/, '').replace(/^\//, '');
  const entry = (locale.siteLanguages || []).find((l) => l.path === `/${root}/`);
  if (!entry || !entry.version || !path.startsWith(`/${entry.version}/`)) return path;
  const suffix = path.slice(entry.version.length + 1).replace(/[?#].*$/, '');
  return (entry.lacks || []).includes(suffix) ? path : `/${root}${path.slice(entry.version.length + 1)}`;
}

/**
 * The tenant's current travel information page for the page's locale: its row for the page's
 * language, else its row without a language ({cc}, {ll} filled); '' without one. On a TAP market
 * root its own copy of the page (rootPath).
 * @param {Object[]} ctiRows rows of /message-center/config/cti-pages.json
 * @param {Object} locale (country, lang)
 * @param {string} [tenant] default: the site's (siteTenant)
 * @returns {string}
 */
export function ctiPagePath(ctiRows, locale, tenant = siteTenant()) {
  if (!tenant) return '';
  const rows = (ctiRows || [])
    .filter((r) => String(r.tenant || '').trim().toLowerCase() === tenant && r.webPath);
  const language = (r) => String(r.language || '').trim().toLowerCase();
  const row = rows.find((r) => language(r) === locale.lang) || rows.find((r) => !language(r));
  if (!row) return '';
  return rootPath(String(row.webPath).trim()
    .replace(/\{cc\}/g, locale.country)
    .replace(/\{ll\}/g, locale.lang), locale);
}

/**
 * The link of a message: its own link, else the tenant's current travel information page for
 * the page's locale (the tenant's row for the page's language, else its row without a language);
 * with #<id> (the message center item of that id opens).
 * @param {Object} msg parseRow shape
 * @param {Object[]} ctiRows rows of /message-center/config/cti-pages.json
 * @param {Object} locale getLocale() result (country, lang)
 * @param {string} [tenant] default: the site's (siteTenant)
 * @returns {string} the href, or '' when there is none
 */
export function messageHref(msg, ctiRows, locale, tenant = siteTenant()) {
  const href = msg.link || ctiPagePath(ctiRows, locale, tenant);
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

/* ------------------------------------------------------------------- notifications -- */
/*
 * Notifications (Lufthansa Cargo's header bell and notification overview, as
 * www.lufthansa-cargo.com shows them): one document per notification and language at
 * /message-center/notification/<id>/<lang> (headline, category, teaser, tenants, details, from,
 * to, internal-title), listed in their own query index /message-center/notifications.json
 * (helix-query.yaml message-center-notifications), so the Message Center index above and its
 * readers stay as they are. The full text is the details page (as a message's).
 */

export const NOTIFICATIONS_PATH = '/message-center/notifications.json';
const NOTIFICATION_ZONE = 'Europe/Berlin';

/** One notifications index row (/message-center/notification/<id>/<lang>), else null. */
export function parseNotification(row) {
  const m = String(row.path || '').match(/^\/message-center\/notification\/([^/]+)\/([a-z]{2})$/);
  if (!m) return null;
  return {
    path: row.path,
    id: m[1],
    lang: m[2],
    headline: String(row.headline || '').trim(),
    category: String(row.category || '').trim(),
    teaser: String(row.teaser || '').trim(),
    tenants: listField(row.tenants),
    details: String(row.details || '').trim(),
    from: time(row.from),
    to: time(row.to),
    lastModified: Number(row.lastModified) || 0,
  };
}

/**
 * The notifications a page shows, newest first: the site's tenant, one per notification (the
 * page's language, else English), inside their from/to window.
 * @param {Object[]} rows rows of /message-center/notifications.json
 * @param {{lang: string, now?: number, tenant?: string}} options
 * @returns {Object[]}
 */
export function selectNotifications(rows, { lang, now = clockNow(), tenant = siteTenant() } = {}) {
  const byId = new Map();
  (rows || []).map(parseNotification).filter(Boolean).forEach((n) => {
    const current = byId.get(n.id);
    if (n.lang === lang) byId.set(n.id, n);
    else if (n.lang === 'en' && (!current || current.lang !== lang)) byId.set(n.id, n);
  });
  return [...byId.values()]
    .filter((n) => n.headline && tenant && n.tenants.includes(tenant)
      && (n.from === null || n.from <= now) && (n.to === null || now < n.to))
    .sort((a, b) => recency(b) - recency(a));
}

/** The categories of notifications, in the order they first appear (the overview's filter). */
export function notificationCategories(list) {
  return [...new Set(list.map((n) => n.category).filter(Boolean))];
}

/**
 * www's date and time of a notification (Berlin time): "16 Sep 26" and "11:07"; German months as
 * www.lufthansa-cargo.com writes them ("16 Sept. 26", "20 Okt. 26").
 * @param {number} ms
 * @param {string} lang
 * @returns {{date: string, time: string}}
 */
export function notificationDate(ms, lang) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat(lang === 'de' ? 'de-DE' : 'en-US', {
    day: '2-digit', month: 'short', year: '2-digit', timeZone: NOTIFICATION_ZONE,
  }).formatToParts(ms).map((p) => [p.type, p.value]));
  const clock = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: NOTIFICATION_ZONE,
  }).format(ms);
  return { date: `${parts.day} ${parts.month} ${parts.year}`, time: clock };
}

/** When a notification is dated: its window's start, else its last modification. */
export const notificationTime = (n) => recency(n);

/** www's shortening (headlines 70, texts 190 characters): the start and " ...". */
export function clip(text, max) {
  return text.length > max ? `${text.slice(0, max)} ...` : text;
}

/** The brand's notifications page in a language (scripts/brands.js notifications), else ''. */
export function notificationsPage(brand, lang) {
  const page = brand && brand.notifications && brand.notifications.page;
  return page ? page.replace(/\{ll\}/g, lang) : '';
}

let notificationsRequest;

/** Starts loading the notifications index (once per page). */
export function loadNotifications() {
  if (!notificationsRequest) notificationsRequest = fetchSheet(NOTIFICATIONS_PATH);
  return notificationsRequest;
}

/**
 * The long text of a message or notification: the content of its details page (no metadata),
 * as nodes; null without one (the message-center and notifications blocks).
 * @param {string} path the details page (/message-center/details/<id>/<lang>)
 * @returns {Promise<Node[]|null>}
 */
export async function loadDetails(path) {
  if (!path || !path.startsWith('/')) return null;
  try {
    const resp = await fetch(`${path.replace(/\.(plain\.)?html$/, '')}.plain.html`, { cache: 'no-cache' });
    if (!resp.ok) return null;
    const doc = document.createElement('div');
    doc.innerHTML = await resp.text();
    doc.querySelectorAll('.metadata, .section-metadata').forEach((m) => m.remove());
    // media of the details page are relative to it (./media_…)
    [['img', 'src'], ['source', 'srcset']].forEach(([tag, attr]) => {
      doc.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((node) => {
        node[attr] = new URL(node.getAttribute(attr), new URL(path, window.location)).href;
      });
    });
    const nodes = [...doc.children].flatMap((section) => [...section.childNodes]);
    return nodes.some((n) => n.textContent.trim() || n.querySelector?.('img')) ? nodes : null;
  } catch (e) {
    return null;
  }
}
