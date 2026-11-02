/* eslint-disable no-console, max-len, import/extensions, import/no-extraneous-dependencies -- tooling */
/**
 * Lufthansa Group for Business' nav and footer documents (lh-b2b) from a reference root's captured
 * homepage (tools/importer/bd-snapshots/business.lufthansagroup.com/<cc>/<ll>/homepage.html), in
 * the shape of lh-com's nav and footer documents (blocks/header, blocks/footer) with B2B's own
 * header and footer (scripts/brands.js b2b header; the footer's brand-row section):
 * - nav: the logo (www's deep blue LHG for Business logo, no link: brands.js header.logoLink), the
 *   menu 1:1 from the header's JSON (data-header-config, id b2bneo-header-nav-horizontal: the top
 *   items, their sections, the sections' links; the bar's drop-downs), the search tool (www's
 *   boxed search icon: the pre-login search page), the burger's label;
 * - footer: "DE | EN" with the globe (the country and language dialog), the legal row (Imprint,
 *   Terms of use, Data protection, Terms & Conditions, Contacts; "Change Privacy Settings", a 404
 *   on www, opens our consent dialog: #privacy-settings, decision 7), the LinkedIn badge, the ©
 *   note, the brand row (the white logo, the tagline).
 * Links: pages of the site's scope (content-sites/lh-b2b/scope.json) relative, everything else on
 * www (the login, the eXperts sign-in and members area, the PartnerPlusBenefit portal, 404s).
 *
 * Usage: node tools/importer/b2b-nav.mjs [--root de/en]   (writes content-sites/lh-b2b/content/<root>/nav|footer.plain.html)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import { docName } from './b2b-scope.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const HOST = 'business.lufthansagroup.com';
const ORIGIN = `https://${HOST}`;
export const LOGO = `${ORIGIN}/content/dam/b2bneo/b2b-logo-icons/LHG_Logo_for-Business_Horizontal-standard_deep-blue_rgb.svg`;
export const LOGO_WHITE = `${ORIGIN}/content/dam/b2bneo/b2b-logo-icons/LHG_Logo_for-Business_Horizontal-standard_white_rgb.svg`;
const LABELS = {
  en: { logo: 'Lufthansa Group for Business', search: 'Search', menu: 'Toggle menu' },
  de: { logo: 'Lufthansa Group for Business', search: 'Suche', menu: 'Menü öffnen' },
};

const clean = (s) => String(s || '').replace(/[​-‍﻿]/g, '').replace(/\s+/g, ' ').trim();
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const visible = (node) => {
  if (!node) return '';
  const c = node.cloneNode(true);
  c.querySelectorAll('.sr-only, maui-screen-reader-label').forEach((n) => n.remove());
  return clean(c.textContent);
};

/** The document link of a www href: a page of the scope relative, else absolute on www. */
export function linkFor(href, scopePaths) {
  const raw = String(href || '').trim();
  if (!raw || raw.startsWith('#') || /^(mailto|tel|javascript):/i.test(raw)) return raw;
  let u;
  try { u = new URL(raw, `${ORIGIN}/`); } catch (e) { return raw; }
  if (u.hostname !== HOST) return u.href;
  const p = decodeURIComponent(u.pathname).replace(/\.html$/, '').replace(/\/$/, '');
  if (scopePaths.has(p)) return `${docName(p)}${u.search}${u.hash}`;
  return `${ORIGIN}${u.pathname}${u.search}${u.hash}`;
}

/** The header's menu: [{label, sections: [{label, links: [{label, href}]}]}]. */
export function menuOf(document) {
  const host = document.querySelector('[data-header-config]');
  let data = {};
  try { data = JSON.parse(host.getAttribute('data-header-config')); } catch (e) { data = {}; }
  return (data.menuItems || []).map((top) => ({
    label: clean(top.label),
    sections: (top.menuItems || []).map((s) => ({
      label: clean(s.label),
      links: (s.menuItems || []).map((l) => ({ label: clean(l.label), href: l.href || '' })).filter((l) => l.label && l.href),
    })).filter((s) => s.links.length),
  })).filter((t) => t.label);
}

/** The nav document (three sections: brand, menu, tools) of a root. */
export function navDocument(document, key, scopePaths) {
  const ll = key.split('/')[1];
  const labels = LABELS[ll] || LABELS.en;
  const logo = document.querySelector('header img.microsite-header__logo-img');
  const alt = clean(logo?.getAttribute('alt')) || labels.logo;
  const brand = `<div><p><img src="${LOGO}" alt="${esc(alt)}"></p></div>`;
  const menu = `<div><ul>\n${menuOf(document).map((t) => `<li>\n<p>${esc(t.label)}</p>\n<ul>\n${t.sections.map((s) => `<li>\n<p>${esc(s.label)}</p>\n<ul>\n${s.links.map((l) => `<li><a href="${esc(linkFor(l.href, scopePaths))}">${esc(l.label)}</a></li>`).join('\n')}\n</ul>\n</li>`).join('\n')}\n</ul>\n</li>`).join('\n')}\n</ul></div>`;
  const search = document.querySelector('header a.microsite-header__search[href]');
  const searchHref = linkFor(search ? search.getAttribute('href') : `/${key}/lhg4b-search/lhg4b-search-prelogin`, scopePaths);
  const burger = document.querySelector('header button.microsite-header__menu-toggle');
  const menuLabel = clean(burger?.getAttribute('aria-label')) || labels.menu;
  const tools = `<div><ul>\n<li>:search: <a href="${esc(searchHref)}">${esc(labels.search)}</a></li>\n</ul><p>${esc(menuLabel)}</p></div>`;
  return `${[brand, menu, tools].join('\n')}\n`;
}

/** The footer document of a root (www's footer-new-design). */
export function footerDocument(document, key, scopePaths) {
  const footer = document.querySelector('footer') || document;
  const sections = [];
  // the country and language button: www's "DE | EN" (the root's country and language)
  const localeText = visible(footer.querySelector('.footer-actions button, .footer-actions [class*="country"], .footer-actions'))
    .match(/[A-Z]{2}\s*\|\s*[A-Z]{2}/);
  const [cc, ll] = key.split('/');
  sections.push(`<div><p>:globe: ${esc(localeText ? localeText[0].replace(/\s*\|\s*/, ' | ') : `${cc.toUpperCase()} | ${ll.toUpperCase()}`)}</p></div>`);
  const legal = [...footer.querySelectorAll('.footer-links a[href]')].map((a) => {
    const label = visible(a);
    const href = /change-cookie-settings/.test(a.getAttribute('href')) ? '#privacy-settings' : linkFor(a.getAttribute('href'), scopePaths);
    return label ? `<li><a href="${esc(href)}">${esc(label)}</a></li>` : '';
  }).filter(Boolean);
  sections.push(`<div><ul>\n${legal.join('\n')}\n</ul></div>`);
  const social = [...footer.querySelectorAll('.footer-actions a[href]')].filter((a) => /linkedin\.com/.test(a.getAttribute('href')));
  if (social.length) sections.push(`<div><ul>\n${social.map((a) => `<li><a href="${esc(a.getAttribute('href'))}">:linkedin:</a></li>`).join('\n')}\n</ul><div class="section-metadata"><div><div>Style</div><div>badges</div></div></div></div>`);
  const copyright = visible(footer.querySelector('.footer-copyright'));
  if (copyright) sections.push(`<div><p>${esc(copyright)}</p><div class="section-metadata"><div><div>Style</div><div>note</div></div></div></div>`);
  const tagline = visible(footer.querySelector('.footer-tagline'));
  const whiteLogo = footer.querySelector('img.footer-logo');
  const whiteAlt = clean(whiteLogo?.getAttribute('alt')) || 'Lufthansa Group for Business';
  sections.push(`<div><p><img src="${LOGO_WHITE}" alt="${esc(whiteAlt)}"></p>${tagline ? `<p>${esc(tagline)}</p>` : ''}<div class="section-metadata"><div><div>Style</div><div>brand-row</div></div></div></div>`);
  return `${sections.join('\n')}\n`;
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const key = argv.includes('--root') ? argv[argv.indexOf('--root') + 1] : 'de/en';
  const snap = path.join(root, 'tools/importer/bd-snapshots', HOST, key, 'homepage.html');
  const { document } = parseHTML(fs.readFileSync(snap, 'utf8'));
  const scope = JSON.parse(fs.readFileSync(path.join(root, 'content-sites/lh-b2b/scope.json'), 'utf8'));
  const scopePaths = new Set(Object.keys(scope.documents));
  const dir = path.join(root, 'content-sites/lh-b2b/content', key);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'nav.plain.html'), navDocument(document, key, scopePaths));
  fs.writeFileSync(path.join(dir, 'footer.plain.html'), footerDocument(document, key, scopePaths));
  const items = menuOf(document);
  console.log(`${key}: nav ${items.length} top items, ${items.reduce((s, t) => s + t.sections.length, 0)} sections, ${items.reduce((s, t) => s + t.sections.reduce((x, c) => x + c.links.length, 0), 0)} links; footer written`);
}
