/* eslint-disable max-len, import/extensions -- node tooling */
/**
 * Edge Delivery reads ":name:" in a text node as an icon (its pipeline's rewrite-icons step,
 * /(?<!(?:https?|urn)[^\s]*):(#?[a-z_-]+[a-z\d]*):/gi, code elements left alone) and draws
 * <span class="icon icon-name"> from /icons/name.svg. www's German gender colon followed by a
 * colon ("Mitarbeiter:innen:" as a label, "Naturliebhaber:innen: üppige Vegetation") became the
 * icon "innen", a broken picture (lh-b2b's celebrating-shared-stories/meissen, 2026-11-11).
 *
 * guardIconTokens: every such token in a document's text whose name is not one of our icons
 * (icons/*.svg, *.png) gets a WORD JOINER (U+2060: no width, no line break, as Discover's importer
 * did since b99ee4c0) right before its closing colon, so the pipeline keeps it text; a real icon
 * token (":phone:") stays one. Tags, attributes and code elements stay as they are; idempotent.
 * scripts/scripts.js takes the joiner out again in the browser, so the page's text reads as www's.
 */
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

/** The pipeline's icon token (rewrite-icons.js), as it matches in one text node. */
export const ICON_TOKEN = /(?<!(?:https?|urn)[^\s]*):(#?[a-z_-]+[a-z\d]*):/gi;
export const WORD_JOINER = '\u2060';

const ICON_DIR = fileURLToPath(new URL('../../icons/', import.meta.url));

const read = (dir) => new Set(fs.readdirSync(dir)
  .filter((f) => /\.(svg|png)$/i.test(f)).map((f) => f.replace(/\.(svg|png)$/i, '')));
let ours;
/** Our icons' names (the files in /icons, without their extension; read once). */
export const realIcons = (dir) => {
  if (dir) return read(dir);
  if (!ours) ours = read(ICON_DIR);
  return ours;
};

/** The pipeline's icon name for a token's value (a leading # is a sprite reference). */
const nameOf = (value) => value.replace(/^#/, '');

/** The icon tokens of one text, as the pipeline finds them: [{ index, length, name }]. */
export function tokensOf(text) {
  return [...String(text).matchAll(ICON_TOKEN)].map((m) => ({ index: m.index, length: m[0].length, name: nameOf(m[1]) }));
}

// a no-break or other space written as a reference is whitespace to the pipeline (it decodes first):
// the same length of spaces in the view the tokens are looked for in, so positions stay the raw text's
const SPACE_REF = /&(?:nbsp|ensp|emsp|thinsp|#0*160|#x0*a0);/gi;
const viewOf = (raw) => raw.replace(SPACE_REF, (m) => ' '.repeat(m.length));

/** One text node's text (as written, references kept) with every token that is not an icon kept as text. */
export function guardText(text, icons) {
  let out = String(text);
  for (let round = 0; round < 50; round += 1) {
    const bad = tokensOf(viewOf(out)).find((t) => !icons.has(t.name));
    if (!bad) return out;
    const close = bad.index + bad.length - 1;
    out = `${out.slice(0, close)}${WORD_JOINER}${out.slice(close)}`;
  }
  return out;
}

// a colon written as a character reference reads as a colon to the pipeline: written as the character
const COLON_REF = /&#0*58;|&#x0*3a;|&colon;/gi;
const hasColon = (s) => s.includes(':') || /&#0*58;|&#x0*3a;|&colon;/i.test(s);

// the page's Metadata block: the pipeline reads it into the head before it looks for icons, so its
// values keep their colons as written (a title "Madrid-Urlauber:innen: Mercado ..." is no icon)
const isMetadataOpen = (tag) => /^<div\s[^>]*class="metadata"/i.test(tag);

/**
 * The text segments of a document's HTML the pipeline reads icons in: [[index into parts, text]], the
 * parts being the HTML split at its tags. Not in <code>, not in the Metadata block.
 */
function textParts(parts) {
  let inCode = 0;
  let metaDepth = 0;
  const out = [];
  parts.forEach((part, i) => {
    if (i % 2) {
      if (/^<code[\s>]/i.test(part)) inCode += 1;
      else if (/^<\/code\s*>/i.test(part)) inCode = Math.max(0, inCode - 1);
      if (metaDepth) {
        if (/^<div[\s>]/i.test(part)) metaDepth += 1;
        else if (/^<\/div\s*>/i.test(part)) metaDepth -= 1;
      } else if (isMetadataOpen(part)) metaDepth = 1;
      return;
    }
    if (!inCode && !metaDepth && hasColon(part)) out.push([i, part]);
  });
  return out;
}

/**
 * A document's HTML (a .plain.html's content or a whole DA document) with every text that would
 * read as a missing icon kept as text. Text inside <code> and the Metadata block stays as it is
 * (the pipeline reads no icons there). Returns the HTML unchanged (the same string) when nothing
 * needs it.
 * @param {string} html
 * @param {Set<string>} [icons] our icons' names (default: /icons)
 */
export function guardIconTokens(html, icons = realIcons()) {
  const parts = String(html).split(/(<[^>]*>)/);
  let changed = false;
  textParts(parts).forEach(([i, part]) => {
    const text = part.replace(COLON_REF, ':');
    const guarded = guardText(text, icons);
    if (guarded === text) return;
    parts[i] = guarded;
    changed = true;
  });
  return changed ? parts.join('') : html;
}

/** The tokens of a document's text that would read as missing icons: [{ name, context }]. */
export function strayTokens(html, icons = realIcons()) {
  return textParts(String(html).split(/(<[^>]*>)/)).flatMap(([, t]) => {
    const view = viewOf(t.replace(COLON_REF, ':'));
    return tokensOf(view).filter((k) => !icons.has(k.name))
      .map((k) => ({ name: k.name, context: view.slice(Math.max(0, k.index - 40), k.index + k.length + 20).replace(/\s+/g, ' ').trim() }));
  });
}
