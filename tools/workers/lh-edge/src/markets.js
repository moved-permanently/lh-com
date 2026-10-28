/* global HTMLRewriter */
/**
 * Market roots answered from their language's documents (README "Market roots"): a root of the
 * locale table with documents "language" (ch/en, ch/de) holds its own documents only where it
 * differs from its language version (LANGUAGE_VERSIONS: en de/en, de de/de). For
 * /<cc>/<ll>/<path>:
 * - the root's own document when the origin has one (any answer but 404: pages, redirects of the
 *   redirect sheet);
 * - else the language version's document, when the language's query index
 *   (/<version>/search-index.json) has the page and its `markets` metadata allows the country
 *   (an include list "de, at", an exclude list "-ch, -us"; empty: every market of the language;
 *   the page's own <meta name="markets"> too, which counts before a publish updates the index).
 *   Sections whose section metadata `markets` excludes the country are left out (the site does
 *   the same for the roots it renders, scripts/scripts.js).
 *   Links into the language version become the market root's when the market serves the target
 *   (the link step's rule, tools/loc/link-lib.mjs), links into it on www (pages not migrated)
 *   www's market root's, the site's own hosts are stripped, canonical
 *   and og:url name the market URL, hreflang alternates come from the indexes, nav and footer are
 *   the market root's (its own documents, else the language version's);
 *   what the language index leaves out on purpose (nav, footer, fragments, form confirmations, the
 *   search page) falls back to the language version without an index row; a redirect of the
 *   language version (the redirect sheet) redirects the market path into the market root; JSON
 *   (search-index.json, articles/query-index.json …) is the language version's, its rows filtered
 *   by `markets` and their paths rewritten, search-index.json with the root's own pages added;
 * - else the origin's 404 for the market path, as www.
 * Cached like the pass-through (originFetch: EDGE_TTL, the origin's cache tags: a publish of the
 * language page purges every market copy). Media, code and other files pass through.
 *
 * Pilot rows (status pilot) are answered only on the hosts of the var PILOT_HOSTS (the public
 * host, src/edge.js publicHost); elsewhere the request passes through unchanged.
 * Sitemaps: /sitemap/sitemap_lh_<cc>_<ll>.xml(.gz) per served market root, and the index
 * /sitemap/sitemap_lh.xml(.gz) with the market roots added (where any are served).
 */
import {
  originFetch, publicHost, isMediaRequest, passThrough,
} from './edge.js';
import {
  leanSource, leanModelPath, leanLlmsPath, resetLeanCache,
} from './market-lean.js';
/* eslint-disable import/no-relative-packages */
import { LOCALE_TABLE, LANGUAGE_VERSIONS } from '../../../../scripts/locale-table.js';
import { marketAllows, dropMarketSections } from '../../../../scripts/market-rules.js';
/* eslint-enable import/no-relative-packages */

/** The roots answered from their language's documents, e.g. ['ch/de', 'ch/en']. */
export const MARKET_ROOTS = Object.keys(LOCALE_TABLE)
  .filter((k) => LOCALE_TABLE[k].documents === 'language');

/** The index of the market roots' own documents (helix-query.yaml market-pages). */
export const MARKET_INDEX = '/market-pages.json';

// documents the language index leaves out on purpose (helix-query.yaml search-<cc>-<ll>): nav,
// footer, fragments, form confirmations, the search page, article config; a market root without
// its own gets the language version's
const LANGUAGE_ONLY = /^\/(nav|footer)$|^\/(fragments|support\/search|articles\/config)\/|\/(confirmation|[^/]*-confirmation)$/;
// documents of a root that are no pages of it (not in its search index or sitemap)
const NOT_PAGES = /\/(nav|footer)$|\/fragments\//;
const INDEX_TTL_MS = 60000;
const PAGE = 1000;
const indexes = new Map();

/** Drops the cached indexes (tests). */
export function resetMarketCache() {
  indexes.clear();
  resetLeanCache();
}

const listVar = (v) => String(v || '').split(',').map((h) => h.trim().toLowerCase()).filter(Boolean);

/**
 * The pilot countries a host shows (var PILOT_COUNTRIES_BY_HOST: "host=cc|cc; host2=cc", e.g.
 * "lhcom.bbird.live=ch"), parsed once per value: {host: Set of countries}.
 */
const pilotCountries = new Map();
function pilotCountriesOf(value) {
  const key = String(value || '');
  if (!pilotCountries.has(key)) {
    const map = {};
    key.split(';').forEach((entry) => {
      const [host, ccs] = entry.split('=').map((s) => (s || '').trim().toLowerCase());
      if (host && ccs) map[host] = new Set(ccs.split('|').map((c) => c.trim()).filter(Boolean));
    });
    pilotCountries.set(key, map);
  }
  return pilotCountries.get(key);
}

/**
 * The market roots this request's host serves: live ones everywhere, pilot ones on PILOT_HOSTS
 * (all of them) and on the hosts of PILOT_COUNTRIES_BY_HOST (those countries' only).
 */
export function servedMarketRoots(request, env) {
  const host = publicHost(request, env).toLowerCase();
  const pilot = listVar(env.PILOT_HOSTS).includes(host);
  const countries = pilot ? null : pilotCountriesOf(env.PILOT_COUNTRIES_BY_HOST)[host];
  return MARKET_ROOTS.filter((k) => LOCALE_TABLE[k].status === 'live'
    || (LOCALE_TABLE[k].status === 'pilot' && (pilot || Boolean(countries && countries.has(LOCALE_TABLE[k].country)))));
}

// the `markets` rule, shared with the site (page and section metadata)
export { marketAllows, dropMarketSections };

/** The market root and the rest of a path (/ch/en/x -> {root: 'ch/en', rest: '/x'}), or null. */
export function marketPath(pathname) {
  const m = pathname.match(/^\/([a-z]{2}\/[a-z]{2})(\/.+)$/);
  return m && MARKET_ROOTS.includes(m[1]) ? { root: m[1], rest: m[2] } : null;
}

/** Every row of a sheet (paged), or null when the origin has none (404). */
async function sheetRows(request, env, path) {
  const get = new Request(request.url, { method: 'GET', headers: { accept: 'application/json' } });
  const rows = [];
  let first = null;
  for (let offset = 0; offset < 50000; offset += PAGE) {
    // eslint-disable-next-line no-await-in-loop
    const resp = await originFetch(get, env, `https://${env.ORIGIN}${path}?limit=${PAGE}&offset=${offset}`);
    if (resp.status === 404) return null;
    if (!resp.ok) throw new Error(`${path}: HTTP ${resp.status}`);
    // eslint-disable-next-line no-await-in-loop
    const sheet = await resp.json();
    if (!first) first = { sheet, headers: resp.headers };
    const data = Array.isArray(sheet.data) ? sheet.data : [];
    rows.push(...data);
    if (sheet[':type'] !== 'sheet' || data.length < PAGE || rows.length >= (sheet.total || 0)) break;
  }
  return { rows, first };
}

/**
 * An index kept a minute per isolate; concurrent callers share the pending read (the sitemap
 * index asks once per market root at the same time), a failed read is not kept.
 */
function cachedIndex(key, read) {
  const cached = indexes.get(key);
  if (cached && Date.now() - cached.at < INDEX_TTL_MS) return cached.promise;
  const promise = read();
  indexes.set(key, { at: Date.now(), promise });
  promise.catch(() => { if (indexes.get(key)?.promise === promise) indexes.delete(key); });
  return promise;
}

async function readPathIndex(request, env, root) {
  const get = new Request(request.url, { method: 'GET', headers: { accept: 'application/json' } });
  const index = new Set();
  for (let offset = 0; offset < 50000; offset += PAGE) {
    // eslint-disable-next-line no-await-in-loop
    const resp = await originFetch(get, env, `https://${env.ORIGIN}/${root}/search-index.json?limit=${PAGE}&offset=${offset}`);
    if (!resp.ok) break;
    // eslint-disable-next-line no-await-in-loop
    const text = await resp.text();
    const before = index.size;
    [...text.matchAll(/"path":"([^"\\]*)"/g)].forEach((m) => index.add(m[1]));
    const total = Number((text.match(/"total":(\d+)/) || [])[1] || 0);
    if (index.size - before < PAGE || index.size >= total) break;
  }
  return index;
}

/**
 * The paths of a root's search index (a Set), a minute per isolate: read with a scan for the
 * path values instead of JSON.parse (an index is about a megabyte; the scan takes a fifth of the
 * CPU time), for the hreflang of roots with their own documents (at/de, gb/en).
 */
async function pathIndex(request, env, root) {
  const key = `${env.ORIGIN}/${root}/search-index.json#paths`;
  return cachedIndex(key, () => readPathIndex(request, env, root));
}

// roots with every page as their own document besides the language versions (at/de, gb/en):
// listed in the hreflang of market copies where their index has the page (same path, as
// helix-sitemap.yaml pairs them)
const OWN_ROOTS = Object.keys(LOCALE_TABLE).filter((k) => LOCALE_TABLE[k].documents === 'own'
  && LOCALE_TABLE[k].status === 'live' && !Object.values(LANGUAGE_VERSIONS).includes(k));

/** Index rows as the model keeps them (path -> {markets, robots, primary, lastModified}). */
function compactRows(rows) {
  const index = new Map();
  rows.forEach((r) => {
    if (!r || typeof r.path !== 'string') return;
    index.set(r.path, {
      markets: r.markets || '', robots: r.robots || '', primary: r['primary-language-url'] || '', lastModified: r.lastModified || '',
    });
  });
  return index;
}

/** A compact index (path -> {markets, robots, primary, lastModified}), a minute per isolate. */
async function compactIndex(request, env, path) {
  return cachedIndex(`${env.ORIGIN}${path}`, async () => compactRows((await sheetRows(request, env, path))?.rows || []));
}

/** The language version's pages by the language page they name (primary-language-url). */
function primaryMap(rows) {
  const byPrimary = new Map();
  rows.forEach((row, p) => { if (row.primary) byPrimary.set(row.primary, p); });
  return byPrimary;
}

const NO_VALUES = { markets: '', robots: '', primary: '' };

/**
 * A lean source as the model's index: has and get from the path set and the sparse rows (no
 * parse of the whole source), forEach (the sitemaps) from every row, as compactIndex.
 */
function newLeanIndex(src) {
  let sparse;
  let full;
  let byPrimary;
  const got = new Map();
  const sparseRows = () => {
    sparse ||= compactRows(src.rowsWith(['markets', 'robots', 'primary-language-url']));
    return sparse;
  };
  const fullRows = () => {
    full ||= compactRows(src.all());
    return full;
  };
  return {
    has: (p) => src.has(p),
    get: (p) => {
      if (full) return full.get(p);
      if (!src.has(p)) return undefined;
      // kept per path: a page's links and a sitemap file ask for the same rows many times
      if (!got.has(p)) {
        const row = sparseRows().get(p) || NO_VALUES;
        got.set(p, {
          markets: row.markets,
          robots: row.robots,
          primary: row.primary,
          get lastModified() { return fullRows().get(p)?.lastModified || ''; },
        });
      }
      return got.get(p);
    },
    forEach: (fn) => fullRows().forEach(fn),
    byPrimary: (p) => {
      byPrimary ||= primaryMap(sparseRows());
      return byPrimary.get(p);
    },
  };
}

// one index object per lean source (its path set and parsed rows kept with the source)
const leanIndexes = new WeakMap();
function leanIndex(src) {
  if (!leanIndexes.has(src)) leanIndexes.set(src, newLeanIndex(src));
  return leanIndexes.get(src);
}

/**
 * The model from the lean sources (src/market-lean.js), or null when one of them is missing or
 * not complete (the caller reads the full indexes).
 */
async function leanModel(request, env, roots) {
  const langs = [...new Set(roots.map((r) => LOCALE_TABLE[r].lang))];
  const others = OWN_ROOTS.filter((r) => langs.includes(LOCALE_TABLE[r].lang));
  const versionRoots = langs.map((l) => LANGUAGE_VERSIONS[l]);
  const read = (r) => leanSource(request, env, leanModelPath(r), r ? `/${r}/search-index.json` : MARKET_INDEX);
  const [own, ...srcs] = await Promise.all([
    read(null), ...versionRoots.map(read), ...others.map(read),
  ]);
  if (!own || srcs.some((s) => !s)) return null;
  const versions = {};
  langs.forEach((lang, i) => {
    const index = leanIndex(srcs[i]);
    versions[lang] = { root: versionRoots[i], index, byPrimary: { get: index.byPrimary } };
  });
  return {
    roots,
    versions,
    own: leanIndex(own),
    others: Object.fromEntries(others.map((r, i) => [r, srcs[langs.length + i]])),
    lean: true,
  };
}

/** The model from the full search indexes and the market index (before the lean sources). */
async function fullModel(request, env, roots) {
  const langs = [...new Set(roots.map((r) => LOCALE_TABLE[r].lang))];
  const versions = {};
  await Promise.all(langs.map(async (lang) => {
    const root = LANGUAGE_VERSIONS[lang];
    const index = await compactIndex(request, env, `/${root}/search-index.json`);
    versions[lang] = { root, index, byPrimary: primaryMap(index) };
  }));
  let own;
  try {
    own = await compactIndex(request, env, MARKET_INDEX);
  } catch (e) {
    own = new Map();
  }
  const others = {};
  await Promise.all(OWN_ROOTS.filter((r) => langs.includes(LOCALE_TABLE[r].lang)).map(async (r) => {
    others[r] = await pathIndex(request, env, r).catch(() => new Set());
  }));
  return {
    roots, versions, own, others,
  };
}

/**
 * What the served market roots have: {roots, versions: {lang: {root, index, byPrimary}}, own,
 * others: {root: Set of paths}}. own: the market roots' own documents (the market index; empty
 * while it has no rows); others: the roots with their own documents of the same languages.
 * From the lean sources when they are complete (var MARKET_MODEL=full: always the full indexes).
 */
export async function marketModel(request, env, roots = servedMarketRoots(request, env)) {
  if (env.MARKET_MODEL !== 'full') {
    const lean = await leanModel(request, env, roots).catch(() => null);
    if (lean) return lean;
  }
  return fullModel(request, env, roots);
}

/**
 * What alternates() reads for every page, made once per model: the served roots and the roots
 * with their own documents by language (in model order), the own pages by suffix.
 */
function lookups(model) {
  if (!model.lookups) {
    const rootsByLang = new Map();
    model.roots.forEach((r) => {
      const { lang } = LOCALE_TABLE[r];
      if (!rootsByLang.has(lang)) rootsByLang.set(lang, []);
      rootsByLang.get(lang).push(r);
    });
    const othersByLang = new Map();
    Object.entries(model.others || {}).forEach(([r, paths]) => {
      const { lang } = LOCALE_TABLE[r];
      if (!othersByLang.has(lang)) othersByLang.set(lang, []);
      othersByLang.get(lang).push([r, paths]);
    });
    // own.has(`/${r}${s}`) as ownBySuffix.get(s).has(r)
    const ownBySuffix = new Map();
    model.own.forEach((row, p) => {
      const m = p.match(/^\/([a-z]{2}\/[a-z]{2})(.*)$/);
      if (!m) return;
      if (!ownBySuffix.has(m[2])) ownBySuffix.set(m[2], new Set());
      ownBySuffix.get(m[2]).add(m[1]);
    });
    model.lookups = { rootsByLang, othersByLang, ownBySuffix };
  }
  return model.lookups;
}

/** Whether a market root serves a path after its prefix ('' is the root itself). */
export function serves(model, root, suffix) {
  // a Set kept with the model (a sheet asks once per path value)
  model.rootSet ||= new Set(model.roots);
  if (!model.rootSet.has(root)) return false;
  if (!suffix || suffix === '/') return true;
  if (lookups(model).ownBySuffix.get(suffix)?.has(root)) return true;
  if (LANGUAGE_ONLY.test(suffix)) return true;
  const v = model.versions[LOCALE_TABLE[root].lang];
  const row = v && v.index.get(`/${v.root}${suffix}`);
  return Boolean(row) && (!row.markets || marketAllows(row.markets, root.split('/')[0]));
}

/**
 * The alternates of a page of a language version (its path after the prefix): every language
 * version, root with its own documents (at/de, gb/en: the same path as the language version's)
 * and served market root of the indexed languages that has it, [{hreflang, path}]. The
 * other language's page is the same path, or the one that names it (or that it names) as its
 * primary-language-url (translated slugs, as helix-sitemap.yaml pairs them).
 */
export function alternates(model, lang, suffix) {
  const v = model.versions[lang];
  const { rootsByLang, othersByLang, ownBySuffix } = lookups(model);
  const suffixes = { [lang]: suffix };
  Object.entries(model.versions).forEach(([l, other]) => {
    if (l === lang) return;
    const named = v.index.get(`/${v.root}${suffix}`)?.primary;
    const pick = [
      other.index.has(`/${other.root}${suffix}`) ? suffix : null,
      other.byPrimary.get(`/${v.root}${suffix}`)?.slice(other.root.length + 1),
      named && named.startsWith(`/${other.root}/`) && other.index.has(named) ? named.slice(other.root.length + 1) : null,
    ].find(Boolean);
    if (pick) suffixes[l] = pick;
  });
  const out = [];
  Object.entries(suffixes).forEach(([l, s]) => {
    const version = model.versions[l].root;
    const item = (r) => ({
      hreflang: LOCALE_TABLE[r].hreflang, path: `/${r}${s}`, root: r, suffix: s,
    });
    if (model.versions[l].index.has(`/${version}${s}`)) out.push(item(version));
    (othersByLang.get(l) || []).forEach(([r, paths]) => { if (paths.has(`/${r}${s}`)) out.push(item(r)); });
    // serves(model, r, s) for every served root of the language, the language row read once
    // (a sitemap file asks for 100 pages times every root)
    const always = !s || s === '/' || LANGUAGE_ONLY.test(s);
    const row = always ? null : model.versions[l].index.get(`/${version}${s}`);
    const own = ownBySuffix.get(s);
    (rootsByLang.get(l) || []).forEach((r) => {
      if (always || (own && own.has(r)) || (row && (!row.markets || marketAllows(row.markets, r.split('/')[0])))) {
        out.push(item(r));
      }
    });
  });
  return out;
}

/** The site's own hosts in absolute links (origin, the replica's hosts): stripped. */
function siteHosts(env) {
  const origin = String(env.ORIGIN || '').replace(/\.aem\.(live|page)$/, '');
  const hosts = [`${origin}.aem.live`, `${origin}.aem.page`, ...listVar(env.ALIAS_REWRITE_HOSTS), ...listVar(env.PUBLIC_HOST)];
  const alt = hosts.filter(Boolean).map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  return new RegExp(`^https://(${alt})(?=/|$)`, 'i');
}

/**
 * A link of a language document for the market root, or null to leave it. A link into the
 * language version on www (a page that was not migrated) goes to www's market root, same path
 * (www's market roots have the language version's paths).
 */
// marketHref's patterns per host and language version, compiled once (a sheet has thousands of
// path values)
const hrefPatterns = new Map();
function hrefPattern(www, from) {
  const key = `${www} ${from}`;
  if (!hrefPatterns.has(key)) {
    const prefix = from.replace('/', '\\/');
    hrefPatterns.set(key, {
      onWww: new RegExp(`^https://${www.replace(/\./g, '\\.')}/${prefix}((?:/[^?#]*)?)([?#].*)?$`),
      local: new RegExp(`^/${prefix}((?:/[^?#]*)?)([?#].*)?$`),
    });
  }
  return hrefPatterns.get(key);
}

export function marketHref(href, {
  from, to, allowed, hosts, www = 'www.lufthansa.com',
}) {
  const raw = String(href || '');
  // a path into the language version (most links, every path value of a sheet): no host to
  // strip, not on www; the local pattern by slicing (the same groups; with a line break, which
  // the pattern's `.` does not take, the pattern itself)
  if (raw.startsWith(`/${from}`) && !/[\n\r\u2028\u2029]/.test(raw)) {
    const rest = raw.slice(from.length + 1);
    const c = rest.charCodeAt(0);
    if (rest && c !== 47 && c !== 63 && c !== 35) return null;
    let q = rest.length;
    ['?', '#'].forEach((ch) => { const i = rest.indexOf(ch); if (i >= 0 && i < q) q = i; });
    const path = c === 47 ? rest.slice(0, q) : '';
    const tail = c === 47 ? rest.slice(q) : rest;
    const suffix = path.replace(/\.html$/, '').replace(/\/$/, '');
    if (!allowed(suffix)) return null;
    const next = `/${to}${path}${tail}`;
    return next === raw ? null : next;
  }
  const pattern = hrefPattern(www, from);
  const onWww = raw.match(pattern.onWww);
  if (onWww) return `https://${www}/${to}${onWww[1]}${onWww[2] || ''}`;
  let v = raw.replace(hosts, '');
  if (v === '' && raw !== '') v = '/';
  const m = v.match(pattern.local);
  if (m) {
    const suffix = m[1].replace(/\.html$/, '').replace(/\/$/, '');
    if (allowed(suffix)) v = `/${to}${m[1]}${m[2] || ''}`;
  }
  return v === raw ? null : v;
}

const escapeAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** The language document's HTML for the market root (HTMLRewriter, streamed). */
export function marketHtml(resp, ctx) {
  const link = (attr) => ({
    element(e) {
      const next = marketHref(e.getAttribute(attr), ctx);
      if (next !== null) e.setAttribute(attr, next);
    },
  });
  const strip = (attr) => ({
    element(e) {
      const value = e.getAttribute(attr);
      const next = value.replace(ctx.hosts, '');
      if (next !== value) e.setAttribute(attr, next);
    },
  });
  const withPath = (url) => {
    try {
      const u = new URL(url);
      return `${u.origin}${ctx.marketPath}`;
    } catch (e) {
      return url;
    }
  };
  return new HTMLRewriter()
    .on('a[href]', link('href'))
    .on('img[src]', strip('src'))
    .on('source[srcset]', strip('srcset'))
    .on('link[href]', {
      element(e) {
        const rel = (e.getAttribute('rel') || '').toLowerCase();
        if (rel === 'alternate' && e.getAttribute('hreflang')) {
          e.remove();
        } else if (rel === 'canonical') {
          const canonical = withPath(e.getAttribute('href'));
          e.setAttribute('href', canonical);
          const { origin } = new URL(canonical, 'https://x');
          const tags = ctx.alternates.map((a) => `<link rel="alternate" hreflang="${a.hreflang}" href="${escapeAttr(`${origin}${a.path}`)}">`).join('');
          if (tags) e.after(tags, { html: true });
        }
      },
    })
    .on('meta[content]', {
      element(e) {
        const prop = (e.getAttribute('property') || '').toLowerCase();
        const name = (e.getAttribute('name') || '').toLowerCase();
        if (prop === 'og:url') e.setAttribute('content', withPath(e.getAttribute('content')));
        else if (['nav', 'footer', 'parent'].includes(name)) link('content').element(e);
      },
    })
    .transform(resp);
}

/** A JSON row's path values for the market root (paths into the language version it serves). */
function marketRow(row, ctx) {
  const out = {};
  Object.entries(row).forEach(([k, v]) => {
    out[k] = typeof v === 'string' && v.startsWith(`/${ctx.from}`) ? (marketHref(v, ctx) ?? v) : v;
  });
  return out;
}

const isTrue = (v) => String(v || '').trim().toLowerCase() === 'true';

/**
 * The llms.txt rows of a market root from the lean llms sources (src/market-lean.js), or null
 * when they are missing or not complete (llms.js then reads the market route's search index):
 * the rows the market route's search-index.json gives that llms.txt reads (llms-include true;
 * the language's filtered by markets, their paths the root's, the root's own pages replacing
 * them, ordered by path), the homepage's ai-guidance only from the root's own homepage.
 */
export async function marketLlmsRows(request, env, key) {
  if (env.MARKET_MODEL === 'full' || !servedMarketRoots(request, env).includes(key)) return null;
  const from = LANGUAGE_VERSIONS[LOCALE_TABLE[key].lang];
  const [lang, own] = await Promise.all([
    leanSource(request, env, leanLlmsPath(from), `/${from}/search-index.json`),
    leanSource(request, env, leanLlmsPath(null), MARKET_INDEX),
  ]);
  if (!lang || !own) return null;
  let model;
  try {
    model = await marketModel(request, env);
  } catch (e) {
    return null;
  }
  const ctx = {
    from, to: key, rest: '/search-index.json', hosts: siteHosts(env), www: env.WWW_HOST || 'www.lufthansa.com', allowed: (s) => serves(model, key, s),
  };
  const cc = key.split('/')[0];
  const langRows = lang.rowsWhere('llms-include', isTrue)
    .filter((r) => !r || typeof r.path !== 'string' || marketAllows(r.markets, cc)).map((r) => marketRow(r, ctx));
  const ownRows = own.rowsUnder(`/${key}/`).filter((r) => r && typeof r.path === 'string' && !NOT_PAGES.test(r.path));
  const ownPaths = new Set(ownRows.map((r) => r.path));
  const home = ownRows.find((r) => r.path === `/${key}/homepage`);
  const guidance = (home && home['ai-guidance']) || '';
  return [...langRows.filter((r) => !ownPaths.has(r.path)), ...ownRows]
    .sort((a, b) => String(a.path).localeCompare(String(b.path)))
    .map((r) => (r.path === `/${key}/homepage` ? { ...r, 'ai-guidance': guidance } : r));
}

// A query index page as the origin writes it: {"total":…,"offset":…,"limit":…,"data":[rows],
// "columns":[…],":type":"sheet"}, every row an object of strings starting with its path, the
// same keys in every row, limit the number of rows. JSON.stringify of a parsed origin sheet gives
// the origin's bytes, so rows can be copied as bytes and only rewritten values re-encoded. Found
// with single-byte indexOf on the bytes (decoding a 4.5 MB index alone takes about 10 ms): inside
// a JSON string a quote is escaped, so `{"path":"` and `":"` before a value only stand where they
// mean that.
const SHEET_HEAD = /^\{"total":(\d+),"offset":(\d+),"limit":(\d+),"data":\[/;
const SHEET_TAIL = '],"columns":';
const ascii = (s) => Uint8Array.from(s, (c) => c.charCodeAt(0));
const ROW_PATH = ascii('{"path":"');
const MARKETS_EMPTY = ascii(',"markets":""}');
const utf8 = new TextDecoder();
const encoder = new TextEncoder();

const bytesAt = (b, i, pattern) => {
  if (i < 0 || i + pattern.length > b.length) return false;
  for (let k = 0; k < pattern.length; k += 1) if (b[i + k] !== pattern[k]) return false;
  return true;
};

/** The closing quote of the JSON string whose content starts at i (not an escaped one). */
function quoteEnd(b, i) {
  let end = b.indexOf(34, i);
  while (end > 0) {
    let n = 0;
    for (let j = end - 1; j >= i && b[j] === 92; j -= 1) n += 1;
    if (n % 2 === 0) return end;
    end = b.indexOf(34, end + 1);
  }
  return -1;
}

const stringAt = (b, from, to) => {
  const s = utf8.decode(b.subarray(from, to));
  return s.includes('\\') ? JSON.parse(`"${s}"`) : s;
};

/**
 * A sheet page's rows as byte spans: {rows: [{start, end, path, values, markets}], tailStart},
 * values the string values that start with /<from> ({from, to: the quotes' span, value}),
 * markets '' unless the row has a markets value; null when the page is shaped otherwise.
 */
function sheetSpans(b, from) {
  const head = utf8.decode(b.subarray(0, Math.min(b.length, 120))).match(SHEET_HEAD);
  if (!head) return null;
  const dataStart = head[0].length;
  // the data's end: the last `],"columns":` (searched from the end, the tail is short)
  let dataEnd = -1;
  const tailMark = ascii(SHEET_TAIL);
  for (let i = b.lastIndexOf(93); i >= dataStart; i = b.lastIndexOf(93, i - 1)) {
    if (bytesAt(b, i, tailMark)) { dataEnd = i; break; }
  }
  if (dataEnd < dataStart) return null;
  const tail = utf8.decode(b.subarray(dataEnd + 1));
  if (!tail.endsWith(',":type":"sheet"}')) return null;
  let columns;
  try {
    ({ columns } = JSON.parse(`{${tail.slice(1)}`));
  } catch (e) {
    return null;
  }
  if (!Array.isArray(columns) || columns[0] !== 'path') return null;
  const marketsAt = columns.indexOf('markets');
  // markets read at a row's end only: another place of the column -> parsed as before
  if (marketsAt >= 0 && marketsAt !== columns.length - 1) return null;
  const prefix = from ? ascii(`/${from}`) : null;
  const rows = [];
  for (let i = b.indexOf(47, dataStart); i >= 0 && i < dataEnd; i = b.indexOf(47, i + 1)) {
    // a '/' that starts a string value (`":"` before it; most '/' are inside text): a row's path
    // or a value into the language version
    const valueStart = b[i - 1] === 34 && b[i - 2] === 58 && b[i - 3] === 34;
    const rowStart = valueStart && bytesAt(b, i - ROW_PATH.length, ROW_PATH);
    const prefixed = valueStart && prefix && bytesAt(b, i, prefix);
    if (rowStart || prefixed) {
      const end = quoteEnd(b, i);
      if (end < 0) return null;
      const value = stringAt(b, i, end);
      if (rowStart) {
        const start = i - ROW_PATH.length;
        // rows follow each other: the first right after "data":[, each next after "},"
        const joined = rows.length
          ? b[start - 1] === 44 && b[start - 2] === 125
          : start === dataStart;
        if (!joined) return null;
        if (rows.length) rows[rows.length - 1].end = start - 1;
        rows.push({
          start, end: dataEnd, path: value, values: [], markets: '',
        });
      }
      if (prefixed) rows[rows.length - 1].values.push({ from: i - 1, to: end + 1, value });
      i = end;
    }
  }
  // as many rows as the page says, the last one closed before the data's end
  if (rows.length !== Number(head[3]) || (rows.length && b[dataEnd - 1] !== 125)) return null;
  if (marketsAt >= 0) {
    rows.forEach((r) => {
      if (!bytesAt(b, r.end - MARKETS_EMPTY.length, MARKETS_EMPTY)) r.markets = JSON.parse(utf8.decode(b.subarray(r.start, r.end))).markets || '';
    });
  }
  return { rows, tailStart: dataEnd, total: Number(head[1]) };
}

/** Every page of a sheet as bytes with its spans, null for a 404, false for another shape. */
async function sheetPages(request, env, path, from) {
  const get = new Request(request.url, { method: 'GET', headers: { accept: 'application/json' } });
  const pages = [];
  let count = 0;
  for (let offset = 0; offset < 50000; offset += PAGE) {
    // eslint-disable-next-line no-await-in-loop
    const resp = await originFetch(get, env, `https://${env.ORIGIN}${path}?limit=${PAGE}&offset=${offset}`);
    if (resp.status === 404) return null;
    if (!resp.ok) throw new Error(`${path}: HTTP ${resp.status}`);
    // eslint-disable-next-line no-await-in-loop
    const bytes = new Uint8Array(await resp.arrayBuffer());
    const spans = sheetSpans(bytes, from);
    if (!spans) return false;
    pages.push({ bytes, spans, headers: resp.headers });
    count += spans.rows.length;
    // as sheetRows: a short page or every row read ends it
    if (spans.rows.length < PAGE || count >= spans.total) break;
  }
  return pages;
}

/**
 * The language version's JSON for the market root, as marketJson, from the sheet's bytes: rows
 * copied as they are, only the values into the language version rewritten (marketRow), only rows
 * with a markets value parsed. null when the sheet is shaped otherwise (marketJson then).
 */
async function marketJsonBytes(request, env, ctx, own404) {
  const url = new URL(request.url);
  const pages = await sheetPages(request, env, `/${ctx.from}${ctx.rest}`, ctx.from);
  if (pages === null) return own404;
  if (!pages) return null;
  const cc = ctx.to.split('/')[0];
  // a row: {path, bytes, start, end, patches: [offset in the row], parts (a row re-encoded)}.
  // A rewritten value is /<to><rest> for /<from><rest>, roots are cc/ll: as long as before, so
  // its bytes are the original's with <from> patched to <to>
  const toBytes = ascii(ctx.to);
  const hrefs = new Map();
  let rows = [];
  pages.forEach(({ bytes, spans }) => {
    spans.rows.forEach((r) => {
      if (r.markets && !marketAllows(r.markets, cc)) return;
      const row = {
        path: r.path, bytes, start: r.start, end: r.end, patches: [],
      };
      r.values.forEach((v) => {
        // the same value (a parent, an image) answered once per sheet
        if (!hrefs.has(v.value)) hrefs.set(v.value, marketHref(v.value, ctx));
        const next = hrefs.get(v.value);
        if (next === null || next === v.value) return;
        if (next.length === v.value.length && next.startsWith(`/${ctx.to}`) && next.slice(ctx.to.length + 1) === v.value.slice(ctx.from.length + 1)) {
          row.patches.push(v.from + 2 - r.start);
        } else {
          row.complex = true;
        }
        if (v.from === r.start + ROW_PATH.length - 1) row.path = next;
      });
      if (row.complex) {
        // another rewrite (not the same length): the row as marketRow makes it
        const parsed = JSON.parse(utf8.decode(bytes.subarray(r.start, r.end)));
        row.parts = encoder.encode(JSON.stringify(marketRow(parsed, ctx)));
      }
      rows.push(row);
    });
  });
  if (ctx.rest === '/search-index.json') {
    // the root's own pages (the market index has the search columns) replace the language's
    let own = [];
    try {
      const ownPages = await sheetPages(request, env, MARKET_INDEX, null);
      if (ownPages === false) return null;
      own = (ownPages || []).flatMap(({ bytes, spans }) => spans.rows
        .filter((r) => r.path.startsWith(`/${ctx.to}/`) && !NOT_PAGES.test(r.path))
        .map((r) => ({
          path: r.path, bytes, start: r.start, end: r.end, patches: [],
        })));
    } catch (e) {
      own = [];
    }
    const ownPaths = new Set(own.map((r) => r.path));
    rows = [...rows.filter((r) => !ownPaths.has(r.path)), ...own]
      .sort((a, b) => String(a.path).localeCompare(String(b.path)));
  }
  const headers = new Headers(pages[0].headers);
  headers.delete('content-length');
  headers.set('content-type', 'application/json');
  headers.set('x-lh-edge-route', 'market');
  if (request.method === 'HEAD') return new Response(null, { headers });
  const offset = Math.max(0, Number.parseInt(url.searchParams.get('offset'), 10) || 0);
  const limit = Math.max(1, Number.parseInt(url.searchParams.get('limit'), 10) || PAGE);
  const head = encoder.encode(`{"total":${rows.length},"offset":${offset},"limit":${limit},"data":[`);
  const first = pages[0];
  const tail = first.bytes.subarray(first.spans.tailStart);
  const slice = rows.slice(offset, offset + limit);
  const size = slice.reduce((n, r) => n + (r.parts ? r.parts.length : r.end - r.start), 0);
  const body = new Uint8Array(head.length + size + Math.max(0, slice.length - 1) + tail.length);
  body.set(head, 0);
  let at = head.length;
  slice.forEach((r, i) => {
    if (i) { body[at] = 44; at += 1; }
    if (r.parts) {
      body.set(r.parts, at);
      at += r.parts.length;
      return;
    }
    body.set(r.bytes.subarray(r.start, r.end), at);
    r.patches.forEach((p) => body.set(toBytes, at + p));
    at += r.end - r.start;
  });
  body.set(tail, at);
  return new Response(body, { headers });
}

/** The language version's JSON for the market root, paged as the request asks. */
async function marketJson(request, env, ctx, own404) {
  const url = new URL(request.url);
  const all = await sheetRows(request, env, `/${ctx.from}${ctx.rest}`);
  if (!all) return own404;
  const { sheet, headers } = all.first;
  const out = new Headers(headers);
  out.delete('content-length');
  out.set('content-type', 'application/json');
  out.set('x-lh-edge-route', 'market');
  if (sheet[':type'] !== 'sheet') {
    // multi-sheets: the paths rewritten, nothing filtered
    const text = JSON.stringify(sheet, (k, v) => (typeof v === 'string' && v.startsWith(`/${ctx.from}`) ? (marketHref(v, ctx) ?? v) : v));
    return new Response(request.method === 'HEAD' ? null : text, { headers: out });
  }
  const cc = ctx.to.split('/')[0];
  let rows = all.rows.filter((r) => !r || typeof r.path !== 'string' || marketAllows(r.markets, cc)).map((r) => marketRow(r, ctx));
  if (ctx.rest === '/search-index.json') {
    // the root's own pages (the market index has the search columns) replace the language's
    const ownRows = ((await sheetRows(request, env, MARKET_INDEX).catch(() => null))?.rows || [])
      .filter((r) => r && typeof r.path === 'string' && r.path.startsWith(`/${ctx.to}/`) && !NOT_PAGES.test(r.path));
    const ownPaths = new Set(ownRows.map((r) => r.path));
    rows = [...rows.filter((r) => !ownPaths.has(r.path)), ...ownRows]
      .sort((a, b) => String(a.path).localeCompare(String(b.path)));
  }
  const offset = Math.max(0, Number.parseInt(url.searchParams.get('offset'), 10) || 0);
  const limit = Math.max(1, Number.parseInt(url.searchParams.get('limit'), 10) || PAGE);
  const body = {
    ...sheet, total: rows.length, offset, limit, data: rows.slice(offset, offset + limit),
  };
  return new Response(request.method === 'HEAD' ? null : JSON.stringify(body), { headers: out });
}

/**
 * What the site answers for an origin URL, for the routes ahead of this one (the app view, SDUI,
 * offline list, micro-frontend page, llms.txt): under a market root this host serves, the market
 * route's answer for that path (the root's own document, else the language version's,
 * rewritten); every other path exactly as before (originFetch with the same arguments).
 */
export async function siteFetch(request, env, target, options) {
  const url = new URL(target);
  const mp = marketPath(url.pathname);
  if (!mp || !servedMarketRoots(request, env).includes(mp.root)) {
    return originFetch(request, env, target, options);
  }
  const pub = new URL(request.url);
  const req = new Request(`${pub.origin}${url.pathname}${url.search}`, {
    method: request.method === 'HEAD' ? 'HEAD' : 'GET', headers: request.headers,
  });
  // eslint-disable-next-line no-use-before-define
  return market(req, env);
}

/**
 * The locale row of a root the request may use: a live root, or a market root this host serves
 * (with its language version: the documents and sheet rows it falls back to), else null.
 */
export function servedLocale(request, env, key) {
  const row = LOCALE_TABLE[key];
  if (!row) return null;
  if (row.documents !== 'language') return row.status === 'live' ? { ...row, version: key } : null;
  if (!servedMarketRoots(request, env).includes(key)) return null;
  return { ...row, version: LANGUAGE_VERSIONS[row.lang] };
}

/**
 * The request without its conditions (If-Modified-Since, If-None-Match), for an origin document an
 * answer is made from: a revalidation by a browser or the CDN in front is about that answer, not
 * the document's (the document's 304 read as "not ok" answered a 404 or the old static sitemap
 * index, which lhcom's CDN then kept).
 */
export function withoutConditions(request, method = request.method) {
  const req = new Request(request.url, { method, headers: request.headers });
  req.headers.delete('if-modified-since');
  req.headers.delete('if-none-match');
  return req;
}

const unavailable = () => new Response('Market index unavailable', {
  status: 503, headers: { 'cache-control': 'no-store', 'x-lh-edge-route': 'market' },
});

/** The route. */
export async function market(request, env) {
  const url = new URL(request.url);
  const mp = marketPath(url.pathname);
  const roots = servedMarketRoots(request, env);
  if (!mp || !roots.includes(mp.root) || !['GET', 'HEAD'].includes(request.method) || isMediaRequest(url)) {
    return passThrough(request, env);
  }
  // the root's own document (or redirect) first
  const own = await passThrough(request, env);
  if (own.status !== 404) return own;
  const { root, rest } = mp;
  const from = LANGUAGE_VERSIONS[LOCALE_TABLE[root].lang];
  // the language version's document in full (see withoutConditions)
  const versionRequest = withoutConditions(request);
  const last = rest.split('/').pop();
  const kind = (/\.plain\.html$/.test(last) && 'plain') || (/\.json$/.test(last) && 'json') || (last.includes('.') ? 'file' : 'page');
  if (kind === 'file') return own;
  let model;
  try {
    model = await marketModel(request, env, roots);
  } catch (e) {
    return unavailable();
  }
  const ctx = {
    from, to: root, rest, hosts: siteHosts(env), www: env.WWW_HOST || 'www.lufthansa.com', allowed: (s) => serves(model, root, s),
  };
  if (kind === 'json') {
    try {
      // the sheet's text when it is shaped as expected (var MARKET_MODEL=full: parsed as before)
      const fast = env.MARKET_MODEL !== 'full' ? await marketJsonBytes(request, env, ctx, own) : null;
      if (fast) return fast;
      return await marketJson(request, env, ctx, own);
    } catch (e) {
      return unavailable();
    }
  }
  const suffix = kind === 'plain' ? rest.replace(/\.plain\.html$/, '') : rest.replace(/\/$/, '');
  if (model.own.has(`/${root}${suffix}`)) return own;
  const v = model.versions[LOCALE_TABLE[root].lang];
  const indexed = v.index.has(`/${from}${suffix}`);
  if (indexed && !serves(model, root, suffix)) return own;
  if (!indexed && !LANGUAGE_ONLY.test(suffix)) {
    // not a page of the language version: its redirect (redirect sheet), else the 404
    if (kind !== 'page') return own;
    const moved = await originFetch(versionRequest, env, `https://${env.ORIGIN}/${from}${rest}`);
    const location = moved.headers.get('location');
    if (![301, 302, 307, 308].includes(moved.status) || !location) return own;
    const target = marketHref(location, ctx) ?? location;
    return new Response(null, {
      status: moved.status,
      headers: { location: target, 'cache-control': moved.headers.get('cache-control') || 'max-age=60', 'x-lh-edge-route': 'market' },
    });
  }
  const doc = await originFetch(versionRequest, env, `https://${env.ORIGIN}/${from}${rest}`);
  if (!doc.ok) return own;
  const headers = new Headers(doc.headers);
  headers.set('x-lh-edge-route', 'market');
  headers.delete('content-length');
  if (request.method === 'HEAD') return new Response(null, { status: doc.status, headers });
  // the page's own markets metadata counts at once (the index takes it on publish)
  const html = await doc.text();
  const meta = kind === 'page' && html.match(/<meta name="markets" content="([^"]*)"/);
  if (meta && !marketAllows(meta[1], root.split('/')[0])) return own;
  // sections whose section metadata `markets` excludes the country are left out
  const resp = new Response(dropMarketSections(html, root.split('/')[0]), { status: doc.status, headers });
  return marketHtml(resp, {
    ...ctx,
    marketPath: `/${root}${suffix}`,
    alternates: kind === 'page' ? alternates(model, LOCALE_TABLE[root].lang, suffix) : [],
  });
}

// most URLs have nothing to escape: no replace then (a sitemap file has thousands)
const xmlEscape = (s) => (/[&<>]/.test(s) ? String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : String(s));
const day = (lastModified) => {
  const n = Number(lastModified);
  return Number.isFinite(n) && n > 0 ? new Date(n * 1000).toISOString().slice(0, 10) : '';
};

/** URLs per market sitemap file (as www, the sitemaps are split: alternates make them large). */
export const SITEMAP_PAGE = 100;
// a file's alternates at most (today 100 URLs times 64: the two language versions, at/de and
// gb/en, 60 served roots): every URL lists every root, so with more roots a file gets fewer URLs
// and its size (and the CPU to make and gzip it) stays as today's
export const SITEMAP_ALTERNATES = 6400;

/** URLs per market sitemap file (var MARKET_SITEMAP=fixed: always SITEMAP_PAGE). */
export function sitemapPage(model, env = {}) {
  if (env.MARKET_SITEMAP === 'fixed') return SITEMAP_PAGE;
  const perUrl = Object.keys(model.versions).length + Object.keys(model.others || {}).length
    + model.roots.length;
  return Math.max(1, Math.min(SITEMAP_PAGE, Math.floor(SITEMAP_ALTERNATES / Math.max(1, perUrl))));
}

/**
 * The sitemap entries of a market root, sorted: [{path, suffix, lastModified, language}]: the
 * language pages it serves and its own pages, without the noindex ones (page-robots). The
 * lastmod date is made for the URLs of a file only (day(lastModified)).
 */
export function sitemapEntries(model, root) {
  const v = model.versions[LOCALE_TABLE[root].lang];
  const entries = new Map();
  v.index.forEach((row, p) => {
    const suffix = p.slice(v.root.length + 1);
    if (!suffix || /noindex/i.test(row.robots) || !serves(model, root, suffix)) return;
    if (model.own.has(`/${root}${suffix}`)) return;
    entries.set(`/${root}${suffix}`, { suffix, lastModified: row.lastModified, language: true });
  });
  model.own.forEach((row, p) => {
    if (!p.startsWith(`/${root}/`) || NOT_PAGES.test(p) || /noindex/i.test(row.robots)) return;
    const suffix = p.slice(root.length + 1);
    entries.set(p, { suffix, lastModified: row.lastModified, language: v.index.has(`/${v.root}${suffix}`) });
  });
  return [...entries.entries()].sort(([a], [b]) => a.localeCompare(b))
    .map(([path, e]) => ({ path, ...e }));
}

/**
 * The number of sitemap entries of a market root (sitemapEntries(model, root).length) without
 * building them: the language pages counted once per language, grouped by their markets value,
 * then per root the groups its country gets, less the pages it has as its own documents; and its
 * own pages. The model keeps the counts (the sitemap index asks for every served root).
 */
export function sitemapCount(model, root) {
  const v = model.versions[LOCALE_TABLE[root].lang];
  model.counts ||= {};
  if (!model.counts[v.root]) {
    // language rows that can be entries: a suffix, not noindex; by markets value
    const groups = new Map();
    v.index.forEach((row, p) => {
      const suffix = p.slice(v.root.length + 1);
      if (!suffix || /noindex/i.test(row.robots)) return;
      const g = groups.get(row.markets) || { all: 0, languageOnly: 0 };
      g.all += 1;
      if (suffix === '/' || LANGUAGE_ONLY.test(suffix)) g.languageOnly += 1;
      groups.set(row.markets, g);
    });
    // own rows by market root
    const own = new Map();
    model.own.forEach((row, p) => {
      const m = p.match(/^\/([a-z]{2}\/[a-z]{2})\//);
      if (!m) return;
      if (!own.has(m[1])) own.set(m[1], []);
      own.get(m[1]).push([p, row]);
    });
    model.counts[v.root] = { groups, own };
  }
  const { groups, own } = model.counts[v.root];
  if (!model.roots.includes(root)) return (own.get(root) || []).filter(([p, row]) => !NOT_PAGES.test(p) && !/noindex/i.test(row.robots)).length;
  const cc = root.split('/')[0];
  let count = 0;
  groups.forEach((g, markets) => {
    count += !markets || marketAllows(markets, cc) ? g.all : g.languageOnly;
  });
  (own.get(root) || []).forEach(([p, row]) => {
    const suffix = p.slice(root.length + 1);
    // a language page the root has as its own document is no language entry
    const lang = v.index.get(`/${v.root}${suffix}`);
    if (lang && suffix && !/noindex/i.test(lang.robots) && (suffix === '/' || LANGUAGE_ONLY.test(suffix) || !lang.markets || marketAllows(lang.markets, cc))) count -= 1;
    if (!NOT_PAGES.test(p) && !/noindex/i.test(row.robots)) count += 1;
  });
  return count;
}

/** The sitemap file names of a market root: sitemap_lh_<cc>_<ll>, then _2, _3 … */
export async function sitemapNames(request, env, root, given = null) {
  const model = given || await marketModel(request, env);
  const pages = Math.max(1, Math.ceil(sitemapCount(model, root) / sitemapPage(model, env)));
  const base = `sitemap_lh_${root.replace('/', '_')}`;
  return Array.from({ length: pages }, (x, i) => (i ? `${base}_${i + 1}` : base));
}

/**
 * One XML sitemap file of a market root (helix-sitemap.yaml's format, URLs on www without
 * .html), sitemapPage() URLs each (page 1: sitemap_lh_<cc>_<ll>.xml, then _2, _3 …), or null
 * past the last. Alternates are made for the file's own URLs only.
 */
export async function marketSitemapXml(request, env, root, page = 1) {
  const model = await marketModel(request, env);
  const { lang } = LOCALE_TABLE[root];
  const www = `https://${env.WWW_HOST || 'www.lufthansa.com'}`;
  const wwwEscaped = xmlEscape(www);
  const per = sitemapPage(model, env);
  const slice = sitemapEntries(model, root).slice((page - 1) * per, page * per);
  if (page > 1 && !slice.length) return null;
  // one list of lines (a file has thousands of alternates)
  const lines = [];
  slice.forEach((e) => {
    const alts = e.language
      ? alternates(model, lang, e.suffix)
      : [{ hreflang: LOCALE_TABLE[root].hreflang, path: e.path }];
    const lastmod = day(e.lastModified);
    lines.push('  <url>', `    <loc>${xmlEscape(`${www}${e.path}`)}</loc>`);
    if (lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`);
    const escaped = new Map();
    alts.forEach((a) => {
      let href;
      if (a.root !== undefined) {
        if (!escaped.has(a.suffix)) escaped.set(a.suffix, xmlEscape(a.suffix));
        href = `${wwwEscaped}/${a.root}${escaped.get(a.suffix)}`;
      } else {
        href = xmlEscape(`${www}${a.path}`);
      }
      lines.push(`    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${href}"/>`);
    });
    lines.push('  </url>');
  });
  return `<?xml version="1.0" encoding="utf-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${lines.join('\n')}\n</urlset>\n`;
}

/** The sitemap index (the origin's static file) with the served market roots' files added. */
export async function sitemapIndexXml(request, env, roots) {
  const resp = await originFetch(withoutConditions(request, 'GET'), env, `https://${env.ORIGIN}/sitemap/sitemap_lh.xml`);
  if (!resp.ok) return null;
  const xml = await resp.text();
  const items = [...xml.matchAll(/<sitemap>[\s\S]*?<\/sitemap>/g)].map((m) => m[0]);
  if (!items.length) return xml;
  const www = `https://${env.WWW_HOST || 'www.lufthansa.com'}`;
  const loc = (item) => (item.match(/<loc>([^<]*)<\/loc>/) || [])[1] || '';
  const have = new Set(items.map(loc));
  const model = await marketModel(request, env);
  const names = await Promise.all(roots.map((r) => sitemapNames(request, env, r, model)));
  names.flat().forEach((n) => {
    const u = `${www}/sitemap/${n}.xml.gz`;
    if (!have.has(u)) items.push(`<sitemap><loc>${u}</loc></sitemap>`);
  });
  // www's order: by root, the numbered files after the root's first
  const key = (item) => loc(item).replace(/\.xml\.gz$/, '')
    .replace(/_(\d+)$/, (m, n) => `~${n.padStart(4, '0')}`);
  items.sort((a, b) => key(a).localeCompare(key(b)));
  const start = xml.indexOf('<sitemap>');
  const end = xml.lastIndexOf('</sitemap>') + '</sitemap>'.length;
  return `${xml.slice(0, start)}${items.join('')}${xml.slice(end)}`;
}

const SITEMAP = /^\/sitemap\/sitemap_lh(?:_([a-z]{2})_([a-z]{2})(?:_(\d+))?)?\.xml(\.gz)?$/;

/** Whether a path is a sitemap this module may generate (the index or a market root's). */
export function isMarketSitemapPath(pathname) {
  const m = pathname.match(SITEMAP);
  return Boolean(m) && (!m[1] || MARKET_ROOTS.includes(`${m[1]}/${m[2]}`));
}

const SITEMAP_TTL = 3600;

/**
 * The sitemap route: generated where market roots are served (kept an hour in the edge cache),
 * else what the origin route gave before (fallback(request, env): the gzip route or the
 * pass-through).
 */
export async function marketSitemap(request, env, fallback, ctx) {
  const url = new URL(request.url);
  const m = url.pathname.match(SITEMAP);
  const roots = servedMarketRoots(request, env);
  const root = m[1] ? `${m[1]}/${m[2]}` : null;
  if (!roots.length || (root && !roots.includes(root))) return fallback(request, env);
  const page = m[3] ? Number(m[3]) : 1;
  if (m[3] && page < 2) return new Response('Not Found', { status: 404, headers: { 'x-lh-edge-route': 'market-sitemap' } });
  const gz = Boolean(m[4]);
  const cache = typeof caches !== 'undefined' ? caches.default : null;
  // the public host in the key: the answer depends on it (a CDN in front calls lh-edge under
  // lh-edge's own host)
  const cacheKey = new Request(`${url.origin}${url.pathname}?market-sitemap=2&host=${encodeURIComponent(publicHost(request, env))}`);
  const hit = cache && request.method === 'GET' && await cache.match(cacheKey);
  if (hit) return hit;
  let xml;
  try {
    if (root) xml = await marketSitemapXml(request, env, root, page);
    else xml = await sitemapIndexXml(request, env, roots);
  } catch (e) {
    return unavailable();
  }
  if (xml === null) {
    return root ? new Response('Not Found', { status: 404, headers: { 'x-lh-edge-route': 'market-sitemap' } }) : fallback(request, env);
  }
  const headers = {
    'content-type': gz ? 'application/octet-stream' : 'application/xml',
    'cache-control': `public, max-age=${SITEMAP_TTL}`,
    'x-lh-edge-route': 'market-sitemap',
  };
  if (request.method === 'HEAD') return new Response(null, { headers });
  const { body } = new Response(xml);
  const resp = new Response(gz ? body.pipeThrough(new CompressionStream('gzip')) : body, { headers });
  if (cache && ctx && ctx.waitUntil) ctx.waitUntil(cache.put(cacheKey, resp.clone()));
  return resp;
}
