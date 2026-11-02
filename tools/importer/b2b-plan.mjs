/* eslint-disable no-console, max-len, import/extensions, import/prefer-default-export -- tooling */
/**
 * Lufthansa Group for Business' batches (lh-b2b), as brussels-plan.mjs: the Studio's 16 batches
 * (content-sites/lh-b2b/lists/batches.tsv; the snapshot archives follow them, manifest `list` =
 * batch) against the scope (content-sites/lh-b2b/scope.json, b2b-scope.mjs): each batch keeps its
 * pages that are documents of the scope (mx/en's homepage is none: decision 3); the scope's
 * documents in no Studio batch (the market roots' own pages of archive 007) join batch 16, the own
 * homepages'. Writes content-sites/lh-b2b/runs/batch-NN.txt (www URLs; a batch already imported
 * keeps its file) and plan.json (per batch its size and snapshots; the documents' markets).
 *
 * Usage: node tools/importer/b2b-plan.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { HOST } from './b2b-scope.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const W = path.join(root, 'content-sites/lh-b2b');
const SNAP = path.join(root, 'tools/importer/bd-snapshots', HOST);

/** The Studio's batches: [[path, ...], ...] (batch 1 first). */
export function studioBatches() {
  const [head, ...rows] = fs.readFileSync(path.join(W, 'lists/batches.tsv'), 'utf8').trim().split('\n');
  const keys = head.split('\t');
  const out = [];
  rows.map((l) => Object.fromEntries(l.split('\t').map((v, i) => [keys[i], v]))).forEach((b) => {
    const n = Number(b.batch);
    (out[n - 1] ||= []).push(new URL(b.url).pathname.replace(/\.html$/, '').replace(/\/$/, ''));
  });
  return out.map((b) => b || []);
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const scope = JSON.parse(fs.readFileSync(path.join(W, 'scope.json'), 'utf8'));
  const docs = scope.documents;
  const dir = path.join(W, 'runs');
  fs.mkdirSync(dir, { recursive: true });
  const studio = studioBatches();
  const batches = studio.map((b) => b.filter((p) => docs[p]));
  const outOfScope = studio.flat().filter((p) => !docs[p]);
  const inBatches = new Set(batches.flat());
  const rest = Object.keys(docs).filter((p) => !inBatches.has(p)).sort();
  batches[batches.length - 1].push(...rest);
  batches.forEach((b, i) => {
    const name = `batch-${String(i + 1).padStart(2, '0')}`;
    if (fs.existsSync(path.join(dir, `${name}-import.json`))) return;
    fs.writeFileSync(path.join(dir, `${name}.txt`), `${b.map((p) => `https://${HOST}${p}`).join('\n')}\n`);
  });
  const snapshotted = (b) => b.filter((p) => fs.existsSync(path.join(SNAP, `${p}.html`))).length;
  const markets = Object.fromEntries(Object.entries(docs).filter(([, d]) => d.markets.length).map(([p, d]) => [p, d.markets]));
  fs.writeFileSync(path.join(dir, 'plan.json'), `${JSON.stringify({
    documents: Object.keys(docs).length,
    batches: batches.map((b) => ({
      n: b.length, snapshots: snapshotted(b), first: b[0], last: b.at(-1),
    })),
    studioPagesOutOfScope: outOfScope,
    markets,
  }, null, 1)}\n`);
  console.log(`${Object.keys(docs).length} documents in ${batches.length} batches (${rest.length} scope documents in no Studio batch: batch ${batches.length}); Studio batch pages out of scope: ${outOfScope.join(' ') || 'none'}`);
  batches.forEach((b, i) => console.log(`batch ${i + 1}: ${b.length} pages (${snapshotted(b)} with a snapshot), ${b[0]} … ${b.at(-1)}`));
}
