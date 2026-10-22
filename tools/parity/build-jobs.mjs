/* eslint-disable no-console, import/no-extraneous-dependencies -- dev tooling */
/**
 * Builds the parity job list for run-batch.js from the import progress and the live captures.
 *
 * node tools/parity/build-jobs.mjs [--out tools/parity/jobs.json] [--cutoff 2026-10-21T18:46:00Z]
 *
 * Pages: every imported page (tools/importer/import-progress.json, status ok) of de/en, de/de,
 * at/de and gb/en. Order (field "priority", lower first):
 *   0 market homepages
 *   1 first page of every template group in de/en and de/de (covers all templates early)
 *   2 two pages per template group in at/de and gb/en
 *   3 all other de/en and de/de pages
 *   4 all other at/de and gb/en pages
 * Source screenshots: tools/source-export/pages/{path}/screenshot.{jpg|png} (1440),
 * screenshot-768.*, screenshot-390.*; only captures with metadata.json timestamp >= cutoff are
 * faithful (cookie dialog dismissed). Widths per page = metadata.json "screenshots" that have a
 * file. Pages without a faithful capture are skipped and listed in <out without .json>.skipped.json.
 *
 * Each job: { id, path, locale, template, priority, edsUrl, widths, srcPng: {width: file},
 *   contentWidth: {width: px} } where contentWidth is the width of the live screenshot. The live
 * browser showed a classic 15 px scrollbar, so a "1440" capture is usually 1425 px of layout;
 * capture.js reproduces that layout width (see --content-width there).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const EDS_ORIGIN = 'https://main--lh-com--moved-permanently.aem.page';
const WIDTHS = [1440, 768, 390];
const PRIMARY = ['de/en', 'de/de'];
const SECONDARY = ['at/de', 'gb/en'];
const PER_TEMPLATE_SECONDARY = 2;

const { values: args } = parseArgs({
  options: {
    out: { type: 'string', default: path.join(ROOT, 'tools/parity/jobs.json') },
    cutoff: { type: 'string', default: '2026-10-21T18:46:00Z' },
  },
});
const cutoff = Date.parse(args.cutoff);
const outFile = path.resolve(args.out);
const skippedFile = outFile.replace(/\.json$/, '') + '.skipped.json';

const readJson = (file, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return fallback;
  }
};
const rel = (file) => path.relative(ROOT, file);

const progress = readJson(path.join(ROOT, 'tools/importer/import-progress.json'), {});
const session = readJson(path.join(ROOT, 'tools/source-export/bd-session-state.json'), {}).pages || {};
const pagesDir = path.join(ROOT, 'tools/source-export/pages');

/** The screenshot file of one width, or null; .jpg and .png both exist only after a re-capture. */
function shotFile(dir, width) {
  const base = width === 1440 ? 'screenshot' : `screenshot-${width}`;
  const found = ['jpg', 'png'].map((ext) => path.join(dir, `${base}.${ext}`)).filter((f) => fs.existsSync(f));
  if (!found.length) return null;
  return found.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
}

const skipped = [];
const candidates = [];
for (const [url, entry] of Object.entries(progress)) {
  const pagePath = new URL(url).pathname.replace(/\/+$/, '');
  const locale = pagePath.split('/').slice(1, 3).join('/');
  if (entry.status === 'ok' && [...PRIMARY, ...SECONDARY].includes(locale)) {
    const dir = path.join(pagesDir, pagePath);
    const meta = readJson(path.join(dir, 'metadata.json'), null);
    const state = session[url];
    const at = meta && Date.parse(meta.timestamp);
    let reason = null;
    if (!meta) reason = state ? `no metadata.json (capture state ${state.status})` : 'never captured (no metadata.json, not in bd-session-state)';
    else if (!(at >= cutoff)) reason = `capture not faithful (timestamp ${meta.timestamp} < ${args.cutoff})`;
    else if (state && state.status !== 'ok') reason = `capture state ${state.status}`;
    const widths = [];
    const srcPng = {};
    if (!reason) {
      const listed = Array.isArray(meta.screenshots) ? meta.screenshots.map(Number) : WIDTHS;
      WIDTHS.filter((w) => listed.includes(w)).forEach((w) => {
        const f = shotFile(dir, w);
        if (f) {
          widths.push(w);
          srcPng[w] = rel(f);
        }
      });
      if (!widths.length) reason = 'no screenshot file';
    }
    if (reason) {
      skipped.push({
        path: pagePath, locale, template: entry.template, reason,
      });
    } else {
      candidates.push({
        id: pagePath.slice(1), path: pagePath, locale, template: entry.template, widths, srcPng,
      });
    }
  }
}

// layout width of every live screenshot (header read only)
await Promise.all(candidates.map(async (job) => {
  job.contentWidth = {};
  await Promise.all(job.widths.map(async (w) => {
    const { width } = await sharp(path.join(ROOT, job.srcPng[w])).metadata();
    job.contentWidth[w] = width;
  }));
}));

// ---- priorities ----
const isHome = (job) => job.template === 'homepage' || /\/homepage$/.test(job.path);
const firstOfTemplate = new Set();
const perTemplate = {};
candidates.forEach((job) => {
  if (isHome(job)) {
    job.priority = 0;
    return;
  }
  const key = `${job.locale}|${job.template}`;
  perTemplate[key] = (perTemplate[key] || 0) + 1;
  if (PRIMARY.includes(job.locale)) {
    if (!firstOfTemplate.has(key)) {
      firstOfTemplate.add(key);
      job.priority = 1;
    } else {
      job.priority = 3;
    }
  } else {
    job.priority = perTemplate[key] <= PER_TEMPLATE_SECONDARY ? 2 : 4;
  }
});
const localeOrder = [...PRIMARY, ...SECONDARY];
const jobs = candidates
  .map((job, i) => ({ job, i }))
  .sort((a, b) => a.job.priority - b.job.priority
    || (a.job.priority === 0 ? localeOrder.indexOf(a.job.locale) - localeOrder.indexOf(b.job.locale) : 0)
    || a.i - b.i)
  .map(({ job }) => ({
    id: job.id,
    path: job.path,
    locale: job.locale,
    template: job.template,
    priority: job.priority,
    edsUrl: `${EDS_ORIGIN}${job.path}`,
    widths: job.widths,
    srcPng: job.srcPng,
    contentWidth: job.contentWidth,
  }));

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, `${JSON.stringify(jobs, null, 2)}\n`);
fs.writeFileSync(skippedFile, `${JSON.stringify(skipped, null, 2)}\n`);

// ---- summary ----
const count = (list, key) => list.reduce((acc, x) => ({ ...acc, [key(x)]: (acc[key(x)] || 0) + 1 }), {});
const items = jobs.flatMap((j) => j.widths.map((w) => ({ ...j, width: w })));
const nonNominal = items.filter((it) => it.contentWidth[it.width] !== it.width - 15
  && it.contentWidth[it.width] !== it.width);
console.log(`jobs: ${jobs.length} pages, ${items.length} page-widths -> ${rel(outFile)}`);
console.log('pages by locale:', count(jobs, (j) => j.locale));
console.log('page-widths by locale@width:', count(items, (it) => `${it.locale}@${it.width}`));
console.log('pages by priority:', count(jobs, (j) => j.priority));
console.log('live content widths:', count(items, (it) => `${it.width}->${it.contentWidth[it.width]}`));
if (nonNominal.length) console.log(`${nonNominal.length} page-widths have an unusual live width (viewport adjusted at capture)`);
console.log(`skipped: ${skipped.length} -> ${rel(skippedFile)}`);
skipped.forEach((s) => console.log(`  ${s.path} (${s.template}): ${s.reason}`));
