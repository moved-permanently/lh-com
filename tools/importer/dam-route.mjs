/**
 * Where lh-edge serves a /content/dam file from, by its answer's x-lh-edge-route: dam (the DA
 * copies), dam-media (R2; those copies are gone), dam-aem (the AEM publish tier: the videos over
 * 36 MB and the subtitles, lh-edge's src/dam-aem.js). Anything else (dam-aem-unavailable, a 404,
 * no route) is missing.
 */
const PLACES = { dam: 'da', 'dam-media': 'r2', 'dam-aem': 'aem' };

/** The place of a file: 'da', 'r2', 'aem' or 'missing (<status>)'. */
export function placeOf(ok, route, status = 200) {
  return (ok && PLACES[route]) || `missing (${status})`;
}

/** Whether a place serves the file. */
export const served = (place) => Object.values(PLACES).includes(place);
