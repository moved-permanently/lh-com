/**
 * Sheets and documents lh-edge reads itself from the origin (configuration sheets, nav and
 * footer documents): read past the edge cache and kept 60 s in the isolate, as the alias sheet.
 */
import { originFetch } from './edge.js';

const TTL_MS = 60000;
const cache = new Map();

/** For tests: forget everything read. */
export function resetSheetCache() {
  cache.clear();
}

/** The text of an origin path (null when it is not there), cached for a minute. */
export async function readOrigin(request, env, path) {
  const hit = cache.get(path);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;
  let value = null;
  try {
    const get = new Request(request.url, { method: 'GET' });
    const resp = await originFetch(get, env, new URL(path, `https://${env.ORIGIN}`), { edgeCache: false });
    value = resp.ok ? await resp.text() : null;
  } catch (e) {
    value = null;
  }
  cache.set(path, { at: Date.now(), value });
  return value;
}

/** The rows of a sheet (every sheet of a workbook: the default one), [] when it is missing. */
export async function readSheet(request, env, path) {
  const text = await readOrigin(request, env, path);
  if (!text) return [];
  try {
    const json = JSON.parse(text);
    return Array.isArray(json.data) ? json.data : [];
  } catch (e) {
    return [];
  }
}
