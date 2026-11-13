/**
 * Where a document's elements are in its own text, so a delta tool can insert a marker into DA's copy byte for byte
 * instead of writing the whole document again from a parsed tree (which changes DA's escaping: an href's `&amp;`, a
 * `&nbsp;`; standing order 13 of 2026-11-13, item 1).
 *
 * sectionChildren(html): the children of the document's top-level <div> sections, in document order, as
 * { tag, start, end } (start: the offset of "<tag", end: the offset after its end tag); null when the text does not
 * close what it opens the way a well-formed document does (then a tool changes nothing). Comments, void elements
 * and raw text (script, style) are skipped; an attribute value may hold ">".
 *
 * placesOf(html, elements): the same for parsed elements (a section's children from linkedom, in document order):
 * the source places in the same order, or null when the tags disagree.
 */
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const RAW = new Set(['script', 'style', 'textarea', 'title']);
const TOKEN = /<!--[\s\S]*?-->|<![^>]*>|<(\/?)([a-zA-Z][\w:-]*)((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>/g;

export function sectionChildren(html) {
  const stack = [];
  const kids = [];
  TOKEN.lastIndex = 0;
  let m;
  // eslint-disable-next-line no-cond-assign
  while ((m = TOKEN.exec(html))) {
    if (m[2]) {
      const tag = m[2].toLowerCase();
      if (!m[1]) {
        if (!VOID.has(tag) && !m[4]) {
          stack.push({ tag, start: m.index });
          if (RAW.has(tag)) {
            const close = html.toLowerCase().indexOf(`</${tag}`, TOKEN.lastIndex);
            if (close < 0) return null;
            TOKEN.lastIndex = close;
          }
        }
      } else if (!VOID.has(tag)) {
        const open = stack.pop();
        if (!open || open.tag !== tag) return null;
        if (stack.length === 1 && stack[0].tag === 'div') kids.push({ tag, start: open.start, end: TOKEN.lastIndex });
      }
    }
  }
  return stack.length ? null : kids;
}

export function placesOf(html, elements) {
  const kids = sectionChildren(html);
  if (!kids || kids.length !== elements.length) return null;
  return kids.every((k, i) => k.tag === elements[i].tagName.toLowerCase()) ? kids : null;
}

/** html with the inserts ([offset, text], in row order) made, from the end so offsets stay valid. */
export function insertAt(html, inserts) {
  return inserts.map((x, i) => [...x, i]).sort((a, b) => b[0] - a[0] || b[2] - a[2])
    .reduce((out, [at, text]) => out.slice(0, at) + text + out.slice(at), html);
}
