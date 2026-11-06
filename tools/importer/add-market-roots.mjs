/* eslint-disable max-len, no-console -- tooling */
/**
 * Adds market roots to language documents' `markets` row (brief 413: ITA's us/es and ve/es on
 * es/es's documents), so lh-edge answers those roots from them. Reads each document from DA
 * (read only: GET admin.da.live/source; or --from, a folder of DA copies), writes the documents it
 * changed to --out as full DA documents (<path>.html, which da-upload.mjs --content-dir sends as
 * they are) and lists every path with what happened (changes.tsv) and the changed ones
 * (changed.txt). Never writes to DA, never previews or publishes.
 *
 * A row that already serves the root keeps its value: no row or an empty one (every market root
 * of the language), the root or its country listed. A row excluding the root's country (-us) is
 * left as it is and reported. Otherwise the roots are appended (", us/es, ve/es").
 *
 * List (--list): one document per line, `<path> <root>[,<root>...]`; # comments and blank lines.
 * Usage: node tools/importer/add-market-roots.mjs --site lh-ita --list <list.txt> --out <dir>
 *          [--from <dir of DA copies>]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const ORG = 'moved-permanently';

// the metadata block's markets row in DA's source shape (cells as text or one <p>)
const ROW = /(<div><div>(?:<p>)?markets(?:<\/p>)?<\/div><div>(?:<p>)?)([^<]*)((?:<\/p>)?<\/div><\/div>)/i;

const items = (value) => String(value || '').toLowerCase().split(/[\s,;]+/).filter(Boolean);

/** Whether a markets value serves a root: empty (every root), the root or its country listed. */
export function servesRoot(value, root) {
  const list = items(value);
  return !list.length || list.includes(root) || list.includes(root.split('/')[0]);
}

/** Whether a markets value excludes a root's country (-us) or the root itself (-us/es). */
export function excludesRoot(value, root) {
  const list = items(value);
  return list.includes(`-${root.split('/')[0]}`) || list.includes(`-${root}`);
}

/**
 * A DA document with roots added to its markets row: {html, status, before, after, added}.
 * status: added | serves (no row, an empty row or every root listed already) | excluded (a root
 * the row excludes: nothing added, the other roots neither).
 */
export function addRoots(html, roots) {
  const m = html.match(ROW);
  const before = m ? m[2] : null;
  if (!m || !before.trim()) {
    return {
      html, status: 'serves', before, after: before, added: [],
    };
  }
  if (roots.some((r) => excludesRoot(before, r))) {
    return {
      html, status: 'excluded', before, after: before, added: [],
    };
  }
  const added = roots.filter((r) => !servesRoot(before, r));
  if (!added.length) {
    return {
      html, status: 'serves', before, after: before, added,
    };
  }
  const after = `${before.trim().replace(/[,;]\s*$/, '')}, ${added.join(', ')}`;
  return {
    html: html.replace(ROW, (all, open, value, close) => `${open}${after}${close}`), status: 'added', before, after, added,
  };
}

/** The list's documents: [{path, roots}]. */
export function readList(text) {
  return text.split(/\r?\n/).map((l) => l.replace(/#.*/, '').trim()).filter(Boolean).map((l) => {
    const [p, roots = ''] = l.split(/\s+/);
    const list = roots.split(',').map((r) => r.trim()).filter(Boolean);
    if (!/^\/[a-z]{2}\/[a-z]{2}\/./.test(p) || !list.length || !list.every((r) => /^[a-z]{2}\/[a-z]{2}$/.test(r))) {
      throw new Error(`list: "${l}" is not "<path> <cc>/<ll>[,<cc>/<ll>...]"`);
    }
    return { path: p.replace(/\.html$/, ''), roots: list };
  });
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : '');
  const site = opt('site');
  const out = opt('out');
  if (!site || !opt('list') || !out) {
    console.error('usage: node tools/importer/add-market-roots.mjs --site lh-ita --list <list.txt> --out <dir> [--from <dir>]');
    process.exit(1);
  }
  const docs = readList(fs.readFileSync(opt('list'), 'utf8'));
  const read = (p) => {
    if (opt('from')) {
      const f = path.join(opt('from'), `${p}.html`);
      return fs.existsSync(f) ? { status: 200, body: fs.readFileSync(f, 'utf8') } : { status: 404, body: '' };
    }
    const raw = execFileSync('curl', ['-s', '-w', '\n%{http_code}', `https://admin.da.live/source/${ORG}/${site}${p}.html`], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
    const i = raw.lastIndexOf('\n');
    return { status: Number(raw.slice(i + 1)), body: raw.slice(0, i) };
  };
  const lines = [['path', 'status', 'before', 'after'].join('\t')];
  const changed = [];
  const count = {};
  docs.forEach(({ path: p, roots }) => {
    const r = read(p);
    let status;
    let before = '';
    let after = '';
    if (r.status !== 200 || !/<body>/i.test(r.body)) {
      status = `not read (${r.status})`;
    } else {
      const res = addRoots(r.body, roots);
      ({ status } = res);
      before = res.before ?? '(no row)';
      after = res.after ?? '(no row)';
      if (res.status === 'added') {
        const f = path.join(out, `${p}.html`);
        fs.mkdirSync(path.dirname(f), { recursive: true });
        fs.writeFileSync(f, res.html);
        changed.push(p);
      }
    }
    count[status] = (count[status] || 0) + 1;
    lines.push([p, status, before, after].join('\t'));
  });
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'changes.tsv'), `${lines.join('\n')}\n`);
  fs.writeFileSync(path.join(out, 'changed.txt'), changed.length ? `${changed.join('\n')}\n` : '');
  console.log(`add-market-roots: ${docs.length} documents: ${JSON.stringify(count)}; ${changed.length} written to ${out} (changes.tsv, changed.txt)`);
  if (Object.keys(count).some((s) => s.startsWith('not read'))) process.exitCode = 1;
}
