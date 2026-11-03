/* eslint-disable no-console, max-len, import/extensions, import/prefer-default-export -- tooling */
/**
 * SWISS's batches (lh-swiss): the Studio's proposal (content-sites/lh-swiss/lists:
 * batch-01.txt, batches.tsv; the snapshot archives follow it, manifest `list` = batch) and the
 * archives' two extra lists, c1 (the forms' confirmation pages) and x01 (the link scan's pages
 * outside the sitemaps; the language archives' p and x lists), from the capture state
 * (swiss-studio.mjs), the roots imported so far only: their other roots' pages wait for those roots' batches
 * against the scope (content-sites/lh-swiss/scope.json, swiss-scope.mjs): each batch keeps
 * its pages that are documents of the scope (option B: language documents, market roots' own pages
 * and homepages); scope documents in no batch (the other reference roots' linked pages outside the sitemap the
 * capture has not reached) are listed and go into extra batches at the end, after their capture.
 * Writes content-sites/lh-swiss/runs/batch-NN.txt, batch-c1.txt, batch-x01.txt (a batch already
 * imported keeps its file) and
 * plan.json (per batch its size and how many pages have a snapshot; the documents' markets).
 *
 * Usage: node tools/importer/swiss-plan.mjs [--size 50]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { HOST } from './swiss-scope.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const W = path.join(root, 'content-sites/lh-swiss');
const LISTS = path.join(W, 'lists');
const SNAP = path.join(root, 'tools/importer/bd-snapshots', HOST);

// the roots imported so far (the pilot's ch/en and ch/de; ch/fr and ch/it, brief 272; ch/es and
// ch/pt, brief 279; ch/zh and ch/ja, brief 28x; ch/el and ch/ru, brief 283): the extra lists'
// pages of other roots go with those roots' batches
export const IMPORTED_ROOTS = ['ch/en', 'ch/de', 'ch/fr', 'ch/it', 'ch/es', 'ch/pt', 'ch/zh', 'ch/ja', 'ch/el', 'ch/ru'];
// a Studio batch's list (01 to 53); every other list of the capture is an extra list (c1, x01, the
// language archives' p11, x11, p15, x15 ...)
const STUDIO_LIST = /^\d+$/;

/** The archives' extra lists: { c1: [path, ...], x01: [...], p11: [...] }, the given roots only. */
export function extraBatches(pages, roots = IMPORTED_ROOTS) {
  const out = {};
  Object.keys(pages).forEach((u) => {
    const { status, list } = pages[u];
    if (status !== 'ok' || !list || STUDIO_LIST.test(list)) return;
    const p = new URL(u).pathname.replace(/\.html$/, '').replace(/\/$/, '');
    if (!roots.some((r) => p.startsWith(`/${r}/`))) return;
    (out[list] ||= []).push(p);
  });
  return out;
}

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
  const { pages } = JSON.parse(fs.readFileSync(path.join(W, 'bd-session-state.json'), 'utf8'));
  const extra = Object.entries(extraBatches(pages)).map(([l, b]) => [l, b.filter((p) => docs[p])]);
  const outOfScope = studioBatches().flat().concat(Object.values(extraBatches(pages)).flat()).filter((p) => !docs[p]);
  const inBatches = new Set(batches.flat().concat(extra.flatMap(([, b]) => b)));
  const rest = Object.keys(docs).filter((p) => !inBatches.has(p)).sort();
  for (let i = 0; i < rest.length; i += size) batches.push(rest.slice(i, i + size));
  const named = batches.map((b, i) => [String(i + 1).padStart(2, '0'), b]).concat(extra);
  named.forEach(([n, b]) => {
    const name = `batch-${n}`;
    if (fs.existsSync(path.join(dir, `${name}-import.json`))) return;
    fs.writeFileSync(path.join(dir, `${name}.txt`), `${b.map((p) => `https://${HOST}${p}`).join('\n')}\n`);
  });
  const snapshotted = (b) => b.filter((p) => fs.existsSync(path.join(SNAP, `${p}.html`))).length;
  const markets = Object.fromEntries(Object.entries(docs).filter(([, d]) => d.markets.length).map(([p, d]) => [p, d.markets]));
  fs.writeFileSync(path.join(dir, 'plan.json'), `${JSON.stringify({
    documents: Object.keys(docs).length,
    batches: named.map(([name, b]) => ({
      name, n: b.length, snapshots: snapshotted(b), first: b[0], last: b.at(-1),
    })),
    studioPagesOutOfScope: outOfScope,
    markets,
  }, null, 1)}\n`);
  console.log(`${Object.keys(docs).length} documents in ${batches.length} batches (${rest.length} scope documents in no Studio batch: batches ${batches.length - Math.ceil(rest.length / size) + 1}+); Studio batch pages out of scope: ${outOfScope.length}`);
  named.forEach(([n, b]) => console.log(`batch ${n}: ${b.length} pages (${snapshotted(b)} with a snapshot), ${b[0]} … ${b.at(-1)}`));
}
