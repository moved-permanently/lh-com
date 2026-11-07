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
 * .teaser-description .desc-inline): same rows, the icon kept as an <img>, option "partner"; the
 * column item's text and buttons after the teaser follow in a third cell (Brussels' gift cards: full
 * width under the title); the column view's own title stays before the block.
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
    if (cards.length) {
      // the column view's own title (B2B's homepage "Travel solutions": h2.heading-medium) stays
      // before the block, with its size class, as carousel-cards keeps a column title
      const title = element.querySelector(':scope > .column-view > div:not(.row) > :is(h1, h2, h3, h4, h5, h6)');
      if (title && clean(title.textContent)) element.before(title);
      element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'cards-icon-text', variants: ['stacked'], cells: cards }));
    }
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
    // the column item's text and buttons after the teaser (Brussels' gift card page: "You'll
    // receive the Gift Card immediately…", "Continue"): the card's third cell (www shows them full
    // width under the title, brief 448), a primary button bold, a secondary one italic, as the
    // other parsers write them
    const more = [];
    const item = card.closest('.column-view-item');
    const teaserComp = item && [...item.children].find((c) => c.contains(card));
    if (item && teaserComp) {
      let after = false;
      [...item.children].forEach((comp) => {
        if (comp === teaserComp) { after = true; return; }
        if (!after) return;
        if (comp.classList.contains('text')) {
          comp.querySelectorAll('.richtext > p, .richtext > ul, .richtext > ol').forEach((n) => {
            const c = n.cloneNode(true);
            c.querySelectorAll('.sr-only, .visually-hidden, maui-screen-reader-label').forEach((x) => x.remove());
            if (clean(c.textContent)) more.push(c);
          });
        } else if (comp.classList.contains('link')) {
          comp.querySelectorAll('maui-button-link[href], maui-navigation-link[href], maui-link[href], a[href]').forEach((m) => {
            const c = m.cloneNode(true);
            c.querySelectorAll('.sr-only, .visually-hidden, maui-screen-reader-label').forEach((x) => x.remove());
            const label = clean(c.textContent) || clean(m.getAttribute('label'));
            if (!label) return;
            const a = document.createElement('a');
            a.href = m.getAttribute('href');
            a.textContent = label;
            const para = document.createElement('p');
            const type = m.tagName === 'MAUI-BUTTON-LINK' ? m.getAttribute('type') : null;
            if (type === 'primary' || type === 'secondary') {
              const wrap = document.createElement(type === 'primary' ? 'strong' : 'em');
              wrap.append(a);
              para.append(wrap);
            } else {
              para.append(a);
            }
            more.push(para);
          });
        }
      });
    }
    if (!iconCell && !content.length && !more.length) return;
    rows.push([iconCell, content.length ? content : '', more.length ? more : '']);
  });
  // the content after the teasers in a third cell, when a card has some (else two cells, as before)
  if (!rows.some((r) => r[2])) rows.forEach((r) => r.pop());
  // the column view's own title (Brussels' gift card page: "Your Gift Card", h2.heading-small
  // above the row, brief 441) stays before the block, as the icon modules keep theirs
  const columnTitle = element.querySelector(':scope > .column-view > div:not(.row) > :is(h1, h2, h3, h4, h5, h6)');
  if (columnTitle && clean(columnTitle.textContent)) element.before(columnTitle);
  element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'cards-icon-text', variants: ['partner'], cells: rows }));
}
