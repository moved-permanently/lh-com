/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-media (text beside media). Sources:
 *  - ".twocolumn" column views (hub, campaign, insights, legal, app-entry, flight-status): one
 *    cell per ".column-view-item" of this column view (nested column views are flattened into
 *    their cell: app-badge image links, photo + QR code)
 *  - ".sidebar" (.airem-sidebar): ".sidebar-content" | ".sidebar-aside" (text or media each),
 *    option "sidebar" (75/25); jump links in the aside stay links ("#heading-id")
 *
 * Output (blocks/columns-media README): 2 columns, one row per text/media pair. A media cell
 * holds images (linked images keep their link), or a poster image plus a link to the .mp4
 * (link text = the source play button's aria-label). A text cell holds headings (source level;
 * AEM "copytext" headings are labels and become paragraphs), paragraphs (<br><br> split into
 * paragraphs), lists and links (primary maui-button-link = bold link, secondary = italic link).
 *
 * Column title (".column-view > div:not(.row) > h2") is default content before the table.
 * When several column views form one block (flight-status: 3 x .twocolumn in a .onecolumn) and
 * this instance has no own column title, its rows are appended to the previous Columns Media
 * table of the same variant, provided nothing but empty wrappers sits between the two.
 */
export default function parse(element, { document }) {
  const BLOCK_TAGS = /^(P|UL|OL|H[1-6]|TABLE|DIV|BLOCKQUOTE|PRE|DL)$/;
  const SKIP = '.sr-only, .visually-hidden, maui-screen-reader-label, [slot="box"], script, style, noscript';
  const SKIP_COMPONENTS = '.separator, .sr-only, .visually-hidden, maui-screen-reader-label, [slot="box"], .swiper-pagination, .swiper-button-prev, .swiper-button-next, .swiper-notification, .swiper-slide-duplicate, script, style, noscript';
  const MOBILE = '.hidden-lg-up, .hidden-md-up, .d-md-none, .d-lg-none';
  const DESKTOP = '.hidden-md-down, .hidden-sm-down, .d-none.d-md-block, .d-none.d-lg-block';
  const clean = (s) => (s || '').replace(/[​-‍﻿]/g, '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
  const visibleText = (node) => {
    if (!node) return '';
    const c = node.cloneNode(true);
    c.querySelectorAll(SKIP).forEach((n) => n.remove());
    return clean(c.textContent);
  };
  const isBroken = (src) => !src || /(^|\/)undefined(\.transform|$|\/)/.test(src) || /^(data|blob):/i.test(src);

  const isBr = (n) => n && n.nodeType === 1 && n.tagName === 'BR';
  const isBlank = (n) => n && n.nodeType === 3 && !clean(n.nodeValue);
  const trimBreaks = (el) => {
    while (el.lastChild && (isBr(el.lastChild) || isBlank(el.lastChild))) el.lastChild.remove();
    while (el.firstChild && (isBr(el.firstChild) || isBlank(el.firstChild))) el.firstChild.remove();
  };
  const tidy = (el) => {
    el.querySelectorAll(SKIP).forEach((s) => s.remove());
    el.querySelectorAll('em, i, span').forEach((s) => {
      if ([...s.classList].some((c) => /^lh(-|$)/.test(c)) && !clean(s.textContent) && !s.querySelector('img')) s.remove();
    });
    // text styles stay (the cleanup turns them into "{copytext-small}" markers)
    const keep = [...el.classList].filter((c) => /^(copytext-(small|medium|large)|footnote)$/.test(c));
    el.removeAttribute('class');
    if (keep.length) el.className = keep.join(' ');
    return el;
  };
  /** Splits a paragraph at runs of two or more <br>. */
  const splitParagraph = (p) => {
    const groups = [[]];
    const nodes = [...p.childNodes];
    for (let i = 0; i < nodes.length; i += 1) {
      if (isBr(nodes[i])) {
        let j = i + 1;
        while (j < nodes.length && isBlank(nodes[j])) j += 1;
        if (isBr(nodes[j])) {
          while (j < nodes.length && (isBr(nodes[j]) || isBlank(nodes[j]))) j += 1;
          groups.push([]);
          i = j - 1;
          continue;
        }
      }
      groups[groups.length - 1].push(nodes[i]);
    }
    return groups.map((g) => {
      const np = document.createElement('p');
      if (p.className) np.className = p.className;
      g.forEach((n) => np.append(n));
      trimBreaks(np);
      return np;
    }).filter((np) => clean(np.textContent) || np.querySelector('img'));
  };

  /** Block-level copies of a richtext container; loose inline runs are wrapped in <p>. */
  const richNodes = (scope) => {
    const rt = scope.querySelector('.richtext') || scope;
    const out = [];
    let run = null;
    const pushP = (p) => { tidy(p); out.push(...splitParagraph(p)); };
    const flush = () => { if (run) pushP(run); run = null; };
    [...rt.childNodes].forEach((n) => {
      if (n.nodeType === 8) return;
      if (n.nodeType === 1 && n.matches(SKIP)) return;
      if (n.nodeType === 1 && BLOCK_TAGS.test(n.tagName)) {
        flush();
        const c = n.cloneNode(true);
        if (c.tagName === 'P') { pushP(c); return; }
        tidy(c);
        if (clean(c.textContent) || c.querySelector('img')) out.push(c);
        return;
      }
      if (isBlank(n) && !run) return;
      if (!run) run = document.createElement('p');
      run.append(n.cloneNode(true));
    });
    flush();
    return out;
  };

  const MAUI = 'maui-navigation-link[href], maui-button-link[href], maui-link[href], a[href]';
  const linkPara = (scope) => {
    const m = scope.querySelector(MAUI);
    if (!m) return null;
    const label = visibleText(m) || clean(m.getAttribute('label') || m.getAttribute('aria-label'));
    const href = m.getAttribute('href');
    if (!label || !href) return null;
    const a = document.createElement('a');
    a.setAttribute('href', href);
    a.textContent = label;
    const p = document.createElement('p');
    // maui-button-link: primary = bold link (yellow button), secondary = italic link (outlined)
    const type = m.tagName === 'MAUI-BUTTON-LINK' ? m.getAttribute('type') : null;
    if (type === 'primary' || type === 'secondary') {
      const wrap = document.createElement(type === 'primary' ? 'strong' : 'em');
      wrap.append(a);
      p.append(wrap);
    } else {
      p.append(a);
    }
    return p;
  };

  // the Lufthansa size class (heading-medium, ...) of a rebuilt heading; the cleanup turns it
  // into a "{heading-medium}" marker when it differs from the level's size
  const keepHeadingStyle = (from, to) => {
    if (!from || !/^H[1-6]$/.test(to.tagName)) return;
    const style = [...from.classList].find((c) => /^heading-/.test(c));
    if (style) to.className = style;
  };

  const headingFrom = (scope) => {
    const h = scope.matches('h1, h2, h3, h4, h5, h6') ? scope : scope.querySelector('h1, h2, h3, h4, h5, h6');
    const text = visibleText(h || scope);
    if (!text) return null;
    // AEM styles some labels as headings with a copytext class; they read as body text
    const isLabel = h && /(^|\s)copytext/.test(h.getAttribute('class') || '');
    const out = document.createElement(h && !isLabel ? h.tagName.toLowerCase() : 'p');
    out.textContent = text;
    keepHeadingStyle(h, out);
    return out;
  };

  /**
   * Paragraph with the link to the .mp4 and, after it, the source's playback settings as a
   * marker ("{autoplay muted loop}", "{controls round-play-button}", blocks/columns-media README).
   */
  const videoPara = (src, label, settings) => {
    const a = document.createElement('a');
    a.setAttribute('href', src);
    a.textContent = label || src;
    const p = document.createElement('p');
    p.append(a);
    if (settings.length) p.append(` {${settings.join(' ')}}`);
    return p;
  };

  /** Video viewer (video.js: poster, round play button in the middle, controls). */
  const viewerNodes = (comp) => {
    const host = comp.querySelector('[data-dcep]');
    let cfg = {};
    try { cfg = JSON.parse(host.getAttribute('data-dcep')); } catch (e) { cfg = {}; }
    const video = comp.querySelector('video[src], video source[src]');
    const src = cfg.videoSrc || (video && video.getAttribute('src'));
    if (!src) return [];
    const out = [];
    const posterImg = comp.querySelector('.vjs-poster img[src]');
    const poster = cfg.thumbnailSrc || (posterImg && posterImg.getAttribute('src'));
    if (poster && !isBroken(poster)) {
      const img = document.createElement('img');
      img.setAttribute('src', poster);
      img.setAttribute('alt', clean(cfg.alternativeText));
      out.push(img);
    }
    const settings = [];
    if (cfg.autoplay === true || cfg.autoplay === 'true') settings.push('autoplay', 'muted');
    settings.push('controls', 'round-play-button');
    out.push(videoPara(src, clean(cfg.alternativeText), settings));
    return out;
  };

  /** Media of an AEM image component: [img] | [a > img] | [poster img, a(.mp4)]. */
  const mediaNodes = (comp) => {
    const out = [];
    const img = [...comp.querySelectorAll('img')].find((i) => !isBroken(i.getAttribute('src')) && !i.closest(SKIP_COMPONENTS));
    const video = comp.querySelector('video[src], video source[src]');
    let image = null;
    if (img) {
      image = document.createElement('img');
      image.setAttribute('src', img.getAttribute('src'));
      image.setAttribute('alt', img.getAttribute('alt') || '');
    }
    if (video) {
      const src = video.getAttribute('src');
      if (image) out.push(image);
      const button = comp.querySelector('[aria-label].moving-image-play-button, .on-image-button[aria-label], [role="button"][aria-label]');
      // moving image without play button: plays by itself, muted, without controls
      const settings = button ? [] : ['autoplay', 'muted'];
      if (!button && video.hasAttribute('loop')) settings.push('loop');
      if (video.hasAttribute('controls')) settings.push('controls');
      out.push(videoPara(src, clean(button && button.getAttribute('aria-label')), settings));
      return out;
    }
    if (!image) return out;
    const link = img.closest('a[href]');
    if (link && comp.contains(link)) {
      const a = document.createElement('a');
      a.setAttribute('href', link.getAttribute('href'));
      a.append(image);
      out.push(a);
    } else {
      out.push(image);
    }
    return out;
  };

  /** Content of a column, in document order, nested column views flattened. */
  const collect = (node, out) => {
    [...node.children].forEach((child) => {
      if (child.matches(SKIP_COMPONENTS)) return;
      if (child.matches(MOBILE) && child.parentElement && child.parentElement.querySelector(`:scope > :is(${DESKTOP})`)) return;
      const cl = child.classList;
      if (cl.contains('headline')) {
        const h = headingFrom(child);
        if (h) out.push(h);
      } else if (cl.contains('text') && child.querySelector('.richtext')) {
        out.push(...richNodes(child));
      } else if (cl.contains('link') && child.querySelector(MAUI)) {
        const p = linkPara(child);
        if (p) out.push(p);
      } else if (cl.contains('image') && child.querySelector('img, video')) {
        out.push(...mediaNodes(child));
      } else if (cl.contains('videoViewer')) {
        out.push(...viewerNodes(child));
      } else {
        collect(child, out);
      }
    });
    return out;
  };

  /** In a text cell, consecutive images / image links share one paragraph (badge rows). */
  const finishCell = (nodes) => {
    const inline = (n) => n.tagName === 'IMG' || n.tagName === 'A';
    if (nodes.every(inline) || !nodes.some(inline)) return nodes;
    const out = [];
    let p = null;
    nodes.forEach((n) => {
      if (inline(n)) {
        if (!p) { p = document.createElement('p'); out.push(p); }
        p.append(n);
      } else {
        p = null;
        out.push(n);
      }
    });
    return out;
  };

  // --- AirCore running text: an image floated beside the text that follows it
  // (<p><picture><img style="float: left; margin: 0 5rem 2rem 0" width="60%"></picture></p>):
  // image | text (float right: text | image), option ratio-NN from the image width
  const floated = element.matches('p') && element.querySelector('img[style*="float"]');
  if (floated) {
    const right = /float:\s*right/i.test(floated.getAttribute('style') || '');
    const pct = parseInt(floated.getAttribute('width') || '', 10);
    const media = [];
    if (!isBroken(floated.getAttribute('src'))) {
      const img = document.createElement('img');
      img.setAttribute('src', floated.getAttribute('src'));
      img.setAttribute('alt', floated.getAttribute('alt') || '');
      media.push(img);
    }
    // the paragraphs (also p.h3 titles, which sit beside the image) and lists up to the next
    // heading, empty paragraph or other component
    const isStop = (el) => !el || !/^(P|UL|OL)$/.test(el.tagName)
      || el.querySelector('img[style*="float"]')
      || (!clean(el.textContent) && !el.querySelector('img'));
    const text = [];
    for (let n = element.nextElementSibling; !isStop(n); n = element.nextElementSibling) {
      n.remove();
      // AirCore buttons (a.btn-primary / a.btn-secondary): bold / italic link as elsewhere
      n.querySelectorAll('a.btn-primary[href], a.btn-secondary[href]').forEach((a) => {
        if (a.closest('strong, em, b, i')) return;
        const wrap = document.createElement(a.classList.contains('btn-primary') ? 'strong' : 'em');
        a.replaceWith(wrap);
        wrap.append(a);
      });
      text.push(n);
    }
    if (!media.length || !text.length) {
      text.reverse().forEach((n) => element.after(n));
      return;
    }
    const floatBlock = WebImporter.Blocks.createBlock(document, {
      name: 'columns-media',
      variants: pct > 0 && pct < 100 ? [`ratio-${pct}`] : [],
      cells: [right ? [text, media] : [media, text]],
    });
    element.replaceWith(floatBlock);
    return;
  }

  // --- Insights category list (.blogoverview: the first page of the article list, alternating
  // text | image and image | text rows, image above the text on mobile: option media-first);
  // the search field, category filter and result count are interactive and not imported
  const articles = [...element.querySelectorAll('.blog-article-container')];
  if (element.classList.contains('blogoverview') && articles.length) {
    const rows = articles.map((art, i) => {
      const media = [];
      const img = [...art.querySelectorAll('.blog-article-image img')].find((x) => !isBroken(x.getAttribute('src')));
      if (img) {
        const image = document.createElement('img');
        image.setAttribute('src', img.getAttribute('src'));
        image.setAttribute('alt', img.getAttribute('alt') || '');
        const link = img.closest('a[href]');
        if (link) {
          const a = document.createElement('a');
          a.setAttribute('href', link.getAttribute('href'));
          a.append(image);
          media.push(a);
        } else media.push(image);
      }
      const text = [];
      const tags = [...art.querySelectorAll('maui-chip[label]')].map((c) => clean(c.getAttribute('label'))).filter(Boolean);
      if (tags.length) {
        // the article's tag chips: a list before the title (rendered as chips)
        const ul = document.createElement('ul');
        tags.forEach((t) => { const li = document.createElement('li'); li.textContent = t; ul.append(li); });
        text.push(ul);
      }
      const title = art.querySelector('.article-title');
      if (title && visibleText(title)) {
        const h = document.createElement('h2');
        h.className = 'heading-small';
        const titleLink = title.closest('a[href]');
        if (titleLink) {
          const a = document.createElement('a');
          a.setAttribute('href', titleLink.getAttribute('href'));
          a.textContent = visibleText(title);
          h.append(a);
        } else h.textContent = visibleText(title);
        text.push(h);
      }
      const info = [...art.querySelectorAll('.blog-article-details-info > div')].map(visibleText).filter((t) => t && t !== '|');
      if (info.length) {
        const p = document.createElement('p');
        const b = document.createElement('strong');
        b.textContent = info.join(' | ');
        p.append(b);
        text.push(p);
      }
      // the teaser text: 16px
      art.querySelectorAll('.blog-article-details > p').forEach((p) => {
        if (!visibleText(p)) return;
        const desc = tidy(p.cloneNode(true));
        desc.className = 'copytext-medium';
        text.push(desc);
      });
      const more = art.querySelector('.blog-article-details-link');
      const moreP = more && linkPara(more);
      if (moreP) text.push(moreP);
      if (!text.length) return null;
      if (!media.length) return [text];
      return i % 2 === 0 ? [text, media] : [media, text];
    }).filter(Boolean);
    if (!rows.length) return;
    element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'columns-media', variants: ['media-first'], cells: rows }));
    return;
  }

  // --- cells
  const titles = [];
  const cells = [];
  let variants = [];
  if (element.classList.contains('sidebar') || element.querySelector(':scope > .airem-sidebar')) {
    // .airem-sidebar: .sidebar-content 75% | .sidebar-aside 25%, whatever each holds
    variants = ['sidebar'];
    const media = element.querySelector('.sidebar-content');
    const text = element.querySelector('.sidebar-aside');
    const row = [media ? finishCell(collect(media, [])) : [], text ? finishCell(collect(text, [])) : []];
    if (row.some((c) => c.length)) cells.push(row.map((c) => (c.length ? c : '')));
  } else {
    const view = element.querySelector(':scope > .column-view') || element.querySelector('.column-view') || element;
    [...view.children].filter((d) => !d.classList.contains('row') && !d.classList.contains('carousel')).forEach((d) => {
      d.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
        const t = visibleText(h);
        if (!t) return;
        const out = document.createElement(h.tagName.toLowerCase());
        out.textContent = t;
        keepHeadingStyle(h, out);
        titles.push(out);
      });
    });
    const items = [...view.querySelectorAll('.column-view-item')]
      .filter((it) => it.closest('.column-view') === view && !it.closest(MOBILE));
    const row = items.map((it) => finishCell(collect(it, []))).filter((c) => c.length);
    if (row.length) cells.push(row);
    // an image column view with carousel behaviour in a column (app teaser: photo + QR code):
    // a slider with dots below 1025px (option slider)
    const sliderView = items.some((it) => [...it.querySelectorAll('.column-view > .carousel')]
      .some((c) => c.querySelectorAll('.hidden-md-down .image img').length > 1));
    if (sliderView) variants.push('slider');
  }

  // nothing to show (empty column view): left as it is, the cleanup drops empty components
  if (!cells.length && !titles.length) return;

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-media', variants, cells });

  // --- merge into the previous Columns Media table when this is its continuation
  const headerText = (t) => clean((t.querySelector('tr') || t).textContent).toLowerCase();
  const previousSameBlock = () => {
    const name = headerText(block);
    const before = [...document.querySelectorAll('table')].filter((t) => !element.contains(t)
      && (t.compareDocumentPosition(element) & 4) && headerText(t) === name);
    const prev = before[before.length - 1];
    if (!prev) return null;
    const range = document.createRange();
    range.setStartAfter(prev);
    range.setEndBefore(element);
    const between = range.cloneContents();
    if (clean(between.textContent)) return null;
    if (between.querySelector('img, picture, video, iframe, hr, table, h1, h2, h3, h4, h5, h6, form, input')) return null;
    return prev;
  };
  if (!titles.length && cells.length) {
    const prev = previousSameBlock();
    if (prev) {
      const rows = [...block.querySelectorAll('tr')].slice(1);
      const lastRow = [...prev.querySelectorAll('tr')].pop();
      rows.forEach((r) => lastRow.parentNode.append(r));
      element.remove();
      return;
    }
  }

  element.replaceWith(...titles, block);
}
