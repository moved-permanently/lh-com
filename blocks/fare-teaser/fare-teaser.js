import { getLocale, LIVE_ORIGIN } from '../../scripts/locale.js';
import { lhFetch } from '../../scripts/lh-data.js';
import {
  readConfigRows, pick, resolveLabels, parseAirportCode, parseAirportName, formatPrice,
} from '../../scripts/block-config.js';

/* ---------------------------------------------------------------------------------------------
 * Data contract. Request building and response mapping live here so the recorded responses
 * from the live site only require changes in this section.
 * ------------------------------------------------------------------------------------------- */

/**
 * Fare teaser request: the "manual" route for authored destinations, the "offers" route
 * (the service picks the destinations) when none are authored.
 * @returns {{route: string, method: string, body: Object}}
 */
function fareTeaserRequest({
  origin, destinations, tripDuration, cabin,
}, locale) {
  const common = {
    origin,
    tripDuration,
    cabinClass: cabin,
    countryCode: locale.country.toUpperCase(),
    languageCode: locale.lang,
    currency: locale.currency,
  };
  if (destinations.length) {
    return {
      route: '/service/api/lhg-fare-teaser/fareteaser/manual',
      method: 'POST',
      body: { ...common, destinations },
    };
  }
  return {
    route: `/service/api/lhg-fare-teaser/fareteaser/offers/${encodeURIComponent(origin)}`,
    method: 'POST',
    body: common,
  };
}

/** Absolute image URL for images served by the live site. */
function liveImageUrl(src) {
  if (!src) return '';
  try {
    return new URL(src, LIVE_ORIGIN).toString();
  } catch (e) {
    return '';
  }
}

/**
 * Maps the fare teaser response to
 * [{ origin, originName, destination, destinationName, price, currency, formattedPrice, image }].
 */
function mapFareOffers(data) {
  const list = Array.isArray(data) ? data
    : (data && (data.offers || data.fares || data.recommendations
      || data.items || data.data)) || [];
  const code = (value) => (typeof value === 'string' ? value.toUpperCase() : '');
  return list.map((item) => {
    const origin = typeof item.origin === 'object' && item.origin ? item.origin : {};
    const destination = typeof item.destination === 'object' && item.destination ? item.destination : {};
    const price = item.price || item.fare || {};
    return {
      origin: code(origin.code || item.originCode || item.origin),
      originName: origin.cityName || origin.name || item.originName || item.originCityName || '',
      destination: code(destination.code || item.destinationCode || item.destination),
      destinationName: destination.cityName || destination.name || item.destinationName
        || item.destinationCityName || '',
      price: price.amount ?? price.value ?? item.amount ?? item.priceAmount ?? (typeof price === 'number' ? price : ''),
      currency: price.currency || price.currencyCode || item.currency || '',
      formattedPrice: price.formatted || item.formattedPrice || '',
      image: liveImageUrl(destination.image || destination.imageUrl || item.image || item.imageUrl),
    };
  }).filter((offer) => /^[A-Z]{3}$/.test(offer.destination));
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

function renderItem(route, labels, locale, pattern) {
  const li = el('li', 'fare-teaser-item');
  li.dataset.destination = route.destination;

  const imageWrap = el('div', 'fare-teaser-image');
  li.append(imageWrap);

  const link = el('a', 'fare-teaser-route');
  link.href = buildDestinationLink(route, locale, pattern);
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

function applyOffer(li, offer, route, locale) {
  if (!route.originName && offer.originName) {
    li.querySelector('.fare-teaser-origin').textContent = offer.originName;
  }
  if (!route.destinationName && offer.destinationName) {
    li.querySelector('.fare-teaser-destination').textContent = offer.destinationName;
  }
  if (offer.image) {
    const img = el('img');
    img.src = offer.image;
    img.alt = '';
    img.loading = 'lazy';
    li.querySelector('.fare-teaser-image').replaceChildren(img);
  }
  const price = offer.formattedPrice || formatPrice(offer.price, offer.currency, locale);
  if (price) {
    li.querySelector('.fare-teaser-price').textContent = price;
    li.querySelector('.fare-teaser-offer').hidden = false;
  }
}

export default async function decorate(block) {
  const locale = getLocale();
  const config = readConfigRows(block);
  const labels = resolveLabels(DEFAULT_LABELS, config, locale.lang);
  const text = (...keys) => (pick(config, ...keys) || {}).text || '';

  const originValue = text('origin', 'default-origin');
  const origin = parseAirportCode(originValue) || locale.homeAirport;
  const originName = parseAirportCode(originValue) ? parseAirportName(originValue) : '';
  const destinations = (pick(config, 'destinations', 'destination') || { list: [] }).list
    .map((value) => ({
      destination: parseAirportCode(value),
      destinationName: parseAirportName(value),
    }))
    .filter((d) => d.destination);
  const tripDuration = parseInt(text('trip-duration', 'duration'), 10) || 7;
  const cabin = text('cabin') || 'E';
  const patternRow = pick(config, 'link', 'link-pattern');
  let pattern = '';
  if (patternRow) pattern = patternRow.link ? patternRow.link.getAttribute('href') : patternRow.text;
  const conditions = (pick(config, 'conditions', 'conditions-label') || {}).cell;

  const routeFor = (d) => ({
    origin, originName, tripDuration, cabin, ...d,
  });
  const list = el('ul', 'fare-teaser-list');
  list.append(...destinations.map((d) => renderItem(routeFor(d), labels, locale, pattern)));

  const footer = el('div', 'fare-teaser-footer');
  if (conditions && conditions.textContent.trim()) footer.append(renderConditions(conditions));
  block.replaceChildren(list, footer);
  block.setAttribute('aria-busy', 'true');

  let offers = [];
  try {
    const request = fareTeaserRequest({
      origin, destinations: destinations.map((d) => d.destination), tripDuration, cabin,
    }, locale);
    const { data, source } = await lhFetch(request.route, {
      method: request.method,
      body: request.body,
    });
    block.dataset.source = source;
    offers = mapFareOffers(data);
  } catch (e) {
    block.dataset.source = 'none';
  }
  block.removeAttribute('aria-busy');

  if (!destinations.length) {
    // no authored routes: show what the service recommends
    offers.forEach((offer) => {
      const route = routeFor({ destination: offer.destination, destinationName: '', origin: offer.origin || origin });
      const li = renderItem(route, labels, locale, pattern);
      applyOffer(li, offer, route, locale);
      list.append(li);
    });
  } else {
    destinations.forEach((d) => {
      const offer = offers.find((o) => o.destination === d.destination);
      const li = list.querySelector(`[data-destination="${d.destination}"]`);
      if (offer && li) applyOffer(li, offer, routeFor(d), locale);
    });
  }

  // the origin is the same for every route: name all teasers once the service names it
  const namedOrigin = !originName && offers.find((o) => o.originName && o.origin === origin);
  if (namedOrigin) {
    list.querySelectorAll('.fare-teaser-origin').forEach((span) => {
      if (span.textContent === origin) span.textContent = namedOrigin.originName;
    });
  }

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
