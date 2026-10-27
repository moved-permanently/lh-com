/* eslint-disable no-console, max-len, no-await-in-loop, no-restricted-syntax, import/no-extraneous-dependencies -- dev tooling; playwright-core is a dev dependency */
/**
 * Compares the rendered DOM of the four live roots between two hosts or two code versions (part
 * 1 of the ch pilot: the locale table must leave de/en, de/de, at/de and gb/en exactly as they
 * are). Per root: the homepage, a form page, an article and the flight offers page. Per page the
 * rendered <head> (meta, links), header, main and footer, after the page's blocks have loaded.
 * Masked before comparing (they change on every load): nonce values, cache-busting and RUM
 * query parameters, ISO timestamps, the elapsed time of rotating teasers, randomised ids, and the
 * order of a block's data-lh-sources (the order its requests finished).
 *
 * Usage:
 *   node tools/markets/compare-roots.mjs --capture <base> --out <dir> [--prefix /content]
 *   node tools/markets/compare-roots.mjs --compare <dirA> <dirB> [--report tools/reports/markets/compare-roots.md]
 * Example (branch against main):
 *   --capture https://main--lh-com--moved-permanently.aem.page --out /tmp/main
 *   --capture https://locale-table--lh-com--moved-permanently.aem.page --out /tmp/branch
 * One page at a time, each page closed after it is read. Chromium: CHROMIUM_PATH, else the
 * browser of the Playwright install (/ms-playwright).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const opt = (name, def) => (argv.includes(`--${name}`) ? argv[argv.indexOf(`--${name}`) + 1] : def);

export const PAGES = {
  'de/en': ['/de/en/homepage', '/de/en/feedback-past-flight', '/de/en/articles/explore-flying/7-people-who-shaped-lufthansa-history', '/de/en/flights'],
  'de/de': ['/de/de/homepage', '/de/de/feedback-past-flight', '/de/de/articles/explore-flying/7-people-who-shaped-lufthansa-history', '/de/de/fluege'],
  'at/de': ['/at/de/homepage', '/at/de/feedback-past-flight', '/at/de/articles/explore-flying/7-people-who-shaped-lufthansa-history', '/at/de/fluege'],
  'gb/en': ['/gb/en/homepage', '/gb/en/feedback-past-flight', '/gb/en/articles/explore-flying/7-people-who-shaped-lufthansa-history', '/gb/en/flights'],
};

/** Masks what differs between two loads of the same page and code. */
export function mask(html) {
  return String(html || '')
    .replace(/\snonce="[^"]*"/g, '')
    // the sources a block records, in the order its requests happened to finish
    .replace(/data-lh-sources="([^"]*)"/g, (m, list) => `data-lh-sources="${list.split(' ').sort().join(' ')}"`)
    .replace(/([?&])(ck|_|t|cb|v|rum|cachebust)=[^&"'\s]*/gi, '$1$2=…')
    .replace(/\d{4}-\d\d-\d\dT\d\d:\d\d(:\d\d(\.\d+)?)?(Z|[+-]\d\d:?\d\d)?/g, '‹time›')
    // randomised ids (a block's -<6 random characters> or -<n> suffix), on every attribute that refers to one
    .replace(/\b(id|for|name|aria-controls|aria-labelledby|aria-describedby|list|form)="([^"]*?)-([a-z0-9]{6}|\d+)"/gi, '$1="$2-‹n›"')
    .replace(/style="[^"]*(--progress|animation-delay|transform)[^"]*"/g, 'style="‹animated›"')
    .replace(/\s+/g, ' ');
}

async function capture(base, outDir, prefix) {
  fs.mkdirSync(outDir, { recursive: true });
  const executablePath = process.env.CHROMIUM_PATH
    || ['/ms-playwright/chromium-1208/chrome-linux64/chrome'].find((p) => fs.existsSync(p));
  const browser = await chromium.launch({ executablePath, headless: true });
  try {
    for (const pagePath of Object.values(PAGES).flat()) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'en-GB' });
      const page = await context.newPage();
      page.setDefaultTimeout(30000);
      const url = `${base}${prefix}${pagePath}`;
      let status = 0;
      try {
        const resp = await page.goto(url, { waitUntil: 'load', timeout: 45000 });
        status = resp ? resp.status() : 0;
        await page.waitForTimeout(8000);
        const parts = await page.evaluate(() => {
          const pick = (sel) => document.querySelector(sel)?.outerHTML || '';
          // the head without scripts and styles the browser injects at runtime
          const head = [...document.head.children].filter((e) => !/^(SCRIPT|STYLE)$/.test(e.tagName)).map((e) => e.outerHTML).join('\n');
          return {
            head, header: pick('body > header'), main: pick('main'), footer: pick('body > footer'), lang: document.documentElement.lang,
          };
        });
        fs.writeFileSync(path.join(outDir, `${pagePath.replace(/\//g, '_')}.json`), JSON.stringify({ url, status, ...parts }));
        console.log(`${status} ${url}`);
      } catch (e) {
        fs.writeFileSync(path.join(outDir, `${pagePath.replace(/\//g, '_')}.json`), JSON.stringify({ url, status, error: e.message }));
        console.log(`ERROR ${url}: ${e.message}`);
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
}

/** The first differing stretch of two masked strings, for the report. */
function firstDiff(a, b) {
  let i = 0;
  while (i < a.length && a[i] === b[i]) i += 1;
  return i >= a.length && i >= b.length ? '' : `at ${i}: «${a.slice(Math.max(0, i - 60), i + 80)}» vs «${b.slice(Math.max(0, i - 60), i + 80)}»`;
}

function compare(dirA, dirB, report) {
  const rows = [];
  Object.entries(PAGES).forEach(([key, list]) => list.forEach((pagePath) => {
    const file = `${pagePath.replace(/\//g, '_')}.json`;
    const read = (d) => (fs.existsSync(path.join(d, file)) ? JSON.parse(fs.readFileSync(path.join(d, file), 'utf8')) : null);
    const a = read(dirA);
    const b = read(dirB);
    if (!a || !b || a.error || b.error) {
      rows.push({
        key, pagePath, result: 'not captured', detail: (a && a.error) || (b && b.error) || 'missing',
      });
      return;
    }
    const parts = ['head', 'header', 'main', 'footer', 'lang'];
    const diffs = parts.filter((p) => mask(a[p]) !== mask(b[p]));
    rows.push({
      key, pagePath, status: `${a.status}/${b.status}`, result: diffs.length ? `differs: ${diffs.join(', ')}` : 'equal', detail: diffs.map((p) => `${p} ${firstDiff(mask(a[p]), mask(b[p]))}`).join(' | '),
    });
  }));
  const equal = rows.filter((r) => r.result === 'equal').length;
  const lines = ['# The four roots: rendered DOM compared', '', `${new Date().toISOString()}. A: ${dirA}, B: ${dirB}. ${equal} of ${rows.length} pages equal (head, header, main, footer and html lang, after masking nonces, cache-busting queries, timestamps, randomised ids and animation state).`, '',
    '| Root | Page | Status A/B | Result | First difference |', '| --- | --- | --- | --- | --- |',
    ...rows.map((r) => `| ${r.key} | ${r.pagePath} | ${r.status || '-'} | ${r.result} | ${(r.detail || '').replace(/\|/g, '\\|').slice(0, 400)} |`), ''];
  if (report) fs.writeFileSync(path.resolve(root, report), lines.join('\n'));
  console.log(lines.slice(2, 3).join('\n'));
  rows.filter((r) => r.result !== 'equal').forEach((r) => console.log(`  ${r.pagePath}: ${r.result} ${r.detail.slice(0, 300)}`));
  return rows;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  if (argv.includes('--capture')) await capture(opt('capture'), path.resolve(opt('out')), opt('prefix', ''));
  else if (argv.includes('--compare')) {
    const i = argv.indexOf('--compare');
    compare(path.resolve(argv[i + 1]), path.resolve(argv[i + 2]), opt('report'));
  }
}
