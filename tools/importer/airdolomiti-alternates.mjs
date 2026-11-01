/* eslint-disable import/extensions -- tooling */
/**
 * Air Dolomiti's language counterparts for a page's metadata (Alternate it | en | de, read by the
 * header's language switch, 224): www's hreflang links in the page's head (Italian as x-default,
 * English and German as alternates; some hrefs a bare host), as our paths, only when the
 * counterpart is one of our imported pages and links back to the page (both directions). The
 * counterparts' heads are read from their snapshots (the first 256 KB of each).
 */
import fs from 'node:fs';
import { sourceKey, langOf } from './airdolomiti-paths.mjs';

const LANGS = ['it', 'en', 'de'];

/** An hreflang href as an https URL (www writes some as a bare host). */
const urlOf = (href) => (/^https?:/.test(href) ? href : `https://${String(href).replace(/^\/+/, '')}`);

/** The hreflang links of a page's head: { it, en, de } -> URL. */
export function hreflangOf(html) {
  const s = String(html || '');
  const end = s.indexOf('</head>');
  const head = end >= 0 ? s.slice(0, end) : '';
  const out = {};
  [...head.matchAll(/<link\b[^>]*>/g)].forEach(([tag]) => {
    const hl = (tag.match(/hreflang="([a-zA-Z-]+)"/) || [])[1];
    const href = (tag.match(/href="([^"]+)"/) || [])[1];
    if (!hl || !href) return;
    const lang = hl.slice(0, 2).toLowerCase();
    if (LANGS.includes(lang) && !out[lang]) out[lang] = urlOf(href);
  });
  return out;
}

/**
 * The page's Alternate rows.
 * @param {string} sourceUrl the page's source URL
 * @param {{headOf: function(string): string, paths: Object<string, string>,
 *   exists: function(string): boolean}} site the head of a source URL's snapshot, the source
 *   keys' paths (paths.json), whether a path is an imported document
 * @returns {Array<[string, string]>} e.g. [['Alternate en', '/en/flight-timetables']]
 */
export function alternateRows(sourceUrl, site) {
  const key = sourceKey(sourceUrl);
  const lang = langOf(sourceUrl);
  const own = hreflangOf(site.headOf(sourceUrl));
  return LANGS.filter((l) => l !== lang && own[l]).map((l) => {
    const other = sourceKey(own[l]);
    const eds = site.paths[other];
    if (!eds || !site.exists(eds)) return null;
    // the counterpart names this page for this page's language
    const back = hreflangOf(site.headOf(own[l]))[lang];
    if (!back || sourceKey(back) !== key) return null;
    // the English and German homepages answer at /en/ and /de/ (without the slash: 404)
    return [`Alternate ${l}`, /^\/(en|de)$/.test(eds) ? `${eds}/` : eds];
  }).filter(Boolean);
}

/** The head of a snapshot file (its first 256 KB), or '' when there is none. */
export function snapshotHead(file) {
  if (!fs.existsSync(file)) return '';
  const fd = fs.openSync(file, 'r');
  try {
    const buf = Buffer.alloc(262144);
    const n = fs.readSync(fd, buf, 0, buf.length, 0);
    const s = buf.toString('utf8', 0, n);
    const end = s.indexOf('</head>');
    // a copy: no slice of the read buffer's string stays alive
    return JSON.parse(JSON.stringify(end >= 0 ? s.slice(0, end + 7) : s));
  } finally {
    fs.closeSync(fd);
  }
}
