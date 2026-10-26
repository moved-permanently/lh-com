/**
 * The app screens route: /content/mobile/<...>[.v2][.ios][.nocache].sdui, the markers in any
 * order (src/sdui.js parseSduiPath). Fetches the screen's page from the origin (edge cache as the
 * pass-through, EDGE_TTL) and the query index /content/mobile/lh/query-index.json (60 s in the
 * isolate), renders the screen (src/sdui.js). Browser caching as www: `Cache-Control:
 * max-age=600` with nocache, none without.
 */
import { originFetch, publicHost } from './edge.js';
import {
  renderScreen, indexRows, parseSduiPath, INDEX_PATH,
} from './sdui.js';

const INDEX_TTL_MS = 60000;
let indexCache = { at: 0, rows: null };
/** For tests: forget the cached index. */
export function resetIndexCache() { indexCache = { at: 0, rows: null }; }

async function loadIndex(request, env) {
  if (indexCache.rows && Date.now() - indexCache.at < INDEX_TTL_MS) return indexCache.rows;
  const target = new URL(env.SDUI_INDEX || INDEX_PATH, `https://${env.ORIGIN}`);
  let rows = [];
  try {
    const get = new Request(request.url, { headers: request.headers });
    const resp = await originFetch(get, env, target, { edgeCache: false });
    if (resp.ok) rows = indexRows(await resp.json());
  } catch (e) {
    rows = [];
  }
  indexCache = { at: Date.now(), rows };
  return rows;
}

const json = (body, status, cacheControl) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'content-type': 'application/json',
    ...(cacheControl ? { 'cache-control': cacheControl } : {}),
    'x-lh-edge-route': 'sdui',
  },
});

export const isSduiPath = (pathname) => /^\/content\/mobile\//.test(pathname) && /\.sdui$/.test(pathname);

export async function sdui(request, env) {
  const url = new URL(request.url);
  const spelling = parseSduiPath(url.pathname);
  if (!spelling) return json({ error: 'not-found' }, 404, 'no-store');
  const { path } = spelling;
  const version = spelling.v2 ? 'v2' : 'v1';
  const page = await originFetch(new Request(request.url, { headers: request.headers }), env, new URL(path, `https://${env.ORIGIN}`));
  if (page.status !== 200 || !(page.headers.get('content-type') || '').includes('text/html')) {
    return json({ error: 'not-found' }, 404, 'no-store');
  }
  const [html, index] = await Promise.all([page.text(), loadIndex(request, env)]);
  const body = renderScreen(html, {
    path, version, ios: spelling.ios, host: publicHost(request, env), index, webLinks: env.SDUI_WEB_LINKS || 'external',
  });
  return json(body, 200, spelling.nocache ? 'max-age=600' : null);
}
