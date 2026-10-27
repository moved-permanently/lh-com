/* eslint-disable no-console */
/**
 * Builds data/locale-map.json (the language switch) from the migration scope.
 * Market-only pages (tools/migration-scope/local-pages.csv: path,locale,kind) get a row of their
 * own locale only: they have no counterpart, so the language switch goes to the other locale's
 * homepage. The AirCore pages (/lhg/) left the scope on 2026-10-25.
 * Usage: node tools/importer/build-locale-map.js
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
// the migrated locales (status live) of the locale table's source, tools/markets/locale-data.json
const LIVE_ROOTS = Object.entries(JSON.parse(fs.readFileSync(path.join(__dirname, '../markets/locale-data.json'), 'utf8')).roots)
  .filter(([, row]) => row.status === 'live').map(([key]) => key);
const KEYS = Object.fromEntries(LIVE_ROOTS.map((k) => [k.replace('/', '_'), k]));

function readCsv(file) {
  if (!fs.existsSync(file)) return [];
  const [head, ...lines] = fs.readFileSync(file, 'utf8').trim().split(/\r?\n/);
  const cols = head.split(',');
  return lines.map((l) => Object.fromEntries(l.split(',').map((v, i) => [cols[i], v.trim()])));
}

const rows = [
  ...readCsv(path.join(root, 'tools/migration-scope/pages.csv')),
];
const pages = [
  ...rows.map((r) => Object.fromEntries(
    Object.entries(KEYS).filter(([col]) => r[col]).map(([col, key]) => [key, r[col]]),
  )),
  ...readCsv(path.join(root, 'tools/migration-scope/local-pages.csv'))
    .filter((r) => r.path && r.locale).map((r) => ({ [r.locale]: r.path })),
];
fs.writeFileSync(path.join(root, 'data/locale-map.json'), `${JSON.stringify({ pages })}\n`);
console.log(`data/locale-map.json: ${pages.length} rows`);
