/* eslint-disable */
/* global WebImporter */
import { publicPath } from './aem-paths.js';

/**
 * Parser for subpage-nav (Lufthansa sub-page navigation of .contentpage-wrapper.has-subnav pages:
 * .container-subnav > nav.subpage with "More information around this topic", the title of the
 * parent page and its pages; the current page is li.active, a span without a link).
 *
 * The cleanup keeps the nav's <header> as div.subpage-header (the chrome removal takes every
 * <header>). Link hrefs are AEM paths (http://www.lufthansa.com/de/en/during-your-trip/lounges/
 * admission-rules) and become the public paths (/de/en/admission-rules, aem-paths.js).
 *
 * Output (blocks/subpage-nav README): one cell with the eyebrow paragraph, the title as h2 and a
 * list, one item per page: a link, the current page bold text. A section break before it: the
 * block is the last section of the page (live: the nav follows the content; from 768px the
 * block places itself at the top right of the content).
 */
export default function parse(element, { document }) {
  const clean = (s) => (s || '').replace(/[​-‍﻿]/g, '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
  const text = (el) => {
    if (!el) return '';
    const c = el.cloneNode(true);
    c.querySelectorAll('maui-icon, i, .sr-only, .visually-hidden, maui-screen-reader-label').forEach((n) => n.remove());
    return clean(c.textContent);
  };
  const nav = element.matches('nav.subpage') ? element : element.querySelector('nav.subpage');
  if (!nav) return;
  const head = nav.querySelector('.subpage-header, header');
  const eyebrow = text(head && head.querySelector('span'));
  const title = text(head && head.querySelector('h1, h2, h3, h4, h5, h6'));

  const ul = document.createElement('ul');
  nav.querySelectorAll('li').forEach((item) => {
    const link = item.querySelector('a[href]');
    const label = text(link || item);
    if (!label) return;
    const li = document.createElement('li');
    if (link && !item.classList.contains('active')) {
      const a = document.createElement('a');
      a.setAttribute('href', publicPath(link.getAttribute('href')));
      a.textContent = label;
      li.append(a);
    } else {
      const strong = document.createElement('strong');
      strong.textContent = label;
      li.append(strong);
    }
    ul.append(li);
  });
  if (!ul.children.length) {
    element.remove();
    return;
  }

  const cell = [];
  if (eyebrow) {
    const p = document.createElement('p');
    p.textContent = eyebrow;
    cell.push(p);
  }
  if (title) {
    const h = document.createElement('h2');
    h.textContent = title;
    cell.push(h);
  }
  cell.push(ul);
  const block = WebImporter.Blocks.createBlock(document, { name: 'subpage-nav', cells: [[cell]] });
  // a section break of lufthansa-sections (empty sections next to it are dropped there)
  const hr = document.createElement('hr');
  hr.setAttribute('data-excat-section-break', '');
  element.replaceWith(hr, block);
}
