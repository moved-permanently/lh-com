import { getLocale } from '../../scripts/locale.js';
import { readConfigRows, pick, toConfigKey } from '../../scripts/block-config.js';
import { createAirportCombobox } from '../../scripts/airport-combobox.js';
import {
  LOUNGE_STATUSES, loungeCitiesRequest, loungesRequest, mapLoungeCities, mapLounges, damPathReady,
  fetchRequest, fetchLabels, fillLabel, filterAirports,
} from '../../scripts/lh-api.js';
import { markSource } from '../../scripts/lh-data.js';

/* ---------------------------------------------------------------------------------------------
 * Data contract. The live lounge finder (.loungefinder > .dcep-lounge-finder, React app
 * "LoungeFinder" in 4ca8ff36.chunk.js, API routes in d9631429.chunk.js, result card in
 * 5689dcbf.chunk.js) loads
 *   GET /service/api/labels/loungefinder/lh/{lang}               UI strings
 *   GET /service/api/catalogs/lounges/cities                     the cities of the city field
 * and on submit
 *   GET /service/api/catalogs/lounges/{status}/{city}            lounges for a class or status
 * Economy (feature switch TEX-APEX-DHTE-22006-lounge-purchase) lists only lounges whose access
 * can be bought: GET https://amp.yiluhub.com/product/v1/products?storeId=...&airport=FRA
 * (Yilu, the live travelintegration shop), then catalogs/lounges/BUS/{city}, keeping the
 * lounges Yilu sells, with price and a "Purchase Lounge Access" link to
 * lufthansa.travelintegration.com/lounges/product.
 * On www's own hosts the /service/api routes are same-origin calls. On our hosts (brief 539) the
 * labels, cities and searches come from www's recorded answers under /data/lounges
 * (scripts/lounge-data.js; de and en, other languages read en) and www is never called; Yilu is
 * called directly and never recorded.
 * ------------------------------------------------------------------------------------------- */

const DEFAULT_IMAGE_BASE = '/content/dam/lh/images/lounges';

/** Yilu store of the LH tenant (Kt of 4ca8ff36.chunk.js) and the products route. */
export const YILU_ORIGIN = 'https://amp.yiluhub.com';
const YILU_STORE_ID = '6662ff1e7d41365f96988306';
const YILU_TIMEOUT_MS = 3000;
/** Yilu lounge (product) id → Lufthansa loungeid (bs of 4ca8ff36.chunk.js). */
const YILU_LOUNGE_IDS = {
  6: '14552', 7: '14633', 9: '14606', 10: '14607', 19: '14432', 20: '14145', 22: '14637', 23: '14609', 31: '14401', 32: '14417', 33: '14265', 34: '14251', 40: '14407', 50: '45', 51: '14337', 53: '13826', 54: '13850', 70: '14576', 100: '14567', 101: '14571', 103: '14089', 104: '14569', 105: '14572', 106: '14072', 107: '13950', 108: '13949', 200: '39', 201: '14384', 202: '14173',
};
const LOUNGE_YILU_IDS = Object.fromEntries(Object.entries(YILU_LOUNGE_IDS).map(([y, l]) => [l, y]));
/** City codes Yilu knows by their main airport (tried first, then the city code). */
const YILU_AIRPORTS = {
  NYC: 'JFK', DTT: 'DTW', LON: 'LHR', MIL: 'MXP',
};

/** The Yilu product URLs the Economy flow tries, in order. */
export function loungeProductsUrls(city) {
  const code = String(city || '').toUpperCase();
  return [YILU_AIRPORTS[code], code].filter(Boolean)
    .map((airport) => `${YILU_ORIGIN}/product/v1/products?storeId=${YILU_STORE_ID}&airport=${encodeURIComponent(airport)}`);
}

/** "Purchase Lounge Access" link of the live card (qs of 4ca8ff36.chunk.js, tenant LH). */
export function loungePurchaseUrl(yiluId, airport) {
  const url = new URL('https://lufthansa.travelintegration.com/lounges/product');
  url.searchParams.set('loungeId', yiluId);
  if (airport) url.searchParams.set('airportIataCode', airport);
  url.searchParams.set('utm_source', 'web-lounge-finder');
  url.searchParams.set('utm_medium', 'LH');
  url.searchParams.set('utm_campaign', 'lounge-voucher');
  url.searchParams.set('utm_content', 'result-lounge-item-cta');
  url.searchParams.set('touchpoint', 'web-lounge-finder');
  return url.toString();
}

/**
 * {"items":[{"item":{"productId":"106","regularPrice":35,"currency":"EUR",
 *  "defaultPrice":{"price":{"amount":3500,"currency":"EUR"}}}}]} → Map(productId → { price,
 *  currency }) (shape from the live saga; never recorded)
 */
export function mapLoungeProducts(data) {
  const products = new Map();
  ((data && data.items) || []).forEach((entry) => {
    const item = entry && entry.item;
    if (!item || item.productId === undefined) return;
    const amount = item.defaultPrice && item.defaultPrice.price;
    const cents = amount && amount.amount !== undefined ? amount.amount / 100 : undefined;
    const price = item.regularPrice ?? cents;
    products.set(String(item.productId), {
      price,
      currency: item.currency || (amount && amount.currency) || '',
    });
  });
  return products;
}

async function fetchYilu(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), YILU_TIMEOUT_MS);
  try {
    const resp = await fetch(url, {
      mode: 'cors', credentials: 'omit', headers: { Accept: 'application/json' }, signal: controller.signal,
    });
    if (resp.status === 400) return { skip: true };
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return { data: await resp.json() };
  } finally {
    clearTimeout(timer);
  }
}

/** Purchasable lounges of a city (Yilu) as Map(productId → offer) and the airport asked. */
async function loadProducts(city) {
  const urls = loungeProductsUrls(city);
  let airport = String(city).toUpperCase();
  let products = new Map();
  // eslint-disable-next-line no-restricted-syntax
  for (const url of urls) {
    // eslint-disable-next-line no-await-in-loop
    const { data, skip } = await fetchYilu(url);
    if (!skip) {
      products = mapLoungeProducts(data);
      airport = new URL(url).searchParams.get('airport');
      if (products.size) break;
    }
  }
  return { products, airport };
}

/**
 * Settings of an authored block: the live component's data-dcep imageBaseUrl and whether
 * Economy (lounge purchase) is offered.
 * @param {Object} config result of readConfigRows
 */
export function readLoungeFinderSettings(config) {
  const text = (...keys) => (pick(config, ...keys) || {}).text || '';
  const purchase = text('lounge-purchase', 'economy');
  return {
    imageBase: text('image-base', 'image-base-url', 'imagebaseurl') || DEFAULT_IMAGE_BASE,
    purchase: !/^(n|no|off|false|nein|0)$/i.test(purchase),
  };
}

/** The status options of the select (Economy only with lounge purchase). */
export function loungeStatuses(settings) {
  return LOUNGE_STATUSES.filter((s) => settings.purchase || s.id !== 'ECO');
}

/**
 * Labels and cities, the data the form needs.
 * @returns {Promise<{labels: Object, cities: Array<{code: string, name: string}>,
 *   sources: Object<string, string>}>}
 */
export async function loadLoungeFinderContext(locale) {
  const sources = {};
  const [labelResult, cities] = await Promise.all([
    fetchLabels(['loungefinder'], locale),
    fetchRequest(loungeCitiesRequest(), locale, { exact: true })
      .then(({ data, source }) => {
        sources.cities = source;
        return mapLoungeCities(data);
      })
      .catch(() => {
        sources.cities = 'none';
        return [];
      }),
  ]);
  sources.labels = labelResult.sources.loungefinder;
  return { labels: labelResult.labels, cities, sources };
}

/**
 * Lounges for a search, like the live saga: catalogs/lounges/{status}/{city}; for Economy the
 * BUS lounges Yilu sells, with price and purchase link.
 * @param {{status: string, city: string}} query
 * @param {Object} locale result of getLocale()
 * @param {{imageBase: string}} settings
 * @returns {Promise<{lounges: Array, sources: Object<string, string>, primary: string[]}>}
 */
export async function loadLounges({ status, city }, locale, settings) {
  const sources = {};
  const economy = status === 'ECO';
  const primary = economy ? ['products', 'lounges'] : ['lounges'];
  let offers;
  let airport = city;
  if (economy) {
    try {
      ({ products: offers, airport } = await loadProducts(city));
      sources.products = 'live';
    } catch (e) {
      sources.products = 'none';
      return { lounges: [], sources, primary };
    }
    if (!offers.size) return { lounges: [], sources, primary };
  }
  let lounges = [];
  try {
    const request = loungesRequest({ status: economy ? 'BUS' : status, city });
    const { data, source } = await fetchRequest(request, locale, { exact: true });
    sources.lounges = source;
    await damPathReady();
    lounges = mapLounges(data, settings.imageBase);
  } catch (e) {
    sources.lounges = 'none';
  }
  if (economy) {
    lounges = lounges.map((l) => {
      const yiluId = LOUNGE_YILU_IDS[l.id];
      const offer = yiluId && offers.get(yiluId);
      if (!offer) return null;
      return {
        ...l,
        price: offer.price,
        currency: offer.currency,
        purchaseUrl: loungePurchaseUrl(yiluId, airport),
      };
    }).filter(Boolean);
  }
  return { lounges, sources, primary };
}

/**
 * Status preselected by a deep link (?status=SEN&city=FRA&cabin=BUS, the live "prefilled"
 * state): a cabin with a lower or basic status searches the cabin (Jt of 4ca8ff36.chunk.js).
 */
export function prefillStatus(status, cabin) {
  const s = String(status || '').toUpperCase();
  const c = String(cabin || '').toUpperCase();
  let mapped;
  if (c === 'BUS') mapped = ({ BASE: c, FTL: c, STA: 'STA' })[s] || s;
  else if (c === 'FIR') mapped = s === 'HON' ? s : c;
  return mapped || s || c;
}

/* ------------------------------------------------------------------------------------------- */
/* Labels: authored row, then the live label (labels/loungefinder), then the built-in default   */
/* ------------------------------------------------------------------------------------------- */

const P = 'loungefinder.';
const LIVE_KEYS = {
  heading: `${P}form.headline.redesignHeadlineText`,
  'city label': `${P}form.city.placeholder`,
  'city placeholder': `${P}form.city.placeholder`,
  'status label': `${P}form.status.placeholder`,
  'class group label': `${P}form.status.groupclass`,
  'status group label': `${P}form.status.groupcard`,
  'submit label': `${P}form.submit.cta`,
  'city required label': `${P}form.city.error.required`,
  'status required label': `${P}form.status.error.required`,
  'results label': `${P}form.response.results.label`,
  'results found label': `${P}form.response.results`,
  'no results label': `${P}form.response.empty`,
  'opening hours label': `${P}results.details.openingHours`,
  'location label': `${P}results.details.location`,
  'amenities label': `${P}results.details.amenities`,
  'show amenities label': `${P}results.details.amenities.showCta`,
  'hide amenities label': `${P}results.details.amenities.hideCta`,
  'closed label': `${P}results.details.loungeClosed`,
  'and label': `${P}results.details.loungeOpeningHoursJoinAnd`,
  'weekend label': `${P}results.details.weekend`,
  'price prefix label': `${P}results.purchase.price.prefix`,
  'price label': `${P}results.purchase.price`,
  'purchase label': `${P}results.purchase.purchaseCta`,
  'lounge type label': `${P}results.details.loungeType`,
};
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
DAYS.forEach((day) => { LIVE_KEYS[`${day} label`] = `${P}results.details.${day}`; });
LOUNGE_STATUSES.forEach(({ id }) => { LIVE_KEYS[`status ${id}`] = `${P}form.status.${id}`; });

/** Built-in strings (the recorded labels of de/en and de/de) for a label that never loads. */
const DEFAULT_LABELS = {
  en: {
    heading: 'Find your airport lounge',
    'city label': 'City',
    'city placeholder': 'City',
    'status label': 'Travel Class or Frequent Flyer Status',
    'class group label': 'Travel Class',
    'status group label': 'Frequent Flyer Status',
    'submit label': 'Search lounges',
    'city required label': 'City is required',
    'status required label': 'Travel Class or Travel Status is required',
    'results label': 'Results',
    'results found label': 'List of lounges found is now displayed',
    'no results label': 'Unfortunately, no lounge is available for the selected search criteria.',
    'no cities label': 'No matching city',
    'loading label': 'Loading',
    'opening hours label': 'Opening hours',
    'location label': 'Location',
    'amenities label': 'Lounge amenities',
    'show amenities label': 'View amenities',
    'hide amenities label': 'Back to overview',
    'closed label': 'closed',
    'and label': 'and',
    'weekend label': 'Weekend',
    'price prefix label': 'from',
    'price label': '{PRICE} {CURRENCY}',
    'purchase label': 'Purchase Lounge Access',
    'lounge type label': '{LOUNGETYPE}',
    'monday label': 'Monday',
    'tuesday label': 'Tuesday',
    'wednesday label': 'Wednesday',
    'thursday label': 'Thursday',
    'friday label': 'Friday',
    'saturday label': 'Saturday',
    'sunday label': 'Sunday',
    'status FIR': 'First Class',
    'status BUS': 'Business Class',
    'status ECO': 'Economy',
    'status HON': 'HON Circle Member',
    'status SEN': 'Senator',
    'status FTL': 'Frequent Traveller',
    'status STA': 'Star Alliance Gold',
  },
  de: {
    heading: 'Finden Sie Ihre Lounge',
    'city label': 'Stadt',
    'city placeholder': 'Stadt',
    'status label': 'Reiseklasse oder Vielfliegerstatus',
    'class group label': 'Reiseklasse',
    'status group label': 'Vielfliegerstatus',
    'submit label': 'Lounge finden',
    'city required label': 'Stadt ist erforderlich',
    'status required label': 'Reiseklasse oder Reisestatus ist erforderlich',
    'results label': 'Ergebnisse',
    'results found label': 'Liste der gefundenen Lounges wird angezeigt',
    'no results label': 'Leider haben wir keine Informationen über Lounges in der von Ihnen ausgewählten Stadt.',
    'no cities label': 'Keine passende Stadt',
    'loading label': 'Wird geladen',
    'opening hours label': 'Öffnungszeiten',
    'location label': 'Lage',
    'amenities label': 'Lounge Annehmlichkeiten',
    'show amenities label': 'Ausstattung anzeigen',
    'hide amenities label': 'Zurück zur Übersicht',
    'closed label': 'geschlossen',
    'and label': 'and',
    'weekend label': 'Wochenende',
    'price prefix label': 'from',
    'price label': '{PRICE} {CURRENCY}',
    'purchase label': 'Purchase Lounge Access',
    'lounge type label': '{LOUNGETYPE}',
    'monday label': 'Montag',
    'tuesday label': 'Dienstag',
    'wednesday label': 'Mittwoch',
    'thursday label': 'Donnerstag',
    'friday label': 'Freitag',
    'saturday label': 'Samstag',
    'sunday label': 'Sonntag',
    'status FIR': 'First Class',
    'status BUS': 'Business Class',
    'status ECO': 'Economy',
    'status HON': 'HON Circle Member',
    'status SEN': 'Senator',
    'status FTL': 'Frequent Traveller',
    'status STA': 'Star Alliance Gold',
  },
  fr: {
    heading: 'Trouvez votre salon d’aéroport',
    'city label': 'Ville',
    'city placeholder': 'Ville',
    'status label': 'Classe de voyage ou statut de voyageur fréquent',
    'class group label': 'Classe de voyage',
    'status group label': 'Statut de voyageur fréquent',
    'submit label': 'Rechercher des salons',
    'city required label': 'Veuillez indiquer une ville',
    'status required label': 'Veuillez indiquer une classe de voyage ou un statut',
    'results label': 'Résultats',
    'results found label': 'La liste des salons trouvés est affichée',
    'no results label': 'Nous sommes désolés, aucun salon n\'est disponible pour les critères de recherche sélectionnés.',
    'no cities label': 'Aucune ville correspondante',
    'loading label': 'Chargement en cours',
    'opening hours label': 'Horaires d’ouverture',
    'location label': 'Emplacement',
    'amenities label': 'Services du salon',
    'show amenities label': 'Voir les services',
    'hide amenities label': 'Retour à l’aperçu',
    'closed label': 'fermé',
    'and label': 'et',
    'weekend label': 'Week-end',
    'price prefix label': 'à partir de',
    'price label': '{PRICE} {CURRENCY}',
    'purchase label': 'Acheter l’accès au salon',
    'lounge type label': '{LOUNGETYPE}',
    'monday label': 'Lundi',
    'tuesday label': 'Mardi',
    'wednesday label': 'Mercredi',
    'thursday label': 'Jeudi',
    'friday label': 'Vendredi',
    'saturday label': 'Samedi',
    'sunday label': 'Dimanche',
    'status FIR': 'First Class',
    'status BUS': 'Business Class',
    'status ECO': 'Economy',
    'status HON': 'HON Circle Member',
    'status SEN': 'Senator',
    'status FTL': 'Frequent Traveller',
    'status STA': 'Star Alliance Gold',
  },
  es: {
    heading: 'Encuentre su sala VIP en el aeropuerto',
    'city label': 'Ciudad',
    'city placeholder': 'Ciudad',
    'status label': 'Clase de viaje o nivel de viajero frecuente',
    'class group label': 'Clase de viaje',
    'status group label': 'Nivel viajero frecuente',
    'submit label': 'Buscar salas VIP',
    'city required label': 'Indique una ciudad',
    'status required label': 'Indique una clase de viaje o un nivel',
    'results label': 'Resultados',
    'results found label': 'Se muestra la lista de salas VIP encontradas',
    'no results label': 'Lamentablemente, no tenemos ninguna información sobre lounges en la ciudad que ha seleccionado.',
    'no cities label': 'Ninguna ciudad coincide',
    'loading label': 'Cargando',
    'opening hours label': 'Horario de apertura',
    'location label': 'Localización',
    'amenities label': 'Servicios de los que dispone la Sala VIP',
    'show amenities label': 'Ver servicios',
    'hide amenities label': 'Volver a la vista general',
    'closed label': 'cerrado',
    'and label': 'y',
    'weekend label': 'Fin de semana',
    'price prefix label': 'desde',
    'price label': '{PRICE} {CURRENCY}',
    'purchase label': 'Comprar acceso a la sala VIP',
    'lounge type label': '{LOUNGETYPE}',
    'monday label': 'Lunes',
    'tuesday label': 'Martes',
    'wednesday label': 'Miércoles',
    'thursday label': 'Jueves',
    'friday label': 'Viernes',
    'saturday label': 'Sábado',
    'sunday label': 'Domingo',
    'status FIR': 'First Class',
    'status BUS': 'Business Class',
    'status ECO': 'Economy',
    'status HON': 'HON Circle Member',
    'status SEN': 'Senator',
    'status FTL': 'Frequent Traveller',
    'status STA': 'Star Alliance Gold',
  },
  el: {
    heading: 'Βρείτε το lounge του αεροδρομίου σας',
    'city label': 'Πόλη',
    'city placeholder': 'Πόλη',
    'status label': 'Θέση ταξιδιού ή status συχνού επιβάτη',
    'class group label': 'Θέση ταξιδιού',
    'status group label': 'Status συχνού επιβάτη',
    'submit label': 'Αναζήτηση lounges',
    'city required label': 'Η πόλη είναι υποχρεωτική',
    'status required label': 'Η θέση ταξιδιού ή το status είναι υποχρεωτικά',
    'results label': 'Αποτελέσματα',
    'results found label': 'Εμφανίζεται η λίστα με τα lounges που βρέθηκαν',
    'no results label': 'Δυστυχώς, δεν υπάρχει διαθέσιμο lounge για τα επιλεγμένα κριτήρια αναζήτησης.',
    'no cities label': 'Δεν βρέθηκε πόλη',
    'loading label': 'Φόρτωση',
    'opening hours label': 'Ώρες λειτουργίας',
    'location label': 'Τοποθεσία',
    'amenities label': 'Παροχές lounge',
    'show amenities label': 'Προβολή παροχών',
    'hide amenities label': 'Επιστροφή στην επισκόπηση',
    'closed label': 'κλειστό',
    'and label': 'και',
    'weekend label': 'Σαββατοκύριακο',
    'price prefix label': 'από',
    'price label': '{PRICE} {CURRENCY}',
    'purchase label': 'Αγορά πρόσβασης στο lounge',
    'lounge type label': '{LOUNGETYPE}',
    'monday label': 'Δευτέρα',
    'tuesday label': 'Τρίτη',
    'wednesday label': 'Τετάρτη',
    'thursday label': 'Πέμπτη',
    'friday label': 'Παρασκευή',
    'saturday label': 'Σάββατο',
    'sunday label': 'Κυριακή',
    'status FIR': 'First Class',
    'status BUS': 'Business Class',
    'status ECO': 'Economy',
    'status HON': 'HON Circle Member',
    'status SEN': 'Senator',
    'status FTL': 'Frequent Traveller',
    'status STA': 'Star Alliance Gold',
  },
  it: {
    heading: 'Trovi la lounge del suo aeroporto',
    'city label': 'Città',
    'city placeholder': 'Città',
    'status label': 'Classe di viaggio o status frequent flyer',
    'class group label': 'Classe di viaggio',
    'status group label': 'Status frequent flyer',
    'submit label': 'Cerca lounge',
    'city required label': 'La città è obbligatoria',
    'status required label': 'La classe di viaggio o lo status sono obbligatori',
    'results label': 'Risultati',
    'results found label': 'Viene visualizzato l’elenco delle lounge trovate',
    'no results label': 'Purtroppo non è disponibile alcuna lounge per i criteri di ricerca selezionati.',
    'no cities label': 'Nessuna città corrispondente',
    'loading label': 'Caricamento',
    'opening hours label': 'Orari di apertura',
    'location label': 'Posizione',
    'amenities label': 'Servizi della lounge',
    'show amenities label': 'Vedi i servizi',
    'hide amenities label': 'Torna alla panoramica',
    'closed label': 'chiuso',
    'and label': 'e',
    'weekend label': 'Fine settimana',
    'price prefix label': 'da',
    'price label': '{PRICE} {CURRENCY}',
    'purchase label': 'Acquista l’accesso alla lounge',
    'lounge type label': '{LOUNGETYPE}',
    'monday label': 'Lunedì',
    'tuesday label': 'Martedì',
    'wednesday label': 'Mercoledì',
    'thursday label': 'Giovedì',
    'friday label': 'Venerdì',
    'saturday label': 'Sabato',
    'sunday label': 'Domenica',
    'status FIR': 'First Class',
    'status BUS': 'Business Class',
    'status ECO': 'Economy',
    'status HON': 'HON Circle Member',
    'status SEN': 'Senator',
    'status FTL': 'Frequent Traveller',
    'status STA': 'Star Alliance Gold',
  },
  ja: {
    heading: '空港ラウンジを探す',
    'city label': '都市',
    'city placeholder': '都市',
    'status label': '搭乗クラスまたはフリークエントフライヤーステータス',
    'class group label': '搭乗クラス',
    'status group label': 'フリークエントフライヤーステータス',
    'submit label': 'ラウンジを検索',
    'city required label': '都市を入力してください',
    'status required label': '搭乗クラスまたはステータスを選択してください',
    'results label': '結果',
    'results found label': '見つかったラウンジの一覧を表示しています',
    'no results label': '申し訳ございませんが、選択した検索条件に該当するラウンジはありません。',
    'no cities label': '該当する都市がありません',
    'loading label': '読み込み中',
    'opening hours label': '営業時間',
    'location label': '場所',
    'amenities label': 'ラウンジの設備',
    'show amenities label': '設備を見る',
    'hide amenities label': '一覧に戻る',
    'closed label': '閉鎖',
    'and label': 'および',
    'weekend label': '週末',
    'price prefix label': '最低価格',
    'price label': '{PRICE} {CURRENCY}',
    'purchase label': 'ラウンジ利用券を購入',
    'lounge type label': '{LOUNGETYPE}',
    'monday label': '月曜日',
    'tuesday label': '火曜日',
    'wednesday label': '水曜日',
    'thursday label': '木曜日',
    'friday label': '金曜日',
    'saturday label': '土曜日',
    'sunday label': '日曜日',
    'status FIR': 'ファーストクラス',
    'status BUS': 'ビジネスクラス',
    'status ECO': 'エコノミー',
    'status HON': 'HON Circle Member',
    'status SEN': 'Senator',
    'status FTL': 'Frequent Traveller',
    'status STA': 'Star Alliance Gold',
  },
  ko: {
    heading: '공항 라운지 찾기',
    'city label': '도시',
    'city placeholder': '도시',
    'status label': '탑승 클래스 또는 상용 고객 등급',
    'class group label': '탑승 클래스',
    'status group label': '상용 고객 등급',
    'submit label': '라운지 검색',
    'city required label': '도시를 입력해 주세요',
    'status required label': '탑승 클래스 또는 등급을 선택해 주세요',
    'results label': '결과',
    'results found label': '검색된 라운지 목록이 표시됩니다',
    'no results label': '죄송하지만 선택한 검색 조건에 맞는 라운지가 없습니다.',
    'no cities label': '일치하는 도시가 없습니다',
    'loading label': '불러오는 중',
    'opening hours label': '운영 시간',
    'location label': '위치',
    'amenities label': '라운지 편의 시설',
    'show amenities label': '편의 시설 보기',
    'hide amenities label': '개요로 돌아가기',
    'closed label': '휴무',
    'and label': '및',
    'weekend label': '주말',
    'price prefix label': '최저',
    'price label': '{PRICE} {CURRENCY}',
    'purchase label': '라운지 이용권 구매',
    'lounge type label': '{LOUNGETYPE}',
    'monday label': '월요일',
    'tuesday label': '화요일',
    'wednesday label': '수요일',
    'thursday label': '목요일',
    'friday label': '금요일',
    'saturday label': '토요일',
    'sunday label': '일요일',
    'status FIR': '퍼스트 클래스',
    'status BUS': '비즈니스 클래스',
    'status ECO': '이코노미',
    'status HON': 'HON Circle Member',
    'status SEN': 'Senator',
    'status FTL': 'Frequent Traveller',
    'status STA': 'Star Alliance Gold',
  },
  nl: {
    heading: 'Vind uw luchthavenlounge',
    'city label': 'Stad',
    'city placeholder': 'Stad',
    'status label': 'Reisklasse of frequent flyer-status',
    'class group label': 'Reisklasse',
    'status group label': 'Frequent flyer-status',
    'submit label': 'Lounges zoeken',
    'city required label': 'Stad is verplicht',
    'status required label': 'Reisklasse of status is verplicht',
    'results label': 'Resultaten',
    'results found label': 'De lijst met gevonden lounges wordt nu weergegeven',
    'no results label': 'Helaas is er geen lounge beschikbaar voor de gekozen zoekcriteria.',
    'no cities label': 'Geen overeenkomende stad',
    'loading label': 'Laden',
    'opening hours label': 'Openingstijden',
    'location label': 'Locatie',
    'amenities label': 'Voorzieningen van de lounge',
    'show amenities label': 'Voorzieningen bekijken',
    'hide amenities label': 'Terug naar het overzicht',
    'closed label': 'gesloten',
    'and label': 'en',
    'weekend label': 'Weekend',
    'price prefix label': 'vanaf',
    'price label': '{PRICE} {CURRENCY}',
    'purchase label': 'Loungetoegang kopen',
    'lounge type label': '{LOUNGETYPE}',
    'monday label': 'Maandag',
    'tuesday label': 'Dinsdag',
    'wednesday label': 'Woensdag',
    'thursday label': 'Donderdag',
    'friday label': 'Vrijdag',
    'saturday label': 'Zaterdag',
    'sunday label': 'Zondag',
    'status FIR': 'First Class',
    'status BUS': 'Business Class',
    'status ECO': 'Economy',
    'status HON': 'HON Circle Member',
    'status SEN': 'Senator',
    'status FTL': 'Frequent Traveller',
    'status STA': 'Star Alliance Gold',
  },
  pl: {
    heading: 'Znajdź salonik na lotnisku',
    'city label': 'Miasto',
    'city placeholder': 'Miasto',
    'status label': 'Klasa podróży lub status w programie lojalnościowym',
    'class group label': 'Klasa podróży',
    'status group label': 'Status w programie lojalnościowym',
    'submit label': 'Szukaj saloników',
    'city required label': 'Miasto jest wymagane',
    'status required label': 'Klasa podróży lub status są wymagane',
    'results label': 'Wyniki',
    'results found label': 'Wyświetlana jest lista znalezionych saloników',
    'no results label': 'Niestety nie ma dostępnego saloniku dla wybranych kryteriów wyszukiwania.',
    'no cities label': 'Brak pasującego miasta',
    'loading label': 'Wczytywanie',
    'opening hours label': 'Godziny otwarcia',
    'location label': 'Lokalizacja',
    'amenities label': 'Udogodnienia saloniku',
    'show amenities label': 'Zobacz udogodnienia',
    'hide amenities label': 'Powrót do przeglądu',
    'closed label': 'zamknięty',
    'and label': 'i',
    'weekend label': 'Weekend',
    'price prefix label': 'od',
    'price label': '{PRICE} {CURRENCY}',
    'purchase label': 'Kup dostęp do saloniku',
    'lounge type label': '{LOUNGETYPE}',
    'monday label': 'Poniedziałek',
    'tuesday label': 'Wtorek',
    'wednesday label': 'Środa',
    'thursday label': 'Czwartek',
    'friday label': 'Piątek',
    'saturday label': 'Sobota',
    'sunday label': 'Niedziela',
    'status FIR': 'First Class',
    'status BUS': 'Business Class',
    'status ECO': 'Economy',
    'status HON': 'HON Circle Member',
    'status SEN': 'Senator',
    'status FTL': 'Frequent Traveller',
    'status STA': 'Star Alliance Gold',
  },
  pt: {
    heading: 'Encontre o seu lounge no aeroporto',
    'city label': 'Cidade',
    'city placeholder': 'Cidade',
    'status label': 'Classe de viagem ou estatuto de passageiro frequente',
    'class group label': 'Classe de viagem',
    'status group label': 'Estatuto de passageiro frequente',
    'submit label': 'Pesquisar lounges',
    'city required label': 'A cidade é obrigatória',
    'status required label': 'A classe de viagem ou o estatuto é obrigatório',
    'results label': 'Resultados',
    'results found label': 'É apresentada a lista dos lounges encontrados',
    'no results label': 'Infelizmente, não há nenhum lounge disponível para os critérios de pesquisa selecionados.',
    'no cities label': 'Nenhuma cidade correspondente',
    'loading label': 'A carregar',
    'opening hours label': 'Horário de funcionamento',
    'location label': 'Localização',
    'amenities label': 'Comodidades do lounge',
    'show amenities label': 'Ver comodidades',
    'hide amenities label': 'Voltar à vista geral',
    'closed label': 'fechado',
    'and label': 'e',
    'weekend label': 'Fim de semana',
    'price prefix label': 'desde',
    'price label': '{PRICE} {CURRENCY}',
    'purchase label': 'Comprar acesso ao lounge',
    'lounge type label': '{LOUNGETYPE}',
    'monday label': 'Segunda-feira',
    'tuesday label': 'Terça-feira',
    'wednesday label': 'Quarta-feira',
    'thursday label': 'Quinta-feira',
    'friday label': 'Sexta-feira',
    'saturday label': 'Sábado',
    'sunday label': 'Domingo',
    'status FIR': 'First Class',
    'status BUS': 'Business Class',
    'status ECO': 'Economy',
    'status HON': 'HON Circle Member',
    'status SEN': 'Senator',
    'status FTL': 'Frequent Traveller',
    'status STA': 'Star Alliance Gold',
  },
  ru: {
    heading: 'Найдите бизнес-зал в аэропорту',
    'city label': 'Город',
    'city placeholder': 'Город',
    'status label': 'Класс обслуживания или статус часто летающего пассажира',
    'class group label': 'Класс обслуживания',
    'status group label': 'Статус часто летающего пассажира',
    'submit label': 'Найти бизнес-залы',
    'city required label': 'Укажите город',
    'status required label': 'Укажите класс обслуживания или статус',
    'results label': 'Результаты',
    'results found label': 'Отображается список найденных бизнес-залов',
    'no results label': 'К сожалению, по выбранным критериям поиска бизнес-залов нет.',
    'no cities label': 'Подходящий город не найден',
    'loading label': 'Загрузка',
    'opening hours label': 'Часы работы',
    'location label': 'Расположение',
    'amenities label': 'Удобства бизнес-зала',
    'show amenities label': 'Посмотреть удобства',
    'hide amenities label': 'Назад к обзору',
    'closed label': 'закрыт',
    'and label': 'и',
    'weekend label': 'Выходные',
    'price prefix label': 'от',
    'price label': '{PRICE} {CURRENCY}',
    'purchase label': 'Купить доступ в бизнес-зал',
    'lounge type label': '{LOUNGETYPE}',
    'monday label': 'Понедельник',
    'tuesday label': 'Вторник',
    'wednesday label': 'Среда',
    'thursday label': 'Четверг',
    'friday label': 'Пятница',
    'saturday label': 'Суббота',
    'sunday label': 'Воскресенье',
    'status FIR': 'First Class',
    'status BUS': 'Business Class',
    'status ECO': 'Economy',
    'status HON': 'HON Circle Member',
    'status SEN': 'Senator',
    'status FTL': 'Frequent Traveller',
    'status STA': 'Star Alliance Gold',
  },
  zh: {
    heading: '查找机场休息室',
    'city label': '城市',
    'city placeholder': '城市',
    'status label': '舱位等级或常旅客会员级别',
    'class group label': '舱位等级',
    'status group label': '常旅客会员级别',
    'submit label': '搜索休息室',
    'city required label': '请输入城市',
    'status required label': '请选择舱位等级或会员级别',
    'results label': '结果',
    'results found label': '现在显示找到的休息室列表',
    'no results label': '很抱歉，没有符合所选搜索条件的休息室。',
    'no cities label': '没有匹配的城市',
    'loading label': '正在加载',
    'opening hours label': '开放时间',
    'location label': '位置',
    'amenities label': '休息室设施',
    'show amenities label': '查看设施',
    'hide amenities label': '返回概览',
    'closed label': '关闭',
    'and label': '和',
    'weekend label': '周末',
    'price prefix label': '起价',
    'price label': '{PRICE} {CURRENCY}',
    'purchase label': '购买休息室使用权',
    'lounge type label': '{LOUNGETYPE}',
    'monday label': '星期一',
    'tuesday label': '星期二',
    'wednesday label': '星期三',
    'thursday label': '星期四',
    'friday label': '星期五',
    'saturday label': '星期六',
    'sunday label': '星期日',
    'status FIR': '头等舱',
    'status BUS': '商务舱',
    'status ECO': '经济舱',
    'status HON': 'HON Circle Member',
    'status SEN': 'Senator',
    'status FTL': 'Frequent Traveller',
    'status STA': 'Star Alliance Gold',
  },
};

/** Feature codes whose live label key differs (FAX_MACHINE → ...feature.FAXMACHINE). */
const FEATURE_LABEL_KEYS = { FAX_MACHINE: 'FAXMACHINE' };

/**
 * Label lookup of a block: authored row ("Submit label | Search"), live label, default.
 * Moment day placeholders ({dddd}) of the live strings are dropped: the day is its own column.
 */
export function loungeLabels(config, lang, live = {}) {
  const defaults = DEFAULT_LABELS[lang] || DEFAULT_LABELS.en;
  const label = (key, values = {}) => {
    const authored = config[toConfigKey(key)];
    const text = (authored && authored.text) || live[LIVE_KEYS[key]] || defaults[key] || '';
    return fillLabel(text.replace(/\{d{2,4}\}\s*/g, ''), values);
  };
  const humanize = (code) => code.toLowerCase().replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
  /** Feature or lounge category name (labels ...results.details.feature.{CODE}). */
  label.feature = (code) => {
    const authored = config[toConfigKey(`feature ${code}`)];
    return (authored && authored.text)
      || live[`${P}results.details.feature.${FEATURE_LABEL_KEYS[code] || code}`] || humanize(code);
  };
  return label;
}

/* ------------------------------------------------------------------------------------------- */
/* Rendering                                                                                    */
/* ------------------------------------------------------------------------------------------- */

const ICON_PATHS = {
  location: 'M12 21s7-6.2 7-12A7 7 0 0 0 5 9c0 5.8 7 12 7 12zM12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  wifi: 'M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01',
  shower: 'M5 21V8a4 4 0 0 1 8 0M10 8h6M11 12v1M14 12v1M17 12v1M11 16v1M14 16v1M17 16v1',
  tv: 'M3 6h18v11H3zM8 21h8M12 17v4',
  power: 'M9 3v5M15 3v5M7 8h10v4a5 5 0 0 1-10 0zM12 17v4',
  news: 'M4 5h13v14H6a2 2 0 0 1-2-2zM17 9h3v8a2 2 0 0 1-2 2M7 9h7M7 13h7M7 16h4',
  magazine: 'M5 3h11l3 3v15H5zM8 8h8M8 12h8M8 16h5',
  printer: 'M7 9V3h10v6M7 17H4V9h16v8h-3M7 14h10v7H7z',
  cutlery: 'M7 3v18M4 3v5a3 3 0 0 0 6 0V3M17 21V3c-2 1-3 4-3 8h3',
  bed: 'M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5M7 11.5h.01',
  wheelchair: 'M11 4h.01M9 8l1 6h6l2 5M10 11h5M8 12a5 5 0 1 0 6 6',
  airport: 'M10 21l2-1 2 1v-2l-1.5-1.5V13l8 3v-2l-8-5V4.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-3v4.5L10 19z',
  lounge: 'M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3M3 13a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v5H3zM5 18v2M19 18v2',
  people: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 6',
  key: 'M10 14a4 4 0 1 1 2.8-1.2L20 20M17 17l2-2',
  child: 'M12 5a6 6 0 0 0-6 6v3a6 6 0 0 0 12 0v-3a6 6 0 0 0-6-6zM8 6a2 2 0 1 0-3 2M16 6a2 2 0 1 1 3 2M10 10h.01M14 10h.01M10.5 14h3',
  flower: 'M12 8a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 3v5M12 14v7M7 6l3 3M17 6l-3 3M5 11h4M15 11h4',
  smoking: 'M3 14h13v3H3zM19 14v3M21 14v3M19 10c0-2-2-2-2-4',
  'no-smoking': 'M3 14h13v3H3zM19 14v3M21 14v3M19 10c0-2-2-2-2-4M4 4l16 16',
  documents: 'M8 3h8l4 4v11H8zM16 3v4h4M4 7v14h11',
  phone: 'M8 2h8v20H8zM11 18h2',
  restroom: 'M7 4v.01M5 8h4v6H8v7H6v-7H5zM17 4v.01M17 8l-3 7h2v6h2v-6h2zM12 3v18',
  workstation: 'M3 5h18v11H3zM2 19h20',
  support: 'M4 13v-1a8 8 0 0 1 16 0v1M4 13h3v5H4zM17 13h3v5h-3z',
  screen: 'M3 5h18v12H3zM9 21h6M8 11l3 3 5-5',
  feature: 'M5 12.5l4.5 4.5L19 7.5',
};

/** Live icon of a lounge feature (Oo of 80873942.chunk.js) mapped to the drawings above. */
const FEATURE_ICONS = {
  ACCESSIBILITY: 'wheelchair',
  AIRSIDE: 'airport',
  BUSINESS_LOUNGE: 'lounge',
  CC_PHONE: 'phone',
  CHILDREN_AREA: 'child',
  CONTRACT_LOUNGE: 'lounge',
  COPY_MACHINE: 'documents',
  DATAPORT_FOR_LAPTOPS: 'power',
  FAX_MACHINE: 'printer',
  FIRST_CLASS_LOUNGE: 'lounge',
  FIRST_CLASS_TERMINAL: 'airport',
  FREE_LOCAL_TELEPHONE_CALLS: 'phone',
  GERMAN_MAGAZINES: 'magazine',
  GERMAN_NEWS: 'news',
  INTERNATIONAL_MAGAZINES: 'magazine',
  INTERNATIONAL_NEWS: 'news',
  INTERNET_ACCESS: 'screen',
  LOCAL_MAGAZINES: 'magazine',
  LOCAL_NEWS: 'news',
  LOCKERS: 'key',
  MAM_PRINTER: 'printer',
  MEETING_ROOM: 'people',
  NON_SMOKING: 'no-smoking',
  OFFICE_UNIT: 'support',
  PARTNER_LOUNGE: 'lounge',
  PREFLIGHT_DINNER: 'cutlery',
  PRINTER: 'printer',
  RELAXING: 'flower',
  RESTROOM: 'restroom',
  SENATOR_LOUNGE: 'lounge',
  SHOWER: 'shower',
  SLEEPING_AREA: 'bed',
  SMOOKING_ROOM: 'smoking',
  SOCKETS_EU: 'power',
  SOCKETS_UK: 'power',
  SOCKETS_US: 'power',
  SOCKETS_USB: 'power',
  SPA: 'flower',
  TV: 'tv',
  WLAN: 'wifi',
  WORKSTATION_AREA: 'workstation',
};

let instanceCount = 0;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function icon(name) {
  const span = el('span', `lounge-finder-icon lounge-finder-icon-${name}`);
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="${ICON_PATHS[name] || ICON_PATHS.feature}"/></svg>`;
  return span;
}

const sameTimes = (days) => days.every((d) => JSON.stringify(d) === JSON.stringify(days[0]));
const allClosed = (days) => days.every((d) => !d.length);

/**
 * Rows of the opening hours table like the live card (dl of 5689dcbf.chunk.js): Monday to
 * Friday in one row when they are alike (or all closed), else one row per day; the same for
 * Saturday and Sunday ("Weekend").
 * @returns {Array<{day: string, times: Array<{from: string, to: string}>}>} times [] = closed
 */
export function openingRows(week, label) {
  const names = DAYS.map((d) => label(`${d} label`));
  const group = (days, offset, name) => {
    if (allClosed(days) || sameTimes(days)) return [{ day: name, times: days[0] }];
    return days.map((times, i) => ({ day: names[offset + i], times }));
  };
  return [
    ...group(week.slice(0, 5), 0, `${names[0]} - ${names[4]}`),
    ...group(week.slice(5, 7), 5, label('weekend label')),
  ];
}

function renderDetails(lounge, label) {
  const details = el('div', 'lounge-finder-details');
  if (lounge.category) {
    details.append(el('span', 'lounge-finder-badge', label('lounge type label', { LOUNGETYPE: label.feature(lounge.category) })));
  }
  details.append(el('h3', 'lounge-finder-name', lounge.name));

  const where = el('div', 'lounge-finder-location');
  where.append(icon('location'));
  const lines = el('ul');
  lines.setAttribute('aria-label', label('location label'));
  const { location: loc } = lounge;
  if (typeof loc === 'object') {
    lines.append(el('li', 'lounge-finder-strong', [lounge.airportName, loc.terminal].filter(Boolean).join(', ')));
    if (loc.level) lines.append(el('li', '', loc.level));
    if (loc.gateInfo) lines.append(el('li', '', loc.gateInfo));
  } else {
    if (lounge.airportName) lines.append(el('li', 'lounge-finder-strong', lounge.airportName));
    if (loc) lines.append(el('li', 'lounge-finder-strong', loc));
  }
  where.append(lines);
  details.append(where, el('hr', 'lounge-finder-divider'));

  const hours = el('div', 'lounge-finder-hours');
  hours.append(icon('clock'));
  if (lounge.week.length) {
    const table = el('table');
    table.setAttribute('aria-label', label('opening hours label'));
    const body = el('tbody');
    openingRows(lounge.week, label).forEach(({ day, times }) => {
      const tr = el('tr');
      const value = times.length
        ? times.map(({ from, to }) => `${from} - ${to}`).join(` ${label('and label')} `)
        : label('closed label');
      tr.append(el('td', '', day), el('td', '', value));
      body.append(tr);
    });
    table.append(body);
    hours.append(table);
  } else {
    hours.append(el('p', '', lounge.openingHours));
  }
  details.append(hours);
  if (lounge.description) details.append(el('p', 'lounge-finder-notice', lounge.description));
  return details;
}

function renderAmenities(lounge, label) {
  const amenities = el('div', 'lounge-finder-amenities');
  amenities.append(el('h4', 'lounge-finder-amenities-heading', label('amenities label')));
  const list = el('ul', 'lounge-finder-amenities-list');
  lounge.features.forEach((code) => {
    const li = el('li');
    li.append(icon(FEATURE_ICONS[code] || 'feature'), el('span', '', label.feature(code)));
    list.append(li);
  });
  amenities.append(list);
  return amenities;
}

function renderLounge(lounge, label, uid, index) {
  const li = el('li', 'lounge-finder-item');
  const card = el('article', 'lounge-finder-card');
  card.dataset.view = 'details';
  card.dataset.loungeId = lounge.id;

  const media = el('div', 'lounge-finder-image');
  const img = el('img');
  img.alt = lounge.name;
  img.loading = 'lazy';
  if (lounge.srcset) {
    img.srcset = lounge.srcset;
    img.sizes = '(width >= 1025px) 350px, 100vw';
  }
  img.src = lounge.image || lounge.fallbackImage;
  img.addEventListener('error', () => {
    if (img.dataset.fallback) {
      img.remove();
      return;
    }
    img.dataset.fallback = 'true';
    img.removeAttribute('srcset');
    img.src = lounge.fallbackImage;
  });
  media.append(img);

  const content = el('div', 'lounge-finder-content');
  const top = el('div', 'lounge-finder-content-top');
  const details = renderDetails(lounge, label);
  details.id = `${uid}-details-${index}`;
  top.append(details);
  let amenities;
  if (lounge.features.length) {
    amenities = renderAmenities(lounge, label);
    amenities.id = `${uid}-amenities-${index}`;
    top.append(amenities);
  }
  content.append(top);

  if (lounge.purchaseUrl) {
    const buy = el('div', 'lounge-finder-purchase');
    const price = el('p');
    price.append(`${label('price prefix label')} `, el('strong', '', label('price label', { PRICE: lounge.price, CURRENCY: lounge.currency })));
    const link = el('a', 'button primary', label('purchase label'));
    link.href = lounge.purchaseUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    buy.append(price, link);
    content.append(buy);
  }

  if (amenities) {
    // below 1025px the card shows either the details or the amenities, like the live toggle
    const toggleWrap = el('div', 'lounge-finder-toggle');
    const toggle = el('button', 'button secondary', label('show amenities label'));
    toggle.type = 'button';
    toggle.setAttribute('aria-controls', `${details.id} ${amenities.id}`);
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', () => {
      const showAmenities = card.dataset.view !== 'amenities';
      card.dataset.view = showAmenities ? 'amenities' : 'details';
      toggle.textContent = label(showAmenities ? 'hide amenities label' : 'show amenities label');
      toggle.setAttribute('aria-expanded', String(showAmenities));
    });
    toggleWrap.append(toggle);
    content.append(toggleWrap);
  }

  card.append(media, content);
  li.append(card);
  return li;
}

function selectField(uid, statuses, label) {
  const field = el('div', 'lounge-finder-field lounge-finder-status');
  const id = `${uid}-status`;
  const labelEl = el('label', 'lounge-finder-label');
  labelEl.htmlFor = id;
  const select = el('select');
  select.id = id;
  select.name = 'status';
  select.required = true;
  const wrap = el('div', 'lounge-finder-select');
  wrap.append(select);
  const error = el('p', 'lounge-finder-error');
  error.id = `${id}-error`;
  error.hidden = true;
  field.append(labelEl, wrap, error);

  const render = () => {
    const value = select.value || '';
    labelEl.textContent = label('status label');
    const placeholder = el('option', '', label('status label'));
    placeholder.value = '';
    placeholder.disabled = true;
    const groups = ['class', 'card'].map((group) => {
      const optgroup = el('optgroup');
      optgroup.label = label(group === 'class' ? 'class group label' : 'status group label');
      statuses.filter((s) => s.group === group).forEach((s) => {
        const option = el('option', '', label(`status ${s.id}`));
        option.value = s.id;
        optgroup.append(option);
      });
      return optgroup;
    }).filter((g) => g.children.length);
    select.replaceChildren(placeholder, ...groups);
    select.value = value;
    placeholder.selected = !value;
  };
  return {
    field, select, error, render,
  };
}

function setError(input, error, text) {
  error.textContent = text || '';
  error.hidden = !text;
  if (text) {
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', error.id);
  } else {
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
  }
}

const fold = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim();

function readQuery() {
  try {
    return new URLSearchParams((window.location && window.location.search) || '');
  } catch (e) {
    return new URLSearchParams();
  }
}

export default function decorate(block) {
  instanceCount += 1;
  const uid = `lounge-finder-${instanceCount}`;
  const locale = getLocale();
  const config = readConfigRows(block);
  const settings = readLoungeFinderSettings(config);
  const statuses = loungeStatuses(settings);
  let label = loungeLabels(config, locale.lang);
  let cities = [];
  let sources = {};

  const form = el('form', 'lounge-finder-form');
  form.noValidate = true;
  const heading = el('h2', 'lounge-finder-heading');

  const cityField = el('div', 'lounge-finder-field lounge-finder-city');
  const combobox = createAirportCombobox({
    label: label('city label'),
    name: 'city',
    placeholder: label('city placeholder'),
    noResultsLabel: label('no cities label'),
    fetchSuggestions: async (term) => filterAirports(
      cities.map((c) => ({ ...c, label: c.name })),
      term,
    ),
  });
  const cityError = el('p', 'lounge-finder-error');
  cityError.id = `${uid}-city-error`;
  cityError.hidden = true;
  cityField.append(combobox.element, cityError);

  const status = selectField(uid, statuses, label);
  const actions = el('div', 'lounge-finder-actions');
  const submit = el('button', 'button primary lounge-finder-submit');
  submit.type = 'submit';
  actions.append(submit);

  const fields = el('div', 'lounge-finder-fields');
  fields.append(cityField, status.field, actions);
  form.append(heading, fields);

  const live = el('p', 'lounge-finder-sr-only');
  live.setAttribute('role', 'status');
  live.setAttribute('aria-live', 'polite');
  const results = el('div', 'lounge-finder-results');
  results.id = `${uid}-results`;

  const applyLabels = () => {
    heading.textContent = label('heading');
    submit.textContent = label('submit label');
    const cityLabel = combobox.element.querySelector('label');
    if (cityLabel) cityLabel.textContent = label('city label');
    combobox.input.placeholder = label('city placeholder');
    status.render();
  };
  applyLabels();

  // deep link: ?city=FRA&status=SEN (&cabin=BUS)
  const query = readQuery();
  const prefillCity = String(query.get('city') || '').toUpperCase();
  const prefill = prefillStatus(query.get('status'), query.get('cabin'));
  if (statuses.some((s) => s.id === prefill)) status.select.value = prefill;
  if (/^[A-Z]{3}$/.test(prefillCity)) combobox.setValue({ code: prefillCity }, { silent: true });

  const contextPromise = loadLoungeFinderContext(locale).then((context) => {
    cities = context.cities;
    sources = { ...context.sources };
    label = loungeLabels(config, locale.lang, context.labels);
    applyLabels();
    const current = combobox.getValue();
    const city = current && cities.find((c) => c.code === current.code);
    if (city && !current.name) combobox.setValue(city, { silent: true });
    if (!block.dataset.lhSearched) markSource(block, sources, ['labels', 'cities']);
    return context;
  });

  /** The chosen city, or the city whose name was typed in full without picking it. */
  const chosenCity = () => {
    const value = combobox.getValue();
    if (value && value.code) return value;
    const typed = fold(combobox.input.value);
    const hit = typed && cities.find((c) => fold(c.name) === typed);
    if (hit) combobox.setValue(hit, { silent: true });
    return hit || null;
  };

  let requestId = 0;
  async function search(cityCode, statusId) {
    requestId += 1;
    const mine = requestId;
    results.setAttribute('aria-busy', 'true');
    submit.disabled = true;
    live.textContent = label('loading label');
    await contextPromise;
    const found = await loadLounges({ status: statusId, city: cityCode }, locale, settings);
    if (mine !== requestId) return;
    submit.disabled = false;
    results.removeAttribute('aria-busy');
    block.dataset.lhSearched = `${statusId}/${cityCode}`;
    markSource(block, { ...found.sources, ...sources }, found.primary);
    if (!found.lounges.length) {
      const empty = el('p', 'lounge-finder-empty', label('no results label'));
      results.replaceChildren(empty);
      live.textContent = label('no results label');
      return;
    }
    const title = el('h3', 'lounge-finder-results-heading', `${label('results label')} (${found.lounges.length})`);
    const list = el('ul', 'lounge-finder-list');
    found.lounges.forEach((lounge, i) => list.append(renderLounge(lounge, label, uid, i)));
    results.replaceChildren(title, list);
    live.textContent = `${label('results found label')} ${found.lounges[0].airportName}`.trim();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = chosenCity();
    const statusId = status.select.value;
    setError(combobox.input, cityError, city ? '' : label('city required label'));
    setError(status.select, status.error, statusId ? '' : label('status required label'));
    if (!city) {
      combobox.focus();
      return;
    }
    if (!statusId) {
      status.select.focus();
      return;
    }
    search(city.code, statusId);
  });
  status.select.addEventListener('change', () => {
    if (status.select.value) setError(status.select, status.error, '');
  });
  combobox.input.addEventListener('change', () => {
    if (combobox.getValue()) setError(combobox.input, cityError, '');
  });

  block.replaceChildren(form, live, results);
}
