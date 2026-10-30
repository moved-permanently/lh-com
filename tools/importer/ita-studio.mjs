/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, max-len, import/no-unresolved, import/extensions, import/no-extraneous-dependencies -- tooling */
/**
 * The Studio capture of www.ita-airways.com (rendered pages from a real browser, delivered as
 * ita-snapshots-NNN.tar.gz with a manifest.json) into lh-ita's capture:
 *   --place <unpacked dir> ...  every manifest file checked (bytes, sha256), copied to its snapshot
 *       path (snapshotPathFor: tools/importer/bd-snapshots/www.ita-airways.com/<path>.html) only
 *       where there is none yet (an own capture wins), and recorded in the capture state
 *       (content-sites/lh-ita/bd-session-state.json: status ok, source studio, the manifest's
 *       capture time), so bd-session.mjs counts them as captured. Log: content-sites/lh-ita/studio.json
 *   --pages  cleaned.html and metadata.json (as bd-session.mjs writes them, source studio, no
 *       screenshots) for the placed snapshots that have none: each snapshot loaded into a local
 *       browser under its own URL with every other request aborted (nothing is loaded from www).
 * Usage: node tools/importer/ita-studio.mjs --place /tmp/x-ita-snapshots-001 ... | --pages
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const EXCAT = process.env.EXCAT_ROOT || '/home/node/.excat-marketplaces/excat-marketplace';
const { snapshotPathFor } = await import(path.join(EXCAT, 'excat/skills/excat-scrape-webpage/scripts/bd-scrape.js'));
const W = path.join(root, 'content-sites/lh-ita');
const STATE = path.join(W, 'bd-session-state.json');
const LOG = path.join(W, 'studio.json');
const PAGES = path.join(W, 'pages');
const readJson = (f, d) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : d);

function place(dirs) {
  const state = readJson(STATE, { pages: {} });
  const log = readJson(LOG, { archives: {}, placed: {}, kept: {} });
  dirs.forEach((dir) => {
    const archive = path.basename(dir).replace(/^x-/, '');
    const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
    let placed = 0;
    let kept = 0;
    manifest.forEach((m) => {
      if (m.status !== 'ok' || !m.file) return;
      const src = path.join(dir, m.file.replace(/^snapshots\//, ''));
      const buf = fs.readFileSync(src);
      if (buf.length !== m.bytes || crypto.createHash('sha256').update(buf).digest('hex') !== m.sha256) throw new Error(`${archive}: ${m.file} differs from its manifest`);
      const dest = snapshotPathFor(m.url, root);
      // an own capture whose flight search came out in English on a root of another language
      // (the Bright Data session got the widget's English labels: it/it, fr/fr, de/de homepages)
      // gives way to the Studio's; it is kept in content-sites/lh-ita/own-replaced/
      const worse = fs.existsSync(dest) && !log.placed[m.url] && !/^\/[a-z]{2}\/en\//.test(new URL(m.url).pathname)
        && /class="dcep-flight-manager/.test(fs.readFileSync(dest, 'utf8')) && /buttontriggerlabel="Cabin Classes"|>Round trip</.test(fs.readFileSync(dest, 'utf8'));
      if (worse) {
        const keep = path.join(W, 'own-replaced', `${new URL(m.url).pathname}.html`);
        fs.mkdirSync(path.dirname(keep), { recursive: true });
        fs.copyFileSync(dest, keep);
        log.replaced = { ...(log.replaced || {}), [m.url]: { archive, reason: 'own capture: flight search in English', kept: path.relative(root, keep) } };
        delete log.kept[m.url];
      }
      if (fs.existsSync(dest) && !log.placed[m.url] && !worse) {
        kept += 1;
        log.kept[m.url] = { archive, reason: 'own capture' };
        return;
      }
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, buf);
      state.pages[m.url] = {
        status: 'ok', source: 'studio', http: m.http, at: m.at, archive, sha256: m.sha256, imagesTotal: m.imagesTotal, imagesPlaceholder: m.imagesPlaceholder,
      };
      log.placed[m.url] = { archive, at: m.at, bytes: m.bytes };
      placed += 1;
    });
    log.archives[archive] = {
      entries: manifest.length, placed, kept, at: new Date().toISOString(),
    };
    console.log(`${archive}: ${manifest.length} entries, ${placed} placed, ${kept} kept (own capture)`);
  });
  fs.writeFileSync(STATE, JSON.stringify(state, null, 1));
  fs.writeFileSync(LOG, `${JSON.stringify(log, null, 1)}\n`);
}

async function pages() {
  const UPSTREAM = path.join(EXCAT, 'edge-delivery-services/skills/scrape-webpage/scripts');
  const { extractCleanedHTML, extractMetadata } = await import(path.join(UPSTREAM, 'analyze-webpage.js'));
  const { generateDocumentPathInfo } = await import(path.join(UPSTREAM, 'generate-path.js'));
  const log = readJson(LOG, { placed: {} });
  const todo = Object.keys(log.placed).filter((u) => !fs.existsSync(path.join(PAGES, new URL(u).pathname.replace(/^\//, ''), 'metadata.json')));
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  let done = 0;
  try {
    for (const url of todo) {
      const snap = snapshotPathFor(url, root);
      const html = fs.readFileSync(snap, 'utf8');
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
      const page = await context.newPage();
      page.setDefaultTimeout(15000);
      try {
        // the snapshot under its own URL; nothing else is requested from anywhere
        await page.route('**/*', (route) => (route.request().url() === url && route.request().isNavigationRequest()
          ? route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: html })
          : route.abort()));
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        const dir = path.join(PAGES, new URL(url).pathname.replace(/^\/|\/$/g, '') || 'index');
        fs.mkdirSync(dir, { recursive: true });
        const alternates = await page.evaluate(() => [...document.querySelectorAll('link[rel="alternate"][hreflang]')]
          .map((l) => ({ hreflang: l.getAttribute('hreflang'), href: l.href }))).catch(() => []);
        const metadata = await extractMetadata(page).catch(() => ({}));
        fs.writeFileSync(path.join(dir, 'cleaned.html'), await extractCleanedHTML(page));
        fs.writeFileSync(path.join(dir, 'metadata.json'), JSON.stringify({
          url,
          source: 'studio',
          timestamp: log.placed[url].at,
          paths: generateDocumentPathInfo(url),
          screenshot: null,
          html: { filePath: path.join(dir, 'cleaned.html') },
          rawHtml: { filePath: snap, size: html.length },
          metadata,
          images: { mapping: {} },
          alternates,
          scripts: null,
          screenshots: [],
        }, null, 2));
        done += 1;
      } catch (e) {
        console.log(`ERR ${url}: ${e.message.split('\n')[0]}`);
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
  console.log(`ita-studio pages: ${done}/${todo.length} cleaned.html and metadata.json written`);
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  if (argv.includes('--place')) place(argv.slice(argv.indexOf('--place') + 1).filter((a) => !a.startsWith('--')));
  if (argv.includes('--pages')) await pages();
}
