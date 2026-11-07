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
 * closes it. From 1025px (header-airdolomiti.css); below, the Menu button opens www's phone menu
 * (buildAirDolomitiPhoneMenu, brief 447) with the same items.
 * Below 1025px the bar as www's (parity rows 28 and 29): the logo, the plane button that opens the
 * booking panel, the Menu button with www's three lines; the accessibility settings move into the
 * phone menu (its text size row, under the language).
 */
import {
  CHANGE_EVENT, chooseAccessibility, LABELS as A11Y_LABELS, readChoice, SIZES,
} from '../../scripts/accessibility.js';

let count = 0;

// the flight search's request for its booking panel (OPEN_BOOKING of
// blocks/flight-search/flight-search-airdolomiti.js; not imported: the header doesn't load it)
const OPEN_BOOKING = 'airdolomiti:open-booking';
// www's plane button's name (its image's alt: airdolomiti-parity-001 *-home-390) and the
// booking page
const BOOK_LABELS = { it: 'Cerca un volo', en: 'Search a flight', de: 'Suche einen Flug' };
const BOOKING_PAGES = { it: '/prenotazioni', en: '/en/booking', de: '/de/buchung' };

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
      // one link per item (Edge Delivery renders an icon link as two: the picture's and the text's)
      const items = [...col.querySelectorAll(':scope > ul > li')].filter((item) => item.querySelector('a[href]'));
      const links = items.map((item) => ({ href: item.querySelector('a[href]').getAttribute('href'), label: clean(item.textContent) }));
      if (picture) {
        card = {
          title: clean(head && head.textContent), picture, href: links[0] ? links[0].href : null, cta: links[0] ? links[0].label : '',
        };
        return;
      }
      if (items.some((item) => item.querySelector('picture, img'))) {
        quick = quick || {
          label: clean(head && head.textContent),
          links: items.map((item, i) => ({ ...links[i], icon: item.querySelector('picture, img') })),
        };
        return;
      }
      if (!links.length) return;
      const titleLink = head && head.querySelector('a[href]');
      const href = titleLink ? titleLink.getAttribute('href') : null;
      // the column's last link to its title's page (www's "Vedi tutte" / "View all"): underlined
      links.forEach((l, i) => {
        l.more = Boolean(href) && i > 0 && i === links.length - 1 && l.href === href;
      });
      const group = {
        label: clean(head && head.textContent), href, bold: false, links,
      };
      group.bold = !group.label;
      if (group.bold && columns.length) columns[columns.length - 1].push(group);
      else columns.push([group]);
    });
    return { label, columns, card };
  }).filter((t) => t.label);
  return { tabs, quick };
}

/** A column's group: its grey title (a link where the document links it) and its links. */
function groupEl(g, link) {
  const linkClass = (l) => ['nav-ad-link', g.bold ? 'nav-ad-link-bold' : '', l.more ? 'nav-ad-link-more' : ''].filter(Boolean).join(' ');
  return el(
    'div',
    { className: g.bold ? 'nav-ad-group nav-ad-group-bold' : 'nav-ad-group' },
    g.label ? el('p', { className: 'nav-ad-group-title' }, g.href ? link(g.href, g.label, 'nav-ad-group-link') : g.label) : null,
    el('ul', { className: 'nav-ad-list' }, g.links.map((l) => el('li', {}, link(l.href, l.label, linkClass(l))))),
  );
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

// www's arrow (its buttons' and the phone menu's items'), its circled cross, search and globe
const SVG = {
  arrow: '<svg viewBox="0 0 28 28" fill="currentColor" aria-hidden="true" focusable="false"><path d="M26.7324 13.3308L13.5303 13.3308L1.99909 0L15.2013 0L26.7324 13.3308Z"/><path d="M1.99909 28L15.2013 28L26.7324 14.6692L13.5303 14.6692L1.99909 28Z"/></svg>',
  close: '<svg viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true" focusable="false"><circle cx="15" cy="15" r="13.3"/><path d="m10.5 10.5 9 9m0-9-9 9"/></svg>',
  search: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true" focusable="false"><circle cx="8.5" cy="8.5" r="6.5"/><path d="m13.5 13.5 5 5"/></svg>',
  globe: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="8.5"/><path d="M1.5 10h17M10 1.5c2.3 2.3 3.5 5.1 3.5 8.5s-1.2 6.2-3.5 8.5c-2.3-2.3-3.5-5.1-3.5-8.5S7.7 3.8 10 1.5Z"/></svg>',
  chevron: '<svg viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m3 5.5 4.5 4.5L12 5.5"/></svg>',
  // the bar's plane taking off (www's airplane-takeoff) and its menu's three 31px lines
  plane: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M14.6 10.3 19.4 9a2 2 0 1 1 1 3.9L6 16.8l-4.4-5 2.9-.8 2.4 1.4 2.9-.8-3.7-6.2 2.9-.8 5.6 5.7Z"/><path d="M3 21h18"/></svg>',
  menu: '<svg width="31" height="24" viewBox="0 0 31 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M1.5 3h28"/><path d="M1.5 12h28"/><path d="M1.5 21h28"/></svg>',
  // the text size (www's dimension icon: a large and a small A)
  size: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m1.5 16 4.5-12 4.5 12M3.2 11.5h5.6M12 16l3-8 3 8M13.1 13.2h3.8"/></svg>',
};

function svgIcon(name, className) {
  const span = el('span', { className: `nav-ad-icon ${className}`, 'aria-hidden': 'true' });
  span.innerHTML = SVG[name];
  return span;
}

/**
 * The phone bar as www's (below 1025px, header-airdolomiti.css): before the Menu button the plane
 * button (parity row 28), and the Menu button's icon www's three lines (row 29). The plane asks the
 * page's flight search for its booking panel (the focus comes back to the plane when it closes); a
 * page with the search in place gets the focus on its first field; a page without one goes to the
 * booking page.
 * @param {Element} tools the bar's tools (header.js nav-tools, with its Menu button)
 * @param {string} [lang] the page's language
 */
export function phoneBar(tools, lang = (document.documentElement.lang || 'it').slice(0, 2)) {
  const menuButton = tools.querySelector(':scope > .nav-menu-button');
  if (!menuButton) return;
  const plane = el('button', {
    type: 'button', className: 'nav-tool nav-ad-book', 'aria-label': BOOK_LABELS[lang] || BOOK_LABELS.it,
  }, svgIcon('plane', 'nav-ad-icon-plane'));
  plane.addEventListener('click', () => {
    const Custom = (document.defaultView && document.defaultView.CustomEvent) || CustomEvent;
    const ask = new Custom(OPEN_BOOKING, { cancelable: true, detail: { opener: plane } });
    document.dispatchEvent(ask);
    if (ask.defaultPrevented) return;
    // the departure field (the trip type's radios come before it)
    const field = document.querySelector('main .flight-search form .airport-combobox input')
      || document.querySelector('main .flight-search form input:not([type="hidden"])');
    if (field) {
      field.scrollIntoView({ block: 'center' });
      field.focus();
      return;
    }
    window.location.assign(BOOKING_PAGES[lang] || BOOKING_PAGES.it);
  });
  tools.insertBefore(plane, menuButton);
  const shared = menuButton.querySelector(':scope > svg, :scope > .lh-icon');
  const lines = svgIcon('menu', 'nav-ad-icon-menu').firstElementChild;
  lines.setAttribute('class', 'nav-ad-icon-menu');
  if (shared) shared.replaceWith(lines);
  else menuButton.prepend(lines);
}

/**
 * The bar's tools in the order www shows them: assistance, search, accessibility settings, the
 * language (then the divider and the Menu button), so the focus follows what shows (WCAG 2.4.3).
 * @param {Element} tools the bar's tools (header.js nav-tools)
 */
export function arrangeTools(tools) {
  const order = ['.nav-tool-accessibility', '.nav-tool-search', '.nav-accessibility-wrapper', '.nav-languages'];
  const found = order.map((sel) => tools.querySelector(`:scope > ${sel}`)).filter(Boolean);
  const start = [...tools.children].find((c) => found.includes(c));
  if (start) {
    // all of them, in www's order, where the first of them stood
    const mark = document.createComment('');
    tools.insertBefore(mark, start);
    found.forEach((node) => tools.insertBefore(node, mark));
    mark.remove();
  }
  phoneBar(tools);
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
    const columns = tab.columns.map((groups) => el('div', { className: 'nav-ad-column' }, groups.map((g) => groupEl(g, link))));
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

/* ------------------------------------------------------------------ phones ------------ */

// www's search field's placeholder (its NavBurger search, per language)
const SEARCH_PLACEHOLDER = {
  it: 'Inizia la ricerca...', en: 'Enter search term...', de: 'Suchbegriff eingeben...',
};

/**
 * Air Dolomiti's phone menu (below 1025px, header-airdolomiti.css), as www's: over the screen,
 * Close; the search field; the quick actions on teal; the menu's items, each opening its columns
 * under it (one at a time); under a line the languages behind the current one. The Menu button
 * opens it; Escape or Close closes it, the focus back on the button; Tab stays inside it.
 * @param {Element} section the nav document's menu section
 * @param {{link: Function, menuButton: Element, lang: string, labels: Object, search: string|null,
 *   languages: {current: string, links: Array<{label: string, lang: string, home: string,
 *   target?: Promise<string>}>}|null}} opts link(href, label, className) as the header makes
 *   them; labels: the header's (close, menu, search, languageCurrent); search: the bar's search
 *   page (the term in its query parameter); languages: the site's other languages
 * @returns {{root: HTMLElement, close: Function}}
 */
export function buildAirDolomitiPhoneMenu(section, {
  link, menuButton, lang, labels, search = null, languages = null,
}) {
  loadMenuCss();
  const { tabs, quick } = readAirDolomitiMenu(section);
  count += 1;
  const id = `nav-ad-phone-${count}`;
  const close = el('button', { type: 'button', className: 'nav-ad-phone-close' }, el('span', {}, labels.close), svgIcon('close', 'nav-ad-icon-close'));

  let form = null;
  if (search) {
    const placeholder = SEARCH_PLACEHOLDER[lang] || SEARCH_PLACEHOLDER.en;
    const input = el('input', {
      id: `${id}-search`, type: 'search', name: 'query', placeholder, autocomplete: 'off',
    });
    form = el(
      'form',
      { className: 'nav-ad-phone-search', role: 'search', action: search },
      el('label', { for: input.id, className: 'nav-sr-only' }, placeholder),
      input,
      el('button', { type: 'submit', 'aria-label': labels.search || placeholder }, svgIcon('search', 'nav-ad-icon-search')),
    );
    // as the footer's: the term in the search page's (empty) query parameter
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const term = input.value.trim();
      if (!term) {
        input.focus();
        return;
      }
      const url = new URL(search, window.location.href);
      url.searchParams.set('query', term);
      window.location.href = url.href;
    });
  }

  const items = [];
  const list = el('ul', { className: 'nav-ad-phone-items' }, tabs.map((tab, i) => {
    const subId = `${id}-sub-${i}`;
    const button = el(
      'button',
      {
        type: 'button', className: 'nav-ad-phone-item', 'aria-expanded': 'false', 'aria-controls': subId,
      },
      el('span', {}, tab.label),
      svgIcon('arrow', 'nav-ad-icon-arrow'),
    );
    const sub = el('div', { id: subId, className: 'nav-ad-phone-sub' }, tab.columns.flat().map((g) => groupEl(g, link)));
    sub.hidden = true;
    items.push({ button, sub });
    return el('li', {}, button, sub);
  }));
  const collapse = (except = null) => items.filter((x) => x !== except).forEach((x) => {
    x.button.setAttribute('aria-expanded', 'false');
    x.sub.hidden = true;
  });
  items.forEach((x) => x.button.addEventListener('click', () => {
    const open = x.button.getAttribute('aria-expanded') === 'true';
    collapse(x);
    x.button.setAttribute('aria-expanded', String(!open));
    x.sub.hidden = open;
  }));

  let langs = null;
  if (languages && languages.links.length) {
    const code = String(languages.current || lang || '').toUpperCase();
    const langList = el('ul', { id: `${id}-languages`, className: 'nav-ad-phone-languages' }, languages.links.map((l) => {
      const a = el('a', { href: l.home, lang: l.lang, hreflang: l.lang }, l.label);
      if (l.target) l.target.then((href) => { a.href = href; });
      return el('li', {}, a);
    }));
    langList.hidden = true;
    const langButton = el(
      'button',
      {
        type: 'button',
        className: 'nav-ad-phone-lang',
        'aria-expanded': 'false',
        'aria-controls': langList.id,
        'aria-label': labels.languageCurrent ? `${labels.languageCurrent} ${code}` : null,
      },
      svgIcon('globe', 'nav-ad-icon-globe'),
      el('span', {}, code),
      svgIcon('chevron', 'nav-ad-icon-chevron'),
    );
    langButton.addEventListener('click', () => {
      const open = langButton.getAttribute('aria-expanded') === 'true';
      langButton.setAttribute('aria-expanded', String(!open));
      langList.hidden = open;
    });
    langs = el('div', { className: 'nav-ad-phone-language' }, langButton, langList);
  }

  // www's text size row under the language ("Dimensione"; parity row 28): the accessibility
  // settings' three sizes (scripts/accessibility.js: the same choice as the bar's from 1025px)
  const a11y = A11Y_LABELS[lang] || A11Y_LABELS.en;
  const sizesId = `${id}-sizes`;
  const sizes = el('div', {
    id: sizesId, className: 'nav-ad-phone-sizes', role: 'radiogroup', 'aria-label': a11y.size,
  });
  const chosen = readChoice().size;
  const radios = SIZES.map((size) => {
    const input = el('input', {
      type: 'radio', name: sizesId, id: `${sizesId}-${size}`, value: size,
    });
    input.checked = chosen === size;
    const label = el('label', { for: input.id }, a11y[size]);
    sizes.append(el('div', { className: 'nav-ad-phone-size-option' }, input, label));
    return input;
  });
  sizes.hidden = true;
  sizes.addEventListener('change', (e) => {
    if (e.target.checked && SIZES.includes(e.target.value)) {
      chooseAccessibility({ size: e.target.value });
    }
  });
  document.addEventListener(CHANGE_EVENT, (e) => radios.forEach((r) => {
    r.checked = r.value === e.detail.size;
  }));
  const sizeButton = el(
    'button',
    {
      type: 'button',
      className: 'nav-ad-phone-lang nav-ad-phone-size',
      'aria-expanded': 'false',
      'aria-controls': sizesId,
    },
    svgIcon('size', 'nav-ad-icon-size'),
    el('span', {}, a11y.size),
    svgIcon('chevron', 'nav-ad-icon-chevron'),
  );
  sizeButton.addEventListener('click', () => {
    const open = sizeButton.getAttribute('aria-expanded') === 'true';
    sizeButton.setAttribute('aria-expanded', String(!open));
    sizes.hidden = open;
  });
  const sizesRow = el('div', { className: 'nav-ad-phone-sizes-row' }, sizeButton, sizes);

  const root = el(
    'div',
    {
      id, className: 'nav-ad-phone', role: 'dialog', 'aria-modal': 'true', 'aria-label': labels.menu,
    },
    el('div', { className: 'nav-ad-phone-top' }, close),
    form,
    quickColumn(quick, link),
    list,
    langs,
    sizesRow,
  );
  root.hidden = true;
  menuButton.setAttribute('aria-controls', id);

  const focusables = () => [...root.querySelectorAll('a[href], button, input')].filter((n) => !n.closest('[hidden]'));
  const hide = (restoreFocus = true) => {
    if (root.hidden) return;
    root.hidden = true;
    collapse();
    menuButton.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (restoreFocus) menuButton.focus();
  };
  const show = () => {
    root.hidden = false;
    menuButton.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    close.focus();
  };
  menuButton.addEventListener('click', () => (root.hidden ? show() : hide()));
  close.addEventListener('click', () => hide());
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      hide();
      return;
    }
    if (e.key !== 'Tab') return;
    // the focus stays inside while it is open (aria-modal)
    const nodes = focusables();
    const at = nodes.indexOf(document.activeElement);
    if (e.shiftKey && at <= 0) {
      e.preventDefault();
      nodes[nodes.length - 1].focus();
    } else if (!e.shiftKey && at === nodes.length - 1) {
      e.preventDefault();
      nodes[0].focus();
    }
  });
  // a link navigates: close without moving the focus back
  root.addEventListener('click', (e) => {
    if (e.target.closest && e.target.closest('a[href]')) hide(false);
  });
  // from 1025px the bar's menu: a menu left open closes
  const wide = window.matchMedia ? window.matchMedia('(width >= 1025px)') : null;
  if (wide && wide.addEventListener) wide.addEventListener('change', () => { if (wide.matches) hide(false); });
  return { root, close: () => hide(false) };
}
