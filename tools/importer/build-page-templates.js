/* eslint-disable no-console */
/**
 * Builds tools/importer/page-templates.json from the migration scope: one template per
 * template_group (pages.csv) with its URLs in all four locales, plus the AirCore templates.
 * The first URL of each template is its representative. Blocks and sections that block
 * mapping already added are kept.
 * Usage: node tools/importer/build-page-templates.js
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const LIVE = 'https://www.lufthansa.com';
const COLS = ['de_en', 'de_de', 'at_de', 'gb_en'];
const OUT = path.join(__dirname, 'page-templates.json');

const TEMPLATES = {
  homepage: { rep: '/de/en/homepage', description: 'Market homepage: stage with flight search, fare teasers, offers and service teasers' },
  hub: { rep: '/de/en/baggage', description: 'Overview pages linking to service and information pages' },
  info: { rep: '/de/en/flying-with-small-children', description: 'Service and information pages (baggage, check-in, airports, travel classes, onboard, families, special needs, Miles & More, partners)' },
  campaign: { rep: '/de/en/100-years', description: 'Long editorial campaign pages (100 years, stopover, trade fairs)' },
  fleet: { rep: '/de/en/359', description: 'Aircraft type and seat-map pages' },
  insights: { rep: '/de/en/articles/explore-the-world/eat-see-do-berlin', description: 'Lufthansa Insights magazine: overview, categories, tags, authors and articles' },
  legal: { rep: '/de/en/imprint', description: 'Imprint, privacy, terms and conditions, passenger rights' },
  form: { rep: '/de/en/feedback', description: 'Feedback, refund and registration forms (render only, never submit)' },
  'app-entry': { rep: '/de/en/online-check-in', description: 'Entry pages of apps (flight search, check-in, bookings); the app links out' },
  'flight-status': { rep: '/de/en/timetable-and-flight-status', description: 'Timetable and flight status' },
};
const AIRCORE = {
  'aircore-destination-overview': { types: ['home', 'continent', 'country'], description: 'AirCore destination overview: home, continent and country pages' },
  'aircore-destination': { types: ['city', 'origin', 'business-class'], description: 'AirCore city, origin and business-class pages with frozen prices' },
  'aircore-route': { types: ['country-route', 'city-route'], description: 'AirCore route pages with frozen prices' },
};

function readCsv(file) {
  if (!fs.existsSync(file)) return [];
  const [head, ...lines] = fs.readFileSync(file, 'utf8').trim().split(/\r?\n/);
  const cols = head.split(',');
  return lines.map((l) => Object.fromEntries(l.split(',').map((v, i) => [cols[i], (v || '').trim()])));
}

const pages = readCsv(path.join(root, 'tools/migration-scope/pages.csv'));
// AirCore counterparts per locale, once discovered; falls back to the de/en-only scope file
const aircoreLocales = readCsv(path.join(__dirname, 'aircore-locales.csv'));
const aircore = aircoreLocales.length ? aircoreLocales : readCsv(path.join(root, 'tools/migration-scope/aircore.csv'));
const existing = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : { templates: [] };
const previous = Object.fromEntries((existing.templates || []).map((t) => [t.name, t]));

function urlsFor(rows, rep) {
  const all = rows.flatMap((r) => COLS.map((c) => r[c]).filter(Boolean)).map((p) => `${LIVE}${p}`);
  const unique = [...new Set(all)];
  if (rep) unique.sort((a, b) => (a === `${LIVE}${rep}` ? -1 : 0) - (b === `${LIVE}${rep}` ? -1 : 0));
  return unique;
}

function template(name, description, urls) {
  const prev = previous[name] || {};
  return {
    ...prev,
    name,
    description,
    urls,
    blocks: prev.blocks || [],
  };
}

const templates = [
  ...Object.entries(TEMPLATES).map(([name, t]) => template(
    name,
    t.description,
    urlsFor(pages.filter((r) => r.template_group === name), t.rep),
  )),
  ...Object.entries(AIRCORE).map(([name, t]) => template(
    name,
    t.description,
    urlsFor(aircore.filter((r) => t.types.includes(r.type))),
  )),
];

const out = { ...existing, metadata: { ...(existing.metadata || {}), projectType: 'da' }, templates };
fs.writeFileSync(OUT, `${JSON.stringify(out, null, 2)}\n`);
templates.forEach((t) => console.log(`${t.name}: ${t.urls.length} urls, rep ${t.urls[0]}, ${t.blocks.length} blocks`));
