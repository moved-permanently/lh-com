/**
 * Reads a DA structured content document as Edge Delivery renders it (the form editor's format:
 * a "da-form" block with title and x-schema-name, the schema's block with one row per field,
 * nested objects as further blocks referenced by "self://#<name>-<id>"), into
 * { metadata: { title, schemaName }, data }. Lists are <ul> values; booleans and integers are
 * typed by the field names given (the document holds text only).
 */
import {
  parseHtml, elements, textOf, findAll,
} from './html.js';

const SELF = /^self:\/\/#([\w-]+)$/;

function cellValue(cell) {
  const lists = findAll(cell, (n) => n.tag === 'ul' || n.tag === 'ol');
  if (lists.length) {
    return elements(lists[0]).filter((li) => li.tag === 'li').map((li) => textOf(li).trim());
  }
  const paras = elements(cell).filter((n) => n.tag === 'p');
  if (paras.length > 1) return paras.map((p) => textOf(p).trim()).join('\n');
  return textOf(cell).trim();
}

function typed(key, value, types) {
  const t = types[key];
  if (Array.isArray(value)) return value;
  if (t === 'boolean') {
    if (value === 'true') return true;
    return value === 'false' ? false : null;
  }
  if (t === 'integer') {
    const n = Number(value);
    return value !== '' && Number.isFinite(n) ? n : null;
  }
  return value;
}

/**
 * @param {string} html the document's main section (index property html, or .plain.html)
 * @param {Object<string,'boolean'|'integer'>} [types] field types by field name
 */
export default function readDaForm(html, types = {}) {
  const root = parseHtml(html);
  // the section div of a .plain.html, or the blocks themselves (index innerHTML)
  let blocks = elements(root);
  if (blocks.length === 1 && !blocks[0].attrs.class) blocks = elements(blocks[0]);
  const byRef = new Map();
  blocks.forEach((b) => {
    const classes = (b.attrs.class || '').split(/\s+/).filter(Boolean);
    if (classes[1]) byRef.set(classes[1], b);
  });
  const readBlock = (block, seen = new Set()) => {
    const out = {};
    elements(block).forEach((row) => {
      const [k, v] = elements(row);
      if (!k || !v) return;
      const key = textOf(k).trim();
      if (!key) return;
      let value = cellValue(v);
      const resolve = (s) => {
        const m = typeof s === 'string' && s.match(SELF);
        if (!m || !byRef.has(m[1]) || seen.has(m[1])) return s;
        return readBlock(byRef.get(m[1]), new Set([...seen, m[1]]));
      };
      value = Array.isArray(value) ? value.map(resolve) : resolve(value);
      out[key] = typed(key, value, types);
    });
    return out;
  };
  const form = blocks.find((b) => (b.attrs.class || '').split(/\s+/)[0] === 'da-form');
  const meta = form ? readBlock(form) : {};
  const schemaName = meta['x-schema-name'] || '';
  const main = blocks.find((b) => (b.attrs.class || '').split(/\s+/)[0] === schemaName)
    || blocks.find((b) => b !== form && b.attrs.class && !(b.attrs.class || '').split(/\s+/)[1]);
  return { metadata: { title: meta.title || '', schemaName }, data: main ? readBlock(main) : {} };
}
