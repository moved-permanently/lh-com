/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, max-len, import/no-relative-packages */
/**
 * Compares lh-edge's header, footer and portal configuration JSON and the login link with www's
 * recorded answers (tools/source-export/feeds/owa/, feeds/login/loginpageurl.json):
 * - the JSON of each recorded URL (de/en, de/de, at/de, gb/en): status, content type,
 *   cache-control and the body, field by field (the differing paths are listed);
 * - the login answers: status, headers and the body apart from state (the replica's pages are
 *   the state www's pages are);
 * - the vanity form /<cc>/<ll>/homepage.csi-owa-header.json answers 404, as www.
 *
 * Usage: node compare-owa.mjs --host https://lhedge.bbird.live | --local
 *   --local: the Worker in Node with the local nav and footer documents and the seed sheet
 *            tools/importer/owa-tracking-sheet.json (before they are published)
 * Report: tools/reports/lh-edge/compare-owa[-local].md and .json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const argv = process.argv.slice(2);
const local = argv.includes('--local');
const host = argv.includes('--host') ? argv[argv.indexOf('--host') + 1].replace(/\/$/, '') : '';
if (!local && !host) {
  console.error('usage: compare-owa.mjs --host https://lhedge.bbird.live | --local');
  process.exit(1);
}
const FEEDS = path.join(root, 'tools/source-export/feeds');
const read = (p) => fs.readFileSync(p, 'utf8');
const SELF = local ? 'https://lh-edge.local' : host;

let worker;
if (local) {
  const sheet = read(path.join(root, 'tools/importer/owa-tracking-sheet.json'));
  globalThis.fetch = async (input) => {
    const req = input instanceof Request ? input : new Request(input);
    const u = new URL(req.url);
    const doc = u.pathname.match(/^\/([a-z]{2}\/[a-z]{2})\/(nav|footer)\.plain\.html$/);
    if (doc) return new Response(read(path.join(root, 'content', doc[1], `${doc[2]}.plain.html`)));
    if (u.pathname === '/app/config/owa-tracking.json') return new Response(sheet, { headers: { 'content-type': 'application/json' } });
    return new Response('Not found', { status: 404 });
  };
  ({ default: worker } = await import('./src/index.js'));
}

async function ask(url, headers = {}) {
  if (local) return worker.fetch(new Request(`${SELF}${url}`, { headers }), { ORIGIN: 'main--lh-com--moved-permanently.aem.live', PUBLIC_HOST: '', EDGE_TTL: '60' }, {});
  return fetch(`${host}${url}`, { headers, redirect: 'manual' });
}

/** The paths where two JSON values differ. */
function diff(a, b, at = '') {
  if (typeof a !== typeof b || Array.isArray(a) !== Array.isArray(b) || a === null || b === null) return a === b ? [] : [`${at || '/'}: ${JSON.stringify(a)?.slice(0, 80)} / ${JSON.stringify(b)?.slice(0, 80)}`];
  if (typeof a !== 'object') return a === b ? [] : [`${at}: ${JSON.stringify(a).slice(0, 80)} / ${JSON.stringify(b).slice(0, 80)}`];
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])];
  const out = keys.flatMap((k) => diff(a[k], b[k], `${at}/${k}`));
  if (!Array.isArray(a) && JSON.stringify(Object.keys(a)) !== JSON.stringify(Object.keys(b)) && !out.length) out.push(`${at || '/'}: key order`);
  return out;
}

const results = [];
const owa = JSON.parse(read(path.join(FEEDS, 'owa/index.json'))).urls;
for (const [url, rec] of Object.entries(owa)) {
  const resp = await ask(url);
  const d = [];
  if (resp.status !== rec.status) d.push(`status ${rec.status} / ${resp.status}`);
  ['content-type', 'cache-control'].forEach((h) => {
    if ((resp.headers.get(h) || '') !== (rec.headers[h] || '')) d.push(`${h} ${rec.headers[h]} / ${resp.headers.get(h)}`);
  });
  let body = null;
  try { body = await resp.json(); } catch (e) { d.push('body is not JSON'); }
  if (body) d.push(...diff(JSON.parse(read(path.join(FEEDS, rec.file))), body));
  results.push({ kind: 'owa', url, differences: d });
}

const login = JSON.parse(read(path.join(FEEDS, 'login/loginpageurl.json'))).answers.filter((a) => a.status === 200);
const noState = (s) => String(s).replace(/([?&]state=)[^&"]*/, '$1<state>');
for (const a of login) {
  const resp = await ask(a.url, a.headers);
  const d = [];
  if (resp.status !== a.status) d.push(`status ${a.status} / ${resp.status}`);
  [['content-type', a.ct], ['cache-control', a.cc], ['access-control-allow-origin', a.acao]].forEach(([h, v]) => {
    if ((resp.headers.get(h) || '') !== v) d.push(`${h} ${v} / ${resp.headers.get(h)}`);
  });
  const text = await resp.text();
  if (noState(text) !== noState(a.body)) d.push(`body ${noState(text).slice(0, 120)} / ${noState(a.body).slice(0, 120)}`);
  results.push({ kind: 'login', url: `${a.url} (${a.headers['X-Portal-Site']}/${a.headers['X-Portal-Language']})`, differences: d });
}

const vanity = await ask('/de/en/homepage.csi-owa-header.json');
results.push({ kind: 'vanity', url: '/de/en/homepage.csi-owa-header.json', differences: vanity.status === 404 ? [] : [`status 404 / ${vanity.status}`] });

const equal = results.filter((r) => !r.differences.length).length;
const name = local ? 'compare-owa-local' : 'compare-owa';
const outDir = path.join(root, 'tools/reports/lh-edge');
fs.mkdirSync(outDir, { recursive: true });
const report = {
  checkedAt: new Date().toISOString(), edge: local ? 'the Worker in Node, local documents and the seed sheet' : host, equal, total: results.length, results,
};
fs.writeFileSync(path.join(outDir, `${name}.json`), `${JSON.stringify(report, null, 1)}\n`);
fs.writeFileSync(path.join(outDir, `${name}.md`), [
  `# Header and footer JSON, login link: lh-edge vs www (${report.edge})`, '', report.checkedAt, '',
  `${equal}/${results.length} equal (login answers apart from state).`, '',
  '| kind | URL | differences |', '|---|---|---|',
  ...results.map((r) => `| ${r.kind} | \`${r.url}\` | ${r.differences.length ? r.differences.slice(0, 6).join('; ').replace(/\|/g, '\\|') : 'equal'} |`), '',
].join('\n'));
console.log(`compare-owa: ${equal}/${results.length} equal`);
results.filter((r) => r.differences.length).forEach((r) => console.log(`  ${r.url}: ${r.differences.slice(0, 4).join('; ')}`));
