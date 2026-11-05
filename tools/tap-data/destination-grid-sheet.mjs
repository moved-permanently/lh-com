/* eslint-disable no-console -- tooling */
/**
 * TAP's destination grid sheet (blocks/destination-grid; tools/reports/tap/parity.md row 84): the
 * destinations www.flytap.com's destinations page shows in Smartvel's Explore&Go widget, from the
 * capture of the widget's answers (tap-smartvel-001: <version>/config.json, <version>/regions.json,
 * geo/sm_areas.json, labels.json, summary.json; its README describes them). One sheet per version,
 * `/<version>/destinations/destination-grid.json`, a row each:
 * - a destination: id, name (the city), country, area (the area of its country id in
 *   sm_areas.json, of those the config offers), tags (the category chips it carries, their ids),
 *   text (the description without HTML), link (the widget's shop button: the market's banner link,
 *   else the custom shop link, else the shop link), image (empty: Smartvel's pictures are licensed;
 *   with --photos the cover as the widget loads it, left on Smartvel's CDN);
 * - a chip: id and name, in the widget's order;
 * - an area: its slug and its name in the version's language;
 * - a label: the widget's key and its text in the version.
 * The destinations in the widget's order: region_priority first, then the regions' order.
 *
 * Usage: node tools/tap-data/destination-grid-sheet.mjs --capture <the capture's smartvel folder>
 *          --version pt-pt --out <sheet.json> [--photos yes] [--limit <destinations>]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** The sheet's columns, in order. */
export const COLUMNS = ['type', 'id', 'name', 'country', 'area', 'tags', 'text', 'link', 'image'];

/** The widget's texts the block uses (labels.json keys). */
export const LABEL_KEYS = [
  'SEARCH_PLACEHOLDER', 'SEARCH_NO_RESULTS', 'FILTERS_BTN', 'FILTERS_TITLE', 'FILTERS_TEXT',
  'AREA_LIST_TITLE', 'EVERYWHERE', 'CATEGORIES_TITLE', 'FILTERS_CLEAR_BTN', 'FILTERS_BTN_APPLY',
  'DESTINATION_LIST', 'DESTINATION_LIST_EMPTY', 'LOAD_MORE_DESTINATIONS_BTN', 'CLOSE_BTN',
];

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
};

/** HTML as plain text: the tags out, the entities decoded, the spaces collapsed. */
export function plainText(html) {
  return String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
      if (e[0] === '#') {
        const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
        return Number.isFinite(code) ? String.fromCodePoint(code) : m;
      }
      return ENTITIES[e.toLowerCase()] ?? m;
    })
    .replace(/\s+/g, ' ')
    .replace(/ ([.,;:!?])/g, '$1')
    .trim();
}

/** The area (its slug) whose countries hold the country id, of the areas the config offers. */
export function areaOf(countryId, features, offered) {
  const hit = (features || []).find((f) => offered.includes(f.properties.slug)
    && (f.properties.regions || []).map(String).includes(String(countryId)));
  return hit ? hit.properties.slug : '';
}

/** The widget's shop link for a destination in a market (README: config.json). */
export function linkOf(region, config, market) {
  const { banner } = ((config.custom_market_links || {})[region.id] || {})[market] || {};
  return banner || config.custom_shop_link || config.shop_link || '';
}

/** The destinations in the widget's order: the priority ones first, then the rest as given. */
export function ordered(regions, priority = []) {
  const ids = priority.map(String);
  const first = ids.map((id) => regions.find((r) => String(r.id) === id)).filter(Boolean);
  return [...first, ...regions.filter((r) => !ids.includes(String(r.id)))];
}

const row = (o) => Object.fromEntries(COLUMNS.map((c) => [c, o[c] === undefined ? '' : String(o[c])]));

/**
 * The sheet's rows.
 * @param {{config: Object, regions: Array, areas: Array, labels: Object, lang: string,
 *   market: string, photos?: boolean, limit?: number}} capture
 */
export function sheetRows({
  config, regions, areas, labels, lang, market, photos = false, limit = 0,
}) {
  const chips = config.available_chips || [];
  const chipIds = chips.map((c) => String(c.id));
  const offered = config.areas || [];
  let dests = ordered(regions, config.region_priority || []);
  if (limit) dests = dests.slice(0, limit);
  const short = String(lang || '').slice(0, 2);
  return [
    ...dests.map((r) => row({
      type: 'destination',
      id: r.id,
      name: r.name,
      country: r.country,
      area: areaOf(r.country_id, areas, offered),
      tags: (r.tags || []).map(String).filter((t) => chipIds.includes(t)).join(','),
      text: plainText(r.description),
      link: linkOf(r, config, market),
      image: photos && r.cover && r.cover.cc_photo ? `${r.cover.cc_photo}_medium` : '',
    })),
    ...chips.map((c) => row({ type: 'chip', id: c.id, name: c.name })),
    ...offered.map((slug) => {
      const f = (areas || []).find((a) => a.properties.slug === slug);
      const t = (f && f.properties.translations) || {};
      return row({ type: 'area', id: slug, name: t[short] || t.en || slug });
    }),
    ...LABEL_KEYS.filter((k) => labels[k]).map((k) => row({ type: 'label', id: k, name: labels[k] })),
  ];
}

/** DA's single-sheet JSON. */
export const sheetOf = (rows) => ({
  total: rows.length, limit: rows.length, offset: 0, data: rows, ':sheetname': 'data', ':type': 'sheet',
});

function args(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) if (argv[i].startsWith('--')) { out[argv[i].slice(2)] = argv[i + 1]; i += 1; }
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const a = args(process.argv.slice(2));
  ['capture', 'version', 'out'].forEach((k) => {
    if (!a[k]) { console.error(`--${k} is missing`); process.exit(2); }
  });
  const read = (...p) => JSON.parse(fs.readFileSync(path.join(a.capture, ...p), 'utf8'));
  const labels = read('labels.json')[a.version];
  const summary = read('summary.json')[a.version];
  if (!labels || !summary) { console.error(`${a.version}: not in the capture`); process.exit(2); }
  const rows = sheetRows({
    config: read(a.version, 'config.json'),
    regions: read(a.version, 'regions.json'),
    areas: read('geo', 'sm_areas.json').features,
    labels: labels.labels,
    lang: labels.lang,
    market: summary.embed.market,
    photos: a.photos === 'yes',
    limit: Number(a.limit) || 0,
  });
  fs.mkdirSync(path.dirname(a.out), { recursive: true });
  fs.writeFileSync(a.out, `${JSON.stringify(sheetOf(rows), null, 1)}\n`);
  const dests = rows.filter((r) => r.type === 'destination');
  console.log(`${a.version}: ${dests.length} destinations (${dests.filter((r) => !r.area).length} without an area), ${rows.length} rows -> ${a.out}`);
}
