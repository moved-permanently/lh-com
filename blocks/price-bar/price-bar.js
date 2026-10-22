import { getLocale } from '../../scripts/locale.js';
import {
  readConfigRows, pick, resolveLabels, parseAirportCode,
} from '../../scripts/block-config.js';
import {
  fareTeaserManualRequest, defaultAirportRequest, labelsRequest, catalogRequest, fetchRequest,
  fetchLabels, pickLabels, mapManualOffers, mapDefaultAirport, mapLocaleData, formatFare,
} from '../../scripts/lh-api.js';
import { markSource } from '../../scripts/lh-data.js';

/* ---------------------------------------------------------------------------------------------
 * Data contract (see scripts/lh-api.js). The live sticky price (dcep-sticky-price, data-dcep
 * {"destinationCode":"BER","priceLabel":"Round trip from"}) loads labels/stickyprice; its fare
 * request was not captured yet. The block asks the fare teaser "manual" service (same fares,
 * recorded shape) for the market default origin (defaultAirport) to the destination.
 * ------------------------------------------------------------------------------------------- */

/** Live labels (labels/stickyprice) used by the block, by block label key. */
const LIVE_LABELS = {
  'link label': 'stickyprice.common.default.ctaLabel',
};

const LABEL_BUNDLES = ['stickyprice'];

/**
 * Settings of an authored block.
 * @param {Object} config result of readConfigRows
 */
export function readPriceBarSettings(config) {
  const text = (...keys) => (pick(config, ...keys) || {}).text || '';
  return {
    title: text('title', 'destination-name'),
    destination: parseAirportCode(text('destination', 'destination-code')),
    // empty: the market default airport, like the live bar (OriginCode= empty)
    origin: parseAirportCode(text('origin', 'origin-code')),
    tripDuration: parseInt(text('trip-duration', 'duration'), 10) || 7,
    cabin: (text('cabin') || 'E').toUpperCase(),
  };
}

/** The live requests of the block for an origin (resolved by loadPriceBarData). */
export function priceBarRequests(settings, locale, origin) {
  return {
    fares: fareTeaserManualRequest({
      travels: [{ destination: settings.destination, origin }],
      cabin: settings.cabin,
      tripType: 'R',
      tripDuration: settings.tripDuration,
    }),
    defaultAirport: defaultAirportRequest(),
    labels: LABEL_BUNDLES.map((bundle) => labelsRequest(bundle, locale)),
    localeData: catalogRequest('localeData'),
  };
}

/**
 * Loads the lowest fare to the destination (only an answer for this origin and destination
 * counts), the live labels and the number format.
 * @returns {Promise<{lowest: Object|null, origin: string, labels: Object, localeData: Object,
 *   sources: Object<string, string>}>}
 */
export async function loadPriceBarData(settings, locale) {
  const sources = {};
  const base = priceBarRequests(settings, locale, settings.origin);
  // exact: a recording of other routes or parameters never shows its price
  const settle = (name, request, mapper, fallback) => fetchRequest(request, locale, { exact: true })
    .then(({ data, source }) => {
      sources[name] = source;
      return mapper(data);
    })
    .catch(() => {
      sources[name] = 'none';
      return fallback;
    });
  const labelsPromise = fetchLabels(LABEL_BUNDLES, locale);
  const localeDataPromise = settle('localeData', base.localeData, mapLocaleData, {});
  let { origin } = settings;
  if (!origin) {
    const airport = await settle('defaultAirport', base.defaultAirport, mapDefaultAirport, null);
    origin = (airport && airport.code) || locale.homeAirport;
  }
  let lowest = null;
  if (settings.destination) {
    const offers = await settle('fares', priceBarRequests(settings, locale, origin).fares, mapManualOffers, []);
    lowest = offers
      .filter((o) => o.origin === origin && o.destination === settings.destination)
      .reduce((low, o) => (!low || o.price < low.price ? o : low), null);
  }
  const [live, localeData] = await Promise.all([labelsPromise, localeDataPromise]);
  Object.entries(live.sources).forEach(([bundle, source]) => { sources[`labels/${bundle}`] = source; });
  return {
    lowest, origin, labels: pickLabels(live.labels, LIVE_LABELS), localeData, sources,
  };
}

/**
 * The single place where the "Find flights" link is built: the authored link (empty query
 * parameters such as OriginCode= dropped) or the locale's offers page for the destination
 * (the live ctaRedirectUrl "/{MARKET}/{LANGUAGE}/book-and-manage/offers-and-destination").
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
 * The bar is shown from page load (the live sticky price is in view on the first screen) and
 * hidden while the footer is visible, so it never covers the footer.
 */
function observeVisibility(block) {
  block.classList.add('price-bar-visible');
  const footer = document.querySelector('footer');
  if (!footer || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(([entry]) => {
    block.classList.toggle('price-bar-visible', !entry.isIntersecting);
  }).observe(footer);
}

export default async function decorate(block) {
  const locale = getLocale();
  const config = readConfigRows(block);
  let labels = resolveLabels(DEFAULT_LABELS, config, locale.lang);
  const settings = readPriceBarSettings(config);
  const linkRow = pick(config, 'link', 'cta');
  const authoredLink = linkRow && linkRow.link;
  const href = buildOffersLink(authoredLink ? authoredLink.getAttribute('href') : '', settings.destination, locale);

  const inner = el('div', 'price-bar-inner');
  const info = el('div', 'price-bar-info');
  if (settings.title) info.append(el('p', 'price-bar-title', settings.title));
  const offer = el('p', 'price-bar-offer');
  offer.append(el('span', 'price-bar-price-label', labels['price label']), el('span', 'price-bar-price'));
  offer.hidden = true;
  info.append(offer);
  inner.append(info);

  let link;
  const authoredLinkText = (authoredLink && authoredLink.textContent.trim())
    || (linkRow && !authoredLink && linkRow.text);
  if (href) {
    link = el('a', 'price-bar-link button', authoredLinkText || labels['link label']);
    link.href = href;
    if (authoredLink && authoredLink.title) link.title = authoredLink.title;
    inner.append(link);
  }

  block.replaceChildren(inner);
  if (settings.title) {
    block.setAttribute('role', 'region');
    block.setAttribute('aria-label', settings.title);
  }

  observeVisibility(block);

  if (!settings.destination) return;
  const data = await loadPriceBarData(settings, locale);
  markSource(block, data.sources, ['fares']);
  labels = resolveLabels({
    [locale.lang]: { ...(DEFAULT_LABELS[locale.lang] || DEFAULT_LABELS.en), ...data.labels },
  }, config, locale.lang);
  if (link && !authoredLinkText) link.textContent = labels['link label'];
  // the sticky price shows the cents (maui-price-display price="141.26"), unlike fare teasers
  const price = data.lowest
    && formatFare(data.lowest.price, data.lowest, locale, data.localeData, { decimals: true });
  if (price) {
    offer.querySelector('.price-bar-price').textContent = price;
    offer.hidden = false;
  }
}
