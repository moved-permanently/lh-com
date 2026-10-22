/* eslint-disable no-console */
/**
 * Resumable parity batch runner. Call it repeatedly until it reports everything done.
 *
 * node tools/parity/run-batch.js --list <jobs.json> [--batch 6] [--budget <seconds>]
 *   [--only <regex>] [--state tools/reports/parity/state]
 *   [--shots <state>/../shots] [--timeout 90000] [--max-height 8000] [--no-mask]
 * node tools/parity/run-batch.js --list <jobs.json> --reset <regex>      (no browser)
 * node tools/parity/run-batch.js --list <jobs.json> --recompare <regex>  (no browser)
 *
 * jobs.json: [{ id, srcUrl?, srcPng?, edsUrl, widths?: [1440, 768, 390], contentWidth? }]
 *   srcPng: a path (cwd-relative) that may contain "{width}", or an object { "1440": path, ... }.
 *   contentWidth: { "1440": 1425, ... } layout width of the source screenshot, passed to
 *   capture.js --content-width (build-jobs.mjs fills it in). Extra job fields are ignored.
 *   Without srcUrl/srcPng only the EDS page is captured (metrics, no diff).
 *
 * --budget: no capture or compare is started once this call would likely run past it (estimate:
 *   mean duration of the recorded captures); --batch still caps the number of captures.
 * --only: work only on job ids matching the regex (e.g. after --reset, to re-check one page).
 * --reset: marks the EDS captures (and compares) of matching ids pending again, e.g. after a fix
 *   was deployed; --recompare clears only the compares. Both just edit progress.json and exit.
 * Masks: the boxes capture.js stored in the EDS (and a captured source's) <out>.json
 *   "liveBoxes" are passed to compare.js --mask, unless --no-mask.
 *
 * Each capture runs capture.js in its own child process, one at a time. After every page the
 * result is written to <state>/progress.json (tmp + rename). At most --batch captures run per call.
 * A capture that was in flight when a previous call crashed (<state>/inflight.json) is marked
 * 'skipped-inflight'; failed or skipped captures are retried once, after all fresh work.
 * Screenshots: <shots>/{id}/{width}-src.png, -eds.png, -diff.png (+ .json metrics beside each).
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const {
  DEFAULT_STATE, getArgs, writeJsonAtomic, readJson, rmSafe, mkdirp,
} = require('./lib.js');

const MAX_ATTEMPTS = 2; // first try + one retry
const DEFAULT_WIDTHS = [1440, 768, 390];

const args = getArgs({
  list: { type: 'string' },
  batch: { type: 'string', default: '6' },
  budget: { type: 'string' },
  only: { type: 'string' },
  reset: { type: 'string' },
  recompare: { type: 'string' },
  'no-mask': { type: 'boolean', default: false },
  state: { type: 'string', default: DEFAULT_STATE },
  shots: { type: 'string' },
  timeout: { type: 'string', default: '90000' },
  'max-height': { type: 'string', default: '8000' },
}, ['list'], 'node tools/parity/run-batch.js --list jobs.json [--batch 6] [--budget s] [--only regex] [--reset regex | --recompare regex] [--state dir] [--shots dir] [--timeout 90000] [--max-height 8000] [--no-mask]');

const stateDir = path.resolve(args.state);
const shotsDir = path.resolve(args.shots || path.join(path.dirname(stateDir), 'shots'));
const batch = Number(args.batch);
const timeout = Number(args.timeout);
const callStart = Date.now();
const budgetMs = args.budget ? Number(args.budget) * 1000 : Infinity;
const only = args.only ? new RegExp(args.only) : null;
const COMPARE_ESTIMATE_MS = 5000;
const progressFile = path.join(stateDir, 'progress.json');
const inflightFile = path.join(stateDir, 'inflight.json');
const lockFile = path.join(stateDir, 'batch.lock');

// ---- single-runner lock: only one browser at a time ----
function isAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return e.code === 'EPERM';
  }
}
mkdirp(stateDir);
const lock = readJson(lockFile, null);
if (lock && lock.pid !== process.pid && isAlive(lock.pid)) {
  console.error(`another run-batch (pid ${lock.pid}) is using ${stateDir}; not starting`);
  process.exit(3);
}
fs.writeFileSync(lockFile, JSON.stringify({
  pid: process.pid, startedAt: new Date().toISOString(),
}));
process.on('exit', () => rmSafe(lockFile));
process.once('SIGINT', () => process.exit(130));
process.once('SIGTERM', () => process.exit(143));

// ---- jobs and progress ----
const jobs = readJson(path.resolve(args.list), null);
if (!Array.isArray(jobs)) {
  console.error(`cannot read job list ${args.list} (expected a JSON array)`);
  process.exit(2);
}

const progress = readJson(progressFile, { version: 1, items: {} });
const save = () => {
  progress.updatedAt = new Date().toISOString();
  writeJsonAtomic(progressFile, progress);
};

function contentWidthFor(job, width) {
  const w = job.contentWidth && Number(job.contentWidth[width]);
  return w > 0 && w <= width ? w : width;
}

function srcPngFor(job, width) {
  if (!job.srcPng) return null;
  const p = typeof job.srcPng === 'string' ? job.srcPng.replace('{width}', width) : job.srcPng[width];
  return p ? path.resolve(p) : null;
}

/** Builds/refreshes the progress entry of one (job, width); resets captures whose URL changed. */
function itemFor(job, width) {
  const key = `${job.id}@${width}`;
  const dir = path.join(shotsDir, job.id);
  const item = progress.items[key] || { id: job.id, width, captures: {} };
  progress.items[key] = item;
  const want = { eds: job.edsUrl };
  const srcPng = srcPngFor(job, width);
  if (!srcPng && job.srcUrl) want.src = job.srcUrl;
  const contentWidth = contentWidthFor(job, width);

  Object.entries(want).forEach(([side, url]) => {
    const out = path.join(dir, `${width}-${side}.png`);
    const c = item.captures[side];
    if (!c || c.url !== url || c.out !== out || (c.contentWidth || width) !== contentWidth
      || (c.status === 'ok' && !fs.existsSync(out))) {
      item.captures[side] = {
        url, out, contentWidth, status: 'pending', attempts: 0, inflightAttempts: 0,
      };
      item.compare = null;
    }
  });
  if (srcPng) {
    const exists = fs.existsSync(srcPng);
    if (!item.captures.src || item.captures.src.out !== srcPng) item.compare = null;
    item.captures.src = {
      out: srcPng, status: exists ? 'provided' : 'missing', error: exists ? undefined : 'srcPng not found',
    };
  } else if (!job.srcUrl) {
    delete item.captures.src;
  }
  item.diff = path.join(dir, `${width}-diff.png`);
  return item;
}

const isOk = (c) => c && (c.status === 'ok' || c.status === 'provided');
const exhausted = (c) => !isOk(c) && c.status !== 'missing' && c.attempts >= MAX_ATTEMPTS;

function updateItemStatus(item) {
  const caps = Object.values(item.captures);
  const compareGaveUp = item.compare && item.compare.error && item.compare.attempts >= MAX_ATTEMPTS;
  if (caps.some(exhausted) || compareGaveUp) {
    item.status = 'failed';
  } else if (caps.every(isOk) && (!item.captures.src || (item.compare && !item.compare.error))) {
    item.status = 'done';
  } else if (item.captures.src && item.captures.src.status === 'missing') {
    item.status = 'waiting'; // srcPng not there yet; EDS is still captured, compare runs later
  } else {
    item.status = 'pending';
  }
}

const items = [];
jobs.forEach((job) => {
  if (!job || !job.id || !job.edsUrl) {
    console.error(`skipping job without id/edsUrl: ${JSON.stringify(job)}`);
    return;
  }
  (job.widths || DEFAULT_WIDTHS).forEach((w) => items.push(itemFor(job, Number(w))));
});
// entries of jobs no longer in the list are kept in progress.json but not counted

// ---- a capture that was in flight when the previous call died ----
const run = {
  captures: 0, ok: 0, failed: 0, compares: 0, skippedInflight: 0,
};
const inflight = readJson(inflightFile, null);
if (inflight) {
  const hit = items.flatMap((it) => Object.values(it.captures))
    .find((c) => c.out === path.resolve(inflight.out || ''));
  if (hit && !isOk(hit)) {
    hit.status = 'skipped-inflight';
    hit.attempts = (hit.attempts || 0) + 1;
    hit.inflightAttempts = (hit.inflightAttempts || 0) + 1;
    hit.error = `in flight when a previous run crashed (started ${inflight.startedAt})`;
    run.skippedInflight += 1;
  }
  console.log(`found inflight.json for ${inflight.url} @${inflight.width}: ${hit ? 'marked skipped-inflight' : 'not in job list, ignored'}`);
  rmSafe(inflightFile);
}
// ---- --reset / --recompare: edit progress only, no browser ----
if (args.reset || args.recompare) {
  const re = new RegExp(args.reset || args.recompare);
  const hits = items.filter((it) => re.test(it.id));
  hits.forEach((it) => {
    if (args.reset) {
      const { url, out, contentWidth } = it.captures.eds;
      it.captures.eds = {
        url, out, contentWidth, status: 'pending', attempts: 0, inflightAttempts: 0,
      };
      // a captured (not provided) source is kept; a failed one gets its retries back
      if (it.captures.src && it.captures.src.url && !isOk(it.captures.src)) {
        it.captures.src.attempts = 0;
      }
    }
    it.compare = null;
    updateItemStatus(it);
  });
  save();
  console.log(`${args.reset ? 'reset EDS capture + compare' : 'cleared compare'} of ${hits.length} page-widths matching /${re.source}/`);
  process.exit(0);
}

items.forEach(updateItemStatus);
save();

// ---- work ----
const fontSummary = (f) => f && { used: f.used, webfont: f.webfont };
function summarizeMetrics(file) {
  const m = readJson(file, null);
  if (!m) return null;
  const imgs = m.images || {};
  return {
    httpStatus: m.httpStatus,
    finalUrl: m.finalUrl !== m.url ? m.finalUrl : undefined,
    scrollHeight: m.scrollHeight,
    truncated: m.truncated,
    viewportWidth: m.viewportWidth,
    clientWidth: m.clientWidth,
    contentWidth: m.contentWidth,
    contentWidthMatched: m.contentWidthMatched,
    horizontalOverflow: m.horizontalOverflow,
    overflowPx: m.overflowPx,
    failedImages: imgs.failed,
    pendingImages: imgs.pending,
    failedSrc: imgs.failedSrc && imgs.failedSrc.length ? imgs.failedSrc : undefined,
    fonts: m.fonts && Object.fromEntries(['h1', 'h2', 'body'].map((k) => [k, fontSummary(m.fonts[k])])),
    loadedWebfonts: m.fonts && m.fonts.loadedWebfonts,
    consentBannerVisible: m.consentBannerVisible,
    showcaseNoticeVisible: m.showcaseNoticeVisible,
    waits: m.waits,
    liveBoxes: Array.isArray(m.liveBoxes) ? m.liveBoxes.length : undefined,
  };
}

/** Expected duration of one capture: mean of the last 30 recorded ok captures, else 30 s. */
function captureEstimateMs() {
  const ms = Object.values(progress.items).flatMap((it) => Object.values(it.captures || {}))
    .filter((c) => c.status === 'ok' && c.ms > 0)
    .map((c) => c.ms)
    .slice(-30);
  return ms.length ? ms.reduce((a, b) => a + b, 0) / ms.length : 30000;
}
const withinBudget = (ms) => Date.now() - callStart + ms <= budgetMs;

function runCapture(item, side) {
  const c = item.captures[side];
  const t0 = Date.now();
  const res = spawnSync(process.execPath, [
    path.join(__dirname, 'capture.js'),
    '--url', c.url, '--width', String(item.width), '--out', c.out,
    '--content-width', String(c.contentWidth || item.width),
    '--timeout', String(timeout), '--max-height', args['max-height'], '--state', stateDir,
  ], {
    encoding: 'utf8', timeout: timeout + 20000, killSignal: 'SIGTERM', maxBuffer: 4 * 1024 * 1024,
  });
  const lastLine = (res.stdout || '').trim().split('\n').pop();
  let line = {};
  try {
    line = JSON.parse(lastLine);
  } catch (e) {
    // no result line: the child crashed or was killed
  }
  let status;
  if (res.status === 0 && line.status === 'ok') status = 'ok';
  else if (res.status === 124 || line.status === 'timeout' || (res.error && res.error.code === 'ETIMEDOUT')) status = 'timeout';
  else status = 'error';
  if (fs.existsSync(inflightFile)) rmSafe(inflightFile); // child died without cleanup

  c.attempts = (c.attempts || 0) + 1;
  c.status = status;
  c.ms = Date.now() - t0;
  c.at = new Date().toISOString();
  if (status === 'ok') {
    delete c.error;
    c.metrics = summarizeMetrics(`${c.out}.json`);
  } else {
    c.error = line.error || (res.error && res.error.message)
      || (res.stderr || '').trim().split('\n').pop() || `exit ${res.status} ${res.signal || ''}`.trim();
  }
  run.captures += 1;
  run[status === 'ok' ? 'ok' : 'failed'] += 1;
  console.log(`  ${status.padEnd(7)} ${item.id}@${item.width} ${side} ${(c.ms / 1000).toFixed(1)}s${c.error ? ` - ${c.error}` : ''}`);
}

/** Mask files: the liveBoxes of the EDS capture and of a captured (not provided) source. */
function maskFiles(item) {
  if (args['no-mask']) return [];
  return ['eds', 'src'].map((side) => item.captures[side])
    .filter((c) => c && c.status === 'ok')
    .map((c) => `${c.out}.json`)
    .filter((f) => {
      const m = readJson(f, null);
      return m && Array.isArray(m.liveBoxes) && m.liveBoxes.length > 0;
    });
}

function runCompare(item) {
  const prev = item.compare || {};
  const masks = maskFiles(item);
  const res = spawnSync(process.execPath, [
    path.join(__dirname, 'compare.js'), '--a', item.captures.src.out, '--b', item.captures.eds.out, '--out', item.diff,
    ...masks.flatMap((m) => ['--mask', m]),
  ], { encoding: 'utf8', timeout: 180000, killSignal: 'SIGTERM' });
  const r = res.status === 0 ? readJson(`${item.diff}.json`, null) : null;
  run.compares += 1;
  if (!r) {
    item.compare = {
      error: (res.stderr || '').trim().split('\n').pop() || `exit ${res.status}`,
      attempts: (prev.attempts || 0) + 1,
    };
    console.log(`  error   ${item.id}@${item.width} compare - ${item.compare.error}`);
    return;
  }
  item.compare = {
    mismatchRatio: r.mismatchRatio,
    unmaskedRatio: r.unmaskedRatio,
    maskRatio: r.maskRatio,
    maskBoxes: r.maskBoxes,
    widthA: r.widthA,
    widthB: r.widthB,
    heightA: r.heightA,
    heightB: r.heightB,
    heightDiffRatio: r.heightDiffRatio,
    firstDivergentBand: r.firstDivergentBand,
    worstBands: r.worstBands.map(({ y, unmaskedRatio }) => ({ y, unmaskedRatio })),
    bandHeight: r.bandHeight,
    bandRatios: r.bands.map((b) => b.unmaskedRatio),
    diff: item.diff,
    at: new Date().toISOString(),
    attempts: (prev.attempts || 0) + 1,
  };
  const div = r.firstDivergentBand ? `, diverges at y=${r.firstDivergentBand.y}` : '';
  console.log(`  compare ${item.id}@${item.width} unmasked ${(r.unmaskedRatio * 100).toFixed(2)}%`
    + ` (all ${(r.mismatchRatio * 100).toFixed(2)}%, ${r.maskBoxes} masks; h ${r.heightA} vs ${r.heightB}${div})`);
}

const needsCapture = (c) => c && !isOk(c) && !exhausted(c);
// fresh work first, retries (failed or skipped-inflight) after
const priority = (item) => Math.max(0, ...Object.values(item.captures)
  .filter(needsCapture).map((c) => c.attempts || 0));
const queue = items.filter((it) => (it.status === 'pending' || it.status === 'waiting')
  && (!only || only.test(it.id)))
  .map((it, i) => ({ it, i, p: priority(it) }))
  .sort((x, y) => x.p - y.p || x.i - y.i)
  .map((x) => x.it);

let outOfTime = false;
queue.forEach((item) => {
  // progress.json is large: write it only when this item changed
  let changed = false;
  ['src', 'eds'].forEach((side) => {
    if (!needsCapture(item.captures[side]) || run.captures >= batch || outOfTime) return;
    if (!withinBudget(captureEstimateMs() + COMPARE_ESTIMATE_MS)) {
      outOfTime = true;
      console.log(`  budget: ${Math.round((Date.now() - callStart) / 1000)} s of ${budgetMs / 1000} s used, no more captures this call`);
      return;
    }
    runCapture(item, side);
    updateItemStatus(item);
    save();
    changed = true;
  });
  const { src } = item.captures;
  if (src && src.status === 'missing' && fs.existsSync(src.out)) {
    item.captures.src = { out: src.out, status: 'provided' };
    changed = true;
  }
  const caps = Object.values(item.captures);
  if (item.captures.src && caps.every(isOk) && !(item.compare && !item.compare.error)
    && !(item.compare && item.compare.attempts >= MAX_ATTEMPTS)
    && withinBudget(COMPARE_ESTIMATE_MS)) {
    runCompare(item);
    changed = true;
  }
  // once the capture budget is used up the loop only runs (cheap) compares of complete items
  if (changed) {
    updateItemStatus(item);
    save();
  }
});

const counts = items.reduce((acc, it) => ({ ...acc, [it.status]: (acc[it.status] || 0) + 1 }), {});
const failedList = items.filter((it) => it.status === 'failed').map((it) => `${it.id}@${it.width}`);
console.log(`parity: ${counts.done || 0}/${items.length} done, ${counts.failed || 0} failed, ${counts.pending || 0} pending`
  + `${counts.waiting ? `, ${counts.waiting} waiting for srcPng` : ''}`
  + ` | this call: ${Math.round((Date.now() - callStart) / 1000)} s, ${run.captures} captures (${run.ok} ok, ${run.failed} failed), ${run.compares} compares`
  + `${run.skippedInflight ? `, ${run.skippedInflight} skipped-inflight` : ''}`
  + `${failedList.length ? ` | failed: ${failedList.join(', ')}` : ''}`
  + `${counts.pending || counts.waiting ? '' : ' | ALL DONE'}`);
