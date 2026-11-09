/* eslint-disable import/prefer-default-export -- dev tooling */
/**
 * The sites the loc tools run on (`--site <site>`, default lh-com; tests: test/loc-sites.test.mjs).
 *
 * lh-com is the first site and keeps its own files (tools/loc/translate.json, tools/loc/slug-map.json,
 * pages.csv). Every other site of the slug order has its configuration in tools/loc/sites/<site>/translate.json
 * (the file uploaded as the DA document /.da/translate.json of that site) and no scope table: a page is named
 * with --page, and its counterpart in another language has the same slug (one slug per page; tools/slugs/<site>.json
 * lists the pages whose www slug differs).
 * TAP, Air Dolomiti and ITA are parked: they have no entry and the tools stop for them.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const ORG = 'moved-permanently';
export const DEFAULT_SITE = 'lh-com';

const aem = (site) => [`main--${site}--${ORG}.aem.page`, `main--${site}--${ORG}.aem.live`];

/**
 * hosts: the site's own hosts, whose absolute links become root-relative (preview, live, the brand's host);
 * market: a root of the airline that is no language root of the setup (a project with its URLs falls to Sync);
 * samples: pages for the DNT check, read from DA.
 */
export const SITES = {
  'lh-com': {
    airline: 'lufthansa', hosts: [...aem('lh-com'), 'lufthansa.turnsthe.page', 'lhedge.bbird.live'], config: 'tools/loc/translate.json', market: '/de/de',
  },
  'lh-austrian': {
    airline: 'austrian', hosts: [...aem('lh-austrian'), 'austrian.turnsthe.page'], config: 'tools/loc/sites/lh-austrian/translate.json', market: '/ch/de', samples: ['/at/en/baggage', '/at/en/homepage'],
  },
  'lh-swiss': {
    airline: 'swiss', hosts: [...aem('lh-swiss'), 'swiss.turnsthe.page'], config: 'tools/loc/sites/lh-swiss/translate.json', market: '/de/en', samples: ['/ch/en/homepage'],
  },
  'lh-brussels': {
    airline: 'brussels', hosts: [...aem('lh-brussels'), 'brussels.turnsthe.page'], config: 'tools/loc/sites/lh-brussels/translate.json', market: '/fr/fr', samples: ['/be/en/homepage'],
  },
  'lh-discover': {
    airline: 'discover', hosts: [...aem('lh-discover'), 'discover.turnsthe.page'], config: 'tools/loc/sites/lh-discover/translate.json', market: '/us/en', samples: ['/de/en/homepage'],
  },
  'lh-cargo': {
    airline: 'cargo', hosts: [...aem('lh-cargo'), 'cargo.turnsthe.page'], config: 'tools/loc/sites/lh-cargo/translate.json', market: '/fr', samples: ['/en/home'],
  },
  'lh-b2b': {
    airline: 'b2b', hosts: [...aem('lh-b2b'), 'b2b.turnsthe.page'], config: 'tools/loc/sites/lh-b2b/translate.json', market: '/xx/en', samples: ['/de/en/homepage'],
  },
};

/** The site's entry; stops for an unknown or parked site. */
export function siteInfo(site = DEFAULT_SITE) {
  const s = SITES[site];
  if (!s) {
    const parked = /^lh-(tap|airdolomiti|ita)$/.test(site);
    throw new Error(`--site ${site}: ${parked ? 'parked (no translation setup, no slug alignment)' : 'unknown'}; sites: ${Object.keys(SITES).join(', ')}`);
  }
  return { site, ...s };
}

export const isDefaultSite = (site = DEFAULT_SITE) => site === DEFAULT_SITE;
/** The DA source root of the site's documents. */
export const daBase = (site = DEFAULT_SITE) => `https://admin.da.live/source/${ORG}/${siteInfo(site).site}`;
/** The DA document of the site's loc configuration. */
export const daConfigUrl = (site = DEFAULT_SITE) => `${daBase(site)}/.da/translate.json`;
/** The repository file of the site's configuration. */
export const configFile = (site = DEFAULT_SITE) => path.join(root, siteInfo(site).config);
/** The site's preview host (a translation's links are made absolute on it, dnt resetHrefs). */
export const aemPageOf = (site = DEFAULT_SITE) => `https://${aem(siteInfo(site).site)[0]}`;
/** The regular expression of the site's own hosts (an absolute link on one becomes root-relative). */
export const hostsRegex = (site = DEFAULT_SITE) => new RegExp(`^https://(${siteInfo(site).hosts.map((h) => h.replace(/\./g, '\\.')).join('|')})(?=/|$)`);

/** `--site <site>` of a command line (default lh-com), validated. */
export function siteFromArgv(argv = process.argv.slice(2)) {
  const i = argv.indexOf('--site');
  return siteInfo(i >= 0 ? argv[i + 1] : DEFAULT_SITE).site;
}
