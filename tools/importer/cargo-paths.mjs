/* eslint-disable no-console, max-len, import/prefer-default-export, no-use-before-define -- tooling */
/**
 * Lufthansa Cargo's paths (lh-cargo): www.lufthansa-cargo.com's URL -> the Edge Delivery path.
 * Cargo's paths stay as on the source (/en/..., /de/...); articles (/<lang>/-/<url title>, Liferay's
 * asset publisher) move to /<lang>/news/<slug> (the source has no /news path), as Edge Delivery
 * can't keep a '-' segment, dots, %-escapes, underscores or trailing hyphens. The slug: the url
 * title decoded, a leading language folder dropped (/de/-//de/it-does-fly-54), German letters
 * spelled out (ä ae, ö oe, ü ue, ß ss), anything else not a-z or 0-9 a hyphen, no hyphen at
 * either end. The homepage stays at /<lang>/home; /<lang>/ and the source's redirects
 * (REDIRECT_ONLY) become rows of lh-cargo's /redirects sheet.
 * Scope: the delivery's urls-all.tsv plus tools/importer/cargo-extra-urls.tsv (public Cargo pages
 * the list lacks, e.g. the 2025 transport stories the story hubs link). A page that www answers
 * with a redirect to another page in scope (cargo-capture.mjs) has no document: its path leads to
 * that page.
 *
 * CLI: node tools/importer/cargo-paths.mjs [--tsv content-sites/lh-cargo/delivery/urls-all.tsv]
 *   writes content-sites/lh-cargo/paths.json (source path -> Edge Delivery path, every in-scope
 *   page) and the redirects of the pages imported so far (a document in content-sites/lh-cargo/
 *   content): content-sites/lh-cargo/content/redirects.json (the sheet) and its public copy
 *   tools/importer/cargo-redirects.json (Source, Destination); fails on a collision.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const HOST = 'https://www.lufthansa-cargo.com';
export const LANGS = ['en', 'de'];

/** Source pages that are redirects only (no document of their own): source path -> target. */
export const REDIRECT_ONLY = {
  '/en/': '/en/home',
  '/de/': '/de/home',
  '/en/newsroom': '/en/ci/newsroom',
  '/en/footer/bottomnav/privacy': '/en/data-protection',
};

/** Language-less addresses of the source (logo, footer links) -> the English page. */
export const LANGUAGE_LESS = {
  '/home': '/en/home',
  '/footer/bottomnav/imprint': '/en/footer/bottomnav/imprint',
  '/data-protection': '/en/data-protection',
  '/footer/bottomnav/terms-of-use': '/en/footer/bottomnav/terms-of-use',
  '/meta/meta/company/general-terms': '/en/meta/meta/company/general-terms',
};

const GERMAN = {
  ä: 'ae', ö: 'oe', ü: 'ue', Ä: 'ae', Ö: 'oe', Ü: 'ue', ß: 'ss',
};

/** A path segment as Edge Delivery keeps it. */
export function slug(text) {
  let s = text;
  try { s = decodeURIComponent(text); } catch (e) { /* keep the raw text */ }
  return s.replace(/[äöüÄÖÜß]/g, (c) => GERMAN[c]).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** The source path of a URL (absolute or site-relative), without query, hash and trailing slash (but '/en/'). */
export function sourcePath(url) {
  const u = new URL(url, `${HOST}/`);
  const p = u.pathname;
  return /^\/[a-z]{2}\/$/.test(p) ? p : p.replace(/\/+$/, '') || '/';
}

/** Whether a source path is an article (/<lang>/-/<url title>). */
export const isArticle = (p) => /^\/[a-z]{2}\/-\//.test(p);

/** The Edge Delivery path of a source path (pages; redirects resolve to their target). */
export function edsPath(source) {
  const p = sourcePath(source);
  if (REDIRECT_ONLY[p]) return REDIRECT_ONLY[p];
  if (LANGUAGE_LESS[p]) return LANGUAGE_LESS[p];
  const m = p.match(/^\/([a-z]{2})\/-\/+(.*)$/);
  if (m) {
    const title = m[2].replace(/^(?:en|de)\/+/, '');
    return `/${m[1]}/news/${slug(title)}`;
  }
  return p.split('/').map((seg, i) => (i === 0 ? '' : slug(seg))).join('/');
}

const readTsv = (f) => {
  const [head, ...rows] = fs.readFileSync(f, 'utf8').split(/\r?\n/).filter(Boolean).map((l) => l.split('\t'));
  return rows.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] || ''])));
};

export const EXTRA_URLS = path.join(path.dirname(fileURLToPath(import.meta.url)), 'cargo-extra-urls.tsv');

/** The in-scope pages of urls-all.tsv and the extra list: [{ source, eds, lang, row }], redirects-only rows apart. */
export function scopePages(tsvFile, extraFile = EXTRA_URLS) {
  const all = [...readTsv(tsvFile), ...(fs.existsSync(extraFile) ? readTsv(extraFile) : [])];
  const known = new Set();
  const rows = all.filter((r) => {
    const p = sourcePath(r.url);
    if (r.in_out !== 'in' || known.has(p)) return false;
    known.add(p);
    return true;
  });
  const pages = [];
  const redirects = [];
  rows.forEach((row) => {
    const source = sourcePath(row.url);
    if (REDIRECT_ONLY[source]) redirects.push({ source, eds: REDIRECT_ONLY[source], row });
    else {
      pages.push({
        source, eds: edsPath(source), lang: row.language, row,
      });
    }
  });
  return { pages: resolveCollisions(pages), redirects, rows };
}

/**
 * Two source paths with the same slug (/en/-/ver-di-trade-union-strike and its twin with a
 * trailing hyphen, two articles): the one whose path needs no change keeps it (else the first in
 * list order), the others get -2, -3.
 */
export function resolveCollisions(pages) {
  const groups = new Map();
  pages.forEach((p) => groups.set(p.eds, [...(groups.get(p.eds) || []), p]));
  const taken = new Set(pages.map((p) => p.eds));
  groups.forEach((group, eds) => {
    if (group.length < 2) return;
    const keeper = group.find((p) => p.source.endsWith(eds.split('/').pop()) && !/-$/.test(p.source)) || group[0];
    let n = 2;
    group.filter((p) => p !== keeper).forEach((p) => {
      while (taken.has(`${eds}-${n}`)) n += 1;
      p.eds = `${eds}-${n}`;
      taken.add(p.eds);
    });
  });
  return pages;
}

/**
 * The /redirects sheet rows: every source path Edge Delivery can't keep (of the given pages), the
 * redirects, the language-less addresses.
 */
export function redirectRows(pages) {
  const rows = [];
  const seen = new Set();
  const add = (Source, Destination) => {
    if (Source === Destination || seen.has(Source)) return;
    seen.add(Source);
    rows.push({ Source, Destination });
  };
  pages.forEach(({ source, eds }) => add(source, eds));
  Object.entries(REDIRECT_ONLY).forEach(([s, d]) => add(s, d));
  // /en and /de without the slash, and the site root, as the source's '/' (-> /en/home)
  LANGS.forEach((l) => add(`/${l}`, `/${l}/home`));
  add('/', '/en/home');
  Object.entries(LANGUAGE_LESS).forEach(([s, d]) => add(s, d));
  return rows;
}

const main = () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const argv = process.argv.slice(2);
  const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
  const W = path.join(root, 'content-sites/lh-cargo');
  const { pages, redirects } = scopePages(path.resolve(root, opt('tsv', path.join(W, 'delivery/urls-all.tsv'))));
  // pages www redirects to another page in scope: their path leads there (no document)
  const capture = fs.existsSync(path.join(W, 'capture-state.json')) ? JSON.parse(fs.readFileSync(path.join(W, 'capture-state.json'), 'utf8')) : {};
  const edsOf = Object.fromEntries(pages.map((p) => [p.source, p.eds]));
  pages.forEach((p) => {
    const c = capture[p.source];
    if (c && c.status === 'redirect' && c.finalUrl && /lufthansa-cargo\.com/.test(c.finalUrl)) {
      const target = edsOf[sourcePath(c.finalUrl)];
      if (target && target !== p.eds) { p.eds = target; p.wwwRedirect = true; }
    }
  });
  const byEds = new Map();
  pages.filter((p) => !p.wwwRedirect).forEach((p) => byEds.set(p.eds, [...(byEds.get(p.eds) || []), p.source]));
  const clashes = [...byEds].filter(([, v]) => v.length > 1);
  if (clashes.length) {
    console.error('collisions:', JSON.stringify(clashes, null, 1));
    process.exit(1);
  }
  const map = Object.fromEntries(pages.map((p) => [p.source, p.eds]));
  fs.writeFileSync(path.join(W, 'paths.json'), `${JSON.stringify(map, null, 1)}\n`);
  // the rows of the pages imported so far (and of www's redirects to them)
  const imported = (p) => fs.existsSync(path.join(W, 'content', `${p.eds}.plain.html`));
  const data = redirectRows(pages.filter(imported));
  const sheet = {
    total: data.length, offset: 0, limit: data.length, data, ':type': 'sheet',
  };
  fs.mkdirSync(path.join(W, 'content'), { recursive: true });
  fs.writeFileSync(path.join(W, 'content/redirects.json'), `${JSON.stringify(sheet, null, 1)}\n`);
  fs.writeFileSync(path.join(root, 'tools/importer/cargo-redirects.json'), `${JSON.stringify(data, null, 1)}\n`);
  const moved = pages.filter((p) => p.source !== p.eds).length;
  console.log(`${pages.length} pages (${moved} with a new path), ${redirects.length} redirect-only rows, ${data.length} redirects`);
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
