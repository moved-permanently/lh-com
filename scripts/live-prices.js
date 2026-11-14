/**
 * The live prices behind the site flag live-prices (standing order 23 of 2026-11-14, Ben's
 * decision): the browser calls www's price routes (scripts/lh-data.js PRICE_ROUTES: the fare
 * teaser's offers, the destination finder's offers, flight-prices, teaser/price, the security
 * waiting times) only on a site whose /config/flags sheet has live-prices = on. Off, a price widget
 * shows one line and a link to the airline's own page for that function instead.
 * The flag is read patiently (scripts/flags.js): a slow or failing first read of the sheet is read
 * once more (up to 15 s), so a slow sheet on a working site does not take its prices away.
 */
import { isFlagOn } from './flags.js';
import { brandEntry, LIVE_ORIGIN } from './locale.js';

export const LIVE_PRICES_FLAG = 'live-prices';

/** Whether the site's live price calls are on. */
export function livePricesOn() {
  return isFlagOn(LIVE_PRICES_FLAG, { patient: true });
}

/**
 * A brand's own offers page on its www site (by the brand's www host): where its price widgets
 * send the visitor (Discover's offers grid since standing order 22).
 */
const OWN_OFFERS_PAGES = { 'www.discover-airlines.com': '/book/flights/offers' };

/** The brand's own offers page path, or null. */
export function ownOffersPath(brand) {
  return (brand && brand.www && OWN_OFFERS_PAGES[brand.www]) || null;
}

/**
 * The airline's own page for a price widget's function: a brand with its own offers page
 * (Discover) that page in the page's language root; otherwise the same page on the airline's
 * www (www.lufthansa.com for lufthansa.com and its channels, the brand's www for a brand).
 * @param {Object} locale getLocale() result
 * @param {Object|null} [brand] brandEntry()
 * @param {string} [pathname] the page's path
 * @returns {string}
 */
export function ownFunctionPage(locale, brand = brandEntry(), pathname = window.location.pathname) {
  const root = locale && locale.root ? `/${locale.root}` : '';
  const offers = ownOffersPath(brand);
  if (offers) return `https://${brand.www}${root}${offers}`;
  const origin = brand && brand.www ? `https://${brand.www}` : LIVE_ORIGIN;
  const path = String(pathname || '/').replace(/^\/content(?=\/)/, '').replace(/\.html$/, '');
  return `${origin}${path}`;
}

const TEXTS = {
  en: { prices: 'Current prices are shown on {HOST}:', 'waiting-times': 'Current waiting times are shown on {HOST}:', link: 'Go to {HOST}' },
  de: { prices: 'Aktuelle Preise finden Sie auf {HOST}:', 'waiting-times': 'Aktuelle Wartezeiten finden Sie auf {HOST}:', link: 'Zu {HOST}' },
  fr: { prices: 'Les prix actuels sont affichés sur {HOST} :', 'waiting-times': 'Les temps d’attente actuels sont affichés sur {HOST} :', link: 'Aller sur {HOST}' },
  it: { prices: 'I prezzi attuali sono disponibili su {HOST}:', 'waiting-times': 'I tempi di attesa attuali sono disponibili su {HOST}:', link: 'Vai a {HOST}' },
  es: { prices: 'Los precios actuales se muestran en {HOST}:', 'waiting-times': 'Los tiempos de espera actuales se muestran en {HOST}:', link: 'Ir a {HOST}' },
  pt: { prices: 'Os preços atuais estão em {HOST}:', 'waiting-times': 'Os tempos de espera atuais estão em {HOST}:', link: 'Ir para {HOST}' },
  nl: { prices: 'Actuele prijzen vindt u op {HOST}:', 'waiting-times': 'Actuele wachttijden vindt u op {HOST}:', link: 'Naar {HOST}' },
};

/**
 * The one line a price widget shows when the site's live prices are off: its text and the link to
 * the airline's own page for that function (ownFunctionPage).
 * @param {Object} locale getLocale() result
 * @param {'prices'|'waiting-times'} [kind]
 * @param {string} [page] the widget's own link to the airline's page (an authored row), else
 *   ownFunctionPage
 * @returns {HTMLParagraphElement} p.live-prices-off
 */
export function livePricesOffNotice(locale, kind = 'prices', page = '') {
  const texts = TEXTS[locale && locale.lang] || TEXTS.en;
  const href = page || ownFunctionPage(locale);
  const host = new URL(href).hostname.replace(/^www\./, '');
  const p = document.createElement('p');
  p.className = 'live-prices-off';
  p.append(`${(texts[kind] || texts.prices).replace('{HOST}', host)} `);
  const a = document.createElement('a');
  a.href = href;
  a.textContent = texts.link.replace('{HOST}', host);
  p.append(a);
  return p;
}
