/*
 * The menu in the bar (scripts/brands.js header.menu 'bar': Lufthansa Group for Business), as
 * business.lufthansagroup.com's header: the nav document's top items as buttons in the bar, each
 * opening a drop-down panel below the bar with its sections (a title and its links). One open at a
 * time; a second click, Escape (the focus back on the button) or a click outside closes it. From
 * 1025px; below, the Menu button's flyout lists the same items (blocks/header/header.css).
 */

let count = 0;

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (v === false || v === null || v === undefined) return;
    if (k === 'className') node.className = v;
    else node.setAttribute(k, v === true ? '' : v);
  });
  children.flat().forEach((c) => {
    if (c === null || c === undefined || c === '') return;
    node.append(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return node;
}

/**
 * The bar's menu.
 * @param {Array<{label: string, link: HTMLAnchorElement|null, groups: Array<{label: string,
 *   links: HTMLAnchorElement[]}>}>} items the nav document's menu (header.js readMenu)
 * @param {{link: Function}} opts link(href, label, className): a link as the header makes them
 *   (external ones in a new tab)
 * @returns {{root: HTMLUListElement, close: Function}}
 */
export default function buildBarMenu(items, { link }) {
  const root = el('ul', { className: 'nav-bar-menu' });
  const entries = [];
  const close = (entry = null, focus = false) => {
    entries.filter((x) => !entry || x === entry).forEach((x) => {
      x.button.setAttribute('aria-expanded', 'false');
      x.panel.hidden = true;
      if (focus) x.button.focus();
    });
  };
  items.forEach((item) => {
    if (!item.groups.length) {
      if (item.link) root.append(el('li', { className: 'nav-bar-menu-item' }, link(item.link.getAttribute('href'), item.label, 'nav-bar-menu-link')));
      return;
    }
    count += 1;
    const id = `nav-dropdown-${count}`;
    const button = el('button', {
      type: 'button', className: 'nav-bar-menu-button', 'aria-expanded': 'false', 'aria-controls': id,
    }, item.label);
    const sections = item.groups.map((g) => el(
      'div',
      { className: 'nav-dropdown-section' },
      g.label ? el('h3', { className: 'nav-dropdown-title' }, g.label) : null,
      el('ul', { className: 'nav-dropdown-list' }, g.links.map((a) => el('li', {}, link(a.getAttribute('href'), a.textContent.replace(/\s+/g, ' ').trim(), 'nav-dropdown-link')))),
    ));
    const panel = el('div', { id, className: 'nav-dropdown' }, el('div', { className: 'nav-dropdown-inner' }, sections));
    panel.hidden = true;
    const entry = { button, panel };
    entries.push(entry);
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') === 'true';
      close();
      if (open) return;
      button.setAttribute('aria-expanded', 'true');
      panel.hidden = false;
    });
    panel.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close(entry, true);
    });
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !panel.hidden) close(entry, true);
    });
    root.append(el('li', { className: 'nav-bar-menu-item' }, button, panel));
  });
  document.addEventListener('click', (e) => {
    if (!root.contains(e.target)) close();
  });
  return { root, close: () => close() };
}
