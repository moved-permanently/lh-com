/* eslint-disable no-console, no-await-in-loop, max-len, import/no-relative-packages, import/no-extraneous-dependencies */
/**
 * Compares lh-edge's /content/dam answers with www's, for the URLs of the DAM brief:
 * - the AirCore list (tools/migration-scope/aircore-dam-images.csv, every path as www's pages
 *   request it, renditions included);
 * - the app's destination images (source "destination" of tools/source-export/feeds/dam/
 *   dam-assets.csv) at widths 360 and 1440, as jpg and webp;
 * - /content/dam/lh/images/mobileapp/Lufthansa%20Insights%20V2.png;
 * - a missing destination image (zzq-square: www's fallback), as rendition and original.
 * Compared: status; for a redirect its target path (www's host is lh-edge's own host for
 * Lufthansa's fallbacks); for 200 the content type and the image's width and height (bytes
 * differ: Edge Delivery encodes its own renditions; originals are checked byte for byte by size).
 * www is asked at most 2 at a time.
 *
 * Usage: node compare-dam.mjs --host https://lhedge.bbird.live | --local [--limit N]
 *   --local: the Worker in Node, with the origin's answers taken from the preview
 *            (main--lh-com--moved-permanently.aem.page) instead of aem.live: the check before
 *            the copies are published
 * Report: tools/reports/lh-edge/compare-dam[-local].md and .json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const argv = process.argv.slice(2);
const local = argv.includes('--local');
const host = argv.includes('--host') ? argv[argv.indexOf('--host') + 1].replace(/\/$/, '') : '';
const limit = argv.includes('--limit') ? Number(argv[argv.indexOf('--limit') + 1]) : Infinity;
if (!local && !host) {
  console.error('usage: compare-dam.mjs --host https://lhedge.bbird.live | --local');
  process.exit(1);
}
const WWW = 'https://www.lufthansa.com';
const ORIGIN = 'main--lh-com--moved-permanently.aem.live';
const PREVIEW = 'main--lh-com--moved-permanently.aem.page';
const SELF = local ? 'https://lh-edge.local' : host;

const csvLine = (l) => l.match(/("([^"]|"")*"|[^,]*)(,|$)/g).map((c) => c.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"'));
const readCsv = (file) => {
  const [head, ...lines] = fs.readFileSync(file, 'utf8').trim().split('\n');
  const cols = csvLine(head);
  return lines.map((l) => Object.fromEntries(csvLine(l).map((v, i) => [cols[i], v])));
};

const cases = [];
const add = (group, p) => { if (!cases.some((c) => c.path === p)) cases.push({ group, path: p }); };
readCsv(path.join(root, 'tools/migration-scope/aircore-dam-images.csv')).forEach((r) => add('aircore', encodeURI(decodeURI(r.path))));
readCsv(path.join(root, 'tools/source-export/feeds/dam/dam-assets.csv'))
  .filter((r) => r.sources.split(' ').includes('destination') && !r.asset.includes('.transform/'))
  .forEach((r) => [360, 1440].forEach((w) => ['jpg', 'webp'].forEach((ext) => add('destination', `${encodeURI(r.asset)}.transform/lh-dcep-transform-width-${w}/img.${ext}`))));
add('mobileapp', '/content/dam/lh/images/mobileapp/Lufthansa%20Insights%20V2.png');
add('fallback', '/content/dam/lh/images/offers/destination/zzq-square.jpg.transform/lh-dcep-transform-width-360/img.jpg');
add('fallback', '/content/dam/lh/images/offers/destination/zzq-square.jpg');
const todo = cases.slice(0, limit);

let worker;
if (local) {
  ({ default: worker } = await import('./src/index.js'));
  const realFetch = globalThis.fetch;
  // the Worker's origin requests (aem.live) answered by the preview; Cloudflare's cf options dropped
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input, init);
    const u = new URL(req.url);
    if (u.hostname === ORIGIN) u.hostname = PREVIEW;
    return realFetch(new Request(u, { method: req.method, headers: req.headers, redirect: 'manual' }));
  };
}

async function describe(resp) {
  const out = { status: resp.status, type: (resp.headers.get('content-type') || '').split(';')[0] };
  const location = resp.headers.get('location');
  if (location) out.location = new URL(location, 'https://x').pathname + new URL(location, 'https://x').search;
  if (location) out.locationHost = new URL(location, SELF).host;
  if (resp.status === 200) {
    const buf = Buffer.from(await resp.arrayBuffer());
    out.bytes = buf.length;
    if (/^image\/(jpeg|png|webp|gif)/.test(out.type)) {
      const meta = await sharp(buf).metadata().catch(() => ({}));
      out.width = meta.width;
      out.height = meta.height;
    }
  } else await resp.arrayBuffer().catch(() => null);
  return out;
}

async function askWww(p) {
  return describe(await fetch(`${WWW}${p}`, { redirect: 'manual' }));
}

async function askEdge(p) {
  if (!local) return describe(await fetch(`${host}${p}`, { redirect: 'manual' }));
  return describe(await worker.fetch(new Request(`${SELF}${p}`), { ORIGIN, PUBLIC_HOST: '', EDGE_TTL: '60' }, {}));
}

function differences(www, edge) {
  const d = [];
  if (www.status !== edge.status) d.push(`status ${www.status} / ${edge.status}`);
  else if (www.location !== undefined) {
    const wwwHost = www.locationHost === 'www.lufthansa.com' ? new URL(SELF).host : www.locationHost;
    if (www.location !== edge.location || wwwHost !== edge.locationHost) d.push(`location ${www.locationHost}${www.location} / ${edge.locationHost}${edge.location}`);
  } else if (www.status === 200) {
    if (www.type !== edge.type) d.push(`type ${www.type} / ${edge.type}`);
    if (www.width !== edge.width || www.height !== edge.height) d.push(`size ${www.width}x${www.height} / ${edge.width}x${edge.height}`);
  }
  return d;
}

const results = [];
let next = 0;
// www at most 2 at a time; each case asks www, then lh-edge
await Promise.all([0, 1].map(async () => {
  while (next < todo.length) {
    const c = todo[next];
    next += 1;
    const www = await askWww(c.path).catch((e) => ({ status: 0, error: e.message }));
    const edge = await askEdge(c.path).catch((e) => ({ status: 0, error: e.message }));
    results.push({
      ...c, www, edge, differences: differences(www, edge),
    });
    if (results.length % 100 === 0) console.log(`  ${results.length}/${todo.length}`);
  }
}));
results.sort((a, b) => cases.indexOf(cases.find((c) => c.path === a.path)) - cases.indexOf(cases.find((c) => c.path === b.path)));

const groups = {};
results.forEach((r) => {
  groups[r.group] ||= { cases: 0, equal: 0 };
  groups[r.group].cases += 1;
  if (!r.differences.length) groups[r.group].equal += 1;
});
const name = local ? 'compare-dam-local' : 'compare-dam';
const outDir = path.join(root, 'tools/reports/lh-edge');
fs.mkdirSync(outDir, { recursive: true });
const report = {
  checkedAt: new Date().toISOString(), edge: local ? `the Worker in Node, origin answers from ${PREVIEW}` : host, groups, results,
};
fs.writeFileSync(path.join(outDir, `${name}.json`), `${JSON.stringify(report, null, 1)}\n`);
const diff = results.filter((r) => r.differences.length);
const md = [
  `# DAM URLs: lh-edge vs www (${report.edge})`, '', report.checkedAt, '',
  '| group | URLs | equal |', '|---|---|---|',
  ...Object.entries(groups).map(([g, v]) => `| ${g} | ${v.cases} | ${v.equal} |`), '',
  'Compared: status, redirect target, content type and image size (Edge Delivery encodes its own renditions, so bytes differ).', '',
  ...(diff.length ? ['| URL | differences |', '|---|---|', ...diff.map((r) => `| \`${r.path}\` | ${r.differences.join('; ')} |`)] : ['No differences.']), '',
];
fs.writeFileSync(path.join(outDir, `${name}.md`), md.join('\n'));
console.log(`compare-dam: ${Object.entries(groups).map(([g, v]) => `${g} ${v.equal}/${v.cases}`).join(', ')}; ${diff.length} differ`);
