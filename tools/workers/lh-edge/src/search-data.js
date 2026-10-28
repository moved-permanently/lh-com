/**
 * The site search from prebuilt search data (README "Site search"): preparing a locale's search
 * index (4.5 MB, 680,000 words) takes about 550 ms of CPU and a search over it 30 to 90 ms, far
 * over Workers Free's 10 ms. A GitHub Action (.github/workflows/search-data.yaml, build-search-
 * data.mjs) builds per locale what the search reads, with the site's own preparation
 * (scripts/site-search.js prepareRow), and keeps it on the branch `search-data`, served by
 * aem.live. Files per locale (<cc>-<ll>/):
 * - meta.txt: format, code (scripts/site-search.js's hash), stamp of the index it was built from
 *   (rows, newest and summed lastModified), the searchable pages in index order:
 *   [path, title, word counts of title, headings, path, description, content];
 * - vocab.txt: every word, sorted, one per line with where its postings stand:
 *   word TAB offset TAB length (base 36), searched as text (never split: 50,000 words);
 * - postings.bin: per word its occurrences, unsigned LEB128 numbers: per page and field the page
 *   (difference to the last), the field, the count, the positions (differences); read as bytes
 *   (no text decode), only the words a phrase matches;
 * - t-<k>.txt: per page (meta order) [description, content] as the excerpt reads them, 8 pages
 *   a file (a search reads its results' files only).
 * The score is the same arithmetic as site-search.js search() (counts added in the words' order,
 * BM25F, ties by path), so the answer is the same byte for byte. The data counts only while its
 * stamp equals the index's (from the lean model index, src/market-lean.js), its format and code
 * are this version's; else (and with the var SEARCH_DATA=off) the search reads the index as
 * before. At most 4 + 30 subrequests (Workers Free allows 50).
 */
/* eslint-disable import/no-relative-packages */
import {
  prepareRow, terms, fold, excerpt, excerptHtml, wordMatch, bm25, WEIGHTS, MAX_RESULTS, PAGE_SIZE,
} from '../../../../scripts/site-search.js';
/* eslint-enable import/no-relative-packages */
import { leanSource, leanModelPath } from './market-lean.js';

/** The data's format; a change makes older data unused until the Action rebuilt it. */
export const SEARCH_DATA_FORMAT = 1;
/**
 * sha256 (16 hex) of scripts/site-search.js the data must be built with (test/search-data.test.mjs
 * checks it is the file's): data built with other scoring code is not used.
 */
export const SEARCH_CODE = '493e9892aee8611b';
const FIELDS = Object.keys(WEIGHTS);
export const DOCS_PER_CHUNK = 8;
const TTL_MS = 60000;

const b36 = (n) => n.toString(36);
const dir = (locale) => locale.replace('/', '-');

/** The stamp of a locale's index: {total, max, sum} of its rows' lastModified. */
export function stampOf(values, total) {
  let max = 0;
  let sum = 0;
  values.forEach((v) => {
    const n = Number(v) || 0;
    if (n > max) max = n;
    sum += n;
  });
  return { total, max, sum };
}

/** Unsigned LEB128. */
function varint(out, n) {
  let v = n;
  while (v >= 128) {
    out.push((v % 128) + 128);
    v = Math.floor(v / 128);
  }
  out.push(v);
}

/**
 * The search data of a locale's index rows: {name: text or Uint8Array}. code: SEARCH_CODE of the
 * scoring the data is built with.
 */
export function buildSearchData(rows, code = SEARCH_CODE) {
  const prepared = rows.filter((r) => r && r.path).map(prepareRow).filter((r) => !r.hidden);
  // word -> [[page, field, positions]] in page, field order
  const postings = new Map();
  prepared.forEach((r, d) => {
    FIELDS.forEach((field, f) => {
      const seen = new Map();
      r.words[field].forEach((w, pos) => {
        if (!seen.has(w)) seen.set(w, []);
        seen.get(w).push(pos);
      });
      seen.forEach((positions, w) => {
        if (!postings.has(w)) postings.set(w, []);
        postings.get(w).push([d, f, positions]);
      });
    });
  });
  const vocab = [...postings.keys()].sort();
  const bytes = [];
  const lines = vocab.map((w) => {
    const start = bytes.length;
    let last = 0;
    postings.get(w).forEach(([d, f, positions]) => {
      varint(bytes, d - last);
      last = d;
      bytes.push(f);
      varint(bytes, positions.length);
      let p0 = 0;
      positions.forEach((p) => { varint(bytes, p - p0); p0 = p; });
    });
    return `${w}\t${b36(start)}\t${b36(bytes.length - start)}`;
  });
  const files = {
    'meta.txt': JSON.stringify({
      format: SEARCH_DATA_FORMAT,
      code,
      stamp: stampOf(rows.map((r) => r && r.lastModified), rows.length),
      words: vocab.length,
      docs: prepared.map((r) => [
        r.row.path, r.fields.title, ...FIELDS.map((field) => r.words[field].length),
      ]),
    }),
    'vocab.txt': `\n${lines.join('\n')}\n`,
    'postings.bin': Uint8Array.from(bytes),
  };
  for (let k = 0; k * DOCS_PER_CHUNK < prepared.length; k += 1) {
    files[`t-${k}.txt`] = prepared.slice(k * DOCS_PER_CHUNK, (k + 1) * DOCS_PER_CHUNK)
      .map((r) => JSON.stringify([r.fields.description, r.fields.content])).join('\n');
  }
  return files;
}

// per isolate: the data files (a minute), parsed forms of them
const cache = new Map();

/** Drops what was read (tests). */
export function resetSearchDataCache() {
  cache.clear();
}

/** The data host's base URL (var SEARCH_DATA_HOST, else the origin's search-data branch). */
const base = (env) => `https://${env.SEARCH_DATA_HOST || String(env.ORIGIN).replace(/^main--/, 'search-data--')}/search-data`;

/** A data file (text, or bytes for .bin), null when it is missing; a minute per isolate. */
function file(env, locale, name) {
  const url = `${base(env)}/${dir(locale)}/${name}`;
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.promise;
  const promise = fetch(url, { cf: { cacheTtl: 60, cacheEverything: true } })
    .then((r) => {
      if (!r.ok) return null;
      return name.endsWith('.bin') ? r.arrayBuffer().then((b) => new Uint8Array(b)) : r.text();
    }).catch(() => null);
  cache.set(url, { at: Date.now(), promise });
  return promise;
}

/** A parsed form of a data file, kept with its content. */
async function parsed(env, locale, name, parse) {
  const content = await file(env, locale, name);
  if (content === null) return null;
  const key = `${base(env)}/${dir(locale)}/${name}#parsed`;
  const hit = cache.get(key);
  if (hit && hit.content === content) return hit.value;
  const value = parse(content);
  cache.set(key, { content, value });
  return value;
}

// the stamp of a lean source's text, kept with the source
const stamps = new WeakMap();
function leanStamp(src) {
  if (!stamps.has(src)) {
    const values = [];
    src.parts.forEach((t) => {
      // a number in the origin's indexes (a string in some fixtures)
      [...t.matchAll(/"lastModified":(?:"(\d*)"|(\d+))/g)].forEach((m) => values.push(m[1] ?? m[2]));
    });
    stamps.set(src, stampOf(values, src.total));
  }
  return stamps.get(src);
}

/** A vocab line at a position: {word, offset, length}. */
function lineAt(vocab, start) {
  const end = vocab.indexOf('\n', start);
  const [word, offset, length] = vocab.slice(start, end).split('\t');
  return { word, offset: parseInt(offset, 36), length: parseInt(length, 36) };
}

/**
 * The vocabulary's words that a term matches, with their weight: [{word, offset, length, m}].
 * Prefix matches are one run of lines (sorted), the first found as "\n" + term; a term of six
 * letters or more also matches inside words (wordMatch's infix rule), found with indexOf.
 */
function matching(vocab, term) {
  const out = [];
  for (let i = vocab.indexOf(`\n${term}`); i >= 0;) {
    const line = lineAt(vocab, i + 1);
    if (!line.word.startsWith(term)) break;
    out.push(line);
    i = vocab.indexOf('\n', i + 1);
    if (i >= vocab.length - 1) break;
  }
  if (term.length >= 6) {
    let lastLine = -1;
    for (let i = vocab.indexOf(term); i >= 0; i = vocab.indexOf(term, i + 1)) {
      const start = vocab.lastIndexOf('\n', i) + 1;
      const tab = vocab.indexOf('\t', start);
      // inside the word (not its offsets), not at its start (a prefix match), each line once
      if (i < tab && i > start && start !== lastLine && i + term.length <= tab) {
        lastLine = start;
        const line = lineAt(vocab, start);
        if (!line.word.startsWith(term)) out.push(line);
      }
    }
  }
  return out.map((x) => ({ ...x, m: wordMatch(x.word, term) })).filter((x) => x.m > 0);
}

/** The occurrences of a word: [[page, field, positions]] from its postings bytes. */
function occurrences(bytes, offset, length) {
  const out = [];
  let i = offset;
  const end = offset + length;
  const read = () => {
    let n = 0;
    let mul = 1;
    let b;
    do {
      b = bytes[i];
      i += 1;
      n += (b % 128) * mul;
      mul *= 128;
    } while (b >= 128);
    return n;
  };
  let d = 0;
  while (i < end) {
    d += read();
    const f = bytes[i];
    i += 1;
    const count = read();
    const positions = [];
    let p = 0;
    for (let k = 0; k < count; k += 1) {
      p += read();
      positions.push(p);
    }
    out.push([d, f, positions]);
  }
  return out;
}

/**
 * www's answer for a phrase from the locale's search data, as searchAnswer(rows, phrase), or null
 * when the data can't be used (missing, another format or code, not the index's state).
 */
export async function dataSearchAnswer(request, env, locale, phrase) {
  if (env.SEARCH_DATA === 'off') return null;
  const [meta, lean] = await Promise.all([
    parsed(env, locale, 'meta.txt', (t) => JSON.parse(t)),
    leanSource(request, env, leanModelPath(locale), `/${locale}/search-index.json`),
  ]);
  if (!meta || !lean) return null;
  if (meta.format !== SEARCH_DATA_FORMAT || meta.code !== SEARCH_CODE) return null;
  const live = leanStamp(lean);
  const { stamp } = meta;
  if (live.total !== stamp.total || live.max !== stamp.max || live.sum !== stamp.sum) return null;
  const ts = terms(phrase);
  const answer = (results) => ({ results, total: results.length, pageSize: PAGE_SIZE });
  if (!ts.length) return answer([]);
  const whole = terms(phrase).join(' ');
  const { docs } = meta;
  const n = docs.length;
  // the pages' word counts as search() reads them (prepared.words[field].length)
  const lengths = (d) => Object.fromEntries(FIELDS.map((field, f) => [
    field, { length: docs[d][2 + f] },
  ]));
  const avg = {};
  FIELDS.forEach((field, f) => {
    avg[field] = docs.reduce((s, doc) => s + doc[2 + f], 0) / (n || 1);
  });
  const [vocab, postings] = await Promise.all([
    file(env, locale, 'vocab.txt'), file(env, locale, 'postings.bin'),
  ]);
  if (vocab === null || postings === null) return null;
  const perTerm = ts.map((t) => {
    // per page and field the matches' (position, weight), added in position order as
    // termCounts adds wordMatch over the field's words
    const at = new Map();
    matching(vocab, t).forEach(({ offset, length, m }) => {
      occurrences(postings, offset, length).forEach(([d, f, positions]) => {
        const key = d * FIELDS.length + f;
        if (!at.has(key)) at.set(key, []);
        positions.forEach((p) => at.get(key).push([p, m]));
      });
    });
    const hits = new Map();
    at.forEach((list, key) => {
      const d = Math.floor(key / FIELDS.length);
      const f = key % FIELDS.length;
      list.sort((a, b) => a[0] - b[0]);
      let c = 0;
      list.forEach(([, m]) => { c += m; });
      if (!hits.has(d)) hits.set(d, Object.fromEntries(FIELDS.map((field) => [field, 0])));
      hits.get(d)[FIELDS[f]] = c;
    });
    return { hits, idf: Math.log(1 + (n - hits.size + 0.5) / (hits.size + 0.5)) };
  });
  const found = [];
  for (let d = 0; d < n; d += 1) {
    if (perTerm.every((t) => t.hits.has(d))) {
      const words = lengths(d);
      let score = perTerm.reduce((s, t) => s + bm25(t.hits.get(d), { words }, avg, t.idf), 0);
      if (whole && fold(docs[d][1]).replace(/[^\p{L}\p{N}]+/gu, ' ').includes(whole)) score *= 1.2;
      found.push({ d, path: docs[d][0], score });
    }
  }
  found.sort((a, b) => b.score - a.score || String(a.path).length - String(b.path).length
    || String(a.path).localeCompare(String(b.path)));
  const top = found.slice(0, MAX_RESULTS);
  // the results' texts (description, content) for the excerpts
  const textChunks = [...new Set(top.map((x) => Math.floor(x.d / DOCS_PER_CHUNK)))];
  const texts = {};
  const tgot = await Promise.all(textChunks.map((k) => parsed(env, locale, `t-${k}.txt`, (t) => t.split('\n'))));
  if (tgot.some((g) => !g)) return null;
  textChunks.forEach((k, j) => { texts[k] = tgot[j]; });
  return answer(top.map(({ d, path }) => {
    const chunk = texts[Math.floor(d / DOCS_PER_CHUNK)];
    const [description, content] = JSON.parse(chunk[d % DOCS_PER_CHUNK]);
    return {
      link: path,
      headline: docs[d][1],
      description: excerptHtml(excerpt({ fields: { description, content } }, phrase)),
    };
  }));
}
