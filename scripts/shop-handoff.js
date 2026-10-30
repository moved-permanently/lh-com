/**
 * The handoff to the Lufthansa shop (booking), shared by flight-search and destination-offer:
 * like www's flight manager, a POST form navigation to shop.lufthansa.com/booking/availability.
 */

import { LOCALE_TABLE } from './locale-table.js';

/**
 * Shop language per market (the `lang` field and query parameter of the handoff): the locale
 * table's shopLang (tools/markets/locale-data.json). de/en: en-GB, captured from a real live
 * search. UNVERIFIED (no capture, chosen by language-country): de/de de-DE, at/de de-AT,
 * gb/en en-GB. Without one: en-GB.
 */
const shopLang = (key) => LOCALE_TABLE[key]?.shopLang || 'en-GB';

const SHOP_URL = 'https://shop.lufthansa.com/booking/availability';

/** Authored cabin codes (Cabin row) to the shop's cabin values. */
const SHOP_CABINS = {
  E: 'ECONOMY',
  M: 'ECONOMY',
  P: 'PREMIUM_ECONOMY',
  W: 'PREMIUM_ECONOMY',
  N: 'PREMIUM_ECONOMY',
  B: 'BUSINESS',
  C: 'BUSINESS',
  F: 'FIRST',
};

/** OneTrust categories behind the shop's portalFacts (assumed standard OneTrust ids). */
const PORTAL_FACT_GROUPS = { performance: 'C0002', targeting: 'C0004', functional: 'C0003' };

/**
 * The shop handoff, like the live flight manager: a POST form navigation (target _self) to
 * https://shop.lufthansa.com/booking/availability?lang=..&portalCountry=.. with the fields
 * lang, portalCountry and search (JSON). Captured from one real de/en search (FRA-NYC,
 * round trip, 1 adult, Economy, consent declined); see tools/importer/IMPORT-NOTES.md.
 * This function is the single place where the widget values are mapped to the shop's fields.
 * The nonstop checkbox has no field in the captured payload and is not sent.
 * A brand site's own shop (the flight-search block's Shop row, lh-ita: shop.ita-airways.com) takes
 * the same handoff at its own availability URL; without one: Lufthansa's.
 * @param {Object} query collected form values
 * @param {Object} locale result of getLocale()
 * @param {string} [shop] the shop's availability URL (default: Lufthansa's)
 * @returns {{action: string, fields: Object<string, string>}}
 */
export function buildShopHandoff(query, locale, shop = '') {
  const lang = shopLang(locale.key);
  const portalCountry = locale.country.toUpperCase();
  const itineraries = [{
    departureDateTime: query.departureDate,
    originLocationCode: query.origin,
    destinationLocationCode: query.destination,
  }];
  if (query.tripType === 'RETURN') {
    itineraries.push({
      departureDateTime: query.returnDate,
      originLocationCode: query.destination,
      destinationLocationCode: query.origin,
    });
  }
  const adults = Math.max(1, parseInt(query.adults, 10) || 1);
  const cabinCode = String(query.cabin || 'E').toUpperCase();
  const groups = query.consentGroups || [];
  const search = {
    itineraries,
    travelers: Array.from({ length: adults }, () => ({ discounts: [], passengerTypeCode: 'ADT' })),
    cabin: SHOP_CABINS[cabinCode] || (Object.values(SHOP_CABINS).includes(cabinCode) ? cabinCode : 'ECONOMY'),
    portalFacts: Object.fromEntries(Object.entries(PORTAL_FACT_GROUPS)
      .map(([fact, group]) => [fact, groups.includes(group)])),
  };
  let action;
  try {
    action = new URL(shop && /^https:\/\/shop\.[a-z0-9.-]+\//.test(shop) ? shop : SHOP_URL);
  } catch (e) {
    action = new URL(SHOP_URL);
  }
  action.searchParams.set('lang', lang);
  action.searchParams.set('portalCountry', portalCountry);
  return {
    action: action.toString(),
    fields: { lang, portalCountry, search: JSON.stringify(search) },
  };
}

/** Submits the handoff as a hidden POST form (method post, target _self). */
export function submitShopHandoff({ action, fields }) {
  const form = document.createElement('form');
  form.method = 'post';
  form.action = action;
  form.target = '_self';
  form.hidden = true;
  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.append(input);
  });
  document.body.append(form);
  form.submit();
}
