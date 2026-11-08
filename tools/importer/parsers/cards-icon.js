/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-icon (Lufthansa ".teaserwrapper" icon link list of ".teasericon" tiles).
 *
 * Output: one row per tile, 2 columns:
 *   cell 1: icon as ":name:" token (from <maui-icon use="name">) or the tile image
 *   cell 2: label linked to the tile target
 *
 * Repeating unit: .icon-teaser (inside .teasericon; the whole tile is the <a>).
 * Icon names are the source design-system names (e.g. "hotel", "car-rental"); the matching
 * SVGs live in /icons/{name}.svg.
 *
 * Service tiles (hub /additional-services: ".threecolumn" / ".fourcolumn" of a.teaser.usp, the
 * whole tile is the link, h3.teaser-heading holds .image-wrapper img + .teaser-heading-text):
 * same rows (image | linked label), option "usp" (".fourcolumn" adds "four-up").
 */
export default function parse(element, { document }) {
  const SR_ONLY = '.sr-only, .visually-hidden, maui-screen-reader-label';
  const clean = (s) => (s || '').replace(/[​-‍﻿]/g, '').replace(/\s+/g, ' ').trim();
  const visibleText = (node) => {
    if (!node) return '';
    const clone = node.cloneNode(true);
    clone.querySelectorAll(SR_ONLY).forEach((n) => n.remove());
    return clean(clone.textContent);
  };
  const isBroken = (src) => !src || /(^|\/)undefined(\.transform|$|\/)/.test(src);

  let tiles = [...element.querySelectorAll('.icon-teaser')];
  // service tiles (hub /additional-services): a.teaser.usp > h3 > .image-wrapper img + label
  if (!tiles.length) tiles = [...element.querySelectorAll('a.teaser.usp')];
  if (!tiles.length) tiles = [...element.querySelectorAll('li, .teasericon')];
  const usp = tiles.length > 0 && tiles[0].matches('a.teaser.usp');
  let variants = [];
  if (usp) variants = element.matches('.fourcolumn') ? ['usp', 'four-up'] : ['usp'];
  // a column view of its own in an AEM section (.section-content > .column > .column-view, its
  // only component; no column title, not grey, not in an article): www's 3.2rem above and below,
  // option padded (as columns-media; /de/en/additional-services' tiles)
  const view = element.querySelector(':scope > .column-view');
  const own = element.classList.contains('column') && element.children.length === 1 && !!view
    && !!element.parentElement && element.parentElement.classList.contains('section-content')
    && [...element.parentElement.children].every((c) => c === element || !(c.textContent || '').trim());
  const titled = view && [...view.children].some((c) => !c.matches('.row, .carousel') && c.querySelector('h1, h2, h3, h4, h5, h6'));
  if (own && !titled && !element.closest('.container-gray, .article-details-page') && !view.classList.contains('container-gray')) variants.push('padded');

  const cells = [];
  tiles.forEach((tile) => {
    const link = tile.matches('a[href]') ? tile : tile.querySelector('a[href]');
    const label = visibleText(tile.querySelector('.headline, .teaser-headline, h3, h4')) || visibleText(link);

    // Icon: maui-icon "use" name, legacy icon-* class, or an image.
    let iconCell = '';
    const mauiIcon = tile.querySelector('maui-icon[use], [class*="icon-"][use]');
    const iconName = mauiIcon ? clean(mauiIcon.getAttribute('use')).toLowerCase().replace(/[^a-z0-9-]/g, '-') : '';
    if (iconName) {
      iconCell = `:${iconName}:`;
    } else {
      const img = [...tile.querySelectorAll('img')].find((i) => !isBroken(i.getAttribute('src')));
      if (img) {
        const image = document.createElement('img');
        image.src = img.getAttribute('src');
        image.alt = img.getAttribute('alt') || '';
        iconCell = image;
      }
    }

    if (!label && !iconCell) return;

    let labelCell = label;
    if (link && label) {
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      if (link.getAttribute('title')) a.title = link.getAttribute('title');
      a.textContent = label;
      labelCell = a;
    }
    cells.push([iconCell, labelCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-icon', variants, cells });
  element.replaceWith(block);
}
