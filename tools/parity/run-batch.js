/* eslint-disable no-console */
/**
 * Resumable parity batch runner. Call it repeatedly until it reports everything done.
 *
 * node tools/parity/run-batch.js --list <jobs.json> [--batch 6]
 *   [--state tools/reports/parity/state]
 *   [--shots <state>/../shots] [--timeout 90000] [--max-height 8000]
 *
 * jobs.json: [{ id, srcUrl?, srcPng?, edsUrl, widths?: [1440, 768, 390] }]
 *   srcPng: a path (cwd-relative) that may contain "{width}", or an object { "1440": path, ... }.
 *   Without srcUrl/srcPng only the EDS page is captured (metrics, no diff).
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
  state: { type: 'string', default: DEFAULT_STATE },
  shots: { type: 'string' },
  timeout: { type: 'string', default: '90000' },
  'max-height': { type: 'string', default: '8000' },
}, ['list'], 'node tools/parity/run-batch.js --list jobs.json [--batch 6] [--state dir] [--shots dir] [--timeout 90000] [--max-height 8000]');

const stateDir = path.resolve(args.state);
const shotsDir = path.resolve(args.shots || path.join(path.dirname(stateDir), 'shots'));
const batch = Number(args.batch);
const timeout = Number(args.timeout);
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

  Object.entries(want).forEach(([side, url]) => {
    const out = path.join(dir, `${width}-${side}.png`);
    const c = item.captures[side];
    if (!c || c.url !== url || c.out !== out || (c.status === 'ok' && !fs.existsSync(out))) {
      item.captures[side] = {
        url, out, status: 'pending', attempts: 0, inflightAttempts: 0,
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
items.forEach(updateItemStatus);
save();

// ---- work ----
function summarizeMetrics(file) {
  const m = readJson(file, null);
  if (!m) return null;
  return {
    httpStatus: m.httpStatus,
    scrollHeight: m.scrollHeight,
    horizontalOverflow: m.horizontalOverflow,
    overflowPx: m.overflowPx,
    failedImages: m.images && m.images.failed,
    fonts: m.fonts && Object.fromEntries(['h1', 'h2', 'body'].map((k) => [k, m.fonts[k] && m.fonts[k].used])),
  };
}

function runCapture(item, side) {
  const c = item.captures[side];
  const t0 = Date.now();
  const res = spawnSync(process.execPath, [
    path.join(__dirname, 'capture.js'),
    '--url', c.url, '--width', String(item.width), '--out', c.out,
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

function runCompare(item) {
  const prev = item.compare || {};
  const res = spawnSync(process.execPath, [
    path.join(__dirname, 'compare.js'), '--a', item.captures.src.out, '--b', item.captures.eds.out, '--out', item.diff,
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
    heightA: r.heightA,
    heightB: r.heightB,
    worstBands: r.worstBands,
    diff: item.diff,
    attempts: (prev.attempts || 0) + 1,
  };
  console.log(`  compare ${item.id}@${item.width} mismatch ${(r.mismatchRatio * 100).toFixed(2)}% (h ${r.heightA} vs ${r.heightB})`);
}

const needsCapture = (c) => c && !isOk(c) && !exhausted(c);
// fresh work first, retries (failed or skipped-inflight) after
const priority = (item) => Math.max(0, ...Object.values(item.captures)
  .filter(needsCapture).map((c) => c.attempts || 0));
const queue = items.filter((it) => it.status === 'pending' || it.status === 'waiting')
  .map((it, i) => ({ it, i, p: priority(it) }))
  .sort((x, y) => x.p - y.p || x.i - y.i)
  .map((x) => x.it);

queue.forEach((item) => {
  ['src', 'eds'].forEach((side) => {
    if (needsCapture(item.captures[side]) && run.captures < batch) {
      runCapture(item, side);
      updateItemStatus(item);
      save();
    }
  });
  const { src } = item.captures;
  if (src && src.status === 'missing' && fs.existsSync(src.out)) {
    item.captures.src = { out: src.out, status: 'provided' };
  }
  const caps = Object.values(item.captures);
  if (item.captures.src && caps.every(isOk) && !(item.compare && !item.compare.error)
    && !(item.compare && item.compare.attempts >= MAX_ATTEMPTS)) {
    runCompare(item);
  }
  // once the capture budget is used up the loop only runs (cheap) compares of complete items
  updateItemStatus(item);
  save();
});

const counts = items.reduce((acc, it) => ({ ...acc, [it.status]: (acc[it.status] || 0) + 1 }), {});
const failedList = items.filter((it) => it.status === 'failed').map((it) => `${it.id}@${it.width}`);
console.log(`parity: ${counts.done || 0}/${items.length} done, ${counts.failed || 0} failed, ${counts.pending || 0} pending`
  + `${counts.waiting ? `, ${counts.waiting} waiting for srcPng` : ''}`
  + ` | this call: ${run.captures} captures (${run.ok} ok, ${run.failed} failed), ${run.compares} compares`
  + `${run.skippedInflight ? `, ${run.skippedInflight} skipped-inflight` : ''}`
  + `${failedList.length ? ` | failed: ${failedList.join(', ')}` : ''}`
  + `${counts.pending || counts.waiting ? '' : ' | ALL DONE'}`);
