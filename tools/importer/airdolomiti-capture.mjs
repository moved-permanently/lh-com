/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, no-continue, max-len, no-loop-func, prefer-destructuring, import/extensions, import/prefer-default-export -- tooling */
/**
 * Captures Air Dolomiti's pages (lh-airdolomiti) as rendered snapshots: through ONE Bright Data
 * session (.migration/project.json botProtected), one page at a time, 5-10 s between pages, per
 * page loaded, scrolled to the end and saved with its scripts (the page's WordPress blocks and
 * menus are in its __NEXT_DATA__) to
 * content-sites/lh-airdolomiti/snapshots/<host>/<path>.html (the homepage: index.html).
 * The three languages are three domains: www.airdolomiti.it, .eu (English), .de (German).
 * Stops at the first challenge, 403 or 429 and refuses to start again for 30 minutes
 * (content-sites/lh-airdolomiti/source-blocked.json, shared with airdolomiti-assets.mjs).
 * State (resumable: captured pages are skipped): content-sites/lh-airdolomiti/capture-state.json,
 * per URL { status: ok | redirect | not-found | error, http, finalUrl, title, at }.
 *
 * Usage: node tools/importer/airdolomiti-capture.mjs --list <urls.txt> [--max 100]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const W = path.join(root, 'content-sites/lh-airdolomiti');
const SNAP = path.join(W, 'snapshots');
const STATE = path.join(W, 'capture-state.json');
const BLOCK_FILE = path.join(W, 'source-blocked.json');
const CHALLENGE = /just a moment|checking your browser|attention required|verifying you are human|performing security verification|^blocked$|access denied/i;
const PAUSE_AFTER_BLOCK = 30 * 60 * 1000;
const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });
// a call on the page that never answers (a dead session) rejects after ms
const STALL = 60000;
const within = (promise, what) => {
  let timer;
  return Promise.race([promise, new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${what}: no answer in ${STALL / 1000} s (session stalled)`)), STALL);
  })]).finally(() => clearTimeout(timer));
};
const pause = () => sleep(5000 + Math.floor(Math.random() * 5000));
const readJson = (f, d) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : d);
const writeJson = (f, v) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, `${JSON.stringify(v, null, 1)}\n`); };

/** A source URL's key: host + path without query, hash and trailing slash. */
export const urlKey = (u) => {
  const x = new URL(u);
  return `${x.host}${x.pathname.replace(/\/+$/, '')}`;
};

/** The snapshot file of a source URL. */
export const snapshotFile = (u) => {
  const x = new URL(u);
  const p = x.pathname.replace(/\/+$/, '') || '/index';
  return path.join(SNAP, x.host, `${p}.html`);
};

/** The end of the 30 minutes' stop after the last challenge or block (null: none). */
export function blockedUntil() {
  const { at } = readJson(BLOCK_FILE, {});
  const t = at ? Date.parse(at) : 0;
  return t && Date.now() - t < PAUSE_AFTER_BLOCK ? new Date(t + PAUSE_AFTER_BLOCK) : null;
}

/** Records a challenge or block (every Air Dolomiti tool stops for 30 minutes). */
export function recordBlock(where) { writeJson(BLOCK_FILE, { at: new Date().toISOString(), where }); }

/** A Bright Data browser; its connect sometimes times out: up to three tries, 30 s apart. */
export async function connectSource() {
  const EXCAT = process.env.EXCAT_ROOT || '/home/node/.excat-marketplaces/excat-marketplace';
  const { connectBrowser } = await import(path.join(EXCAT, 'excat/skills/excat-scrape-webpage/scripts/browser-source.js'));
  for (let i = 1; ; i += 1) {
    try {
      return await connectBrowser('bd');
    } catch (e) {
      if (i >= 3) throw e;
      console.error(`Bright Data connect failed (${e.message.split('\n')[0]}): again in 30 s`);
      await sleep(30000);
    }
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
  const listFile = opt('list');
  if (!listFile) { console.log('usage: --list <urls.txt>'); return 1; }
  const until = blockedUntil();
  if (until) { console.error(`blocked: no requests to the source before ${until.toISOString()}`); return 2; }
  if (readJson(path.join(root, '.migration/project.json'), {}).botProtected !== true) throw new Error('.migration/project.json: botProtected must be true before any request to the source');
  const state = readJson(STATE, {});
  const urls = fs.readFileSync(path.resolve(root, listFile), 'utf8').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const todo = urls.filter((u) => !state[urlKey(u)] || state[urlKey(u)].status === 'error').slice(0, Number(opt('max', 1000)));
  console.log(`to capture: ${todo.length} of ${urls.length}`);
  if (!todo.length) return 0;
  let browser = await connectSource();
  let page = await browser.newPage();
  let exit = 0;
  const stalled = new Set();
  try {
    for (const [i, url] of todo.entries()) {
      if (i) await pause();
      const key = urlKey(url);
      let http = null;
      const onResponse = (r) => { if (r.request().isNavigationRequest() && r.frame() === page.mainFrame()) http = r.status(); };
      page.on('response', onResponse);
      let error = null;
      try {
        await page.goto(url, { timeout: 60000, waitUntil: 'load' });
      } catch (e) {
        error = e.message.split('\n')[0];
        if (/closed|disconnected/i.test(error)) {
          await browser.close().catch(() => {});
          browser = await connectSource();
          page = await browser.newPage();
          state[key] = { status: 'error', error, at: new Date().toISOString() };
          writeJson(STATE, state);
          console.error(`${key}: ${error} (new session)`);
          continue;
        }
      }
      page.off('response', onResponse);
      let title = '';
      let html = '';
      try {
        title = await within(page.title(), 'title');
        if (!error) {
          await within(page.evaluate(async () => {
            for (let y = 0; y < document.body.scrollHeight && y < 60000; y += 700) {
              window.scrollTo(0, y);
              await new Promise((r) => { setTimeout(r, 120); });
            }
            window.scrollTo(0, 0);
          }).catch(() => {}), 'scroll');
          await sleep(1200);
        }
        html = await within(page.content(), 'content');
      } catch (e) {
        // the session stalled: a new session, and this page once more at the end of the list
        await browser.close().catch(() => {});
        browser = await connectSource();
        page = await browser.newPage();
        state[key] = { status: 'error', error: e.message, at: new Date().toISOString() };
        writeJson(STATE, state);
        const again = !stalled.has(key);
        stalled.add(key);
        if (again) todo.push(url);
        console.error(`${key}: ${e.message} (new session${again ? ', again at the end' : ''})`);
        continue;
      }
      if (CHALLENGE.test(title) || http === 403 || http === 429) {
        recordBlock(`${url} ${http} ${title}`);
        console.error(`BLOCKED at ${url} (${http} "${title}"): stop for 30 minutes`);
        exit = 2;
        break;
      }
      const finalUrl = page.url();
      let status = 'ok';
      if (http === 404) status = 'not-found';
      else if (error && !http) status = 'error';
      else if (urlKey(finalUrl) !== key) status = 'redirect';
      const entry = {
        status, http, finalUrl, title, at: new Date().toISOString(), ...(error ? { error } : {}),
      };
      if (status === 'ok' || status === 'redirect') {
        if (html && /__NEXT_DATA__/.test(html)) {
          const out = snapshotFile(url);
          fs.mkdirSync(path.dirname(out), { recursive: true });
          fs.writeFileSync(out, html);
          entry.bytes = html.length;
        } else entry.status = 'error';
      }
      state[key] = entry;
      writeJson(STATE, state);
      console.log(`${http} ${entry.status} ${key}${status === 'redirect' ? ` -> ${finalUrl}` : ''} "${title.slice(0, 60)}"`);
    }
  } finally {
    await browser.close().catch(() => {});
  }
  return exit;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(await main());
