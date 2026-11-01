/* eslint-disable no-console, max-len, no-await-in-loop, no-restricted-syntax, import/extensions, import/prefer-default-export -- dev tooling */
/**
 * Clears a target page's review record after a review (tools/loc/README.md): removes its
 * `da-metadata` block, where DA's editor keeps the hashes of accepted and rejected incoming
 * blocks. A rejected hash that equals one of the page's own blocks (the same heading, only the id
 * differs) makes the next merge drop that block without a mark (da-nx regional-diff.js 434-438),
 * so the record goes before anything is sent into the page again. Blocks the author kept local
 * are marked again in the next round (that already happens).
 *
 * Dry run by default: lists the rows it would remove. --apply: a labelled DA version first
 * ("before clear-review <date>"), then the page without the block, then a read-back that must
 * equal what was written and hold no da-metadata block. Never previews or publishes.
 * --linked-images: instead, only the da-diff-added mark of links around a picture (review-lib.mjs
 * removeLinkedImageMarks; no editor action resolves it and the rollout refuses the page); the
 * da-metadata block and every other mark stay. Run it before every rollout from that page. Dry run
 * by default as well; --apply: a labelled version ("before clear-review --linked-images <date>").
 * --root /drafts/loc-test: every DA path below that folder. Login: DA_TOKEN (slug-step.mjs daClient).
 * Usage: node tools/loc/clear-review.mjs --page /de/de/book-and-manage/rebook [--page …] [--linked-images] [--apply]
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { removeDaMetadata, removeLinkedImageMarks } from './review-lib.mjs';
import { daClient } from './slug-step.mjs';

/** The marks of linked images only (--linked-images): {page, status, removed: [{href, image}]}. */
async function unmarkLinkedImages(page, at, html, { da, apply, today }) {
  const r = removeLinkedImageMarks(html);
  if (!r.changed) return { page, status: 'no marked linked image', removed: [] };
  if (!apply) return { page, status: 'would unmark', removed: r.removed };
  await da.version(at, `before clear-review --linked-images ${today}`);
  await da.put(at, r.html);
  const back = await da.get(at);
  if (!back || removeLinkedImageMarks(back).changed) throw new Error(`${at}: the read-back still holds a marked linked image`);
  if (back.trim() !== r.html.trim()) throw new Error(`${at}: the read-back differs from what was written`);
  return { page, status: 'unmarked', removed: r.removed };
}

/** Clears one page: {page, status, removed}. */
export async function clearReview(page, {
  da, apply = false, rootDir = '', today = new Date().toISOString().slice(0, 10), linkedImages = false,
}) {
  if (/^\/lhg(\/|$)|^\/[a-z]{2}\/[a-z]{2}\/(login|profile)(\/|$)/.test(page)) return { page, status: 'refused (lhg, login or profile)', removed: [] };
  const at = `${rootDir}${page}`;
  const html = await da.get(at);
  if (!html) return { page, status: 'not in DA', removed: [] };
  if (linkedImages) return unmarkLinkedImages(page, at, html, { da, apply, today });
  const r = removeDaMetadata(html);
  if (!r.changed) return { page, status: 'no da-metadata block', removed: [] };
  if (!apply) return { page, status: 'would remove', removed: r.removed };
  await da.version(at, `before clear-review ${today}`);
  await da.put(at, r.html);
  const back = await da.get(at);
  if (!back || back.includes('class="da-metadata"')) throw new Error(`${at}: the read-back still holds a da-metadata block`);
  if (back.trim() !== r.html.trim()) throw new Error(`${at}: the read-back differs from what was written`);
  return { page, status: 'removed', removed: r.removed };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const argv = process.argv.slice(2);
  const pages = argv.flatMap((a, i) => (a === '--page' ? [argv[i + 1]] : []));
  if (!pages.length) {
    console.error('clear-review: --page /<cc>/<ll>/<path> (one or more)');
    process.exit(1);
  }
  const rootDir = argv.includes('--root') ? argv[argv.indexOf('--root') + 1] : '';
  const da = daClient();
  for (const page of pages) {
    const r = await clearReview(page, {
      da, apply: argv.includes('--apply'), rootDir, linkedImages: argv.includes('--linked-images'),
    });
    const rows = r.removed.map((row) => Object.entries(row).map(([k, v]) => `${k}=${v.length > 60 ? `${v.slice(0, 57)}…` : v}`).join('; ')).join(' | ');
    console.log(`${r.status.padEnd(20)} ${rootDir}${page}${rows ? `: ${rows}` : ''}`);
  }
  if (!argv.includes('--apply')) console.log('clear-review: dry run (add --apply to write)');
}
