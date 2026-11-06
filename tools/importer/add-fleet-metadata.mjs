/* eslint-disable no-console, import/prefer-default-export */
/**
 * Adds `aircraft-code` and `aircraft-order` to the Metadata table of the fleet's aircraft pages
 * (AMS rest A3: the query index `fleet`, lh-edge's `<page>.aircraft.json`, the fleet links of the
 * flight status). The code is the IATA aircraft type code in lower case, as the last segment of
 * www's fleet URL /<cc>/<ll>/discover-lufthansa/lufthansa-fleet/<code>; the order is the fleet
 * overview's (the seat maps page: A350-900, A350-1000, A320-200, A320neo, Boeing 787; the
 * 747-400, not in the overview, last). Idempotent; writes tools/importer/fleet-documents.txt and
 * the redirect rows tools/importer/fleet-redirects.json (fleet URL -> the page's short URL).
 * A document that isn't in the workspace is skipped and listed (every root's redirect rows are
 * still written). Usage: node tools/importer/add-fleet-metadata.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LIVE_ROOTS } from '../../scripts/locale.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
// page slug (under /<cc>/<ll>/) -> [code, order]
const FLEET = {
  359: ['359', 1],
  'discover-lufthansa/lufthansa-fleet/351': ['351', 2],
  320: ['320', 3],
  '32n': ['32n', 4],
  boeing787: ['789', 5],
  744: ['744', 6],
};

/**
 * Writes the rows into each root's fleet documents under <root>/content; a document that isn't in
 * the workspace (a root whose documents live elsewhere) is skipped and listed. The redirect rows
 * are every root's. Returns { docs, missing, redirects }.
 */
export function fleetMetadata({ root = ROOT, locales = LIVE_ROOTS } = {}) {
  const docs = [];
  const missing = [];
  const redirects = [];
  locales.forEach((loc) => Object.entries(FLEET).forEach(([slug, [code, order]]) => {
    const page = `/${loc}/${slug}`;
    const fleetUrl = `/${loc}/discover-lufthansa/lufthansa-fleet/${code}`;
    if (fleetUrl !== page) redirects.push({ Source: fleetUrl, Destination: page });
    const file = path.join(root, 'content', `${page}.plain.html`);
    if (!fs.existsSync(file)) {
      missing.push(page);
      return;
    }
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
  }));
  return { docs, missing, redirects };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { docs, missing, redirects } = fleetMetadata();
  fs.writeFileSync(path.join(ROOT, 'tools/importer/fleet-documents.txt'), `${docs.join('\n')}\n`);
  fs.writeFileSync(path.join(ROOT, 'tools/importer/fleet-redirects.json'), `${JSON.stringify({ note: 'Rows for the redirects sheet (/redirects): www\'s fleet URLs to the replica\'s short fleet pages (AMS rest A3).', rows: redirects }, null, 1)}\n`);
  const roots = [...new Set(missing.map((m) => m.split('/').slice(1, 3).join('/')))];
  console.log(`add-fleet-metadata: ${docs.length} pages, ${redirects.length} redirect rows${missing.length ? `; ${missing.length} documents not in the workspace (skipped): ${roots.join(', ')}` : ''}`);
}
