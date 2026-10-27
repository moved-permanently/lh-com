/* eslint-disable no-console, no-await-in-loop, max-len, import/no-relative-packages, no-restricted-syntax */
/**
 * Compares lh-edge's POST /service/secured/api/search with www's recorded answers
 * (tools/source-export/feeds/search/, 10 phrases per locale): for every phrase and locale
 * - the shape: status, content type, the keys (results, total, pageSize), each result's keys
 *   (link, headline, description), pageSize 10, total = number of results, at most 30;
 * - www's top 5 results that exist on the replica (www's AEM link mapped to the replica path as
 *   the importer maps links: /content/lh/markets stripped, then the AEM path map of
 *   tools/importer/parsers/aem-path-map.js, in the migration scope) must be in lh-edge's top 10.
 * Also: the answers without X-Portal headers and with an empty phrase (www: 400).
 *
 * Usage: node compare-search.mjs --host https://lhedge.bbird.live | --local
 *   --local: the Worker in Node with the search indexes computed from the local documents
 *            (tools/importer/build-search-index.mjs): the check before the indexes are published
 * Report: tools/reports/lh-edge/compare-search[-local].md and .json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LIVE_ROOTS } from '../../../scripts/locale.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const argv = process.argv.slice(2);
const local = argv.includes('--local');
const host = argv.includes('--host') ? argv[argv.indexOf('--host') + 1].replace(/\/$/, '') : '';
if (!local && !host) {
  console.error('usage: compare-search.mjs --host https://lhedge.bbird.live | --local');
  process.exit(1);
}
const FIXTURES = path.join(root, 'tools/source-export/feeds/search');
const ORIGIN = 'main--lh-com--moved-permanently.aem.live';
const SELF = local ? 'https://lh-edge.local' : host;

const { AEM_PATHS } = await import(path.join(root, 'tools/importer/parsers/aem-path-map.js'));
const { default: SCOPE } = await import(path.join(root, 'tools/importer/transformers/scope-paths.js'));

/** www's result link as the replica's path (null: not migrated). */
function replicaPath(link) {
  let p = String(link || '').replace(/^https?:\/\/[^/]+/, '').split(/[?#]/)[0]
    .replace(/\.html$/, '')
    .replace(/\/+$/, '');
  p = p.replace(/^\/content\/lh\/markets(?=\/[a-z]{2}\/[a-z]{2}(\/|$))/, '');
  const mapped = AEM_PATHS[p] || p;
  return SCOPE.has(mapped) ? mapped : null;
}

let worker;
if (local) {
  const { searchRows } = await import(path.join(root, 'tools/importer/build-search-index.mjs'));
  const sheets = {};
  LIVE_ROOTS.forEach((l) => { sheets[`/${l}/search-index.json`] = searchRows(l); });
  globalThis.fetch = async (input) => {
    const req = input instanceof Request ? input : new Request(input);
    const u = new URL(req.url);
    const rows = sheets[u.pathname];
    if (u.hostname !== ORIGIN || !rows) return new Response('Not found', { status: 404 });
    const offset = Number(u.searchParams.get('offset')) || 0;
    const limit = Number(u.searchParams.get('limit')) || 1000;
    return Response.json({
      total: rows.length, offset, limit, data: rows.slice(offset, offset + limit), ':type': 'sheet',
    });
  };
  ({ default: worker } = await import('./src/index.js'));
}

async function ask(phrase, headers) {
  const init = {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify({ phrase }),
  };
  const resp = local
    ? await worker.fetch(new Request(`${SELF}/service/secured/api/search`, init), { ORIGIN, PUBLIC_HOST: '', EDGE_TTL: '60' }, {})
    : await fetch(`${host}/service/secured/api/search`, init);
  const text = await resp.text();
  let body = null;
  try { body = JSON.parse(text); } catch (e) { body = null; }
  return {
    status: resp.status, type: (resp.headers.get('content-type') || '').split(';')[0].trim(), cacheControl: resp.headers.get('cache-control'), body,
  };
}

function shapeDifferences(www, edge) {
  const d = [];
  if (www.status !== edge.status) d.push(`status ${www.status} / ${edge.status}`);
  if (www.type !== edge.type) d.push(`content-type ${www.type} / ${edge.type}`);
  if ((www.cacheControl || null) !== (edge.cacheControl || null)) d.push(`cache-control ${www.cacheControl} / ${edge.cacheControl}`);
  const keys = (o) => (o && typeof o === 'object' ? Object.keys(o).sort().join(',') : String(o));
  if (keys(www.body) !== keys(edge.body)) d.push(`keys ${keys(www.body)} / ${keys(edge.body)}`);
  if (edge.body && Array.isArray(edge.body.results)) {
    const bad = edge.body.results.find((r) => keys(r) !== 'description,headline,link' || typeof r.link !== 'string' || typeof r.headline !== 'string' || typeof r.description !== 'string');
    if (bad) d.push(`result keys ${keys(bad)}`);
    if (edge.body.pageSize !== 10) d.push(`pageSize ${edge.body.pageSize}`);
    if (edge.body.total !== edge.body.results.length) d.push(`total ${edge.body.total} for ${edge.body.results.length} results`);
    if (edge.body.results.length > 30) d.push(`${edge.body.results.length} results (www at most 30)`);
  }
  return d;
}

const index = JSON.parse(fs.readFileSync(path.join(FIXTURES, 'index.json'), 'utf8'));
const cases = [];
for (const rec of index.filter((r) => /\/service\/secured\/api\/search$/.test(r.url || ''))) {
  const www = {
    status: rec.status, type: (rec.contentType || '').split(';')[0], cacheControl: rec.cacheControl, body: JSON.parse(fs.readFileSync(path.join(FIXTURES, rec.file), 'utf8')),
  };
  const headers = Object.fromEntries(Object.entries(rec.requestHeaders || {}).filter(([k]) => /^x-portal/i.test(k)));
  let phrase = rec.phrase ?? '';
  try { phrase = JSON.parse(rec.requestBody || '{}').phrase ?? phrase; } catch (e) { /* keep */ }
  const edge = await ask(phrase, headers);
  const shape = shapeDifferences(www, edge);
  const edgeTop = ((edge.body && edge.body.results) || []).slice(0, 10).map((r) => r.link);
  const top5 = ((www.body && www.body.results) || []).slice(0, 5).map((r) => ({ link: r.link, replica: replicaPath(r.link) }));
  const checked = top5.filter((r) => r.replica);
  const missing = checked.filter((r) => !edgeTop.includes(r.replica));
  cases.push({
    file: rec.file, locale: rec.locale || '', phrase, wwwTotal: www.body && www.body.total, edgeTotal: edge.body && edge.body.total, shape, top5, checked: checked.length, missing, notMigrated: top5.filter((r) => !r.replica).map((r) => r.link), edgeTop,
  });
}

const ok = cases.filter((c) => !c.shape.length && !c.missing.length).length;
const checkedTotal = cases.reduce((n, c) => n + c.checked, 0);
const missingTotal = cases.reduce((n, c) => n + c.missing.length, 0);
const report = {
  checkedAt: new Date().toISOString(), edge: local ? 'the Worker in Node, indexes from the local documents' : host, cases: cases.length, ok, checkedTotal, missingTotal, results: cases,
};
const name = local ? 'compare-search-local' : 'compare-search';
const outDir = path.join(root, 'tools/reports/lh-edge');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, `${name}.json`), `${JSON.stringify(report, null, 1)}\n`);
const md = [
  `# Site search: lh-edge vs www (${report.edge})`, '', report.checkedAt, '',
  `${ok}/${cases.length} answers equal in shape with every www top-5 result that is on the replica in lh-edge's top 10 (${checkedTotal - missingTotal}/${checkedTotal} such results found).`, '',
  '| locale | phrase | www / lh-edge results | shape | www top 5 on the replica: in top 10 | not migrated |', '|---|---|---|---|---|---|',
  ...cases.map((c) => `| ${c.locale} | ${c.phrase || '(empty)'} | ${c.wwwTotal ?? '-'} / ${c.edgeTotal ?? '-'} | ${c.shape.length ? c.shape.join('; ') : 'equal'} | ${c.checked - c.missing.length}/${c.checked}${c.missing.length ? ` (missing: ${c.missing.map((m) => m.replica).join(', ')})` : ''} | ${c.notMigrated.length} |`),
  '',
];
fs.writeFileSync(path.join(outDir, `${name}.md`), md.join('\n'));
console.log(`compare-search: ${ok}/${cases.length} ok; www top-5 results on the replica found in lh-edge's top 10: ${checkedTotal - missingTotal}/${checkedTotal}`);
cases.filter((c) => c.shape.length || c.missing.length).forEach((c) => console.log(`  ${c.locale} ${c.phrase}: ${[...c.shape, ...c.missing.map((m) => `missing ${m.replica}`)].join('; ')}`));
