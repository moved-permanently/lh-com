/*
 * Air Dolomiti's desktop menu (header.js on the brand airdolomiti), as www.airdolomiti.it's
 * (1440 px, 2026-11-04): the nav document's top items (Esplora, Prenota e Gestisci, In viaggio)
 * as buttons in the bar, each opening a full-width panel under the bar:
 * - its columns: a grey title (a link where the document links it) and its links; a column
 *   without a title holds bold links and sits under the column before it (www's list-bold);
 * - the column with a picture: an image card, its title as a beige chip, its link as a button;
 * - the quick actions (the column whose links carry an icon, in any tab): the teal column on the
 *   right of every panel, as www repeats it.
 * One open at a time; a second click, Escape (the focus back on its button) or a click outside
 * closes it. From 1025px (header-airdolomiti.css); below, the Menu button's flyout lists the same
 * items (header.js readMenu).
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

const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim();
const children = (node, tag) => [...node.children].filter((c) => c.tagName === tag);

/** header-airdolomiti.css, once. */
function loadMenuCss() {
  const href = `${(window.hlx && window.hlx.codeBasePath) || ''}/blocks/header/header-airdolomiti.css`;
  if (document.querySelector(`link[href="${href}"]`)) return;
  document.head.append(el('link', { rel: 'stylesheet', href }));
}

/**
 * The menu section read as tabs.
 * @param {Element} section the nav document's menu section
 * @returns {{tabs: Array<{label: string, columns: Array<Array<{label: string, href: string|null,
 *   bold: boolean, links: Array<{href: string, label: string}>}>>, card: {title: string,
 *   picture: Element, href: string, cta: string}|null}>, quick: {label: string,
 *   links: Array<{href: string, label: string, icon: Element|null}>}|null}}
 */
export function readAirDolomitiMenu(section) {
  const list = section && section.querySelector('ul');
  let quick = null;
  const tabs = (list ? children(list, 'LI') : []).map((li) => {
    const paras = children(li, 'P');
    const label = clean((paras[0] || li.firstChild || {}).textContent);
    const columns = [];
    let card = null;
    const cols = li.querySelector(':scope > ul');
    (cols ? children(cols, 'LI') : []).forEach((col) => {
      const ps = children(col, 'P');
      const head = ps.find((p) => !p.querySelector('picture, img'));
      const picture = ps.map((p) => p.querySelector('picture, img')).find(Boolean);
      const anchors = [...col.querySelectorAll(':scope > ul > li a[href]')];
      const links = anchors.map((a) => ({ href: a.getAttribute('href'), label: clean(a.textContent) }));
      if (picture) {
        card = {
          title: clean(head && head.textContent), picture, href: links[0] ? links[0].href : null, cta: links[0] ? links[0].label : '',
        };
        return;
      }
      if (anchors.some((a) => a.querySelector('picture, img'))) {
        quick = quick || {
          label: clean(head && head.textContent),
          links: anchors.map((a, i) => ({ ...links[i], icon: a.querySelector('picture, img') })),
        };
        return;
      }
      if (!links.length) return;
      const titleLink = head && head.querySelector('a[href]');
      const group = {
        label: clean(head && head.textContent), href: titleLink ? titleLink.getAttribute('href') : null, bold: false, links,
      };
      group.bold = !group.label;
      if (group.bold && columns.length) columns[columns.length - 1].push(group);
      else columns.push([group]);
    });
    return { label, columns, card };
  }).filter((t) => t.label);
  return { tabs, quick };
}

function quickColumn(quick, link) {
  if (!quick) return null;
  return el(
    'div',
    { className: 'nav-ad-quick' },
    quick.label ? el('p', { className: 'nav-ad-quick-title' }, quick.label) : null,
    el('ul', { className: 'nav-ad-quick-list' }, quick.links.map((l) => {
      const a = link(l.href, l.label, 'nav-ad-quick-link');
      if (l.icon) {
        const icon = l.icon.cloneNode(true);
        const img = icon.tagName === 'IMG' ? icon : icon.querySelector('img');
        if (img) {
          img.alt = '';
          img.loading = 'lazy';
        }
        a.prepend(icon);
      }
      return el('li', {}, a);
    })),
  );
}

/**
 * Air Dolomiti's menu in the bar.
 * @param {Element} section the nav document's menu section
 * @param {{link: Function}} opts link(href, label, className): a link as the header makes them
 *   (external ones in a new tab)
 * @returns {{root: HTMLUListElement, close: Function}}
 */
export function buildAirDolomitiMenu(section, { link }) {
  loadMenuCss();
  const { tabs, quick } = readAirDolomitiMenu(section);
  const root = el('ul', { className: 'nav-ad-menu' });
  const entries = [];
  const close = (entry = null, focus = false) => {
    entries.filter((x) => !entry || x === entry).forEach((x) => {
      x.button.setAttribute('aria-expanded', 'false');
      x.panel.hidden = true;
      if (focus) x.button.focus();
    });
  };
  tabs.forEach((tab) => {
    count += 1;
    const id = `nav-ad-panel-${count}`;
    const button = el('button', {
      type: 'button', className: 'nav-ad-menu-button', 'aria-expanded': 'false', 'aria-controls': id,
    }, tab.label);
    const columns = tab.columns.map((groups) => el('div', { className: 'nav-ad-column' }, groups.map((g) => el(
      'div',
      { className: g.bold ? 'nav-ad-group nav-ad-group-bold' : 'nav-ad-group' },
      g.label ? el('p', { className: 'nav-ad-group-title' }, g.href ? link(g.href, g.label, 'nav-ad-group-link') : g.label) : null,
      el('ul', { className: 'nav-ad-list' }, g.links.map((l) => el('li', {}, link(l.href, l.label, g.bold ? 'nav-ad-link nav-ad-link-bold' : 'nav-ad-link')))),
    ))));
    let card = null;
    if (tab.card) {
      const picture = tab.card.picture.cloneNode(true);
      const img = picture.tagName === 'IMG' ? picture : picture.querySelector('img');
      if (img) {
        img.alt = '';
        img.loading = 'lazy';
      }
      card = el(
        'div',
        { className: 'nav-ad-card' },
        picture,
        tab.card.title ? el('p', { className: 'nav-ad-card-title' }, tab.card.title) : null,
        tab.card.href ? link(tab.card.href, tab.card.cta, 'nav-ad-card-cta') : null,
      );
    }
    const panel = el(
      'div',
      { id, className: 'nav-ad-panel' },
      el('div', { className: 'nav-ad-panel-main' }, columns, card),
      quickColumn(quick, link),
    );
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
    root.append(el('li', { className: 'nav-ad-menu-item' }, button, panel));
  });
  document.addEventListener('click', (e) => {
    if (!root.contains(e.target)) close();
  });
  return { root, close: () => close() };
}
