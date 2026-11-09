/**
 * Token-free styling on the site (the brief after 488, step 1 of 4; README "Authoring without
 * markers"): applies what scripts/style-markers.js reads (the one module the site and lh-edge
 * share) to a page's main element, after the markers (scripts.js decorateTextStyles; a marker on
 * an element wins) and before the sections are wrapped. Every carrier draws with what the
 * markers draw today (a separator paragraph, the same classes), so a document says the same thing
 * either way:
 * - purpose blocks Spacer (M, L) and Divider: the separator paragraph "{spacer-60}" makes (on
 *   app screens App Spacer, App Divider, App Text as "{spacer: medium}", "{divider}", "{small}");
 * - the nav document's Nav Tools table: the tools list, each item's role from its role column;
 * - block options: space-m, space-l, divider-above (a separator before the block), small-print
 *   (its text in copytext-small), title-large, title-compact (its headings' size);
 * - section styles (and the page's Headings row): space-m, space-l, divider (above the section),
 *   space-below-m, space-below-l, divider-below, wide-text, small-print, h2-large, h2-compact,
 *   h3-large, parallax (its images), narrow (its quotes), on the section's own default content;
 * - captions: an italic paragraph right after an image paragraph becomes a figure with the image
 *   and its figcaption (styles.css "captions": the look of "{caption}");
 * - the theme's rules (THEMES[brand].live; off until step 2 collapses the brand's documents).
 */
import {
  readPurposeBlock, readBlockOptions, readSectionStyle, headingChoice, themeFor, pageTypeOf,
  isCaptionParagraph, readNavRole, MARKED_SIZE, MARKED_WIDTH, SPACE, DIVIDER_SPACE,
} from './style-markers.js';

const TEXT = ['P', 'UL', 'OL'];
const isBlock = (el) => el.tagName === 'DIV' && el.classList.length > 0;
const isSeparator = (el) => !!el && el.tagName === 'P' && el.classList.contains('spacer');
const hasPicture = (el) => !!el.querySelector('picture, img');

/** The separator paragraph decorateTextStyles makes of "{spacer-N}" / "{divider-N}". */
export function separatorParagraph(px, divider = false) {
  const p = document.createElement('p');
  p.className = divider ? 'spacer divider' : 'spacer';
  p.style.setProperty('--spacer-size', `${Math.min(Number(px), 400)}px`);
  p.setAttribute('aria-hidden', 'true');
  return p;
}

/** A column view's edge as a marker paragraph draws it ("{column-start-outer}" makes the same). */
function columnMark(kind) {
  const p = document.createElement('p');
  p.className = `${kind} column-mark`;
  p.setAttribute('aria-hidden', 'true');
  return p;
}

const META_BLOCKS = ['metadata', 'section-metadata'];
const blockName = (el) => el.className.split(' ')[0];
const isMeta = (el) => isBlock(el) && META_BLOCKS.includes(blockName(el));
const isColumnMark = (el) => !!el && [...el.classList].some((c) => c.startsWith('column-'));
// SWISS's topic teaser: a heading whose link starts with its icon
const isTeaser = (el) => /^H[2-4]$/.test(el.tagName) && !!el.querySelector(':scope > a > picture:first-child');

/** A tab panel: a section whose Section Metadata has a Tab row (data-tab once it is read). */
function isTabPanel(section) {
  if (section.hasAttribute('data-tab')) return true;
  const meta = [...section.children].find((el) => isBlock(el) && blockName(el) === 'section-metadata');
  return !!meta && [...meta.children].some((row) => (row.firstElementChild?.textContent || '').trim().toLowerCase() === 'tab');
}

/** A space or divider choice as a separator paragraph (null: none). */
function separatorFor(space, divider) {
  if (divider) return separatorParagraph(DIVIDER_SPACE, true);
  return space ? separatorParagraph(SPACE[space]) : null;
}

/** Adds a class unless a marker already gave the element one of its kind. */
function addUnmarked(el, cls, marked) {
  if (!cls || marked.test(el.className)) return false;
  el.classList.add(cls);
  return true;
}

/**
 * Spacer and Divider blocks become the separator paragraphs (default content); on app screens
 * App Spacer, App Divider and App Text the paragraphs of "{spacer: medium}", "{divider}" and
 * "{small}" (scripts/library-page.js decorateAppScreen).
 */
function decoratePurposeBlocks(main) {
  const selector = ['spacer', 'divider', 'app-spacer', 'app-divider', 'app-text'].map((n) => `:scope > div > div.${n}`).join(', ');
  main.querySelectorAll(selector).forEach((block) => {
    const [name, ...options] = [...block.classList];
    const what = readPurposeBlock(name, options);
    if (!what) return;
    if (what.kind === 'spacer' || what.kind === 'divider') {
      const p = separatorParagraph(what.px, what.kind === 'divider');
      // from 768px only (styles.css hides p.spacer.from-768 below)
      if (what.fromTablet) p.classList.add('from-768');
      block.replaceWith(p);
      return;
    }
    if (what.kind === 'app-spacer' || what.kind === 'app-divider') {
      const p = document.createElement('p');
      p.className = what.kind === 'app-spacer' ? `app-spacer app-spacer-${what.size}` : 'app-divider';
      p.setAttribute('aria-hidden', 'true');
      block.replaceWith(p);
      return;
    }
    // App Text: its cells' paragraphs (a bare text one paragraph), small with the option
    const out = [];
    block.querySelectorAll(':scope > div > div').forEach((cell) => {
      const kids = [...cell.children].filter((c) => /^(P|UL|OL)$/.test(c.tagName));
      if (kids.length) out.push(...kids);
      else if (cell.textContent.trim()) {
        const p = document.createElement('p');
        p.append(...cell.childNodes);
        out.push(p);
      }
    });
    if (what.small) out.forEach((el) => el.classList.add('app-small'));
    block.replaceWith(...out);
  });
}

/**
 * The nav document's Nav Tools table (one row per tool: the item, its role, optionally its sub
 * list) becomes the tools list blocks/header reads, the role in data-role (instead of "{cart}").
 */
function decorateNavTools(main) {
  main.querySelectorAll(':scope > div > div.nav-tools').forEach((block) => {
    const list = document.createElement('ul');
    [...block.children].forEach((row) => {
      const [item, role, more] = [...row.children];
      if (!item) return;
      const li = document.createElement('li');
      const sub = [...item.querySelectorAll(':scope > ul, :scope > ol')];
      if (more) sub.push(...more.querySelectorAll(':scope > ul, :scope > ol'));
      sub.forEach((l) => l.remove());
      const paras = [...item.children].filter((c) => c.tagName === 'P');
      if (paras.length === 1 && item.children.length === 1) li.append(...paras[0].childNodes);
      else li.append(...item.childNodes);
      if (!li.textContent.trim() && !li.querySelector('a, span.icon')) return;
      const name = readNavRole(role ? role.textContent : '');
      if (name) li.dataset.role = name;
      li.append(...sub);
      list.append(li);
    });
    block.replaceWith(list);
  });
}

/** Block options any block takes. */
function decorateBlockOptions(main, theme) {
  main.querySelectorAll(':scope > div > div[class]').forEach((block) => {
    if (block.classList.contains('section-metadata')) return;
    const opts = readBlockOptions(block.classList);
    const sep = separatorFor(opts.space, opts.divider);
    if (sep && !isSeparator(block.previousElementSibling)) block.before(sep);
    if (opts.size === 'small') {
      block.querySelectorAll('p, ul, ol').forEach((el) => {
        if (!(el.tagName === 'P' && hasPicture(el) && !el.textContent.trim())) addUnmarked(el, theme.text.small, MARKED_SIZE);
      });
    }
    if (opts.title) {
      block.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
        addUnmarked(h, headingChoice(theme, Number(h.tagName[1]), opts.title), MARKED_SIZE);
      });
    }
  });
}

/** Section styles (and the page's Headings row) on each section's own default content. */
function decorateSectionStyles(main, theme, pageHeadings) {
  main.querySelectorAll(':scope > div').forEach((section) => {
    const style = readSectionStyle(section.classList);
    const headings = { ...pageHeadings, ...style.headings };
    const own = [...section.children].filter((el) => !isBlock(el));
    own.forEach((el) => {
      const level = /^H([1-6])$/.exec(el.tagName);
      if (level && headings[`h${level[1]}`]) {
        addUnmarked(el, headingChoice(theme, Number(level[1]), headings[`h${level[1]}`]), MARKED_SIZE);
      }
      // the section's images in the parallax window, its quotes narrow (the "{parallax}" and
      // "{narrow}" classes)
      if (style.quote === 'narrow' && el.tagName === 'BLOCKQUOTE') {
        const first = el.querySelector(':scope > p');
        if (first) first.classList.add('narrow');
      }
      if (!TEXT.includes(el.tagName) || isSeparator(el)) return;
      if (el.tagName === 'P' && hasPicture(el) && !el.textContent.trim()) {
        if (style.image === 'parallax') el.classList.add('parallax');
        return;
      }
      if (style.width === 'full') addUnmarked(el, 'full-width', MARKED_WIDTH);
      if (style.size === 'small') addUnmarked(el, theme.text.small, MARKED_SIZE);
    });
    const above = separatorFor(style.space, style.divider);
    if (above && !isSeparator(section.firstElementChild)) section.prepend(above);
    const below = separatorFor(style.spaceBelow, style.dividerBelow);
    const last = [...section.children].filter((el) => !el.classList.contains('section-metadata')).pop();
    if (below && !isSeparator(last)) {
      if (last) last.after(below);
      else section.append(below);
    }
  });
}

/**
 * Captions: an italic paragraph right after an image paragraph (the section's own content, not
 * a "{caption}" one) becomes <figure class="image-caption"><p>(the image)</p><figcaption>.
 */
export function decorateCaptions(main) {
  // in a block's cell the caption stays a paragraph, with the class the "{caption}" marker gave it
  // (the block styles p.caption: Columns Media's info boxes)
  main.querySelectorAll(':scope > div > div[class] > div > div > p').forEach((p) => {
    if (isCaptionParagraph(p, p.previousElementSibling)) p.classList.add('caption');
  });
  main.querySelectorAll(':scope > div > p').forEach((p) => {
    const prev = p.previousElementSibling;
    if (!isCaptionParagraph(p, prev) || p.classList.contains('caption')) return;
    const em = p.querySelector(':scope > em, :scope > i');
    const figure = document.createElement('figure');
    figure.className = 'image-caption';
    const caption = document.createElement('figcaption');
    // its classes (full-width from a section style, a column end) carry over
    if (p.className) caption.className = p.className;
    caption.append(...em.childNodes);
    prev.before(figure);
    figure.append(prev, caption);
    p.remove();
  });
}

/** A chapter's start: an H2 / H3, or a paragraph that is all one bold text. */
function isChapterStart(el) {
  if (/^H[23]$/.test(el.tagName)) return true;
  if (el.tagName !== 'P') return false;
  const kids = [...el.childNodes].filter((n) => n.nodeType === 1 || n.nodeValue.trim());
  return kids.length === 1 && /^(STRONG|B)$/.test(kids[0].tagName || '') && !!kids[0].textContent.trim();
}

/** The theme's own rules for a brand and page type (only a live theme). */
function applyThemeRules(main, theme) {
  if (!theme.live) return;
  const sections = [...main.querySelectorAll(':scope > div')];
  const own = (section) => [...section.children].filter((el) => !isBlock(el));
  sections.forEach((section, i) => {
    own(section).forEach((el) => {
      const level = /^H([1-6])$/.exec(el.tagName);
      if (level) addUnmarked(el, theme.headings[`h${level[1]}`], MARKED_SIZE);
      if (theme.text.width === 'full' && TEXT.includes(el.tagName) && !isSeparator(el)
        && !(el.tagName === 'P' && hasPicture(el) && !el.textContent.trim())) addUnmarked(el, 'full-width', MARKED_WIDTH);
    });
    const first = section.firstElementChild;
    if (theme.rules.includes('intro-after-h1')) {
      section.querySelectorAll(':scope > h1 + p').forEach((p) => {
        if (p.textContent.trim() && !hasPicture(p)) addUnmarked(p, 'copytext-large', MARKED_SIZE);
      });
    }
    // what follows the section's first element (its metadata aside)
    const afterFirst = first && first.nextElementSibling;
    if (i > 0 && first && !isSeparator(first)) {
      if (theme.rules.includes('sections-m')) section.prepend(separatorParagraph(SPACE.m));
      // a chapter's rule, not above the Related Articles and not above a heading a block follows
      // right away (www's teaser sections draw none: ema-adobe's handover item 7)
      else if (theme.rules.includes('ruled-chapters') && isChapterStart(first)
        && !section.querySelector(':scope > div.related-articles')
        && !(afterFirst && isBlock(afterFirst) && !isMeta(afterFirst))) {
        section.prepend(separatorParagraph(DIVIDER_SPACE, true));
      }
    }
    // the brand's blocks that are column views of their own in the page's flow (THEMES columnViews
    // .blocks: www's column view around the block, its padding above and below as the markers drew
    // it): not in a tab panel; no edge above at the section's start, none below at its end (the
    // section's padding) unless columnViews.endEdge; never twice (a marker's edge stays)
    const { blocks = [], endEdge = false } = theme.columnViews;
    if (blocks.length && !isTabPanel(section)) {
      section.querySelectorAll(':scope > div[class]').forEach((block) => {
        if (!blocks.includes(blockName(block))) return;
        let prev = block.previousElementSibling;
        while (prev && isMeta(prev)) prev = prev.previousElementSibling;
        let next = block.nextElementSibling;
        while (next && isMeta(next)) next = next.nextElementSibling;
        if (prev && !isColumnMark(prev)) block.before(columnMark('column-start-outer'));
        if ((next || endEdge) && !isColumnMark(next)) block.after(columnMark('column-end-outer'));
      });
    }
    // SWISS's FAQ hub (styles.css "SWISS's FAQ hub"): a heading right before a run of topic teasers
    // (a heading whose link starts with its icon) starts their column view, as its marker did
    if (theme.rules.includes('teaser-groups')) {
      own(section).forEach((el) => {
        const next = el.nextElementSibling;
        if (/^H[2-4]$/.test(el.tagName) && !isTeaser(el) && next && isTeaser(next)) addUnmarked(el, 'column-start', /\bcolumn-/);
      });
    }
    if (theme.rules.includes('rule-before-info-box')) {
      section.querySelectorAll(':scope > div.columns-media').forEach((block) => {
        const prev = block.previousElementSibling;
        // after any content but a heading (text, a picture, a caption, another block)
        if (!prev || /^H[1-6]$/.test(prev.tagName) || isSeparator(prev)) return;
        block.before(separatorParagraph(DIVIDER_SPACE, true));
      });
    }
  });
}

/**
 * Token-free styling of a page's main element.
 * @param {Element} main
 * @param {{brand?: string, path?: string, read?: Function}} [page] brand key (lh-com: ''),
 *   path, metadata reader (aem.js getMetadata)
 */
export default function decorateTokenFree(main, { brand = '', path = '', read = () => '' } = {}) {
  const pageType = pageTypeOf({ path, articleHeader: !!main.querySelector('.article-header'), themes: read('theme') });
  const theme = themeFor(brand || 'lufthansa', pageType);
  // a live theme's rules for the page's CSS too (styles.css "theme rules")
  if (theme.live) {
    const { body } = main.ownerDocument;
    if (body && body.contains(main)) {
      body.classList.add('theme-live');
      // the brand's heading gap on flow pages (styles.css "theme rules")
      body.style.setProperty('--theme-heading-gap', `${theme.columnViews.headingGap}px`);
    }
  }
  decoratePurposeBlocks(main);
  decorateNavTools(main);
  decorateBlockOptions(main, theme);
  decorateSectionStyles(main, theme, readSectionStyle(read('headings') || '').headings);
  decorateCaptions(main);
  applyThemeRules(main, theme);
}
