/* eslint-disable import/extensions, max-len, no-console, no-continue, no-restricted-syntax, no-unused-vars, object-curly-newline, prefer-const -- dev tooling */
// market-diff self-test of the normaliser and the verdict on REAL page pairs: takes pairs that md-compare.mjs found "same",
// changes the root page's saved body in ways a market could change it (must be found) and in ways that are only noise
// (must not be found), and runs the same decision (lib/verdict.mjs) on the changed page. Offline, reads md-fetch bodies.
//
// usage: node bin/md-selftest.mjs --pairs <pairs.tsv> --fetch <dir> [--profile aem-html|tap-next] [--host <www host>]
//          [--max 12] [--out <file.json>]
// Prints one line per mutation (found / missed / skipped) and the totals; exit code 1 when a must-find change was missed
// or a noise change was flagged.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { parseHTML } from 'linkedom';
import { decide } from '../lib/verdict.mjs';
import readText from '../lib/files.mjs';

const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
const FETCH = path.resolve(opt('fetch', '.'));
const PROFILE = opt('profile', 'aem-html');
const HOST = opt('host', '');
const MAX = Number(opt('max', '12'));
const { pageFacts, VISIBLE_ATTR } = await import(PROFILE === 'tap-next' ? '../lib/tap-next.mjs' : '../lib/aem-html.mjs');
const rootStyle = PROFILE === 'tap-next' ? 'll-cc' : 'cc/ll';
const lines = readText(opt('pairs')).split('\n').filter((l) => l.trim() && !l.startsWith('#'));
const head = lines.shift().split('\t');
const pairs = lines.map((l) => Object.fromEntries(l.split('\t').map((v, i) => [head[i], v])))
  .map((p) => ({ ...p, rest: p.rest || p.root_path.replace(/^\/content\/[^/]+\/markets/, '').replace(/^\/[a-z]{2}[/-][a-z]{2}/, '') }));
const fetched = new Map();
fs.readFileSync(path.join(FETCH, 'fetch.jsonl'), 'utf8').split('\n').filter(Boolean).forEach((l) => {
  try { const r = JSON.parse(l); if (r.path) fetched.set(r.path, r); } catch (e) { /* torn line */ }
});
const body = (p) => {
  const r = fetched.get(p);
  return r && r.kind === 'ok' && r.file ? zlib.gunzipSync(fs.readFileSync(path.join(FETCH, r.file))).toString('utf8') : null;
};
const facts = (html, root) => pageFacts(html, root, { rootStyle, host: HOST });
const verdictOf = (vHtml, rHtml, p) => decide(facts(vHtml, p.version), facts(rHtml, p.root), { visibleAttr: VISIBLE_ATTR, host: HOST });

// ---------- aem-html mutations (on the root page's DOM) ----------
function area(document) {
  const marker = document.querySelector('h2#main') || document.querySelector('#main');
  return marker ? marker.parentElement : document.body;
}
// the content area as lib/aem-html.mjs parsePage cuts it (no header, footer, skip links, sticky header, consent layer)
const inArea = (a, el) => a.contains(el) && !el.closest('header, footer, .skiplinks, .sticky-header-placeholder, h2#main, #onetrust-consent-sdk, [id^="onetrust"], script, style, noscript, template');
function textNodes(a, re) {
  const out = [];
  const walk = (n) => {
    for (const c of n.childNodes) {
      if (c.nodeType === 3) { if (re.test(c.textContent) && c.parentElement && inArea(a, c.parentElement)) out.push(c); } else if (c.nodeType === 1 && !['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE'].includes(c.tagName)) walk(c);
    }
  };
  walk(a);
  return out;
}
// each mutation: [name, expect ('differs:<class>' or 'same'), fn(document, pair) -> true when applied]
const AEM = [
  ['word', 'differs:content', (d) => { const t = textNodes(area(d), /\p{L}{6,}/u)[0]; if (!t) return false; t.textContent = t.textContent.replace(/\p{L}{6,}/u, 'Qwertzuiop'); return true; }],
  ['digit', 'differs:content', (d) => {
    const t = textNodes(area(d), /\d/).find((n) => n.textContent.trim().length > 3);
    if (!t) return false; t.textContent = t.textContent.replace(/\d/, (x) => String((Number(x) + 1) % 10)); return true;
  }],
  ['drop-paragraph', 'differs:content', (d) => { const ps = [...area(d).querySelectorAll('p')].filter((p) => inArea(area(d), p) && p.textContent.trim().length > 20); if (!ps.length) return false; ps[ps.length - 1].remove(); return true; }],
  ['add-paragraph', 'differs:content', (d) => { const ps = [...area(d).querySelectorAll('p')].filter((p) => inArea(area(d), p)); if (!ps.length) return false; const n = d.createElement('p'); n.textContent = 'Local information for this market only.'; ps[0].after(n); return true; }],
  ['image', 'differs:content', (d) => { const i = [...area(d).querySelectorAll('img[src]')].find((x) => inArea(area(d), x)); if (!i) return false; i.setAttribute('src', i.getAttribute('src').replace(/(\.[a-z]+)?$/, '-local$1')); i.removeAttribute('srcset'); return true; }],
  ['link', 'differs:links', (d, p) => {
    const a = [...area(d).querySelectorAll('a[href]')].find((x) => inArea(area(d), x) && /^\/|^https?:/.test(x.getAttribute('href')));
    if (!a) return false; a.setAttribute('href', `/${p.root}/a-page-only-this-market-has`); return true;
  }],
  ['tel', 'differs:links', (d) => { const a = [...area(d).querySelectorAll('a[href^="tel:"]')][0]; if (!a) return false; a.setAttribute('href', a.getAttribute('href').replace(/\d(?=\D*$)/, (x) => String((Number(x) + 1) % 10))); return true; }],
  ['alt', 'differs:attributes', (d) => { const i = [...area(d).querySelectorAll('img[alt]')].find((x) => inArea(area(d), x) && x.getAttribute('alt').trim()); if (!i) return false; i.setAttribute('alt', `${i.getAttribute('alt')} (local)`); return true; }],
  ['title', 'differs:meta', (d) => { const t = d.querySelector('title'); if (!t) return false; t.textContent = `${t.textContent} | local`; return true; }],
  ['widget-setting', 'differs:widget', (d) => {
    for (const el of area(d).querySelectorAll('*')) {
      if (!inArea(area(d), el)) continue;
      for (const at of el.attributes) {
        if (!at.name.startsWith('data-') || /track|analytic|tealium|gtm|uniqueid|random|identifier|technicalname|emptytext|prerendered|testid|^data-(bs-)?(target|parent)$|^data-cmp-|^data-sly/.test(at.name)) continue;
        let j; try { j = JSON.parse(at.value); } catch (e) { continue; }
        if (!j || typeof j !== 'object') continue;
        const k = Object.keys(j).find((x) => typeof j[x] === 'string' && j[x].length > 2 && !/^(id|uuid|uniqueid|componentid|instanceid|teaserid|site|country|countrycode|market|marketcode|pos|lang|language|locale|languagecode|portalsite|tenantsite|relatedArticlesData)$/i.test(x));
        if (!k) continue;
        j[k] = `${j[k]}-local`; el.setAttribute(at.name, JSON.stringify(j)); return true;
      }
    }
    return false;
  }],
  ['drop-widget', 'differs:widget', (d) => { const w = [...area(d).querySelectorAll('*')].find((x) => inArea(area(d), x) && x.tagName.includes('-') && !/^MAUI-/.test(x.tagName) && !x.textContent.trim()); if (!w) return false; w.remove(); return true; }],
  // noise: must stay the same
  ['ids', 'same', (d) => { let n = 0; area(d).querySelectorAll('[id]').forEach((el) => { if (el.id !== 'main') { el.setAttribute('id', `${el.id}-${Math.floor(Math.random() * 1e9)}`); n += 1; } }); return n > 0; }],
  ['whitespace', 'same', (d) => { const ts = textNodes(area(d), /\S \S/); ts.forEach((t) => { t.textContent = `\n  ${t.textContent.replace(/ /g, '  \n ')}  `; }); return ts.length > 0; }],
  ['split-sentence', 'same', (d) => {
    const t = textNodes(area(d), /\S{3,} \S{3,} \S{3,}/)[0]; if (!t) return false;
    const s = t.textContent; const i = s.indexOf(' ', Math.floor(s.length / 2)); if (i < 0) return false;
    const span = d.createElement('span'); span.textContent = s.slice(i); t.textContent = s.slice(0, i); t.after(span); return true;
  }],
  ['other-root-links', 'same', (d, p) => {
    let n = 0; const other = p.root === 'de/de' ? 'at/de' : 'de/de';
    area(d).querySelectorAll('a[href]').forEach((a) => { const h = a.getAttribute('href'); const h2 = h.replace(new RegExp(`(^|//[^/]+)/${p.root.replace('/', '\\/')}(?=/|$)`), `$1/${other}`); if (h2 !== h) { a.setAttribute('href', h2); n += 1; } });
    return n > 0;
  }],
  ['header-footer', 'same', (d) => { const h = d.querySelector('header, footer'); if (!h) return false; const t = textNodes(h, /\p{L}{4,}/u); const p = d.createElement('p'); p.textContent = 'Changed site-wide text'; h.appendChild(p); return true || t; }],
  ['tracking', 'same', (d) => { const els = [...area(d).querySelectorAll('a, div')].slice(0, 20); els.forEach((el, i) => { el.setAttribute('data-tracking-id', `t${i}-${Date.now()}`); el.setAttribute('data-analytics-label', `x${i}`); }); return els.length > 0; }],
  ['class-names', 'same', (d) => { const els = [...area(d).querySelectorAll('[class]')].slice(0, 30); els.forEach((el) => el.setAttribute('class', `${el.getAttribute('class')} v2-component`)); return els.length > 0; }],
  ['date-format', 'same', (d) => {
    const t = textNodes(area(d), /^\s*\d{1,2}\. ?\p{L}+ (19|20)\d\d\s*$|^\s*\p{L}+ \d{1,2}, (19|20)\d\d\s*$/u)[0]; if (!t) return false;
    const s = t.textContent.trim(); let m = s.match(/^(\d{1,2})\. ?(\p{L}+) (\d{4})$/u);
    t.textContent = m ? `${m[2]} ${m[1]}, ${m[3]}` : s.replace(/^(\p{L}+) (\d{1,2}), (\d{4})$/u, '$2. $1 $3'); return true;
  }],
];

// ---------- tap-next mutations (on __NEXT_DATA__'s page object) ----------
const NEXT = /(<script id="__NEXT_DATA__" type="application\/json"[^>]*>)([\s\S]*?)(<\/script>)/;
function withPage(html, fn) {
  const m = html.match(NEXT); if (!m) return null;
  const j = JSON.parse(m[2]); const ok = fn(j.props.pageProps.page, j);
  if (!ok) return null;
  return html.replace(NEXT, (x, a, b, c) => `${a}${JSON.stringify(j)}${c}`);
}
// the parts of `page` lib/tap-next.mjs leaves out (alternates, variation names, model metadata, dates) are not mutated
const TAP_DROPPED = new Set(['hrefLangs', '_variation', '_variations', '_model', '_metadata', 'lastModified', 'modified', 'created']);
function leaves(o, pred, acc = [], key = 'page') {
  if (Array.isArray(o)) o.forEach((v, i) => leaves(v, pred, acc, key));
  else if (o && typeof o === 'object') {
    Object.entries(o).forEach(([k, v]) => { if (TAP_DROPPED.has(k)) return; if (pred(k, v, o)) acc.push([o, k]); leaves(v, pred, acc, k); });
  }
  return acc;
}
const PROSE = /^(value|title|text|description|plaintext|label|heading|question|answer)$/;
const TAP = [
  ['word', 'differs:content', (pg) => { const l = leaves(pg, (k, v) => PROSE.test(k) && typeof v === 'string' && /\p{L}{6,}/u.test(v))[0]; if (!l) return false; l[0][l[1]] = l[0][l[1]].replace(/\p{L}{6,}/u, 'Qwertzuiop'); return true; }],
  ['digit', 'differs:content', (pg) => { const l = leaves(pg, (k, v) => PROSE.test(k) && typeof v === 'string' && /\d/.test(v) && /\p{L}/u.test(v))[0]; if (!l) return false; l[0][l[1]] = l[0][l[1]].replace(/\d/, (x) => String((Number(x) + 1) % 10)); return true; }],
  ['drop-component', 'differs:content', (pg) => { const arrs = leaves(pg, (k, v) => Array.isArray(v) && v.length > 1 && v.some((x) => x && typeof x === 'object' && JSON.stringify(x).length > 200)); if (!arrs.length) return false; const [o, k] = arrs[0]; o[k] = o[k].slice(0, -1); return true; }],
  ['image', 'differs:content', (pg) => { const l = leaves(pg, (k, v) => typeof v === 'string' && /\.(jpe?g|png|webp|svg)(\?|$)/i.test(v))[0]; if (!l) return false; l[0][l[1]] = l[0][l[1]].replace(/(\.[a-z]+)(\?|$)/i, '-local$1$2'); return true; }],
  ['link', 'differs:links', (pg, j, p) => { const l = leaves(pg, (k, v) => /(url|href|link|path)$/i.test(k) && typeof v === 'string' && /^(\/|https?:)/.test(v) && !/\.(jpe?g|png|webp|svg)/i.test(v))[0]; if (!l) return false; l[0][l[1]] = `/${p.root}/a-page-only-this-market-has`; return true; }],
  ['title', 'differs:meta', null],
  // noise
  ['rich-text-structure', 'same', (pg) => { const l = leaves(pg, (k, v) => k === 'nodeType' && typeof v === 'string'); l.forEach(([o, k]) => { o[k] = `${o[k]}-v2`; }); return l.length > 0; }],
  ['hreflangs', 'same', (pg) => { if (!pg.hrefLangs) return false; pg.hrefLangs = []; return true; }],
  ['key-order', 'same', (pg) => { const l = leaves(pg, (k, v) => v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length > 2); l.slice(0, 50).forEach(([o, k]) => { o[k] = Object.fromEntries(Object.entries(o[k]).reverse()); }); return l.length > 0; }],
  ['whitespace', 'same', (pg) => { const l = leaves(pg, (k, v) => PROSE.test(k) && typeof v === 'string' && / /.test(v)); l.forEach(([o, k]) => { o[k] = ` ${o[k].replace(/ /g, '  ')} `; }); return l.length > 0; }],
];

const results = [];
let tested = 0;
for (const p of pairs) {
  if (tested >= MAX) break;
  const vHtml = body(p.version_path);
  const rHtml = body(p.root_path);
  if (!vHtml || !rHtml) continue;
  const base = verdictOf(vHtml, rHtml, p);
  if (base.verdict !== 'same') continue;
  tested += 1;
  for (const [name, expect, fn] of (PROFILE === 'tap-next' ? TAP : AEM)) {
    let changed = null;
    if (name === 'title') changed = rHtml.replace(/<title([^>]*)>([^<]*)<\/title>/i, '<title$1>$2 | local</title>');
    else if (PROFILE === 'tap-next') changed = withPage(rHtml, (pg, j) => fn(pg, j, p));
    else {
      const { document } = parseHTML(rHtml);
      changed = fn(document, p) ? document.toString() : null;
    }
    if (!changed || changed === rHtml) { results.push({ pair: `${p.root}${p.rest}`, name, expect, got: 'skipped' }); continue; }
    const v = verdictOf(vHtml, changed, p);
    const got = v.verdict === 'same' ? 'same' : `differs:${v.cls}`;
    const ok = expect === 'same' ? v.verdict === 'same' : v.verdict === 'differs';
    results.push({ pair: `${p.root}${p.rest}`, name, expect, got, ok, exactClass: got === expect || (expect === 'same' && v.verdict === 'same') });
  }
}
const by = {};
results.forEach((r) => {
  const b = by[r.name] || (by[r.name] = { expect: r.expect, applied: 0, ok: 0, exactClass: 0, skipped: 0, wrong: [] });
  if (r.got === 'skipped') { b.skipped += 1; return; }
  b.applied += 1;
  if (r.ok) b.ok += 1; else b.wrong.push(`${r.pair} -> ${r.got}`);
  if (r.exactClass) b.exactClass += 1;
});
console.log(`pairs tested (base verdict same): ${tested}`);
let bad = 0;
for (const [name, b] of Object.entries(by)) {
  bad += b.applied - b.ok;
  console.log(`${name.padEnd(20)} expect ${b.expect.padEnd(19)} applied ${String(b.applied).padStart(3)}  right ${String(b.ok).padStart(3)}  same class ${String(b.exactClass).padStart(3)}  skipped ${b.skipped}${b.wrong.length ? `  WRONG: ${b.wrong.slice(0, 3).join('; ')}` : ''}`);
}
if (opt('out')) fs.writeFileSync(opt('out'), JSON.stringify({ tested, by, results }, null, 1));
process.exit(bad ? 1 : 0);
