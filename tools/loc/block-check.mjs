/* eslint-disable no-console, max-len, no-await-in-loop, no-restricted-syntax, import/extensions, import/prefer-default-export -- dev tooling */
/**
 * Block check after every app step (tools/loc/README.md): compares a target page's copy from
 * before the step with its read-back after it and lists every heading, paragraph, image and
 * block of the before copy that is missing after the step, ignoring what DA's editor
 * re-serialises (heading ids, <p> in metadata cells, <source> in pictures, the da-metadata
 * block). Content found after only inside an incoming merge block (da-diff-deleted) counts as
 * missing: it goes when that block is rejected. A missing item means: stop and restore the page
 * (from the labelled version or the local copy).
 *
 * --before: a local file (the copy of "Before every run") or a DA path; --after: a DA path (the
 * read-back) or a local file. Read only. Exit code 1 when something is missing.
 * Usage: node tools/loc/block-check.mjs --before ~/loc-backup/2026-10-28/de/de/x.html --after /de/de/x
 *        node tools/loc/block-check.mjs --pair <before-file> <DA path> [--pair …]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { missingItems } from './review-lib.mjs';
import { daClient } from './slug-step.mjs';

/** A local file, or a DA path (/cc/ll/...) read through the client. */
async function load(ref, da) {
  if (fs.existsSync(ref)) return fs.readFileSync(ref, 'utf8');
  if (!ref.startsWith('/')) throw new Error(`${ref}: neither a file nor a DA path`);
  const html = await da.get(ref.replace(/\.html$/, ''));
  if (!html) throw new Error(`${ref}: not in DA`);
  return html;
}

/** The check of one pair: {before, after, missing}. */
export async function checkPair(before, after, da) {
  return { before, after, missing: missingItems(await load(before, da), await load(after, da)) };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const argv = process.argv.slice(2);
  const pairs = argv.flatMap((a, i) => (a === '--pair' ? [[argv[i + 1], argv[i + 2]]] : []));
  if (argv.includes('--before')) pairs.push([argv[argv.indexOf('--before') + 1], argv[argv.indexOf('--after') + 1]]);
  if (!pairs.length) {
    console.error('block-check: --before <file|DA path> --after <DA path|file>, or --pair <before> <after> …');
    process.exit(1);
  }
  const da = daClient();
  let bad = 0;
  for (const [before, after] of pairs) {
    const r = await checkPair(before, after, da);
    if (r.missing.length) bad += 1;
    console.log(`${r.missing.length ? 'MISSING' : 'ok     '} ${after}: ${r.missing.length} items of the before copy missing`);
    r.missing.forEach((m) => console.log(`  ${m.kind}: ${m.text.length > 100 ? `${m.text.slice(0, 97)}…` : m.text} (${m.note})`));
  }
  if (bad) {
    console.log(`block-check: ${bad} page(s) lost content: stop and restore them`);
    process.exitCode = 1;
  }
}
