/* eslint-disable no-console, max-len, import/extensions -- tooling */
/**
 * Lufthansa Group for Business' site (lh-b2b): the scope from the Studio's groundwork lists
 * (content-sites/lh-b2b/lists: roots.tsv, urls-reference-de-*.txt, batches.tsv, leave-out.tsv) and
 * the snapshots (tools/importer/bd-snapshots/business.lufthansagroup.com, b2b-studio.mjs), option B
 * as brussels-scope.mjs (decisions 1 to 3 of the groundwork's 10a):
 * - the language documents: every kept page of the reference roots de/en and de/de (the crawl's
 *   lists, with the raffle's confirmation page no page links);
 * - the rest-of-world documents: the pages where xx/<ll> differs from de (batches 14 and 15), with
 *   `markets` every root of the language but de (and the roots with an own page of that path);
 *   the de document of such a path serves de only;
 * - own documents: the market pages that differ from what the reference would serve (archive 007:
 *   ch/en, at/de) and the own homepages us/en and ca/en (mx/en's older homepage and al/*'s are not
 *   imported: those roots are served from the reference);
 * - leave out: leave-out.tsv (login and its helpers, member pages, the empty member shell,
 *   /experts-members/**, the eXperts sign-in, 404s), anything under /lhg/;
 * - paths with "--" (Edge Delivery refuses them in a segment) and upper case or "_" get the
 *   document name docName() gives them: runs/redirects.tsv lists www's path and the new one.
 * Writes content-sites/lh-b2b/scope.json (gitignored) and prints the numbers.
 *
 * Usage: node tools/importer/b2b-scope.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const HOST = 'business.lufthansagroup.com';
const W = path.join(root, 'content-sites/lh-b2b');
const LISTS = path.join(W, 'lists');
const SNAP = path.join(root, 'tools/importer/bd-snapshots', HOST);
export const LANGUAGE_VERSIONS = { en: 'de/en', de: 'de/de' };
export const REFERENCE_ROOTS = Object.values(LANGUAGE_VERSIONS);
// the own documents of market roots (archive 007, the Studio's comparison of ch/en and at/de with
// xx) and the own homepages (us/en, ca/en: de/en with one more Allegris teaser)
const OWN_ARCHIVE = path.join(W, 'inputs/b2b-snapshots-007/x/manifest.json');
export const OWN_HOMEPAGES = ['/us/en/homepage', '/ca/en/homepage'];

/**
 * The document name of a www path, as Edge Delivery names it: lower case, "_" as "-", no "--", no
 * "-" at the start or end of a segment.
 */
export const docName = (p) => p.toLowerCase().replace(/_/g, '-').replace(/-{2,}/g, '-')
  .split('/').map((seg) => seg.replace(/^-+|-+$/g, '')).join('/');

const tsv = (f) => {
  const [head, ...rows] = fs.readFileSync(path.join(LISTS, f), 'utf8').trim().split('\n');
  const keys = head.split('\t');
  return rows.map((l) => Object.fromEntries(l.split('\t').map((v, i) => [keys[i], v])));
};
const pathOf = (u) => new URL(u).pathname.replace(/\.html$/, '').replace(/\/$/, '');
const lines = (f) => fs.readFileSync(path.join(LISTS, f), 'utf8').split('\n').map((u) => u.trim()).filter((u) => u.startsWith('https://'));

/** The scope: { roots: {root: {lang}}, documents: {www path: {kind, doc, markets}}, redirects }. */
export function buildScope() {
  const roots = {};
  // the reference roots (crawled, not in roots.tsv) and the market roots that answer (us/de, ca/de
  // and mx/de answer 500 on www: none)
  [...REFERENCE_ROOTS, ...tsv('roots.tsv').filter((r) => r.status === '200').map((r) => r.root)].forEach((r) => { roots[r] = { lang: r.split('/')[1] }; });
  const leave = new Set(tsv('leave-out.tsv').map((r) => { try { return pathOf(r.url); } catch (e) { return ''; } }).filter(Boolean));
  const out = (p) => leave.has(p) || /^\/lhg(\/|$)/.test(p) || /\/experts-members(\/|$)/.test(p);
  const batches = tsv('batches.tsv');
  const documents = {};
  const add = (p, kind) => {
    if (out(p)) return;
    if (!fs.existsSync(path.join(SNAP, `${p}.html`))) {
      (documents[p] = {
        kind, doc: docName(p), markets: [], noSnapshot: true,
      }); return;
    }
    documents[p] = { kind, doc: docName(p), markets: [] };
  };
  // language documents: the crawl's kept pages and the batches' pages of the reference roots
  REFERENCE_ROOTS.forEach((ref) => {
    const ll = ref.split('/')[1];
    lines(`urls-reference-de-${ll}.txt`).map(pathOf).forEach((p) => add(p, 'language'));
    batches.filter((b) => b.root === ref).map((b) => pathOf(b.url)).forEach((p) => add(p, 'language'));
  });
  // rest-of-world documents (batches 14, 15) and own documents (archive 007, us/en, ca/en)
  batches.filter((b) => /^xx\//.test(b.root)).map((b) => pathOf(b.url)).forEach((p) => add(p, 'rest of world'));
  const own = fs.existsSync(OWN_ARCHIVE) ? JSON.parse(fs.readFileSync(OWN_ARCHIVE, 'utf8')).filter((m) => m.status === 'ok').map((m) => pathOf(m.url)) : [];
  [...own, ...OWN_HOMEPAGES].forEach((p) => add(p, p.endsWith('/homepage') ? 'market homepage' : 'own'));
  // markets: per language and path, which roots have a document of their own
  const suffix = (p) => p.replace(/^\/[a-z]{2}\/[a-z]{2}/, '');
  const rootOf = (p) => p.split('/').slice(1, 3).join('/');
  const ownRoots = {};
  Object.entries(documents).forEach(([p, d]) => {
    if (d.kind === 'language') return;
    (ownRoots[`${roots[rootOf(p)]?.lang} ${suffix(p)}`] ||= []).push(rootOf(p));
  });
  const ofLang = (ll) => Object.keys(roots).filter((r) => roots[r].lang === ll).sort();
  Object.entries(documents).forEach(([p, d]) => {
    const r = rootOf(p);
    const ll = roots[r]?.lang || r.split('/')[1];
    const others = ownRoots[`${ll} ${suffix(p)}`] || [];
    if (d.kind === 'language') {
      // a path with a rest-of-world document: the de document serves de only
      d.markets = others.includes(`xx/${ll}`) ? [r] : ofLang(ll).filter((x) => x !== r && !others.includes(x));
    } else if (d.kind === 'rest of world') {
      d.markets = ofLang(ll).filter((x) => x !== r && x !== LANGUAGE_VERSIONS[ll] && !others.includes(x));
    }
  });
  const redirects = Object.entries(documents).filter(([p, d]) => d.doc !== p).map(([p, d]) => [p, d.doc]);
  return {
    recorded: new Date().toISOString(), roots, documents, redirects,
  };
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const scope = buildScope();
  fs.mkdirSync(path.join(W, 'runs'), { recursive: true });
  fs.writeFileSync(path.join(W, 'scope.json'), `${JSON.stringify(scope, null, 1)}\n`);
  fs.writeFileSync(path.join(W, 'runs/redirects.tsv'), `www path\tdocument path\n${scope.redirects.map((r) => r.join('\t')).join('\n')}\n`);
  const kinds = {};
  Object.values(scope.documents).forEach((d) => { kinds[d.kind] = (kinds[d.kind] || 0) + 1; });
  const noSnap = Object.entries(scope.documents).filter(([, d]) => d.noSnapshot).map(([p]) => p);
  console.log(`${Object.keys(scope.roots).length} roots, ${Object.keys(scope.documents).length} documents (${Object.entries(kinds).map(([k, n]) => `${k} ${n}`).join(', ')}); renamed ${scope.redirects.length}; without a snapshot ${noSnap.length}${noSnap.length ? `: ${noSnap.join(' ')}` : ''}`);
}
