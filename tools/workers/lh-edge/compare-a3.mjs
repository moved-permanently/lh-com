/* eslint-disable no-console, max-len -- dev tooling */
/**
 * AMS rest A3 on an lh-edge host: the two fragment catalogs against www's recordings (order
 * aside), `.aircraft.json` for a page of each locale, `/service-worker.js` byte for byte with
 * www's headers. Usage: node tools/workers/lh-edge/compare-a3.mjs --host https://lhedge.bbird.live
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const AMS = path.join(root, 'tools/source-export/feeds/ams-rest');
const argv = process.argv.slice(2);
const HOST = (argv.includes('--host') ? argv[argv.indexOf('--host') + 1] : 'https://lhedge.bbird.live').replace(/\/$/, '');
// strings trimmed: www keeps trailing spaces in some titles ("cash-miles "), Edge Delivery's
// metadata does not (counted as normalised)
let trimmed = 0;
const sorted = (v) => {
  if (Array.isArray(v)) return v.map(sorted).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)).map(([k, x]) => [k, sorted(x)]));
  if (typeof v === 'string' && v !== v.trim()) { trimmed += 1; return v.trim(); }
  return v;
};

const lines = [];
const check = (name, ok, detail = '') => { lines.push(`${ok ? 'OK  ' : 'DIFF'} ${name}${detail ? `: ${detail}` : ''}`); };
const catalogs = {
  '/content/experience-fragments/lh/markets/de.csi-xf.json': 'selectors/csi-xf-markets-de.json',
  '/content/experience-fragments/lh/gc/en.csi-xf.json': 'selectors/csi-xf-gc-en.json',
};
await Object.entries(catalogs).reduce(async (prev, [u, file]) => {
  await prev;
  const resp = await fetch(`${HOST}${u}`);
  const ours = sorted(await resp.json());
  trimmed = 0;
  const www = sorted(JSON.parse(fs.readFileSync(path.join(AMS, file), 'utf8')));
  const same = JSON.stringify(ours) === JSON.stringify(www);
  const note = trimmed ? `order aside; ${trimmed} trailing spaces in www's titles normalised` : 'order aside';
  check(u, same && resp.headers.get('cache-control') === 'no-cache, no-store, must-revalidate', same ? note : `${JSON.stringify(ours).length} vs ${JSON.stringify(www).length} characters`);
}, Promise.resolve());
await ['/de/en/homepage', '/de/de/homepage', '/at/de/homepage', '/gb/en/homepage'].reduce(async (prev, p) => {
  await prev;
  const resp = await fetch(`${HOST}${p}.aircraft.json`);
  const { aircrafts } = await resp.json();
  check(`${p}.aircraft.json`, resp.ok && aircrafts.length === 6 && !resp.headers.get('cache-control'), aircrafts.map((a) => `${a.name} ${a.title} ${a.url}`).join('; '));
}, Promise.resolve());
const sw = await fetch(`${HOST}/service-worker.js`);
check('/service-worker.js', (await sw.text()) === fs.readFileSync(path.join(AMS, 'static/service-worker.js'), 'utf8')
  && sw.headers.get('content-type') === 'application/javascript' && sw.headers.get('cache-control') === 'public, max-age=21600');
console.log(lines.join('\n'));
fs.writeFileSync(path.join(root, 'tools/reports/lh-edge/compare-a3.md'), `# AMS rest A3 on ${HOST}\n\n${new Date().toISOString()}\n\n${lines.map((l) => `- ${l}`).join('\n')}\n`);
