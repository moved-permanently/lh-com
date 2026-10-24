/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, max-len, import/no-unresolved, import/extensions */
/**
 * Records live's not-found page of each market through ONE warm Bright Data session
 * (/de/en/homepage first, then the same page navigates to one nonexistent path per market, one
 * every 5-10 s; nothing typed, clicked or submitted). Paths: /{cc}/{ll}/zz-not-found-check.
 *
 * Output: tools/source-export/not-found/{cc}-{ll}.json = { url, status, title, lang, text,
 * headings, links: [{ text, href }] (of the main content), recordedAt }, .html (rendered DOM)
 * and .jpg (1440 screenshot of the viewport and below, capped).
 *
 * Usage: node tools/importer/bd-record-404.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const EXCAT = process.env.EXCAT_ROOT || '/home/node/.excat-marketplaces/excat-marketplace';
const SCRAPE = path.join(EXCAT, 'excat/skills/excat-scrape-webpage/scripts');
const { connectBrowser } = await import(path.join(SCRAPE, 'browser-source.js'));

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const LIVE = 'https://www.lufthansa.com';
const CHALLENGE = /just a moment|checking your browser|attention required|verifying you are human|performing security verification/i;
const outDir = path.join(root, 'tools/source-export/not-found');
const MARKETS = ['de/en', 'de/de', 'at/de', 'gb/en'];
const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });
const wait = () => sleep(5000 + Math.random() * 5000);
fs.mkdirSync(outDir, { recursive: true });
const todo = MARKETS.filter((m) => !fs.existsSync(path.join(outDir, `${m.replace('/', '-')}.json`)));
if (!todo.length) { console.log('bd-record-404: nothing to do'); process.exit(0); }
const hardTimer = setTimeout(() => { console.error('bd-record-404: hard timeout'); process.exit(124); }, 600000);
hardTimer.unref();

let stopped = null;
const browser = await connectBrowser('bd');
try {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 }).catch(() => {});
  await page.goto(`${LIVE}/de/en/homepage`, { timeout: 90000 }).catch((e) => console.error(`  navigation interrupted (${e.message.split('\n')[0]})`));
  for (let i = 0; i < 60 && CHALLENGE.test(await page.title().catch(() => 'just a moment')); i += 1) await sleep(1000);
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  if (CHALLENGE.test(await page.title().catch(() => ''))) throw new Error('warm-up page still behind the challenge');
  await wait();
  for (const market of todo) {
    const url = `${LIVE}/${market}/zz-not-found-check`;
    let resp = null;
    try { resp = await page.goto(url, { timeout: 90000 }); } catch (e) {
      if (/has been closed/.test(e.message)) { stopped = 'session closed'; break; }
      console.error(`  ${url}: navigation interrupted (${e.message.split('\n')[0]})`);
    }
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await sleep(2000);
    const title = await page.title().catch(() => '');
    if (CHALLENGE.test(title)) { stopped = `Cloudflare challenge at ${url}`; break; }
    const info = await page.evaluate(() => {
      const main = document.querySelector('main, #content, .contentpage, .container-content') || document.body;
      return {
        lang: document.documentElement.lang,
        finalUrl: window.location.href,
        text: main.innerText.replace(/\n{3,}/g, '\n\n').slice(0, 4000),
        headings: [...main.querySelectorAll('h1, h2, h3')].map((h) => `${h.tagName} ${h.innerText.trim()}`),
        links: [...main.querySelectorAll('a[href]')].map((a) => ({ text: a.innerText.trim(), href: a.href })).filter((l) => l.text),
      };
    }).catch((e) => ({ error: e.message }));
    const base = path.join(outDir, market.replace('/', '-'));
    fs.writeFileSync(`${base}.html`, await page.content().catch(() => ''));
    await page.screenshot({ path: `${base}.jpg`, type: 'jpeg', quality: 70, fullPage: true }).catch(() => {});
    fs.writeFileSync(`${base}.json`, `${JSON.stringify({ url, status: resp ? resp.status() : null, title, ...info, recordedAt: new Date().toISOString() }, null, 1)}\n`);
    console.log(`${resp ? resp.status() : '-'} ${url}: "${title}", ${info.headings ? info.headings.join(' | ') : info.error}`);
    await wait();
  }
} finally {
  await browser.close().catch(() => {});
}
console.log(`bd-record-404: done${stopped ? `; STOPPED: ${stopped}` : ''}`);
process.exit(stopped ? 2 : 0);
