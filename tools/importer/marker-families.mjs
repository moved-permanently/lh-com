/* eslint-disable max-len -- patterns */
/**
 * The style markers the importers write and the site's old readers take (scripts.js decorateTextStyles, the blocks,
 * lh-edge's app JSON), by family, for tools that look for what is left of them: the collapse's report
 * (marker-collapse-cli.mjs), its loss check (collapse-loss-check.mjs) and the census of the published pages
 * (marker-census.mjs). A marker is a token in braces at the end of a heading, paragraph or list item ("{heading-small}",
 * "{full-width column-end}", "{spacer-30 from-768}"); data placeholders in braces ("{origin}", "{COUNT}", a form
 * pattern's "{1,3}") are content and are none of these.
 */

// a marker left after the collapse that must not be (the collapse's own check)
export const LEFT_MARKER = /\{(?:heading-|copytext-|full-width|limited-width|column-|caption|parallax|narrow|indent-\d|spacer|divider|autoplay|muted|loop|controls|round-play-button|size-\d|mobile|selected|small|blank|cart|login|locale|help|search|accessibility|notifications)[^}]*\}/;

// a token's family (the first that matches)
export const FAMILIES = [
  ['heading', /^heading-[a-z-]+$/],
  ['text-size', /^copytext-[a-z-]+$/],
  ['text-width', /^(full-width|limited-width)$/],
  ['column', /^column-[a-z-]+$/],
  ['separator', /^(spacer|divider)-\d+$|^from-768$/],
  ['caption', /^caption$/],
  ['parallax-narrow', /^(parallax|narrow)$/],
  ['indent', /^indent-\d{1,3}$/],
  ['video', /^(autoplay|muted|loop|controls|round-play-button|size-\d+x\d+|mobile)$/],
  ['form', /^selected$/],
  ['blank', /^blank$/],
  ['nav-role', /^(cart|login|locale|help|search|accessibility|notifications)$/],
  ['cell', /^cell-[a-z-]+$/],
];

// the app screens' markers (/content/mobile/…): "{spacer: medium}", "{spacer: medium, v2}", "{divider}", "{small}"
export const APP_MARKER = /\{(spacer:\s*[a-z0-9 ,-]+|divider|small)\}/g;

const BRACES = /\{([a-z][a-z0-9 ,:-]*)\}/g;

/** A token's family, or null (not a style marker). */
export const familyOf = (token) => (FAMILIES.find(([, re]) => re.test(token)) || [null])[0];

/**
 * The style markers in a text (an element's text or a whole document's): per family the tokens found. A brace group
 * counts only when all its tokens are markers ("{full-width column-end}": two), so placeholders stay out.
 * @param {string} text
 * @returns {Object<string, number>}
 */
export function countMarkers(text) {
  const out = {};
  const add = (f) => { out[f] = (out[f] || 0) + 1; };
  [...String(text).matchAll(BRACES)].forEach((m) => {
    if (/:/.test(m[1])) return;
    const fams = m[1].split(/[\s,]+/).filter(Boolean).map(familyOf);
    if (fams.length && fams.every(Boolean)) fams.forEach(add);
  });
  [...String(text).matchAll(APP_MARKER)].forEach((m) => add(`app ${m[1].split(':')[0]}`));
  return out;
}

/** The text without its style markers (for comparing a document before and after the collapse). */
export function stripMarkers(text) {
  return String(text).replace(BRACES, (all, inner) => {
    const tokens = inner.split(/[\s,]+/).filter(Boolean);
    return !/:/.test(inner) && tokens.length && tokens.every(familyOf) ? '' : all;
  }).replace(APP_MARKER, '');
}
