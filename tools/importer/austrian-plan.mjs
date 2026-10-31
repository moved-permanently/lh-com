/* eslint-disable no-console, max-len, import/extensions, import/prefer-default-export -- tooling */
/**
 * Austrian's batches (lh-austrian): the Studio's proposal (content-sites/lh-austrian/lists:
 * batch-01.txt, batches.tsv: 43 batches; the snapshot archives follow it, manifest `list` = batch)
 * against the scope (content-sites/lh-austrian/scope.json, austrian-scope.mjs): each batch keeps
 * its pages that are documents of the scope (option B: language documents, market roots' own pages
 * and homepages); scope documents in no batch (the other reference roots' linked noindex pages the
 * capture has not reached) are listed and go into extra batches at the end, after their capture.
 * Writes content-sites/lh-austrian/runs/batch-NN.txt (a batch already imported keeps its file) and
 * plan.json (per batch its size and how many pages have a snapshot; the documents' markets).
 *
 * Usage: node tools/importer/austrian-plan.mjs [--size 50]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { HOST } from './austrian-scope.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const W = path.join(root, 'content-sites/lh-austrian');
const LISTS = path.join(W, 'lists');
const SNAP = path.join(root, 'tools/importer/bd-snapshots', HOST);

/** The Studio's batches: [[path, ...], ...] (batch 1 first). */
export function studioBatches() {
  const first = fs.readFileSync(path.join(LISTS, 'batch-01.txt'), 'utf8').split('\n').map((u) => u.trim()).filter(Boolean);
  const [head, ...rows] = fs.readFileSync(path.join(LISTS, 'batches.tsv'), 'utf8').trim().split('\n');
  const keys = head.split('\t');
  const rest = rows.map((l) => Object.fromEntries(l.split('\t').map((v, i) => [keys[i], v]))).filter((b) => b.batch !== '01')
    .map((b) => (b.url_list || '').split(' ').filter((u) => u.startsWith('https://')));
  return [first, ...rest].map((b) => b.map((u) => new URL(u).pathname.replace(/\.html$/, '').replace(/\/$/, '')));
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const size = Number(argv.includes('--size') ? argv[argv.indexOf('--size') + 1] : 50);
  const scope = JSON.parse(fs.readFileSync(path.join(W, 'scope.json'), 'utf8'));
  const docs = scope.documents;
  const dir = path.join(W, 'runs');
  fs.mkdirSync(dir, { recursive: true });
  const batches = studioBatches().map((b) => b.filter((p) => docs[p]));
  const outOfScope = studioBatches().flat().filter((p) => !docs[p]);
  const inBatches = new Set(batches.flat());
  const rest = Object.keys(docs).filter((p) => !inBatches.has(p)).sort();
  for (let i = 0; i < rest.length; i += size) batches.push(rest.slice(i, i + size));
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
  console.log(`${Object.keys(docs).length} documents in ${batches.length} batches (${rest.length} scope documents in no Studio batch: batches ${batches.length - Math.ceil(rest.length / size) + 1}+); Studio batch pages out of scope: ${outOfScope.length}`);
  batches.forEach((b, i) => console.log(`batch ${i + 1}: ${b.length} pages (${snapshotted(b)} with a snapshot), ${b[0]} … ${b.at(-1)}`));
}
