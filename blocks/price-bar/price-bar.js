import { getLocale } from '../../scripts/locale.js';
import {
  readConfigRows, pick, resolveLabels, parseAirportCode,
} from '../../scripts/block-config.js';
import {
  teaserPriceRequest, labelsRequest, catalogRequest, fetchRequest, fetchLabels, pickLabels,
  mapTeaserPrice, mapLocaleData, formatFare,
} from '../../scripts/lh-api.js';
import { markSource } from '../../scripts/lh-data.js';

/* ---------------------------------------------------------------------------------------------
 * Data contract (see scripts/lh-api.js). The live sticky price (dcep-sticky-price, data-dcep
 * {"destinationCode":"BER","priceLabel":"Round trip from"}) loads labels/stickyprice and its
 * price from GET /service/api/teaser/price/{destination} ({"currency":"EUR","destination":
 * "Berlin","price":141.26}: the market's lowest round trip, the origin is www's choice), which
 * answers this site directly with the market's X-Portal-* headers. Live only: no answer, no
 * price (never a recorded one).
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
  };
}

/** The live requests of the block. */
export function priceBarRequests(settings, locale) {
  return {
    price: teaserPriceRequest(settings.destination),
    labels: LABEL_BUNDLES.map((bundle) => labelsRequest(bundle, locale)),
    localeData: catalogRequest('localeData'),
  };
}

/**
 * Loads the price to the destination, the live labels and the number format.
 * @returns {Promise<{lowest: Object|null, labels: Object, localeData: Object,
 *   sources: Object<string, string>}>}
 */
export async function loadPriceBarData(settings, locale) {
  const sources = {};
  const requests = priceBarRequests(settings, locale);
  const settle = (name, request, mapper, fallback) => fetchRequest(request, locale)
    .then(({ data, source }) => {
      sources[name] = source;
      return mapper(data);
    })
    .catch(() => {
      sources[name] = 'none';
      return fallback;
    });
  const [lowest, live, localeData] = await Promise.all([
    settings.destination ? settle('price', requests.price, mapTeaserPrice, null) : null,
    fetchLabels(LABEL_BUNDLES, locale),
    settle('localeData', requests.localeData, mapLocaleData, {}),
  ]);
  if (!lowest) sources.price = 'none';
  Object.entries(live.sources).forEach(([bundle, source]) => { sources[`labels/${bundle}`] = source; });
  return {
    lowest, labels: pickLabels(live.labels, LIVE_LABELS), localeData, sources,
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
  it: {
    'price label': 'Andata e ritorno da',
    'link label': 'Cerca voli',
  },
  fr: {
    'price label': 'Aller-retour à partir de',
    'link label': 'Rechercher des vols',
  },
  es: {
    'price label': 'Ida y vuelta desde',
    'link label': 'Buscar vuelos',
  },
  nl: {
    'price label': 'Retour vanaf',
    'link label': 'Vluchten zoeken',
  },
  pt: {
    'price label': 'Ida e volta a partir de',
    'link label': 'Pesquisar voos',
  },
  el: {
    'price label': 'Με επιστροφή από',
    'link label': 'Αναζήτηση πτήσεων',
  },
  ja: {
    'price label': '往復',
    'link label': 'フライトを検索',
  },
  ru: {
    'price label': 'Туда и обратно от',
    'link label': 'Найти рейсы',
  },
  zh: {
    'price label': '往返',
    'link label': '搜索航班',
  },
  pl: {
    'price label': 'W obie strony od',
    'link label': 'Szukaj lotów',
  },
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
  markSource(block, data.sources, ['price']);
  labels = resolveLabels({
    [locale.lang]: { ...(DEFAULT_LABELS[locale.lang] || DEFAULT_LABELS.en), ...data.labels },
  }, config, locale.lang);
  if (link && !authoredLinkText) link.textContent = labels['link label'];
  // rounded up to the whole currency unit, with the currency (141.26 EUR: "142 €")
  const price = data.lowest
    && formatFare(data.lowest.price, { currency: data.lowest.currency }, locale, data.localeData);
  if (price) {
    offer.querySelector('.price-bar-price').textContent = price;
    offer.hidden = false;
  }
  // nothing to say (no price, no title: www hides its bar then, e.g. FRA from the German market)
  if (!price && !settings.title) {
    block.hidden = true;
    return;
  }
  // no authored title (www's bar was empty when imported): the destination's name from the price
  if (!settings.title && data.lowest && data.lowest.name) {
    info.prepend(el('p', 'price-bar-title', data.lowest.name));
    block.setAttribute('role', 'region');
    block.setAttribute('aria-label', data.lowest.name);
  }
}
