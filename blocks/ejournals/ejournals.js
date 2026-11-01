import {
  getLocale, siteOrigin, serviceOrigin, brandEntry,
} from '../../scripts/locale.js';
import {
  readConfigRows, pick, resolveLabels, toConfigKey,
} from '../../scripts/block-config.js';
import {
  fetchLabels, pickLabels, fetchRequest, fillLabel, ejournalsRequest, ejournalsReference,
  EJOURNALS_REFERENCE, mapEjournals, mapUpcomingTrips,
} from '../../scripts/lh-api.js';
import { markSource } from '../../scripts/lh-data.js';
import { isOwnWww } from '../../scripts/handoff.js';

/* ---------------------------------------------------------------------------------------------
 * The eJournals download as www's component (@core/containers-ejournals, the same on Lufthansa,
 * ITA, Austrian and Brussels; chunk e0840412):
 * - the booking selection notice "Log in with your profile to select a booking." with "Go to
 *   login": the Travel ID login of the page's brand (scripts/brands.js travelId, else
 *   Lufthansa's), back to the page on the brand's www;
 * - the manual search "Booking code or ticket number" and "Last name": POST
 *   /service/api/ejournals {ticketNumber, lastName} for 13 digits, {bookingCode, lastName} for 6
 *   characters, live only (scripts/lh-data.js; on a demo host on the brand's serviceOrigin, else
 *   www.lufthansa.com, both answer our hosts); the tickets with their flights and "Download
 *   eJournals" (the ticket's deep link), "no tickets" or an error with the page on www;
 * - partner links: ?lastname=…&pnrfilekey=… (www's names) prefill the search and send it;
 * - signed in (Travel ID answers the airline's own host only): on the brand's own www host with a
 *   "Trips endpoint" row, the traveller's bookings (<endpoint>/flights/v3/me/upcoming-trips);
 *   choosing one searches it, "My flight is not displayed" opens the manual entry. Inert elsewhere.
 * Texts: authored rows, then the live labels (labels/common, labels/ejournals), then the
 * built-in copies.
 * ------------------------------------------------------------------------------------------- */

// www's labels/ejournals/lh/en (2026-11-01), else the component's defaults
const EN = {
  'notice label': 'Log in with your profile to select a booking.',
  'login label': 'Go to login',
  'field label': 'Booking code or ticket number',
  'field hint': 'e.g. ABC123 or 2201234567890',
  'field required': 'Please enter your booking code or ticket number',
  'field invalid': 'Invalid booking code or ticket number',
  'name label': 'Last name',
  'name hint': 'as on your ticket',
  'name required': 'Please enter your last name as booked.',
  'name too long': 'Name is too long',
  'submit label': 'To free download',
  'booking code label': 'Booking code',
  'flights label': 'Flights',
  'route label': '{ORIGIN} to {DESTINATION}',
  'date format': '{ddd}, {DD}.{MM}.{Y}',
  'download label': 'Download',
  'search again label': 'New search',
  'empty label': 'Unfortunately, no tickets could be found for your search. Please check your input for spelling errors',
  'error label': 'Your eJournals could not be loaded. Please try again later.',
  'error link label': 'Search on {HOST}',
  'bookings label': 'Your bookings',
  'not displayed label': 'My flight is not displayed',
  'bookings error title': 'We could not load your bookings',
  'bookings error message': 'Please try again, or enter your booking code manually below.',
  'retry label': 'Try again',
};

const DEFAULT_LABELS = {
  en: EN,
  // www's labels/ejournals/lh/de (2026-11-01) where it has German texts
  de: {
    ...EN,
    'notice label': 'Melden Sie sich mit Ihrem Profil an, um eine Buchung auszuwählen.',
    'login label': 'Zum Login',
    'field label': 'Buchungscode oder Ticketnummer',
    'field hint': 'z. B. ABC123 oder 2201234567890',
    'field required': 'Bitte geben Sie Ihren Buchungscode oder Ihre Ticketnummer ein.',
    'field invalid': 'Ungültiger Buchungscode oder ungültige Ticketnummer',
    'name label': 'Nachname',
    'name hint': 'wie auf Ihrem Ticket',
    'name required': 'Bitte geben Sie Ihren Nachnamen wie gebucht ein.',
    'name too long': 'Der eingegebene Nachname ist zu lang.',
    'submit label': 'Zum Gratis Download',
    'booking code label': 'Buchungscode',
    'flights label': 'Ihre Flüge:',
    'route label': '{ORIGIN} nach {DESTINATION}',
    'download label': 'eJournals abrufen',
    'search again label': 'Neue Suche',
    'empty label': 'Wir konnten leider keine Tickets finden. Bitte prüfen Sie Ihre Eingaben.',
    'error label': 'Ihre eJournals konnten nicht geladen werden. Bitte versuchen Sie es später erneut.',
    'error link label': 'Zur Suche auf {HOST}',
    'bookings label': 'Ihre Buchungen',
    'not displayed label': 'Mein Flug wird nicht angezeigt',
    'bookings error title': 'Wir konnten Ihre Buchungen nicht laden',
    'bookings error message': 'Bitte versuchen Sie es erneut oder geben Sie Ihren Buchungscode unten ein.',
    'retry label': 'Erneut versuchen',
  },
};

const S = 'ejournals.searchmask.default';
const R = 'ejournals.searchresults.default';
/** Live label keys: the booking selection container (common) and www's ejournals bundle. */
const LIVE_LABEL_KEYS = {
  'notice label': 'common.bookingcodeselection.container.messageBoxTitle',
  'login label': 'common.bookingcodeselection.container.loginLinkText',
  'field label': `${S}.pnrOrTicketNumber.label`,
  'field hint': `${S}.pnrOrTicketNumber.hint`,
  'field required': `${S}.pnrOrTicketNumber.errorRequired`,
  'field invalid': `${S}.pnrOrTicketNumber.errorPattern`,
  'name label': `${S}.lastName.label`,
  'name hint': `${S}.lastName.hint`,
  'name required': `${S}.lastName.errorRequired`,
  'name too long': `${S}.lastName.errorMaxLength`,
  'submit label': `${S}.submitSearch`,
  'booking code label': `${R}.bookingcode`,
  'flights label': `${R}.flights`,
  'route label': `${R}.screenreaderod`,
  'date format': `${R}.dateformat`,
  'download label': `${R}.download`,
  'search again label': 'ejournals.common.default.search',
  'empty label': 'ejournals.common.default.empty',
  'not displayed label': `${S}.myFlightNotDisplayed`,
  'bookings error title': `${S}.bookingFetchError.title`,
  'bookings error message': `${S}.bookingFetchError.message`,
  'retry label': `${S}.bookingFetchError.retry`,
};

/** Lufthansa's Travel ID login (the live header's and booking selection's; returns to `state`). */
const LH_TRAVEL_ID = { host: 'api.travelid.lufthansa.com', clientId: 'yA8iz2C5BnAIf2GKKdkAlgPPW9y6wjLO' };
const LOGIN_SCOPE = 'AUTHENTICATED IDENTIFIED urn:milesandmore:tech:background:v1:active urn:milesandmore:oauth:multifactorauthentication';
/** www's maximum length of the last name. */
const NAME_MAX = 31;

let instanceCount = 0;

/** Page path without the local dev server's /content prefix. */
const livePath = (pathname) => pathname.replace(/^\/content(?=\/)/, '').replace(/\.html$/, '');

/**
 * The live "Go to login" link of a page: the brand's Travel ID (scripts/brands.js travelId,
 * else Lufthansa's) with state = the page path and redirect_uri = the brand's www (as www's own
 * login links).
 * @param {string} path live page path, e.g. /de/en/unterhaltung-an-bord
 * @param {Object} locale result of getLocale()
 */
export function loginUrl(path, locale) {
  const brand = brandEntry();
  const travelId = (brand && brand.travelId) || LH_TRAVEL_ID;
  const params = new URLSearchParams({
    client_id: travelId.clientId,
    response_type: 'code',
    redirect_uri: siteOrigin(),
    scope: LOGIN_SCOPE,
    state: path,
    principal_type: 'EMAIL',
    reduced_state: 'NONE',
    view: 'login',
    prompt: 'login',
    country: locale.country.toUpperCase(),
    lang: locale.lang,
  });
  // the live link writes the spaces of the scope as %20 and keeps / and : as they are
  return `https://${travelId.host}/oauth2/authorize?${params.toString().replace(/\+/g, '%20').replace(/%2F/g, '/').replace(/%3A/g, ':')}`;
}

/**
 * Settings of an authored block: the page on the brand's www (the error's link), the login link
 * and the Trips endpoint (the signed-in bookings; www's component config, not public).
 */
export function readEjournalsSettings(config, locale, pathname = window.location.pathname) {
  const path = livePath(pathname);
  const href = (row) => {
    if (!row) return '';
    const value = (row.link && row.link.getAttribute('href')) || row.text;
    return /^https:\/\//.test(value) ? value : '';
  };
  return {
    liveUrl: href(pick(config, 'live-page', 'fallback-link')) || `${siteOrigin()}${path}`,
    loginUrl: href(pick(config, 'login-link', 'login-url')) || loginUrl(path, locale),
    tripsEndpoint: href(pick(config, 'trips-endpoint')).replace(/\/+$/, ''),
  };
}

/** A date (YYYY-MM-DD) in www's moment format: {ddd}, {DD}.{MM}.{Y} (also D, M, YYYY). */
function formatDate(iso, format, lang) {
  const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return String(iso || '');
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  let weekday = '';
  try {
    weekday = new Intl.DateTimeFormat(lang, { weekday: 'short', timeZone: 'UTC' }).format(date);
  } catch (e) {
    weekday = new Intl.DateTimeFormat('en', { weekday: 'short', timeZone: 'UTC' }).format(date);
  }
  const values = {
    ddd: weekday,
    DD: m[3],
    D: String(Number(m[3])),
    MM: m[2],
    M: String(Number(m[2])),
    YYYY: m[1],
    Y: m[1],
  };
  return String(format).replace(/\{(ddd|DD|D|MM|M|YYYY|Y)\}/g, (all, k) => values[k]);
}

/** Query parameters by lower-case name (partner links write LastName, lastname, …). */
function queryValue(search, name) {
  const entry = [...new URLSearchParams(search || '')].find(([k]) => k.toLowerCase() === name);
  return entry ? entry[1].trim() : '';
}

function el(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.append(content);
  return node;
}

/**
 * eJournals download.
 * @param {Element} block
 * @returns {Promise<void>} resolves when the live labels are applied (and a prefilled search or
 *   the signed-in bookings have answered)
 */
export default async function decorate(block) {
  instanceCount += 1;
  const n = instanceCount;
  const locale = getLocale();
  const config = readConfigRows(block);
  const settings = readEjournalsSettings(config, locale);
  const defaults = resolveLabels(DEFAULT_LABELS, {}, locale.lang);
  let live = {};
  const text = (key) => {
    const row = config[toConfigKey(key)];
    return (row && row.text) || live[key] || defaults[key];
  };
  const onOwnHost = isOwnWww(window.location.href);
  const wwwHost = new URL(settings.liveUrl).host;

  const notice = el('div', 'ejournals-notice');
  notice.setAttribute('role', 'note');
  const copy = el('p', 'ejournals-notice-copy');
  const login = el('a', 'ejournals-login');
  login.href = settings.loginUrl;
  notice.append(copy, login);

  // the signed-in bookings (filled on the own host only)
  const bookings = el('div', 'ejournals-bookings-area');
  bookings.hidden = true;

  const form = el('form', 'ejournals-form');
  form.noValidate = true;
  const field = (name, maxLength, autocomplete) => {
    const wrap = el('div', 'ejournals-field');
    const id = `ejournals-${name}-${n}`;
    const label = el('label');
    label.setAttribute('for', id);
    const input = el('input');
    input.id = id;
    input.name = name;
    input.type = 'text';
    input.autocomplete = autocomplete;
    input.maxLength = maxLength;
    input.spellcheck = false;
    const hint = el('p', 'ejournals-hint');
    hint.id = `${id}-hint`;
    const error = el('p', 'ejournals-error');
    error.id = `${id}-error`;
    error.hidden = true;
    input.setAttribute('aria-describedby', hint.id);
    wrap.append(label, input, hint, error);
    return {
      wrap, label, input, hint, error,
    };
  };
  const reference = field('pnrOrTicketNumber', 13, 'off');
  const name = field('lastName', NAME_MAX, 'family-name');
  const submit = el('button', 'ejournals-submit button primary');
  submit.type = 'submit';
  form.append(reference.wrap, name.wrap, el('div', 'ejournals-actions', submit));

  const message = el('div', 'ejournals-message');
  message.setAttribute('role', 'status');
  message.hidden = true;

  const applyTexts = () => {
    copy.textContent = text('notice label');
    login.textContent = text('login label');
    [[reference, 'field'], [name, 'name']].forEach(([f, key]) => {
      f.label.textContent = text(`${key} label`);
      f.input.placeholder = text(`${key} label`);
      f.hint.textContent = text(`${key} hint`);
      f.hint.hidden = !f.hint.textContent;
    });
    submit.textContent = text('submit label');
  };
  applyTexts();
  block.replaceChildren(notice, bookings, form, message);

  const labelsLoaded = fetchLabels(['common', 'ejournals'], locale).then(({ labels, sources }) => {
    live = pickLabels(labels, LIVE_LABEL_KEYS);
    applyTexts();
    markSource(block, {
      'labels/common': sources.common,
      'labels/ejournals': sources.ejournals,
    }, ['labels/common', 'labels/ejournals']);
  });

  let trips = [];
  const setError = (f, key) => {
    f.error.textContent = key ? text(key) : '';
    f.error.hidden = !key;
    f.input.setAttribute('aria-invalid', key ? 'true' : 'false');
    f.input.setAttribute('aria-describedby', key ? `${f.hint.id} ${f.error.id}` : f.hint.id);
  };
  const showMessage = (content) => {
    message.replaceChildren(...content);
    message.hidden = !content.length;
  };
  const clearResults = () => {
    const old = block.querySelector('.ejournals-results');
    if (old) old.remove();
  };
  /** The starting view: the bookings when signed in, else the manual entry. */
  const startOver = () => {
    clearResults();
    showMessage([]);
    bookings.hidden = !trips.length;
    const notDisplayed = bookings.querySelector('.ejournals-not-displayed');
    if (notDisplayed) notDisplayed.hidden = false;
    form.hidden = Boolean(trips.length);
  };

  const renderResults = (data) => {
    const results = el('div', 'ejournals-results');
    if (data.bookingCode) {
      const label = text('booking code label');
      results.append(el('h2', 'ejournals-booking-code', /\{CODE\}/.test(label)
        ? fillLabel(label, { CODE: data.bookingCode })
        // www's live label has no placeholder ("Booking code"): the code after it
        : `${label.replace(/:?\s*$/, '')}: ${data.bookingCode}`));
    }
    results.append(el('h3', 'ejournals-flights-title', text('flights label')));
    data.tickets.forEach((ticket) => {
      const group = el('div', 'ejournals-ticket');
      const list = el('ul', 'ejournals-flights');
      ticket.segments.forEach((s) => {
        const row = el('li', 'ejournals-flight');
        const number = el('span', 'ejournals-flight-number', [s.carrier, s.flightNumber.replace(/^0+(?=\d)/, '')].filter(Boolean).join(' '));
        const date = el('span', 'ejournals-flight-date', formatDate(s.date, text('date format'), locale.lang));
        const route = el('span', 'ejournals-flight-route', `${s.origin} – ${s.destination}`);
        route.setAttribute('aria-hidden', 'true');
        const sr = el('span', 'ejournals-sr', fillLabel(text('route label'), { ORIGIN: s.originName, DESTINATION: s.destinationName }));
        row.append(number, date, route, sr);
        list.append(row);
      });
      group.append(list);
      if (ticket.download) {
        const download = el('a', 'ejournals-download button primary', text('download label'));
        download.href = ticket.download.url;
        if (ticket.download.target) {
          download.target = ticket.download.target;
          download.rel = 'noopener';
        }
        group.append(el('p', 'button-container', download));
      }
      results.append(group);
    });
    const again = el('button', 'ejournals-search-again button secondary', text('search again label'));
    again.type = 'button';
    again.addEventListener('click', startOver);
    results.append(el('div', 'ejournals-actions', again));
    return results;
  };

  const errorMessage = () => {
    const p = el('p', '', text('error label'));
    // on the airline's own host the page on www is this page
    if (!onOwnHost) {
      const a = el('a', 'ejournals-live-link', fillLabel(text('error link label'), { HOST: wwwHost }));
      a.href = settings.liveUrl;
      p.append(' ', a);
    }
    return [p];
  };

  let searching = 0;
  /** Sends a search; the request from ejournalsRequest. */
  const runSearch = async (request) => {
    searching += 1;
    const mine = searching;
    clearResults();
    showMessage([]);
    block.setAttribute('aria-busy', 'true');
    submit.disabled = true;
    let outcome;
    try {
      const { data } = await fetchRequest(request, locale, { origin: serviceOrigin() });
      outcome = { data: mapEjournals(data) };
    } catch (e) {
      outcome = { error: e };
    }
    await labelsLoaded;
    if (mine !== searching) return;
    block.removeAttribute('aria-busy');
    submit.disabled = false;
    if (outcome.error) {
      showMessage(errorMessage());
    } else if (!outcome.data.tickets.length) {
      showMessage([el('p', '', text('empty label'))]);
    } else {
      form.hidden = true;
      bookings.hidden = true;
      block.append(renderResults(outcome.data));
    }
  };

  /** Checks the manual entry as www does; the request, or null with the errors shown. */
  const validate = () => {
    const ref = ejournalsReference(reference.input.value);
    const last = name.input.value.trim();
    let refError = '';
    if (!ref) refError = 'field required';
    else if (!EJOURNALS_REFERENCE.test(ref)) refError = 'field invalid';
    let nameError = '';
    if (!last) nameError = 'name required';
    else if (last.length > NAME_MAX) nameError = 'name too long';
    setError(reference, refError);
    setError(name, nameError);
    if (refError || nameError) {
      (refError ? reference : name).input.focus();
      return null;
    }
    reference.input.value = ref;
    return ejournalsRequest({ reference: ref, lastName: last });
  };

  const searches = [];
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const request = validate();
    if (request) searches.push(runSearch(request));
  });

  // partner links: www's names (sessionValues lastname, pnrfilekey); both: the search is sent
  const prefill = {
    lastName: queryValue(window.location.search, 'lastname'),
    reference: ejournalsReference(queryValue(window.location.search, 'pnrfilekey')),
  };
  if (prefill.lastName) name.input.value = prefill.lastName;
  if (prefill.reference) reference.input.value = prefill.reference;
  if (prefill.lastName && prefill.reference) {
    const request = validate();
    if (request) searches.push(runSearch(request));
  }

  /** The signed-in bookings (own host and a Trips endpoint row only). */
  const loadTrips = async () => {
    if (!onOwnHost || !settings.tripsEndpoint) return;
    const brand = brandEntry();
    let resp;
    try {
      resp = await fetch(`${settings.tripsEndpoint}/flights/v3/me/upcoming-trips`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
        headers: {
          tenant: String((brand && brand.airline) || 'LH').toUpperCase(),
          lang: `${locale.lang}-${locale.country.toUpperCase()}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (e) {
      // not signed in (Travel ID refuses the call) or offline: the manual entry
      return;
    }
    await labelsLoaded;
    if (!resp.ok) {
      // a server error while signed in: www's notice with a retry; signed out (401, 403): nothing
      if (resp.status >= 500) {
        const box = el('div', 'ejournals-bookings-error');
        box.setAttribute('role', 'alert');
        const retry = el('button', 'ejournals-retry button secondary', text('retry label'));
        retry.type = 'button';
        retry.addEventListener('click', () => {
          box.remove();
          loadTrips();
        });
        box.append(el('p', 'ejournals-bookings-error-title', text('bookings error title')), el('p', '', text('bookings error message')), retry);
        bookings.replaceChildren(box);
        bookings.hidden = false;
      }
      return;
    }
    let data;
    try {
      data = await resp.json();
    } catch (e) {
      return;
    }
    trips = mapUpcomingTrips(data).filter((t) => t.filekey && t.name);
    if (!trips.length) return;
    const list = el('ul', 'ejournals-bookings');
    list.setAttribute('aria-label', text('bookings label'));
    trips.forEach((trip) => {
      const choice = el('button', 'ejournals-booking');
      choice.type = 'button';
      const route = el('span', 'ejournals-booking-route', `${trip.origin} – ${trip.destination}`);
      route.setAttribute('aria-hidden', 'true');
      choice.append(
        route,
        el('span', 'ejournals-sr', fillLabel(text('route label'), { ORIGIN: trip.originName || trip.origin, DESTINATION: trip.destinationName || trip.destination })),
        el('span', 'ejournals-booking-date', formatDate(trip.date, text('date format'), locale.lang)),
        el('span', 'ejournals-booking-code', trip.filekey),
      );
      choice.addEventListener('click', () => {
        reference.input.value = trip.filekey;
        name.input.value = trip.name;
        const request = ejournalsRequest({ reference: trip.filekey, lastName: trip.name });
        if (request) searches.push(runSearch(request));
      });
      list.append(el('li', '', choice));
    });
    const notDisplayed = el('button', 'ejournals-not-displayed', text('not displayed label'));
    notDisplayed.type = 'button';
    notDisplayed.addEventListener('click', () => {
      notDisplayed.hidden = true;
      form.hidden = false;
      reference.input.focus();
    });
    bookings.replaceChildren(list, notDisplayed);
    // signed in: the login notice gives way to the bookings
    notice.hidden = true;
    startOver();
  };

  await Promise.all([labelsLoaded, loadTrips(), ...searches]);
}
