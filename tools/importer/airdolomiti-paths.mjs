/* eslint-disable no-console, max-len, no-nested-ternary, import/prefer-default-export -- tooling */
/**
 * Air Dolomiti's paths (lh-airdolomiti): the three language domains become one site, path for
 * path: www.airdolomiti.it/<path> -> /<path> (Italian), www.airdolomiti.eu/<path> -> /en/<path>
 * (English), www.airdolomiti.de/<path> -> /de/<path> (German); the homepages /, /en/, /de/ (the
 * documents /index, /en/index, /de/index). A path segment Edge Delivery can't keep (an underscore:
 * /en/articles/dyk/up_in_the_air) becomes hyphens. The redirects: the source's aliases (its
 * canonical tag names another URL: /bagagli/<x> -> /bagaglio/<x>, /airport/<x> -> /airports/<x>,
 * /homepage-it -> /), its own redirects, and every path that changed.
 *
 * CLI: node tools/importer/airdolomiti-paths.mjs
 *   writes content-sites/lh-airdolomiti/paths.json (source URL -> Edge Delivery path, every page
 *   in scope) and the redirects of the pages imported so far (a document in
 *   content-sites/lh-airdolomiti/content) plus every alias and source redirect whose target is
 *   imported: content-sites/lh-airdolomiti/content/redirects.json (the sheet) and its public copy
 *   tools/importer/airdolomiti-redirects.json (Source, Destination); fails on a collision.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const HOSTS = { 'www.airdolomiti.it': '', 'www.airdolomiti.eu': '/en', 'www.airdolomiti.de': '/de' };
export const LANG_OF_HOST = { 'www.airdolomiti.it': 'it', 'www.airdolomiti.eu': 'en', 'www.airdolomiti.de': 'de' };

/** A source URL's language ('it', 'en', 'de'), or null for other hosts. */
export const langOf = (url) => LANG_OF_HOST[new URL(url).host] || null;

/** The Edge Delivery path of a source URL (null: not one of the three domains). */
export function edsPath(url) {
  const u = new URL(url);
  if (!(u.host in HOSTS)) return null;
  const segs = u.pathname.replace(/\/+$/, '').split('/').filter(Boolean)
    .map((s) => s.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''));
  const p = segs.length ? `/${segs.join('/')}` : '';
  return `${HOSTS[u.host]}${p}` || '/';
}

/**
 * www's category pages of the posts (linked from /articoli, not in www's sitemap, so not in the
 * delivery's URL lists): pages in scope as well, path for path.
 */
export const BLOG_CATEGORIES = [
  ...['didyouknow', 'avgeek', 'destinazioni', 'throwback', 'travellers'].map((c) => `https://www.airdolomiti.it/articoli/${c}`),
  ...['dyk', 'avgeek-en', 'destinations', 'throwback-en', 'travellers-en'].map((c) => `https://www.airdolomiti.eu/articles/${c}`),
  ...['did-you-know', 'avgeek-de', 'throwback-de', 'reiseziele', 'travellers-de'].map((c) => `https://www.airdolomiti.de/artikel/${c}`),
];

/**
 * www's live tools pages (out of the delivery's scope as live tools), now pages of the site with
 * the flight-search and flight-status blocks: the booking pages and the flight status pages.
 */
export const LIVE_TOOLS = {
  'https://www.airdolomiti.it/prenotazioni': 'booking',
  'https://www.airdolomiti.eu/booking': 'booking',
  'https://www.airdolomiti.de/buchung': 'booking',
  'https://www.airdolomiti.it/stato-volo': 'status',
  'https://www.airdolomiti.eu/flight-status': 'status',
  'https://www.airdolomiti.de/flug-status': 'status',
  // the newsletter sign-up (www's form posts to its own server): the lh-forms form
  'https://www.airdolomiti.it/iscrizione-newsletter': 'newsletter',
  'https://www.airdolomiti.eu/newsletter-subscription': 'newsletter',
  'https://www.airdolomiti.de/newsletter-anmeldung': 'newsletter',
  // the timetable (www's widget: api.airdolomiti.it to its engine): the flight-timetable block
  'https://www.airdolomiti.it/orario-voli': 'timetable',
  'https://www.airdolomiti.eu/flight-timetables': 'timetable',
  'https://www.airdolomiti.de/flugplan': 'timetable',
  // manage booking (surname and booking code, retrieved through api.airdolomiti.it): manage-booking
  'https://www.airdolomiti.it/gestione-prenotazione-volo': 'manage',
  'https://www.airdolomiti.eu/manage-flight-booking': 'manage',
  'https://www.airdolomiti.de/bearbeitung-ihrer-buchungen': 'manage',
  // the chat page (Engagent's digital assistant): the live-chat block
  'https://www.airdolomiti.it/hai-bisogno-di-aiuto/live-chat-supporto': 'chat',
  'https://www.airdolomiti.eu/do-you-need-help/live-chat-support': 'chat',
  'https://www.airdolomiti.de/unterstutzung-und-kontakte/live-chat-unterstuetzung': 'chat',
};

/** The newsletter's lh-forms form ids and confirmation pages, per language. */
export const NEWSLETTER = {
  it: { form: 'airdolomiti-iscrizione-newsletter', confirmation: '/iscrizione-newsletter-conferma' },
  en: { form: 'airdolomiti-newsletter-subscription', confirmation: '/en/newsletter-subscription-confirmation' },
  de: { form: 'airdolomiti-newsletter-anmeldung', confirmation: '/de/newsletter-anmeldung-bestaetigung' },
};

/** The document of an Edge Delivery path (/ -> /index, /en/ -> /en/index). */
export const docOf = (eds) => (eds === '/' ? '/index' : (/^\/(en|de)$/.test(eds) ? `${eds}/index` : eds));

/** The canonical source path of a source URL (host + path, no trailing slash). */
export const sourceKey = (url) => {
  const u = new URL(url);
  return `${u.host}${u.pathname.replace(/\/+$/, '')}`;
};

const readTsv = (f) => {
  const [head, ...rows] = fs.readFileSync(f, 'utf8').split(/\r?\n/).filter(Boolean).map((l) => l.split('\t'));
  return rows.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] || ''])));
};

/** The rows of the three URL lists, each with its language. */
export function allRows(dir) {
  return ['it', 'en', 'de'].flatMap((l) => readTsv(path.join(dir, `urls-${l}.tsv`)).map((r) => ({ ...r, lang: l })));
}

/** The target URL an alias or redirect row names in its note. */
export const targetOf = (row) => (row.note.match(/(?:canonical|redirects to)\s+(https:\/\/\S+)/) || [])[1] || null;

const main = () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const W = path.join(root, 'content-sites/lh-airdolomiti');
  const rows = allRows(path.join(W, 'delivery'));
  const extra = [...BLOG_CATEGORIES, ...Object.keys(LIVE_TOOLS)].map((url) => ({ url, lang: langOf(url) }));
  const pages = [...rows.filter((r) => r.decision === 'in'), ...extra];
  const map = {};
  const byEds = new Map();
  pages.forEach((r) => {
    const eds = edsPath(r.url);
    map[sourceKey(r.url)] = eds;
    byEds.set(eds, [...(byEds.get(eds) || []), r.url]);
  });
  const clashes = [...byEds].filter(([, v]) => v.length > 1);
  if (clashes.length) { console.error('collisions:', JSON.stringify(clashes, null, 1)); process.exit(1); }
  fs.writeFileSync(path.join(W, 'paths.json'), `${JSON.stringify(map, null, 1)}\n`);

  const imported = (eds) => fs.existsSync(path.join(W, 'content', `${docOf(eds)}.plain.html`));
  const data = [];
  const seen = new Set();
  const add = (Source, Destination, why) => {
    if (!Source || !Destination || Source === Destination || seen.has(Source)) return;
    seen.add(Source);
    data.push({ Source, Destination, ...(why ? {} : {}) });
  };
  // the source's aliases and redirects, to a page in scope that is imported
  rows.filter((r) => ['alias', 'redirect'].includes(r.decision)).forEach((r) => {
    const t = targetOf(r);
    const dest = t ? map[sourceKey(t)] : null;
    if (dest && imported(dest)) add(edsPath(r.url), dest);
  });
  // pages whose path changed (underscores)
  pages.forEach((r) => {
    const eds = map[sourceKey(r.url)];
    const literal = `${HOSTS[new URL(r.url).host]}${new URL(r.url).pathname.replace(/\/+$/, '')}` || '/';
    if (literal !== eds && imported(eds)) add(literal, eds);
  });
  const sheet = {
    total: data.length, offset: 0, limit: data.length, data, ':type': 'sheet',
  };
  fs.mkdirSync(path.join(W, 'content'), { recursive: true });
  fs.writeFileSync(path.join(W, 'content/redirects.json'), `${JSON.stringify(sheet, null, 1)}\n`);
  fs.writeFileSync(path.join(root, 'tools/importer/airdolomiti-redirects.json'), `${JSON.stringify(data, null, 1)}\n`);
  const per = {};
  pages.forEach((r) => { per[r.lang] = (per[r.lang] || 0) + 1; });
  console.log(`${pages.length} pages (${Object.entries(per).map(([k, v]) => `${k} ${v}`).join(', ')}), ${data.length} redirects of imported pages`);
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
