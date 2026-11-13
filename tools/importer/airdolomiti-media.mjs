/* eslint-disable max-len, import/extensions -- tooling */
/**
 * Air Dolomiti's pictures by their DA copies (the standing order of 2026-11-10, item 2a): the name of
 * a www file's copy (airdolomiti-assets.mjs settle names them so: /media-da/airdolomiti/<readable
 * name>-<sha1 of the URL, 8>.<ext>), the copy DA already has (lh-airdolomiti's upload state lists
 * every uploaded copy), and the www files www answers 404 for (airdolomiti-missing-assets.json, as
 * Austrian's austrian-missing-assets.json: added only with www's answer recorded). The importer
 * writes DA's copy for a picture it has not downloaded instead of www's cms.airdolomiti.it address
 * (the import helper had patched those to DA's copies after every import), and leaves a listed
 * missing file out.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sha1 = (s) => crypto.createHash('sha1').update(s).digest('hex');

/** The file types Edge Delivery serves and their extensions. */
export const EXT = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg', 'application/pdf': 'pdf', 'video/mp4': 'mp4',
};

/** A readable name of a file URL ('/2025/06/Monaco-Banner-D.jpg' -> 'monaco-banner-d'). */
export const baseName = (url) => decodeURIComponent(new URL(url).pathname.split('/').pop() || 'file').replace(/\.[a-z0-9]{2,4}$/i, '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 60)
  .replace(/-+$/, '') || 'file';

/**
 * The Edge Delivery path of a www file's copy.
 * @param {string} key the file's URL without query
 * @param {string} type its content type
 */
export function copyPath(key, type) {
  if (/^image\//.test(type)) return `/media-da/airdolomiti/${baseName(key)}-${sha1(key).slice(0, 8)}.${type === 'image/svg+xml' ? 'png' : EXT[type]}`;
  return `/documents/${baseName(key)}-${sha1(key).slice(0, 6)}.${EXT[type]}`;
}

let daMedia;
/** The copies DA has (lh-airdolomiti's upload state's media). */
export function daCopies(file = path.join(root, 'tools/importer/da-upload-state-lh-airdolomiti.json')) {
  if (!daMedia) daMedia = new Set(Object.keys((fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {}).media || {}));
  return daMedia;
}

/**
 * DA's copy of a www picture, or null: the copy's name for each picture type the copies have (an SVG's
 * copy is a PNG), the first one DA lists.
 * @param {string} url the picture's URL
 * @param {Set<string>} [copies] DA's copies
 */
export function daCopyOf(url, copies = daCopies()) {
  const key = String(url || '').replace(/[?#].*$/, '');
  if (!/^https?:\/\//.test(key)) return null;
  return ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].map((t) => copyPath(key, t)).find((p) => copies.has(p)) || null;
}

let missing;
/** The www files www answers 404 for (airdolomiti-missing-assets.json), by URL without query. */
export function missingAssets(file = path.join(root, 'tools/importer/airdolomiti-missing-assets.json')) {
  if (!missing) missing = new Set(((fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {}).assets || []).map((a) => String(a.url).replace(/[?#].*$/, '')));
  return missing;
}
