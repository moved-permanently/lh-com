/* eslint-disable no-console, import/no-extraneous-dependencies -- dev tooling */
/**
 * Captures ONE page as a PNG plus cheap layout metrics (<out>.json).
 *
 * node tools/parity/capture.js --url <url> --width <1440|768|390> --out <png>
 *   [--timeout 90000] [--max-height 8000] [--state tools/reports/parity/state]
 *
 * Exit codes: 0 ok, 1 error, 2 usage, 124 hard timeout (browser force-closed).
 * Writes <state>/inflight.json before launching the browser and removes it when done, so a
 * resumed batch can tell which page was in flight when a crash happened. Every attempt appends
 * one line to <state>/captures.jsonl.
 */
const started = Date.now();
process.env.PLAYWRIGHT_BROWSERS_PATH ||= '/ms-playwright';

const path = require('path');
const { chromium } = require('playwright-core');
const {
  DEFAULT_STATE, getArgs, mkdirp, writeJsonAtomic, appendJsonl, rmSafe,
} = require('./lib.js');

const USAGE = 'node tools/parity/capture.js --url <url> --width <px> --out <png> [--timeout 90000] [--max-height 8000] [--state dir]';
const VIEWPORT_HEIGHT = 900;

const args = getArgs({
  url: { type: 'string' },
  width: { type: 'string' },
  out: { type: 'string' },
  timeout: { type: 'string', default: '90000' },
  'max-height': { type: 'string', default: '8000' },
  state: { type: 'string', default: DEFAULT_STATE },
}, ['url', 'width', 'out'], USAGE);

const { url } = args;
const width = Number(args.width);
const out = path.resolve(args.out);
const timeout = Number(args.timeout);
const maxHeight = Number(args['max-height']);
const stateDir = path.resolve(args.state);
const inflightFile = path.join(stateDir, 'inflight.json');
const logFile = path.join(stateDir, 'captures.jsonl');
// navigation gets at most half of the page budget, the rest is for scrolling and the screenshot
const navTimeout = Math.max(15000, Math.min(60000, Math.floor(timeout / 2)));

if (!Number.isInteger(width) || width < 200 || !(timeout > 0) || !(maxHeight > 0)) {
  console.error(`invalid --width/--timeout/--max-height\nusage: ${USAGE}`);
  process.exit(2);
}

let browser;
let finished = false;

/** Records the outcome exactly once and clears the in-flight marker. */
function finish(status, error) {
  if (finished) return;
  finished = true;
  const line = {
    url, width, out, status, ms: Date.now() - started, at: new Date().toISOString(),
  };
  if (error) line.error = String(error).split('\n')[0].slice(0, 500);
  appendJsonl(logFile, line);
  rmSafe(inflightFile);
  console.log(JSON.stringify(line));
  process.exitCode = { ok: 0, error: 1, timeout: 124 }[status];
}

/** Hard stop: close the browser (bounded), log, exit. Playwright kills chromium on exit. */
async function abort(reason, code) {
  finish('timeout', reason);
  await Promise.race([
    browser ? browser.close().catch(() => {}) : Promise.resolve(),
    new Promise((r) => { setTimeout(r, 5000); }),
  ]);
  process.exit(code);
}

const hardTimer = setTimeout(() => abort(`hard timeout after ${timeout} ms`, 124), timeout);
process.once('SIGTERM', () => abort('killed by SIGTERM', 124));
process.once('SIGINT', () => abort('killed by SIGINT', 130));

const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });

async function dismissCookieDialog(page) {
  // OneTrust injects its banner asynchronously; give it a short moment to show up
  const sdk = await page.waitForSelector('#onetrust-consent-sdk', { state: 'attached', timeout: 1500 })
    .catch(() => null);
  if (!sdk) return 'none';
  const tryClick = async (sel) => {
    const btn = page.locator(sel);
    if (!(await btn.isVisible().catch(() => false))) return false;
    return btn.click({ timeout: 3000 }).then(() => true).catch(() => false);
  };
  const clicked = (await tryClick('#onetrust-accept-btn-handler') && 'accepted')
    || (await tryClick('#onetrust-reject-all-handler') && 'rejected');
  if (clicked) {
    await sleep(500);
    // the SDK can keep a dark overlay around after the click
    await page.evaluate(() => document.querySelector('.onetrust-pc-dark-filter')?.remove());
    return clicked;
  }
  await page.evaluate(() => document.querySelector('#onetrust-consent-sdk')?.remove());
  return 'removed';
}

async function scrollThrough(page) {
  for (let y = 0; ; y += VIEWPORT_HEIGHT) {
    // eslint-disable-next-line no-await-in-loop
    const h = await page.evaluate((top) => {
      window.scrollTo(0, top);
      return document.documentElement.scrollHeight;
    }, y);
    if (y + VIEWPORT_HEIGHT >= Math.min(h, maxHeight)) break;
    // eslint-disable-next-line no-await-in-loop
    await sleep(250);
  }
  await sleep(400);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
  await sleep(600);
}

/* eslint-disable no-undef */ // runs in the page
function collectMetrics() {
  const de = document.documentElement;
  const loaded = new Set();
  document.fonts.forEach((f) => {
    if (f.status === 'loaded') loaded.add(f.family.replace(/^["']|["']$/g, ''));
  });
  const generic = ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'ui-sans-serif', 'ui-serif', '-apple-system'];
  const font = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const declared = getComputedStyle(el).fontFamily;
    const stack = declared.split(',').map((s) => s.trim().replace(/^["']|["']$/g, ''));
    // first family in the stack that is a loaded web font; otherwise a local/system fallback
    const web = stack.find((f) => loaded.has(f));
    return {
      declared,
      used: web || stack.find((f) => generic.includes(f)) || stack[0],
      webfont: Boolean(web),
    };
  };
  const imgs = [...document.images].filter((i) => i.currentSrc || i.getAttribute('src'));
  return {
    title: document.title,
    viewportWidth: window.innerWidth,
    scrollWidth: de.scrollWidth,
    horizontalOverflow: de.scrollWidth > window.innerWidth + 1,
    overflowPx: Math.max(0, de.scrollWidth - window.innerWidth),
    scrollHeight: de.scrollHeight,
    images: {
      total: imgs.length,
      failed: imgs.filter((i) => i.complete && i.naturalWidth === 0).length,
      pending: imgs.filter((i) => !i.complete).length,
      failedSrc: imgs.filter((i) => i.complete && i.naturalWidth === 0)
        .slice(0, 10).map((i) => i.currentSrc || i.getAttribute('src')),
    },
    fonts: {
      h1: font('h1'), h2: font('h2'), body: font('body'), loadedWebfonts: [...loaded],
    },
  };
}
/* eslint-enable no-undef */

async function main() {
  writeJsonAtomic(inflightFile, {
    url, width, out, pid: process.pid, startedAt: new Date(started).toISOString(),
  });
  mkdirp(path.dirname(out));

  browser = await chromium.launch({ headless: true, handleSIGTERM: false, handleSIGINT: false });
  const context = await browser.newContext({
    viewport: { width, height: VIEWPORT_HEIGHT }, deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);

  const response = await page.goto(url, { waitUntil: 'load', timeout: navTimeout });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  const cookie = await dismissCookieDialog(page);
  await scrollThrough(page);

  const metrics = await page.evaluate(collectMetrics);
  const height = Math.max(1, Math.min(metrics.scrollHeight, maxHeight));
  await page.screenshot({
    path: out,
    fullPage: true,
    clip: {
      x: 0, y: 0, width, height,
    },
    timeout: 30000,
  });

  writeJsonAtomic(`${out}.json`, {
    url,
    finalUrl: page.url(),
    httpStatus: response ? response.status() : null,
    width,
    capturedHeight: height,
    truncated: metrics.scrollHeight > maxHeight,
    cookieDialog: cookie,
    capturedAt: new Date().toISOString(),
    ...metrics,
  });
}

main()
  .then(() => finish('ok'))
  .catch((e) => finish('error', e && e.message))
  .finally(async () => {
    clearTimeout(hardTimer);
    if (browser) await browser.close().catch(() => {});
    // exit explicitly so no stray handle keeps the process alive
    process.exit(process.exitCode || 0);
  });

process.on('exit', () => {
  if (!finished) finish('error', 'process exited unexpectedly');
});
