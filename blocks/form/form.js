import { toClassName } from '../../scripts/aem.js';
import { getLocale } from '../../scripts/locale.js';
import {
  cleanText, toConfigKey, resolveLabels, decorateExternalLinks,
} from '../../scripts/block-config.js';

/*
 * Render-only form. The block never sends anything: the <form> has no action, every submit
 * is prevented, and no request of any kind is made. A valid submit only shows a status message.
 */

/** UI strings; each can be overridden by a row of type "label" (Name = key, Label = text). */
const DEFAULT_LABELS = {
  en: {
    'sent message': 'This is a preview form. Nothing has been sent.',
    'submit label': 'Submit',
    'required marker': '*',
    'required text': '(required)',
    'file none label': 'No file selected',
    'checkbox group error': 'Please select at least one option.',
  },
  de: {
    'sent message': 'Dies ist ein Vorschauformular. Es wurden keine Daten gesendet.',
    'submit label': 'Absenden',
    'required marker': '*',
    'required text': '(Pflichtfeld)',
    'file none label': 'Keine Datei ausgewählt',
    'checkbox group error': 'Bitte wählen Sie mindestens eine Option aus.',
  },
};

const COLUMNS = ['label', 'type', 'name', 'required', 'options', 'help', 'placeholder'];

/** Header cell texts (EN and DE, normalized with toConfigKey) per column. */
const HEADER_WORDS = {
  label: ['label', 'bezeichnung', 'beschriftung', 'feld', 'field', 'titel', 'title'],
  type: ['type', 'typ', 'feldtyp', 'field-type', 'art'],
  name: ['name', 'feldname', 'field-name', 'key', 'schluessel', 'id'],
  required: ['required', 'pflicht', 'pflichtfeld', 'erforderlich', 'mandatory'],
  options: ['options', 'optionen', 'auswahl', 'werte', 'values', 'choices'],
  help: ['help-text', 'help', 'hilfetext', 'hilfe', 'beschreibung', 'description', 'hinweistext'],
  placeholder: ['placeholder', 'platzhalter'],
};

const TYPE_ALIASES = {
  step: 'step',
  schritt: 'step',
  section: 'step',
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
  radio: 'radio',
  'radio-cards': 'radio-cards',
  radiocards: 'radio-cards',
  cards: 'radio-cards',
  checkbox: 'checkbox',
  checkboxes: 'checkbox',
  file: 'file',
  upload: 'file',
  datei: 'file',
  note: 'note',
  hinweis: 'note',
  submit: 'submit',
  absenden: 'submit',
  button: 'submit',
  label: 'label',
  'feedback-modules': 'feedback-modules',
};

const REQUIRED_VALUES = ['yes', 'ja', 'true', 'x', 'required', 'pflicht', 'y', 'j'];

let instanceCount = 0;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

/** Slug for names/values, keeping German umlauts readable (ä -> a). */
function slug(text) {
  return toClassName((text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\u00df/g, 'ss'));
}

/** Maps a row's cells to columns when it is a recognizable header row, otherwise null. */
function readHeader(cells) {
  const map = {};
  let hits = 0;
  cells.forEach((cell, index) => {
    const key = toConfigKey(cleanText(cell).normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
    const column = COLUMNS.find((c) => HEADER_WORDS[c].includes(key));
    if (column && map[column] === undefined) {
      map[column] = index;
      hits += 1;
    }
  });
  return hits >= 2 ? map : null;
}

/** Reads the authored rows into plain objects; cells stay available for rich content. */
function readRows(block) {
  const rows = [...block.children].map((row) => [...row.children])
    .filter((cells) => cells.some((c) => cleanText(c) || c.querySelector('img, a')));
  const defaultMap = Object.fromEntries(COLUMNS.map((c, i) => [c, i]));
  const header = rows.length ? readHeader(rows[0]) : null;
  const map = header || defaultMap;
  const body = header ? rows.slice(1) : rows;
  return body.map((cells) => {
    const cell = (column) => (map[column] === undefined ? null : cells[map[column]] || null);
    const text = (column) => cleanText(cell(column));
    const rawType = toConfigKey(text('type'));
    return {
      label: text('label'),
      labelCell: cell('label'),
      type: TYPE_ALIASES[rawType] || 'text',
      name: text('name'),
      required: REQUIRED_VALUES.includes(text('required').toLowerCase()),
      optionsCell: cell('options'),
      options: text('options'),
      helpCell: cell('help'),
      placeholder: text('placeholder'),
    };
  });
}

/** Options: one per paragraph/list item, otherwise comma-separated; "value=Label" or "Label". */
function parseOptions(row) {
  const { optionsCell } = row;
  if (!optionsCell) return [];
  const parts = optionsCell.querySelectorAll('p, li').length > 1
    ? [...optionsCell.querySelectorAll('p, li')].map((n) => cleanText(n))
    : row.options.split(',');
  return parts.map((part) => part.trim()).filter(Boolean).map((part) => {
    const eq = part.indexOf('=');
    const label = eq > -1 ? part.slice(eq + 1).trim() : part;
    const value = eq > -1 ? part.slice(0, eq).trim() : slug(part);
    return { value: value || slug(label), label: label || value };
  });
}

/** Moves the rich content of a cell into a new element; returns null for empty cells. */
function richContent(cell, tag, className) {
  if (!cell || !(cleanText(cell) || cell.querySelector('img, a'))) return null;
  const hasBlocks = cell.querySelector('p, ul, ol, div, h1, h2, h3, h4, h5, h6');
  const node = el(hasBlocks ? 'div' : tag, className);
  node.append(...cell.childNodes);
  decorateExternalLinks(node);
  return node;
}

function srOnly(text) {
  return el('span', 'form-sr-only', text);
}

function labelContent(row, labels, group) {
  // labels with links (e.g. a consent checkbox) keep the authored inline content
  const cell = row.labelCell && row.labelCell.querySelector('a[href]') ? row.labelCell : null;
  const source = cell && cell.children.length === 1 && cell.firstElementChild.tagName === 'P'
    ? cell.firstElementChild : cell;
  const parts = source ? [...source.childNodes] : [document.createTextNode(row.label)];
  if (source) decorateExternalLinks(source);
  if (row.required) {
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

/** Builds one field wrapper. Returns null for rows that render nothing. */
function renderField(row, ctx) {
  const { labels } = ctx;
  ctx.fields += 1;
  const id = `${ctx.prefix}-${slug(row.name) || 'field'}-${ctx.fields}`;
  const wrapper = el('div', `form-field form-field-${row.type}`);
  wrapper.dataset.name = row.name;
  const help = richContent(row.helpCell, 'p', 'form-help');
  const error = el('p', 'form-error');
  error.id = `${id}-error`;
  error.hidden = true;
  if (help) help.id = `${id}-help`;
  const helpIds = help ? [help.id] : [];

  if (['radio', 'radio-cards', 'checkbox'].includes(row.type)
    && (row.type !== 'checkbox' || parseOptions(row).length)) {
    const options = parseOptions(row);
    const fieldset = el('fieldset', `form-group form-group-${row.type}`);
    fieldset.id = id;
    const legend = el('legend', 'form-label');
    legend.append(...labelContent(row, labels, true));
    fieldset.append(legend);
    if (help) fieldset.append(help);
    const list = el('div', row.type === 'radio-cards' ? 'form-cards' : 'form-options');
    const inputType = row.type === 'checkbox' ? 'checkbox' : 'radio';
    if (inputType === 'radio') fieldset.setAttribute('role', 'radiogroup');
    if (inputType === 'radio' && row.required) fieldset.setAttribute('aria-required', 'true');
    options.forEach((option, index) => {
      const input = el('input');
      input.type = inputType;
      input.name = row.name;
      input.value = option.value;
      input.id = `${id}-${index}`;
      if (inputType === 'radio' && row.required) input.required = true;
      const label = el('label', row.type === 'radio-cards' ? 'form-card' : 'form-option');
      label.htmlFor = input.id;
      label.append(input, el('span', 'form-option-label', option.label));
      list.append(label);
    });
    if (inputType === 'checkbox' && row.required) fieldset.dataset.required = 'true';
    describe(fieldset, ...helpIds);
    fieldset.append(list, error);
    wrapper.append(fieldset);
    return wrapper;
  }

  let control;
  if (row.type === 'textarea') {
    control = el('textarea', 'form-control');
    control.rows = 5;
  } else if (row.type === 'select') {
    control = el('select', 'form-control');
    if (row.placeholder) {
      const empty = el('option', '', row.placeholder);
      empty.value = '';
      empty.disabled = true;
      empty.selected = true;
      control.append(empty);
    }
    parseOptions(row).forEach((option) => {
      const node = el('option', '', option.label);
      node.value = option.value;
      control.append(node);
    });
  } else {
    control = el('input', 'form-control');
    control.type = row.type === 'checkbox' ? 'checkbox' : row.type;
    if (row.type === 'checkbox') control.value = 'yes';
  }
  control.id = id;
  control.name = row.name;
  if (row.required) control.required = true;
  if (row.placeholder && !['select', 'checkbox', 'file', 'date'].includes(row.type)) {
    control.placeholder = row.placeholder;
  } else if (['text', 'email', 'tel', 'number'].includes(row.type)) {
    // blank placeholder: lets the CSS show the label inside the empty field (maui-input)
    control.placeholder = ' ';
  }
  if (row.type === 'email') control.autocomplete = 'email';
  if (row.type === 'tel') control.autocomplete = 'tel';
  describe(control, ...helpIds);

  const label = el('label', 'form-label');
  label.htmlFor = id;
  label.append(...labelContent(row, labels, false));
  // maui-select shows its label as the trigger text: an identical placeholder replaces it
  if (row.type === 'select' && row.placeholder && row.placeholder === row.label) {
    label.classList.add('form-sr-only');
  }

  if (row.type === 'checkbox') {
    const line = el('div', 'form-option');
    line.append(control, label);
    wrapper.append(line);
  } else {
    wrapper.append(label, control);
  }

  if (row.type === 'file') {
    // file names are shown locally only; nothing is uploaded
    const tokens = row.options.split(',').map((t) => t.trim()).filter(Boolean);
    if (tokens.some((t) => t.toLowerCase() === 'multiple')) control.multiple = true;
    const accept = tokens.filter((t) => t.toLowerCase() !== 'multiple');
    if (accept.length) control.accept = accept.join(',');
    const names = el('output', 'form-file-names', labels['file none label']);
    names.id = `${id}-files`;
    names.htmlFor = id;
    describe(control, names.id);
    control.addEventListener('change', () => {
      const files = [...(control.files || [])].map((f) => f.name);
      names.textContent = files.length ? files.join(', ') : labels['file none label'];
    });
    wrapper.append(names);
  }
  if (help) wrapper.append(help);
  wrapper.append(error);
  return wrapper;
}

/** Note row: Label content (rich) as a static paragraph. */
function renderNote(row) {
  const note = richContent(row.labelCell, 'p', 'form-note');
  if (!note) return null;
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
      const title = el('p', 'form-step-title', row.label);
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
  const optionsCell = field.options.length ? el('div') : null;
  field.options.forEach(([value, label]) => optionsCell.append(el('p', '', `${value}=${label}`)));
  return {
    label: field.label,
    labelCell: null,
    type: field.type,
    name: `${prefix}-${field.name}`,
    required: field.required,
    optionsCell,
    options: field.type === 'file' ? [field.accept, field.multiple ? 'multiple' : ''].filter(Boolean).join(',')
      : field.options.map(([value, label]) => `${value}=${label}`).join(','),
    helpCell: textCell(field.help),
    placeholder: field.type === 'select' ? field.label : '',
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

/** Applies the custom rule for required checkbox groups (HTML has no group-required). */
function updateGroupValidity(fieldset, labels) {
  const boxes = [...fieldset.querySelectorAll('input[type="checkbox"]')];
  if (!boxes.length) return;
  const ok = boxes.some((b) => b.checked);
  boxes[0].setCustomValidity(ok ? '' : labels['checkbox group error']);
}

/** Shows or clears the inline message of one field wrapper; returns whether it is valid. */
function checkField(wrapper) {
  const controls = [...wrapper.querySelectorAll('input, select, textarea')];
  const invalid = controls.find((c) => !c.checkValidity());
  const error = wrapper.querySelector('.form-error');
  const target = wrapper.querySelector('fieldset') || controls[0];
  controls.forEach((c) => c.removeAttribute('aria-invalid'));
  if (!invalid) {
    if (error) {
      error.hidden = true;
      error.textContent = '';
    }
    wrapper.classList.remove('form-field-invalid');
    return true;
  }
  if (error) {
    error.textContent = invalid.validationMessage;
    error.hidden = false;
    if (target) describe(target, error.id);
    controls.forEach((c) => {
      if (target === c || wrapper.querySelector('fieldset')) describe(c, error.id);
    });
  }
  controls.forEach((c) => c.setAttribute('aria-invalid', 'true'));
  wrapper.classList.add('form-field-invalid');
  return false;
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
    prefix, labels, steps: 0, fields: 0,
  };

  const form = el('form', 'form-form');
  form.noValidate = true; // inline messages instead of the browser bubble

  const used = new Set();
  const uniqueName = (row) => {
    const base = row.name.replace(/\s+/g, '-') || slug(row.label) || row.type;
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
  const ensureStep = () => {
    if (!current) {
      current = createStep(null, ctx);
      form.append(current.step);
    }
    return current;
  };

  const moduleHosts = [];
  rows.forEach((row) => {
    if (row.type === 'label') return;
    if (row.type === 'feedback-modules') {
      const host = el('div', 'form-modules');
      host.setAttribute('aria-live', 'polite');
      form.append(host);
      moduleHosts.push([host, row.name.trim()]);
      current = null;
      return;
    }
    if (row.type === 'step') {
      current = createStep(row, ctx);
      form.append(current.step);
      return;
    }
    if (row.type === 'note') {
      const note = renderNote(row);
      if (note) ensureStep().fields.append(note);
      return;
    }
    if (row.type === 'submit') {
      const actions = el('div', 'form-field form-actions');
      const button = el('button', 'button', row.label || labels['submit label']);
      button.type = 'submit';
      actions.append(button);
      ensureStep().fields.append(actions);
      return;
    }
    if (!row.label && !row.name) return;
    const field = renderField({ ...row, name: uniqueName(row) }, ctx);
    if (field) ensureStep().fields.append(field);
  });

  const status = el('p', 'form-status');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  form.append(status);

  const groups = () => [...form.querySelectorAll('fieldset[data-required="true"]')];
  const wrappers = () => [...form.querySelectorAll('.form-field[data-name]')];

  form.addEventListener('submit', (event) => {
    // render-only: never send, never navigate
    event.preventDefault();
    event.stopPropagation();
    groups().forEach((g) => updateGroupValidity(g, labels));
    const results = wrappers().map((w) => ({ w, ok: checkField(w) }));
    const firstInvalid = results.find((r) => !r.ok);
    if (firstInvalid) {
      status.textContent = '';
      form.classList.add('form-submitted');
      const focusTarget = firstInvalid.w.querySelector(':invalid')
        || firstInvalid.w.querySelector('input, select, textarea');
      if (focusTarget) focusTarget.focus();
      return;
    }
    status.textContent = labels['sent message'];
  });

  const recheck = (event) => {
    const wrapper = event.target.closest('.form-field[data-name]');
    if (!wrapper) return;
    const group = wrapper.querySelector('fieldset[data-required="true"]');
    if (group) updateGroupValidity(group, labels);
    if (wrapper.classList.contains('form-field-invalid')) checkField(wrapper);
    status.textContent = '';
  };
  form.addEventListener('input', recheck);
  form.addEventListener('change', recheck);

  groups().forEach((g) => updateGroupValidity(g, labels));
  block.replaceChildren(form);
  moduleHosts.forEach(([host, name]) => setupFeedbackModules(form, host, name, ctx));
}
