import { getLocale, LIVE_ORIGIN, LOCALE_TABLE } from '../../scripts/locale.js';
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
    liveUrl: /^https?:\/\//.test(href) ? href : `${LIVE_ORIGIN}${path}`,
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
