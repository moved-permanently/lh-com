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
 * Usage: node tools/library/check-fields.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parse, describeBlockDiv, libraryVariants, fieldLabels, matchFieldCount,
} from './structure.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CONTENT = path.join(root, 'content');
const LIB = path.join(CONTENT, 'library/blocks');
const index = JSON.parse(fs.readFileSync(path.join(CONTENT, 'library/blocks.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools/library/library-variants.json'), 'utf8'));
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
fs.readdirSync(LIB).filter((f) => f.endsWith('.html')).sort().forEach((file) => {
  const html = fs.readFileSync(path.join(LIB, file), 'utf8');
  libraryVariants(html).forEach((item) => {
    const [name, ...opts] = item.block.className.trim().split(/\s+/);
    const variant = opts.join(', ');
    const key = `${variant ? `${name} (${variant})` : name}${item.heading ? ` [${item.heading}]` : ''}`;
    const multi = multiBlocks.has(name);
    const info = manifest[key] || { pages: [] };
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
});

const ok = results.filter((r) => r.status === 'OK').length;
const libErr = results.filter((r) => r.status === 'LIBRARY');
const lines = [
  '# Block library check', '',
  `${new Date().toISOString().slice(0, 10)}. ${results.length} library variants: ${ok} OK on the named pages, ${results.filter((r) => r.status === 'PAGES').length} with named pages that differ, ${libErr.length} with a library error, ${results.filter((r) => r.status === 'NOTE').length} notes. "Blocks differing" counts every block of the variant on all pages that does not resolve against the library table (tools/reports/block-library.json lists them); "Other rows" counts rows of multi blocks with another cell count than the item (label, intro or config rows), which the sidebar shows as items without editable fields.`, '',
  '| Variant | Result | Detail | Blocks differing / all | Other rows (multi) |', '| --- | --- | --- | --- | --- |',
  ...results.map((r) => `| ${r.key} | ${r.status} | ${r.text.replace(/\|/g, '\\|')} | ${r.differing ? `${r.differing.length} / ${r.blocks}` : `- / ${r.pages} pages`} | ${r.otherRows || ''} |`), '',
];
fs.mkdirSync(path.join(root, 'tools/reports'), { recursive: true });
fs.writeFileSync(path.join(root, 'tools/reports/block-library.md'), lines.join('\n'));
fs.writeFileSync(path.join(root, 'tools/reports/block-library.json'), `${JSON.stringify(results, null, 1)}\n`);
console.log(`check-fields: ${results.length} variants, ${ok} OK, ${results.length - ok} not OK (library errors ${libErr.length})`);
if (libErr.length) { libErr.forEach((r) => console.log(`  ${r.key}: ${r.text}`)); process.exitCode = 1; }
