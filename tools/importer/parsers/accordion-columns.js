/* eslint-disable */
/* global WebImporter */
import { viewerNodes, embedNodes } from './media-nodes.js';

/**
 * Parser for accordion-columns (Lufthansa ".accordion" = <maui-collapsible> of
 * <maui-collapsible-item headline="..."> whose panel holds a multi-column link list).
 *
 * Output: one row per accordion item, 2 columns:
 *   cell 1: title (maui-collapsible-item "headline" attribute)
 *   cell 2: panel content; each column (.column-view-item) contributes its heading (H3) followed
 *           by its links as a <ul>. Other rich text (paragraphs, lists) is kept as is.
 *
 * Videos in a panel (.videoViewer: poster image + link to the .mp4 with
 * "{controls round-play-button}") and embeds (.video YouTube player, .iframe in-flight
 * entertainment widget: a paragraph with the link) stay in place; the block shows the players
 * (scripts/media.js; /flight-disruptions chat assistant videos and YouTube video).
 *
 * Teasers without a target in a panel (a.teaser.partner: img.icon-svg + heading) give their
 * heading with the icon inside (/gefaehrliche-gegenstaende, /electronic-devices-and-batteries).
 *
 * Source links carry an icon <em class="lh lh-arrow-right">, zero-width characters and an
 * sr-only "opens in a new tab" span; those are dropped.
 */
export default function parse(element, { document }) {
  const SR_ONLY = '.sr-only, .visually-hidden, maui-screen-reader-label, [slot="box"]';
  const ZW = /[​-‍﻿]/g;
  const clean = (s) => (s || '').replace(ZW, '').replace(/\s+/g, ' ').trim();
  const visibleText = (node) => {
    if (!node) return '';
    const clone = node.cloneNode(true);
    clone.querySelectorAll(SR_ONLY).forEach((n) => n.remove());
    return clean(clone.textContent);
  };
  const makeLink = (source) => {
    const label = visibleText(source);
    const href = source.getAttribute('href');
    if (!label || !href) return null;
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    return a;
  };

  /** Converts one rich-text block (paragraphs/lists) to clean nodes. */
  const convertRichText = (root) => {
    const out = [];
    [...root.children].forEach((child) => {
      if (child.matches(SR_ONLY)) return;
      // "external website" tooltips wrap their link as slot="trigger"; the box is SR_ONLY
      if (child.tagName === 'MAUI-TOOLTIP') {
        out.push(...convertRichText(child));
        return;
      }
      // Lufthansa link components (maui-navigation-link, maui-link, maui-button-link)
      if (/^MAUI-.*LINK$/.test(child.tagName) && child.getAttribute('href')) {
        const link = makeLink(child);
        if (link) {
          const p = document.createElement('p');
          p.append(link);
          out.push(p);
        }
        return;
      }
      const tag = child.tagName;
      if (/^H[1-6]$/.test(tag)) {
        const text = visibleText(child);
        if (text) {
          const h = document.createElement(tag);
          h.textContent = text;
          out.push(h);
        }
        return;
      }
      if (tag === 'UL' || tag === 'OL') {
        const list = document.createElement(tag);
        child.querySelectorAll(':scope > li').forEach((li) => {
          const item = document.createElement('li');
          // links are still Lufthansa link components when parsers run (/articles/tags lists)
          const a = li.querySelector('a[href], maui-navigation-link[href], maui-link[href], maui-button-link[href]');
          const link = a && makeLink(a);
          if (link) item.append(link);
          else if (visibleText(li)) item.textContent = visibleText(li);
          if (item.childNodes.length) list.append(item);
        });
        if (list.children.length) out.push(list);
        return;
      }
      if (tag === 'P' || tag === 'DIV') {
        const links = [...child.querySelectorAll('a[href]')];
        const clone = child.cloneNode(true);
        clone.querySelectorAll('a, br').forEach((n) => n.remove());
        clone.querySelectorAll(SR_ONLY).forEach((n) => n.remove());
        const onlyLinks = links.length && !clean(clone.textContent);
        if (onlyLinks) {
          // a run of <br>-separated links becomes a list
          const list = document.createElement('ul');
          links.forEach((l) => {
            const link = makeLink(l);
            if (!link) return;
            const li = document.createElement('li');
            li.append(link);
            list.append(li);
          });
          if (list.children.length) out.push(list);
          return;
        }
        if (tag === 'DIV') {
          out.push(...convertRichText(child));
          return;
        }
        const text = visibleText(child);
        if (text) {
          const p = document.createElement('p');
          p.innerHTML = child.innerHTML;
          p.querySelectorAll(`${SR_ONLY}, em.lh, i.lh`).forEach((n) => n.remove());
          p.querySelectorAll('a[href]').forEach((a) => {
            const link = makeLink(a);
            if (link) a.replaceWith(link);
          });
          const walker = document.createTreeWalker(p, 4);
          let node = walker.nextNode();
          while (node) {
            node.textContent = node.textContent.replace(ZW, '');
            node = walker.nextNode();
          }
          out.push(p);
        }
      }
    });
    return out;
  };

  /** A Lufthansa <maui-table> (div.table) as a plain <table>; its head row as <th> cells. */
  const convertTable = (node) => {
    const table = document.createElement('table');
    const rowEls = [...node.querySelectorAll('maui-table-row, tr')]
      .filter((r) => !r.parentElement.closest('maui-table-row, tr'));
    rowEls.forEach((rowEl) => {
      const head = !!rowEl.closest('maui-table-head, thead');
      const tr = document.createElement('tr');
      [...rowEl.querySelectorAll('maui-table-cell, td, th')]
        .filter((c) => c.closest('maui-table-row, tr') === rowEl)
        .forEach((cellEl) => {
          const cell = document.createElement(head ? 'th' : 'td');
          const wrap = document.createElement('div');
          [...cellEl.childNodes].forEach((n) => wrap.append(n.cloneNode(true)));
          const nodes = convertRichText(wrap);
          // a cell of plain text stays text; paragraphs and lists stay as they are
          if (nodes.length === 1 && nodes[0].tagName === 'P') cell.append(...nodes[0].childNodes);
          else if (nodes.length) cell.append(...nodes);
          else cell.textContent = visibleText(cellEl);
          tr.append(cell);
        });
      if (tr.children.length) table.append(tr);
    });
    if (!table.children.length) return [];
    const caption = visibleText(node.querySelector('maui-table-caption, caption'));
    if (!caption) return [table];
    const p = document.createElement('p');
    p.textContent = caption;
    return [p, table];
  };

  /** An image of the panel (.image: a picture or a moving image's img) as <p><picture><img>. */
  const convertImage = (node) => {
    const img = node.querySelector('img');
    const src = img && (img.getAttribute('src') || img.getAttribute('data-src'));
    if (!src || /^(data|blob):/i.test(src)) return [];
    const picture = document.createElement('picture');
    const out = document.createElement('img');
    out.setAttribute('src', src);
    out.setAttribute('alt', clean(img.getAttribute('alt')));
    picture.append(out);
    const p = document.createElement('p');
    p.append(picture);
    return [p];
  };

  const PANEL_NODES = 'h1, h2, h3, h4, h5, h6, .richtext, ul, ol, maui-navigation-link[href], maui-link[href], maui-button-link[href], .videoViewer, .video:has(> .video-player iframe), .iframe:has(> .iframe-wrapper iframe), div.table:has(maui-table, table)';

  /**
   * The panel's link columns (.column-view-item), or none when content of the panel sits outside
   * them: a column view nested in the text (a row of images, /book/special-requests/families) is
   * not the panel's column layout, the panel is read as a whole then.
   */
  const panelColumns = (panel) => {
    const columns = [...panel.querySelectorAll('.column-view-item')]
      .filter((c) => !c.parentElement.closest('.column-view-item'));
    if (!columns.length) return [];
    const outside = [...panel.querySelectorAll(PANEL_NODES)]
      .some((n) => !columns.some((c) => c.contains(n)) && (visibleText(n) || n.querySelector('img, iframe')));
    return outside ? [] : columns;
  };

  /** Panel content: column by column (heading + links), or the rich text as a whole. */
  const convertPanel = (panel) => {
    const content = [];
    const columns = panelColumns(panel);
    const parts = columns.length ? columns : [panel];
    // read as a whole: the images of nested column views too (in column mode none, as before)
    const selector = columns.length ? PANEL_NODES : `${PANEL_NODES}, .image:has(img)`;
    parts.forEach((part) => {
      part.querySelectorAll(selector).forEach((node) => {
        // only outermost nodes: rich text containers are converted as a whole
        if (node.parentElement && node.parentElement.closest('.richtext, ul, ol') && part.contains(node.parentElement.closest('.richtext, ul, ol'))) return;
        if (node.parentElement && node.parentElement.closest('.videoViewer, .video-player, .iframe-wrapper, div.table')) return;
        if (node.matches('div.table')) {
          content.push(...convertTable(node));
        } else if (node.matches('.image')) {
          content.push(...convertImage(node));
        } else if (node.matches('.videoViewer')) {
          content.push(...viewerNodes(node, document));
        } else if (node.matches('.video, .iframe')) {
          content.push(...embedNodes(node, document));
        } else if (/^H[1-6]$/.test(node.tagName)) {
          const text = visibleText(node);
          if (!text) return;
          const h = document.createElement(columns.length ? 'h3' : node.tagName);
          // the icon of a teaser without a target (a.teaser.partner > h4.teaser-heading >
          // img.icon-svg + .teaser-heading-text, /gefaehrliche-gegenstaende): kept in the heading
          // ("<h4><img>Permitted in checked baggage</h4>", block CSS: 48px icon left of the title)
          const icon = node.closest('a.teaser') && node.querySelector('img');
          const src = icon && icon.getAttribute('src');
          if (src && !/^(data|blob):/i.test(src) && !/(^|\/)undefined(\.transform|$|\/)/.test(src)) {
            const img = document.createElement('img');
            img.setAttribute('src', src);
            img.setAttribute('alt', clean(icon.getAttribute('alt')));
            h.append(img);
          }
          h.append(text);
          content.push(h);
        } else if (node.matches('.richtext')) {
          content.push(...convertRichText(node));
        } else {
          const wrap = document.createElement('div');
          wrap.append(node.cloneNode(true));
          content.push(...convertRichText(wrap));
        }
      });
    });
    return content;
  };

  let items = [...element.querySelectorAll('maui-collapsible-item')];
  if (!items.length) items = [...element.querySelectorAll('.accordionitem')];

  /*
   * Variant options from the source:
   *   faq           no item panel holds a column view (.column-view-item): questions and answers
   *                 in one column instead of link columns
   *   limited-width the accordion sits in <maui-limited-width> (two thirds of the grid)
   *   spaced        the accordion is part of a text column (.column-view-item > .accordion, after
   *                 a headline/text): 40px above and below from 768px, 20px below on mobile;
   *                 section-level accordions (.section-content > .accordion) have no such margin
   *   column        the accordion is alone in its column of a column view with several columns
   *                 (/articles/tags, /articles/explore-the-world: one accordion per .threecolumn
   *                 item): consecutive column accordions share a row (the block groups them);
   *                 instead of spaced
   */
  const options = [];
  if (items.length && !items.some((item) => panelColumns(item).length)) options.push('faq');
  if (element.closest('maui-limited-width') || element.querySelector('maui-limited-width maui-collapsible, maui-limited-width .accordionitem')) options.push('limited-width');
  const columnItem = element.parentElement && element.parentElement.closest('.column-view-item');
  const columnView = columnItem && columnItem.closest('.column-view');
  const columnCount = columnView ? [...columnView.querySelectorAll('.column-view-item')]
    .filter((it) => it.closest('.column-view') === columnView).length : 0;
  const aloneInColumn = !!columnItem && [...columnItem.children]
    .filter((c) => c !== element && !c.contains(element) && !c.matches('.separator') && (clean(c.textContent) || c.querySelector('img, video, iframe')))
    .length === 0;
  if (aloneInColumn && columnCount > 1) options.push('column');
  else if (columnItem) options.push('spaced');
  const blockName = options.length ? `accordion-columns (${options.join(', ')})` : 'accordion-columns';

  const cells = [];
  items.forEach((item) => {
    const title = clean(item.getAttribute('headline'))
      || visibleText(item.querySelector('[slot="headline"], .accordion-headline, summary, h2, h3'));
    const content = convertPanel(item);
    if (!title && !content.length) return;
    cells.push([title, content.length ? content : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: blockName, cells });
  element.replaceWith(block);
}
