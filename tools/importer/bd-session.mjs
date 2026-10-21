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
 *          [--model] [--force] [--min-delay 5000] [--max-delay 10000]
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
const stateFile = path.join(root, 'tools/source-export/bd-session-state.json');
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
const captured = (url) => fs.existsSync(snapshotOf(url)) || ['404', 'error-page'].includes(state.pages[url]?.status);
const pending = urls.filter((u) => has('force') || !captured(u)).slice(0, batch);
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
  await sleep(2000);
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
  });

  console.log(`bd-session: warming up on ${ANCHOR}`);
  const warm = await open(page, ANCHOR);
  if (CHALLENGE.test(warm.title)) throw new Error('warm-up page still behind the challenge');
  await sleep(minDelay);

  for (const url of pending) {
    state.inflight = { url, startedAt: new Date().toISOString() };
    saveState();
    const nav = await open(page, url);
    const detection = await detectBlocked(page, { status: () => nav.status });
    if (detection.isBotProtection || CHALLENGE.test(nav.title)) {
      blocked = true;
      state.pages[url] = {
        status: 'blocked', http: nav.status, type: detection.type, at: new Date().toISOString(),
      };
      console.error(`bd-session: BLOCKED at ${url} (${nav.status} ${detection.type || ''}); ending session`);
      break;
    }
    if (detection.isError || nav.status === 404) {
      state.pages[url] = { status: nav.status === 404 ? '404' : 'error-page', http: nav.status, at: new Date().toISOString() };
      console.log(`${nav.status} error page ${url}`);
    } else {
      await dismissCookies(page);
      await scrollToTriggerLazyLoad(page).catch(() => {});
      await sleep(1000);
      const { pathname } = new URL(url);
      const dir = path.join(pagesDir, pathname.replace(/^\/|\/$/g, '') || 'index');
      fs.mkdirSync(dir, { recursive: true });

      const raw = stripScripts(await page.content());
      const snap = snapshotOf(url);
      fs.mkdirSync(path.dirname(snap), { recursive: true });
      fs.writeFileSync(snap, raw);
      fs.writeFileSync(path.join(dir, 'cleaned.html'), await extractCleanedHTML(page));

      const height = await page.evaluate(() => document.documentElement.scrollHeight).catch(() => 900);
      await page.evaluate(() => window.scrollTo(0, 0)).catch(() => {});
      await page.screenshot({
        path: path.join(dir, 'screenshot.png'),
        fullPage: true,
        clip: {
          x: 0, y: 0, width: 1440, height: Math.min(height, MAX_HEIGHT),
        },
      }).catch((e) => console.error(`  screenshot failed: ${e.message.split('\n')[0]}`));

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
      }, null, 2));
      state.pages[url] = {
        status: 'ok',
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
    await sleep(minDelay + Math.random() * (maxDelay - minDelay));
  }
} finally {
  saveState();
  await browser.close().catch(() => {});
}
const left = urls.filter((u) => !captured(u)).length;
console.log(`bd-session: ${ok}/${pending.length} captured, ${left} left${blocked ? ', BLOCKED' : ''}`);
process.exit(blocked ? 2 : 0);
