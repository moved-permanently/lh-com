/**
 * PNG copies of www SVGs that DA and live already hold (brief 464): the payment and social icons of
 * www's homepages (/content/dam/lh/icons/payment/*.svg, social-media/*.svg, the Klarna badge, the
 * Instagram logo over the 40 KB preview limit). They were rasterized once (2026-10-21) and are
 * named after the md5 of the www URL, as postprocess-media names its media (/media-da/<md5>.png).
 * index.json: www path -> { key: md5, svgSha256: the www SVG's bytes }; the files sit beside it.
 * A document may hold the www URL or, from a snapshot import, a local /media-da/ copy of the SVG
 * (recognised by its bytes).
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'png-copies');
export const PNG_COPIES = JSON.parse(fs.readFileSync(path.join(DIR, 'index.json'), 'utf8'));
const KEYS = new Set(Object.values(PNG_COPIES).map((c) => c.key));
const BY_SVG = new Map(Object.values(PNG_COPIES).map((c) => [c.svgSha256, c.key]));
const md5 = (s) => crypto.createHash('md5').update(s).digest('hex');
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

/** The copy's key for a reference (www URL or /media-da/<file>.svg in mediaDir), or null. */
function keyOf(url, mediaDir) {
  if (/^\/media-da\/[^/]+\.svg$/i.test(url)) {
    const file = path.join(mediaDir, url.slice('/media-da/'.length));
    return fs.existsSync(file) ? BY_SVG.get(sha256(fs.readFileSync(file))) || null : null;
  }
  let u;
  try { u = new URL(url, 'https://www.lufthansa.com/'); } catch (e) { return null; }
  if (u.hostname !== 'www.lufthansa.com') return null;
  const key = md5(`https://www.lufthansa.com${u.pathname}`);
  return KEYS.has(key) ? key : null;
}

/**
 * The /media-da/ copy of an image reference when one is known (the file is written into mediaDir
 * unless dry), else null.
 * @param {string} url absolute or root-relative www.lufthansa.com URL, or /media-da/<file>.svg
 * @param {string} mediaDir the documents' media-da folder
 * @param {boolean} [dry]
 */
export function pngCopyOf(url, mediaDir, dry = false) {
  const key = keyOf(String(url || ''), mediaDir);
  if (!key) return null;
  if (!dry) {
    fs.mkdirSync(mediaDir, { recursive: true });
    const target = path.join(mediaDir, `${key}.png`);
    if (!fs.existsSync(target)) fs.copyFileSync(path.join(DIR, `${key}.png`), target);
  }
  return `/media-da/${key}.png`;
}
