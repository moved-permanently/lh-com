/**
 * The sitemap index built ahead (build-sitemap-index.mjs, .github/workflows/sitemap-index.yaml):
 * with every served market root the index lists every root's files, and the alternates budget
 * (SITEMAP_ALTERNATES) gives each root more files as roots are added, so its size grows with the
 * square of the roots (143 KB with 100, 503 KB with 187); making and gzipping it costs 16 to
 * 24 ms of CPU with 187 roots (bench-market.mjs; Workers Free: 10 ms). The Action makes it with
 * this code from the origin and keeps it on the branch `sitemap-index`, under a key of what it
 * is made of (sitemapIndexKey: the static file, the www host, the served roots, each root's
 * number of files); lh-edge works the key out from the model as before (no index text, no gzip)
 * and serves the stored bytes when they are there. Else (a content change or a locale table
 * change the Action hasn't seen yet, the var SITEMAP_INDEX=off) it makes the index as before.
 * The stored .gz is Node's gzip, the same bytes as the Workers runtime's CompressionStream.
 */
import { LOCALE_TABLE } from '../../../../scripts/locale-table.js'; // eslint-disable-line import/no-relative-packages

/** Bumped when the index's text changes for the same sources: older stored files are not used. */
export const SITEMAP_INDEX_FORMAT = 1;

const hex = (buffer) => [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');

/** The key of an index (sources: sitemapIndexSources): sha256 (32 hex) of what it is made of. */
export async function sitemapIndexKey(sources, env, roots) {
  const text = JSON.stringify([SITEMAP_INDEX_FORMAT, env.WWW_HOST || 'www.lufthansa.com', sources.xml,
    roots.map((r, i) => `${r}=${(sources.names[i] || []).length}`)]);
  return hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))).slice(0, 32);
}

/** The stored files' base URL (var SITEMAP_INDEX_HOST, else the origin's sitemap-index branch). */
const base = (env) => `https://${env.SITEMAP_INDEX_HOST || String(env.ORIGIN).replace(/^main--/, 'sitemap-index--')}/sitemap-index`;

/** The stored file names of a key: the index and its gzip. */
export const storedNames = (key) => ({ xml: `${key}.xml`, gz: `${key}.gz.bin` });

/** The stored index of a key (gz: its gzip) as a Response body, or null when it isn't stored. */
export async function storedIndex(env, key, gz) {
  if (env.SITEMAP_INDEX === 'off') return null;
  const names = storedNames(key);
  try {
    // a key's file never changes: kept a day; a missing one a minute
    const resp = await fetch(`${base(env)}/${gz ? names.gz : names.xml}`, {
      cf: { cacheEverything: true, cacheTtlByStatus: { '200-299': 86400, 404: 60, '500-599': 0 } },
    });
    return resp.ok ? resp.body : null;
  } catch (e) {
    return null;
  }
}

// FNV-1a (32 bit) of the locale table, made once per isolate
let tableHash = null;
/** A short hash of the locale table (the sitemaps' edge cache key changes with it). */
export function localeTableHash() {
  if (tableHash === null) {
    const text = JSON.stringify(LOCALE_TABLE);
    let h = 0x811c9dc5;
    /* eslint-disable no-bitwise -- FNV-1a */
    for (let i = 0; i < text.length; i += 1) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    /* eslint-enable no-bitwise */
    tableHash = h.toString(16).padStart(8, '0');
  }
  return tableHash;
}
