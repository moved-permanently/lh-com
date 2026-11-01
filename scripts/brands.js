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
 * flight status' default airline); consentLinks: the privacy, cookie and imprint pages of the
 * fallback cookie banner per language (www's, the brand's OneTrust banner or footer; en for the
 * others); embeds: per site flag (scripts/flags.js) the configuration of a widget www embeds
 * that sends visitors or their data into the airline's live systems (scripts/embeds.js: its script
 * URL and vendor ids, as www's page source has them; loaded only with the site's flag on). The
 * brands' favicons and manifests: scripts/brand-icons.js. The languages of the sites without
 * <cc>/<ll> roots (Cargo, Air Dolomiti): scripts/site-languages.js.
 */
export const BRANDS = {
  discover: {
    name: 'Discover Airlines',
    // destinationPath: the www page of a destination under a root, where the destination finder
    // links (the site has none of its own); www's offers grid baseRedirectUrl:
    // /de/de/book/destination
    destinationPath: '/book/destination',
    oneTrust: '01994cb4-6d4f-7911-abbc-7117e4e6c370',
    messageCenter: 'four_y',
    destinationImages: '/content/dam/four_y/images/offers/destination',
    www: 'www.discover-airlines.com',
    portal: 'FOUR_Y',
    hub: 'FRA',
    airline: '4Y',
    consentLinks: {
      en: { privacy: 'https://www.discover-airlines.com/de/en/legal/data-protection-information', imprint: 'https://www.discover-airlines.com/de/en/legal/imprint' },
      de: { privacy: 'https://www.discover-airlines.com/de/de/legal/data-protection-information', imprint: 'https://www.discover-airlines.com/de/de/legal/imprint' },
    },
  },
  ita: {
    name: 'ITA Airways',
    // destinationPath: the www page of a destination under a root, where the destination finder
    // links (the site has none of its own); www: /it/en/book-and-prepare/destination?...
    // &tripType=RETURN
    destinationPath: '/book-and-prepare/destination',
    oneTrust: '01994cb4-04ea-768d-baf8-f6ed09be97dd',
    messageCenter: 'ita',
    destinationImages: '/content/dam/ita/images/offers/destination',
    www: 'www.ita-airways.com',
    portal: 'ITA',
    hub: 'ROM',
    airline: 'AZ',
    consentLinks: {
      en: {
        privacy: 'https://www.ita-airways.com/xy/en/legal/data-protection-overview/data-protection-ita?hidebanner=true',
        cookies: 'https://www.ita-airways.com/xy/en/legal/cookie-policy?hidebanner=true',
        imprint: 'https://www.ita-airways.com/xy/en/legal/imprint?hidebanner=true',
      },
    },
  },
  // Austrian Airlines (lh-austrian): its icons row: scripts/brand-icons.js; destination images:
  // the fare widgets' imageBaseUrl on www's homepage (2026-10-31)
  austrian: {
    name: 'Austrian Airlines',
    // destinationPath: the www page of a destination under a root, where the destination finder
    // links (the site has none of its own); www's offers grid baseRedirectUrl:
    // /at/en/book/destination
    destinationPath: '/book/destination',
    oneTrust: '01994cb3-6317-72f4-8589-1be98309c258',
    messageCenter: 'os',
    destinationImages: '/content/dam/austrian/global/images/offers/destination',
    www: 'www.austrian.com',
    // www.austrian.com's snapshots (2026-10-30): its pages' meta X-Portal OS, the at roots' origin
    // Vienna, the flight status' selected airline OS; the banner's links: each own root's footer
    // (Datenschutz, Imprint) and the Cookie Policy its data protection page links
    portal: 'OS',
    hub: 'VIE',
    airline: 'OS',
    embeds: {
      // the floating chat button (Cognigy webchat, served by www.austrian.com outside AEM) as www's
      // tag manager loads it (Tealium os-main tag 110, 2026-11-01): scripts/site-embeds.js, on the
      // pages with the metadata chat-button
      'chat-button': { script: 'https://www.austrian.com/digitalassistant/support/webchat_init.js' },
    },
    consentLinks: {
      en: {
        privacy: 'https://www.austrian.com/at/en/datenschutz',
        cookies: 'https://www.austrian.com/at/en/browser-cookies',
        imprint: 'https://www.austrian.com/at/en/imprint',
      },
      de: {
        privacy: 'https://www.austrian.com/at/de/datenschutz',
        cookies: 'https://www.austrian.com/at/de/browser-cookies',
        imprint: 'https://www.austrian.com/at/de/impressum',
      },
      fr: {
        privacy: 'https://www.austrian.com/fr/fr/datenschutz',
        cookies: 'https://www.austrian.com/fr/fr/browser-cookies',
        imprint: 'https://www.austrian.com/fr/fr/imprint',
      },
      it: {
        privacy: 'https://www.austrian.com/it/it/datenschutz',
        cookies: 'https://www.austrian.com/it/it/browser-cookies',
        imprint: 'https://www.austrian.com/it/it/imprint',
      },
      ru: {
        privacy: 'https://www.austrian.com/ru/ru/datenschutz',
        cookies: 'https://www.austrian.com/ru/ru/browser-cookies',
        imprint: 'https://www.austrian.com/ru/ru/imprint',
      },
      zh: {
        privacy: 'https://www.austrian.com/cn/zh/datenschutz',
        cookies: 'https://www.austrian.com/cn/zh/browser-cookies',
        imprint: 'https://www.austrian.com/cn/zh/imprint',
      },
      es: {
        privacy: 'https://www.austrian.com/es/es/datenschutz',
        cookies: 'https://www.austrian.com/es/es/browser-cookies',
        imprint: 'https://www.austrian.com/es/es/imprint',
      },
      el: {
        privacy: 'https://www.austrian.com/gr/el/datenschutz',
        cookies: 'https://www.austrian.com/gr/el/browser-cookies',
        imprint: 'https://www.austrian.com/gr/el/imprint',
      },
      ja: {
        privacy: 'https://www.austrian.com/jp/ja/datenschutz',
        cookies: 'https://www.austrian.com/jp/ja/browser-cookies',
        imprint: 'https://www.austrian.com/jp/ja/imprint',
      },
      pl: {
        privacy: 'https://www.austrian.com/pl/pl/datenschutz',
        cookies: 'https://www.austrian.com/pl/pl/browser-cookies',
        imprint: 'https://www.austrian.com/pl/pl/imprint',
      },
    },
  },
  // Brussels Airlines (lh-brussels): www.brusselsairlines.com's be/en and be/fr homepages
  // (2026-10-31): meta X-Portal SN, the fare widgets' origin BRU and imageBaseUrl, the OneTrust
  // banner's links (xx/en, xx/fr); no Message Center tenant yet
  brussels: {
    name: 'Brussels Airlines',
    oneTrust: '01994cb3-c7a3-7096-82a3-ae642c99e85e',
    destinationImages: '/content/dam/bel/images/offers/destination',
    www: 'www.brusselsairlines.com',
    portal: 'SN',
    hub: 'BRU',
    airline: 'SN',
    consentLinks: {
      en: {
        privacy: 'https://www.brusselsairlines.com/xx/en/legal-notices/data-protection-and-privacy-notice?hidebanner=true',
        cookies: 'https://www.brusselsairlines.com/xx/en/legal-notices/cookie-notice?hidebanner=true',
        imprint: 'https://www.brusselsairlines.com/xx/en/legal-notices/imprint?hidebanner=true',
      },
      fr: {
        privacy: 'https://www.brusselsairlines.com/xx/fr/legal-notices/data-protection-and-privacy-notice?hidebanner=true',
        cookies: 'https://www.brusselsairlines.com/xx/fr/legal-notices/cookie-notice?hidebanner=true',
        imprint: 'https://www.brusselsairlines.com/xx/fr/legal-notices/imprint?hidebanner=true',
      },
    },
  },
  // Lufthansa Cargo (lh-cargo): Lufthansa's look; www.lufthansa-cargo.com shows no cookie banner;
  // no Message Center tenant (nor Air Dolomiti's): their blocks show nothing
  cargo: {
    name: 'Lufthansa Cargo',
    theme: false,
    www: 'www.lufthansa-cargo.com',
    embeds: {
      // the newsletter form (Dynamics 365 Customer Insights) as www's /en/ci/newsletter embeds it
      // (2026-11-01): Microsoft's form loader; the form's ids are the block's rows
      // (blocks/newsletter-form), their URLs on formHost. Dynamics allows external form hosting
      // only on www.lufthansa-cargo.com: the flag stays off until Cargo's admin allows our host
      'newsletter-form': {
        script: 'https://cxppusa1formui01cdnsa01-endpoint.azureedge.net/eur/FormLoader/FormLoader.bundle.js',
        formHost: '.mkt.dynamics.com',
      },
    },
  },
  // Air Dolomiti (lh-airdolomiti): its own theme (styles/themes/airdolomiti.css, the Air Dolomiti
  // session's; until it exists the pages keep Lufthansa's look); www.airdolomiti.it loads no
  // OneTrust (2026-10-30)
  airdolomiti: {
    name: 'Air Dolomiti',
    www: 'www.airdolomiti.it',
    airline: 'EN',
    // booking: its own Amadeus engine, not shop.lufthansa.com (scripts/shop-handoff.js): a POST
    // form as www.airdolomiti.it's widget posts it (captured 2026-10-31 on .it, .eu and .de)
    booking: {
      format: 'airdolomiti', url: 'https://digital.airdolomiti.it/booking', officeId: 'EN01', langs: { it: 'it-IT', en: 'en-GB', de: 'de-DE' },
    },
    // articleTags: per language, the base of the post categories' pages the article header's tags
    // link to (www's /articoli page links /articoli/<slug>, 2026-10-31; English and German not
    // migrated yet: their chips without a link)
    articleTags: { it: 'https://www.airdolomiti.it/articoli' },
    // articleIndex: per language, the query index of its posts (helix-query.yaml
    // articles-airdolomiti-it, -en) the posts list (blog-overview) reads instead of lh-com's
    articleIndex: { it: '/articoli/query-index.json', en: '/en/articles/query-index.json' },
    embeds: {
      // the digital assistant (Engagent) as www's tag manager loads it (GTM-SH94, 2026-11-01): site
      // wide digital-assistant.js?cid=<cid>&view.mobileMode=detect, on the chat page DA.init into
      // #<htmlId> (scripts/site-embeds.js, blocks/live-chat). Engagent picks the widget by rules on
      // the page URL; none matches our hosts yet: the flag stays off until Air Dolomiti or
      // Engagent adds one
      'live-chat': {
        script: 'https://engagent.h-care.eu/webplayer/latest/js/digital-assistant.js',
        cid: 'c67b400ea554ae044b5da9a6ad05fd7b19e59cde',
        baseUrl: 'https://engagent.h-care.eu/webplayer/latest/',
        htmlId: 'da_airdolomiti_support',
      },
      // the eSIM plans widget (Breeze) as www's /en/extra-services/plans-esim embeds it
      // (2026-11-01); its token, products and colours are the block's rows (blocks/esim-widget)
      'esim-widget': { script: 'https://widgets.breezesim.com/v1/embed.js' },
    },
  },
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
 * tools/reports/lh-ita.md name them (55: xx/de, at/de, ch/de, xx/el and be/nl with the de/de,
 * gr/el and nl/nl documents).
 * Austrian Airlines (DA moved-permanently/lh-austrian, www.austrian.com): the ten reference roots
 * hold the language documents (tools/importer/austrian-scope.mjs LANGUAGE_VERSIONS), the 54
 * market roots get them where the document's `markets` row lists the root and hold their own
 * homepage, nav, footer and own pages; www's sitemaps have 73 roots: the nine xx homepages that
 * answer 404 on www (all but xx/en) and the roots only hreflang links name (ae/ae, be/fr, kr/en)
 * are none (tools/reports/lh-austrian.md).
 * Brussels Airlines (DA moved-permanently/lh-brussels, www.brusselsairlines.com): the six reference
 * roots (be/en, be/fr, be/nl, de/de, it/it, es/es: tools/importer/brussels-scope.mjs
 * LANGUAGE_VERSIONS) hold the language documents, the 92 market roots get them where the
 * document's `markets` row lists the root and hold their own homepage and own pages; the six xx
 * roots redirect to be on www and are none; names: www's country and language selector (the be/en
 * and be/fr homepages, 2026-11-01; those of the nl, de, it and es roots until their homepages are
 * captured: the country in the language); no airports listed: the hub BRU
 * (tools/reports/lh-brussels.md).
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
      // the market roots of the de, el and nl documents (de/de, gr/el, nl/nl, live since
      // 2026-10-31), with www's country and language selector label (their homepage snapshots)
      'xx/de': row('xx', 'de', 'de', 'language', 'Andere Länder | Deutsch'),
      'at/de': row('at', 'de', 'de-AT', 'language', 'Österreich | Deutsch'),
      'ch/de': row('ch', 'de', 'de-CH', 'language', 'Schweiz | Deutsch'),
      'xx/el': row('xx', 'el', 'el', 'language', 'Παγκόσμιος ιστότοπος | Ελληνικά'),
      'be/nl': row('be', 'nl', 'nl-BE', 'language', 'België | Nederlands'),
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
  austrian: {
    rows: {
      ...rowsOf('own', ['at/en', 'at/de', 'fr/fr', 'it/it', 'ru/ru', 'cn/zh', 'es/es', 'gr/el', 'jp/ja', 'pl/pl']),
      ...rowsOf('language', [
        'al/en', 'am/en', 'au/en', 'ba/en', 'be/en', 'bg/en', 'by/en', 'ca/en', 'ch/en', 'cn/en',
        'cy/en', 'cz/en', 'de/en', 'dk/en', 'eg/en', 'es/en', 'fr/en', 'gb/en', 'ge/en', 'gr/en',
        'hr/en', 'hu/en', 'il/en', 'iq/en', 'ir/en', 'it/en', 'jo/en', 'jp/en', 'lt/en', 'md/en',
        'me/en', 'mk/en', 'nl/en', 'no/en', 'pl/en', 'pt/en', 'ro/en', 'rs/en', 'ru/en', 'se/en',
        'si/en', 'sk/en', 'th/en', 'tr/en', 'ua/en', 'us/en', 'xk/en', 'xx/en',
        'ch/de', 'de/de',
        'ca/fr', 'ch/fr',
        'ch/it',
        'by/ru',
      ]),
    },
    versions: {
      en: 'at/en', de: 'at/de', fr: 'fr/fr', it: 'it/it', ru: 'ru/ru', zh: 'cn/zh', es: 'es/es', el: 'gr/el', ja: 'jp/ja', pl: 'pl/pl',
    },
    // every root: www's selector label (its homepage snapshot, 2026-10-30; ch/de's renders none:
    // as its siblings)
    names: {
      'al/en': 'Albania | English',
      'am/en': 'Armenia | English',
      'at/de': 'Österreich | Deutsch',
      'at/en': 'Austria | English',
      'au/en': 'Australia | English',
      'ba/en': 'Bosnia-Herzegovina | English',
      'be/en': 'Belgium | English',
      'bg/en': 'Bulgaria | English',
      'by/en': 'Belarus | English',
      'by/ru': 'Belarus | Русский',
      'ca/en': 'Canada | English',
      'ca/fr': 'Canada | Français',
      'ch/de': 'Schweiz | Deutsch',
      'ch/en': 'Switzerland | English',
      'ch/fr': 'Suisse | Français',
      'ch/it': 'Svizzera | Italiano',
      'cn/en': 'Cina (Continentale) | English',
      'cn/zh': '中国内地 (China Mainland) | 简体中文',
      'cy/en': 'Cipro | English',
      'cz/en': 'Czech Republic | English',
      'de/de': 'Deutschland | Deutsch',
      'de/en': 'Germany | English',
      'dk/en': 'Denmark | English',
      'eg/en': 'Egypt | English',
      'es/en': 'Spain | English',
      'es/es': 'España | Español',
      'fr/en': 'France | English',
      'fr/fr': 'France | Français',
      'gb/en': 'United Kingdom | English',
      'ge/en': 'Georgia | English',
      'gr/el': 'Ελλάδα | Ελληνικά',
      'gr/en': 'Greece | English',
      'hr/en': 'Croatia | English',
      'hu/en': 'Hungary | English',
      'il/en': 'Israel | English',
      'iq/en': 'Iraq | English',
      'ir/en': 'Iran | English',
      'it/en': 'Italy | English',
      'it/it': 'Italia | Italiano',
      'jo/en': 'Jordan | English',
      'jp/en': 'Japan | English',
      'jp/ja': 'Japan | 日本語',
      'lt/en': 'Lithuania | English',
      'md/en': 'Moldova | English',
      'me/en': 'Montenegro | English',
      'mk/en': 'North Macedonia | English',
      'nl/en': 'Netherlands | English',
      'no/en': 'Norway | English',
      'pl/en': 'Poland | English',
      'pl/pl': 'Polska | Polski',
      'pt/en': 'Portugal | English',
      'ro/en': 'Romania | English',
      'rs/en': 'Serbia | English',
      'ru/en': 'Russian Federation | English',
      'ru/ru': 'Russian Federation | Русский',
      'se/en': 'Sweden | English',
      'si/en': 'Slovenia | English',
      'sk/en': 'Slovakia | English',
      'th/en': 'Thailand | English',
      'tr/en': 'Turkey | English',
      'ua/en': 'Ukraine | English',
      'us/en': 'USA | English',
      'xk/en': 'Kosovo | English',
      'xx/en': 'Other countries | English',
    },
    // the homepages' flight search default origin (ca/en, ca/fr: Toronto)
    airports: {
      'al/en': 'TIA',
      'am/en': 'EVN',
      'at/de': 'VIE',
      'at/en': 'VIE',
      'au/en': 'SYD',
      'ba/en': 'SJJ',
      'be/en': 'BRU',
      'bg/en': 'SOF',
      'by/en': 'VIE',
      'by/ru': 'VIE',
      'ca/en': 'YTO',
      'ca/fr': 'YTO',
      'ch/de': 'ZRH',
      'ch/en': 'ZRH',
      'ch/fr': 'GVA',
      'ch/it': 'ZRH',
      'cn/en': 'BJS',
      'cn/zh': 'BJS',
      'cy/en': 'LCA',
      'cz/en': 'PRG',
      'de/de': 'FRA',
      'de/en': 'FRA',
      'dk/en': 'CPH',
      'eg/en': 'CAI',
      'es/en': 'MAD',
      'es/es': 'MAD',
      'fr/en': 'PAR',
      'fr/fr': 'PAR',
      'gb/en': 'LON',
      'ge/en': 'TBS',
      'gr/el': 'ATH',
      'gr/en': 'ATH',
      'hr/en': 'ZAG',
      'hu/en': 'BUD',
      'il/en': 'TLV',
      'iq/en': 'EBL',
      'ir/en': 'THR',
      'it/en': 'MIL',
      'it/it': 'MIL',
      'jo/en': 'AMM',
      'jp/en': 'TYO',
      'jp/ja': 'TYO',
      'lt/en': 'VNO',
      'md/en': 'RMO',
      'me/en': 'TGD',
      'mk/en': 'SKP',
      'nl/en': 'AMS',
      'no/en': 'OSL',
      'pl/en': 'WAW',
      'pl/pl': 'WAW',
      'pt/en': 'LIS',
      'ro/en': 'BUH',
      'rs/en': 'BEG',
      'ru/en': 'VIE',
      'ru/ru': 'VIE',
      'se/en': 'STO',
      'si/en': 'LJU',
      'sk/en': 'KSC',
      'th/en': 'BKK',
      'tr/en': 'IST',
      'ua/en': 'VIE',
      'us/en': 'WAS',
      'xk/en': 'PRN',
      'xx/en': 'VIE',
    },
  },
  brussels: {
    rows: {
      ...rowsOf('own', ['be/en', 'be/fr', 'be/nl', 'de/de', 'it/it', 'es/es']),
      ...rowsOf('language', [
        'ae/en', 'am/en', 'ao/en', 'at/en', 'bf/en', 'bg/en', 'bi/en', 'bj/en', 'br/en', 'ca/en',
        'cd/en', 'ch/en', 'ci/en', 'cm/en', 'cv/en', 'cy/en', 'cz/en', 'de/en', 'dk/en', 'ee/en',
        'eg/en', 'es/en', 'fi/en', 'fr/en', 'gb/en', 'gh/en', 'gm/en', 'gn/en', 'gr/en', 'hr/en',
        'hu/en', 'ie/en', 'il/en', 'in/en', 'it/en', 'jp/en', 'ke/en', 'lr/en', 'lt/en', 'lu/en',
        'lv/en', 'ma/en', 'me/en', 'mk/en', 'mt/en', 'ng/en', 'nl/en', 'no/en', 'pl/en', 'pt/en',
        'ro/en', 'ru/en', 'rw/en', 'se/en', 'sg/en', 'si/en', 'sl/en', 'sn/en', 'tg/en', 'th/en',
        'tn/en', 'tr/en', 'tz/en', 'ua/en', 'ug/en', 'us/en',
        'ao/fr', 'bf/fr', 'bi/fr', 'bj/fr', 'ca/fr', 'cd/fr', 'ch/fr', 'ci/fr', 'cm/fr', 'fr/fr',
        'gh/fr', 'gm/fr', 'gn/fr', 'jp/fr', 'lr/fr', 'lu/fr', 'ma/fr', 'rw/fr', 'sl/fr', 'sn/fr',
        'tg/fr', 'ug/fr',
        'nl/nl',
        'at/de', 'ch/de',
        'ch/it',
      ]),
    },
    versions: {
      en: 'be/en', fr: 'be/fr', nl: 'be/nl', de: 'de/de', it: 'it/it', es: 'es/es',
    },
    names: {
      'ae/en': 'United Arab Emirates | English',
      'am/en': 'Armenia | English',
      'ao/en': 'Angola | English',
      'ao/fr': 'Angola | Français',
      'at/de': 'Österreich | Deutsch',
      'at/en': 'Austria | English',
      'be/en': 'Belgium | English',
      'be/fr': 'Belgique | Français',
      'be/nl': 'België | Nederlands',
      'bf/en': 'Burkina Faso | English',
      'bf/fr': 'Burkina Faso | Français',
      'bg/en': 'Bulgaria | English',
      'bi/en': 'Burundi | English',
      'bi/fr': 'Burundi | Français',
      'bj/en': 'Benin | English',
      'bj/fr': 'Benin | Français',
      'br/en': 'Brazil | English',
      'ca/en': 'Canada | English',
      'ca/fr': 'Canada | Français',
      'cd/en': 'Democratic Republic of Congo | English',
      'cd/fr': 'République démocratique du Congo | Français',
      'ch/de': 'Schweiz | Deutsch',
      'ch/en': 'Switzerland | English',
      'ch/fr': 'Suisse | Français',
      'ch/it': 'Svizzera | Italiano',
      'ci/en': 'Cote d\'Ivoire | English',
      'ci/fr': 'Cote d\'Ivoire | Français',
      'cm/en': 'Cameroon | English',
      'cm/fr': 'Cameroun | Français',
      'cv/en': 'Cape Verde Islands | English',
      'cy/en': 'Cyprus | English',
      'cz/en': 'Czech Republic | English',
      'de/de': 'Deutschland | Deutsch',
      'de/en': 'Germany | English',
      'dk/en': 'Denmark | English',
      'ee/en': 'Estonia | English',
      'eg/en': 'Egypt | English',
      'es/en': 'Spain | English',
      'es/es': 'España | Español',
      'fi/en': 'Finland | English',
      'fr/en': 'France | English',
      'fr/fr': 'France | Français',
      'gb/en': 'United Kingdom | English',
      'gh/en': 'Ghana | English',
      'gh/fr': 'Ghana | Français',
      'gm/en': 'Gambia | English',
      'gm/fr': 'Gambia | Français',
      'gn/en': 'Guinea | English',
      'gn/fr': 'Guinea | Français',
      'gr/en': 'Greece | English',
      'hr/en': 'Croatia | English',
      'hu/en': 'Hungary | English',
      'ie/en': 'Ireland | English',
      'il/en': 'Israel | English',
      'in/en': 'India | English',
      'it/en': 'Italy | English',
      'it/it': 'Italia | Italiano',
      'jp/en': 'Japan | English',
      'jp/fr': 'Japon | Français',
      'ke/en': 'Kenya | English',
      'lr/en': 'Liberia | English',
      'lr/fr': 'Liberia | Français',
      'lt/en': 'Lithuania | English',
      'lu/en': 'Luxembourg | English',
      'lu/fr': 'Luxembourg | Français',
      'lv/en': 'Latvia | English',
      'ma/en': 'Morocco | English',
      'ma/fr': 'Maroc | Français',
      'me/en': 'Montenegro | English',
      'mk/en': 'North Macedonia | English',
      'mt/en': 'Malta | English',
      'ng/en': 'Nigeria | English',
      'nl/en': 'Netherlands | English',
      'nl/nl': 'Nederland | Nederlands',
      'no/en': 'Norway | English',
      'pl/en': 'Poland | English',
      'pt/en': 'Portugal | English',
      'ro/en': 'Romania | English',
      'ru/en': 'Russian Federation | English',
      'rw/en': 'Rwanda | English',
      'rw/fr': 'Rwanda | Français',
      'se/en': 'Sweden | English',
      'sg/en': 'Singapore | English',
      'si/en': 'Slovenia | English',
      'sl/en': 'Sierra Leone | English',
      'sl/fr': 'Sierra Leone | Français',
      'sn/en': 'Senegal | English',
      'sn/fr': 'Senegal | Français',
      'tg/en': 'Togo | English',
      'tg/fr': 'Togo | Français',
      'th/en': 'Thailand | English',
      'tn/en': 'Tunisia | English',
      'tr/en': 'Turkey | English',
      'tz/en': 'Tanzania | English',
      'ua/en': 'Ukraine | English',
      'ug/en': 'Uganda | English',
      'ug/fr': 'Uganda | Français',
      'us/en': 'USA | English',
    },
    airports: {},
  },
};
