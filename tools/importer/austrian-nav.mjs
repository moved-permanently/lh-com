/* eslint-disable no-console, max-len, import/extensions, import/no-extraneous-dependencies -- tooling */
/**
 * Austrian's nav and footer documents (lh-austrian; built as ita-nav.mjs) from a reference root's captured homepage
 * (tools/importer/bd-snapshots/www.austrian.com/<cc>/<ll>/homepage.html), in the shape of
 * lh-com's nav and footer documents (blocks/header, blocks/footer):
 * - nav: the red logo (www's /etc/designs/os/clientlib-all/vite/img/austrian-logo.svg),
 *   the quick actions ([data-dcep] dcep-header-quick-action-links), the menu 1:1 from the
 *   header's JSON ([data-dcep] "id":"common-header-nav-horizontal": top items, their columns
 *   with the column's own link, the columns' links), the tools (accessibility and help from the
 *   JSON, login: www's Travel ID login, the country and language with the selector's countries);
 * - footer: the white "servus" wordmark (section Style wordmark), the three link lists, the payment
 *   logos and social links (Style badges), the legal row (cookie settings: #privacy-settings), the
 *   white logo row (Austrian, member of Lufthansa Group, Star Alliance); www's footer has no
 *   country selector.
 * Links: pages of the site's documents (tools/importer/sites/lh-austrian.json) relative, everything
 * else on www.austrian.com absolute; www's own DAM images absolute on www (Edge Delivery copies
 * them at preview).
 * navTargets(html): the page paths the header menu, quick actions and footer link to (the scope
 * adds those the sitemap misses).
 *
 * Usage: node tools/importer/austrian-nav.mjs [--root at/en]   (writes content-sites/lh-austrian/content/<root>/nav|footer.plain.html)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import { ownPages, ownAliases, withOwnLinks } from './own-links.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const HOST = 'www.austrian.com';
const ORIGIN = `https://${HOST}`;
export const HEADER_LOGO = '/etc/designs/os/clientlib-all/vite/img/austrian-logo.svg';
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

/** A www page path (/<cc>/<ll>/..., .html and a trailing slash dropped), or null for other hosts. */
export function wwwPath(href) {
  let u;
  try { u = new URL(String(href || '').trim(), `${ORIGIN}/`); } catch (e) { return null; }
  if (!/^(www\.|)?austrian\.com$/.test(u.hostname)) return null;
  return decodeURIComponent(u.pathname).replace(/^\/content\/aua\/markets(?=\/)/, '').replace(/\.html$/, '').replace(/\/$/, '') || '/';
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
  return `${ORIGIN}${u.pathname.replace(/^\/content\/aua\/markets(?=\/)/, '')}${u.search}${u.hash}`;
}

const a = (href, label, sitePaths) => `<a href="${esc(linkFor(href, sitePaths))}">${esc(label)}</a>`;
// www images Edge Delivery refuses at preview (an SVG holding a 56 KB embedded PNG): a local
// rendering of the same drawing, uploaded to DA by da-upload.mjs (/media-da/)
export const LOCAL_IMAGES = {
  // the same 56 KB SVG with an embedded PNG as ITA's (lh-ita's rendering)
  '/content/dam/austrian/global/icons/svg-white/paypal.svg': '/media-da/austrian/paypal-white.png',
  // path-only SVGs of 409 and 218 KB for 32px icons (/at/en/book/flights/giftvoucher)
  '/content/dam/aua/icons/os-world-of-austrian-chevron_32px.svg': '/media-da/austrian/os-world-of-austrian-chevron_32px.png',
  '/content/dam/aua/icons/service-offline-payment_32px.svg': '/media-da/austrian/service-offline-payment_32px.png',
  // the other path-only 32px icons of about 400 KB among the reference roots' 87 SVGs (fetched
  // 2026-10-31; the rest are 21 KB or less): /fly/on-board/lhg-wifi and others
  '/content/dam/aua/icons/ife-audio_32px.svg': '/media-da/austrian/ife-audio_32px.png',
  '/content/dam/aua/icons/service-checkin_32px.svg': '/media-da/austrian/service-checkin_32px.png',
  '/content/dam/aua/icons/product-add-pass_32px.svg': '/media-da/austrian/product-add-pass_32px.png',
  '/content/dam/aua/icons/product-train-carrier_32px.svg': '/media-da/austrian/product-train-carrier_32px.png',
};

/** A document's images Edge Delivery refuses (LOCAL_IMAGES) as their local renderings. */
export const withLocalImages = (doc) => Object.entries(LOCAL_IMAGES).reduce((d, [www, own]) => d
  .replace(new RegExp(`src="(?:https://www\\.austrian\\.com)?${www.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"]*"`, 'g'), `src="${own}"`), doc);
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
        links: (col.menuItems || []).map((l) => ({ label: clean(l.label), href: l.href || '' })).filter((l) => l.label && l.href),
      })).filter((c) => c.label || c.links.length),
    })).filter((t) => t.label),
  };
}

/** The footer's parts from the snapshot (Austrian's: .container-brand and .subfooter). */
export function footerOf(document) {
  const footer = document.querySelector('footer') || document;
  const brand = footer.querySelector('.container-brand');
  const linkOf = (li) => li.querySelector('a[href], maui-navigation-link[href]');
  const lists = [...(brand?.querySelectorAll('.link-list') || [])];
  const columns = lists.filter((l) => l.querySelector(':scope > ul.vertical')).map((col) => ({
    heading: visible(col.querySelector('.hidden-sm-down h3, h3')),
    links: [...col.querySelectorAll('ul.vertical > li')].map(linkOf).filter(Boolean)
      .map((x) => ({ label: visible(x), href: x.getAttribute('href') })).filter((l) => l.label && l.href),
  })).filter((c) => c.links.length);
  const badges = lists.filter((l) => l.querySelector(':scope > ul.horizontal')).map((g) => ({
    heading: visible(g.querySelector('h3')),
    links: [...g.querySelectorAll('ul.horizontal li')].map(linkOf).filter(Boolean).map((x) => {
      const im = x.querySelector('img');
      return { href: x.getAttribute('href'), src: im?.getAttribute('src') || '', alt: clean(im?.getAttribute('alt')) || visible(x) };
    }).filter((l) => l.href && l.src),
  })).filter((g) => g.links.length);
  const legal = [...(brand?.querySelectorAll('ul.responsive > li') || [])].map((li) => {
    const x = li.querySelector('a');
    if (!x) return null;
    const label = visible(x);
    // the cookie settings open the consent manager (OneTrust's optanon-show-settings on www)
    const href = /optanon-show-settings/.test(x.getAttribute('class') || '') ? '#privacy-settings' : x.getAttribute('href');
    return label && href ? { label, href } : null;
  }).filter(Boolean);
  const wordmark = brand?.querySelector('img[src*="servus-logo"]');
  const note = visible(brand?.querySelector('.footer-payment-note'));
  const logos = footer.querySelector('.subfooter');
  const home = logos?.querySelector('.os-logo');
  const lhg = logos?.querySelector('.lhg-logo');
  const imgOf = (x) => (x ? { href: x.getAttribute('href'), src: x.querySelector('img')?.getAttribute('src'), alt: clean(x.querySelector('img')?.getAttribute('alt')) } : null);
  return {
    columns,
    badges,
    legal,
    note,
    wordmark: wordmark ? { src: wordmark.getAttribute('src'), alt: clean(wordmark.getAttribute('alt')) || 'servus' } : null,
    logos: {
      home: imgOf(home),
      lhg: imgOf(lhg),
      starAlliance: logos?.querySelector('.star-alliance-logo-wrapper')?.getAttribute('href') || '',
      starAllianceLabel: clean(logos?.querySelector('.star-alliance-logo')?.getAttribute('aria-label')) || 'Star Alliance',
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
  const logoAlt = clean(logoImg?.getAttribute('alt')) || 'Austrian Airlines';
  const brand = `<div><p><a href="/${key}/homepage">${img(HEADER_LOGO, logoAlt)}</a></p></div>`;
  const quickList = `<div><ul>\n${quick.map((l) => `<li>${a(l.url, clean(l.label), sitePaths)}</li>`).join('\n')}\n</ul></div>`;
  const menu = `<div><ul>\n${items.map((t) => `<li>\n<p>${esc(t.label)}</p>\n<ul>\n${t.columns.map((c) => `<li>\n<p>${c.href ? a(c.href, c.label, sitePaths) : esc(c.label)}</p>\n<ul>\n${c.links.map((l) => `<li>${a(l.href, l.label, sitePaths)}</li>`).join('\n')}\n</ul>\n</li>`).join('\n')}\n</ul>\n</li>`).join('\n')}\n</ul></div>`;
  const options = [...document.querySelectorAll('maui-modal.country-language-selector-modal maui-select maui-option[optionvalue]')]
    .map((o) => ({ code: clean(o.getAttribute('optionvalue')).toLowerCase(), name: visible(o) })).filter((o) => o.code && o.name);
  const seen = new Set();
  const countries = options.filter((o) => !seen.has(o.code) && seen.add(o.code));
  const lang = key.split('/')[1];
  const localeLabel = visible(document.querySelector('header .dcep-country-and-language-selection .country-language-text'))
    || visible(document.querySelector('.dcep-country-and-language-selection .country-language-text')) || key;
  const tools = [
    data.accessibilityUrl && data.accessibilityTextLabel ? `<li>:wheelchair: ${a(data.accessibilityUrl, clean(data.accessibilityTextLabel), sitePaths)}</li>` : '',
    data.supportUrl && data.supportTextLabel ? `<li>:help: ${a(data.supportUrl, clean(data.supportTextLabel), sitePaths)}</li>` : '',
    // the cart is a session overlay on www: a link to www's homepage (as lh-com's nav importer)
    document.querySelector('.dcep-shopping-cart') ? `<li>:cart: <a href="${ORIGIN}/${key}/homepage">${esc(clean(document.querySelector('.dcep-shopping-cart [name]')?.getAttribute('name')) || 'Shopping cart')}</a></li>` : '',
    // the login is www's (Travel ID); the login and profile app shells are not on the site
    login.userAuthorizeUrl ? `<li>:login: <a href="${esc(login.userAuthorizeUrl.replace(/state=[^&]*/, `state=${encodeURIComponent(`/${key}/homepage`)}`))}">${esc(visible(document.querySelector('.dcep-login-portlet .login-portlet-link')) || 'Login')}</a></li>` : '',
    `<li>:globe: ${esc(localeLabel)}${countries.length ? `\n<ul>\n${countries.map((c) => `<li><a href="${ORIGIN}/${c.code}/${lang}/homepage">${esc(c.name)}</a></li>`).join('\n')}\n</ul>` : ''}</li>`,
  ].filter(Boolean);
  const menuLabel = clean(document.querySelector('.header-and-flyout-burger-menu')?.getAttribute('aria-label')) || visible(document.querySelector('.header-and-flyout-burger-menu')) || 'Menu';
  const toolsSection = `<div><ul>\n${tools.join('\n')}\n</ul><p>${esc(menuLabel)}</p></div>`;
  return `${[brand, quickList, menu, toolsSection].join('\n')}\n`;
}

/** The footer document of a root (Austrian's: no country selector in the footer). */
export function footerDocument(document, sitePaths) {
  const f = footerOf(document);
  const sections = [];
  // the white "servus" wordmark at the top of the red link area (section Style wordmark)
  if (f.wordmark) sections.push(`<div><p>${img(f.wordmark.src, f.wordmark.alt)}</p><div class="section-metadata"><div><div>Style</div><div>wordmark</div></div></div></div>`);
  sections.push(`<div>${f.columns.map((c) => `<h3>${esc(c.heading)}</h3><ul>\n${c.links.map((l) => `<li>${a(l.href, l.label, sitePaths)}</li>`).join('\n')}\n</ul>`).join('')}</div>`);
  if (f.badges.length) {
    const meta = '<div class="section-metadata"><div><div>Style</div><div>badges</div></div></div>';
    sections.push(`<div>${f.badges.map((g) => `<h3>${esc(g.heading)}</h3><ul>\n${g.links.map((l) => `<li><a href="${esc(linkFor(l.href, sitePaths))}">${img(l.src, l.alt)}</a></li>`).join('\n')}\n</ul>`).join('')}${meta}</div>`);
  }
  sections.push(`<div><ul>\n${f.legal.map((l) => `<li>${a(l.href, l.label, sitePaths)}</li>`).join('\n')}\n</ul></div>`);
  if (f.note) sections.push(`<div><p>${esc(f.note)}</p><div class="section-metadata"><div><div>Style</div><div>note</div></div></div></div>`);
  const { logos } = f;
  const logoRow = [
    logos.home ? `<li><a href="${esc(logos.home.href || ORIGIN)}">${img(logos.home.src || HEADER_LOGO, logos.home.alt)}</a></li>` : '',
    logos.lhg ? `<li><a href="${esc(logos.lhg.href)}">${img(logos.lhg.src, logos.lhg.alt)}</a></li>` : '',
    logos.starAlliance ? `<li><a href="${esc(logos.starAlliance)}" title="${esc(logos.starAllianceLabel)}">:star-alliance:</a></li>` : '',
  ].filter(Boolean);
  sections.push(`<div><ul>\n${logoRow.join('\n')}\n</ul></div>`);
  return `${sections.join('\n')}\n`;
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const key = argv.includes('--root') ? argv[argv.indexOf('--root') + 1] : 'at/en';
  const snap = path.join(root, 'tools/importer/bd-snapshots', HOST, key, 'homepage.html');
  const { document } = parseHTML(fs.readFileSync(snap, 'utf8'));
  const sites = path.join(root, 'tools/importer/sites/lh-austrian.json');
  const allow = fs.existsSync(sites) ? JSON.parse(fs.readFileSync(sites, 'utf8')) : { paths: [] };
  const sitePaths = new Set(allow.paths);
  const dir = path.join(root, 'content-sites/lh-austrian/content', key);
  fs.mkdirSync(dir, { recursive: true });
  // links to the site's pages relative (own-links.mjs), as the page importer does
  const pages = ownPages('lh-austrian');
  const aliases = ownAliases('lh-austrian');
  const own = (doc) => withOwnLinks(doc, 'www.austrian.com', pages, aliases).doc;
  fs.writeFileSync(path.join(dir, 'nav.plain.html'), own(navDocument(document, key, sitePaths)));
  fs.writeFileSync(path.join(dir, 'footer.plain.html'), own(footerDocument(document, sitePaths)));
  const { items } = menuOf(document);
  const f = footerOf(document);
  console.log(`${key}: nav ${items.length} top items, ${items.reduce((s, t) => s + t.columns.length, 0)} columns, ${items.reduce((s, t) => s + t.columns.reduce((x, c) => x + c.links.length, 0), 0)} links; footer ${f.columns.length} link lists, ${f.badges.map((g) => `${g.heading} ${g.links.length}`).join(', ')}, legal ${f.legal.length}, wordmark ${f.wordmark ? 'yes' : 'no'}, note ${f.note ? 'yes' : 'no'}`);
}
