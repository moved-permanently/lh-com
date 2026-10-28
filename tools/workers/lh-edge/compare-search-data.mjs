/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, max-len, import/no-relative-packages -- dev tooling */
/**
 * The site search from the prebuilt data (src/search-data.js) against the search over the index
 * (scripts/site-search.js searchAnswer), byte for byte, with the live indexes: per locale the
 * data is built here as the Action builds it, then many phrases are answered both ways: every
 * Nth word of the vocabulary, its prefixes (2 to 7 letters), two-word phrases, words with
 * punctuation and case, stop words, phrases with no match.
 *
 * Usage: node --import ./test/cloudflare-workers-shim.mjs compare-search-data.mjs [--every 25] [--locale de/de] [--reference main-site-search.js]
 */
import path from 'node:path';
import * as current from '../../../scripts/site-search.js';
import { buildSearchData, dataSearchAnswer, resetSearchDataCache } from './src/search-data.js';
import { resetLeanCache, MODEL_COLUMNS } from './src/market-lean.js';
import { LIVE_ROOTS } from '../../../scripts/locale.js';

const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
const every = Number(opt('every', 25));
// --reference <file>: the search over the index by another site-search.js (main's: the data path
// and a changed site-search.js against the code before the change)
const { searchAnswer, prepareRow } = opt('reference') ? await import(path.resolve(opt('reference'))) : current;
const ORIGIN = 'main--lh-com--moved-permanently.aem.live';
const env = { ORIGIN, EDGE_TTL: '60' };
const realFetch = globalThis.fetch;
let total = 0;
let differ = 0;
for (const locale of opt('locale') ? [opt('locale')] : LIVE_ROOTS) {
  const sheet = await (await realFetch(`https://${ORIGIN}/${locale}/search-index.json?limit=5000`)).json();
  const rows = sheet.data;
  const files = buildSearchData(rows);
  const lean = JSON.stringify({
    total: rows.length, offset: 0, limit: rows.length, data: rows.map((r) => ({ path: r.path, ...Object.fromEntries(MODEL_COLUMNS.map((c) => [c, r[c] ?? ''])) })), columns: ['path', ...MODEL_COLUMNS], ':type': 'sheet',
  });
  globalThis.fetch = async (input) => {
    const u = new URL((input instanceof Request ? input : new Request(input)).url);
    if (u.hostname.startsWith('search-data--')) {
      const name = u.pathname.split('/').pop();
      return files[name] ? new Response(files[name]) : new Response('', { status: 404 });
    }
    if (u.pathname === `/market-model/${locale.replace('/', '-')}.json`) return new Response(lean);
    if (u.pathname === `/${locale}/search-index.json`) {
      return new Response(JSON.stringify({
        ...sheet, data: [], limit: 0, offset: 1000000,
      }));
    }
    return new Response('', { status: 404 });
  };
  resetSearchDataCache();
  resetLeanCache();
  const prepared = rows.filter((r) => r && r.path).map(prepareRow);
  const vocab = files['vocab.txt'].slice(1, -1).split('\n').map((line) => line.split('\t')[0]);
  const picked = vocab.filter((w, i) => i % every === 0);
  const phrases = new Set(['baggage', 'Gepäck', 'check-in', 'Check In', 'miles and more', 'flight status', 'Wi-Fi', 'wifi', 'the and', 'und', 'a', 'zz-none', 'Umbuchung', 'handgepäck', 'Lounge!!', '  lounge  ', 'ESTA visa', 'São Paulo', 'straße', 'strasse']);
  picked.forEach((w, i) => {
    phrases.add(w);
    [2, 3, 4, 5, 6, 7].forEach((n) => { if (w.length > n) phrases.add(w.slice(0, n)); });
    if (i + 1 < picked.length) phrases.add(`${w} ${picked[i + 1]}`);
    if (w.length >= 8) phrases.add(w.slice(2, 8));
  });
  const req = new Request('https://lhcom.example/service/secured/api/search', { method: 'POST' });
  let n = 0;
  let bad = 0;
  for (const phrase of phrases) {
    const old = JSON.stringify(searchAnswer(prepared, phrase));
    const fromData = await dataSearchAnswer(req, env, locale, phrase);
    n += 1;
    if (!fromData || JSON.stringify(fromData) !== old) {
      bad += 1;
      if (bad <= 5) console.log(`  ${locale} "${phrase}": ${fromData ? 'differs' : 'no data answer'}`);
    }
  }
  total += n;
  differ += bad;
  console.log(`${locale}: ${n} phrases, ${n - bad} the same byte for byte`);
}
globalThis.fetch = realFetch;
console.log(`compare-search-data: ${total} phrases, ${differ} differ`);
process.exit(differ ? 1 : 0);
