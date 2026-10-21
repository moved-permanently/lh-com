/* eslint-disable */
/* global WebImporter */

/**
 * Parser for accordion-side-by-side (AirCore `#content > .internal-links`, link-list columns).
 *
 * Source: .internal-links.accordion.as-column > div (one per column, 3 or 4)
 *           > h3.accordion-header > button > span (title) + i.lh
 *           > .accordion-panel > .inner > ul > li > a[href] (i.lh-arrow-right icon + text)
 *
 * Output: one row per column, 2 cells: title text | <ul> of links (icons dropped).
 */
export default function parse(element, { document }) {
  const clean = (s) => (s || '').replace(/[​-‍﻿]/g, '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
  const textOf = (node) => {
    if (!node) return '';
    const clone = node.cloneNode(true);
    clone.querySelectorAll('i.lh, em.lh, .sr-only, .visually-hidden').forEach((n) => n.remove());
    return clean(clone.textContent);
  };

  let items = [...element.querySelectorAll(':scope > div')].filter((d) => d.querySelector('.accordion-header, .accordion-panel'));
  if (!items.length) items = [...element.querySelectorAll(':scope > div')];

  const cells = [];
  items.forEach((item) => {
    const header = item.querySelector('.accordion-header');
    const title = textOf(header && (header.querySelector('button span') || header));
    const panel = item.querySelector('.accordion-panel') || item;

    const content = [];
    const lists = [...panel.querySelectorAll('ul, ol')].filter((l) => !l.parentElement.closest('ul, ol'));
    lists.forEach((list) => {
      const out = document.createElement(list.tagName);
      list.querySelectorAll(':scope > li').forEach((li) => {
        const a = li.querySelector('a[href]');
        const label = textOf(a || li);
        if (!label) return;
        const outLi = document.createElement('li');
        if (a) {
          const link = document.createElement('a');
          link.href = a.getAttribute('href');
          link.textContent = label;
          outLi.append(link);
        } else {
          outLi.textContent = label;
        }
        out.append(outLi);
      });
      if (out.children.length) content.push(out);
    });
    if (!lists.length) {
      const t = textOf(panel === item ? null : panel);
      if (t) {
        const p = document.createElement('p');
        p.textContent = t;
        content.push(p);
      }
    }
    if (!title && !content.length) return;
    cells.push([title, content.length ? content : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-side-by-side', cells });
  element.replaceWith(block);
}
