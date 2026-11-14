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
/** A patient reader's second read (isFlagOn's patient option): up to 15 s. */
const PATIENT_TIMEOUT = 15000;

let flags = null;
let patientFlags = null;

async function readFlags(timeout) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const resp = await fetch(FLAGS_URL, { signal: controller.signal });
    // the sheet answered: final (a missing sheet is no flag on)
    if (!resp.ok) return new Map();
    const json = await resp.json();
    const rows = Array.isArray(json && json.data) ? json.data : [];
    return new Map(rows
      .filter((row) => row && row.flag)
      .map((row) => [String(row.flag).trim().toLowerCase(), String(row.value || '').trim().toLowerCase()]));
  } catch (e) {
    // too slow or no answer on the network: off, but a patient reader may read again
    const none = new Map();
    none.unsettled = !(e instanceof SyntaxError);
    return none;
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
 * Whether a site flag is on (its row's value is "on"). patient (live prices, standing order 23):
 * when the page's read timed out or failed on the network, the flag is read once more, waiting up
 * to PATIENT_TIMEOUT, so a slow sheet on a working site does not switch it off; a sheet that
 * answered (404, no row, "off") is final, and so is a second read that fails too.
 * @param {string} name e.g. 'live-chat'
 * @param {{patient?: boolean}} [options]
 * @returns {Promise<boolean>}
 */
export async function isFlagOn(name, { patient = false } = {}) {
  const key = String(name).trim().toLowerCase();
  let read = await loadFlags();
  if (patient && read.unsettled) {
    if (!patientFlags) patientFlags = readFlags(PATIENT_TIMEOUT);
    read = await patientFlags;
  }
  return read.get(key) === 'on';
}

/** Forgets the page's flags (tests). */
export function resetFlags() {
  flags = null;
  patientFlags = null;
}
