/* eslint-disable max-len -- dev tooling */
/**
 * Web pages as SDUI against www's recorded answers (compare-sdui-web.mjs, test/sdui-web.test.mjs).
 * Normalised before comparing, each counted (DELIBERATE):
 * - ids: www's ids are AEM content paths (…/jcr:content/articlecontentfragment/par3/image), the
 *   replica's its own; ids are not compared;
 * - images: www sends its DAM renditions (/content/dam/….transform/lh-dcep-transform-width-1440/
 *   img.jpg), the replica its Edge Delivery media (…/media_<hash>.jpg?width=1440); the URL is
 *   compared as present or not, the description (alt text) as it is;
 * - host: www.lufthansa.com and the replica's public host;
 * - trailing whitespace of texts ("“Everyone wants to fly with the cranes” ": Document Authoring
 *   trims titles);
 * - related article picks: www fills its third related card at random (the related-articles block
 *   takes the newest of the category, scripts/articles.js pickRelated); the offer boxes are
 *   compared in shape, their article (title, description, link) listed when it differs.
 * Parts the replica's blocks don't have are listed in MISSING and reported, not hidden.
 */
export const MISSING = {
  // www's FAQ content (accordion of questions) is not on the replica: the page is not in the scope
  'faq-refund': 'not on the replica: /de/en/support/faq/faq-refund is not in tools/migration-scope/pages.csv',
};

export function normalize(v, counts, key = '') {
  const count = (k) => { counts[k] = (counts[k] || 0) + 1; };
  if (Array.isArray(v)) return v.map((x) => normalize(x, counts, key));
  if (v && typeof v === 'object') {
    const out = {};
    Object.entries(v).forEach(([k, x]) => {
      if (k === 'id') { count('ids'); return; }
      if ((k === 'url' && v.type === 'image') || k === 'imageURL') {
        count('images');
        out[k] = x ? 'IMAGE' : '';
        return;
      }
      out[k] = normalize(x, counts, k);
    });
    return out;
  }
  if (typeof v === 'string') {
    let s = v.replace(/https:\/\/(www\.lufthansa\.com|lhedge\.bbird\.live|lhcom\.bbird\.live|lh-edge\.local|lh-edge\.example)(?=\/)/g, () => { count('host'); return 'https://HOST'; });
    if (s !== s.trimEnd()) { count('trailing whitespace'); s = s.trimEnd(); }
    return s;
  }
  return v;
}

/** Deep differences: [{path, kind, www, edge}]. */
export function diff(a, b, p = '') {
  if (Array.isArray(a) && Array.isArray(b)) {
    const out = [];
    for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
      if (i >= b.length) out.push({ path: `${p}[${i}]`, kind: 'missing', www: a[i] });
      else if (i >= a.length) out.push({ path: `${p}[${i}]`, kind: 'extra', edge: b[i] });
      else out.push(...diff(a[i], b[i], `${p}[${i}]`));
    }
    return out;
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    return [...new Set([...Object.keys(a), ...Object.keys(b)])].flatMap((k) => {
      if (!(k in b)) return [{ path: `${p}.${k}`, kind: 'missing', www: a[k] }];
      if (!(k in a)) return [{ path: `${p}.${k}`, kind: 'extra', edge: b[k] }];
      return diff(a[k], b[k], `${p}.${k}`);
    });
  }
  return JSON.stringify(a) === JSON.stringify(b) ? [] : [{
    path: p, kind: 'different', www: a, edge: b,
  }];
}

const OFFER_FIELDS = /\.(title|description|initialTitle|url|label)$/;
const isOffer = (o) => o && (o.type === 'offerBox' || o.type === 'offerBox_v2');

/** All offer boxes of an answer, in order. */
function offers(v, out = []) {
  if (Array.isArray(v)) v.forEach((x) => offers(x, out));
  else if (v && typeof v === 'object') {
    if (isOffer(v)) out.push(v);
    Object.values(v).forEach((x) => offers(x, out));
  }
  return out;
}

/**
 * Compares a replica answer with www's: {differences (outside the related picks), picks:
 * {www, edge} titles when they differ, counts}.
 */
export function compareAnswer(www, edge) {
  const counts = {};
  const a = normalize(www, counts);
  const b = normalize(edge, counts);
  const all = diff(a, b);
  const offerPaths = () => all.filter((d) => OFFER_FIELDS.test(d.path) && d.www !== undefined && d.edge !== undefined);
  const pickDiffs = offerPaths();
  const [wt, et] = [offers(a).map((o) => o.title), offers(b).map((o) => o.title)];
  const samePicks = JSON.stringify(wt) === JSON.stringify(et);
  // a different article fills an offer box: its title, description and links differ together
  const differences = samePicks ? all : all.filter((d) => !pickDiffs.includes(d));
  if (!samePicks) counts['related article picks'] = pickDiffs.length;
  return {
    differences, picks: samePicks ? null : { www: wt, edge: et }, counts,
  };
}
