/*
 * Pure helpers of the form block (no DOM): authored-table parsing and the validation rules of
 * the lufthansa.com AEM core forms (cmp-form). Imported by form.js and by the offline test
 * tools/importer/test-form.mjs.
 *
 * Live behaviour these rules follow (www.lufthansa.com, forms/container renderer.js,
 * forms/text site.js, forms/options renderer.js):
 * - required text fields: the message of the closest [data-cmp-required] wrapper
 *   (data-cmp-required-message) when empty; typeMismatch / patternMismatch: the wrapper's
 *   data-cmp-constraint-message
 * - selects, radio groups, checkboxes, autocompletes: the control's data-customerror
 * - fields inside hidden sections are not required, have no pattern and are cleared on submit
 */

/** Columns of the authored table, in default order (a header row may reorder or omit them). */
export const COLUMNS = ['label', 'type', 'name', 'required', 'options', 'help', 'placeholder',
  'message', 'constraint', 'rules'];

/** Header cell texts (EN and DE, normalized like toConfigKey) per column. */
export const HEADER_WORDS = {
  label: ['label', 'bezeichnung', 'beschriftung', 'feld', 'field', 'titel', 'title'],
  type: ['type', 'typ', 'feldtyp', 'field-type', 'art'],
  name: ['name', 'feldname', 'field-name', 'key', 'schluessel', 'id'],
  required: ['required', 'pflicht', 'pflichtfeld', 'erforderlich', 'mandatory'],
  options: ['options', 'optionen', 'auswahl', 'werte', 'values', 'choices'],
  help: ['help-text', 'help', 'hilfetext', 'hilfe', 'beschreibung', 'description', 'hinweistext', 'hint'],
  placeholder: ['placeholder', 'platzhalter'],
  message: ['validation-message', 'required-message', 'error-message', 'message', 'fehlermeldung',
    'pflichtfeld-meldung', 'meldung'],
  constraint: ['constraint-message', 'format-message', 'pattern-message', 'formatfehler',
    'format-meldung'],
  rules: ['rules', 'regeln', 'validation', 'validierung', 'attributes', 'attribute', 'settings',
    'einstellungen'],
};

export const TYPE_ALIASES = {
  step: 'step',
  schritt: 'step',
  section: 'step',
  fieldset: 'fieldset',
  subsection: 'fieldset',
  group: 'fieldset',
  gruppe: 'fieldset',
  panel: 'fieldset',
  end: 'end',
  'fieldset-end': 'end',
  ende: 'end',
  text: 'text',
  textfeld: 'text',
  email: 'email',
  'e-mail': 'email',
  tel: 'tel',
  phone: 'tel',
  telephone: 'tel',
  telefon: 'tel',
  number: 'number',
  zahl: 'number',
  date: 'date',
  datum: 'date',
  textarea: 'textarea',
  'text-area': 'textarea',
  textbereich: 'textarea',
  select: 'select',
  dropdown: 'select',
  auswahl: 'select',
  region: 'region',
  radio: 'radio',
  'radio-cards': 'radio-cards',
  radiocards: 'radio-cards',
  cards: 'radio-cards',
  checkbox: 'checkbox',
  checkboxes: 'checkbox',
  file: 'file',
  upload: 'file',
  datei: 'file',
  stepper: 'stepper',
  counter: 'stepper',
  autocomplete: 'autocomplete',
  airport: 'autocomplete',
  hidden: 'hidden',
  versteckt: 'hidden',
  note: 'note',
  hinweis: 'note',
  submit: 'submit',
  absenden: 'submit',
  button: 'submit',
  label: 'label',
  'feedback-modules': 'feedback-modules',
};

const REQUIRED_VALUES = ['yes', 'ja', 'true', 'x', 'required', 'pflicht', 'y', 'j'];
const NOT_REQUIRED_VALUES = ['no', 'nein', 'false', '-'];

/** Header word normalization: lowercase, accents dropped, non-alphanumerics -> "-". */
export function headerKey(text) {
  return String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Maps header cell texts to column indexes when the row is a recognizable header row
 * (at least two known header words), otherwise null.
 * @param {string[]} texts
 * @returns {Object<string, number>|null}
 */
export function readHeaderTexts(texts) {
  const map = {};
  let hits = 0;
  texts.forEach((text, index) => {
    const key = headerKey(text);
    const column = COLUMNS.find((c) => HEADER_WORDS[c].includes(key));
    if (column && map[column] === undefined) {
      map[column] = index;
      hits += 1;
    }
  });
  return hits >= 2 ? map : null;
}

/** Default column map (no header row). */
export function defaultColumnMap() {
  return Object.fromEntries(COLUMNS.map((c, i) => [c, i]));
}

/** Row type from the Type cell; unknown types render as text inputs. */
export function normalizeType(text) {
  return TYPE_ALIASES[headerKey(text)] || 'text';
}

/**
 * Required cell: "yes" (ja, true, x, required) = required; empty or "no" = optional without
 * a mark; any other text = optional, shown as the field's optional mark (maui "optional").
 * @returns {{required: boolean, optionalMark: string}}
 */
export function parseRequired(text) {
  const value = String(text || '').trim();
  const key = value.toLowerCase();
  if (REQUIRED_VALUES.includes(key)) return { required: true, optionalMark: '' };
  if (!value || NOT_REQUIRED_VALUES.includes(key)) return { required: false, optionalMark: '' };
  return { required: false, optionalMark: value };
}

/** Slug for names/values, keeping German umlauts readable (ä -> a). */
export function slugify(text) {
  return String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\u00df/g, 'ss')
    .toLowerCase()
    .replace(/[^0-9a-z]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const SELECTED_MARK = /\s*\{selected\}\s*$/i;

/**
 * One option per line: "value=Label", "=Label" (empty value, e.g. "Please select") or just
 * "Label" (value derived from the label); "{selected}" at the end preselects the option.
 * Without separate lines a single comma-separated line is split (legacy authoring).
 * @param {string[]} lines
 * @returns {{value: string, label: string, selected: boolean}[]}
 */
export function parseOptionLines(lines) {
  let parts = lines;
  if (lines.length === 1 && lines[0].includes(',')) {
    // legacy "a=A,b=B" or "A, B": split only when every part (or none) is a value=Label pair,
    // so a single "yes=I understand ..., at the airport" option stays whole
    const split = lines[0].split(',');
    const pairs = split.filter((p) => p.includes('=')).length;
    if (pairs === 0 || pairs === split.length) parts = split;
  }
  return parts.map((part) => String(part).trim()).filter(Boolean).map((part) => {
    const selected = SELECTED_MARK.test(part);
    const text = part.replace(SELECTED_MARK, '');
    const eq = text.indexOf('=');
    if (eq === -1) return { value: slugify(text), label: text, selected };
    const value = text.slice(0, eq).trim();
    const label = text.slice(eq + 1).trim();
    return { value, label: label || value, selected };
  }).filter((o) => o.label || o.value);
}

/** Rule keys with a number value. */
const NUMBER_RULES = ['maxlength', 'minlength', 'min', 'max', 'value', 'rows', 'repeat',
  'max-files', 'max-size', 'step'];
/** Rule keys that are flags (no value). */
const FLAG_RULES = ['hidden', 'uppercase', 'multiple'];

/**
 * Rules cell: one rule per line, "key=value" or "key: value" or a flag word.
 * Keys: pattern, maxlength, minlength, min, max, step, value, rows, inputmode, mask,
 * toggles (comma-separated section names), country (region: the country select's name),
 * accept, max-files, max-size, not-allowed, repeat, add, remove, remaining;
 * flags: hidden, uppercase, multiple.
 * @param {string[]} lines
 * @returns {Object}
 */
export function parseRules(lines) {
  const rules = {};
  lines.map((l) => String(l).trim()).filter(Boolean).forEach((line) => {
    const m = line.match(/^([a-z][a-z-]*)\s*(?:=|:)\s*([\s\S]*)$/i);
    if (!m) {
      const flag = line.toLowerCase();
      if (FLAG_RULES.includes(flag)) rules[flag] = true;
      return;
    }
    const key = m[1].toLowerCase();
    const value = m[2].trim();
    if (key === 'toggles') {
      rules.toggles = value.split(',').map((t) => t.trim()).filter(Boolean);
    } else if (NUMBER_RULES.includes(key)) {
      const n = Number(value.replace(/[\s,]/g, ''));
      if (Number.isFinite(n)) rules[key] = n;
    } else if (FLAG_RULES.includes(key)) {
      rules[key] = !/^(no|false|0|nein)$/i.test(value);
    } else {
      rules[key] = value;
    }
  });
  return rules;
}

/* ------------------------------------------------------------------------------------------ */
/* Dates (maui-masked-input variant date)                                                     */
/* ------------------------------------------------------------------------------------------ */

/** Date mask of a locale when the row names none: DD/MM/YYYY (en), DD.MM.YYYY (de). */
export function defaultDateMask(lang) {
  return lang === 'de' ? 'DD.MM.YYYY' : 'DD/MM/YYYY';
}

/**
 * Applies a date mask to typed text: keeps the digits and inserts the mask's separators,
 * e.g. ("15102022", "DD.MM.YYYY") -> "15.10.2022".
 */
export function applyDateMask(text, mask) {
  const digits = String(text || '').replace(/\D/g, '');
  let out = '';
  let d = 0;
  for (let i = 0; i < mask.length && d < digits.length; i += 1) {
    if (/[DMY]/i.test(mask[i])) {
      out += digits[d];
      d += 1;
    } else {
      out += mask[i];
    }
  }
  return out;
}

/** Whether a masked value is a complete, real calendar date. */
export function isValidMaskedDate(value, mask) {
  const text = String(value || '');
  if (text.length !== mask.length) return false;
  const part = (letter) => {
    const start = mask.toUpperCase().indexOf(letter.repeat(letter === 'Y' ? 4 : 2));
    return start === -1 ? NaN : Number(text.slice(start, start + (letter === 'Y' ? 4 : 2)));
  };
  for (let i = 0; i < mask.length; i += 1) {
    const isDigit = /\d/.test(text[i]);
    if (/[DMY]/i.test(mask[i]) !== isDigit) return false;
  }
  const day = part('D');
  const month = part('M');
  const year = part('Y');
  if (![day, month, year].every(Number.isFinite)) return false;
  if (month < 1 || month > 12 || day < 1) return false;
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return day <= days;
}

/* ------------------------------------------------------------------------------------------ */
/* Validation                                                                                 */
/* ------------------------------------------------------------------------------------------ */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEL = /^[+0-9][0-9 ()/.-]*$/;

/**
 * Checks one field value the way the live form does. Fields in hidden sections must not be
 * passed in (live: not required, no pattern).
 * @param {{type: string, required?: boolean, rules?: Object}} field
 * @param {string|string[]|number} value the value (checkbox groups: checked values)
 * @returns {string} '' when valid, else 'valueMissing' | 'typeMismatch' | 'patternMismatch'
 *   | 'tooShort' | 'tooLong' | 'rangeUnderflow' | 'rangeOverflow' | 'badDate'
 */
export function validateValue(field, value) {
  const rules = field.rules || {};
  const empty = Array.isArray(value) ? value.length === 0
    : value === undefined || value === null || String(value).trim() === '';
  if (empty) return field.required ? 'valueMissing' : '';
  if (Array.isArray(value)) return '';
  const text = String(value);
  if (field.type === 'email' && !EMAIL.test(text.trim())) return 'typeMismatch';
  if (field.type === 'tel' && !TEL.test(text.trim())) return 'typeMismatch';
  if (field.type === 'date' && rules.mask && !isValidMaskedDate(text, rules.mask)) return 'badDate';
  if (rules.pattern) {
    let re = null;
    try {
      // HTML pattern semantics: the whole value must match
      re = new RegExp(`^(?:${rules.pattern})$`, 'u');
    } catch (e) {
      re = null;
    }
    if (re && !re.test(text)) return 'patternMismatch';
  }
  if (rules.minlength && text.length < rules.minlength) return 'tooShort';
  if (rules.maxlength && text.length > rules.maxlength) return 'tooLong';
  if (['stepper', 'number'].includes(field.type)) {
    const n = Number(text);
    if (!Number.isFinite(n)) return 'typeMismatch';
    if (rules.min !== undefined && n < rules.min) return 'rangeUnderflow';
    if (rules.max !== undefined && n > rules.max) return 'rangeOverflow';
  }
  return '';
}

/**
 * The message the live form shows for a failed check: valueMissing -> Validation message;
 * format problems -> Constraint message (falling back to the Validation message); otherwise
 * the fallback (the browser's message).
 * @param {{message?: string, constraint?: string}} field
 * @param {string} reason result of validateValue
 * @param {string} [fallback]
 */
export function errorMessage(field, reason, fallback = '') {
  if (!reason) return '';
  if (reason === 'valueMissing') return field.message || fallback;
  return field.constraint || field.message || fallback;
}

/* ------------------------------------------------------------------------------------------ */
/* Repeatable sections (forms-repeatable-section)                                             */
/* ------------------------------------------------------------------------------------------ */

/** Name of a field in copy n of a repeatable section: "carrier" -> "carrier_2". */
export function repeatName(name, n) {
  return `${name}_${n}`;
}

/** Text of copy n: "{n}" replaced ("Flight {n}" -> "Flight 2"). */
export function repeatText(template, n) {
  return String(template || '').replace(/\{n\}/g, String(n));
}

/* ------------------------------------------------------------------------------------------ */
/* File drop (forms-filedrop)                                                                 */
/* ------------------------------------------------------------------------------------------ */

/** Whether a file matches an accept list ("image/png, application/pdf, .pdf, image/*"). */
export function fileAccepted(file, accept) {
  const list = String(accept || '').split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
  if (!list.length) return true;
  const name = String(file.name || '').toLowerCase();
  const type = String(file.type || '').toLowerCase();
  return list.some((token) => {
    if (token.startsWith('.')) return name.endsWith(token);
    if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1));
    return type === token;
  });
}

/**
 * Problem of one added file, checked as the live dropzone does (characters, size, type).
 * @returns {''|'invalidFileName'|'fileTooBig'|'invalidFileType'}
 */
export function fileProblem(file, rules = {}) {
  const notAllowed = String(rules['not-allowed'] || '').split('');
  if (notAllowed.some((c) => c && String(file.name || '').includes(c))) return 'invalidFileName';
  if (rules['max-size'] && file.size > rules['max-size']) return 'fileTooBig';
  if (!fileAccepted(file, rules.accept)) return 'invalidFileType';
  return '';
}

/** "1.2 MB" style size, as the live file list shows it (base 1000, one decimal from KB). */
export function formatFileSize(bytes, units = {
  b: 'Bytes', kb: 'KB', mb: 'MB', gb: 'GB', tb: 'TB',
}) {
  let size = Number(bytes) || 0;
  const order = ['kb', 'mb', 'gb', 'tb'];
  let unit = 'b';
  for (let i = 0; size >= 1000 && i < order.length; i += 1) {
    size /= 1000;
    unit = order[i];
  }
  return `${unit === 'b' ? size : size.toFixed(1)} ${units[unit]}`;
}
