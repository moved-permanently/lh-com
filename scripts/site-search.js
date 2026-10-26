/**
 * The site search: one scoring for the search-results block and lh-edge's
 * POST /service/secured/api/search (www's search API), over the locale's search index
 * (/<cc>/<ll>/search-index.json, helix-query.yaml search-<cc>-<ll>).
 *
 * - Phrase and page texts are folded: lower case, accents dropped (ä -> a, é -> e), ß -> ss;
 *   the phrase is split into terms at every character that is not a letter or a digit, and
 *   short words that carry no meaning (and, the, und, für ...) are dropped unless nothing
 *   else is left.
 * - Every term must match: a word of the page that starts with the term (German compounds:
 *   "gepack" finds "gepackstuck"; "check" finds "check-in").
 * - Words joined by inner punctuation also count joined ("Wi-Fi" is found by "wifi"); a word
 *   that holds a term of six letters or more inside counts half (compounds: "Ticketumbuchungen"
 *   for "Umbuchung"), a longer word starting with the term 0.8.
 * - Ranking: BM25F over the fields title (boost 5), headings (2), path (4: the page's name and
 *   its parent's, from the Parent metadata, as www's search reads its content tree),
 *   description (4) and content (1), with length normalisation (b 0.9, k1 1.2) and the terms'
 *   rarity in the locale; 20 % more when the whole phrase stands in the title. Ties: the shorter
 *   path first. Weights tuned on www's recorded answers (compare-search.mjs).
 * - Pages with hide-in-search: true are left out. At most 30 results (www's limit).
 * - The excerpt: www's description field is a text excerpt around the first match; here the
 *   description when it holds a match, else the content around the first match, about 220
 *   characters, cut at word boundaries with "..." where it was cut.
 */

export const MAX_RESULTS = 30;
export const PAGE_SIZE = 10;
const WEIGHTS = {
  title: 5, headings: 2, path: 4, description: 4, content: 1,
};
const STOPWORDS = new Set([
  'a', 'an', 'and', 'or', 'the', 'of', 'to', 'in', 'on', 'for', 'with', 'at', 'by', 'from', 'is', 'my',
  'und', 'oder', 'der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einen', 'einem', 'einer',
  'fur', 'mit', 'von', 'zu', 'zum', 'zur', 'im', 'am', 'an', 'auf', 'bei', 'ist', 'mein', 'meine',
]);
const EXCERPT_LENGTH = 220;

/** Lower case, accents dropped, ß as ss. */
export function fold(text) {
  return String(text || '').toLowerCase().replace(/ß/g, 'ss').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * The words of a text, folded; a word written with inner punctuation also counts joined
 * ("Wi-Fi" gives wi, fi and wifi; "check-in" check, in and checkin).
 */
export function words(text) {
  const out = [];
  fold(text).split(/\s+/).forEach((chunk) => {
    const parts = chunk.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
    out.push(...parts);
    if (parts.length > 1) out.push(parts.join(''));
  });
  return out;
}

/** The terms of a phrase (stop words dropped unless only stop words are left). */
export function terms(phrase) {
  const all = [...new Set(fold(phrase).split(/[^\p{L}\p{N}]+/u).filter(Boolean))];
  const meaningful = all.filter((t) => !STOPWORDS.has(t));
  return [...new Set(meaningful.length ? meaningful : all)];
}

const list = (v) => {
  if (Array.isArray(v)) return v.map(String);
  const s = String(v ?? '').trim();
  if (!s) return [];
  if (s.startsWith('[')) {
    try {
      const a = JSON.parse(s);
      if (Array.isArray(a)) return a.map(String);
    } catch (e) { /* not a list */ }
  }
  return [s];
};

/** The page title without the site suffix ("Baggage | Lufthansa" -> "Baggage"). */
export function headline(title) {
  return String(title || '').replace(/\s*\|\s*Lufthansa\s*$/i, '').trim();
}

// the documents' style markers ("Baggage {heading-small}", "{divider-25}"): not text
const MARKERS = /\s*\{[a-z0-9-]+(?: [a-z0-9-]+)*\}/g;
const clean = (s) => String(s || '').replace(MARKERS, '').replace(/\s+/g, ' ').trim();

/** A search index row with its folded fields. */
export function prepareRow(row) {
  const fields = {
    title: clean(headline(row.title)),
    headings: list(row.headings).map(clean).filter(Boolean).join(' • '),
    description: clean(row.description),
    content: list(row.content).map(clean).filter(Boolean).join(' '),
    // the page's own name and its parent's (www's search reads its content tree: it finds
    // /de/de/check-in-baggage, below all-check-in, for "Check-in")
    path: [row.path, row.parent].map((v) => String(v || '').split('/').slice(3).join(' ')).join(' ').trim(),
  };
  return {
    row,
    fields,
    words: Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, words(v)])),
    hidden: /^(true|yes|1)$/i.test(String(row['hide-in-search'] || '').trim()),
  };
}

// a word that holds the term inside (German compounds: "Ticketumbuchungen" for "umbuchung",
// "Handgepäck" for "gepäck") counts for terms of six letters or more, at half weight
const INFIX_MIN = 6;

function wordMatch(w, term) {
  if (w.startsWith(term)) return w === term || /^(es|en|s|e|n)$/.test(w.slice(term.length)) ? 1 : 0.8;
  if (term.length >= INFIX_MIN && w.includes(term)) return 0.5;
  return 0;
}

/** How often a term stands in each field (a partial match counts as its weight). */
function termCounts(prepared, term) {
  const counts = {};
  let any = false;
  Object.keys(WEIGHTS).forEach((field) => {
    let c = 0;
    prepared.words[field].forEach((w) => { c += wordMatch(w, term); });
    counts[field] = c;
    if (c) any = true;
  });
  return any ? counts : null;
}

// BM25F (www's search is a full text index with length-normalised relevance): field boosts are
// WEIGHTS, length normalisation B per field, saturation K1
const K1 = 1.2;
const B = 0.9;

function bm25(counts, prepared, avg, idf) {
  let tf = 0;
  Object.entries(WEIGHTS).forEach(([field, weight]) => {
    if (!counts[field]) return;
    const len = prepared.words[field].length || 1;
    tf += (weight * counts[field]) / (1 - B + (B * len) / (avg[field] || 1));
  });
  return idf * (tf / (K1 + tf));
}

/**
 * The pages of an index that match a phrase, best first.
 * @param {Array} rows prepareRow() results (or raw rows)
 * @param {string} phrase
 * @param {{limit?: number}} [options]
 * @returns {Array<{row, score, prepared}>}
 */
export function search(rows, phrase, { limit = MAX_RESULTS } = {}) {
  const ts = terms(phrase);
  if (!ts.length) return [];
  const whole = terms(phrase).join(' ');
  const prepared = rows.map((r) => (r && r.words ? r : prepareRow(r))).filter((r) => !r.hidden);
  const avg = {};
  Object.keys(WEIGHTS).forEach((field) => {
    avg[field] = prepared.reduce((n, r) => n + r.words[field].length, 0) / (prepared.length || 1);
  });
  // per term: the pages that hold it, and its rarity
  const perTerm = ts.map((t) => {
    const hits = new Map();
    prepared.forEach((r) => {
      const c = termCounts(r, t);
      if (c) hits.set(r, c);
    });
    const n = prepared.length;
    return { hits, idf: Math.log(1 + (n - hits.size + 0.5) / (hits.size + 0.5)) };
  });
  const out = [];
  prepared.forEach((r) => {
    if (!perTerm.every((t) => t.hits.has(r))) return;
    let score = perTerm.reduce((n, t) => n + bm25(t.hits.get(r), r, avg, t.idf), 0);
    if (whole && fold(r.fields.title).replace(/[^\p{L}\p{N}]+/gu, ' ').includes(whole)) score *= 1.2;
    out.push({ row: r.row, score, prepared: r });
  });
  out.sort((a, b) => b.score - a.score || String(a.row.path).length - String(b.row.path).length
    || String(a.row.path).localeCompare(String(b.row.path)));
  return out.slice(0, limit);
}

/** Where the terms stand in a text: [{start, end}] (word starts that match a term). */
export function matches(text, ts) {
  const out = [];
  const re = /[\p{L}\p{N}]+/gu;
  let m = re.exec(text);
  while (m) {
    const w = fold(m[0]);
    if (ts.some((t) => w.startsWith(t))) {
      const t = ts.filter((x) => w.startsWith(x)).sort((a, b) => b.length - a.length)[0];
      // the matched part of the word: the term's length in the original (folding keeps lengths
      // except for ß, which is then taken whole)
      const len = /ß/.test(m[0]) ? m[0].length : Math.min(t.length, m[0].length);
      out.push({ start: m.index, end: m.index + len });
    }
    m = re.exec(text);
  }
  return out;
}

/**
 * The excerpt of a result: { text, highlights: [{start, end}] } around the first match in the
 * content, else the description (as it is when nothing matches there).
 */
export function excerpt(prepared, phrase) {
  const ts = terms(phrase);
  const pick = (text) => {
    const hits = matches(text, ts);
    if (!hits.length) return null;
    const first = hits[0].start;
    let start = Math.max(0, first - 60);
    if (start > 0) {
      const space = text.lastIndexOf(' ', start);
      start = space > 0 ? space + 1 : start;
    }
    let end = Math.min(text.length, start + EXCERPT_LENGTH);
    if (end < text.length) {
      const space = text.lastIndexOf(' ', end);
      if (space > first) end = space;
    }
    const cut = text.slice(start, end).trim();
    const offset = text.indexOf(cut, start);
    const suffix = end < text.length ? ' ...' : '';
    return {
      text: `${cut}${suffix}`,
      highlights: hits.filter((h) => h.start >= offset && h.end <= offset + cut.length)
        .map((h) => ({ start: h.start - offset, end: h.end - offset })),
    };
  };
  const { content, description } = prepared.fields;
  return pick(description) || pick(content) || { text: description, highlights: [] };
}

const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/** An excerpt as www's description HTML: the matches in <strong>. */
export function excerptHtml({ text, highlights }) {
  let html = '';
  let at = 0;
  highlights.forEach(({ start, end }) => {
    html += `${escapeHtml(text.slice(at, start))}<strong>${escapeHtml(text.slice(start, end))}</strong>`;
    at = end;
  });
  return html + escapeHtml(text.slice(at));
}

/** www's answer for a phrase: { results: [{ link, headline, description }], total, pageSize }. */
export function searchAnswer(rows, phrase) {
  const found = search(rows, phrase);
  return {
    results: found.map(({ row, prepared }) => ({
      link: row.path,
      headline: prepared.fields.title,
      description: excerptHtml(excerpt(prepared, phrase)),
    })),
    total: found.length,
    pageSize: PAGE_SIZE,
  };
}
