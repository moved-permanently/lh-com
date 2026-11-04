/*
 * TAP Air Portugal's header (scripts/brands.js tap header.layout 'tap'), as www.flytap.com's
 * (2026-11-04, 1440 and 390 px): a white pill bar with the logo, www's top-level menu in the bar
 * (Planear viagem, Os meus voos, Check-in, TAP Miles&Go, Ajuda: the nav document's menu, Check-in
 * from its quick action while the menu lacks it), then search, account and the market on the right
 * (search and account open panels on www that the replica doesn't have: links to www's same root),
 * the burger below 1025 px only. On a root's homepage the bar floats inside the top of the stage
 * (www: 16 px below the stage's top edge, scrolling with the page), on other pages it is fixed as
 * the other brands' floating bar. The look: styles/themes/tap.css.
 */

/** The bar's search and account texts in TAP's languages (www's aria labels; English else). */
export const TAP_HEADER_TEXTS = {
  pt: {
    search: 'Pesquisar', account: 'Login', close: 'Fechar', language: 'Português',
  },
  en: {
    search: 'Search', account: 'Login', close: 'Close', language: 'English',
  },
  es: {
    search: 'Buscar', account: 'Iniciar sesión', close: 'Cerrar', language: 'Español',
  },
  fr: {
    search: 'Rechercher', account: 'Se connecter', close: 'Fermer', language: 'Français',
  },
  de: {
    search: 'Suchen', account: 'Anmelden', close: 'Schließen', language: 'Deutsch',
  },
  it: {
    search: 'Cerca', account: 'Accedi', close: 'Chiudi', language: 'Italiano',
  },
  pl: {
    search: 'Szukaj', account: 'Zaloguj się', close: 'Zamknij', language: 'Polski',
  },
};

const WWW = 'https://www.flytap.com';
const CHECK_IN = /#special-anchor-check-in\b/;

const hasCheckIn = (item) => CHECK_IN.test(item.link ? item.link.getAttribute('href') || '' : '')
  || item.groups.some((g) => g.links.some((a) => CHECK_IN.test(a.getAttribute('href') || '')))
  || /^check-?in$/i.test(item.label.trim());

/**
 * www's top-level menu: the nav document's menu, and its Check-in quick action third (www's order:
 * after Os meus voos) while the menu has no Check-in of its own.
 * @param {Array<{label: string, link: Element|null, groups: Array}>} items header.js readMenu
 * @param {Element[]} quickLinks the quick actions' links
 * @returns {Array} the bar's items
 */
export function tapMenuItems(items, quickLinks) {
  if (items.some(hasCheckIn)) return items;
  const checkIn = quickLinks.find((a) => CHECK_IN.test(a.getAttribute('href') || ''));
  if (!checkIn) return items;
  const out = [...items];
  const item = { label: checkIn.textContent.trim(), link: checkIn, groups: [] };
  out.splice(Math.min(2, out.length), 0, item);
  return out;
}

/**
 * The bar's search and account: links to www's same root (www opens its panels there).
 * @param {{base: string, lang: string}} locale getLocale() (base: the root's path, /pt-pt)
 * @returns {Array<{role: string, icon: string, label: string, href: string}>}
 */
export function tapBarTools(locale) {
  const texts = TAP_HEADER_TEXTS[locale.lang] || TAP_HEADER_TEXTS.en;
  const href = `${WWW}${locale.base}`;
  return [
    {
      role: 'search', icon: 'search', label: texts.search, href,
    },
    {
      role: 'account', icon: 'login', label: texts.account, href,
    },
  ];
}

const ROOT = /^\/[a-z]{2}-[a-z]{2}(?=\/|$)/;

/**
 * The page's root: its first segment when that is a root's (/pt-br), else the locale's base (a
 * root the locale table doesn't know yet reads as another one's: pt-br as /pt-pt).
 */
export function tapRoot(pathname, base) {
  const m = pathname.match(ROOT);
  return m ? m[0] : base;
}

/** Whether the page is a root's homepage (/pt-pt). */
export function isTapHome(pathname, base) {
  const root = tapRoot(pathname, base);
  return Boolean(root) && pathname.replace(/\/+$/, '') === root;
}

/* ------------------------------------------------------------------ the menu --------- */

// www's chevron before a column's heading, its banner card's corner and arc (TAP green #65C922)
const CHEVRON = '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill-rule="evenodd" clip-rule="evenodd" d="M13.4086 22H6L10.5249 12.2992C10.6133 12.1099 10.6133 11.8904 10.5249 11.7008L6 2H13.4086L17.9335 11.7008C18.0222 11.8904 18.0222 12.1099 17.9335 12.2992L13.4086 22Z" fill="#65C922"/></svg>';
const CORNER = '<svg class="tap-menu-banner-corner" width="105" height="60" viewBox="0 0 105 60" aria-hidden="true" focusable="false"><path d="M105 0L0.000488281 60V0H105Z" fill="#65C922"/></svg>';
const ARC = '<svg class="tap-menu-banner-arc" width="272" height="71" viewBox="0 0 272 71" fill="none" aria-hidden="true" focusable="false"><path d="M-72.9995 150.473L227.503 5.12972C233.375 2.28942 240.175 2.28942 246.046 5.12972L546.548 150.473" stroke="#65C922" stroke-width="5"/></svg>';

const text = (n) => (n ? n.textContent.replace(/\s+/g, ' ').trim() : '');
const children = (n, tag) => (n ? [...n.children].filter((c) => c.tagName === tag) : []);
/** An item's own line: its first paragraph, else its own link (a list item without paragraphs). */
const ownLine = (li) => li.querySelector(':scope > p') || li.querySelector(':scope > a');
const hrefOf = (n) => {
  const a = n && (n.tagName === 'A' ? n : n.querySelector('a'));
  return a ? a.getAttribute('href') : null;
};

/**
 * The nav document's menu as tools/importer/tap-nav.mjs writes it: www's top level, each item a
 * title (a link: Check-in), its columns (the heading linking the column's page, its links, a
 * "See all" paragraph after them) and its banner row (a picture, the bold title, a line, a link).
 * @param {Element} section the nav document's menu section
 * @returns {Array<{label: string, link: string|null, cols: Array<{label: string, href: string|null,
 *   links: Array<{label: string, href: string}>, seeAll: {label: string, href: string}|null}>,
 *   banner: {img: {src: string, alt: string}|null, title: string, line: string,
 *   cta: {label: string, href: string}|null}|null}>}
 */
export function readTapMenu(section) {
  const list = section && section.querySelector('ul');
  return children(list, 'LI').map((li) => {
    const own = ownLine(li);
    const cols = [];
    let banner = null;
    children(li.querySelector(':scope > ul'), 'LI').forEach((c) => {
      const title = c.querySelector(':scope > p > strong, :scope > strong');
      if (title) {
        const img = c.querySelector('img');
        const paras = children(c, 'P').filter((p) => !p.querySelector('img') && !p.querySelector('strong'));
        const ctaP = paras.find((p) => p.querySelector('a'));
        banner = {
          img: img ? { src: img.getAttribute('src'), alt: img.getAttribute('alt') || '' } : null,
          title: text(title),
          line: text(paras.find((p) => !p.querySelector('a'))),
          cta: ctaP ? { label: text(ctaP), href: hrefOf(ctaP) } : null,
        };
        return;
      }
      const head = ownLine(c);
      const all = c.querySelector(':scope > ul + p');
      cols.push({
        label: text(head),
        href: hrefOf(head),
        links: [...c.querySelectorAll(':scope > ul > li > a')].map((a) => ({ label: text(a), href: a.getAttribute('href') })),
        seeAll: all && hrefOf(all) ? { label: text(all), href: hrefOf(all) } : null,
      });
    });
    return {
      label: text(own), link: hrefOf(own), cols, banner,
    };
  }).filter((item) => item.label);
}

/**
 * The market's flag the nav document carries (tap-nav.mjs: the menu's last row, a picture only).
 * @param {Element} section the nav document's menu section
 * @returns {{src: string, alt: string}|null}
 */
export function readTapFlag(section) {
  const list = section && section.querySelector('ul');
  const row = children(list, 'LI').find((li) => !li.querySelector(':scope > ul') && li.querySelector(':scope > p > img, :scope > img') && !text(li));
  const img = row && row.querySelector('img');
  return img ? { src: img.getAttribute('src'), alt: img.getAttribute('alt') || '' } : null;
}

/**
 * www's quick-action tab on inner pages: the booking box's four tabs (www's texts per language,
 * tools/reports/tap/booking-labels.json; pt-br its own), each a link to the root homepage's box.
 */
export const TAP_QUICK_TABS = {
  pt: ['Reservar voo', 'Fazer Check-in', 'Gerir reserva', 'Estado do voo'],
  br: ['Reservar voo', 'Check-in', 'Gerenciar reserva', 'Status do voo'],
  en: ['Book flight', 'Check-in', 'Manage booking', 'Flight status'],
  es: ['Reservar vuelo', 'Check-in', 'Gestionar reserva', 'Estado del vuelo'],
  fr: ['Réserver un vol', 'Enregistrement', 'Gérer la réservation', 'Statut du vol'],
  de: ['Flug buchen', 'Check-in', 'Buchung verwalten', 'Flugstatus'],
  it: ['Prenoti il volo', 'Il Check-in', 'Gestire la prenotazione', 'Stato del volo'],
  pl: ['Zarezerwuj lot', 'Odprawa', 'Zarządzaj rezerwacją', 'Status lotu'],
};
// the tabs' anchors on the homepage's box (booking-box.js) and www's icons (outline, 20 px)
const QUICK = [
  ['book-flight', '<path d="M2.5 19h19v2h-19zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.43-1.93.51 4.14 7.17-4.97 1.33-1.97-1.54-1.45.39 2.59 4.49 16.57-4.43c.81-.23 1.28-1.05 1.07-1.85z"/>'],
  ['check-in', '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-1.5-5.59-3.3-3.3-1.4 1.42 4.7 4.7 7.7-7.7-1.4-1.42z"/>'],
  ['my-travels', '<path d="M22 10V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4a2 2 0 0 1 0 4v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 1 0-4zm-2-1.46a4 4 0 0 0 0 6.92V18H4v-2.54a4 4 0 0 0 0-6.92V6h16zM11 15h2v2h-2zm0-4h2v2h-2zm0-4h2v2h-2z"/>'],
  ['flight-status', '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>'],
];

const pathOf = () => (window.location && window.location.pathname) || '';

/** The quick-action tab of a page (its root's homepage box, its language); null on a homepage. */
export function tapQuickTabs(pathname) {
  const r = tapRoot(pathname, '');
  if (!r || isTapHome(pathname, r)) return null;
  const texts = TAP_QUICK_TABS[r === '/pt-br' ? 'br' : r.slice(1, 3)] || TAP_QUICK_TABS.en;
  return QUICK.map(([tab, icon], i) => ({
    tab, icon, label: texts[i], href: `${r}#${tab}`,
  }));
}

let menus = 0;

function node(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (v === null || v === undefined || v === false) return;
    if (k === 'className') n.className = v;
    else if (k === 'html') n.innerHTML = v;
    else n.setAttribute(k, v === true ? '' : v);
  });
  kids.flat().forEach((c) => { if (c) n.append(typeof c === 'string' ? document.createTextNode(c) : c); });
  return n;
}

/** header-tap.css, once (TAP's menu; the theme styles/themes/tap.css is not for it). */
function loadMenuCss() {
  const href = `${(window.hlx && window.hlx.codeBasePath) || ''}/blocks/header/header-tap.css`;
  if (document.querySelector(`link[href="${href}"]`)) return;
  document.head.append(node('link', { rel: 'stylesheet', href }));
}

/**
 * TAP's menu, as www.flytap.com's: in the bar from 1025 px a button per top item opening its
 * panel under the bar (the columns as wide as their content, TAP's chevron before each heading,
 * "See all" where www shows it, the banner card on the right), one open at a time, Escape or a
 * click outside closing it; below 1025 px the menu button opens the same items as www's
 * accordion in a card (an item opens its columns, a column its links). An item without columns
 * is a link (an older nav document's Check-in: its quick action, third).
 * @param {Element} section the nav document's menu section
 * @param {{link: Function, menuButton: Element, quickLinks?: Element[]}} opts link(href, label,
 *   className): a link as the header makes them; menuButton: the bar's menu (burger) button
 * @returns {{root: HTMLUListElement, close: Function}}
 */
export function buildTapMenu(section, { link, menuButton, quickLinks = [] }) {
  loadMenuCss();
  const items = readTapMenu(section);
  // the Check-in item: www's anchor or the homepage's box (/<root>#check-in), in any language
  const isCheckIn = (href) => CHECK_IN.test(href || '') || /#check-in$/.test(href || '');
  if (!items.some((i) => isCheckIn(i.link) || /^check-?in$/i.test(i.label))) {
    const checkIn = quickLinks.find((a) => isCheckIn(a.getAttribute('href')));
    if (checkIn) {
      items.splice(Math.min(2, items.length), 0, {
        label: text(checkIn), link: checkIn.getAttribute('href'), cols: [], banner: null,
      });
    }
  }
  const root = node('ul', { className: 'nav-bar-menu tap-menu' });
  const entries = [];
  const close = (entry = null, focus = false) => {
    entries.filter((x) => !entry || x === entry).forEach((x) => {
      x.button.setAttribute('aria-expanded', 'false');
      x.panel.hidden = true;
      if (focus) x.button.focus();
    });
  };
  items.forEach((item) => {
    if (!item.cols.length && !item.banner) {
      if (item.link) root.append(node('li', { className: 'nav-bar-menu-item' }, link(item.link, item.label, 'nav-bar-menu-link')));
      return;
    }
    menus += 1;
    const id = `tap-menu-${menus}`;
    const button = node('button', {
      type: 'button', className: 'nav-bar-menu-button', 'aria-expanded': 'false', 'aria-controls': id,
    }, item.label);
    const cols = item.cols.map((c, i) => {
      const linksId = `${id}-col-${i}`;
      const toggle = node('button', {
        type: 'button', className: 'tap-menu-col-toggle', 'aria-expanded': 'false', 'aria-controls': linksId,
      }, c.label);
      const heading = c.href ? link(c.href, c.label, 'tap-menu-heading') : node('span', { className: 'tap-menu-heading' }, c.label);
      heading.prepend(node('span', { className: 'tap-menu-chevron', html: CHEVRON }));
      const body = node(
        'div',
        { className: 'tap-menu-col-body', id: linksId },
        c.links.length ? node('ul', { className: 'tap-menu-links' }, c.links.map((l) => node('li', {}, link(l.href, l.label, 'tap-menu-link')))) : null,
        c.seeAll ? link(c.seeAll.href, c.seeAll.label, 'tap-menu-see-all') : null,
      );
      const col = node('div', { className: `tap-menu-col${c.links.length ? '' : ' tap-menu-col-single'}` }, heading, c.links.length ? toggle : null, body);
      toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') !== 'true';
        toggle.setAttribute('aria-expanded', String(open));
        col.classList.toggle('is-open', open);
      });
      return col;
    });
    const b = item.banner;
    const banner = b ? node(
      'div',
      { className: 'tap-menu-banner' },
      node(
        'div',
        { className: 'tap-menu-banner-card' },
        b.img ? node('img', {
          src: b.img.src, alt: b.img.alt, loading: 'lazy', width: 266, height: 224,
        }) : null,
        node('span', { className: 'tap-menu-banner-shapes', html: `${CORNER}${ARC}` }),
        node(
          'div',
          { className: 'tap-menu-banner-text' },
          node('p', { className: 'tap-menu-banner-title' }, b.title),
          b.line ? node('p', { className: 'tap-menu-banner-line' }, b.line) : null,
          b.cta ? link(b.cta.href, b.cta.label, 'tap-menu-banner-cta') : null,
        ),
      ),
    ) : null;
    const panel = node('div', { id, className: 'tap-menu-panel' }, node('div', { className: 'tap-menu-cols' }, cols), banner);
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
    panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(entry, true); });
    button.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) close(entry, true); });
    root.append(node('li', { className: 'nav-bar-menu-item' }, button, panel));
  });
  // the market button as www's: the market's flag (the nav document's) and the page's language
  // ("DE" on de-ch) in place of the globe and the country; the bar is built right after the menu
  const flag = readTapFlag(section);
  const flagEl = () => node('span', { className: 'tap-flag' }, node('img', {
    src: flag.src, alt: '', width: 20, height: 20,
  }));
  Promise.resolve().then(() => {
    const bar = root.closest('.nav-bar') || document;
    const button = bar.querySelector('.nav-languages-button');
    if (!button || button.classList.contains('tap-market')) return;
    button.classList.add('tap-market');
    if (flag) {
      const icon = button.querySelector(':scope > svg, :scope > .lh-icon, :scope > .icon');
      if (icon) icon.replaceWith(flagEl());
      else button.prepend(flagEl());
    }
    const current = button.querySelector('.nav-languages-current');
    const r = tapRoot(pathOf(), '');
    const lang = (r ? r.slice(1, 3) : (document.documentElement.lang || '').slice(0, 2)).toUpperCase();
    if (current && lang) current.textContent = lang;
  });
  // inner pages: www's quick-action tab under the bar (header-tap.css keeps the room for it)
  Promise.resolve().then(() => {
    const tabs = tapQuickTabs(pathOf());
    const wrapper = root.closest('.nav-wrapper');
    if (!tabs || !wrapper || wrapper.querySelector('.tap-quick')) return;
    wrapper.append(node('nav', { className: 'tap-quick', 'aria-label': tabs.map((t) => t.label).join(', ') }, node('ul', {}, tabs.map((t) => node(
      'li',
      {},
      node('a', { href: t.href, className: 'tap-quick-link' }, node('span', { className: 'tap-quick-icon', html: `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">${t.icon}</svg>` }), node('span', { className: 'tap-quick-label' }, t.label)),
    )))));
    const header = wrapper.closest('header');
    if (header) header.classList.add('tap-has-quick');
  });
  // phones: the card's last row, www's market ("PT, English"): the bar's language list (its links
  // as the header has set them when the row opens: the page's counterparts)
  const texts = TAP_HEADER_TEXTS[(document.documentElement.lang || '').slice(0, 2)] || TAP_HEADER_TEXTS.en;
  const marketList = node('ul', { className: 'tap-menu-market-list', id: `tap-menu-market-${menus}` });
  marketList.hidden = true;
  const marketButton = node('button', {
    type: 'button', className: 'tap-menu-market-button', 'aria-expanded': 'false', 'aria-controls': marketList.id,
  });
  const market = node('li', { className: 'nav-bar-menu-item tap-menu-market' }, marketButton, marketList);
  root.append(market);
  const barLanguages = () => document.querySelector('header .nav-languages');
  const fillMarket = () => {
    const bar = barLanguages();
    const links = bar ? [...bar.querySelectorAll('.nav-languages-list a[href]')] : [];
    market.hidden = !links.length;
    if (!links.length) return;
    const root0 = tapRoot(pathOf(), '');
    const country = (root0 ? root0.split('-')[1] : (bar.querySelector('.nav-languages-current') || {}).textContent || '').toUpperCase();
    const globe = bar.querySelector('.nav-languages-button .tap-flag, .nav-languages-button svg, .nav-languages-button .lh-icon');
    const mark = flag ? flagEl() : globe && globe.cloneNode(true);
    marketButton.replaceChildren(...(mark ? [mark] : []), node('span', {}, `${country}, ${texts.language}`));
    marketList.replaceChildren(...links.map((a) => node('li', {}, node('a', { href: a.getAttribute('href'), lang: a.getAttribute('lang'), className: 'tap-menu-market-link' }, text(a)))));
  };
  marketButton.addEventListener('click', () => {
    const open = marketButton.getAttribute('aria-expanded') !== 'true';
    if (open) fillMarket();
    marketButton.setAttribute('aria-expanded', String(open));
    marketList.hidden = !open;
  });
  document.addEventListener('click', (e) => {
    if (!root.contains(e.target) && !(menuButton && menuButton.contains(e.target))) close();
  });
  // phones: the menu button opens the menu as a card under the bar; while it is open the button
  // shows www's close icon and says so
  if (menuButton) {
    let menuLabel = null;
    menuButton.addEventListener('click', () => {
      const open = !root.classList.contains('is-open');
      root.classList.toggle('is-open', open);
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.classList.toggle('tap-menu-open', open);
      if (open) {
        menuLabel = menuButton.getAttribute('aria-label');
        menuButton.setAttribute('aria-label', texts.close);
        fillMarket();
      } else {
        if (menuLabel !== null) menuButton.setAttribute('aria-label', menuLabel);
        close();
      }
    });
  }
  return { root, close: () => close() };
}

/**
 * On a homepage the bar floats inside the stage's top: the header's class tap-home (no room kept
 * above the stage), and the stage's top (document coordinates) as --tap-stage-top, kept up to date
 * as the page above it changes (an alerts bar loading, a resize).
 * @param {Document} doc
 */
export function floatInStage(doc = document) {
  const stage = () => doc.querySelector('main .hero-campaign.slider');
  const header = doc.querySelector('header');
  const update = () => {
    const s = stage();
    if (header) header.classList.toggle('tap-home', Boolean(s));
    if (!s) return;
    const top = Math.round(s.getBoundingClientRect().top + window.scrollY);
    doc.body.style.setProperty('--tap-stage-top', `${top}px`);
  };
  update();
  window.addEventListener('resize', update, { passive: true });
  if (typeof ResizeObserver === 'function') {
    const main = doc.querySelector('main');
    if (main) new ResizeObserver(update).observe(main);
  }
}
