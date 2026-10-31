/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, no-continue, max-len, no-loop-func, prefer-destructuring, import/extensions, import/prefer-default-export, import/no-extraneous-dependencies -- tooling */
/**
 * Captures Lufthansa Cargo's pages (lh-cargo) as rendered snapshots, as the delivery's batch 1:
 * through ONE Bright Data session (the project is bot-protected: .migration/project.json), one
 * page at a time, 5-10 s between pages; each page loaded, scrolled to the end (lazy images) and
 * saved with its scripts (the Matterport tours' URLs live there) to
 * content-sites/lh-cargo/snapshots/www.lufthansa-cargo.com/<source path>.html.
 * Stops at the first challenge, 403 or 429 and refuses to start again for 30 minutes (the stop
 * cargo-assets.mjs shares: content-sites/lh-cargo/source-blocked.json).
 * State (resumable: captured pages are skipped): content-sites/lh-cargo/capture-state.json,
 * per source path { status: ok | redirect | not-found | error, http, finalUrl, title, at }.
 * --resolve <file>: addresses only resolved (where does www send them: finalUrl), no snapshot
 * (www's shortcut addresses such as /products-general-cargo).
 *
 * Usage: node tools/importer/cargo-capture.mjs (--list <urls.txt> | --resolve <urls.txt>) [--max 120]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { HOST, sourcePath } from './cargo-paths.mjs';
import { blockedUntil, recordBlock, connectSource } from './cargo-assets.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
const W = path.join(root, 'content-sites/lh-cargo');
const SNAP = path.join(W, 'snapshots/www.lufthansa-cargo.com');
const STATE = path.join(W, 'capture-state.json');
const CHALLENGE = /just a moment|checking your browser|attention required|verifying you are human|performing security verification|^blocked$/i;
const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });
const pause = () => sleep(5000 + Math.floor(Math.random() * 5000));
const readJson = (f, d) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : d);
const writeJson = (f, v) => fs.writeFileSync(f, `${JSON.stringify(v, null, 1)}\n`);

/** The capture state (exported for cargo-import.mjs: pages that answer 404 or redirect on www). */
export const captureState = () => readJson(STATE, {});

async function main() {
  const resolveOnly = Boolean(opt('resolve'));
  const listFile = opt('resolve') || opt('list');
  if (!listFile) { console.log('usage: --list <urls.txt> | --resolve <urls.txt>'); process.exit(1); }
  const until = blockedUntil();
  if (until) { console.error(`blocked: no requests to www before ${until.toISOString()}`); process.exit(2); }
  if (readJson(path.join(root, '.migration/project.json'), {}).botProtected !== true) throw new Error('.migration/project.json: botProtected must be true before any request to the source');
  const state = captureState();
  const urls = fs.readFileSync(path.resolve(root, listFile), 'utf8').split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
    .map((u) => new URL(u, `${HOST}/`).href);
  const todo = urls.filter((u) => {
    const s = state[sourcePath(u)];
    return !s || s.status === 'error' || (resolveOnly ? false : s.status === 'resolved');
  }).slice(0, Number(opt('max', 1000)));
  console.log(`to ${resolveOnly ? 'resolve' : 'capture'}: ${todo.length} of ${urls.length}`);
  if (!todo.length) return 0;
  let browser = await connectSource();
  let page = await browser.newPage();
  let exit = 0;
  try {
    for (const [i, url] of todo.entries()) {
      if (i) await pause();
      const source = sourcePath(url);
      let http = null;
      const onResponse = (r) => { if (r.request().isNavigationRequest() && r.frame() === page.mainFrame()) http = r.status(); };
      page.on('response', onResponse);
      let error = null;
      try {
        await page.goto(url, { timeout: 60000, waitUntil: 'load' });
      } catch (e) {
        error = e.message.split('\n')[0];
        if (/Target closed|has been closed|disconnected|Session closed/i.test(error)) {
          // the session ended: a new one, and this page again
          await browser.close().catch(() => {});
          browser = await connectSource();
          page = await browser.newPage();
          state[source] = { status: 'error', error, at: new Date().toISOString() };
          writeJson(STATE, state);
          console.error(`${source}: ${error} (new session)`);
          continue;
        }
      }
      page.off('response', onResponse);
      const title = await page.title().catch(() => '');
      if (CHALLENGE.test(title) || http === 403 || http === 429) {
        recordBlock(`${source} ${http} ${title}`);
        console.error(`BLOCKED at ${source} (${http} "${title}"): stop for 30 minutes`);
        exit = 2;
        break;
      }
      const finalUrl = page.url();
      const finalPath = /^https:\/\/(www\.)?lufthansa-cargo\.com\//.test(finalUrl) ? sourcePath(finalUrl) : null;
      if (resolveOnly) {
        state[source] = {
          status: 'resolved', http, finalUrl, finalPath, title, at: new Date().toISOString(),
        };
        writeJson(STATE, state);
        console.log(`${http} ${source} -> ${finalUrl}`);
        continue;
      }
      if (!error) {
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 600) {
            window.scrollTo(0, y);
            await new Promise((r) => { setTimeout(r, 150); });
          }
          window.scrollTo(0, 0);
        }).catch(() => {});
        await sleep(1500);
      }
      let status = 'ok';
      if (http === 404) status = 'not-found';
      else if (error && !http) status = 'error';
      else if (finalPath !== source) status = 'redirect';
      const entry = {
        status, http, finalUrl, title, at: new Date().toISOString(), ...(error ? { error } : {}),
      };
      if (status === 'ok' || status === 'redirect') {
        const html = await page.content().catch(() => '');
        if (html) {
          const out = path.join(SNAP, `${source}.html`);
          fs.mkdirSync(path.dirname(out), { recursive: true });
          fs.writeFileSync(out, html);
          entry.bytes = html.length;
        } else entry.status = 'error';
      }
      state[source] = entry;
      writeJson(STATE, state);
      console.log(`${http} ${entry.status} ${source}${status === 'redirect' ? ` -> ${finalUrl}` : ''} "${title.slice(0, 60)}"`);
    }
  } finally {
    await browser.close().catch(() => {});
  }
  return exit;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(await main());
