import { createOptimizedPicture } from '../../scripts/aem.js';
import { cleanText, decorateExternalLinks } from '../../scripts/block-config.js';

const PICTURE_BREAKPOINTS = [{ media: '(min-width: 600px)', width: '2000' }, { width: '750' }];

/**
 * Text blocks of a row: paragraphs/headings of every cell, or the bare text of a cell
 * authored without paragraphs. Pictures are not part of the text.
 * @param {Element} row
 * @returns {Element[]}
 */
function textBlocks(row) {
  const blocks = [];
  [...row.children].forEach((cell) => {
    const children = [...cell.children].filter((el) => /^(P|H[1-6]|DIV)$/.test(el.tagName));
    if (children.length) {
      children.forEach((el) => {
        if (cleanText(el)) blocks.push(el);
      });
    } else if (cleanText(cell)) {
      const p = document.createElement('p');
      [...cell.childNodes].forEach((node) => {
        if (!(node.nodeType === 1 && node.matches('picture, img'))) p.append(node.cloneNode(true));
      });
      if (cleanText(p)) blocks.push(p);
    }
  });
  return blocks;
}

/**
 * Copies the inline content of an element into a new element, replacing nested links by
 * their text (the whole tile is the link).
 */
function inlineCopy(source, tagName, className) {
  const el = document.createElement(tagName);
  el.className = className;
  el.innerHTML = source.innerHTML;
  el.querySelectorAll('picture, img').forEach((media) => media.remove());
  el.querySelectorAll('a').forEach((a) => a.replaceWith(...a.childNodes));
  return el;
}

/**
 * Price tiles: optional square image, a label (linked) and an optional authored price text.
 * One row per tile. Cell 1: image (optional); cell 2: label link + price paragraph.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const img = row.querySelector('picture img, img');
    const link = row.querySelector('a[href]');
    const blocks = textBlocks(row);

    // label: the paragraph holding the link, otherwise the first text block
    const labelBlock = (link && blocks.find((el) => el.contains(link))) || blocks[0];
    const labelText = (link && cleanText(link)) || cleanText(labelBlock);
    const priceBlocks = blocks.filter((el) => el !== labelBlock);
    if (!img && !labelText && !priceBlocks.length) return;

    const li = document.createElement('li');
    const tile = document.createElement(link ? 'a' : 'div');
    tile.className = 'cards-price-tile';
    if (link) {
      tile.href = link.href;
      if (link.title && link.title !== labelText) tile.title = link.title;
    }

    if (img) {
      const media = document.createElement('div');
      media.className = 'cards-price-image';
      media.append(createOptimizedPicture(img.src, img.alt || '', false, PICTURE_BREAKPOINTS));
      tile.append(media);
    } else {
      li.classList.add('cards-price-text-only');
    }

    const body = document.createElement('div');
    body.className = 'cards-price-body';
    if (labelText) {
      const label = document.createElement('p');
      label.className = 'cards-price-label';
      label.textContent = labelText;
      body.append(label);
    }
    priceBlocks.forEach((el) => body.append(inlineCopy(el, 'p', 'cards-price-price')));
    tile.append(body);

    li.append(tile);
    ul.append(li);
  });

  decorateExternalLinks(ul);
  block.replaceChildren(ul);
}
