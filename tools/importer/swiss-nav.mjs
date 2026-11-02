/* eslint-disable no-console, max-len, import/extensions, import/no-extraneous-dependencies -- tooling */
/**
 * SWISS's nav and footer documents (lh-swiss; built as brussels-nav.mjs) from a reference root's
 * captured homepage (tools/importer/bd-snapshots/www.swiss.com/<cc>/<ll>/homepage.html), in the
 * shape of lh-com's nav and footer documents (blocks/header, blocks/footer), 1:1:
 * - nav: the logo (www's /etc/designs/lx/clientlib-all/vite/img/swiss-logo.svg), the quick
 *   actions ([data-dcep] dcep-header-quick-action-links: Book, My flights, Check-in, Flight
 *   status), the menu from the header's JSON ([data-dcep] "id":"common-header-nav-horizontal": top
 *   items, their columns with the column's own link, the columns' links, the "SWISS Magazine"
 *   column among them), the tools (Accessible travel and Help & Contact from the JSON, the cart and
 *   the Travel ID login as www links, the country and language with the selector's countries), the
 *   burger's label. The menu's "Flight vouchers" link through Proofpoint's urldefense.com is its
 *   target (unwrap);
 * - footer, in www's order: the four link columns, the social row (Style badges), the sub-footer's
 *   logos (SWISS, member of Lufthansa Group, Star Alliance), then the legal links ("Change Privacy
 *   Settings": #privacy-settings, the consent dialog). blocks/footer shows the legal links above
 *   the logo row whatever the document's order (tools/reports/lh-swiss.md).
 * Links: pages of the site's documents (tools/importer/sites/lh-swiss.json) relative, www's
 * relative links absolute on www.swiss.com, other absolute links as www has them (the corporate,
 * medical services and magazine sub-sites, the AirCore "Destinations"); www's images absolute on
 * www (swiss-dam.mjs copies them to DA).
 * navTargets(html): the page paths the header menu, quick actions and footer link to (the scope
 * adds those the sitemap misses).
 *
 * Usage: node tools/importer/swiss-nav.mjs [--root ch/en]   (writes content-sites/lh-swiss/content/<root>/nav|footer.plain.html)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import {
  ownPages, ownAliases, ownServed, withOwnLinks,
} from './own-links.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const HOST = 'www.swiss.com';
const ORIGIN = `https://${HOST}`;
export const HEADER_LOGO = '/etc/designs/lx/clientlib-all/vite/img/swiss-logo.svg';
const SR_ONLY = '.sr-only, .visually-hidden, maui-screen-reader-label, [slot="box"], .popover-box-tooltip';

const clean = (s) => String(s || '').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\s+/g, ' ').trim();
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');
const visible = (node) => {
  if (!node) return '';
  const c = node.cloneNode(true);
  c.querySelectorAll(SR_ONLY).forEach((n) => n.remove());
  return clean(c.textContent);
};

/** The JSON of a [data-dcep] element (by class or by its id), or null. */
export function dcep(document, { cls, id }) {
  const nodes = cls ? [...document.querySelectorAll(`.${cls}[data-dcep]`)] : [...document.querySelectorAll('[data-dcep]')];
  for (const n of nodes) { // eslint-disable-line no-restricted-syntax
    try {
      const j = JSON.parse(n.getAttribute('data-dcep'));
      if (!id || j.id === id) return j;
    } catch (e) { /* not JSON */ }
  }
  return null;
}

/**
 * A link through Proofpoint's urldefense.com (www's menu: "Flight vouchers") as its target URL;
 * other links as they are.
 */
export function unwrapUrldefense(href) {
  const m = String(href || '').match(/^https:\/\/urldefense\.com\/v3\/__(https?):\/+([^/_]+)(\/[^_]*?)?__;/);
  return m ? `${m[1]}://${m[2]}${m[3] || '/'}` : href;
}

/** A www page path (/<cc>/<ll>/..., .html and a trailing slash dropped), or null for other hosts. */
export function wwwPath(href) {
  let u;
  try { u = new URL(String(href || '').trim(), `${ORIGIN}/`); } catch (e) { return null; }
  if (!/^(www\.|)?swiss\.com$/.test(u.hostname)) return null;
  return decodeURIComponent(u.pathname).replace(/^\/content\/lx\/markets(?=\/)/, '').replace(/\.html$/, '').replace(/\/$/, '') || '/';
}

/** The document link for a www href: relative to a page of the site, absolute on www otherwise. */
export function linkFor(href, sitePaths) {
  const raw = String(href || '').trim();
  if (!raw || raw.startsWith('#') || /^(mailto|tel|javascript):/i.test(raw)) return raw;
  let u;
  try { u = new URL(raw, `${ORIGIN}/`); } catch (e) { return raw; }
  const p = wwwPath(raw);
  if (p === null) return u.href;
  const page = /^\/[a-z]{2}\/[a-z]{2}$/.test(p) ? `${p}/homepage` : p;
  if (sitePaths.has(page)) return `${page}${u.search}${u.hash}`;
  // an absolute link as www has it (https://swiss.com/magazine/en), www's relative ones on www
  if (/^https?:\/\//i.test(raw) && !/\/content\/lx\/markets\//.test(u.pathname)) return u.href;
  return `${ORIGIN}${u.pathname.replace(/^\/content\/lx\/markets(?=\/)/, '')}${u.search}${u.hash}`;
}

/**
 * The nav's cart item. www's cart is a button that opens a dialog; a visitor without a shop session
 * gets its empty cart (title, text, a link to the offers): those as the item's sub-list
 * (blocks/header/header-cart.js), the item's link the dialog's. Without the dialog in the snapshot:
 * a link to www's homepage, as before (as lh-com's nav importer).
 */
function cartTool(document, key, sitePaths) {
  const cart = document.querySelector('.dcep-shopping-cart');
  if (!cart) return '';
  const label = esc(clean(cart.querySelector('[name]')?.getAttribute('name')) || 'Shopping cart');
  // the dialog: in the cart, or (maui-modal portals it) a modal at the body's end whose link is
  // the root's offers page
  const modal = cart.querySelector('maui-modal') || [...document.querySelectorAll('body > maui-modal')]
    .find((m) => m.querySelector(`maui-button-link[href="/${key}/offers"], a[href="/${key}/offers"]`));
  const title = clean(modal && (modal.getAttribute('title') || modal.getAttribute('label')));
  const link = modal && modal.querySelector('maui-button-link[href], a[href]');
  if (!title || !link) return `<li>:cart: <a href="${ORIGIN}/${key}/homepage">${label}</a></li>`;
  const href = esc(linkFor(link.getAttribute('href'), sitePaths));
  const copy = [...modal.querySelectorAll('maui-copy')].map((c) => clean(c.textContent)).filter(Boolean);
  const items = [`<li>${esc(title)}</li>`, ...copy.map((c) => `<li>${esc(c)}</li>`), `<li><a href="${href}">${esc(clean(link.textContent))}</a></li>`];
  return `<li>:cart: <a href="${href}">${label}</a>\n<ul>\n${items.join('\n')}\n</ul></li>`;
}

const a = (href, label, sitePaths) => `<a href="${esc(linkFor(href, sitePaths))}">${esc(label)}</a>`;
// www images Edge Delivery refuses at preview (SVGs over its size limit, as Austrian's 400 KB
// icons): a local rendering of the same drawing, uploaded to DA by da-upload.mjs (/media-da/)
export const LOCAL_IMAGES = {
  // the voucher icon (66 KB, Illustrator's construction layers hidden; 409 at preview,
  // /customer-support/faq): a PNG of its visible layers, 400x400
  '/content/dam/lx/icons/product-voucher.svg': '/media-da/swiss/product-voucher.png',
};

/** A document's images Edge Delivery refuses (LOCAL_IMAGES) as their local renderings. */
export const withLocalImages = (doc) => Object.entries(LOCAL_IMAGES).reduce((d, [www, own]) => d
  .replace(new RegExp(`src="(?:https://www\\.swiss\\.com)?${www.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"]*"`, 'g'), `src="${own}"`), doc);
const img = (src, alt) => {
  const own = LOCAL_IMAGES[new URL(src, `${ORIGIN}/`).pathname];
  return `<img src="${esc(own || new URL(src, `${ORIGIN}/`).href)}" alt="${esc(alt)}">`;
};

/** The header menu: [{label, href, columns: [{label, href, links: [{label, href}]}]}]. */
export function menuOf(document) {
  const data = dcep(document, { id: 'common-header-nav-horizontal' }) || {};
  return {
    data,
    items: (data.menuItems || []).map((top) => ({
      label: clean(top.label),
      href: top.href || '',
      columns: (top.menuItems || []).map((col) => ({
        label: clean(col.label),
        href: col.href || '',
        links: (col.menuItems || []).map((l) => ({ label: clean(l.label), href: unwrapUrldefense(l.href || '') })).filter((l) => l.label && l.href),
      })).filter((c) => c.label || c.links.length),
    })).filter((t) => t.label),
  };
}

/**
 * The footer's parts from the snapshot (SWISS's: .swiss-footer with the link columns and the
 * social row, .subfooter with the logos, the legal links and Star Alliance).
 */
export function footerOf(document) {
  const footer = document.querySelector('footer') || document;
  const linkOf = (li) => li.querySelector('a[href], maui-navigation-link[href]');
  const columns = [...footer.querySelectorAll('.swiss-link-content .link-list')].filter((l) => l.querySelector(':scope > ul.vertical')).map((col) => ({
    heading: visible(col.querySelector('.hidden-sm-down h3, h3')),
    links: [...col.querySelectorAll('ul.vertical > li')].map(linkOf).filter(Boolean)
      .map((x) => ({ label: visible(x), href: x.getAttribute('href') })).filter((l) => l.label && l.href),
  })).filter((c) => c.links.length);
  const social = [...footer.querySelectorAll('.swiss-social-links ul.horizontal > li')].map(linkOf).filter(Boolean).map((x) => {
    const im = x.querySelector('img');
    return { href: x.getAttribute('href'), src: im?.getAttribute('src') || '', alt: clean(im?.getAttribute('alt')) || visible(x) };
  }).filter((l) => l.href && l.src);
  const sub = footer.querySelector('.subfooter') || footer;
  const legal = [...sub.querySelectorAll('.swiss-site-navigation ul > li')].map((li) => {
    const x = li.querySelector('a');
    if (!x) return null;
    const label = visible(x);
    // "Change Privacy Settings" opens the consent manager (OneTrust.ToggleInfoDisplay() on www)
    const href = /OneTrust|optanon/.test(`${x.getAttribute('onclick') || ''} ${x.getAttribute('class') || ''}`) || x.getAttribute('href') === '#' ? '#privacy-settings' : x.getAttribute('href');
    return label && href ? { label, href } : null;
  }).filter(Boolean);
  const imgOf = (x) => (x ? { href: x.getAttribute('href'), src: x.querySelector('img')?.getAttribute('src'), alt: clean(x.querySelector('img')?.getAttribute('alt')) } : null);
  return {
    columns,
    badges: social.length ? [{ heading: '', links: social }] : [],
    legal,
    logos: {
      home: imgOf(sub.querySelector('.logo:not(.lhg-logo)')),
      lhg: imgOf(sub.querySelector('.lhg-logo')),
      starAlliance: sub.querySelector('.star-alliance-logo-wrapper')?.getAttribute('href') || '',
      starAllianceLabel: clean(sub.querySelector('.star-alliance-logo')?.getAttribute('aria-label')) || 'Star Alliance',
    },
  };
}

/** The page paths the header and footer link to (www's pages of the root's market roots). */
export function navTargets(html) {
  const { document } = parseHTML(html);
  const { items } = menuOf(document);
  const quick = dcep(document, { cls: 'dcep-header-quick-action-links' })?.links || [];
  const f = footerOf(document);
  const hrefs = [
    ...items.flatMap((t) => [t.href, ...t.columns.flatMap((c) => [c.href, ...c.links.map((l) => l.href)])]),
    ...quick.map((l) => l.url),
    ...f.columns.flatMap((c) => c.links.map((l) => l.href)),
    ...f.badges.flatMap((g) => g.links.map((l) => l.href)),
    ...f.legal.map((l) => l.href),
  ];
  return [...new Set(hrefs.map(wwwPath).filter((p) => p && /^\/[a-z]{2}\/[a-z]{2}\//.test(p)))].sort();
}

/** The nav document (four sections) of a root. */
export function navDocument(document, key, sitePaths) {
  const { data, items } = menuOf(document);
  const quick = dcep(document, { cls: 'dcep-header-quick-action-links' })?.links || [];
  const login = dcep(document, { cls: 'dcep-login-portlet' }) || {};
  const logoImg = document.querySelector('.common-header-logo-image, .header-and-flyout-logo img');
  const logoAlt = clean(logoImg?.getAttribute('alt')) || 'SWISS';
  const brand = `<div><p><a href="/${key}/homepage">${img(HEADER_LOGO, logoAlt)}</a></p></div>`;
  const quickList = `<div><ul>\n${quick.map((l) => `<li>${a(l.url, clean(l.label), sitePaths)}</li>`).join('\n')}\n</ul></div>`;
  const menu = `<div><ul>\n${items.map((t) => `<li>\n<p>${esc(t.label)}</p>\n<ul>\n${t.columns.map((c) => `<li>\n<p>${c.href ? a(c.href, c.label, sitePaths) : esc(c.label)}</p>\n<ul>\n${c.links.map((l) => `<li>${a(l.href, l.label, sitePaths)}</li>`).join('\n')}\n</ul>\n</li>`).join('\n')}\n</ul>\n</li>`).join('\n')}\n</ul></div>`;
  // the countries: the selector's first select (the second lists the languages)
  const countrySelect = document.querySelector('maui-modal.country-language-selector-modal maui-select');
  const options = [...(countrySelect ? countrySelect.querySelectorAll('maui-option[optionvalue]') : [])]
    .map((o) => ({ code: clean(o.getAttribute('optionvalue')).toLowerCase(), name: visible(o) })).filter((o) => o.code && o.name);
  const seen = new Set();
  const countries = options.filter((o) => !seen.has(o.code) && seen.add(o.code));
  const lang = key.split('/')[1];
  const localeLabel = visible(document.querySelector('header .dcep-country-and-language-selection .country-language-text'))
    || visible(document.querySelector('.dcep-country-and-language-selection .country-language-text')) || key;
  const tools = [
    data.accessibilityUrl && data.accessibilityTextLabel ? `<li>:wheelchair: ${a(data.accessibilityUrl, clean(data.accessibilityTextLabel), sitePaths)}</li>` : '',
    data.supportUrl && data.supportTextLabel ? `<li>:help: ${a(data.supportUrl, clean(data.supportTextLabel), sitePaths)}</li>` : '',
    cartTool(document, key, sitePaths),
    // the login is www's (Travel ID); the login and profile app shells are not on the site
    login.userAuthorizeUrl ? `<li>:login: <a href="${esc(login.userAuthorizeUrl.replace(/state=[^&]*/, `state=${encodeURIComponent(`/${key}/homepage`)}`))}">${esc(visible(document.querySelector('.dcep-login-portlet .login-portlet-link')) || 'Login')}</a></li>` : '',
    `<li>:globe: ${esc(localeLabel)}${countries.length ? `\n<ul>\n${countries.map((c) => `<li><a href="${ORIGIN}/${c.code}/${lang}/homepage">${esc(c.name)}</a></li>`).join('\n')}\n</ul>` : ''}</li>`,
  ].filter(Boolean);
  const menuLabel = clean(document.querySelector('.header-and-flyout-burger-menu')?.getAttribute('aria-label')) || visible(document.querySelector('.header-and-flyout-burger-menu')) || 'Menu';
  const toolsSection = `<div><ul>\n${tools.join('\n')}\n</ul><p>${esc(menuLabel)}</p></div>`;
  // ("My flights" and "Manage bookings", www's cockpit deep link, stay www links: no host of the
  // site serves the login and profile pages yet)
  return `${[brand, quickList, menu, toolsSection].join('\n')}\n`;
}

/**
 * The footer document of a root, in www's order: the link columns, the social row (Style badges),
 * the logos, the legal links.
 */
export function footerDocument(document, sitePaths) {
  const f = footerOf(document);
  const sections = [];
  sections.push(`<div>${f.columns.map((c) => `<h3>${esc(c.heading)}</h3><ul>\n${c.links.map((l) => `<li>${a(l.href, l.label, sitePaths)}</li>`).join('\n')}\n</ul>`).join('')}</div>`);
  if (f.badges.length) {
    const meta = '<div class="section-metadata"><div><div>Style</div><div>badges</div></div></div>';
    sections.push(`<div>${f.badges.map((g) => `${g.heading ? `<h3>${esc(g.heading)}</h3>` : ''}<ul>\n${g.links.map((l) => `<li><a href="${esc(linkFor(l.href, sitePaths))}">${img(l.src, l.alt)}</a></li>`).join('\n')}\n</ul>`).join('')}${meta}</div>`);
  }
  const { logos } = f;
  const logoRow = [
    logos.home ? `<li><a href="${esc(logos.home.href || ORIGIN)}">${img(logos.home.src || HEADER_LOGO, logos.home.alt)}</a></li>` : '',
    logos.lhg ? `<li><a href="${esc(logos.lhg.href)}">${img(logos.lhg.src, logos.lhg.alt)}</a></li>` : '',
    logos.starAlliance ? `<li><a href="${esc(logos.starAlliance)}" title="${esc(logos.starAllianceLabel)}">:star-alliance:</a></li>` : '',
  ].filter(Boolean);
  sections.push(`<div><ul>\n${logoRow.join('\n')}\n</ul></div>`);
  sections.push(`<div><ul>\n${f.legal.map((l) => `<li>${a(l.href, l.label, sitePaths)}</li>`).join('\n')}\n</ul></div>`);
  return `${sections.join('\n')}\n`;
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const key = argv.includes('--root') ? argv[argv.indexOf('--root') + 1] : 'ch/en';
  const snap = path.join(root, 'tools/importer/bd-snapshots', HOST, key, 'homepage.html');
  const { document } = parseHTML(fs.readFileSync(snap, 'utf8'));
  const sites = path.join(root, 'tools/importer/sites/lh-swiss.json');
  const allow = fs.existsSync(sites) ? JSON.parse(fs.readFileSync(sites, 'utf8')) : { paths: [] };
  const sitePaths = new Set(allow.paths);
  const dir = path.join(root, 'content-sites/lh-swiss/content', key);
  fs.mkdirSync(dir, { recursive: true });
  // links to the site's pages relative (own-links.mjs), as the page importer does
  const pages = ownPages('lh-swiss');
  const aliases = ownAliases('lh-swiss');
  // the login and profile pages and the cockpit deep link the replica serves (lh-swiss.json served)
  const served = ownServed('lh-swiss');
  const own = (doc) => withOwnLinks(doc, 'www.swiss.com', pages, aliases, { served }).doc;
  fs.writeFileSync(path.join(dir, 'nav.plain.html'), own(navDocument(document, key, sitePaths)));
  fs.writeFileSync(path.join(dir, 'footer.plain.html'), own(footerDocument(document, sitePaths)));
  const { items } = menuOf(document);
  const f = footerOf(document);
  console.log(`${key}: nav ${items.length} top items, ${items.reduce((s, t) => s + t.columns.length, 0)} columns, ${items.reduce((s, t) => s + t.columns.reduce((x, c) => x + c.links.length, 0), 0)} links; footer ${f.columns.length} link lists, social ${f.badges.reduce((n, g) => n + g.links.length, 0)}, logos ${Object.values(f.logos).filter((v) => v && (v.src || typeof v === 'string')).length}, legal ${f.legal.length}`);
}
