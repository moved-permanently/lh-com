/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-logos (Lufthansa ".twocolumn" holding ".imagelinklist" logo lists).
 *
 * Output: one row, one cell per column. Each cell: the column heading, then a <ul> of linked
 * logo images (<a href><img alt></a>). Links without an image are kept as text links.
 *
 * Repeating unit: .column-view-item (one per column). Logo links are
 * <maui-navigation-link href> custom elements (some wrapped in an external-link maui-tooltip);
 * they are rebuilt as <a>. Tooltip/sr-only "external website" texts are not content.
 */
export default function parse(element, { document }) {
  const SR_ONLY = '.sr-only, .visually-hidden, maui-screen-reader-label, [slot="box"]';
  const clean = (s) => (s || '').replace(/[​-‍﻿]/g, '').replace(/\s+/g, ' ').trim();
  const visibleText = (node) => {
    if (!node) return '';
    const clone = node.cloneNode(true);
    clone.querySelectorAll(SR_ONLY).forEach((n) => n.remove());
    return clean(clone.textContent);
  };
  const isBroken = (src) => !src || /(^|\/)undefined(\.transform|$|\/)/.test(src);

  let columns = [...element.querySelectorAll('.column-view-item')];
  if (!columns.length) columns = [...element.querySelectorAll('.imagelinklist, .link-list')];

  const row = [];
  columns.forEach((column) => {
    const content = [];

    const headingSource = column.querySelector('h1, h2, h3, h4, h5, h6, .headline');
    const headingText = visibleText(headingSource);
    if (headingText) {
      const tag = headingSource && /^H[1-6]$/.test(headingSource.tagName) ? headingSource.tagName : 'h3';
      const h = document.createElement(tag);
      h.textContent = headingText;
      content.push(h);
    }

    const ul = document.createElement('ul');
    const items = [...column.querySelectorAll('li')];
    const linkSources = items.length
      ? items.map((li) => li.querySelector('maui-navigation-link[href], a[href], [href]') || li)
      : [...column.querySelectorAll('maui-navigation-link[href], a[href]')];

    linkSources.forEach((source) => {
      const href = source.getAttribute && source.getAttribute('href');
      const img = [...source.querySelectorAll('img')].find((i) => !isBroken(i.getAttribute('src')));
      const label = visibleText(source);
      if (!img && !label) return;

      const li = document.createElement('li');
      let item;
      if (img) {
        item = document.createElement('img');
        item.src = img.getAttribute('src');
        item.alt = clean(img.getAttribute('alt')) || clean(img.getAttribute('title')) || label;
      } else {
        item = document.createTextNode(label);
      }
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        const title = img && (clean(img.getAttribute('title')) || clean(img.getAttribute('alt')));
        if (title) a.title = title;
        a.append(item);
        li.append(a);
      } else {
        li.append(item);
      }
      ul.append(li);
    });
    if (ul.children.length) content.push(ul);

    if (content.length) row.push(content);
  });

  const cells = row.length ? [row] : [];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-logos', cells });
  element.replaceWith(block);
}
