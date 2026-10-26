/* eslint-disable no-console */
/**
 * Adds `aircraft-code` and `aircraft-order` to the Metadata table of the fleet's aircraft pages
 * (AMS rest A3: the query index `fleet`, lh-edge's `<page>.aircraft.json`, the fleet links of the
 * flight status). The code is the IATA aircraft type code in lower case, as the last segment of
 * www's fleet URL /<cc>/<ll>/discover-lufthansa/lufthansa-fleet/<code>; the order is the fleet
 * overview's (the seat maps page: A350-900, A350-1000, A320-200, A320neo, Boeing 787; the
 * 747-400, not in the overview, last). Idempotent; writes tools/importer/fleet-documents.txt and
 * the redirect rows tools/importer/fleet-redirects.json (fleet URL -> the page's short URL).
 * Usage: node tools/importer/add-fleet-metadata.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const LOCALES = ['de/en', 'de/de', 'at/de', 'gb/en'];
// page slug (under /<cc>/<ll>/) -> [code, order]
const FLEET = {
  359: ['359', 1],
  'discover-lufthansa/lufthansa-fleet/351': ['351', 2],
  320: ['320', 3],
  '32n': ['32n', 4],
  boeing787: ['789', 5],
  744: ['744', 6],
};

const docs = [];
const redirects = [];
LOCALES.forEach((loc) => Object.entries(FLEET).forEach(([slug, [code, order]]) => {
  const page = `/${loc}/${slug}`;
  const file = path.join(root, 'content', `${page}.plain.html`);
  let html = fs.readFileSync(file, 'utf8');
  const rows = [['aircraft-code', code], ['aircraft-order', String(order)]];
  rows.forEach(([key, value]) => {
    const row = new RegExp(`<div><div>${key}</div><div>[^<]*</div></div>`);
    const cell = `<div><div>${key}</div><div>${value}</div></div>`;
    if (row.test(html)) html = html.replace(row, cell);
    else {
      const i = html.indexOf('<div class="metadata">');
      if (i < 0) throw new Error(`${page}: no metadata table`);
      const at = i + '<div class="metadata">'.length;
      html = `${html.slice(0, at)}${cell}${html.slice(at)}`;
    }
  });
  fs.writeFileSync(file, html);
  docs.push(page);
  const fleetUrl = `/${loc}/discover-lufthansa/lufthansa-fleet/${code}`;
  if (fleetUrl !== page) redirects.push({ Source: fleetUrl, Destination: page });
}));
fs.writeFileSync(path.join(root, 'tools/importer/fleet-documents.txt'), `${docs.join('\n')}\n`);
fs.writeFileSync(path.join(root, 'tools/importer/fleet-redirects.json'), `${JSON.stringify({ note: 'Rows for the redirects sheet (/redirects): www\'s fleet URLs to the replica\'s short fleet pages (AMS rest A3).', rows: redirects }, null, 1)}\n`);
console.log(`add-fleet-metadata: ${docs.length} pages, ${redirects.length} redirect rows`);
