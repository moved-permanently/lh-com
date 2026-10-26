/**
 * Experience fragment catalog (AMS rest A3): www's `<folder>.csi-xf.json` for other systems,
 * e.g. /content/experience-fragments/lh/markets/de.csi-xf.json. Built from the query index
 * /xf/query-index.json (documents under /xf/, tools/importer/build-xf-docs.mjs): sub-folders
 * as nested objects keyed by folder name, each folder with `experienceFragments: [{title, path,
 * name, sdui, tags: [{title, id, name}], variants: [{title, path, name, sdui, tags}]}]`; `sdui`
 * is `<fragment path>.v2.sdui`, for a variant `...?touchpoint=<variant>`. Paths stay in the
 * /content/experience-fragments/... form. A folder outside /content/experience-fragments/lh/
 * answers 400 `{}`. Headers as www: no-cache, no-store, must-revalidate; Pragma no-cache;
 * Expires 0.
 */
import { readSheet } from './sheet.js';

export const XF_ROOT = '/content/experience-fragments/lh';
export const XF_INDEX = '/xf/query-index.json';
const SUFFIX = /\.csi-xf\.json$/;

export const isXfPath = (pathname) => pathname.startsWith('/content/experience-fragments/') && SUFFIX.test(pathname);

/** "High|lufthansa-group:priority/high, Web|experience-fragments:variation/web" -> tags */
export function parseTags(text) {
  return String(text || '').split(',').map((t) => t.trim()).filter(Boolean)
    .map((t) => {
      const [title, id = ''] = t.split('|').map((x) => x.trim());
      return { title, id, name: id.split('/').pop() };
    });
}

/** The catalog of `folder` (an AEM path) from the index rows. */
export function buildCatalog(rows, folder) {
  const node = () => ({ folders: new Map(), fragments: [] });
  const tree = node();
  const nodeAt = (segments) => segments.reduce((n, s) => {
    if (!n.folders.has(s)) n.folders.set(s, node());
    return n.folders.get(s);
  }, tree);
  const fragments = new Map();
  const within = rows.filter((r) => String(r['xf-path'] || '').startsWith(`${folder}/`));
  const rel = (r) => r['xf-path'].slice(folder.length + 1).split('/');
  within.filter((r) => r['xf-kind'] === 'folder').forEach((r) => nodeAt(rel(r)));
  within.filter((r) => r['xf-kind'] === 'fragment').forEach((r) => {
    const segs = rel(r);
    const f = {
      title: r.title, path: r['xf-path'], name: segs[segs.length - 1], sdui: `${r['xf-path']}.v2.sdui`, tags: parseTags(r['xf-tags']), variants: [],
    };
    nodeAt(segs.slice(0, -1)).fragments.push(f);
    fragments.set(r['xf-path'], f);
  });
  within.filter((r) => r['xf-kind'] === 'variant').forEach((r) => {
    const parent = r['xf-path'].slice(0, r['xf-path'].lastIndexOf('/'));
    const f = fragments.get(parent);
    if (!f) return;
    const name = r['xf-path'].split('/').pop();
    f.variants.push({
      title: r.title, path: r['xf-path'], name, sdui: `${parent}.v2.sdui?touchpoint=${name}`, tags: parseTags(r['xf-tags']),
    });
  });
  const out = (n) => {
    const o = {};
    n.folders.forEach((child, name) => { o[name] = out(child); });
    o.experienceFragments = n.fragments;
    return o;
  };
  return out(tree);
}

const HEADERS = {
  'content-type': 'application/json',
  'cache-control': 'no-cache, no-store, must-revalidate',
  pragma: 'no-cache',
  expires: '0',
  'x-lh-edge-route': 'csi-xf',
};

export async function xfCatalog(request, env) {
  const folder = new URL(request.url).pathname.replace(SUFFIX, '').replace(/\/$/, '');
  if (!(folder === XF_ROOT || folder.startsWith(`${XF_ROOT}/`))) {
    return new Response('{}', { status: 400, headers: HEADERS });
  }
  const rows = await readSheet(request, env, XF_INDEX);
  return new Response(request.method === 'HEAD' ? null : JSON.stringify(buildCatalog(rows, folder)), { headers: HEADERS });
}
