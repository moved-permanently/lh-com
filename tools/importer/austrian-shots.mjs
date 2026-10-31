/* eslint-disable no-console, max-len, no-await-in-loop, no-restricted-syntax, import/no-extraneous-dependencies -- tooling */
/**
 * The spot checks of an ITA batch (lh-ita) at 1440 and 390 px: per document of the list, lh-ita's
 * preview in a local browser (one page at a time, closed after reading), the consent banner and
 * the showcase notice dismissed, scrolled for lazy images; recorded: the blocks and their status,
 * broken images, the page height, and a full-page screenshot (at most 8000 px) next to www's
 * screenshot of the capture (content-sites/lh-austrian/pages/<path>/screenshot[-390].jpg) as one
 * side-by-side image (ImageMagick): content-sites/lh-austrian/runs/shots/<path>-<width>.jpg
 * (www left, preview right). Writes content-sites/lh-austrian/runs/<name>-shots.json.
 *
 * Usage: node tools/importer/austrian-shots.mjs --list content-sites/lh-austrian/runs/batch-01-upload.txt [--widths 1440,390]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
const PREVIEW = opt('origin', 'https://main--lh-austrian--moved-permanently.aem.page');
const W = path.join(root, 'content-sites/lh-austrian');
const OUT = path.join(W, 'runs/shots');
const widths = opt('widths', '1440,390').split(',').map(Number);
const list = opt('list');
const name = path.basename(list).replace(/-upload\.txt$|\.txt$/, '');
const paths = fs.readFileSync(path.resolve(root, list), 'utf8').split('\n').map((p) => p.trim()).filter((p) => p && !/\/(nav|footer)$/.test(p));

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
const rows = [];
try {
  for (const p of paths) {
    for (const width of widths) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      page.setDefaultTimeout(15000);
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message.split('\n')[0]));
      let status = 0;
      try {
        const r = await page.goto(`${PREVIEW}${p}`, { timeout: 45000, waitUntil: 'load' });
        status = r ? r.status() : 0;
        await page.waitForTimeout(2500);
        await page.evaluate(() => {
          document.querySelector('.showcase-notice button, dialog[open] button')?.click();
          document.querySelector('.consent-banner button, #onetrust-reject-all-handler')?.click();
        }).catch(() => {});
        await page.evaluate(async () => {
          for (let y = 0; y < Math.min(document.body.scrollHeight, 8000); y += 600) {
            window.scrollTo(0, y);
            await new Promise((res) => { setTimeout(res, 150); });
          }
          window.scrollTo(0, 0);
        });
        await page.waitForTimeout(1500);
        const info = await page.evaluate(() => ({
          blocks: [...document.querySelectorAll('main .block, header .block, footer .block')].map((b) => `${b.classList[0]}:${b.dataset.blockStatus || '?'}`),
          broken: [...document.images].filter((im) => im.complete && im.naturalWidth === 0 && im.getAttribute('src')).map((im) => im.getAttribute('src')),
          height: document.documentElement.scrollHeight,
          h1: document.querySelector('main h1')?.textContent.trim() || '',
        }));
        const shot = path.join(OUT, `${p.replace(/^\//, '').replace(/\//g, '__')}-${width}-preview.jpg`);
        fs.mkdirSync(OUT, { recursive: true });
        await page.screenshot({
          path: shot,
          fullPage: info.height <= 8000,
          type: 'jpeg',
          quality: 70,
          clip: info.height > 8000 ? {
            x: 0, y: 0, width, height: 8000,
          } : undefined,
        });
        const www = path.join(W, 'pages', p.replace(/^\//, ''), width === 1440 ? 'screenshot.jpg' : `screenshot-${width}.jpg`);
        const pair = shot.replace(/-preview\.jpg$/, '.jpg');
        if (fs.existsSync(www)) execFileSync('convert', [www, shot, '-background', '#888', '-gravity', 'north', '+append', '-resize', `${width * 2 > 2400 ? 2400 : width * 2}x`, pair]);
        rows.push({
          path: p, width, status, ...info, errors, shot: path.relative(W, fs.existsSync(pair) ? pair : shot),
        });
        console.log(`${status} ${width} ${p}: ${info.blocks.length} blocks${info.blocks.filter((b) => !/:loaded$/.test(b)).length ? ` (not loaded: ${info.blocks.filter((b) => !/:loaded$/.test(b)).join(' ')})` : ''}, broken images ${info.broken.length}, errors ${errors.length}, height ${info.height}`);
      } catch (e) {
        rows.push({
          path: p, width, status, error: e.message.split('\n')[0],
        });
        console.log(`ERR ${width} ${p}: ${e.message.split('\n')[0]}`);
      } finally {
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
}
fs.writeFileSync(path.join(W, 'runs', `${name}-shots.json`), `${JSON.stringify(rows, null, 1)}\n`);
