import { getLocale, siteOrigin } from '../../scripts/locale.js';
import {
  postHandoffOn, isOwnWww, bookingTarget, checkinTarget, openTarget, errorText, retrieveTarget,
  bookingBrand, BOOKING_RETRIEVE,
} from '../../scripts/handoff.js';
import { BOOKING_CODE_TEXTS } from './booking-code-texts.js';
import { brandOf } from '../../scripts/brand.js';
import {
  readConfigRows, pick, resolveLabels, cleanText, toConfigKey, decorateExternalLinks,
} from '../../scripts/block-config.js';

/* ---------------------------------------------------------------------------------------------
 * Hand-off contract. The form never posts anywhere: submit builds the URL of the live
 * check-in app and navigates there. This section is the only place that maps form values.
 * ------------------------------------------------------------------------------------------- */

/**
 * Default hand-off: the check-in app seen in the source (the tour operator link uses
 * APPID=LHG_ONLINE, TENANT=LH, MODE=PORTAL). Whether it accepts prefilled booking data is
 * unverified, so the default carries only the market.
 */
const DEFAULT_SUBMIT_URL = 'https://once.lufthansa.com/connect/main-app?APPID=LHG_ONLINE&COUNTRY={COUNTRY}&LANGUAGE={LANG}&TENANT=LH&MODE=PORTAL';

/**
 * Builds the hand-off URL. An authored Submit URL may use the placeholders {COUNTRY}, {LANG},
 * {REFERENCE}, {FIRSTNAME} and {LASTNAME} (case-insensitive); values are URL-encoded.
 * @param {{reference: string, firstName: string, lastName: string}} values
 * @param {Object} locale result of getLocale()
 * @param {string} [submitUrl] authored URL or pattern
 * @returns {string}
 */
function buildHandoffUrl(values, locale, submitUrl) {
  const replacements = {
    country: locale.country.toUpperCase(),
    lang: locale.lang.toUpperCase(),
    reference: values.reference,
    firstname: values.firstName,
    lastname: values.lastName,
  };
  let pattern = submitUrl || DEFAULT_SUBMIT_URL;
  try {
    pattern = decodeURI(pattern);
  } catch (e) {
    // keep as authored
  }
  return pattern.replace(/\{(country|lang|reference|firstname|lastname)\}/gi, (m, key) => encodeURIComponent(replacements[key.toLowerCase()] || ''));
}

/**
 * Lufthansa Cargo's shipment tracking (variant "tracking"): the air waybill's prefix (3 digits)
 * and serial (8 digits) into eTracking, which opens without login. Placeholders of an authored
 * Submit URL: {PREFIX}, {SERIAL}, {lang} (lower case, the site's paths), {LANG} and {COUNTRY}
 * (upper case), case-sensitive.
 */
const TRACKING_URL = 'https://www.lufthansa-cargo.com/{lang}/eservices/etracking/tracking/-/awb?etrk_awbp={PREFIX}&etrk_awbs={SERIAL}';

export function buildTrackingUrl(values, locale, submitUrl) {
  const replacements = {
    PREFIX: values.prefix,
    SERIAL: values.serial,
    lang: locale.lang.toLowerCase(),
    LANG: locale.lang.toUpperCase(),
    COUNTRY: (locale.country || '').toUpperCase(),
  };
  let pattern = submitUrl || TRACKING_URL;
  try {
    pattern = decodeURI(pattern);
  } catch (e) {
    // keep as authored
  }
  return pattern.replace(/\{(PREFIX|SERIAL|lang|LANG|COUNTRY)\}/g, (m, key) => encodeURIComponent(replacements[key] || ''));
}

/** A whole air waybill number ("020-12345678", "020 1234 5678", "02012345678") in its parts. */
export function splitAwb(value) {
  const digits = String(value || '').replace(/[\s-]+/g, '');
  return /^\d{11}$/.test(digits) ? { prefix: digits.slice(0, 3), serial: digits.slice(3) } : null;
}

/* ------------------------------------------------------------------------------------------- */

const DEFAULT_REFERENCE_PATTERN = '^([A-Z0-9]{6}|\\d{13})$';

/** UI strings that are not visible authored content; any can be overridden by a block row. */
const DEFAULT_LABELS = {
  en: {
    'reference label': 'Booking reference or ticket number',
    'first name label': 'First name',
    'last name label': 'Last name',
    'submit label': 'Confirm',
    'reference error': 'Please enter your 6-character booking reference or 13-digit ticket number',
    'first name error': 'First name is required',
    'last name error': 'Last name is required',
    'tabs label': 'Find your booking',
  },
  de: {
    'reference label': 'Buchungscode oder Ticketnummer',
    'first name label': 'Vorname',
    'last name label': 'Nachname',
    'submit label': 'Bestätigen',
    'reference error': 'Bitte geben Sie Ihren 6-stelligen Buchungscode oder Ihre 13-stellige Ticketnummer ein',
    'first name error': 'Vorname ist erforderlich',
    'last name error': 'Nachname ist erforderlich',
    'tabs label': 'Buchung finden',
  },
  it: {
    'reference label': 'Codice di prenotazione o numero del biglietto',
    'first name label': 'Nome',
    'last name label': 'Cognome',
    'submit label': 'Conferma',
    'reference error': 'Inserisci il codice di prenotazione di 6 caratteri o il numero del biglietto di 13 cifre',
    'first name error': 'Il nome è obbligatorio',
    'last name error': 'Il cognome è obbligatorio',
    'tabs label': 'Trova la tua prenotazione',
  },
  fr: {
    'reference label': 'Code de réservation ou numéro de billet',
    'first name label': 'Prénom',
    'last name label': 'Nom',
    'submit label': 'Confirmer',
    'reference error': 'Veuillez saisir votre code de réservation à 6 caractères ou votre numéro de billet à 13 chiffres',
    'first name error': 'Le prénom est obligatoire',
    'last name error': 'Le nom est obligatoire',
    'tabs label': 'Trouver votre réservation',
  },
  es: {
    'reference label': 'Código de reserva o número de billete',
    'first name label': 'Nombre',
    'last name label': 'Apellidos',
    'submit label': 'Confirmar',
    'reference error': 'Introduzca su código de reserva de 6 caracteres o su número de billete de 13 cifras',
    'first name error': 'El nombre es obligatorio',
    'last name error': 'Los apellidos son obligatorios',
    'tabs label': 'Buscar su reserva',
  },
  nl: {
    'reference label': 'Boekingscode of ticketnummer',
    'first name label': 'Voornaam',
    'last name label': 'Achternaam',
    'submit label': 'Bevestigen',
    'reference error': 'Voer uw boekingscode van 6 tekens of uw ticketnummer van 13 cijfers in',
    'first name error': 'Voornaam is verplicht',
    'last name error': 'Achternaam is verplicht',
    'tabs label': 'Uw boeking zoeken',
  },
  pt: {
    'reference label': 'Código da reserva ou número do bilhete',
    'first name label': 'Nome',
    'last name label': 'Sobrenome',
    'submit label': 'Confirmar',
    'reference error': 'Informe o código da reserva de 6 caracteres ou o número do bilhete de 13 dígitos',
    'first name error': 'O nome é obrigatório',
    'last name error': 'O sobrenome é obrigatório',
    'tabs label': 'Encontrar sua reserva',
  },
  el: {
    'reference label': 'Κωδικός κράτησης ή αριθμός εισιτηρίου',
    'first name label': 'Όνομα',
    'last name label': 'Επώνυμο',
    'submit label': 'Επιβεβαίωση',
    'reference error': 'Συμπληρώστε τον 6ψήφιο κωδικό κράτησης ή τον 13ψήφιο αριθμό εισιτηρίου',
    'first name error': 'Το όνομα είναι υποχρεωτικό',
    'last name error': 'Το επώνυμο είναι υποχρεωτικό',
    'tabs label': 'Βρείτε την κράτησή σας',
  },
  ja: {
    'reference label': '予約番号または航空券番号',
    'first name label': '名',
    'last name label': '姓',
    'submit label': '確認',
    'reference error': '6桁の予約番号または13桁の航空券番号を入力してください',
    'first name error': '名を入力してください',
    'last name error': '姓を入力してください',
    'tabs label': 'ご予約を検索',
  },
  ru: {
    'reference label': 'Код бронирования или номер билета',
    'first name label': 'Имя',
    'last name label': 'Фамилия',
    'submit label': 'Подтвердить',
    'reference error': 'Введите 6-значный код бронирования или 13-значный номер билета',
    'first name error': 'Укажите имя',
    'last name error': 'Укажите фамилию',
    'tabs label': 'Найти бронирование',
  },
  zh: {
    'reference label': '预订代码或机票号',
    'first name label': '名',
    'last name label': '姓',
    'submit label': '确认',
    'reference error': '请输入 6 位预订代码或 13 位机票号',
    'first name error': '请输入名',
    'last name error': '请输入姓',
    'tabs label': '查找您的预订',
  },
  pl: {
    'reference label': 'Kod rezerwacji lub numer biletu',
    'first name label': 'Imię',
    'last name label': 'Nazwisko',
    'submit label': 'Potwierdź',
    'reference error': 'Podaj 6-znakowy kod rezerwacji lub 13-cyfrowy numer biletu',
    'first name error': 'Imię jest wymagane',
    'last name error': 'Nazwisko jest wymagane',
    'tabs label': 'Znajdź rezerwację',
  },
  // Korean (kr/ko; the wording of www where it has one, the capture of 2026-11-03)
  ko: {
    'reference label': '예약 코드 또는 항공권 번호',
    'first name label': '이름',
    'last name label': '성 (姓)',
    'submit label': '확인',
    'reference error': '6자리 예약 코드 또는 13자리 항공권 번호를 입력하십시오',
    'first name error': '이름은 필수 입력 항목입니다',
    'last name error': '성은 필수 입력 항목입니다',
    'tabs label': '예약 찾기',
  },
};

let instance = 0;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

/**
 * Tab rows in authored order: every "Tab" row starts a tab, a following "Panel" row
 * holds its rich content. The first tab is the form.
 */
function readTabs(block) {
  const tabs = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;
    const [keyCell, valueCell] = cells;
    const key = toConfigKey(cleanText(keyCell));
    if (key === 'tab') {
      const label = cleanText(valueCell);
      if (label) tabs.push({ label, panel: null });
    } else if (key === 'panel' && tabs.length && !tabs[tabs.length - 1].panel) {
      tabs[tabs.length - 1].panel = valueCell;
    }
  });
  return tabs;
}

/** Applies the authored "Errors" list: 2 items = first/last name, 3 = reference/first/last. */
function applyErrorList(labels, config) {
  const row = pick(config, 'errors', 'error-messages');
  if (!row) return labels;
  const keys = row.list.length >= 3
    ? ['reference error', 'first name error', 'last name error']
    : ['first name error', 'last name error'];
  const result = { ...labels };
  keys.forEach((key, i) => {
    if (row.list[i] && !config[toConfigKey(key)]) result[key] = row.list[i];
  });
  return result;
}

function toRegExp(source, fallback) {
  try {
    return new RegExp(source || fallback);
  } catch (e) {
    return new RegExp(fallback);
  }
}

/**
 * WAI-ARIA tabs with automatic activation and arrow/Home/End keys. Option collapsible (lh-com:
 * www's maui-tab-control-panel-responsive, a maui-collapsible-item per tab on phones, all
 * collapsed): below 768px the tabs are disclosure buttons (aria-expanded), all closed at first,
 * each opening and closing its own panel; from 768px the tab set.
 */
export function buildTabs(id, tabs, panels, label, { collapsible = false } = {}) {
  const tablist = el('div', 'booking-lookup-tabs');
  tablist.setAttribute('aria-label', label);
  const buttons = tabs.map((tab, i) => {
    const button = el('button', 'booking-lookup-tab', tab.label);
    button.type = 'button';
    button.id = `${id}-tab-${i}`;
    button.setAttribute('aria-controls', panels[i].id);
    panels[i].setAttribute('aria-labelledby', button.id);
    return button;
  });
  const narrow = collapsible ? window.matchMedia('(width < 768px)') : null;
  const accordion = () => !!narrow && narrow.matches;
  const open = new Set();
  let selected = 0;
  const select = (index, focus) => {
    selected = index;
    buttons.forEach((button, i) => {
      const active = i === index;
      button.setAttribute('aria-selected', active ? 'true' : 'false');
      button.tabIndex = active ? 0 : -1;
      panels[i].hidden = !active;
    });
    if (focus) buttons[index].focus();
  };
  const render = () => {
    if (accordion()) {
      tablist.removeAttribute('role');
      buttons.forEach((button, i) => {
        button.removeAttribute('role');
        button.removeAttribute('aria-selected');
        button.removeAttribute('tabindex');
        button.setAttribute('aria-expanded', String(open.has(i)));
        panels[i].setAttribute('role', 'region');
        panels[i].removeAttribute('tabindex');
        panels[i].hidden = !open.has(i);
      });
      return;
    }
    tablist.setAttribute('role', 'tablist');
    buttons.forEach((button, i) => {
      button.setAttribute('role', 'tab');
      button.removeAttribute('aria-expanded');
      panels[i].setAttribute('role', 'tabpanel');
      panels[i].tabIndex = 0;
    });
    select(selected, false);
  };
  if (narrow) {
    if (narrow.addEventListener) narrow.addEventListener('change', render);
    else if (narrow.addListener) narrow.addListener(render);
  }
  buttons.forEach((button, i) => {
    button.addEventListener('click', () => {
      if (!accordion()) {
        select(i, false);
        return;
      }
      if (open.has(i)) open.delete(i);
      else open.add(i);
      render();
    });
    button.addEventListener('keydown', (e) => {
      if (accordion()) return;
      const last = buttons.length - 1;
      const next = {
        ArrowRight: i === last ? 0 : i + 1,
        ArrowLeft: i === 0 ? last : i - 1,
        Home: 0,
        End: last,
      }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      select(next, true);
    });
  });
  tablist.append(...buttons);
  render();
  return tablist;
}

function createField(id, {
  name, label, autocomplete, maxLength, error, numeric, hint,
}) {
  const wrap = el('div', 'booking-lookup-field');
  const labelEl = el('label', '', label);
  const input = el('input');
  input.type = 'text';
  input.id = `${id}-${name}`;
  input.name = name;
  input.required = true;
  input.placeholder = label;
  input.autocomplete = autocomplete;
  if (maxLength) input.maxLength = maxLength;
  if (numeric) input.setAttribute('inputmode', 'numeric');
  labelEl.htmlFor = input.id;
  const message = el('p', 'booking-lookup-error');
  message.id = `${id}-${name}-error`;
  message.hidden = true;
  wrap.append(labelEl, input, message);
  // a hint under the field (SWISS's check-in names), its description; hidden while it is invalid
  let hintId = null;
  if (hint) {
    const note = el('p', 'booking-lookup-hint', hint);
    note.id = `${input.id}-hint`;
    hintId = note.id;
    wrap.append(note);
    input.setAttribute('aria-describedby', hintId);
  }
  // text: the check's own message (booking-code: required or pattern), else the field's
  const setError = (show, text) => {
    message.textContent = show ? text || error : '';
    message.hidden = !show;
    if (show) {
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', hintId ? `${message.id} ${hintId}` : message.id);
      message.setAttribute('role', 'alert');
    } else {
      input.removeAttribute('aria-invalid');
      if (hintId) input.setAttribute('aria-describedby', hintId);
      else input.removeAttribute('aria-describedby');
      message.removeAttribute('role');
    }
  };
  return { wrap, input, setError };
}

/**
 * Sections right after the block's section with the style "in-booking-lookup" belong to the
 * form tab (live: "How to get your boarding pass" sits in the first tab panel, below the form).
 * The section elements are moved as a whole: loadSections() still loads their blocks.
 */
function adoptSections(block, panel) {
  const section = block.closest('.section');
  if (!section || block.parentElement.nextElementSibling) return;
  let next = section.nextElementSibling;
  while (next && next.classList.contains('in-booking-lookup')) {
    const following = next.nextElementSibling;
    next.classList.add('booking-lookup-section');
    panel.append(next);
    next = following;
  }
}

/**
 * My bookings (dcep-quick-actions with only the My bookings tab): texts of the live tab
 * (labels/quickactions, bookingQuery, tourOperatorQuery as recorded); authored rows win.
 */
const MY_BOOKINGS_LABELS = {
  en: {
    'tab label': 'My bookings',
    'reference label': 'Booking code',
    'reference error': 'Please provide booking code',
    'last name label': 'Last name',
    'last name error': 'Please enter your last name as booked.',
    'tour operator label': 'I have a tour operator code',
    'first name label': 'First name',
    'first name error': 'Please enter your first name as booked.',
    'tour operator code label': 'Tour operator trip code',
    'tour operator code hint': 'Please provide tour operator trip code',
    'tour operator code error': 'Please provide tour operator trip code',
    'tour operator code info': 'You received your trip code from your travel agency or tour operator. Please enter it here (up to 12 characters).',
    'submit label': 'Find Bookings',
  },
  de: {
    'tab label': 'Meine Buchungen',
    'reference label': 'Buchungscode',
    'reference error': 'Bitte geben Sie einen Buchungscode ein.',
    'last name label': 'Nachname',
    'last name error': 'Bitte geben Sie Ihren Nachnamen wie gebucht ein.',
    'tour operator label': 'Ich habe einen Reisecode eines Reiseveranstalters',
    'first name label': 'Vorname',
    'first name error': 'Bitte geben Sie Ihren auf der Buchung angegebenen Vornamen ein.',
    'tour operator code label': 'Reisecode des Reiseveranstalters',
    'tour operator code hint': 'Bitte geben Sie den 5-12-stelligen Code ein',
    'tour operator code error': 'Bitte geben Sie den Reisecode des Reiseveranstalters an',
    'tour operator code info': 'Sie haben Ihren Reisecode von Ihrem Reisebüro oder Reiseveranstalter erhalten. Bitte geben Sie diesen hier ein (bis zu 12 Zeichen).',
    'submit label': 'Anzeigen',
  },
  fr: {
    'tab label': 'Mes réservations',
    'reference label': 'Code de réservation',
    'reference error': 'Veuillez saisir un code de réservation.',
    'last name label': 'Nom de famille',
    'last name error': 'Veuillez saisir votre nom tel qu’il figure dans votre réservation.',
    'tour operator label': 'J’ai un code voyage du voyagiste',
    'first name label': 'Prénom',
    'first name error': 'Veuillez saisir votre prénom tel qu’il apparaît sur la réservation.',
    'tour operator code label': 'Code voyage du voyagiste',
    'tour operator code hint': 'Veuillez fournir le code voyage du voyagiste',
    'tour operator code error': 'Veuillez fournir le code voyage du voyagiste',
    'tour operator code info': 'Votre agence de voyage ou voyagiste vous a envoyé votre code voyage. Merci de le saisir ici (jusqu’à 12 caractères).',
    'submit label': 'Rechercher une réservation',
  },
  es: {
    'tab label': 'Mis reservas',
    'reference label': 'Código de reserva',
    'reference error': 'Por favor, introduzca un código de reserva.',
    'last name label': 'Apellidos',
    'last name error': 'Por favor, escriba su apellido tal y como aparece en su reserva.',
    'tour operator label': 'Tengo un código de viaje de un operador turístico',
    'first name label': 'Nombre',
    'first name error': 'Introduzca su nombre tal y como figura en la reserva.',
    'tour operator code label': 'Código de viaje del operador turístico',
    'tour operator code hint': 'Introduzca el código de viaje del operador turístico',
    'tour operator code error': 'Introduzca el código de viaje del operador turístico',
    'tour operator code info': 'Recibió su código de viaje de su agencia de viajes u operador turístico. Introdúzcalo aquí (hasta 12 caracteres).',
    'submit label': 'Buscar reservas',
  },
  el: {
    'tab label': 'Οι κρατήσεις μου',
    'reference label': 'Κωδικός κράτησης',
    'reference error': 'Εισαγάγετε τον κωδικό κράτησης',
    'last name label': 'Επώνυμο',
    'last name error': 'Εισαγάγετε το επώνυμό σας όπως αναγράφεται στην κράτηση.',
    'tour operator label': 'Έχω κωδικό ταξιδιωτικού οργανισμού',
    'first name label': 'Όνομα',
    'first name error': 'Εισαγάγετε το όνομά σας όπως αναγράφεται στην κράτηση.',
    'tour operator code label': 'Κωδικός ταξιδιού του ταξιδιωτικού οργανισμού',
    'tour operator code hint': 'Εισαγάγετε τον κωδικό ταξιδιού του ταξιδιωτικού οργανισμού',
    'tour operator code error': 'Εισαγάγετε τον κωδικό ταξιδιού του ταξιδιωτικού οργανισμού',
    'tour operator code info': 'Τον κωδικό ταξιδιού τον λάβατε από το ταξιδιωτικό σας γραφείο ή τον ταξιδιωτικό οργανισμό. Εισαγάγετέ τον εδώ (έως 12 χαρακτήρες).',
    'submit label': 'Εύρεση κρατήσεων',
  },
  it: {
    'tab label': 'Le mie prenotazioni',
    'reference label': 'Codice di prenotazione',
    'reference error': 'Inserisca il codice di prenotazione',
    'last name label': 'Cognome',
    'last name error': 'Inserisca il cognome come indicato nella prenotazione.',
    'tour operator label': 'Ho un codice del tour operator',
    'first name label': 'Nome',
    'first name error': 'Inserisca il nome come indicato nella prenotazione.',
    'tour operator code label': 'Codice viaggio del tour operator',
    'tour operator code hint': 'Inserisca il codice viaggio del tour operator',
    'tour operator code error': 'Inserisca il codice viaggio del tour operator',
    'tour operator code info': 'Ha ricevuto il codice viaggio dalla sua agenzia di viaggi o dal tour operator. Lo inserisca qui (fino a 12 caratteri).',
    'submit label': 'Trova prenotazioni',
  },
  ja: {
    'tab label': '予約一覧',
    'reference label': '予約番号',
    'reference error': '予約番号を入力してください',
    'last name label': '姓',
    'last name error': 'ご予約時の姓を入力してください。',
    'tour operator label': 'ツアーオペレーターのコードをお持ちの方',
    'first name label': '名',
    'first name error': 'ご予約時の名を入力してください。',
    'tour operator code label': 'ツアーオペレーターの旅行コード',
    'tour operator code hint': 'ツアーオペレーターの旅行コードを入力してください',
    'tour operator code error': 'ツアーオペレーターの旅行コードを入力してください',
    'tour operator code info': '旅行コードは旅行代理店またはツアーオペレーターから受け取っています。ここに入力してください（最大12文字）。',
    'submit label': '予約を検索',
  },
  ko: {
    'tab label': '내 예약',
    'reference label': '예약 코드',
    'reference error': '예약 코드를 입력해 주세요',
    'last name label': '성',
    'last name error': '예약 시 입력한 성을 입력해 주세요.',
    'tour operator label': '여행사 코드가 있습니다',
    'first name label': '이름',
    'first name error': '예약 시 입력한 이름을 입력해 주세요.',
    'tour operator code label': '여행사 여행 코드',
    'tour operator code hint': '여행사 여행 코드를 입력해 주세요',
    'tour operator code error': '여행사 여행 코드를 입력해 주세요',
    'tour operator code info': '여행 코드는 여행사 또는 투어 운영사에서 받으셨습니다. 여기에 입력해 주세요(최대 12자).',
    'submit label': '예약 찾기',
  },
  nl: {
    'tab label': 'Mijn boekingen',
    'reference label': 'Boekingscode',
    'reference error': 'Voer de boekingscode in',
    'last name label': 'Achternaam',
    'last name error': 'Voer uw achternaam in zoals geboekt.',
    'tour operator label': 'Ik heb een touroperatorcode',
    'first name label': 'Voornaam',
    'first name error': 'Voer uw voornaam in zoals geboekt.',
    'tour operator code label': 'Reiscode van de touroperator',
    'tour operator code hint': 'Voer de reiscode van de touroperator in',
    'tour operator code error': 'Voer de reiscode van de touroperator in',
    'tour operator code info': 'U hebt uw reiscode ontvangen van uw reisbureau of touroperator. Voer deze hier in (maximaal 12 tekens).',
    'submit label': 'Boekingen zoeken',
  },
  pl: {
    'tab label': 'Moje rezerwacje',
    'reference label': 'Kod rezerwacji',
    'reference error': 'Podaj kod rezerwacji',
    'last name label': 'Nazwisko',
    'last name error': 'Podaj nazwisko zgodnie z rezerwacją.',
    'tour operator label': 'Mam kod organizatora podróży',
    'first name label': 'Imię',
    'first name error': 'Podaj imię zgodnie z rezerwacją.',
    'tour operator code label': 'Kod podróży organizatora',
    'tour operator code hint': 'Podaj kod podróży organizatora',
    'tour operator code error': 'Podaj kod podróży organizatora',
    'tour operator code info': 'Kod podróży otrzymałeś od biura podróży lub organizatora. Wpisz go tutaj (do 12 znaków).',
    'submit label': 'Znajdź rezerwacje',
  },
  pt: {
    'tab label': 'As minhas reservas',
    'reference label': 'Código de reserva',
    'reference error': 'Indique o código de reserva',
    'last name label': 'Sobrenome',
    'last name error': 'Introduza o seu sobrenome tal como consta na reserva.',
    'tour operator label': 'Tenho um código de operador turístico',
    'first name label': 'Nome',
    'first name error': 'Introduza o seu nome tal como consta na reserva.',
    'tour operator code label': 'Código de viagem do operador turístico',
    'tour operator code hint': 'Indique o código de viagem do operador turístico',
    'tour operator code error': 'Indique o código de viagem do operador turístico',
    'tour operator code info': 'Recebeu o código de viagem da sua agência de viagens ou do operador turístico. Introduza-o aqui (até 12 caracteres).',
    'submit label': 'Encontrar reservas',
  },
  ru: {
    'tab label': 'Мои бронирования',
    'reference label': 'Код бронирования',
    'reference error': 'Укажите код бронирования',
    'last name label': 'Фамилия',
    'last name error': 'Введите фамилию так, как она указана в бронировании.',
    'tour operator label': 'У меня есть код туроператора',
    'first name label': 'Имя',
    'first name error': 'Введите имя так, как оно указано в бронировании.',
    'tour operator code label': 'Код поездки туроператора',
    'tour operator code hint': 'Укажите код поездки туроператора',
    'tour operator code error': 'Укажите код поездки туроператора',
    'tour operator code info': 'Код поездки вы получили от турагентства или туроператора. Введите его здесь (до 12 символов).',
    'submit label': 'Найти бронирования',
  },
  zh: {
    'tab label': '我的预订',
    'reference label': '预订编码',
    'reference error': '请输入预订编码',
    'last name label': '姓',
    'last name error': '请输入预订时填写的姓氏。',
    'tour operator label': '我有旅行社代码',
    'first name label': '名',
    'first name error': '请输入预订时填写的名字。',
    'tour operator code label': '旅行社行程代码',
    'tour operator code hint': '请输入旅行社行程代码',
    'tour operator code error': '请输入旅行社行程代码',
    'tour operator code info': '您的行程代码由旅行社或旅游运营商提供。请在此输入（最多12个字符）。',
    'submit label': '查找预订',
  },
};

/** The hand-off's error line, before the form's actions (hidden until it has a message). */
function handoffError(form, actions) {
  const p = el('p', 'booking-lookup-handoff-error');
  p.setAttribute('role', 'alert');
  p.hidden = true;
  form.insertBefore(p, actions);
  return p;
}

/**
 * The post mode's hand-off (scripts/handoff.js): the endpoint's link target opened as www does;
 * a failure shows www's text of its error code above the button, the entries kept.
 */
async function postHandoff(run, { submit, error, locale }) {
  error.hidden = true;
  error.textContent = '';
  submit.disabled = true;
  submit.setAttribute('aria-busy', 'true');
  try {
    openTarget(await run());
  } catch (e) {
    error.textContent = await errorText(e.code, locale);
    error.hidden = false;
  } finally {
    submit.disabled = false;
    submit.removeAttribute('aria-busy');
  }
}

/** The live page of the current replica page (same path on the site's www, a brand's own). */
function livePageUrl() {
  return `${siteOrigin()}${window.location.pathname.replace(/^\/content\//, '/')}`;
}

/**
 * Variant my-bookings: one "My bookings" tab (accordion row below 768px) with the Travel ID
 * login link, booking code + last name, the tour operator checkbox (switches to last name,
 * first name and tour operator trip code) and "Find Bookings". The live tab logs in with the
 * booking code and last name and posts to the booking deeplink its booking service returns
 * (tour operator: the Travel ID upcoming-trips API). On the airline's own host (scripts/handoff.js
 * post mode) the booking search does the same: the file key login, the booking deeplink, its
 * target opened; elsewhere, and for the tour operator search, a valid search opens the live page,
 * without any of the entered data in the URL.
 */
function decorateMyBookings(block, id, locale, config) {
  const labels = resolveLabels(MY_BOOKINGS_LABELS, config, locale.lang);
  const tabLabel = (pick(config, 'tab') || {}).text || labels['tab label'];
  const loginRow = pick(config, 'login-link', 'login');
  const referencePattern = toRegExp((pick(config, 'reference-pattern') || {}).text, '^[A-Z0-9]{6}$');

  const panel = el('div', 'booking-lookup-panel booking-lookup-form-panel');
  panel.id = `${id}-panel-0`;
  if (loginRow && loginRow.link) {
    const login = el('p', 'booking-lookup-login');
    login.append(loginRow.link);
    panel.append(login);
  }

  const form = el('form', 'booking-lookup-form');
  form.noValidate = true;
  form.setAttribute('aria-label', tabLabel);
  // option checkin (SWISS's online check-in, brief 445): www's booking code or 13-digit ticket
  // number, first name and last name with their hints (rows "<field> hint"), no tour operator
  // search
  const checkin = block.classList.contains('checkin');
  const hintOf = (key) => (checkin && (pick(config, `${key}-hint`) || {}).text) || '';
  const field = (name, label, error, { autocomplete = 'off', maxLength, hint } = {}) => createField(id, {
    name, label, autocomplete, maxLength, error, hint,
  });
  const reference = field('reference', labels['reference label'], labels['reference error'], { maxLength: checkin ? 13 : 6, hint: hintOf('reference') });
  reference.input.autocapitalize = 'characters';
  reference.input.spellcheck = false;
  const firstName = checkin ? field('firstName', labels['first name label'], labels['first name error'], { autocomplete: 'given-name', maxLength: 26, hint: hintOf('first-name') }) : null;
  const lastName = field('lastName', labels['last name label'], labels['last name error'], { autocomplete: 'family-name', maxLength: 31, hint: hintOf('last-name') });
  const toLastName = field('toLastName', labels['last name label'], labels['last name error'], { autocomplete: 'family-name', maxLength: 31 });
  const toFirstName = field('toFirstName', labels['first name label'], labels['first name error'], { autocomplete: 'given-name', maxLength: 26 });
  const toCode = field('tourOperatorCode', labels['tour operator code label'], labels['tour operator code error'], { maxLength: 12 });
  const hint = el('p', 'booking-lookup-hint', labels['tour operator code hint']);
  toCode.wrap.append(hint);
  toCode.input.title = labels['tour operator code info'];

  const bookingFields = el('div', 'booking-lookup-fields');
  bookingFields.append(...[reference, firstName, lastName].filter(Boolean).map((f) => f.wrap));
  const tourFields = el('div', 'booking-lookup-fields');
  tourFields.append(toLastName.wrap, toFirstName.wrap, toCode.wrap);
  tourFields.hidden = true;

  const checkboxLabel = el('label', 'booking-lookup-checkbox');
  const checkbox = el('input');
  checkbox.type = 'checkbox';
  checkbox.name = 'tourOperator';
  checkboxLabel.append(checkbox, el('span', '', labels['tour operator label']));
  checkbox.addEventListener('change', () => {
    bookingFields.hidden = checkbox.checked;
    tourFields.hidden = !checkbox.checked;
  });

  const submit = el('button', 'booking-lookup-submit button', labels['submit label']);
  submit.type = 'submit';
  const actions = el('div', 'booking-lookup-actions');
  actions.append(submit);
  const parts = checkin ? [bookingFields] : [bookingFields, tourFields, checkboxLabel];
  form.append(...parts, actions);
  const error = handoffError(form, actions);
  panel.append(form);

  const filled = (f) => () => f.input.value.trim() !== '';
  const bookingChecks = [
    [reference, () => referencePattern.test(reference.input.value.replace(/\s+/g, '').toUpperCase())],
    ...(firstName ? [[firstName, filled(firstName)]] : []),
    [lastName, filled(lastName)],
  ];
  const tourChecks = [
    [toLastName, filled(toLastName)],
    [toFirstName, filled(toFirstName)],
    [toCode, () => /^[A-Za-z0-9]{5,12}$/.test(toCode.input.value.trim())],
  ];
  [...bookingChecks, ...tourChecks].forEach(([f, valid]) => {
    f.input.addEventListener('input', () => {
      if (f.input.hasAttribute('aria-invalid') && valid()) f.setError(false);
    });
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let firstInvalid = null;
    (checkbox.checked ? tourChecks : bookingChecks).forEach(([f, valid]) => {
      const ok = valid();
      f.setError(!ok);
      if (!ok && !firstInvalid) firstInvalid = f.input;
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }
    if (!checkbox.checked && postHandoffOn()) {
      postHandoff(() => bookingTarget({
        reference: reference.input.value.replace(/\s+/g, '').toUpperCase(),
        lastName: lastName.input.value.trim(),
      }, locale), { submit, error, locale });
      return;
    }
    window.location.assign(livePageUrl());
  });

  const tablist = buildTabs(id, [{ label: tabLabel }], [panel], tabLabel);
  // below 768px the single tab is an accordion row that opens and closes its panel
  const tab = tablist.querySelector('.booking-lookup-tab');
  tab.setAttribute('aria-expanded', 'true');
  tab.addEventListener('click', () => {
    if (!window.matchMedia('(width < 768px)').matches) return;
    const open = tab.getAttribute('aria-expanded') !== 'true';
    tab.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
  });
  block.replaceChildren(tablist, panel);
}

/** The tracking variant's texts (Cargo's www: en, de); authored rows win. */
const TRACKING_LABELS = {
  en: {
    'prefix label': 'AWB prefix',
    'serial label': 'AWB number',
    'prefix error': 'Please enter the 3-digit prefix',
    'serial error': 'Please enter the 8-digit air waybill number',
    'submit label': 'Track',
  },
  de: {
    'prefix label': 'AWB-Präfix',
    'serial label': 'AWB-Nummer',
    'prefix error': 'Bitte geben Sie das 3-stellige Präfix ein',
    'serial error': 'Bitte geben Sie die 8-stellige Luftfrachtbriefnummer ein',
    'submit label': 'Verfolgen',
  },
};

/**
 * The tracking variant (Lufthansa Cargo): no name fields, the air waybill's prefix and serial,
 * eTracking (buildTrackingUrl); tabs and notice as the booking lookup. Row Default prefix: the
 * prefix prefilled (www.lufthansa-cargo.com: "020", Lufthansa Cargo's code), 3 digits only.
 */
function decorateTracking(block, id, locale, config) {
  const labels = resolveLabels(TRACKING_LABELS, config, locale.lang);
  const tabs = readTabs(block);
  const submitRow = pick(config, 'submit-url', 'handoff-url');
  let submitUrl = '';
  if (submitRow) submitUrl = submitRow.link ? submitRow.link.getAttribute('href') : submitRow.text;
  const formPanel = el('div', 'booking-lookup-panel booking-lookup-form-panel');
  formPanel.id = `${id}-panel-0`;
  if (tabs[0] && tabs[0].panel && cleanText(tabs[0].panel)) {
    const intro = el('div', 'booking-lookup-intro');
    intro.append(...tabs[0].panel.childNodes);
    formPanel.append(intro);
  }
  const form = el('form', 'booking-lookup-form booking-lookup-tracking-form');
  form.noValidate = true;
  if (tabs[0]) form.setAttribute('aria-label', tabs[0].label);
  const prefix = createField(id, {
    name: 'prefix', label: labels['prefix label'], autocomplete: 'off', maxLength: 3, error: labels['prefix error'], numeric: true,
  });
  const serial = createField(id, {
    name: 'serial', label: labels['serial label'], autocomplete: 'off', maxLength: 8, error: labels['serial error'], numeric: true,
  });
  const preset = pick(config, 'default-prefix');
  if (preset && /^\d{3}$/.test(preset.text)) prefix.input.value = preset.text;
  // a whole number pasted into the prefix field fills both
  prefix.input.addEventListener('paste', (e) => {
    const parts = splitAwb((e.clipboardData || window.clipboardData || { getData: () => '' }).getData('text'));
    if (!parts) return;
    e.preventDefault();
    prefix.input.value = parts.prefix;
    serial.input.value = parts.serial;
    serial.input.focus();
  });
  const submit = el('button', 'booking-lookup-submit button', labels['submit label']);
  submit.type = 'submit';
  const actions = el('div', 'booking-lookup-actions');
  actions.append(submit);
  form.append(prefix.wrap, serial.wrap, actions);
  formPanel.append(form);
  const checks = [[prefix, /^\d{3}$/], [serial, /^\d{8}$/]];
  checks.forEach(([field, re]) => field.input.addEventListener('input', () => {
    if (field.input.hasAttribute('aria-invalid') && re.test(field.input.value.trim())) field.setError(false);
  }));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let firstInvalid = null;
    checks.forEach(([field, re]) => {
      const ok = re.test(field.input.value.trim());
      field.setError(!ok);
      if (!ok && !firstInvalid) firstInvalid = field.input;
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }
    window.location.assign(buildTrackingUrl({
      prefix: prefix.input.value.trim(), serial: serial.input.value.trim(),
    }, locale, submitUrl));
  });
  const extraPanels = tabs.slice(1).map((tab, i) => {
    const panel = el('div', 'booking-lookup-panel');
    panel.id = `${id}-panel-${i + 1}`;
    if (tab.panel) panel.append(...tab.panel.childNodes);
    decorateExternalLinks(panel);
    return panel;
  });
  if (extraPanels.length) {
    const panels = [formPanel, ...extraPanels];
    block.replaceChildren(buildTabs(id, tabs, panels, tabs[0] ? tabs[0].label : ''), ...panels);
  } else {
    block.replaceChildren(formPanel);
  }
}

// www's maui-input patterns of the login modal (the same on the four brands, 2026-11-05)
const BOOKING_CODE_PATTERN = /^([A-Z0-9]{6}|\d{13})$/;
const LAST_NAME_PATTERN = /^[A-Za-z0-9äëïöüÄËÏÖÜáéíóúÁÉÍÓÚàèìòùÀÈÌÒÙâêîôûÂÊÎÔÛåÅãñõÃÑÕçøÇØæÆÐðþÞÿß.';,\-_+&#*="\s*ĄąĆćĘęŁłŃńŚśŹźŻż]+$/;
// the links that open the dialog: #booking-code on this page (the login card's "Enter booking
// code", a nav link to the login page with the hash)
const BOOKING_CODE_HASH = '#booking-code';

/**
 * Variant booking-code (brief 369): the login page's "Booking code" modal of Discover, Austrian,
 * Brussels and SWISS (www's dcep-login-form in a maui-modal): a dialog opened by the page's links
 * to #booking-code (and at once when the page is reached with it), with the booking code (6
 * capitals or digits, or a 13-digit ticket number) and the last name, checked as www checks them:
 * an error box above the fields (www's count headline, each message with "Go to error") and the
 * message under each field. A valid entry ends as www's: the shop's form in the same window
 * (scripts/handoff.js retrieveTarget); on the airline's own www host www's two calls first
 * (bookingTarget). Texts: www's per brand and language (booking-code-texts.js); authored rows win.
 * A brand without a shop table (ITA, whose www form sends nothing; lh-com): nothing rendered.
 */
function decorateBookingCode(block, id, locale, config) {
  const brand = bookingBrand();
  if (!BOOKING_RETRIEVE[brand]) {
    block.replaceChildren();
    block.hidden = true;
    return;
  }
  const texts = resolveLabels(BOOKING_CODE_TEXTS[brand], config, locale.lang);
  const dialog = el('dialog', 'booking-lookup-dialog');
  dialog.id = `${id}-dialog`;
  const title = el('h2', 'booking-lookup-dialog-title', texts.title);
  title.id = `${id}-title`;
  dialog.setAttribute('aria-labelledby', title.id);
  const close = el('button', 'booking-lookup-dialog-close');
  close.type = 'button';
  close.setAttribute('aria-label', texts['close label']);
  const head = el('div', 'booking-lookup-dialog-head');
  head.append(title, close);

  const form = el('form', 'booking-lookup-form');
  form.noValidate = true;
  const box = el('div', 'booking-lookup-errorbox');
  box.setAttribute('role', 'alert');
  box.tabIndex = -1;
  box.hidden = true;
  const reference = createField(id, {
    name: 'reference', label: texts['reference label'], autocomplete: 'off', maxLength: 13, error: texts['reference required'],
  });
  reference.input.spellcheck = false;
  const lastName = createField(id, {
    name: 'lastName', label: texts['last name label'], autocomplete: 'family-name', maxLength: 31, error: texts['last name required'],
  });
  const submit = el('button', 'booking-lookup-submit button', texts['submit label']);
  submit.type = 'submit';
  const actions = el('div', 'booking-lookup-actions');
  actions.append(submit);
  form.append(box, reference.wrap, lastName.wrap, actions);
  const error = handoffError(form, actions);
  dialog.append(head, form);
  block.replaceChildren(dialog);

  // each check: '' when valid, else www's message (required, then the pattern's)
  const check = (field, pattern, required, invalid) => () => {
    const value = field.input.value.trim();
    if (!value) return texts[required];
    return pattern.test(value) ? '' : texts[invalid];
  };
  const checks = [
    [reference, check(reference, BOOKING_CODE_PATTERN, 'reference required', 'reference pattern')],
    [lastName, check(lastName, LAST_NAME_PATTERN, 'last name required', 'last name pattern')],
  ];
  checks.forEach(([f, message]) => {
    f.input.addEventListener('input', () => {
      if (f.input.hasAttribute('aria-invalid') && !message()) f.setError(false);
    });
  });
  const showErrors = (errors) => {
    const count = errors.length;
    const headline = el('p', 'booking-lookup-errorbox-headline', `${count > 1 ? texts['errors plural'].replace('{COUNT}', count) : texts['errors singular']} ${texts['errors text']}`);
    const list = el('ul');
    errors.forEach(([f, text]) => {
      const li = el('li');
      const go = el('a', '', texts['go to error']);
      go.href = `#${f.input.id}`;
      go.addEventListener('click', (e) => {
        e.preventDefault();
        f.input.focus();
      });
      li.append(el('span', '', text), ' ', go);
      list.append(li);
    });
    box.replaceChildren(headline, list);
    box.hidden = false;
    box.focus();
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const errors = [];
    checks.forEach(([f, message]) => {
      const text = message();
      f.setError(Boolean(text), text);
      if (text) errors.push([f, text]);
    });
    if (errors.length) {
      showErrors(errors);
      return;
    }
    box.hidden = true;
    box.replaceChildren();
    const values = {
      reference: reference.input.value.trim(), lastName: lastName.input.value.trim(),
    };
    if (postHandoffOn()) {
      postHandoff(() => bookingTarget(values, locale), { submit, error, locale });
      return;
    }
    openTarget(retrieveTarget(values, { brand, country: locale.country, lang: locale.lang }));
  });

  const native = typeof dialog.showModal === 'function';
  const open = () => {
    if (dialog.hasAttribute('open')) return;
    if (native) dialog.showModal();
    else dialog.setAttribute('open', '');
  };
  close.addEventListener('click', () => {
    if (native) dialog.close();
    else dialog.removeAttribute('open');
  });
  const opensDialog = (a) => {
    try {
      const url = new URL(a.getAttribute('href'), window.location.href);
      return url.hash === BOOKING_CODE_HASH && url.pathname === window.location.pathname;
    } catch (e) {
      return false;
    }
  };
  document.addEventListener('click', (e) => {
    const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || !opensDialog(a)) return;
    e.preventDefault();
    open();
  });
  if (window.location.hash === BOOKING_CODE_HASH) open();
}

export default function decorate(block) {
  instance += 1;
  const id = `booking-lookup-${instance}`;
  const locale = getLocale();
  const config = readConfigRows(block);
  if (block.classList.contains('my-bookings')) {
    decorateMyBookings(block, id, locale, config);
    return;
  }
  if (block.classList.contains('tracking')) {
    decorateTracking(block, id, locale, config);
    return;
  }
  if (block.classList.contains('booking-code')) {
    decorateBookingCode(block, id, locale, config);
    return;
  }
  const labels = applyErrorList(resolveLabels(DEFAULT_LABELS, config, locale.lang), config);
  const tabs = readTabs(block);
  const notice = (pick(config, 'login-notice', 'notice') || {}).cell;
  const referencePattern = toRegExp(
    (pick(config, 'reference-pattern') || {}).text,
    DEFAULT_REFERENCE_PATTERN,
  );
  const submitRow = pick(config, 'submit-url', 'handoff-url');
  let submitUrl = '';
  if (submitRow) submitUrl = submitRow.link ? submitRow.link.getAttribute('href') : submitRow.text;

  // form panel
  const formPanel = el('div', 'booking-lookup-panel booking-lookup-form-panel');
  formPanel.id = `${id}-panel-0`;
  if (notice && cleanText(notice)) {
    const note = el('div', 'booking-lookup-notice');
    note.setAttribute('role', 'note');
    note.append(...notice.childNodes);
    formPanel.append(note);
  }
  if (tabs[0] && tabs[0].panel && cleanText(tabs[0].panel)) {
    const intro = el('div', 'booking-lookup-intro');
    intro.append(...tabs[0].panel.childNodes);
    formPanel.append(intro);
  }

  const form = el('form', 'booking-lookup-form');
  form.noValidate = true;
  if (tabs[0]) form.setAttribute('aria-label', tabs[0].label);
  const reference = createField(id, {
    name: 'reference',
    label: labels['reference label'],
    autocomplete: 'off',
    maxLength: 13,
    error: labels['reference error'],
  });
  reference.input.autocapitalize = 'characters';
  reference.input.spellcheck = false;
  const firstName = createField(id, {
    name: 'firstName',
    label: labels['first name label'],
    autocomplete: 'given-name',
    maxLength: 26,
    error: labels['first name error'],
  });
  const lastName = createField(id, {
    name: 'lastName',
    label: labels['last name label'],
    autocomplete: 'family-name',
    maxLength: 31,
    error: labels['last name error'],
  });
  const submit = el('button', 'booking-lookup-submit button', labels['submit label']);
  submit.type = 'submit';
  const actions = el('div', 'booking-lookup-actions');
  actions.append(submit);
  form.append(reference.wrap, firstName.wrap, lastName.wrap, actions);
  const error = handoffError(form, actions);
  formPanel.append(form);

  const normalizeReference = (value) => value.replace(/\s+/g, '').toUpperCase();
  const checks = [
    [reference, () => referencePattern.test(normalizeReference(reference.input.value))],
    [firstName, () => firstName.input.value.trim() !== ''],
    [lastName, () => lastName.input.value.trim() !== ''],
  ];
  // once an error is shown, it clears as soon as the field becomes valid
  checks.forEach(([field, valid]) => {
    field.input.addEventListener('input', () => {
      if (field.input.hasAttribute('aria-invalid') && valid()) field.setError(false);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let firstInvalid = null;
    checks.forEach(([field, valid]) => {
      const ok = valid();
      field.setError(!ok);
      if (!ok && !firstInvalid) firstInvalid = field.input;
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }
    const values = {
      reference: normalizeReference(reference.input.value),
      firstName: firstName.input.value.trim(),
      lastName: lastName.input.value.trim(),
    };
    const handoffUrl = buildHandoffUrl(values, locale, submitUrl);
    // the airline's own host, whose check-in page this hand-off would open again (ITA's): www's
    // check-in call (scripts/handoff.js); every other host and hand-off as before
    if (postHandoffOn() && isOwnWww(handoffUrl)) {
      postHandoff(() => checkinTarget(values, locale), { submit, error, locale });
      return;
    }
    window.location.assign(handoffUrl);
  });

  // extra tabs: authored rich content panels
  const extraPanels = tabs.slice(1).map((tab, i) => {
    const panel = el('div', 'booking-lookup-panel');
    panel.id = `${id}-panel-${i + 1}`;
    if (tab.panel) panel.append(...tab.panel.childNodes);
    decorateExternalLinks(panel);
    return panel;
  });

  adoptSections(block, formPanel);

  if (extraPanels.length) {
    const panels = [formPanel, ...extraPanels];
    // lh-com: on phones www's maui-collapsible-items, all closed (brief 404)
    const tablist = buildTabs(id, tabs, panels, labels['tabs label'], { collapsible: !brandOf() });
    block.replaceChildren(tablist, ...panels);
  } else {
    block.replaceChildren(formPanel);
  }
}
