/* eslint-disable */
/* global WebImporter */

/**
 * Parser for form-core: the lufthansa.com AEM core forms (`form.cmp-form`, POST to
 * www.lufthansa.com/content/lh/markets/...): anmeldung-tiere-frachtraum, refund-form,
 * feedback-past-flight, register-ammunition, register-animal-cabin, special-needs /
 * betreuungsbedarf, add-sports-baggage / sportgepaeck-hinzufuegen, group-travel,
 * passenger-receipt-90.
 *
 * Output (blocks/form README "Import"): one block `Form (core)` replacing the whole form, header
 * row `Label | Type | Name | Required | Options | Help text | Placeholder | Validation message |
 * Constraint message | Rules`, then one row per band, sub-section, field, text and the submit
 * button in document order. The form's action, its hidden inputs (:formstart, :redirect,
 * _charset_, UUID, date-format, *-code, *-fileIds) and any lufthansa.com POST URL are never
 * written: the block is render-only.
 *
 * Reads the raw snapshot attributes (label, hint, optional, data-cmp-*, data-customerror,
 * data-target, data-forms-filedrop). Spans are already unwrapped by the importer, so the repeat
 * counter (span.forms-repeat-counter) is found by its number when the span is gone.
 */
const HEADER = ['Label', 'Type', 'Name', 'Required', 'Options', 'Help text', 'Placeholder',
  'Validation message', 'Constraint message', 'Rules'];
const COLUMNS = ['label', 'type', 'name', 'required', 'options', 'help', 'placeholder',
  'message', 'constraint', 'rules'];

export default function parse(element, { document }) {
  const form = element.matches('form') ? element : element.querySelector('form.cmp-form');
  if (!form) return;

  const clean = (s) => String(s || '').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const text = (el) => (el ? clean(el.textContent) : '');
  const attr = (el, name) => (el ? clean(el.getAttribute(name)) : '');
  const has = (el, name) => !!el && el.hasAttribute(name) && el.getAttribute(name) !== 'false';

  const rows = [];
  const done = new Set();
  /** Text cell: a text node, or lines separated by <br> (never parsed as HTML). */
  const cell = (value) => {
    if (value == null || value === '') return '';
    if (typeof value !== 'string' && !Array.isArray(value)) return value;
    const lines = (Array.isArray(value) ? value : [value]).map((l) => String(l)).filter((l) => l !== '');
    if (!lines.length) return '';
    const nodes = [];
    lines.forEach((l, i) => {
      if (i) nodes.push(document.createElement('br'));
      nodes.push(document.createTextNode(l));
    });
    return nodes;
  };
  const add = (row) => rows.push(COLUMNS.map((c) => cell(row[c])));

  // wrapper of a field: the AEM component div with the data-cmp-* messages
  const wrapperOf = (field) => field.closest('.cmp-form-text, [data-cmp-type]');
  const requiredOf = (field, wrapper) => {
    if (has(field, 'required') || (wrapper && has(wrapper, 'data-cmp-required'))) return 'yes';
    return attr(field, 'optional');
  };
  const messageOf = (field, wrapper, fieldFirst) => {
    const own = attr(field, 'data-customerror');
    const wrap = attr(wrapper, 'data-cmp-required-message');
    return fieldFirst ? (own || wrap) : (wrap || own);
  };

  // repeatable sections: names of the first copy lose their "_1"
  let repeatSuffix = null;
  const nameOf = (field) => {
    const n = attr(field, 'name');
    return repeatSuffix && n.endsWith(repeatSuffix) ? n.slice(0, -repeatSuffix.length) : n;
  };

  function textField(field, type) {
    const wrapper = wrapperOf(field);
    const rules = [];
    const pattern = attr(field, 'pattern') || attr(wrapper, 'data-cmp-pattern');
    if (pattern) rules.push(`pattern=${pattern}`);
    const maxlength = attr(field, 'maxlength');
    if (maxlength) rules.push(`maxlength=${maxlength}`);
    const inputmode = attr(field, 'inputmode');
    if (inputmode && inputmode !== 'text') rules.push(`inputmode=${inputmode}`);
    if (attr(field, 'type') === 'pnr') rules.push('uppercase');
    return {
      label: attr(field, 'label'),
      type,
      name: nameOf(field),
      required: requiredOf(field, wrapper),
      help: attr(field, 'hint'),
      message: messageOf(field, wrapper, false),
      constraint: attr(wrapper, 'data-cmp-constraint-message'),
      rules,
    };
  }

  function input(field) {
    const t = attr(field, 'type');
    add(textField(field, t === 'email' ? 'email' : t === 'tel' ? 'tel' : 'text'));
  }

  function date(masked) {
    const field = masked.querySelector('maui-input');
    if (!field) return;
    const row = textField(field, 'date');
    const mask = attr(masked, 'mask');
    row.rules = mask ? [`mask=${mask}`] : [];
    add(row);
  }

  function street(box) {
    const field = box.querySelector('input:not([type="hidden"])');
    if (!field) return;
    const wrapper = wrapperOf(box);
    add({
      label: text(box.querySelector('label')) || attr(field, 'placeholder'),
      type: 'text',
      name: nameOf(field),
      required: requiredOf(field, wrapper),
      message: messageOf(field, wrapper, false),
      constraint: attr(wrapper, 'data-cmp-constraint-message'),
    });
  }

  function textarea(field) {
    const wrapper = wrapperOf(field);
    const rowCount = attr(field, 'rows');
    add({
      label: attr(field, 'label'),
      type: 'textarea',
      name: nameOf(field),
      required: requiredOf(field, wrapper),
      help: attr(field, 'hint'),
      message: attr(wrapper, 'data-cmp-required-message') || attr(field, 'errormessage') || attr(field, 'customerrormessage'),
      constraint: attr(wrapper, 'data-cmp-constraint-message'),
      rules: rowCount ? [`rows=${rowCount}`] : [],
    });
  }

  function select(field) {
    const wrapper = wrapperOf(field);
    const options = [...field.querySelectorAll('maui-option')]
      .filter((o) => !o.hasAttribute('disabled'))
      .map((o) => `${clean(o.getAttribute('optionvalue') || '')}=${text(o)}${o.hasAttribute('selected') ? ' {selected}' : ''}`);
    add({
      label: attr(field, 'buttontriggerlabel') || attr(field, 'label'),
      type: 'select',
      name: nameOf(field),
      required: requiredOf(field, wrapper),
      options,
      help: attr(field, 'hint'),
      message: messageOf(field, wrapper, true),
    });
  }

  function region(box) {
    const field = box.querySelector('maui-select');
    if (!field) return;
    const country = box.closest('.countrydropdown');
    const countrySelect = country && country.querySelector('maui-select.forms-country-dropdown-select');
    add({
      label: attr(field, 'buttontriggerlabel'),
      type: 'region',
      name: nameOf(field),
      required: has(box, 'data-cmp-required') || has(field, 'required') ? 'yes' : '',
      placeholder: attr(field, 'data-empty-option'),
      message: attr(field, 'data-customerror') || attr(box, 'data-cmp-required-message'),
      rules: countrySelect ? [`country=${nameOf(countrySelect)}`] : [],
    });
  }

  function radio(group) {
    const wrapper = wrapperOf(group);
    const radios = [...group.querySelectorAll('maui-radio')];
    const required = has(group, 'required') || radios.some((r) => has(r, 'required'))
      || (wrapper && has(wrapper, 'data-cmp-required'));
    add({
      label: attr(group, 'label'),
      type: 'radio',
      name: nameOf(group) || nameOf(radios[0] || group),
      required: required ? 'yes' : attr(group, 'optional'),
      options: radios.map((r) => `${clean(r.getAttribute('value') || '')}=${text(r) || attr(r, 'label')}`),
      help: attr(group, 'hint'),
      message: messageOf(group, wrapper, true) || attr(radios[0], 'data-customerror'),
    });
  }

  function checkbox(box) {
    const boxes = [...box.querySelectorAll('maui-checkbox')];
    if (!boxes.length) return;
    const wrapper = box.matches('[data-cmp-type]') ? box : wrapperOf(box);
    const targets = [...new Set(boxes.map((b) => attr(b, 'data-target')).filter(Boolean))];
    const required = boxes.some((b) => has(b, 'required')) || (wrapper && has(wrapper, 'data-cmp-required'));
    const heading = box.querySelector('.form-group-headline');
    add({
      label: text(heading),
      type: 'checkbox',
      name: nameOf(boxes[0]),
      required: required ? 'yes' : '',
      options: boxes.map((b) => `${clean(b.getAttribute('value') || '')}=${attr(b, 'label') || text(b) || attr(b, 'data-aria-label')}`),
      message: attr(boxes[0], 'data-customerror') || attr(wrapper, 'data-cmp-required-message'),
      rules: targets.length ? [`toggles=${targets.join(', ')}`] : [],
    });
  }

  function stepper(field) {
    const wrapper = wrapperOf(field);
    const rules = [];
    ['min', 'max'].forEach((k) => { if (attr(field, k)) rules.push(`${k}=${attr(field, k)}`); });
    if (attr(field, 'selected')) rules.push(`value=${attr(field, 'selected')}`);
    add({
      label: attr(field, 'label'),
      type: 'stepper',
      name: nameOf(field),
      required: requiredOf(field, wrapper),
      help: attr(field, 'hint'),
      message: attr(wrapper, 'data-cmp-required-message') || attr(field, 'errormessage'),
      rules,
    });
  }

  function autocomplete(field) {
    const wrapper = wrapperOf(field);
    add({
      label: attr(field, 'buttontriggerlabel') || attr(field, 'label'),
      type: 'autocomplete',
      name: nameOf(field),
      required: requiredOf(field, wrapper),
      help: attr(field, 'hint'),
      message: attr(field, 'data-customerror') || attr(wrapper, 'data-cmp-required-message') || attr(field, 'errormessage'),
    });
  }

  function file(zone) {
    let config = {};
    try { config = JSON.parse(zone.getAttribute('data-forms-filedrop') || '{}') || {}; } catch (e) { config = {}; }
    const hidden = zone.querySelector('input[name$="-fileIds"]');
    const optional = config.optional === true || config.optional === 'true';
    const rules = [];
    if (config.acceptedFiles) rules.push(`accept=${clean(config.acceptedFiles)}`);
    if (config.maxFiles) rules.push(`max-files=${clean(config.maxFiles)}`);
    if (config.maxFileSize) rules.push(`max-size=${clean(config.maxFileSize)}`);
    if (config.notAllowedCharacters) rules.push(`not-allowed=${clean(config.notAllowedCharacters)}`);
    add({
      label: text(zone.querySelector('.filedrop-desc > div:first-child')),
      type: 'file',
      name: hidden ? attr(hidden, 'name').replace(/-fileIds$/, '') : '',
      required: optional ? (text(zone.querySelector('.hint')) || 'optional') : 'yes',
      help: text(zone.querySelector('p.footnote, #forms-filedrop-hint')),
      placeholder: text(zone.querySelector('maui-button')),
      message: clean(config.requiredError),
      rules,
    });
  }

  /** Rich text component: its HTML as the Label cell of a note row. */
  function note(rt) {
    const div = document.createElement('div');
    const clone = rt.cloneNode(true);
    clone.querySelectorAll('.sr-only, .visually-hidden, script, style').forEach((n) => n.remove());
    // a single-cell layout table keeps only its content (the cleanup does this before parsers)
    clone.querySelectorAll('table').forEach((t) => {
      const cells = t.querySelectorAll('td, th');
      if (cells.length === 1) t.replaceWith(...cells[0].childNodes);
    });
    div.append(...clone.childNodes);
    if (!clean(div.textContent) && !div.querySelector('img, a[href]')) return;
    const content = [...div.childNodes].filter((n) => n.nodeType === 1 || clean(n.textContent));
    rows.push(COLUMNS.map((c) => (c === 'label' ? content : c === 'type' ? cell('note') : '')));
  }

  function fieldset(sub) {
    const fs = sub.querySelector(':scope > fieldset') || sub.querySelector('fieldset');
    const name = (sub.id || '').replace(/^subsection-/, '');
    if (!fs) return;
    const hidden = sub.classList.contains('collapse') || sub.classList.contains('d-none');
    add({ label: text(fs.querySelector('legend')), type: 'fieldset', name, rules: hidden ? ['hidden'] : [] });
    [...fs.children].forEach((c) => { if (c.tagName !== 'LEGEND') visit(c); });
    add({ type: 'end' });
  }

  function repeatable(sub) {
    const sets = [...sub.querySelectorAll(':scope > fieldset')];
    if (!sets.length) return;
    const n = sets.length;
    const legend = text(sets[0].querySelector('legend'));
    const add_ = text(sub.querySelector('.forms-repeat-add'));
    const removeBtn = sub.querySelector('button.forms-repeat-hide[aria-label], .forms-repeat-hide[aria-label]');
    const remainingEl = sub.querySelector('p.forms-repeat-remaining, .forms-repeat-remaining');
    let remaining = '';
    if (remainingEl) {
      const counter = remainingEl.querySelector('.forms-repeat-counter');
      if (counter) {
        const c = remainingEl.cloneNode(true);
        c.querySelector('.forms-repeat-counter').replaceWith(document.createTextNode('{n}'));
        remaining = text(c);
      } else {
        // span unwrapped by the importer: the counter is the number of copies still hidden
        const t = text(remainingEl);
        const re = new RegExp(`(^|[^0-9])${n - 1}(?![0-9])`);
        remaining = re.test(t) ? t.replace(re, '$1{n}') : t;
      }
    }
    const rules = [`repeat=${n}`];
    if (add_) rules.push(`add=${add_}`);
    if (removeBtn) rules.push(`remove=${attr(removeBtn, 'aria-label')}`);
    if (remaining) rules.push(`remaining=${remaining}`);
    add({
      label: legend.replace(/(\d+)(?!.*\d)/, '{n}'),
      type: 'fieldset',
      name: (sub.id || '').replace(/^subsection-/, ''),
      rules,
    });
    repeatSuffix = '_1';
    [...sets[0].children].forEach((c) => {
      if (c.tagName === 'LEGEND' || c.matches('.forms-repeat-hide, button')) return;
      visit(c);
    });
    repeatSuffix = null;
    add({ type: 'end' });
  }

  function visit(el) {
    if (!el || el.nodeType !== 1) return;
    if (el.matches('input, template, script, style, .forms-repeat-add, .forms-repeat-remaining, .forms-repeat-hide')) return;
    if (el.matches('.form-section') && el.querySelector(':scope .form-section-headline')) {
      const description = el.querySelector('.form-section-description');
      const help = description ? document.createElement('div') : null;
      if (help) help.append(...description.cloneNode(true).childNodes);
      rows.push(COLUMNS.map((c) => {
        if (c === 'label') return cell(text(el.querySelector('.form-section-headline')));
        if (c === 'type') return cell('step');
        if (c === 'help') return help && clean(help.textContent) ? [...help.childNodes] : '';
        return '';
      }));
      const content = el.querySelector('.form-section-content') || el;
      [...content.children].forEach(visit);
      return;
    }
    if (el.matches('div.forms-repeatable-section[id^="subsection-"]')) { repeatable(el); return; }
    if (el.matches('div[id^="subsection-"]')) { fieldset(el); return; }
    if (el.matches('.richtext')) { note(el); return; }
    if (el.matches('[data-cmp-type="checkbox"]')) { checkbox(el); return; }
    if (el.matches('.forms-region-dropdown-wrapper')) { region(el); return; }
    if (el.matches('maui-radio-group')) { radio(el); return; }
    if (el.matches('maui-select')) { select(el); return; }
    if (el.matches('maui-masked-input')) { date(el); return; }
    if (el.matches('maui-textarea')) { textarea(el); return; }
    if (el.matches('maui-stepper')) { stepper(el); return; }
    if (el.matches('maui-autocomplete')) { autocomplete(el); return; }
    if (el.matches('.streetAddress')) { street(el); return; }
    if (el.matches('maui-input')) { input(el); return; }
    if (el.matches('section.forms-filedrop')) { file(el); return; }
    if (el.matches('maui-checkbox') && !done.has(el.parentElement)) {
      done.add(el.parentElement);
      checkbox(el.parentElement);
      return;
    }
    if (el.matches('#submit-btn, maui-button[behavior="submit"], button[type="submit"]')) {
      add({ label: text(el) || attr(el, 'label'), type: 'submit' });
      return;
    }
    [...el.children].forEach(visit);
  }

  [...form.children].forEach(visit);

  const cells = [HEADER, ...rows];
  const block = WebImporter.Blocks.createBlock(document, { name: 'Form', variants: ['core'], cells });
  form.replaceWith(block);
}
