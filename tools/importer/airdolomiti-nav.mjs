/* eslint-disable no-console, max-len, no-nested-ternary, prefer-destructuring, import/extensions -- tooling */
/**
 * Air Dolomiti's nav and footer documents (lh-airdolomiti: /nav and /footer for Italian; /en/...
 * and /de/... with --lang) from the menu and footer data of the language's homepage snapshot
 * (__NEXT_DATA__ menus: the controllers menu-2 / footer-1 for Italian, menu / footer for English,
 * menu-3 / footer-de for German), in the shape of lh-com's documents (blocks/header,
 * blocks/footer) on the Air Dolomiti theme:
 * - nav: 1. the Air Dolomiti logo (www's logo-desktop PNG; the header bar is white) linking the
 *   homepage; 2. quick actions: www's "quick actions" (book, manage booking, check-in, flight
 *   status: the live site); 3. the mega menu: the three tabs (Esplora, Prenota e Gestisci,
 *   In viaggio) with their columns and links (the menu cards as one column each); 4. tools:
 *   assistance (:wheelchair:), the other languages' homepages (the header's language switch), the
 *   menu label.
 * - footer: the link columns (company, contacts, news, routes, assistance), the main buttons and
 *   the social links (badges: :facebook:, :instagram:, :linkedin:, :youtube: tokens; X and
 *   TikTok as www's own logos, lh-com has no icon for them; www's payment logos are plain images,
 *   which lh-com's badges don't show, left out), the
 *   legal row (www's "change cookie settings" opens PrivacyLab's banner: left out, the site has
 *   no consent layer), the company line (note) and the logo row.
 * Booking, portal and live tools point at the live site; pages in scope become the site's paths.
 *
 * Usage: node tools/importer/airdolomiti-nav.mjs [--lang it|en|de]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Page, dec, loadSite } from './airdolomiti-import.mjs';
import { snapshotFile } from './airdolomiti-capture.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const W = path.join(root, 'content-sites/lh-airdolomiti');
const OUT = path.join(W, 'content');
const argv = process.argv.slice(2);
const lang = argv.includes('--lang') ? argv[argv.indexOf('--lang') + 1] : 'it';
const SETUP = {
  it: {
    home: 'https://www.airdolomiti.it', menu: 'menu-2', footer: 'footer-1', prefix: '', logoAlt: 'Air Dolomiti, torna alla homepage', menuLabel: 'Menu', assist: ['Assistenza', '/assistenza'], payments: 'Metodi di pagamento',
  },
  en: {
    home: 'https://www.airdolomiti.eu', menu: 'menu', footer: 'footer', prefix: '/en', logoAlt: 'Air Dolomiti, back to the homepage', menuLabel: 'Menu', assist: ['Assistance', '/assistance'], payments: 'Payment methods',
  },
  de: {
    home: 'https://www.airdolomiti.de', menu: 'menu-3', footer: 'footer-de', prefix: '/de', logoAlt: 'Air Dolomiti, zurück zur Startseite', menuLabel: 'Menü', assist: ['Betreuung', '/betreuung'], payments: 'Zahlungsmethoden',
  },
}[lang];
const LOGO = 'https://www.airdolomiti.it/_next/static/media/logo-desktop.475ff090.png';
const OTHERS = {
  it: [['English', '/en/'], ['Deutsch', '/de/']], en: [['Italiano', '/'], ['Deutsch', '/de/']], de: [['Italiano', '/'], ['English', '/en/']],
}[lang];
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const ICONS = {
  linkedin: ':linkedin:', facebook: ':facebook:', instagram: ':instagram:', youtube: ':youtube:',
};

const html = fs.readFileSync(snapshotFile(SETUP.home), 'utf8');
const nodes = JSON.parse(html.match(/<script id="__NEXT_DATA__" type="application\/json"[^>]*>([\s\S]*?)<\/script>/)[1]).props.pageProps.menus.nodes;
const blocksOf = (slug) => JSON.parse(nodes.find((n) => n.slug === slug).blocksJSON).map((b) => ({ ...b, a: dec(b.attributes || {}) }));
const page = new Page(`${SETUP.home}/`, lang, html);
const li = (url, text) => {
  const href = page.href(url);
  return text ? `<li>${href ? `<a href="${href.replace(/"/g, '&quot;')}">${esc(text.trim())}</a>` : esc(text.trim())}</li>` : '';
};

/* ------------------------------------------------------------------ nav ---------------- */
const menu = blocksOf(SETUP.menu);
const tabNames = (menu.find((b) => b.name === 'lazyblock/nav-bar-tab-names')?.a.names || []).map((n) => n.text);
const TABS = ['esplora', 'prenota', 'viaggio'];
const columnsOf = (tab) => menu.filter((b) => b.name.startsWith(`lazyblock/nav-bar-tab-${tab}-`)).map((b) => {
  const { a } = b;
  if (/-card$/.test(b.name)) return `<li><p>${esc(a.text || '')}</p><ul>${li(a.url, a.textButton || a.text)}</ul></li>`;
  const label = /^tab ?title$/i.test(a.tabTitle || '') ? '' : (a.tabTitle || '');
  const links = (a.links || []).map((l) => li(l.url, l.text)).join('');
  const more = a.vediTutteLink ? li(a.vediTutteLink, a.vediTutte) : '';
  const head = a.tabTitleUrl ? `<p><a href="${page.href(a.tabTitleUrl)}">${esc(label)}</a></p>` : `<p>${esc(label)}</p>`;
  return links ? `<li>${head}<ul>${links}${more}</ul></li>` : '';
}).join('');
const quickBlock = menu.find((b) => /azioni-rapide$/.test(b.name));
const quick = (quickBlock?.a.links || []).slice(0, 4).map((l) => li(l.url, l.text)).join('');
const logoSrc = page.img({ url: LOGO, alt: SETUP.logoAlt });
const nav = [
  `<div><p><a href="${SETUP.prefix || '/'}${SETUP.prefix ? '/' : ''}">${logoSrc}</a></p></div>`,
  `<div><ul>${quick}</ul></div>`,
  `<div><ul>${TABS.map((t, i) => `<li><p>${esc(tabNames[i] || t)}</p><ul>${columnsOf(t)}</ul></li>`).join('')}</ul></div>`,
  `<div><ul><li>:wheelchair: ${li(SETUP.assist[1], SETUP.assist[0]).replace(/^<li>|<\/li>$/g, '')}</li>${OTHERS.map(([n, h]) => `<li><a href="${h}">${n}</a></li>`).join('')}</ul><p>${esc(SETUP.menuLabel)}</p></div>`,
].join('\n');

/* ------------------------------------------------------------------ footer ------------- */
const fd = blocksOf(SETUP.footer).find((b) => b.name === 'lazyblock/footer-data').a;
const column = (title, links) => (links && links.length ? `<h3>${esc(title)}</h3><ul>${links.map((l) => li(l.url, l.text)).join('')}</ul>` : '');
const columns = [
  // the company column has no title on www (its head is the footer logo, alt "Footer Air Dolomiti")
  column(fd.corporateTitle || 'Air Dolomiti', fd.corporateLinks),
  column(fd.contattiTitle, fd.contattiLinks),
  column(fd.newsConsigliTitle, fd.newsConsigliLinks),
  column(fd.tratteTitle, fd.tratteLinks),
  column(fd.assistenzaTitle, fd.assistenzaLinks),
].join('');
const social = (fd.socialMedias || []).map((s) => {
  const net = Object.keys(ICONS).find((k) => new RegExp(k, 'i').test(`${s.altImage} ${s.url}`));
  if (net) return `<li><a href="${s.url}">${ICONS[net]}</a></li>`;
  // www's own logo for the networks lh-com has no icon for (X, TikTok); named from the address
  const name = s.altImage || (/tiktok/i.test(s.url) ? 'TikTok' : (/twitter|x\.com/i.test(s.url) ? 'X' : ''));
  const im = s.pic && s.pic.url ? page.img({ url: s.pic.url, alt: name }) : '';
  return im ? `<li><a href="${s.url}">${im}</a></li>` : '';
}).join('');
const mainButtons = (fd.mainButtons || []).map((b) => li(b.url, b.text)).join('');
// www's payment logos are plain images; lh-com's footer badges show linked images only: left out
const payments = '';
const legal = (fd.infoLegaliLinks || []).filter((l) => !/^\{\{/.test(l.url || '')).map((l) => li(l.url, l.text)).join('');
const note = [fd.address, fd.copyright].filter(Boolean).map((t) => `<p>${esc(t.trim())}</p>`).join('');
const section = (body, style) => `<div>${body}${style ? `<div class="section-metadata"><div><div>Style</div><div>${style}</div></div></div>` : ''}</div>`;
const footer = [
  section(columns),
  section(`<ul>${mainButtons}</ul><ul>${social}</ul>${payments ? `<h3>${esc(fd.metodoDiPagamento || SETUP.payments)}</h3><ul>${payments}</ul>` : ''}`, 'badges'),
  section(`<ul>${legal}</ul>`),
  section(note, 'note'),
  section(`<ul><li><a href="${SETUP.prefix || '/'}${SETUP.prefix ? '/' : ''}">${logoSrc}</a></li></ul>`),
].join('\n');

const write = (file, doc) => {
  const out = path.join(OUT, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  if (!fs.existsSync(out) || fs.readFileSync(out, 'utf8') !== doc) fs.writeFileSync(out, doc);
};
write(`${SETUP.prefix}/nav.plain.html`, `${nav}\n`);
write(`${SETUP.prefix}/footer.plain.html`, `${footer}\n`);
// the files the nav and footer use, for airdolomiti-assets.mjs
const filesPath = path.join(W, 'assets/files.json');
const all = JSON.parse(fs.existsSync(filesPath) ? fs.readFileSync(filesPath, 'utf8') : '{}');
const { files } = loadSite();
fs.writeFileSync(filesPath, `${JSON.stringify({ ...all, ...files }, null, 1)}\n`);
console.log(`written: ${SETUP.prefix}/nav ${SETUP.prefix}/footer (${page.missing.size} files not downloaded yet)`);
