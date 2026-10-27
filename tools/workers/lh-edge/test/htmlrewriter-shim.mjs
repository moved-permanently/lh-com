/* eslint-disable max-len -- test helper */
/**
 * A small stand-in for the Workers runtime's HTMLRewriter (node --test has none): element
 * handlers for "tag" and "tag[attr]" selectors (comma lists), getAttribute / setAttribute /
 * prepend(html) on opening tags; after(html) and remove() on void elements (link, meta, img).
 * Enough for lh-edge's rewriting; not a parser.
 */
const parseSelector = (selector) => selector.split(',').map((s) => {
  const m = s.trim().match(/^([a-z0-9-]+)(?:\[([a-z-]+)\])?$/i);
  return m ? { tag: m[1].toLowerCase(), attr: m[2] ? m[2].toLowerCase() : null } : null;
}).filter(Boolean);

export default class HTMLRewriter {
  constructor() { this.handlers = []; }

  on(selector, handler) {
    this.handlers.push({ selectors: parseSelector(selector), handler });
    return this;
  }

  transform(response) {
    const { handlers } = this;
    const body = response.text().then((html) => html.replace(/<([a-z][a-z0-9-]*)(\s[^>]*)?>/gi, (whole, tagName, rawAttrs = '') => {
      const tag = tagName.toLowerCase();
      const attrs = [];
      rawAttrs.replace(/([a-z_:][-a-z0-9_:.]*)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+)))?/gi, (m, name, v, dq, sq, uq) => {
        attrs.push([name.toLowerCase(), dq ?? sq ?? uq ?? '']);
        return m;
      });
      let prepend = '';
      let after = '';
      let removed = false;
      let changed = false;
      const el = {
        tagName: tag,
        getAttribute: (n) => (attrs.find(([k]) => k === n) || [])[1] ?? null,
        setAttribute: (n, v) => {
          const a = attrs.find(([k]) => k === n);
          if (a) a[1] = v; else attrs.push([n, v]);
          changed = true;
        },
        prepend: (content) => { prepend += content; },
        after: (content) => { after += content; },
        remove: () => { removed = true; },
      };
      handlers.forEach(({ selectors, handler }) => {
        const hit = selectors.some((s) => s.tag === tag && (!s.attr || el.getAttribute(s.attr) !== null));
        if (hit) handler.element(el);
      });
      const open = changed ? `<${tagName}${attrs.map(([k, v]) => ` ${k}="${String(v).replace(/"/g, '&quot;')}"`).join('')}>` : whole;
      if (removed) return after;
      return `${open}${prepend}${after}`;
    }));
    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(new TextEncoder().encode(await body));
        controller.close();
      },
    });
    return new Response(stream, { status: response.status, headers: response.headers });
  }
}
