/* eslint-disable no-console, max-len, import/extensions, import/no-extraneous-dependencies -- tooling */
/**
 * Lufthansa Cargo's nav and footer documents (lh-cargo: /en/nav, /en/footer, /de/nav, /de/footer)
 * from the header and footer of the homepage snapshots (content-sites/lh-cargo/delivery/snapshots/
 * www.lufthansa-cargo.com/<lang>/home.html), in the shape of lh-com's documents (blocks/header,
 * blocks/footer), so the site keeps lh-com's header and footer with Cargo's logo and links:
 * - nav: 1. the "Lufthansa Cargo" logo (www's brand-logo.svg, white, as a PNG: lh-com's nav logo is
 *   a PNG) linking the homepage; 2. quick actions: book, track and schedule (portal, on www);
 *   3. the mega menu: Book & Track, Info-Hub, Cargo inside with their columns and links; 4. tools:
 *   support and contact, the other language, login (www's sign-in), the menu label.
 * - footer: the three link columns, the legal row (Cookie Settings: #privacy-settings), the social
 *   links (badges, text links: www draws the icons from its stylesheet), the logos (Lufthansa Cargo, a dark copy of the same logo for the white row;
 *   Lufthansa Group, IATA Cargo iQ as text links: www draws them from its stylesheet).
 * Portal and sign-in links point at www.lufthansa-cargo.com; links to pages in scope become the
 * site's paths (cargo-import.mjs Page.href).
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

const LABELS = {
  en: {
    logo: 'Lufthansa Cargo logo, back to the homepage', book: 'Book', track: 'Track', schedule: 'Schedule', other: 'Deutsch', otherHome: '/de/home', login: 'Login', menu: 'Menu', cookies: 'Cookie Settings', group: 'Lufthansa Group', cargoiq: 'IATA Cargo iQ',
  },
  de: {
    logo: 'Lufthansa Cargo Logo, zurück zur Startseite', book: 'Buchen', track: 'Tracking', schedule: 'Flugplan', other: 'English', otherHome: '/en/home', login: 'Login', menu: 'Menü', cookies: 'Cookie Einstellungen', group: 'Lufthansa Group', cargoiq: 'IATA Cargo iQ',
  },
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

const link = (page, a, label) => {
  const href = page.href(a.getAttribute('href'));
  return href ? `<a href="${attr(href)}">${esc(label || text(a))}</a>` : esc(label || text(a));
};

function nav(document, page, L) {
  const { lang } = page;
  const brand = `<div><p><a href="/${lang}/home"><picture><img src="${LOGO_WHITE}" alt="${attr(L.logo)}"></picture></a></p></div>`;
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
  const tools = `<div><ul><li>:help: <a href="${attr(page.href(support ? support.getAttribute('href') : '/support-and-contact'))}">${esc(supportLabel)}</a></li><li><a href="${L.otherHome}">${esc(L.other)}</a></li><li>:login: <a href="${attr(LOGIN(lang))}">${esc(L.login)}</a></li></ul><p>${esc(L.menu)}</p></div>`;
  return `${brand}\n${quick}\n<div><ul>${menu}</ul></div>\n${tools}\n`;
}

function footer(document, page, L) {
  const f = document.querySelector('#footer');
  const columns = [...f.querySelectorAll('.footerLinksRow > .col')].map((col) => `<h3>${esc(text(col.querySelector('h4')))}</h3><ul>${[...col.querySelectorAll('li a[href]')].map((a) => `<li>${link(page, a)}</li>`).join('')}</ul>`).join('');
  const legal = [...f.querySelectorAll('.legalLinks a[href]')].map((a) => (a.getAttribute('href') === '#'
    ? `<li><a href="#privacy-settings">${esc(text(a) || L.cookies)}</a></li>`
    : `<li>${link(page, a)}</li>`)).join('');
  const social = [...f.querySelectorAll('.socialIcons a[href]')].map((a) => {
    const name = {
      facebook: 'Facebook', youtube: 'YouTube', instagram: 'Instagram', linkedin: 'LinkedIn',
    }[(a.className.match(/facebook|youtube|instagram|linkedin/) || [])[0]] || text(a);
    return `<li><a href="${attr(a.getAttribute('href'))}">${esc(name)}</a></li>`;
  }).join('');
  const group = f.querySelector('.brandMember');
  const iq = f.querySelector('.partnerCargoiq');
  const logoRow = `<ul><li><a href="/${page.lang}/home"><picture><img src="${LOGO_BLUE}" alt="Lufthansa Cargo"></picture></a></li>${group ? `<li><a href="${attr(group.getAttribute('href'))}">${esc(L.group)}</a></li>` : ''}${iq ? `<li><a href="${attr(iq.getAttribute('href').replace(/^http:/, 'https:'))}">${esc(L.cargoiq)}</a></li>` : ''}</ul>`;
  const badges = `<ul>${social}</ul><div class="section-metadata"><div><div>Style</div><div>badges</div></div></div>`;
  return `<div>${columns}</div>\n<div>${badges}</div>\n<div><ul>${legal}</ul></div>\n<div>${logoRow}</div>\n`;
}

await logos();
const written = [];
['en', 'de'].forEach((lang) => {
  const html = fs.readFileSync(path.join(SNAP, `${lang}/home.html`), 'utf8');
  const { document } = parseHTML(html);
  const page = new Page(`/${lang}/home`, lang, html);
  const L = LABELS[lang];
  // unchanged documents keep their file (and time): da-upload.mjs sends only changed ones
  const write = (file, doc) => {
    const out = path.join(OUT, file);
    if (!fs.existsSync(out) || fs.readFileSync(out, 'utf8') !== doc) fs.writeFileSync(out, doc);
  };
  write(`${lang}/nav.plain.html`, nav(document, page, L));
  write(`${lang}/footer.plain.html`, footer(document, page, L));
  written.push(`/${lang}/nav`, `/${lang}/footer`);
});
console.log(`written: ${written.join(' ')}`);
