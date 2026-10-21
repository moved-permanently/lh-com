/**
 * Import script for the global header and footer of a lufthansa.com market homepage.
 *
 * Input: a locale homepage snapshot (https://www.lufthansa.com/{cc}/{ll}/homepage).
 * Output (fragment documents):
 *   /{cc}/{ll}/nav                     header: brand, quick actions, mega menu, tools
 *   /{cc}/{ll}/footer                  footer: search + locale, link columns, legal row, logos
 *   /{cc}/{ll}/fragments/payment-social  "Payment options / Follow us" band (columns-logos)
 *
 * transform() returns all three outputs. The bulk importer (run-bulk-import.js) only writes
 * the first output of a transform, so a URL hash selects one output instead:
 *   .../homepage#nav, .../homepage#footer, .../homepage#payment-social
 * (the hash is not part of the snapshot lookup, so all three read the same snapshot).
 *
 * Sources in the rendered DOM (spans without class are already unwrapped):
 *  - header: .header-and-flyout-logo, .dcep-header-quick-action-links[data-dcep],
 *    .dcep-header-flyout[data-dcep] (mega menu items, flyout image, accessibility/support
 *    links), .dcep-login-portlet, .dcep-shopping-cart, .header-and-flyout-burger-menu,
 *    .dcep-country-and-language-selection, maui-modal.country-language-selector-modal
 *  - footer: footer .footer-area (search bar, link columns, legal row), .footer-logos
 *  - payment/social band: the page's .twocolumn holding the "Payment options" imagelinklist
 *
 * Links: in-scope pages become root-relative, locale roots /{cc}/{ll}/homepage, everything
 * else on lufthansa.com absolute https://www.lufthansa.com/..., other domains unchanged.
 */
import SCOPE_PATHS from './transformers/scope-paths.js';
import columnsLogosParser from './parsers/columns-logos.js';

const LIVE_ORIGIN = 'https://www.lufthansa.com';
const SOURCE_HOSTS = ['www.lufthansa.com', 'lufthansa.com', 'localhost', '127.0.0.1'];
const PAGE_PATH = /^\/(?:[a-z]{2}\/[a-z]{2}|lhg\/[a-z]{2}\/[a-z]{2})(?:\/|$)/;
const LOCALE_ROOT = /^\/[a-z]{2}\/[a-z]{2}$/;
const SR_ONLY = '.sr-only, .visually-hidden, maui-screen-reader-label, [slot="box"], .popover-box-tooltip';

/** Shown when the country/language selector is still a skeleton in the snapshot. */
const LOCALE_LABELS = {
  'de/en': 'Germany | English',
  'de/de': 'Deutschland | Deutsch',
  'at/de': 'Österreich | Deutsch',
  'gb/en': 'United Kingdom | English',
};

const FALLBACK_LABELS = {
  en: {
    cart: 'Shopping cart', search: 'Search', searchField: 'Enter search term', menu: 'Menu', login: 'Login',
  },
  de: {
    cart: 'Warenkorb', search: 'Suche', searchField: 'Suchbegriff eingeben', menu: 'Menü', login: 'Login',
  },
};

/* ------------------------------------------------------------------ helpers ----------- */

function clean(s) {
  return (s || '').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\s+/g, ' ').trim();
}

/** Visible text of a node: screen-reader-only labels and tooltips removed. */
function visibleText(node) {
  if (!node) return '';
  const clone = node.cloneNode(true);
  clone.querySelectorAll(SR_ONLY).forEach((n) => n.remove());
  return clean(clone.textContent);
}

function safeDecode(s) {
  try { return decodeURI(s); } catch (e) { return s; }
}

function normalizePath(p) {
  const out = safeDecode(p || '/').replace(/\.html$/, '').replace(/\/+$/, '');
  return out.startsWith('/') ? out : `/${out}`;
}

/**
 * Rewritten href (same rules as transformers/lufthansa-cleanup.js), or null to keep it.
 */
function rewriteHref(href) {
  const raw = (href || '').trim();
  if (!raw || raw.startsWith('#') || /^(mailto|tel|javascript|data|sms):/i.test(raw)) return null;
  const isAbsolute = /^[a-z][a-z0-9+.-]*:/i.test(raw) || raw.startsWith('//');
  let u;
  try { u = new URL(raw, `${LIVE_ORIGIN}/`); } catch (e) { return null; }
  if (isAbsolute && !SOURCE_HOSTS.includes(u.hostname)) return null;
  if (!/^https?:$/.test(u.protocol)) return null;
  const pagePath = normalizePath(u.pathname).replace(/^\/content\/lh(?=\/)/, '');
  if (LOCALE_ROOT.test(pagePath) && SCOPE_PATHS.has(`${pagePath}/homepage`)) {
    return `${pagePath}/homepage${u.search}${u.hash}`;
  }
  if (PAGE_PATH.test(pagePath) && SCOPE_PATHS.has(pagePath)) {
    return `${pagePath}${u.search}${u.hash}`;
  }
  return `${LIVE_ORIGIN}${u.pathname}${u.search}${u.hash}`;
}

function rewriteLinks(root) {
  root.querySelectorAll('[href]').forEach((node) => {
    // links that must stay on the live site (e.g. the session-bound cart)
    if (node.hasAttribute('data-live')) {
      node.removeAttribute('data-live');
      return;
    }
    const next = rewriteHref(node.getAttribute('href'));
    if (next !== null) node.setAttribute('href', next);
  });
}

/** Absolute https://www.lufthansa.com URL for root-relative or lufthansa image paths. */
function absoluteImageUrl(src) {
  if (!src || src.startsWith('data:')) return src;
  try {
    const u = new URL(src, `${LIVE_ORIGIN}/`);
    if (SOURCE_HOSTS.includes(u.hostname)) return `${LIVE_ORIGIN}${u.pathname}${u.search}`;
    return u.href;
  } catch (e) {
    return src;
  }
}

function readDcep(root, selector) {
  const node = root && root.querySelector(selector);
  if (!node) return null;
  try { return JSON.parse(node.getAttribute('data-dcep')); } catch (e) { return null; }
}

function el(document, tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') node.setAttribute(k, v); });
  (Array.isArray(children) ? children : [children]).forEach((c) => {
    if (c === null || c === undefined || c === '') return;
    node.append(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return node;
}

function link(document, href, text, attrs = {}) {
  return el(document, 'a', { href, ...attrs }, text);
}

/** <li>:icon: <a href>label</a></li>; the icon token lets the header pick the icon. */
function toolItem(document, icon, href, label) {
  const li = el(document, 'li');
  li.append(document.createTextNode(`:${icon}: `));
  li.append(href ? link(document, href, label) : document.createTextNode(label));
  return li;
}

/** Joins sections with <hr> (section breaks) into one container. */
function sectionsToElement(document, sections) {
  const root = el(document, 'div');
  sections.filter((s) => s && s.length).forEach((nodes, i) => {
    if (i > 0) root.append(el(document, 'hr'));
    nodes.forEach((n) => root.append(n));
  });
  return root;
}

function localeOf(params, url) {
  const source = (params && params.originalURL) || url;
  const m = new URL(source).pathname.match(/^\/([a-z]{2})\/([a-z]{2})(?:\/|$)/);
  if (!m) throw new Error(`not a locale page: ${source}`);
  return { country: m[1], lang: m[2], key: `${m[1]}/${m[2]}` };
}

/* --------------------------------------------------------------------- nav ------------ */

function brandSection(document, header, locale) {
  const logo = header && header.querySelector('.header-and-flyout-logo a, .common-header-logo a');
  const img = logo && logo.querySelector('img');
  const href = (logo && logo.getAttribute('href')) || `/${locale.key}/homepage`;
  const a = link(document, href, '');
  if (img) {
    a.append(el(document, 'img', {
      src: absoluteImageUrl(img.getAttribute('src')),
      alt: clean(img.getAttribute('alt')) || 'Lufthansa',
    }));
  } else {
    a.textContent = 'Lufthansa';
  }
  return [el(document, 'p', {}, a)];
}

function quickActionsSection(document, header) {
  const data = readDcep(header, '.dcep-header-quick-action-links');
  let links = data && Array.isArray(data.links)
    ? data.links.map((l) => ({ label: clean(l.label), href: l.url }))
    : [];
  if (!links.length && header) {
    links = [...header.querySelectorAll('.dcep-header-quick-action-links [href]')]
      .map((l) => ({ label: visibleText(l), href: l.getAttribute('href') }));
  }
  links = links.filter((l) => l.label && l.href);
  if (!links.length) return [];
  const ul = el(document, 'ul');
  links.forEach((l) => ul.append(el(document, 'li', {}, link(document, l.href, l.label))));
  return [ul];
}

function menuFromData(data) {
  return (data.menuItems || []).map((top) => ({
    label: clean(top.label),
    columns: (top.menuItems || []).map((col) => ({
      label: clean(col.label),
      links: (col.menuItems || [])
        .map((l) => ({ label: clean(l.label), href: l.href }))
        .filter((l) => l.label && l.href),
    })).filter((c) => c.label || c.links.length),
  })).filter((t) => t.label);
}

/** Rendered flyout (AirCore-style markup), used when the data attribute is missing. */
function menuFromDom(root) {
  return [...root.querySelectorAll('.main-menu-list > li')].map((li) => ({
    label: visibleText(li.querySelector('.btn-flyout-menu')),
    columns: [...li.querySelectorAll('.sub-menu-section > div')].map((col) => ({
      label: visibleText(col.querySelector('h1, h2, h3, h4, h5, h6, maui-headline')),
      links: [...col.querySelectorAll('.sub-menu-list [href]')]
        .map((a) => ({ label: visibleText(a), href: a.getAttribute('href') }))
        .filter((l) => l.label && l.href),
    })),
  })).filter((t) => t.label);
}

function menuSection(document, header, flyoutData) {
  let items = flyoutData ? menuFromData(flyoutData) : [];
  if (!items.length && header) items = menuFromDom(header);
  if (!items.length) return [];
  const ul = el(document, 'ul');
  items.forEach((top) => {
    const li = el(document, 'li', {}, top.label);
    const cols = el(document, 'ul');
    top.columns.forEach((col) => {
      const colLi = el(document, 'li', {}, col.label);
      const links = el(document, 'ul');
      col.links.forEach((l) => links.append(el(document, 'li', {}, link(document, l.href, l.label))));
      if (links.children.length) colLi.append(links);
      cols.append(colLi);
    });
    if (cols.children.length) li.append(cols);
    ul.append(li);
  });
  const nodes = [ul];
  // flyout teaser image (shown next to the slide-in menu on desktop)
  if (flyoutData && flyoutData.flyoutImage) {
    nodes.push(el(document, 'p', {}, el(document, 'img', { src: absoluteImageUrl(flyoutData.flyoutImage), alt: '' })));
  }
  return nodes;
}

function countryList(document) {
  const modal = document.querySelector('maui-modal.country-language-selector-modal');
  const select = modal && modal.querySelector('maui-select');
  if (!select) return null;
  const options = [...select.querySelectorAll('maui-option[optionvalue]')]
    .map((o) => ({ code: clean(o.getAttribute('optionvalue')).toLowerCase(), name: visibleText(o) }))
    .filter((o) => o.code && o.name);
  return options.length ? options : null;
}

function localeLabel(document, root, locale) {
  const text = root && root.querySelector('.dcep-country-and-language-selection .country-language-text');
  return visibleText(text) || LOCALE_LABELS[locale.key] || locale.key.toUpperCase();
}

function searchConfig(document, locale) {
  const data = readDcep(document, '.dcep-search-bar') || {};
  const bar = document.querySelector('.dcep-search-bar');
  const labels = FALLBACK_LABELS[locale.lang] || FALLBACK_LABELS.en;
  const button = bar && bar.querySelector('button[aria-label]');
  // live template ".../search-result?query=%q%": the empty query parameter takes the term
  return {
    url: (data.searchUrl || `/${locale.key}/support/search/search-result?query=%q%`).replace('%q%', ''),
    field: visibleText(bar && bar.querySelector('label')) || labels.searchField,
    label: clean(button && button.getAttribute('aria-label')) || labels.search,
  };
}

function toolsSection(document, header, flyoutData, locale) {
  const labels = FALLBACK_LABELS[locale.lang] || FALLBACK_LABELS.en;
  const ul = el(document, 'ul');
  const iconLink = (icon) => header && header.querySelector(`maui-icon-button-link[icon="${icon}"]`);

  const a11y = iconLink('wheelchair');
  const a11yHref = (flyoutData && flyoutData.accessibilityUrl) || (a11y && a11y.getAttribute('href'));
  const a11yLabel = clean((flyoutData && flyoutData.accessibilityTextLabel)
    || (a11y && (a11y.getAttribute('data-aria-label') || a11y.getAttribute('aria-label'))));
  if (a11yHref && a11yLabel) ul.append(toolItem(document, 'wheelchair', a11yHref, a11yLabel));

  const help = iconLink('question');
  const helpHref = (flyoutData && flyoutData.supportUrl) || (help && help.getAttribute('href'));
  const helpLabel = clean((flyoutData && flyoutData.supportTextLabel)
    || (help && (help.getAttribute('data-aria-label') || help.getAttribute('aria-label'))));
  if (helpHref && helpLabel) ul.append(toolItem(document, 'help', helpHref, helpLabel));

  const search = searchConfig(document, locale);
  ul.append(toolItem(document, 'search', search.url, search.label));

  // the cart is a session overlay on the live site: link to the live market homepage
  const cart = header && header.querySelector('.dcep-shopping-cart [name]');
  const cartLabel = clean(cart && cart.getAttribute('name')) || labels.cart;
  const cartItem = toolItem(document, 'cart', `${LIVE_ORIGIN}/${locale.key}/homepage`, cartLabel);
  cartItem.querySelector('a').setAttribute('data-live', '');
  ul.append(cartItem);

  const login = header && header.querySelector('.dcep-login-portlet a[href], .header-and-flyout-login-portlet a[href]');
  if (login) {
    const label = visibleText(login.querySelector('.ml-2')) || visibleText(login) || labels.login;
    ul.append(toolItem(document, 'login', login.getAttribute('href'), label));
  }

  // country / language selector: current locale, plus the live country list when rendered
  const localeLi = toolItem(document, 'globe', null, localeLabel(document, header, locale));
  const countries = countryList(document);
  if (countries) {
    const list = el(document, 'ul');
    countries.forEach((c) => {
      // "Other countries" (XX) is the international market /xx/{lang}
      const href = `${LIVE_ORIGIN}/${c.code}/${locale.lang}/homepage`;
      list.append(el(document, 'li', {}, link(document, href, c.name)));
    });
    localeLi.append(list);
  }
  ul.append(localeLi);

  const burger = header && header.querySelector('.header-and-flyout-burger-menu');
  const menuLabel = clean(burger && (burger.getAttribute('aria-label') || visibleText(burger))) || labels.menu;
  return [ul, el(document, 'p', {}, menuLabel)];
}

function buildNav(document, locale) {
  const header = document.querySelector('header#header, header.header-and-flyout, header');
  const flyoutData = readDcep(header, '.dcep-header-flyout');
  return sectionsToElement(document, [
    brandSection(document, header, locale),
    quickActionsSection(document, header),
    menuSection(document, header, flyoutData),
    toolsSection(document, header, flyoutData, locale),
  ]);
}

/* ------------------------------------------------------------------ footer ------------ */

function footerLinks(document, list) {
  const ul = el(document, 'ul');
  [...list.querySelectorAll('li')].forEach((li) => {
    const a = li.querySelector('a[href], maui-navigation-link[href], maui-link[href]');
    if (!a) return;
    const label = visibleText(a);
    let href = a.getAttribute('href');
    if (!label) return;
    // "Change privacy settings" opens the consent manager on the live site
    if (href === '#' && li.id === 'privacymanager') href = '#privacy-settings';
    ul.append(el(document, 'li', {}, link(document, href, label)));
  });
  return ul;
}

function buildFooter(document, locale) {
  const footer = document.querySelector('footer');
  const area = footer && footer.querySelector('.footer-area');
  const sections = [];

  // 1. search + current locale
  const search = searchConfig(document, locale);
  sections.push([
    el(document, 'p', {}, [document.createTextNode(':search: '), link(document, search.url, search.field)]),
    el(document, 'p', {}, `:globe: ${localeLabel(document, area, locale)}`),
  ]);

  // 2. link columns (heading + links)
  const columns = [];
  if (area) {
    [...area.querySelectorAll('.link-list')].forEach((col) => {
      const list = col.querySelector('ul.vertical');
      if (!list) return;
      const heading = visibleText(col.querySelector('.hidden-sm-down h3, h3'));
      if (heading) columns.push(el(document, 'h3', {}, heading));
      const ul = footerLinks(document, list);
      if (ul.children.length) columns.push(ul);
    });
  }
  sections.push(columns);

  // 3. legal row
  const legal = area && area.querySelector('.link-list ul.horizontal');
  if (legal) sections.push([footerLinks(document, legal)]);

  // 4. logos (Lufthansa, member of Lufthansa Group, Star Alliance)
  const logos = footer && footer.querySelector('.footer-logos');
  if (logos) {
    const ul = el(document, 'ul');
    [...logos.querySelectorAll('[href]')].forEach((a) => {
      const href = a.getAttribute('href');
      const img = a.querySelector('img');
      const graphic = a.querySelector('maui-graphic');
      const li = el(document, 'li');
      if (img) {
        li.append(link(document, href, el(document, 'img', {
          src: absoluteImageUrl(img.getAttribute('src')),
          alt: clean(img.getAttribute('alt')),
        })));
      } else if (graphic && /star-alliance/.test(graphic.className)) {
        // rendered by a web component on the live site: icon /icons/star-alliance.svg
        const label = clean(graphic.getAttribute('aria-label')) || 'Star Alliance';
        li.append(link(document, href, ':star-alliance:', { title: label }));
      } else if (visibleText(a)) {
        li.append(link(document, href, visibleText(a)));
      }
      if (li.childNodes.length) ul.append(li);
    });
    if (ul.children.length) sections.push([ul]);
  }

  return sectionsToElement(document, sections);
}

/* ------------------------------------------------------- payment / follow us ---------- */

function buildPaymentSocial(document, params, url) {
  const lists = [...document.querySelectorAll('.imagelinklist')];
  const payment = lists.find((l) => l.querySelector('img[src*="/icons/payment/"]')) || lists[0];
  const column = payment && (payment.closest('.twocolumn') || payment);
  if (!column) return null;
  const wrapper = el(document, 'div');
  wrapper.append(column.cloneNode(true));
  columnsLogosParser(wrapper.firstElementChild, { document, url, params });
  wrapper.querySelectorAll('img').forEach((img) => img.setAttribute('src', absoluteImageUrl(img.getAttribute('src'))));
  return wrapper;
}

/* ------------------------------------------------------------------ export ------------ */

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const locale = localeOf(params, url);
    const only = new URL((params && params.originalURL) || url).hash.replace(/^#/, '');

    const outputs = [];
    const add = (name, path, build) => {
      if (only && only !== name) return;
      const element = build();
      if (!element) return;
      rewriteLinks(element);
      outputs.push({ element, path, report: { template: 'nav', fragment: name } });
    };
    add('nav', `/${locale.key}/nav`, () => buildNav(document, locale));
    add('footer', `/${locale.key}/footer`, () => buildFooter(document, locale));
    add('payment-social', `/${locale.key}/fragments/payment-social`, () => buildPaymentSocial(document, params, url));
    return outputs;
  },
};
