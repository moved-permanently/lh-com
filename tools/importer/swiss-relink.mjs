/* eslint-disable no-console, max-len -- CLI */
/**
 * lh-swiss's ch roots' and sub-sites' (corporate, medical services) links to www pages the site
 * serves made relative, as swiss-market-import.mjs --relink does for the market documents:
 *   --collect  the documents: content-sites/lh-swiss/content/ch, and the sub-sites' from their
 *              DA source (their <main>, as .plain.html under content/<path>)
 *   --probe    every www page link's target on swiss.turnsthe.page (lh-edge answers SWISS's pages
 *              from lh-swiss's origin only: no request to www): its site path (docName), the
 *              answer without following redirects, a redirect's target asked too; every www DAM
 *              link's copy in DA (its Edge Delivery name) -> runs/relink-targets.json
 *   --write    relinkedTo on every document -> runs/relink-ch-upload.txt and the list
 *              tools/reports/lh-swiss-ch-relinked.tsv (document, page links, DAM links)
 * Links to www pages lh-swiss does not have stay as they are. Never publishes; uploads with
 * da-upload.mjs --site lh-swiss --list runs/relink-ch-upload.txt.
 * Usage: node tools/importer/swiss-relink.mjs --collect | --probe | --write
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { edsDamPath } from '../../scripts/dam-path.js';
// eslint-disable-next-line import/extensions
import { docName } from './swiss-import.mjs';
// eslint-disable-next-line import/extensions
import { assetOf } from './swiss-dam.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const W = path.join(root, 'content-sites/lh-swiss');
const DOCS = path.join(W, 'content');
const HOST = 'https://swiss.turnsthe.page';
const TARGETS = path.join(W, 'runs/relink-targets.json');
const WWW_LINK = /href="https:\/\/www\.swiss\.com(\/[^"?#]*)([?#][^"]*)?"/g;
// the paths a page link may name: a <cc>/<ll> root or a sub-site language
const PAGE = /^\/([a-z]{2}\/[a-z]{2}|corporate\/[a-z]{2}|medicalservices\/[a-z]{2}|magazine\/[a-z]{2})(\/|$)/;

/**
 * A document with its www links to served pages (pages: www path -> our path) and DAM copies
 * (dam: www path -> Edge Delivery path) relative, the query and fragment kept: { doc, kinds }.
 */
export function relinkedTo(doc, { pages = new Map(), dam = new Map() }) {
  const kinds = { page: 0, dam: 0 };
  const out = doc.replace(WWW_LINK, (m, p, rest = '') => {
    if (pages.has(p)) { kinds.page += 1; return `href="${pages.get(p)}${rest}"`; }
    if (dam.has(p)) { kinds.dam += 1; return `href="${dam.get(p)}${rest}"`; }
    return m;
  });
  return { doc: out, kinds };
}

/**
 * Our path for a probed target ({ site, status, location }): the site path when it answered 200,
 * a redirect's target on our host when that answers 200 (ok), else null.
 */
export function targetOf(t, ok = () => false) {
  if (!t) return null;
  if (t.status === 200) return t.site;
  if (![301, 302, 307, 308].includes(t.status) || !t.location) return null;
  const u = new URL(t.location, HOST);
  if (u.origin !== HOST) return null;
  return ok(u.pathname) ? u.pathname : null;
}

const walk = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])) : []);
const docsOf = () => walk(DOCS).filter((f) => f.endsWith('.plain.html') && /^(ch|corporate|medicalservices)\//.test(path.relative(DOCS, f)))
  .map((f) => [`/${path.relative(DOCS, f).replace(/\.plain\.html$/, '')}`, f]);
const decode = (s) => { try { return decodeURI(s); } catch (e) { return s; } };
const sitePath = (p) => docName(decode(p).replace(/\/+$/, '').replace(/\.html$/, ''));
async function pool(items, n, fn) {
  const queue = [...items];
  await Promise.all(Array.from({ length: n }, async () => {
    while (queue.length) {
      // eslint-disable-next-line no-await-in-loop
      await fn(queue.shift());
    }
  }));
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  if (argv.includes('--collect')) {
    const state = JSON.parse(fs.readFileSync(path.join(root, 'tools/importer/da-upload-state-lh-swiss.json'), 'utf8')).docs;
    const sub = Object.keys(state).filter((p) => /^\/(corporate|medicalservices)\//.test(p));
    let n = 0;
    await pool(sub, 8, async (p) => {
      const r = await fetch(`https://admin.da.live/source/moved-permanently/lh-swiss${p}.html`);
      if (!r.ok) return;
      const main = ((await r.text()).match(/<main>([\s\S]*)<\/main>/) || [])[1];
      if (!main) return;
      const f = path.join(DOCS, `${p}.plain.html`);
      fs.mkdirSync(path.dirname(f), { recursive: true });
      fs.writeFileSync(f, `${main.trim()}\n`);
      n += 1;
    });
    console.log(`collect: ${n} of ${sub.length} sub-site documents from DA`);
  }
  if (argv.includes('--probe')) {
    const pageLinks = new Set();
    const damLinks = new Map();
    docsOf().forEach(([d, f]) => {
      [...fs.readFileSync(f, 'utf8').matchAll(WWW_LINK)].forEach((m) => {
        if (/^\/content\/dam\//.test(m[1])) damLinks.set(m[1], d);
        else if (PAGE.test(m[1])) pageLinks.add(m[1]);
      });
    });
    const pages = {};
    await pool([...pageLinks], 6, async (p) => {
      const site = sitePath(p);
      const r = await fetch(`${HOST}${site}`, { redirect: 'manual' }).catch(() => null);
      pages[p] = { site, status: r ? r.status : 0, location: r ? r.headers.get('location') || '' : '' };
    });
    // a redirect's target on our host: asked once
    const via = [...new Set(Object.values(pages).filter((t) => t.location)
      .map((t) => new URL(t.location, HOST))
      .filter((u) => u.origin === HOST)
      .map((u) => u.pathname))];
    const answers = {};
    await pool(via, 6, async (p) => {
      const r = await fetch(`${HOST}${p}`, { redirect: 'manual' }).catch(() => null);
      answers[p] = r ? r.status : 0;
    });
    // a DAM link: its copy in DA under its Edge Delivery name
    const dam = {};
    await pool([...damLinks.keys()], 6, async (www) => {
      const eds = edsDamPath(assetOf(decode(www)));
      const r = await fetch(`https://admin.da.live/source/moved-permanently/lh-swiss${eds}`, { method: 'HEAD' }).catch(() => null);
      dam[www] = { eds, da: r ? r.status : 0 };
    });
    fs.writeFileSync(TARGETS, `${JSON.stringify({ pages, answers, dam }, null, 1)}\n`);
    const by = {};
    Object.values(pages).forEach((t) => { by[t.status] = (by[t.status] || 0) + 1; });
    console.log(`probe: ${pageLinks.size} page targets`, by, `${via.length} redirect targets, ${Object.keys(dam).length} DAM links (${Object.values(dam).filter((x) => x.da === 200).length} in DA)`);
  }
  if (argv.includes('--write')) {
    const { pages: probed, answers, dam: damProbe } = JSON.parse(fs.readFileSync(TARGETS, 'utf8'));
    const pages = new Map(Object.entries(probed).map(([p, t]) => [p, targetOf(t, (x) => answers[x] === 200)]).filter(([, x]) => x));
    const dam = new Map(Object.entries(damProbe).filter(([, x]) => x.da === 200).map(([p, x]) => [p, x.eds]));
    const rows = [];
    docsOf().forEach(([d, f]) => {
      const before = fs.readFileSync(f, 'utf8');
      const { doc, kinds } = relinkedTo(before, { pages, dam });
      if (doc === before) return;
      fs.writeFileSync(f, doc);
      rows.push([d, kinds.page, kinds.dam]);
    });
    rows.sort((a, b) => a[0].localeCompare(b[0]));
    fs.writeFileSync(path.join(W, 'runs/relink-ch-upload.txt'), `${rows.map((r) => r[0]).join('\n')}\n`);
    fs.writeFileSync(path.join(root, 'tools/reports/lh-swiss-ch-relinked.tsv'), `document\tserved page links\tDAM links\n${rows.map((r) => r.join('\t')).join('\n')}\n`);
    console.log(`write: ${rows.length} documents changed (${rows.reduce((s, r) => s + r[1], 0)} page links, ${rows.reduce((s, r) => s + r[2], 0)} DAM links); ${pages.size} targets on our host`);
  }
}
