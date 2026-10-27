/**
 * www's offline page list (brief 80 part 4):
 * GET /content/lh/markets/<cc>/<ll>/<page>.csi-offline.json answers
 * {"targetPage": "<page URL>", "resources": [<the style, script, design-system and image URLs the
 * page uses>]} with `Cache-Control: no-cache, no-store, must-revalidate`, on full content paths
 * only; the short form /<cc>/<ll>/<page>.csi-offline.json answers 404 (as www).
 *
 * The replica's page HTML (from the origin) gives the resources, root-relative and deduplicated,
 * in this order: the head's scripts, stylesheets, manifest and icons; the stylesheets the site's
 * scripts always load (fonts, lazy styles); the header and footer blocks; the code of each block
 * on the page (/blocks/<name>/<name>.js and .css, as Edge Delivery loads them); the images of the
 * page (img src and the first URL of each source srcset). Unknown page: 404.
 */
import { originFetch, publicHost } from './edge.js';
import {
  parseHtml, find, findAll, elements,
} from './html.js';

const FULL = /^\/content\/lh\/markets(\/[a-z]{2}\/[a-z]{2}\/.+)\.csi-offline\.json$/;
const SHORT = /^\/[a-z]{2}\/[a-z]{2}\/.+\.csi-offline\.json$/;
export const isOfflinePath = (pathname) => FULL.test(pathname) || SHORT.test(pathname);

// loaded by scripts/scripts.js on every page (loadFonts, loadLazy) and the header and footer blocks
const ALWAYS = ['/styles/fonts.css', '/styles/lazy-styles.css', '/blocks/header/header.js', '/blocks/header/header.css', '/blocks/footer/footer.js', '/blocks/footer/footer.css'];
// section-level classes that are no blocks
const NOT_BLOCKS = new Set(['section', 'default-content-wrapper', 'block']);

const NO_CACHE = 'no-cache, no-store, must-revalidate';
const json = (status, body) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'content-type': 'application/json', 'cache-control': NO_CACHE, 'x-lh-edge-route': 'csi-offline',
  },
});

/** A URL of the page as a root-relative path (site hosts dropped; other hosts kept as they are). */
function sitePath(value, page, host) {
  const v = String(value || '').trim();
  if (!v || v.startsWith('data:') || v.startsWith('#')) return '';
  try {
    const u = new URL(v, `https://${host}${page}`);
    if (u.host === host || /^main--lh-com--moved-permanently\.aem\.(page|live)$/.test(u.hostname)) return `${u.pathname}${u.search}`;
    return u.href;
  } catch (e) {
    return '';
  }
}

/** The resources of a page HTML, in the order described above. */
export function offlineResources(html, page, host) {
  const root = parseHtml(html);
  const head = find(root, (n) => n.tag === 'head') || root;
  const main = find(root, (n) => n.tag === 'main');
  const out = [];
  const add = (v) => { if (v && !out.includes(v)) out.push(v); };
  findAll(head, (n) => n.tag === 'script' && n.attrs.src).forEach((s) => add(sitePath(s.attrs.src, page, host)));
  findAll(head, (n) => n.tag === 'link' && /(^|\s)(stylesheet|manifest|icon|shortcut|apple-touch-icon)(\s|$)/i.test(n.attrs.rel || '') && n.attrs.href)
    .forEach((l) => add(sitePath(l.attrs.href, page, host)));
  ALWAYS.forEach(add);
  if (main) {
    elements(main).forEach((section) => elements(section).forEach((el) => {
      const name = String(el.attrs.class || '').split(/\s+/)[0];
      if (el.tag === 'div' && name && !NOT_BLOCKS.has(name) && /^[a-z][a-z0-9-]*$/.test(name)) {
        add(`/blocks/${name}/${name}.js`);
        add(`/blocks/${name}/${name}.css`);
      }
    }));
    findAll(main, (n) => n.tag === 'img' && n.attrs.src).forEach((i) => add(sitePath(i.attrs.src, page, host)));
    findAll(main, (n) => n.tag === 'source' && n.attrs.srcset).forEach((s) => add(sitePath(s.attrs.srcset.split(',')[0].trim().split(/\s+/)[0], page, host)));
  }
  return out;
}

export async function csiOffline(request, env) {
  const url = new URL(request.url);
  const m = url.pathname.match(FULL);
  if (!m) return json(404, { error: 'not-found' });
  const page = m[1].replace(/\.html$/, '').replace(/\/$/, '');
  const host = publicHost(request, env);
  const get = new Request(request.url, { headers: request.headers });
  const resp = await originFetch(get, env, new URL(page, `https://${env.ORIGIN}`));
  if (resp.status !== 200 || !(resp.headers.get('content-type') || '').includes('text/html')) return json(404, { error: 'not-found' });
  const html = await resp.text();
  return json(200, { targetPage: `https://${host}${page}`, resources: offlineResources(html, page, host) });
}
