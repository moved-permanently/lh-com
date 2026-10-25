import { getLocale } from '../../scripts/locale.js';
import {
  readConfigRows, pick, resolveLabels, parseAirportCode, parseAirportName,
} from '../../scripts/block-config.js';
import {
  ALL_TRAVEL_MONTHS, fareTeaserManualRequest, fareTeaserOffersRequest, labelsRequest,
  catalogRequest, fetchRequest, fetchLabels, pickLabels, mapManualOffers, mapOffers,
  mapConditions, mapLocaleData, formatFare, destinationImageUrl, fillLabel, htmlToParagraphs,
} from '../../scripts/lh-api.js';
import { markSource } from '../../scripts/lh-data.js';
import { bookInApp } from '../../scripts/app-bridge.js';

/* ---------------------------------------------------------------------------------------------
 * Data contract (see scripts/lh-api.js for the live request and response shapes).
 * ------------------------------------------------------------------------------------------- */

/** Live labels (labels/fareteaserstatic) used by the block, by block label key. */
const LIVE_LABELS = {
  'show more': 'fareteaserstatic.fullApp.offers.showAllLabel',
  'card label': 'fareteaserstatic.fullApp.offers.extendedSrCardLabel',
};

/** Live label bundles the block loads. */
const LABEL_BUNDLES = ['fareteaserstatic'];

/**
 * One Destinations entry: a destination ("New York (NYC)", "NYC") or a route with its own
 * origin ("Munich (MUC) - New York (NYC)", "MUC-NYC"; teasers with routes from several
 * origins). Names in brackets are kept as authored.
 * @param {string} value
 * @returns {{destination: string, destinationName: string, origin?: string, originName?: string}}
 */
export function parseFareRoute(value) {
  const codes = [...value.matchAll(/\(([A-Za-z]{3})\)/g)].map((m) => m[1].toUpperCase());
  if (codes.length >= 2) {
    const [from, to] = value.split(/\)\s*[-–>]\s*/);
    return {
      origin: codes[0],
      originName: parseAirportName(`${from})`),
      destination: codes[1],
      destinationName: parseAirportName(to || ''),
    };
  }
  const bare = value.trim().match(/^([A-Za-z]{3})\s*[-–>]\s*([A-Za-z]{3})$/);
  if (bare) {
    return {
      origin: bare[1].toUpperCase(), originName: '', destination: bare[2].toUpperCase(), destinationName: '',
    };
  }
  return { destination: parseAirportCode(value), destinationName: parseAirportName(value) };
}

/**
 * Settings of an authored block (the live component's data-dcep): origin, the routes, trip
 * duration, cabin, trip type and the months the fares are searched in.
 * @param {Object} config result of readConfigRows
 * @param {Object} locale result of getLocale()
 */
export function readFareTeaserSettings(config, locale) {
  const text = (...keys) => (pick(config, ...keys) || {}).text || '';
  const originValue = text('origin', 'default-origin');
  const months = text('travel-months', 'months')
    .split(/\s*,\s*/).map(Number).filter((m) => m >= 1 && m <= 12);
  const patternRow = pick(config, 'link', 'link-pattern');
  let pattern = '';
  if (patternRow) pattern = patternRow.link ? patternRow.link.getAttribute('href') : patternRow.text;
  return {
    origin: parseAirportCode(originValue) || locale.homeAirport,
    originName: parseAirportCode(originValue) ? parseAirportName(originValue) : '',
    destinations: (pick(config, 'destinations', 'destination') || { list: [] }).list
      .map(parseFareRoute)
      .filter((d) => d.destination),
    tripDuration: parseInt(text('trip-duration', 'duration'), 10) || 7,
    cabin: (text('cabin') || 'E').toUpperCase(),
    tripType: /^(o|one)/i.test(text('trip-type')) ? 'ONEWAY' : 'RETURN',
    travelMonths: months.length ? [...new Set(months)].join(',') : ALL_TRAVEL_MONTHS,
    // only a pattern with placeholders can link every route
    pattern: /\{(origin|destination)\}/.test(decodeURIComponent(pattern)) ? pattern : '',
  };
}

/**
 * The live requests of the block: "manual" for authored routes, "offers" (the service picks
 * the destinations) when none are authored; labels, conditions and number format.
 */
export function fareTeaserRequests(settings, locale) {
  const fares = settings.destinations.length
    ? fareTeaserManualRequest({
      travels: settings.destinations.map((d) => ({
        destination: d.destination, origin: d.origin || settings.origin,
      })),
      cabin: settings.cabin,
      tripType: settings.tripType,
      tripDuration: settings.tripDuration,
      travelMonths: settings.travelMonths,
    })
    : fareTeaserOffersRequest({ origin: settings.origin, tripType: settings.tripType });
  return {
    fares,
    labels: LABEL_BUNDLES.map((bundle) => labelsRequest(bundle, locale)),
    conditions: catalogRequest('conditions'),
    localeData: catalogRequest('localeData'),
  };
}

/**
 * Loads fares, labels, conditions and number format. Fares are matched to the request
 * (origin and destination), so a recording of another route never shows its price.
 * @returns {Promise<{offers: Array, labels: Object, conditions: Object, localeData: Object,
 *   sources: Object<string, string>}>}
 */
export async function loadFareTeaserData(settings, locale) {
  const requests = fareTeaserRequests(settings, locale);
  const sources = {};
  const settle = (name, promise, mapper, fallback) => promise
    .then(({ data, source }) => {
      sources[name] = source;
      return mapper(data);
    })
    .catch(() => {
      sources[name] = 'none';
      return fallback;
    });
  const manual = settings.destinations.length > 0;
  const [offers, live, conditions, localeData] = await Promise.all([
    // exact: a recording for another cabin, trip type or months must not show its prices
    settle('fares', fetchRequest(requests.fares, locale, { exact: true }), (data) => (manual
      ? mapManualOffers(data).filter((o) => settings.destinations
        .some((d) => d.destination === o.destination && (d.origin || settings.origin) === o.origin))
      : mapOffers(data).map((o) => ({
        origin: settings.origin,
        originName: '',
        destination: o.code,
        destinationName: o.name,
        price: o.price,
        currency: o.currency,
        symbol: o.symbol,
        prefixed: o.prefixed,
      }))), []),
    fetchLabels(LABEL_BUNDLES, locale),
    settle('conditions', fetchRequest(requests.conditions, locale), mapConditions, mapConditions()),
    settle('localeData', fetchRequest(requests.localeData, locale), mapLocaleData, {}),
  ]);
  Object.entries(live.sources).forEach(([bundle, source]) => { sources[`labels/${bundle}`] = source; });
  return {
    offers, labels: pickLabels(live.labels, LIVE_LABELS), conditions, localeData, sources,
  };
}

/**
 * Link of one route. An authored link pattern may use {origin}, {destination}, {duration}
 * and {cabin}; otherwise the live site's destination page under the current locale is used.
 */
function buildDestinationLink({
  origin, destination, tripDuration, cabin,
}, locale, pattern) {
  if (pattern) {
    return decodeURIComponent(pattern)
      .replace(/\{origin\}/g, encodeURIComponent(origin))
      .replace(/\{destination\}/g, encodeURIComponent(destination))
      .replace(/\{duration\}/g, encodeURIComponent(tripDuration))
      .replace(/\{cabin\}/g, encodeURIComponent(cabin));
  }
  const params = new URLSearchParams({
    OriginCode: origin, DestinationCode: destination, TripDuration: tripDuration, Cabin: cabin,
  });
  return `${locale.base}/book-and-manage/destination?${params}`;
}

/* ------------------------------------------------------------------------------------------- */

/** Defaults for strings an author may leave out; any can be overridden by a block row. */
const DEFAULT_LABELS = {
  en: { 'price label': 'Round trip from', 'show more': 'Show more' },
  de: { 'price label': 'Hin- und Rückflug ab', 'show more': 'mehr anzeigen' },
};

/** Routes shown on small screens before "Show more" (the live site hides the rest below 768px). */
const MOBILE_VISIBLE = 3;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

/**
 * Conditions cell: a short title followed by the conditions text becomes a disclosure
 * (the live site shows only a "Conditions" trigger); anything else is kept as authored.
 */
function renderConditions(cell) {
  const wrap = el('div', 'fare-teaser-conditions');
  const nodes = [...cell.childNodes].filter((n) => n.nodeType === Node.ELEMENT_NODE
    || n.textContent.trim());
  const [title, ...body] = nodes;
  const titleText = title ? title.textContent.trim() : '';
  if (body.length && title.nodeType === Node.ELEMENT_NODE && !title.querySelector('a')
    && titleText && titleText.length <= 60) {
    const details = el('details', 'fare-teaser-conditions-details');
    const text = el('div', 'fare-teaser-conditions-text');
    text.append(...body);
    details.append(el('summary', 'fare-teaser-conditions-label', titleText), text);
    wrap.append(details);
  } else {
    wrap.append(...cell.childNodes);
  }
  return wrap;
}

/** Conditions from the catalog (catalogs/conditions) when the authored cell has no text. */
function fillConditions(footer, conditions) {
  if (!conditions.html || footer.querySelector('.fare-teaser-conditions-details')) return;
  const wrap = footer.querySelector('.fare-teaser-conditions');
  const authoredTitle = wrap ? wrap.textContent.trim() : '';
  if (authoredTitle.length > 60) return; // authored conditions text without a title
  const paragraphs = htmlToParagraphs(conditions.html);
  if (!paragraphs.length) return;
  const fresh = el('div', 'fare-teaser-conditions');
  const disclosure = el('details', 'fare-teaser-conditions-details');
  const text = el('div', 'fare-teaser-conditions-text');
  text.append(...paragraphs);
  disclosure.append(el('summary', 'fare-teaser-conditions-label', authoredTitle || conditions.headline), text);
  fresh.append(disclosure);
  if (wrap) wrap.replaceWith(fresh);
  else footer.prepend(fresh);
}

function renderItem(route, labels, locale, pattern) {
  const li = el('li', 'fare-teaser-item');
  li.dataset.destination = route.destination;

  const imageWrap = el('div', 'fare-teaser-image');
  const src = destinationImageUrl(route.destination, 180);
  if (src) {
    const img = el('img');
    img.src = src;
    img.alt = '';
    img.loading = 'lazy';
    // a destination without a live image keeps the placeholder
    img.addEventListener('error', () => img.remove());
    imageWrap.append(img);
  }
  li.append(imageWrap);

  const link = el('a', 'fare-teaser-route');
  link.href = buildDestinationLink(route, locale, pattern);
  // in the app's web view the app books (OfferBookingRequest, scripts/app-bridge.js)
  bookInApp(link, 'OfferBookingRequest');
  link.append(
    el('span', 'fare-teaser-origin', route.originName || route.origin),
    el('span', 'fare-teaser-destination', route.destinationName || route.destination),
  );
  li.append(link);

  const offer = el('p', 'fare-teaser-offer');
  offer.append(el('span', 'fare-teaser-price-label', labels['price label']), el('span', 'fare-teaser-price'));
  offer.hidden = true;
  li.append(offer);
  return li;
}

function applyOffer(li, offer, route, labels, locale, localeData) {
  const originName = route.originName || offer.originName || route.origin;
  const destinationName = route.destinationName || offer.destinationName || route.destination;
  li.querySelector('.fare-teaser-origin').textContent = originName;
  li.querySelector('.fare-teaser-destination').textContent = destinationName;
  const price = formatFare(offer.price, offer, locale, localeData);
  if (!price) return;
  li.querySelector('.fare-teaser-price').textContent = price;
  li.querySelector('.fare-teaser-offer').hidden = false;
  if (labels['card label']) {
    // "Flight offer from {ORIGIN} to {DESTINATION} {FROMLABEL} {PRICE} {CURRENCY}"
    li.querySelector('.fare-teaser-route').setAttribute('aria-label', fillLabel(labels['card label'], {
      ORIGIN: originName,
      DESTINATION: destinationName,
      FROMLABEL: labels['price label'],
      PRICE: Math.ceil(offer.price - 1e-9),
      CURRENCY: offer.currency,
      FOOTERTEXT: '',
    }));
  }
}

export default async function decorate(block) {
  const locale = getLocale();
  const config = readConfigRows(block);
  let labels = resolveLabels(DEFAULT_LABELS, config, locale.lang);
  const settings = readFareTeaserSettings(config, locale);
  const conditionsCell = (pick(config, 'conditions', 'conditions-label') || {}).cell;

  // a route's own origin (several origins) wins over the Origin row
  const routeFor = (d) => ({
    tripDuration: settings.tripDuration,
    cabin: settings.cabin,
    ...d,
    origin: d.origin || settings.origin,
    originName: d.origin ? d.originName : settings.originName,
  });
  const list = el('ul', 'fare-teaser-list');
  list.append(...settings.destinations
    .map((d) => renderItem(routeFor(d), labels, locale, settings.pattern)));

  const footer = el('div', 'fare-teaser-footer');
  if (conditionsCell && conditionsCell.textContent.trim()) {
    footer.append(renderConditions(conditionsCell));
  }
  block.replaceChildren(list, footer);
  block.setAttribute('aria-busy', 'true');

  const data = await loadFareTeaserData(settings, locale);
  markSource(block, data.sources, ['fares']);
  block.removeAttribute('aria-busy');

  // live labels (fareteaserstatic) between the built-in defaults and the authored rows
  labels = resolveLabels({
    [locale.lang]: { ...(DEFAULT_LABELS[locale.lang] || DEFAULT_LABELS.en), ...data.labels },
  }, config, locale.lang);
  list.querySelectorAll('.fare-teaser-price-label').forEach((span) => {
    span.textContent = labels['price label'];
  });

  if (!settings.destinations.length) {
    // no authored routes: show what the service recommends
    data.offers.forEach((offer) => {
      const route = routeFor({ destination: offer.destination, destinationName: '' });
      const li = renderItem(route, labels, locale, settings.pattern);
      applyOffer(li, offer, route, labels, locale, data.localeData);
      list.append(li);
    });
  } else {
    settings.destinations.forEach((d, i) => {
      const route = routeFor(d);
      const offer = data.offers.find((o) => o.destination === d.destination
        && o.origin === route.origin);
      const li = list.children[i];
      if (offer && li) applyOffer(li, offer, route, labels, locale, data.localeData);
    });
  }

  // teasers without a fare still show the origin's name once the service names it
  list.querySelectorAll('.fare-teaser-origin').forEach((span) => {
    const named = data.offers.find((o) => o.origin === span.textContent && o.originName);
    if (named) span.textContent = named.originName;
  });

  fillConditions(footer, data.conditions);

  if (list.children.length > MOBILE_VISIBLE) {
    // small screens show the first routes only (CSS); the button reveals the rest
    const more = el('button', 'fare-teaser-more', labels['show more']);
    more.type = 'button';
    more.addEventListener('click', () => {
      block.classList.add('fare-teaser-expanded');
      more.remove();
      const next = list.children[MOBILE_VISIBLE];
      if (next) next.querySelector('.fare-teaser-route').focus();
    });
    footer.append(more);
  }

  if (!list.children.length) block.classList.add('fare-teaser-empty');
}
