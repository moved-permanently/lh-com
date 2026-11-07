/* eslint-disable import/extensions, max-len, no-console -- dev tooling */
// market-diff pending pairs: splits a pair list by what an earlier fetch run already has. A pair is done when both its
// pages have a final answer in <fetch>/fetch.jsonl (ok, redirect, not-found, gone, forbidden); every other pair is
// pending. With --compare (md-compare.mjs's results of the done pairs), done pairs whose verdict is not "same" go back
// into the pending list, so that the next run fetches both their pages again and its report and import cover them.
//
// usage: node bin/md-pending.mjs --pairs <pairs.tsv[.gz]> --fetch <dir> --out <pending.tsv[.gz]>
//          [--done-out <done.tsv>] [--compare <md-compare out dir>] [--summary <file.json>]
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import readText from '../lib/files.mjs';

const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
if (!opt('pairs') || !opt('fetch') || !opt('out')) {
  console.error('usage: md-pending.mjs --pairs <tsv> --fetch <dir> --out <tsv> [--done-out <tsv>] [--compare <dir>] [--summary <json>]');
  process.exit(1);
}
const FINAL = new Set(['ok', 'redirect', 'not-found', 'gone', 'forbidden']);
const latest = new Map();
fs.readFileSync(path.join(opt('fetch'), 'fetch.jsonl'), 'utf8').split('\n').filter(Boolean).forEach((l) => {
  try { const r = JSON.parse(l); if (r.path) latest.set(r.path, r); } catch (e) { /* torn line */ }
});
const lines = readText(opt('pairs')).split('\n').filter((l) => l.trim() && !l.startsWith('#'));
const headLine = lines.shift();
const head = headLine.split('\t');
const ri = head.indexOf('root_path');
const vi = head.indexOf('version_path');
const rootI = head.indexOf('root');
const restI = head.indexOf('rest');
const verdicts = new Map();
if (opt('compare')) {
  fs.readFileSync(path.join(opt('compare'), 'results.jsonl'), 'utf8').split('\n').filter(Boolean).forEach((l) => {
    const r = JSON.parse(l);
    verdicts.set(`${r.root}|${r.rest}`, `${r.verdict}/${r.class}`);
  });
}
const done = [];
const pending = [];
const back = {};
lines.forEach((l) => {
  const c = l.split('\t');
  const fetched = FINAL.has(latest.get(c[ri])?.kind) && FINAL.has(latest.get(c[vi])?.kind);
  const v = verdicts.get(`${c[rootI]}|${c[restI]}`);
  if (fetched && (!opt('compare') || (v && v.startsWith('same/')))) done.push(l);
  else {
    if (fetched) back[v || 'no-verdict'] = (back[v || 'no-verdict'] || 0) + 1;
    pending.push(l);
  }
});
const write = (f, rowsOut) => {
  const text = `${headLine}\n${rowsOut.join('\n')}\n`;
  fs.writeFileSync(f, f.endsWith('.gz') ? zlib.gzipSync(text, { level: 9 }) : text);
};
write(opt('out'), pending);
if (opt('done-out')) write(opt('done-out'), done);
const summary = {
  pairs: lines.length, done: done.length, pending: pending.length, doneButNotSame: back,
};
if (opt('summary')) fs.writeFileSync(opt('summary'), `${JSON.stringify(summary, null, 1)}\n`);
console.log(JSON.stringify(summary));
