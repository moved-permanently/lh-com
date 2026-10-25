/* eslint-disable no-console */
/**
 * AirCore images on our site (the /lhg/ pages left the replica on 2026-10-25, but www's /lhg/
 * pages request their images under /content/dam/...). For every asset of
 * tools/migration-scope/aircore-dam-images.csv (the part before .transform/):
 *   --download  fetch the original from www.lufthansa.com (following its redirect, at most
 *               2 requests per second) into tools/source-export/aircore-images/{path below
 *               /content/dam/}, once
 *   --upload    copy it into Document Authoring under /aircore-images/{path below /content/dam/}
 *               (the names stay unique) and preview it (preview only, never live); state in
 *               tools/importer/aircore-images-state.json
 *   --redirects write tools/importer/aircore-redirects.csv: one row per exact path of the list,
 *               Source = that path, Destination = the copy in the width and format the source
 *               asks for (/aircore-images/...jpg?width=720&format=webply&optimize=medium)
 * Options: --limit N (assets per run), --only <asset path>, --budget <seconds>.
 * Usage: node tools/importer/aircore-images.mjs --download | --upload | --redirects
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const has = (n) => argv.includes(`--${n}`);
const opt = (n) => (has(n) ? argv[argv.indexOf(`--${n}`) + 1] : null);
const ORG = 'moved-permanently';
const SITE = 'lh-com';
const LIVE = 'https://www.lufthansa.com';
const CACHE = path.join(root, 'tools/source-export/aircore-images');
const STATE = path.join(root, 'tools/importer/aircore-images-state.json');
const PREFIX = '/aircore-images';
const limit = Number(opt('limit')) || Infinity;
const budget = (Number(opt('budget')) || 0) * 1000;
const started = Date.now();

const csvLine = (l) => l.match(/("([^"]|"")*"|[^,]*)(,|$)/g).map((c) => c.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"'));
const [head, ...lines] = fs.readFileSync(path.join(root, 'tools/migration-scope/aircore-dam-images.csv'), 'utf8').trim().split('\n');
const cols = csvLine(head);
const rows = lines.map((l) => Object.fromEntries(csvLine(l).map((v, i) => [cols[i], v])));
let assets = [...new Set(rows.map((r) => r.asset))];
if (opt('only')) assets = assets.filter((a) => a === opt('only'));

const below = (asset) => decodeURI(asset).replace(/^\/content\/dam/, '');
const cacheFile = (asset) => path.join(CACHE, below(asset));
// Edge Delivery serves lower-case paths of a-z, 0-9, '-' and '.' only (the 100Y PNG of the
// header is c-1865990845-260129_Lufthansa_100Y_….png): the copy gets the normalized name
const daPath = (asset) => `${PREFIX}${below(asset).toLowerCase().replace(/[^a-z0-9/.-]/g, '-')}`;
const state = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : {};
const save = () => fs.writeFileSync(STATE, `${JSON.stringify(state, null, 1)}\n`);
const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });
const outOfTime = () => budget && Date.now() - started > budget;

function curl(args) {
  try {
    const out = execFileSync('curl', ['-s', '-w', '\n%{http_code} %{content_type}', ...args], {
      encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
    });
    const i = out.lastIndexOf('\n');
    const [status, type] = out.slice(i + 1).split(' ');
    return { body: out.slice(0, i), status: Number(status), type };
  } catch (e) {
    return { body: '', status: 0, type: '' };
  }
}

async function download() {
  let n = 0;
  let failed = 0;
  for (let i = 0; i < assets.length; i += 1) {
    const asset = assets[i];
    if (n >= limit || outOfTime()) break;
    const file = cacheFile(asset);
    // eslint-disable-next-line no-continue
    if (fs.existsSync(file) && fs.statSync(file).size > 0) continue;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const r = curl(['-L', '--max-redirs', '3', '-o', file, `${LIVE}${encodeURI(decodeURI(asset))}`]);
    if (r.status !== 200 || !/^image\//.test(r.type)) {
      failed += 1;
      console.log(`  ${asset}: ${r.status} ${r.type}`);
      if (fs.existsSync(file)) fs.unlinkSync(file);
    }
    n += 1;
    await sleep(500); // eslint-disable-line no-await-in-loop
  }
  const have = assets.filter((a) => fs.existsSync(cacheFile(a))).length;
  console.log(`aircore-images download: ${n} fetched (${failed} failed), ${have}/${assets.length} in the cache`);
}

async function upload() {
  let n = 0;
  const problems = [];
  for (let i = 0; i < assets.length; i += 1) {
    const asset = assets[i];
    if (n >= limit || outOfTime()) break;
    const s = state[asset] || {};
    const file = cacheFile(asset);
    if (s.preview && !s.previewError) continue; // eslint-disable-line no-continue
    if (!fs.existsSync(file)) { problems.push(`${asset}: not downloaded`); continue; } // eslint-disable-line no-continue
    const target = daPath(asset);
    const type = /\.png$/i.test(file) ? 'image/png' : 'image/jpeg';
    if (!s.uploaded) {
      const r = curl(['-X', 'POST', '-F', `data=@${file};type=${type}`, `https://admin.da.live/source/${ORG}/${SITE}${encodeURI(target)}`]);
      if (r.status < 200 || r.status >= 300) { problems.push(`${asset}: upload ${r.status}`); continue; } // eslint-disable-line no-continue
      s.uploaded = new Date().toISOString();
    }
    const p = curl(['-X', 'POST', `https://admin.hlx.page/preview/${ORG}/${SITE}/main${encodeURI(target)}`]);
    if (p.status >= 200 && p.status < 300) {
      s.preview = new Date().toISOString();
      delete s.previewError;
    } else {
      s.previewError = p.status;
      problems.push(`${asset}: preview ${p.status} ${p.body.slice(0, 120)}`);
    }
    state[asset] = s;
    n += 1;
    if (n % 20 === 0) save();
  }
  save();
  const done = assets.filter((a) => state[a] && state[a].preview && !state[a].previewError).length;
  console.log(`aircore-images upload: ${n} this run, ${done}/${assets.length} copied and previewed, ${problems.length} problems`);
  problems.slice(0, 20).forEach((p) => console.log(`  ${p}`));
}

function redirects() {
  const out = rows.map((r) => {
    const params = new URLSearchParams();
    if (r.width) params.set('width', r.width);
    // EDS delivers webply for format=webply, else the source format
    params.set('format', r.format === 'webp' ? 'webply' : r.format);
    params.set('optimize', 'medium');
    return [r.path, `${daPath(r.asset)}?${params}`];
  });
  const csv = (v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  fs.writeFileSync(path.join(root, 'tools/importer/aircore-redirects.csv'), `Source,Destination\n${out.map((r) => r.map(csv).join(',')).join('\n')}\n`);
  console.log(`aircore-redirects.csv: ${out.length} rows`);
}

if (has('download')) await download();
if (has('upload')) await upload();
if (has('redirects')) redirects();
