/* eslint-disable no-console, max-len, no-nested-ternary, import/extensions -- tooling */
/**
 * Writes content-sites/lh-cargo/plan.md, Lufthansa Cargo's page list and batch plan (lh-cargo),
 * from the delivery (content-sites/lh-cargo/delivery: urls-all.tsv, batch-01.txt, batches/,
 * manifest.json) and tools/importer/cargo-paths.mjs (the Edge Delivery paths), and the batch
 * lists content-sites/lh-cargo/batches/batch-NN.txt (source URLs, one per line).
 *
 * Usage: node tools/importer/cargo-plan.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  scopePages, sourcePath, REDIRECT_ONLY, redirectRows, EXTRA_URLS,
} from './cargo-paths.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const W = path.join(root, 'content-sites/lh-cargo');
const D = path.join(W, 'delivery');
const lines = (f) => fs.readFileSync(f, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

const { pages, rows } = scopePages(path.join(D, 'urls-all.tsv'));
const edsOf = Object.fromEntries(pages.map((p) => [p.source, p.eds]));
const manifest = JSON.parse(fs.readFileSync(path.join(D, 'manifest.json'), 'utf8'));
const snapped = new Set(manifest.filter((r) => r.file).map((r) => sourcePath(r.url)));

// batches: 1 = the delivered snapshots; 2-4 = the delivery's page batches (en pages, de pages);
// then the articles (one template) in batches of about 100: en (the added stories first, then the
// delivery's order: newest lastmod first), de
const delivered = fs.readdirSync(path.join(D, 'batches')).filter((f) => /^batch-\d+\.txt$/.test(f)).sort()
  .map((f) => lines(path.join(D, 'batches', f)));
const isArticleUrl = (u) => /^\/[a-z]{2}\/-\//.test(sourcePath(u));
const pageBatches = delivered.map((urls) => urls.filter((u) => !isArticleUrl(u))).filter((b) => b.length);
const extra = pages.filter((p) => p.row.reason && /taken into scope/.test(p.row.reason)).map((p) => p.row.url);
const articleUrls = [...extra, ...delivered.flat().filter(isArticleUrl)];
const chunk = (list, size) => {
  const n = Math.max(1, Math.round(list.length / size));
  const per = Math.ceil(list.length / n);
  return Array.from({ length: n }, (_, i) => list.slice(i * per, (i + 1) * per)).filter((b) => b.length);
};
const batches = [{ n: 1, urls: lines(path.join(D, 'batch-01.txt')) }];
[...pageBatches, ...chunk(articleUrls.filter((u) => sourcePath(u).startsWith('/en/')), 100), ...chunk(articleUrls.filter((u) => sourcePath(u).startsWith('/de/')), 100)]
  .forEach((urls, i) => batches.push({ n: i + 2, urls }));
const batchOf = {};
batches.forEach((b) => b.urls.forEach((u) => { batchOf[sourcePath(u)] ||= b.n; }));
fs.mkdirSync(path.join(W, 'batches'), { recursive: true });
fs.readdirSync(path.join(W, 'batches')).filter((f) => /^batch-\d+\.txt$/.test(f)).forEach((f) => fs.unlinkSync(path.join(W, 'batches', f)));
batches.forEach((b) => fs.writeFileSync(path.join(W, 'batches', `batch-${String(b.n).padStart(2, '0')}.txt`), `${b.urls.join('\n')}\n`));

const count = (list, f) => list.reduce((a, r) => { const k = f(r); a[k] = (a[k] || 0) + 1; return a; }, {});
const sections = [...new Set(rows.map((r) => r.section))];
const all = [path.join(D, 'urls-all.tsv'), EXTRA_URLS].flatMap((f) => fs.readFileSync(f, 'utf8').split(/\r?\n/).filter(Boolean).slice(1))
  .map((l) => {
    const [url, language, alternate, source, lastmod, inOut, reason, section] = l.split('\t');
    return {
      url, language, alternate, source, lastmod, inOut, reason, section, path: sourcePath(url),
    };
  });
const enDe = all.filter((r) => ['en', 'de'].includes(r.language));
const others = all.filter((r) => !['en', 'de'].includes(r.language));
const pagesByLang = count(pages, (p) => p.lang);
const articles = pages.filter((p) => /^\/[a-z]{2}\/news\//.test(p.eds));
const moved = pages.filter((p) => p.source !== p.eds && !/^\/[a-z]{2}\/news\//.test(p.eds));
const redirects = redirectRows(pages);

const out = [];
out.push('# Lufthansa Cargo (lh-cargo): page list, scope and batches', '');
out.push(`Written by \`tools/importer/cargo-plan.mjs\` on ${new Date().toISOString().slice(0, 10)} from the delivery of 2026-10-30 (\`delivery/urls-all.tsv\`, read on the source one request at a time) and \`tools/importer/cargo-paths.mjs\` (the paths). Source: www.lufthansa-cargo.com (Liferay DXP behind Cloudflare). DA site: \`moved-permanently/lh-cargo\`, preview https://main--lh-cargo--moved-permanently.aem.page. Nothing is published from this connection.`, '');
out.push('## Counts', '');
out.push(`- URLs in the list: **${all.length}** (en and de ${enDe.length}, other languages ${others.length}: ${Object.entries(count(others, (r) => r.language)).map(([k, v]) => `${k} ${v}`).join(', ')}, all out).`);
out.push(`- In: ${enDe.filter((r) => r.inOut === 'in').length} rows, of which ${Object.keys(REDIRECT_ONLY).length} are redirects only (${Object.keys(REDIRECT_ONLY).map((p) => `\`${p}\``).join(', ')}): **${pages.length} pages to import, ${pagesByLang.en} en and ${pagesByLang.de} de**; ${articles.length} of them articles (${count(articles, (p) => p.lang).en} en, ${count(articles, (p) => p.lang).de} de).`);
out.push(`- Out: ${enDe.filter((r) => r.inOut === 'out').length} en/de rows (en ${count(enDe.filter((r) => r.inOut === 'out'), (r) => r.language).en}, de ${count(enDe.filter((r) => r.inOut === 'out'), (r) => r.language).de}) plus the ${others.length} other-language URLs. They stay links to the live site.`);
out.push(`- Batch 1: ${batches[0].urls.length} URLs, ${snapped.size} snapshots delivered (the other ${batches[0].urls.length - snapped.size}: redirects or out, see below). Batches 2-${batches[batches.length - 1].n}: ${batches.slice(1).reduce((a, b) => a + b.urls.length, 0)} pages. Together ${snapped.size + batches.slice(1).reduce((a, b) => a + b.urls.length, 0)} = the ${pages.length} pages.`, '');

out.push('| section | en in | en out | de in | de out |', '| --- | --- | --- | --- | --- |');
sections.forEach((s) => {
  const c = (l, io) => enDe.filter((r) => r.section === s && r.language === l && r.inOut === io).length;
  out.push(`| ${s} | ${c('en', 'in')} | ${c('en', 'out')} | ${c('de', 'in')} | ${c('de', 'out')} |`);
});
out.push('');

out.push('## URL shape', '');
out.push('- Cargo\'s paths stay as on the source: `/en/...` and `/de/...` (e.g. `/en/portfolio`, `/de/industrien-automobil`, `/de/network/flugplan`). The homepage documents are `/en/home` and `/de/home`; `/`, `/en`, `/en/`, `/de`, `/de/` and `/home` redirect to them.');
out.push(`- Articles (\`/<lang>/-/<url title>\`) become \`/<lang>/news/<slug>\` (the source has no \`/news\` path). Slug: the url title decoded, a leading \`de/\` dropped, ä ö ü ß as ae oe ue ss, every other run of characters outside a-z 0-9 one hyphen, none at either end; a clash gets \`-2\` (\`/en/-/ver-di-trade-union-strike-\` -> \`/en/news/ver-di-trade-union-strike-2\`). Other pages whose path changes: ${moved.length}.`);
out.push(`- lh-cargo's \`/redirects\` sheet lists every old path with its new one: ${redirects.length} rows (${articles.length} articles, the ${Object.keys(REDIRECT_ONLY).length} source redirects, \`/\`, \`/en\`, \`/de\` and the language-less footer and logo addresses of the source: \`/home\`, \`/footer/bottomnav/imprint\`, \`/data-protection\`, \`/footer/bottomnav/terms-of-use\`, \`/meta/meta/company/general-terms\` -> the English page).`);
out.push('- Footer links without a language on the source point at the language\'s page in our footer documents (`/en/footer` -> `/en/data-protection`, `/de/footer` -> `/de/datenschutz`).');
out.push('- Links to pages out of scope (portal, sign-in, forms, other languages) stay absolute links to www.lufthansa-cargo.com.', '');

out.push('## Out of scope (links to the live site)', '');
out.push('Everything behind sign-in and the eServices portal (sign-in, registration, dashboards, eBooking, eTracking, eAWB, AWB stock, DGR booking, schedule and station tools, profile, submissions, templates, notifications), survey and utility pages, and every form (forms stay links to the source page: the contact form of support and contact, newsletter and event registrations). Reasons per URL in the page list below:', '');
Object.entries(count(enDe.filter((r) => r.inOut === 'out'), (r) => r.reason)).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => out.push(`- ${v}: ${k}`));
out.push('');

out.push('## Batches', '');
out.push('Pages about 40 per batch (en pages, then de pages); articles (one template) about 100 per batch: en (the stories added from the story hubs first, then newest lastmod first), then de. Lists: `content-sites/lh-cargo/batches/batch-NN.txt`; one line per batch in `runs/` when it is previewed.', '');
out.push('| batch | pages | en | de | content |', '| --- | --- | --- | --- | --- |');
batches.forEach((b) => {
  const ps = b.urls.map(sourcePath);
  const inPages = ps.filter((p) => edsOf[p]);
  const lang = count(inPages, (p) => p.slice(1, 3));
  const art = inPages.filter((p) => /^\/[a-z]{2}\/-\//.test(p)).length;
  const what = b.n === 1 ? `homepages, nav and footer targets, one page of each type (${b.urls.length} URLs, ${snapped.size} snapshots)` : (art === inPages.length ? 'articles' : (art ? 'pages and articles' : 'pages'));
  out.push(`| ${b.n} | ${b.n === 1 ? snapped.size : inPages.length} | ${b.n === 1 ? [...snapped].filter((p) => p.startsWith('/en/')).length : lang.en || 0} | ${b.n === 1 ? [...snapped].filter((p) => p.startsWith('/de/')).length : lang.de || 0} | ${what} |`);
});
out.push('');

out.push('## Page list', '');
out.push('Every URL of the source list: source path, language, in or out, the Edge Delivery path (in) and the batch, the reason.', '');
out.push('| source path | lang | in/out | Edge Delivery path | batch | reason |', '| --- | --- | --- | --- | --- | --- |');
all.forEach((r) => {
  const eds = r.inOut === 'in' ? (REDIRECT_ONLY[r.path] ? `redirect -> ${REDIRECT_ONLY[r.path]}` : edsOf[r.path]) : '';
  out.push(`| \`${r.path}\` | ${r.language} | ${r.inOut} | ${eds ? `\`${eds}\`` : ''} | ${r.inOut === 'in' && !REDIRECT_ONLY[r.path] ? batchOf[r.path] || '' : ''} | ${r.reason.replace(/\|/g, '/')} |`);
});
fs.writeFileSync(path.join(W, 'plan.md'), `${out.join('\n')}\n`);
console.log(`plan.md: ${all.length} URLs, ${pages.length} pages (${pagesByLang.en} en, ${pagesByLang.de} de), ${batches.length} batches, ${redirects.length} redirects`);
