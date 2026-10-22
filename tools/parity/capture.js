/* eslint-disable no-console, import/no-extraneous-dependencies -- dev tooling */
/**
 * Captures ONE page as a PNG plus cheap layout metrics (<out>.json).
 *
 * node tools/parity/capture.js --url <url> --width <1440|768|390> --out <png>
 *   [--content-width <px>] [--timeout 90000] [--max-height 8000] [--state <dir>]
 *
 * Exit codes: 0 ok, 1 error, 2 usage, 124 hard timeout (browser force-closed).
 * Writes <state>/inflight.json before launching the browser and removes it when done, so a
 * resumed batch can tell which page was in flight when a crash happened. Every attempt appends
 * one line to <state>/captures.jsonl.
 *
 * --content-width: layout width to reproduce, i.e. the width of the live screenshot. The live
 *   captures were taken in a browser with a classic scrollbar (viewport 1440 -> 1425 px of
 *   layout). When it is below --width, chromium shows its scrollbar too (media queries still see
 *   the full viewport), the viewport is nudged until documentElement.clientWidth equals it, and
 *   the screenshot is clipped to the layout width (scrollbar excluded).
 * Before navigation the consent choice is stored the way scripts/consent.js stores it
 * (localStorage 'lh-consent' = {groups: ['C0001'], source: 'fallback', date}), so neither
 * OneTrust nor the fallback banner shows on the replica; the showcase notice is acknowledged
 * the same way (localStorage 'lh-showcase-acknowledged', scripts/showcase-notice.js).
 * After scrolling it waits for blocks,
 * web fonts and visible images, and writes the document-coordinate boxes of live-data widgets
 * (LIVE_SELECTORS) to <out>.json "liveBoxes"; compare.js --mask paints them out.
 */
const started = Date.now();
process.env.PLAYWRIGHT_BROWSERS_PATH ||= '/ms-playwright';

const path = require('path');
const { chromium } = require('playwright-core');
const {
  DEFAULT_STATE, getArgs, mkdirp, writeJsonAtomic, appendJsonl, rmSafe,
} = require('./lib.js');

const USAGE = 'node tools/parity/capture.js --url <url> --width <px> --out <png> [--content-width px] [--timeout 90000] [--max-height 8000] [--state dir]';
const VIEWPORT_HEIGHT = 900;
/** Widgets whose content is live (or recorded) data; masked before diffing. */
const LIVE_SELECTORS = [
  '.flight-search',
  '.fare-teaser',
  '.destination-finder',
  '.price-bar',
  '.weather',
  '.flight-status',
  '.table-deals .table-deals-price',
  '[data-lh-source]',
];
/** What scripts/consent.js stores after "reject all" in the fallback banner. */
const CONSENT_KEY = 'lh-consent';
const CONSENT_GROUPS = ['C0001'];
/** What scripts/showcase-notice.js stores when "I understand" is clicked. */
const SHOWCASE_KEY = 'lh-showcase-acknowledged';
const WAIT_BLOCKS_MS = 10000;
const WAIT_FONTS_MS = 6000;
const WAIT_IMAGES_MS = 8000;

const args = getArgs({
  url: { type: 'string' },
  width: { type: 'string' },
  out: { type: 'string' },
  'content-width': { type: 'string' },
  timeout: { type: 'string', default: '90000' },
  'max-height': { type: 'string', default: '8000' },
  state: { type: 'string', default: DEFAULT_STATE },
}, ['url', 'width', 'out'], USAGE);

const { url } = args;
const width = Number(args.width);
const contentWidth = args['content-width'] ? Number(args['content-width']) : width;
// a narrower layout than the viewport means the live browser had a scrollbar
const withScrollbar = contentWidth < width;
const out = path.resolve(args.out);
const timeout = Number(args.timeout);
const maxHeight = Number(args['max-height']);
const stateDir = path.resolve(args.state);
const inflightFile = path.join(stateDir, 'inflight.json');
const logFile = path.join(stateDir, 'captures.jsonl');
// navigation gets at most half of the page budget, the rest is for scrolling and the screenshot
const navTimeout = Math.max(15000, Math.min(60000, Math.floor(timeout / 2)));

if (!Number.isInteger(width) || width < 200 || !(timeout > 0) || !(maxHeight > 0)
  || !Number.isInteger(contentWidth) || contentWidth < 200 || contentWidth > width) {
  console.error(`invalid --width/--content-width/--timeout/--max-height\nusage: ${USAGE}`);
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

/* eslint-disable no-undef */ // the callbacks below run in the page

/** Runs before any page script: stored consent (replica only) and a permanent scrollbar. */
function initScript({
  key, groups, showcaseKey, scrollbar,
}) {
  try {
    if (!/(^|\.)lufthansa\.com$/.test(window.location.hostname) && !localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify({ groups, source: 'fallback', date: new Date().toISOString() }));
    }
    if (!/(^|\.)lufthansa\.com$/.test(window.location.hostname) && !localStorage.getItem(showcaseKey)) {
      localStorage.setItem(showcaseKey, new Date().toISOString());
    }
  } catch (e) {
    // opaque origin (about:blank, sandboxed frame): nothing to store
  }
  if (scrollbar) {
    // short pages, and every page during the full-page screenshot (viewport = document height),
    // would otherwise lose the scrollbar and get a wider layout than the live capture
    document.addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style');
      style.textContent = 'html { overflow-y: scroll !important; }';
      document.head.append(style);
    });
  }
}

/** Waits (bounded) until every EDS section and block is decorated; no-op on other sites. */
function waitForBlocks(page) {
  return page.waitForFunction(
    () => !document.querySelector('[data-section-status]:not([data-section-status="loaded"]), [data-block-status]:not([data-block-status="loaded"])'),
    null,
    { timeout: WAIT_BLOCKS_MS, polling: 200 },
  ).then(() => 'loaded').catch(() => 'timeout');
}

function waitForFonts(page) {
  return page.evaluate((ms) => Promise.race([
    document.fonts.ready.then(() => document.fonts.status),
    new Promise((r) => { setTimeout(() => r('timeout'), ms); }),
  ]), WAIT_FONTS_MS).catch(() => 'error');
}

/** Waits (bounded) until every rendered image above the height cap has loaded or failed. */
function waitForImages(page) {
  return page.waitForFunction((maxH) => [...document.images].every((img) => {
    const r = img.getBoundingClientRect();
    if (!r.width || !r.height || r.top + window.scrollY > maxH) return true;
    // lazy images scrolled out horizontally (carousel slides) never load without a swipe
    if (img.loading === 'lazy' && (r.right <= 0 || r.left >= window.innerWidth)) return true;
    return img.complete;
  }), maxHeight, { timeout: WAIT_IMAGES_MS, polling: 250 }).then(() => 'complete').catch(() => 'timeout');
}

/**
 * Nudges the viewport until the layout is exactly contentWidth wide (scrollbar thickness can
 * differ from the live browser's). Returns {viewportWidth, clientWidth}.
 */
async function matchContentWidth(page) {
  let viewportWidth = width;
  let clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  for (let i = 0; i < 3 && clientWidth !== contentWidth; i += 1) {
    viewportWidth += contentWidth - clientWidth;
    // eslint-disable-next-line no-await-in-loop
    await page.setViewportSize({ width: viewportWidth, height: VIEWPORT_HEIGHT });
    // eslint-disable-next-line no-await-in-loop
    await sleep(300);
    // eslint-disable-next-line no-await-in-loop
    clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  }
  return { viewportWidth, clientWidth };
}

/** Document-coordinate boxes of the live-data widgets, clipped to the capture, deduplicated. */
function collectLiveBoxes({ selectors, maxH }) {
  const docWidth = document.documentElement.clientWidth;
  const seen = new Set();
  const boxes = [];
  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      const r = el.getBoundingClientRect();
      const x = Math.max(0, Math.floor(r.left + window.scrollX));
      const y = Math.max(0, Math.floor(r.top + window.scrollY));
      const x2 = Math.min(docWidth, Math.ceil(r.right + window.scrollX));
      const y2 = Math.min(maxH, Math.ceil(r.bottom + window.scrollY));
      const key = `${x},${y},${x2},${y2}`;
      if (x2 <= x || y2 <= y || seen.has(key)) return;
      seen.add(key);
      const box = {
        selector, x, y, width: x2 - x, height: y2 - y,
      };
      if (el.dataset.lhSource) box.source = el.dataset.lhSource;
      boxes.push(box);
    });
  });
  return boxes;
}

function collectMetrics() {
  const de = document.documentElement;
  const loaded = new Set();
  document.fonts.forEach((f) => {
    if (f.status === 'loaded') loaded.add(f.family.replace(/^["']|["']$/g, ''));
  });
  // CSS font-family names match case-insensitively (declared 'lufthansahead' = 'LufthansaHead')
  const loadedLower = new Set([...loaded].map((f) => f.toLowerCase()));
  const generic = ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'ui-sans-serif', 'ui-serif', '-apple-system'];
  const font = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const declared = getComputedStyle(el).fontFamily;
    const stack = declared.split(',').map((s) => s.trim().replace(/^["']|["']$/g, ''));
    // first family in the stack that is a loaded web font; otherwise a local/system fallback
    const web = stack.find((f) => loadedLower.has(f.toLowerCase()));
    return {
      declared,
      used: web || stack.find((f) => generic.includes(f)) || stack[0],
      webfont: Boolean(web),
    };
  };
  const imgs = [...document.images].filter((i) => i.currentSrc || i.getAttribute('src'));
  const visible = (sel) => [...document.querySelectorAll(sel)]
    .some((el) => el.offsetHeight > 0 && getComputedStyle(el).visibility !== 'hidden');
  let consent = null;
  try {
    consent = JSON.parse(localStorage.getItem('lh-consent'));
  } catch (e) {
    // unreadable
  }
  return {
    title: document.title,
    viewportWidth: window.innerWidth,
    clientWidth: de.clientWidth,
    scrollWidth: de.scrollWidth,
    consent,
    consentBannerVisible: visible('#onetrust-banner-sdk, #onetrust-pc-sdk, .lh-consent-banner, .lh-consent-pc'),
    // scripts/showcase-notice.js dialog (acknowledged via localStorage before load)
    showcaseNoticeVisible: visible('dialog.showcase-notice[open]')
      || de.classList.contains('showcase-notice-open'),
    // against the layout width, so a visible scrollbar does not hide an overflow
    horizontalOverflow: de.scrollWidth > de.clientWidth + 1,
    overflowPx: Math.max(0, de.scrollWidth - de.clientWidth),
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

  browser = await chromium.launch({
    headless: true,
    handleSIGTERM: false,
    handleSIGINT: false,
    // headless chromium hides scrollbars; the live captures had one
    ignoreDefaultArgs: withScrollbar ? ['--hide-scrollbars'] : [],
  });
  const context = await browser.newContext({
    viewport: { width, height: VIEWPORT_HEIGHT }, deviceScaleFactor: 1,
  });
  await context.addInitScript(initScript, {
    key: CONSENT_KEY, groups: CONSENT_GROUPS, showcaseKey: SHOWCASE_KEY, scrollbar: withScrollbar,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);

  const response = await page.goto(url, { waitUntil: 'load', timeout: navTimeout });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  const cookie = await dismissCookieDialog(page);
  // again, in case the page replaced <head>: the full-page screenshot stretches the viewport to
  // the document height, and only overflow-y: scroll keeps the scrollbar (and the layout width)
  if (withScrollbar) {
    await page.addStyleTag({ content: 'html { overflow-y: scroll !important; }' }).catch(() => {});
  }
  const layout = withScrollbar
    ? await matchContentWidth(page) : { viewportWidth: width, clientWidth: width };
  const waits = { blocks: await waitForBlocks(page), fonts: await waitForFonts(page) };
  await scrollThrough(page);
  waits.images = await waitForImages(page);
  waits.fontsAfterScroll = await waitForFonts(page);

  const metrics = await page.evaluate(collectMetrics);
  const height = Math.max(1, Math.min(metrics.scrollHeight, maxHeight));
  const liveBoxes = await page.evaluate(collectLiveBoxes, {
    selectors: LIVE_SELECTORS, maxH: height,
  });
  // the clip is the layout width, so a visible scrollbar is never part of the image
  const shotWidth = Math.min(metrics.clientWidth, layout.viewportWidth);
  await page.screenshot({
    path: out,
    fullPage: true,
    clip: {
      x: 0, y: 0, width: shotWidth, height,
    },
    timeout: 30000,
  });

  writeJsonAtomic(`${out}.json`, {
    url,
    finalUrl: page.url(),
    httpStatus: response ? response.status() : null,
    width,
    contentWidth,
    scrollbar: withScrollbar,
    capturedWidth: shotWidth,
    contentWidthMatched: shotWidth === contentWidth,
    capturedHeight: height,
    truncated: metrics.scrollHeight > maxHeight,
    cookieDialog: cookie,
    waits,
    capturedAt: new Date().toISOString(),
    ...metrics,
    liveSelectors: LIVE_SELECTORS,
    liveBoxes,
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
