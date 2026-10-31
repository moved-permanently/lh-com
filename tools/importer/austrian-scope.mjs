/* eslint-disable no-console, max-len, import/extensions -- tooling */
/**
 * Austrian Airlines' site (lh-austrian): the scope from the lists of the Studio's groundwork
 * (content-sites/lh-austrian/lists: urls-all.tsv with the leave-out reason per sitemap URL,
 * roots.tsv, own-pages.tsv, links-outside-sitemap-at-*.tsv) and the snapshots, as ita-scope.mjs
 * does for lh-ita (option B):
 * - per root its kept sitemap pages (the leave-out column of urls-all.tsv, and leftOut() below for
 *   pages outside the sitemap: AirCore, /lhg/, login and profile shells with at/de's /anmeldung and
 *   /passwort-vergessen, feedbackai, _deact, _msm_moved, test pages, teaser fragments, DEACT pages);
 * - the language documents: every page of the language's reference root (LANGUAGE_VERSIONS), plus
 *   the pages its nav, footer and content link to that the sitemaps leave out (live noindex pages:
 *   /book/flights, /flightbooking, /travel-briefing ...; links followed one level: the targets with
 *   a snapshot, the rest are 404s, redirects or not captured yet); a market root's page with the
 *   same path is the document's `markets` entry;
 * - a market root's own pages: one document per language and path, on the first root that has it,
 *   the other roots of that language in its `markets`; each market root's homepage is its own
 *   document.
 * Writes content-sites/lh-austrian/scope.json (gitignored) and prints the numbers.
 *
 * Usage: node tools/importer/austrian-scope.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const HOST = 'www.austrian.com';
const W = path.join(root, 'content-sites/lh-austrian');
const LISTS = path.join(W, 'lists');
const SNAP = path.join(root, 'tools/importer/bd-snapshots', HOST);
// the pages the Studio's capture found absent on www (404; austrian-studio.mjs --absent)
const STUDIO = path.join(W, 'studio.json');
const ABSENT = new Set(Object.keys((fs.existsSync(STUDIO) ? JSON.parse(fs.readFileSync(STUDIO, 'utf8')) : {}).absent || {})
  .map((u) => new URL(u).pathname));
export const LANGUAGE_VERSIONS = {
  en: 'at/en', de: 'at/de', fr: 'fr/fr', it: 'it/it', ru: 'ru/ru', zh: 'cn/zh', es: 'es/es', el: 'gr/el', ja: 'jp/ja', pl: 'pl/pl',
};
export const REFERENCE_ROOTS = Object.values(LANGUAGE_VERSIONS);

/** Why a page path outside the sitemap is left out, or ''. */
export function leftOut(p) {
  if (/^\/(aircore|lhg)(\/|$)/.test(p)) return 'AirCore or /lhg/';
  if (!/^\/[a-z]{2}\/[a-z]{2}(\/|$)/.test(p)) return 'no market root';
  const rest = p.replace(/^\/[a-z]{2}\/[a-z]{2}/, '');
  if (/^\/(login|profile|profilelogin|anmeldung|passwort-vergessen|validate-mail-token)(\/|$)/i.test(rest)) return 'login or profile (app shells)';
  if (/feedbackai/i.test(rest)) return 'feedbackai';
  if (/_msm_moved/i.test(rest)) return 'msm leftover (_msm_moved)';
  if (/(^|[/_-])deact([/_-]|$)/i.test(rest)) return 'templates or _deact';
  if (/(^|[/_-])test([/_-]|$)/i.test(rest)) return 'test';
  if (/^\/homepage\/promotionteaser/i.test(rest)) return 'homepage teaser fragment';
  // a redirect on www to /fly/at-the-airport/orientation-at-airports/boarding (read on at/en and
  // at/de; the Studio's batches leave every root's out the same way): a redirects.json row
  if (rest === '/mobile-check-in') return 'redirect (mobile-check-in)';
  if (ABSENT.has(p)) return 'answers 404 on www (Studio capture)';
  if (/^\/homepage-new$/.test(rest)) return '';
  return '';
}

const tsv = (f) => {
  const [head, ...rows] = fs.readFileSync(path.join(LISTS, f), 'utf8').trim().split('\n');
  const keys = head.split('\t');
  return rows.map((l) => Object.fromEntries(l.split('\t').map((v, i) => [keys[i], v])));
};
const snapOf = (p) => path.join(SNAP, `${p}.html`);
// a page whose title starts with "DEACT:" is live but deactivated on www (two pilot pages)
const deactivated = (p) => fs.existsSync(snapOf(p)) && /<title>\s*DEACT:/i.test(fs.readFileSync(snapOf(p), 'utf8').slice(0, 60000));

/** The same-root page paths a snapshot links to (content, nav and footer). */
export function linksOf(html, key) {
  const out = new Set();
  [...html.matchAll(/href="(?:https:\/\/www\.austrian\.com)?(\/[a-z]{2}\/[a-z]{2}\/[^"#?]*)/g)].forEach((m) => {
    const raw = m.at(1);
    let p;
    try { p = decodeURIComponent(raw); } catch (e) { p = raw; }
    p = p.replace(/\.html$/, '').replace(/\/$/, '');
    if (p.startsWith(`/${key}/`)) out.add(p);
  });
  return [...out];
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const urls = tsv('urls-all.tsv');
  const roots = {};
  urls.forEach((r) => {
    roots[r.root] ||= { keep: new Set(), leftOut: {}, lang: r.root.split('/')[1] };
    const x = roots[r.root];
    const p = new URL(r.loc).pathname.replace(/\.html$/, '').replace(/\/$/, '');
    const why = r.leave_out || leftOut(p) || (deactivated(p) ? 'DEACT page' : '');
    if (why) x.leftOut[why] = (x.leftOut[why] || 0) + 1; else x.keep.add(p.slice(r.root.length + 1) || '/homepage');
  });
  // the reference roots' links outside their sitemap, one level: from every snapshot of the root
  const linked = {};
  const notLive = {};
  REFERENCE_ROOTS.forEach((ref) => {
    const dir = path.join(SNAP, ref);
    if (!fs.existsSync(dir)) return;
    const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
    const targets = new Set();
    walk(dir).filter((f) => f.endsWith('.html')).forEach((f) => {
      const p = `/${path.relative(SNAP, f).replace(/\.html$/, '')}`;
      if (!roots[ref].keep.has(p.slice(ref.length + 1))) return; // links of in-scope pages only
      const html = fs.readFileSync(f, 'utf8');
      linksOf(html, ref).forEach((t) => targets.add(t));
      // a form's confirmation page (its :redirect), at its public path (successOf, austrian-import)
      [...html.matchAll(/name=":redirect"[^>]*value="\/content\/aua\/markets(\/[a-z]{2}\/[a-z]{2})(\/[^"]+?)(?:\.html)?"/g)].forEach((m) => {
        if (m[1] === `/${ref}`) targets.add(m[2] === '/footer-pages/help-and-contact/form-confirmation' && m[1].endsWith('/en') ? `${m[1]}/form-confirmation` : `${m[1]}${m[2]}`);
      });
    });
    [...targets].forEach((t) => {
      const s = t.slice(ref.length + 1);
      if (roots[ref].keep.has(s) || leftOut(t)) return;
      if (fs.existsSync(snapOf(t)) && !deactivated(t)) { roots[ref].keep.add(s); (linked[ref] ||= []).push(s); } else (notLive[ref] ||= []).push(s);
    });
  });
  // the Studio's batch pages with a snapshot are in scope too (at/de's manage-my-bookings, linked
  // only from the left-out login page /anmeldung)
  const batchPages = tsv('batches.tsv').flatMap((b) => (b.url_list || '').split(' ')).concat(fs.readFileSync(path.join(LISTS, 'batch-01.txt'), 'utf8').split('\n'))
    .map((u) => u.trim())
    .filter((u) => u.startsWith('https://'))
    .map((u) => new URL(u).pathname);
  batchPages.forEach((p) => {
    const r = p.split('/').slice(1, 3).join('/');
    const s = p.slice(r.length + 1) || '/homepage';
    if (!roots[r] || roots[r].keep.has(s) || leftOut(p) || !fs.existsSync(snapOf(p)) || deactivated(p)) return;
    roots[r].keep.add(s);
    (linked[r] ||= []).push(s);
  });
  const out = {
    recorded: new Date().toISOString(), roots: {}, documents: {}, linked, linkedWithoutSnapshot: notLive,
  };
  Object.entries(roots).sort().forEach(([r, x]) => {
    out.roots[r] = {
      lang: x.lang, version: LANGUAGE_VERSIONS[x.lang] || null, keep: x.keep.size, leftOut: x.leftOut, suffixes: [...x.keep].sort(),
    };
  });
  // language documents with their markets
  REFERENCE_ROOTS.forEach((ref) => {
    const { lang } = out.roots[ref];
    out.roots[ref].suffixes.forEach((s) => {
      const markets = s === '/homepage' ? [] : Object.keys(out.roots).filter((r) => r !== ref && out.roots[r].lang === lang && out.roots[r].suffixes.includes(s));
      out.documents[`/${ref}${s}`] = { kind: 'language', markets };
    });
  });
  // market roots: own pages (one document per language and path) and homepages
  Object.entries(out.roots).forEach(([r, x]) => {
    if (!x.version || x.version === r) return;
    const v = new Set(out.roots[x.version].suffixes);
    x.own = x.suffixes.filter((s) => !v.has(s) || s === '/homepage');
  });
  const ownByLangPath = {};
  Object.entries(out.roots).forEach(([r, x]) => (x.own || []).forEach((s) => {
    if (s === '/homepage') { out.documents[`/${r}/homepage`] = { kind: 'market homepage', markets: [] }; return; }
    (ownByLangPath[`${x.lang} ${s}`] ||= []).push(r);
  }));
  Object.entries(ownByLangPath).forEach(([k, rs]) => {
    const s = k.slice(k.indexOf(' ') + 1);
    // the document on the first root whose page was captured (the Studio captured one per page);
    // none captured: the page answers 404 on www (old campaigns), no document
    const sorted = rs.sort();
    const home = sorted.find((r) => fs.existsSync(snapOf(`/${r}${s}`)));
    if (!home) { (out.ownWithoutSnapshot ||= []).push(`/${sorted[0]}${s} (${sorted.length} roots)`); return; }
    out.documents[`/${home}${s}`] = { kind: 'own', markets: sorted.filter((r) => r !== home) };
  });
  fs.mkdirSync(W, { recursive: true });
  fs.writeFileSync(path.join(W, 'scope.json'), `${JSON.stringify(out, null, 1)}\n`);
  const kinds = {};
  Object.values(out.documents).forEach((d) => { kinds[d.kind] = (kinds[d.kind] || 0) + 1; });
  console.log(`${Object.keys(out.roots).length} roots, ${Object.keys(out.documents).length} documents (${Object.entries(kinds).map(([k, n]) => `${k} ${n}`).join(', ')})`);
  REFERENCE_ROOTS.forEach((r) => console.log(`${r}: ${out.roots[r].keep} kept (linked outside the sitemap ${(linked[r] || []).length}, linked without a snapshot ${(notLive[r] || []).length})`));
}
