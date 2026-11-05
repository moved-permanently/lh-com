/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, no-continue -- tooling */
/**
 * lh-com's article documents (de/en, de/de): www's heading over the related articles (row 24 of
 * tools/reports/lufthansa/parity.md, brief 407: www's maui-headline h3 at the h2 size, "Related
 * Articles" / "Ähnliche Artikel"; the import left it out). For each document, read from DA (or a
 * folder of DA documents), `<h3>… {heading-medium}</h3>` goes right before the related-articles
 * block where no heading is there (in the block's section, or ending the section before); the rest
 * of the document stays byte for byte. Nothing is uploaded or previewed.
 *
 * Output (--out <dir>):
 *   <dir>/<path>.html      each changed document in DA's source shape (<body>…<main>…</main>…)
 *   <dir>/changes.tsv      path, status (changed, has-heading, no-block, skipped, error), detail
 *   <dir>/changed-paths.txt  the changed paths, one a line
 * A second run with the same --out resumes: the documents already listed (except errors) are not
 * read again.
 *
 * Usage:
 *   node tools/importer/related-articles-heading.mjs --out <dir>
 *     (--lang en,de | --list <paths.txt>)   the articles indexes' paths (preview), or a list
 *     [--from <dir>]   read <dir>/<path>.html instead of DA (no request)
 *     [--delay <ms>]   between DA reads (default 200)
 *     [--index-host https://main--lh-com--moved-permanently.aem.page]
 * Upload afterwards, if wanted (preview only):
 *   node tools/importer/da-upload.mjs --site lh-com --content-dir <dir>
 *     --list <dir>/changed-paths.txt
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);

/** www's heading per article language. */
export const RELATED_LABELS = { en: 'Related Articles', de: 'Ähnliche Artikel' };

/** An lh-com article's language from its path: /de/en/… en, /de/de/… de, else null. */
export const langOf = (p) => {
  const m = String(p).match(/^\/de\/(en|de)\//);
  return m ? m[1] : null;
};

const BLOCK = '<div class="related-articles';

/**
 * The heading before the related-articles block, if missing.
 * @param {string} html a DA document (<body>…<main>…</main>…</body>)
 * @param {string|null} lang en or de
 * @returns {{status: string, html: string, detail?: string}}
 */
export function addRelatedHeading(html, lang) {
  const label = RELATED_LABELS[lang];
  if (!label) return { status: 'skipped', html, detail: `no heading for language ${lang}` };
  const start = html.indexOf('<main>');
  const end = html.lastIndexOf('</main>');
  if (!/^\s*<body>/.test(html) || start < 0 || end < start) {
    return { status: 'skipped', html, detail: 'not a DA document (<body>, <main>)' };
  }
  const body = html.slice(start, end);
  const at = body.indexOf(BLOCK);
  if (at < 0) return { status: 'no-block', html };
  if (body.indexOf(BLOCK, at + 1) >= 0) {
    return { status: 'skipped', html, detail: 'more than one related-articles block' };
  }
  const before = body.slice(0, at);
  // a heading right before the block, or ending the section before (the block first in its own)
  if (/<\/h[1-6]>\s*$/.test(before) || /<\/h[1-6]>\s*<\/div>\s*<div>\s*$/.test(before)) return { status: 'has-heading', html };
  const i = start + at;
  return { status: 'changed', html: `${html.slice(0, i)}<h3>${label} {heading-medium}</h3>${html.slice(i)}` };
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
  const argv = process.argv.slice(2);
  const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
  const out = opt('out');
  if (!out || (!opt('lang') && !opt('list'))) {
    console.error('usage: related-articles-heading.mjs --out <dir> (--lang en,de | --list paths.txt) [--from <dir>] [--delay ms] [--index-host url]');
    process.exit(1);
  }
  const from = opt('from');
  const delay = Number(opt('delay') ?? 200);
  const host = opt('index-host') || 'https://main--lh-com--moved-permanently.aem.page';

  let paths = [];
  if (opt('list')) {
    paths = fs.readFileSync(opt('list'), 'utf8').split('\n').map((l) => l.trim()).filter(Boolean);
  } else {
    for (const l of opt('lang').split(',').map((x) => x.trim()).filter(Boolean)) {
      const r = await curl([`${host}/de/${l}/articles/query-index.json?limit=5000`]);
      if (r.status !== 200) { console.error(`index de/${l}: ${r.status}`); process.exit(1); }
      paths.push(...JSON.parse(r.body).data.map((d) => d.path));
    }
  }

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
    done: 0, changed: 0, 'has-heading': 0, 'no-block': 0, error: 0, skipped: 0,
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
      const r = await curl([`https://admin.da.live/source/moved-permanently/lh-com${p}.html`]);
      if (r.status === 200) html = r.body;
      else detail = `DA ${r.status}`;
      if (delay) await new Promise((res) => { setTimeout(res, delay); });
    }
    // a row per document, in the order read (a retried error moves to the end)
    rows.delete(p);
    if (html === null) {
      rows.set(p, { status: 'error', detail });
      count.error += 1;
    } else {
      const r = addRelatedHeading(html, langOf(p));
      if (r.status === 'changed') {
        const file = path.join(out, `${p}.html`);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, r.html);
      }
      rows.set(p, { status: r.status, detail: r.detail || '' });
      count[r.status] += 1;
    }
    const read = count.changed + count['has-heading'] + count['no-block'] + count.error + count.skipped;
    if (read % 50 === 0) save();
  }
  save();
  console.log(`related-articles-heading: ${paths.length} paths, ${count.done} already done, ${count.changed} changed, ${count['has-heading']} has-heading, ${count['no-block']} no-block, ${count.error} error, ${count.skipped} skipped -> ${out}`);
}

const direct = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (direct) await main();
