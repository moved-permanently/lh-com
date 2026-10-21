/* eslint-disable */
/* global WebImporter */

/**
 * Parser for table-deals (AirCore `section.last-minute-deals`).
 *
 * Source:
 *   section.last-minute-deals
 *     > h2#last-minute-deals-title, div.mb-1 (intro)       -> default content before the block
 *     > .last-minute-deals__list > article.last-minute-deals__offer (all of them; the source
 *         hides all but the first few with [hidden], which is not relied upon)
 *         > a.last-minute-deals__offer-link[href]
 *           .last-minute-deals__route--origin / --destination .last-minute-deals__route-name
 *           time
 *           .last-minute-deals__price (.last-minute-deals__price-label + __price-value)
 *     > button.last-minute-deals__load-more                -> "Show more label" config row
 *
 * Output: one row per deal, 4 cells: Origin | Destination | Date | [from 423 €](href),
 * then 2-cell config rows "Visible rows | N" and "Show more label | <button text>".
 * Prices and dates are frozen authored text.
 */
export default function parse(element, { document }) {
  const clean = (s) => (s || '').replace(/[​-‍﻿]/g, '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
  const text = (root, selector) => {
    const node = root.querySelector(selector);
    return clean(node && node.textContent);
  };

  // default content (heading + intro) placed before the block
  const intro = [];
  const heading = element.querySelector(':scope > h1, :scope > h2, :scope > h3');
  if (heading && clean(heading.textContent)) {
    const h = document.createElement(heading.tagName);
    h.textContent = clean(heading.textContent);
    intro.push(h);
  }
  [...element.children].forEach((child) => {
    if (child === heading || child.matches('.last-minute-deals__list, button, h1, h2, h3')) return;
    const t = clean(child.textContent);
    if (!t) return;
    const p = document.createElement('p');
    p.innerHTML = child.innerHTML;
    p.querySelectorAll('i.lh, em.lh, span.lh').forEach((n) => n.remove());
    intro.push(p);
  });

  const offers = [...element.querySelectorAll('.last-minute-deals__offer')];
  const cells = [];
  offers.forEach((offer) => {
    const link = offer.querySelector('a[href]');
    const origin = text(offer, '.last-minute-deals__route--origin .last-minute-deals__route-name, .last-minute-deals__route--origin');
    const destination = text(offer, '.last-minute-deals__route--destination .last-minute-deals__route-name, .last-minute-deals__route--destination');
    const date = text(offer, 'time');
    const priceLabel = text(offer, '.last-minute-deals__price-label');
    const priceValue = text(offer, '.last-minute-deals__price-value');
    const price = clean(`${priceLabel} ${priceValue}`) || text(offer, '.last-minute-deals__price');
    if (!origin && !destination && !price) return;

    let priceCell = price;
    if (link && link.getAttribute('href')) {
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = price || clean(link.textContent);
      priceCell = a;
    }
    cells.push([origin, destination, date, priceCell]);
  });

  // visible rows: as rendered by the source when that is meaningful, else the block default
  const shown = offers.filter((o) => !o.hasAttribute('hidden')).length;
  const visible = shown > 0 && shown < offers.length ? shown : 5;
  // config rows must keep exactly 2 cells (the block only reads 2-cell rows as config;
  // a padded 4-cell row would be rendered as a deal)
  cells.push(['Visible rows', String(visible)]);
  const more = text(element, '.last-minute-deals__load-more, button');
  if (more) cells.push(['Show more label', more]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'table-deals', cells });
  if (intro.length) element.before(...intro);
  element.replaceWith(block);
}
