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
 *          --airports <runs/airports/en-pt.json | the root's booking/airports.json sheet>
 *          --ourairports <airports.csv> --out <sheet.json> [--also <the other languages' sheets, a,b>]
 *          [--known <another version's destinations sheet: its codes first>]
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
  'santo tome': 'TMS',
  'ciudad de luxemburgo': 'LUX',
  reikiavik: 'KEF',
  marrakesch: 'RAK',
  oporto: 'OPO',
  porto: 'OPO',
  mailand: 'MIL',
  'lussemburgo citta': 'LUX',
  minorca: 'MAH',
  'monaco di baviera': 'MUC',
  'nowego jorku': 'NYC',
  kurytyby: 'CWB',
  ateny: 'ATH',
  kopenhaga: 'CPH',
  florencja: 'FLR',
  marsylia: 'MRS',
  mediolan: 'MIL',
  sewilla: 'SVQ',
  teneryfa: 'TCI',
  zurych: 'ZRH',
  amesterda: 'AMS',
  madri: 'MAD',
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
 * A paragraph's leaves in order: each text with the link it sits in ('' outside a link) and
 * whether it starts a new node (a span or link of the paragraph's own).
 */
function leavesOf(para) {
  const out = [];
  const walk = (node, href, fresh) => {
    if (node.nodeType === 'text') {
      out.push({ text: node.value || '', href, fresh });
      return;
    }
    if (node.nodeType === 'line-break') {
      out.push({ text: '', href, fresh, lineBreak: true });
      return;
    }
    const own = node.nodeType === 'link' ? ((node.data && node.data.href) || '') : href;
    (node.content || []).forEach((c, i) => walk(c, own, fresh && i === 0));
  };
  (para.content || []).forEach((c) => walk(c, '', true));
  return out;
}

/**
 * A paragraph's destinations: "City | Country", the names linked or not, sometimes two in one
 * paragraph (pl-pl's "Ateny | Grecja", line breaks, "Barcelona | Hiszpanii"): a line break, or a
 * new node after the country, starts the next city.
 * @param {Object} para
 * @returns {Array<{city: string, country: string, link: string, countryLink: string}>}
 */
export function paragraphDestinations(para) {
  const out = [];
  let cur = null;
  let side = 'city';
  const start = () => {
    cur = {
      city: '', country: '', link: '', countryLink: '',
    };
    out.push(cur);
    side = 'city';
  };
  leavesOf(para).forEach((leaf) => {
    // a line break ends a destination
    if (leaf.lineBreak) {
      if (cur && cur.city.trim()) cur = null;
      return;
    }
    const parts = leaf.text.split('|');
    parts.forEach((part, i) => {
      if (i > 0) side = 'country';
      else if (!cur || (side === 'country' && cur.country.trim() && leaf.fresh && part.trim())) start();
      if (!part.trim()) return;
      cur[side] += part;
      const key = side === 'city' ? 'link' : 'countryLink';
      if (leaf.href && !cur[key]) cur[key] = leaf.href;
    });
  });
  return out.map((d) => ({
    ...d, city: d.city.replace(/\s+/g, ' ').trim(), country: d.country.replace(/\s+/g, ' ').trim(),
  })).filter((d) => d.city);
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
      paragraphDestinations(para).forEach((d) => out.push({
        region,
        city: d.city,
        country: d.country,
        link: marketLink(d.link, root),
        countryLink: marketLink(d.countryLink, root),
      }));
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

/** A flights link's place name: "flights-to-new-york", "loty-do-nowy-jork" -> "new york". */
export function slugName(href) {
  const last = String(href || '').split(/[?#]/)[0].split('/').filter(Boolean).pop() || '';
  const m = last.match(/^(?:flights-to|voos-para|vuelos-a|vols-pour|vols-vers|fluge-nach|fluege-nach|flug-nach|voli-per|voli-a|loty-do)-(.+)$/);
  return m ? m[1].replace(/-/g, ' ') : '';
}

/** A city code from one airport sheet: the name (in the country first), else a longer name. */
function codeIn(airports, name, { country = '', countryCode = '', known = null } = {}) {
  if (!name) return '';
  const hits = airports.filter((e) => fold(e.cityName) === name);
  // the same name in the destination's country first (Boa Vista: Cape Verde's, not Brazil's) ...
  const inCountry = airports.filter((e) => (country && fold(e.countryName) === country)
    || (countryCode && e.country === countryCode));
  // ... or a longer name there holding it ("Boa Vista Island", "Ilha Da Boa Vista")
  const ranked = [
    ...hits.filter((e) => inCountry.includes(e)),
    ...inCountry.filter((e) => ` ${fold(e.cityName)} `.includes(` ${name} `)),
    ...(countryCode ? [] : hits),
    // a longer name anywhere, for a code another version placed (de-de's "Boa Vista")
    ...(known ? airports.filter((e) => known.has(e.city || e.airport) && ` ${fold(e.cityName)} `.includes(` ${name} `)) : []),
  ];
  // a code another language version already placed first (es-es' "Santa Maria": the Azores', not
  // Brazil's; it-it's "Manchester": England's, not New Hampshire's)
  const codeOf = (e) => e.city || e.airport;
  const pool = known ? [...ranked.filter((e) => known.has(codeOf(e))), ...ranked] : ranked;
  const best = pool.find((e) => e.tapRoute && (!known || known.has(codeOf(e)))) || pool.find((e) => e.tapRoute) || pool[0];
  return best ? codeOf(best) : '';
}

/**
 * Places a destination: its airport code and coordinates (city codes as the mean of their
 * airports' positions), or null. The name in the root's sheet, then in the other languages'
 * sheets (within the country the root's sheet gives the country's name), then the name in its
 * flights link (pl-pl's "Nowego Jorku" links to loty-do-nowy-jork), then PLACES.
 * @param {{city: string, country?: string, link?: string}} dest
 * @param {Array} airports the root's entries ({airport, city, cityName, country, countryName,
 *   tapRoute})
 * @param {Map} coords IATA -> {lat, lng}
 * @param {Array<Array>} [others] the other languages' entries
 * @param {Set<string>} [known] codes another version's sheet has (en-pt's): preferred
 */
export function placeOf(dest, airports, coords, others = [], known = null) {
  const name = fold(dest.city);
  const country = fold(dest.country);
  const own = airports.find((e) => country && fold(e.countryName) === country);
  const countryCode = own ? own.country : '';
  const slug = fold(slugName(dest.link));
  const lookups = [
    () => PLACES[name],
    () => codeIn(airports, name, { country, known }),
    ...others.map((list) => () => codeIn(list, name, { countryCode, known })),
    () => codeIn(airports, slug, { country, known }),
    ...others.map((list) => () => codeIn(list, slug, { countryCode, known })),
    () => PLACES[slug],
  ];
  // the first code another version placed too (known), else the first code found
  let code = '';
  let first = '';
  lookups.some((f) => {
    const c = f() || '';
    if (c && !first) first = c;
    if (c && (!known || known.has(c))) code = c;
    return code;
  });
  code = code || first;
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
export function sheetRows(dests, airports, coords, others = [], known = null) {
  const rows = [];
  const missing = [];
  const seen = new Set();
  dests.forEach((d) => {
    // the same destination twice (it-it's list has Belém twice): once
    const key = `${d.city}|${d.link}`;
    if (seen.has(key)) return;
    seen.add(key);
    const p = placeOf(d, airports, coords, others, known);
    if (!p) { missing.push(d.city); return; }
    rows.push({
      region: d.region, city: d.city, country: d.country, code: p.code, lat: String(round(p.lat)), lng: String(round(p.lng)), link: d.link, countryLink: d.countryLink,
    });
  });
  return { rows, missing };
}

/**
 * The airport entries as placeOf reads them, from a recorded answer (entries: airport, isRailway,
 * tapRoute as booleans) or from a root's DA sheet (/<root>/booking/airports.json: code, railway,
 * tapRoute as "true" / "false").
 * @param {Object|Array} json
 */
export function airportsOf(json) {
  const list = Array.isArray(json) ? json : (json.entries || json.data || []);
  const yes = (v) => v === true || v === 'true';
  return list.map((e) => ({
    ...e,
    airport: e.airport || e.code,
    tapRoute: yes(e.tapRoute),
    isRailway: yes(e.isRailway) || yes(e.railway),
  }));
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
  const read = (f) => airportsOf(JSON.parse(fs.readFileSync(f, 'utf8')));
  const others = (a.also || '').split(',').filter(Boolean).map(read);
  const known = a.known ? new Set(JSON.parse(fs.readFileSync(a.known, 'utf8')).data.map((r) => r.code)) : null;
  const { rows, missing } = sheetRows(dests, read(a.airports), coordinatesOf(fs.readFileSync(a.ourairports, 'utf8')), others, known);
  fs.mkdirSync(path.dirname(a.out), { recursive: true });
  fs.writeFileSync(a.out, `${JSON.stringify(sheetOf(rows), null, 1)}\n`);
  console.log(`${a.root}: ${dests.length} destinations, ${rows.length} placed -> ${a.out}`);
  if (missing.length) console.log(`not placed: ${missing.join(', ')}`);
}
