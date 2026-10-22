import { cleanText } from '../../scripts/block-config.js';

/**
 * Jump links: links to places on the same page (Lufthansa maui-navigation-link
 * variant="anchor-down" in an .imagelinklist or a column view), each with a down arrow.
 * Every link of the block becomes one list item, whatever rows or cells it was authored in.
 * Default: one row that wraps (.link-list .horizontal); option "columns": equal columns,
 * one per link (column view items).
 * @param {Element} block
 */
export default function decorate(block) {
  const links = [...block.querySelectorAll('a[href]')].filter((a) => cleanText(a));
  if (!links.length) {
    (block.closest('.jump-links-wrapper') || block).remove();
    return;
  }
  const list = document.createElement('ul');
  list.className = 'jump-links-list';
  links.forEach((a) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = cleanText(a);
    if (a.title && a.title !== link.textContent) link.title = a.title;
    li.append(link);
    list.append(li);
  });
  block.style.setProperty('--jump-links-count', links.length);
  block.replaceChildren(list);
}
