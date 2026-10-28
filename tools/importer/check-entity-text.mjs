/* eslint-disable no-console, max-len, no-await-in-loop, no-restricted-syntax, import/no-extraneous-dependencies -- dev tooling; entities is a dev dependency (linkedom) */
/**
 * Checks a host for entity text (www's twice-escaped article text, tools/importer/fix-entity-text.mjs):
 * every document under the four roots' /articles/ (and --path …): its .plain.html must hold no
 * `&#x26;<entity>;` (Edge Delivery's form of `&amp;uuml;`), and the page's head (title,
 * description, og:title, og:description) none either. --index: the articles and search query
 * indexes' title and description fields too (they change on publish only).
 * Usage: node tools/importer/check-entity-text.mjs [--host https://main--lh-com--moved-permanently.aem.page] [--index] [--out report.json]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { decodeHTML } from 'entities';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ROOTS = ['de/en', 'de/de', 'at/de', 'gb/en'];
// an escaped entity in served HTML: &#x26;uuml; (Edge Delivery) or &amp;uuml;
const ESCAPED = /&(?:#x26|amp);(#\d{1,7}|#x[0-9a-f]{1,6}|[a-z][a-z0-9]{1,31});/gi;
// entity text in plain text (index fields): &uuml;
const TEXT = /&(#\d{1,7}|#x[0-9a-f]{1,6}|[a-z][a-z0-9]{1,31});/gi;
const real = (name) => decodeHTML(`&${name};`) !== `&${name};`;

/** The escaped entities of served HTML that are real entities (unique, sorted). */
export function escapedEntities(html) {
  return [...new Set([...String(html).matchAll(ESCAPED)].map((m) => m[1]).filter(real))].sort();
}

/** Entity text of a plain text value (an index field). */
export function entityText(value) {
  return [...new Set([...String(value || '').matchAll(TEXT)].map((m) => m[1]).filter((n) => real(n) && n !== 'amp'))].sort();
}

const walk = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  const f = path.join(d, e.name);
  if (e.isSymbolicLink()) return [];
  return e.isDirectory() ? walk(f) : [f];
}) : []);

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const argv = process.argv.slice(2);
  const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
  const host = opt('host', 'https://main--lh-com--moved-permanently.aem.page');
  const extra = argv.flatMap((a, i) => (a === '--path' ? [argv[i + 1]] : []));
  const paths = [...ROOTS.flatMap((r) => walk(path.join(root, 'content', r, 'articles'))
    .filter((f) => f.endsWith('.plain.html'))
    .map((f) => f.slice(path.join(root, 'content').length).replace(/\.plain\.html$/, ''))), ...extra].sort();
  const results = [];
  let next = 0;
  const worker = async () => {
    while (next < paths.length) {
      const p = paths[next];
      next += 1;
      const r = { path: p };
      try {
        const plain = await fetch(`${host}${p}.plain.html`);
        r.plainStatus = plain.status;
        r.plain = plain.ok ? escapedEntities(await plain.text()) : [];
        const page = await fetch(`${host}${p}`);
        const html = page.ok ? await page.text() : '';
        const head = html.slice(0, html.indexOf('</head>') + 1);
        r.head = [...new Set([...head.matchAll(/<(?:title>([^<]*)<\/title|meta (?:name|property)="(?:description|og:title|og:description)" content="([^"]*)")/g)].flatMap((m) => escapedEntities(m[1] || m[2] || '')))];
      } catch (e) {
        r.error = e.message;
      }
      results.push(r);
    }
  };
  await Promise.all(Array.from({ length: Number(opt('concurrency', 6)) }, worker));
  results.sort((a, b) => a.path.localeCompare(b.path));
  const bad = results.filter((r) => r.error || r.plainStatus !== 200 || r.plain.length || r.head.length);
  const group = (p) => p.split('/').slice(1, 3).join('/');
  const per = {};
  results.forEach((r) => {
    const g = group(r.path);
    per[g] ||= { documents: 0, notOk: 0, withEntities: 0 };
    per[g].documents += 1;
    if (r.plainStatus !== 200 || r.error) per[g].notOk += 1;
    if (r.plain?.length || r.head?.length) per[g].withEntities += 1;
  });
  console.log(`check-entity-text ${host}: ${results.length} documents; ${JSON.stringify(per)}`);
  bad.slice(0, 40).forEach((r) => console.log(`  ${r.path}: ${r.error || `plain ${r.plainStatus} ${r.plain.join(',')} head ${r.head.join(',')}`}`));
  const report = {
    host, results: results.length, per, bad,
  };
  if (argv.includes('--index')) {
    report.index = {};
    for (const r of ROOTS) {
      for (const name of ['articles/query-index.json', 'search-index.json']) {
        const resp = await fetch(`${host}/${r}/${name}?limit=5000`);
        const data = resp.ok ? (await resp.json()).data || [] : [];
        const rows = data.filter((row) => entityText(row.title).length || entityText(row.description).length);
        report.index[`/${r}/${name}`] = { rows: data.length, withEntities: rows.length, sample: rows.slice(0, 3).map((row) => row.path) };
        console.log(`  index /${r}/${name}: ${data.length} rows, ${rows.length} with entity text in title or description`);
      }
    }
  }
  if (opt('out')) fs.writeFileSync(opt('out'), `${JSON.stringify(report, null, 1)}\n`);
}
