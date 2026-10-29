/* eslint-disable no-console, max-len, import/prefer-default-export -- tooling */
/**
 * Discover's capture order (brief 124) from content-sites/lh-discover/scope.json
 * (discover-scope.mjs): de/en's language pages by section (book, travel-inspiration,
 * my-bookings, discover, legal, about-us, help, feedback, the homepage, the campaign pages,
 * culinaryjourney), then de/de's (the same sections, then its articles), then the fr check pages
 * (ca/fr's homepage and two shared pages), then xx/fr's, then the market roots' homepages, own
 * pages and comparison pages (a legal page, the baggage page, one more shared page). Batches of
 * about 40 pages, without the pages that have a snapshot already (the demo's of 2026-10-27).
 * Writes content-sites/lh-discover/runs/batch-<nn>.txt and plan.json.
 *
 * Usage: node tools/importer/discover-plan.mjs [--size 40]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const size = Number(argv.includes('--size') ? argv[argv.indexOf('--size') + 1] : 40);
const HOST = 'https://www.discover-airlines.com';
const SNAP = path.join(root, 'tools/importer/bd-snapshots/www.discover-airlines.com');
const scope = JSON.parse(fs.readFileSync(path.join(root, 'content-sites/lh-discover/scope.json'), 'utf8'));
const SECTIONS = ['book', 'travel-inspiration', 'my-bookings', 'discover', 'legal', 'about-us', 'help', 'feedback', 'homepage', 'cancun-promotion', 'new-destinations', 'wildlife-and-nature', 'culinaryjourney', 'articles'];
// the pages each market root is compared on with its language version (part 1)
export const COMPARE = {
  en: ['/homepage', '/legal/imprint', '/book/baggage', '/my-bookings/check-in/online-check-in'],
  de: ['/homepage', '/legal/imprint', '/book/baggage', '/my-bookings/check-in/online-check-in'],
  fr: ['/homepage', '/legal/imprint', '/book/baggage', '/my-bookings/check-in/online-check-in'],
};
const MARKETS = { en: ['us/en', 'ca/en', 'xx/en'], de: ['us/de', 'xx/de'], fr: ['ca/fr'] };

const section = (s) => {
  const i = SECTIONS.indexOf(s.split('/')[1]);
  return i < 0 ? SECTIONS.length : i;
};
const bySection = (r) => [...scope.roots[r].suffixes].sort((a, b) => section(a) - section(b) || a.localeCompare(b)).map((s) => `/${r}${s}`);
const has = (p) => scope.roots[p.split('/').slice(1, 3).join('/')]?.suffixes.includes(p.slice(6));

const order = [
  ...bySection('de/en'),
  ...bySection('de/de'),
  // the fr check: ca/fr's homepage and two pages xx/fr has too, before xx/fr's documents
  ...['/homepage', '/book/baggage', '/legal/imprint'].map((s) => `/ca/fr${s}`),
  ...bySection('xx/fr'),
  ...Object.entries(MARKETS).flatMap(([lang, roots]) => roots.flatMap((r) => [
    ...COMPARE[lang].map((s) => `/${r}${s}`).filter(has),
    ...scope.roots[r].own.map((s) => `/${r}${s}`),
  ])),
];
const unique = [...new Set(order)];
const todo = unique.filter((p) => !fs.existsSync(path.join(SNAP, `${p}.html`)));
const dir = path.join(root, 'content-sites/lh-discover/runs');
fs.mkdirSync(dir, { recursive: true });
const batches = [];
for (let i = 0; i < todo.length; i += size) batches.push(todo.slice(i, i + size));
batches.forEach((b, i) => fs.writeFileSync(path.join(dir, `batch-${String(i + 1).padStart(2, '0')}.txt`), `${b.map((p) => `${HOST}${p}`).join('\n')}\n`));
fs.writeFileSync(path.join(dir, 'plan.json'), `${JSON.stringify({ pages: unique.length, snapshotted: unique.length - todo.length, batches: batches.map((b) => ({ n: b.length, first: b[0], last: b.at(-1) })) }, null, 1)}\n`);
console.log(`${unique.length} pages, ${unique.length - todo.length} with a snapshot already (the demo's), ${todo.length} to capture in ${batches.length} batches`);
batches.forEach((b, i) => console.log(`batch ${i + 1}: ${b.length} pages, ${b[0]} … ${b.at(-1)}`));
