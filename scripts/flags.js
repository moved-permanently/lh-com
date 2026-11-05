/**
 * Site flags: the site's sheet /config/flags (DA), published as /config/flags.json, columns
 * flag | value. A flag is on only when its row's value is "on" (names and values trimmed, any
 * case); a missing sheet, a missing row, any other value, a failed fetch or one slower than
 * TIMEOUT: off. The sheet is read once per page, by the first caller, and shared; nothing that
 * renders the page waits for it (the embeds behind a flag show their link to www until it answers).
 * demo-badge reads its row the other way round: on unless off or false (scripts/demo-badge.js).
 */
const FLAGS_URL = '/config/flags.json';
const TIMEOUT = 3000;

let flags = null;

async function readFlags(timeout) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const resp = await fetch(FLAGS_URL, { signal: controller.signal });
    if (!resp.ok) return new Map();
    const json = await resp.json();
    const rows = Array.isArray(json && json.data) ? json.data : [];
    return new Map(rows
      .filter((row) => row && row.flag)
      .map((row) => [String(row.flag).trim().toLowerCase(), String(row.value || '').trim().toLowerCase()]));
  } catch (e) {
    return new Map();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * The site's flags (name -> value), read once per page.
 * @param {{timeout?: number}} [options]
 * @returns {Promise<Map<string, string>>}
 */
export function loadFlags({ timeout = TIMEOUT } = {}) {
  if (!flags) flags = readFlags(timeout);
  return flags;
}

/**
 * Whether a site flag is on (its row's value is "on").
 * @param {string} name e.g. 'live-chat'
 * @returns {Promise<boolean>}
 */
export async function isFlagOn(name) {
  return (await loadFlags()).get(String(name).trim().toLowerCase()) === 'on';
}

/** Forgets the page's flags (tests). */
export function resetFlags() {
  flags = null;
}
