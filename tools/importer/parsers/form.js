/* eslint-disable */
/* global WebImporter */

/**
 * Parser for form (Lufthansa AEM ".feedbackforms": dcep-feedback-form React app, captured in its
 * initial state).
 *
 * Output (blocks/form README): 7 columns, header row first:
 *   Label | Type | Name | Required | Options | Help text | Placeholder
 * then one row per field in document order:
 *   - every non-empty ".form-section" starts a "step" row (Label = .form-section-headline,
 *     Help text = .form-section-description)
 *   - maui-select / select            -> "select" (Placeholder = buttontriggerlabel, options
 *                                         = maui-option[optionvalue]=text, one per paragraph)
 *   - maui-input / input              -> text | email | tel | number | date | file | checkbox
 *   - maui-textarea / textarea        -> "textarea"
 *   - maui-radio-group / radio inputs -> "radio"
 *   - maui-checkbox                   -> "checkbox"
 *   - a submit button                 -> "submit" (Label = button text)
 * Labels are read from the DOM (label element, label / buttontriggerlabel / placeholder
 * attributes); a field without a visible label uses its trigger label. Name stays empty unless
 * the source sets a meaningful name (the block derives one from the label). Topic-specific
 * follow-up fields are rendered by the app only after a choice and are not in the capture: for
 * the dcep-feedback-form the first select gets the Name "topic" and a last row
 * "feedback-modules | topic" lets the block render the topic's sections from the
 * feedbackForm catalog and labels (blocks/form/feedback-modules.js).
 */
export default function parse(element, { document }) {
  const SKIP = '.sr-only, .visually-hidden, maui-screen-reader-label, [slot="box"], script, style';
  const clean = (s) => (s || '').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
  const visibleText = (node) => {
    if (!node) return '';
    const c = node.cloneNode(true);
    c.querySelectorAll(SKIP).forEach((n) => n.remove());
    return clean(c.textContent);
  };
  const attr = (el, ...names) => {
    for (const n of names) {
      const v = clean(el.getAttribute(n));
      if (v) return v;
    }
    return '';
  };
  const GENERIC_NAMES = /^(select|input|textarea|checkbox|radio|field|maui-[a-z-]+)(-?\d+)?$/i;
  const nameOf = (el) => {
    const n = attr(el, 'name') || attr(el, 'id');
    return n && !GENERIC_NAMES.test(n) ? n : '';
  };
  const isRequired = (el) => el.hasAttribute('required') || el.getAttribute('aria-required') === 'true';
  const labelFor = (el) => {
    const id = el.getAttribute('id');
    if (id) {
      try {
        const l = element.querySelector(`label[for="${CSS.escape(id)}"]`);
        if (l && visibleText(l)) return visibleText(l);
      } catch (e) { /* invalid id */ }
    }
    const wrap = el.closest('label');
    if (wrap && visibleText(wrap)) return visibleText(wrap);
    return attr(el, 'label', 'aria-label', 'buttontriggerlabel', 'placeholder');
  };
  const optionsCell = (opts) => {
    if (!opts.length) return '';
    if (opts.length === 1) return opts[0];
    return opts.map((o) => { const p = document.createElement('p'); p.textContent = o; return p; });
  };

  const HEADER = ['Label', 'Type', 'Name', 'Required', 'Options', 'Help text', 'Placeholder'];
  const cells = [HEADER];
  const row = (r) => cells.push([r.label || '', r.type, r.name || '', r.required ? 'yes' : '', r.options || '', r.help || '', r.placeholder || '']);

  const FIELD = 'maui-select, select, maui-input, maui-textarea, textarea, input:not([type="hidden"]):not([type="submit"]):not([type="button"]), maui-checkbox, maui-radio-group, maui-radio-button-group, button[type="submit"], maui-button[type="submit"]';
  const fieldRows = (scope) => {
    const out = [];
    const radioGroups = new Set();
    [...scope.querySelectorAll(FIELD)].forEach((f) => {
      // nested controls of a custom element are handled by the element itself
      if (f.parentElement && f.parentElement.closest('maui-select, maui-input, maui-textarea, maui-checkbox, maui-radio-group, maui-radio-button-group')) return;
      const tag = f.tagName.toLowerCase();
      if (tag === 'maui-select' || tag === 'select') {
        const opts = [...f.querySelectorAll('maui-option, option')].map((o) => {
          const text = visibleText(o);
          const value = attr(o, 'optionvalue', 'value');
          if (!text && !value) return '';
          return value && value !== text ? `${value}=${text}` : text;
        }).filter(Boolean);
        const trigger = attr(f, 'buttontriggerlabel', 'placeholder');
        out.push({ label: labelFor(f) || trigger, type: 'select', name: nameOf(f), required: isRequired(f), options: optionsCell(opts), placeholder: trigger, help: attr(f, 'hint') });
      } else if (tag === 'maui-textarea' || tag === 'textarea') {
        out.push({ label: labelFor(f), type: 'textarea', name: nameOf(f), required: isRequired(f), placeholder: attr(f, 'placeholder'), help: attr(f, 'hint') });
      } else if (tag === 'maui-checkbox') {
        out.push({ label: visibleText(f) || labelFor(f), type: 'checkbox', name: nameOf(f), required: isRequired(f) });
      } else if (tag === 'maui-radio-group' || tag === 'maui-radio-button-group') {
        const opts = [...f.querySelectorAll('maui-radio-button, maui-radio, input[type="radio"]')].map((o) => {
          const text = visibleText(o) || attr(o, 'label');
          const value = attr(o, 'value');
          return value && value !== text ? `${value}=${text}` : text;
        }).filter(Boolean);
        out.push({ label: attr(f, 'label', 'legend') || labelFor(f), type: 'radio', name: nameOf(f), required: isRequired(f), options: optionsCell(opts) });
      } else if (tag === 'button' || tag === 'maui-button') {
        out.push({ label: visibleText(f), type: 'submit' });
      } else {
        const type = (attr(f, 'type') || 'text').toLowerCase();
        if (type === 'radio') {
          const group = attr(f, 'name');
          if (radioGroups.has(group)) return;
          radioGroups.add(group);
          const radios = group ? [...scope.querySelectorAll(`input[type="radio"][name="${group}"]`)] : [f];
          const opts = radios.map((r) => { const t = labelFor(r); const v = attr(r, 'value'); return v && v !== t ? `${v}=${t}` : t; }).filter(Boolean);
          const fieldset = f.closest('fieldset');
          out.push({ label: visibleText(fieldset && fieldset.querySelector('legend')), type: 'radio', name: group, required: isRequired(f), options: optionsCell(opts) });
          return;
        }
        const known = ['text', 'email', 'tel', 'number', 'date', 'file', 'checkbox'];
        out.push({ label: labelFor(f), type: known.includes(type) ? type : 'text', name: nameOf(f), required: isRequired(f), placeholder: attr(f, 'placeholder'), help: attr(f, 'hint') });
      }
    });
    return out;
  };

  // dcep-feedback-form: the topic select drives the sections the app adds after a choice
  // (catalogs/feedbackForm modules); the block renders them at runtime from a
  // "feedback-modules" row naming the select
  const feedbackApp = element.matches('.dcep-feedback-form') || element.querySelector('.dcep-feedback-form');
  let topicSelect = null;
  const sections = [...element.querySelectorAll('.form-section')]
    .filter((s) => !s.parentElement.closest('.form-section'));
  if (sections.length) {
    sections.forEach((section) => {
      const headline = visibleText(section.querySelector('.form-section-headline'));
      const help = visibleText(section.querySelector('.form-section-description'));
      const fields = fieldRows(section);
      if (!headline && !help && !fields.length) return; // placeholder step filled later by the app
      if (headline || help) row({ label: headline, type: 'step', help });
      fields.forEach((f) => {
        if (feedbackApp && f.type === 'select' && !topicSelect) {
          topicSelect = f;
          if (!f.name) f.name = 'topic';
        }
        row(f);
      });
    });
  } else {
    fieldRows(element).forEach(row);
  }
  if (topicSelect) row({ type: 'feedback-modules', name: topicSelect.name });

  const block = WebImporter.Blocks.createBlock(document, { name: 'form', cells });
  element.replaceWith(block);
}
