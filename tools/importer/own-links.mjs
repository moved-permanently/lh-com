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
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
/* eslint-disable import/no-relative-packages, import/extensions */
import { BRAND_SITES } from '../../scripts/brands.js';
import { marketAllows } from '../../scripts/market-rules.js';
/* eslint-enable import/no-relative-packages, import/extensions */

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const walk = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])) : []);

// the brand of each site (scripts/brands.js BRAND_SITES: its roots and language versions)
const BRAND_OF = { 'lh-ita': 'ita', 'lh-austrian': 'austrian', 'lh-discover': 'discover' };

/**
 * The site's pages: its documents, and the market roots' pages lh-edge answers from a language
 * version's document, by lh-edge's rule (scripts/market-rules.js marketAllows: the document's
 * `markets` row lists the root or its country; no row or an empty one: every market root of the
 * language).
 */
export function ownPages(site) {
  const dir = path.join(root, 'content-sites', site, 'content');
  const brand = BRAND_SITES[BRAND_OF[site]] || { rows: {}, versions: {} };
  const versions = Object.entries(brand.versions);
  const marketsOf = (lang) => Object.keys(brand.rows).filter((r) => brand.rows[r].documents === 'language' && brand.rows[r].lang === lang);
  const pages = new Set();
  walk(dir).filter((f) => f.endsWith('.plain.html')).forEach((f) => {
    const p = `/${path.relative(dir, f).replace(/\.plain\.html$/, '')}`;
    pages.add(p);
    const m = p.match(/^\/([a-z]{2}\/[a-z]{2})(\/.*)$/);
    const version = m && versions.find(([, r]) => r === m[1]);
    if (!version || /^\/(nav|footer)$/.test(m[2])) return;
    const html = fs.readFileSync(f, 'utf8');
    const row = html.match(/<div><div>markets<\/div><div>([^<]*)<\/div><\/div>/i);
    marketsOf(version[0]).filter((r) => marketAllows(row ? row[1] : '', r.split('/')[0]))
      .forEach((r) => pages.add(`/${r}${m[2]}`));
  });
  return pages;
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

/**
 * A document with its www links to the site's pages relative. Returns the document and the
 * counts: made (links made relative), kept {reason: count}, examples {reason: [paths]}.
 */
export function withOwnLinks(doc, host, pages) {
  const made = { href: 0, text: 0, back: 0 };
  const kept = {};
  const examples = {};
  const esc = host.replace(/\./g, '\\.');
  const toSite = (url) => {
    let u;
    try { u = new URL(url.replace(/&amp;/g, '&')); } catch (e) { return null; }
    const p = sitePath(u.pathname);
    return pages.has(p) ? { rel: `${p}${u.search}${u.hash}`.replace(/&/g, '&amp;'), p } : { p };
  };
  let out = doc.replace(new RegExp(`href="(https?://${esc}[^"]*)"`, 'g'), (m, url) => {
    const t = toSite(url);
    if (t && t.rel) {
      made.href += 1;
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
    if (pages.has(p) || !/^\/[a-z]{2}\/[a-z]{2}\//.test(p)) return m;
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
  const pages = ownPages(site);
  const dir = path.join(root, 'content-sites', site, 'content');
  const total = { href: 0, text: 0, back: 0 };
  const kept = {};
  const examples = {};
  const changed = [];
  walk(dir).filter((f) => f.endsWith('.plain.html')).forEach((f) => {
    const before = fs.readFileSync(f, 'utf8');
    const r = withOwnLinks(before, host, pages);
    total.href += r.made.href;
    total.text += r.made.text;
    total.back += r.made.back;
    Object.entries(r.kept).forEach(([k, n]) => { kept[k] = (kept[k] || 0) + n; });
    Object.entries(r.examples).forEach(([k, v]) => { (examples[k] ||= new Set()); v.forEach((x) => examples[k].add(x)); });
    if (r.doc !== before) {
      changed.push(`/${path.relative(dir, f).replace(/\.plain\.html$/, '')}`);
      if (argv.includes('--write')) fs.writeFileSync(f, r.doc);
    }
  });
  const report = {
    site, host, pages: pages.size, documentsChanged: changed.length, made: total, kept, examples: Object.fromEntries(Object.entries(examples).map(([k, v]) => [k, [...v].sort().slice(0, 40)])),
  };
  fs.mkdirSync(path.join(root, 'content-sites', site, 'runs'), { recursive: true });
  fs.writeFileSync(path.join(root, 'content-sites', site, 'runs', 'own-links.json'), `${JSON.stringify(report, null, 1)}\n`);
  if (argv.includes('--write')) fs.writeFileSync(path.join(root, 'content-sites', site, 'runs', 'own-links-upload.txt'), `${changed.join('\n')}\n`);
  console.log(`${site}: ${pages.size} pages; ${changed.length} documents ${argv.includes('--write') ? 'changed' : 'would change'}; made relative: ${total.href} links, ${total.text} link texts; back to www: ${total.back}; kept on www: ${JSON.stringify(kept)}`);
}
