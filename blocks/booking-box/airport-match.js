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
const words = (s) => fold(s).split(/[^a-z0-9]+/).filter(Boolean);
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

/**
 * TAP's score of an airport for a typed term: its rules in its order, the first that matches
 * (0: no match).
 */
export function scoreAirport(a, term) {
  const t = fold(term);
  if (!t || !a) return 0;
  const city = fold(a.cityName);
  const cityCountry = fold(`${a.cityName}, ${a.countryName}`);
  const airport = fold(a.airportName);
  const country = fold(a.countryName);
  const ends = (s) => Boolean(s) && (s.startsWith(t) || s.endsWith(t));
  const rules = [
    [cityCountry === t, 1],
    [airport === t, 0.92],
    [city === t, 0.8],
    [t.length === 3 && fold(a.code) === t, 0.79],
    [country === t, 0.72],
    [fold(a.country) === t, 0.71],
    [words(a.cityName).includes(t), 0.8],
    [words(`${a.cityName}, ${a.countryName}`).includes(t), 0.78],
    [words(a.airportName).includes(t), 0.75],
    [words(a.countryName).includes(t), 0.7],
    [ends(city), 0.7],
    [ends(cityCountry), 0.68],
    [ends(airport), 0.65],
    [ends(country), 0.5],
    [country.includes(t), 0.1],
  ];
  const first = rules.find(([hit]) => hit);
  return first ? first[1] : 0;
}

/**
 * The suggestions for a term: highest score first, equal scores by city name, at most 30; an
 * empty term the list's first 30.
 */
export function matchAirports(list, term, limit = MAX_SUGGESTIONS) {
  if (!fold(term)) return list.slice(0, limit);
  return list.map((a, i) => ({ a, i, s: scoreAirport(a, term) }))
    .filter((x) => x.s > 0)
    .sort((x, y) => y.s - x.s || fold(x.a.cityName).localeCompare(fold(y.a.cityName)) || x.i - y.i)
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
