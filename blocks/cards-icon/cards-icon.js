import { decorateExternalLinks } from '../../scripts/block-config.js';

/**
 * Compact link tiles: an icon over a label, the whole tile clickable.
 * One row per tile; cells may hold an icon (:name: token or image), a label and a link,
 * in any order and number.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const icon = row.querySelector('span.icon, picture, img');
    const link = row.querySelector('a[href]');
    const iconImg = icon && (icon.tagName === 'IMG' ? icon : icon.querySelector('img'));
    const labelText = ((link && link.textContent.trim()) || row.textContent).replace(/\s+/g, ' ').trim()
      || (iconImg && iconImg.alt) || '';
    if (!icon && !labelText) return;

    const li = document.createElement('li');
    const tile = document.createElement(link ? 'a' : 'div');
    tile.className = 'cards-icon-tile';
    if (link) {
      tile.href = link.href;
      if (link.title) tile.title = link.title;
    }

    if (icon) {
      const iconWrap = document.createElement('span');
      iconWrap.className = 'cards-icon-icon';
      // icons are small (often SVG): moved as authored, not re-rendered as optimized pictures
      iconWrap.append(icon);
      iconWrap.setAttribute('aria-hidden', 'true');
      tile.append(iconWrap);
    }

    const label = document.createElement('span');
    label.className = 'cards-icon-label';
    label.textContent = labelText;
    tile.append(label);

    li.append(tile);
    ul.append(li);
  });

  decorateExternalLinks(ul);
  block.replaceChildren(ul);
}
