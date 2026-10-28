/* eslint-disable no-console, max-len, no-await-in-loop, no-restricted-syntax, no-continue, import/no-extraneous-dependencies, import/extensions, import/prefer-default-export -- dev tooling; entities is a dev dependency (linkedom) */
/**
 * The documents imported from www's Insights articles carry www's twice-escaped text as entity
 * text (`f&amp;uuml;r` in the document: the page shows "f&uuml;r"; transformers/lufthansa-cleanup.js
 * decodeEntityText has the cause and the import's fix). This decodes it once in the existing
 * documents: `&amp;<entity>;` becomes the character (`&amp;uuml;` -> ü, `&amp;copy;` -> ©,
 * `&amp;amp;` -> `&amp;`, `&amp;lt;` -> `&lt;`, `&amp;quot;` -> `&quot;`), in text and attributes;
 * an unknown name stays. Once only (a second run changes nothing).
 *
 * Dry run by default: the documents and their counts per locale (--list writes the paths).
 * --apply: per document the DA copy must hold nothing the local document lacks (else it is listed
 * and left alone), a labelled DA version ("before entity fix"), then the local document is
 * written; upload and preview with tools/importer/da-upload.mjs --list <the --list file>.
 * Usage: node tools/importer/fix-entity-text.mjs [--path /de/de/articles/x …] [--list out.txt] [--apply]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { decodeHTML } from 'entities';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CONTENT = path.join(root, 'content');
const ESCAPED = /&amp;(#\d{1,7}|#x[0-9a-f]{1,6}|[a-z][a-z0-9]{1,31});/gi;
const MARKUP = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
};

/** A document's HTML with its entity text decoded once: {html, count}. */
export function fixEntityText(html) {
  let count = 0;
  const out = String(html).replace(ESCAPED, (m, name) => {
    const c = decodeHTML(`&${name};`);
    if (!c || c === `&${name};`) return m;
    count += 1;
    return MARKUP[c] || c;
  });
  return { html: out, count };
}

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  const f = path.join(d, e.name);
  if (e.isSymbolicLink()) return [];
  return e.isDirectory() ? walk(f) : [f];
});

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const argv = process.argv.slice(2);
  const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
  const only = argv.flatMap((a, i) => (a === '--path' ? [argv[i + 1]] : []));
  const files = only.length
    ? only.map((p) => path.join(CONTENT, `${p}.plain.html`))
    : walk(CONTENT).filter((f) => f.endsWith('.plain.html'));
  const changed = [];
  for (const f of files) {
    if (!fs.existsSync(f)) continue;
    const p = f.slice(CONTENT.length).replace(/\.plain\.html$/, '');
    if (/^\/lhg(\/|$)/.test(p)) continue;
    const r = fixEntityText(fs.readFileSync(f, 'utf8'));
    if (r.count) changed.push({ path: p, file: f, ...r });
  }
  const group = (p) => (p.startsWith('/content/') ? p.split('/').slice(0, 4).join('/') : p.split('/').slice(1, 3).join('/'));
  const per = changed.reduce((m, c) => ({ ...m, [group(c.path)]: (m[group(c.path)] || 0) + 1 }), {});
  console.log(`fix-entity-text: ${changed.length} documents, ${changed.reduce((n, c) => n + c.count, 0)} entities: ${JSON.stringify(per)}`);
  if (!argv.includes('--apply')) {
    if (opt('list')) fs.writeFileSync(opt('list'), `${changed.map((c) => c.path).join('\n')}\n`);
    console.log('fix-entity-text: dry run (add --apply to write)');
    process.exit(0);
  }
  const { daClient } = await import('../loc/slug-step.mjs');
  const { missingItems } = await import('../loc/review-lib.mjs');
  const da = daClient();
  const done = [];
  const skipped = [];
  for (const c of changed) {
    const before = await da.get(c.path);
    if (!before) { skipped.push(`${c.path}: not in DA`); continue; }
    const local = fs.readFileSync(c.file, 'utf8');
    const lost = missingItems(before, `<body><main>${local}</main></body>`);
    if (lost.length) { skipped.push(`${c.path}: DA holds ${lost.length} items the local document lacks (${lost[0].text.slice(0, 60)})`); continue; }
    await da.version(c.path, 'before entity fix');
    fs.writeFileSync(c.file, c.html);
    done.push(c.path);
    if (done.length % 100 === 0) console.log(`  ${done.length} versioned and written`);
  }
  if (opt('list')) fs.writeFileSync(opt('list'), `${done.join('\n')}\n`);
  console.log(`fix-entity-text: ${done.length} documents versioned ("before entity fix") and written locally, ${skipped.length} left alone`);
  skipped.forEach((s) => console.log(`  ${s}`));
}
