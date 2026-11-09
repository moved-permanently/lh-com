/**
 * lufthansa.com's lounge finder data on our hosts (brief 539). www's lounge API (labels,
 * the cities catalog, the search catalogs/lounges/{status}/{city}) refuses cross-origin calls
 * from our hosts and a Worker alike, so on the demo hosts (scripts/demo.js) the finder reads www's
 * own recorded answers from /data/lounges instead, never calling www at runtime:
 *   cities-<ll>.json, labels-<ll>.json   GET catalogs/lounges/cities, labels/loungefinder/lh/<ll>
 *   <ll>/<STATUS>/<CITY>.json            GET catalogs/lounges/<STATUS>/<CITY> (non-empty answers)
 *   manifest.json                        the recorded answers: { lounges: { <ll>: { <STATUS>:
 *                                        { <CITY>: count } } }, recordedAt, archives }
 * Recorded languages: de and en (www's other languages only differ in two text fields of an
 * answer); every other page language reads en. A recorded empty answer has no file: the
 * manifest's 0. tools/lounges/build-lounge-data.mjs writes the folder from the capture child's
 * archives (lh-lounges-api-NNN); a refresh is a new run and a commit.
 */

export const LOUNGE_DATA_BASE = '/data/lounges';
const LANGUAGES = ['en', 'de'];
const ROUTE = /^\/service\/api\/(?:labels\/loungefinder\/lh\/([a-z]{2})|catalogs\/lounges\/(cities)|catalogs\/lounges\/([A-Z]{3})\/([A-Z0-9]{3}))$/;

/** The recorded language for a page language: de or en. */
export const loungeLanguage = (lang) => (LANGUAGES.includes(String(lang || '').toLowerCase()) ? String(lang).toLowerCase() : 'en');

/** Whether a route is one of the finder's three (labels, cities, search). */
export function isLoungeRoute(route) {
  return ROUTE.test(String(route || '').replace(/[?#].*$/, ''));
}

let manifest;
const readJson = async (file) => {
  const resp = await fetch(`${LOUNGE_DATA_BASE}/${file}`);
  if (!resp.ok) throw new Error(`lounge data missing: ${file} (${resp.status})`);
  return resp.json();
};
const loadManifest = () => {
  if (!manifest) manifest = readJson('manifest.json').catch(() => ({ lounges: {} }));
  return manifest;
};

/** Test hook: forget the manifest read. */
export function resetLoungeData() {
  manifest = undefined;
}

/**
 * The recorded answer of a lounge route, as lhFetch answers ({ data, source, via }); null for
 * another route. A search for a status and city that was never recorded throws (no data).
 * @param {string} route e.g. /service/api/catalogs/lounges/BUS/FRA
 * @param {string} market the page's locale key (de/de, fr/fr …): its language picks de or en
 */
export async function loungeAnswer(route, market) {
  const m = String(route || '').replace(/[?#].*$/, '').match(ROUTE);
  if (!m) return null;
  const [, labelsLang, cities, status, city] = m;
  const pageLang = loungeLanguage(String(market || '').split('/')[1]);
  const answer = (data) => ({ data, source: 'recorded', via: 'lounge-data' });
  if (labelsLang) return answer(await readJson(`labels-${loungeLanguage(labelsLang)}.json`));
  if (cities) return answer(await readJson(`cities-${pageLang}.json`));
  const { lounges = {} } = await loadManifest();
  const lang = [pageLang, 'en'].find((l) => lounges[l] && lounges[l][status] && city in lounges[l][status]);
  if (!lang) throw new Error(`no recorded lounges for ${status}/${city}`);
  if (!lounges[lang][status][city]) return answer({ lounges: [] });
  return answer(await readJson(`${lang}/${status}/${city}.json`));
}
