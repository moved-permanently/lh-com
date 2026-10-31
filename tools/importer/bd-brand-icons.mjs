/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, no-continue, max-len, prefer-destructuring, import/no-unresolved, import/extensions -- tooling */
/**
 * A brand's favicon, web app manifest and the icons the manifest names, from its www through ONE
 * Bright Data session: the homepage first (warm-up), its head's icon and manifest links read in
 * the page, then each file fetched inside the page (same origin, one GET), at least 8 s apart.
 * Stops at a challenge, 403 or 429 (exit 2). Files are saved under their www paths:
 * <out>/<host>/<path>; <out>/<host>/head-icons.json records the links and the answers.
 *
 * Usage: node tools/importer/bd-brand-icons.mjs --home https://www.ita-airways.com/ --out <dir>
 *          [--gap 8000]
 */
import fs from 'node:fs';
import path from 'node:path';

const SCRAPE = process.env.EXCAT_SCRAPE_DIR
  || '/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-scrape-webpage/scripts';
const { connectBrowser } = await import(path.join(SCRAPE, 'browser-source.js'));
const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
const home = opt('home');
const out = path.resolve(opt('out'));
const gap = Math.max(8000, Number(opt('gap', 8000)));
const CHALLENGE = /just a moment|checking your browser|attention required|verifying you are human|performing security verification/i;
const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });
if (!home || !opt('out')) throw new Error('--home and --out are required');

const browser = await connectBrowser('bd');
let code = 0;
const record = { home, at: new Date().toISOString(), files: [] };
try {
  const page = await browser.newPage();
  page.setDefaultTimeout(60000);
  let status = 0;
  try {
    const resp = await page.goto(home, { waitUntil: 'domcontentloaded', timeout: 90000 });
    status = resp ? resp.status() : 0;
  } catch (e) { console.log('goto', e.message.split('\n')[0]); }
  for (let i = 0; i < 45 && CHALLENGE.test(await page.title().catch(() => 'just a moment')); i += 1) await sleep(1000);
  const title = await page.title().catch(() => '');
  record.status = status;
  record.finalUrl = page.url();
  record.title = title;
  console.log(`home ${status} ${page.url()} "${title}"`);
  if (CHALLENGE.test(title) || status === 403 || status === 429) {
    console.log('BLOCKED at the homepage: stop');
    code = 2;
  } else {
    const host = new URL(page.url()).host;
    const dir = path.join(out, host);
    record.links = await page.evaluate(() => [...document.querySelectorAll('link[rel]')]
      .filter((l) => /(^|\s)(icon|shortcut|manifest|apple-touch-icon(-precomposed)?|mask-icon)(\s|$)/i.test(l.rel))
      .map((l) => ({
        rel: l.rel, href: l.getAttribute('href'), abs: l.href, type: l.type, sizes: l.getAttribute('sizes'),
      })));
    console.log('links', JSON.stringify(record.links));
    const same = (u) => new URL(u, page.url()).origin === new URL(page.url()).origin;
    // the favicon (its link, else /favicon.ico), the manifest, then the manifest's icons
    const icons = record.links.filter((l) => !/manifest/i.test(l.rel)).map((l) => l.abs);
    if (!icons.length) icons.push(new URL('/favicon.ico', page.url()).href);
    const manifest = (record.links.find((l) => /manifest/i.test(l.rel)) || {}).abs;
    const queue = [...new Set([...icons, ...(manifest ? [manifest] : [])])];
    const fetched = new Set();
    while (queue.length && !code) {
      const url = queue.shift();
      if (fetched.has(url) || !same(url)) { if (!same(url)) record.files.push({ url, skipped: 'other origin' }); continue; }
      fetched.add(url);
      await sleep(gap + Math.floor(Math.random() * 2000));
      const answer = await page.evaluate(async (u) => {
        try {
          const r = await fetch(u, { credentials: 'same-origin' });
          const buf = new Uint8Array(await r.arrayBuffer());
          let bin = '';
          for (let i = 0; i < buf.length; i += 1) bin += String.fromCharCode(buf[i]);
          return {
            status: r.status, type: r.headers.get('content-type') || '', b64: btoa(bin), url: r.url,
          };
        } catch (e) { return { status: 0, error: e.message }; }
      }, url);
      const rel = new URL(url).pathname;
      console.log(`${answer.status} ${answer.type} ${rel}`);
      record.files.push({
        url, path: rel, status: answer.status, type: answer.type, finalUrl: answer.url, bytes: answer.b64 ? Math.floor(answer.b64.length * 0.75) : 0,
      });
      if (answer.status === 403 || answer.status === 429) { console.log('BLOCKED: stop'); code = 2; break; }
      if (answer.status !== 200) continue;
      const file = path.join(dir, rel);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      const body = Buffer.from(answer.b64, 'base64');
      fs.writeFileSync(file, body);
      if (url === manifest) {
        try {
          const json = JSON.parse(body.toString('utf8'));
          (json.icons || []).forEach((ic) => ic.src && queue.push(new URL(ic.src, url).href));
        } catch (e) { console.log('manifest is not JSON'); }
      }
    }
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'head-icons.json'), `${JSON.stringify(record, null, 1)}\n`);
  }
} finally {
  await browser.close().catch(() => {});
}
process.exit(code);
