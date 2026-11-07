/**
 * The video links switch-dam-media switches to the site's own copies: www's
 * (https://www.lufthansa.com/content/dam/...mp4) and media.lufthansa.com's, the same DAM paths on a
 * host that is gone (NXDOMAIN since 2026-11; brief 464). Groups: 1 the address, 2 the other
 * attributes, 3 the link text.
 */
import { decodePath } from '../../scripts/dam-path.js';

export const VIDEO_LINK = /<a href="(https:\/\/(?:www|media)\.lufthansa\.com\/content\/dam\/[^"]+\.mp4)"([^>]*)>([\s\S]*?)<\/a>/g;

const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&amp;/g, '&');

/** The asset path (/content/dam/..., decoded) of a video link's address. */
export function videoAsset(href) {
  return decodePath(decode(href).replace(/^https:\/\/(?:www|media)\.lufthansa\.com/, ''));
}

/**
 * The link text after the switch: the copy's path when the text was the address (or its path),
 * else the text as it is.
 */
export function switchedText(text, href, own) {
  const t = decode(String(text).trim());
  const full = decode(href);
  const pathOnly = full.replace(/^https:\/\/(?:www|media)\.lufthansa\.com/, '');
  return t === full || t === pathOnly || decodePath(t) === videoAsset(href) ? own : text;
}
