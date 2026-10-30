/**
 * The page's clock. Content chosen by time (the Message Center messages of the flash teaser and
 * the message center block, the homepage's stage promotion) reads now() instead of Date.now().
 *
 * Time travel (preview only): ?time-travel=2026-12-24T09:00 shows the page as it will look at
 * that moment. Without an offset the time is the market's local time (de Europe/Berlin, at
 * Europe/Vienna, gb Europe/London); an offset (2026-12-24T09:00+01:00, …Z) or
 * &time-zone=America/New_York sets another. Dates as the stage promotions read them work too
 * (2026-12-24, 24.12.2026 09:00). ?stage-time=… (the stage promotions' earlier parameter) is
 * read the same way. Only on preview hosts: *.aem.page (main and branch previews) and
 * localhost; on *.aem.live, the turnsthe.page hosts and every other host the parameters
 * are ignored and the page uses the real time. Without them nothing changes.
 *
 * What the page sends elsewhere (the form's page URL, share and copy links) goes through
 * outsideUrl(), which drops the time-travel parameters.
 */

import { LOCALE_TABLE } from './locale-table.js';

export const PARAM = 'time-travel';
export const ZONE_PARAM = 'time-zone';
const LEGACY_PARAM = 'stage-time';
const PARAMS = [PARAM, ZONE_PARAM, LEGACY_PARAM];

/** The time zone a time without an offset is read in, per market (the locale table). */
export const MARKET_TIME_ZONES = Object.fromEntries(Object.values(LOCALE_TABLE)
  .filter((row) => row.timeZone).map((row) => [row.country, row.timeZone]));
export const DEFAULT_TIME_ZONE = MARKET_TIME_ZONES.de;

// main and branch previews (…--lh-com--moved-permanently.aem.page), the local dev server
const PREVIEW_HOST = /^(localhost|127\.0\.0\.1)$|\.aem\.page$/;

/** Whether time travel may apply on a host (never on the live site or the replica hosts). */
export const isPreviewHost = (hostname) => PREVIEW_HOST.test(String(hostname || '').toLowerCase());

/** Whether a string is an IANA time zone this browser knows. */
export function isTimeZone(value) {
  if (!value) return false;
  try {
    Intl.DateTimeFormat('en-US', { timeZone: value });
    return true;
  } catch (e) {
    return false;
  }
}

/** Offset of a time zone at an instant, in ms (wall time in that zone minus UTC). */
export function zoneOffset(ts, timeZone) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(ts)).map((p) => [p.type, Number(p.value)]));
  const { year, month, day } = parts;
  return Date.UTC(year, month - 1, day, parts.hour, parts.minute, parts.second) - ts;
}

/**
 * Parses an authored time: "2026-11-27", "2026-11-27 18:00", "2026-11-27T18:00:00+01:00",
 * "27.11.2026" or "27.11.2026 18:00". Without an offset the time is local time in `timeZone`.
 * A date without a time is the start of that day, or with isEnd the end of that day.
 * @returns {number|null} ms since the epoch; null when empty; NaN when unreadable
 */
export function parseLocalTime(value, timeZone = DEFAULT_TIME_ZONE, isEnd = false) {
  const text = String(value || '').trim();
  if (!text) return null;
  let m = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?\s*(Z|[+-]\d{2}:?\d{2})?$/i);
  if (!m) {
    const de = text.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:,?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
    if (de) m = [de[0], de[3], de[2], de[1], de[4], de[5], de[6], undefined];
  }
  if (!m) return NaN;
  const [, y, mo, d, h, mi, s, offset] = m;
  const dateOnly = h === undefined;
  const day = Number(d) + (dateOnly && isEnd ? 1 : 0);
  const [hh, mm, ss] = [h, mi, s].map((v) => Number(v || 0));
  const wall = Date.UTC(Number(y), Number(mo) - 1, day, hh, mm, ss);
  if (offset) {
    if (/^z$/i.test(offset)) return wall;
    const [, sign, oh, om] = offset.match(/([+-])(\d{2}):?(\d{2})/);
    return wall - (sign === '-' ? -1 : 1) * (Number(oh) * 60 + Number(om)) * 60000;
  }
  // wall time in the zone: correct the guess twice (enough across a DST change)
  let ts = wall - zoneOffset(wall, timeZone);
  ts = wall - zoneOffset(ts, timeZone);
  return ts;
}

/** The market of a page path: /de/en/…, /content/de/en/… (dev server), /content/lh/markets/…. */
export function marketOf(pathname) {
  const m = String(pathname || '').replace(/^\/content(?=\/[a-z]{2}\/[a-z]{2}(\/|$))/, '')
    .replace(/^\/content\/lh\/markets(?=\/)/, '').match(/^\/([a-z]{2})\/[a-z]{2}(?:\/|$)/);
  return m ? m[1] : '';
}

/**
 * The time travel a location asks for: null when none applies (no parameter, or not a preview
 * host); else {value, timeZone, ts} with ts NaN when the value is unreadable.
 * @param {{hostname: string, search: string, pathname: string}} location
 */
export function readTimeTravel({ hostname, search, pathname } = {}) {
  if (!isPreviewHost(hostname)) return null;
  const params = new URLSearchParams(search || '');
  const value = (params.get(PARAM) ?? params.get(LEGACY_PARAM) ?? '').trim();
  if (!value) return null;
  const asked = (params.get(ZONE_PARAM) || '').trim();
  const market = MARKET_TIME_ZONES[marketOf(pathname)] || DEFAULT_TIME_ZONE;
  const timeZone = isTimeZone(asked) ? asked : market;
  const ts = parseLocalTime(value, timeZone);
  return { value, timeZone, ts: Number.isFinite(ts) ? ts : NaN };
}

let state;

/** Sets the clock from a location (the page's, by default); returns the time travel or null. */
export function initClock(location = (typeof window !== 'undefined' ? window.location : undefined)) {
  state = location ? readTimeTravel(location) : null;
  return state;
}

/** The time travel of the page (null without one). */
export function timeTravel() {
  if (state === undefined) initClock();
  return state;
}

/** The page's now in ms since the epoch: the time travelled to, else the real time. */
export function now() {
  const t = timeTravel();
  return t && Number.isFinite(t.ts) ? t.ts : Date.now();
}

/** A URL without the time-travel parameters, for what the page sends elsewhere. */
export function outsideUrl(href) {
  try {
    const url = new URL(href);
    PARAMS.forEach((p) => url.searchParams.delete(p));
    return url.href;
  } catch (e) {
    return href;
  }
}

/** "24 Dec 2026, 09:00 (Europe/Berlin, UTC+01:00)": a time in a zone, for the bar. */
export function formatInZone(ts, timeZone) {
  const text = new Intl.DateTimeFormat('en-GB', {
    timeZone, day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(new Date(ts));
  const offset = Math.round(zoneOffset(ts, timeZone) / 60000);
  const abs = Math.abs(offset);
  const utc = `UTC${offset < 0 ? '-' : '+'}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
  return `${text} (${timeZone}, ${utc})`;
}

/**
 * The time-travel bar (only while time travel is on): the chosen time, the market's time zone
 * and a link back to now. Outside main and every form, marked data-nosnippet; it holds no form
 * fields and is never sent anywhere.
 */
export function showTimeTravelBar(doc = document, href = window.location.href) {
  const t = timeTravel();
  if (!t || doc.querySelector('.time-travel-bar')) return null;
  const bar = doc.createElement('aside');
  bar.className = 'time-travel-bar';
  bar.setAttribute('role', 'status');
  bar.setAttribute('aria-label', 'Time travel');
  bar.dataset.nosnippet = '';
  const text = doc.createElement('span');
  text.textContent = Number.isFinite(t.ts)
    ? `Time travel: the page shows ${formatInZone(t.ts, t.timeZone)}.`
    : `Time travel: "${t.value}" is not a time this page can read (e.g. 2026-12-24T09:00 or 2026-12-24T09:00+01:00); it shows now.`;
  const back = doc.createElement('a');
  back.href = outsideUrl(href);
  back.textContent = 'Back to now';
  bar.append(text, ' ', back);
  doc.body.append(bar);
  return bar;
}
