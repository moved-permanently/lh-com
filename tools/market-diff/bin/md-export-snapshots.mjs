/* eslint-disable import/extensions, max-len, no-console -- dev tooling */
// market-diff snapshots for the importers: writes the raw server HTML that md-fetch.mjs saved for the given paths as
// <out>/<path>.html (the layout of tools/importer/bd-snapshots/<host>/), so an importer can read them like captured pages.
// Cloudflare's e-mail protection is undone as the browser's email-decode script does it: links to
// /cdn-cgi/l/email-protection#<hex> become mailto: links and [data-cfemail] placeholders the address, else the documents
// get "[email protected]" texts. The HTML is the server's: widgets that the browser renders (flight search, destination
// finder, feedback) are empty in it; take them from the language version's document.
//
// usage: node bin/md-export-snapshots.mjs --fetch <run dir> --paths <file: one path per line, or TSV with the path first>
//          --out <dir, e.g. ../importer/bd-snapshots/www.swiss.com> [--strip-prefix /content/lh/markets]
// --strip-prefix: write /content/lh/markets/xx/en/foo as /xx/en/foo. Prints written, missing (not fetched or not ok).
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { cfEmail } from '../lib/aem-html.mjs';
import readText from '../lib/files.mjs';

const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
if (!opt('fetch') || !opt('paths') || !opt('out')) {
  console.error('usage: md-export-snapshots.mjs --fetch <dir> --paths <file> --out <dir> [--strip-prefix <prefix>]');
  process.exit(1);
}
const FETCH = path.resolve(opt('fetch'));
const OUT = path.resolve(opt('out'));
const STRIP = opt('strip-prefix', '');
const latest = new Map();
fs.readFileSync(path.join(FETCH, 'fetch.jsonl'), 'utf8').split('\n').filter(Boolean).forEach((l) => {
  try { const r = JSON.parse(l); if (r.path) latest.set(r.path, r); } catch (e) { /* torn line */ }
});
const paths = [...new Set(readText(opt('paths')).split('\n').map((l) => l.replace(/#.*/, '').split('\t')[0].trim())
  .filter((l) => l.startsWith('/')))];

/** The page as the browser shows it after Cloudflare's email-decode script. */
function decodeEmails(html) {
  return html
    .replace(/\/cdn-cgi\/l\/email-protection#([0-9a-f]+)/gi, (m, hex) => `mailto:${cfEmail(hex)}`)
    .replace(/<(span|a)\b([^>]*?)\sdata-cfemail="([0-9a-f]+)"([^>]*)>[\s\S]*?<\/\1>/gi, (m, tag, a, hex, b) => {
      const attrs = `${a}${b}`.replace(/\sclass="__cf_email__"/i, '');
      return tag.toLowerCase() === 'span' && !attrs.trim() ? cfEmail(hex) : `<${tag}${attrs}>${cfEmail(hex)}</${tag}>`;
    });
}

let written = 0;
const missing = [];
paths.forEach((p) => {
  const r = latest.get(p);
  if (!r || r.kind !== 'ok' || !r.file) { missing.push(p); return; }
  const html = zlib.gunzipSync(fs.readFileSync(path.join(FETCH, r.file))).toString('utf8');
  const name = (STRIP && p.startsWith(STRIP) ? p.slice(STRIP.length) : p).replace(/\/$/, '') || '/index';
  const file = path.join(OUT, `${name}.html`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, decodeEmails(html));
  written += 1;
});
console.log(JSON.stringify({ written, missing: missing.length, firstMissing: missing.slice(0, 5) }));
