import { getLocale } from '../../scripts/locale.js';
import { lhFetch } from '../../scripts/lh-data.js';
import {
  readConfigRows, pick, resolveLabels, parseAirportCode, formatPrice,
} from '../../scripts/block-config.js';

/* ---------------------------------------------------------------------------------------------
 * Data contract. Request building and response mapping live here so the recorded responses
 * from the live site only require changes in this section.
 * ------------------------------------------------------------------------------------------- */

/**
 * Lowest fare request: the fare teaser "manual" route (same service as the fare-teaser
 * block) for the one destination of the bar.
 * @returns {{route: string, method: string, body: Object}}
 */
function priceBarRequest({
  origin, destination, tripDuration, cabin,
}, locale) {
  return {
    route: '/service/api/lhg-fare-teaser/fareteaser/manual',
    method: 'POST',
    body: {
      origin,
      destinations: [destination],
      tripDuration,
      cabinClass: cabin,
      countryCode: locale.country.toUpperCase(),
      languageCode: locale.lang,
      currency: locale.currency,
    },
  };
}

/**
 * Maps the fare response to the lowest offer for the destination:
 * { price, currency, formattedPrice } or null.
 */
function mapLowestPrice(data, destination) {
  let list = [];
  if (Array.isArray(data)) list = data;
  else if (data && typeof data === 'object') {
    list = data.offers || data.fares || data.recommendations || data.items || data.data
      || (data.price || data.amount ? [data] : []);
  }
  if (!Array.isArray(list)) return null;
  const code = (value) => (typeof value === 'string' ? value.toUpperCase() : '');
  const offers = list.map((item) => {
    const dest = typeof item.destination === 'object' && item.destination ? item.destination : {};
    const price = item.price || item.fare || item.lowestPrice || {};
    const amount = typeof price === 'object'
      ? price.amount ?? price.value ?? item.amount ?? item.priceAmount
      : price;
    return {
      destination: code(dest.code || item.destinationCode || item.destination),
      price: Number(amount),
      currency: (typeof price === 'object' && (price.currency || price.currencyCode)) || item.currency || '',
      formattedPrice: (typeof price === 'object' && price.formatted) || item.formattedPrice || '',
    };
  }).filter((o) => !Number.isNaN(o.price) && o.price > 0);
  const matching = offers.filter((o) => !o.destination || o.destination === destination);
  if (!matching.length) return null;
  return matching.reduce((low, o) => (o.price < low.price ? o : low));
}

/**
 * The single place where the "Find flights" link is built: the authored link (empty query
 * parameters such as OriginCode= dropped) or the locale's offers page for the destination.
 */
function buildOffersLink(authoredHref, destination, locale) {
  if (authoredHref) {
    try {
      const url = new URL(authoredHref, window.location.href);
      [...url.searchParams.keys()].forEach((key) => {
        if (!url.searchParams.get(key)) url.searchParams.delete(key);
      });
      return url.origin === window.location.origin
        ? `${url.pathname}${url.search}${url.hash}` : url.toString();
    } catch (e) {
      return authoredHref;
    }
  }
  if (!destination) return '';
  return `${locale.base}/book-and-manage/offers-and-destination?${new URLSearchParams({ BpsDestination: destination })}`;
}

/* ------------------------------------------------------------------------------------------- */

/** Defaults for strings an author may leave out; any can be overridden by a block row. */
const DEFAULT_LABELS = {
  en: { 'price label': 'Round trip from', 'link label': 'Find flights' },
  de: { 'price label': 'Hin- und Rückflug ab', 'link label': 'Flüge finden' },
};

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

/**
 * Shows the bar once its original position has scrolled out of view above the viewport,
 * and hides it again while the footer is visible so the bar never covers it.
 */
function observeVisibility(block, sentinel) {
  let passed = false;
  let footerVisible = false;
  const update = () => {
    const visible = passed && !footerVisible;
    block.classList.toggle('price-bar-visible', visible);
  };
  if (!('IntersectionObserver' in window)) {
    const onScroll = () => {
      passed = sentinel.getBoundingClientRect().bottom < 0;
      update();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return;
  }
  new IntersectionObserver(([entry]) => {
    passed = !entry.isIntersecting && entry.boundingClientRect.top < 0;
    update();
  }).observe(sentinel);
  const footer = document.querySelector('footer');
  if (footer) {
    new IntersectionObserver(([entry]) => {
      footerVisible = entry.isIntersecting;
      update();
    }).observe(footer);
  }
}

export default async function decorate(block) {
  const locale = getLocale();
  const config = readConfigRows(block);
  const labels = resolveLabels(DEFAULT_LABELS, config, locale.lang);
  const text = (...keys) => (pick(config, ...keys) || {}).text || '';

  const title = text('title', 'destination-name');
  const destination = parseAirportCode(text('destination', 'destination-code'));
  const origin = parseAirportCode(text('origin', 'origin-code')) || locale.homeAirport;
  const tripDuration = parseInt(text('trip-duration', 'duration'), 10) || 7;
  const cabin = text('cabin') || 'E';
  const linkRow = pick(config, 'link', 'cta');
  const authoredLink = linkRow && linkRow.link;
  const href = buildOffersLink(authoredLink ? authoredLink.getAttribute('href') : '', destination, locale);

  const inner = el('div', 'price-bar-inner');
  const info = el('div', 'price-bar-info');
  if (title) info.append(el('p', 'price-bar-title', title));
  const offer = el('p', 'price-bar-offer');
  offer.append(el('span', 'price-bar-price-label', labels['price label']), el('span', 'price-bar-price'));
  offer.hidden = true;
  info.append(offer);
  inner.append(info);

  if (href) {
    const link = el('a', 'price-bar-link button', (authoredLink && authoredLink.textContent.trim())
      || (linkRow && !authoredLink && linkRow.text) || labels['link label']);
    link.href = href;
    if (authoredLink && authoredLink.title) link.title = authoredLink.title;
    inner.append(link);
  }

  block.replaceChildren(inner);
  if (title) {
    block.setAttribute('role', 'region');
    block.setAttribute('aria-label', title);
  }

  // the bar leaves the flow (fixed); a zero-height marker keeps its place on the page
  const sentinel = el('div', 'price-bar-sentinel');
  sentinel.setAttribute('aria-hidden', 'true');
  block.before(sentinel);
  observeVisibility(block, sentinel);

  if (!destination) return;
  try {
    const request = priceBarRequest({
      origin, destination, tripDuration, cabin,
    }, locale);
    const { data, source } = await lhFetch(request.route, {
      method: request.method,
      body: request.body,
    });
    block.dataset.source = source;
    const lowest = mapLowestPrice(data, destination);
    const price = lowest && (lowest.formattedPrice
      || formatPrice(lowest.price, lowest.currency, locale));
    if (price) {
      offer.querySelector('.price-bar-price').textContent = price;
      offer.hidden = false;
    }
  } catch (e) {
    block.dataset.source = 'none';
  }
}
