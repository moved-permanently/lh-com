/**
 * The block library per site: where its content and library live, its manifest and reports, its
 * DA source and preview, the locales its samples come from first, what it leaves out, and its
 * descriptions (SPEC: lh-com's, with a site's own where its blocks differ). build-library.mjs,
 * check-fields.mjs and upload-library.mjs take --site <name> (default lh-com, as before).
 * - lh-com: content/library (DA moved-permanently/lh-com /library/), blocks.json and
 *   ema-library.json, reports in tools/reports.
 * - lh-tap: TAP Air Portugal's library from lh-tap's own content (content-sites/lh-tap/content,
 *   tools/importer/tap-import.mjs), its documents in content-sites/lh-tap/content/library, DA
 *   moved-permanently/lh-tap /library/, blocks.json only, reports in tools/reports/lh-tap.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SPEC } from './spec.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** lh-tap's own descriptions, where its blocks differ from lh-com's (the rest: lh-com's). */
const TAP_SPEC = {
  'booking-box': {
    description: 'TAP\'s booking box under the homepage stage: tabs (book a flight, check-in, my trips, flight status), trip type, origin and destination from the root\'s airport sheet, dates, passengers; settings and labels as key/value rows (Format, Market, Language, Default origin, Airports, Tabs, …)',
  },
  cards: {
    multi: true, description: 'Text cards, one per row: title, text and a button (three-up, four-up: three or four to a row)',
  },
  columns: {
    description: 'Columns of text, one row: on the homepages the link strip under the alerts bar (the message as a link, its pill as a button)',
  },
};

const SITES = {
  'lh-com': {
    org: 'moved-permanently/lh-com',
    content: 'content',
    library: 'content/library',
    manifest: 'tools/library/library-variants.json',
    reports: 'tools/reports',
    sheets: ['blocks.json', 'ema-library.json'],
    locales: ['/de/en/', '/de/de/', '/gb/en/', '/at/de/', '/us/en/'],
    // drafts, the brand microsites, the library itself, media, the GraphQL form documents, the
    // demo pages, the Message Center's documents and the migration status meta pages
    skipDirs: /^(drafts|lhg|library|media-da|data|demo|message-center|migration-status)(\/|$)/,
    // the boilerplate starter page (its cards and columns are on no lh-com page) and the
    // migration status meta page
    skipPages: ['/index', '/migration-status'],
    spec: {},
  },
  'lh-tap': {
    org: 'moved-permanently/lh-tap',
    content: 'content-sites/lh-tap/content',
    library: 'content-sites/lh-tap/content/library',
    manifest: 'tools/library/sites/lh-tap/library-variants.json',
    reports: 'tools/reports/lh-tap',
    sheets: ['blocks.json'],
    locales: ['/pt-pt/', '/en-pt/', '/es-es/', '/fr-fr/', '/de-de/', '/it-it/', '/pl-pl/'],
    skipDirs: /^(drafts|library|media-da)(\/|$)/,
    skipPages: [],
    spec: TAP_SPEC,
  },
};

/**
 * A site's library settings, paths absolute.
 * @param {string} [name] lh-com (default) or lh-tap
 */
export function siteConfig(name = 'lh-com') {
  const s = SITES[name];
  if (!s) throw new Error(`unknown site ${name} (${Object.keys(SITES).join(', ')})`);
  return {
    name,
    org: s.org,
    content: path.join(root, s.content),
    library: path.join(root, s.library),
    manifest: path.join(root, s.manifest),
    reports: path.join(root, s.reports),
    sheets: s.sheets,
    locales: s.locales,
    skipDirs: s.skipDirs,
    skipPages: new Set(s.skipPages),
    source: `https://admin.da.live/source/${s.org}/library`,
    preview: `https://admin.hlx.page/preview/${s.org}/main/library`,
  };
}

/** The --site argument of a tool's command line (default lh-com). */
export function siteArg(argv = process.argv.slice(2)) {
  return argv.includes('--site') ? argv[argv.indexOf('--site') + 1] : 'lh-com';
}

/** A block's description and labels on a site: the site's own, else lh-com's, else none. */
export function specFor(site, name) {
  return (SITES[site] && SITES[site].spec[name]) || SPEC[name] || {};
}
