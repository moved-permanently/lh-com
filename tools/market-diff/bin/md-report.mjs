/* eslint-disable import/extensions, max-len, newline-per-chained-call, no-console, no-continue, no-mixed-operators, no-restricted-syntax, object-curly-newline, object-property-newline, prefer-template -- dev tooling */
// market-diff report for one airline: reads md-compare.mjs's results (and md-replica-check.mjs's replica.jsonl when it is
// there) of one or more run folders and writes <out>/report.md, <out>/paths.tsv (one row per language-version page with
// differing roots, the roots grouped into variants), <out>/import-list.tsv (the root pages to import as own documents or
// to fix, with the suggested shape) and <out>/review-list.tsv (minor differences a person decides on). Offline.
//
// usage: node bin/md-report.mjs --airline <name> --runs <dir>[,<dir>...] --out <dir>
//          [--pairs-summary <md-pairs out>/pairs-summary.json] [--not-served <md-pairs out>/not-served.tsv]
//          [--summary <file.md>]   a hand-written summary placed under the title (kept when the report is rebuilt)
//
// What counts (lib/verdict.mjs classes):
//   import or fix   content, meta, widget, version-missing; links when a phone, mail or external link differs
//                   (linkDiff tel/mailto/external)
//   review          links between internal pages only, attributes (alt texts, tooltips, form values)
//   nothing to do   same, links-root, markup
// Per path (language-version page) the roots to import are grouped by their content fingerprint (rootHash):
//   root-local       one root (or a few with different texts) differs: an own document per differing root
//   shared-variant   several roots show the same variant that differs from the version: ONE document of that variant with
//                    a `markets` list of those roots (lh-edge's donor rule), not one per root
//   version-local    at least 3 roots compared, most of them agree with each other and differ from the version (60 % and
//                    60 %): the version page carries content of its
//                    home market; the fix is in the version (a section with `markets` for the home country, the common
//                    variant for the rest), not in the roots
// A pair that the replica already shows right (replica.jsonl: covered) needs nothing.
import fs from 'node:fs';
import path from 'node:path';
import readText from '../lib/files.mjs';

const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
const AIRLINE = opt('airline', '?');
const RUNS = opt('runs', '').split(',').filter(Boolean).map((d) => path.resolve(d));
const OUT = path.resolve(opt('out'));
fs.mkdirSync(OUT, { recursive: true });
const readJsonl = (f) => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map(JSON.parse) : []);
const results = [];
const replica = new Map();
for (const d of RUNS) {
  readJsonl(path.join(d, 'results.jsonl')).forEach((r) => results.push({ ...r, run: d }));
  readJsonl(path.join(d, 'replica.jsonl')).forEach((r) => replica.set(`${r.root}|${r.rest}`, r.replica));
}
const pairsSummary = opt('pairs-summary') && fs.existsSync(opt('pairs-summary')) ? JSON.parse(fs.readFileSync(opt('pairs-summary'), 'utf8')) : null;
const notServed = opt('not-served') && fs.existsSync(opt('not-served'))
  ? readText(opt('not-served')).split('\n').slice(1).filter(Boolean).map((l) => l.split('\t')) : [];
// the latest result per pair wins (a rerun folder after the first)
const byPair = new Map();
results.forEach((r) => byPair.set(`${r.root}|${r.rest}`, r));
const rows = [...byPair.values()];
const count = (arr, f) => arr.reduce((m, x) => { const k = f(x); m[k] = (m[k] || 0) + 1; return m; }, {});
const important = (r) => r.verdict === 'differs' && (['content', 'meta', 'widget', 'version-missing'].includes(r.class)
  || (r.class === 'links' && r.linkDiff && (r.linkDiff.tel || r.linkDiff.mailto || r.linkDiff.external)));
const review = (r) => r.verdict === 'differs' && !important(r);
const verdicts = count(rows, (r) => r.verdict);
const classes = count(rows, (r) => `${r.verdict}/${r.class}`);
const cell = (s, n = 220) => String(s || '').slice(0, n).replace(/\|/g, '/').replace(/\s+/g, ' ');

// per path: variants of the differing roots
const paths = new Map();
rows.forEach((r) => {
  const k = `${r.version}|${r.rest}`;
  if (!paths.has(k)) paths.set(k, { version: r.version, rest: r.rest, roots: [], same: [], differs: [], other: [] });
  const p = paths.get(k);
  p.roots.push(r.root);
  if (r.verdict === 'same') p.same.push(r);
  else if (r.verdict === 'differs') p.differs.push(r);
  else p.other.push(r);
});
const pathRows = [];
const importRows = [];
for (const p of paths.values()) {
  if (!p.differs.length) continue;
  const imp = p.differs.filter(important);
  const variants = Object.entries(count(imp, (r) => r.rootHash || r.root)).sort((x, y) => y[1] - x[1]);
  const compared = p.same.length + p.differs.length;
  const top = variants[0] ? variants[0][1] : 0;
  let shape = 'review';
  if (imp.length) {
    if (compared >= 3 && imp.length >= 3 && imp.length / compared >= 0.6 && top / imp.length >= 0.6) shape = 'version-local';
    else if (variants.some(([, n]) => n >= 2)) shape = 'shared-variant';
    else shape = 'root-local';
  }
  const coveredN = imp.filter((r) => replica.get(`${r.root}|${r.rest}`) === 'covered').length;
  const ex = imp[0] || p.differs[0];
  pathRows.push({
    version: p.version, rest: p.rest, compared, same: p.same.length, differs: p.differs.length, important: imp.length,
    variants: variants.length, largestVariant: top, shape, coveredByReplica: coveredN,
    classes: Object.entries(count(p.differs, (r) => r.class)).map(([k, v]) => `${k} ${v}`).join(', '),
    example: cell(ex.reason, 200), evidence: ex.evidence || '',
  });
  imp.filter((r) => replica.get(`${r.root}|${r.rest}`) !== 'covered').forEach((r) => {
    const peers = imp.filter((x) => (x.rootHash || x.root) === (r.rootHash || r.root)).map((x) => x.root);
    let action = 'own document';
    if (shape === 'version-local') action = `version-local: fix ${p.version}${p.rest} (home-market section) and one document for ${peers.length} roots`;
    else if (peers.length >= 2) action = `one document with markets: ${peers.join(', ')}`;
    importRows.push([r.root, r.rest, r.rootPath, r.class, action, r.rootHash || '', replica.get(`${r.root}|${r.rest}`) || '', r.evidence || '', cell(r.reason, 160)]);
  });
}
pathRows.sort((a, b) => b.important - a.important || b.differs - a.differs);
const reviewRows = rows.filter(review).sort((a, b) => (a.rest + a.root).localeCompare(b.rest + b.root))
  .map((r) => [r.root, r.rest, r.rootPath, r.class, JSON.stringify(r.linkDiff || {}), r.evidence || '', cell(r.reason, 160)]);
const tsv = (file, headRow, body) => fs.writeFileSync(path.join(OUT, file), [headRow.join('\t'), ...body.map((r) => r.join('\t'))].join('\n') + '\n');
tsv('paths.tsv', Object.keys(pathRows[0] || { version: 1 }), pathRows.map((r) => Object.values(r)));
tsv('import-list.tsv', ['root', 'rest', 'www_path', 'class', 'action', 'variant', 'replica', 'evidence', 'reason'], importRows);
tsv('review-list.tsv', ['root', 'rest', 'www_path', 'class', 'link_kinds', 'evidence', 'reason'], reviewRows);

const missing = rows.filter((r) => r.verdict === 'missing');
const unknown = rows.filter((r) => r.verdict === 'unknown');
const notFetched = unknown.filter((r) => r.class === 'not-fetched').length;
const byRoot = Object.entries(count(rows.filter(important), (r) => r.root)).sort((a, b) => b[1] - a[1]);
const shapes = count(pathRows.filter((r) => r.important), (r) => r.shape);
const md = [];
md.push(`# Market roots vs. language versions: ${AIRLINE}`, '');
if (opt('summary') && fs.existsSync(opt('summary'))) md.push(fs.readFileSync(opt('summary'), 'utf8').trim(), '');
md.push(`Generated ${new Date().toISOString()} by tools/market-diff/bin/md-report.mjs from ${RUNS.map((d) => path.relative(process.cwd(), d)).join(', ')}.`, '');
md.push('## Coverage', '');
if (pairsSummary) md.push(`- Pairs in the pair list (md-pairs): ${pairsSummary.pairs} over ${pairsSummary.roots} roots; version pages ${pairsSummary.versionPages}, requests ${pairsSummary.requests}`);
md.push(`- Pairs with a result: ${rows.length}; not fetched yet: ${notFetched}${pairsSummary && rows.length < pairsSummary.pairs ? ` (results cover ${(100 * rows.length / pairsSummary.pairs).toFixed(1)} % of the list)` : ''}`);
md.push(`- www pages of market roots our replica does not serve at all (md-pairs not-served.tsv): ${notServed.length}${notServed.length ? ', listed in the last section' : ''}`, '');
md.push('## Counts', '');
md.push(`- Verdicts: ${Object.entries(verdicts).map(([k, v]) => `${k} ${v}`).join(', ')}`);
md.push(`- Classes: ${Object.entries(classes).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ')}`);
md.push(`- Differences to import or fix (content, title/description, widget, phone/mail/external links): ${rows.filter(important).length} pairs on ${pathRows.filter((r) => r.important).length} language-version pages (${Object.entries(shapes).map(([k, v]) => `${k} ${v}`).join(', ') || 'none'})`);
md.push(`- Rows in import-list.tsv (not yet covered by the replica): ${importRows.length}`);
md.push(`- Minor differences for review (internal links, alt texts, tooltips): ${reviewRows.length} (review-list.tsv)`);
md.push(`- Pages www redirects or lacks on the root although the replica serves one there: ${missing.length}`);
md.push(`- Without a verdict (errors, not fetched, version page not reachable): ${unknown.length}`, '');
md.push('## Roots with the most differences to import or fix', '', '| root | pairs |', '| --- | --- |', ...byRoot.slice(0, 30).map(([r, n]) => `| ${r} | ${n} |`), '');
md.push('## Language-version pages with differing roots', '', '| version page | roots compared | differ (classes) | shape | variants | covered by replica | what differs (first root) |', '| --- | --- | --- | --- | --- | --- | --- |');
pathRows.forEach((r) => md.push(`| ${r.version}${r.rest} | ${r.compared} | ${r.differs} (${r.classes}) | ${r.shape} | ${r.variants} | ${r.coveredByReplica} | ${r.example} |`));
md.push('', '## Every pair to import or fix', '', '| root | page | class | replica | what differs | evidence |', '| --- | --- | --- | --- | --- | --- |');
rows.filter(important).sort((a, b) => (a.rest + a.root).localeCompare(b.rest + b.root))
  .forEach((r) => md.push(`| ${r.root} | ${r.rest} | ${r.class} | ${replica.get(`${r.root}|${r.rest}`) || ''} | ${cell(r.reason)} | ${r.evidence || ''} |`));
md.push('', '## Minor differences for review', '', `${reviewRows.length} pairs in review-list.tsv (first 100 here).`, '', '| root | page | class | what differs |', '| --- | --- | --- | --- |');
reviewRows.slice(0, 100).forEach((r) => md.push(`| ${r[0]} | ${r[1]} | ${r[3]} | ${cell(r[6], 180)} |`));
md.push('', '## Missing on www (the replica serves a page www redirects or lacks)', '', '| root | page | www |', '| --- | --- | --- |', ...missing.map((r) => `| ${r.root} | ${r.rest} | ${r.class} ${cell(r.reason, 160)} |`));
md.push('', '## Without a verdict', '', `${unknown.length} pairs${notFetched ? ` (${notFetched} not fetched yet)` : ''}.`, '', '| root | page | why |', '| --- | --- | --- |', ...unknown.filter((r) => r.class !== 'not-fetched').slice(0, 300).map((r) => `| ${r.root} | ${r.rest} | ${r.class} ${cell(r.reason, 120)} |`));
if (notServed.length) {
  md.push('', '## www pages our replica does not serve at all', '', `${notServed.length} rows (md-pairs not-served.tsv; first 100 here). These are not shared pages: the replica answers 404 or the language version lacks them. A separate decision, not part of this comparison.`, '', '| root | page |', '| --- | --- |');
  notServed.slice(0, 100).forEach((r) => md.push(`| ${r[0]} | ${r[1]} |`));
}
fs.writeFileSync(path.join(OUT, 'report.md'), `${md.join('\n')}\n`);
console.log(JSON.stringify({ pairs: rows.length, verdicts, important: rows.filter(important).length, paths: pathRows.length, shapes, importRows: importRows.length, review: reviewRows.length, missing: missing.length, unknown: unknown.length, notServed: notServed.length }));
