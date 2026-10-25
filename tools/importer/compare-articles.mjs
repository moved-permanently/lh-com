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
 * publish) or, with --local, the index computed from the documents (build-article-index.mjs).
 * Also listed: www's first page as the overview snapshots show it (bd-snapshots, captured when
 * the page was imported), for reference.
 *
 * Usage: node tools/importer/compare-articles.mjs [--local | --host https://main--lh-com--moved-permanently.aem.page]
 * Report: tools/reports/articles/compare-articles.md and .json
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
const host = argv.includes('--host') ? argv[argv.indexOf('--host') + 1] : 'https://main--lh-com--moved-permanently.aem.page';
const EXPORT_API = path.join(root, 'tools/source-export/articles/api');
const SNAPSHOTS = path.join(root, 'tools/importer/bd-snapshots/www.lufthansa.com');
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
  const f = path.join(SNAPSHOTS, `${pagePath}.html`);
  if (!fs.existsSync(f)) return null;
  const html = fs.readFileSync(f, 'utf8');
  const i = html.indexOf('class="dcep-blog-overview"');
  if (i < 0) return null;
  const seg = html.slice(i, i + 400000);
  const total = (seg.match(/<strong>(\d+)<\/strong>/) || [])[1];
  const cards = [...seg.matchAll(/class="blog-article-image"><a href="([^"]+)"/g)]
    .map((m) => new URL(m[1], 'https://www.lufthansa.com').pathname);
  return { total: total ? Number(total) : null, cards };
}

const report = { checkedAt: new Date().toISOString(), replica: local ? 'local documents' : host, locales: {} };
const md = [`# Article lists: replica vs www (${local ? 'index computed from the documents' : host})`, '', report.checkedAt, ''];

for (const locale of LOCALES) {
  const exportFile = path.join(EXPORT_API, `articleblog-${locale.replace('/', '-')}.json`);
  const hasExport = fs.existsSync(exportFile);
  const www = hasExport ? wwwRows(JSON.parse(fs.readFileSync(exportFile, 'utf8')))
    : articleRows(locale).filter((r) => r['page-type'] === 'article').map(toArticle).sort(byDate);
  let replicaRaw;
  let error = '';
  try {
    replicaRaw = local ? articleRows(locale) : await siteRows(locale);
  } catch (e) {
    error = e.message;
    replicaRaw = [];
  }
  const replica = replicaRaw.filter((r) => String(r['page-type'] || '').trim() === 'article').map(toArticle).sort(byDate);
  const overviews = overviewPages(locale).map(({ path: p, options }) => {
    const first = (list) => list.filter(filterFor(options)).slice(0, options.pageSize).map((a) => a.path);
    const w = first(www);
    const r = first(replica);
    const totalW = www.filter(filterFor(options)).length;
    const totalR = replica.filter(filterFor(options)).length;
    return {
      path: p,
      options,
      www: { total: totalW, firstPage: w },
      replica: { total: totalR, firstPage: r },
      equal: totalW === totalR && JSON.stringify(w) === JSON.stringify(r),
      snapshot: snapshotFirstPage(p),
    };
  });
  const counts = {
    category: diffCounts(countBy(www, (a) => a.category), countBy(replica, (a) => a.category)),
    tag: diffCounts(countBy(www, (a) => a.tagIds), countBy(replica, (a) => a.tagIds)),
    author: diffCounts(countBy(www, (a) => a.authorId), countBy(replica, (a) => a.authorId)),
  };
  report.locales[locale] = {
    www: hasExport ? path.relative(root, exportFile) : 'replica documents (no export yet)',
    error,
    articles: { www: www.length, replica: replica.length },
    counts,
    overviews,
  };
  md.push(`## ${locale}`, '', `www: ${report.locales[locale].www}; articles www ${www.length}, replica ${replica.length}${error ? ` (replica index: ${error})` : ''}`, '');
  ['category', 'tag', 'author'].forEach((k) => {
    md.push(`- counts per ${k}: ${counts[k].length ? counts[k].map((d) => `${d.key} ${d.www}/${d.replica}`).join(', ') : 'equal'}`);
  });
  md.push('', '| overview | options | total www / replica | first page equal | www snapshot (total, first cards on the replica) |', '|---|---|---|---|---|');
  overviews.forEach((o) => {
    const opts = Object.entries(o.options).filter(([, v]) => v !== '' && v !== false).map(([k, v]) => `${k} ${v}`).join(', ');
    const snap = o.snapshot ? `${o.snapshot.total ?? '–'}; ${o.snapshot.cards.filter((c) => o.replica.firstPage.includes(c)).length}/${o.snapshot.cards.length} of its cards on the replica's first page` : 'no list in the snapshot';
    md.push(`| ${o.path} | ${opts} | ${o.www.total} / ${o.replica.total} | ${o.equal ? 'yes' : 'no'} | ${snap} |`);
  });
  md.push('');
}

fs.mkdirSync(OUT, { recursive: true });
const name = local ? 'compare-articles-local' : 'compare-articles';
fs.writeFileSync(path.join(OUT, `${name}.json`), `${JSON.stringify(report, null, 1)}\n`);
fs.writeFileSync(path.join(OUT, `${name}.md`), `${md.join('\n')}\n`);
Object.entries(report.locales).forEach(([l, r]) => {
  const eq = r.overviews.filter((o) => o.equal).length;
  console.log(`${l}: articles www ${r.articles.www} / replica ${r.articles.replica}; overviews equal ${eq}/${r.overviews.length}; count diffs category ${r.counts.category.length}, tag ${r.counts.tag.length}, author ${r.counts.author.length}${r.error ? ` (${r.error})` : ''}`);
});
