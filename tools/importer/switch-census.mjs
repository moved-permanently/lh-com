/* eslint-disable no-console, max-len, no-await-in-loop -- tooling */
/**
 * lufthansa.com's switch census (tools/reports/token-free/lufthansa-switch-plan-923.md §14.3): after a collapse batch,
 * the style markers left in each of the batch's documents as Edge Delivery serves them, preview (aem.page) or live
 * (aem.live), from each document's .plain.html on our own hosts only (main--lh-com--moved-permanently.aem.page / .aem.live),
 * six at a time. Read-only. A marker counts as the site counts it once the switch's code is on main
 * (scripts/style-markers.js hasStyleMarkers: any "{a…}" in the text but the data placeholders {origin}, {destination},
 * {duration}, {cabin}, {language}, {locale}, {n}), so a document the census calls done draws with the switched theme.
 *
 * The documents: a batch file (tools/reports/parity-2026-11-09/delta-so60-switch-NN.txt: its READY rows, or the .json),
 * or --all (every document of tools/importer/da-upload-state.json but nav, footer and fragments).
 * Prints the documents read, missing (404) and with markers (each with its count and first spellings); exit 1 when any
 * document has markers or could not be read, else 0. Expected after a batch: "with markers 0".
 *
 * Usage: node tools/importer/switch-census.mjs --batch tools/reports/parity-2026-11-09/delta-so60-switch-01.txt [--env page|live]
 *        node tools/importer/switch-census.mjs --all [--env live] [--out census.tsv]
 */
import fs from 'node:fs';

const MARKER = /\{[a-z][^{}]{0,80}\}/g;
const PLACEHOLDER = /^\{(origin|destination|duration|cabin|language|locale|n)\}$/;

/** The text of a .plain.html (tags out, the entities the backend writes decoded). */
export function plainText(html) {
  return String(html).replace(/<[^>]+>/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

/** The style markers in a document's .plain.html, as the site counts them (data placeholders not). */
export function switchMarkers(html) {
  return (plainText(html).match(MARKER) || []).filter((m) => !PLACEHOLDER.test(m));
}

/** The paths of a batch file (.txt: READY rows, path second; .json: rows' path) or of the upload state. */
export function batchPaths(file) {
  const text = fs.readFileSync(file, 'utf8');
  if (/\.json$/.test(file)) return JSON.parse(text).map((r) => r.path);
  return text.split('\n').filter((l) => /^READY\t\//.test(l)).map((l) => l.split('\t')[1]);
}

async function get(url) {
  for (let i = 0; i < 3; i += 1) {
    try {
      const r = await fetch(url, { headers: { 'cache-control': 'no-cache' }, signal: AbortSignal.timeout(20000) });
      if (r.status === 404) return null;
      if (r.ok) return await r.text();
    } catch (e) { /* retry */ }
    await new Promise((res) => { setTimeout(res, 1500 * (i + 1)); });
  }
  return undefined;
}

async function main() {
  const argv = process.argv.slice(2);
  const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
  const env = opt('env', 'page');
  let paths;
  if (opt('batch')) paths = batchPaths(opt('batch'));
  else if (argv.includes('--all')) {
    const { docs } = JSON.parse(fs.readFileSync('tools/importer/da-upload-state.json', 'utf8'));
    paths = Object.keys(docs).filter((p) => !/\/(nav|footer)$|\/fragments\//.test(p));
  } else {
    console.error('usage: switch-census.mjs --batch <delta-so60-switch-NN.txt|.json> | --all [--env page|live] [--out file]');
    process.exit(2);
  }
  const host = `https://main--lh-com--moved-permanently.aem.${env === 'live' ? 'live' : 'page'}`;
  const rows = []; let k = 0;
  const worker = async () => {
    while (k < paths.length) {
      const p = paths[k]; k += 1;
      const t = await get(`${host}${p}.plain.html`);
      if (t === undefined) rows.push([p, 'error', '']);
      else if (t === null || /Page not found|isErrorPage/.test(t)) rows.push([p, '404', '']);
      else { const m = switchMarkers(t); rows.push([p, String(m.length), [...new Set(m)].slice(0, 4).join(' ')]); }
    }
  };
  await Promise.all([1, 2, 3, 4, 5, 6].map(worker));
  rows.sort((a, b) => a[0].localeCompare(b[0]));
  const marked = rows.filter((r) => Number(r[1]) > 0);
  const missing = rows.filter((r) => r[1] === '404');
  const errors = rows.filter((r) => r[1] === 'error');
  if (opt('out')) fs.writeFileSync(opt('out'), `path\tmarkers\tspellings\n${rows.map((r) => r.join('\t')).join('\n')}\n`);
  console.log(`lh-com ${env}: ${paths.length} documents, read ${rows.length - missing.length - errors.length}, missing ${missing.length}, errors ${errors.length}, with markers ${marked.length}`);
  marked.forEach((r) => console.log(`  markers\t${r[0]}\t${r[1]}\t${r[2]}`));
  missing.forEach((r) => console.log(`  missing\t${r[0]}`));
  errors.forEach((r) => console.log(`  error\t${r[0]}`));
  process.exit(marked.length || errors.length ? 1 : 0);
}

if (process.argv[1] && process.argv[1].endsWith('switch-census.mjs')) main();
