/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, max-len, import/extensions -- tooling */
/**
 * Where www.austrian.com's paths lead: for each given path ONE warm Bright Data session
 * (/at/en/homepage first, then a same-origin GET per path inside the page, one every 5-10 s)
 * records the answer's status, the final URL after www's redirects and the page's canonical.
 * Stops at the first 403, 429 or challenge (exit 2; 30 minutes before the next session).
 * State (resumes): content-sites/lh-austrian/runs/resolve.json {path: {status, final, canonical}}.
 * Usage: node tools/importer/austrian-resolve.mjs --list <file of paths> [--min-delay 5000 --max-delay 10000]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
const HOST = 'https://www.austrian.com';
const STATE = path.join(root, 'content-sites/lh-austrian/runs/resolve.json');
const CHALLENGE = /just a moment|checking your browser|attention required|verifying you are human|access denied|^blocked$/i;
const state = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : {};
const save = () => fs.writeFileSync(STATE, `${JSON.stringify(state, null, 1)}\n`);
const paths = fs.readFileSync(opt('list'), 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
const todo = paths.filter((p) => !state[p] || !state[p].status);
if (!todo.length) {
  console.log('austrian-resolve: nothing to do');
  process.exit(0);
}
const [minDelay, maxDelay] = [Number(opt('min-delay', 5000)), Number(opt('max-delay', 10000))];
const EXCAT = process.env.EXCAT_ROOT || '/home/node/.excat-marketplaces/excat-marketplace';
const { connectBrowser } = await import(path.join(EXCAT, 'excat/skills/excat-scrape-webpage/scripts/browser-source.js'));
const browser = await connectBrowser('bd');
let code = 0;
try {
  const page = await browser.newPage();
  try { await page.goto(`${HOST}/at/en/homepage`, { timeout: 90000, waitUntil: 'domcontentloaded' }); } catch (e) { console.error(`navigation interrupted (${e.message.split('\n')[0]})`); }
  const title = async () => page.title().catch(() => 'just a moment');
  for (let i = 0; i < 60 && (CHALLENGE.test(await title()) || !(await title())); i += 1) await page.waitForTimeout(1000);
  if (CHALLENGE.test(await title())) throw new Error('homepage still behind the challenge');
  for (const p of todo) {
    await page.waitForTimeout(minDelay + Math.floor(Math.random() * Math.max(0, maxDelay - minDelay)));
    const got = await page.evaluate(async (u) => {
      const r = await fetch(u, { credentials: 'include' });
      const html = (r.headers.get('content-type') || '').includes('html') ? await r.text() : '';
      const canonical = (html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i) || html.match(/<link[^>]+href="([^"]+)"[^>]+rel="canonical"/i) || [])[1] || '';
      const titleText = (html.match(/<title>([^<]*)/i) || [])[1] || '';
      return {
        status: r.status, final: r.url, redirected: r.redirected, canonical, title: titleText.trim().slice(0, 120),
      };
    }, `${HOST}${p}`).catch((e) => ({ error: e.message.split('\n')[0] }));
    if (got.error) {
      console.error(`austrian-resolve: fetch failed at ${p} (${got.error}); stopping`);
      code = 1;
      break;
    }
    if (got.status === 403 || got.status === 429 || CHALLENGE.test(got.title || '')) {
      console.error(`austrian-resolve: ${got.status} at ${p}; stopping`);
      code = 2;
      break;
    }
    state[p] = { ...got, at: new Date().toISOString() };
    save();
    console.log(`${got.status} ${p} -> ${new URL(got.final).pathname}${got.canonical ? ` (canonical ${new URL(got.canonical, HOST).pathname})` : ''}`);
  }
} finally {
  await browser.close();
}
save();
process.exit(code);
