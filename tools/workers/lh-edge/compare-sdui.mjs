/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, max-len -- dev tooling */
/**
 * Compares lh-edge's app screens with www's recorded answers (tools/source-export/feeds/sdui/):
 * for each of the 132 recorded URLs the same path on lh-edge (--host), or rendered locally from
 * the imported documents (--local: content/content/mobile/**.plain.html and an index built from
 * them), field by field: item types and order, texts, image URLs (host normalised), link
 * targets, actions. Lists missing, extra and different fields, and the fields left out on
 * purpose (LEFT_OUT). Writes tools/reports/lh-edge/compare-sdui.md and .json.
 * Usage: node tools/workers/lh-edge/compare-sdui.mjs (--host https://<lh-edge host> | --local
 *   | --origin https://main--lh-com--moved-permanently.aem.page) [--only <substring>]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderScreen, readDocument } from './src/sdui.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const FEED = path.join(root, 'tools/source-export/feeds/sdui');
const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
const HOST = (opt('host', '') || '').replace(/\/$/, '');
// --origin https://main--…aem.page: render the origin's page HTML (preview) with the local index
const ORIGIN_RENDER = (opt('origin', '') || '').replace(/\/$/, '');
const LOCAL = argv.includes('--local') || Boolean(ORIGIN_RENDER);
const only = opt('only', '');
if (!HOST && !LOCAL) {
  console.error('usage: compare-sdui.mjs (--host https://<lh-edge host> | --local)');
  process.exit(2);
}
const PUBLIC_HOST = LOCAL ? 'lhedge.example' : new URL(HOST).host;

/** Fields we leave out on purpose (path patterns). */
const LEFT_OUT = [
  { re: /(^|\.)id$/, why: 'id: www sends AEM node paths; lh-edge generates stable ids of its own' },
];

const index = JSON.parse(fs.readFileSync(path.join(FEED, 'index.json'), 'utf8')).urls;
const urls = Object.keys(index).filter((u) => !only || u.includes(only));

// --local: the documents and an index built from them, like the query index
const docFile = (p) => path.join(root, 'content', `${p}.plain.html`);
let localIndex = [];
if (LOCAL) {
  const screens = [...new Set(urls.map((u) => u.replace(/(\.v2)?\.sdui$/, '')))];
  const all = [...new Set(Object.keys(index).map((u) => u.replace(/(\.v2)?\.sdui$/, '')))];
  localIndex = all.filter((p) => fs.existsSync(docFile(p))).map((p) => {
    const html = fs.readFileSync(docFile(p), 'utf8');
    const { meta } = readDocument(html);
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    return {
      path: p,
      title: meta.title || '',
      headline: h1 ? h1[1].replace(/<[^>]+>/g, '').trim() : '',
      description: meta.description || '',
      image: meta['teaser-image'] || '',
      category: meta.category || '',
      date: meta.date || '',
      order: meta.order || '',
    };
  });
  console.log(`local: ${screens.length} screens, index of ${localIndex.length} documents`);
}

const normHost = (v) => (typeof v === 'string' ? v.replace(/https:\/\/(www\.lufthansa\.com|[a-z0-9.-]+\.bbird\.live|lhedge\.example)(?=\/content\/)/g, 'https://HOST') : v);
// www's rich text sometimes carries an editor style on <b> (<b style="font-size: 16px;">): not
// authorable in DA, normalised (listed under "normalised")
// Document Authoring trims whitespace at the end of a text and of a bold run (trailing spaces,
// &nbsp;, a <br>) and collapses runs of spaces: normalised too
const normText = (v) => (typeof v === 'string' ? v.replace(/<b style="[^"]*">/g, '<b>')
  .replace(/(?:\s|&nbsp;|<br>)+(<\/b>|<\/li>)/g, '$1').replace(/(<li>)(?:\s|&nbsp;)+/g, '$1').replace(/(?:\s|&nbsp;|<br>)+$/, '').replace(/^\s+/, '')
  .replace(/ {2,}/g, ' ') : v);

/** Field-by-field differences of two JSON values. */
function diff(a, b, p, out) {
  if (LEFT_OUT.some((l) => l.re.test(p))) {
    if (JSON.stringify(a) !== JSON.stringify(b)) out.leftOut.push(p);
    return;
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    const A = Array.isArray(a) ? a : []; const B = Array.isArray(b) ? b : [];
    const n = Math.max(A.length, B.length);
    for (let i = 0; i < n; i += 1) {
      if (i >= B.length) out.missing.push(`${p}[${i}]${A[i] && A[i].type ? ` ${A[i].type}` : ''}`);
      else if (i >= A.length) out.extra.push(`${p}[${i}]${B[i] && B[i].type ? ` ${B[i].type}` : ''}`);
      else diff(A[i], B[i], `${p}[${i}]`, out);
    }
    return;
  }
  if (a && typeof a === 'object' && b && typeof b === 'object') {
    new Set([...Object.keys(a), ...Object.keys(b)]).forEach((k) => {
      const q = p ? `${p}.${k}` : k;
      if (!(k in b)) { if (!LEFT_OUT.some((l) => l.re.test(q))) out.missing.push(q); else out.leftOut.push(q); } else if (!(k in a)) { if (!LEFT_OUT.some((l) => l.re.test(q))) out.extra.push(q); else out.leftOut.push(q); } else diff(a[k], b[k], q, out);
    });
    return;
  }
  const x = normText(normHost(a)); const y = normText(normHost(b));
  if (x !== y) out.different.push({ path: p, www: a, ours: b });
  else if (a !== b && typeof a === 'string' && normHost(a) !== normHost(b)) out.normalised.push({ path: p, www: a, ours: b });
}

const results = [];
for (const u of urls) {
  const ref = JSON.parse(fs.readFileSync(path.join(FEED, index[u].file.replace(/^sdui\//, '')), 'utf8'));
  const r = { url: u, version: u.endsWith('.v2.sdui') ? 'v2' : 'v1' };
  let ours;
  try {
    if (LOCAL) {
      const p = u.replace(/(\.v2)?\.sdui$/, '');
      const html = ORIGIN_RENDER ? await (await fetch(`${ORIGIN_RENDER}${p}`)).text() : fs.readFileSync(docFile(p), 'utf8');
      ours = renderScreen(html, {
        path: p, version: r.version, host: PUBLIC_HOST, index: localIndex,
      });
      r.status = 200;
    } else {
      const resp = await fetch(`${HOST}${u}`);
      r.status = resp.status;
      r.contentType = resp.headers.get('content-type');
      r.cacheControl = resp.headers.get('cache-control');
      if (resp.ok) ours = await resp.json();
    }
  } catch (e) {
    r.error = e.message;
  }
  const out = {
    missing: [], extra: [], different: [], leftOut: [], normalised: [],
  };
  if (ours) diff(ref, ours, '', out);
  Object.assign(r, out, { equal: Boolean(ours) && !out.missing.length && !out.extra.length && !out.different.length });
  results.push(r);
}

const sum = (v) => results.filter((r) => r.version === v);
const line = (v) => {
  const rs = sum(v);
  return `${v}: ${rs.length} URLs, ${rs.filter((r) => r.equal).length} equal apart from the fields left out, ${rs.filter((r) => !r.equal).length} with differences (missing ${rs.reduce((n, r) => n + r.missing.length, 0)}, extra ${rs.reduce((n, r) => n + r.extra.length, 0)}, different ${rs.reduce((n, r) => n + r.different.length, 0)})`;
};
const OUT = path.join(root, 'tools/reports/lh-edge');
fs.mkdirSync(OUT, { recursive: true });
const SUFFIX = ORIGIN_RENDER ? '-origin' : (LOCAL ? '-local' : '');
fs.writeFileSync(path.join(OUT, `compare-sdui${SUFFIX}.json`), `${JSON.stringify({ host: HOST || 'local', checkedAt: new Date().toISOString(), leftOut: LEFT_OUT.map((l) => l.why), results }, null, 1)}\n`);
const md = [`# lh-edge app screens vs www (${HOST || 'local render'})`, '', new Date().toISOString(), '', line('v1'), '', line('v2'), '',
  'Left out on purpose:', ...LEFT_OUT.map((l) => `- ${l.why}`), '- normalised (listed per URL in the JSON): whitespace Document Authoring does not keep (spaces, &nbsp; and <br> at the end of a text, of a bold run or of a list item, at the start of a list item, "\\n" at the end of a text, leading spaces, runs of spaces) and an editor style on <b> (<b style="font-size: 16px;">)', '',
  '| URL | status | equal | missing | extra | different (first) |', '|---|---|---|---|---|---|',
  ...results.map((r) => `| ${r.url} | ${r.status ?? r.error} | ${r.equal ? 'yes' : 'no'} | ${r.missing.slice(0, 3).join('<br>')} | ${r.extra.slice(0, 3).join('<br>')} | ${r.different.slice(0, 2).map((d) => `${d.path}: ${JSON.stringify(d.www).slice(0, 60)} / ${JSON.stringify(d.ours).slice(0, 60)}`).join('<br>')} |`)];
fs.writeFileSync(path.join(OUT, `compare-sdui${SUFFIX}.md`), `${md.join('\n')}\n`);
console.log(line('v1'));
console.log(line('v2'));
results.filter((r) => !r.equal).slice(0, 12).forEach((r) => console.log(`  ${r.url}: missing ${r.missing.slice(0, 2).join(', ')} | extra ${r.extra.slice(0, 2).join(', ')} | diff ${r.different.slice(0, 2).map((d) => `${d.path} ${JSON.stringify(d.www).slice(0, 70)} vs ${JSON.stringify(d.ours).slice(0, 70)}`).join(' ; ')}`));
