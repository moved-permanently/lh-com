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
  pt: { search: 'Pesquisar', account: 'Login' },
  en: { search: 'Search', account: 'Login' },
  es: { search: 'Buscar', account: 'Iniciar sesión' },
  fr: { search: 'Rechercher', account: 'Se connecter' },
  de: { search: 'Suchen', account: 'Anmelden' },
  it: { search: 'Cerca', account: 'Accedi' },
  pl: { search: 'Szukaj', account: 'Zaloguj się' },
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
