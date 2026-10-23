/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, max-len, import/no-unresolved, import/extensions */
/**
 * Records www.lufthansa.com API answers (GET, JSON) through ONE warm Bright Data session, as
 * page navigations: no UI, nothing typed or submitted.
 *
 * Like tools/importer/bd-session.mjs, the session opens /de/en/homepage first and lets the
 * Cloudflare challenge settle, then navigates the same page to each API URL, one every
 * 5-10 s, with the market's X-Portal-* request headers (scripts/lh-data.js portalHeaders,
 * page.setExtraHTTPHeaders) and the market's page as Referer. Only status 200 JSON answers are
 * saved, one line each, to tools/source-export/api/bd-record-api/{cc}-{ll}.ndjson in the
 * format tools/importer/record-live-data.mjs reads (method, url, status, text, locale,
 * referer, recordedAt). Run record-live-data.mjs afterwards to update data/recorded/.
 *
 * A Cloudflare challenge or a 403 HTML page stops the run at once (exit 2, no retry).
 * Status 2026-10-23: the Bright Data Browser API forbids overriding the X-Portal-* headers
 * (Network.setExtraHTTPHeaders: "Overriding X-Portal, X-Portal-Site, ... headers forbidden",
 * docs.brightdata.com/products/scraping-browser/error-codes#access-and-permissions), so the run
 * stops before the first API URL; nothing was requested or recorded (lounges, and again for
 * --set poi: 0 of 52 requested).
 *
 * Usage: node tools/importer/bd-record-api.mjs (--set lounges | --set poi | --list urls.txt | --url <url> ...)
 *          [--locale de/en] [--referer <url>] [--min-delay 5000] [--max-delay 10000]
 *   --set lounges   the 36 lounge finder answers (blocks/lounge-finder/README.md "Recording")
 *   --set poi       the 52 pointsOfInterest answers (blocks/poi-map/README.md "Recording")
 *   --list/--url    URLs of one market (--locale, default de/en)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { portalHeaders } from '../../scripts/lh-data.js';

const EXCAT = process.env.EXCAT_ROOT || '/home/node/.excat-marketplaces/excat-marketplace';
const SCRAPE = path.join(EXCAT, 'excat/skills/excat-scrape-webpage/scripts');
const { connectBrowser } = await import(path.join(SCRAPE, 'browser-source.js'));

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const opt = (name, def) => (argv.includes(`--${name}`) ? argv[argv.indexOf(`--${name}`) + 1] : def);
const LIVE = 'https://www.lufthansa.com';
const ANCHOR = `${LIVE}/de/en/homepage`;
const CHALLENGE = /just a moment|checking your browser|attention required|verifying you are human|performing security verification/i;
const minDelay = Number(opt('min-delay', 5000));
const maxDelay = Number(opt('max-delay', 10000));
const outDir = path.join(root, 'tools/source-export/api/bd-record-api');

/** The lounge finder answers: 6 statuses x the market's cities. */
function loungeJobs() {
  const STATUSES = ['FIR', 'BUS', 'HON', 'SEN', 'FTL', 'STA'];
  const CITIES = {
    'de/de': ['FRA', 'MUC'], 'de/en': ['FRA', 'MUC'], 'at/de': ['VIE'], 'gb/en': ['LON'],
  };
  return Object.entries(CITIES).flatMap(([locale, cities]) => cities.flatMap((city) => STATUSES.map((status) => ({
    locale,
    url: `${LIVE}/service/api/catalogs/lounges/${status}/${city}`,
    referer: `${LIVE}/${locale}/lounges`,
  }))));
}

/**
 * The 52 pointsOfInterest answers (blocks/poi-map/README.md "Recording"): every URL listed there,
 * with the market and the map's page (Referer) from the decoded JCR path of its id.
 */
function poiJobs() {
  const readme = fs.readFileSync(path.join(root, 'blocks/poi-map/README.md'), 'utf8');
  const urls = [...new Set(readme.match(/https:\/\/www\.lufthansa\.com\/service\/api\/pointsOfInterest\/[A-Za-z0-9+/=%]+/g) || [])];
  return urls.map((url) => {
    const id = decodeURIComponent(url.split('/pointsOfInterest/')[1]);
    const jcr = Buffer.from(id, 'base64').toString('utf8');
    const m = jcr.match(/^\/content\/lh\/markets\/([a-z]{2})\/([a-z]{2})\/(.+?)\/jcr:content\//);
    if (!m) throw new Error(`poi: cannot read the JCR path of ${url}`);
    // the first-class page lives under prepare-for-your-trip/travel-classes/ in AEM only
    const page = m[3].replace(/^prepare-for-your-trip\/travel-classes\/first-class$/, 'first-class');
    return { locale: `${m[1]}/${m[2]}`, url, referer: `${LIVE}/${m[1]}/${m[2]}/${page}` };
  });
}

let jobs;
if (opt('set') === 'lounges') {
  jobs = loungeJobs();
} else if (opt('set') === 'poi') {
  jobs = poiJobs();
} else {
  const locale = opt('locale', 'de/en');
  const list = opt('list');
  const urls = (list
    ? fs.readFileSync(path.resolve(root, list), 'utf8').split(/\r?\n/)
    : argv.flatMap((a, i) => (a === '--url' ? [argv[i + 1]] : []))).map((u) => u.trim()).filter(Boolean);
  jobs = urls.map((url) => ({ locale, url, referer: opt('referer', `${LIVE}/${locale}/homepage`) }));
}
if (!jobs.length) {
  console.error('bd-record-api: no URLs (use --set lounges, --list or --url)');
  process.exit(1);
}
const bad = jobs.filter((j) => new URL(j.url).hostname !== 'www.lufthansa.com' || !Object.keys(portalHeaders(j.locale)).length);
if (bad.length) {
  console.error(`bd-record-api: not a www.lufthansa.com URL of a known market: ${bad.map((j) => j.url).join(', ')}`);
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });
const hardTimer = setTimeout(() => {
  console.error('bd-record-api: hard timeout');
  process.exit(124);
}, 180000 + jobs.length * (maxDelay + 60000));
hardTimer.unref();

/** Navigates; returns the main response (status, content type, body) and the page title. */
async function open(page, url, referer) {
  let resp = null;
  try {
    resp = await page.goto(url, { timeout: 90000, referer });
  } catch (e) {
    console.error(`  navigation interrupted (${e.message.split('\n')[0]})`);
  }
  const title = await page.title().catch(() => '');
  const status = resp ? resp.status() : null;
  const type = resp ? (resp.headers()['content-type'] || '') : '';
  let text = resp ? await resp.text().catch(() => null) : null;
  // a JSON document rendered by the browser: its body text is the answer
  if (text === null && /json/.test(type)) text = await page.evaluate(() => document.body && document.body.innerText).catch(() => null);
  return {
    status, type, text, title,
  };
}

const counts = { saved: 0, skipped: 0 };
let stopped = null;
const browser = await connectBrowser('bd');
try {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 }).catch(() => {});

  console.log(`bd-record-api: warming up on ${ANCHOR}`);
  await page.goto(ANCHOR, { timeout: 90000 }).catch((e) => console.error(`  navigation interrupted (${e.message.split('\n')[0]})`));
  for (let i = 0; i < 60 && CHALLENGE.test(await page.title().catch(() => 'just a moment')); i += 1) await sleep(1000);
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  if (CHALLENGE.test(await page.title().catch(() => ''))) throw new Error('warm-up page still behind the challenge');
  await sleep(minDelay + Math.random() * (maxDelay - minDelay));

  fs.mkdirSync(outDir, { recursive: true });
  for (const job of jobs) {
    const navStart = Date.now();
    try {
      await page.setExtraHTTPHeaders(portalHeaders(job.locale));
    } catch (e) {
      // Bright Data's Browser API refuses to override these headers (2026-10-23:
      // "Overriding X-Portal, ... headers forbidden"); without them the answer is not the
      // market's, so nothing is requested
      stopped = `X-Portal-* headers refused by the browser (${e.message.split('\n')[0]})`;
      break;
    }
    const r = await open(page, job.url, job.referer);
    const html = /html/.test(r.type) || /^\s*</.test(r.text || '');
    if (CHALLENGE.test(r.title) || (html && /cloudflare|cf-chl|challenge-platform/i.test(r.text || ''))) {
      stopped = `Cloudflare challenge at ${job.url} (${r.status}, title "${r.title}")`;
      break;
    }
    if (r.status === 403 && html) {
      stopped = `403 HTML page at ${job.url} (title "${r.title}")`;
      break;
    }
    let json = false;
    try { JSON.parse(r.text); json = true; } catch (e) { json = false; }
    if (r.status === 200 && json) {
      fs.appendFileSync(path.join(outDir, `${job.locale.replace('/', '-')}.ndjson`), `${JSON.stringify({
        method: 'GET', url: job.url, status: 200, text: r.text, locale: job.locale, referer: job.referer, recordedAt: new Date().toISOString(),
      })}\n`);
      counts.saved += 1;
      console.log(`200 ${job.locale} ${job.url} (${r.text.length} B)`);
    } else {
      counts.skipped += 1;
      console.log(`${r.status} ${job.locale} ${job.url} not saved (${r.type || 'no type'}${json ? '' : ', not JSON'}): ${(r.text || '').replace(/\s+/g, ' ').slice(0, 160)}`);
    }
    await sleep(Math.max(0, navStart + minDelay + Math.random() * (maxDelay - minDelay) - Date.now()));
  }
} finally {
  await browser.close().catch(() => {});
}
console.log(`bd-record-api: ${counts.saved} saved, ${counts.skipped} not saved, ${jobs.length - counts.saved - counts.skipped} not requested${stopped ? `; STOPPED: ${stopped}` : ''}`);
process.exit(stopped ? 2 : 0);
