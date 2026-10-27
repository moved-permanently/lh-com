/**
 * Entry redirects for /, /<cc> and /<cc>/<ll> (README "Entry redirects"), before any page lookup:
 * - /<cc>/<ll>[/]: 302 to /<cc>/<ll>/homepage (query kept) when the replica has that locale,
 *   else to www's homepage for it (as scripts/locale.js getHomepageUrl does for links);
 * - /<cc>[/]: the language is the visitor's saved choice (cookie dcep.prehpsettings, "<cc>/<ll>")
 *   when its country matches, else the first Accept-Language language the market offers, else
 *   the market's default language; then as above. (www sends /de to /de/de/en/homepage, a 404:
 *   not copied.)
 * - /: the market of the saved choice, else the visitor's country (CF-IPCountry), else the
 *   international market xx in English with ?showLanguageSelection=true; the language as above.
 * Not cached at the edge (cookie, country and language decide): cache-control private, no-store,
 * Vary: Cookie, Accept-Language.
 * Market roots the host serves (src/markets.js servedMarketRoots: pilot rows on PILOT_HOSTS only)
 * count as the replica's: /ch, /ch/en, /ch/de go to their homepages there; elsewhere to www's.
 */
/* eslint-disable import/no-relative-packages */
import { LOCALES, LIVE_ORIGIN } from '../../../../scripts/locale.js';
/* eslint-enable import/no-relative-packages */
import { servedMarketRoots } from './markets.js';

/** www's markets and the languages they offer (the first is the market's default). */
export const MARKETS = {
  de: ['de', 'en'],
  at: ['de', 'en'],
  gb: ['en'],
  us: ['en'],
  xx: ['en', 'de'],
};

const ENTRY = /^\/(?:([a-z]{2})(?:\/([a-z]{2}))?)?\/?$/;

// ISO 3166-1 alpha-2 codes and www's international market xx: /<two letters> that is no country,
// such as /en, is a page path (404 from the origin, as www)
const COUNTRIES = new Set([
  'ad ae af ag ai al am ao aq ar as at au aw ax az ba bb bd be bf bg bh bi bj bl bm bn',
  'bo bq br bs bt bv bw by bz ca cc cd cf cg ch ci ck cl cm cn co cr cu cv cw cx cy cz',
  'de dj dk dm do dz ec ee eg eh er es et fi fj fk fm fo fr ga gb gd ge gf gg gh gi gl',
  'gm gn gp gq gr gs gt gu gw gy hk hm hn hr ht hu id ie il im in io iq ir is it je jm',
  'jo jp ke kg kh ki km kn kp kr kw ky kz la lb lc li lk lr ls lt lu lv ly ma mc md me',
  'mf mg mh mk ml mm mn mo mp mq mr ms mt mu mv mw mx my mz na nc ne nf ng ni nl no np',
  'nr nu nz om pa pe pf pg ph pk pl pm pn pr ps pt pw py qa re ro rs ru rw sa sb sc sd',
  'se sg sh si sj sk sl sm sn so sr ss st sv sx sy sz tc td tf tg th tj tk tl tm tn to',
  'tr tt tv tw tz ua ug um us uy uz va vc ve vg vi vn vu wf ws ye yt za zm zw xx',
].join(' ').split(' '));
export const COOKIE = 'dcep.prehpsettings';

/** The entry path's country and language ({} for /), or null when it is not an entry path. */
export function entryPath(pathname) {
  const m = pathname.match(ENTRY);
  if (!m || (m[1] && !COUNTRIES.has(m[1]))) return null;
  return { cc: m[1] || '', ll: m[2] || '' };
}

/** The visitor's saved market and language (cookie dcep.prehpsettings "<cc>/<ll>"), or null. */
export function savedChoice(request) {
  const header = request.headers.get('cookie') || '';
  const raw = header.split(/;\s*/).map((c) => c.split('=')).find(([k]) => k === COOKIE);
  if (!raw) return null;
  let value = raw.slice(1).join('=');
  try { value = decodeURIComponent(value); } catch (e) { /* as it is */ }
  const m = value.trim().toLowerCase().match(/^([a-z]{2})[/_-]([a-z]{2})$/);
  return m ? { cc: m[1], ll: m[2] } : null;
}

/** The Accept-Language languages, best first (two-letter codes). */
export function acceptLanguages(request) {
  return String(request.headers.get('accept-language') || '').split(',')
    .map((part, i) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.map((p) => p.trim().match(/^q=([\d.]+)$/)).find(Boolean);
      return { lang: tag.trim().toLowerCase().split('-')[0], q: q ? Number(q[1]) : 1, i };
    })
    .filter((l) => /^[a-z]{2}$/.test(l.lang) && l.q > 0)
    .sort((a, b) => b.q - a.q || a.i - b.i)
    .map((l) => l.lang);
}

/**
 * The language for a market: saved choice, Accept-Language, market default ('' if unknown).
 * served: the market roots the host serves besides LOCALES (their first row is the default).
 */
export function pickLanguage(cc, request, served = []) {
  const saved = savedChoice(request);
  if (saved && saved.cc === cc) return saved.ll;
  const offered = MARKETS[cc] || [...Object.keys(LOCALES), ...served].filter((k) => k.startsWith(`${cc}/`)).map((k) => k.slice(3));
  const accepted = acceptLanguages(request).find((l) => offered.includes(l));
  return accepted || offered[0] || '';
}

/** The homepage of a market and language: the replica's (served: market roots too), else www's. */
export function homepageUrl(cc, ll, search = '', served = []) {
  if (!ll) return `${LIVE_ORIGIN}/${cc}${search}`;
  const path = `/${cc}/${ll}/homepage`;
  return LOCALES[`${cc}/${ll}`] || served.includes(`${cc}/${ll}`) ? `${path}${search}` : `${LIVE_ORIGIN}${path}${search}`;
}

function redirect(location) {
  return new Response(null, {
    status: 302,
    headers: {
      location,
      'cache-control': 'private, no-store',
      vary: 'Cookie, Accept-Language',
      'x-lh-edge-route': 'entry',
    },
  });
}

/** The route. */
export function entry(request, env = {}) {
  const url = new URL(request.url);
  const { cc, ll } = entryPath(url.pathname);
  const { search } = url;
  const served = servedMarketRoots(request, env);
  if (cc && ll) return redirect(homepageUrl(cc, ll, search, served));
  if (cc) return redirect(homepageUrl(cc, pickLanguage(cc, request, served), search, served));
  const saved = savedChoice(request);
  const country = String(request.headers.get('cf-ipcountry') || '').trim().toLowerCase();
  const market = (saved && saved.cc) || (/^[a-z]{2}$/.test(country) && country !== 'xx' ? country : '');
  if (!market) {
    const params = new URLSearchParams(search);
    params.set('showLanguageSelection', 'true');
    return redirect(homepageUrl('xx', 'en', `?${params}`));
  }
  return redirect(homepageUrl(market, pickLanguage(market, request, served), search, served));
}
