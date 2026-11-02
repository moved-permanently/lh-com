import { getLocale } from '../../scripts/locale.js';

/*
 * Hotline finder: a country select and the hotline of the picked country (www's PartnerPlusBenefit
 * box on business.lufthansagroup.com's contact pages). Rows (key | value): Sheet (the countries'
 * sheet: country, name-<ll>, phone, phone2, email, link, hours "MO 08:00-18:00; ...", note-<ll>),
 * Headline, Select (the select's label), Contact (the contact's heading), Hours (the opening
 * hours' heading), Days (Monday ... Sunday, comma-separated), Image (beside the finder from
 * 1025 px, as www's teaser image). The root's country is picked at
 * first (none on xx: the rest of the world); the names and notes in the page's language.
 */

const DAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
let instances = 0;

/** The block's rows: key (lower case) -> its value cell. */
function readRows(block) {
  return Object.fromEntries([...block.querySelectorAll(':scope > div')]
    .filter((row) => row.children.length >= 2)
    .map((row) => [row.children[0].textContent.trim().toLowerCase(), row.children[1]]));
}

const textOf = (cell) => (cell ? cell.textContent.trim() : '');

/**
 * Opening hours "MO 08:00-18:00; FR 08:00-16:00" as [day name, "08:00 - 18:00"], in week order.
 * @param {string} hours The sheet's hours
 * @param {string[]} names The day names, Monday first
 */
export function parseHours(hours, names) {
  return String(hours || '').split(';').map((s) => s.trim().match(/^([A-Z]{2})\s+(\S+)-(\S+)$/))
    .filter((m) => m && DAYS.includes(m[1]))
    .sort((a, b) => DAYS.indexOf(a[1]) - DAYS.indexOf(b[1]))
    .map((m) => [names[DAYS.indexOf(m[1])] || m[1], `${m[2]} - ${m[3]}`]);
}

const el = (tag, attrs = {}, text = '') => {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  if (text) node.textContent = text;
  return node;
};

async function loadSheet(href) {
  if (!href) return null;
  try {
    const resp = await fetch(href);
    if (!resp.ok) return null;
    const json = await resp.json();
    return Array.isArray(json.data) ? json.data.filter((r) => r && r.country) : null;
  } catch (e) {
    return null;
  }
}

function contactOf(row, labels, lang) {
  const items = [];
  // the contact's heading for screen readers (www: a hidden label of the phone)
  if (labels.contact) items.push(el('h4', { class: 'hotline-finder-heading hotline-finder-hidden' }, labels.contact));
  [row.phone, row.phone2].filter(Boolean).forEach((phone) => {
    const p = el('p', { class: 'hotline-finder-phone' });
    p.append(el('a', { href: `tel:${phone.replace(/[^+\d]/g, '')}` }, phone));
    items.push(p);
  });
  if (row.email) {
    const p = el('p', { class: 'hotline-finder-email' });
    p.append(el('a', { href: `mailto:${row.email}` }, row.email));
    items.push(p);
  }
  if (row.link) {
    const p = el('p', { class: 'hotline-finder-link' });
    p.append(el('a', { href: row.link }, row.link));
    items.push(p);
  }
  const note = row[`note-${lang}`] || row['note-en'];
  if (note) items.push(el('p', { class: 'hotline-finder-note' }, note));
  const hours = parseHours(row.hours, labels.days);
  if (hours.length) {
    if (labels.hours) items.push(el('h4', { class: 'hotline-finder-heading' }, labels.hours));
    const table = el('table', { class: 'hotline-finder-hours' });
    const body = el('tbody');
    hours.forEach(([day, time]) => {
      const tr = el('tr');
      tr.append(el('th', { scope: 'row' }, day), el('td', {}, time));
      body.append(tr);
    });
    table.append(body);
    items.push(table);
  }
  return items;
}

export default async function decorate(block) {
  const rows = readRows(block);
  const sheetCell = rows.sheet;
  const href = sheetCell ? (sheetCell.querySelector('a[href]')?.getAttribute('href') || textOf(sheetCell)) : '';
  const labels = {
    headline: textOf(rows.headline),
    select: textOf(rows.select),
    contact: textOf(rows.contact),
    hours: textOf(rows.hours),
    days: textOf(rows.days).split(',').map((d) => d.trim()),
  };
  const picture = rows.image ? rows.image.querySelector('picture, img') : null;
  const locale = getLocale();
  const lang = locale.lang || document.documentElement.lang || 'en';
  const country = String(locale.country || '').toUpperCase();
  block.replaceChildren();
  const body = el('div', { class: 'hotline-finder-body' });
  block.append(body);
  if (picture) {
    const media = el('div', { class: 'hotline-finder-media' });
    media.append(picture);
    block.append(media);
  }
  if (labels.headline) body.append(el('h3', { class: 'hotline-finder-title' }, labels.headline));
  const countries = await loadSheet(href);
  if (!countries || !countries.length) return;

  instances += 1;
  const id = `hotline-finder-${instances}`;
  const field = el('div', { class: 'hotline-finder-field' });
  const select = el('select', { id, name: 'country' });
  select.append(el('option', { value: '' }, labels.select));
  countries.forEach((row) => select.append(el('option', { value: row.country }, row[`name-${lang}`] || row['name-en'] || row.country)));
  field.append(el('label', { for: id }, labels.select), select);
  const contact = el('div', { class: 'hotline-finder-contact', 'aria-live': 'polite' });
  body.append(field, contact);

  const show = () => {
    const row = countries.find((r) => r.country === (select.value || ''));
    contact.replaceChildren(...(row ? contactOf(row, labels, lang) : []));
  };
  // the root's country first (its option's default selectedness)
  select.querySelector(`option[value="${country}"]`)?.setAttribute('selected', '');
  select.addEventListener('change', show);
  show();
}
