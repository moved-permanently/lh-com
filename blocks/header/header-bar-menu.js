/*
 * The menu in the bar (scripts/brands.js header.menu 'bar': Lufthansa Group for Business), as
 * business.lufthansagroup.com's header: the nav document's top items as buttons in the bar, each
 * opening a drop-down panel below the bar with its sections (a title and its links). One open at a
 * time; a second click, Escape (the focus back on the button) or a click outside closes it. From
 * 1025px; below, the Menu button's flyout lists the same items (blocks/header/header.css).
 * Options (Lufthansa Cargo, brief 422, www.lufthansa-cargo.com's panels): a Close button at each
 * panel's top, a note below its sections (the nav document's menu paragraph: Cargo's access
 * note), and a lock at the links whose text holds a lock icon (:lock:, www's portal links).
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
 * @param {{link: Function, note?: Element|null, closeLabel?: string}} opts link(href, label,
 *   className): a link as the header makes them (external ones in a new tab); note: shown below
 *   each panel's sections (a copy each); closeLabel: a Close button in each panel
 * @returns {{root: HTMLUListElement, close: Function}}
 */
export default function buildBarMenu(items, { link, note = null, closeLabel = '' }) {
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
      el('ul', { className: 'nav-dropdown-list' }, g.links.map((a) => {
        const x = link(a.getAttribute('href'), a.textContent.replace(/\s+/g, ' ').trim(), 'nav-dropdown-link');
        if (a.querySelector('.icon-lock')) x.classList.add('nav-link-locked');
        return el('li', {}, x);
      })),
    ));
    const closer = closeLabel ? el('button', { type: 'button', className: 'nav-dropdown-close' }, closeLabel) : null;
    const extra = note ? el('p', { className: 'nav-dropdown-note' }, ...[...note.cloneNode(true).childNodes]) : null;
    const panel = el('div', { id, className: 'nav-dropdown' }, closer, el('div', { className: 'nav-dropdown-inner' }, sections), extra);
    panel.hidden = true;
    const entry = { button, panel };
    if (closer) closer.addEventListener('click', () => close(entry, true));
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
