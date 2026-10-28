/**
 * The market model's lean sources (helix-query.yaml market-model-* and market-llms-*): per
 * language version and root with its own documents (de/en, de/de, at/de, gb/en) and for the
 * market roots' own documents, the few columns lh-edge reads instead of the multi-MB search
 * indexes. Read as text and never parsed whole on a page's path: a row is found by its
 * `{"path":"…",` (inside a JSON string a quote is escaped, so that text only starts a row), a
 * path set is built once a source is asked often, and only the rows with a value in a sparse
 * column (markets, robots, primary-language-url) are parsed. The sitemaps parse a source whole
 * (rows in index order, as before).
 *
 * A source counts only when it is complete: its total equals the full index's (a one-row read of
 * it), so a source still filling after its definition was added (pages not republished yet) is
 * not used; the caller then reads the full indexes as before.
 */
import { originFetch } from './edge.js';

const TTL_MS = 60000;
const PAGE = 1000;
// lookups by text search before a source builds its path set
const SET_AFTER = 2;
const cache = new Map();

/** The columns of the lean sources (helix-query.yaml, tools/markets/lean-indexes.mjs). */
export const MODEL_COLUMNS = ['markets', 'robots', 'primary-language-url', 'lastModified'];
export const LLMS_COLUMNS = ['title', 'description', 'markets', 'llms-include', 'llms-title', 'llms-description', 'llms-category', 'ai-guidance'];

/** The lean model source of a root ('de/en' -> /market-model/de-en.json), and of the own pages. */
export const leanModelPath = (root) => `/market-model/${root ? root.replace('/', '-') : 'own'}.json`;
/** The lean llms source of a root, and of the own pages. */
export const leanLlmsPath = (root) => `/market-llms/${root ? root.replace('/', '-') : 'own'}.json`;

/** Drops what was read (tests). */
export function resetLeanCache() {
  cache.clear();
}

const headNumber = (text, name) => {
  const m = text.slice(0, 200).match(new RegExp(`"${name}":(\\d+)`));
  return m ? Number(m[1]) : null;
};

/** The pages of a sheet as text, or null (missing, not a sheet). */
async function sheetPages(request, env, path) {
  const get = new Request(request.url, { method: 'GET', headers: { accept: 'application/json' } });
  const parts = [];
  let total = 0;
  for (let offset = 0; offset < 50000;) {
    // eslint-disable-next-line no-await-in-loop
    const resp = await originFetch(get, env, `https://${env.ORIGIN}${path}?limit=${PAGE}&offset=${offset}`);
    if (!resp.ok) return null;
    // eslint-disable-next-line no-await-in-loop
    const text = await resp.text();
    total = headNumber(text, 'total');
    const limit = headNumber(text, 'limit');
    if (total === null || !limit || !text.slice(0, 200).includes('"data":[')) return null;
    parts.push(text);
    offset += limit;
    if (offset >= total) break;
  }
  return { parts, total };
}

/** A full index's total, or null: read past its end (no rows, a few hundred bytes). */
async function fullTotal(request, env, path) {
  const get = new Request(request.url, { method: 'GET', headers: { accept: 'application/json' } });
  const resp = await originFetch(get, env, `https://${env.ORIGIN}${path}?limit=1&offset=1000000`);
  if (!resp.ok) return null;
  return headNumber(await resp.text(), 'total');
}

/** The end of the JSON object that starts at i (a flat row: strings, numbers). */
function objectEnd(text, i) {
  let inString = false;
  for (let j = i + 1; j < text.length; j += 1) {
    const c = text.charCodeAt(j);
    if (inString) {
      if (c === 92) j += 1; // backslash: skip the escaped character
      else if (c === 34) inString = false;
    } else if (c === 34) inString = true;
    else if (c === 125) return j + 1;
  }
  return -1;
}

const ROW_START = '{"path":';
const oddBackslashesBefore = (t, i) => {
  let n = 0;
  for (let j = i - 1; j >= 0 && t.charCodeAt(j) === 92; j -= 1) n += 1;
  return n % 2 === 1;
};
const rowAt = (text, i) => JSON.parse(text.slice(i, objectEnd(text, i)));
const needle = (p) => `${ROW_START}${JSON.stringify(p)},`;

/** A lean source: lookups by path, the rows with values in sparse columns, every row. */
export class LeanSource {
  constructor({ parts, total }) {
    this.parts = parts;
    this.total = total;
    this.lookups = 0;
  }

  /** The row of a path (parsed), or null. */
  row(p) {
    const n = needle(p);
    for (let k = 0; k < this.parts.length; k += 1) {
      const i = this.parts[k].indexOf(n);
      if (i >= 0) return rowAt(this.parts[k], i);
    }
    return null;
  }

  /** Whether a row has the path. */
  has(p) {
    if (!this.paths) {
      this.lookups += 1;
      if (this.lookups <= SET_AFTER) return this.parts.some((t) => t.includes(needle(p)));
      // an indexOf loop: about twice as fast as a regex over the source
      this.paths = new Set();
      const start = `${ROW_START}"`;
      this.parts.forEach((t) => {
        for (let i = t.indexOf(start); i >= 0; i = t.indexOf(start, i + start.length)) {
          const from = i + start.length;
          let end = t.indexOf('"', from);
          // a quote inside the path is escaped (an odd run of backslashes before it)
          while (end > 0 && oddBackslashesBefore(t, end)) end = t.indexOf('"', end + 1);
          const raw = t.slice(from, end);
          this.paths.add(raw.includes('\\') ? JSON.parse(`"${raw}"`) : raw);
        }
      });
    }
    return this.paths.has(p);
  }

  /** The rows with a non-empty value in one of the columns (parsed, index order). */
  rowsWith(columns) {
    const key = columns.join(',');
    this.sparse ||= new Map();
    if (this.sparse.has(key)) return this.sparse.get(key);
    const re = new RegExp(`"(?:${columns.map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})":"(?!")`, 'g');
    const rows = [];
    this.parts.forEach((t) => {
      let last = -1;
      [...t.matchAll(re)].forEach((m) => {
        const start = t.lastIndexOf(ROW_START, m.index);
        if (start !== last) {
          last = start;
          rows.push(rowAt(t, start));
        }
      });
    });
    this.sparse.set(key, rows);
    return rows;
  }

  /**
   * The rows whose value in a column passes a test, and the rows of the given paths (parsed,
   * index order, each once).
   */
  rowsWhere(column, test, paths = []) {
    const re = new RegExp(`"${column.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}":"((?:[^"\\\\]|\\\\.)*)"`, 'g');
    const rows = [];
    this.parts.forEach((t, part) => {
      const starts = new Set();
      [...t.matchAll(re)].forEach((m) => {
        if (test(m[1].includes('\\') ? JSON.parse(`"${m[1]}"`) : m[1])) starts.add(t.lastIndexOf(ROW_START, m.index));
      });
      paths.forEach((p) => {
        const i = t.indexOf(needle(p));
        if (i >= 0) starts.add(i);
      });
      [...starts].sort((a, b) => a - b).forEach((i) => rows.push({ part, i }));
    });
    return rows.map(({ part, i }) => rowAt(this.parts[part], i));
  }

  /** The rows whose path starts with a prefix (parsed, index order). */
  rowsUnder(prefix) {
    const n = `${ROW_START}${JSON.stringify(prefix).slice(0, -1)}`;
    const rows = [];
    this.parts.forEach((t) => {
      for (let i = t.indexOf(n); i >= 0; i = t.indexOf(n, i + n.length)) rows.push(rowAt(t, i));
    });
    return rows;
  }

  /** Every row (parsed once, index order). */
  all() {
    this.rows ||= this.parts.flatMap((t) => {
      try {
        const { data } = JSON.parse(t);
        return Array.isArray(data) ? data : [];
      } catch (e) {
        return [];
      }
    });
    return this.rows;
  }
}

/**
 * The lean source at a path if it is complete (its total equals the full index's at fullPath),
 * else null; kept a minute per isolate (a pending read shared).
 */
export function leanSource(request, env, path, fullPath) {
  const key = `${env.ORIGIN}${path}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.promise;
  const promise = (async () => {
    const [pages, total] = await Promise.all([
      sheetPages(request, env, path), fullTotal(request, env, fullPath),
    ]);
    if (!pages || total === null || pages.total !== total) return null;
    return new LeanSource(pages);
  })().catch(() => null);
  cache.set(key, { at: Date.now(), promise });
  return promise;
}
