/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, no-continue, max-len, import/no-unresolved, import/extensions, import/prefer-default-export -- tooling */
/**
 * www.ita-airways.com's design-system icons and the footer's images through ONE warm Bright Data
 * session (/it/en/homepage first, then the given pages, one every 5-10 s; stops at a block):
 * - --icon <name>: the drawing of www's <maui-icon use="<name>"> as rendered (its shadow DOM SVG)
 *   on the first page that has it, written in lh-com's icon form (currentColor, 24px) to
 *   content-sites/lh-ita/assets/icons/<name>.svg (copy to /icons after a look);
 * - --file <www path>: a same-origin GET inside the page (e.g. the footer's SVGs), written to
 *   content-sites/lh-ita/assets/files/<www path>, with its size and type.
 * - --render <page> --wait <selector>: a late-rendering app page (the help centre) saved as its
 *   snapshot once the selector is there.
 * Usage: node tools/importer/ita-assets.mjs [--page /it/en/x ...] --icon car-front ... --file /content/dam/x.svg ...
 *          [--render /it/en/help-and-contact --wait '#help-center-web *']
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const EXCAT = process.env.EXCAT_ROOT || '/home/node/.excat-marketplaces/excat-marketplace';
const { connectBrowser } = await import(path.join(EXCAT, 'excat/skills/excat-scrape-webpage/scripts/browser-source.js'));
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const all = (n) => argv.flatMap((a, i) => (a === `--${n}` ? [argv[i + 1]] : []));
const HOST = 'https://www.ita-airways.com';
const OUT = path.join(root, 'content-sites/lh-ita/assets');
const CHALLENGE = /just a moment|checking your browser|attention required|verifying you are human|^blocked$/i;
const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });
const pause = () => sleep(5000 + Math.floor(Math.random() * 5000));

/** An icon's rendered SVG in lh-com's form: currentColor, 24px, the drawing's own viewBox. */
export function iconForm(svg) {
  const viewBox = (svg.match(/viewBox="([^"]+)"/) || [])[1] || '0 0 24 24';
  const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>[\s\S]*$/, '').replace(/\sfill="(?!none)[^"]*"/g, ' fill="currentColor"').trim();
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="${viewBox}">${inner}</svg>`;
}

const icons = new Set(all('icon'));
const files = all('file');
const pages = ['/it/en/homepage', ...all('page')];
const report = { icons: {}, files: {} };
let blocked = false;
const browser = await connectBrowser('bd');
try {
  const page = await browser.newPage();
  for (const p of pages) {
    if (!icons.size && p !== pages[0]) break;
    let status = null;
    page.once('response', (r) => { status = r.status(); });
    try { await page.goto(`${HOST}${p}`, { timeout: 90000, waitUntil: 'domcontentloaded' }); } catch (e) { console.error(`navigation interrupted (${e.message.split('\n')[0]})`); }
    const title = await page.title().catch(() => '');
    if (CHALLENGE.test(title) || status === 403 || status === 429) { blocked = true; console.error(`BLOCKED at ${p} (${status} ${title})`); break; }
    await sleep(4000);
    for (const name of [...icons]) {
      const svg = await page.evaluate(async (n) => {
        const el = document.querySelector(`maui-icon[use="${n}"]`);
        if (!el) return '';
        el.scrollIntoView();
        for (let i = 0; i < 20 && !(el.shadowRoot && el.shadowRoot.querySelector('svg')); i += 1) await new Promise((r) => { setTimeout(r, 250); });
        return el.shadowRoot?.querySelector('svg')?.outerHTML || '';
      }, name).catch(() => '');
      if (!svg) continue;
      fs.mkdirSync(path.join(OUT, 'icons'), { recursive: true });
      fs.writeFileSync(path.join(OUT, 'icons', `${name}.svg`), iconForm(svg));
      report.icons[name] = { page: p, bytes: svg.length };
      icons.delete(name);
      console.log(`icon ${name} from ${p}`);
    }
    if (p === pages[0]) {
      for (const f of files) {
        await pause();
        const got = await page.evaluate(async (u) => {
          const r = await fetch(u, { credentials: 'include' });
          const b = new Uint8Array(await r.arrayBuffer());
          let s = '';
          for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
          return { status: r.status, type: r.headers.get('content-type') || '', b64: btoa(s) };
        }, `${HOST}${f}`).catch((e) => ({ status: 0, error: e.message }));
        if (got.status === 403 || got.status === 429) { blocked = true; console.error(`BLOCKED at ${f} (${got.status})`); break; }
        const buf = Buffer.from(got.b64 || '', 'base64');
        if (got.status === 200) {
          const out = path.join(OUT, 'files', f);
          fs.mkdirSync(path.dirname(out), { recursive: true });
          fs.writeFileSync(out, buf);
        }
        report.files[f] = { status: got.status, type: got.type, bytes: buf.length };
        console.log(`${got.status} ${buf.length}B ${got.type} ${f}`);
      }
      if (blocked) break;
    }
    if (icons.size) await pause();
  }
  // --render <page> --wait <selector>: a page whose app renders late (the help centre's
  // <help-center-web>), saved once the selector is there, as bd-session saves its snapshots
  const renders = all('render');
  const wait = all('wait')[0] || 'body';
  if (renders.length && !blocked) {
    const { stripScripts } = await import(path.join(EXCAT, 'excat/skills/excat-scrape-webpage/scripts/strip-scripts.js'));
    for (const p of renders) {
      await pause();
      let status = null;
      page.once('response', (r) => { status = r.status(); });
      try { await page.goto(`${HOST}${p}`, { timeout: 90000, waitUntil: 'domcontentloaded' }); } catch (e) { console.error(`navigation interrupted (${e.message.split('\n')[0]})`); }
      const title = await page.title().catch(() => '');
      if (CHALLENGE.test(title) || status === 403 || status === 429) { blocked = true; console.error(`BLOCKED at ${p} (${status} ${title})`); break; }
      const found = await page.waitForSelector(wait, { timeout: 60000 }).then(() => true).catch(() => false);
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => { setTimeout(r, 200); });
        }
        window.scrollTo(0, 0);
      }).catch(() => {});
      await sleep(3000);
      const html = stripScripts(await page.content());
      const out = path.join(root, 'tools/importer/bd-snapshots/www.ita-airways.com', `${p}.html`);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, html);
      report.renders = { ...(report.renders || {}), [p]: { status, found, bytes: html.length } };
      console.log(`${status} rendered ${p} (${wait} ${found ? 'found' : 'NOT found'}, ${html.length} B)`);
    }
  }
} finally {
  await browser.close();
}
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'report.json'), `${JSON.stringify({ ...report, missingIcons: [...icons] }, null, 1)}\n`);
if (icons.size) console.log(`icons not found: ${[...icons].join(' ')}`);
process.exit(blocked ? 2 : 0);
