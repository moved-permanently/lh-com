/* eslint-disable no-console, max-len, import/extensions, import/no-extraneous-dependencies -- tooling */
/**
 * The nav and footer documents of SWISS's sub-sites (www.swiss.com's corporate site and medical
 * services; scripts/site-languages.js SUB_SITES) from each language's captured homepage
 * (content-sites/lh-swiss-sub/snapshots-src/www.swiss.com/<sub-site>/<ll>/homepage.html), next to
 * swiss-nav.mjs (the main site's) and with its readers, in the shape of lh-com's documents:
 * - nav: the logo to the main site's homepage of the language (www's /<ll>/homepage: ch/en, ch/de
 *   on lh-swiss, else www's), the quick action "Book flight" (the burger's top link), the menu from
 *   the header's JSON ([data-dcep] "id":"lx-header-nav-horizontal": top items, their columns with
 *   the column's own link, the links), the tools: the search (corporate: its search-results page,
 *   labelled as the page's h1), the menu button's label (www's burger aria-label);
 * - footer: swiss-nav.mjs footerDocument (the sub-sites' footer is the main site's markup: four
 *   link columns, the social row, the logos, the legal links).
 * The header shows the menu in the bar and the language list (SUB_SITES header). Links: the
 * sub-sites' captured pages relative, the main site's where lh-swiss has them, the rest on www
 * (swiss-sub-import.mjs subSiteLinks).
 *
 * Usage: node tools/importer/swiss-sub-nav.mjs   (every language of both sub-sites)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import {
  dcep, linkFor, footerDocument, HEADER_LOGO,
} from './swiss-nav.mjs';
import { subSiteLinks, capturedPages, W } from './swiss-sub-import.mjs';
import { SUB_SITES } from '../../scripts/site-languages.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ORIGIN = 'https://www.swiss.com';
const clean = (s) => String(s || '').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\s+/g, ' ').trim();
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');
const a = (href, label, sitePaths) => `<a href="${esc(linkFor(href, sitePaths))}">${esc(label)}</a>`;

/** The sub-site header's menu: [{label, columns: [{label, href, links: [{label, href}]}]}]. */
export function subMenuOf(document) {
  const data = dcep(document, { id: 'lx-header-nav-horizontal' }) || {};
  return (data.menuItems || []).map((top) => ({
    label: clean(top.label),
    columns: (top.menuItems || []).map((col) => ({
      label: clean(col.label),
      href: col.href || '',
      links: (col.menuItems || []).map((l) => ({ label: clean(l.label), href: l.href || '' })).filter((l) => l.label && l.href),
    })).filter((c) => c.label || c.links.length),
  })).filter((t) => t.label);
}

/**
 * The nav document of a sub-site's language (key: corporate/en). search: the search page's path
 * and label (corporate), else none.
 */
export function subNavDocument(document, key, sitePaths, { search = null } = {}) {
  const burger = dcep(document, { id: 'lx-header-nav-burgermenu' }) || {};
  const logo = document.querySelector('header .swiss-logo a[href], header a[href] img[src*="swiss-logo"]');
  const logoHref = (logo && (logo.getAttribute('href') || logo.closest('a')?.getAttribute('href'))) || `/${key.split('/')[1]}/homepage`;
  // www's /<ll>/homepage is the main site's ch/<ll> homepage (lh-edge's entry paths)
  const ll = key.split('/')[1];
  const mainHome = sitePaths.has(`/ch/${ll}/homepage`) ? `/ch/${ll}/homepage` : `${ORIGIN}${logoHref}`;
  const brand = `<div><p><a href="${esc(mainHome)}"><img src="${ORIGIN}${HEADER_LOGO}" alt="SWISS"></a></p></div>`;
  const quick = burger.burgerMenuTopLinkUrl && burger.burgerMenuTopLinkLabel
    ? `<div><ul>\n<li>${a(burger.burgerMenuTopLinkUrl, clean(burger.burgerMenuTopLinkLabel), sitePaths)}</li>\n</ul></div>` : '<div><ul></ul></div>';
  const items = subMenuOf(document);
  const menu = `<div><ul>\n${items.map((t) => `<li>\n<p>${esc(t.label)}</p>\n<ul>\n${t.columns.map((c) => `<li>\n<p>${c.href ? a(c.href, c.label, sitePaths) : esc(c.label)}</p>\n<ul>\n${c.links.map((l) => `<li>${a(l.href, l.label, sitePaths)}</li>`).join('\n')}\n</ul>\n</li>`).join('\n')}\n</ul>\n</li>`).join('\n')}\n</ul></div>`;
  const menuLabel = clean(document.querySelector('header [aria-label][class*="burger"], header button[aria-label]')?.getAttribute('aria-label')) || 'Menu';
  const tools = search ? `<li>:search: <a href="${esc(search.href)}">${esc(search.label)}</a></li>` : '';
  const toolsSection = `<div><ul>\n${tools}\n</ul><p>${esc(menuLabel)}</p></div>`;
  return `${[brand, quick, menu, toolsSection].join('\n')}\n`;
}

/**
 * The footer document of a sub-site's language: the main site's (swiss-nav.mjs footerDocument)
 * plus the Star Alliance link of the logo row, which the sub-sites write as a
 * maui-navigation-link in the sub-footer's third column (the main site: .star-alliance-logo-wrapper).
 */
export function subFooterDocument(document, sitePaths) {
  const doc = footerDocument(document, sitePaths);
  if (doc.includes(':star-alliance:')) return doc;
  const star = document.querySelector('.subfooter .grid-col-3 [href*="staralliance"]');
  if (!star) return doc;
  const label = clean(star.querySelector('.sr-only')?.textContent) || 'Star Alliance';
  const item = `<li><a href="${esc(star.getAttribute('href'))}" title="${esc(label)}">:star-alliance:</a></li>`;
  // the logo row: the section before the legal links (footerDocument's last)
  const legal = doc.lastIndexOf('\n<div><ul>');
  const end = doc.lastIndexOf('\n</ul></div>', legal);
  if (legal < 0 || end < 0) return doc;
  return `${doc.slice(0, end)}\n${item}${doc.slice(end)}`;
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const allow = JSON.parse(fs.readFileSync(path.join(root, 'tools/importer/sites/lh-swiss.json'), 'utf8'));
  const sitePaths = new Set(allow.paths);
  const subPages = capturedPages();
  SUB_SITES.swiss.forEach((sub) => sub.languages.forEach((l) => {
    const key = `${sub.name}/${l.lang}`;
    const snap = path.join(W, 'snapshots-src/www.swiss.com', key, 'homepage.html');
    if (!fs.existsSync(snap)) { console.log(`${key}: no homepage snapshot`); return; }
    const { document } = parseHTML(fs.readFileSync(snap, 'utf8'));
    const searchPage = `/${key}/search-results`;
    const search = sub.header.search && subPages.has(searchPage)
      ? { href: searchPage, label: clean(parseHTML(fs.readFileSync(path.join(W, 'snapshots-src/www.swiss.com', `${searchPage}.html`), 'utf8')).document.querySelector('h1')?.textContent) || 'Search' } : null;
    const dir = path.join(W, 'content', key);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'nav.plain.html'), subSiteLinks(subNavDocument(document, key, sitePaths, { search }), { subPages, sitePaths, mapHosts: false }));
    fs.writeFileSync(path.join(dir, 'footer.plain.html'), subSiteLinks(subFooterDocument(document, sitePaths), { subPages, sitePaths, mapHosts: false }));
    const items = subMenuOf(document);
    console.log(`${key}: nav ${items.length} top items, ${items.reduce((s, t) => s + t.columns.length, 0)} columns, ${items.reduce((s, t) => s + t.columns.reduce((x, c) => x + c.links.length, 0), 0)} links${search ? ', search' : ''}`);
  }));
}
