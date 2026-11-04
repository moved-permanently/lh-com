/* eslint-disable no-console, no-continue, no-restricted-syntax, max-len, no-nested-ternary, no-use-before-define, class-methods-use-this, import/extensions, import/prefer-default-export, import/no-extraneous-dependencies -- tooling */
/**
 * Imports Air Dolomiti's pages (lh-airdolomiti) offline from their rendered snapshots
 * (content-sites/lh-airdolomiti/snapshots/<host>/<path>.html, airdolomiti-capture.mjs) into
 * content-sites/lh-airdolomiti/content/<Edge Delivery document>.plain.html, with lh-com's existing
 * blocks only (the brand's look comes from styles/themes/airdolomiti.css). The source is Next.js
 * over WordPress: every page carries its Gutenberg blocks ("lazyblocks", attribute values often
 * URL-encoded JSON) in __NEXT_DATA__; this reads them, not the markup.
 *
 * Blocks (per lazyblock):
 * - herohome: hero-campaign (image, the "manage your trip" buttons; without a title its services
 *   option) and the homepage's H1 (www's
 *   H1 is its logo: a visually hidden H1, section style hidden-heading); hero: hero-campaign (narrow);
 * - title, title-margin, title-description-text-cta: default content (heading at its tag, text,
 *   the CTA as a primary button);
 * - hero-middle: hero-campaign (narrow), its paragraph over an H2;
 * - cardfullwidth, reach-monaco: hero-card-overlay (reach-monaco's section buttons, icon over label:
 *   cards-icon, their anchors as www has them);
 * - mini-card-slider, story-card-slider, cosa-fare-carroussel: carousel-cards;
 * - gridtwocolumns, gridtwocolumnsdownloadpdf: cards-teaser; news-list-grid, select-flight-list,
 *   add-baggage-cards: cards-teaser (three-up) (the "from" prices typed on the cards stay text);
 * - tariffe-list: accordion-columns (faq); half-page, description-news: columns-media;
 * - display-booking-widget, newsletter, live tools: a link to the page on the live site of the
 *   page's language (booking, newsletter subscription); blog-posts (www's live list): the
 *   category links of the rendered page;
 * - html-content and core blocks (paragraph, heading, list, image, table, embed, columns, group):
 *   default content, tables as table-striped, YouTube as embed, Google Maps as a link;
 * - any other block: its titles, texts, images and links in order (reported as generic).
 * Links to pages in scope become the site's paths (airdolomiti-paths.mjs; the source's aliases
 * to their canonical page), the rest absolute links to the live site of their language.
 * Images and documents come from airdolomiti-assets.mjs (content-sites/lh-airdolomiti/assets);
 * a file not downloaded yet stays the source URL and is listed (missing).
 * Writes content-sites/lh-airdolomiti/runs/<name>-import.json and the allowlist
 * tools/importer/sites/lh-airdolomiti.json.
 *
 * Usage: node tools/importer/airdolomiti-import.mjs --list <batch file> [--name batch-1] [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import {
  docOf, sourceKey, langOf, allRows, targetOf, LIVE_TOOLS, NEWSLETTER, edsPath,
} from './airdolomiti-paths.mjs';
import { snapshotFile, urlKey } from './airdolomiti-capture.mjs';
import { alternateRows, snapshotHead } from './airdolomiti-alternates.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const W = path.join(root, 'content-sites/lh-airdolomiti');
const OUT = path.join(W, 'content');
const ASSETS = path.join(W, 'assets');
const readJson = (f, d) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : d);
const writeJson = (f, v) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, `${JSON.stringify(v, null, 1)}\n`); };
const sha1 = (s) => crypto.createHash('sha1').update(s).digest('hex');

export const LIVE = {
  it: {
    host: 'https://www.airdolomiti.it', booking: '/prenotazioni', newsletter: '/iscrizione-newsletter', bookLabel: 'Prenota il tuo volo', newsletterLabel: 'Iscriviti alla nostra newsletter', mapLabel: 'Mappa su Google Maps', h1: 'Air Dolomiti',
  },
  en: {
    host: 'https://www.airdolomiti.eu', booking: '/booking', newsletter: '/newsletter-subscription', bookLabel: 'Book your flight', newsletterLabel: 'Sign up to our newsletter', mapLabel: 'Map on Google Maps', h1: 'Air Dolomiti',
  },
  de: {
    host: 'https://www.airdolomiti.de', booking: '/buchung', newsletter: '/newsletter-anmeldung', bookLabel: 'Flug buchen', newsletterLabel: 'Abonnieren Sie unseren Newsletter', mapLabel: 'Karte auf Google Maps', h1: 'Air Dolomiti',
  },
};

/**
 * The posts list (blog-overview (grid), as www's cards with Load more, over the language's posts
 * index: /articoli, /en/articles, /de/artikel query-index.json):
 * www's page size and no filter (www links its categories instead), the labels in the language.
 * www's /articoli has "Categorie" and its "Carica altri articoli" only; the other labels are ours.
 */
const BLOG = {
  it: [
    ['Page size', '9'], ['Hide filter', 'true'], ['Load more label', 'Carica altri articoli'],
    ['Results label', '{TOTAL} articoli trovati'], ['Search label', 'Cerca negli articoli'],
    ['Categories label', 'Categorie'], ['All categories label', 'Tutte le categorie'],
    ['Read label', 'Leggi l’articolo'], ['Read screen reader label', 'Leggi l’articolo {TITLE}'],
    ['No results label', 'Non ci sono ancora articoli su questo argomento.'],
    ['Current page label', 'Sei a pagina {CURRENT_PAGE} dei risultati'], ['Pagination label', 'Pagine degli articoli'],
    ['Previous label', 'Pagina precedente'], ['Next label', 'Pagina successiva'], ['Page label', 'Pagina {PAGE}'],
  ],
  // /en/articles/query-index.json; www's /articles has "Categories" (and "Load More Posts")
  en: [
    ['Page size', '9'], ['Hide filter', 'true'], ['Load more label', 'Load More Posts'],
    ['Results label', '{TOTAL} articles found'], ['Search label', 'Search the articles'],
    ['Categories label', 'Categories'], ['All categories label', 'All categories'],
    ['Read label', 'Read the article'], ['Read screen reader label', 'Read the article {TITLE}'],
    ['No results label', 'There are no articles on this topic yet.'],
    ['Current page label', 'You are on page {CURRENT_PAGE} of the results'], ['Pagination label', 'Article pages'],
    ['Previous label', 'Previous page'], ['Next label', 'Next page'], ['Page label', 'Page {PAGE}'],
  ],
  // /de/artikel/query-index.json; www's /artikel has "Kategorien" (and "Weitere Beiträge laden")
  de: [
    ['Page size', '9'], ['Hide filter', 'true'], ['Load more label', 'Weitere Beiträge laden'],
    ['Results label', '{TOTAL} Beiträge gefunden'], ['Search label', 'In den Beiträgen suchen'],
    ['Categories label', 'Kategorien'], ['All categories label', 'Alle Kategorien'],
    ['Read label', 'Beitrag lesen'], ['Read screen reader label', 'Beitrag lesen: {TITLE}'],
    ['No results label', 'Zu diesem Thema gibt es noch keine Beiträge.'],
    ['Current page label', 'Sie sind auf Seite {CURRENT_PAGE} der Ergebnisse'], ['Pagination label', 'Seiten der Beiträge'],
    ['Previous label', 'Vorherige Seite'], ['Next label', 'Nächste Seite'], ['Page label', 'Seite {PAGE}'],
  ],
};

/* ------------------------------------------------------------------ flight tools ------- */

// Air Dolomiti's own airports (www's booking widget offers only these): tools/importer/airdolomiti-airports.json
const AIRPORTS = JSON.parse(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'airdolomiti-airports.json'), 'utf8')).airports;
// German slugs with names the airport list does not have
const EXONYMS = { KRK: ['krakau'], TRS: ['triest'] };
const slugOf = (s) => s.toLowerCase().replace(/ü/g, 'ue').replace(/ö/g, 'oe').replace(/ä/g, 'ae')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');
const NAMES = (() => {
  const table = AIRPORTS.map((a) => {
    const v = new Set(EXONYMS[a.code] || []);
    [a.it, a.en, a.de].forEach((n) => [n, n.normalize('NFD').replace(/[\u0300-\u036f]/g, '')].forEach((x) => {
      v.add(slugOf(x));
      x.split(' - ').forEach((p) => v.add(slugOf(p).replace(/-airport$/, '')));
    }));
    return { code: a.code, names: [...v].filter((x) => x.length > 2) };
  });
  // a first word ("monaco", "londra") counts when one airport alone has it
  const firsts = {};
  table.forEach((a) => a.names.forEach((n) => { const f = n.split('-')[0]; (firsts[f] = firsts[f] || new Set()).add(a.code); }));
  table.forEach((a) => a.names.slice().forEach((n) => { const f = n.split('-')[0]; if (f.length > 3 && firsts[f].size === 1 && !a.names.includes(f)) a.names.push(f); }));
  return table;
})();

/**
 * A route page's origin and destination (www's slug: volo-verona-monaco-di-baviera,
 * flight-from-munich-to-brindisi, flug-von-genf-nach-muenchen), Air Dolomiti's airports only:
 * { origin, destination } codes, null where the route's end is not one of them.
 */
export function routeAirports(sourceUrl) {
  const s = new URL(sourceUrl).pathname.split('/').filter(Boolean).pop() || '';
  const hits = [];
  NAMES.forEach((a) => a.names.forEach((n) => {
    const re = new RegExp(`(^|-)${n}(-|$)`, 'g');
    let m = re.exec(s);
    while (m) { hits.push({ code: a.code, at: m.index + m[1].length, len: n.length }); m = re.exec(s); }
  }));
  hits.sort((x, y) => x.at - y.at || y.len - x.len);
  const found = [];
  let end = -1;
  hits.forEach((h) => { if (h.at >= end && !found.some((f) => f.code === h.code)) { found.push(h); end = h.at + h.len; } });
  if (found.length >= 2) return { origin: found[0].code, destination: found[1].code };
  if (!found.length) return { origin: null, destination: null };
  // one end only: the origin when the slug starts with it (after volo, flight(s), flug, from, von, da)
  const lead = s.replace(/^((volo|voli|flight|flights|flug|from|von|da)-)+/, '');
  return lead.startsWith(s.slice(found[0].at, found[0].at + found[0].len))
    ? { origin: found[0].code, destination: null } : { origin: null, destination: found[0].code };
}

const airportLabel = (code, lang) => { const a = AIRPORTS.find((x) => x.code === code); return a ? `${a[lang] || a.en} (${code})` : code; };

/**
 * The flight-search block's rows for an Air Dolomiti page: the passenger picker (www's widget has
 * adults, children, infants and no cabin choice: one cabin, so none to choose), Air Dolomiti's
 * airports, the route's airports, and the texts of www's widget on the page (labels, trip types,
 * the passenger line). The booking engine comes from the page's brand and language.
 */
export function flightSearchRows(page, route = {}) {
  const rows = [['Passenger picker', 'yes'], ['Cabins', 'E'], ['Airports', AIRPORTS.map((a) => a.code).join(', ')]];
  if (route.origin) rows.push(['Default origin', airportLabel(route.origin, page.lang)]);
  if (route.destination) rows.push(['Default destination', airportLabel(route.destination, page.lang)]);
  const { document } = parseHTML(page.rendered);
  const form = document.querySelector('form[class*="bookingWidget"]');
  if (!form) return rows;
  const t = (n) => plain(n ? n.textContent : '');
  const trips = [...form.querySelectorAll('[class*="bookingWidgetTop"] label')].map(t).filter(Boolean);
  if (trips.length) rows.push(['Trip types', trips.slice(0, 2).join(', ')]);
  const box = form.querySelector('[class*="bookingWidgetBottomIn"]') || form;
  const fields = [...box.querySelectorAll('[class*="inputField"] > label')].map(t);
  [['From label', 0], ['To label', 1], ['Departure label', 2], ['Return label', 3], ['Passengers label', 4]]
    .forEach(([k, i]) => { if (fields[i]) rows.push([k, fields[i]]); });
  // the date field's text (the block splits it at " - ": departure, return)
  if (fields[2] && fields[3]) rows.push(['Date label', `${fields[2]} - ${fields[3]}`]);
  // "1 Passeggero": the one-traveller line; the many-travellers line takes the field's label
  const line = t(box.querySelector('[class*="multiCounterInput"]'));
  if (/^1\s/.test(line)) rows.push(['Traveller summary', line.replace(/^1/, '{COUNT}')]);
  if (fields[4]) rows.push(['Travellers summary', `{COUNT} ${fields[4]}`]);
  const counters = [...box.querySelectorAll('[class*="singleCounter_"]')];
  ['Adults', 'Children', 'Infants'].forEach((k, i) => {
    const c = counters[i];
    if (!c) return;
    const label = c.querySelector('label');
    const own = label ? [...label.childNodes].filter((x) => x.nodeType === 3).map((x) => x.textContent).join('').trim() : '';
    if (own) rows.push([`${k} label`, own]);
    const hint = t(c.querySelector('[class*="subtitle"]'));
    if (hint) rows.push([`${k} hint`, hint]);
  });
  const submit = [...box.querySelectorAll('button[type="submit"]')].map(t).find(Boolean);
  if (submit) rows.push(['Submit label', submit]);
  // www's phone card that opens the widget ("Prenota il tuo volo"): the variant's Open label
  const card = t(document.querySelector('[class*="_searchBtnMobile_"]'));
  if (card) rows.push(['Open label', card]);
  return rows;
}

/**
 * The flight-search block once per page, in a section of its own (after the page's hero): the
 * variant airdolomiti (www's trip type tabs; with Open label the phone card).
 */
export function placeSearch(page) {
  if (!page.search || page.searchPlaced) return;
  page.section();
  page.block('flight-search (airdolomiti)', page.search.map(([k, v]) => [k, esc(v)]));
  page.section();
  page.searchPlaced = true;
  page.note('booking widget: flight-search (the booking engine by the page\'s brand and language)');
}

/**
 * The flight-status block's rows for an Air Dolomiti status page: the number search posted to its
 * engine (digital.airdolomiti.it), the route and airport searches in the format airdolomiti (the
 * day's flights from api.airdolomiti.it, a flight's card handed to the engine; www's texts are the
 * block's defaults), the texts of www's form on the page (its three tabs, the number tab's labels).
 */
function flightStatusRows(page) {
  const lang = { it: 'it-IT', en: 'en-GB', de: 'de-DE' }[page.lang];
  const rows = [
    ['Airlines', 'EN'],
    ['Submit URL', `https://digital.airdolomiti.it/booking/flight-status?lang=${lang}`],
    ['Submit method', 'post'], ['Airline field', 'airlineCode'], ['Flight number field', 'flightNumber'], ['Date field', 'departureDate'],
  ];
  const { document } = parseHTML(page.rendered);
  const t = (n) => plain(n ? n.textContent : '');
  const tabs = [...document.querySelectorAll('[class*="StatusVoli_tabButton"]')].map(t).filter(Boolean);
  if (tabs.length) rows.unshift(['Tabs', tabs.join(', ')]);
  rows.push(['Format', 'airdolomiti']);
  const box = document.querySelector('[class*="StatusVoli_controllers"]');
  const form = box ? box.parentElement : document;
  const labels = [...form.querySelectorAll('label')].map(t).filter(Boolean);
  if (labels[0]) rows.push(['Flight number label', labels[0]]);
  if (labels[1]) rows.push(['Date label', labels[1]]);
  const submit = t(form.querySelector('button[type="submit"]'));
  if (submit) rows.push(['Submit label', submit]);
  return rows;
}

/**
 * The flight-timetable block's rows for an Air Dolomiti timetable page: the texts of www's widget
 * on the page (trip types, the desktop fields' labels and placeholders, the calendar button's
 * "open calendar", Search and its accessible name). Airports, dates and the hand-off come from
 * api.airdolomiti.it in the browser (scripts/airdolomiti-api.js).
 */
function timetableRows(page) {
  const { document } = parseHTML(page.rendered);
  const form = document.querySelector('form[class*="bookingWidget"]');
  const rows = [];
  if (!form) return rows;
  const t = (n) => plain(n ? n.textContent : '');
  const trips = [...form.querySelectorAll('[class*="bookingWidgetTop"] label')].map(t).filter(Boolean);
  if (trips.length) rows.push(['Trip types', trips.slice(0, 2).join(', ')]);
  const byId = (id) => t(form.querySelector(`#${id}`));
  [['From label', 'booking-widget-departure-desktop-label'], ['From placeholder', 'react-select-booking-widget-departure-desktop-placeholder'],
    ['To label', 'booking-widget-arrival-desktop-label'], ['To placeholder', 'react-select-booking-widget-arrival-desktop-placeholder'],
    ['Departure label', 'booking-widget-departure-date-desktop-label'], ['Return label', 'booking-widget-return-date-desktop-label']]
    .forEach(([k, id]) => { if (byId(id)) rows.push([k, byId(id)]); });
  // "Data partenza: apri calendario": the part after the label
  const date = form.querySelector('#booking-widget-departure-date-desktop');
  const open = date ? (date.getAttribute('aria-label') || '').split(':').slice(1).join(':').trim() : '';
  if (open) rows.push(['Open calendar', open]);
  const submit = [...form.querySelectorAll('[class*="bookingWidgetBottomIn"] button[type="submit"]')].find((x) => t(x));
  if (submit) {
    rows.push(['Submit label', t(submit)]);
    if (submit.getAttribute('aria-label')) rows.push(['Submit aria label', plain(submit.getAttribute('aria-label'))]);
  }
  return rows;
}

/**
 * The manage-booking block's rows for an Air Dolomiti manage booking page: www's form (lazyblock
 * form-pnr: its placeholders and button; the labels from the rendered form). The retrieval and the
 * hand-off come from api.airdolomiti.it in the browser.
 */
function manageRows(a, page) {
  const { document } = parseHTML(page.rendered);
  const labels = [...document.querySelectorAll('form[class*="FormPnr"] label')].map((n) => plain(n.textContent)).filter(Boolean);
  const rows = [];
  if (labels[0]) rows.push(['Surname label', labels[0]]);
  if (a.placeholderFirst) rows.push(['Surname placeholder', plain(a.placeholderFirst)]);
  if (labels[1]) rows.push(['Booking code label', labels[1]]);
  if (a.placeholderSecond) rows.push(['Booking code placeholder', plain(a.placeholderSecond)]);
  if (a.textBtn) rows.push(['Submit label', plain(a.textBtn)]);
  return rows;
}

/**
 * The newsletter sign-up page's form (www's form posts to its own server, which refuses other
 * origins): a Form (core) block sent by lh-forms, its fields as www's form shows them once an
 * address is typed (content-sites/lh-airdolomiti/newsletter-<lang>.json, read through the source
 * session: e-mail, the consent with its Privacy Policy link, the button), the page's language as
 * a preselected choice (www sends it with the sign-up), the confirmation page on success.
 */
const NEWSLETTER_LANGUAGES = { label: { it: 'Lingua', en: 'Language', de: 'Sprache' }, options: [['it', 'Italiano'], ['en', 'English'], ['de', 'Deutsch']] };
function newsletterForm(page) {
  const { document } = parseHTML(page.rendered);
  const box = document.querySelector('[class*="CenteredBlock_news_letter"]');
  if (box) {
    page.add(page.heading('h2', (box.querySelector('h2') || {}).textContent));
    const intro = plain((box.querySelector('[class*="RichText"]') || {}).textContent);
    if (intro) page.add(`<p>${esc(intro)}</p>`);
  }
  const probe = readJson(path.join(W, `newsletter-${page.lang}.json`), { fields: [], texts: [] });
  const field = (type) => probe.fields.find((f) => f.type === type) || {};
  const privacy = (probe.texts.find((t) => /^a\[/.test(t)) || '').match(/^a\[([^\]]+)\]: (.*)$/);
  let consent = esc(field('checkbox').label || '');
  if (privacy && consent.includes(esc(privacy[2]))) consent = consent.replace(esc(privacy[2]), `<a href="${attr(page.href(privacy[1]))}">${esc(privacy[2])}</a>`);
  const { form, confirmation } = NEWSLETTER[page.lang];
  const header = ['Label', 'Type', 'Name', 'Required', 'Options'];
  const rows = [
    header,
    [esc(field('email').label || 'Email'), 'email', 'email', 'yes', ''],
    [consent, 'checkbox', 'privacy', 'yes', ''],
    [esc(NEWSLETTER_LANGUAGES.label[page.lang]), 'select', 'language', 'yes',
      NEWSLETTER_LANGUAGES.options.map(([v, l]) => `<p>${v}=${esc(l)}${v === page.lang ? '{selected}' : ''}</p>`).join('')],
    // the button as www labels it, 1:1 (www's German page says "Zeichnen", checked 2026-11-01:
    // kept as www's own wording)
    [esc(field('submit').text || 'Submit'), 'submit', '', '', ''],
    [esc(form), 'config', 'form', '', ''],
    [`<a href="${attr(confirmation)}">${esc(confirmation)}</a>`, 'config', 'success', '', ''],
  ];
  page.block('form (core)', rows);
  page.note(`newsletter form: form (core) sent by lh-forms (${form}), success ${confirmation}`);
}

/**
 * www's newsletter strip above the footer (CenteredBlock news_letter: a heading, a line of text and
 * an email field) from the rendered page; the field becomes a link to the site's subscription
 * page, where the form is (the theme draws it as www's field), in a section of the style
 * newsletter. Without the strip: the language's label as the heading, no text, "Email".
 * @param {string} rendered the rendered page
 * @param {{label: string, href: string}} to the subscription page and its label
 * @returns {{style: string, html: string}}
 */
export function newsletterStrip(rendered, { label, href }) {
  const { document } = parseHTML(rendered);
  const box = document.querySelector('[class*="CenteredBlock_news_letter"]');
  const title = plain(box && box.querySelector('h2') ? box.querySelector('h2').textContent : '') || label;
  const intro = plain(box && box.querySelector('[class*="RichText"]') ? box.querySelector('[class*="RichText"]').textContent : '');
  const input = box && box.querySelector('input[type="email"]');
  const field = plain(input && input.getAttribute('placeholder')) || 'Email';
  return {
    style: 'newsletter',
    html: `<h2>${esc(title)}</h2>${intro ? `<p>${esc(intro)}</p>` : ''}<p><a href="${attr(href)}">${esc(field)}</a></p>`,
  };
}

// Air Dolomiti's current travel information pages (the Message Center's cti-pages.json rows)
const CTI_PAGES = ['www.airdolomiti.it/informazioni-aggiornate', 'www.airdolomiti.eu/current-flight-information', 'www.airdolomiti.de/fluginformationen'];

/* ------------------------------------------------------------------ site data ---------- */

let site;
export function loadSite() {
  if (site) return site;
  const paths = readJson(path.join(W, 'paths.json'), {});
  const rows = allRows(path.join(W, 'delivery'));
  // aliases and source redirects: their canonical page (in scope)
  const alias = {};
  rows.filter((r) => ['alias', 'redirect'].includes(r.decision)).forEach((r) => {
    const t = targetOf(r);
    if (t && paths[sourceKey(t)]) alias[sourceKey(r.url)] = paths[sourceKey(t)];
  });
  const files = readJson(path.join(ASSETS, 'files.json'), {});
  const state = readJson(path.join(ASSETS, 'state.json'), { done: {} });
  const capture = readJson(path.join(W, 'capture-state.json'), {});
  site = {
    paths, alias, files, state, capture,
  };
  return site;
}

/* ------------------------------------------------------------------ helpers ------------ */

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = (s) => esc(s).replace(/"/g, '&quot;');
const plain = (s) => String(s ?? '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ')
  .trim();

/** An attribute value: URL-encoded JSON decoded (arrays, objects), else as is. */
export function dec(v) {
  if (typeof v === 'string' && /^%5B|^%7B/.test(v)) {
    try { return dec(JSON.parse(decodeURIComponent(v))); } catch (e) { return v; }
  }
  if (Array.isArray(v)) return v.map(dec);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dec(x)]));
  return v;
}

// www's WordPress still names its old development hosts in a few places (the backend's uploads on
// /de/reiseziele/mailand-de, a link to the German front end): their real hosts
const DEV_HOSTS = [
  [/^https?:\/\/airbackend\.sdch\.develondigital\.com\//, 'https://cms.airdolomiti.it/'],
  [/^https?:\/\/airfront\.de\.sdch\.develondigital\.com\//, 'https://www.airdolomiti.de/'],
];
const realHost = (u) => DEV_HOSTS.reduce((s, [re, to]) => s.replace(re, to), String(u || ''));

/** A WordPress image object (or URL string): { url, alt }, or null. */
const imageOf = (v) => {
  if (!v) return null;
  if (typeof v === 'string') return /^https?:\/\/.+\.(jpe?g|png|webp|gif|svg)(\?|$)/i.test(v) ? { url: realHost(v), alt: '' } : null;
  if (Array.isArray(v)) return imageOf(v[0]);
  if (typeof v === 'object' && v.url) return { url: realHost(v.url), alt: v.alt || '' };
  return null;
};

/* ------------------------------------------------------------------ the page ----------- */

export class Page {
  constructor(sourceUrl, lang, rendered) {
    this.source = sourceUrl;
    this.lang = lang;
    this.live = LIVE[lang];
    this.rendered = rendered;
    this.sections = [{ style: null, items: [] }];
    this.blocks = {};
    this.notes = [];
    this.generic = new Set();
    this.missing = new Set();
    this.linkedOut = new Set();
    this.bookingLinked = false;
    this.newsletterLinked = false;
  }

  get current() { return this.sections[this.sections.length - 1]; }

  section(style = null) {
    if (!this.current.items.length) { this.current.style = style; return; }
    this.sections.push({ style, items: [] });
  }

  add(html) { if (html && html.replace(/<[^>]+>/g, (m) => (/^<(img|picture)/.test(m) ? 'x' : '')).trim()) this.current.items.push({ html }); }

  block(name, rows) {
    const clean = rows.map((r) => r.map((c) => c || '')).filter((r) => r.some((c) => c.trim()));
    if (!clean.length) return;
    this.blocks[name] = (this.blocks[name] || 0) + 1;
    this.current.items.push({ block: name, rows: clean });
  }

  note(s) { if (!this.notes.includes(s)) this.notes.push(s); }

  /** The page's next quiz or gallery (www renders them in the order of the source). */
  next(kind) {
    this.counts = this.counts || {};
    this.counts[kind] = (this.counts[kind] || 0) + 1;
    return this.counts[kind] - 1;
  }

  /** A link's target: the site's path for pages in scope, the live site for the rest. */
  href(raw) {
    const h = realHost(String(raw || '').trim().replace(/&amp;/g, '&'));
    if (!h || /^javascript:|^\{\{/.test(h)) return null;
    if (/^(mailto|tel):/i.test(h)) return h;
    if (h.startsWith('#')) return h;
    if (/^http:\/\/search\b/.test(h)) return null;
    let u;
    try { u = new URL(h.replace(/^\/\//, 'https://'), `${this.live.host}/`); } catch (e) { return h; }
    if (/^cms\.airdolomiti\.it$/.test(u.hostname) && /\/wp-content\/uploads\//.test(u.pathname)) return this.file(u.href, 'document') || u.href;
    if (!/^(www\.)?airdolomiti\.(it|eu|de)$/.test(u.hostname)) return u.href;
    u.hostname = u.hostname.replace(/^airdolomiti/, 'www.airdolomiti');
    const { paths, alias, capture } = loadSite();
    const key = sourceKey(u.href);
    if (capture[urlKey(u.href)] && capture[urlKey(u.href)].status === 'not-found') return u.href;
    const target = paths[key] || alias[key];
    if (target) return `${target}${u.hash || ''}`;
    this.linkedOut.add(u.href.replace(/[?#].*$/, ''));
    return u.href;
  }

  /** A file's local path once downloaded (images /media-da/airdolomiti/..., documents /documents/...), else null (and listed). */
  file(url, kind) {
    const { files, state } = loadSite();
    const key = url.replace(/[?#].*$/, '');
    if (!files[key]) files[key] = { kind, pages: [] };
    if (!files[key].pages.includes(this.source)) files[key].pages.push(this.source);
    const d = state.done[key];
    if (!d || d.status !== 200 || !files[key].eds) { this.missing.add(key); return null; }
    if (kind === 'image' || files[key].kind === 'image') {
      const dest = path.join(OUT, files[key].eds);
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(path.join(ASSETS, 'cache', sha1(key)), dest);
      }
    }
    return files[key].eds;
  }

  /** An image (opts.maxWidth: its copy at most that wide, airdolomiti-assets.mjs --fit). */
  img(image, opts = {}) {
    const im = imageOf(image);
    if (!im) return '';
    if (opts.maxWidth) {
      const { files } = loadSite();
      const key = im.url.replace(/[?#].*$/, '');
      files[key] = { ...(files[key] || { kind: 'image', pages: [] }), maxWidth: opts.maxWidth };
    }
    let src = this.file(im.url, 'image');
    if (!src) {
      const key = im.url.replace(/[?#].*$/, '');
      const d = loadSite().state.done[key];
      if (d && d.status === 404) {
        // a resized copy WordPress no longer has (-1024x683): the original file, else left out
        const original = key.replace(/-\d+x\d+(?=\.[a-z0-9]+$)/i, '');
        this.missing.delete(key);
        src = original !== key ? this.file(original, 'image') : null;
        if (!src) {
          // the original 404 as well (or no other size): broken on www itself, left out
          const od = loadSite().state.done[original];
          const gone = original === key || (od && od.status === 404);
          if (gone) this.missing.delete(original);
          this.note(`image ${key.split('/').pop()}: 404 on www${gone ? ', left out' : ', its original not downloaded yet'}`);
          if (gone) return '';
        }
      }
    }
    return `<picture><img src="${attr(src || im.url)}" alt="${attr(im.alt)}"></picture>`;
  }

  link(url, label, button) {
    const href = this.href(url);
    const text = plain(label);
    if (!text) return '';
    if (!href) return `<p>${esc(text)}</p>`;
    const a = `<a href="${attr(href)}">${esc(text)}</a>`;
    return `<p>${button === 'primary' ? `<strong>${a}</strong>` : button === 'secondary' ? `<em>${a}</em>` : a}</p>`;
  }

  heading(tag, text) {
    const t = plain(text);
    const level = /^h[1-6]$/.test(tag || '') ? tag : 'h2';
    return t ? `<${level}>${esc(t)}</${level}>` : '';
  }

  booking() {
    if (this.bookingLinked) return '';
    this.bookingLinked = true;
    this.note('booking widget: a link to the booking page on the live site');
    return this.link(`${this.live.host}${this.live.booking}`, this.live.bookLabel, 'primary');
  }
}

/* ------------------------------------------------------------------ rich text ---------- */

const KEEP_INLINE = new Set(['STRONG', 'B', 'EM', 'I', 'A', 'BR', 'SUP', 'SUB']);

/**
 * WordPress HTML as clean block-level HTML (cell: tables as lists; top: tables as table-striped,
 * its blocks placed on the page where they stand and the text after the last one returned).
 */
function rich(html, page, mode = 'cell') {
  if (!html || !String(html).trim()) return '';
  const { document } = parseHTML(`<div id="r">${shortcodes(String(html), page)}</div>`);
  const parts = flow(document.getElementById('r'), page, mode);
  if (mode !== 'top') return parts.filter((p) => typeof p === 'string').join('');
  return put(page, parts);
}

/** Text and blocks (flow's parts) onto the page in their order; the text after the last block returned. */
function put(page, parts) {
  let text = '';
  parts.forEach((p) => {
    if (typeof p === 'string') { text += p; return; }
    page.add(text);
    text = '';
    page.block(p.block, p.rows);
  });
  return text;
}

/**
 * WordPress shortcodes in post HTML: [caption] as its image and the caption in italics, [embed] as
 * an iframe; [quiz-cat] and [gallery] (www renders them) as placeholders flow fills from www's render.
 */
function shortcodes(html, page) {
  return html
    .replace(/\[caption[^\]]*\]([\s\S]*?)\[\/caption\]/g, (m, inner) => {
      const im = inner.match(/^\s*(<a\b[^>]*>\s*<img[^>]*>\s*<\/a>|<img[^>]*>)/i);
      const text = (im ? inner.slice(im[0].length) : inner).trim();
      return `<p>${im ? im[1] : ''}</p>${text ? `<p><em>${text}</em></p>` : ''}`;
    })
    .replace(/\[embed\]([\s\S]*?)\[\/embed\]/g, (m, url) => `<iframe src="${attr(plain(url))}"></iframe>`)
    .replace(/\[(quiz-cat|gallery)\b[^\]]*\]/g, (m, kind) => `<div data-shortcode="${kind}" data-n="${page.next(kind)}"></div>`);
}

/** The n-th quiz or gallery of www's render, for its shortcode. */
function shortcodeOf(kind, n, page, mode) {
  if (kind === 'gallery') {
    const { document } = parseHTML(page.rendered);
    const g = document.querySelectorAll('[class*="ImageGallery_gallery"]')[n];
    if (!g) return [];
    const imgs = [...g.querySelectorAll('img')].map((im) => page.img({ url: im.getAttribute('src'), alt: im.getAttribute('alt') || '' })).filter(Boolean);
    // www's images side by side: one row of Columns Media (gallery), the images in one cell
    if (mode === 'top' && imgs.length) {
      page.note('gallery: Columns Media (gallery), its images in one row');
      return [{ block: 'columns-media (gallery)', rows: [[imgs.join('')]] }];
    }
    return imgs.map((im) => `<p>${im}</p>`);
  }
  const rows = quizRows(page, n);
  if (!rows) return [];
  return mode === 'top' ? [{ block: 'columns-media', rows }] : [rows[0].join('')];
}

/**
 * www's quiz loads its questions after "start" (the source holds only an id): the n-th quiz's
 * intro (image, title, text) as columns-media, the start a link to the post on the live site.
 */
function quizRows(page, n) {
  const { document } = parseHTML(page.rendered);
  const q = document.querySelectorAll('[class*="Quiz_quiz"]')[n];
  if (!q) return null;
  const im = q.querySelector('img');
  const title = q.querySelector('h1, h2, h3');
  const text = q.querySelector('p');
  const start = q.querySelector('button, a');
  const body = `${title ? page.heading('h2', title.textContent) : ''}${text ? `<p>${esc(plain(text.textContent))}</p>` : ''}<p><strong><a href="${attr(page.source)}">${esc(plain(start ? start.textContent : 'Quiz'))}</a></strong></p>`;
  page.note('quiz (questions load on www after start): its intro and a link to the post on www');
  return [[im ? page.img({ url: im.getAttribute('src'), alt: im.getAttribute('alt') || '' }) : '', body]];
}

function inline(node, page) {
  let out = '';
  node.childNodes.forEach((c) => {
    if (c.nodeType === 3) { out += esc(c.textContent.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ')); return; }
    if (c.nodeType !== 1) return;
    const t = c.tagName;
    if (t === 'BR') { out += '<br>'; return; }
    if (t === 'IMG') { out += page.img({ url: c.getAttribute('src'), alt: c.getAttribute('alt') || '' }); return; }
    const inner = inline(c, page);
    if (t === 'A') {
      const href = page.href(c.getAttribute('href'));
      const label = inner.trim();
      if (!href || !label) { out += inner; return; }
      out += `${/^\s/.test(inner) ? ' ' : ''}<a href="${attr(href)}">${label}</a>${/\s$/.test(inner) ? ' ' : ''}`;
      return;
    }
    if (t === 'STRONG' || t === 'B') { out += inner.trim() ? `<strong>${inner}</strong>` : inner; return; }
    if (t === 'EM' || t === 'I') { out += inner.trim() ? `<em>${inner}</em>` : inner; return; }
    if (t === 'SUP' || t === 'SUB') { out += `<${t.toLowerCase()}>${inner}</${t.toLowerCase()}>`; return; }
    out += inner;
  });
  return out;
}

const tidy = (h) => h.replace(/\s+/g, ' ').replace(/(<br>\s*)+$/, '').replace(/^(\s*<br>)+/, '').trim();
const empty = (h) => !h.replace(/<br>/g, '').replace(/<[^>]+>/g, (m) => (/^<img/.test(m) ? 'x' : '')).trim();

function flow(node, page, mode) {
  const out = [];
  let run = '';
  const flush = () => { const h = tidy(run); if (!empty(h)) out.push(`<p>${h}</p>`); run = ''; };
  node.childNodes.forEach((c) => {
    if (c.nodeType === 3) { run += esc(c.textContent.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ')); return; }
    if (c.nodeType !== 1 || /^(SCRIPT|STYLE|NOSCRIPT|FORM|BUTTON|INPUT|SELECT|svg)$/i.test(c.tagName)) return;
    const t = c.tagName;
    const sc = c.getAttribute('data-shortcode');
    if (sc) { flush(); out.push(...shortcodeOf(sc, Number(c.getAttribute('data-n')), page, mode)); return; }
    // a paragraph, heading or inline element holding an iframe or a shortcode's placeholder
    // (www's "<h3>[quiz-cat id=…]</h3>"): its parts in their order
    if (!/^(DIV|SECTION|FIGURE|BLOCKQUOTE|UL|OL|TABLE)$/.test(t) && c.querySelector('iframe, [data-shortcode]')) { flush(); out.push(...flow(c, page, mode)); return; }
    if (KEEP_INLINE.has(t) || t === 'SPAN' || t === 'IMG' || t === 'U' || t === 'SMALL') {
      if (t === 'SPAN' && c.querySelector('p, div, ul, ol, table, h1, h2, h3, h4, h5, h6, iframe')) { flush(); out.push(...flow(c, page, mode)); return; }
      run += inline({ childNodes: [c] }, page);
      return;
    }
    flush();
    if (/^H[1-6]$/.test(t)) { const h = tidy(inline(c, page)).replace(/<br>/g, ' '); if (!empty(h)) out.push(`<${t.toLowerCase()}>${h}</${t.toLowerCase()}>`); return; }
    if (t === 'P') { const h = tidy(inline(c, page)); if (!empty(h)) out.push(`<p>${h}</p>`); return; }
    if (t === 'UL' || t === 'OL') { out.push(list(c, page)); return; }
    if (t === 'TABLE') {
      const rows = [...c.querySelectorAll('tr')].map((tr) => [...tr.children].filter((x) => /^T[DH]$/.test(x.tagName)).map((td) => tidy(inline(td, page))));
      const r = rows.filter((x) => x.some((y) => !empty(y)));
      if (!r.length) return;
      if (mode === 'top') { out.push({ block: c.querySelector('th') || c.querySelector('thead') ? 'table-striped (header)' : 'table-striped', rows: r }); return; }
      out.push(`<ul>${r.map((x) => `<li>${x.filter((y) => !empty(y)).join(': ')}</li>`).join('')}</ul>`);
      return;
    }
    if (t === 'IFRAME') { out.push(...iframe(c.getAttribute('src') || c.getAttribute('data-src') || '', c.getAttribute('title') || '', page, mode)); return; }
    if (t === 'BLOCKQUOTE') { out.push(`<blockquote>${flow(c, page, 'cell').join('')}</blockquote>`); return; }
    if (t === 'FIGURE' || t === 'DIV' || t === 'SECTION' || t === 'FIGCAPTION' || t === 'CENTER') { out.push(...flow(c, page, mode)); return; }
    if (t === 'HR') return;
    out.push(...flow(c, page, mode));
  });
  flush();
  return out.filter(Boolean);
}

function list(c, page) {
  const tag = c.tagName.toLowerCase();
  const items = [...c.children].filter((li) => li.tagName === 'LI').map((li) => {
    const clone = li.cloneNode(true);
    [...clone.children].filter((x) => /^(UL|OL)$/.test(x.tagName)).forEach((x) => x.remove());
    const sub = [...li.children].filter((x) => /^(UL|OL)$/.test(x.tagName)).map((x) => list(x, page)).join('');
    const own = tidy(inline(clone, page));
    return empty(own) && !sub ? '' : `<li>${own}${sub}</li>`;
  }).filter(Boolean);
  return items.length ? `<${tag}>${items.join('')}</${tag}>` : '';
}

function iframe(src, title, page, mode) {
  const s = String(src || '').replace(/^\/\//, 'https://');
  if (/youtube(-nocookie)?\.com|youtu\.be/.test(s)) {
    const link = `<p><a href="${attr(s)}">${attr(s)}</a></p>`;
    if (mode === 'top') return [{ block: 'embed', rows: [[link]] }];
    return [link];
  }
  if (/google\.[a-z.]+\/maps|maps\.google/.test(s)) {
    page.note('Google Maps iframe: a link to the map');
    return [`<p><a href="${attr(s.replace(/\/maps\/embed\?pb=.*$/, '/maps'))}">${esc(page.live.mapLabel)}</a></p>`];
  }
  if (/^https?:/.test(s)) return [`<p><a href="${attr(s)}">${esc(title || s)}</a></p>`];
  return [];
}

/* ------------------------------------------------------------------ the blocks --------- */

const cardRow = (page, {
  image, tag, title, text, url, label,
}) => {
  const body = [
    page.heading(tag || 'h3', title),
    text ? (/<[a-z]/i.test(text) ? rich(text, page) : `<p>${esc(plain(text))}</p>`) : '',
    url ? page.link(url, label || title) : '',
  ].join('');
  return [page.img(image), body];
};

/**
 * www's offers (mini-card-slider: CardPromo cards, "Scopri le nostre offerte") as carousel-cards
 * (promo): per card its picture, the route as the title, the price and the fare as two
 * paragraphs, the card's link last (www links the whole card: the theme stretches it).
 * @param {Object} a the slider's attributes
 * @param {{img: Function, heading: Function, link: Function}} page
 * @returns {{name: string, rows: string[][]}}
 */
export function promoCards(a, page) {
  const rows = (a.cardList || []).map((c) => {
    const body = [
      page.heading(a.tagCard || 'h3', c.title),
      ...[c.price, c.bottomText].map((t) => plain(t)).filter(Boolean).map((t) => `<p>${esc(t)}</p>`),
      c.url ? page.link(c.url, c.title) : '',
    ].join('');
    return [page.img(c.image), body];
  });
  return { name: 'carousel-cards (promo)', rows };
}

// blocks that are lists of items (kept as blocks where they stand, not flattened into a column)
const LIST_BLOCKS = /^lazyblock\/(tariffe-list|tariffe-table|news-list-grid|select-flight-list|add-baggage-cards|mini-card-slider|story-card-slider|cosa-fare-carroussel|gridtwocolumns)$/;

const HANDLERS = {
  'lazyblock/herohome': (a, page) => {
    // the Message Center's flash teaser at the top (www's navbar alert: the site's notices)
    page.section();
    page.block('flash-teaser', [['Types', 'irreg, tech-outage, promo']]);
    page.section('hidden-heading');
    page.add(`<h1>${esc(page.live.h1)}</h1>`);
    const buttons = (a.buttons || []).map((b) => page.link(b.url, b.text)).join('');
    // www's booking widget on the hero: the flight-search block after it
    page.search = page.search || flightSearchRows(page);
    // no title (the homepages: a label and the "manage your trip" links): the block's services
    // option, which lays that shape out (ignored by the block until the option is on main)
    page.block(a.title ? 'hero-campaign' : 'hero-campaign (services)', [[page.img(a.backgroundImage)], [`${a.title ? page.heading('h2', a.title) : ''}${a.subtitle ? `<p>${esc(plain(a.subtitle))}</p>` : ''}${a.settingText ? `<p>${esc(plain(a.settingText))}</p>` : ''}${buttons}`]]);
    placeSearch(page);
    page.section();
  },
  'lazyblock/hero': (a, page) => {
    page.section();
    const buttons = (a.buttons || []).map((b) => page.link(b.url, b.text, 'primary')).join('');
    page.block('hero-campaign (narrow)', [[page.img(a.backgroundimage || a.backgroundImage)], [`${page.heading('h1', a.title)}${a.subtitle ? `<p>${esc(plain(a.subtitle))}</p>` : ''}${buttons}`]]);
    placeSearch(page);
    page.section();
  },
  'lazyblock/title': (a, page) => { page.add(page.heading(a.tag, a.title)); if (a.subtitle) page.add(`<p>${esc(plain(a.subtitle))}</p>`); },
  'lazyblock/title-margin': (a, page) => HANDLERS['lazyblock/title'](a, page),
  'lazyblock/title-news': (a, page) => HANDLERS['lazyblock/title'](a, page),
  // title, text (subTitle) and an optional CTA, as title-description-text-cta
  'lazyblock/title-description-cta': (a, page) => HANDLERS['lazyblock/title-description-text-cta']({
    ...a, description: a.subTitle || a.description, ctaText: a.ctaText || a.textCta, url: a.url || a.ctaUrl,
  }, page),
  'lazyblock/title-description-text-cta': (a, page) => {
    page.add(page.heading(a.tag, a.title));
    page.add(rich(a.description || a.text, page, 'top'));
    if (a.url && a.ctaText) page.add(page.link(a.url, a.ctaText, 'primary'));
  },
  'lazyblock/cardfullwidth': (a, page) => {
    page.section();
    page.block('hero-card-overlay', [[page.img(a.backgroundImage || a.backgroundImageLeft)], [`${page.heading(a.tag || 'h2', a.title)}${rich(a.subtitle, page)}${a.urlBtn ? page.link(a.urlBtn, a.ctaText, 'primary') : ''}`]]);
    page.section();
  },
  'lazyblock/reach-monaco': (a, page) => {
    page.section();
    const price = [a.titleWidget, a.widgetPrice].filter(Boolean).map(plain).join(' ');
    // the city's title is the page's H1 on www (HeroSecond h1)
    page.block('hero-card-overlay', [[page.img(a.backgroundImg)], [`${a.header ? `<p>${esc(plain(a.header))}</p>` : ''}${page.heading('h1', a.title)}${price ? `<p>${esc(price)}</p>` : ''}${a.ctaUrl ? page.link(a.ctaUrl, a.ctaText, 'primary') : ''}`]]);
    // the city's section buttons (icon over label: "Cosa fare" #cosa-fare, "Cosa ascoltare" /podcast):
    // cards-icon tiles with www's icons, the anchors as www has them
    const buttons = (a.buttonTexts || []).filter((b) => b.ctaUrl && b.text);
    if (buttons.length) {
      page.block('cards-icon', buttons.map((b) => [page.img(b.icon), `<p><a href="${attr(b.ctaUrl.startsWith('#') ? b.ctaUrl : page.href(b.ctaUrl))}">${esc(plain(b.text))}</a></p>`]));
    }
    page.section();
  },
  'lazyblock/hero-middle': (a, page) => {
    page.section();
    page.block('hero-campaign (narrow)', [[page.img(a.imageBg)], [`${a.header ? `<p>${esc(plain(a.header))}</p>` : ''}${page.heading('h2', a.title)}`]]);
    page.section();
  },
  'lazyblock/mini-card-slider': (a, page) => {
    page.add(page.heading(a.tag, a.title));
    const promo = promoCards(a, page);
    page.block(promo.name, promo.rows);
    if (a.showMoreTextUrl && a.showMoreText) page.add(page.link(a.showMoreTextUrl, a.showMoreText));
  },
  'lazyblock/story-card-slider': (a, page) => {
    page.add(page.heading(a.tag, a.title));
    page.block('carousel-cards', (a.cardList || []).map((c) => cardRow(page, {
      image: c.gallery || c.image, tag: a.tagCard, title: c.title, url: c.url,
    })));
    if (a.showMoreTextUrl && a.showMoreText) page.add(page.link(a.showMoreTextUrl, a.showMoreText));
  },
  'lazyblock/cosa-fare-carroussel': (a, page) => {
    // www's small picture inline before the heading: a section of its own with the style
    // heading-icon, the picture in a paragraph before the H2
    const icon = imageOf(a.icon);
    // (at most 200 px wide: the style moves only a small picture; www shows it at 40 px)
    const iconHtml = icon ? page.img(icon, { maxWidth: 200 }) : '';
    if (iconHtml) { page.section('heading-icon'); page.add(`<p>${iconHtml}</p>`); }
    page.add(page.heading(a.tag || 'h2', a.header || a.title));
    if (a.description) page.add(rich(a.description, page));
    page.block('carousel-cards', (a.cardList || []).map((c) => cardRow(page, {
      image: c.topImage || c.image, tag: a.tagCard, title: c.title, text: c.date, url: c.Url || c.url, label: c.ctaText || c.title,
    })));
    if (a.showMoreTextUrl && a.showMoreText) page.add(page.link(a.showMoreTextUrl, a.showMoreText));
    if (iconHtml) page.section();
  },
  'lazyblock/gridtwocolumns': (a, page) => {
    page.block('cards-teaser', (a.cardList || []).map((c) => cardRow(page, {
      image: c.image, tag: 'h3', title: c.title, text: c.subtitle, url: c.url, label: c.btntext,
    })));
  },
  'lazyblock/gridtwocolumnsdownloadpdf': (a, page) => {
    page.block('cards-teaser', [
      cardRow(page, {
        image: a.bigcardimage, tag: a.tag, title: a.bigcardtitle, text: a.bigcardsubtitle, url: a.bigcardctaurl, label: a.bigcardctatext,
      }),
      cardRow(page, {
        image: a.smallcardimage, tag: a.tag, title: a.smallcardtitle, text: a.smallcardsubtitle, url: imageOf(a.filetodownload)?.url || (a.filetodownload && a.filetodownload.url) || a.smallcardctaurl, label: a.smallcardctatext,
      }),
    ]);
  },
  'lazyblock/news-list-grid': (a, page) => {
    page.add(page.heading(a.tag === 'h3' ? 'h2' : (a.tag || 'h2'), a.titleHeder || a.title));
    if (a.subtitle) page.add(`<p>${esc(plain(a.subtitle))}</p>`);
    page.block('cards-teaser (three-up)', (a.cardList || []).map((c) => cardRow(page, {
      image: c.topImage || c.image, tag: a.tagCard || 'h3', title: c.title, text: c.date || c.subtitle, url: c.Url || c.url,
    })));
  },
  'lazyblock/select-flight-list': (a, page) => {
    page.add(page.heading(a.tag, a.title));
    if (a.description) page.add(`<p>${esc(plain(a.description))}</p>`);
    page.block('cards-teaser (three-up)', (a.cardList || []).map((c) => cardRow(page, {
      image: c.imgUrl || c.image, tag: a.tagCard || 'h3', title: c.title, text: [c.textPrice, c.price, c.bottomText].filter(Boolean).map(plain).join(' '), url: c.ctaUrl || c.url,
    })));
  },
  'lazyblock/add-baggage-cards': (a, page) => {
    page.add(page.heading(a.tag, a.title));
    if (a.subtitle) page.add(`<p>${esc(plain(a.subtitle))}</p>`);
    page.block('cards-teaser (three-up)', (a.addBaggageCards || a.cardList || []).map((c) => cardRow(page, {
      image: c.img || c.image, tag: a.tagCard || 'h3', title: c.title, url: c.ctaUrl || c.url,
    })));
  },
  'lazyblock/tariffe-list': (a, page) => {
    if (a.title) page.add(page.heading(a.tag, a.title));
    // an item's answer: its text, description, the "more" text, a small card (image, text), a
    // button and a closing text with its link
    page.block('accordion-columns (faq)', (a.tariffeList || []).map((t) => [esc(plain(t.title)), [
      rich(t.subtitle, page), rich(t.description, page), rich(t.textMore, page),
      t.cardImg ? `<p>${page.img(t.cardImg)}</p>` : '', rich(t.cardText, page),
      t.btnUrl && t.btnText ? page.link(t.btnUrl, t.btnText, 'secondary') : '',
      rich(t.finalText, page), t.finalLinkUrl && t.finalLinkText ? page.link(t.finalLinkUrl, t.finalLinkText) : '',
    ].join('')]));
  },
  'lazyblock/description-news': (a, page) => {
    const text = `${a.subtitle ? page.heading('h3', a.subtitle) : ''}${rich(a.description, page)}${a.urlBtn ? page.link(a.urlBtn, a.textBtn, 'primary') : ''}`;
    const im = page.img(a.backgroundImage);
    if (im) page.block('columns-media', [[im, text]]);
    else page.add(text);
  },
  'lazyblock/half-page': (a, page, b) => {
    const card = `${page.heading(a.tag || 'h3', a.cardTitle)}${a.cardSubtitle ? `<p>${esc(plain(a.cardSubtitle))}</p>` : ''}${a.urlBtn ? page.link(a.urlBtn, a.textBtn, 'primary') : ''}${a.urlLink ? page.link(a.urlLink, plain(a.textImage) || a.textLink) : ''}`;
    // a flight status page: its title, the flight-status block (www's form), then the card
    if (page.tool === 'status') {
      (b.innerBlocks || []).forEach((x) => render(x, page, 'top'));
      page.block('flight-status', flightStatusRows(page).map(([k, v]) => [k, esc(v)]));
      if (a.img) page.block('columns-media', [[page.img(a.img), card]]); else page.add(card);
      page.note('flight status form: flight-status (a flight number search posted to digital.airdolomiti.it)');
      return true;
    }
    // a column holding a list block (accordion, cards): its blocks on the page, then the card as
    // its own image | text row; else the column's texts beside the card
    if ((b.innerBlocks || []).some((x) => LIST_BLOCKS.test(x.name))) {
      (b.innerBlocks || []).forEach((x) => render(x, page, 'top'));
      page.block('columns-media', [[page.img(a.img), card]]);
      return true;
    }
    const left = (b.innerBlocks || []).map((x) => render(x, page, 'cell')).join('');
    page.block('columns-media', [[left, `${page.img(a.img)}${card}`]]);
    return true;
  },
  'lazyblock/display-booking-widget': (a, page) => {
    // the route pages (the route's airports prefilled) and the booking pages: the flight-search
    // block (after the page's hero, else where the page's blocks end); elsewhere the booking link
    if (page.isRoute || page.tool === 'booking') page.search = page.search || flightSearchRows(page, page.isRoute ? routeAirports(page.source) : {});
    else page.add(page.booking());
  },
  // the timetable page's widget: flight-timetable (elsewhere the booking link)
  'lazyblock/widget-full-page': (a, page) => {
    if (page.tool !== 'timetable') { page.add(page.booking()); return; }
    page.block('flight-timetable', timetableRows(page).map(([k, v]) => [k, esc(v)]));
    page.note('timetable: flight-timetable (airports, dates and the hand-off from api.airdolomiti.it)');
  },
  // manage booking: the heading (H1), the introduction and, after the form, the text (one section:
  // the block's centred column)
  'lazyblock/title-description-pnr': (a, page) => {
    if (a.title) page.add(page.heading('h1', a.title));
    if (a.subtitle) page.add(`<p>${esc(plain(a.subtitle))}</p>`);
    if (a.description) page.add(rich(a.description, page, 'top'));
  },
  'lazyblock/form-pnr': (a, page) => {
    if (page.tool !== 'manage') { page.add(page.link(page.source, a.textBtn, 'primary')); return; }
    page.block('manage-booking', manageRows(a, page).map(([k, v]) => [k, esc(v)]));
    page.note('manage booking: manage-booking (the retrieval and the hand-off from api.airdolomiti.it)');
  },
  'lazyblock/newsletter': (a, page) => {
    if (page.tool === 'newsletter') { newsletterForm(page); return; }
    if (page.newsletterLinked) return;
    page.newsletterLinked = true;
    page.note('newsletter: www\'s strip, its field a link to the subscription page');
    const strip = newsletterStrip(page.rendered, { label: page.live.newsletterLabel, href: page.href(`${page.live.host}${page.live.newsletter}`) });
    page.section(strip.style);
    page.add(strip.html);
    page.section();
  },
  'lazyblock/blog-posts': (a, page) => {
    // www's live list: the category links the rendered page shows
    const { document } = parseHTML(page.rendered);
    const cats = [...new Map([...document.querySelectorAll('#page-content a[href], main a[href]')]
      .filter((x) => /^\/(articoli|articles|artikel)\/[a-z0-9-]+$/.test(x.getAttribute('href') || '') && x.textContent.trim())
      .map((x) => [x.getAttribute('href'), x.textContent.trim()])).entries()];
    const head = document.querySelector('[class*="BlogPosts_categories_wrapper"] h2, [class*="BlogPosts_categories_wrapper"] h3');
    if (head && BLOG[page.lang]) {
      // www's page has no H1: the page's title ("Articoli"), then www's "Categorie"
      const title = plain((document.querySelector('title') || {}).textContent || '').replace(/\s*\|\s*Air Dolomiti\s*$/, '');
      if (title) page.add(`<h1>${esc(title)}</h1>`);
      page.add(page.heading('h2', head.textContent));
    }
    page.add(`<ul>${cats.map(([h, t]) => `<li>${page.link(h, t).replace(/^<p>|<\/p>$/g, '')}</li>`).join('')}</ul>`);
    if (BLOG[page.lang]) {
      // www's list of posts: blog-overview over the posts index
      page.block('blog-overview (grid)', BLOG[page.lang].map(([k, v]) => [k, esc(v)]));
      page.note(`blog list: www's ${cats.length} category links and blog-overview over the posts index`);
    } else page.note(`blog list (www's live list of posts; no posts index for ${page.lang}): its ${cats.length} category links`);
  },
  'lazyblock/horizontal-pictures': (a, page) => HANDLERS['lazyblock/horizontal-pictures-tre'](a, page),
  'lazyblock/quiz': (a, page) => {
    const rows = quizRows(page, page.next('quiz-cat'));
    if (rows) page.block('columns-media', rows);
  },
  'lazyblock/breeze-esim-widget': (a, page) => {
    // www's eSIM shop (Breeze widget, a live tool): a link to the page on the live site
    const label = { it: 'Scopri le offerte eSIM', en: 'Find your eSIM plan', de: 'eSIM-Tarif finden' }[page.lang];
    const link = `<p><strong><a href="${attr(page.source)}">${esc(label)}</a></strong></p>`;
    // www's <breeze-widget>: the esim-widget block, its attributes as rows (names only, no on*
    // handlers), then the link (all the page shows while the site flag esim-widget is off)
    const { document } = parseHTML(page.rendered);
    const widget = document.querySelector('breeze-widget');
    const rows = widget ? [...widget.attributes].filter((x) => !/^on/i.test(x.name)).map((x) => [esc(x.name), esc(x.value)]) : [];
    if (rows.some(([n]) => n === 'widget-token') && rows.some(([n]) => n === 'products')) {
      page.block('esim-widget', [...rows, [link]]);
      page.note('eSIM widget: esim-widget (www\'s breeze-widget attributes; flag esim-widget, the link while off)');
      return;
    }
    page.add(link);
    page.note('eSIM widget (live tool): a link to the page on www');
  },
  'lazyblock/margin-top': () => {},
  // www's flight status form (its tabs as attributes): the half-page around it writes the
  // flight-status block (flightStatusRows)
  'lazyblock/status-voli': () => {},
  'lazyblock/html-content': (a, page) => { page.add(rich(a.content || a.html || a.text, page, 'top')); },
  'core/paragraph': (a, page) => {
    // the chat page's empty paragraph #chat (Engagent's container): the live-chat block, its link
    // to www's chat page (all the page shows while the site flag live-chat is off)
    if (page.tool === 'chat' && a.anchor === 'chat' && !page.chatPlaced) {
      const label = { it: 'Vai alla chat su www.airdolomiti.it', en: 'Go to the chat on www.airdolomiti.eu', de: 'Zum Chat auf www.airdolomiti.de' }[page.lang];
      page.block('live-chat', [[`<p><a href="${attr(page.source)}">${esc(label)}</a></p>`]]);
      page.chatPlaced = true;
      page.note('chat: live-chat (flag live-chat; the link to www\'s chat page while off)');
      return;
    }
    page.add(rich(a.content ? `<p>${a.content}</p>` : '', page, 'top'));
  },
  'core/heading': (a, page) => { page.add(page.heading(`h${a.level || 2}`, a.content)); },
  'core/list': (a, page, b) => { page.add(rich(b.originalContent || b.saveContent || a.values || '', page, 'top')); },
  'core/image': (a, page) => { page.add(`<p>${page.img({ url: a.url, alt: a.alt })}</p>`); },
  // www does not render core/embed (its videos come from the [embed] shortcode of the post's HTML)
  'core/embed': (a, page) => { page.note('core/embed: not shown on www, left out'); },
  'core/html': (a, page, b) => { page.add(rich(a.content || b.originalContent || '', page, 'top')); },
  'core/table': (a, page) => { tableBlock(a, page); },
  'lazyblock/tariffe-table': (a, page, b) => {
    // the fare families' table: the header row of the block, the body of its core/table
    const table = (b.innerBlocks || []).find((x) => x.name === 'core/table');
    tableBlock(table ? dec(table.attributes || {}) : {}, page, (a.tabRowHeaders || []).map((h) => esc(plain(h.name))));
    return true;
  },
  'lazyblock/tariffebanner': (a, page) => {
    page.section();
    page.block('hero-card-overlay', [[page.img(a.img)], [`${page.heading(a.tag || 'h3', a.title)}${a.subtitle ? `<p>${esc(plain(a.subtitle))}</p>` : ''}${a.urlbtn ? page.link(a.urlbtn, a.textbtn, 'primary') : ''}`]]);
    page.section();
  },
  'lazyblock/embed-url': (a, page) => { page.add(put(page, iframe(a.url, '', page, 'top'))); },
  'lazyblock/download-cta': (a, page) => {
    const f = a.fileToDownload && (a.fileToDownload.url || a.fileToDownload);
    if (f && a.textCta) page.add(page.link(f, a.textCta, 'secondary'));
  },
  'lazyblock/horizontal-pictures-tre': (a, page) => {
    // a row of pictures: columns-media, several images side by side in one media cell
    const imgs = (a.images || []).map((x) => page.img({ url: (x.image && x.image.url) || x.image, alt: x.altImage || (x.image && x.image.alt) || '' })).filter(Boolean);
    if (imgs.length) page.block('columns-media', [[imgs.map((i) => `<p>${i}</p>`).join('')]]);
  },
  'lazyblock/aspetti-ambientali': (a, page) => {
    // cards whose text opens in a dialog on www: image | title, the dialog's title and text
    page.block('columns-media', (a.cards || []).map((c) => [page.img(c.image), `${page.heading('h3', c.text)}${c.modalTitle ? page.heading('h4', c.modalTitle) : ''}${rich(c.modalText, page)}`]));
  },
  'core/spacer': () => {},
  'core/separator': () => {},
};

/** One block: its handler, else its content generically (titles, texts, images, links in order). */
function render(b, page, mode = 'top') {
  const a = dec(b.attributes || {});
  const h = HANDLERS[b.name];
  if (mode === 'cell') return cellOf(b, a, page);
  if (h) {
    const done = h(a, page, b);
    if (!done) (b.innerBlocks || []).forEach((x) => render(x, page, 'top'));
    return '';
  }
  if (/^core\/(group|columns|column|cover)$/.test(b.name)) { (b.innerBlocks || []).forEach((x) => render(x, page, 'top')); return ''; }
  page.generic.add(b.name);
  const html = genericOf(a, page);
  page.add(html);
  (b.innerBlocks || []).forEach((x) => render(x, page, 'top'));
  return '';
}

/**
 * A block inside a block cell (half-page's left column): rendered as at the top, then flattened
 * into cell HTML (a block's cells one after another; tables as lists).
 */
function cellOf(b, a, page) {
  const saved = page.sections;
  const savedBlocks = { ...page.blocks };
  page.sections = [{ style: null, items: [] }];
  render(b, page, 'top');
  const items = page.sections.flatMap((x) => x.items);
  page.sections = saved;
  page.blocks = savedBlocks;
  return items.map((it) => {
    if (!it.block) return it.html;
    if (/^table-striped/.test(it.block)) return `<ul>${it.rows.map((r) => `<li>${r.filter((c) => !empty(c)).join(': ')}</li>`).join('')}</ul>`;
    return it.rows.map((r) => r.join('')).join('');
  }).join('');
}

/** A core/table's head and body cells (and an optional header row) as table-striped. */
function tableBlock(a, page, header) {
  const cells = (rowsOf) => (rowsOf || []).map((r) => (r.cells || []).map((c) => tidy(rich(`<p>${c.content || ''}</p>`, page).replace(/^<p>|<\/p>$/g, ''))));
  const head = cells(a.head);
  const body = cells(a.body);
  const top = header && header.length ? [header] : head;
  const rows = [...top, ...body].filter((r) => r.some((c) => !empty(c)));
  if (rows.length) page.block(top.length ? 'table-striped (header)' : 'table-striped', rows);
}

const TITLE_KEYS = /^(title|header|titleHeder|cardTitle|bigcardtitle|smallcardtitle|heading)$/;
function genericOf(a, page) {
  const out = [];
  Object.entries(a).forEach(([k, v]) => {
    if (/^(tag|tagCard|newTab|lazyblock|anchor|className|blockId|blockUniqueClass|ghostkit.*|pll_lang|.*[Cc]olor.*|hideTooltip.*|ariaLabel.*|.*AriaLabel)$/.test(k)) return;
    if (typeof v === 'string' && TITLE_KEYS.test(k)) out.push(page.heading(a.tag, v));
    else if (typeof v === 'string' && /<[a-z]/i.test(v)) out.push(rich(v, page));
    else if (imageOf(v)) out.push(`<p>${page.img(v)}</p>`);
    else if (Array.isArray(v)) {
      v.forEach((c) => {
        if (!c || typeof c !== 'object') return;
        const im = imageOf(c.image || c.img || c.topImage || c.imgUrl || c.pic || c.icon);
        const u = c.url || c.Url || c.ctaUrl;
        const t = c.title || c.text || c.name;
        out.push(`${im ? `<p>${page.img(im)}</p>` : ''}${t && u ? page.link(u, t) : (t ? `<p>${esc(plain(t))}</p>` : '')}`);
      });
    }
  });
  return out.join('');
}

/* ------------------------------------------------------------------ the document ------- */

let alternates;
/** What alternateRows reads: the snapshots' heads (cached), paths.json, the imported documents. */
function alternateSite() {
  if (alternates) return alternates;
  const heads = new Map();
  const { paths } = loadSite();
  alternates = {
    headOf: (url) => {
      if (!heads.has(url)) heads.set(url, snapshotHead(snapshotFile(url)));
      return heads.get(url);
    },
    paths,
    exists: (eds) => fs.existsSync(path.join(W, 'content', `${docOf(eds)}.plain.html`)),
  };
  return alternates;
}

function blockHtml(item) {
  const m = item.block.match(/^([a-z0-9-]+)(?: \(([^)]+)\))?$/);
  const classes = [m[1], ...(m[2] ? m[2].split(/,\s*/).map((o) => o.trim().replace(/\s+/g, '-')) : [])].join(' ');
  return `<div class="${classes}">${item.rows.map((r) => `<div>${r.map((c) => `<div>${c}</div>`).join('')}</div>`).join('')}</div>`;
}

/**
 * www's breadcrumb trail (its list, ol.Breadcrumbs_breadcrumbs, in the rendered page: "Home | Orario Voli",
 * "Home | extra services | eSIM") as lh-com's breadcrumb rows (blocks/breadcrumb): Parent the
 * nearest linked crumb that is a page of the site (exists), else the language's homepage;
 * Breadcrumb Title the page's own crumb. A homepage (home): "Breadcrumb Title | Home", its label
 * in its children's trails. No trail on www: no rows.
 */
export function breadcrumbRows(rendered, sourceUrl, { exists = sitePage, home = false } = {}) {
  if (home) return [['Breadcrumb Title', 'Home']];
  // the trail's list (its nav's label is in the page's language: "Percorso di navigazione")
  const nav = (rendered.match(/<ol class="Breadcrumbs_breadcrumbs[^"]*"[^>]*>([\s\S]*?)<\/ol>/) || [])[1];
  if (!nav) return [];
  const crumbs = [...nav.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map(([, li]) => {
    const a = li.match(/<a\b[^>]*href="([^"]*)"/);
    return { href: a ? a[1] : null, text: plain(li).replace(/&amp;/g, '&') };
  }).filter((c) => c.text);
  if (crumbs.length < 2) return [];
  const prefix = HOMES[langOf(sourceUrl)] || '/';
  const parents = crumbs.slice(0, -1).filter((c) => c.href).map((c) => edsPath(new URL(c.href, sourceUrl).href)).filter(Boolean);
  const parent = [...parents].reverse().find((p) => p !== prefix && exists(p)) || prefix;
  return [['Parent', `<a href="${attr(parent)}">${esc(parent)}</a>`], ['Breadcrumb Title', esc(crumbs[crumbs.length - 1].text)]];
}
const HOMES = { it: '/', en: '/en', de: '/de' };
const sitePage = (p) => Object.values(loadSite().paths).includes(p) || Object.values(HOMES).includes(p);

/** Converts one snapshot to the document's HTML; returns { html, report }. */
export function convert(rendered, sourceUrl) {
  const lang = langOf(sourceUrl);
  const page = new Page(sourceUrl, lang, rendered);
  const m = rendered.match(/<script id="__NEXT_DATA__" type="application\/json"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error(`${sourceUrl}: no __NEXT_DATA__`);
  const pp = JSON.parse(m[1]).props.pageProps;
  const post = pp.post || {};
  // a blog post: www's post template above its blocks (featured image, title; date and reading
  // time in the byline): article-header
  // eslint-disable-next-line no-underscore-dangle -- WPGraphQL's type name
  const isPost = post.__typename === 'Post';
  if (isPost) {
    const fi = post.featuredImage && post.featuredImage.node;
    page.block('article-header', [[fi ? page.img({ url: fi.sourceUrl, alt: fi.altText || '' }) : ''], [`<h1>${esc(plain(post.title))}</h1>${post.excerpt ? `<p>${esc(plain(post.excerpt))}</p>` : ''}`]]);
    page.section();
  }
  // a category of the posts (www's archive: name, description, its posts): the name, the
  // description (an h2 on www) and blog-overview over the category's posts
  // eslint-disable-next-line no-underscore-dangle -- WPGraphQL's type name
  if (post.__typename === 'Category') {
    page.add(`<h1>${esc(plain(post.name))}</h1>`);
    if (post.description) page.add(page.heading('h2', post.description));
    // the index's category is the posts' Category metadata, in lower case ("#didyouknow")
    // the category by the page's own folder (dyk, avgeek-en, reiseziele: the posts' folder)
    const folder = new URL(sourceUrl).pathname.split('/').filter(Boolean).pop();
    if (BLOG[lang]) page.block('blog-overview (grid)', [['Category', esc(folder)], ...BLOG[lang].map(([k, v]) => [k, esc(v)])]);
  }
  // eslint-disable-next-line no-underscore-dangle -- WPGraphQL's type name
  page.isRoute = post.__typename === 'Route';
  page.tool = LIVE_TOOLS[`https://${sourceKey(sourceUrl)}`] || null;
  // the current travel information pages (cti-pages.json): the Message Center's notices above
  // their accordion
  const cti = CTI_PAGES.includes(sourceKey(sourceUrl));
  (post.blocks || []).forEach((b) => {
    if (cti && !page.messagesPlaced && b.name === 'lazyblock/tariffe-list') {
      page.block('message-center', [['Types', 'irreg, tech-outage']]);
      page.messagesPlaced = true;
    }
    render(b, page, 'top');
  });
  placeSearch(page);
  // a post's own fields when it has no blocks (title, content)
  if (!(post.blocks || []).length && post.content) page.add(rich(post.content, page, 'top'));
  let docs = page.sections.filter((s) => s.items.length);
  const all = () => docs.flatMap((s) => s.items);
  const hasH1 = () => all().some((i) => (i.html || '').includes('<h1') || (i.rows || []).some((r) => r.some((x) => x.includes('<h1'))));
  if (!hasH1()) {
    const first = all().find((i) => /^<h[2-6]>/.test(i.html || ''));
    if (first) first.html = first.html.replace(/^<h[2-6]>(.*?)<\/h[2-6]>/, '<h1>$1</h1>');
    else {
      const t = plain(post.title || (post.seo && post.seo.title) || '').replace(/\s*\|\s*Air Dolomiti\s*$/, '');
      docs = docs.length ? docs : [{ style: null, items: [] }];
      docs[0].items.unshift({ html: `<h1>${esc(t)}</h1>` });
      page.note('no heading on the page: H1 from its title');
    }
  }
  // metadata: title, description, image, robots, the language's nav, footer and language
  const seo = post.seo || {};
  const meta = [['Title', esc(plain(seo.title || post.title || ''))]];
  if (seo.metaDesc) meta.push(['Description', esc(plain(seo.metaDesc))]);
  const og = seo.opengraphImage && (seo.opengraphImage.sourceUrl || seo.opengraphImage.url);
  if (og) { const im = page.img({ url: og, alt: '' }); if (im) meta.push(['Image', im]); }
  if (seo.metaRobotsNoindex === 'noindex') meta.push(['Robots', `noindex, ${seo.metaRobotsNofollow === 'nofollow' ? 'nofollow' : 'follow'}`]);
  const prefix = lang === 'it' ? '' : `/${lang}`;
  if (isPost) {
    // www shows the post's date and its reading time ("Tempo di lettura: 2 minuti"): the words of
    // the post's body (its html-content blocks) at 190 a minute, rounded (as www for 136 of 155
    // Italian, 191 of 206 English and 75 of 86 German posts)
    const body = (post.blocks || []).filter((b) => b.name === 'lazyblock/html-content').map((b) => plain(dec(b.attributes || {}).content)).join(' ');
    const words = (body || plain(docs.flatMap((x) => x.items).map((it) => it.html || (it.rows || []).flat().join(' ')).join(' '))).split(' ').filter(Boolean).length;
    const min = Math.max(1, Math.round(words / 190));
    const label = { it: `Tempo di lettura: ${min} ${min === 1 ? 'minuto' : 'minuti'}`, en: `Reading time: ${min} ${min === 1 ? 'minute' : 'minutes'}`, de: `Lesezeit: ${min} ${min === 1 ? 'Minute' : 'Minuten'}` }[lang];
    if (post.date) meta.push(['Publication Date', post.date.slice(0, 10)]);
    meta.push(['Reading Time', label]);
    const cat = post.categories && post.categories.edges && post.categories.edges[0] && post.categories.edges[0].node;
    if (cat) meta.push(['Category', esc(cat.name)]);
  }
  // the page's counterparts in the other languages (www's hreflang, both directions, our paths):
  // the header's language switch goes there instead of the language's homepage
  alternateRows(sourceUrl, alternateSite()).forEach(([k, v]) => meta.push([k, esc(v)]));
  // www's breadcrumb trail (its homepages: their label for the children's trails)
  breadcrumbRows(rendered, sourceUrl, { home: Object.values(HOMES).includes(edsPath(sourceUrl)) }).forEach((r) => meta.push(r));
  meta.push(['Nav', `${prefix}/nav`], ['Footer', `${prefix}/footer`], ['Language', lang]);
  const out = docs.map((s, i) => {
    const body = s.items.map((it) => (it.block ? blockHtml(it) : it.html)).join('');
    const sm = s.style ? blockHtml({ block: 'section-metadata', rows: [['Style', s.style]] }) : '';
    const md = i === docs.length - 1 ? blockHtml({ block: 'metadata', rows: meta }) : '';
    return `<div>${body}${sm}${md}</div>`;
  });
  // one H1
  let h1s = 0;
  const doc = out.join('\n').replace(/<(\/?)h1>/g, (x, close) => {
    if (!close) h1s += 1;
    return h1s > 1 ? `<${close}h2>` : x;
  });
  return {
    html: `${doc}\n`,
    report: {
      blocks: page.blocks, generic: [...page.generic], notes: page.notes, missing: [...page.missing], linkedOut: [...page.linkedOut].sort(),
    },
  };
}

/* ------------------------------------------------------------------ CLI ---------------- */

function main() {
  const argv = process.argv.slice(2);
  const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
  const listFile = opt('list');
  if (!listFile) { console.log('usage: --list <batch file> [--name batch-1] [--dry-run]'); process.exit(1); }
  const name = opt('name') || path.basename(listFile, '.txt').replace(/^batch-0*/, 'batch-');
  const urls = fs.readFileSync(path.resolve(root, listFile), 'utf8').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const { paths, capture, files } = loadSite();
  const report = {};
  const written = [];
  urls.forEach((url) => {
    const eds = paths[sourceKey(url)];
    if (!eds) { report[url] = { skipped: 'not a page in scope' }; return; }
    const c = capture[urlKey(url)];
    if (c && c.status !== 'ok') { report[url] = { eds, skipped: `${c.status} on the source (HTTP ${c.http}${c.finalUrl ? ` ${c.finalUrl}` : ''})` }; return; }
    const snap = snapshotFile(url);
    if (!fs.existsSync(snap)) { report[url] = { eds, skipped: 'no snapshot' }; return; }
    const { html, report: r } = convert(fs.readFileSync(snap, 'utf8'), url);
    const doc = docOf(eds);
    report[url] = { eds, doc, ...r };
    if (!argv.includes('--dry-run')) {
      const out = path.join(OUT, `${doc}.plain.html`);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      const before = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : null;
      if (before !== html) { fs.writeFileSync(out, html); report[url].changed = before === null ? 'new' : 'changed'; }
    }
    written.push(doc);
  });
  if (!argv.includes('--dry-run')) {
    writeJson(path.join(W, 'runs', `${name}-import.json`), report);
    fs.writeFileSync(path.join(W, 'runs', `${name}-paths.txt`), `${written.join('\n')}\n`);
    writeJson(path.join(ASSETS, 'files.json'), files);
    const listPath = path.join(root, 'tools/importer/sites/lh-airdolomiti.json');
    const allow = readJson(listPath, {
      site: 'moved-permanently/lh-airdolomiti',
      source: 'www.airdolomiti.it, www.airdolomiti.eu (/en/), www.airdolomiti.de (/de/): Air Dolomiti, plan content-sites/lh-airdolomiti/plan.md',
      paths: [],
      patterns: ['^(/en|/de)?/(nav|footer|search)$'],
    });
    allow.paths = [...new Set([...allow.paths, ...written])].sort();
    writeJson(listPath, allow);
  }
  const blocks = {};
  const generic = new Set();
  Object.values(report).forEach((r) => {
    Object.entries(r.blocks || {}).forEach(([b, n]) => { blocks[b] = (blocks[b] || 0) + n; });
    (r.generic || []).forEach((g) => generic.add(g));
  });
  const missing = new Set(Object.values(report).flatMap((r) => r.missing || []));
  console.log(`${name}: ${written.length} documents, ${Object.values(report).filter((r) => r.skipped).length} skipped, ${missing.size} files not downloaded yet`);
  console.log('blocks:', JSON.stringify(blocks));
  if (generic.size) console.log('generic:', [...generic].join(', '));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
