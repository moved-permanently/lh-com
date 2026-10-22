import { cleanText } from '../../scripts/block-config.js';

/**
 * Crumbs of the authored block: the items of a list, else every link or text paragraph of the
 * cells in order. Empty items are skipped.
 * @param {Element} block
 * @returns {{label: string, href: string}[]}
 */
function readCrumbs(block) {
  const items = [...block.querySelectorAll('li')];
  const nodes = items.length
    ? items
    : [...block.querySelectorAll(':scope > div > div')].flatMap((cell) => {
      const parts = [...cell.querySelectorAll('p, a')].filter((n) => n.tagName === 'P' || !n.closest('p'));
      return parts.length ? parts : [cell];
    });
  return nodes.map((node) => {
    const link = node.tagName === 'A' ? node : node.querySelector('a[href]');
    return { label: cleanText(link || node), href: link ? link.getAttribute('href') : '' };
  }).filter((c) => c.label);
}

/**
 * Breadcrumb ("Home > Airport information > Boarding") of the live pages (maui-breadcrumb on
 * AEM pages, nav.breadcrumb on AirCore): one cell with a list of links, the last item is the
 * current page. Desktop shows the whole trail; small screens show only the parent as a back
 * link, like the live site.
 * @param {Element} block
 */
export default function decorate(block) {
  const crumbs = readCrumbs(block);
  if (!crumbs.length) {
    block.remove();
    return;
  }
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', document.documentElement.lang === 'de' ? 'Brotkrümelnavigation' : 'Breadcrumb');
  const ol = document.createElement('ol');
  crumbs.forEach(({ label, href }, i) => {
    const li = document.createElement('li');
    li.className = 'breadcrumb-item';
    const current = i === crumbs.length - 1;
    if (current) {
      li.classList.add('breadcrumb-current');
      const span = document.createElement('span');
      span.setAttribute('aria-current', 'page');
      span.textContent = label;
      li.append(span);
    } else {
      if (i === crumbs.length - 2) li.classList.add('breadcrumb-parent');
      const el = document.createElement(href ? 'a' : 'span');
      if (href) el.href = href;
      el.textContent = label;
      li.append(el);
    }
    ol.append(li);
  });
  nav.append(ol);
  block.replaceChildren(nav);
}
