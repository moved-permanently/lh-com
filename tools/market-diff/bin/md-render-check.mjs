/* eslint-disable import/extensions, max-len, no-await-in-loop, no-console, no-promise-executor-return, no-restricted-syntax, object-curly-newline -- dev tooling */
// market-diff false-negative check: loads both pages of chosen pairs as full pages in a real Chrome (JavaScript run,
// widgets loaded) and compares what a visitor reads in the content area, to see whether pairs the HTML comparison calls
// "same" really look the same once the browser has rendered them. Slow (a full page load each, 10-12 s apart, like the
// captures): for validation samples only, never for the inventory.
// usage: node bin/md-render-check.mjs --host www.lufthansa.com --pairs <tsv> --out <dir> [--warmup /de/en/homepage]
//          [--chrome <path>] [--headless]   browser: lib/browser.mjs
// pairs tsv: root, version, root_path, version_path (as md-compare.mjs). Writes <out>/render-check.jsonl and
// <out>/render/<n>.txt (the two texts' differing lines).
import fs from 'node:fs';
import path from 'node:path';
import { launch } from '../lib/browser.mjs';
import readText from '../lib/files.mjs';

const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
const HOST = opt('host');
const OUT = path.resolve(opt('out'));
const WARMUP = opt('warmup', '/');
const PROFILE = path.join(OUT, 'chrome-profile-render');
const CHALLENGE = /just a moment|nur einen moment|attention required|access denied/i;
fs.mkdirSync(path.join(OUT, 'render'), { recursive: true });
const lines = readText(opt('pairs')).split('\n').filter((l) => l.trim() && !l.startsWith('#'));
const head = lines.shift().split('\t');
const pairs = lines.map((l) => Object.fromEntries(l.split('\t').map((v, i) => [head[i], v])));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const { ctx } = await launch({
  profile: PROFILE,
  chrome: opt('chrome', ''),
  headless: argv.includes('--headless') ? true : undefined,
  viewport: { width: 1440, height: 900 },
  windowArgs: ['--window-position=100,100', '--window-size=1460,980'],
});
const done = async (code) => { try { await ctx.close(); } catch (e) { /* gone */ } process.exit(code); };
process.on('SIGINT', () => done(2));
process.on('SIGTERM', () => done(2));
const page = ctx.pages()[0] || await ctx.newPage();
await page.goto(`https://${HOST}${WARMUP}`, { waitUntil: 'load', timeout: 60000 });
await sleep(4000);
await page.locator('#onetrust-reject-all-handler').click({ timeout: 4000 }).catch(() => {});
let last = 0;
const texts = new Map();
async function load(p) {
  if (texts.has(p)) return texts.get(p);
  const wait = last + 10000 + Math.random() * 2000 - Date.now();
  if (wait > 0) await sleep(wait);
  last = Date.now();
  await page.goto(`https://${HOST}${p}`, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await sleep(3000);
  for (let y = 0; y < 6000; y += 800) { await page.mouse.wheel(0, 800); await sleep(250); }
  await sleep(2500);
  const title = await page.title();
  if (CHALLENGE.test(title)) { console.log('BLOCK', p, title); await done(3); }
  const text = await page.evaluate(() => {
    const m = document.querySelector('h2#main');
    const area = (m && m.parentElement) || document.body;
    const clone = area.cloneNode(true);
    clone.querySelectorAll('header, footer, .skiplinks, script, style, noscript, [id^="onetrust"], #onetrust-consent-sdk').forEach((e) => e.remove());
    // innerText of a detached clone has no layout: use the live node's text but skip removed parts
    const live = [...area.children].filter((c) => !c.matches('header, footer, .skiplinks, .sticky-header-placeholder'));
    return live.map((c) => c.innerText).join('\n');
  });
  texts.set(p, text);
  return text;
}
// numbers, prices and dates differ per market by design (fares, formats): masked; short lines (dates, labels) compare
// with their words in any order ("Sun, Nov 22" = "Sun, 22 Nov")
const mask = (t) => t.split('\n').map((l) => l.replace(/[\u200b-\u200d\ufeff]/g, '').replace(/\s+/g, ' ').trim()).filter(Boolean)
  .map((l) => l.replace(/[€$£¥]|\b(EUR|USD|CHF|GBP|CAD|AUD|INR|JPY|BRL|ZAR|SGD|NGN|DKK|SEK|NOK|PLN|AED)\b/g, '¤').replace(/\d[\d.,\s]*/g, '#'))
  .map((l) => (l.length <= 30 ? l.split(/[\s,.]+/).filter(Boolean).sort().join(' ') : l));
const outLog = path.join(OUT, 'render-check.jsonl');
let n = 0;
for (const p of pairs) {
  n += 1;
  const ta = await load(p.version_path);
  const tb = await load(p.root_path);
  fs.writeFileSync(path.join(OUT, 'render', `${n}.version.txt`), ta);
  fs.writeFileSync(path.join(OUT, 'render', `${n}.root.txt`), tb);
  const a = mask(ta);
  const b = mask(tb);
  const sa = new Set(a);
  const sb = new Set(b);
  const onlyV = a.filter((l) => !sb.has(l));
  const onlyR = b.filter((l) => !sa.has(l));
  const row = { root: p.root, version: p.version, rootPath: p.root_path, versionPath: p.version_path, htmlVerdict: p.verdict || '', renderedSame: !onlyV.length && !onlyR.length, onlyVersion: onlyV.length, onlyRoot: onlyR.length, lines: [a.length, b.length] };
  fs.appendFileSync(outLog, `${JSON.stringify(row)}\n`);
  fs.writeFileSync(path.join(OUT, 'render', `${n}.txt`), [`${p.root_path} vs ${p.version_path}`, '-- version only', ...onlyV.slice(0, 60), '-- root only', ...onlyR.slice(0, 60)].join('\n'));
  console.log(n, row.renderedSame ? 'SAME' : 'DIFF', p.verdict || '', p.root_path, `-${onlyV.length} +${onlyR.length}`);
}
await done(0);
