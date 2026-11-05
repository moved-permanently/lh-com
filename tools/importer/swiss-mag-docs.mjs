/* eslint-disable no-console, max-len, import/extensions, import/no-extraneous-dependencies -- tooling */
/**
 * SWISS's magazine documents (lh-swiss /magazine/<ll>/, en and de) for www's own design
 * (styles/themes/swiss-magazine.css, briefs 400 and 403; SWISS parity rows 20 and 21). Each
 * document gets only what its kind needs (transformDocument, test/swiss-mag-docs.test.mjs):
 * - the home and the section pages (/magazine/<ll>, /magazine/<ll>/<section>: a hero, a heading
 *   and carousel-cards, then the lists): www's three sections: the hero; the Top Stories band
 *   (the heading and the carousel, section metadata Style grey); the lists. Each list whose Path is
 *   another page becomes a stories list (no pages) followed by www's link to that page ("More
 *   Stories", "Mehr Stories"). A category page's own list (Path = the page) keeps its pages.
 * - every overview page but the home and every article: its Parent row (the breadcrumb: the path
 *   one level up where that page exists, else further up, at most to the home).
 * - the navs (/magazine/<ll>/nav): www's white magazine logo (LOGO, uploaded once by da-upload)
 *   instead of www.swiss.com's red one.
 * What a document has already (a band, a stories list, a Parent, the logo) stays: the tool can run
 * again, e.g. after a re-import (tools/importer/swiss-magazine-import.mjs writes the documents
 * without these steps). Footer, contact and print pages are not touched.
 *
 * Usage:
 *   node tools/importer/swiss-mag-docs.mjs prepare --from da --out <dir> [--lang en,de] [--paths <file>]
 *   node tools/importer/swiss-mag-docs.mjs prepare --from <folder> --out <dir> [...]
 *     reads every magazine document (DA: admin.da.live's list and sources, GET only; a folder: its
 *     <path>.html DA sources or <path>.plain.html), writes the changed ones to <dir>/<path>.plain.html
 *     (the main's inner HTML, as da-upload sends it), <dir>/changes.tsv (path, kind, what changed),
 *     <dir>/changed-paths.txt and the logo file; nothing is written to DA.
 *   node tools/importer/swiss-mag-docs.mjs upload --dir <dir> [--list <file>] [--dry-run]
 *     da-upload.mjs --site lh-swiss --content-dir <dir> --list <dir>/changed-paths.txt: uploads and
 *     previews (never publishes).
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ORG = 'moved-permanently';
const SITE = 'lh-swiss';
export const LANGS = ['en', 'de'];
export const MORE = { en: 'More Stories', de: 'Mehr Stories' };
export const LOGO = '/media-da/magazine/swiss-magazine-logo.svg';
const LOGO_FILE = path.join(root, 'tools/importer/swiss-mag-docs-logo.svg');
const RED_LOGO = /\/etc\/designs\/lx\/clientlib-all\/vite\/img\/swiss-logo\.svg$/;
const NOT_PAGES = /\/(nav|footer|contact|print)$/;

const t = (e) => (e ? e.textContent.replace(/\s+/g, ' ').trim() : '');
const langOf = (p) => (p.match(/^\/magazine\/([a-z]{2})(\/|$)/) || [])[1] || 'en';
// linkedom writes a bare & in attribute values; DA's source has &amp;
const escapeAttributes = (html) => html.replace(/(=")([^"]*)(")/g, (m, open, value, close) => `${open}${value.replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;')}${close}`);

/** A document's kind: home, overview (sections, categories), article, other. */
export function kindOf(p, pageType) {
  if (/^\/magazine\/[a-z]{2}$/.test(p)) return 'home';
  if (NOT_PAGES.test(p)) return 'other';
  if (pageType === 'article') return 'article';
  if (pageType === 'overview') return 'overview';
  return 'other';
}

/** The nearest existing page above a path (known: the documents' paths), '' for the home. */
export function parentOf(p, known) {
  const home = `/magazine/${langOf(p)}`;
  if (p === home) return '';
  let up = p.replace(/\/[^/]+$/, '');
  while (up.length > home.length && known && !known.has(up)) up = up.replace(/\/[^/]+$/, '');
  return up.length >= home.length ? up : home;
}

const metaRows = (meta) => (meta ? [...meta.children].map((r) => [t(r.children[0]).toLowerCase(), r]) : []);

function band(document, main) {
  const sections = [...main.querySelectorAll(':scope > div')];
  if (sections.length !== 1) return false;
  const kids = [...sections[0].children];
  const hero = kids[0];
  const heading = kids[1];
  const carousel = kids[2];
  if (!hero || !hero.classList.contains('hero-card-overlay') || !heading || heading.tagName !== 'H2' || !carousel || !carousel.classList.contains('carousel-cards')) return false;
  const s1 = document.createElement('div');
  s1.append(hero);
  const s2 = document.createElement('div');
  s2.append(heading, carousel);
  const sm = document.createElement('div');
  sm.className = 'section-metadata';
  sm.innerHTML = '<div><div>Style</div><div>grey</div></div>';
  s2.append(sm);
  const s3 = document.createElement('div');
  s3.append(...kids.slice(3));
  sections[0].replaceWith(s1, s2, s3);
  return `sections: hero, band (${t(heading)}), lists`;
}

function stories(document, main, p) {
  let n = 0;
  main.querySelectorAll('div.blog-overview').forEach((list) => {
    if (list.classList.contains('stories')) return;
    const rows = [...list.children].map((r) => [t(r.children[0]).toLowerCase(), t(r.children[1])]);
    const target = (rows.find(([k]) => k === 'path') || [])[1];
    if (!target || target === p) return;
    list.classList.add('stories');
    const next = list.nextElementSibling;
    const linked = next && next.tagName === 'P' && next.querySelector(`a[href="${target}"]`);
    if (!linked) {
      const more = document.createElement('p');
      const a = document.createElement('a');
      a.setAttribute('href', target);
      a.textContent = MORE[langOf(p)];
      more.append(a);
      list.after(more);
    }
    n += 1;
  });
  return n ? `lists: ${n} stories with ${MORE[langOf(p)]}` : false;
}

function parent(document, main, p, known) {
  const meta = main.querySelector('div.metadata');
  if (!meta || metaRows(meta).some(([k]) => k === 'parent')) return false;
  const up = parentOf(p, known);
  if (!up) return false;
  const row = document.createElement('div');
  row.innerHTML = `<div>Parent</div><div>${up}</div>`;
  meta.append(row);
  return `parent ${up}`;
}

function logo(main) {
  const img = main.querySelector(':scope > div:first-child img');
  if (!img || !RED_LOGO.test(img.getAttribute('src') || '')) return false;
  img.setAttribute('src', LOGO);
  img.setAttribute('alt', 'Swiss Magazine');
  return 'nav: the white logo';
}

/**
 * One document's changes.
 * @param {string} html the DA source (<body><header></header><main>…) or a main's inner HTML
 * @param {string} p the document's path (/magazine/en/…)
 * @param {{known?: Set<string>}} opts known: every document's path (for the parents)
 * @returns {{html: string, changes: string[], kind: string}} the input itself when nothing changes
 */
export function transformDocument(html, p, { known } = {}) {
  const full = /<main[\s>]/.test(html);
  const { document } = parseHTML(full ? html : `<body><header></header><main>${html}</main><footer></footer></body>`);
  const main = document.querySelector('main');
  const pageType = ((metaRows(main.querySelector('div.metadata')).find(([k]) => k === 'page-type') || [])[1] || null);
  const kind = kindOf(p, pageType ? t(pageType.children[1]) : '');
  const changes = [];
  if (/\/nav$/.test(p)) changes.push(logo(main));
  if (kind === 'home' || kind === 'overview') {
    changes.push(band(document, main));
    changes.push(stories(document, main, p));
  }
  if (kind === 'overview' || kind === 'article') changes.push(parent(document, main, p, known));
  const done = changes.filter(Boolean);
  if (!done.length) return { html, changes: [], kind };
  const inner = escapeAttributes(main.innerHTML.trim());
  return { html: full ? `<body><header></header><main>${inner}</main><footer></footer></body>` : inner, changes: done, kind };
}

/* ------------------------------------------------------------------ reading ------------ */

function curl(args) {
  try {
    const out = execFileSync('curl', ['-s', '-w', '\n%{http_code}', ...args], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
    const i = out.lastIndexOf('\n');
    return { body: out.slice(0, i), status: Number(out.slice(i + 1)) };
  } catch (e) {
    return { body: '', status: 0 };
  }
}

/** Every DA document under /magazine/<ll> (GET list). */
function daList(langs) {
  const docs = [];
  const walk = (folder) => {
    const r = curl([`https://admin.da.live/list/${ORG}/${SITE}${folder}`]);
    if (r.status !== 200) throw new Error(`DA list ${folder}: ${r.status}`);
    JSON.parse(r.body).forEach((it) => {
      const rel = it.path.replace(`/${ORG}/${SITE}`, '');
      if (it.ext === 'html') docs.push(rel.replace(/\.html$/, ''));
      else if (!it.ext) walk(rel);
    });
  };
  langs.forEach((ll) => {
    docs.push(`/magazine/${ll}`);
    walk(`/magazine/${ll}`);
  });
  return [...new Set(docs)].sort();
}

/** Every magazine document of a folder: <path>.html (DA source) or <path>.plain.html. */
function folderList(dir, langs) {
  const docs = [];
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
    const f = path.join(d, e.name);
    if (e.isDirectory()) walk(f);
    else if (/\.html$/.test(e.name)) docs.push(`/${path.relative(dir, f).split(path.sep).join('/')}`.replace(/(\.plain)?\.html$/, ''));
  });
  if (fs.existsSync(path.join(dir, 'magazine'))) walk(path.join(dir, 'magazine'));
  return [...new Set(docs)].filter((p) => langs.includes(langOf(p))).sort();
}

function readDoc(from, p) {
  if (from === 'da') {
    const r = curl([`https://admin.da.live/source/${ORG}/${SITE}${p}.html`]);
    if (r.status !== 200) throw new Error(`DA source ${p}: ${r.status}`);
    return r.body;
  }
  const plain = path.join(from, `${p}.plain.html`);
  return fs.readFileSync(fs.existsSync(path.join(from, `${p}.html`)) ? path.join(from, `${p}.html`) : plain, 'utf8');
}

/**
 * Reads the documents, writes the changed ones, changes.tsv and changed-paths.txt to out.
 * @returns {Promise<{read: number, changed: number, unchanged: number}>}
 */
export async function prepare({
  from, out, langs = LANGS, paths = null,
}) {
  const all = from === 'da' ? daList(langs) : folderList(from, langs);
  const known = new Set(all);
  const todo = paths ? all.filter((p) => paths.includes(p)) : all;
  const rows = [];
  todo.forEach((p) => {
    const { html, changes, kind } = transformDocument(readDoc(from, p), p, { known });
    if (!changes.length) return;
    const file = path.join(out, `${p}.plain.html`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const inner = /<main[\s>]/.test(html) ? html.match(/<main>([\s\S]*)<\/main>/)[1].trim() : html;
    fs.writeFileSync(file, `${inner}\n`);
    rows.push([p, kind, changes.join('; ')]);
  });
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'changes.tsv'), `path\tkind\tchanges\n${rows.map((r) => r.join('\t')).join('\n')}${rows.length ? '\n' : ''}`);
  fs.writeFileSync(path.join(out, 'changed-paths.txt'), rows.length ? `${rows.map((r) => r[0]).join('\n')}\n` : '');
  const logoOut = path.join(out, LOGO.slice(1));
  fs.mkdirSync(path.dirname(logoOut), { recursive: true });
  fs.copyFileSync(LOGO_FILE, logoOut);
  return { read: todo.length, changed: rows.length, unchanged: todo.length - rows.length };
}

/* ------------------------------------------------------------------ cli ---------------- */

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const opt = (n) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : null);
  const mode = argv[0];
  if (mode === 'prepare' && opt('--from') && opt('--out')) {
    const langs = (opt('--lang') || LANGS.join(',')).split(',');
    const list = opt('--paths') ? fs.readFileSync(opt('--paths'), 'utf8').split(/\r?\n/).map((l) => l.trim()).filter(Boolean) : null;
    const from = opt('--from') === 'da' ? 'da' : path.resolve(opt('--from'));
    const summary = await prepare({
      from, out: path.resolve(opt('--out')), langs, paths: list,
    });
    console.log(`swiss-mag-docs: ${summary.read} read, ${summary.changed} changed, ${summary.unchanged} unchanged; ${opt('--out')}/changes.tsv, changed-paths.txt`);
  } else if (mode === 'upload' && opt('--dir')) {
    const dir = path.resolve(opt('--dir'));
    const list = opt('--list') || path.join(dir, 'changed-paths.txt');
    execFileSync('node', [path.join(root, 'tools/importer/da-upload.mjs'), '--site', SITE, '--content-dir', dir, '--list', list, ...(argv.includes('--dry-run') ? ['--dry-run'] : [])], { stdio: 'inherit' });
  } else {
    console.error('usage: swiss-mag-docs.mjs prepare --from da|<folder> --out <dir> [--lang en,de] [--paths <file>]\n       swiss-mag-docs.mjs upload --dir <dir> [--list <file>] [--dry-run]');
    process.exit(2);
  }
}
