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
/* eslint-disable import/no-relative-packages */
import { LOCALE_TABLE, LANGUAGE_VERSIONS } from '../../../../scripts/locale-table.js';
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
}

const listVar = (v) => String(v || '').split(',').map((h) => h.trim().toLowerCase()).filter(Boolean);

/** The market roots this request's host serves: live ones everywhere, pilot ones on PILOT_HOSTS. */
export function servedMarketRoots(request, env) {
  const host = publicHost(request, env).toLowerCase();
  const pilot = listVar(env.PILOT_HOSTS).includes(host);
  return MARKET_ROOTS.filter((k) => LOCALE_TABLE[k].status === 'live' || (pilot && LOCALE_TABLE[k].status === 'pilot'));
}

/** Whether a `markets` value allows a country (include "de, at", exclude "-ch, -us", empty all). */
export function marketAllows(value, cc) {
  const items = String(value || '').toLowerCase().split(/[\s,;]+/).filter(Boolean);
  const exclude = items.filter((i) => i.startsWith('-')).map((i) => i.slice(1));
  const include = items.filter((i) => !i.startsWith('-'));
  if (exclude.includes(cc)) return false;
  return !include.length || include.includes(cc);
}

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
 * The paths of a root's search index (a Set), a minute per isolate: read with a scan for the
 * path values instead of JSON.parse (an index is about a megabyte; the scan takes a fifth of the
 * CPU time), for the hreflang of roots with their own documents (at/de, gb/en).
 */
async function pathIndex(request, env, root) {
  const key = `${env.ORIGIN}/${root}/search-index.json#paths`;
  const cached = indexes.get(key);
  if (cached && Date.now() - cached.at < INDEX_TTL_MS) return cached.index;
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
  indexes.set(key, { at: Date.now(), index });
  return index;
}

// roots with every page as their own document besides the language versions (at/de, gb/en):
// listed in the hreflang of market copies where their index has the page (same path, as
// helix-sitemap.yaml pairs them)
const OWN_ROOTS = Object.keys(LOCALE_TABLE).filter((k) => LOCALE_TABLE[k].documents === 'own'
  && LOCALE_TABLE[k].status === 'live' && !Object.values(LANGUAGE_VERSIONS).includes(k));

/** A compact index (path -> {markets, robots, primary, lastModified}), a minute per isolate. */
async function compactIndex(request, env, path) {
  const key = `${env.ORIGIN}${path}`;
  const cached = indexes.get(key);
  if (cached && Date.now() - cached.at < INDEX_TTL_MS) return cached.index;
  const all = await sheetRows(request, env, path);
  const index = new Map();
  (all ? all.rows : []).forEach((r) => {
    if (!r || typeof r.path !== 'string') return;
    index.set(r.path, {
      markets: r.markets || '', robots: r.robots || '', primary: r['primary-language-url'] || '', lastModified: r.lastModified || '',
    });
  });
  indexes.set(key, { at: Date.now(), index });
  return index;
}

/**
 * What the served market roots have: {roots, versions: {lang: {root, index, byPrimary}}, own,
 * others: {root: Set of paths}}. own: the market roots' own documents (the market index; empty
 * while it has no rows); others: the roots with their own documents of the same languages.
 */
export async function marketModel(request, env, roots = servedMarketRoots(request, env)) {
  const langs = [...new Set(roots.map((r) => LOCALE_TABLE[r].lang))];
  const versions = {};
  await Promise.all(langs.map(async (lang) => {
    const root = LANGUAGE_VERSIONS[lang];
    const index = await compactIndex(request, env, `/${root}/search-index.json`);
    const byPrimary = new Map();
    index.forEach((row, p) => { if (row.primary) byPrimary.set(row.primary, p); });
    versions[lang] = { root, index, byPrimary };
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

/** Whether a market root serves a path after its prefix ('' is the root itself). */
export function serves(model, root, suffix) {
  if (!model.roots.includes(root)) return false;
  if (!suffix || suffix === '/') return true;
  if (model.own.has(`/${root}${suffix}`)) return true;
  if (LANGUAGE_ONLY.test(suffix)) return true;
  const v = model.versions[LOCALE_TABLE[root].lang];
  const row = v && v.index.get(`/${v.root}${suffix}`);
  return Boolean(row) && marketAllows(row.markets, root.split('/')[0]);
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
    if (model.versions[l].index.has(`/${version}${s}`)) out.push({ hreflang: LOCALE_TABLE[version].hreflang, path: `/${version}${s}` });
    Object.entries(model.others || {}).filter(([r, paths]) => LOCALE_TABLE[r].lang === l && paths.has(`/${r}${s}`))
      .forEach(([r]) => out.push({ hreflang: LOCALE_TABLE[r].hreflang, path: `/${r}${s}` }));
    model.roots.filter((r) => LOCALE_TABLE[r].lang === l && serves(model, r, s))
      .forEach((r) => out.push({ hreflang: LOCALE_TABLE[r].hreflang, path: `/${r}${s}` }));
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
export function marketHref(href, {
  from, to, allowed, hosts, www = 'www.lufthansa.com',
}) {
  const raw = String(href || '');
  const prefix = from.replace('/', '\\/');
  const onWww = raw.match(new RegExp(`^https://${www.replace(/\./g, '\\.')}/${prefix}((?:/[^?#]*)?)([?#].*)?$`));
  if (onWww) return `https://${www}/${to}${onWww[1]}${onWww[2] || ''}`;
  let v = raw.replace(hosts, '');
  if (v === '' && raw !== '') v = '/';
  const m = v.match(new RegExp(`^/${prefix}((?:/[^?#]*)?)([?#].*)?$`));
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
    const moved = await originFetch(request, env, `https://${env.ORIGIN}/${from}${rest}`);
    const location = moved.headers.get('location');
    if (![301, 302, 307, 308].includes(moved.status) || !location) return own;
    const target = marketHref(location, ctx) ?? location;
    return new Response(null, {
      status: moved.status,
      headers: { location: target, 'cache-control': moved.headers.get('cache-control') || 'max-age=60', 'x-lh-edge-route': 'market' },
    });
  }
  const doc = await originFetch(request, env, `https://${env.ORIGIN}/${from}${rest}`);
  if (!doc.ok) return own;
  const headers = new Headers(doc.headers);
  headers.set('x-lh-edge-route', 'market');
  headers.delete('content-length');
  if (request.method === 'HEAD') return new Response(null, { status: doc.status, headers });
  // the page's own markets metadata counts at once (the index takes it on publish)
  const html = await doc.text();
  const meta = kind === 'page' && html.match(/<meta name="markets" content="([^"]*)"/);
  if (meta && !marketAllows(meta[1], root.split('/')[0])) return own;
  const resp = new Response(html, { status: doc.status, headers });
  return marketHtml(resp, {
    ...ctx,
    marketPath: `/${root}${suffix}`,
    alternates: kind === 'page' ? alternates(model, LOCALE_TABLE[root].lang, suffix) : [],
  });
}

const xmlEscape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const day = (lastModified) => {
  const n = Number(lastModified);
  return Number.isFinite(n) && n > 0 ? new Date(n * 1000).toISOString().slice(0, 10) : '';
};

/**
 * The XML sitemap of a market root (helix-sitemap.yaml's format, URLs on www without .html):
 * the language pages it serves and its own pages, without the noindex ones (page-robots).
 */
export async function marketSitemapXml(request, env, root) {
  const model = await marketModel(request, env);
  const { lang } = LOCALE_TABLE[root];
  const v = model.versions[lang];
  const www = `https://${env.WWW_HOST || 'www.lufthansa.com'}`;
  const entries = new Map();
  v.index.forEach((row, p) => {
    const suffix = p.slice(v.root.length + 1);
    if (!suffix || /noindex/i.test(row.robots) || !serves(model, root, suffix) || model.own.has(`/${root}${suffix}`)) return;
    entries.set(`/${root}${suffix}`, { lastmod: day(row.lastModified), alternates: alternates(model, lang, suffix) });
  });
  model.own.forEach((row, p) => {
    if (!p.startsWith(`/${root}/`) || NOT_PAGES.test(p) || /noindex/i.test(row.robots)) return;
    const suffix = p.slice(root.length + 1);
    const alts = v.index.has(`/${v.root}${suffix}`) ? alternates(model, lang, suffix) : [{ hreflang: LOCALE_TABLE[root].hreflang, path: p }];
    entries.set(p, { lastmod: day(row.lastModified), alternates: alts });
  });
  const urls = [...entries.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([p, e]) => [
    '  <url>',
    `    <loc>${xmlEscape(`${www}${p}`)}</loc>`,
    ...(e.lastmod ? [`    <lastmod>${e.lastmod}</lastmod>`] : []),
    ...e.alternates.map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${xmlEscape(`${www}${a.path}`)}"/>`),
    '  </url>',
  ].join('\n'));
  return `<?xml version="1.0" encoding="utf-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`;
}

/** The sitemap index (the origin's static file) with the served market roots' sitemaps added. */
export async function sitemapIndexXml(request, env, roots) {
  const resp = await originFetch(new Request(request.url, { method: 'GET', headers: request.headers }), env, `https://${env.ORIGIN}/sitemap/sitemap_lh.xml`);
  if (!resp.ok) return null;
  const xml = await resp.text();
  const items = [...xml.matchAll(/<sitemap>[\s\S]*?<\/sitemap>/g)].map((m) => m[0]);
  if (!items.length) return xml;
  const www = `https://${env.WWW_HOST || 'www.lufthansa.com'}`;
  const loc = (item) => (item.match(/<loc>([^<]*)<\/loc>/) || [])[1] || '';
  const have = new Set(items.map(loc));
  roots.forEach((r) => {
    const u = `${www}/sitemap/sitemap_lh_${r.replace('/', '_')}.xml.gz`;
    if (!have.has(u)) items.push(`<sitemap><loc>${u}</loc></sitemap>`);
  });
  items.sort((a, b) => loc(a).localeCompare(loc(b)));
  const start = xml.indexOf('<sitemap>');
  const end = xml.lastIndexOf('</sitemap>') + '</sitemap>'.length;
  return `${xml.slice(0, start)}${items.join('')}${xml.slice(end)}`;
}

const SITEMAP = /^\/sitemap\/sitemap_lh(?:_([a-z]{2})_([a-z]{2}))?\.xml(\.gz)?$/;

/** Whether a path is a sitemap this module may generate (the index or a market root's). */
export function isMarketSitemapPath(pathname) {
  const m = pathname.match(SITEMAP);
  return Boolean(m) && (!m[1] || MARKET_ROOTS.includes(`${m[1]}/${m[2]}`));
}

/**
 * The sitemap route: generated where market roots are served, else what the origin route gave
 * before (fallback(request, env): the gzip route or the pass-through).
 */
export async function marketSitemap(request, env, fallback) {
  const m = new URL(request.url).pathname.match(SITEMAP);
  const roots = servedMarketRoots(request, env);
  const root = m[1] ? `${m[1]}/${m[2]}` : null;
  if (!roots.length || (root && !roots.includes(root))) return fallback(request, env);
  let xml;
  try {
    xml = root
      ? await marketSitemapXml(request, env, root)
      : await sitemapIndexXml(request, env, roots);
  } catch (e) {
    return unavailable();
  }
  if (xml === null) return fallback(request, env);
  const gz = Boolean(m[3]);
  const headers = {
    'content-type': gz ? 'application/octet-stream' : 'application/xml',
    'cache-control': 'public, max-age=14400',
    'x-lh-edge-route': 'market-sitemap',
  };
  if (request.method === 'HEAD') return new Response(null, { headers });
  const { body } = new Response(xml);
  return new Response(gz ? body.pipeThrough(new CompressionStream('gzip')) : body, { headers });
}
