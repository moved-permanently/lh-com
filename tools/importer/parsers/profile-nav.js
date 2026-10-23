/* eslint-disable */
/* global WebImporter */
import { publicPath } from './aem-paths.js';

/**
 * Parser for profile-nav (Lufthansa maui-sub-navigation in .subnav-wrapper between header and
 * content: hub /lufthansa-reiseklassen "Lufthansa Reiseklassen | First Class | Business Class |
 * Premium Economy Class | Economy Class").
 *
 * Source: maui-sub-navigation > maui-sub-navigation-tab[name][href] (the label is the "name"
 * attribute; "active" in the snapshot is not reliable, the block marks the tab of the current
 * page). Tab hrefs are AEM paths (/de/de/prepare-for-your-trip/travel-classes/first-class) and
 * become the public paths (/de/de/first-class, aem-paths.js) so the active tab is found.
 *
 * Output: one cell with a list of links in tab order, then a section break: the block sits
 * alone in the first section (blocks/profile-nav README).
 */
export default function parse(element, { document }) {
  const clean = (s) => (s || '').replace(/[​-‍﻿]/g, '').replace(/\s+/g, ' ').trim();
  const ul = document.createElement('ul');
  element.querySelectorAll('maui-sub-navigation-tab').forEach((tab) => {
    const label = clean(tab.getAttribute('name')) || clean(tab.textContent);
    const href = tab.getAttribute('href');
    if (!label || !href) return;
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.setAttribute('href', publicPath(href));
    a.textContent = label;
    li.append(a);
    ul.append(li);
  });
  if (!ul.children.length) {
    element.remove();
    return;
  }
  const block = WebImporter.Blocks.createBlock(document, { name: 'profile-nav', cells: [[ul]] });
  // a section break of lufthansa-sections (empty sections next to it are dropped there)
  const hr = document.createElement('hr');
  hr.setAttribute('data-excat-section-break', '');
  element.replaceWith(block, hr);
}
