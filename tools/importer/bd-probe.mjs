/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, import/no-unresolved, import/extensions */
/**
 * Diagnoses which requests Cloudflare lets through inside one Bright Data session:
 * loads the given pages in order (same page) and, on each, runs one same-origin fetch()
 * of an API route, logging status/content-type and how many page subrequests failed.
 * Usage: node tools/importer/bd-probe.mjs <api-route> <page-url> [<page-url> ...]
 */
import path from 'node:path';

const SCRAPE = '/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-scrape-webpage/scripts';
const { connectBrowser } = await import(path.join(SCRAPE, 'browser-source.js'));
const [route, ...pages] = process.argv.slice(2);
const CHALLENGE = /just a moment|performing security verification/i;
const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });

const browser = await connectBrowser('bd');
try {
  const page = await browser.newPage();
  let failed = [];
  page.on('response', (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url().slice(0, 90)}`); });
  for (const url of pages) {
    failed = [];
    const t = Date.now();
    try { await page.goto(url, { timeout: 90000 }); } catch (e) { /* challenge navigation */ }
    for (let i = 0; i < 45 && CHALLENGE.test(await page.title().catch(() => 'just a moment')); i += 1) await sleep(1000);
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    const api = await page.evaluate(async (u) => {
      const r = await fetch(u, { credentials: 'include' });
      return `${r.status} ${r.headers.get('content-type')}`;
    }, route).catch((e) => `error ${e.message}`);
    console.log(`${url} title="${await page.title()}" fetch ${route} -> ${api}; ${failed.length} failed subrequests in ${Math.round((Date.now() - t) / 1000)}s`);
    failed.slice(0, 6).forEach((f) => console.log(`   ${f}`));
    await sleep(6000);
  }
} finally {
  await browser.close().catch(() => {});
}
