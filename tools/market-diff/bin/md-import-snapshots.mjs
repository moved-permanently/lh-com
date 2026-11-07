/* eslint-disable max-len, no-console, no-continue, no-restricted-syntax, object-curly-newline -- dev tooling */
// Puts saved raw server HTML (e.g. tools/importer/bd-snapshots/www.flytap.com/<path>.html) into a fetch folder as if
// md-fetch.mjs had asked for it, so md-compare.mjs can run on pages that were captured before (no new request).
// Only for captures of the raw server answer (TAP's), not rendered snapshots.
// usage: node bin/md-import-snapshots.mjs --dir <snapshots/<host>> --paths <file: one path per line> --out <fetch dir>
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';

const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
const DIR = path.resolve(opt('dir'));
const OUT = path.resolve(opt('out'));
fs.mkdirSync(path.join(OUT, 'bodies'), { recursive: true });
const paths = fs.readFileSync(opt('paths'), 'utf8').split('\n').map((l) => l.split('\t')[0].trim()).filter((l) => l.startsWith('/'));
let n = 0;
for (const p of new Set(paths)) {
  const f = path.join(DIR, `${p.replace(/\/$/, '')}.html`);
  if (!fs.existsSync(f)) continue;
  const body = fs.readFileSync(f, 'utf8');
  const key = crypto.createHash('sha1').update(p).digest('hex');
  const file = path.join('bodies', key.slice(0, 2), `${key}.gz`);
  fs.mkdirSync(path.join(OUT, path.dirname(file)), { recursive: true });
  fs.writeFileSync(path.join(OUT, file), zlib.gzipSync(Buffer.from(body, 'utf8')));
  const row = { at: fs.statSync(f).mtime.toISOString(), path: p, kind: 'ok', http: 200, file, bytes: Buffer.byteLength(body), sha256: crypto.createHash('sha256').update(body).digest('hex'), note: `imported from ${f}` };
  fs.appendFileSync(path.join(OUT, 'fetch.jsonl'), `${JSON.stringify(row)}\n`);
  n += 1;
}
console.log(n, 'imported of', new Set(paths).size);
