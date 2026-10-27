/* eslint-disable no-underscore-dangle, max-len -- the JSON shapes of www */
/**
 * The Lufthansa app's server-driven screens: /content/mobile/<...>.sdui (v1) and .v2.sdui (v2),
 * rendered from the screen's document (page HTML of the origin) and the query index
 * /content/mobile/lh/query-index.json. The document model (default content, app-* blocks,
 * section metadata Spacing, metadata) is described in ../SDUI.md.
 */
import {
  parseHtml, elements, hasClass, find, findAll, textOf, isElement,
} from './html.js';

export const SDUI_SUFFIX = /((?:\.(?:v2|ios|nocache))*)\.sdui$/;

/**
 * The app screen spellings www answers: <path>[.v2][.ios][.nocache].sdui, the markers in any
 * order and combination, each at most once. v2: the v2 format (ios has no effect there); ios
 * without v2: the iOS v1 answer; nocache: the same body, `Cache-Control: max-age=600`.
 * Returns {path, v2, ios, nocache} or null.
 */
export function parseSduiPath(pathname) {
  const m = String(pathname).match(SDUI_SUFFIX);
  if (!m) return null;
  const markers = m[1].split('.').filter(Boolean);
  if (new Set(markers).size !== markers.length) return null;
  const path = pathname.slice(0, -(m[1].length + '.sdui'.length));
  if (!path || path.endsWith('/')) return null;
  return {
    path, v2: markers.includes('v2'), ios: markers.includes('ios') && !markers.includes('v2'), nocache: markers.includes('nocache'),
  };
}
export const INDEX_PATH = '/content/mobile/lh/query-index.json';

/* --------------------------------------------------------------------------- document */

const SPACER_SIZES = {
  'x-small': 'X_SMALL', small: 'SMALL', medium: 'MEDIUM', 'm-large': 'M_LARGE', large: 'LARGE',
};
const metaKey = (k) => String(k || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

/** Cells of a block: rows of cells (each cell an element). */
const rowsOf = (blk) => elements(blk).map((r) => elements(r));

/**
 * Inline HTML of SDUI texts: b (from strong/b), i, ul/li, br; text escaped as www does. Links are
 * dropped (app screens) unless opts.link(a, innerHtml) renders them (web pages, src/sdui-web.js).
 */
export function inlineHtml(nodes, opts = {}) {
  return nodes.map((n) => {
    if (!isElement(n)) {
      return n.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\u00a0/g, '&nbsp;');
    }
    const inner = (kids) => inlineHtml(kids, opts);
    switch (n.tag) {
      case 'strong': case 'b': return `<b>${inner(n.children)}</b>`;
      case 'em': case 'i': return `<i>${inner(n.children)}</i>`;
      case 'br': return '<br>';
      case 'ul': case 'ol': return `<${n.tag}>${inner(n.children.filter((c) => isElement(c) || c.text.trim()))}</${n.tag}>`;
      case 'li': return `<li>${inner(n.children)}</li>`;
      case 'a': return opts.link ? opts.link(n, inner(n.children)) : inner(n.children);
      default: return inner(n.children);
    }
  }).join('');
}

/** Removes a trailing marker ("{small}") from the last text of an element; true if found. */
function takeMarker(el, marker) {
  const all = [];
  (function walk(n) { (n.children || []).forEach((c) => (isElement(c) ? walk(c) : all.push(c))); }(el));
  const last = [...all].reverse().find((t) => t.text.trim());
  const re = new RegExp(`\\s*\\{${marker}\\}\\s*$`);
  if (!last || !re.test(last.text)) return false;
  last.text = last.text.replace(re, '');
  return true;
}

/**
 * The screen document: metadata and sections of elements, from the origin's page HTML
 * (<head> meta tags, <main> sections with data-* attributes) or a .plain.html with Metadata and
 * Section Metadata blocks (the local import).
 */
/**
 * EDS turns ":word:" in a text into an icon (<span class="icon icon-word"></span>); in app
 * texts it is text ("Gründer:innen: sich"): back to the letters.
 */
function restoreIconTokens(n) {
  (n.children || []).forEach((c, i) => {
    if (!isElement(c)) return;
    const m = c.tag === 'span' && (c.attrs.class || '').match(/(?:^|\s)icon-([\w-]+)/);
    if (m && !textOf(c).trim()) n.children[i] = { text: `:${m[1]}:`, parent: n };
    else restoreIconTokens(c);
  });
}

export function readDocument(html) {
  const root = parseHtml(html);
  restoreIconTokens(root);
  const meta = {};
  const head = find(root, (n) => n.tag === 'head');
  if (head) {
    findAll(head, (n) => n.tag === 'meta').forEach((m) => {
      const k = m.attrs.name || m.attrs.property;
      if (k) meta[metaKey(k)] = m.attrs.content || '';
    });
    const title = find(head, (n) => n.tag === 'title');
    if (title) meta.title = textOf(title).trim();
  }
  const main = find(root, (n) => n.tag === 'main') || root;
  const sections = elements(main).filter((s) => s.tag === 'div').map((s) => {
    const attrs = {};
    Object.entries(s.attrs).forEach(([k, v]) => { if (k.startsWith('data-')) attrs[k.slice(5)] = v; });
    const kids = [];
    elements(s).forEach((el) => {
      if (hasClass(el, 'metadata')) {
        rowsOf(el).forEach(([k, v]) => {
          if (!k || !v) return;
          const a = find(v, (n) => n.tag === 'a');
          meta[metaKey(textOf(k))] = a ? a.attrs.href : textOf(v).trim();
        });
      } else if (hasClass(el, 'section-metadata')) {
        rowsOf(el).forEach(([k, v]) => { if (k && v) attrs[metaKey(textOf(k))] = textOf(v).trim(); });
      } else {
        kids.push(el);
      }
    });
    return { attrs, kids };
  }).filter((s) => s.kids.length);
  return { meta, sections };
}

/* -------------------------------------------------------------------------- the model */

const cellLink = (c) => (c ? find(c, (n) => n.tag === 'a') : null);
const cellText = (c) => (c ? textOf(c).trim() : '');

function imageOf(p) {
  const a = elements(p).length === 1 && elements(p)[0].tag === 'a' ? elements(p)[0] : null;
  const pic = find(p, (n) => n.tag === 'picture' || n.tag === 'img');
  if (!pic) return null;
  if (textOf(p).trim()) return null;
  const img = pic.tag === 'img' ? pic : find(pic, (n) => n.tag === 'img');
  return { kind: 'image', url: a ? a.attrs.href : (img && img.attrs.src), alt: img ? (img.attrs.alt || '') : '' };
}

function keyValues(blk) {
  const out = {};
  rowsOf(blk).forEach(([k, v]) => { if (k) out[metaKey(textOf(k))] = v; });
  return out;
}

/** The items of one section element, in document order. */
function modelOf(el, out) {
  const { tag } = el;
  if (/^h[1-6]$/.test(tag)) {
    // the screen headline (h1) is plain text on www ("Allegris & FOX"); section headlines are
    // rich text ("Specials &amp; Events")
    const level = Number(tag[1]);
    out.push({ kind: 'headline', level, html: level === 1 ? textOf(el).trim() : inlineHtml(el.children).trim() });
  } else if (tag === 'ul' || tag === 'ol') {
    out.push({ kind: 'text', html: inlineHtml([el]), small: false });
  } else if (tag === 'p') {
    const raw = textOf(el).trim();
    const sp = raw.match(/^\{spacer:\s*([a-z-]+)\s*(,\s*v2)?\s*\}$/i);
    if (sp) { out.push({ kind: 'spacer', size: SPACER_SIZES[sp[1].toLowerCase()] || sp[1].toUpperCase(), v2Only: Boolean(sp[2]) }); return; }
    const img = imageOf(el);
    if (img) { out.push(img); return; }
    const small = takeMarker(el, 'small');
    out.push({ kind: 'text', html: inlineHtml(el.children).replace(/^[ \t\n\r]+|[ \t\n\r]+$/g, ''), small });
  } else if (tag === 'div' && hasClass(el, 'app-links')) {
    rowsOf(el).forEach(([c1, c2, c3]) => {
      const a = cellLink(c1);
      if (!a) return;
      out.push({
        kind: 'link', text: textOf(a).trim(), href: a.attrs.href, label: cellText(c2), initialTitle: cellText(c3),
      });
    });
  } else if (tag === 'div' && hasClass(el, 'app-offer')) {
    const kv = keyValues(el);
    out.push({
      kind: 'offer',
      title: cellText(kv.title),
      description: cellText(kv.description),
      textLink: cellText(kv['link-text']),
      image: (cellLink(kv.image) || {}).attrs?.href || cellText(kv.image),
      href: (cellLink(kv.link) || {}).attrs?.href || cellText(kv.link),
      label: cellText(kv.tracking),
      initialTitle: cellText(kv['initial-title']),
    });
  } else if (tag === 'div' && hasClass(el, 'app-article-list')) {
    const kv = keyValues(el);
    out.push({
      kind: 'article-list',
      category: (cellLink(kv.category) || {}).attrs?.href || cellText(kv.category),
      textLink: cellText(kv['link-text']),
      label: cellText(kv.tracking),
    });
  } else if (tag === 'div' && hasClass(el, 'app-service')) {
    const kv = keyValues(el);
    out.push({
      kind: 'service',
      serviceId: cellText(kv.service),
      auxiliaryData: cellText(kv['auxiliary-data']),
      tenant: cellText(kv.tenant),
      market: cellText(kv.market),
      language: cellText(kv.language),
    });
  } else if (tag === 'div' && hasClass(el, 'app-teaser-slider')) {
    const rows = rowsOf(el);
    const title = rows.find((r) => r.length === 2 && cellText(r[0]).toLowerCase() === 'title');
    const cards = rows.filter((r) => r.length >= 4).map(([c1, c2, c3, c4]) => {
      const h = find(c1, (n) => /^h[1-6]$/.test(n.tag));
      const p = find(c1, (n) => n.tag === 'p');
      const img = imageOf({ ...c2, tag: 'p' }) || {};
      const a = cellLink(c3);
      return {
        headline: textOf(h).trim(),
        text: textOf(p).trim(),
        image: img.url,
        alt: img.alt,
        href: a ? a.attrs.href : '',
        initialTitle: a ? textOf(a).trim() : '',
        label: cellText(c4),
      };
    });
    out.push({ kind: 'teaser-slider', title: title ? cellText(title[1]) : '', cards });
  }
}

export function screenModel(doc) {
  const sections = doc.sections.map((s) => {
    const items = [];
    s.kids.forEach((el) => modelOf(el, items));
    // a section with only one image or the service slot sits directly in the screen body
    const direct = items.length > 0 && items.every((i) => i.kind === 'service' || i.kind === 'teaser-slider')
      ? true : items.length === 1 && items[0].kind === 'image';
    return { spacing: (s.attrs.spacing || 'large').toUpperCase(), direct, items };
  });
  return {
    title: doc.meta.title || '',
    container: (doc.meta['sdui-type'] || '').toLowerCase() === 'container',
    sections,
  };
}

/* ------------------------------------------------------------------------------ links */

const tracking = (key, category, action, label, metadata) => ({
  key, category, action, label, ...(metadata ? { metadata } : {}),
});
const pathOf = (href) => {
  try { return new URL(href, 'https://x.invalid').pathname.replace(/\/$/, ''); } catch (e) { return ''; }
};
const isScreen = (href) => /^\/content\/mobile\//.test(pathOf(href)) && !/\/content\/dam\//.test(href);

/** The public URL of a screen path in the version of the current screen. */
const screenUrl = (ctx, href) => {
  let suffix = '.sdui';
  if (ctx.v2) suffix = '.v2.sdui';
  else if (ctx.ios) suffix = '.ios.sdui';
  return `https://${ctx.host}${pathOf(href)}${suffix}`;
};
/** Image URLs: www's DAM paths on the public host. */
const imageUrl = (ctx, url) => {
  try {
    const u = new URL(url, `https://${ctx.host}`);
    return /^\/content\/dam\//.test(u.pathname) ? `https://${ctx.host}${u.pathname}${u.search}` : u.href;
  } catch (e) { return url; }
};
const titleOf = (ctx, href, fallback) => {
  const row = ctx.byPath.get(pathOf(href));
  return (row && row.title) || fallback || '';
};

/** A web link: as www today (externalBrowser / openUrl SELF), or the app's web view (solo). */
function webAction(ctx, href, track) {
  let url = href;
  let provider = 'externalBrowser';
  if (ctx.webLinks === 'solo') {
    const u = new URL(href);
    url = `https://${ctx.host}${u.pathname.replace(/\/$/, '')}.solo.continue${u.search}`;
    provider = 'AIR_EM';
  }
  if (ctx.v2) {
    return {
      tracking: track, type: 'openUrl', target: 'SELF', url, isDisabled: false,
    };
  }
  return {
    tracking: track, type: 'showWebScreen', providerId: provider, request: { type: 'urlRequest', url, method: { type: 'get' } }, isDisabled: false,
  };
}

function screenAction(ctx, href, initialTitle, track) {
  if (ctx.v2) {
    return {
      tracking: track, type: 'getAndShowViewDefinition', initialTitle, request: { type: 'urlRequest', method: { type: 'getMethod' }, url: screenUrl(ctx, href) }, isDisabled: false,
    };
  }
  return {
    tracking: track, type: 'getAndShowViewDefinition', initialTitle, isDisabled: false, request: { type: 'urlRequest', url: screenUrl(ctx, href), method: { type: 'get' } },
  };
}

const action = (ctx, href, initialTitle, track) => (isScreen(href)
  ? screenAction(ctx, href, initialTitle, track) : webAction(ctx, href, track));
const accessibility = (href) => (isScreen(href)
  ? { addTraits: 'BUTTON', removeTraits: 'LINK', assistType: 'COMBINE' }
  : { addTraits: 'LINK', removeTraits: 'BUTTON', assistType: 'COMBINE' });

/* ----------------------------------------------------------------------------- the lists */

/** The articles of a category from the index: newest first (date), then the order field. */
export function articlesOf(ctx, category) {
  const cat = pathOf(category);
  return ctx.index.filter((r) => pathOf(r.category) === cat && r.path !== cat)
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))
      || (Number(a.order) || 0) - (Number(b.order) || 0) || String(a.path).localeCompare(String(b.path)));
}

/* ------------------------------------------------------------------------------- render */

let idSeq = 0;
const nextId = (ctx) => { idSeq += 1; return `${ctx.path}/i${idSeq}`; };

export function itemsV1(ctx, item, container) {
  switch (item.kind) {
    case 'divider': return [{ type: 'divider' }];
    case 'headline': {
      if (item.level === 3) {
        return [{
          type: 'copyText', text: item.html, size: 'MEDIUM', variant: 'HEADLINE',
        }];
      }
      if (container) return [{ type: 'copyText', text: item.html, variant: 'HEADLINE' }];
      return [{
        type: 'copyText', text: item.html, size: 'EXTRA_LARGE', variant: 'HEADLINE',
      }];
    }
    case 'text': return [{
      type: 'copyText', text: item.html, size: item.small ? 'SMALL' : 'MEDIUM', variant: 'BODY',
    }];
    case 'image': return [{ type: 'image', url: imageUrl(ctx, item.url), ...(item.alt ? { contentDescription: item.alt } : {}) }];
    case 'spacer': return item.v2Only ? [] : [{ type: 'spacer', size: item.size }];
    case 'link': return [{
      type: 'textLink_v2',
      text: item.text,
      size: 'MEDIUM',
      action_v2: action(ctx, item.href, item.initialTitle || titleOf(ctx, item.href, item.text), tracking('link button click', 'link button', 'click', item.label)),
    }];
    case 'offer': return [{
      type: 'offerBox_v2',
      onDisplayTracking: tracking('redirect opportunity display', 'redirect opportunity', 'display', 'offer_box'),
      title: item.title,
      description: item.description,
      textLink: item.textLink,
      imageURL: imageUrl(ctx, item.image),
      imageVariant: 'IMAGE',
      imageScale: 'FILL',
      action_v2: action(ctx, item.href, item.initialTitle || titleOf(ctx, item.href, item.title), tracking('offer box click', 'offer box', 'click', item.label)),
    }];
    case 'article-list': return articlesOf(ctx, item.category).map((r) => ({
      type: 'offerBox_v2',
      title: r.headline || r.title,
      description: r.description,
      textLink: item.textLink,
      imageURL: imageUrl(ctx, r.image),
      imageVariant: 'IMAGE',
      imageScale: 'FILL',
      action_v2: screenAction(ctx, r.path, r.headline || r.title, tracking('blog overview click', 'blog overview', 'click', item.label)),
    }));
    case 'teaser-slider': {
      const first = item.cards[0];
      return [{
        type: 'teaserSlider',
        variant: 'PRIMARY',
        title: item.title,
        items: item.cards.map((c, i) => ({
          type: 'cardItem_v2',
          items: [
            { type: 'spacer', size: 'LARGE' },
            {
              type: 'paddedColumn',
              padding: {
                left: 'MEDIUM', right: 'MEDIUM', top: 'NONE', bottom: 'NONE',
              },
              items: [
                {
                  type: 'copyText', text: c.headline, maxLine: 2, size: 'MEDIUM', variant: 'HEADLINE',
                },
                { type: 'spacer', size: 'MEDIUM' },
                {
                  type: 'copyText', text: c.text, maxLine: 2, size: 'MEDIUM', variant: 'BODY',
                },
              ],
            },
            { type: 'spacer', size: 'LARGE' },
            { type: 'image', url: imageUrl(ctx, c.image), ...(c.alt ? { contentDescription: c.alt } : {}) },
          ],
          action_v2: action(ctx, c.href, c.initialTitle || titleOf(ctx, c.href, c.headline), tracking('sm teaser click', 'sm teaser', 'click', c.label, { ga_hs_order: String(i + 1) })),
        })),
        onDisplayTracking: tracking('sm teaser display', 'sm teaser', 'display', 'teaser', {
          'filter.element.elementValue': 'display',
          'filter.element.elementType': 'tile',
          'filter.element.userInput': first ? first.label : '',
          'filter.element.elementName': 'card1',
        }),
      }];
    }
    default: return [];
  }
}

export function itemsV2(ctx, item, container) {
  const id = () => nextId(ctx);
  switch (item.kind) {
    case 'divider': return [{ type: 'divider', id: id() }];
    case 'headline': {
      if (item.level === 3) {
        return [{
          type: 'copyText', id: id(), text: item.html, size: 'MEDIUM', variant: 'HEADLINE',
        }];
      }
      let variant = item.level === 1 ? 'HEADING_XL' : 'HEADING_L';
      if (container && item.level === 1) variant = 'HEADING_XXL';
      return [{
        type: 'mainHeadline', id: id(), text: item.html, variant, isBold: true,
      }];
    }
    case 'text': return [{
      type: 'copyText', id: id(), text: item.html, size: item.small ? 'SMALL' : 'MEDIUM', variant: 'BODY',
    }];
    case 'image': return [{
      type: 'image', id: id(), url: imageUrl(ctx, item.url), ...(item.alt ? { contentDescription: item.alt } : {}),
    }];
    case 'spacer': return [{ type: 'spacer', id: id(), size: item.size }];
    case 'link': return [{
      type: 'navigationLink',
      id: id(),
      text: item.text,
      size: 'MEDIUM',
      accessibility: accessibility(item.href),
      action: action(ctx, item.href, item.initialTitle || titleOf(ctx, item.href, item.text), tracking('link button click', 'link button', 'click', item.label)),
      variant: 'HYPERLINK',
    }];
    case 'offer': return [{
      type: 'offerBox',
      id: id(),
      title: item.title,
      description: item.description,
      textLink: item.textLink,
      imageURL: imageUrl(ctx, item.image),
      accessibility: accessibility(item.href),
      imageVariant: 'IMAGE',
      imageScale: 'FILL',
      action: action(ctx, item.href, item.initialTitle || titleOf(ctx, item.href, item.title), tracking('offer box click', 'offer box', 'click', item.label)),
    }];
    case 'article-list': return articlesOf(ctx, item.category).map((r, i) => ({
      type: 'offerBox',
      id: id(),
      title: r.headline || r.title,
      description: r.description,
      textLink: item.textLink,
      imageURL: imageUrl(ctx, r.image),
      accessibility: accessibility(r.path),
      imageVariant: 'IMAGE',
      imageScale: 'FILL',
      action: screenAction(ctx, r.path, r.headline || r.title, tracking('blog overview click', 'blog overview', 'click', item.label, { ga_hs_order: String(i + 1) })),
    }));
    case 'service': return [{
      type: 'sduiServiceIntegration',
      serviceId: item.serviceId,
      auxiliaryData: item.auxiliaryData,
      tenant: item.tenant,
      market: item.market,
      language: item.language,
    }];
    default: return [];
  }
}

/** Items the iOS v1 answer wraps in a padded column (runs of them). */
const IOS_COLUMN_TYPES = new Set(['copyText', 'textLink_v2', 'spacer', 'divider']);
const SMALL_SPACER = () => ({ type: 'spacer', size: 'SMALL' });

/**
 * www's iOS v1 layout: each run of consecutive copyText, text link, spacer and divider items is
 * one paddedColumn (padding LARGE left and right, MEDIUM top and bottom) with a SMALL spacer
 * between its items; two images in a row get a SMALL spacer between them; any other item ends
 * the current column.
 */
export function iosLayout(items) {
  const out = [];
  let column = null;
  items.forEach((item) => {
    if (IOS_COLUMN_TYPES.has(item.type)) {
      if (!column) {
        column = {
          type: 'paddedColumn',
          padding: {
            left: 'LARGE', right: 'LARGE', top: 'MEDIUM', bottom: 'MEDIUM',
          },
          items: [],
        };
        out.push(column);
      } else column.items.push(SMALL_SPACER());
      column.items.push(item);
      return;
    }
    column = null;
    if (item.type === 'image' && out.length && out[out.length - 1].type === 'image') out.push(SMALL_SPACER());
    out.push(item);
  });
  return out;
}

/**
 * The v1 screen: {title, type: PAGE | CONTAINER, items}. ctx.ios: the iOS layout (iosLayout;
 * a page has no LARGE spacers at its start and end, a container keeps its M_LARGE ones).
 */
export function renderV1(model, ctx) {
  const c = { ...ctx, v2: false };
  const pad = { type: 'spacer', size: model.container ? 'M_LARGE' : 'LARGE' };
  const items = model.sections.flatMap((s) => s.items.flatMap((i) => itemsV1(c, i, model.container)));
  if (ctx.ios) {
    const laid = iosLayout(items);
    return { title: model.title, type: model.container ? 'CONTAINER' : 'PAGE', items: model.container ? [pad, ...laid, pad] : laid };
  }
  return { title: model.title, type: model.container ? 'CONTAINER' : 'PAGE', items: [pad, ...items, pad] };
}

/** The v2 screen: {id, metadata: {title}, body, cacheEnabled, version: "V2"}. */
export function renderV2(model, ctx) {
  const c = { ...ctx, v2: true };
  idSeq = 0;
  const body = model.sections.flatMap((s, n) => {
    const items = s.items.flatMap((i) => itemsV2(c, i, model.container));
    if (s.direct) return items;
    return [{
      type: 'column',
      id: `${ctx.path}/s${n + 1}`,
      spacing: s.spacing,
      padding: { left: 'SPACING_FOUR', right: 'SPACING_FOUR' },
      items,
    }];
  });
  return {
    id: ctx.path,
    metadata: { title: model.title },
    body: {
      type: 'column',
      id: `${ctx.path}/body`,
      spacing: 'MEDIUM',
      ...(model.container ? { padding: { bottom: 'NONE', top: 'NONE' } } : {}),
      items: body,
    },
    cacheEnabled: true,
    version: 'V2',
  };
}

/** Index rows with normalised paths. */
export function indexRows(json) {
  return ((json && json.data) || []).map((r) => ({ ...r, path: pathOf(r.path), category: r.category ? pathOf(r.category) : '' }));
}

/**
 * Renders a screen.
 * @param {string} html the screen's page HTML (or .plain.html)
 * @param {Object} opts { path, version: 'v1' | 'v2', host, index: rows, webLinks, ios }
 */
export function renderScreen(html, opts) {
  const model = screenModel(readDocument(html));
  const ctx = {
    path: opts.path,
    host: opts.host,
    index: opts.index || [],
    byPath: new Map((opts.index || []).map((r) => [r.path, r])),
    webLinks: opts.webLinks || 'external',
    ios: Boolean(opts.ios) && opts.version !== 'v2',
  };
  return opts.version === 'v2' ? renderV2(model, ctx) : renderV1(model, ctx);
}
