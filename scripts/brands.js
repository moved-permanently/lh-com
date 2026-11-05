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
 * search default origin). The sites without roots (Cargo, Air Dolomiti, TAP):
 * scripts/site-languages.js.
 */

/**
 * The known brands: metadata value -> display name, OneTrust id (the data-domain-script of the
 * brand's www pages, 2026-10-30; scripts/consent.js) and theme (styles/themes/<key>.css; false:
 * Lufthansa's look). Unknown values are ignored. A brand without a oneTrust id gets no consent
 * banner (and nothing that needs consent runs on its pages). messageCenter: the brand's Message
 * Center tenant on www (its messages' tenant in the site's own /message-center/index.json and its
 * row of /message-center/config/cti-pages.json; scripts/message-center.js siteTenant), for Cargo
 * and Air Dolomiti, no tenants of www's Message Center, their brand key (their documents come
 * from their own sites); a brand without one shows no messages, lh-com (no key) Lufthansa's
 * ('lh'). destinationImages: the
 * folder of the destination images of the brand's fare widgets on www (its imageBaseUrl; the
 * site's own copies under that path); Lufthansa's without one. www: the brand's own www host (its
 * links open like lufthansa.com's on lh-com: isOwnWwwHost; its pages replace www.lufthansa.com's
 * in links: scripts/locale.js siteOrigin). serviceOrigin: the brand's www host whose /service/api
 * answers our hosts cross-origin, called instead of www.lufthansa.com by the widgets that ask for
 * it (scripts/locale.js serviceOrigin; www.brusselsairlines.com sends no CORS headers, so
 * Brussels has none). portal: www's X-Portal of the brand's pages (their
 * meta X-Portal: Discover FOUR_Y; ITA ITA), the tenant of its /service/api calls and label
 * bundles (lowercase); hub: the home airport of a root without one; airline: its IATA code (the
 * flight status' default airline, the eJournals trips' tenant); travelId: the brand's Travel ID
 * login (host, client_id of www's login links, 2026-11-01; redirect_uri its www, the scope as
 * Lufthansa's: blocks/ejournals); consentLinks: the privacy, cookie and imprint pages of the
 * fallback cookie banner per language (www's, the brand's OneTrust banner or footer; en for the
 * others); embeds: per site flag (scripts/flags.js) the configuration of a widget www embeds
 * that sends visitors or their data into the airline's live systems (scripts/embeds.js: its script
 * URL and vendor ids, as www's page source has them; loaded only with the site's flag on). The
 * brands' favicons and manifests: scripts/brand-icons.js. The languages of the sites without
 * <cc>/<ll> roots (Cargo, Air Dolomiti): scripts/site-languages.js. accessibility: the header's
 * accessibility settings (text size and contrast as www.airdolomiti.it's,
 * scripts/accessibility.js); the other brands render nothing of them. backends: lh-backends (the
 * backend Worker) has the brand's tenant, so lh-edge sends its host's deeplink, sign-in, booking
 * and check-in paths there (tools/workers/lh-edge, brief 212); aemContent: the root of www's AEM
 * paths (/content/<aemContent>/markets/<cc>/<ll>/...), which lh-edge redirects to the short path.
 * travellersDialog: the flight search's traveller line opens the group platform's travellers
 * window (blocks/flight-search/travellers-dialog.js) instead of the dropdown; its labels: the
 * brand's own wording of the window per language, where www's differs from the group's;
 * redeemMiles: its Redeem miles tab (travellers-miles.js), the targets with {cc}, {ll} and
 * {clientId} (travelId.clientId) filled, awardsStyle the award search's button.
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
    travelId: { host: 'api.travelid.discover-airlines.com', clientId: 'NqkvGG8MB6OeCkb66a02D0ORHOFhQWJ4' },
    backends: true,
    aemContent: 'four_y',
    // gridBadges: the offers grid orders and badges as www's Discover grid (2026-11-02): only the
    // top deals ("Recommended") first, k-class offers "Best price" where their price puts them
    // (blocks/destination-finder gridBadges)
    gridBadges: true,
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
    travelId: { host: 'api.travelid.ita-airways.com', clientId: '14eKnYUwomcAimITtmaa2GqBM5mhO8kAS3GjTyE6RDsFaWrI' },
    backends: true,
    aemContent: 'ita',
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
    travelId: { host: 'api.travelid.austrian.com', clientId: 'dFquxAQT637lrYALS9UKBMieeibyGaVQ' },
    // its /service/api answers our hosts cross-origin (Access-Control-Allow-Origin *, checked
    // 2026-11-01): the check-in deadline search calls it
    serviceOrigin: 'www.austrian.com',
    backends: true,
    aemContent: 'aua',
    // www.austrian.com's snapshots (2026-10-30): its pages' meta X-Portal OS, the at roots' origin
    // Vienna, the flight status' selected airline OS; the banner's links: each own root's footer
    // (Datenschutz, Imprint) and the Cookie Policy its data protection page links
    portal: 'OS',
    hub: 'VIE',
    airline: 'OS',
    // www's travellers window (capture austrian-parity-001, at/en and at/de): its button Save /
    // Weiter, the children's "(2 to 11 years)", "Reiseklassen"
    travellersDialog: {
      labels: {
        en: { 'continue label': 'Save', 'children hint': '(2 to 11 years)' },
        de: { 'continue label': 'Weiter', 'cabin label': 'Reiseklassen' },
      },
    },
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
  // banner's links (xx/en, xx/fr); www's Message Center tenant sn (its current travel information
  // page /<root>/plan-your-trip/flight-information, lh-brussels' cti-pages row)
  brussels: {
    name: 'Brussels Airlines',
    oneTrust: '01994cb3-c7a3-7096-82a3-ae642c99e85e',
    destinationImages: '/content/dam/bel/images/offers/destination',
    // destinationPath: a destination's page under a root; destinationOnSite: the languages whose
    // page is on the site itself (lh-brussels has be/en's and be/fr's, with live prices, for every
    // English and French root): the fare teaser, the homepage slider and the offers grid open
    // /<root>/book-a-flight/destination there, www's page in the other languages
    destinationPath: '/book-a-flight/destination',
    destinationOnSite: ['en', 'fr'],
    messageCenter: 'sn',
    embeds: {
      // the floating chat button (Cognigy webchat, served by www.brusselsairlines.com outside
      // AEM) as www's pages load it (Tealium, the snapshots of 2026-11-01): webchat_init.js
      // ?language=<LL> in the six languages, &start=DYNAMIC_web-<id> with a start id;
      // scripts/site-embeds.js, on the pages with the metadata chat-button (the flag off until
      // checked on brussels.turnsthe.page)
      'chat-button': {
        script: 'https://www.brusselsairlines.com/digitalassistant/support/webchat_init.js',
        languages: ['en', 'fr', 'nl', 'de', 'it', 'es'],
      },
    },
    www: 'www.brusselsairlines.com',
    travelId: { host: 'api.travelid.brusselsairlines.com', clientId: 'FuBoxl39ln5fAfvIAX18xIi2BI4d6rny' },
    // lh-backends has tenant SN (its 594d7fd); www's AEM paths: /content/bel/markets/<cc>/<ll>/...
    backends: true,
    aemContent: 'bel',
    portal: 'SN',
    hub: 'BRU',
    airline: 'SN',
    // www's travellers window (capture brussels-parity-001, be/en and be/fr): the group's wording
    travellersDialog: {
      // www's Redeem miles tab (capture redeem-miles-001): the login on the replica (Travel ID
      // returns only to www), the enrolment and the award search as www's; be/fr's enrolment
      // link on www is broken (/content/sn/gc/fr): the French enrolment page
      redeemMiles: {
        login: '/{cc}/{ll}/profile/login',
        member: 'https://brusselsairlines.miles-and-more.com/web/row/{ll}/enrolment.html?client_id={clientId}&redirect_uri=https://www.brusselsairlines.com',
        awards: 'https://www.miles-and-more.com/be/en/spend/flights.html',
        awardsStyle: 'secondary',
      },
    },
    // articleIndex: per language, the query index of its posts (helix-query.yaml articles-be-en,
    // -fr, -nl): the posts list reads its language version's on every root (a market root has no
    // index of its own)
    articleIndex: {
      en: '/be/en/articles/query-index.json',
      fr: '/be/fr/articles/query-index.json',
      nl: '/be/nl/articles/query-index.json',
    },
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
  // Lufthansa Group for Business (lh-b2b): business.lufthansagroup.com's de/en and de/de homepages
  // (2026-11-01): OneTrust's data-domain-script, meta X-Portal B2BNEO, the design system's theme
  // maui-theme-b2b (styles/themes/b2b.css); its Message Center tenant b2b
  b2b: {
    name: 'Lufthansa Group for Business',
    oneTrust: '01a08598-d052-711c-9ff4-2def82055cba',
    messageCenter: 'b2b',
    www: 'business.lufthansagroup.com',
    portal: 'B2BNEO',
    // www's header (blocks/header): the menu's top items in the bar with drop-downs, the logo not
    // a link, a boxed search button to the search page, no country selector (the footer's)
    header: {
      menu: 'bar', logoLink: false, search: 'button', locale: false,
    },
    // the cookie banner's links: www's Data protection page (its cookie categories too) and Imprint
    consentLinks: {
      en: { privacy: '/de/en/common/privacy', cookies: '/de/en/common/privacy', imprint: '/de/en/common/imprint' },
      de: { privacy: '/de/de/common/privacy', cookies: '/de/de/common/privacy', imprint: '/de/de/common/imprint' },
    },
  },
  // SWISS (lh-swiss): www.swiss.com's ch/en and ch/de homepages (the snapshots of 2026-11-02):
  // OneTrust's data-domain-script, meta X-Portal LX, the design system's theme maui-theme-lx
  // (styles/themes/swiss.css); www's Message Center tenant lx; the hub Zurich (Geneva the second
  // one; the roots' own airports come with BRAND_SITES); the cookie banner's links: the footer's
  // privacy statement and imprint under /<root>/terms-conditions (no cookie page of its own)
  swiss: {
    name: 'SWISS',
    oneTrust: '01994cb2-f461-7489-80cc-e1ce655a86bc',
    messageCenter: 'lx',
    destinationImages: '/content/dam/lx/images/offers/destination',
    www: 'www.swiss.com',
    travelId: { host: 'api.travelid.swiss.com', clientId: 'sAwlvrK8fb55GvHqM5Me9iAWpF9rchZL' },
    // lh-backends has tenant LX (its cd329fe); www's AEM paths: /content/lx/markets/<cc>/<ll>/...
    backends: true,
    aemContent: 'lx',
    portal: 'LX',
    hub: 'ZRH',
    airline: 'LX',
    // www's travellers window (capture swiss-parity-001, ch/en and ch/de): ch/de's Swiss spelling
    travellersDialog: {
      labels: { de: { 'close label': 'Schliessen' } },
      // www's Redeem miles tab (capture redeem-miles-001): the login on the replica, the
      // enrolment and the award search (de/de for every language) as www's, the search filled
      redeemMiles: {
        login: '/{cc}/{ll}/login',
        member: 'https://swiss.miles-and-more.com/web/row/{ll}/enrolment.html?client_id={clientId}&redirect_uri=https://www.swiss.com',
        awards: 'https://www.miles-and-more.com/de/de/spend/flights.html',
        awardsStyle: 'accent',
      },
    },
    consentLinks: {
      en: {
        privacy: 'https://www.swiss.com/ch/en/terms-conditions/privacy-statement',
        imprint: 'https://www.swiss.com/ch/en/terms-conditions/imprint',
      },
      de: {
        privacy: 'https://www.swiss.com/ch/de/terms-conditions/privacy-statement',
        imprint: 'https://www.swiss.com/ch/de/terms-conditions/imprint',
      },
    },
  },
  // Lufthansa Cargo (lh-cargo): Lufthansa's look; www.lufthansa-cargo.com shows no cookie banner;
  // its notifications (www's own CMS, switched off) move to the site's Message Center, tenant cargo
  cargo: {
    name: 'Lufthansa Cargo',
    theme: false,
    www: 'www.lufthansa-cargo.com',
    messageCenter: 'cargo',
    // notifications: the header's bell tool opens www's notification panel (the nav's :bell: tool,
    // blocks/header/header-notifications.js; other brands keep it a link), its overview page
    // per language (blocks/notifications)
    notifications: { page: '/{ll}/notification-overview' },
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
    // its service notices (www's navbar alert, its own CMS, switched off) move to the site's
    // Message Center, tenant airdolomiti
    messageCenter: 'airdolomiti',
    airline: 'EN',
    // accessibility: www's header settings "Configura accessibilità" (text size, contrast;
    // scripts/accessibility.js), the visitor's choice kept in their browser
    accessibility: true,
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
    // articles-airdolomiti-it, -en, -de) the posts list (blog-overview) reads instead of lh-com's
    articleIndex: {
      it: '/articoli/query-index.json',
      en: '/en/articles/query-index.json',
      de: '/de/artikel/query-index.json',
    },
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
  // TAP Air Portugal (lh-tap, brief 312): its own theme (styles/themes/tap.css; until it exists
  // the pages keep Lufthansa's look), its <ll>-<cc> roots: scripts/site-languages.js. Booking,
  // check-in, manage booking, account and sign-in, search, forms, live fares and chat stay links
  // to www.flytap.com: no Lufthansa booking hand-off (TAP's own: the booking-box block), Travel
  // ID, embeds or portal (the widgets that hand off to Lufthansa's shop or sign in with
  // Lufthansa's Travel ID don't belong on its pages). No consent manager: www.flytap.com's
  // pages load none of their own, only Google Tag Manager (GTM-5H44JL7M; the TAP capture,
  // tap-snapshots-001), which the replica doesn't run. Its Message Center tenant tap (lh-tap's
  // own /message-center/ documents, kept in step with www.flytap.com's alerts, in TAP's order:
  // their weight) shows as www's alerts bar at the top of the root homepages (alertsBar: the
  // flash-teaser variant scripts/alerts-bar.js places there; tools/reports/tap/alerts-spec.md)
  tap: {
    name: 'TAP Air Portugal',
    www: 'www.flytap.com',
    messageCenter: 'tap',
    alertsBar: 'tap',
    // the showcase notice in the page's language (scripts/showcase-notice.js NOTICE_TEXTS)
    showcaseNotice: 'page',
    // www.flytap.com's header (brief 311): the top-level menu in the bar, the language list as its
    // market button, TAP's layout (blocks/header/header-tap.js: Check-in in the menu, search and
    // account linked to www, the bar inside the homepage's stage)
    header: { menu: 'bar', languages: 'bar', layout: 'tap' },
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

// SWISS's market roots in the languages lh-swiss has (en, de, fr, it; the capture of 2026-11-02,
// swiss-snapshots-031 and -032: 51 countries each, the roots ch/<ll>'s documents name in their
// markets): answered from ch/<ll>'s documents (lh-edge's market route), each with its own homepage,
// nav and footer (tools/importer/swiss-market-import.mjs). Per root www's selector label (as www
// writes it) and its homepage's flight search default origin (none: the hub).
const SWISS_MARKETS = {
  'ae/en': ['United Arab Emirates | English', 'DXB'],
  'al/en': ['Albania | English', 'TIA'],
  'ar/en': ['Argentina | English', 'BUE'],
  'at/en': ['Österreich | English', 'VIE'],
  'au/en': ['Australia | English', 'SYD'],
  'be/en': ['Belgio | English', 'BRU'],
  'bg/en': ['Bulgarien | English', 'SOF'],
  'br/en': ['Brasilien | English', 'SAO'],
  'ca/en': ['Kanada | English'],
  'cn/en': ['China (Festland) | English', 'BJS'],
  'cz/en': ['Tschechische Republik | English', 'PRG'],
  'de/en': ['Allemagne | English', 'FRA'],
  'dk/en': ['Denmark | English', 'CPH'],
  'ee/en': ['Estonia | English', 'TLL'],
  'eg/en': ['Egypt | English', 'CAI'],
  'es/en': ['Spain | English', 'MAD'],
  'fr/en': ['Frankreich | English', 'PAR'],
  'gb/en': ['Vereinigtes Königreich | English', 'LON'],
  'ge/en': ['Georgien | English', 'TBS'],
  'gr/en': ['Greece | English', 'ATH'],
  'hk/en': ['Hong Kong, China | English', 'HKG'],
  'hr/en': ['Kroatien | English', 'ZAG'],
  'hu/en': ['Ungarn | English', 'BUD'],
  'ie/en': ['Irland | English', 'DUB'],
  'il/en': ['Israel | English', 'TLV'],
  'in/en': ['Indien | English', 'DEL'],
  'it/en': ['Italien | English', 'MIL'],
  'jp/en': ['Japan | English', 'TYO'],
  'ke/en': ['Kenia | English', 'NBO'],
  'kr/en': ['Korea, Republik | English', 'SEL'],
  'lt/en': ['Lithuania | English', 'VNO'],
  'lu/en': ['Luxemburg | English', 'LUX'],
  'mk/en': ['North Macedonia | English', 'SKP'],
  'mt/en': ['Malta | English', 'MLA'],
  'nl/en': ['Paesi Bassi | English', 'AMS'],
  'no/en': ['Norway | English', 'OSL'],
  'om/en': ['Oman | English', 'MCT'],
  'pl/en': ['Polen | English', 'WAW'],
  'pt/en': ['Portugal | English', 'LIS'],
  'ro/en': ['Rumänien | English', 'BUH'],
  'rs/en': ['Serbien | English', 'BEG'],
  'ru/en': ['Russian Federation | English', 'ZRH'],
  'se/en': ['Schweden | English', 'STO'],
  'sg/en': ['Singapore | English', 'SIN'],
  'si/en': ['Slowenien | English', 'LJU'],
  'th/en': ['Thailand | English', 'BKK'],
  'tz/en': ['Tanzania | English', 'JRO'],
  'ua/en': ['Ukraine | English', 'ZRH'],
  'us/en': ['USA | English', 'WAS'],
  'xk/en': ['Kosovo | English', 'PRN'],
  'za/en': ['Südafrika | English', 'CPT'],
  'ae/de': ['Verein. Arab. Emirate | Deutsch', 'DXB'],
  'al/de': ['Albanien | Deutsch', 'TIA'],
  'ar/de': ['Argentinien | Deutsch', 'BUE'],
  'at/de': ['Österreich | Deutsch', 'VIE'],
  'au/de': ['Australien | Deutsch', 'SYD'],
  'be/de': ['Belgio | Deutsch', 'BRU'],
  'bg/de': ['Bulgarien | Deutsch', 'SOF'],
  'br/de': ['Brasilien | Deutsch', 'SAO'],
  'ca/de': ['Kanada | Deutsch'],
  'cn/de': ['China (Festland) | Deutsch', 'BJS'],
  'cz/de': ['Tschechische Republik | Deutsch', 'PRG'],
  'de/de': ['Allemagne | Deutsch', 'FRA'],
  'dk/de': ['Dänemark | Deutsch', 'CPH'],
  'ee/de': ['Estonia | Deutsch', 'TLL'],
  'eg/de': ['Ägypten | Deutsch', 'CAI'],
  'es/de': ['Spagna | Deutsch', 'MAD'],
  'fr/de': ['Frankreich | Deutsch', 'PAR'],
  'gb/de': ['Vereinigtes Königreich | Deutsch', 'LON'],
  'ge/de': ['Georgien | Deutsch', 'TBS'],
  'gr/de': ['Griechenland | Deutsch', 'ATH'],
  'hk/de': ['Hong Kong, China | Deutsch', 'HKG'],
  'hr/de': ['Kroatien | Deutsch', 'ZAG'],
  'hu/de': ['Ungarn | Deutsch', 'BUD'],
  'ie/de': ['Irland | Deutsch', 'DUB'],
  'il/de': ['Israel | Deutsch', 'TLV'],
  'in/de': ['Indien | Deutsch', 'DEL'],
  'it/de': ['Italien | Deutsch', 'MIL'],
  'jp/de': ['Japan | Deutsch', 'TYO'],
  'ke/de': ['Kenia | Deutsch', 'NBO'],
  'kr/de': ['Korea, Republik | Deutsch', 'SEL'],
  'lt/de': ['Litauen | Deutsch', 'VNO'],
  'lu/de': ['Luxemburg | Deutsch', 'LUX'],
  'mk/de': ['Nordmazedonien | Deutsch', 'SKP'],
  'mt/de': ['Malta | Deutsch', 'MLA'],
  'nl/de': ['Paesi Bassi | Deutsch', 'AMS'],
  'no/de': ['Norwegen | Deutsch', 'OSL'],
  'om/de': ['Oman | Deutsch', 'MCT'],
  'pl/de': ['Polen | Deutsch', 'WAW'],
  'pt/de': ['Portugal | Deutsch', 'LIS'],
  'ro/de': ['Rumänien | Deutsch', 'BUH'],
  'rs/de': ['Serbien | Deutsch', 'BEG'],
  'ru/de': ['Russische Föderation | Deutsch', 'ZRH'],
  'se/de': ['Schweden | Deutsch', 'STO'],
  'sg/de': ['Singapur | Deutsch', 'SIN'],
  'si/de': ['Slowenien | Deutsch', 'LJU'],
  'th/de': ['Thailand | Deutsch', 'BKK'],
  'tz/de': ['Tansania | Deutsch', 'JRO'],
  'ua/de': ['Ukraine | Deutsch', 'ZRH'],
  'us/de': ['USA | Deutsch', 'NYC'],
  'xk/de': ['Kosovo | Deutsch', 'PRN'],
  'za/de': ['Südafrika | Deutsch', 'CPT'],
  'ae/fr': ['United Arab Emirates | Français', 'DXB'],
  'al/fr': ['Albania | Français', 'TIA'],
  'ar/fr': ['Argentine | Français', 'BUE'],
  'at/fr': ['Österreich | Français', 'VIE'],
  'au/fr': ['Australia | Français', 'SYD'],
  'be/fr': ['Belgique | Français', 'BRU'],
  'bg/fr': ['Bulgarie | Français', 'SOF'],
  'br/fr': ['Brésil | Français', 'SAO'],
  'ca/fr': ['Kanada | Français'],
  'cn/fr': ['Chine (Continentale) | Français', 'BJS'],
  'cz/fr': ['République Tchéque | Français', 'PRG'],
  'de/fr': ['Allemagne | Français', 'FRA'],
  'dk/fr': ['Danemark | Français', 'CPH'],
  'ee/fr': ['Estonia | Français', 'TLL'],
  'eg/fr': ['Egypt | Français', 'CAI'],
  'es/fr': ['Espagne | Français', 'MAD'],
  'fr/fr': ['France | Français', 'PAR'],
  'gb/fr': ['Royaume Uni | Français', 'LON'],
  'ge/fr': ['Géorgie | Français', 'TBS'],
  'gr/fr': ['Grèce | Français', 'ATH'],
  'hk/fr': ['Hong-Kong, Chine | Français', 'HKG'],
  'hr/fr': ['Croatie | Français', 'ZAG'],
  'hu/fr': ['Hongrie | Français', 'BUD'],
  'ie/fr': ['Irlande | Français', 'DUB'],
  'il/fr': ['Israël | Français', 'TLV'],
  'in/fr': ['Inde | Français', 'DEL'],
  'it/fr': ['Italien | Français', 'MIL'],
  'jp/fr': ['Japon | Français', 'TYO'],
  'ke/fr': ['Kenya | Français', 'NBO'],
  'kr/fr': ['République de Corée | Français', 'SEL'],
  'lt/fr': ['Lithuanie | Français', 'VNO'],
  'lu/fr': ['Luxemburg | Français', 'LUX'],
  'mk/fr': ['Macédoine du Nord | Français', 'SKP'],
  'mt/fr': ['Malte | Français', 'MLA'],
  'nl/fr': ['Pays-Bas | Français', 'AMS'],
  'no/fr': ['Norway | Français', 'OSL'],
  'om/fr': ['Oman | Français', 'MCT'],
  'pl/fr': ['Pologne | Français', 'WAW'],
  'pt/fr': ['Portugal | Français', 'LIS'],
  'ro/fr': ['Roumanie | Français', 'BUH'],
  'rs/fr': ['Serbia | Français', 'BEG'],
  'ru/fr': ['Russie | Français', 'ZRH'],
  'se/fr': ['Suède | Français', 'STO'],
  'sg/fr': ['Singapour | Français', 'SIN'],
  'si/fr': ['Slovénie | Français', 'LJU'],
  'th/fr': ['Thaïlande | Français', 'BKK'],
  'tz/fr': ['Tanzanie | Français', 'JRO'],
  'ua/fr': ['Ukraine | Français', 'ZRH'],
  'us/fr': ['Etats-Unis d\'Amérique | Français', 'NYC'],
  'xk/fr': ['Kosovo | Français', 'PRN'],
  'za/fr': ['Afrique du Sud | Français', 'CPT'],
  'ae/it': ['Emirati Arabi Uniti | Italiano', 'DXB'],
  'al/it': ['Albania | Italiano', 'TIA'],
  'ar/it': ['Argentine | Italiano', 'BUE'],
  'at/it': ['Austria | Italiano', 'VIE'],
  'au/it': ['Australia | Italiano', 'SYD'],
  'be/it': ['Belgique | Italiano', 'BRU'],
  'bg/it': ['Bulgaria | Italiano', 'SOF'],
  'br/it': ['Brasile | Italiano', 'SAO'],
  'ca/it': ['Canada | Italiano'],
  'cn/it': ['Cina (Continentale) | Italiano', 'BJS'],
  'cz/it': ['République Tchéque | Italiano', 'PRG'],
  'de/it': ['Allemagne | Italiano', 'FRA'],
  'dk/it': ['Danimarca | Italiano', 'CPH'],
  'ee/it': ['Estonia | Italiano', 'TLL'],
  'eg/it': ['Egitto | Italiano', 'CAI'],
  'es/it': ['Espagne | Italiano', 'MAD'],
  'fr/it': ['France | Italiano', 'PAR'],
  'gb/it': ['Gran Bretagna | Italiano', 'LON'],
  'ge/it': ['Georgia | Italiano', 'TBS'],
  'gr/it': ['Grecia | Italiano', 'ATH'],
  'hk/it': ['Hong Kong, Cina | Italiano', 'HKG'],
  'hr/it': ['Croatie | Italiano', 'ZAG'],
  'hu/it': ['Ungheria | Italiano', 'BUD'],
  'ie/it': ['Irlanda | Italiano', 'DUB'],
  'il/it': ['Israël | Italiano', 'TLV'],
  'in/it': ['India | Italiano', 'DEL'],
  'it/it': ['Italien | Italiano', 'MIL'],
  'jp/it': ['Giappone | Italiano', 'TYO'],
  'ke/it': ['Kenya | Italiano', 'NBO'],
  'kr/it': ['République de Corée | Italiano', 'SEL'],
  'lt/it': ['Lituania | Italiano', 'VNO'],
  'lu/it': ['Lussemburgo | Italiano', 'LUX'],
  'mk/it': ['Macedonia del Nord | Italiano', 'SKP'],
  'mt/it': ['Malta | Italiano', 'MLA'],
  'nl/it': ['Paesi Bassi | Italiano', 'AMS'],
  'no/it': ['Norvegia | Italiano', 'OSL'],
  'om/it': ['Oman | Italiano', 'MCT'],
  'pl/it': ['Polonia | Italiano', 'WAW'],
  'pt/it': ['Portogallo | Italiano', 'LIS'],
  'ro/it': ['Roumanie | Italiano', 'BUH'],
  'rs/it': ['Serbia | Italiano', 'BEG'],
  'ru/it': ['Federazione Russa | Italiano', 'ZRH'],
  'se/it': ['Svezia | Italiano', 'STO'],
  'sg/it': ['Singapore | Italiano', 'SIN'],
  'si/it': ['Slovenia | Italiano', 'LJU'],
  'th/it': ['Thailandia | Italiano', 'BKK'],
  'tz/it': ['Tanzania | Italiano', 'JRO'],
  'ua/it': ['Ucraina | Italiano', 'ZRH'],
  'us/it': ['USA | Italiano', 'NYC'],
  'xk/it': ['Kosovo | Italiano', 'PRN'],
  'za/it': ['Sud Africa | Italiano', 'CPT'],
  // es and pt (the capture's held roots, imported 2026-11-03): in SWISS_MARKET_LANGUAGES_LIVE
  'ar/es': ['Argentina | Español', 'BUE'],
  'br/es': ['Brasil | Español', 'SAO'],
  'es/es': ['Spain | Español', 'MAD'],
  'us/es': ['Estados Unidos de América | Español', 'NYC'],
  'br/pt': ['Brasile | Português', 'SAO'],
  'pt/pt': ['Portugal | Português', 'LIS'],
  // zh and ja (the held roots, imported 2026-11-03): in SWISS_MARKET_LANGUAGES_LIVE
  'cn/zh': ['Cina (Continentale) | 简体中文', 'BJS'],
  'hk/zh': ['Hong Kong, Cina | 简体中文', 'HKG'],
  'sg/zh': ['新加坡 (Singapore) | 简体中文', 'SIN'],
  'jp/ja': ['Giappone | 日本語', 'TYO'],
  // el and ru (the capture's only roots in those languages, imported 2026-11-03): behind
  // SWISS_MARKET_LANGUAGES_LIVE and their language versions' switch (SWISS_LANGUAGES_LIVE)
  'gr/el': ['Griechenland | Ελληνικά', 'ATH'],
  'ru/ru': ['Federazione Russa | Русский', 'ZRH'],
};

// The switch (as lh-com's liveWaves): off, SWISS's rows are ch's alone, swiss.turnsthe.page answers
// as before and the country dialog sends the other countries to www.swiss.com; on (once their
// documents are published), the roots of SWISS_MARKETS whose language lh-swiss has join the table:
// the dialog lists them and lh-edge serves their pages.
export const SWISS_MARKETS_LIVE = true;
// the languages whose market roots join (lh-swiss has the language and the roots' documents are
// published): es and pt's roots of SWISS_MARKETS since their documents are live (2026-11-03), zh
// and ja's (cn/zh, hk/zh, sg/zh, jp/ja) since theirs are (2026-11-03)
export const SWISS_MARKET_LANGUAGES_LIVE = ['en', 'de', 'fr', 'it', 'es', 'pt', 'zh', 'ja', 'el', 'ru'];

/** SWISS's site entry with its market roots when the switch is on (roots of its languages only). */
export function withSwissMarkets(
  site,
  live = SWISS_MARKETS_LIVE,
  languages = SWISS_MARKET_LANGUAGES_LIVE,
) {
  if (!live) return site;
  const has = (root) => Object.prototype.hasOwnProperty.call(site.versions, root.split('/')[1])
    && languages.includes(root.split('/')[1]);
  const roots = Object.entries(SWISS_MARKETS).filter(([root]) => has(root));
  const rows = Object.fromEntries(roots.map(([root, [label]]) => {
    const [cc, ll] = root.split('/');
    return [root, row(cc, ll, `${ll}-${cc.toUpperCase()}`, 'language', label)];
  }));
  return {
    ...site,
    rows: { ...site.rows, ...rows },
    names: { ...site.names, ...Object.fromEntries(roots.map(([root, [label]]) => [root, label])) },
    airports: {
      ...site.airports,
      ...Object.fromEntries(roots.filter(([, [, a]]) => a).map(([root, [, a]]) => [root, a])),
    },
  };
}

// SWISS's languages still to publish, behind their switch (as lh-com's liveWaves, brief 279): a
// language not in SWISS_LANGUAGES_LIVE is a pilot: its root's pages render with their own row
// (scripts/locale.js), while the rows and versions, the country dialog, the links to its homepage
// and lh-edge's entries and routes stay as before (swiss.turnsthe.page answers as before); once
// its documents are published, its code in SWISS_LANGUAGES_LIVE makes it a root as ch/fr and ch/it.
// name: the homepage's footer line; airport: its flight search's origin (swiss-snapshots-011, -016;
// zh and ja: -014, -021)
export const SWISS_LANGUAGES = {
  es: { root: 'ch/es', name: 'Suiza | Español', airport: 'ZRH' },
  pt: { root: 'ch/pt', name: 'Suiça | Português', airport: 'ZRH' },
  zh: { root: 'ch/zh', name: '瑞士 (Switzerland) | 简体中文', airport: 'ZRH' },
  ja: { root: 'ch/ja', name: 'Switzerland | 日本語', airport: 'ZRH' },
  // el and ru: swiss-snapshots-018, -023
  el: { root: 'ch/el', name: 'Ελβετία | Ελληνικά', airport: 'ZRH' },
  ru: { root: 'ch/ru', name: 'Switzerland | Русский', airport: 'ZRH' },
};
export const SWISS_LANGUAGES_LIVE = ['es', 'pt', 'zh', 'ja', 'el', 'ru'];

/** SWISS's site entry with the languages switched on as roots, the others as its pilots. */
export function withSwissLanguages(site, live = SWISS_LANGUAGES_LIVE) {
  const on = Object.keys(SWISS_LANGUAGES).filter((ll) => live.includes(ll));
  const off = Object.keys(SWISS_LANGUAGES).filter((ll) => !live.includes(ll));
  const roots = (lls) => lls.map((ll) => SWISS_LANGUAGES[ll].root);
  const by = (lls, field) => Object.fromEntries(lls
    .map((ll) => [SWISS_LANGUAGES[ll].root, SWISS_LANGUAGES[ll][field]]));
  const pilots = rowsOf('own', roots(off));
  Object.values(pilots).forEach((r) => { r.status = 'pilot'; });
  return {
    ...site,
    rows: { ...site.rows, ...rowsOf('own', roots(on)) },
    versions: {
      ...site.versions, ...Object.fromEntries(on.map((ll) => [ll, SWISS_LANGUAGES[ll].root])),
    },
    names: { ...site.names, ...by(on, 'name') },
    airports: { ...site.airports, ...by(on, 'airport') },
    pilots: { rows: pilots, names: by(off, 'name'), airports: by(off, 'airport') },
  };
}

// SWISS's country roots whose pages are all their own documents in a language lh-swiss has no
// version of (kr/ko: www's only Korean root; the capture's swiss-snapshots-028 and -029), behind
// their switch as the languages: off, a pilot (its pages render with their own row; the rows, the
// country dialog and lh-edge as before); its key in SWISS_OWN_ROOTS_LIVE (once its documents are
// published) makes it a root with its own documents. name: www's selector label; airport: its
// homepage's flight search origin. kr/ko on since its documents are live (2026-11-03).
export const SWISS_OWN_ROOTS = {
  'kr/ko': { name: '대한민국 | 한국어', airport: 'SEL' },
};
export const SWISS_OWN_ROOTS_LIVE = ['kr/ko'];

/** SWISS's site entry with the own roots switched on as roots, the others among its pilots. */
export function withSwissOwnRoots(site, live = SWISS_OWN_ROOTS_LIVE) {
  const on = Object.keys(SWISS_OWN_ROOTS).filter((r) => live.includes(r));
  const off = Object.keys(SWISS_OWN_ROOTS).filter((r) => !live.includes(r));
  const by = (roots, field) => Object.fromEntries(roots.map((r) => [r, SWISS_OWN_ROOTS[r][field]]));
  const pilots = rowsOf('own', off);
  Object.values(pilots).forEach((r) => { r.status = 'pilot'; });
  const had = site.pilots || { rows: {}, names: {}, airports: {} };
  const without = (o) => Object.fromEntries(Object.entries(o || {})
    .filter(([r]) => !on.includes(r)));
  return {
    ...site,
    rows: { ...site.rows, ...rowsOf('own', on) },
    names: { ...site.names, ...by(on, 'name') },
    airports: { ...site.airports, ...by(on, 'airport') },
    pilots: {
      rows: { ...without(had.rows), ...pilots },
      names: { ...without(had.names), ...by(off, 'name') },
      airports: { ...without(had.airports), ...by(off, 'airport') },
    },
  };
}

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
 * roots redirect to be on www and are none; names: www's country and language selector (the be/en,
 * be/fr and be/nl homepages, 2026-11-01: be/nl's "Belgium | Nederlands"; the other nl, de, it and
 * es roots' the country in the language until their homepages are captured); no airports listed:
 * the hub BRU (tools/reports/lh-brussels.md).
 * Lufthansa Group for Business (DA moved-permanently/lh-b2b, business.lufthansagroup.com): de/en
 * and de/de hold the language documents (tools/importer/b2b-scope.mjs), the 185 market roots get
 * them where the document's `markets` row lists the root (a path where xx differs from de: xx's
 * rest-of-world document) and hold their own pages (ch/en, at/de) and homepages (us/en, ca/en);
 * www's us/de, ca/de and mx/de answer 500 and are none; names: www's country and language dialog
 * (the de/en and de/de homepages, 2026-11-01); no airports (tools/reports/lh-b2b.md).
 * SWISS (DA moved-permanently/lh-swiss, www.swiss.com): the pilot's two reference roots ch/en and
 * ch/de (tools/importer/swiss-scope.mjs LANGUAGE_VERSIONS) hold their own documents; the other
 * roots are not migrated yet, so the dialog's other countries go to www.swiss.com
 * (getHomepageUrl); names: the homepages' country and language line (2026-11-02, ch/de's
 * "Switzerland | Deutsch"); airports: the hub ZRH (tools/reports/lh-swiss.md).
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
      'be/nl': 'Belgium | Nederlands',
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
  b2b: {
    rows: {
      ...rowsOf('own', ['de/en', 'de/de']),
      ...rowsOf('language', [
        'ae/en', 'al/en', 'am/en', 'ao/en', 'ar/en', 'at/en', 'au/en', 'az/en', 'be/en', 'bf/en',
        'bg/en', 'bh/en', 'bi/en', 'bj/en', 'br/en', 'by/en', 'ca/en', 'cg/en', 'ch/en', 'ci/en',
        'cm/en', 'cn/en', 'co/en', 'cy/en', 'cz/en', 'dk/en', 'dz/en', 'ee/en', 'eg/en', 'es/en',
        'et/en', 'fi/en', 'fr/en', 'gb/en', 'ge/en', 'gh/en', 'gm/en', 'gn/en', 'gr/en', 'hk/en',
        'hr/en', 'hu/en', 'id/en', 'ie/en', 'il/en', 'in/en', 'iq/en', 'ir/en', 'it/en', 'jo/en',
        'jp/en', 'ke/en', 'kr/en', 'kw/en', 'kz/en', 'lb/en', 'lt/en', 'lu/en', 'lv/en', 'ma/en',
        'md/en', 'mk/en', 'mx/en', 'my/en', 'ng/en', 'nl/en', 'no/en', 'nz/en', 'om/en', 'ph/en',
        'pl/en', 'pt/en', 'py/en', 'ro/en', 'rs/en', 'ru/en', 'rw/en', 'sa/en', 'se/en', 'sg/en',
        'sl/en', 'sn/en', 'tg/en', 'th/en', 'tm/en', 'tn/en', 'tr/en', 'tw/en', 'tz/en', 'ua/en',
        'us/en', 'vn/en', 'xx/en', 'za/en', 'ae/de', 'al/de', 'am/de', 'ao/de', 'ar/de', 'at/de',
        'au/de', 'az/de', 'be/de', 'bf/de', 'bg/de', 'bh/de', 'bi/de', 'bj/de', 'br/de', 'by/de',
        'cg/de', 'ch/de', 'ci/de', 'cm/de', 'cn/de', 'co/de', 'cy/de', 'cz/de', 'dk/de', 'dz/de',
        'ee/de', 'eg/de', 'es/de', 'et/de', 'fi/de', 'fr/de', 'gb/de', 'ge/de', 'gh/de', 'gm/de',
        'gn/de', 'gr/de', 'hk/de', 'hr/de', 'hu/de', 'id/de', 'ie/de', 'il/de', 'in/de', 'iq/de',
        'ir/de', 'it/de', 'jo/de', 'jp/de', 'ke/de', 'kr/de', 'kw/de', 'kz/de', 'lb/de', 'lt/de',
        'lu/de', 'lv/de', 'ma/de', 'md/de', 'mk/de', 'my/de', 'ng/de', 'nl/de', 'no/de', 'nz/de',
        'om/de', 'ph/de', 'pl/de', 'pt/de', 'py/de', 'ro/de', 'rs/de', 'ru/de', 'rw/de', 'sa/de',
        'se/de', 'sg/de', 'sl/de', 'sn/de', 'tg/de', 'th/de', 'tm/de', 'tn/de', 'tr/de', 'tw/de',
        'tz/de', 'ua/de', 'vn/de', 'xx/de', 'za/de',
      ]),
    },
    versions: { en: 'de/en', de: 'de/de' },
    // the rest-of-world documents (lh-edge's market route): a root the language version's row
    // leaves out (de's documents for de only) is answered from xx/<ll>'s document of the path
    restOfWorld: { en: 'xx/en', de: 'xx/de' },
    names: {
      'ae/de': 'Verein. Arab. Emirate | Deutsch',
      'ae/en': 'United Arab Emirates | English',
      'al/de': 'Albanien | Deutsch',
      'al/en': 'Albania | English',
      'am/de': 'Armenien | Deutsch',
      'am/en': 'Armenia | English',
      'ao/de': 'Angola | Deutsch',
      'ao/en': 'Angola | English',
      'ar/de': 'Argentinien | Deutsch',
      'ar/en': 'Argentina | English',
      'at/de': 'Österreich | Deutsch',
      'at/en': 'Austria | English',
      'au/de': 'Australien | Deutsch',
      'au/en': 'Australia | English',
      'az/de': 'Aserbaidschan | Deutsch',
      'az/en': 'Azerbaijan | English',
      'be/de': 'Belgien | Deutsch',
      'be/en': 'Belgium | English',
      'bf/de': 'Burkina-Faso | Deutsch',
      'bf/en': 'Burkina Faso | English',
      'bg/de': 'Bulgarien | Deutsch',
      'bg/en': 'Bulgaria | English',
      'bh/de': 'Bahrain | Deutsch',
      'bh/en': 'Bahrain | English',
      'bi/de': 'Burundi | Deutsch',
      'bi/en': 'Burundi | English',
      'bj/de': 'Benin | Deutsch',
      'bj/en': 'Benin | English',
      'br/de': 'Brasilien | Deutsch',
      'br/en': 'Brazil | English',
      'by/de': 'Belarus | Deutsch',
      'by/en': 'Belarus | English',
      'ca/en': 'Canada | English',
      'cg/de': 'Kongo | Deutsch',
      'cg/en': 'Congo | English',
      'ch/de': 'Schweiz | Deutsch',
      'ch/en': 'Switzerland | English',
      'ci/de': 'Cote d\'Ivoire | Deutsch',
      'ci/en': 'Cote d\'Ivoire | English',
      'cm/de': 'Kamerun | Deutsch',
      'cm/en': 'Cameroon | English',
      'cn/de': 'China (Festland) | Deutsch',
      'cn/en': 'China (Mainland) | English',
      'co/de': 'Kolumbien | Deutsch',
      'co/en': 'Colombia | English',
      'cy/de': 'Zypern | Deutsch',
      'cy/en': 'Cyprus | English',
      'cz/de': 'Tschechische Republik | Deutsch',
      'cz/en': 'Czech Republic | English',
      'de/de': 'Deutschland | Deutsch',
      'de/en': 'Germany | English',
      'dk/de': 'Dänemark | Deutsch',
      'dk/en': 'Denmark | English',
      'dz/de': 'Algerien | Deutsch',
      'dz/en': 'Algeria | English',
      'ee/de': 'Estland | Deutsch',
      'ee/en': 'Estonia | English',
      'eg/de': 'Ägypten | Deutsch',
      'eg/en': 'Egypt | English',
      'es/de': 'Spanien | Deutsch',
      'es/en': 'Spain | English',
      'et/de': 'Äthiopien | Deutsch',
      'et/en': 'Ethiopia | English',
      'fi/de': 'Finnland | Deutsch',
      'fi/en': 'Finland | English',
      'fr/de': 'Frankreich | Deutsch',
      'fr/en': 'France | English',
      'gb/de': 'Vereinigtes Königreich | Deutsch',
      'gb/en': 'United Kingdom | English',
      'ge/de': 'Georgien | Deutsch',
      'ge/en': 'Georgia | English',
      'gh/de': 'Ghana | Deutsch',
      'gh/en': 'Ghana | English',
      'gm/de': 'Gambia | Deutsch',
      'gm/en': 'Gambia | English',
      'gn/de': 'Guinea | Deutsch',
      'gn/en': 'Guinea | English',
      'gr/de': 'Griechenland | Deutsch',
      'gr/en': 'Greece | English',
      'hk/de': 'Hong Kong, China | Deutsch',
      'hk/en': 'Hong Kong, China | English',
      'hr/de': 'Kroatien | Deutsch',
      'hr/en': 'Croatia | English',
      'hu/de': 'Ungarn | Deutsch',
      'hu/en': 'Hungary | English',
      'id/de': 'Indonesien | Deutsch',
      'id/en': 'Indonesia | English',
      'ie/de': 'Irland | Deutsch',
      'ie/en': 'Ireland | English',
      'il/de': 'Israel | Deutsch',
      'il/en': 'Israel | English',
      'in/de': 'Indien | Deutsch',
      'in/en': 'India | English',
      'iq/de': 'Irak | Deutsch',
      'iq/en': 'Iraq | English',
      'ir/de': 'Iran | Deutsch',
      'ir/en': 'Iran | English',
      'it/de': 'Italien | Deutsch',
      'it/en': 'Italy | English',
      'jo/de': 'Jordanien | Deutsch',
      'jo/en': 'Jordan | English',
      'jp/de': 'Japan | Deutsch',
      'jp/en': 'Japan | English',
      'ke/de': 'Kenia | Deutsch',
      'ke/en': 'Kenya | English',
      'kr/de': 'Korea, Republik | Deutsch',
      'kr/en': 'Korea, Republic of | English',
      'kw/de': 'Kuwait | Deutsch',
      'kw/en': 'Kuwait | English',
      'kz/de': 'Kasachstan | Deutsch',
      'kz/en': 'Kazakhstan | English',
      'lb/de': 'Libanon | Deutsch',
      'lb/en': 'Lebanon | English',
      'lt/de': 'Litauen | Deutsch',
      'lt/en': 'Lithuania | English',
      'lu/de': 'Luxemburg | Deutsch',
      'lu/en': 'Luxembourg | English',
      'lv/de': 'Lettland | Deutsch',
      'lv/en': 'Latvia | English',
      'ma/de': 'Marokko | Deutsch',
      'ma/en': 'Morocco | English',
      'md/de': 'Moldawien | Deutsch',
      'md/en': 'Moldova | English',
      'mk/de': 'Nordmazedonien | Deutsch',
      'mk/en': 'North Macedonia | English',
      'mx/en': 'Mexico | English',
      'my/de': 'Malaysia | Deutsch',
      'my/en': 'Malaysia | English',
      'ng/de': 'Nigeria | Deutsch',
      'ng/en': 'Nigeria | English',
      'nl/de': 'Niederlande | Deutsch',
      'nl/en': 'Netherlands | English',
      'no/de': 'Norwegen | Deutsch',
      'no/en': 'Norway | English',
      'nz/de': 'Neuseeland | Deutsch',
      'nz/en': 'New Zealand | English',
      'om/de': 'Oman | Deutsch',
      'om/en': 'Oman | English',
      'ph/de': 'Philippinen | Deutsch',
      'ph/en': 'Philippines | English',
      'pl/de': 'Polen | Deutsch',
      'pl/en': 'Poland | English',
      'pt/de': 'Portugal | Deutsch',
      'pt/en': 'Portugal | English',
      'py/de': 'Paraguay | Deutsch',
      'py/en': 'Paraguay | English',
      'ro/de': 'Rumänien | Deutsch',
      'ro/en': 'Romania | English',
      'rs/de': 'Serbien | Deutsch',
      'rs/en': 'Serbia | English',
      'ru/de': 'Russische Föderation | Deutsch',
      'ru/en': 'Russian Federation | English',
      'rw/de': 'Ruanda | Deutsch',
      'rw/en': 'Rwanda | English',
      'sa/de': 'Saudi-Arabien | Deutsch',
      'sa/en': 'Saudi Arabia | English',
      'se/de': 'Schweden | Deutsch',
      'se/en': 'Sweden | English',
      'sg/de': 'Singapur | Deutsch',
      'sg/en': 'Singapore | English',
      'sl/de': 'Sierra Leone | Deutsch',
      'sl/en': 'Sierra Leone | English',
      'sn/de': 'Senegal | Deutsch',
      'sn/en': 'Senegal | English',
      'tg/de': 'Togo | Deutsch',
      'tg/en': 'Togo | English',
      'th/de': 'Thailand | Deutsch',
      'th/en': 'Thailand | English',
      'tm/de': 'Turkmenistan | Deutsch',
      'tm/en': 'Turkmenistan | English',
      'tn/de': 'Tunesien | Deutsch',
      'tn/en': 'Tunisia | English',
      'tr/de': 'Türkei | Deutsch',
      'tr/en': 'Turkey | English',
      'tw/de': 'Taiwan, China | Deutsch',
      'tw/en': 'Taiwan, China | English',
      'tz/de': 'Tansania | Deutsch',
      'tz/en': 'Tanzania | English',
      'ua/de': 'Ukraine | Deutsch',
      'ua/en': 'Ukraine | English',
      'us/en': 'USA | English',
      'vn/de': 'Vietnam | Deutsch',
      'vn/en': 'Vietnam | English',
      'xx/de': 'Andere Länder | Deutsch',
      'xx/en': 'Other countries | English',
      'za/de': 'Südafrika | Deutsch',
      'za/en': 'South Africa | English',
    },
    airports: {},
  },
  swiss: withSwissOwnRoots(withSwissMarkets(withSwissLanguages({
    // the pilot's ch/en and ch/de; ch/fr and ch/it (brief 272); ch/es and ch/pt behind their
    // switch (SWISS_LANGUAGES); names: the homepages' line (ch/de's says Switzerland, ch/it's
    // Suisse); airports: the homepages' flight search origin
    rows: rowsOf('own', ['ch/en', 'ch/de', 'ch/fr', 'ch/it']),
    versions: {
      en: 'ch/en', de: 'ch/de', fr: 'ch/fr', it: 'ch/it',
    },
    names: {
      'ch/en': 'Switzerland | English', 'ch/de': 'Switzerland | Deutsch', 'ch/fr': 'Suisse | Français', 'ch/it': 'Suisse | Italiano',
    },
    airports: {
      'ch/en': 'ZRH', 'ch/de': 'ZRH', 'ch/fr': 'GVA', 'ch/it': 'ZRH',
    },
  }))),
};
