/* eslint-disable no-console */
/**
 * Post-import step: pages of a group whose leading (or trailing) sections are identical get those
 * sections authored once, in a shared fragment document, which each page includes with a
 * Fragment block. A change to the shared part is then one edit. Sections are compared as
 * imported (the Metadata block is not part of a section here; it stays on each page, so title,
 * canonical and robots stay per page).
 *
 * Groups (GROUPS below): the LoungeNet lounge pages (de/en only, www serves them under
 * /content/lh/markets/...): fra-first-class-lounge-b and muc-first-class-lounge are identical
 * except for their canonical URL, so all their sections go into
 * /de/en/fragments/loungenet-first-class-lounge.
 *
 * Run after the import (and head-metadata.mjs), before postprocess-media.mjs and the upload.
 * Idempotent: a page that already includes its group's fragment is left as it is.
 * Usage: node tools/importer/share-sections.mjs [--dry]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dry = process.argv.includes('--dry');

const LOUNGES = '/content/lh/markets/de/en/during-your-trip/lounges/loungenet';
const GROUPS = [
  {
    fragment: '/de/en/fragments/loungenet-first-class-lounge',
    pages: [`${LOUNGES}/fra-first-class-lounge-b`, `${LOUNGES}/muc-first-class-lounge`],
  },
];

const file = (p) => path.join(root, 'content', `${p}.plain.html`);

/** Top-level elements of an HTML string (by tag nesting depth), as strings. */
function topLevel(html, tag = 'div') {
  const out = [];
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'g');
  let depth = 0;
  let start = 0;
  let m = re.exec(html);
  while (m) {
    if (!m[1]) {
      if (depth === 0) start = m.index;
      depth += 1;
    } else {
      depth -= 1;
      if (depth === 0) out.push(html.slice(start, m.index + m[0].length));
    }
    m = re.exec(html);
  }
  return out;
}

/** Removes the Metadata block from a section; returns [section, metadata block or '']. */
function takeMetadata(section) {
  const at = section.indexOf('<div class="metadata">');
  if (at < 0) return [section, ''];
  const inner = section.slice(at);
  const [block] = topLevel(inner);
  return [section.slice(0, at) + section.slice(at + block.length), block];
}

const isEmpty = (section) => !section.replace(/<\/?div>/g, '').trim();
const fragmentBlock = (href) => `<div><div class="fragment"><div><div><a href="${href}">${href}</a></div></div></div></div>`;

GROUPS.forEach(({ fragment, pages }) => {
  const docs = pages.map((p) => {
    if (!fs.existsSync(file(p))) return null;
    const html = fs.readFileSync(file(p), 'utf8');
    if (html.includes(`href="${fragment}"`)) return { p, done: true };
    let metadata = '';
    const sections = topLevel(html).map((s) => {
      const [rest, meta] = takeMetadata(s);
      if (meta) metadata = meta;
      return rest;
    }).filter((s) => !isEmpty(s));
    return { p, sections, metadata };
  });
  if (docs.some((d) => !d)) {
    console.log(`${fragment}: skipped, not every page is imported`);
    return;
  }
  if (docs.every((d) => d.done)) {
    console.log(`${fragment}: already shared by ${pages.length} pages`);
    return;
  }
  if (docs.some((d) => d.done)) {
    console.log(`${fragment}: skipped, some pages already include it (re-import them all first)`);
    return;
  }
  const min = Math.min(...docs.map((d) => d.sections.length));
  const same = (i) => docs.every((d) => d.sections[i] === docs[0].sections[i]);
  let prefix = 0;
  while (prefix < min && same(prefix)) prefix += 1;
  if (!prefix) {
    console.log(`${fragment}: no identical leading sections, nothing shared`);
    return;
  }
  const shared = docs[0].sections.slice(0, prefix);
  if (!dry) {
    fs.mkdirSync(path.dirname(file(fragment)), { recursive: true });
    fs.writeFileSync(file(fragment), `${shared.join('\n')}\n`);
  }
  docs.forEach((d) => {
    const own = d.sections.slice(prefix);
    const meta = d.metadata ? `<div>${d.metadata}</div>` : '';
    const html = [fragmentBlock(fragment), ...own, meta].filter(Boolean).join('\n');
    if (!dry) fs.writeFileSync(file(d.p), `${html}\n`);
    console.log(`${d.p}: ${prefix} shared section(s) -> ${fragment}, ${own.length} own`);
  });
});
