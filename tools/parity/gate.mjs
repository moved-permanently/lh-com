/* eslint-disable no-console -- dev tooling */
/**
 * The 0.5 gate over two compare.js runs (base, trial) of the same page-widths, with the reason for
 * every page-width that got worse (standing order 19 of 2026-11-14).
 *
 * node tools/parity/gate.mjs --pairs pairs.tsv [--gate 0.5]
 *   pairs.tsv: label<TAB>base compare json<TAB>trial compare json (compare.js's <out>.json)
 * node tools/parity/gate.mjs --base <dir> --trial <dir> [--gate 0.5]
 *   the compare json files of both folders, paired by file name
 *
 * Per page-width: base and trial %, the change, and
 *   better | same (within the gate) | worse: compensation removed | worse: fix wrong |
 *   worse: not in the drift
 * Reading the drift profiles (compare.js "drift", the offset of ours to www per 100 px window of
 * www) top-down, the first window whose offset changed by 4 px or more is where the trial acts
 * (windows that match badly, 10 % or more once aligned, are skipped):
 *   - it comes closer to www there, and further down a window gets further from www than before:
 *     "compensation removed" - the fix is right where it acts and uncovered a drift below
 *     (uncoveredAt) that the old offset had cancelled; fix that one too and gate the pair;
 *   - it gets further from www there: "fix wrong";
 *   - no offset changed, or none got worse: "not in the drift" (what is drawn differs).
 * The gate itself is unchanged: it passes when no page-width is worse by more than --gate points.
 * Exit code 0 when the gate passes, 1 when not, 2 on bad input.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const CHANGED = 4;
const BAD = 10;

const pct = (r) => Math.round(r.unmaskedRatio * 10000) / 100;

/** The verdict for one page-width from its base and trial compare results. */
// eslint-disable-next-line import/prefer-default-export -- the CLI is the other use
export function gateVerdict(base, trial, { gate = 0.5 } = {}) {
  const delta = Math.round((pct(trial) - pct(base)) * 100) / 100;
  const out = { base: pct(base), trial: pct(trial), delta };
  if (delta < -gate) return { ...out, verdict: 'better' };
  if (delta <= gate) return { ...out, verdict: 'same' };
  const bw = (base.drift && base.drift.windows) || [];
  const tw = new Map(((trial.drift && trial.drift.windows) || []).map((w) => [w[0], w]));
  const both = bw.map((w) => [w, tw.get(w[0])]).filter(([b, t]) => t && b[2] < BAD && t[2] < BAD);
  const first = both.find(([b, t]) => Math.abs(Math.abs(t[1]) - Math.abs(b[1])) >= CHANGED);
  if (!first) return { ...out, verdict: 'worse: not in the drift' };
  const [fb, ft] = first;
  if (Math.abs(ft[1]) > Math.abs(fb[1])) return { ...out, verdict: 'worse: fix wrong', fixAt: fb[0] };
  const below = both.find(([b, t]) => b[0] > fb[0] && Math.abs(t[1]) >= Math.abs(b[1]) + CHANGED);
  if (!below) return { ...out, verdict: 'worse: not in the drift', fixAt: fb[0] };
  return {
    ...out,
    verdict: 'worse: compensation removed',
    fixAt: fb[0],
    uncoveredAt: below[0][0],
    offsetBefore: below[0][1],
    offsetAfter: below[1][1],
  };
}

const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));

function pairsFrom(args) {
  if (args.pairs) {
    return fs.readFileSync(args.pairs, 'utf8').split('\n').filter((l) => l.trim() && !l.startsWith('#'))
      .map((l) => l.split('\t'))
      .map(([label, b, t]) => ({ label, b, t }));
  }
  const files = (d) => fs.readdirSync(d).filter((f) => f.endsWith('.json'));
  const tset = new Set(files(args.trial));
  return files(args.base).filter((f) => tset.has(f))
    .map((f) => ({ label: f.replace(/\.json$/, ''), b: path.join(args.base, f), t: path.join(args.trial, f) }));
}

function main() {
  const { values: args } = parseArgs({
    options: {
      pairs: { type: 'string' }, base: { type: 'string' }, trial: { type: 'string' }, gate: { type: 'string', default: '0.5' },
    },
  });
  if (!args.pairs && !(args.base && args.trial)) {
    console.error('usage: node tools/parity/gate.mjs --pairs pairs.tsv | --base <dir> --trial <dir> [--gate 0.5]');
    process.exit(2);
  }
  const gate = Number(args.gate);
  const rows = pairsFrom(args).map(({ label, b, t }) => {
    const base = readJson(b);
    const trial = readJson(t);
    if (!Number.isFinite(base.unmaskedRatio) || !Number.isFinite(trial.unmaskedRatio)) return null;
    return { label, ...gateVerdict(base, trial, { gate }) };
  }).filter(Boolean);
  rows.sort((p, q) => q.delta - p.delta).forEach((r) => {
    let where = r.fixAt !== undefined ? `\tacts at www y ${r.fixAt}` : '';
    if (r.verdict === 'worse: compensation removed') {
      const d = r.offsetAfter - r.offsetBefore;
      where += `, uncovers ${d >= 0 ? '+' : ''}${d} px at www y ${r.uncoveredAt}`;
    }
    console.log(`${r.label}\t${r.base} -> ${r.trial}\t${r.delta >= 0 ? '+' : ''}${r.delta}\t${r.verdict}${where}`);
  });
  const count = (v) => rows.filter((r) => r.verdict === v).length;
  const worse = rows.filter((r) => r.verdict.startsWith('worse'));
  console.log(`# ${rows.length} page-widths: ${count('better')} better, ${count('same')} within ${gate}, ${worse.length} worse (${count('worse: compensation removed')} compensation removed, ${count('worse: fix wrong')} fix wrong, ${count('worse: not in the drift')} not in the drift); gate ${worse.length ? 'fails' : 'passes'}`);
  process.exit(worse.length ? 1 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
