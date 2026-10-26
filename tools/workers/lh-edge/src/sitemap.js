/**
 * www's gzipped sitemap names (AMS rest A7): /sitemap/<name>.xml.gz answers the origin's
 * /sitemap/<name>.xml (the locale sitemaps of helix-sitemap.yaml, the static index
 * /sitemap/sitemap_lh.xml of the code repository) gzipped, `application/octet-stream` as www,
 * `public, max-age=14400`. The plain .xml names pass through to the origin.
 */
import { originFetch } from './edge.js';

const GZ = /^\/sitemap\/[a-z0-9_-]+\.xml\.gz$/;
export const isSitemapGzPath = (pathname) => GZ.test(pathname);

export async function sitemapGz(request, env) {
  const { pathname } = new URL(request.url);
  const xml = await originFetch(new Request(request.url, { method: 'GET', headers: request.headers }), env, new URL(pathname.replace(/\.gz$/, ''), `https://${env.ORIGIN}`));
  if (!xml.ok) return new Response('Not Found', { status: 404, headers: { 'x-lh-edge-route': 'sitemap-gz' } });
  const headers = { 'content-type': 'application/octet-stream', 'cache-control': 'public, max-age=14400', 'x-lh-edge-route': 'sitemap-gz' };
  if (request.method === 'HEAD') return new Response(null, { headers });
  return new Response(xml.body.pipeThrough(new CompressionStream('gzip')), { headers });
}
