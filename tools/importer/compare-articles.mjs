/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, max-len, import/extensions */
/**
 * Compares the replica's article lists with www, per locale:
 * - the article counts per category, tag and author;
 * - the first page of every overview page (the documents with a blog-overview block: category,
 *   tag and author pages), filtered and sorted as the block does (scripts/articles.js).
 *
 * www's side: its list answers once exported (tools/source-export/articles/api/
 * articleblog-<cc>-<ll>.json: any JSON whose objects carry targetUrl or id, category, tags and
 * authorId, as www's article objects do); until then the replica's own documents
 * (content/<cc>/<ll>/articles/...), so the check is that the index serves what the documents say.
 * The replica's side: the article index of the site (--host, default the preview; it fills on
 * publish), with --origin the documents as the preview renders them (each local article fetched
 * from <origin> and read as the index reads it: head meta tags, .article-header h1; for the check
 * before publishing), or, with --local, the index computed from the documents
 * (build-article-index.mjs).
 * Also listed: www's first page as www rendered the overview (the article export,
 * tools/source-export/articles-unpacked/pages, else bd-snapshots), for reference.
 * Related articles are not compared (www picks them at random on each render).
 * www errors (listed, not counted as differences): WWW_ERRORS below.
 *
 * Usage: node tools/importer/compare-articles.mjs [--local | --origin https://main--lh-com--moved-permanently.aem.page
 *          | --host https://main--lh-com--moved-permanently.aem.page]
 * Report: tools/reports/articles/compare-articles[-local|-origin].md and .json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  LOCALES, articleRows, overviewPages,
} from './build-article-index.mjs';
import {
  toArticle, byDate, normalizeCategory, normalizeTag, dateValue,
} from '../../scripts/articles.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const local = argv.includes('--local');
const origin = argv.includes('--origin') ? argv[argv.indexOf('--origin') + 1].replace(/\/$/, '') : '';
const host = argv.includes('--host') ? argv[argv.indexOf('--host') + 1] : 'https://main--lh-com--moved-permanently.aem.page';
const EXPORT_API = path.join(root, 'tools/source-export/articles/api');
const SNAPSHOTS = path.join(root, 'tools/importer/bd-snapshots/www.lufthansa.com');
const EXPORT_PAGES = path.join(root, 'tools/source-export/articles-unpacked/pages');
// www errors the replica does not copy (they do not change a count or a first page)
const WWW_ERRORS = [
  'de/en: /de/en/articles/explore-the-world/a-perfect-day-toronto-in-one-day has a German <title> ("A Perfect Day: Toronto an einem Tag"); the replica\'s Title is the English headline',
  'gb/en: the tag chennai is in www\'s list answer, its page /gb/en/articles/tags/chennai is not found; no tag page, the articles keep the tag id',
  'de/en, gb/en: /<cc>/en/articles/explore-the-world/what-i-learned-living-in-rome links /de/en/articles/tags/art. (trailing dot, not found); the replica links /<cc>/en/articles/tags/art',
];
const OUT = path.join(root, 'tools/reports/articles');

/** www's article objects anywhere in an export answer, as list rows. */
function wwwRows(json) {
  const rows = new Map();
  const visit = (v) => {
    if (Array.isArray(v)) v.forEach(visit);
    else if (v && typeof v === 'object') {
      const url = v.targetUrl || v.url || '';
      if ((url || v.id) && 'category' in v && Array.isArray(v.tags)) {
        const p = url ? new URL(url, 'https://www.lufthansa.com').pathname.replace(/\.html$/, '') : v.id;
        if (!rows.has(p)) {
          rows.set(p, {
            path: p,
            title: v.title || '',
            category: normalizeCategory(v.category),
            tagIds: v.tags.map((t) => normalizeTag(typeof t === 'string' ? t : t.id)),
            authorId: v.authorId || '',
            time: typeof v.postDate === 'number' ? v.postDate : dateValue(v.postDate || v.date),
          });
        }
      }
      Object.values(v).forEach(visit);
    }
  };
  visit(json);
  return [...rows.values()].sort(byDate);
}

async function siteRows(locale) {
  const rows = [];
  for (let offset = 0; ; offset += 500) {
    const resp = await fetch(`${host}/${locale}/articles/query-index.json?offset=${offset}&limit=500`, { cache: 'no-store' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();
    rows.push(...json.data);
    if (json.data.length < 500) break;
  }
  return rows;
}

const decodeAttr = (v) => String(v || '').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&amp;/g, '&');

/** The local articles as the preview renders them, read as the site's index reads them. */
async function originRows(locale) {
  const paths = articleRows(locale).map((r) => r.path);
  const rows = [];
  const missing = [];
  for (let i = 0; i < paths.length; i += 12) {
    await Promise.all(paths.slice(i, i + 12).map(async (p) => {
      const resp = await fetch(`${origin}${p}`, { cache: 'no-store' });
      if (!resp.ok) { missing.push(`${p} (${resp.status})`); return; }
      const html = await resp.text();
      const meta = (n) => decodeAttr((html.match(new RegExp(`<meta name="${n}" content="([^"]*)"`)) || [])[1]);
      const h1 = html.match(/<div class="article-header">[\s\S]*?<h1[^>]*>([\s\S]*?)<\/h1>/);
      rows.push({
        path: p,
        title: h1 ? decodeAttr(h1[1].replace(/<[^>]+>/g, '')).trim() : '',
        'page-type': meta('page-type'),
        category: meta('category'),
        'tag-ids': meta('tag-ids'),
        author: meta('author'),
        'author-id': meta('author-id'),
        'publication-date': meta('publication-date'),
      });
    }));
  }
  return { rows: rows.sort((a, b) => a.path.localeCompare(b.path)), missing };
}

const filterFor = (o) => (a) => (!o.category || a.category === normalizeCategory(o.category))
  && (!o.tag || a.tagIds.includes(normalizeTag(o.tag)))
  && (!o.author || a.authorId === o.author);

const countBy = (list, keyOf) => {
  const c = {};
  list.forEach((a) => [].concat(keyOf(a)).filter(Boolean).forEach((k) => { c[k] = (c[k] || 0) + 1; }));
  return c;
};

const diffCounts = (a, b) => [...new Set([...Object.keys(a), ...Object.keys(b)])].sort()
  .filter((k) => (a[k] || 0) !== (b[k] || 0)).map((k) => ({ key: k, www: a[k] || 0, replica: b[k] || 0 }));

/** www's first page of an overview from its snapshot: the cards' article paths. */
function snapshotFirstPage(pagePath) {
  const f = [EXPORT_PAGES, SNAPSHOTS].map((d) => path.join(d, `${pagePath}.html`)).find((x) => fs.existsSync(x));
  if (!f) return null;
  const html = fs.readFileSync(f, 'utf8');
  const i = html.indexOf('class="dcep-blog-overview"');
  if (i < 0) return null;
  const seg = html.slice(i, i + 400000);
  const total = (seg.match(/<strong>(\d+)<\/strong>/) || [])[1];
  const cards = [...seg.matchAll(/class="blog-article-image"><a href="([^"]+)"/g)]
    .map((m) => new URL(m[1], 'https://www.lufthansa.com').pathname);
  return { total: total ? Number(total) : null, cards };
}

const replicaName = (local && 'index computed from the local documents')
  || (origin && `the documents as ${origin} renders them`) || `${host} article indexes`;
const report = {
  checkedAt: new Date().toISOString(), replica: replicaName, wwwErrors: WWW_ERRORS, locales: {},
};
const md = [`# Article lists: replica vs www (${replicaName})`, '', report.checkedAt, '',
  'Related articles are not compared (www picks them at random on each render). www errors not copied (no count changes):', '',
  ...WWW_ERRORS.map((e) => `- ${e}`), ''];

for (const locale of LOCALES) {
  const exportFile = path.join(EXPORT_API, `articleblog-${locale.replace('/', '-')}.json`);
  const hasExport = fs.existsSync(exportFile);
  const www = hasExport ? wwwRows(JSON.parse(fs.readFileSync(exportFile, 'utf8')))
    : articleRows(locale).filter((r) => r['page-type'] === 'article').map(toArticle).sort(byDate);
  let replicaRaw;
  let error = '';
  let missing = [];
  try {
    if (origin) ({ rows: replicaRaw, missing } = await originRows(locale));
    else replicaRaw = local ? articleRows(locale) : await siteRows(locale);
  } catch (e) {
    error = e.message;
    replicaRaw = [];
  }
  const replica = replicaRaw.filter((r) => String(r['page-type'] || '').trim() === 'article').map(toArticle).sort(byDate);
  // author ids with typographic spaces (U+202F, "lh/flávio branco-geraldes"): compared with one
  // kind of space (the documents' metadata text collapses them)
  [...www, ...replica].forEach((a) => { a.authorId = String(a.authorId || '').replace(/\s+/g, ' '); });
  const overviews = overviewPages(locale).map(({ path: p, options }) => {
    const opts = { ...options, author: String(options.author || '').replace(/\s+/g, ' ') };
    const firstOf = (list) => list.filter(filterFor(opts)).slice(0, opts.pageSize);
    const first = (list) => firstOf(list).map((a) => a.path);
    const w = first(www);
    const r = first(replica);
    // www's order of articles with the same post time is its own (not by title or path): a first
    // page that differs only there is listed as such
    const times = (list) => JSON.stringify(firstOf(list).map((a) => a.time));
    const tieOnly = JSON.stringify(w) !== JSON.stringify(r) && times(www) === times(replica);
    const totalW = www.filter(filterFor(opts)).length;
    const totalR = replica.filter(filterFor(opts)).length;
    return {
      path: p,
      options,
      www: { total: totalW, firstPage: w },
      replica: { total: totalR, firstPage: r },
      equal: totalW === totalR && JSON.stringify(w) === JSON.stringify(r),
      tieOrderOnly: totalW === totalR && tieOnly,
      snapshot: snapshotFirstPage(p),
    };
  });
  const counts = {
    category: diffCounts(countBy(www, (a) => a.category), countBy(replica, (a) => a.category)),
    tag: diffCounts(countBy(www, (a) => a.tagIds), countBy(replica, (a) => a.tagIds)),
    author: diffCounts(countBy(www, (a) => a.authorId), countBy(replica, (a) => a.authorId)),
  };
  const wwwPaths = new Set(www.map((a) => a.path));
  const replicaPaths = new Set(replica.map((a) => a.path));
  report.locales[locale] = {
    www: hasExport ? path.relative(root, exportFile) : 'replica documents (no export yet)',
    error,
    missing,
    articles: { www: www.length, replica: replica.length },
    onlyWww: [...wwwPaths].filter((p) => !replicaPaths.has(p)),
    onlyReplica: [...replicaPaths].filter((p) => !wwwPaths.has(p)),
    counts,
    overviews,
  };
  const L = report.locales[locale];
  md.push(`## ${locale}`, '', `www: ${L.www}; articles www ${www.length}, replica ${replica.length}${error ? ` (replica index: ${error})` : ''}`, '');
  if (L.onlyWww.length) md.push(`- only on www: ${L.onlyWww.join(', ')}`);
  if (L.onlyReplica.length) md.push(`- only on the replica: ${L.onlyReplica.join(', ')}`);
  if (missing.length) md.push(`- not on ${origin}: ${missing.join(', ')}`);
  ['category', 'tag', 'author'].forEach((k) => {
    md.push(`- counts per ${k}: ${counts[k].length ? counts[k].map((d) => `${d.key} ${d.www}/${d.replica}`).join(', ') : 'equal'}`);
  });
  md.push('', '| overview | options | total www / replica | first page equal | www snapshot (total, first cards on the replica) |', '|---|---|---|---|---|');
  overviews.forEach((o) => {
    const opts = Object.entries(o.options).filter(([, v]) => v !== '' && v !== false).map(([k, v]) => `${k} ${v}`).join(', ');
    const snap = o.snapshot ? `${o.snapshot.total ?? '–'}; ${o.snapshot.cards.filter((c) => o.replica.firstPage.includes(c)).length}/${o.snapshot.cards.length} of its cards on the replica's first page` : 'no list in the snapshot';
    md.push(`| ${o.path} | ${opts} | ${o.www.total} / ${o.replica.total} | ${(o.equal && 'yes') || (o.tieOrderOnly && 'yes, apart from the order of articles with the same post time') || 'no'} | ${snap} |`);
  });
  md.push('');
}

fs.mkdirSync(OUT, { recursive: true });
const name = (local && 'compare-articles-local') || (origin && 'compare-articles-origin') || 'compare-articles';
fs.writeFileSync(path.join(OUT, `${name}.json`), `${JSON.stringify(report, null, 1)}\n`);
fs.writeFileSync(path.join(OUT, `${name}.md`), `${md.join('\n')}\n`);
Object.entries(report.locales).forEach(([l, r]) => {
  const eq = r.overviews.filter((o) => o.equal).length;
  const ties = r.overviews.filter((o) => o.tieOrderOnly).length;
  console.log(`${l}: articles www ${r.articles.www} / replica ${r.articles.replica} (only www ${r.onlyWww.length}, only replica ${r.onlyReplica.length}${r.missing.length ? `, not rendered ${r.missing.length}` : ''}); overviews equal ${eq}/${r.overviews.length} (+${ties} apart from same-time order); count diffs category ${r.counts.category.length}, tag ${r.counts.tag.length}, author ${r.counts.author.length}${r.error ? ` (${r.error})` : ''}`);
});
