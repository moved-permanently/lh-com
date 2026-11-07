/* eslint-disable import/extensions, max-len, no-await-in-loop, no-console, no-nested-ternary, no-promise-executor-return, no-restricted-syntax, no-shadow, object-curly-newline -- dev tooling */
// market-diff fetcher: fetches page renditions of ONE www host from inside a real browser tab on that host
// (same-origin fetch, so Cloudflare sees a real browser), one request at a time, paced start to start.
// Bodies go to <out>/bodies/<xx>/<sha1(path)>.gz, one log row per request to <out>/fetch.jsonl.
// Resumable: a path whose latest row is final (ok, redirect, not-found, gone, forbidden) is not asked again.
//
// usage: node bin/md-fetch.mjs --host www.lufthansa.com --urls <file> --out <dir>
//          [--gap 500]         start-to-start pause in ms (jitter +-15 %), never below 500 (500 = 2 pages a second)
//          [--warmup /de/en/homepage]   page the tab opens first (and again every --refresh-min minutes)
//          [--refresh-min 15] [--max <n requests>] [--max-min <minutes>] [--follow] [--retry-errors] [--redirect-targets]
//          [--max-blocks 1]    blocks before the run stops (1: stop at the first; 2: pause 30 min and double the gap first)
//          [--forbidden-is-block]   any 403 counts as a block (else a 403 without a challenge page is logged as forbidden)
//          [--profile <dir>]   browser profile (default <out>/chrome-profile)
//          [--chrome <path>] [--headless]   browser: lib/browser.mjs (default Playwright's Chromium; headless by itself on
//                              Linux without a display)
// <file>: one path per line (or TSV, path in the first column); '#' comments; a .gz file is read gunzipped. Paths start with '/'.
// --host may be a full origin (http://localhost:8080) for a local test.
// Stop gracefully: touch <out>/STOP. Exit codes: 0 done, 2 stopped by STOP/limits, 3 blocked (--max-blocks reached),
// 4 warm-up blocked (challenge page, 403, 429 or cf-mitigated on the warm-up page), 5 warm-up failed without a block
// (network error, timeout: not a Cloudflare answer).
// Block rule: a challenge page, 429 or cf-mitigated answer is a block (with --forbidden-is-block any 403 too). With
// --max-blocks 2 the first block pauses all requests for 30 minutes and doubles the gap, the second stops the run.
// The browser is closed on every exit.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { launch } from '../lib/browser.mjs';
import readText from '../lib/files.mjs';

const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
const flag = (n) => argv.includes(`--${n}`);
const HOST = opt('host');
const ORIGIN = /^https?:\/\//.test(HOST || '') ? HOST.replace(/\/$/, '') : `https://${HOST}`;
const URLS = opt('urls');
const OUT = path.resolve(opt('out', '.'));
if (!HOST || !URLS) { console.error('usage: md-fetch.mjs --host <host> --urls <file> --out <dir>'); process.exit(1); }
let GAP = Math.max(500, Number(opt('gap', '500')));
const WARMUP = opt('warmup', '/');
const REFRESH_MS = Number(opt('refresh-min', '15')) * 60000;
const MAX = Number(opt('max', '0')) || Infinity;
const MAX_MS = Number(opt('max-min', '0')) * 60000 || Infinity;
let FOLLOW = flag('follow');
const RETRY_ERRORS = flag('retry-errors');
const MAX_BLOCKS = Math.max(1, Number(opt('max-blocks', '1')));
const FORBIDDEN_IS_BLOCK = flag('forbidden-is-block');
const PROFILE = path.resolve(opt('profile', path.join(OUT, 'chrome-profile')));
const CHROME = opt('chrome', '');
const HEADLESS = flag('headless') ? true : undefined;
const LOG = path.join(OUT, 'fetch.jsonl');
const STOP = path.join(OUT, 'STOP');
const FINAL = new Set(['ok', 'redirect', 'not-found', 'gone', 'forbidden']);
const KEEP_H = ['content-type', 'content-length', 'etag', 'last-modified', 'cache-control', 'cf-cache-status', 'age',
  'x-dispatcher', 'x-vhost', 'location', 'cf-mitigated', 'server', 'x-cache', 'x-nextjs-cache', 'x-vercel-cache'];
const CHALLENGE = /just a moment|nur einen moment|cf-chl|challenge-platform|attention required|access denied|security check|enable javascript and cookies/i;

fs.mkdirSync(path.join(OUT, 'bodies'), { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const now = () => new Date().toISOString();
const sha = (s, alg = 'sha256') => crypto.createHash(alg).update(s).digest('hex');
const log = (row) => fs.appendFileSync(LOG, `${JSON.stringify({ at: now(), ...row })}\n`);
// wall-clock wait (a sleeping laptop pauses timers; poll the clock instead of one long sleep)
async function waitUntil(t) { while (Date.now() < t) await sleep(Math.min(30000, t - Date.now())); }

const wanted = [...new Set(readText(URLS).split('\n').map((l) => l.replace(/#.*/, '').split('\t')[0].trim())
  .filter((l) => l.startsWith('/')))];
const latest = new Map();
if (fs.existsSync(LOG)) {
  fs.readFileSync(LOG, 'utf8').split('\n').filter(Boolean).forEach((l) => {
    try { const r = JSON.parse(l); if (r.path) latest.set(r.path, r); } catch (e) { /* torn line */ }
  });
}
const todo = wanted.filter((p) => {
  const r = latest.get(p);
  if (!r) return true;
  if (FINAL.has(r.kind)) return false;
  return RETRY_ERRORS || (r.tries || 1) < 3;
});
console.log(now(), `host ${HOST}: ${wanted.length} paths, ${wanted.length - todo.length} done before, ${todo.length} to fetch, gap ${GAP} ms, stop after ${MAX_BLOCKS} block(s)`);
if (!todo.length) process.exit(0);

let ctx;
let page;
let closing = false;
async function closeChrome() {
  if (closing) return;
  closing = true;
  try { await ctx?.close(); } catch (e) { /* already gone */ }
}
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, async () => { console.log(now(), sig, 'closing the browser'); await closeChrome(); process.exit(2); });

// opens (or reloads) the warm-up page; returns its title, HTTP status and whether it is a block
async function openTab() {
  if (!ctx) {
    const b = await launch({
      profile: PROFILE,
      chrome: CHROME,
      headless: HEADLESS,
      viewport: { width: 1280, height: 860 },
      windowArgs: ['--window-position=80,80', '--window-size=1300,940'],
    });
    ctx = b.ctx;
    console.log(now(), `browser ${b.executable}${b.headless ? ' (headless)' : ''}`);
  }
  page = ctx.pages()[0] || await ctx.newPage();
  const resp = await page.goto(`${ORIGIN}${WARMUP}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(5000);
  const title = await page.title();
  const status = resp ? resp.status() : 0;
  const mitigated = resp ? await resp.headerValue('cf-mitigated') : null;
  const blocked = /just a moment|nur einen moment|attention required|access denied/i.test(title)
    || status === 403 || status === 429 || !!mitigated;
  return {
    title, status, mitigated, blocked,
  };
}
const warmText = (w) => `${w.status || ''} ${w.mitigated ? `cf-mitigated ${w.mitigated} ` : ''}${w.title}`.trim();
const openTabSafe = () => openTab().catch((e) => ({
  title: `ERROR ${e.message.split('\n')[0]}${/Executable doesn't exist/.test(e.message) ? ' (install it: npx playwright install chromium, or pass --chrome <path>)' : ''}`,
  status: 0,
  blocked: false,
  error: true,
}));

// one request inside the tab: status, kept headers, body text (pages, and error pages to spot challenges)
async function fetchIn(p) {
  return page.evaluate(async ({ p, follow, keep }) => {
    const t0 = performance.now();
    try {
      const r = await fetch(p, { credentials: 'same-origin', cache: 'no-store', redirect: follow ? 'follow' : 'manual' });
      const h = {};
      keep.forEach((k) => { const v = r.headers.get(k); if (v) h[k] = v; });
      const body = r.type === 'opaqueredirect' ? '' : await r.text();
      return { status: r.status, type: r.type, url: r.url, redirected: r.redirected, h, body, ms: Math.round(performance.now() - t0) };
    } catch (e) {
      return { error: String(e).slice(0, 200), ms: Math.round(performance.now() - t0) };
    }
  }, { p, follow: FOLLOW, keep: KEEP_H });
}

function classify(res) {
  if (res.error) return 'error';
  if (res.type === 'opaqueredirect') return 'redirect';
  if (res.redirected) return 'redirect';
  const challenged = res.h['cf-mitigated'] || res.status === 429 || ((res.status === 403 || res.status === 503) && CHALLENGE.test(res.body.slice(0, 20000)));
  if (challenged) return 'blocked';
  if (res.status === 200) return CHALLENGE.test(res.body.slice(0, 3000)) && /<title>[^<]*(just a moment|nur einen moment|attention)/i.test(res.body) ? 'blocked' : 'ok';
  if (res.status === 404) return 'not-found';
  if (res.status === 410) return 'gone';
  if (res.status === 403) return FORBIDDEN_IS_BLOCK ? 'blocked' : 'forbidden';
  return 'error';
}

const t0 = Date.now();
let warm = await openTabSafe();
console.log(now(), 'warm-up', `${ORIGIN}${WARMUP}`, '|', warmText(warm));
if (warm.blocked || warm.error) {
  // a warm-up row is not a page result: the path is asked again on the next start
  log({
    path: WARMUP, kind: warm.blocked ? 'blocked' : 'error', http: warm.status, h: warm.mitigated ? { 'cf-mitigated': warm.mitigated } : {}, warmup: true, note: `warm-up: ${warmText(warm)}`,
  });
  await closeChrome();
  process.exit(warm.blocked ? 4 : 5);
}
let lastRefresh = Date.now();
let lastStart = 0;
let blocks = 0;
let n = 0;
const counts = {};
let exit = 0;
// --redirect-targets: after the list, ask each redirect once more following it, to log where it goes (row.final)
const queue = [...todo];
let targetsPass = false;
for (let qi = 0; ; qi += 1) {
  if (qi >= queue.length) {
    if (exit || targetsPass || !flag('redirect-targets')) break;
    const wantedSet = new Set(wanted);
    const redirects = [...latest.values()].filter((r) => r.kind === 'redirect' && !r.final && wantedSet.has(r.path)).map((r) => r.path);
    if (!redirects.length) break;
    targetsPass = true;
    FOLLOW = true;
    queue.push(...redirects);
    console.log(now(), `redirect targets: ${redirects.length}`);
  }
  const p = queue[qi];
  if (fs.existsSync(STOP)) { console.log(now(), 'STOP file: stopping'); exit = 2; break; }
  if (n >= MAX || Date.now() - t0 > MAX_MS) { console.log(now(), 'limit reached: stopping'); exit = 2; break; }
  if (Date.now() - lastRefresh > REFRESH_MS) {
    warm = await openTabSafe();
    lastRefresh = Date.now();
    console.log(now(), 'refresh', warmText(warm));
    if (warm.blocked) {
      log({
        path: WARMUP, kind: 'blocked', http: warm.status, h: warm.mitigated ? { 'cf-mitigated': warm.mitigated } : {}, warmup: true, note: `warm-up refresh: ${warmText(warm)}`,
      });
      console.log(now(), 'BLOCKED on the warm-up page: stopped');
      exit = 3;
      break;
    }
  }
  await waitUntil(lastStart + GAP * (0.85 + Math.random() * 0.3));
  lastStart = Date.now();
  let res;
  try {
    res = await fetchIn(p);
  } catch (e) {
    // the tab or Chrome went away: open it again and ask once more
    console.log(now(), 'tab error, reopening:', e.message.slice(0, 120));
    try { warm = await openTab(); lastRefresh = Date.now(); res = await fetchIn(p); } catch (e2) { res = { error: String(e2.message).slice(0, 200) }; }
  }
  n += 1;
  let kind = classify(res);
  // the second ask of a redirect failed: a redirect to another host (fetch may not follow it across origins); it stays a
  // redirect, with the target unknown
  if (targetsPass && kind === 'error') { kind = 'redirect'; res.url = '(another host: not readable from the page)'; res.redirected = true; }
  counts[kind] = (counts[kind] || 0) + 1;
  const prev = latest.get(p);
  const row = { path: p, kind, http: res.status, ms: res.ms, tries: (prev && !FINAL.has(prev.kind) ? (prev.tries || 1) + 1 : 1) };
  if (res.h) row.h = res.h;
  if (res.redirected || (res.url && !res.url.endsWith(p) && res.type !== 'opaqueredirect')) row.final = res.url;
  if (res.error) row.error = res.error;
  if (kind === 'ok') {
    const key = sha(p, 'sha1');
    const file = path.join('bodies', key.slice(0, 2), `${key}.gz`);
    fs.mkdirSync(path.join(OUT, path.dirname(file)), { recursive: true });
    fs.writeFileSync(path.join(OUT, file), zlib.gzipSync(Buffer.from(res.body, 'utf8')));
    row.file = file;
    row.bytes = Buffer.byteLength(res.body, 'utf8');
    row.sha256 = sha(res.body);
  }
  if (kind === 'blocked') row.note = (res.body || '').replace(/\s+/g, ' ').match(/<title>[^<]*/i)?.[0] || '';
  log(row);
  latest.set(p, row);
  if (n % 25 === 0 || kind !== 'ok') {
    const mins = (Date.now() - t0) / 60000;
    console.log(now(), `${n}/${todo.length}`, kind, res.status ?? '', p.slice(0, 90), `| ${(n / mins).toFixed(1)}/min`, JSON.stringify(counts));
  }
  if (kind === 'blocked') {
    blocks += 1;
    if (blocks >= MAX_BLOCKS) { console.log(now(), `BLOCKED (${blocks}): stopped`, res.status ?? '', row.note || ''); exit = 3; break; }
    console.log(now(), 'BLOCKED: no request for 30 minutes, then gap doubled');
    await waitUntil(Date.now() + 30 * 60000);
    GAP *= 2;
    warm = await openTabSafe();
    lastRefresh = Date.now();
    console.log(now(), 'after pause', warmText(warm));
    if (warm.blocked || warm.error) { console.log(now(), 'still blocked: stopped'); exit = 3; break; }
  }
}
const mins = (Date.now() - t0) / 60000;
console.log(now(), `done: ${n} requests in ${mins.toFixed(1)} min`, JSON.stringify(counts));
await closeChrome();
process.exit(exit);
