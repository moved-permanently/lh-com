/**
 * Splits imported documents with more images than Edge Delivery preview accepts (200 per
 * document) into fragment documents, used by tools/importer/postprocess-media.mjs.
 *
 * Works on the .plain.html the importer writes (top-level <div> sections). When a document has
 * more than LIMIT images, every "list section" (a section with at least two heading-led units
 * that hold images, e.g. an AirCore continent: h2 Europe, then h3 country + cards-price block
 * per country) moves into fragment documents of at most MAX_PER_FRAGMENT images each, split at
 * unit boundaries (a single unit above the maximum is split between the rows of its block).
 * The page keeps the section's leading headings (so in-page anchors still resolve), its
 * section metadata and the page metadata block, plus one link per fragment that the fragment
 * auto-block (scripts/scripts.js buildAutoBlocks) replaces with the fragment's content.
 *
 * Fragment paths are parallel in every locale: /{lhg/}{cc}/{ll}/fragments/{page}-{group}[-{n}]
 *   page:  the page path below the locale root, '-' joined ("home" for the locale root)
 *   group: the id of the section's heading in the raw source snapshot (AirCore continents carry
 *          language-independent ids: europe, africa, asia, americas, oceania), else the
 *          heading's slug
 *   n:     part number when a group needs more than one fragment
 */

export const LIMIT = 200;
export const MAX_PER_FRAGMENT = 160;

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const TAG = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w-]*)\b[^>]*?(\/?)>/g;

/** Number of <img> elements in an HTML string. */
export function countImages(html) {
  return (html.match(/<img\b/gi) || []).length;
}

/**
 * Direct children of an HTML fragment string: [{ html, tag }] (tag null for text/comments).
 * Assumes the well-formed markup the importer writes.
 */
export function topLevelChildren(html) {
  const out = [];
  let depth = 0;
  let start = 0;
  let current = null;
  TAG.lastIndex = 0;
  for (let m = TAG.exec(html); m; m = TAG.exec(html)) {
    if (m[0].startsWith('<!--')) continue; // eslint-disable-line no-continue
    const closing = m[1] === '/';
    const tag = m[2].toLowerCase();
    const selfClosing = m[3] === '/' || VOID.has(tag);
    if (!closing) {
      if (depth === 0) {
        if (m.index > start) out.push({ html: html.slice(start, m.index), tag: null });
        start = m.index;
        current = tag;
      }
      if (selfClosing) {
        if (depth === 0) {
          out.push({ html: html.slice(start, TAG.lastIndex), tag });
          start = TAG.lastIndex;
          current = null;
        }
      } else {
        depth += 1;
      }
    } else {
      depth -= 1;
      if (depth === 0) {
        out.push({ html: html.slice(start, TAG.lastIndex), tag: current });
        start = TAG.lastIndex;
        current = null;
      }
    }
  }
  if (start < html.length) out.push({ html: html.slice(start), tag: null });
  return out;
}

/** Inner HTML of an element string ("<div ...>inner</div>"). */
function innerOf(el) {
  return el.slice(el.indexOf('>') + 1, el.lastIndexOf('<'));
}

const text = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ')
  .trim();
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');
const isHeading = (c) => /^h[1-6]$/.test(c.tag || '');
// section metadata, and the page metadata block: the importer appends it to the last section
// (/lhg/de/de: inside the Oceania list section, it went into the fragment)
const isSectionMetadata = (c) => c.tag === 'div' && /^<div class="(section-)?metadata"/.test(c.html);

/** Heading ids of the raw source page, by heading text: Map(text → id). */
export function rawHeadingIds(rawHtml) {
  const ids = new Map();
  if (!rawHtml) return ids;
  [...rawHtml.matchAll(/<h([1-6])\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g)].forEach((m) => {
    const t = text(m[3]);
    if (t && !ids.has(t)) ids.set(t, m[2]);
  });
  return ids;
}

/** Locale root and page key of a path: /lhg/de/en → { root: '/lhg/de/en', key: 'home' }. */
export function pageKey(docPath) {
  const m = docPath.match(/^(\/(?:lhg\/)?[a-z]{2}\/[a-z]{2})(\/.*)?$/);
  if (!m) return null;
  const rest = (m[2] || '').replace(/^\/|\/$/g, '');
  return { root: m[1], key: rest ? slug(rest.replace(/\//g, '-')) : 'home' };
}

/** Units of a section: runs of children, each starting at a heading. */
function unitsOf(children) {
  const units = [];
  let unit = [];
  children.forEach((c) => {
    if (isHeading(c) && unit.some((u) => u.tag)) {
      units.push(unit);
      unit = [];
    }
    unit.push(c);
  });
  if (unit.length) units.push(unit);
  const imagesOf = (parts) => parts.reduce((n, p) => n + countImages(p.html), 0);
  return units.map((parts) => ({ parts, images: imagesOf(parts) }));
}

/** Splits a unit above the maximum between the rows of its block (or items of its list). */
function splitBigUnit(unit, max) {
  if (unit.images <= max) return [unit];
  const pieces = [];
  let lead = [];
  unit.parts.forEach((part) => {
    const block = part.tag === 'div' && /^<div class="[^"]+"/.test(part.html);
    if (!block || countImages(part.html) <= max) {
      lead.push(part);
      return;
    }
    const open = part.html.slice(0, part.html.indexOf('>') + 1);
    const close = part.html.slice(part.html.lastIndexOf('<'));
    const rows = topLevelChildren(innerOf(part.html)).filter((r) => r.tag);
    let chunk = [];
    let n = countImages(lead.map((l) => l.html).join(''));
    const flush = () => {
      if (!chunk.length) return;
      const html = `${open}${chunk.map((r) => r.html).join('')}${close}`;
      const parts = [...lead, { html, tag: 'div' }];
      pieces.push({ parts, images: parts.reduce((s, p) => s + countImages(p.html), 0) });
      lead = [];
      chunk = [];
      n = 0;
    };
    rows.forEach((row) => {
      const ri = countImages(row.html);
      if (chunk.length && n + ri > max) flush();
      chunk.push(row);
      n += ri;
    });
    flush();
  });
  if (lead.length) {
    const last = pieces[pieces.length - 1];
    if (last) {
      last.parts.push(...lead);
      last.images += lead.reduce((s, p) => s + countImages(p.html), 0);
    } else {
      pieces.push({ parts: lead, images: lead.reduce((s, p) => s + countImages(p.html), 0) });
    }
  }
  return pieces;
}

/**
 * Fewest chunks of consecutive units with at most `max` images each, as even as possible
 * (linear partition: for the smallest feasible chunk count, minimise the largest chunk).
 * Chunks may still exceed `max` only when a single unit does.
 */
function chunkUnits(units, max) {
  const n = units.length;
  const prefix = [0];
  units.forEach((u, i) => { prefix[i + 1] = prefix[i] + u.images; });
  const sum = (i, j) => prefix[j] - prefix[i];
  const largest = Math.max(0, ...units.map((u) => u.images));
  for (let k = Math.max(1, Math.ceil(prefix[n] / max)); k <= n; k += 1) {
    // best[c][j]: smallest possible largest chunk for the first j units in c chunks
    const best = Array.from({ length: k + 1 }, () => new Array(n + 1).fill(Infinity));
    const cut = Array.from({ length: k + 1 }, () => new Array(n + 1).fill(0));
    best[0][0] = 0;
    for (let c = 1; c <= k; c += 1) {
      for (let j = c; j <= n; j += 1) {
        for (let i = c - 1; i < j; i += 1) {
          const v = Math.max(best[c - 1][i], sum(i, j));
          if (v < best[c][j]) {
            best[c][j] = v;
            cut[c][j] = i;
          }
        }
      }
    }
    if (best[k][n] <= Math.max(max, largest)) {
      const chunks = [];
      for (let c = k, j = n; c > 0; c -= 1) {
        const i = cut[c][j];
        chunks.unshift({ units: units.slice(i, j), images: sum(i, j) });
        j = i;
      }
      return chunks;
    }
  }
  return [{ units, images: prefix[n] }];
}

/**
 * Splits one document.
 * @param {string} html the .plain.html content
 * @param {string} docPath e.g. /lhg/de/en
 * @param {Object} [options]
 * @param {string} [options.rawHtml] the raw source snapshot (heading ids)
 * @param {number} [options.limit] split when the document has more images than this
 * @param {number} [options.max] maximum images per fragment
 * @returns {{ html: string, fragments: {path: string, html: string, images: number}[],
 *   before: number, after: number, error?: string }}
 */
export function splitDocument(html, docPath, options = {}) {
  const limit = options.limit || LIMIT;
  const max = options.max || MAX_PER_FRAGMENT;
  const before = countImages(html);
  const result = {
    html, fragments: [], before, after: before,
  };
  if (before <= limit) return result;
  const key = pageKey(docPath);
  if (!key) return { ...result, error: `no locale root in ${docPath}` };
  if (/\/fragments\//.test(docPath)) return { ...result, error: 'fragment document itself is over the limit' };
  const rawIds = rawHeadingIds(options.rawHtml);
  const usedNames = new Set();

  const sections = topLevelChildren(html);
  const out = sections.map((section, index) => {
    if (section.tag !== 'div') return section.html;
    const children = topLevelChildren(innerOf(section.html));
    const metadata = children.filter(isSectionMetadata);
    const content = children.filter((c) => !isSectionMetadata(c));
    const units = unitsOf(content);
    const imageUnits = units.filter((u) => u.images > 0);
    if (imageUnits.length < 2) return section.html;
    // leading units without images (the section heading) stay on the page
    let lead = 0;
    while (lead < units.length && units[lead].images === 0) lead += 1;
    const leading = units.slice(0, lead);
    const listUnits = units.slice(lead).flatMap((u) => splitBigUnit(u, max));
    const chunks = chunkUnits(listUnits, max);
    if (chunks.some((c) => c.images > max)) {
      result.error = `section ${index + 1}: a unit has more than ${max} images and cannot be split`;
      return section.html;
    }
    const heading = content.find(isHeading);
    const headingText = heading ? text(heading.html) : '';
    let group = (headingText && rawIds.get(headingText)) || slug(headingText) || `section-${index + 1}`;
    group = slug(group) || `section-${index + 1}`;
    let base = `${key.key}-${group}`;
    for (let i = 2; usedNames.has(base); i += 1) base = `${key.key}-${group}-${i}`;
    usedNames.add(base);
    const links = chunks.map((chunk, i) => {
      const name = chunks.length > 1 ? `${base}-${i + 1}` : base;
      const fragmentPath = `${key.root}/fragments/${name}`;
      const body = chunk.units.flatMap((u) => u.parts).map((p) => p.html).join('');
      result.fragments.push({ path: fragmentPath, html: `<div>${body}</div>\n`, images: chunk.images });
      return `<p><a href="${fragmentPath}">${fragmentPath}</a></p>`;
    });
    const keep = leading.flatMap((u) => u.parts).map((p) => p.html).join('');
    return `<div>${keep}${links.join('')}${metadata.map((m) => m.html).join('')}</div>`;
  });
  if (result.error) return { ...result, fragments: [] };
  result.html = out.join('');
  result.after = countImages(result.html);
  if (result.after > limit) result.error = `still ${result.after} images on the page after splitting`;
  return result;
}
