/* eslint-disable max-len, import/no-extraneous-dependencies -- linkedom is a dev tool dependency */
/**
 * Block structure as the Block Inspector (adobe-rnd/ew-extensions tools/block-editor, pinned
 * a533000) sees it: document.js describeBlock() and contentFields()/describeField(), and
 * library.js parseVariants()/getBlockTableHtml(), on linkedom instead of the browser DOM.
 *
 * A cell's fields are its child elements (a blockquote counts by its children), or the cell
 * itself when it has none; each field is an image (it holds an img), a list (ul/ol) or text.
 * Cells are normalized first as the DA editor stores them: runs of inline content (text,
 * links, formatting, pictures) become paragraphs.
 */
import { parseHTML } from 'linkedom';

const INLINE = new Set(['A', 'ABBR', 'B', 'BR', 'CODE', 'EM', 'I', 'IMG', 'PICTURE', 'SMALL', 'SPAN', 'STRONG', 'SUB', 'SUP', 'U', 'S', 'DEL', 'INS', 'MARK', 'TIME']);

export const parse = (html) => parseHTML(`<!doctype html><html><body>${html}</body></html>`).document;

/** Wraps runs of inline nodes of a cell in paragraphs (the DA editor's schema). */
export function normalizeCell(cell) {
  const doc = cell.ownerDocument;
  let run = null;
  [...cell.childNodes].forEach((node) => {
    const inline = node.nodeType === 3 || (node.nodeType === 1 && INLINE.has(node.tagName));
    if (!inline) { run = null; return; }
    if (node.nodeType === 3 && !node.textContent.trim() && !run) { node.remove(); return; }
    if (!run) {
      run = doc.createElement('p');
      cell.insertBefore(run, node);
    }
    run.append(node);
  });
  cell.querySelectorAll(':scope > p').forEach((p) => {
    if (!p.textContent.trim() && !p.querySelector('img, picture')) p.remove();
  });
  return cell;
}

/** document.js contentFields() */
export function contentFields(cell) {
  if (!cell.children.length) return [cell];
  return [...cell.children].flatMap((el) => (el.tagName === 'BLOCKQUOTE' ? [...el.children] : [el]));
}

/** document.js describeField(): the type only. */
export function fieldType(el) {
  if (el.tagName === 'IMG' || el.querySelector('img')) return 'image';
  if (el.tagName === 'UL' || el.tagName === 'OL') return 'list';
  return 'text';
}

/**
 * Rows of a block div (page or library: <div class="name opts"><div row><div cell>...), as the
 * table getBlockTableHtml() builds: the last cell of a short row spans the remaining columns.
 */
export function describeBlockDiv(block) {
  const [name, ...variants] = block.className.trim().split(/\s+/);
  const rows = [...block.children];
  const maxCols = Math.max(1, ...rows.map((r) => r.children.length));
  return {
    name,
    variant: variants.join(', '),
    rows: rows.map((row) => ({
      cells: [...row.children].map((cell, i) => {
        const c = normalizeCell(cell.cloneNode(true));
        const span = row.children.length < maxCols && i === row.children.length - 1 ? maxCols - i : 1;
        return { colspan: span, fields: contentFields(c).map((el) => ({ type: fieldType(el), empty: !el.textContent.trim() && !el.querySelector('img') })) };
      }),
    })),
  };
}

/** fields.js matchFieldCount(): image-only cells may carry empty spacer paragraphs. */
export function matchFieldCount(fields, count) {
  if (fields.length === count) return fields;
  const content = fields.filter((f) => f.type !== 'text' || !f.empty);
  return content.length === count && content.every((f) => f.type === 'image') ? content : fields;
}

/** library.js parseVariants(): the blocks of a library document with their metadata. */
export function libraryVariants(html) {
  const doc = parse(html);
  const elements = [...doc.querySelectorAll('body > div, main > div')].flatMap((s) => [...s.children]);
  return elements.filter((el) => el.tagName === 'DIV' && !el.classList.contains('library-metadata')).map((block) => {
    const prev = block.previousElementSibling?.classList.contains('library-metadata')
      ? block.previousElementSibling.previousElementSibling : block.previousElementSibling;
    const meta = block.nextElementSibling?.classList.contains('library-metadata') ? block.nextElementSibling : null;
    const item = { heading: /^H[1-6]$/.test(prev?.tagName || '') ? prev.textContent.trim() : '', block };
    [...(meta?.children || [])].forEach((row) => {
      const key = row.children[0]?.textContent.trim().toLowerCase();
      const value = row.children[1];
      if (key === 'fields') item.fields = value?.querySelector('table') || null;
      else if (key) item[key] = value?.textContent.trim();
    });
    return item;
  });
}

/** Field labels of a fields table: rows after the Fields header, cells, one label per child. */
export function fieldLabels(table) {
  const rows = [...table.querySelectorAll('tr')];
  return {
    header: rows[0] ? { cells: rows[0].children.length, text: rows[0].textContent.trim().toLowerCase() } : null,
    rows: rows.slice(1).map((tr) => [...tr.children].map((td) => ({
      colspan: Number(td.getAttribute('colspan') || 1),
      labels: td.children.length ? [...td.children].map((e) => e.textContent.trim()) : [td.textContent.trim()],
    }))),
  };
}

/** Shape signature of a row: cell count and the field types per cell. */
export const rowShape = (row) => row.cells.map((c) => c.fields.map((f) => f.type[0]).join('')).join('|');

/**
 * Whether a page row resolves against a template row (fields.js resolveBlockFields): the same
 * cells, per cell at least as many fields, and the template's field types at its positions.
 */
export function rowCovers(template, row) {
  if (!row || row.cells.length !== template.cells.length) return false;
  return template.cells.every((tc, i) => {
    const n = matchFieldCount(tc.fields, tc.fields.length).length;
    const fields = matchFieldCount(row.cells[i].fields, n);
    const want = matchFieldCount(tc.fields, n);
    return fields.length >= n && want.every((f, fi) => fields[fi].type === f.type);
  });
}

/** Whether a page block resolves against a template block (same rows, every row covered). */
export const blockCovers = (template, block) => template.rows.length === block.rows.length
  && template.rows.every((r, i) => rowCovers(r, block.rows[i]));
