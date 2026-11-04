/* eslint-disable no-console -- tooling */
/**
 * TAP's help contacts sheet (blocks/hotline-finder, brand tap; tools/reports/tap/parity.md rows 40
 * and 54): www.flytap.com's contacts by country as its help page shows them, from the capture of
 * www's answer to retrieve-contacts (www.flytap.com/api/aem/retrieve-contacts/<lang>.json:
 * countries, their cities, the cities' locations) and the capture's flat rows of the root
 * (contacts-<root>.json, for the labels in the root's language). www's finder (the help page's
 * chunk [[...slug]], ContactsByCountry), logged out:
 * - the countries in the answer's order; the cities without "NA" (none: the country's one place);
 *   the default city the country's defaultCity, else the first;
 * - a city's locations: first those of the country's "NA" place whose title the city has not,
 *   then the city's own, contact-center first; only locations with a telephone, an e-mail or an
 *   address;
 * - a location: its title (the group), its description, its telephones ("+" before a number
 *   without), its WhatsApp numbers, its address (the company first), its e-mails, its schedule.
 * No TAP API is called.
 *
 * Usage: node tools/tap-data/contacts-sheet.mjs --capture <the archive's folder> --out <folder>
 *          [--roots pt-pt,en-pt]
 * Writes <out>/<root>/help/contacts.json for each root.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** The sheet's columns, in order (default: "true" on the rows of the country's default city). */
export const COLUMNS = ['country', 'name', 'city', 'default', 'group', 'kind', 'label', 'value', 'note'];

/** The language versions and the language of www's answer each reads. */
export const ROOTS = {
  'pt-pt': 'pt', 'en-pt': 'en', 'es-es': 'es', 'fr-fr': 'fr', 'de-de': 'de', 'it-it': 'it', 'pl-pl': 'pl', 'pt-br': 'pt-br',
};

const NA = 'NA';
const ENTITIES = {
  nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
};

/** www's HTML as text: its line breaks and paragraphs as lines, the tags out, entities decoded. */
export function textOf(html) {
  return String(html || '')
    .replace(/\s+/g, ' ')
    .replace(/<br\s*\/?>|<\/(p|div|li)>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (m, e) => {
      if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : Number(e.slice(1)));
      return ENTITIES[e.toLowerCase()] ?? m;
    })
    .split('\n')
    .map((line) => line.replace(/[ \u00a0]+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
}

/** A telephone as www shows it: WhatsApp's without its "WhatsApp:", a "+" before a bare number. */
export function phoneText(number, whatsapp = false) {
  const n = String(number || '').trim();
  if (whatsapp || /^WhatsApp:/.test(n)) return n.replace(/^WhatsApp:\s*/, '');
  return n.startsWith('+') || n.startsWith('Fax') || n.startsWith('WhatsApp') ? n : `+${n}`;
}

/**
 * The labels in the root's language from the capture's flat rows: the groups by www's location
 * title, the fields by kind (WhatsApp's is www's "WhatsApp" in every language).
 */
export function labelsOf(flat) {
  const groups = {};
  const fields = { whatsapp: 'WhatsApp' };
  (flat || []).forEach((r) => {
    if (r.groupKey && r.group && !groups[r.groupKey]) groups[r.groupKey] = r.group;
    if (r.kind && r.label && !fields[r.kind]) fields[r.kind] = r.label;
  });
  return { groups, fields };
}

/** A country's places as www's city select has them, and its default. */
export function placesOf(country) {
  const all = (country.cities || []).map((c) => String(c.cityName || '').trim());
  const named = all.filter((c) => c !== NA);
  if (!named.length) return { cities: all.slice(0, 1), defaultCity: all[0] || NA };
  const wanted = String(country.defaultCity || '').trim();
  return { cities: named, defaultCity: named.includes(wanted) ? wanted : named[0] };
}

const shown = (l) => (l.phones || []).length > 0 || (l.emails || []).length > 0 || (l.contactAddress || '').length > 0;

/** The locations www shows for a city of a country, in its order. */
export function locationsFor(country, cityName) {
  const cities = country.cities || [];
  const city = cities.find((c) => String(c.cityName || '').trim() === cityName);
  if (!city) return [];
  const own = (city.locations || []).filter(shown).sort((r) => (r.title === 'contact-center' ? -1 : 0));
  if (cityName === NA) return own;
  const na = cities.find((c) => String(c.cityName || '').trim() === NA);
  const titles = new Set((city.locations || []).map((l) => l.title));
  const shared = ((na && na.locations) || []).filter((l) => !titles.has(l.title)).filter(shown);
  return [...shared, ...own];
}

/** A location's entries in www's order: [kind, value, note]. */
function entriesOf(l) {
  const out = [];
  if (l.description) out.push(['text', textOf(l.description), '']);
  const phones = (l.phones || []).filter((p) => p && p.phoneNumber);
  phones.filter((p) => !p.isWhatsapp).forEach((p) => out.push(['phone', phoneText(p.phoneNumber), textOf(p.descriptionContactPhone)]));
  phones.filter((p) => p.isWhatsapp).forEach((p) => out.push(['whatsapp', phoneText(p.phoneNumber, true), textOf(p.descriptionContactPhone)]));
  if (l.contactAddress) {
    if (l.companyAddress) out.push(['company', textOf(l.companyAddress), '']);
    out.push(['address', textOf(l.contactAddress), '']);
  }
  (l.emails || []).filter((e) => e && e.email).forEach((e) => out.push(['email', String(e.email).trim(), textOf(e.contactEmailDescription)]));
  if (l.serviceDesk) out.push(['text', textOf(l.serviceDesk), textOf(l.serviceDeskDescription)]);
  if (l.website) out.push(['link', String(l.website).trim(), textOf(l.contactWebsiteDescription)]);
  if (l.contactSchedule) out.push(['schedule', textOf(l.contactSchedule), '']);
  return out.filter(([, value]) => value);
}

/** The sheet's rows from www's answer: every country, every city, as www shows them. */
export function rowsOf(answer, labels) {
  const rows = [];
  ((answer && answer.countries) || []).forEach((country) => {
    const { cities, defaultCity } = placesOf(country);
    cities.forEach((cityName) => {
      locationsFor(country, cityName).forEach((l) => {
        entriesOf(l).forEach(([kind, value, note]) => rows.push({
          country: String(country.countryCode || '').trim().toUpperCase(),
          name: String(country.countryName || '').trim(),
          city: cityName === NA ? '' : cityName,
          default: String(cityName === defaultCity),
          group: labels.groups[l.title] || l.title,
          kind,
          label: kind === 'text' ? '' : labels.fields[kind === 'company' ? 'address' : kind] || '',
          value,
          note,
        }));
      });
    });
  });
  return rows;
}

export const sheetOf = (rows) => ({
  total: rows.length, limit: rows.length, offset: 0, data: rows, ':sheetname': 'data', ':type': 'sheet',
});

function args(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) if (argv[i].startsWith('--')) { out[argv[i].slice(2)] = argv[i + 1]; i += 1; }
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const a = args(process.argv.slice(2));
  ['capture', 'out'].forEach((k) => {
    if (!a[k]) { console.error(`--${k} is missing`); process.exit(2); }
  });
  const roots = a.roots ? a.roots.split(',') : Object.keys(ROOTS);
  roots.forEach((root) => {
    const read = (f) => JSON.parse(fs.readFileSync(path.join(a.capture, f), 'utf8'));
    const answer = read(`www.flytap.com/api/aem/retrieve-contacts/${ROOTS[root]}.json`);
    const rows = rowsOf(answer, labelsOf(read(`contacts-${root}.json`)));
    const file = path.join(a.out, root, 'help', 'contacts.json');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${JSON.stringify(sheetOf(rows), null, 1)}\n`);
    const countries = new Set(rows.map((r) => r.country)).size;
    console.log(`${root}: ${countries} countries, ${rows.length} rows -> ${file}`);
  });
}
