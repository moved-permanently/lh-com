/* eslint-disable no-console, max-len, import/extensions -- tooling */
/**
 * Writes content-sites/lh-airdolomiti/plan.md, Air Dolomiti's page list and batch plan
 * (lh-airdolomiti), from the delivery (content-sites/lh-airdolomiti/delivery: groundwork.md,
 * urls-it|en|de.tsv, batches.tsv) and tools/importer/airdolomiti-paths.mjs (the paths), and the
 * batch lists content-sites/lh-airdolomiti/batches/batch-NN.txt (source URLs, one per line):
 * Italian 01-09 and English 10-24 as delivered, then German 25.. in batches of about 40 (the
 * English order: pages, services, airports, routes, destinations, posts).
 *
 * Usage: node tools/importer/airdolomiti-plan.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  allRows, edsPath, docOf, sourceKey, targetOf, HOSTS,
} from './airdolomiti-paths.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const W = path.join(root, 'content-sites/lh-airdolomiti');
const D = path.join(W, 'delivery');
const rows = allRows(D);
const count = (list, f) => list.reduce((a, r) => { const k = f(r); a[k] = (a[k] || 0) + 1; return a; }, {});

// batches: the delivery's (it 01-09, en 10-24), then German of about 40, in the English order
const delivered = fs.readFileSync(path.join(D, 'batches.tsv'), 'utf8').split(/\r?\n/).slice(1).filter(Boolean)
  .map((l) => l.split('\t'))
  .map(([batch, lang, url, type]) => ({
    batch: Number(batch), lang, url, type,
  }));
const batches = new Map();
delivered.forEach((r) => batches.set(r.batch, [...(batches.get(r.batch) || []), r.url]));
const TYPE_ORDER = ['home', 'pages', 'corporate', 'contacts', 'support-and-contacts', 'do-you-need-help', 'legal-info', 'services', 'services-on-board', 'travel-info', 'extra-services', 'promotions', 'baggage', 'faq', 'travel-tips', 'airports', 'routes', 'destinations', 'posts'];
const rank = (t) => { const i = TYPE_ORDER.indexOf(t); return i < 0 ? TYPE_ORDER.length - 1 : i; };
const de = rows.filter((r) => r.lang === 'de' && r.decision === 'in').sort((a, b) => rank(a.type) - rank(b.type));
const per = Math.ceil(de.length / Math.round(de.length / 40));
let n = Math.max(...batches.keys());
for (let i = 0; i < de.length; i += per) { n += 1; batches.set(n, de.slice(i, i + per).map((r) => r.url)); }
const batchOf = {};
batches.forEach((urls, b) => urls.forEach((u) => { batchOf[sourceKey(u)] ||= b; }));
fs.mkdirSync(path.join(W, 'batches'), { recursive: true });
fs.readdirSync(path.join(W, 'batches')).filter((f) => /^batch-\d+\.txt$/.test(f)).forEach((f) => fs.unlinkSync(path.join(W, 'batches', f)));
batches.forEach((urls, b) => fs.writeFileSync(path.join(W, 'batches', `batch-${String(b).padStart(2, '0')}.txt`), `${urls.join('\n')}\n`));

const inRows = rows.filter((r) => r.decision === 'in');
const out = [];
out.push('# Air Dolomiti (lh-airdolomiti): page list, scope and batches', '');
out.push(`Written by \`tools/importer/airdolomiti-plan.mjs\` on ${new Date().toISOString().slice(0, 10)} from the delivery of 2026-10-30 (\`delivery/\`: groundwork.md, urls-it|en|de.tsv, batches.tsv; read by curl, one request at a time, no challenge) and \`tools/importer/airdolomiti-paths.mjs\` (the paths). Source: www.airdolomiti.it (Italian), www.airdolomiti.eu (English), www.airdolomiti.de (German); Next.js over WordPress (the page's blocks in __NEXT_DATA__). DA site \`moved-permanently/lh-airdolomiti\`, preview https://main--lh-airdolomiti--moved-permanently.aem.page, live https://airdolomiti.turnsthe.page. Nothing is published from this connection.`, '');

out.push('## Counts', '');
out.push('| | Italian | English | German |', '| --- | --- | --- | --- |');
['in', 'out', 'drop', 'alias', 'redirect'].forEach((d) => {
  const c = count(rows.filter((r) => r.decision === d), (r) => r.lang);
  out.push(`| ${d === 'in' ? '**in (import)**' : d} | ${c.it || 0} | ${c.en || 0} | ${c.de || 0} |`);
});
out.push(`| URLs in the lists | ${count(rows, (r) => r.lang).it} | ${count(rows, (r) => r.lang).en} | ${count(rows, (r) => r.lang).de} |`, '');
out.push(`**${inRows.length} pages to import**: ${count(inRows, (r) => r.lang).it} Italian, ${count(inRows, (r) => r.lang).en} English, ${count(inRows, (r) => r.lang).de} German. English and German are imported from their own domains (about 300 pages each have no Italian counterpart), not translated.`, '');
out.push('Pages to import by type:', '', '| type | IT | EN | DE |', '| --- | --- | --- | --- |');
const types = [...new Set(inRows.map((r) => r.type))].sort((a, b) => rank(a) - rank(b));
types.forEach((t) => {
  const c = count(inRows.filter((r) => r.type === t), (r) => r.lang);
  out.push(`| ${t} | ${c.it || 0} | ${c.en || 0} | ${c.de || 0} |`);
});
out.push('');

out.push('## URL mapping', '');
out.push('- Italian `www.airdolomiti.it/<path>` -> `/<path>`; English `www.airdolomiti.eu/<path>` -> `/en/<path>`; German `www.airdolomiti.de/<path>` -> `/de/<path>`, path for path (the slugs stay translated: `/tratte`, `/en/routes`, `/de/routen`).');
out.push('- Homepages `/`, `/en/`, `/de/` (documents `/index`, `/en/index`, `/de/index`); the page language from the `language` metadata row (`it`, `en`, `de`), the header switches between the three (scripts/site-languages.js).');
out.push('- Destinations at their real nested paths (`/destinazioni/<city>/<section>/<article>`), not the sitemaps\' flat `/destinazioni/<slug>` (404 on the source; dropped, each names its real page in the list).');
const changed = inRows.filter((r) => edsPath(r.url) !== `${HOSTS[new URL(r.url).host]}${new URL(r.url).pathname.replace(/\/+$/, '')}`);
out.push(`- Paths Edge Delivery can't keep (underscores): ${changed.map((r) => `\`${new URL(r.url).pathname}\` (${r.lang}) -> \`${edsPath(r.url)}\``).join(', ')}; their old address in the redirects.`);
out.push('- Links to pages out of scope (booking, manage booking, flight status, timetable, check-in on lufthansa.com, baggage reports on mybag.aero, live chat, search, newsletter) stay absolute links to the live site of their language.', '');

out.push('## Redirects', '');
const aliasRows = rows.filter((r) => ['alias', 'redirect'].includes(r.decision));
out.push(`The source's aliases and redirects (${aliasRows.length}) and the changed paths (${changed.length}) become rows of lh-airdolomiti's \`/redirects\` sheet (public copy \`tools/importer/airdolomiti-redirects.json\`), each added with the batch that imports its target. The old domains (.eu, .de) are a host matter, not sheet rows: the sheet maps paths on this site.`, '');
out.push('| source | lang | kind | Edge Delivery path | target |', '| --- | --- | --- | --- | --- |');
aliasRows.forEach((r) => {
  const t = targetOf(r);
  out.push(`| \`${edsPath(r.url)}\` | ${r.lang} | ${r.decision} | ${t ? `\`${edsPath(t)}\`` : ''} | ${t || ''} |`);
});
changed.forEach((r) => out.push(`| \`${HOSTS[new URL(r.url).host]}${new URL(r.url).pathname}\` | ${r.lang} | path | \`${edsPath(r.url)}\` | ${r.url} |`));
out.push('');

out.push('## Out of scope (links to the live site)', '');
Object.entries(count(rows.filter((r) => r.decision === 'out'), (r) => r.note || r.type)).forEach(([k, v]) => out.push(`- ${v}: ${k}`));
out.push('', 'Forms (the newsletter block on many pages, the PNR form) become links to the page on the live site; the route pages\' booking box becomes a link; prices typed into page text stay as they are.', '');

out.push('## Batches', '');
out.push('About 40 pages each: Italian first (01-09), then English (10-24), as delivered; German after both (25 and on, in the English order). Lists: `content-sites/lh-airdolomiti/batches/batch-NN.txt`; one line per batch in `runs/` when it is previewed.', '');
out.push('| batch | lang | pages | content |', '| --- | --- | --- | --- |');
const byKey = Object.fromEntries(rows.map((r) => [sourceKey(r.url), r]));
[...batches.keys()].sort((a, b) => a - b).forEach((b) => {
  const urls = batches.get(b);
  const rs = urls.map((u) => byKey[sourceKey(u)]).filter(Boolean);
  const langs = [...new Set(rs.map((r) => r.lang))].join(', ');
  const tc = Object.entries(count(rs, (r) => r.type)).sort((x, y) => y[1] - x[1]).map(([t, c]) => `${t} ${c}`).join(', ');
  out.push(`| ${b} | ${langs} | ${urls.length} | ${tc} |`);
});
out.push('');

out.push('## Page list', '');
out.push('Every URL of the three lists: source, language, type, decision, the Edge Delivery path (in) and the batch, the note.', '');
out.push('| source | lang | type | decision | Edge Delivery path | batch | note |', '| --- | --- | --- | --- | --- | --- | --- |');
rows.forEach((r) => {
  const eds = r.decision === 'in' ? docOf(edsPath(r.url)) : '';
  out.push(`| ${r.url} | ${r.lang} | ${r.type} | ${r.decision} | ${eds ? `\`${edsPath(r.url)}\`` : ''} | ${r.decision === 'in' ? batchOf[sourceKey(r.url)] || '' : ''} | ${(r.note || '').replace(/\|/g, '/').slice(0, 160)} |`);
});
fs.writeFileSync(path.join(W, 'plan.md'), `${out.join('\n')}\n`);
console.log(`plan.md: ${rows.length} URLs, ${inRows.length} pages, ${batches.size} batches, ${aliasRows.length + changed.length} redirect rows planned`);
