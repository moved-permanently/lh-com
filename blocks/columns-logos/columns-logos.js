import { decorateExternalLinks, cleanText } from '../../scripts/block-config.js';

/**
 * Collects the logos of a cell: linked images/icons, unlinked images/icons, and plain text
 * links as a fallback so no authored link is lost.
 */
function collectLogos(cell) {
  const logos = [];
  const seen = new Set();
  cell.querySelectorAll('a[href], picture, img, span.icon').forEach((node) => {
    if ([...seen].some((s) => s.contains(node))) return;
    const link = node.closest('a[href]');
    const item = link && cell.contains(link) ? link : node;
    if (seen.has(item)) return;
    seen.add(item);
    logos.push(item);
  });
  return logos;
}

/** Makes sure a logo link has an accessible name. */
function nameLogo(item) {
  const img = item.querySelector('img');
  const icon = item.querySelector('[data-icon-name]');
  // icon tokens (:facebook:) carry no alt text: fall back to the authored icon name
  const name = cleanText(item) || (img && img.alt) || item.title
    || (icon && icon.dataset.iconName.replace(/-/g, ' ')) || '';
  if (item.tagName === 'A' && !cleanText(item) && name) item.setAttribute('aria-label', name);
  if (img && !img.alt && item.tagName === 'A' && item.title) img.alt = item.title;
}

/**
 * Columns whose cells are a small heading over an inline row of logo or icon links.
 * @param {Element} block
 */
export default function decorate(block) {
  const cols = [];
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      if (!cell.textContent.trim() && !cell.querySelector('img, a')) return;
      const col = document.createElement('div');
      col.className = 'columns-logos-col';

      const logos = collectLogos(cell);
      const list = document.createElement('ul');
      list.className = 'columns-logos-list';
      logos.forEach((logo) => {
        const li = document.createElement('li');
        if (logo.tagName === 'A' && !logo.querySelector('img, span.icon')) li.classList.add('columns-logos-text');
        nameLogo(logo);
        li.append(logo);
        list.append(li);
      });

      // whatever remains (heading, intro text) stays above the logos
      [...cell.children].forEach((child) => {
        if (child.textContent.trim() || child.querySelector('img')) col.append(child);
      });
      if (list.children.length) col.append(list);
      cols.push(col);
    });
  });

  block.classList.add(`columns-logos-${cols.length}-cols`);
  block.replaceChildren(...cols);
  decorateExternalLinks(block);
}
