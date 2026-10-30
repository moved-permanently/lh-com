/* eslint-disable no-console, no-await-in-loop, import/no-unresolved, import/extensions */
/**
 * Fetches same-origin www.lufthansa.com URLs (.model.json, sitemaps, /service/api/*) from
 * inside a live page opened over the Bright Data browser (the site is bot-protected, see
 * .migration/project.json). Writes NDJSON bundles in the format of export-in-browser.js;
 * `node tools/importer/serve-export.mjs --unpack` expands them into tools/source-export/.
 * Resumable: URLs already fetched are skipped. Stops at the first Cloudflare block.
 *
 * Usage: node tools/importer/bd-fetch.mjs (--list urls.txt | --url <url> ...) [--batch 60]
 *          [--delay 2500] [--anchor https://www.lufthansa.com/de/en/homepage]
 *          [--post '<json body>'] (POST body for every --url, for fare-teaser calls)
 *          [--wait-until domcontentloaded] (the anchor's goto; default load)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRAPE_DIR = process.env.EXCAT_SCRAPE_DIR
  || '/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-scrape-webpage/scripts';
const { connectBrowser } = await import(path.join(SCRAPE_DIR, 'browser-source.js'));

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const opt = (name, def) => (argv.includes(`--${name}`) ? argv[argv.indexOf(`--${name}`) + 1] : def);
const urlArgs = argv.flatMap((a, i) => (a === '--url' ? [argv[i + 1]] : []));
const batch = Number(opt('batch', 60));
const delay = Number(opt('delay', 2500));
const anchor = opt('anchor', 'https://www.lufthansa.com/de/en/homepage');
// --wait-until domcontentloaded: a site whose load event never comes (www.ita-airways.com)
const waitUntil = opt('wait-until', 'load');
const post = opt('post');
const outDir = path.join(root, 'tools/source-export/bundles');
const stateFile = path.join(root, 'tools/source-export/bd-fetch-state.json');
// ^blocked$: www.ita-airways.com's block page (403, title "Blocked")
const CHALLENGE = /just a moment|checking your browser|attention required|verifying you are human|^blocked$/i;

const listFile = opt('list');
const urls = listFile
  ? fs.readFileSync(path.resolve(root, listFile), 'utf8').split(/\r?\n/).map((u) => u.trim()).filter(Boolean)
  : urlArgs;
const state = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, 'utf8')) : { done: {} };
const keyOf = (u) => (post ? `POST ${u} ${post}` : u);
const pending = urls.filter((u) => !state.done[keyOf(u)]).slice(0, batch);
if (!pending.length) {
  console.log(`bd-fetch: nothing to do (${urls.length} URLs already fetched)`);
  process.exit(0);
}

fs.mkdirSync(outDir, { recursive: true });
const bundle = path.join(outDir, `bd-${new Date().toISOString().replace(/[:.]/g, '-')}.ndjson`);
const saveState = () => {
  fs.writeFileSync(`${stateFile}.tmp`, JSON.stringify(state));
  fs.renameSync(`${stateFile}.tmp`, stateFile);
};

// hard stop so one call never hangs
const hardTimer = setTimeout(() => { console.error('bd-fetch: hard timeout'); process.exit(124); }, 30000 + pending.length * (delay + 20000));
hardTimer.unref();

let blocked = false;
let ok = 0;
const browser = await connectBrowser('bd');
try {
  const page = await browser.newPage();
  try {
    await page.goto(anchor, { timeout: 90000, waitUntil });
  } catch (e) {
    // the challenge solves by navigating the frame, which detaches it mid-goto
    console.error(`bd-fetch: navigation interrupted (${e.message.split('\n')[0]}), waiting for the page`);
  }
  const title = async () => page.title().catch(() => 'just a moment');
  for (let i = 0; i < 60 && (CHALLENGE.test(await title()) || !(await title())); i += 1) await page.waitForTimeout(1000);
  if (CHALLENGE.test(await title())) throw new Error(`anchor page still behind the challenge: ${anchor}`);
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForTimeout(2000);

  for (const url of pending) {
    const r = await page.evaluate(async ({ u, body }) => {
      const init = body ? { method: 'POST', body, headers: { 'Content-Type': 'application/json', Accept: 'application/json' } } : {};
      const resp = await fetch(u, { credentials: 'include', ...init });
      const contentType = resp.headers.get('content-type') || '';
      // binary answers (gzipped sitemaps, fonts such as ITA's OpenSans .woff) as base64
      const gz = (u.endsWith('.gz') && !contentType.includes('xml')) || /font\/|woff|octet-stream/.test(contentType) || /\.woff2?$/.test(u);
      let text;
      if (gz) {
        let s = '';
        new Uint8Array(await resp.arrayBuffer()).forEach((b) => { s += String.fromCharCode(b); });
        text = btoa(s);
      } else text = await resp.text();
      return {
        status: resp.status, contentType, base64: gz, text,
      };
    }, { u: url, body: post });
    if ((r.status === 403 || r.status === 503) && r.contentType.includes('text/html')) {
      blocked = true;
      console.error(`bd-fetch: blocked at ${url} (${r.status}); stopping`);
      break;
    }
    const kind = /sitemap/.test(url) ? 'sitemap' : (/\.model\.json$/.test(url) && 'model') || (/\/service\/api\//.test(url) && 'api') || 'page';
    fs.appendFileSync(bundle, `${JSON.stringify({
      kind, url, method: post ? 'POST' : 'GET', body: post, ...r, fetchedAt: new Date().toISOString(),
    })}\n`);
    state.done[keyOf(url)] = r.status;
    saveState();
    if (r.status === 200) ok += 1;
    console.log(`${r.status} ${r.text.length}B ${url}`);
    await page.waitForTimeout(delay);
  }
} finally {
  await browser.close();
}
const left = urls.filter((u) => !state.done[keyOf(u)]).length;
console.log(`bd-fetch: ${ok}/${pending.length} ok in this batch, ${left} left${blocked ? ', BLOCKED' : ''}`);
process.exit(blocked ? 2 : 0);
