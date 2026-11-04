/*
 * hotline-finder on brand tap (TAP Air Portugal): www.flytap.com's contacts by country on the help
 * centre (/en-pt/help, /pt-pt/ajuda: ComponentContactsByCountryModel, folder "contacts"). A country
 * select and, where the country has several, a city select; under them the place's contact
 * groups (Contact Center, TAP Miles&Go Customer Service, Customer Service Desk, Lost & Found ...),
 * each a title, maybe a line of text, and its entries: telephone, WhatsApp, e-mail, address,
 * schedule, link, each with its icon, label, value and note. The picture beside it from 1024 px.
 *
 * Rows (key | value): Sheet (the root's contacts sheet, one row per entry: country (ISO code),
 * name (the country's name in the root's language), city, group, kind (text, phone, whatsapp,
 * email, address, schedule, link), label (else the kind's), value, note), Image, Select and City
 * (the selects' labels; else TAP's "Select country" and "City" in the page's language). First the
 * root's market country and its first city. Another brand's hotline-finder is unchanged.
 * The look: styles/themes/tap.css (.hotline-finder-tap).
 */

/** TAP's labels in its languages (English for any other): www's i18n where it has them. */
export const TAP_CONTACT_LABELS = {
  en: {
    select: 'Select country', city: 'City', phone: 'Telephone', whatsapp: 'WhatsApp', email: 'E-mail', address: 'Address', schedule: 'Schedule', link: 'Website',
  },
  pt: {
    select: 'Selecione o país', city: 'Cidade', phone: 'Telefone', whatsapp: 'WhatsApp', email: 'E-mail', address: 'Morada', schedule: 'Horário', link: 'Website',
  },
  es: {
    select: 'Seleccione el país', city: 'Ciudad', phone: 'Teléfono', whatsapp: 'WhatsApp', email: 'Correo electrónico', address: 'Dirección', schedule: 'Horario', link: 'Sitio web',
  },
  fr: {
    select: 'Sélectionnez le pays', city: 'Ville', phone: 'Téléphone', whatsapp: 'WhatsApp', email: 'E-mail', address: 'Adresse', schedule: 'Horaires', link: 'Site web',
  },
  de: {
    select: 'Land auswählen', city: 'Stadt', phone: 'Telefon', whatsapp: 'WhatsApp', email: 'E-Mail', address: 'Adresse', schedule: 'Öffnungszeiten', link: 'Website',
  },
  it: {
    select: 'Seleziona il paese', city: 'Città', phone: 'Telefono', whatsapp: 'WhatsApp', email: 'E-mail', address: 'Indirizzo', schedule: 'Orari', link: 'Sito web',
  },
  pl: {
    select: 'Wybierz kraj', city: 'Miasto', phone: 'Telefon', whatsapp: 'WhatsApp', email: 'E-mail', address: 'Adres', schedule: 'Godziny', link: 'Strona',
  },
};

export const KINDS = ['text', 'phone', 'whatsapp', 'email', 'address', 'schedule', 'link'];

const el = (tag, attrs = {}, text = '') => {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  if (text) node.textContent = text;
  return node;
};

const textOf = (cell) => (cell ? cell.textContent.trim() : '');

/**
 * The sheet's rows grouped: countries in the sheet's order, each with its name and its cities
 * (the empty city for a country without), each city its groups in order, each group its entries.
 * @param {Array} rows
 * @returns {Array<{code: string, name: string, cities: Array<{name: string,
 *   groups: Array<{title: string, entries: Array}>}>}>}
 */
export function contactsOf(rows) {
  const countries = [];
  (rows || []).forEach((r) => {
    const code = String(r.country || '').trim().toUpperCase();
    const kind = String(r.kind || '').trim().toLowerCase();
    const value = String(r.value || '').trim();
    if (!code || !KINDS.includes(kind) || !value) return;
    let c = countries.find((x) => x.code === code);
    if (!c) { c = { code, name: String(r.name || '').trim() || code, cities: [] }; countries.push(c); }
    const cityName = String(r.city || '').trim();
    let city = c.cities.find((x) => x.name === cityName);
    if (!city) { city = { name: cityName, groups: [] }; c.cities.push(city); }
    const title = String(r.group || '').trim();
    let group = city.groups.find((g) => g.title === title);
    if (!group) { group = { title, entries: [] }; city.groups.push(group); }
    group.entries.push({
      kind, label: String(r.label || '').trim(), value, note: String(r.note || '').trim(),
    });
  });
  return countries;
}

/** A telephone number as a tel: address (digits and the leading +). */
export const telOf = (phone) => `tel:${String(phone).replace(/[^+\d]/g, '')}`;

function entryOf(entry, labels) {
  if (entry.kind === 'text') return el('p', { class: 'hotline-finder-text' }, entry.value);
  const item = el('div', { class: `hotline-finder-entry hotline-finder-${entry.kind}` });
  item.append(el('span', { class: 'hotline-finder-label' }, entry.label || labels[entry.kind] || ''));
  const value = el('p', { class: 'hotline-finder-value' });
  if (entry.kind === 'phone') value.append(el('a', { href: telOf(entry.value) }, entry.value));
  else if (entry.kind === 'whatsapp') value.append(el('a', { href: `https://wa.me/${entry.value.replace(/[^\d]/g, '')}`, target: '_blank', rel: 'noopener noreferrer' }, entry.value));
  else if (entry.kind === 'email') value.append(el('a', { href: `mailto:${entry.value}` }, entry.value));
  else if (entry.kind === 'link' && /^https?:\/\//.test(entry.value)) value.append(el('a', { href: entry.value, target: '_blank', rel: 'noopener noreferrer' }, entry.value.replace(/^https?:\/\//, '')));
  else value.textContent = entry.value;
  item.append(value);
  if (entry.note) item.append(el('p', { class: 'hotline-finder-note' }, entry.note));
  return item;
}

/** The groups of a place as nodes: a heading per group, its text and entries. */
export function groupsOf(city, labels) {
  return city.groups.map((g) => {
    const box = el('div', { class: 'hotline-finder-group' });
    if (g.title) box.append(el('h3', { class: 'hotline-finder-group-title' }, g.title));
    const entries = el('div', { class: 'hotline-finder-entries' });
    g.entries.forEach((e) => (e.kind === 'text' ? box : entries).append(entryOf(e, labels)));
    box.append(entries);
    return box;
  });
}

let instances = 0;

/**
 * @param {Element} block
 * @param {{lang: string, country: string, fetcher?: Function}} opts the page's language and
 *   market country
 */
export default async function decorateTapFinder(block, {
  lang, country, fetcher = (u) => fetch(u),
}) {
  const rows = Object.fromEntries([...block.querySelectorAll(':scope > div')]
    .filter((row) => row.children.length >= 2)
    .map((row) => [row.children[0].textContent.trim().toLowerCase(), row.children[1]]));
  const labels = { ...(TAP_CONTACT_LABELS[lang] || TAP_CONTACT_LABELS.en) };
  if (textOf(rows.select)) labels.select = textOf(rows.select);
  if (textOf(rows.city)) labels.city = textOf(rows.city);
  const sheetCell = rows.sheet;
  const href = sheetCell ? (sheetCell.querySelector('a[href]')?.getAttribute('href') || textOf(sheetCell)) : '';
  const picture = rows.image ? rows.image.querySelector('picture, img') : null;

  block.classList.add('hotline-finder-tap');
  block.replaceChildren();
  if (picture) {
    const media = el('div', { class: 'hotline-finder-media' });
    media.append(picture);
    block.append(media);
  }
  const body = el('div', { class: 'hotline-finder-body' });
  block.append(body);

  let countries = [];
  try {
    const resp = href ? await fetcher(`${href}${href.includes('?') ? '&' : '?'}limit=5000`) : null;
    if (resp && resp.ok) countries = contactsOf((await resp.json()).data);
  } catch (e) {
    countries = [];
  }
  if (!countries.length) {
    block.dataset.lhSource = 'none';
    return;
  }
  block.dataset.lhSource = 'sheet';

  instances += 1;
  const id = `hotline-finder-tap-${instances}`;
  const fields = el('div', { class: 'hotline-finder-fields' });
  const countrySelect = el('select', { id: `${id}-country`, name: 'country' });
  countries.forEach((c) => countrySelect.append(el('option', { value: c.code }, c.name)));
  const cityField = el('div', { class: 'hotline-finder-field' });
  const citySelect = el('select', { id: `${id}-city`, name: 'city' });
  const countryField = el('div', { class: 'hotline-finder-field' });
  countryField.append(el('label', { for: countrySelect.id, class: 'hotline-finder-hidden' }, labels.select), countrySelect);
  cityField.append(el('label', { for: citySelect.id, class: 'hotline-finder-hidden' }, labels.city), citySelect);
  fields.append(countryField, cityField);
  const contact = el('div', { class: 'hotline-finder-contact', 'aria-live': 'polite' });
  body.append(fields, contact);

  const current = () => countries.find((c) => c.code === countrySelect.value) || countries[0];
  const showCity = () => {
    const c = current();
    const city = c.cities.find((x) => x.name === citySelect.value) || c.cities[0];
    contact.replaceChildren(...groupsOf(city, labels));
  };
  const showCountry = () => {
    const c = current();
    citySelect.replaceChildren(...c.cities.map((x) => el('option', { value: x.name }, x.name)));
    // a country without cities (or one city without a name): no city select
    cityField.hidden = c.cities.length < 2 && !c.cities[0].name;
    showCity();
  };
  const start = countries.find((c) => c.code === String(country || '').toUpperCase());
  // the market's country first (its option's default selectedness)
  if (start) countrySelect.querySelector(`option[value="${start.code}"]`).setAttribute('selected', '');
  countrySelect.addEventListener('change', showCountry);
  citySelect.addEventListener('change', showCity);
  showCountry();
}
