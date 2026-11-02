/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-icon-text. (The AirCore `#content > .icon-links` cards of the /lhg/ pages
 * left the replica on 2026-10-25.)
 *
 * Output: one row per card, 2 cells.
 *   cell 1: the icon image
 *   cell 2: <h3><a href>title</a></h3> + <p>description</p>
 *
 * Lufthansa partner teasers (hub /digital-self-services: .threecolumn / .twocolumn of
 * a.teaser.partner > h4.teaser-heading (img.icon-svg + .teaser-heading-text) +
 * .teaser-description .desc-inline): same rows, the icon kept as an <img>, option "partner".
 *
 * Lufthansa Group for Business' icon modules (business.lufthansagroup.com homepages: a column row
 * of .iconmodule > .icon-module: img.icon-module__icon, h3.icon-module__heading,
 * .icon-module__description, a.icon-module__cta; marked b2b-iconmodules by b2b-import.mjs): one
 * card each (cell 1 the icon image, cell 2 title, description and the CTA as linked text at the
 * bottom), option "stacked".
 */
export default function parse(element, { document }) {
  const clean = (s) => (s || '').replace(/[​-‍﻿]/g, '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

  const modules = [...element.querySelectorAll('.icon-module')];
  if (modules.length) {
    const cards = [];
    modules.forEach((m) => {
      const img = m.querySelector('img.icon-module__icon');
      if (!img || !img.getAttribute('src')) return;
      const icon = document.createElement('img');
      icon.src = img.getAttribute('src');
      icon.alt = clean(img.getAttribute('alt'));
      const text = [];
      const title = clean((m.querySelector('.icon-module__heading') || {}).textContent);
      if (title) {
        const h3 = document.createElement('h3');
        h3.textContent = title;
        text.push(h3);
      }
      const description = clean((m.querySelector('.icon-module__description') || {}).textContent);
      if (description) {
        const p = document.createElement('p');
        p.textContent = description;
        text.push(p);
      }
      const cta = m.querySelector('a.icon-module__cta[href]');
      if (cta) {
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.href = cta.getAttribute('href');
        a.textContent = clean(cta.textContent) || title;
        p.append(a);
        text.push(p);
      }
      if (text.length) cards.push([icon, text]);
    });
    if (cards.length) element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'cards-icon-text', variants: ['stacked'], cells: cards }));
    return;
  }

  // Lufthansa partner teasers (hub /digital-self-services: .threecolumn of a.teaser.partner, the
  // whole tile is the link): img.icon-svg + .teaser-heading-text + .desc-inline. The icon stays
  // an image (its file name is no /icons/ token), option "partner".
  const partners = [...element.querySelectorAll('a.teaser.partner')];
  if (!partners.length) return;
  const rows = [];
  partners.forEach((card) => {
    let iconCell = '';
    const img = card.querySelector('img.icon-svg, .image-wrapper img, img');
    const src = img && img.getAttribute('src');
    if (src && !/^(data|blob):/i.test(src)) {
      iconCell = document.createElement('img');
      iconCell.src = src;
      iconCell.alt = clean(img.getAttribute('alt'));
    }
    const content = [];
    const title = clean((card.querySelector('.teaser-heading-text') || card.querySelector('.teaser-heading, h1, h2, h3, h4, h5, h6') || {}).textContent);
    const href = card.getAttribute('href');
    if (title) {
      const h3 = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = title;
        h3.append(a);
      } else {
        h3.textContent = title;
      }
      content.push(h3);
    }
    card.querySelectorAll('.teaser-description p').forEach((d) => {
      const t = clean(d.textContent);
      if (!t || content.some((c) => c.textContent === t)) return;
      const p = document.createElement('p');
      p.textContent = t;
      content.push(p);
    });
    if (!iconCell && !content.length) return;
    rows.push([iconCell, content.length ? content : '']);
  });
  element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'cards-icon-text', variants: ['partner'], cells: rows }));
}
