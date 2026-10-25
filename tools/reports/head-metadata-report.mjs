/* eslint-disable no-console, max-len */
/**
 * Writes tools/reports/head-metadata.md (+ .json): which preview pages were missing which live
 * head values before tools/importer/head-metadata.mjs filled them, and the robots values that
 * were not copied (no "noindex").
 *
 * Inputs (written by the head comparison run): --before <preview heads before>,
 * --after <preview heads after>, --live <live heads>, --result <head-metadata.mjs --report>.
 * Usage: node tools/reports/head-metadata-report.mjs --live live.json --before before.json
 *          --after after.json --result result.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const opt = (n) => argv[argv.indexOf(`--${n}`) + 1];
const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const live = read(opt('live'));
const before = read(opt('before'));
const after = read(opt('after'));
const { results, robotsListed } = read(opt('result'));
const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();

const FIELDS = ['Description', 'og:description', 'og:title', 'Keywords', 'Robots', 'Canonical', 'Image'];
const rows = results.filter((r) => r.changed).map((r) => {
  const l = live[r.path] || {};
  const b = before[r.path] || {};
  const a = after[r.path] || {};
  const check = {
    Description: norm(a.description) === norm(l.description ?? ''),
    'og:description': norm(a['og:description']) === norm(l['og:description'] ?? l.description ?? ''),
    'og:title': norm(a['og:title']) === norm(l['og:title'] || l.title),
    Keywords: norm(a.keywords) === norm(l.keywords),
    Robots: !/noindex/i.test(l.robots || '') || norm(a.robots) === norm(l.robots),
    Canonical: !r.changed.includes('Canonical') || a.canonical === l.canonical,
    Image: true,
  };
  return {
    path: r.path,
    missing: r.changed,
    live: Object.fromEntries(r.changed.map((k) => [k, k === 'Image' ? l['og:image'] : l[k.toLowerCase()] ?? l[k]])),
    before: Object.fromEntries(r.changed.map((k) => [k, k === 'Image' ? b['og:image'] : b[k.toLowerCase()] ?? b[k]])),
    previewOk: r.changed.every((k) => check[k]),
  };
});

const count = Object.fromEntries(FIELDS.map((f) => [f, rows.filter((r) => r.missing.includes(f)).length]));
const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const short = (s, n = 70) => { const t = esc(s); return t.length > n ? `${t.slice(0, n)}…` : t; };
const md = [
  '# Page head metadata: live vs preview',
  '',
  `Generated ${new Date().toISOString()} from the live snapshots (tools/importer/bd-snapshots) and the`,
  `preview heads of ${Object.keys(live).length} scope pages (pages.csv, 4 locales).`,
  'Filled by `tools/importer/head-metadata.mjs` (post-import step), uploaded to DA and previewed.',
  '',
  '## Summary',
  '',
  '| field | pages that were missing it |',
  '| --- | --- |',
  ...FIELDS.map((f) => `| ${f} | ${count[f]} |`),
  `| **pages changed** | **${rows.length}** |`,
  `| preview head matches live after the change | ${rows.filter((r) => r.previewOk).length} of ${rows.length} |`,
  '',
  'Notes:',
  '- Description: where live has no description, an empty row (rendered `content=""`), else EDS',
  '  makes one from the first paragraph (it did, e.g. a video URL on 100-years/cabin-design).',
  '- og:title / og:description rows only where live differs from its title / description.',
  '- Image: the live og:image (sets og:image and twitter:image); the preview serves it from the',
  '  media bus, so the URL differs, the image is the same.',
  '- No hreflang rows. Title, og:title and canonical matched live on every other page.',
  '',
  `## Robots values not copied (${robotsListed.length}: differ from "index,follow,NOODP" without "noindex")`,
  '',
  '| robots on live | pages |',
  '| --- | --- |',
  ...Object.entries(robotsListed.reduce((a, r) => { (a[r.robots] = a[r.robots] || []).push(r.path); return a; }, {}))
    .map(([v, ps]) => `| \`${esc(v)}\` | ${ps.length}: ${ps.join(', ')} |`),
  '',
  '"no index, no follow" is not a valid robots directive (crawlers ignore it), so these pages are',
  'indexable on live; they keep the site default here as well.',
  '',
  '## Pages',
  '',
  '| page | missing | live value | preview after |',
  '| --- | --- | --- | --- |',
  ...rows.map((r) => `| ${r.path} | ${r.missing.join(', ')} | ${r.missing.map((k) => `${k}: ${short(r.live[k])}`).join('<br>')} | ${r.previewOk ? 'ok' : 'differs'} |`),
  '',
];
fs.writeFileSync(path.join(root, 'tools/reports/head-metadata.md'), md.join('\n'));
fs.writeFileSync(path.join(root, 'tools/reports/head-metadata.json'), `${JSON.stringify({ count, robotsListed, rows }, null, 1)}\n`);
console.log('head-metadata report:', rows.length, 'pages', count, 'preview ok', rows.filter((r) => r.previewOk).length);
