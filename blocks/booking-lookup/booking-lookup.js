import { getLocale } from '../../scripts/locale.js';
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

export default function decorate(block) {
  instance += 1;
  const id = `booking-lookup-${instance}`;
  const locale = getLocale();
  const config = readConfigRows(block);
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

  if (extraPanels.length) {
    const panels = [formPanel, ...extraPanels];
    const tablist = buildTabs(id, tabs, panels, labels['tabs label']);
    block.replaceChildren(tablist, ...panels);
  } else {
    block.replaceChildren(formPanel);
  }
}
