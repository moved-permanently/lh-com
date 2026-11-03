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
 * A module of its own, without imports: scripts/locale.js (which lh-edge bundles) reads it.
 * Tests: test/locale-brand-site.test.mjs, test/language-switch.test.mjs.
 */
export const SITE_LANGUAGES = {
  // Lufthansa Cargo (lh-cargo): the same slugs in both languages, homepages /en/home and /de/home
  cargo: [
    {
      lang: 'en', path: '/en/', home: '/en/home', name: 'English',
    },
    {
      lang: 'de', path: '/de/', home: '/de/home', name: 'Deutsch',
    },
  ],
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
  // /pt-pt), each homepage the root itself (/pt-pt); in the switch the roots imported so far
  tap: [
    ['pt', 'pt', 'Português'], ['en', 'pt', 'English'], ['es', 'es', 'Español', false],
    ['fr', 'fr', 'Français', false], ['de', 'de', 'Deutsch', false], ['it', 'it', 'Italiano', false],
    ['pl', 'pl', 'Polski', false],
  ].map(([lang, country, name, listed]) => ({
    lang, country, path: `/${lang}-${country}/`, home: `/${lang}-${country}`, name, ...(listed === false ? { listed } : {}),
  })),
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
    // (helix-query.yaml magazine-<ll>; scripts/articles.js), read by its overview pages
    subSite('magazine', [['de', 'German'], ['en', 'English']], { languages: 'bar' }, {
      home: (lang) => `/magazine/${lang}`,
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
 * @param {Object<string, string>} [alternates] per language the page's counterpart its metadata
 *   names (Alternate <lang>), taken without a probe
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
    if (!l || authored.has(l.lang)) return !l;
    authored.set(l.lang, t.label);
    return false;
  });
  const links = others.map((l) => ({
    lang: l.lang,
    label: authored.get(l.lang) || l.name,
    home: l.home,
    counterpart: counterpartPath(pathname, current, l),
    ...(alternates[l.lang] ? { alternate: alternates[l.lang] } : {}),
  }));
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
