/**
 * Brand sites without <cc>/<ll> roots (metadata brand: cargo, airdolomiti): their languages, each
 * with its path prefix, its homepage and its own name. Their pages take the interface language
 * from the page's `language` metadata (scripts/locale.js), and the header switches between the
 * languages (blocks/header: the same path in the other language, else that language's homepage).
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
  // Air Dolomiti (lh-airdolomiti): Italian at the root, English at /en/, German at /de/
  airdolomiti: [
    {
      lang: 'it', path: '/', home: '/', name: 'Italiano',
    },
    {
      lang: 'en', path: '/en/', home: '/en/', name: 'English',
    },
    {
      lang: 'de', path: '/de/', home: '/de/', name: 'Deutsch',
    },
  ],
};

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
 */
export function languageSwitch(tools, pathname, lang, languages) {
  const current = languages.find((l) => l.lang === lang) || languageOfPath(pathname, languages);
  const others = languages.filter((l) => l !== current);
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
  }));
  return { links, tools: rest };
}

/**
 * The address of a switch link: the counterpart when the site has that page (exists: a HEAD
 * request of the path, true for a 2xx after redirects), else the language's homepage.
 */
export async function switchTarget(link, exists) {
  if (!link.counterpart || link.counterpart === link.home) return link.home;
  try {
    return (await exists(link.counterpart)) ? link.counterpart : link.home;
  } catch (e) {
    return link.home;
  }
}
