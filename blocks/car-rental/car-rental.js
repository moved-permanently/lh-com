import {
  getLocale, LOCALE_TABLE, siteOrigin, brandEntry,
} from '../../scripts/locale.js';
import {
  readConfigRows, pick, resolveLabels,
} from '../../scripts/block-config.js';

/* ---------------------------------------------------------------------------------------------
 * The live car rental pages (.meilicarrental > .dcep-meili-car-rental, component MeiliCarRental
 * of the dcep bundle) render nothing but
 *   <div class="meili-car-rental">
 *     <div id="mli-root" data-ptid="105.14" data-locale="de-DE"></div>
 *   </div>
 * and load https://direct-ux.meili.travel/index.js, a loader that appends Meili's app
 * (static-cdn.meili.travel/assets/car/main.*.js + index.*.css) and mounts it into #mli-root
 * (promo banner, search form, partner texts: all of it is Meili content). The live page loads
 * it without waiting for the cookie consent, so this block does not wait either.
 * This block writes the same markup, loads index.js once when the block comes near the
 * viewport, and shows a look-alike of the empty search form, whose fields and button open the
 * live page, when the script fails or the app has not mounted within TIMING.mount.
 * ------------------------------------------------------------------------------------------- */

export const MEILI_SCRIPT = 'https://direct-ux.meili.travel/index.js';
/** Meili's loader appends its app with this id (index.js checks it before loading again). */
const MEILI_APP_SCRIPT_ID = 'mli-script';
const ROOT_ID = 'mli-root';
/**
 * mount: how long the app gets before the fallback form shows; late: how long a late mount
 * still replaces the fallback form; poll: check interval (ms; tools/importer/test-widgets.mjs
 * shortens them).
 */
export const TIMING = { mount: 8000, late: 30000, poll: 200 };

/** data-dcep ptid of the live pages by page name (used when the block has no Partner ID row). */
export const PARTNER_IDS = {
  sixt: '105.14',
  hertz: '105.13',
  europcar: '105.12',
  mietwagenangebote: '105.11',
  'lh-rentalcar': '105.11',
};

/**
 * Country shown in "I live in" (the live app shows the visitor's country by geo): the locale
 * table's country names in German and English.
 */
const COUNTRY_NAMES = Object.fromEntries(Object.values(LOCALE_TABLE)
  // a country's live rows last: they decide its names (a pilot row's come from www's labels)
  .sort((a, b) => (a.status === 'live') - (b.status === 'live'))
  .map((row) => [row.country, row.countryName]));

/**
 * Texts of the empty Meili search form, from the live snapshots (de/de and de/en sixt,
 * app v1.261.1). Any of them can be overridden with a row of the same name.
 */
const DEFAULT_LABELS = {
  en: {
    'form label': 'Search for car rentals',
    'different drop-off label': 'Drop off car at a different location',
    'location label': 'Pick-up & drop-off location',
    'location placeholder': 'Search for location...',
    'pick-up date label': 'Pick-up date',
    'drop-off date label': 'Drop-off date',
    'pick-up time label': 'Pick up',
    'drop-off time label': 'Drop off',
    'time label': 'Time',
    'age label': 'Driver aged between 30 - 69',
    'miles label': 'I want to spend Miles',
    'residency label': 'I live in',
    'submit label': 'Search',
    'submit aria label': 'Search for a car rental',
    'live hint': 'Opens the car rental search on lufthansa.com',
  },
  de: {
    'form label': 'Nach Mietwagen suchen',
    'different drop-off label': 'Rückgabe eines Autos an einem anderen Ort',
    'location label': 'Abhol- und Rückgabeort',
    'location placeholder': 'Nach Standort suchen ...',
    'pick-up date label': 'Abholdatum',
    'drop-off date label': 'Rückgabedatum',
    'pick-up time label': 'Abholung',
    'drop-off time label': 'Rückgabe',
    'time label': 'Uhrzeit',
    'age label': 'Fahrer*in im Alter von 30 bis 69 Jahren',
    'miles label': 'Ich möchte Miles einlösen',
    'residency label': 'Ich lebe in',
    'submit label': 'Suchen',
    'submit aria label': 'Nach einer Autovermietung suchen',
    'live hint': 'Öffnet die Mietwagensuche auf lufthansa.com',
  },
  fr: {
    'form label': 'Rechercher une voiture de location',
    'different drop-off label': 'Restituer la voiture dans un autre lieu',
    'location label': 'Lieu de retrait et de retour',
    'location placeholder': 'Rechercher un lieu...',
    'pick-up date label': 'Date de retrait',
    'drop-off date label': 'Date de retour',
    'pick-up time label': 'Retrait',
    'drop-off time label': 'Retour',
    'time label': 'Heure',
    'age label': 'Conducteur âgé de 30 à 69 ans',
    'miles label': 'Je souhaite utiliser des miles',
    'residency label': 'Pays de résidence',
    'submit label': 'Rechercher',
    'submit aria label': 'Rechercher une voiture de location',
    'live hint': 'Ouvre la recherche de voitures de location sur lufthansa.com',
  },
  es: {
    'form label': 'Buscar vehículo de alquiler',
    'different drop-off label': 'Devolver el coche en otro lugar',
    'location label': 'Lugar de recogida y devolución',
    'location placeholder': 'Buscar lugar...',
    'pick-up date label': 'Fecha de recogida',
    'drop-off date label': 'Fecha de vuelta',
    'pick-up time label': 'Recogida',
    'drop-off time label': 'Devolución',
    'time label': 'Hora',
    'age label': 'Conductor de entre 30 y 69 años',
    'miles label': 'Quiero canjear millas',
    'residency label': 'País de residencia',
    'submit label': 'Buscar',
    'submit aria label': 'Buscar vehículo de alquiler',
    'live hint': 'Abre la búsqueda de coches de alquiler en lufthansa.com',
  },
  el: {
    'form label': 'Αναζήτηση ενοικίασης αυτοκινήτου',
    'different drop-off label': 'Επιστροφή του αυτοκινήτου σε άλλη τοποθεσία',
    'location label': 'Τοποθεσία παραλαβής και επιστροφής',
    'location placeholder': 'Αναζήτηση τοποθεσίας...',
    'pick-up date label': 'Ημερομηνία παραλαβής',
    'drop-off date label': 'Ημερομηνία επιστροφής',
    'pick-up time label': 'Παραλαβή',
    'drop-off time label': 'Επιστροφή',
    'time label': 'Ώρα',
    'age label': 'Οδηγός ηλικίας 30 - 69 ετών',
    'miles label': 'Θέλω να εξαργυρώσω μίλια',
    'residency label': 'Χώρα διαμονής',
    'submit label': 'Αναζήτηση',
    'submit aria label': 'Αναζήτηση ενοικίασης αυτοκινήτου',
    'live hint': 'Ανοίγει την αναζήτηση ενοικίασης αυτοκινήτου στο lufthansa.com',
  },
  it: {
    'form label': 'Cerca un’auto a noleggio',
    'different drop-off label': 'Riconsegna in un altro luogo',
    'location label': 'Luogo di ritiro e riconsegna',
    'location placeholder': 'Cerca un luogo...',
    'pick-up date label': 'Data di ritiro',
    'drop-off date label': 'Data di riconsegna',
    'pick-up time label': 'Ritiro',
    'drop-off time label': 'Riconsegna',
    'time label': 'Ora',
    'age label': 'Conducente tra 30 e 69 anni',
    'miles label': 'Voglio utilizzare le miglia',
    'residency label': 'Paese di residenza',
    'submit label': 'Cerca',
    'submit aria label': 'Cerca un’auto a noleggio',
    'live hint': 'Apre la ricerca di auto a noleggio su lufthansa.com',
  },
  ja: {
    'form label': 'レンタカーを検索',
    'different drop-off label': '別の場所で返却',
    'location label': '受取・返却場所',
    'location placeholder': '場所を検索...',
    'pick-up date label': '受取日',
    'drop-off date label': '返却日',
    'pick-up time label': '受取',
    'drop-off time label': '返却',
    'time label': '時刻',
    'age label': '運転者の年齢 30～69歳',
    'miles label': 'マイルを利用する',
    'residency label': '居住国',
    'submit label': '検索',
    'submit aria label': 'レンタカーを検索',
    'live hint': 'lufthansa.comのレンタカー検索を開きます',
  },
  ko: {
    'form label': '렌터카 검색',
    'different drop-off label': '다른 장소에서 반납',
    'location label': '픽업 및 반납 장소',
    'location placeholder': '장소 검색...',
    'pick-up date label': '픽업 날짜',
    'drop-off date label': '반납 날짜',
    'pick-up time label': '픽업',
    'drop-off time label': '반납',
    'time label': '시간',
    'age label': '운전자 나이 30~69세',
    'miles label': '마일리지를 사용하겠습니다',
    'residency label': '거주 국가',
    'submit label': '검색',
    'submit aria label': '렌터카 검색',
    'live hint': 'lufthansa.com에서 렌터카 검색을 엽니다',
  },
  nl: {
    'form label': 'Huurauto zoeken',
    'different drop-off label': 'Auto op een andere locatie inleveren',
    'location label': 'Ophaal- en inleverlocatie',
    'location placeholder': 'Locatie zoeken...',
    'pick-up date label': 'Ophaaldatum',
    'drop-off date label': 'Inleverdatum',
    'pick-up time label': 'Ophalen',
    'drop-off time label': 'Inleveren',
    'time label': 'Tijd',
    'age label': 'Bestuurder tussen 30 en 69 jaar',
    'miles label': 'Ik wil Miles inwisselen',
    'residency label': 'Woonland',
    'submit label': 'Zoeken',
    'submit aria label': 'Een huurauto zoeken',
    'live hint': 'Opent het zoeken naar huurauto\'s op lufthansa.com',
  },
  pl: {
    'form label': 'Wyszukaj wynajem samochodu',
    'different drop-off label': 'Zwrot samochodu w innym miejscu',
    'location label': 'Miejsce odbioru i zwrotu',
    'location placeholder': 'Wyszukaj miejsce...',
    'pick-up date label': 'Data odbioru',
    'drop-off date label': 'Data zwrotu',
    'pick-up time label': 'Odbiór',
    'drop-off time label': 'Zwrot',
    'time label': 'Godzina',
    'age label': 'Kierowca w wieku 30–69 lat',
    'miles label': 'Chcę wykorzystać mile',
    'residency label': 'Kraj zamieszkania',
    'submit label': 'Szukaj',
    'submit aria label': 'Wyszukaj wynajem samochodu',
    'live hint': 'Otwiera wyszukiwarkę wynajmu samochodów na lufthansa.com',
  },
  pt: {
    'form label': 'Pesquisar aluguer de carros',
    'different drop-off label': 'Devolver o carro noutro local',
    'location label': 'Local de levantamento e devolução',
    'location placeholder': 'Pesquisar local...',
    'pick-up date label': 'Data de levantamento',
    'drop-off date label': 'Data de devolução',
    'pick-up time label': 'Levantamento',
    'drop-off time label': 'Devolução',
    'time label': 'Hora',
    'age label': 'Condutor com idade entre 30 e 69 anos',
    'miles label': 'Quero utilizar milhas',
    'residency label': 'País de residência',
    'submit label': 'Pesquisar',
    'submit aria label': 'Pesquisar aluguer de carros',
    'live hint': 'Abre a pesquisa de aluguer de carros em lufthansa.com',
  },
  ru: {
    'form label': 'Поиск автомобиля напрокат',
    'different drop-off label': 'Вернуть автомобиль в другом месте',
    'location label': 'Место получения и возврата',
    'location placeholder': 'Поиск места...',
    'pick-up date label': 'Дата получения',
    'drop-off date label': 'Дата возврата',
    'pick-up time label': 'Получение',
    'drop-off time label': 'Возврат',
    'time label': 'Время',
    'age label': 'Возраст водителя от 30 до 69 лет',
    'miles label': 'Я хочу потратить мили',
    'residency label': 'Страна проживания',
    'submit label': 'Найти',
    'submit aria label': 'Найти автомобиль напрокат',
    'live hint': 'Открывает поиск автомобилей напрокат на lufthansa.com',
  },
  zh: {
    'form label': '搜索租车',
    'different drop-off label': '在其他地点还车',
    'location label': '取车和还车地点',
    'location placeholder': '搜索地点...',
    'pick-up date label': '取车日期',
    'drop-off date label': '还车日期',
    'pick-up time label': '取车',
    'drop-off time label': '还车',
    'time label': '时间',
    'age label': '驾驶员年龄在30至69岁之间',
    'miles label': '我想使用里程',
    'residency label': '居住国家/地区',
    'submit label': '搜索',
    'submit aria label': '搜索租车',
    'live hint': '在 lufthansa.com 上打开租车搜索',
  },
};

/** The live app's default search: pick-up tomorrow, drop-off five days later, 10:00. */
const DEFAULT_TIME = '10:00';
const RENTAL_DAYS = 5;

let instanceCount = 0;

const text = (config, ...keys) => (pick(config, ...keys) || {}).text || '';

/** Page path without the local dev server's /content prefix. */
function livePath(pathname) {
  return pathname.replace(/^\/content(?=\/)/, '').replace(/\.html$/, '');
}

/**
 * Settings of an authored block.
 * @param {Object} config result of readConfigRows
 * @param {Object} locale result of getLocale()
 * @param {string} [pathname] page path
 * @returns {{ptid: string, script: string, locale: string, liveUrl: string}}
 */
export function readCarRentalSettings(config, locale, pathname = window.location.pathname) {
  const path = livePath(pathname);
  const page = path.split('/').filter(Boolean).pop() || '';
  const authoredPtid = text(config, 'partner-id', 'ptid', 'partner');
  const ptid = /^\d+(\.\d+)*$/.test(authoredPtid) ? authoredPtid : (PARTNER_IDS[page] || '');
  const script = text(config, 'script', 'meili-url', 'meiliurl');
  const localeTag = text(config, 'locale');
  const fallback = pick(config, 'fallback-link', 'live-page', 'link');
  const href = (fallback && fallback.link && fallback.link.getAttribute('href')) || (fallback && fallback.text) || '';
  return {
    ptid,
    // only Meili's own loader: the row must not load anything else into the page
    script: /^https:\/\/([a-z0-9-]+\.)*meili\.travel\/[^\s]*\.js$/i.test(script) ? script : MEILI_SCRIPT,
    locale: /^[a-z]{2}-[A-Z]{2}$/.test(localeTag) ? localeTag : `${locale.lang}-${locale.country.toUpperCase()}`,
    // a relative fallback: the page on the site's www (a brand's own, else www.lufthansa.com)
    liveUrl: /^https?:\/\//.test(href) ? href : `${siteOrigin()}${path}`,
  };
}

/** Dates of the live app's default search in the page locale ("Fr., 23. Okt."). */
export function defaultDates(localeTag, now = new Date()) {
  const day = (offset) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
  let format;
  try {
    format = new Intl.DateTimeFormat(localeTag, { weekday: 'short', day: 'numeric', month: 'short' });
  } catch (e) {
    format = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  }
  return { pickUp: format.format(day(1)), dropOff: format.format(day(1 + RENTAL_DAYS)) };
}

function el(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.append(content);
  return node;
}

/** A field of the look-alike: a submit button showing a label and a value. */
function field(className, label, value, extra) {
  const button = el('button', `car-rental-field ${className}`);
  button.type = 'submit';
  const labelSpan = el('span', 'car-rental-field-label');
  if (extra) labelSpan.append(el('span', 'car-rental-sr-only', extra));
  labelSpan.append(label);
  button.append(labelSpan, el('span', 'car-rental-field-value', value));
  return button;
}

function check(label, checked) {
  const button = el('button', 'car-rental-check');
  button.type = 'submit';
  button.append(el('span', `car-rental-box${checked ? ' is-checked' : ''}`), el('span', 'car-rental-check-label', label));
  return button;
}

function dateTime(kind, labels, date) {
  const group = el('div', `car-rental-datetime car-rental-${kind}`);
  group.append(
    field('car-rental-date', labels[`${kind} date label`], date),
    field('car-rental-time', labels['time label'], DEFAULT_TIME, labels[`${kind} time label`]),
  );
  return group;
}

/**
 * The empty Meili search form as a look-alike: every field and the button open the live page,
 * where the real widget runs. No data is sent.
 */
export function buildFallbackForm(settings, labels, locale, now = new Date()) {
  instanceCount += 1;
  const form = el('form', 'car-rental-form');
  form.action = settings.liveUrl;
  form.setAttribute('action', settings.liveUrl);
  form.method = 'get';
  form.setAttribute('method', 'get');
  form.setAttribute('aria-label', labels['form label']);
  const hintId = `car-rental-hint-${instanceCount}`;
  const hint = el('p', 'car-rental-sr-only', labels['live hint']);
  hint.id = hintId;

  const top = el('div', 'car-rental-row car-rental-row-top');
  top.append(check(labels['different drop-off label'], false));

  const dates = defaultDates(settings.locale, now);
  const mid = el('div', 'car-rental-row car-rental-row-mid');
  const datesBox = el('div', 'car-rental-dates');
  datesBox.append(dateTime('pick-up', labels, dates.pickUp), dateTime('drop-off', labels, dates.dropOff));
  mid.append(field('car-rental-location', labels['location label'], labels['location placeholder']), datesBox);

  const bottom = el('div', 'car-rental-row car-rental-row-bottom');
  const checks = el('div', 'car-rental-checks');
  checks.append(check(labels['age label'], true), check(labels['miles label'], false));
  const country = (COUNTRY_NAMES[locale.country] || COUNTRY_NAMES.de)[locale.lang === 'de' ? 'de' : 'en'];
  const residency = field('car-rental-residency', labels['residency label'], country);
  const submit = el('button', 'car-rental-submit button primary', labels['submit label']);
  submit.type = 'submit';
  submit.setAttribute('aria-label', labels['submit aria label']);
  const actions = el('div', 'car-rental-actions');
  actions.append(residency, submit);
  bottom.append(checks, actions);

  form.append(hint, top, mid, bottom);
  form.querySelectorAll('button').forEach((b) => b.setAttribute('aria-describedby', hintId));
  return form;
}

/** Whether Meili's app rendered into the root (index.js → main.js sets .mli-loaded). */
export function isMounted(root) {
  return Boolean(root && (root.classList.contains('mli-loaded') || root.querySelector('#mli-app, .mli-config')));
}

/** Loads Meili's loader once per page; resolves false when it cannot load. */
function loadMeili(src) {
  if (document.querySelector(`#${MEILI_APP_SCRIPT_ID}`) || document.querySelector(`script[src="${src}"]`)) {
    return Promise.resolve(true);
  }
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.append(script);
  });
}

/** Calls fn once the block is near the viewport (at once without IntersectionObserver). */
function whenNear(block, fn) {
  if (typeof window.IntersectionObserver !== 'function') {
    fn();
    return;
  }
  const observer = new window.IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      fn();
    }
  }, { rootMargin: '600px 0px' });
  observer.observe(block);
}

/**
 * Meili car rental search: mounts Meili's app as the live page does, with a look-alike of the
 * empty search form (opening the live page) when the app cannot run.
 * @param {Element} block
 * @returns {Promise<void>} resolves when the app mounted or the fallback is shown (at once in a
 *   browser with IntersectionObserver: the mount waits for the visible section)
 */
export default function decorate(block) {
  const locale = getLocale();
  const config = readConfigRows(block);
  const settings = readCarRentalSettings(config, locale);
  const labels = resolveLabels(DEFAULT_LABELS, config, locale.lang);
  // a brand page: the search opens on the brand's www
  const brand = brandEntry();
  if (brand && brand.www) labels['live hint'] = labels['live hint'].replace('lufthansa.com', brand.www.replace(/^www\./, ''));

  const wrapper = el('div', 'meili-car-rental');
  // Meili looks its root up by id: only the first block of a page can host the app
  const canMount = Boolean(settings.ptid) && !document.querySelector(`#${ROOT_ID}`);
  let root = null;
  if (canMount) {
    root = el('div');
    root.id = ROOT_ID;
    root.dataset.ptid = settings.ptid;
    root.dataset.locale = settings.locale;
    wrapper.append(root);
  }
  block.replaceChildren(wrapper);
  block.dataset.state = 'loading';

  let fallback = null;
  const showFallback = (reason) => {
    if (fallback) return;
    fallback = buildFallbackForm(settings, labels, locale);
    block.append(fallback);
    block.dataset.state = 'fallback';
    block.dataset.lhSource = 'none';
    block.dataset.lhSources = `meili:${reason}`;
  };
  const mounted = () => {
    if (fallback) fallback.remove();
    fallback = null;
    block.dataset.state = 'mounted';
    block.dataset.lhSource = 'live';
    block.dataset.lhSources = 'meili:live';
  };

  if (!canMount) {
    showFallback(settings.ptid ? 'second-root' : 'no-partner-id');
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    whenNear(block, () => {
      const start = Date.now();
      let settled = false;
      const settle = () => {
        if (!settled) resolve();
        settled = true;
      };
      const poll = () => {
        if (isMounted(root)) {
          mounted();
          settle();
          return;
        }
        const waited = Date.now() - start;
        if (waited >= TIMING.mount && !fallback) {
          showFallback('timeout');
          settle();
        }
        if (waited < TIMING.late) setTimeout(poll, TIMING.poll);
      };
      loadMeili(settings.script).then((loaded) => {
        if (!loaded) {
          showFallback('script-error');
          settle();
          return;
        }
        poll();
      });
    });
    // with an IntersectionObserver the section is still hidden (aem.js shows it once its blocks
    // are decorated) and a hidden block never comes near the viewport: waiting here would keep
    // the section, and the page, hidden for good. The app mounts after the section shows.
    if (typeof window.IntersectionObserver === 'function') resolve();
  });
}
