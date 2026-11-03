/*
 * Own-host hand-offs (brief 207): on the airline's own www host, which is where these pages run
 * once www is this site, the manage booking tab (blocks/booking-lookup my-bookings), the hotel tab
 * (blocks/flight-search) and the check-in form (blocks/booking-lookup) do what www's AEM
 * components do: post to the AEM endpoint (rebuilt outside AEM) and open the target it answers.
 * Elsewhere (turnsthe.page, aem.page, aem.live) the blocks keep their hand-off to the page on www,
 * so the test-data backend behind the replica's hosts never gets a visitor's booking data;
 * ?handoff=post switches the post mode on for a test on turnsthe.page and aem.page.
 *
 * www's calls (its component chunks, 2026-11-01), all same-origin with X-Portal, X-Portal-Site and
 * X-Portal-Language:
 * - manage booking: POST /service/secured/api/core/filekeylogin {filekey, firstname, lastname}
 *   (the session cookie dcep.fklnperson), then GET /service/secured/api/core/booking/
 *   bookingdetailslink?layout=L|S → {hasIrreg, linkTarget};
 * - hotel: POST /service/secured/api/core/booking/hotel {cityName, checkInDate, checkOutDate} →
 *   a link target;
 * - check-in: POST /service/secured/api/core/checkin/fktn {firstName, lastName, fileKey, layout} →
 *   a link target; 400 {"error":"checkin.error.<code>"} (www's text: common.checkin.error.<code>).
 * A link target: {targetURL, parameters: [{key, values}], newWindow, methodGet}, opened as www
 * does: a form with a field per value, POST unless methodGet, a new window if newWindow.
 */
import { getLocale, brandEntry, LIVE_ORIGIN } from './locale.js';
import { BRANDS } from './brands.js';
import { isTurnsThePageHost } from './demo.js';
import { portalHeaders } from './lh-data.js';

/** Per brand (lh: lufthansa.com) the hosts with the post mode: the airline's own www host. */
export const POST_HANDOFF_HOSTS = {
  lh: [new URL(LIVE_ORIGIN).hostname],
  ...Object.fromEntries(Object.entries(BRANDS).filter(([, b]) => b.www)
    .map(([key, b]) => [key, [b.www]])),
};

const API = '/service/secured/api/core';

/** The page's brand key (lh: lufthansa.com). */
function brandKey() {
  const entry = brandEntry();
  return (entry && Object.keys(BRANDS).find((k) => BRANDS[k] === entry)) || 'lh';
}

/**
 * Whether the page posts its hand-offs: on its brand's own www host; with ?handoff=post on a
 * turnsthe.page or aem.page host (the test-data backend), nowhere else.
 */
export function postHandoffOn(location = window.location) {
  const host = String(location.hostname || '').toLowerCase();
  if ((POST_HANDOFF_HOSTS[brandKey()] || []).includes(host)) return true;
  const test = new URLSearchParams(location.search || '').get('handoff') === 'post';
  return test && (isTurnsThePageHost(host) || /\.aem\.page$/.test(host));
}

/**
 * Whether a hand-off URL is on the airline's own www host: once www is this site, opening it
 * would come back to the same page (ITA's check-in Submit URL; lufthansa.com's check-in app on
 * once.lufthansa.com is not).
 */
export function isOwnWww(href) {
  try {
    const host = new URL(href, window.location.href).hostname.toLowerCase();
    return (POST_HANDOFF_HOSTS[brandKey()] || []).includes(host);
  } catch (e) {
    return false;
  }
}

/** www's layout parameter: S on small screens, else L. */
export function layout() {
  return window.matchMedia('(width < 768px)').matches ? 'S' : 'L';
}

/** A failed hand-off; code: www's error key (checkin.error.*). */
export class HandoffError extends Error {
  constructor(code, status) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

const NOT_FOUND = 'checkin.error.bookingNotFound';
const LINK_ERROR = 'checkin.error.linkGenerationError';

async function call(method, route, body, locale = getLocale()) {
  const headers = { ...portalHeaders(locale.key), Accept: 'application/json' };
  if (body) headers['Content-Type'] = 'application/json';
  const resp = await fetch(route, {
    method, credentials: 'same-origin', headers, body: body ? JSON.stringify(body) : undefined,
  }).catch(() => null);
  if (!resp) throw new HandoffError(LINK_ERROR, 0);
  let data = null;
  try {
    data = JSON.parse(await resp.text() || 'null');
  } catch (e) {
    data = null;
  }
  return { status: resp.status, ok: resp.ok, data };
}

const target = (data) => (data && typeof data.targetURL === 'string' && data.targetURL ? data : null);

/**
 * Manage booking: the file key login, then the booking's deeplink (www's my-bookings tab).
 * @returns {Promise<Object>} the link target
 */
export async function bookingTarget({ reference, firstName = '', lastName }, locale) {
  const login = await call('POST', `${API}/filekeylogin`, {
    filekey: reference, ...(firstName ? { firstname: firstName } : {}), lastname: lastName,
  }, locale);
  if (!login.ok) {
    const code = [400, 403, 404].includes(login.status) ? NOT_FOUND : LINK_ERROR;
    throw new HandoffError(code, login.status);
  }
  const link = await call('GET', `${API}/booking/bookingdetailslink?layout=${layout()}`, null, locale);
  const found = link.ok && link.data && target(link.data.linkTarget);
  if (!found) throw new HandoffError(link.status === 403 ? NOT_FOUND : LINK_ERROR, link.status);
  return found;
}

/** The hotel tab's search (dates as www sends them: the day's midnight UTC). */
export async function hotelTarget({ cityName, checkIn, checkOut }, locale) {
  const iso = (day) => `${day}T00:00:00.000Z`;
  const answer = await call('POST', `${API}/booking/hotel`, {
    cityName, checkInDate: iso(checkIn), checkOutDate: iso(checkOut),
  }, locale);
  const found = answer.ok && target(answer.data);
  if (!found) throw new HandoffError(LINK_ERROR, answer.status);
  return found;
}

/** The check-in form: booking reference or ticket number, first and last name. */
export async function checkinTarget({ reference, firstName, lastName }, locale) {
  const answer = await call('POST', `${API}/checkin/fktn`, {
    firstName, lastName, fileKey: reference, layout: layout(),
  }, locale);
  const found = answer.ok && target(answer.data);
  if (found) return found;
  const code = answer.data && /^checkin\.error\.[A-Za-z]+$/.test(answer.data.error) ? answer.data.error : LINK_ERROR;
  throw new HandoffError(code, answer.status);
}

/** Opens a link target as www does (its form: a field per value). */
export function openTarget(link, doc = document) {
  const form = doc.createElement('form');
  form.className = 'handoff-form';
  form.setAttribute('action', link.targetURL);
  form.setAttribute('method', link.methodGet ? 'GET' : 'POST');
  form.setAttribute('target', link.newWindow ? '_blank' : '_self');
  form.hidden = true;
  (Array.isArray(link.parameters) ? link.parameters : []).forEach(({ key, values }) => {
    (Array.isArray(values) ? values : [values]).forEach((value) => {
      const input = doc.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value ?? '';
      form.append(input);
    });
  });
  doc.body.append(form);
  form.submit();
  form.remove();
}

// www's texts of the error codes (common.checkin.error.*, lufthansa.com's common labels): the
// built-in copies; the page's own common labels win
const ERROR_TEXTS = {
  en: {
    'checkin.error.bookingNotFound': 'Your booking could not be found. Please verify your booking code, the name entered for your booking and try again.',
    'checkin.error.segmentNotFound': 'The flight of your booking wasn\'t found. Try again later. Please contact the Service Center for further assistance.',
    'checkin.error.notInCheckinWindow': 'Your flight is not yet available for check-in. Depending on your departure airport and the operating airline, online check-in opens at least 24 hours before departure.',
    'checkin.error.checkinApplicationNotFound': 'Unfortunately online check-in is not available for your booking. Please check in at the airport.',
    'checkin.error.linkGenerationError': 'The redirection to check-in didn\'t work. Try again later. Please contact the Service Center for further assistance.',
  },
  de: {
    'checkin.error.bookingNotFound': 'Wir konnten keine Buchung mit den eingegebenen Daten finden. Bitte verifizieren Sie Ihren Buchungscode, den für die Buchung angegebenen Namen und versuchen Sie es noch einmal.',
    'checkin.error.segmentNotFound': 'Der Flug aus Ihrer Buchung konnte nicht gefunden werden. Bitte versuchen Sie es noch einmal. Falls Sie weiterhin Unterstützung benötigen, kontaktieren Sie das Service Center.',
    'checkin.error.notInCheckinWindow': 'Ihr Flug ist noch nicht fürs Online Check-in verfügbar. Abhängig von Ihrem Abflughafen und der durchführenden Fluggesellschaft öffnet der Online Check-in mindestens 24 Stunden vor Abflug.',
    'checkin.error.checkinApplicationNotFound': 'Leider können Sie für Ihre Buchung nicht online einchecken. Bitte checken Sie am Flughafen ein.',
    'checkin.error.linkGenerationError': 'Die Weiterleitung zum Check-in hat leider nicht funktioniert. Bitte versuchen Sie es später noch einmal. Falls Sie weiterhin Unterstützung benötigen, kontaktieren Sie das Service Center.',
  },
  fr: {
    'checkin.error.bookingNotFound': 'Aucune réservation n’a pu être trouvée. Veuillez vérifier votre code de réservation ainsi que le nom saisi pour votre réservation et réessayer.',
    'checkin.error.segmentNotFound': 'Le vol de votre réservation est introuvable. Veuillez réessayer ultérieurement. Veuillez contacter notre Service Center pour obtenir de l’aide.',
    'checkin.error.notInCheckinWindow': 'L’enregistrement pour votre vol n’est pas encore ouvert. Selon l’aéroport de départ et la compagnie aérienne, l’enregistrement en ligne ouvre au moins 24 heures avant le départ.',
    'checkin.error.checkinApplicationNotFound': 'Malheureusement, l’enregistrement en ligne n’est pas disponible pour votre réservation. Merci de vous enregistrer à l’aéroport.',
    'checkin.error.linkGenerationError': 'La redirection vers l’enregistrement n’a pas fonctionné. Veuillez réessayer ultérieurement. Veuillez contacter notre Service Center pour obtenir de l’aide.',
  },
  es: {
    'checkin.error.bookingNotFound': 'No ha sido posible encontrar su reserva. Verifique su código de reserva, el nombre introducido para su reserva y vuelva a intentarlo.',
    'checkin.error.segmentNotFound': 'No se ha encontrado el vuelo de su reserva. Vuelva a intentarlo más tarde. Póngase en contacto con el centro de atención al cliente para obtener más ayuda.',
    'checkin.error.notInCheckinWindow': 'Todavía no es posible realizar el check-in de su vuelo. En función de su aeropuerto de salida y de la aerolínea operadora, el check-in online abre al menos 24 horas antes de la salida.',
    'checkin.error.checkinApplicationNotFound': 'Lamentablemente, el check-in online no está disponible para su reserva. Realice el check-in en el aeropuerto.',
    'checkin.error.linkGenerationError': 'La redirección al check-in no funcionó. Vuelva a intentarlo más tarde. Póngase en contacto con el centro de atención al cliente para obtener más ayuda.',
  },
};

/** The text of an error code in the page's language: its common label, else the built-in copy. */
export async function errorText(code, locale = getLocale()) {
  const builtIn = ERROR_TEXTS[locale.lang] || ERROR_TEXTS.en;
  const key = builtIn[code] ? code : LINK_ERROR;
  try {
    const { fetchLabels } = await import('./lh-api.js');
    const { labels } = await fetchLabels(['common'], locale);
    const live = labels[`common.${key}`];
    if (live) return live.trim();
  } catch (e) {
    // the built-in copy
  }
  return builtIn[key];
}
