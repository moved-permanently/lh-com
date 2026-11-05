/*
 * click-to-call: TAP's call-back card on the extras pages, as www.flytap.com shows it ("Fly in
 * the Comfort area", seats and extras; tools/reports/tap/parity.md row 66). Rows of a key and a
 * value: Title, Text, Schedule, Image (from 1024 px, at the right), Mobile image (on top on
 * phones), Link (the page on www). Below the text a telephone with its country code, a day and an
 * hour, and "Schedule contact". www's card (CoreMedia Engagement Cloud) hands the number to TAP's
 * call-back service, which the replica has not: the button opens the Link (www's page, a new tab),
 * where TAP's own form calls back; the number typed here goes nowhere. The look: click-to-call.css.
 */

/** The form's words in TAP's languages (English else). */
export const CALL_LABELS = {
  en: {
    code: 'Country code', phone: 'Phone number', day: 'Day', time: 'Time', today: 'Today', tomorrow: 'Tomorrow', submit: 'Schedule contact',
  },
  pt: {
    code: 'Indicativo', phone: 'Número de telefone', day: 'Dia', time: 'Hora', today: 'Hoje', tomorrow: 'Amanhã', submit: 'Agendar contacto',
  },
  es: {
    code: 'Prefijo', phone: 'Número de teléfono', day: 'Día', time: 'Hora', today: 'Hoy', tomorrow: 'Mañana', submit: 'Programar contacto',
  },
  fr: {
    code: 'Indicatif', phone: 'Numéro de téléphone', day: 'Jour', time: 'Heure', today: 'Aujourd’hui', tomorrow: 'Demain', submit: 'Planifier le contact',
  },
  de: {
    code: 'Ländervorwahl', phone: 'Telefonnummer', day: 'Tag', time: 'Uhrzeit', today: 'Heute', tomorrow: 'Morgen', submit: 'Kontakt planen',
  },
  it: {
    code: 'Prefisso', phone: 'Numero di telefono', day: 'Giorno', time: 'Ora', today: 'Oggi', tomorrow: 'Domani', submit: 'Programma il contatto',
  },
  pl: {
    code: 'Numer kierunkowy', phone: 'Numer telefonu', day: 'Dzień', time: 'Godzina', today: 'Dziś', tomorrow: 'Jutro', submit: 'Zaplanuj kontakt',
  },
};

// www's list starts with Portugal; TAP's main markets after it
const CODES = ['351', '55', '34', '33', '49', '39', '41', '44', '1', '48', '31', '32', '244', '238', '258', '239', '245'];

const node = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'className') n.className = v;
    else if (k === 'text') n.textContent = v;
    else n.setAttribute(k, v);
  });
  n.append(...kids.filter(Boolean));
  return n;
};

const select = (className, label, values) => node(
  'select',
  { className, 'aria-label': label },
  ...values.map(([value, text]) => node('option', { value }, text)),
);

/**
 * @param {Element} block
 */
export default async function decorate(block) {
  const rows = {};
  [...block.querySelectorAll(':scope > div')].forEach((row) => {
    const [key, value] = row.children;
    if (key && value) rows[key.textContent.trim().toLowerCase()] = value;
  });
  const lang = (document.documentElement.lang || '').slice(0, 2);
  const t = CALL_LABELS[lang] || CALL_LABELS.en;
  const link = rows.link && rows.link.querySelector('a');
  const href = (link && link.href) || `https://www.flytap.com${window.location ? window.location.pathname : ''}`;

  const media = (row, className) => {
    const picture = row && row.querySelector('picture, img');
    return picture ? node('div', { className }, picture) : null;
  };
  const title = rows.title ? node('h3', { className: 'click-to-call-title' }, ...rows.title.childNodes) : null;
  const text = rows.text ? node('div', { className: 'click-to-call-text' }, ...rows.text.childNodes) : null;

  const times = [];
  for (let m = 5 * 60; m <= 19 * 60; m += 30) {
    const hh = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
    times.push([hh, hh]);
  }
  const tel = node('input', {
    type: 'tel', className: 'click-to-call-phone', name: 'phone', placeholder: t.phone, 'aria-label': t.phone, autocomplete: 'tel-national', inputmode: 'tel',
  });
  const submit = node('button', { type: 'submit', className: 'click-to-call-submit' }, t.submit);
  const form = node(
    'form',
    { className: 'click-to-call-form' },
    node('div', { className: 'click-to-call-phone-row' }, select('click-to-call-code', t.code, CODES.map((c) => [c, `(+${c})`])), tel),
    node(
      'div',
      { className: 'click-to-call-when' },
      select('click-to-call-day', t.day, [['0', t.today], ['1', t.tomorrow]]),
      select('click-to-call-time', t.time, times),
    ),
    submit,
  );
  // TAP's call-back service is www's: its page takes over (nothing typed here is sent)
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    window.open(href, '_blank', 'noopener');
  });
  const schedule = rows.schedule ? node('p', { className: 'click-to-call-schedule' }, rows.schedule.textContent.trim()) : null;

  const content = node('div', { className: 'click-to-call-content' }, title, text, form, schedule);
  block.replaceChildren(...[
    media(rows['mobile image'], 'click-to-call-media-mobile'),
    content,
    media(rows.image, 'click-to-call-media'),
  ].filter(Boolean));
}
