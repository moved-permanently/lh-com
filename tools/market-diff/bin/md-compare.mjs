/* eslint-disable import/extensions, max-len, no-console, no-nested-ternary, no-restricted-syntax, object-curly-newline, prefer-template -- dev tooling */
// market-diff comparison: for every pair (market-root page, language-version page) whose pages md-fetch.mjs saved,
// normalise both pages and tell whether the root's page differs from the version's in a way the replica would have to
// carry. Offline: reads <fetch>/fetch.jsonl and <fetch>/bodies, writes <out>/results.jsonl, results.tsv, summary.json
// and one evidence file per pair that is not plainly the same (<out>/evidence/<root>/<rest>.txt).
//
// usage: node bin/md-compare.mjs --pairs <pairs.tsv> --fetch <dir> --out <dir> [--profile aem-html|tap-next]
// pairs.tsv: header line with root, version, root_path, version_path (other columns are carried along).
//
// Verdicts and classes, decided in this order on the "visible projection" of both pages (any market root in links and
// widget settings counts as the page's own): text with all whitespace removed (so markup inside a sentence does not
// count), images and icons, link targets, visible attributes (alt, title, aria-label, placeholder, value, label):
//   differs   content         the text or the images differ: the root shows something the version does not
//   differs   links           same text and images, a link target differs (linkDiff: tel, mailto, external, internal)
//   differs   attributes      only visible attributes differ (alt texts, tooltips, form values): review
//   differs   meta            content equal, title or description differs
//   differs   widget          content equal, a widget's configuration (data-* JSON, market codes and ids masked) differs,
//                             or an app widget (custom element outside maui-*) is on one side only: widgets render text
//                             in the browser (promotion teasers, forms, questionnaires), so it is a difference to review
//   same      same            content, title, description and widget settings equal as they are
//   same      links-root      equal once every market root in links counts as the page's own (www links into another
//                             market, e.g. at/de pages into /de/de); the replica's link step points them at the root
//   same      markup          only the markup differs (another component version around the same text, images, links)
//   differs   version-missing www has the root page but no version page (404/410): the replica serves an older version
//                             document there; the root page is the only www source left
//   missing   root-not-found / root-gone / root-redirect   www has no page at the root path (lh-edge would serve one)
//   missing   both-missing    www has neither page: the replica serves a page www no longer has
//   unknown   not-fetched / root-error / root-forbidden / version-* / root-blocked   no verdict, ask again
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { diffTokens, summarise } from '../lib/diff.mjs';
import { decide } from '../lib/verdict.mjs';
import readText from '../lib/files.mjs';

const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
const PAIRS = opt('pairs');
const FETCH = path.resolve(opt('fetch', '.'));
const OUT = path.resolve(opt('out', FETCH));
const PROFILE = opt('profile', 'aem-html');
const HOST = opt('host', '');
if (!PAIRS) { console.error('usage: md-compare.mjs --pairs <tsv> --fetch <dir> --out <dir> [--profile aem-html|tap-next]'); process.exit(1); }
const { pageFacts, VISIBLE_ATTR } = await import(PROFILE === 'tap-next' ? '../lib/tap-next.mjs' : '../lib/aem-html.mjs');
const rootStyle = PROFILE === 'tap-next' ? 'll-cc' : 'cc/ll';

const lines = readText(PAIRS).split('\n').filter((l) => l.trim() && !l.startsWith('#'));
const head = lines.shift().split('\t');
const pairs = lines.map((l) => Object.fromEntries(l.split('\t').map((v, i) => [head[i], v])))
  // all roots of one version page together: the version page is parsed once (facts cache)
  .sort((x, y) => (x.version_path < y.version_path ? -1 : x.version_path > y.version_path ? 1 : 0));
const fetched = new Map();
fs.readFileSync(path.join(FETCH, 'fetch.jsonl'), 'utf8').split('\n').filter(Boolean).forEach((l) => {
  try { const r = JSON.parse(l); if (r.path) fetched.set(r.path, r); } catch (e) { /* torn line */ }
});
const cache = new Map();
function facts(p, root) {
  const key = `${p}|${root}`;
  if (cache.has(key)) return cache.get(key);
  const r = fetched.get(p);
  let f = null;
  if (r && r.kind === 'ok' && r.file) {
    const html = zlib.gunzipSync(fs.readFileSync(path.join(FETCH, r.file))).toString('utf8');
    f = pageFacts(html, root, { rootStyle, host: HOST });
  }
  cache.set(key, f);
  if (cache.size > 400) cache.delete(cache.keys().next().value);
  return f;
}
/** Key-level differences of two '@attr={json}' tokens of the same attribute, or null. */
function jsonDelta(ta, tb) {
  const [na, ...ra] = ta.split('=');
  const [nb, ...rb] = tb.split('=');
  if (na !== nb) return null;
  let ja;
  let jb;
  try { ja = JSON.parse(ra.join('=')); jb = JSON.parse(rb.join('=')); } catch (e) { return null; }
  const flat = (o, p = '', acc = {}) => {
    if (o && typeof o === 'object') Object.entries(o).forEach(([k, v]) => flat(v, `${p}.${k}`, acc)); else acc[p] = o;
    return acc;
  };
  const fa = flat(ja);
  const fb = flat(jb);
  const keys = [...new Set([...Object.keys(fa), ...Object.keys(fb)])].filter((k) => JSON.stringify(fa[k]) !== JSON.stringify(fb[k]));
  return keys.slice(0, 12).map((k) => `${k}: ${JSON.stringify(fa[k])} -> ${JSON.stringify(fb[k])}`.slice(0, 240)).join('; ') + (keys.length > 12 ? ` (+${keys.length - 12})` : '');
}
const safe = (s) => s.replace(/^\/+/, '').replace(/[^a-zA-Z0-9._/-]+/g, '_').slice(0, 180) || 'root';

fs.mkdirSync(path.join(OUT, 'evidence'), { recursive: true });
const resOut = fs.createWriteStream(path.join(OUT, 'results.jsonl'));
const tsvOut = fs.createWriteStream(path.join(OUT, 'results.tsv'));
tsvOut.write(['root', 'version', 'rest', 'verdict', 'class', 'reason', 'evidence'].join('\t') + '\n');
const summary = { pairs: 0, verdict: {}, class: {}, byRoot: {} };

for (const p of pairs) {
  const rest = p.rest || p.root_path.replace(/^\/content\/[^/]+\/markets/, '').replace(/^\/[a-z]{2}[/-][a-z]{2}/, '');
  const out = { root: p.root, version: p.version, rest, rootPath: p.root_path, versionPath: p.version_path };
  const rr = fetched.get(p.root_path);
  const vr = fetched.get(p.version_path);
  let verdict;
  let cls;
  let reason = '';
  let evidence = '';
  const gone = (r) => r && ['not-found', 'gone'].includes(r.kind);
  if (!rr) { verdict = 'unknown'; cls = 'not-fetched'; } else if (gone(vr) && rr.kind === 'ok') {
    // www has the page on the root but no longer in the language version: the replica serves its (older) version
    // document there; the root's page is the only www source left
    verdict = 'differs'; cls = 'version-missing'; reason = `www has no version page (${vr.http}); the root page is there`;
  } else if (gone(vr) && rr.kind !== 'ok') {
    verdict = 'missing'; cls = 'both-missing'; reason = `www has neither page (version ${vr.http}, root ${rr.http || rr.kind})`;
  } else if (rr.kind !== 'ok') {
    cls = `root-${rr.kind}`;
    verdict = ['not-found', 'gone', 'redirect'].includes(rr.kind) ? 'missing' : 'unknown';
    reason = `www ${rr.http || ''} ${rr.final ? `-> ${rr.final}` : ''}`.trim();
  } else if (!vr) { verdict = 'unknown'; cls = 'version-not-fetched'; } else if (vr.kind !== 'ok') {
    verdict = 'unknown'; cls = `version-${vr.kind}`; reason = `www ${vr.http || ''} ${vr.final ? `-> ${vr.final}` : ''}`.trim();
  } else {
    const a = facts(p.version_path, p.version);
    const b = facts(p.root_path, p.root);
    const d0 = decide(a, b, { visibleAttr: VISIBLE_ATTR, host: HOST });
    ({ verdict, cls } = d0);
    const { va, vb, contentEq } = d0;
    if (d0.linkDiff) out.linkDiff = d0.linkDiff;
    if (!a.marker || !b.marker) out.note = 'no <h2 id=main>: content area = body without header, footer, nav';
    out.versionHash = d0.versionHash;
    out.rootHash = d0.rootHash;
    if (cls !== 'same') {
      const lines2 = [`root    ${p.root_path}`, `version ${p.version_path}`, `verdict ${verdict} (${cls})`];
      if (a.title !== b.title) lines2.push(`title   version: ${a.title}`, `        root:    ${b.title}`);
      if (a.description !== b.description) lines2.push(`descr.  version: ${a.description}`, `        root:    ${b.description}`);
      let d;
      if (cls === 'widget') d = diffTokens([...va.widgets, ...(a.configAny || a.config)], [...vb.widgets, ...(b.configAny || b.config)]);
      else if (cls === 'links-root') d = contentEq ? diffTokens(a.config, b.config) : diffTokens(a.content, b.content);
      else if (cls !== 'meta') d = diffTokens(a.contentAny, b.contentAny);
      if (d) {
        const s = summarise(d.ops);
        reason = s.text;
        out.counts = s.counts;
        lines2.push(`diff (- version only, + root only; = shared), from token ${d.start}${d.exact ? '' : ' (order ignored: long pages)'}:`);
        let eqRun = 0;
        d.ops.forEach((o, i) => {
          if (o.op === '=') { eqRun += 1; if (eqRun <= 2) lines2.push(`  ${o.t.slice(0, 200)}`); else if (eqRun === 3) lines2.push('  …'); return; }
          eqRun = 0;
          const next = d.ops[i + 1];
          const delta = o.op === '-' && next && next.op === '+' ? jsonDelta(o.t, next.t) : null;
          if (delta) { lines2.push(`~ ${o.t.split('=')[0]} (JSON, version -> root): ${delta}`); next.skip = true; return; }
          if (o.skip) return;
          lines2.push(`${o.op} ${o.t.slice(0, 300)}`);
        });
      } else if (cls === 'meta') {
        reason = [a.title !== b.title ? `title "${a.title}" -> "${b.title}"` : '', a.description !== b.description ? 'description differs' : ''].filter(Boolean).join('; ');
      }
      evidence = path.join('evidence', safe(p.root), `${safe(rest)}.txt`);
      fs.mkdirSync(path.dirname(path.join(OUT, evidence)), { recursive: true });
      fs.writeFileSync(path.join(OUT, evidence), `${lines2.slice(0, 600).join('\n')}\n`);
    }
  }
  Object.assign(out, { verdict, class: cls, reason });
  if (evidence) out.evidence = evidence;
  resOut.write(`${JSON.stringify(out)}\n`);
  tsvOut.write([p.root, p.version, rest, verdict, cls, reason.replace(/\s+/g, ' ').slice(0, 400), evidence].join('\t') + '\n');
  summary.pairs += 1;
  summary.verdict[verdict] = (summary.verdict[verdict] || 0) + 1;
  summary.class[cls] = (summary.class[cls] || 0) + 1;
  const br = summary.byRoot[p.root] || (summary.byRoot[p.root] = {});
  br[verdict] = (br[verdict] || 0) + 1;
}
resOut.end();
tsvOut.end();
fs.writeFileSync(path.join(OUT, 'summary.json'), `${JSON.stringify(summary, null, 1)}\n`);
console.log(JSON.stringify({ pairs: summary.pairs, verdict: summary.verdict, class: summary.class }));
