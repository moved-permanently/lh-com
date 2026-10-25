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
 */
export default function parse(element, { document }) {
  const clean = (s) => (s || '').replace(/[​-‍﻿]/g, '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

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
