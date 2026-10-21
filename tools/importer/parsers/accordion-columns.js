/* eslint-disable */
/* global WebImporter */

/**
 * Parser for accordion-columns (Lufthansa ".accordion" = <maui-collapsible> of
 * <maui-collapsible-item headline="..."> whose panel holds a multi-column link list).
 *
 * Output: one row per accordion item, 2 columns:
 *   cell 1: title (maui-collapsible-item "headline" attribute)
 *   cell 2: panel content; each column (.column-view-item) contributes its heading (H3) followed
 *           by its links as a <ul>. Other rich text (paragraphs, lists) is kept as is.
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
          const a = li.querySelector('a[href]');
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

  /** Panel content: column by column (heading + links), or the rich text as a whole. */
  const convertPanel = (panel) => {
    const content = [];
    const columns = [...panel.querySelectorAll('.column-view-item')];
    const parts = columns.length ? columns : [panel];
    parts.forEach((part) => {
      part.querySelectorAll('h1, h2, h3, h4, h5, h6, .richtext, ul, ol, maui-navigation-link[href], maui-link[href], maui-button-link[href]').forEach((node) => {
        // only outermost nodes: rich text containers are converted as a whole
        if (node.parentElement && node.parentElement.closest('.richtext, ul, ol') && part.contains(node.parentElement.closest('.richtext, ul, ol'))) return;
        if (/^H[1-6]$/.test(node.tagName)) {
          const text = visibleText(node);
          if (!text) return;
          const h = document.createElement(columns.length ? 'h3' : node.tagName);
          h.textContent = text;
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

  /**
   * AirCore (/lhg/) accordions: `#content > .faq` and `#content > .travel-information`
   *   > div > h3.accordion-header > button > span ([img icon] title) + i.lh
   *         > .accordion-panel > .inner (inline text with links, or <p>s/lists)
   * Title icons are inline base64 SVGs without a name; known ones are mapped to an
   * ":icon-name:" token (SVGs in /icons/{name}.svg) by a fingerprint of the data URI, unknown
   * ones are kept as the image.
   */
  const AIRCORE_ICONS = { '2qb66p': 'document', '4b3rr0': 'currency' };
  const fingerprint = (s) => {
    let x = 5381;
    for (let i = 0; i < s.length; i += 1) x = ((x * 33) ^ s.charCodeAt(i)) >>> 0;
    return x.toString(36);
  };
  const aircoreItems = [...element.querySelectorAll(':scope > div')].filter((d) => d.querySelector(':scope > .accordion-header'));
  if (aircoreItems.length) {
    const rows = [];
    aircoreItems.forEach((item) => {
      const header = item.querySelector(':scope > .accordion-header');
      const label = header.querySelector('button > span') || header;
      const titleCell = [];
      const icon = label.querySelector('img');
      const iconSrc = icon && icon.getAttribute('src');
      if (iconSrc) {
        const name = AIRCORE_ICONS[fingerprint(iconSrc)]
          || (!iconSrc.startsWith('data:') && /\.svg/i.test(iconSrc) ? iconSrc.split('?')[0].split('/').pop().replace(/\.svg$/i, '').toLowerCase() : '');
        if (name) {
          titleCell.push(`:${name}: `);
        } else {
          const img = document.createElement('img');
          img.src = iconSrc;
          img.alt = clean(icon.getAttribute('alt'));
          titleCell.push(img, ' ');
        }
      }
      const title = visibleText(label);
      if (title) titleCell.push(title);

      const panel = item.querySelector('.accordion-panel .inner') || item.querySelector('.accordion-panel');
      let content = [];
      if (panel) {
        const hasBlocks = [...panel.children].some((c) => /^(P|DIV|UL|OL|H[1-6])$/.test(c.tagName));
        if (hasBlocks) {
          content = convertRichText(panel);
        } else {
          const wrap = document.createElement('div');
          const p = document.createElement('p');
          p.innerHTML = panel.innerHTML;
          wrap.append(p);
          content = convertRichText(wrap);
        }
      }
      if (!title && !content.length) return;
      rows.push([titleCell.length ? titleCell : '', content.length ? content : '']);
    });
    const aircoreBlock = WebImporter.Blocks.createBlock(document, { name: 'accordion-columns', cells: rows });
    element.replaceWith(aircoreBlock);
    return;
  }

  let items = [...element.querySelectorAll('maui-collapsible-item')];
  if (!items.length) items = [...element.querySelectorAll('.accordionitem')];

  const cells = [];
  items.forEach((item) => {
    const title = clean(item.getAttribute('headline'))
      || visibleText(item.querySelector('[slot="headline"], .accordion-headline, summary, h2, h3'));
    const content = convertPanel(item);
    if (!title && !content.length) return;
    cells.push([title, content.length ? content : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-columns', cells });
  element.replaceWith(block);
}
