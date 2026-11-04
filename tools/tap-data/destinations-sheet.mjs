/* eslint-disable no-console -- tooling */
/**
 * TAP's destinations map sheet (blocks/poi-map, brand tap; tools/reports/tap/parity.md row 45): the
 * destinations www.flytap.com lists on its destinations page, from the page's __NEXT_DATA__ in the
 * capture archives (ComponentAccordionItemsListModel: a region per item, a "City | Country"
 * paragraph per destination, both linked to www's flights-to pages), each placed on the map by its
 * airport: the city's name matched to the root's recorded airport sheet (content-sites/lh-tap/runs/
 * airports/<root>.json, TAP's own city codes; tapRoute entries first), the code's coordinates from
 * OurAirports' public airports.csv (public domain). www's map is Smartvel's widget, whose data is
 * not in the captures; no TAP API is called.
 *
 * Usage: node tools/tap-data/destinations-sheet.mjs --root en-pt --page <destinations.html>
 *          --airports <runs/airports/en-pt.json> --ourairports <airports.csv> --out <sheet.json>
 * Prints the destinations it could not place (to add to PLACES below); they stay out of the sheet.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** The sheet's columns, in order. */
export const COLUMNS = ['region', 'city', 'country', 'code', 'lat', 'lng', 'link', 'countryLink'];

/**
 * Cities whose name on the destinations page is not a city name of the airport sheet (accents and
 * case aside): the name, folded, to TAP's city or airport code.
 */
export const PLACES = {
  sal: 'SID',
  'sao vicente': 'VXE',
  'sao tome': 'TMS',
  brasilia: 'BSB',
  'sao luis': 'SLZ',
  'luxembourg city': 'LUX',
  luxemburgo: 'LUX',
  'palma de mallorca': 'PMI',
  'palma de maiorca': 'PMI',
  reykjavik: 'KEF',
  reiquiavique: 'KEF',
  'gran canaria': 'LPA',
  'nova iorque': 'NYC',
  marraquexe: 'RAK',
  'sao luis do maranhao': 'SLZ',
  'cidade do luxemburgo': 'LUX',
};

/** Folds a name for matching: no accents, lower case, single spaces. */
export const fold = (s) => String(s || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/\s+/g, ' ')
  .trim();

/** The page's __NEXT_DATA__ (null without it). */
export function nextDataOf(html) {
  const m = String(html).match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  return m ? JSON.parse(m[1]) : null;
}

const textOf = (node) => {
  if (!node) return '';
  if (node.nodeType === 'text') return node.value || '';
  return (node.content || []).map(textOf).join('');
};

/**
 * www's market placeholder in its links (en_[market], pt_[market]) as the root's market.
 * @param {string} href
 * @param {string} root e.g. en-pt
 */
export function marketLink(href, root) {
  const market = root.split('-')[1];
  return String(href || '').replace(/_\[market\]/, `_${market}`).replace(/_%5Bmarket%5D/i, `_${market}`);
}

/**
 * The destinations of a destinations page: region, city, country and the two links, in www's order.
 * @param {Object} next the page's __NEXT_DATA__
 * @param {string} root
 */
export function destinationsOf(next, root) {
  const sections = next?.props?.pageProps?.page?.sections || [];
  const list = sections.find((s) => s.__typename === 'ComponentAccordionItemsListModel');
  if (!list) return [];
  const out = [];
  (list.items || []).forEach((item) => {
    const region = String(item.label || '').trim();
    ((item.accordionItemDescription || {}).json || []).forEach((para) => {
      const links = (para.content || []).filter((c) => c.nodeType === 'link');
      if (!links.length) return;
      const city = textOf(links[0]).trim();
      if (!city) return;
      out.push({
        region,
        city,
        country: links[1] ? textOf(links[1]).trim() : '',
        link: marketLink(links[0].data && links[0].data.href, root),
        countryLink: links[1] ? marketLink(links[1].data && links[1].data.href, root) : '',
      });
    });
  });
  return out;
}

/** One CSV line's fields (quotes and doubled quotes). */
export function csvFields(line) {
  const out = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i += 1; } else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { out.push(cur); cur = ''; } else cur += ch;
  }
  out.push(cur);
  return out;
}

/** OurAirports' airports.csv as IATA code -> {lat, lng} (airports with a code only). */
export function coordinatesOf(csv) {
  const lines = String(csv).split(/\r?\n/);
  const head = csvFields(lines[0]);
  const at = (name) => head.indexOf(name);
  const [iata, lat, lng, type] = [at('iata_code'), at('latitude_deg'), at('longitude_deg'), at('type')];
  const map = new Map();
  lines.slice(1).forEach((line) => {
    if (!line) return;
    const f = csvFields(line);
    const code = f[iata];
    if (!code || !/^[A-Z]{3}$/.test(code) || /closed/.test(f[type])) return;
    if (!map.has(code)) map.set(code, { lat: Number(f[lat]), lng: Number(f[lng]) });
  });
  return map;
}

/**
 * Places a destination: its airport code and coordinates (city codes as the mean of their
 * airports' positions), or null.
 * @param {{city: string}} dest
 * @param {Array} airports the root's recorded entries ({airport, city, cityName, tapRoute})
 * @param {Map} coords IATA -> {lat, lng}
 */
export function placeOf(dest, airports, coords) {
  const name = fold(dest.city);
  let code = PLACES[name] || '';
  if (!code) {
    // the same name in the destination's country first (Boa Vista: Cape Verde's, not Brazil's)
    const hits = airports.filter((e) => fold(e.cityName) === name);
    const country = fold(dest.country);
    // ... or a longer name there holding it ("Boa Vista Island", "Ilha Da Boa Vista")
    const inCountry = airports.filter((e) => country && fold(e.countryName) === country);
    const ranked = [
      ...hits.filter((e) => inCountry.includes(e)),
      ...inCountry.filter((e) => ` ${fold(e.cityName)} `.includes(` ${name} `)),
      ...hits,
    ];
    const best = ranked.find((e) => e.tapRoute) || ranked[0];
    code = best ? (best.city || best.airport) : '';
  }
  if (!code) return null;
  if (coords.has(code)) return { code, ...coords.get(code) };
  // a city code (LON, NYC, MIL): the mean of its airports TAP flies to (no railway stations)
  const inCity = airports.filter((e) => e.city === code && !e.isRailway && coords.has(e.airport));
  const flown = inCity.filter((e) => e.tapRoute);
  const all = (flown.length ? flown : inCity).map((e) => coords.get(e.airport));
  if (!all.length) return null;
  // without the odd one out (the sheet's NYC lists YYY, a Canadian code): within 1.5° of the median
  const median = (k) => all.map((p) => p[k]).sort((x, y) => x - y)[Math.floor(all.length / 2)];
  const mid = { lat: median('lat'), lng: median('lng') };
  const members = all.filter((p) => Math.abs(p.lat - mid.lat) <= 1.5 && Math.abs(p.lng - mid.lng) <= 1.5);
  const mean = (k) => members.reduce((s, p) => s + p[k], 0) / members.length;
  return { code, lat: mean('lat'), lng: mean('lng') };
}

const round = (n) => Math.round(n * 10000) / 10000;

/** The sheet's rows and the destinations left out (not placed). */
export function sheetRows(dests, airports, coords) {
  const rows = [];
  const missing = [];
  dests.forEach((d) => {
    const p = placeOf(d, airports, coords);
    if (!p) { missing.push(d.city); return; }
    rows.push({
      region: d.region, city: d.city, country: d.country, code: p.code, lat: String(round(p.lat)), lng: String(round(p.lng)), link: d.link, countryLink: d.countryLink,
    });
  });
  return { rows, missing };
}

/** DA's single-sheet JSON. */
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
  ['root', 'page', 'airports', 'ourairports', 'out'].forEach((k) => {
    if (!a[k]) { console.error(`--${k} is missing`); process.exit(2); }
  });
  const next = nextDataOf(fs.readFileSync(a.page, 'utf8'));
  const dests = destinationsOf(next, a.root);
  const recorded = JSON.parse(fs.readFileSync(a.airports, 'utf8'));
  const { rows, missing } = sheetRows(dests, recorded.entries || recorded, coordinatesOf(fs.readFileSync(a.ourairports, 'utf8')));
  fs.mkdirSync(path.dirname(a.out), { recursive: true });
  fs.writeFileSync(a.out, `${JSON.stringify(sheetOf(rows), null, 1)}\n`);
  console.log(`${a.root}: ${dests.length} destinations, ${rows.length} placed -> ${a.out}`);
  if (missing.length) console.log(`not placed: ${missing.join(', ')}`);
}
