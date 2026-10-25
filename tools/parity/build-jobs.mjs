/* eslint-disable no-console, import/no-extraneous-dependencies -- dev tooling */
/**
 * Builds the parity job list for run-batch.js from the import progress and the live captures.
 *
 * node tools/parity/build-jobs.mjs [--out tools/parity/jobs.json] [--cutoff 2026-10-21T18:46:00Z]
 *
 * Pages: every imported page (tools/importer/import-progress.json, status ok) of de/en, de/de,
 * at/de and gb/en (the AirCore pages under /lhg/ left the scope on 2026-10-25).
 * Order (field "priority", lower first):
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
 *   contentWidth: {width: px}, srcCrop?: {width: {top?, right?}} } where contentWidth is the
 * layout width of the live screenshot. The live browser showed a classic 15 px scrollbar, so a
 * "1440" capture is usually 1425 px of layout; capture.js reproduces that layout width (see
 * --content-width there).
 * Scrollbar strip: some live screenshots are as wide as the viewport but end in a 15 px strip
 * where the scrollbar was (blank on every row, even where the navy header or a full-bleed image
 * reaches the edge of the layout): the layout was 15 px narrower. scrollbarStrip() looks for it in
 * every screenshot as wide as its viewport (cached in tools/parity/strip-cache.json by file, size
 * and mtime); such a width gets contentWidth = image width - 15 and srcCrop.right = 15, and
 * compare.js (--crop-a, passed on by run-batch.js) cuts the strip off the live image before
 * diffing.
 * Geo banner: the AirCore AT/GB pages captured from a German IP show the "wrong geolocation"
 * banner ("Sie sind in Deutschland ... [Land wechseln] [Auf Seite bleiben]") above the header
 * (98 px at 1440, about 190 / 238 px at 768 / 390); the importer drops it, so the replica starts
 * with the header. Pages whose cleaned.html has .wrong-geolocation-banner get srcCrop.top = the
 * height of the banner, measured in each screenshot as the first row of the navy header
 * (geoBannerTop(), cached in strip-cache.json under "banner:{file}").
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

// app shells (login, profile) are built outside this migration; Ben adds them to the jobs himself
// the AirCore pages (/lhg/) left the replica on 2026-10-25
const EXCLUDED = /^\/(?:[a-z]{2}\/[a-z]{2}\/(login|profile)(\/|$)|lhg(\/|$))/;

const skipped = [];
const candidates = [];
for (const [url, entry] of Object.entries(progress)) {
  const pagePath = new URL(url).pathname.replace(/\/+$/, '');
  if (EXCLUDED.test(pagePath)) continue; // eslint-disable-line no-continue
  // AirCore pages live under /lhg/{country}/{lang}/...; they belong to that locale
  // market-only pages www serves under /content/lh/markets/{country}/{lang}/... (LoungeNet)
  const segs = pagePath.replace(/^\/content\/lh\/markets(?=\/)/, '').split('/').slice(1);
  const locale = (segs[0] === 'lhg' ? segs.slice(1, 3) : segs.slice(0, 2)).join('/');
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

// ---- scrollbar strip ----
const STRIP = 15;
const stripCacheFile = path.join(ROOT, 'tools/parity/strip-cache.json');
const stripCache = readJson(stripCacheFile, {});

/**
 * Looks for the scrollbar strip in a live screenshot of the viewport width `nominal` (one that is
 * narrower was clipped to the layout already). Reads the luma of the right STRIP + 2 columns:
 * the strip is "blank" in a row when the columns from the first 8 px (JPEG block) boundary inside
 * it to the edge are within 24 of their median (the page background). Decided by the navy header
 * when there is one (the first run of rows starting in the top 200 px whose two columns left of
 * the strip are dark, 8 rows trimmed at each end): strip when >= 90 % of them are blank there
 * (the header ends 15 px before the edge). Full-bleed 100vw images can still paint under the
 * strip, so other rows only decide without a header: strip when >= 98 % of all rows are blank
 * there and >= 75 % of the rows whose layout ends in non-background (footer, images) are.
 */
async function scrollbarStrip(file0, nominal) {
  const file = path.join(ROOT, file0);
  const st = fs.statSync(file);
  const key = `v3:${st.size}:${Math.round(st.mtimeMs)}`; // bump v when the rule changes
  if (stripCache[file0] && stripCache[file0].key === key) return stripCache[file0];
  const { width: iw, height } = await sharp(file).metadata();
  if (iw !== nominal) {
    stripCache[file0] = {
      key, width: iw, strip: 0, why: 'narrower than the viewport',
    };
    return stripCache[file0];
  }
  const w = STRIP + 2;
  const { data } = await sharp(file, { sequentialRead: true })
    .extract({
      left: iw - w, top: 0, width: w, height,
    })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const luma = (x, y) => {
    const i = (y * w + x) * 3;
    return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  };
  const x0 = Math.ceil((iw - STRIP + 1) / 8) * 8 - (iw - w); // first block boundary in the strip
  const sample = [];
  for (let y = 0; y < height; y += 1) sample.push(luma(w - 1, y));
  const med = sample.sort((a, b) => a - b)[Math.floor(height / 2)];
  const near = (v) => Math.abs(v - med) <= 24;
  let uniform = 0;
  let edge = 0;
  let edgeUniform = 0;
  const blank = [];
  for (let y = 0; y < height; y += 1) {
    let ok = true;
    for (let x = x0; x < w && ok; x += 1) ok = near(luma(x, y));
    blank.push(ok);
    if (ok) uniform += 1;
    if (!near(luma(0, y))) {
      edge += 1;
      if (ok) edgeUniform += 1;
    }
  }
  // the header: the first run of dark rows starting in the top 200 px, without 8 rows at each
  // end (JPEG ringing)
  const dark = (y) => luma(0, y) < 60 && luma(1, y) < 60;
  let h0 = 0;
  while (h0 < Math.min(200, height) && !dark(h0)) h0 += 1;
  let h1 = h0;
  while (h1 < height && dark(h1)) h1 += 1;
  let header = 0;
  let headerUniform = 0;
  for (let y = h0 + 8; y < h1 - 8; y += 1) {
    header += 1;
    if (blank[y]) headerUniform += 1;
  }
  const r = (n) => Math.round(n * 1000) / 1000;
  const res = {
    key,
    width: iw,
    uniform: r(uniform / height),
    edge: r(edge / height),
    edgeUniform: edge ? r(edgeUniform / edge) : 0,
    headerRows: header,
    headerUniform: header ? r(headerUniform / header) : 0,
  };
  const found = header >= 10 ? res.headerUniform >= 0.9
    : res.uniform >= 0.98 && res.edge >= 0.01 && res.edgeUniform >= 0.75;
  res.strip = found ? STRIP : 0;
  stripCache[file0] = res;
  return res;
}

// ---- geo banner (AirCore AT/GB captures from a German IP) ----
const hasGeoBanner = (pagePath) => {
  try {
    return fs.readFileSync(path.join(pagesDir, pagePath, 'cleaned.html'), 'utf8').includes('wrong-geolocation-banner');
  } catch (e) {
    return false;
  }
};

/**
 * Height of the geo banner above the navy header in a live screenshot: the first row in the top
 * 400 px where the 4 leftmost columns are navy (luma < 60) for at least 40 rows, with light
 * (banner background) rows above it; 0 when the screenshot starts with the header or has no such
 * band (the banner was closed).
 */
async function geoBannerTop(file0) {
  const file = path.join(ROOT, file0);
  const st = fs.statSync(file);
  const cacheKey = `banner:${file0}`;
  const key = `v1:${st.size}:${Math.round(st.mtimeMs)}`; // bump v when the rule changes
  if (stripCache[cacheKey] && stripCache[cacheKey].key === key) return stripCache[cacheKey].top;
  const { height } = await sharp(file).metadata();
  const h = Math.min(height, 460);
  const w = 4;
  const { data } = await sharp(file)
    .extract({
      left: 0, top: 0, width: w, height: h,
    })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const luma = (x, y) => {
    const i = (y * w + x) * 3;
    return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  };
  const navy = (y) => [0, 1, 2, 3].every((x) => luma(x, y) < 60);
  const light = (y) => [0, 1, 2, 3].every((x) => luma(x, y) > 200);
  let top = 0;
  // from row 1 (row 0 navy: the header is at the top already)
  for (let y = 1; !navy(0) && y < Math.min(400, h - 40); y += 1) {
    if (navy(y) && !navy(y - 1)) {
      let run = 0;
      while (run < 40 && navy(y + run)) run += 1;
      let above = 0;
      for (let k = 0; k < y; k += 1) if (light(k)) above += 1;
      if (run >= 40 && above >= 0.9 * y) {
        top = y;
        break;
      }
    }
  }
  stripCache[cacheKey] = { key, top };
  return top;
}

// layout width of every live screenshot (image width minus a scrollbar strip)
// one file at a time: sharp reads the whole height of every screenshot
await candidates.reduce((prev, job) => prev.then(() => {
  job.contentWidth = {};
  job.geoBanner = hasGeoBanner(job.path);
  return job.widths.reduce((p, w) => p.then(async () => {
    const { width, strip } = await scrollbarStrip(job.srcPng[w], w);
    job.contentWidth[w] = width - strip;
    const top = job.geoBanner ? await geoBannerTop(job.srcPng[w]) : 0;
    if (strip || top) {
      job.srcCrop = job.srcCrop || {};
      job.srcCrop[w] = { ...(top ? { top } : {}), ...(strip ? { right: strip } : {}) };
    }
  }), Promise.resolve());
}), Promise.resolve());
fs.writeFileSync(stripCacheFile, `${JSON.stringify(stripCache, null, 1)}\n`);

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
    ...(job.srcCrop ? { srcCrop: job.srcCrop } : {}),
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
console.log('scrollbar strip cropped:', count(items.filter((it) => it.srcCrop && it.srcCrop[it.width]), (it) => `${it.width} ${path.extname(it.srcPng[it.width]).slice(1)}`));
console.log('geo banner cropped (top):', count(items.filter((it) => it.srcCrop && it.srcCrop[it.width] && it.srcCrop[it.width].top), (it) => `${it.width} top=${it.srcCrop[it.width].top}`));
const unmeasured = candidates.filter((j) => j.geoBanner
  && j.widths.some((w) => !(j.srcCrop && j.srcCrop[w] && j.srcCrop[w].top)));
if (unmeasured.length) console.log(`geo banner page without a measured banner: ${unmeasured.map((j) => j.path).join(', ')}`);
if (nonNominal.length) console.log(`${nonNominal.length} page-widths have an unusual live width (viewport adjusted at capture)`);
console.log(`skipped: ${skipped.length} -> ${rel(skippedFile)}`);
skipped.forEach((s) => console.log(`  ${s.path} (${s.template}): ${s.reason}`));
