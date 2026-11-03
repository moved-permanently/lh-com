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
  el: {
    'checkin.error.bookingNotFound': 'Δεν ήταν δυνατό να βρεθεί η κράτησή σας. Ελέγξτε τον κωδικό κράτησης και το όνομα που καταχωρίσατε για την κράτησή σας και δοκιμάστε ξανά.',
    'checkin.error.segmentNotFound': 'Η πτήση της κράτησής σας δεν βρέθηκε. Δοκιμάστε ξανά αργότερα. Για περαιτέρω βοήθεια επικοινωνήστε με το Service Center.',
    'checkin.error.notInCheckinWindow': 'Η πτήση σας δεν είναι ακόμη διαθέσιμη για check-in. Ανάλογα με το αεροδρόμιο αναχώρησης και την αεροπορική εταιρεία που εκτελεί την πτήση, το online check-in ανοίγει τουλάχιστον 24 ώρες πριν από την αναχώρηση.',
    'checkin.error.checkinApplicationNotFound': 'Δυστυχώς, το online check-in δεν είναι διαθέσιμο για την κράτησή σας. Κάντε check-in στο αεροδρόμιο.',
    'checkin.error.linkGenerationError': 'Η ανακατεύθυνση στο check-in δεν ήταν επιτυχής. Δοκιμάστε ξανά αργότερα. Για περαιτέρω βοήθεια επικοινωνήστε με το Service Center.',
  },
  it: {
    'checkin.error.bookingNotFound': 'Non è stato possibile trovare la sua prenotazione. Verifichi il codice di prenotazione e il nome inserito per la prenotazione e riprovi.',
    'checkin.error.segmentNotFound': 'Il volo della sua prenotazione non è stato trovato. Riprovi più tardi. Per ulteriore assistenza contatti il Service Center.',
    'checkin.error.notInCheckinWindow': 'Il check-in per il suo volo non è ancora disponibile. A seconda dell’aeroporto di partenza e della compagnia aerea operativa, il check-in online apre almeno 24 ore prima della partenza.',
    'checkin.error.checkinApplicationNotFound': 'Purtroppo il check-in online non è disponibile per la sua prenotazione. Effettui il check-in in aeroporto.',
    'checkin.error.linkGenerationError': 'Il reindirizzamento al check-in non è riuscito. Riprovi più tardi. Per ulteriore assistenza contatti il Service Center.',
  },
  ja: {
    'checkin.error.bookingNotFound': 'ご予約が見つかりませんでした。予約番号とご予約時のお名前をご確認のうえ、もう一度お試しください。',
    'checkin.error.segmentNotFound': 'ご予約のフライトが見つかりませんでした。後ほどもう一度お試しください。詳しくはサービスセンターまでお問い合わせください。',
    'checkin.error.notInCheckinWindow': 'ご搭乗便のチェックインはまだ受け付けていません。出発空港と運航航空会社により、オンラインチェックインは出発の24時間以上前に開始されます。',
    'checkin.error.checkinApplicationNotFound': '申し訳ございませんが、このご予約ではオンラインチェックインをご利用いただけません。空港でチェックインしてください。',
    'checkin.error.linkGenerationError': 'チェックインへの移動ができませんでした。後ほどもう一度お試しください。詳しくはサービスセンターまでお問い合わせください。',
  },
  ko: {
    'checkin.error.bookingNotFound': '예약을 찾을 수 없습니다. 예약 코드와 예약 시 입력한 이름을 확인한 후 다시 시도해 주세요.',
    'checkin.error.segmentNotFound': '예약하신 항공편을 찾을 수 없습니다. 나중에 다시 시도해 주세요. 추가 도움이 필요하시면 서비스 센터로 문의해 주세요.',
    'checkin.error.notInCheckinWindow': '아직 항공편 체크인을 할 수 없습니다. 출발 공항과 운항 항공사에 따라 온라인 체크인은 출발 최소 24시간 전에 시작됩니다.',
    'checkin.error.checkinApplicationNotFound': '죄송하지만 이 예약은 온라인 체크인을 이용할 수 없습니다. 공항에서 체크인해 주세요.',
    'checkin.error.linkGenerationError': '체크인 페이지로 이동하지 못했습니다. 나중에 다시 시도해 주세요. 추가 도움이 필요하시면 서비스 센터로 문의해 주세요.',
  },
  nl: {
    'checkin.error.bookingNotFound': 'Uw boeking kon niet worden gevonden. Controleer uw boekingscode en de naam die u voor uw boeking hebt ingevoerd en probeer het opnieuw.',
    'checkin.error.segmentNotFound': 'De vlucht van uw boeking is niet gevonden. Probeer het later opnieuw. Neem voor verdere hulp contact op met het Service Center.',
    'checkin.error.notInCheckinWindow': 'Inchecken voor uw vlucht is nog niet mogelijk. Afhankelijk van uw vertrekluchthaven en de uitvoerende luchtvaartmaatschappij opent online inchecken minimaal 24 uur voor vertrek.',
    'checkin.error.checkinApplicationNotFound': 'Online inchecken is helaas niet mogelijk voor uw boeking. Check in op de luchthaven.',
    'checkin.error.linkGenerationError': 'Het doorsturen naar het inchecken is mislukt. Probeer het later opnieuw. Neem voor verdere hulp contact op met het Service Center.',
  },
  pl: {
    'checkin.error.bookingNotFound': 'Nie udało się znaleźć Twojej rezerwacji. Sprawdź kod rezerwacji oraz nazwisko podane w rezerwacji i spróbuj ponownie.',
    'checkin.error.segmentNotFound': 'Nie znaleziono lotu z Twojej rezerwacji. Spróbuj ponownie później. W celu uzyskania dalszej pomocy skontaktuj się z Service Center.',
    'checkin.error.notInCheckinWindow': 'Odprawa na Twój lot nie jest jeszcze dostępna. W zależności od lotniska wylotu i przewoźnika obsługującego lot odprawa online rozpoczyna się co najmniej 24 godziny przed wylotem.',
    'checkin.error.checkinApplicationNotFound': 'Niestety odprawa online nie jest dostępna dla Twojej rezerwacji. Odpraw się na lotnisku.',
    'checkin.error.linkGenerationError': 'Przekierowanie do odprawy nie powiodło się. Spróbuj ponownie później. W celu uzyskania dalszej pomocy skontaktuj się z Service Center.',
  },
  pt: {
    'checkin.error.bookingNotFound': 'Não foi possível encontrar a sua reserva. Verifique o código de reserva e o nome indicado na reserva e tente novamente.',
    'checkin.error.segmentNotFound': 'O voo da sua reserva não foi encontrado. Tente novamente mais tarde. Para mais ajuda, contacte o Service Center.',
    'checkin.error.notInCheckinWindow': 'O check-in para o seu voo ainda não está disponível. Consoante o aeroporto de partida e a companhia aérea operadora, o check-in online abre pelo menos 24 horas antes da partida.',
    'checkin.error.checkinApplicationNotFound': 'Infelizmente, o check-in online não está disponível para a sua reserva. Faça o check-in no aeroporto.',
    'checkin.error.linkGenerationError': 'O redirecionamento para o check-in não funcionou. Tente novamente mais tarde. Para mais ajuda, contacte o Service Center.',
  },
  ru: {
    'checkin.error.bookingNotFound': 'Не удалось найти ваше бронирование. Проверьте код бронирования и имя, указанное при бронировании, и повторите попытку.',
    'checkin.error.segmentNotFound': 'Рейс из вашего бронирования не найден. Повторите попытку позже. За дополнительной помощью обратитесь в сервисный центр.',
    'checkin.error.notInCheckinWindow': 'Регистрация на ваш рейс пока недоступна. В зависимости от аэропорта вылета и авиакомпании-перевозчика онлайн-регистрация открывается не менее чем за 24 часа до вылета.',
    'checkin.error.checkinApplicationNotFound': 'К сожалению, онлайн-регистрация для вашего бронирования недоступна. Пройдите регистрацию в аэропорту.',
    'checkin.error.linkGenerationError': 'Не удалось перейти к регистрации. Повторите попытку позже. За дополнительной помощью обратитесь в сервисный центр.',
  },
  zh: {
    'checkin.error.bookingNotFound': '未找到您的预订。请核对您的预订编码和预订时填写的姓名，然后重试。',
    'checkin.error.segmentNotFound': '未找到您预订中的航班。请稍后重试。如需进一步帮助，请联系服务中心。',
    'checkin.error.notInCheckinWindow': '您的航班暂不能办理值机。根据出发机场和执飞航空公司的不同，网上值机至少在起飞前24小时开放。',
    'checkin.error.checkinApplicationNotFound': '很抱歉，您的预订无法办理网上值机。请在机场办理值机。',
    'checkin.error.linkGenerationError': '无法跳转至值机页面。请稍后重试。如需进一步帮助，请联系服务中心。',
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
