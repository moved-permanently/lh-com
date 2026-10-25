/* eslint-disable no-console, import/extensions, max-classes-per-file, no-underscore-dangle, max-len, no-use-before-define, no-restricted-syntax, class-methods-use-this, no-shadow */
/* global globalThis */
/**
 * Offline test of the form block (blocks/form): no browser, no jsdom, no network.
 *
 * A  pure functions of blocks/form/form-rules.js: header row, types, Required cell, option
 *    lines, rules, the live validation rules and messages, date mask, repeat names, file checks
 * B  decorate() of a "Form (core)" table modelled on the lufthansa.com core forms, in a small
 *    DOM shim (below): every field type renders, checkboxes show / hide sub-sections, a
 *    repeatable section adds and removes copies, the region select follows the country
 *    (recorded catalogs/countries), submit shows live's messages; a valid submit posts the
 *    entries to the lh-forms worker (mocked here) and goes to the success / error page.
 * C  the plain Form (feedback) stays render-only.
 *
 * Usage: node tools/importer/test-form.mjs
 * Exit code 1 on any failed check.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

let failures = 0;
let passes = 0;
function check(name, ok, detail = '') {
  if (ok) {
    passes += 1;
  } else {
    failures += 1;
    console.log(`FAIL ${name}${detail ? ` -- ${detail}` : ''}`);
  }
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function eq(name, actual, expected) {
  check(name, same(actual, expected), `got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
}

/* ------------------------------------------------------------------------------------------ */
/* A  pure functions                                                                          */
/* ------------------------------------------------------------------------------------------ */

const rules = await import('../../blocks/form/form-rules.js');

eq('header row (EN)', rules.readHeaderTexts(['Label', 'Type', 'Name', 'Required', 'Options', 'Help text',
  'Placeholder', 'Validation message', 'Constraint message', 'Rules']), {
  label: 0, type: 1, name: 2, required: 3, options: 4, help: 5, placeholder: 6, message: 7, constraint: 8, rules: 9,
});
eq('header row (DE, reordered)', rules.readHeaderTexts(['Typ', 'Bezeichnung', 'Pflichtfeld', 'Fehlermeldung', 'Regeln']), {
  type: 0, label: 1, required: 2, message: 3, rules: 4,
});
eq('no header row', rules.readHeaderTexts(['General information', 'step']), null);
eq('types', ['Fieldset', 'subsection', 'End', 'Region', 'Stepper', 'autocomplete', 'Hidden', 'Datei', 'whatever']
  .map(rules.normalizeType), ['fieldset', 'fieldset', 'end', 'region', 'stepper', 'autocomplete', 'hidden', 'file', 'text']);
eq('required yes', rules.parseRequired('Yes'), { required: true, optionalMark: '' });
eq('required ja', rules.parseRequired('ja'), { required: true, optionalMark: '' });
eq('optional mark', rules.parseRequired('optional'), { required: false, optionalMark: 'optional' });
eq('optional mark (capital)', rules.parseRequired('Optional'), { required: false, optionalMark: 'Optional' });
eq('not required', rules.parseRequired(''), { required: false, optionalMark: '' });
eq('not required (nein)', rules.parseRequired('nein'), { required: false, optionalMark: '' });

eq('option lines', rules.parseOptionLines(['=Please select', 'AF=Afghanistan', 'XX=Bonaire, Sint Eustatius and Saba',
  '0=+/- 0 days {selected}', 'Economy Class']), [
  { value: '', label: 'Please select', selected: false },
  { value: 'AF', label: 'Afghanistan', selected: false },
  { value: 'XX', label: 'Bonaire, Sint Eustatius and Saba', selected: false },
  { value: '0', label: '+/- 0 days', selected: true },
  { value: 'economy-class', label: 'Economy Class', selected: false },
]);
eq('legacy comma pairs', rules.parseOptionLines(['a=A,b=B']).map((o) => o.value), ['a', 'b']);
eq('legacy comma labels', rules.parseOptionLines(['Red, Green']).map((o) => o.label), ['Red', 'Green']);
eq(
  'single option with comma',
  rules.parseOptionLines(['yes=I understand that this is chargeable, at the airport.']),
  [{ value: 'yes', label: 'I understand that this is chargeable, at the airport.', selected: false }],
);

eq('rules', rules.parseRules(['pattern=^[0-9]{1,3}$', 'maxlength=6', 'toggles=fishingData, bikeData', 'hidden',
  'repeat=4', 'add: add another flight', 'remaining=You can {n} add additional flights.', 'max-size=3700000',
  'not-allowed=#$%^*()[]', 'country=country', 'mask=DD.MM.YYYY', 'uppercase', 'min=1', 'max=1000', 'value=1',
  'remove=Delete Flight', 'pattern2']), {
  pattern: '^[0-9]{1,3}$',
  maxlength: 6,
  toggles: ['fishingData', 'bikeData'],
  hidden: true,
  repeat: 4,
  add: 'add another flight',
  remaining: 'You can {n} add additional flights.',
  'max-size': 3700000,
  'not-allowed': '#$%^*()[]',
  country: 'country',
  mask: 'DD.MM.YYYY',
  uppercase: true,
  min: 1,
  max: 1000,
  value: 1,
  remove: 'Delete Flight',
});

const text = (extra = {}) => ({
  type: 'text', required: true, rules: {}, ...extra,
});
eq('required empty', rules.validateValue(text(), '  '), 'valueMissing');
eq('optional empty', rules.validateValue(text({ required: false, rules: { pattern: '^[0-9]{13}$' } }), ''), '');
eq('email typeMismatch', rules.validateValue(text({ type: 'email' }), 'max@lufthansa'), 'typeMismatch');
eq('email ok', rules.validateValue(text({ type: 'email' }), 'max@lufthansa.com'), '');
eq('tel typeMismatch', rules.validateValue(text({ type: 'tel' }), '+49 abc'), 'typeMismatch');
eq('tel ok', rules.validateValue(text({ type: 'tel' }), '+49 69 86799799'), '');
eq('pattern mismatch', rules.validateValue(text({ rules: { pattern: '^[0-9]{1,3}$' } }), '1234'), 'patternMismatch');
eq('pattern ok', rules.validateValue(text({ rules: { pattern: '^[0-9]{1,3}$' } }), '123'), '');
eq('pnr pattern', rules.validateValue(text({ rules: { pattern: '^[A-Z1-9]{6}$' } }), 'ABC2DE'), '');
eq('pnr pattern (0 not allowed)', rules.validateValue(text({ rules: { pattern: '^[A-Z1-9]{6}$' } }), 'ABC0DE'), 'patternMismatch');
eq('date invalid day', rules.validateValue(text({ type: 'date', rules: { mask: 'DD/MM/YYYY' } }), '31/02/2024'), 'badDate');
eq('date leap day', rules.validateValue(text({ type: 'date', rules: { mask: 'DD/MM/YYYY' } }), '29/02/2024'), '');
eq('date incomplete', rules.validateValue(text({ type: 'date', rules: { mask: 'DD/MM/YYYY' } }), '15/10'), 'badDate');
eq('date de mask', rules.validateValue(text({ type: 'date', rules: { mask: 'DD.MM.YYYY' } }), '15.10.2022'), '');
eq('stepper below min', rules.validateValue({ type: 'stepper', required: true, rules: { min: 1, max: 1000 } }, '0'), 'rangeUnderflow');
eq('stepper above max', rules.validateValue({ type: 'stepper', required: false, rules: { min: 0, max: 99 } }, '100'), 'rangeOverflow');
eq('checkbox group missing', rules.validateValue({ type: 'checkbox', required: true }, []), 'valueMissing');
eq('checkbox group ok', rules.validateValue({ type: 'checkbox', required: true }, ['yes']), '');
eq('maxlength', rules.validateValue(text({ rules: { maxlength: 6 } }), 'ABCDEFG'), 'tooLong');

const msgs = { message: 'Please enter your surname.', constraint: 'Please enter a valid email address.' };
eq('message for valueMissing', rules.errorMessage(msgs, 'valueMissing', 'x'), 'Please enter your surname.');
eq('message for typeMismatch', rules.errorMessage(msgs, 'typeMismatch', 'x'), 'Please enter a valid email address.');
eq('message falls back to required message', rules.errorMessage({ message: 'M' }, 'patternMismatch', 'x'), 'M');
eq('message falls back to browser', rules.errorMessage({}, 'valueMissing', 'Browser'), 'Browser');
eq('no message when valid', rules.errorMessage(msgs, '', 'x'), '');

eq('date mask (de)', rules.applyDateMask('15102022', 'DD.MM.YYYY'), '15.10.2022');
eq('date mask (partial)', rules.applyDateMask('1510', 'DD/MM/YYYY'), '15/10');
eq('date mask (non-digits)', rules.applyDateMask('15a/10/2', 'DD/MM/YYYY'), '15/10/2');
eq('default masks', [rules.defaultDateMask('en'), rules.defaultDateMask('de')], ['DD/MM/YYYY', 'DD.MM.YYYY']);
eq('repeat name', rules.repeatName('carrier', 3), 'carrier_3');
eq('repeat text', rules.repeatText('You can {n} add additional flights.', 3), 'You can 3 add additional flights.');

const fileRules = { accept: 'image/png, image/jpeg, image/jpg, application/pdf', 'max-size': 3700000, 'not-allowed': '#$%^*()[]' };
eq('file ok', rules.fileProblem({ name: 'receipt.pdf', type: 'application/pdf', size: 1000 }, fileRules), '');
eq('file bad name', rules.fileProblem({ name: 'receipt#1.pdf', type: 'application/pdf', size: 1000 }, fileRules), 'invalidFileName');
eq('file too big', rules.fileProblem({ name: 'scan.png', type: 'image/png', size: 3700001 }, fileRules), 'fileTooBig');
eq('file wrong type', rules.fileProblem({ name: 'notes.txt', type: 'text/plain', size: 10 }, fileRules), 'invalidFileType');
eq('file extension accept', rules.fileAccepted({ name: 'A.PDF', type: '' }, '.pdf'), true);
eq('file size label', rules.formatFileSize(3700000), '3.7 MB');

/* ------------------------------------------------------------------------------------------ */
/* B  decorate() in a DOM shim                                                                */
/* ------------------------------------------------------------------------------------------ */

const BOOL_ATTRS = {
  hidden: 'hidden', disabled: 'disabled', required: 'required', multiple: 'multiple',
};
const STRING_ATTRS = {
  id: 'id',
  className: 'class',
  name: 'name',
  placeholder: 'placeholder',
  htmlFor: 'for',
  pattern: 'pattern',
  accept: 'accept',
  inputMode: 'inputmode',
  autocomplete: 'autocomplete',
  href: 'href',
  label: 'label',
};
const NUMBER_ATTRS = {
  maxLength: 'maxlength', minLength: 'minlength', rows: 'rows', tabIndex: 'tabindex',
};
const kebab = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

class ShimNode {
  constructor(nodeType) {
    this.nodeType = nodeType;
    this.parentNode = null;
  }

  get parentElement() { return this.parentNode && this.parentNode.nodeType === 1 ? this.parentNode : null; }

  remove() { if (this.parentNode) this.parentNode.removeChild(this); }

  replaceWith(...nodes) {
    const parent = this.parentNode;
    nodes.forEach((n) => parent.insertBefore(typeof n === 'string' ? new ShimText(n) : n, this));
    this.remove();
  }
}

class ShimText extends ShimNode {
  constructor(data) {
    super(3);
    this.data = String(data);
  }

  get textContent() { return this.data; }

  set textContent(v) { this.data = String(v); }

  cloneNode() { return new ShimText(this.data); }
}

/* selectors: comma lists of compound selectors joined by descendant (space) or child (>) */
function splitTop(selector, sep) {
  const out = [];
  let depth = 0;
  let quote = '';
  let cur = '';
  for (const ch of selector) {
    if (quote) {
      if (ch === quote) quote = '';
    } else if (ch === '"' || ch === "'") quote = ch;
    else if (ch === '[' || ch === '(') depth += 1;
    else if (ch === ']' || ch === ')') depth -= 1;
    if (!quote && !depth && sep.test(ch)) {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim()).filter(Boolean);
}
function parseCompound(text) {
  const parts = {
    tag: '', classes: [], attrs: [], checked: false,
  };
  const re = /^([a-z][a-z0-9-]*|\*)|\.([\w-]+)|\[([\w-]+)(?:="([^"]*)")?\]|(:checked)/gi;
  let m;
  let consumed = 0;
  // eslint-disable-next-line no-cond-assign
  while ((m = re.exec(text))) {
    if (m.index !== consumed) break;
    consumed += m[0].length;
    if (m[1]) parts.tag = m[1] === '*' ? '' : m[1].toUpperCase();
    if (m[2]) parts.classes.push(m[2]);
    if (m[3]) parts.attrs.push([m[3], m[4]]);
    if (m[5]) parts.checked = true;
  }
  if (consumed !== text.length) throw new Error(`shim: unsupported selector "${text}"`);
  return parts;
}
function parseComplex(selector) {
  const tokens = selector.replace(/\s*>\s*/g, ' > ').split(/\s+(?=(?:[^"]*"[^"]*")*[^"]*$)/);
  const steps = [];
  let combinator = ' ';
  tokens.forEach((t) => {
    if (t === '>') combinator = '>';
    else {
      steps.push({ combinator, compound: parseCompound(t) });
      combinator = ' ';
    }
  });
  return steps;
}
function matchCompound(node, c) {
  if (node.nodeType !== 1) return false;
  if (c.tag && node.tagName !== c.tag) return false;
  if (!c.classes.every((cl) => node.classList.contains(cl))) return false;
  if (!c.attrs.every(([n, v]) => node.hasAttribute(n) && (v === undefined || node.getAttribute(n) === v))) return false;
  return !c.checked || Boolean(node.checked);
}
function matchSteps(node, steps, i) {
  if (!matchCompound(node, steps[i].compound)) return false;
  if (i === 0) return true;
  if (steps[i].combinator === '>') return Boolean(node.parentElement) && matchSteps(node.parentElement, steps, i - 1);
  for (let p = node.parentElement; p; p = p.parentElement) if (matchSteps(p, steps, i - 1)) return true;
  return false;
}

class ShimElement extends ShimNode {
  constructor(tag) {
    super(1);
    this.tagName = tag.toUpperCase();
    this.attrs = {};
    this.childNodes = [];
    this.listeners = {};
    this.dataset = new Proxy({}, {
      get: (t, k) => (typeof k === 'string' ? this.getAttribute(`data-${kebab(k)}`) ?? undefined : undefined),
      set: (t, k, v) => {
        this.setAttribute(`data-${kebab(k)}`, v);
        return true;
      },
    });
    this.style = { setProperty() {} };
  }

  get children() { return this.childNodes.filter((n) => n.nodeType === 1); }

  get firstElementChild() { return this.children[0] || null; }

  get firstChild() { return this.childNodes[0] || null; }

  get textContent() { return this.childNodes.map((n) => n.textContent).join(''); }

  set textContent(v) { this.replaceChildren(...(v === '' || v == null ? [] : [String(v)])); }

  get classList() {
    const list = () => (this.attrs.class || '').split(/\s+/).filter(Boolean);
    const write = (l) => { this.attrs.class = [...new Set(l)].join(' '); };
    return {
      contains: (c) => list().includes(c),
      add: (...c) => write([...list(), ...c]),
      remove: (...c) => write(list().filter((x) => !c.includes(x))),
      toggle: (c, force) => {
        const on = force === undefined ? !list().includes(c) : Boolean(force);
        write(on ? [...list(), c] : list().filter((x) => x !== c));
        return on;
      },
    };
  }

  getAttribute(n) { return n in this.attrs ? this.attrs[n] : null; }

  setAttribute(n, v) { this.attrs[n] = String(v); }

  removeAttribute(n) { delete this.attrs[n]; }

  hasAttribute(n) { return n in this.attrs; }

  appendChild(node) {
    if (node.nodeType === 11) {
      [...node.childNodes].forEach((n) => this.appendChild(n));
      return node;
    }
    node.remove();
    node.parentNode = this;
    this.childNodes.push(node);
    return node;
  }

  insertBefore(node, ref) {
    node.remove();
    const i = ref ? this.childNodes.indexOf(ref) : -1;
    node.parentNode = this;
    if (i < 0) this.childNodes.push(node); else this.childNodes.splice(i, 0, node);
    return node;
  }

  removeChild(node) {
    const i = this.childNodes.indexOf(node);
    if (i >= 0) this.childNodes.splice(i, 1);
    node.parentNode = null;
    return node;
  }

  append(...nodes) { nodes.forEach((n) => this.appendChild(typeof n === 'string' ? new ShimText(n) : n)); }

  prepend(...nodes) {
    const first = this.childNodes[0] || null;
    nodes.forEach((n) => this.insertBefore(typeof n === 'string' ? new ShimText(n) : n, first));
  }

  replaceChildren(...nodes) {
    [...this.childNodes].forEach((n) => this.removeChild(n));
    this.append(...nodes);
  }

  cloneNode(deep) {
    const copy = new ShimElement(this.tagName);
    copy.attrs = { ...this.attrs };
    if (deep) this.childNodes.forEach((n) => copy.appendChild(n.cloneNode(true)));
    return copy;
  }

  matches(selector) {
    return splitTop(selector, /,/).some((s) => {
      const steps = parseComplex(s);
      return matchSteps(this, steps, steps.length - 1);
    });
  }

  querySelectorAll(selector) {
    const groups = splitTop(selector, /,/).map(parseComplex);
    const found = [];
    const visit = (node) => node.children.forEach((child) => {
      if (groups.some((steps) => matchSteps(child, steps, steps.length - 1))) found.push(child);
      visit(child);
    });
    visit(this);
    return found;
  }

  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }

  closest(selector) {
    for (let n = this; n && n.nodeType === 1; n = n.parentNode) if (n.matches(selector)) return n;
    return null;
  }

  addEventListener(type, fn) { (this.listeners[type] = this.listeners[type] || []).push(fn); }

  dispatchEvent(event) {
    Object.defineProperty(event, 'target', { value: this, configurable: true });
    for (let n = this; n; n = event.bubbles ? n.parentNode : null) {
      Object.defineProperty(event, 'currentTarget', { value: n, configurable: true });
      (n.listeners[event.type] || []).forEach((fn) => fn(event));
      if (event.cancelBubble) break;
    }
    return !event.defaultPrevented;
  }

  click() {
    if (this.tagName === 'INPUT' && ['checkbox', 'radio'].includes(this.type)) {
      this.checked = this.type === 'radio' ? true : !this.checked;
      if (this.type === 'radio') {
        const form = this.closest('form');
        (form ? form.querySelectorAll(`input[name="${this.name}"]`) : []).forEach((r) => {
          if (r !== this) r.checked = false;
        });
      }
      this.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }
    if (this.disabled) return;
    this.dispatchEvent(new Event('click', { bubbles: true }));
  }

  focus() { globalThis.document.activeElement = this; }

  scrollIntoView() {}

  get type() { return this.attrs.type || (this.tagName === 'INPUT' ? 'text' : ''); }

  set type(v) { this.attrs.type = String(v); }

  get value() {
    if (this.tagName === 'SELECT') {
      const o = this.options[this.selectedIndex];
      return o ? o.value : '';
    }
    if (this.tagName === 'OPTION') return this.attrs.value ?? this.textContent;
    if (this._value !== undefined) return this._value;
    return this.attrs.value ?? (this.type === 'checkbox' || this.type === 'radio' ? 'on' : '');
  }

  set value(v) {
    if (this.tagName === 'SELECT') {
      const i = this.options.findIndex((o) => o.value === String(v));
      this.selectedIndex = i;
    } else if (this.tagName === 'OPTION') this.attrs.value = String(v);
    else if (['checkbox', 'radio', 'hidden'].includes(this.type)) this.attrs.value = String(v);
    else this._value = String(v);
  }

  get defaultValue() { return this.attrs.value ?? ''; }

  get checked() { return this._checked ?? 'checked' in this.attrs; }

  set checked(v) { this._checked = Boolean(v); }

  get defaultChecked() { return 'checked' in this.attrs; }

  set defaultChecked(v) { if (v) this.attrs.checked = ''; else delete this.attrs.checked; }

  get options() { return this.querySelectorAll('option'); }

  get selected() { return this._selected ?? 'selected' in this.attrs; }

  set selected(v) {
    const select = this.closest('select');
    if (v && select) select.options.forEach((o) => { if (o !== this) o._selected = false; });
    this._selected = Boolean(v);
  }

  get defaultSelected() { return 'selected' in this.attrs; }

  set defaultSelected(v) { if (v) this.attrs.selected = ''; else delete this.attrs.selected; }

  get selectedIndex() {
    const opts = this.options;
    const i = opts.findIndex((o) => o.selected);
    if (i >= 0) return i;
    return opts.findIndex((o) => !o.disabled);
  }

  set selectedIndex(i) { this.options.forEach((o, n) => { o._selected = n === i; }); }

  get validationMessage() { return ''; }

  get files() { return this._files || []; }
}
Object.entries(BOOL_ATTRS).forEach(([prop, attr]) => Object.defineProperty(ShimElement.prototype, prop, {
  get() { return attr in this.attrs; },
  set(v) { if (v) this.attrs[attr] = ''; else delete this.attrs[attr]; },
}));
Object.entries(STRING_ATTRS).forEach(([prop, attr]) => Object.defineProperty(ShimElement.prototype, prop, {
  get() { return this.attrs[attr] || ''; },
  set(v) { this.attrs[attr] = String(v); },
}));
Object.entries(NUMBER_ATTRS).forEach(([prop, attr]) => Object.defineProperty(ShimElement.prototype, prop, {
  get() { return attr in this.attrs ? Number(this.attrs[attr]) : -1; },
  set(v) { this.attrs[attr] = String(v); },
}));

/** Parses the small HTML of the authored test table. */
function parseHtml(html) {
  const root = new ShimElement('div');
  const stack = [root];
  const re = /<\/([a-z0-9]+)>|<([a-z0-9]+)((?:\s+[a-z-]+(?:="[^"]*")?)*)\s*\/?>|([^<]+)/gi;
  let m;
  // eslint-disable-next-line no-cond-assign
  while ((m = re.exec(html))) {
    const top = stack[stack.length - 1];
    if (m[4] !== undefined) top.appendChild(new ShimText(m[4].replace(/&amp;/g, '&')));
    else if (m[1]) stack.pop();
    else {
      const node = new ShimElement(m[2]);
      (m[3] || '').replace(/([a-z-]+)(?:="([^"]*)")?/g, (a, n, v) => { node.attrs[n] = v ?? ''; return a; });
      top.appendChild(node);
      if (!['br', 'img', 'input'].includes(m[2].toLowerCase())) stack.push(node);
    }
  }
  return root;
}

const memoryStorage = () => {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  };
};
globalThis.document = {
  activeElement: null,
  createElement: (tag) => new ShimElement(tag),
  createTextNode: (t) => new ShimText(t),
  querySelector: () => null,
};
globalThis.window = {
  location: { pathname: '/de/en/feedback-past-flight', href: 'https://main--lh-com--moved-permanently.aem.page/de/en/feedback-past-flight', origin: 'https://main--lh-com--moved-permanently.aem.page' },
  localStorage: memoryStorage(),
  sessionStorage: memoryStorage(),
  addEventListener() {},
};
globalThis.CSS = { escape: (s) => String(s) };

/* network: the live site refuses (CORS), the recordings answer; every request is logged */
const requests = [];
const WORKER = 'https://lh-forms.aem-poc-lab.workers.dev';
let workerReply = { status: 200, body: { ok: true } };
globalThis.fetch = async (url, init = {}) => {
  const href = String(url);
  requests.push({ url: href, method: (init.method || 'GET').toUpperCase(), body: init.body });
  if (href.startsWith(`${WORKER}/`)) {
    if (workerReply === 'network') throw new TypeError('Failed to fetch (offline test)');
    const { status, body } = workerReply;
    return {
      ok: status >= 200 && status < 300, status, json: async () => body,
    };
  }
  if (href.startsWith('/data/recorded/')) {
    const file = path.join(ROOT, href);
    if (!fs.existsSync(file)) {
      return {
        ok: false, status: 404, json: async () => ({}), text: async () => '',
      };
    }
    const body = fs.readFileSync(file, 'utf8');
    return {
      ok: true, status: 200, headers: { get: () => 'application/json' }, json: async () => JSON.parse(body), text: async () => body,
    };
  }
  throw new TypeError('Failed to fetch (offline test)');
};

const row = (...cells) => `<div>${cells.map((c) => `<div>${c}</div>`).join('')}</div>`;
const lines = (...l) => l.map((x) => `<p>${x}</p>`).join('');
const SUCCESS_PATH = ['', 'de', 'en', 'support', 'contact', 'contact-form-confirmation'].join('/');
const TABLE = [
  row('Label', 'Type', 'Name', 'Required', 'Options', 'Help text', 'Placeholder', 'Validation message', 'Constraint message', 'Rules'),
  row('General information', 'step', '', '', '', 'Please give us your contact details.', '', '', '', ''),
  row('Your details', 'fieldset', 'contactData', '', '', '', '', '', '', ''),
  row('Name', 'text', 'lastName', 'yes', '', 'Please enter your surname as it appears on the flight ticket.', '', 'Please enter your surname.', '', ''),
  row('Email address', 'email', 'email', 'yes', '', '', '', 'Please enter your email address.', 'Please enter a valid email address.', ''),
  row('Ticket number', 'text', 'bookingReference', 'optional', '', 'Please enter your 13-digit ticket number.', '', '', 'Please enter a valid ticket number.', lines('pattern=^[0-9]{13}$', 'maxlength=13')),
  row('Booking code', 'text', 'pnr', '', '', '', '', '', 'Please enter a valid six-digit booking code, e.g. ABC2DE', lines('pattern=^[A-Z1-9]{6}$', 'maxlength=6', 'uppercase')),
  row('', 'end', '', '', '', '', '', '', '', ''),
  row('<p><b>Contact us</b></p>', 'note', '', '', '', '', '', '', '', ''),
  row('Title', 'select', 'salutation', 'yes', lines('M=Mr', 'F=Ms'), '', '', 'Title is a required field.', '', ''),
  row('Alternative dates', 'select', 'alternativedates', '', lines('0=+/- 0 days {selected}', '1=+/- 1 day'), '', '', '', '', ''),
  row('Adults', 'stepper', 'adults', 'yes', '', 'Number of adults', '', 'Please enter the number of adults.', '', lines('min=1', 'max=1000', 'value=1')),
  row('Flight date', 'date', 'flightDate', 'yes', '', 'Please enter the date of your flight. - DD/MM/YYYY', '', 'Please enter the date of your flight.', 'Please enter a valid date.', 'mask=DD/MM/YYYY'),
  row('From', 'autocomplete', 'departure', 'yes', '', '', '', 'Please enter the departure airport.', '', ''),
  row('For which flight would you like to book the service?', 'radio', 'animalBaggage', 'yes', lines('both=Outbound and return flights', 'inbound=Outbound flight only'), '', '', 'Please select the flight.', '', ''),
  row('Fishing equipment', 'checkbox', 'passengerFishing', '', lines('Yes=I would like to register fishing equipment.'), '', '', '', '', 'toggles=fishingData'),
  row('', 'fieldset', 'fishingData', '', '', '', '', '', '', 'hidden'),
  row('Length', 'text', 'fishingLength', 'yes', '', 'Please enter the length in centimetres.', '', 'Please enter the length.', 'Please enter the length of your fishing equipment in centimetres.', 'pattern=^[0-9]{1,3}$'),
  row('', 'end', '', '', '', '', '', '', '', ''),
  row('Request group travel for outbound flight only.', 'checkbox', 'onlyoutbound', '', lines('onlyoutbound=Request group travel for outbound flight only.'), '', '', '', '', 'toggles=inbound'),
  row('Return flight', 'fieldset', 'inbound', '', '', '', '', '', '', ''),
  row('Date of return flight', 'date', 'inbounddate', 'yes', '', '- DD/MM/YYYY', '', 'Enter date of return flight', '', 'mask=DD/MM/YYYY'),
  row('', 'end', '', '', '', '', '', '', '', ''),
  row('Personal details', 'step', '', '', '', '', '', '', '', ''),
  row('Person {n}', 'fieldset', 'PaxInfo', '', '', '', '', '', '', lines('repeat=3', 'add=Add another passenger from the same booking', 'remove=Delete Person', 'remaining=You can add {n} further passengers.')),
  row('First name', 'text', 'firstName', 'yes', '', '', '', 'Please enter your first name.', '', ''),
  row('Country', 'select', 'country', 'yes', lines('=Please select', 'DE=Germany', 'US=United States'), '', '', 'Country is a mandatory field.', '', ''),
  row('Staat/Region', 'region', 'state', 'yes', '', '', 'Bitte wählen', 'Country is a mandatory field.', '', 'country=country'),
  row('', 'end', '', '', '', '', '', '', '', ''),
  row('Attachments', 'step', '', '', '', '', '', '', '', ''),
  row('Please drag and drop your files here', 'file', 'Attachments', 'optional', '', 'Acceptable file formats: *pdf, *jpeg, *.jpg, *.png up to 3.7MB.', 'Select file(s)', '', '', lines('accept=image/png, image/jpeg, image/jpg, application/pdf', 'max-files=5', 'max-size=3700000', 'not-allowed=#$%^*()[]')),
  row('Terms and conditions of use', 'step', '', '', '', '', '', '', '', ''),
  row('Please confirm you accept the terms and conditions of use.', 'checkbox', 'termsOfUse', 'yes', lines('yes=The details you provide will be used solely to process your request.'), '', '', 'Please confirm you accept the terms and conditions of use.', '', ''),
  row('', 'hidden', 'source', '', 'core-form-test', '', '', '', '', ''),
  row('Book now', 'submit', '', '', '', '', '', '', '', ''),
  row('feedback-past-flight', 'config', 'form', '', '', '', '', '', '', ''),
  row(`<a href="${SUCCESS_PATH}">${SUCCESS_PATH}</a>`, 'config', 'success', '', '', '', '', '', '', ''),
  row('<a href="/error.html">/error.html</a>', 'config', 'error', '', '', '', '', '', '', ''),
].join('');

const { default: decorate } = await import('../../blocks/form/form.js');
const block = parseHtml(`<div class="form core block">${TABLE}</div>`).firstElementChild;
const section = new ShimElement('div');
section.append(block);
decorate(block);

const form = block.querySelector('form');
check('form rendered', Boolean(form));
check('no action, no method', form && !form.hasAttribute('action') && !form.hasAttribute('method'));
const field = (name) => block.querySelector(`.form-field[data-name="${name}"]`);
const errorOf = (name) => {
  const e = field(name) && field(name).querySelector('.form-error');
  return e && !e.hidden ? e.textContent : '';
};
const tick = () => new Promise((r) => { setTimeout(r, 0); });
const submit = () => form.dispatchEvent(new Event('submit', { cancelable: true }));
const status = () => block.querySelector('.form-status').textContent;

eq('bands', block.querySelectorAll('.form-step').length, 4);
eq(
  'band titles are h2',
  block.querySelectorAll('h2.form-step-title').map((h) => h.textContent),
  ['General information', 'Personal details', 'Attachments', 'Terms and conditions of use'],
);
eq('fields by type', ['text', 'email', 'select', 'stepper', 'date', 'autocomplete', 'radio', 'checkbox', 'region', 'file']
  .map((t) => block.querySelectorAll(`.form-field-${t}`).length > 0), Array(10).fill(true));
check('no required asterisks (core)', block.querySelectorAll('.form-required').length === 0);
eq('optional mark', field('bookingReference').querySelector('.form-optional').textContent, 'optional');
eq('preselected option', field('alternativedates').querySelector('select').value, '0');
eq('stepper value', field('adults').querySelector('input').value, '1');
check('stepper decrease disabled at min', field('adults').querySelector('.form-stepper-decrease').disabled);
eq('date mask placeholder', field('flightDate').querySelector('input').placeholder, 'DD/MM/YYYY');
eq('hidden input in form', form.querySelector('input[name="source"]').value, 'core-form-test');
eq('submit below the bands', form.children.filter((c) => c.classList.contains('form-actions')).map((c) => c.textContent), ['Book now']);
const fishing = block.querySelector('fieldset[data-section="fishingData"]');
const inbound = block.querySelector('fieldset[data-section="inbound"]');
check('hidden section starts hidden and disabled', fishing.hidden && fishing.disabled);
check('visible section starts visible', !inbound.hidden && !inbound.disabled);
eq('repeat copies', block.querySelectorAll('.form-repeat fieldset.form-subsection').length, 3);
eq(
  'repeat names',
  block.querySelectorAll('.form-repeat .form-field').map((w) => w.dataset.name),
  ['firstName_1', 'country_1', 'state_1', 'firstName_2', 'country_2', 'state_2', 'firstName_3', 'country_3', 'state_3'],
);
eq('repeat legends', block.querySelectorAll('.form-repeat legend').map((l) => l.textContent), ['Person 1', 'Person 2', 'Person 3']);
eq('repeat counter', block.querySelector('.form-repeat-remaining').textContent, 'You can add 2 further passengers.');
check('region hidden before a country is chosen', field('state_1').hidden);

// first submit: live's messages, nothing sent
submit();
await tick();
eq('required message (text)', errorOf('lastName'), 'Please enter your surname.');
eq('required message (select)', errorOf('salutation'), 'Title is a required field.');
eq('required message (radio)', errorOf('animalBaggage'), 'Please select the flight.');
eq('required message (checkbox)', errorOf('termsOfUse'), 'Please confirm you accept the terms and conditions of use.');
eq('required message (date)', errorOf('flightDate'), 'Please enter the date of your flight.');
eq('required message (copy 1)', errorOf('firstName_1'), 'Please enter your first name.');
eq('hidden copies are not validated', errorOf('firstName_2'), '');
eq('hidden section is not validated', errorOf('fishingLength'), '');
eq('visible toggled section is validated', errorOf('inbounddate'), 'Enter date of return flight');
eq('optional empty field is valid', errorOf('bookingReference'), '');
check('help text hidden while the error shows', field('lastName').querySelector('.form-help').hidden);
eq('no sent message on errors', status(), '');

// typing after the first submit revalidates live
const input = (name) => field(name).querySelector('input, select, textarea');
const type = (name, value) => {
  const c = input(name);
  c.value = value;
  c.dispatchEvent(new Event('input', { bubbles: true }));
};
type('email', 'max@lufthansa');
eq('constraint message while typing', errorOf('email'), 'Please enter a valid email address.');
type('email', 'max@lufthansa.com');
eq('error cleared when valid', errorOf('email'), '');
type('bookingReference', '220123');
eq('pattern message (optional field)', errorOf('bookingReference'), 'Please enter a valid ticket number.');
type('bookingReference', '');
type('pnr', 'abc2de');
eq('uppercase booking code', input('pnr').value, 'ABC2DE');
eq('booking code valid', errorOf('pnr'), '');
type('flightDate', '31022024');
eq('date mask applied', input('flightDate').value, '31/02/2024');
eq('invalid date message', errorOf('flightDate'), 'Please enter a valid date.');
type('flightDate', '15102026');

// show / hide: checking shows the hidden section, unchecking the visible one hides it
field('passengerFishing').querySelector('input').click();
check('checkbox shows its section', !fishing.hidden && !fishing.disabled);
type('fishingLength', '1234');
eq('shown section is validated', errorOf('fishingLength'), 'Please enter the length of your fishing equipment in centimetres.');
field('passengerFishing').querySelector('input').click();
check('unchecking hides the section again', fishing.hidden && fishing.disabled);
eq('hidden section is cleared', input('fishingLength').value, '');
field('onlyoutbound').querySelector('input').click();
check('checkbox hides a section shown at load', inbound.hidden);
eq('hidden section loses its error', errorOf('inbounddate'), '');

// repeatable section
const add = block.querySelector('.form-repeat-add');
add.click();
const copies = block.querySelectorAll('.form-repeat fieldset.form-subsection');
check('add shows copy 2', !copies[1].hidden);
eq('counter after add', block.querySelector('.form-repeat-remaining').textContent, 'You can add 1 further passengers.');
check('only the last shown copy can be removed', !copies[1].querySelector('.form-repeat-remove').hidden && copies[2].querySelector('.form-repeat-remove').hidden);
eq('remove button label', copies[1].querySelector('.form-repeat-remove').getAttribute('aria-label'), 'Delete Person');
add.click();
check('all copies shown: add link hidden', add.hidden && block.querySelector('.form-repeat-remaining').hidden);
copies[2].querySelector('.form-repeat-remove').click();
check('remove hides the copy', copies[2].hidden && !add.hidden);

// region follows the country (catalogs/countries from the recordings)
const country = input('country_1');
country.value = 'US';
country.dispatchEvent(new Event('change', { bubbles: true }));
await tick();
await new Promise((r) => { setTimeout(r, 50); });
const region = field('state_1');
check('region shown for a country with regions', !region.hidden);
const regionOptions = region.querySelectorAll('option');
eq('region empty option (live data-empty-option)', regionOptions[0] && regionOptions[0].textContent, 'Bitte wählen');
check('region options from catalogs/countries', regionOptions.length > 50, `${regionOptions.length} options`);
eq('data source marked', block.dataset.lhSource, 'recorded');
country.value = 'DE';
country.dispatchEvent(new Event('change', { bubbles: true }));
await new Promise((r) => { setTimeout(r, 20); });
check('region hidden for a country without regions', region.hidden);

// file drop: checks without uploading
const drop = field('Attachments');
const fileInput = drop.querySelector('input[type="file"]');
fileInput._files = [
  new File(['x'.repeat(1000)], 'receipt.pdf', { type: 'application/pdf' }),
  new File(['x'.repeat(1000)], 'bad#name.png', { type: 'image/png' }),
  new File(['x'.repeat(10)], 'notes.txt', { type: 'text/plain' }),
];
fileInput.dispatchEvent(new Event('change', { bubbles: true }));
eq('file list', drop.querySelectorAll('.form-filedrop-name').map((n) => n.textContent), ['receipt.pdf', 'bad#name.png', 'notes.txt']);
eq(
  'file problems',
  drop.querySelectorAll('.form-filedrop-error').map((n) => n.textContent),
  ['The file name contains an invalid character', 'Please upload a file with an accepted file type'],
);

// complete the form: a valid submit posts to the worker and goes to the success page
type('lastName', 'Mustermann');
type('firstName_1', 'Max');
type('firstName_2', 'Erika');
const sel = (name, value) => {
  const c = input(name);
  c.value = value;
  c.dispatchEvent(new Event('change', { bubbles: true }));
};
sel('salutation', 'M');
sel('country_1', 'DE');
sel('country_2', 'DE');
type('departure', 'Frankfurt (FRA)');
field('animalBaggage').querySelector('input').click();
field('termsOfUse').querySelector('input').click();
await new Promise((r) => { setTimeout(r, 20); });
const trap = form.querySelector('input[name="lh_hp"]');
check('honeypot', trap && trap.type === 'text' && trap.tabIndex === -1 && trap.autocomplete === 'off'
  && trap.closest('.form-hp').getAttribute('aria-hidden') === 'true' && !form.querySelector('label[for="lh_hp"]'));
const submitButton = form.querySelector('.form-actions button');
const before = requests.length;
submit();
const invalid = block.querySelectorAll('.form-field-invalid').map((w) => `${w.dataset.name}: ${w.querySelector('.form-error').textContent}`);
eq('no errors left', invalid, []);
check('busy while posting', submitButton.disabled && submitButton.getAttribute('aria-busy') === 'true'
  && submitButton.classList.contains('form-button-busy'));
eq('sending status', status(), 'Sending…');
await new Promise((r) => { setTimeout(r, 20); });
const posts = requests.slice(before).filter((r) => r.method === 'POST');
eq('one POST to the worker', posts.map((r) => r.url), [`${WORKER}/submit`]);
const body = posts[0] && posts[0].body;
eq('parts', body ? [...new Set([...body.keys()])] : [], ['form', 'locale', 'page', 'fields', 'lh_hp', 'file_1']);
eq('form id (config row)', body.get('form'), 'feedback-past-flight');
eq('locale', body.get('locale'), 'de-en');
eq('page', body.get('page'), 'https://main--lh-com--moved-permanently.aem.page/de/en/feedback-past-flight');
eq('honeypot empty', body.get('lh_hp'), '');
eq('file part', [body.get('file_1').name, body.get('file_1').size], ['receipt.pdf', 1000]);
const sent = JSON.parse(body.get('fields'));
const byName = Object.fromEntries(sent.map((f) => [f.name, f]));
check('every field has section, label, name, value strings', sent.every((f) => ['section', 'label', 'name', 'value'].every((k) => typeof f[k] === 'string')));
eq('field order', sent.map((f) => f.name), ['lastName', 'email', 'bookingReference', 'pnr', 'salutation', 'alternativedates', 'adults',
  'flightDate', 'departure', 'animalBaggage', 'passengerFishing', 'onlyoutbound', 'firstName_1', 'country_1', 'firstName_2', 'country_2',
  'Attachments', 'termsOfUse']);
eq('text field', byName.lastName, {
  section: 'Your details', label: 'Name', name: 'lastName', value: 'Mustermann',
});
eq('band headline as section', byName.salutation.section, 'General information');
eq('select: option text', byName.salutation.value, 'Mr');
eq('preselected select', byName.alternativedates.value, '+/- 0 days');
eq('stepper', byName.adults.value, '1');
eq('date as typed', byName.flightDate.value, '15/10/2026');
eq('radio: option text', byName.animalBaggage.value, 'Outbound and return flights');
eq('unchecked single checkbox', [byName.passengerFishing.label, byName.passengerFishing.value], ['Fishing equipment', 'No']);
eq('checked single checkbox', byName.termsOfUse.value, 'Yes');
eq('repeat copy title as section', [byName.firstName_1.section, byName.firstName_2.section], ['Person 1', 'Person 2']);
eq('country text', byName.country_2.value, 'Germany');
eq('files by name', [byName.Attachments.section, byName.Attachments.value], ['Attachments', 'receipt.pdf']);
check('hidden sections, copies, regions and hidden rows left out', !['fishingLength', 'inbounddate', 'firstName_3', 'state_1', 'source']
  .some((n) => n in byName));
eq('success page', window.location.href, `https://main--lh-com--moved-permanently.aem.page${SUCCESS_PATH}`);
check(
  'only catalog / recording reads and the worker POST',
  requests.every((r) => (r.method === 'GET'
    && (/^\/data\/recorded\//.test(r.url) || /\/service\/api\/(catalogs\/countries|suggestions\/airports)/.test(r.url)))
    || (r.method === 'POST' && r.url === `${WORKER}/submit`)),
  requests.map((r) => r.url).join(' '),
);

// failures go to the error page; without config rows: id from the path, success message
const PAGE = 'https://main--lh-com--moved-permanently.aem.page/de/en/feedback-past-flight';
const smallCore = (extra) => {
  const b = parseHtml(`<div class="form core block">${row('Label', 'Type', 'Name', 'Required')}${row('Name', 'text', 'lastName', 'yes')}${row('Send', 'submit', '', '')}${extra}</div>`).firstElementChild;
  new ShimElement('div').append(b);
  decorate(b);
  b.querySelector('input[name="lastName"]').value = 'Muster';
  return b;
};
const sendSmall = async (b) => {
  window.location.href = PAGE;
  b.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }));
  await new Promise((r) => { setTimeout(r, 20); });
  return window.location.href;
};
const errorPage = 'https://main--lh-com--moved-permanently.aem.page/error.html';
workerReply = { status: 400, body: { ok: false, error: 'invalid-fields' } };
eq('non-2xx -> error page', await sendSmall(smallCore(row('<a href="/error.html">/error.html</a>', 'config', 'error', ''))), errorPage);
workerReply = { status: 200, body: { ok: false } };
eq('ok false -> error page', await sendSmall(smallCore('')), errorPage);
workerReply = 'network';
eq('network error -> error page (default)', await sendSmall(smallCore('')), errorPage);
workerReply = { status: 200, body: { ok: true } };
const plain = smallCore('');
const stay = await sendSmall(plain);
eq('no success row: stays, shows the success message', [stay, plain.querySelector('.form-status').textContent], [PAGE, 'Thank you. Your request has been sent.']);
eq('form id from the path', requests[requests.length - 1].body.get('form'), 'feedback-past-flight');
check('busy state cleared', !plain.querySelector('.form-actions button').disabled);

// legacy form (feedback): unchanged defaults
const legacy = parseHtml(`<div class="form block">${row('Label', 'Type', 'Name', 'Required', 'Options', 'Help text', 'Placeholder')}${row('Please select your topic', 'select', 'topic', 'yes', lines('109=Login', '114=Functionality'), '', 'Please select your topic')}${row('Message', 'textarea', 'message', 'yes', '', '', '')}${row('Consent', 'checkbox', 'consent', 'yes', '', '', '')}${row('', 'submit', '', '', '', '', '')}</div>`).firstElementChild;
new ShimElement('div').append(legacy);
decorate(legacy);
check('legacy required asterisk', legacy.querySelectorAll('.form-required').length === 3);
eq('legacy disabled placeholder option', legacy.querySelector('select').options.map((o) => [o.value, o.disabled]), [['', true], ['109', false], ['114', false]]);
eq('legacy submit inside the card', legacy.querySelectorAll('.form-step-card .form-actions').map((a) => a.textContent), ['Submit']);
const legacyBefore = requests.length;
legacy.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }));
eq(
  'legacy messages (browser fallback)',
  legacy.querySelectorAll('.form-error').filter((e) => !e.hidden).map((e) => e.textContent),
  ['Please fill in this field.', 'Please fill in this field.', 'Please fill in this field.'],
);
legacy.querySelector('textarea').value = 'Hello';
legacy.querySelector('select').value = '109';
legacy.querySelector('input[type="checkbox"]').click();
legacy.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }));
await new Promise((r) => { setTimeout(r, 20); });
eq('legacy: render-only sent note', legacy.querySelector('.form-status').textContent, 'This is a preview form. Nothing has been sent.');
eq('legacy: nothing posted', requests.slice(legacyBefore).length, 0);
check('legacy: no honeypot', !legacy.querySelector('input[name="lh_hp"]'));

console.log(`${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
