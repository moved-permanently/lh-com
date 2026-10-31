/*
 * The brand sites on lh-com's code, one source for the site's pages and lh-edge (no imports:
 * lh-edge bundles this file through src/sites.js and scripts/locale.js).
 * BRANDS: per `brand` metadata value (scripts/brand.js reads them) the display name, OneTrust id,
 * theme, Message Center tenant, destination-image folder, www host and, for the brands on www's
 * own platform, the portal of its /service/api calls (X-Portal, the label bundles' tenant) and
 * its hub (the home airport of a root without one).
 * BRAND_SITES: the brands with <cc>/<ll> roots (Discover, ITA): their locale rows and language
 * versions (lh-edge's src/sites.js SITES are built from them), the root names of the country and
 * language dialog (the root's footer label) and each root's home airport (its homepage's flight
 * search default origin). The sites without roots (Cargo, Air Dolomiti): scripts/site-languages.js.
 */

/**
 * The known brands: metadata value -> display name, OneTrust id (the data-domain-script of the
 * brand's www pages, 2026-10-30; scripts/consent.js) and theme (styles/themes/<key>.css; false:
 * Lufthansa's look). Unknown values are ignored. A brand without a oneTrust id gets no consent
 * banner (and nothing that needs consent runs on its pages). messageCenter: the brand's Message
 * Center tenant on www (its messages' tenant in the site's own /message-center/index.json and its
 * row of /message-center/config/cti-pages.json; scripts/message-center.js siteTenant); a brand
 * without one shows no messages, lh-com (no key) Lufthansa's ('lh'). destinationImages: the
 * folder of the destination images of the brand's fare widgets on www (its imageBaseUrl; the
 * site's own copies under that path); Lufthansa's without one. www: the brand's own www host (its
 * links open like lufthansa.com's on lh-com: isOwnWwwHost; its pages replace www.lufthansa.com's
 * in links: scripts/locale.js siteOrigin). portal: www's X-Portal of the brand's pages (their
 * meta X-Portal: Discover FOUR_Y; ITA ITA), the tenant of its /service/api calls and label
 * bundles (lowercase); hub: the home airport of a root without one; airline: its IATA code (the
 * flight status' default airline). The brands' favicons and
 * manifests: scripts/brand-icons.js. The languages of the sites without <cc>/<ll> roots (Cargo,
 * Air Dolomiti): scripts/site-languages.js.
 */
export const BRANDS = {
  discover: {
    name: 'Discover Airlines',
    oneTrust: '01994cb4-6d4f-7911-abbc-7117e4e6c370',
    messageCenter: 'four_y',
    destinationImages: '/content/dam/four_y/images/offers/destination',
    www: 'www.discover-airlines.com',
    portal: 'FOUR_Y',
    hub: 'FRA',
    airline: '4Y',
  },
  ita: {
    name: 'ITA Airways',
    oneTrust: '01994cb4-04ea-768d-baf8-f6ed09be97dd',
    messageCenter: 'ita',
    destinationImages: '/content/dam/ita/images/offers/destination',
    www: 'www.ita-airways.com',
    portal: 'ITA',
    hub: 'ROM',
    airline: 'AZ',
  },
  // Austrian Airlines (lh-austrian): its icons row: scripts/brand-icons.js; destination images:
  // the fare widgets' imageBaseUrl on www's homepage (2026-10-31)
  austrian: {
    name: 'Austrian Airlines',
    oneTrust: '01994cb3-6317-72f4-8589-1be98309c258',
    messageCenter: 'os',
    destinationImages: '/content/dam/austrian/global/images/offers/destination',
    www: 'www.austrian.com',
  },
  // Lufthansa Cargo (lh-cargo): Lufthansa's look; www.lufthansa-cargo.com shows no cookie banner;
  // no Message Center tenant (nor Air Dolomiti's): their blocks show nothing
  cargo: { name: 'Lufthansa Cargo', theme: false, www: 'www.lufthansa-cargo.com' },
  // Air Dolomiti (lh-airdolomiti): its own theme (styles/themes/airdolomiti.css, the Air Dolomiti
  // session's; until it exists the pages keep Lufthansa's look); www.airdolomiti.it loads no
  // OneTrust (2026-10-30)
  airdolomiti: { name: 'Air Dolomiti', www: 'www.airdolomiti.it' },
};

// label: www's country and language label of the root (its header's selector), set where a
// market root's nav and footer come from its language version's (lh-edge src/markets.js)
const row = (country, lang, hreflang, documents, label) => ({
  country, lang, hreflang, status: 'live', documents, ...(label ? { label } : {}),
});

// rows of roots <cc>/<ll>: hreflang <ll>-<CC>, an xx root's the language alone (as Discover's)
const rowsOf = (documents, roots) => Object.fromEntries(roots.map((r) => {
  const [cc, ll] = r.split('/');
  return [r, row(cc, ll, cc === 'xx' ? ll : `${ll}-${cc.toUpperCase()}`, documents)];
}));

/**
 * The brands with <cc>/<ll> roots. rows: the locale table (status, documents "own": the root's
 * own documents, "language": answered from its language version's); versions: the root of each
 * language's documents; names: the dialog's name of a root without a www label (its footer's
 * country | language line); airports: the home airport of each root (its homepage's flight search
 * default origin, 2026-10-31), the brand's hub for the others.
 * Discover Airlines (DA moved-permanently/lh-discover, www.discover-airlines.com): de/en, de/de
 * and xx/fr hold the language documents (the largest root of each language), the market roots get
 * them where their sitemaps list the page (the page's `markets` metadata) and hold their own
 * homepage and own pages; hreflang as www's sitemaps (2026-10-29); the market roots' labels as
 * www's country and language selector (its snapshots, 2026-10-30).
 * ITA Airways (DA moved-permanently/lh-ita, www.ita-airways.com): the nine reference roots hold
 * the language documents (tools/importer/ita-scope.mjs LANGUAGE_VERSIONS), the market roots get
 * them where the document's `markets` row lists the root (written as roots, "be/fr, ch/fr":
 * scripts/market-rules.js); the market roots as the published documents' markets rows and
 * tools/reports/lh-ita.md name them (50 of www's 55: the de, nl, pt, el and ja ones beyond xx/nl,
 * xx/pt and xx/ja come with those languages' documents).
 */
export const BRAND_SITES = {
  discover: {
    rows: {
      'de/en': row('de', 'en', 'en-DE', 'own'),
      'de/de': row('de', 'de', 'de-DE', 'own'),
      'xx/fr': row('xx', 'fr', 'fr', 'own'),
      'us/en': row('us', 'en', 'en-US', 'language', 'USA | English'),
      'ca/en': row('ca', 'en', 'en-CA', 'language', 'Canada | English'),
      'xx/en': row('xx', 'en', 'en', 'language', 'Other countries | English'),
      'us/de': row('us', 'de', 'de-US', 'language', 'USA | Deutsch'),
      'xx/de': row('xx', 'de', 'de', 'language', 'Andere Länder | Deutsch'),
      'ca/fr': row('ca', 'fr', 'fr-CA', 'language', 'Canada | Français'),
    },
    versions: { en: 'de/en', de: 'de/de', fr: 'xx/fr' },
    names: { 'de/en': 'Germany | English', 'de/de': 'Deutschland | Deutsch', 'xx/fr': 'Autre pays | Français' },
    airports: {
      'de/en': 'FRA', 'de/de': 'FRA', 'us/en': 'TPA', 'us/de': 'TPA', 'ca/en': 'YYC', 'ca/fr': 'YYC',
    },
  },
  ita: {
    rows: {
      ...rowsOf('own', ['it/en', 'it/it', 'fr/fr', 'es/es', 'de/de', 'nl/nl', 'br/pt', 'gr/el', 'jp/ja']),
      ...rowsOf('language', [
        'ae/en', 'al/en', 'ar/en', 'at/en', 'au/en', 'be/en', 'bg/en', 'br/en', 'ca/en', 'ch/en',
        'de/en', 'do/en', 'dz/en', 'eg/en', 'es/en', 'fr/en', 'gb/en', 'gh/en', 'gr/en', 'hr/en',
        'il/en', 'in/en', 'jp/en', 'ly/en', 'mt/en', 'mu/en', 'mv/en', 'nl/en', 'sa/en', 'sn/en',
        'th/en', 'tn/en', 'us/en', 've/en', 'xx/en',
        'al/it', 'be/it', 'ch/it', 'xx/it',
        'be/fr', 'ca/fr', 'ch/fr', 'tn/fr', 'xx/fr',
        'ar/es', 'do/es', 'xx/es',
        'xx/nl', 'xx/pt', 'xx/ja',
      ]),
    },
    versions: {
      en: 'it/en', it: 'it/it', fr: 'fr/fr', es: 'es/es', de: 'de/de', nl: 'nl/nl', pt: 'br/pt', el: 'gr/el', ja: 'jp/ja',
    },
    names: {
      'it/en': 'Italy | English',
      'it/it': 'Italia | Italiano',
      'fr/fr': 'France | Français',
      'es/es': 'España | Español',
      'de/de': 'Deutschland | Deutsch',
      'nl/nl': 'Nederland | Nederlands',
      'br/pt': 'Brasil | Português',
      'gr/el': 'Ελλάδα | Ελληνικά',
      'jp/ja': 'Japan | 日本語',
    },
    airports: {
      'it/en': 'ROM',
      'it/it': 'ROM',
      'fr/fr': 'PAR',
      'fr/en': 'PAR',
      'es/es': 'MAD',
      'es/en': 'MAD',
      'de/de': 'FRA',
      'de/en': 'FRA',
      'nl/nl': 'AMS',
      'nl/en': 'AMS',
      'br/pt': 'SAO',
      'br/en': 'SAO',
      'gr/el': 'ATH',
      'gr/en': 'ATH',
      'jp/ja': 'TYO',
      'jp/en': 'TYO',
      'ae/en': 'DXB',
      'al/en': 'TIA',
      'al/it': 'ROM',
      'ar/en': 'BUE',
      'ar/es': 'BUE',
      'at/en': 'VIE',
      'au/en': 'SYD',
      'be/en': 'BRU',
      'be/it': 'ROM',
      'be/fr': 'PAR',
      'bg/en': 'SOF',
      'ca/en': 'YTO',
      'ca/fr': 'YTO',
      'ch/en': 'ZRH',
      'ch/fr': 'ZRH',
      'ch/it': 'ZRH',
      'do/en': 'SDQ',
      'do/es': 'SDQ',
      'dz/en': 'ALG',
      'eg/en': 'CAI',
      'gb/en': 'LON',
      'gh/en': 'ACC',
      'hr/en': 'SPU',
      'il/en': 'TLV',
      'in/en': 'DEL',
      'mt/en': 'MLA',
      'mv/en': 'MLE',
      'sa/en': 'JED',
      'sn/en': 'DKR',
      'th/en': 'BKK',
      'tn/en': 'TUN',
      'tn/fr': 'TUN',
      'us/en': 'NYC',
      've/en': 'CCS',
    },
  },
};
