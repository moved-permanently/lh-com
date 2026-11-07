/* eslint-disable import/extensions, max-len, newline-per-chained-call, no-console -- dev tooling */
// market-diff run status: what md-fetch.mjs got from a host so far, for the pilot report and progress checks. Offline,
// reads <run>/fetch.jsonl (the latest row per path) and the end of <run>/fetch.log.
//
// usage: node bin/md-status.mjs --run <dir> [--urls <file>] [--json]
// Prints: rows, paths, answered (ok, redirect, not-found, gone, forbidden), challenged/blocked, errors, the first block
// (time, path, HTTP status, cf-mitigated, page title) and the last exit line of fetch.log; with --urls also how many of
// the list's paths have a final answer.
import fs from 'node:fs';
import path from 'node:path';
import readText from '../lib/files.mjs';

const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
const RUN = path.resolve(opt('run', '.'));
const LOG = path.join(RUN, 'fetch.jsonl');
const FINAL = new Set(['ok', 'redirect', 'not-found', 'gone', 'forbidden']);
const rows = fs.existsSync(LOG) ? fs.readFileSync(LOG, 'utf8').split('\n').filter(Boolean).map((l) => {
  try { return JSON.parse(l); } catch (e) { return null; }
}).filter((r) => r && r.path) : [];
const latest = new Map();
rows.forEach((r) => latest.set(r.path, r));
const kinds = {};
latest.forEach((r) => { kinds[r.kind] = (kinds[r.kind] || 0) + 1; });
const firstBlock = rows.find((r) => r.kind === 'blocked');
const answered = [...latest.values()].filter((r) => FINAL.has(r.kind)).length;
const out = {
  run: path.basename(RUN),
  rows: rows.length,
  paths: latest.size,
  answered,
  blocked: rows.filter((r) => r.kind === 'blocked').length,
  errors: kinds.error || 0,
  kinds,
  firstBlock: firstBlock ? {
    at: firstBlock.at,
    path: firstBlock.path,
    http: firstBlock.http ?? null,
    cfMitigated: firstBlock.h?.['cf-mitigated'] || null,
    title: (firstBlock.note || '').replace(/^<title>/i, ''),
    warmup: !!firstBlock.warmup || /^warm-up/.test(firstBlock.note || ''),
  } : null,
};
const fetchLog = path.join(RUN, 'fetch.log');
if (fs.existsSync(fetchLog)) {
  const exits = fs.readFileSync(fetchLog, 'utf8').split('\n').filter((l) => /md-fetch exit \d+/.test(l));
  out.lastExit = exits.length ? exits[exits.length - 1] : null;
}
if (opt('urls')) {
  const want = [...new Set(readText(opt('urls')).split('\n').map((l) => l.replace(/#.*/, '').split('\t')[0].trim()).filter((l) => l.startsWith('/')))];
  out.list = { paths: want.length, answered: want.filter((p) => FINAL.has(latest.get(p)?.kind)).length };
}
if (argv.includes('--json')) console.log(JSON.stringify(out, null, 1));
else {
  console.log(`${out.run}: ${out.paths} paths, ${out.answered} answered, ${out.blocked} blocked, ${out.errors} errors ${JSON.stringify(kinds)}${out.list ? `; list ${out.list.answered}/${out.list.paths}` : ''}`);
  if (out.firstBlock) console.log(`first block: ${out.firstBlock.at} ${out.firstBlock.path} HTTP ${out.firstBlock.http} cf-mitigated ${out.firstBlock.cfMitigated || '-'} "${out.firstBlock.title}"${out.firstBlock.warmup ? ' (warm-up page)' : ''}`);
  if (out.lastExit) console.log(out.lastExit);
}
