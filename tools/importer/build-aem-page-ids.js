/* eslint-disable no-console */
/**
 * Generates data/aem-page-ids.json: for every page of a live root whose public path differs from
 * its www technical name, the public path (with its locale) -> the technical name (www's AEM
 * content path without /content/lh/markets/<cc>/<ll>/, the name www's data layer reports:
 * /de/de/handgepaeck -> prepare-for-your-trip/baggage/carry-on-baggage). It is the reverse of
 * tools/importer/parsers/aem-path-map.js (content path -> public path), limited to the live roots
 * of tools/markets/locale-data.json, without /lhg/ paths. Pages not in the file use their path
 * without the locale; market roots answered from their language version use that version's
 * entry (scripts/data-layer.js), so they get none here. Fails on a public path with two names.
 *
 * Usage: node tools/importer/build-aem-page-ids.js [--check]   (--check: exit 1 when the file
 * in the repository is not what this would write)
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const MAP = path.join(__dirname, 'parsers/aem-path-map.js');
const OUT = path.join(root, 'data/aem-page-ids.json');

/** The AEM_PATHS object of the generated map module (a JSON object literal). */
function readMap() {
  const text = fs.readFileSync(MAP, 'utf8');
  return JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
}

function build() {
  const { roots } = JSON.parse(fs.readFileSync(path.join(root, 'tools/markets/locale-data.json'), 'utf8'));
  const live = new Set(Object.keys(roots).filter((k) => roots[k].status === 'live'));
  const ids = {};
  Object.entries(readMap()).forEach(([content, pub]) => {
    const key = content.split('/').slice(1, 3).join('/');
    if (!live.has(key) || pub.split('/').slice(1, 3).join('/') !== key) return;
    if (content.includes('/lhg/') || pub.includes('/lhg/')) return;
    const name = content.slice(key.length + 2);
    if (name === pub.slice(key.length + 2)) return;
    if (ids[pub] && ids[pub] !== name) throw new Error(`${pub}: ${ids[pub]} and ${name}`);
    ids[pub] = name;
  });
  return Object.fromEntries(Object.keys(ids).sort().map((k) => [k, ids[k]]));
}

const ids = build();
const text = `${JSON.stringify(ids, null, 1)}\n`;
if (process.argv.includes('--check')) {
  const same = fs.existsSync(OUT) && fs.readFileSync(OUT, 'utf8') === text;
  console.log(same ? `${OUT}: up to date` : `${OUT}: differs from the map (run without --check)`);
  process.exit(same ? 0 : 1);
}
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, text);
const perRoot = {};
Object.keys(ids).forEach((p) => { const k = p.split('/').slice(1, 3).join('/'); perRoot[k] = (perRoot[k] || 0) + 1; });
console.log(`${path.relative(root, OUT)}: ${Object.keys(ids).length} pages (${Object.entries(perRoot).map(([k, n]) => `${k} ${n}`).join(', ')}), ${text.length} bytes`);
