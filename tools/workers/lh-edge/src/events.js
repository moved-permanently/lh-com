/* eslint-disable max-len, no-console -- one-line maps and the relay log */
/**
 * Publish events (package 6): lh-com's own publishing as the JSON messages www's authoring
 * system posts per page or fragment it publishes or withdraws,
 * {contentType: PAGE|EXP_FRAGMENT|CONTENT_FRAGMENT, contentPath, contentChangeType:
 * CREATE_MODIFY|DELETE, env}. Source: the site's audit log (GET EVENTS_LOG with
 * `authorization: token <AUDIT_LOG_KEY>`), read
 * - by the poller: lh-messages' every-minute cron calls the RPC entrypoint EventsRelay.poll()
 *   (src/index.js; not reachable from the internet), from the stored position;
 * - by the webhook: POST /_lh/events/webhook from the site config ({org, site, nextToken},
 *   `authorization: token <WEBHOOK_TOKEN>`), for the range of its nextToken.
 * Kept: per-resource live entries, publish (POST 200) and unpublish (DELETE 204), whose path
 * maps to an AEM path (mapEntry, MAPPING_VERSION). Deduplicated: an entry already stored, and
 * the same path and change within DEDUPE_MS. State: one KV key (EVENTS binding) with the
 * position and the last MAX_EVENTS events, written only when events were added, the position
 * moved to another page, or it is older than POSITION_REFRESH_MS (Workers Free: about 1,000 KV
 * writes a day for the account). Output: GET /_lh/events.json (newest first, no-store), and a
 * POST per event to the secret EVENTS_SINK_URL (5 tries, exponential back-off); without a sink
 * the event is logged.
 */

export const MAPPING_VERSION = 1;
export const EVENTS_PATH = '/_lh/events.json';
export const WEBHOOK_PATH = '/_lh/events/webhook';
export const MAX_EVENTS = 500;
export const DEDUPE_MS = 120000;
export const OVERLAP_MS = 60000;
export const POSITION_REFRESH_MS = 6 * 3600 * 1000;
export const LOG_LIMIT = 200;
export const SINK_TRIES = 5;
const STATE_KEY = 'state';
const MESSAGE_CENTER_DAM = '/content/dam/lufthansa-group/message-center';
const LOCALE = /^\/([a-z]{2})\/([a-z]{2})(\/.*)?$/;
const SKIP = /^\/(lhg|drafts|library|media-da|demo|\.helix|\.snapshots)(\/|$)/;

/** Whether an audit log entry is one resource published (live POST 200) or unpublished (live DELETE 204). */
export function isPublishEntry(entry) {
  if (!entry || entry.route !== 'live' || entry.job || Array.isArray(entry.paths)) return false;
  if (typeof entry.path !== 'string' || !entry.path.startsWith('/') || entry.path.includes('*')) return false;
  return (entry.method === 'POST' && entry.status === 200) || (entry.method === 'DELETE' && entry.status === 204);
}

/**
 * Mapping version 1: an Edge Delivery path to {contentType, contentPath}, or null.
 * - /<cc>/<ll>/... pages: PAGE /content/lh/markets/<cc>/<ll>/...; pages that already live under
 *   /content/lh/markets/... (LoungeNet) or /content/mobile/... (app pages) keep their path;
 * - /<cc>/<ll>/nav, /footer and /fragments/<name>: EXP_FRAGMENT
 *   /content/experience-fragments/lh/markets/<cc>/<ll>/<name>;
 * - /data/... (structured documents) and /data/details/... (their long texts): CONTENT_FRAGMENT
 *   /content/dam/... (the rule of the GraphQL import and lh-edge's graphql route);
 * - /message-center/<type>/<id>/<ll>: CONTENT_FRAGMENT
 *   /content/dam/lufthansa-group/message-center/<type>/<id> (lh-messages' _path; every language
 *   is a variation of one fragment), the CTI sheet: .../config/cti-pages-for-all-tenants.
 * Not mapped: sheets (.json), media and other files (an extension), root documents, /lhg/,
 * drafts, the library and anything else.
 */
export function mapPath(path) {
  const p = String(path || '').replace(/\/+$/, '');
  if (!p || SKIP.test(p)) return null;
  if (p === '/message-center/config/cti-pages.json') {
    return { contentType: 'CONTENT_FRAGMENT', contentPath: `${MESSAGE_CENTER_DAM}/config/cti-pages-for-all-tenants` };
  }
  if (/\.[a-z0-9]+$/i.test(p.split('/').pop())) return null;
  if (/^\/content\/(lh\/markets|mobile)\//.test(p)) return { contentType: 'PAGE', contentPath: p };
  const m = p.match(LOCALE);
  if (m) {
    const [, cc, ll, rest = ''] = m;
    const fragment = rest === '/nav' || rest === '/footer' ? rest.slice(1) : (rest.match(/^\/fragments\/(.+)$/) || [])[1];
    if (fragment) return { contentType: 'EXP_FRAGMENT', contentPath: `/content/experience-fragments/lh/markets/${cc}/${ll}/${fragment}` };
    return { contentType: 'PAGE', contentPath: `/content/lh/markets/${cc}/${ll}${rest}` };
  }
  const data = p.match(/^\/data(?:\/details)?(\/.+)$/);
  if (data) return { contentType: 'CONTENT_FRAGMENT', contentPath: `/content/dam${data[1]}` };
  const message = p.match(/^\/message-center\/([a-z-]+)\/([^/]+)\/[a-z]{2}$/);
  if (message) return { contentType: 'CONTENT_FRAGMENT', contentPath: `${MESSAGE_CENTER_DAM}/${message[1]}/${message[2]}` };
  if (/^\/message-center\/.+/.test(p)) return { contentType: 'CONTENT_FRAGMENT', contentPath: `${MESSAGE_CENTER_DAM}${p.slice('/message-center'.length)}` };
  return null;
}

/** An audit log entry as an event, or null. */
export function mapEntry(entry) {
  if (!isPublishEntry(entry)) return null;
  const mapped = mapPath(entry.path);
  if (!mapped) return null;
  return {
    ...mapped,
    contentChangeType: entry.method === 'DELETE' ? 'DELETE' : 'CREATE_MODIFY',
    env: 'prod',
    timestamp: entry.timestamp,
    path: entry.path,
    key: `${entry.timestamp}|${entry.method}|${entry.path}`,
    mappingVersion: MAPPING_VERSION,
  };
}

/** The message www posts: the four AEM fields. */
export const aemMessage = (e) => ({
  contentType: e.contentType, contentPath: e.contentPath, contentChangeType: e.contentChangeType, env: e.env,
});

/**
 * Adds the events of `entries` to `stored` (newest first): skips entries already stored and the
 * same path and change within DEDUPE_MS of a kept event. Returns {events, added} (added oldest first).
 */
export function mergeEvents(stored, entries) {
  const events = [...(stored || [])];
  const keys = new Set(events.map((e) => e.key));
  const added = [];
  (entries || []).map(mapEntry).filter(Boolean).sort((a, b) => a.timestamp - b.timestamp).forEach((e) => {
    if (keys.has(e.key)) return;
    const twin = [...added, ...events].find((x) => x.path === e.path && x.contentChangeType === e.contentChangeType
      && Math.abs(x.timestamp - e.timestamp) < DEDUPE_MS);
    if (twin) return;
    keys.add(e.key);
    added.push(e);
  });
  const all = [...added].reverse().concat(events).sort((a, b) => b.timestamp - a.timestamp);
  return { events: all.slice(0, MAX_EVENTS), added };
}

/** Constant-time comparison of two strings (no early exit on the first difference). */
export function safeEqual(a, b) {
  const x = new TextEncoder().encode(String(a));
  const y = new TextEncoder().encode(String(b));
  /* eslint-disable no-bitwise -- the comparison is a XOR over every byte */
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i += 1) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  /* eslint-enable no-bitwise */
  return diff === 0;
}

const readState = async (env) => (env.EVENTS ? (await env.EVENTS.get(STATE_KEY, 'json')) : null) || { position: null, events: [] };

/** One page of the audit log: the query of the stored position, or the webhook's nextToken. */
async function readLog(env, query) {
  const url = new URL(env.EVENTS_LOG);
  Object.entries({ ...query, limit: String(LOG_LIMIT) }).forEach(([k, v]) => { if (v) url.searchParams.set(k, v); });
  const resp = await fetch(url, { headers: { authorization: `token ${env.AUDIT_LOG_KEY}` } });
  if (!resp.ok) throw new Error(`audit log ${resp.status}`);
  const {
    from, to, entries, nextToken,
  } = await resp.json();
  return {
    from, to, nextToken, entries: entries || [],
  };
}

/** POSTs one event to the sink, up to SINK_TRIES times with exponential back-off; logs without a sink. */
export async function deliver(env, event, wait = (ms) => new Promise((r) => { setTimeout(r, ms); })) {
  const body = JSON.stringify(aemMessage(event));
  if (!env.EVENTS_SINK_URL) {
    console.log(`event (no sink): ${body}`);
    return 'logged';
  }
  for (let attempt = 1; attempt <= SINK_TRIES; attempt += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop -- retries are sequential
      const resp = await fetch(env.EVENTS_SINK_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body });
      if (resp.ok) return 'sent';
      if (resp.status < 500 && resp.status !== 429) { console.log(`event sink ${resp.status}, not retried: ${body}`); return 'failed'; }
    } catch (e) { /* network error: retried */ }
    // eslint-disable-next-line no-await-in-loop -- back-off between tries: 1, 2, 4, 8 s
    if (attempt < SINK_TRIES) await wait(1000 * 2 ** (attempt - 1));
  }
  console.log(`event sink failed after ${SINK_TRIES} tries: ${body}`);
  return 'failed';
}

/**
 * One relay run. source 'poll': from the stored position (nextToken page of the stored window,
 * else from the last `to` minus OVERLAP_MS; the first run: the last OVERLAP_MS); source
 * 'webhook': the range of `nextToken`. Writes the state only when needed; returns a summary.
 */
export async function relay(env, ctx, { source = 'poll', nextToken = null, now = Date.now() } = {}) {
  if (!env.AUDIT_LOG_KEY || !env.EVENTS_LOG) return { ok: false, error: 'not configured' };
  const state = await readState(env);
  const pos = state.position || {};
  let query;
  if (source === 'webhook') query = { nextToken };
  else if (pos.next) query = pos.next;
  else query = { from: new Date((pos.to ? Date.parse(pos.to) : now) - OVERLAP_MS).toISOString(), to: new Date(now).toISOString() };
  const page = await readLog(env, query);
  const { events, added } = mergeEvents(state.events, page.entries);
  let position = pos;
  if (source === 'poll') {
    position = page.nextToken
      ? { next: { from: page.from, to: page.to, nextToken: page.nextToken }, to: pos.to || page.from }
      : { next: null, to: page.to };
  }
  const moved = source === 'poll' && (Boolean(page.nextToken) || Boolean(pos.next) !== Boolean(position.next));
  const stale = source === 'poll' && (!pos.savedAt || now - pos.savedAt > POSITION_REFRESH_MS);
  const write = added.length > 0 || moved || stale;
  if (write && env.EVENTS) {
    await env.EVENTS.put(STATE_KEY, JSON.stringify({ position: { ...position, savedAt: now }, events, mappingVersion: MAPPING_VERSION }));
  }
  if (added.length) {
    const sending = Promise.all(added.map((e) => deliver(env, e)));
    if (ctx && ctx.waitUntil) ctx.waitUntil(sending); else await sending;
  }
  return {
    ok: true, source, entries: page.entries.length, added: added.length, more: Boolean(page.nextToken), wrote: write,
  };
}

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-lh-edge-route': 'events' },
});

/** GET /_lh/events.json: the stored events, newest first. */
export async function eventsList(request, env) {
  const state = await readState(env);
  return json({
    mappingVersion: MAPPING_VERSION,
    position: state.position ? { to: state.position.to || null, paging: Boolean(state.position.next), savedAt: state.position.savedAt || null } : null,
    total: state.events.length,
    events: state.events.map((e) => ({ ...aemMessage(e), timestamp: new Date(e.timestamp).toISOString(), path: e.path })),
  });
}

/** POST /_lh/events/webhook: the site config's webhook, token checked in constant time. */
export async function eventsWebhook(request, env, ctx) {
  if (!env.WEBHOOK_TOKEN) return json({ error: 'webhook not configured' }, 503);
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('token ') ? header.slice(6) : '';
  if (!safeEqual(token, env.WEBHOOK_TOKEN)) return json({ error: 'unauthorized' }, 401);
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: 'invalid body' }, 400); }
  const [org, site] = String(env.EVENTS_SITE || '').split('/');
  if (!body || body.org !== org || body.site !== site || typeof body.nextToken !== 'string' || !body.nextToken) {
    return json({ error: 'unexpected org, site or nextToken' }, 400);
  }
  try {
    return json(await relay(env, ctx, { source: 'webhook', nextToken: body.nextToken }));
  } catch (e) {
    console.log(`events webhook: ${e.message}`);
    return json({ ok: false, error: 'audit log unavailable' }, 502);
  }
}
