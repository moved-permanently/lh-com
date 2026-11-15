/* eslint-disable no-console, max-len, import/prefer-default-export -- tooling */
/**
 * An unpadded AEM section between two padded ones as a section of its own, back into DA's copy (standing order 18 of
 * 2026-11-13: /de/en/passengers-with-sensory-impairment's "Travelling with a companion"). The importer splits there
 * since then (lufthansa-sections, test/info-padded-sandwich-so18); this is the delta for the documents imported before.
 * Per row ({heading, before, style}): the section (a top-level div of main, or of the document for a .plain.html)
 * holding a direct-child heading whose text starts with `heading` (not its first element) is split right before that
 * heading. The part before keeps the section's styles plus `before` ("flush", "spaced", or "" for nothing more); the
 * part from the heading on gets `style` ("spaced"; "padded" for /de/en/book-and-manage/rebook's "Not sure which
 * applies?", a padded AEM section on www that an older import kept in the section before). Styles are the section-metadata block in DA's format, the section's classes in a published
 * .plain.html. A row whose heading is not found, is found more than once, opens its section, or whose section is split
 * there already, changes nothing. Everything else stays byte for byte.
 *
 * A row may name a block instead ({block, heading, before, style}; standing order 25, the business-class pages): the
 * section is split right before its direct-child block whose class list starts with `block` and whose first heading
 * starts with `heading`. Such a row may give style "" (the part from the block on gets no style).
 *
 * A title row ({title: true, style, before}; standing order 28, free2move and digital-travel-companion) splits every
 * section whose direct-child h1 is followed by a paragraph holding only a picture (or a bare picture, as DA's copy can
 * hold it), right before it: www has
 * the page title outside its AEM sections and the picture opening the first (padded) one. The part from the picture on
 * gets `style`; both parts keep the section's other metadata (a market section's "markets" row, data-markets in a
 * published .plain.html). A document without such a section changes nothing ("not found").
 *
 * Usage: node tools/importer/section-split-apply.mjs --data rows.json --in <DA copy.html> --out <file>
 *   rows.json: [{ "heading": "Travelling with a companion.", "before": "flush", "style": "spaced" }]
 *   or [{ "block": "columns-media", "heading": "Arrive relaxed", "before": "", "style": "" }]
 * Reads and writes local files only; the upload is the import helper's.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const text = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const META = /<div class="section-metadata"><div><div>style<\/div><div>([^<]*)<\/div><\/div><\/div>/;
const meta = (styles) => `<div class="section-metadata"><div><div>style</div><div>${styles.join(', ')}</div></div></div>`;

/** The top-level divs between from and to: [{ start, end, openEnd }]. */
function sections(html, from, to) {
  const out = [];
  const re = /<(\/?)div\b[^>]*>/g;
  re.lastIndex = from;
  let depth = 0;
  let cur = null;
  for (let m = re.exec(html); m && m.index < to; m = re.exec(html)) {
    if (!m[1]) {
      if (depth === 0) cur = { start: m.index, openEnd: re.lastIndex };
      depth += 1;
    } else {
      depth -= 1;
      if (depth === 0) out.push({ ...cur, end: re.lastIndex });
    }
  }
  return out;
}

/** The direct-child headings of a section's body: [{ at, text }] (at: index in body). */
function childHeadings(body) {
  const out = [];
  const re = /<(\/?)(div|h[1-6])\b[^>]*>/g;
  let depth = 0;
  for (let m = re.exec(body); m; m = re.exec(body)) {
    if (m[2] === 'div') depth += m[1] ? -1 : 1;
    else if (!m[1] && depth === 1) {
      const close = body.indexOf(`</${m[2]}>`, m.index);
      out.push({ at: m.index, text: text(body.slice(m.index, close)) });
    }
  }
  return out;
}

/** The direct-child blocks of a section's body whose class list starts with `name`: [{ at, text }] (text: the
 * block's first heading). */
function childBlocks(body, name) {
  const out = [];
  const re = /<(\/?)(div|h[1-6])\b([^>]*)>/g;
  let depth = 0;
  let cur = null;
  for (let m = re.exec(body); m; m = re.exec(body)) {
    if (m[2] === 'div') {
      if (!m[1]) {
        depth += 1;
        const cls = (m[3].match(/class="([^"]*)"/) || [])[1] || '';
        if (depth === 2 && cls.split(/\s+/)[0] === name) cur = { at: m.index, text: null };
      } else {
        depth -= 1;
        if (depth === 1 && cur) { out.push(cur); cur = null; }
      }
    } else if (!m[1] && cur && cur.text === null) {
      const close = body.indexOf(`</${m[2]}>`, m.index);
      cur.text = text(body.slice(m.index, close));
    }
  }
  return out.map((b) => ({ ...b, text: b.text || '' }));
}

/** DA's section-metadata block at the end of a section body: { at, rows: [[key, value]] } or null. */
function metaBlock(body) {
  const at = body.lastIndexOf('<div class="section-metadata">');
  if (at < 0) return null;
  const end = body.lastIndexOf('</div>');
  const block = body.slice(at, end);
  const rows = [...block.matchAll(/<div><div>([^<]*)<\/div><div>([^<]*)<\/div><\/div>/g)].map((m) => [m[1].trim(), m[2].trim()]);
  return { at, rows };
}
const metaOf = (rows) => (rows.length ? `<div class="section-metadata">${rows.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('')}</div>` : '');

/** The title rows: every section whose direct-child h1 is followed by a picture-only paragraph, split before it. */
function applyTitleSplit(html, row) {
  const main = html.indexOf('<main>');
  const from = main >= 0 ? main + 6 : 0;
  const to = main >= 0 ? html.indexOf('</main>', from) : html.length;
  const targets = sections(html, from, to).map((s) => {
    const body = html.slice(s.start, s.end);
    // (DA's copy can hold the picture without its paragraph)
    const h = body.match(/^(<div[^>]*>\s*(?:<p>\s*\{[^}]*\}\s*<\/p>\s*)*<h1\b[^>]*>[\s\S]*?<\/h1>\s*)(?:<p>\s*<picture>[\s\S]*?<\/picture>\s*<\/p>|<picture>[\s\S]*?<\/picture>)/);
    if (!h) return null;
    let at = h[1].length;
    while (at > 0 && /[ \t]/.test(body[at - 1])) at -= 1;
    return { s, at };
  }).filter(Boolean);
  if (!targets.length) return { html, result: 'not found' };
  let out = html;
  [...targets].reverse().forEach(({ s, at }) => {
    const body = out.slice(s.start, s.end);
    const open = out.slice(s.start, s.openEnd);
    let first;
    let second;
    if (main >= 0) {
      const m = metaBlock(body);
      const rows = m ? m.rows : [];
      const style = rows.find(([k]) => k === 'style');
      const others = rows.filter(([k]) => k !== 'style');
      const styles = style ? style[1].split(',').map((x) => x.trim()).filter(Boolean) : [];
      const firstRows = [...others, ...([...styles, ...(row.before ? [row.before] : [])].length ? [['style', [...styles, ...(row.before ? [row.before] : [])].join(', ')]] : [])];
      const secondRows = [...others, ...(row.style ? [['style', row.style]] : [])];
      const close = body.lastIndexOf('</div>');
      const rest = m ? body.slice(at, m.at) : body.slice(at, close);
      first = `${body.slice(0, at)}${metaOf(firstRows)}</div>\n`;
      second = `<div>${rest}${metaOf(secondRows)}</div>`;
    } else {
      const cls = open.match(/class="([^"]*)"/);
      const styles = cls ? cls[1].split(/\s+/).filter(Boolean) : [];
      const attrs = open.replace(/^<div\b/, '').replace(/>$/, '').replace(/\s*class="[^"]*"/, '');
      const firstStyles = [...styles, ...(row.before ? [row.before] : [])];
      first = `<div${firstStyles.length ? ` class="${firstStyles.join(' ')}"` : ''}${attrs}>${body.slice(open.length, at).replace(/\s*$/, '\n')}</div>\n`;
      second = `<div${row.style ? ` class="${row.style}"` : ''}${attrs}>\n${body.slice(at)}`;
    }
    out = `${out.slice(0, s.start)}${first}${second}${out.slice(s.end)}`;
  });
  return { html: out, result: `placed ${targets.length}` };
}

/** The document with the rows' splits: { html, results: [{ row, result }] }. */
export function applySectionSplit(html, rows) {
  let out = html;
  const results = rows.map((row) => {
    if (!['flush', 'spaced', ''].includes(row.before || '')) return { row, result: 'bad row' };
    if (row.title === true) {
      if (!/^[a-z0-9-]+$/.test(row.style || '')) return { row, result: 'bad row' };
      const r = applyTitleSplit(out, row);
      out = r.html;
      return { row, result: r.result };
    }
    if (row.block !== undefined && !/^[a-z0-9-]+$/.test(row.block)) return { row, result: 'bad row' };
    if (!row.style && !(row.block && row.style === '')) return { row, result: 'bad row' };
    const own = row.style ? [row.style] : [];
    const before = row.before ? [row.before] : [];
    const main = out.indexOf('<main>');
    const from = main >= 0 ? main + 6 : 0;
    const to = main >= 0 ? out.indexOf('</main>', from) : out.length;
    const hits = sections(out, from, to).flatMap((s) => (row.block ? childBlocks(out.slice(s.start, s.end), row.block) : childHeadings(out.slice(s.start, s.end)))
      .filter((h) => h.text.startsWith(row.heading)).map((h) => ({ s, h })));
    if (!hits.length) return { row, result: 'not found' };
    if (hits.length > 1) return { row, result: 'found more than once' };
    const [{ s, h }] = hits;
    const body = out.slice(s.start, s.end);
    const open = out.slice(s.start, s.openEnd);
    // the heading's line start in a pretty-printed copy (its indentation goes with it)
    let { at } = h;
    while (at > 0 && /[ \t]/.test(body[at - 1])) at -= 1;
    if (!body.slice(open.length, at).replace(/\s+/g, '')) return { row, result: 'opens its section' };
    let first;
    let second;
    const m = body.match(META);
    if (m) {
      // DA's format: the metadata block ends the section; both parts get one (the first none when it has no styles left)
      const styles = m[1].split(',').map((x) => x.trim()).filter(Boolean);
      const metaAt = body.lastIndexOf(m[0]);
      const firstStyles = [...styles, ...before];
      first = `${body.slice(0, at)}${firstStyles.length ? meta(firstStyles) : ''}</div>\n`;
      second = `<div>${body.slice(at, metaAt)}${own.length ? meta(own) : ''}${body.slice(metaAt + m[0].length)}`;
    } else if (main >= 0) {
      // DA's format, a section without styles: the part before as it is, the rest a section with its own block
      if (before.length) first = `${body.slice(0, at)}${meta(before)}</div>\n`;
      else first = `${body.slice(0, at)}</div>\n`;
      const close = body.lastIndexOf('</div>');
      second = `<div>${body.slice(at, close)}${own.length ? meta(own) : ''}${body.slice(close)}`;
    } else {
      const cls = open.match(/class="([^"]*)"/);
      const styles = cls ? cls[1].split(/\s+/).filter(Boolean) : [];
      const firstStyles = [...styles, ...before];
      first = `${firstStyles.length ? `<div class="${firstStyles.join(' ')}">` : '<div>'}${body.slice(open.length, at).replace(/\s*$/, '\n')}</div>\n`;
      second = `${own.length ? `<div class="${row.style}">` : '<div>'}\n${body.slice(at)}`;
    }
    out = `${out.slice(0, s.start)}${first}${second}${out.slice(s.end)}`;
    return { row, result: 'placed' };
  });
  return { html: out, results };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : undefined; };
  const r = applySectionSplit(fs.readFileSync(arg('in'), 'utf8'), JSON.parse(fs.readFileSync(arg('data'), 'utf8')));
  fs.writeFileSync(arg('out'), r.html);
  r.results.forEach(({ row, result }) => console.log(`${row.title ? 'title ' : ''}${row.block ? `${row.block} ` : ''}${row.heading || ''} (${row.before} | ${row.style}): ${result}`));
}
