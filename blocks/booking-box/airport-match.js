/**
 * booking-box's airports (tools/reports/tap/booking-spec.md 5.3, 2.3): the per-root airport
 * sheet (/<root>/booking/airports.json: code, city, cityName, airportName, country, countryName,
 * tapRoute, railway) and TAP's matching (www.flytap.com's own scores). Pure functions:
 * test/booking-box-tap.test.mjs.
 */

/** At most this many suggestions (www: 30). */
export const MAX_SUGGESTIONS = 30;

/** Lower case, accents folded, trimmed. */
export const fold = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .trim();
const flag = (v) => v === true || /^(true|1|yes|x)$/i.test(String(v || '').trim());

/** The sheet's rows (a sheet, a workbook's "data" sheet) as airports; no code: left out. */
export function airportsFromSheet(json) {
  if (!json) return [];
  const rows = Array.isArray(json.data) ? json.data : (json.data && json.data.data) || [];
  return rows.filter((r) => r && String(r.code || '').trim()).map((r) => ({
    code: String(r.code).trim().toUpperCase(),
    city: String(r.city || r.code).trim().toUpperCase(),
    cityName: String(r.cityName || '').trim(),
    airportName: String(r.airportName || '').trim(),
    country: String(r.country || '').trim().toUpperCase(),
    countryName: String(r.countryName || '').trim(),
    tapRoute: flag(r.tapRoute),
    railway: flag(r.railway),
  }));
}

/** www's accent folding (Oo: NFD, the marks out); no lower case, no trim of its own. */
const strip = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/**
 * TAP's score of an airport for a typed term, as www.flytap.com's booking widget scores it (its
 * _app chunk, brief 368): the term lower-cased and folded (not trimmed), the names folded,
 * "city, country" lower-cased only; its rules in its order, the first that matches (0: none).
 */
export function scoreAirport(a, term) {
  const r = strip(String(term || '').toLowerCase());
  if (!r || !a) return 0;
  const l = strip(String(a.airportName || '').toLowerCase());
  const c = strip(String(a.cityName || '').toLowerCase());
  const u = strip(String(a.countryName || '').toLowerCase());
  const g = `${a.cityName}, ${a.countryName}`.toLowerCase();
  const d = (s) => s.startsWith(r) || s.endsWith(r) || s.includes(` ${r} `);
  const f = (s) => s.startsWith(`${r} `) || s.endsWith(` ${r}`) || s.includes(` ${r} `);
  const rules = [
    [() => g === r, 1],
    [() => r.length === 3 && String(a.code || '').toLowerCase() === r, 0.79],
    [() => l === r, 0.92],
    [() => c === r, 0.8],
    [() => u === r, 0.72],
    [() => String(a.country || '').toLowerCase() === r, 0.71],
    [() => f(c), 0.8],
    [() => f(g), 0.78],
    [() => f(l), 0.75],
    [() => f(u) || d(c), 0.7],
    [() => d(g), 0.68],
    [() => d(l), 0.65],
    [() => d(u), 0.5],
    [() => u.includes(r), 0.1],
  ];
  const first = rules.find(([hit]) => hit());
  return first ? first[1] : 0;
}

/**
 * The suggestions for a term as www's: highest score first, equal scores by "city, city" as
 * plain strings (else the list's order), at most 30; an empty term the list's first 30.
 */
export function matchAirports(list, term, limit = MAX_SUGGESTIONS) {
  if (!term) return list.slice(0, limit);
  const key = (a) => `${a.cityName}, ${a.cityName}`;
  return list.map((a, i) => ({ a, i, s: scoreAirport(a, term) }))
    .filter((x) => x.s > 0)
    .sort((x, y) => {
      if (x.s !== y.s) return y.s - x.s;
      if (key(x.a) !== key(y.a)) return key(x.a) > key(y.a) ? 1 : -1;
      return x.i - y.i;
    })
    .slice(0, limit)
    .map((x) => x.a);
}

/** The field's text: "City, Country" (before the sheet: the code). */
export function fieldText(a) {
  if (!a || !a.code) return '';
  if (!a.cityName) return a.code;
  return a.countryName ? `${a.cityName}, ${a.countryName}` : a.cityName;
}

/** A suggestion's texts: "City, Airport" and the country under it. */
export function optionText(a) {
  const name = a.airportName ? `${a.cityName}, ${a.airportName}` : a.cityName || a.code;
  return { name, country: a.countryName || '' };
}

/**
 * The term to match: the field's own text for its chosen airport is that airport's code (www, on
 * focus: Lisboa, Portugal lists LIS, Florianópolis, Indianápolis), else what was typed.
 */
export function searchTerm(term, chosen) {
  return chosen && chosen.code && term === fieldText(chosen) ? chosen.code : term;
}
