/**
 * The data layer www.lufthansa.com builds for its tag manager (window.lhgData), for
 * scripts/martech.js (off by default). The page part follows www's (read 2026-10-27/28, the
 * recorded heads in tools/source-export/heads): the page's technical name (www's AEM content
 * path without /content/lh/markets/<cc>/<ll>/, English in every language) split into up to five
 * categories, its last segment the page name, pageId the technical name plus _<cc>_<ll>.
 * The technical names of the live roots are data/aem-page-ids.json (public path -> technical
 * name where they differ, tools/importer/build-aem-page-ids.js); a page not in it uses its path
 * without the locale, a page metadata value lh-page-id replaces both (pages authors create later).
 * A market root answered from its language version (choice B: ch, the pilot roots) takes the
 * language document's technical name and the country and language of the URL it is shown at.
 * The user part is www's logged-out visitor; marketing is empty; components only when a block
 * registered one (registerComponent).
 */
import { getLocale, LOCALE_TABLE, isWwwRoot } from './locale.js';
import { LANGUAGE_VERSIONS } from './locale-table.js';
import { siteTitleSuffix } from './brand.js';

export const TITLE_SUFFIX = / \| Lufthansa$/;
export const PAGE_IDS_PATH = '/data/aem-page-ids.json';

const components = [];

/** A block's entry in lhgData.components (www: the homepage's main stage teaser). */
export function registerComponent(entry) {
  components.push({ ...entry });
}

/** The registered components (for tests and the wrapper). */
export const registeredComponents = () => components.map((c) => ({ ...c }));

const clean = (pathname) => String(pathname || '').split(/[?#]/)[0].replace(/\.html$/, '').replace(/\/+$/, '');

/** The root of a path (/<cc>/<ll>/... of the locale table or of www), or null. */
export function localeKeyOf(pathname) {
  const m = clean(pathname).match(/^\/([a-z]{2})\/([a-z]{2})(\/|$)/);
  const key = m && `${m[1]}/${m[2]}`;
  return key && (LOCALE_TABLE[key] || isWwwRoot(key)) ? key : null;
}

/**
 * The technical name of a public path: its entry in the ids, else its path without the locale.
 * Under a market root answered from its language version (documents "language"), the language
 * version's page of the same path (the market route's lookup; the root's own documents are not
 * in the ids and keep their own path).
 */
export function technicalNameOf(pathname, ids = {}) {
  const path = clean(pathname);
  const key = localeKeyOf(path);
  if (!key) return path.replace(/^\//, '');
  const rest = path.slice(key.length + 1);
  const row = LOCALE_TABLE[key];
  const source = row && row.documents === 'language' ? LANGUAGE_VERSIONS[row.lang] || key : key;
  return ids[`/${source}${rest}`] || rest.replace(/^\//, '') || 'homepage';
}

const LOGGED_OUT = () => ({
  profile: {
    address: {},
    profileInfo: { permissions: '' },
    preference: {},
    loginPersistence: false,
    loginStatus: false,
    membership: { status: 'none' },
  },
});

/**
 * www's lhgData for a page (a pure function).
 * @param {{pathname: string, title: string, technicalName?: string, country: string,
 *   language: string, components?: object[]}} page
 */
export function buildLhgData({
  pathname, title, technicalName, country, language, components: entries = [],
}) {
  const name = String(technicalName || technicalNameOf(pathname)).replace(/^\/+|\/+$/g, '');
  const parts = name.split('/').filter(Boolean);
  const category = {};
  for (let i = 0; i < 5; i += 1) category[`category${i + 1}`] = parts[i] || '';
  const cc = String(country || '').toLowerCase();
  const ll = String(language || '').toLowerCase();
  const data = {
    page: {
      // the site's suffix (" | Lufthansa", a brand's " | ITA Airways")
      attributes: { htmlTitle: String(title || '').replace(siteTitleSuffix(), '') },
      category,
      pageInfo: {
        country: cc, language: ll, pageId: `${name}_${cc}_${ll}`, pageName: parts[parts.length - 1] || '',
      },
    },
    user: LOGGED_OUT(),
    marketing: {},
  };
  if (entries.length) data.components = entries.map((c) => ({ ...c }));
  return data;
}

let idsRequest;
/** data/aem-page-ids.json, read once per page view ({} when it can't be read). */
export function loadPageIds(fetchImpl = fetch) {
  const base = (typeof window !== 'undefined' && window.hlx && window.hlx.codeBasePath) || '';
  idsRequest ||= fetchImpl(`${base}${PAGE_IDS_PATH}`)
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => ({}));
  return idsRequest;
}

/** For tests: forget the ids read. */
export function resetPageIds() {
  idsRequest = undefined;
}

/**
 * The page's lhgData: document.title without the suffix, the URL's locale (else getLocale()), the
 * technical name from page metadata lh-page-id or the ids.
 */
export async function pageLhgData({ fetchImpl } = {}) {
  const pathname = window.location.pathname.replace(/^\/content(?=\/)/, '');
  // the root of the URL the visitor sees (a market root's own, not its language version's)
  const key = localeKeyOf(pathname) || getLocale(pathname).root;
  const [country, language] = key.split('/');
  const meta = document.querySelector('meta[name="lh-page-id"]');
  const own = meta && meta.content.trim();
  const technicalName = own || technicalNameOf(pathname, await loadPageIds(fetchImpl));
  return buildLhgData({
    pathname,
    title: document.title,
    technicalName,
    country,
    language,
    components: registeredComponents(),
  });
}
