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

/** The bar's search and account texts in TAP's languages (www's aria labels; English else), and the
 * skip link's (www's "Skip to main content", in each language; brief 363). */
export const TAP_HEADER_TEXTS = {
  pt: {
    search: 'Pesquisar', account: 'Login', close: 'Fechar', language: 'Português', skip: 'Ir para o conteúdo principal',
  },
  en: {
    search: 'Search', account: 'Login', close: 'Close', language: 'English', skip: 'Skip to main content',
  },
  es: {
    search: 'Buscar', account: 'Iniciar sesión', close: 'Cerrar', language: 'Español', skip: 'Ir al contenido principal',
  },
  fr: {
    search: 'Rechercher', account: 'Se connecter', close: 'Fermer', language: 'Français', skip: 'Aller au contenu principal',
  },
  de: {
    search: 'Suchen', account: 'Anmelden', close: 'Schließen', language: 'Deutsch', skip: 'Zum Hauptinhalt springen',
  },
  it: {
    search: 'Cerca', account: 'Accedi', close: 'Chiudi', language: 'Italiano', skip: 'Vai al contenuto principale',
  },
  pl: {
    search: 'Szukaj', account: 'Zaloguj się', close: 'Zamknij', language: 'Polski', skip: 'Przejdź do treści głównej',
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
 * The bar's search and account: links to www's same root (www opens its panels there), with
 * www's icons (icons/tap-search.svg, tap-person.svg: its search drawing and Material's person).
 * @param {{base: string, lang: string}} locale getLocale() (base: the root's path, /pt-pt)
 * @returns {Array<{role: string, icon: string, label: string, href: string}>}
 */
export function tapBarTools(locale) {
  const texts = TAP_HEADER_TEXTS[locale.lang] || TAP_HEADER_TEXTS.en;
  const href = `${WWW}${locale.base}`;
  return [
    {
      role: 'search', icon: 'tap-search', label: texts.search, href,
    },
    {
      role: 'account', icon: 'tap-person', label: texts.account, href,
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
  const row = children(list, 'LI').find((li) => !li.querySelector(':scope > ul') && li.querySelector(':scope > p > img, :scope > p > picture > img, :scope > img, :scope > picture > img') && !text(li));
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
// the tabs' anchors on the homepage's box (booking-box.js) and www's icons (its quick-action tab's
// own drawings, 20 px, each with its viewBox; brief 356)
const QUICK = [
  ['book-flight', '0 0 24 24', '<path fill-rule="evenodd" clip-rule="evenodd" d="M4.13543 8.19732L10.1018 10.1861C10.7718 10.4094 10.9725 11.2597 10.4731 11.7591L7.30277 14.9295C7.0553 15.1769 6.69179 15.2683 6.35672 15.1673L4.72782 14.676L4.39615 15.0077L7.23172 16.2966C7.44082 16.3916 7.60841 16.5592 7.70346 16.7683L8.99235 19.6039L9.32401 19.2722L8.83275 17.6433C8.7317 17.3082 8.82306 16.9447 9.07054 16.6972L12.2409 13.5269C12.7403 13.0275 13.5906 13.2282 13.8139 13.8982L15.8027 19.8646L16.4394 19.2278L15.089 11.1251C15.049 10.8851 15.1273 10.6404 15.2995 10.4683L19.5408 6.22698C20.0289 5.73883 20.0289 4.94737 19.5408 4.45922C19.0526 3.97106 18.2612 3.97106 17.773 4.45922L13.5317 8.70055C13.3596 8.87265 13.115 8.95103 12.8749 8.91102L4.77218 7.56056L4.13543 8.19732ZM2.81683 9.33893C2.14686 9.1156 1.94613 8.2653 2.4455 7.76593L3.91166 6.29976C4.12861 6.08282 4.43696 5.984 4.73959 6.03444L12.7426 7.36828L16.7124 3.39856C17.7863 2.32461 19.5275 2.32461 20.6015 3.39856C21.6754 4.4725 21.6754 6.2137 20.6015 7.28764L16.6317 11.2574L17.9656 19.2604C18.016 19.563 17.9172 19.8714 17.7002 20.0883L16.2341 21.5545C15.7347 22.0539 14.8844 21.8531 14.6611 21.1832L12.6723 15.2168L10.3639 17.5252L10.8551 19.1541C10.9562 19.4892 10.8648 19.8527 10.6173 20.1002L9.49181 21.2257C9.02279 21.6947 8.22969 21.5509 7.95521 20.9471L6.42325 17.5768L3.05294 16.0448C2.44909 15.7703 2.30528 14.9772 2.7743 14.5082L3.89983 13.3827C4.14731 13.1352 4.51081 13.0438 4.84589 13.1449L6.47479 13.6361L8.7832 11.3277L2.81683 9.33893Z"/>'],
  ['check-in', '0 0 20 21', '<path d="M8.81727 12.7495L6.88135 10.8136C6.76598 10.6982 6.62095 10.6392 6.44627 10.6365C6.27159 10.6338 6.12389 10.6929 6.00317 10.8136C5.88244 10.9343 5.82208 11.0807 5.82208 11.2527C5.82208 11.4247 5.88244 11.571 6.00317 11.6918L8.29002 13.9786C8.44066 14.1293 8.61641 14.2046 8.81727 14.2046C9.01812 14.2046 9.19386 14.1293 9.3445 13.9786L13.9807 9.34242C14.0961 9.22704 14.1551 9.08201 14.1578 8.90733C14.1605 8.73265 14.1014 8.58495 13.9807 8.46423C13.86 8.34351 13.7136 8.28314 13.5416 8.28314C13.3696 8.28314 13.2233 8.34351 13.1025 8.46423L8.81727 12.7495ZM10.0014 18.8777C8.90641 18.8777 7.87722 18.6699 6.91377 18.2543C5.95031 17.8388 5.11224 17.2748 4.39956 16.5625C3.68687 15.8501 3.12265 15.0124 2.70692 14.0494C2.29118 13.0863 2.08331 12.0574 2.08331 10.9624C2.08331 9.86747 2.29109 8.83828 2.70665 7.87483C3.1222 6.91137 3.68616 6.0733 4.39852 5.36062C5.1109 4.64793 5.9486 4.08371 6.91163 3.66798C7.87464 3.25224 8.90362 3.04437 9.99856 3.04437C11.0935 3.04437 12.1227 3.25215 13.0861 3.66771C14.0496 4.08326 14.8877 4.64722 15.6004 5.35958C16.3131 6.07196 16.8773 6.90966 17.293 7.87269C17.7087 8.8357 17.9166 9.86468 17.9166 10.9596C17.9166 12.0546 17.7088 13.0838 17.2933 14.0472C16.8777 15.0107 16.3138 15.8487 15.6014 16.5614C14.889 17.2741 14.0513 17.8383 13.0883 18.2541C12.1253 18.6698 11.0963 18.8777 10.0014 18.8777ZM9.99996 17.6277C11.8611 17.6277 13.4375 16.9819 14.7291 15.6902C16.0208 14.3985 16.6666 12.8221 16.6666 10.961C16.6666 9.09991 16.0208 7.52352 14.7291 6.23185C13.4375 4.94019 11.8611 4.29435 9.99996 4.29435C8.13885 4.29435 6.56246 4.94019 5.27079 6.23185C3.97913 7.52352 3.33329 9.09991 3.33329 10.961C3.33329 12.8221 3.97913 14.3985 5.27079 15.6902C6.56246 16.9819 8.13885 17.6277 9.99996 17.6277Z"/>'],
  ['my-travels', '0 0 24 24', '<path fill-rule="evenodd" clip-rule="evenodd" d="M2.69682 11.3864C2.57725 11.4555 2.53628 11.6084 2.60531 11.7279L3.68272 13.5941C4.51099 13.7979 5.26037 14.3266 5.72134 15.1251C6.18231 15.9235 6.26552 16.8368 6.02791 17.6561L7.10531 19.5222C7.17435 19.6417 7.32725 19.6827 7.44682 19.6137L18.0556 13.4887L17.4306 12.4061C17.2235 12.0474 17.3464 11.5887 17.7051 11.3816C18.0639 11.1745 18.5226 11.2974 18.7297 11.6561L19.3547 12.7387L21.3032 11.6137C21.4228 11.5446 21.4638 11.3917 21.3947 11.2722L20.3173 9.40605C19.489 9.20223 18.7397 8.67348 18.2787 7.87506C17.8177 7.07664 17.7345 6.16329 17.9721 5.34407L16.8947 3.47795C16.8257 3.35837 16.6728 3.3174 16.5532 3.38644L14.6047 4.51144L15.2297 5.59397C15.4368 5.95269 15.3139 6.41138 14.9551 6.61849C14.5964 6.8256 14.1377 6.70269 13.9306 6.34397L13.3056 5.26144L2.69682 11.3864ZM1.94682 10.0874C1.10981 10.5707 0.823025 11.6409 1.30627 12.4779L2.50623 14.5563C2.65831 14.8197 2.91638 14.9788 3.18483 15.0222C3.68802 15.1036 4.14874 15.4012 4.4223 15.8751C4.69586 16.3489 4.72324 16.8967 4.54215 17.3732C4.44554 17.6274 4.45424 17.9304 4.60632 18.1938L5.80627 20.2722C6.28952 21.1092 7.35981 21.396 8.19682 20.9127L22.0532 12.9127C22.8902 12.4295 23.177 11.3592 22.6938 10.5222L21.4938 8.44379C21.3417 8.18038 21.0837 8.02134 20.8152 7.97791C20.312 7.89649 19.8513 7.59888 19.5777 7.12506C19.3042 6.65124 19.2768 6.10344 19.4579 5.62696C19.5545 5.37276 19.5458 5.06974 19.3937 4.80633L18.1938 2.72795C17.7105 1.89093 16.6402 1.60415 15.8032 2.0874L1.94682 10.0874ZM6.27038 13.076C6.06327 12.7173 6.18618 12.2586 6.54489 12.0515L11.741 9.0515C12.0998 8.8444 12.5585 8.9673 12.7656 9.32602C12.9727 9.68474 12.8498 10.1434 12.491 10.3505L7.29489 13.3505C6.93618 13.5576 6.47748 13.4347 6.27038 13.076ZM15.7051 7.91753C16.0639 7.71042 16.5226 7.83333 16.7297 8.19205L17.2297 9.05807C17.4368 9.41679 17.3139 9.87549 16.9551 10.0826C16.5964 10.2897 16.1377 10.1668 15.9306 9.80807L15.4306 8.94205C15.2235 8.58333 15.3464 8.12464 15.7051 7.91753ZM7.77038 15.6741C7.56327 15.3154 7.68618 14.8567 8.0449 14.6496L11.509 12.6496C11.8677 12.4425 12.3264 12.5654 12.5335 12.9241C12.7406 13.2828 12.6177 13.7415 12.259 13.9486L8.7949 15.9486C8.43618 16.1557 7.97748 16.0328 7.77038 15.6741Z"/>'],
  ['flight-status', '0 0 21 20', '<path fill-rule="evenodd" clip-rule="evenodd" d="M11.1256 9.74683V6.45834C11.1256 6.28127 11.0657 6.13284 10.9459 6.01305C10.826 5.89326 10.6775 5.83336 10.5004 5.83336C10.3232 5.83336 10.1748 5.89326 10.0551 6.01305C9.9355 6.13284 9.87567 6.28127 9.87567 6.45834V9.93914C9.87567 10.0372 9.89383 10.1323 9.93015 10.2242C9.96647 10.3162 10.0236 10.4012 10.1016 10.4792L12.9558 13.3334C13.0712 13.4488 13.2162 13.5078 13.3909 13.5105C13.5656 13.5131 13.7133 13.4541 13.834 13.3334C13.9547 13.2127 14.0151 13.0663 14.0151 12.8943C14.0151 12.7223 13.9547 12.5759 13.834 12.4552L11.1256 9.74683ZM10.502 17.9167C9.4071 17.9167 8.3779 17.7089 7.41445 17.2934C6.45099 16.8778 5.61292 16.3139 4.90024 15.6015C4.18754 14.8891 3.62333 14.0514 3.20759 13.0884C2.79185 12.1254 2.58398 11.0964 2.58398 10.0014C2.58398 8.90649 2.79176 7.87729 3.20732 6.91384C3.62288 5.95038 4.18684 5.11231 4.8992 4.39963C5.61158 3.68693 6.44928 3.12272 7.41231 2.70698C8.37533 2.29124 9.40431 2.08337 10.4993 2.08337C11.5942 2.08337 12.6234 2.29115 13.5868 2.70671C14.5503 3.12227 15.3884 3.68623 16.1011 4.39859C16.8138 5.11097 17.378 5.94867 17.7937 6.9117C18.2094 7.87472 18.4173 8.9037 18.4173 9.99864C18.4173 11.0936 18.2095 12.1228 17.794 13.0862C17.3784 14.0497 16.8145 14.8878 16.1021 15.6005C15.3897 16.3131 14.552 16.8774 13.589 17.2931C12.626 17.7088 11.597 17.9167 10.502 17.9167ZM10.5007 16.6667C12.3479 16.6667 13.9208 16.0174 15.2194 14.7188C16.518 13.4202 17.1673 11.8473 17.1673 10C17.1673 8.15281 16.518 6.57989 15.2194 5.28128C13.9208 3.98266 12.3479 3.33336 10.5007 3.33336C8.65342 3.33336 7.0805 3.98266 5.78189 5.28128C4.48327 6.57989 3.83397 8.15281 3.83397 10C3.83397 11.8473 4.48327 13.4202 5.78189 14.7188C7.0805 16.0174 8.65342 16.6667 10.5007 16.6667Z"/>'],
];

const pathOf = () => (window.location && window.location.pathname) || '';

/** The quick-action tab of a page (its root's homepage box, its language); null on a homepage. */
export function tapQuickTabs(pathname) {
  const r = tapRoot(pathname, '');
  if (!r || isTapHome(pathname, r)) return null;
  const texts = TAP_QUICK_TABS[r === '/pt-br' ? 'br' : r.slice(1, 3)] || TAP_QUICK_TABS.en;
  return QUICK.map(([tab, viewBox, icon], i) => ({
    tab, viewBox, icon, label: texts[i], href: `${r}#${tab}`,
  }));
}

let menus = 0;

/**
 * The skip link first in the page, as www's ("Skip to main content"): to main, which takes the
 * focus (tabindex -1). Once per page.
 * @param {Document} doc
 */
export function addSkipLink(doc = document) {
  const main = doc.querySelector('main');
  if (!main || doc.querySelector('a.tap-skip')) return;
  if (!main.id) main.id = 'main';
  if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
  const texts = TAP_HEADER_TEXTS[(doc.documentElement.lang || '').slice(0, 2)] || TAP_HEADER_TEXTS.en;
  const a = doc.createElement('a');
  a.className = 'tap-skip';
  a.href = `#${main.id}`;
  a.textContent = texts.skip;
  doc.body.prepend(a);
}

// www's menu icon (Material Symbols' menu at weight 300: three 1.5 px lines)
const MENU_ICON = '<svg class="lh-icon tap-menu-icon" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M3 17.75v-1.5h18v1.5zm0-5v-1.5h18v1.5zm0-5v-1.5h18v1.5z"/></svg>';

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
    panel.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      close(entry, true);
    });
    button.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || panel.hidden) return;
      e.stopPropagation();
      close(entry, true);
    });
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
  addSkipLink(document);
  // inner pages: www's quick-action tab under the bar (header-tap.css keeps the room for it)
  Promise.resolve().then(() => {
    const tabs = tapQuickTabs(pathOf());
    const wrapper = root.closest('.nav-wrapper');
    if (!tabs || !wrapper || wrapper.querySelector('.tap-quick')) return;
    wrapper.append(node('nav', { className: 'tap-quick', 'aria-label': tabs.map((t) => t.label).join(', ') }, node('ul', {}, tabs.map((t) => node(
      'li',
      {},
      node('a', { href: t.href, className: 'tap-quick-link' }, node('span', { className: 'tap-quick-icon', html: `<svg viewBox="${t.viewBox}" width="20" height="20" fill="currentColor" aria-hidden="true" focusable="false">${t.icon}</svg>` }), node('span', { className: 'tap-quick-label' }, t.label)),
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
  // shows www's close icon and says so. Its icon www's (Material's menu, light lines)
  if (menuButton) {
    const own = menuButton.querySelector('svg, .lh-icon');
    const icon = node('span', { html: MENU_ICON }).firstElementChild;
    if (own) own.replaceWith(icon);
    else menuButton.prepend(icon);
    let menuLabel = null;
    // the card comes before the button in the page: the focus goes into it when it opens and back
    // to the button when Escape closes it; the quick-action tab under it inert (brief 363)
    const quickTab = () => (root.closest('.nav-wrapper') || document).querySelector('.tap-quick');
    const toggle = (open) => {
      root.classList.toggle('is-open', open);
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.classList.toggle('tap-menu-open', open);
      const tab = quickTab();
      if (tab) tab.toggleAttribute('inert', open);
      if (open) {
        menuLabel = menuButton.getAttribute('aria-label');
        menuButton.setAttribute('aria-label', texts.close);
        fillMarket();
        const first = root.querySelector('.nav-bar-menu-button, .nav-bar-menu-link');
        if (first) first.focus();
      } else {
        if (menuLabel !== null) menuButton.setAttribute('aria-label', menuLabel);
        close();
      }
    };
    menuButton.addEventListener('click', () => toggle(!root.classList.contains('is-open')));
    // Escape anywhere (the card, the bar's tools) closes it
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || !root.classList.contains('is-open')) return;
      toggle(false);
      menuButton.focus();
    });
  }
  return { root, close: () => close() };
}

/**
 * On a homepage the bar floats inside the stage's top: the header's class tap-home (no room kept
 * above the stage), and the stage's top (document coordinates) as --tap-stage-top, kept up to date
 * as the page above it changes (an alerts bar loading, a resize). With the extra link strip first
 * (www's "Intermediação de Crédito"), on phones www shows the strip under the alerts bar and the
 * bar under the strip: the header's class tap-has-strip (styles/themes/tap.css lifts the strip
 * into the header's room) and the strip's bottom edge as --tap-strip-offset, as it scrolls.
 * @param {Document} doc
 */
export function floatInStage(doc = document) {
  const stage = () => doc.querySelector('main .hero-campaign.slider');
  const strip = () => doc.querySelector('main > .section.extra-alert:first-of-type');
  const header = doc.querySelector('header');
  const root = doc.documentElement;
  const follow = () => {
    const st = strip();
    if (header) header.classList.toggle('tap-has-strip', Boolean(st));
    if (!st) return;
    const bottom = Math.max(0, Math.round(st.getBoundingClientRect().bottom));
    root.style.setProperty('--tap-strip-offset', `${bottom}px`);
  };
  const update = () => {
    const s = stage();
    if (header) header.classList.toggle('tap-home', Boolean(s));
    follow();
    if (!s) return;
    const top = Math.round(s.getBoundingClientRect().top + window.scrollY);
    doc.body.style.setProperty('--tap-stage-top', `${top}px`);
  };
  update();
  let frame = null;
  window.addEventListener('scroll', () => {
    if (frame !== null || typeof window.requestAnimationFrame !== 'function') return;
    frame = window.requestAnimationFrame(() => { frame = null; follow(); });
  }, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  if (typeof ResizeObserver === 'function') {
    const main = doc.querySelector('main');
    if (main) new ResizeObserver(update).observe(main);
  }
}
