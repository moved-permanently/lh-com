/* eslint-disable no-underscore-dangle, no-console, max-len -- the field names of www's JSON; worker logs */
/**
 * lh-messages: serves the Message Center of lh-com in the JSON shapes of www.lufthansa.com's
 * persisted GraphQL queries (/graphql/execute.json/Message-Center/*), which the apps and other
 * clients read. Source: the query index /message-center/index.json, the details pages and the
 * sheet /message-center/config/cti-pages.json of the site (SOURCE_ORIGIN, the live host),
 * fetched past Cloudflare's cache and kept for at most 30 s in the isolate. A cron trigger (every minute) keeps, in KV, when each message was
 * first seen (activatedAt) and the set of active messages, and sends push notifications for
 * messages with push set when they appear and disappear. See README.md.
 */

const DAM = '/content/dam/lufthansa-group/message-center';
const QUERY_PREFIX = '/graphql/execute.json/Message-Center/';
const TYPES = ['irreg', 'tech-outage', 'promo'];
const SOURCE_TTL_MS = 30000;
const STATE_KEY = 'state';
/** Answered as x-lh-messages, to see which code a deployment runs. */
export const VERSION = '2026-10-25.2 source no-store';
/** Order of the page references in www's CTI response; other tenants follow in sheet order. */
const CTI_TENANT_ORDER = ['ita', 'four_y', 'sn', 'lx', 'os', 'lh'];

/* ------------------------------------------------------------------------------------------- */
/* Source                                                                                      */
/* ------------------------------------------------------------------------------------------- */

/** A list field of the index: an array, an array as JSON string, or a comma list. */
export function listField(value) {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  const text = String(value ?? '').trim();
  if (!text) return [];
  if (text.startsWith('[')) {
    try {
      return listField(JSON.parse(text));
    } catch (e) {
      // a comma list after all
    }
  }
  return text.split(',').map((v) => v.trim()).filter(Boolean);
}

const isoOrNull = (value) => {
  const ms = Date.parse(String(value || '').trim());
  return Number.isFinite(ms) ? ms : null;
};

/** One index row as a message (type, id and language from the path), or null. */
export function parseRow(row) {
  const m = String(row.path || '').match(/^\/message-center\/([a-z-]+)\/([^/]+)\/([a-z]{2})$/);
  if (!m || !TYPES.includes(m[1])) return null;
  return {
    key: row.path,
    path: row.path,
    type: m[1],
    id: m[2],
    language: m[3],
    headline: String(row.headline ?? '').trim(),
    criticality: String(row.criticality || '').trim().toLowerCase() === 'high' ? 'high' : 'low',
    tenants: listField(row.tenants).map((t) => t.toLowerCase()),
    markets: listField(row.markets).map((t) => t.toLowerCase()),
    touchpoints: listField(row.touchpoints).map((t) => t.toLowerCase()),
    link: String(row.link ?? '').trim(),
    details: String(row.details ?? '').trim(),
    from: isoOrNull(row.from),
    to: isoOrNull(row.to),
    push: String(row.push).trim() === 'true',
    internalTitle: String(row['internal-title'] ?? '').trim(),
    lastModified: Number(row.lastModified) || 0,
  };
}

/** Messages inside their from/to window at `now` (from inclusive, to exclusive). */
export function activeMessages(rows, now) {
  return (rows || []).map(parseRow).filter(Boolean)
    .filter((m) => (m.from === null || m.from <= now) && (m.to === null || now < m.to));
}

let sourceCache = new Map();
/** For tests: forget the cached source responses. */
export function resetSourceCache() { sourceCache = new Map(); }

async function fetchSource(env, path, as = 'json') {
  const origin = String(env.SOURCE_ORIGIN || '').replace(/\/$/, '');
  const url = `${origin}${path}`;
  const hit = sourceCache.get(url);
  if (hit && Date.now() - hit.at < SOURCE_TTL_MS) return hit.value;
  // past Cloudflare's cache: aem.live sends max-age=7200 for index.json, so a cached copy would
  // answer from before a withdrawal or republish (and copies differ per colo); only the 30 s
  // cache of this isolate stays
  const resp = await fetch(url, { cache: 'no-store' });
  if (!resp.ok) {
    if (resp.status === 404) return null;
    throw new Error(`${path}: ${resp.status}`);
  }
  const value = as === 'json' ? await resp.json() : await resp.text();
  sourceCache.set(url, { at: Date.now(), value });
  return value;
}

const sheet = (json) => (json && Array.isArray(json.data) ? json.data : []);
export const loadIndex = async (env) => sheet(await fetchSource(env, '/message-center/index.json'));
export const loadCtiPages = async (env) => sheet(await fetchSource(env, '/message-center/config/cti-pages.json'));

/** Plain text of a details page (its .plain.html): paragraphs and list items on lines. */
export function plainText(html) {
  return String(html || '')
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|li|h[1-6]|div|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
}

async function loadDetailsText(env, path) {
  if (!path || !path.startsWith('/')) return '';
  try {
    return plainText(await fetchSource(env, `${path.replace(/\.(plain\.)?html$/, '')}.plain.html`, 'text'));
  } catch (e) {
    return '';
  }
}

/* ------------------------------------------------------------------------------------------- */
/* www shapes                                                                                  */
/* ------------------------------------------------------------------------------------------- */

/** _tags as www writes them: tenants, markets, touchpoints. */
export function tagsOf(msg) {
  return [
    ...msg.tenants.map((t) => `lufthansa-group:tenant/${t}`),
    ...msg.markets.map((m) => `lufthansa-group:markets/${m}`),
    ...msg.touchpoints.map((t) => `lufthansa-group:touchpoint/${t}`),
  ];
}

const iso = (ms) => new Date(ms).toISOString();

/**
 * One item of lhgMessageList, keys in www's order: _path, _tags, language, headline,
 * criticality, link, activatedAt, _metadata.
 * @param {Object} msg parseRow shape
 * @param {Object} state KV state ({ activatedAt: { [key]: iso } })
 */
export function toItem(msg, state = {}) {
  const modified = msg.lastModified ? iso(msg.lastModified * 1000) : null;
  const activatedAt = (state.activatedAt && state.activatedAt[msg.key]) || modified;
  return {
    _path: `${DAM}/${msg.type}/${msg.id}`,
    _tags: tagsOf(msg),
    language: msg.language,
    headline: msg.headline,
    criticality: msg.criticality,
    link: msg.link || null,
    activatedAt,
    _metadata: {
      stringMetadata: [
        { name: 'title', value: msg.internalTitle },
        { name: 'description', value: '' },
      ],
      calendarMetadata: [
        // the index has no creation time: the first time the worker saw the message
        { name: 'jcr:created', value: activatedAt },
        { name: 'cq:lastModified', value: modified },
      ],
    },
  };
}

/** www orders by path, the English variation before the other languages. */
function compareItems(a, b) {
  const p = a.type.localeCompare(b.type) || a.id.localeCompare(b.id);
  if (p) return p;
  if (a.language === b.language) return 0;
  if (a.language === 'en') return -1;
  if (b.language === 'en') return 1;
  return a.language.localeCompare(b.language);
}

const LISTS = {
  lhgIrregMessageList: ['irreg'],
  lhgTechOutageMessageList: ['tech-outage'],
  lhgMessageListWithCalendar: TYPES,
};

/** {"data":{"lhgMessageList":{"items":[...]}}} of the given types. */
export function messageList(rows, types, now, state) {
  const items = activeMessages(rows, now)
    .filter((m) => types.includes(m.type))
    .sort(compareItems)
    .map((m) => toItem(m, state));
  return { data: { lhgMessageList: { items } } };
}

/** outage-b2b: tech-outage messages tagged tenant/b2b, { language, title, description }. */
export async function outageB2b(env, rows, now) {
  const list = activeMessages(rows, now)
    .filter((m) => m.type === 'tech-outage' && m.tenants.includes('b2b'))
    .sort(compareItems);
  const items = await Promise.all(list.map(async (m) => ({
    language: m.language,
    title: m.headline,
    description: { plaintext: await loadDetailsText(env, m.details) },
  })));
  return { data: { lhgMessageList: { items } } };
}

/** CTI pages: one item with a <tenant>PageReference per sheet row with a contentPath. */
export function ctiPages(ctiRows) {
  const rows = (ctiRows || []).filter((r) => String(r.tenant || '').trim() && String(r.contentPath || '').trim());
  const rank = (t) => {
    const i = CTI_TENANT_ORDER.indexOf(t);
    return i < 0 ? CTI_TENANT_ORDER.length : i;
  };
  const sorted = rows.map((r, i) => ({ tenant: String(r.tenant).trim(), path: String(r.contentPath).trim(), i }))
    .sort((a, b) => rank(a.tenant) - rank(b.tenant) || a.i - b.i);
  const item = {
    _path: `${DAM}/config/cti-pages-for-all-tenants`,
    _variation: 'master',
    _metadata: { stringArrayMetadata: [] },
  };
  sorted.forEach((r) => { item[`${r.tenant}PageReference`] = { _path: r.path }; });
  return { data: { linkConfigForMessageCenterList: { items: rows.length ? [item] : [] } } };
}

/* ------------------------------------------------------------------------------------------- */
/* State (cron) and push                                                                       */
/* ------------------------------------------------------------------------------------------- */

/** The fields of a message kept in the state (to send its UNPUBLISH after it is gone). */
const snapshot = (m) => ({
  path: m.path,
  type: m.type,
  id: m.id,
  language: m.language,
  headline: m.headline,
  criticality: m.criticality,
  tenants: m.tenants,
  markets: m.markets,
  touchpoints: m.touchpoints,
  link: m.link,
  details: m.details,
  push: m.push,
});

/**
 * Compares the active messages with the last state.
 * @returns {{ state: Object, changed: boolean, published: Object[], unpublished: Object[] }}
 *   published / unpublished: the messages with push set that appeared / disappeared
 */
export function diffState(previous, rows, now) {
  const prev = previous || { activatedAt: {}, active: {} };
  const active = activeMessages(rows, now);
  const next = { activatedAt: {}, active: {} };
  const published = [];
  const unpublished = [];
  active.forEach((m) => {
    next.activatedAt[m.key] = (prev.activatedAt && prev.activatedAt[m.key]) || iso(now);
    next.active[m.key] = snapshot(m);
    if (!(prev.active && prev.active[m.key]) && m.push) published.push(m);
  });
  Object.entries(prev.active || {}).forEach(([key, m]) => {
    if (!next.active[key] && m.push) unpublished.push(m);
  });
  const changed = JSON.stringify(Object.keys(next.active).sort()) !== JSON.stringify(Object.keys(prev.active || {}).sort())
    || Object.entries(next.active).some(([k, m]) => JSON.stringify(m) !== JSON.stringify((prev.active || {})[k]))
    || Object.keys(next.activatedAt).some((k) => next.activatedAt[k] !== (prev.activatedAt || {})[k]);
  return {
    state: next, changed, published, unpublished,
  };
}

/**
 * The push payload of a message: its fields plus action. The real format of the push service
 * comes later; this is the one place to change.
 * @param {Object} msg parseRow or state snapshot
 * @param {'PUBLISH'|'UNPUBLISH'} action
 */
export function pushPayload(msg, action) {
  return {
    action,
    id: msg.id,
    type: msg.type,
    language: msg.language,
    headline: msg.headline,
    criticality: msg.criticality,
    tenants: msg.tenants,
    markets: msg.markets,
    touchpoints: msg.touchpoints,
    link: msg.link || null,
    details: msg.details || null,
    _path: `${DAM}/${msg.type}/${msg.id}`,
  };
}

/** Sends (or, without PUSH_TARGET, only logs) the push payloads. */
export async function sendPushes(env, payloads) {
  if (!payloads.length) return { sent: 0, logged: 0 };
  if (!env.PUSH_TARGET) {
    payloads.forEach((p) => console.log(`push (no PUSH_TARGET, not sent): ${JSON.stringify(p)}`));
    return { sent: 0, logged: payloads.length };
  }
  let sent = 0;
  await Promise.all(payloads.map(async (p) => {
    try {
      const resp = await fetch(env.PUSH_TARGET, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(p),
      });
      if (resp.ok) sent += 1;
      else console.log(`push ${p.action} ${p.id}/${p.language}: ${resp.status}`);
    } catch (e) {
      console.log(`push ${p.action} ${p.id}/${p.language}: ${e.message}`);
    }
  }));
  return { sent, logged: 0 };
}

async function readState(env) {
  if (!env.STATE) return null;
  return env.STATE.get(STATE_KEY, 'json');
}

/** The cron run: diff, write KV only when something changed, push. */
export async function runCron(env, now = Date.now()) {
  const rows = await loadIndex(env);
  const previous = await readState(env);
  const {
    state, changed, published, unpublished,
  } = diffState(previous, rows, now);
  if (changed && env.STATE) await env.STATE.put(STATE_KEY, JSON.stringify(state));
  const pushes = [
    ...published.map((m) => pushPayload(m, 'PUBLISH')),
    ...unpublished.map((m) => pushPayload(m, 'UNPUBLISH')),
  ];
  const push = await sendPushes(env, pushes);
  return {
    changed, active: Object.keys(state.active).length, pushes: pushes.length, ...push,
  };
}

/* ------------------------------------------------------------------------------------------- */
/* HTTP                                                                                        */
/* ------------------------------------------------------------------------------------------- */

function allowedOrigin(env, origin) {
  if (!origin) return null;
  const extra = String(env.EXTRA_ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (extra.includes(origin)) return origin;
  try {
    if (env.ALLOWED_ORIGIN_PATTERN && new RegExp(env.ALLOWED_ORIGIN_PATTERN).test(origin)) return origin;
  } catch (e) {
    return null;
  }
  return null;
}

function respond(env, request, body, status = 200, extra = {}) {
  const headers = {
    'content-type': 'application/json',
    'cache-control': status === 200 ? 'public, max-age=120' : 'no-store',
    vary: 'Origin',
    'x-lh-messages': VERSION,
    ...extra,
  };
  const origin = allowedOrigin(env, request.headers.get('Origin'));
  if (origin) {
    headers['access-control-allow-origin'] = origin;
    headers['access-control-allow-methods'] = 'GET, HEAD, OPTIONS';
  }
  return new Response(request.method === 'HEAD' ? null : JSON.stringify(body), { status, headers });
}

const QUERIES = ['lhgIrregMessageList', 'lhgTechOutageMessageList', 'lhgMessageListWithCalendar',
  'outage-b2b', 'CTI_Pages_for_APP', 'CTI Pages for tenants'];

/** The query name of a request path (persisted query parameters after ';' are ignored). */
export function queryName(pathname) {
  if (!pathname.startsWith(QUERY_PREFIX)) return null;
  let name = pathname.slice(QUERY_PREFIX.length).split(';')[0];
  try { name = decodeURIComponent(name); } catch (e) { return null; }
  return QUERIES.includes(name) ? name : null;
}

const lastModifiedOf = (rows) => {
  const max = Math.max(0, ...(rows || []).map((r) => Number(r.lastModified) || 0));
  return max ? { 'last-modified': new Date(max * 1000).toUTCString() } : {};
};

export async function handle(request, env, now = Date.now()) {
  const url = new URL(request.url);
  if (request.method === 'OPTIONS') {
    const origin = allowedOrigin(env, request.headers.get('Origin'));
    if (!origin) return new Response(null, { status: 403 });
    return new Response(null, {
      status: 204,
      headers: {
        'access-control-allow-origin': origin,
        'access-control-allow-methods': 'GET, HEAD, OPTIONS',
        'access-control-max-age': '86400',
        vary: 'Origin',
      },
    });
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') return respond(env, request, { error: 'method-not-allowed' }, 405);
  const name = queryName(url.pathname);
  if (!name) {
    // an unknown query: AEM's answer (status, body and cache-control as www)
    const raw = url.pathname.startsWith(QUERY_PREFIX) ? url.pathname.slice(QUERY_PREFIX.length).split(';')[0] : '';
    let query = raw;
    try { query = decodeURIComponent(raw); } catch (e) { /* as sent */ }
    return respond(env, request, {
      errors: [{
        errorType: 'PersistenceError',
        message: 'Could not find Persisted Query',
        details: `Configuration: 'Message-Center' and Query Name: '${query}' does not resolve to an existing Persistent Query`,
      }],
    }, 404, { 'cache-control': 'public, max-age=120' });
  }
  try {
    if (name.startsWith('CTI')) {
      return respond(env, request, ctiPages(await loadCtiPages(env)));
    }
    const rows = await loadIndex(env);
    if (name === 'outage-b2b') return respond(env, request, await outageB2b(env, rows, now), 200, lastModifiedOf(rows));
    const state = (await readState(env)) || {};
    return respond(env, request, messageList(rows, LISTS[name], now, state), 200, lastModifiedOf(rows));
  } catch (e) {
    console.log(`source error: ${e.message}`);
    return respond(env, request, { error: 'source-unavailable' }, 502);
  }
}

export default {
  fetch: (request, env) => handle(request, env),
  scheduled: (event, env, ctx) => {
    ctx.waitUntil(runCron(env, event.scheduledTime || Date.now())
      .then((r) => console.log(`cron: ${JSON.stringify(r)}`))
      .catch((e) => console.log(`cron error: ${e.message}`)));
  },
};
