/* eslint-disable no-console, max-len, no-await-in-loop, no-restricted-syntax, import/no-extraneous-dependencies -- dev tooling */
/**
 * Regional differences in Document Authoring: for every row of tools/migration-scope/pages.csv,
 * the DA source of /at/de/<path> against /de/de/<path> (the German rollout) and of /gb/en/<path>
 * against /de/en/<path> (the English rollout). A rollout with `merge` marks these differences
 * for the market's author; with `overwrite` it replaces them.
 *
 * Normalised before comparing (expected to differ by market): the locale prefix in links and
 * media (/at/de/ = /de/de/, /gb/en/ = /de/en/, also on www.lufthansa.com, /content/lh/markets/
 * and the lh-com hosts), the market in query parameters (country=AT|GB = country=DE), whitespace.
 * Compared: text (block-level texts as a multiset), links, images, blocks (in order) and metadata
 * (per key).
 *
 * Reads DA only (GET admin.da.live/source); never writes. Cache: $TMPDIR/lh-loc-da (--refresh to
 * fetch again). Report: tools/reports/loc-regional-diff.md and .json.
 * Usage: node tools/loc/regional-diff.mjs [--refresh] [--limit 20]
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DA = 'https://admin.da.live/source/moved-permanently/lh-com';
const CACHE = path.join(os.tmpdir(), 'lh-loc-da');
const PAIRS = [
  {
    name: 'at/de vs de/de', source: 'de_de', target: 'at_de', from: 'de/de', to: 'at/de', cc: ['de', 'at'],
  },
  {
    name: 'gb/en vs de/en', source: 'de_en', target: 'gb_en', from: 'de/en', to: 'gb/en', cc: ['de', 'gb'],
  },
];

/** pages.csv rows: [{template_group, de_en, de_de, at_de, gb_en}]. */
export function scopeRows() {
  const [head, ...lines] = fs.readFileSync(path.join(root, 'tools/migration-scope/pages.csv'), 'utf8').trim().split(/\r?\n/);
  const keys = head.split(',');
  return lines.map((l) => Object.fromEntries(l.split(',').map((v, i) => [keys[i], v.trim()])));
}

/** A DA source (cached): the HTML, or null for a missing document. */
export async function daSource(page, { refresh = false } = {}) {
  const file = path.join(CACHE, `${page}.html`);
  if (!refresh && fs.existsSync(file)) return fs.readFileSync(file, 'utf8') || null;
  let resp;
  // the DA login from a terminal, as slug-step.mjs daClient (never printed)
  const headers = process.env.DA_TOKEN ? { authorization: `Bearer ${process.env.DA_TOKEN}` } : {};
  for (let i = 0; i < 3; i += 1) {
    resp = await fetch(`${DA}${page}.html`, { headers });
    if (resp.status !== 429 && resp.status < 500) break;
    await new Promise((r) => { setTimeout(r, 2000 * (i + 1)); });
  }
  if (resp.status === 401 || resp.status === 403) throw new Error(`DA ${resp.status}: ${process.env.DA_TOKEN ? 'DA_TOKEN was refused (expired or without access)' : 'no login (set DA_TOKEN, or enable Document Authoring in Settings → LLM Permissions)'}`);
  const html = resp.ok ? await resp.text() : '';
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  return html || null;
}

/** A link or media URL with the market's locale and country made the source market's. */
export function normalizeUrl(value, pair) {
  const [from, to] = [pair.from, pair.to];
  const [ccFrom, ccTo] = pair.cc;
  let v = String(value || '').trim();
  v = v.replace(/^https:\/\/(main--lh-com--moved-permanently\.aem\.(page|live)|lhcom\.bbird\.live)(?=\/)/, '');
  v = v.replace(new RegExp(`(^|=|/content/lh/markets|https?://[^/?#]+)/${to}(?=/|$|\\?|#|\\.|&)`, 'g'), `$1/${from}`);
  v = v.replace(new RegExp(`([?&](?:country|market)=)(${ccTo})(?=&|$|#)`, 'gi'), (m, k, c) => `${k}${c === c.toUpperCase() ? ccFrom.toUpperCase() : ccFrom}`);
  v = v.replace(new RegExp(`/${ccTo}_(${to.split('/')[1]})(?=[./_])`, 'g'), `/${ccFrom}_$1`);
  return v;
}

const clean = (s) => String(s || '').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ')
  .trim();

/** What a page consists of: texts, links, images, blocks, metadata. */
export function digest(html, pair) {
  const { document } = parseHTML(`<html><body>${((html.match(/<main>([\s\S]*)<\/main>/) || [])[1] ?? html)}</body></html>`);
  const { body } = document;
  const metadata = {};
  body.querySelectorAll('.metadata').forEach((m) => {
    [...m.children].forEach((row) => {
      const [k, v] = row.children;
      if (!k) return;
      const link = v && v.querySelector('a[href]');
      const img = v && v.querySelector('img[src]');
      let value = clean(v && v.textContent);
      if (link) value = normalizeUrl(link.getAttribute('href'), pair);
      else if (img) value = normalizeUrl(img.getAttribute('src'), pair).replace(/\?.*$/, '');
      metadata[clean(k.textContent).toLowerCase()] = value;
    });
    m.remove();
  });
  const blocks = [...body.querySelectorAll('div[class]')].map((d) => d.className.split(' ')[0]);
  const links = [...body.querySelectorAll('a[href]')].map((a) => normalizeUrl(a.getAttribute('href'), pair)).filter((h) => !h.startsWith('#'));
  const images = [...body.querySelectorAll('img[src]')].map((i) => normalizeUrl(i.getAttribute('src'), pair).replace(/\?.*$/, ''));
  const texts = [];
  body.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, div').forEach((el) => {
    // block-level texts: elements with own text (not only nested block children)
    const own = [...el.childNodes].some((n) => (n.nodeType === 3 && clean(n.textContent)) || (n.nodeType === 1 && /^(A|STRONG|EM|B|I|U|SPAN|SUB|SUP|BR|CODE)$/.test(n.tagName)));
    if (own && !(el.tagName === 'DIV' && el.querySelector('p, h1, h2, h3, h4, h5, h6, li'))) {
      // JCR paths and URLs inside text (poi-map Source rows, link texts) name the market too
      const t = clean(el.textContent).replace(new RegExp(`(/content/lh/markets|https?://[^/\\s]+|^|\\s)/${pair.to}(?=/|\\s|$)`, 'g'), `$1/${pair.from}`);
      if (t) texts.push(t);
    }
  });
  return {
    texts, links, images, blocks, metadata,
  };
}

/** Multiset difference: [onlyInA, onlyInB]. */
export function multisetDiff(a, b) {
  const count = new Map();
  a.forEach((x) => count.set(x, (count.get(x) || 0) + 1));
  const onlyB = [];
  b.forEach((x) => {
    if (count.get(x)) count.set(x, count.get(x) - 1);
    else onlyB.push(x);
  });
  const onlyA = [];
  count.forEach((n, x) => { for (let i = 0; i < n; i += 1) onlyA.push(x); });
  return [onlyA, onlyB];
}

/** The differences of a target page against its source page. */
export function compare(src, tgt) {
  const out = {};
  const [tA, tB] = multisetDiff(src.texts, tgt.texts);
  if (tA.length || tB.length) out.text = { removed: tA, added: tB };
  const [lA, lB] = multisetDiff(src.links, tgt.links);
  if (lA.length || lB.length) out.links = { removed: lA, added: lB };
  const [iA, iB] = multisetDiff(src.images, tgt.images);
  if (iA.length || iB.length) out.images = { removed: iA, added: iB };
  if (src.blocks.join() !== tgt.blocks.join()) {
    const [bA, bB] = multisetDiff(src.blocks, tgt.blocks);
    out.blocks = { removed: bA, added: bB, order: !bA.length && !bB.length };
  }
  const keys = [...new Set([...Object.keys(src.metadata), ...Object.keys(tgt.metadata)])];
  const meta = keys.filter((k) => src.metadata[k] !== tgt.metadata[k]).map((k) => ({ key: k, source: src.metadata[k] ?? null, target: tgt.metadata[k] ?? null }));
  if (meta.length) out.metadata = meta;
  return out;
}

const size = (d) => (d.text ? d.text.removed.length + d.text.added.length : 0) + (d.links ? d.links.removed.length + d.links.added.length : 0)
  + (d.images ? d.images.removed.length + d.images.added.length : 0) + (d.blocks ? d.blocks.removed.length + d.blocks.added.length + (d.blocks.order ? 1 : 0) : 0) + (d.metadata ? d.metadata.length : 0);

async function pool(items, n, fn) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (next < items.length) {
      const i = next;
      next += 1;
      results[i] = await fn(items[i], i);
    }
  }));
  return results;
}

export async function run({ refresh = false, limit = 0 } = {}) {
  const rows = scopeRows().slice(0, limit || undefined);
  const results = [];
  for (const pair of PAIRS) {
    const done = await pool(rows, 6, async (row) => {
      const [s, t] = [row[pair.source], row[pair.target]];
      if (!s || !t) {
        return {
          group: row.template_group, source: s, target: t, status: 'no pair in the scope',
        };
      }
      const [hs, ht] = [await daSource(s, { refresh }), await daSource(t, { refresh })];
      if (!hs || !ht) {
        return {
          group: row.template_group, source: s, target: t, status: `missing in DA: ${[!hs && s, !ht && t].filter(Boolean).join(', ')}`,
        };
      }
      const diff = compare(digest(hs, pair), digest(ht, pair));
      // byte for byte (whitespace aside): what a rollout leaves alone (it copies links as they are)
      const raw = (h) => ((h.match(/<main>([\s\S]*)<\/main>/) || [])[1] ?? h).replace(/\s+/g, ' ').trim();
      return {
        group: row.template_group, source: s, target: t, status: Object.keys(diff).length ? 'differs' : 'identical', rawIdentical: raw(hs) === raw(ht), diff, size: size(diff),
      };
    });
    results.push({ pair: pair.name, rows: done });
  }
  return results;
}

const ex = (list, n = 2) => list.slice(0, n).map((x) => `"${String(x).slice(0, 70)}"`).join(', ');
function describe(d) {
  const parts = [];
  if (d.text) parts.push(`text −${d.text.removed.length}/+${d.text.added.length}${d.text.added.length ? ` (${ex(d.text.added, 1)})` : ''}`);
  if (d.links) parts.push(`links −${d.links.removed.length}/+${d.links.added.length}${d.links.added.length ? ` (${ex(d.links.added, 1)})` : ` (${ex(d.links.removed, 1)})`}`);
  if (d.images) parts.push(`images −${d.images.removed.length}/+${d.images.added.length}`);
  if (d.blocks) parts.push(d.blocks.order ? 'blocks reordered' : `blocks −[${d.blocks.removed.join(', ')}] +[${d.blocks.added.join(', ')}]`);
  if (d.metadata) parts.push(`metadata ${d.metadata.map((m) => m.key).join(', ')}`);
  return parts.join('; ');
}

export function report(results) {
  const md = ['# Regional differences in Document Authoring (what a rollout would replace)', '', new Date().toISOString(), '',
    'Source: the DA documents of every row of `tools/migration-scope/pages.csv`. Normalised before comparing: the locale prefix in links and media, the market in `country=`/`market=` query parameters and `/<cc>_<ll>` file names, whitespace. Text is compared as the multiset of block-level texts (−removed from the source / +added in the market).', ''];
  results.forEach(({ pair, rows }) => {
    const by = (s) => rows.filter((r) => r.status === s).length;
    const differs = rows.filter((r) => r.status === 'differs');
    const kinds = ['text', 'links', 'images', 'blocks', 'metadata'].map((k) => `${k} ${differs.filter((r) => r.diff[k]).length}`).join(', ');
    const groups = [...new Set(rows.map((r) => r.group))].map((g) => {
      const gr = rows.filter((r) => r.group === g);
      return `${g} ${gr.filter((r) => r.status === 'differs').length}/${gr.length}`;
    }).join(', ');
    const metaKeys = {};
    differs.forEach((r) => (r.diff.metadata || []).forEach((m) => { metaKeys[m.key] = (metaKeys[m.key] || 0) + 1; }));
    const raw = rows.filter((r) => r.rawIdentical);
    md.push(
      `## ${pair}`,
      '',
      `${rows.length} rows: ${by('identical')} identical, ${differs.length} differ, ${rows.length - by('identical') - differs.length} not compared (${[...new Set(rows.filter((r) => !['identical', 'differs'].includes(r.status)).map((r) => r.status))].join('; ') || 'none'}).`,
      '',
      `Of the ${by('identical')} identical pages only ${raw.length} are identical byte for byte (${raw.map((r) => r.target).join(', ')}); the others differ in the market of their links only (/${pair.split(' ')[0]}/… against /${pair.split(' vs ')[1]}/…, country=…). The app's rollout copies links as they are (no DNT step, views/rollout/index.js), so a rollout with merge marks each of those links as a difference (keep the local side), and one with overwrite would point the market's links at the source market.`,
      '',
      `- by kind: ${kinds}`,
      `- by template group (differ/rows): ${groups}`,
      `- metadata keys that differ: ${Object.entries(metaKeys).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(', ') || 'none'}`,
      '',
      '### Biggest differences',
      '',
      '| target | group | size | differences |',
      '|---|---|---|---|',
      ...differs.sort((a, b) => b.size - a.size).slice(0, 15).map((r) => `| ${r.target} | ${r.group} | ${r.size} | ${describe(r.diff)} |`),
      '',
      `<details><summary>All ${differs.length} pages that differ</summary>`,
      '',
      '| target | group | differences |',
      '|---|---|---|',
      ...differs.sort((a, b) => a.target.localeCompare(b.target)).map((r) => `| ${r.target} | ${r.group} | ${describe(r.diff)} |`),
      '',
      '</details>',
      '',
    );
  });
  return md.join('\n');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const argv = process.argv.slice(2);
  const results = await run({ refresh: argv.includes('--refresh'), limit: Number(argv.includes('--limit') ? argv[argv.indexOf('--limit') + 1] : 0) });
  fs.writeFileSync(path.join(root, 'tools/reports/loc-regional-diff.json'), `${JSON.stringify(results.map(({ pair, rows }) => ({ pair, rows: rows.map(({ diff, ...r }) => ({ ...r, kinds: diff ? Object.keys(diff) : [] })) })), null, 1)}\n`);
  fs.writeFileSync(path.join(root, 'tools/reports/loc-regional-diff.md'), report(results));
  results.forEach(({ pair, rows }) => console.log(`${pair}: ${rows.filter((r) => r.status === 'identical').length} identical, ${rows.filter((r) => r.status === 'differs').length} differ, ${rows.filter((r) => !['identical', 'differs'].includes(r.status)).length} not compared`));
}
