/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, no-continue, max-len, import/extensions -- tooling */
/**
 * Air Dolomiti's brand font (lh-airdolomiti): the Euclid Circular B files www.airdolomiti.it
 * loads (next/font, self-hosted on /_next/static/media/), copied to fonts/airdolomiti/ of this
 * repository (cleared for the demo, also for serving from our own hosts) for
 * styles/themes/airdolomiti.css. One Bright Data session (.migration/project.json botProtected):
 * the homepage first (warm-up), its own stylesheets read in the page for the @font-face rules
 * (no request), then each .woff2 fetched once inside the page, one every 5-10 s; stops at a
 * 403, 429 or challenge. Writes fonts/airdolomiti/EuclidCircularB-<weight>[-italic].woff2 and
 * content-sites/lh-airdolomiti/runs/fonts.json (the rules, URLs, sizes).
 *
 * Usage: node tools/importer/airdolomiti-fonts.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const HOST = 'https://www.airdolomiti.it';
const OUT = path.join(root, 'fonts/airdolomiti');
const REPORT = path.join(root, 'content-sites/lh-airdolomiti/runs/fonts.json');
const CHALLENGE = /just a moment|checking your browser|attention required|verifying you are human|performing security verification|^blocked$/i;
const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });
const pause = () => sleep(5000 + Math.floor(Math.random() * 5000));

if (JSON.parse(fs.readFileSync(path.join(root, '.migration/project.json'), 'utf8')).botProtected !== true) {
  throw new Error('.migration/project.json: botProtected must be true before any request to the source');
}
const EXCAT = process.env.EXCAT_ROOT || '/home/node/.excat-marketplaces/excat-marketplace';
const { connectBrowser } = await import(path.join(EXCAT, 'excat/skills/excat-scrape-webpage/scripts/browser-source.js'));
const browser = await connectBrowser('bd');
const report = { at: new Date().toISOString(), rules: [], files: {} };
let exit = 0;
try {
  const page = await browser.newPage();
  let status = null;
  page.once('response', (r) => { status = r.status(); });
  await page.goto(`${HOST}/`, { timeout: 90000, waitUntil: 'load' });
  const title = await page.title();
  if (CHALLENGE.test(title) || status === 403 || status === 429) throw new Error(`BLOCKED at / (${status} ${title})`);
  console.log(`warm-up / ${status} "${title}"`);
  // the @font-face rules of the page's own stylesheets (same origin, already loaded)
  report.rules = await page.evaluate(() => {
    const rules = [];
    [...document.styleSheets].forEach((sheet) => {
      let list;
      try { list = sheet.cssRules; } catch (e) { return; }
      [...list].forEach((r) => {
        if (r.type !== CSSRule.FONT_FACE_RULE) return;
        const s = r.style;
        rules.push({
          family: s.getPropertyValue('font-family').replace(/["']/g, '').trim(),
          weight: s.getPropertyValue('font-weight').trim(),
          style: s.getPropertyValue('font-style').trim() || 'normal',
          woff2: (s.getPropertyValue('src').match(/url\(["']?([^"')]+\.woff2)["']?\)/) || [])[1] || '',
        });
      });
    });
    return rules;
  });
  const wanted = report.rules.filter((r) => r.woff2 && !/fallback/i.test(r.family));
  console.log(`@font-face rules: ${report.rules.length}, woff2 files: ${wanted.length}`);
  fs.mkdirSync(OUT, { recursive: true });
  for (const r of wanted) {
    const url = new URL(r.woff2, HOST).href;
    const name = `EuclidCircularB-${r.weight}${r.style === 'italic' ? '-italic' : ''}.woff2`;
    if (report.files[name]) continue;
    await pause();
    const got = await page.evaluate(async (u) => {
      const res = await fetch(u);
      const b = new Uint8Array(await res.arrayBuffer());
      let s = '';
      for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
      return { status: res.status, type: res.headers.get('content-type') || '', b64: btoa(s) };
    }, url);
    if (got.status === 403 || got.status === 429) { console.error(`BLOCKED at ${url} (${got.status})`); exit = 2; break; }
    const buf = Buffer.from(got.b64, 'base64');
    const ok = got.status === 200 && buf.subarray(0, 4).toString('latin1') === 'wOF2';
    if (ok) fs.writeFileSync(path.join(OUT, name), buf);
    report.files[name] = {
      url, family: r.family, weight: r.weight, style: r.style, status: got.status, bytes: buf.length, ok,
    };
    console.log(`${got.status} ${ok ? 'woff2' : 'NOT woff2'} ${buf.length}B ${name} <- ${url}`);
  }
} finally {
  await browser.close().catch(() => {});
}
fs.mkdirSync(path.dirname(REPORT), { recursive: true });
fs.writeFileSync(REPORT, `${JSON.stringify(report, null, 1)}\n`);
process.exit(exit);
