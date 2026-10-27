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

/**
 * A model row: per cell the field types a fields table labels (['image'], ['text', 'text']).
 * A page row resolves against it as fields.js resolveBlockFields checks every labelled field:
 * the same cell count, per cell at least as many fields (matchFieldCount) and the same type at
 * each position.
 */
export function rowFits(model, row) {
  if (!row || row.cells.length !== model.length) return false;
  return model.every((types, i) => {
    const fields = matchFieldCount(row.cells[i].fields, types.length);
    return fields.length >= types.length && types.every((t, fi) => fields[fi].type === t);
  });
}

/** The first n field types of a cell, as a model cell of n labels would see them. */
const firstTypes = (cell, n) => matchFieldCount(cell.fields, n).slice(0, n).map((f) => f.type);

/** The key of a row: its cell count and each cell's first field type (one label per cell). */
const rowKey = (row) => row.cells.map((c) => firstTypes(c, 1).join('')).join('|');

const groupBy = (items, key) => {
  const groups = new Map();
  items.forEach((x) => {
    const k = key(x);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(x);
  });
  return [...groups.values()];
};

/**
 * The longest model all rows of one group (the same rowKey) resolve against: per cell the
 * longest run of field types every row has, starting from the group's most common shape.
 */
function groupRowModel(group) {
  const counts = new Map();
  group.forEach((r) => counts.set(rowShape(r), (counts.get(rowShape(r)) || 0) + 1));
  const refShape = [...counts].sort((a, b) => b[1] - a[1])[0][0];
  const ref = group.find((r) => rowShape(r) === refShape);
  const model = ref.cells.map((c) => firstTypes(c, 1));
  ref.cells.forEach((cell, ci) => {
    for (let n = 2; n <= cell.fields.length; n += 1) {
      const types = firstTypes(cell, n);
      if (types.length < n) break;
      const trial = model.map((t, i) => (i === ci ? types : t));
      if (!group.every((r) => rowFits(trial, r))) break;
      model[ci] = types;
    }
  });
  return model;
}

const fieldsOf = (rows) => rows.reduce((n, r) => n + r.cells.reduce((m, c) => m + c.fields.length, 0), 0);

/**
 * The model the most page rows resolve against, with as many fields as all of them share: the
 * rows grouped by rowKey (a one-label-per-cell model fits exactly one group), the largest group
 * (ties: the one whose rows have more fields), then groupRowModel. Returns {model, rows}.
 */
export function commonRowModel(rows) {
  const [group] = groupBy(rows, rowKey).sort((a, b) => (b.length - a.length) || (fieldsOf(b) - fieldsOf(a)));
  return group ? { model: groupRowModel(group), rows: group } : { model: [], rows: [] };
}

/** Whether a block resolves against a block model (one model row per row, the same row count). */
export const blockFits = (model, block) => model.length === block.rows.length
  && model.every((m, i) => rowFits(m, block.rows[i]));

/**
 * Whether a multi block resolves against an item model (one model row): it has item rows (the
 * model's cell count) and every one of them resolves. Rows with another cell count (labels,
 * intro, config) are not items; a block with none has nothing the sidebar can edit.
 */
export function itemsFit(model, block) {
  const items = block.rows.filter((r) => r.cells.length === model.length);
  return items.length > 0 && items.every((r) => rowFits(model, r));
}

export const modelFits = (model, block, multi) => (multi ? itemsFit(model, block) : blockFits(model, block));

/** One model per structure group of the blocks: item models (multi) or block models. */
export function candidateModels(blocks, multi) {
  if (multi) return groupBy(blocks.flatMap((b) => b.rows), rowKey).map(groupRowModel);
  return groupBy(blocks, (b) => b.rows.map(rowKey).join(' / '))
    .map((group) => group[0].rows.map((_, ri) => groupRowModel(group.map((b) => b.rows[ri]))));
}

const modelSize = (model, multi) => (multi ? [model] : model).reduce((n, r) => n + r.reduce((m, c) => m + c.length, 0), 0);

/**
 * The library entries of a variant: the model the most blocks resolve against (ties: more
 * fields), then, for the blocks it leaves, the next one, while another structure holds at least
 * `min` blocks or a tenth of the variant (at most `max` entries). Returns [{model, fit: blocks}].
 */
export function chooseModels(blocks, multi, { max = 3, min = 4 } = {}) {
  const entries = [];
  let rest = blocks;
  while (entries.length < max && rest.length) {
    const pool = rest;
    const [best] = candidateModels(pool, multi)
      .map((model) => ({ model, fit: pool.filter((b) => modelFits(model, b, multi)) }))
      .sort((a, b) => (b.fit.length - a.fit.length) || (modelSize(b.model, multi) - modelSize(a.model, multi)));
    if (!best?.fit.length) break;
    if (entries.length && best.fit.length < min && best.fit.length < blocks.length / 10) break;
    entries.push(best);
    rest = rest.filter((b) => !best.fit.includes(b));
  }
  return entries;
}

/** Whether a page structure is exactly the model (no fields beyond it): a sample needs no trim. */
export function rowIsModel(model, row) {
  return rowFits(model, row) && model.every((types, i) => matchFieldCount(row.cells[i].fields, types.length).length === types.length);
}

/** A model in words, for headings: "text | image", rows joined by " / " (more than two: "7 rows"). */
export function describeModel(model, multi) {
  const word = { image: 'image', text: 'text', list: 'list' };
  const cell = (types) => [...new Set(types)].map((t) => word[t]).join(', ');
  const row = (r) => r.map(cell).join(' | ');
  if (multi) return row(model);
  return model.length > 2 ? `${model.length} rows` : model.map(row).join(' / ');
}
