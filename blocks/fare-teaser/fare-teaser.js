import { getLocale } from '../../scripts/locale.js';
import {
  readConfigRows, pick, resolveLabels, parseAirportCode, parseAirportName,
} from '../../scripts/block-config.js';
import {
  ALL_TRAVEL_MONTHS, destinationFinderOffersRequest, labelsRequest, catalogRequest, fetchRequest,
  fetchLabels, pickLabels, mapDestinationFinderOffers, mapConditions, mapLocaleData, formatFare,
  destinationImageUrl, fillLabel, htmlToParagraphs, resolveOrigin, knownAirports, damPathReady,
} from '../../scripts/lh-api.js';
import { attachDamFallback } from '../../scripts/dam-path.js';
import { markSource } from '../../scripts/lh-data.js';
import { bookInApp } from '../../scripts/app-bridge.js';

/* ---------------------------------------------------------------------------------------------
 * Data contract (see scripts/lh-api.js for the live request and response shapes). www's fare
 * teaser asks the fare teaser service (lhg-fare-teaser/fareteaser/manual), which refuses this
 * site's origin; the prices come from the destination finder instead, which answers directly:
 * GET /service/api/destinationfinder/destination/finder/{origin}/{cabin}?months=0_11&tripType=
 * RETURN|ONEWAY, one call per origin, cabin and trip type, every destination with its lowest
 * price over the next twelve months (the teaser's travel months and trip duration are not
 * applied). Never a recorded price (scripts/lh-data.js price routes).
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
    // empty: resolved when the page is viewed (resolveOrigin: defaultAirport, else home airport)
    origin: parseAirportCode(originValue) || '',
    originName: parseAirportCode(originValue) ? parseAirportName(originValue) : '',
    fallbackOrigin: locale.homeAirport,
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

/** The finder groups of the block: one request per origin, cabin and trip type. */
export function fareTeaserRequests(settings, locale) {
  const groups = new Map();
  const routes = settings.destinations.length
    ? settings.destinations.map((d) => d.origin || settings.origin) : [settings.origin];
  routes.forEach((origin) => {
    const key = `${origin}|${settings.cabin}|${settings.tripType}`;
    if (!groups.has(key)) {
      groups.set(key, {
        origin,
        request: destinationFinderOffersRequest({
          origin, cabin: settings.cabin, tripType: settings.tripType,
        }),
      });
    }
  });
  return {
    fares: [...groups.values()],
    labels: LABEL_BUNDLES.map((bundle) => labelsRequest(bundle, locale)),
    conditions: catalogRequest('conditions'),
    localeData: catalogRequest('localeData'),
  };
}

/** Destinations shown when no route is authored: the finder's top deals, then by price. */
const SERVICE_PICKS = 6;

/**
 * Loads prices (live only), labels, conditions and number format. A route's price is the
 * finder's price for its destination from its origin; a route without one shows no price.
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
  const groupResults = await Promise.all(requests.fares.map((g) => fetchRequest(g.request, locale)
    .then(({ data, source }) => ({ origin: g.origin, ...mapDestinationFinderOffers(data), source }))
    .catch(() => ({
      origin: g.origin, originName: '', offers: [], source: 'none',
    }))));
  // live when a finder answered (the shown prices are live), else none
  sources.fares = groupResults.some((r) => r.source === 'live') ? 'live' : 'none';
  const toOffer = (r, o) => ({
    origin: r.origin,
    originName: r.originName,
    destination: o.code,
    destinationName: o.name,
    price: o.price,
    currency: o.currency,
    symbol: o.symbol,
    prefixed: o.prefixed,
  });
  let offers;
  if (settings.destinations.length) {
    offers = groupResults.flatMap((r) => r.offers.map((o) => toOffer(r, o)));
  } else {
    const [r] = groupResults;
    offers = r ? [...r.offers].filter((o) => o.code !== r.origin)
      .sort((a, b) => Number(b.topDeal) - Number(a.topDeal) || a.price - b.price)
      .slice(0, SERVICE_PICKS)
      .map((o) => toOffer(r, o)) : [];
  }
  const [live, conditions, localeData] = await Promise.all([
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
  it: {
    'price label': 'Andata e ritorno da',
    'show more': 'Mostra di più',
  },
  fr: {
    'price label': 'Aller-retour à partir de',
    'show more': 'Afficher plus',
  },
  es: {
    'price label': 'Ida y vuelta desde',
    'show more': 'Mostrar más',
  },
  nl: {
    'price label': 'Retour vanaf',
    'show more': 'Meer tonen',
  },
  pt: {
    'price label': 'Ida e volta a partir de',
    'show more': 'Mostrar mais',
  },
  el: {
    'price label': 'Με επιστροφή από',
    'show more': 'Εμφάνιση περισσότερων',
  },
  ja: {
    'price label': '往復',
    'show more': 'もっと見る',
  },
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
    attachDamFallback(img, () => img.remove());
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
  // the cards' images need scripts/dam-path.js (lh-api damPathReady): loading while the rest runs
  const damReady = damPathReady();
  const locale = getLocale();
  const config = readConfigRows(block);
  let labels = resolveLabels(DEFAULT_LABELS, config, locale.lang);
  const settings = readFareTeaserSettings(config, locale);
  if (!settings.origin) {
    // no authored origin: the market default airport, else the home airport (as flight search)
    const origin = await resolveOrigin(null, locale);
    settings.origin = origin.code;
    settings.originName = origin.name;
  }
  const conditionsCell = (pick(config, 'conditions', 'conditions-label') || {}).cell;

  // a route's own origin (several origins) wins over the Origin row
  const routeFor = (d) => ({
    tripDuration: settings.tripDuration,
    cabin: settings.cabin,
    ...d,
    origin: d.origin || settings.origin,
    originName: d.origin ? d.originName : settings.originName,
  });
  await damReady;
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

  // routes still named by their codes (no live answer): the city names the site knows
  // (recorded suggestions and catalogs: names, never prices)
  const unnamed = [...list.querySelectorAll('.fare-teaser-origin, .fare-teaser-destination')]
    .filter((span) => /^[A-Z]{3}$/.test(span.textContent));
  if (unnamed.length) {
    knownAirports(locale).then((known) => {
      unnamed.forEach((span) => {
        const hit = known.find((a) => a.code === span.textContent);
        if (hit) span.textContent = hit.name.replace(/,.*$/, '');
      });
    }).catch(() => {});
  }

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
