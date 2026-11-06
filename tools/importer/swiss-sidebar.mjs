/* eslint-disable max-len, import/extensions, import/prefer-default-export -- tooling */
/* eslint-disable import/no-extraneous-dependencies -- linkedom: a dev dependency */
/**
 * SWISS's info pages with www's sidebar component (www.swiss.com's airem-sidebar: sidebar-content
 * beside sidebar-aside, 75 / 25 from 768px; swiss-parity-002). lh-com's import writes the component
 * flattened into the page's section: the content, then whatever the aside holds (teasers, images,
 * texts, link lists), one after the other at the full width. This step makes it www's, guided by
 * the page's snapshot: per sidebar, the content (from its first heading, else its first text, to the aside, or to its
 * last text when the aside is empty) a section of its own, then the aside a section with the
 * section style sidebar-aside (shown beside the content: scripts/section-aside.js; an empty aside
 * still keeps the content in www's 3 / 4 column); the aside's teaser cards a cards-teaser block (a
 * row per card: its picture | its title, text and link). Anywhere on the page, an image | text view whose
 * document form is clean (the picture right next to its text) becomes a columns-media row (picture |
 * text, or text | picture as the snapshot has it); a heading above the view stays above it. A tab the
 * import left empty gets the section after it as its panel. A sidebar the document does not show
 * in that order is left as it is (listed in the result). A document this step made already stays.
 */
import { parseHTML } from 'linkedom';

const norm = (t) => (t || '').replace(/[\u00AD\u200B-\u200D\uFEFF]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
const textOf = (el) => norm(el.textContent);
const isPicture = (el) => el && el.tagName === 'P' && el.querySelector('picture') && !norm(el.textContent);
const isHeading = (el) => el && /^H[1-6]$/.test(el.tagName);
const isBlock = (el) => el && el.tagName === 'DIV' && el.className;

// www's words for screen readers only (not in the documents)
const SR_ONLY = '.sr-only, .visually-hidden, maui-screen-reader-label';

/** An element's text without the words for screen readers. */
function shownText(el) {
  if (!el.querySelector(SR_ONLY)) return norm(el.textContent);
  const copy = el.cloneNode(true);
  copy.querySelectorAll(SR_ONLY).forEach((x) => x.remove());
  return norm(copy.textContent);
}

/** The texts that identify a part of the snapshot, in order: headings, paragraphs, list items, link texts. */
function partTexts(part) {
  if (!part) return [];
  const out = [];
  part.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, maui-navigation-link, .teaser-link-text span, a').forEach((el) => {
    if (el.closest(`.d-none, [hidden], ${SR_ONLY}`)) return;
    if (el.tagName === 'A' && el.querySelector('h1, h2, h3, h4, p')) return;
    const t = shownText(el);
    if (t.length >= 4 && out[out.length - 1] !== t) out.push(t);
  });
  return out;
}

/** An aside's teaser cards: title, whether an image or a video tops it, its link text, its texts. */
function teasersOf(aside) {
  if (!aside) return [];
  return [...aside.querySelectorAll('.teaser.card')].map((c) => {
    const h = c.querySelector('.teaser-heading, h1, h2, h3, h4, h5, h6');
    const cta = c.querySelector('.teaser-link-text span:last-child, .teaser-link-text');
    return {
      title: h ? norm(h.textContent) : '', image: !!c.querySelector('.image-wrapper img'), video: !!c.querySelector('.video-player, iframe'), cta: cta ? norm(cta.textContent) : '', texts: partTexts(c),
    };
  }).filter((t) => t.title);
}

/** The images of a part after its last text (a picture under the aside's last heading). */
function trailingImages(part) {
  if (!part) return 0;
  const all = [...part.querySelectorAll('*')];
  const texts = 'h1, h2, h3, h4, h5, h6, p, li, a';
  let last = -1;
  all.forEach((el, i) => { if (el.matches(texts) && norm(el.textContent).length >= 4) last = i; });
  return all.filter((el, i) => i > last && el.tagName === 'IMG').length;
}

/** The snapshot's sidebars: their content's first heading and texts, the aside's texts and teaser cards. */
export function sidebarsOf(html) {
  const { document } = parseHTML(html);
  return [...document.querySelectorAll('.airem-sidebar')].map((s) => {
    const content = s.querySelector(':scope > .sidebar-content');
    const aside = s.querySelector(':scope > .sidebar-aside');
    const firstHead = content && content.querySelector('h1, h2, h3, h4');
    return {
      first: firstHead ? norm(firstHead.textContent) : '', byHeading: !!firstHead, content: partTexts(content), aside: partTexts(aside), teasers: teasersOf(aside), asideImagesAfter: trailingImages(aside),
    };
  });
}

const starts = (el, needle) => needle && textOf(el).startsWith(needle.slice(0, 60));
const contains = (el, needle) => needle && textOf(el).includes(needle.slice(0, 60));

/**
 * An image's file name as DA keeps it (www's …/Still006.jpeg.transform/…/img.jpg is DA's
 * …/still006.jpeg: lower case, dots and underscores dashes), without its extension.
 */
const slug = (name) => name.toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const fileOf = (src) => {
  if (!src) return '';
  const p = decodeURIComponent(new URL(src, 'https://www.swiss.com').pathname);
  const i = p.indexOf('.transform/');
  const path = i > 0 ? p.slice(0, i) : p;
  return path.includes('/content/dam/') ? slug(path.split('/').pop()) : '';
};
const hasFile = (el, file) => {
  const img = isPicture(el) && el.querySelector('img');
  return !!img && fileOf(img.getAttribute('src') || '') === file;
};

const firstLast = (texts) => ({ first: texts[0], last: texts[texts.length - 1] });

/** Where an item's image is: above its texts ('before'), under them ('after'), or none. */
function imageAt(item) {
  const all = [...item.querySelectorAll('*')];
  const im = all.findIndex((el) => el.tagName === 'IMG');
  if (im < 0) return null;
  const tx = all.findIndex((el) => el.matches('h1, h2, h3, h4, h5, h6, p, li, a, maui-navigation-link') && norm(el.textContent).length >= 4);
  return tx < 0 || im < tx ? 'before' : 'after';
}

/**
 * The snapshot's image | text views (www's twocolumn column views with an image item and a text
 * item; not the teaser rows, not in a sidebar's aside), in page order: whether the image comes
 * first, the text item's first and last text; its image | image views: each item's files (pair); its
 * views of text items (two, three or four columns): each item's first and last text and image (cols).
 */
export function twoColumnsOf(html) {
  const { document } = parseHTML(html);
  const img = (i) => !!i.querySelector('.image img, .dcep-moving-image, img');
  const txt = (i) => partTexts(i).length > 0;
  const views = '.twocolumn, .threecolumn, .fourcolumn';
  return [...document.querySelectorAll(views)].map((c) => {
    if (c.closest('.sidebar-aside') || c.querySelector(`.teaser, ${views}`)) return null;
    const items = [...c.querySelectorAll('.column-view-item')];
    // items that all hold text (www's steps, text columns): each item's texts and where its image is
    if (items.length >= 2 && !c.querySelector('.accordion') && items.every(txt)) {
      return { cols: items.map((i) => ({ ...firstLast(partTexts(i)), image: imageAt(i) })) };
    }
    if (!c.classList.contains('twocolumn') || items.length !== 2) return null;
    // images side by side (an item's images one under the other): each item's files
    if (items.every((i) => img(i) && !txt(i))) {
      const cols = items.map((i) => [...i.querySelectorAll('img')].map((m) => fileOf(m.getAttribute('src'))));
      return cols.every((col) => col.length && col.every(Boolean)) ? { pair: cols } : null;
    }
    const imageFirst = img(items[0]) && !txt(items[0]) && txt(items[1]);
    const imageSecond = img(items[1]) && !txt(items[1]) && txt(items[0]);
    if (!imageFirst && !imageSecond) return null;
    const texts = partTexts(items[imageFirst ? 1 : 0]);
    return { imageFirst, first: texts[0], last: texts[texts.length - 1] };
  }).filter(Boolean);
}

/**
 * A view of text items in the document (each item's picture, if www shows one above or under its
 * texts, then its texts; one item right after the other, in one section) as a columns-media row of
 * a cell per item. Returns the block, or null when the document does not show the view so.
 */
function textColumns(document, flat, from, cols) {
  const k = flat.findIndex((x, i) => i >= from && !isBlock(x.el) && !isPicture(x.el) && starts(x.el, cols[0].first));
  if (k < 0) return null;
  const { sec } = flat[k];
  const ok = (i) => flat[i] && flat[i].sec === sec;
  const cells = [];
  let at = cols[0].image === 'before' ? k - 1 : k;
  for (let j = 0; j < cols.length; j += 1) {
    const col = cols[j];
    const begin = at;
    if (col.image === 'before' && !(ok(at) && isPicture(flat[at].el))) return null;
    const t0 = col.image === 'before' ? at + 1 : at;
    if (!ok(t0) || isBlock(flat[t0].el) || !starts(flat[t0].el, col.first)) return null;
    let end = -1;
    for (let i = t0; ok(i) && i < t0 + 25; i += 1) {
      const { el } = flat[i];
      if (isBlock(el) || (i > t0 && isPicture(el))) break;
      if (i > t0 && cols[j + 1] && starts(el, cols[j + 1].first)) break;
      if (contains(el, col.last)) end = i;
    }
    if (end < 0) return null;
    if (col.image === 'after') {
      if (!(ok(end + 1) && isPicture(flat[end + 1].el))) return null;
      end += 1;
    }
    cells.push(flat.slice(begin, end + 1).map((x) => x.el));
    at = end + 1;
  }
  const block = document.createElement('div');
  block.className = 'columns-media';
  const row = document.createElement('div');
  cells[0][0].before(block);
  cells.forEach((els) => {
    const cell = document.createElement('div');
    cell.append(...els);
    row.append(cell);
  });
  block.append(row);
  return block;
}

/**
 * The image | text views in the document (flattened by the import: the picture, then the text,
 * or the text, then the picture) as columns-media rows; a heading above the view stays above it.
 * Only where the document has the picture right next to the text, in one section. An image | image
 * view: its pictures, one after the other in the document, a row of a picture cell per item (option
 * stacked when an item has several). A view of text items: textColumns.
 */
function withTwoColumns(document, main, views) {
  let rows = 0;
  let after = null;
  views.forEach((v) => {
    const flat = [...main.children].flatMap((sec) => [...sec.children].map((el) => ({ sec, el })));
    const from = after ? flat.findIndex((x) => x.el === after) + 1 : 0;
    if (v.cols) {
      const block = textColumns(document, flat, from, v.cols);
      if (block) {
        rows += 1;
        after = block;
      }
      return;
    }
    if (v.pair) {
      const files = v.pair.flat();
      const i = flat.findIndex((x, k) => k >= from && files.every((f, j) => flat[k + j] && flat[k + j].sec === x.sec && hasFile(flat[k + j].el, f)));
      if (i < 0) return;
      const block = document.createElement('div');
      block.className = v.pair.some((c) => c.length > 1) ? 'columns-media stacked' : 'columns-media';
      const row = document.createElement('div');
      flat[i].el.before(block);
      let k = i;
      v.pair.forEach((col) => {
        const cell = document.createElement('div');
        col.forEach(() => {
          cell.append(flat[k].el.querySelector('picture'));
          flat[k].el.remove();
          k += 1;
        });
        row.append(cell);
      });
      block.append(row);
      rows += 1;
      after = block;
      return;
    }
    const t0 = flat.findIndex((x, i) => i >= from && !isBlock(x.el) && !isPicture(x.el) && starts(x.el, v.first));
    if (t0 < 0) return;
    let t1 = -1;
    for (let i = t0; i < Math.min(flat.length, t0 + 15) && flat[i].sec === flat[t0].sec; i += 1) {
      if (isBlock(flat[i].el) || (i > t0 && isPicture(flat[i].el))) break;
      if (contains(flat[i].el, v.last)) t1 = i;
    }
    if (t1 < 0) return;
    const pic = flat[v.imageFirst ? t0 - 1 : t1 + 1];
    if (!pic || pic.sec !== flat[t0].sec || !isPicture(pic.el)) return;
    const block = document.createElement('div');
    block.className = 'columns-media';
    const row = document.createElement('div');
    const media = document.createElement('div');
    const text = document.createElement('div');
    (v.imageFirst ? pic.el : flat[t0].el).before(block);
    media.append(pic.el.querySelector('picture'));
    pic.el.remove();
    flat.slice(t0, t1 + 1).forEach((x) => text.append(x.el));
    row.append(...(v.imageFirst ? [media, text] : [text, media]));
    block.append(row);
    rows += 1;
    after = block;
  });
  return rows;
}

const headingText = (el) => textOf(el).replace(/\s*\{[a-z0-9 -]+\}$/, '');

/** The element's links replaced by their content (the card is the link on www). */
function unlink(el) {
  el.querySelectorAll('a').forEach((a) => a.replaceWith(...a.childNodes));
}

/**
 * The aside's teaser cards (the document has each as its picture, the title, the text and the link
 * text, one after the other) as cards-teaser rows: the picture | the title, the text and the link.
 * Cards next to each other share a block. The title and the text lose the card's link when the
 * card has a link of its own; a card the document does not show so stays as it is.
 */
function withAsideTeasers(document, section, teasers) {
  let block = null;
  let from = 0;
  teasers.forEach((t) => {
    const kids = [...section.children];
    const h = kids.findIndex((el, i) => i >= from && isHeading(el) && headingText(el) === t.title);
    if (h < 0) return;
    const s = t.image && h - 1 >= from && isPicture(kids[h - 1]) ? h - 1 : h;
    const ofCard = (el) => el && el.tagName === 'P' && !isPicture(el) && t.texts.some((x) => textOf(el).startsWith(x.slice(0, 60)) || x.startsWith(textOf(el).slice(0, 60)));
    let e = h;
    while (ofCard(kids[e + 1])) e += 1;
    const row = document.createElement('div');
    const media = document.createElement('div');
    const body = document.createElement('div');
    if (s < h) {
      media.append(kids[s].querySelector('picture'));
      kids[s].remove();
    }
    const parts = kids.slice(h, e + 1);
    const cta = parts.length > 1 && t.cta && textOf(parts[parts.length - 1]) === t.cta ? parts[parts.length - 1] : null;
    if (cta) parts.filter((el) => el !== cta).forEach(unlink);
    else parts.slice(1).forEach(unlink);
    if (!block || block.nextElementSibling !== kids[h]) {
      block = document.createElement('div');
      block.className = 'cards-teaser';
      kids[h].before(block);
    }
    body.append(...parts);
    row.append(media, body);
    block.append(row);
    from = [...section.children].indexOf(block) + 1;
  });
}

const metaRows = (sec) => [...sec.querySelectorAll(':scope > .section-metadata > div')];
const isTabRow = (r) => /^tabs?$/i.test((r.firstElementChild || { textContent: '' }).textContent.trim());

/**
 * A tab whose section the import left empty (its metadata only) and its content in the next section
 * (animals travelling: then a "flush, grey" section): the tab's rows go to that section's metadata,
 * so the panel holds the content. Returns how many.
 */
function joinEmptyTabs(document, main) {
  let joined = 0;
  [...main.children].forEach((sec) => {
    const next = sec.nextElementSibling;
    const rows = metaRows(sec);
    if (!next || !rows.some(isTabRow) || [...sec.children].some((c) => !c.classList.contains('section-metadata'))) return;
    if (metaRows(next).some(isTabRow) || ![...next.children].some((c) => !c.classList.contains('section-metadata'))) return;
    let meta = next.querySelector(':scope > .section-metadata');
    if (!meta) {
      meta = document.createElement('div');
      meta.className = 'section-metadata';
      next.append(meta);
    }
    meta.append(...rows.filter(isTabRow));
    sec.remove();
    joined += 1;
  });
  return joined;
}

/**
 * @param {string} doc a document (<body><header></header><main>…</main>…) or its sections (.plain.html)
 * @param {string} html the page's snapshot
 * @returns {{doc: string, made: number, rows: number, skipped: string[]}} made: the sidebars, rows: the views
 */
export function withSwissSidebar(doc, html) {
  const skipped = [];
  if (/<div>sidebar-aside<\/div>/.test(doc)) {
    return {
      doc, made: 0, rows: 0, skipped,
    };
  }
  // a whole document (<main>…</main>) or the import's .plain.html (the sections only)
  const isPlain = !/<main>/.test(doc);
  const inner = isPlain ? doc : doc.match(/<main>([\s\S]*)<\/main>/)[1];
  const sidebars = sidebarsOf(html);
  const { document } = parseHTML(`<!DOCTYPE html><html><body><main>${inner}</main></body></html>`);
  const main = document.querySelector('main');
  const joined = joinEmptyTabs(document, main);
  let made = 0;
  let from = { section: main.firstElementChild, index: 0 };
  sidebars.forEach((sb, n) => {
    // the content's first heading, else its first text (a sidebar whose content has no heading)
    const first = sb.first || sb.content[0];
    if (!first) { skipped.push(`sidebar ${n}: no text in its content`); return; }
    const isStart = (el) => (sb.byHeading ? isHeading(el) && starts(el, first) : starts(el, first));
    // the section holding the content's first heading, at or after the previous sidebar
    let { section } = from;
    let start = -1;
    const fromSection = from.section;
    const fromIndex = from.index;
    while (section) {
      const here = section;
      start = [...here.children].findIndex((el, i) => (here !== fromSection || i >= fromIndex) && isStart(el));
      if (start >= 0) break;
      section = section.nextElementSibling;
    }
    if (!section || start < 0) { skipped.push(`sidebar ${n}: "${first.slice(0, 40)}" not found`); return; }
    const kids = [...section.children];
    let end;
    let asideEnd;
    if (sb.aside.length) {
      const asideAt = kids.findIndex((el, i) => i > start && starts(el, sb.aside[0]));
      const last = sb.aside[sb.aside.length - 1];
      let lastAt = -1;
      kids.forEach((el, i) => { if (i >= asideAt && asideAt > 0 && contains(el, last)) lastAt = i; });
      if (asideAt < 0 || lastAt < asideAt) { skipped.push(`sidebar ${n}: its aside ("${sb.aside[0].slice(0, 30)}") not found after its content`); return; }
      // a picture right before the aside's first text belongs to it (a teaser's image)
      let a = asideAt;
      while (a - 1 > start && isPicture(kids[a - 1])) a -= 1;
      end = a - 1;
      asideEnd = lastAt;
      // the pictures www shows under the aside's last text stay with the aside
      for (let k = 0; k < sb.asideImagesAfter && isPicture(kids[asideEnd + 1]); k += 1) asideEnd += 1;
    } else {
      const last = sb.content[sb.content.length - 1];
      end = -1;
      kids.forEach((el, i) => { if (i >= start && contains(el, last)) end = i; });
      if (end < start) { skipped.push(`sidebar ${n}: the end of its content not found`); return; }
      asideEnd = end;
    }
    const meta = kids.filter((el) => el.classList && el.classList.contains('section-metadata'));
    // a tab panel (section metadata Tab): one section per panel, so what comes before the sidebar
    // stays in it and nothing may follow the sidebar in the panel
    const inTab = meta.some((m) => [...m.querySelectorAll(':scope > div > div:first-child')].some((c) => /^tab$/i.test(c.textContent.trim())));
    const before = inTab ? [] : kids.slice(0, start).filter((el) => !meta.includes(el));
    const content = kids.slice(inTab ? 0 : start, end + 1).filter((el) => !meta.includes(el));
    const aside = kids.slice(end + 1, asideEnd + 1).filter((el) => !meta.includes(el));
    const after = kids.slice(asideEnd + 1).filter((el) => !meta.includes(el));
    if (inTab && after.length) { skipped.push(`sidebar ${n}: in a tab with content after it`); return; }
    const part = (nodes, withMeta) => {
      const d = document.createElement('div');
      d.append(...nodes);
      if (withMeta) meta.forEach((m) => d.append(m.cloneNode(true)));
      return d;
    };
    const asideSection = part(aside, false);
    withAsideTeasers(document, asideSection, sb.teasers);
    const asideMeta = document.createElement('div');
    asideMeta.className = 'section-metadata';
    asideMeta.innerHTML = '<div><div>Style</div><div>sidebar-aside</div></div>';
    asideSection.append(asideMeta);
    const parts = [];
    if (before.length) parts.push(part(before, true));
    parts.push(part(content, true), asideSection);
    const afterSection = part(after, true);
    if (after.length) parts.push(afterSection);
    section.replaceWith(...parts);
    made += 1;
    from = after.length ? { section: afterSection, index: 0 } : { section: asideSection.nextElementSibling, index: 0 };
  });
  // the image | text views anywhere on the page (in the sidebars' content and outside them)
  const rows = withTwoColumns(document, main, twoColumnsOf(html));
  if (!made && !rows && !joined) {
    return {
      doc, made, rows, skipped,
    };
  }
  return {
    rows, doc: isPlain ? main.innerHTML : doc.replace(/<main>[\s\S]*<\/main>/, () => `<main>${main.innerHTML}</main>`), made, skipped,
  };
}
