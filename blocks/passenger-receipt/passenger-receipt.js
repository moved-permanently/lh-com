/* eslint-disable max-len -- www's patterns and texts */
/*
 * passenger-receipt: www.lufthansa.com's passenger receipt download form (www's
 * passenger-receipt-portal app on /{cc}/{ll}/book-and-manage/pax-receipt; capture lh-parity-003,
 * 2026-11-06): ticket number, first and last name, a business-purpose checkbox and "Download
 * Passenger Receipt". www's rules (its zod schema): the ticket number required, at most 14
 * characters, 13 digits written 2201234567890 or 220-1234567890 (the dash is dropped), starting
 * with 220; first name 1-56 and last name 1-57 characters of www's letters (accented ones
 * converted on leaving the field by www's table of the page language, with a note). A field is
 * checked once it has been left after typing, then on every change; all on submit. Errors: a box
 * above the fields (count, headline, a link to each field; focused) and a message under each.
 *
 * Hand-off (scripts/handoff.js): off the airline's own www host the form opens the same page on
 * www (the visitor downloads it there; nothing is sent from this site). On the own host (or with
 * ?handoff=post) it does what www's script does: reads the receipt service and its key from
 * runtime-config.json on its own origin and POSTs {ticketNumber, firstName, lastName} to
 * <service>/download (X-API-KEY, X-Tenant-id LH, Accept-Language), then downloads the PDF of the
 * answer as <ticket>.pdf; without that config, www's general error. The key is never in this code.
 */
import { getLocale, LIVE_ORIGIN } from '../../scripts/locale.js';
import { labelsRequest, fetchRequest } from '../../scripts/lh-api.js';
import { postHandoffOn } from '../../scripts/handoff.js';
import { TEXTS, LIVE_KEYS } from './passenger-receipt-texts.js';
import { convertAccents } from './accents.js';

/** www's runtime config of the receipt service (same origin as the page). */
export const RUNTIME_CONFIG = '/digitalhangar/passenger-receipt-portal/passenger-receipt-portal/runtime-config.json';
const TICKET_PREFIX = '220';
const TICKET = /^\d{3}-?\d{10}$/;
const LETTERS = 'A-Za-zäëïöüÄËÏÖÜáéíóúÁÉÍÓÚàèìòùÀÈÌÒÙâêîôûÂÊÎÔÛåÅãñõÃÑÕçøÇØæÆÐðþÞÿß\\u0104\\u0105\\u0106\\u0107\\u0118\\u0119\\u0141\\u0142\\u0143\\u0144\\u015A\\u015B\\u0179\\u017A\\u017B\\u017C';
/** www's name patterns (the service's OpenAPI description). */
export const FIRST_NAME = new RegExp(`^[${LETTERS}.';, _\\+\\&#\\*="/\\-]{1,56}$`);
export const LAST_NAME = new RegExp(`^[${LETTERS} \\-]{1,57}$`);
const MAX = { firstName: 56, lastName: 57 };

/** The ticket number as sent: upper case, trimmed, the dash after the first three digits dropped. */
export function ticketValue(value) {
  return String(value || '').toUpperCase().trim().replace(/^(\d{3})-(\d{10})$/, '$1$2');
}

/** www's checks: the key of the error text (TEXTS), or '' when valid. */
export function fieldError(name, raw) {
  if (name === 'ticketNumber') {
    const value = String(raw || '').toUpperCase().trim();
    if (!value) return 'ticket required';
    if (value.length > 14) return 'ticket invalid';
    return TICKET.test(value) && ticketValue(value).startsWith(TICKET_PREFIX) ? '' : 'ticket invalid';
  }
  const value = String(raw || '').trim();
  const prefix = name === 'firstName' ? 'first name' : 'last name';
  if (!value) return `${prefix} required`;
  if (value.length > MAX[name]) return `${prefix} too long`;
  return (name === 'firstName' ? FIRST_NAME : LAST_NAME).test(value) ? '' : `${prefix} invalid`;
}

/** The request www's script sends, as fetch arguments; null without the service config. */
export function receiptRequest({ ticketNumber, firstName, lastName }, lang, config) {
  const base = config && String(config.PASSENGER_RECEIPT_BFF_BASE_URL || '').replace(/\/+$/, '');
  const key = config && config.PASSENGER_RECEIPT_BFF_API_KEY;
  if (!base || !key) return null;
  return [`${base}/download`, {
    method: 'POST',
    headers: {
      'X-API-KEY': key, 'X-Tenant-id': 'LH', 'Accept-Language': lang, 'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ticketNumber: ticketValue(ticketNumber), firstName: firstName.trim(), lastName: lastName.trim() }),
  }];
}

/** The PDF of an answer's documentContent (a binary string), as www's script makes it. */
export function pdfBlob(documentContent) {
  const s = String(documentContent || '');
  const bytes = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i += 1) bytes[i] = s.charCodeAt(i) % 256;
  return new Blob([bytes], { type: 'application/pdf' });
}

/** The same page on www (the hand-off off the own host). */
export function wwwPage(location = window.location) {
  return `${LIVE_ORIGIN}${location.pathname}`;
}

const fill = (text, values) => String(text).replace(/\{(\w+)\}/g, (m, k) => (k in values ? values[k] : m));
let instances = 0;

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (v === undefined || v === null || v === false) return;
    if (k === 'className') node.className = v;
    else if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v === true ? '' : v);
  });
  node.append(...children.filter(Boolean));
  return node;
}

/** The block's texts: the built-in ones of the page language (else English), live ones over them. */
async function textsFor(locale, fetchLabels = fetchRequest) {
  const own = { ...TEXTS.en, ...(TEXTS[locale.lang] || {}) };
  try {
    const { data } = await fetchLabels(labelsRequest('passengerreceipt', locale), locale, { exact: true });
    if (data && typeof data === 'object') {
      Object.entries(LIVE_KEYS).forEach(([k, live]) => {
        const v = data[`passengerreceipt.${live}`];
        if (typeof v === 'string' && v.trim()) own[k] = v.trim();
      });
      Object.entries(data).forEach(([k, v]) => {
        if (/^passengerreceipt\.errors\.bff\./.test(k) && typeof v === 'string') own[k] = v;
      });
    }
  } catch (e) {
    // no label service: the built-in texts
  }
  return own;
}

/**
 * Builds the form into `block` with `texts`; `options.submit(values)` runs on a valid submit
 * (the hand-off). Returns the form's controls for the tests.
 */
export function buildForm(block, texts, options = {}) {
  instances += 1;
  const id = (name) => `passenger-receipt-${instances}-${name}`;
  const lang = options.lang || 'en';
  const state = { touched: {}, errors: {} };

  const box = el('div', {
    className: 'passenger-receipt-errors', role: 'alert', tabindex: '-1', hidden: true,
  });
  const form = el('form', { className: 'passenger-receipt-form', novalidate: true, 'aria-labelledby': id('title') });
  const title = el('h2', { className: 'passenger-receipt-title', id: id('title'), text: texts.headline });
  const note = el('p', { className: 'passenger-receipt-note', text: texts.note });

  const field = (name, label, { hint, autocomplete } = {}) => {
    const input = el('input', {
      type: 'text', id: id(name), name, autocomplete: autocomplete || 'off', spellcheck: 'false', 'aria-invalid': 'false',
    });
    const message = el('p', { className: 'passenger-receipt-message', id: id(`${name}-message`) });
    if (hint) message.textContent = hint;
    else message.hidden = true;
    if (hint) input.setAttribute('aria-describedby', message.id);
    const wrap = el('div', { className: `passenger-receipt-field passenger-receipt-${name}` }, el('label', { for: input.id, text: label }), el('div', { className: 'passenger-receipt-box' }, input), message);
    return {
      name, input, message, wrap, hint: hint || '',
    };
  };
  const fields = [
    field('ticketNumber', texts['ticket label'], { hint: texts['ticket hint'] }),
    field('firstName', texts['first name label'], { autocomplete: 'given-name' }),
    field('lastName', texts['last name label'], { autocomplete: 'family-name' }),
  ];
  const business = el('input', { type: 'checkbox', id: id('business'), name: 'isBusiness' });
  const businessRow = el('div', { className: 'passenger-receipt-checkbox' }, business, el('label', { for: business.id, text: texts['business label'] }));
  const button = el('button', { type: 'submit', className: 'button primary passenger-receipt-submit', text: texts['submit label'] });
  const status = el('p', {
    className: 'passenger-receipt-status', role: 'status', 'aria-live': 'polite',
  });
  const general = el('p', { className: 'passenger-receipt-general', role: 'alert', hidden: true });

  const show = (f) => {
    const key = state.errors[f.name];
    f.wrap.classList.toggle('passenger-receipt-invalid', !!key);
    f.input.setAttribute('aria-invalid', key ? 'true' : 'false');
    if (key) {
      f.message.textContent = texts[key];
      f.message.hidden = false;
      f.input.setAttribute('aria-describedby', f.message.id);
    } else if (f.converted) {
      f.message.textContent = texts['accents converted'];
      f.message.hidden = false;
    } else {
      f.message.textContent = f.hint;
      f.message.hidden = !f.hint;
      if (f.hint) f.input.setAttribute('aria-describedby', f.message.id);
      else f.input.removeAttribute('aria-describedby');
    }
  };
  const check = (f) => {
    state.errors[f.name] = fieldError(f.name, f.input.value);
    show(f);
  };
  const renderBox = () => {
    const wrong = fields.filter((f) => state.errors[f.name]);
    box.replaceChildren();
    if (!wrong.length) {
      box.hidden = true;
      return wrong;
    }
    const count = wrong.length === 1 ? texts['errors one'] : fill(texts['errors many'], { COUNT: wrong.length });
    box.append(
      el('p', { className: 'passenger-receipt-errors-headline', text: `${count} ${texts['errors headline']}` }),
      el('ul', {}, ...wrong.map((f) => el('li', {}, el('a', { href: `#${f.input.id}`, text: texts[state.errors[f.name]] })))),
    );
    box.querySelectorAll('a').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = form.querySelector(a.getAttribute('href'));
      if (target) target.focus();
    }));
    box.hidden = false;
    return wrong;
  };

  fields.forEach((f) => {
    f.input.addEventListener('input', () => {
      if (f.name === 'ticketNumber') {
        const up = f.input.value.toUpperCase();
        if (up !== f.input.value) f.input.value = up;
      }
      if (f.typed === undefined) f.typed = true;
      if (state.touched[f.name]) {
        check(f);
        if (!box.hidden) renderBox();
      }
    });
    f.input.addEventListener('blur', () => {
      if (f.name !== 'ticketNumber') {
        const plain = convertAccents(f.input.value, lang);
        f.converted = plain !== f.input.value;
        if (f.converted) f.input.value = plain;
      }
      if (!f.typed && !state.touched[f.name]) {
        show(f);
        return;
      }
      state.touched[f.name] = true;
      check(f);
      if (!box.hidden) renderBox();
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    general.hidden = true;
    fields.forEach((f) => {
      state.touched[f.name] = true;
      check(f);
    });
    const wrong = renderBox();
    if (wrong.length) {
      box.focus();
      if (box.scrollIntoView) box.scrollIntoView({ block: 'start', behavior: 'smooth' });
      return;
    }
    if (!options.submit) return;
    button.disabled = true;
    status.textContent = texts.submitting;
    try {
      await options.submit(Object.fromEntries(fields.map((f) => [f.name, f.input.value])), { business: business.checked });
    } catch (err) {
      const keys = (err && err.keys) || [];
      const text = keys.map((k) => texts[k]).find(Boolean) || texts['general error'];
      general.textContent = text;
      general.hidden = false;
      general.focus?.();
    } finally {
      button.disabled = false;
      status.textContent = '';
    }
  });

  const names = el('div', { className: 'passenger-receipt-names' }, fields[1].wrap, fields[2].wrap);
  form.append(title, note, box, fields[0].wrap, names, businessRow, general, el('div', { className: 'passenger-receipt-actions' }, button), status);
  block.replaceChildren(form);
  return {
    form, box, fields, business, button, general, status,
  };
}

/** The success state www shows after the download: headline, message, "Download again". */
function showSuccess(block, texts, again) {
  const panel = el(
    'div',
    { className: 'passenger-receipt-success', role: 'status', tabindex: '-1' },
    el('h2', { className: 'passenger-receipt-title', text: texts['success headline'] }),
    el('p', { text: texts['success message'] }),
  );
  const download = el('button', { type: 'button', className: 'button secondary', text: texts['download again'] });
  download.addEventListener('click', again);
  const another = el('a', { href: window.location.pathname, text: texts['request another'] });
  panel.append(el('p', { className: 'passenger-receipt-actions' }, download), el('p', {}, another));
  block.replaceChildren(panel);
  panel.focus();
}

/** www's error answer -> the label keys of its codes. */
export function errorKeys(answer) {
  const codes = [...((answer && answer.errors) || []), ...((answer && answer.validationErrors) || []).map((v) => v.code)];
  return codes.filter((c) => typeof c === 'string').map((c) => (c.startsWith('passengerreceipt.') ? c : `passengerreceipt.errors.bff.${c}`));
}

/** The own-host hand-off: www's request and download (see above); throws {keys} on an error. */
export async function sendReceipt(values, lang, { fetchImpl = fetch, save } = {}) {
  let config = null;
  try {
    const res = await fetchImpl(RUNTIME_CONFIG, { credentials: 'same-origin' });
    if (res.ok) config = await res.json();
  } catch (e) {
    config = null;
  }
  const request = receiptRequest(values, lang, config);
  if (!request) throw Object.assign(new Error('no receipt service'), { keys: [] });
  const res = await fetchImpl(...request);
  let answer = null;
  try {
    answer = await res.json();
  } catch (e) {
    answer = null;
  }
  if (!res.ok || !answer || !answer.documentContent) throw Object.assign(new Error('receipt service error'), { keys: errorKeys(answer) });
  const blob = pdfBlob(answer.documentContent);
  const name = `${ticketValue(values.ticketNumber)}.pdf`;
  (save || ((b, n) => {
    const url = URL.createObjectURL(b);
    const a = document.createElement('a');
    a.href = url;
    a.download = n;
    a.click();
    URL.revokeObjectURL(url);
  }))(blob, name);
  return { blob, name };
}

export default async function decorate(block) {
  const locale = getLocale();
  const texts = await textsFor(locale);
  buildForm(block, texts, {
    lang: locale.lang,
    submit: async (values) => {
      if (!postHandoffOn()) {
        // off the own host: the same page on www, where the visitor downloads it
        window.location.assign(wwwPage());
        return;
      }
      await sendReceipt(values, locale.lang);
      showSuccess(block, texts, () => sendReceipt(values, locale.lang));
    },
  });
}
