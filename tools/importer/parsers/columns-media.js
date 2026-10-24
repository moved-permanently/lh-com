/* eslint-disable */
/* global WebImporter */
import { embedNodes } from './media-nodes.js';

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
 * (link text = the source play button's aria-label; a moving image always {autoplay muted loop},
 * whatever its play toggle). A text cell holds headings (source level;
 * AEM "copytext" headings are labels and become paragraphs), paragraphs (<br><br> split into
 * paragraphs), lists and links (primary maui-button-link = bold link, secondary = italic link).
 *
 * A teaser without a target in a column (a.teaser:not([href]), legal
 * sitzplatzreservierungen-konditionen) gives its heading with the icon inside and its description
 * (copytext-medium); its .teaser-link-text is dropped.
 *
 * Column title (".column-view > div:not(.row) > h2") is default content before the table.
 * Insights articles (.article-details-page): an image's caption (figcaption > maui-caption) follows
 * it as "<p>… {caption}</p>"; a column item with several image components (live: stacked in
 * their column) gives option stacked (picture-perfect-austin galleries; outside articles too,
 * see cell-slider below). Other templates keep dropping captions; images of a nested column view
 * stay side by side (photo + QR code, 100-years, fleet cabins).
 *
 * Option cell-slider: a column view whose own items have carousel behaviour
 * (.column-view > .carousel) and are media | text: below 1025px the cells are slides
 * (/onboard-delights Dallmayr band). Option stacked also outside articles when an item holds
 * several image components (not with option slider).
 *
 * Option nested-N: a three- or four-column view whose items hold an N-column view of images only
 * (shopping icons, app badges); empty items are kept as empty cells. So are the empty items next
 * to an image that is alone in its column view (/100-years/cabin-design year numbers: the image
 * takes its column only, as live).
 *
 * Option padded on a sidebar: the sidebar is the only content of a one-column view of its own
 * in an AEM section (100-years); with before-padded when that view ends its AEM section and the
 * next AEM section is padded and not grey.
 *
 * Option padded: the column view is a component of its own in an AEM section
 * (.section-content > .column > .column-view:only-child, live padding 3.2rem top and bottom), has
 * no column title, is not grey and not in an article; nested column views (flight-status) do not
 * get it. Column views the cleanup marked (data-lh-column, info: titled, outside an AEM section,
 * nested in a one-column view) keep the mark on an element around the title and the block; the
 * cleanup turns it into column-start / column-end markers.
 *
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
  const ARTICLE = !!element.closest('.article-details-page');
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
    const keep = [...el.classList].filter((c) => /^(copytext-(small|medium|large)|footnote|limited-width)$/.test(c));
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
    // .richtext.limited-width: 66% of its column from 1025px on live (the cleanup writes the
    // "{limited-width}" marker; /de/de/additional-services intro)
    if (rt.classList && rt.classList.contains('limited-width')) {
      out.forEach((n) => { if (/^(P|UL|OL)$/.test(n.tagName)) n.classList.add('limited-width'); });
    }
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
    const src = clean(cfg.videoSrc || (video && video.getAttribute('src')));
    if (!src) return [];
    const out = [];
    const posterImg = comp.querySelector('.vjs-poster img[src]');
    const poster = clean(cfg.thumbnailSrc || (posterImg && posterImg.getAttribute('src')));
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

  /** Article image caption: "<p>text {caption}</p>" (the cleanup's marker for figcaptions). */
  const captionPara = (comp) => {
    if (!ARTICLE) return null;
    const fc = comp.querySelector('figcaption');
    const text = fc && visibleText(fc.querySelector('maui-caption') || fc);
    if (!text) return null;
    const p = document.createElement('p');
    p.textContent = `${text} {caption}`;
    return p;
  };

  /** Media of an AEM image component: [img] | [a > img] | [poster img, a(.mp4)], then the caption. */
  const mediaNodes = (comp) => {
    const out = mediaOnly(comp);
    const caption = out.length && captionPara(comp);
    if (caption) out.push(caption);
    return out;
  };

  const mediaOnly = (comp) => {
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
      // a moving image (.dcep-moving-image) always plays by itself on live, muted and looped;
      // newer snapshots show a play/pause toggle on the same component with the same config
      // (at/de/100-years waving flag), so the toggle is ignored there
      const moving = !!video.closest('.dcep-moving-image');
      const button = !moving && comp.querySelector('[aria-label].moving-image-play-button, .on-image-button[aria-label], [role="button"][aria-label]');
      // moving image without play button: plays by itself, muted, without controls
      const settings = button ? [] : ['autoplay', 'muted'];
      if (!button && (moving || video.hasAttribute('loop'))) settings.push('loop');
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

  /**
   * A teaser without a target (a.teaser:not([href]), Lufthansa "partner" tile: the
   * sitzplatzreservierungen-konditionen topics): h3.teaser-heading (img.icon-svg +
   * .teaser-heading-text) and .teaser-description p.desc-inline (16px). The heading keeps its
   * level and the icon as an image inside it ("<h3><img>REFUND</h3>", block CSS: 48px icon left of
   * the title and the text); the decorative .teaser-link-text (display: none on live) is dropped.
   */
  const teaserNodes = (teaser) => {
    const out = [];
    const h = teaser.querySelector('.teaser-heading') || teaser.querySelector('h1, h2, h3, h4, h5, h6');
    const title = h && visibleText(h.querySelector('.teaser-heading-text') || h);
    const icon = h && [...h.querySelectorAll('img')].find((i) => !isBroken(i.getAttribute('src')));
    if (title) {
      const heading = document.createElement(/^H[1-6]$/.test(h.tagName) ? h.tagName.toLowerCase() : 'h3');
      if (icon) {
        const img = document.createElement('img');
        img.setAttribute('src', icon.getAttribute('src'));
        img.setAttribute('alt', icon.getAttribute('alt') || '');
        heading.append(img);
      }
      heading.append(title);
      keepHeadingStyle(h, heading);
      out.push(heading);
    }
    const desc = teaser.querySelector('.teaser-description');
    if (desc) {
      const paras = [...desc.querySelectorAll('p')].filter((d) => visibleText(d));
      const nodes = paras.flatMap((d) => splitParagraph(tidy(d.cloneNode(true))));
      if (!nodes.length && visibleText(desc)) {
        nodes.push(document.createElement('p'));
        nodes[0].textContent = visibleText(desc);
      }
      // .desc-inline: LufthansaText 1.6rem / 150% ("{copytext-medium}")
      nodes.forEach((d) => { d.className = 'copytext-medium'; out.push(d); });
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
      } else if (child.parentElement.classList.contains('column-view') && !child.matches('.row, .carousel')
        && child.querySelector('h1, h2, h3, h4, h5, h6')) {
        // the title of a column view nested in the column (de/en green-fare "Book more
        // sustainably": .twocolumn item > .onecolumn > .column-view > div > h4) stays in the cell
        child.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((t) => {
          const h = headingFrom(t);
          if (h) out.push(h);
        });
      } else if (child.matches('a.teaser:not([href])')) {
        out.push(...teaserNodes(child));
      } else if (cl.contains('videoViewer')) {
        out.push(...viewerNodes(child));
      } else if ((cl.contains('video') && child.querySelector(':scope > .video-player iframe'))
        || (cl.contains('iframe') && child.querySelector(':scope > .iframe-wrapper iframe'))) {
        // YouTube player / in-flight entertainment widget: a paragraph with the link (the block
        // shows the player, scripts/media.js)
        embedNodes(child, document).forEach((n) => { n.setAttribute('data-lh-embed', ''); out.push(n); });
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

  // --- a video outside column views (video viewer or moving image in default content, in tabs
  // or in a one-column view): one media cell over the full width, settings as in a column.
  // Videos of components that other parsers import (stage, carousels, accordions, mapped
  // column views) are left to them: those are detached or inside their table by now.
  if (element.matches('.videoViewer, .image')) {
    if (!element.isConnected || !element.parentElement
      || element.parentElement.closest('table, .inspirationteaser, .stage, .carousel, .slideshow, .accordion, .teaser')) return;
    const media = element.classList.contains('videoViewer') ? viewerNodes(element) : mediaNodes(element);
    if (!media.some((n) => n.tagName === 'P')) return;
    element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'columns-media', cells: [[media]] }));
    return;
  }

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
    // a sidebar that is the only content of a one-column view of its own in an AEM section
    // (.section-content > .onecolumn.column > .column-view:only-child > .row > one item, 100-years
    // "Under the symbol of the crane") has the column view's 3.2rem above and below: option padded;
    // before-padded when that one-column view ends its AEM section and the next AEM section is
    // padded (.section-padding-y-regular) and not grey: its top padding follows (block CSS). Not
    // in grey, in an article or when the cleanup marked the column view (data-lh-column, info).
    const item = element.parentElement;
    const sideView = item && item.classList.contains('column-view-item') && item.children.length === 1
      && item.parentElement && item.parentElement.classList.contains('row')
      && item.parentElement.children.length === 1 && item.parentElement.parentElement;
    const oneColumn = sideView && sideView.classList.contains('column-view') && sideView.parentElement;
    const ownSidebar = !!oneColumn && oneColumn.matches('.onecolumn.column') && oneColumn.children.length === 1
      && !!oneColumn.parentElement && oneColumn.parentElement.classList.contains('section-content')
      && !oneColumn.hasAttribute('data-lh-column') && !ARTICLE && !element.closest('.container-gray');
    if (ownSidebar) {
      variants.push('padded');
      const meaningful = (el) => !!clean(el.textContent) || !!el.querySelector('img, picture, video, iframe');
      const isLast = [...oneColumn.parentElement.children].filter(meaningful).pop() === oneColumn;
      const aem = oneColumn.closest('.container-content > .section');
      let next = aem && aem.nextElementSibling;
      while (next && !(next.classList.contains('section') && meaningful(next))) next = next.nextElementSibling;
      if (isLast && next && next.querySelector(':scope > div > .section-padding-y-regular')
        && !next.querySelector(':scope > .container-gray')) variants.push('before-padded');
    }
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
    const collected = items.map((it) => finishCell(collect(it, [])));
    // a YouTube player in one column of a column view whose other column is empty keeps the
    // empty column (live: the player takes its column only, /lufthansa-business-class-on-long-haul-routes)
    const hasEmbed = collected.some((c) => c.some((n) => n.matches && n.matches('p[data-lh-embed]')));
    // a three- or four-column view whose items hold an N-column view of images only (icons in
    // the first quarter of a four-column item, /de/en/shopping; app badges in a two-column item,
    // /de/en/passengers-with-sensory-impairment): option nested-N sizes those images as one
    // nested column; empty items keep their column as on live
    const NESTED = ['twocolumn', 'threecolumn', 'fourcolumn'];
    const nestedView = element.matches('.threecolumn, .fourcolumn') && items.map((it) => [...it.children]
      .find((c) => NESTED.some((k) => c.classList.contains(k)) && c.querySelector('.image img')
        && !c.querySelector('.text, .headline, .link, .teaser'))).find(Boolean);
    if (nestedView) variants.push(`nested-${NESTED.findIndex((k) => nestedView.classList.contains(k)) + 2}`);
    // an image alone in one column whose other columns are empty keeps its column too (live
    // .col-md-6.col-lg: half the width from 768px, the full width below; /100-years/cabin-design
    // year numbers "1920s – 1930s" 608px wide at 1440, /100-years/campaigns big numbers)
    const filled = collected.filter((c) => c.length);
    const isImage = (n) => n.nodeType === 1 && !clean(n.textContent)
      && (n.matches('img, picture') || !!n.querySelector('img, picture')) && !n.querySelector('video, iframe');
    const loneImage = items.length > 1 && filled.length === 1 && filled[0].every(isImage);
    const row = (hasEmbed || nestedView || loneImage) && filled.length ? collected.map((c) => (c.length ? c : ''))
      : filled;
    if (row.length) cells.push(row);
    // an image column view with carousel behaviour in a column (app teaser: photo + QR code):
    // a slider with dots below 1025px (option slider)
    const sliderView = items.some((it) => [...it.querySelectorAll('.column-view > .carousel')]
      .some((c) => c.querySelectorAll('.hidden-md-down .image img').length > 1));
    if (sliderView) variants.push('slider');
    // several image components in one column item are stacked on live (article galleries;
    // /onboard-delights dean&david: two images one under the other beside the text); not in a
    // column view with carousel behaviour (photo + QR code side by side, option slider)
    const stacked = (ARTICLE || !sliderView) && items.some((it) => [...it.querySelectorAll('.image')]
      .filter((img) => img.closest('.column-view-item') === it && !img.parentElement.closest('.image')
        && img.querySelector('img, video')).length > 1);
    if (stacked) variants.push('stacked');
    // a column view whose own items have carousel behaviour (.column-view > .carousel: the
    // .hidden-md-down grid from 1025px, a .hidden-lg-up swiper below) with media | text items
    // (/onboard-delights Dallmayr): below 1025px the cells are slides with dots (cell-slider)
    const textItem = (it) => !!it.querySelector('.headline, .text');
    if (!sliderView && view.querySelector(':scope > .carousel') && items.length > 1
      && items.some(textItem) && items.some((it) => !textItem(it) && it.querySelector('.image img'))) {
      variants.push('cell-slider');
    }
    // a column view of its own in an AEM section (.section-content > .column >
    // .column-view:only-child) has 3.2rem above and below on live at every width: option padded
    // (block CSS). Not with a column title (default content before the block, the space belongs
    // above it), in a grey band (the section style column-view has it) or in an article.
    const own = element.classList.contains('column') && element.children.length === 1
      && element.firstElementChild === view && !!element.parentElement
      && element.parentElement.classList.contains('section-content');
    if (own && !titles.length && !ARTICLE && !element.closest('.container-gray')
      && !view.classList.contains('container-gray')) variants.push('padded');
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

  // a column view the cleanup marked for its padding (data-lh-column: with a column title, outside
  // an AEM section, nested in a one-column view; info): the title and the block stay in an element
  // that carries the mark, so the cleanup writes the column-start / column-end markers around them
  const column = element.getAttribute('data-lh-column');
  if (column) {
    const wrap = document.createElement('div');
    wrap.setAttribute('data-lh-column', column);
    wrap.append(...titles, block);
    element.replaceWith(wrap);
    return;
  }
  element.replaceWith(...titles, block);
}
