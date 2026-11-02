/* eslint-disable no-console, max-len, import/extensions, import/no-extraneous-dependencies -- tooling */
/**
 * The nav and footer documents of SWISS's magazine (www.swiss.com/magazine/<ll>, lh-swiss;
 * scripts/site-languages.js SUB_SITES magazine) from each language's captured front page
 * (content-sites/lh-swiss-mag/snapshots-src/www.swiss.com/magazine/<ll>.html), in the shape of
 * lh-com's documents (blocks/header, blocks/footer):
 * - nav: the logo to the magazine's front page (www's "Swiss Magazine" logo link), the quick links
 *   (www's top bar: Inside SWISS, Reisen, Schweiz), the menu (www's off-canvas menu: each section
 *   with its categories, then its own links: Kontakt, Flug buchen, Print; the empty space-holder
 *   link left out), the tools: the menu button's label (www's burger aria-label); the language list
 *   in the bar (SUB_SITES header languages 'bar');
 * - footer: the social links (badges, lh-swiss's footer icons), the logos (SWISS, Star Alliance),
 *   the legal row (privacy settings: #privacy-settings) and "© Swiss International Air Lines"
 *   (note).
 * Links: the magazine's captured pages relative (swiss-magazine-import.mjs magazineLinks), the main
 * site's where lh-swiss has them, the rest on www.
 *
 * Usage: node tools/importer/swiss-magazine-nav.mjs   (every language of the magazine)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import { HEADER_LOGO } from './swiss-nav.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ORIGIN = 'https://www.swiss.com';
const DA = 'https://content.da.live/moved-permanently/lh-swiss';
const clean = (s) => String(s || '').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\s+/g, ' ').trim();
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');
const a = (href, label) => `<a href="${esc(href)}">${esc(label)}</a>`;

/** www's off-canvas menu: [{label, links: [{label, href}]}] (a section) or [{label, href}] (a link). */
export function magazineMenuOf(document) {
  const list = document.querySelector('header .navbar--off-canvas .cmp-navigation > ul');
  if (!list) return [];
  // a section: its accordion button and its list of categories; else the item's own link
  return [...list.children].filter((li) => li.tagName === 'LI').map((li) => {
    const button = li.querySelector(':scope > button');
    if (button) {
      const links = [...li.querySelectorAll(':scope > ul > li > a[href]')].map((x) => ({ label: clean(x.textContent), href: x.getAttribute('href') })).filter((l) => l.label);
      return { label: clean(button.textContent), links };
    }
    const x = li.querySelector(':scope > a[href]');
    return x ? { label: clean(x.textContent), href: x.getAttribute('href') } : null;
  }).filter((t) => t && t.label && !/\/space-holder$/.test(t.href || ''));
}

/** The nav document of the magazine's language (ll: de, en). */
export function magazineNavDocument(document, ll) {
  const logo = document.querySelector('header .navbar-top-bar a[href]');
  const home = (logo && logo.getAttribute('href')) || `/magazine/${ll}`;
  const brand = `<div><p><a href="${esc(home)}"><img src="${ORIGIN}${HEADER_LOGO}" alt="${esc(clean(logo && logo.textContent) || 'Swiss Magazine')}"></a></p></div>`;
  const top = [...document.querySelectorAll('header .navbar-top-bar .cmp-navigation a[href]')]
    .filter((x) => !x.closest('.navbar--off-canvas'));
  const quick = `<div><ul>\n${top.map((x) => `<li>${a(x.getAttribute('href'), clean(x.textContent))}</li>`).join('\n')}\n</ul></div>`;
  const items = magazineMenuOf(document);
  const menu = `<div><ul>\n${items.map((t) => (t.links
    ? `<li>\n<p>${esc(t.label)}</p>\n<ul>\n${t.links.map((l) => `<li>${a(l.href, l.label)}</li>`).join('\n')}\n</ul>\n</li>`
    : `<li>${a(t.href, t.label)}</li>`)).join('\n')}\n</ul></div>`;
  const menuLabel = clean([...document.querySelectorAll('header button[aria-label]')].find((b) => /menu|menü/i.test(b.getAttribute('aria-label')) && !/schlie|close/i.test(b.getAttribute('aria-label')))?.getAttribute('aria-label')) || 'Menu';
  const tools = `<div><ul>\n</ul><p>${esc(menuLabel)}</p></div>`;
  return `${[brand, quick, menu, tools].join('\n')}\n`;
}

// the social links' icons in lh-swiss's DA (the main site's footer icons) by host
const SOCIAL = [
  [/linkedin\./, 'linkedin', 'LinkedIn'], [/instagram\./, 'instagram', 'Instagram'], [/tiktok\./, 'tiktok', 'TikTok'],
  [/facebook\./, 'facebook', 'Facebook'], [/(^|\/\/)(x|twitter)\.com/, 'x', 'X'], [/threads\./, 'threads', 'Threads'],
  [/youtube\./, 'youtube', 'YouTube'],
];

/** The footer document of the magazine's language. */
export function magazineFooterDocument(document) {
  const footer = document.querySelector('footer');
  if (!footer) return '';
  const social = [...footer.querySelectorAll('.social-media a[href]')].map((x) => {
    const href = x.getAttribute('href');
    const kind = SOCIAL.find(([re]) => re.test(href));
    if (!kind) return '';
    // www's label ("Besuchen Sie uns auf LinkedIn"); its untranslated keys (social.icon.tiktok): the name
    const label = clean(x.textContent);
    const alt = /^social\.icon\./.test(label) || !label ? kind[2] : label;
    return `<li><a href="${esc(href)}"><img src="${DA}/content/dam/lx/icons/footer-${kind[1]}.svg" alt="${esc(alt)}"></a></li>`;
  }).filter(Boolean);
  const badges = social.length ? `<div><ul>\n${social.join('\n')}\n</ul><div class="section-metadata"><div><div>Style</div><div>badges</div></div></div></div>` : '';
  const legalRow = footer.querySelector('.row.legal, .legal');
  const links = legalRow ? [...legalRow.querySelectorAll('a[href]')] : [];
  const swiss = links.find((x) => /^https?:\/\/(www\.)?swiss\.com\/?$/.test(x.getAttribute('href')));
  const star = links.find((x) => /staralliance/.test(x.getAttribute('href')));
  const logos = [
    swiss ? `<li><a href="${ORIGIN}"><img src="${DA}${HEADER_LOGO}" alt="SWISS"></a></li>` : '',
    star ? `<li><a href="${esc(star.getAttribute('href'))}" title="Star Alliance">:star-alliance:</a></li>` : '',
  ].filter(Boolean);
  const legal = links.filter((x) => x !== swiss && x !== star && clean(x.textContent)).map((x) => {
    const href = x.getAttribute('href');
    return `<li>${a(href === '#' ? '#privacy-settings' : href, clean(x.textContent))}</li>`;
  });
  const copy = clean(legalRow && [...legalRow.querySelectorAll('p, span, div')].map((e) => clean(e.textContent)).find((t) => /^©/.test(t)));
  const note = `<div><p>${esc(copy || '© Swiss International Air Lines')}</p><div class="section-metadata"><div><div>Style</div><div>note</div></div></div></div>`;
  return `${[badges, `<div><ul>\n${logos.join('\n')}\n</ul></div>`, `<div><ul>\n${legal.join('\n')}\n</ul></div>`, note].filter(Boolean).join('\n')}\n`;
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const { magazineLinks, W, capturedMagazine } = await import('./swiss-magazine-import.mjs');
  const allow = JSON.parse(fs.readFileSync(path.join(root, 'tools/importer/sites/lh-swiss.json'), 'utf8'));
  const sitePaths = new Set(allow.paths);
  const pages = capturedMagazine();
  ['de', 'en'].forEach((ll) => {
    const snap = path.join(W, 'snapshots-src/www.swiss.com/magazine', `${ll}.html`);
    if (!fs.existsSync(snap)) { console.log(`magazine/${ll}: no front page snapshot`); return; }
    const { document } = parseHTML(fs.readFileSync(snap, 'utf8'));
    const dir = path.join(W, 'content/magazine', ll);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'nav.plain.html'), magazineLinks(magazineNavDocument(document, ll), { pages, sitePaths, mapHosts: false }));
    fs.writeFileSync(path.join(dir, 'footer.plain.html'), magazineLinks(magazineFooterDocument(document), { pages, sitePaths, mapHosts: false }));
    const items = magazineMenuOf(document);
    console.log(`magazine/${ll}: nav ${items.filter((t) => t.links).length} sections, ${items.reduce((n, t) => n + (t.links ? t.links.length : 0), 0)} categories, ${items.filter((t) => !t.links).length} links`);
  });
}
