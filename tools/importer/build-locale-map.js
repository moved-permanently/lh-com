/* eslint-disable no-console */
/**
 * Builds data/locale-map.json (the language switch) from the migration scope.
 * AirCore rows are added once their counterparts per locale are known
 * (tools/importer/aircore-locales.csv: type,de_en,de_de,at_de,gb_en).
 * Usage: node tools/importer/build-locale-map.js
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const KEYS = {
  de_en: 'de/en', de_de: 'de/de', at_de: 'at/de', gb_en: 'gb/en',
};

function readCsv(file) {
  if (!fs.existsSync(file)) return [];
  const [head, ...lines] = fs.readFileSync(file, 'utf8').trim().split(/\r?\n/);
  const cols = head.split(',');
  return lines.map((l) => Object.fromEntries(l.split(',').map((v, i) => [cols[i], v.trim()])));
}

const rows = [
  ...readCsv(path.join(root, 'tools/migration-scope/pages.csv')),
  ...readCsv(path.join(__dirname, 'aircore-locales.csv')),
];
const pages = rows.map((r) => Object.fromEntries(
  Object.entries(KEYS).filter(([col]) => r[col]).map(([col, key]) => [key, r[col]]),
));
fs.writeFileSync(path.join(root, 'data/locale-map.json'), `${JSON.stringify({ pages })}\n`);
console.log(`data/locale-map.json: ${pages.length} rows`);
