/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, max-len, import/extensions, no-underscore-dangle */
/**
 * Compares lh-edge's GraphQL feeds with www's recorded answers (tools/source-export/feeds/
 * graphql/index.json): for every recorded URL the status and the JSON, field by field, lists in
 * order (missing, extra and different items).
 *
 * --host <url>  the deployed lh-edge (it reads the published documents and their indexes)
 * --local       the worker in Node with the indexes computed from the local documents
 *               (feed-index.mjs); Message-Center URLs are skipped (the messages Worker's)
 *
 * Deliberate differences (DELIBERATE below), normalized before the comparison and counted:
 * - _tags: compared as a set (the document keeps tenants, platforms and the two flags as fields,
 *   www's tag order is the order the tags were picked in);
 * - rich text (longText.html, destination.html, transit.html): compared as Edge Delivery renders
 *   it (whitespace between tags, <b>/<strong>, <i>/<em>, attributes other than href, &nbsp;,
 *   empty paragraphs);
 * - text values: trailing whitespace (Document Authoring trims it: "DO&CO ", plaintext "...\n");
 * - www's data errors, fixed at import: qa-www.lufthansa.com links, doubled image URLs;
 * - properties: [] and null (an empty list is not kept in a document; lh-edge sends null);
 * - _metadata jcr:created: www sends different values for the same fragment in its list and path
 *   queries (lh-edge sends the imported value of the path query);
 * - last-modified (www sends the query's own edit time, lh-edge the newest change of the data).
 *
 * Report: tools/reports/lh-edge/compare-graphql[-local].md and .json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DELIBERATE, normalize, diff,
} from './graphql-diff.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '../../..');
const FEEDS = path.join(root, 'tools/source-export/feeds');
const argv = process.argv.slice(2);
const local = argv.includes('--local');
const host = argv.includes('--host') ? argv[argv.indexOf('--host') + 1].replace(/\/$/, '') : '';
if (!local && !host) {
  console.error('usage: compare-graphql.mjs --local | --host https://...');
  process.exit(1);
}
const recorded = JSON.parse(fs.readFileSync(path.join(FEEDS, 'graphql/index.json'), 'utf8')).urls;

let fetchLocal;
if (local) {
  const { default: buildFeedIndexes } = await import('./feed-index.mjs');
  const { default: worker } = await import('./src/index.js');
  const indexes = buildFeedIndexes();
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    const req = input instanceof Request ? input : new Request(input);
    const u = new URL(req.url);
    const hit = indexes[u.pathname];
    if (hit) {
      const offset = Number(u.searchParams.get('offset') || 0);
      const limit = Number(u.searchParams.get('limit') || 1000);
      return Response.json({ ...hit, offset, data: hit.data.slice(offset, offset + limit) });
    }
    if (u.hostname === 'www.lufthansa.com') return realFetch(input);
    return new Response('not found', { status: 404 });
  };
  const env = {
    ORIGIN: 'main--lh-com--moved-permanently.aem.live', PUBLIC_HOST: '', CORS_ORIGINS: 'lufthansa.com,localhost',
  };
  fetchLocal = (url) => worker.fetch(new Request(`https://lh-edge.local${url}`), env, {});
}

const results = [];
for (const [url, e] of Object.entries(recorded)) {
  if (local && url.includes('/Message-Center/')) {
    results.push({ url, skipped: 'Message-Center: the messages Worker (lh-messages)' });
    // eslint-disable-next-line no-continue
    continue;
  }
  const www = JSON.parse(fs.readFileSync(path.join(FEEDS, e.file), 'utf8'));
  let status;
  let body;
  let headers = {};
  try {
    const resp = local ? await fetchLocal(url) : await fetch(`${host}${url}`, { cache: 'no-store' });
    status = resp.status;
    headers = Object.fromEntries(resp.headers);
    body = await resp.json().catch(() => null);
  } catch (err) {
    status = 0;
    body = { error: err.message };
  }
  const d = diff(normalize(www, '', 'www'), normalize(body, '', 'edge'));
  results.push({
    url,
    status: { www: e.status, edge: status },
    cacheControl: { www: e['cache-control'] || null, edge: headers['cache-control'] || null },
    equal: status === e.status && !d.length,
    differences: d.slice(0, 40),
    count: d.length,
  });
}

const checked = results.filter((r) => !r.skipped);
const equal = checked.filter((r) => r.equal).length;
const name = local ? 'compare-graphql-local' : 'compare-graphql';
const outDir = path.join(root, 'tools/reports/lh-edge');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, `${name}.json`), `${JSON.stringify({
  checkedAt: new Date().toISOString(), target: local ? 'local documents' : host, deliberate: DELIBERATE, results,
}, null, 1)}\n`);
const md = [`# GraphQL feeds: lh-edge vs www (${local ? 'local documents' : host})`, '', new Date().toISOString(), '',
  `${equal}/${checked.length} recorded URLs equal apart from the deliberate differences${results.length - checked.length ? `; ${results.length - checked.length} skipped` : ''}.`, '',
  `Deliberate (normalized in www's answers before comparing): _tags as a set ${DELIBERATE.tags}, rich text as EDS renders it ${DELIBERATE.richText}, trailing whitespace of texts ${DELIBERATE.plaintext}, www data errors fixed ${DELIBERATE.wwwDataErrors}, empty properties [] as null ${DELIBERATE.emptyProperties}, jcr:created not compared ${DELIBERATE.created}; last-modified not compared.`, '',
  '| URL | status www / lh-edge | cache-control | equal | differences (first) |', '|---|---|---|---|---|',
  ...results.map((r) => (r.skipped ? `| ${r.url} | | | skipped | ${r.skipped} |`
    : `| ${r.url} | ${r.status.www} / ${r.status.edge} | ${r.cacheControl.edge || '-'} | ${r.equal ? 'yes' : 'no'} | ${r.differences.slice(0, 3).map((x) => `${x.kind} ${x.path}`).join('; ')}${r.count > 3 ? ` (+${r.count - 3})` : ''} |`)),
  ''];
fs.writeFileSync(path.join(outDir, `${name}.md`), md.join('\n'));
console.log(`compare-graphql: ${equal}/${checked.length} equal${results.length - checked.length ? `, ${results.length - checked.length} skipped` : ''}; deliberate ${JSON.stringify(DELIBERATE)}`);
checked.filter((r) => !r.equal).forEach((r) => console.log(`  ${r.status.www}/${r.status.edge} ${r.url.replace('/graphql/execute.json/', '')}: ${r.count} diffs, e.g. ${r.differences.slice(0, 2).map((x) => `${x.kind} ${x.path} www=${JSON.stringify(x.www)?.slice(0, 80)} edge=${JSON.stringify(x.edge)?.slice(0, 80)}`).join(' | ')}`));
