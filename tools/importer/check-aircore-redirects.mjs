/* eslint-disable no-console */
/**
 * Checks every row of tools/importer/aircore-redirects.csv on the preview host, like
 * `curl -sIL`: following the redirects from the Source path (or with --destination from the
 * Destination, before the redirects sheet is previewed), the request has to end in a 200 with an
 * image of the format the source asks for and roughly its width (within 10%, or the original's
 * width when the original is smaller), after no more than two redirects.
 * Writes tools/reports/aircore-redirects-check.json; prints the summary and the failures.
 * Usage: node tools/importer/check-aircore-redirects.mjs [--destination] [--limit N]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const fromDestination = argv.includes('--destination');
const limit = argv.includes('--limit') ? Number(argv[argv.indexOf('--limit') + 1]) : Infinity;
const HOST = 'https://main--lh-com--moved-permanently.aem.page';
const TMP = '/tmp/aircore-redirect-check.img';

const csvLine = (l) => l.match(/("([^"]|"")*"|[^,]*)(,|$)/g).map((c) => c.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"'));
const [, ...lines] = fs.readFileSync(path.join(root, 'tools/importer/aircore-redirects.csv'), 'utf8').trim().split('\n');
const rows = lines.map(csvLine).slice(0, limit);
const csvFile = path.join(root, 'tools/migration-scope/aircore-dam-images.csv');
const meta = Object.fromEntries(fs.readFileSync(csvFile, 'utf8').trim().split('\n').slice(1)
  .map(csvLine)
  .map(([p, asset, width, format]) => [p, { asset, width: Number(width) || 0, format }]));
const cache = path.join(root, 'tools/source-export/aircore-images');

const identify = (file) => {
  try {
    const [w, fmt] = execFileSync('identify', ['-format', '%w %m\n', file], { encoding: 'utf8' }).split('\n')[0].split(' ');
    return { width: Number(w), format: fmt.toLowerCase() };
  } catch (e) {
    return { width: 0, format: '' };
  }
};

const results = rows.map(([source, destination]) => {
  const url = `${HOST}${fromDestination ? destination : source}`;
  let out = '';
  try {
    out = execFileSync('curl', ['-sL', '--max-redirs', '5', '-o', TMP, '-w', '%{http_code} %{num_redirects} %{content_type} %{url_effective}', url], { encoding: 'utf8' });
  } catch (e) {
    out = '0 0 - -';
  }
  const [status, hops, type, final] = out.trim().split(' ');
  const m = meta[source] || {};
  const got = Number(status) === 200 ? identify(TMP) : { width: 0, format: '' };
  const original = m.asset ? identify(path.join(cache, decodeURI(m.asset).replace(/^\/content\/dam/, ''))).width : 0;
  const want = m.width ? Math.min(m.width, original || m.width) : original;
  const formatOk = (m.format === 'jpg' ? 'jpeg' : m.format) === got.format;
  const widthOk = want ? Math.abs(got.width - want) <= want * 0.1 : got.width > 0;
  const ok = Number(status) === 200 && Number(hops) <= 2 && /^image\//.test(type) && formatOk && widthOk;
  return {
    source,
    destination,
    status: Number(status),
    hops: Number(hops),
    type,
    width: got.width,
    want,
    format: got.format,
    final,
    ok,
  };
});

const report = path.join(root, 'tools/reports/aircore-redirects-check.json');
fs.writeFileSync(report, `${JSON.stringify({
  checkedAt: new Date().toISOString(), host: HOST, from: fromDestination ? 'destination' : 'source', results,
}, null, 1)}\n`);
const bad = results.filter((r) => !r.ok);
const hopCounts = results.reduce((c, r) => ({ ...c, [r.hops]: (c[r.hops] || 0) + 1 }), {});
console.log(`aircore redirects: ${results.length} rows checked from the ${fromDestination ? 'destination' : 'source'}, ${results.length - bad.length} ok, ${bad.length} failing; hops ${JSON.stringify(hopCounts)}`);
bad.slice(0, 15).forEach((r) => console.log(`  ${r.source}: ${r.status} ${r.hops} hops ${r.type} ${r.width}px (want ${r.want}) ${r.format}`));
