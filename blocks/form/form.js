import { loadScript } from '../../scripts/aem.js';
import { getLocale } from '../../scripts/locale.js';
import { outsideUrl } from '../../scripts/clock.js';
import {
  cleanText, stripZeroWidth, toConfigKey, resolveLabels, decorateExternalLinks,
} from '../../scripts/block-config.js';
import {
  readHeaderTexts, defaultColumnMap, normalizeType, parseRequired, parseOptionLines, parseRules,
  slugify, defaultDateMask, applyDateMask, validateValue, errorMessage, repeatName, repeatText,
  fileProblem, formatFileSize,
} from './form-rules.js';

/*
 * Form block built from an authored field table.
 *
 * Form (the /feedback form): render-only. The <form> has no action, every submit is prevented,
 * nothing is uploaded and the only requests are the live catalogs and airport suggestions some
 * fields show (read-only GET requests, scripts/lh-data.js). A valid submit shows a status message.
 *
 * Variant "core" (Form (core)): the lufthansa.com AEM core forms (form.cmp-form): one field
 * column, maui fields with "optional" marks instead of required asterisks, sub-sections that
 * checkboxes show and hide, repeatable sections, a file drop zone, live's validation messages
 * (shown from the first submit on, then while typing), the submit button below the last band.
 * A valid submit posts the entries to the lh-forms worker (scripts/lh-forms.js, multipart:
 * form, locale, page, fields JSON, honeypot lh_hp, the bot check token, files) and goes to the
 * success page, or to the error page when anything fails (config rows: Type "config", Name
 * form / success / error). The bot check: a Cloudflare Turnstile widget above the submit button
 * (managed, shown only when it needs the visitor), its site key from lh-forms' configuration.
 */

/** UI strings; each can be overridden by a row of type "label" (Name = key, Label = text). */
const DEFAULT_LABELS = {
  en: {
    'sent message': 'This is a preview form. Nothing has been sent.',
    'success message': 'Thank you. Your request has been sent.',
    sending: 'Sending…',
    yes: 'Yes',
    no: 'No',
    'submit label': 'Submit',
    'required marker': '*',
    'required text': '(required)',
    'file none label': 'No file selected',
    'checkbox group error': 'Please select at least one option.',
    'required error': 'Please fill in this field.',
    'format error': 'Please check your entry.',
    'file prompt': 'Please drag and drop your files here',
    'file or': 'or',
    'file select': 'Select file(s)',
    'file list headline': 'Uploaded files',
    'file remove': 'Delete {NAME}',
    'file required': 'File upload is required',
    'file invalid type': 'Please upload a file with an accepted file type',
    'file too big': 'Please upload a file with an accepted file size',
    'file invalid name': 'The file name contains an invalid character',
    'file too many': 'No more than {MAX} can be uploaded',
    'stepper decrease': 'Decrease',
    'stepper increase': 'Increase',
    'repeat remove': 'Remove',
  },
  de: {
    'sent message': 'Dies ist ein Vorschauformular. Es wurden keine Daten gesendet.',
    'success message': 'Vielen Dank. Ihre Anfrage wurde gesendet.',
    sending: 'Wird gesendet…',
    yes: 'Ja',
    no: 'Nein',
    'submit label': 'Absenden',
    'required marker': '*',
    'required text': '(Pflichtfeld)',
    'file none label': 'Keine Datei ausgewählt',
    'checkbox group error': 'Bitte wählen Sie mindestens eine Option aus.',
    'required error': 'Bitte füllen Sie dieses Feld aus.',
    'format error': 'Bitte überprüfen Sie Ihre Eingabe.',
    'file prompt': 'Ziehen Sie Ihre Dateien bitte hier rein',
    'file or': 'oder',
    'file select': 'Datei auswählen',
    'file list headline': 'Hochgeladene Dateien',
    'file remove': '{NAME} löschen',
    'file required': 'Dateiablage ist notwendig',
    'file invalid type': 'Bitte laden Sie eine Datei mit einem akzeptierten Dateityp hoch',
    'file too big': 'Bitte laden Sie eine Datei mit akzeptierter Dateigröße hoch',
    'file invalid name': 'Der Dateiname enthält ein ungültiges Zeichen',
    'file too many': 'Es können nicht mehr als {MAX} hochgeladen werden',
    'stepper decrease': 'Verringern',
    'stepper increase': 'Erhöhen',
    'repeat remove': 'Entfernen',
  },
};

/** Rows that end the current sub-section (fieldset). */
const SECTION_BREAKS = ['step', 'fieldset', 'end', 'submit', 'feedback-modules'];

let instanceCount = 0;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

/** Text lines of a cell: one per paragraph / list item / line break. */
function cellLines(cell) {
  if (!cell) return [];
  const clone = cell.cloneNode(true);
  clone.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
  const blocks = [...clone.querySelectorAll('p, li')].filter((n) => !n.querySelector('p, li'));
  const texts = blocks.length ? blocks.map((n) => n.textContent) : [clone.textContent];
  return texts.flatMap((t) => t.split('\n'))
    .map((t) => stripZeroWidth(t).replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

/** Reads the authored rows into plain objects; cells stay available for rich content. */
function readRows(block) {
  const rows = [...block.children].map((row) => [...row.children])
    .filter((cells) => cells.some((c) => cleanText(c) || c.querySelector('img, a')));
  const header = rows.length ? readHeaderTexts(rows[0].map((c) => cleanText(c))) : null;
  const map = header || defaultColumnMap();
  const body = header ? rows.slice(1) : rows;
  return body.map((cells) => {
    const cell = (column) => (map[column] === undefined ? null : cells[map[column]] || null);
    const text = (column) => cleanText(cell(column));
    const { required, optionalMark } = parseRequired(text('required'));
    return {
      label: text('label'),
      labelCell: cell('label'),
      type: normalizeType(text('type')),
      name: text('name'),
      required,
      optionalMark,
      optionsCell: cell('options'),
      options: text('options'),
      optionLines: cellLines(cell('options')),
      helpCell: cell('help'),
      placeholder: text('placeholder'),
      message: text('message'),
      constraint: text('constraint'),
      rules: parseRules(cellLines(cell('rules'))),
    };
  });
}

function parseOptions(row) {
  return parseOptionLines(row.optionLines || []);
}

/** Moves the rich content of a cell into a new element; returns null for empty cells. */
function richContent(cell, tag, className) {
  if (!cell || !(cleanText(cell) || cell.querySelector('img, a'))) return null;
  const hasBlocks = cell.querySelector('p, ul, ol, div, h1, h2, h3, h4, h5, h6');
  const node = el(hasBlocks ? 'div' : tag, className);
  node.append(...cell.cloneNode(true).childNodes);
  decorateExternalLinks(node);
  return node;
}

function srOnly(text) {
  return el('span', 'form-sr-only', text);
}

function labelContent(row, ctx, group) {
  const { labels } = ctx;
  // labels with links (e.g. a consent checkbox) keep the authored inline content
  const cell = row.labelCell && row.labelCell.querySelector('a[href]') ? row.labelCell.cloneNode(true) : null;
  const source = cell && cell.children.length === 1 && cell.firstElementChild.tagName === 'P'
    ? cell.firstElementChild : cell;
  const parts = source ? [...source.childNodes] : [document.createTextNode(row.label)];
  if (source) decorateExternalLinks(source);
  if (row.required && !ctx.core) {
    const marker = el('span', 'form-required', labels['required marker']);
    marker.setAttribute('aria-hidden', 'true');
    parts.push(document.createTextNode(' '), marker);
    // controls carry the required attribute; groups announce it in their legend
    if (group) parts.push(srOnly(` ${labels['required text']}`));
  }
  return parts;
}

function describe(node, ...ids) {
  const list = [...(node.getAttribute('aria-describedby') || '').split(' '), ...ids]
    .filter(Boolean);
  if (list.length) node.setAttribute('aria-describedby', [...new Set(list)].join(' '));
}

/** Field definition the validation works with. */
function fieldDef(row) {
  return {
    type: row.type,
    required: row.required,
    rules: row.rules || {},
    message: row.message || '',
    constraint: row.constraint || '',
  };
}

/** Common wrapper, help and error elements of a field. */
function fieldShell(row, ctx) {
  ctx.fields += 1;
  const id = `${ctx.prefix}-${slugify(row.name) || 'field'}-${ctx.fields}`;
  const wrapper = el('div', `form-field form-field-${row.type}`);
  wrapper.dataset.name = row.name;
  const help = richContent(row.helpCell, 'p', 'form-help');
  if (help) help.id = `${id}-help`;
  const error = el('p', 'form-error');
  error.id = `${id}-error`;
  error.hidden = true;
  error.setAttribute('aria-live', 'polite');
  return {
    id, wrapper, help, error,
  };
}

/** maui "optional" mark of an optional field (core variant). */
function optionalMarkFor(row, ctx) {
  if (!ctx.core || !row.optionalMark) return null;
  const mark = el('span', 'form-optional', row.optionalMark);
  return mark;
}

function register(ctx, wrapper, entry) {
  ctx.entries.set(wrapper, { def: fieldDef(entry.row), ...entry });
}

/* ------------------------------------------------------------------------------------------ */
/* Field renderers                                                                            */
/* ------------------------------------------------------------------------------------------ */

/** Radio group, radio cards, checkbox group (checkbox with Options). */
function renderChoiceGroup(row, ctx) {
  const {
    id, wrapper, help, error,
  } = fieldShell(row, ctx);
  const options = parseOptions(row);
  const isCheckbox = row.type === 'checkbox';
  const fieldset = el('fieldset', `form-group form-group-${row.type}`);
  fieldset.id = id;
  if (row.label || (row.required && !ctx.core)) {
    const legend = el('legend', 'form-label');
    legend.append(...labelContent(row, ctx, true));
    fieldset.append(legend);
  }
  if (help) fieldset.append(help);
  const list = el('div', row.type === 'radio-cards' ? 'form-cards' : 'form-options');
  const inputType = isCheckbox ? 'checkbox' : 'radio';
  if (!isCheckbox) fieldset.setAttribute('role', 'radiogroup');
  if (row.required) fieldset.setAttribute('aria-required', 'true');
  const inputs = options.map((option, index) => {
    const input = el('input');
    input.type = inputType;
    input.name = row.name;
    input.value = option.value;
    input.id = `${id}-${index}`;
    if (!isCheckbox && row.required) input.required = true;
    if (option.selected) {
      input.checked = true;
      input.defaultChecked = true;
    }
    const label = el('label', row.type === 'radio-cards' ? 'form-card' : 'form-option');
    label.htmlFor = input.id;
    label.append(input, el('span', 'form-option-label', option.label));
    list.append(label);
    return input;
  });
  if (isCheckbox && row.required) fieldset.dataset.required = 'true';
  if (help) describe(fieldset, help.id);
  fieldset.append(list, error);
  wrapper.append(fieldset);
  register(ctx, wrapper, {
    row,
    controls: inputs,
    target: fieldset,
    help,
    error,
    value: () => (isCheckbox ? inputs.filter((i) => i.checked).map((i) => i.value)
      : (inputs.find((i) => i.checked) || {}).value || ''),
    fallback: (reason) => (reason === 'valueMissing' && isCheckbox
      ? ctx.labels['checkbox group error'] : ''),
  });
  return wrapper;
}

/** Native select with the authored options; type region gets its options at runtime. */
function buildSelect(row, id, ctx) {
  const control = el('select', 'form-control');
  const options = parseOptions(row);
  if (ctx.core && row.type === 'select' && !options.some((o) => o.value === '' || o.selected)) {
    // maui-select has no value until one is chosen (its label shows in the field): a hidden
    // empty option keeps a native select from defaulting to its first option
    const empty = el('option', '', row.placeholder || row.label);
    empty.value = '';
    empty.hidden = true;
    control.append(empty);
  } else if (row.placeholder && row.type === 'select' && !options.some((o) => o.value === '')) {
    const empty = el('option', '', row.placeholder);
    empty.value = '';
    empty.disabled = true;
    empty.selected = true;
    control.append(empty);
  }
  if (row.type === 'region') {
    const empty = el('option', '', row.placeholder);
    empty.value = '';
    control.append(empty);
  }
  options.forEach((option) => {
    const node = el('option', '', option.label);
    node.value = option.value;
    if (option.selected) {
      node.selected = true;
      node.defaultSelected = true;
    }
    control.append(node);
  });
  control.id = id;
  control.name = row.name;
  return control;
}

/** Stepper (maui-stepper): − value +, bounded by min / max. */
function buildStepper(row, ctx, control, wrapper) {
  const { rules } = row;
  const min = rules.min ?? 0;
  const max = rules.max ?? 99;
  const step = rules.step || 1;
  const start = rules.value ?? min;
  control.type = 'text';
  control.inputMode = 'numeric';
  control.setAttribute('value', String(start));
  control.value = String(start);
  control.setAttribute('role', 'spinbutton');
  control.setAttribute('aria-valuemin', String(min));
  control.setAttribute('aria-valuemax', String(max));
  const box = el('div', 'form-stepper');
  const down = el('button', 'form-stepper-button form-stepper-decrease');
  const up = el('button', 'form-stepper-button form-stepper-increase');
  [down, up].forEach((b) => {
    b.type = 'button';
    b.tabIndex = -1;
  });
  down.setAttribute('aria-label', `${ctx.labels['stepper decrease']}: ${row.label}`);
  up.setAttribute('aria-label', `${ctx.labels['stepper increase']}: ${row.label}`);
  const sync = () => {
    const n = Number(control.value);
    down.disabled = Number.isFinite(n) && n <= min;
    up.disabled = Number.isFinite(n) && n >= max;
    control.setAttribute('aria-valuenow', control.value);
  };
  const change = (dir) => {
    let n = Number(control.value);
    if (!Number.isFinite(n) || control.value.trim() === '') n = min;
    control.value = String(Math.min(max, Math.max(min, n + dir * step)));
    sync();
    control.dispatchEvent(new Event('change', { bubbles: true }));
  };
  down.addEventListener('click', () => change(-1));
  up.addEventListener('click', () => change(1));
  control.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      change(e.key === 'ArrowUp' ? 1 : -1);
    }
  });
  control.addEventListener('input', sync);
  control.addEventListener('form-reset', sync);
  box.append(down, control, up);
  sync();
  wrapper.append(box);
}

/** Airport suggestions for an autocomplete field (live, else recorded; datalist). */
function attachAirportSuggestions(control, id) {
  const list = el('datalist');
  list.id = `${id}-list`;
  control.setAttribute('list', list.id);
  control.autocomplete = 'off';
  let timer;
  let request = 0;
  control.addEventListener('input', () => {
    clearTimeout(timer);
    const term = control.value.trim();
    if (term.length < 2) return;
    timer = setTimeout(async () => {
      request += 1;
      const mine = request;
      try {
        const api = await import('../../scripts/lh-api.js');
        const locale = getLocale();
        const query = api.airportSuggestionsRequest(term, locale);
        const { data } = await api.fetchRequest(query, locale);
        if (mine !== request) return;
        list.replaceChildren(...api.mapAirportSuggestions(data).slice(0, 10).map((a) => {
          const option = el('option');
          option.value = a.name ? `${a.name} (${a.code})` : a.code;
          if (a.country) option.label = a.country;
          return option;
        }));
      } catch (e) {
        // no suggestions: the field stays a plain text field
      }
    }, 250);
  });
  return list;
}

/** Text-like fields, select, region, textarea, date, stepper, autocomplete, single checkbox. */
function renderControl(row, ctx) {
  const {
    id, wrapper, help, error,
  } = fieldShell(row, ctx);
  const { rules } = row;
  let control;
  if (row.type === 'textarea') {
    control = el('textarea', 'form-control');
    control.rows = rules.rows || 5;
  } else if (row.type === 'select' || row.type === 'region') {
    control = buildSelect(row, id, ctx);
  } else {
    control = el('input', 'form-control');
    const inputTypes = ['text', 'email', 'tel', 'number', 'date', 'checkbox'];
    control.type = inputTypes.includes(row.type) ? row.type : 'text';
    if (row.type === 'checkbox') control.value = 'yes';
  }
  control.id = id;
  control.name = row.name;
  if (row.required) {
    control.required = true;
    control.setAttribute('aria-required', 'true');
  }
  if (rules.maxlength && control.tagName !== 'SELECT') control.maxLength = rules.maxlength;
  if (rules.minlength && control.tagName !== 'SELECT') control.minLength = rules.minlength;
  if (rules.pattern && control.tagName === 'INPUT') control.pattern = rules.pattern;
  if (rules.inputmode) control.inputMode = rules.inputmode;
  if (row.type === 'email') control.autocomplete = 'email';
  if (row.type === 'tel') control.autocomplete = 'tel';

  let mask = '';
  if (row.type === 'date' && ctx.core) {
    // maui-masked-input variant date: digits only, the mask's separators are inserted
    mask = rules.mask || defaultDateMask(ctx.lang);
    rules.mask = mask;
    control.type = 'text';
    control.inputMode = 'numeric';
    control.maxLength = mask.length;
    control.placeholder = mask;
    control.addEventListener('input', () => {
      const masked = applyDateMask(control.value, mask);
      if (masked !== control.value) control.value = masked;
    });
  } else if (row.placeholder && !['select', 'region', 'checkbox', 'file', 'date'].includes(row.type)) {
    control.placeholder = row.placeholder;
  } else if (['text', 'email', 'tel', 'number', 'autocomplete'].includes(row.type)
    || (ctx.core && row.type === 'textarea')) {
    // blank placeholder: lets the CSS show the label inside the empty field (maui-input)
    control.placeholder = ' ';
  }
  if (rules.uppercase) {
    control.addEventListener('input', () => {
      const upper = control.value.toUpperCase();
      if (upper !== control.value) control.value = upper;
    });
  }
  if (help) describe(control, help.id);

  const label = el('label', 'form-label');
  label.htmlFor = id;
  label.append(...labelContent(row, ctx, false));
  // maui-select shows its label as the trigger text: an identical placeholder replaces it
  if (row.type === 'select' && row.placeholder && row.placeholder === row.label && !ctx.core) {
    label.classList.add('form-sr-only');
  }
  if (mask) {
    // the mask stands where the label would be (live); the label stays for assistive tech
    label.classList.add('form-label-masked');
  }

  if (row.type === 'checkbox') {
    const line = el('div', 'form-option');
    line.append(control, label);
    wrapper.append(line);
  } else if (row.type === 'stepper') {
    wrapper.append(label);
    buildStepper(row, ctx, control, wrapper);
  } else {
    wrapper.append(label, control);
  }
  const mark = optionalMarkFor(row, ctx);
  if (mark) {
    wrapper.classList.add('form-field-has-optional');
    wrapper.append(mark);
  }
  if (row.type === 'autocomplete') wrapper.append(attachAirportSuggestions(control, id));
  if (row.type === 'select' || row.type === 'region') {
    // maui-select: an empty select shows its label inside the field
    const syncEmpty = () => wrapper.classList.toggle('form-field-empty', !control.value);
    control.addEventListener('change', syncEmpty);
    control.addEventListener('form-reset', syncEmpty);
    syncEmpty();
  }
  if (help) wrapper.append(help);
  wrapper.append(error);
  register(ctx, wrapper, {
    row,
    controls: [control],
    target: control,
    help,
    error,
    value: () => {
      if (row.type === 'checkbox') return control.checked ? control.value : '';
      return control.value;
    },
  });
  return wrapper;
}

/** Plain file input (form block default): file names are listed, nothing is uploaded. */
function renderFileInput(row, ctx) {
  const {
    id, wrapper, help, error,
  } = fieldShell(row, ctx);
  const control = el('input', 'form-control');
  control.type = 'file';
  control.id = id;
  control.name = row.name;
  if (row.required) control.required = true;
  const tokens = row.options.split(',').map((t) => t.trim()).filter(Boolean);
  if (tokens.some((t) => t.toLowerCase() === 'multiple') || row.rules.multiple) control.multiple = true;
  const accept = row.rules.accept || tokens.filter((t) => t.toLowerCase() !== 'multiple').join(',');
  if (accept) control.accept = accept;
  if (help) describe(control, help.id);
  const label = el('label', 'form-label');
  label.htmlFor = id;
  label.append(...labelContent(row, ctx, false));
  const names = el('output', 'form-file-names', ctx.labels['file none label']);
  names.id = `${id}-files`;
  names.htmlFor = id;
  describe(control, names.id);
  control.addEventListener('change', () => {
    const files = [...(control.files || [])].map((f) => f.name);
    names.textContent = files.length ? files.join(', ') : ctx.labels['file none label'];
  });
  wrapper.append(label, control, names);
  if (help) wrapper.append(help);
  wrapper.append(error);
  register(ctx, wrapper, {
    row,
    controls: [control],
    target: control,
    help,
    error,
    value: () => [...(control.files || [])].map((f) => f.name),
  });
  return wrapper;
}

/**
 * File drop zone (core variant, live forms-filedrop): drop prompt, "or", select button, hint;
 * added files are checked (characters, size, type, count) and listed with a delete button.
 * The accepted files are sent with the submission (file_1 .. file_n).
 */
function renderFileDrop(row, ctx) {
  const {
    id, wrapper, help, error,
  } = fieldShell(row, ctx);
  const { labels } = ctx;
  const rules = { ...row.rules };
  const tokens = row.options.split(',').map((t) => t.trim()).filter(Boolean);
  if (!rules.accept) rules.accept = tokens.filter((t) => t.toLowerCase() !== 'multiple').join(',');
  const maxFiles = rules['max-files'] || (tokens.some((t) => /^multiple$/i.test(t)) ? 10 : 1);
  wrapper.classList.add('form-filedrop');

  const input = el('input', 'form-filedrop-input');
  input.type = 'file';
  input.id = id;
  input.name = row.name;
  input.multiple = maxFiles > 1;
  if (rules.accept) input.accept = rules.accept;
  input.tabIndex = -1;
  input.setAttribute('aria-hidden', 'true');

  const zone = el('div', 'form-filedrop-zone');
  const content = el('div', 'form-filedrop-content');
  const icon = el('span', 'form-filedrop-icon');
  icon.setAttribute('aria-hidden', 'true');
  const desc = el('div', 'form-filedrop-desc');
  desc.setAttribute('aria-hidden', 'true');
  desc.append(el('div', 'form-filedrop-prompt', row.label || labels['file prompt']), el('div', 'form-filedrop-or', labels['file or']));
  const button = el('button', 'form-filedrop-button', row.placeholder || labels['file select']);
  button.type = 'button';
  button.id = `${id}-button`;
  if (help) describe(button, help.id);
  content.append(icon, desc, button);
  zone.append(content);
  if (help) {
    help.classList.add('form-filedrop-hint');
    zone.append(help);
  }
  const status = srOnly(row.required ? labels['file required'] : (row.optionalMark || ''));
  status.id = `${id}-status`;
  describe(button, status.id);
  zone.append(status, input);

  const listHead = el('p', 'form-filedrop-list-title', labels['file list headline']);
  listHead.hidden = true;
  const list = el('ul', 'form-filedrop-list');
  list.setAttribute('aria-label', labels['file list headline']);
  let files = [];

  const renderList = () => {
    list.replaceChildren(...files.map((entry, index) => {
      const item = el('li', `form-filedrop-item${entry.problem ? ' form-filedrop-item-rejected' : ''}`);
      const info = el('div', 'form-filedrop-info');
      info.append(el('div', 'form-filedrop-name', entry.file.name), el('div', 'form-filedrop-size', formatFileSize(entry.file.size)));
      if (entry.problem) info.append(el('div', 'form-filedrop-error', entry.message));
      const remove = el('button', 'form-filedrop-remove');
      remove.type = 'button';
      remove.setAttribute('aria-label', labels['file remove'].replace('{NAME}', entry.file.name));
      remove.addEventListener('click', () => {
        files.splice(index, 1);
        renderList();
        button.focus();
        wrapper.dispatchEvent(new Event('change', { bubbles: true }));
      });
      item.append(info, remove);
      return item;
    }));
    listHead.hidden = !files.length;
    const accepted = files.filter((f) => !f.problem).length;
    zone.hidden = accepted >= maxFiles;
  };
  const add = (added) => {
    [...added].forEach((file) => {
      let problem = fileProblem(file, rules);
      if (!problem && files.filter((f) => !f.problem).length >= maxFiles) problem = 'tooMany';
      const message = {
        invalidFileName: labels['file invalid name'],
        fileTooBig: labels['file too big'],
        invalidFileType: labels['file invalid type'],
        tooMany: labels['file too many'].replace('{MAX}', String(maxFiles)),
      }[problem] || '';
      files.push({ file, problem, message });
    });
    renderList();
    wrapper.dispatchEvent(new Event('change', { bubbles: true }));
  };
  button.addEventListener('click', () => input.click());
  input.addEventListener('change', (e) => {
    e.stopPropagation();
    add(input.files || []);
    input.value = '';
  });
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('form-filedrop-active');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('form-filedrop-active'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('form-filedrop-active');
    if (e.dataTransfer) add(e.dataTransfer.files || []);
  });
  wrapper.addEventListener('form-reset', () => {
    files = [];
    renderList();
  });

  wrapper.append(zone, error);
  if (!row.required && row.optionalMark) {
    const mark = el('p', 'form-filedrop-optional', row.optionalMark);
    mark.setAttribute('aria-hidden', 'true');
    wrapper.append(mark);
  }
  wrapper.append(listHead, list);
  register(ctx, wrapper, {
    row,
    controls: [button],
    target: button,
    help: null, // the format hint stays visible next to an error
    error,
    value: () => files.filter((f) => !f.problem).map((f) => f.file.name),
    files: () => files.filter((f) => !f.problem).map((f) => f.file),
    fallback: (reason) => (reason === 'valueMissing' ? labels['file required'] : ''),
  });
  return wrapper;
}

/** Hidden input (never shown, never sent). */
function renderHidden(row) {
  const input = el('input');
  input.type = 'hidden';
  input.name = row.name;
  input.value = row.options;
  return input;
}

/** Builds one field wrapper. Returns null for rows that render nothing. */
function renderField(row, ctx) {
  if (row.type === 'hidden') return renderHidden(row);
  if (['radio', 'radio-cards'].includes(row.type)
    || (row.type === 'checkbox' && parseOptions(row).length)) {
    return renderChoiceGroup(row, ctx);
  }
  if (row.type === 'file') return ctx.core ? renderFileDrop(row, ctx) : renderFileInput(row, ctx);
  return renderControl(row, ctx);
}

/** Note row: Label content (rich) as a static paragraph. */
function renderNote(row) {
  const note = richContent(row.labelCell, 'p', 'form-note');
  if (!note) return null;
  // a one-paragraph cell arrives without its <p> (aem.js wraps the text later), so scripts.js
  // never saw the marker: "Travel dates in 28 days at the earliest. {copytext-small}"
  (note.tagName === 'P' ? [note] : [...note.querySelectorAll('p')]).forEach((p) => {
    const lastText = (node) => {
      for (let c = node.lastChild; c; c = c.previousSibling) {
        if (c.nodeType === 3 && c.nodeValue.trim()) return c;
        const inner = c.nodeType === 1 ? lastText(c) : null;
        if (inner) return inner;
      }
      return null;
    };
    const last = lastText(p);
    const m = last && last.nodeValue.match(/\s*\{((?:copytext-(?:small|medium|large)|full-width|limited-width)(?: [a-z-]+)*)\}\s*$/);
    if (!m) return;
    last.nodeValue = last.nodeValue.slice(0, m.index);
    p.classList.add(...m[1].split(' '));
  });
  const wrapper = el('div', 'form-field form-field-note');
  wrapper.append(note);
  const help = richContent(row.helpCell, 'p', 'form-help');
  if (help) wrapper.append(help);
  return wrapper;
}

function createStep(row, ctx) {
  const step = el('div', 'form-step');
  const card = el('div', 'form-step-card');
  const fields = el('div', 'form-fields');
  card.append(fields);
  if (row) {
    const intro = el('div', 'form-step-intro');
    const titleId = `${ctx.prefix}-step-${ctx.steps + 1}`;
    if (row.label) {
      const title = el(ctx.core ? 'h2' : 'p', 'form-step-title', row.label);
      title.id = titleId;
      intro.append(title);
      step.setAttribute('role', 'group');
      step.setAttribute('aria-labelledby', titleId);
    }
    const description = richContent(row.helpCell, 'p', 'form-step-description');
    if (description) intro.append(description);
    if (intro.children.length) step.append(intro);
  } else {
    step.classList.add('form-step-plain');
  }
  step.append(card);
  ctx.steps += 1;
  return { step, fields };
}

/* ------------------------------------------------------------------------------------------ */
/* Sub-sections: show / hide, repeatable sections                                             */
/* ------------------------------------------------------------------------------------------ */

/** Resets the controls of a hidden section to their authored defaults (live clears them). */
function resetControls(root) {
  root.querySelectorAll('input, select, textarea').forEach((control) => {
    if (control.type === 'hidden' || control.type === 'file') return;
    if (control.type === 'checkbox' || control.type === 'radio') {
      const was = control.checked;
      control.checked = control.defaultChecked;
      if (was !== control.checked) control.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (control.tagName === 'SELECT') {
      const before = control.value;
      const preset = [...control.options].find((o) => o.defaultSelected);
      if (preset) preset.selected = true;
      else control.selectedIndex = 0;
      if (before !== control.value) control.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      control.value = control.defaultValue;
    }
    control.dispatchEvent(new Event('form-reset'));
  });
  root.querySelectorAll('.form-filedrop').forEach((w) => w.dispatchEvent(new Event('form-reset')));
  root.querySelectorAll('.form-field-invalid').forEach((w) => w.classList.remove('form-field-invalid'));
  root.querySelectorAll('.form-error').forEach((e) => {
    e.hidden = true;
    e.textContent = '';
  });
  root.querySelectorAll('.form-help[hidden]').forEach((h) => { h.hidden = false; });
  root.querySelectorAll('[aria-invalid]').forEach((c) => c.removeAttribute('aria-invalid'));
}

/** Shows or hides a sub-section; hidden sections are disabled (no validation) and cleared. */
function setSectionVisible(section, visible, clear = true) {
  if (section.hidden === !visible) return;
  section.hidden = !visible;
  section.disabled = !visible;
  if (!visible && clear) resetControls(section);
}

function createFieldset(row) {
  const fieldset = el('fieldset', 'form-subsection');
  if (row.name) fieldset.dataset.section = row.name;
  if (row.label) {
    const legend = el('legend', 'form-subsection-title', row.label);
    legend.tabIndex = -1;
    fieldset.append(legend);
  }
  const content = el('div', 'form-subsection-fields');
  fieldset.append(content);
  if (row.rules && row.rules.hidden) {
    fieldset.dataset.initialHidden = 'true';
    setSectionVisible(fieldset, false, false);
  }
  return { fieldset, content };
}

/**
 * Repeatable section (live forms-repeatable-section): N copies of the section rows, field
 * names suffixed _1 .. _N, copies 2..N hidden; "add" shows the next copy, the last shown copy
 * can be removed again; a counter text names how many can still be added.
 */
function renderRepeat(row, template, ctx, renderRow) {
  const total = Math.max(1, Math.min(row.rules.repeat || 1, 50));
  const host = el('div', 'form-repeat');
  if (row.name) host.dataset.repeat = row.name;
  const names = new Set(template.map((r) => r.name).filter(Boolean));
  const copies = [];
  for (let n = 1; n <= total; n += 1) {
    const { fieldset, content } = createFieldset({
      ...row,
      label: repeatText(row.label, n),
      name: row.name ? repeatName(row.name, n) : '',
      rules: {},
    });
    fieldset.dataset.repeatIndex = String(n);
    let remove = null;
    if (n > 1) {
      remove = el('button', 'form-repeat-remove');
      remove.type = 'button';
      remove.setAttribute('aria-label', row.rules.remove || ctx.labels['repeat remove']);
      remove.hidden = true;
      fieldset.insertBefore(remove, content);
    }
    template.forEach((t) => {
      const rules = { ...t.rules };
      if (rules.country && names.has(rules.country)) rules.country = repeatName(rules.country, n);
      renderRow({
        ...t, name: t.name ? repeatName(t.name, n) : t.name, rules,
      }, content);
    });
    host.append(fieldset);
    copies.push({ fieldset, remove });
    if (n > 1) setSectionVisible(fieldset, false, false);
  }
  if (total > 1) {
    const add = el('button', 'form-repeat-add', row.rules.add || '+');
    add.type = 'button';
    const remaining = el('p', 'form-repeat-remaining');
    remaining.setAttribute('aria-live', 'polite');
    const update = () => {
      const hidden = copies.filter((c) => c.fieldset.hidden);
      const shown = copies.filter((c) => !c.fieldset.hidden);
      remaining.textContent = repeatText(row.rules.remaining || '', hidden.length);
      add.hidden = !hidden.length;
      remaining.hidden = !hidden.length || !row.rules.remaining;
      copies.forEach((c) => {
        if (c.remove) c.remove.hidden = c !== shown[shown.length - 1];
      });
    };
    add.addEventListener('click', () => {
      const next = copies.find((c) => c.fieldset.hidden);
      if (!next) return;
      setSectionVisible(next.fieldset, true);
      update();
      const legend = next.fieldset.querySelector('legend');
      setTimeout(() => (legend || next.fieldset).focus(), 100);
    });
    copies.forEach((c) => {
      if (!c.remove) return;
      c.remove.addEventListener('click', () => {
        setSectionVisible(c.fieldset, false);
        update();
        add.focus();
      });
    });
    host.append(add, remaining);
    update();
  }
  return host;
}

/** Checkbox rows with "toggles": checking shows (or, for sections shown at load, hides) them. */
function setupToggles(form, ctx) {
  ctx.toggles.forEach(({ wrapper, targets }) => {
    const boxes = [...wrapper.querySelectorAll('input[type="checkbox"]')];
    const apply = () => {
      const on = boxes.some((b) => b.checked);
      targets.forEach((name) => {
        form.querySelectorAll(`fieldset[data-section="${CSS.escape(name)}"]`).forEach((section) => {
          const startsHidden = section.dataset.initialHidden === 'true';
          setSectionVisible(section, startsHidden ? on : !on);
        });
      });
    };
    boxes.forEach((b) => b.addEventListener('change', apply));
    apply();
  });
}

/**
 * Region selects (live forms-country): shown with the selected country's regions from
 * catalogs/countries (live, else the recordings), hidden for countries without regions.
 */
function setupRegions(form, block, ctx) {
  if (!ctx.regions.length) return;
  let catalog = null;
  const load = () => {
    if (!catalog) {
      catalog = Promise.all([import('../../scripts/lh-api.js'), import('../../scripts/lh-data.js')])
        .then(async ([api, data]) => {
          const locale = getLocale();
          try {
            const result = await api.fetchRequest(api.catalogRequest('countries'), locale);
            data.markSource(block, { 'catalogs/countries': result.source }, ['catalogs/countries']);
            return Object.fromEntries(((result.data && result.data.countriesEnhanced) || [])
              .map((c) => [c.code, c.countryRegions || []]));
          } catch (e) {
            data.markSource(block, { 'catalogs/countries': 'none' }, ['catalogs/countries']);
            return {};
          }
        });
    }
    return catalog;
  };
  ctx.regions.forEach(({ wrapper, row }) => {
    const select = wrapper.querySelector('select');
    const country = form.querySelector(`select[name="${CSS.escape(row.rules.country || '')}"]`);
    const show = (visible) => {
      wrapper.hidden = !visible;
      select.disabled = !visible;
      if (!visible) {
        select.selectedIndex = 0;
        select.dispatchEvent(new Event('form-reset'));
      }
    };
    show(false);
    if (!country) return;
    country.addEventListener('change', async () => {
      const code = country.value;
      if (!code) {
        show(false);
        return;
      }
      const regions = (await load())[code] || [];
      if (country.value !== code) return;
      const empty = el('option', '', row.placeholder);
      empty.value = '';
      select.replaceChildren(empty, ...regions.map((r) => {
        const option = el('option', '', r.name);
        option.value = r.code;
        return option;
      }));
      show(regions.length > 0);
      select.dispatchEvent(new Event('form-reset'));
    });
  });
}

/* ------------------------------ topic-dependent feedback modules ------------------------- */

/** A cell-like element holding text, for rows built from data instead of the document. */
function textCell(text) {
  if (!text) return null;
  const cell = el('div');
  cell.append(el('p', '', text));
  return cell;
}

/** Form-block row for a field definition of feedback-modules.js. */
function moduleRow(field, prefix) {
  const optionLines = field.options.map(([value, label]) => `${value}=${label}`);
  return {
    label: field.label,
    labelCell: null,
    type: field.type,
    name: `${prefix}-${field.name}`,
    required: field.required,
    optionalMark: '',
    optionsCell: null,
    optionLines,
    options: field.type === 'file' ? [field.accept, field.multiple ? 'multiple' : ''].filter(Boolean).join(',')
      : optionLines.join(','),
    helpCell: textCell(field.help),
    placeholder: field.type === 'select' ? field.label : '',
    message: '',
    constraint: '',
    rules: {},
  };
}

/**
 * Row type "feedback-modules" (Name = the topic select): the sections of the selected topic,
 * from the feedbackForm catalog and labels (blocks/form/feedback-modules.js), followed by the
 * submit button. Nothing is shown before a topic is chosen, as on the live site.
 */
function setupFeedbackModules(form, host, selectName, ctx) {
  const select = form.querySelector(`select[name="${CSS.escape(selectName)}"]`);
  if (!select) return;
  const block = form.closest('.block') || form;
  let data = null;
  let loading = null;
  const render = async () => {
    if (!data) {
      loading = loading || import('./feedback-modules.js').then(async (mod) => {
        const loaded = await mod.loadFeedbackData();
        const { markSource } = await import('../../scripts/lh-data.js');
        markSource(block, loaded.sources, ['catalogs/feedbackForm', 'labels/feedbackform']);
        return { mod, loaded };
      });
      data = await loading;
    }
    const { steps, submit } = data.mod.topicSections(data.loaded, select.value);
    const nodes = [];
    steps.forEach((def, i) => {
      const { step, fields } = createStep(null, ctx);
      step.classList.remove('form-step-plain');
      const intro = el('div', 'form-step-intro');
      const titleId = `${ctx.prefix}-module-${ctx.steps}`;
      const title = el('p', 'form-step-title', def.title);
      title.id = titleId;
      intro.append(title);
      if (def.description) intro.append(el('p', 'form-step-description', def.description));
      step.prepend(intro);
      step.setAttribute('role', 'group');
      step.setAttribute('aria-labelledby', titleId);
      def.fields.forEach((field) => {
        const wrapper = renderField(moduleRow(field, `${selectName}-${i + 1}`), ctx);
        if (field.checked) {
          const radio = wrapper.querySelector(`input[value="${CSS.escape(field.checked)}"]`);
          if (radio) radio.checked = true;
        }
        fields.append(wrapper);
      });
      // a radio group that names the field after it (Ticket number / Booking reference)
      def.fields.filter((f) => f.controls).forEach((field) => {
        const target = fields.querySelector(`[data-name="${selectName}-${i + 1}-${field.controls}"] .form-label`);
        fields.querySelectorAll(`input[name="${selectName}-${i + 1}-${field.name}"]`).forEach((radio) => {
          radio.addEventListener('change', () => {
            const text = radio.closest('label')?.textContent.trim();
            if (target && text) target.firstChild.textContent = text;
          });
        });
      });
      nodes.push(step);
    });
    if (submit && nodes.length) {
      const { step, fields } = createStep(null, ctx);
      const actions = el('div', 'form-field form-actions');
      const button = el('button', 'button', submit);
      button.type = 'submit';
      actions.append(button);
      fields.append(actions);
      nodes.push(step);
    }
    host.replaceChildren(...nodes);
  };
  select.addEventListener('change', () => { render(); });
  if (select.value) render();
}

/* --------------------------------------- validation -------------------------------------- */

/** Whether a field is in a hidden or disabled section (live: not validated, not required). */
function isInactive(wrapper) {
  return Boolean(wrapper.hidden || wrapper.closest('[hidden], fieldset[disabled]'));
}

function clearError(entry, wrapper) {
  const { error, help, controls } = entry;
  error.hidden = true;
  error.textContent = '';
  if (help) help.hidden = false;
  controls.forEach((c) => c.removeAttribute('aria-invalid'));
  wrapper.classList.remove('form-field-invalid');
}

/** Shows or clears the inline message of one field wrapper; returns whether it is valid. */
function checkField(wrapper, ctx) {
  const entry = ctx.entries.get(wrapper);
  if (!entry) return true;
  if (isInactive(wrapper)) {
    clearError(entry, wrapper);
    return true;
  }
  const reason = validateValue(entry.def, entry.value());
  if (!reason) {
    clearError(entry, wrapper);
    return true;
  }
  const native = entry.controls[0] && entry.controls[0].validationMessage;
  const fallback = (entry.fallback && entry.fallback(reason)) || native
    || ctx.labels[reason === 'valueMissing' ? 'required error' : 'format error'];
  const { error, help, controls } = entry;
  error.textContent = errorMessage(entry.def, reason, fallback);
  error.hidden = false;
  // live: the error message takes the place of the hint
  if (help && ctx.core) help.hidden = true;
  describe(entry.target, error.id);
  controls.forEach((c) => {
    c.setAttribute('aria-invalid', 'true');
    if (c !== entry.target) describe(c, error.id);
  });
  wrapper.classList.add('form-field-invalid');
  return false;
}

/* ------------------------------- sending (Form (core) only) ------------------------------ */

/** Value of a config row: the link of its Label (or Options) cell, else the cell text. */
function configValue(row) {
  const link = [row.labelCell, row.optionsCell]
    .map((c) => (c ? c.querySelector('a[href]') : null)).find(Boolean);
  if (link) return link.getAttribute('href').trim();
  return row.label || row.options;
}

/** Config rows (Type config): form = worker form id, success / error = page links. */
function readConfig(rows) {
  const config = {};
  rows.filter((r) => r.type === 'config').forEach((r) => {
    const key = toConfigKey(r.name);
    const value = configValue(r);
    if (key && value && !(key in config)) config[key] = value;
  });
  return config;
}

/**
 * URL to go to for an authored page link: relative links stay on this host (also links DA made
 * absolute to an aem.page / aem.live host, and www.lufthansa.com links); under /content/ (local
 * dev server) the locale paths get the /content prefix.
 */
function pageUrl(href) {
  const here = window.location;
  const url = new URL(href, here.href);
  let path = `${url.pathname}${url.search}${url.hash}`;
  // www.lufthansa.com links (the importer keeps links to pages not migrated at import time, and
  // live's /error.html, absolute) name the same page on this site
  if (url.origin !== here.origin && !/\.aem\.(page|live)$/.test(url.hostname)
    && url.hostname !== 'www.lufthansa.com') return url.href;
  if (here.pathname.startsWith('/content/') && /^\/[a-z]{2}\/[a-z]{2}(\/|$)/.test(path)) {
    path = `/content${path}`;
  }
  return `${here.origin}${path}`;
}

/** Text of the option label next to a checkbox or radio input. */
function optionText(input) {
  const label = input.closest('label');
  return cleanText(label && label.querySelector('.form-option-label'));
}

/** Sub-section heading (repeat copy title) of a field, else the band headline. */
function fieldSection(wrapper) {
  const sub = wrapper.closest('fieldset.form-subsection');
  const legend = sub ? [...sub.children].find((c) => c.tagName === 'LEGEND') : null;
  const heading = cleanText(legend);
  if (heading) return heading;
  const step = wrapper.closest('.form-step');
  const band = cleanText(step && step.querySelector('.form-step-title'));
  const copy = sub && sub.dataset.repeatIndex;
  return copy && band ? `${band} ${copy}` : band;
}

/** The label the user saw: field label, group question, else the checkbox text(s). */
function fieldLabel(entry, ctx) {
  const { row, controls } = entry;
  if (row.label) return row.label;
  if (row.type === 'file') return ctx.labels['file prompt'];
  const texts = controls.filter((c) => c.type === 'checkbox' || c.type === 'radio')
    .map(optionText).filter(Boolean);
  return texts.join(' / ') || row.name;
}

/** What the user entered, as shown: option texts, Yes / No for one checkbox, file names. */
function fieldValue(entry, ctx) {
  const { controls } = entry;
  if (entry.files) return entry.files().map((f) => f.name).join(', ');
  const control = controls[0];
  if (control && control.tagName === 'SELECT') {
    const option = control.value ? control.options[control.selectedIndex] : null;
    return option ? cleanText(option) : '';
  }
  const boxes = controls.filter((c) => c.type === 'checkbox' || c.type === 'radio');
  if (boxes.length === 1 && boxes[0].type === 'checkbox') {
    return boxes[0].checked ? ctx.labels.yes : ctx.labels.no;
  }
  if (boxes.length) return boxes.filter((c) => c.checked).map(optionText).join(', ');
  const value = entry.value();
  return Array.isArray(value) ? value.join(', ') : String(value ?? '');
}

/**
 * The entries in page order: {section, label, name, value}. Fields in hidden sub-sections,
 * hidden repeat copies and hidden region selects are left out (live removes hidden fields);
 * hidden inputs, notes and the submit button are no fields.
 */
function collectFields(fieldWrappers, ctx) {
  return fieldWrappers.filter((w) => !isInactive(w)).map((w) => {
    const entry = ctx.entries.get(w);
    return {
      section: fieldSection(w),
      label: fieldLabel(entry, ctx),
      name: entry.row.name,
      value: fieldValue(entry, ctx),
    };
  });
}

/** How long a submit waits for the bot check's token (the widget may need the visitor). */
const BOT_CHECK_WAIT = 60000;

/**
 * Bot check (Form (core) only): the Turnstile widget above the submit button, with the site key
 * from lh-forms (GET /config; scripts/lh-forms.js). token() resolves to the widget's token, waits
 * for it while the widget runs, '' without a site key or when the widget fails (it hides; the
 * worker decides: with BOT_CHECK on, 403 and the error page). reset() after a submission (a
 * token is good for one check).
 */
function setupBotCheck(form, ctx) {
  const holder = el('div', 'form-bot-check');
  holder.hidden = true;
  const actions = [...form.children].find((c) => c.classList.contains('form-actions'));
  form.insertBefore(holder, actions || form.querySelector(':scope > .form-status'));
  const state = {
    id: null, token: '', done: false, waiters: [],
  };
  const settle = (value) => state.waiters.splice(0).forEach((resolve) => resolve(value));
  const fail = () => {
    state.done = true;
    state.token = '';
    holder.hidden = true;
    settle('');
  };
  (async () => {
    const forms = await import('../../scripts/lh-forms.js');
    const sitekey = forms.turnstileSiteKey(await forms.formsConfig());
    if (!sitekey) {
      fail();
      return;
    }
    await loadScript(forms.TURNSTILE_API, { async: '' });
    holder.hidden = false;
    state.id = window.turnstile.render(holder, {
      sitekey,
      appearance: 'interaction-only',
      language: ctx.lang,
      'response-field': false,
      callback: (token) => {
        state.token = token;
        settle(token);
      },
      'expired-callback': () => { state.token = ''; },
      'timeout-callback': () => { state.token = ''; },
      'error-callback': () => {
        fail();
        return true;
      },
    });
  })().catch(fail);
  return {
    token() {
      if (state.token || state.done) return Promise.resolve(state.token);
      return new Promise((resolve) => {
        state.waiters.push(resolve);
        setTimeout(() => resolve(state.token), BOT_CHECK_WAIT);
      });
    },
    reset() {
      if (state.id === null || state.done || !window.turnstile) return;
      state.token = '';
      window.turnstile.reset(state.id);
    },
  };
}

/** The multipart body of POST /submit (tools/workers/lh-forms/README.md). */
function buildSubmission(form, fieldWrappers, ctx, formId, token) {
  const data = new FormData();
  data.append('form', formId);
  data.append('locale', getLocale().key.replace('/', '-'));
  // without the preview's time-travel parameters (scripts/clock.js)
  data.append('page', outsideUrl(window.location.href));
  data.append('fields', JSON.stringify(collectFields(fieldWrappers, ctx)));
  const trap = form.querySelector('input[name="lh_hp"]');
  data.append('lh_hp', trap ? trap.value : '');
  if (token) data.append('cf-turnstile-response', token);
  let n = 0;
  fieldWrappers.filter((w) => !isInactive(w)).forEach((w) => {
    const entry = ctx.entries.get(w);
    if (!entry.files) return;
    entry.files().forEach((file) => {
      n += 1;
      data.append(`file_${n}`, file, file.name);
    });
  });
  return data;
}

/** Busy state of the submit button while posting. */
function setBusy(button, busy) {
  if (!button) return;
  button.disabled = busy;
  if (busy) button.setAttribute('aria-busy', 'true');
  else button.removeAttribute('aria-busy');
  button.classList.toggle('form-button-busy', busy);
}

/**
 * Posts a valid core form once: ok -> the success page (no success row: the success message),
 * any failure (network, non-2xx, ok false) -> the error page. No retries.
 */
async function sendForm(form, fieldWrappers, ctx, button, status) {
  if (ctx.sending) return;
  ctx.sending = true;
  ctx.busyButton = button;
  setBusy(button, true);
  status.textContent = ctx.labels.sending;
  const { config } = ctx;
  let ok = false;
  try {
    const forms = await import('../../scripts/lh-forms.js');
    const formId = config.form || forms.formIdFromPath();
    const token = ctx.botCheck ? await ctx.botCheck.token() : '';
    const body = buildSubmission(form, fieldWrappers, ctx, formId, token);
    // no forms endpoint (a production host without <meta name="forms-endpoint">): not sent
    const endpoint = forms.formsEndpoint();
    if (!endpoint) throw new Error('no forms endpoint');
    const response = await fetch(`${endpoint}/submit`, {
      method: 'POST', body, credentials: 'omit',
    });
    if (ctx.botCheck) ctx.botCheck.reset();
    const result = response.ok ? await response.json() : null;
    ok = Boolean(result && result.ok === true);
  } catch (e) {
    ok = false;
  }
  if (!ok) {
    window.location.href = pageUrl(config.error || '/error.html');
    return;
  }
  if (config.success) {
    window.location.href = pageUrl(config.success);
    return;
  }
  ctx.sending = false;
  setBusy(button, false);
  status.textContent = ctx.labels['success message'];
}

/** Honeypot (lh_hp): a text input people never see or reach; bots fill it in. */
function honeypot() {
  const trap = el('div', 'form-hp');
  trap.setAttribute('aria-hidden', 'true');
  const input = el('input');
  input.type = 'text';
  input.name = 'lh_hp';
  input.tabIndex = -1;
  input.autocomplete = 'off';
  input.setAttribute('aria-hidden', 'true');
  trap.append(input);
  return trap;
}

/* ----------------------------------------------------------------------------------------- */

export default function decorate(block) {
  instanceCount += 1;
  const prefix = `form-${instanceCount}`;
  const locale = getLocale();
  const rows = readRows(block);

  const overrides = {};
  rows.filter((r) => r.type === 'label').forEach((r) => {
    const key = toConfigKey(r.name);
    if (key && r.label && !overrides[key]) overrides[key] = { text: r.label };
  });
  const labels = resolveLabels(DEFAULT_LABELS, overrides, locale.lang);
  const ctx = {
    prefix,
    labels,
    lang: locale.lang,
    core: block.classList.contains('core'),
    steps: 0,
    fields: 0,
    entries: new Map(),
    toggles: [],
    regions: [],
    submitted: false,
    sending: false,
    config: readConfig(rows),
  };

  const form = el('form', 'form-form');
  form.noValidate = true; // inline messages instead of the browser bubble

  const used = new Set();
  const uniqueName = (row) => {
    const base = row.name.replace(/\s+/g, '-') || slugify(row.label) || row.type;
    let name = base;
    let n = 2;
    while (used.has(name)) {
      name = `${base}-${n}`;
      n += 1;
    }
    used.add(name);
    return name;
  };

  let current = null;
  let section = null;
  const ensureStep = () => {
    if (!current) {
      current = createStep(null, ctx);
      form.append(current.step);
    }
    return current;
  };
  const container = () => (section || ensureStep().fields);

  /** Renders a field or note row into a container. */
  const renderRow = (row, into) => {
    if (row.type === 'label' || row.type === 'config') return;
    if (row.type === 'note') {
      const note = renderNote(row);
      if (note) into.append(note);
      return;
    }
    if (!row.label && !row.name && !row.optionLines.length) return;
    const named = { ...row, name: uniqueName(row) };
    const field = renderField(named, ctx);
    if (!field) return;
    if (row.type === 'hidden') {
      form.append(field);
      return;
    }
    into.append(field);
    if (row.type === 'checkbox' && row.rules.toggles) {
      ctx.toggles.push({ wrapper: field, targets: row.rules.toggles });
    }
    if (row.type === 'region') ctx.regions.push({ wrapper: field, row: named });
  };

  const moduleHosts = [];
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    if (row.type === 'label' || row.type === 'config') {
      // UI text override / config, read above
    } else if (SECTION_BREAKS.includes(row.type) && row.type !== 'fieldset') {
      section = null;
      if (row.type === 'feedback-modules') {
        const host = el('div', 'form-modules');
        host.setAttribute('aria-live', 'polite');
        form.append(host);
        moduleHosts.push([host, row.name.trim()]);
        current = null;
      } else if (row.type === 'step') {
        current = createStep(row, ctx);
        form.append(current.step);
      } else if (row.type === 'submit') {
        const actions = el('div', 'form-field form-actions');
        const button = el('button', 'button', row.label || labels['submit label']);
        button.type = 'submit';
        actions.append(button);
        if (ctx.core) {
          // live: the submit button sits below the last band, right-aligned
          form.append(actions);
          current = null;
        } else {
          ensureStep().fields.append(actions);
        }
      }
    } else if (row.type === 'fieldset' && (row.rules.repeat || 0) > 1) {
      const template = [];
      while (i + 1 < rows.length && !SECTION_BREAKS.includes(rows[i + 1].type)) {
        i += 1;
        template.push(rows[i]);
      }
      if (i + 1 < rows.length && rows[i + 1].type === 'end') i += 1;
      section = null;
      ensureStep().fields.append(renderRepeat(row, template, ctx, renderRow));
    } else if (row.type === 'fieldset') {
      const { fieldset, content } = createFieldset(row);
      ensureStep().fields.append(fieldset);
      section = content;
    } else {
      renderRow(row, container());
    }
  }

  if (ctx.core) form.append(honeypot());

  const status = el('p', 'form-status');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  form.append(status);
  if (ctx.core) ctx.botCheck = setupBotCheck(form, ctx);

  const wrappers = () => [...form.querySelectorAll('.form-field[data-name]')]
    .filter((w) => ctx.entries.has(w));

  form.addEventListener('submit', (event) => {
    // no native submit: Form never sends; Form (core) posts with fetch once it is valid
    event.preventDefault();
    event.stopPropagation();
    if (ctx.sending) return;
    ctx.submitted = true;
    const results = wrappers().map((w) => ({ w, ok: checkField(w, ctx) }));
    const firstInvalid = results.find((r) => !r.ok);
    if (firstInvalid) {
      status.textContent = '';
      form.classList.add('form-submitted');
      const entry = ctx.entries.get(firstInvalid.w);
      const focusTarget = (entry.controls.find((c) => c.getAttribute('aria-invalid')) || entry.controls[0]);
      if (ctx.core && firstInvalid.w.scrollIntoView) {
        firstInvalid.w.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (focusTarget) focusTarget.focus({ preventScroll: true });
      } else if (focusTarget) {
        focusTarget.focus();
      }
      return;
    }
    if (ctx.core) {
      const button = event.submitter || form.querySelector('.form-actions button[type="submit"]');
      sendForm(form, wrappers(), ctx, button, status);
      return;
    }
    status.textContent = labels['sent message'];
  });

  const recheck = (event) => {
    const wrapper = event.target.closest('.form-field[data-name]');
    if (!wrapper || !ctx.entries.has(wrapper)) return;
    // live core forms validate every field from the first submit on; else only invalid ones
    if ((ctx.core && ctx.submitted) || wrapper.classList.contains('form-field-invalid')) {
      checkField(wrapper, ctx);
    }
    if (!ctx.sending) status.textContent = '';
  };
  form.addEventListener('input', recheck);
  form.addEventListener('change', recheck);
  if (ctx.core) {
    // back from the success / error page (back-forward cache): the form can be sent again
    window.addEventListener('pageshow', (event) => {
      if (!event.persisted || !ctx.sending) return;
      ctx.sending = false;
      setBusy(ctx.busyButton, false);
      status.textContent = '';
      if (ctx.botCheck) ctx.botCheck.reset();
    });
  }

  block.replaceChildren(form);
  setupToggles(form, ctx);
  setupRegions(form, block, ctx);
  moduleHosts.forEach(([host, name]) => setupFeedbackModules(form, host, name, ctx));
}
