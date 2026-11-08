/* eslint-disable max-len, no-bitwise, no-continue, no-restricted-syntax, no-use-before-define, prefer-destructuring -- dev tooling */
// Normaliser for www pages served by Lufthansa Group's AEM (www.lufthansa.com, www.swiss.com, www.austrian.com,
// www.brusselsairlines.com, www.discover-airlines.com, www.ita-airways.com, business.lufthansagroup.com).
// Input: the page HTML as the server sends it (no JavaScript run). Output: the page's content as a token list
// (document order), so two pages of different market roots compare equal when only the root differs.
//
// Content area: the parent of <h2 id="main"> (the dcep page wrapper) without skip links, sticky header, header and
// footer; pages without that marker: <body> without header, footer and nav. Scripts, styles, inline SVG drawings,
// templates and iframes' inner markup are left out (iframe src counts).
// Tokens: '<tag.class>' per element, '"text"' per text run, '@attr=value' per attribute that carries content (href,
// src, alt, title, labels ...). data-* attributes go to a separate config list (widget configuration). ids, for,
// aria-* references, styles, sizes and loading hints are left out: they hold per-render random numbers.
// Values: the page's own root becomes {R} (/ch/en/... , /content/<tree>/markets/ch/en/...), UUIDs {uuid}, id-like
// number tails {n}, zero-width characters and whitespace runs collapse.
import { parseHTML } from 'linkedom';

const DROP_TAGS = new Set(['script', 'style', 'noscript', 'template', 'link', 'meta']);
const DROP_ATTRS = new Set(['id', 'for', 'style', 'tabindex', 'nonce', 'integrity', 'crossorigin', 'loading', 'decoding',
  'fetchpriority', 'width', 'height', 'aria-controls', 'aria-labelledby', 'aria-describedby', 'aria-owns',
  'aria-activedescendant', 'aria-hidden', 'xmlns', 'xmlns:xlink', 'class', 'sizes', 'hreftemp', 'data-sly-test']);
const ZW = /[\u200b-\u200d\u2060\ufeff\u00ad]/g;
// attributes a visitor reads (md-compare.mjs's visible tier); every other attribute counts as markup there
export const VISIBLE_ATTR = /^@(alt|title|aria-label|placeholder|value|label|summary|abbr)=/;
const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

/**
 * A value normaliser for one page: its own root (cc/ll) becomes {R}; any root when anyRoot (to tell "links into
 * another market" from real differences). rootRe: the site's root pattern in paths (default /<cc>/<ll>).
 */
export function valueNormaliser(root, { anyRoot = false, rootStyle = 'cc/ll', host = '' } = {}) {
  const [a, b] = root.split(/[/-]/);
  // rootStyle cc/ll: root 'ch/en' -> cc ch, ll en; ll-cc (TAP): root 'en-us' -> ll en, cc us
  const [cc, ll] = rootStyle === 'll-cc' ? [b, a] : [a, b];
  const seg = rootStyle === 'll-cc' ? '[a-z]{2}-[a-z]{2}' : '[a-z]{2}/[a-z]{2}';
  const end = '(?=/|$|[?#"\'&\\s.,;)])';
  // a root counts only as the first segment of a path: after /content/<tree>/markets, a host, the start or a delimiter
  // (so /content/dam/.../ch/en/x.jpg keeps its market folder)
  const longRe = (r) => new RegExp(`/content/[a-zA-Z0-9_]+/markets/${r}${end}`, 'g');
  // only the page's own host: a link to another airline's /de/en (www.brusselsairlines.com/de/en/...) stays as it is
  const hostAlt = host ? `|https?://${escRe(host)}` : '';
  const shortRe = (r) => new RegExp(`(^|[\\s"'(=,;]${hostAlt})/${r}${end}`, 'g');
  const ownLong = longRe(escRe(root));
  const ownShort = shortRe(escRe(root));
  const anyLong = longRe(seg);
  const anyShort = shortRe(seg);
  const qRe = /([?&](?:country|countrycode|market|pos|lang|language|locale|site)=)([a-z]{2}(?:[-_][a-z]{2})?)(?=&|#|$|")/gi;
  // the root's locale in attribute values (custom-locale="en-ch", lang codes de_CH): {locale}
  const locale = new RegExp(`\\b(${ll}[-_]${cc}|${cc}[-_]${ll})\\b`, 'gi');
  const fn = (v) => {
    let s = String(v).replace(ZW, '').replace(/\s+/g, ' ').trim();
    s = s.replace(ownLong, '/content/~/markets/{R}').replace(ownShort, '$1/{R}');
    if (anyRoot) s = s.replace(anyLong, '/content/~/markets/{R}').replace(anyShort, '$1/{R}');
    s = s.replace(qRe, (m, k, val) => {
      const low = val.toLowerCase();
      return (low === cc || low === ll || low === `${ll}-${cc}` || low === `${ll}_${cc}` || anyRoot) ? `${k}{m}` : m;
    });
    // Cloudflare's e-mail obfuscation (a new key on every response): the address itself
    s = s.replace(/\/cdn-cgi\/l\/email-protection#([0-9a-f]+)/gi, (m, hex) => `mailto:${cfEmail(hex)}`);
    return s.replace(UUID, '{uuid}');
  };
  fn.locale = locale;
  fn.codes = [cc, ll, `${ll}-${cc}`, `${ll}_${cc}`, `${cc}-${ll}`, `${cc}/${ll}`];
  return fn;
}

/** Cloudflare's obfuscated e-mail (first byte the key, the rest XOR key). */
export function cfEmail(hex) {
  const bytes = hex.match(/../g).map((h) => parseInt(h, 16));
  return String.fromCharCode(...bytes.slice(1).map((b) => b ^ bytes[0]));
}

// a picture's value: src, srcset, data-src, data-srcset, poster, a widget's imageUrl (brief 496)
const PICTURE_ATTRS = new Set(['src', 'srcset', 'data-src', 'data-srcset', 'poster']);
const PICTURE_KEYS = /^imageUrl$/i;
const PICTURE_FILE = /\.(?:jpe?g|png|gif|webp|avif|svg)(?=$|[?#]|\.transform\/)/i;
// www's renditions: <the DAM file>.transform/<rendition>/img.jpg
const TRANSFORM = /(\.(?:jpe?g|png|gif|webp|avif|svg))\.transform\/[^?#]*/i;

/**
 * A picture by its DAM file: the path before www's .transform/ tail (never the tail's img.jpg), the rendition and
 * query left out, its numbers as they are (c-1026695176-4252991.jpg names the picture; brief 496); else null.
 */
export function pictureFile(s) {
  if (!PICTURE_FILE.test(s)) return null;
  return s.replace(TRANSFORM, '$1').replace(/[?#].*$/, '');
}

const attrValue = (name, v, norm, key = '') => {
  let s = norm(v);
  // the root's locale only where an attribute names a locale (custom-locale="en-ch"), not in links
  if (norm.locale && /locale|^lang$|hreflang/.test(name)) s = s.replace(norm.locale, '{locale}');
  if (name === 'srcset' || name === 'data-srcset') s = s.split(',')[0].trim().split(' ')[0];
  // pictures by their DAM file, unmasked
  if (PICTURE_ATTRS.has(name) || PICTURE_KEYS.test(key)) {
    const file = pictureFile(s);
    if (file) return file;
  }
  // number tails of generated ids in any attribute that points at an element (form-text-519644935, #accordion_123456)
  s = s.replace(/([-_])-?\d{5,}\b/g, '$1{n}').replace(/^#[\w-]*\d{5,}$/, '#{id}');
  return s;
};

// data-* attributes that only carry tracking or per-render ids
const NOISE_DATA = /track|analytic|tealium|gtm|uniqueid|random|identifier|technicalname|emptytext|prerendered|testid|^data-(bs-)?(target|parent)$|^data-cmp-|^data-sly/;
// widget JSON keys whose values are lists the widget selects at render time (related articles), not authored per page
const DYNAMIC_KEYS = /^(relatedArticlesData)$/;
// keys of widget JSON whose values are the market itself (or a per-render id): masked before comparing
const MARKET_KEYS = /^(site|country|countrycode|market|marketcode|pos|lang|language|locale|languagecode|portalsite|tenantsite)$/i;
const ID_KEYS = /^(id|uuid|uniqueid|componentid|instanceid|teaserid)$/i;

/** A data-* value: JSON with the market's own codes and per-render ids masked, keys sorted; else the plain value. */
function configValue(name, v, norm) {
  const plain = attrValue(name, v, norm);
  let j;
  try { j = JSON.parse(v); } catch (e) { return plain; }
  if (!j || typeof j !== 'object') return plain;
  const codes = norm.codes || [];
  const walk = (o, key = '') => {
    if (Array.isArray(o)) return o.map((x) => walk(x, key));
    if (o && typeof o === 'object') {
      return Object.fromEntries(Object.keys(o).sort().map((k) => {
        const val = o[k];
        if (DYNAMIC_KEYS.test(k)) return [k, '{dynamic}'];
        if (ID_KEYS.test(k) && typeof val !== 'object') return [k, '{id}'];
        if (MARKET_KEYS.test(k) && typeof val === 'string' && codes.includes(val.toLowerCase())) return [k, '{m}'];
        return [k, walk(val, k)];
      }));
    }
    return typeof o === 'string' ? attrValue(name, o, norm, key) : o;
  };
  return JSON.stringify(walk(j));
}

/**
 * A text that is only a date, in a form that does not depend on the market's date format ("April 28, 2026",
 * "28. April 2026" and "28 April 2026" -> {date:2026-28-april}); else null.
 */
export function dateKey(t) {
  if (t.length > 40 || !/\b(19|20)\d{2}\b/.test(t)) return null;
  const parts = t.toLowerCase().split(/[\s.,/-]+/).filter(Boolean);
  if (parts.length < 2 || parts.length > 6) return null;
  const year = parts.filter((p) => /^(19|20)\d{2}$/.test(p));
  const nums = parts.filter((p) => /^\d{1,2}$/.test(p));
  const words = parts.filter((p) => /^\p{L}+$/u.test(p) && !['de', 'del', 'di', 'le', 'el', 'am'].includes(p));
  if (year.length !== 1 || parts.length !== year.length + nums.length + words.length + parts.filter((p) => ['de', 'del', 'di', 'le', 'el', 'am'].includes(p)).length) return null;
  if (nums.length === 2 && !words.length) return `{date:${year[0]}-${nums.map(Number).sort((x, y) => x - y).join('-')}}`;
  if (nums.length === 1 && words.length === 1) return `{date:${year[0]}-${Number(nums[0])}-${words[0]}}`;
  return null;
}

/** The content area of a page and its head facts. */
export function parsePage(html) {
  const { document } = parseHTML(html);
  const meta = (n) => document.querySelector(`meta[name="${n}"]`)?.getAttribute('content') || '';
  const head = {
    title: (document.querySelector('title')?.textContent || '').replace(/\s+/g, ' ').trim(),
    description: meta('description').replace(/\s+/g, ' ').trim(),
    robots: meta('robots'),
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
    lang: document.documentElement.getAttribute('lang') || '',
  };
  const mainMarker = document.querySelector('h2#main') || document.querySelector('#main');
  let area = mainMarker ? mainMarker.parentElement : document.body;
  if (!area) area = document.documentElement;
  const drop = [...area.querySelectorAll('header, footer, .skiplinks, .sticky-header-placeholder, h2#main, #onetrust-consent-sdk, [id^="onetrust"]')];
  if (!mainMarker) drop.push(...area.querySelectorAll('nav'));
  drop.forEach((e) => e.remove());
  return { head, area, marker: Boolean(mainMarker) };
}

/** Tokens of the content area: content (text, elements, content attributes) and config (data-* attributes). */
export function tokens(area, norm) {
  const content = [];
  const config = [];
  const walk = (node) => {
    for (const n of node.childNodes) {
      if (n.nodeType === 3) {
        const t = norm(n.textContent);
        if (t) content.push(`"${dateKey(t) || t}"`);
        continue;
      }
      if (n.nodeType !== 1) continue;
      const tag = n.tagName.toLowerCase();
      if (DROP_TAGS.has(tag)) continue;
      const cls = (n.getAttribute('class') || '').split(/\s+/).filter(Boolean).map((c) => c.replace(/\d{4,}/g, '#')).join('.');
      content.push(`<${tag}${cls ? `.${cls}` : ''}>`);
      for (const a of n.attributes) {
        const name = a.name.toLowerCase();
        if (DROP_ATTRS.has(name)) continue;
        if (name === 'data-cfemail') { content.push(`"${cfEmail(a.value)}"`); continue; }
        if (name.startsWith('data-')) {
          if (!NOISE_DATA.test(name)) config.push(`@${name}=${configValue(name, a.value, norm)}`);
          continue;
        }
        content.push(`@${name}=${attrValue(name, a.value, norm)}`);
      }
      if (tag === 'svg') {
        // icons: keep only what they reference (<use href="#icon-...">), not their drawing
        n.querySelectorAll('use').forEach((u) => content.push(`@use=${u.getAttribute('href') || u.getAttribute('xlink:href') || ''}`));
        continue;
      }
      if (tag === 'iframe') continue;
      walk(n);
    }
  };
  walk(area);
  return { content, config };
}

/** Everything the comparison needs from one page. */
export function pageFacts(html, root, opts = {}) {
  const { head, area, marker } = parsePage(html);
  const norm = valueNormaliser(root, opts);
  const normAny = valueNormaliser(root, { ...opts, anyRoot: true });
  const t = tokens(area, norm);
  const tAny = tokens(area, normAny);
  return {
    marker,
    title: norm(head.title),
    description: norm(head.description),
    robots: head.robots,
    lang: head.lang,
    content: t.content,
    config: t.config,
    contentAny: tAny.content,
    configAny: tAny.config,
  };
}
