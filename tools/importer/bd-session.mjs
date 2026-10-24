/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, max-len, import/no-unresolved, import/extensions */
/**
 * Captures www.lufthansa.com pages through ONE warm Bright Data browser session.
 *
 * The session opens /de/en/homepage first and lets the Cloudflare challenge settle, then
 * navigates the same page to each URL, so the clearance from the first visit is reused.
 * One page every 5-10 s. Per page it saves:
 *   tools/importer/bd-snapshots/www.lufthansa.com/{path}.html   raw rendered HTML (import input)
 *   tools/source-export/pages/{path}/cleaned.html, metadata.json, screenshot.png (1440 px, max 8000 px)
 *   tools/source-export/pages/{path}.model.json                 AEM component tree, with --model
 *     (Cloudflare challenges in-page fetch() of .model.json, so it is off by default)
 * Pages that already have a snapshot are never fetched again (unless --force).
 * A block ends the session (exit 2); a new run starts a new warm session.
 *
 * Usage: node tools/importer/bd-session.mjs (--list urls.txt | --url <url> ...) [--batch 20]
 *          [--model] [--force] [--min-delay 5000] [--max-delay 10000] [--widths 1440,768,390]
 *          [--parity-list urls-parity.txt] [--since 2026-10-21T18:46:00Z]
 * Screenshots: screenshot.png (1440) plus screenshot-{width}.png for each extra width, for the
 * parity check, so a page is never loaded again just for a screenshot.
 * --shots-only: a recapture for the parity check (pages whose screenshots were faulty: missed lazy
 *   images at 768/390, an unstyled render): only the screenshots are replaced; the import input
 *   (snapshot, cleaned.html, metadata.json) stays as captured, the new rendered HTML goes to
 *   tools/source-export/recapture/{path}.html and the time to {page dir}/recapture.json.
 *   Implies --force for the listed URLs (still one page every 5-10 s).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const EXCAT = process.env.EXCAT_ROOT || '/home/node/.excat-marketplaces/excat-marketplace';
const SCRAPE = path.join(EXCAT, 'excat/skills/excat-scrape-webpage/scripts');
const UPSTREAM = path.join(EXCAT, 'edge-delivery-services/skills/scrape-webpage/scripts');
const { connectBrowser } = await import(path.join(SCRAPE, 'browser-source.js'));
const { detectBlocked } = await import(path.join(SCRAPE, 'bot-detection.js'));
const { stripScripts } = await import(path.join(SCRAPE, 'strip-scripts.js'));
const { snapshotPathFor } = await import(path.join(SCRAPE, 'bd-scrape.js'));
const { extractCleanedHTML, extractMetadata, scrollToTriggerLazyLoad } = await import(path.join(UPSTREAM, 'analyze-webpage.js'));
const { generateDocumentPathInfo } = await import(path.join(UPSTREAM, 'generate-path.js'));

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const opt = (name, def) => (argv.includes(`--${name}`) ? argv[argv.indexOf(`--${name}`) + 1] : def);
const has = (name) => argv.includes(`--${name}`);
const ANCHOR = 'https://www.lufthansa.com/de/en/homepage';
const CHALLENGE = /just a moment|checking your browser|attention required|verifying you are human|performing security verification/i;
const MAX_HEIGHT = 8000;
const batch = Number(opt('batch', 20));
const minDelay = Number(opt('min-delay', 5000));
const maxDelay = Number(opt('max-delay', 10000));
// --format jpg: smaller screenshots travel faster from the remote browser
const shotExt = opt('format', 'png') === 'jpg' ? 'jpg' : 'png';
const widths = opt('widths', '1440').split(',').map(Number).filter(Boolean);
// extra widths only for these URLs (the parity scope); every other page gets 1440 only
const parityFile = opt('parity-list');
const parity = parityFile ? new Set(fs.readFileSync(path.resolve(root, parityFile), 'utf8').split(/\r?\n/).map((u) => u.trim()).filter(Boolean)) : null;
const widthsFor = (url) => (!parity || parity.has(url) ? widths : [1440]);

/** Scrolls down in viewport steps so lazy images at this width load (max 8000 px). */
async function quickScroll(page) {
  await page.evaluate(async (max) => {
    const step = Math.max(300, Math.floor(window.innerHeight * 0.8));
    const end = Math.min(document.documentElement.scrollHeight, max);
    for (let y = 0; y < end; y += step) {
      window.scrollTo(0, y);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => { setTimeout(r, 250); });
    }
    // the images this width asked for (responsive sources), at most 6 s
    const until = Date.now() + 6000;
    while (Date.now() < until && [...document.images].some((im) => !im.complete)) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => { setTimeout(r, 200); });
    }
    window.scrollTo(0, 0);
  }, MAX_HEIGHT).catch(() => {});
}
const stateFile = path.join(root, 'tools/source-export/bd-session-state.json');
// API responses the live page loads by itself while it is captured (no extra requests);
// tools/importer/record-live-data.mjs turns them into data/recorded/
const apiDir = path.join(root, 'tools/source-export/api');
const RECORDABLE = /^\/(service\/api\/(suggestions|catalogs|defaultAirport|labels|lhg-fare-teaser|destinationfinder)|aircore\/(weather|geolocation))(\/|$)/;
let pageResponses = [];
const pagesDir = path.join(root, 'tools/source-export/pages');

const listFile = opt('list');
const urls = (listFile
  ? fs.readFileSync(path.resolve(root, listFile), 'utf8').split(/\r?\n/)
  : argv.flatMap((a, i) => (a === '--url' ? [argv[i + 1]] : []))).map((u) => u.trim()).filter(Boolean);

const state = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, 'utf8')) : { pages: {} };
const saveState = () => {
  fs.mkdirSync(path.dirname(stateFile), { recursive: true });
  fs.writeFileSync(`${stateFile}.tmp`, JSON.stringify(state, null, 1));
  fs.renameSync(`${stateFile}.tmp`, stateFile);
};
const snapshotOf = (url) => snapshotPathFor(url, root, process.env.BD_SNAPSHOT_DIR);
const captured = (url) => fs.existsSync(snapshotOf(url)) || ['404', 'error-page'].includes(state.pages[url]?.status)
  || (state.pages[url]?.status === 'net-error' && state.pages[url].attempts >= 3);
// --since <ISO>: redo only pages whose last capture is older (e.g. after a capture fix), so a
// long redo list advances instead of starting over
const since = opt('since') ? Date.parse(opt('since')) : null;
const stale = (u) => since !== null && state.pages[u]?.status === 'ok' && Date.parse(state.pages[u].at) < since;
const shotsOnly = has('shots-only');
const recaptured = (u) => {
  const f = path.join(pagesDir, new URL(u).pathname.replace(/^\/|\/$/g, '') || 'index', 'recapture.json');
  return fs.existsSync(f) && since !== null && Date.parse(JSON.parse(fs.readFileSync(f, 'utf8')).at) >= since;
};
const pending = urls.filter((u) => (shotsOnly ? !recaptured(u) : has('force') || !captured(u) || stale(u))).slice(0, batch);
if (!pending.length) {
  console.log(`bd-session: nothing to do (${urls.length} URLs already captured)`);
  process.exit(0);
}

const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });
const hardTimer = setTimeout(() => {
  console.error('bd-session: hard timeout');
  saveState();
  process.exit(124);
}, 120000 + pending.length * (maxDelay + 90000));
hardTimer.unref();

let mainStatus = null;
const T0 = { t: Date.now() };
const lap = (label) => { if (process.env.BD_TIMING) console.log(`  ${label} ${((Date.now() - T0.t) / 1000).toFixed(1)}s`); T0.t = Date.now(); };

/** Navigates the page and waits until the Cloudflare interstitial is gone. */
async function open(page, url) {
  mainStatus = null;
  try {
    const resp = await page.goto(url, { timeout: 90000 });
    if (resp && mainStatus === null) mainStatus = resp.status();
  } catch (e) {
    // the challenge solves by navigating the frame, which detaches it mid-goto
    console.error(`  navigation interrupted (${e.message.split('\n')[0]})`);
  }
  const title = () => page.title().catch(() => 'just a moment');
  for (let i = 0; i < 60 && (CHALLENGE.test(await title()) || !(await title())); i += 1) await sleep(1000);
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  // stylesheets and fonts (AirCore loads its CSS late; without this the capture is unstyled)
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
  await sleep(1500);
  return { title: await title(), status: mainStatus };
}

async function dismissCookies(page) {
  await page.evaluate(() => {
    const btn = document.querySelector('#onetrust-reject-all-handler, #onetrust-accept-btn-handler');
    if (btn) btn.click();
    document.querySelector('#onetrust-consent-sdk')?.remove();
  }).catch(() => {});
}

let blocked = false;
let ok = 0;
const browser = await connectBrowser('bd');
try {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 }).catch(() => {});
  page.on('response', (r) => {
    if (r.request().isNavigationRequest() && r.frame() === page.mainFrame()) mainStatus = r.status();
    let u;
    try { u = new URL(r.url()); } catch (e) { return; }
    if (u.hostname !== 'www.lufthansa.com' || !RECORDABLE.test(u.pathname) || r.status() !== 200) return;
    const req = r.request();
    pageResponses.push(r.text().then((text) => ({
      method: req.method(), url: r.url(), body: req.postData() || undefined, status: r.status(), text,
    })).catch(() => null));
  });

  console.log(`bd-session: warming up on ${ANCHOR}`);
  const warm = await open(page, ANCHOR);
  if (CHALLENGE.test(warm.title)) throw new Error('warm-up page still behind the challenge');
  await sleep(minDelay);

  for (const url of pending) {
    const navStart = Date.now();
    pageResponses = [];
    state.inflight = { url, startedAt: new Date().toISOString() };
    saveState();
    T0.t = Date.now();
    // --shots-only without 1440: the page loads at its first width (one navigation per page)
    const firstWidth = shotsOnly && !widthsFor(url).includes(1440) ? widthsFor(url)[0] : 1440;
    if (firstWidth !== 1440) await page.setViewportSize({ width: firstWidth, height: 900 }).catch(() => {});
    const nav = await open(page, url);
    lap('open');
    const detection = await detectBlocked(page, { status: () => nav.status });
    if (detection.isBotProtection || CHALLENGE.test(nav.title)) {
      blocked = true;
      state.pages[url] = {
        status: 'blocked', http: nav.status, type: detection.type, at: new Date().toISOString(),
      };
      console.error(`bd-session: BLOCKED at ${url} (${nav.status} ${detection.type || ''}); ending session`);
      break;
    }
    // the browser's own error page (proxy tunnel failure, DNS): the page never loaded, so
    // nothing is saved and the URL stays pending for a later session
    const netError = nav.status === null && await page.evaluate(() => Boolean(document.querySelector('#offline-resources, #main-frame-error'))
      || /ERR_[A-Z_]+/.test(document.body?.innerText || '')).catch(() => false);
    if (netError) {
      state.pages[url] = { status: 'net-error', attempts: (state.pages[url]?.attempts || 0) + 1, at: new Date().toISOString() };
      console.log(`net-error ${url} (not saved; retried in a later session)`);
    } else if (detection.isError || nav.status === 404) {
      state.pages[url] = { status: nav.status === 404 ? '404' : 'error-page', http: nav.status, at: new Date().toISOString() };
      console.log(`${nav.status} error page ${url}`);
    } else {
      // script loaders as on the live page (snapshots are saved without scripts): OneTrust
      // stub and domain config, consent wiring
      const scripts = await page.evaluate(() => ({
        external: [...document.scripts].filter((sc) => sc.src).map((sc) => ({
          src: sc.src,
          attrs: Object.fromEntries([...sc.attributes].filter((a) => a.name !== 'src').map((a) => [a.name, a.value])),
        })),
        inline: [...document.scripts].filter((sc) => !sc.src && /cookielaw|onetrust|optanon/i.test(sc.textContent))
          .map((sc) => sc.textContent.slice(0, 600)),
        oneTrust: window.OneTrust ? {
          version: window.OneTrust.GetDomainData ? window.OneTrust.GetDomainData().cctId || null : null,
          lang: document.documentElement.getAttribute('lang'),
        } : null,
      })).catch(() => null);
      await dismissCookies(page);
      await scrollToTriggerLazyLoad(page).catch(() => {});
      await sleep(1000);
      lap('lazy-scroll');
      const { pathname } = new URL(url);
      const dir = path.join(pagesDir, pathname.replace(/^\/|\/$/g, '') || 'index');
      fs.mkdirSync(dir, { recursive: true });

      const raw = stripScripts(await page.content());
      const snap = shotsOnly
        ? path.join(root, 'tools/source-export/recapture', `${pathname.replace(/\/$/, '') || '/index'}.html`)
        : snapshotOf(url);
      fs.mkdirSync(path.dirname(snap), { recursive: true });
      fs.writeFileSync(snap, raw);
      if (shotsOnly) await quickScroll(page);
      lap('snapshot');

      const pageWidths = widthsFor(url);
      for (const width of pageWidths) {
        if (width !== 1440) {
          await page.setViewportSize({ width, height: 900 }).catch(() => {});
          if (shotsOnly && width !== firstWidth) {
            // a fresh load at this width: the DCEP moving images remount on a resize and never
            // load their new source (/gb/en/flight-search 768: SIXT and teaser images missing);
            // one navigation every 5-10 s still holds
            await sleep(minDelay + Math.random() * (maxDelay - minDelay));
            await page.reload({ timeout: 90000, waitUntil: 'load' }).catch(() => {});
            await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
            await dismissCookies(page);
          } else await sleep(800);
          await quickScroll(page);
          await sleep(500);
        }
        const height = await page.evaluate(() => document.documentElement.scrollHeight).catch(() => 900);
        await page.evaluate(() => window.scrollTo(0, 0)).catch(() => {});
        await page.screenshot({
          path: path.join(dir, `${width === 1440 ? 'screenshot' : `screenshot-${width}`}.${shotExt}`),
          ...(shotExt === 'jpg' ? { type: 'jpeg', quality: 85 } : {}),
          fullPage: true,
          clip: {
            x: 0, y: 0, width, height: Math.min(height, MAX_HEIGHT),
          },
        }).catch((e) => console.error(`  screenshot ${width} failed: ${e.message.split('\n')[0]}`));
        lap(`shot ${width}`);
      }
      if (firstWidth !== 1440 || pageWidths.some((w) => w !== 1440)) await page.setViewportSize({ width: 1440, height: 900 }).catch(() => {});
      const alternates = await page.evaluate(() => [...document.querySelectorAll('link[rel="alternate"][hreflang]')]
        .map((l) => ({ hreflang: l.getAttribute('hreflang'), href: l.href }))).catch(() => []);
      // last: extractCleanedHTML mutates the live page (removes <style>, strips attributes), so
      // anything that renders or reads the page must happen before it
      if (!shotsOnly) fs.writeFileSync(path.join(dir, 'cleaned.html'), await extractCleanedHTML(page));

      let model = null;
      if (has('model') && !pathname.startsWith('/lhg/')) {
        model = await page.evaluate(async (u) => {
          const r = await fetch(u, { credentials: 'include' });
          return { status: r.status, type: r.headers.get('content-type') || '', text: await r.text() };
        }, `${pathname.replace(/\/$/, '')}.model.json`).catch(() => null);
        if (model?.status === 200 && model.type.includes('json')) {
          fs.writeFileSync(path.join(pagesDir, `${pathname.replace(/^\/|\/$/g, '')}.model.json`), model.text);
        }
      }

      const paths = generateDocumentPathInfo(url);
      if (shotsOnly) {
        fs.writeFileSync(path.join(dir, 'recapture.json'), `${JSON.stringify({
          url, at: new Date().toISOString(), widths: pageWidths, html: path.relative(root, snap),
        }, null, 1)}\n`);
      } else {
        fs.writeFileSync(path.join(dir, 'metadata.json'), JSON.stringify({
          url,
          source: 'bd-session',
          timestamp: new Date().toISOString(),
          paths,
          screenshot: path.join(dir, 'screenshot.png'),
          html: { filePath: path.join(dir, 'cleaned.html') },
          rawHtml: { filePath: snap, size: raw.length },
          metadata: await extractMetadata(page).catch(() => ({})),
          images: { mapping: {} },
          alternates,
          scripts,
          screenshots: pageWidths,
        }, null, 2));
      }
      const recorded = (await Promise.all(pageResponses)).filter(Boolean);
      if (recorded.length) {
        const locale = (pathname.replace(/^\/lhg/, '').match(/^\/([a-z]{2}\/[a-z]{2})\//) || [])[1] || null;
        fs.mkdirSync(apiDir, { recursive: true });
        fs.appendFileSync(path.join(apiDir, `${(locale || 'unknown').replace('/', '-')}.ndjson`), recorded
          .map((r) => `${JSON.stringify({
            ...r, locale, referer: url, recordedAt: new Date().toISOString(),
          })}\n`).join(''));
      }
      state.pages[url] = {
        status: 'ok',
        api: recorded.length,
        http: nav.status,
        model: model?.status ?? null,
        // why a component tree was refused: a Cloudflare page (text/html) or AEM itself
        ...(model && model.status !== 200 ? { modelType: model.type, modelSnippet: model.text.slice(0, 160) } : {}),
        at: new Date().toISOString(),
      };
      ok += 1;
      console.log(`${nav.status} ok ${url} (model ${model?.status ?? '-'}, ${raw.length} B)`);
    }
    delete state.inflight;
    saveState();
    // one navigation every 5-10 s at most, counted from the previous navigation's start
    await sleep(Math.max(0, navStart + minDelay + Math.random() * (maxDelay - minDelay) - Date.now()));
  }
} finally {
  saveState();
  await browser.close().catch(() => {});
}
const left = urls.filter((u) => !captured(u)).length;
console.log(`bd-session: ${ok}/${pending.length} captured, ${left} left${blocked ? ', BLOCKED' : ''}`);
process.exit(blocked ? 2 : 0);
