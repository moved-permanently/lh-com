/* eslint-disable no-console, max-len, no-await-in-loop, no-restricted-syntax, import/no-extraneous-dependencies -- tooling; playwright-core is a dev dependency */
/**
 * A collapse pass's page checks (tools/reports/token-free/harness-pass-<brand>.md): each collapsed and previewed
 * document on the brand's switch branch preview (the theme live) against the same page as the host publishes it
 * today (markers, theme off). Per page:
 * - the preview's page and its .plain.html answer 200, the .plain.html has no "about:error";
 * - the preview's document has exactly one h1 (where the host's published one has one);
 * - at each width (1440 and 390) main's height and every heading's top against the host's: flagged over 3 % or a
 *   heading more than 40 px off.
 * One page at a time, a short pause between requests; nothing is written anywhere but --out.
 *
 * Usage: node tools/importer/pass-widths.mjs --paths batch.txt --host https://ita.turnsthe.page
 *   --preview https://token-free-ita-live--lh-ita--moved-permanently.aem.page --out batch-widths.json
 *   [--widths 1440,390 | none]   (none: the fast checks only; env CHROMIUM_PATH: a Chromium to use, else playwright-core's own)
 *   Exit code 1 when a page fails a check (200, about:error, h1) or is flagged.
 */
import fs from 'node:fs';
import { chromium } from 'playwright-core';
import { guardContext, GUARD_CONTEXT } from '../parity/guard.mjs';

const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
const list = opt('paths'); const host = opt('host'); const preview = opt('preview'); const out = opt('out', 'pass-widths.json');
if (!list || !host || !preview) {
  console.error('usage: pass-widths.mjs --paths <file> --host <origin> --preview <branch preview origin> [--out <json>] [--widths 1440,390]');
  process.exit(2);
}
// --widths none: the fast checks only (200, about:error, the h1), no renders
const widths = opt('widths', '1440,390') === 'none' ? [] : opt('widths', '1440,390').split(',').map(Number);
const paths = fs.readFileSync(list, 'utf8').split('\n').map((l) => l.trim()).filter((l) => l.startsWith('/'));
const pause = (ms) => new Promise((r) => { setTimeout(r, ms); });

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox'] });

async function measure(url, width) {
  const ctx = await browser.newContext({ ...GUARD_CONTEXT, viewport: { width, height: 900 } });
  // only our hosts: the page's scripts and fonts never reach an airline host (standing order 13)
  await guardContext(ctx);
  const page = await ctx.newPage();
  page.setDefaultTimeout(15000);
  let status = 0;
  try {
    const res = await page.goto(url, { waitUntil: 'load', timeout: 40000 });
    status = res ? res.status() : 0;
    await page.waitForTimeout(2500);
    await page.evaluate(async () => {
      document.querySelectorAll('.showcase-modal, dialog[open], #onetrust-consent-sdk').forEach((d) => d.remove());
      for (let y = 0; y < document.documentElement.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => { setTimeout(r, 100); }); }
    });
    await page.waitForTimeout(800);
    const r = await page.evaluate(() => {
      const main = document.querySelector('main');
      if (!main) return null;
      return {
        height: Math.round(main.getBoundingClientRect().height),
        heads: [...main.querySelectorAll('h1, h2, h3, h4')].filter((h) => h.offsetHeight).map((h) => ({ t: h.textContent.trim().slice(0, 40), y: Math.round(h.getBoundingClientRect().top + window.scrollY) })),
      };
    });
    return r && { ...r, status };
  } catch (e) {
    return { status, error: String(e.message || e).slice(0, 120) };
  } finally {
    await ctx.close();
  }
}

/** A width's comparison into the page's row: the heights, the worst heading, the problems. */
function compare(row, w, a, b) {
  let max = 0; let at = '';
  b.heads.forEach((h, i) => { const o = a.heads[i]; if (o && Math.abs(h.y - o.y) > Math.abs(max)) { max = h.y - o.y; at = h.t; } });
  const pct = ((b.height - a.height) / a.height) * 100;
  row.widths[w] = {
    host: a.height, preview: b.height, pct: Math.round(pct * 10) / 10, heading: max, at,
  };
  if (Math.abs(pct) > 3 || Math.abs(max) > 40) row.problems.push(`@${w}: ${pct.toFixed(1)} %, heading ${max} px (${at})`);
}

const rows = [];
for (const p of paths) {
  const row = { path: p, problems: [], widths: {} };
  const [doc, plain] = [await fetch(`${preview}${p}`), await fetch(`${preview}${p}.plain.html`)];
  if (doc.status !== 200) row.problems.push(`preview ${doc.status}`);
  if (plain.status !== 200) row.problems.push(`.plain.html ${plain.status}`);
  else {
    const html = await plain.text();
    if (html.includes('about:error')) row.problems.push('about:error');
    // one h1 in the document (the host's published one had one, else as before)
    const own = (html.match(/<h1[\s>]/g) || []).length;
    const hostPlain = await fetch(`${host}${p}.plain.html`);
    const before = hostPlain.ok ? ((await hostPlain.text()).match(/<h1[\s>]/g) || []).length : 1;
    if (before === 1 && own !== 1) row.problems.push(`h1: ${own}`);
  }
  for (const w of widths) {
    const a = await measure(`${host}${p}`, w); await pause(300);
    const b = await measure(`${preview}${p}`, w); await pause(300);
    if (!a || !b || a.error || b.error) row.problems.push(`@${w}: not measured`);
    else compare(row, w, a, b);
  }
  rows.push(row);
  console.log(`${p}: ${row.problems.length ? row.problems.join('; ') : 'ok'}`);
  await pause(500);
}
await browser.close();
fs.writeFileSync(out, JSON.stringify(rows, null, 1));
const failed = rows.filter((r) => r.problems.length).length;
console.log(`${rows.length} pages, ${failed} with a problem`);
process.exit(failed ? 1 : 0);
