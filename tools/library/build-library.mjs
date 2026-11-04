/* eslint-disable no-console, max-len, import/no-extraneous-dependencies, import/extensions -- linkedom is a dev tool dependency */
/**
 * Builds lh-com's DA block library from the content: one document per block at
 * content/library/blocks/<block>.plain.html (its <main>; DA /library/blocks/<block>), one block
 * table per variant (option combination) that occurs on lh-com pages, each under an H2 that names
 * it: "<Block title>" for the default, "<Block title> (<options>)" for a visual variant, the
 * options exactly as in the table header (DA's variant picker and the Block Inspector read the
 * option value from those parentheses; a heading without one disables the dialog's row): a copy
 * of a real page's block with
 * the structure the most of the variant's blocks resolve against (structure.mjs chooseModels:
 * the fields all of them share; a sample with more is cut to them), then, under a heading, one
 * per other structure the pages use (at least 4 blocks or a tenth of the variant; the Block
 * Inspector edits every block of a variant with its first table, these are for inserting),
 * each followed by a library-metadata table (description,
 * fields: the labels the Block Inspector of adobe-rnd/ew-extensions shows, mirroring the
 * table's rows and cells; see tools/library/structure.mjs). Writes the index sheet
 * content/library/blocks.json (sheets blocks, editor, options), content/library/ema-library.json
 * (the same blocks, for the migration tools) and
 * tools/library/library-variants.json (variant -> sample page, pages), which
 * tools/library/check-fields.mjs reads.
 *
 * Left out: header and footer (loaded by the page), channels-demo, the blocks of the
 * structured documents under /data/** (DA form documents from the GraphQL import, edited
 * with DA's form editor; their class names are generated ids), the Message Center's documents
 * (/message-center/**, read by the Message Center blocks), the meta pages (/migration-status/**)
 * and the boilerplate starter page /index (its cards and columns are on no other page); the
 * brand sites' content (content-sites/**) is theirs.
 *
 * --site lh-tap: TAP Air Portugal's library from lh-tap's content instead (tools/library/sites.mjs:
 * its folder, manifest and descriptions; blocks.json only).
 *
 * Usage: node tools/library/build-library.mjs [--site lh-tap]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parse, describeBlockDiv, rowShape, normalizeCell, contentFields, fieldType, rowCovers, blockCovers,
  chooseModels, rowFits, rowIsModel, describeModel, configKeys,
} from './structure.mjs';
import { OPTION_NOTES } from './spec.mjs';
import { siteConfig, siteArg, specFor } from './sites.mjs';

const SITE = siteConfig(siteArg());
const CONTENT = SITE.content;
const LIBRARY = SITE.library;
const OUT = path.join(LIBRARY, 'blocks');
const ORG_SITE = SITE.org;
const SKIP_DIRS = SITE.skipDirs;
const SKIP_PAGES = SITE.skipPages;
const SKIP_BLOCKS = new Set(['header', 'footer', 'channels-demo', 'section-metadata', 'metadata', 'library-metadata']);
const LOCALE_ORDER = SITE.locales;
const MAX_ITEMS = 4;

const walk = (d, rel = '') => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  const r = rel ? `${rel}/${e.name}` : e.name;
  if (e.isDirectory()) return SKIP_DIRS.test(r) ? [] : walk(path.join(d, e.name), r);
  return e.name.endsWith('.plain.html') ? [r] : [];
});
const localeRank = (p) => {
  // a locale's pages and its root page itself (lh-tap's homepages: /pt-pt)
  const i = LOCALE_ORDER.findIndex((l) => p.startsWith(l) || `${p}/` === l);
  return i < 0 ? LOCALE_ORDER.length : i;
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const title = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// --- the variants of the content
const variants = new Map();
walk(CONTENT).forEach((file) => {
  const page = `/${file.replace(/\.plain\.html$/, '')}`;
  if (SKIP_PAGES.has(page)) return;
  const doc = parse(`<main>${fs.readFileSync(path.join(CONTENT, file), 'utf8')}</main>`);
  const seen = new Set();
  doc.querySelectorAll('main > div > div[class]').forEach((block) => {
    const classes = block.className.trim().split(/\s+/);
    const [name, ...opts] = classes;
    if (SKIP_BLOCKS.has(name)) return;
    const key = opts.length ? `${name} (${opts.join(', ')})` : name;
    if (!variants.has(key)) {
      variants.set(key, {
        key, name, opts, uses: [],
      });
    }
    const firstOnPage = !seen.has(key);
    seen.add(key);
    variants.get(key).uses.push({
      page, block, firstOnPage, d: describeBlockDiv(block),
    });
  });
});

const fieldTotal = (rows) => rows.reduce((a, r) => a + r.cells.reduce((b, c) => b + c.fields.length, 0), 0);

/**
 * The sample: the structure the most real blocks resolve against (rowCovers / blockCovers, as
 * the extension matches page blocks to the library table; ties: the one with more fields, then
 * the more common one), copied from a de/en page where there is one. Multi blocks: the first
 * row (the item schema) that the most rows of the same kind resolve against.
 */
function pickSample(v, spec) {
  const { uses } = v;
  const byPage = (a, b) => (localeRank(a.page) - localeRank(b.page)) || a.page.localeCompare(b.page);
  if (spec.multi) {
    const firsts = uses.filter((u) => u.d.rows.length);
    if (!firsts.length) return [...uses].sort(byPage)[0];
    const rows = uses.flatMap((u) => u.d.rows);
    const shapes = new Map(firsts.map((u) => [rowShape(u.d.rows[0]), u.d.rows[0]]));
    const score = (t) => rows.filter((r) => rowCovers(t, r)).length;
    const [best] = [...shapes.entries()].map(([s, t]) => ({
      s, n: score(t), f: fieldTotal([t]), c: rows.filter((r) => rowShape(r) === s).length,
    }))
      .sort((a, b) => (b.n - a.n) || (b.f - a.f) || (b.c - a.c));
    const pool = firsts.filter((u) => rowShape(u.d.rows[0]) === best.s);
    const uniform = (u) => u.d.rows.filter((r) => rowShape(r) === best.s).length / u.d.rows.length;
    return pool.sort((a, b) => (uniform(b) - uniform(a)) || byPage(a, b) || (Math.abs(a.d.rows.length - 3) - Math.abs(b.d.rows.length - 3)))[0];
  }
  const shapes = new Map();
  uses.forEach((u) => { const s = u.d.rows.map(rowShape).join(' / '); if (!shapes.has(s)) shapes.set(s, []); shapes.get(s).push(u); });
  const [best] = [...shapes.values()].map((group) => ({ group, n: uses.filter((u) => blockCovers(group[0].d, u.d)).length, f: fieldTotal(group[0].d.rows) }))
    .sort((a, b) => (b.n - a.n) || (b.f - a.f) || (b.group.length - a.group.length));
  return [...best.group].sort(byPage)[0];
}

/** Removes the fields of a cell beyond the first n (image-only cells keep their spacer paragraphs). */
function trimCell(cell, n) {
  normalizeCell(cell);
  const els = contentFields(cell);
  const content = els.filter((el) => fieldType(el) !== 'text' || el.textContent.trim());
  if (els.length <= n || (content.length === n && content.every((el) => fieldType(el) === 'image'))) return;
  els.slice(n).forEach((el) => el.remove());
}

/**
 * The library sample of a model: a real block that resolves against it, preferably one whose
 * structure is the model exactly (multi: its first item; else every row), then the one with the
 * most items of the model, from a de/en page where there is one. A sample with more fields than
 * the model is cut to the model (the fields table describes the sample). Multi: the rows before
 * its first item are left out (the first row is the item schema).
 */
function sampleFor(entry, uses, multi, preferred, config = new Set()) {
  const byPage = (a, b) => (localeRank(a.page) - localeRank(b.page)) || a.page.localeCompare(b.page);
  // multi: the first item row (the sample starts with it; config rows are no items); a fixed
  // block starts with row 1
  const first = (u) => (multi ? u.d.rows.findIndex((r) => !config.has(r.key) && rowFits(entry.model, r)) : 0);
  const exact = (u) => (multi ? rowIsModel(entry.model, u.d.rows[first(u)]) : u.d.rows.every((r, i) => rowIsModel(entry.model[i], r)));
  const items = (u) => (multi ? u.d.rows.slice(first(u), first(u) + MAX_ITEMS).filter((r) => rowFits(entry.model, r)).length : 0);
  // the earlier sample (pickSample) stays when it is the model exactly: no change for authors
  if (preferred && entry.fit.includes(preferred.d) && first(preferred) === 0 && exact(preferred)) return preferred;
  const [u] = uses.filter((x) => entry.fit.includes(x.d))
    .sort((a, b) => (exact(b) - exact(a)) || (first(a) - first(b)) || (items(b) - items(a)) || byPage(a, b));
  if (first(u) === 0 && exact(u)) return u;
  const block = u.block.cloneNode(true);
  if (multi) [...block.children].slice(0, first(u)).forEach((r) => r.remove());
  const rows = [...block.children];
  (multi ? [entry.model] : entry.model).forEach((modelRow, ri) => {
    [...rows[ri].children].forEach((cell, ci) => trimCell(cell, modelRow[ci].length));
  });
  return { page: u.page, block, trimmed: !exact(u) };
}

/** Generic label of one field element. */
function genericLabel(el, state, spec) {
  if (el.tagName === 'IMG' || el.querySelector('img')) return spec.imageLabel || 'Image';
  if (el.tagName === 'UL' || el.tagName === 'OL') return [...el.children].every((li) => li.querySelector('a')) ? 'Links' : 'List';
  if (/^H[1-6]$/.test(el.tagName)) { state.headings += 1; return state.headings === 1 ? 'Title' : 'Subtitle'; }
  const text = el.textContent.trim();
  if (/^\{[^}]*\}$/.test(text)) return 'Settings';
  const links = [...el.querySelectorAll('a')];
  let link = links.length === 1 ? links[0] : null;
  if (el.tagName === 'A') link = el;
  if (link && link.textContent.trim() === text) {
    const href = link.getAttribute('href') || '';
    if (/\.mp4(\?|#|$)/i.test(href)) return 'Video';
    if (/\.vtt(\?|#|$)/i.test(href)) return /audio|deskription/i.test(text) ? 'Audio description' : 'Subtitles';
    if (el.querySelector('strong a, em a, a strong, a em') || /^(STRONG|EM)$/.test(link.parentElement?.tagName)) return 'Button';
    return 'Link';
  }
  if (!state.headings && state.index === 0 && state.total > 1 && text.length < 60 && state.nextIsHeading) return 'Eyebrow';
  return 'Text';
}

/** Labels of one cell: spec labels first, then generic ones, numbered when repeated. */
function cellLabels(cell, preset, spec, keyText, columnHeadings) {
  const c = normalizeCell(cell.cloneNode(true));
  const fields = contentFields(c);
  const isHeading = (el) => /^H[1-6]$/.test(el.tagName);
  if (columnHeadings && fields.some(isHeading)) {
    // accordion-columns panel: each heading starts a column, followed by its list of links
    let n = 0;
    const seen = {};
    return fields.map((el) => {
      let label;
      if (isHeading(el)) {
        n += 1;
        label = `Column ${n} title`;
      } else if (n && (el.tagName === 'UL' || el.tagName === 'OL')) label = `Column ${n} links`;
      else label = n ? `Column ${n} text` : 'Text';
      seen[label] = (seen[label] || 0) + 1;
      return seen[label] > 1 ? `${label} ${seen[label]}` : label;
    });
  }
  const state = { headings: 0, index: 0, total: fields.length };
  const used = {};
  return fields.map((el, i) => {
    state.index = i;
    state.nextIsHeading = /^H[1-6]$/.test(fields[i + 1]?.tagName || '');
    let label = preset?.[i] || (keyText && i === 0 ? keyText : null) || genericLabel(el, state, spec);
    if (!preset?.[i] && /^H[1-6]$/.test(el.tagName) === false && state.headings === 0 && label === 'Title') state.headings = 1;
    used[label] = (used[label] || 0) + 1;
    if (used[label] > 1) label = `${label} ${used[label]}`;
    return label;
  });
}

/** Fields table rows for a sample block. */
function fieldRows(sample, spec) {
  const rows = [...sample.children];
  const maxCols = Math.max(1, ...rows.map((r) => r.children.length));
  const pick = spec.multi ? rows.slice(0, 1) : rows;
  return {
    maxCols,
    rows: pick.map((row, ri) => {
      const cells = [...row.children];
      const presetRow = spec.multi ? spec.item : spec.rows?.[ri];
      const isKv = !spec.multi && cells.length === 2 && !presetRow
      && cells[0].textContent.trim().length > 0 && cells[0].textContent.trim().length <= 40
      && !cells[0].querySelector('img, a, ul, ol, h1, h2, h3, h4, h5, h6');
      return cells.map((cell, ci) => {
        const span = cells.length < maxCols && ci === cells.length - 1 ? maxCols - ci : 1;
        let labels;
        const key = title(cells[0].textContent.trim());
        if (isKv && ci === 0) labels = cellLabels(cell, ['IGNORE'], spec);
        else if (isKv) labels = cellLabels(cell, null, spec, key).map((l, i) => (i ? `${key} ${l.toLowerCase()}` : l));
        else if (spec.columnLabels) labels = cellLabels(cell, [`Column ${ci + 1}`], spec);
        else if (spec.headerLabels) labels = cellLabels(cell, [title(cell.textContent.trim()) || `Column ${ci + 1}`], spec);
        else labels = cellLabels(cell, presetRow?.[ci] || spec.allRows?.[ci], spec, null, spec.columnHeadings && ci === 1);
        return { span, labels };
      });
    }),
  };
}

/** A copy of the sample block for the library (multi blocks: the first MAX_ITEMS rows). */
function sampleHtml(block, spec) {
  const copy = block.cloneNode(true);
  if (spec.multi) [...copy.children].slice(MAX_ITEMS).forEach((r) => r.remove());
  return copy.outerHTML.replace(/(["(])\/media-da\//g, `$1https://content.da.live/${ORG_SITE}/media-da/`);
}

function metadataHtml(description, fields) {
  const head = `<tr><td colspan="${fields.maxCols}"><p>Fields</p></td></tr>`;
  const body = fields.rows.map((cells) => `<tr>${cells.map((c) => `<td${c.span > 1 ? ` colspan="${c.span}"` : ''}>${(c.labels.length ? c.labels : ['IGNORE']).map((l) => `<p>${esc(l)}</p>`).join('')}</td>`).join('')}</tr>`).join('');
  return `<div class="library-metadata"><div><div><p>description</p></div><div><p>${esc(description)}</p></div></div>`
    + `<div><div><p>fields</p></div><div><table><tbody>${head}${body}</tbody></table></div></div></div>`;
}

// --- documents
fs.mkdirSync(OUT, { recursive: true });
const byBlock = new Map();
[...variants.values()].forEach((v) => { if (!byBlock.has(v.name)) byBlock.set(v.name, []); byBlock.get(v.name).push(v); });
const index = [];
const manifest = {};
const missingSpec = [];
[...byBlock.keys()].sort().forEach((name) => {
  const spec = specFor(SITE.name, name);
  if (!spec.description) missingSpec.push(name);
  const list = byBlock.get(name).sort((a, b) => (a.opts.length - b.opts.length) || b.uses.length - a.uses.length || a.key.localeCompare(b.key));
  const sections = [];
  const addVariant = (v, sample, heading, extra = {}) => {
    const opts = v.opts.map((o) => OPTION_NOTES[o] || o);
    const description = `${spec.description || title(name.replace(/-/g, ' '))}${opts.length ? ` (${opts.join(', ')})` : ''}.${extra.note ? ` ${extra.note}` : ''}`;
    const fields = fieldRows(sample.block, spec);
    const empty = spec.multi && !sample.block.children.length;
    // a multi block needs a first item for its fields; an empty sample gets the description only
    const meta = empty ? `<div class="library-metadata"><div><div><p>description</p></div><div><p>${esc(description)}</p></div></div></div>` : metadataHtml(description, fields);
    // every entry under its H2: the dialog names it and links to it (its anchor)
    const h2 = heading || `${title(name.replace(/-/g, ' '))}${v.opts.length ? ` (${v.opts.join(', ')})` : ''}`;
    sections.push(`<div><h2>${esc(h2)}</h2>${sampleHtml(sample.block, spec)}${meta}</div>`);
    const pages = [...new Set(v.uses.map((u) => u.page))];
    manifest[`${v.key}${heading ? ` [${heading}]` : ''}`] = {
      block: name, name: h2, variant: v.opts.join(', '), heading: heading || '', multi: !!spec.multi, sample: sample.page, pages, fieldsOmitted: empty, ...(extra.entry ? { entry: extra.entry } : {}), ...(sample.trimmed ? { trimmed: true } : {}),
    };
  };
  list.forEach((v) => {
    if (name === 'article-header') {
      // content variants: without and with the header video (row 1: image, then the .mp4 link)
      const plain = v.uses.filter((u) => u.firstOnPage && rowShape(u.d.rows[0]) === 'i');
      const video = v.uses.filter((u) => u.firstOnPage && rowShape(u.d.rows[0]) === 'it');
      const best = (us) => [...us].sort((a, b) => localeRank(a.page) - localeRank(b.page) || a.page.localeCompare(b.page))[0];
      addVariant({ ...v, uses: plain }, best(plain));
      if (video.length) addVariant({ ...v, uses: video }, best(video.filter((u) => / \{mobile\}/.test(u.block.innerHTML))) || best(video), 'Article header with video');
      return;
    }
    // one entry per structure the pages use (the first: the one the most blocks resolve against;
    // the Block Inspector edits every block of the variant with it), samples cut to the model
    const multi = !!spec.multi;
    const entries = chooseModels(v.uses.map((u) => u.d), multi);
    const config = multi ? configKeys(v.uses.map((u) => u.d)) : new Set();
    if (!entries.length) {
      addVariant(v, pickSample(v, spec));
      return;
    }
    const label = `${title(name.replace(/-/g, ' '))}${v.opts.length ? ` (${v.opts.join(', ')})` : ''}`;
    entries.forEach((entry, i) => {
      const sample = sampleFor(entry, v.uses, multi, i ? null : pickSample(v, spec), config);
      if (!i) {
        addVariant(v, sample);
        return;
      }
      addVariant({ ...v, uses: v.uses.filter((u) => entry.fit.includes(u.d)) }, sample, `${label}: ${describeModel(entry.model, multi)}`, {
        entry: i + 1,
        note: `Another structure of this variant (${entry.fit.length} blocks), for inserting it: the Block Inspector edits every block of the variant with the first table of the variant.`,
      });
    });
  });
  fs.writeFileSync(path.join(OUT, `${name}.plain.html`), sections.join(''));
  index.push({ name: spec.title || title(name.replace(/-/g, ' ')), path: `https://content.da.live/${ORG_SITE}/library/blocks/${name}` });
});

const editor = [...byBlock.keys()].filter((n) => specFor(SITE.name, n).multi).map((block) => ({ block, property: 'multi' })).sort((a, b) => a.block.localeCompare(b.block));
const options = [
  { blocks: 'fare-teaser, flight-search, price-bar', key: 'Cabin', values: 'Economy=E|Premium Economy=P|Business=B|First=F' },
  { blocks: 'blog-overview', key: 'Category', values: 'Explore the world=explore-the-world|Explore flying=explore-flying|Highlights=highlights' },
  { blocks: 'blog-overview', key: 'Hide filter', values: 'Yes=true|No=false' },
  { blocks: 'car-rental', key: 'Partner ID', values: 'SIXT=105.14|Hertz=105.13|Europcar=105.12|Rental car offers=105.11' },
  { blocks: 'destination-offer', key: 'Content languages', values: 'English=en|German=de' },
];
const siteOptions = options.filter((o) => o.blocks.split(', ').some((b) => byBlock.has(b)));
const sheet = (data) => ({
  total: data.length, limit: data.length, offset: 0, data, ':colWidths': [],
});
const json = {
  blocks: sheet(index), editor: sheet(editor), options: sheet(siteOptions), ':names': ['blocks', 'editor', 'options'], ':version': 3, ':type': 'multi-sheet',
};
fs.writeFileSync(path.join(LIBRARY, 'blocks.json'), `${JSON.stringify(json, null, 2)}\n`);
// the migration tools' block list (.migration/project.json: /library/ema-library.json), the same names
const ema = {
  total: index.length, limit: index.length, offset: 0, data: index.map((b) => ({ name: b.name, path: b.path.replace(`https://content.da.live/${ORG_SITE}`, '') })), ':type': 'sheet',
};
if (SITE.sheets.includes('ema-library.json')) fs.writeFileSync(path.join(LIBRARY, 'ema-library.json'), `${JSON.stringify(ema, null, 2)}\n`);
fs.mkdirSync(path.dirname(SITE.manifest), { recursive: true });
fs.writeFileSync(SITE.manifest, `${JSON.stringify(manifest, null, 1)}\n`);
console.log(`build-library (${SITE.name}): ${byBlock.size} block documents, ${Object.keys(manifest).length} variants (incl. content variants), editor ${editor.length}, options ${siteOptions.length}${missingSpec.length ? `; no spec: ${missingSpec.join(', ')}` : ''}`);
