/* eslint-disable max-len -- the JSON shapes of www */
/**
 * Web pages as SDUI (AMS rest, brief 78 part 2): www answers its article and content pages on
 * their full content paths, /content/lh/markets/<cc>/<ll>/<path>.sdui, .v2.sdui, .ios.sdui and
 * .nocache.v2.sdui (the markers of the app screens, src/sdui.js parseSduiPath), with the page's
 * headline, text, image, separator, teaser, accordion and article parts; other blocks are left
 * out. Homepages, multiwidth and other page types answer 404. Short URLs
 * (/<cc>/<ll>/<path>.v2.sdui) answer the page's HTML, as www does.
 *
 * The same renderer as the app screens (readDocument, the v1/v2 items, iosLayout), fed from the
 * page's .plain.html; the article index (/<cc>/<ll>/articles/query-index.json) gives an
 * article's title, date line and related articles (scripts/articles.js pickRelated, as the
 * related-articles block), the search index the title of a content page and teaser images.
 * Content pages: the generated list src/web-pages.js (www's `content` template). See ../SDUI.md.
 */
import { originFetch, publicHost } from './edge.js';
import {
  readDocument, inlineHtml, itemsV1, itemsV2, iosLayout, parseSduiPath,
} from './sdui.js';
import {
  elements, hasClass, find, findAll, textOf, isElement,
} from './html.js';
import CONTENT_PAGES from './web-pages.js';
/* eslint-disable import/no-relative-packages */
import { LOCALES } from '../../../../scripts/locale.js';
import {
  toArticle, byDate, listOf, normalizeTag, normalizeCategory, formatArticleDate, pickRelated,
} from '../../../../scripts/articles.js';
/* eslint-enable import/no-relative-packages */

const FULL = /^\/content\/lh\/markets(\/[a-z]{2}\/[a-z]{2}\/.+)$/;
export const isWebSduiPath = (pathname) => FULL.test(pathname) && Boolean(parseSduiPath(pathname));
/** The short spelling /<cc>/<ll>/<path>.sdui (any markers): answered with the page's HTML. */
export const isShortSduiPath = (pathname) => /^\/[a-z]{2}\/[a-z]{2}\/.+\.sdui$/.test(pathname) && Boolean(parseSduiPath(pathname));

const RELATED_HEADLINE = 'Related Articles'; // www's label in every locale (also de/de)
const READ_ARTICLE = { en: 'Read article', de: 'Artikel lesen' };
const MARKER = /^\{(divider|spacer)(?:-\d+)?(?:\s+[^}]*)?\}$/i;

/* ---------------------------------------------------------------------------- data */

const TTL_MS = 60000;
let cache = new Map();
/** For tests: forget the cached indexes. */
export function resetWebCache() { cache = new Map(); }

/** All rows of a query index or sheet (60 s per isolate, past the edge cache). */
async function rowsOf(request, env, sheet) {
  const hit = cache.get(sheet);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.rows;
  const rows = [];
  try {
    for (let offset = 0; offset < 20000; offset += 1000) {
      const target = new URL(`${sheet}?offset=${offset}&limit=1000`, `https://${env.ORIGIN}`);
      // eslint-disable-next-line no-await-in-loop
      const resp = await originFetch(new Request(request.url, { headers: request.headers }), env, target, { edgeCache: false });
      if (!resp.ok) break;
      // eslint-disable-next-line no-await-in-loop
      const json = await resp.json();
      const data = Array.isArray(json.data) ? json.data : [];
      rows.push(...data);
      if (data.length < 1000 || rows.length >= (json.total ?? 0)) break;
    }
  } catch (e) {
    // no index: no rows
  }
  cache.set(sheet, { at: Date.now(), rows });
  return rows;
}

/* --------------------------------------------------------------------------- model */

const withMarkets = (href) => `/content/lh/markets${href}`;

/** A text link as www writes it in SDUI text: hreftemp (the content path), href, an arrow icon. */
export function wwwLink(a, inner) {
  const href = String(a.attrs.href || '').replace(/^https:\/\/(main--lh-com--moved-permanently\.aem\.(page|live)|lhcom\.bbird\.live)(?=\/)/, '');
  const temp = /^\/[a-z]{2}\/[a-z]{2}(\/|$)/.test(href) ? ` hreftemp="${withMarkets(href)}"` : '';
  return `<a${temp} href="${href}" linkscheme="Hyperlink"><em class="lh lh-arrow-right">\u200b</em>${inner}</a>`;
}

const textHtml = (el) => inlineHtml(el.children, { link: wwwLink }).replace(/^[ \t\n\r]+|[ \t\n\r]+$/g, '');

/** The image of a paragraph (a picture, not inside a link), host-relative at 1440 px wide. */
function imageItem(el, page) {
  if (find(el, (n) => n.tag === 'a')) return null;
  const img = find(el, (n) => n.tag === 'img');
  if (!img || textOf(el).trim()) return null;
  const src = String(img.attrs.src || '');
  let url = src;
  const m = src.match(/^\.?\/?(media_[0-9a-f]+\.(\w+))/);
  if (m) {
    const ext = m[2] === 'jpeg' ? 'jpg' : m[2];
    url = `${page.replace(/\/[^/]*$/, '')}/${m[1]}?width=1440&format=${ext === 'png' ? 'png' : 'jpg'}&optimize=medium`;
  }
  return { kind: 'image', url, alt: img.attrs.alt || '' };
}

/** A paragraph that is only a link (a button on the page): not a text part on www. */
const linkOnly = (el) => {
  const kids = el.children.filter((c) => isElement(c) || c.text.trim());
  const one = kids.length === 1 && isElement(kids[0]) ? kids[0] : null;
  if (!one) return false;
  if (one.tag === 'a') return true;
  return ['strong', 'em', 'b', 'i'].includes(one.tag) && elements(one).length === 1 && elements(one)[0].tag === 'a' && !one.children.some((c) => !isElement(c) && c.text.trim());
};

/** The items of one default-content element (headline, text, image, separator). */
function contentItems(el, page, out) {
  const { tag } = el;
  if (/^h[1-6]$/.test(tag)) {
    const level = Number(tag[1]);
    const html = level === 1 ? textOf(el).trim() : inlineHtml(el.children).replace(/\s*\{[a-z-]+\}\s*$/, '').trim();
    out.push({ kind: 'headline', level: level === 1 ? 1 : 3, html });
  } else if (tag === 'ul' || tag === 'ol') {
    out.push({ kind: 'text', html: inlineHtml([el], { link: wwwLink }), small: false });
  } else if (tag === 'p') {
    const raw = textOf(el).trim();
    const marker = raw.match(MARKER);
    if (marker) {
      out.push(marker[1].toLowerCase() === 'divider' ? { kind: 'divider' } : { kind: 'web-spacer' });
      return;
    }
    if (/\{caption\}\s*$/.test(raw)) return; // image captions: not a part on www
    const img = imageItem(el, page);
    if (img) { out.push(img); return; }
    if (!raw || linkOnly(el)) return;
    out.push({ kind: 'text', html: textHtml(el), small: false });
  }
}

/** Teaser cards (cards-teaser): title, text, link, image. Shape not recorded on www: offer boxes. */
function teaserItems(blk) {
  return elements(blk).map((row) => {
    const cells = elements(row);
    const img = find(row, (n) => n.tag === 'img');
    const h = find(row, (n) => /^h[1-6]$/.test(n.tag));
    const a = findAll(row, (n) => n.tag === 'a').pop();
    const p = find(cells[cells.length - 1] || row, (n) => n.tag === 'p' && !find(n, (x) => x.tag === 'a'));
    return {
      kind: 'teaser', title: h ? textOf(h).trim() : '', description: p ? textOf(p).trim() : '', href: a ? a.attrs.href : '', textLink: a ? textOf(a).trim() : '', image: img ? img.attrs.src : '',
    };
  }).filter((t) => t.title || t.href);
}

/** Accordion items (accordion-columns): the title as a headline, the content as text. Shape not recorded on www. */
function accordionItems(blk, page) {
  const out = [];
  elements(blk).forEach((row) => {
    const [title, body] = elements(row);
    if (title && textOf(title).trim()) out.push({ kind: 'headline', level: 3, html: `<b>${inlineHtml(title.children).trim()}</b>` });
    if (body) elements(body).forEach((el) => contentItems(el, page, out));
  });
  return out;
}

/**
 * The page model: {hero, header: [items], body: [items], related: bool}. An article's header
 * comes from its article-header block (image, h1, intro) and the index (the date line).
 */
export function webModel(html, page, { article } = {}) {
  const doc = readDocument(html);
  const model = {
    hero: null, header: [], body: [], related: false,
  };
  doc.sections.forEach((s) => s.kids.forEach((el) => {
    if (el.tag === 'div' && hasClass(el, 'article-header')) {
      const rows = elements(el).map((r) => elements(r)[0]).filter(Boolean);
      const imgCell = rows.find((c) => find(c, (n) => n.tag === 'img'));
      const img = imgCell && find(imgCell, (n) => n.tag === 'img');
      if (img) model.hero = imageItem({ tag: 'p', children: [img], attrs: {} }, page);
      const textCell = rows.find((c) => find(c, (n) => /^h[1-6]$/.test(n.tag)));
      if (textCell) {
        elements(textCell).forEach((x) => contentItems(x, page, model.header));
        if (article) {
          const info = [formatArticleDate(article.date, article.locale), article.readingTime, article.author].filter(Boolean).join(' | ');
          const h = model.header.findIndex((i) => i.kind === 'headline');
          if (info) model.header.splice(h + 1, 0, { kind: 'text', html: `<b>${info}</b>`, small: true });
        }
      }
    } else if (el.tag === 'div' && hasClass(el, 'related-articles')) {
      model.related = true;
    } else if (el.tag === 'div' && hasClass(el, 'cards-teaser')) {
      model.body.push(...teaserItems(el));
    } else if (el.tag === 'div' && hasClass(el, 'accordion-columns')) {
      model.body.push(...accordionItems(el, page));
    } else if (el.tag !== 'div') {
      contentItems(el, page, model.body);
    }
  }));
  return model;
}

/* -------------------------------------------------------------------------- render */

const lhId = (path) => {
  const m = path.match(/^\/[a-z]{2}\/([a-z]{2})\/articles\/([^/]+)\/([^/]+)$/);
  return m ? `/lh/${m[1]}/${m[2]}/${m[3]}` : path;
};
const suffixOf = (ctx) => {
  if (ctx.v2) return '.v2.sdui';
  return ctx.ios ? '.ios.sdui' : '.sdui';
};

function relatedV1(ctx, r) {
  return {
    type: 'offerBox_v2',
    title: r.title,
    description: r.description,
    textLink: ctx.readArticle,
    imageURL: r.image,
    imageVariant: 'IMAGE',
    imageScale: 'FILL',
    action_v2: {
      tracking: {
        key: 'related article click', category: 'related article', action: 'click', label: 'article',
      },
      type: 'getAndShowViewDefinition',
      initialTitle: r.title,
      request: { type: 'urlRequest', method: { type: 'get' }, url: `https://${ctx.host}${r.path}${suffixOf(ctx)}` },
      isDisabled: false,
    },
  };
}

function relatedV2(ctx, r) {
  return {
    type: 'offerBox',
    title: r.title,
    description: r.description,
    textLink: ctx.readArticle,
    imageURL: r.image,
    accessibility: { addTraits: 'BUTTON', removeTraits: 'LINK', assistType: 'COMBINE' },
    imageVariant: 'IMAGE',
    imageScale: 'FILL',
    action: {
      tracking: {
        key: 'related article click', category: 'related article', action: 'click', label: lhId(r.path),
      },
      type: 'getAndShowViewDefinition',
      initialTitle: r.title,
      request: { type: 'urlRequest', method: { type: 'getMethod' }, url: `https://${ctx.host}${r.path}.v2.sdui` },
      isDisabled: false,
    },
    id: lhId(r.path),
  };
}

const teaserAsOffer = (ctx, t) => ({
  kind: 'offer', title: t.title, description: t.description, textLink: t.textLink, image: t.image, href: t.href, label: 'teaser',
});

function webItemsV1(ctx, item) {
  if (item.kind === 'web-spacer') return [{ type: 'spacer', size: 'MEDIUM' }];
  if (item.kind === 'teaser') return itemsV1(ctx, teaserAsOffer(ctx, item));
  return itemsV1(ctx, item, false);
}

function webItemsV2(ctx, item) {
  if (item.kind === 'web-spacer') return [{ type: 'spacer', size: 'FULL', id: `${ctx.path}/spacer` }];
  if (item.kind === 'teaser') return itemsV2(ctx, teaserAsOffer(ctx, item));
  return itemsV2(ctx, item, false);
}

/**
 * Renders a web page. opts: {fullPath, page, version 'v1'|'v2', ios, host, title, related: rows}.
 */
export function renderWeb(model, opts) {
  const ctx = {
    path: opts.fullPath, host: opts.host, index: [], byPath: new Map(), webLinks: 'external', v2: opts.version === 'v2', ios: Boolean(opts.ios) && opts.version !== 'v2', readArticle: READ_ARTICLE[opts.lang] || READ_ARTICLE.en,
  };
  const related = model.related ? (opts.related || []) : [];
  if (ctx.v2) {
    const head = model.header.flatMap((i) => webItemsV2(ctx, i));
    if (opts.article && head.length) head.push({ type: 'spacer', size: 'MEDIUM', id: `${lhId(opts.page)}_separator` });
    const content = [...head, ...model.body.flatMap((i) => webItemsV2(ctx, i))];
    const relatedItems = related.length ? [{
      type: 'mainHeadline', text: RELATED_HEADLINE, variant: 'HEADING_L', id: `${opts.fullPath}/jcr:content/par/relatedarticles`, isBold: true,
    }, ...related.map((r) => relatedV2(ctx, r))] : [];
    const body = opts.article
      ? {
        type: 'column',
        id: `${opts.fullPath}/col`,
        spacing: 'MEDIUM',
        items: [
          ...(model.hero ? itemsV2(ctx, model.hero) : []),
          {
            type: 'column', id: lhId(opts.page), padding: { left: 'SPACING_FOUR', right: 'SPACING_FOUR' }, spacing: 'MEDIUM', items: content,
          },
          ...relatedItems,
        ],
      }
      : {
        type: 'column', id: `${opts.fullPath}/par`, items: [...(model.hero ? itemsV2(ctx, model.hero) : []), ...content, ...relatedItems], spacing: 'MEDIUM',
      };
    return {
      id: opts.fullPath, metadata: { title: opts.title }, body, cacheEnabled: true, version: 'V2',
    };
  }
  const items = [
    ...(model.hero ? itemsV1(ctx, model.hero) : []),
    ...model.header.flatMap((i) => webItemsV1(ctx, i)),
    ...model.body.flatMap((i) => webItemsV1(ctx, i)),
    ...(related.length ? [{
      type: 'copyText', text: RELATED_HEADLINE, size: 'LARGE', variant: 'HEADLINE',
    }, ...related.map((r) => relatedV1(ctx, r))] : []),
  ];
  const pad = { type: 'spacer', size: 'LARGE' };
  return { title: opts.title, type: 'PAGE', items: ctx.ios ? iosLayout(items) : [pad, ...items, pad] };
}

/* --------------------------------------------------------------------------- route */

const json = (body, status, cacheControl) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'content-type': 'application/json',
    ...(cacheControl ? { 'cache-control': cacheControl } : {}),
    'x-lh-edge-route': 'sdui-web',
  },
});

/** The related articles of an article page, as the related-articles block picks them. */
async function relatedOf(request, env, locKey, row, articles) {
  const prioRows = await rowsOf(request, env, '/articles/config/tag-priority.json');
  const prio = prioRows.find((r) => String(r.locale || '').trim() === locKey) || {};
  const priority = { p1: new Set(listOf(prio['priority-1']).map(normalizeTag)), p2: new Set(listOf(prio['priority-2']).map(normalizeTag)) };
  const picks = pickRelated(articles, {
    tagIds: row.tagIds, category: normalizeCategory(row.category), exclude: new Set([row.path]),
  }, priority, 3);
  const search = new Map((await rowsOf(request, env, `/${locKey}/search-index.json`)).map((r) => [r.path, r]));
  return picks.map((a) => ({
    path: a.path, title: a.title, description: a.description, image: a.image || (search.get(a.path) || {}).image || '',
  }));
}

export async function sduiWeb(request, env) {
  const url = new URL(request.url);
  const spelling = parseSduiPath(url.pathname);
  const m = spelling && spelling.path.match(FULL);
  if (!m) return json({ error: 'not-found' }, 404, 'no-store');
  const fullPath = spelling.path;
  const page = m[1].replace(/\.html$/, '');
  const locKey = page.split('/').slice(1, 3).join('/');
  const locale = LOCALES[locKey];
  if (!locale) return json({ error: 'not-found' }, 404, 'no-store');

  const articleRows = await rowsOf(request, env, `/${locKey}/articles/query-index.json`);
  const articles = articleRows.filter((r) => String(r['page-type'] || '').trim() === 'article' && r.path).map(toArticle).sort(byDate);
  const article = articles.find((a) => a.path === page);
  if (!article && !CONTENT_PAGES.has(page)) return json({ error: 'not-found' }, 404, 'no-store');

  const plain = await originFetch(new Request(request.url, { headers: request.headers }), env, new URL(`${page}.plain.html`, `https://${env.ORIGIN}`));
  if (plain.status !== 200) return json({ error: 'not-found' }, 404, 'no-store');
  const html = await plain.text();

  let title = article ? article.title : '';
  if (!title) {
    const row = (await rowsOf(request, env, `/${locKey}/search-index.json`)).find((r) => r.path === page);
    title = String((row && row.title) || '').replace(/\s*\|\s*Lufthansa\s*$/, '').trim();
  }
  const model = webModel(html, page, { article: article && { ...article, locale } });
  if (!title) title = ((model.header.find((i) => i.kind === 'headline') || model.body.find((i) => i.kind === 'headline')) || {}).html || '';
  const related = article && model.related ? await relatedOf(request, env, locKey, article, articles) : [];
  const body = renderWeb(model, {
    fullPath, page, version: spelling.v2 ? 'v2' : 'v1', ios: spelling.ios, host: publicHost(request, env), title, related, article: Boolean(article), lang: locale.lang,
  });
  return json(body, 200, spelling.nocache ? 'max-age=600' : null);
}

/** Short spellings: the page's HTML, as www answers them. */
export async function shortSdui(request, env) {
  const url = new URL(request.url);
  const spelling = parseSduiPath(url.pathname);
  const resp = await originFetch(request, env, new URL(`${spelling.path}${url.search}`, `https://${env.ORIGIN}`));
  resp.headers.set('x-lh-edge-route', 'sdui-web-short');
  return resp;
}
