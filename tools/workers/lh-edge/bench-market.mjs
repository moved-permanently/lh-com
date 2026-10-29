/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, max-len, import/no-extraneous-dependencies, import/no-relative-packages -- dev tooling */
/**
 * CPU of lh-edge's answers that need the market model, with the real origin answers: a first
 * pass fetches every origin URL the answers read (aem.live) and keeps the bytes, then each
 * answer runs again against those bytes in memory (no network), cold (a new isolate: the
 * per-isolate caches dropped) and warm, and reports the process CPU time (user + system) per
 * answer. Workers Free allows 10 ms of CPU per request.
 *
 * The lean sources (src/market-lean.js, helix-query.yaml market-model-* / market-llms-*) fill only
 * when pages are published; until then this bench makes them from the full indexes it recorded
 * (the same rows and columns, plus the canonical column Edge Delivery adds), so both paths can be
 * measured and compared now. --compare: every answer with the full indexes (MARKET_MODEL=full)
 * and with the lean sources, status, main headers and body byte for byte.
 * HTML answers go through the test's HTMLRewriter stand-in (JavaScript, slower than the
 * runtime's), so their numbers are an upper bound; the model build is reported on its own.
 *
 * The sitemap index built ahead (src/sitemap-index.js) is made here from the recorded answers, as
 * the Action does, and answered from memory (--stored off: SITEMAP_INDEX=off, the index made).
 * --roots <n>: a projection, synthetic pilot rows added to the locale table up to n pilot roots
 * (the de and en roots of www's countries not in the table, copied from hu/de and hu/en: their
 * pages are the language versions', they have no own pages).
 *
 * Usage: node --import ./test/cloudflare-workers-shim.mjs bench-market.mjs [--runs 5] [--compare] [--roots 187] [--stored off] [--path /hu/en/baggage …]
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import HTMLRewriter from './test/htmlrewriter-shim.mjs';
import { LOCALE_TABLE, WWW_ROOTS } from '../../../scripts/locale-table.js';

globalThis.HTMLRewriter = HTMLRewriter;
const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
// --roots: the synthetic rows go in before the Worker's modules read the table (imported below)
const pilotCount = () => Object.values(LOCALE_TABLE).filter((r) => r.status === 'pilot').length;
if (opt('roots')) {
  const todo = WWW_ROOTS.split(' ').filter((k) => /^[a-w][a-z]\/(de|en)$/.test(k) && !LOCALE_TABLE[k]);
  for (const k of todo) {
    if (pilotCount() >= Number(opt('roots'))) break;
    const [cc, ll] = k.split('/');
    LOCALE_TABLE[k] = {
      ...LOCALE_TABLE[`hu/${ll}`], country: cc, hreflang: `${ll}-${cc.toUpperCase()}`, name: `${cc} ${ll} (synthetic)`, countryName: { en: cc, de: cc },
    };
  }
}
const { default: worker } = await import('./src/index.js');
const {
  marketModel, resetMarketCache, MARKET_ROOTS, sitemapCount, sitemapEntries, servedMarketRoots, sitemapIndexSources, sitemapIndexOf,
} = await import('./src/markets.js');
const { resetSheetCache } = await import('./src/sheet.js');
const { resetSearchCache } = await import('./src/search.js');
const { MODEL_COLUMNS, LLMS_COLUMNS } = await import('./src/market-lean.js');
// code before the stored index (an older commit benched with this file) has no sitemap-index.js
const { sitemapIndexKey, storedNames } = await import('./src/sitemap-index.js').catch(() => ({}));
const runs = Number(opt('runs', 5));
const listed = argv.flatMap((a, i) => (a === '--path' ? [argv[i + 1]] : []));
const HOST = 'lhedge.bbird.live';
const ORIGIN = 'main--lh-com--moved-permanently.aem.live';
const PILOTS = MARKET_ROOTS.filter((k) => LOCALE_TABLE[k].status === 'pilot');
const PATHS = listed.length ? listed : ['/hu/en/baggage', '/ie/en/baggage', '/ke/en/homepage', '/hu/de/gepaeck', '/hu/en/baggage.plain.html', '/ch/llms.txt', '/gb/llms.txt', '/at/llms.txt',
  '/hu/en/search-index.json', '/ie/de/search-index.json', '/ch/en/search-index.json', '/hu/en/articles/query-index.json',
  'SEARCH DE en baggage', 'SEARCH CH en lounge', 'SEARCH DE de gepäck', 'SEARCH AT de check-in', 'SEARCH GB en miles and more',
  '/sitemap/sitemap_lh.xml', '/sitemap/sitemap_lh.xml.gz', '/sitemap/sitemap_lh_hu_en.xml', '/sitemap/sitemap_lh_hu_en.xml.gz'];
// the search API (POST /service/secured/api/search): "SEARCH <X-Portal-Site> <X-Portal-Language> <phrase>"
const SEARCHES = [['DE', 'en'], ['DE', 'de'], ['AT', 'de'], ['GB', 'en'], ['CH', 'en'], ['CH', 'de'], ['HU', 'en'], ['XX', 'fr']].flatMap(([site, lang]) => ['baggage', 'gepäck', 'check-in', 'lounge', 'miles and more', 'flight status', 'wifi', 'refund', 'Umbuchung', 'a', 'the and', 'zz-none']
  .map((phrase) => `SEARCH ${site} ${lang} ${phrase}`));
// --compare: every pilot root's homepage, flight and baggage pages, a plain document, its
// llms.txt and first sitemap file, the sitemap index
const COMPARE = [...new Set([
  ...PATHS,
  ...PILOTS.flatMap((k) => {
    const de = LOCALE_TABLE[k].lang === 'de';
    return [`/${k}/homepage`, `/${k}/${de ? 'fluege' : 'flights'}`, `/${k}/${de ? 'gepaeck' : 'baggage'}`, `/${k}/${de ? 'flughafeninformation' : 'airport-information'}.plain.html`,
      `/${k.split('/')[0]}/llms.txt`, `/${k}/llms.txt`, `/sitemap/sitemap_lh_${k.replace('/', '_')}.xml`, `/sitemap/sitemap_lh_${k.replace('/', '_')}.xml.gz`,
      `/${k}/search-index.json`, `/${k}/search-index.json?limit=10&offset=5`, `/${k}/articles/query-index.json`, `/${k}/articles/query-index.json?limit=3`];
  }),
  ...SEARCHES,
])];
const env = (extra = {}) => ({
  ORIGIN, WWW_HOST: 'www.lufthansa.com', PILOT_HOSTS: HOST, ALIAS_REWRITE_HOSTS: 'lhcom.bbird.live,lhedge.bbird.live', EDGE_TTL: '60', EDGE_CACHE_VERSION: 'bench', ...extra,
});

// the full index a lean source mirrors, and its columns
const leanOf = (pathname) => {
  const m = pathname.match(/^\/market-(model|llms)\/([a-z]{2}-[a-z]{2}|own)\.json$/);
  if (!m) return null;
  return { full: m[2] === 'own' ? '/market-pages.json' : `/${m[2].replace('-', '/')}/search-index.json`, columns: m[1] === 'model' ? MODEL_COLUMNS : LLMS_COLUMNS };
};

const realFetch = globalThis.fetch;
// --replay <file>: the origin's answers of an earlier --record run (two code versions compared on
// the same answers: the origin changes between runs); what is missing is fetched
const recorded = new Map();
if (opt('replay')) {
  Object.entries(JSON.parse(fs.readFileSync(opt('replay'), 'utf8'))).forEach(([k, v]) => recorded.set(k, { ...v, body: new Uint8Array(Buffer.from(v.body, 'base64')) }));
}
let record = true;
/** An origin answer through the recording. */
async function live(method, url) {
  const key = `${method} ${url}`;
  if (!recorded.has(key)) {
    if (!record) throw new Error(`not recorded: ${key}`);
    const r = await realFetch(url, { method, headers: { 'x-forwarded-host': HOST } });
    recorded.set(key, { status: r.status, headers: [...r.headers], body: new Uint8Array(await r.arrayBuffer()) });
  }
  return recorded.get(key);
}
const fullRows = new Map();
async function rowsOfFull(path) {
  if (!fullRows.has(path)) {
    const r = await live('GET', `https://${ORIGIN}${path}?limit=5000`);
    fullRows.set(path, r.status === 200 ? JSON.parse(Buffer.from(r.body).toString('utf8')).data : null);
  }
  return fullRows.get(path);
}
// the search data (src/search-data.js): built here from the recorded indexes, as the Action does
const searchData = new Map();
async function searchDataFile(pathname) {
  const m = pathname.match(/^\/search-data\/([a-z]{2})-([a-z]{2})\/([a-z0-9-]+\.(?:txt|bin))$/);
  if (!m) return null;
  const locale = `${m[1]}/${m[2]}`;
  if (!searchData.has(locale)) {
    // loaded only here: code without search data (main before it) runs this file too
    const { buildSearchData } = await import('./src/search-data.js');
    const rows = await rowsOfFull(`/${locale}/search-index.json`);
    searchData.set(locale, rows ? buildSearchData(rows) : {});
  }
  return searchData.get(locale)[m[3]] ?? null;
}
// the stored sitemap index (made after the first pass, from the recorded answers)
const storedIndex = new Map();
globalThis.fetch = async (input, init) => {
  const req = input instanceof Request ? input : new Request(input, init);
  const key = `${req.method} ${req.url}`;
  if (new URL(req.url).hostname.startsWith('sitemap-index--')) {
    const body = storedIndex.get(new URL(req.url).pathname);
    return body ? new Response(body) : new Response('not found', { status: 404 });
  }
  if (new URL(req.url).hostname.startsWith('search-data--')) {
    const text = await searchDataFile(new URL(req.url).pathname);
    return text === null ? new Response('not found', { status: 404 }) : new Response(text, { headers: { 'content-type': 'text/plain' } });
  }
  if (record && !recorded.has(key)) {
    const u = new URL(req.url);
    const lean = leanOf(u.pathname);
    if (lean) {
      const rows = await rowsOfFull(lean.full);
      if (!rows) {
        recorded.set(key, { status: 404, headers: [], body: new Uint8Array() });
      } else {
        const offset = Number(u.searchParams.get('offset') || 0);
        const limit = Number(u.searchParams.get('limit') || 1000);
        const data = rows.slice(offset, offset + limit).map((row) => ({ path: row.path, ...Object.fromEntries(lean.columns.map((c) => [c, row[c] ?? ''])), canonical: `https://lhcom.bbird.live${row.path}` }));
        const body = JSON.stringify({
          total: rows.length, offset, limit, data, columns: ['path', ...lean.columns, 'canonical'], ':type': 'sheet',
        });
        recorded.set(key, { status: 200, headers: [['content-type', 'application/json']], body: new TextEncoder().encode(body) });
      }
    } else {
      await live(req.method, req.url);
    }
  }
  const hit = recorded.get(key);
  if (!hit) throw new Error(`not recorded: ${key}`);
  return new Response(hit.status === 304 || req.method === 'HEAD' || hit.status === 301 || hit.status === 302 ? null : hit.body, { status: hit.status, headers: hit.headers });
};

// --gc (with node --expose-gc): garbage collected before each sample, outside it; it also drops
// the JIT's warm state, so all numbers rise. The minimum is reported next to the median: the
// sample without a collection in it (a 4.5 MB answer's buffers are collected in a later one)
const cpu = async (fn) => {
  if (argv.includes('--gc') && globalThis.gc) globalThis.gc();
  const t = process.cpuUsage();
  const out = await fn();
  const d = process.cpuUsage(t);
  return { ms: (d.user + d.system) / 1000, out };
};
const resetSearchData = await import('./src/search-data.js').then((m) => m.resetSearchDataCache).catch(() => () => {});
const reset = () => {
  resetMarketCache(); resetSheetCache(); resetSearchCache(); resetSearchData();
};
const HEADERS = ['content-type', 'cache-tag', 'cache-control', 'x-lh-edge-route', 'location'];
const request = (path) => {
  const m = path.match(/^SEARCH (\S+) (\S+) (.*)$/);
  if (!m) return new Request(`https://${HOST}${path}`);
  return new Request(`https://${HOST}/service/secured/api/search`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json', 'x-portal': 'LH', 'x-portal-site': m[1], 'x-portal-language': m[2],
    },
    body: JSON.stringify({ phrase: m[3] }),
  });
};
const ask = async (path, e) => {
  const resp = await worker.fetch(request(path), e, { waitUntil: () => {}, passThroughOnException: () => {} });
  const body = new Uint8Array(await resp.arrayBuffer());
  return { status: resp.status, headers: HEADERS.map((h) => `${h}: ${resp.headers.get(h)}`).join('\n'), body };
};
const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const same = (a, b) => a.status === b.status && a.headers === b.headers && a.body.length === b.body.length && a.body.every((x, i) => x === b.body[i]);

// the old paths: the full indexes, the parsed JSON, the search over the index, 100 URLs a sitemap file
const FULL = env({
  MARKET_MODEL: 'full', SEARCH_DATA: 'off', MARKET_SITEMAP: 'fixed', SITEMAP_INDEX: 'off',
});
const LEAN = env(opt('stored') === 'off' ? { SITEMAP_INDEX: 'off' } : {});
const paths = (argv.includes('--compare') || opt('dump')) && !listed.length ? COMPARE : PATHS;
// --mode full|lean: only one of them (a profile of one path; a dump of code without lean sources)
const MODES = [['full', FULL], ['lean', LEAN]].filter(([m]) => argv.includes('--compare') || !opt('mode') || opt('mode') === m);
// first pass: record the origin's answers
for (const [, e] of MODES) {
  reset();
  await marketModel(new Request(`https://${HOST}/`), e);
  for (const p of paths) { reset(); await ask(p, e); }
}
// the sitemap index as the Action stores it, per mode
if (sitemapIndexKey) {
  for (const [, e] of MODES) {
    reset();
    const req = new Request(`https://${HOST}/sitemap/sitemap_lh.xml`);
    const roots = servedMarketRoots(req, e);
    const sources = await sitemapIndexSources(req, e, roots);
    if (sources) {
      const key = await sitemapIndexKey(sources, e, roots);
      const xml = sitemapIndexOf(sources, e);
      storedIndex.set(`/sitemap-index/${storedNames(key).xml}`, new TextEncoder().encode(xml));
      storedIndex.set(`/sitemap-index/${storedNames(key).gz}`, new Uint8Array(zlib.gzipSync(xml)));
    }
  }
}
record = false;
if (opt('record')) {
  fs.writeFileSync(opt('record'), JSON.stringify(Object.fromEntries([...recorded].map(([k, v]) => [k, { ...v, body: Buffer.from(v.body).toString('base64') }]))));
}
const bytes = [...recorded.values()].reduce((s, r) => s + r.body.byteLength, 0);
console.log(`recorded ${recorded.size} origin answers, ${(bytes / 1e6).toFixed(1)} MB; ${PILOTS.length} pilot roots${opt('roots') ? ' (synthetic rows added)' : ''}; sitemap index ${opt('stored') === 'off' || !sitemapIndexKey ? 'made' : 'stored'}`);

if (opt('dump')) {
  // every compared answer's status, main headers and body as a hash, per mode: to compare two
  // code versions (run this file against each, then diff the files)
  const out = {};
  for (const [label, e] of MODES) {
    for (const p of paths) {
      reset();
      const a = await ask(p, e);
      out[`${label} ${p}`] = crypto.createHash('sha256').update(`${a.status}\n${a.headers}\n`).update(a.body).digest('hex')
        .slice(0, 16);
      // --save <dir>: the answers themselves, to see a difference
      if (opt('save')) fs.writeFileSync(`${opt('save')}/${label}${p.replace(/\//g, '_')}`, `${a.status}\n${a.headers}\n\n${Buffer.from(a.body).toString('utf8')}`);
    }
  }
  fs.writeFileSync(opt('dump'), `${JSON.stringify(out, null, 1)}\n`);
  console.log(`dump: ${Object.keys(out).length} answers -> ${opt('dump')}`);
  process.exit(0);
}

if (argv.includes('--compare')) {
  const differ = [];
  for (const p of paths) {
    reset();
    const a = await ask(p, FULL);
    reset();
    const b = await ask(p, LEAN);
    if (!same(a, b)) differ.push(`${p}: full ${a.status} ${a.body.length} B, lean ${b.status} ${b.body.length} B${a.headers !== b.headers ? ` headers ${JSON.stringify(a.headers)} vs ${JSON.stringify(b.headers)}` : ''}`);
  }
  // the sitemap index's counts against the entries themselves, every pilot root, both sources
  for (const [label, e] of [['full', FULL], ['lean', LEAN]]) {
    reset();
    const model = await marketModel(new Request(`https://${HOST}/`), e);
    PILOTS.forEach((r) => {
      const [n, entries] = [sitemapCount(model, r), sitemapEntries(model, r).length];
      if (n !== entries) differ.push(`sitemapCount ${label} ${r}: ${n}, entries ${entries}`);
    });
  }
  console.log(`compare: ${paths.length} answers, ${paths.length - differ.length} the same byte for byte${differ.length ? `, ${differ.length} differ:` : ''}; sitemap counts of ${PILOTS.length} roots checked`);
  differ.slice(0, 20).forEach((d) => console.log(`  ${d}`));
  process.exit(differ.length ? 1 : 0);
}

for (const [label, e] of MODES) {
  const model = [];
  for (let i = 0; i < runs; i += 1) {
    reset();
    model.push((await cpu(() => marketModel(new Request(`https://${HOST}/`), e))).ms);
  }
  console.log(`[${label}] model (cold): median ${median(model).toFixed(1)} ms CPU (${model.map((x) => x.toFixed(1)).join(', ')})`);
  for (const p of paths) {
    const cold = [];
    const warm = [];
    let last;
    for (let i = 0; i < runs; i += 1) {
      reset();
      const c = await cpu(() => ask(p, e));
      cold.push(c.ms);
      last = c.out;
      warm.push((await cpu(() => ask(p, e))).ms);
    }
    console.log(`[${label}] ${p}: ${last.status} ${last.body.length} B; cold median ${median(cold).toFixed(1)} (min ${Math.min(...cold).toFixed(1)}) ms, warm median ${median(warm).toFixed(1)} (min ${Math.min(...warm).toFixed(1)}) ms CPU`);
  }
}
