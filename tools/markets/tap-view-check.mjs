/* eslint-disable no-console, no-await-in-loop, max-len, import/no-extraneous-dependencies, import/extensions, no-restricted-syntax -- dev tooling */
// Brief 462 (TAP): for every pair md-compare.mjs found to differ, the page the root is really served
// against the root's www page, as tools/reports/tap/markets.md's check does: the root's fetched raw
// HTML converted with tap-import.mjs's convertPage, against the version's DA document after
// scripts/market-rules.js dropMarketSections for the root's country (lh-edge's view). Text of every
// heading, paragraph, item and cell, metadata left out; images not compared. DA is read (source
// API, cached), never written. Offline otherwise.
// Usage: node tools/markets/tap-view-check.mjs --results <md-compare out> --fetch <run dir> --cache <dir> --out <file.jsonl>
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { parseHTML } from 'linkedom';
import { convertPage } from '../importer/tap-import.mjs';
import { dropMarketSections } from '../../scripts/market-rules.js';

const argv = process.argv.slice(2);
const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
const [resultsDir, fetchDir, cache, outFile] = ['results', 'fetch', 'cache', 'out'].map(opt);
const NEXT_DATA = /<script id="__NEXT_DATA__" type="application\/json"[^>]*>([\s\S]*?)<\/script>/;

const files = new Map();
fs.readFileSync(path.join(fetchDir, 'fetch.jsonl'), 'utf8').split('\n').filter(Boolean).forEach((l) => {
  const r = JSON.parse(l);
  if (r.kind === 'ok' && r.file) files.set(r.path, path.join(fetchDir, r.file));
});
const body = (p) => (files.has(p) ? zlib.gunzipSync(fs.readFileSync(files.get(p))).toString('utf8') : null);

fs.mkdirSync(cache, { recursive: true });
function daDoc(docPath) {
  const f = path.join(cache, `${docPath.replace(/^\//, '').replace(/\//g, '__')}.html`);
  if (!fs.existsSync(f)) {
    const code = execFileSync('curl', ['-s', '-o', f, '-w', '%{http_code}', `https://admin.da.live/source/moved-permanently/lh-tap${docPath}.html`], { encoding: 'utf8' });
    if (code !== '200') { fs.rmSync(f, { force: true }); return { status: Number(code) }; }
  }
  const s = fs.readFileSync(f, 'utf8');
  const m = s.match(/<main>([\s\S]*)<\/main>/);
  return { status: 200, html: m ? m[1] : s };
}

// the page as lh-edge serves it to a country: its sections without those the country does not get,
// with each remaining fragment block's document (filtered the same way) in its place
function served(html, country, depth = 0) {
  let out = dropMarketSections(html, country);
  if (depth > 2) return out;
  const hrefs = [...out.matchAll(/<div class="fragment"[^>]*>[\s\S]*?href="([^"]+)"/g)].map((m) => m[1]);
  hrefs.forEach((h) => {
    let p = h;
    try { p = new URL(h, 'https://tap.turnsthe.page').pathname; } catch (e) { /* as it is */ }
    const doc = daDoc(p.replace(/\.(plain\.)?html$/, ''));
    if (doc.status === 200) out += served(doc.html, country, depth + 1);
  });
  return out;
}

const norm = (t) => t.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
function texts(html) {
  const { document } = parseHTML(`<html><body><main>${html}</main></body></html>`);
  document.querySelectorAll('.metadata, .section-metadata').forEach((e) => e.remove());
  const out = [];
  const BLOCK = 'p, li, td, th, h1, h2, h3, h4, h5, h6, div, ul, ol, table';
  document.querySelectorAll('main *').forEach((e) => {
    // an element with a text node of its own and no block inside: its text (a heading, a
    // paragraph, a card title in a div, a link, a cell)
    if (![...e.childNodes].some((n) => n.nodeType === 3 && norm(n.nodeValue))) return;
    if (e.querySelector(BLOCK)) return;
    const t = norm(e.textContent);
    if (t && !/^\{[a-z0-9 -]+\}$/.test(t)) out.push(t);
  });
  document.querySelectorAll('main a[href]').forEach((a) => {
    const h = a.getAttribute('href');
    if (/^(tel:|mailto:)/i.test(h) || (/^https?:/i.test(h) && !/^https?:\/\/(www\.)?flytap\.com/i.test(h) && !/pic\.flytap\.com/i.test(h))) out.push(`link: ${h}`);
  });
  return out;
}

const rows = fs.readFileSync(path.join(resultsDir, 'results.tsv'), 'utf8').split('\n').slice(1).filter(Boolean)
  .map((l) => l.split('\t'))
  .filter((c) => c[3] === 'differs');
const out = fs.createWriteStream(outFile);
const counts = {};
for (const [rootKey, version, rest, , cls] of rows) {
  const rootPath = `/${rootKey}${rest}`;
  const country = rootKey.split('-')[1];
  const rec = {
    root: rootKey, version, rest, class: cls,
  };
  const b = body(rootPath);
  const nd = b && b.match(NEXT_DATA);
  if (!nd) { rec.view = 'no-root-data'; } else {
    const conv = convertPage(JSON.parse(nd[1]), { url: `https://www.flytap.com${rootPath}`, scope: new Set(), media: () => null });
    const da = daDoc(`/${version}${rest}`);
    // a root with its own document is served that, not the version's
    const own = daDoc(`${rootPath}`);
    if (own.status === 200) rec.view = 'own-document';
    else if (conv.skipped) rec.view = `root-skipped: ${conv.skipped}`;
    else if (da.status !== 200) rec.view = `da-${da.status}`;
    else {
      // www's own difference: the root's conversion against the version's (both fresh, the same
      // converter), so DA's hand edits of the version (a built form for a live widget) drop out
      const vb = body(`/${version}${rest}`);
      const vnd = vb && vb.match(NEXT_DATA);
      const vconv = vnd ? convertPage(JSON.parse(vnd[1]), { url: `https://www.flytap.com/${version}${rest}`, scope: new Set(), media: () => null }) : null;
      const a = texts(conv.html.split(`/${rootKey}/`).join('/ROOT/'));
      const v = vconv && !vconv.skipped ? texts(vconv.html.split(`/${version}/`).join('/ROOT/')) : [];
      const s = new Set(texts(served(da.html, country)));
      const sa = new Set(a);
      const sv = new Set(v);
      rec.wwwRootOnly = a.filter((t) => !sv.has(t));
      rec.wwwVersionOnly = v.filter((t) => !sa.has(t));
      // served: the root's own texts there, the version's own texts not
      rec.missing = rec.wwwRootOnly.filter((t) => !s.has(t));
      rec.extra = rec.wwwVersionOnly.filter((t) => s.has(t));
      if (!vconv || vconv.skipped) rec.view = 'no-version-data';
      else if (!rec.wwwRootOnly.length && !rec.wwwVersionOnly.length) rec.view = 'www-text-same';
      else rec.view = rec.missing.length || rec.extra.length ? 'differs' : 'served-same';
    }
  }
  counts[rec.view.split(':')[0]] = (counts[rec.view.split(':')[0]] || 0) + 1;
  out.write(`${JSON.stringify(rec)}\n`);
}
out.end();
console.log(rows.length, 'differing pairs:', JSON.stringify(counts));
