/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-price (AirCore destination tiles with a frozen price).
 *
 * Sources (AirCore /lhg/ pages, prices are captured as authored text at import time):
 *   - destination overview: `.sitemap-background .image-box-wrapper`
 *       > div > a.image-box[href] > .image-wrapper img + .image-box-footer
 *         (.city-name, .price > .price-prefix "from" + <nobr>124</nobr> €)
 *     The H3 country link sits before the wrapper and stays default content.
 *   - destination page: `.image-box-wrapper-city`
 *       > div.image-box[.mobile-hidden] > .box-header (a.clickable-target, .price)
 *     No images. `.mobile-hidden` has no rule on the live site (all tiles show on mobile), so
 *     it is not carried over (formerly option "mobile-limit").
 *
 * Output: one row per tile, 2 cells.
 *   cell 1: image (alt = city name when the source alt is empty) or empty
 *   cell 2: <p><a href>label</a></p> + <p>from <strong>124 €</strong></p> (price line only
 *           when the tile has an amount; unpriced tiles render "from &nbsp;" hidden)
 *
 * Repeating unit: the direct child <div> of the wrapper (block-level in both sources).
 */
export default function parse(element, { document }) {
  const clean = (s) => (s || '').replace(/[​-‍﻿]/g, '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

  const tiles = [...element.querySelectorAll(':scope > div')];
  const cells = [];

  tiles.forEach((tile) => {
    const box = tile.matches('.image-box') ? tile : (tile.querySelector('.image-box') || tile);

    // link: the tile itself (overview a.image-box) or the label link (destination page)
    const link = box.matches('a[href]') ? box : box.querySelector('a.clickable-target[href], a[href]');
    const labelEl = box.querySelector('.city-name') || box.querySelector('.box-header a, .box-header .bigger') || link;
    const label = clean(labelEl && labelEl.textContent);

    // price: prefix text + amount/currency (bold); skipped when there is no amount
    let priceP = null;
    const priceEl = box.querySelector('.price');
    if (priceEl) {
      const prefixEl = priceEl.querySelector('.price-prefix');
      const prefix = clean(prefixEl && prefixEl.textContent);
      const clone = priceEl.cloneNode(true);
      clone.querySelectorAll('.price-prefix').forEach((n) => n.remove());
      const amount = clean(clone.textContent);
      if (/\d/.test(amount)) {
        priceP = document.createElement('p');
        if (prefix) priceP.append(`${prefix} `);
        const strong = document.createElement('strong');
        strong.textContent = amount;
        priceP.append(strong);
      }
    }

    // image (overview only)
    let imageCell = '';
    const srcImg = box.querySelector('.image-wrapper img, img');
    const src = srcImg && (srcImg.getAttribute('src') || srcImg.getAttribute('data-src'));
    if (src) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = clean(srcImg.getAttribute('alt')) || label;
      imageCell = img;
    }

    if (!label && !priceP && !imageCell) return;

    const content = [];
    if (label) {
      const p = document.createElement('p');
      if (link && link.getAttribute('href')) {
        const a = document.createElement('a');
        a.href = link.getAttribute('href');
        a.textContent = label;
        p.append(a);
      } else {
        p.textContent = label;
      }
      content.push(p);
    }
    if (priceP) content.push(priceP);

    cells.push([imageCell, content]);
  });

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'cards-price',
    variants: [],
    cells,
  });
  element.replaceWith(block);
}
