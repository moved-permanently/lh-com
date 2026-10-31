import { getLocale, LIVE_ORIGIN } from '../../scripts/locale.js';
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

/** WAI-ARIA tabs with automatic activation and arrow/Home/End keys. */
function buildTabs(id, tabs, panels, label) {
  const tablist = el('div', 'booking-lookup-tabs');
  tablist.setAttribute('role', 'tablist');
  tablist.setAttribute('aria-label', label);
  const buttons = tabs.map((tab, i) => {
    const button = el('button', 'booking-lookup-tab', tab.label);
    button.type = 'button';
    button.id = `${id}-tab-${i}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', panels[i].id);
    panels[i].setAttribute('role', 'tabpanel');
    panels[i].setAttribute('aria-labelledby', button.id);
    panels[i].tabIndex = 0;
    return button;
  });
  const select = (index, focus) => {
    buttons.forEach((button, i) => {
      const active = i === index;
      button.setAttribute('aria-selected', active ? 'true' : 'false');
      button.tabIndex = active ? 0 : -1;
      panels[i].hidden = !active;
    });
    if (focus) buttons[index].focus();
  };
  buttons.forEach((button, i) => {
    button.addEventListener('click', () => select(i, false));
    button.addEventListener('keydown', (e) => {
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
  select(0, false);
  return tablist;
}

function createField(id, {
  name, label, autocomplete, maxLength, error,
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
  labelEl.htmlFor = input.id;
  const message = el('p', 'booking-lookup-error');
  message.id = `${id}-${name}-error`;
  message.hidden = true;
  wrap.append(labelEl, input, message);
  const setError = (show) => {
    message.textContent = show ? error : '';
    message.hidden = !show;
    if (show) {
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', message.id);
      message.setAttribute('role', 'alert');
    } else {
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
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
};

/** The live page of the current replica page (same path on www.lufthansa.com). */
function livePageUrl() {
  return `${LIVE_ORIGIN}${window.location.pathname.replace(/^\/content\//, '/')}`;
}

/**
 * Variant my-bookings: one "My bookings" tab (accordion row below 768px) with the Travel ID
 * login link, booking code + last name, the tour operator checkbox (switches to last name,
 * first name and tour operator trip code) and "Find Bookings". The live tab logs in with the
 * booking code and last name and posts to the booking deeplink its booking service returns
 * (tour operator: the Travel ID upcoming-trips API); neither can be called from here, so a
 * valid search opens the live page, without any of the entered data in the URL.
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
  const field = (name, label, error, { autocomplete = 'off', maxLength } = {}) => createField(id, {
    name, label, autocomplete, maxLength, error,
  });
  const reference = field('reference', labels['reference label'], labels['reference error'], { maxLength: 6 });
  reference.input.autocapitalize = 'characters';
  reference.input.spellcheck = false;
  const lastName = field('lastName', labels['last name label'], labels['last name error'], { autocomplete: 'family-name', maxLength: 31 });
  const toLastName = field('toLastName', labels['last name label'], labels['last name error'], { autocomplete: 'family-name', maxLength: 31 });
  const toFirstName = field('toFirstName', labels['first name label'], labels['first name error'], { autocomplete: 'given-name', maxLength: 26 });
  const toCode = field('tourOperatorCode', labels['tour operator code label'], labels['tour operator code error'], { maxLength: 12 });
  const hint = el('p', 'booking-lookup-hint', labels['tour operator code hint']);
  toCode.wrap.append(hint);
  toCode.input.title = labels['tour operator code info'];

  const bookingFields = el('div', 'booking-lookup-fields');
  bookingFields.append(reference.wrap, lastName.wrap);
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
  form.append(bookingFields, tourFields, checkboxLabel, actions);
  panel.append(form);

  const filled = (f) => () => f.input.value.trim() !== '';
  const bookingChecks = [
    [reference, () => referencePattern.test(reference.input.value.replace(/\s+/g, '').toUpperCase())],
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

export default function decorate(block) {
  instance += 1;
  const id = `booking-lookup-${instance}`;
  const locale = getLocale();
  const config = readConfigRows(block);
  if (block.classList.contains('my-bookings')) {
    decorateMyBookings(block, id, locale, config);
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
    window.location.assign(buildHandoffUrl({
      reference: normalizeReference(reference.input.value),
      firstName: firstName.input.value.trim(),
      lastName: lastName.input.value.trim(),
    }, locale, submitUrl));
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
    const tablist = buildTabs(id, tabs, panels, labels['tabs label']);
    block.replaceChildren(tablist, ...panels);
  } else {
    block.replaceChildren(formPanel);
  }
}
