/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, no-continue -- tooling */
/**
 * Brussels' share image (brief 414): the documents' Image metadata row is www's og:image, mostly
 * /etc/designs/dcep/logo-lh-og.jpg, which www itself no longer serves (302 to webv4, 403), on the
 * welcome pages two Frontify banners www answers 404 for. Edge Delivery can't fetch them and writes
 * og:image, og:image:secure_url and twitter:image as about:error. withShareImage puts Brussels'
 * own copy of the logo there (/content/dam/bel/images/local_images/logo-lh-og.jpg, 1200 x 628,
 * the homepages' share image); brussels-import.mjs applies it to every document it writes.
 *
 * The CLI does the same for the documents already in DA (lh-brussels), for the user's harness:
 *   node tools/importer/brussels-share-image.mjs --out <dir> (--all | --list <paths.txt>)
 *     --all            the paths of tools/importer/sites/lh-brussels.json
 *     [--from <dir>]   read <dir>/<path>.html instead of DA (no request)
 *     [--delay <ms>]   between DA reads (default 200)
 * Output: <dir>/<path>.html (each changed document, DA's source shape, otherwise byte for byte),
 * <dir>/changes.tsv (path, status: changed, unchanged, error; detail), <dir>/changed-paths.txt.
 * A second run with the same --out resumes (only errors are read again). Nothing is uploaded;
 * afterwards, if wanted (preview only):
 *   node tools/importer/da-upload.mjs --site lh-brussels --content-dir <dir>
 *     --list <dir>/changed-paths.txt
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
const HOST = 'https://www.brusselsairlines.com';

/** Brussels' own share logo (www serves it; the homepages' og:image). */
export const SHARE_IMAGE = `${HOST}/content/dam/bel/images/local_images/logo-lh-og.jpg`;

/** Share images www does not serve (checked 2026-11-06): the design logo, two banners. */
export const DEAD_SHARE_IMAGES = new Set([
  `${HOST}/etc/designs/dcep/logo-lh-og.jpg`,
  `${HOST}/content/dam/bel/images/frontify/2025/q1/12401866-BA_Imagocampagne-KV_banner_1440x480px_FR.jpg`,
  `${HOST}/content/dam/bel/images/frontify/2025/q1/12401866-BA_Imagocampagne-KV_banner_1440x480px_UK.jpg`,
]);

const IMAGE_ROW = /(<div><div>image<\/div><div><picture><img src=")([^"]*)("[^>]*><\/picture><\/div><\/div>)/gi;
const absolute = (src) => src.replace(/&amp;/g, '&')
  .replace(/^(?:https?:)?\/\/www\.brusselsairlines\.com(?=\/)/, HOST)
  .replace(/^\/(?!\/)/, `${HOST}/`);

/** The Image row's picture, Brussels' own logo where www does not serve the one given. */
export function withShareImage(doc) {
  return doc.replace(IMAGE_ROW, (m, a, src, b) => (DEAD_SHARE_IMAGES.has(absolute(src)) ? `${a}${SHARE_IMAGE}${b}` : m));
}

async function curl(args) {
  try {
    const { stdout } = await run('curl', ['-s', '-w', '\n%{http_code}', ...args], { maxBuffer: 16 * 1024 * 1024 });
    const i = stdout.lastIndexOf('\n');
    return { body: stdout.slice(0, i), status: Number(stdout.slice(i + 1)) };
  } catch (e) {
    return { body: String(e.message), status: 0 };
  }
}

async function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const argv = process.argv.slice(2);
  const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
  const out = opt('out');
  if (!out || (!argv.includes('--all') && !opt('list'))) {
    console.error('usage: brussels-share-image.mjs --out <dir> (--all | --list paths.txt) [--from <dir>] [--delay ms]');
    process.exit(1);
  }
  const from = opt('from');
  const delay = Number(opt('delay') ?? 200);
  const paths = opt('list')
    ? fs.readFileSync(opt('list'), 'utf8').split('\n').map((l) => l.trim()).filter(Boolean)
    : JSON.parse(fs.readFileSync(path.join(root, 'tools/importer/sites/lh-brussels.json'), 'utf8')).paths;

  fs.mkdirSync(out, { recursive: true });
  const tsv = path.join(out, 'changes.tsv');
  const rows = new Map();
  if (fs.existsSync(tsv)) {
    const lines = fs.readFileSync(tsv, 'utf8').split('\n').slice(1);
    lines.filter(Boolean).forEach((l) => {
      const [p, status, detail = ''] = l.split('\t');
      rows.set(p, { status, detail });
    });
  }
  const save = () => {
    fs.writeFileSync(tsv, `path\tstatus\tdetail\n${[...rows].map(([p, r]) => `${p}\t${r.status}\t${r.detail || ''}`).join('\n')}\n`);
    const changed = [...rows].filter(([, r]) => r.status === 'changed').map(([p]) => p);
    fs.writeFileSync(path.join(out, 'changed-paths.txt'), changed.length ? `${changed.join('\n')}\n` : '');
  };

  const count = {
    done: 0, changed: 0, unchanged: 0, error: 0,
  };
  for (const p of paths) {
    const known = rows.get(p);
    if (known && known.status !== 'error') { count.done += 1; continue; }
    let html = null;
    let detail = '';
    if (from) {
      const f = path.join(from, `${p}.html`);
      if (fs.existsSync(f)) html = fs.readFileSync(f, 'utf8');
      else detail = 'no file';
    } else {
      const r = await curl([`https://admin.da.live/source/moved-permanently/lh-brussels${p}.html`]);
      if (r.status === 200) html = r.body;
      else detail = `DA ${r.status}`;
      if (delay) await new Promise((res) => { setTimeout(res, delay); });
    }
    rows.delete(p);
    if (html === null) {
      rows.set(p, { status: 'error', detail });
      count.error += 1;
    } else {
      const next = withShareImage(html);
      const status = next === html ? 'unchanged' : 'changed';
      if (status === 'changed') {
        const file = path.join(out, `${p}.html`);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, next);
      }
      rows.set(p, { status, detail: '' });
      count[status] += 1;
    }
    if ((count.changed + count.unchanged + count.error) % 50 === 0) save();
  }
  save();
  console.log(`brussels-share-image: ${paths.length} paths, ${count.done} already done, ${count.changed} changed, ${count.unchanged} unchanged, ${count.error} error -> ${out}`);
}

const direct = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (direct) await main();
