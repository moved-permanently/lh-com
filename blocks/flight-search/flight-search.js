import { getLocale, LIVE_ORIGIN, brandEntry } from '../../scripts/locale.js';
import {
  readConfigRows, pick, resolveLabels, parseAirportCode, parseAirportName,
} from '../../scripts/block-config.js';
import { createAirportCombobox, airportDisplay } from '../../scripts/airport-combobox.js';
import {
  labelsRequest, catalogRequest, defaultAirportRequest, fetchRequest, fetchLabels, pickLabels,
  mapDefaultAirport, mapAirportNames, searchAirportsWithSource, fillLabel,
} from '../../scripts/lh-api.js';
import { markSource } from '../../scripts/lh-data.js';
import { marketAllows } from '../../scripts/market-rules.js';
import { buildShopHandoff, submitShopHandoff } from '../../scripts/shop-handoff.js';
import {
  postHandoffOn, isOwnWww, hotelTarget, openTarget,
} from '../../scripts/handoff.js';
import {
  createPassengerPicker, passengerSummary, PASSENGER_LABELS, PICKER_CABINS,
} from './passenger-picker.js';
import { readPickerOptions, applyPickerChoices } from './picker-options.js';
import { createTravellersDialog, dialogDefaults } from './travellers-dialog.js';
import { milesOptions } from './travellers-miles.js';
import { pagePrefillParams, parsePrefill } from './url-prefill.js';

/* ---------------------------------------------------------------------------------------------
 * Data contract (see scripts/lh-api.js for the live request and response shapes). The live
 * flight manager loads labels/flightmanager, defaultAirport (the prefilled origin) and
 * catalogs/airportnames, and asks suggestions/airports for every typed term.
 * ------------------------------------------------------------------------------------------- */

/** Live labels used by the block, by block label key (labels/flightmanager, labels/common). */
const LIVE_LABELS = {
  'round trip label': 'flightmanager.flight.tripType.roundtrip.label',
  'one way label': 'flightmanager.flight.tripType.oneway.label',
  'trip type label': 'flightmanager.flight.travelDetails.tripTypeLabel',
  'date label': 'flightmanager.flight.dateInputGrouped.roundtrip',
  'one way date label': 'flightmanager.flight.dateInputGrouped.oneway',
  'date error': 'flightmanager.flight.dateInputGrouped.dateRequired',
  'return date error': 'flightmanager.flight.od.returnDateRequired',
  'submit label': 'flightmanager.flight.searchButton.default',
  'swap label': 'flightmanager.flight.swapButton.label',
  'origin error': 'flightmanager.flight.od.originCodeErrorRequired',
  'destination error': 'flightmanager.flight.od.destinationCodeErrorRequired',
  'same airport error': 'flightmanager.flight.od.destinationCodeErrorNot',
  'from label': 'common.od.originCode.label',
  'to label': 'common.od.destinationCode.label',
};

/** Live label bundles: flightmanager (homepage), common (loaded by the live site elsewhere). */
const LABEL_BUNDLES = ['flightmanager', 'common'];

/** The codes of a comma list ("VRN, MUC"), upper case, those of the given form only. */
function codesOf(value, form) {
  return String(value || '').split(/[\s,;]+/).map((c) => c.trim().toUpperCase()).filter((c) => form.test(c));
}

/**
 * "Where we fly" shows while the search is in use (class flight-search-in-use): at once when the
 * focus comes by keyboard, after the click when it comes with a press (mouse, touch). On a band
 * page the card sits at the band's bottom and grows upwards: the row appearing between press and
 * release moved the pressed control away and its first click was lost.
 */
function showLinksInUse(block) {
  block.classList.add('flight-search-deferred-links');
  let pressed = false;
  let within = false;
  block.addEventListener('pointerdown', () => { pressed = true; });
  const released = () => {
    if (!pressed) return;
    pressed = false;
    // a task later: after the click this release makes
    setTimeout(() => { if (within) block.classList.add('flight-search-in-use'); }, 0);
  };
  document.addEventListener('pointerup', released, true);
  document.addEventListener('pointercancel', released, true);
  block.addEventListener('focusin', () => {
    within = true;
    if (!pressed) block.classList.add('flight-search-in-use');
  });
  block.addEventListener('focusout', (e) => {
    if (e.relatedTarget && block.contains(e.relatedTarget)) return;
    within = false;
    block.classList.remove('flight-search-in-use');
  });
}

/** The Group booking row's link: { href, text }, or null. */
function groupBookingOf(entry) {
  const link = entry && entry.link;
  if (!link) return null;
  return { href: link.getAttribute('href'), text: link.textContent.replace(/\s+/g, ' ').trim() };
}

/**
 * The tabs of a market (brief 558): www's booking widget hides its hotel, car or holiday tab per
 * market (hideHotel, hideCar, hideHoliday). The optional Tabs by market row holds one paragraph
 * per group, "<markets> = <tab, tab>" (markets as section metadata reads them,
 * scripts/market-rules.js); the first group whose markets allow the page's country gives the
 * tabs, else null (the Tabs row). "<markets> = none": no tab left in those markets (www draws the
 * widget empty: hideHotel on a hotel-only widget, brief 582): an empty list, the block goes.
 * @param {Object} config result of readConfigRows
 * @param {Object} locale result of getLocale()
 * @returns {string[]|null}
 */
export function marketTabs(config, locale) {
  const entry = config['tabs-by-market'];
  const country = locale && locale.country;
  if (!entry || !country) return null;
  const paragraphs = [...entry.cell.querySelectorAll('p')].map((p) => p.textContent);
  const lines = paragraphs.length ? paragraphs : entry.cell.textContent.split('\n');
  const group = lines.map((line) => line.replace(/\s+/g, ' ').split(' = '))
    .find((parts) => parts.length === 2 && parts[1].trim() && marketAllows(parts[0], country));
  if (!group) return null;
  if (group[1].trim().toLowerCase() === 'none') return [];
  return group[1].split(/\s*[,;]\s*/).map((t) => t.trim()).filter(Boolean);
}

/**
 * Settings of an authored block.
 * @param {Object} config result of readConfigRows
 * @param {Object} locale result of getLocale()
 */
export function readFlightSearchSettings(config, locale) {
  const text = (...keys) => (pick(config, ...keys) || {}).text || '';
  const originValue = text('default-origin', 'origin');
  const destinationValue = text('default-destination', 'destination');
  const destinationCode = parseAirportCode(destinationValue);
  const cabins = codesOf(text('cabins'), /^[EPBF]$/);
  const byMarket = marketTabs(config, locale);
  return {
    tabs: byMarket && byMarket.length ? byMarket : (pick(config, 'tabs', 'tab') || { list: [] }).list,
    // "<markets> = none" (marketTabs): nothing to show in this market
    hidden: !!byMarket && !byMarket.length,
    tripTypes: (pick(config, 'trip-types', 'trip-type') || { list: [] }).list.slice(0, 2),
    defaultTripType: text('default-trip-type'),
    // null: the market default airport (defaultAirport), like the live prefilled origin
    origin: parseAirportCode(originValue)
      ? { code: parseAirportCode(originValue), name: parseAirportName(originValue) } : null,
    destination: destinationCode
      ? { code: destinationCode, name: parseAirportName(destinationValue) } : null,
    adults: parseInt(text('adults', 'travellers'), 10) || 1,
    cabin: (text('cabin') || 'E').toUpperCase(),
    travellerLabel: text('traveller-label', 'travellers-label'),
    nonstopLabel: text('nonstop-label', 'nonstop'),
    fallbackOrigin: locale.homeAirport,
    // the shop the search is handed to (a brand site's own, lh-ita); none: Lufthansa's
    shop: ((pick(config, 'shop') || {}).link || {}).href || text('shop'),
    // Passenger picker row: the traveller line opens adults, children, infants and the cabins
    // of the Cabins row (codes E, P, B, F; default all four); without it the line is a text
    passengerPicker: /^(y|yes|true|ja|si|sì|oui|1)$/i.test(text('passenger-picker')),
    cabins: cabins.length ? cabins : PICKER_CABINS.map(([c]) => c),
    // Airports row: the origin and destination suggestions only these codes (Air Dolomiti's
    // own airports); without it every airport
    airports: codesOf(text('airports'), /^[A-Z]{3}$/),
    // Group booking row: a link in the passenger picker (ITA's and lufthansa.com's "Booking from
    // 10 persons" to the group travel page); none without a link
    groupBooking: groupBookingOf(pick(config, 'group-booking')),
  };
}

/** Suggestions limited to the Airports row's codes (none: every suggestion). */
export function allowedAirports(list, codes) {
  if (!codes || !codes.length) return list;
  return list.filter((a) => codes.includes(a.code));
}

/** The live requests of the block (the typed-term suggestions come from searchAirports). */
export function flightSearchRequests(settings, locale) {
  return {
    labels: LABEL_BUNDLES.map((bundle) => labelsRequest(bundle, locale)),
    defaultAirport: defaultAirportRequest(),
    airportNames: catalogRequest('airportnames'),
  };
}

/**
 * Loads the live labels and the origin to prefill: the authored one (named from the airport
 * names catalog or the default airport when authored as a bare code), else the market default.
 * @returns {Promise<{labels: Object<string, string>, origin: {code: string, name: string},
 *   sources: Object<string, string>}>}
 */
export async function loadFlightSearchData(settings, locale) {
  const requests = flightSearchRequests(settings, locale);
  const sources = {};
  const settle = (name, mapper, fallback) => {
    // an origin from the page URL (url-prefill.js) needs no market default airport
    if (name === 'defaultAirport' && settings.urlOrigin) return Promise.resolve(fallback);
    return fetchRequest(requests[name], locale)
      .then(({ data, source }) => {
        // a brand root has no recordings of its own: a recorded default airport is another
        // market's (lh-com's at/de, Vienna); the fallback is the root's home airport
        if (name === 'defaultAirport' && locale.brand && source === 'recorded') {
          sources[name] = 'none';
          return fallback;
        }
        sources[name] = source;
        return mapper(data);
      })
      .catch(() => {
        sources[name] = 'none';
        return fallback;
      });
  };
  const [live, defaultAirport, airportNames] = await Promise.all([
    fetchLabels(LABEL_BUNDLES, locale),
    settle('defaultAirport', mapDefaultAirport, null),
    settle('airportNames', mapAirportNames, []),
  ]);
  Object.entries(live.sources).forEach(([bundle, source]) => { sources[`labels/${bundle}`] = source; });
  let origin = settings.origin || defaultAirport || { code: settings.fallbackOrigin, name: '' };
  if (!origin.name) {
    const named = airportNames.find((a) => a.code === origin.code)
      || (defaultAirport && defaultAirport.code === origin.code ? defaultAirport : null);
    if (named) origin = { code: origin.code, name: named.name };
  }
  // an authored destination code ("CPT") shows its name like the live field ("Cape Town")
  let { destination } = settings;
  if (destination && !destination.name) {
    const named = airportNames.find((a) => a.code === destination.code);
    if (named) destination = { code: destination.code, name: named.name };
  }
  return {
    labels: pickLabels(live.labels, LIVE_LABELS), origin, destination, sources,
  };
}

/**
 * The settings with what the page URL sets (url-prefill.js parsePrefill) over the rows: origin and
 * destination (codes the Airports row allows; named like an authored code, the origin without the
 * defaultAirport request), adults and cabin; the URL's other values are applied to the form.
 */
export function withPrefill(settings, prefill) {
  const out = { ...settings };
  const allows = (c) => !settings.airports.length || settings.airports.includes(c);
  if (prefill.origin && allows(prefill.origin)) {
    out.origin = { code: prefill.origin, name: '' };
    out.urlOrigin = true;
  }
  if (prefill.destination && allows(prefill.destination)) {
    out.destination = { code: prefill.destination, name: '' };
  }
  if (prefill.passengers) out.adults = prefill.passengers.adults;
  if (prefill.cabin) out.cabin = prefill.cabin;
  return out;
}

/**
 * The name of an airport or city code from the airport suggestions (the field's typing call, the
 * code as the term): the entry with that code, as the field shows it once picked ("Munich", "New
 * York - JFK International, NY"; under a city with the same code its airport's: "Munich", not
 * "Munich, all airports"); '' when none matches or the call fails. www names a prefilled
 * code so: its airport names list holds Frankfurt only.
 */
export async function airportNameOf(code, locale) {
  try {
    const { list } = await searchAirportsWithSource(code, locale);
    const hit = list.find((a) => a.code === code && a.name);
    // a city entry with its airport under the same code: the airport's name, as www shows it
    return hit ? hit.airportName || hit.name : '';
  } catch (e) {
    return '';
  }
}

/** Trip type codes by authored position: first trip type is round trip, second one way. */
const TRIP_TYPE_CODES = ['RETURN', 'ONEWAY'];

/**
 * Requests the block's main content comes from (data-lh-source): the live labels and, unless
 * an origin is authored, the market default airport that prefills the origin.
 */
export function flightSearchPrimary(settings) {
  return settings.origin ? ['labels/flightmanager'] : ['labels/flightmanager', 'defaultAirport'];
}

// the shop handoff (buildShopHandoff, submitShopHandoff) lives in scripts/shop-handoff.js
export { buildShopHandoff };

/* ------------------------------------------------------------------------------------------- */

/**
 * UI strings that are not visible authored content. Order of precedence: an authored row of
 * the same name, the live label (LIVE_LABELS), these defaults.
 */
const DEFAULT_LABELS = {
  en: {
    'from label': 'From',
    'to label': 'To',
    'submit label': 'Find flights',
    'date label': 'Departure - Return',
    'one way date label': 'Departure',
    'date error': 'Please provide travel date(s)',
    'return date error': 'Please enter your return date and try again.',
    'trip type label': 'Type of trip',
    'round trip label': 'Round trip',
    'one way label': 'One-way',
    'swap label': 'Swap origin and destination',
    'departure label': 'Departure',
    'return label': 'Return',
    'origin error': 'Please select an origin',
    'destination error': 'Please select a destination',
    'same airport error': 'Origin and destination are the same. Please check your input and try again.',
    'no results label': 'No matching airports',
  },
  de: {
    'from label': 'Von',
    'to label': 'Nach',
    'submit label': 'Flüge suchen',
    'date label': 'Hinflug - Rückflug',
    'one way date label': 'Hinflug',
    'date error': 'Bitte geben Sie Reisedaten an',
    'return date error': 'Bitte geben Sie Ihr Rückflugdatum ein und versuchen es erneut.',
    'trip type label': 'Reiseart',
    'round trip label': 'Hin- und Rückflug',
    'one way label': 'Einfacher Flug',
    'swap label': 'Abflug- und Zielort tauschen',
    'departure label': 'Hinflug',
    'return label': 'Rückflug',
    'origin error': 'Bitte wählen Sie einen Abflugort',
    'destination error': 'Bitte wählen Sie ein Ziel',
    'same airport error': 'Abflug- und Zielflughafen sind identisch. Bitte überprüfen Sie Ihre Angaben.',
    'no results label': 'Keine passenden Flughäfen',
  },
  it: {
    'from label': 'Da',
    'to label': 'A',
    'submit label': 'Cerca voli',
    'date label': 'Andata - Ritorno',
    'one way date label': 'Andata',
    'date error': 'Inserisci la data o le date del viaggio',
    'return date error': 'Inserisci la data di ritorno e riprova.',
    'trip type label': 'Tipo di viaggio',
    'round trip label': 'Andata e ritorno',
    'one way label': 'Solo andata',
    'swap label': 'Inverti partenza e destinazione',
    'departure label': 'Andata',
    'return label': 'Ritorno',
    'origin error': 'Seleziona una città di partenza',
    'destination error': 'Seleziona una destinazione',
    'same airport error': 'Partenza e destinazione coincidono. Controlla i dati inseriti e riprova.',
    'no results label': 'Nessun aeroporto corrispondente',
  },
  fr: {
    'from label': 'De',
    'to label': 'À',
    'submit label': 'Rechercher des vols',
    'date label': 'Aller - Retour',
    'one way date label': 'Aller',
    'date error': 'Veuillez indiquer la ou les dates du voyage',
    'return date error': 'Veuillez saisir votre date de retour et réessayer.',
    'trip type label': 'Type de voyage',
    'round trip label': 'Aller-retour',
    'one way label': 'Aller simple',
    'swap label': 'Inverser départ et destination',
    'departure label': 'Aller',
    'return label': 'Retour',
    'origin error': 'Veuillez sélectionner un point de départ',
    'destination error': 'Veuillez sélectionner une destination',
    'same airport error': 'Le départ et la destination sont identiques. Veuillez vérifier votre saisie et réessayer.',
    'no results label': 'Aucun aéroport correspondant',
  },
  es: {
    'from label': 'Desde',
    'to label': 'A',
    'submit label': 'Buscar vuelos',
    'date label': 'Ida - Vuelta',
    'one way date label': 'Ida',
    'date error': 'Indique la fecha o las fechas del viaje',
    'return date error': 'Introduzca la fecha de vuelta e inténtelo de nuevo.',
    'trip type label': 'Tipo de viaje',
    'round trip label': 'Ida y vuelta',
    'one way label': 'Solo ida',
    'swap label': 'Intercambiar origen y destino',
    'departure label': 'Ida',
    'return label': 'Vuelta',
    'origin error': 'Seleccione un origen',
    'destination error': 'Seleccione un destino',
    'same airport error': 'El origen y el destino son iguales. Compruebe los datos e inténtelo de nuevo.',
    'no results label': 'No hay aeropuertos que coincidan',
  },
  nl: {
    'from label': 'Van',
    'to label': 'Naar',
    'submit label': 'Vluchten zoeken',
    'date label': 'Heenreis - Terugreis',
    'one way date label': 'Heenreis',
    'date error': 'Geef de reisdatum of -data op',
    'return date error': 'Voer uw terugreisdatum in en probeer het opnieuw.',
    'trip type label': 'Soort reis',
    'round trip label': 'Retour',
    'one way label': 'Enkele reis',
    'swap label': 'Vertrek en bestemming omwisselen',
    'departure label': 'Heenreis',
    'return label': 'Terugreis',
    'origin error': 'Selecteer een vertrekpunt',
    'destination error': 'Selecteer een bestemming',
    'same airport error': 'Vertrek en bestemming zijn hetzelfde. Controleer uw invoer en probeer het opnieuw.',
    'no results label': 'Geen overeenkomende luchthavens',
  },
  pt: {
    'from label': 'De',
    'to label': 'Para',
    'submit label': 'Pesquisar voos',
    'date label': 'Ida - Volta',
    'one way date label': 'Ida',
    'date error': 'Informe a data ou as datas da viagem',
    'return date error': 'Informe a data de volta e tente novamente.',
    'trip type label': 'Tipo de viagem',
    'round trip label': 'Ida e volta',
    'one way label': 'Somente ida',
    'swap label': 'Inverter origem e destino',
    'departure label': 'Ida',
    'return label': 'Volta',
    'origin error': 'Selecione uma origem',
    'destination error': 'Selecione um destino',
    'same airport error': 'A origem e o destino são iguais. Verifique os dados e tente novamente.',
    'no results label': 'Nenhum aeroporto correspondente',
  },
  el: {
    'from label': 'Από',
    'to label': 'Προς',
    'submit label': 'Αναζήτηση πτήσεων',
    'date label': 'Αναχώρηση - Επιστροφή',
    'one way date label': 'Αναχώρηση',
    'date error': 'Συμπληρώστε την ημερομηνία ή τις ημερομηνίες ταξιδιού',
    'return date error': 'Συμπληρώστε την ημερομηνία επιστροφής και δοκιμάστε ξανά.',
    'trip type label': 'Τύπος ταξιδιού',
    'round trip label': 'Με επιστροφή',
    'one way label': 'Μόνο μετάβαση',
    'swap label': 'Αντιστροφή αναχώρησης και προορισμού',
    'departure label': 'Αναχώρηση',
    'return label': 'Επιστροφή',
    'origin error': 'Επιλέξτε σημείο αναχώρησης',
    'destination error': 'Επιλέξτε προορισμό',
    'same airport error': 'Η αναχώρηση και ο προορισμός είναι ίδια. Ελέγξτε τα στοιχεία σας και δοκιμάστε ξανά.',
    'no results label': 'Δεν βρέθηκαν αεροδρόμια',
  },
  ja: {
    'from label': '出発地',
    'to label': '目的地',
    'submit label': 'フライトを検索',
    'date label': '往路 - 復路',
    'one way date label': '往路',
    'date error': 'ご旅行の日付を入力してください',
    'return date error': '復路の日付を入力して、もう一度お試しください。',
    'trip type label': '旅程タイプ',
    'round trip label': '往復',
    'one way label': '片道',
    'swap label': '出発地と目的地を入れ替える',
    'departure label': '往路',
    'return label': '復路',
    'origin error': '出発地を選択してください',
    'destination error': '目的地を選択してください',
    'same airport error': '出発地と目的地が同じです。入力内容を確認して、もう一度お試しください。',
    'no results label': '該当する空港はありません',
  },
  ru: {
    'from label': 'Откуда',
    'to label': 'Куда',
    'submit label': 'Найти рейсы',
    'date label': 'Туда - Обратно',
    'one way date label': 'Туда',
    'date error': 'Укажите дату или даты поездки',
    'return date error': 'Введите дату обратного рейса и повторите попытку.',
    'trip type label': 'Тип поездки',
    'round trip label': 'Туда и обратно',
    'one way label': 'В одну сторону',
    'swap label': 'Поменять местами пункты отправления и назначения',
    'departure label': 'Туда',
    'return label': 'Обратно',
    'origin error': 'Выберите пункт отправления',
    'destination error': 'Выберите пункт назначения',
    'same airport error': 'Пункты отправления и назначения совпадают. Проверьте введенные данные и повторите попытку.',
    'no results label': 'Подходящие аэропорты не найдены',
  },
  zh: {
    'from label': '出发地',
    'to label': '目的地',
    'submit label': '搜索航班',
    'date label': '去程 - 返程',
    'one way date label': '去程',
    'date error': '请提供出行日期',
    'return date error': '请输入返程日期后重试。',
    'trip type label': '行程类型',
    'round trip label': '往返',
    'one way label': '单程',
    'swap label': '交换出发地和目的地',
    'departure label': '去程',
    'return label': '返程',
    'origin error': '请选择出发地',
    'destination error': '请选择目的地',
    'same airport error': '出发地和目的地相同。请检查您的输入后重试。',
    'no results label': '没有匹配的机场',
  },
  pl: {
    'from label': 'Skąd',
    'to label': 'Dokąd',
    'submit label': 'Szukaj lotów',
    'date label': 'Wylot - Powrót',
    'one way date label': 'Wylot',
    'date error': 'Podaj datę lub daty podróży',
    'return date error': 'Podaj datę powrotu i spróbuj ponownie.',
    'trip type label': 'Rodzaj podróży',
    'round trip label': 'W obie strony',
    'one way label': 'W jedną stronę',
    'swap label': 'Zamień miejsce wylotu i cel podróży',
    'departure label': 'Wylot',
    'return label': 'Powrót',
    'origin error': 'Wybierz miejsce wylotu',
    'destination error': 'Wybierz cel podróży',
    'same airport error': 'Miejsce wylotu i cel podróży są takie same. Sprawdź dane i spróbuj ponownie.',
    'no results label': 'Brak pasujących lotnisk',
  },
  // Korean (kr/ko; the wording of www where it has one, the capture of 2026-11-03)
  ko: {
    'from label': '출발',
    'to label': '도착',
    'submit label': '항공편 검색',
    'date label': '출발 - 귀국',
    'one way date label': '출발',
    'date error': '여행 날짜를 입력하십시오',
    'return date error': '귀국일을 입력한 후 다시 시도하십시오.',
    'trip type label': '여행 유형',
    'round trip label': '왕복',
    'one way label': '편도',
    'swap label': '출발지와 도착지 바꾸기',
    'departure label': '출발일',
    'return label': '귀국일',
    'origin error': '출발지를 선택하십시오',
    'destination error': '도착지를 선택하십시오',
    'same airport error': '출발지와 도착지가 같습니다. 입력 내용을 확인한 후 다시 시도하십시오.',
    'no results label': '일치하는 공항이 없습니다',
  },
};

/**
 * Hotel tab (Booking.com) texts: the live hotel tab's built-in texts (dcep bundle, chunk of the
 * HotelTab component), which the live page shows in every market; the tooltip and the close
 * button follow the page language. Authored rows of the same name win.
 */
const HOTEL_LABELS_EN = {
  'location label': 'Location',
  'location hint': 'City name',
  'location error': 'Please enter a destination.',
  'check-in label': 'Check-In',
  'check-in hint': 'Date of arrival',
  'check-in error': 'The check-in date is required.',
  'check-out label': 'Check-Out',
  'check-out hint': 'Date of departure',
  'check-out error': 'The check-out date is required.',
  'check-out order error': 'Check-Out has to be after Check-In.',
  'hotel footnote': 'The contract for your accommodation is directly with our hotel partner Booking.com and separate to the Lufthansa flight booking.',
  'hotel submit label': 'Search hotel',
  'hotel external note': 'Please note that with this link you are visiting an external website that may not follow the same privacy, security or accessibility policies.',
  'close label': 'Close',
  // the post mode's failure (scripts/handoff.js; www's tab shows no text of its own)
  'hotel handoff error': 'The hotel search could not be started. Please try again later.',
};
/** Hotel tab texts taken from the live label bundle (labels/flightmanager), by label key. */
const HOTEL_LIVE_LABELS = {
  'hotel submit label': 'flightmanager.hotel.default.searchButton',
};
const HOTEL_LABELS = {
  en: HOTEL_LABELS_EN,
  de: {
    ...HOTEL_LABELS_EN,
    'hotel external note': 'Bitte beachten Sie, dass Sie mit diesem Link eine externe Website besuchen, die möglicherweise nicht den gleichen Datenschutz-, Sicherheits- oder Barrierefreiheitsrichtlinien folgt.',
    'close label': 'Schließen',
    'hotel handoff error': 'Die Hotelsuche konnte nicht gestartet werden. Bitte versuchen Sie es später noch einmal.',
  },
};

/**
 * Kind of a tab by its label: the live flight manager's tabs (Flights / Flüge, Rental car /
 * Mietwagen, Flug & Hotel, Hotel). Only the flight and hotel tabs have a form here; other tabs
 * open the page on the live site.
 * @param {string} label
 * @returns {'flight'|'hotel'|'holiday'|'car'|'other'}
 */
export function tabKind(label) {
  const text = (label || '').toLowerCase();
  if (/holiday|urlaub|(flug|flight)\s*[&+]\s*hotel/.test(text)) return 'holiday';
  if (/hotel/.test(text)) return 'hotel';
  if (/car\b|mietwagen|auto/.test(text)) return 'car';
  if (/flight|fl[uü]ge?\b/.test(text)) return 'flight';
  return 'other';
}

/**
 * Kinds of a block's tabs. When no label reads as a flight tab, the first tab is the flight tab
 * when its label is unknown (the brand sites author it in their language: "Voli", "Vols",
 * "Vuelos", "Πτήσεις", ...; the live flight manager's first tab is always Flights).
 * @param {string[]} labels
 * @returns {string[]}
 */
export function tabKinds(labels) {
  const kinds = (labels || []).map(tabKind);
  if (kinds[0] === 'other' && !kinds.includes('flight')) kinds[0] = 'flight';
  return kinds;
}

/** The live page of the current replica page (same path on www.lufthansa.com). */
function livePageUrl(config) {
  const authored = config['live-page'] && config['live-page'].link;
  if (authored) return authored.href;
  return `${LIVE_ORIGIN}${window.location.pathname.replace(/^\/content\//, '/')}`;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function isoDate(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

/**
 * Splits the grouped date label "Departure - Return" into its two parts; an authored
 * Departure label / Return label row wins.
 */
/** The format of a chosen date in the page's language (de 21.11.2026, en-GB 21/11/2026). */
function dateFormat(locale) {
  const tag = locale.lang === 'en' && ['us', 'ca'].includes(locale.country)
    ? 'en-US' : `${locale.lang}-${String(locale.country || '').toUpperCase()}`;
  return new Intl.DateTimeFormat(tag, {
    day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC',
  });
}

/**
 * One Tab stop for a date, as www's date field (a readonly text field and its calendar): the
 * date shows in a readonly field (returned, for its label); Enter, Space, Alt+Down or a click
 * opens the browser's calendar of the date input behind it (showPicker), which keeps the value
 * and stays out of the Tab order (its own three segments and picker button were four stops);
 * Delete or Backspace clears it. sync() shows a value set from code.
 * @param {HTMLInputElement} input the date input
 * @param {Intl.DateTimeFormat} format dateFormat()
 * @returns {{display: HTMLInputElement, sync: function}}
 */
function oneStopDate(input, format) {
  input.classList.add('flight-search-date-native');
  input.tabIndex = -1;
  input.setAttribute('aria-hidden', 'true');
  const display = el('input', 'flight-search-date-value');
  display.type = 'text';
  display.readOnly = true;
  display.autocomplete = 'off';
  const sync = () => {
    const d = input.value ? new Date(`${input.value}T00:00:00Z`) : null;
    display.value = d && !Number.isNaN(d.getTime()) ? format.format(d) : '';
  };
  const openCalendar = () => {
    if (input.disabled) return;
    if (typeof input.showPicker === 'function') {
      try {
        input.showPicker();
        return;
      } catch (e) {
        // no user activation or not supported: the date input itself
      }
    }
    input.click();
  };
  display.addEventListener('click', openCalendar);
  display.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || (e.key === 'ArrowDown' && e.altKey)) {
      e.preventDefault();
      openCalendar();
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      input.value = '';
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  input.addEventListener('change', sync);
  sync();
  return { display, sync };
}

function dateLabels(labels, config) {
  const parts = (labels['date label'] || '').split(/\s+[-–/]\s+/);
  const authored = (key) => config[key] && config[key].text;
  return {
    departure: authored('departure-label') || (parts.length === 2 ? parts[0] : labels['departure label']),
    return: authored('return-label') || (parts.length === 2 ? parts[1] : labels['return label']),
  };
}

/**
 * Like the live flight manager, a chosen airport shows its name only ("Frankfurt", the code is
 * the field's value); airports without a name (a typed code) show the code. The combobox writes
 * "Name (CODE)": rewritten after every change and after its blur handler.
 * @param {{input: HTMLInputElement, getValue: function, setValue: function}} combobox
 */
function showAirportNames(combobox) {
  const show = () => {
    const airport = combobox.getValue();
    if (airport && airport.name) combobox.input.value = airport.name;
  };
  const { setValue } = combobox;
  combobox.setValue = (airport, options) => {
    setValue(airport, options);
    show();
  };
  combobox.input.addEventListener('blur', show);
  show();
  return show;
}

/**
 * The promotion teaser's card (www's flight manager: its title, displayText and link): the first
 * paragraph before the heading its eyebrow, a paragraph with a link its call to action. An empty
 * cell: none.
 * @param {Element} [cell] the Background teaser cell
 * @returns {Element|null}
 */
function teaserCard(cell) {
  if (!cell || !cell.textContent.trim()) return null;
  const card = el('div', 'flight-search-teaser');
  let heading = false;
  [...cell.children].forEach((node) => {
    if (/^H[1-6]$/.test(node.tagName)) heading = true;
    else if (node.tagName === 'P' && node.querySelector('a[href]')) node.className = 'flight-search-teaser-cta';
    else if (node.tagName === 'P' && !heading) node.className = 'flight-search-teaser-eyebrow';
    card.append(node);
  });
  return card;
}

/**
 * Background image (local promotion pages, live .flightmanager-container.full-width-bg): the
 * block's wrapper becomes a full-width band (min 500px) with the image as cover, and the card
 * sits at its bottom in the content column. The mobile image (if any) is used below 1025px. A
 * Background video (a link to an .mp4: www.swiss.com's flight manager with its promotion teaser's
 * moving image) plays over the picture, muted, looped and inline, the picture its poster until it
 * plays; with prefers-reduced-motion the picture alone. A Background teaser (the promotion
 * teaser's eyebrow, heading and link) is a card in the band above the search.
 * @param {Element} block
 * @param {Element} cell the Background image cell
 * @param {Element} [mobileCell] the Background image mobile cell
 * @param {Element} [videoCell] the Background video cell
 * @param {Element} [teaserCell] the Background teaser cell
 */
export function addBackground(block, cell, mobileCell, videoCell, teaserCell) {
  const img = cell.querySelector('img');
  if (!img) return;
  const band = el('div', 'flight-search-background');
  const picture = document.createElement('picture');
  const mobile = mobileCell && mobileCell.querySelector('img');
  if (mobile) {
    const source = document.createElement('source');
    source.media = '(width < 1025px)';
    source.srcset = mobile.currentSrc || mobile.src;
    picture.append(source);
  }
  const image = el('img');
  image.src = img.src;
  image.alt = '';
  image.loading = 'lazy';
  picture.append(image);
  band.append(picture);
  const src = videoCell?.querySelector('a[href]')?.getAttribute('href') || '';
  if (/\.mp4$/i.test(src.split(/[?#]/)[0]) && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const video = document.createElement('video');
    video.className = 'flight-search-video';
    ['muted', 'loop', 'playsinline', 'autoplay'].forEach((a) => video.setAttribute(a, ''));
    video.muted = true;
    video.setAttribute('preload', 'metadata');
    video.setAttribute('aria-hidden', 'true');
    video.setAttribute('poster', img.getAttribute('src') || img.src);
    const source = document.createElement('source');
    source.setAttribute('src', src);
    source.setAttribute('type', 'video/mp4');
    video.append(source);
    video.addEventListener('playing', () => video.classList.add('is-playing'), { once: true });
    band.append(video);
  }
  const wrapper = block.parentElement;
  if (wrapper) {
    wrapper.classList.add('flight-search-band');
    wrapper.prepend(band);
    const teaser = teaserCard(teaserCell);
    if (teaser) {
      wrapper.classList.add('flight-search-band-has-teaser');
      band.after(teaser);
    }
  }
}

const DAY_MS = 86400000;

/**
 * Hotel tab: Location, Check-In (today), Check-Out (tomorrow), like the live tab's initial
 * values; footnote and "Search hotel". The live tab posts the search to its booking service,
 * which answers with the Booking.com address; on the airline's own host (scripts/handoff.js post
 * mode) the tab does the same, elsewhere a valid search opens the live page in a new tab (nothing
 * is sent).
 * @param {Object} config result of readConfigRows
 * @param {Object} locale result of getLocale()
 * @param {function} onClose the close button's handler
 * @returns {HTMLElement} the panel
 */
function buildHotelPanel(config, locale, onClose) {
  const labels = resolveLabels(HOTEL_LABELS, config, locale.lang);
  const panel = el('div', 'flight-search-panel flight-search-hotel');
  const form = el('form', 'flight-search-hotel-form');
  form.noValidate = true;
  const uid = Math.random().toString(36).slice(2, 8);
  const fields = el('div', 'flight-search-hotel-fields');
  const field = (name, input) => {
    const wrap = el('div', `flight-search-hotel-field flight-search-hotel-${name}`);
    input.classList.add('flight-search-hotel-input');
    input.id = `flight-search-hotel-${name}-${uid}`;
    const label = el('label', 'flight-search-hotel-label', labels[`${name} label`]);
    label.htmlFor = input.id;
    const hint = el('p', 'flight-search-hotel-hint', labels[`${name} hint`]);
    hint.id = `${input.id}-hint`;
    const error = el('p', 'flight-search-hotel-error');
    error.id = `${input.id}-error`;
    error.hidden = true;
    input.setAttribute('aria-describedby', `${hint.id} ${error.id}`);
    wrap.append(label, input, hint, error);
    fields.append(wrap);
    return { wrap, input, error };
  };
  const cityInput = el('input');
  cityInput.type = 'text';
  cityInput.name = 'cityName';
  cityInput.autocomplete = 'off';
  cityInput.required = true;
  // an empty placeholder lets the CSS show the label in the empty field (:placeholder-shown)
  cityInput.placeholder = ' ';
  const city = field('location', cityInput);
  const dateInput = (name, date) => {
    const input = el('input');
    input.type = 'date';
    input.name = name;
    input.required = true;
    input.value = isoDate(date);
    input.min = isoDate(new Date());
    return input;
  };
  const today = new Date();
  // one Tab stop per date, as the flight dates (oneStopDate): the label, the hint and the error
  // name and describe the readonly field; the date input behind it keeps the value
  const format = dateFormat(locale);
  const oneStop = (f) => {
    const { input } = f;
    const { display, sync } = oneStopDate(input, format);
    input.classList.remove('flight-search-hotel-input');
    display.classList.add('flight-search-hotel-input');
    display.id = `${input.id}-value`;
    display.setAttribute('aria-describedby', input.getAttribute('aria-describedby'));
    input.removeAttribute('aria-describedby');
    f.wrap.querySelector('.flight-search-hotel-label').setAttribute('for', display.id);
    input.after(display);
    return { ...f, display, sync };
  };
  const checkIn = oneStop(field('check-in', dateInput('checkInDate', today)));
  const checkOut = oneStop(field('check-out', dateInput('checkOutDate', new Date(today.getTime() + DAY_MS))));
  checkOut.input.min = checkOut.input.value;
  checkIn.input.addEventListener('change', () => {
    if (!checkIn.input.value) return;
    const next = isoDate(new Date(new Date(`${checkIn.input.value}T12:00`).getTime() + DAY_MS));
    checkOut.input.min = next;
    if (!checkOut.input.value || checkOut.input.value < next) {
      checkOut.input.value = next;
      checkOut.sync();
    }
  });
  form.append(fields);

  const footer = el('div', 'flight-search-hotel-footer');
  footer.append(el('p', 'flight-search-hotel-footnote', labels['hotel footnote']));
  const submit = el('button', 'flight-search-hotel-submit button primary', labels['hotel submit label']);
  submit.type = 'submit';
  // the live "external website" tooltip of the button
  submit.title = labels['hotel external note'];
  const note = el('span', 'flight-search-sr-only', labels['hotel external note']);
  note.id = `flight-search-hotel-note-${uid}`;
  submit.setAttribute('aria-describedby', note.id);
  footer.append(submit, note);
  const handoffError = el('p', 'flight-search-hotel-handoff-error', '');
  handoffError.setAttribute('role', 'alert');
  handoffError.hidden = true;
  footer.append(handoffError);
  form.append(footer);
  // the button text of the live label bundle (labels/flightmanager), as the flight tab gets its
  // labels: de "Hotelsuche", en "Search hotel"; a "Hotel submit label" row other than the
  // built-in English text (which the importer copies from the rendered live tab) wins
  const builtIn = (HOTEL_LABELS[locale.lang] || HOTEL_LABELS.en)['hotel submit label'];
  if (labels['hotel submit label'] === builtIn) {
    fetchLabels(['flightmanager'], locale).then((live) => {
      const text = pickLabels(live.labels, HOTEL_LIVE_LABELS)['hotel submit label'];
      if (text) submit.textContent = text;
    }).catch(() => {});
  }

  const close = el('button', 'flight-search-close');
  close.type = 'button';
  close.setAttribute('aria-label', labels['close label']);
  close.title = labels['close label'];
  close.addEventListener('click', onClose);
  form.append(close);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const checks = [
      [city, !cityInput.value.trim() && labels['location error']],
      [checkIn, !checkIn.input.value && labels['check-in error']],
      [checkOut, (!checkOut.input.value && labels['check-out error'])
        || (checkIn.input.value && checkOut.input.value <= checkIn.input.value
          && labels['check-out order error'])],
    ];
    checks.forEach(([f, message]) => {
      f.error.textContent = message || '';
      f.error.hidden = !message;
      f.wrap.classList.toggle('invalid', Boolean(message));
      (f.display || f.input).setAttribute('aria-invalid', message ? 'true' : 'false');
    });
    const invalid = checks.find(([, message]) => message);
    if (invalid) {
      (invalid[0].display || invalid[0].input).focus();
      return;
    }
    // the airline's own host, whose page this would open again: www's hotel call, its target
    if (postHandoffOn() && isOwnWww(livePageUrl(config))) {
      handoffError.hidden = true;
      submit.disabled = true;
      hotelTarget({
        cityName: cityInput.value.trim(),
        checkIn: checkIn.input.value,
        checkOut: checkOut.input.value,
      }, locale).then(openTarget).catch(() => {
        handoffError.textContent = labels['hotel handoff error'];
        handoffError.hidden = false;
      }).finally(() => { submit.disabled = false; });
      return;
    }
    window.open(livePageUrl(config), '_blank', 'noopener');
  });
  panel.append(form);
  return panel;
}

export default function decorate(block) {
  const locale = getLocale();
  const config = readConfigRows(block);
  // lufthansa.com's Young adults and Fare preference rows, hints left out (picker-options.js)
  const pickerOptions = readPickerOptions(block, config, locale);
  // the page URL's search, as www's flight manager (url-prefill.js): over the authored rows
  const params = pagePrefillParams();
  const authored = readFlightSearchSettings(config, locale);
  if (authored.hidden) {
    (block.closest('.flight-search-wrapper') || block).remove();
    return;
  }
  const prefill = Object.keys(params).length ? parsePrefill(params, {
    today: isoDate(new Date()),
    cabins: authored.cabins,
    youngAdults: authored.passengerPicker && pickerOptions.youngAdults,
    adults: authored.adults,
  }) : {};
  const settings = withPrefill(authored, prefill);
  // Air Dolomiti's booking strip (variant airdolomiti, option strip: www's widget under the header,
  // brief 452): the departure empty, no market airport, unless authored or prefilled
  const emptyOrigin = block.classList.contains('airdolomiti') && block.classList.contains('strip') && !settings.origin;
  let labels = resolveLabels(DEFAULT_LABELS, config, locale.lang);
  const text = (...keys) => (pick(config, ...keys) || {}).text || '';
  const links = (pick(config, 'where-we-fly', 'links', 'link') || {}).cell;
  // texts that follow the live labels once they load (authored rows always win)
  const refreshers = [];
  const bind = (fn) => {
    refreshers.push(fn);
    fn(labels);
  };

  const content = document.createDocumentFragment();
  // standalone design (every page but the homepage): a card with a tab bar; a hotel tab or
  // further tabs (cash-and-miles: Flights, Rental car, Hotel) get the tab bar in any design
  const tabKindList = tabKinds(settings.tabs);
  const hasFlight = !settings.tabs.length || tabKindList.includes('flight');
  const tabbed = settings.tabs.length > 0
    && (block.classList.contains('standalone') || tabKindList.some((k) => k !== 'flight'));

  if (settings.tabs.length && !tabbed) {
    const tabBar = el('div', 'flight-search-tabs');
    tabBar.append(el('span', 'flight-search-tab', settings.tabs[0]));
    content.append(tabBar);
  }

  const form = el('form', 'flight-search-form');
  form.noValidate = true;
  // the visible form never posts itself: submit validates, then posts a hidden shop handoff form

  // options row: trip type, travellers, nonstop
  const optionsRow = el('div', 'flight-search-options');
  let tripTypeSelect;
  if (settings.tripTypes.length) {
    const wrap = el('div', 'flight-search-trip-type');
    const label = el('label', 'flight-search-sr-only');
    bind((l) => { label.textContent = l['trip type label']; });
    tripTypeSelect = el('select');
    tripTypeSelect.name = 'tripType';
    tripTypeSelect.id = `flight-search-trip-type-${Math.random().toString(36).slice(2, 8)}`;
    label.htmlFor = tripTypeSelect.id;
    // the live flight manager always offers both: a missing second type gets the live label
    TRIP_TYPE_CODES.forEach((code, i) => {
      const option = el('option');
      option.value = code;
      if (settings.tripTypes[i]) option.textContent = settings.tripTypes[i];
      else bind((l) => { option.textContent = l[i ? 'one way label' : 'round trip label']; });
      // the page URL's trip type (url-prefill.js), else the Default trip type row
      const authoredType = Boolean(settings.defaultTripType)
        && option.textContent.toLowerCase() === settings.defaultTripType.toLowerCase();
      option.selected = prefill.tripType ? code === prefill.tripType : authoredType;
      tripTypeSelect.append(option);
    });
    wrap.append(label, tripTypeSelect);
    optionsRow.append(wrap);
  }
  let passengers;
  // the group brands' travellers window (travellers-dialog.js: Brussels, SWISS, Austrian in the
  // languages of its texts); elsewhere the dropdown
  const dialogTexts = settings.passengerPicker ? dialogDefaults(locale.lang, brandEntry()) : null;
  if (dialogTexts) {
    // a hint row left empty (pickerOptions.labels: '') hides that hint as in the dropdown
    const hidden = Object.fromEntries(Object.entries(pickerOptions.labels).filter(([, v]) => v === ''));
    passengers = createTravellersDialog({
      labels: { ...resolveLabels({ [locale.lang]: dialogTexts }, config, locale.lang), ...hidden },
      cabins: settings.cabins,
      value: { adults: settings.adults, cabin: settings.cabin, ...(prefill.passengers || {}) },
      groupBooking: settings.groupBooking,
      youngAdults: pickerOptions.youngAdults,
      // the Redeem miles tab where the brand has it (travellers-miles.js: Brussels, SWISS)
      miles: milesOptions(locale, brandEntry()),
    });
    optionsRow.append(passengers.element);
  } else if (settings.passengerPicker) {
    const options = pickerOptions;
    passengers = createPassengerPicker({
      labels: { ...resolveLabels(PASSENGER_LABELS, config, locale.lang), ...options.labels },
      cabins: settings.cabins,
      value: { adults: settings.adults, cabin: settings.cabin, ...(prefill.passengers || {}) },
      groupBooking: settings.groupBooking,
      youngAdults: options.youngAdults,
      farePreference: options.farePreference,
    });
    optionsRow.append(passengers.element);
  } else if (settings.travellerLabel) {
    // the URL's counts or cabin: the line says them, as the picker's would
    const counts = prefill.passengers || { adults: settings.adults, children: 0, infants: 0 };
    const words = resolveLabels(PASSENGER_LABELS, config, locale.lang);
    const line = prefill.passengers || prefill.cabin
      ? passengerSummary(words, settings.cabin, counts) : settings.travellerLabel;
    optionsRow.append(el('span', 'flight-search-travellers', line));
  }
  let nonstop;
  if (settings.nonstopLabel) {
    const label = el('label', 'flight-search-nonstop');
    nonstop = el('input');
    nonstop.type = 'checkbox';
    nonstop.name = 'nonstop';
    label.append(nonstop, document.createTextNode(` ${settings.nonstopLabel}`));
    optionsRow.append(label);
  }
  if (optionsRow.children.length) form.append(optionsRow);

  // where the data came from (data-lh-source); typed suggestions are listed in the detail
  const sources = {};
  const primary = flightSearchPrimary(settings);
  const suggest = async (term) => {
    const { list, source } = await searchAirportsWithSource(term, locale);
    sources.suggestions = source;
    markSource(block, sources, primary);
    return allowedAirports(list, settings.airports);
  };
  // an origin outside the Airports row is no prefill
  const allowed = (airport) => (airport && (!settings.airports.length
    || settings.airports.includes(airport.code)) ? airport : null);

  // fields row: origin, swap, destination, dates, submit
  const fields = el('div', 'flight-search-fields');
  let originTouched = false;
  let destinationTouched = false;
  // set below: the name-only display of each field (showAirportNames)
  const shown = {};
  const origin = createAirportCombobox({
    label: text('origin-label', 'from') || labels['from label'],
    name: 'origin',
    value: emptyOrigin ? null : allowed(settings.origin || { code: settings.fallbackOrigin, name: '' }),
    fetchSuggestions: (term) => suggest(term),
    onChange: () => {
      originTouched = true;
      if (shown.origin) shown.origin();
    },
    noResultsLabel: labels['no results label'],
  });
  origin.element.classList.add('flight-search-origin');
  const destination = createAirportCombobox({
    label: text('destination-label', 'to') || labels['to label'],
    name: 'destination',
    value: allowed(settings.destination),
    fetchSuggestions: (term) => suggest(term),
    onChange: () => {
      destinationTouched = true;
      if (shown.destination) shown.destination();
    },
    noResultsLabel: labels['no results label'],
  });
  destination.element.classList.add('flight-search-destination');
  shown.origin = showAirportNames(origin);
  shown.destination = showAirportNames(destination);
  if (!text('origin-label', 'from')) {
    bind((l) => { origin.element.querySelector('label').textContent = l['from label']; });
  }
  if (!text('destination-label', 'to')) {
    bind((l) => { destination.element.querySelector('label').textContent = l['to label']; });
  }

  const swap = el('button', 'flight-search-swap');
  swap.type = 'button';
  // authored or built-in, without placeholders: used until both airports are set
  const plainSwapLabel = labels['swap label'];
  const updateSwapLabel = () => {
    // live: "Click here to switch the origin {ORIGIN} and destination {DESTINATION}."
    const from = airportDisplay(origin.getValue());
    const to = airportDisplay(destination.getValue());
    const label = /\{[A-Z_]+\}/.test(labels['swap label']) && !(from && to)
      ? plainSwapLabel
      : fillLabel(labels['swap label'], { ORIGIN: from, DESTINATION: to });
    swap.setAttribute('aria-label', label);
    swap.title = label;
  };
  bind(updateSwapLabel);
  swap.addEventListener('click', () => {
    const from = origin.getValue();
    origin.setValue(destination.getValue());
    destination.setValue(from);
    updateSwapLabel();
  });
  [origin, destination].forEach((c) => c.input.addEventListener('change', updateSwapLabel));

  // the dates: one Tab stop each, as www's field (a readonly text field and its calendar): the
  // date shows in a readonly field named by its label; Enter, Space, Alt+Down or a click opens the
  // browser's calendar of the date input behind it (showPicker), which keeps the value out of the
  // Tab order (its own three segments and picker button were four stops); Delete clears it
  const dates = el('fieldset', 'flight-search-dates');
  const legend = el('legend');
  dates.append(legend);
  const shownDate = dateFormat(locale);
  const makeDate = (name) => {
    const label = el('label', `flight-search-date flight-search-${name}`);
    const span = el('span', 'flight-search-date-label');
    span.id = `flight-search-${name}-label-${Math.random().toString(36).slice(2, 8)}`;
    const input = el('input');
    input.type = 'date';
    input.name = name;
    input.required = true; // form is noValidate; lets the CSS tell empty fields (:invalid) apart
    input.min = isoDate(new Date());
    const { display, sync } = oneStopDate(input, shownDate);
    display.setAttribute('aria-labelledby', span.id);
    label.append(span, input, display);
    dates.append(label);
    return {
      label, input, span, display, sync,
    };
  };
  const departure = makeDate('departure');
  const ret = makeDate('return');
  departure.input.addEventListener('change', () => {
    ret.input.min = departure.input.value || isoDate(new Date());
    if (ret.input.value && ret.input.value < departure.input.value) {
      ret.input.value = '';
      ret.sync();
    }
  });

  const submit = el('button', 'flight-search-submit button primary');
  submit.type = 'submit';
  bind((l) => { submit.textContent = text('submit') || l['submit label']; });

  fields.append(origin.element, swap, destination.element, dates, submit);
  form.append(fields);

  const error = el('p', 'flight-search-error');
  error.setAttribute('role', 'alert');
  error.hidden = true;
  form.append(error);

  const updateTripType = () => {
    // without the trip type select: the URL's one way, else round trip
    const oneWay = tripTypeSelect
      ? tripTypeSelect.value === 'ONEWAY' : prefill.tripType === 'ONEWAY';
    ret.label.hidden = oneWay;
    ret.input.disabled = oneWay;
    ret.display.disabled = oneWay;
    form.dataset.tripType = oneWay ? 'ONEWAY' : 'RETURN';
    const parts = dateLabels(labels, config);
    legend.textContent = oneWay ? labels['one way date label'] : labels['date label'];
    departure.span.textContent = parts.departure;
    ret.span.textContent = parts.return;
  };
  if (tripTypeSelect) tripTypeSelect.addEventListener('change', updateTripType);
  bind(updateTripType);
  // the URL's dates (from today on, the return not before the departure: url-prefill.js), the
  // return only on a round trip
  if (prefill.departureDate) {
    departure.input.value = prefill.departureDate;
    ret.input.min = prefill.departureDate;
  }
  if (prefill.returnDate && form.dataset.tripType === 'RETURN') ret.input.value = prefill.returnDate;
  departure.sync();
  ret.sync();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = {
      tripType: form.dataset.tripType,
      origin: (origin.getValue() || {}).code,
      destination: (destination.getValue() || {}).code,
      departureDate: departure.input.value,
      returnDate: ret.input.value,
      adults: settings.adults,
      cabin: settings.cabin,
      // without the picker: the URL's children and infants
      ...(prefill.passengers ? {
        children: prefill.passengers.children, infants: prefill.passengers.infants,
      } : {}),
      nonstop: Boolean(nonstop && nonstop.checked),
      // the picker's adults, young adults, children, infants, cabin and fare preference
      ...(passengers ? passengers.getValue() : {}),
    };
    let message = '';
    let focus;
    if (!query.origin) {
      message = labels['origin error'];
      focus = origin.input;
    } else if (!query.destination) {
      message = labels['destination error'];
      focus = destination.input;
    } else if (query.origin === query.destination) {
      message = labels['same airport error'];
      focus = destination.input;
    } else if (!query.departureDate) {
      message = labels['date error'];
      focus = departure.display;
    } else if (query.tripType === 'RETURN' && !query.returnDate) {
      message = labels['return date error'];
      focus = ret.display;
    }
    error.textContent = message;
    error.hidden = !message;
    if (message) {
      focus.focus();
      return;
    }
    // consent.js loads lazily: it pulls in aem.js, which the offline widget test cannot run
    import('../../scripts/consent.js')
      .then(({ getStoredConsent }) => (getStoredConsent() || {}).groups)
      .catch(() => [])
      .then((consentGroups) => {
        const brand = brandEntry();
        const handoff = buildShopHandoff({ ...query, consentGroups }, locale, settings.shop, brand);
        submitShopHandoff(applyPickerChoices(handoff, query));
      });
  });

  const flightContent = [form];
  if (links && links.querySelector('a[href]')) {
    const linkRow = el('div', 'flight-search-links');
    linkRow.append(...links.childNodes);
    flightContent.push(linkRow);
    showLinksInUse(block);
  }

  if (!tabbed) {
    content.append(...flightContent);
  } else {
    const uid = Math.random().toString(36).slice(2, 8);
    const panels = {};
    if (hasFlight) {
      panels.flight = el('div', 'flight-search-panel flight-search-flight');
      panels.flight.append(...flightContent);
    }
    const tabBar = el('div', 'flight-search-tabs');
    tabBar.setAttribute('role', 'tablist');
    const tabButtons = [];
    // i < 0: every panel closed (the hotel tab's close button), the tabs open them again
    const select = (i) => {
      tabButtons.forEach((tab, j) => {
        tab.setAttribute('aria-selected', String(j === i));
        tab.tabIndex = j === i || (i < 0 && j === 0) ? 0 : -1;
      });
      Object.entries(panels).forEach(([kind, panel]) => {
        panel.hidden = i < 0 || tabKindList[i] !== kind;
      });
      block.classList.toggle('flight-search-closed', i < 0);
    };
    if (tabKindList.includes('hotel')) panels.hotel = buildHotelPanel(config, locale, () => select(-1));
    settings.tabs.forEach((label, i) => {
      const kind = tabKindList[i];
      const tab = el('button', `flight-search-tab flight-search-tab-${kind}`);
      tab.type = 'button';
      tab.setAttribute('role', 'tab');
      tab.id = `flight-search-tab-${kind}-${uid}`;
      tab.append(el('span', 'flight-search-tab-label', label));
      const panel = panels[kind];
      if (panel && !panel.id) {
        panel.id = `flight-search-panel-${kind}-${uid}`;
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', tab.id);
        tab.setAttribute('aria-controls', panel.id);
      }
      // tabs without a form here (rental car) open the page on the live site
      tab.addEventListener('click', () => {
        if (panel) select(i);
        else window.open(livePageUrl(config), '_blank', 'noopener');
      });
      tab.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const next = tabButtons[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabButtons.length)
          % tabButtons.length];
        next.focus();
      });
      tabButtons.push(tab);
      tabBar.append(tab);
    });
    content.append(tabBar, ...Object.values(panels));
    const authoredActive = text('active-tab').toLowerCase();
    const active = settings.tabs.findIndex((l) => l.toLowerCase() === authoredActive);
    const first = tabKindList.findIndex((k) => panels[k]);
    select(active >= 0 && panels[tabKindList[active]] ? active : first);
  }

  // read before the rows are replaced: the pictures move into the band
  const background = pick(config, 'background-image');
  const backgroundMobile = pick(config, 'background-image-mobile');
  const backgroundVideo = pick(config, 'background-video');
  const backgroundTeaser = pick(config, 'background-teaser');
  block.replaceChildren(content);
  // Air Dolomiti (the variant airdolomiti, ./flight-search-airdolomiti.js): www's two trip type
  // tabs, and with an Open label row the phone card that opens the search as a panel; every other
  // brand's search as before
  if (block.classList.contains('airdolomiti')) {
    import('./flight-search-airdolomiti.js').then(({ default: decorateAirDolomiti }) => decorateAirDolomiti(block, {
      form, select: tripTypeSelect, openLabel: text('open-label'), lang: locale.lang,
    }));
  }
  if (background) {
    const mobileCell = backgroundMobile && backgroundMobile.cell;
    const videoCell = backgroundVideo && backgroundVideo.cell;
    const teaserCell = backgroundTeaser && backgroundTeaser.cell;
    addBackground(block, background.cell, mobileCell, videoCell, teaserCell);
  }

  if (!hasFlight) {
    // hotel only: no live data (the live hotel tab shows its built-in texts)
    markSource(block, {}, []);
    return;
  }

  loadFlightSearchData(settings, locale).then((data) => {
    Object.assign(sources, data.sources);
    markSource(block, sources, primary);
    labels = resolveLabels({
      [locale.lang]: { ...(DEFAULT_LABELS[locale.lang] || DEFAULT_LABELS.en), ...data.labels },
    }, config, locale.lang);
    refreshers.forEach((fn) => fn(labels));
    // prefill like the live site (authored origin named, else the market default airport)
    // unless the visitor already picked an origin
    if (!originTouched && !emptyOrigin) {
      origin.setValue(allowed(data.origin), { silent: true });
      updateSwapLabel();
    }
    if (allowed(data.destination) && data.destination.name && !destinationTouched) {
      destination.setValue(data.destination, { silent: true });
      updateSwapLabel();
    }
    // a prefilled code (the page URL's or authored) the names list lacks: named afterwards from
    // the airport suggestions, one request per field; an unknown code keeps the code; a field
    // the visitor picked or typed in meanwhile keeps the visitor's text
    const nameLater = (combobox, airport, touched) => {
      if (!allowed(airport) || airport.name || touched()) return;
      airportNameOf(airport.code, locale).then((name) => {
        // the field as prefilled still: not picked anew, not being typed in
        if (!name || touched() || (combobox.getValue() || {}).code !== airport.code
          || combobox.input.value !== airport.code) return;
        combobox.setValue({ code: airport.code, name }, { silent: true });
        updateSwapLabel();
      });
    };
    if (settings.origin) nameLater(origin, data.origin, () => originTouched);
    if (settings.destination) nameLater(destination, data.destination, () => destinationTouched);
  });
}
