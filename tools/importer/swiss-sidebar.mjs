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
 * still keeps the content in www's 3 / 4 column). Anywhere on the page, an image | text view whose
 * document form is clean (the picture right next to its text) becomes a columns-media row (picture |
 * text, or text | picture as the snapshot has it); a heading above the view stays above it. A sidebar the document does not show
 * in that order is left as it is (listed in the result). A document this step made already stays.
 */
import { parseHTML } from 'linkedom';

const norm = (t) => (t || '').replace(/[\u00AD\u200B-\u200D\uFEFF]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
const textOf = (el) => norm(el.textContent);
const isPicture = (el) => el && el.tagName === 'P' && el.querySelector('picture') && !norm(el.textContent);
const isHeading = (el) => el && /^H[1-6]$/.test(el.tagName);
const isBlock = (el) => el && el.tagName === 'DIV' && el.className;

/** The texts that identify a part of the snapshot, in order: headings, paragraphs, list items, link texts. */
function partTexts(part) {
  if (!part) return [];
  const out = [];
  part.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, maui-navigation-link, .teaser-link-text span, a').forEach((el) => {
    if (el.closest('.d-none, [hidden], .sr-only, .visually-hidden')) return;
    if (el.tagName === 'A' && el.querySelector('h1, h2, h3, h4, p')) return;
    const t = norm(el.textContent);
    if (t.length >= 4 && out[out.length - 1] !== t) out.push(t);
  });
  return out;
}

/** The snapshot's sidebars: their content's first heading and texts, the aside's texts, the two-column views. */
export function sidebarsOf(html) {
  const { document } = parseHTML(html);
  return [...document.querySelectorAll('.airem-sidebar')].map((s) => {
    const content = s.querySelector(':scope > .sidebar-content');
    const aside = s.querySelector(':scope > .sidebar-aside');
    const firstHead = content && content.querySelector('h1, h2, h3, h4');
    return {
      first: firstHead ? norm(firstHead.textContent) : '', byHeading: !!firstHead, content: partTexts(content), aside: partTexts(aside),
    };
  });
}

const starts = (el, needle) => needle && textOf(el).startsWith(needle.slice(0, 60));
const contains = (el, needle) => needle && textOf(el).includes(needle.slice(0, 60));

/**
 * The snapshot's image | text views (www's twocolumn column views with an image item and a text
 * item; not the teaser rows, not in a sidebar's aside), in page order: whether the image comes
 * first, the text item's first and last text.
 */
export function twoColumnsOf(html) {
  const { document } = parseHTML(html);
  const img = (i) => !!i.querySelector('.image img, .dcep-moving-image, img');
  const txt = (i) => partTexts(i).length > 0;
  return [...document.querySelectorAll('.twocolumn')].map((c) => {
    if (c.closest('.sidebar-aside') || c.querySelector('.teaser, .twocolumn')) return null;
    const items = [...c.querySelectorAll('.column-view-item')];
    if (items.length !== 2) return null;
    const imageFirst = img(items[0]) && !txt(items[0]) && txt(items[1]);
    const imageSecond = img(items[1]) && !txt(items[1]) && txt(items[0]);
    if (!imageFirst && !imageSecond) return null;
    const texts = partTexts(items[imageFirst ? 1 : 0]);
    return { imageFirst, first: texts[0], last: texts[texts.length - 1] };
  }).filter(Boolean);
}

/**
 * The image | text views in the document (flattened by the import: the picture, then the text,
 * or the text, then the picture) as columns-media rows; a heading above the view stays above it.
 * Only where the document has the picture right next to the text, in one section.
 */
function withTwoColumns(document, main, views) {
  let rows = 0;
  let after = null;
  views.forEach((v) => {
    const flat = [...main.children].flatMap((sec) => [...sec.children].map((el) => ({ sec, el })));
    const from = after ? flat.findIndex((x) => x.el === after) + 1 : 0;
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
      // a teaser's picture right after its last text (image under the text) stays with the aside
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
  if (!made && !rows) {
    return {
      doc, made, rows, skipped,
    };
  }
  return {
    rows, doc: isPlain ? main.innerHTML : doc.replace(/<main>[\s\S]*<\/main>/, () => `<main>${main.innerHTML}</main>`), made, skipped,
  };
}
