/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, max-len -- tooling */
/**
 * TAP's airport sheets for the booking box (tools/reports/tap/booking-spec.md 5.3): per root one
 * POST https://www.flytap.com/api/flight?functionName=originSearch with the spec's body (the root's
 * language and market), at least 10 s apart; the answer's entries, in TAP's order, as the DA sheet
 * /<root>/booking/airports (columns code, city, cityName, airportName, country, countryName,
 * tapRoute, railway). Public and read-only: no account, no cookie. An answer that is not JSON with
 * an airport list stops the run (nothing is written for that root or after it).
 *
 * Usage: node tools/importer/tap-airports.mjs [--root pt-pt ...] --fetch | --sheet | --upload | --check
 *   --fetch   the answers -> content-sites/lh-tap/runs/airports/<root>.json (gitignored)
 *   --sheet   the sheets  -> content-sites/lh-tap/content/<root>/booking/airports.json (gitignored)
 *   --upload  the sheets to DA moved-permanently/lh-tap and their preview (never live)
 *   --check   each preview's .../booking/airports.json?limit=5000 has every row of its sheet
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const W = path.join(root, 'content-sites/lh-tap');
const ORG = 'moved-permanently';
const SITE = 'lh-tap';
const PREVIEW = `https://main--${SITE}--${ORG}.aem.page`;
export const ENDPOINT = 'https://www.flytap.com/api/flight?functionName=originSearch';
export const PAUSE_MS = 12000;
export const COLUMNS = ['code', 'city', 'cityName', 'airportName', 'country', 'countryName', 'tapRoute', 'railway'];
/** The live roots: <ll>-<cc>, the language and the market of each. */
export const ROOTS = Object.fromEntries(['pt-pt', 'en-pt', 'es-es', 'fr-fr', 'de-de', 'it-it', 'pl-pl']
  .map((r) => [r, { language: r.split('-')[0], market: r.split('-')[1].toUpperCase() }]));

/** originSearch's body for a root, as the spec records it (Lisbon's coordinates, return trips). */
export function requestBody(r) {
  const x = ROOTS[r];
  if (!x) throw new Error(`tap-airports: ${r} is not a live root (${Object.keys(ROOTS).join(', ')})`);
  return {
    airlineIds: ['TP'], language: x.language, latitude: 38.7071, longitude: -9.13549, market: x.market, payWithMiles: false, tripType: 'R',
  };
}

const str = (v) => (v === null || v === undefined ? '' : String(v));
/** An entry of the answer as a sheet row (the flags as true/false). */
export function rowOf(e) {
  return {
    code: str(e.airport),
    city: str(e.city),
    cityName: str(e.cityName),
    airportName: str(e.airportName),
    country: str(e.country),
    countryName: str(e.countryName),
    tapRoute: e.tapRoute ? 'true' : 'false',
    railway: e.isRailway ? 'true' : 'false',
  };
}

/** The sheet's rows: every entry with an airport code, in TAP's order. */
export const rowsOf = (entries) => entries.filter((e) => e && e.airport).map(rowOf);

/** DA's single-sheet JSON. */
export const sheetOf = (rows) => ({
  total: rows.length, limit: rows.length, offset: 0, data: rows, ':sheetname': 'data', ':type': 'sheet',
});

/** The entries of an answer {status, contentType, body}; anything but JSON with a list throws. */
export function parseAnswer({ status, contentType, body }) {
  if (status !== 200) throw new Error(`TAP answered ${status}`);
  if (!/^application\/json\b/i.test(contentType || '')) throw new Error(`TAP's answer is not JSON (${contentType || 'no content type'})`);
  let json;
  try { json = JSON.parse(body); } catch (e) { throw new Error('TAP\'s answer is not JSON (does not parse)'); }
  const list = Array.isArray(json) ? json : Object.values(json || {}).find((v) => Array.isArray(v) && v.length && v[0] && typeof v[0] === 'object' && 'airport' in v[0]);
  if (!list) throw new Error('TAP\'s answer has no airport list');
  return list;
}

const run = promisify(execFile);
async function curl(args) {
  const { stdout } = await run('curl', ['-s', '-w', '\n%{http_code}\n%{content_type}', ...args], { maxBuffer: 32 * 1024 * 1024 });
  const lines = stdout.split('\n');
  const contentType = lines.pop();
  const status = Number(lines.pop());
  return { status, contentType, body: lines.join('\n') };
}
const answerFile = (r) => path.join(W, 'runs/airports', `${r}.json`);
const sheetFile = (r) => path.join(W, 'content', r, 'booking/airports.json');
const sleep = (ms) => new Promise((res) => { setTimeout(res, ms); });

async function fetchAll(roots) {
  for (let i = 0; i < roots.length; i += 1) {
    const r = roots[i];
    if (i) await sleep(PAUSE_MS);
    const a = await curl(['-X', 'POST', '-H', 'content-type: application/json', '-H', 'accept: application/json',
      '-A', 'Mozilla/5.0 (X11; Linux x86_64) lh-com-migration (TAP airport sheet; one request per language)',
      '--data', JSON.stringify(requestBody(r)), ENDPOINT]);
    const entries = parseAnswer(a); // throws on anything but JSON: the run stops here
    fs.mkdirSync(path.dirname(answerFile(r)), { recursive: true });
    fs.writeFileSync(answerFile(r), `${JSON.stringify({
      at: new Date().toISOString(), body: requestBody(r), contentType: a.contentType, entries,
    }, null, 1)}\n`);
    console.log(`${r}: ${entries.length} entries (${a.contentType}, ${a.body.length} B)`);
  }
}

function sheets(roots) {
  roots.forEach((r) => {
    const { entries } = JSON.parse(fs.readFileSync(answerFile(r), 'utf8'));
    const rows = rowsOf(entries);
    fs.mkdirSync(path.dirname(sheetFile(r)), { recursive: true });
    fs.writeFileSync(sheetFile(r), `${JSON.stringify(sheetOf(rows), null, 1)}\n`);
    const codes = new Set(rows.map((x) => x.code));
    console.log(`${r}: ${rows.length} rows (${rows.filter((x) => x.tapRoute === 'true').length} TAP routes, ${rows.filter((x) => x.railway === 'true').length} rail stations, ${rows.length - codes.size} repeated codes) -> ${path.relative(root, sheetFile(r))}`);
  });
}

async function upload(roots) {
  let bad = 0;
  for (const r of roots) {
    const p = `/${r}/booking/airports.json`;
    const up = await curl(['-X', 'POST', '-F', `data=@"${sheetFile(r)}";type=application/json`, `https://admin.da.live/source/${ORG}/${SITE}${p}`]);
    const pv = up.status >= 200 && up.status < 300 ? await curl(['-X', 'POST', `https://admin.hlx.page/preview/${ORG}/${SITE}/main${p}`]) : { status: 0 };
    console.log(`${r}: DA ${up.status}, preview ${pv.status}`);
    if (pv.status !== 200) bad += 1;
  }
  return bad;
}

async function check(roots) {
  let bad = 0;
  for (const r of roots) {
    const want = JSON.parse(fs.readFileSync(sheetFile(r), 'utf8')).data;
    const a = await curl([`${PREVIEW}/${r}/booking/airports.json?limit=5000`]);
    let got = null;
    try { got = JSON.parse(a.body); } catch (e) { /* not JSON */ }
    const same = got && got.total === want.length && got.data && got.data.length === want.length
      && got.data.every((row, i) => COLUMNS.every((c) => String(row[c]) === want[i][c]));
    console.log(`${r}: preview ${a.status}, ${got ? `${got.total} total, ${got.data.length} rows` : 'no JSON'}; ${same ? 'every row as in the sheet' : 'DIFFERS'}`);
    if (!same) bad += 1;
  }
  return bad;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2);
  const picked = argv.flatMap((a, i) => (a === '--root' ? [argv[i + 1]] : []));
  const roots = picked.length ? picked : Object.keys(ROOTS);
  roots.forEach(requestBody); // an unknown root stops before any request
  let code = 0;
  try {
    if (argv.includes('--fetch')) await fetchAll(roots);
    if (argv.includes('--sheet')) sheets(roots);
    if (argv.includes('--upload')) code += await upload(roots);
    if (argv.includes('--check')) code += await check(roots);
  } catch (e) {
    console.error(`tap-airports stopped: ${e.message}`);
    code = 1;
  }
  process.exit(code ? 1 : 0);
}
