import { decorateIcons } from '../../scripts/aem.js';
import { cleanText, decorateExternalLinks } from '../../scripts/block-config.js';
import { takeIconName } from '../../scripts/lh-icons.js';

/**
 * Body elements of a row (all cells merged), without the icon. Cells authored without
 * paragraphs become a paragraph.
 * @param {Element} row
 * @param {Element|null} icon
 * @returns {Element[]}
 */
function bodyElements(row, icon) {
  const elements = [];
  [...row.children].forEach((cell) => {
    if (icon && cell.contains(icon)) icon.remove();
    if (!cleanText(cell)) return;
    const hasBlocks = [...cell.children].some((el) => /^(P|H[1-6]|UL|OL|DIV)$/.test(el.tagName));
    if (hasBlocks) {
      [...cell.children].forEach((el) => {
        if (cleanText(el)) elements.push(el);
      });
    } else {
      const p = document.createElement('p');
      p.append(...cell.childNodes);
      elements.push(p);
    }
  });
  return elements;
}

/**
 * Transparent link cards with an icon left of a title and a description.
 * One row per card. Cell 1: icon (:icon-name: token or small image); cell 2: H3 title,
 * description, link. The link makes the whole card clickable.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    let icon = row.querySelector('span.icon, picture, img');
    // an undecorated ":name:" token (content served without the icon pipeline) is the icon too
    const token = !icon && takeIconName(row);
    if (token) {
      const holder = document.createElement('div');
      icon = document.createElement('span');
      icon.className = `icon icon-${token}`;
      holder.append(icon);
      decorateIcons(holder);
    }
    const iconEl = icon && icon.tagName === 'IMG' && icon.closest('picture') ? icon.closest('picture') : icon;
    const links = [...row.querySelectorAll('a[href]')];
    const link = links[links.length - 1] || null;
    const elements = bodyElements(row, iconEl);
    if (!iconEl && !elements.length) return;

    const heading = elements.find((el) => /^H[1-6]$/.test(el.tagName));
    const titleText = cleanText(heading);

    const li = document.createElement('li');
    const card = document.createElement(link ? 'a' : 'div');
    card.className = 'cards-icon-text-card';
    if (link) card.href = link.href;

    if (iconEl) {
      const iconWrap = document.createElement('span');
      iconWrap.className = 'cards-icon-text-icon';
      iconWrap.setAttribute('aria-hidden', 'true');
      // icons are small (often SVG): moved as authored
      iconWrap.append(iconEl);
      card.append(iconWrap);
    }

    const body = document.createElement('div');
    body.className = 'cards-icon-text-body';
    elements.forEach((el) => {
      // the title heading stays even when it is (or holds) the card link
      if (link && el !== heading && el.contains(link)) {
        const onlyLink = cleanText(el) === cleanText(link);
        // a link repeating the title is not shown twice; the card is the link
        if (onlyLink && titleText && cleanText(link) === titleText) return;
        if (onlyLink) {
          const cta = document.createElement('p');
          cta.className = 'cards-icon-text-link';
          cta.textContent = cleanText(link);
          body.append(cta);
          return;
        }
      }
      if (el === heading) el.classList.add('cards-icon-text-title');
      // nested links are not allowed inside the card link: keep their text only
      if (link) el.querySelectorAll('a').forEach((a) => a.replaceWith(...a.childNodes));
      body.append(el);
    });
    card.append(body);

    li.append(card);
    ul.append(li);
  });

  decorateExternalLinks(ul);
  block.replaceChildren(ul);
}
