/* eslint-disable no-console, max-len, no-underscore-dangle, import/extensions -- tooling */
/**
 * TAP Air Portugal's nav and footer documents (lh-tap: /<locale>/nav and /<locale>/footer) from
 * the locale's homepage capture (__NEXT_DATA__ headerMenu, footerMenu and siteSettings), in the
 * shape of lh-com's documents (blocks/header, blocks/footer) as Air Dolomiti's
 * (airdolomiti-nav.mjs), on the TAP theme:
 * - nav: 1. TAP's logo (the inline SVG of www's header, as a file) linking the homepage; 2. quick
 *   actions: www's check-in and manage-booking widgets (#special-anchor-*: out of scope, on www);
 *   3. the mega menu, www's top level: the tabs (Planear viagem, Os meus voos, Check-in, TAP
 *   Miles&Go, Ajuda; Check-in links the homepage's booking box), each column a heading linking its
 *   page, its links and "See all" where www shows it (showSeeAll; www's menu-see-all text), a tab's
 *   banner (bannerMenu) as a row of its own: picture, bold title, line, link; www's widget
 *   entries (check-in-form) left out, a column of widgets only linking the tab's target, the
 *   signed-in ones (requireLogin) left out; 4. tools: help (:help:), the other language's homepage
 *   (the language switch), the menu label.
 * - footer: the link columns (other websites, legal resources, featured destinations; www's
 *   cookie settings, its consent layer, left out), a section with the style badges: the app
 *   stores (www's badge pictures from the media archives, else their names) under "TAP App" and
 *   the social links (:facebook:, :instagram:, :linkedin:, :youtube:, :x:, :tiktok: tokens) under
 *   "Siga-nos" (www's texts), the copyright as a note, and the logo row.
 * Links as tap-import.mjs's linkOf: pages of the site relative, the rest on www.flytap.com.
 *
 * Usage: node tools/importer/tap-nav.mjs --archive <unpacked pages archive> [--archive ...]
 *          [--media <unpacked media archive> ...] [--locale pt-pt] [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  linkOf, docPath, WWW, mediaIndex, mediaResolver, altOf,
} from './tap-import.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(root, 'content-sites/lh-tap/content');
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = (s) => esc(s).replace(/"/g, '&quot;');

const SETUP = {
  pt: {
    seeAll: 'Ver todos', logoAlt: 'TAP Air Portugal, voltar à página inicial', menu: 'Menu', help: ['Ajuda', '/ajuda'], appStore: 'App Store', googlePlay: 'Google Play', follow: 'Siga-nos', app: 'TAP App', rights: 'Todos os direitos reservados.',
  },
  en: {
    seeAll: 'See all', logoAlt: 'TAP Air Portugal, back to the homepage', menu: 'Menu', help: ['Help', '/help'], appStore: 'App Store', googlePlay: 'Google Play', follow: 'Follow us', app: 'TAP App', rights: 'All rights reserved.',
  },
  // the other markets: their help tab as www's header names it
  es: {
    seeAll: 'Ver todo', logoAlt: 'TAP Air Portugal, volver a la página de inicio', menu: 'Menú', help: ['Ayuda', '/ayuda'], appStore: 'App Store', googlePlay: 'Google Play', follow: 'Síguenos', app: 'TAP App', rights: 'Todos los derechos reservados.',
  },
  fr: {
    seeAll: 'Voir tout', logoAlt: 'TAP Air Portugal, retour à la page d’accueil', menu: 'Menu', help: ['Aide', '/aide'], appStore: 'App Store', googlePlay: 'Google Play', follow: 'Suivez-nous', app: 'TAP App', rights: 'Tous droits réservés.',
  },
  de: {
    seeAll: 'Alle anzeigen', logoAlt: 'TAP Air Portugal, zurück zur Startseite', menu: 'Menü', help: ['Hilfe', '/hilfe'], appStore: 'App Store', googlePlay: 'Google Play', follow: 'Folgen Sie uns', app: 'TAP App', rights: 'Alle Rechte vorbehalten.',
  },
  it: {
    seeAll: 'Visualizzi tutti', logoAlt: 'TAP Air Portugal, torna alla homepage', menu: 'Menu', help: ['Aiuto', '/assistenza'], appStore: 'App Store', googlePlay: 'Google Play', follow: 'Seguici', app: 'TAP App', rights: 'Tutti i diritti riservati.',
  },
  pl: {
    seeAll: 'Wszystkie informacje', logoAlt: 'TAP Air Portugal, powrót do strony głównej', menu: 'Menu', help: ['Pomoc', '/pomoc'], appStore: 'App Store', googlePlay: 'Google Play', follow: 'Obserwuj nas', app: 'TAP App', rights: 'Wszelkie prawa zastrzeżone.',
  },
};
// the language switch per root: www's markets have two languages, the market's and English; a
// market's root links the same market's English (pt-br: en-br), an English root the market's
// language (en-pt: pt-pt), on lh-tap when it has the root, else on www
const MARKET_LANG = {
  pt: 'pt', br: 'pt', es: 'es', fr: 'fr', de: 'de', it: 'it', pl: 'pl',
};
const LANG_NAME = {
  pt: 'Português', en: 'English', es: 'Español', fr: 'Français', de: 'Deutsch', it: 'Italiano', pl: 'Polski',
};
function otherOf(locale) {
  const [lang, cc] = locale.split('-');
  // an English root of a market with no language of its own in MARKET_LANG (en-us, en-ch, en-gb):
  // the market's Portuguese, TAP's language (www has a pt root in its markets), never itself
  const to = lang === 'en' ? MARKET_LANG[cc] || 'pt' : 'en';
  return [LANG_NAME[to], `${to}-${cc}`];
}
const SOCIAL = ['facebook', 'instagram', 'linkedin', 'youtube', 'x', 'tiktok'];
const isWidget = (x) => Boolean(x.component);
// www shows these only to a signed-in visitor (the flights to check in): left out
const isSignedIn = (x) => x.requireLogin === true;
const isSpecial = (x) => /^#special-anchor/.test(x.link || '');

const ctxOf = (site) => ({ anchors: new Map(), ...site, locale: site.locale || docPath(site.url).split('/')[1] });
const a = (href, label, c) => `<a href="${attr(linkOf(href, c))}">${esc(label)}</a>`;
const li = (x, c) => (x.link ? `<li>${a(x.link, x.title, c)}</li>` : '');

/** A text of www's translations (pageProps._nextI18Next: the language's namespaces), or null. */
function textOf(pp, lang, key) {
  const store = pp._nextI18Next && pp._nextI18Next.initialI18nStore;
  const ns = store && (store[lang] || store[Object.keys(store)[0]]);
  if (!ns) return null;
  const hit = Object.values(ns).find((n) => n && typeof n === 'object' && typeof n[key] === 'string');
  return hit ? hit[key] : null;
}

/** A rich text's words (www's banner line: AEM's JSON node tree). */
const plainText = (nodes) => (nodes || []).map((n) => (n.nodeType === 'text' ? n.value : plainText(n.content))).join('').trim();

/** The banner's picture from the media archives (by its Dynamic Media URL or path), or nothing. */
function bannerImg(image, media, lang) {
  if (!image) return '';
  const keys = [image._dynamicUrl && image._dynamicUrl.split('?')[0], image._path, image._publishUrl].filter(Boolean);
  const m = keys.map((k) => media(k)).find(Boolean);
  const src = m && (typeof m === 'string' ? m : m.eds);
  return src ? `<img src="${attr(src)}" alt="${attr(altOf(image.description || image.title, lang))}">` : '';
}

/** The nav document's HTML. */
export function navHtml(pp, site) {
  const c = ctxOf(site);
  const lang = c.locale.split('-')[0];
  const S = SETUP[lang] || SETUP.en;
  const menu = pp.headerMenu || [];
  const logo = `<div><p><a href="/${c.locale}"><img src="${attr(site.logo)}" alt="${attr(S.logoAlt)}"></a></p></div>`;
  // quick actions: www's widgets (the Check-in tab, the manage-booking entry)
  const quick = [];
  menu.forEach((t) => {
    if (isSpecial(t)) quick.push([t.link, t.title]);
    (t.children || []).forEach((col) => (col.children || []).forEach((x) => { if (isSpecial(x)) quick.push([x.link, col.title]); }));
  });
  const quickHtml = `<div><ul>${quick.map(([h, l]) => `<li>${a(h, l, c)}</li>`).join('')}</ul></div>`;
  // www's top level (Planear viagem, Os meus voos, Check-in, TAP Miles&Go, Ajuda): an item's title
  // (a link where www's has one: Check-in, the homepage's booking box), its columns (a heading
  // linking the column's page, its links, "See all" under them where www shows it: showSeeAll),
  // the menu's banner (bannerMenu) as a row of its own: picture, title, line, link. A column of
  // www's widgets only (the check-in form) links the item's own target; sign-in widgets left out.
  const seeAll = textOf(pp, lang, 'menu-see-all') || S.seeAll;
  const tabs = menu.filter((t) => (t.children || []).length).map((t) => {
    const cols = (t.children || []).filter((col) => !isSignedIn(col)).map((col) => {
      const links = (col.children || []).filter((x) => !isWidget(x) && !isSignedIn(x) && x.link).map((x) => li(x, c)).join('');
      const target = col.link || (!links && t.link) || null;
      if (!links && !target) return '';
      const head = target ? `<p>${a(target, col.title, c)}</p>` : `<p>${esc(col.title)}</p>`;
      const all = links && col.showSeeAll && col.link ? `<p>${a(col.link, seeAll, c)}</p>` : '';
      return `<li>${head}${links ? `<ul>${links}</ul>` : ''}${all}</li>`;
    });
    const b = t.bannerMenu;
    if (b && b.title && b.ctaUrl) {
      const pic = site.media ? bannerImg(b.image, site.media, lang) : '';
      const line = b.description && b.description.json ? plainText(b.description.json) : '';
      cols.push(`<li>${pic ? `<p>${pic}</p>` : ''}<p><strong>${esc(b.title)}</strong></p>${line ? `<p>${esc(line)}</p>` : ''}<p>${a(b.ctaUrl, b.ctaLabel || b.title, c)}</p></li>`);
    }
    const title = t.link ? a(t.link, t.title, c) : esc(t.title);
    return `<li><p>${title}</p><ul>${cols.join('')}</ul></li>`;
  });
  const megaHtml = `<div><ul>${tabs.join('')}</ul></div>`;
  const [otherLabel, otherLocale] = otherOf(c.locale);
  const otherHome = c.scope.has(`/${otherLocale}`) ? `/${otherLocale}` : `${WWW}/${otherLocale}`;
  const tools = `<div><ul><li>:help: ${a(S.help[1], S.help[0], c)}</li><li><a href="${attr(otherHome)}">${esc(otherLabel)}</a></li></ul><p>${esc(S.menu)}</p></div>`;
  return `${logo}\n${quickHtml}\n${megaHtml}\n${tools}\n`;
}

/** The footer document's HTML. */
export function footerHtml(pp, site) {
  const c = ctxOf(site);
  const lang = c.locale.split('-')[0];
  const S = SETUP[lang] || SETUP.en;
  const cols = (pp.footerMenu || []).map((col) => {
    const links = (col.children || []).filter((x) => !isWidget(x) && x.link).map((x) => li(x, c)).join('');
    return links ? `<h3>${esc(col.title)}</h3><ul>${links}</ul>` : '';
  }).join('');
  const ss = pp.siteSettings || {};
  // the store badges as www shows them (its pictures /images/download-*.webp, from the media
  // archives), else the store names as links
  const badge = (file) => {
    const m = site.media ? site.media(`${WWW}/images/${file}`) : null;
    return m && (typeof m === 'string' ? m : m.eds);
  };
  const apps = [[ss.appStore, S.appStore, 'download-app-store.webp'], [ss.googlePlay, S.googlePlay, 'download-google-play.webp']].filter(([h]) => h)
    .map(([h, l, file]) => { const src = badge(file); return `<li><a href="${attr(h)}">${src ? `<img src="${attr(src)}" alt="${attr(l)}">` : esc(l)}</a></li>`; }).join('');
  const social = SOCIAL.filter((k) => ss[k]).map((k) => `<li><a href="${attr(ss[k])}">:${k}:</a></li>`).join('');
  // www's side card: "Siga-nos" over the icons, "TAP App" over the badges (its texts, else ours)
  const follow = textOf(pp, lang, 'footer-follow-us') || S.follow;
  const app = textOf(pp, lang, 'footer-tap-app') || S.app;
  const badges = `<div>${social ? `<h3>${esc(follow)}</h3><ul>${social}</ul>` : ''}${apps ? `<h3>${esc(app)}</h3><ul>${apps}</ul>` : ''}<div class="section-metadata"><div><div>Style</div><div>badges</div></div></div></div>`;
  // www's copyright bar ("© 2026, TAP. Todos os direitos reservados.")
  const rights = textOf(pp, lang, 'rights-reserved') || S.rights;
  const note = `<div><p>© ${new Date().getFullYear()}, TAP. ${esc(rights)}</p><div class="section-metadata"><div><div>Style</div><div>note</div></div></div></div>`;
  const logos = `<div><ul><li><a href="/${c.locale}"><img src="${attr(site.logo)}" alt="${attr(S.logoAlt)}"></a></li></ul></div>`;
  return `<div>${cols}</div>\n${badges}\n${note}\n${logos}\n`;
}

/** TAP's logo: the first inline SVG of the homepage's header (www's desktop logo). */
export function logoSvg(html) {
  const nav = html.slice(html.indexOf('<nav'));
  const svg = (nav.match(/<svg[\s\S]*?<\/svg>/) || [])[0];
  if (!svg) return null;
  return svg.replace(/ class="[^"]*"/, '').replace(/^<svg /, (m) => (/width=/.test(svg.slice(0, 200)) ? m : '<svg width="166" height="21" '));
}

function main() {
  const argv = process.argv.slice(2);
  const all = (n) => argv.flatMap((x, i) => (x === `--${n}` ? [path.resolve(argv[i + 1])] : []));
  const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
  const locale = opt('locale') || 'pt-pt';
  const archives = all('archive');
  if (!archives.length) { console.log('usage: --archive <unpacked pages archive> [--archive ...] [--locale pt-pt] [--dry-run]'); process.exit(1); }
  // the site's documents (the allowlist tap-import.mjs keeps) and the locale's homepage capture
  const allow = JSON.parse(fs.readFileSync(path.join(root, 'tools/importer/sites/lh-tap.json'), 'utf8'));
  const scope = new Set(allow.paths);
  let home = null;
  archives.forEach((dir) => {
    const f = path.join(dir, 'www.flytap.com', `${locale}.html`);
    if (fs.existsSync(f)) home = f;
  });
  if (!home) throw new Error(`no capture of /${locale} in the archives given`);
  const html = fs.readFileSync(home, 'utf8');
  const pp = JSON.parse(html.match(/<script id="__NEXT_DATA__" type="application\/json"[^>]*>([\s\S]*?)<\/script>/)[1]).props.pageProps;
  const svg = logoSvg(html);
  const logo = `/media-da/tap/tap-logo-${crypto.createHash('sha1').update(svg || '').digest('hex').slice(0, 8)}.svg`;
  const media = mediaResolver(mediaIndex(all('media')), { dry: argv.includes('--dry-run') });
  const site = {
    url: `${WWW}/${locale}`, locale, scope, logo, media,
  };
  const nav = navHtml(pp, site);
  const footer = footerHtml(pp, site);
  if (argv.includes('--dry-run')) { console.log(nav); console.log(footer); return; }
  fs.mkdirSync(path.join(OUT, 'media-da/tap'), { recursive: true });
  fs.writeFileSync(path.join(OUT, logo), svg);
  fs.mkdirSync(path.join(OUT, locale), { recursive: true });
  fs.writeFileSync(path.join(OUT, locale, 'nav.plain.html'), nav);
  fs.writeFileSync(path.join(OUT, locale, 'footer.plain.html'), footer);
  console.log(`/${locale}/nav, /${locale}/footer written; logo ${logo} (${svg.length} B)`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
