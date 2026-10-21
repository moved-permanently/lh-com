/* eslint-disable no-console */
/**
 * Lists everything the migration needs from www.lufthansa.com, for an export from a
 * browser that gets past Cloudflare (see tools/importer/SOURCE-EXPORT.md).
 * Writes tools/importer/export-manifest.json and export-urls.txt.
 * Usage: node tools/importer/build-export-manifest.js
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const LIVE = 'https://www.lufthansa.com';
const LOCALES = [
  { col: 'de_en', country: 'de', lang: 'en' },
  { col: 'de_de', country: 'de', lang: 'de' },
  { col: 'at_de', country: 'at', lang: 'de' },
  { col: 'gb_en', country: 'gb', lang: 'en' },
];
const AIRCORE_TYPES = ['dest', 'from', 'o-d'];

function readCsv(file) {
  const [head, ...lines] = fs.readFileSync(file, 'utf8').trim().split(/\r?\n/);
  const cols = head.split(',');
  return lines.map((l) => Object.fromEntries(l.split(',').map((v, i) => [cols[i], v.trim()])));
}

const pages = readCsv(path.join(root, 'tools/migration-scope/pages.csv'));
const aircore = readCsv(path.join(root, 'tools/migration-scope/aircore.csv'));

const items = [];
const add = (kind, url, extra = {}) => items.push({ kind, url: `${LIVE}${url}`, ...extra });

pages.forEach((row) => LOCALES.forEach(({ col }) => {
  add('page', row[col], { template: row.template_group, locale: col.replace('_', '/') });
  add('model', `${row[col]}.model.json`, { template: row.template_group, locale: col.replace('_', '/') });
}));

// AirCore: de/en rows are known; counterparts in the other locales are found from the
// language switch of each page or the locale's AirCore sitemaps below
aircore.forEach((row) => add('page', row.de_en, { template: `aircore-${row.type}`, locale: 'de/en' }));

LOCALES.forEach(({ country, lang }) => {
  const key = `${country}/${lang}`;
  add('sitemap', `/sitemap/sitemap_lh_${country}_${lang}.xml.gz`, { locale: key, note: 'and every numbered part it links to' });
  AIRCORE_TYPES.forEach((type) => add('sitemap', `/aircore/sitemaps/${country}_${type}_${lang}_sitemap.xml`, { locale: key }));
  add('nav', `/${country}/${lang}/configuration/commonheader.model.json`, { locale: key, note: 'and every page below configuration/commonheader/, as HTML and .model.json' });
  add('har', `/${country}/${lang}/homepage`, {
    locale: key,
    note: 'HAR while: origin and destination typed into the flight search, calendar and passengers opened, fare teasers loaded, country selector opened',
  });
});

const flightSearch = pages.find((r) => r.de_en === '/de/en/flight-search');
if (flightSearch) {
  LOCALES.forEach(({ col }) => add('har', flightSearch[col], { locale: col.replace('_', '/'), note: 'HAR of the flight search page with the same interactions' }));
}

fs.writeFileSync(path.join(__dirname, 'export-manifest.json'), `${JSON.stringify({ generatedAt: new Date().toISOString(), items }, null, 1)}\n`);
fs.writeFileSync(path.join(__dirname, 'export-urls.txt'), `${items.filter((i) => ['page', 'model', 'sitemap', 'nav'].includes(i.kind)).map((i) => i.url).join('\n')}\n`);
const count = (k) => items.filter((i) => i.kind === k).length;
console.log(`export manifest: ${count('page')} pages, ${count('model')} model.json, ${count('sitemap')} sitemaps, ${count('nav')} nav roots, ${count('har')} HAR captures`);
