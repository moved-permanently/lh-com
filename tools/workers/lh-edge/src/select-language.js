/**
 * www's GET /apps/selectlanguage?tenant=<tenant>&country=<cc> (the language select of the
 * country and language selection): {"languages": [{"code", "name", "isDefault"}]} for the
 * languages the replica has for the market (scripts/locale.js), in www's order, with the English
 * language name; isDefault false (no market defines one today). Unknown market, a tenant other
 * than lh or no parameters: {"languages": []}. cache-control max-age=604800, as www.
 */
/* eslint-disable import/no-relative-packages */
import { LOCALES } from '../../../../scripts/locale.js';
/* eslint-enable import/no-relative-packages */
import { MARKETS } from './entry.js';

export const SELECT_LANGUAGE_PATH = '/apps/selectlanguage';

export const LANGUAGE_NAMES = {
  de: 'German',
  en: 'English',
  fr: 'French',
  it: 'Italian',
  es: 'Spanish',
  pt: 'Portuguese',
  nl: 'Dutch',
  pl: 'Polish',
  ru: 'Russian',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
};

/** A market's default language, when the market defines one ('' today). */
const MARKET_DEFAULTS = {};

/** The languages of a market. */
export function marketLanguages(tenant, country) {
  const cc = String(country || '').trim().toLowerCase();
  if (String(tenant || '').trim().toLowerCase() !== 'lh' || !/^[a-z]{2}$/.test(cc)) return [];
  const replica = Object.keys(LOCALES).filter((k) => k.startsWith(`${cc}/`)).map((k) => k.slice(3));
  // www's order where www's market list has it, then the rest
  const order = MARKETS[cc] || [];
  const langs = [...order.filter((l) => replica.includes(l)),
    ...replica.filter((l) => !order.includes(l))];
  return langs.map((code) => ({
    code, name: LANGUAGE_NAMES[code] || code, isDefault: MARKET_DEFAULTS[cc] === code,
  }));
}

/** The route. */
export function selectLanguage(request) {
  const url = new URL(request.url);
  const languages = marketLanguages(url.searchParams.get('tenant'), url.searchParams.get('country'));
  return new Response(request.method === 'HEAD' ? null : JSON.stringify({ languages }), {
    headers: {
      'content-type': 'application/json',
      'cache-control': 'max-age=604800',
      'x-lh-edge-route': 'select-language',
    },
  });
}
