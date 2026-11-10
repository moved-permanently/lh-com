/* eslint-disable max-len, newline-per-chained-call -- tooling */
/**
 * lufthansa.com's market steps for the importer (brief 558; tools/reports/markets/lh-market-diff/rulings.md section 4):
 * the three kinds of import rows that need more than a document per page. They work on a converted document
 * (the import bundles' HTML: one top-level <div> per section, a section's `section-metadata` block, the page's
 * `metadata` block), so they run after the template's import, on the documents it writes:
 *
 * - markets section on a version page (rule R3: every market root of a language shows a page one way, the
 *   language version another): mergeMarketVariant puts the sections that differ in twice, the version's with
 *   `markets` = its home market (`de` for de/de and de/en, `xx` for xx/ru), the roots' with the exclude list
 *   (`-de`); sections both show stay as they are. The market route and the site leave out the sections whose
 *   `markets` excludes the root (scripts/market-rules.js), so the home market sees the version page unchanged.
 * - shared variant (R2/R3b: a group of roots shares a variant): withPageMarkets gives the variant's document
 *   (under the group's first root) the page metadata `markets` with the group; lh-edge's market route serves it
 *   to the roots its `markets` lists (README "Market roots", step 3).
 * - widget setting (W2: the booking widget's hideHotel, hideCar, hideHoliday per market): withTabsByMarket gives
 *   the page's Flight Search block a `Tabs by market` row, one paragraph per group "<markets> = <tabs>"
 *   (blocks/flight-search marketTabs).
 *
 * Pure string functions (no DOM), so they run in the import harness, in Node and in tests alike.
 */
import { marketAllows } from '../../scripts/market-rules.js';

/** The top-level <div>…</div> elements of a document's HTML (its sections), in order. */
export function splitSections(html) {
  const out = [];
  const re = /<div\b[^>]*>|<\/div>/g;
  let depth = 0;
  let start = -1;
  let m = re.exec(html);
  while (m) {
    if (m[0] === '</div>') {
      depth -= 1;
      if (depth === 0) out.push(html.slice(start, re.lastIndex));
    } else {
      if (depth === 0) start = m.index;
      depth += 1;
    }
    m = re.exec(html);
  }
  return out;
}

/** The [start, end) of the first block <div class="<name>"> in a section, or null. */
function blockRange(html, name) {
  const at = html.search(new RegExp(`<div class="${name}(?:\\s[^"]*)?">`));
  if (at < 0) return null;
  const re = /<div\b[^>]*>|<\/div>/g;
  re.lastIndex = at;
  let depth = 0;
  let m = re.exec(html);
  while (m) {
    depth += m[0] === '</div>' ? -1 : 1;
    if (depth === 0) return [at, re.lastIndex];
    m = re.exec(html);
  }
  return null;
}

/** A key/value block's rows as [key, valueHtml, rowStart, rowEnd] (offsets in the block's HTML). */
function blockRows(block) {
  const inner = block.slice(block.indexOf('>') + 1, block.lastIndexOf('</div>'));
  const offset = block.indexOf('>') + 1;
  return splitSections(inner).map((row) => {
    const cells = splitSections(row.slice(row.indexOf('>') + 1, row.lastIndexOf('</div>')));
    const at = inner.indexOf(row);
    const strip = (c) => (c || '').replace(/^<div[^>]*>|<\/div>$/g, '');
    return [strip(cells[0]).replace(/<[^>]+>/g, '').trim(), strip(cells[1]), offset + at, offset + at + row.length];
  });
}

/** A section without its section-metadata block (what readers see). */
const withoutMeta = (section) => {
  const r = blockRange(section, 'section-metadata');
  return r ? section.slice(0, r[0]) + section.slice(r[1]) : section;
};

/**
 * What a section shows, for comparing two documents: its text and its blocks' names, without the section and
 * page metadata and without media addresses (rule D2: another rendition of a picture is no difference).
 */
export function sectionSignature(section) {
  let s = withoutMeta(section);
  const meta = blockRange(s, 'metadata');
  if (meta) s = s.slice(0, meta[0]) + s.slice(meta[1]);
  const blocks = (s.match(/<div class="[^"]+">/g) || []).map((d) => d.slice(12, -2)).join('|');
  const text = s.replace(/<(img|source)\b[^>]*>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|\u00a0/g, ' ')
    .replace(/\s+/g, ' ').trim();
  return `${blocks}#${text}`;
}

/** The `markets` value of a section (its section metadata row), or null. */
export function sectionMarketsValue(section) {
  const r = blockRange(section, 'section-metadata');
  if (!r) return null;
  const row = blockRows(section.slice(r[0], r[1])).find(([k]) => k.toLowerCase() === 'markets');
  return row ? row[1].replace(/<[^>]+>/g, '').trim() : null;
}

/** A section with its section metadata's `markets` row set to value (the block made when the section has none). */
export function withSectionMarkets(section, value) {
  const row = `<div><div>markets</div><div>${value}</div></div>`;
  const r = blockRange(section, 'section-metadata');
  if (!r) return `${section.slice(0, section.lastIndexOf('</div>'))}<div class="section-metadata">${row}</div></div>`;
  const block = section.slice(r[0], r[1]);
  const existing = blockRows(block).find(([k]) => k.toLowerCase() === 'markets');
  const next = existing
    ? block.slice(0, existing[2]) + row + block.slice(existing[3])
    : `${block.slice(0, block.lastIndexOf('</div>'))}${row}</div>`;
  return section.slice(0, r[0]) + next + section.slice(r[1]);
}

/** Longest common subsequence of two key lists: pairs [i, j] of equal keys, in order. */
function lcs(a, b) {
  const n = a.length;
  const m = b.length;
  const t = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) t[i][j] = a[i] === b[j] ? t[i + 1][j + 1] + 1 : Math.max(t[i + 1][j], t[i][j + 1]);
  }
  const pairs = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { pairs.push([i, j]); i += 1; j += 1; } else if (t[i + 1][j] >= t[i][j + 1]) i += 1; else j += 1;
  }
  return pairs;
}

/** The page metadata block of a document: [sectionIndex, blockHtml], or null. */
function pageMeta(sections) {
  for (let i = sections.length - 1; i >= 0; i -= 1) {
    const r = blockRange(sections[i], 'metadata');
    if (r) return [i, sections[i].slice(r[0], r[1])];
  }
  return null;
}

/**
 * The version document with a market variant merged in as markets sections.
 * @param {string} versionHtml the language version's document (its home market's view)
 * @param {string} variantHtml a covered root's document of the same page (the roots' view)
 * @param {{home: string, others: string}} markets e.g. { home: 'de', others: '-de' }
 * @returns {{html: string, runs: Array<{version: number[], variant: number[]}>, unchanged: boolean}}
 *   runs: the differing section runs (indexes into each document's sections)
 */
export function mergeMarketVariant(versionHtml, variantHtml, { home, others }) {
  const vs = splitSections(versionHtml);
  const ws = splitSections(variantHtml);
  if (!home || !others) throw new Error('mergeMarketVariant: home and others are needed');
  vs.forEach((s, i) => {
    if (sectionMarketsValue(s) !== null) throw new Error(`mergeMarketVariant: version section ${i} has markets already`);
  });
  // the variant's page metadata goes: the version's stays the page's
  const wMeta = pageMeta(ws);
  if (wMeta) ws[wMeta[0]] = ws[wMeta[0]].replace(wMeta[1], '');
  const vMeta = pageMeta(vs);
  const metaOf = (i) => (vMeta && vMeta[0] === i ? vMeta[1] : '');
  const vKeys = vs.map((s) => sectionSignature(s));
  const wKeys = ws.map((s) => sectionSignature(s));
  const pairs = lcs(vKeys, wKeys);
  const out = [];
  const runs = [];
  let i = 0;
  let j = 0;
  const flush = (iEnd, jEnd) => {
    const vr = [];
    const wr = [];
    for (; i < iEnd; i += 1) vr.push(i);
    for (; j < jEnd; j += 1) wr.push(j);
    if (!vr.length && !wr.length) return;
    // an empty variant section (the variant's metadata section, emptied) is no difference
    const wReal = wr.filter((k) => sectionSignature(ws[k]) !== '#');
    if (!wReal.length && vr.every((k) => sectionSignature(vs[k]).replace(/^metadata[^#]*/, '') === '#')) {
      vr.forEach((k) => out.push(vs[k]));
      return;
    }
    runs.push({ version: vr, variant: wReal });
    vr.forEach((k) => {
      const meta = metaOf(k);
      // the page metadata never goes into a market section: it stays in a section of its own
      const body = meta ? vs[k].replace(meta, '') : vs[k];
      if (sectionSignature(body) !== '#') out.push(withSectionMarkets(body, home));
      if (meta) out.push(`<div>${meta}</div>`);
    });
    wReal.forEach((k) => out.push(withSectionMarkets(ws[k], others)));
  };
  pairs.forEach(([pi, pj]) => {
    flush(pi, pj);
    out.push(vs[pi]);
    i = pi + 1;
    j = pj + 1;
  });
  flush(vs.length, ws.length);
  return { html: out.join('\n'), runs, unchanged: !runs.length };
}

/** A document with its page metadata's `markets` row set (a shared variant's group: "cn/de, es/de, fr/de"). */
export function withPageMarkets(html, value) {
  const sections = splitSections(html);
  const meta = pageMeta(sections);
  const row = `<div><div>markets</div><div>${value}</div></div>`;
  if (!meta) return `${html}\n<div><div class="metadata">${row}</div></div>`;
  const rows = blockRows(meta[1]);
  const existing = rows.find(([k]) => k.toLowerCase() === 'markets');
  const next = existing
    ? meta[1].slice(0, existing[2]) + row + meta[1].slice(existing[3])
    : `${meta[1].slice(0, meta[1].lastIndexOf('</div>'))}${row}</div>`;
  return html.replace(meta[1], next);
}

/** Kind of a booking widget tab by its label (blocks/flight-search tabKind's words). */
export function tabKind(label) {
  const text = String(label || '').toLowerCase();
  if (/holiday|urlaub|vacances|vacaciones|(flug|flight|vuelo|vol)\s*[&+]\s*hotel/.test(text)) return 'holiday';
  if (/hotel/.test(text)) return 'hotel';
  if (/car\b|mietwagen|auto|coche|voiture/.test(text)) return 'car';
  return 'other';
}

/** The widget switches of www's dcep settings as the tab kinds they hide ({hideHotel: true} -> ['hotel']). */
export function hiddenKinds(switches) {
  const map = { hideHotel: 'hotel', hideCar: 'car', hideHoliday: 'holiday' };
  return Object.entries(switches || {}).filter(([k, v]) => map[k] && v === true).map(([k]) => map[k]);
}

/**
 * A document whose Flight Search blocks get a `Tabs by market` row: one paragraph per group, its tabs the block's
 * Tabs without the kinds the group hides. Groups whose tabs would be the same as the Tabs row are left out.
 * @param {string} html the document
 * @param {Array<{markets: string, hide: string[]}>} groups e.g. [{ markets: 'cr/es, pa/es', hide: ['hotel', 'car'] }]
 * @returns {{html: string, blocks: number}}
 */
export function withTabsByMarket(html, groups) {
  let out = html;
  let blocks = 0;
  let from = 0;
  for (;;) {
    const rest = out.slice(from);
    const r = blockRange(rest, 'flight-search');
    if (!r) break;
    const [a, b] = [from + r[0], from + r[1]];
    const block = out.slice(a, b);
    const rows = blockRows(block);
    const tabsRow = rows.find(([k]) => k.toLowerCase() === 'tabs');
    const lines = tabsRow ? groups.map(({ markets, hide }) => {
      const tabs = tabsRow[1].replace(/<[^>]+>/g, '').split(/\s*[,;]\s*/).map((t) => t.trim()).filter(Boolean);
      const kept = tabs.filter((t) => !hide.includes(tabKind(t)));
      return kept.length && kept.length < tabs.length ? `<p>${markets} = ${kept.join(', ')}</p>` : '';
    }).filter(Boolean) : [];
    let next = block;
    if (lines.length && !rows.some(([k]) => k.toLowerCase() === 'tabs by market')) {
      const row = `<div><div>Tabs by market</div><div>${lines.join('')}</div></div>`;
      const after = tabsRow[3];
      next = block.slice(0, after) + row + block.slice(after);
      blocks += 1;
    }
    out = out.slice(0, a) + next + out.slice(b);
    from = a + next.length;
  }
  return { html: out, blocks };
}

/** Countries of a root list ("cr/es, pa/es" -> ['cr', 'pa']), for a check with marketAllows. */
export const countriesOf = (roots) => [...new Set(String(roots || '').split(/[\s,;]+/).filter(Boolean).map((r) => r.slice(0, 2)))];

/** Whether a markets value shows a section to every country of a list (a check for the re-import list). */
export const allowsAll = (value, roots) => countriesOf(roots).every((c) => marketAllows(value, c));
