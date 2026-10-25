/**
 * A small HTML parser for Edge Delivery documents (the page HTML and .plain.html of lh-com):
 * elements, attributes, text; void elements; entities decoded in text and attributes. Not a
 * general HTML5 parser: EDS output is well-formed, which is all it needs.
 */

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const RAW = new Set(['script', 'style']);
const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
};

export function decodeEntities(s) {
  return String(s).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const code = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

const node = (tag, attrs = {}, parent = null) => ({
  tag, attrs, children: [], parent,
});

/**
 * Parses HTML into a tree: { tag, attrs, children: [element | { text }] }.
 * @returns {Object} the root (tag '#root')
 */
export function parseHtml(html) {
  const root = node('#root');
  let cur = root;
  const re = /<!--[\s\S]*?-->|<!doctype[^>]*>|<\/([a-zA-Z][\w-]*)\s*>|<([a-zA-Z][\w-]*)((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>|([^<]+|<)/gi;
  let m = re.exec(html);
  while (m) {
    const [, close, open, rawAttrs, selfClose, text] = m;
    if (text !== undefined) {
      cur.children.push({ text: decodeEntities(text), parent: cur });
    } else if (close) {
      const tag = close.toLowerCase();
      let n = cur;
      while (n && n.tag !== tag && n.tag !== '#root') n = n.parent;
      if (n && n.tag === tag) cur = n.parent;
    } else if (open) {
      const tag = open.toLowerCase();
      const attrs = {};
      (rawAttrs || '').replace(/([^\s=>/]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+)))?/g, (x, k, v, dq, sq, uq) => {
        attrs[k.toLowerCase()] = decodeEntities(dq ?? sq ?? uq ?? '');
        return x;
      });
      const el = node(tag, attrs, cur);
      cur.children.push(el);
      if (RAW.has(tag)) {
        const end = html.toLowerCase().indexOf(`</${tag}`, re.lastIndex);
        const stop = end < 0 ? html.length : end;
        el.children.push({ text: html.slice(re.lastIndex, stop), parent: el });
        re.lastIndex = stop;
      } else if (!VOID.has(tag) && !selfClose) {
        cur = el;
      }
    }
    m = re.exec(html);
  }
  return root;
}

export const isElement = (n) => n && n.tag !== undefined;
export const elements = (n) => (n.children || []).filter(isElement);
export const hasClass = (n, c) => isElement(n) && (n.attrs.class || '').split(/\s+/).includes(c);

/** All descendants matching a predicate (document order). */
export function findAll(n, pred, out = []) {
  (n.children || []).forEach((c) => {
    if (isElement(c)) {
      if (pred(c)) out.push(c);
      findAll(c, pred, out);
    }
  });
  return out;
}
export const find = (n, pred) => findAll(n, pred)[0] || null;

/** Text content. */
export function textOf(n) {
  if (!n) return '';
  if (!isElement(n)) return n.text;
  return n.children.map(textOf).join('');
}
