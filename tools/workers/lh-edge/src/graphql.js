/**
 * www's GraphQL persisted queries, GET /graphql/execute.json/<config>/<query>[;name=value...]
 * (also under www's other address /api/content/graphql/execute.json/..., the same answers),
 * answered from lh-com's structured content (DA documents under /data/, one query index per
 * model, helix-query.yaml "feed-*"). The Message Center (config Message-Center) is the messages
 * Worker's (route message-center). Envelope, field names and errors as www (see README "GraphQL
 * feeds"); the recorded www answers are tools/source-export/feeds/graphql/.
 */
import { originFetch } from './edge.js';
import readDaForm from './daform.js';
import FIXED from './graphql-fixed.js';

export const GRAPHQL_PREFIX = '/graphql/execute.json/';
/** www's second address of the same queries (the trip management app asks for its labels there). */
export const GRAPHQL_ALIAS = '/api/content/graphql/execute.json/';

/** The /graphql/execute.json/ form of a path (the alias rewritten); any other path unchanged. */
export const graphqlPath = (pathname) => (pathname.startsWith(GRAPHQL_ALIAS)
  ? `${GRAPHQL_PREFIX}${pathname.slice(GRAPHQL_ALIAS.length)}` : pathname);

/** The query indexes (and the TMC strings sheet), by model. */
export const FEEDS = {
  whatsnew: '/data/lufthansa-group/mobileapp/whats-new/query-index.json',
  benefit: '/data/lufthansa-group/ancillary/upgrade/benefitcard/benefititems/query-index.json',
  allegris: '/data/lufthansa-group/ancillary/allegris-upgrade/aircraft/query-index.json',
  travel: '/data/content-fragments/travelready-infohub/query-index.json',
  ancillary: '/data/lufthansa-group/ancillary/tmc/catalog/query-index.json',
  sdui: '/data/content-fragments/orchestrator-services/sdui-services/query-index.json',
  b2bflags: '/data/hcl/content-fragments/query-index.json',
  details: '/data/details/query-index.json',
  tmc: '/data/lufthansa-group/ancillary/tmc/tmc-web-translations/tmc-translations.json',
};

/** Field types of the models (documents hold text). */
const TYPES = {
  'early-access': 'boolean',
  'start-popup': 'boolean',
  'display-badge': 'boolean',
  enabled: 'boolean',
  'service-is-cacheable': 'boolean',
  'caching-time': 'integer',
  order: 'integer',
};

/**
 * The path and variables of a request: config, query (decoded) and ;name=value pairs (values
 * URL-decoded: "/" and "%2F" in a path value are the same).
 */
export function parseQueryPath(pathname) {
  const canonical = graphqlPath(pathname);
  if (!canonical.startsWith(GRAPHQL_PREFIX)) return null;
  const rest = canonical.slice(GRAPHQL_PREFIX.length);
  const slash = rest.indexOf('/');
  if (slash < 0) return null;
  const decode = (s) => {
    try { return decodeURIComponent(s); } catch (e) { return s; }
  };
  const config = decode(rest.slice(0, slash));
  const after = rest.slice(slash + 1);
  const semi = after.indexOf(';');
  const query = decode(semi < 0 ? after : after.slice(0, semi));
  const vars = {};
  (semi < 0 ? '' : after.slice(semi + 1)).split(';').filter(Boolean).forEach((kv) => {
    const eq = kv.indexOf('=');
    if (eq < 0) vars[decode(kv)] = '';
    else vars[decode(kv.slice(0, eq))] = decode(kv.slice(eq + 1));
  });
  return { config, query, vars };
}

/* ------------------------------------------------------------------------- the sources */

const CACHE_MS = 30000;
let cache = new Map();
/** For tests: forget the cached indexes. */
export function resetFeedCache() { cache = new Map(); }

async function loadSheet(request, env, feedPath) {
  const hit = cache.get(feedPath);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.rows;
  const rows = [];
  try {
    for (let offset = 0; offset < 20000; offset += 1000) {
      const target = new URL(`${feedPath}?offset=${offset}&limit=1000`, `https://${env.ORIGIN}`);
      // eslint-disable-next-line no-await-in-loop
      const get = new Request(request.url, { headers: request.headers });
      // eslint-disable-next-line no-await-in-loop
      const resp = await originFetch(get, env, target, { edgeCache: false });
      if (!resp.ok) break;
      // eslint-disable-next-line no-await-in-loop
      const json = await resp.json();
      const data = Array.isArray(json.data) ? json.data : [];
      rows.push(...data);
      if (data.length < 1000 || rows.length >= (json.total || 0)) break;
    }
  } catch (e) {
    // no answer: an empty feed
  }
  cache.set(feedPath, { at: Date.now(), rows });
  return rows;
}

/** The documents of a model: { path, lastModified (ms), data } from the index's html. */
async function loadDocs(request, env, feed) {
  const rows = await loadSheet(request, env, FEEDS[feed]);
  return rows.filter((r) => r.path && r.html).map((r) => {
    const { metadata, data } = readDaForm(r.html, TYPES);
    return {
      path: r.path,
      lastModified: Number(r.lastModified) * 1000 || 0,
      schema: metadata.schemaName,
      data,
    };
  });
}

/** The rich texts of the companion documents, by path. */
async function loadDetails(request, env) {
  const rows = await loadSheet(request, env, FEEDS.details);
  return new Map(rows.filter((r) => r.path).map((r) => [r.path, {
    html: r.html || '', lastModified: Number(r.lastModified) * 1000 || 0,
  }]));
}

/* ------------------------------------------------------------------------- helpers */

const damPathOf = (doc) => doc.data['dam-path'] || doc.path.replace(/^\/data\//, '/content/dam/');
const or = (v) => (v === undefined || v === '' ? null : v);
const ref = (p) => (p ? { _path: p } : null);
const byOrder = (a, b) => (a.data.order ?? 1e9) - (b.data.order ?? 1e9)
  || a.path.localeCompare(b.path);
const newest = (docs) => docs.reduce((m, d) => Math.max(m, d.lastModified || 0), 0);
/** A rich text field: { html } from the companion document. */
const rich = (details, p, used) => {
  const d = p ? details.get(p) : null;
  if (d) used.push(d.lastModified);
  return { html: d ? d.html : null };
};

const items = (root, list) => ({ data: { [root]: { items: list } } });
const item = (root, one) => ({ data: { [root]: { item: one } } });

/** The DAM language folder of a What's new item (zh_tw is the folder zh-tw). */
const folderOf = (damPath) => (damPath.split('/')[6] || '').toLowerCase().replace(/_/g, '-');
const sameLocale = (doc, locale) => !locale
  || folderOf(damPathOf(doc)) === locale.toLowerCase().replace(/_/g, '-');
const tagsOf = (doc) => {
  const d = doc.data;
  return [...(d.tenants || []), ...(d.platforms || []),
    ...(d['early-access'] ? ['early-access'] : []), ...(d['start-popup'] ? ['start-popup'] : [])]
    .map((t) => `mobile-app:${t}`);
};
const hasTag = (doc, tag) => !tag || tagsOf(doc).includes(tag);

/** What's new item, list fields (whatsnewList). */
function whatsnewA(doc, details, used) {
  const d = doc.data;
  return {
    __typename: 'WhatsnewModel',
    _path: damPathOf(doc),
    releaseVersion: or(d['release-version']),
    date: or(d.date),
    headline: or(d.headline),
    shortText: { plaintext: or(d['short-text']) },
    longText: rich(details, d['long-text'], used),
    image: ref(d.image),
    _tags: tagsOf(doc),
    featureFlagName: or(d['feature-flag']),
  };
}

/** What's new item, pop-up and early-access fields. */
function whatsnewB(doc, details, used) {
  const d = doc.data;
  return {
    __typename: 'WhatsnewModel',
    _path: damPathOf(doc),
    releaseVersion: or(d['release-version']),
    date: or(d.date),
    activationDate: or(d['activation-date']),
    headline: or(d.headline),
    shortText: { plaintext: or(d['short-text']) },
    longText: rich(details, d['long-text'], used),
    ImageLH: ref(d['image-lh']),
    imageLX: ref(d['image-lx']),
    imageSN: ref(d['image-sn']),
    imageOS: ref(d['image-os']),
    imageAZ: ref(d['image-az']),
    _tags: tagsOf(doc),
    featureFlagName: or(d['feature-flag']),
  };
}

const time = (s) => {
  const t = Date.parse(s || '');
  return Number.isNaN(t) ? -Infinity : t;
};
const byDate = (a, b) => String(b.data.date || '').localeCompare(String(a.data.date || '')) || byOrder(a, b);
const byActivation = (a, b) => time(b.data['activation-date']) - time(a.data['activation-date']) || byOrder(a, b);

/** {"errors":[...]} of a query asked for a fragment that does not exist. */
const notAFragment = (field, p) => ({
  errors: [{
    message: `Exception while fetching data (/${field}) : Path: '${p}' did not yield a Content Fragment`,
    locations: [{ line: 2, column: 3 }],
    path: [field],
    extensions: { classification: 'DataFetchingException' },
  }],
  data: null,
});

/** b2b rich text from plain paragraphs: html, markdown, plaintext and json as AEM sends them. */
function richFromText(text) {
  if (text === null || text === undefined || text === '') {
    return {
      html: null, markdown: null, plaintext: null, json: null,
    };
  }
  const paras = String(text).split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return {
    html: paras.map((p) => `<p>${esc(p)}</p>\n`).join(''),
    markdown: paras.map((p) => `${p}\n`).join('\n'),
    plaintext: paras.join('\n'),
    json: paras.map((p) => ({ nodeType: 'paragraph', content: [{ nodeType: 'text', value: p }] })),
  };
}

function travelItem(doc, details, used) {
  const d = doc.data;
  const modified = d.modified || new Date(doc.lastModified || 0).toISOString();
  return {
    _variation: or(d.variation),
    _metadata: {
      calendarMetadata: [
        { name: 'jcr:created', value: d.created || modified },
        { name: 'cq:lastModified', value: modified },
      ],
    },
    destination: rich(details, d.destination, used),
    transit: rich(details, d.transit, used),
  };
}

async function whatsnewList(v, ctx, { view, noEarlyAccess = false }) {
  const [docs, details] = await Promise.all([ctx.docs('whatsnew'), ctx.details()]);
  // www filters these lists by the client (platform) tag only; the tenant is not applied
  let picked = docs
    .filter((d) => sameLocale(d, v.locale))
    .filter((d) => hasTag(d, v.client))
    .filter((d) => !noEarlyAccess || !d.data['early-access'])
    .sort(byDate);
  const limit = Number.parseInt(v.limit, 10);
  if (Number.isFinite(limit) && limit >= 0) picked = picked.slice(0, limit);
  const used = [];
  return { body: items('whatsnewList', picked.map((d) => view(d, details, used))), lastModified: Math.max(newest(picked), ...used, 0) };
}

async function startPopups(v, ctx, { noEarlyAccess = false }) {
  const [docs, details] = await Promise.all([ctx.docs('whatsnew'), ctx.details()]);
  const to = v.to ? time(v.to) : Infinity;
  const picked = docs
    .filter((d) => d.data['start-popup'])
    .filter((d) => sameLocale(d, v.locale))
    .filter((d) => hasTag(d, v.client) && hasTag(d, v.tenant))
    .filter((d) => !noEarlyAccess || !d.data['early-access'])
    .filter((d) => time(d.data['activation-date']) <= to)
    .sort(byActivation);
  const used = [];
  return { body: items('whatsnewList', picked.map((d) => whatsnewB(d, details, used))), lastModified: Math.max(newest(picked), ...used, 0) };
}

/* ------------------------------------------------------------------------- the queries */

/**
 * The queries: (vars, ctx) -> { body, lastModified } | { fixed } (an answer of FIXED).
 * ctx: { docs(feed), details(), sheet(feed) }.
 */
const QUERIES = {
  'mobileapp/whatsnewList': async (v, ctx) => whatsnewList(v, ctx, { view: whatsnewA }),
  'mobileapp/whatsNewListEarlyAccess': async (v, ctx) => whatsnewList(v, ctx, { view: whatsnewB }),
  'mobileapp/whatsNewListNonEarlyAccess': async (v, ctx) => whatsnewList(v, ctx, { view: whatsnewB, noEarlyAccess: true }),
  'mobileapp/getStartPopupEarlyAccess': async (v, ctx) => startPopups(v, ctx, {}),
  'mobileapp/getStartPopupNonEarlyAccess': async (v, ctx) => startPopups(v, ctx, { noEarlyAccess: true }),
  'mobileapp/getItemByID': async (v, ctx) => {
    if (!v.id) return { fixed: 'mobileapp/getItemByID' };
    const [docs, details] = await Promise.all([ctx.docs('whatsnew'), ctx.details()]);
    const doc = docs.find((d) => damPathOf(d) === v.id);
    if (!doc) return { body: notAFragment('whatsnewByPath', v.id) };
    const used = [];
    return { body: item('whatsnewByPath', whatsnewB(doc, details, used)), lastModified: Math.max(doc.lastModified, ...used) };
  },
  'BenefitCard/BenefitItemsList': async (v, ctx) => {
    if (!v.langPath) return { fixed: 'BenefitCard/BenefitItemsList' };
    const folder = `${v.langPath.replace(/\/+$/, '')}/`;
    const docs = (await ctx.docs('benefit'))
      .filter((d) => d.path.replace(/^\/data\//, '/content/dam/').startsWith(folder))
      .filter((d) => !v.airline || d.data.airline === v.airline)
      .sort(byOrder);
    return {
      body: items('benefititemList', docs.map(({ data: d }) => ({
        id: or(d.id), icon: or(d.icon), airline: or(d.airline), flightType: or(d['flight-type']), label: or(d.label), upgradeClass: d['upgrade-class'] || [],
      }))),
      lastModified: newest(docs),
    };
  },
  'BenefitCard/benefitcardimageList': async () => ({ fixed: 'BenefitCard/benefitcardimageList' }),
  'AllegrisUpgrade/AllegrisAircraftsList': async (v, ctx) => {
    if (!v.airline) return { fixed: 'AllegrisUpgrade/AllegrisAircraftsList' };
    const docs = (await ctx.docs('allegris'))
      .filter((d) => String(d.data.airline || '').toLowerCase() === v.airline.toLowerCase())
      .sort(byOrder);
    return {
      body: items('allegrisaircraftList', docs.map(({ data: d }) => ({ airline: or(d.airline), acv: or(d.acv), displaybadge: d['display-badge'] ?? null }))),
      lastModified: newest(docs),
    };
  },
  'Travel-Regulations/TravelRegulationsByPath': async (v, ctx) => {
    const [docs, details] = await Promise.all([ctx.docs('travel'), ctx.details()]);
    const country = v.path ? v.path.replace(/\/+$/, '').split('/').pop() : '';
    const withVariations = v.includedVariations === 'true';
    const picked = docs
      .filter((d) => !country || d.data.country === country)
      .filter((d) => (withVariations && country) || d.data.variation === 'master')
      .sort((a, b) => (country ? byOrder(a, b) : a.path.localeCompare(b.path)));
    const used = [];
    return {
      body: items('travelRegulationsList', picked.map((d) => travelItem(d, details, used))),
      lastModified: Math.max(newest(picked), ...used, 0),
    };
  },
  'Travel-Regulations/TravelRegulationByPathAndVariation': async (v, ctx) => {
    if (!v.path) return { fixed: 'Travel-Regulations/TravelRegulationByPathAndVariation' };
    const [docs, details] = await Promise.all([ctx.docs('travel'), ctx.details()]);
    const country = v.path.replace(/\/+$/, '').split('/').pop();
    const variation = v.variation || 'master';
    const doc = docs.find((d) => d.data.country === country && d.data.variation === variation);
    if (!doc) return { body: notAFragment('travelRegulationsByPath', v.path) };
    const used = [];
    return { body: item('travelRegulationsByPath', travelItem(doc, details, used)), lastModified: Math.max(doc.lastModified, ...used) };
  },
  'Travel-Regulations/TravelRegulationList': async () => ({ fixed: 'Travel-Regulations/TravelRegulationList' }),
  'Ancillary-on-TMC/get-ancillaries-catalogs': async (v, ctx) => {
    const docs = (await ctx.docs('ancillary')).sort(byOrder);
    const list = docs.flatMap(({ data: d }) => (d.variations || []).filter((x) => x && typeof x === 'object').map((x) => ({
      name: or(d.name),
      enabled: x.enabled ?? null,
      redirectBaseUrl: or(x['redirect-base-url']),
      imageUrl: or(x['image-url']),
      localization: (x.localization || []).filter((l) => l && typeof l === 'object').map((l) => ({
        locale: or(l.locale), title: or(l.title), description: or(l.description), textLink: or(l['text-link']),
      })),
      properties: Array.isArray(x.properties) && x.properties.length
        ? x.properties.filter((p) => p && typeof p === 'object').map((p) => ({ name: or(p.name), type: or(p.type) || 'STRING', value: p.value ?? '' }))
        : null,
      _variation: or(x.variation),
    })));
    return { body: items('ancillaryCatalogList', list), lastModified: newest(docs) };
  },
  'Ancillary-on-TMC/tmc-translations': async (v, ctx) => {
    const p = (v.path || '').replace(/\/+$/, '');
    const rows = await ctx.sheet('tmc');
    if (p !== '/content/dam/lufthansa-group/ancillary/tmc/tmc-web-translations/tmc-translations' || !rows.length) {
      return { body: notAFragment('tmcTranslationsByPath', p || null) };
    }
    const locales = Object.keys(rows[0]).filter((k) => k !== 'key');
    const translations = Object.fromEntries(locales.map((l) => [l, Object.fromEntries(rows
      .filter((r) => r.key && r[l] !== undefined && r[l] !== '').map((r) => [r.key, r[l]]))]));
    return {
      body: item('tmcTranslationsByPath', { _path: p, _variation: v.variation || 'master', translations }),
      lastModified: ctx.sheetModified('tmc'),
    };
  },
  'Orchestrator-Services/SDUI-Service-List': async (v, ctx) => {
    const docs = (await ctx.docs('sdui')).sort(byOrder);
    return {
      body: items('sduiServiceList', docs.map((doc) => {
        const d = doc.data;
        return {
          description: { plaintext: or(d.description) },
          _path: damPathOf(doc),
          serviceType: or(d['service-type']),
          framework: or(d.framework),
          url: or(d.url),
          providerClassName: or(d['provider-class-name']),
          serviceIsCacheable: d['service-is-cacheable'] ?? null,
          cachingTime: d['caching-time'] ?? null,
        };
      })),
      lastModified: newest(docs),
    };
  },
  'B2BNeo/getFeatureFlag': async (v, ctx) => {
    const docs = (await ctx.docs('b2bflags')).sort(byOrder);
    return {
      body: items('featureFlagList', docs.map((doc) => {
        const d = doc.data;
        const multi = (x) => (Array.isArray(x) && x.length ? x : ['']);
        return {
          _path: damPathOf(doc),
          flagKey: or(d['flag-key']),
          enabled: d.enabled ?? null,
          name: or(d.name),
          description: richFromText(d.description),
          scope: or(d.scope),
          markets: multi(d.markets),
          userSegments: multi(d['user-segments']),
          startDate: or(d['start-date']),
          endDate: or(d['end-date']),
        };
      })),
      lastModified: newest(docs),
    };
  },
  'B2BNeo/getFreeFlightConfig': async () => ({ fixed: 'B2BNeo/getFreeFlightConfig' }),
  'B2BNeo/getAllFooterLogos': async () => ({ fixed: 'B2BNeo/getAllFooterLogos' }),
  'B2BNeo/getLoginConfig': async () => ({ fixed: 'B2BNeo/getLoginConfig' }),
  'B2BNeo/getLoginConfigByPath': async (v) => (v.path
    ? { body: notAFragment('loginConfigByPath', v.path) }
    : { fixed: 'B2BNeo/getLoginConfigByPath' }),
};

/* ------------------------------------------------------------------------- the route */

const UNKNOWN = (config, query) => ({
  errors: [{
    errorType: 'PersistenceError',
    message: 'Could not find Persisted Query',
    details: `Configuration: '${config}' and Query Name: '${query}' does not resolve to an existing Persistent Query`,
  }],
});

/**
 * CORS: an Origin that matches CORS_ORIGINS (comma list of host patterns: "lufthansa.com" is the
 * host and its subdomains, "*--lh-com--moved-permanently.aem.page" a wildcard, "localhost" any
 * port; https only, except localhost) gets Access-Control-Allow-Origin.
 */
export function allowedOrigin(origin, patterns = '') {
  let url;
  try { url = new URL(origin); } catch (e) { return false; }
  const host = url.hostname.toLowerCase();
  const list = String(patterns).split(',').map((p) => p.trim().toLowerCase()).filter(Boolean);
  return list.some((p) => {
    if (p === 'localhost') return host === 'localhost' || host === '127.0.0.1';
    if (url.protocol !== 'https:') return false;
    if (p.includes('*')) {
      const re = p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[a-z0-9-]+');
      return new RegExp(`^${re}$`).test(host);
    }
    return host === p || host.endsWith(`.${p}`);
  });
}

export const isGraphqlPath = (pathname) => graphqlPath(pathname).startsWith(GRAPHQL_PREFIX);

export async function graphql(request, env) {
  const url = new URL(request.url);
  const origin = request.headers.get('origin');
  const cors = origin && allowedOrigin(origin, env.CORS_ORIGINS)
    ? { 'access-control-allow-origin': origin, vary: 'Origin' } : { vary: 'Origin' };
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...cors, 'access-control-allow-methods': 'GET, HEAD, OPTIONS', 'access-control-allow-headers': '*', 'access-control-max-age': '86400',
      },
    });
  }
  const answer = (status, body, { cacheControl = 'public, max-age=120', lastModified = 0 } = {}) => {
    const headers = {
      'content-type': 'application/json', 'x-lh-edge-route': 'graphql', ...cors,
    };
    if (cacheControl) headers['cache-control'] = cacheControl;
    if (lastModified > 0) headers['last-modified'] = new Date(lastModified).toUTCString();
    const text = typeof body === 'string' ? body : JSON.stringify(body);
    return new Response(request.method === 'HEAD' ? null : text, { status, headers });
  };
  const parsed = parseQueryPath(url.pathname);
  if (!parsed) return answer(404, UNKNOWN('', ''));
  const handler = QUERIES[`${parsed.config}/${parsed.query}`];
  if (!handler) return answer(404, UNKNOWN(parsed.config, parsed.query));

  const docsCache = {};
  const sheetMeta = {};
  const ctx = {
    docs: (feed) => {
      if (!docsCache[feed]) docsCache[feed] = loadDocs(request, env, feed);
      return docsCache[feed];
    },
    details: () => {
      if (!docsCache.details) docsCache.details = loadDetails(request, env);
      return docsCache.details;
    },
    sheet: async (feed) => {
      const rows = await loadSheet(request, env, FEEDS[feed]);
      sheetMeta[feed] = cache.get(FEEDS[feed]);
      return rows;
    },
    sheetModified: () => 0,
  };
  const result = await handler(parsed.vars, ctx);
  if (result.fixed) {
    const f = FIXED[result.fixed];
    return answer(f.status, f.body, { cacheControl: f.cacheControl });
  }
  return answer(200, result.body, { lastModified: result.lastModified });
}
