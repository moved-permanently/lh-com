/* eslint-disable max-len, no-underscore-dangle */
/**
 * Normalization and field-by-field diff of GraphQL answers (www's recorded answer vs lh-edge's),
 * shared by compare-graphql.mjs and test/graphql.test.mjs. The deliberate differences are
 * listed in compare-graphql.mjs; DELIBERATE counts what was normalized.
 */
/* ----------------------------------------------------------------- normalization */
export const DELIBERATE = {
  tags: 0, richText: 0, plaintext: 0, wwwDataErrors: 0, emptyProperties: 0, created: 0,
};
const RICH = new Set(['html']);

function normHtml(h) {
  if (typeof h !== 'string') return h;
  // the text (tags removed, entities decoded, whitespace collapsed) and the link targets: the
  // markup is Document Authoring's (nesting of bold and links, merged runs, whitespace at their
  // edges, <b>/<strong>, &amp;/&#x26;, empty paragraphs)
  const decode = (t) => t.replace(/&nbsp;|\u00a0/g, ' ').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (m, x) => String.fromCodePoint(parseInt(x, 16)))
    .replace(/&#(\d+);/g, (m, x) => String.fromCodePoint(Number(x)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
  const links = [...h.matchAll(/<a\b[^>]*\bhref="([^"]*)"/gi)].map((m) => decode(m[1]));
  const text = decode(h.replace(/<\/(p|li|h\d|ul|ol)>|<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ''))
    .replace(/[\u200b-\u200d\ufeff]/g, '').replace(/\s+/g, '').trim();
  return `${text} | links: ${links.join(' ')}`;
}

const fixWww = (v) => (typeof v === 'string'
  ? v.replace(/^https?:\/\/[^/]+\/.+?\/(https:\/\/www\.lufthansa\.com\/content\/dam\/.+)$/, '$1').replace(/(^|\/\/)qa-www\.lufthansa\.com/g, '$1www.lufthansa.com')
  : v);

/** www's answer normalized the way lh-edge's is (counting what was deliberate). */
export function normalize(v, key, side) {
  if (Array.isArray(v)) {
    if (key === '_tags') {
      if (side === 'www') DELIBERATE.tags += 1;
      return [...v].sort();
    }
    if (key === 'properties' && !v.length) {
      if (side === 'www') DELIBERATE.emptyProperties += 1;
      return null;
    }
    return v.map((x) => normalize(x, '', side));
  }
  if (v && typeof v === 'object') {
    // jcr:created: www sends different creation times for the same fragment in its list and
    // path queries (a daily 07:00 replication time): not compared
    if (v.name === 'jcr:created' && 'value' in v) {
      if (side === 'www') DELIBERATE.created += 1;
      return { name: v.name, value: '(not compared)' };
    }
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, normalize(x, k, side)]));
  }
  if (typeof v === 'string') {
    if (RICH.has(key)) {
      const n = normHtml(v);
      if (side === 'www' && n !== v) DELIBERATE.richText += 1;
      return n;
    }
    if (key === 'plaintext') {
      const n = v.replace(/\s+$/, '');
      if (side === 'www' && n !== v) DELIBERATE.plaintext += 1;
      return n;
    }
    const f = fixWww(v);
    if (side === 'www' && f !== v) DELIBERATE.wwwDataErrors += 1;
    // text values: trailing whitespace (Document Authoring trims it)
    const t = f.replace(/\s+$/, '');
    if (side === 'www' && t !== f) DELIBERATE.plaintext += 1;
    return t;
  }
  return v;
}

/** Differences between two JSON values: [{ path, kind, www, edge }] (lists in order). */
export function diff(a, b, p = '') {
  if (Array.isArray(a) && Array.isArray(b)) {
    const out = [];
    const n = Math.max(a.length, b.length);
    for (let i = 0; i < n; i += 1) {
      if (i >= b.length) out.push({ path: `${p}[${i}]`, kind: 'missing', www: a[i] });
      else if (i >= a.length) out.push({ path: `${p}[${i}]`, kind: 'extra', edge: b[i] });
      else out.push(...diff(a[i], b[i], `${p}[${i}]`));
    }
    return out;
  }
  if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
    const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])];
    return keys.flatMap((k) => {
      if (!(k in b)) return [{ path: `${p}.${k}`, kind: 'missing', www: a[k] }];
      if (!(k in a)) return [{ path: `${p}.${k}`, kind: 'extra', edge: b[k] }];
      return diff(a[k], b[k], `${p}.${k}`);
    });
  }
  return JSON.stringify(a) === JSON.stringify(b) ? [] : [{
    path: p, kind: 'different', www: a, edge: b,
  }];
}
