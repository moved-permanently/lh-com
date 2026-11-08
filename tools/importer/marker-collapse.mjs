/* eslint-disable max-len -- rule notes */
/**
 * Token-free styling, step 2 (the brief after 493): the collapse. HTML in, HTML out: a document's
 * "{…}" style markers become the theme's defaults (they go) or the carriers step 1 reads
 * (scripts/style-markers.js, scripts/token-free.js): section styles, block options, an italic
 * caption, a video link's fragment, a purpose block, the form's Default column, the nav tools' role
 * column. Idempotent (a collapsed document has nothing left to collapse); the same function for DA
 * documents (div form: sections as divs, blocks as div.name) and the importers' output (table form:
 * sections between <hr>, blocks as tables with the name in their first row; every generated import
 * script calls collapseMain as its last step). Data placeholders ({origin}, {COUNT}, {lang}, a form
 * pattern's {1,3}) are content and stay: only the known tokens at the end of an element are read.
 * App screens (/content/mobile/**) only get their own blocks (App Spacer, App Divider, App Text).
 *
 * The rules (README "Authoring without markers"; the brief after 493, item 2):
 * - separators: none / M (60) / L (120) / Divider; 0-31 px none, 32-89 M, 90 and more L (the
 *   collapse table, near values rounded); a run with a divider is one Divider; "from-768" goes.
 *   At a section's start the section's Space / Divider style, at its end Space below / Divider
 *   below, right before a block that block's option, else a Spacer (L) / Divider block; in a block
 *   cell (no carrier there) it goes. Page-type gaps belong to the theme: lufthansa.com's /100-years
 *   sections (M at a section edge), its articles (the rule above an info box after any content but
 *   a heading; a rule before a chapter heading, an H2 / H3 or a bold paragraph: the chapter becomes
 *   a section of its own, the theme rules it), its Insights tag pages (the info box's rule).
 * - column views become structure: every column mark goes; an outside-a-section group that spans
 *   its whole section becomes the section style padded (the same 20 / 40 px); the page becomes a
 *   flow page (Theme flow-spacing), where a brand's column-view blocks get their edges from the
 *   theme (THEMES columnViews.blocks: Discover's, B2B's).
 * - heading size: within one step of the context's default (the brand's and page type's, as the
 *   site will see it: a page with column marks is a flow page) the default; two or more steps a
 *   level-scoped section style (h2-large, h2-compact, h3-large; on every section of the page the
 *   page's Headings row) or, in a block, its title option (title-large, title-compact); a size
 *   without a choice of its level goes (counted). The level never changes. limited-width goes.
 * - text width: the brand's default (running text two thirds; ITA the whole width); a section whose
 *   own running text is mostly wide gets Wide text; in a block the block decides (the marker goes).
 *   indent-N: a list (bullets, numbers) or a quote (quote marks) where it was a misread, else it goes.
 * - text size: within 2 px of the brand's body size body; small print that ends a section the
 *   Small print style (a trailing run: a section of its own); in a block, when most of its text is
 *   small, its option small-print; single small paragraphs body. Austrian's intro after the H1: the
 *   theme's rule.
 * - video: controls + round play button is the default player (the marker goes); autoplay without
 *   controls a background video: the block's option background-video, else the link's #background
 *   fragment; the size token the link's #size=WxH fragment (other fragments stay); a link whose text
 *   is its URL gets a readable text (the poster's alt, else the file name). {mobile} in an Article
 *   Header: its option mobile-video.
 * - captions: "{caption}" becomes the italic paragraph after the image (a figure caption); one that
 *   follows no image is listed for a person.
 * - parallax: the section image style parallax (an image of its own section where the section has
 *   other images); a narrow quote: the section style narrow.
 * - TAP's <sub>{blank}</sub> paragraph: a paragraph gap (the paragraph goes).
 * - form "{selected}": the table's Default column; nav "{cart}" (role markers): a Nav Tools table.
 * - heading ids: a marked heading's id loses its marker's part (free-baggage-heading-small ->
 *   free-baggage, as Edge Delivery makes it of the new text); links to the old ids in the document
 *   are rewritten; collapseHtml returns the map for links from other documents
 *   (marker-collapse-cli.mjs rewrites those).
 *
 * Only for a brand whose theme is live (THEMES[brand].live): until its switch, the importers' last step
 * leaves the markers (an import as before); a site's collapse pass forces it in the same release.
 *
 * Usage (DOM): collapseMain(main, { path, brand, document, force }) -> { stats, ids, hand }
 *        (HTML): collapseHtml(html, { path, brand, parse, force }) -> { html, stats, ids, hand }
 */
import {
  HEADING_TOKENS, PARAGRAPH_TOKENS, LIST_TOKENS, VIDEO_SETTINGS, VIDEO_SIZE, SEPARATOR, BLANK_LINE,
  APP_SPACER, APP_SMALL, HEADING_SIZES, sizeSteps, themeFor, pageTypeOf, isImageParagraph, NAV_ROLES,
  readNavRole, isThemeLive,
} from '../../scripts/style-markers.js';
import { readHeaderTexts } from '../../blocks/form/form-rules.js';

/* --------------------------------------------------------------------------- constants */

// the brands' body text (styles.css --body-font-size-m and the themes'): within 2 px of it is body
export const BODY_PX = {
  lufthansa: 18, cargo: 18, b2b: 18, ita: 18, austrian: 16, brussels: 16, swiss: 16, discover: 16, airdolomiti: 16, tap: 16,
};
const TEXT_PX = { 'copytext-small': 14, 'copytext-medium': 16 };

// every token the site reads at the end of an element (the cell-* marks of ema-adobe's columns-media
// parser: Columns Media's picture options)
const CELL = 'cell-(?:half-start|half-end|three-quarters)';
const KNOWN = `${HEADING_TOKENS}|${PARAGRAPH_TOKENS}|${LIST_TOKENS}|${VIDEO_SETTINGS.join('|')}|${VIDEO_SIZE}|mobile|${CELL}`;
const TAIL = new RegExp(`\\s*\\{\\s*((?:${KNOWN})(?: (?:${KNOWN}))*)\\s*\\}\\s*$`);
const COLUMN = /^column-/;
const SIZE_TOKEN = /^(heading-(?:large|medium|small|copytext-large|copytext-medium)|copytext-(?:small|medium|large))$/;
const ROLE = new RegExp(`\\s*\\{(${NAV_ROLES.join('|')})\\}\\s*`);
const SELECTED = /\s*\{selected\}\s*$/i;
const HEADING = 'h1, h2, h3, h4, h5, h6';
const BLOCK_SKIP = new Set(['section-metadata', 'metadata']);

/* ------------------------------------------------------------------------------- stats */

function newStats() {
  return { theme: {}, carrier: {}, hand: {} };
}
const count = (stats, kind, family, n = 1) => { stats[kind][family] = (stats[kind][family] || 0) + n; };

/** Totals of a stats object: {theme, carrier, hand}. */
export function totals(stats) {
  const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);
  return { theme: sum(stats.theme), carrier: sum(stats.carrier), hand: sum(stats.hand) };
}

/* --------------------------------------------------------------------------- the forms */

const toClass = (s) => String(s || '').trim().toLowerCase().replace(/[^0-9a-z]+/g, '-')
  .replace(/^-+|-+$/g, '');
const titleOf = (name) => name.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

/**
 * The importers' table form as the div form, in place (sections between <hr> become divs, block
 * tables div blocks); returns a function that turns it back.
 */
// the importers' page body: its wrappers (the page's own divs) hold the content; Markdown reads
// through a wrapper of blocks only, so the content stands flat for the collapse
const WRAPPERS = new Set(['DIV', 'SECTION', 'ARTICLE', 'MAIN', 'ASIDE', 'HEADER', 'FOOTER', 'NAV']);
const BLOCKISH = new Set([...WRAPPERS, 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'TABLE', 'HR', 'BLOCKQUOTE', 'FIGURE', 'PRE', 'DL']);
function flat(node, out = []) {
  [...node.childNodes].forEach((n) => {
    if (n.nodeType === 3 && !n.nodeValue.trim()) return;
    if (n.nodeType === 8) return;
    const wrapper = n.nodeType === 1 && WRAPPERS.has(n.tagName)
      && [...n.childNodes].every((c) => (c.nodeType === 3 ? !c.nodeValue.trim() : c.nodeType !== 1 || BLOCKISH.has(c.tagName)));
    if (wrapper) flat(n, out);
    else out.push(n);
  });
  return out;
}

function tableToDiv(main, doc) {
  // the table form has a section break or a block table of its own at the top (the generated
  // scripts append "<hr>" and the Metadata table); a DA document's top holds only its section divs
  if (![...main.children].some((n) => n.tagName === 'TABLE' || n.tagName === 'HR')) return null;
  const kids = flat(main);
  const heads = new Map();
  const groups = [[]];
  kids.forEach((n) => {
    if (n.nodeType === 1 && n.tagName === 'HR') groups.push([]);
    else groups[groups.length - 1].push(n);
  });
  main.replaceChildren();
  groups.forEach((g) => {
    const section = doc.createElement('div');
    section.dataset.mcSection = '';
    g.forEach((n) => {
      if (n.nodeType === 1 && n.tagName === 'TABLE') {
        const rows = [...n.querySelectorAll(':scope > tbody > tr, :scope > thead > tr, :scope > tr')];
        const head = rows.shift();
        const text = head ? head.textContent.trim() : '';
        const m = text.match(/^([^(]*?)\s*(?:\((.*)\))?$/);
        const name = toClass(m ? m[1] : text);
        const opts = m && m[2] ? m[2].split(',').map(toClass).filter(Boolean) : [];
        const block = doc.createElement('div');
        block.className = [name, ...opts].join(' ');
        const tds = rows.map((tr) => [...tr.children]);
        heads.set(block, {
          text, name: m ? m[1].trim() : text, opts: opts.join(' '), table: n, tds,
        });
        tds.forEach((cells) => {
          const row = doc.createElement('div');
          cells.forEach((td) => {
            const cell = doc.createElement('div');
            cell.append(...td.childNodes);
            row.append(cell);
          });
          block.append(row);
        });
        section.append(block);
      } else {
        // a page element with classes (www's div.maui-link around its link): content, not a block
        if (n.nodeType === 1 && n.tagName === 'DIV' && n.className) {
          n.dataset.mcClass = n.className;
          n.removeAttribute('class');
        }
        section.append(n);
      }
    });
    main.append(section);
  });
  return () => {
    const sections = [...main.children];
    main.replaceChildren();
    sections.forEach((section, i) => {
      if (i) main.append(doc.createElement('hr'));
      [...section.childNodes].forEach((n) => {
        if (n.nodeType === 1 && n.tagName === 'DIV' && n.classList.length) {
          const [name, ...opts] = [...n.classList];
          const was = heads.get(n);
          // the importer's own table where the collapse changed neither its name nor its rows
          const rowsNow = [...n.children];
          if (was && was.opts === opts.join(' ') && rowsNow.length === was.tds.length
            && rowsNow.every((r, ri) => r.children.length === was.tds[ri].length)) {
            rowsNow.forEach((r, ri) => [...r.children].forEach((c, ci) => was.tds[ri][ci].append(...c.childNodes)));
            main.append(was.table);
            return;
          }
          const label = was && was.opts === opts.join(' ') ? was.text
            : `${was ? was.name : titleOf(name)}${opts.length ? ` (${opts.join(', ')})` : ''}`;
          const table = doc.createElement('table');
          const rows = [...n.children];
          const width = Math.max(1, ...rows.map((r) => r.children.length));
          const head = doc.createElement('tr');
          const th = doc.createElement('th');
          if (width > 1) th.setAttribute('colspan', String(width));
          th.textContent = label;
          head.append(th);
          const thead = doc.createElement('thead');
          thead.append(head);
          const tbody = doc.createElement('tbody');
          rows.forEach((r) => {
            const tr = doc.createElement('tr');
            [...r.children].forEach((c) => {
              const td = doc.createElement('td');
              td.append(...c.childNodes);
              tr.append(td);
            });
            tbody.append(tr);
          });
          table.append(thead, tbody);
          main.append(table);
        } else {
          if (n.nodeType === 1 && n.dataset && n.dataset.mcClass !== undefined) {
            n.className = n.dataset.mcClass;
            delete n.dataset.mcClass;
          }
          main.append(n);
        }
      });
    });
  };
}

const isBlock = (el) => !!el && el.nodeType === 1 && el.tagName === 'DIV' && el.classList.length > 0;
const blockName = (el) => (isBlock(el) ? el.className.trim().split(/\s+/)[0] : '');
const sectionOf = (el, main) => {
  let n = el;
  while (n && n.parentElement !== main) n = n.parentElement;
  return n;
};
const blockOf = (el, main) => {
  for (let n = el.parentElement; n && n !== main; n = n.parentElement) {
    if (n.parentElement && n.parentElement.parentElement === main && isBlock(n)) return n;
  }
  return null;
};
const ownContent = (section) => [...section.children].filter((el) => !isBlock(el) || !BLOCK_SKIP.has(blockName(el)));
const ownText = (section) => [...section.children].filter((el) => !isBlock(el));

/** A key/value block's rows ({key: valueCell}). */
function kvRows(block) {
  const out = {};
  [...block.children].forEach((row) => {
    const [k, v] = row.children;
    if (k && v) out[k.textContent.trim().toLowerCase()] = v;
  });
  return out;
}

function sectionStyles(section) {
  const meta = [...section.children].find((c) => blockName(c) === 'section-metadata');
  const cell = meta && kvRows(meta).style;
  return cell ? cell.textContent.split(',').map(toClass).filter(Boolean) : [];
}

function addSectionStyle(section, style, doc) {
  let meta = [...section.children].find((c) => blockName(c) === 'section-metadata');
  if (!meta) {
    meta = doc.createElement('div');
    meta.className = 'section-metadata';
    section.append(meta);
  }
  let cell = kvRows(meta).style;
  if (!cell) {
    const row = doc.createElement('div');
    const k = doc.createElement('div');
    k.textContent = 'Style';
    cell = doc.createElement('div');
    row.append(k, cell);
    meta.prepend(row);
  }
  const have = cell.textContent.split(',').map((s) => s.trim()).filter(Boolean);
  if (have.map(toClass).includes(style)) return false;
  cell.textContent = [...have, style].join(', ');
  return true;
}

function addBlockOption(block, opt) {
  if (block.classList.contains(opt)) return false;
  block.classList.add(opt);
  return true;
}

function pageMetaCell(main, key, doc, create = false) {
  const meta = main.querySelector(':scope > div > div.metadata');
  if (!meta) return null;
  const rows = kvRows(meta);
  if (rows[key.toLowerCase()] || !create) return rows[key.toLowerCase()] || null;
  const row = doc.createElement('div');
  const k = doc.createElement('div');
  k.textContent = key;
  const v = doc.createElement('div');
  row.append(k, v);
  meta.append(row);
  return v;
}

/** A new section right after section with the elements given (styles copied: grey, padded …). */
function splitSection(section, els, doc, styles = []) {
  const next = doc.createElement('div');
  if (section.dataset && 'mcSection' in section.dataset) next.dataset.mcSection = '';
  section.after(next);
  next.append(...els);
  sectionStyles(section).forEach((s) => addSectionStyle(next, s, doc));
  styles.forEach((s) => addSectionStyle(next, s, doc));
  return next;
}

/** Moves el and everything of section after it into a new section; returns it (or null). */
function splitBefore(section, el, doc) {
  const rest = [];
  for (let n = el; n; n = n.nextSibling) rest.push(n);
  const move = rest.filter((n) => !(n.nodeType === 1 && blockName(n) === 'section-metadata'));
  if (!move.some((n) => n.nodeType === 1 || (n.nodeValue || '').trim())) return null;
  if (!ownContent(section).some((n) => !move.includes(n))) return section;
  return splitSection(section, move, doc);
}

/** Moves everything of section after el (el excluded) into a new section; returns it (or null). */
function splitAfter(section, el, doc) {
  const next = el.nextElementSibling;
  return next && !(blockName(next) === 'section-metadata') ? splitBefore(section, next, doc) : null;
}

/* ---------------------------------------------------------------------------- markers */

function lastText(el) {
  let last = null;
  const walk = (n) => n.childNodes.forEach((c) => {
    if (c.nodeType === 3) { if (c.nodeValue.trim()) last = c; } else if (c.nodeType === 1) walk(c);
  });
  walk(el);
  return last;
}

/** Takes every known marker off the end of an element; returns their tokens (in order). */
function takeTokens(el) {
  const tokens = [];
  for (let guard = 0; guard < 6; guard += 1) {
    const t = lastText(el);
    const m = t && t.nodeValue.match(TAIL);
    if (!m) break;
    tokens.unshift(...m[1].split(/\s+/));
    t.nodeValue = t.nodeValue.slice(0, m.index);
  }
  // a text node left empty after its marker (" {caption}" after a link): gone
  return tokens;
}

function firstText(el) {
  let first = null;
  const walk = (n) => n.childNodes.forEach((c) => {
    if (first) return;
    if (c.nodeType === 3) { if (c.nodeValue.trim()) first = c; } else if (c.nodeType === 1) walk(c);
  });
  walk(el);
  return first;
}

const textOf = (el) => (el.textContent || '').replace(/[\u200b\ufeff]/g, '').replace(/\s+/g, ' ')
  .trim();
const isEmptyP = (el) => el.tagName === 'P' && !textOf(el) && !el.querySelector('img, picture, video, iframe, a, br + *');

/* ------------------------------------------------------------------------------ slugs */

export function slug(text) {
  return String(text).toLowerCase().replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, '').replace(/ /g, '-');
}

/* --------------------------------------------------------------------------- families */

/** App screens: their markers as App Spacer, App Divider and App Text blocks, in place. */
function collapseApp(main, doc, stats) {
  main.querySelectorAll(':scope > div > p').forEach((p) => {
    const raw = textOf(p);
    const sp = raw.match(APP_SPACER);
    if (sp) {
      const b = doc.createElement('div');
      b.className = ['app-spacer', sp[1].toLowerCase(), ...(sp[2] ? ['v2'] : [])].join(' ');
      b.innerHTML = '<div><div></div></div>';
      p.replaceWith(b);
      count(stats, 'carrier', 'app');
      return;
    }
    if (/^\{divider\}$/i.test(raw)) {
      const b = doc.createElement('div');
      b.className = 'app-divider';
      b.innerHTML = '<div><div></div></div>';
      p.replaceWith(b);
      count(stats, 'carrier', 'app');
    }
  });
  // small text: runs of "{small}" paragraphs, one App Text (small) block each
  main.querySelectorAll(':scope > div').forEach((section) => {
    let run = null;
    [...section.children].forEach((el) => {
      const t = el.tagName === 'P' && lastText(el);
      if (t && APP_SMALL.test(t.nodeValue)) {
        t.nodeValue = t.nodeValue.replace(APP_SMALL, '');
        if (!run) {
          run = doc.createElement('div');
          run.className = 'app-text small';
          run.innerHTML = '<div><div></div></div>';
          el.before(run);
        }
        run.querySelector(':scope > div > div').append(el);
        count(stats, 'carrier', 'app');
      } else run = null;
    });
  });
}

/** The form block's "{selected}": the options chosen at load in a Default column. */
function collapseForms(main, doc, stats) {
  main.querySelectorAll(':scope > div > div.form').forEach((block) => {
    const rows = [...block.children];
    if (!rows.length) return;
    const header = readHeaderTexts([...rows[0].children].map((c) => textOf(c)));
    const optionsAt = header ? header.options : 4;
    let defaultAt = header ? header.default : 10;
    const body = header ? rows.slice(1) : rows;
    const found = body.map((row) => {
      const cell = row.children[optionsAt];
      if (!cell) return [];
      const picked = [];
      const lines = cell.querySelectorAll('p, li').length ? [...cell.querySelectorAll('p, li')] : [cell];
      lines.forEach((line) => {
        const parts = [...line.childNodes].filter((n) => n.nodeType === 3 && SELECTED.test(n.nodeValue));
        parts.forEach((n) => {
          // the option's label: its line's text (value=Label: the label)
          const own = n.nodeValue.replace(SELECTED, '');
          n.nodeValue = own;
          const text = (own.trim() ? own : textOf(line)).split(/\n/).pop().trim();
          const label = text.includes('=') ? text.slice(text.indexOf('=') + 1).trim() : text;
          if (label) picked.push(label);
        });
      });
      return picked;
    });
    if (!found.some((f) => f.length)) return;
    if (defaultAt === undefined) {
      defaultAt = rows[0].children.length;
      const h = doc.createElement('div');
      h.textContent = 'Default';
      rows[0].append(h);
    }
    body.forEach((row, i) => {
      while (row.children.length <= defaultAt) row.append(doc.createElement('div'));
      const cell = row.children[defaultAt];
      if (!found[i].length) return;
      cell.replaceChildren(...found[i].map((l) => { const p = doc.createElement('p'); p.textContent = l; return p; }));
      count(stats, 'carrier', 'form', found[i].length);
    });
  });
}

/** The nav document's role markers: its tools list as a Nav Tools table (item | role | list). */
function collapseNav(main, doc, stats) {
  main.querySelectorAll(':scope > div > ul').forEach((list) => {
    const items = [...list.children].filter((li) => li.tagName === 'LI');
    if (!items.some((li) => ROLE.test(li.textContent))) return;
    const block = doc.createElement('div');
    block.className = 'nav-tools';
    items.forEach((li) => {
      const sub = [...li.children].filter((c) => /^(UL|OL)$/.test(c.tagName));
      sub.forEach((s) => s.remove());
      let role = '';
      const walk = (n) => n.childNodes.forEach((c) => {
        if (c.nodeType === 3 && ROLE.test(c.nodeValue)) {
          [, role] = c.nodeValue.match(ROLE);
          c.nodeValue = c.nodeValue.replace(ROLE, ' ').replace(/\s+$/, '');
        } else if (c.nodeType === 1) walk(c);
      });
      walk(li);
      const row = doc.createElement('div');
      const item = doc.createElement('div');
      const p = doc.createElement('p');
      p.append(...li.childNodes);
      item.append(p);
      const r = doc.createElement('div');
      if (role && readNavRole(role)) {
        r.textContent = role;
        count(stats, 'carrier', 'nav');
      }
      const more = doc.createElement('div');
      more.append(...sub);
      row.append(item, r, more);
      block.append(row);
    });
    list.replaceWith(block);
  });
}

const VIDEO_LINK = (a) => /\.(mp4|m4v|webm|mov)(?:$|[?#])/i.test(a.getAttribute('href') || '');
const urlText = (a) => {
  const t = textOf(a);
  return !t || t === a.getAttribute('href') || /^(https?:\/\/|\/)\S+$/.test(t) || /\.(mp4|m4v|webm|mov)$/i.test(t);
};
function readableName(href) {
  const file = decodeURIComponent(String(href).split(/[?#]/)[0].split('/').pop() || '').replace(/\.[a-z0-9]+$/i, '');
  const words = file.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : 'Video';
}
function addFragment(a, part) {
  const href = a.getAttribute('href');
  const at = href.indexOf('#');
  const base = at < 0 ? href : href.slice(0, at);
  const parts = at < 0 ? [] : href.slice(at + 1).split('&').filter(Boolean);
  const key = part.split('=')[0];
  if (parts.some((p) => p.split('=')[0] === key)) return;
  a.setAttribute('href', `${base}#${[...parts, part].join('&')}`);
}

/** Video settings markers; Article Header's {mobile}. */
function collapseVideos(main, doc, stats, marks) {
  marks.forEach((tokens, el) => {
    const video = tokens.filter((t) => VIDEO_SETTINGS.includes(t) || /^size-\d+x\d+$/.test(t) || t === 'mobile');
    if (!video.length) return;
    const a = [...el.querySelectorAll('a[href]')].find(VIDEO_LINK);
    const block = blockOf(el, main);
    if (video.includes('mobile') && block && blockName(block) === 'article-header') {
      if (addBlockOption(block, 'mobile-video')) count(stats, 'carrier', 'video');
    } else if (video.includes('mobile')) count(stats, 'hand', 'video');
    if (!a) {
      if (video.some((t) => t !== 'mobile')) count(stats, 'hand', 'video');
      return;
    }
    const size = video.find((t) => /^size-\d+x\d+$/.test(t));
    if (size) {
      addFragment(a, `size=${size.slice(5)}`);
      count(stats, 'carrier', 'video');
    }
    const settings = video.filter((t) => VIDEO_SETTINGS.includes(t));
    if (settings.includes('autoplay') && !settings.includes('controls')) {
      // a background video: the block's option, else the link's fragment
      if (block && blockName(block) !== 'article-header') addBlockOption(block, 'background-video');
      else addFragment(a, 'background');
      count(stats, 'carrier', 'video');
    } else if (settings.length) count(stats, 'theme', 'video');
    if (urlText(a)) {
      const poster = el.querySelector('img') || (el.previousElementSibling && isImageParagraph(el.previousElementSibling) && el.previousElementSibling.querySelector('img'));
      a.textContent = (poster && poster.getAttribute('alt')) || readableName(a.getAttribute('href'));
    }
  });
}

/** "{caption}": the paragraph in italics (a figure caption right after an image). */
function collapseCaptions(main, doc, stats, marks, hand) {
  marks.forEach((tokens, el) => {
    if (!tokens.includes('caption') || el.tagName !== 'P') return;
    // a link alone in italics stays a button (step 1): a person decides
    const onlyLink = el.querySelectorAll('a').length === 1 && textOf(el.querySelector('a')) === textOf(el);
    const kids = [...el.childNodes].filter((n) => n.nodeType === 1 || n.nodeValue.trim());
    if (!(kids.length === 1 && kids[0].nodeType === 1 && /^(EM|I)$/.test(kids[0].tagName))) {
      const em = doc.createElement('em');
      em.append(...el.childNodes);
      // trailing space of the marker's text node
      if (em.lastChild && em.lastChild.nodeType === 3) em.lastChild.nodeValue = em.lastChild.nodeValue.replace(/\s+$/, '');
      el.append(em);
    }
    if (isImageParagraph(el.previousElementSibling) && !onlyLink) count(stats, 'carrier', 'caption');
    else {
      count(stats, 'hand', 'caption');
      hand.push(`caption after no image: "${textOf(el).slice(0, 60)}"`);
    }
  });
}

/** Heading size: the theme's default within a step, else a level-scoped choice. */
function headingWish(theme, level, size) {
  const def = theme.headings[`h${level}`];
  const idx = (s) => (s === 'copytext-large' ? HEADING_SIZES.length : HEADING_SIZES.indexOf(s));
  const steps = size === 'copytext-large' ? idx(size) - idx(def) : sizeSteps(def, size);
  if (steps === null || Math.abs(steps) <= 1) return { kind: 'default' };
  const choice = steps < 0 ? 'large' : 'compact';
  const has = ((theme.headingChoices || {})[`h${level}`] || {})[choice];
  return has ? { kind: 'choice', choice } : { kind: 'none' };
}

function collapseHeadings(main, doc, stats, marks, theme) {
  const wishes = new Map(); // heading -> choice
  marks.forEach((tokens, el) => {
    if (!/^H[1-6]$/.test(el.tagName)) return;
    const size = tokens.find((t) => SIZE_TOKEN.test(t));
    tokens.filter((t) => t === 'limited-width').forEach(() => count(stats, 'theme', 'heading'));
    if (!size) return;
    const w = headingWish(theme, Number(el.tagName[1]), size);
    if (w.kind === 'default') count(stats, 'theme', 'heading');
    else if (w.kind === 'none') count(stats, 'theme', 'heading-no-choice');
    else wishes.set(el, w.choice);
  });
  // in blocks: the block's title option when most of its headings ask for the same choice
  const blocks = new Map();
  const sections = new Map();
  wishes.forEach((choice, h) => {
    const block = blockOf(h, main);
    if (block) {
      if (!blocks.has(block)) blocks.set(block, []);
      blocks.get(block).push(choice);
    } else {
      const s = sectionOf(h, main);
      const key = `h${h.tagName[1]}-${choice}`;
      if (!sections.has(s)) sections.set(s, new Map());
      sections.get(s).set(key, (sections.get(s).get(key) || 0) + 1);
    }
  });
  blocks.forEach((choices, block) => {
    const all = block.querySelectorAll(HEADING).length;
    const top = ['large', 'compact'].map((c) => [c, choices.filter((x) => x === c).length]).sort((a, b) => b[1] - a[1])[0];
    if (top[1] * 2 > all && addBlockOption(block, `title-${top[0]}`)) count(stats, 'carrier', 'heading', top[1]);
    else count(stats, 'theme', 'heading-aligned', choices.length);
  });
  const styled = [];
  sections.forEach((keys, section) => {
    keys.forEach((n, key) => {
      const level = key.slice(0, 2).toUpperCase();
      const all = ownText(section).filter((el) => el.tagName === level).length;
      if (n * 2 > all) {
        styled.push([section, key]);
        count(stats, 'carrier', 'heading', n);
      } else count(stats, 'theme', 'heading-aligned', n);
    });
  });
  // a choice every section with headings of that level takes: the page's Headings row instead
  const byKey = new Map();
  styled.forEach(([s, k]) => { if (!byKey.has(k)) byKey.set(k, []); byKey.get(k).push(s); });
  byKey.forEach((list, key) => {
    const level = key.slice(0, 2).toUpperCase();
    const withLevel = [...main.children].filter((s) => ownText(s).some((el) => el.tagName === level));
    const row = withLevel.length > 1 && withLevel.every((s) => list.includes(s)) && pageMetaCell(main, 'Headings', doc, true);
    if (row) {
      const label = `${level} ${key.slice(3)}`;
      const have = textOf(row).split(',').map((x) => x.trim()).filter(Boolean);
      if (!have.includes(label)) row.textContent = [...have, label].join(', ');
    } else list.forEach((s) => addSectionStyle(s, key, doc));
  });
}

const isRunningText = (el) => (el.tagName === 'P' && !isImageParagraph(el) && !SEPARATOR.test(textOf(el)) && textOf(el)) || /^(UL|OL)$/.test(el.tagName);

/** Paragraph and list tokens: text size and width, indent, parallax, narrow. */
function collapseText(main, doc, stats, marks, theme, brand, hand) {
  const body = BODY_PX[brand] || 18;
  const smallIn = new Map(); // section or block -> elements asking for small print
  const wideIn = new Map();
  const indents = [];
  const parallax = [];
  marks.forEach((tokens, el) => {
    if (/^H[1-6]$/.test(el.tagName)) return;
    const target = el.tagName === 'LI' ? el.parentElement : el;
    const block = blockOf(target, main);
    tokens.forEach((t) => {
      if (/^copytext-/.test(t)) {
        const px = TEXT_PX[t] || body;
        const intro = brand === 'austrian' && t === 'copytext-large' && target.previousElementSibling && target.previousElementSibling.tagName === 'H1';
        if (intro) count(stats, 'theme', 'text-size');
        else if (Math.abs(px - body) <= 2) count(stats, 'theme', 'text-size');
        else {
          const key = block || sectionOf(target, main);
          if (!smallIn.has(key)) smallIn.set(key, []);
          smallIn.get(key).push(target);
        }
      } else if (t === 'full-width' || t === 'limited-width') {
        if (block) { count(stats, 'theme', 'text-width'); return; }
        const wantFull = t === 'full-width';
        if ((theme.text.width === 'full') === wantFull) { count(stats, 'theme', 'text-width'); return; }
        if (!wantFull) { count(stats, 'theme', 'text-width'); return; }
        const s = sectionOf(target, main);
        if (!wideIn.has(s)) wideIn.set(s, []);
        wideIn.get(s).push(target);
      } else if (/^indent-\d+$/.test(t)) indents.push(target);
      else if (t === 'parallax') parallax.push(target);
      else if (t === 'narrow') {
        const s = sectionOf(target, main);
        if (target.closest('blockquote') && !block && addSectionStyle(s, 'narrow', doc)) count(stats, 'carrier', 'quote');
        else count(stats, block ? 'hand' : 'theme', 'quote');
      }
    });
  });
  // small print
  smallIn.forEach((els, key) => {
    if (isBlock(key) && key.parentElement && key.parentElement.parentElement === main) {
      const all = [...key.querySelectorAll('p, ul, ol')].filter(isRunningText).length;
      if (els.length * 2 > all && addBlockOption(key, 'small-print')) count(stats, 'carrier', 'text-size', els.length);
      else count(stats, 'theme', 'text-size', els.length);
      return;
    }
    const section = key;
    const text = ownText(section).filter(isRunningText);
    if (els.length === text.length) {
      addSectionStyle(section, 'small-print', doc);
      count(stats, 'carrier', 'text-size', els.length);
      return;
    }
    // a trailing run (small text, separators and empty paragraphs to the section's end, no block
    // after it): a section of its own
    const kids = [...section.children].filter((el) => !(isBlock(el) && BLOCK_SKIP.has(blockName(el))));
    const filler = (el) => SEPARATOR.test(textOf(el)) || isEmptyP(el);
    let k = kids.length - 1;
    while (k >= 0 && (els.includes(kids[k]) || (!isBlock(kids[k]) && filler(kids[k])))) k -= 1;
    const run = kids.slice(k + 1).filter((el) => els.includes(el));
    if (run.length && run.length < text.length) {
      const first = kids.slice(k + 1).find((el) => els.includes(el));
      const next = splitBefore(section, first, doc);
      if (next) addSectionStyle(next, 'small-print', doc);
      count(stats, 'carrier', 'text-size', run.length);
      count(stats, 'theme', 'text-size', els.length - run.length);
    } else count(stats, 'theme', 'text-size', els.length);
  });
  // wide text: a section whose own running text is mostly wide
  wideIn.forEach((els, section) => {
    const all = ownText(section).filter(isRunningText).length;
    if (els.length * 2 > all) {
      addSectionStyle(section, 'wide-text', doc);
      count(stats, 'carrier', 'text-width', els.length);
    } else count(stats, 'theme', 'text-width', els.length);
  });
  // indent: a misread list or quote, else it goes
  const BULLET = /^\s*[•·▪‣◦*–—-]\s+/;
  const NUMBER = /^\s*\d{1,2}[.)]\s+/;
  const QUOTE = /^\s*[„“"«‚‘»].*[“”"»‘’«]\s*$/;
  const done = new Set();
  indents.forEach((el) => {
    if (done.has(el) || el.tagName !== 'P') { count(stats, 'theme', 'indent'); return; }
    const t = textOf(el);
    const kind = (BULLET.test(t) && 'UL') || (NUMBER.test(t) && 'OL') || '';
    if (kind) {
      const run = [el];
      for (let n = el.nextElementSibling; n && indents.includes(n) && (kind === 'UL' ? BULLET : NUMBER).test(textOf(n)); n = n.nextElementSibling) run.push(n);
      const list = doc.createElement(kind.toLowerCase());
      el.before(list);
      run.forEach((p) => {
        done.add(p);
        const li = doc.createElement('li');
        li.append(...p.childNodes);
        const first = firstText(li);
        if (first) first.nodeValue = first.nodeValue.replace(kind === 'UL' ? BULLET : NUMBER, '');
        list.append(li);
        p.remove();
      });
      count(stats, 'carrier', 'indent', run.length);
    } else if (QUOTE.test(t) && !el.closest('blockquote')) {
      const q = doc.createElement('blockquote');
      el.before(q);
      q.append(el);
      count(stats, 'carrier', 'indent');
    } else count(stats, 'theme', 'indent');
  });
  // parallax: the section's image style (an image of its own section when the section has others)
  parallax.forEach((el) => {
    if (blockOf(el, main)) { count(stats, 'hand', 'parallax'); hand.push('parallax in a block'); return; }
    const section = sectionOf(el, main);
    const images = ownText(section).filter((x) => isImageParagraph(x));
    if (images.every((x) => parallax.includes(x))) {
      addSectionStyle(section, 'parallax', doc);
      count(stats, 'carrier', 'parallax');
      return;
    }
    const own = splitBefore(section, el, doc) || section;
    splitAfter(own, el, doc);
    addSectionStyle(own, 'parallax', doc);
    count(stats, 'carrier', 'parallax');
  });
}

/**
 * The columns-media parser's narrow pictures ("{cell-half-start}", "{cell-half-end}",
 * "{cell-three-quarters}"): the block's option picture-half-start, picture-half-end,
 * picture-three-quarters when its marked pictures agree and none of its pictures goes unmarked.
 */
function collapseCells(main, stats, marks, hand) {
  const blocks = new Map();
  marks.forEach((tokens, el) => {
    const cell = tokens.find((t) => /^cell-/.test(t));
    if (!cell) return;
    const block = blockOf(el, main);
    if (!block) { count(stats, 'hand', 'picture'); hand.push(`a narrow picture outside a block (${cell})`); return; }
    if (!blocks.has(block)) blocks.set(block, []);
    blocks.get(block).push(cell.slice(5));
  });
  blocks.forEach((kinds, block) => {
    const pictures = [...block.querySelectorAll('p')].filter((p) => p.querySelector('picture, img') && !textOf(p)).length;
    if (new Set(kinds).size === 1 && kinds.length === pictures) {
      addBlockOption(block, `picture-${kinds[0]}`);
      count(stats, 'carrier', 'picture', kinds.length);
    } else {
      count(stats, 'hand', 'picture', kinds.length);
      hand.push(`narrow pictures of different kinds in one ${blockName(block)} (${kinds.join(', ')})`);
    }
  });
}

/** Column marks: structure now; an outside group over its whole section: the section's padding. */
function collapseColumns(main, doc, stats, marks) {
  const outer = new Map();
  marks.forEach((tokens, el) => {
    tokens.filter((t) => COLUMN.test(t)).forEach((t) => {
      if (t === 'column-start-outer' || t === 'column-end-outer') {
        const s = sectionOf(el.tagName === 'LI' ? el.parentElement : el, main);
        if (!outer.has(s)) outer.set(s, { start: [], end: [] });
        outer.get(s)[t === 'column-start-outer' ? 'start' : 'end'].push(el.tagName === 'LI' ? el.parentElement : el);
      } else count(stats, 'theme', 'column');
    });
  });
  outer.forEach(({ start, end }, section) => {
    const own = ownContent(section).filter((el) => !(el.tagName === 'P' && isEmptyP(el) && !start.includes(el) && !end.includes(el)));
    const spans = start.length === 1 && end.length === 1 && own[0] === start[0] && own[own.length - 1] === end[0];
    if (spans && !sectionStyles(section).includes('padded')) {
      addSectionStyle(section, 'padded', doc);
      count(stats, 'carrier', 'column', 2);
    } else count(stats, 'theme', 'column', start.length + end.length);
  });
  // a page with column views that is no flow page yet (the hub: ema-adobe's hub-column-views marks
  // www's column views as on info pages): the flow pages' spacing (Theme flow-spacing), whose
  // column-view gap rule (the theme's 32 px above a heading after content) takes the marks' place;
  // a page's Theme row, one per page
  const hasColumns = [...marks.values()].some((tokens) => tokens.some((t) => COLUMN.test(t)));
  if (hasColumns) {
    const theme = pageMetaCell(main, 'Theme', doc, false);
    const values = theme ? textOf(theme).split(',').map((x) => x.trim()).filter(Boolean) : [];
    if (!values.includes('flow-spacing')) {
      const cell = theme || pageMetaCell(main, 'Theme', doc, true);
      if (cell) {
        cell.textContent = [...values, 'flow-spacing'].join(', ');
        count(stats, 'carrier', 'column-page');
      }
    }
  }
}

/** A paragraph that is all one bold text (a chapter heading written as a paragraph). */
function isBoldHeading(el) {
  if (!el || el.tagName !== 'P') return false;
  const kids = [...el.childNodes].filter((n) => n.nodeType === 1 || (n.nodeValue || '').trim());
  return kids.length === 1 && kids[0].nodeType === 1 && /^(STRONG|B)$/.test(kids[0].tagName) && !!textOf(kids[0]) && !kids[0].querySelector('a, img, picture');
}

/** Separators: runs of "{spacer-N}" / "{divider-N}" paragraphs. */
function collapseSeparators(main, doc, stats, ctx) {
  // the page type's gaps the theme draws (THEMES rules: sections-m, rule-before-info-box,
  // ruled-chapters)
  const { rules } = themeFor(ctx.brand, ctx.pageType);
  const isSep = (el) => !!el && el.tagName === 'P' && SEPARATOR.test(textOf(el));
  const parse = (el) => textOf(el).match(SEPARATOR);
  // in block cells, or nested in any other element of the page (an importer's tab panel before
  // its sections): no carrier there; the space goes
  main.querySelectorAll(':scope > div > * p').forEach((p) => {
    if (!isSep(p)) return;
    count(stats, 'theme', 'separator-in-block');
    p.remove();
  });
  [...main.children].forEach((section) => {
    const kids = [...section.children];
    const runs = [];
    kids.forEach((el, i) => {
      if (!isSep(el)) return;
      if (runs.length && runs[runs.length - 1].end === i - 1) {
        runs[runs.length - 1].els.push(el);
        runs[runs.length - 1].end = i;
      } else runs.push({ els: [el], start: i, end: i });
    });
    runs.forEach((run) => {
      const seps = run.els.map(parse);
      const divider = seps.some((m) => m[1] === 'divider');
      const px = seps.reduce((a, m) => a + Number(m[2]), 0);
      seps.filter((m) => m[3]).forEach(() => count(stats, 'theme', 'separator-from-768'));
      let size = null;
      if (!divider && px <= 31) size = 'none';
      else if (!divider) size = px < 90 ? 'm' : 'l';
      const content = (el) => el && !(isBlock(el) && BLOCK_SKIP.has(blockName(el))) && !isSep(el);
      const before = run.els[0].previousElementSibling;
      const after = run.els[run.els.length - 1].nextElementSibling;
      const atStart = !content(before) && kids.slice(0, run.start).every((el) => !content(el));
      const atEnd = kids.slice(run.end + 1).every((el) => !content(el));
      const remove = () => run.els.forEach((el) => el.remove());
      if (size === 'none') { remove(); count(stats, 'theme', 'separator', run.els.length); return; }
      // page-type gaps: the theme's
      if (rules.includes('sections-m') && size === 'm' && (atStart || atEnd)) {
        remove(); count(stats, 'theme', 'separator', run.els.length); return;
      }
      if (divider) {
        // the rule above an info box (Columns Media) after any content but a heading (text, a
        // picture, its caption, another block)
        if (rules.includes('rule-before-info-box') && blockName(after) === 'columns-media' && before && !atStart && !/^H[1-6]$/.test(before.tagName)) {
          remove(); count(stats, 'theme', 'separator', run.els.length); return;
        }
        // a rule before a chapter heading (an H2 / H3, or a bold paragraph standing for one:
        // "About", "Tip"): the chapter a section of its own, the theme rules it
        if (rules.includes('ruled-chapters') && after && (/^H[23]$/.test(after.tagName) || isBoldHeading(after)) && !atStart) {
          const last = run.els[run.els.length - 1];
          splitAfter(section, last, doc);
          remove();
          count(stats, 'theme', 'separator', run.els.length);
          return;
        }
      }
      const style = divider ? 'divider' : `space-${size}`;
      if (atStart && !atEnd && !sectionStyles(section).some((s) => /^(space-[ml]|divider)$/.test(s))) {
        addSectionStyle(section, style, doc); remove(); count(stats, 'carrier', 'separator', run.els.length); return;
      }
      if (atEnd && !atStart && !sectionStyles(section).some((s) => /^(space-below-[ml]|divider-below)$/.test(s))) {
        addSectionStyle(section, divider ? 'divider-below' : `space-below-${size}`, doc); remove(); count(stats, 'carrier', 'separator', run.els.length); return;
      }
      if (isBlock(after) && !BLOCK_SKIP.has(blockName(after)) && !['space-m', 'space-l', 'divider-above'].some((o) => after.classList.contains(o))) {
        addBlockOption(after, divider ? 'divider-above' : `space-${size}`); remove(); count(stats, 'carrier', 'separator', run.els.length); return;
      }
      const b = doc.createElement('div');
      b.className = divider ? 'divider' : `spacer${size === 'l' ? ' l' : ''}`;
      b.innerHTML = '<div><div></div></div>';
      run.els[0].before(b);
      remove();
      count(stats, 'carrier', 'separator', run.els.length);
    });
  });
}

/** TAP's empty line (<p><sub>{blank}</sub></p>): a paragraph gap, the paragraph goes. */
function collapseBlank(main, stats) {
  main.querySelectorAll('p').forEach((p) => {
    if (BLANK_LINE.test(p.textContent) && p.querySelector(':scope > sub')) {
      p.remove();
      count(stats, 'theme', 'blank');
    }
  });
}

/* -------------------------------------------------------------------------------- main */

// a source page's brand by its host (the generated import scripts: their documents' brand)
const BRAND_HOSTS = [
  [/(^|\.)austrian\.com$/, 'austrian'], [/(^|\.)brusselsairlines\.com$/, 'brussels'], [/(^|\.)ita-airways\.com$/, 'ita'],
  [/(^|\.)swiss\.com$/, 'swiss'], [/(^|\.)flytap\.com$/, 'tap'], [/(^|\.)discover\.com$/, 'discover'],
  [/(^|\.)lufthansa-cargo\.com$/, 'cargo'], [/(^|\.)airdolomiti\.(it|eu|de)$/, 'airdolomiti'], [/(^|\.)lufthansagroup\.com$/, 'b2b'],
];
export const brandOfHost = (host) => (BRAND_HOSTS.find(([re]) => re.test(String(host || ''))) || [null, 'lufthansa'])[1];

const metaValue = (main, key) => {
  const cell = pageMetaCell(main, key, null);
  return cell ? textOf(cell) : '';
};

/**
 * Collapses the markers of a page's main element (div form, or the importers' table form).
 * @param {Element} main
 * @param {{path?: string, brand?: string, document?: Document}} [opts]
 * @returns {{stats: object, ids: Object<string,string>, hand: string[]}}
 */
export function collapseMain(main, opts = {}) {
  const doc = opts.document || main.ownerDocument;
  const path = opts.path || '';
  const stats = newStats();
  const hand = [];
  // nothing that looks like a marker: the page as it came (no conversion, no re-serialisation)
  if (!/\{\s*[a-z][a-z0-9 ,:-]*\}/.test(main.textContent || '')) {
    return {
      stats, ids: {}, hand, changed: false,
    };
  }
  const brand = String(opts.brand || metaValue(main, 'brand') || 'lufthansa').toLowerCase();
  // until the brand's theme is live (scripts/style-markers.js isThemeLive, the one switch) the markers
  // stay: an import comes out as before; a site's collapse pass forces it (marker-collapse-cli --force)
  if (!opts.force && !isThemeLive(brand)) {
    return {
      stats, ids: {}, hand, changed: false, skipped: true,
    };
  }
  const back = tableToDiv(main, doc);
  if (/^\/content\/mobile\//.test(path)) {
    collapseApp(main, doc, stats);
    if (back) back();
    const t = totals(stats);
    return {
      stats, ids: {}, hand, changed: t.theme + t.carrier + t.hand > 0,
    };
  }
  // the page type the site will see: a page with column marks becomes a flow page (collapseColumns
  // writes its Theme row), so its headings are weighed against the flow pages' defaults
  const themes = metaValue(main, 'theme');
  const columnPage = /\{[^}]*\bcolumn-(start|end)/.test(main.textContent || '');
  const pageType = pageTypeOf({ path, articleHeader: !!main.querySelector('div.article-header'), themes: columnPage ? `${themes}, flow-spacing` : themes });
  const theme = themeFor(brand, pageType);
  const emptyBefore = new Set([...main.querySelectorAll(':scope > div')].filter((d) => !d.children.length && !textOf(d)));

  if (/\/nav$/.test(path)) collapseNav(main, doc, stats);
  collapseForms(main, doc, stats);
  collapseBlank(main, stats);
  // the markers at the end of headings, paragraphs and lists (a list's: its last item)
  const marks = new Map();
  main.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li').forEach((el) => {
    if (el.closest('div.metadata, div.section-metadata')) return;
    if (el.tagName === 'LI' && el.parentElement && [...el.parentElement.children].pop() !== el) return;
    if (el.tagName === 'P' && SEPARATOR.test(textOf(el))) return;
    const tokens = takeTokens(el);
    if (tokens.length) marks.set(el, tokens);
  });
  collapseVideos(main, doc, stats, marks);
  collapseCaptions(main, doc, stats, marks, hand);
  collapseHeadings(main, doc, stats, marks, theme);
  collapseColumns(main, doc, stats, marks);
  collapseText(main, doc, stats, marks, theme, brand, hand);
  collapseCells(main, stats, marks, hand);
  // a paragraph left with nothing (a column mark of its own): gone
  marks.forEach((tokens, el) => {
    if (el.isConnected && el.tagName === 'P' && isEmptyP(el)) el.remove();
  });
  collapseSeparators(main, doc, stats, { brand, pageType });

  const t = totals(stats);
  const changed = t.theme + t.carrier + t.hand > 0;
  // heading ids: a marked heading's id loses its marker's part ("free-baggage-heading-small" ->
  // "free-baggage", "about-heading-small-1" -> "about-1"), as Edge Delivery makes it of the new text and
  // scripts.js cut it at runtime; links to the old ids follow
  const ids = {};
  if (changed) {
    marks.forEach((tokens, h) => {
      if (!/^H[1-6]$/.test(h.tagName) || !h.id || !h.isConnected) return;
      const suffix = slug(tokens.join(' '));
      const m = h.id.match(new RegExp(`^(.*?)-?${suffix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(-\\d+)?$`));
      if (!m) return;
      // nothing left of it ("01 {heading-large}": the id was the marker's): the new text's slug
      const next = m[1] ? `${m[1]}${m[2] || ''}` : slug(textOf(h)).replace(/^\d+-+/, '');
      if (!next || next === h.id) return;
      ids[h.id] = next;
      h.id = next;
    });
    // two headings of one id now: Edge Delivery's -1, -2 for the later ones
    const seen = new Map();
    main.querySelectorAll(HEADING).forEach((h) => {
      if (!h.id) return;
      const base = h.id;
      if (!seen.has(base)) { seen.set(base, 0); return; }
      let n = seen.get(base) + 1;
      while (seen.has(`${base}-${n}`)) n += 1;
      seen.set(base, n);
      h.id = `${base}-${n}`;
      seen.set(h.id, 0);
    });
  }
  if (Object.keys(ids).length) {
    main.querySelectorAll('a[href*="#"]').forEach((a) => {
      const href = a.getAttribute('href');
      const at = href.indexOf('#');
      const page = href.slice(0, at);
      const frag = decodeURIComponent(href.slice(at + 1));
      if (page && page !== path && !page.endsWith(path)) return;
      if (ids[frag]) a.setAttribute('href', `${page}#${ids[frag]}`);
    });
  }
  // sections the collapse left empty (an empty section of the document's own stays)
  main.querySelectorAll(':scope > div').forEach((s) => {
    if (!s.children.length && !textOf(s) && !emptyBefore.has(s)) s.remove();
  });
  if (back) back();
  return {
    stats, ids, hand, changed,
  };
}

/**
 * A document's HTML collapsed: a .plain.html (main's content) or a whole page (<main> inside).
 * @param {string} html
 * @param {{path?: string, brand?: string, parse: (html: string) => {document: Document}}} opts
 */
export function collapseHtml(html, opts) {
  const whole = /<main[\s>]/i.test(html);
  const { document } = opts.parse(whole ? html : `<html><head></head><body><main>${html}</main></body></html>`);
  const main = document.querySelector('main');
  const result = collapseMain(main, { ...opts, document });
  // nothing to collapse: the document as it came (no re-serialisation)
  if (!result.changed) return { html, ...result };
  // attribute values with "&" as the documents write them ("&amp;"; linkedom leaves a bare "&")
  const out = (whole ? document.documentElement.outerHTML : main.innerHTML)
    .replace(/(\s[\w:-]+=")([^"]*)"/g, (m, k, v) => `${k}${v.replace(/&(?![a-zA-Z][a-zA-Z0-9]*;|#\d+;|#x[0-9a-fA-F]+;)/g, '&amp;')}"`);
  return { html: out, ...result };
}
