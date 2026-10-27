/* eslint-disable no-console, max-len, import/no-extraneous-dependencies, import/extensions -- linkedom is a dev tool dependency */
/**
 * Checks the block library (content/library/blocks/*.html, built by build-library.mjs) the way
 * the Block Inspector of adobe-rnd/ew-extensions (tools/block-editor, pinned a533000) reads it:
 *
 * 1. Library: every variant (library.js parseVariants) has a fields table whose first row is a
 *    single "Fields" cell spanning the columns; then, for a multi block (editor sheet), exactly
 *    one item row, otherwise one row per template row (fields.js buildBlockFieldDefinitions):
 *    same cell count and spans, and per cell as many labels as the template cell has fields
 *    (document.js contentFields: one per heading, paragraph, image or list; matchFieldCount
 *    allows spacer paragraphs around images).
 * 2. Pages: for up to three pages per variant (de/en, de/de and one more), and counted over all
 *    pages, the page block must resolve like fields.js resolveBlockFields: the same row count
 *    (not for multi blocks), per row the same cell count, per cell at least as many fields
 *    and, at each labelled position, a field of the same type (text, image, list). For multi
 *    blocks every row is checked against the item schema.
 *
 * Writes tools/reports/block-library.md (one line per variant) and tools/reports/block-library.json.
 * Usage: node tools/library/check-fields.mjs [--lib dir] [--out dir] [--compare earlier/block-library.json --named "a; b"]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parse, describeBlockDiv, libraryVariants, fieldLabels, matchFieldCount,
} from './structure.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CONTENT = path.join(root, 'content');
const argv = process.argv.slice(2);
const opt = (name) => (argv.includes(`--${name}`) ? argv[argv.indexOf(`--${name}`) + 1] : undefined);
// --lib dir: another copy of the library (blocks/*.html, blocks.json, library-variants.json)
const LIB_DIR = opt('lib') ? path.resolve(opt('lib')) : path.join(CONTENT, 'library');
const LIB = path.join(LIB_DIR, 'blocks');
const index = JSON.parse(fs.readFileSync(path.join(LIB_DIR, 'blocks.json'), 'utf8'));
const manifestFile = fs.existsSync(path.join(LIB_DIR, 'library-variants.json')) ? path.join(LIB_DIR, 'library-variants.json') : path.join(root, 'tools/library/library-variants.json');
const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
// --out dir: where the reports go (default tools/reports)
const OUT = opt('out') ? path.resolve(opt('out')) : path.join(root, 'tools/reports');
const multiBlocks = new Set(index.editor.data.filter((r) => r.property === 'multi').map((r) => r.block));
const LOCALES = ['/de/en/', '/de/de/'];

/** Library check of one variant: the definitions (labels with positions and types), or errors. */
function checkLibrary(item, multi) {
  const template = describeBlockDiv(item.block);
  if (!item.fields) return { errors: ['no fields table'], template, defs: [] };
  const { header, rows } = fieldLabels(item.fields);
  const errors = [];
  if (!header || header.cells !== 1 || header.text !== 'fields') errors.push('the first row is not a single "Fields" cell');
  const maxCols = Math.max(1, ...template.rows.map((r) => r.cells.length));
  if (header && Number(item.fields.querySelector('tr td, tr th')?.getAttribute('colspan') || 1) !== maxCols) errors.push(`the Fields cell spans ${item.fields.querySelector('tr td, tr th')?.getAttribute('colspan') || 1} columns, the block has ${maxCols}`);
  if (multi && !template.rows.length) errors.push('multi block without a first item');
  const expected = multi ? 1 : template.rows.length;
  if (rows.length !== expected) errors.push(`${rows.length} field rows, the template has ${expected}${multi ? ' (multi: one item row)' : ''}`);
  const defs = [];
  rows.slice(0, expected).forEach((cells, ri) => {
    const trow = template.rows[ri];
    if (!trow) return;
    if (cells.length !== trow.cells.length) { errors.push(`row ${ri + 1}: ${cells.length} cells, the template has ${trow.cells.length}`); return; }
    cells.forEach((cell, ci) => {
      if (cell.colspan !== trow.cells[ci].colspan) errors.push(`row ${ri + 1} cell ${ci + 1}: span ${cell.colspan}, the template ${trow.cells[ci].colspan}`);
      const fields = matchFieldCount(trow.cells[ci].fields, cell.labels.length);
      if (fields.length !== cell.labels.length) { errors.push(`row ${ri + 1} cell ${ci + 1}: ${cell.labels.length} labels for ${trow.cells[ci].fields.length} fields`); return; }
      cell.labels.forEach((label, fi) => {
        if (!label || label.toUpperCase() === 'IGNORE') return;
        defs.push({
          ri, ci, fi, label, type: fields[fi].type, cellCount: trow.cells.length, fieldCount: fields.length,
        });
      });
    });
  });
  return { errors, template, defs };
}

/**
 * Page check: the fields that would not resolve, as short messages (empty: the page matches).
 * Multi blocks: rows with another cell count than the item (label, intro or config rows) are
 * counted in `other`, not reported; the extension shows them as items without editable fields.
 */
function checkPage(block, lib, multi, other = { rows: 0 }) {
  const d = describeBlockDiv(block);
  const issues = [];
  if (!multi && d.rows.length !== lib.template.rows.length) return [`${d.rows.length} rows, the library has ${lib.template.rows.length}`];
  const itemCells = lib.template.rows[0]?.cells.length;
  const rows = multi ? d.rows.map((r, i) => [r, i]).filter(([r]) => {
    if (r.cells.length === itemCells) return true;
    other.rows += 1;
    return false;
  }) : [[null, null]];
  // a multi block without a row of the item's cells has nothing the sidebar can edit
  if (multi && !rows.length && lib.defs.length) return [`no item row (${d.rows.length} rows, none with ${itemCells} cells)`];
  rows.forEach(([, itemIndex]) => {
    lib.defs.forEach((def) => {
      const row = d.rows[multi ? itemIndex : def.ri];
      const cell = row?.cells[def.ci];
      const where = multi ? `row ${itemIndex + 1}` : `row ${def.ri + 1}`;
      if (!row || row.cells.length !== def.cellCount) { issues.push(`${where}: ${row ? row.cells.length : 0} cells, the library ${def.cellCount}`); return; }
      const fields = matchFieldCount(cell.fields, def.fieldCount);
      if (fields.length < def.fieldCount) { issues.push(`${where} cell ${def.ci + 1}: ${fields.length} fields, the library ${def.fieldCount}`); return; }
      if (fields[def.fi].type !== def.type) issues.push(`${where} cell ${def.ci + 1} "${def.label}": ${fields[def.fi].type}, the library ${def.type}`);
    });
  });
  return [...new Set(issues)];
}

const pageBlocks = (page, name, variant) => {
  const file = path.join(CONTENT, `${page}.plain.html`);
  if (!fs.existsSync(file)) return [];
  const doc = parse(`<main>${fs.readFileSync(file, 'utf8')}</main>`);
  const want = [name, ...(variant ? variant.split(', ') : [])].join(' ');
  return [...doc.querySelectorAll('main > div > div[class]')].filter((b) => b.className.trim().split(/\s+/).join(' ') === want);
};

const results = [];
// the library entries per class combination, in library order: the Block Inspector edits every
// block of a combination with its first entry (library.js getBlockFieldTemplate: the first match)
const entries = fs.readdirSync(LIB).filter((f) => f.endsWith('.html')).sort().flatMap((file) => libraryVariants(fs.readFileSync(path.join(LIB, file), 'utf8')).map((item) => {
  const [name, ...opts] = item.block.className.trim().split(/\s+/);
  const variant = opts.join(', ');
  return {
    item, name, variant, cls: `${name}|${variant}`, key: `${variant ? `${name} (${variant})` : name}${item.heading ? ` [${item.heading}]` : ''}`,
  };
}));
const firstOf = new Map();
entries.forEach((e) => { if (!firstOf.has(e.cls)) firstOf.set(e.cls, e); });
// every page of a class combination (the manifest lists a later entry's pages under its own key)
const classPages = new Map();
entries.forEach((e) => classPages.set(e.cls, [...new Set([...(classPages.get(e.cls) || []), ...((manifest[e.key] || {}).pages || [])])]));
entries.forEach(({
  item, name, variant, cls, key,
}) => {
  const multi = multiBlocks.has(name);
  const later = firstOf.get(cls).item !== item;
  const info = { ...(manifest[key] || { pages: [] }), pages: classPages.get(cls) };
  if (info.fieldsOmitted) {
    results.push({
      key, status: 'NOTE', text: 'no fields: multi block whose pages have no rows (the extension needs a first item)', pages: info.pages.length,
    });
    return;
  }
  const lib = checkLibrary(item, multi);
  if (lib.errors.length) {
    results.push({
      key, status: 'LIBRARY', text: lib.errors.join('; '), pages: info.pages.length,
    }); return;
  }
  // every page, and the three named ones
  const differing = [];
  const other = { rows: 0 };
  let blocks = 0;
  info.pages.forEach((p) => pageBlocks(p, name, variant).forEach((b, i) => {
    blocks += 1;
    const issues = checkPage(b, lib, multi, other);
    if (issues.length) differing.push({ page: i ? `${p} (block ${i + 1})` : p, issues });
  }));
  if (later) {
    results.push({
      key,
      status: 'SECOND',
      text: `fits ${blocks - differing.length} of the ${blocks} blocks of the variant (${firstOf.get(cls).key} fits the others or none); not used by the Block Inspector, which edits the variant with its first entry`,
      pages: info.pages.length,
      blocks,
      fits: blocks - differing.length,
      differing,
    });
    return;
  }
  const named = [...LOCALES.map((l) => info.pages.find((p) => p.startsWith(l))), info.pages.find((p) => !LOCALES.some((l) => p.startsWith(l)))].filter(Boolean).slice(0, 3);
  const namedIssues = named.map((p) => ({ page: p, issues: pageBlocks(p, name, variant).flatMap((b) => checkPage(b, lib, multi)) }));
  const bad = namedIssues.filter((n) => n.issues.length);
  results.push({
    key,
    status: bad.length ? 'PAGES' : 'OK',
    text: bad.length ? bad.map((n) => `${n.page}: ${n.issues.slice(0, 2).join('; ')}`).join(' | ') : `checked ${named.join(', ')}`,
    pages: info.pages.length,
    blocks,
    otherRows: other.rows,
    differing,
  });
});

// per class combination: the blocks no entry fits (a later entry would fit the others if the
// Block Inspector picked the entry by structure)
const byClass = new Map();
results.forEach((r) => {
  const cls = r.key.replace(/ \[.*\]$/, '');
  if (!byClass.has(cls)) byClass.set(cls, []);
  byClass.get(cls).push(r);
});
byClass.forEach((rs) => {
  if (rs.length < 2 || !rs[0].differing) return;
  const ids = (r) => new Set((r.differing || []).map((d) => d.page));
  const none = rs.slice(1).reduce((acc, r) => new Set([...acc].filter((x) => ids(r).has(x))), ids(rs[0]));
  rs[0].fitByNone = none.size;
});

const ok = results.filter((r) => r.status === 'OK').length;
const countCell = (r) => {
  if (r.status === 'SECOND') return `fits ${r.fits} / ${r.blocks}`;
  return r.differing ? `${r.differing.length} / ${r.blocks}` : `- / ${r.pages} pages`;
};
const libErr = results.filter((r) => r.status === 'LIBRARY');
const lines = [
  '# Block library check', '',
  `${new Date().toISOString().slice(0, 10)}. ${results.length} library variants: ${ok} OK on the named pages, ${results.filter((r) => r.status === 'PAGES').length} with named pages that differ, ${libErr.length} with a library error, ${results.filter((r) => r.status === 'NOTE').length} notes, ${results.filter((r) => r.status === 'SECOND').length} second structures. "Blocks differing" counts every block of the variant on all pages that does not resolve against the library table (tools/reports/block-library.json lists them); "Other rows" counts rows of multi blocks with another cell count than the item (label, intro or config rows), which the sidebar shows as items without editable fields.`, '',
  'SECOND: a later library entry of the same variant (another structure its pages use, for inserting it); the Block Inspector edits every block of a variant with the first entry (library.js getBlockFieldTemplate). "No entry fits" counts the blocks of a variant that none of its entries fits.', '',
  '| Variant | Result | Detail | Blocks differing / all | No entry fits | Other rows (multi) |', '| --- | --- | --- | --- | --- | --- |',
  ...results.map((r) => `| ${r.key} | ${r.status} | ${r.text.replace(/\|/g, '\\|')} | ${countCell(r)} | ${r.fitByNone ?? ''} | ${r.otherRows || ''} |`), '',
];
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'block-library.md'), lines.join('\n'));
fs.writeFileSync(path.join(OUT, 'block-library.json'), `${JSON.stringify(results, null, 1)}\n`);
// --compare report.json (an earlier run): the counts before and after per variant
if (opt('compare')) {
  const before = new Map(JSON.parse(fs.readFileSync(path.resolve(opt('compare')), 'utf8')).map((r) => [r.key, r]));
  const named = (opt('named') || '').split(';').map((k) => k.trim()).filter(Boolean);
  const changed = results.filter((r) => r.status !== 'SECOND' && !named.includes(r.key) && r.differing && before.get(r.key)?.differing
    && before.get(r.key).differing.length !== r.differing.length).map((r) => r.key);
  const row = (key) => {
    const a = before.get(key);
    const b = results.find((r) => r.key === key);
    if (!a || !b) return `| ${key} | ${a ? `${a.differing.length} / ${a.blocks}` : '-'} | ${b ? `${b.differing.length} / ${b.blocks}` : '-'} | | |`;
    const later = results.filter((r) => r.status === 'SECOND' && r.key.startsWith(`${key} [`))
      .map((r) => `${r.key.slice(key.length + 2, -1).split(': ').slice(1).join(': ')}: fits ${r.fits}`).join('; ');
    return `| ${key} | ${a.differing.length} / ${a.blocks} | ${b.differing.length} / ${b.blocks} | ${b.fitByNone ?? b.differing.length} | ${later || '-'} |`;
  };
  fs.writeFileSync(path.join(OUT, 'block-library-fit.md'), [`# Block library: models fitted to the pages (${new Date().toISOString().slice(0, 10)})`, '',
    'Blocks the Block Inspector cannot resolve with the variant\'s first library entry, before (the earlier library, checked with the same rules) and after. "No entry fits": the blocks none of the variant\'s entries fits. Later entries: the other structures the pages use, for inserting them; the Block Inspector edits every block of a variant with its first entry (library.js getBlockFieldTemplate). The variants named in the request first, then every other variant whose count changed.', '',
    '| Variant | Differing before | Differing after | No entry fits | Later entries (structure: blocks it fits) |', '| --- | --- | --- | --- | --- |',
    ...[...named, ...changed].map(row), ''].join('\n'));
}
console.log(`check-fields: ${results.length} variants, ${ok} OK, ${results.length - ok} not OK (library errors ${libErr.length})`);
if (libErr.length) { libErr.forEach((r) => console.log(`  ${r.key}: ${r.text}`)); process.exitCode = 1; }
