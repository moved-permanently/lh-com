/* eslint-disable no-console */
/**
 * Puts every Insights page www answered with 200 in the article export
 * (tools/source-export/articles/urls-<cc>-<ll>.csv) into the migration scope, group insights:
 * articles, the category pages, the tag pages, the author pages, /articles/tags and
 * /articles/authors. Not-found and redirect rows stay out (also "200 after redirect": the
 * target is the page itself). One pages.csv row per path below /<cc>/<ll>/, a cell per locale
 * that has it. Insights rows that are not in the export (all-it-takes-is-a-yes) are kept.
 *
 * Writes tools/migration-scope/pages.csv (insights rows), the insights urls in
 * tools/importer/page-templates.json and tools/reports/articles/article-scope.json (counts per
 * locale and kind, in and out). Run build-scope-paths.js afterwards.
 *
 * Usage: node tools/importer/article-scope.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LIVE_ROOTS } from '../../scripts/locale.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const EXPORT = path.join(root, 'tools/source-export/articles');
const PAGES = path.join(root, 'tools/migration-scope/pages.csv');
const TEMPLATES = path.join(root, 'tools/importer/page-templates.json');
const REPORT = path.join(root, 'tools/reports/articles/article-scope.json');
const LOCALES = LIVE_ROOTS;
const LIVE = 'https://www.lufthansa.com';

/** CSV with quoted fields. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i += 1; } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(cell); cell = ''; } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i += 1;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows.filter((r) => r.length > 1 || r[0]);
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] || ''])));
}

const report = {
  generatedAt: new Date().toISOString(), in: {}, out: {}, outPaths: {},
};
const slugs = new Map(); // path below /<cc>/<ll>/ -> { de_en: path, ... }
LOCALES.forEach((loc) => {
  const key = loc.replace('/', '-');
  const col = loc.replace('/', '_');
  report.in[loc] = {};
  report.out[loc] = {};
  report.outPaths[loc] = [];
  parseCsv(fs.readFileSync(path.join(EXPORT, `urls-${key}.csv`), 'utf8')).forEach((r) => {
    if (r.status === '200') {
      report.in[loc][r.kind] = (report.in[loc][r.kind] || 0) + 1;
      const slug = r.path.slice(loc.length + 2);
      if (!slugs.has(slug)) slugs.set(slug, {});
      slugs.get(slug)[col] = r.path;
    } else {
      const why = /^redirect|after redirect/.test(r.status) ? 'redirect' : 'not found';
      const k = `${r.kind} ${why}`;
      report.out[loc][k] = (report.out[loc][k] || 0) + 1;
      report.outPaths[loc].push(`${r.path} (${r.kind}, ${r.status})`);
    }
  });
});

const lines = fs.readFileSync(PAGES, 'utf8').trim().split('\n');
const head = lines[0];
const cols = head.split(',');
const isInsights = (l) => l.startsWith('insights,');
const kept = lines.slice(1).filter(isInsights).filter((l) => {
  const cells = l.split(',').slice(1);
  return !cells.some((p) => p && slugs.has(p.split('/').slice(3).join('/')));
});
const rows = [...slugs.entries()].sort(([a], [b]) => a.localeCompare(b))
  .map(([, r]) => ['insights', ...cols.slice(1).map((c) => r[c] || '')].join(','));
const insights = [...rows, ...kept].sort();
const first = lines.findIndex((l, i) => i > 0 && isInsights(l));
const others = lines.slice(1).filter((l) => !isInsights(l));
const at = first < 0 ? others.length : lines.slice(1, first).filter((l) => !isInsights(l)).length;
const next = [head, ...others.slice(0, at), ...insights, ...others.slice(at)];
fs.writeFileSync(PAGES, `${next.join('\n')}\n`);

const json = JSON.parse(fs.readFileSync(TEMPLATES, 'utf8'));
const t = json.templates.find((x) => x.name === 'insights');
t.urls = insights.flatMap((l) => l.split(',').slice(1).filter(Boolean)).map((p) => `${LIVE}${p}`);
fs.writeFileSync(TEMPLATES, `${JSON.stringify(json, null, 2)}\n`);

report.rows = insights.length;
report.urls = t.urls.length;
fs.mkdirSync(path.dirname(REPORT), { recursive: true });
fs.writeFileSync(REPORT, `${JSON.stringify(report, null, 1)}\n`);
console.log(`insights: ${insights.length} rows (${kept.length} not in the export), ${t.urls.length} urls`);
LOCALES.forEach((loc) => console.log(`${loc} in ${JSON.stringify(report.in[loc])} out ${JSON.stringify(report.out[loc])}`));
