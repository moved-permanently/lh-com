/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, max-len, import/no-unresolved, import/extensions */
/**
 * Records www.lufthansa.com's label bundles of a language (GET /service/api/labels/<bundle>/lh/<ll>)
 * through ONE warm Bright Data session, from inside a page of the language's root (same origin, no
 * CORS), one call every 5-10 s; status 200 JSON answers go to
 * tools/source-export/api/bd-labels/<cc>-<ll>.ndjson in record-live-data.mjs's format (locale,
 * method, url, status, text, referer, recordedAt). A Cloudflare challenge or a 403 stops the run
 * (exit 2). Resumable: bundles already in the file are skipped.
 *
 * Usage: node tools/importer/bd-labels.mjs --root fr/fr [--bundle common ...] [--lang en] [--navigate]
 *   default bundles: every bundle recorded for de/en (data/recorded/index.json) and searchResultsAEM;
 *   --lang: the bundles' language when it is not the root's (the same page asks)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRAPE = '/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-scrape-webpage/scripts';
const { connectBrowser } = await import(path.join(SCRAPE, 'browser-source.js'));
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const opt = (name, def) => (argv.includes(`--${name}`) ? argv[argv.indexOf(`--${name}`) + 1] : def);
const key = opt('root');
if (!/^[a-z]{2}\/[a-z]{2}$/.test(key || '')) throw new Error('--root cc/ll');
const lang = opt('lang', key.split('/')[1]);
const navigate = argv.includes('--navigate');
const named = argv.flatMap((a, i) => (a === '--bundle' ? [argv[i + 1]] : []));
const { entries } = JSON.parse(fs.readFileSync(path.join(root, 'data/recorded/index.json'), 'utf8'));
const bundles = named.length ? named : [...new Set([
  ...Object.keys(entries).filter((k) => k.startsWith('de/en|GET /service/api/labels/')).map((k) => k.match(/labels\/([^/]+)\//)[1]),
  'searchResultsAEM',
])];
const out = path.join(root, 'tools/source-export/api/bd-labels', `${key.replace('/', '-')}.ndjson`);
fs.mkdirSync(path.dirname(out), { recursive: true });
const done = new Set(fs.existsSync(out) ? fs.readFileSync(out, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l).url) : []);
const page0 = `https://www.lufthansa.com/${key}/homepage`;
const CHALLENGE = /just a moment|nur einen moment|checking your browser|attention required|verifying you are human|performing security verification/i;
const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });
const todo = bundles.map((b) => `/service/api/labels/${b}/lh/${lang}`).filter((u) => !done.has(u));
if (!todo.length) { console.log('bd-labels: nothing to do'); process.exit(0); }

const browser = await connectBrowser('bd');
let code = 0;
try {
  const page = await browser.newPage();
  page.setDefaultTimeout(90000);
  await page.goto(page0, { timeout: 90000 }).catch(() => {});
  for (let i = 0; i < 60 && CHALLENGE.test(await page.title().catch(() => 'just a moment')); i += 1) await sleep(1000);
  if (CHALLENGE.test(await page.title().catch(() => ''))) throw new Error('warm-up page still behind the challenge');
  console.log(`bd-labels: warmed up on ${page.url()}`);
  for (const url of todo) {
    await sleep(5000 + Math.random() * 5000);
    // --navigate: the bundle as a page navigation (an in-page fetch() got Cloudflare's 403)
    const r = navigate ? await page.goto(`https://www.lufthansa.com${url}`, { timeout: 60000 })
      .then(async (resp) => ({ status: resp.status(), type: resp.headers()['content-type'] || '', text: await resp.text() }))
      .catch((e) => ({ status: 0, type: '', text: String(e.message) }))
      : await page.evaluate(async (u) => {
        const resp = await fetch(u, { credentials: 'include', headers: { accept: 'application/json' } });
        return { status: resp.status, type: resp.headers.get('content-type') || '', text: await resp.text() };
      }, url).catch((e) => ({ status: 0, type: '', text: String(e.message) }));
    const json = /json/.test(r.type) && (() => { try { JSON.parse(r.text); return true; } catch (e) { return false; } })();
    console.log(`${r.status} ${json ? 'json' : r.type.slice(0, 20)} ${url} (${r.text.length} B)`);
    if (r.status === 403 || CHALLENGE.test(r.text.slice(0, 2000))) { console.error('bd-labels: blocked; stopping'); code = 2; break; }
    if (r.status === 200 && json) {
      fs.appendFileSync(out, `${JSON.stringify({
        locale: key, method: 'GET', url, status: 200, text: r.text, referer: page0, recordedAt: new Date().toISOString(),
      })}\n`);
    }
  }
} finally {
  await browser.close().catch(() => {});
}
process.exit(code);
