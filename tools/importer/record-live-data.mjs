/* eslint-disable no-console, import/extensions */
/**
 * Records lufthansa.com API responses into data/recorded/ for the widget fallback.
 *
 * Reads, from the source export (default tools/source-export):
 *   har/**\/*.har       browser HAR captures of the market pages (flight search typed into,
 *                       calendar and passengers opened, fare teasers and destination finder loaded)
 *   api/**\/*.ndjson    one JSON object per line: {locale, method, url, body?, status, text,
 *                       portal?}
 * The locale of a HAR entry comes from its Referer (/{country}/{lang}/...), else from a
 * folder named like de-en, de_en or de/en in the file path.
 * A brand's answer (a HAR request's X-Portal header or the line's portal, other than LH, e.g. OS)
 * is indexed under its portal, "OS:at/de|GET ...", file os-at-de-<hash>.json: lh-data.js gives
 * it to that brand's pages only (lh-com's answers stay "at/de|GET ...").
 *
 * Usage: node tools/importer/record-live-data.mjs [--src tools/source-export] [--out data/recorded]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requestKey, fnv1a } from '../../scripts/lh-data.js';
import { LIVE_ROOTS } from '../../scripts/locale.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => (
  a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]]] : acc), []));
const src = path.resolve(root, args.src || 'tools/source-export');
const out = path.resolve(root, args.out || 'data/recorded');

const LOCALES = LIVE_ROOTS;
// the lh-proxy allowlist plus the recorded-only route of the poi-map block
// (/service/secured/api/pointsOfInterest, recorded in-page by bd-record-api.mjs --set poi)
const RECORDABLE = /^\/(service\/api\/(suggestions|catalogs|defaultAirport|labels|lhg-fare-teaser|destinationfinder)|service\/secured\/api\/pointsOfInterest)(\/|$)/;

function walk(dir, ext) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return walk(p, ext);
    return p.endsWith(ext) ? [p] : [];
  });
}

function localeFrom(referer, file) {
  const m = (referer || '').match(/lufthansa\.com\/([a-z]{2})\/([a-z]{2})\//);
  if (m && LOCALES.includes(`${m[1]}/${m[2]}`)) return `${m[1]}/${m[2]}`;
  const f = file.replace(/\\/g, '/').match(/(?:^|\/)([a-z]{2})[-_/]([a-z]{2})(?:\/|$)/);
  if (f && LOCALES.includes(`${f[1]}/${f[2]}`)) return `${f[1]}/${f[2]}`;
  return null;
}

const records = [];

walk(path.join(src, 'har'), '.har').forEach((file) => {
  const har = JSON.parse(fs.readFileSync(file, 'utf8'));
  (har.log?.entries || []).forEach(({ request, response, startedDateTime }) => {
    const url = new URL(request.url);
    if (!/(^|\.)lufthansa\.com$/.test(url.hostname) || !RECORDABLE.test(url.pathname)) return;
    const header = (name) => request.headers.find((h) => h.name.toLowerCase() === name)?.value;
    const referer = header('referer');
    let text = response.content?.text;
    if (text && response.content.encoding === 'base64') text = Buffer.from(text, 'base64').toString('utf8');
    records.push({
      locale: localeFrom(referer, path.relative(src, file)),
      portal: header('x-portal'),
      method: request.method,
      route: `${url.pathname}${url.search}`,
      body: request.postData?.text,
      status: response.status,
      text,
      recordedAt: startedDateTime,
      from: path.relative(root, file),
    });
  });
});

walk(path.join(src, 'api'), '.ndjson').forEach((file) => {
  fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).forEach((line) => {
    const r = JSON.parse(line);
    const url = new URL(r.url, 'https://www.lufthansa.com');
    if (!RECORDABLE.test(url.pathname)) return;
    records.push({
      locale: r.locale || localeFrom(r.referer, path.relative(src, file)),
      portal: r.portal,
      method: r.method || 'GET',
      route: `${url.pathname}${url.search}`,
      body: r.body,
      status: r.status,
      text: r.text,
      recordedAt: r.recordedAt,
      from: path.relative(root, file),
    });
  });
});

// The index is rebuilt from the sources on every run: they are the complete record, and a
// change of requestKey() (e.g. a newly ignored volatile field) must not leave stale keys.
fs.mkdirSync(out, { recursive: true });
const indexFile = path.join(out, 'index.json');
const previous = fs.existsSync(indexFile) ? JSON.parse(fs.readFileSync(indexFile, 'utf8')).entries || {} : {};
const index = { entries: {} };
const skipped = {
  status: 0, json: 0, locale: 0, duplicate: 0,
};

records.forEach((r) => {
  if (!r.locale) { skipped.locale += 1; return; }
  if (r.status !== 200 || !r.text) { skipped.status += 1; return; }
  let data;
  try { data = JSON.parse(r.text); } catch (e) { skipped.json += 1; return; }
  const key = requestKey(r.method, r.route, r.body);
  const portal = /^[A-Za-z0-9_]{1,16}$/.test(r.portal || '') && r.portal.toUpperCase() !== 'LH'
    ? r.portal.toUpperCase() : '';
  const entry = `${portal ? `${portal}:` : ''}${r.locale}|${key}`;
  // first answer wins: later calls of the same request come from a session already changed by
  // the capture (e.g. catalogs/airportnames lists the airports searched for so far)
  if (index.entries[entry]) { skipped.duplicate += 1; return; }
  const file = `${portal ? `${portal.toLowerCase()}-` : ''}${r.locale.replace('/', '-')}-${fnv1a(key)}.json`;
  fs.writeFileSync(path.join(out, file), `${JSON.stringify(data)}\n`);
  // ndjson lines carry no time: keep the time of the run that first recorded them
  const recordedAt = r.recordedAt || previous[entry]?.recordedAt || new Date().toISOString();
  index.entries[entry] = { file, recordedAt };
});

// recordings no longer referenced (their request key changed) are removed
const referenced = new Set(Object.values(index.entries).map((e) => e.file));
const removed = fs.readdirSync(out)
  .filter((f) => /^(?:[a-z0-9_]{1,16}-)?[a-z]{2}-[a-z]{2}-[0-9a-f]{8}\.json$/.test(f) && !referenced.has(f));
removed.forEach((f) => fs.unlinkSync(path.join(out, f)));

index.updatedAt = new Date().toISOString();
fs.writeFileSync(indexFile, `${JSON.stringify(index, null, 1)}\n`);
const perLocale = LOCALES.map((l) => `${l}: ${Object.keys(index.entries).filter((k) => k.startsWith(`${l}|`)).length}`);
console.log(`recorded ${records.length} responses read; index now ${Object.keys(index.entries).length} entries (${perLocale.join(', ')}); removed ${removed.length} stale files; skipped ${JSON.stringify(skipped)}`);
