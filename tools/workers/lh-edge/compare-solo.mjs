/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, max-len, import/no-dynamic-require, prefer-destructuring -- dev tooling */
/**
 * Compares lh-edge's answers to the app's web view URLs with www's recorded solo pages
 * (tools/source-export/feeds/webviews/www-solo-pages.json): for every entry with status 200 the
 * same URL on the lh-edge host, rendered in a headless browser (one page at a time). Per page:
 * status, title, the similarity of the main text (Dice coefficient of word bigrams), headings
 * missing and extra (text, level ignored), links in <main> that leave the app view (an internal
 * page link without the .solo_continue form) and whether a header, footer, breadcrumb or
 * consent banner is rendered. Entries with status 404 on www must answer 404.
 * Writes tools/reports/lh-edge/compare-solo.json and .md; prints the summary per locale.
 * Usage: node tools/workers/lh-edge/compare-solo.mjs --host https://<lh-edge host> [--only <substring>]
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(root, 'node_modules/playwright-core'));

const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
const HOST = (opt('host', process.env.LH_EDGE_HOST || '') || '').replace(/\/$/, '');
if (!HOST) {
  console.error('usage: compare-solo.mjs --host https://<lh-edge host>');
  process.exit(2);
}
const only = opt('only', '');
// --aliases <csv>: request the alias target instead of the app path (before the alias sheet is
// published; lh-edge then answers the page's own solo URL)
const aliasFile = opt('aliases', '');
const aliases = new Map(aliasFile ? fs.readFileSync(aliasFile, 'utf8').trim().split('\n').slice(1)
  .map((l) => l.split(','))
  .map(([, from, to]) => [from, to]) : []);
// notes of the alias sheet: rows that answer where www answers 404
const aliasNotes = new Map(aliasFile ? fs.readFileSync(aliasFile, 'utf8').trim().split('\n').slice(1)
  .map((l) => l.split(','))
  .map(([, from, , note = '']) => [from, /^404 on www/.test(note) ? 'beyond' : '']) : []);
const SOLO = /(\.solo\.continue\.solo_continue|\.solo_continue\.genapp\.html|\.solo_continue\.html|\.solo\.continue|\.solo_continue)$/;
const requestPath = (p) => {
  const [pathname, query = ''] = p.split('?');
  const m = pathname.match(SOLO);
  if (!m || !aliases.size) return p;
  const app = pathname.slice(0, -m[1].length);
  return aliases.has(app) ? `${aliases.get(app)}${m[1]}${query ? `?${query}` : ''}` : p;
};
const www = JSON.parse(fs.readFileSync(path.join(root, 'tools/source-export/feeds/webviews/www-solo-pages.json'), 'utf8'));
const OUT = path.join(root, 'tools/reports/lh-edge');

const norm = (s) => String(s || '').toLowerCase().replace(/[\u00a0\s]+/g, ' ').replace(/[^\p{L}\p{N} ]/gu, '')
  .trim();
const bigrams = (s) => {
  const w = norm(s).split(' ').filter(Boolean);
  const out = new Map();
  for (let i = 0; i < w.length - 1; i += 1) {
    const k = `${w[i]} ${w[i + 1]}`;
    out.set(k, (out.get(k) || 0) + 1);
  }
  return out;
};
const dice = (a, b) => {
  const A = bigrams(a);
  const B = bigrams(b);
  let inter = 0;
  let total = 0;
  A.forEach((n, k) => { inter += Math.min(n, B.get(k) || 0); total += n; });
  B.forEach((n) => { total += n; });
  return total ? (2 * inter) / total : 1;
};
const headingText = (h) => norm(String(h).replace(/^H[1-6]:\s*/, ''));

const entries = Object.entries(www.pages).filter(([p]) => !only || p.includes(only));
const results = [];
const browser = await chromium.launch({ headless: true });
try {
  for (const [p, ref] of entries) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    page.setDefaultTimeout(15000);
    const r = { path: p, wwwStatus: ref.status };
    try {
      r.requested = requestPath(p);
      const resp = await page.goto(`${HOST}${r.requested}`, { waitUntil: 'load', timeout: 45000 });
      r.status = resp ? resp.status() : 0;
      if (ref.status === 200 && r.status === 200) {
        await page.waitForTimeout(2500);
        const got = await page.evaluate(() => {
          const main = document.querySelector('main');
          const visible = (el) => !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
          const solo = /(\.solo\.continue\.solo_continue|\.solo_continue\.genapp\.html|\.solo_continue\.html|\.solo\.continue|\.solo_continue)$/;
          const leaving = [...(main ? main.querySelectorAll('a[href]') : [])].map((a) => a.href).filter((h) => {
            try {
              const u = new URL(h);
              if (u.origin !== window.location.origin) return false;
              if (/\.(?!html?$)[a-z0-9]{2,5}$/i.test(u.pathname) || /\/logout/.test(u.pathname)) return false;
              return !solo.test(u.pathname);
            } catch (e) { return false; }
          });
          return {
            title: document.title,
            channel: document.documentElement.dataset.channel,
            headings: [...(main ? main.querySelectorAll('h1, h2, h3, h4') : [])].filter(visible).map((h) => `${h.tagName}: ${h.textContent.trim()}`),
            // as www's recording: the text of <main> without scripts and styles (closed panels too)
            text: main ? (() => {
              const c = main.cloneNode(true);
              c.querySelectorAll('script, style, noscript, template').forEach((n) => n.remove());
              return c.textContent;
            })() : '',
            leaving,
            chrome: {
              header: visible(document.querySelector('body > header, header.header-wrapper')),
              footer: visible(document.querySelector('body > footer, footer.footer-wrapper')),
              breadcrumb: visible(document.querySelector('.breadcrumb')),
              consent: visible(document.querySelector('#onetrust-consent-sdk, #onetrust-banner-sdk, .consent, .cookie-banner, .lh-consent')),
            },
          };
        });
        const refHeads = (ref.headings || []).map(headingText).filter(Boolean);
        const ourHeads = got.headings.map(headingText).filter(Boolean);
        Object.assign(r, {
          title: got.title,
          wwwTitle: ref.title,
          channel: got.channel,
          // www's solo page renders its content client-side and the recording has (almost) no
          // text (offers-and-destination: "read more"): no similarity
          wwwWithoutText: norm(ref.text).length < 200,
          similarity: norm(ref.text).length < 200 ? undefined : Number(dice(ref.text, got.text).toFixed(3)),
          missingHeadings: refHeads.filter((h) => !ourHeads.includes(h)),
          extraHeadings: ourHeads.filter((h) => !refHeads.includes(h)),
          leavingLinks: got.leaving,
          chrome: Object.entries(got.chrome).filter(([, v]) => v).map(([k]) => k),
        });
      }
    } catch (e) {
      r.error = e.message.split('\n')[0];
    } finally {
      await page.close();
    }
    // a 404 on www stays 404, except where the alias sheet goes further than www (the five English
    // page names in de/de and at/de that the replica maps to its German page)
    const app = p.split('?')[0].replace(SOLO, '');
    r.beyondWww = r.wwwStatus === 404 && aliasNotes.get(app) === 'beyond';
    const pageOk = r.status === 200 && !r.chrome?.length && !r.leavingLinks?.length;
    r.ok = r.wwwStatus === 404 && !r.beyondWww ? r.status === 404 : pageOk;
    results.push(r);
    console.log(`${r.status ?? '-'} ${r.ok ? 'ok ' : 'NO '} ${p}${r.similarity !== undefined ? ` sim ${r.similarity}` : ''}${r.chrome?.length ? ` chrome ${r.chrome.join(',')}` : ''}${r.leavingLinks?.length ? ` leaving ${r.leavingLinks.length}` : ''}${r.error ? ` ${r.error}` : ''}`);
  }
} finally {
  await browser.close();
}

const localeOf = (p) => p.split('/').slice(1, 3).join('/');
const byLocale = {};
results.forEach((r) => {
  const l = localeOf(r.path);
  byLocale[l] ||= {
    urls: 0, answered: 0, notFoundAsWww: 0, failed: 0, similarity: [], missingHeadings: 0, extraHeadings: 0, leavingLinks: 0, chrome: 0,
  };
  const s = byLocale[l];
  s.urls += 1;
  if (r.wwwStatus === 404 && !r.beyondWww) { if (r.status === 404) s.notFoundAsWww += 1; else s.failed += 1; return; }
  if (r.status === 200) s.answered += 1; else s.failed += 1;
  if (r.similarity !== undefined) s.similarity.push(r.similarity);
  s.missingHeadings += (r.missingHeadings || []).length;
  s.extraHeadings += (r.extraHeadings || []).length;
  s.leavingLinks += (r.leavingLinks || []).length;
  if (r.chrome && r.chrome.length) s.chrome += 1;
});
const summary = Object.fromEntries(Object.entries(byLocale).map(([l, s]) => {
  const sims = [...s.similarity].sort((a, b) => a - b);
  return [l, {
    ...s,
    similarity: undefined,
    medianSimilarity: sims.length ? sims[Math.floor(sims.length / 2)] : null,
    minSimilarity: sims.length ? sims[0] : null,
  }];
}));
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'compare-solo.json'), `${JSON.stringify({
  host: HOST, checkedAt: new Date().toISOString(), summary, results,
}, null, 1)}\n`);
const md = ['# lh-edge solo pages vs www', '', `Host: ${HOST}, ${new Date().toISOString()}. Reference: www's solo pages recorded ${www.recorded}.`, '',
  '| Locale | URLs | 200 | 404 as www | failed | median similarity | min | missing headings | extra headings | links leaving the app view | pages with chrome |',
  '|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|',
  ...Object.entries(summary).map(([l, s]) => `| ${l} | ${s.urls} | ${s.answered} | ${s.notFoundAsWww} | ${s.failed} | ${s.medianSimilarity ?? ''} | ${s.minSimilarity ?? ''} | ${s.missingHeadings} | ${s.extraHeadings} | ${s.leavingLinks} | ${s.chrome} |`),
  '', '## Pages', '', '| URL | status (www) | similarity | missing headings | extra headings | leaving | chrome |', '|---|---|---:|---|---|---:|---|',
  ...results.map((r) => `| ${r.path} | ${r.status ?? r.error} (${r.wwwStatus}) | ${r.similarity ?? ''} | ${(r.missingHeadings || []).join('; ')} | ${(r.extraHeadings || []).join('; ')} | ${(r.leavingLinks || []).length || ''} | ${(r.chrome || []).join(', ')} |`)];
fs.writeFileSync(path.join(OUT, 'compare-solo.md'), `${md.join('\n')}\n`);
Object.entries(summary).forEach(([l, s]) => console.log(`${l}: ${s.urls} URLs, ${s.answered} answered, ${s.notFoundAsWww} 404 as www, ${s.failed} failed, similarity median ${s.medianSimilarity} min ${s.minSimilarity}, headings missing ${s.missingHeadings} extra ${s.extraHeadings}, leaving links ${s.leavingLinks}, chrome on ${s.chrome}`));
