/* eslint-disable import/extensions, max-len -- dev tooling */
// Normaliser for www.flytap.com (Next.js on TAP's AEM): the page's content is the `page` object of
// <script id="__NEXT_DATA__"> (props.pageProps.page, the PageModel with its sections and components, after www applied its
// market rules on the server). Site-wide parts of pageProps (alerts, header and footer menus, the rule list itself, labels)
// are not the page's. Left out of `page`: hrefLangs (the alternates list, ordered around the current root), the variation
// names (_variation, _variations: which variation www picked shows in the content itself) and model metadata (_model).
// Tokens: 'key=value' per leaf, in document order; the page's own root (<ll>-<cc>) becomes {R}.
import { parseHTML } from 'linkedom';
import { valueNormaliser } from './aem-html.mjs';

// keys whose string values are what a visitor reads (rich text 'value', titles, labels, alt texts)
const PROSE_KEY = /^(value|title|subtitle|text|label|description|alt|caption|heading|headline|content|name|plaintext|question|answer|items|tooltip|rowTitles|category)$|(Title|Text|Description|Label|Heading|Caption|Alt|Titles)$/;
// fields that only shape the rendering (rich-text node types, style variants, sizes, link rel/target, layout switches):
// md-compare.mjs's visible tier leaves them out (a different rich-text structure around the same words is markup)
export const VISIBLE_ATTR = /^@(?!(href|src|nodeType|__typename|variants|width|height|rel|target|class|switchImageToRight|displayType|containerSize|textAlign|textSize|showBorderAtBottom|infoType|dismissable|id|lang)=)/;
const DROP_KEYS = new Set(['hrefLangs', '_variation', '_variations', '_model', '_metadata', 'lastModified', 'modified', 'created']);

export function pageFacts(html, root, opts = {}) {
  const m = html.match(/<script id="__NEXT_DATA__" type="application\/json"[^>]*>([\s\S]*?)<\/script>/);
  const { document } = parseHTML(html.replace(/<script[\s\S]*?<\/script>/g, ''));
  const head = {
    title: (document.querySelector('title')?.textContent || '').replace(/\s+/g, ' ').trim(),
    description: (document.querySelector('meta[name="description"]')?.getAttribute('content') || '').replace(/\s+/g, ' ').trim(),
  };
  const norm = valueNormaliser(root, { ...opts, rootStyle: 'll-cc' });
  const normAny = valueNormaliser(root, { ...opts, rootStyle: 'll-cc', anyRoot: true });
  let page = null;
  try { page = JSON.parse(m[1]).props.pageProps.page; } catch (e) { /* no Next.js data */ }
  const tokens = (nrm) => {
    const out = [];
    const walk = (o, key) => {
      if (Array.isArray(o)) { o.forEach((v) => walk(v, key)); return; }
      if (o && typeof o === 'object') {
        Object.entries(o).forEach(([k, v]) => { if (!DROP_KEYS.has(k)) walk(v, k); });
        return;
      }
      if (o === null || o === '' || o === undefined) return;
      const v = typeof o === 'string' ? nrm(o) : String(o);
      // shaped like aem-html's tokens so the diff summary reads alike: prose as text, links, media, other fields
      if (/(url|href|link|path)$/i.test(key) && /^(\/|https?:)/.test(v) && !/\.(jpe?g|png|webp|gif|svg|avif)(\?|$)/i.test(v)) out.push(`@href=${v}`);
      else if (/\.(jpe?g|png|webp|gif|svg|avif|mp4)(\?|$)/i.test(v) || /dm-aid--/.test(v)) out.push(`@src=${v}`);
      else if (typeof o === 'string' && PROSE_KEY.test(key)) out.push(`"${v}"`);
      else out.push(`@${key}=${v}`);
    };
    walk(page, 'page');
    return out;
  };
  return {
    marker: Boolean(page),
    title: norm(head.title),
    description: norm(head.description),
    content: page ? tokens(norm) : [`"${norm(document.body?.textContent || '')}"`],
    config: [],
    contentAny: page ? tokens(normAny) : [],
    configAny: [],
  };
}
