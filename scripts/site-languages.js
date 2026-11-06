/**
 * Brand sites without <cc>/<ll> roots (metadata brand: cargo, airdolomiti, tap): their languages,
 * each with its path prefix, its homepage and its own name. A site with <ll>-<cc> roots
 * (www.flytap.com's /pt-pt/, /en-pt/): each root also names its country, and the page's root (its
 * path) sets the language, country, hreflang and base (nav, footer) of its locale
 * (scripts/locale.js brandSiteLocale); listed false: a root whose pages the site doesn't have yet
 * (its pages resolve, the header's switch leaves it out). Their pages take the interface language
 * from the page's `language` metadata (scripts/locale.js), and the header switches between the
 * languages (blocks/header): the page's counterpart its metadata names (`Alternate en |
 * /en/newsletter-subscription`), else the same path in the other language when the site shares
 * its slugs (probed), else that language's homepage. slugs 'own': a language whose pages have
 * slugs of their own (Air Dolomiti: its Italian, English and German pages share none), so no
 * same-path guess and no probe.
 * TAP's market roots (scripts/tap-markets.js: de-ch, fr-ca …, answered from their language
 * version by lh-edge) and its eighth language version pt-br follow its language roots: their
 * pages resolve; the switch lists one once TAP_LIVE_MARKETS has it (tapLanguages).
 * Its only import is that table (no imports there): scripts/locale.js (which lh-edge bundles)
 * reads it. Tests: test/locale-brand-site.test.mjs, test/language-switch.test.mjs,
 * test/tap-market-roots.test.mjs.
 */
import { TAP_MARKETS, TAP_LIVE_MARKETS } from './tap-markets.js';

const tapRoot = ([lang, country, name, extra = {}]) => ({
  lang, country, path: `/${lang}-${country}/`, home: `/${lang}-${country}`, name, slugs: 'own', ...extra,
});

/**
 * TAP's roots: its language roots (www's currency and home airport of their market), then pt-br
 * and the market roots (its language version, currency and home airport), listed only when on.
 * @param {string[]} [live] the roots that are on (default: TAP_LIVE_MARKETS)
 */
export function tapLanguages(live = TAP_LIVE_MARKETS) {
  const off = (root) => (live.includes(root) ? {} : { listed: false });
  return [
    ['pt', 'pt', 'Português', { currency: 'EUR', homeAirport: 'LIS' }],
    ['en', 'pt', 'English', { currency: 'EUR', homeAirport: 'LIS' }],
    ['es', 'es', 'Español', { currency: 'EUR', homeAirport: 'MAD' }],
    ['fr', 'fr', 'Français', { currency: 'EUR', homeAirport: 'PAR' }],
    ['de', 'de', 'Deutsch', { currency: 'EUR', homeAirport: 'FRA' }],
    ['it', 'it', 'Italiano', { currency: 'EUR', homeAirport: 'FCO' }],
    ['pl', 'pl', 'Polski', { currency: 'PLN', homeAirport: 'WAW' }],
    ['pt', 'br', 'Português (Brasil)', { currency: 'BRL', homeAirport: 'RIO', ...off('pt-br') }],
    ...Object.entries(TAP_MARKETS).map(([root, row]) => {
      const [lang, country, version, currency, homeAirport, name, , lacks = []] = row;
      return [lang, country, name, {
        version, currency, homeAirport, ...(lacks.length ? { lacks } : {}), ...off(root),
      }];
    }),
  ].map(tapRoot);
}

/** www.lufthansa-cargo.com: the homepage of the languages the site has no homepage for. */
export const CARGO_WWW = 'https://www.lufthansa-cargo.com';

/**
 * Lufthansa Cargo's languages beyond English and German (brief 414: the user's harness imported
 * www's /<ll>/ci/... pages, eFreight and the imprint with their nav and footer; www keeps their
 * homepage, /<ll>/home, where their nav's logo leads), each with its own name.
 */
export const CARGO_LANGUAGES = [['es', 'Español'], ['fr', 'Français'], ['it', 'Italiano'], ['pt', 'Português']];

/**
 * The switch: the CARGO_LANGUAGES that are on (published), listed in the header's switch and the
 * sitemaps and given their entry paths by lh-edge (tools/workers/lh-edge/src/sites.js
 * cargoEntry). Off ([]) until the user publishes them; their pages resolve either way.
 */
export const CARGO_LIVE_LANGUAGES = [];

/**
 * Cargo's languages: en and de (the same slugs, homepages /en/home and /de/home), then
 * CARGO_LANGUAGES (the same slugs; their homepage on www), listed only when on.
 * @param {string[]} [live] the languages that are on (default: CARGO_LIVE_LANGUAGES)
 */
export function cargoLanguages(live = CARGO_LIVE_LANGUAGES) {
  return [
    {
      lang: 'en', path: '/en/', home: '/en/home', name: 'English',
    },
    {
      lang: 'de', path: '/de/', home: '/de/home', name: 'Deutsch',
    },
    ...CARGO_LANGUAGES.map(([lang, name]) => ({
      lang, path: `/${lang}/`, home: `${CARGO_WWW}/${lang}/home`, name, ...(live.includes(lang) ? {} : { listed: false }),
    })),
  ];
}

export const SITE_LANGUAGES = {
  // Lufthansa Cargo (lh-cargo): cargoLanguages
  cargo: cargoLanguages(),
  // Air Dolomiti (lh-airdolomiti): Italian at the root, English at /en/, German at /de/, each
  // with slugs of its own (/iscrizione-newsletter, /en/newsletter-subscription)
  airdolomiti: [
    {
      lang: 'it', path: '/', home: '/', name: 'Italiano', slugs: 'own',
    },
    {
      lang: 'en', path: '/en/', home: '/en/', name: 'English', slugs: 'own',
    },
    {
      lang: 'de', path: '/de/', home: '/de/', name: 'Deutsch', slugs: 'own',
    },
  ],
  // TAP Air Portugal (lh-tap): www.flytap.com's <ll>-<cc> roots, Portuguese first (its / goes to
  // /pt-pt), each homepage the root itself (/pt-pt); in the switch the language roots (es-es
  // since brief 318, fr-fr since 320, de-de, it-it and pl-pl since 324), pt-br and the market
  // roots once they are on (brief 328, tapLanguages); its slugs are translated (/pt-pt/ajuda,
  // /en-pt/help): no same-path guess, the page's Alternate <lang> metadata or the homepage
  tap: tapLanguages(),
};

// home: a language's front page (the corporate site's /<sub>/<ll>/homepage; the magazine's
// /magazine/<ll> is a page itself)
const subSite = (name, langs, header, { home = (lang) => `/${name}/${lang}/homepage`, ...extra } = {}) => ({
  name,
  header,
  languages: langs.map(([lang, label]) => ({
    lang, path: `/${name}/${lang}/`, home: home(lang), name: label,
  })),
  ...extra,
});

/**
 * Sub-sites of a brand site with roots, under paths of their own with languages of their own
 * (www.swiss.com's corporate site /corporate/<ll>/ and medical services /medicalservices/<ll>/:
 * the capture of 2026-11-02). Their pages take the language from the path, their nav and footer
 * from the sub-site's language (/corporate/de/nav: scripts/locale.js), and the header switches
 * between the sub-site's languages (the same slugs in each). header: the header's style
 * (blocks/header: the menu in the bar, a search button, the language list in the bar as www's
 * "EN" with the globe; medical services' button to its own results page here, www's searches
 * ?query= on the page itself).
 */
export const SUB_SITES = {
  swiss: [
    subSite('corporate', [['en', 'English'], ['de', 'Deutsch'], ['fr', 'Français']], { menu: 'bar', search: 'button', languages: 'bar' }),
    subSite('medicalservices', [['en', 'English'], ['de', 'Deutsch']], { menu: 'bar', search: 'button', languages: 'bar' }),
    // the magazine (/magazine/<ll>/): www's quick links in the bar and its menu in the flyout, the
    // language list in the bar (www's names); articleIndex: its articles' index per language
    // (helix-query.yaml magazine-<ll>; scripts/articles.js), read by its overview pages; theme:
    // its own design (styles/themes/swiss-magazine.css, scripts/brand.js loadSubSiteTheme)
    subSite('magazine', [['de', 'German'], ['en', 'English']], { languages: 'bar' }, {
      home: (lang) => `/magazine/${lang}`,
      theme: 'swiss-magazine',
      articleIndex: { de: '/magazine/de/query-index.json', en: '/magazine/en/query-index.json' },
    }),
  ],
};

/** The sub-site of a brand (its key) a path belongs to, else null. */
export function subSiteOf(brand, pathname) {
  const subs = SUB_SITES[String(brand || '').trim().toLowerCase()] || [];
  return subs.find((s) => pathname === `/${s.name}` || String(pathname).startsWith(`/${s.name}/`)) || null;
}

/** The languages of the page's brand site (read: the page's metadata), else null. */
export function siteLanguagesOf(read) {
  const key = String(read('brand') || '').trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(SITE_LANGUAGES, key) ? SITE_LANGUAGES[key] : null;
}

/** The site language a path belongs to: the longest matching prefix (/en/x: en; /x: it). */
export function languageOfPath(pathname, languages) {
  return [...languages].sort((a, b) => b.path.length - a.path.length)
    .find((l) => pathname === l.path.replace(/\/$/, '') || pathname.startsWith(l.path)) || null;
}

/**
 * <html lang> of a TAP market root (brief 353): its language and market as www.flytap.com writes
 * them ("pt-ao", "en-gb", "de-ch": a root answered from a language version, tapLanguages'
 * `version`); '' for the language versions (pt-pt, en-pt … pt-br: their language, as before),
 * every other path and the other sites.
 * @param {string} pathname
 * @param {Object[]|null} languages the page's site languages (locale.siteLanguages)
 */
export function htmlLangOfRoot(pathname, languages) {
  if (!languages) return '';
  const entry = languageOfPath(String(pathname || ''), languages);
  return entry && entry.version && entry.country ? `${entry.lang}-${entry.country}` : '';
}

/**
 * The counterpart of a page in another site language: its homepage for a homepage, else the same
 * path under the other language's prefix (the sites share their slugs); null when unknown.
 */
export function counterpartPath(pathname, from, to) {
  if (!from || !to) return null;
  const isHome = (p, l) => p === l.home || p === l.home.replace(/\/$/, '') || p === l.path || p === l.path.replace(/\/$/, '');
  if (isHome(pathname, from)) return to.home;
  // pages with slugs of their own: the same path in the other language does not exist
  if (from.slugs === 'own' || to.slugs === 'own') return null;
  if (!pathname.startsWith(from.path)) return null;
  return `${to.path}${pathname.slice(from.path.length)}`;
}

const pathOf = (href) => {
  try {
    return new URL(href, 'https://site.invalid').pathname;
  } catch (e) {
    return '';
  }
};

/** A site language's key: its root (pt-br) on a site with countries, else its language. */
const keyOf = (l) => (l.country ? `${l.lang}-${l.country}` : l.lang);

/**
 * The page's counterparts its metadata names, for the switch: by language (Alternate en) and, on a
 * site whose languages name a country (TAP), by root (Alternate pt-br, parity.md F4).
 * @param {Array} languages the site's languages
 * @param {function(string): string} read a metadata reader (getMetadata)
 * @returns {Object<string, string>} key (language or root) -> path
 */
export function switchAlternates(languages, read) {
  const keys = [...new Set((languages || []).flatMap((l) => [l.lang, keyOf(l)]))];
  return Object.fromEntries(keys.map((k) => [k, String(read(`alternate-${k}`) || '').trim()])
    .filter(([, href]) => href));
}

/**
 * The header's language switch of a brand site without roots: per other language its label, its
 * homepage and the counterpart of the current page (counterpartPath). A nav tool link that points
 * at another language's homepage is that language's entry (the importer writes www's switch so:
 * Cargo's "Deutsch" to /de/home) and keeps its label; a language without one gets its own name.
 * Returns { links, tools }: the switch's links, and the nav's tools without the language links.
 * @param {Array<{href: string, label: string}>} tools the nav's tool items
 * @param {string} pathname the current page's path
 * @param {string} lang the current page's language (its locale)
 * @param {Array} languages the site's languages (SITE_LANGUAGES)
 * @param {Object<string, string>} [alternates] the page's counterparts its metadata names
 *   (switchAlternates: per language, and per root on a site with countries), taken without a probe.
 *   A site with countries (TAP): a root's own row first, the language's row only for that
 *   language's first listed root; a market root and its language version share their slugs
 *   (en-us/help, en-pt/help), unless the root lacks the page (its homepage then); a market root
 *   without a row of its own takes its language version's counterpart under the root (the same
 *   exception)
 */
export function languageSwitch(tools, pathname, lang, languages, alternates = {}) {
  // a site with <ll>-<cc> roots: the page's root (a language may have several)
  const rooted = languages.some((l) => l.country) && languageOfPath(pathname, languages);
  const current = rooted || languages.find((l) => l.lang === lang)
    || languageOfPath(pathname, languages);
  const others = languages.filter((l) => l !== current && l.listed !== false);
  const homeOf = (href) => others.find((l) => [l.home, l.path, l.path.replace(/\/$/, '') || '/'].includes(pathOf(href)));
  const authored = new Map();
  const rest = tools.filter((t) => {
    const l = t.href && homeOf(t.href);
    if (!l || authored.has(keyOf(l))) return !l;
    authored.set(keyOf(l), t.label);
    return false;
  });
  const first = (ll) => languages.find((x) => x.lang === ll && x.listed !== false);
  const alternateOf = (l) => {
    if (!l.country) return alternates[l.lang];
    return alternates[keyOf(l)] || (first(l.lang) === l ? alternates[l.lang] : undefined);
  };
  // a market root and its language version (or two roots of one version): the same path
  const versionOf = (l) => l.version || keyOf(l);
  const sharedOf = (l) => {
    if (!rooted || !l.country || versionOf(current) !== versionOf(l)) return null;
    const isHome = pathname === current.home || pathname === current.path;
    if (!isHome && !pathname.startsWith(current.path)) return null;
    const suffix = isHome ? '' : pathname.slice(current.path.length - 1).replace(/\/$/, '');
    if ((l.lacks || []).includes(suffix)) return null;
    return `${l.home}${suffix}`;
  };
  // a market root without a row of its own: its language version's counterpart under the root
  // (de-ch/an-bord's en-us: en-pt/on-board as /en-us/on-board), unless the root lacks the page
  const derivedOf = (l) => {
    if (!l.country || !l.version || l.version === keyOf(l)) return null;
    const version = languages.find((x) => keyOf(x) === l.version);
    const target = version && alternateOf(version);
    const prefix = `/${l.version}`;
    if (!target || (target !== prefix && !target.startsWith(`${prefix}/`))) return null;
    const suffix = target.slice(prefix.length).replace(/\/$/, '');
    if ((l.lacks || []).includes(suffix)) return null;
    return `${l.home}${suffix}`;
  };
  const links = others.map((l) => {
    const alternate = alternateOf(l) || sharedOf(l) || derivedOf(l);
    return {
      lang: l.lang,
      label: authored.get(keyOf(l)) || l.name,
      home: l.home,
      counterpart: counterpartPath(pathname, current, l),
      ...(alternate ? { alternate } : {}),
    };
  });
  return { links, tools: rest };
}

/**
 * The address of a switch link: the counterpart when the site has that page (exists: a HEAD
 * request of the path, true for a 2xx after redirects), else the language's homepage.
 */
export async function switchTarget(link, exists) {
  // named by the page (Alternate <lang>): as it is
  if (link.alternate) return link.alternate;
  if (!link.counterpart || link.counterpart === link.home) return link.home;
  try {
    return (await exists(link.counterpart)) ? link.counterpart : link.home;
  } catch (e) {
    return link.home;
  }
}
