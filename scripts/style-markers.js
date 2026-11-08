/**
 * The "{…}" style markers the importer writes into content (README "Authoring conventions"), in
 * one place for everything that reads them: scripts/scripts.js decorateTextStyles (headings,
 * paragraphs, lists, separators), scripts/media.js (a video's settings), the loc marker check
 * (tools/loc/marker-check.mjs) and lh-edge's app JSON for web pages (src/sdui-web.js), which
 * must leave them out of the text it sends. A marker is the last text of its element ("Ticket
 * refunds {heading-medium}"), one or more known tokens in braces; anything else in braces is
 * content and stays: data placeholders ({origin}, {COUNT}, {lang}) and regex quantifiers ({1,3}).
 * No DOM here: the worker imports it too.
 */

// column-view padding markers (importer: the first / last element of a Lufthansa column view;
// column-spaced: the column view ends a live section with .mb-default)
export const COLUMN_MARK = 'column-(?:(?:start|end)(?:-outer)?|spaced)';
export const styleMarker = (tokens) => new RegExp(`\\s*\\{((?:${tokens})(?: (?:${tokens}))*)\\}\\s*$`);

export const HEADING_TOKENS = `heading-(?:large|medium|small|copytext-large|copytext-medium)|copytext-large|limited-width|${COLUMN_MARK}`;
export const PARAGRAPH_TOKENS = `copytext-(?:small|medium|large)|full-width|limited-width|caption|parallax|narrow|indent-\\d{1,3}|${COLUMN_MARK}`;
// lists: the text sizes as on paragraphs too (SWISS's sports-equipment lists: "{copytext-medium}")
export const LIST_TOKENS = `copytext-(?:small|medium|large)|full-width|limited-width|${COLUMN_MARK}`;

export const HEADING_STYLE = styleMarker(HEADING_TOKENS);
export const PARAGRAPH_STYLE = styleMarker(PARAGRAPH_TOKENS);
export const LIST_STYLE = styleMarker(LIST_TOKENS);
export const SEPARATOR = /^\{(spacer|divider)-(\d{1,3})( from-768)?\}$/;

// a video's settings after its link ("{autoplay muted loop}", scripts/media.js)
export const VIDEO_SETTINGS = ['autoplay', 'muted', 'loop', 'controls', 'round-play-button'];
export const VIDEO_MARKER = styleMarker(VIDEO_SETTINGS.join('|'));

// TAP's empty line in a text: a paragraph of only <sub>{blank}</sub> (decorateTextStyles)
export const BLANK_LINE = /^\s*\{blank\}\s*$/;

// the app screens' markers (scripts/library-page.js decorateAppScreen, /content/mobile documents):
// a space "{spacer: medium}" (", v2": the v2 screen only), a rule "{divider}", small text "{small}"
export const APP_SPACER = /^\{spacer:\s*(x-small|small|medium|m-large|large)\s*(,\s*v2)?\s*\}$/i;
export const APP_SMALL = /\s*\{small\}\s*$/;

// the article header's video for phones too ("{mobile}", blocks/article-header); TAP's empty card
// line (<sub>{blank}</sub>, styles/themes/tap.css)
const OTHER_TOKENS = 'mobile|blank|small|divider';

const ANY_TOKENS = [HEADING_TOKENS, PARAGRAPH_TOKENS, LIST_TOKENS, VIDEO_SETTINGS.join('|'), OTHER_TOKENS].join('|');
const ANY_MARKER = `\\{\\s*(?:${ANY_TOKENS})(?: (?:${ANY_TOKENS}))*\\s*\\}`;
const SEPARATOR_TEXT = /^\s*\{(?:spacer|divider)-\d{1,3}(?: from-768)?\}\s*$/;
const isSeparatorText = (s) => SEPARATOR_TEXT.test(s) || APP_SPACER.test(s.trim());
const TRAILING_TEXT = new RegExp(`\\s*${ANY_MARKER}\\s*$`);
// in HTML: the marker at the end, before closing tags only (" …now {full-width}</a></li></ul>")
const TRAILING_HTML = new RegExp(`\\s*${ANY_MARKER}((?:\\s*</[a-z][a-z0-9]*>)*)\\s*$`, 'i');

/**
 * Text without a style marker at its end (any kind the site reads); a separator or a text that
 * is only markers gives ''.
 * @param {string} text
 * @returns {string}
 */
export function stripStyleMarkers(text) {
  let s = String(text ?? '');
  if (isSeparatorText(s)) return '';
  // markers can follow one another ("{column-end-outer}" after "{full-width}" in a merged text)
  for (let prev = null; prev !== s;) {
    prev = s;
    s = s.replace(TRAILING_TEXT, '');
  }
  return s;
}

/**
 * HTML without a style marker at the end of its text, before its closing tags.
 * @param {string} html
 * @returns {string}
 */
export function stripStyleMarkersHtml(html) {
  let s = String(html ?? '');
  for (let prev = null; prev !== s;) {
    prev = s;
    s = s.replace(TRAILING_HTML, '$1');
  }
  return s;
}

/** Whether a text is only style markers (or a separator): nothing to show. */
export const isOnlyStyleMarkers = (text) => /\{/.test(String(text ?? '')) && !stripStyleMarkers(text).trim();
