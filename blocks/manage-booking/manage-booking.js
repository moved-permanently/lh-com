import { brandEntry } from '../../scripts/locale.js';
import { readConfigRows, resolveLabels } from '../../scripts/block-config.js';
import { submitShopHandoff } from '../../scripts/shop-handoff.js';
import { adLang, requestManage } from '../../scripts/airdolomiti-api.js';

/*
 * Air Dolomiti's manage booking form (www.airdolomiti.it/gestione-prenotazione-volo,
 * .eu/manage-flight-booking, .de/bearbeitung-ihrer-buchungen): surname and booking code, POSTed to
 * api.airdolomiti.it/v1/bookings/retrieve-pnr; its answer names the engine's page and carries
 * dxMMBTripFlow (encrypted by the server, so only the API can build it), posted there with recLoc,
 * lastName and portalFacts as www's form does. Brand airdolomiti only (its booking entry's format);
 * elsewhere the block shows its Live page link and calls nothing.
 */

/** www's texts per language (2026-11-01); a block row with the same key wins. */
const LABELS = {
  it: {
    'surname label': 'Cognome',
    'surname placeholder': 'Cognome',
    'booking code label': 'Codice di prenotazione',
    'booking code placeholder': 'Codice di prenotazione',
    'submit label': 'Cerca prenotazione',
    error: 'Al momento non è possibile recuperare la prenotazione. Riprova più tardi.',
  },
  en: {
    'surname label': 'Surname',
    'surname placeholder': 'Surname',
    'booking code label': 'Booking Code',
    'booking code placeholder': 'Booking Code',
    'submit label': 'Search booking',
    error: 'Your booking could not be retrieved right now. Please try again later.',
  },
  de: {
    'surname label': 'Nachname',
    'surname placeholder': 'Nachname',
    'booking code label': 'Buchungscode',
    'booking code placeholder': 'Buchungscode',
    'submit label': 'Buchung suchen',
    error: 'Die Buchung kann gerade nicht abgerufen werden. Bitte versuchen Sie es später noch einmal.',
  },
};

let instances = 0;

const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

export default async function decorate(block) {
  const config = readConfigRows(block);
  const brand = brandEntry();
  if (!brand || !brand.booking || brand.booking.format !== 'airdolomiti') {
    const link = config['live-page'] && config['live-page'].link;
    block.replaceChildren();
    if (link) {
      const p = el('p');
      p.append(link);
      block.append(p);
    }
    return;
  }
  instances += 1;
  const id = `manage-booking-${instances}`;
  const lang = adLang();
  const labels = resolveLabels(LABELS, config, lang);

  const form = el('form', 'manage-booking-form');
  const input = (name, key, autocomplete) => {
    const wrap = el('div', 'manage-booking-field');
    const label = el('label', '', labels[`${key} label`]);
    label.htmlFor = `${id}-${name}`;
    const control = el('input');
    control.type = 'text';
    control.id = `${id}-${name}`;
    control.name = name;
    control.placeholder = labels[`${key} placeholder`];
    control.required = true;
    control.autocomplete = autocomplete;
    control.addEventListener('input', () => wrap.classList.remove('is-invalid'));
    wrap.append(label, control);
    form.append(wrap);
    return { wrap, control };
  };
  const surname = input('surname', 'surname', 'family-name');
  const code = input('bookingCode', 'booking code', 'off');
  code.control.spellcheck = false;
  code.control.setAttribute('autocapitalize', 'characters');
  const submit = el('button', 'button manage-booking-submit', labels['submit label']);
  submit.type = 'submit';
  const error = el('p', 'manage-booking-error');
  error.setAttribute('role', 'alert');
  error.hidden = true;
  form.append(submit, error);
  block.replaceChildren(form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submit.disabled) return;
    error.hidden = true;
    const empty = [surname, code].filter((f) => !f.control.value.trim());
    [surname, code].forEach((f) => f.wrap.classList.toggle('is-invalid', empty.includes(f)));
    if (empty.length) {
      empty[0].control.focus();
      return;
    }
    submit.disabled = true;
    submit.setAttribute('aria-busy', 'true');
    try {
      const handoff = await requestManage({
        surname: surname.control.value, bookingCode: code.control.value,
      }, lang);
      submitShopHandoff(handoff);
    } catch (err) {
      error.textContent = labels.error;
      error.hidden = false;
    } finally {
      submit.disabled = false;
      submit.removeAttribute('aria-busy');
    }
  });
}
