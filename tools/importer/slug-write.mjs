/* eslint-disable import/extensions, max-len -- plain Node */
/**
 * One slug in every language at the write step (Ben's rule, tools/slugs/README.md; tests: test/slug-write.test.mjs).
 * Snapshots, archives and the local document trees stay keyed by the www path; the write step (da-upload.mjs) maps each page
 * through its site's map tools/slugs/<site>.json: the page is written at its canonical path (the English slug) when its alias
 * is active, its internal links the same way (own-links.mjs withCanonicalLinks). Every flag is off until a move round sets it,
 * so nothing changes before. TAP, Air Dolomiti and ITA have no map (slugMapOf: null): their paths stay as they are.
 *
 *   slugMapOf(site, {file})          the site's map (loadMap), or null; file: another copy (a test copy with flags on)
 *   writeTarget(p, map)              the path a page is written at: canonicalOf(p) for active entries, else p
 *   slugRefusal(daPath, map)         a write to a localized slug of an active entry: the refusal message (with the canonical
 *                                    path), else null
 *   holdAt(target, wwwPath, edits, map)  the author's hold (author-edits.json) of the page: at its target, its www path or any
 *                                    www path of the target (a hold follows the page to its canonical path)
 *   unmappedEntry(p, doc, map)       a page of a mapped root the map does not know (a catch-up import's new page or new slug):
 *                                    {path, source, verified, target}; verified when the document names its English page
 *                                    (primary-language-url, head-metadata.mjs) with another slug; the English slug only when
 *                                    verified and the root's flag is on, else its own path. null for a known page.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  loadMap, splitPath, joinPath, sanitizePath,
} from '../slugs/lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export function slugMapOf(site, { file } = {}) {
  const f = file ? path.resolve(file) : path.join(root, 'tools/slugs', `${site}.json`);
  if (!fs.existsSync(f)) return null;
  return loadMap(JSON.parse(fs.readFileSync(f, 'utf8')));
}

export const writeTarget = (p, map) => (map ? map.canonicalOf(p) : p);

export function slugRefusal(daPath, map) {
  if (!map) return null;
  const c = map.canonicalOf(daPath);
  return c !== daPath
    ? `${daPath}: a localized slug of an active entry (tools/slugs/${map.map.site}.json); the page is written at ${c}, refused`
    : null;
}

export function holdAt(target, wwwPath, edits, map) {
  const own = edits[target] || edits[wwwPath];
  if (own || !map) return own;
  return map.wwwPathsOf(target).map((p) => edits[p]).find(Boolean);
}

const exceptionKeys = new WeakMap();
const exceptionsOf = (map) => {
  if (!exceptionKeys.has(map)) exceptionKeys.set(map, new Set((map.map.exceptions || []).map((e) => e.key)));
  return exceptionKeys.get(map);
};

export function unmappedEntry(p, doc, map) {
  if (!map) return null;
  const sp = splitPath(p);
  if (!sp) return null;
  const [r, slug] = sp;
  if (!(r in map.map.active) || r === map.map.sourceRoot) return null;
  if (slug === '/' || /^\/(nav|footer)$/.test(slug) || /^\/fragments\//.test(slug)) return null;
  if (map.groupOf(p) || exceptionsOf(map).has(p)) return null;
  const row = String(doc).match(/<div><div>primary-language-url<\/div><div>(?:<p>)?([^<]*)/i);
  const named = row ? row[1].trim().replace(/^https?:\/\/[^/]+/, '').replace(/\/$/, '') : '';
  const src = splitPath(named);
  const source = src && src[0] === map.map.sourceRoot ? named : null;
  if (source && sanitizePath(src[1]) === slug) return null; // the same slug: nothing to move
  const verified = !!source;
  return {
    path: p, source, verified, target: verified && map.map.active[r] === true ? joinPath(r, sanitizePath(src[1])) : p,
  };
}
