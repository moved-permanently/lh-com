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
// and the video's own size, read from its file (ema-adobe's tools/importer/video-sizes.mjs):
// "{controls round-play-button size-1920x1080}"; scripts/media.js gives the player its aspect
export const VIDEO_SIZE = 'size-\\d{2,5}x\\d{2,5}';
export const VIDEO_MARKER = styleMarker(`${VIDEO_SETTINGS.join('|')}|${VIDEO_SIZE}`);

// TAP's empty line in a text: a paragraph of only <sub>{blank}</sub> (decorateTextStyles)
export const BLANK_LINE = /^\s*\{blank\}\s*$/;

// the app screens' markers (scripts/library-page.js decorateAppScreen, /content/mobile documents):
// a space "{spacer: medium}" (", v2": the v2 screen only), a rule "{divider}", small text "{small}"
export const APP_SPACER = /^\{spacer:\s*(x-small|small|medium|m-large|large)\s*(,\s*v2)?\s*\}$/i;
export const APP_SMALL = /\s*\{small\}\s*$/;

// the article header's video for phones too ("{mobile}", blocks/article-header); TAP's empty card
// line (<sub>{blank}</sub>, styles/themes/tap.css); a picture narrower than its Columns Media cell
// ("{cell-half-start}", blocks/columns-media)
const OTHER_TOKENS = 'mobile|blank|small|divider|cell-(?:half-start|half-end|three-quarters)';

const ANY_TOKENS = [HEADING_TOKENS, PARAGRAPH_TOKENS, LIST_TOKENS, VIDEO_SETTINGS.join('|'), VIDEO_SIZE, OTHER_TOKENS].join('|');
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

/* ------------------------------------------------------------------------------------------
 * Token-free styling (the brief after 488, step 1 of 4; README "Authoring without markers"):
 * what replaces the markers above. The theme's defaults per brand and page type, then the
 * carriers of the exceptions, in this order: section styles (Section Metadata Style, scoped by
 * heading level, direct default content only), block options, formatting with a meaning (an
 * italic paragraph right after an image is its caption), link fragments (a video's #background)
 * and small purpose blocks (Spacer, Divider; on app screens App Spacer, App Divider, App Text).
 * A marker on an element still wins over all of them, and the theme's own rules stay off until
 * the documents of a brand and page type are collapsed (step 2: THEMES[brand].live): nothing
 * visible changes while documents carry markers. Read by scripts/scripts.js, scripts/media.js,
 * scripts/library-page.js, blocks/form, blocks/header and lh-edge (src/sdui.js, src/sdui-web.js).
 * ------------------------------------------------------------------------------------------ */

// separators: none, M, L and Divider (a 1px line, 25px below); the px each carrier draws
export const SPACE = { m: 60, l: 120 };
export const DIVIDER_SPACE = 25;

/**
 * The collapse table's separator size (step 2): 0-30px none, 32-80px M, 90-150px L; any other
 * size is null (decided by hand).
 * @param {number|string} px
 * @returns {'none'|'m'|'l'|null}
 */
export function spaceOf(px) {
  const n = Number(px);
  if (!Number.isFinite(n) || n < 0) return null;
  if (n <= 30) return 'none';
  if (n >= 32 && n <= 80) return 'm';
  if (n >= 90 && n <= 150) return 'l';
  return null;
}

// heading sizes, largest first (Lufthansa sizes headings by class, not by level)
export const HEADING_SIZES = ['heading-large', 'heading-medium', 'heading-small', 'heading-copytext-large', 'heading-copytext-medium'];

/** Size steps from one heading size to another (positive: smaller); null for an unknown size. */
export function sizeSteps(from, to) {
  const a = HEADING_SIZES.indexOf(from);
  const b = HEADING_SIZES.indexOf(to);
  return a < 0 || b < 0 ? null : b - a;
}

/*
 * Theme defaults. Every brand starts from BASE_THEME (what styles.css draws without a marker
 * today); a brand or a page type overrides what differs. headingChoices: the sizes the
 * level-scoped choices pick ("H2 large", "H2 compact", "H3 large"). rules: the page type's own
 * spacing and text rules (scripts.js applyThemeRules), only where the theme is live.
 */
const BASE_THEME = {
  headings: {
    h1: 'heading-large', h2: 'heading-medium', h3: 'heading-copytext-large', h4: 'heading-copytext-large', h5: 'heading-copytext-medium', h6: 'heading-copytext-medium',
  },
  headingChoices: {
    h2: { large: 'heading-large', compact: 'heading-copytext-large' },
    h3: { large: 'heading-medium' },
  },
  // running text: two thirds of the content width from 1025px ('full': the whole width); body
  // text 18px (copytext-large), small print 14px
  text: { width: 'limited', size: 'copytext-large', small: 'copytext-small' },
  separators: { m: SPACE.m, l: SPACE.l, divider: DIVIDER_SPACE },
  // a Lufthansa column view's padding (32px; outside a page section 20px, 40px from 768px) and
  // the space a heading after content gets above it on flow pages once the column views are
  // structure: 32px (the column view's padding; also what the small separators dropped before
  // headings gave: ITA's pass check, tools/reports/token-free/ita-pass-check.md, measured 0 worse)
  columnViews: { padding: 32, outerPadding: [20, 40], headingGap: 32 },
  rules: [],
  live: false,
};

export const THEMES = {
  lufthansa: {
    pageTypes: {
      // Insights articles: a rule above an info box (Columns Media) after any content but a
      // heading; chapters (an H2 / H3 or a bold paragraph) as sections, a rule between them
      article: { rules: ['rule-before-info-box', 'ruled-chapters'] },
      // /100-years: its sections 60px apart
      '100-years': { rules: ['sections-m'] },
      // Insights tag pages (/articles/tags/…): the rule above an info box after any content but a
      // heading, as on articles (www: 417 of 505 such Columns Media; the others without)
      'insights-tag': { rules: ['rule-before-info-box'] },
    },
  },
  // Austrian: the paragraph right after the page title is the intro (copytext-large, Portada
  // 18/27); flow pages set their H3s in heading-small (www: 87 % of them)
  austrian: { rules: ['intro-after-h1'], pageTypes: { flow: { headings: { h3: 'heading-small' } } } },
  // Brussels: flow pages set their H3s in heading-small (www: 72 %); a service page's H2s are the
  // default (www: 89 % unmarked, heading-medium; no longer heading-small)
  brussels: { pageTypes: { flow: { headings: { h3: 'heading-small' } } } },
  // ITA: running text over the whole width
  ita: { text: { width: 'full' } },
  // SWISS: flow pages set their H2s in heading-small (www: 63 % of the markets' pages, 79 % of the
  // sub-sites'; the rest mostly unmarked, one step up); the FAQ hub's topic teasers in their groups
  // (a heading right before them starts the group's column view, as its marker did)
  swiss: { rules: ['teaser-groups'], pageTypes: { flow: { headings: { h2: 'heading-small' } } } },
  // Discover: on flow pages the H2s in heading-small (www: 86 %) and a Columns Media a column view
  // of its own (www: 26 of 33 not at a section's start)
  discover: { pageTypes: { flow: { headings: { h2: 'heading-small' }, columnViews: { blocks: ['columns-media'] } } } },
  // Lufthansa Group for Business: on flow pages the H3s in heading-small (www: 82 %); Columns
  // Media, Carousel Images and Quote column views of their own, also at a section's end (www: 558
  // of 789 Columns Media not at a section's start, 749 of 962 with an edge below)
  b2b: {
    pageTypes: {
      flow: { headings: { h3: 'heading-small' }, columnViews: { blocks: ['columns-media', 'carousel-images', 'quote'], endEdge: true } },
    },
  },
  // TAP: the base theme (an entry of its own, so its switch is one line as every brand's)
  tap: { live: true },
  // Lufthansa Cargo: the base theme
  cargo: {},
};

const mergeTheme = (a, b) => ({
  ...a,
  ...b,
  headings: { ...a.headings, ...(b.headings || {}) },
  headingChoices: { ...a.headingChoices, ...(b.headingChoices || {}) },
  text: { ...a.text, ...(b.text || {}) },
  separators: { ...a.separators, ...(b.separators || {}) },
  columnViews: { ...a.columnViews, ...(b.columnViews || {}) },
  rules: [...new Set([...(a.rules || []), ...(b.rules || [])])],
});

/**
 * The theme of a brand (lh-com: 'lufthansa') and page type (pageTypeOf).
 * @param {string} brand
 * @param {string} [pageType]
 * @returns {typeof BASE_THEME}
 */
export function themeFor(brand, pageType = '') {
  const own = THEMES[brand || 'lufthansa'] || {};
  const { pageTypes = {}, ...brandTheme } = own;
  let theme = mergeTheme(BASE_THEME, brandTheme);
  if (pageType && pageTypes[pageType]) theme = mergeTheme(theme, pageTypes[pageType]);
  return theme;
}

/**
 * Whether a brand's theme is live (THEMES[brand].live: the one switch; it goes on in the same
 * release as the brand's collapse pass). Until then the importers keep writing markers
 * (tools/importer/marker-collapse.mjs).
 * @param {string} brand
 */
export const isThemeLive = (brand) => themeFor(brand || 'lufthansa').live === true;

/**
 * A page's type for the theme: 'article' (an Article Header), '100-years' (lufthansa.com's
 * anniversary pages), 'insights-tag' (lufthansa.com's Insights tag pages, /articles/tags/…), 'flow'
 * (Theme flow-spacing: the info pages), 'home' (a homepage or a market root), else 'service' (the
 * content pages).
 * @param {{path?: string, articleHeader?: boolean, themes?: string}} page
 * @returns {string}
 */
export function pageTypeOf({ path = '', articleHeader = false, themes = '' } = {}) {
  if (articleHeader) return 'article';
  if (/^\/[a-z]{2}\/[a-z]{2}\/100-years(\/|$)/.test(path)) return '100-years';
  if (/^\/[a-z]{2}\/[a-z]{2}\/articles\/tags\//.test(path)) return 'insights-tag';
  if (/(^|,)\s*flow-spacing\s*(,|$)/.test(themes)) return 'flow';
  if (/^\/(?:[a-z]{2}(?:-[a-z]{2})?(?:\/[a-z]{2})?(?:\/homepage)?)?\/?$/.test(path)) return 'home';
  return 'service';
}

/*
 * Section styles (Section Metadata `Style`; the DA library offers them with friendly labels:
 * "Space above: M=space-m"). Edge Delivery hands each value to the section as a class
 * (scripts.js decorateSectionMetadata: "Space=M" -> space-m). They apply to the section's own
 * default content, not to its blocks; a marker on an element wins.
 */
export const SECTION_STYLES = {
  'space-m': { space: 'm' },
  'space-l': { space: 'l' },
  divider: { divider: true },
  'space-below-m': { spaceBelow: 'm' },
  'space-below-l': { spaceBelow: 'l' },
  'divider-below': { dividerBelow: true },
  'wide-text': { width: 'full' },
  'small-print': { size: 'small' },
  'h2-large': { headings: { h2: 'large' } },
  'h2-compact': { headings: { h2: 'compact' } },
  'h3-large': { headings: { h3: 'large' } },
  // the section's own images in a 500 px window (Insights' parallax), its quotes narrow (centred)
  parallax: { image: 'parallax' },
  narrow: { quote: 'narrow' },
  // the Lufthansa section padding (20 px, 40 px from 768 px) above and below
  padded: {},
};

// the section styles' friendly labels (the DA library's Style choices: "Label=value")
export const SECTION_STYLE_LABELS = {
  'space-m': 'Space above: M',
  'space-l': 'Space above: L',
  divider: 'Divider above',
  'space-below-m': 'Space below: M',
  'space-below-l': 'Space below: L',
  'divider-below': 'Divider below',
  'wide-text': 'Wide text',
  'small-print': 'Small print',
  'h2-large': 'H2 large',
  'h2-compact': 'H2 compact',
  'h3-large': 'H3 large',
  parallax: 'Parallax image',
  narrow: 'Narrow quote',
  padded: 'Padded',
};

/**
 * What a section's (or the page's Headings row's) style classes ask for.
 * @param {Iterable<string>} classes class names (or a "Space=M, Wide text" value)
 * @returns {{space: string|null, spaceBelow: string|null, divider: boolean, dividerBelow: boolean,
 *   width: string|null, size: string|null, headings: Object<string, string>}}
 */
export function readSectionStyle(classes) {
  const list = typeof classes === 'string'
    ? classes.split(',').map((s) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')).filter(Boolean)
    : [...classes];
  const out = {
    space: null,
    spaceBelow: null,
    divider: false,
    dividerBelow: false,
    width: null,
    size: null,
    headings: {},
    image: null,
    quote: null,
  };
  list.forEach((c) => {
    const s = SECTION_STYLES[c];
    if (!s) return;
    Object.entries(s).forEach(([k, v]) => {
      if (k === 'headings') Object.assign(out.headings, v);
      else out[k] = v;
    });
  });
  return out;
}

/*
 * Block options (the block name's parentheses, any block): its spacing above (between blocks),
 * small print in it, its title size, a background video.
 */
export const BLOCK_OPTIONS = {
  'space-m': { space: 'm' },
  'space-l': { space: 'l' },
  'divider-above': { divider: true },
  'small-print': { size: 'small' },
  'title-large': { title: 'large' },
  'title-compact': { title: 'compact' },
  'background-video': { video: 'background' },
  // Article Header: its video on phones too
  'mobile-video': { video: 'mobile' },
  // Columns Media: its pictures narrower than their cell (www's nested view or sidebar; the
  // "{cell-half-start}" marks)
  'picture-half-start': { picture: 'half-start' },
  'picture-half-end': { picture: 'half-end' },
  'picture-three-quarters': { picture: 'three-quarters' },
};

// the block options' friendly labels (the DA library's notes)
export const BLOCK_OPTION_LABELS = {
  'space-m': 'space above: M',
  'space-l': 'space above: L',
  'divider-above': 'divider above',
  'small-print': 'small print',
  'title-large': 'large title',
  'title-compact': 'compact title',
  'background-video': 'background video (autoplay, muted, loop)',
  'mobile-video': 'video on phones too',
  'picture-half-start': 'picture in the cell\'s first half',
  'picture-half-end': 'picture in the cell\'s second half',
  'picture-three-quarters': 'picture three quarters of the cell',
};

/** What a block's options ask for (class names of the block element). */
export function readBlockOptions(classes) {
  const out = {
    space: null, divider: false, size: null, title: null, video: null, picture: null,
  };
  [...classes].forEach((c) => Object.assign(out, BLOCK_OPTIONS[c] || {}));
  return out;
}

/** A heading's class for a level-scoped choice ("large", "compact"), from the theme; else null. */
export function headingChoice(theme, level, choice) {
  const tag = `h${level}`;
  return ((theme.headingChoices || {})[tag] || {})[choice] || null;
}

// a heading, paragraph or list that already has a size or width from a marker (markers win)
export const MARKED_SIZE = /(^| )(heading-[a-z-]+|copytext-(small|medium|large))( |$)/;
export const MARKED_WIDTH = /(^| )(full-width|limited-width)( |$)/;

/*
 * Captions: an italic paragraph right after an image is the image's caption (figure /
 * figcaption, the look of "{caption}"). Works on DOM nodes and on lh-edge's parsed nodes
 * (src/html.js: tag, children, text).
 */
const tagOf = (n) => String((n && (n.tagName || n.tag)) || '').toLowerCase();
const kidsOf = (n) => [...((n && (n.childNodes || n.children)) || [])];
const isTextNode = (n) => n && (n.nodeType === 3 || (n.text !== undefined && !n.tag && !n.tagName));
const nodeText = (n) => {
  if (!n) return '';
  if (isTextNode(n)) return String(n.nodeValue ?? n.text ?? '');
  if (n.nodeType === 8) return '';
  return kidsOf(n).map(nodeText).join('');
};
const isElementNode = (n) => n && !isTextNode(n) && n.nodeType !== 8 && !!tagOf(n);
const meaningful = (n) => kidsOf(n).filter((c) => (isTextNode(c) ? nodeText(c).replace(/[\s\u200b]+/g, '') : isElementNode(c)));

/** Whether an element is a paragraph holding only an image (picture or img, perhaps linked). */
export function isImageParagraph(p) {
  if (tagOf(p) !== 'p' || nodeText(p).replace(/[\s\u200b]+/g, '')) return false;
  const kids = meaningful(p);
  if (kids.length !== 1) return false;
  const [k] = kids;
  const media = (n) => ['picture', 'img'].includes(tagOf(n));
  return media(k) || (tagOf(k) === 'a' && meaningful(k).length === 1 && media(meaningful(k)[0]));
}

/**
 * Whether a paragraph is a caption: all of it in one em (or i), some text, not one link alone (an
 * italic link alone stays a secondary button), no marker of its own; right after an image
 * paragraph.
 * @param {*} p the paragraph
 * @param {*} prev the element before it
 */
export function isCaptionParagraph(p, prev) {
  if (tagOf(p) !== 'p' || !isImageParagraph(prev)) return false;
  const kids = meaningful(p);
  if (kids.length !== 1 || !['em', 'i'].includes(tagOf(kids[0]))) return false;
  const inner = meaningful(kids[0]);
  const text = nodeText(kids[0]).trim();
  if (!text || /\{[^}]*\}\s*$/.test(text)) return false;
  if (inner.length === 1 && tagOf(inner[0]) === 'a') return false;
  return !inner.some((n) => ['picture', 'img', 'video', 'iframe'].includes(tagOf(n)));
}

/**
 * A video link's fragment: "#background" asks for a background video (autoplay, muted, loop, no
 * controls), "#size=1920x1080" gives the video's own size; the other fragments (#t=10) stay on the
 * link. Media fragments joined by "&".
 * @param {string} href
 * @returns {{href: string, background: boolean, size: number[]|null}}
 */
export function videoFragment(href) {
  const s = String(href ?? '');
  const at = s.indexOf('#');
  if (at < 0) return { href: s, background: false, size: null };
  const parts = s.slice(at + 1).split('&');
  const background = parts.some((p) => p.toLowerCase() === 'background');
  // the video's own size ("#size=1920x1080", the collapse of "size-1920x1080"): the player's aspect
  const sized = parts.map((p) => p.match(/^size=(\d{2,5})x(\d{2,5})$/i)).find(Boolean);
  const size = sized ? [Number(sized[1]), Number(sized[2])] : null;
  const rest = parts.filter((p) => p && p.toLowerCase() !== 'background' && !/^size=/i.test(p));
  return { href: `${s.slice(0, at)}${rest.length ? `#${rest.join('&')}` : ''}`, background, size };
}

// a background video's settings (as the "{autoplay muted loop}" marker)
export const BACKGROUND_VIDEO = ['autoplay', 'muted', 'loop'];

/*
 * Small purpose blocks for the real exceptions. Web: Spacer (M, L; M without an option) and
 * Divider. App screens (/content/mobile): App Spacer (x-small, small, medium, m-large, large;
 * v2: the v2 screen only), App Divider, App Text (small) - as "{spacer: medium, v2}", "{divider}"
 * and "{small}".
 */
export const APP_SPACER_SIZES = ['x-small', 'small', 'medium', 'm-large', 'large'];

/**
 * What a purpose block draws, from its block name and options (class names), or null for
 * another block.
 * @param {string} name block name (spacer, divider, app-spacer, app-divider, app-text)
 * @param {Iterable<string>} [options]
 * @returns {{kind: 'spacer'|'divider'|'app-spacer'|'app-divider'|'app-text', px?: number,
 *   size?: string, v2Only?: boolean, small?: boolean}|null}
 */
export function readPurposeBlock(name, options = []) {
  const opts = [...options].map((o) => String(o).toLowerCase());
  switch (String(name || '').toLowerCase()) {
    case 'spacer': return { kind: 'spacer', px: opts.includes('l') ? SPACE.l : SPACE.m };
    case 'divider': return { kind: 'divider', px: DIVIDER_SPACE };
    case 'app-spacer': return {
      kind: 'app-spacer', size: APP_SPACER_SIZES.find((s) => opts.includes(s)) || 'medium', v2Only: opts.includes('v2'),
    };
    case 'app-divider': return { kind: 'app-divider' };
    case 'app-text': return { kind: 'app-text', small: opts.includes('small') };
    default: return null;
  }
}

/*
 * The form table's Default column (blocks/form): the options chosen at load, one per line, by
 * value or label (a checkbox without options: yes, ja, x, true, checked); "{selected}" after an
 * option still works.
 */
const CHECKED = ['yes', 'ja', 'x', 'true', 'checked', 'on', '1', 'default', 'selected'];

/** Whether an option is one of a Default cell's lines (by value or label, any case). */
export function isDefaultChoice(option, lines = []) {
  const norm = (s) => String(s ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
  const wanted = lines.map(norm).filter(Boolean);
  if (!wanted.length || !option) return false;
  return wanted.includes(norm(option.value)) || wanted.includes(norm(option.label));
}

/** Whether a Default cell checks a single checkbox (no options). */
export const isCheckedDefault = (lines = []) => lines
  .some((l) => CHECKED.includes(String(l).trim().toLowerCase()));

/*
 * The nav document's tools (blocks/header): a Tools table, one row per item (the item: icon and
 * link | its role), instead of the "{cart}" marker. Roles as blocks/header/header-tools.js.
 */
export const NAV_ROLES = ['accessibility', 'help', 'search', 'cart', 'login', 'locale', 'notifications'];

/** A role cell's role (its text, any case; "Cart", "shopping cart" -> cart), else null. */
export function readNavRole(text) {
  const t = String(text ?? '').trim().toLowerCase();
  if (!t) return null;
  return NAV_ROLES.find((r) => t === r || t.split(/[\s,/-]+/).includes(r)) || null;
}
