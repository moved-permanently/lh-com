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

/** The hosts a handoff may post to: the group's shops (shop.*) and Air Dolomiti's engine. */
const HANDOFF_HOSTS = [/^shop\.[a-z0-9.-]+$/, /^digital\.airdolomiti\.it$/];

/** Whether a handoff URL is https on one of HANDOFF_HOSTS. */
export function isHandoffUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && HANDOFF_HOSTS.some((re) => re.test(url.hostname));
  } catch (e) {
    return false;
  }
}

/** Air Dolomiti's consent facts: denied, as its widget posts them without consent. */
const AIRDOLOMITI_FACTS = ['statistics_consent', 'marketing_consent', 'experience_consent'];

/**
 * Air Dolomiti's handoff (brand booking format "airdolomiti"): a POST form to
 * https://digital.airdolomiti.it/booking?lang=<it-IT|en-GB|de-DE>&collectSensitiveData=true with
 * search (fare families MIXED, the itineraries, the travellers ADT, CHD, INF) and portalFacts
 * (office EN01, the consents denied). www.airdolomiti.it's widget asks
 * api.airdolomiti.it/v1/bookings for this target first and also sends its OneTrust consent id and
 * a car rental date; neither is needed for the search.
 */
function airdolomitiHandoff(query, locale, booking, itineraries, travelers) {
  const own = isHandoffUrl(booking.url) && new URL(booking.url).hostname === 'digital.airdolomiti.it';
  const action = new URL(own ? booking.url : 'https://digital.airdolomiti.it/booking');
  action.searchParams.set('lang', (booking.langs || {})[locale.lang] || (booking.langs || {}).it || 'it-IT');
  action.searchParams.set('collectSensitiveData', 'true');
  const search = {
    commercialFareFamilies: ['MIXED'],
    itineraries,
    travelers: travelers.map(({ passengerTypeCode }) => ({ passengerTypeCode })),
  };
  const facts = [
    { key: 'officeId', value: booking.officeId },
    ...AIRDOLOMITI_FACTS.map((key) => ({ key, value: 'denied' })),
    { key: 'consent_id', value: '' },
    { key: 'consent_date', value: '' },
  ];
  return {
    action: action.toString(),
    fields: { search: JSON.stringify(search), portalFacts: JSON.stringify(facts) },
  };
}

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
 * @param {Object} [brand] the page's brand entry (scripts/brands.js): its booking format, if any
 *   (Air Dolomiti's engine), else the shop's
 * @returns {{action: string, fields: Object<string, string>}}
 */
export function buildShopHandoff(query, locale, shop = '', brand = null) {
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
  // the picker's children (2-11) and infants (under 2), after the adults
  const count = (v) => Math.max(0, parseInt(v, 10) || 0);
  const travelers = [['ADT', adults], ['CHD', count(query.children)], ['INF', count(query.infants)]]
    .flatMap(([code, n]) => Array.from({ length: n }, () => ({
      discounts: [], passengerTypeCode: code,
    })));
  const booking = brand && brand.booking;
  if (booking && booking.format === 'airdolomiti') {
    return airdolomitiHandoff(query, locale, booking, itineraries, travelers);
  }
  const cabinCode = String(query.cabin || 'E').toUpperCase();
  const groups = query.consentGroups || [];
  const search = {
    itineraries,
    travelers,
    cabin: SHOP_CABINS[cabinCode] || (Object.values(SHOP_CABINS).includes(cabinCode) ? cabinCode : 'ECONOMY'),
    portalFacts: Object.fromEntries(Object.entries(PORTAL_FACT_GROUPS)
      .map(([fact, group]) => [fact, groups.includes(group)])),
  };
  let action;
  try {
    action = new URL(shop && isHandoffUrl(shop) ? shop : SHOP_URL);
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
