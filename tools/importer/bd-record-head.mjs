/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, max-len, import/no-unresolved, import/extensions */
/**
 * Records the server <head> of AirCore route pages (JSON-LD and hreflang alternates) through ONE
 * warm Bright Data session: /de/en/homepage first, then the same page navigates to each route
 * page, one every 5-10 s; nothing is typed, clicked or submitted. The page snapshots of the import
 * have no <script> elements (the capture strips them), so the JSON-LD is only in the server HTML
 * of the navigation response.
 *
 * Output: tools/source-export/heads/{path}.html (the server HTML of the response) and
 * {path}.json = { url, status, recordedAt, jsonld: [{ where: head|body, data }], hreflang:
 * [{ hreflang, href }] (head links) } (resumes: a page with both files is not requested again).
 * 2026-10-24: the first run kept only the parsed <head> (no JSON-LD there: the server HTML has the
 * ld+json scripts in the body), so the 23 pages were requested a second time to keep the HTML.
 *
 * Usage: node tools/importer/bd-record-head.mjs [--list paths.txt] [--min-delay 5000] [--max-delay 10000]
 *   default list: the c-c and cy-cy rows of tools/importer/aircore-locales.csv
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const EXCAT = process.env.EXCAT_ROOT || '/home/node/.excat-marketplaces/excat-marketplace';
const SCRAPE = path.join(EXCAT, 'excat/skills/excat-scrape-webpage/scripts');
const { connectBrowser } = await import(path.join(SCRAPE, 'browser-source.js'));

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const opt = (name, def) => (argv.includes(`--${name}`) ? argv[argv.indexOf(`--${name}`) + 1] : def);
const LIVE = 'https://www.lufthansa.com';
const CHALLENGE = /just a moment|checking your browser|attention required|verifying you are human|performing security verification/i;
const minDelay = Number(opt('min-delay', 5000));
const maxDelay = Number(opt('max-delay', 10000));
const outDir = path.join(root, 'tools/source-export/heads');

const list = opt('list')
  ? fs.readFileSync(path.resolve(root, opt('list')), 'utf8').split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
  : fs.readFileSync(path.join(root, 'tools/importer/aircore-locales.csv'), 'utf8').trim().split('\n').slice(1)
    .flatMap((l) => l.split(',').slice(1)).map((s) => s.trim()).filter((p) => /\/o-d\/(c-c|cy-cy)\//.test(p));
const outFile = (p) => path.join(outDir, `${p}.json`);
const htmlFile = (p) => path.join(outDir, `${p}.html`);
const todo = list.filter((p) => !fs.existsSync(outFile(p)) || !fs.existsSync(htmlFile(p)));
console.log(`bd-record-head: ${list.length} pages, ${todo.length} to record`);
if (!todo.length) process.exit(0);

const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });
const wait = () => sleep(minDelay + Math.random() * (maxDelay - minDelay));
const hardTimer = setTimeout(() => { console.error('bd-record-head: hard timeout'); process.exit(124); }, 180000 + todo.length * (maxDelay + 90000));
hardTimer.unref();

function parseHead(html) {
  const end = html.indexOf('</head>');
  const h = html.slice(0, end > 0 ? end : html.length);
  const jsonld = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => {
    const where = m.index < end ? 'head' : 'body';
    try { return { where, data: JSON.parse(m[1]) }; } catch (e) { return { where, invalid: m[1].slice(0, 500) }; }
  });
  const hreflang = [...h.matchAll(/<link[^>]*rel="alternate"[^>]*>/gi)].map((m) => ({
    hreflang: (m[0].match(/hreflang="([^"]*)"/) || [])[1],
    href: (m[0].match(/href="([^"]*)"/) || [])[1],
  })).filter((x) => x.hreflang);
  return { jsonld, hreflang };
}

let stopped = null;
const browser = await connectBrowser('bd');
try {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 }).catch(() => {});
  console.log(`bd-record-head: warming up on ${LIVE}/de/en/homepage`);
  await page.goto(`${LIVE}/de/en/homepage`, { timeout: 90000 }).catch((e) => console.error(`  navigation interrupted (${e.message.split('\n')[0]})`));
  for (let i = 0; i < 60 && CHALLENGE.test(await page.title().catch(() => 'just a moment')); i += 1) await sleep(1000);
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  if (CHALLENGE.test(await page.title().catch(() => ''))) throw new Error('warm-up page still behind the challenge');
  await wait();
  for (const p of todo) {
    const started = Date.now();
    let resp = null;
    try {
      resp = await page.goto(`${LIVE}${p}`, { timeout: 90000, waitUntil: 'domcontentloaded' });
    } catch (e) {
      if (/has been closed/.test(e.message)) { stopped = 'the Bright Data session was closed'; break; }
      console.error(`  ${p}: navigation interrupted (${e.message.split('\n')[0]})`);
    }
    const title = await page.title().catch(() => '');
    const html = resp ? await resp.text().catch(() => '') : '';
    if (CHALLENGE.test(title) || /cf-chl|challenge-platform/i.test(html.slice(0, 5000))) { stopped = `Cloudflare challenge at ${p}`; break; }
    if (resp && resp.status() === 200 && html) {
      const head = parseHead(html);
      fs.mkdirSync(path.dirname(outFile(p)), { recursive: true });
      fs.writeFileSync(htmlFile(p), html);
      fs.writeFileSync(outFile(p), `${JSON.stringify({ url: `${LIVE}${p}`, status: 200, recordedAt: new Date().toISOString(), ...head }, null, 1)}\n`);
      console.log(`200 ${p}: ${head.jsonld.length} JSON-LD (${head.jsonld.map((j) => `${j.where}:${j.data ? (j.data['@type'] || (j.data['@graph'] ? 'graph' : '?')) : 'invalid'}`).join(', ')}), ${head.hreflang.length} hreflang`);
    } else {
      console.log(`${resp ? resp.status() : 'no response'} ${p}: not saved`);
    }
    await sleep(Math.max(0, started + minDelay + Math.random() * (maxDelay - minDelay) - Date.now()));
  }
} finally {
  await browser.close().catch(() => {});
}
console.log(`bd-record-head: done${stopped ? `; STOPPED: ${stopped}` : ''}`);
process.exit(stopped ? 2 : 0);
