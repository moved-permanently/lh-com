/* eslint-disable no-console */
/**
 * Builds tools/importer/page-templates.json from the migration scope: one template per
 * template_group (pages.csv) with its URLs in all four locales (the AirCore templates for the
 * /lhg/ pages are gone: those pages left the replica on 2026-10-25).
 * The first URL of each template is its representative. Blocks and sections that block
 * mapping already added are kept.
 * Usage: node tools/importer/build-page-templates.js
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const LIVE = 'https://www.lufthansa.com';
// the migrated locales (status live) of the locale table's source, tools/markets/locale-data.json
const LIVE_ROOTS = Object.entries(JSON.parse(fs.readFileSync(path.join(__dirname, '../markets/locale-data.json'), 'utf8')).roots)
  .filter(([, row]) => row.status === 'live').map(([key]) => key);
const COLS = LIVE_ROOTS.map((k) => k.replace('/', '_'));
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

function readCsv(file) {
  if (!fs.existsSync(file)) return [];
  const [head, ...lines] = fs.readFileSync(file, 'utf8').trim().split(/\r?\n/);
  const cols = head.split(',');
  return lines.map((l) => Object.fromEntries(l.split(',').map((v, i) => [cols[i], (v || '').trim()])));
}

const pages = readCsv(path.join(root, 'tools/migration-scope/pages.csv'));
const localPages = readCsv(path.join(root, 'tools/migration-scope/local-pages.csv'));
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

const templates = Object.entries(TEMPLATES).map(([name, t]) => template(
  name,
  t.description,
  [
    ...urlsFor(pages.filter((r) => r.template_group === name), t.rep),
    // market-only pages (local promotions, events, LoungeNet) import with the info template
    ...(name === 'info' ? localPages.map((r) => `${LIVE}${r.path}`) : []),
  ],
));

const out = { ...existing, metadata: { ...(existing.metadata || {}), projectType: 'da' }, templates };
fs.writeFileSync(OUT, `${JSON.stringify(out, null, 2)}\n`);
templates.forEach((t) => console.log(`${t.name}: ${t.urls.length} urls, rep ${t.urls[0]}, ${t.blocks.length} blocks`));
