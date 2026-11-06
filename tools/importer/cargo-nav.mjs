/* eslint-disable no-console, max-len, import/extensions, import/no-extraneous-dependencies -- tooling */
/**
 * Lufthansa Cargo's nav and footer documents (lh-cargo: /<lang>/nav, /<lang>/footer for en, de and,
 * since brief 414, es, fr, it, pt) from the header and footer of the homepage snapshots
 * (content-sites/lh-cargo/delivery/snapshots/www.lufthansa-cargo.com/<lang>/home.html; a language
 * without its snapshot is left out), in the shape of lh-com's documents (blocks/header,
 * blocks/footer), so the site keeps lh-com's header and footer with Cargo's logo and links:
 * - nav: 1. the "Lufthansa Cargo" logo (www's brand-logo.svg, white, as a PNG: lh-com's nav logo is
 *   a PNG) linking the homepage; 2. quick actions: book, track and schedule (portal, on www);
 *   3. the mega menu: Book & Track, Info-Hub, Cargo inside with their columns and links; 4. tools:
 *   support and contact, the notifications (:bell:, /<lang>/notification-overview), the other
 *   language, login (www's sign-in), the menu label.
 * - footer: the search row (www's search bar: :search: and a link to /<lang>/search?query=), the
 *   three link columns, the legal row (Cookie Settings: #privacy-settings), the social
 *   links (badges: icon tokens :facebook:, :youtube:, :instagram:, :linkedin:, brief 422), the
 *   logos (Lufthansa Cargo, a dark copy of the same logo for the white row; Lufthansa Group and
 *   IATA Cargo iQ as icon tokens :lufthansa-group:, :iata-cargo-iq:, footer.js's /icons/).
 * - www's portal links (lockedIcon, behind its sign-in) with :lock: in their text (the header's
 *   bar menu and the footer draw a lock, brief 422); the menu panels' access note (www's
 *   .smallText) as the menu section's paragraph (header.menuClose: below each panel).
 * - search (/<lang>/search): the search-results block over /<lang>/search-index.json
 *   (helix-query.yaml search-brand-en, search-brand-de), www's search page texts.
 * Portal and sign-in links point at www.lufthansa-cargo.com; links to pages in scope become the
 * site's paths (cargo-import.mjs Page.href). es, fr, it, pt have no homepage, notifications or
 * search page on the site (linksOf): the logo leads to www's homepage, the bell, the search row and
 * the other language to the English pages; no search page is written for them. Their quick links,
 * login and cookie labels are www's (as the harness's import of 2026-11-06 took them); the logo's
 * alt, the menu and the bell are the agent's translations (www.lufthansa-cargo.com refused the
 * agent's requests, 403), the snapshot's texts win where nav() reads them.
 *
 * Usage: node tools/importer/cargo-nav.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import { Page, text } from './cargo-import.mjs';
import { HOST } from './cargo-paths.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const W = path.join(root, 'content-sites/lh-cargo');
const SNAP = path.join(W, 'delivery/snapshots/www.lufthansa-cargo.com');
const OUT = path.join(W, 'content');
const LOGO_URL = `${HOST}/o/eportal-theme/images/redesign-images/brand-logo.svg`;
const LOGO_WHITE = '/media-da/cargo/lufthansa-cargo-logo-white.png';
const LOGO_BLUE = '/media-da/cargo/lufthansa-cargo-logo-deepblue.png';
// www's sign-in: the login portlet on the homepage (where www's own sign-in links lead)
const LOGIN = (lang) => `${HOST}/${lang}/home?p_p_id=com_liferay_login_web_portlet_LoginPortlet&p_p_lifecycle=0`;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = (s) => esc(s).replace(/"/g, '&quot;');

export const LABELS = {
  en: {
    logo: 'Lufthansa Cargo logo, back to the homepage', book: 'Book', track: 'Track', schedule: 'Schedule', other: 'Deutsch', login: 'Login', menu: 'Menu', cookies: 'Cookie Settings', group: 'Lufthansa Group', cargoiq: 'IATA Cargo iQ',
  },
  de: {
    logo: 'Lufthansa Cargo Logo, zurück zur Startseite', book: 'Buchen', track: 'Tracking', schedule: 'Flugplan', other: 'English', login: 'Login', menu: 'Menü', cookies: 'Cookie Einstellungen', group: 'Lufthansa Group', cargoiq: 'IATA Cargo iQ',
  },
  es: {
    logo: 'Logotipo de Lufthansa Cargo, volver a la página de inicio', book: 'Reserva', track: 'Seguimiento', schedule: 'Horario', other: 'English', login: 'Login', menu: 'Menú', cookies: 'Configuración de cookies', group: 'Lufthansa Group', cargoiq: 'IATA Cargo iQ',
  },
  fr: {
    logo: 'Logo Lufthansa Cargo, retour à la page d’accueil', book: 'Réserver', track: 'Suivre', schedule: 'Calendrier', other: 'English', login: 'Authentification', menu: 'Menu', cookies: 'Paramètres des cookies', group: 'Lufthansa Group', cargoiq: 'IATA Cargo iQ',
  },
  it: {
    logo: 'Logo Lufthansa Cargo, torna alla homepage', book: 'Prenotazioni', track: 'Tracking', schedule: 'Schedulato', other: 'English', login: 'Accesso', menu: 'Menu', cookies: 'Impostazioni dei cookie', group: 'Lufthansa Group', cargoiq: 'IATA Cargo iQ',
  },
  pt: {
    logo: 'Logótipo da Lufthansa Cargo, voltar à página inicial', book: 'Reservar', track: 'Rastreamento de AWBs', schedule: 'Programação de Voos', other: 'English', login: 'Autenticação', menu: 'Menu', cookies: 'Definições de cookies', group: 'Lufthansa Group', cargoiq: 'IATA Cargo iQ',
  },
};

// the languages with their own homepage, notifications and search page on the site
const OWN = ['en', 'de'];

/** A language's links the site may lack: its homepage, the bell, the search row, the other language. */
export const linksOf = (lang) => {
  const own = OWN.includes(lang);
  const pages = own ? lang : 'en';
  return {
    home: own ? `/${lang}/home` : `${HOST}/${lang}/home`,
    bell: `/${pages}/notification-overview`,
    search: `/${pages}/search?query=`,
    other: lang === 'en' ? '/de/home' : '/en/home',
    ownSearch: own,
  };
};

// www's search page (www.lufthansa-cargo.com/<lang>/search): its title, heading and texts; the
// header's bell (www's bell has no label: "Notification", in German its panel's heading)
export const SEARCH = {
  en: {
    bell: 'Notification', search: 'Search', searchButton: 'Search', searchFor: 'Your search for {QUERY}', searchHeading: 'Search Results', searchTitle: 'Search - Lufthansa Cargo',
  },
  de: {
    bell: 'Benachrichtigungen', search: 'Suchen', searchButton: 'Suchen', searchFor: 'Ihre Suche nach {QUERY}', searchHeading: 'Suchergebnisse', searchTitle: 'Suche - Lufthansa Cargo',
  },
  // the footer's search row (the snapshot's search bar label wins) and the bell; no search page
  es: { bell: 'Notificaciones', search: 'Buscar' },
  fr: { bell: 'Notifications', search: 'Rechercher' },
  it: { bell: 'Notifiche', search: 'Ricerca' },
  pt: { bell: 'Notificações', search: 'Pesquisar' },
};

/** The logo as PNGs (white for the header bar, deep blue for the footer's white logo row). */
async function logos() {
  const sharp = (await import('sharp')).default;
  const cache = path.join(W, 'assets/cache', crypto.createHash('sha1').update(LOGO_URL).digest('hex'));
  if (!fs.existsSync(cache)) throw new Error('logo not downloaded yet (cargo-assets.mjs --download)');
  const svg = fs.readFileSync(cache, 'utf8');
  const write = async (file, fill) => {
    const out = path.join(OUT, file);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await sharp(Buffer.from(svg.replace(/fill="white"/g, `fill="${fill}"`)), { density: 384 }).resize({ height: 120 }).png().toFile(out);
  };
  await write(LOGO_WHITE, 'white');
  await write(LOGO_BLUE, '#05164d');
}

// www's portal links behind its sign-in (lockedIcon): a lock after their text (:lock:)
const lock = (a) => (/(^|\s)lockedIcon(\s|$)/.test(a.getAttribute('class') || '') ? ' :lock:' : '');

const link = (page, a, label) => {
  const href = page.href(a.getAttribute('href'));
  const words = `${esc(label || text(a))}${lock(a)}`;
  return href ? `<a href="${attr(href)}">${words}</a>` : words;
};

/** www's access note under the menu panels (.smallText): its text and link, a lock before it. */
function menuNote(document, page) {
  const note = document.querySelector('#banner .navMenuItems ~ .smallText span, #banner .smallText span');
  if (!note) return '';
  const html = [...note.childNodes].map((n) => {
    if (n.nodeType === 3) return esc(n.textContent);
    if (n.tagName === 'A') return link(page, n);
    return esc(n.textContent || '');
  }).join('').replace(/\s+/g, ' ').trim();
  return html ? `<p>:lock: ${html}</p>` : '';
}

export function nav(document, page, L) {
  const { lang } = page;
  const targets = linksOf(lang);
  const brand = `<div><p><a href="${attr(targets.home)}"><picture><img src="${LOGO_WHITE}" alt="${attr(L.logo)}"></picture></a></p></div>`;
  const quick = `<div><ul><li><a href="${HOST}/${lang}/ebooking/booking/basic-information">${esc(L.book)}</a></li><li><a href="${HOST}/${lang}/eservices/etracking">${esc(L.track)}</a></li><li><a href="${HOST}/${lang === 'de' ? 'de/network/flugplan' : 'en/network/schedule-routings'}">${esc(L.schedule)}</a></li></ul></div>`;
  const tops = [...document.querySelectorAll('#banner .headerComponents > div')].filter((d) => d.querySelector(':scope > a.headerItem'));
  const menu = tops.map((d) => {
    const cols = [...d.querySelectorAll('.navMenuItems > .item')].map((item) => {
      const links = [...item.querySelectorAll('li a[href]')].map((a) => `<li>${link(page, a)}</li>`).join('');
      return `<li><p>${esc(text(item.querySelector('h4')))}</p><ul>${links}</ul></li>`;
    }).join('');
    return `<li><p>${esc(text(d.querySelector(':scope > a.headerItem')))}</p><ul>${cols}</ul></li>`;
  }).join('');
  const support = document.querySelector('#banner .headerComponents > a[href*="support-and-contact"]');
  const supportLabel = text(document.querySelector('#banner .smallText a')) || 'Support & Contact';
  const tools = `<div><ul><li>:help: <a href="${attr(page.href(support ? support.getAttribute('href') : '/support-and-contact'))}">${esc(supportLabel)}</a></li><li>:bell: <a href="${targets.bell}">${esc(L.bell)}</a></li><li><a href="${targets.other}">${esc(L.other)}</a></li><li>:login: <a href="${attr(LOGIN(lang))}">${esc(L.login)}</a></li></ul><p>${esc(L.menu)}</p></div>`;
  return `${brand}\n${quick}\n<div><ul>${menu}</ul>${menuNote(document, page)}</div>\n${tools}\n`;
}

export function footer(document, page, L) {
  const f = document.querySelector('#footer');
  const columns = [...f.querySelectorAll('.footerLinksRow > .col')].map((col) => `<h3>${esc(text(col.querySelector('h4')))}</h3><ul>${[...col.querySelectorAll('li a[href]')].map((a) => `<li>${link(page, a)}</li>`).join('')}</ul>`).join('');
  const legal = [...f.querySelectorAll('.legalLinks a[href]')].map((a) => (a.getAttribute('href') === '#'
    ? `<li><a href="#privacy-settings">${esc(text(a) || L.cookies)}</a></li>`
    : `<li>${link(page, a)}</li>`)).join('');
  // the social links as icons (footer.js badges: /icons/<name>.svg), as www's
  const social = [...f.querySelectorAll('.socialIcons a[href]')].map((a) => {
    const name = (a.className.match(/facebook|youtube|instagram|linkedin/) || [])[0];
    return `<li><a href="${attr(a.getAttribute('href'))}">${name ? `:${name}:` : esc(text(a))}</a></li>`;
  }).join('');
  const group = f.querySelector('.brandMember');
  const iq = f.querySelector('.partnerCargoiq');
  const links = linksOf(page.lang);
  const logoRow = `<ul><li><a href="${attr(links.home)}"><picture><img src="${LOGO_BLUE}" alt="Lufthansa Cargo"></picture></a></li>${group ? `<li><a href="${attr(group.getAttribute('href'))}">:lufthansa-group:</a></li>` : ''}${iq ? `<li><a href="${attr(iq.getAttribute('href').replace(/^http:/, 'https:'))}">:iata-cargo-iq:</a></li>` : ''}</ul>`;
  const badges = `<ul>${social}</ul><div class="section-metadata"><div><div>Style</div><div>badges</div></div></div>`;
  // www's search bar at the bottom of its pages: the footer's search row (as lh-com's footers),
  // leading to the site's search page with the term in its query parameter
  const searchLabel = (f.querySelector('input.search-bar-keywords-input') || document.querySelector('input.search-bar-keywords-input'))?.getAttribute('aria-label') || L.search;
  const search = `<p>:search: <a href="${links.search}">${esc(searchLabel)}</a></p>`;
  return `<div>${search}</div>\n<div>${columns}</div>\n<div>${badges}</div>\n<div><ul>${legal}</ul></div>\n<div>${logoRow}</div>\n`;
}

/**
 * The search page (/<lang>/search): www's results heading, the search-results block over the
 * language's search index (helix-query.yaml search-brand-en / search-brand-de) with www's texts.
 */
function searchPage(page, L) {
  const { lang } = page;
  const rows = [[`/${lang}/search-index.json`], ['Input label', L.search], ['Search button label', L.searchButton], ['Search for label', L.searchFor]];
  const block = `<div class="search-results">${rows.map((r) => `<div>${r.map((c) => `<div>${esc(c)}</div>`).join('')}</div>`).join('')}</div>`;
  const meta = [['Title', L.searchTitle], ['Robots', 'noindex, follow'], ['Nav', `/${lang}/nav`], ['Footer', `/${lang}/footer`], ['Language', lang]];
  return `<div><h1>${esc(L.searchHeading)}</h1>${block}<div class="metadata">${meta.map(([k, v]) => `<div><div>${k}</div><div>${esc(v)}</div></div>`).join('')}</div></div>\n`;
}

async function main() {
  await logos();
  const written = [];
  Object.keys(LABELS).forEach((lang) => {
    const snapshot = path.join(SNAP, `${lang}/home.html`);
    if (!fs.existsSync(snapshot)) {
      console.log(`${lang}: no snapshot (${path.relative(root, snapshot)}), left out`);
      return;
    }
    const html = fs.readFileSync(snapshot, 'utf8');
    const { document } = parseHTML(html);
    const page = new Page(`/${lang}/home`, lang, html);
    const L = { ...LABELS[lang], ...SEARCH[lang] };
    // unchanged documents keep their file (and time): da-upload.mjs sends only changed ones
    const write = (file, doc) => {
      const out = path.join(OUT, file);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      if (!fs.existsSync(out) || fs.readFileSync(out, 'utf8') !== doc) fs.writeFileSync(out, doc);
    };
    write(`${lang}/nav.plain.html`, nav(document, page, L));
    write(`${lang}/footer.plain.html`, footer(document, page, L));
    written.push(`/${lang}/nav`, `/${lang}/footer`);
    if (linksOf(lang).ownSearch) {
      write(`${lang}/search.plain.html`, searchPage(page, L));
      written.push(`/${lang}/search`);
    }
  });
  console.log(`written: ${written.join(' ')}`);
}

const direct = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (direct) await main();
