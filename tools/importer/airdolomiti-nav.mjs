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
 * - footer: the search row (:search: and a link to the search page), the link columns (company,
 *   contacts, news, routes, assistance), a section with the
 *   style badges: the main buttons, the social links (:facebook:, :instagram:, :linkedin:,
 *   :youtube:, :x:, :tiktok: tokens) and www's payment logos under their heading (images without
 *   a link, as on www), the
 *   legal row (www's "change cookie settings" opens PrivacyLab's banner: left out, the site has
 *   no consent layer), the company line (note) and the logo row.
 * - search (/search, /en/search, /de/search): the search-results block over the language's index.
 * Portal and live tools point at the live site; pages in scope (the booking and flight status
 * pages too) become the site's paths.
 *
 * Usage: node tools/importer/airdolomiti-nav.mjs [--lang it|en|de]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Page, dec, loadSite } from './airdolomiti-import.mjs';
import { snapshotFile } from './airdolomiti-capture.mjs';
import { NEWSLETTER } from './airdolomiti-paths.mjs';

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = (s) => String(s).replace(/"/g, '&quot;');

/**
 * One column of a menu tab (www's nav-bar-tab-<tab>-* lazyblocks) as the nav document's list item,
 * for blocks/header/header-airdolomiti.js: a card (-card) its title, its picture and its button;
 * the quick actions (-azioni-rapide) www's icon before each link; a titled column its title
 * (linked where www links it) and links (with "Vedi tutte"); a list without a title (www's
 * "tabtitle"/"tab title" placeholder) an empty title; no links, no column.
 * @param {{name: string, a: Object}} b the lazyblock and its decoded attributes
 * @param {{href: Function, img: Function}} ctx href(url): the site's link for www's URL (null:
 *   none); img({url, alt}): the picture of a file
 * @returns {string}
 */
export function navColumn(b, { href, img }) {
  const { a } = b;
  const li = (url, text, icon = '') => {
    const h = href(url);
    if (!text) return '';
    // (the icon before the link, not in it: Edge Delivery splits a link holding a picture in two)
    return `<li>${icon ? `${icon} ` : ''}${h ? `<a href="${attr(h)}">${esc(text.trim())}</a>` : esc(text.trim())}</li>`;
  };
  if (/-card$/.test(b.name)) {
    const picture = a.image && a.image.url ? `<p>${img({ url: a.image.url, alt: '' })}</p>` : '';
    return `<li><p>${esc(a.text || '')}</p>${picture}<ul>${li(a.url, a.textButton || a.text)}</ul></li>`;
  }
  const label = /^tab ?title$/i.test(a.tabTitle || '') ? '' : (a.tabTitle || '');
  const quick = /azioni-rapide$/.test(b.name);
  const links = (a.links || []).map((l) => li(l.url, l.text, quick && l.icon && l.icon.url ? img({ url: l.icon.url, alt: '' }) : '')).join('');
  const more = a.vediTutteLink ? li(a.vediTutteLink, a.vediTutte) : '';
  const head = a.tabTitleUrl ? `<p><a href="${attr(href(a.tabTitleUrl))}">${esc(label)}</a></p>` : `<p>${esc(label)}</p>`;
  return links ? `<li>${head}<ul>${links}${more}</ul></li>` : '';
}

/**
 * The nav document's tools section: assistance (:wheelchair:), the search page (:search:, the
 * header's search button), the other languages' homepages, the menu label.
 * @param {{assist: string[], search: string[], menuLabel: string}} setup [label, path] each
 * @param {string[][]} others [name, homepage] of the other languages
 * @param {{href: Function}} ctx
 * @returns {string}
 */
export function navTools(setup, others, { href }) {
  const tool = (token, [label, url]) => `<li>${token} <a href="${attr(href(url))}">${esc(label)}</a></li>`;
  return `<div><ul>${tool(':wheelchair:', setup.assist)}${tool(':search:', setup.search)}${others.map(([n, h]) => `<li><a href="${h}">${n}</a></li>`).join('')}</ul><p>${esc(setup.menuLabel)}</p></div>`;
}

/**
 * The footer's link columns, as www's: the company (www shows it without a title: "Air Dolomiti"
 * here), contacts, news, routes, assistance and the legal links ("Info legali", www's last column;
 * its cookie-settings button, a {{...}} placeholder, left out); a column without links, none.
 * @param {Object} fd www's footer data
 * @param {Function} li li(url, text): a list item with the site's link
 * @returns {string}
 */
export function footerColumns(fd, li) {
  const column = (title, links) => {
    const items = (links || []).filter((l) => !/^\{\{/.test(l.url || '')).map((l) => li(l.url, l.text)).join('');
    return items ? `<h3>${esc(title)}</h3><ul>${items}</ul>` : '';
  };
  return [
    column(fd.corporateTitle || 'Air Dolomiti', fd.corporateLinks),
    column(fd.contattiTitle, fd.contattiLinks),
    column(fd.newsConsigliTitle, fd.newsConsigliLinks),
    column(fd.tratteTitle, fd.tratteLinks),
    column(fd.assistenzaTitle, fd.assistenzaLinks),
    column(fd.infoLegaliTitle || 'Info legali', fd.infoLegaliLinks),
  ].join('');
}

/**
 * The footer's badges as three sections of the style badges (blocks/footer: one group each, so the
 * theme can place them as www does): the main buttons (www's pills at the top), the social links
 * (www's band at the bottom), the payment logos under their heading; an empty one, none.
 * @param {{buttons: string, social: string, payments: string, heading?: string}} parts the
 *   list items of each
 * @returns {string[][]} [body, style] per section
 */
export function footerBadges({
  buttons, social, payments, heading,
}) {
  return [
    buttons ? [`<ul>${buttons}</ul>`, 'badges'] : null,
    social ? [`<ul>${social}</ul>`, 'badges'] : null,
    payments ? [`${heading ? `<h3>${esc(heading)}</h3>` : ''}<ul>${payments}</ul>`, 'badges'] : null,
  ].filter(Boolean);
}

function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const W = path.join(root, 'content-sites/lh-airdolomiti');
  const OUT = path.join(W, 'content');
  const argv = process.argv.slice(2);
  const lang = argv.includes('--lang') ? argv[argv.indexOf('--lang') + 1] : 'it';
  const SETUP = {
    it: {
      home: 'https://www.airdolomiti.it', menu: 'menu-2', footer: 'footer-1', prefix: '', logoAlt: 'Air Dolomiti, torna alla homepage', menuLabel: 'Menu', assist: ['Assistenza', '/assistenza'], search: ['Cerca', '/search'], payments: 'Metodi di pagamento',
    },
    en: {
      home: 'https://www.airdolomiti.eu', menu: 'menu', footer: 'footer', prefix: '/en', logoAlt: 'Air Dolomiti, back to the homepage', menuLabel: 'Menu', assist: ['Assistance', '/assistance'], search: ['Search', '/en/search'], payments: 'Payment methods',
    },
    de: {
      home: 'https://www.airdolomiti.de', menu: 'menu-3', footer: 'footer-de', prefix: '/de', logoAlt: 'Air Dolomiti, zurück zur Startseite', menuLabel: 'Menü', assist: ['Betreuung', '/betreuung'], search: ['Suche', '/de/search'], payments: 'Zahlungsmethoden',
    },
  }[lang];
  const LOGO = 'https://www.airdolomiti.it/_next/static/media/logo-desktop.475ff090.png';
  // the search page (/search, /en/search, /de/search: the search-results block over the language's
  // search index, helix-query.yaml search-airdolomiti-it, search-brand-en, search-brand-de). www's
  // search is an overlay: its field's placeholder and button are www's, heading, title and the
  // Italian result texts ours (the block has English and German ones)
  const SEARCH = {
    it: {
      input: 'Inizia la ricerca...',
      rows: [['Search button label', 'Cerca'], ['Search for label', 'La tua ricerca per {QUERY}'], ['Results label', '{NUMBER} risultati'],
        ['No results label', 'Nessun risultato trovato. Modifica la ricerca e riprova.'], ['Failed label', 'Non è stato possibile caricare i risultati della ricerca.'],
        ['Failed sr label', 'Non è stato possibile caricare i risultati della ricerca.'], ['Success sr label', 'Risultati della ricerca caricati.'],
        ['Pagination label', 'Pagine dei risultati'], ['Previous label', 'Pagina precedente'], ['Next label', 'Pagina successiva'], ['Page label', 'Pagina {PAGE}']],
      heading: 'Risultati della ricerca',
    },
    en: { input: 'Enter search term...', rows: [['Search button label', 'Search']], heading: 'Search results' },
    de: { input: 'Suchbegriff eingeben...', rows: [['Search button label', 'Suche']], heading: 'Suchergebnisse' },
  }[lang];
  const OTHERS = {
    it: [['English', '/en/'], ['Deutsch', '/de/']], en: [['Italiano', '/'], ['Deutsch', '/de/']], de: [['Italiano', '/'], ['English', '/en/']],
  }[lang];
  // the social networks' icon tokens (icons/*.svg), by the link's address
  const ICONS = [
    [/linkedin\./i, ':linkedin:'], [/facebook\./i, ':facebook:'], [/instagram\./i, ':instagram:'], [/youtube\./i, ':youtube:'],
    [/\/\/(www\.)?(twitter|x)\.com\//i, ':x:'], [/tiktok\./i, ':tiktok:'],
  ];
  // the payment logos' names when www's data has none (its English alt texts are file names)
  const PAYMENT_NAMES = [[/amex|american/i, 'American Express'], [/mastercard/i, 'Mastercard'], [/visa/i, 'Visa'], [/paypal/i, 'PayPal']];

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
  const ctx = { href: (u) => page.href(u), img: (x) => page.img(x) };
  const columnsOf = (tab) => menu.filter((b) => b.name.startsWith(`lazyblock/nav-bar-tab-${tab}-`)).map((b) => navColumn(b, ctx)).join('');
  const quickBlock = menu.find((b) => /azioni-rapide$/.test(b.name));
  const quick = (quickBlock?.a.links || []).slice(0, 4).map((l) => li(l.url, l.text)).join('');
  const logoSrc = page.img({ url: LOGO, alt: SETUP.logoAlt });
  const nav = [
    `<div><p><a href="${SETUP.prefix || '/'}${SETUP.prefix ? '/' : ''}">${logoSrc}</a></p></div>`,
    `<div><ul>${quick}</ul></div>`,
    `<div><ul>${TABS.map((t, i) => `<li><p>${esc(tabNames[i] || t)}</p><ul>${columnsOf(t)}</ul></li>`).join('')}</ul></div>`,
    navTools(SETUP, OTHERS, ctx),
  ].join('\n');

  /* ------------------------------------------------------------------ footer ------------- */
  const fd = blocksOf(SETUP.footer).find((b) => b.name === 'lazyblock/footer-data').a;
  const columns = footerColumns(fd, li);
  const social = (fd.socialMedias || []).map((s) => {
    const icon = ICONS.find(([re]) => re.test(s.url || ''));
    if (icon) return `<li><a href="${s.url}">${icon[1]}</a></li>`;
    // a network without an icon: www's own logo
    const im = s.pic && s.pic.url ? page.img({ url: s.pic.url, alt: s.ariaLabel || s.altImage || '' }) : '';
    return im ? `<li><a href="${s.url}">${im}</a></li>` : '';
  }).join('');
  const mainButtons = (fd.mainButtons || []).map((b) => li(b.url, b.text)).join('');
  // www's payment logos: images without a link (the footer's badges row shows them unlinked)
  const payments = (fd.paymentImages || []).filter((p) => p.pic && p.pic.url).map((p) => {
    const name = p.ariaLabel || (PAYMENT_NAMES.find(([re]) => re.test(p.pic.url)) || [])[1] || p.pic.alt || '';
    return `<li>${page.img({ url: p.pic.url, alt: name })}</li>`;
  }).join('');
  const note = [fd.address, fd.copyright].filter(Boolean).map((t) => `<p>${esc(t.trim())}</p>`).join('');
  const section = (body, style) => `<div>${body}${style ? `<div class="section-metadata"><div><div>Style</div><div>${style}</div></div></div>` : ''}</div>`;
  // the search row (as lh-com's footers): www's search field ("Inizia la ricerca...") leading to the
  // site's search page with the term in its query parameter
  const footer = [
    section(`<p>:search: <a href="${SETUP.prefix}/search?query=">${esc(SEARCH.input)}</a></p>`),
    section(columns),
    ...footerBadges({
      buttons: mainButtons, social, payments, heading: fd.metodoDiPagamento || SETUP.payments,
    }).map(([body, style]) => section(body, style)),
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
  const searchRows = [[`${SETUP.prefix}/search-index.json`], ['Input label', SEARCH.input], ...SEARCH.rows];
  const searchMeta = [['Title', `${SEARCH.heading} | Air Dolomiti`], ['Robots', 'noindex, nofollow'], ['Nav', `${SETUP.prefix}/nav`], ['Footer', `${SETUP.prefix}/footer`], ['Language', lang]];
  const table = (name, rows) => `<div class="${name}">${rows.map((r) => `<div>${r.map((c) => `<div>${esc(c)}</div>`).join('')}</div>`).join('')}</div>`;
  write(`${SETUP.prefix}/search.plain.html`, `<div><h1>${esc(SEARCH.heading)}</h1>${table('search-results', searchRows)}${table('metadata', searchMeta)}</div>\n`);
  // the newsletter sign-up's confirmation page (the form's success page; www confirms in place, the
  // texts are ours), out of the site search
  const CONFIRM = {
    it: { title: 'Grazie per la tua iscrizione', text: 'Abbiamo ricevuto la tua richiesta di iscrizione alla newsletter di Air Dolomiti.', back: 'Torna alla homepage' },
    en: { title: 'Thank you for subscribing', text: 'We have received your request to subscribe to the Air Dolomiti newsletter.', back: 'Back to the homepage' },
    de: { title: 'Vielen Dank für Ihre Anmeldung', text: 'Wir haben Ihre Anmeldung zum Newsletter von Air Dolomiti erhalten.', back: 'Zurück zur Startseite' },
  }[lang];
  const confirmMeta = [['Title', `${CONFIRM.title} | Air Dolomiti`], ['Robots', 'noindex, nofollow'], ['Hide in search', 'true'], ['Nav', `${SETUP.prefix}/nav`], ['Footer', `${SETUP.prefix}/footer`], ['Language', lang]];
  write(`${NEWSLETTER[lang].confirmation}.plain.html`, `<div><h1>${esc(CONFIRM.title)}</h1><p>${esc(CONFIRM.text)}</p><p><a href="${SETUP.prefix || ''}/">${esc(CONFIRM.back)}</a></p>${table('metadata', confirmMeta)}</div>\n`);
  // the files the nav and footer use, for airdolomiti-assets.mjs
  const filesPath = path.join(W, 'assets/files.json');
  const all = JSON.parse(fs.existsSync(filesPath) ? fs.readFileSync(filesPath, 'utf8') : '{}');
  const { files } = loadSite();
  fs.writeFileSync(filesPath, `${JSON.stringify({ ...all, ...files }, null, 1)}\n`);
  console.log(`written: ${SETUP.prefix}/nav ${SETUP.prefix}/footer ${SETUP.prefix}/search ${NEWSLETTER[lang].confirmation} (${page.missing.size} files not downloaded yet)`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
