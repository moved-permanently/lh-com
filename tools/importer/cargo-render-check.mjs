/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, max-len, import/no-extraneous-dependencies -- tooling */
/**
 * Opens Lufthansa Cargo documents on a host (the preview: main--lh-cargo--moved-permanently.aem.page,
 * or a local aem up), one page at a time, and prints per page: H1 count, blocks that did not
 * load, header and footer, the page language, broken images (other than links to www) and page
 * errors. The browser is the scrape skill's Playwright (headless Chromium).
 *
 * Usage: node tools/importer/cargo-render-check.mjs <base URL> <paths.txt>
 */
import fs from 'node:fs';
import path from 'node:path';

const EXCAT = process.env.EXCAT_ROOT || '/home/node/.excat-marketplaces/excat-marketplace';
const pw = await import(path.join(EXCAT, 'excat/skills/excat-scrape-webpage/scripts/node_modules/playwright/index.js'));
const chromium = pw.chromium || pw.default.chromium;
const [base, list] = process.argv.slice(2);
const paths = fs.readFileSync(list, 'utf8').split(/\r?\n/).filter(Boolean);
const browser = await chromium.launch();
for (const p of paths) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 160)));
  let line = '';
  for (let attempt = 0; attempt < 2 && !/bad=- header=true footer=true/.test(line); attempt += 1) {
    try {
      await page.goto(`${base}${p}`, { waitUntil: 'load', timeout: 30000 });
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => { setTimeout(r, 120); }); }
      });
      await page.waitForTimeout(1000);
      const r = await page.evaluate(() => ({
        h1: document.querySelectorAll('main h1').length,
        blocks: [...document.querySelectorAll('main div[data-block-name]')].map((b) => `${b.dataset.blockName}:${b.dataset.blockStatus}`),
        header: Boolean(document.querySelector('header .nav-brand img')),
        footer: Boolean(document.querySelector('footer .footer-main')),
        lang: document.documentElement.lang,
        broken: [...document.querySelectorAll('main img')].filter((i) => i.complete && i.naturalWidth === 0 && !/lufthansa-cargo\.com/.test(i.src)).length,
      }));
      const bad = r.blocks.filter((b) => !b.endsWith(':loaded'));
      line = `${p.padEnd(48)} h1=${r.h1} blocks=${r.blocks.length} bad=${bad.join(',') || '-'} header=${r.header} footer=${r.footer} lang=${r.lang} brokenLocalImgs=${r.broken} errors=${errors.length ? errors.join(' | ') : '-'}`;
    } catch (e) {
      line = `${p}: ${e.message.split('\n')[0]}`;
    }
  }
  console.log(line);
  await context.close();
}
await browser.close();
