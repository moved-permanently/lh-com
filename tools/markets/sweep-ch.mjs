/* eslint-disable no-console, max-len, no-await-in-loop, no-restricted-syntax, import/extensions, import/no-extraneous-dependencies -- dev tooling, linkedom is a dev dependency */
/**
 * The content sweep of a market pilot (choice B, ch/en and ch/de): 2-3 pages per page type
 * (tools/importer/page-templates.json) that www has in both market roots and the replica has in
 * both language versions.
 *
 * --pick: writes the pages (--out-dir, default tools/reports/markets: ch-sweep-pages.json) and the
 *   capture lists for tools/importer/bd-session.mjs: the market pages not captured yet
 *   (ch-sweep-ch.txt) and the language version pages of www (ch-sweep-ref.txt, captured the same
 *   day into tools/source-export/market-ref with BD_SNAPSHOT_DIR elsewhere, so the import
 *   snapshots stay as they are).
 * Default: compares
 * 1. www's market page with www's language version page of the same day (where that capture is
 *    missing: the capture the language document was imported from, tools/source-export/pages)
 *    (tools/markets/compare-sample.mjs facts: authored text with codes, currencies and numbers
 *    masked, components): a page whose market version differs needs a document of the market;
 * 2. what lh-edge answers for the market page (--base, wrangler dev against the preview origin)
 *    with www's market page: status, route, canonical, the share of www's headings it has.
 * Writes ch-sweep.md and ch-sweep.json.
 * Usage: node tools/markets/sweep-ch.mjs --pick
 *        node tools/markets/sweep-ch.mjs [--base http://localhost:8787]
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import { facts, compare, mask } from './compare-sample.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PAGES = path.join(root, 'tools/source-export/pages');
const REF = path.join(root, 'tools/source-export/market-ref');
const ROOTS = { en: ['ch/en', 'de/en'], de: ['ch/de', 'de/de'] };
const WANT = { info: 3, insights: 3 };

const captured = (p, dir = PAGES) => fs.existsSync(path.join(dir, p, 'cleaned.html'));
const hasDoc = (p) => fs.existsSync(path.join(root, 'content', `${p}.plain.html`));
const first = (v) => [v || []].flat()[0];

/** The sweep's pages: [{template, en, de, chen, chde}]. */
export function pick(templates, groups) {
  const byEn = new Map();
  groups.forEach((g) => [g.paths['de/en'] || []].flat().forEach((p) => byEn.set(p, g)));
  const out = [];
  templates.forEach((t) => {
    const cands = (t.urls || []).map((u) => u.replace('https://www.lufthansa.com', '')).filter((p) => p.startsWith('/de/en/')).map((en) => {
      const g = byEn.get(en);
      if (!g) return null;
      const row = {
        en, de: first(g.paths['de/de']), chen: first(g.paths['ch/en']), chde: first(g.paths['ch/de']),
      };
      if (!row.de || !row.chen || !row.chde || !hasDoc(en) || !hasDoc(row.de)) return null;
      // insights: articles, not author, tag or overview pages
      if (t.name === 'insights' && (/\/articles\/(authors|tags)\//.test(en) || en.split('/').length < 6)) return null;
      return { ...row, score: [row.chen, row.chde].filter((p) => captured(p)).length };
    }).filter(Boolean)
      .sort((a, b) => b.score - a.score || a.en.localeCompare(b.en));
    // the captured ones first, then pages of different folders
    const chosen = [];
    const folders = new Set();
    cands.forEach((c) => {
      const f = c.en.split('/').slice(3, c.en.includes('/articles/') ? 5 : 4).join('/');
      if (chosen.length < (WANT[t.name] || 2) && (c.score || !folders.has(f))) {
        chosen.push(c);
        folders.add(f);
      }
    });
    chosen.forEach(({ score, ...c }) => out.push({ template: t.name, ...c }));
  });
  return out;
}

/** When a page was captured (its metadata.json). */
const capturedOn = (p, dir) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, p, 'metadata.json'), 'utf8')).timestamp.slice(0, 10);
  } catch (e) {
    return '';
  }
};

// www's skip-link target heading ("main content") is no content heading
const SKIP = new Set(['main content', 'seiteninhalt']);
const headings = (body, cc) => [...body.querySelectorAll('h1, h2, h3')].map((h) => mask(h.textContent, cc))
  .filter((t) => t.length > 2 && !SKIP.has(t));
const h1Of = (body, cc) => [...body.querySelectorAll('h1')].map((h) => mask(h.textContent, cc)).find((t) => t.length > 2 && !SKIP.has(t)) || '';

/**
 * What lh-edge answers for a page against www's capture of it (dir): status, route, canonical,
 * the H1 of both, the share of www's headings (h1-h3, masked) the answer has.
 */
export async function served(base, p, dir = PAGES) {
  const cc = p.split('/')[1];
  const resp = await fetch(`${base}${p}`, { redirect: 'manual' });
  const html = resp.status === 200 ? await resp.text() : '';
  const { document } = parseHTML(html || '<html><body></body></html>');
  const main = document.querySelector('main') || document.body;
  const ours = headings(main, cc);
  const file = path.join(dir, p, 'cleaned.html');
  const wwwBody = fs.existsSync(file) ? facts(p, cc, p.split('/')[2], dir) && parseHTML(`<html>${fs.readFileSync(file, 'utf8')}</html>`).document.body : null;
  const theirs = wwwBody ? headings(wwwBody, cc) : [];
  const pool = new Set(ours);
  const found = theirs.filter((h) => pool.has(h)).length;
  return {
    status: resp.status,
    route: resp.headers.get('x-lh-edge-route') || 'pass-through',
    canonical: (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || '',
    h1: [h1Of(main, cc), wwwBody ? h1Of(wwwBody, cc) : ''],
    headingsFound: theirs.length ? Math.round((100 * found) / theirs.length) : null,
    wwwHeadings: theirs.length,
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const argv = process.argv.slice(2);
  const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
  const outDir = path.resolve(root, opt('out-dir', 'tools/reports/markets'));
  const pagesFile = path.join(outDir, 'ch-sweep-pages.json');
  if (argv.includes('--pick')) {
    const { templates } = JSON.parse(fs.readFileSync(path.join(root, 'tools/importer/page-templates.json'), 'utf8'));
    const { groups } = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root, 'tools/source-export/feeds/sitemaps/groups.json.gz'))));
    const pages = pick(templates, groups);
    fs.writeFileSync(pagesFile, `${JSON.stringify(pages, null, 1)}\n`);
    const url = (p) => `https://www.lufthansa.com${p}`;
    fs.writeFileSync(path.join(outDir, 'ch-sweep-ch.txt'), `${pages.flatMap((c) => [c.chen, c.chde]).filter((p) => !captured(p)).map(url).join('\n')}\n`);
    fs.writeFileSync(path.join(outDir, 'ch-sweep-ref.txt'), `${pages.flatMap((c) => [c.en, c.de]).map(url).join('\n')}\n`);
    console.log(`sweep: ${pages.length} pages over ${new Set(pages.map((c) => c.template)).size} page types`);
    process.exit(0);
  }
  const base = opt('base', 'http://localhost:8787');
  const pages = JSON.parse(fs.readFileSync(pagesFile, 'utf8'));
  const rows = [];
  for (const c of pages) {
    for (const lang of ['en', 'de']) {
      const [mk] = ROOTS[lang];
      const p = lang === 'en' ? c.chen : c.chde;
      const ref = lang === 'en' ? c.en : c.de;
      const a = facts(p, 'ch', lang);
      // today's reference where it was captured, else the capture the language document was
      // imported from
      let refDir = null;
      if (captured(ref, REF)) refDir = REF;
      else if (captured(ref)) refDir = PAGES;
      const b = refDir ? facts(ref, 'de', lang, refDir) : null;
      const row = {
        template: c.template, page: p, reference: ref, market: mk, referenceCaptured: refDir ? capturedOn(ref, refDir) : '', captured: capturedOn(p, PAGES),
      };
      if (!a || !b) {
        rows.push({ ...row, status: !a ? 'market page not captured' : 'reference not captured' });
      } else {
        const d = compare(a, b);
        const differs = !d.componentsSame || d.textOnlyHere > 0 || d.textOnlyReference > 0;
        rows.push({
          ...row,
          status: differs ? 'differs' : 'same',
          textShared: d.textShared,
          textOnlyHere: d.textOnlyHere,
          textOnlyReference: d.textOnlyReference,
          componentsSame: d.componentsSame,
          appTextDiffers: d.appTextDiffers,
          examplesHere: d.examplesHere,
          examplesReference: d.examplesReference,
          currencies: d.currencies,
          referenceCurrencies: d.referenceCurrencies,
        });
      }
      rows[rows.length - 1].served = await served(base, p);
      // the baseline: the language page as the replica serves it against the capture it was
      // imported from
      rows[rows.length - 1].languageServed = await served(base, ref);
    }
  }
  fs.writeFileSync(path.join(outDir, 'ch-sweep.json'), `${JSON.stringify(rows, null, 1)}\n`);
  const differs = rows.filter((r) => r.status === 'differs');
  const lines = [
    '# ch sweep: www\'s ch pages against their language version', '',
    `${new Date().toISOString().slice(0, 10)}. ${pages.length} pages over ${new Set(pages.map((c) => c.template)).size} page types, in ch/en and ch/de: ${rows.length} market pages. www's ch page against www's de/en or de/de page captured the same day (authored text with codes, currencies and numbers masked; components). ${differs.length} differ, ${rows.filter((r) => r.status === 'same').length} are the same, ${rows.filter((r) => /not captured/.test(r.status)).length} not compared.`, '',
    'lh-edge column: what the local runtime against the preview origin answers for the ch page, against www\'s ch capture: the H1 and the share of www\'s headings (h1-h3, masked) the answer has, next to the same share for the language page as the replica serves it against the capture it was imported from (the share is low on both where www renders headings from apps and teasers the documents load later).', '',
    '| Type | Market page (captured) | Against (captured) | www ch vs language | lh-edge answers (preview origin) |', '| --- | --- | --- | --- | --- |',
    ...rows.map((r) => {
      const what = r.status === 'differs'
        ? `differs: text ${r.textShared} shared, ${r.textOnlyHere} only ch, ${r.textOnlyReference} only ${r.reference.slice(1, 6)}${r.componentsSame ? '' : ', components differ'}`
        : r.status;
      const s = r.served;
      const l = r.languageServed;
      const h1 = !s.wwwHeadings ? 'not captured' : `H1 ${s.h1[0] === s.h1[1] ? 'same' : `"${s.h1[0]}" / www "${s.h1[1]}"`}, www's headings ${s.headingsFound}% (the language page: ${l.headingsFound ?? '-'}%)`;
      return `| ${r.template} | ${r.page} (${r.captured || '-'}) | ${r.reference} (${r.referenceCaptured || '-'}) | ${what} | ${s.status} ${s.route}, canonical ${s.canonical.endsWith(r.page) ? 'ok' : s.canonical || '-'}; ${h1} |`;
    }), ''];
  fs.writeFileSync(path.join(outDir, 'ch-sweep.md'), lines.join('\n'));
  console.log(`sweep: ${rows.length} market pages, ${differs.length} differ`);
  differs.forEach((r) => console.log(`  ${r.page}: ${r.textOnlyHere} only ch, ${r.textOnlyReference} only ${r.reference}; ch e.g. ${JSON.stringify(r.examplesHere.slice(0, 2))}`));
}
