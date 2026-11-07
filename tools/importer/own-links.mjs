/* eslint-disable max-len, no-console -- tooling */
/**
 * Links to the brand site's own pages stay on the site (lh-ita, lh-austrian): an absolute link to
 * the source www (https://www.ita-airways.com/it/en/x, .../x.html, .../x/) whose page the site has
 * becomes relative (/it/en/x, query and fragment kept), in href and in link text that is the URL
 * itself (the Parent metadata row: Edge Delivery takes its text into <meta name="parent">, the
 * breadcrumb's links). The site has a page when its document exists (ownPages: the documents of
 * content-sites/<site>/content) or when lh-edge answers it on a market root from the language
 * version's document (/ch/fr/x from /fr/fr/x: its `markets` row allows the root, by lh-edge's
 * own rule).
 * Everything else stays on www, counted by reason (keptReason).
 * Used by ita-import.mjs and austrian-import.mjs after site-postprocess.mjs, and by hand:
 *   node tools/importer/own-links.mjs --site lh-ita --host www.ita-airways.com [--write]
 *     [--content-dir <tree>] (default content-sites/<site>/content; the report in runs/ beside it)
 *     [--with-markets <list>] (add-market-roots.mjs's list: the pages counted with those roots
 *       added to the rows, as the tool writes them, before the local documents have them)
 *     [--only <list>] (the documents changed and written: the list's paths, one per line, alone)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
/* eslint-disable import/no-relative-packages, import/extensions */
import { BRAND_SITES } from '../../scripts/brands.js';
import { marketAllows } from '../../scripts/market-rules.js';
import { addRoots, readList } from './add-market-roots.mjs';
/* eslint-enable import/no-relative-packages, import/extensions */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const walk = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])) : []);

// the brand of each site (scripts/brands.js BRAND_SITES: its roots and language versions)
const BRAND_OF = {
  'lh-ita': 'ita', 'lh-austrian': 'austrian', 'lh-discover': 'discover', 'lh-brussels': 'brussels', 'lh-b2b': 'b2b', 'lh-swiss': 'swiss',
};

/**
 * Whether a document's change only made links relative (every href that differs went from an
 * absolute URL to a site path), nothing else.
 */
export function onlyMadeRelative(before, after) {
  const hrefs = (h) => [...h.matchAll(/href="([^"]*)"/g)].map((m) => m[1]);
  const a = hrefs(before);
  const b = hrefs(after);
  if (a.length !== b.length) return false;
  const rest = (h) => h.replace(/href="[^"]*"/g, 'href=""');
  return rest(before) === rest(after) && a.every((x, i) => x === b[i] || (/^https?:\/\//.test(x) && b[i].startsWith('/')));
}

/**
 * The site paths DA's version of a document links relative that the local version links on a
 * www host instead (an upload would take them back to www: links another session changed in DA,
 * e.g. ITA's footers' /<root>/profile/travel-id, Austrian's navs' /<root>/login).
 */
export function linksTakenBack(daHtml, localHtml, keepWww = []) {
  const hrefs = (h) => [...h.matchAll(/href="([^"]*)"/g)].map((m) => m[1].replace(/&amp;|&#x26;/g, '&'));
  const local = hrefs(localHtml);
  const localSet = new Set(local);
  // keepWww: path prefixes whose links may go back to www (a wrong relative link fixed, brief 453)
  return [...new Set(hrefs(daHtml).filter((h) => h.startsWith('/') && !h.startsWith('//') && !keepWww.some((k) => h.startsWith(k))))]
    .filter((h) => !localSet.has(h) && local.some((l) => /^https?:\/\/[^/]+\//.test(l) && l.replace(/^https?:\/\/[^/]+/, '') === h));
}

/**
 * Runs a step over a site's documents (site-postprocess.mjs's step 3 rewrites every document) and
 * puts back each document outside `keep` (an import batch's paths) that it changed in any other
 * way than making links relative (links to the batch's new pages): an import never takes a link of
 * an earlier run or of another session back to www (a footer's /<root>/profile/... links, a nav's
 * /<root>/login, which DA has relative and the step made www links again).
 * Returns the step's result and the paths put back.
 */
export function onlyBatch(site, keep, step) {
  const dir = path.join(root, 'content-sites', site, 'content');
  const before = new Map(walk(dir).filter((f) => f.endsWith('.plain.html'))
    .map((f) => [`/${path.relative(dir, f).replace(/\.plain\.html$/, '')}`, fs.readFileSync(f, 'utf8')])
    .filter(([p]) => !keep.has(p)));
  const result = step();
  const restored = [];
  before.forEach((doc, p) => {
    const f = path.join(dir, `${p}.plain.html`);
    const now = fs.readFileSync(f, 'utf8');
    if (now === doc || onlyMadeRelative(doc, now)) return;
    fs.writeFileSync(f, doc);
    restored.push(p);
  });
  return { result, restored };
}

/**
 * The site's pages: its documents, and the market roots' pages lh-edge answers from a language
 * version's document, by lh-edge's rule (scripts/market-rules.js marketAllows: the document's
 * `markets` row lists the root or its country; no row or an empty one: every market root of the
 * language). withMarkets: path -> roots added to the document's row (add-market-roots.mjs's rule);
 * dir: the document tree (default content-sites/<site>/content).
 */
export function ownPages(site, { withMarkets = new Map(), dir = path.join(root, 'content-sites', site, 'content') } = {}) {
  const brand = BRAND_SITES[BRAND_OF[site]] || { rows: {}, versions: {} };
  const versions = Object.entries(brand.versions);
  const marketsOf = (lang) => Object.keys(brand.rows).filter((r) => brand.rows[r].documents === 'language' && brand.rows[r].lang === lang);
  const pages = new Set();
  walk(dir).filter((f) => f.endsWith('.plain.html')).forEach((f) => {
    const p = `/${path.relative(dir, f).replace(/\.plain\.html$/, '')}`;
    pages.add(p);
    const m = p.match(/^\/([a-z]{2}\/[a-z]{2})(\/.*)$/);
    if (!m || /^\/(nav|footer)$/.test(m[2])) return;
    const version = versions.find(([, r]) => r === m[1]);
    const read = fs.readFileSync(f, 'utf8');
    const html = withMarkets.has(p) ? addRoots(read, withMarkets.get(p)).html : read;
    const row = html.match(/<div><div>markets<\/div><div>([^<]*)<\/div><\/div>/i);
    if (!version) {
      // a document of another root (lh-b2b's rest-of-world documents on xx/<ll>, a market root's
      // own document) whose markets row lists roots: those roots' pages too
      if (row) row[1].split(/[\s,;]+/).filter((x) => /^[a-z]{2}\/[a-z]{2}$/.test(x)).forEach((r) => pages.add(`/${r}${m[2]}`));
      return;
    }
    marketsOf(version[0]).filter((r) => marketAllows(row ? row[1] : '', r.split('/')[0]))
      .forEach((r) => pages.add(`/${r}${m[2]}`));
  });
  return pages;
}

/**
 * The site's aliases: www paths outside its sitemap that stand for one of its pages (www's own
 * redirect or the page's canonical, read by austrian-resolve.mjs): tools/importer/sites/<site>-aliases.json
 * {"www path": "site path"}; none: an empty map.
 */
export function ownAliases(site) {
  const f = path.join(root, 'tools/importer/sites', `${site}-aliases.json`);
  return new Map(fs.existsSync(f) ? Object.entries(JSON.parse(fs.readFileSync(f, 'utf8'))) : []);
}

/**
 * The site's link-out documents: tools/importer/sites/<site>.json linkOuts (pages where www runs an
 * app or widget the site links to; site-postprocess.mjs keeps their link to www).
 */
export function ownLinkOuts(site) {
  const f = path.join(root, 'tools/importer/sites', `${site}.json`);
  return new Set(fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')).linkOuts || [] : []);
}

/**
 * The paths the site's host serves without a document of the site (an app's pages, a deep link
 * lh-edge answers): tools/importer/sites/<site>.json served, e.g. "/deeplink/cockpit",
 * "/{root}/profile/login", "/{root}/profile/my-account/**" ({root}: one of the brand's roots,
 * scripts/brands.js; /**: the path and every path under it). A www link to one becomes relative
 * (the same path, query and fragment). None: an empty list, links as before.
 * @returns {RegExp[]}
 */
export function ownServed(site) {
  const f = path.join(root, 'tools/importer/sites', `${site}.json`);
  const list = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')).served || [] : [];
  const roots = Object.keys((BRAND_SITES[BRAND_OF[site]] || { rows: {} }).rows);
  const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, (c) => `\\${c}`);
  return list.map((p) => {
    const under = p.endsWith('/**');
    const body = esc(under ? p.slice(0, -3) : p).split(esc('{root}')).join(`(?:${roots.map(esc).join('|')})`);
    return new RegExp(`^${body}${under ? '(?:/.*)?' : ''}$`);
  });
}

/** The site path of a www URL's path (.html and a trailing slash dropped), or ''. */
export function sitePath(pathname) {
  let p = pathname;
  try { p = decodeURI(p); } catch (e) { /* as it is */ }
  p = p.replace(/\/+$/, '').replace(/\.html$/, '');
  return p;
}

/** Why a www link stays on www (pages the site doesn't have). */
export function keptReason(p, pages) {
  if (!p || p === '/') return 'www root';
  if (/^\/lhg(\/|$)/.test(p)) return '/lhg/ (not migrated)';
  if (/^\/content\/dam\//.test(p)) return 'files on www (the DAM step: 404 there or on AEM)';
  if (/^\/(deeplink|service|apps|bin|libs|etc|content\/(ita|aua|os))\//.test(p) || /^\/(deeplink|service)$/.test(p)) return 'deeplinks and services (booking, my bookings, app hand-offs)';
  if (!/^\/[a-z]{2}\/[a-z]{2}(\/|$)/.test(p)) return 'other www paths (no <cc>/<ll> root)';
  if (/^\/[a-z]{2}\/[a-z]{2}$/.test(p)) return pages.has(`${p}/homepage`) ? 'root without page (www redirects it)' : 'root the site lacks';
  const rest = p.replace(/^\/[a-z]{2}\/[a-z]{2}/, '');
  if (/^\/(login|profile|profilelogin|anmeldung|passwort-vergessen|validate-mail-token|configuration)(\/|$)/i.test(rest) || /\/bookinglist$/.test(rest)) return 'login and profile (app shells, left out)';
  const r = p.split('/').slice(1, 3).join('/');
  if (![...pages].some((x) => x.startsWith(`/${r}/`))) return 'root the site lacks';
  return 'pages not in the site (left out or not on www)';
}

const LINK_OUT = 'the page\'s own link out to www (its app or widget)';

/**
 * A document with its www links to the site's pages relative. Returns the document and the
 * counts: made (links made relative), kept {reason: count}, examples {reason: [paths]}.
 * linkOut: the document's own path when it is one of the allowlist's linkOuts (www runs an app
 * or widget there and the document links to it, as site-postprocess.mjs keeps it): its link to
 * that page stays on www, and one an earlier run made relative goes back.
 * served: ownServed's patterns, paths the host serves without a document (relative too).
 */
export function withOwnLinks(doc, host, pages, aliases = new Map(), { linkOut = null, served = [] } = {}) {
  const isServed = (p) => served.some((re) => re.test(p));
  const made = {
    href: 0, text: 0, back: 0, alias: 0,
  };
  const kept = {};
  const examples = {};
  const esc = host.replace(/\./g, '\\.');
  const toSite = (url) => {
    let u;
    try { u = new URL(url.replace(/&amp;/g, '&')); } catch (e) { return null; }
    const p = sitePath(u.pathname);
    // a path that stands for another page (an alias): that page, when the site has it
    const to = !pages.has(p) && aliases.has(p) && pages.has(aliases.get(p)) ? aliases.get(p) : p;
    return pages.has(to) || isServed(to) ? {
      rel: `${to}${u.search}${u.hash}`.replace(/&/g, '&amp;'), p, alias: to !== p,
    } : { p };
  };
  let out = doc.replace(new RegExp(`href="(https?://${esc}[^"]*)"`, 'g'), (m, url) => {
    const t = toSite(url);
    if (linkOut && t && t.p === linkOut && !/[?#]/.test(url)) {
      kept[LINK_OUT] = (kept[LINK_OUT] || 0) + 1;
      return m;
    }
    if (t && t.rel) {
      made.href += 1;
      if (t.alias) made.alias += 1;
      return `href="${t.rel}"`;
    }
    const reason = keptReason(t ? t.p : '', pages);
    kept[reason] = (kept[reason] || 0) + 1;
    (examples[reason] ||= new Set()).add(t ? t.p : url);
    return m;
  });
  // a relative link to a <cc>/<ll> page the site doesn't have (made relative by an earlier step:
  // ITA's xx/de, xx/el, at/de, be/nl, ch/de, roots lh-edge doesn't serve) goes back to www
  out = out.replace(/href="(\/[a-z]{2}\/[a-z]{2}\/[^"#?]*)([^"]*)"/g, (m, rel, rest) => {
    const p = sitePath(rel);
    const self = linkOut && p === linkOut && !rest;
    if (((pages.has(p) || isServed(p)) && !self) || !/^\/[a-z]{2}\/[a-z]{2}\//.test(p)) return m;
    made.back = (made.back || 0) + 1;
    return `href="https://${host}${rel}${rest}"`;
  });
  // link text that is a www URL of one of the site's pages (the Parent row's texts)
  out = out.replace(new RegExp(`(<a [^>]*>)(https?://${esc}[^<\\s]*)(</a>)`, 'g'), (m, open, url, close) => {
    const t = toSite(url);
    if (!t || !t.rel) return m;
    made.text += 1;
    return `${open}${t.rel}${close}`;
  });
  return {
    doc: out, made, kept, examples: Object.fromEntries(Object.entries(examples).map(([k, v]) => [k, [...v]])),
  };
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : '');
  const site = opt('site');
  const host = opt('host');
  if (!site || !host) {
    console.error('usage: node tools/importer/own-links.mjs --site lh-ita --host www.ita-airways.com [--write]');
    process.exit(1);
  }
  const dir = opt('content-dir') ? path.resolve(opt('content-dir')) : path.join(root, 'content-sites', site, 'content');
  const runs = path.join(dir, '..', 'runs');
  const withMarkets = new Map(opt('with-markets') ? readList(fs.readFileSync(opt('with-markets'), 'utf8')).map((d) => [d.path, d.roots]) : []);
  const only = opt('only') ? new Set(fs.readFileSync(opt('only'), 'utf8').split(/\r?\n/).map((l) => l.replace(/#.*/, '').trim().split(/\s+/)[0]).filter(Boolean)) : null;
  const pages = ownPages(site, { withMarkets, dir });
  const aliases = ownAliases(site);
  const linkOuts = ownLinkOuts(site);
  const served = ownServed(site);
  const total = {
    href: 0, text: 0, back: 0, alias: 0,
  };
  const kept = {};
  const examples = {};
  const changed = [];
  walk(dir).filter((f) => f.endsWith('.plain.html')).forEach((f) => {
    const p = `/${path.relative(dir, f).replace(/\.plain\.html$/, '')}`;
    if (only && !only.has(p)) return;
    const before = fs.readFileSync(f, 'utf8');
    const r = withOwnLinks(before, host, pages, aliases, { linkOut: linkOuts.has(p) ? p : null, served });
    total.href += r.made.href;
    total.text += r.made.text;
    total.back += r.made.back;
    total.alias += r.made.alias;
    Object.entries(r.kept).forEach(([k, n]) => { kept[k] = (kept[k] || 0) + n; });
    Object.entries(r.examples).forEach(([k, v]) => { (examples[k] ||= new Set()); v.forEach((x) => examples[k].add(x)); });
    if (r.doc !== before) {
      changed.push(p);
      if (argv.includes('--write')) fs.writeFileSync(f, r.doc);
    }
  });
  const report = {
    site, host, pages: pages.size, documentsChanged: changed.length, made: total, kept, examples: Object.fromEntries(Object.entries(examples).map(([k, v]) => [k, [...v].sort().slice(0, 40)])),
  };
  fs.mkdirSync(runs, { recursive: true });
  fs.writeFileSync(path.join(runs, 'own-links.json'), `${JSON.stringify(report, null, 1)}\n`);
  if (argv.includes('--write')) fs.writeFileSync(path.join(runs, 'own-links-upload.txt'), `${changed.join('\n')}\n`);
  console.log(`${site}: ${pages.size} pages; ${changed.length} documents ${argv.includes('--write') ? 'changed' : 'would change'}; made relative: ${total.href} links (${total.alias} by alias), ${total.text} link texts; back to www: ${total.back}; kept on www: ${JSON.stringify(kept)}`);
}
