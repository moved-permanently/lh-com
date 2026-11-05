/*
 * click-to-call: TAP's call-back card as www.flytap.com draws it (BySide's window in the page,
 * CoreMedia Engagement Cloud; tools/reports/tap/parity.md row 66, the capture tap-byside-001):
 * a light green card with the title, the text, the telephone with its country code, the day and
 * the half-hour slot, the button and the schedule line, the wide picture at the right (the phone
 * one on top on phones), the small print under the card, and BySide's floating button at the
 * bottom right, which scrolls to the card. The button reads the in-hours label during the opening
 * hours (Lisbon time) and the other one outside them, as www. www's form sends the number to
 * TAP's call-back service; the replica's forms stay on TAP's site, so the button opens the Link
 * (the same page on www) in a new tab and nothing typed here is sent. The table: README.md.
 */

/** BySide's country codes, in its order (+351 first; +1 twice: the United States, Canada). */
export const COUNTRY_CODES = ['351', '55', '1', '1', '244', '258', '33', '44', '39', '34', '31', '32', '49', '27', '30', '41', '43', '45', '46', '47', '48', '52', '54', '58', '212', '225', '238', '352', '353', '354', '356', '358', '377', '420', '599', '670', '1787'];

/** The texts www shows where the table has none (English, BySide's en window). */
export const CALL_DEFAULTS = {
  button: 'Call me now',
  'button outside hours': 'Schedule contact',
  phone: 'Phone number',
  days: 'Today, Tomorrow',
  hours: 'Mon-Fri 09:00-24:00',
  slots: '08:00-23:30',
};

/** The fields' names for assistive tech, in the page's language. */
export const CALL_FIELD_NAMES = {
  pt: { code: 'Indicativo', day: 'Dia', time: 'Hora' },
  en: { code: 'Country code', day: 'Day', time: 'Time' },
  es: { code: 'Prefijo', day: 'Día', time: 'Hora' },
  fr: { code: 'Indicatif', day: 'Jour', time: 'Heure' },
  de: { code: 'Ländervorwahl', day: 'Tag', time: 'Uhrzeit' },
  it: { code: 'Prefisso', day: 'Giorno', time: 'Ora' },
  pl: { code: 'Numer kierunkowy', day: 'Dzień', time: 'Godzina' },
};

const DAYS = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
};
const minutes = (hhmm) => {
  const [h, m] = String(hhmm).split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};
const hhmm = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

/**
 * The opening hours from "Mon-Fri 09:00-24:00" (Lisbon time; www's BySide list for Portugal when
 * the row is empty).
 * @returns {{days: number[], from: number, to: number}} weekdays (0 Sunday) and minutes
 */
export function parseHours(value) {
  const m = String(value || '').trim().toLowerCase()
    .match(/^([a-z]{3})\s*-\s*([a-z]{3})\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/);
  if (!m || !(m[1] in DAYS) || !(m[2] in DAYS)) return parseHours(CALL_DEFAULTS.hours);
  const days = [];
  for (let d = DAYS[m[1]]; ; d = (d + 1) % 7) {
    days.push(d);
    if (d === DAYS[m[2]] || days.length > 7) break;
  }
  return { days, from: minutes(m[3]), to: minutes(m[4]) };
}

/** Whether a moment is within the opening hours, in Lisbon's time. */
export function inOpeningHours(date, hours) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Lisbon', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date).map((p) => [p.type, p.value]));
  const day = DAYS[String(parts.weekday).slice(0, 3).toLowerCase()];
  const now = Number(parts.hour) * 60 + Number(parts.minute);
  return hours.days.includes(day) && now >= hours.from && now < hours.to;
}

/** The half-hour slots from "08:00-23:30" (both included). */
export function slotsOf(value) {
  const m = String(value || '').match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/) || CALL_DEFAULTS.slots.match(/(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/);
  const out = [];
  for (let t = minutes(m[1]); t <= minutes(m[2]); t += 30) out.push(hhmm(t));
  return out;
}

const node = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'className') n.className = v;
    else n.setAttribute(k, v);
  });
  n.append(...kids.filter((k) => k !== null && k !== undefined && k !== false));
  return n;
};

const select = (className, label, values) => node(
  'select',
  { className, 'aria-label': label },
  ...values.map(([value, text]) => node('option', { value }, text)),
);

/** A cell's paragraphs' contents (a single paragraph unwrapped). */
const inline = (cell) => {
  const ps = cell ? [...cell.querySelectorAll(':scope > p')] : [];
  if (ps.length === 1) return [...ps[0].childNodes];
  return cell ? [...cell.childNodes] : [];
};

/**
 * @param {Element} block
 */
export default async function decorate(block) {
  const rows = {};
  [...block.querySelectorAll(':scope > div')].forEach((row) => {
    const [key, value] = row.children;
    if (key && value) rows[key.textContent.trim().toLowerCase()] = value;
  });
  const val = (k) => (rows[k] ? rows[k].textContent.trim() : '') || CALL_DEFAULTS[k] || '';
  const lang = (document.documentElement.lang || '').slice(0, 2);
  const names = CALL_FIELD_NAMES[lang] || CALL_FIELD_NAMES.en;
  const link = rows.link && rows.link.querySelector('a');
  const href = (link && link.href) || `https://www.flytap.com${window.location ? window.location.pathname : ''}`;

  const media = (row, className) => {
    const picture = row && row.querySelector('picture, img');
    return picture ? node('div', { className }, picture) : null;
  };
  const title = rows.title ? node('h3', { className: 'click-to-call-title' }, ...inline(rows.title)) : null;
  const text = rows.text ? node('div', { className: 'click-to-call-text' }, ...rows.text.childNodes) : null;

  // the fields as www's: the country code and the telephone, the day and the slot
  const tel = node('input', {
    type: 'tel', className: 'click-to-call-phone', name: 'phone', placeholder: val('phone'), 'aria-label': val('phone'), autocomplete: 'tel-national', inputmode: 'tel',
  });
  const days = val('days').split(',').map((d) => d.trim()).filter(Boolean);
  const hours = parseHours(rows.hours ? rows.hours.textContent : '');
  const submit = node('button', { type: 'submit', className: 'click-to-call-submit' });
  const label = () => {
    submit.textContent = inOpeningHours(new Date(), hours) ? val('button') : val('button outside hours');
  };
  label();
  const form = node(
    'form',
    { className: 'click-to-call-form' },
    node('div', { className: 'click-to-call-phone-row' }, select('click-to-call-code', names.code, COUNTRY_CODES.map((c, i) => [`${c}-${i}`, `(+${c})`])), tel),
    node(
      'div',
      { className: 'click-to-call-when' },
      select('click-to-call-day', names.day, days.map((d, i) => [String(i), d])),
      select('click-to-call-time', names.time, slotsOf(rows.slots ? rows.slots.textContent : '').map((t) => [t, t])),
    ),
    node('div', { className: 'click-to-call-button' }, submit),
  );
  // the label follows the hours while the page stays open
  form.addEventListener('focusin', label);
  // TAP's call-back service is www's: its page takes over (nothing typed here is sent)
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    window.open(href, '_blank', 'noopener');
  });
  const schedule = rows.schedule ? node('p', { className: 'click-to-call-schedule' }, ...inline(rows.schedule)) : null;

  const card = node(
    'div',
    { className: 'click-to-call-card' },
    media(rows['mobile image'], 'click-to-call-media-mobile'),
    node('div', { className: 'click-to-call-content' }, title, text, form, schedule),
    media(rows.image, 'click-to-call-media'),
  );
  const small = rows['small print'] ? node('div', { className: 'click-to-call-small' }, ...rows['small print'].childNodes) : null;

  // BySide's floating button: its two lines, it scrolls to the card
  let float = null;
  if (rows['floating button']) {
    const lines = [...rows['floating button'].querySelectorAll('p')].map((p) => p.textContent.trim()).filter(Boolean);
    const [first, second] = lines.length ? lines : [rows['floating button'].textContent.trim()];
    float = node(
      'button',
      { type: 'button', className: 'click-to-call-float' },
      node('span', { className: 'click-to-call-float-text' }, first),
      second ? node('span', { className: 'click-to-call-float-sub' }, second) : null,
    );
    float.addEventListener('click', () => {
      const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      card.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      const field = card.querySelector('input[type="tel"]');
      if (field) field.focus({ preventScroll: true });
    });
  }

  block.replaceChildren(...[card, small, float].filter(Boolean));
}
