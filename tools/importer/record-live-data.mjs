/* eslint-disable no-console, import/extensions */
/**
 * Records lufthansa.com API responses into data/recorded/ for the widget fallback.
 *
 * Reads, from the source export (default tools/source-export):
 *   har/**\/*.har       browser HAR captures of the market pages (flight search typed into,
 *                       calendar and passengers opened, fare teasers and destination finder loaded)
 *   api/**\/*.ndjson    one JSON object per line: {locale, method, url, body?, status, text}
 * The locale of a HAR entry comes from its Referer (/{country}/{lang}/...), else from a
 * folder named like de-en, de_en or de/en in the file path.
 *
 * Usage: node tools/importer/record-live-data.mjs [--src tools/source-export] [--out data/recorded]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requestKey, fnv1a } from '../../scripts/lh-data.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => (
  a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]]] : acc), []));
const src = path.resolve(root, args.src || 'tools/source-export');
const out = path.resolve(root, args.out || 'data/recorded');

const LOCALES = ['de/en', 'de/de', 'at/de', 'gb/en'];
// same routes as the lh-proxy allowlist
const RECORDABLE = /^\/(service\/api\/(suggestions|catalogs|defaultAirport|labels|lhg-fare-teaser|destinationfinder)|aircore\/(weather|geolocation))(\/|$)/;

function walk(dir, ext) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return walk(p, ext);
    return p.endsWith(ext) ? [p] : [];
  });
}

function localeFrom(referer, file) {
  const m = (referer || '').match(/lufthansa\.com\/(?:lhg\/)?([a-z]{2})\/([a-z]{2})\//);
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
    const referer = request.headers.find((h) => h.name.toLowerCase() === 'referer')?.value;
    let text = response.content?.text;
    if (text && response.content.encoding === 'base64') text = Buffer.from(text, 'base64').toString('utf8');
    records.push({
      locale: localeFrom(referer, path.relative(src, file)),
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

fs.mkdirSync(out, { recursive: true });
const indexFile = path.join(out, 'index.json');
const index = fs.existsSync(indexFile) ? JSON.parse(fs.readFileSync(indexFile, 'utf8')) : { entries: {} };
const skipped = { status: 0, json: 0, locale: 0 };

records.forEach((r) => {
  if (!r.locale) { skipped.locale += 1; return; }
  if (r.status !== 200 || !r.text) { skipped.status += 1; return; }
  let data;
  try { data = JSON.parse(r.text); } catch (e) { skipped.json += 1; return; }
  const key = requestKey(r.method, r.route, r.body);
  const file = `${r.locale.replace('/', '-')}-${fnv1a(key)}.json`;
  fs.writeFileSync(path.join(out, file), `${JSON.stringify(data)}\n`);
  index.entries[`${r.locale}|${key}`] = { file, recordedAt: r.recordedAt || new Date().toISOString() };
});

index.updatedAt = new Date().toISOString();
fs.writeFileSync(indexFile, `${JSON.stringify(index, null, 1)}\n`);
const perLocale = LOCALES.map((l) => `${l}: ${Object.keys(index.entries).filter((k) => k.startsWith(`${l}|`)).length}`);
console.log(`recorded ${records.length} responses read; index now ${Object.keys(index.entries).length} entries (${perLocale.join(', ')}); skipped ${JSON.stringify(skipped)}`);
