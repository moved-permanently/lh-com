/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, max-len, import/no-unresolved, import/extensions */
/**
 * Resolves www.lufthansa.com URLs (e.g. the AEM content paths of form confirmation pages,
 * /content/lh/markets/de/en/.../confirmation.html) to the public URL they end on, through ONE
 * warm Bright Data session: /de/en/homepage first, then the same page navigates to each URL, one
 * every 5-10 s. Nothing is typed, clicked or submitted. Writes {url: {status, final}} to --out.
 *
 * Usage: node tools/importer/bd-resolve-urls.mjs --list urls.txt --out resolved.json
 */
import fs from 'node:fs';
import path from 'node:path';

const EXCAT = process.env.EXCAT_ROOT || '/home/node/.excat-marketplaces/excat-marketplace';
const SCRAPE = path.join(EXCAT, 'excat/skills/excat-scrape-webpage/scripts');
const { connectBrowser } = await import(path.join(SCRAPE, 'browser-source.js'));

const argv = process.argv.slice(2);
const opt = (n) => argv[argv.indexOf(`--${n}`) + 1];
const LIVE = 'https://www.lufthansa.com';
const CHALLENGE = /just a moment|checking your browser|attention required|verifying you are human|performing security verification/i;
const outFile = opt('out');
const out = fs.existsSync(outFile) ? JSON.parse(fs.readFileSync(outFile, 'utf8')) : {};
const urls = fs.readFileSync(opt('list'), 'utf8').split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
  .map((u) => (u.startsWith('http') ? u : `${LIVE}${u}`)).filter((u) => !out[u]);
const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });
console.log(`bd-resolve-urls: ${urls.length} to resolve`);
if (!urls.length) process.exit(0);
const browser = await connectBrowser('bd');
let stopped = null;
try {
  const page = await browser.newPage();
  await page.goto(`${LIVE}/de/en/homepage`, { timeout: 90000 }).catch(() => {});
  for (let i = 0; i < 60 && CHALLENGE.test(await page.title().catch(() => 'just a moment')); i += 1) await sleep(1000);
  await sleep(5000 + Math.random() * 5000);
  for (const url of urls) {
    const t0 = Date.now();
    let resp = null;
    try { resp = await page.goto(url, { timeout: 90000, waitUntil: 'domcontentloaded' }); } catch (e) {
      if (/has been closed/.test(e.message)) { stopped = 'session closed'; break; }
    }
    const title = await page.title().catch(() => '');
    if (CHALLENGE.test(title)) { stopped = `challenge at ${url}`; break; }
    out[url] = { status: resp ? resp.status() : null, final: page.url(), title };
    fs.writeFileSync(outFile, `${JSON.stringify(out, null, 1)}\n`);
    console.log(`${out[url].status} ${url} -> ${out[url].final}`);
    await sleep(Math.max(0, t0 + 5000 + Math.random() * 5000 - Date.now()));
  }
} finally {
  await browser.close().catch(() => {});
}
console.log(`bd-resolve-urls: done${stopped ? `; STOPPED: ${stopped}` : ''}`);
process.exit(stopped ? 2 : 0);
